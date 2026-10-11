// CANVAS — the exhibition walk: rooms built from data, pinned horizontal travel, minimap, lazy painting.
import { WORKS, ROOMS, artistOf } from './data.js';
import { paint, bindPointer, LIVE } from './art.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function workFigure(w) {
  const a = artistOf(w);
  return `<figure class="work" data-work="${w.id}" style="--ar:${w.aspect}">
    <div class="frame${LIVE.has(w.algo) ? ' is-live' : ''}"><canvas aria-hidden="true"></canvas></div>
    <figcaption class="label">
      <p class="lb-no">${w.no}</p>
      <p class="lb-artist">${esc(a.name)} <span>b. ${a.born}</span></p>
      <p class="lb-title"><i>${esc(w.title)}</i>, ${w.year}</p>
      <p class="lb-medium">Generative code, drawn live · seed <b data-seed>${w.seed}</b></p>
      <p class="lb-text">${esc(w.text)}</p>
      <p class="lb-actions"><button type="button" class="lb-btn" data-regen aria-label="Redraw ${esc(w.title)} with a new seed">Redraw</button><button type="button" class="lb-btn lb-open" data-open aria-label="View details of ${esc(w.title)}">Details</button></p>
    </figcaption>
  </figure>`;
}

function roomMarkup(R) {
  const works = WORKS.filter((w) => w.room === R.n);
  const own = R.n === 6 ? `<figure class="work work-you" data-work="you" style="--ar:1">
      <div class="frame frame-empty"><canvas aria-hidden="true"></canvas><p class="empty-note" data-you-empty>This wall is waiting for you.</p></div>
      <figcaption class="label">
        <p class="lb-no">11</p>
        <p class="lb-artist" data-you-artist>You <span>visitor</span></p>
        <p class="lb-title" data-you-title><i>Not yet made</i></p>
        <p class="lb-medium" data-you-medium>Generative code, drawn live</p>
        <p class="lb-text">Open the studio, choose a recipe, and hang the result on this wall. It stays for as long as this tab is open.</p>
        <p class="lb-actions"><a class="lb-btn" href="#studio">Go to the studio</a></p>
      </figcaption>
    </figure>` : '';
  return `<article class="room wall-${R.wall}" data-room="${R.n}" aria-labelledby="room-${R.n}-t">
    <header class="room-head">
      <p class="room-no" aria-hidden="true">${R.numeral}</p>
      <h2 class="room-t" id="room-${R.n}-t"><span class="room-k">Room ${R.numeral}</span>${esc(R.name)}</h2>
      <p class="room-intro">${esc(R.intro)}</p>
      ${R.n === 6 ? '<p class="room-exit"><a href="#catalogue">Continue to the catalogue ↓</a></p>' : ''}
    </header>
    ${works.map(workFigure).join('')}${own}
    <span class="bench" aria-hidden="true"></span>
  </article>`;
}

