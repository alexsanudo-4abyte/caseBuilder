import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scale, Send, Loader2, User, Mail, Phone,
  MapPin, Calendar, MessageSquare, Clock, FileText, LogOut, CheckCircle2,
  Paperclip, Upload, X, File, Edit, Save,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/lib/AuthContext';
import { toast, Toaster } from 'sonner';

const STATUS_CONFIG = {
  pending_review: { label: 'Pending Review',   color: 'bg-amber-100 text-amber-700' },
  under_review:   { label: 'Under Review',      color: 'bg-blue-100 text-blue-700' },
  approved:       { label: 'Accepted',           color: 'bg-emerald-100 text-emerald-700' },
  needs_info:     { label: 'More Info Needed',   color: 'bg-purple-100 text-purple-700' },
  rejected:       { label: 'Not Qualified',      color: 'bg-red-100 text-red-700' },
};

const SYSTEM_PROMPT = (name, email, phone, address, dob) =>
  `You are a compassionate intake assistant for a mass tort law firm. Your job is to gather information about a potential claimant's case through a warm, natural conversation. Ask one question at a time and acknowledge their answers empathetically before moving to the next topic.

Claimant information already collected (do not re-ask):
- Name: ${name}
- Email: ${email}
${phone   ? `- Phone: ${phone}`           : ''}
${address ? `- Address: ${address}`       : ''}
${dob     ? `- Date of Birth: ${dob}`     : ''}

Work through the following topics in a natural, conversational order. Skip any that become obviously answered through prior responses:

1. INCIDENT DETAILS — What happened? What date, time, and location did this occur?
2. PRODUCT / PARTY INVOLVED — Which product, drug, device, company, or person was responsible?
3. INJURIES & HEALTH EFFECTS — What injuries or health effects did they experience? Are they ongoing?
4. MEDICAL TREATMENT — Did they seek medical care? What treatment have they received (ER, surgery, hospitalization, therapy, ongoing care)?
5. OTHER PARTIES — Were there any witnesses? Other people injured? A defendant or employer involved?
6. DOCUMENTATION — Do they have any documentation such as police reports, photos, medical records, receipts, or prescriptions?
7. INSURANCE — Do they have health insurance, auto insurance, or any other coverage that may be relevant?
8. BACKGROUND — Are they currently employed? Has this injury affected their ability to work or their daily life?

Tone guidelines:
- Be warm, empathetic, and non-judgmental
- Use the claimant's first name occasionally
- Acknowledge what they share before moving on
- Keep your replies concise — one empathetic sentence + one question at a time

Closing: Once you have covered the key topics (at minimum: what happened, when, injuries, and treatment), provide a warm closing summary then tell them they're all set to submit.`;

const CONTINUATION_SUFFIX = `

This claimant has already submitted their case and is returning to provide additional information or ask questions. Continue naturally from the existing conversation — do not repeat questions already answered. Welcome them back warmly.`;

