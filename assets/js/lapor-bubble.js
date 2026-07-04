// =========================================
// Floating Bubble + Marquee Lapor Bot
// File: assets/js/lapor-bubble.js
// v5 - Style disamakan dengan dashboard (logo GKPI + badge BOT)
// =========================================
(function () {
  'use strict';

  // Guard: prevent double-inject
  if (window.__LAPOR_BUBBLE_INJECTED__) return;
  window.__LAPOR_BUBBLE_INJECTED__ = true;

  // Guard: skip halaman bot itu sendiri
  const currentFile = (location.pathname.split('/').pop() || '').toLowerCase();
  if (currentFile === 'lapor-bot.html' || currentFile === 'qr-lapor.html') return;

  // Smart path detection (root vs pages/)
  const inSubfolder = location.pathname.toLowerCase().includes('/pages/');
  const PREFIX = inSubfolder ? '../' : '';
  const LAPOR_BOT_URL = PREFIX + 'lapor-bot.html';
  const LOGO_URL = PREFIX + 'assets/logo_gkpi.png';

  // =========================================
  // INJECT CSS
  // =========================================
  function injectCSS() {
    if (document.getElementById('lapor-bubble-css')) return;

    const css = `
      /* Container floating: bubble + tooltip */
      #lapor-float-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      /* Tooltip "Yuk Lapor!" (kuning, sederhana - match dashboard) */
      #lapor-bot-tooltip {
        background: #fbbf24;
        color: #1e293b;
        padding: 8px 14px;
        border-radius: 10px;
        font-size: 0.85rem;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        text-decoration: none;
        white-space: nowrap;
        animation: laporBobble 2s ease-in-out infinite;
        transition: opacity 0.5s ease, transform 0.2s ease;
        position: relative;
      }
      #lapor-bot-tooltip:hover {
        transform: scale(1.05);
        color: #1e293b;
      }
      #lapor-bot-tooltip .lb-close {
        margin-left: 8px;
        opacity: 0.55;
        cursor: pointer;
        font-weight: 700;
        font-size: 0.95rem;
      }
      #lapor-bot-tooltip .lb-close:hover { opacity: 1; }

      @keyframes laporBobble {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-4px); }
      }

      /* Floating Bubble (biru gradient + logo GKPI + border kuning) */
      #lapor-bubble-btn {
        position: relative;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, #1e3a8a, #2563eb);
        box-shadow: 0 6px 20px rgba(30, 58, 138, 0.45);
        border: 3px solid #fbbf24;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        text-decoration: none;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
        flex-shrink: 0;
      }
      #lapor-bubble-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 8px 25px rgba(30, 58, 138, 0.6);
      }
      #lapor-bubble-btn:active {
        transform: scale(0.95);
      }
      #lapor-bubble-btn img {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #fff;
        padding: 2px;
        display: block;
      }
      /* Fallback emoji kalau logo gagal load */
      #lapor-bubble-btn .lb-fallback {
        font-size: 28px;
        color: #fff;
        display: none;
      }

      /* Badge "BOT" merah di kanan-atas */
      #lapor-bubble-btn .lb-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        background: #ef4444;
        color: #fff;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 3px 7px;
        border-radius: 10px;
        border: 2px solid #fff;
        line-height: 1;
        letter-spacing: 0.3px;
      }

      /* Sembunyikan saat print */
      @media print {
        #lapor-float-container { display: none !important; }
      }

      /* Sembunyikan saat modal aktif */
      body.modal-open #lapor-float-container,
      .lm-modal.show ~ #lapor-float-container {
        display: none !important;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        #lapor-bot-tooltip { display: none; }
        #lapor-float-container {
          bottom: 18px;
          right: 18px;
        }
        #lapor-bubble-btn {
          width: 58px;
          height: 58px;
        }
        #lapor-bubble-btn img {
          width: 34px;
          height: 34px;
        }
      }

      /* Respect reduced motion */
      @media (prefers-reduced-motion: reduce) {
        #lapor-bot-tooltip { animation: none !important; }
      }
    `;

    const style = document.createElement('style');
    style.id = 'lapor-bubble-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // =========================================
  // INJECT FLOATING CONTAINER (tooltip + bubble)
  // =========================================
  function injectFloatingUI() {
    if (!document.body) {
      setTimeout(injectFloatingUI, 100);
      return;
    }
    if (document.getElementById('lapor-float-container')) return;

    // Container
    const container = document.createElement('div');
    container.id = 'lapor-float-container';

    // Tooltip "💬 Yuk Lapor!" (match dashboard style)
    const tipDismissed = localStorage.getItem('laporBubbleTipDismissed');
    if (!tipDismissed) {
      const tip = document.createElement('a');
      tip.id = 'lapor-bot-tooltip';
      tip.href = LAPOR_BOT_URL;
      tip.setAttribute('aria-label', 'Lapor kerusakan sarana prasarana');
      tip.innerHTML =
        '💬 Yuk Lapor!' +
        '<span class="lb-close" title="Sembunyikan" ' +
        'onclick="event.preventDefault(); event.stopPropagation(); ' +
        'localStorage.setItem(\'laporBubbleTipDismissed\',\'1\'); ' +
        'this.parentNode.remove();">×</span>';
      container.appendChild(tip);
    }

    // Bubble (logo GKPI + badge BOT)
    const btn = document.createElement('a');
    btn.id = 'lapor-bubble-btn';
    btn.href = LAPOR_BOT_URL;
    btn.title = 'Lapor Sarpras via Chat Bot';
    btn.setAttribute('aria-label', 'Buka form lapor kerusakan');
    btn.innerHTML =
      '<img src="' + LOGO_URL + '" alt="Lapor Bot" ' +
      'onerror="this.style.display=\'none\'; ' +
      'this.nextElementSibling.style.display=\'inline\';" />' +
      '<span class="lb-fallback">💬</span>' +
      '<span class="lb-badge">BOT</span>';

    container.appendChild(btn);
    document.body.appendChild(container);

    console.log('✅ Lapor floating UI loaded: ' + LAPOR_BOT_URL);
  }

  // =========================================
  // INIT
  // =========================================
  function initAll() {
    injectCSS();
    injectFloatingUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Safety net
  window.addEventListener('load', function () {
    if (!document.getElementById('lapor-float-container')) injectFloatingUI();
  });
})();
