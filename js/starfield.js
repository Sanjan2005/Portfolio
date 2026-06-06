// ============================================================
//  STARFIELD  v4 — Real stars with organic distribution
//                   warm colors, subtle twinkling, natural depth
// ============================================================

(function () {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], scrollY = 0, targetScrollY = 0;

  // Fix 8: completely redesigned for realistic starfield
  // More stars with logarithmic size distribution (many tiny, few large)
  // Warm natural colors, subtle twinkling, organic depth
  // Fix 10: decreased density, added cosmic bloom effect for atmospheric feel
  const STAR_COUNT = 400;        /* decreased from 600 for less density */
  const MAX_STAR_RADIUS = 1.3;   /* increased slightly for more prominent stars */
  const MIN_STAR_RADIUS = 0.1;   /* min size for tiny stars */

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;  // stays viewport-sized; position:fixed handles coverage
  }

  function initStars() {
    stars = [];
    // Fix 8: natural star color palette - warm whites, creams, soft golds, hint of blue
    const starColors = [
      '#FFFFFF',    /* pure white */
      '#E8F4F8',    /* soft cyan — cool light */
      '#D8E8FF',    /* light blue */
      '#E6E0FF',    /* soft lavender */
      '#F0E8FF',    /* very light purple */
      '#E8ECFF',    /* cool white */
      '#F5F1FF',    /* warm white with hint of purple */
    ];
    
    for (let i = 0; i < STAR_COUNT; i++) {
      // Fix 8: logarithmic size distribution — favors small stars, few large ones (realistic)
      const sizeRand = Math.random();
      const r = MIN_STAR_RADIUS + Math.pow(sizeRand, 2.2) * (MAX_STAR_RADIUS - MIN_STAR_RADIUS);
      
      // Fix 8: varied opacity — some very dim, most medium, few very bright
      // Fix 9: enhanced twinkling (15-40% vs 5-20%)
      const opacityRand = Math.random();
      const opacity = Math.pow(opacityRand, 1.0) * 0.7 + 0.3; /* range 0.3 to 1.0 — better distribution */
      
      stars.push({
        x:              Math.random() * W,
        y:              Math.random() * H,
        r:              r,
        speed:          Math.random() * 0.35 + 0.08,
        opacity:        opacity,
        color:          starColors[Math.floor(Math.random() * starColors.length)],
        twinklePhase:   Math.random() * Math.PI * 2,
        twinkleSpeed:   Math.random() * 0.008 + 0.001,  /* Fix 8: much slower, subtle twinkling */
        twinkleAmount:  Math.random() * 0.25 + 0.15,    /* Fix 9: enhanced twinkling (15-40% vs 5-20%) */
        parallaxFactor: Math.random() * 0.25 + 0.04,
      });
    }
  }

  function draw() {
    // Smooth lerp scroll
    scrollY += (targetScrollY - scrollY) * 0.07;

    ctx.clearRect(0, 0, W, H);

    for (const s of stars) {
      s.twinklePhase += s.twinkleSpeed;
      
      // Fix 8: subtle, natural twinkling
      // Very gentle wave — barely noticeable, like real stars seen from Earth
      const twinkle = 1 + Math.sin(s.twinklePhase) * s.twinkleAmount;
      const alpha = s.opacity * twinkle;

      const yOffset = (scrollY * s.parallaxFactor) % H;
      const drawY = (s.y - yOffset + H) % H;

      // Draw star core
      ctx.beginPath();
      ctx.arc(s.x, drawY, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.fill();

      // Fix 10: prominent cosmic bloom effect for atmospheric feel
      if (s.r > 0.15) {
        // Inner bright bloom
        const innerBloom = s.r * 2.5;
        const innerGrad = ctx.createRadialGradient(s.x, drawY, 0, s.x, drawY, innerBloom);
        innerGrad.addColorStop(0, s.color);
        innerGrad.addColorStop(0.5, s.color);
        innerGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(s.x, drawY, innerBloom, 0, Math.PI * 2);
        ctx.fillStyle = innerGrad;
        ctx.globalAlpha = alpha * 0.7;
        ctx.fill();

        // Outer bloom halo (Fix 10: new for cosmic glow)
        const outerBloom = s.r * 8;
        const outerGrad = ctx.createRadialGradient(s.x, drawY, s.r * 2, s.x, drawY, outerBloom);
        outerGrad.addColorStop(0, s.color);
        outerGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(s.x, drawY, outerBloom, 0, Math.PI * 2);
        ctx.fillStyle = outerGrad;
        ctx.globalAlpha = alpha * 0.25;
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  }, { passive: true });

  window.addEventListener('resize', () => { resize(); initStars(); });

  resize();
  initStars();
  draw();
})();