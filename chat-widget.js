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
  const COMPOSE_EMOJIS = ['😀','😂','😍','😎','🤔','😢','😮','🙏','👍','👎','🔥','🎉','❤️','💡','✅','❌','😅','🙌','👏','🤝'];

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
    <div class="chat-header">
      <span>💬 Community Chat</span>
      <div>
        <button id="chatGuidelinesBtn" title="Community guidelines">&excl;</button>
        <button id="chatSettingsBtn" title="Chat settings">⚙️</button>
        <button id="chatMaximizeBtn" title="Maximize">⛶</button>
        <button id="chatMinimizeBtn" title="Minimize">&minus;</button>
      </div>
    </div>
    <div class="chat-settings-panel" id="chatSettingsPanel">
      <label>Your display name</label>
      <input type="text" id="chatNameInput" placeholder="How you appear in chat">
      <label class="chat-checkbox-row"><input type="checkbox" id="chatHideNameToggle"> Hide my name (show as "Anonymous")</label>
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
    <div class="chat-messages" id="chatMessages"></div>
    <div class="chat-emoji-panel" id="chatEmojiPanel"></div>
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
  let currentUser = null; // { id, displayName, disclaimerSeen, banned, rawName, hideNameSetting }

  // ---------- Determine identity (logged-in users only) ----------
  async function resolveIdentity() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      currentUser = null;
      return;
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('name, chat_display_name, chat_hide_name, chat_disclaimer_seen, chat_banned')
      .eq('id', session.user.id)
      .maybeSingle();

    const name = (profile && profile.chat_hide_name)
      ? 'Anonymous'
      : (profile && (profile.chat_display_name || profile.name)) || session.user.email.split('@')[0];

    currentUser = {
      id: session.user.id,
      displayName: name,
      disclaimerSeen: !!(profile && profile.chat_disclaimer_seen),
      banned: !!(profile && profile.chat_banned),
      rawName: profile ? profile.chat_display_name : '',
      hideNameSetting: !!(profile && profile.chat_hide_name)
    };
  }

  // ---------- Open / close flow ----------
  async function openChat() {
    await resolveIdentity();

    if (!currentUser) {
      loginPromptOverlay.classList.add('open');
      return;
    }
    showChatWindow();
  }

  function showChatWindow() {
    chatWindow.classList.add('open');
    sessionStorage.setItem(OPEN_STATE_KEY, '1');
    document.getElementById('chatNameInput').value = currentUser.rawName || '';
    document.getElementById('chatHideNameToggle').checked = currentUser.hideNameSetting;
    applyTheme();

    const inputRow = document.querySelector('.chat-input-row');
    if (currentUser.banned) {
      inputRow.style.display = 'none';
      const container = document.getElementById('chatMessages');
      container.insertAdjacentHTML('afterbegin', '<div class="chat-loading">You have been restricted from posting in chat.</div>');
    } else {
      inputRow.style.display = 'flex';
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

  document.getElementById('chatSaveSettingsBtn').addEventListener('click', async () => {
    if (!currentUser) return;
    const newName = document.getElementById('chatNameInput').value.trim();
    const hideName = document.getElementById('chatHideNameToggle').checked;

    try {
      await supabaseClient.from('profiles').update({
        chat_display_name: newName || null,
        chat_hide_name: hideName
      }).eq('id', currentUser.id);
    } catch (e) {}
    currentUser.rawName = newName;
    currentUser.hideNameSetting = hideName;
    currentUser.displayName = hideName ? 'Anonymous' : (newName || currentUser.displayName);
    document.getElementById('chatSettingsPanel').classList.remove('open');
  });

  // ---------- Emoji picker (composing) ----------
  const emojiPanel = document.getElementById('chatEmojiPanel');
  emojiPanel.innerHTML = COMPOSE_EMOJIS.map(e => `<span class="chat-emoji-option">${e}</span>`).join('');
  emojiPanel.querySelectorAll('.chat-emoji-option').forEach(el => {
    el.addEventListener('click', () => {
      const input = document.getElementById('chatTextInput');
      input.value += el.textContent;
      input.focus();
    });
  });
  document.getElementById('chatEmojiBtn').addEventListener('click', () => {
    emojiPanel.classList.toggle('open');
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

  function renderMessage(msg) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg';
    div.dataset.messageId = msg.id;
    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    div.innerHTML = `
      <div class="chat-msg-name">${msg.display_name} <span class="chat-msg-time">${time}</span></div>
      ${msg.message ? `<div class="chat-msg-text">${msg.message.replace(/</g, '&lt;')}</div>` : ''}
      ${msg.image_url ? `<img class="chat-msg-image" src="${msg.image_url}" alt="Attached image">` : ''}
      ${renderReactionBar(msg.id)}
    `;
    container.appendChild(div);
    attachReactionHandlers(div, msg.id);
    container.scrollTop = container.scrollHeight;
  }

  async function loadMessages() {
    const container = document.getElementById('chatMessages');
    container.innerHTML = '<div class="chat-loading">Loading chat...</div>';
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
    if (!currentUser || currentUser.banned) return;

    const textInput = document.getElementById('chatTextInput');
    const text = textInput.value.trim();
    if (!text && !pendingImageFile) return;

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
          image_url: imageUrl
        })
        .select()
        .single();
      if (error) {
        sendError = error;
      } else if (inserted) {
        renderedMessageIds.add(inserted.id);
        renderMessage(inserted);
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
  }

  document.getElementById('chatSendBtn').addEventListener('click', sendMessage);
  document.getElementById('chatTextInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
