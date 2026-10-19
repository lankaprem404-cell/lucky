import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { SecurityRulesEngine } from './server/securityRules.js';
import { runSecurityTests } from './server/testRunner.js';
import { User } from './types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());

// --- SSE Realtime Subscriptions ---
interface ClientConnection {
  userId: string;
  res: Response;
}

const sseClients: ClientConnection[] = [];

function broadcastToUser(userId: string, event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    if (client.userId === userId) {
      try {
        client.res.write(payload);
      } catch (err) {
        console.error('Failed to send SSE to user', userId, err);
      }
    }
  });
}

function broadcastAll(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch (err) {
      // client may have disconnected
    }
  });
}

// User Identification Middleware
function getActiveUserId(req: Request): string {
  const headerUser = req.headers['x-user-id'] as string;
  if (headerUser && db.getUserById(headerUser)) {
    return headerUser;
  }
  return 'usr_juliet'; // Default initial user
}

// Custom Rate Limiting Middlewares
function rateLimit(limit: number, windowMs: number, actionName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = getActiveUserId(req);
    const ip = req.ip || 'anonymous';
    const key = `${actionName}:${userId || ip}`;
    const check = db.checkRateLimit(key, limit, windowMs);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', check.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(check.resetInMs / 1000));

    if (!check.allowed) {
      res.status(429).json({
        error: `Rate limit exceeded for ${actionName}. Please wait ${Math.ceil(check.resetInMs / 1000)}s before trying again.`,
        retryAfterMs: check.resetInMs,
      });
      return;
    }
    next();
  };
}

// --- API Routes ---

// 1. Real-time SSE Stream
app.get('/api/realtime', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || getActiveUserId(req);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const client: ClientConnection = { userId, res };
  sseClients.push(client);

  // Send initial handshake
  res.write(`event: CONNECTED\ndata: ${JSON.stringify({ connected: true, userId, timestamp: Date.now() })}\n\n`);

  // Heartbeat keep-alive every 25s
  const interval = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(interval);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(interval);
    const index = sseClients.indexOf(client);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

// 2. User & Auth Endpoints
app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const requestsSummary = db.getRequestsForUser(userId);
  res.json({ user, pendingRequestsCount: requestsSummary.pendingReceivedCount });
});

app.get('/api/auth/users', (req: Request, res: Response) => {
  const users = db.getAllUsers();
  res.json({ users });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, nickname, avatarId, description, loveMotto } = req.body;

  if (!username || !username.trim()) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  const cleanHandle = username.trim().toLowerCase().replace(/^@/, '');
  if (db.getUserByUsername(cleanHandle)) {
    res.status(400).json({ error: 'Username is already taken' });
    return;
  }

  const newUser = db.createUser({
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: cleanHandle,
    nickname: nickname?.trim() || cleanHandle,
    avatarId: avatarId || 'sakura_swan',
    description: description?.trim() || 'Romantic wanderer in Love Vault',
    loveMotto: loveMotto?.trim() || 'Treasuring every whispered memory.',
    statusMood: 'Available for serendipity',
    createdAt: Date.now(),
    theme: 'll_hearts', // Mandatory default theme
    privacy: {
      allowIncomingRequests: true,
      hideInSearch: false,
      readReceipts: true,
      notificationSound: true,
      introPreviews: true,
    },
    blockedUserIds: [],
    vaultPin: '1234',
  });

  broadcastAll('USER_REGISTERED', { userId: newUser.id, username: newUser.username, userCode: newUser.userCode });
  res.status(201).json({ user: newUser });
});

// 3. User Search Endpoint (with rate-limiting & pagination)
app.get('/api/users/search', rateLimit(30, 60000, 'Search Users'), (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const query = (req.query.q as string) || '';
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 6;

  const result = db.searchUsers(query, currentUserId, page, limit);

  // Compute relationship status for each returned user
  const relationshipStatuses: Record<string, ReturnType<typeof db.getRelationshipStatus>> = {};
  result.users.forEach((u) => {
    relationshipStatuses[u.id] = db.getRelationshipStatus(currentUserId, u.id);
  });

  res.json({
    users: result.users,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    relationshipStatuses,
  });
});

app.get('/api/users/:id', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const user = db.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const relationship = db.getRelationshipStatus(currentUserId, user.id);
  res.json({ user, relationship });
});

