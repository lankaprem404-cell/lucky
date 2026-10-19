import { SecurityTestResult, User } from '../types/index.js';
import { db, generateUniqueUserCode } from './db.js';
import { SecurityRulesEngine } from './securityRules.js';

export async function runSecurityTests(): Promise<{
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
  results: SecurityTestResult[];
}> {
  const results: SecurityTestResult[] = [];

  // Test 1: Self-Request Prohibition
  {
    const start = Date.now();
    const check = SecurityRulesEngine.canSendRequest('usr_juliet', 'usr_juliet', 'Hello me');
    const passed = !check.allowed && check.code === 'CANNOT_REQUEST_SELF';
    results.push({
      id: 'test_1_self_request',
      title: 'Prohibit Requests to Oneself',
      description: 'Enforces that a user cannot send a message request or introductory note to their own account.',
      category: 'authorization',
      passed,
      expectedBehavior: 'Rejection with CANNOT_REQUEST_SELF code',
      actualBehavior: `Allowed=${check.allowed}, Code=${check.code}, Reason=${check.reason}`,
      durationMs: Date.now() - start,
    });
  }

  // Test 2: Duplicate Request Prevention
  {
    const start = Date.now();
    const check = SecurityRulesEngine.canSendRequest('usr_romeo', 'usr_juliet', 'Another request');
    const passed = !check.allowed && (check.code === 'DUPLICATE_REQUEST_SENT' || check.code === 'ALREADY_CONNECTED');
    results.push({
      id: 'test_2_duplicate_request',
      title: 'Prevent Duplicate Pending Requests',
      description: 'Guarantees that once a request or connection exists between two users, repeated requests are blocked on the backend.',
      category: 'duplicate_prevention',
      passed,
      expectedBehavior: 'Rejection with DUPLICATE_REQUEST_SENT or ALREADY_CONNECTED code',
      actualBehavior: `Allowed=${check.allowed}, Code=${check.code}, Reason=${check.reason}`,
      durationMs: Date.now() - start,
    });
  }

  // Test 3: Privacy Settings - Disabled Incoming Requests
  {
    const start = Date.now();
    const check = SecurityRulesEngine.canSendRequest('usr_romeo', 'usr_amethyst', 'Hello amethyst');
    const passed = !check.allowed && check.code === 'REQUESTS_DISABLED_BY_RECIPIENT';
    results.push({
      id: 'test_3_privacy_disabled_requests',
      title: 'Enforce Recipient Privacy Controls',
      description: 'Rejects requests when the target user has disabled incoming requests in their privacy preferences.',
      category: 'privacy',
      passed,
      expectedBehavior: 'Rejection with REQUESTS_DISABLED_BY_RECIPIENT code',
      actualBehavior: `Allowed=${check.allowed}, Code=${check.code}, Reason=${check.reason}`,
      durationMs: Date.now() - start,
    });
  }

  // Test 4: Introductory Message Length Restriction (<= 280 chars)
  {
    const start = Date.now();
    const longMessage = 'A'.repeat(281);
    const check = SecurityRulesEngine.canSendRequest('usr_romeo', 'usr_aurora', longMessage);
    const passed = !check.allowed && check.code === 'INTRO_MESSAGE_TOO_LONG';
    results.push({
      id: 'test_4_intro_length_limit',
      title: 'Introductory Message 280-Character Cap',
      description: 'Enforces strict character limits on introductory message notes to protect recipients from harassment.',
      category: 'authorization',
      passed,
      expectedBehavior: 'Rejection with INTRO_MESSAGE_TOO_LONG code',
      actualBehavior: `Allowed=${check.allowed}, Code=${check.code}, Reason=${check.reason}`,
      durationMs: Date.now() - start,
    });
  }

  // Test 5: Blocked User Request & Message Prevention
  {
    const start = Date.now();
    const aurora = db.getUserById('usr_aurora');
    if (aurora) {
      db.blockUser('usr_aurora', 'usr_romeo');
    }
    const checkRequest = SecurityRulesEngine.canSendRequest('usr_romeo', 'usr_aurora', 'Hi Aurora');
    const checkMessage = SecurityRulesEngine.canSendMessage('usr_romeo', 'usr_aurora', 'Direct message');
    db.unblockUser('usr_aurora', 'usr_romeo');

    const passed = !checkRequest.allowed && checkRequest.code === 'BLOCKED_BY_RECIPIENT' && !checkMessage.allowed;
    results.push({
      id: 'test_5_blocked_users_shield',
      title: 'Shield Blocked Users from Requests & Chat',
      description: 'Ensures that blocked accounts cannot initiate message requests or send chat messages.',
      category: 'blocked_users',
      passed,
      expectedBehavior: 'Block checks return BLOCKED_BY_RECIPIENT and COMMUNICATION_BLOCKED',
      actualBehavior: `RequestAllowed=${checkRequest.allowed} (${checkRequest.code}), MessageAllowed=${checkMessage.allowed}`,
      durationMs: Date.now() - start,
    });
  }

  // Test 6: Permanent LV- User Code Generation & Collision Resistance
  {
    const start = Date.now();
    const existing = new Set<string>();
    let allUnique = true;
    for (let i = 0; i < 500; i++) {
      const code = generateUniqueUserCode(existing);
      if (existing.has(code) || !code.startsWith('LV-') || code.length !== 9) {
        allUnique = false;
        break;
      }
      existing.add(code);
    }
    results.push({
      id: 'test_6_lv_code_collision_resistance',
      title: 'Permanent LV- Prefix ID Collision Resistance',
      description: 'Verifies that every generated public user ID starts with LV-, contains 6 alphanumeric characters, and generates 500 unique IDs with zero collisions.',
      category: 'user_identification',
      passed: allUnique,
      expectedBehavior: 'Unique LV-XXXXXX format with 0 collisions in 500 generated IDs',
      actualBehavior: `AllUnique=${allUnique}, SampleCode=${Array.from(existing)[0]}`,
      durationMs: Date.now() - start,
    });
  }

  // Test 7: Distinguish Users With Identical Display Names
  {
    const start = Date.now();
    // Create two separate test accounts with identical nickname "Alex Rose 🌹"
    const userA = db.createUser({
      id: `usr_test_alex_1_${Date.now()}`,
      username: `alex_rose_one_${Date.now()}`,
      nickname: 'Alex Rose 🌹',
      avatarId: 'blossom_fox',
      description: 'First Alex',
      createdAt: Date.now(),
      privacy: { allowIncomingRequests: true, hideInSearch: false, readReceipts: true, notificationSound: true, introPreviews: true },
      blockedUserIds: [],
    });

    const userB = db.createUser({
      id: `usr_test_alex_2_${Date.now()}`,
      username: `alex_rose_two_${Date.now()}`,
      nickname: 'Alex Rose 🌹', // Identical display name!
      avatarId: 'starlight_bunny',
      description: 'Second Alex',
      createdAt: Date.now(),
      privacy: { allowIncomingRequests: true, hideInSearch: false, readReceipts: true, notificationSound: true, introPreviews: true },
      blockedUserIds: [],
    });

    // Verify they have distinct permanent userCodes
    const distinctCodes = userA.userCode !== userB.userCode && userA.userCode.startsWith('LV-') && userB.userCode.startsWith('LV-');

    // Search by exact userCode of userB
    const searchResult = db.searchUsers(userB.userCode, 'usr_juliet', 1, 10);
    const foundExactUserB = searchResult.users.length === 1 && searchResult.users[0].id === userB.id;

    // Send request targeting userB specifically
    const req = db.createRequest('usr_juliet', userB.id, 'Introductory note to exact User B');
    const requestReachedExactTarget = req.recipientId === userB.id && req.recipientId !== userA.id;

    const passed = distinctCodes && foundExactUserB && requestReachedExactTarget;
    results.push({
      id: 'test_7_identical_display_names_distinguishable',
      title: 'Distinguish Users With Identical Display Names',
      description: 'Proves that accounts sharing identical nicknames remain 100% distinguishable via permanent LV- IDs, and requests reach only the targeted account.',
      category: 'user_identification',
      passed,
      expectedBehavior: 'Accounts have distinct LV- IDs, exact LV- search yields only target, request routes strictly to target',
      actualBehavior: `DistinctCodes=${distinctCodes} (${userA.userCode} vs ${userB.userCode}), FoundExact=${foundExactUserB}, TargetMatch=${requestReachedExactTarget}`,
      durationMs: Date.now() - start,
    });
  }

  // Test 8: Mandatory LL Hearts Default Theme on Account Creation
  {
    const start = Date.now();
    const newUser = db.createUser({
      id: `usr_theme_test_${Date.now()}`,
      username: `newbie_${Date.now()}`,
      nickname: 'New Explorer',
      avatarId: 'sakura_swan',
      description: 'Brand new account',
      createdAt: Date.now(),
      privacy: { allowIncomingRequests: true, hideInSearch: false, readReceipts: true, notificationSound: true, introPreviews: true },
      blockedUserIds: [],
    });

    const isLLHearts = newUser.theme === 'll_hearts';
    results.push({
      id: 'test_8_mandatory_ll_hearts_default',
      title: 'Mandatory LL Hearts Default Theme',
      description: 'Verifies that every newly registered account is automatically assigned the "LL Hearts" theme by default.',
      category: 'authorization',
      passed: isLLHearts,
      expectedBehavior: 'theme === "ll_hearts"',
      actualBehavior: `AssignedTheme=${newUser.theme}`,
      durationMs: Date.now() - start,
    });
  }

  // Test 9: Mutual-Consent Couple Invitation Flow Requires Bilateral Consent
  {
    const start = Date.now();
    // Celeste and Valentin are connected. Valentin proposes couple bond.
    const proposal = db.createCoupleInvitation('usr_valentin', 'usr_celeste', '2026-10-19', 'Will you seal our couple bond in Love Vault?');
    const isPending = proposal.status === 'PENDING';

    // Prior to acceptance, they are not yet officially bound as couple partners
    const valBefore = db.getUserById('usr_valentin');
    const unacceptedState = valBefore?.partnerId !== 'usr_celeste';

    // Once Celeste accepts, both receive the mutual partnerId
    db.updateCoupleInvitationStatus(proposal.id, 'ACCEPTED');
    const valAfter = db.getUserById('usr_valentin');
    const celAfter = db.getUserById('usr_celeste');
    const bilateralBonded = valAfter?.partnerId === 'usr_celeste' && celAfter?.partnerId === 'usr_valentin';

    const passed = isPending && unacceptedState && bilateralBonded;
    results.push({
      id: 'test_9_mutual_couple_invitation_consent',
      title: 'Mutual-Consent Couple Invitation Protocol',
      description: 'Verifies that couple partner status requires mutual consent (proposer proposal + recipient acceptance) before coupling.',
      category: 'couple_bond',
      passed,
      expectedBehavior: 'Status PENDING until accepted, partnerId assigned to both accounts only after mutual acceptance',
      actualBehavior: `PendingInit=${isPending}, UnboundBefore=${unacceptedState}, BilateralBondAfter=${bilateralBonded}`,
      durationMs: Date.now() - start,
    });
  }

  // Test 10: Private Vault Isolation Gate
  {
    const start = Date.now();
    const check = SecurityRulesEngine.canAccessPrivateVault('usr_cupid', 'usr_juliet');
    const passed = !check.allowed && check.code === 'VAULT_ACCESS_DENIED_NOT_ACCEPTED';
    results.push({
      id: 'test_10_vault_isolation',
      title: 'Isolate Private Couple Vault Data',
      description: 'Protects the romantic vault, secret love letters, and couple memories from non-accepted contacts.',
      category: 'privacy',
      passed,
      expectedBehavior: 'Rejection with VAULT_ACCESS_DENIED_NOT_ACCEPTED code',
      actualBehavior: `Allowed=${check.allowed}, Code=${check.code}, Reason=${check.reason}`,
      durationMs: Date.now() - start,
    });
  }

  // Test 11: Real-time Message Persistence, Conversation Routing & Delivery Status
  {
    const start = Date.now();
    const checkRule = SecurityRulesEngine.canSendMessage('usr_juliet', 'usr_romeo', 'Whispered in moonlight 🌸');
    const msg = db.sendMessage('usr_juliet', 'usr_romeo', 'Whispered in moonlight 🌸');
    const savedInDb = !!msg && !!msg.id && msg.text === 'Whispered in moonlight 🌸';
    const convId = db.getConversationId('usr_juliet', 'usr_romeo');
    const hasCorrectConvId = msg.conversationId === convId;

    const julietView = db.getMessages('usr_juliet', 'usr_romeo');
    const romeoView = db.getMessages('usr_romeo', 'usr_juliet');
    const bothSeeMessage =
      julietView.some((m) => m.id === msg.id) &&
      romeoView.some((m) => m.id === msg.id);

    const readCount = db.markMessagesAsRead('usr_romeo', 'usr_juliet');
    const updatedMessages = db.getMessages('usr_juliet', 'usr_romeo');
    const markedAsRead = updatedMessages.find((m) => m.id === msg.id)?.read === true;

    const passed = checkRule.allowed && savedInDb && hasCorrectConvId && bothSeeMessage && markedAsRead;
    results.push({
      id: 'test_11_realtime_message_persistence_and_routing',
      title: 'Message Persistence, Conversation Routing & Delivery Tracking',
      description: 'Guarantees that sent messages persist in backend DB, route to the exact mutual conversation ID, appear identically to both participants, and track delivery status.',
      category: 'authorization',
      passed,
      expectedBehavior: 'Saved in DB, matching sorted conversationId, retrieved by both parties, delivery status updated',
      actualBehavior: `RuleAllowed=${checkRule.allowed}, Saved=${savedInDb}, ConvIdMatch=${hasCorrectConvId}, BothSee=${bothSeeMessage}, MarkedRead=${markedAsRead}`,
      durationMs: Date.now() - start,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  return {
    passedCount,
    totalCount,
    allPassed: passedCount === totalCount,
    results,
  };
}
