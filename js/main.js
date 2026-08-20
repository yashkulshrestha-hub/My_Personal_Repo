(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Theme toggle ---------- */
  const themeToggle = $('#themeToggle');
  if (themeToggle) {
    const applyTheme = (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      try { localStorage.setItem('nexa-theme', theme); } catch (e) {}
      const dark = theme === 'dark';
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      const meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', dark ? '#0c0c12' : '#f6f6f4');
    };
    applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
    themeToggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  /* ---------- Scroll progress ---------- */
  const progress = $('#scrollProgress');
  const onScrollProgress = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const p = total > 0 ? window.scrollY / total : 0;
    progress.style.transform = 'scaleX(' + p + ')';
  };
  window.addEventListener('scroll', onScrollProgress, { passive: true });

  /* ---------- Header state + back-to-top ---------- */
  const header = $('#siteHeader');
  const toTop = $('#toTop');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    toTop.classList.toggle('show', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Mobile menu ---------- */
  const hamburger = $('#hamburger');
  const navLinks = $('#navLinks');
  if (hamburger && navLinks) {
    const closeMenu = () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    };
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
    $$('.nav-link', navLinks).forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Active nav link ---------- */
  const sections = $$('section[id]');
  const navLinkEls = $$('.nav-link');
  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          navLinkEls.forEach((l) => {
            l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id);
          });
        }
      }
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((sec) => spy.observe(sec));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const delay = entry.target.getAttribute('data-delay');
            if (delay) entry.target.style.transitionDelay = Number(delay) * 0.12 + 's';
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }
  document.documentElement.classList.add('js-reveal');

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString() + suffix;
      return;
    }
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.5 }
  );
  $$('.stat-number').forEach((el) => counterObserver.observe(el));

  /* ---------- Pricing toggle ---------- */
  const billingToggle = $('#billingToggle');
  if (billingToggle) {
    const labelMonthly = $('#labelMonthly');
    const labelYearly = $('#labelYearly');
    const priceValues = $$('.price-value');
    let yearly = false;

    const setBilling = (isYearly, animate) => {
      yearly = isYearly;
      billingToggle.setAttribute('aria-checked', String(yearly));
      labelMonthly.classList.toggle('pt-active', !yearly);
      labelYearly.classList.toggle('pt-active', yearly);
      priceValues.forEach((el) => {
        const target = yearly
          ? parseInt(el.dataset.yearly, 10)
          : parseInt(el.dataset.monthly, 10);
        if (animate && !prefersReducedMotion) {
          const from = parseInt(el.textContent, 10);
          const start = performance.now();
          const duration = 450;
          (function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(from + (target - from) * eased);
            if (p < 1) requestAnimationFrame(tick);
          })(performance.now());
        } else {
          el.textContent = target;
        }
      });
    };

    billingToggle.addEventListener('click', () => setBilling(!yearly, true));
    setBilling(false, false);
  }

  /* ---------- Testimonial carousel ---------- */
  const carousel = $('#carousel');
  const track = $('#carouselTrack');
  if (carousel && track) {
    const slides = $$('.carousel-slide', track);
    const dotsWrap = $('#carouselDots');
    const prevBtn = $('#carouselPrev');
    const nextBtn = $('#carouselNext');
    let index = 0;
    let timer = null;

    const goTo = (i) => {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      slides.forEach((slide, s) => {
        slide.setAttribute('aria-hidden', String(s !== index));
      });
      $$('.carousel-dot', dotsWrap).forEach((dot, d) => {
        dot.classList.toggle('active', d === index);
        dot.setAttribute('aria-selected', String(d === index));
      });
    };

    const startAutoplay = () => {
      if (prefersReducedMotion) return;
      stopAutoplay();
      timer = setInterval(() => goTo(index + 1), 5200);
    };
    const stopAutoplay = () => { if (timer) clearInterval(timer); timer = null; };

    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(index - 1); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(index + 1); startAutoplay(); });

    slides.forEach((_, s) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot' + (s === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', String(s === 0));
      dot.setAttribute('aria-label', 'Show testimonial ' + (s + 1));
      dot.addEventListener('click', () => { goTo(s); startAutoplay(); });
      dotsWrap.appendChild(dot);
    });

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { goTo(index + 1); startAutoplay(); }
      if (e.key === 'ArrowLeft') { goTo(index - 1); startAutoplay(); }
    });

    goTo(0);
    startAutoplay();
  }

  /* ---------- FAQ accordion ---------- */
  $$('.faq-item').forEach((item) => {
    const q = $('.faq-q', item);
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      $$('.faq-item.open').forEach((other) => {
        other.classList.remove('open');
        $('.faq-q', other).setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Magnetic buttons ---------- */
  if (supportsHover && !prefersReducedMotion) {
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + x * 0.18 + 'px, ' + y * 0.28 + 'px)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- Forms ---------- */
  function wireForm(formId, statusId, successMsg) {
    const form = $(formId);
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('input[type="email"]', form);
      const email = (input.value || '').trim();
      const status = $(statusId);
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      if (!valid) {
        input.focus();
        if (status) {
          status.style.color = '#dc2626';
          status.textContent = 'Please enter a valid email address.';
          setTimeout(() => { status.textContent = ''; }, 4000);
        }
        return;
      }
      form.reset();
      if (status) {
        status.style.color = '';
        status.textContent = successMsg;
        setTimeout(() => { status.textContent = ''; }, 5000);
      }
    });
  }
  wireForm('#ctaForm', '#ctaStatus', 'Thanks! We\'ll reach out within one business day.');
  wireForm('#newsForm', '#newsStatus', 'Subscribed — see you in the next issue.');

  /* ---------- Footer year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
