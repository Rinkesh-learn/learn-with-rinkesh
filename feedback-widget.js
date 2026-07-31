// =========================================================
// Learn With Rinkesh — Feedback widget
// Included on every page via <script src="feedback-widget.js">
// (must load AFTER supabase-config.js since it uses supabaseClient)
//
// Behavior:
// - A floating "💬 Feedback" button appears bottom-right on every page,
//   click it anytime to open the feedback form.
// - Not logged in: the form also auto-opens once after 2 minutes on
//   site, once per browser session (resets when the tab/browser closes).
// - Logged in: the form auto-opens once after 2 minutes, but only if
//   this user has never submitted feedback before (checked against
//   the database, so it's the same across devices).
// =========================================================

(function () {
  const AUTO_TRIGGER_DELAY_MS = 2 * 60 * 1000; // 2 minutes
  const SESSION_KEY = 'lwr_feedback_shown_this_visit';

  // ---------- Inject markup ----------
  const btn = document.createElement('button');
  btn.id = 'feedbackFloatBtn';
  btn.innerHTML = '💬 <span>Feedback</span>';
  document.body.appendChild(btn);

  const overlay = document.createElement('div');
  overlay.id = 'feedbackOverlay';
  overlay.className = 'fb-overlay';
  overlay.innerHTML = `
    <div class="fb-box">
      <button class="fb-close" id="fbCloseBtn" aria-label="Close">&times;</button>
      <div id="fbFormView">
        <h3>How's it going so far?</h3>
        <p class="fb-hint">Your feedback directly shapes what gets built next.</p>

        <div class="fb-stars" id="fbStars">
          <span data-star="1">★</span><span data-star="2">★</span><span data-star="3">★</span><span data-star="4">★</span><span data-star="5">★</span>
        </div>

        <label id="fbNameLabel">Name (optional)</label>
        <input type="text" id="fbName" placeholder="Your name">

        <label>What could be better, or anything you'd like to share</label>
        <textarea id="fbMessage" rows="4" placeholder="Tell us what you think..."></textarea>

        <button class="btn btn-primary" id="fbSubmitBtn" style="width:100%; margin-top:14px;">Send Feedback</button>
      </div>
      <div id="fbSuccessView" style="display:none; text-align:center;">
        <div style="font-size:40px; margin-bottom:8px;">🎉</div>
        <h3>Thank you!</h3>
        <p class="fb-hint">That really helps shape what gets built next.</p>
        <button class="btn btn-primary" id="fbDoneBtn" style="width:100%; margin-top:10px;">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  let selectedRating = 0;

  function renderStars() {
    document.querySelectorAll('#fbStars span').forEach(s => {
      s.classList.toggle('filled', parseInt(s.dataset.star, 10) <= selectedRating);
    });
  }

  document.querySelectorAll('#fbStars span').forEach(s => {
    s.addEventListener('click', () => {
      selectedRating = parseInt(s.dataset.star, 10);
      renderStars();
    });
  });

  function openFeedback() {
    document.getElementById('fbFormView').style.display = 'block';
    document.getElementById('fbSuccessView').style.display = 'none';
    overlay.classList.add('open');
  }

  function closeFeedback() {
    overlay.classList.remove('open');
  }

  btn.addEventListener('click', openFeedback);
  document.getElementById('fbCloseBtn').addEventListener('click', closeFeedback);
  document.getElementById('fbDoneBtn').addEventListener('click', closeFeedback);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeFeedback(); });

  document.getElementById('fbSubmitBtn').addEventListener('click', async () => {
    if (selectedRating === 0) {
      alert('Please pick a star rating first.');
      return;
    }

    const name = document.getElementById('fbName').value.trim();
    const message = document.getElementById('fbMessage').value.trim();

    let userId = null;
    let email = null;
    let finalName = name || null;

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        userId = session.user.id;
        email = session.user.email;
        if (!finalName) {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('name')
            .eq('id', userId)
            .maybeSingle();
          if (profile && profile.name) finalName = profile.name;
        }
      }
    } catch (e) { /* not logged in, proceed as anonymous */ }

    try {
      await supabaseClient.from('feedback').insert({
        user_id: userId,
        name: finalName,
        email: email,
        rating: selectedRating,
        message: message || null,
        page_url: window.location.pathname
      });
    } catch (e) {
      console.error('Feedback submit failed', e);
    }

    document.getElementById('fbFormView').style.display = 'none';
    document.getElementById('fbSuccessView').style.display = 'block';
    selectedRating = 0;
    renderStars();
    document.getElementById('fbName').value = '';
    document.getElementById('fbMessage').value = '';
  });

  // ---------- Auto-trigger after 2 minutes ----------
  async function maybeAutoTrigger() {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();

      if (session) {
        // Logged-in users: only ever ask once, checked against the database
        const { data: existing } = await supabaseClient
          .from('feedback')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1);
        if (existing && existing.length > 0) return; // already given feedback before
      } else {
        // Anonymous users: once per browser session (tab)
        if (sessionStorage.getItem(SESSION_KEY)) return;
      }

      setTimeout(() => {
        if (!overlay.classList.contains('open')) {
          openFeedback();
        }
        if (!session) sessionStorage.setItem(SESSION_KEY, '1');
      }, AUTO_TRIGGER_DELAY_MS);
    } catch (e) {
      // If anything fails (e.g. offline), fall back to session-based timing only
      if (!sessionStorage.getItem(SESSION_KEY)) {
        setTimeout(() => {
          if (!overlay.classList.contains('open')) openFeedback();
          sessionStorage.setItem(SESSION_KEY, '1');
        }, AUTO_TRIGGER_DELAY_MS);
      }
    }
  }

  maybeAutoTrigger();
})();
