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
})();
