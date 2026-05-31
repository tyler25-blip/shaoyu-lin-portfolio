/* ============================================================
   Portfolio — interactions (editorial, restrained)
   ============================================================ */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- Body load fade ---- */
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));

  /* ---- Custom cursor (follower dot → VIEW on project hover) ---- */
  const cursor = document.querySelector('.cursor');
  if (cursor && finePointer && !reducedMotion) {
    document.body.classList.add('cursor-on');
    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let cx = tx, cy = ty;
    window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll('[data-cursor="view"]').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-view'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-view'));
    });
  }

  /* ---- Nav: hairline on scroll, hide on scroll-down / show on up ---- */
  const nav = document.querySelector('.nav');
  if (nav) {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 8);
      if (y > lastY + 10 && y > 120) nav.classList.add('is-hidden');
      else if (y < lastY - 4) nav.classList.remove('is-hidden');
      lastY = y;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();
  }

  /* ---- Reveal on scroll ---- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---- Smooth anchor scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---- Hero dot-matrix magnetic field ---- */
  const heroCanvas = document.querySelector('.hero__particles');
  if (heroCanvas && heroCanvas.getContext) {
    const ctx = heroCanvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const GAP = 34;       // grid spacing
    const BASE_R = 1.5;   // resting dot radius
    const FIELD = 130;    // cursor influence radius
    const PUSH = 26;      // max displacement under cursor
    const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#2b2622';

    let dots = [];
    let w = 0, h = 0;
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      const rect = heroCanvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      heroCanvas.width = Math.round(w * dpr);
      heroCanvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = ink;
      dots = [];
      const startX = w * 0.40;          // keep the text column clear
      const feather = Math.max(120, w * 0.16);
      for (let y = GAP; y < h - GAP * 0.5; y += GAP) {
        for (let x = startX; x < w - GAP * 0.4; x += GAP) {
          const fade = Math.min(1, Math.max(0, (x - startX) / feather));
          dots.push({ hx: x, hy: y, x, y, fade });
        }
      }
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        ctx.globalAlpha = 0.4 * d.fade;
        ctx.beginPath();
        ctx.arc(d.hx, d.hy, BASE_R, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    if (reducedMotion || !finePointer) {
      // Static, intentional grid — no animation, no pointer tracking
      build();
      drawStatic();
      window.addEventListener('resize', () => { build(); drawStatic(); }, { passive: true });
    } else {
      const render = () => {
        ctx.clearRect(0, 0, w, h);
        for (const d of dots) {
          const dx = d.hx - mouse.x;
          const dy = d.hy - mouse.y;
          const dist = Math.hypot(dx, dy);
          let tx = d.hx, ty = d.hy, r = BASE_R, a = 0.4 * d.fade;
          if (dist < FIELD) {
            const f = 1 - dist / FIELD;
            const ang = Math.atan2(dy, dx);
            tx = d.hx + Math.cos(ang) * PUSH * f;
            ty = d.hy + Math.sin(ang) * PUSH * f;
            r = BASE_R + f * 1.9;
            a = (0.4 + f * 0.5) * d.fade;
          }
          d.x += (tx - d.x) * 0.16;
          d.y += (ty - d.y) * 0.16;
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(render);
      };
      window.addEventListener('mousemove', (e) => {
        const rect = heroCanvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      }, { passive: true });
      window.addEventListener('mouseout', (e) => {
        if (!e.relatedTarget) { mouse.x = -9999; mouse.y = -9999; }
      }, { passive: true });
      let rt;
      window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(build, 150);
      }, { passive: true });
      build();
      render();
    }
  }

  /* ---- Copy email on click ---- */
  document.querySelectorAll('[data-copy-email]').forEach((el) => {
    const email = el.dataset.copyEmail;
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(email);
        const orig = el.textContent;
        el.textContent = 'Copied · ' + email;
        setTimeout(() => { el.textContent = orig; }, 1600);
      } catch {
        window.location.href = `mailto:${email}`;
      }
    });
  });
})();
