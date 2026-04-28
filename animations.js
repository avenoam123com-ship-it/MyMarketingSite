/**
 * animations.js — Premium UI/UX Layer
 * AI Marketing Site · Fiverr Portfolio Version
 * ─────────────────────────────────────────────
 * Powered by Motion (Framer Motion vanilla)
 * CDN: https://cdn.jsdelivr.net/npm/motion@11/+esm
 */

import { animate, inView } from 'https://cdn.jsdelivr.net/npm/motion@11/+esm';
import { initLiquidShader }  from './webgl-liquid.js';

/* ═══════════════════════════════════════════════════════════════
   1. HOTEL PARALLAX — Subtle scene shift on mouse move
   ═══════════════════════════════════════════════════════════════ */
export function initHotelParallax() {
  const view  = document.getElementById('hotelView');
  const scene = document.getElementById('doorScene');
  if (!view || !scene) return;

  const gsap = window.gsap;
  if (!gsap) return;

  view.addEventListener('mousemove', e => {
    const rect = view.getBoundingClientRect();
    const mx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const my = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    gsap.to(scene, {
      x: mx * -18, y: my * -10,
      scale: 1.08,
      duration: 1.2, ease: 'power2.out', overwrite: 'auto'
    });
  });

  view.addEventListener('mouseleave', () => {
    gsap.to(scene, { x: 0, y: 0, scale: 1.05, duration: 1.4, ease: 'power2.inOut', overwrite: 'auto' });
  });
}


/* ═══════════════════════════════════════════════════════════════
   2. AUTHORITY FADE — Blur-to-Clear on scroll entry
   Creates the psychological effect of "things becoming clear"
   as the visitor encounters each piece of content.
   ═══════════════════════════════════════════════════════════════ */
export function initAuthorityFade() {
  // Headings and authority copy — blur reveals
  const headings = document.querySelectorAll(
    '.section-title, .section-eyebrow, .hero-headline, .hero-lede, ' +
    '.hero-eyebrow, .hero-badges, .promise-text, .contact-lede'
  );

  headings.forEach((el, i) => {
    // Remove AOS handling — we take over
    el.removeAttribute('data-aos');
    el.removeAttribute('data-aos-delay');
    el.style.opacity   = '0';
    el.style.filter    = 'blur(14px)';
    el.style.transform = 'translateY(22px)';
    el.style.willChange = 'opacity, filter, transform';

    inView(el, () => {
      animate(
        el,
        {
          opacity:   [0, 1],
          filter:    ['blur(14px)', 'blur(0px)'],
          transform: ['translateY(22px)', 'translateY(0px)']
        },
        {
          duration: 0.82,
          easing:   [0.16, 1, 0.3, 1],
          delay:    0.04 * (i % 4)   // stagger siblings naturally
        }
      );
      return false; // run once
    }, { margin: '-8% 0px -8% 0px' });
  });

  // Cards and body copy — softer fade (less blur, more opacity)
  const cards = document.querySelectorAll(
    '.truth-card, .rail-stage, .problem-point, .how-step'
  );

  cards.forEach(el => {
    el.removeAttribute('data-aos');
    el.removeAttribute('data-aos-delay');
    el.style.opacity    = '0';
    el.style.filter     = 'blur(6px)';
    el.style.transform  = 'translateY(16px)';
    el.style.willChange = 'opacity, filter, transform';

    inView(el, () => {
      animate(
        el,
        {
          opacity:   [0, 1],
          filter:    ['blur(6px)', 'blur(0px)'],
          transform: ['translateY(16px)', 'translateY(0px)']
        },
        { duration: 0.7, easing: [0.16, 1, 0.3, 1] }
      );
      return false;
    }, { margin: '-6% 0px -6% 0px' });
  });
}


/* ═══════════════════════════════════════════════════════════════
   3. SPRING STATS — Count-up with spring physics entrance
   stiffness: 100, damping: 10 → snappy overshoot, high-tech feel
   ═══════════════════════════════════════════════════════════════ */
