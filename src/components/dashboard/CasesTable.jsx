import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  intake:        { label: 'Intake',        color: 'bg-slate-100 text-slate-700',   icon: Clock },
  qualification: { label: 'Qualification', color: 'bg-blue-100 text-blue-700',     icon: Clock },
  signed:        { label: 'Signed',        color: 'bg-indigo-100 text-indigo-700', icon: FileText },
  active:        { label: 'Active',        color: 'bg-emerald-100 text-emerald-700',icon: CheckCircle },
  discovery:     { label: 'Discovery',     color: 'bg-purple-100 text-purple-700', icon: FileText },
  trial_prep:    { label: 'Trial Prep',    color: 'bg-amber-100 text-amber-700',   icon: AlertTriangle },
  settlement:    { label: 'Settlement',    color: 'bg-green-100 text-green-700',   icon: CheckCircle },
  closed:        { label: 'Closed',        color: 'bg-slate-100 text-slate-700',   icon: CheckCircle },
  dismissed:     { label: 'Dismissed',     color: 'bg-red-100 text-red-700',       icon: XCircle },
  rejected:      { label: 'Rejected',      color: 'bg-red-100 text-red-700',       icon: XCircle },
};

const priorityConfig = {
  critical: 'bg-red-500 text-white',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-slate-100 text-slate-600',
};

const scoreColor = (score) =>
  score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';

export default function CasesTable({ cases = [], compact = false }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="font-semibold text-slate-600">Case</TableHead>
            <TableHead className="font-semibold text-slate-600">Claimant</TableHead>
            <TableHead className="font-semibold text-slate-600">Type</TableHead>
            <TableHead className="font-semibold text-slate-600">Status</TableHead>
            {!compact && <TableHead className="font-semibold text-slate-600">Strength</TableHead>}
            {!compact && <TableHead className="font-semibold text-slate-600">Credibility</TableHead>}
            {!compact && <TableHead className="font-semibold text-slate-600">Settlement</TableHead>}
            {!compact && <TableHead className="font-semibold text-slate-600">Est. Value</TableHead>}
            <TableHead className="font-semibold text-slate-600">Intake Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((c) => {
            const status = statusConfig[c.status] || statusConfig.intake;
            const StatusIcon = status.icon;
            const detailUrl = createPageUrl(`CaseDetail?id=${c.id}`);

            return (
              <TableRow
                key={c.id}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigate(detailUrl)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {c.priority && (
                      <Badge variant="outline" className={`${priorityConfig[c.priority] || priorityConfig.medium} text-[10px] px-1.5 py-0`}>
                        {c.priority.charAt(0).toUpperCase()}
                      </Badge>
                    )}
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {c.case_number || `CASE-${c.id?.slice(0, 6).toUpperCase()}`}
                      </p>
                      <p className="text-xs text-slate-500">{c.tort_campaign || c.case_type?.replace(/_/g, ' ') || '—'}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <p className="font-medium text-slate-900 text-sm">{c.claimant_name || '—'}</p>
                  {c.claimant_email && (
                    <p className="text-xs text-slate-500">{c.claimant_email}</p>
                  )}
                </TableCell>

                <TableCell>
                  <span className="text-sm text-slate-600 capitalize">
                    {c.case_type?.replace(/_/g, ' ') || '—'}
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
                    {c.case_strength_score != null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${c.case_strength_score >= 80 ? 'bg-emerald-500' : c.case_strength_score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${c.case_strength_score}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${scoreColor(c.case_strength_score)}`}>
                          {c.case_strength_score}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </TableCell>
                )}

                {!compact && (
                  <TableCell>
                    {c.credibility_score != null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${c.credibility_score >= 80 ? 'bg-emerald-500' : c.credibility_score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${c.credibility_score}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${scoreColor(c.credibility_score)}`}>
                          {c.credibility_score}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </TableCell>
                )}

                {!compact && (
                  <TableCell>
                    {c.settlement_probability != null ? (
                      <span className={`text-sm font-medium ${scoreColor(c.settlement_probability)}`}>
                        {c.settlement_probability}%
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </TableCell>
                )}

                {!compact && (
                  <TableCell>
                    {c.estimated_value_low && c.estimated_value_high ? (
                      <span className="text-sm font-medium text-slate-900">
                        ${(c.estimated_value_low / 1000).toFixed(0)}K–${(c.estimated_value_high / 1000).toFixed(0)}K
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </TableCell>
                )}

                <TableCell>
                  <span className="text-sm text-slate-600">
                    {c.intake_date ? format(new Date(c.intake_date), 'MMM d, yyyy') : '—'}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}

          {cases.length === 0 && (
            <TableRow>
              <TableCell colSpan={compact ? 5 : 9} className="text-center py-12 text-slate-500">
                No cases found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