export function initWalk({ reduced, onOpen }) {
  const sec = $('#exhibition'), track = $('[data-track]');
  track.insertAdjacentHTML('beforeend', ROOMS.slice(1).map(roomMarkup).join(''));
  const rooms = $$('.room', track);
  const goBtns = $$('[data-go]');
  const label = $('[data-room-label]');
  const seeds = new Map(WORKS.map((w) => [w.id, w.seed]));
  let you = null;
  try { you = JSON.parse(sessionStorage.getItem('cv-you') || 'null'); } catch (_) { you = null; }

  const specOf = (id) => { const w = WORKS.find((x) => x.id === id); return { ...w, seed: seeds.get(id) }; };
  const painted = new Set();
  function paintRoom(room) {
    if (painted.has(room)) return;
    painted.add(room);
    $$('.work', room).forEach((fig) => {
      const id = fig.dataset.work, canvas = $('canvas', fig);
      if (id === 'you') { if (you) paintYou(); return; }
      paint(canvas, specOf(id), { reduced });
      if (LIVE.has(specOf(id).algo)) bindPointer(canvas);
    });
  }
  function paintYou() {
    const fig = $('[data-work="you"]', track);
    if (!fig || !you) return;
    fig.querySelector('.frame').classList.remove('frame-empty');
    $('[data-you-empty]', fig).hidden = true;
    $('[data-you-title]', fig).innerHTML = `<i>${esc(you.title)}</i>, ${new Date().getFullYear()}`;
    $('[data-you-medium]', fig).innerHTML = `Generative code, drawn live · seed <b>${you.seed}</b>`;
    const canvas = $('canvas', fig);
    paint(canvas, you, { reduced });
    if (LIVE.has(you.algo)) bindPointer(canvas);
  }

  // regenerate / open
  track.addEventListener('click', (e) => {
    const fig = e.target.closest('.work');
    if (!fig || fig.dataset.work === 'you') return;
    const id = fig.dataset.work;
    const isCanvas = e.target.tagName === 'CANVAS';
    if (e.target.closest('[data-regen]') || (isCanvas && specOf(id).algo !== 'constellation')) {
      const s = Math.floor(Math.random() * 99999) + 1;
      seeds.set(id, s);
      $('[data-seed]', fig).textContent = String(s);
      paint($('canvas', fig), specOf(id), { reduced });
    }
    if (e.target.closest('[data-open]')) onOpen(id, seeds.get(id), e.target.closest('[data-open]'));
  });
  const poster = $('[data-poster]');
  let posterSeed = Math.floor(Math.random() * 9999) + 1;
  const drawPoster = () => paint(poster, { algo: 'bauhaus', palette: 'gallery', seed: posterSeed, params: { density: 0.25, chaos: 0.6 } }, { reduced });
  const posterBtn = $('[data-poster-btn]');
  posterBtn.addEventListener('click', () => { posterSeed = Math.floor(Math.random() * 9999) + 1; drawPoster(); });

  // travel
  const wideQ = matchMedia('(min-width: 900px)');
  let pinned = false, dist = 0, secTop = 0, current = -1, x = 0;
  function layout() {
    pinned = !!(wideQ.matches && !reduced);
    sec.classList.toggle('is-pinned', pinned);
    if (pinned) {
      track.style.transform = '';
      dist = Math.max(0, track.scrollWidth - innerWidth);
      sec.style.height = `${innerHeight + dist}px`;
    } else { sec.style.height = ''; track.style.transform = ''; }
    secTop = sec.getBoundingClientRect().top + scrollY;
    update();
  }
  function setCurrent(i) {
    if (i === current) return;
    current = i;
    goBtns.forEach((b, k) => { if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    const R = ROOMS[i];
    if (label) label.textContent = i === 0 ? 'Entrance' : `Room ${R.numeral} · ${R.name}`;
    $('[data-prev]').disabled = i === 0;
    $$('[data-next]').forEach((b) => { b.disabled = i === rooms.length - 1; });
    sec.dataset.room = String(i);
  }
  function update() {
    const vw = innerWidth;
    if (pinned) {
      x = Math.min(dist, Math.max(0, scrollY - secTop));
      track.style.transform = `translate3d(${(-x).toFixed(1)}px,0,0)`;
    } else x = track.scrollLeft;
    const probe = x + vw * 0.45;
    let idx = 0;
    rooms.forEach((r, i) => {
      const left = r.offsetLeft, right = left + r.offsetWidth;
      if (probe >= left) idx = i;
      if (right > x - vw * 0.6 && left < x + vw * 1.6) paintRoom(r);
      if (pinned && !reduced) {
        const head = r.firstElementChild;
        if (head && right > x - vw && left < x + vw * 2) head.style.transform = `translate3d(${((left - x) * -0.14).toFixed(1)}px,0,0)`;
      }
    });
    setCurrent(idx);
    const bar = $('[data-walk-bar]');
    if (bar) bar.style.setProperty('--p', String(pinned ? (dist ? x / dist : 0) : (track.scrollWidth - track.clientWidth ? x / (track.scrollWidth - track.clientWidth) : 0)));
  }
  function goTo(i, smooth = true) {
    i = Math.max(0, Math.min(rooms.length - 1, i));
    const left = rooms[i].offsetLeft;
    const behavior = smooth && !reduced ? 'smooth' : 'auto';
    if (pinned) window.scrollTo({ top: secTop + Math.min(dist, left), behavior });
    else { track.scrollTo({ left, behavior }); if (sec.getBoundingClientRect().top < -40 || sec.getBoundingClientRect().top > 40) sec.scrollIntoView({ behavior, block: 'start' }); }
  }
  goBtns.forEach((b, i) => b.addEventListener('click', () => goTo(i)));
  $('[data-prev]').addEventListener('click', () => goTo(current - 1));
  $$('[data-next]').forEach((b) => b.addEventListener('click', () => goTo(current + 1)));
  sec.addEventListener('keydown', (e) => {
    if (e.target.matches('input, select, textarea')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
  });
  track.addEventListener('focusin', (e) => {
    const room = e.target.closest('.room');
    if (!room) return;
    const i = rooms.indexOf(room);
    const left = room.offsetLeft, right = left + room.offsetWidth;
    const el = e.target.getBoundingClientRect();
    if (pinned && (el.left < 0 || el.right > innerWidth)) {
      const target = Math.min(dist, Math.max(0, x + el.left - innerWidth * 0.3));
      window.scrollTo({ top: secTop + target, behavior: 'auto' });
    } else if (i !== current && (left > x + innerWidth || right < x)) goTo(i, false);
  });
  addEventListener('scroll', () => { if (pinned) update(); }, { passive: true });
  track.addEventListener('scroll', () => { if (!pinned) update(); }, { passive: true });
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); painted.clear(); update(); drawPoster(); }, 160); });
  wideQ.addEventListener('change', layout);

  // drag-to-walk on desktop pointer (non-pinned mobile uses native swipe)
  let drag = null;
  track.addEventListener('pointerdown', (e) => { if (!pinned || e.pointerType !== 'mouse' || e.target.closest('button, a, canvas')) return; drag = { x: e.clientX, y: scrollY }; track.classList.add('is-dragging'); });
  addEventListener('pointermove', (e) => { if (drag) window.scrollTo({ top: drag.y - (e.clientX - drag.x) * 1.4, behavior: 'auto' }); });
  addEventListener('pointerup', () => { drag = null; track.classList.remove('is-dragging'); });

  drawPoster();
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layout());

  return {
    goTo, specOf,
    roomIndexOf: (n) => n,
    hang(spec) {
      you = spec;
      try { sessionStorage.setItem('cv-you', JSON.stringify(spec)); } catch (_) { /* session storage unavailable */ }
      paintYou();
    }
  };
}
