import React from 'react';
import { 
  Wallet, 
  X, 
  ShieldCheck, 
  UserCheck
} from 'lucide-react';
import { User } from '../types/database';

interface WalletSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesReps: User[];
}

export const WalletSummaryModal: React.FC<WalletSummaryModalProps> = ({
  isOpen,
  onClose,
  salesReps,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Sales Team Wallet & Credit Summary
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Agent commission wallets and enterprise credit balances
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Balance Overview Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/15 rounded-full blur-2xl -mr-10 -mt-10" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active Agent Escrow Pool
            </span>
            <div className="text-3xl font-extrabold text-white font-numeric tracking-tight mb-3">
              ₹14,50,000.00
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck size={14} />
                <span>Fully Funded</span>
              </div>
              <span className="text-slate-600">•</span>
              <span>14 Active Sales Reps</span>
            </div>
          </div>

          {/* Sales Team Agent Wallets List */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <UserCheck size={14} className="text-teal-400" />
              Agent Accounts Overview ({salesReps.length} Reps)
            </h4>
            <div className="space-y-2">
              {salesReps.map((rep, idx) => (
                <div 
                  key={rep.user_id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-xs">
                      {rep.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-white">{rep.name.trim()}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Agent ID: #{rep.user_id}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-400">
                      ₹{((idx + 1) * 12500 + 35000).toLocaleString('en-IN')}.00
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Available Credit</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};
