import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  Brain,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d');

  const { data: cases = [] } = useQuery({
    queryKey: ['casesForAnalytics'],
    queryFn: () => apiClient.entities.Case.list('-created_date', 1000),
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictionsForAnalytics'],
    queryFn: () => apiClient.entities.Prediction.list('-created_date', 500),
  });

  // Calculate metrics
  const totalCases = cases.length;
  const activeCases = cases.filter(c => ['active', 'discovery', 'trial_prep'].includes(c.status)).length;
  const conversionRate = totalCases > 0 
    ? ((cases.filter(c => c.status !== 'rejected' && c.status !== 'intake').length / totalCases) * 100).toFixed(1)
    : 0;
  const avgCycleTime = 45; // Placeholder - would calculate from actual data
  const avgCaseStrength = cases.length > 0
    ? Math.round(cases.reduce((sum, c) => sum + (c.case_strength_score || 0), 0) / cases.filter(c => c.case_strength_score).length) || 0
    : 0;

  // Case status distribution
  const statusDistribution = cases.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusDistribution).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value
  }));

  // Case type distribution
  const typeDistribution = cases.reduce((acc, c) => {
    const type = c.case_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(typeDistribution).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value
  }));

  // Monthly intake trend (mock data)
  const intakeTrend = [
    { month: 'Jan', intakes: 120, qualified: 85, rejected: 35 },
    { month: 'Feb', intakes: 145, qualified: 102, rejected: 43 },
    { month: 'Mar', intakes: 132, qualified: 95, rejected: 37 },
    { month: 'Apr', intakes: 178, qualified: 128, rejected: 50 },
    { month: 'May', intakes: 165, qualified: 118, rejected: 47 },
    { month: 'Jun', intakes: 198, qualified: 142, rejected: 56 },
  ];

  // AI Score distribution
  const scoreDistribution = [
    { range: '0-20', count: cases.filter(c => c.case_strength_score && c.case_strength_score <= 20).length },
    { range: '21-40', count: cases.filter(c => c.case_strength_score > 20 && c.case_strength_score <= 40).length },
    { range: '41-60', count: cases.filter(c => c.case_strength_score > 40 && c.case_strength_score <= 60).length },
    { range: '61-80', count: cases.filter(c => c.case_strength_score > 60 && c.case_strength_score <= 80).length },
    { range: '81-100', count: cases.filter(c => c.case_strength_score > 80).length },
  ];

  // Lead source breakdown
  const sourceBreakdown = cases.reduce((acc, c) => {
    const source = c.intake_source || 'unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const sourceData = Object.entries(sourceBreakdown).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Analytics & Insights
          </h1>
          <p className="text-slate-500 mt-1">
            Comprehensive analytics and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="90d">90D</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Cases</p>
              <p className="text-2xl font-bold text-slate-900">{totalCases.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-sm">
            <ArrowUpRight className="w-4 h-4" />
            <span>+18.2%</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Cases</p>
              <p className="text-2xl font-bold text-slate-900">{activeCases}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Target className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-sm">
            <ArrowUpRight className="w-4 h-4" />
            <span>+12.5%</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-slate-900">{conversionRate}%</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-sm">
            <ArrowUpRight className="w-4 h-4" />
            <span>+5.3%</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Avg. Cycle Time</p>
              <p className="text-2xl font-bold text-slate-900">{avgCycleTime}d</p>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-sm">
            <ArrowDownRight className="w-4 h-4" />
            <span>-8 days</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Avg. AI Score</p>
              <p className="text-2xl font-bold text-slate-900">{avgCaseStrength}</p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Brain className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-sm">
            <ArrowUpRight className="w-4 h-4" />
            <span>+3.2 pts</span>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intake Trend */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Intake & Qualification Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={intakeTrend}>
                  <defs>
                    <linearGradient id="intakeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="qualifiedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="intakes"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#intakeGradient)"
                    name="Total Intakes"
                  />
                  <Area
                    type="monotone"
                    dataKey="qualified"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#qualifiedGradient)"
                    name="Qualified"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Case Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Case Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Score Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>AI Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Cases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lead Source */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Lead Source Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Cases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Case Type Breakdown */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Case Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {typeData.map((type, index) => (
              <div key={type.name} className="text-center p-4 bg-slate-50 rounded-xl">
                <div 
                  className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
                >
                  <span 
                    className="text-lg font-bold"
                    style={{ color: COLORS[index % COLORS.length] }}
                  >
                    {type.value}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-900">{type.name}</p>
                <p className="text-xs text-slate-500">
                  {totalCases > 0 ? ((type.value / totalCases) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}