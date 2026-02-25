import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/api/apiClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, MessageSquare, Send, CheckCircle, Loader2, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function PublicIntake() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: ''
  });
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Create AI conversation
    const conv = await apiClient.agents.createConversation({
      agent_name: 'intake_assistant',
      metadata: {
        name: `Intake - ${formData.full_name}`,
        description: 'Public intake conversation'
      }
    });
    
    setConversation(conv);
    setMessages(conv.messages || []);
    setStep(2);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversation) return;
    
    setIsSending(true);
    try {
      await apiClient.agents.addMessage(conversation, {
        role: 'user',
        content: inputMessage
      });
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!conversation) return;

    const unsubscribe = apiClient.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages);
    });

    return () => unsubscribe();
  }, [conversation]);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Get AI to analyze the conversation
      const analysis = await apiClient.integrations.Core.InvokeLLM({
        prompt: `Analyze this intake conversation and extract:
1. A concise summary (2-3 sentences)
2. Key facts as a list
3. A qualification score (0-100) based on how strong this case appears
4. The case type/category

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Return as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_facts: { type: "array", items: { type: "string" } },
            qualification_score: { type: "number" },
            case_type: { type: "string" }
          }
        }
      });

      // Create intake submission
      await apiClient.entities.IntakeSubmission.create({
        conversation_id: conversation.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        date_of_birth: formData.date_of_birth,
        ai_chat_summary: analysis.summary,
        key_facts: analysis.key_facts,
        qualification_score: analysis.qualification_score,
        case_type: analysis.case_type,
        status: 'pending_review',
        submitted_date: new Date().toISOString()
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Submission Received</h2>
            <p className="text-slate-600 mb-6">
              Thank you for providing your information. Our legal team will review your case and contact you within 1-2 business days.
            </p>
            <p className="text-sm text-slate-500">
              A confirmation email has been sent to {formData.email}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">CASE BUILDER</h1>
              <p className="text-xs text-slate-500">Class Action Intake</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              1
            </div>
            <div className={`w-24 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              2
            </div>
            <div className={`w-24 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              3
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-600">
            <span className="w-24 text-center">Your Info</span>
            <span className="w-24 text-center">Case Details</span>
            <span className="w-24 text-center">Submit</span>
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Please provide your contact details to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="full_name"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="pl-10"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pl-10"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="pl-10"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="pl-10"
                      placeholder="123 Main St, City, State, ZIP"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
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
                  <CardDescription>Our AI assistant will ask you some questions</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-900'
                  }`}>
                    <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            <div className="border-t p-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type your message..."
                  disabled={isSending}
                />
                <Button onClick={sendMessage} disabled={isSending || !inputMessage.trim()}>
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <Button 
                onClick={() => setStep(3)} 
                variant="outline" 
                className="w-full"
                disabled={messages.length < 4}
              >
                Continue to Submit
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>Please review your information before submitting</CardDescription>
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
                <h3 className="font-semibold text-slate-900 mb-2">Case Discussion</h3>
                <p className="text-sm text-slate-700">
                  You've had a {messages.length} message conversation with our intake assistant about your case.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back to Chat
                </Button>
                <Button 
                  onClick={handleFinalSubmit} 
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit for Review'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}