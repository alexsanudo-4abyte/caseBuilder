import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/api/apiClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  const getSystemPrompt = () =>
    `You are a compassionate intake assistant for a mass tort law firm. Your job is to gather information about a potential claimant's case through a warm, natural conversation. Ask one question at a time and acknowledge their answers empathetically before moving to the next topic.

Claimant information already collected (do not re-ask):
- Name: ${formData.full_name}
- Email: ${formData.email}
${formData.phone ? `- Phone: ${formData.phone}` : ''}
${formData.address ? `- Address: ${formData.address}` : ''}
${formData.date_of_birth ? `- Date of Birth: ${formData.date_of_birth}` : ''}

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
- Acknowledge what they share before moving on ("That sounds like it was very difficult...")
- Keep your replies concise — one empathetic sentence + one question at a time

Closing: Once you have covered the key topics (at minimum: what happened, when, injuries, and treatment), provide a warm closing summary like the example below, then tell them they're all set to submit:

Example closing:
"Thank you for sharing all of that, [Name]. It sounds like you've been through quite an ordeal. Here's a summary of what you've shared:
• What happened: [brief description]
• When: [date/timeframe]
• Injuries: [list]
• Treatment: [list]
• [any other key points]

You're all set to submit your information for our legal team to review! Someone will be in touch at the contact details you've provided to discuss next steps. Thank you so much for reaching out — we're here to help, and we wish you a smooth recovery!"

IMPORTANT: Do not rush the closing. Make sure you have gathered enough detail across the key topics before summarising. If a claimant gives a very short answer, gently follow up to get more detail.`;

  // Hidden opener keeps the Anthropic API happy (must start with a user turn)
  // but is never rendered or stored in the submitted conversation.
  const HIDDEN_OPENER = { role: 'user', content: '[INTAKE_START]' };

  const callLLM = (visibleMessages) =>
    apiClient.integrations.Core.InvokeLLM({
      system: getSystemPrompt(),
      messages: [HIDDEN_OPENER, ...visibleMessages],
    });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const greeting = await callLLM([]);
      setMessages([{ role: 'assistant', content: greeting }]);
      setStep(2);
    } catch (error) {
      console.error('Error starting conversation:', error);
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
      const reply = await callLLM(updated);
      setMessages([...updated, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
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
              <div className="space-y-2">
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="w-full"
                  disabled={messages.length < 2}
                >
                  Continue to Submit
                </Button>
                <p className="text-xs text-slate-500 text-center leading-relaxed">
                  You can submit at any time — the more detail you share, the easier it is for our legal team to evaluate your case and get back to you quickly.
                </p>
              </div>
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