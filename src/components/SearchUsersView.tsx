import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  X,
  Send,
  Clock,
  Check,
  UserX,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Info,
  Copy,
  Share2,
  Heart,
} from 'lucide-react';
import { User } from '../types.js';
import { AvatarIllustration, AVATAR_METADATA } from './AvatarIllustration.js';
import { SendRequestModal } from './SendRequestModal.js';
import { ReportModal } from './ReportModal.js';
import { CoupleInvitationModal } from './CoupleInvitationModal.js';

interface SearchUsersViewProps {
  currentUser: User | null;
  onOpenChat: (partnerId: string) => void;
  onAcceptRequest: (requestId: string) => Promise<boolean>;
  onDeclineRequest: (requestId: string) => Promise<boolean>;
  onSendRequest: (recipientId: string, introMessage: string) => Promise<{ success: boolean; error?: string }>;
  onProposeCouple: (recipientId: string, anniversaryDate: string, vowMessage: string) => Promise<{ success: boolean; error?: string }>;
  onBlockUser: (targetUserId: string) => Promise<boolean>;
  onUnblockUser: (targetUserId: string) => Promise<boolean>;
  onSubmitReport: (
    targetUserId: string,
    reason: any,
    details: string,
    andBlock: boolean
  ) => Promise<boolean>;
}

