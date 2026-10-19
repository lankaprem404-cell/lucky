import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  User,
  MessageRequest,
  ChatMessage,
  ReportRecord,
  VaultMemory,
  CoupleInvitation,
  LoveVaultTheme,
} from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'love_vault.json');

export interface DatabaseSchema {
  users: User[];
  requests: MessageRequest[];
  coupleInvitations: CoupleInvitation[];
  messages: ChatMessage[];
  reports: ReportRecord[];
  vaultMemories: VaultMemory[];
  rateLimits: Record<string, { count: number; resetAt: number }>;
}

// Generate collision-resistant unique user code with LV- prefix (e.g. LV-7K9P2X)
export function generateUniqueUserCode(existingCodes: Set<string>): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 chars, exclude confusing 0/O and 1/I
  let code = '';
  let attempts = 0;
  do {
    code = 'LV-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    attempts++;
    if (attempts > 1000) {
      code = `LV-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      break;
    }
  } while (existingCodes.has(code));
  return code;
}

const DEFAULT_USERS: User[] = [
  {
    id: 'usr_juliet',
    userCode: 'LV-7K9P2X',
    username: 'juliet_rose',
    nickname: 'Juliet 🌸',
    avatarId: 'sakura_swan',
    description: 'Poetic soul, wildflower collector, and lover of warm lavender tea and handwritten letters.',
    loveMotto: 'In every garden of life, soft words blossom the sweetest.',
    statusMood: 'Writing in moonlit journals',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    theme: 'll_hearts',
    privacy: {
      allowIncomingRequests: true,
      hideInSearch: false,
      readReceipts: true,
      notificationSound: true,
      introPreviews: true,
    },
    blockedUserIds: [],
    vaultPin: '1234',
  },
  {
    id: 'usr_romeo',
    userCode: 'LV-3M4W8Y',
    username: 'romeo_montague',
    nickname: 'Romeo ✨',
    avatarId: 'blossom_fox',
    description: 'Stargazer, acoustic melody dreamer, and hopeless believer in gentle soulmate connections.',
    loveMotto: 'The night sky is only complete when shared with someone special.',
    statusMood: 'Searching constellations',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 28,
    theme: 'll_hearts',
    privacy: {
      allowIncomingRequests: true,
      hideInSearch: false,
      readReceipts: true,
      notificationSound: true,
      introPreviews: true,
    },
    blockedUserIds: [],
    vaultPin: '1234',
  },
  {
    id: 'usr_celeste',
    userCode: 'LV-9R2T5Q',
    username: 'celeste_starlight',
    nickname: 'Celeste 🌙',
    avatarId: 'starlight_bunny',
    description: 'Astrophotographer and night owl. Collecting antique postcards and vintage vinyls.',
    loveMotto: 'Love is the gentle constellation that guides us home.',
    statusMood: 'Listening to vintage piano',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    theme: 'll_hearts',
    privacy: {
      allowIncomingRequests: true,
      hideInSearch: false,
      readReceipts: true,
      notificationSound: true,
      introPreviews: true,
    },
    blockedUserIds: [],
    vaultPin: '1234',
  },
  {
    id: 'usr_valentin',
    userCode: 'LV-6F8L4K',
    username: 'valentin_coeur',
    nickname: 'Valentin 🎻',
    avatarId: 'cosmic_cat',
    description: 'Classical cello enthusiast and cafe philosopher. Believes in love notes sealed with crimson wax.',
    loveMotto: 'Every true harmony begins with a quiet whispered promise.',
    statusMood: 'Composing a cello lullaby',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
    theme: 'll_hearts',
    privacy: {
      allowIncomingRequests: true,
      hideInSearch: false,
      readReceipts: true,
      notificationSound: true,
      introPreviews: true,
    },
    blockedUserIds: [],
    vaultPin: '1234',
  },
  {
    id: 'usr_cupid',
    userCode: 'LV-5H7J3C',
    username: 'cupid_whisper',
    nickname: 'Cupid 🏹',
    avatarId: 'cupid_dove',
    description: 'Curator of romantic vault secrets. Spreading serendipity and golden hour thoughts.',
    loveMotto: 'Kindness is the golden arrow that never misses its mark.',
    statusMood: 'Arranging rose bouquets',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    theme: 'll_hearts',
    privacy: {
      allowIncomingRequests: true,
      hideInSearch: false,
      readReceipts: true,
      notificationSound: true,
      introPreviews: true,
    },
    blockedUserIds: [],
    vaultPin: '1234',
  },
  {
    id: 'usr_amethyst',
    userCode: 'LV-8D2N9S',
    username: 'amethyst_shy',
    nickname: 'Shy Amethyst 💜',
    avatarId: 'velvet_bear',
    description: 'Quiet book lover and cozy knitwear fan. Currently taking a break from new connections.',
    loveMotto: 'Peaceful solitude before meaningful connection.',
    statusMood: 'Reading by candlelight',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    theme: 'll_hearts',
    privacy: {
      allowIncomingRequests: false, // Disabled incoming requests for privacy demo
      hideInSearch: false,
      readReceipts: false,
      notificationSound: false,
      introPreviews: false,
    },
    blockedUserIds: [],
    vaultPin: '1234',
  },
  {
    id: 'usr_aurora',
    userCode: 'LV-4P6X2M',
    username: 'aurora_fawn',
    nickname: 'Aurora 🌿',
    avatarId: 'enchanted_deer',
    description: 'Botanist and herbal tea alchemist. Forest trails, cozy blankets, and warm smiles.',
    loveMotto: 'Deep roots weather the stormiest winds.',
    statusMood: 'Brewing chamomile tea',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    theme: 'll_hearts',
    privacy: {
      allowIncomingRequests: true,
      hideInSearch: false,
      readReceipts: true,
      notificationSound: true,
      introPreviews: true,
    },
    blockedUserIds: [],
    vaultPin: '1234',
  },
];

const DEFAULT_REQUESTS: MessageRequest[] = [
  {
    id: 'req_sample_1',
    senderId: 'usr_romeo',
    recipientId: 'usr_juliet',
    introMessage: 'Hello Juliet! I noticed your love for poetry and lavender tea. I would love to connect and share favorite poems with you.',
    status: 'PENDING',
    createdAt: Date.now() - 1000 * 60 * 35,
    updatedAt: Date.now() - 1000 * 60 * 35,
  },
  {
    id: 'req_sample_2',
    senderId: 'usr_cupid',
    recipientId: 'usr_juliet',
    introMessage: 'Greetings from the Love Vault curator! Sending you a warm welcome and wishing you joyful connections ✨',
    status: 'PENDING',
    createdAt: Date.now() - 1000 * 60 * 120,
    updatedAt: Date.now() - 1000 * 60 * 120,
  },
];

const DEFAULT_COUPLE_INVITATIONS: CoupleInvitation[] = [
  {
    id: 'cinv_sample_1',
    proposerId: 'usr_valentin',
    recipientId: 'usr_celeste',
    anniversaryDate: '2026-10-18',
    vowMessage: 'To listening to moonlit sonatas and stargazing through every season of life together 🌙',
    status: 'ACCEPTED',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    acceptedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
];

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_sample_1',
    conversationId: 'usr_celeste_usr_valentin',
    senderId: 'usr_celeste',
    recipientId: 'usr_valentin',
    text: 'Hi Valentin! Fellow classical music enthusiast here. Your cello pieces sound wonderful.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    read: true,
    isIntroNote: true,
  },
  {
    id: 'msg_sample_2',
    conversationId: 'usr_celeste_usr_valentin',
    senderId: 'usr_valentin',
    recipientId: 'usr_celeste',
    text: 'Thank you Celeste! That warms my heart. Are you fond of Bach’s Cello Suites?',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    read: true,
  },
];

const DEFAULT_MEMORIES: VaultMemory[] = [
  {
    id: 'mem_1',
    userId: 'usr_juliet',
    title: 'First Love Letter Sealed',
    date: '2026-09-15',
    note: 'Inscribed our secret wishes under the autumn full moon.',
    category: 'love_letter',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
  },
];

class LoveVaultDB {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    this.ensureDirectory();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure every user has a userCode and theme
        const existingCodes = new Set<string>();
        const users: User[] = (parsed.users || DEFAULT_USERS).map((u: any, idx: number) => {
          let code = u.userCode;
          if (!code || typeof code !== 'string' || !code.startsWith('LV-')) {
            code = generateUniqueUserCode(existingCodes);
          }
          existingCodes.add(code);
          return {
            ...u,
            userCode: code,
            theme: u.theme || 'll_hearts',
          };
        });

        return {
          users,
          requests: parsed.requests || DEFAULT_REQUESTS,
          coupleInvitations: parsed.coupleInvitations || DEFAULT_COUPLE_INVITATIONS,
          messages: parsed.messages || DEFAULT_MESSAGES,
          reports: parsed.reports || [],
          vaultMemories: parsed.vaultMemories || DEFAULT_MEMORIES,
          rateLimits: parsed.rateLimits || {},
        };
      } catch (err) {
        console.error('Failed to load database file, resetting to defaults', err);
      }
    }
    const initial: DatabaseSchema = {
      users: DEFAULT_USERS,
      requests: DEFAULT_REQUESTS,
      coupleInvitations: DEFAULT_COUPLE_INVITATIONS,
      messages: DEFAULT_MESSAGES,
      reports: [],
      vaultMemories: DEFAULT_MEMORIES,
      rateLimits: {},
    };
    this.save(initial);
    return initial;
  }

  private save(data: DatabaseSchema = this.data) {
    this.ensureDirectory();
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file', err);
    }
  }

  // --- User Queries ---
  getAllUsers(): User[] {
    return [...this.data.users];
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByUserCode(code: string): User | undefined {
    const clean = code.trim().toUpperCase();
    return this.data.users.find((u) => u.userCode.toUpperCase() === clean);
  }

  getUserByUsername(username: string): User | undefined {
    const clean = username.trim().toLowerCase().replace(/^@/, '');
    return this.data.users.find((u) => u.username.toLowerCase() === clean);
  }

  searchUsers(
    query: string,
    currentUserId: string,
    page: number = 1,
    limit: number = 6
  ): { users: User[]; total: number; page: number; totalPages: number } {
    const cleanQuery = query.trim().toLowerCase().replace(/^@/, '');
    const currentUser = this.getUserById(currentUserId);
    const blockedByCurrent = currentUser?.blockedUserIds || [];

    const filtered = this.data.users.filter((user) => {
      // Exclude oneself
      if (user.id === currentUserId) return false;

      // Exclude if current user blocked them or target user blocked current user
      if (blockedByCurrent.includes(user.id)) return false;
      if (user.blockedUserIds.includes(currentUserId)) return false;

      // Exclude if user hid from public search (UNLESS exact user code match)
      const isExactCodeMatch = cleanQuery && user.userCode.toLowerCase() === cleanQuery;
      if (user.privacy.hideInSearch && !isExactCodeMatch) return false;

      if (!cleanQuery) return true;

      // Match exact user ID, partial user ID, exact/partial username, nickname, or bio
      const matchCode = user.userCode.toLowerCase().includes(cleanQuery);
      const matchUsername = user.username.toLowerCase().includes(cleanQuery);
      const matchNickname = user.nickname.toLowerCase().includes(cleanQuery);
      const matchDescription = user.description?.toLowerCase().includes(cleanQuery);

      return matchCode || matchUsername || matchNickname || matchDescription;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const validPage = Math.max(1, Math.min(page, totalPages));
    const offset = (validPage - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      users: paginated,
      total,
      page: validPage,
      totalPages,
    };
  }

  createUser(userParams: Omit<User, 'userCode' | 'theme'> & { theme?: LoveVaultTheme }): User {
    const existingCodes = new Set<string>(this.data.users.map((u) => u.userCode));
    const userCode = generateUniqueUserCode(existingCodes);

    const newUser: User = {
      ...userParams,
      userCode,
      theme: userParams.theme || 'll_hearts', // Mandatory default
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    // userCode is permanent and immutable
    const { userCode, id: _, ...safeUpdates } = updates;
    this.data.users[idx] = { ...this.data.users[idx], ...safeUpdates };
    this.save();
    return this.data.users[idx];
  }

  // --- Block System ---
  blockUser(userId: string, targetId: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;
    if (!user.blockedUserIds.includes(targetId)) {
      user.blockedUserIds.push(targetId);
      this.save();
    }
    // Cancel pending requests between them
    this.data.requests.forEach((req) => {
      if (
        (req.senderId === userId && req.recipientId === targetId) ||
        (req.senderId === targetId && req.recipientId === userId)
      ) {
        if (req.status === 'PENDING') {
          req.status = 'DECLINED';
          req.declinedAt = Date.now();
        }
      }
    });
    this.save();
    return true;
  }

  unblockUser(userId: string, targetId: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;
    user.blockedUserIds = user.blockedUserIds.filter((id) => id !== targetId);
    this.save();
    return true;
  }

  isBlocked(userAId: string, userBId: string): boolean {
    const userA = this.getUserById(userAId);
    const userB = this.getUserById(userBId);
    if (userA && userA.blockedUserIds.includes(userBId)) return true;
    if (userB && userB.blockedUserIds.includes(userAId)) return true;
    return false;
  }

  // --- Message Requests ---
  getRequestById(requestId: string): MessageRequest | undefined {
    return this.data.requests.find((r) => r.id === requestId);
  }

  findActiveRequest(userAId: string, userBId: string): MessageRequest | undefined {
    return this.data.requests.find(
      (r) =>
        r.status === 'PENDING' &&
        ((r.senderId === userAId && r.recipientId === userBId) ||
          (r.senderId === userBId && r.recipientId === userAId))
    );
  }

  findAcceptedConnection(userAId: string, userBId: string): MessageRequest | undefined {
    return this.data.requests.find(
      (r) =>
        r.status === 'ACCEPTED' &&
        ((r.senderId === userAId && r.recipientId === userBId) ||
          (r.senderId === userBId && r.recipientId === userAId))
    );
  }

  getRelationshipStatus(
    viewerId: string,
    targetId: string
  ): {
    state: 'SELF' | 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
    requestId?: string;
    introMessage?: string;
    isCouple?: boolean;
    coupleInvitation?: CoupleInvitation;
  } {
    if (viewerId === targetId) return { state: 'SELF' };

    const viewer = this.getUserById(viewerId);
    if (viewer?.blockedUserIds.includes(targetId)) return { state: 'BLOCKED' };

    const target = this.getUserById(targetId);
    if (target?.blockedUserIds.includes(viewerId)) return { state: 'BLOCKED' };

    const acceptedCouple = this.getAcceptedCoupleBond(viewerId, targetId);

    // Check accepted connection
    const accepted = this.findAcceptedConnection(viewerId, targetId);
    if (accepted) {
      return {
        state: 'ACCEPTED',
        requestId: accepted.id,
        isCouple: !!acceptedCouple,
        coupleInvitation: this.getActiveCoupleInvitation(viewerId, targetId),
      };
    }

    // Check active pending requests
    const pendingSent = this.data.requests.find(
      (r) => r.senderId === viewerId && r.recipientId === targetId && r.status === 'PENDING'
    );
    if (pendingSent) {
      return { state: 'PENDING_SENT', requestId: pendingSent.id, introMessage: pendingSent.introMessage };
    }

    const pendingReceived = this.data.requests.find(
      (r) => r.senderId === targetId && r.recipientId === viewerId && r.status === 'PENDING'
    );
    if (pendingReceived) {
      return { state: 'PENDING_RECEIVED', requestId: pendingReceived.id, introMessage: pendingReceived.introMessage };
    }

    return { state: 'NONE' };
  }

  createRequest(senderId: string, recipientId: string, introMessage: string): MessageRequest {
    const request: MessageRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId,
      recipientId,
      introMessage: introMessage.trim().substring(0, 280),
      status: 'PENDING',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.data.requests.unshift(request);
    this.save();
    return request;
  }

  updateRequestStatus(
    requestId: string,
    status: 'ACCEPTED' | 'DECLINED' | 'CANCELLED'
  ): MessageRequest | undefined {
    const req = this.getRequestById(requestId);
    if (!req) return undefined;
    req.status = status;
    req.updatedAt = Date.now();
    if (status === 'ACCEPTED') {
      req.acceptedAt = Date.now();
      const convId = this.getConversationId(req.senderId, req.recipientId);
      if (req.introMessage) {
        const existingIntro = this.data.messages.find(
          (m) => m.conversationId === convId && m.isIntroNote
        );
        if (!existingIntro) {
          this.data.messages.push({
            id: `msg_intro_${req.id}`,
            conversationId: convId,
            senderId: req.senderId,
            recipientId: req.recipientId,
            text: req.introMessage,
            createdAt: req.createdAt,
            read: true,
            isIntroNote: true,
          });
        }
      }
    } else if (status === 'DECLINED') {
      req.declinedAt = Date.now();
    }
    this.save();
    return req;
  }

  getRequestsForUser(userId: string): {
    received: MessageRequest[];
    sent: MessageRequest[];
    pendingReceivedCount: number;
  } {
    const received = this.data.requests.filter((r) => r.recipientId === userId);
    const sent = this.data.requests.filter((r) => r.senderId === userId);
    const pendingReceivedCount = received.filter((r) => r.status === 'PENDING').length;
    return { received, sent, pendingReceivedCount };
  }

  // --- Mutual-Consent Couple Invitation System ---
  createCoupleInvitation(
    proposerId: string,
    recipientId: string,
    anniversaryDate: string,
    vowMessage: string
  ): CoupleInvitation {
    const invitation: CoupleInvitation = {
      id: `cinv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      proposerId,
      recipientId,
      anniversaryDate: anniversaryDate || new Date().toISOString().split('T')[0],
      vowMessage: vowMessage.trim().substring(0, 500),
      status: 'PENDING',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.data.coupleInvitations.unshift(invitation);
    this.save();
    return invitation;
  }

  getCoupleInvitationById(id: string): CoupleInvitation | undefined {
    return this.data.coupleInvitations.find((ci) => ci.id === id);
  }

  getActiveCoupleInvitation(userAId: string, userBId: string): CoupleInvitation | undefined {
    return this.data.coupleInvitations.find(
      (ci) =>
        ci.status === 'PENDING' &&
        ((ci.proposerId === userAId && ci.recipientId === userBId) ||
          (ci.proposerId === userBId && ci.recipientId === userAId))
    );
  }

  getAcceptedCoupleBond(userAId: string, userBId: string): CoupleInvitation | undefined {
    return this.data.coupleInvitations.find(
      (ci) =>
        ci.status === 'ACCEPTED' &&
        ((ci.proposerId === userAId && ci.recipientId === userBId) ||
          (ci.proposerId === userBId && ci.recipientId === userAId))
    );
  }

  getCoupleInvitationsForUser(userId: string): {
    received: CoupleInvitation[];
    sent: CoupleInvitation[];
  } {
    return {
      received: this.data.coupleInvitations.filter((ci) => ci.recipientId === userId),
      sent: this.data.coupleInvitations.filter((ci) => ci.proposerId === userId),
    };
  }

  updateCoupleInvitationStatus(
    invitationId: string,
    status: 'ACCEPTED' | 'DECLINED' | 'CANCELLED'
  ): CoupleInvitation | undefined {
    const inv = this.getCoupleInvitationById(invitationId);
    if (!inv) return undefined;
    inv.status = status;
    inv.updatedAt = Date.now();
    if (status === 'ACCEPTED') {
      inv.acceptedAt = Date.now();
      // Bind couple partner ID in user records
      const proposer = this.getUserById(inv.proposerId);
      const recipient = this.getUserById(inv.recipientId);
      if (proposer) proposer.partnerId = inv.recipientId;
      if (recipient) recipient.partnerId = inv.proposerId;
    }
    this.save();
    return inv;
  }

  // --- Messaging ---
  getConversationId(userAId: string, userBId: string): string {
    return [userAId, userBId].sort().join('_');
  }

  getMessages(userAId: string, userBId: string): ChatMessage[] {
    const convId = this.getConversationId(userAId, userBId);
    return this.data.messages
      .filter((m) => m.conversationId === convId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  sendMessage(senderId: string, recipientId: string, text: string): ChatMessage {
    const convId = this.getConversationId(senderId, recipientId);
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      conversationId: convId,
      senderId,
      recipientId,
      text: text.trim(),
      createdAt: Date.now(),
      read: false,
    };
    this.data.messages.push(message);
    this.save();
    return message;
  }

  markMessagesAsRead(viewerId: string, partnerId: string): number {
    const convId = this.getConversationId(viewerId, partnerId);
    let count = 0;
    this.data.messages.forEach((m) => {
      if (m.conversationId === convId && m.recipientId === viewerId && !m.read) {
        m.read = true;
        count++;
      }
    });
    if (count > 0) this.save();
    return count;
  }

  getConversationsForUser(userId: string): Array<{
    partner: User;
    lastMessage?: ChatMessage;
    unreadCount: number;
    requestStatus: 'ACCEPTED';
    isCouple: boolean;
  }> {
    const acceptedRequests = this.data.requests.filter(
      (r) => (r.senderId === userId || r.recipientId === userId) && r.status === 'ACCEPTED'
    );

    const partnerIds = new Set<string>();
    acceptedRequests.forEach((r) => {
      const partnerId = r.senderId === userId ? r.recipientId : r.senderId;
      partnerIds.add(partnerId);
    });

    const results: Array<{
      partner: User;
      lastMessage?: ChatMessage;
      unreadCount: number;
      requestStatus: 'ACCEPTED';
      isCouple: boolean;
    }> = [];

    partnerIds.forEach((partnerId) => {
      const partner = this.getUserById(partnerId);
      if (!partner) return;
      const convId = this.getConversationId(userId, partnerId);
      const convMessages = this.data.messages
        .filter((m) => m.conversationId === convId)
        .sort((a, b) => a.createdAt - b.createdAt);

      const lastMessage = convMessages[convMessages.length - 1];
      const unreadCount = convMessages.filter((m) => m.recipientId === userId && !m.read).length;
      const isCouple = !!this.getAcceptedCoupleBond(userId, partnerId);

      results.push({
        partner,
        lastMessage,
        unreadCount,
        requestStatus: 'ACCEPTED',
        isCouple,
      });
    });

    return results;
  }

  // --- Reports ---
  createReport(report: Omit<ReportRecord, 'id' | 'createdAt' | 'status'>): ReportRecord {
    const record: ReportRecord = {
      ...report,
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      status: 'PENDING_REVIEW',
    };
    this.data.reports.push(record);
    this.save();
    return record;
  }

  // --- Vault Memories ---
  getMemories(userId: string): VaultMemory[] {
    return this.data.vaultMemories.filter((m) => m.userId === userId);
  }

  addMemory(memory: Omit<VaultMemory, 'id' | 'createdAt'>): VaultMemory {
    const newMem: VaultMemory = {
      ...memory,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    this.data.vaultMemories.unshift(newMem);
    this.save();
    return newMem;
  }

  // --- Rate Limiting Storage ---
  checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetInMs: number } {
    const now = Date.now();
    const entry = this.data.rateLimits[key];

    if (!entry || now > entry.resetAt) {
      this.data.rateLimits[key] = { count: 1, resetAt: now + windowMs };
      return { allowed: true, remaining: limit - 1, resetInMs: windowMs };
    }

    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, resetInMs: Math.max(0, entry.resetAt - now) };
    }

    entry.count += 1;
    return { allowed: true, remaining: limit - entry.count, resetInMs: Math.max(0, entry.resetAt - now) };
  }

  // --- Reset for Tests ---
  resetToDefaults() {
    this.data = {
      users: JSON.parse(JSON.stringify(DEFAULT_USERS)),
      requests: JSON.parse(JSON.stringify(DEFAULT_REQUESTS)),
      coupleInvitations: JSON.parse(JSON.stringify(DEFAULT_COUPLE_INVITATIONS)),
      messages: JSON.parse(JSON.stringify(DEFAULT_MESSAGES)),
      reports: [],
      vaultMemories: JSON.parse(JSON.stringify(DEFAULT_MEMORIES)),
      rateLimits: {},
    };
    this.save();
  }
}

export const db = new LoveVaultDB();
