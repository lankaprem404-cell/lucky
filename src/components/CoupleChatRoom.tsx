import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Lock,
  MoreVertical,
  ShieldAlert,
  Sparkles,
  Heart,
  Check,
  CheckCheck,
  Copy,
  Clock,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { User, ChatMessage, LoveVaultTheme } from '../types.js';
import { AvatarIllustration, AVATAR_METADATA } from './AvatarIllustration.js';
import { ReportModal } from './ReportModal.js';
import { LLHeartsBrand } from './LLHeartsBrand.js';
import { ALL_12_THEMES } from '../themeConfig.js';
import { CoupleInvitationModal } from './CoupleInvitationModal.js';

interface CoupleChatRoomProps {
  currentUser: User;
  partnerId: string;
  currentTheme: LoveVaultTheme;
  onBack: () => void;
  onOpenVault: () => void;
  onProposeCouple: (recipientId: string, anniversaryDate: string, vowMessage: string) => Promise<{ success: boolean; error?: string }>;
  onBlockUser: (targetUserId: string) => Promise<boolean>;
  onSubmitReport: (
    targetUserId: string,
    reason: any,
    details: string,
    andBlock: boolean
  ) => Promise<boolean>;
}

const LOVE_EMOJIS = ['💖', '💌', '🌹', '✨', '🌙', '🕊️', '🥂', '🌸'];

