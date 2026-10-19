import React, { useState } from 'react';
import {
  Inbox,
  Check,
  X,
  UserX,
  Send,
  Sparkles,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Heart,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MessageRequest, User, CoupleInvitation } from '../types.js';
import { AvatarIllustration, AVATAR_METADATA } from './AvatarIllustration.js';
import { ReportModal } from './ReportModal.js';

interface MessageRequestsInboxProps {
  currentUser: User | null;
  receivedRequests: Array<MessageRequest & { sender?: User }>;
  sentRequests: Array<MessageRequest & { recipient?: User }>;
  coupleInvitations: {
    received: Array<CoupleInvitation & { proposer?: User }>;
    sent: Array<CoupleInvitation & { recipient?: User }>;
  };
  onAcceptRequest: (requestId: string) => Promise<boolean>;
  onDeclineRequest: (requestId: string) => Promise<boolean>;
  onCancelRequest: (requestId: string) => Promise<boolean>;
  onAcceptCoupleInvitation: (invitationId: string) => Promise<boolean>;
  onDeclineCoupleInvitation: (invitationId: string) => Promise<boolean>;
  onBlockUser: (targetUserId: string) => Promise<boolean>;
  onSubmitReport: (
    targetUserId: string,
    reason: any,
    details: string,
    andBlock: boolean
  ) => Promise<boolean>;
  onOpenChat: (partnerId: string) => void;
}

