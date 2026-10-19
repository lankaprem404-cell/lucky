import React, { useState } from 'react';
import { X, Send, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { User } from '../types.js';
import { AvatarIllustration, AVATAR_METADATA } from './AvatarIllustration.js';

interface SendRequestModalProps {
  targetUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: (targetUserId: string, introMessage: string) => Promise<{ success: boolean; error?: string }>;
}

const ICEBREAKERS = [
  'Hi! I saw your bio and loved your romantic perspective. Would love to connect ✨',
  'Greetings from across the Love Vault! Sending a warm hello and hoping to share poetry with you 🌸',
  'Hello! Fellow stargazer and music lover here. Would love to be your chat partner 🌙',
  'Your motto resonated deeply with me. Sending this love note to say hi!',
];

export const SendRequestModal: React.FC<SendRequestModalProps> = ({
  targetUser,
  isOpen,
  onClose,
  onSend,
}) => {
  const [introMessage, setIntroMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !targetUser) return null;

  const charCount = introMessage.length;
  const maxChars = 280;
  const isOverLimit = charCount > maxChars;
  const avatarMeta = AVATAR_METADATA[targetUser.avatarId] || AVATAR_METADATA.sakura_swan;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!introMessage.trim()) {
      setErrorMessage('Please write a short introductory message before sending.');
      return;
    }
    if (isOverLimit) {
      setErrorMessage(`Introductory message must be ${maxChars} characters or fewer.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await onSend(targetUser.id, introMessage);
    setIsSubmitting(false);

    if (res.success) {
      setIntroMessage('');
      onClose();
    } else {
      setErrorMessage(res.error || 'Failed to send message request');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-purple-900/60 overflow-hidden">
        {/* Header Ribbon */}
        <div className="px-6 pt-6 pb-4 border-b border-rose-100/70 dark:border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-purple-950 flex items-center justify-center text-rose-600 dark:text-pink-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-bold text-lg text-slate-900 dark:text-slate-100">
                Send Message Request
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send an introductory note to request connection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target User Summary Card */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-rose-50/60 dark:bg-purple-950/40 border border-rose-100 dark:border-purple-900/40">
            <AvatarIllustration id={targetUser.avatarId} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {targetUser.nickname}
                </span>
                <span className="text-xs text-slate-500 truncate">@{targetUser.username}</span>
              </div>
              <p className="text-xs text-rose-600 dark:text-pink-400 mt-0.5 truncate">
                {avatarMeta.species} · {avatarMeta.name}
              </p>
              {targetUser.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5 italic">
                  "{targetUser.description}"
                </p>
              )}
            </div>
          </div>

          {/* Privacy & Safety Callout */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 text-purple-900 dark:text-purple-200 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold">Privacy Protected Message Request</span>
              <p className="text-purple-800/80 dark:text-purple-300/80 text-[11px] leading-relaxed">
                The recipient can preview your note before deciding to accept or decline. Your private Couple Vault and intimate data remain strictly locked until mutually accepted.
              </p>
            </div>
          </div>

          {/* Introductory Message Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="intro-msg" className="font-medium text-slate-700 dark:text-slate-300">
                Introductory Note (Max 280 characters)
              </label>
              <span
                className={`font-mono text-xs tabular-nums ${
                  isOverLimit
                    ? 'text-red-500 font-bold'
                    : charCount >= 240
                    ? 'text-amber-500'
                    : 'text-slate-400'
                }`}
              >
                {charCount} / {maxChars}
              </span>
            </div>

            <textarea
              id="intro-msg"
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
              placeholder="Write a sweet, thoughtful greeting..."
              rows={4}
              maxLength={320}
              className={`w-full p-3.5 rounded-2xl border text-sm bg-slate-50/60 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all resize-none ${
                isOverLimit
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-rose-200 dark:border-purple-800/60 focus:border-rose-400 focus:ring-rose-400/20'
              }`}
            />
          </div>

          {/* Icebreaker Suggestions */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Romantic Icebreakers
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ICEBREAKERS.map((text, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIntroMessage(text)}
                  className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-purple-950/50 hover:bg-rose-100 dark:hover:bg-purple-900/50 text-slate-700 dark:text-slate-300 border border-rose-100 dark:border-purple-900/40 transition-colors line-clamp-1"
                >
                  "{text.substring(0, 38)}..."
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !introMessage.trim() || isOverLimit}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-pink-500/20 active:scale-[0.98] transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending Request...' : 'Send Message Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
