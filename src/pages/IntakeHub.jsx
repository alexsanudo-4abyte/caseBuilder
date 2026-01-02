import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  UserPlus,
  Sparkles,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Brain,
  ArrowRight
} from 'lucide-react';
import FraudScoreGauge from '../components/dashboard/FraudScoreGauge';

export default function IntakeHub() {
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    claimant_name: '',
    claimant_email: '',
    claimant_phone: '',
    claimant_address: '',
    claimant_dob: '',
    case_type: '',
    tort_campaign: '',
    injury_description: '',
    injury_date: '',
    intake_source: '',
    notes: ''
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.TortCampaign.filter({ status: 'active' }),
  });

  const { data: recentIntakes = [] } = useQuery({
    queryKey: ['recentIntakes'],
    queryFn: () => base44.entities.Case.filter({ status: 'intake' }, '-created_date', 10),
  });

  const createCaseMutation = useMutation({
    mutationFn: (data) => base44.entities.Case.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['recentIntakes'] });
      setIntakeOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      claimant_name: '',
      claimant_email: '',
      claimant_phone: '',
      claimant_address: '',
      claimant_dob: '',
      case_type: '',
      tort_campaign: '',
      injury_description: '',
      injury_date: '',
      intake_source: '',
      notes: ''
    });
    setCurrentStep(1);
    setAnalysisResults(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this legal intake for case qualification and fraud risk. Be thorough but conservative.

Claimant Information:
- Name: ${formData.claimant_name}
- Email: ${formData.claimant_email}
- Phone: ${formData.claimant_phone}
- Date of Birth: ${formData.claimant_dob}
- Address: ${formData.claimant_address}

Case Information:
- Case Type: ${formData.case_type}
- Tort Campaign: ${formData.tort_campaign}
- Injury Description: ${formData.injury_description}
- Injury Date: ${formData.injury_date}
- Intake Source: ${formData.intake_source}

Please analyze for:
1. Fraud risk indicators (0-100 score, higher = more risk)
2. Credibility assessment (0-100 score, higher = more credible)
3. Case strength preliminary score (0-100)
4. Key risk factors identified
5. Key strength factors identified
6. Recommended next steps
7. Whether this appears to be a qualifying case`,
        response_json_schema: {
          type: "object",
          properties: {
            fraud_score: { type: "number" },
            credibility_score: { type: "number" },
            case_strength_score: { type: "number" },
            risk_factors: { type: "array", items: { type: "string" } },
            strength_factors: { type: "array", items: { type: "string" } },
            recommended_actions: { type: "array", items: { type: "string" } },
            is_qualifying: { type: "boolean" },
            summary: { type: "string" }
          }
        }
      });

      setAnalysisResults(response);
      setCurrentStep(3);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const submitCase = async () => {
    const caseData = {
      ...formData,
      status: 'intake',
      priority: analysisResults?.fraud_score > 50 ? 'high' : 'medium',
      fraud_score: analysisResults?.fraud_score,
      credibility_score: analysisResults?.credibility_score,
      case_strength_score: analysisResults?.case_strength_score,
      ai_risk_factors: analysisResults?.risk_factors,
      ai_strength_factors: analysisResults?.strength_factors,
      ai_case_summary: analysisResults?.summary,
      qualifying_criteria_met: analysisResults?.is_qualifying,
      intake_date: new Date().toISOString().split('T')[0]
    };

    createCaseMutation.mutate(caseData);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Intake Hub</h1>
          <p className="text-slate-500 mt-1">
            AI-powered case intake with fraud detection and qualification scoring
          </p>
        </div>
        <Dialog open={intakeOpen} onOpenChange={setIntakeOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" size="lg">
              <UserPlus className="w-5 h-5 mr-2" />
              New Intake
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                AI-Powered Case Intake
              </DialogTitle>
            </DialogHeader>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-1 rounded ${
                      currentStep > step ? 'bg-blue-600' : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Claimant Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={formData.claimant_name}
                      onChange={(e) => handleInputChange('claimant_name', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.claimant_email}
                      onChange={(e) => handleInputChange('claimant_email', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input
                      value={formData.claimant_phone}
                      onChange={(e) => handleInputChange('claimant_phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={formData.claimant_address}
                      onChange={(e) => handleInputChange('claimant_address', e.target.value)}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.claimant_dob}
                      onChange={(e) => handleInputChange('claimant_dob', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Lead Source</Label>
                    <Select value={formData.intake_source} onValueChange={(v) => handleInputChange('intake_source', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tv">TV Advertisement</SelectItem>
                        <SelectItem value="digital">Digital Marketing</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => setCurrentStep(2)} disabled={!formData.claimant_name || !formData.claimant_email}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Case Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Case Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Case Type *</Label>
                    <Select value={formData.case_type} onValueChange={(v) => handleInputChange('case_type', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mass_tort">Mass Tort</SelectItem>
                        <SelectItem value="personal_injury">Personal Injury</SelectItem>
                        <SelectItem value="product_liability">Product Liability</SelectItem>
                        <SelectItem value="medical_malpractice">Medical Malpractice</SelectItem>
                        <SelectItem value="auto_accident">Auto Accident</SelectItem>
                        <SelectItem value="workers_comp">Workers Compensation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tort Campaign</Label>
                    <Select value={formData.tort_campaign} onValueChange={(v) => handleInputChange('tort_campaign', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns.map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.name}>
                            {campaign.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">Other / General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Injury Date</Label>
                    <Input
                      type="date"
                      value={formData.injury_date}
                      onChange={(e) => handleInputChange('injury_date', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Injury Description *</Label>
                  <Textarea
                    value={formData.injury_description}
                    onChange={(e) => handleInputChange('injury_description', e.target.value)}
                    placeholder="Describe the injury, how it occurred, and any relevant medical information..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional information..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button 
                    onClick={runAIAnalysis} 
                    disabled={!formData.case_type || !formData.injury_description || analyzing}
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Run AI Analysis
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: AI Analysis Results */}
            {currentStep === 3 && analysisResults && (
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">AI Analysis Results</h3>

                {/* Score Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="text-center p-4">
                    <FraudScoreGauge score={analysisResults.fraud_score} size="sm" />
                    <p className="text-sm font-medium mt-2">Fraud Risk</p>
                  </Card>
                  <Card className="text-center p-4">
                    <div className="text-3xl font-bold text-blue-600">{analysisResults.credibility_score}</div>
                    <p className="text-sm font-medium mt-2">Credibility</p>
                  </Card>
                  <Card className="text-center p-4">
                    <div className="text-3xl font-bold text-emerald-600">{analysisResults.case_strength_score}</div>
                    <p className="text-sm font-medium mt-2">Case Strength</p>
                  </Card>
                </div>

                {/* Qualification Status */}
                <Card className={`p-4 ${analysisResults.is_qualifying ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-3">
                    {analysisResults.is_qualifying ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {analysisResults.is_qualifying ? 'Potentially Qualifying Case' : 'Further Review Required'}
                      </p>
                      <p className="text-sm text-slate-600">{analysisResults.summary}</p>
                    </div>
                  </div>
                </Card>

                {/* Risk & Strength Factors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Risk Factors
                    </h4>
                    <ul className="space-y-1">
                      {analysisResults.risk_factors?.map((factor, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Strength Factors
                    </h4>
                    <ul className="space-y-1">
                      {analysisResults.strength_factors?.map((factor, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Edit Details
                  </Button>
                  <Button 
                    onClick={submitCase}
                    disabled={createCaseMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {createCaseMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Create Case
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{recentIntakes.length}</p>
              <p className="text-sm text-blue-600">Pending Intake</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">
                {recentIntakes.filter(c => c.qualifying_criteria_met).length}
              </p>
              <p className="text-sm text-emerald-600">Qualified</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">
                {recentIntakes.filter(c => c.fraud_score > 50).length}
              </p>
              <p className="text-sm text-amber-600">Flagged</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">
                {recentIntakes.length > 0 
                  ? Math.round(recentIntakes.reduce((sum, c) => sum + (c.case_strength_score || 0), 0) / recentIntakes.filter(c => c.case_strength_score).length) || '--'
                  : '--'}
              </p>
              <p className="text-sm text-purple-600">Avg. AI Score</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Intakes */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Intakes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentIntakes.length > 0 ? (
            <div className="space-y-4">
              {recentIntakes.map((intake) => (
                <div key={intake.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {intake.claimant_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{intake.claimant_name}</p>
                      <p className="text-sm text-slate-500">{intake.tort_campaign || intake.case_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">AI Score: {intake.case_strength_score || '--'}</p>
                      <p className="text-xs text-slate-500">Fraud: {intake.fraud_score || '--'}</p>
                    </div>
                    <Badge className={intake.qualifying_criteria_met ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                      {intake.qualifying_criteria_met ? 'Qualified' : 'Review'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No recent intakes</p>
              <Button className="mt-4" onClick={() => setIntakeOpen(true)}>
                Create First Intake
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}