export function initSpringStats() {
  document.querySelectorAll('.point-figure').forEach(el => {
    el.removeAttribute('data-aos');
    el.removeAttribute('data-aos-delay');
    el.style.opacity   = '0';
    el.style.transform = 'scale(0.65) translateY(12px)';
    el.style.willChange = 'opacity, transform';

    inView(el, () => {
      // Spring entrance — stiff + low damping = snappy overshoot
      animate(
        el,
        {
          opacity:   [0, 1],
          transform: ['scale(0.65) translateY(12px)', 'scale(1) translateY(0px)']
        },
        {
          duration: 0.75,
          easing:   [0.34, 1.56, 0.64, 1]  // spring approx: stiff 100, damping 10
        }
      );

      // Count-up for numeric values
      const raw = el.textContent.trim();
      const numMatch = raw.match(/(\d+)/);
      if (numMatch) {
        const targetNum = parseInt(numMatch[1]);
        const prefix    = raw.slice(0, raw.indexOf(numMatch[1]));
        const suffix    = raw.slice(raw.indexOf(numMatch[1]) + numMatch[1].length);
        runCountUp(el, targetNum, prefix, suffix);
      }

      return false;
    }, { margin: '-5% 0px -5% 0px' });
  });
}

function runCountUp(el, target, prefix, suffix) {
  const DURATION = 1100; // ms
  const start    = performance.now();

  function tick(now) {
    const elapsed  = now - start;
    const t        = Math.min(elapsed / DURATION, 1);
    // Ease-out cubic
    const eased    = 1 - Math.pow(1 - t, 3);
    const current  = Math.round(eased * target);
    el.textContent = prefix + current + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }

  // Short delay so spring entrance plays first
  setTimeout(() => requestAnimationFrame(tick), 120);
}


/* ═══════════════════════════════════════════════════════════════
   4. MOBILE FAB — Glassmorphism + Magnetic hover + Pulse glow
   ═══════════════════════════════════════════════════════════════ */
export function initMobileFAB() {
  const fab = document.getElementById('fabCta');
  if (!fab) return;

  const MAX_DRIFT = 12; // px — how far the button drifts magnetically

  // ── Desktop magnetic drift ──────────────────────────────────
  document.addEventListener('mousemove', e => {
    const rect = fab.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    const radius = 140; // px activation radius

    if (dist < radius) {
      const pull   = (1 - dist / radius); // 0 at edge, 1 at center
      const dx     = (e.clientX - cx) * pull * 0.35;
      const dy     = (e.clientY - cy) * pull * 0.35;
      animate(fab, { x: dx, y: dy }, { duration: 0.25, easing: 'ease-out' });
    } else {
      animate(fab, { x: 0, y: 0 }, { duration: 0.5, easing: 'ease-out' });
    }
  });

  // ── Touch: brief pull sensation on tap ──────────────────────
  fab.addEventListener('touchstart', e => {
    const t    = e.touches[0];
    const rect = fab.getBoundingClientRect();
    const dx   = (t.clientX - (rect.left + rect.width  / 2)) * 0.25;
    const dy   = (t.clientY - (rect.top  + rect.height / 2)) * 0.25;
    animate(fab, { scale: 0.92, x: dx, y: dy }, { duration: 0.12 });
  }, { passive: true });

  fab.addEventListener('touchend', () => {
    animate(
      fab,
      { scale: 1, x: 0, y: 0 },
      { duration: 0.55, easing: [0.34, 1.56, 0.64, 1] }
    );
  });

  // ── Desktop hover scale ──────────────────────────────────────
  fab.addEventListener('mouseenter', () => {
    animate(fab, { scale: 1.12 }, { duration: 0.2 });
    fab.classList.add('fab--hovered');
  });

  fab.addEventListener('mouseleave', () => {
    animate(fab, { scale: 1, x: 0, y: 0 }, {
      duration: 0.5,
      easing: [0.34, 1.56, 0.64, 1]
    });
    fab.classList.remove('fab--hovered');
  });
}


/* ═══════════════════════════════════════════════════════════════
   5. FOG DISSOLVE — Quiet Rooms entry transition
   The .fog-overlay starts blurred + opaque. As the section scrolls
   into view, fog "dissipates" — opacity 1→0, blur 28→0, scale 1→1.04
   ═══════════════════════════════════════════════════════════════ */
