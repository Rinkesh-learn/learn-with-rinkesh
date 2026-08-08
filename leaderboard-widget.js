// Learn With Rinkesh — floating leaderboard widget. Shows the current
// #1 ("Legend") spotlight, admin-controlled: on/off + which pages it
// appears on. Include on any page after supabaseClient + scoring.js.

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

    const { data: profile } = await supabaseClient.from('profiles').select('name, chat_display_name, chat_hide_name').eq('id', topScorer.user_id).maybeSingle();
    const name = (profile && profile.chat_hide_name) ? 'Anonymous' : ((profile && (profile.chat_display_name || profile.name)) || 'Someone');

    const style = document.createElement('style');
    style.textContent = `
      .lbw-widget {
        position: fixed; bottom: 24px; left: 24px; z-index: 9000;
        background: linear-gradient(135deg, #C9971E, #E8B84B);
        color: #1C1C1C; border-radius: 30px; padding: 10px 18px 10px 12px;
        display: flex; align-items: center; gap: 8px; cursor: pointer;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2); text-decoration: none;
        font-family: 'IBM Plex Sans', sans-serif; font-size: 13px; font-weight: 700;
        opacity: 0; transform: translateY(20px); animation: lbwIn 0.5s ease 0.3s forwards, lbwGlow 2s ease infinite alternate 1s;
        max-width: 260px;
      }
      .lbw-widget:hover { transform: translateY(-2px); }
      @keyframes lbwIn { to { opacity: 1; transform: translateY(0); } }
      @keyframes lbwGlow { from { box-shadow: 0 8px 24px rgba(0,0,0,0.2); } to { box-shadow: 0 8px 30px rgba(232,184,75,0.6); } }
      .lbw-crown { font-size: 20px; flex-shrink: 0; }
      .lbw-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .lbw-sub { font-weight: 400; opacity: 0.75; font-size: 10px; display: block; }
      @media (max-width: 480px) { .lbw-widget { left: 12px; bottom: 12px; max-width: 200px; } }
    `;
    document.head.appendChild(style);

    const widget = document.createElement('a');
    widget.href = 'leaderboard.html';
    widget.className = 'lbw-widget';
    widget.innerHTML = `<span class="lbw-crown">👑</span><span class="lbw-text">${name} is #1<span class="lbw-sub">${topScorer.total_points} points — see leaderboard</span></span>`;
    document.body.appendChild(widget);
  } catch (e) { /* widget failing to load should never break the page */ }
})();
