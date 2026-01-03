import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ClientCaseProfile from '../cases/ClientCaseProfile';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  MoreHorizontal, 
  Eye, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

const statusConfig = {
  intake: { label: 'Intake', color: 'bg-slate-100 text-slate-700', icon: Clock },
  qualification: { label: 'Qualification', color: 'bg-blue-100 text-blue-700', icon: Clock },
  signed: { label: 'Signed', color: 'bg-indigo-100 text-indigo-700', icon: FileText },
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  discovery: { label: 'Discovery', color: 'bg-purple-100 text-purple-700', icon: FileText },
  trial_prep: { label: 'Trial Prep', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  settlement: { label: 'Settlement', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-slate-100 text-slate-700', icon: CheckCircle },
  dismissed: { label: 'Dismissed', color: 'bg-red-100 text-red-700', icon: XCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const priorityConfig = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-slate-100 text-slate-600',
};

export default function CasesTable({ cases = [], showActions = true, compact = false }) {
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="font-semibold text-slate-600">Case</TableHead>
            <TableHead className="font-semibold text-slate-600">Claimant</TableHead>
            <TableHead className="font-semibold text-slate-600">Type</TableHead>
            <TableHead className="font-semibold text-slate-600">Status</TableHead>
            {!compact && <TableHead className="font-semibold text-slate-600">AI Score</TableHead>}
            {!compact && <TableHead className="font-semibold text-slate-600">Est. Value</TableHead>}
            <TableHead className="font-semibold text-slate-600">Date</TableHead>
            {showActions && <TableHead className="w-10"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((caseItem) => {
            const status = statusConfig[caseItem.status] || statusConfig.intake;
            const StatusIcon = status.icon;
            
            return (
              <TableRow 
                key={caseItem.id} 
                className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() => setSelectedCaseId(caseItem.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={priorityConfig[caseItem.priority] || priorityConfig.medium}>
                      {caseItem.priority?.charAt(0).toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium text-slate-900">{caseItem.case_number || `CASE-${caseItem.id?.slice(0,6)}`}</p>
                      <p className="text-xs text-slate-500">{caseItem.tort_campaign || caseItem.case_type}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-900">{caseItem.claimant_name}</p>
                    <p className="text-xs text-slate-500">{caseItem.claimant_email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-600 capitalize">
                    {caseItem.case_type?.replace(/_/g, ' ')}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={`${status.color} border-0 gap-1`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </Badge>
                </TableCell>
                {!compact && (
                  <TableCell>
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
                      <span className={`text-sm font-medium ${getScoreColor(caseItem.case_strength_score)}`}>
                        {caseItem.case_strength_score || '--'}
                      </span>
                    </div>
                  </TableCell>
                )}
                {!compact && (
                  <TableCell>
                    {caseItem.estimated_value_low && caseItem.estimated_value_high ? (
                      <span className="text-sm font-medium text-slate-900">
                        ${(caseItem.estimated_value_low / 1000).toFixed(0)}K - ${(caseItem.estimated_value_high / 1000).toFixed(0)}K
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">Pending</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <span className="text-sm text-slate-600">
                    {caseItem.intake_date ? format(new Date(caseItem.intake_date), 'MMM d, yyyy') : '--'}
                  </span>
                </TableCell>
                {showActions && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCaseId(caseItem.id);
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          Quick View
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl(`CaseDetail?id=${caseItem.id}`)}>
                            <ArrowUpRight className="w-4 h-4 mr-2" />
                            Full Details Page
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="w-4 h-4 mr-2" />
                          Documents
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          {cases.length === 0 && (
            <TableRow>
              <TableCell colSpan={showActions ? 8 : 7} className="text-center py-12">
                <p className="text-slate-500">No cases found</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Client Case Profile Modal */}
      <ClientCaseProfile
        caseId={selectedCaseId}
        open={!!selectedCaseId}
        onOpenChange={(open) => !open && setSelectedCaseId(null)}
      />
    </div>
  );
}