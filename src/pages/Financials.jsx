import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  Calculator
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format } from 'date-fns';

export default function Financials() {
  const [timeRange, setTimeRange] = useState('6m');

  const { data: cases = [] } = useQuery({
    queryKey: ['casesForFinance'],
    queryFn: () => base44.entities.Case.list('-created_date', 500),
  });

  const { data: financialRecords = [] } = useQuery({
    queryKey: ['financialRecords'],
    queryFn: () => base44.entities.FinancialRecord.list('-created_date', 500),
  });

  // Calculate financial metrics
  const totalPortfolioValue = cases.reduce((sum, c) => {
    const avg = ((c.estimated_value_low || 0) + (c.estimated_value_high || 0)) / 2;
    return sum + avg;
  }, 0);

  const settledCases = cases.filter(c => c.status === 'settlement');
  const totalSettlements = settledCases.reduce((sum, c) => sum + ((c.estimated_value_low || 0) + (c.estimated_value_high || 0)) / 2, 0);

  const totalCosts = financialRecords
    .filter(r => r.record_type === 'cost' || r.record_type === 'expense')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const totalRevenue = financialRecords
    .filter(r => r.record_type === 'settlement' || r.record_type === 'fee')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const roi = totalCosts > 0 ? ((totalRevenue - totalCosts) / totalCosts * 100).toFixed(1) : 0;

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Portfolio by case type
  const caseTypeBreakdown = cases.reduce((acc, c) => {
    const type = c.case_type || 'other';
    const value = ((c.estimated_value_low || 0) + (c.estimated_value_high || 0)) / 2;
    acc[type] = (acc[type] || 0) + value;
    return acc;
  }, {});

  const pieData = Object.entries(caseTypeBreakdown).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Monthly trend data
  const monthlyData = [
    { month: 'Jan', value: 2400000, costs: 180000 },
    { month: 'Feb', value: 3200000, costs: 220000 },
    { month: 'Mar', value: 2800000, costs: 190000 },
    { month: 'Apr', value: 4100000, costs: 280000 },
    { month: 'May', value: 3600000, costs: 240000 },
    { month: 'Jun', value: 4800000, costs: 320000 },
  ];

  // Cost breakdown
  const costBreakdown = financialRecords
    .filter(r => r.record_type === 'cost' || r.record_type === 'expense')
    .reduce((acc, r) => {
      const cat = r.category || 'other';
      acc[cat] = (acc[cat] || 0) + (r.amount || 0);
      return acc;
    }, {});

  const costBarData = Object.entries(costBreakdown)
    .slice(0, 6)
    .map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).slice(0, 12),
      value
    }));

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-emerald-600" />
            Financial Intelligence
          </h1>
          <p className="text-slate-500 mt-1">
            Portfolio valuation, ROI tracking, and financial forecasting
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="1m">1M</TabsTrigger>
              <TabsTrigger value="3m">3M</TabsTrigger>
              <TabsTrigger value="6m">6M</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Portfolio Value</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(totalPortfolioValue)}</p>
              <div className="flex items-center gap-1 mt-2 text-emerald-100">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm">+12.5% vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Settlements</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(totalSettlements)}</p>
              <div className="flex items-center gap-1 mt-2 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">{settledCases.length} cases settled</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Costs</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(totalCosts)}</p>
              <div className="flex items-center gap-1 mt-2 text-slate-500">
                <Receipt className="w-4 h-4" />
                <span className="text-sm">{financialRecords.filter(r => r.record_type === 'cost').length} transactions</span>
              </div>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <Receipt className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Portfolio ROI</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{roi}%</p>
              <div className={`flex items-center gap-1 mt-2 ${Number(roi) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {Number(roi) > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm">Return on investment</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Calculator className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Trend */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Portfolio Value Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#valueGradient)"
                    name="Portfolio Value"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Breakdown */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Portfolio by Case Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown & Top Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Cost Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tickFormatter={formatCurrency} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Cases by Value */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Top Cases by Estimated Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cases
                .sort((a, b) => {
                  const aVal = ((a.estimated_value_high || 0) + (a.estimated_value_low || 0)) / 2;
                  const bVal = ((b.estimated_value_high || 0) + (b.estimated_value_low || 0)) / 2;
                  return bVal - aVal;
                })
                .slice(0, 5)
                .map((c, index) => {
                  const value = ((c.estimated_value_low || 0) + (c.estimated_value_high || 0)) / 2;
                  return (
                    <div key={c.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-amber-100 text-amber-700' :
                          index === 1 ? 'bg-slate-200 text-slate-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{c.claimant_name}</p>
                          <p className="text-xs text-slate-500">{c.tort_campaign || c.case_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{formatCurrency(value)}</p>
                        <Badge variant="outline" className="text-xs">
                          {c.settlement_probability || '--'}% prob
                        </Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}