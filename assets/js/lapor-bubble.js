// =========================================
// Floating Bubble + Marquee Lapor Bot
// File: assets/js/lapor-bubble.js
// v4 - Marquee "Yuk Lapor" di samping bubble (bottom-right)
// =========================================
(function(){
  'use strict';
  
  // Smart path detection
  const LAPOR_BOT_URL = location.pathname.includes('/pages/') 
    ? '../lapor-bot.html' 
    : 'lapor-bot.html';
  
  // =========================================
  // INJECT CSS
  // =========================================
  function injectCSS() {
    if (document.getElementById('lapor-bubble-css')) return;
    
    const css = `
      /* Container floating: bubble + marquee */
      #lapor-float-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      /* Marquee strip "Yuk Lapor" */
      .lapor-marquee-strip {
        background: linear-gradient(90deg, #fbbf24, #f59e0b);
        border-radius: 22px;
        padding: 8px 14px;
        max-width: 120px;
        overflow: hidden;
        box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
        text-decoration: none;
        cursor: pointer;
        position: relative;
        transition: all 0.25s ease;
        border: 2px solid rgba(255,255,255,0.5);
        animation: floatGentle 3s ease-in-out infinite;
      }
      .lapor-marquee-strip:hover {
        transform: scale(1.08);
        background: linear-gradient(90deg, #f59e0b, #ef4444);
        box-shadow: 0 6px 18px rgba(239, 68, 68, 0.5);
      }
      .lapor-marquee-strip .marquee-inner {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        font-size: 0.82rem;
        font-weight: 700;
        color: #1e3a8a;
        letter-spacing: 0.3px;
      }
      .lapor-marquee-strip .marquee-track {
        display: inline-block;
        animation: laporMarquee 10s linear infinite;
        padding-left: 100%;
      }
      .lapor-marquee-strip:hover .marquee-track {
        animation-play-state: paused;
      }
      .lapor-marquee-strip:hover .marquee-inner {
        color: #fff;
      }
      
      /* Arrow pointer ke bubble */
      .lapor-marquee-strip::after {
        content: '';
        position: absolute;
        right: -7px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-top: 7px solid transparent;
        border-bottom: 7px solid transparent;
        border-left: 7px solid #f59e0b;
      }
      .lapor-marquee-strip:hover::after {
        border-left-color: #ef4444;
      }
      
      @keyframes laporMarquee {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-100%); }
      }
      @keyframes floatGentle {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-3px); }
      }
      
      /* Floating Bubble */
      #lapor-bubble-btn {
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
        flex-shrink: 0;
      }
      #lapor-bubble-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.5);
        color: #fff;
      }
      @keyframes laporPulse {
        0%, 100% { box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4); }
        50% { box-shadow: 0 6px 20px rgba(239, 68, 68, 0.7), 0 0 0 12px rgba(239, 68, 68, 0.1); }
      }
      
      /* Mobile responsive */
      @media (max-width: 600px) {
        #lapor-float-container {
          bottom: 18px;
          right: 18px;
          gap: 8px;
        }
        #lapor-bubble-btn {
          width: 56px;
          height: 56px;
          font-size: 1.6rem;
        }
        .lapor-marquee-strip {
          max-width: 130px;
          padding: 6px 10px;
        }
        .lapor-marquee-strip .marquee-inner {
          font-size: 0.72rem;
        }
      }
      @media (max-width: 380px) {
        .lapor-marquee-strip {
          max-width: 110px;
        }
      }
    `;
    
    const style = document.createElement('style');
    style.id = 'lapor-bubble-css';
    style.textContent = css;
    document.head.appendChild(style);
  }
  
  // =========================================
  // INJECT FLOATING CONTAINER (bubble + marquee)
  // =========================================
  function injectFloatingUI() {
    if (!document.body) {
      setTimeout(injectFloatingUI, 100);
      return;
    }
    if (document.getElementById('lapor-float-container')) return;
    
    // Container holds both marquee and bubble
    const container = document.createElement('div');
    container.id = 'lapor-float-container';
    
    // Marquee strip "Yuk Lapor"
    const marquee = document.createElement('a');
    marquee.href = LAPOR_BOT_URL;
    marquee.target = '_self';
    marquee.className = 'lapor-marquee-strip';
    marquee.title = 'Klik untuk Lapor Sarpras';
    marquee.innerHTML = '<span class="marquee-inner"><span class="marquee-track"> · 📣 Yuk Lapor Sekarang · </span></span>';
    
    // Bubble
    const btn = document.createElement('a');
    btn.id = 'lapor-bubble-btn';
    btn.href = LAPOR_BOT_URL;
    btn.target = '_self';
    btn.title = 'Lapor Kerusakan';
    btn.innerHTML = '🔧';
    
    container.appendChild(marquee);
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
  
  window.addEventListener('load', function(){
    if (!document.getElementById('lapor-float-container')) injectFloatingUI();
  });
})();
