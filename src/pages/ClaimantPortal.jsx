import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/api/apiClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scale, Send, CheckCircle, Loader2, User, Mail, Phone,
  MapPin, Calendar, MessageSquare, Clock, FileText, LogOut
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/lib/AuthContext';

const STATUS_CONFIG = {
  pending_review: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700' },
  under_review:   { label: 'Under Review',   color: 'bg-blue-100 text-blue-700' },
  accepted:       { label: 'Accepted',        color: 'bg-emerald-100 text-emerald-700' },
  rejected:       { label: 'Not Qualified',   color: 'bg-red-100 text-red-700' },
  more_info:      { label: 'More Info Needed', color: 'bg-purple-100 text-purple-700' },
};

export default function ClaimantPortal() {
  const { user, logout } = useAuth();
  const [view, setView] = useState('loading'); // 'loading' | 'intake' | 'status'
  const [submissions, setSubmissions] = useState([]);

  // Intake form state
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    date_of_birth: '',
  });
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const checkSubmissions = async () => {
      try {
        const subs = await apiClient.auth.mySubmissions();
        if (subs.length > 0) {
          setSubmissions(subs);
          setView('status');
        } else {
          setView('intake');
        }
      } catch {
        setView('intake');
      }
    };
    checkSubmissions();
  }, []);

  // Pre-fill name/email from user account
  useEffect(() => {
    if (user) {
      setFormData(f => ({
        ...f,
        full_name: user.full_name || f.full_name,
        email: user.email || f.email,
      }));
    }
  }, [user]);

  const buildChatPrompt = (history, userMessage) => {
    const historyText = history.map(m => `${m.role === 'user' ? 'Claimant' : 'Assistant'}: ${m.content}`).join('\n');
    return `You are a compassionate intake assistant for a mass tort law firm. Gather information about a potential claimant's case through friendly conversation. Be concise and ask one question at a time.

Claimant information already collected:
- Name: ${formData.full_name}
- Email: ${formData.email}
${formData.phone ? `- Phone: ${formData.phone}` : ''}
${formData.address ? `- Address: ${formData.address}` : ''}
${formData.date_of_birth ? `- Date of Birth: ${formData.date_of_birth}` : ''}

Topics to cover (in order): what happened, when it occurred, which product/drug/event was involved, injuries or health effects, medical treatment received.

${historyText ? `Conversation so far:\n${historyText}\n` : ''}Claimant: ${userMessage}

Respond as the Assistant. Once all topics are covered, close warmly and let them know they can submit.`;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const greeting = await apiClient.integrations.Core.InvokeLLM({
        prompt: buildChatPrompt([], `Hi, I'm ${formData.full_name} and I'd like to find out if I have a case.`),
      });
      setMessages([
        { role: 'user', content: `Hi, I'm ${formData.full_name} and I'd like to find out if I have a case.` },
        { role: 'assistant', content: greeting },
      ]);
      setStep(2);
    } catch (err) {
      console.error('Error starting chat:', err);
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMsg = { role: 'user', content: inputMessage };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputMessage('');
    setIsSending(true);
    try {
      const reply = await apiClient.integrations.Core.InvokeLLM({
        prompt: buildChatPrompt(messages, inputMessage),
      });
      setMessages([...updated, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const analysis = await apiClient.integrations.Core.InvokeLLM({
        prompt: `Analyze this intake conversation and extract a summary, key facts, a qualification score (0-100), and the case type/category.

Conversation:
${messages.map(m => `${m.role === 'user' ? 'Claimant' : 'Assistant'}: ${m.content}`).join('\n')}`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            key_facts: { type: 'array', items: { type: 'string' } },
            qualification_score: { type: 'number' },
            case_type: { type: 'string' },
          },
        },
      });

      await apiClient.intake.submit({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        intake_channel: 'web_form',
        consent_given: true,
        consent_version: '1.0',
        raw_payload: {
          ai_chat_summary: analysis.summary,
          key_facts: analysis.key_facts,
          qualification_score: analysis.qualification_score,
          case_type: analysis.case_type,
          conversation: messages,
        },
      });

      const subs = await apiClient.auth.mySubmissions();
      setSubmissions(subs);
      setView('status');
    } catch (err) {
      console.error('Error submitting:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const latest = submissions[0];
  const statusCfg = latest ? (STATUS_CONFIG[latest.status] ?? { label: latest.status, color: 'bg-slate-100 text-slate-700' }) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Case Builder</h1>
              <p className="text-xs text-slate-500">Claimant Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && <span className="text-sm text-slate-600 hidden sm:block">{user.full_name}</span>}
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Loading */}
        {view === 'loading' && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}

        {/* Status view */}
        {view === 'status' && latest && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Your Submission</h2>
              <p className="text-slate-500 mt-1">Here's the current status of your claim.</p>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Claim #{latest.id?.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-slate-500">
                        Submitted {latest.submitted_date ? new Date(latest.submitted_date).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                </div>

                {latest.raw_payload?.case_type && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-slate-500">Case Type</p>
                    <p className="font-medium text-slate-900 capitalize">{latest.raw_payload.case_type}</p>
                  </div>
                )}

                {latest.raw_payload?.ai_chat_summary && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-slate-500 mb-1">Summary</p>
                    <p className="text-sm text-slate-700">{latest.raw_payload.ai_chat_summary}</p>
                  </div>
                )}

                {latest.admin_notes && (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm font-medium text-blue-900 mb-1">Note from our team</p>
                    <p className="text-sm text-blue-800">{latest.admin_notes}</p>
                  </div>
                )}

                <div className="pt-2 border-t flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  Our team typically responds within 1–2 business days.
                </div>
              </CardContent>
            </Card>

            {submissions.length > 1 && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Previous Submissions</h3>
                <div className="space-y-2">
                  {submissions.slice(1).map(s => {
                    const cfg = STATUS_CONFIG[s.status] ?? { label: s.status, color: 'bg-slate-100 text-slate-700' };
                    return (
                      <div key={s.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                        <p className="text-sm text-slate-700">#{s.id?.slice(0, 8).toUpperCase()}</p>
                        <Badge className={cfg.color}>{cfg.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Intake form */}
        {view === 'intake' && (
          <>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((s, i) => (
                  <React.Fragment key={s}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</div>
                    {i < 2 && <div className={`w-24 h-1 ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500 max-w-xs mx-auto">
                <span>Your Info</span>
                <span>Case Details</span>
                <span>Submit</span>
              </div>
            </div>

            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Information</CardTitle>
                  <CardDescription>Please confirm your contact details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <Label>Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="pl-10" placeholder="John Doe" />
                      </div>
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="pl-10" placeholder="john@example.com" />
                      </div>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="pl-10" placeholder="(555) 123-4567" />
                      </div>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="pl-10" placeholder="123 Main St, City, State, ZIP" />
                      </div>
                    </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input type="date" value={formData.date_of_birth} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} className="pl-10" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSending}>
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Continue to Case Details
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle>Tell Us About Your Case</CardTitle>
                      <CardDescription>Our assistant will ask you a few questions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                        <ReactMarkdown className="text-sm prose prose-sm max-w-none">{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-lg px-4 py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>
                <div className="border-t p-4 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Type your message..."
                      disabled={isSending}
                    />
                    <Button onClick={sendMessage} disabled={isSending || !inputMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button onClick={() => setStep(3)} variant="outline" className="w-full" disabled={messages.length < 4}>
                    Continue to Submit
                  </Button>
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Submit</CardTitle>
                  <CardDescription>Review your information before submitting your claim</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold text-slate-900">Your Information</h3>
                    <div className="text-sm text-slate-700 space-y-1">
                      <p><strong>Name:</strong> {formData.full_name}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      {formData.phone && <p><strong>Phone:</strong> {formData.phone}</p>}
                      {formData.address && <p><strong>Address:</strong> {formData.address}</p>}
                      {formData.date_of_birth && <p><strong>Date of Birth:</strong> {formData.date_of_birth}</p>}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-1">Case Discussion</h3>
                    <p className="text-sm text-slate-700">You've completed a {messages.length}-message conversation with our intake assistant.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back to Chat</Button>
                    <Button onClick={handleFinalSubmit} disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit Claim'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
