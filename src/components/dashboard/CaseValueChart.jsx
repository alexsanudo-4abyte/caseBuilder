import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function CaseValueChart({ data = [] }) {
  const defaultData = [
    { month: 'Jan', value: 2400000, cases: 45 },
    { month: 'Feb', value: 3200000, cases: 52 },
    { month: 'Mar', value: 2800000, cases: 48 },
    { month: 'Apr', value: 4100000, cases: 67 },
    { month: 'May', value: 3600000, cases: 58 },
    { month: 'Jun', value: 4800000, cases: 72 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  const formatValue = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-900 mb-2">{label}</p>
          <p className="text-sm text-slate-600">
            Portfolio Value: <span className="font-semibold text-blue-600">{formatValue(payload[0].value)}</span>
          </p>
          {payload[0].payload.cases && (
            <p className="text-sm text-slate-600">
              Active Cases: <span className="font-semibold">{payload[0].payload.cases}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-900">Portfolio Value Trend</CardTitle>
        <p className="text-sm text-slate-500">Estimated case portfolio value over time</p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={formatValue}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#valueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}