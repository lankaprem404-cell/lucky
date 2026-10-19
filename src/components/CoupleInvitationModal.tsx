import React, { useState } from 'react';
import { X, Heart, Sparkles, Calendar, Lock } from 'lucide-react';
import { User } from '../types.js';
import { AvatarIllustration } from './AvatarIllustration.js';

interface CoupleInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
  onPropose: (
    recipientId: string,
    anniversaryDate: string,
    vowMessage: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export const CoupleInvitationModal: React.FC<CoupleInvitationModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onPropose,
}) => {
  const [anniversaryDate, setAnniversaryDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [vowMessage, setVowMessage] = useState(
    'Will you seal our mutual couple bond in Love Vault and share our private sanctuary forever? 💖'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await onPropose(targetUser.id, anniversaryDate, vowMessage);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to send couple invitation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-purple-900/60 overflow-hidden p-6 sm:p-8 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-pink-500/25">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <h2 className="font-['Outfit'] font-bold text-2xl text-slate-900 dark:text-slate-100">
            Propose Mutual Couple Bond
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Propose a bilateral couple partnership. Both soulmates must mutually agree to seal the bond and unlock shared couple features.
          </p>
        </div>

        {/* Target Partner Card */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50/60 dark:bg-purple-950/40 border border-rose-100 dark:border-purple-900/40">
          <AvatarIllustration id={targetUser.avatarId} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                {targetUser.nickname}
              </span>
              <span className="font-mono text-[11px] font-semibold text-rose-600 dark:text-pink-400">
                {targetUser.userCode}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">@{targetUser.username}</div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs text-center border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>Anniversary Date</span>
            </label>
            <input
              type="date"
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-purple-800 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Personal Couple Vow or Message (Max 500 chars)
            </label>
            <textarea
              value={vowMessage}
              onChange={(e) => setVowMessage(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full p-3 rounded-xl border border-rose-200 dark:border-purple-800 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              required
            />
          </div>

          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 text-[11px] text-purple-900 dark:text-purple-300 leading-relaxed">
            ✨ Once your partner accepts, your status will become <strong>Connected Couple</strong>, unlocking the private Couple Vault, secret anniversary countdown, and shared promises.
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 rounded-xl shadow-md shadow-pink-500/20 active:scale-95 transition-all"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>{isSubmitting ? 'Sending Proposal...' : 'Propose Couple Bond'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
