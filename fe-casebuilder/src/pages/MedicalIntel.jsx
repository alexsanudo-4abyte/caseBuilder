import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import ClientCaseProfile from '../components/cases/ClientCaseProfile';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  FileText,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Brain,
  Eye,
  Building
} from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700', icon: Clock },
  requested: { label: 'Requested', color: 'bg-blue-100 text-blue-700', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700', icon: Loader2 },
  received: { label: 'Received', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  not_available: { label: 'N/A', color: 'bg-slate-100 text-slate-500', icon: AlertTriangle },
};

export default function MedicalIntel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newRecordOpen, setNewRecordOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const queryClient = useQueryClient();

  const [newRecord, setNewRecord] = useState({
    case_id: '',
    provider_name: '',
    provider_type: '',
    provider_address: '',
    provider_phone: '',
  });

  const { data: medicalRecords = [], isLoading } = useQuery({
    queryKey: ['medicalRecords', statusFilter],
    queryFn: () => statusFilter === 'all'
      ? apiClient.entities.MedicalRecord.list('-created_date', 100)
      : apiClient.entities.MedicalRecord.filter({ request_status: statusFilter }, '-created_date', 100),
  });

  const { data: cases = [] } = useQuery({
    queryKey: ['casesForMedical'],
    queryFn: () => apiClient.entities.Case.list('-created_date', 200),
  });

  const createRecordMutation = useMutation({
    mutationFn: (data) => apiClient.entities.MedicalRecord.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
      setNewRecordOpen(false);
      setNewRecord({
        case_id: '',
        provider_name: '',
        provider_type: '',
        provider_address: '',
        provider_phone: '',
      });
    },
  });

  const updateRecordMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.entities.MedicalRecord.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
    },
  });

  const runAIAnalysis = async (record) => {
    setAnalyzing(true);
    setSelectedRecord(record);

    try {
      const response = await apiClient.integrations.Core.InvokeLLM({
        prompt: `Analyze this medical record request and generate a comprehensive medical summary. 
        
Provider: ${record.provider_name}
Provider Type: ${record.provider_type}
Records Period: ${record.records_start_date} to ${record.records_end_date}

Generate:
1. Extracted diagnoses with ICD-10 codes
2. Key procedures
3. Medications identified  
4. Severity assessment (0-100)
5. Whether qualifying diagnoses were found
6. Comprehensive medical summary
7. Timeline of key medical events`,
        response_json_schema: {
          type: "object",
          properties: {
            diagnoses_extracted: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  description: { type: "string" },
                  date: { type: "string" },
                  is_qualifying: { type: "boolean" }
                }
              }
            },
            procedures_extracted: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  description: { type: "string" },
                  date: { type: "string" }
                }
              }
            },
            medications_extracted: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  dosage: { type: "string" }
                }
              }
            },
            severity_score: { type: "number" },
            qualifying_diagnosis_found: { type: "boolean" },
            ai_medical_summary: { type: "string" },
            ai_timeline: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  event: { type: "string" },
                  significance: { type: "string" }
                }
              }
            }
          }
        }
      });

      await updateRecordMutation.mutateAsync({
        id: record.id,
        data: {
          ...response,
          ai_analysis_status: 'complete'
        }
      });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
      setSelectedRecord(null);
    }
  };

  const filteredRecords = medicalRecords.filter(r =>
    !searchQuery ||
    r.provider_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.case_id?.includes(searchQuery)
  );

  // Stats
  const pendingRequests = medicalRecords.filter(r => r.request_status === 'pending' || r.request_status === 'requested').length;
  const receivedRecords = medicalRecords.filter(r => r.request_status === 'received').length;
  const qualifyingFound = medicalRecords.filter(r => r.qualifying_diagnosis_found).length;

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Medical Intelligence
          </h1>
          <p className="text-slate-500 mt-1">
            AI-powered medical record analysis and diagnosis verification
          </p>
        </div>
        <Dialog open={newRecordOpen} onOpenChange={setNewRecordOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Request Records
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Medical Records</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Case</Label>
                <Select 
                  value={newRecord.case_id} 
                  onValueChange={(v) => setNewRecord({ ...newRecord, case_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select case" />
                  </SelectTrigger>
                  <SelectContent>
                    {cases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.claimant_name} - {c.case_number || c.id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Provider Name</Label>
                <Input
                  value={newRecord.provider_name}
                  onChange={(e) => setNewRecord({ ...newRecord, provider_name: e.target.value })}
                  placeholder="Hospital or clinic name"
                />
              </div>
              <div>
                <Label>Provider Type</Label>
                <Select 
                  value={newRecord.provider_type} 
                  onValueChange={(v) => setNewRecord({ ...newRecord, provider_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="clinic">Clinic</SelectItem>
                    <SelectItem value="specialist">Specialist</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="imaging">Imaging Center</SelectItem>
                    <SelectItem value="lab">Laboratory</SelectItem>
                    <SelectItem value="er">Emergency Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Provider Phone</Label>
                <Input
                  value={newRecord.provider_phone}
                  onChange={(e) => setNewRecord({ ...newRecord, provider_phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label>Provider Address</Label>
                <Input
                  value={newRecord.provider_address}
                  onChange={(e) => setNewRecord({ ...newRecord, provider_address: e.target.value })}
                  placeholder="Full address"
                />
              </div>
              <Button 
                className="w-full"
                onClick={() => createRecordMutation.mutate({
                  ...newRecord,
                  request_status: 'pending',
                  request_date: new Date().toISOString().split('T')[0]
                })}
                disabled={!newRecord.case_id || !newRecord.provider_name || createRecordMutation.isPending}
              >
                {createRecordMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Submit Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{medicalRecords.length}</p>
              <p className="text-sm text-slate-500">Total Requests</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 rounded-xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{pendingRequests}</p>
              <p className="text-sm text-amber-600">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500 rounded-xl">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{receivedRecords}</p>
              <p className="text-sm text-emerald-600">Received</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500 rounded-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{qualifyingFound}</p>
              <p className="text-sm text-purple-600">Qualifying Dx Found</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by provider or case..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="requested">Requested</TabsTrigger>
                <TabsTrigger value="received">Received</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : filteredRecords.length > 0 ? (
            <div className="divide-y">
              {filteredRecords.map((record) => {
                const status = statusConfig[record.request_status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const caseInfo = cases.find(c => c.id === record.case_id);

                return (
                  <div key={record.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setSelectedCaseId(record.case_id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <Building className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{record.provider_name}</p>
                            <Badge className={status.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500">
                            {caseInfo?.claimant_name || 'Unknown Case'} • {record.provider_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {record.qualifying_diagnosis_found && (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Qualifying Dx
                          </Badge>
                        )}
                        {record.severity_score && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-900">Severity: {record.severity_score}</p>
                          </div>
                        )}
                        {record.request_status === 'received' && record.ai_analysis_status !== 'complete' && (
                          <Button
                            size="sm"
                            onClick={() => runAIAnalysis(record)}
                            disabled={analyzing && selectedRecord?.id === record.id}
                          >
                            {analyzing && selectedRecord?.id === record.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Brain className="w-4 h-4 mr-2" />
                            )}
                            Analyze
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {record.ai_medical_summary && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-800">{record.ai_medical_summary}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-900">No medical records</p>
              <p className="text-slate-500">Start by requesting records for your cases</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Case Profile Modal */}
      <ClientCaseProfile
        caseId={selectedCaseId}
        open={!!selectedCaseId}
        onOpenChange={(open) => !open && setSelectedCaseId(null)}
      />
    </div>
  );
}