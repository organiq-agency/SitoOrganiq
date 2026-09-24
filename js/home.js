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
      var mob = el.getAttribute('data-video-mobile');
      v.src = (mob && window.innerWidth < 900) ? mob : vid;
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
    // scroll volutamente "pesante": interpolazione lenta = movimento fluido e morbido
    lenis = new Lenis({ lerp: 0.06, wheelMultiplier: 0.9, touchMultiplier: 1.4, smoothWheel: true });
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
    if (!hasG || reduce) { initDistort(); return; }
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' }, onComplete: initDistort });
    tl.to(heroLines, { yPercent: 0, duration: 1.2, stagger: .09 })
      .to('[data-hero]', { opacity: 1, y: 0, duration: 1, stagger: .07, ease: 'power3.out' }, .15);
  }

  /* ---------- Intro ---------- */
  function finishIntro() {
    root.classList.remove('intro-on');
    var intro = $('#intro');
    if (intro) intro.classList.add('is-done');
    if (lenis) lenis.start();
    var hv = $('.hero-bg video');
    if (hv) { try { hv.currentTime = 0; var pp = hv.play(); if (pp && pp.catch) pp.catch(function () {}); } catch (e) {} }
    heroIn();
    if (hasST) ScrollTrigger.refresh();
  }

  /* Preloader: il logo Organiq si costruisce (anello, ali, becco, scritta) mentre carica il video */
  function heroReady() {
    return new Promise(function (resolve) {
      var t0 = performance.now();
      (function check() {
        var bg = $('.hero-bg');
        if ((bg && bg.classList.contains('is-loaded')) || performance.now() - t0 > 4200) resolve();
        else setTimeout(check, 100);
      })();
    });
  }
  function runIntro() {
    var intro = $('#intro');
    if (!intro || !root.classList.contains('intro-on') || !hasG || reduce) { finishIntro(); return; }
    if (lenis) lenis.stop();
    var ring = $('.im-ring', intro), pct = $('.intro-pct', intro);
    var C = 2 * Math.PI * 124.4;
    var prog = { v: 0 };
    var setPct = function () { pct.textContent = Math.round(prog.v); };
    gsap.set(ring, { strokeDasharray: C, strokeDashoffset: C, strokeWidth: 5 });
    gsap.set('.im-wing-l', { scale: 0, rotation: 40, transformOrigin: '95% 10%' });
    gsap.set('.im-wing-r', { scale: 0, rotation: -40, transformOrigin: '5% 10%' });
    gsap.set('.im-beak', { y: -70, opacity: 0, transformOrigin: '50% 50%' });
    gsap.set('.intro-word span', { yPercent: 115 });
    var ready = heroReady();

    var build = gsap.timeline();
    build.to(ring, { strokeDashoffset: 0, duration: .95, ease: 'power2.inOut' })
      .to(ring, { strokeWidth: 42, duration: .5, ease: 'power3.out' }, '-=.12')
      .to('.im-wing', { scale: 1, rotation: 0, duration: .7, ease: 'back.out(2.2)', stagger: .07 }, '-=.28')
      .to('.im-beak', { y: 0, opacity: 1, duration: .75, ease: 'bounce.out' }, '-=.45')
      .to('.intro-word span', { yPercent: 0, duration: .8, ease: 'power4.out', stagger: .04 }, '-=.55')
      .to(prog, { v: 88, duration: 2.4, ease: 'power1.out', onUpdate: setPct }, 0)
      .to('.intro-bar', { scaleX: .88, duration: 2.4, ease: 'power1.out' }, 0);

    var breathe = null;
    Promise.all([ready, new Promise(function (r) {
      build.eventCallback('onComplete', function () {
        // se il video non è ancora pronto, il logo "respira" in attesa
        breathe = gsap.to('.intro-mark', { scale: 1.05, duration: .9, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%' });
        r();
      });
    })]).then(function () {
      if (breathe) { breathe.kill(); gsap.to('.intro-mark', { scale: 1, duration: .25 }); }
      gsap.timeline({ onComplete: finishIntro })
        .to(prog, { v: 100, duration: .35, ease: 'none', onUpdate: setPct })
        .to('.intro-bar', { scaleX: 1, duration: .35, ease: 'none' }, '<')
        .to('.intro-center', { scale: .92, opacity: 0, duration: .55, ease: 'power3.in' }, '+=.1')
        .to('.intro-foot', { opacity: 0, duration: .3 }, '<')
        .to(intro, { yPercent: -100, duration: 1, ease: 'power4.inOut' }, '-=.15');
    });
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


  /* ---------- Clienti: una casella alla volta si illumina, in loop ---------- */
  (function () {
    var cells = $$('.logo-grid li');
    if (!cells.length || reduce) return;
    var i = -1, timer = null;
    function step() {
      cells.forEach(function (c) { c.classList.remove('is-lit'); });
      i = (i + 1) % cells.length;
      cells[i].classList.add('is-lit');
    }
    function start() { if (!timer) { step(); timer = setInterval(step, 1000); } }
    function stop() { clearInterval(timer); timer = null; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }, { threshold: .2 }).observe($('.logo-grid'));
    } else start();
  })();

  /* ---------- Cursore personalizzato ---------- */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  (function () {
    var cur = $('#cursor');
    if (!cur || !fine) { if (cur) cur.remove(); return; }
    root.classList.add('has-cursor');
    var ring = $('.cursor-ring', cur), dot = $('.cursor-dot', cur), label = $('.cursor-label', cur);
    var mx = -100, my = -100, rx = -100, ry = -100, shown = false;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!shown) { shown = true; rx = mx; ry = my; cur.classList.add('is-on'); }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); shown = false; });
    document.addEventListener('mousedown', function () { cur.classList.add('is-down'); });
    document.addEventListener('mouseup', function () { cur.classList.remove('is-down'); });
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest ? e.target.closest('[data-cursor], a, button, summary, #h1Wrap') : null;
      cur.classList.remove('is-hover', 'is-label', 'is-lens');
      label.textContent = '';
      if (!t) return;
      if (t.id === 'h1Wrap') cur.classList.add('is-lens');
      else if (t.hasAttribute('data-cursor')) { cur.classList.add('is-label'); label.textContent = t.getAttribute('data-cursor'); }
      else cur.classList.add('is-hover');
    });
    (function loop() {
      var k = reduce ? 1 : .16;
      rx += (mx - rx) * k; ry += (my - ry) * k;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      requestAnimationFrame(loop);
    })();
  })();

  /* ---------- Headline: distorsione WebGL al passaggio del mouse ---------- */
  function initDistort() {
    var wrap = $('#h1Wrap'), h1 = wrap && $('h1', wrap);
    if (!wrap || !h1 || !fine || reduce || wrap.__gl) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'h1-gl';
    canvas.setAttribute('aria-hidden', 'true');
    var gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) return;
    wrap.__gl = true;
    wrap.appendChild(canvas);

    var VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
    var FS = [
      'precision highp float;varying vec2 v;uniform sampler2D t;uniform vec2 m;uniform vec2 vel;uniform float h;uniform float time;uniform float asp;',
      'void main(){',
      ' vec2 uv=v; vec2 d=uv-m; d.x*=asp; float dist=length(d);',
      ' float f=smoothstep(.42,0.,dist)*h;',
      ' vec2 dir=dist>.0001?d/dist:vec2(0.); dir.x/=asp;',
      ' uv-=dir*f*.045;',
      ' uv+=vec2(sin(uv.y*46.+time*5.)*.007,cos(uv.x*28.+time*4.)*.005)*f;',
      ' uv-=vel*f*1.1;',
      ' vec2 ca=(vel*3.+dir*.008)*f;',
      ' float r=texture2D(t,uv+ca).a; float g=texture2D(t,uv).a; float b=texture2D(t,uv-ca).a;',
      ' vec3 mint=vec3(.094,.906,.737);',
      ' vec3 col=vec3(1.)*g+mint*max(r-g,0.)+vec3(.55,.65,1.)*max(b-g,0.)*.5;',
      ' gl_FragColor=vec4(col,max(g,max(r,b)));',
      '}'
    ].join('\n');
    function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; }
    var prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['t', 'm', 'vel', 'h', 'time', 'asp'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    var PAD = 70, W = 0, H = 0;
    var txt = document.createElement('canvas'), ctx = txt.getContext('2d');
    function paint() {
      var r = h1.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width + PAD * 2; H = r.height + PAD * 2;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      canvas.style.left = -PAD + 'px'; canvas.style.top = -PAD + 'px';
      canvas.width = txt.width = Math.round(W * dpr);
      canvas.height = txt.height = Math.round(H * dpr);
      var cs = getComputedStyle(h1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      if ('letterSpacing' in ctx) ctx.letterSpacing = cs.letterSpacing;
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'alphabetic';
      $$('.line > span', h1).forEach(function (sp) {
        var lr = sp.getBoundingClientRect(), text = sp.textContent;
        var mt = ctx.measureText(text);
        var asc = mt.fontBoundingBoxAscent || parseFloat(cs.fontSize) * .95;
        var desc = mt.fontBoundingBoxDescent || parseFloat(cs.fontSize) * .25;
        var y = lr.top - r.top + PAD + (lr.height - (asc + desc)) / 2 + asc;
        ctx.fillText(text, lr.left - r.left + PAD, y);
      });
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, txt);
      gl.uniform1i(U.t, 0);
      gl.uniform1f(U.asp, W / H);
      render(performance.now());
    }
    var mouse = { x: .5, y: .5 }, target = { x: .5, y: .5 }, vel = { x: 0, y: 0 }, hov = 0, hovT = 0, running = false;
    function render(now) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.m, mouse.x, mouse.y);
      gl.uniform2f(U.vel, vel.x, vel.y);
      gl.uniform1f(U.h, hov);
      gl.uniform1f(U.time, now / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function tick(now) {
      var px = mouse.x, py = mouse.y;
      mouse.x += (target.x - mouse.x) * .14; mouse.y += (target.y - mouse.y) * .14;
      vel.x += ((mouse.x - px) - vel.x) * .25; vel.y += ((mouse.y - py) - vel.y) * .25;
      hov += (hovT - hov) * .08;
      render(now);
      if (hovT > 0 || hov > .002 || Math.abs(vel.x) + Math.abs(vel.y) > .0005) requestAnimationFrame(tick);
      else { hov = 0; vel.x = vel.y = 0; render(now); running = false; }
    }
    function kick() { if (!running) { running = true; requestAnimationFrame(tick); } }
    window.addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      var inside = e.clientX > r.left + PAD * .5 && e.clientX < r.right - PAD * .5 && e.clientY > r.top + PAD * .5 && e.clientY < r.bottom - PAD * .5;
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
      hovT = inside ? 1 : 0;
      if (inside || hov > .002) kick();
    }, { passive: true });
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(paint, 150); });
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(function () { paint(); wrap.classList.add('gl-on'); });
  }

  /* ---------- Avvio ---------- */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh);
  runIntro();
})();
