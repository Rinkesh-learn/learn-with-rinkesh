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

  // Get their profile row (name, avatar, whether they've completed setup)
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('name, avatar_url, profile_completed')
    .eq('id', user.id)
    .maybeSingle();

  // Send first-time users to complete their profile
  // (skip this redirect if they're already on that page)
  const onSetupPage = window.location.pathname.includes('profile-setup.html');
  if (profile && !profile.profile_completed && !onSetupPage) {
    window.location.href = 'profile-setup.html';
    return;
  }

  const displayName = (profile && profile.name) || user.email.split('@')[0];
  const avatarUrl = (profile && profile.avatar_url) || user.user_metadata?.avatar_url;
  const initial = displayName.charAt(0).toUpperCase();

  const avatarHtml = avatarUrl
    ? `<img src="${avatarUrl}" class="nav-avatar-img" alt="">`
    : `<span class="nav-avatar-initial">${initial}</span>`;

  area.innerHTML = `
    <div class="nav-account">
      <button class="nav-account-btn" id="navAccountBtn">
        ${avatarHtml}
        <span>${displayName}</span>
      </button>
      <div class="nav-account-menu" id="navAccountMenu">
        <a href="account.html">My Account</a>
        <a href="index.html">My Progress</a>
        <a href="#" id="navLogoutBtn">Log Out</a>
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

  // Close the dropdown if clicking anywhere else on the page
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('navAccountMenu');
    const btn = document.getElementById('navAccountBtn');
    if (menu && !menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('open');
    }
  });
}

renderNavAuth();
