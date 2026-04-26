/**
 * animations.js — Premium UI/UX Layer
 * AI Marketing Site · Fiverr Portfolio Version
 * ─────────────────────────────────────────────
 * Powered by Motion (Framer Motion vanilla)
 * CDN: https://cdn.jsdelivr.net/npm/motion@11/+esm
 */

import { animate, inView } from 'https://cdn.jsdelivr.net/npm/motion@11/+esm';

/* ═══════════════════════════════════════════════════════════════
   1. DOOR ENTRY — 3D Parallax + Perspective depth enhancement
   ═══════════════════════════════════════════════════════════════ */
export function initDoorEntry() {
  const doorScene  = document.getElementById('doorScene');
  const mainSite   = document.getElementById('mainSite');
  const suiteMedia = document.querySelector('.suite-media');

  if (!doorScene || !mainSite || !suiteMedia) return;

  // Suite starts zoomed IN (creates "far away" feeling)
  // As door swings, it zooms OUT to natural size → feels like stepping inside
  Object.assign(suiteMedia.style, {
    transform: 'scale(1.22)',
    opacity:   '0',
  });

  setTimeout(() => {
    // Phase 1 — slow approach toward door
    doorScene.classList.add('door-zoom-in');

    // Phase 2 — door swings + parallax pull simultaneously
    setTimeout(() => {
      doorScene.classList.add('door-open');

      // Suite parallax: zoom out as we "enter" — the psychological
      // sense of expansive space revealing itself
      animate(
        suiteMedia,
        { transform: ['scale(1.22)', 'scale(1.0)'], opacity: [0, 1] },
        { duration: 2.6, easing: [0.16, 1, 0.3, 1] }
      );

      // Subtle perspective drift on the door scene container —
      // slight Y rotation gives sense of "crossing the threshold"
      animate(
        doorScene,
        { perspective: ['1400px', '900px'] },
        { duration: 2.4, easing: 'ease-out' }
      );
    }, 1400);

    // Phase 3 — camera push through
    setTimeout(() => {
      doorScene.classList.add('push-forward');
      mainSite.classList.add('site-reveal');

      // Quick scale overshoot on entry: gives the "pushed through" sensation
      animate(
        doorScene,
        { scale: [1, 1.06, 1] },
        { duration: 1.6, easing: [0.34, 1.56, 0.64, 1] }
      );
    }, 3600);

    // Phase 4 — clean up
    setTimeout(() => { doorScene.style.display = 'none'; }, 5400);

  }, 250);
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
    '.hero-eyebrow, .hero-fineprint, .promise-text, .contact-lede'
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
   INIT — Entry point, called from index.html
   ═══════════════════════════════════════════════════════════════ */
export function initAll() {
  initDoorEntry();
  initAuthorityFade();
  initSpringStats();
  initMobileFAB();
  initFogDissolve();
  initMagneticCTA();
}
