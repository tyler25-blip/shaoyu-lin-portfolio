/* ============================================================
   Portfolio — interactions
   ============================================================ */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Body load fade ---- */
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));

  /* ---- Cursor orb ---- */
  const orb = document.querySelector('.cursor-orb');
  if (orb && !reducedMotion && matchMedia('(hover: hover)').matches) {
    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let cx = tx, cy = ty;
    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      orb.classList.add('is-active');
    }, { passive: true });
    const lerp = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      orb.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(lerp);
    };
    lerp();
  }

  /* ---- Nav hide on scroll down, show on up ---- */
  const nav = document.querySelector('.nav');
  if (nav) {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY + 10 && y > 120) nav.classList.add('is-hidden');
      else if (y < lastY - 4) nav.classList.remove('is-hidden');
      lastY = y;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
  }

  /* ---- Project hero image parallax ---- */
  const phImg = document.querySelector('.project-hero__img img');
  if (phImg && !reducedMotion) {
    const parent = phImg.parentElement;
    let sy = 0;
    window.addEventListener('scroll', () => { sy = window.scrollY; }, { passive: true });
    const loop = () => {
      const rect = parent.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        phImg.style.transform = `scale(1.1) translate3d(0, ${sy * 0.15}px, 0)`;
      }
      requestAnimationFrame(loop);
    };
    loop();
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

  /* ---- Magnetic hover (buttons + cards) ---- */
  if (!reducedMotion && matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || 0.25;
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });

    /* 3D tilt on project cards */
    document.querySelectorAll('.project-card').forEach((card) => {
      const img = card.querySelector('img');
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateX(${py * -4}deg) rotateY(${px * 6}deg) translateY(-6px)`;
        if (img) img.style.transform = `scale(1.08) translate(${px * -14}px, ${py * -14}px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        if (img) img.style.transform = '';
      });
    });
  }

  /* ---- Scroll progress bar ---- */
  const progress = document.querySelector('.scroll-progress');
  if (progress) {
    const update = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
      progress.style.width = `${Math.min(100, scrolled * 100)}%`;
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
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
