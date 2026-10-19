import React, { useState } from 'react';
import { Search, UserPlus, Heart, Lock, MessageCircle, Clock, Sparkles, Smartphone, Download, QrCode } from 'lucide-react';
import { User, ChatMessage } from '../types.js';
import { AvatarIllustration, AVATAR_METADATA } from './AvatarIllustration.js';

interface ConversationItem {
  partner: User;
  lastMessage?: ChatMessage;
  unreadCount: number;
  requestStatus: 'ACCEPTED';
}

interface ChatsViewProps {
  currentUser: User | null;
  conversations: ConversationItem[];
  onSelectPartner: (partnerId: string) => void;
  onNavigateToSearch: () => void;
  onNavigateToRequests: () => void;
  onOpenDownloadModal?: () => void;
  pendingRequestsCount: number;
}

export const ChatsView: React.FC<ChatsViewProps> = ({
  currentUser,
  conversations,
  onSelectPartner,
  onNavigateToSearch,
  onNavigateToRequests,
  onOpenDownloadModal,
  pendingRequestsCount,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    if (!filterQuery.trim()) return true;
    const clean = filterQuery.toLowerCase();
    return (
      conv.partner.nickname.toLowerCase().includes(clean) ||
      conv.partner.username.toLowerCase().includes(clean) ||
      conv.lastMessage?.text.toLowerCase().includes(clean)
    );
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header and Fast Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-['Outfit'] font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Chats &amp; Connections</span>
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Encrypted messaging with accepted soulmates and partners.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {pendingRequestsCount > 0 && (
              <button
                onClick={onNavigateToRequests}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-pink-400 bg-rose-50 dark:bg-purple-950/60 border border-rose-200/60 dark:border-purple-800/60 rounded-xl hover:bg-rose-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>{pendingRequestsCount} Pending Request{pendingRequestsCount === 1 ? '' : 's'}</span>
              </button>
            )}

            {onOpenDownloadModal && (
              <button
                onClick={onOpenDownloadModal}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-pink-400 bg-rose-50 dark:bg-purple-950/60 border border-rose-200/60 dark:border-purple-800/60 rounded-xl hover:bg-rose-100 transition-colors whitespace-nowrap"
                title="Download Love Vault on mobile"
              >
                <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                <span>Get App</span>
              </button>
            )}

            <button
              onClick={onNavigateToSearch}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 rounded-xl shadow-md shadow-pink-500/20 active:scale-[0.98] transition-all whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>Search Users</span>
            </button>
          </div>
        </div>

        {/* Mobile Download Notice Banner */}
        {onOpenDownloadModal && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-600/10 border border-rose-200/60 dark:border-purple-800/40 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-pink-500/25">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Download Love Vault Mobile App</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500 text-white uppercase tracking-wider">Free</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Install on Android, iPhone &amp; iPad. Instant home screen icon, all 12 free themes, and real-time alerts!
                </p>
              </div>
            </div>
            <button
              onClick={onOpenDownloadModal}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 rounded-xl shadow-xs shrink-0 transition-all active:scale-95 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download &amp; QR</span>
            </button>
          </div>
        )}

        {/* Search Bar on Chats screen */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-rose-400 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search active chats or soulmates..."
            className="w-full pl-11 pr-24 py-3 bg-white dark:bg-slate-900 border border-rose-200 dark:border-purple-800/60 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-400/30 transition-all shadow-xs"
          />
          <button
            onClick={onNavigateToSearch}
            className="absolute right-2 top-2 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-pink-400 bg-rose-50 dark:bg-purple-950/60 hover:bg-rose-100 rounded-xl transition-colors"
          >
            Find New
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-rose-100 dark:border-purple-900/40 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-purple-950/50 flex items-center justify-center mx-auto text-rose-400">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                {filterQuery ? 'No matching conversations' : 'No active chats yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {filterQuery
                  ? 'No conversations found with that search term. Want to search across all registered accounts instead?'
                  : 'Send a message request to connect with romantic soulmates, or switch test users to accept incoming requests.'}
              </p>
            </div>
            <button
              onClick={onNavigateToSearch}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl shadow-md shadow-pink-500/20 hover:from-rose-600 hover:to-purple-700 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Search Registered Accounts</span>
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const partner = conv.partner;
            const meta = AVATAR_METADATA[partner.avatarId];
            return (
              <div
                key={partner.id}
                onClick={() => onSelectPartner(partner.id)}
                className="group flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-purple-900/40 hover:border-rose-300 dark:hover:border-purple-700 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <AvatarIllustration id={partner.avatarId} size="lg" showBadge />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-['Outfit'] font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                          {partner.nickname}
                        </span>
                        <span className="text-xs font-mono text-purple-600 dark:text-pink-400 truncate">
                          @{partner.username}
                        </span>
                      </div>
                      {conv.lastMessage && (
                        <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                        {conv.lastMessage ? conv.lastMessage.text : 'Connected! Say hello ✨'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
