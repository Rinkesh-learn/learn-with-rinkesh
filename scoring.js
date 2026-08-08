// Learn With Rinkesh — shared scoring engine. Include on any page that
// should award points. Requires supabaseClient to already exist.
//
// Point rules:
//   Base points by difficulty: beginner=5, intermediate=10, advanced=20
//   Diminishing returns on repeated solves of the SAME formula:
//     1st-3rd solve of a formula: full points
//     4th-10th solve: half points
//     11th+ solve: quarter points
//   First-ever solve of a formula gets a flat +15 "coverage bonus" on
//   top, to reward breadth (trying new formulas) over grinding one.

(function () {
  const BASE_POINTS = { beginner: 5, intermediate: 10, advanced: 20 };
  const COVERAGE_BONUS = 15;

  function tierMultiplier(priorCount) {
    if (priorCount < 3) return 1;
    if (priorCount < 10) return 0.5;
    return 0.25;
  }

  // Call this the moment a question is answered CORRECTLY. Silently does
  // nothing if the visitor isn't logged in (no anonymous scoring).
  window.awardQuestionPoints = async function (formulaId, difficulty) {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) return;

      const diff = ['beginner','intermediate','advanced'].includes(difficulty) ? difficulty : 'intermediate';
      const base = BASE_POINTS[diff];

      const { count: priorCount } = await supabaseClient
        .from('score_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('formula_id', formulaId)
        .eq('event_type', 'question_solved');

      const tierPoints = Math.round(base * tierMultiplier(priorCount || 0));
      const bonus = (priorCount || 0) === 0 ? COVERAGE_BONUS : 0;
      const totalPoints = tierPoints + bonus;

      await supabaseClient.from('score_events').insert({
        user_id: session.user.id, event_type: 'question_solved',
        formula_id: formulaId, difficulty: diff, points: totalPoints
      });

      await bumpUserTotal(session.user.id, totalPoints);
      showScoreToast(totalPoints, bonus > 0 ? 'First time solving this formula!' : null);
    } catch (e) { /* scoring failure should never block the actual feature working */ }
  };

  // For non-question activities (article read, case study completed,
  // cert exam passed) — same underlying event log, fixed point values.
  window.awardActivityPoints = async function (eventType, points) {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) return;
      await supabaseClient.from('score_events').insert({ user_id: session.user.id, event_type: eventType, points });
      await bumpUserTotal(session.user.id, points);
      showScoreToast(points, null);
    } catch (e) { /* non-blocking */ }
  };

  async function bumpUserTotal(userId, delta) {
    const { data: existing } = await supabaseClient.from('user_scores').select('total_points').eq('user_id', userId).maybeSingle();
    const newTotal = (existing ? existing.total_points : 0) + delta;
    await supabaseClient.from('user_scores').upsert({ user_id: userId, total_points: newTotal, updated_at: new Date().toISOString() });
  }

  // Given a user's 0-indexed rank position, total ranked users, and their
  // actual point total, returns their tier: { name, badge_emoji, isLegend }.
  // Tiers are gated by real point thresholds, not just relative rank — a
  // single early user with a handful of points shouldn't become "Legend"
  // just by being the only one ranked. Legend additionally requires
  // holding rank #1.
  window.getUserTier = async function (rankIndex, totalUsers, userPoints) {
    userPoints = userPoints || 0;
    try {
      const { data: legendRow } = await supabaseClient.from('page_content').select('content').eq('id', 'pc-legend-min-points').maybeSingle();
      const legendMinPoints = Number(legendRow && legendRow.content) || 3000;
      if (rankIndex === 0 && userPoints >= legendMinPoints) {
        return { name: 'Legend', badge_emoji: '🏆', isLegend: true };
      }

      const { data: tiers } = await supabaseClient.from('score_tiers').select('*').order('min_points', { ascending: false });
      for (const t of (tiers || [])) {
        if (userPoints >= (t.min_points || 0)) {
          return { name: t.name, badge_emoji: t.badge_emoji, isLegend: false };
        }
      }
      return { name: 'Analyst', badge_emoji: '📊', isLegend: false };
    } catch (e) {
      return { name: 'Analyst', badge_emoji: '📊', isLegend: false };
    }
  };

  // ---------- Toast animation ----------
  const style = document.createElement('style');
  style.textContent = `
    .score-toast {
      position: fixed; bottom: 90px; right: 24px; z-index: 10001;
      background: linear-gradient(135deg, #1C4732, #2D6A4F);
      color: #fff; padding: 14px 20px; border-radius: 10px;
      font-family: 'IBM Plex Mono', monospace; font-weight: 700; font-size: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      display: flex; align-items: center; gap: 10px;
      opacity: 0; transform: translateY(20px) scale(0.9);
      animation: scoreToastIn 0.4s ease forwards, scoreToastOut 0.4s ease 2.6s forwards;
    }
    .score-toast .st-icon { font-size: 22px; animation: scorePulse 0.6s ease infinite alternate; }
    .score-toast .st-sub { font-size: 10px; font-weight: 400; opacity: 0.85; display: block; margin-top: 2px; }
    @keyframes scoreToastIn { to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes scoreToastOut { to { opacity: 0; transform: translateY(-10px) scale(0.95); } }
    @keyframes scorePulse { from { transform: scale(1); } to { transform: scale(1.15); } }
  `;
  document.head.appendChild(style);

  function showScoreToast(points, subtext) {
    const toast = document.createElement('div');
    toast.className = 'score-toast';
    toast.innerHTML = `<span class="st-icon">⭐</span><span>+${points} points${subtext ? `<span class="st-sub">${subtext}</span>` : ''}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  // ---------- Live tier-up / rank-passed notifications ----------
  // Runs on every page for a logged-in visitor. Compares their current
  // tier/rank against what was cached from their last check (this tab
  // only) and shows a notification the moment either improves — live,
  // via the same Realtime subscription pattern used for slot syncing,
  // not just on next page load.
  const liveStyle = document.createElement('style');
  liveStyle.textContent = `
    .tier-up-overlay {
      position: fixed; inset: 0; z-index: 10002; display: flex; align-items: center; justify-content: center;
      background: rgba(28,35,33,0.55); opacity: 0; animation: tierOverlayIn 0.3s ease forwards;
    }
    @keyframes tierOverlayIn { to { opacity: 1; } }
    .tier-up-card {
      background: linear-gradient(135deg, #1C4732, #2D6A4F); color: #fff; border-radius: 16px;
      padding: 36px 40px; text-align: center; max-width: 340px;
      transform: scale(0.7); animation: tierCardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s forwards;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    }
    @keyframes tierCardIn { to { transform: scale(1); } }
    .tier-up-badge { font-size: 52px; animation: tierBadgeBounce 0.8s ease 0.4s; }
    @keyframes tierBadgeBounce { 0%,100% { transform: translateY(0); } 30% { transform: translateY(-14px); } 50% { transform: translateY(0); } 70% { transform: translateY(-6px); } }
    .tier-up-title { font-size: 12px; font-family: 'IBM Plex Mono', monospace; opacity: 0.8; letter-spacing: 1px; margin-top: 10px; }
    .tier-up-name { font-size: 24px; font-weight: 700; margin: 6px 0 18px; }
    .tier-up-close { background: rgba(255,255,255,0.15); border: none; color: #fff; padding: 8px 22px; border-radius: 20px; font-weight: 700; font-size: 12px; cursor: pointer; }
    .tier-up-close:hover { background: rgba(255,255,255,0.25); }

    .rank-toast {
      position: fixed; bottom: 90px; right: 24px; z-index: 10001;
      background: #1C4732; color: #fff; padding: 12px 18px; border-radius: 10px;
      font-family: 'IBM Plex Sans', sans-serif; font-weight: 700; font-size: 13px;
      display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      opacity: 0; transform: translateY(20px); animation: scoreToastIn 0.4s ease forwards, scoreToastOut 0.4s ease 3.1s forwards;
    }
  `;
  document.head.appendChild(liveStyle);

  function showTierUpModal(tier) {
    const overlay = document.createElement('div');
    overlay.className = 'tier-up-overlay';
    overlay.innerHTML = `
      <div class="tier-up-card">
        <div class="tier-up-badge">${tier.badge_emoji}</div>
        <div class="tier-up-title">${tier.isLegend ? "YOU'RE NOW #1" : 'TIER UP!'}</div>
        <div class="tier-up-name">${tier.name}</div>
        <button class="tier-up-close">Nice!</button>
      </div>
    `;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector('.tier-up-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    setTimeout(close, 6000);
  }

  function showRankToast(rank) {
    const toast = document.createElement('div');
    toast.className = 'rank-toast';
    toast.innerHTML = `📈 You moved up to <strong>#${rank}</strong>!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  (async function initLiveScoreNotifications() {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) return;

      async function checkAndNotify() {
        const { data: allScores } = await supabaseClient
          .from('user_scores').select('user_id, total_points').order('total_points', { ascending: false });
        if (!allScores) return;
        const rankIndex = allScores.findIndex(r => r.user_id === session.user.id);
        if (rankIndex === -1) return;

        const tier = await getUserTier(rankIndex, allScores.length, allScores[rankIndex].total_points);
        const rank = rankIndex + 1;
        const prevTier = sessionStorage.getItem('lwr_prev_tier');
        const prevRank = sessionStorage.getItem('lwr_prev_rank');

        if (prevTier && prevTier !== tier.name) {
          showTierUpModal(tier);
        } else if (prevRank && Number(prevRank) > rank) {
          showRankToast(rank);
        }

        sessionStorage.setItem('lwr_prev_tier', tier.name);
        sessionStorage.setItem('lwr_prev_rank', String(rank));
      }

      await checkAndNotify(); // establishes baseline on first load, catches a change since last visit too

      supabaseClient
        .channel('live_score_notify_' + session.user.id)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_scores' }, checkAndNotify)
        .subscribe();
    } catch (e) { /* notifications should never block the rest of the page */ }
  })();
})();
