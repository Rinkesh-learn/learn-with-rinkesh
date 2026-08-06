// Learn With Rinkesh — shared video popup. Include with one <script> tag
// on any page; injects its own styles, no separate CSS file needed.
// Usage: openVideoPopup(videoUrl, titleText)

(function () {
  const style = document.createElement('style');
  style.textContent = `
    .vp-overlay {
      display: none; position: fixed; inset: 0; background: rgba(28,35,33,0.65);
      z-index: 10000; align-items: center; justify-content: center; padding: 24px;
    }
    .vp-overlay.open { display: flex; }
    .vp-box {
      background: #fff; border-radius: 10px; width: 100%; max-width: 720px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.35); overflow: hidden;
      animation: vpIn 0.2s ease;
    }
    @keyframes vpIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    .vp-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 14px; background: #1C4732; color: #fff;
    }
    .vp-title { font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 700;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 10px; }
    .vp-close {
      background: none; border: none; color: #fff; font-size: 20px; line-height: 1;
      cursor: pointer; padding: 4px 8px; border-radius: 4px; flex-shrink: 0;
    }
    .vp-close:hover { background: rgba(255,255,255,0.15); }
    .vp-video-wrap { position: relative; width: 100%; padding-top: 56.25%; background: #000; }
    .vp-video-wrap iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
    .vp-footer { padding: 10px 14px; text-align: right; background: #FAF8F1; }
    .vp-yt-link {
      font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 700;
      color: #C9971E; text-decoration: none;
    }
    .vp-yt-link:hover { text-decoration: underline; }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.className = 'vp-overlay';
  overlay.id = 'vpOverlay';
  overlay.innerHTML = `
    <div class="vp-box">
      <div class="vp-header">
        <span class="vp-title" id="vpTitle"></span>
        <button class="vp-close" id="vpCloseBtn" title="Close">&times;</button>
      </div>
      <div class="vp-video-wrap" id="vpVideoWrap"></div>
      <div class="vp-footer">
        <a href="#" id="vpYtLink" class="vp-yt-link" target="_blank" rel="noopener">Watch &amp; Like on YouTube &#8599;</a>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  function extractYouTubeId(url) {
    if (!url) return null;
    const patterns = [
      /youtu\.be\/([^?&]+)/,
      /youtube\.com\/watch\?v=([^?&]+)/,
      /youtube\.com\/embed\/([^?&]+)/,
      /youtube\.com\/shorts\/([^?&]+)/
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  window.openVideoPopup = function (videoUrl, titleText) {
    const videoId = extractYouTubeId(videoUrl);
    document.getElementById('vpTitle').textContent = titleText || 'Watch Tutorial';
    document.getElementById('vpYtLink').href = videoUrl;
    const wrap = document.getElementById('vpVideoWrap');
    if (videoId) {
      wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else {
      wrap.innerHTML = `<iframe src="${videoUrl}" allowfullscreen></iframe>`;
    }
    overlay.classList.add('open');
  };

  function closePopup() {
    overlay.classList.remove('open');
    document.getElementById('vpVideoWrap').innerHTML = ''; // stop playback
  }

  document.getElementById('vpCloseBtn').addEventListener('click', closePopup);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closePopup(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) closePopup(); });
})();
