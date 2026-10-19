import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TopNav } from './components/TopNav.js';
import { ChatsView } from './components/ChatsView.js';
import { CoupleChatRoom } from './components/CoupleChatRoom.js';
import { SearchUsersView } from './components/SearchUsersView.js';
import { MessageRequestsInbox } from './components/MessageRequestsInbox.js';
import { PrivateVaultView } from './components/PrivateVaultView.js';
import { SecurityTestsView } from './components/SecurityTestsView.js';
import { SettingsView } from './components/SettingsView.js';
import { WelcomeLoginModal } from './components/WelcomeLoginModal.js';
import { MobileDownloadModal } from './components/MobileDownloadModal.js';
import { User, MessageRequest, CoupleInvitation, LoveVaultTheme, ChatMessage } from './types.js';
import { ALL_12_THEMES } from './themeConfig.js';
import { Sparkles, Heart, Bell, X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type?: 'request' | 'message' | 'accepted' | 'couple' | 'info';
  partnerId?: string;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'chats' | 'search' | 'requests' | 'vault' | 'security' | 'settings'
  >('chats');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  
  // Mandatory default theme: LL Hearts on every new account and first device launch
  const [theme, setTheme] = useState<LoveVaultTheme>(() => {
    return (localStorage.getItem('love_vault_theme') as LoveVaultTheme) || 'll_hearts';
  });

  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [conversations, setConversations] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Array<MessageRequest & { sender?: User }>>([]);
  const [sentRequests, setSentRequests] = useState<Array<MessageRequest & { recipient?: User }>>([]);
  const [coupleInvitations, setCoupleInvitations] = useState<{
    received: Array<CoupleInvitation & { proposer?: User }>;
    sent: Array<CoupleInvitation & { recipient?: User }>;
  }>({ received: [], sent: [] });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(() => {
    // Show welcome modal on first device launch
    const seen = localStorage.getItem('love_vault_seen_welcome');
    return !seen;
  });

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const sharedAppUrl =
    typeof window !== 'undefined' && window.location.origin.includes('run.app')
      ? window.location.origin
      : 'https://ais-pre-txdqywnjb5i6mjbcjgsrur-862553221656.asia-east1.run.app';

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Persistent active user ID in localStorage (defaults to usr_juliet)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('love_vault_active_user') || 'usr_juliet';
  });

  const activePartnerIdRef = useRef<string | null>(activePartnerId);
  const currentTabRef = useRef(currentTab);
  const allUsersRef = useRef<User[]>(allUsers);

  useEffect(() => {
    activePartnerIdRef.current = activePartnerId;
  }, [activePartnerId]);

  useEffect(() => {
    currentTabRef.current = currentTab;
  }, [currentTab]);

  useEffect(() => {
    allUsersRef.current = allUsers;
  }, [allUsers]);

  const showToast = useCallback((title: string, message: string, type: ToastNotification['type'] = 'info', partnerId?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type, partnerId }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  // Fetch current user and all registered users
  const fetchAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setPendingRequestsCount(data.pendingRequestsCount || 0);

        // Apply persisted user theme if exists, otherwise fallback to ll_hearts
        if (data.user?.theme) {
          setTheme(data.user.theme);
          localStorage.setItem('love_vault_theme', data.user.theme);
        }
      }

      const usersRes = await fetch('/api/auth/users');
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setAllUsers(uData.users || []);
      }
    } catch (err) {
      console.error('Failed to load user', err);
    }
  }, [currentUserId]);

  // Fetch requests, chats, and couple invitations
  const fetchRequestsAndChats = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const reqRes = await fetch('/api/requests', {
        headers: { 'x-user-id': currentUserId },
      });
      if (reqRes.ok) {
        const rData = await reqRes.json();
        setReceivedRequests(rData.received || []);
        setSentRequests(rData.sent || []);
        setPendingRequestsCount(rData.pendingReceivedCount || 0);
      }

      const chatRes = await fetch('/api/chats', {
        headers: { 'x-user-id': currentUserId },
      });
      if (chatRes.ok) {
        const cData = await chatRes.json();
        setConversations(cData.conversations || []);
      }

      const coupleRes = await fetch('/api/couple/invitations', {
        headers: { 'x-user-id': currentUserId },
      });
      if (coupleRes.ok) {
        const ciData = await coupleRes.json();
        setCoupleInvitations(ciData);
      }
    } catch (err) {
      console.error(err);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchAuth();
    fetchRequestsAndChats();
  }, [fetchAuth, fetchRequestsAndChats]);

  // Real-time SSE Connection
  useEffect(() => {
    if (!currentUserId) return;

    const sse = new EventSource(`/api/realtime?userId=${currentUserId}`);

    sse.addEventListener('REQUEST_RECEIVED', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        showToast(
          'New Message Request! 💌',
          `${data.sender?.nickname || 'Someone'} (${data.sender?.userCode || ''}) sent you an introductory note.`,
          'request'
        );
        fetchRequestsAndChats();
        fetchAuth();
      } catch (err) {
        console.error(err);
      }
    });

    sse.addEventListener('REQUEST_ACCEPTED', (e: MessageEvent) => {
      try {
        showToast(
          'Request Accepted! 💖',
          'Your connection was accepted. You can now chat in Love Vault!',
          'accepted'
        );
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
        fetchRequestsAndChats();
      } catch (err) {
        console.error(err);
      }
    });

    sse.addEventListener('COUPLE_PROPOSED', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        showToast(
          'Mutual Couple Proposal 💍',
          `${data.proposer?.nickname || 'Someone'} proposed sealing a Couple Bond with you!`,
          'couple'
        );
        fetchRequestsAndChats();
      } catch (err) {
        console.error(err);
      }
    });

    sse.addEventListener('COUPLE_ACCEPTED', (e: MessageEvent) => {
      try {
        showToast(
          'Couple Bond Sealed! 💍💖',
          'Congratulations! You and your partner have mutually sealed your couple bond in Love Vault!',
          'couple'
        );
        try {
          confetti({
            particleCount: 130,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#f43f5e', '#a855f7', '#ffd700'],
          });
        } catch {}
        fetchRequestsAndChats();
        fetchAuth();
      } catch (err) {
        console.error(err);
      }
    });

    sse.addEventListener('NEW_MESSAGE', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        const incomingMsg: ChatMessage = data.message;
        if (!incomingMsg) return;

        // 1. Dispatch window event to immediately update any open chat room
        window.dispatchEvent(
          new CustomEvent('love_vault:new_message', { detail: incomingMsg })
        );

        // 2. Refresh conversation list metadata (last message, unread badges)
        fetchRequestsAndChats();

        // 3. Supplementary notification only if message is from another user and chat is not open with them
        if (incomingMsg.senderId !== currentUserId) {
          const isChatCurrentlyOpenWithSender =
            currentTabRef.current === 'chats' && activePartnerIdRef.current === incomingMsg.senderId;

          // If the chat is not open in front of the user, show supplementary toast with click-to-open
          if (!isChatCurrentlyOpenWithSender) {
            const senderUser = allUsersRef.current.find((u) => u.id === incomingMsg.senderId);
            const senderName = senderUser?.nickname || 'Soulmate';
            showToast(
              `New Message from ${senderName} 💬`,
              incomingMsg.text,
              'message',
              incomingMsg.senderId
            );
          }
        }
      } catch (err) {
        console.error('Error handling NEW_MESSAGE SSE:', err);
      }
    });

    sse.addEventListener('MESSAGES_READ', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        window.dispatchEvent(
          new CustomEvent('love_vault:messages_read', { detail: data })
        );
        fetchRequestsAndChats();
      } catch (err) {
        console.error('Error handling MESSAGES_READ SSE:', err);
      }
    });

    return () => {
      sse.close();
    };
  }, [currentUserId, fetchRequestsAndChats, fetchAuth, showToast]);

  const handleSwitchUser = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem('love_vault_active_user', userId);
    setActivePartnerId(null);
    showToast('Switched Account', `Switched active soulmate account`, 'info');
  };

  const handleRegisterUser = async (data: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const resData = await res.json();
        // Mandatory LL Hearts theme for new accounts
        setTheme('ll_hearts');
        localStorage.setItem('love_vault_theme', 'll_hearts');
        setCurrentUserId(resData.user.id);
        localStorage.setItem('love_vault_active_user', resData.user.id);
        localStorage.setItem('love_vault_seen_welcome', 'true');
        showToast('Welcome to Love Vault! ♥', `Your permanent ID is ${resData.user.userCode}`, 'accepted');
        fetchAuth();
        fetchRequestsAndChats();
        return { success: true, user: resData.user };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Registration failed' };
      }
    } catch {
      return { success: false, error: 'Network error registering' };
    }
  };

  const handleSendRequest = async (recipientId: string, introMessage: string) => {
    try {
      const res = await fetch('/api/requests/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({ recipientId, introMessage }),
      });

      if (res.ok) {
        showToast('Request Sent ✨', 'Your message request was delivered safely.', 'info');
        fetchRequestsAndChats();
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Failed to send request' };
      }
    } catch {
      return { success: false, error: 'Network error sending request' };
    }
  };

  const handleProposeCouple = async (recipientId: string, anniversaryDate: string, vowMessage: string) => {
    try {
      const res = await fetch('/api/couple/propose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({ recipientId, anniversaryDate, vowMessage }),
      });

      if (res.ok) {
        showToast('Couple Proposal Sent 💍', 'Your couple invitation has been sent for mutual consent.', 'couple');
        fetchRequestsAndChats();
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Failed to propose couple bond' };
      }
    } catch {
      return { success: false, error: 'Network error sending couple proposal' };
    }
  };

  const handleAcceptCoupleInvitation = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/couple/invitations/${invitationId}/accept`, {
        method: 'POST',
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        showToast('Couple Bond Sealed 💍💖', 'You are now an official couple in Love Vault!', 'couple');
        fetchRequestsAndChats();
        fetchAuth();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleDeclineCoupleInvitation = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/couple/invitations/${invitationId}/decline`, {
        method: 'POST',
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        showToast('Proposal Declined', 'Couple invitation was declined.', 'info');
        fetchRequestsAndChats();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        showToast('Request Accepted 💖', 'Connected! You can now chat and share memories.', 'accepted');
        fetchRequestsAndChats();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/decline`, {
        method: 'POST',
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        showToast('Request Declined', 'The message request was politely declined.', 'info');
        fetchRequestsAndChats();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/cancel`, {
        method: 'POST',
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        showToast('Request Cancelled', 'Your pending request was cancelled.', 'info');
        fetchRequestsAndChats();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleBlockUser = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/users/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({ targetUserId }),
      });
      if (res.ok) {
        showToast('User Blocked', 'This user cannot send you requests or find you in search.', 'info');
        fetchAuth();
        fetchRequestsAndChats();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleUnblockUser = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/users/unblock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({ targetUserId }),
      });
      if (res.ok) {
        showToast('User Unblocked', 'User unblocked successfully.', 'info');
        fetchAuth();
        fetchRequestsAndChats();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleReportAbuse = async (
    targetUserId: string,
    reason: any,
    details: string,
    andBlock: boolean
  ) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({ targetUserId, reason, details, andBlock }),
      });
      if (res.ok) {
        showToast('Report Received', 'Thank you for keeping Love Vault safe.', 'info');
        fetchAuth();
        fetchRequestsAndChats();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleUpdatePrivacy = async (privacyUpdates: any) => {
    try {
      const res = await fetch('/api/users/privacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify(privacyUpdates),
      });
      if (res.ok) {
        fetchAuth();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleUpdateProfile = async (profileUpdates: any) => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify(profileUpdates),
      });
      if (res.ok) {
        fetchAuth();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const currentThemeDef = ALL_12_THEMES[theme] || ALL_12_THEMES.ll_hearts;
  const totalUnreadChats = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const totalPendingBadges = pendingRequestsCount + coupleInvitations.received.filter(ci => ci.status === 'PENDING').length;

  return (
    <div className={`min-h-screen font-['Plus_Jakarta_Sans'] flex flex-col ${currentThemeDef.containerBg} transition-colors duration-300`}>
      {/* Top Bar Navigation */}
      <TopNav
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setActivePartnerId(null);
          setCurrentTab(tab);
        }}
        currentUser={currentUser}
        allUsers={allUsers}
        currentTheme={theme}
        onSwitchUser={handleSwitchUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        pendingRequestsCount={totalPendingBadges}
        unreadChatsCount={totalUnreadChats}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 pb-16">
        {currentTab === 'chats' && (
          activePartnerId && currentUser ? (
            <CoupleChatRoom
              currentUser={currentUser}
              partnerId={activePartnerId}
              currentTheme={theme}
              onBack={() => {
                setActivePartnerId(null);
                fetchRequestsAndChats();
              }}
              onOpenVault={() => setCurrentTab('vault')}
              onProposeCouple={handleProposeCouple}
              onBlockUser={handleBlockUser}
              onSubmitReport={handleReportAbuse}
            />
          ) : (
            <ChatsView
              currentUser={currentUser}
              conversations={conversations}
              onSelectPartner={(pid) => setActivePartnerId(pid)}
              onNavigateToSearch={() => setCurrentTab('search')}
              onNavigateToRequests={() => setCurrentTab('requests')}
              onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
              pendingRequestsCount={totalPendingBadges}
            />
          )
        )}

        {currentTab === 'search' && (
          <SearchUsersView
            currentUser={currentUser}
            onOpenChat={(pid) => {
              setActivePartnerId(pid);
              setCurrentTab('chats');
            }}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
            onSendRequest={handleSendRequest}
            onProposeCouple={handleProposeCouple}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            onSubmitReport={handleReportAbuse}
          />
        )}

        {currentTab === 'requests' && (
          <MessageRequestsInbox
            currentUser={currentUser}
            receivedRequests={receivedRequests}
            sentRequests={sentRequests}
            coupleInvitations={coupleInvitations}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
            onCancelRequest={handleCancelRequest}
            onAcceptCoupleInvitation={handleAcceptCoupleInvitation}
            onDeclineCoupleInvitation={handleDeclineCoupleInvitation}
            onBlockUser={handleBlockUser}
            onSubmitReport={handleReportAbuse}
            onOpenChat={(pid) => {
              setActivePartnerId(pid);
              setCurrentTab('chats');
            }}
          />
        )}

        {currentTab === 'vault' && currentUser && (
          <PrivateVaultView
            currentUser={currentUser}
            partnerId={activePartnerId || currentUser.id}
            onNavigateToSearch={() => setCurrentTab('search')}
          />
        )}

        {currentTab === 'security' && <SecurityTestsView />}

        {currentTab === 'settings' && currentUser && (
          <SettingsView
            currentUser={currentUser}
            currentTheme={theme}
            onThemeChange={(newTheme) => {
              setTheme(newTheme);
              localStorage.setItem('love_vault_theme', newTheme);
            }}
            onUpdatePrivacy={handleUpdatePrivacy}
            onUpdateProfile={handleUpdateProfile}
            onUnblockUser={handleUnblockUser}
            onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          />
        )}
      </main>

      {/* Welcome & Login Modal (Features LL Hearts Glowing Branding) */}
      <WelcomeLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          localStorage.setItem('love_vault_seen_welcome', 'true');
        }}
        allUsers={allUsers}
        onSelectUser={handleSwitchUser}
        onRegisterUser={handleRegisterUser}
      />

      {/* Mobile Download / Install App Modal */}
      <MobileDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        sharedUrl={sharedAppUrl}
      />

      {/* Real-time Toast Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => {
              if (toast.partnerId) {
                setActivePartnerId(toast.partnerId);
                setCurrentTab('chats');
                setToasts((prev) => prev.filter((t) => t.id !== toast.id));
              }
            }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-purple-800 shadow-xl animate-in slide-in-from-bottom-3 duration-200 ${
              toast.partnerId ? 'cursor-pointer hover:border-rose-400 dark:hover:border-purple-500 hover:scale-[1.01] transition-all' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0">
              {toast.type === 'request' ? (
                <Sparkles className="w-4 h-4" />
              ) : toast.type === 'accepted' || toast.type === 'couple' ? (
                <Heart className="w-4 h-4 fill-white" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>{toast.title}</span>
                {toast.partnerId && (
                  <span className="text-[10px] text-rose-500 dark:text-pink-400 font-semibold underline">
                    Open Chat
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                {toast.message}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setToasts((prev) => prev.filter((t) => t.id !== toast.id));
              }}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
