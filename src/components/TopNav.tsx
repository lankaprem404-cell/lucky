import React, { useState } from 'react';
import { Heart, Search, MessageSquare, ShieldCheck, Lock, Settings, Copy, Check, Users, Smartphone, Download } from 'lucide-react';
import { User, LoveVaultTheme } from '../types.js';
import { AvatarIllustration } from './AvatarIllustration.js';
import { LLHeartsBrand } from './LLHeartsBrand.js';

interface TopNavProps {
  currentTab: 'chats' | 'search' | 'requests' | 'vault' | 'security' | 'settings';
  setCurrentTab: (tab: 'chats' | 'search' | 'requests' | 'vault' | 'security' | 'settings') => void;
  currentUser: User | null;
  allUsers: User[];
  currentTheme: LoveVaultTheme;
  onSwitchUser: (userId: string) => void;
  onOpenLoginModal: () => void;
  onOpenDownloadModal: () => void;
  pendingRequestsCount: number;
  unreadChatsCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  allUsers,
  currentTheme,
  onSwitchUser,
  onOpenLoginModal,
  onOpenDownloadModal,
  pendingRequestsCount,
  unreadChatsCount,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-rose-100 dark:border-purple-900/40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark with LL Hearts glow */}
        <div
          onClick={() => setCurrentTab('chats')}
          className="flex items-center cursor-pointer whitespace-nowrap shrink-0 group select-none"
        >
          <LLHeartsBrand size="md" showSubtitle={false} />
        </div>

        {/* Zone 2: Navigation Links (Single Line, 5 items) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setCurrentTab('chats')}
            className={`flex items-center gap-2 py-2 hover:text-rose-600 dark:hover:text-pink-400 transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'chats'
                ? 'text-rose-600 dark:text-pink-400 font-semibold border-b-2 border-rose-500'
                : ''
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chats</span>
            {unreadChatsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                {unreadChatsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('search')}
            className={`flex items-center gap-2 py-2 hover:text-rose-600 dark:hover:text-pink-400 transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'search'
                ? 'text-rose-600 dark:text-pink-400 font-semibold border-b-2 border-rose-500'
                : ''
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Users</span>
          </button>

          <button
            onClick={() => setCurrentTab('requests')}
            className={`flex items-center gap-2 py-2 hover:text-rose-600 dark:hover:text-pink-400 transition-colors whitespace-nowrap shrink-0 relative ${
              currentTab === 'requests'
                ? 'text-rose-600 dark:text-pink-400 font-semibold border-b-2 border-rose-500'
                : ''
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-purple-600 text-white rounded-full text-[10px] font-bold animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('vault')}
            className={`flex items-center gap-2 py-2 hover:text-rose-600 dark:hover:text-pink-400 transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'vault'
                ? 'text-rose-600 dark:text-pink-400 font-semibold border-b-2 border-rose-500'
                : ''
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Couple Vault</span>
          </button>

          <button
            onClick={() => setCurrentTab('security')}
            className={`flex items-center gap-2 py-2 hover:text-rose-600 dark:hover:text-pink-400 transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'security'
                ? 'text-rose-600 dark:text-pink-400 font-semibold border-b-2 border-rose-500'
                : ''
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security Rules</span>
          </button>
        </nav>

        {/* Zone 3: Active Account with permanent LV- ID & Settings */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-rose-50 dark:hover:bg-purple-950/50 border border-rose-200 dark:border-purple-800/40 transition-colors whitespace-nowrap shrink-0 group"
                title="Switch active user or register a new one"
              >
                <AvatarIllustration id={currentUser.avatarId} size="sm" />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[100px]">
                    {currentUser.nickname}
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-rose-600 dark:text-pink-400">
                    <span>{currentUser.userCode}</span>
                  </div>
                </div>
              </button>

              {/* Quick Copy LV- ID Button */}
              <button
                onClick={(e) => handleCopyCode(currentUser.userCode, e)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-purple-950/40 transition-colors"
                title={`Copy public user ID (${currentUser.userCode})`}
              >
                {copiedCode ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

          {/* Download Mobile App Button */}
          <button
            onClick={onOpenDownloadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20 hover:from-rose-600 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
            title="Download & Install Love Vault on Android, iPhone, or iPad"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Get App</span>
            <span className="sm:hidden">App</span>
          </button>

          <button
            onClick={() => setCurrentTab('settings')}
            className={`p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-pink-400 hover:bg-rose-50 dark:hover:bg-purple-950/40 transition-colors ${
              currentTab === 'settings' ? 'text-rose-600 dark:text-pink-400 bg-rose-50 dark:bg-purple-950/40' : ''
            }`}
            title="Privacy, Themes (12 Free), & Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-rose-100 dark:border-purple-900/40 py-2 px-1 bg-white/95 dark:bg-slate-950/95">
        <button
          onClick={() => setCurrentTab('chats')}
          className={`flex flex-col items-center py-1 px-3 text-xs ${
            currentTab === 'chats' ? 'text-rose-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {unreadChatsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 bg-rose-500 text-white rounded-full text-[9px] font-bold">
                {unreadChatsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1">Chats</span>
        </button>

        <button
          onClick={() => setCurrentTab('search')}
          className={`flex flex-col items-center py-1 px-3 text-xs ${
            currentTab === 'search' ? 'text-rose-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[11px] mt-1">Search</span>
        </button>

        <button
          onClick={() => setCurrentTab('requests')}
          className={`flex flex-col items-center py-1 px-3 text-xs ${
            currentTab === 'requests' ? 'text-rose-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 bg-purple-600 text-white rounded-full text-[9px] font-bold">
                {pendingRequestsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1">Requests</span>
        </button>

        <button
          onClick={() => setCurrentTab('vault')}
          className={`flex flex-col items-center py-1 px-3 text-xs ${
            currentTab === 'vault' ? 'text-rose-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <Lock className="w-5 h-5" />
          <span className="text-[11px] mt-1">Vault</span>
        </button>

        <button
          onClick={() => setCurrentTab('security')}
          className={`flex flex-col items-center py-1 px-3 text-xs ${
            currentTab === 'security' ? 'text-rose-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[11px] mt-1">Security</span>
        </button>

        <button
          onClick={onOpenDownloadModal}
          className="flex flex-col items-center py-1 px-3 text-xs text-rose-600 hover:text-rose-700 transition-colors"
          title="Download App on Mobile Phone"
        >
          <Smartphone className="w-5 h-5 text-rose-500" />
          <span className="text-[11px] mt-1 font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">Get App</span>
        </button>
      </div>
    </header>
  );
};
