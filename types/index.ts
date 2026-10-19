export type CharacterAvatarId =
  | 'starlight_bunny'
  | 'blossom_fox'
  | 'velvet_bear'
  | 'cosmic_cat'
  | 'sakura_swan'
  | 'enchanted_deer'
  | 'moonlit_owl'
  | 'ruby_dragon'
  | 'cupid_dove'
  | 'ethereal_butterfly';

export interface CharacterAvatar {
  id: CharacterAvatarId;
  name: string;
  species: string;
  primaryColor: string;
  accentColor: string;
  tagline: string;
}

export type LoveVaultTheme =
  | 'll_hearts'       // Mandatory default: Glowing LL initials, hearts, romantic pink & purple
  | 'pink_love'       // Soft blush and candy pinks
  | 'purple_dream'    // Lavender and royal purple mist
  | 'midnight_black'  // Sleek obsidian and dark rose accents
  | 'galaxy_space'    // Cosmic nebula, deep starlight and indigo
  | 'ocean_blue'      // Azure tides and sapphire luminescence
  | 'sunset_romance'  // Amber gold, warm peach and coral
  | 'cherry_blossom'  // Pastel sakura petals and pearl white
  | 'neon_hearts'     // Cyber magenta and electric violet neon
  | 'cute_bears'      // Warm honey, beige and mocha brown
  | 'forest_green'    // Emerald moss and botanical rose gold
  | 'black_and_white'; // Minimalist monochrome high contrast

export interface UserPrivacySettings {
  allowIncomingRequests: boolean; // if false, cannot receive message requests
  hideInSearch: boolean;
  readReceipts: boolean;
  notificationSound: boolean;
  introPreviews: boolean;
}

export interface User {
  id: string;
  userCode: string; // Permanent unique public ID with prefix LV-, e.g. "LV-7K9P2X"
  username: string; // unique handle e.g. "juliet_rose"
  nickname: string; // display name e.g. "Juliet 🌸"
  avatarId: CharacterAvatarId;
  description: string; // optional character description / romantic bio
  loveMotto?: string;
  statusMood?: string;
  createdAt: number;
  privacy: UserPrivacySettings;
  blockedUserIds: string[];
  theme: LoveVaultTheme; // Persisted chosen theme, defaults to 'll_hearts'
  partnerId?: string; // accepted romantic partner ID
  vaultPin?: string; // 4-digit PIN for private couple vault
}

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export interface MessageRequest {
  id: string;
  senderId: string;
  recipientId: string;
  introMessage: string; // limited introductory note (<= 280 chars)
  status: RequestStatus;
  createdAt: number;
  updatedAt: number;
  readAt?: number;
  declinedAt?: number;
  acceptedAt?: number;
}

export type CoupleInvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export interface CoupleInvitation {
  id: string;
  proposerId: string;
  recipientId: string;
  anniversaryDate: string;
  vowMessage: string;
  status: CoupleInvitationStatus;
  createdAt: number;
  updatedAt: number;
  acceptedAt?: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string; // sorted pair id or request id
  senderId: string;
  recipientId: string;
  text: string;
  createdAt: number;
  read: boolean;
  isIntroNote?: boolean;
  status?: 'sending' | 'sent' | 'failed';
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  targetUserId: string;
  reason: 'spam' | 'harassment' | 'inappropriate_intro' | 'impersonation' | 'other';
  details: string;
  createdAt: number;
  status: 'PENDING_REVIEW' | 'RESOLVED';
}

export interface VaultMemory {
  id: string;
  userId: string;
  title: string;
  date: string;
  note: string;
  category: 'milestone' | 'date_night' | 'love_letter' | 'secret_promise';
  createdAt: number;
}

export interface SecurityTestResult {
  id: string;
  title: string;
  description: string;
  category: 'authorization' | 'duplicate_prevention' | 'blocked_users' | 'privacy' | 'user_identification' | 'couple_bond';
  passed: boolean;
  expectedBehavior: string;
  actualBehavior: string;
  durationMs: number;
}
