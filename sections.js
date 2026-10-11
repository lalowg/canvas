// CANVAS — detail views, catalogue, artists, studio and booking.
import { WORKS, ARTISTS, ROOMS, PALETTES, RECIPES, artistOf, roomName } from './data.js';
import { paint, bindPointer, LIVE } from './art.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const newSeed = () => Math.floor(Math.random() * 99999) + 1;

// ---------- dialogs ----------
function openDialog(d, opener) {
  d._opener = opener || document.activeElement;
  if (typeof d.showModal === 'function') { if (!d.open) d.showModal(); } else d.setAttribute('open', '');
  document.documentElement.classList.add('dialog-open');
}
function closeDialog(d) {
  if (typeof d.close === 'function' && d.open) d.close(); else d.removeAttribute('open');
  document.documentElement.classList.remove('dialog-open');
  const o = d._opener;
  if (o && o.isConnected && typeof o.focus === 'function') o.focus();
}
function wireDialog(d) {
  $$('[data-close]', d).forEach((b) => b.addEventListener('click', () => closeDialog(d)));
  d.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(d); });
  d.addEventListener('click', (e) => { if (e.target === d) closeDialog(d); });
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && typeof d.showModal !== 'function') closeDialog(d); });
}

export function initSections({ reduced, walk }) {
  const detail = $('#detail'), artistD = $('#artist-dialog');
  wireDialog(detail); wireDialog(artistD);
  let cur = null;

  const dCanvas = $('[data-dt-canvas]', detail);
  bindPointer(dCanvas);
  const dDensity = $('#dt-density'), dChaos = $('#dt-chaos'), dPalette = $('#dt-palette');
  dPalette.innerHTML = Object.entries(PALETTES).map(([k, p]) => `<option value="${k}">${p.name}</option>`).join('');
  const drawDetail = (reveal = true) => {
    if (!cur) return;
    $('[data-dt-seed]', detail).textContent = String(cur.seed);
    const art = $('.dt-art', detail);
    art.style.setProperty('--ar', String(cur.aspect));
    requestAnimationFrame(() => paint(dCanvas, cur, { reduced, reveal }));
  };
  function openWork(id, seed, opener) {
    const w = WORKS.find((x) => x.id === id);
    const a = artistOf(w);
    cur = { ...w, seed: seed || w.seed, params: { ...w.params } };
    $('[data-dt-room]', detail).textContent = `${roomName(w.room)} · No. ${w.no}`;
    $('[data-dt-title]', detail).textContent = w.title;
    const ab = $('[data-dt-artist]', detail);
    ab.textContent = a.name; ab.dataset.artist = a.id;
    $('[data-dt-year]', detail).textContent = `${w.year} · generative code, drawn live`;
    $('[data-dt-text]', detail).textContent = w.text;
    dDensity.value = String(Math.round(cur.params.density * 100));
    dChaos.value = String(Math.round(cur.params.chaos * 100));
    dPalette.value = w.palette;
    $('[data-dt-hint]', detail).hidden = !LIVE.has(w.algo);
    if (artistD.open) closeDialog(artistD);
    openDialog(detail, opener);
    drawDetail();
  }
  const onParam = () => {
    if (!cur) return;
    cur.params = { density: Number(dDensity.value) / 100, chaos: Number(dChaos.value) / 100 };
    cur.palette = dPalette.value;
    drawDetail(false);
  };
  [dDensity, dChaos].forEach((el) => el.addEventListener('change', onParam));
  [dDensity, dChaos].forEach((el) => el.addEventListener('input', () => { clearTimeout(el._t); el._t = setTimeout(onParam, 120); }));
  dPalette.addEventListener('change', onParam);
  $('[data-dt-regen]', detail).addEventListener('click', () => { if (cur) { cur.seed = newSeed(); drawDetail(); } });
  $('[data-dt-reset]', detail).addEventListener('click', () => { if (!cur) return; const w = WORKS.find((x) => x.id === cur.id); cur = { ...w, params: { ...w.params } }; dDensity.value = String(w.params.density * 100); dChaos.value = String(w.params.chaos * 100); dPalette.value = w.palette; drawDetail(); });
  $('[data-dt-artist]', detail).addEventListener('click', (e) => { const id = e.currentTarget.dataset.artist; closeDialog(detail); openArtist(id, document.querySelector(`[data-artist-row="${id}"]`)); });

  function openArtist(id, opener) {
    const a = ARTISTS.find((x) => x.id === id);
    const works = WORKS.filter((w) => w.artist === id);
    $('[data-ad-name]', artistD).textContent = a.name;
    $('[data-ad-meta]', artistD).textContent = `Born ${a.born} · ${a.base} · ${a.practice}`;
    $('[data-ad-bio]', artistD).textContent = a.bio;
    const list = $('[data-ad-works]', artistD);
    list.innerHTML = works.map((w) => `<li><button type="button" class="ad-work" data-work-open="${w.id}" style="--ar:${w.aspect}"><span class="ad-thumb"><canvas aria-hidden="true"></canvas></span><span class="ad-cap"><i>${esc(w.title)}</i>, ${w.year}<small>${esc(roomName(w.room))}</small></span></button></li>`).join('');
    openDialog(artistD, opener);
    requestAnimationFrame(() => $$('.ad-work', list).forEach((b) => { const w = WORKS.find((x) => x.id === b.dataset.workOpen); paint($('canvas', b), w, { reduced, reveal: false }); }));
    $$('.ad-work', list).forEach((b) => b.addEventListener('click', () => { closeDialog(artistD); openWork(b.dataset.workOpen, null, document.querySelector(`.cat-item[data-id="${b.dataset.workOpen}"]`)); }));
  }

  // ---------- catalogue ----------
  const grid = $('[data-cat-grid]');
  grid.innerHTML = WORKS.map((w) => {
    const a = artistOf(w);
    return `<li class="cat-cell" data-room="${w.room}" data-palette="${w.palette}"><button type="button" class="cat-item" data-id="${w.id}" style="--ar:${w.aspect}" aria-label="${esc(w.title)} by ${esc(a.name)}, ${w.year}. View details">
      <span class="cat-thumb"><canvas aria-hidden="true"></canvas></span>
      <span class="cat-cap"><span class="cat-no">${w.no}</span><span class="cat-title"><i>${esc(w.title)}</i></span><span class="cat-artist">${esc(a.name)}, ${w.year}</span><span class="cat-room">${esc(roomName(w.room))}</span></span>
    </button></li>`;
  }).join('');
  const cells = $$('.cat-cell', grid);
  const thumbsDone = new Set();
  const paintThumb = (cell) => { if (thumbsDone.has(cell)) return; thumbsDone.add(cell); const w = WORKS.find((x) => x.id === $('.cat-item', cell).dataset.id); paint($('canvas', cell), w, { reduced }); };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { paintThumb(e.target); io.unobserve(e.target); } }), { rootMargin: '200px' });
    cells.forEach((c) => io.observe(c));
  } else cells.forEach(paintThumb);
  grid.addEventListener('click', (e) => { const b = e.target.closest('.cat-item'); if (b) openWork(b.dataset.id, null, b); });
  const filt = { room: 'all', palette: 'all' };
  const count = $('[data-cat-count]');
  function applyFilter() {
    const first = new Map(cells.map((c) => [c, c.getBoundingClientRect()]));
    let shown = 0;
    cells.forEach((c) => {
      const ok = (filt.room === 'all' || c.dataset.room === filt.room) && (filt.palette === 'all' || c.dataset.palette === filt.palette);
      c.hidden = !ok;
      if (ok) shown++;
    });
    count.textContent = shown ? `Showing ${shown} of ${WORKS.length} works` : 'No works match these filters. Try another room or palette.';
    if (reduced) return;
    cells.forEach((c) => {
      if (c.hidden) return;
      const a = first.get(c), b = c.getBoundingClientRect();
      if (!a || (!a.width && !a.height)) { c.animate && c.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)' }); paintThumb(c); return; }
      const dx = a.left - b.left, dy = a.top - b.top;
      if ((dx || dy) && c.animate) c.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,.7,.2,1)' });
    });
  }
  $$('[data-filter]').forEach((b) => b.addEventListener('click', () => {
    const key = b.dataset.filter;
    filt[key] = b.dataset.value;
    $$(`[data-filter="${key}"]`).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    applyFilter();
  }));
  count.textContent = `Showing ${WORKS.length} of ${WORKS.length} works`;

  // ---------- artists index ----------
  const list = $('[data-artist-list]');
  list.innerHTML = ARTISTS.map((a, i) => {
    const n = WORKS.filter((w) => w.artist === a.id).length;
    return `<li><button type="button" class="artist-row" data-artist-row="${a.id}"><span class="ar-no">${String(i + 1).padStart(2, '0')}</span><span class="ar-name">${esc(a.name)}</span><span class="ar-practice">${esc(a.practice)}</span><span class="ar-base">${esc(a.base)}</span><span class="ar-count">${n} work${n > 1 ? 's' : ''}</span></button></li>`;
  }).join('');
  const peek = $('[data-peek]');
  const peekCanvas = $('canvas', peek);
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  list.addEventListener('click', (e) => { const b = e.target.closest('.artist-row'); if (b) openArtist(b.dataset.artistRow, b); });
  if (fine) {
    let shownFor = null;
    list.addEventListener('pointermove', (e) => {
      const b = e.target.closest('.artist-row');
      if (!b) { peek.classList.remove('is-on'); shownFor = null; return; }
      if (shownFor !== b.dataset.artistRow) {
        shownFor = b.dataset.artistRow;
        const w = WORKS.find((x) => x.artist === shownFor);
        peek.style.setProperty('--ar', String(w.aspect));
        paint(peekCanvas, w, { reduced, reveal: false, size: { width: 220, height: 220 / w.aspect } });
      }
      peek.style.transform = `translate3d(${e.clientX + 24}px, ${e.clientY - 80}px, 0)`;
      peek.classList.add('is-on');
    });
    list.addEventListener('pointerleave', () => { peek.classList.remove('is-on'); shownFor = null; });
  }

  // ---------- studio ----------
  const sCanvas = $('[data-studio-canvas]');
  bindPointer(sCanvas);
  const recipeWrap = $('[data-recipes]');
  recipeWrap.innerHTML = RECIPES.map((r, i) => `<label class="chip"><input type="radio" name="recipe" value="${r.algo}"${i === 0 ? ' checked' : ''}><span>${r.name}</span></label>`).join('');
  const sPal = $('#s-palette');
  sPal.innerHTML = Object.entries(PALETTES).map(([k, p]) => `<option value="${k}">${p.name}</option>`).join('');
  const sDensity = $('#s-density'), sChaos = $('#s-chaos'), sSeed = $('#s-seed'), sTitle = $('#s-title');
  let studio = { algo: 'flow', palette: 'gallery', seed: newSeed(), params: { density: 0.5, chaos: 0.5 }, aspect: 1 };
  sSeed.value = String(studio.seed);
  const readStudio = () => {
    studio = {
      algo: ($('input[name="recipe"]:checked', recipeWrap) || {}).value || 'flow',
      palette: sPal.value,
      seed: Math.max(1, Math.min(99999, Math.round(Number(sSeed.value) || 1))),
      params: { density: Number(sDensity.value) / 100, chaos: Number(sChaos.value) / 100 },
      aspect: 1
    };
  };
  let st = 0;
  const drawStudio = (reveal = false) => { readStudio(); clearTimeout(st); st = setTimeout(() => paint(sCanvas, studio, { reduced, reveal }), 60); };
  $('[data-studio]').addEventListener('input', () => drawStudio(false));
  $('[data-studio]').addEventListener('change', () => drawStudio(false));
  $('[data-shuffle]').addEventListener('click', () => { sSeed.value = String(newSeed()); drawStudio(true); });
  $('[data-studio]').addEventListener('submit', (e) => {
    e.preventDefault();
    readStudio();
    const title = sTitle.value.trim() || 'Untitled';
    walk.hang({ ...studio, title: title.slice(0, 60) });
    const msg = $('[data-hung]');
    msg.hidden = false;
    msg.querySelector('[data-hung-title]').textContent = title;
  });
  $('[data-walk-you]').addEventListener('click', () => { document.getElementById('exhibition').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); setTimeout(() => walk.goTo(6), reduced ? 0 : 500); });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { drawStudio(true); io.disconnect(); } }, { rootMargin: '200px' });
    io.observe(sCanvas);
  } else drawStudio(true);

  // ---------- booking ----------
  initBooking();
  return { openWork, openArtist };
}