// 4. Message Requests Endpoints
app.get('/api/requests', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const data = db.getRequestsForUser(currentUserId);

  // Enhance requests with user profiles
  const enhancedReceived = data.received.map((reqItem) => ({
    ...reqItem,
    sender: db.getUserById(reqItem.senderId),
  }));

  const enhancedSent = data.sent.map((reqItem) => ({
    ...reqItem,
    recipient: db.getUserById(reqItem.recipientId),
  }));

  res.json({
    received: enhancedReceived,
    sent: enhancedSent,
    pendingReceivedCount: data.pendingReceivedCount,
  });
});

app.post('/api/requests/send', rateLimit(15, 300000, 'Send Message Request'), (req: Request, res: Response) => {
  const senderId = getActiveUserId(req);
  const { recipientId, introMessage } = req.body;

  // Strict backend rule enforcement
  const ruleCheck = SecurityRulesEngine.canSendRequest(senderId, recipientId, introMessage);
  if (!ruleCheck.allowed) {
    res.status(400).json({ error: ruleCheck.reason, code: ruleCheck.code });
    return;
  }

  const newRequest = db.createRequest(senderId, recipientId, introMessage);

  // Notify recipient in real time
  const sender = db.getUserById(senderId);
  broadcastToUser(recipientId, 'REQUEST_RECEIVED', {
    request: newRequest,
    sender,
  });

  res.status(201).json({ request: newRequest });
});

app.post('/api/requests/:id/accept', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const requestId = req.params.id;

  const ruleCheck = SecurityRulesEngine.canRespondToRequest(currentUserId, requestId);
  if (!ruleCheck.allowed) {
    res.status(403).json({ error: ruleCheck.reason, code: ruleCheck.code });
    return;
  }

  const updated = db.updateRequestStatus(requestId, 'ACCEPTED');
  if (!updated) {
    res.status(404).json({ error: 'Request could not be updated' });
    return;
  }

  const partner = db.getUserById(updated.senderId);
  const currentUser = db.getUserById(currentUserId);

  // Real-time broadcast to sender and recipient
  broadcastToUser(updated.senderId, 'REQUEST_ACCEPTED', {
    requestId: updated.id,
    acceptedBy: currentUser,
  });

  broadcastToUser(currentUserId, 'REQUEST_ACCEPTED', {
    requestId: updated.id,
    partner,
  });

  res.json({ request: updated });
});

app.post('/api/requests/:id/decline', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const requestId = req.params.id;

  const ruleCheck = SecurityRulesEngine.canRespondToRequest(currentUserId, requestId);
  if (!ruleCheck.allowed) {
    res.status(403).json({ error: ruleCheck.reason, code: ruleCheck.code });
    return;
  }

  const updated = db.updateRequestStatus(requestId, 'DECLINED');
  if (!updated) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }

  broadcastToUser(updated.senderId, 'REQUEST_DECLINED', {
    requestId: updated.id,
    recipientId: currentUserId,
  });

  res.json({ request: updated });
});

app.post('/api/requests/:id/cancel', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const reqItem = db.getRequestById(req.params.id);
  if (!reqItem) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  if (reqItem.senderId !== currentUserId) {
    res.status(403).json({ error: 'You can only cancel requests you sent' });
    return;
  }
  if (reqItem.status !== 'PENDING') {
    res.status(400).json({ error: 'Request is no longer pending' });
    return;
  }

  const updated = db.updateRequestStatus(reqItem.id, 'CANCELLED');
  broadcastToUser(reqItem.recipientId, 'REQUEST_CANCELLED', { requestId: reqItem.id });
  res.json({ request: updated });
});

// 5. Privacy & Blocking Controls
app.post('/api/users/privacy', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const { allowIncomingRequests, hideInSearch, readReceipts, notificationSound, introPreviews } = req.body;

  const user = db.getUserById(currentUserId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const updated = db.updateUser(currentUserId, {
    privacy: {
      ...user.privacy,
      ...(allowIncomingRequests !== undefined && { allowIncomingRequests }),
      ...(hideInSearch !== undefined && { hideInSearch }),
      ...(readReceipts !== undefined && { readReceipts }),
      ...(notificationSound !== undefined && { notificationSound }),
      ...(introPreviews !== undefined && { introPreviews }),
    },
  });

  res.json({ user: updated });
});

