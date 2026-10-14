/* Shared project disclosure: hover, keyboard and touch. */
(() => {
  const menu = document.querySelector('.project-menu');
  if (!menu) return;
  const toggle = menu.querySelector('.project-toggle');
  const panel = menu.querySelector('.project-dropdown');
  let timer;
  let clickOpen = false;
  let hovering = false;
  function setOpen(open) {
    clearTimeout(timer);
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Chiudi categorie progetti' : 'Apri categorie progetti');
    if (!open) clickOpen = false;
  }
  menu.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') { hovering = true; setOpen(true); }
  });
  menu.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') {
      hovering = false;
      timer = setTimeout(() => {
        if (!menu.contains(document.activeElement)) setOpen(false);
      }, 160);
    }
  });
  toggle.addEventListener('click', () => {
    const open = !clickOpen;
    setOpen(open);
    clickOpen = open;
  });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault(); setOpen(false); toggle.focus();
    }
    if (event.key === 'ArrowDown' && event.target === toggle) {
      event.preventDefault(); setOpen(true); panel.querySelector('a').focus();
    }
  });
  menu.addEventListener('focusout', () => setTimeout(() => {
    if (!hovering && !menu.contains(document.activeElement)) setOpen(false);
  }, 0));
  document.addEventListener('click', event => {
    if (!menu.contains(event.target)) setOpen(false);
  });
})();
