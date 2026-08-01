// =========================================================
// Learn With Rinkesh — shared login-aware navigation
// Included on every page. Checks if someone is logged in and
// swaps the nav's "Log In" link for their name + photo + menu.
// =========================================================

async function renderNavAuth() {
  const area = document.getElementById('navAuthArea');
  if (!area) return;

  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    area.innerHTML = '<a href="login.html">Log In</a>';
    return;
  }

  const user = session.user;

  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('name, avatar_url, profile_completed')
    .eq('id', user.id)
    .maybeSingle();

  const onSetupPage = window.location.pathname.includes('profile-setup.html');
  if ((!profile || !profile.profile_completed) && !onSetupPage) {
    window.location.href = 'profile-setup.html';
    return;
  }

  const displayName = (profile && profile.name) || user.email.split('@')[0];
  const avatarUrl = (profile && profile.avatar_url) || user.user_metadata?.avatar_url;
  const initial = displayName.charAt(0).toUpperCase();

  const avatarHtml = avatarUrl
    ? `<img src="${avatarUrl}" class="nav-avatar-img" alt="">`
    : `<span class="nav-avatar-initial">${initial}</span>`;

  const bigAvatarHtml = avatarUrl
    ? `<img src="${avatarUrl}" class="nav-avatar-img-lg" alt="">`
    : `<span class="nav-avatar-initial-lg">${initial}</span>`;

  area.innerHTML = `
    <div class="nav-account">
      <button class="nav-account-btn" id="navAccountBtn">
        ${avatarHtml}
        <span>${displayName}</span>
      </button>
      <div class="nav-account-menu" id="navAccountMenu">
        <div class="nav-account-menu-header">
          ${bigAvatarHtml}
          <div>
            <div class="nav-account-menu-name">${displayName}</div>
            <div class="nav-account-menu-email">${user.email}</div>
          </div>
        </div>
        <a href="account.html">⚙️ Account Settings</a>
        <a href="purchases.html">🧾 Purchases</a>
        <a href="#" id="navChangePasswordBtn">🔒 Change Password</a>
        <a href="#" id="navLogoutBtn" class="nav-account-menu-logout">↪ Log Out</a>
      </div>
    </div>
  `;

  document.getElementById('navAccountBtn').addEventListener('click', () => {
    document.getElementById('navAccountMenu').classList.toggle('open');
  });

  document.getElementById('navLogoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
  });

  document.getElementById('navChangePasswordBtn').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('navAccountMenu').classList.remove('open');
    openPasswordModal(user.email);
  });

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('navAccountMenu');
    const btn = document.getElementById('navAccountBtn');
    if (menu && !menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('open');
    }
  });
}

// ---------- Change Password modal (sends a secure reset link) ----------
function buildPasswordModal() {
  if (document.getElementById('pwModalOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'pwModalOverlay';
  overlay.className = 'fb-overlay';
  overlay.innerHTML = `
    <div class="fb-box" style="max-width:380px;">
      <button class="fb-close" id="pwCloseBtn" aria-label="Close">&times;</button>
      <h3>Change Password</h3>
      <p class="fb-hint">For your security, we don't change your password here directly — we'll email you a secure link to set a new one.</p>

      <button class="btn btn-primary" id="pwSendBtn" style="width:100%; margin-top:6px;">Send Reset Link</button>
      <div id="pwMessage" style="margin-top:12px; font-size:13px; font-family:'IBM Plex Mono',monospace;"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('pwCloseBtn').addEventListener('click', () => {
    overlay.classList.remove('open');
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });

  document.getElementById('pwSendBtn').addEventListener('click', async () => {
    const email = overlay.dataset.email;
    const btn = document.getElementById('pwSendBtn');
    const msg = document.getElementById('pwMessage');
    msg.className = '';
    msg.textContent = '';

    btn.disabled = true;
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/update-password.html'
    });
    btn.disabled = false;

    if (error) {
      msg.textContent = error.message;
      msg.style.color = '#B3261E';
      return;
    }

    msg.textContent = `A password reset link has been sent to your email address (${email}). Please change your password from that link.`;
    msg.style.color = 'var(--excel-green-deep)';
  });
}

function openPasswordModal(email) {
  buildPasswordModal();
  const overlay = document.getElementById('pwModalOverlay');
  overlay.dataset.email = email;
  document.getElementById('pwMessage').textContent = '';
  overlay.classList.add('open');
}

renderNavAuth();