export function initFogDissolve() {
  const fog     = document.getElementById('fogOverlay');
  const section = document.getElementById('problem');
  if (!fog || !section) return;

  // Initial state — heavy fog
  Object.assign(fog.style, {
    opacity:        '1',
    transform:      'scale(1)',
    filter:         'blur(0px)',
    backdropFilter: 'blur(28px) saturate(140%)',
  });

  inView(section, () => {
    animate(
      fog,
      {
        opacity:   [1, 0],
        transform: ['scale(1)', 'scale(1.06)'],
      },
      {
        duration: 2.4,
        easing:   [0.16, 1, 0.3, 1],   // long, decelerating dissolve
      }
    );

    // Backdrop-filter animates separately (CSS transition on the property)
    fog.style.transition     = 'backdrop-filter 2.4s cubic-bezier(0.16,1,0.3,1)';
    fog.style.backdropFilter = 'blur(0px) saturate(100%)';
    fog.style.webkitBackdropFilter = 'blur(0px) saturate(100%)';

    // Remove fog from the DOM once dissolved (avoids paint cost)
    setTimeout(() => { fog.style.display = 'none'; }, 2600);

    return false; // run once
  }, { margin: '-15% 0px -15% 0px' });
}


/* ═══════════════════════════════════════════════════════════════
   6. MAGNETIC CTA — Attract pointer toward [data-magnetic] buttons
   Spring-eased drift on hover, snap-back on leave
   ═══════════════════════════════════════════════════════════════ */
export function initMagneticCTA() {
  const targets = document.querySelectorAll('[data-magnetic]');
  if (!targets.length) return;

  const RADIUS    = 110;   // activation distance (px)
  const STRENGTH  = 0.32;  // how strongly the button is pulled (0–1)

  targets.forEach(el => {
    el.style.willChange = 'transform';
    el.style.display    = el.style.display || 'inline-block';

    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = e.clientX - cx;
      const dy   = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < RADIUS) {
        const pull = 1 - dist / RADIUS;
        animate(
          el,
          { x: dx * STRENGTH * pull, y: dy * STRENGTH * pull, scale: 1 + 0.04 * pull },
          { duration: 0.22, easing: 'ease-out' }
        );
      }
    });

    el.addEventListener('mouseleave', () => {
      // Spring snap-back — useSpring approximation
      animate(
        el,
        { x: 0, y: 0, scale: 1 },
        { duration: 0.55, easing: [0.34, 1.56, 0.64, 1] }
      );
    });
  });
}


/* ═══════════════════════════════════════════════════════════════
   7. HARD TRUTH REVEAL — Gold line sweep + staggered indictment
   Each row: line draws → number stamps → headline blurs clear → body fades
   ═══════════════════════════════════════════════════════════════ */
export function initHardTruthReveal() {
  document.querySelectorAll('.indictment-row').forEach(row => {
    const line     = row.querySelector('.row-line');
    const num      = row.querySelector('.row-num');
    const headline = row.querySelector('.row-headline');
    const body     = row.querySelector('.row-body');

    inView(row, () => {
      // 1. Gold line draws left → right
      if (line) animate(
        line,
        { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] },
        { duration: 1.1, easing: [0.16, 1, 0.3, 1] }
      );

      // 2. Number stamps in
      if (num) animate(
        num,
        { opacity: [0, 1], transform: ['translateY(5px)', 'translateY(0px)'] },
        { duration: 0.5, delay: 0.18, easing: [0.16, 1, 0.3, 1] }
      );

      // 3. Headline blurs to clarity
      if (headline) animate(
        headline,
        {
          opacity:   [0, 1],
          filter:    ['blur(10px)', 'blur(0px)'],
          transform: ['translateY(6px)', 'translateY(0px)']
        },
        { duration: 0.95, delay: 0.28, easing: [0.16, 1, 0.3, 1] }
      );

      // 4. Body fades up
      if (body) animate(
        body,
        { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] },
        { duration: 0.7, delay: 0.5, easing: [0.16, 1, 0.3, 1] }
      );

      return false; // run once
    }, { margin: '-6% 0px -6% 0px' });
  });
}


/* ═══════════════════════════════════════════════════════════════
   8. HOTEL TILT — Mouse-driven 3D perspective on the hotel card
   Float animation stays on .hotel-float-wrapper (CSS keyframe).
   Tilt is applied to .hotel-card via inline transform so they don't fight.
   ═══════════════════════════════════════════════════════════════ */
export function initHotelTilt() {
  const card  = document.getElementById('hotelCard');
  const stage = card?.closest('.hotel-stage');
  if (!card || !stage) return;

  const BASE_X =  4;  // resting rotateX (deg)
  const BASE_Y = -8;  // resting rotateY (deg)
  const MAX    =  9;  // max additional tilt (deg)

  stage.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const rx   = BASE_X + ((e.clientY - cy) / (rect.height / 2)) * -MAX * 0.5;
    const ry   = BASE_Y + ((e.clientX - cx) / (rect.width  / 2)) *  MAX * 0.7;
    card.style.transform  = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    card.style.transition = 'transform 0.12s ease-out';
  });

  stage.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1)';
  });
}