// Hidden opener satisfies Anthropic's "must start with user turn" requirement
const HIDDEN_OPENER = { role: 'user', content: '[INTAKE_START]' };

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'bg-blue-600 text-white rounded-br-sm'
          : 'bg-slate-100 text-slate-900 rounded-bl-sm'
      }`}>
        <ReactMarkdown className="prose prose-sm max-w-none">{msg.content}</ReactMarkdown>
      </div>
    </div>
  );
}

export default function ClaimantPortal() {
  const { user, isLoadingAuth, logout } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState('loading'); // 'loading' | 'intake' | 'status'
  const [submissions, setSubmissions] = useState([]);

  // ── Intake form (new submission) ─────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', address: '', date_of_birth: '' });
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // ── Documents ─────────────────────────────────────────────────────────────
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('other');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ── Contact info edit ─────────────────────────────────────────────────────
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ full_name: '', phone: '', address: '', date_of_birth: '' });
  const [isSavingContact, setIsSavingContact] = useState(false);

  // ── Continuation chat (returning claimant) ────────────────────────────────
  const [continuation, setContinuation] = useState([]); // new messages added this session
  const [continuationInput, setContinuationInput] = useState('');
  const [isContinuationSending, setIsContinuationSending] = useState(false);
  const [isSavingConversation, setIsSavingConversation] = useState(false);
  const [conversationSaved, setConversationSaved] = useState(false);

  const intakeEndRef = useRef(null);
  const continuationEndRef = useRef(null);

  useEffect(() => { intakeEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { continuationEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [continuation]);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) { navigate('/Login', { replace: true }); return; }
    apiClient.auth.mySubmissions()
      .then(subs => {
        if (subs.length > 0) { setSubmissions(subs); setView('status'); }
        else setView('intake');
      })
      .catch(() => setView('intake'));
  }, [user, isLoadingAuth]);

  useEffect(() => {
    if (user) setFormData(f => ({ ...f, full_name: user.full_name || f.full_name, email: user.email || f.email }));
  }, [user]);

  useEffect(() => {
    if (submissions.length > 0) {
      const pii = submissions[0].raw_payload ?? {};
      setContactForm({
        full_name:     pii.full_name     ?? user?.full_name ?? '',
        phone:         pii.phone         ?? '',
        address:       pii.address       ?? '',
        date_of_birth: pii.date_of_birth ?? '',
      });
      apiClient.intake.getDocuments(submissions[0].id)
        .then(setDocuments)
        .catch(() => {});
    }
  }, [submissions]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const buildSystemPrompt = (extra = '') =>
    SYSTEM_PROMPT(formData.full_name, formData.email, formData.phone, formData.address, formData.date_of_birth) + extra;

  const callLLM = (visibleMessages, systemPrompt) =>
    apiClient.integrations.Core.InvokeLLM({
      system: systemPrompt,
      messages: [HIDDEN_OPENER, ...visibleMessages],
    });

  // ── New intake flow ───────────────────────────────────────────────────────

  const validateForm = () => {
    const errs = {};
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-().]{7,20}$/.test(formData.phone)) errs.phone = 'Enter a valid phone number';
    if (!formData.address.trim()) errs.address = 'Address is required';
    if (!formData.date_of_birth) errs.date_of_birth = 'Date of birth is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSending(true);
    try {
      const greeting = await callLLM([], buildSystemPrompt());
      setMessages([{ role: 'assistant', content: greeting }]);
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
      const reply = await callLLM(updated, buildSystemPrompt());
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
      await apiClient.intake.submit({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        intake_channel: 'web_form',
        consent_given: true,
        consent_version: '1.0',
        conversation: messages,
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

  // ── Continuation chat (status view) ──────────────────────────────────────

  const latest = submissions[0];
  const existingConversation = latest?.raw_payload?.conversation ?? [];

  const sendContinuationMessage = async () => {
    if (!continuationInput.trim()) return;
    const userMsg = { role: 'user', content: continuationInput };
    const updatedContinuation = [...continuation, userMsg];
    setContinuation(updatedContinuation);
    setContinuationInput('');
    setIsContinuationSending(true);

    try {
      // Full context = existing transcript + new messages this session
      const fullContext = [...existingConversation, ...updatedContinuation];
      const systemPrompt = buildSystemPromptForContinuation();
      const reply = await callLLM(fullContext, systemPrompt);
      const withReply = [...updatedContinuation, { role: 'assistant', content: reply }];
      setContinuation(withReply);

      // Auto-save the updated full conversation back to the submission
      await saveConversation([...existingConversation, ...withReply]);
    } catch (err) {
      console.error('Error in continuation chat:', err);
      toast.error('Failed to send message — please try again');
    } finally {
      setIsContinuationSending(false);
    }
  };

  const buildSystemPromptForContinuation = () => {
    const pii = latest?.raw_payload ?? {};
    return SYSTEM_PROMPT(
      pii.full_name ?? user?.full_name ?? '',
      pii.email    ?? user?.email    ?? '',
      pii.phone    ?? '',
      pii.address  ?? '',
      pii.date_of_birth ?? '',
    ) + CONTINUATION_SUFFIX;
  };

  const handleUpload = async () => {
    if (!selectedFile || !latest?.id) return;
    setIsUploading(true);
    try {
      const doc = await apiClient.intake.uploadDocument(latest.id, selectedFile, documentType);
      setDocuments(prev => [...prev, doc]);
      setSelectedFile(null);
      setDocumentType('other');
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Document uploaded successfully');
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Upload failed — please try again');
    } finally {
      setIsUploading(false);
    }
  };

  const saveConversation = async (fullConversation) => {
    if (!latest?.id) return;
    setIsSavingConversation(true);
    try {
      await apiClient.intake.updateConversation(latest.id, fullConversation);
      setConversationSaved(true);
      setTimeout(() => setConversationSaved(false), 3000);
      // Refresh submissions so the transcript reflects the saved state,
      // then clear continuation — those messages are now part of existingConversation
      const subs = await apiClient.auth.mySubmissions();
      setSubmissions(subs);
      setContinuation([]);
    } catch (err) {
      console.error('Error saving conversation:', err);
      toast.error('Could not save your message — please try again');
    } finally {
      setIsSavingConversation(false);
    }
  };

  const handleSaveContact = async () => {
    setIsSavingContact(true);
    try {
      await apiClient.auth.updateClaimantProfile(contactForm);
      setIsEditingContact(false);
      toast.success('Contact information updated');
    } catch (err) {
      toast.error('Could not save — please try again');
    } finally {
      setIsSavingContact(false);
    }
  };

  const statusCfg = latest
    ? (STATUS_CONFIG[latest.status] ?? { label: latest.status, color: 'bg-slate-100 text-slate-700' })
    : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toaster position="top-right" />
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
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Loading */}
        {view === 'loading' && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}

        {/* ── Status view ─────────────────────────────────────────────────── */}
        {view === 'status' && latest && (
          <>
            {/* Status card */}
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

                {latest.ai_chat_summary && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-slate-500 mb-1">Summary</p>
                    <p className="text-sm text-slate-700">{latest.ai_chat_summary}</p>
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

            {/* Contact Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-base">Contact Information</CardTitle>
                  </div>
                  {!isEditingContact ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingContact(true)}>
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingContact(false)} disabled={isSavingContact}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveContact} disabled={isSavingContact} className="bg-blue-600 hover:bg-blue-700">
                        {isSavingContact ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" />Save</>}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {!isEditingContact ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Full Name</p>
                        <p className="font-medium text-slate-800">{contactForm.full_name || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Email</p>
                        <p className="font-medium text-slate-800">{user?.email || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Phone</p>
                        <p className="font-medium text-slate-800">{contactForm.phone || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Date of Birth</p>
                        <p className="font-medium text-slate-800">{contactForm.date_of_birth || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Address</p>
                        <p className="font-medium text-slate-800">{contactForm.address || '—'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-slate-600 mb-1 block">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            value={contactForm.full_name}
                            onChange={e => setContactForm(f => ({ ...f, full_name: e.target.value }))}
                            className="pl-9"
                            placeholder="Full name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600 mb-1 block">Email (cannot be changed)</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input value={user?.email || ''} disabled className="pl-9 bg-slate-50 text-slate-400" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600 mb-1 block">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            value={contactForm.phone}
                            onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                            className="pl-9"
                            placeholder="(555) 123-4567"
                            type="tel"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600 mb-1 block">Date of Birth</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            value={contactForm.date_of_birth}
                            onChange={e => setContactForm(f => ({ ...f, date_of_birth: e.target.value }))}
                            className="pl-9"
                            type="date"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600 mb-1 block">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Textarea
                          value={contactForm.address}
                          onChange={e => setContactForm(f => ({ ...f, address: e.target.value }))}
                          className="pl-9"
                          placeholder="123 Main St, City, State, ZIP"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-base">Supporting Documents</CardTitle>
                </div>
                <CardDescription>
                  Upload any relevant documents — police reports, medical records, photos, bills, etc.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Existing documents */}
                {documents.length > 0 && (
                  <ul className="space-y-2">
                    {documents.map(doc => (
                      <li key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                        <File className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="flex-1 truncate text-slate-800">{doc.title}</span>
                        <span className="text-xs text-slate-400 capitalize shrink-0">
                          {doc.document_type?.replace('_', ' ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Upload form */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div
                      className="flex-1 border-2 border-dashed border-slate-200 rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500 truncate">
                        {selectedFile ? selectedFile.name : 'Click to select a file (max 10 MB)'}
                      </span>
                      {selectedFile && (
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="ml-auto text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.heic"
                      onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={documentType}
                      onChange={e => setDocumentType(e.target.value)}
                      className="flex-1 text-sm border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="medical_record">Medical Record</option>
                      <option value="evidence">Photo / Evidence</option>
                      <option value="legal_filing">Police / Legal Report</option>
                      <option value="correspondence">Correspondence</option>
                      <option value="intake_form">Intake Form</option>
                      <option value="other">Other</option>
                    </select>
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile || isUploading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversation transcript + continuation */}
            <Card className="border-0 shadow-sm flex flex-col" style={{ minHeight: '500px' }}>
              <CardHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-base">Your Conversation</CardTitle>
                </div>
                <CardDescription>
                  Your intake discussion with our assistant. Feel free to add more information below.
                </CardDescription>
              </CardHeader>

              {/* Existing transcript */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
                {existingConversation.length === 0 ? (
                  <p className="text-sm text-slate-400 italic text-center py-8">No conversation recorded yet.</p>
                ) : (
                  existingConversation.map((msg, idx) => <ChatBubble key={idx} msg={msg} />)
                )}

                {/* Continuation messages added this session */}
                {continuation.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 py-2">
                      <div className="flex-1 border-t border-dashed border-slate-200" />
                      <span className="text-xs text-slate-400">New messages</span>
                      <div className="flex-1 border-t border-dashed border-slate-200" />
                    </div>
                    {continuation.map((msg, idx) => <ChatBubble key={`c-${idx}`} msg={msg} />)}
                  </>
                )}

                {isContinuationSending && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-2xl px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                  </div>
                )}

                <div ref={continuationEndRef} />
              </CardContent>

              {/* Continuation input */}
              <div className="border-t p-4 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={continuationInput}
                    onChange={e => setContinuationInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendContinuationMessage()}
                    placeholder="Add more information or ask a question…"
                    disabled={isContinuationSending}
                  />
                  <Button
                    onClick={sendContinuationMessage}
                    disabled={isContinuationSending || !continuationInput.trim()}
                  >
                    {isContinuationSending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Providing more detail helps our legal team evaluate your case faster.
                  </p>
                  {(isSavingConversation || conversationSaved) && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      {isSavingConversation
                        ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>
                        : <><CheckCircle2 className="w-3 h-3 text-green-500" /> Saved</>
                      }
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* Previous submissions */}
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
          </>
        )}

        {/* ── New intake flow ──────────────────────────────────────────────── */}
        {view === 'intake' && (
          <>
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
                <span>Your Info</span><span>Case Details</span><span>Submit</span>
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
                    {[
                      { id: 'full_name', label: 'Full Name *', icon: User, type: 'text', required: true, placeholder: 'John Doe' },
                      { id: 'email',     label: 'Email *',     icon: Mail, type: 'email', required: true, placeholder: 'john@example.com' },
                      { id: 'phone',     label: 'Phone *',     icon: Phone, type: 'tel', placeholder: '(555) 123-4567' },
                      { id: 'date_of_birth', label: 'Date of Birth *', icon: Calendar, type: 'date' },
                    ].map(({ id, label, icon: Icon, type, required, placeholder }) => (
                      <div key={id}>
                        <Label>{label}</Label>
                        <div className="relative">
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id={id} type={type} required={required}
                            value={formData[id]}
                            placeholder={placeholder}
                            onChange={e => { setFormData(f => ({ ...f, [id]: e.target.value })); setFormErrors(p => ({ ...p, [id]: undefined })); }}
                            className={`pl-10 ${formErrors[id] ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {formErrors[id] && <p className="text-xs text-red-500 mt-1">{formErrors[id]}</p>}
                      </div>
                    ))}
                    <div>
                      <Label>Address *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Textarea
                          value={formData.address}
                          onChange={e => { setFormData(f => ({ ...f, address: e.target.value })); setFormErrors(p => ({ ...p, address: undefined })); }}
                          className={`pl-10 ${formErrors.address ? 'border-red-500' : ''}`}
                          placeholder="123 Main St, City, State, ZIP"
                        />
                      </div>
                      {formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSending}>
                      {isSending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
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
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, idx) => <ChatBubble key={idx} msg={msg} />)}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-2xl px-4 py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      </div>
                    </div>
                  )}
                  <div ref={intakeEndRef} />
                </CardContent>
                <div className="border-t p-4 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Type your message…"
                      disabled={isSending}
                    />
                    <Button onClick={sendMessage} disabled={isSending || !inputMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button onClick={() => setStep(3)} variant="outline" className="w-full" disabled={messages.length < 2}>
                    Continue to Submit
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    You can submit at any time — the more detail you share, the easier it is for our legal team to evaluate your case.
                  </p>
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
                  <div className="bg-slate-50 rounded-lg p-4 space-y-1 text-sm">
                    <h3 className="font-semibold text-slate-900 mb-2">Your Information</h3>
                    <p><strong>Name:</strong> {formData.full_name}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    {formData.phone && <p><strong>Phone:</strong> {formData.phone}</p>}
                    {formData.address && <p><strong>Address:</strong> {formData.address}</p>}
                    {formData.date_of_birth && <p><strong>Date of Birth:</strong> {formData.date_of_birth}</p>}
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-1">Case Discussion</h3>
                    <p className="text-sm text-slate-700">
                      You've completed a {messages.length}-message conversation with our intake assistant.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back to Chat</Button>
                    <Button onClick={handleFinalSubmit} disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</> : 'Submit Claim'}
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
