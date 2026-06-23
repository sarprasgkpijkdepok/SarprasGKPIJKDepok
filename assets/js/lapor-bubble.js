// =========================================
// Floating Bubble Shortcut ke Lapor Bot
// File: assets/js/lapor-bubble.js
// v2 - Fix DOM not ready issue
// =========================================
(function(){
  'use strict';
  
  // Smart path detection
  const LAPOR_BOT_URL = location.pathname.includes('/pages/') 
    ? '../lapor-bot.html' 
    : 'lapor-bot.html';
  
  function injectBubble() {
    // Safety check: pastikan body sudah ada
    if (!document.body) {
      console.warn('Lapor bubble: body not ready, retrying...');
      setTimeout(injectBubble, 100);
      return;
    }
    
    // Cek kalau bubble sudah ada (prevent duplicate)
    if (document.getElementById('lapor-bubble-btn')) {
      console.log('Lapor bubble already exists');
      return;
    }
    
    // Inject CSS
    const css = `
      #lapor-bubble-btn {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ef4444, #f97316);
        color: #fff;
        border: none;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
        transition: all 0.2s;
        animation: laporPulse 2.5s ease-in-out infinite;
        text-decoration: none;
      }
      #lapor-bubble-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.5);
        color: #fff;
      }
      #lapor-bubble-btn .lapor-label {
        position: absolute;
        right: 75px;
        top: 50%;
        transform: translateY(-50%);
        background: #1f2937;
        color: #fff;
        padding: 8px 14px;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
      }
      #lapor-bubble-btn:hover .lapor-label {
        opacity: 1;
      }
      @keyframes laporPulse {
        0%, 100% { box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4); }
        50% { box-shadow: 0 6px 20px rgba(239, 68, 68, 0.7), 0 0 0 12px rgba(239, 68, 68, 0.1); }
      }
      @media (max-width: 600px) {
        #lapor-bubble-btn {
          bottom: 18px;
          right: 18px;
          width: 56px;
          height: 56px;
          font-size: 1.6rem;
        }
        #lapor-bubble-btn .lapor-label {
          display: none;
        }
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    
    // Inject button
    const btn = document.createElement('a');
    btn.id = 'lapor-bubble-btn';
    btn.href = LAPOR_BOT_URL;
    btn.target = '_self';
    btn.title = 'Lapor Kerusakan';
    btn.innerHTML = '🔧<span class="lapor-label">Lapor Kerusakan</span>';
    document.body.appendChild(btn);
    
    console.log('✅ Lapor bubble loaded: ' + LAPOR_BOT_URL);
  }
  
  // Multiple init strategies untuk handle berbagai kondisi load
  if (document.readyState === 'loading') {
    // Document masih loading, tunggu DOMContentLoaded
    document.addEventListener('DOMContentLoaded', injectBubble);
  } else {
    // Document sudah ready, inject langsung
    injectBubble();
  }
  
  // Fallback: pastikan ke-inject meski ada error lain
  window.addEventListener('load', function(){
    if (!document.getElementById('lapor-bubble-btn')) {
      console.warn('Lapor bubble: not found after load, retrying...');
      injectBubble();
    }
  });
})();