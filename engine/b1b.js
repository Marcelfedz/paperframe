// b1b — TeX as vector glyphs plus Manim-style primitives (3Blue1Brown-inspired).
// Every formula and label is real TeX turned into vector glyphs (MathJax SVG → Path2D),
// so text can be Written (outline, then fill) and formulas can morph glyph by glyph.
// folio.js re-exports everything here, so folio scenes import it from '/engine/folio.js'.
// The dark-stage helpers (stage, K palette, plane, attnGrid…) are kept for diagrams that need them.
// Pure functions of time, like the rest of the engine. Call `await loadB1B()` in a scene's setup()
// and pre-warm every TeX string with tex() there (first call compiles; later calls hit cache).

import { W, H, PORTRAIT, SAFE, clamp, lerp, prog, ease, e } from './runtime.js';

// ── Palette (Manim names) ────────────────────────────────────────────────────
export const K = {
  bg: '#0E0F12',
  white: '#ECECEC',
  grey: '#888888',
  greyD: '#444A50',
  greyE: '#26292E',
  blue: '#58C4DD',
  blueD: '#29ABCA',
  blueE: '#1C758A',
  teal: '#5CD0B3',
  green: '#83C167',
  yellow: '#F4D345',
  gold: '#F0AC5F',
  red: '#FC6255',
  maroon: '#C55F73',
  purple: '#9A72AC',
  pink: '#D147BD',
  orange: '#FF862F',
  brown: '#736357',
};

// Role colours for attention diagrams (query / key / value …)
export const ROLE = { query: K.yellow, key: K.teal, value: K.red, embed: K.blue, delta: K.pink, money: K.gold, water: K.blue };

// ── Loading ──────────────────────────────────────────────────────────────────
let _loading = null;
export function loadB1B() {
  if (_loading) return _loading;
  _loading = new Promise((resolve, reject) => {
    window.MathJax = {
      loader: { load: ['[tex]/color'] },
      tex: { packages: { '[+]': ['color'] } },
      svg: { fontCache: 'none' },
      startup: { typeset: false, ready: () => { window.MathJax.startup.defaultReady(); window.MathJax.startup.promise.then(resolve); } },
    };
    const s = document.createElement('script');
    s.src = '/engine/node_modules/mathjax/es5/tex-svg-full.js';
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return _loading;
}

// ── TeX → glyphs ─────────────────────────────────────────────────────────────
const _cache = new Map();
let _host = null;

/**
 * tex(src) → { glyphs, w, h, depth } in em units (1 = font size).
 * glyph = { path: Path2D, m: DOMMatrix (glyph-local → em space, y down, baseline at 0),
 *           d: shape key, color: string|null, len: outline length (em), box: {x,y,w,h} em, cx }
 * Colour parts with {\color{#hex}...} (MathJax \color is a switch, so wrap it in braces); uncoloured glyphs take the draw colour.
 */
export function tex(src) {
  if (_cache.has(src)) return _cache.get(src);
  if (!window.MathJax?.tex2svg) throw new Error('b1b: call await loadB1B() in setup() first');
  if (!_host) { _host = document.createElement('div'); _host.style.cssText = 'position:absolute;left:-99999px;top:0;'; document.body.appendChild(_host); }
  const node = window.MathJax.tex2svg(src, { display: false });
  if (node.querySelector('[data-mml-node="merror"]')) throw new Error(`b1b: TeX error in ${src}`);
  if (node.querySelector('text')) console.error(`b1b: "${src}" contains characters MathJax draws as font text (e.g. unicode accents) — they will be missing; use TeX accents like \\'e`);
  const svg = node.querySelector('svg');
  const [minX, minY, vw, vh] = svg.getAttribute('viewBox').split(/\s+/).map(Number);
  svg.setAttribute('width', vw); svg.setAttribute('height', vh);
  _host.appendChild(node);
  const U = 1000; // MathJax units per em
  const glyphs = [];
  for (const el of svg.querySelectorAll('path, rect')) {
    if (el.closest('defs')) continue;
    const ctm = el.getCTM();
    // viewport px == viewBox units here; shift so baseline-left is the origin, then units → em
    const m = new DOMMatrix().scale(1 / U).translate(minX, minY).multiply(ctm);
    let path, len, d;
    if (el.tagName === 'rect') {
      const x = +el.getAttribute('x') || 0, y = +el.getAttribute('y') || 0, w = +el.getAttribute('width'), h = +el.getAttribute('height');
      path = new Path2D(); path.rect(x, y, w, h);
      len = 2 * (w + h); d = `rect${Math.round(w)}x${Math.round(h)}`;
    } else {
      d = el.getAttribute('d');
      if (!d) continue;
      path = new Path2D(d);
      len = el.getTotalLength();
    }
    const fillEl = el.closest('[fill]');
    let color = fillEl?.getAttribute('fill');
    if (!color || color === 'currentColor') color = null;
    const bb = el.getBBox();
    const pts = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]].map(([x, y]) => m.transformPoint({ x, y }));
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    const sc = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c));
    glyphs.push({ path, m, d, color, len: len * sc, box, cx: box.x + box.w / 2 });
  }
  _host.removeChild(node);
  // reading order: left to right
  glyphs.sort((a, b) => a.box.x - b.box.x || a.box.y - b.box.y);
  const out = { glyphs, w: vw / U, h: -minY / U, depth: (vh + minY) / U, src };
  _cache.set(src, out);
  return out;
}

