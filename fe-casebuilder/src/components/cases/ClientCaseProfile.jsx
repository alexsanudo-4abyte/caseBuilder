import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Brain,
  Shield,
  DollarSign,
  Activity,
  MessageSquare,
  Save,
  Edit,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  StickyNote
} from 'lucide-react';
import FraudScoreGauge from '../dashboard/FraudScoreGauge';
import { format } from 'date-fns';

const statusConfig = {
  intake: { label: 'Intake', color: 'bg-slate-100 text-slate-700' },
  qualification: { label: 'Qualification', color: 'bg-blue-100 text-blue-700' },
  signed: { label: 'Signed', color: 'bg-indigo-100 text-indigo-700' },
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  discovery: { label: 'Discovery', color: 'bg-purple-100 text-purple-700' },
  trial_prep: { label: 'Trial Prep', color: 'bg-amber-100 text-amber-700' },
  settlement: { label: 'Settlement', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Closed', color: 'bg-slate-100 text-slate-700' },
  dismissed: { label: 'Dismissed', color: 'bg-red-100 text-red-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
};

export default function ClientCaseProfile({ caseId, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactInfo, setContactInfo] = useState({});

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => apiClient.entities.Case.filter({ id: caseId }),
    enabled: !!caseId && open,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', caseId],
    queryFn: () => apiClient.entities.Document.filter({ case_id: caseId }),
    enabled: !!caseId && open,
  });

  const { data: medicalRecords = [] } = useQuery({
    queryKey: ['medicalRecords', caseId],
    queryFn: () => apiClient.entities.MedicalRecord.filter({ case_id: caseId }),
    enabled: !!caseId && open,
  });

  const { data: fraudAlerts = [] } = useQuery({
    queryKey: ['fraudAlerts', caseId],
    queryFn: () => apiClient.entities.FraudAlert.filter({ case_id: caseId }),
    enabled: !!caseId && open,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', caseId],
    queryFn: () => apiClient.entities.Task.filter({ case_id: caseId }),
    enabled: !!caseId && open,
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['communications', caseId],
    queryFn: () => apiClient.entities.Communication.filter({ case_id: caseId }),
    enabled: !!caseId && open,
  });

  const updateCaseMutation = useMutation({
    mutationFn: (data) => apiClient.entities.Case.update(caseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      setIsEditingNotes(false);
      setIsEditingContact(false);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => apiClient.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', caseId] });
    },
  });

  const currentCase = caseData?.[0];

  useEffect(() => {
    if (currentCase) {
      setNotes(currentCase.notes || '');
      setContactInfo({
        claimant_phone: currentCase.claimant_phone || '',
        claimant_email: currentCase.claimant_email || '',
        claimant_address: currentCase.claimant_address || '',
      });
    }
  }, [currentCase]);

  const handleSaveNotes = () => {
    const timestamp = format(new Date(), 'MMM d, yyyy h:mm a');
    const updatedNotes = notes + `\n\n[${timestamp}]\n${newNote}`;
    updateCaseMutation.mutate({ notes: updatedNotes });
    setNewNote('');
  };

  const handleSaveContact = () => {
    updateCaseMutation.mutate(contactInfo);
  };

  const handleStatusChange = (newStatus) => {
    updateCaseMutation.mutate({ status: newStatus });
  };

  if (isLoading || !currentCase) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const status = statusConfig[currentCase.status] || statusConfig.intake;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {currentCase.claimant_name?.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  {currentCase.claimant_name}
                  <Badge className={status.color}>{status.label}</Badge>
                </DialogTitle>
                <p className="text-sm text-slate-500">
                  {currentCase.case_number || `#${caseId?.slice(0, 8)}`} • {currentCase.tort_campaign || currentCase.case_type}
                </p>
              </div>
            </div>
            <Select value={currentCase.status} onValueChange={handleStatusChange}>
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
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-3 h-full">
            {/* Left Sidebar - AI Insights */}
            <div className="col-span-1 border-r bg-slate-50 p-4 overflow-y-auto">
              <div className="space-y-4">
                {/* AI Summary */}
                {currentCase.ai_case_summary && (
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        AI Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-slate-700">{currentCase.ai_case_summary}</p>
                    </CardContent>
                  </Card>
                )}

                {/* AI Scores */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      AI Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{currentCase.case_strength_score || '--'}</p>
                        <p className="text-[10px] text-slate-500">Strength</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">{currentCase.credibility_score || '--'}</p>
                        <p className="text-[10px] text-slate-500">Credibility</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">{currentCase.settlement_probability || '--'}%</p>
                        <p className="text-[10px] text-slate-500">Settlement</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <FraudScoreGauge score={currentCase.fraud_score || 0} size="sm" showLabel={false} />
                      <div className="text-center mt-2">
                        <p className="text-xs text-slate-500">Fraud Risk</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Estimated Value */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      Est. Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentCase.estimated_value_low && currentCase.estimated_value_high ? (
                      <div className="text-center">
                        <p className="text-xl font-bold text-slate-900">
                          ${(currentCase.estimated_value_low / 1000).toFixed(0)}K - ${(currentCase.estimated_value_high / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Settlement range</p>
                      </div>
                    ) : (
                      <p className="text-center text-xs text-slate-500">Pending analysis</p>
                    )}
                  </CardContent>
                </Card>

                {/* Risk Factors */}
                {currentCase.ai_risk_factors?.length > 0 && (
                  <Card className="border-amber-200 bg-amber-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                        <AlertTriangle className="w-4 h-4" />
                        Risk Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {currentCase.ai_risk_factors.slice(0, 3).map((factor, i) => (
                          <li key={i} className="text-xs text-amber-800 flex items-start gap-1">
                            <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Strength Factors */}
                {currentCase.ai_strength_factors?.length > 0 && (
                  <Card className="border-emerald-200 bg-emerald-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-emerald-700">
                        <CheckCircle className="w-4 h-4" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {currentCase.ai_strength_factors.slice(0, 3).map((factor, i) => (
                          <li key={i} className="text-xs text-emerald-800 flex items-start gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Fraud Alerts */}
                {fraudAlerts.length > 0 && (
                  <Card className="border-red-200 bg-red-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                        <Shield className="w-4 h-4" />
                        Alerts ({fraudAlerts.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {fraudAlerts.slice(0, 2).map((alert) => (
                          <div key={alert.id} className="p-2 bg-white rounded border border-red-200">
                            <p className="text-xs font-medium text-red-800">{alert.alert_type?.replace(/_/g, ' ')}</p>
                            <p className="text-[10px] text-red-600 line-clamp-2">{alert.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-span-2 flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="px-4 pt-4 bg-white border-b justify-start">
                  <TabsTrigger value="overview" className="text-sm">
                    <User className="w-4 h-4 mr-1" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="text-sm">
                    <StickyNote className="w-4 h-4 mr-1" />
                    Notes
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="text-sm">
                    <FileText className="w-4 h-4 mr-1" />
                    Docs ({documents.length})
                  </TabsTrigger>
                  <TabsTrigger value="medical" className="text-sm">
                    <Activity className="w-4 h-4 mr-1" />
                    Medical ({medicalRecords.length})
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Tasks ({tasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    Timeline
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="p-6 space-y-4 m-0">
                    {/* Contact Information */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Contact Information</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (isEditingContact) {
                                handleSaveContact();
                              } else {
                                setIsEditingContact(true);
                              }
                            }}
                          >
                            {isEditingContact ? (
                              <>
                                <Save className="w-4 h-4 mr-1" />
                                Save
                              </>
                            ) : (
                              <>
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </>
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-slate-500">Email</Label>
                            {isEditingContact ? (
                              <Input
                                value={contactInfo.claimant_email}
                                onChange={(e) => setContactInfo({ ...contactInfo, claimant_email: e.target.value })}
                                className="mt-1"
                              />
                            ) : (
                              <div className="flex items-center gap-2 mt-1">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <p className="text-sm">{currentCase.claimant_email || '--'}</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500">Phone</Label>
                            {isEditingContact ? (
                              <Input
                                value={contactInfo.claimant_phone}
                                onChange={(e) => setContactInfo({ ...contactInfo, claimant_phone: e.target.value })}
                                className="mt-1"
                              />
                            ) : (
                              <div className="flex items-center gap-2 mt-1">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <p className="text-sm">{currentCase.claimant_phone || '--'}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Address</Label>
                          {isEditingContact ? (
                            <Input
                              value={contactInfo.claimant_address}
                              onChange={(e) => setContactInfo({ ...contactInfo, claimant_address: e.target.value })}
                              className="mt-1"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <p className="text-sm">{currentCase.claimant_address || '--'}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Case Details */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Case Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-xs text-slate-500">Case Type</Label>
                            <p className="text-sm font-medium capitalize mt-1">
                              {currentCase.case_type?.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500">Priority</Label>
                            <Badge className="mt-1" variant="outline">
                              {currentCase.priority}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500">Intake Date</Label>
                            <p className="text-sm mt-1">
                              {currentCase.intake_date ? format(new Date(currentCase.intake_date), 'MMM d, yyyy') : '--'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500">Assigned Attorney</Label>
                            <p className="text-sm mt-1">{currentCase.assigned_attorney || '--'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500">Lead Source</Label>
                            <p className="text-sm mt-1 capitalize">{currentCase.intake_source || '--'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500">Medical Records</Label>
                            <Badge className="mt-1" variant="outline">
                              {currentCase.medical_records_status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Injury Details */}
                    {currentCase.injury_description && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Injury Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-slate-600">{currentCase.injury_description}</p>
                          {currentCase.injury_date && (
                            <p className="text-xs text-slate-500 mt-2">
                              Injury Date: {format(new Date(currentCase.injury_date), 'MMMM d, yyyy')}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Recent Communications */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Recent Communications ({communications.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {communications.slice(0, 3).length > 0 ? (
                          <div className="space-y-2">
                            {communications.slice(0, 3).map((comm) => (
                              <div key={comm.id} className="p-2 bg-slate-50 rounded text-xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{comm.channel}</span>
                                  <span className="text-slate-500">
                                    {comm.communication_date && format(new Date(comm.communication_date), 'MMM d')}
                                  </span>
                                </div>
                                <p className="text-slate-600 line-clamp-2">{comm.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No communications yet</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Notes Tab */}
                  <TabsContent value="notes" className="p-6 space-y-4 m-0">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Add New Note</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Textarea
                          placeholder="Type your note here..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={4}
                        />
                        <Button
                          onClick={handleSaveNotes}
                          disabled={!newNote.trim() || updateCaseMutation.isPending}
                          className="w-full"
                        >
                          {updateCaseMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Note
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Case Notes History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {currentCase.notes ? (
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap text-sm text-slate-600 font-sans">
                              {currentCase.notes}
                            </pre>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No notes added yet</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="p-6 space-y-3 m-0">
                    {documents.length > 0 ? (
                      documents.map((doc) => (
                        <Card key={doc.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{doc.title}</p>
                                  <p className="text-xs text-slate-500">
                                    {doc.document_type?.replace(/_/g, ' ')} • {doc.upload_date && format(new Date(doc.upload_date), 'MMM d, yyyy')}
                                  </p>
                                </div>
                              </div>
                              {doc.file_url && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                    View
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500">No documents uploaded</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Medical Tab */}
                  <TabsContent value="medical" className="p-6 space-y-3 m-0">
                    {medicalRecords.length > 0 ? (
                      medicalRecords.map((record) => (
                        <Card key={record.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                  <Activity className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{record.provider_name}</p>
                                  <p className="text-xs text-slate-500">
                                    {record.provider_type} • {record.request_status}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline">{record.request_status}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Activity className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500">No medical records</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Tasks Tab */}
                  <TabsContent value="tasks" className="p-6 space-y-3 m-0">
                    {tasks.length > 0 ? (
                      tasks.map((task) => (
                        <Card key={task.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${
                                  task.status === 'completed' ? 'bg-emerald-500' :
                                  task.priority === 'critical' ? 'bg-red-500' : 'bg-blue-500'
                                }`} />
                                <div>
                                  <p className="font-medium text-sm">{task.title}</p>
                                  <p className="text-xs text-slate-500">
                                    {task.task_type?.replace(/_/g, ' ')} • Due: {task.due_date && format(new Date(task.due_date), 'MMM d')}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline">{task.status}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500">No tasks</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Timeline Tab */}
                  <TabsContent value="timeline" className="p-6 m-0">
                    <div className="space-y-4">
                      {/* Timeline items */}
                      <div className="relative pl-8 pb-8 border-l-2 border-slate-200">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white" />
                        <p className="text-xs text-slate-500 mb-1">
                          {currentCase.intake_date && format(new Date(currentCase.intake_date), 'MMM d, yyyy h:mm a')}
                        </p>
                        <p className="font-medium text-sm">Case Created</p>
                        <p className="text-xs text-slate-600">Initial intake completed</p>
                      </div>

                      {currentCase.signed_date && (
                        <div className="relative pl-8 pb-8 border-l-2 border-slate-200">
                          <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white" />
                          <p className="text-xs text-slate-500 mb-1">
                            {format(new Date(currentCase.signed_date), 'MMM d, yyyy h:mm a')}
                          </p>
                          <p className="font-medium text-sm">Retainer Signed</p>
                          <p className="text-xs text-slate-600">Client signed retainer agreement</p>
                        </div>
                      )}

                      <div className="relative pl-8">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-slate-300 border-4 border-white" />
                        <p className="text-xs text-slate-500 mb-1">
                          {format(new Date(), 'MMM d, yyyy h:mm a')}
                        </p>
                        <p className="font-medium text-sm">Current Status: {status.label}</p>
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}