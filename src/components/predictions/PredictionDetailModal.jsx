import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Eye,
  DollarSign,
  Clock,
  Scale,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

const predictionTypeLabels = {
  settlement_value: { label: 'Settlement Value', icon: DollarSign, unit: '$' },
  settlement_timing: { label: 'Settlement Timing', icon: Clock, unit: 'months' },
  dismissal_risk: { label: 'Dismissal Risk', icon: AlertTriangle, unit: '%' },
  case_duration: { label: 'Case Duration', icon: Clock, unit: 'months' },
  trial_outcome: { label: 'Trial Outcome', icon: Scale, unit: '%' },
};

export default function PredictionDetailModal({ prediction, open, onOpenChange, onViewCase }) {
  const { data: caseData } = useQuery({
    queryKey: ['case', prediction?.case_id],
    queryFn: () => apiClient.entities.Case.filter({ id: prediction?.case_id }),
    enabled: !!prediction?.case_id && open,
  });

  const currentCase = caseData?.[0];

  if (!prediction) return null;

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

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const typeConfig = predictionTypeLabels[prediction.prediction_type] || predictionTypeLabels.settlement_value;
  const TypeIcon = typeConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">AI Prediction Analysis</DialogTitle>
                <p className="text-sm text-slate-500">{typeConfig.label}</p>
              </div>
            </div>
            <Badge className={`${getConfidenceColor(prediction.confidence_score)} text-sm px-3 py-1`}>
              {prediction.confidence_score}% Confidence
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Case Information */}
            {currentCase && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Case Information</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewCase && onViewCase(currentCase.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Full Case
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Claimant</p>
                      <p className="font-medium">{currentCase.claimant_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Case Type</p>
                      <p className="font-medium capitalize">{currentCase.case_type?.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Status</p>
                      <Badge variant="outline" className="capitalize">{currentCase.status}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Case Strength</p>
                      <p className="font-medium">{currentCase.case_strength_score || '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Tort Campaign</p>
                      <p className="font-medium text-sm">{currentCase.tort_campaign || '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Medical Records</p>
                      <Badge variant="outline" className="text-xs">{currentCase.medical_records_status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prediction Summary */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Predicted Outcome
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Primary Prediction</p>
                    <p className="text-3xl font-bold text-purple-900">
                      {formatValue(prediction.predicted_value, prediction.prediction_type)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-200 rounded-xl">
                    <TypeIcon className="w-8 h-8 text-purple-700" />
                  </div>
                </div>
                {prediction.predicted_range_low && prediction.predicted_range_high && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600">Predicted Range:</span>
                    <span className="font-semibold text-slate-900">
                      {formatValue(prediction.predicted_range_low, prediction.prediction_type)} - {formatValue(prediction.predicted_range_high, prediction.prediction_type)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Explanation */}
            {prediction.explanation && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    AI Reasoning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">{prediction.explanation}</p>
                </CardContent>
              </Card>
            )}

            {/* Key Factors */}
            {prediction.key_factors && prediction.key_factors.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Key Factors Influencing Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prediction.key_factors.map((factor, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 text-sm">{factor.factor}</p>
                            <p className="text-xs text-slate-600 mt-1">{factor.impact}</p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`ml-2 ${
                              factor.weight > 0.7 ? 'bg-red-50 text-red-700 border-red-200' :
                              factor.weight > 0.4 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {Math.round(factor.weight * 100)}% weight
                          </Badge>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              factor.weight > 0.7 ? 'bg-red-500' :
                              factor.weight > 0.4 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${factor.weight * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Model Confidence Breakdown */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  Confidence Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Overall Confidence</span>
                      <span className="font-semibold text-slate-900">{prediction.confidence_score}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          prediction.confidence_score >= 80 ? 'bg-emerald-500' :
                          prediction.confidence_score >= 60 ? 'bg-blue-500' :
                          prediction.confidence_score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${prediction.confidence_score}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Model Version</p>
                      <p className="font-semibold text-slate-900">{prediction.model_version || 'apex-v1.0'}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Prediction Date</p>
                      <p className="font-semibold text-slate-900">
                        {prediction.prediction_date ? new Date(prediction.prediction_date).toLocaleDateString() : '--'}
                      </p>
                    </div>
                  </div>

                  {prediction.comparable_cases && prediction.comparable_cases.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-slate-600 mb-2">
                        Based on analysis of <span className="font-semibold">{prediction.comparable_cases.length}</span> comparable cases
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* What This Means */}
            <Card className="border-0 shadow-sm border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                  <CheckCircle className="w-5 h-5" />
                  What This Means
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-900">
                  {prediction.confidence_score >= 80 && (
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                      <span>High confidence prediction based on strong data patterns and case similarity</span>
                    </li>
                  )}
                  {prediction.confidence_score < 80 && prediction.confidence_score >= 60 && (
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                      <span>Moderate confidence - consider gathering additional case information</span>
                    </li>
                  )}
                  {prediction.confidence_score < 60 && (
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-red-600 shrink-0" />
                      <span>Lower confidence - prediction may vary as more case details become available</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                    <span>Prediction will automatically update as new case information is added</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                    <span>Use this as guidance alongside your legal expertise and case-specific factors</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}