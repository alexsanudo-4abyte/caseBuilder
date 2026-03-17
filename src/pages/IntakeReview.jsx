import React, { useState, useMemo } from 'react';
import { apiClient } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Mail,
  Phone,
  TrendingUp,
  Eye,
  Search,
  ExternalLink,
  Briefcase,
  Clock,
  Globe,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

const STATUS_CONFIG = {
  pending_review: { label: 'Pending Review', badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
  approved:       { label: 'Approved',        badgeClass: 'bg-green-100 text-green-800 border-green-200',   icon: CheckCircle },
  rejected:       { label: 'Rejected',        badgeClass: 'bg-red-100 text-red-800 border-red-200',         icon: XCircle },
  needs_info:     { label: 'Needs Info',      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',      icon: MessageSquare },
};

const CHANNEL_LABELS = {
  web_form:    'Web Form',
  partner_api: 'Partner API',
  phone:       'Phone',
};

function ScoreBar({ score, label }) {
  const color =
    score >= 70 ? 'bg-green-500' :
    score >= 40 ? 'bg-yellow-500' :
    'bg-red-500';
  return (
    <div>
      {label && <p className="text-xs text-slate-500 mb-1">{label}</p>}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all`} style={{ width: `${score}%` }} />
        </div>
        <span className="text-sm font-semibold text-slate-800 w-10 text-right">{score}%</span>
      </div>
    </div>
  );
}

function ConversationThread({ messages = [] }) {
  if (!messages.length) return <p className="text-sm text-slate-500 italic">No conversation recorded.</p>;
  return (
    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
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

export default function IntakeReview() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending_review');
  const [search, setSearch] = useState('');

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['intake-submissions'],
    queryFn: () => apiClient.entities.IntakeSubmission.list('-submitted_date', 200),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }) =>
      apiClient.entities.IntakeSubmission.update(id, {
        status,
        admin_notes: notes,
        reviewed_by: user?.email ?? 'staff',
        reviewed_date: new Date().toISOString(),
      }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['intake-submissions'] });
      toast.success(`Submission marked as ${STATUS_CONFIG[status]?.label ?? status}`);
      setSelectedSubmission(null);
      setAdminNotes('');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const promoteToCase = useMutation({
    mutationFn: async (submission) => {
      const payload = submission.raw_payload ?? {};
      const newCase = await apiClient.entities.Case.create({
        claimant_id: submission.claimant_id,
        tort_campaign_id: submission.tort_campaign_id ?? payload.tort_campaign_id,
        intake_submission_id: submission.id,
        case_type: submission.case_type ?? payload.case_type,
        status: 'qualification',
        intake_source: submission.intake_channel ?? 'web_form',
        intake_date: new Date().toISOString(),
        notes: submission.admin_notes,
        claimant_name: payload.full_name ?? null,
        claimant_email: payload.email ?? null,
      });
      await apiClient.entities.IntakeSubmission.update(submission.id, { case_id: newCase.id });

      // Backfill case_id onto any documents uploaded before case creation
      const docs = await apiClient.entities.Document.filter({ intake_submission_id: submission.id });
      await Promise.all(docs.map(doc => apiClient.entities.Document.update(doc.id, { case_id: newCase.id })));

      // Trigger AI case analysis in the background (fire-and-forget)
      apiClient.caseAnalysis.analyze(newCase.id).catch(() => {});

      return newCase;
    },
    onSuccess: (newCase) => {
      queryClient.invalidateQueries({ queryKey: ['intake-submissions'] });
      // Refresh selected submission state with updated case_id
      setSelectedSubmission(prev => prev ? { ...prev, case_id: newCase.id } : null);
      toast.success('Case created — submission promoted to Qualification stage');
    },
    onError: () => toast.error('Failed to create case'),
  });

  const openReview = (submission) => {
    setSelectedSubmission(submission);
    setAdminNotes(submission.admin_notes ?? '');
  };

  const handleStatusUpdate = (status) => {
    if (!selectedSubmission) return;
    updateStatusMutation.mutate({ id: selectedSubmission.id, status, notes: adminNotes });
  };

  // PII lives in raw_payload (stored at submit time)
  const getPII = (submission) => {
    const p = submission?.raw_payload ?? {};
    return {
      full_name:     p.full_name     ?? '—',
      email:         p.email         ?? '—',
      phone:         p.phone         ?? null,
      address:       p.address       ?? null,
      date_of_birth: p.date_of_birth ?? null,
      conversation:  p.conversation  ?? [],
    };
  };

  const stats = useMemo(() => ({
    pending:   submissions.filter(s => s.status === 'pending_review').length,
    approved:  submissions.filter(s => s.status === 'approved').length,
    rejected:  submissions.filter(s => s.status === 'rejected').length,
    needsInfo: submissions.filter(s => s.status === 'needs_info').length,
  }), [submissions]);

  const filteredSubmissions = useMemo(() => {
    const byStatus = filterStatus === 'all'
      ? submissions
      : submissions.filter(s => s.status === filterStatus);

    if (!search.trim()) return byStatus;
    const q = search.toLowerCase();
    return byStatus.filter(s => {
      const name = (s.raw_payload?.full_name ?? '').toLowerCase();
      const email = (s.raw_payload?.email ?? '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [submissions, filterStatus, search]);

  const selectedPII = selectedSubmission ? getPII(selectedSubmission) : null;
  const alreadyPromoted = !!selectedSubmission?.case_id;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Intake Review</h1>
          <p className="text-slate-600 mt-1">Review and triage public intake submissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending Review', value: stats.pending,   icon: AlertCircle,  color: 'text-yellow-500' },
            { label: 'Approved',       value: stats.approved,  icon: CheckCircle,  color: 'text-green-500'  },
            { label: 'Needs Info',     value: stats.needsInfo, icon: MessageSquare,color: 'text-blue-500'   },
            { label: 'Rejected',       value: stats.rejected,  icon: XCircle,      color: 'text-red-500'    },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{label}</p>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Tabs value={filterStatus} onValueChange={setFilterStatus} className="flex-1">
            <TabsList>
              <TabsTrigger value="pending_review">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
              <TabsTrigger value="needs_info">Needs Info ({stats.needsInfo})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
              <TabsTrigger value="all">All ({submissions.length})</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Submissions list */}
        <div className="grid gap-4">
          {isLoading && (
            <Card>
              <CardContent className="py-12 text-center text-slate-400">Loading submissions…</CardContent>
            </Card>
          )}

          {!isLoading && filteredSubmissions.map((submission) => {
            const config = STATUS_CONFIG[submission.status] ?? STATUS_CONFIG.pending_review;
            const StatusIcon = config.icon;
            const pii = getPII(submission);

            return (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-base font-semibold text-slate-900">{pii.full_name}</h3>
                        <Badge className={`${config.badgeClass} border text-xs`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                        {submission.qualification_score != null && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {submission.qualification_score}% match
                          </Badge>
                        )}
                        {submission.case_id && (
                          <Badge className="bg-purple-100 text-purple-800 border border-purple-200 text-xs flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            Case created
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 mb-3">
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{pii.email}</span>
                        {pii.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{pii.phone}</span>}
                        {submission.case_type && <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{submission.case_type}</span>}
                        {submission.intake_channel && (
                          <span className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            {CHANNEL_LABELS[submission.intake_channel] ?? submission.intake_channel}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {submission.submitted_date
                            ? new Date(submission.submitted_date).toLocaleDateString()
                            : '—'}
                        </span>
                      </div>

                      {submission.ai_chat_summary && (
                        <p className="text-sm text-slate-700 line-clamp-2">{submission.ai_chat_summary}</p>
                      )}

                      {submission.key_facts?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {submission.key_facts.slice(0, 3).map((fact, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{fact}</Badge>
                          ))}
                          {submission.key_facts.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{submission.key_facts.length - 3} more</Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      {submission.case_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={createPageUrl('CaseDetail') + `?id=${submission.case_id}`}>
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Case
                          </a>
                        </Button>
                      )}
                      <Button size="sm" onClick={() => openReview(submission)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {!isLoading && filteredSubmissions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">No submissions found</CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Review Modal ─────────────────────────────────────────────────────── */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Intake Submission</DialogTitle>
            <DialogDescription>
              {selectedPII?.full_name} · submitted{' '}
              {selectedSubmission?.submitted_date
                ? new Date(selectedSubmission.submitted_date).toLocaleString()
                : '—'}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && selectedPII && (
            <div className="space-y-5 pt-1">

              {/* Contact info */}
              <section className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Full Name</p>
                  <p className="font-medium">{selectedPII.full_name}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Email</p>
                  <p className="font-medium">{selectedPII.email}</p>
                </div>
                {selectedPII.phone && (
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">Phone</p>
                    <p className="font-medium">{selectedPII.phone}</p>
                  </div>
                )}
                {selectedPII.date_of_birth && (
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">Date of Birth</p>
                    <p className="font-medium">{selectedPII.date_of_birth}</p>
                  </div>
                )}
                {selectedPII.address && (
                  <div className="col-span-2">
                    <p className="text-slate-500 text-xs mb-0.5">Address</p>
                    <p className="font-medium">{selectedPII.address}</p>
                  </div>
                )}
                {selectedSubmission.intake_channel && (
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">Channel</p>
                    <p className="font-medium">{CHANNEL_LABELS[selectedSubmission.intake_channel] ?? selectedSubmission.intake_channel}</p>
                  </div>
                )}
              </section>

              {/* AI Summary */}
              {selectedSubmission.ai_chat_summary && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">AI Summary</h3>
                  <div className="bg-blue-50 rounded-lg p-3 text-sm text-slate-700 leading-relaxed">
                    {selectedSubmission.ai_chat_summary}
                  </div>
                </section>
              )}

              {/* Case details */}
              {(selectedSubmission.case_type || selectedSubmission.qualification_score != null) && (
                <section className="grid grid-cols-2 gap-4">
                  {selectedSubmission.case_type && (
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Case Type</p>
                      <Badge>{selectedSubmission.case_type}</Badge>
                    </div>
                  )}
                  {selectedSubmission.qualification_score != null && (
                    <div>
                      <p className="text-slate-500 text-xs mb-1">AI Qualification Score</p>
                      <ScoreBar score={selectedSubmission.qualification_score} />
                    </div>
                  )}
                </section>
              )}

              {/* Key facts */}
              {selectedSubmission.key_facts?.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Key Facts</h3>
                  <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
                    {selectedSubmission.key_facts.map((fact, idx) => (
                      <li key={idx}>{fact}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Conversation */}
              {selectedPII.conversation.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    Intake Conversation
                    <span className="text-xs font-normal text-slate-400">({selectedPII.conversation.length} messages)</span>
                  </h3>
                  <div className="border rounded-lg p-3 bg-white">
                    <ConversationThread messages={selectedPII.conversation} />
                  </div>
                </section>
              )}

              <Separator />

              {/* Promote to Case */}
              {selectedSubmission.status === 'approved' && (
                <section>
                  {alreadyPromoted ? (
                    <div className="flex items-center justify-between rounded-lg bg-purple-50 border border-purple-200 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-purple-900">Case already created</p>
                        <p className="text-xs text-purple-600 mt-0.5">This submission has been promoted to a case.</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={createPageUrl('CaseDetail') + `?id=${selectedSubmission.case_id}`}>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Case
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-green-900">Promote to Case</p>
                        <p className="text-xs text-green-600 mt-0.5">Create a case record in the Qualification stage.</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-700 hover:bg-green-800 text-white"
                        onClick={() => promoteToCase.mutate(selectedSubmission)}
                        disabled={promoteToCase.isPending}
                      >
                        <Briefcase className="w-4 h-4 mr-1.5" />
                        {promoteToCase.isPending ? 'Creating…' : 'Promote to Case'}
                      </Button>
                    </div>
                  )}
                </section>
              )}

              {/* Admin notes */}
              <section>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Admin Notes</h3>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the record…"
                  rows={3}
                />
              </section>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleStatusUpdate('needs_info')}
                  disabled={updateStatusMutation.isPending}
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Needs Info
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={updateStatusMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