/* ═══════════════════════════════════════════════════════════════
   9. WINDOW OPEN — Shutters swing open on scroll-into-view,
   revealing the warm apartment interior behind.
   ═══════════════════════════════════════════════════════════════ */
export function initWindowOpen() {
  const doorL = document.getElementById('doorL');
  const doorR = document.getElementById('doorR');
  if (!doorL || !doorR) return;

  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.set(doorL, { transformPerspective: 1000, transformOrigin: 'left center',  rotateY: 0 });
  gsap.set(doorR, { transformPerspective: 1000, transformOrigin: 'right center', rotateY: 0 });

  ScrollTrigger.create({
    trigger: document.getElementById('aptWindow'),
    start: 'top 80%',
    once: true,
    onEnter() {
      gsap.to(doorL, { rotateY: -118, duration: 2.2, ease: 'power3.inOut', delay: 0.15 });
      gsap.to(doorR, { rotateY:  118, duration: 2.2, ease: 'power3.inOut', delay: 0.30 });
    }
  });
}


/* ═══════════════════════════════════════════════════════════════
   10. MARKETING GLOBE — Rotating wireframe globe with orbiting
   satellite, pulsing nodes, and data-arc connections.
   Communicates "global digital marketing" in the hero.
   ═══════════════════════════════════════════════════════════════ */