export const MessageRequestsInbox: React.FC<MessageRequestsInboxProps> = ({
  currentUser,
  receivedRequests,
  sentRequests,
  coupleInvitations,
  onAcceptRequest,
  onDeclineRequest,
  onCancelRequest,
  onAcceptCoupleInvitation,
  onDeclineCoupleInvitation,
  onBlockUser,
  onSubmitReport,
  onOpenChat,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'couple_bonds' | 'sent' | 'history'>('pending');
  const [reportingUser, setReportingUser] = useState<User | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingReceived = receivedRequests.filter((r) => r.status === 'PENDING');
  const historyReceived = receivedRequests.filter((r) => r.status !== 'PENDING');
  const pendingCoupleReceived = coupleInvitations.received.filter((ci) => ci.status === 'PENDING');

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    const ok = await onAcceptRequest(requestId);
    setProcessingId(null);
    if (ok) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#c084fc', '#ffd700'],
        });
      } catch {}
    }
  };

  const handleAcceptCouple = async (invitationId: string) => {
    setProcessingId(invitationId);
    const ok = await onAcceptCoupleInvitation(invitationId);
    setProcessingId(null);
    if (ok) {
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#f43f5e', '#a855f7', '#ffd700', '#ec4899'],
        });
      } catch {}
    }
  };

  const handleDecline = async (requestId: string) => {
    setProcessingId(requestId);
    await onDeclineRequest(requestId);
    setProcessingId(null);
  };

  const handleCancel = async (requestId: string) => {
    setProcessingId(requestId);
    await onCancelRequest(requestId);
    setProcessingId(null);
  };

  const openReport = (user: User) => {
    setReportingUser(user);
    setIsReportOpen(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Inbox Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-purple-900/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-['Outfit'] font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">
              Message Requests &amp; Inboxes
            </h1>
            {pendingReceived.length + pendingCoupleReceived.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse">
                {pendingReceived.length + pendingCoupleReceived.length} new
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Introductory notes and mutual-consent couple invitations. Your private Couple Vault remains locked until you accept.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-rose-50/70 dark:bg-purple-950/50 border border-rose-100 dark:border-purple-900/40 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'pending'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-pink-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Message Requests ({pendingReceived.length})
          </button>

          <button
            onClick={() => setActiveTab('couple_bonds')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'couple_bonds'
                ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            <span>Couple Bonds ({pendingCoupleReceived.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'sent'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-pink-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Sent ({sentRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-pink-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200">
        <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-pink-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold">Protected Vault Isolation:</span>
          <p className="text-purple-800/80 dark:text-purple-300/80 leading-relaxed text-[11px]">
            Message requests let you safely review an introductory note before granting chat access. Both soulmates must mutually agree before a Couple Bond is formed. Private PINs and private vault data are never revealed to pending requesters.
          </p>
        </div>
      </div>

      {/* Tab: Pending Message Requests */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingReceived.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-rose-100 dark:border-purple-900/40 space-y-3">
              <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-purple-950 flex items-center justify-center mx-auto text-rose-400">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                No Pending Message Requests
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You're all caught up! Switch accounts in the top navigation to test sending requests between users.
              </p>
            </div>
          ) : (
            pendingReceived.map((req) => {
              const sender = req.sender;
              const meta = sender ? AVATAR_METADATA[sender.avatarId] : null;

              return (
                <div
                  key={req.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-purple-900/40 shadow-xs hover:border-rose-300 dark:hover:border-purple-700 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {sender && <AvatarIllustration id={sender.avatarId} size="lg" />}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-['Outfit'] font-bold text-base text-slate-900 dark:text-slate-100">
                            {sender?.nickname || 'Unknown Soulmate'}
                          </h3>
                          <span className="font-mono text-[11px] font-bold text-rose-600 dark:text-pink-300 bg-rose-50 dark:bg-purple-950/60 border border-rose-200/60 dark:border-purple-800/60 px-1.5 py-0.5 rounded">
                            {sender?.userCode}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          @{sender?.username} · {meta?.species} · {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {sender && (
                        <button
                          onClick={() => openReport(sender)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                          title="Report abuse or spam"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Introductory Message Card (Sealed Love Note Style) */}
                  <div className="relative p-4 rounded-2xl bg-gradient-to-r from-rose-50/80 via-pink-50/50 to-purple-50/80 dark:from-purple-950/40 dark:via-slate-800/40 dark:to-purple-950/40 border border-rose-100 dark:border-purple-900/40 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-rose-500 dark:text-pink-400 font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Protected Introductory Note</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {req.introMessage.length} / 280 chars
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed pt-1">
                      "{req.introMessage}"
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>🔒</span>
                      <span>Couple Vault locked until you accept</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecline(req.id)}
                        disabled={processingId === req.id}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        Decline
                      </button>

                      {sender && (
                        <button
                          onClick={async () => {
                            await onBlockUser(sender.id);
                          }}
                          className="px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                        >
                          Block
                        </button>
                      )}

                      <button
                        onClick={() => handleAccept(req.id)}
                        disabled={processingId === req.id}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 rounded-xl shadow-md shadow-pink-500/20 active:scale-[0.98] transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Request &amp; Connect</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Mutual-Consent Couple Bonds */}
      {activeTab === 'couple_bonds' && (
        <div className="space-y-4">
          {pendingCoupleReceived.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-rose-100 dark:border-purple-900/40 space-y-2">
              <Heart className="w-8 h-8 text-pink-400 mx-auto" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                No Pending Couple Invitations
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once you are connected with a soulmate, either partner can propose a mutual Couple Bond with vows and an anniversary date!
              </p>
            </div>
          ) : (
            pendingCoupleReceived.map((inv) => {
              const proposer = inv.proposer;
              return (
                <div
                  key={inv.id}
                  className="p-6 rounded-3xl bg-gradient-to-br from-pink-50/60 via-purple-50/40 to-rose-50/50 dark:from-purple-950/50 dark:via-slate-900 dark:to-purple-950/40 border border-pink-200 dark:border-purple-800/60 shadow-md space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {proposer && <AvatarIllustration id={proposer.avatarId} size="lg" />}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-['Outfit'] font-bold text-base text-slate-900 dark:text-slate-100">
                            {proposer?.nickname}
                          </h3>
                          <span className="font-mono text-[11px] font-bold text-rose-600 dark:text-pink-300 bg-rose-100/70 dark:bg-purple-900/50 px-1.5 py-0.5 rounded">
                            {proposer?.userCode}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-pink-500" />
                          <span>Anniversary Date: <strong>{inv.anniversaryDate}</strong></span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 text-xs font-bold uppercase tracking-wider">
                      Couple Bond Proposal
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-pink-100 dark:border-purple-900/40 text-xs italic text-slate-700 dark:text-slate-200 leading-relaxed">
                    "{inv.vowMessage}"
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      onClick={() => onDeclineCoupleInvitation(inv.id)}
                      disabled={processingId === inv.id}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                    >
                      Decline Proposal
                    </button>

                    <button
                      onClick={() => handleAcceptCouple(inv.id)}
                      disabled={processingId === inv.id}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 rounded-xl shadow-md shadow-pink-500/25 active:scale-95 transition-all"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Accept &amp; Seal Couple Bond 💍</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Sent Requests */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {sentRequests.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-rose-100 dark:border-purple-900/40 space-y-2">
              <Send className="w-6 h-6 text-slate-400 mx-auto" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                No Sent Requests
              </h3>
              <p className="text-xs text-slate-500">
                You have not sent any pending requests yet. Visit the Search Users screen to connect!
              </p>
            </div>
          ) : (
            sentRequests.map((req) => {
              const recipient = req.recipient;
              return (
                <div
                  key={req.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-purple-900/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {recipient && <AvatarIllustration id={recipient.avatarId} size="md" />}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                            Sent to {recipient?.nickname || 'User'}
                          </span>
                          <span className="text-xs text-purple-600 dark:text-pink-400 font-mono">
                            {recipient?.userCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(req.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          req.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300'
                            : req.status === 'ACCEPTED'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {req.status === 'PENDING'
                          ? 'Awaiting Recipient Response'
                          : req.status === 'ACCEPTED'
                          ? 'Connected · Accepted'
                          : req.status}
                      </span>

                      {req.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(req.id)}
                          className="px-2.5 py-1 text-xs text-slate-500 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Cancel Request
                        </button>
                      )}

                      {req.status === 'ACCEPTED' && recipient && (
                        <button
                          onClick={() => onOpenChat(recipient.id)}
                          className="px-3 py-1 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"
                        >
                          Chat
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs italic text-slate-600 dark:text-slate-300">
                    "{req.introMessage}"
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {historyReceived.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-rose-100 dark:border-purple-900/40 space-y-2">
              <Calendar className="w-6 h-6 text-slate-400 mx-auto" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                No Request History
              </h3>
              <p className="text-xs text-slate-500">
                Past accepted or declined requests will appear here.
              </p>
            </div>
          ) : (
            historyReceived.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-purple-950 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {req.sender && <AvatarIllustration id={req.sender.avatarId} size="sm" />}
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {req.sender?.nickname} ({req.sender?.userCode})
                    </span>
                    <p className="text-[11px] text-slate-400 truncate max-w-md">
                      "{req.introMessage}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      req.status === 'ACCEPTED'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {req.status}
                  </span>
                  {req.status === 'ACCEPTED' && req.sender && (
                    <button
                      onClick={() => onOpenChat(req.sender!.id)}
                      className="px-2.5 py-1 text-xs text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"
                    >
                      Chat
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Abuse Reporting Modal */}
      <ReportModal
        isOpen={isReportOpen}
        targetUser={reportingUser}
        onClose={() => setIsReportOpen(false)}
        onSubmitReport={onSubmitReport}
      />
    </div>
  );
};
