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

// ---------- Change Password modal (current + new + confirm) ----------
function buildPasswordModal() {
  if (document.getElementById('pwModalOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'pwModalOverlay';
  overlay.className = 'fb-overlay';
  overlay.innerHTML = `
    <div class="fb-box" style="max-width:380px;">
      <button class="fb-close" id="pwCloseBtn" aria-label="Close">&times;</button>
      <h3>Change Password</h3>
      <p class="fb-hint">Enter your current password, then your new one twice.</p>

      <label>Current password</label>
      <input type="password" id="pwCurrent" placeholder="Current password">

      <label>New password</label>
      <input type="password" id="pwNew" placeholder="At least 6 characters">

      <label>Confirm new password</label>
      <input type="password" id="pwConfirm" placeholder="Re-type new password">

      <button class="btn btn-primary" id="pwSubmitBtn" style="width:100%; margin-top:14px;">Update Password</button>
      <div id="pwMessage" style="margin-top:10px; font-size:13px; font-family:'IBM Plex Mono',monospace;"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('pwCloseBtn').addEventListener('click', () => {
    overlay.classList.remove('open');
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });

  document.getElementById('pwSubmitBtn').addEventListener('click', async () => {
    const email = overlay.dataset.email;
    const current = document.getElementById('pwCurrent').value;
    const next = document.getElementById('pwNew').value;
    const confirm = document.getElementById('pwConfirm').value;
    const msg = document.getElementById('pwMessage');
    msg.className = '';
    msg.textContent = '';

    if (!current || !next || !confirm) {
      msg.textContent = 'Please fill in all three fields.';
      msg.style.color = '#B3261E';
      return;
    }
    if (next.length < 6) {
      msg.textContent = 'New password must be at least 6 characters.';
      msg.style.color = '#B3261E';
      return;
    }
    if (next !== confirm) {
      msg.textContent = 'New password and confirmation don\u2019t match.';
      msg.style.color = '#B3261E';
      return;
    }

    // Verify the current password is correct by re-authenticating with it
    const { error: verifyError } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: current
    });

    if (verifyError) {
      msg.textContent = 'Current password is incorrect.';
      msg.style.color = '#B3261E';
      return;
    }

    const { error: updateError } = await supabaseClient.auth.updateUser({ password: next });

    if (updateError) {
      msg.textContent = updateError.message;
      msg.style.color = '#B3261E';
      return;
    }

    msg.textContent = 'Password updated!';
    msg.style.color = 'var(--excel-green-deep)';
    document.getElementById('pwCurrent').value = '';
    document.getElementById('pwNew').value = '';
    document.getElementById('pwConfirm').value = '';
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
