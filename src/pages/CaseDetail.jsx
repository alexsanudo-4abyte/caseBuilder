import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Brain,
  Shield,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  MessageSquare,
  Loader2,
  Edit,
  Save,
  Sparkles
} from 'lucide-react';
import FraudScoreGauge from '../components/dashboard/FraudScoreGauge';
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

export default function CaseDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const caseId = urlParams.get('id');
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => base44.entities.Case.filter({ id: caseId }),
    enabled: !!caseId,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', caseId],
    queryFn: () => base44.entities.Document.filter({ case_id: caseId }),
    enabled: !!caseId,
  });

  const { data: medicalRecords = [] } = useQuery({
    queryKey: ['medicalRecords', caseId],
    queryFn: () => base44.entities.MedicalRecord.filter({ case_id: caseId }),
    enabled: !!caseId,
  });

  const { data: fraudAlerts = [] } = useQuery({
    queryKey: ['fraudAlerts', caseId],
    queryFn: () => base44.entities.FraudAlert.filter({ case_id: caseId }),
    enabled: !!caseId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', caseId],
    queryFn: () => base44.entities.Task.filter({ case_id: caseId }),
    enabled: !!caseId,
  });

  const updateCaseMutation = useMutation({
    mutationFn: (data) => base44.entities.Case.update(caseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
      setIsEditing(false);
    },
  });

  const currentCase = caseData?.[0];

  useEffect(() => {
    if (currentCase) {
      setEditedNotes(currentCase.notes || '');
    }
  }, [currentCase]);

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
                {currentCase.claimant_name}
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
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Summary Card */}
          {currentCase.ai_case_summary && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Case Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{currentCase.ai_case_summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="details">
            <TabsList className="bg-white border">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
              <TabsTrigger value="medical">Medical ({medicalRecords.length})</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  {/* Contact Info */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Email</p>
                          <p className="font-medium">{currentCase.claimant_email || '--'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Phone className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Phone</p>
                          <p className="font-medium">{currentCase.claimant_phone || '--'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 col-span-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <MapPin className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Address</p>
                          <p className="font-medium">{currentCase.claimant_address || '--'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Case Details */}
                  <div className="mb-6 pt-6 border-t">
                    <h3 className="font-semibold text-slate-900 mb-4">Case Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Case Type</p>
                        <p className="font-medium capitalize">{currentCase.case_type?.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Tort Campaign</p>
                        <p className="font-medium">{currentCase.tort_campaign || '--'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Intake Date</p>
                        <p className="font-medium">
                          {currentCase.intake_date ? format(new Date(currentCase.intake_date), 'MMM d, yyyy') : '--'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Injury Date</p>
                        <p className="font-medium">
                          {currentCase.injury_date ? format(new Date(currentCase.injury_date), 'MMM d, yyyy') : '--'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Assigned Attorney</p>
                        <p className="font-medium">{currentCase.assigned_attorney || '--'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Lead Source</p>
                        <p className="font-medium capitalize">{currentCase.intake_source || '--'}</p>
                      </div>
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
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">View</a>
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
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{currentCase.case_strength_score || '--'}</p>
                  <p className="text-xs text-slate-500">Strength</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{currentCase.credibility_score || '--'}</p>
                  <p className="text-xs text-slate-500">Credibility</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{currentCase.settlement_probability || '--'}%</p>
                  <p className="text-xs text-slate-500">Settlement</p>
                </div>
              </div>
              <div className="flex justify-center">
                <FraudScoreGauge score={currentCase.fraud_score || 0} size="md" />
              </div>
            </CardContent>
          </Card>

          {/* Estimated Value */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Estimated Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentCase.estimated_value_low && currentCase.estimated_value_high ? (
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">
                    ${(currentCase.estimated_value_low / 1000).toFixed(0)}K - ${(currentCase.estimated_value_high / 1000).toFixed(0)}K
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