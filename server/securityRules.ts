import { User, MessageRequest, ChatMessage, CoupleInvitation } from '../types/index.js';
import { db } from './db.js';

export interface RuleCheckResult {
  allowed: boolean;
  code: string;
  reason?: string;
}

export class SecurityRulesEngine {
  /**
   * Rule 1: Can Send Message Request
   * Enforces:
   * - Cannot request oneself
   * - Both users must exist
   * - Block list check (in either direction)
   * - Recipient privacy settings (allowIncomingRequests)
   * - Duplicate request prevention (no active pending or accepted)
   * - Intro message length limit (<= 280 chars)
   */
  static canSendRequest(
    senderId: string,
    recipientId: string,
    introMessage: string
  ): RuleCheckResult {
    if (!senderId || !recipientId) {
      return { allowed: false, code: 'INVALID_IDENTITIES', reason: 'Sender and recipient identities must be specified' };
    }

    if (senderId === recipientId) {
      return { allowed: false, code: 'CANNOT_REQUEST_SELF', reason: 'You cannot send a message request to yourself' };
    }

    const sender = db.getUserById(senderId);
    if (!sender) {
      return { allowed: false, code: 'SENDER_NOT_FOUND', reason: 'Sender account does not exist' };
    }

    const recipient = db.getUserById(recipientId);
    if (!recipient) {
      return { allowed: false, code: 'RECIPIENT_NOT_FOUND', reason: 'Recipient account does not exist' };
    }

    // Check if either user has blocked the other
    if (sender.blockedUserIds.includes(recipientId)) {
      return { allowed: false, code: 'USER_BLOCKED_BY_YOU', reason: 'You have blocked this user. Unblock them first to connect.' };
    }
    if (recipient.blockedUserIds.includes(senderId)) {
      return { allowed: false, code: 'BLOCKED_BY_RECIPIENT', reason: 'Unable to send request: this account is unavailable' };
    }

    // Check recipient privacy setting
    if (recipient.privacy.allowIncomingRequests === false) {
      return {
        allowed: false,
        code: 'REQUESTS_DISABLED_BY_RECIPIENT',
        reason: `${recipient.nickname || recipient.username} has disabled incoming message requests in their privacy settings`,
      };
    }

    // Check if an accepted connection already exists
    const accepted = db.findAcceptedConnection(senderId, recipientId);
    if (accepted) {
      return {
        allowed: false,
        code: 'ALREADY_CONNECTED',
        reason: 'You are already connected with this user',
      };
    }

    // Check if an active pending request already exists
    const active = db.findActiveRequest(senderId, recipientId);
    if (active) {
      if (active.senderId === senderId) {
        return {
          allowed: false,
          code: 'DUPLICATE_REQUEST_SENT',
          reason: 'A pending message request has already been sent to this user',
        };
      } else {
        return {
          allowed: false,
          code: 'PENDING_REQUEST_EXISTS_FROM_OTHER',
          reason: 'This user has already sent you a message request! Please check your Message Requests inbox.',
        };
      }
    }

    // Check introductory message constraints
    if (!introMessage || introMessage.trim().length === 0) {
      return { allowed: false, code: 'EMPTY_INTRO_MESSAGE', reason: 'An introductory message is required for initial requests' };
    }

    if (introMessage.length > 280) {
      return {
        allowed: false,
        code: 'INTRO_MESSAGE_TOO_LONG',
        reason: `Introductory messages are strictly limited to 280 characters (provided: ${introMessage.length})`,
      };
    }

    return { allowed: true, code: 'OK' };
  }

  /**
   * Rule 2: Can View Request
   * Only the sender or recipient may inspect the request and its intro note.
   */
  static canViewRequest(userId: string, request: MessageRequest): RuleCheckResult {
    if (request.senderId !== userId && request.recipientId !== userId) {
      return {
        allowed: false,
        code: 'UNAUTHORIZED_REQUEST_VIEW',
        reason: 'Permission denied: only the sender or recipient can access this message request',
      };
    }
    return { allowed: true, code: 'OK' };
  }

  /**
   * Rule 3: Can Respond To Request (Accept or Decline)
   * Only the recipient can accept or decline a pending request.
   */
  static canRespondToRequest(userId: string, requestId: string): RuleCheckResult {
    const req = db.getRequestById(requestId);
    if (!req) {
      return { allowed: false, code: 'REQUEST_NOT_FOUND', reason: 'Message request does not exist' };
    }

    if (req.recipientId !== userId) {
      return {
        allowed: false,
        code: 'UNAUTHORIZED_RESPONSE',
        reason: 'Permission denied: only the recipient can accept or decline this request',
      };
    }

    if (req.status !== 'PENDING') {
      return {
        allowed: false,
        code: 'REQUEST_NOT_PENDING',
        reason: `Cannot respond: this request has already been ${req.status.toLowerCase()}`,
      };
    }

    // Check if blocked in meantime
    if (db.isBlocked(req.senderId, req.recipientId)) {
      return {
        allowed: false,
        code: 'PARTNER_IS_BLOCKED',
        reason: 'Cannot respond: one of the parties is blocked',
      };
    }

    return { allowed: true, code: 'OK' };
  }