/** size in px of the bounding box of tex(src) at `size` */
export function texSize(src, size = 60) { const T = tex(src); return { w: T.w * size, h: (T.h + T.depth) * size, asc: T.h * size }; }

function anchor(T, size, align, valign) {
  const w = T.w * size;
  const ax = align === 'center' ? -w / 2 : align === 'right' ? -w : 0;
  const ay = valign === 'middle' ? (T.h - T.depth) * size / 2 : valign === 'top' ? T.h * size : valign === 'bottom' ? -T.depth * size : 0; // baseline default
  return [ax, ay];
}

function paintGlyph(ctx, g, size, ox, oy, color, fillA, strokeP, alpha) {
  alpha *= ctx.globalAlpha; // multiply with the parent opacity (scene fades, group dims)
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(size, size);
  ctx.transform(g.m.a, g.m.b, g.m.c, g.m.d, g.m.e, g.m.f);
  const col = g.color || color;
  if (strokeP > 0 && strokeP < 1.0001 && fillA < 1) {
    const sc = Math.sqrt(Math.abs(g.m.a * g.m.d - g.m.b * g.m.c)) * size;
    const L = g.len * size / sc; // local units
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = col;
    ctx.lineWidth = Math.max(1.2, size * 0.022) / sc;
    ctx.setLineDash([L * strokeP, L + 1]);
    ctx.stroke(g.path);
  }
  if (fillA > 0) {
    ctx.globalAlpha = alpha * fillA;
    ctx.fillStyle = col;
    ctx.fill(g.path);
  }
  ctx.restore();
}

/**
 * drawTex(ctx, src, x, y, opts)
 *   size        em size in px (default 60)
 *   color       base colour (default K.white)
 *   align       'left' | 'center' | 'right'      valign 'baseline' | 'middle' | 'top' | 'bottom'
 *   write       0..1 Manim-style Write: glyphs outline then fill, staggered left → right (default 1 = done)
 *   alpha       overall opacity
 *   only        optional (glyph, index) => bool — draw a subset
 *   glyphColor  optional (glyph, index) => colour override
 * Returns the px box {x, y, w, h} of what was drawn (useful for braces/frames).
 */
export function drawTex(ctx, src, x, y, { size = 60, color = K.white, align = 'left', valign = 'baseline', write = 1, alpha = 1, only, glyphColor } = {}) {
  const T = typeof src === 'string' ? tex(src) : src;
  const [ax, ay] = anchor(T, size, align, valign);
  const ox = x + ax, oy = y + ay;
  if (alpha <= 0) return { x: ox, y: oy - T.h * size, w: T.w * size, h: (T.h + T.depth) * size };
  const n = T.glyphs.length;
  const lag = Math.min(0.9, 0.06 * n) ; // how spread the stagger is
  T.glyphs.forEach((g, i) => {
    if (only && !only(g, i)) return;
    let fillA = 1, strokeP = 1;
    if (write < 1) {
      if (write <= 0) return;
      const s = n > 1 ? (i / (n - 1)) * lag : 0;
      const local = clamp((write - s) / (1 - lag));
      if (local <= 0) return;
      strokeP = clamp(local / 0.6);
      fillA = clamp((local - 0.45) / 0.55);
    }
    paintGlyph(ctx, g, size, ox, oy, glyphColor?.(g, i) || color, fillA, strokeP, alpha);
  });
  return { x: ox, y: oy - T.h * size, w: T.w * size, h: (T.h + T.depth) * size };
}

