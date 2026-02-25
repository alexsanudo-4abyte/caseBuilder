import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CasesTable from '../components/dashboard/CasesTable';
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Grid3X3,
  List,
  SlidersHorizontal,
  X
} from 'lucide-react';

export default function Cases() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: () => apiClient.entities.Case.list('-created_date', 500),
  });

  // Filter cases
  const filteredCases = cases.filter(c => {
    const matchesSearch = !searchQuery || 
      c.claimant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tort_campaign?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesType = typeFilter === 'all' || c.case_type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const statusCounts = {
    all: cases.length,
    intake: cases.filter(c => c.status === 'intake').length,
    qualification: cases.filter(c => c.status === 'qualification').length,
    signed: cases.filter(c => c.status === 'signed').length,
    active: cases.filter(c => c.status === 'active').length,
    discovery: cases.filter(c => c.status === 'discovery').length,
    settlement: cases.filter(c => c.status === 'settlement').length,
    closed: cases.filter(c => c.status === 'closed').length,
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPriorityFilter('all');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all';

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Case Management</h1>
          <p className="text-slate-500 mt-1">
            {filteredCases.length.toLocaleString()} cases • {cases.filter(c => c.status === 'active').length} active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link to={createPageUrl('IntakeHub')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Case
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="bg-white border shadow-sm h-auto p-1 flex-wrap">
          <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            All <Badge variant="secondary" className="ml-2 bg-slate-100">{statusCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="intake">
            Intake <Badge variant="secondary" className="ml-2">{statusCounts.intake}</Badge>
          </TabsTrigger>
          <TabsTrigger value="qualification">
            Qualification <Badge variant="secondary" className="ml-2">{statusCounts.qualification}</Badge>
          </TabsTrigger>
          <TabsTrigger value="signed">
            Signed <Badge variant="secondary" className="ml-2">{statusCounts.signed}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active">
            Active <Badge variant="secondary" className="ml-2">{statusCounts.active}</Badge>
          </TabsTrigger>
          <TabsTrigger value="discovery">
            Discovery <Badge variant="secondary" className="ml-2">{statusCounts.discovery}</Badge>
          </TabsTrigger>
          <TabsTrigger value="settlement">
            Settlement <Badge variant="secondary" className="ml-2">{statusCounts.settlement}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, case number, or campaign..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Case Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mass_tort">Mass Tort</SelectItem>
                  <SelectItem value="personal_injury">Personal Injury</SelectItem>
                  <SelectItem value="product_liability">Product Liability</SelectItem>
                  <SelectItem value="medical_malpractice">Medical Malpractice</SelectItem>
                  <SelectItem value="auto_accident">Auto Accident</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="text-slate-500">
                  <X className="w-4 h-4 mr-1" />
                  Clear filters
                </Button>
              )}

              {/* View Toggle */}
              <div className="flex items-center border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('table')}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : viewMode === 'table' ? (
            <CasesTable cases={filteredCases} showActions />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredCases.map((caseItem) => (
                <CaseCard key={caseItem.id} caseItem={caseItem} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CaseCard({ caseItem }) {
  const priorityColors = {
    critical: 'bg-red-500 text-white',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-slate-100 text-slate-600',
  };

  return (
    <Link to={createPageUrl(`CaseDetail?id=${caseItem.id}`)}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <Badge className={priorityColors[caseItem.priority] || priorityColors.medium}>
              {caseItem.priority}
            </Badge>
            <span className="text-xs text-slate-500">{caseItem.case_number || `#${caseItem.id?.slice(0,6)}`}</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">{caseItem.claimant_name}</h3>
          <p className="text-sm text-slate-500 mb-3">{caseItem.tort_campaign || caseItem.case_type?.replace(/_/g, ' ')}</p>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">AI Score</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    caseItem.case_strength_score >= 80 ? 'bg-emerald-500' :
                    caseItem.case_strength_score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${caseItem.case_strength_score || 0}%` }}
                />
              </div>
              <span className="font-medium">{caseItem.case_strength_score || '--'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}