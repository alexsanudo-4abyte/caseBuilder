import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Target,
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Loader2,
  ArrowRight,
  Calendar,
  Scale
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function Campaigns() {
  const [newCampaignOpen, setNewCampaignOpen] = useState(false);
  const queryClient = useQueryClient();

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    status: 'active',
    description: '',
    qualifying_criteria: [],
    defendants: [],
    statute_of_limitations_info: '',
    mdl_info: '',
    estimated_avg_settlement: 0
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.TortCampaign.list('-created_date', 50),
  });

  const { data: cases = [] } = useQuery({
    queryKey: ['casesForCampaigns'],
    queryFn: () => base44.entities.Case.list('-created_date', 1000),
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data) => base44.entities.TortCampaign.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setNewCampaignOpen(false);
      setNewCampaign({
        name: '',
        status: 'active',
        description: '',
        qualifying_criteria: [],
        defendants: [],
        statute_of_limitations_info: '',
        mdl_info: '',
        estimated_avg_settlement: 0
      });
    },
  });

  // Calculate campaign stats
  const campaignsWithStats = campaigns.map(campaign => {
    const campaignCases = cases.filter(c => c.tort_campaign === campaign.name);
    return {
      ...campaign,
      total_cases: campaignCases.length,
      qualified_cases: campaignCases.filter(c => c.qualifying_criteria_met).length,
      settled_cases: campaignCases.filter(c => c.status === 'settlement').length,
      total_value: campaignCases.reduce((sum, c) => sum + ((c.estimated_value_low || 0) + (c.estimated_value_high || 0)) / 2, 0)
    };
  });

  const totalCases = campaignsWithStats.reduce((sum, c) => sum + c.total_cases, 0);
  const totalSettled = campaignsWithStats.reduce((sum, c) => sum + c.settled_cases, 0);
  const totalValue = campaignsWithStats.reduce((sum, c) => sum + c.total_value, 0);

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const chartData = campaignsWithStats.slice(0, 8).map(c => ({
    name: c.name.length > 15 ? c.name.slice(0, 15) + '...' : c.name,
    cases: c.total_cases,
    settled: c.settled_cases
  }));

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    paused: 'bg-amber-100 text-amber-700 border-amber-200',
    closed: 'bg-slate-100 text-slate-700 border-slate-200',
    settlement_phase: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Target className="w-8 h-8 text-indigo-600" />
            Tort Campaigns
          </h1>
          <p className="text-slate-500 mt-1">
            Manage mass tort campaigns and track qualification rates
          </p>
        </div>
        <Dialog open={newCampaignOpen} onOpenChange={setNewCampaignOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Tort Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Campaign Name *</Label>
                <Input
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g., Camp Lejeune Water Contamination"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={newCampaign.status} 
                  onValueChange={(v) => setNewCampaign({ ...newCampaign, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="settlement_phase">Settlement Phase</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  placeholder="Brief description of the tort campaign..."
                />
              </div>
              <div>
                <Label>Estimated Avg. Settlement</Label>
                <Input
                  type="number"
                  value={newCampaign.estimated_avg_settlement}
                  onChange={(e) => setNewCampaign({ ...newCampaign, estimated_avg_settlement: Number(e.target.value) })}
                  placeholder="150000"
                />
              </div>
              <div>
                <Label>MDL Information</Label>
                <Input
                  value={newCampaign.mdl_info}
                  onChange={(e) => setNewCampaign({ ...newCampaign, mdl_info: e.target.value })}
                  placeholder="MDL No. 1234, Eastern District of PA"
                />
              </div>
              <Button 
                className="w-full"
                onClick={() => createCampaignMutation.mutate(newCampaign)}
                disabled={!newCampaign.name || createCampaignMutation.isPending}
              >
                {createCampaignMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Target className="w-4 h-4 mr-2" />
                )}
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500 rounded-xl">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-indigo-700">{campaigns.length}</p>
              <p className="text-sm text-indigo-600">Active Campaigns</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{totalCases.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Total Cases</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{totalSettled.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Settled Cases</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalValue)}</p>
              <p className="text-sm text-slate-500">Portfolio Value</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Campaign Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Cases by Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="cases" fill="#6366f1" name="Total Cases" radius={[4, 4, 0, 0]} />
                <Bar dataKey="settled" fill="#10b981" name="Settled" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </Card>
          ))
        ) : campaignsWithStats.length > 0 ? (
          campaignsWithStats.map((campaign) => (
            <Card key={campaign.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                    {campaign.mdl_info && (
                      <p className="text-xs text-slate-500 mt-1">{campaign.mdl_info}</p>
                    )}
                  </div>
                  <Badge className={statusColors[campaign.status]}>
                    {campaign.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>

                {campaign.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{campaign.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{campaign.total_cases}</p>
                    <p className="text-xs text-slate-500">Total Cases</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">{campaign.qualified_cases}</p>
                    <p className="text-xs text-slate-500">Qualified</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-slate-500">Est. Value</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(campaign.total_value)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Avg. Settlement</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(campaign.estimated_avg_settlement || 0)}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-12 text-center">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900">No campaigns yet</p>
            <p className="text-slate-500 mb-4">Create your first tort campaign to get started</p>
            <Button onClick={() => setNewCampaignOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}