/** box (px) of glyphs [i0, i1) of src drawn at x, y with the same opts as drawTex — for highlighting a sub-term */
export function texPart(src, i0, i1, x, y, { size = 60, align = 'left', valign = 'baseline' } = {}) {
  const T = tex(src);
  const [ax, ay] = anchor(T, size, align, valign);
  const gs = T.glyphs.slice(i0, i1);
  const x0 = Math.min(...gs.map((g) => g.box.x)), x1 = Math.max(...gs.map((g) => g.box.x + g.box.w));
  const y0 = Math.min(...gs.map((g) => g.box.y)), y1 = Math.max(...gs.map((g) => g.box.y + g.box.h));
  return { x: x + ax + x0 * size, y: y + ay + y0 * size, w: (x1 - x0) * size, h: (y1 - y0) * size };
}

/**
 * morphTex — TransformMatchingTex: glyphs with the same shape fly from A to B,
 * the rest fade out (A) / fade in (B). a/b = { src, x, y, size, align, valign, color }.
 */
export function morphTex(ctx, a, b, p, { alpha = 1 } = {}) {
  const A = tex(a.src), B = tex(b.src);
  const sa = a.size ?? 60, sb = b.size ?? 60;
  const [aax, aay] = anchor(A, sa, a.align ?? 'left', a.valign ?? 'baseline');
  const [bax, bay] = anchor(B, sb, b.align ?? 'left', b.valign ?? 'baseline');
  const used = new Set();
  const pairs = A.glyphs.map((g) => {
    const j = B.glyphs.findIndex((h, k) => !used.has(k) && h.d === g.d);
    if (j >= 0) used.add(j);
    return j;
  });
  const q = ease.inOutCubic(clamp(p));
  A.glyphs.forEach((g, i) => {
    const j = pairs[i];
    if (j < 0) { paintGlyph(ctx, g, sa, a.x + aax, a.y + aay, a.color ?? K.white, 1, 1, alpha * (1 - clamp(p * 2))); return; }
    const h = B.glyphs[j];
    // interpolate the glyph's em-space origin and scale, drawing it as a moved copy of g
    const gx = a.x + aax + g.box.x * sa, gy = a.y + aay + g.box.y * sa;
    const hx = b.x + bax + h.box.x * sb, hy = b.y + bay + h.box.y * sb;
    const s = lerp(sa, sb, q);
    const cx = lerp(gx, hx, q), cy = lerp(gy, hy, q);
    ctx.save();
    ctx.translate(cx - g.box.x * s, cy - g.box.y * s);
    const col = q < 0.5 ? (g.color || a.color || K.white) : (h.color || b.color || K.white);
    paintGlyph(ctx, g, s, 0, 0, col, 1, 1, alpha);
    ctx.restore();
  });
  B.glyphs.forEach((h, j) => {
    if (used.has(j)) return;
    paintGlyph(ctx, h, sb, b.x + bax, b.y + bay, b.color ?? K.white, 1, 1, alpha * clamp(p * 2 - 1));
  });
}

// ── Stage ────────────────────────────────────────────────────────────────────
/** dark ground with a very soft vignette */
export function stage(ctx, color = K.bg) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
  const m = Math.min(W, H); // short side, so portrait keeps the landscape falloff
  const g = ctx.createRadialGradient(W / 2, H / 2, m * 0.3, W / 2, H / 2, m * 1.05);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** whole-frame fade from/to black at scene edges; returns the alpha to multiply content by */
export function edge(t, dur, inDur = 0.4, outDur = 0.5) {
  return Math.min(clamp(t / inDur), clamp((dur - t) / outDur));
}

// ── Primitives ───────────────────────────────────────────────────────────────
/** "Create": stroke a polyline progressively. pts [[x,y],...] */
export function line(ctx, pts, { p = 1, color = K.white, width = 4, alpha = 1, dash = null, close = false } = {}) {
  if (p <= 0 || alpha <= 0) return;
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  if (close) L += Math.hypot(pts[0][0] - pts.at(-1)[0], pts[0][1] - pts.at(-1)[1]);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (close) ctx.closePath();
  ctx.setLineDash(dash || (p < 1 ? [L * p, L + 10] : []));
  ctx.stroke();
  ctx.restore();
}

