import React, { useState } from 'react';
import { PolicyValidationResult } from '../../types/meals';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface PolicyAlertBadgeProps {
  results: PolicyValidationResult[];
  showDetailsDefault?: boolean;
  compact?: boolean;
}

export const PolicyAlertBadge: React.FC<PolicyAlertBadgeProps> = ({
  results,
  showDetailsDefault = false,
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetailsDefault);

  if (!results || results.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Compliant</span>
      </span>
    );
  }

  const hasViolation = results.some(r => r.severity === 'VIOLATION');
  const hasWarning = !hasViolation && results.some(r => r.severity === 'WARNING');

  const badgeConfig = hasViolation
    ? {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
        label: 'Policy Violation',
        count: results.filter(r => r.severity === 'VIOLATION').length
      }
    : hasWarning
    ? {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
        label: 'Policy Caution',
        count: results.filter(r => r.severity === 'WARNING').length
      }
    : {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        label: 'Policy Compliant',
        count: 0
      };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badgeConfig.bg} ${badgeConfig.text} border ${badgeConfig.border}`}
        >
          {badgeConfig.icon}
          <span>{badgeConfig.label}</span>
          {badgeConfig.count > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white font-bold shadow-xs">
              {badgeConfig.count}
            </span>
          )}
        </div>

        {!compact && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            <span>{isExpanded ? 'Hide Evidence' : 'View Clinical Audit'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {isExpanded && !compact && (
        <div className="mt-2.5 space-y-2 border-t border-slate-100 pt-2 text-xs">
          {results.map((res, idx) => {
            const isV = res.severity === 'VIOLATION';
            const isW = res.severity === 'WARNING';
            const itemBg = isV ? 'bg-rose-50/70 border-rose-200' : isW ? 'bg-amber-50/70 border-amber-200' : 'bg-emerald-50/60 border-emerald-200';
            const itemText = isV ? 'text-rose-900' : isW ? 'text-amber-900' : 'text-emerald-900';

            return (
              <div key={idx} className={`p-2.5 rounded-lg border ${itemBg} ${itemText}`}>
                <div className="flex items-start justify-between font-semibold">
                  <span>{res.ruleName}</span>
                  <span className="font-mono text-[11px] font-bold">
                    {res.actualValue} {res.unit} / limit {res.threshold} {res.unit}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-700">
                  {res.message}
                </p>
                <div className="mt-1.5 pt-1 border-t border-slate-200/50 flex items-start gap-1.5 text-[11px] font-medium text-clinical-navy">
                  <Sparkles className="w-3.5 h-3.5 text-clinical-teal shrink-0 mt-0.5" />
                  <span>{res.correctiveGuidance}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
