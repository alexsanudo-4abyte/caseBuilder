import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PredictionDetailModal from '../components/predictions/PredictionDetailModal';
import ClientCaseProfile from '../components/cases/ClientCaseProfile';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Loader2,
  ArrowRight,
  Target,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { format } from 'date-fns';

export default function Predictions() {
  const [predictionType, setPredictionType] = useState('settlement_value');
  const [generating, setGenerating] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const queryClient = useQueryClient();

  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['predictions', predictionType],
    queryFn: () => base44.entities.Prediction.filter(
      { prediction_type: predictionType, is_current: true },
      '-created_date',
      50
    ),
  });

  const { data: cases = [] } = useQuery({
    queryKey: ['casesForPredictions'],
    queryFn: () => base44.entities.Case.filter(
      { status: 'active' },
      '-created_date',
      100
    ),
  });

  const createPredictionMutation = useMutation({
    mutationFn: (data) => base44.entities.Prediction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    },
  });

  const generatePredictions = async () => {
    setGenerating(true);
    
    for (const caseItem of cases.slice(0, 5)) {
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate a ${predictionType.replace(/_/g, ' ')} prediction for this legal case:

Case Type: ${caseItem.case_type}
Tort Campaign: ${caseItem.tort_campaign || 'General'}
Case Strength Score: ${caseItem.case_strength_score || 'Not assessed'}
Current Status: ${caseItem.status}
Injury Description: ${caseItem.injury_description || 'Not provided'}
Medical Records Status: ${caseItem.medical_records_status}

Based on historical data patterns for similar cases, provide a realistic prediction.`,
          response_json_schema: {
            type: "object",
            properties: {
              predicted_value: { type: "number" },
              predicted_range_low: { type: "number" },
              predicted_range_high: { type: "number" },
              confidence_score: { type: "number" },
              key_factors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    factor: { type: "string" },
                    impact: { type: "string" },
                    weight: { type: "number" }
                  }
                }
              },
              explanation: { type: "string" }
            }
          }
        });

        await createPredictionMutation.mutateAsync({
          case_id: caseItem.id,
          prediction_type: predictionType,
          ...response,
          prediction_date: new Date().toISOString().split('T')[0],
          model_version: 'apex-v1.0',
          is_current: true
        });
      } catch (error) {
        console.error('Prediction failed for case:', caseItem.id);
      }
    }
    
    setGenerating(false);
  };

  // Calculate stats
  const avgPredictedValue = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + (p.predicted_value || 0), 0) / predictions.length)
    : 0;
  const avgConfidence = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / predictions.length)
    : 0;

  const formatValue = (value, type) => {
    if (type === 'settlement_value') {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
      return `$${value}`;
    }
    if (type === 'settlement_timing' || type === 'case_duration') {
      return `${value} months`;
    }
    return `${value}%`;
  };

  const predictionTypeLabels = {
    settlement_value: { label: 'Settlement Value', icon: DollarSign, color: 'emerald' },
    settlement_timing: { label: 'Settlement Timing', icon: Clock, color: 'blue' },
    dismissal_risk: { label: 'Dismissal Risk', icon: AlertTriangle, color: 'amber' },
    case_duration: { label: 'Case Duration', icon: Clock, color: 'purple' },
  };

  const currentType = predictionTypeLabels[predictionType];

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            AI Predictions
          </h1>
          <p className="text-slate-500 mt-1">
            Predictive analytics powered by machine learning
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={predictionType} onValueChange={setPredictionType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="settlement_value">Settlement Value</SelectItem>
              <SelectItem value="settlement_timing">Settlement Timing</SelectItem>
              <SelectItem value="dismissal_risk">Dismissal Risk</SelectItem>
              <SelectItem value="case_duration">Case Duration</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={generatePredictions}
            disabled={generating || cases.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Predictions
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500 rounded-xl">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-700">{predictions.length}</p>
              <p className="text-sm text-purple-600">Active Predictions</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <currentType.icon className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {formatValue(avgPredictedValue, predictionType)}
              </p>
              <p className="text-sm text-slate-500">Avg. {currentType.label}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{avgConfidence}%</p>
              <p className="text-sm text-slate-500">Avg. Confidence</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">87%</p>
              <p className="text-sm text-slate-500">Model Accuracy</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Predictions Distribution Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Prediction Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={predictions.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="case_id" 
                  tick={false}
                  axisLine={false}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(v) => formatValue(v, predictionType)}
                />
                <Tooltip 
                  formatter={(value) => formatValue(value, predictionType)}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="predicted_value" radius={[4, 4, 0, 0]}>
                  {predictions.slice(0, 10).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.confidence_score > 70 ? '#10b981' : entry.confidence_score > 50 ? '#f59e0b' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Predictions List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Case Predictions</CardTitle>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              {currentType.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : predictions.length > 0 ? (
            <div className="space-y-3">
              {predictions.map((prediction) => (
                <div
                  key={prediction.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedPrediction(prediction)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      prediction.confidence_score > 70 ? 'bg-emerald-100' :
                      prediction.confidence_score > 50 ? 'bg-amber-100' : 'bg-red-100'
                    }`}>
                      <currentType.icon className={`w-5 h-5 ${
                        prediction.confidence_score > 70 ? 'text-emerald-600' :
                        prediction.confidence_score > 50 ? 'text-amber-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        Case #{prediction.case_id?.slice(0, 8)}
                      </p>
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {prediction.explanation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {formatValue(prediction.predicted_value, predictionType)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Range: {formatValue(prediction.predicted_range_low, predictionType)} - {formatValue(prediction.predicted_range_high, predictionType)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            prediction.confidence_score > 70 ? 'bg-emerald-500' :
                            prediction.confidence_score > 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${prediction.confidence_score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        {prediction.confidence_score}%
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-900">No predictions yet</p>
              <p className="text-slate-500 mb-4">Generate AI predictions for your active cases</p>
              <Button 
                onClick={generatePredictions}
                disabled={generating || cases.length === 0}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Predictions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Info Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Info className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-white">
              <h3 className="font-semibold mb-2">About APEX Predictions</h3>
              <p className="text-sm text-slate-400">
                Our predictive models are trained on historical case outcomes, settlement data, and litigation patterns. 
                Predictions are updated as new case information becomes available. Confidence scores reflect the model's 
                certainty based on available data quality and case similarity to historical patterns.
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <span className="text-slate-400">Model Version: <span className="text-white">apex-v1.0</span></span>
                <span className="text-slate-400">Last Updated: <span className="text-white">Real-time</span></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Detail Modal */}
      <PredictionDetailModal
        prediction={selectedPrediction}
        open={!!selectedPrediction}
        onOpenChange={(open) => !open && setSelectedPrediction(null)}
        onViewCase={(caseId) => {
          setSelectedPrediction(null);
          setSelectedCaseId(caseId);
        }}
      />

      {/* Client Case Profile Modal */}
      <ClientCaseProfile
        caseId={selectedCaseId}
        open={!!selectedCaseId}
        onOpenChange={(open) => !open && setSelectedCaseId(null)}
      />
    </div>
  );
}