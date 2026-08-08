// Learn With Rinkesh — floating leaderboard widget. Shows the current
// #1 spotlight (avatar + tier badge), admin-controlled: on/off + which
// pages it appears on. Include on any page after supabaseClient +
// scoring.js (for getUserTier).

(async function () {
  try {
    const pageFile = window.location.pathname.split('/').pop() || 'index.html';

    const [{ data: enabledRow }, { data: pagesRow }] = await Promise.all([
      supabaseClient.from('page_content').select('content').eq('id', 'pc-leaderboard-enabled').maybeSingle(),
      supabaseClient.from('page_content').select('content').eq('id', 'pc-leaderboard-pages').maybeSingle()
    ]);

    if (!enabledRow || enabledRow.content !== 'on') return;
    const allowedPages = (pagesRow && pagesRow.content) ? pagesRow.content.split('\n').map(p => p.trim()).filter(Boolean) : [];
    if (!allowedPages.includes(pageFile)) return;

    const { data: topScorer } = await supabaseClient
      .from('user_scores')
      .select('user_id, total_points')
      .order('total_points', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!topScorer) return;

    const { data: profile } = await supabaseClient.from('profiles').select('name, chat_display_name, chat_hide_name, avatar_url').eq('id', topScorer.user_id).maybeSingle();
    const name = (profile && profile.chat_hide_name) ? 'Anonymous' : ((profile && (profile.chat_display_name || profile.name)) || 'Someone');

    let badgeEmoji = '👑';
    if (typeof getUserTier === 'function') {
      const tier = await getUserTier(0, 1, topScorer.total_points);
      badgeEmoji = tier.badge_emoji;
    }

    const avatarUrl = profile && profile.avatar_url;
    const avatarInner = avatarUrl
      ? `<img src="${avatarUrl}" style="width:26px; height:26px; border-radius:50%; object-fit:cover; display:block;" onerror="this.style.display='none';">`
      : `<div style="width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,0.3); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px;">${name.charAt(0).toUpperCase()}</div>`;

    const style = document.createElement('style');
    style.textContent = `
      .lbw-widget {
        position: fixed; top: 90px; left: 16px; z-index: 9000;
        background: linear-gradient(135deg, #C9971E, #E8B84B);
        color: #1C1C1C; border-radius: 24px; padding: 6px 12px 6px 6px;
        display: flex; align-items: center; gap: 7px; cursor: pointer;
        box-shadow: 0 6px 18px rgba(0,0,0,0.2); text-decoration: none;
        font-family: 'IBM Plex Sans', sans-serif; font-size: 11px; font-weight: 700;
        opacity: 0; transform: translateX(-20px); animation: lbwIn 0.5s ease 0.3s forwards, lbwGlow 2s ease infinite alternate 1s;
        max-width: 170px;
      }
      .lbw-widget:hover { transform: translateX(3px) scale(1.03); }
      @keyframes lbwIn { to { opacity: 1; transform: translateX(0); } }
      @keyframes lbwGlow { from { box-shadow: 0 6px 18px rgba(0,0,0,0.2); } to { box-shadow: 0 6px 22px rgba(232,184,75,0.6); } }
      .lbw-avatar-wrap { position: relative; flex-shrink: 0; }
      .lbw-badge {
        position: absolute; bottom: -3px; right: -3px; font-size: 10px;
        background: #fff; border-radius: 50%; width: 14px; height: 14px;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 1px 2px rgba(0,0,0,0.3); line-height: 1;
      }
      .lbw-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      @media (max-width: 480px) { .lbw-widget { left: 10px; top: 76px; max-width: 140px; } }
    `;
    document.head.appendChild(style);

    const widget = document.createElement('a');
    widget.href = 'leaderboard.html';
    widget.className = 'lbw-widget';
    widget.innerHTML = `<span class="lbw-avatar-wrap">${avatarInner}<span class="lbw-badge">${badgeEmoji}</span></span><span class="lbw-text">${name} is #1</span>`;
    document.body.appendChild(widget);
  } catch (e) { /* widget failing to load should never break the page */ }
})();