/** Manim Arrow: straight shaft + filled triangular tip, grows from the tail with p */
export function vecArrow(ctx, x1, y1, x2, y2, { p = 1, color = K.white, width = 6, tip = 24, alpha = 1 } = {}) {
  if (p <= 0 || alpha <= 0) return;
  const ex = lerp(x1, x2, p), ey = lerp(y1, y2, p);
  const L = Math.hypot(ex - x1, ey - y1);
  if (L < 1) return;
  const ux = (ex - x1) / L, uy = (ey - y1) / L;
  const tl = Math.min(tip, L * 0.45);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = width; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex - ux * tl * 0.9, ey - uy * tl * 0.9); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - ux * tl - uy * tl * 0.5, ey - uy * tl + ux * tl * 0.5);
  ctx.lineTo(ex - ux * tl + uy * tl * 0.5, ey - uy * tl - ux * tl * 0.5);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

export function dot(ctx, x, y, r = 8, { color = K.white, alpha = 1 } = {}) {
  if (alpha <= 0 || r <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

/** rounded rectangle path helper */
export function rrect(ctx, x, y, w, h, r = 8) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/** SurroundingRectangle — draws itself around a box {x,y,w,h} with progress p */
export function frameBox(ctx, box, { p = 1, color = K.yellow, width = 4, pad = 14, r = 6, alpha = 1 } = {}) {
  if (p <= 0) return;
  const x = box.x - pad, y = box.y - pad, w = box.w + pad * 2, h = box.h + pad * 2;
  line(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], { p, color, width, alpha });
}

/** Manim-style token: word in a rounded box with a tinted fill. Returns box. */
export function token(ctx, word, cx, cy, { size = 48, color = K.blue, alpha = 1, p = 1, fill = 0.18, pad = 18, write } = {}) {
  const src = `\\text{${word}}`;
  const T = tex(src);
  const w = Math.max(T.w * size + pad * 2, size * 1.4), h = size * 1.35;
  const x = cx - w / 2, y = cy - h / 2;
  if (alpha <= 0 || p <= 0) return { x, y, w, h };
  ctx.save();
  ctx.globalAlpha *= alpha;
  const sc = 0.85 + 0.15 * ease.outBack(clamp(p));
  ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
  rrect(ctx, x, y, w, h, 10);
  ctx.globalAlpha *= clamp(p * 1.5);
  ctx.fillStyle = hexA(color, fill); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
  ctx.globalAlpha /= Math.max(1e-3, clamp(p * 1.5)); // word opacity independent of the box grow-in
  drawTex(ctx, src, cx, cy, { size, align: 'center', valign: 'middle', write: write ?? clamp(p * 1.4 - 0.2) });
  ctx.restore();
  return { x, y, w, h };
}

/** curly brace under (dir 1) or above (dir -1) a horizontal span; label optional (TeX) */
export function brace(ctx, x1, x2, y, { dir = 1, color = K.white, p = 1, depth = 26, width = 3.5, label, labelSize = 44, labelColor } = {}) {
  if (p <= 0) return;
  const xm = (x1 + x2) / 2, d = depth * dir;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2);
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const half = (x2 - x1) / 2 * ease.outCubic(clamp(p));
  const a = xm - half, b = xm + half;
  ctx.beginPath();
  ctx.moveTo(a, y);
  ctx.quadraticCurveTo(a, y + d * 0.5, a + Math.min(30, half * 0.2), y + d * 0.5);
  ctx.lineTo(xm - 18, y + d * 0.5);
  ctx.quadraticCurveTo(xm, y + d * 0.5, xm, y + d);
  ctx.quadraticCurveTo(xm, y + d * 0.5, xm + 18, y + d * 0.5);
  ctx.lineTo(b - Math.min(30, half * 0.2), y + d * 0.5);
  ctx.quadraticCurveTo(b, y + d * 0.5, b, y);
  ctx.stroke();
  ctx.restore();
  if (label) drawTex(ctx, label, xm, y + d + dir * 18, { size: labelSize, align: 'center', valign: dir > 0 ? 'top' : 'bottom', color: labelColor || color, write: clamp(p * 1.6 - 0.5) });
}

// ── Coordinate plane ─────────────────────────────────────────────────────────
/**
 * plane({ cx, cy, unit, xr:[-a,a], yr:[-b,b] }) → { pt(x,y)→[px,py], draw(ctx, {p, alpha, axes}) }
 * Manim NumberPlane look: blue grid, fainter half-lines, white axes. p grows lines from the centre.
 */