export const SearchUsersView: React.FC<SearchUsersViewProps> = ({
  currentUser,
  onOpenChat,
  onAcceptRequest,
  onDeclineRequest,
  onSendRequest,
  onProposeCouple,
  onBlockUser,
  onUnblockUser,
  onSubmitReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [relationshipMap, setRelationshipMap] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number; resetSec: number } | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [modalTargetUser, setModalTargetUser] = useState<User | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isCoupleModalOpen, setIsCoupleModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedBioUser, setSelectedBioUser] = useState<User | null>(null);

  const fetchUsers = useCallback(
    async (q: string, p: number) => {
      if (!currentUser) return;
      setIsLoading(true);
      setRateLimitError(null);

      try {
        const params = new URLSearchParams({
          q,
          page: p.toString(),
          limit: '6',
        });
        const res = await fetch(`/api/users/search?${params.toString()}`, {
          headers: {
            'x-user-id': currentUser.id,
          },
        });

        const remaining = res.headers.get('X-RateLimit-Remaining');
        const resetSec = res.headers.get('X-RateLimit-Reset');
        if (remaining !== null && resetSec !== null) {
          setRateLimitInfo({ remaining: Number(remaining), resetSec: Number(resetSec) });
        }

        if (res.status === 429) {
          const errData = await res.json();
          setRateLimitError(errData.error || 'Search rate limit exceeded. Please wait a moment.');
          setIsLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error('Search failed');
        }

        const data = await res.json();
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
        setRelationshipMap(data.relationshipStatuses || {});
      } catch (err) {
        console.error('Failed to search users', err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(searchQuery, page);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery, page, fetchUsers]);

  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const handleOpenSendModal = (user: User) => {
    setModalTargetUser(user);
    setIsSendModalOpen(true);
  };

  const handleOpenCoupleModal = (user: User) => {
    setModalTargetUser(user);
    setIsCoupleModalOpen(true);
  };

  const handleOpenReportModal = (user: User) => {
    setModalTargetUser(user);
    setIsReportModalOpen(true);
  };

  const handleCopyUserCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-7">
      {/* Search Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-purple-950/60 border border-rose-200/60 dark:border-purple-800/40 text-xs font-medium text-rose-600 dark:text-pink-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Connect Users · Search by Username or Public LV- ID</span>
        </div>
        <h1 className="font-['Outfit'] font-bold text-3xl sm:text-4xl text-slate-900 dark:text-slate-100 tracking-tight">
          Search Registered Accounts
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Every account receives a permanent, collision-resistant <strong>LV-XXXXXX</strong> user ID. Search by username or exact ID to send protected introductory message requests.
        </p>
      </div>

      {/* Search Bar Input */}
      <div className="relative max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-rose-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search by username (@juliet_rose) or exact ID (e.g. LV-7K9P2X)..."
            className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-purple-800/60 rounded-2xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-md shadow-rose-500/5 focus:outline-hidden focus:ring-2 focus:ring-rose-400/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleQueryChange('')}
              className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Metadata & Rate Limit Badge */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 mt-2">
          <span>
            {isLoading
              ? 'Searching accounts...'
              : `Found ${totalCount} registered account${totalCount === 1 ? '' : 's'}`}
          </span>
          {rateLimitInfo && (
            <span className="font-mono tabular-nums text-[11px] text-slate-400">
              Rate Limit: {rateLimitInfo.remaining} searches remaining
            </span>
          )}
        </div>

        {/* Rate Limit Exceeded Error */}
        {rateLimitError && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
            <span>{rateLimitError}</span>
          </div>
        )}
      </div>

      {/* User Results Grid */}
      {users.length === 0 && !isLoading ? (
        <div className="text-center py-16 px-4 bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-rose-100 dark:border-purple-900/40 space-y-3">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-purple-950/50 flex items-center justify-center mx-auto text-rose-400">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">
            No matching accounts found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try searching by exact user ID like <strong>LV-7K9P2X</strong> or usernames like "romeo", "celeste", "valentin", or "cupid".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((user) => {
            const rel = relationshipMap[user.id] || { state: 'NONE' };
            const meta = AVATAR_METADATA[user.avatarId] || AVATAR_METADATA.sakura_swan;
            const isSelf = user.id === currentUser?.id;
            const requestsDisabled = user.privacy.allowIncomingRequests === false;
            const isCopied = copiedId === user.userCode;

            return (
              <div
                key={user.id}
                className="group relative flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-purple-900/40 shadow-xs hover:shadow-lg hover:shadow-pink-500/10 hover:border-rose-300 dark:hover:border-purple-700 transition-all duration-200"
              >
                {/* Upper User Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <AvatarIllustration id={user.avatarId} size="lg" />
                      <div className="min-w-0">
                        <h3 className="font-['Outfit'] font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                          {user.nickname}
                        </h3>
                        <div className="text-xs font-mono text-purple-600 dark:text-pink-400 truncate">
                          @{user.username}
                        </div>
                        {/* Permanent LV- User ID with Copy Action */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="font-mono text-[10px] font-bold text-rose-600 dark:text-pink-300 bg-rose-50 dark:bg-purple-950/60 border border-rose-200/60 dark:border-purple-800/60 px-1.5 py-0.5 rounded">
                            {user.userCode}
                          </span>
                          <button
                            onClick={() => handleCopyUserCode(user.userCode)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded"
                            title="Copy user ID"
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedBioUser(user)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-rose-50 dark:hover:bg-purple-950/50"
                      title="View character bio"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Character Description / Romantic Bio */}
                  {user.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      "{user.description}"
                    </p>
                  )}

                  {/* Love Motto */}
                  {user.loveMotto && (
                    <div className="text-[11px] text-rose-500 dark:text-pink-300/90 italic flex items-center gap-1 line-clamp-1">
                      <span>✨</span>
                      <span>{user.loveMotto}</span>
                    </div>
                  )}

                  {/* Privacy Flag Note if Requests Disabled */}
                  {requestsDisabled && (
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg">
                      🔒 User is currently not accepting new message requests
                    </div>
                  )}
                </div>

                {/* State Machine Action Footer */}
                <div className="pt-4 mt-3 border-t border-rose-50 dark:border-purple-950/60 flex items-center justify-between gap-2">
                  {isSelf ? (
                    <span className="text-xs text-slate-400 italic">This is your account</span>
                  ) : rel.state === 'ACCEPTED' ? (
                    <div className="w-full flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenChat(user.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold text-rose-600 dark:text-pink-400 bg-rose-50 dark:bg-purple-950/50 hover:bg-rose-100 rounded-xl transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>

                      {rel.isCouple ? (
                        <span className="px-2.5 py-2 text-xs font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 rounded-xl flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-pink-500" />
                          <span>Couple</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenCoupleModal(user)}
                          className="flex items-center gap-1 py-2 px-2.5 text-xs font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl shadow-xs hover:opacity-90"
                          title="Propose mutual couple bond"
                        >
                          <Heart className="w-3.5 h-3.5" />
                          <span>Propose Bond</span>
                        </button>
                      )}
                    </div>
                  ) : rel.state === 'PENDING_SENT' ? (
                    <div className="w-full flex items-center justify-between py-1.5 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Request Pending</span>
                      </span>
                      <span className="text-[10px] text-purple-500 font-mono">Delivered</span>
                    </div>
                  ) : rel.state === 'PENDING_RECEIVED' ? (
                    <div className="w-full flex items-center gap-1.5">
                      <button
                        onClick={async () => {
                          if (rel.requestId) {
                            await onAcceptRequest(rel.requestId);
                            fetchUsers(searchQuery, page);
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Request</span>
                      </button>
                      <button
                        onClick={async () => {
                          if (rel.requestId) {
                            await onDeclineRequest(rel.requestId);
                            fetchUsers(searchQuery, page);
                          }
                        }}
                        className="py-1.5 px-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                      >
                        Decline
                      </button>
                    </div>
                  ) : rel.state === 'BLOCKED' ? (
                    <div className="w-full flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs">
                      <span>Blocked</span>
                      <button
                        onClick={async () => {
                          await onUnblockUser(user.id);
                          fetchUsers(searchQuery, page);
                        }}
                        className="text-rose-600 hover:underline font-medium"
                      >
                        Unblock
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex items-center gap-2">
                      <button
                        onClick={() => handleOpenSendModal(user)}
                        disabled={requestsDisabled}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-sm shadow-pink-500/10 active:scale-[0.98] transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Request</span>
                      </button>
                      <button
                        onClick={() => handleOpenReportModal(user)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Report or block user"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-rose-200 dark:border-purple-900 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-rose-200 dark:border-purple-900 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Character Bio Drawer Modal */}
      {selectedBioUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-purple-900/60 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <AvatarIllustration id={selectedBioUser.avatarId} size="xl" />
                <div>
                  <h3 className="font-['Outfit'] font-bold text-lg text-slate-900 dark:text-slate-100">
                    {selectedBioUser.nickname}
                  </h3>
                  <div className="text-xs font-mono text-purple-600 dark:text-pink-400">
                    @{selectedBioUser.username}
                  </div>
                  <div className="font-mono text-[11px] font-bold text-rose-600 dark:text-pink-300 mt-0.5">
                    ID: {selectedBioUser.userCode}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedBioUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                  Romantic Bio
                </span>
                <p className="mt-1 leading-relaxed bg-rose-50/50 dark:bg-purple-950/30 p-3 rounded-xl">
                  {selectedBioUser.description || 'No bio written yet.'}
                </p>
              </div>

              {selectedBioUser.loveMotto && (
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                    Love Motto
                  </span>
                  <p className="mt-1 italic text-rose-600 dark:text-pink-300">
                    "{selectedBioUser.loveMotto}"
                  </p>
                </div>
              )}

              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                  Avatar Archetype
                </span>
                <p className="mt-1 text-slate-500">
                  {AVATAR_METADATA[selectedBioUser.avatarId]?.description}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBioUser(null)}
                className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-pink-400 bg-rose-50 dark:bg-purple-950 rounded-xl hover:bg-rose-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Request Modal */}
      <SendRequestModal
        isOpen={isSendModalOpen}
        targetUser={modalTargetUser}
        onClose={() => setIsSendModalOpen(false)}
        onSend={async (targetId, intro) => {
          const res = await onSendRequest(targetId, intro);
          if (res.success) {
            fetchUsers(searchQuery, page);
          }
          return res;
        }}
      />

      {/* Couple Invitation Modal */}
      <CoupleInvitationModal
        isOpen={isCoupleModalOpen}
        targetUser={modalTargetUser}
        onClose={() => setIsCoupleModalOpen(false)}
        onPropose={async (targetId, anniv, vow) => {
          const res = await onProposeCouple(targetId, anniv, vow);
          if (res.success) {
            fetchUsers(searchQuery, page);
          }
          return res;
        }}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        targetUser={modalTargetUser}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={async (targetId, reason, details, andBlock) => {
          const ok = await onSubmitReport(targetId, reason, details, andBlock);
          if (ok) {
            fetchUsers(searchQuery, page);
          }
          return ok;
        }}
      />
    </div>
  );
};
