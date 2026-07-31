// =========================================================
// Learn With Rinkesh — Community Chat widget
// Included on every page via <script src="chat-widget.js">
// (must load AFTER supabase-config.js since it uses supabaseClient)
// =========================================================

(function () {
  const GUEST_NAME_KEY = 'lwr_chat_guest_name';

  // ---------- Inject floating icon ----------
  const btn = document.createElement('button');
  btn.id = 'chatFloatBtn';
  btn.innerHTML = '💬';
  document.body.appendChild(btn);

  // ---------- Inject disclaimer overlay ----------
  const disclaimerOverlay = document.createElement('div');
  disclaimerOverlay.id = 'chatDisclaimerOverlay';
  disclaimerOverlay.className = 'chat-overlay';
  disclaimerOverlay.innerHTML = `
    <div class="chat-disclaimer-box">
      <h3>Before you join the chat</h3>
      <p>This is a public space to connect with other Excel learners — ask questions, share tips, help each other out.</p>
      <ul>
        <li>No offensive language or harassment</li>
        <li>Respect everyone's questions and skill level — no question is a bad one</li>
        <li>This platform exists to help people learn, grow, and connect — keep it that way</li>
      </ul>
      <button class="btn btn-primary" id="chatAgreeBtn" style="width:100%;">I Understand — Start Chatting</button>
    </div>
  `;
  document.body.appendChild(disclaimerOverlay);

  // ---------- Inject chat window ----------
  const chatWindow = document.createElement('div');
  chatWindow.id = 'chatWindow';
  chatWindow.className = 'chat-window';
  chatWindow.innerHTML = `
    <div class="chat-header">
      <span>💬 Community Chat</span>
      <div>
        <button id="chatSettingsBtn" title="Chat settings">⚙️</button>
        <button id="chatMinimizeBtn" title="Minimize">&minus;</button>
      </div>
    </div>
    <div class="chat-settings-panel" id="chatSettingsPanel">
      <label>Your display name</label>
      <input type="text" id="chatNameInput" placeholder="How you appear in chat">
      <label class="chat-checkbox-row"><input type="checkbox" id="chatHideNameToggle"> Hide my name (show as "Anonymous")</label>
      <button class="btn btn-primary" id="chatSaveSettingsBtn" style="width:100%; margin-top:8px;">Save</button>
    </div>
    <div class="chat-messages" id="chatMessages"></div>
    <div class="chat-input-row">
      <label class="chat-attach-btn" title="Attach an image">
        📎<input type="file" id="chatImageInput" accept="image/*" style="display:none;">
      </label>
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
  let currentUser = null; // { id, isLoggedIn, displayName }

  // ---------- Determine identity ----------
  async function resolveIdentity() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('name, chat_display_name, chat_hide_name, chat_disclaimer_seen')
        .eq('id', session.user.id)
        .maybeSingle();

      const name = (profile && profile.chat_hide_name)
        ? 'Anonymous'
        : (profile && (profile.chat_display_name || profile.name)) || session.user.email.split('@')[0];

      currentUser = {
        id: session.user.id,
        isLoggedIn: true,
        displayName: name,
        disclaimerSeen: !!(profile && profile.chat_disclaimer_seen),
        rawName: profile ? profile.chat_display_name : '',
        hideNameSetting: !!(profile && profile.chat_hide_name)
      };
    } else {
      let guestName = sessionStorage.getItem(GUEST_NAME_KEY);
      if (!guestName) {
        guestName = 'Guest' + Math.floor(1000 + Math.random() * 9000);
        sessionStorage.setItem(GUEST_NAME_KEY, guestName);
      }
      currentUser = {
        id: null,
        isLoggedIn: false,
        displayName: guestName,
        disclaimerSeen: false, // anonymous users always see the disclaimer
        rawName: guestName,
        hideNameSetting: false
      };
    }
  }

  // ---------- Open / close flow ----------
  async function openChat() {
    if (!currentUser) await resolveIdentity();

    if (!currentUser.disclaimerSeen) {
      disclaimerOverlay.classList.add('open');
      return;
    }
    showChatWindow();
  }

  function showChatWindow() {
    chatWindow.classList.add('open');
    document.getElementById('chatNameInput').value = currentUser.rawName || '';
    document.getElementById('chatHideNameToggle').checked = currentUser.hideNameSetting;
    loadMessages();
    subscribeRealtime();
  }

  btn.addEventListener('click', () => {
    if (chatWindow.classList.contains('open')) {
      chatWindow.classList.remove('open');
    } else {
      openChat();
    }
  });

  document.getElementById('chatAgreeBtn').addEventListener('click', async () => {
    disclaimerOverlay.classList.remove('open');
    if (currentUser.isLoggedIn) {
      currentUser.disclaimerSeen = true;
      try {
        await supabaseClient.from('profiles').update({ chat_disclaimer_seen: true }).eq('id', currentUser.id);
      } catch (e) {}
    }
    showChatWindow();
  });

  document.getElementById('chatMinimizeBtn').addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  // ---------- Settings panel ----------
  document.getElementById('chatSettingsBtn').addEventListener('click', () => {
    document.getElementById('chatSettingsPanel').classList.toggle('open');
  });

  document.getElementById('chatSaveSettingsBtn').addEventListener('click', async () => {
    const newName = document.getElementById('chatNameInput').value.trim();
    const hideName = document.getElementById('chatHideNameToggle').checked;

    if (currentUser.isLoggedIn) {
      try {
        await supabaseClient.from('profiles').update({
          chat_display_name: newName || null,
          chat_hide_name: hideName
        }).eq('id', currentUser.id);
      } catch (e) {}
      currentUser.rawName = newName;
      currentUser.hideNameSetting = hideName;
      currentUser.displayName = hideName ? 'Anonymous' : (newName || currentUser.displayName);
    } else {
      const guestName = newName || currentUser.displayName;
      sessionStorage.setItem(GUEST_NAME_KEY, guestName);
      currentUser.displayName = hideName ? 'Anonymous' : guestName;
      currentUser.rawName = guestName;
      currentUser.hideNameSetting = hideName;
    }
    document.getElementById('chatSettingsPanel').classList.remove('open');
  });

  // ---------- Messages ----------
  function renderMessage(msg) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg';
    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    div.innerHTML = `
      <div class="chat-msg-name">${msg.display_name} <span class="chat-msg-time">${time}</span></div>
      ${msg.message ? `<div class="chat-msg-text">${msg.message.replace(/</g, '&lt;')}</div>` : ''}
      ${msg.image_url ? `<img class="chat-msg-image" src="${msg.image_url}" alt="Attached image">` : ''}
    `;
    container.appendChild(div);
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
      container.innerHTML = '';
      if (error) throw error;
      (data || []).forEach(renderMessage);
    } catch (e) {
      const detail = (e && e.message) ? e.message : 'Unknown error';
      container.innerHTML = `<div class="chat-loading">Couldn't load chat history.<br><span style="font-size:11px; opacity:0.7;">${detail}</span></div>`;
    }
  }

  let realtimeSubscribed = false;
  function subscribeRealtime() {
    if (realtimeSubscribed) return;
    realtimeSubscribed = true;
    supabaseClient
      .channel('public:chat_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        renderMessage(payload.new);
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
      const { error } = await supabaseClient.from('chat_messages').insert({
        user_id: currentUser.id,
        display_name: currentUser.displayName,
        message: text || null,
        image_url: imageUrl
      });
      if (error) sendError = error;
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
  }

  document.getElementById('chatSendBtn').addEventListener('click', sendMessage);
  document.getElementById('chatTextInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
