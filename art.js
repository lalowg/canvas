// CANVAS — generative artwork engine. Ten seeded algorithms, a paint-on reveal and live works.
import { PALETTES } from './data.js';

const TAU = Math.PI * 2;
export function rng(seed) {
  let s = (seed | 0) || 1;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function makeNoise(seed) {
  const r = rng(seed);
  const perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const g = (h, x, y) => { switch (h & 7) { case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y; case 4: return x; case 5: return -x; case 6: return y; default: return -y; } };
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + (b - a) * t;
  return (x, y) => {
    const xf = Math.floor(x), yf = Math.floor(y);
    const X = xf & 255, Y = yf & 255;
    x -= xf; y -= yf;
    const u = fade(x), v = fade(y);
    const a = p[X] + Y, b = p[X + 1] + Y;
    return lerp(lerp(g(p[a], x, y), g(p[b], x - 1, y), u), lerp(g(p[a + 1], x, y - 1), g(p[b + 1], x - 1, y - 1), u), v) * 0.75;
  };
}

// ---------- algorithms: (ctx, w, h, rnd, params, palette) -> optional live frame(t, pointer) ----------
const ALGOS = {
  flow(c, w, h, r, p, P) {
    const N = makeNoise((r() * 1e9) | 0), m = Math.min(w, h), s = m / 600;
    c.fillStyle = P.bg; c.fillRect(0, 0, w, h);
    const freq = 1.6 + p.chaos * 3.4, turn = 1 + p.chaos * 1.5;
    const count = Math.round((350 + p.density * 1500) * Math.min(2.2, (w * h) / (600 * 750)));
    c.lineCap = 'round';
    for (let i = 0; i < count; i++) {
      let x = r() * w, y = r() * h;
      const accent = r() < 0.06;
      c.strokeStyle = accent ? (r() < 0.65 ? P.a1 : P.a2) : P.fg;
      c.globalAlpha = accent ? 0.95 : 0.5;
      c.lineWidth = (accent ? 2.4 : 0.9) * s;
      c.beginPath(); c.moveTo(x, y);
      const steps = 16 + r() * 34;
      for (let k = 0; k < steps; k++) {
        const a = N((x / m) * freq, (y / m) * freq) * TAU * turn;
        x += Math.cos(a) * 2.4 * s; y += Math.sin(a) * 2.4 * s;
        c.lineTo(x, y);
      }
      c.stroke();
    }
    c.globalAlpha = 1;
  },
  threads(c, w, h, r, p, P) {
    const N = makeNoise((r() * 1e9) | 0), m = Math.min(w, h), s = m / 600;
    c.fillStyle = P.bg; c.fillRect(0, 0, w, h);
    const gap = (4 + (1 - p.density) * 10) * s, amp = (8 + p.chaos * 46) * s;
    const bands = [r() * w, r() * w];
    c.lineWidth = 1.1 * s;
    for (let x0 = -amp; x0 < w + amp; x0 += gap) {
      const inA = Math.abs(x0 - bands[0]) < w * 0.06, inB = Math.abs(x0 - bands[1]) < w * 0.035;
      c.strokeStyle = inA ? P.a1 : inB ? P.a2 : P.fg;
      c.globalAlpha = inA || inB ? 0.95 : 0.72;
      c.beginPath();
      for (let y = -10; y <= h + 10; y += 6 * s) {
        const x = x0 + N((x0 / m) * 2.2, (y / m) * 2.6) * amp + N((x0 / m) * 9, (y / m) * 9) * amp * 0.15;
        y < 0 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.stroke();
    }
    c.globalAlpha = 1;
  },
  contour(c, w, h, r, p, P) {
    const N = makeNoise((r() * 1e9) | 0), m = Math.min(w, h), s = m / 600;
    c.fillStyle = P.bg; c.fillRect(0, 0, w, h);
    const res = Math.max(4, 7 * s), cols = Math.ceil(w / res) + 1, rows = Math.ceil(h / res) + 1;
    const f = 1.4 + p.chaos * 2;
    const v = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = (i * res) / m, y = (j * res) / m;
      v[j * cols + i] = N(x * f, y * f) + 0.5 * N(x * f * 2.1 + 9, y * f * 2.1) + 0.25 * N(x * f * 4.3, y * f * 4.3 + 3);
    }
    const levels = Math.round(8 + p.density * 16), hi = Math.floor(levels * (0.45 + r() * 0.2));
    for (let L = 0; L < levels; L++) {
      const iso = -0.9 + (1.8 * (L + 0.5)) / levels;
      c.strokeStyle = L === hi ? P.a1 : P.fg;
      c.lineWidth = (L === hi ? 2.4 : 0.9) * s;
      c.globalAlpha = L === hi ? 1 : 0.75;
      c.beginPath();
      for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
        const a = v[j * cols + i], b = v[j * cols + i + 1], d = v[(j + 1) * cols + i], e = v[(j + 1) * cols + i + 1];
        const pts = [];
        const x = i * res, y = j * res;
        if ((a < iso) !== (b < iso)) pts.push([x + ((iso - a) / (b - a)) * res, y]);
        if ((b < iso) !== (e < iso)) pts.push([x + res, y + ((iso - b) / (e - b)) * res]);
        if ((d < iso) !== (e < iso)) pts.push([x + ((iso - d) / (e - d)) * res, y + res]);
        if ((a < iso) !== (d < iso)) pts.push([x, y + ((iso - a) / (d - a)) * res]);
        if (pts.length >= 2) { c.moveTo(pts[0][0], pts[0][1]); c.lineTo(pts[1][0], pts[1][1]); }
        if (pts.length === 4) { c.moveTo(pts[2][0], pts[2][1]); c.lineTo(pts[3][0], pts[3][1]); }
      }
      c.stroke();
    }
    c.globalAlpha = 1;
  },
  truchet(c, w, h, r, p, P) {
    const s = Math.min(w, h) / 600;
    c.fillStyle = P.bg; c.fillRect(0, 0, w, h);
    const cell = (36 + (1 - p.density) * 84) * s;
    const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
    const ox = (w - cols * cell) / 2, oy = (h - rows * cell) / 2;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = ox + i * cell, y = oy + j * cell;
      const flip = r() < 0.5;
      if (r() < 0.12 + p.chaos * 0.25) {
        const cx = x + (r() < 0.5 ? 0 : cell), cy = y + (r() < 0.5 ? 0 : cell);
        c.save(); c.beginPath(); c.rect(x, y, cell, cell); c.clip();
        c.fillStyle = r() < 0.6 ? P.a2 : P.a1;
        c.beginPath(); c.arc(cx, cy, cell * 0.5, 0, TAU); c.fill();
        c.restore();
      }
      c.strokeStyle = P.fg; c.lineWidth = cell * 0.13; c.lineCap = 'butt';
      c.beginPath();
      if (flip) { c.arc(x, y, cell / 2, 0, Math.PI / 2); c.moveTo(x + cell, y + cell / 2); c.arc(x + cell, y + cell, cell / 2, -Math.PI / 2, Math.PI, true); }
      else { c.arc(x + cell, y, cell / 2, Math.PI / 2, Math.PI); c.moveTo(x + cell / 2, y + cell); c.arc(x, y + cell, cell / 2, 0, -Math.PI / 2, true); }
      c.stroke();
    }
  },
  bauhaus(c, w, h, r, p, P) {
    c.fillStyle = P.bg; c.fillRect(0, 0, w, h);
    const cols = 3 + Math.round(p.density * 2), size = w / cols, rows = Math.ceil(h / size);
    const fills = [P.bg, P.bg, P.a2, P.fg, P.a1, P.bg];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = i * size, y = j * size;
      const back = fills[Math.floor(r() * fills.length)];
      c.fillStyle = back; c.fillRect(x, y, size + 0.5, size + 0.5);
      const opts = [P.fg, P.a1, P.a2, P.bg].filter((col) => col !== back);
      c.fillStyle = opts[Math.floor(r() * opts.length)];
      const type = Math.floor(r() * 6), rot = Math.floor(r() * 4) * (Math.PI / 2);
      c.save(); c.beginPath(); c.rect(x, y, size, size); c.clip();
      c.translate(x + size / 2, y + size / 2); c.rotate(rot);
      c.beginPath();
      if (type === 0) c.arc(0, 0, size * 0.38, 0, TAU);
      else if (type === 1) c.arc(0, size / 2, size / 2, Math.PI, TAU);
      else if (type === 2) c.arc(-size / 2, -size / 2, size, 0, Math.PI / 2), c.lineTo(-size / 2, -size / 2);
      else if (type === 3) { c.rect(-size / 2, -size / 2, size, size / 3); c.rect(-size / 2, size / 6, size, size / 3); }
      else if (type === 4) { c.arc(0, 0, size * 0.42, 0, TAU); c.arc(0, 0, size * 0.22, 0, TAU, true); }
      else { c.moveTo(-size / 2, size / 2); c.lineTo(size / 2, size / 2); c.lineTo(size / 2, -size / 2); c.closePath(); }
      c.fill('evenodd');
      c.restore();
    }
    // a few compositional accents that ignore the grid
    const n = Math.round(1 + p.chaos * 4);
    for (let k = 0; k < n; k++) {
      c.fillStyle = [P.a1, P.fg, P.a2][k % 3];
      const R = size * (0.25 + r() * 0.5);
      c.beginPath(); c.arc(r() * w, r() * h, R, 0, TAU); c.fill();
    }
    c.strokeStyle = P.fg; c.lineWidth = Math.max(1, size * 0.02);
    c.beginPath(); c.moveTo(0, size * Math.floor(rows * r())); c.lineTo(w, size * Math.floor(rows * r())); c.stroke();
  },
  orbitals(c, w, h, r, p, P) {
    const m = Math.min(w, h), s = m / 600;
    const n = Math.round(6 + p.density * 14);
    const rings = Array.from({ length: n }, (_, i) => {
      const segs = 1 + Math.floor(r() * 3);
      return {
        rad: m * (0.07 + (0.4 * (i + 1)) / n), width: (2 + r() * 9) * s,
        col: r() < 0.16 ? P.a1 : r() < 0.12 ? P.a2 : P.fg,
        speed: (r() - 0.5) * 0.5 * (0.4 + p.chaos), off: r() * TAU,
        arcs: Array.from({ length: segs }, () => [r() * TAU, 0.4 + r() * 2.6])
      };
    });
    const dot = { a: r() * TAU, rr: rings[Math.floor(n * 0.6)].rad };
    const frame = (t, ptr) => {
      c.fillStyle = P.bg; c.fillRect(0, 0, w, h);
      c.lineCap = 'round';
      rings.forEach((g, i) => {
        const pull = ptr ? (ptr.x - 0.5) * 1.4 * (i / n) : 0;
        c.strokeStyle = g.col; c.lineWidth = g.width;
        g.arcs.forEach(([st, len]) => { c.beginPath(); c.arc(w / 2, h / 2, g.rad, st + g.off + t * g.speed + pull, st + g.off + t * g.speed + pull + len); c.stroke(); });
      });
      c.fillStyle = P.a1;
      c.beginPath(); c.arc(w / 2 + Math.cos(dot.a + t * 0.2) * dot.rr, h / 2 + Math.sin(dot.a + t * 0.2) * dot.rr, 7 * s, 0, TAU); c.fill();
    };
    frame(0, null);
    return frame;
  },
  bloom(c, w, h, r, p, P) {
    const m = Math.min(w, h), s = m / 600;
    c.fillStyle = P.bg; c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.47;
    const layers = Math.round(4 + p.density * 7);
    for (let j = layers; j >= 1; j--) {
      const k = 2 + Math.floor(r() * 5), R = m * (0.06 + (0.36 * j) / layers), rot = r() * TAU;
      c.strokeStyle = j % 3 === 0 ? P.a1 : j % 3 === 1 ? P.fg : P.a2;
      c.lineWidth = (0.8 + r() * 1.6) * s;
      c.globalAlpha = 0.85;
      c.beginPath();
      for (let a = 0; a <= TAU + 0.01; a += 0.01) {
        const rr = R * (0.55 + 0.45 * Math.abs(Math.cos(k * a * 0.5))) * (1 + (r() - 0.5) * 0.02 * p.chaos * 8);
        const x = cx + Math.cos(a + rot) * rr, y = cy + Math.sin(a + rot) * rr;
        a === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.closePath(); c.stroke();
    }
    c.globalAlpha = 1;
    c.fillStyle = P.a2;
    for (let i = 0; i < 160 + p.density * 200; i++) {
      const a = r() * TAU, d = Math.abs((r() + r() + r() - 1.5) / 1.5) * m * 0.5;
      c.beginPath(); c.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, (0.8 + r() * 1.8) * s, 0, TAU); c.fill();
    }
    c.fillStyle = P.a1; c.beginPath(); c.arc(cx, cy, 10 * s, 0, TAU); c.fill();
  },
  strata(c, w, h, r, p, P) {
    const N = makeNoise((r() * 1e9) | 0), m = Math.min(w, h);
    c.fillStyle = P.bg; c.fillRect(0, 0, w, h);
    c.fillStyle = P.a1;
    c.beginPath(); c.arc(w * (0.28 + r() * 0.44), h * 0.4, m * 0.17, 0, TAU); c.fill();
    const n = Math.round(4 + p.density * 6);
    const cols = [P.a2, P.a1, P.fg];
    for (let i = 0; i < n; i++) {
      const base = h * 0.42 + (i * h * 0.58) / n;
      const amp = m * (0.04 + p.chaos * 0.1) * (1 - i / (n * 1.6));
      c.fillStyle = i === n - 1 ? P.fg : cols[i % 3];
      c.beginPath(); c.moveTo(0, h);
      for (let x = 0; x <= w + 4; x += 4) c.lineTo(x, base + N((x / m) * 1.6 + i * 7.3, i * 3.1) * amp * 2 + N((x / m) * 6, i) * amp * 0.25);
      c.lineTo(w, h); c.closePath(); c.fill();
      c.strokeStyle = P.bg; c.lineWidth = Math.max(1, m * 0.003); c.stroke();
    }
  },
  halftone(c, w, h, r, p, P) {
    const N = makeNoise((r() * 1e9) | 0), m = Math.min(w, h), s = m / 600;
    c.fillStyle = P.bg; c.fillRect(0, 0, w, h);
    const g = (8 + (1 - p.density) * 14) * s, horizon = h * (0.56 + r() * 0.1);
    const sx = w * (0.35 + r() * 0.3), sy = horizon - m * 0.05, R = m * 0.26;
    for (let row = 0, y = g / 2; y < h + g; y += g * 0.87, row++) {
      for (let x = (row % 2) * g / 2; x < w + g; x += g) {
        let v, col = P.fg;
        const d = Math.hypot(x - sx, y - sy);
        if (y < horizon) {
          v = 0.15 + (y / horizon) * 0.45;
          if (d < R) { v = 0.95; col = P.a1; }
        } else {
          v = 0.35 + N(x / m * 3, y / m * 9) * (0.4 + p.chaos * 0.5) + (Math.abs(x - sx) < R * 0.8 ? 0.25 : 0);
          if (Math.abs(x - sx) < R * (1 - (y - horizon) / (h - horizon)) * 0.9 && N(x / m * 2, y / m * 14) > -0.1) col = P.a1;
        }
        v = Math.max(0, Math.min(1, v));
        if (v < 0.04) continue;
        c.fillStyle = col;
        c.beginPath(); c.arc(x, y, (g / 2) * v, 0, TAU); c.fill();
      }
    }
  },
  constellation(c, w, h, r, p, P) {
    const m = Math.min(w, h), s = m / 600;
    const n = Math.round(40 + p.density * 90), k = 2 + Math.round(p.chaos * 2);
    const pts = Array.from({ length: n }, () => [r() * w, r() * h, r() < 0.08]);
    const near = (x, y, count) => pts.map((q, i) => [Math.hypot(q[0] - x, q[1] - y), i]).sort((a, b) => a[0] - b[0]).slice(1, count + 1);
    const links = pts.map((q) => near(q[0], q[1], k).map((e) => e[1]));
    const frame = (t, ptr) => {
      c.fillStyle = P.bg; c.fillRect(0, 0, w, h);
      c.strokeStyle = P.fg; c.globalAlpha = 0.45; c.lineWidth = 0.9 * s;
      c.beginPath();
      pts.forEach((q, i) => links[i].forEach((j) => { c.moveTo(q[0], q[1]); c.lineTo(pts[j][0], pts[j][1]); }));
      c.stroke();
      c.globalAlpha = 1;
      pts.forEach((q) => { c.fillStyle = q[2] ? P.a1 : P.fg; c.beginPath(); c.arc(q[0], q[1], (q[2] ? 5 : 2.4) * s, 0, TAU); c.fill(); });
      if (ptr) {
        const x = ptr.x * w, y = ptr.y * h;
        c.strokeStyle = P.a1; c.lineWidth = 1.6 * s;
        c.beginPath();
        near(x, y, 7).forEach(([, j]) => { c.moveTo(x, y); c.lineTo(pts[j][0], pts[j][1]); });
        c.stroke();
        c.fillStyle = P.a1; c.beginPath(); c.arc(x, y, 6 * s, 0, TAU); c.fill();
        c.strokeStyle = P.a1; c.lineWidth = 1 * s; c.beginPath(); c.arc(x, y, 14 * s, 0, TAU); c.stroke();
      }
    };
    frame(0, null);
    return frame;
  }
};

