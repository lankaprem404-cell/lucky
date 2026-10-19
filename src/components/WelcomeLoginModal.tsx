import React, { useState } from 'react';
import { X, Sparkles, UserPlus, LogIn, Heart, Check, Copy } from 'lucide-react';
import { User, CharacterAvatarId } from '../types.js';
import { LLHeartsBrand } from './LLHeartsBrand.js';
import { AvatarIllustration, AVATAR_METADATA } from './AvatarIllustration.js';

interface WelcomeLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: User[];
  onSelectUser: (userId: string) => void;
  onRegisterUser: (data: {
    username: string;
    nickname: string;
    avatarId: CharacterAvatarId;
    description: string;
    loveMotto: string;
  }) => Promise<{ success: boolean; user?: User; error?: string }>;
}

export const WelcomeLoginModal: React.FC<WelcomeLoginModalProps> = ({
  isOpen,
  onClose,
  allUsers,
  onSelectUser,
  onRegisterUser,
}) => {
  const [mode, setMode] = useState<'welcome' | 'register' | 'lookup'>('welcome');
  const [lookupQuery, setLookupQuery] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newAvatarId, setNewAvatarId] = useState<CharacterAvatarId>('blossom_fox');
  const [newBio, setNewBio] = useState('');
  const [newMotto, setNewMotto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setErrorMsg('Please enter a username');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await onRegisterUser({
      username: newUsername,
      nickname: newNickname || newUsername,
      avatarId: newAvatarId,
      description: newBio || 'Romantic explorer in Love Vault',
      loveMotto: newMotto || 'Cherishing every gentle connection.',
    });

    setIsSubmitting(false);
    if (res.success && res.user) {
      onSelectUser(res.user.id);
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to register account');
    }
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = lookupQuery.trim().toUpperCase().replace(/^@/, '');
    const found = allUsers.find(
      (u) =>
        u.userCode.toUpperCase() === clean ||
        u.username.toUpperCase() === clean ||
        u.userCode.replace('LV-', '').toUpperCase() === clean
    );

    if (found) {
      onSelectUser(found.id);
      onClose();
    } else {
      setErrorMsg(`No account found matching "${lookupQuery}". Try searching by LV- ID or username.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-purple-900/60 overflow-hidden p-6 sm:p-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LL Hearts Hero Header */}
        <LLHeartsBrand size="hero" showSubtitle={false} />

        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-center gap-1 p-1 rounded-2xl bg-rose-50/70 dark:bg-purple-950/40 border border-rose-100 dark:border-purple-900/40">
          <button
            onClick={() => {
              setMode('welcome');
              setErrorMsg(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'welcome'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-pink-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Choose Account
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-pink-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create New (LV- ID)
          </button>
          <button
            onClick={() => {
              setMode('lookup');
              setErrorMsg(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'lookup'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-pink-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Login via ID
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 text-red-600 text-xs text-center border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Mode: Welcome / Pick Existing Account */}
        {mode === 'welcome' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Select an account to test or log in:</span>
              <span>All themes free · LL Hearts default</span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {allUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u.id);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl border border-rose-100 dark:border-purple-900/40 hover:border-rose-300 dark:hover:border-purple-700 bg-rose-50/30 dark:bg-purple-950/20 hover:bg-rose-50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <AvatarIllustration id={u.avatarId} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {u.nickname}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-rose-600 dark:text-pink-400 bg-rose-100/70 dark:bg-purple-900/50 px-1.5 py-0.5 rounded">
                          {u.userCode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">@{u.username}</div>
                    </div>
                  </div>

                  <span className="text-xs text-rose-500 font-semibold">Enter</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode: Register New Account with auto LL Hearts default & LV- ID */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-purple-950/40 border border-rose-200/60 dark:border-purple-800/60 text-xs text-rose-700 dark:text-pink-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-rose-500" />
              <span>
                New accounts automatically receive a collision-resistant <strong>LV-XXXXXX</strong> user ID and the mandatory <strong>LL Hearts</strong> theme!
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Username (@handle)
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. starlight_melody"
                  className="w-full p-2.5 text-xs rounded-xl border border-rose-200 dark:border-purple-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Display Nickname
                </label>
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="e.g. Melody 🌸"
                  className="w-full p-2.5 text-xs rounded-xl border border-rose-200 dark:border-purple-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Choose Illustrated Avatar
              </label>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {(Object.keys(AVATAR_METADATA) as CharacterAvatarId[]).slice(0, 5).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setNewAvatarId(id)}
                    className={`p-1 rounded-2xl border transition-all ${
                      newAvatarId === id
                        ? 'border-rose-500 ring-2 ring-rose-500/30'
                        : 'border-slate-100'
                    }`}
                  >
                    <AvatarIllustration id={id} size="md" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Romantic Bio (Optional)
              </label>
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                placeholder="What speaks to your heart..."
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl border border-rose-200 dark:border-purple-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !newUsername.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-pink-500/25 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Account...' : 'Create Account with LL Hearts'}</span>
            </button>
          </form>
        )}

        {/* Mode: Lookup by Exact LV- ID */}
        {mode === 'lookup' && (
          <form onSubmit={handleLookupSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Enter Exact User ID or Username
              </label>
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="e.g. LV-7K9P2X or juliet_rose"
                className="w-full p-3 text-xs sm:text-sm font-mono rounded-xl border border-rose-200 dark:border-purple-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                required
              />
            </div>

            <p className="text-[11px] text-slate-500">
              Each Love Vault account has a unique permanent ID formatted as <strong>LV-XXXXXX</strong>.
            </p>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-semibold text-xs shadow-md shadow-pink-500/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In With User ID</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
