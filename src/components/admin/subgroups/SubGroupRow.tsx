import React from 'react';
import { Users, Check, Eye, X } from 'lucide-react';
import { SubGroup } from '@/lib/subgroup-service';
import { TYPE_ICONS, TYPE_LABELS, STATUS_CONFIG } from './SubGroupConstants';

interface SubGroupRowProps {
  subGroup: SubGroup;
  onApprove: () => void;
  onReject: () => void;
  onView: () => void;
  processing: boolean;
}

export function SubGroupRow({
  subGroup,
  onApprove,
  onReject,
  onView,
  processing
}: SubGroupRowProps) {
  const statusConfig = STATUS_CONFIG[subGroup.status];
  const typeIcon = TYPE_ICONS[subGroup.type];
  const typeLabel = TYPE_LABELS[subGroup.type];

  return (
    <div className="group bg-white hover:bg-slate-50/80 transition-all duration-300">
      {/* Main Row - Tappable */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer active:scale-[0.99] transition-transform"
        onClick={onView}
      >
        {/* Icon with gradient */}
        <div className={`w-14 h-14 lg:w-12 lg:h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${subGroup.status === 'active'
          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-100'
          : subGroup.status === 'pending'
            ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-100'
            : 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-100'
          }`}>
          <div className="text-white">
            {React.isValidElement(typeIcon) && React.cloneElement(typeIcon as React.ReactElement<any>, { className: "w-6 h-6" })}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-black text-slate-900 truncate tracking-tight text-base">{subGroup.name}</h3>
            {subGroup.status === 'active' && (
              <div className="flex-shrink-0 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm shadow-emerald-200">
                <Check className="text-white w-2.5 h-2.5 stroke-[4px]" />
              </div>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-400 truncate uppercase tracking-widest text-[10px]">
            {typeLabel} • <span className="text-slate-500 font-bold">{subGroup.coordinatorName || 'Unassigned'}</span>
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-black/5 ${statusConfig.color}`}>
              {statusConfig.icon}
              {statusConfig.label}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100/50 px-2.5 py-1 rounded-full border border-slate-100">
              <Users className="w-3 h-3" />
              {subGroup.estimatedMembers} MEMBERS
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          {subGroup.status === 'pending' && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onApprove(); }}
                disabled={processing}
                className="h-10 px-4 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-100 flex items-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3px]" />
                Approve
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onReject(); }}
                disabled={processing}
                className="h-10 px-4 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 border border-red-100"
              >
                <X className="w-4 h-4 stroke-[3px]" />
                Reject
              </button>
            </div>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 rounded-xl transition-all active:scale-90 bg-white"
            title="View details"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Action Bar - Only for pending */}
      {subGroup.status === 'pending' && (
        <div className="lg:hidden flex items-center justify-end gap-3 px-5 py-3 bg-slate-50/50 border-t border-slate-100/50">
          <button
            onClick={(e) => { e.stopPropagation(); onApprove(); }}
            disabled={processing}
            className="flex-1 h-11 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-100 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3px]" />
            Approve
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReject(); }}
            disabled={processing}
            className="flex-1 h-11 bg-red-100 text-red-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4 stroke-[3px]" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
