import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ClientCaseProfile from '../components/cases/ClientCaseProfile';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MetricCard from '../components/dashboard/MetricCard';
import CasesTable from '../components/dashboard/CasesTable';
import {
  FolderOpen,
  DollarSign,
  Shield,
  AlertTriangle,
  Brain,
  Clock,
  CheckCircle,
  ArrowRight,
  Plus,
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [user, setUser] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await apiClient.auth.me();
        setUser(userData);
      } catch (e) {
        console.log('User not logged in');
      }
    };
    loadUser();
  }, []);

  const { data: cases = [], isLoading: casesLoading, refetch: refetchCases } = useQuery({
    queryKey: ['cases'],
    queryFn: () => apiClient.entities.Case.list('-created_date', 100),
  });

  const { data: fraudAlerts = [] } = useQuery({
    queryKey: ['fraudAlerts'],
    queryFn: () => apiClient.entities.FraudAlert.filter({ status: 'new' }, '-created_date', 10),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiClient.entities.Task.filter({ status: 'pending' }, '-created_date', 10),
  });

  // Calculate metrics
  const activeCases = cases.filter(c => ['active', 'discovery', 'trial_prep', 'settlement'].includes(c.status)).length;
  const intakeCases = cases.filter(c => ['intake', 'qualification'].includes(c.status)).length;
  const settledCases = cases.filter(c => c.status === 'settlement').length;
  const totalEstimatedValue = cases.reduce((sum, c) => sum + ((c.estimated_value_low || 0) + (c.estimated_value_high || 0)) / 2, 0);
  const avgCaseStrength = cases.length > 0 
    ? Math.round(cases.reduce((sum, c) => sum + (c.case_strength_score || 0), 0) / cases.filter(c => c.case_strength_score).length) 
    : 0;

  const recentCases = cases.slice(0, 5);
  const highPriorityCases = cases.filter(c => c.priority === 'critical' || c.priority === 'high').slice(0, 5);

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Command Center
          </h1>
          <p className="text-slate-500 mt-1">
            {user ? `Welcome back, ${user.full_name?.split(' ')[0]}` : 'Welcome back'}. Here's your firm's intelligence overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList className="bg-white border shadow-sm">
              <TabsTrigger value="7d" className="text-sm">7D</TabsTrigger>
              <TabsTrigger value="30d" className="text-sm">30D</TabsTrigger>
              <TabsTrigger value="90d" className="text-sm">90D</TabsTrigger>
              <TabsTrigger value="1y" className="text-sm">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon" onClick={() => refetchCases()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Link to={createPageUrl('IntakeHub')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Intake
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Cases"
          value={activeCases.toLocaleString()}
          subtitle={`${intakeCases} in intake`}
          trend="+12% vs last month"
          trendDirection="up"
          icon={FolderOpen}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <MetricCard
          title="Portfolio Value"
          value={formatCurrency(totalEstimatedValue)}
          subtitle="Estimated settlements"
          trend="+8.2% growth"
          trendDirection="up"
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <MetricCard
          title="Avg. Case Strength"
          value={`${avgCaseStrength || '--'}`}
          subtitle="AI-assessed score"
          trend={avgCaseStrength >= 70 ? 'Strong portfolio' : 'Review needed'}
          trendDirection={avgCaseStrength >= 70 ? 'up' : 'neutral'}
          icon={Brain}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <MetricCard
          title="Fraud Alerts"
          value={fraudAlerts.length}
          subtitle="Pending review"
          trend={fraudAlerts.length > 0 ? 'Action required' : 'All clear'}
          trendDirection={fraudAlerts.length > 0 ? 'down' : 'up'}
          icon={Shield}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Cases</CardTitle>
                <p className="text-sm text-slate-500">Latest intake and case updates</p>
              </div>
              <Link to={createPageUrl('Cases')}>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <CasesTable cases={recentCases} compact />
            </CardContent>
          </Card>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* High Priority Cases */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Priority Cases
                </CardTitle>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {highPriorityCases.length} items
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {highPriorityCases.slice(0, 4).map((caseItem) => (
                <div 
                  key={caseItem.id} 
                  className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedCaseId(caseItem.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{caseItem.claimant_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{caseItem.tort_campaign || caseItem.case_type}</p>
                    </div>
                    <Badge className={caseItem.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                      {caseItem.priority}
                    </Badge>
                  </div>
                </div>
              ))}
              {highPriorityCases.length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No high-priority cases</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Pending Tasks
                </CardTitle>
                <Badge variant="outline">{tasks.length} items</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'critical' ? 'bg-red-500' :
                    task.priority === 'high' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.task_type?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-500">No pending tasks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Client Case Profile Modal */}
      <ClientCaseProfile
        caseId={selectedCaseId}
        open={!!selectedCaseId}
        onOpenChange={(open) => !open && setSelectedCaseId(null)}
      />
    </div>
  );
}