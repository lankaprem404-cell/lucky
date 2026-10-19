import React, { useState, useEffect } from 'react';
import {
  Shield,
  Palette,
  User,
  UserX,
  Sparkles,
  Save,
  Check,
  Bell,
  Lock,
  Copy,
  Share2,
  Heart,
  Smartphone,
  Download,
} from 'lucide-react';
import { User as UserType, CharacterAvatarId, LoveVaultTheme } from '../types.js';
import { AvatarIllustration, AVATAR_METADATA } from './AvatarIllustration.js';
import { ALL_12_THEMES } from '../themeConfig.js';
import { LLHeartsBrand } from './LLHeartsBrand.js';

interface SettingsViewProps {
  currentUser: UserType;
  currentTheme: LoveVaultTheme;
  onThemeChange: (theme: LoveVaultTheme) => void;
  onUpdatePrivacy: (privacyUpdates: any) => Promise<boolean>;
  onUpdateProfile: (profileUpdates: any) => Promise<boolean>;
  onUnblockUser: (targetUserId: string) => Promise<boolean>;
  onOpenDownloadModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  currentTheme,
  onThemeChange,
  onUpdatePrivacy,
  onUpdateProfile,
  onUnblockUser,
  onOpenDownloadModal,
}) => {
  const [activeSection, setActiveSection] = useState<'privacy' | 'themes' | 'profile' | 'blocked'>('themes');

  // Privacy toggles
  const [allowIncoming, setAllowIncoming] = useState(currentUser.privacy.allowIncomingRequests);
  const [hideInSearch, setHideInSearch] = useState(currentUser.privacy.hideInSearch);
  const [readReceipts, setReadReceipts] = useState(currentUser.privacy.readReceipts);
  const [notificationSound, setNotificationSound] = useState(currentUser.privacy.notificationSound);
  const [introPreviews, setIntroPreviews] = useState(currentUser.privacy.introPreviews);

  // Profile fields
  const [nickname, setNickname] = useState(currentUser.nickname);
  const [avatarId, setAvatarId] = useState<CharacterAvatarId>(currentUser.avatarId);
  const [description, setDescription] = useState(currentUser.description || '');
  const [loveMotto, setLoveMotto] = useState(currentUser.loveMotto || '');
  const [statusMood, setStatusMood] = useState(currentUser.statusMood || '');

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<UserType[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const fetchBlocked = async () => {
    try {
      const res = await fetch('/api/users/blocked/list', {
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data.blockedUsers || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeSection === 'blocked') {
      fetchBlocked();
    }
  }, [activeSection]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.userCode);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSavePrivacy = async () => {
    const ok = await onUpdatePrivacy({
      allowIncomingRequests: allowIncoming,
      hideInSearch,
      readReceipts,
      notificationSound,
      introPreviews,
    });
    if (ok) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onUpdateProfile({
      nickname,
      avatarId,
      description,
      loveMotto,
      statusMood,
    });
    if (ok) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleSelectTheme = async (themeKey: LoveVaultTheme) => {
    onThemeChange(themeKey);
    // Persist to user record in backend
    await onUpdateProfile({ theme: themeKey });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Settings Header */}
      <div className="border-b border-rose-100 dark:border-purple-900/40 pb-5">
        <h1 className="font-['Outfit'] font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">
          Preferences &amp; Themes
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Explore all 12 free themes with LL Hearts default, manage your permanent LV- ID, and customize safety limits.
        </p>
      </div>

      {/* Mobile App Download Card */}
      {onOpenDownloadModal && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-600/10 border border-rose-200/80 dark:border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-pink-500/25">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Download Mobile App on Any Phone
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-rose-500 rounded-full">
                  Universal
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Scan QR code or click to install Love Vault on Android, iPhone, or iPad. Real-time push, all 12 free themes, offline ready.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenDownloadModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 rounded-2xl shadow-md transition-all shrink-0 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Open Download &amp; QR</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-2xl bg-rose-50/70 dark:bg-purple-950/40 border border-rose-100 dark:border-purple-900/40">
        <button
          onClick={() => setActiveSection('themes')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeSection === 'themes'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-pink-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>All 12 Free Themes</span>
        </button>

        <button
          onClick={() => setActiveSection('privacy')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeSection === 'privacy'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-pink-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Privacy &amp; Requests</span>
        </button>

        <button
          onClick={() => setActiveSection('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeSection === 'profile'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-pink-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Account &amp; LV- ID</span>
        </button>

        <button
          onClick={() => setActiveSection('blocked')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeSection === 'blocked'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-pink-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <UserX className="w-3.5 h-3.5" />
          <span>Blocked Accounts ({currentUser.blockedUserIds.length})</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
          <Check className="w-4 h-4" />
          <span>Preferences updated and saved to your account!</span>
        </div>
      )}

      {/* Section 1: All 12 Free Themes */}
      {activeSection === 'themes' && (
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-purple-900/40 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 dark:border-purple-900/30 pb-3">
              <div>
                <h3 className="font-['Outfit'] font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <span>All 12 Free Themes</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every theme is 100% free with no premium restrictions. <strong>LL Hearts</strong> is the mandatory default on new account setup.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-purple-950/60 border border-rose-200/60 text-xs font-bold text-rose-600 dark:text-pink-300 self-start sm:self-auto">
                12 Themes Available · All Free
              </span>
            </div>

            {/* Grid of all 12 Themes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(ALL_12_THEMES).map((theme) => {
                const isSelected = currentTheme === theme.id;
                const isLLHearts = theme.id === 'll_hearts';

                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`relative p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/40 dark:bg-purple-950/30 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-rose-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full shadow-xs"
                            style={{ backgroundColor: theme.previewColor }}
                          />
                          <span className="font-['Outfit'] font-bold text-sm text-slate-900 dark:text-slate-100">
                            {theme.name}
                          </span>
                        </div>
                        {isLLHearts && (
                          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 text-white text-[9px] font-bold">
                            Default ♥
                          </span>
                        )}
                        {isSelected && !isLLHearts && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                            Active
                          </span>
                        )}
                      </div>

                      <div className={`h-7 rounded-xl bg-gradient-to-r ${theme.gradient} mb-2 shadow-xs`} />
                      <div className="text-[11px] font-semibold text-rose-600 dark:text-pink-400 mb-1">
                        {theme.tagline}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {theme.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-600 font-semibold">Free Forever</span>
                      <span className={isSelected ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                        {isSelected ? 'Applied' : 'Click to apply'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Privacy Controls */}
      {activeSection === 'privacy' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-purple-900/40 shadow-xs space-y-5">
            <h3 className="font-['Outfit'] font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600 dark:text-pink-400" />
              <span>Incoming Message Requests</span>
            </h3>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/50 dark:bg-purple-950/30 border border-rose-100 dark:border-purple-900/40">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Allow Incoming Message Requests
                </span>
                <p className="text-xs text-slate-500 max-w-md">
                  When enabled, registered soulmates can send you an introductory message request. When disabled, other users are blocked from sending requests to you on the backend.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={allowIncoming}
                  onChange={(e) => setAllowIncoming(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/50 dark:bg-purple-950/30 border border-rose-100 dark:border-purple-900/40">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Hide Profile in Public Search
                </span>
                <p className="text-xs text-slate-500 max-w-md">
                  Keep your account private and hidden from general search directory (users with your exact LV- ID can still find you).
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={hideInSearch}
                  onChange={(e) => setHideInSearch(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/50 dark:bg-purple-950/30 border border-rose-100 dark:border-purple-900/40">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Read Receipts
                </span>
                <p className="text-xs text-slate-500 max-w-md">
                  Show read receipts when you have viewed messages from accepted partners.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={readReceipts}
                  onChange={(e) => setReadReceipts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSavePrivacy}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl shadow-md shadow-pink-500/20 hover:from-rose-600 hover:to-purple-700 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Privacy Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Profile & LV- User ID */}
      {activeSection === 'profile' && (
        <form
          onSubmit={handleSaveProfile}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-purple-900/40 shadow-xs space-y-5"
        >
          {/* Permanent LV- User ID Banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 dark:from-purple-950/40 dark:to-slate-900 border border-rose-200/80 dark:border-purple-800/60">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-pink-400">
                Permanent Public User Identification
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                  {currentUser.userCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 bg-white dark:bg-slate-800 rounded-lg shadow-xs hover:bg-rose-50 transition-colors"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Share this unique ID so soulmates can search and send requests directly to your exact account.
              </p>
            </div>
          </div>

          {/* Avatar selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Character Avatar (Illustrated Spirit Animal)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(Object.keys(AVATAR_METADATA) as CharacterAvatarId[]).map((id) => {
                const meta = AVATAR_METADATA[id];
                const isSelected = avatarId === id;
                return (
                  <div
                    key={id}
                    onClick={() => setAvatarId(id)}
                    className={`flex flex-col items-center p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50 dark:bg-purple-950/60 ring-2 ring-rose-500/20'
                        : 'border-slate-100 dark:border-purple-900/30 hover:border-rose-200'
                    }`}
                  >
                    <AvatarIllustration id={id} size="lg" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2 truncate w-full">
                      {meta.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate w-full">
                      {meta.species}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Display Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full p-3 rounded-xl border border-rose-200 dark:border-purple-800 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Current Romantic Mood
              </label>
              <input
                type="text"
                value={statusMood}
                onChange={(e) => setStatusMood(e.target.value)}
                placeholder="e.g. Reading poetry under moonlight"
                className="w-full p-3 rounded-xl border border-rose-200 dark:border-purple-800 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Romantic Bio / Character Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Tell soulmates what moves your heart..."
              className="w-full p-3 rounded-xl border border-rose-200 dark:border-purple-800 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Love Motto
            </label>
            <input
              type="text"
              value={loveMotto}
              onChange={(e) => setLoveMotto(e.target.value)}
              placeholder="e.g. Soft words blossom the sweetest."
              className="w-full p-3 rounded-xl border border-rose-200 dark:border-purple-800 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl shadow-md shadow-pink-500/20 hover:from-rose-600 hover:to-purple-700 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Update Profile &amp; Bio</span>
            </button>
          </div>
        </form>
      )}

      {/* Section 4: Blocked Users */}
      {activeSection === 'blocked' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-purple-900/40 shadow-xs space-y-4">
          <div>
            <h3 className="font-['Outfit'] font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserX className="w-4 h-4 text-red-500" />
              <span>Blocked Accounts</span>
            </h3>
            <p className="text-xs text-slate-500">
              Blocked accounts cannot search for you, cannot send message requests, and cannot message you.
            </p>
          </div>

          {blockedUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-1">
              <p>You have not blocked any accounts.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map((bUser) => (
                <div
                  key={bUser.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-purple-900/30"
                >
                  <div className="flex items-center gap-3">
                    <AvatarIllustration id={bUser.avatarId} size="sm" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {bUser.nickname}
                      </div>
                      <div className="text-[11px] text-purple-600 dark:text-pink-400 font-mono">
                        {bUser.userCode} · @{bUser.username}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await onUnblockUser(bUser.id);
                      fetchBlocked();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