export const CoupleChatRoom: React.FC<CoupleChatRoomProps> = ({
  currentUser,
  partnerId,
  currentTheme,
  onBack,
  onOpenVault,
  onProposeCouple,
  onBlockUser,
  onSubmitReport,
}) => {
  const [partner, setPartner] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCoupleModalOpen, setIsCoupleModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const themeDef = ALL_12_THEMES[currentTheme] || ALL_12_THEMES.ll_hearts;

  const fetchChat = async () => {
    try {
      const res = await fetch(`/api/chats/${partnerId}/messages`, {
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        const data = await res.json();
        setPartner(data.partner);
        setMessages(
          (data.messages || []).map((m: ChatMessage) => ({
            ...m,
            status: m.status || 'sent',
          }))
        );
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to load conversation');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChat();
  }, [partnerId, currentUser.id]);

  // Real-time Event Subscription for Incoming Messages and Read Status
  useEffect(() => {
    const handleIncomingRealtimeMessage = (event: Event) => {
      const customEvent = event as CustomEvent<ChatMessage>;
      const newMsg = customEvent.detail;
      if (!newMsg) return;

      const isForThisChat =
        (newMsg.senderId === partnerId && newMsg.recipientId === currentUser.id) ||
        (newMsg.senderId === currentUser.id && newMsg.recipientId === partnerId);

      if (!isForThisChat) return;

      setMessages((prev) => {
        // Prevent duplicate: check by permanent message ID
        const existsById = prev.some((m) => m.id === newMsg.id);
        if (existsById) {
          return prev.map((m) =>
            m.id === newMsg.id ? { ...m, ...newMsg, status: 'sent' } : m
          );
        }

        // Check if matching an optimistic pending message from current user
        const optimisticIndex = prev.findIndex(
          (m) =>
            m.senderId === newMsg.senderId &&
            m.text === newMsg.text &&
            (m.status === 'sending' || m.id.startsWith('temp_'))
        );
        if (optimisticIndex !== -1) {
          const updated = [...prev];
          updated[optimisticIndex] = { ...newMsg, status: 'sent' };
          return updated;
        }

        // Otherwise append new message
        return [...prev, { ...newMsg, status: 'sent' }];
      });

      // If message is from partner and chat is currently open, mark as read on backend
      if (newMsg.senderId === partnerId) {
        fetch(`/api/chats/${partnerId}/read`, {
          method: 'POST',
          headers: { 'x-user-id': currentUser.id },
        }).catch(() => {});
      }
    };

    const handleMessagesRead = (event: Event) => {
      const customEvent = event as CustomEvent<{ readerId: string; partnerId: string; conversationId: string }>;
      const detail = customEvent.detail;
      if (!detail) return;
      if (detail.readerId === partnerId) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId === currentUser.id ? { ...m, read: true } : m))
        );
      }
    };

    window.addEventListener('love_vault:new_message', handleIncomingRealtimeMessage);
    window.addEventListener('love_vault:messages_read', handleMessagesRead);

    return () => {
      window.removeEventListener('love_vault:new_message', handleIncomingRealtimeMessage);
      window.removeEventListener('love_vault:messages_read', handleMessagesRead);
    };
  }, [partnerId, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendPayload = async (tempId: string, text: string) => {
    try {
      const res = await fetch(`/api/chats/${partnerId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        const serverMsg: ChatMessage = data.message;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...serverMsg, status: 'sent' } : m
          )
        );
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Failed to send message');
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
        );
      }
    } catch {
      setErrorMsg('Network error sending message');
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
      );
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || isSending) return;

    setErrorMsg(null);
    setInputText('');

    // 1. Immediately display message inside open chat with 'sending' status
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      conversationId: [currentUser.id, partnerId].sort().join('_'),
      senderId: currentUser.id,
      recipientId: partnerId,
      text: textToSend,
      createdAt: Date.now(),
      read: false,
      status: 'sending',
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // 2. Transmit to backend database
    setIsSending(true);
    try {
      await sendPayload(tempId, textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleRetry = async (msg: ChatMessage) => {
    setErrorMsg(null);
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, status: 'sending' } : m))
    );
    await sendPayload(msg.id, msg.text);
  };

  const handleEmojiClick = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const handleCopyPartnerCode = () => {
    if (!partner) return;
    navigator.clipboard.writeText(partner.userCode);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const introNote = messages.find((m) => m.isIntroNote);
  const isCoupleBonded = currentUser.partnerId === partnerId || partner?.partnerId === currentUser.id;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-5rem)]">
      {/* Chat Top Bar with LL Hearts Branding */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-purple-900/40 shadow-xs mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-rose-50 dark:hover:bg-purple-950/40 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {partner && (
            <div className="flex items-center gap-2.5">
              <AvatarIllustration id={partner.avatarId} size="md" showBadge />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Outfit'] font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                    {partner.nickname}
                  </h3>
                  <button
                    onClick={handleCopyPartnerCode}
                    className="flex items-center gap-1 font-mono text-[10px] font-bold text-rose-600 dark:text-pink-300 bg-rose-50 dark:bg-purple-950/60 border border-rose-200/60 dark:border-purple-800/60 px-1.5 py-0.5 rounded hover:bg-rose-100 transition-colors"
                    title="Click to copy permanent user ID"
                  >
                    <span>{partner.userCode}</span>
                    {copiedId ? (
                      <Check className="w-2.5 h-2.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-2.5 h-2.5" />
                    )}
                  </button>
                </div>
                <div className="text-[11px] text-rose-500 dark:text-pink-400 flex items-center gap-1 mt-0.5">
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                  <span>{isCoupleBonded ? 'Connected Couple 💍' : 'Connected Soulmates'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Bar Actions & LL Hearts Brand Indicator */}
        <div className="flex items-center gap-2 relative">
          {/* Display LL Hearts Branding in default chat interface */}
          <div className="hidden sm:block">
            <LLHeartsBrand size="sm" />
          </div>

          {!isCoupleBonded && (
            <button
              onClick={() => setIsCoupleModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl shadow-xs hover:opacity-90 transition-all"
              title="Propose mutual couple bond"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">Propose Couple Bond</span>
            </button>
          )}

          <button
            onClick={onOpenVault}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-pink-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/60 rounded-xl hover:bg-purple-100 transition-colors"
            title="Open Private Couple Vault"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vault</span>
          </button>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && partner && (
            <div className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-rose-100 dark:border-purple-800/60 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setIsReportOpen(true);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Report Abuse</span>
              </button>
              <button
                onClick={async () => {
                  setShowMenu(false);
                  await onBlockUser(partner.id);
                  onBack();
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Block User</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 rounded-3xl bg-rose-50/25 dark:bg-slate-950/40 border border-rose-100/60 dark:border-purple-900/30 space-y-4">
        {/* Intro Note Anchor */}
        {introNote && (
          <div className="max-w-md mx-auto my-2 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-rose-200/70 dark:border-purple-800/50 shadow-xs text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-rose-600 dark:text-pink-400 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Accepted Introductory Message Request</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 italic">
              "{introNote.text}"
            </p>
          </div>
        )}

        {messages
          .filter((m) => !m.isIntroNote)
          .map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all ${
                    isMe
                      ? `${themeDef.chatBubbleMe} rounded-br-xs`
                      : `${themeDef.chatBubblePartner} rounded-bl-xs`
                  } ${
                    msg.status === 'failed'
                      ? 'border-2 border-red-400 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200'
                      : ''
                  } ${msg.status === 'sending' ? 'opacity-70' : ''}`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-400 font-mono">
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isMe && (
                    <>
                      {msg.status === 'sending' && (
                        <span className="flex items-center gap-1 text-slate-400" title="Sending...">
                          <Clock className="w-2.5 h-2.5 animate-spin" />
                          <span className="text-[9px]">Sending</span>
                        </span>
                      )}
                      {msg.status === 'failed' && (
                        <span className="flex items-center gap-1 text-red-500 font-sans font-semibold">
                          <AlertCircle className="w-3 h-3 text-red-500" />
                          <span>Failed</span>
                          <button
                            type="button"
                            onClick={() => handleRetry(msg)}
                            className="inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors"
                            title="Retry sending message"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Retry</span>
                          </button>
                        </span>
                      )}
                      {(msg.status === 'sent' || !msg.status) && (
                        <span title={msg.read ? 'Read' : 'Delivered'}>
                          {msg.read ? (
                            <CheckCheck className="w-3.5 h-3.5 text-purple-400" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="my-2 p-2.5 rounded-xl bg-red-50 text-red-600 text-xs text-center border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Emoji Shortcuts & Input Field */}
      <div className="pt-2 space-y-2">
        <div className="flex items-center gap-1.5 px-2 overflow-x-auto py-1">
          {LOVE_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="p-1.5 text-base hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${partner?.nickname || ''}...`}
            className="w-full pl-4 pr-14 py-3 bg-white dark:bg-slate-900 border border-rose-200 dark:border-purple-800/60 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-400/30 shadow-xs"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className={`absolute right-2 p-2 ${themeDef.primaryButton} disabled:opacity-40 rounded-xl shadow-xs transition-all`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Couple Invitation Modal */}
      <CoupleInvitationModal
        isOpen={isCoupleModalOpen}
        targetUser={partner}
        onClose={() => setIsCoupleModalOpen(false)}
        onPropose={onProposeCouple}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        targetUser={partner}
        onClose={() => setIsReportOpen(false)}
        onSubmitReport={onSubmitReport}
      />
    </div>
  );
};