export const LIVE = new Set(['orbitals', 'constellation']);

// ---------- painter ----------
const live = new Set();
let loopRaf = 0, motion = true;
export function setMotion(on) { motion = on; if (on) kick(); }
function kick() {
  if (loopRaf || !motion) return;
  const t0 = performance.now();
  const loop = (now) => {
    loopRaf = 0;
    let any = false;
    live.forEach((ctl) => {
      if (!ctl.visible || !ctl.canvas.isConnected) return;
      any = true;
      ctl.draw((now - t0) / 1000);
    });
    if (any && motion) loopRaf = requestAnimationFrame(loop);
  };
  loopRaf = requestAnimationFrame(loop);
}

const io = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver((en) => en.forEach((e) => { const c = e.target._art; if (c) { c.visible = e.isIntersecting; if (c.visible) kick(); } }), { rootMargin: '100px' })
  : null;

export function paint(canvas, spec, { reveal = true, reduced = false, size } = {}) {
  const prev = canvas._art;
  if (prev) { live.delete(prev); prev.cancel && prev.cancel(); }
  const rect = size || canvas.getBoundingClientRect();
  const w = Math.max(40, Math.round(rect.width || canvas.clientWidth || 300));
  const h = Math.max(40, Math.round(rect.height || canvas.clientHeight || 300));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const P = PALETTES[spec.palette] || PALETTES.gallery;
  const params = { density: 0.5, chaos: 0.5, ...(spec.params || {}) };
  const ctl = { canvas, visible: true, spec, ptr: null, cancel: null };
  canvas._art = ctl;
  if (LIVE.has(spec.algo)) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const frame = ALGOS[spec.algo](ctx, w, h, rng(spec.seed), params, P);
    let tNow = 0;
    ctl.draw = (t) => { tNow = t; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); frame(spec.algo === 'orbitals' ? t : 0, ctl.ptr); };
    ctl.redraw = () => { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); frame(spec.algo === 'orbitals' ? tNow : 0, ctl.ptr); };
    if (spec.algo === 'orbitals' && !reduced) live.add(ctl);
    if (io) io.observe(canvas);
    kick();
    return ctl;
  }
  const off = document.createElement('canvas');
  off.width = canvas.width; off.height = canvas.height;
  const octx = off.getContext('2d');
  octx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ALGOS[spec.algo](octx, w, h, rng(spec.seed), params, P);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (!reveal || reduced) { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(off, 0, 0); return ctl; }
  // paint-on: an uneven squeegee edge sweeps left to right
  const W = canvas.width, H = canvas.height, start = performance.now(), dur = 900, ph = (spec.seed % 97) / 10;
  let raf = 0;
  const step = (now) => {
    const k = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - k, 3);
    const edge = e * (W + 140 * dpr) - 70 * dpr;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(0, 0);
    for (let y = 0; y <= H; y += 8 * dpr) ctx.lineTo(edge + Math.sin(y / (40 * dpr) + ph) * 22 * dpr + Math.sin(y / (11 * dpr)) * 6 * dpr, y);
    ctx.lineTo(0, H); ctx.closePath(); ctx.clip();
    ctx.drawImage(off, 0, 0);
    ctx.restore();
    raf = k < 1 ? requestAnimationFrame(step) : 0;
  };
  raf = requestAnimationFrame(step);
  ctl.cancel = () => cancelAnimationFrame(raf);
  return ctl;
}

// pointer interplay for live works (orbitals pull, constellation reaches out)
export function bindPointer(canvas) {
  const set = (e) => {
    const c = canvas._art; if (!c || !c.redraw) return;
    const r = canvas.getBoundingClientRect();
    c.ptr = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    if (!live.has(c)) c.redraw();
  };
  canvas.addEventListener('pointermove', set);
  canvas.addEventListener('pointerdown', set);
  canvas.addEventListener('pointerleave', () => { const c = canvas._art; if (c && c.redraw) { c.ptr = null; if (!live.has(c)) c.redraw(); } });
}