  /**
   * Rule 4: Can Send Direct Chat Message
   * Enforces:
   * - Must be accepted partners
   * - Neither is blocked
   * - Recipient allows communication
   * - Introductory messages cannot bypass request approval
   */
  static canSendMessage(senderId: string, recipientId: string, text: string): RuleCheckResult {
    if (!text || text.trim().length === 0) {
      return { allowed: false, code: 'EMPTY_MESSAGE', reason: 'Message text cannot be empty' };
    }

    if (text.length > 2000) {
      return { allowed: false, code: 'MESSAGE_TOO_LONG', reason: 'Message exceeds maximum length of 2000 characters' };
    }

    if (senderId === recipientId) {
      return { allowed: false, code: 'CANNOT_MESSAGE_SELF', reason: 'Cannot message yourself' };
    }

    if (db.isBlocked(senderId, recipientId)) {
      return { allowed: false, code: 'COMMUNICATION_BLOCKED', reason: 'Cannot send messages to a blocked user' };
    }

    const accepted = db.findAcceptedConnection(senderId, recipientId);
    if (!accepted) {
      return {
        allowed: false,
        code: 'NO_ACCEPTED_CONNECTION',
        reason: 'Permission denied: you must have an accepted message request before sending regular chat messages',
      };
    }

    return { allowed: true, code: 'OK' };
  }

  /**
   * Rule 5: Can Access Conversation
   */
  static canAccessConversation(userId: string, partnerId: string): RuleCheckResult {
    if (userId === partnerId) {
      return { allowed: false, code: 'INVALID_CONVERSATION', reason: 'Cannot converse with yourself' };
    }

    if (db.isBlocked(userId, partnerId)) {
      return { allowed: false, code: 'CONVERSATION_BLOCKED', reason: 'Access to this conversation is blocked' };
    }

    const accepted = db.findAcceptedConnection(userId, partnerId);
    if (!accepted) {
      return {
        allowed: false,
        code: 'NOT_CONNECTED',
        reason: 'Permission denied: no accepted message request exists between these accounts',
      };
    }

    return { allowed: true, code: 'OK' };
  }

  /**
   * Rule 6: Can Access Private Couple Vault
   * Couple vault protects intimate couple data (love notes, encrypted memories).
   */
  static canAccessPrivateVault(viewerId: string, partnerId: string, pinAttempt?: string): RuleCheckResult {
    if (viewerId === partnerId) {
      return { allowed: true, code: 'OK' };
    }

    const accepted = db.findAcceptedConnection(viewerId, partnerId);
    if (!accepted) {
      return {
        allowed: false,
        code: 'VAULT_ACCESS_DENIED_NOT_ACCEPTED',
        reason: 'Private couple vault is locked. Only accepted soulmates can request vault access.',
      };
    }

    if (db.isBlocked(viewerId, partnerId)) {
      return {
        allowed: false,
        code: 'VAULT_ACCESS_DENIED_BLOCKED',
        reason: 'Vault access denied due to blocked relationship status.',
      };
    }

    return { allowed: true, code: 'OK' };
  }

  /**
   * Rule 7: Can Propose Mutual Couple Bond
   * Both users must have an accepted connection.
   * Neither is blocked.
   * Cannot already have a pending or active couple bond.
   */
  static canProposeCoupleBond(
    proposerId: string,
    recipientId: string,
    vowMessage: string
  ): RuleCheckResult {
    if (proposerId === recipientId) {
      return { allowed: false, code: 'CANNOT_PROPOSE_SELF', reason: 'Cannot propose a couple bond to yourself' };
    }

    const connection = db.findAcceptedConnection(proposerId, recipientId);
    if (!connection) {
      return {
        allowed: false,
        code: 'NOT_CONNECTED',
        reason: 'You must have an accepted connection before proposing a mutual couple bond.',
      };
    }

    if (db.isBlocked(proposerId, recipientId)) {
      return { allowed: false, code: 'PARTNER_IS_BLOCKED', reason: 'Cannot propose couple bond: blocked user status' };
    }

    // Check if already in an accepted couple bond
    const existingBond = db.getAcceptedCoupleBond(proposerId, recipientId);
    if (existingBond) {
      return { allowed: false, code: 'ALREADY_COUPLE', reason: 'You are already in an active couple bond with this soulmate' };
    }

    // Check if pending invitation exists
    const activeInvitation = db.getActiveCoupleInvitation(proposerId, recipientId);
    if (activeInvitation) {
      return { allowed: false, code: 'COUPLE_INVITATION_PENDING', reason: 'A mutual couple invitation is already pending between you' };
    }

    if (vowMessage && vowMessage.length > 500) {
      return { allowed: false, code: 'VOW_TOO_LONG', reason: 'Vow message exceeds maximum length of 500 characters' };
    }

    return { allowed: true, code: 'OK' };
  }

  /**
   * Rule 8: Can Respond to Couple Invitation
   */
  static canRespondToCoupleInvitation(userId: string, invitationId: string): RuleCheckResult {
    const inv = db.getCoupleInvitationById(invitationId);
    if (!inv) {
      return { allowed: false, code: 'INVITATION_NOT_FOUND', reason: 'Couple invitation does not exist' };
    }

    if (inv.recipientId !== userId) {
      return { allowed: false, code: 'UNAUTHORIZED_COUPLE_RESPONSE', reason: 'Only the recipient can respond to this couple invitation' };
    }

    if (inv.status !== 'PENDING') {
      return { allowed: false, code: 'INVITATION_NOT_PENDING', reason: `Invitation has already been ${inv.status.toLowerCase()}` };
    }

    return { allowed: true, code: 'OK' };
  }
}