function initBooking() {
  const form = $('#book-form');
  if (!form) return;
  const F = { date: $('#b-date'), name: $('#b-name'), email: $('#b-email'), adults: $('#b-adults'), conc: $('#b-conc') };
  const total = $('[data-total]');
  const calc = () => { const a = Number(F.adults.value) || 0, c = Number(F.conc.value) || 0; total.textContent = `€${a * 18 + c * 9}`; return a + c; };
  $$('[data-step]', form).forEach((b) => b.addEventListener('click', () => {
    const input = $(`#${b.dataset.for}`), v = Math.max(0, Math.min(8, (Number(input.value) || 0) + Number(b.dataset.step)));
    input.value = String(v); calc(); show('b-tickets', '');
  }));
  [F.adults, F.conc].forEach((i) => i.addEventListener('input', calc));
  const today = new Date();
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  F.date.min = iso(today);
  const rules = {
    'b-date': () => { if (!F.date.value) return 'Choose the day of your visit.'; if (F.date.value < F.date.min) return 'Choose today or a later date.'; return new Date(`${F.date.value}T12:00:00`).getDay() === 1 ? 'The hall is closed on Mondays. Please choose another day.' : ''; },
    'b-slot': () => (form.querySelector('input[name="slot"]:checked') ? '' : 'Choose an entry time.'),
    'b-tickets': () => (calc() > 0 ? '' : 'Add at least one ticket.'),
    'b-name': () => (F.name.value.trim().length < 2 ? 'Please enter your name.' : ''),
    'b-email': () => { const v = F.email.value.trim(); if (!v) return 'Please enter your email.'; return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'That email looks incomplete, for example name@example.com.'; }
  };
  function show(id, msg) {
    const err = $(`#${id}-err`);
    if (!err) return;
    err.textContent = msg; err.hidden = !msg;
    const input = document.getElementById(id);
    if (input && input.tagName !== 'FIELDSET' && input.tagName !== 'DIV') input.setAttribute('aria-invalid', String(!!msg));
    if (id === 'b-slot') $('#b-slot').classList.toggle('is-invalid', !!msg);
  }
  [F.name, F.email, F.date].forEach((el) => el.addEventListener('blur', () => { if (el.value) show(el.id, rules[el.id]()); }));
  F.date.addEventListener('change', () => show('b-date', rules['b-date']()));
  $$('input[name="slot"]', form).forEach((r) => r.addEventListener('change', () => show('b-slot', '')));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let first = null;
    Object.keys(rules).forEach((id) => { const m = rules[id](); show(id, m); if (m && !first) first = id; });
    if (first) { const el = first === 'b-slot' ? form.querySelector('input[name="slot"]') : first === 'b-tickets' ? F.adults : document.getElementById(first); el.focus(); return; }
    const done = $('[data-done]', form);
    const slot = form.querySelector('input[name="slot"]:checked').value;
    const d = new Date(`${F.date.value}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    done.innerHTML = '';
    const h = document.createElement('p'); h.className = 'done-h'; h.textContent = 'Your ticket, drawn but not booked';
    const t = document.createElement('div'); t.className = 'ticket';
    t.innerHTML = '<p class="tk-k">Art for a Bolder Tomorrow</p><p class="tk-name"></p><p class="tk-when"></p><p class="tk-qty"></p>';
    t.querySelector('.tk-name').textContent = F.name.value.trim();
    t.querySelector('.tk-when').textContent = `${d} · ${slot}`;
    t.querySelector('.tk-qty').textContent = `${F.adults.value} adult · ${F.conc.value} concession · ${total.textContent} (illustrative)`;
    const p = document.createElement('p'); p.className = 'done-note';
    p.textContent = 'CANVAS is a fictional exhibition and this is a portfolio demo. Nothing was booked, charged or sent.';
    const again = document.createElement('button'); again.type = 'button'; again.className = 'btn btn-line'; again.textContent = 'Start again';
    again.addEventListener('click', () => { form.reset(); calc(); done.hidden = true; form.classList.remove('is-done'); F.date.focus(); });
    done.append(h, t, p, again);
    done.hidden = false;
    form.classList.add('is-done');
    done.focus();
  });
  calc();
}
