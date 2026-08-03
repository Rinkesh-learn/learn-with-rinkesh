// =========================================================
// Learn With Rinkesh — Community Chat widget (v2)
// Included on every page via <script src="chat-widget.js">
// (must load AFTER supabase-config.js since it uses supabaseClient)
//
// v2 changes:
// - Chat requires login (accountability for moderation)
// - Disclaimer is DB-persisted only (shown once, ever, per account)
// - A standalone "view guidelines anytime" icon (no login needed to read)
// - Maximize to fullscreen
// - Emoji picker for composing messages
// - Hover-to-react on messages (❤️ 😂 😢 😮 🙏)
// - Respects profiles.chat_banned — banned users can read but not post
// =========================================================

(function () {
  const OPEN_STATE_KEY = 'lwr_chat_open_state';
  const THEME_KEY = 'lwr_chat_theme';
  const REACTION_EMOJIS = ['👍', '❤️', '😂', '😢', '😮', '🙏'];

  // Basic client-side offensive-language check before sending — not
  // foolproof (no filter ever is), but catches the common, obvious
  // cases and reminds people to be respectful before they post.
  const OFFENSIVE_WORDS = [
    'fuck','fucking','fucker','shit','bullshit','bitch','asshole','ass',
    'bastard','dick','pussy','cunt','cock','whore','slut','nigger','nigga',
    'faggot','retard','retarded','moron','idiot','stupid','dumbass',
    'motherfucker','damn','crap','piss','screwyou','loser'
  ];
  function containsOffensiveLanguage(text) {
    const lower = text.toLowerCase();
    return OFFENSIVE_WORDS.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower));
  }

  const COMPOSE_EMOJIS = [
    // Smileys
    '😀','😁','😂','🤣','😊','😇','🙂','😉','😍','🥰',
    '😘','😗','😋','😛','😜','🤪','😝','🤑','🤗','🤭',
    '🤔','🤐','😐','😑','😶','😏','😒','🙄','😬','🤥',
    '😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🥵',
    '🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕',
    '😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨',
    '😰','😥','😢','😭','😱','😖','😣','😞','😓','😩',
    '😫','🥱','😤','😡','😠','🤬','😈','👿','💀','👻',
    // Gestures & people
    '👋','🤚','🖐️','✋','🖖','👌','🤏','✌️','🤞','🤟',
    '🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊',
    '👊','🤛','🤜','👏','🙌','👐','🤲','🙏','✍️','💪',
    // Hearts & symbols
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔',
    '❣️','💕','💞','💓','💗','💖','💘','💝','💯','💢',
    '💥','💫','💦','💨','🕳️','💣','💬','👁️‍🗨️','🗨️','🗯️',
    // Fun & misc
    '🔥','⭐','🌟','✨','🎉','🎊','🎈','🎁','🏆','🥇',
    '⚡','☀️','🌈','☁️','❄️','🍀','🌸','🌺','🌻','🍎',
    '☕','🍕','🍔','🍟','🍩','🍰','🎂','🍫','🍿','🥤',
    '✅','❌','⚠️','❓','❗','🔔','🔒','🔓','📌','📍'
  ];

  // ---------- Shared disclaimer content ----------
  const DISCLAIMER_HTML = `
    <p>This is a public space to connect with other Excel learners — ask questions, share tips, help each other out.</p>
    <ul>
      <li>No offensive language or harassment</li>
      <li>Respect everyone's questions and skill level — no question is a bad one</li>
      <li>This platform exists to help people learn, grow, and connect — keep it that way</li>
    </ul>
  `;

  // ---------- Inject floating icon ----------
  const btn = document.createElement('button');
  btn.id = 'chatFloatBtn';
  btn.innerHTML = '💬';
  document.body.appendChild(btn);

  // ---------- Read-only viewer (anyone, anytime, no login needed) ----------
  const disclaimerViewOverlay = document.createElement('div');
  disclaimerViewOverlay.id = 'chatDisclaimerViewOverlay';
  disclaimerViewOverlay.className = 'chat-overlay';
  disclaimerViewOverlay.innerHTML = `
    <div class="chat-disclaimer-box">
      <h3>Community Guidelines</h3>
      ${DISCLAIMER_HTML}
      <button class="btn btn-ghost" id="chatViewCloseBtn" style="width:100%;">Close</button>
    </div>
  `;
  document.body.appendChild(disclaimerViewOverlay);

  // ---------- Login-required prompt ----------
  const loginPromptOverlay = document.createElement('div');
  loginPromptOverlay.id = 'chatLoginOverlay';
  loginPromptOverlay.className = 'chat-overlay';
  loginPromptOverlay.innerHTML = `
    <div class="chat-disclaimer-box" style="text-align:center;">
      <div style="font-size:32px; margin-bottom:8px;">💬</div>
      <h3>Log in to join the chat</h3>
      <p>Community chat is for registered users only, so everyone can chat safely together.</p>
      <a href="login.html" class="btn btn-primary" style="display:block; width:100%; box-sizing:border-box; text-align:center; text-decoration:none;">Log In</a>
      <button class="btn btn-ghost" id="chatLoginCloseBtn" style="width:100%; margin-top:8px;">Not now</button>
    </div>
  `;
  document.body.appendChild(loginPromptOverlay);

  // ---------- Inject chat window ----------
  const chatWindow = document.createElement('div');
  chatWindow.id = 'chatWindow';
  chatWindow.className = 'chat-window';
  chatWindow.innerHTML = `
    <div class="chat-header" id="chatHeader">
      <div class="chat-header-title">
        <span class="chat-header-icon">💬</span>
        <span>Community Chat</span>
        <span class="chat-live-dot" title="Live"></span>
      </div>
      <div class="chat-header-actions">
        <button id="chatGuidelinesBtn" title="Community guidelines">&excl;</button>
        <button id="chatSettingsBtn" title="Chat settings">⚙️</button>
        <button id="chatMaximizeBtn" title="Maximize">⛶</button>
        <button id="chatMinimizeBtn" title="Close">&times;</button>
      </div>
    </div>
    <div class="chat-settings-panel" id="chatSettingsPanel">
      <label>Your display name</label>
      <input type="text" id="chatNameInput" placeholder="How you appear in chat">
      <label class="chat-checkbox-row"><input type="checkbox" id="chatHideNameToggle"> Hide my name (show as "Anonymous")</label>
      <div id="chatAdminOption" style="display:none;">
        <label class="chat-checkbox-row"><input type="checkbox" id="chatAdminSiteTeamToggle"> Post as "Site Team ⭐" instead of my own name</label>
      </div>
      <label>Chat window color</label>
      <div class="chat-theme-swatches" id="chatThemeSwatches">
        <span class="chat-swatch" data-color="#2F80C9" style="background:#2F80C9;" title="Blue"></span>
        <span class="chat-swatch" data-color="#1C6B41" style="background:#1C6B41;" title="Green"></span>
        <span class="chat-swatch" data-color="#C9971E" style="background:#C9971E;" title="Amber"></span>
        <span class="chat-swatch" data-color="#D9534F" style="background:#D9534F;" title="Coral"></span>
        <span class="chat-swatch" data-color="#7C5CBF" style="background:#7C5CBF;" title="Purple"></span>
        <span class="chat-swatch" data-color="#2B2E33" style="background:#2B2E33;" title="Dark"></span>
      </div>
      <button class="btn btn-primary" id="chatSaveSettingsBtn" style="width:100%; margin-top:8px;">Save</button>
    </div>
    <div id="chatBannedNotice" class="chat-banned-notice" style="display:none;"></div>
    <div id="chatLoggedOutNotice" class="chat-banned-notice" style="display:none;">
      <div>👋 <strong>You're viewing the Community Chat.</strong></div>
      <div style="margin-top:4px;">Log in to send messages, reply, or react.</div>
      <button type="button" class="admin-mini-btn" id="chatLoggedOutLoginBtn" style="margin-top:8px;">Log In</button>
    </div>
    <div class="chat-messages" id="chatMessages"></div>
    <div class="chat-report-panel" id="chatReportPanel">
      <div class="chat-report-header">
        <strong>Report this message</strong>
        <button type="button" id="chatReportCloseBtn" class="chat-emoji-close" aria-label="Close">&times;</button>
      </div>
      <p class="chat-report-target" id="chatReportTarget"></p>
      <label>Reason</label>
      <select id="chatReportReason">
        <option value="offensive">Offensive or vulgar language</option>
        <option value="harassment">Harassment or bullying</option>
        <option value="spam">Spam</option>
        <option value="hate">Hate speech</option>
        <option value="other">Other</option>
      </select>
      <label>Details (optional)</label>
      <textarea id="chatReportDetails" rows="3" placeholder="Add any details that would help..."></textarea>
      <button class="btn btn-primary" id="chatReportSubmitBtn" style="width:100%; margin-top:8px;">Submit Report</button>
      <div id="chatReportMessage" style="font-size:12px; margin-top:6px;"></div>
    </div>
    <div class="chat-emoji-panel" id="chatEmojiPanel">
      <div class="chat-emoji-grid" id="chatEmojiGrid"></div>
    </div>
    <div id="chatReplyPreview" class="chat-reply-preview" style="display:none;">
      <div class="chat-reply-preview-content">
        <div class="chat-reply-preview-name"></div>
        <div class="chat-reply-preview-text"></div>
      </div>
      <button type="button" id="chatReplyCancelBtn" title="Cancel reply">✕</button>
    </div>
    <div id="chatComposeWarning" class="chat-compose-warning" style="display:none;"></div>
    <div class="chat-input-row">
      <label class="chat-attach-btn" title="Attach an image">
        📎<input type="file" id="chatImageInput" accept="image/*" style="display:none;">
      </label>
      <button class="chat-attach-btn" id="chatEmojiBtn" title="Add an emoji">😊</button>
      <input type="text" id="chatTextInput" placeholder="Type a message...">
      <button id="chatSendBtn">➤</button>
    </div>
    <div id="chatImagePreviewRow" class="chat-image-preview-row" style="display:none;">
      <img id="chatImagePreview" src="" alt="">
      <button id="chatRemoveImageBtn">&times;</button>
    </div>
  `;
  document.body.appendChild(chatWindow);

  let pendingImageFile = null;
  let currentUser = null; // { id, displayName, disclaimerSeen, banned, rawName, hideNameSetting, isAdmin }
  const isAdminPage = /\/admin\.html$/.test(window.location.pathname) || window.location.pathname.endsWith('admin.html');

  // ---------- Determine identity (logged-in users only) ----------
  async function resolveIdentity() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      currentUser = null;
      return;
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('name, chat_display_name, chat_hide_name, chat_disclaimer_seen, chat_banned, chat_banned_until, is_admin, chat_admin_show_as_site_team')
      .eq('id', session.user.id)
      .maybeSingle();

    const name = (profile && profile.chat_hide_name)
      ? 'Anonymous'
      : (profile && (profile.chat_display_name || profile.name)) || session.user.email.split('@')[0];

    const isBanned = !!(profile && profile.chat_banned) &&
      (!profile.chat_banned_until || new Date(profile.chat_banned_until) > new Date());

    const isAdmin = isAdminPage && !!(profile && profile.is_admin);
    const adminShowAsSiteTeam = !profile || profile.chat_admin_show_as_site_team === null || profile.chat_admin_show_as_site_team === undefined
      ? true
      : profile.chat_admin_show_as_site_team;

    currentUser = {
      id: session.user.id,
      displayName: isAdmin ? (adminShowAsSiteTeam ? 'Site Team ⭐' : name) : name,
      disclaimerSeen: !!(profile && profile.chat_disclaimer_seen),
      banned: isBanned,
      bannedUntil: (profile && profile.chat_banned_until) || null,
      rawName: profile ? profile.chat_display_name : '',
      hideNameSetting: !!(profile && profile.chat_hide_name),
      isAdmin: isAdmin,
      adminShowAsSiteTeam: adminShowAsSiteTeam
    };
  }

  // ---------- Open / close flow ----------
  async function openChat() {
    await resolveIdentity();
    showChatWindow();
  }

  function showChatWindow() {
    chatWindow.classList.add('open');
    sessionStorage.setItem(OPEN_STATE_KEY, '1');
    applyTheme();

    const inputRow = document.querySelector('.chat-input-row');
    const bannedNotice = document.getElementById('chatBannedNotice');
    const loggedOutNotice = document.getElementById('chatLoggedOutNotice');
    const messagesArea = document.getElementById('chatMessages');

    // Viewing is open to everyone now — messages always load. Only the
    // compose box itself gets replaced, for the two restricted cases.
    messagesArea.style.display = 'block';

    if (!currentUser) {
      inputRow.style.display = 'none';
      bannedNotice.style.display = 'none';
      loggedOutNotice.style.display = 'block';
      document.getElementById('chatAdminOption').style.display = 'none';
    } else if (currentUser.banned) {
      document.getElementById('chatNameInput').value = currentUser.rawName || '';
      document.getElementById('chatHideNameToggle').checked = currentUser.hideNameSetting;
      document.getElementById('chatAdminOption').style.display = 'none';

      inputRow.style.display = 'none';
      loggedOutNotice.style.display = 'none';
      bannedNotice.style.display = 'block';

      let untilLine;
      if (currentUser.bannedUntil) {
        const untilDate = new Date(currentUser.bannedUntil).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
        untilLine = `You'll be able to chat again from <strong>${untilDate}</strong>.`;
      } else {
        untilLine = 'This is a <strong>permanent</strong> ban — chat will not be available on this account again.';
      }

      bannedNotice.innerHTML = `
        <div>🚫 <strong>You're banned from posting in the Community Chat.</strong></div>
        <div style="margin-top:4px;">You can still read messages, but can't send, reply, or react. ${untilLine}</div>
      `;
    } else {
      document.getElementById('chatNameInput').value = currentUser.rawName || '';
      document.getElementById('chatHideNameToggle').checked = currentUser.hideNameSetting;
      document.getElementById('chatAdminOption').style.display = currentUser.isAdmin ? 'block' : 'none';
      document.getElementById('chatAdminSiteTeamToggle').checked = currentUser.adminShowAsSiteTeam;

      inputRow.style.display = 'flex';
      bannedNotice.style.display = 'none';
      loggedOutNotice.style.display = 'none';
    }

    loadMessages();
    subscribeRealtime();
  }

  function closeChatWindow() {
    chatWindow.classList.remove('open');
    chatWindow.classList.remove('maximized');
    const maxBtn = document.getElementById('chatMaximizeBtn');
    if (maxBtn) { maxBtn.innerHTML = '⛶'; maxBtn.title = 'Maximize'; }
    sessionStorage.setItem(OPEN_STATE_KEY, '0');
  }

  btn.addEventListener('click', () => {
    if (chatWindow.classList.contains('open')) {
      closeChatWindow();
    } else {
      openChat();
    }
  });

  document.getElementById('chatLoginCloseBtn').addEventListener('click', () => {
    loginPromptOverlay.classList.remove('open');
  });

  document.getElementById('chatGuidelinesBtn').addEventListener('click', () => {
    disclaimerViewOverlay.classList.add('open');
  });
  document.getElementById('chatViewCloseBtn').addEventListener('click', () => {
    disclaimerViewOverlay.classList.remove('open');
  });

  document.getElementById('chatMinimizeBtn').addEventListener('click', closeChatWindow);

  document.getElementById('chatMaximizeBtn').addEventListener('click', () => {
    const isMaximized = chatWindow.classList.toggle('maximized');
    const maxBtn = document.getElementById('chatMaximizeBtn');
    maxBtn.innerHTML = isMaximized ? '&#10530;' : '⛶'; // shrink icon vs maximize icon
    maxBtn.title = isMaximized ? 'Shrink back down' : 'Maximize';
    // Reset any manual resize so it starts clean each time you maximize
    if (isMaximized) {
      chatWindow.style.width = '';
      chatWindow.style.height = '';
    }
  });

  // ---------- Drag to reposition ----------
  // Switches the window from right/bottom anchoring to left/top anchoring
  // the first time it's dragged, so it can be freely moved and isn't
  // stuck pinned to one corner while resizing from the opposite corner.
  (function enableDrag() {
    const header = document.getElementById('chatHeader');
    let dragging = false;
    let startX, startY, startLeft, startTop;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return; // don't drag when clicking header buttons
      dragging = true;
      const rect = chatWindow.getBoundingClientRect();
      // Switch to left/top anchoring so dragging has something to move
      chatWindow.style.left = rect.left + 'px';
      chatWindow.style.top = rect.top + 'px';
      chatWindow.style.right = 'auto';
      chatWindow.style.bottom = 'auto';
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      header.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newLeft = startLeft + dx;
      let newTop = startTop + dy;
      // Keep it on-screen
      newLeft = Math.max(0, Math.min(window.innerWidth - 80, newLeft));
      newTop = Math.max(0, Math.min(window.innerHeight - 40, newTop));
      chatWindow.style.left = newLeft + 'px';
      chatWindow.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (dragging) {
        dragging = false;
        header.style.cursor = 'grab';
      }
    });
  })();

  // Stay open across page navigation until explicitly minimized.
  // Small delay so Supabase's auth session has time to fully restore
  // from storage on this fresh page load before we check it — otherwise
  // an already-logged-in user can be briefly, incorrectly seen as logged out.
  if (sessionStorage.getItem(OPEN_STATE_KEY) === '1') {
    setTimeout(openChat, 300);
  }

  // ---------- Settings panel ----------
  // ---------- Theme color ----------
  let selectedTheme = localStorage.getItem(THEME_KEY) || '#2F80C9';

  function applyTheme() {
    chatWindow.style.setProperty('--chat-theme', selectedTheme);
    document.querySelectorAll('.chat-swatch').forEach(sw => {
      sw.classList.toggle('selected', sw.dataset.color === selectedTheme);
    });
  }

  document.querySelectorAll('.chat-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      selectedTheme = sw.dataset.color;
      localStorage.setItem(THEME_KEY, selectedTheme);
      applyTheme();
    });
  });

  document.getElementById('chatSettingsBtn').addEventListener('click', () => {
    document.getElementById('chatSettingsPanel').classList.toggle('open');
  });

  document.getElementById('chatLoggedOutLoginBtn').addEventListener('click', () => {
    loginPromptOverlay.classList.add('open');
  });

  document.getElementById('chatSaveSettingsBtn').addEventListener('click', async () => {
    if (!currentUser) return;
    const newName = document.getElementById('chatNameInput').value.trim();
    const hideName = document.getElementById('chatHideNameToggle').checked;
    const adminShowAsSiteTeam = currentUser.isAdmin ? document.getElementById('chatAdminSiteTeamToggle').checked : currentUser.adminShowAsSiteTeam;

    const updatePayload = {
      chat_display_name: newName || null,
      chat_hide_name: hideName
    };
    if (currentUser.isAdmin) updatePayload.chat_admin_show_as_site_team = adminShowAsSiteTeam;

    try {
      await supabaseClient.from('profiles').update(updatePayload).eq('id', currentUser.id);
    } catch (e) {}
    currentUser.rawName = newName;
    currentUser.hideNameSetting = hideName;
    currentUser.adminShowAsSiteTeam = adminShowAsSiteTeam;
    const ownName = hideName ? 'Anonymous' : (newName || currentUser.displayName);
    currentUser.displayName = currentUser.isAdmin ? (adminShowAsSiteTeam ? 'Site Team ⭐' : ownName) : ownName;
    document.getElementById('chatSettingsPanel').classList.remove('open');
  });

  // ---------- Emoji picker (composing) ----------
  const emojiPanel = document.getElementById('chatEmojiPanel');
  const emojiGrid = document.getElementById('chatEmojiGrid');
  emojiGrid.innerHTML = COMPOSE_EMOJIS.map(e => `<span class="chat-emoji-option">${e}</span>`).join('');
  emojiGrid.querySelectorAll('.chat-emoji-option').forEach(el => {
    el.addEventListener('click', () => {
      const input = document.getElementById('chatTextInput');
      input.value += el.textContent;
      input.focus();
    });
  });
  document.getElementById('chatEmojiBtn').addEventListener('click', () => {
    const isOpen = emojiPanel.classList.toggle('open');
    document.getElementById('chatEmojiBtn').textContent = isOpen ? '✕' : '😊';
  });

  // ---------- Messages ----------
  const reactionCounts = {}; // messageId -> { emoji: count }

  function renderReactionBar(messageId) {
    const counts = reactionCounts[messageId] || {};
    const countsHtml = Object.keys(counts).map(e => `<span class="chat-reaction-pill">${e} ${counts[e]}</span>`).join('');
    const pickerHtml = REACTION_EMOJIS.map(e => `<span class="chat-react-option" data-emoji="${e}">${e}</span>`).join('');
    return `
      <div class="chat-reaction-row">
        <div class="chat-reaction-counts">${countsHtml}</div>
        <div class="chat-react-picker">${pickerHtml}</div>
      </div>
    `;
  }

  const myPendingReactions = new Set(); // "messageId:emoji" — reactions we've already counted locally

  function attachReactionHandlers(div, messageId) {
    div.querySelectorAll('.chat-react-option').forEach(el => {
      el.addEventListener('click', async () => {
        if (!currentUser) {
          loginPromptOverlay.classList.add('open');
          return;
        }
        const emoji = el.dataset.emoji;
        try {
          await supabaseClient.from('chat_reactions').insert({
            message_id: messageId,
            user_id: currentUser.id,
            emoji: emoji
          });
          // Show it on screen right away instead of waiting on the
          // realtime channel — mark it so the realtime echo of this
          // same insert (which still arrives a moment later) doesn't
          // count it a second time.
          myPendingReactions.add(`${messageId}:${emoji}`);
          bumpReactionCount(messageId, emoji);
        } catch (e) { /* likely a duplicate reaction, ignore */ }
      });
    });
  }

  function bumpReactionCount(messageId, emoji) {
    if (!reactionCounts[messageId]) reactionCounts[messageId] = {};
    reactionCounts[messageId][emoji] = (reactionCounts[messageId][emoji] || 0) + 1;
    const div = document.querySelector(`.chat-msg[data-message-id="${messageId}"] .chat-reaction-counts`);
    if (div) {
      div.innerHTML = Object.keys(reactionCounts[messageId])
        .map(e => `<span class="chat-reaction-pill">${e} ${reactionCounts[messageId][e]}</span>`).join('');
    }
  }

  function formatDateDivider(dateObj) {
    const now = new Date();
    const msgDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((today - msgDay) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  }

  let lastRenderedDateKey = null;

  const messagesById = {}; // for looking up quoted originals when rendering a reply

  function renderMessage(msg) {
    messagesById[msg.id] = msg;
    const container = document.getElementById('chatMessages');
    const msgDate = new Date(msg.created_at);
    const dateKey = msgDate.toDateString();
    if (dateKey !== lastRenderedDateKey) {
      lastRenderedDateKey = dateKey;
      const divider = document.createElement('div');
      divider.className = 'chat-date-divider';
      divider.innerHTML = `<span>${formatDateDivider(msgDate)}</span>`;
      container.appendChild(divider);
    }

    const div = document.createElement('div');
    const isOwn = !!(currentUser && msg.user_id === currentUser.id);
    div.className = 'chat-msg' + (isOwn ? ' chat-msg-own' : '');
    div.dataset.messageId = msg.id;
    const time = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const canEdit = !!(currentUser && isOwn && msg.message &&
      (Date.now() - msgDate.getTime()) < 30 * 60 * 1000);
    const editIcon = canEdit ? `<button type="button" class="chat-report-icon chat-edit-icon" title="Edit (within 30 min of sending)">✏️</button>` : '';
    // Reply is available on every message, own or not, no time limit.
    const replyIcon = `<button type="button" class="chat-report-icon chat-reply-icon" title="Reply">↩️</button>`;

    let actionIcon = '';
    if (currentUser && currentUser.isAdmin) {
      // Admin can delete ANY message, including their own.
      actionIcon = `<button type="button" class="chat-report-icon chat-admin-delete-icon" title="Delete this message">🗑️</button>`;
    } else if (currentUser && !isOwn) {
      // Regular users can only ever report someone ELSE's message.
      actionIcon = `<button type="button" class="chat-report-icon" title="Report this message">🚩</button>`;
    }
    const editedTag = msg.edited_at ? `<span class="chat-edited-tag">(edited)</span>` : '';

    const quotedOriginal = msg.reply_to_id ? messagesById[msg.reply_to_id] : null;
    const quotedHtml = quotedOriginal
      ? `<div class="chat-quoted-block" data-jump-to="${quotedOriginal.id}">
           <span class="qname">${quotedOriginal.display_name}</span>
           <span class="qtext">${quotedOriginal.message ? quotedOriginal.message.replace(/</g, '&lt;') : (quotedOriginal.image_url ? '📷 Photo' : '')}</span>
         </div>`
      : (msg.reply_to_id ? `<div class="chat-quoted-block"><span class="qtext">Original message not loaded</span></div>` : '');

    div.innerHTML = `
      <div class="chat-msg-name">${msg.display_name} <span class="chat-msg-time">${time}</span>${editedTag} ${actionIcon}${editIcon}${replyIcon}</div>
      ${quotedHtml}
      ${msg.message ? `<div class="chat-msg-text" data-raw-text="${msg.message.replace(/"/g, '&quot;')}">${msg.message.replace(/</g, '&lt;')}</div>` : ''}
      ${msg.image_url ? `<img class="chat-msg-image" src="${msg.image_url}" alt="Attached image">` : ''}
      ${renderReactionBar(msg.id)}
    `;
    container.appendChild(div);
    attachReactionHandlers(div, msg.id);
    attachReportHandler(div, msg);
    attachEditHandler(div, msg);
    attachReplyHandler(div, msg);
    container.scrollTop = container.scrollHeight;
  }

  // ---------- Editing your own recent message ----------
  function attachEditHandler(div, msg) {
    const editBtn = div.querySelector('.chat-edit-icon');
    if (!editBtn) return;

    editBtn.addEventListener('click', () => {
      const textDiv = div.querySelector('.chat-msg-text');
      if (!textDiv) return;
      const currentText = textDiv.dataset.rawText;

      textDiv.outerHTML = `
        <div class="chat-msg-edit-box">
          <textarea class="chat-msg-edit-input" rows="2">${currentText}</textarea>
          <div class="chat-msg-edit-actions">
            <button type="button" class="admin-mini-btn chat-edit-save-btn">Save</button>
            <button type="button" class="admin-mini-btn chat-edit-cancel-btn">Cancel</button>
          </div>
        </div>
      `;

      const editBox = div.querySelector('.chat-msg-edit-box');
      const textarea = editBox.querySelector('.chat-msg-edit-input');
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);

      editBox.querySelector('.chat-edit-cancel-btn').addEventListener('click', () => {
        editBox.outerHTML = `<div class="chat-msg-text" data-raw-text="${currentText.replace(/"/g, '&quot;')}">${currentText.replace(/</g, '&lt;')}</div>`;
      });

      editBox.querySelector('.chat-edit-save-btn').addEventListener('click', async () => {
        const newText = textarea.value.trim();
        if (!newText) return;
        if (containsOffensiveLanguage(newText)) {
          alert("This message looks offensive — please be respectful in the community chat.");
          return;
        }

        const { error } = await supabaseClient
          .from('chat_messages')
          .update({ message: newText, edited_at: new Date().toISOString() })
          .eq('id', msg.id);

        if (error) {
          alert("Couldn't save your edit — try again.");
          return;
        }

        msg.message = newText;
        msg.edited_at = new Date().toISOString();
        editBox.outerHTML = `<div class="chat-msg-text" data-raw-text="${newText.replace(/"/g, '&quot;')}">${newText.replace(/</g, '&lt;')}</div>`;
        if (!div.querySelector('.chat-edited-tag')) {
          div.querySelector('.chat-msg-name').insertAdjacentHTML('beforeend', '<span class="chat-edited-tag">(edited)</span>');
        }
      });
    });
  }

  // ---------- Replying to a message (quote-style, like WhatsApp) ----------
  let pendingReplyTo = null; // { id, displayName, snippet }

  function setPendingReply(msg) {
    const snippet = msg.message
      ? (msg.message.length > 60 ? msg.message.slice(0, 60) + '...' : msg.message)
      : (msg.image_url ? '📷 Photo' : '');
    pendingReplyTo = { id: msg.id, displayName: msg.display_name, snippet };
    const preview = document.getElementById('chatReplyPreview');
    preview.querySelector('.chat-reply-preview-name').textContent = `Replying to ${msg.display_name}`;
    preview.querySelector('.chat-reply-preview-text').textContent = snippet;
    preview.style.display = 'flex';
    const textInput = document.getElementById('chatTextInput');
    if (textInput) textInput.focus();
  }

  function clearPendingReply() {
    pendingReplyTo = null;
    document.getElementById('chatReplyPreview').style.display = 'none';
  }

  document.getElementById('chatReplyCancelBtn').addEventListener('click', clearPendingReply);

  function attachReplyHandler(div, msg) {
    const replyBtn = div.querySelector('.chat-reply-icon');
    if (!replyBtn) return;
    replyBtn.addEventListener('click', () => {
      if (!currentUser) {
        loginPromptOverlay.classList.add('open');
        return;
      }
      if (currentUser.banned) return;
      setPendingReply(msg);
    });

    // Clicking a quoted block jumps to (and briefly highlights) the original message.
    const quoted = div.querySelector('.chat-quoted-block');
    if (quoted) {
      quoted.addEventListener('click', () => {
        const targetId = quoted.dataset.jumpTo;
        if (!targetId) return;
        const targetEl = document.querySelector(`.chat-msg[data-message-id="${targetId}"]`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.style.transition = 'background 0.3s ease';
          targetEl.style.background = '#FFF6C9';
          setTimeout(() => { targetEl.style.background = ''; }, 1200);
        }
      });
    }
  }

  // ---------- Reporting a message/user (or, for admins on Master
  // Control, deleting it directly instead) ----------
  const reportPanel = document.getElementById('chatReportPanel');
  let reportTarget = null; // { messageId, userId, displayName }

  function attachReportHandler(div, msg) {
    if (currentUser && currentUser.isAdmin) {
      const delBtn = div.querySelector('.chat-admin-delete-icon');
      if (!delBtn) return;
      delBtn.addEventListener('click', async () => {
        if (!confirm('Delete this message from the community chat?')) return;
        await supabaseClient.from('chat_messages').delete().eq('id', msg.id);
        div.remove();
      });
      return;
    }

    const btn = div.querySelector('.chat-report-icon:not(.chat-edit-icon):not(.chat-admin-delete-icon):not(.chat-reply-icon)');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (!currentUser) {
        loginPromptOverlay.classList.add('open');
        return;
      }
      reportTarget = { messageId: msg.id, userId: msg.user_id, displayName: msg.display_name };
      document.getElementById('chatReportTarget').textContent = `Reporting ${msg.display_name}'s message`;
      document.getElementById('chatReportReason').value = 'offensive';
      document.getElementById('chatReportDetails').value = '';
      document.getElementById('chatReportMessage').textContent = '';
      reportPanel.classList.add('open');
      document.getElementById('chatEmojiPanel').classList.remove('open');
      document.getElementById('chatEmojiBtn').textContent = '😊';
    });
  }

  document.getElementById('chatReportCloseBtn').addEventListener('click', () => {
    reportPanel.classList.remove('open');
  });

  document.getElementById('chatReportSubmitBtn').addEventListener('click', async () => {
    if (!currentUser || !reportTarget) return;
    const msgEl = document.getElementById('chatReportMessage');
    const reason = document.getElementById('chatReportReason').value;
    const details = document.getElementById('chatReportDetails').value.trim();

    const { error } = await supabaseClient.from('chat_reports').insert({
      message_id: reportTarget.messageId,
      reported_by: currentUser.id,
      reported_user_id: reportTarget.userId,
      reason,
      details: details || null
    });

    if (error) {
      msgEl.textContent = 'Could not submit the report — try again.';
      msgEl.style.color = '#B3261E';
      return;
    }

    msgEl.textContent = "Thank you for your report. Our team will review it, and if we find it to be true, we'll take appropriate action.";
    msgEl.style.color = 'var(--excel-green-deep)';
    setTimeout(() => { reportPanel.classList.remove('open'); }, 2600);
  });

  async function loadMessages() {
    const container = document.getElementById('chatMessages');
    container.innerHTML = '<div class="chat-loading">Loading chat...</div>';
    lastRenderedDateKey = null;
    try {
      const { data, error } = await supabaseClient
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);
      if (error) throw error;

      container.innerHTML = '';
      (data || []).forEach(msg => {
        renderedMessageIds.add(msg.id);
        renderMessage(msg);
      });

      // Load existing reactions for these messages
      if (data && data.length) {
        const ids = data.map(m => m.id);
        const { data: reactions } = await supabaseClient
          .from('chat_reactions')
          .select('message_id, emoji')
          .in('message_id', ids);
        (reactions || []).forEach(r => bumpReactionCount(r.message_id, r.emoji));
      }
    } catch (e) {
      const detail = (e && e.message) ? e.message : 'Unknown error';
      container.innerHTML = `<div class="chat-loading">Couldn't load chat history.<br><span style="font-size:11px; opacity:0.7;">${detail}</span></div>`;
    }
  }

  let realtimeSubscribed = false;
  const renderedMessageIds = new Set();

  function subscribeRealtime() {
    if (realtimeSubscribed) return;
    realtimeSubscribed = true;
    supabaseClient
      .channel('public:chat_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        if (renderedMessageIds.has(payload.new.id)) return;
        renderedMessageIds.add(payload.new.id);
        renderMessage(payload.new);
      })
      .subscribe();

    supabaseClient
      .channel('public:chat_reactions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_reactions' }, (payload) => {
        const key = `${payload.new.message_id}:${payload.new.emoji}`;
        if (myPendingReactions.has(key)) {
          myPendingReactions.delete(key);
          return; // already counted instantly when we clicked
        }
        bumpReactionCount(payload.new.message_id, payload.new.emoji);
      })
      .subscribe();
  }

  // ---------- Sending ----------
  document.getElementById('chatImageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pendingImageFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById('chatImagePreview').src = ev.target.result;
      document.getElementById('chatImagePreviewRow').style.display = 'flex';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('chatRemoveImageBtn').addEventListener('click', () => {
    pendingImageFile = null;
    document.getElementById('chatImageInput').value = '';
    document.getElementById('chatImagePreviewRow').style.display = 'none';
  });

  async function sendMessage() {
    if (!currentUser) {
      loginPromptOverlay.classList.add('open');
      return;
    }
    if (currentUser.banned) return;

    const textInput = document.getElementById('chatTextInput');
    const text = textInput.value.trim();
    if (!text && !pendingImageFile) return;

    const warningEl = document.getElementById('chatComposeWarning');
    if (text && containsOffensiveLanguage(text)) {
      warningEl.textContent = "This message looks offensive — please be respectful in the community chat.";
      warningEl.style.display = 'block';
      return;
    }
    warningEl.style.display = 'none';

    let imageUrl = null;
    if (pendingImageFile) {
      try {
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${pendingImageFile.name}`;
        const { error: uploadError } = await supabaseClient.storage
          .from('chat-images')
          .upload(fileName, pendingImageFile);
        if (!uploadError) {
          const { data } = supabaseClient.storage.from('chat-images').getPublicUrl(fileName);
          imageUrl = data.publicUrl;
        }
      } catch (e) { console.error('Image upload failed', e); }
    }

    let sendError = null;
    try {
      const { data: inserted, error } = await supabaseClient
        .from('chat_messages')
        .insert({
          user_id: currentUser.id,
          display_name: currentUser.displayName,
          message: text || null,
          image_url: imageUrl,
          reply_to_id: pendingReplyTo ? pendingReplyTo.id : null
        })
        .select()
        .single();
      if (error) {
        sendError = error;
      } else if (inserted) {
        renderedMessageIds.add(inserted.id);
        renderMessage(inserted);
        clearPendingReply();
      }
    } catch (e) {
      sendError = e;
    }

    if (sendError) {
      const container = document.getElementById('chatMessages');
      const errDiv = document.createElement('div');
      errDiv.className = 'chat-loading';
      errDiv.innerHTML = `Message failed to send.<br><span style="font-size:11px; opacity:0.7;">${sendError.message || 'Unknown error'}</span>`;
      container.appendChild(errDiv);
      container.scrollTop = container.scrollHeight;
    }

    textInput.value = '';
    pendingImageFile = null;
    document.getElementById('chatImageInput').value = '';
    document.getElementById('chatImagePreviewRow').style.display = 'none';
    emojiPanel.classList.remove('open');
    document.getElementById('chatEmojiBtn').textContent = '😊';
  }

  document.getElementById('chatSendBtn').addEventListener('click', sendMessage);
  document.getElementById('chatTextInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  document.getElementById('chatTextInput').addEventListener('input', () => {
    document.getElementById('chatComposeWarning').style.display = 'none';
  });
})();
