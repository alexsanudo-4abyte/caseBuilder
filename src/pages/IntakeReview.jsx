import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MessageSquare,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Eye
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';

export default function IntakeReview() {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [viewingConversation, setViewingConversation] = useState(false);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending_review');

  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['intake-submissions'],
    queryFn: () => apiClient.entities.IntakeSubmission.list('-created_date', 100)
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }) => 
      apiClient.entities.IntakeSubmission.update(id, {
        status,
        admin_notes: notes,
        reviewed_by: 'admin@example.com',
        reviewed_date: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intake-submissions'] });
      setSelectedSubmission(null);
      setAdminNotes('');
    }
  });

  const viewConversation = async (conversationId) => {
    try {
      const conv = await apiClient.agents.getConversation(conversationId);
      setConversationMessages(conv.messages || []);
      setViewingConversation(true);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleStatusUpdate = (status) => {
    if (!selectedSubmission) return;
    updateStatusMutation.mutate({
      id: selectedSubmission.id,
      status,
      notes: adminNotes
    });
  };

  const statusConfig = {
    pending_review: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
    needs_info: { label: 'Needs Info', color: 'bg-blue-100 text-blue-800', icon: MessageSquare }
  };

  const filteredSubmissions = submissions.filter(s => 
    filterStatus === 'all' ? true : s.status === filterStatus
  );

  const stats = {
    pending: submissions.filter(s => s.status === 'pending_review').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    needsInfo: submissions.filter(s => s.status === 'needs_info').length
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Intake Review</h1>
          <p className="text-slate-600 mt-1">Review and approve public intake submissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Review</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Approved</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Needs Info</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.needsInfo}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Rejected</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filterStatus} onValueChange={setFilterStatus}>
          <TabsList>
            <TabsTrigger value="pending_review">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
            <TabsTrigger value="needs_info">Needs Info ({stats.needsInfo})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            <TabsTrigger value="all">All ({submissions.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Submissions List */}
        <div className="grid gap-4">
          {filteredSubmissions.map((submission) => {
            const config = statusConfig[submission.status];
            const StatusIcon = config.icon;

            return (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-900">{submission.full_name}</h3>
                        <Badge className={config.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                        {submission.qualification_score && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {submission.qualification_score}% Match
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4" />
                          {submission.email}
                        </div>
                        {submission.phone && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="w-4 h-4" />
                            {submission.phone}
                          </div>
                        )}
                        {submission.case_type && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <FileText className="w-4 h-4" />
                            {submission.case_type}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(submission.submitted_date).toLocaleDateString()}
                        </div>
                      </div>

                      {submission.ai_chat_summary && (
                        <p className="text-sm text-slate-700 mb-3 line-clamp-2">
                          {submission.ai_chat_summary}
                        </p>
                      )}

                      {submission.key_facts && submission.key_facts.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {submission.key_facts.slice(0, 3).map((fact, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {fact}
                            </Badge>
                          ))}
                          {submission.key_facts.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{submission.key_facts.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {submission.conversation_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewConversation(submission.conversation_id)}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          View Chat
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setAdminNotes(submission.admin_notes || '');
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredSubmissions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                No submissions found
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Intake Submission</DialogTitle>
            <DialogDescription>
              Review the details and make a decision
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-slate-900">Contact Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">Name:</span>
                    <p className="font-medium">{selectedSubmission.full_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Email:</span>
                    <p className="font-medium">{selectedSubmission.email}</p>
                  </div>
                  {selectedSubmission.phone && (
                    <div>
                      <span className="text-slate-600">Phone:</span>
                      <p className="font-medium">{selectedSubmission.phone}</p>
                    </div>
                  )}
                  {selectedSubmission.date_of_birth && (
                    <div>
                      <span className="text-slate-600">Date of Birth:</span>
                      <p className="font-medium">{selectedSubmission.date_of_birth}</p>
                    </div>
                  )}
                </div>
                {selectedSubmission.address && (
                  <div>
                    <span className="text-slate-600 text-sm">Address:</span>
                    <p className="font-medium text-sm">{selectedSubmission.address}</p>
                  </div>
                )}
              </div>

              {/* AI Analysis */}
              {selectedSubmission.ai_chat_summary && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">AI Summary</h3>
                  <p className="text-sm text-slate-700">{selectedSubmission.ai_chat_summary}</p>
                </div>
              )}

              {/* Case Details */}
              {selectedSubmission.case_type && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Case Type</h3>
                  <Badge>{selectedSubmission.case_type}</Badge>
                </div>
              )}

              {/* Key Facts */}
              {selectedSubmission.key_facts && selectedSubmission.key_facts.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Key Facts</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    {selectedSubmission.key_facts.map((fact, idx) => (
                      <li key={idx}>{fact}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Qualification Score */}
              {selectedSubmission.qualification_score && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">AI Qualification Score</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          selectedSubmission.qualification_score >= 70 ? 'bg-green-500' :
                          selectedSubmission.qualification_score >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${selectedSubmission.qualification_score}%` }}
                      />
                    </div>
                    <span className="font-semibold text-slate-900">
                      {selectedSubmission.qualification_score}%
                    </span>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Admin Notes</h3>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add your notes here..."
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => handleStatusUpdate('approved')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('needs_info')}
                  variant="outline"
                  className="flex-1"
                  disabled={updateStatusMutation.isPending}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Needs Info
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('rejected')}
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700"
                  disabled={updateStatusMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Conversation Viewer Modal */}
      <Dialog open={viewingConversation} onOpenChange={setViewingConversation}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Intake Conversation</DialogTitle>
            <DialogDescription>
              Full conversation transcript
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
            {conversationMessages.map((msg, idx) => (
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}