export function plane({ cx = W / 2, cy = H / 2, unit = 90, xr = [-8, 8], yr = [-5, 5] } = {}) {
  const pt = (x, y) => [cx + x * unit, cy - y * unit];
  return {
    pt, unit,
    draw(ctx, { p = 1, alpha = 1, axes = true, color = K.blueE } = {}) {
      if (alpha <= 0 || p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= alpha;
      const q = ease.inOutCubic(clamp(p));
      for (let k = Math.ceil(xr[0] * 2) / 2; k <= xr[1]; k += 0.5) {
        const major = Number.isInteger(k);
        const lp = ease.outCubic(clamp(q * 1.6 - (Math.abs(k) / Math.max(-xr[0], xr[1])) * 0.6));
        if (lp <= 0) continue;
        const [x] = pt(k, 0);
        const [, y0] = pt(0, yr[0] * lp), [, y1] = pt(0, yr[1] * lp);
        ctx.strokeStyle = major ? color : hexA(color, 0.35);
        ctx.lineWidth = major ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
      }
      for (let k = Math.ceil(yr[0] * 2) / 2; k <= yr[1]; k += 0.5) {
        const major = Number.isInteger(k);
        const lp = ease.outCubic(clamp(q * 1.6 - (Math.abs(k) / Math.max(-yr[0], yr[1])) * 0.6));
        if (lp <= 0) continue;
        const [, y] = pt(0, k);
        const [x0] = pt(xr[0] * lp, 0), [x1] = pt(xr[1] * lp, 0);
        ctx.strokeStyle = major ? color : hexA(color, 0.35);
        ctx.lineWidth = major ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      }
      if (axes) {
        ctx.strokeStyle = K.white; ctx.lineWidth = 3;
        const [ax0, ay] = pt(xr[0] * q, 0), [ax1] = pt(xr[1] * q, 0);
        const [bx, by0] = pt(0, yr[0] * q), [, by1] = pt(0, yr[1] * q);
        ctx.beginPath(); ctx.moveTo(ax0, ay); ctx.lineTo(ax1, ay); ctx.moveTo(bx, by0); ctx.lineTo(bx, by1); ctx.stroke();
      }
      ctx.restore();
    },
  };
}

// ── Matrices & vectors as columns of numbers ─────────────────────────────────
/** square brackets around a box */
export function brackets(ctx, x, y, w, h, { color = K.white, width = 3.5, serif = 14, p = 1, alpha = 1 } = {}) {
  if (p <= 0) return;
  const s = serif;
  line(ctx, [[x + s, y], [x, y], [x, y + h], [x + s, y + h]], { p, color, width, alpha });
  line(ctx, [[x + w - s, y], [x + w, y], [x + w, y + h], [x + w - s, y + h]], { p, color, width, alpha });
}

/**
 * matrix(ctx, rows, cx, cy, opts) — rows = array of arrays of TeX strings or numbers.
 * opts: cell [w,h], size, color (entries), bracketColor, p (bracket draw) , fill (0..1 entries write),
 *       entryColor(i,j) → colour, highlightRow / highlightCol (index) draws a soft band.
 * Returns { x, y, w, h, cell(i,j) → [px, py] centres }.
 */
export function matrix(ctx, rows, cx, cy, { cell = [70, 56], size = 34, color = K.white, bracketColor = K.white, p = 1, fill = 1, alpha = 1, entryColor, highlightRow = -1, highlightCol = -1, hlColor = K.yellow } = {}) {
  const R = rows.length, Cn = rows[0].length;
  const w = Cn * cell[0] + 24, h = R * cell[1] + 10;
  const x = cx - w / 2, y = cy - h / 2;
  const at = (i, j) => [x + 12 + (j + 0.5) * cell[0], y + 5 + (i + 0.5) * cell[1]];
  if (alpha <= 0) return { x, y, w, h, cell: at };
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (highlightRow >= 0) { ctx.fillStyle = hexA(hlColor, 0.18); rrect(ctx, x + 6, y + 5 + highlightRow * cell[1], w - 12, cell[1], 6); ctx.fill(); }
  if (highlightCol >= 0) { ctx.fillStyle = hexA(hlColor, 0.18); rrect(ctx, x + 12 + highlightCol * cell[0], y + 4, cell[0], h - 8, 6); ctx.fill(); }
  brackets(ctx, x, y, w, h, { color: bracketColor, p });
  const n = R * Cn;
  rows.forEach((row, i) => row.forEach((v, j) => {
    const k = i * Cn + j;
    const wr = clamp((fill - (k / n) * 0.5) / 0.5);
    if (wr <= 0) return;
    const [px, py] = at(i, j);
    drawTex(ctx, typeof v === 'number' ? fmt(v) : v, px, py, { size, align: 'center', valign: 'middle', color: entryColor?.(i, j) || color, write: wr });
  }));
  ctx.restore();
  return { x, y, w, h, cell: at };
}

/** column vector of numbers (shorthand for matrix with one column) */
export function colVec(ctx, vals, cx, cy, o = {}) {
  return matrix(ctx, vals.map((v) => [v]), cx, cy, { cell: [o.cellW ?? 86, o.cellH ?? 46], ...o });
}

/** number → TeX with sign and fixed decimals */
export function fmt(v, d = 1) {
  if (v === Infinity) return '\\infty';
  if (v === -Infinity) return '-\\infty';
  const s = Math.abs(v).toFixed(d);
  return (v < 0 ? '-' : '') + s;
}

// ── Attention grid ───────────────────────────────────────────────────────────
/**
 * attnGrid(ctx, opts) — the attention pattern: rows = queries, columns = keys.
 *   tokens      array of words (same list on both axes)
 *   x, y        top-left of the cell area; cell = px per cell
 *   values      (i, j) → number; shown as a dot whose radius ∝ |v| (negatives hollow)
 *   p           0..1 grid lines draw on;  fillP 0..1 dots appear row by row
 *   mask        (i, j) → bool hidden cells (drawn as dim crosses when maskP > 0)
 *   rowHL       row index to highlight (yellow band), colHL likewise (teal band)
 *   labels      draw token labels (left: queries in yellow, top: keys in teal)
 *   numbers     (i, j) → TeX string to print instead of a dot (e.g. "0.82")
 */
export function attnGrid(ctx, { tokens, x, y, cell = 96, values = () => 0, vmax = 1, p = 1, fillP = 1, alpha = 1, mask, maskP = 0,
  rowHL = -1, colHL = -1, hlP = 1, labels = true, labelSize = 36, dotColor = K.white, numbers, numSize = 26, rowDim = -1 } = {}) {
  const n = tokens.length, S = n * cell;
  if (alpha <= 0) return { x, y, S };
  ctx.save();
  ctx.globalAlpha *= alpha;
  const q = ease.inOutCubic(clamp(p));
  if (rowHL >= 0 && hlP > 0) { ctx.fillStyle = hexA(ROLE.query, 0.14 * hlP); ctx.fillRect(x, y + rowHL * cell, S * clamp(hlP * 1.5), cell); }
  if (colHL >= 0 && hlP > 0) { ctx.fillStyle = hexA(ROLE.key, 0.14 * hlP); ctx.fillRect(x + colHL * cell, y, cell, S * clamp(hlP * 1.5)); }
  ctx.strokeStyle = K.greyD; ctx.lineWidth = 2;
  for (let k = 0; k <= n; k++) {
    ctx.beginPath(); ctx.moveTo(x, y + k * cell); ctx.lineTo(x + S * q, y + k * cell); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + k * cell, y); ctx.lineTo(x + k * cell, y + S * q); ctx.stroke();
  }
  if (labels) {
    tokens.forEach((tk, i) => {
      const a = clamp(p * n - i * 0.6);
      drawTex(ctx, `\\text{${tk}}`, x - 22, y + (i + 0.5) * cell, { size: labelSize, align: 'right', valign: 'middle', color: ROLE.query, alpha: a });
      ctx.save();
      ctx.translate(x + (i + 0.5) * cell, y - 22);
      ctx.rotate(-Math.PI / 4);
      drawTex(ctx, `\\text{${tk}}`, 0, 0, { size: labelSize, align: 'left', valign: 'middle', color: ROLE.key, alpha: a });
      ctx.restore();
    });
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const cx = x + (j + 0.5) * cell, cy = y + (i + 0.5) * cell;
    const masked = mask?.(i, j);
    const appear = clamp(fillP * (n + 2) - i - j * 0.15);
    if (appear <= 0) continue;
    const dim = rowDim >= 0 && i !== rowDim ? 0.25 : 1;
    if (masked && maskP > 0) {
      ctx.save(); ctx.globalAlpha *= maskP * dim; ctx.strokeStyle = K.greyD; ctx.lineWidth = 3;
      const r = cell * 0.18;
      ctx.beginPath(); ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy + r); ctx.moveTo(cx + r, cy - r); ctx.lineTo(cx - r, cy + r); ctx.stroke();
      ctx.restore();
      if (maskP >= 1) continue;
    }
    const fadeMask = masked ? 1 - maskP : 1;
    if (numbers) {
      drawTex(ctx, numbers(i, j), cx, cy, { size: numSize, align: 'center', valign: 'middle', color: dotColor, alpha: appear * fadeMask * dim });
      continue;
    }
    const v = values(i, j);
    const r = Math.min(1, Math.abs(v) / vmax) * cell * 0.42 * ease.outBack(clamp(appear));
    if (r <= 0.5) continue;
    ctx.save();
    ctx.globalAlpha *= clamp(appear) * fadeMask * dim;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (v >= 0) { ctx.fillStyle = dotColor; ctx.fill(); }
    else { ctx.strokeStyle = dotColor; ctx.lineWidth = 3; ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
  return { x, y, S, cell: (i, j) => [x + (j + 0.5) * cell, y + (i + 0.5) * cell] };
}

// ── Bars ─────────────────────────────────────────────────────────────────────
/** vertical bar chart. vals ≥ 0 or signed; baseline at y. Returns bar centres. */
export function bars(ctx, vals, x, y, { bw = 60, gap = 26, scale = 200, color = K.blue, colors, p = 1, alpha = 1, labels, labelSize = 32, valueTex, valueSize = 28 } = {}) {
  const out = [];
  ctx.save(); ctx.globalAlpha *= alpha;
  vals.forEach((v, i) => {
    const bx = x + i * (bw + gap);
    const hgt = v * scale * ease.outCubic(clamp(p * 1.3 - i * 0.05));
    ctx.fillStyle = hexA(colors?.[i] || color, 0.85);
    ctx.fillRect(bx, Math.min(y, y - hgt), bw, Math.abs(hgt));
    out.push([bx + bw / 2, y - hgt]);
    if (labels) drawTex(ctx, `\\text{${labels[i]}}`, bx + bw / 2, y + 16, { size: labelSize, align: 'center', valign: 'top', color: K.white });
    if (valueTex) drawTex(ctx, valueTex(v, i), bx + bw / 2, hgt >= 0 ? y - hgt - 10 : y - hgt + 10, { size: valueSize, align: 'center', valign: hgt >= 0 ? 'bottom' : 'top', color: K.white, alpha: clamp(p * 2 - 1) });
  });
  ctx.strokeStyle = K.grey; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x + vals.length * (bw + gap) - gap + 10, y); ctx.stroke();
  ctx.restore();
  return out;
}


