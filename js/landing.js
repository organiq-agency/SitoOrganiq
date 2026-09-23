/* ============================================================
   Organiq — Landing: GSAP + ScrollTrigger + Lenis + SplitType
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (typeof Lenis !== 'undefined' && !prefersReduced) {
    lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
    });
    if (hasST) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ---------- Ancore fluide ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Barra di progresso + stato nav ---------- */
  var nav = document.getElementById('nav');
  var progressBar = document.getElementById('progressBar');
  var onScroll = function () {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 24);
    if (progressBar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Scroll spy ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var spyTargets = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute('href')); })
    .filter(Boolean);
  if ('IntersectionObserver' in window && spyTargets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (l) {
            l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    spyTargets.forEach(function (t) { spy.observe(t); });
  }

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---------- Titoli: reveal lettera per lettera ---------- */
  var splitTargets = document.querySelectorAll('[data-split]');
  if (hasST && typeof SplitType !== 'undefined' && !prefersReduced) {
    splitTargets.forEach(function (el) {
      var split = new SplitType(el, { types: 'words,chars', tagName: 'span' });
      gsap.set(el, { opacity: 1 });
      gsap.from(split.chars, {
        yPercent: 110, opacity: 0, duration: .8, ease: 'power3.out', stagger: .02,
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });
  } else {
    splitTargets.forEach(function (el) { el.style.opacity = 1; });
  }

  /* ---------- Reveal + stagger nelle griglie ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (hasST && !prefersReduced) {
    var grouped = new Set();
    document.querySelectorAll('.grid, .stats-grid, .painlist').forEach(function (grid) {
      var items = grid.querySelectorAll('[data-reveal]');
      if (!items.length) return;
      items.forEach(function (it) { grouped.add(it); });
      ScrollTrigger.create({
        trigger: grid, start: 'top 84%', once: true,
        onEnter: function () {
          items.forEach(function (it, i) {
            setTimeout(function () { it.classList.add('in'); }, i * 90);
          });
        }
      });
    });
    reveals.forEach(function (el) {
      if (grouped.has(el)) return;
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: function () { el.classList.add('in'); }
      });
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Manifesto: parola per parola ---------- */
  var bios = document.querySelectorAll('[data-reveal-text]');
  if (hasST && typeof SplitType !== 'undefined' && !prefersReduced) {
    bios.forEach(function (el) {
      var split = new SplitType(el, { types: 'words', tagName: 'span' });
      split.words.forEach(function (w) { w.classList.add('reveal-word'); });
      /* scrub: il progresso dello scroll accende le parole una a una */
      ScrollTrigger.create({
        trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true,
        onUpdate: function (self) {
          var n = Math.floor(self.progress * split.words.length);
          split.words.forEach(function (w, i) { w.classList.toggle('on', i <= n); });
        }
      });
    });
  } else {
    bios.forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('.reveal-word').forEach(function (w) { w.classList.add('on'); });
  }

  /* ---------- Contatori ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var start = null, dur = 1400;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if (hasST && !prefersReduced) {
    counters.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: function () { animateCounter(el); }
      });
    });
  }

  /* ---------- Stelle recensioni (supporta frazioni: 4.7) ---------- */
  var STAR = '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>';
  document.querySelectorAll('.stars').forEach(function (el) {
    var val = parseFloat(el.getAttribute('data-stars')) || 5;
    var row = STAR + STAR + STAR + STAR + STAR;
    el.innerHTML = '<span class="base">' + row + '</span>' +
      '<span class="fill" style="width:' + (val / 5 * 100) + '%">' + row + '</span>';
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', 'Valutazione ' + String(val).replace('.', ',') + ' su 5');
  });

  /* ---------- Marquee: duplica per il loop ---------- */
  document.querySelectorAll('.mq-track, .rv-track').forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ---------- Tilt card ---------- */
  if (!prefersReduced && matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var rect = null;
      card.addEventListener('mouseenter', function () { rect = card.getBoundingClientRect(); });
      card.addEventListener('mousemove', function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - .5;
        var y = (e.clientY - rect.top) / rect.height - .5;
        card.style.transform = 'perspective(900px) rotateY(' + (x * 5) + 'deg) rotateX(' + (-y * 5) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        rect = null;
      });
    });
  }

  /* ---------- Feedback submit form ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function () {
      var btn = form.querySelector('button[type=submit]');
      if (btn) { btn.disabled = true; btn.style.opacity = '.6'; btn.textContent = 'Invio in corso…'; }
    });
  }
})();
