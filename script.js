'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initPromoBanner();
  initNav();
  initScrollProgress();
  initStats();
  initServiceTabs();
  initGallery();
  initCarousel();
  initForm();
  initFloatingButtons();
  initScrollReveals();
});

/* ============================================================
   PROMO BANNER
   ============================================================ */
function initPromoBanner() {
  if (localStorage.getItem('isiqalo-promo-dismissed') === '1') {
    document.body.classList.add('promo-hidden');
    return;
  }
  const closeBtn = document.querySelector('.promo-close');
  if (!closeBtn) return;
  closeBtn.addEventListener('click', () => {
    document.body.classList.add('promo-hidden');
    localStorage.setItem('isiqalo-promo-dismissed', '1');
  });
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function initNav() {
  const nav = document.getElementById('main-nav');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });
}

/* ============================================================
   HERO SCROLL PROGRESS BAR
   ============================================================ */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-bar-inner');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.height = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
  }, { passive: true });
}

/* ============================================================
   STATS COUNTER
   ============================================================ */
function initStats() {
  const statValues = document.querySelectorAll('.stat-value[data-count]');
  if (!statValues.length) return;

  function countUp(el) {
    const target = parseInt(el.dataset.count, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const startTime = Date.now();

    function tick() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * target);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statValues.forEach(el => observer.observe(el));
}

/* ============================================================
   SERVICE TABS
   ============================================================ */
function initServiceTabs() {
  const tabs = document.querySelectorAll('.tab');
  const cards = document.querySelectorAll('.service-card');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.service;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.service === filter;
        if (match) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          card.offsetHeight; // reflow
          card.style.animation = 'cardReveal 0.35s var(--ease) forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ============================================================
   GALLERY + LIGHTBOX
   ============================================================ */
function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (!items.length || !lightbox) return;

  const images = Array.from(items).map(item => ({
    src: item.querySelector('img').src,
    alt: item.querySelector('img').alt
  }));
  let currentIndex = 0;
  let triggerEl = null;

  function openLightbox(index, trigger) {
    currentIndex = index;
    triggerEl = trigger || null;
    lightboxImg.src = images[index].src;
    lightboxImg.alt = images[index].alt;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtn.focus(), 50);
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (triggerEl) triggerEl.focus();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImg.src = images[currentIndex].src;
    lightboxImg.alt = images[currentIndex].alt;
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImg.src = images[currentIndex].src;
    lightboxImg.alt = images[currentIndex].alt;
  }

  items.forEach((item, i) => item.addEventListener('click', () => openLightbox(i, item)));
  items.forEach((item, i) => {
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i, item);
      }
    });
  });
  closeBtn.addEventListener('click', closeLightbox);
  nextBtn.addEventListener('click', showNext);
  prevBtn.addEventListener('click', showPrev);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}

/* ============================================================
   REVIEWS CAROUSEL
   ============================================================ */
function initCarousel() {
  const track = document.getElementById('reviews-track');
  const dotsContainer = document.getElementById('carousel-dots');
  const carousel = document.querySelector('.reviews-carousel');
  if (!track || !carousel) return;

  const cards = Array.from(track.children);
  let current = 0;
  let autoplayTimer;

  function visibleCount() {
    const w = carousel.offsetWidth;
    if (w < 640) return 1;
    if (w < 1024) return 2;
    return 3;
  }

  function totalSlides() {
    return Math.max(0, cards.length - visibleCount());
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    const count = totalSlides() + 1;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Review ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, totalSlides()));
    const cardW = cards[0].offsetWidth + 20;
    track.style.transform = `translateX(-${current * cardW}px)`;
    updateDots();
  }

  function next() {
    goTo(current >= totalSlides() ? 0 : current + 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(next, 4000);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  buildDots();
  startAutoplay();

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(0);
    }, 150);
  }, { passive: true });
}

/* ============================================================
   BOOKING FORM
   ============================================================ */
function initForm() {
  const form = document.getElementById('booking-form');
  const successEl = document.getElementById('form-success');
  if (!form) return;

  const dateInput = document.getElementById('date');
  if (dateInput) {
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    dateInput.setAttribute('min', localToday);
  }

  function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + '-error');
    if (field) field.classList.add('error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearErrors() {
    form.querySelectorAll('input, select, textarea').forEach(el => el.classList.remove('error'));
    form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  }

  function validatePhone(value) {
    return /^0[0-9]{9}$/.test(value.replace(/[\s-]/g, ''));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    let valid = true;

    const name = document.getElementById('name');
    if (!name.value.trim()) {
      showError('name', 'Please enter your name');
      valid = false;
    }

    const phone = document.getElementById('phone');
    if (!phone.value.trim()) {
      showError('phone', 'Please enter your phone number');
      valid = false;
    } else if (!validatePhone(phone.value)) {
      showError('phone', 'Enter a valid SA phone number (e.g. 0834567890)');
      valid = false;
    }

    const service = document.getElementById('service');
    if (!service.value) {
      showError('service', 'Please select a service');
      valid = false;
    }

    const date = document.getElementById('date');
    if (!date.value) {
      showError('date', 'Please select a date');
      valid = false;
    } else {
      const n = new Date();
      const localDate = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
      if (date.value < localDate) {
        showError('date', 'Date must be today or in the future');
        valid = false;
      }
    }

    if (!valid) return;

    if (successEl) {
      successEl.classList.add('visible');
      successEl.setAttribute('aria-hidden', 'false');
    }
  });

  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const errorEl = document.getElementById(el.id + '-error');
      if (errorEl) errorEl.textContent = '';
    });
  });
}

/* ============================================================
   FLOATING BUTTONS
   ============================================================ */
function initFloatingButtons() {
  const backToTop = document.getElementById('back-to-top');
  if (!backToTop) return;

  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   SCROLL REVEALS
   ============================================================ */
function initScrollReveals() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.revealed)'));
        const idx = siblings.indexOf(entry.target);
        const delay = Math.max(0, idx * 0.06);
        entry.target.style.transitionDelay = `${delay}s`;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
}