export function initMarketingGlobe() {
  const canvas = document.getElementById('orbitCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  let W, H, CX, CY, GR, OR; // globe radius, orbit radius

  function resize() {
    const size = window.innerWidth <= 768 ? 240 : 360;
    W = H = size;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    CX = W / 2; CY = H / 2;
    GR = W * 0.33;   // globe radius
    OR = W * 0.455;  // outer orbit radius
  }

  resize();
  window.addEventListener('resize', resize);

  const g  = a => `rgba(197,160,89,${a})`;
  const gb = a => `rgba(229,192,120,${a})`;

  // Fixed nodes on globe surface (lat / lon in radians)
  const nodes = [
    { lat: 0.30, lon: 0.50 }, { lat: -0.40, lon: 2.10 },
    { lat: 0.60, lon: 4.00 }, { lat: -0.20, lon: 1.20 },
    { lat: 0.10, lon: 3.30 }, { lat: -0.50, lon: 5.50 },
    { lat: 0.45, lon: 0.10 }, { lat: -0.10, lon: 2.80 },
  ];

  // Pairs to draw arcs between
  const arcs = [[0,3],[1,4],[2,5],[3,6],[0,7],[4,6]];

  let rotation   = 0;
  let orbitAngle = 0;
  let tick       = 0;

  function project(lat, lon) {
    const x3 = Math.cos(lat) * Math.sin(lon + rotation);
    const y3 = Math.sin(lat);
    const z3 = Math.cos(lat) * Math.cos(lon + rotation);
    return { x: CX + x3 * GR, y: CY - y3 * GR, z: z3, visible: z3 > -0.05 };
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    // — Atmosphere halo —
    const atm = ctx.createRadialGradient(CX, CY, GR * 0.88, CX, CY, GR * 1.18);
    atm.addColorStop(0, g(0));
    atm.addColorStop(0.5, g(0.07));
    atm.addColorStop(1, g(0));
    ctx.beginPath(); ctx.arc(CX, CY, GR * 1.18, 0, Math.PI * 2);
    ctx.fillStyle = atm; ctx.fill();

    // — Globe sphere —
    const sphere = ctx.createRadialGradient(
      CX - GR * 0.25, CY - GR * 0.25, 0, CX, CY, GR);
    sphere.addColorStop(0, 'rgba(38,28,14,0.85)');
    sphere.addColorStop(0.6, 'rgba(12,9,5,0.95)');
    sphere.addColorStop(1, 'rgba(4,3,2,0.98)');
    ctx.beginPath(); ctx.arc(CX, CY, GR, 0, Math.PI * 2);
    ctx.fillStyle = sphere; ctx.fill();

    // — Grid lines (clipped to sphere) —
    ctx.save();
    ctx.beginPath(); ctx.arc(CX, CY, GR - 0.5, 0, Math.PI * 2); ctx.clip();

    // Latitude bands
    for (let i = 1; i <= 6; i++) {
      const lat = (i / 7 - 0.5) * Math.PI;
      const y  = CY - Math.sin(lat) * GR;
      const rx = Math.cos(lat) * GR;
      ctx.beginPath();
      ctx.ellipse(CX, y, rx, rx * 0.24, 0, 0, Math.PI * 2);
      ctx.strokeStyle = g(i === 4 ? 0.16 : 0.06);
      ctx.lineWidth   = i === 4 ? 0.8 : 0.45;
      ctx.stroke();
    }

    // Rotating meridians
    for (let i = 0; i < 9; i++) {
      const lon  = (i / 9) * Math.PI * 2 + rotation;
      const rx   = Math.max(1, Math.abs(Math.cos(lon)) * GR);
      const front = Math.cos(lon) > 0;
      ctx.beginPath();
      ctx.ellipse(CX, CY, rx, GR, 0, 0, Math.PI * 2);
      ctx.strokeStyle = g(front ? 0.09 : 0.025);
      ctx.lineWidth   = 0.45;
      ctx.stroke();
    }
    ctx.restore();

    // — Globe rim —
    ctx.beginPath(); ctx.arc(CX, CY, GR, 0, Math.PI * 2);
    ctx.strokeStyle = g(0.35); ctx.lineWidth = 1; ctx.stroke();

    // — Project nodes —
    const proj = nodes.map(n => project(n.lat, n.lon));

    // — Connection arcs + particles —
    arcs.forEach(([ai, bi]) => {
      const a = proj[ai], b = proj[bi];
      if (!a.visible || !b.visible) return;
      const alpha = Math.min(a.z, b.z) * 0.45;
      if (alpha <= 0) return;

      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * 0.28;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(mx, my, b.x, b.y);
      ctx.strokeStyle = g(alpha * 0.9);
      ctx.lineWidth   = 0.7;
      ctx.stroke();

      // Animated particle along arc
      const t  = ((tick * 0.003) + ai * 0.41) % 1;
      const px = (1 - t) * (1 - t) * a.x + 2 * t * (1 - t) * mx + t * t * b.x;
      const py = (1 - t) * (1 - t) * a.y + 2 * t * (1 - t) * my + t * t * b.y;
      ctx.beginPath(); ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = gb(Math.min(1, alpha * 2.2)); ctx.fill();
    });

    // — Nodes —
    proj.forEach((p, i) => {
      if (!p.visible) return;
      const size  = 2 + p.z * 2.5;
      const alpha = 0.4 + p.z * 0.6;
      const pulse = Math.sin(tick * 0.04 + i * 1.35);

      ctx.beginPath();
      ctx.arc(p.x, p.y, size + (pulse * 0.5 + 0.5) * 4.5, 0, Math.PI * 2);
      ctx.strokeStyle = g(alpha * 0.28); ctx.lineWidth = 0.5; ctx.stroke();

      ctx.beginPath(); ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = gb(alpha); ctx.fill();
    });

    // — Outer orbit ring —
    ctx.beginPath(); ctx.arc(CX, CY, OR, 0, Math.PI * 2);
    ctx.strokeStyle = g(0.13); ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 8]); ctx.stroke(); ctx.setLineDash([]);

    // — Satellite + trail —
    for (let t = 9; t >= 0; t--) {
      const a  = orbitAngle - t * 0.033;
      const sx = CX + Math.cos(a) * OR;
      const sy = CY + Math.sin(a) * OR;
      if (t === 0) {
        const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 10);
        sg.addColorStop(0, gb(0.55)); sg.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.fillStyle = sg; ctx.fill();
        ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fillStyle = gb(0.95); ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = g(0.42 - t * 0.042); ctx.fill();
      }
    }

    rotation   += 0.004;
    orbitAngle += 0.009;
    tick++;
    requestAnimationFrame(frame);
  }

  frame();
}


/* ═══════════════════════════════════════════════════════════════
   INIT — Entry point, called from index.html
   ═══════════════════════════════════════════════════════════════ */
export function initAll() {
  initLiquidShader();
  initHotelParallax();
  initAuthorityFade();
  initSpringStats();
  initMobileFAB();
  initFogDissolve();
  initMagneticCTA();
  initHardTruthReveal();
  initHotelTilt();
  initWindowOpen();
  initMarketingGlobe();
}