// ── More primitives ─────────────────────────────────────────────────────────
/** filled + stroked rounded box; p draws the outline, fill fades with it */
export function box(ctx, x, y, w, h, { fill = K.greyE, fillA = 1, stroke = K.white, width = 3, r = 10, p = 1, alpha = 1 } = {}) {
  if (p <= 0 || alpha <= 0) return { x, y, w, h };
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (fill) { ctx.save(); ctx.globalAlpha *= fillA * clamp(p * 1.5); rrect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.restore(); }
  if (stroke) {
    if (p >= 1) { rrect(ctx, x, y, w, h, r); ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
    else line(ctx, [[x + r, y], [x + w - r, y], [x + w, y + r], [x + w, y + h - r], [x + w - r, y + h], [x + r, y + h], [x, y + h - r], [x, y + r], [x + r, y]], { p, color: stroke, width });
  }
  ctx.restore();
  return { x, y, w, h };
}

/** vertical curly brace at x spanning y1..y2, opening to the right (dir 1) or left (-1) */
export function vbrace(ctx, x, y1, y2, { dir = 1, color = K.white, p = 1, depth = 26, width = 3.5, label, labelSize = 44, labelColor } = {}) {
  if (p <= 0) return;
  ctx.save();
  ctx.translate(x, (y1 + y2) / 2);
  ctx.rotate(dir > 0 ? -Math.PI / 2 : Math.PI / 2);
  const half = (y2 - y1) / 2;
  brace(ctx, -half, half, 0, { dir: 1, color, p, depth, width });
  ctx.restore();
  if (label) drawTex(ctx, label, x + dir * (depth + 18), (y1 + y2) / 2, { size: labelSize, align: dir > 0 ? 'left' : 'right', valign: 'middle', color: labelColor || color, write: clamp(p * 1.6 - 0.5) });
}

/** px box around the glyphs of src that satisfy pred(glyph, index) — e.g. by colour: g => g.color === '#F4D345' */
export function texBoxWhere(src, pred, x, y, { size = 60, align = 'left', valign = 'baseline' } = {}) {
  const T = tex(src);
  const [ax, ay] = anchor(T, size, align, valign);
  const gs = T.glyphs.filter(pred);
  if (!gs.length) return null;
  const x0 = Math.min(...gs.map((g) => g.box.x)), x1 = Math.max(...gs.map((g) => g.box.x + g.box.w));
  const y0 = Math.min(...gs.map((g) => g.box.y)), y1 = Math.max(...gs.map((g) => g.box.y + g.box.h));
  return { x: x + ax + x0 * size, y: y + ay + y0 * size, w: (x1 - x0) * size, h: (y1 - y0) * size };
}

/**
 * timeline(ctx, { items:[{year, label, color}], active, x0, x1, y, p, alpha }) — a thin year axis with model ticks.
 * `active` = index highlighted (fractional values glide the marker between ticks). Used as a chapter locator.
 * item.lift (px) raises a label to avoid collisions between close releases.
 */
export function timeline(ctx, { items, active = -1, x0 = 160, x1 = W - 160, y = (PORTRAIT ? SAFE.b : H) - 70, p = 1, alpha = 1, y0Year = 2018, y1Year = 2025.9, size = 30 } = {}) {
  if (alpha <= 0 || p <= 0) return;
  const X = (yr) => lerp(x0, x1, (yr - y0Year) / (y1Year - y0Year));
  ctx.save();
  ctx.globalAlpha *= alpha;
  line(ctx, [[x0, y], [x1, y]], { p, color: K.greyD, width: 2 });
  for (let yr = Math.ceil(y0Year); yr <= y1Year; yr++) {
    const a = clamp(p * 3 - (yr - y0Year) / (y1Year - y0Year) * 2);
    drawTex(ctx, `${yr}`, X(yr), y + 18, { size: size * 0.8, align: 'center', valign: 'top', color: K.grey, alpha: a });
    line(ctx, [[X(yr), y - 6], [X(yr), y + 6]], { color: K.grey, width: 2, alpha: a });
  }
  items.forEach((it, i) => {
    const a = clamp(p * 3 - i * 0.25);
    const on = active >= 0 ? clamp(1 - Math.abs(active - i)) : 0;
    const col = it.color || K.white;
    dot(ctx, X(it.year), y, 6 + 4 * on, { color: on > 0.5 ? col : K.greyD, alpha: a });
    drawTex(ctx, it.label, X(it.year), y - 20 - 6 * on - (it.lift || 0), { size: size * (0.8 + 0.25 * on), align: 'center', valign: 'bottom', color: on > 0.01 ? mix(K.grey, col, on) : K.grey, alpha: a });
  });
  if (active >= 0) {
    const i0 = Math.floor(active), i1 = Math.min(items.length - 1, i0 + 1);
    const yr = lerp(items[i0].year, items[i1].year, active - i0);
    line(ctx, [[x0, y], [X(yr), y]], { color: K.white, width: 3, alpha: 0.6 });
  }
  ctx.restore();
}

// ── Utilities ────────────────────────────────────────────────────────────────
/** '#RRGGBB' + alpha → rgba() */
export function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** mix two '#RRGGBB' colours */
export function mix(h1, h2, p) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const c = [16, 8, 0].map((s) => Math.round(lerp((a >> s) & 255, (b >> s) & 255, clamp(p))));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

/** fade-in-and-out window: 0 before a, ramps to 1 over fin, holds, ramps to 0 ending at b */
export function win(t, a, b, fin = 0.4, fout = 0.4) {
  return Math.min(clamp((t - a) / fin), clamp((b - t) / fout));
}

/** softmax helper (for data files) */
export function softmax(xs, temp = 1) {
  const m = Math.max(...xs.filter((v) => v !== -Infinity));
  const ex = xs.map((v) => (v === -Infinity ? 0 : Math.exp((v - m) / temp)));
  const s = ex.reduce((a, b) => a + b, 0);
  return ex.map((v) => v / s);
}

export { prog, ease, e, clamp, lerp };
