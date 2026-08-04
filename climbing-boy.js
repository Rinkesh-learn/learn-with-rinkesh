// ===========================================================
// Learn With Rinkesh — homepage "climbing boy" animation
// Admin-controlled via climbing_boy_settings (enabled toggle +
// editable dialog messages). Character climbs from below the
// viewport, up through the hero text, pausing at a few waypoints
// with comic-style speech bubbles, lands on the "500+ formulas"
// sticker, delivers a motivational line, waves goodbye, fades out,
// then loops. Hovering it pauses the climb and shows a different
// pair of lines instead.
// ===========================================================
(function () {
  const STYLE = `
    #climbBoyWrap {
      position: fixed;
      left: 0; top: 0;
      width: 46px;
      z-index: 400;
      pointer-events: none;
      transition: left 1.1s cubic-bezier(.4,0,.2,1), top 1.1s cubic-bezier(.4,0,.2,1);
    }
    #climbBoyFigure {
      font-size: 30px;
      line-height: 1;
      pointer-events: auto;
      cursor: pointer;
      display: inline-block;
      transition: transform 0.2s ease;
    }
    #climbBoyFigure.climbing { animation: climbBoyWiggle 0.5s ease-in-out infinite alternate; }
    #climbBoyFigure.waving { animation: climbBoyWave 0.4s ease-in-out 3; }
    @keyframes climbBoyWiggle { from { transform: rotate(-6deg); } to { transform: rotate(6deg); } }
    @keyframes climbBoyWave { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(18deg); } }
    #climbBoyBubble {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%) scale(0.85);
      background: #fff;
      border: 2px solid var(--excel-green, #1E7A4C);
      border-radius: 14px;
      padding: 7px 12px;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: var(--ink, #1C2321);
      max-width: 220px;
      white-space: normal;
      text-align: center;
      opacity: 0;
      transition: opacity 0.25s ease, transform 0.25s ease;
      box-shadow: 0 6px 16px rgba(28,35,33,0.15);
    }
    #climbBoyBubble.show { opacity: 1; transform: translateX(-50%) scale(1); }
    #climbBoyBubble:after {
      content: '';
      position: absolute; top: 100%; left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: var(--excel-green, #1E7A4C);
    }
    @media (max-width: 720px) { #climbBoyWrap { display: none; } }
  `;

  function injectStyle() {
    const s = document.createElement('style');
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function buildDom() {
    const wrap = document.createElement('div');
    wrap.id = 'climbBoyWrap';
    wrap.innerHTML = `
      <div style="position:relative;">
        <div id="climbBoyBubble"></div>
        <div id="climbBoyFigure" class="climbing">🧗</div>
      </div>
    `;
    document.body.appendChild(wrap);
    return wrap;
  }

  function say(text, cb) {
    const bubble = document.getElementById('climbBoyBubble');
    bubble.textContent = text;
    bubble.classList.add('show');
    if (cb) setTimeout(cb, 2200);
  }
  function hideBubble() {
    document.getElementById('climbBoyBubble').classList.remove('show');
  }

  function moveTo(x, y) {
    const wrap = document.getElementById('climbBoyWrap');
    wrap.style.left = x + 'px';
    wrap.style.top = y + 'px';
  }

  async function loadSettings() {
    try {
      const { data } = await supabaseClient.from('climbing_boy_settings').select('*').eq('id', 1).maybeSingle();
      return data;
    } catch (e) {
      return null;
    }
  }

  let paused = false;
  let loopTimer = null;

  function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

  async function runCycle(settings) {
    if (paused) { loopTimer = setTimeout(() => runCycle(settings), 400); return; }

    const figure = document.getElementById('climbBoyFigure');
    figure.classList.add('climbing');
    figure.classList.remove('waving');

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const messages = (settings && settings.climb_messages && settings.climb_messages.length)
      ? settings.climb_messages
      : ["I stepped all these steps on the way to success and I won.", "You can also win — start your first step!"];

    // Start below the visible area on the right, so the entrance is noticed.
    moveTo(vw - 90, vh + 20);
    await sleep(300);
    moveTo(vw - 140, vh - 160);
    await sleep(1200);

    // Climb through a couple of hero waypoints, showing lines one at a time.
    const waypoints = [
      { x: vw * 0.62, y: vh * 0.55 },
      { x: vw * 0.4, y: vh * 0.35 }
    ];
    for (let i = 0; i < waypoints.length && i < messages.length; i++) {
      if (paused) break;
      moveTo(waypoints[i].x, waypoints[i].y);
      await sleep(1150);
      await new Promise(res => say(messages[i], res));
      hideBubble();
      await sleep(250);
    }

    // Land on the "500+ formulas" sticker if it exists, else a fallback spot.
    const sticker = document.getElementById('sticker1');
    let landX = vw * 0.2, landY = vh * 0.18;
    if (sticker) {
      const rect = sticker.getBoundingClientRect();
      landX = rect.left + rect.width / 2 - 20;
      landY = rect.top - 46;
    }
    moveTo(landX, landY);
    await sleep(1150);

    const lastMessage = messages[messages.length - 1] || "You made it — your turn now!";
    await new Promise(res => say(lastMessage, res));
    hideBubble();
    await sleep(200);

    // Wave goodbye, comic-style pop, then disappear.
    figure.classList.remove('climbing');
    figure.classList.add('waving');
    await new Promise(res => say((settings && settings.goodbye_message) || 'Bye bye! 👋', res));
    figure.style.opacity = '0';
    figure.style.transform = 'scale(0.5)';
    await sleep(500);
    hideBubble();
    figure.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

    await sleep(1800);
    figure.style.opacity = '1';
    figure.style.transform = 'scale(1)';

    loopTimer = setTimeout(() => runCycle(settings), 400);
  }

  async function init() {
    if (typeof supabaseClient === 'undefined') return;
    const settings = await loadSettings();
    if (settings && settings.enabled === false) return; // admin turned it off

    injectStyle();
    buildDom();

    const figure = document.getElementById('climbBoyFigure');
    let hoverTimer = null;
    figure.addEventListener('mouseenter', () => {
      paused = true;
      figure.classList.remove('climbing');
      const m1 = (settings && settings.hover_message_1) || "Don't disturb me!";
      const m2 = (settings && settings.hover_message_2) || "I'm on my way to success.";
      say(m1);
      hoverTimer = setTimeout(() => say(m2), 1400);
    });
    figure.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
      hideBubble();
      paused = false;
      figure.classList.add('climbing');
    });

    runCycle(settings);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
