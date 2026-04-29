import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  FileText,
  Brain,
  Shield,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Activity,
  MessageSquare,
  Loader2,
  Edit,
  Save,
  Sparkles,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import FraudScoreGauge from '../components/dashboard/FraudScoreGauge';
import { format } from 'date-fns';

const statusConfig = {
  intake:        { label: 'Intake',        color: 'bg-slate-100 text-slate-700' },
  qualification: { label: 'Qualification', color: 'bg-blue-100 text-blue-700' },
  signed:        { label: 'Signed',        color: 'bg-indigo-100 text-indigo-700' },
  active:        { label: 'Active',        color: 'bg-emerald-100 text-emerald-700' },
  discovery:     { label: 'Discovery',     color: 'bg-purple-100 text-purple-700' },
  trial_prep:    { label: 'Trial Prep',    color: 'bg-amber-100 text-amber-700' },
  settlement:    { label: 'Settlement',    color: 'bg-green-100 text-green-700' },
  closed:        { label: 'Closed',        color: 'bg-slate-100 text-slate-700' },
  dismissed:     { label: 'Dismissed',     color: 'bg-red-100 text-red-700' },
  rejected:      { label: 'Rejected',      color: 'bg-red-100 text-red-700' },
};

function ConversationThread({ messages = [] }) {
  if (!messages.length) return <p className="text-sm text-slate-500 italic">No conversation recorded.</p>;
  return (
    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
      {messages.map((msg, idx) => (
        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
            msg.role === 'user'
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-slate-100 text-slate-900 rounded-bl-sm'
          }`}>
            {msg.content}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CaseDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const caseId = urlParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  // ── Primary case query ──────────────────────────────────────────────────────
  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => apiClient.entities.Case.filter({ id: caseId }),
    enabled: !!caseId,
  });

  const currentCase = caseData?.[0];

  // ── Intake submission (PII + AI analysis — primary) ─────────────────────────
  const { data: intakeSubmission } = useQuery({
    queryKey: ['intake-submission', currentCase?.intake_submission_id],
    queryFn: () => apiClient.entities.IntakeSubmission.get(currentCase.intake_submission_id),
    enabled: !!currentCase?.intake_submission_id,
  });

  // ── All intakes linked to this case ──────────────────────────────────────────
  const { data: linkedIntakes = [] } = useQuery({
    queryKey: ['linked-intakes', caseId],
    queryFn: () => apiClient.entities.IntakeSubmission.filter({ case_id: caseId }),
    enabled: !!caseId,
  });

  // ── Documents: by case_id AND by intake_submission_id (pre-promotion uploads)
  const { data: caseDocuments = [] } = useQuery({
    queryKey: ['documents-case', caseId],
    queryFn: () => apiClient.entities.Document.filter({ case_id: caseId }),
    enabled: !!caseId,
  });

  const { data: intakeDocs = [] } = useQuery({
    queryKey: ['documents-intake', currentCase?.intake_submission_id],
    queryFn: () => apiClient.entities.Document.filter({ intake_submission_id: currentCase.intake_submission_id }),
    enabled: !!currentCase?.intake_submission_id,
  });

  const documents = useMemo(() => {
    const ids = new Set(caseDocuments.map(d => d.id));
    return [...caseDocuments, ...intakeDocs.filter(d => !ids.has(d.id))];
  }, [caseDocuments, intakeDocs]);

  // ── Other related data ──────────────────────────────────────────────────────
  const { data: medicalRecords = [] } = useQuery({
    queryKey: ['medicalRecords', caseId],
    queryFn: () => apiClient.entities.MedicalRecord.filter({ case_id: caseId }),
    enabled: !!caseId,
  });

  const { data: fraudAlerts = [] } = useQuery({
    queryKey: ['fraudAlerts', caseId],
    queryFn: () => apiClient.entities.FraudAlert.filter({ case_id: caseId }),
    enabled: !!caseId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', caseId],
    queryFn: () => apiClient.entities.Task.filter({ case_id: caseId }),
    enabled: !!caseId,
  });

  // ── Staff users for assignment dropdown ────────────────────────────────────
  const { data: staffUsers = [] } = useQuery({
    queryKey: ['staff-users'],
    queryFn: () => apiClient.staffUsers.list(),
  });

  const updateCaseMutation = useMutation({
    mutationFn: (data) => apiClient.entities.Case.update(caseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
      setIsEditing(false);
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: () => apiClient.caseAnalysis.analyze(caseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['case', caseId] }),
  });

  useEffect(() => {
    if (currentCase) setEditedNotes(currentCase.notes || '');
  }, [currentCase]);

  // ── Derived PII from intake payload ────────────────────────────────────────
  const pii = intakeSubmission?.raw_payload ?? {};
  const claimantName    = pii.full_name  ?? currentCase?.claimant_name  ?? '—';
  const claimantEmail   = pii.email      ?? currentCase?.claimant_email  ?? null;
  const claimantPhone   = pii.phone      ?? currentCase?.claimant_phone  ?? null;
  const claimantAddress = pii.address    ?? currentCase?.claimant_address ?? null;
  const intakeConversation = pii.conversation ?? [];

  const aiSummary = currentCase?.ai_case_summary ?? intakeSubmission?.ai_chat_summary;
  const keyFacts  = intakeSubmission?.key_facts ?? [];
  const qualScore = intakeSubmission?.qualification_score;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!currentCase) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Case not found</p>
        <Link to={createPageUrl('Cases')}>
          <Button className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cases
          </Button>
        </Link>
      </div>
    );
  }

  const status = statusConfig[currentCase.status] || statusConfig.intake;

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Cases')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                {claimantName}
              </h1>
              <Badge className={status.color}>{status.label}</Badge>
            </div>
            <p className="text-slate-500 mt-1">
              {currentCase.case_number || `Case #${caseId?.slice(0, 8)}`} • {currentCase.tort_campaign || currentCase.case_type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={currentCase.status}
            onValueChange={(v) => updateCaseMutation.mutate({ status: v })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* AI Summary */}
          {aiSummary && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Case Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{aiSummary}</p>
                {keyFacts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {keyFacts.map((fact, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{fact}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="details">
            <TabsList className="bg-white border">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="intakes">Intakes ({linkedIntakes.length})</TabsTrigger>
              <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
              {intakeConversation.length > 0 && (
                <TabsTrigger value="intake">Intake Chat</TabsTrigger>
              )}
              <TabsTrigger value="medical">Medical ({medicalRecords.length})</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  {/* Contact Info */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {claimantEmail && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Mail className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Email</p>
                            <p className="font-medium">{claimantEmail}</p>
                          </div>
                        </div>
                      )}
                      {claimantPhone && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <Phone className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Phone</p>
                            <p className="font-medium">{claimantPhone}</p>
                          </div>
                        </div>
                      )}
                      {claimantAddress && (
                        <div className="flex items-center gap-3 col-span-2">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <MapPin className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Address</p>
                            <p className="font-medium">{claimantAddress}</p>
                          </div>
                        </div>
                      )}
                      {!claimantEmail && !claimantPhone && !claimantAddress && (
                        <p className="text-sm text-slate-400 col-span-2">No contact details on record.</p>
                      )}
                    </div>
                  </div>

                  {/* Case Details */}
                  <div className="mb-6 pt-6 border-t">
                    <h3 className="font-semibold text-slate-900 mb-4">Case Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Case Type</p>
                        <p className="font-medium capitalize">{currentCase.case_type?.replace(/_/g, ' ') || intakeSubmission?.case_type || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Tort Campaign</p>
                        <p className="font-medium">{currentCase.tort_campaign || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Intake Date</p>
                        <p className="font-medium">
                          {currentCase.intake_date ? format(new Date(currentCase.intake_date), 'MMM d, yyyy') : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Injury Date</p>
                        <p className="font-medium">
                          {currentCase.injury_date ? format(new Date(currentCase.injury_date), 'MMM d, yyyy') : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Assigned To</p>
                        <Select
                          value={currentCase.assigned_user_id ?? 'unassigned'}
                          onValueChange={(v) => {
                            const staff = staffUsers.find(u => u.id === v);
                            updateCaseMutation.mutate({
                              assigned_user_id: v === 'unassigned' ? null : v,
                              assigned_attorney: staff?.full_name ?? null,
                            });
                          }}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">— Unassigned —</SelectItem>
                            {staffUsers.map((u) => (
                              <SelectItem key={u.id} value={u.id}>{u.full_name} ({u.role})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Lead Source</p>
                        <p className="font-medium capitalize">{currentCase.intake_source || '—'}</p>
                      </div>
                      {qualScore != null && (
                        <div>
                          <p className="text-xs text-slate-500">AI Qualification Score</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  qualScore >= 70 ? 'bg-green-500' :
                                  qualScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${qualScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{qualScore}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Injury Description */}
                  {currentCase.injury_description && (
                    <div className="mb-6 pt-6 border-t">
                      <h3 className="font-semibold text-slate-900 mb-2">Injury Description</h3>
                      <p className="text-slate-600">{currentCase.injury_description}</p>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">Notes</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (isEditing) {
                            updateCaseMutation.mutate({ notes: editedNotes });
                          } else {
                            setIsEditing(true);
                          }
                        }}
                      >
                        {isEditing ? (
                          <><Save className="w-4 h-4 mr-1" />Save</>
                        ) : (
                          <><Edit className="w-4 h-4 mr-1" />Edit</>
                        )}
                      </Button>
                    </div>
                    {isEditing ? (
                      <Textarea
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        rows={4}
                      />
                    ) : (
                      <p className="text-slate-600">{currentCase.notes || 'No notes added'}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-slate-900">{doc.title}</p>
                              <p className="text-xs text-slate-500">{doc.document_type}</p>
                            </div>
                          </div>
                          {doc.file_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`http://localhost:3001${doc.file_url}`} target="_blank" rel="noopener noreferrer">View</a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500">No documents uploaded</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Intake Conversation Tab */}
            {intakeConversation.length > 0 && (
              <TabsContent value="intake" className="mt-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      Intake Conversation
                      <span className="text-xs font-normal text-slate-400">({intakeConversation.length} messages)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ConversationThread messages={intakeConversation} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Intakes Tab */}
            <TabsContent value="intakes" className="mt-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  {linkedIntakes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500">No intake submissions linked to this case</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {linkedIntakes.map((sub) => {
                        const pii = sub.raw_payload ?? {};
                        const isPrimary = sub.id === currentCase.intake_submission_id;
                        const scoreColor =
                          sub.qualification_score >= 70 ? 'text-emerald-600' :
                          sub.qualification_score >= 40 ? 'text-amber-600' : 'text-red-600';
                        return (
                          <div
                            key={sub.id}
                            className="border border-slate-200 rounded-lg p-4 space-y-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                            onClick={() => navigate(createPageUrl('IntakeReview') + `?id=${sub.id}`)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium text-slate-900">{pii.full_name || '—'}</p>
                                  {isPrimary && (
                                    <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Primary</Badge>
                                  )}
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      sub.status === 'approved'       ? 'border-green-300 text-green-700' :
                                      sub.status === 'rejected'       ? 'border-red-300 text-red-700' :
                                      sub.status === 'needs_info'     ? 'border-blue-300 text-blue-700' :
                                      'border-yellow-300 text-yellow-700'
                                    }`}
                                  >
                                    {sub.status?.replace(/_/g, ' ') ?? 'pending review'}
                                  </Badge>
                                  {sub.case_type && (
                                    <Badge variant="outline" className="text-xs">{sub.case_type}</Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-500">
                                  {pii.email && <span>{pii.email}</span>}
                                  {pii.phone && <span>{pii.phone}</span>}
                                  {sub.submitted_date && (
                                    <span>Submitted {format(new Date(sub.submitted_date), 'MMM d, yyyy')}</span>
                                  )}
                                  {sub.intake_channel && <span className="capitalize">{sub.intake_channel.replace(/_/g, ' ')}</span>}
                                </div>
                              </div>
                              {sub.qualification_score != null && (
                                <div className="text-right shrink-0">
                                  <p className="text-xs text-slate-500">AI Score</p>
                                  <p className={`text-lg font-bold ${scoreColor}`}>{sub.qualification_score}%</p>
                                </div>
                              )}
                            </div>
                            {sub.ai_chat_summary && (
                              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 border-t pt-3">
                                {sub.ai_chat_summary}
                              </p>
                            )}
                            {sub.key_facts?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {sub.key_facts.map((f, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                                ))}
                              </div>
                            )}
                            {sub.admin_notes && (
                              <p className="text-xs text-slate-500 italic border-t pt-2">
                                Notes: {sub.admin_notes}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medical Tab */}
            <TabsContent value="medical" className="mt-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  {medicalRecords.length > 0 ? (
                    <div className="space-y-3">
                      {medicalRecords.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-emerald-600" />
                            <div>
                              <p className="font-medium text-slate-900">{record.provider_name}</p>
                              <p className="text-xs text-slate-500">{record.provider_type}</p>
                            </div>
                          </div>
                          <Badge>{record.request_status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500">No medical records requested</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="mt-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  {tasks.length > 0 ? (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              task.status === 'completed' ? 'bg-emerald-500' :
                              task.priority === 'critical' ? 'bg-red-500' : 'bg-blue-500'
                            }`} />
                            <div>
                              <p className="font-medium text-slate-900">{task.title}</p>
                              <p className="text-xs text-slate-500">{task.task_type}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{task.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500">No tasks assigned</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Scores & Alerts */}
        <div className="space-y-6">
          {/* AI Scores */}
          <TooltipProvider>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI Assessment
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => analyzeMutation.mutate()}
                  disabled={analyzeMutation.isPending}
                  className="text-slate-500 hover:text-slate-800"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${analyzeMutation.isPending ? 'animate-spin' : ''}`} />
                  {analyzeMutation.isPending ? 'Analyzing…' : 'Re-analyze'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentCase.case_strength_score == null && !analyzeMutation.isPending ? (
                <div className="text-center py-4 space-y-3">
                  <p className="text-sm text-slate-500">No AI assessment yet.</p>
                  <Button size="sm" onClick={() => analyzeMutation.mutate()}>
                    <Brain className="w-4 h-4 mr-1.5" />
                    Run AI Analysis
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <p className="text-2xl font-bold text-slate-900">
                            {currentCase.case_strength_score ?? '—'}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center justify-center gap-0.5">
                            Strength <HelpCircle className="w-3 h-3 text-slate-400" />
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-56 text-center">
                        Overall litigation strength (0–100). Considers injury specificity, exposure evidence, medical documentation, and provable damages.
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <p className="text-2xl font-bold text-slate-900">
                            {currentCase.credibility_score ?? '—'}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center justify-center gap-0.5">
                            Credibility <HelpCircle className="w-3 h-3 text-slate-400" />
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-56 text-center">
                        How consistent and believable the claimant's account is (0–100). Based on specificity, corroboration, and internal consistency of the intake conversation.
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <p className="text-2xl font-bold text-slate-900">
                            {currentCase.settlement_probability != null
                              ? `${currentCase.settlement_probability}%`
                              : '—'}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center justify-center gap-0.5">
                            Settlement <HelpCircle className="w-3 h-3 text-slate-400" />
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-56 text-center">
                        Estimated probability of settlement vs. dismissal. Accounts for campaign MDL status, qualifying criteria match, and damages magnitude.
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center cursor-help">
                        <FraudScoreGauge score={currentCase.fraud_score || 0} size="md" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-56 text-center">
                      Fraud risk score (0–100). 0 = no concerns. Elevated scores indicate inconsistencies, implausible claims, or patterns matching known fraud indicators for this campaign.
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </CardContent>
          </Card>
          </TooltipProvider>

          {/* Estimated Value */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Estimated Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentCase.estimated_value_low != null && currentCase.estimated_value_high != null ? (
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">
                    ${(currentCase.estimated_value_low / 1000).toFixed(0)}K – ${(currentCase.estimated_value_high / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Predicted settlement range</p>
                </div>
              ) : (
                <p className="text-center text-slate-500">Pending analysis</p>
              )}
            </CardContent>
          </Card>

          {/* Risk Factors */}
          {currentCase.ai_risk_factors?.length > 0 && (
            <Card className="border-0 shadow-sm border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentCase.ai_risk_factors.map((factor, i) => (
                    <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Strength Factors */}
          {currentCase.ai_strength_factors?.length > 0 && (
            <Card className="border-0 shadow-sm border-emerald-200 bg-emerald-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                  <CheckCircle className="w-5 h-5" />
                  Strength Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentCase.ai_strength_factors.map((factor, i) => (
                    <li key={i} className="text-sm text-emerald-800 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Fraud Alerts */}
          {fraudAlerts.length > 0 && (
            <Card className="border-0 shadow-sm border-red-200 bg-red-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                  <Shield className="w-5 h-5" />
                  Fraud Alerts ({fraudAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fraudAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="p-2 bg-white rounded-lg border border-red-200">
                      <p className="text-sm font-medium text-red-800">{alert.alert_type}</p>
                      <p className="text-xs text-red-600">{alert.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
