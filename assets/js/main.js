(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky nav background on scroll ---------- */
  const nav = document.getElementById('site-nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu (full-screen overlay) ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  const openMobileMenu = () => {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    requestAnimationFrame(() => mobileMenu.classList.add('show'));
    document.addEventListener('keydown', onMobileMenuKeydown);
  };

  const closeMobileMenu = () => {
    mobileMenu.classList.remove('show');
    document.body.style.overflow = '';
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.removeEventListener('keydown', onMobileMenuKeydown);
    const finish = () => mobileMenu.classList.remove('open');
    if (reducedMotion) finish();
    else setTimeout(finish, 260);
  };

  function onMobileMenuKeydown(e) {
    if (e.key === 'Escape') closeMobileMenu();
  }

  navToggle.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) closeMobileMenu();
    else openMobileMenu();
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
    if (e.matches) closeMobileMenu();
  });

  /* ---------- Active section highlighting ---------- */
  const sections = ['home', 'course', 'bot', 'broker', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const desktopLinks = document.querySelectorAll('[data-nav]');
  const mobileLinks = document.querySelectorAll('[data-nav-mobile]');

  const setActive = (id) => {
    desktopLinks.forEach((a) => a.classList.toggle('active', a.dataset.nav === id));
    mobileLinks.forEach((a) => a.classList.toggle('active', a.dataset.navMobile === id));
  };

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    document.querySelectorAll('.learning-card').forEach((card, i) => {
      card.style.setProperty('--stagger', `${(i % 3) * 90}ms`);
    });
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll('[data-counter]');

  const formatValue = (value, format) => {
    if (format === 'k' && value >= 1000) {
      return `${Math.floor(value / 1000)}K`;
    }
    return String(Math.floor(value));
  };

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const format = el.dataset.format || '';
    const numberEl = el.querySelector('.stat-number');
    const duration = 1400;
    const start = performance.now();

    if (reducedMotion) {
      numberEl.textContent = `${formatValue(target, format)}${suffix}`;
      return;
    }

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      numberEl.textContent = `${formatValue(current, format)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window && counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ---------- Contact modal ---------- */
  const modal = document.getElementById('contact-modal');
  const modalClose = document.getElementById('modal-close');
  const openTriggers = [
    document.getElementById('course-thumbnail'),
    document.getElementById('course-cta'),
  ].filter(Boolean);

  let lastFocused = null;

  const openModal = () => {
    lastFocused = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.style.overflow = 'hidden';
    modalClose.focus();
    document.addEventListener('keydown', onModalKeydown);
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onModalKeydown);
    const finish = () => { modal.hidden = true; };
    if (reducedMotion) finish();
    else setTimeout(finish, 260);
    if (lastFocused) lastFocused.focus();
  };

  function onModalKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = modal.querySelectorAll('a, button');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  openTriggers.forEach((trigger) => trigger.addEventListener('click', openModal));
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
})();
