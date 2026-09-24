/* ============================================================
   ORGANIQ — Homepage v2
   GSAP + ScrollTrigger + Lenis · media slot con fallback placeholder
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof window.gsap !== 'undefined';
  var hasST = hasG && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  window.__oqReady = true;
  if (!hasG || reduce) root.classList.remove('js');
  if (hasST) gsap.registerPlugin(ScrollTrigger);
  if (/[?&]clean\b/.test(location.search)) document.body.classList.add('show-no-ph');

  /* ---------- Media: carica file reali se esistono, altrimenti resta il placeholder ---------- */
  function loadMedia(el) {
    if (el.__loaded) return;
    el.__loaded = true;
    var img = el.getAttribute('data-img');
    var vid = el.getAttribute('data-video');

    function mount(node) {
      node.classList.add('media-el');
      el.insertBefore(node, el.firstChild);
      requestAnimationFrame(function () { el.classList.add('is-loaded'); });
    }
    function tryImage() {
      if (!img) return;
      var i = new Image();
      i.alt = '';
      i.decoding = 'async';
      i.onload = function () { mount(i); };
      i.src = img;
    }
    if (vid && !reduce) {
      var v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
      v.preload = 'auto';
      v.addEventListener('loadeddata', function () { mount(v); var p = v.play(); if (p && p.catch) p.catch(function () {}); }, { once: true });
      v.addEventListener('error', tryImage, { once: true });
      v.src = vid;
    } else {
      tryImage();
    }
  }
  var mediaEls = $$('.media[data-img], .media[data-video]');
  if ('IntersectionObserver' in window) {
    var mio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { loadMedia(en.target); mio.unobserve(en.target); } });
    }, { rootMargin: '600px 0px' });
    mediaEls.forEach(function (el) { if (el.hasAttribute('data-eager')) loadMedia(el); else mio.observe(el); });
  } else {
    mediaEls.forEach(loadMedia);
  }

  /* ---------- Testo "decodifica" per le etichette mono ---------- */
  var GLYPHS = '!<>-_/[]{}=+*^?#01';
  function scramble(el, dur) {
    var final = el.getAttribute('data-text') || el.textContent;
    el.setAttribute('data-text', final);
    if (reduce) { el.textContent = final; return; }
    var start = performance.now();
    dur = dur || 700;
    (function frame(now) {
      var p = Math.min(1, (now - start) / dur);
      var out = '';
      for (var i = 0; i < final.length; i++) {
        var c = final[i];
        out += (c === ' ' || i / final.length < p) ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame); else el.textContent = final;
    })(start);
  }
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { scramble(en.target, 800); sio.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    $$('main [data-scramble]').forEach(function (el) { sio.observe(el); });
  }

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (typeof window.Lenis !== 'undefined' && !reduce) {
    lenis = new Lenis({ duration: 1.1, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    if (hasST) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    }
  }
  function scrollTo(target) {
    if (lenis) lenis.scrollTo(target, { offset: -70 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = $(id);
      if (!t) return;
      e.preventDefault();
      closeMenu();
      scrollTo(t);
    });
  });

  /* ---------- Menu mobile ---------- */
  var burger = $('#burger');
  var menu = $('#mobileMenu');
  var menuOpen = false;
  function openMenu() {
    menuOpen = true; menu.hidden = false;
    burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Chiudi menu');
    document.body.style.overflow = 'hidden'; if (lenis) lenis.stop();
    if (hasG && !reduce) gsap.fromTo($$('a', menu), { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: .05, duration: .6, ease: 'power3.out' });
  }
  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false; menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Apri menu');
    document.body.style.overflow = ''; if (lenis) lenis.start();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { menuOpen ? closeMenu() : openMenu(); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) closeMenu(); });
  }

  /* ---------- Hero: titolo diviso in righe ---------- */
  var h1 = $('[data-hero-title]');
  if (h1) {
    h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
    h1.innerHTML = h1.innerHTML.split(/<br\s*\/?>/i).map(function (l) {
      return '<span class="line" aria-hidden="true"><span>' + l.trim() + '</span></span>';
    }).join('');
  }
  var heroLines = $$('.hero h1 .line > span');
  if (hasG && !reduce) gsap.set(heroLines, { yPercent: 110 });

  function heroIn() {
    if (!hasG || reduce) return;
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to(heroLines, { yPercent: 0, duration: 1.2, stagger: .09 })
      .to('[data-hero]', { opacity: 1, y: 0, duration: 1, stagger: .07, ease: 'power3.out' }, .15);
  }

  /* ---------- Intro ---------- */
  function finishIntro() {
    root.classList.remove('intro-on');
    var intro = $('#intro');
    if (intro) intro.classList.add('is-done');
    if (lenis) lenis.start();
    heroIn();
    if (hasST) ScrollTrigger.refresh();
  }
  function runIntro() {
    var intro = $('#intro');
    if (!intro || !root.classList.contains('intro-on') || !hasG || reduce) { finishIntro(); return; }
    try { sessionStorage.setItem('oq-intro', '1'); } catch (e) {}
    if (lenis) lenis.stop();
    var lines = $$('.intro-list span', intro);
    var tl = gsap.timeline({ onComplete: finishIntro });
    tl.from('.intro-logo', { y: 16, opacity: 0, duration: .7, ease: 'power3.out' })
      .to('.intro-line', { scaleX: 1, duration: 1, ease: 'power3.inOut' }, '-=.25')
      .add(function () {
        lines.forEach(function (l, i) { setTimeout(function () { l.style.opacity = 1; scramble(l, 650); }, i * 150); });
      }, '-=.45')
      .to({}, { duration: 1.25 })
      .to(intro, { yPercent: -100, duration: 1, ease: 'power4.inOut' });
  }

  /* ---------- Reveal generici ---------- */
  if (hasST && !reduce) {
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%', once: true,
      onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: 1, stagger: .08, ease: 'power3.out', overwrite: true }); }
    });
  }

  /* ---------- Costo nascosto: cerchi e chip guidati dallo scroll ---------- */
  if (hasST && !reduce && $('.pain')) {
    var chips = $$('.chip');
    gsap.set('.ring', { svgOrigin: '500 500', scale: .4, opacity: 0 });
    gsap.set(chips, { opacity: 0, scale: .85, y: 14, filter: 'blur(6px)' });
    gsap.set('.pain-title', { opacity: .15, scale: .92 });
    var ptl = gsap.timeline({ scrollTrigger: { trigger: '.pain', start: 'top top', end: 'bottom bottom', scrub: .8 } });
    ptl.to('.pain-title', { opacity: 1, scale: 1, duration: 1.2, ease: 'none' }, 0)
      .to('.ring-1', { scale: 1, opacity: 1, rotation: 70, duration: 2.2, ease: 'none' }, 0)
      .to('.ring-2', { scale: 1, opacity: 1, rotation: -50, duration: 2.6, ease: 'none' }, .3)
      .to('.ring-3', { scale: 1, opacity: 1, rotation: 40, duration: 3, ease: 'none' }, .6);
    chips.forEach(function (c, i) {
      ptl.to(c, { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: .7, ease: 'power2.out' }, 1 + i * .6);
    });
    ptl.to('.ring', { scale: 1.2, rotation: '+=35', duration: 2, ease: 'none' }, '>-0.3')
      .to(chips, { y: function (i) { return i % 2 ? 30 : -30; }, duration: 2, ease: 'none' }, '<');
  }

  /* ---------- Card impilate (progetti e servizi) ---------- */
  function stack(selector) {
    if (!hasST || reduce) return;
    var cards = $$(selector);
    cards.forEach(function (card, i) {
      var next = cards[i + 1];
      if (!next) return;
      gsap.to(card, {
        scale: .94, '--shade': .62, ease: 'none',
        scrollTrigger: {
          trigger: next, start: 'top bottom',
          end: function () { return 'top ' + (parseFloat(getComputedStyle(next).top) || 0) + 'px'; },
          scrub: true, invalidateOnRefresh: true
        }
      });
    });
  }
  stack('.case');
  stack('.service');

  /* ---------- Metodo: mini interfacce animate ---------- */
  function typeLoop(el) {
    var phrases = (el.getAttribute('data-type') || '').split('|');
    var p = 0, i = 0, del = false;
    if (reduce) { el.textContent = phrases[0]; return; }
    (function tick() {
      var s = phrases[p];
      el.textContent = s.slice(0, i);
      if (!del && i < s.length) { i++; setTimeout(tick, 42); }
      else if (!del) { del = true; setTimeout(tick, 1500); }
      else if (i > 0) { i--; setTimeout(tick, 18); }
      else { del = false; p = (p + 1) % phrases.length; setTimeout(tick, 300); }
    })();
  }
  function startStep(step) {
    var lines = $$('.ui-lines li', step);
    lines.forEach(function (li, k) { setTimeout(function () { li.classList.add('on'); }, reduce ? 0 : 350 + k * 420); });
    var typed = $('.ui-typed', step);
    if (typed) typeLoop(typed);
    var stats = $('.ui-stats', step);
    if (stats) {
      $$('.ui-bars span', stats).forEach(function (b, k) { b.style.setProperty('--d', k * 70); });
      setTimeout(function () { stats.classList.add('on'); }, reduce ? 0 : 250);
    }
  }
  var steps = $$('[data-step]');
  if ('IntersectionObserver' in window) {
    var stio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { startStep(en.target); stio.unobserve(en.target); } });
    }, { threshold: .35 });
    steps.forEach(function (s) { stio.observe(s); });
  } else steps.forEach(startStep);
  if (hasST && !reduce && steps.length) {
    gsap.from(steps, { y: 60, opacity: 0, duration: 1.1, stagger: .14, ease: 'power3.out', scrollTrigger: { trigger: '.step-grid', start: 'top 85%', once: true } });
  }

  /* ---------- Parallax sfondi + righe tabella ---------- */
  if (hasST && !reduce) {
    gsap.fromTo('.why-bg', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.why', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.cta-bg', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.cmp-row', { opacity: 0, y: 18, duration: .8, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '.compare', start: 'top 85%', once: true } });
    gsap.from('.logo-grid li', { opacity: 0, duration: .8, stagger: { each: .05, from: 'random' }, ease: 'power2.out', scrollTrigger: { trigger: '.logo-grid', start: 'top 88%', once: true } });
  }

  /* ---------- Contatori ---------- */
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
    if (reduce) { el.textContent = fmt(to); return; }
    var start = performance.now(), dur = 1600;
    (function f(now) {
      var p = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(f);
    })(start);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); } });
    }, { threshold: .6 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Slider recensioni ---------- */
  var track = $('#reviewTrack');
  if (track) {
    var prev = $('[data-slide="-1"]'), nextB = $('[data-slide="1"]');
    var stepW = function () { var c = track.children[0]; return c ? c.getBoundingClientRect().width + 18 : 300; };
    var upd = function () {
      prev.disabled = track.scrollLeft < 8;
      nextB.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    };
    prev.addEventListener('click', function () { track.scrollBy({ left: -stepW(), behavior: reduce ? 'auto' : 'smooth' }); });
    nextB.addEventListener('click', function () { track.scrollBy({ left: stepW(), behavior: reduce ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  /* ---------- FAQ: accordion con altezza animata, una risposta aperta alla volta ---------- */
  var qas = $$('.qa');
  function animateQa(d, open) {
    var body = $('.qa-body', d);
    if (!hasG || reduce) { d.open = open; return; }
    if (open) {
      d.open = true;
      gsap.fromTo(body, { height: 0 }, { height: body.scrollHeight, duration: .45, ease: 'power3.out', clearProps: 'height', onComplete: refresh });
    } else {
      gsap.to(body, { height: 0, duration: .35, ease: 'power3.inOut', onComplete: function () { d.open = false; gsap.set(body, { clearProps: 'height' }); refresh(); } });
    }
  }
  function refresh() { if (hasST) ScrollTrigger.refresh(); }
  qas.forEach(function (d) {
    $('summary', d).addEventListener('click', function (e) {
      e.preventDefault();
      var willOpen = !d.open;
      if (willOpen) qas.forEach(function (o) { if (o !== d && o.open) animateQa(o, false); });
      animateQa(d, willOpen);
    });
  });

  /* ---------- Avvio ---------- */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh);
  runIntro();
})();
