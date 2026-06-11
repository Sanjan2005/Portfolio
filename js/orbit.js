// ============================================================
//  ORBIT SKILL VISUALIZER  v3
//  Fix 3: taller canvas (resize respects container height),
//          outer orbit radius guards, no clipping.
// ============================================================

(function () {
  const container = document.getElementById('orbit-canvas');
  if (!container) return;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, cx, cy;
  let scrollOffset = 0;

  // Skills grouped by orbit ring
  // Fix 3: radii are kept proportional; resize() will scale them if canvas is too small
  const orbits = [
    { radius: 90,  speed:  0.0030, color: '#C9A84C', skills: ['Python', 'PyTorch', 'TensorFlow'] },
    { radius: 160, speed: -0.0020, color: '#E22227', skills: ['LLMs', 'RAG', 'LangChain', 'NLP', 'CrewAI'] },
    { radius: 240, speed:  0.0014, color: '#55666E', skills: ['FastAPI', 'Docker', 'MLflow', 'BentoML', 'AWS EC2'] },
    { radius: 310, speed: -0.0009, color: '#6C0102', skills: ['ChromaDB', 'FAISS', 'PostgreSQL', 'Transformers', 'Scikit-learn', 'Spark'] }
  ];

  orbits.forEach(orbit => {
    orbit.nodes = orbit.skills.map((skill, i) => ({
      label: skill,
      angle: (i / orbit.skills.length) * Math.PI * 2,
      originalX: 0,
      originalY: 0,
      baseAngle: (i / orbit.skills.length) * Math.PI * 2
    }));
  });

  const FONT = '600 12px "DM Sans", sans-serif';

  function resize() {
    W = canvas.width  = container.clientWidth;
    H = canvas.height = container.clientHeight || 740;  // Fix 3: match CSS height
    cx = W / 2;
    cy = H / 2;

    // Fix 3: Guard — if canvas is narrower than the outer orbit, scale radii down
    const maxOrbitRadius = orbits[orbits.length - 1].radius;
    const pillExtra = 50; // pill width / 2 + glow
    const available = Math.min(W, H) / 2 - pillExtra;
    if (available < maxOrbitRadius) {
      const scale = available / maxOrbitRadius;
      orbits.forEach((o, i) => {
        // Only scale down, never scale the base radii (reference stored separately)
        o._scaledRadius = Math.floor([90, 160, 240, 310][i] * scale);
      });
    } else {
      orbits.forEach((o, i) => {
        o._scaledRadius = [90, 160, 240, 310][i];
      });
    }
  }

  // ─── Touch / pointer detection ────────────────────────────
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  // Hovered node tracking
  let hovered = null;

  // Dragging state
  let draggedNode = null;
  let dragStartTime = 0;

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Advance angles (skip dragged node)
    orbits.forEach(o => {
      o.nodes.forEach(n => {
        if (!draggedNode || draggedNode.label !== n.label) {
          n.angle += o.speed + scrollOffset * 0.00001;
        }
      });
    });
    scrollOffset = 0;

    // Draw orbit rings using scaled radius
    orbits.forEach(orbit => {
      const r = orbit._scaledRadius || orbit.radius;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = hexToRgba(orbit.color, 0.18);
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Center nucleus
    const nucGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 62);
    nucGrad.addColorStop(0, 'rgba(226,34,39,0.28)');
    nucGrad.addColorStop(0.6, 'rgba(108,1,2,0.12)');
    nucGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, 62, 0, Math.PI * 2);
    ctx.fillStyle = nucGrad;
    ctx.fill();

    // Outer glow ring on nucleus
    const outerGlow = ctx.createRadialGradient(cx, cy, 50, cx, cy, 90);
    outerGlow.addColorStop(0, 'rgba(226,34,39,0.06)');
    outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, 90, 0, Math.PI * 2);
    ctx.fillStyle = outerGlow;
    ctx.fill();

    // Center text
    ctx.save();
    ctx.font = `700 14px "Syne", "DM Sans", sans-serif`;
    ctx.fillStyle = '#C9A84C';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AI / ML', cx, cy - 9);
    ctx.font = `400 11px "DM Sans", sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.fillText('SKILLS', cx, cy + 11);
    ctx.restore();

    // Collect all node positions for hover/drag detection
    const allNodes = [];

    orbits.forEach(orbit => {
      const r = orbit._scaledRadius || orbit.radius;
      orbit.nodes.forEach(node => {
        let x = cx + Math.cos(node.angle) * r;
        let y = cy + Math.sin(node.angle) * r;

        // Store canonical orbit position
        node.originalX = x;
        node.originalY = y;

        // Override with drag position if dragging
        if (draggedNode && draggedNode.label === node.label) {
          x = draggedNode.currentX || x;
          y = draggedNode.currentY || y;
        }

        ctx.font = FONT;
        const tw = ctx.measureText(node.label).width;
        const pw = tw + 20;
        const ph = 26;

        const isHovered = hovered && hovered.label === node.label;
        const isDragged = draggedNode && draggedNode.label === node.label;
        const color = orbit.color;

        // Connection line (faint when dragging)
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = hexToRgba(color, isDragged ? 0.04 : isHovered ? 0.22 : 0.07);
        ctx.lineWidth = isDragged ? 0.5 : isHovered ? 1.5 : 0.6;
        ctx.stroke();

        // Glow halo for hovered / dragged
        if (isHovered || isDragged) {
          const glowR = isDragged ? 55 : 32;
          const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
          glow.addColorStop(0, hexToRgba(color, isDragged ? 0.28 : 0.18));
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(x, y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        // Pill background
        ctx.beginPath();
        ctx.roundRect(x - pw/2, y - ph/2, pw, ph, 7);
        ctx.fillStyle = isDragged
          ? hexToRgba(color, 0.18)
          : isHovered
          ? hexToRgba(color, 0.22)
          : 'rgba(20,28,36,0.90)';
        ctx.fill();

        // Pill border
        ctx.beginPath();
        ctx.roundRect(x - pw/2, y - ph/2, pw, ph, 7);
        ctx.strokeStyle = hexToRgba(color, isDragged ? 0.9 : isHovered ? 0.75 : 0.32);
        ctx.lineWidth = isDragged ? 2 : isHovered ? 1.5 : 1;
        ctx.stroke();

        // Label text
        ctx.font = FONT;
        ctx.fillStyle = isDragged || isHovered ? '#fff' : hexToRgba(color, 0.88);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, x, y);

        allNodes.push({
          label: node.label,
          x, y, pw, ph,
          orbitColor: color,
          originalX: node.originalX,
          originalY: node.originalY
        });
      });
    });

    canvas._allNodes = allNodes;

    // Snap-back animation when drag released (handled by drag-drop.js event)
    if (draggedNode && window.dragState && !window.dragState.isDragging) {
      if (!draggedNode.snapStartTime) {
        draggedNode.snapStartTime = Date.now();
        draggedNode.snapFromX = draggedNode.currentX;
        draggedNode.snapFromY = draggedNode.currentY;
      }
      const elapsed  = Date.now() - draggedNode.snapStartTime;
      const duration = 600;
      const t = Math.min(elapsed / duration, 1);
      // Ease-out-cubic
      const ease = 1 - Math.pow(1 - t, 3);

      draggedNode.currentX = draggedNode.snapFromX + (draggedNode.originalX - draggedNode.snapFromX) * ease;
      draggedNode.currentY = draggedNode.snapFromY + (draggedNode.originalY - draggedNode.snapFromY) * ease;

      if (t >= 1) { draggedNode = null; }
    }

    requestAnimationFrame(draw);
  }

  // ─── Mouse hover (desktop only) ───────────────────────────
  if (!isTouchDevice) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const nodes = canvas._allNodes || [];
      let found = null;
      for (const n of nodes) {
        if (mx > n.x - n.pw/2 && mx < n.x + n.pw/2 &&
            my > n.y - n.ph/2 && my < n.y + n.ph/2) {
          found = n;
          break;
        }
      }
      hovered = found;
      canvas.style.cursor = found ? 'grab' : 'default';
    });

    canvas.addEventListener('mouseleave', () => {
      hovered = null;
      canvas.style.cursor = 'default';
    });
  }

  // ─── Drag start (desktop only) ────────────────────────────
  if (!isTouchDevice) {
    canvas.addEventListener('mousedown', (e) => {
      if (!hovered) return;

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      draggedNode = {
        label: hovered.label,
        currentX: mx,
        currentY: my,
        dragX: mx,
        dragY: my,
        originalX: hovered.originalX,
        originalY: hovered.originalY,
        snapStartTime: null
      };
      dragStartTime = Date.now();
      canvas.style.cursor = 'grabbing';

      document.dispatchEvent(new CustomEvent('skillDragStart', {
        detail: { label: hovered.label, x: mx, y: my }
      }));

      e.preventDefault();
    });
  }

  // ─── Drag move (desktop only) ─────────────────────────────
  if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
      if (!draggedNode) return;
      const rect = canvas.getBoundingClientRect();
      draggedNode.currentX = e.clientX - rect.left;
      draggedNode.currentY = e.clientY - rect.top;
      draggedNode.dragX    = draggedNode.currentX;
      draggedNode.dragY    = draggedNode.currentY;
    });
  }

  // ─── Drag end (desktop only) ──────────────────────────────
  if (!isTouchDevice) {
    document.addEventListener('mouseup', (e) => {
      if (!draggedNode) return;

      document.dispatchEvent(new CustomEvent('skillDragEnd', {
        detail: {
          label: draggedNode.label,
          x: draggedNode.currentX,
          y: draggedNode.currentY
        }
      }));

      canvas.style.cursor = hovered ? 'grab' : 'default';
      // draggedNode persists — snap-back animation in draw() clears it
    });
  }

  // ─── Touch: double-tap to open skill panel (mobile) ───────
  if (isTouchDevice) {
    let lastTapTime  = 0;
    let lastTapLabel = null;
    const DOUBLE_TAP_MS = 350; // max gap between two taps

    canvas.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      if (!touch) return;

      const rect  = canvas.getBoundingClientRect();
      const tx    = touch.clientX - rect.left;
      const ty    = touch.clientY - rect.top;
      const nodes = canvas._allNodes || [];

      // Find tapped node
      let tappedNode = null;
      for (const n of nodes) {
        // Slightly larger hit area for touch (add 8px padding)
        const pad = 8;
        if (tx > n.x - n.pw/2 - pad && tx < n.x + n.pw/2 + pad &&
            ty > n.y - n.ph/2 - pad && ty < n.y + n.ph/2 + pad) {
          tappedNode = n;
          break;
        }
      }

      if (!tappedNode) return;

      const now = Date.now();
      const gap = now - lastTapTime;

      if (gap < DOUBLE_TAP_MS && lastTapLabel === tappedNode.label) {
        // Double-tap confirmed — fire event for drag-drop.js to handle
        document.dispatchEvent(new CustomEvent('skillDoubleTap', {
          detail: { label: tappedNode.label }
        }));
        lastTapTime  = 0;
        lastTapLabel = null;
        e.preventDefault(); // prevent zoom on double-tap
      } else {
        // First tap — highlight the node visually
        hovered = tappedNode;
        lastTapTime  = now;
        lastTapLabel = tappedNode.label;
        // Clear highlight after a moment
        setTimeout(() => {
          if (hovered && hovered.label === tappedNode.label) hovered = null;
        }, DOUBLE_TAP_MS + 50);
      }
    }, { passive: false });
  }

  // ─── Scroll nudge ─────────────────────────────────────────
  window.addEventListener('scroll', () => { scrollOffset += 2; }, { passive: true });

  window.addEventListener('resize', () => { resize(); });
  resize();
  draw();
})();