app.post('/api/users/profile', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const { nickname, avatarId, description, loveMotto, statusMood, theme } = req.body;

  const updated = db.updateUser(currentUserId, {
    ...(nickname !== undefined && { nickname: nickname.trim() }),
    ...(avatarId !== undefined && { avatarId }),
    ...(description !== undefined && { description: description.trim() }),
    ...(loveMotto !== undefined && { loveMotto: loveMotto.trim() }),
    ...(statusMood !== undefined && { statusMood: statusMood.trim() }),
    ...(theme !== undefined && { theme }),
  });

  res.json({ user: updated });
});

// 5b. Mutual-Consent Couple Invitation Endpoints
app.get('/api/couple/invitations', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const data = db.getCoupleInvitationsForUser(currentUserId);

  const enhancedReceived = data.received.map((inv) => ({
    ...inv,
    proposer: db.getUserById(inv.proposerId),
  }));

  const enhancedSent = data.sent.map((inv) => ({
    ...inv,
    recipient: db.getUserById(inv.recipientId),
  }));

  res.json({ received: enhancedReceived, sent: enhancedSent });
});

app.post('/api/couple/propose', rateLimit(10, 300000, 'Propose Couple Bond'), (req: Request, res: Response) => {
  const proposerId = getActiveUserId(req);
  const { recipientId, anniversaryDate, vowMessage } = req.body;

  const ruleCheck = SecurityRulesEngine.canProposeCoupleBond(proposerId, recipientId, vowMessage || '');
  if (!ruleCheck.allowed) {
    res.status(400).json({ error: ruleCheck.reason, code: ruleCheck.code });
    return;
  }

  const invitation = db.createCoupleInvitation(
    proposerId,
    recipientId,
    anniversaryDate || new Date().toISOString().split('T')[0],
    vowMessage || 'Will you seal our couple bond in Love Vault? 💖'
  );

  const proposer = db.getUserById(proposerId);
  broadcastToUser(recipientId, 'COUPLE_PROPOSED', { invitation, proposer });

  res.status(201).json({ invitation });
});

app.post('/api/couple/invitations/:id/accept', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const invitationId = req.params.id;

  const ruleCheck = SecurityRulesEngine.canRespondToCoupleInvitation(currentUserId, invitationId);
  if (!ruleCheck.allowed) {
    res.status(403).json({ error: ruleCheck.reason, code: ruleCheck.code });
    return;
  }

  const updated = db.updateCoupleInvitationStatus(invitationId, 'ACCEPTED');
  if (!updated) {
    res.status(404).json({ error: 'Invitation not found' });
    return;
  }

  const proposer = db.getUserById(updated.proposerId);
  const recipient = db.getUserById(currentUserId);

  broadcastToUser(updated.proposerId, 'COUPLE_ACCEPTED', {
    invitationId: updated.id,
    partner: recipient,
  });

  broadcastToUser(currentUserId, 'COUPLE_ACCEPTED', {
    invitationId: updated.id,
    partner: proposer,
  });

  res.json({ invitation: updated });
});

app.post('/api/couple/invitations/:id/decline', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const invitationId = req.params.id;

  const ruleCheck = SecurityRulesEngine.canRespondToCoupleInvitation(currentUserId, invitationId);
  if (!ruleCheck.allowed) {
    res.status(403).json({ error: ruleCheck.reason, code: ruleCheck.code });
    return;
  }

  const updated = db.updateCoupleInvitationStatus(invitationId, 'DECLINED');
  if (!updated) {
    res.status(404).json({ error: 'Invitation not found' });
    return;
  }

  broadcastToUser(updated.proposerId, 'COUPLE_DECLINED', { invitationId: updated.id });

  res.json({ invitation: updated });
});

app.post('/api/users/block', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const { targetUserId } = req.body;

  if (!targetUserId || targetUserId === currentUserId) {
    res.status(400).json({ error: 'Invalid user to block' });
    return;
  }

  db.blockUser(currentUserId, targetUserId);
  broadcastToUser(targetUserId, 'USER_BLOCKED', { blockerId: currentUserId });

  res.json({ success: true, message: 'User blocked successfully' });
});

app.post('/api/users/unblock', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const { targetUserId } = req.body;

  if (!targetUserId) {
    res.status(400).json({ error: 'Target user ID required' });
    return;
  }

  db.unblockUser(currentUserId, targetUserId);
  res.json({ success: true, message: 'User unblocked' });
});

app.get('/api/users/blocked/list', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const user = db.getUserById(currentUserId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const blockedUsers = user.blockedUserIds
    .map((id) => db.getUserById(id))
    .filter(Boolean);
  res.json({ blockedUsers });
});

