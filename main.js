// CANVAS — bootstrap: chrome, motion preference, walk and sections.
import { initWalk } from './walk.js';
import { initSections } from './sections.js';
import { setMotion } from './art.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) root.classList.add('reduced');
setMotion(!reduced);

function initChrome() {
  const header = $('[data-header]');
  const onScroll = () => header.classList.toggle('is-solid', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const btn = $('[data-menu-btn]'), menu = $('#menu');
  const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); root.classList.remove('menu-open'); };
  btn.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    root.classList.toggle('menu-open', open);
    if (open) $('a', menu).focus();
  });
  $$('a', menu).forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { close(); btn.focus(); } });
  addEventListener('resize', () => { if (innerWidth >= 960 && !menu.hidden) close(); });

  // gallery reveals: a slow curtain lifts off each heading and block
  const els = $$('.h2, .kicker, .cat-filters, .artist-list li, .studio-stage, .visit-info, .book-form');
  if (reduced || !('IntersectionObserver' in window)) return;
  els.forEach((e) => e.classList.add('rv'));
  const io = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((e) => io.observe(e));
}

initChrome();
let sections = null;
const walk = initWalk({ reduced, onOpen: (id, seed, opener) => sections && sections.openWork(id, seed, opener) });
sections = initSections({ reduced, walk });
requestAnimationFrame(() => root.classList.add('is-ready'));
