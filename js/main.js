// ============================================================
//  MAIN APP JS — cursor, nav, reveals, modal, misc
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ─── CUSTOM CURSOR ─────────────────────────────────────
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  if (dot && ring) {
    let mx = -100, my = -100;
    let rx = -100, ry = -100;

    function moveCursorTo(x, y) {
      mx = x; my = y;
      dot.style.left  = mx + 'px';
      dot.style.top   = my + 'px';
    }

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
      moveCursorTo(e.clientX, e.clientY);
    });

    // ─── Touch tracking ──────────────────────────────────
    // On touch devices the cursor elements are hidden via CSS (hover:none + pointer:coarse),
    // but we still fire position updates so any pointer-dependent logic stays correct.
    document.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      if (!t) return;
      moveCursorTo(t.clientX, t.clientY);
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (!t) return;
      moveCursorTo(t.clientX, t.clientY);
    }, { passive: true });

    document.addEventListener('touchend', () => {
      // Small delay then fade — mirrors mouseleave behaviour
      setTimeout(() => {
        dot.style.opacity  = '0';
        ring.style.opacity = '0';
      }, 300);
    }, { passive: true });

    function animateRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.addEventListener('mouseleave', () => {
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    });
  }

  // ─── NAV SCROLL EFFECT ─────────────────────────────────
  const nav = document.getElementById('nav');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function updateNav() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Active section highlighting
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // ─── SCROLL REVEAL ─────────────────────────────────────
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .timeline-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));

  // ─── CERTIFICATION MODAL ────────────────────────────────
  const modalOverlay = document.getElementById('cert-modal');
  const modalImg     = document.getElementById('modal-img');
  const modalTitle   = document.getElementById('modal-title');
  const modalMeta    = document.getElementById('modal-meta');
  const modalClose   = document.getElementById('modal-close');

  if (modalOverlay) {
    document.querySelectorAll('.cert-card[data-cert]').forEach(card => {
      card.addEventListener('click', () => {
        const cert = card.dataset.cert;
        modalImg.src   = card.dataset.src;
        modalTitle.textContent = card.dataset.title;
        modalMeta.textContent  = card.dataset.meta;
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeModal() {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // ─── TYPED HERO SUBTITLE ───────────────────────────────
  const typed = document.getElementById('typed-role');
  if (typed) {
    const roles = [
      'AI / ML Engineer',
      'LLM & GenAI Builder',
      'Data Science Enthusiast',
      'NLP Researcher',
    ];
    let roleIdx = 0, charIdx = 0, deleting = false;

    function typeLoop() {
      const role = roles[roleIdx];
      if (!deleting) {
        typed.textContent = role.slice(0, charIdx + 1);
        charIdx++;
        if (charIdx === role.length) {
          deleting = true;
          setTimeout(typeLoop, 1800);
          return;
        }
        setTimeout(typeLoop, 80);
      } else {
        typed.textContent = role.slice(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
          setTimeout(typeLoop, 400);
          return;
        }
        setTimeout(typeLoop, 40);
      }
    }
    setTimeout(typeLoop, 1200);
  }

  // ─── SKILL CATEGORY TABS (mobile) ──────────────────────
  // auto-handled via CSS

  // ─── PARALLAX HERO PHOTO ───────────────────────────────
  const heroPhoto = document.querySelector('.hero-photo-frame');
  if (heroPhoto) {
    window.addEventListener('scroll', () => {
      const offset = window.scrollY * 0.12;
      heroPhoto.style.transform = `translateY(${offset}px)`;
    }, { passive: true });
  }

  // ─── SMOOTH ANCHOR SCROLL ──────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ─── STAT COUNTER ANIMATION ────────────────────────────
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const isFloat = el.dataset.target.includes('.');
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const step = target / 50;
        const interval = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
        }, 30);
        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => statsObserver.observe(el));

  // ─── RED GLOW ON PROJECT CARD HOVER ────────────────────
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });

});