// 6. Abuse Reporting
app.post('/api/reports', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const { targetUserId, reason, details, andBlock } = req.body;

  if (!targetUserId || !reason) {
    res.status(400).json({ error: 'Target user and reason are required' });
    return;
  }

  const report = db.createReport({
    reporterId: currentUserId,
    targetUserId,
    reason,
    details: details || '',
  });

  if (andBlock) {
    db.blockUser(currentUserId, targetUserId);
  }

  res.status(201).json({ success: true, report });
});

// 7. Chats & Direct Messaging
app.get('/api/chats', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const conversations = db.getConversationsForUser(currentUserId);
  res.json({ conversations });
});

app.get('/api/chats/:partnerId/messages', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const partnerId = req.params.partnerId;

  const access = SecurityRulesEngine.canAccessConversation(currentUserId, partnerId);
  if (!access.allowed) {
    res.status(403).json({ error: access.reason, code: access.code });
    return;
  }

  const partner = db.getUserById(partnerId);
  if (!partner) {
    res.status(404).json({ error: 'Partner not found' });
    return;
  }

  const readCount = db.markMessagesAsRead(currentUserId, partnerId);
  if (readCount > 0) {
    broadcastToUser(partnerId, 'MESSAGES_READ', {
      readerId: currentUserId,
      partnerId,
      conversationId: db.getConversationId(currentUserId, partnerId),
    });
  }
  const messages = db.getMessages(currentUserId, partnerId);

  res.json({ partner, messages });
});

app.post('/api/chats/:partnerId/read', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const partnerId = req.params.partnerId;
  const readCount = db.markMessagesAsRead(currentUserId, partnerId);
  if (readCount > 0) {
    broadcastToUser(partnerId, 'MESSAGES_READ', {
      readerId: currentUserId,
      partnerId,
      conversationId: db.getConversationId(currentUserId, partnerId),
    });
  }
  res.json({ success: true, count: readCount });
});

app.post('/api/chats/:partnerId/messages', rateLimit(40, 60000, 'Send Chat Message'), (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const partnerId = req.params.partnerId;
  const { text } = req.body;

  const ruleCheck = SecurityRulesEngine.canSendMessage(currentUserId, partnerId, text);
  if (!ruleCheck.allowed) {
    res.status(403).json({ error: ruleCheck.reason, code: ruleCheck.code });
    return;
  }

  const message = db.sendMessage(currentUserId, partnerId, text);

  // Broadcast in real time to both recipient and sender (supporting multi-tab and active open chats)
  broadcastToUser(partnerId, 'NEW_MESSAGE', { message, conversationId: message.conversationId });
  broadcastToUser(currentUserId, 'NEW_MESSAGE', { message, conversationId: message.conversationId });

  res.status(201).json({ message });
});

// 8. Private Couple Vault
app.post('/api/vault/:partnerId/verify-pin', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const user = db.getUserById(currentUserId);
  const { pin } = req.body;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const correctPin = user.vaultPin || '1234';
  if (pin === correctPin) {
    res.json({ success: true, unlocked: true });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect Love Vault PIN passcode' });
  }
});

app.get('/api/vault/:partnerId/memories', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const partnerId = req.params.partnerId;

  const access = SecurityRulesEngine.canAccessPrivateVault(currentUserId, partnerId);
  if (!access.allowed) {
    res.status(403).json({ error: access.reason, code: access.code });
    return;
  }

  const memories = db.getMemories(currentUserId);
  res.json({ memories });
});

app.post('/api/vault/:partnerId/memories', (req: Request, res: Response) => {
  const currentUserId = getActiveUserId(req);
  const { title, date, note, category } = req.body;

  if (!title || !note) {
    res.status(400).json({ error: 'Title and note are required' });
    return;
  }

  const memory = db.addMemory({
    userId: currentUserId,
    title: title.trim(),
    date: date || new Date().toISOString().split('T')[0],
    note: note.trim(),
    category: category || 'love_letter',
  });

  res.status(201).json({ memory });
});

// 9. Automated Security Rules & Permission Test Suite
app.get('/api/tests/run', async (req: Request, res: Response) => {
  try {
    const report = await runSecurityTests();
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to run security tests', details: err?.message });
  }
});

// --- Development & Production Server Setup ---
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ LOVE VAULT server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
