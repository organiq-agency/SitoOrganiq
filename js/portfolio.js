/* Video sources and metrics: edit data/portfolio.json, then run scripts/build-portfolio.py. */
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.video-carousel').forEach(carousel => {
    const track = carousel.querySelector('.video-track');
    const prev = carousel.querySelector('[data-step="-1"]');
    const next = carousel.querySelector('[data-step="1"]');
    const sync = () => {
      prev.disabled = track.scrollLeft < 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    [prev, next].forEach(button => button.addEventListener('click', () => {
      track.scrollBy({left: Number(button.dataset.step) * (track.firstElementChild.getBoundingClientRect().width + 20), behavior: motion.matches ? 'instant' : 'smooth'});
    }));
    track.addEventListener('scroll', sync, {passive:true});
    new ResizeObserver(sync).observe(track); sync();
  });
  document.querySelectorAll('.video-launch').forEach(button => button.addEventListener('click', () => {
    // Keep one active player; the cover stays available when it closes.
    document.querySelectorAll('.video-stage iframe').forEach(frame => {
      frame.previousElementSibling.hidden = false;
      frame.remove();
    });
    const frame = document.createElement('iframe');
    frame.src = button.dataset.embed;
    frame.title = button.getAttribute('aria-label');
    frame.allow = 'fullscreen; encrypted-media; picture-in-picture';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    button.hidden = true;
    button.after(frame);
    frame.focus();
  }));
})();
