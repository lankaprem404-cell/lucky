import React, { useState } from 'react';
import { X, ShieldAlert, Flag, CheckCircle } from 'lucide-react';
import { User } from '../types.js';

interface ReportModalProps {
  targetUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (
    targetUserId: string,
    reason: 'spam' | 'harassment' | 'inappropriate_intro' | 'impersonation' | 'other',
    details: string,
    andBlock: boolean
  ) => Promise<boolean>;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  targetUser,
  isOpen,
  onClose,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState<
    'spam' | 'harassment' | 'inappropriate_intro' | 'impersonation' | 'other'
  >('inappropriate_intro');
  const [details, setDetails] = useState('');
  const [andBlock, setAndBlock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const ok = await onSubmitReport(targetUser.id, reason, details, andBlock);
    setIsSubmitting(false);
    if (ok) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setDetails('');
        onClose();
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-purple-900/60 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-rose-100/70 dark:border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-bold text-base text-slate-900 dark:text-slate-100">
                Report Abuse or Spam
              </h3>
              <p className="text-xs text-slate-500">Keep Love Vault safe and respectful</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">Report Submitted</h4>
            <p className="text-xs text-slate-500">
              Thank you for keeping our romantic community safe. {andBlock && 'This user has also been blocked.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Reporting <span className="font-semibold text-rose-600">@{targetUser.username}</span> ({targetUser.nickname})
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Reason for report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-purple-800 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
              >
                <option value="inappropriate_intro">Inappropriate Introductory Note</option>
                <option value="harassment">Harassment or Bullying</option>
                <option value="spam">Spam or Unsolicited Promotion</option>
                <option value="impersonation">Fake Identity / Impersonation</option>
                <option value="other">Other Violation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what happened..."
                rows={3}
                className="w-full p-3 rounded-xl border border-rose-200 dark:border-purple-800 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-purple-950/40 border border-rose-100 dark:border-purple-900/40">
              <input
                type="checkbox"
                id="block-check"
                checked={andBlock}
                onChange={(e) => setAndBlock(e.target.checked)}
                className="rounded border-rose-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <label htmlFor="block-check" className="text-xs text-slate-700 dark:text-slate-300">
                Also block this user so they cannot search or message you again
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Reporting...' : 'Submit Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
