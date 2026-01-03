import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ClientCaseProfile from '../components/cases/ClientCaseProfile';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Phone,
  UserX,
  FileWarning,
  Network,
  Clock,
  ArrowRight,
  Loader2,
  Search
} from 'lucide-react';
import FraudScoreGauge from '../components/dashboard/FraudScoreGauge';
import { format } from 'date-fns';

const alertTypeConfig = {
  phone_validation: { icon: Phone, label: 'Phone Validation', color: 'text-amber-500' },
  identity_mismatch: { icon: UserX, label: 'Identity Mismatch', color: 'text-red-500' },
  duplicate_claimant: { icon: Network, label: 'Duplicate Claimant', color: 'text-purple-500' },
  coached_responses: { icon: FileWarning, label: 'Coached Responses', color: 'text-orange-500' },
  cross_tort_match: { icon: Network, label: 'Cross-Tort Match', color: 'text-blue-500' },
  address_validation: { icon: Search, label: 'Address Validation', color: 'text-slate-500' },
  medical_inconsistency: { icon: FileWarning, label: 'Medical Inconsistency', color: 'text-rose-500' },
  referral_pattern: { icon: Network, label: 'Referral Pattern', color: 'text-indigo-500' },
  network_fraud: { icon: Network, label: 'Network Fraud', color: 'text-red-600' },
  document_forgery: { icon: FileWarning, label: 'Document Forgery', color: 'text-red-700' },
};

const severityConfig = {
  critical: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Critical' },
  high: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'High' },
  medium: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Medium' },
  low: { color: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Low' },
};

export default function FraudMonitor() {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [statusFilter, setStatusFilter] = useState('new');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['fraudAlerts', statusFilter],
    queryFn: () => statusFilter === 'all' 
      ? base44.entities.FraudAlert.list('-created_date', 100)
      : base44.entities.FraudAlert.filter({ status: statusFilter }, '-created_date', 100),
  });

  const { data: cases = [] } = useQuery({
    queryKey: ['casesForFraud'],
    queryFn: () => base44.entities.Case.list('-created_date', 500),
  });

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FraudAlert.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraudAlerts'] });
      setSelectedAlert(null);
      setResolutionNotes('');
    },
  });

  const handleResolve = (status) => {
    if (!selectedAlert) return;
    updateAlertMutation.mutate({
      id: selectedAlert.id,
      data: {
        status,
        resolution_notes: resolutionNotes,
        reviewed_date: new Date().toISOString().split('T')[0],
      }
    });
  };

  // Stats
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'new').length;
  const highRiskCases = cases.filter(c => c.fraud_score > 70).length;
  const avgFraudScore = cases.length > 0 
    ? Math.round(cases.reduce((sum, c) => sum + (c.fraud_score || 0), 0) / cases.filter(c => c.fraud_score).length)
    : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Fraud Monitor
          </h1>
          <p className="text-slate-500 mt-1">
            AI-powered continuous fraud detection and risk monitoring
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-red-700">{criticalAlerts}</p>
              <p className="text-sm text-red-600">Critical Alerts</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{alerts.filter(a => a.status === 'new').length}</p>
              <p className="text-sm text-slate-500">Pending Review</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Network className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{highRiskCases}</p>
              <p className="text-sm text-slate-500">High-Risk Cases</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <FraudScoreGauge score={avgFraudScore} size="sm" />
          <p className="text-sm text-center text-slate-500 mt-2">Portfolio Avg</p>
        </Card>
      </div>

      {/* Alerts Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle>Fraud Alerts</CardTitle>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="investigating">Investigating</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const typeConfig = alertTypeConfig[alert.alert_type] || alertTypeConfig.phone_validation;
                const TypeIcon = typeConfig.icon;
                const severity = severityConfig[alert.severity] || severityConfig.medium;

                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className="flex items-center justify-between p-4 rounded-xl bg-white border hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        alert.severity === 'critical' ? 'bg-red-100' :
                        alert.severity === 'high' ? 'bg-orange-100' : 'bg-slate-100'
                      }`}>
                        <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{typeConfig.label}</p>
                          <Badge variant="outline" className={severity.color}>
                            {severity.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-1">{alert.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">
                          {alert.ai_confidence}% confidence
                        </p>
                        <p className="text-xs text-slate-500">
                          {alert.created_date && format(new Date(alert.created_date), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-900">No {statusFilter === 'all' ? '' : statusFilter} alerts</p>
              <p className="text-slate-500">Your portfolio is looking clean</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Alert Details
            </DialogTitle>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={severityConfig[selectedAlert.severity]?.color}>
                  {selectedAlert.severity?.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {alertTypeConfig[selectedAlert.alert_type]?.label}
                </Badge>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-700">{selectedAlert.description}</p>
              </div>

              {selectedAlert.evidence && (
                <div>
                  <h4 className="font-medium mb-2">Evidence</h4>
                  <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">{selectedAlert.evidence}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">AI Confidence</p>
                  <p className="font-medium">{selectedAlert.ai_confidence}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Detection Method</p>
                  <p className="font-medium">{selectedAlert.detection_method || 'AI Analysis'}</p>
                </div>
              </div>

              {selectedAlert.status === 'new' || selectedAlert.status === 'investigating' ? (
                <div className="space-y-3 pt-4 border-t">
                  <Textarea
                    placeholder="Add resolution notes..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleResolve('dismissed')}
                      disabled={updateAlertMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Dismiss
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleResolve('investigating')}
                      disabled={updateAlertMutation.isPending}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Investigate
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => handleResolve('confirmed')}
                      disabled={updateAlertMutation.isPending}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Confirm Fraud
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Resolved on {selectedAlert.reviewed_date}</span>
                  </div>
                  {selectedAlert.resolution_notes && (
                    <p className="mt-2 text-sm text-slate-500">{selectedAlert.resolution_notes}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Client Case Profile Modal */}
      <ClientCaseProfile
        caseId={selectedCaseId}
        open={!!selectedCaseId}
        onOpenChange={(open) => !open && setSelectedCaseId(null)}
      />
    </div>
  );
}