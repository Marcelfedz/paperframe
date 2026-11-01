// folio — "the paper on the desk": the drawing kit for Paperframe videos.
// The real pages of the paper lie on a light desk under a perspective camera. Phrases get
// highlighted where they really are on the page (word boxes from engine/paper_prep.py),
// pieces of the page lift off as paper copies, and figures stand up into 3D slabs.
// Every label is TeX (re-exported from b1b.js): the paper is LaTeX, so the diagrams continue
// in the same typeface. Pure functions of time, like the rest of the engine.
//
// World: x right, y down the desk, z up from the desk towards the camera, units ≈ px at zoom 1.
// Scenes import everything from here: import { F, desk, cam, sheet, … } from '/engine/folio.js'.
//
// API
//   Palette     F                                   desk, paper, inks, accents, highlighters, block fills
//   Assets      loadPaper(ep, pages)                pages (PNG + mips + word boxes) from <video>/paper/
//               findPhrase(page, phrase, nth)       line boxes of a phrase, in page px
//               mipsOf(canvas)                      [full, ½, ¼, ⅛] chain for a page-like object
//   Rights      masked(page, rects, o)              the page with rects (logos) painted out
//               standIn(page, { blank, draw })      no bitmap: words as grey bars, your redraws on top
//   Camera      cam({ tx, ty, pitch, yaw, dist, zoom, cx, cy })   projector C: C.p(x, y, z) → { x, y, k, depth }
//               cameraAt(t, keys)                   eased path through camera keys
//               camAt(t, keys)                      cameraAt that also eases the screen centre (cx, cy)
//   Stage       desk(ctx)                           light desk background (call first)
//               edgeIn(t, dur)                      scene-edge fade multiplier
//   Sheets      sheet(ctx, C, page, pose, o)        a page (or a crop) in perspective, with its shadow
//               sheetPt / onSheet                   world / screen point of a page pixel
//               highlight(ctx, C, page, pose, lines, p, o)   marker sweeping over findPhrase lines
//               markBox(ctx, C, page, pose, rect, p, o)      box drawn around a page region
//               liftPose(page, from, rect, to, p)  a crop peeling off a sheet and flying to a pose
//               arcPose(from, to, p, h)             pose between two poses, lifted on an arc
//   Your paper  blankPage(key, w, h, draw, o)       a blank sheet you draw on (page px)
//               inked(page, key, draw, o)           a real page with your ink on top
//   3D          slab(ctx, C, box, o)                axis-aligned box standing on the desk, optional label
//               prism(ctx, C, V, o)                 shaded hexahedron from 8 corners, culled by eye
//               prism(ctx, C, poly, z0, z1, o)      the same for a convex footprint extruded z0 → z1
//               arrow3(ctx, C, pts, p, o)           ink arrow along a 3D polyline, drawn on with p
//               contactShadow(ctx, C, shape, o)     soft shadow on the desk under something at height z
//   Labels      tag(ctx, src, x, y, o)              TeX on a small white paper slip (screen space)
//               cite(ctx, page, o)                  the "where in the paper" stamp, bottom-left
//               endCard(ctx, C, page, p, o) / endCardPose(p)   closing card with the citation
//   Narration   cueBook(env)                        word cues: q.s(i) q.e(i) q.w(i, 'word') q.we(i, 'word')
//               sayP(env, i, t) / sayWords(env, i, from, to, t)   0..1 progress with the voice
//   TeX (b1b)   loadB1B, tex, texSize, drawTex, texPart, morphTex, mix, hexA, win … (see b1b.js)

import { W, H, clamp, lerp, prog, ease, e, rng } from './runtime.js';
import { K, tex, drawTex, texSize } from './b1b.js';

export * from './b1b.js';

// ── Palette ──────────────────────────────────────────────────────────────────
export const F = {
  desk: '#E8E5DF',
  deskLit: '#F3F1EC',
  paper: '#FFFFFF',
  ink: '#1D1F24',
  ink2: '#5C616B',
  ink3: '#9AA0A8',
  rule: '#C9C3B8',
  // accents, saturated enough to read on white
  blue: '#2D6BD6',
  teal: '#0F9483',
  green: '#3B9650',
  gold: '#C98A12',
  red: '#D6443A',
  purple: '#6E54C4',
  pink: '#C8418A',
  orange: '#E07322',
  // highlighters (multiplied over the page)
  hlYellow: '#FFE45E',
  hlMint: '#AEEFCB',
  hlPink: '#FFC1D9',
  hlBlue: '#BFDAFF',
  // Figure 1 pastels of the Transformer paper — reusable block fills for architecture diagrams
  attn: '#FBDDB5',
  ffn: '#C4E6F4',
  norm: '#F1F6C4',
  embed: '#F8D9DC',
  linear: '#DCDDF0',
  soft: '#CDEBD2',
  block: '#F1F1F1',
};

// ── Assets ───────────────────────────────────────────────────────────────────
// loadPaper(ep, pages) — in setup(): loads /<ep>/paper/page-NN.png + words.json (ep = env.ep).
// Returns { page(n) → { n, img, mips, w, h, words } }. Mips (½, ¼, ⅛) keep small sheets sharp and cheap.
const _papers = new Map();

/** mipsOf(canvas) → [full, ½, ¼, ⅛]: the mip chain sheet() expects on any page-like object you build */
export function mipsOf(c0) {
  const mips = [c0];
  let src = c0;
  for (let s = 2; s <= 8; s *= 2) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(c0.width / s)); c.height = Math.max(1, Math.round(c0.height / s));
    const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(src, 0, 0, c.width, c.height);
    mips.push(c); src = c;
  }
  return mips;
}
export async function loadPaper(ep, pages) {
  const key = `${ep}|${pages.join(',')}`;
  if (_papers.has(key)) return _papers.get(key);
  const words = await (await fetch(`/${ep}/paper/words.json`)).json();
  const out = new Map();
  await Promise.all(pages.map(async (n) => {
    const img = new Image();
    img.src = `/${ep}/paper/page-${String(n).padStart(2, '0')}.png`;
    await img.decode();
    const mips = mipsOf(img);
    const wp = words.pages.find((p) => p.page === n);
    out.set(n, { n, img, mips, w: img.width, h: img.height, words: wp ? wp.words : [] });
  }));
  const api = { page: (n) => { const p = out.get(n); if (!p) throw new Error(`folio: page ${n} not loaded`); return p; } };
  _papers.set(key, api);
  return api;
}

const _norm = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
/**
 * findPhrase(page, 'based solely on attention', nth) → [{ x0, y0, x1, y1, n }] one box per line,
 * in page px, n = characters on that line (for sweeping progress). Throws if the phrase isn't there.
 */
export function findPhrase(page, phrase, nth = 1) {
  const target = phrase.split(/\s+/).map(_norm).filter(Boolean);
  const ws = page.words.filter((w) => _norm(w.w));   // footnote marks, "·" etc. never break a match
  let seen = 0;
  for (let i = 0; i + target.length <= ws.length; i++) {
    let ok = true;
    for (let j = 0; j < target.length; j++) if (_norm(ws[i + j].w) !== target[j]) { ok = false; break; }
    if (!ok || ++seen < nth) continue;
    const lines = [];
    for (const w of ws.slice(i, i + target.length)) {
      const L = lines.at(-1);
      if (L && Math.abs(L.y0 - w.y0) < (w.y1 - w.y0) * 0.5) { L.x1 = Math.max(L.x1, w.x1); L.y1 = Math.max(L.y1, w.y1); L.n += w.w.length + 1; }
      else lines.push({ x0: w.x0, y0: w.y0, x1: w.x1, y1: w.y1, n: w.w.length });
    }
    return lines;
  }
  throw new Error(`folio: phrase not found on page ${page.n}: "${phrase}"`);
}

// ── Rights ───────────────────────────────────────────────────────────────────
// Some papers can't be shown as they are: a logo you have no right to use, or a licence that
// doesn't allow showing the pages at all. Both helpers return a page-like object, so sheet(),
// highlight(), findPhrase(), cite() and liftPose() keep working on it. Build them in setup().

/**
 * masked(page, rects, { pad, fill }) — the page with each page-px rect painted over (a logo, a
 * header you can't explain). Same size and words as the page.
 */
export function masked(page, rects, { pad = 8, fill = F.paper } = {}) {
  const c = document.createElement('canvas');
  c.width = page.w; c.height = page.h;
  const g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(page.img, 0, 0, page.w, page.h);
  g.fillStyle = fill;
  for (const r of rects) g.fillRect(r.x0 - pad, r.y0 - pad, r.x1 - r.x0 + pad * 2, r.y1 - r.y0 + pad * 2);
  return { ...page, img: c, mips: mipsOf(c) };
}

/**
 * standIn(page, { blank, draw, scale, bar }) — a stand-in for a page you can't show: no bitmap of the
 * paper, only its geometry, every word as a grey bar where it sits. Words inside a `blank` rect
 * (page px) are left out, so `draw(g)` can redraw a figure or typeset a table there in page px
 * (from your own measured data). scale < 1 makes a cheaper canvas for sheets that stay small.
 */
export function standIn(page, { blank = [], draw, scale = 1, bar = '#D9D5CE' } = {}) {
  const c = document.createElement('canvas');
  c.width = Math.round(page.w * scale); c.height = Math.round(page.h * scale);
  const g = c.getContext('2d');
  g.fillStyle = F.paper; g.fillRect(0, 0, c.width, c.height);
  g.setTransform(scale, 0, 0, scale, 0, 0);
  g.fillStyle = bar;
  const inside = (w, r) => w.x0 >= r.x0 - 6 && w.x1 <= r.x1 + 6 && w.y0 >= r.y0 - 6 && w.y1 <= r.y1 + 6;
  for (const w of page.words) {
    if (blank.some((r) => inside(w, r))) continue;
    const h = w.y1 - w.y0;
    g.fillRect(w.x0, w.y0 + h * 0.25, w.x1 - w.x0, h * 0.55);
  }
  if (draw) { g.save(); draw(g); g.restore(); }
  return { n: page.n, img: c, mips: mipsOf(c), w: page.w, h: page.h, words: page.words };
}

// ── Camera ───────────────────────────────────────────────────────────────────
/**
 * cam({ tx, ty, pitch, yaw, dist, zoom }) → { p(x, y, z) → { x, y, k, depth } }
 * Looks at desk point (tx, ty). pitch 0 = straight down on the desk; ~0.9 = a seated view where
 * things standing on the desk read as 3D. yaw turns around the vertical. k = on-screen scale there.
 */
export function cam({ tx = W / 2, ty = H / 2, pitch = 0.12, yaw = 0, dist = 2400, zoom = 1, cx = W / 2, cy = H / 2 } = {}) {
  const cp = Math.cos(pitch), sp = Math.sin(pitch), cw = Math.cos(yaw), sw = Math.sin(yaw);
  const p = (x, y, z = 0) => {
    const dx = x - tx, dy = y - ty;
    const X = dx * cw - dy * sw, Y0 = dx * sw + dy * cw;
    const Y = Y0 * cp - z * sp, up = Y0 * sp + z * cp;
    const depth = Math.max(60, dist - up);
    const k = (dist / depth) * zoom;
    return { x: cx + X * k, y: cy + Y * k, k, depth };
  };
  // eye position in world coords (for back-face tests): along the view axis, dist away from the target
  const eye = [tx + dist * sp * sw, ty + dist * sp * cw, dist * cp];
  return { p, pitch, yaw, dist, zoom, tx, ty, eye };
}

/** cameraAt(t, keys) — eased camera path: keys [{ t, dur, tx, ty, pitch, yaw, dist, zoom }] → cam() */
export function cameraAt(t, keys) {
  let cur = { tx: W / 2, ty: H / 2, pitch: 0.12, yaw: 0, dist: 2400, zoom: 1, ...keys[0] };
  for (const k of keys.slice(1)) {
    const q = e(t, k.t, k.dur ?? 1.2, ease.inOutCubic);
    if (q <= 0) break;
    const nx = { ...cur, ...k };
    for (const f of ['tx', 'ty', 'pitch', 'yaw', 'dist', 'zoom']) cur[f] = lerp(cur[f], nx[f], q);
  }
  return cam(cur);
}

/**
 * camAt(t, keys) — cameraAt() that also eases the screen centre: a key may carry cx, cy (where the
 * look-at point lands on screen), so a subject can slide off-centre to make room for a label or a page.
 * Fields a key leaves out keep their current value.
 */
export function camAt(t, keys) {
  const FIELDS = ['tx', 'ty', 'pitch', 'yaw', 'dist', 'zoom', 'cx', 'cy'];
  const cur = { tx: W / 2, ty: H / 2, pitch: 0.12, yaw: 0, dist: 2400, zoom: 1, cx: W / 2, cy: H / 2 };
  for (const f of FIELDS) if (keys[0][f] !== undefined) cur[f] = keys[0][f];
  for (const k of keys.slice(1)) {
    const q = e(t, k.t, k.dur ?? 1.2, ease.inOutCubic);
    if (q <= 0) break;
    for (const f of FIELDS) if (k[f] !== undefined) cur[f] = lerp(cur[f], k[f], q);
  }
  return cam(cur);
}

// ── Stage ────────────────────────────────────────────────────────────────────
let _grain = null;
function grainTex() {
  if (_grain) return _grain;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const im = g.createImageData(W, H), r = rng(11);
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() - 0.5) * 34; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0);
  _grain = c;
  return c;
}

/** light desk: warm off-white, soft pool of light, static grain. Call first. */
export function desk(ctx, { light = [W * 0.5, H * 0.42] } = {}) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = F.desk;
  ctx.fillRect(0, 0, W, H);
  const m = Math.max(W, H);
  const g = ctx.createRadialGradient(light[0], light[1], 0, light[0], light[1], m * 0.75);
  g.addColorStop(0, F.deskLit);
  g.addColorStop(1, 'rgba(232,229,223,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, m * 0.78);
  v.addColorStop(0, 'rgba(60,50,35,0)');
  v.addColorStop(1, 'rgba(60,50,35,0.10)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.05;
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grainTex(), 0, 0);
  ctx.restore();
}

/** whole-frame fade at scene edges (multiply content alpha by it) */
export function edgeIn(t, dur, inDur = 0.35, outDur = 0.45) {
  return Math.min(clamp(t / inDur), clamp((dur - t) / outDur));
}

// ── Sheets ───────────────────────────────────────────────────────────────────
/**
 * Pose of a sheet: { x, y, z, w, rot, tilt, src }
 *   x, y   centre on the desk (world px) · z height above the desk · w width (world px)
 *   rot    turn around the vertical (rad) · tilt  page leaning up from its bottom edge (rad)
 *   src    optional crop of the page in page px { x0, y0, x1, y1 } (default: whole page)
 * sheetPt(page, pose, u, v) → world [x, y, z] of page pixel (u, v).
 */
export function sheetPt(page, pose, u, v) {
  const s = pose.src || { x0: 0, y0: 0, x1: page.w, y1: page.h };
  const sw = s.x1 - s.x0, sh = s.y1 - s.y0;
  const sc = pose.w / sw;
  let lx = (u - (s.x0 + sw / 2)) * sc, ly = (v - (s.y0 + sh / 2)) * sc, lz = 0;
  const tilt = pose.tilt || 0;
  if (tilt) { const hb = (sh / 2) * sc; const d = hb - ly; ly = hb - d * Math.cos(tilt); lz = d * Math.sin(tilt); }
  const r = pose.rot || 0, cr = Math.cos(r), sr = Math.sin(r);
  return [pose.x + lx * cr - ly * sr, pose.y + lx * sr + ly * cr, (pose.z || 0) + lz];
}

/** screen point of page pixel (u, v) */
export function onSheet(C, page, pose, u, v) { const [x, y, z] = sheetPt(page, pose, u, v); return C.p(x, y, z); }

function triAffine(ctx, img, s, d, mip) {
  // map source triangle s (image px of this mip) onto screen triangle d, clipped with a hair of overlap
  const [s0, s1, s2] = s, [d0, d1, d2] = d;
  const cx = (d0[0] + d1[0] + d2[0]) / 3, cy = (d0[1] + d1[1] + d2[1]) / 3;
  const grow = (q) => { const dx = q[0] - cx, dy = q[1] - cy, L = Math.hypot(dx, dy) || 1; return [q[0] + (dx / L) * 0.9, q[1] + (dy / L) * 0.9]; };
  const a0 = grow(d0), a1 = grow(d1), a2 = grow(d2);
  const ux = s1[0] - s0[0], uy = s1[1] - s0[1], vx = s2[0] - s0[0], vy = s2[1] - s0[1];
  const det = ux * vy - vx * uy;
  if (Math.abs(det) < 1e-6) return;
  const px = d1[0] - d0[0], py = d1[1] - d0[1], qx = d2[0] - d0[0], qy = d2[1] - d0[1];
  const A = (px * vy - qx * uy) / det, Cc = (qx * ux - px * vx) / det;
  const B = (py * vy - qy * uy) / det, D = (qy * ux - py * vx) / det;
  const E = d0[0] - (A * s0[0] + Cc * s0[1]), Fy = d0[1] - (B * s0[0] + D * s0[1]);
  ctx.save();
  ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); ctx.closePath(); ctx.clip();
  ctx.transform(A, B, Cc, D, E, Fy);
  const x0 = Math.max(0, Math.floor(Math.min(s0[0], s1[0], s2[0])) - 2), y0 = Math.max(0, Math.floor(Math.min(s0[1], s1[1], s2[1])) - 2);
  const x1 = Math.min(mip.width, Math.ceil(Math.max(s0[0], s1[0], s2[0])) + 2), y1 = Math.min(mip.height, Math.ceil(Math.max(s0[1], s1[1], s2[1])) + 2);
  if (x1 > x0 && y1 > y0) ctx.drawImage(mip, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
  ctx.restore();
}

/**
 * sheet(ctx, C, page, pose, { alpha, shadow, grid, edge }) — draw the page (or pose.src crop) in perspective.
 * Soft shadow on the desk grows with z. grid = subdivisions along the long side (more = less warp error).
 */
export function sheet(ctx, C, page, pose, { alpha = 1, shadow = 1, grid = 10, edge = true } = {}) {
  if (alpha <= 0) return;
  const s = pose.src || { x0: 0, y0: 0, x1: page.w, y1: page.h };
  const corners = [[s.x0, s.y0], [s.x1, s.y0], [s.x1, s.y1], [s.x0, s.y1]];
  const P = corners.map(([u, v]) => onSheet(C, page, pose, u, v));
  ctx.save();
  ctx.globalAlpha *= alpha;
  // shadow: the footprint on the desk, pushed away from the light and blurred by height
  if (shadow > 0) {
    const h = Math.max(0, pose.z || 0) + (pose.tilt ? 120 * Math.sin(pose.tilt) : 0);
    const off = 4 + h * 0.06, blur = 4 + h * 0.06;
    const foot = corners.map(([u, v]) => { const [x, y] = sheetPt(page, { ...pose, z: 0, tilt: 0 }, u, v); return C.p(x + off * 0.35, y + off, 0); });
    ctx.save();
    ctx.filter = `blur(${blur.toFixed(1)}px)`;
    ctx.globalAlpha *= shadow * clamp(0.26 - h * 0.0005, 0.07, 0.26);
    ctx.fillStyle = '#3A3226';
    ctx.beginPath(); foot.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // texture: pick the mip whose size is closest above the on-screen width
  const scrW = Math.hypot(P[1].x - P[0].x, P[1].y - P[0].y);
  const srcW = s.x1 - s.x0;
  let level = 0;
  while (level < page.mips.length - 1 && srcW * (page.mips[level + 1].width / page.w) >= scrW * 1.15) level++;
  const mip = page.mips[level], ms = mip.width / page.w;
  const flat = !(pose.tilt) && Math.abs(C.pitch) < 1e-4;
  ctx.fillStyle = F.paper;
  ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.fill();
  if (flat) {
    triAffine(ctx, mip, [[s.x0 * ms, s.y0 * ms], [s.x1 * ms, s.y0 * ms], [s.x0 * ms, s.y1 * ms]], [[P[0].x, P[0].y], [P[1].x, P[1].y], [P[3].x, P[3].y]], mip);
    triAffine(ctx, mip, [[s.x1 * ms, s.y0 * ms], [s.x1 * ms, s.y1 * ms], [s.x0 * ms, s.y1 * ms]], [[P[1].x, P[1].y], [P[2].x, P[2].y], [P[3].x, P[3].y]], mip);
  } else {
    const sh = s.y1 - s.y0;
    const nx = Math.max(2, Math.round(grid * Math.min(1, srcW / sh))), ny = Math.max(2, Math.round(grid * Math.min(1, sh / srcW)));
    const G = [];
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
      const u = lerp(s.x0, s.x1, i / nx), v = lerp(s.y0, s.y1, j / ny);
      const q = onSheet(C, page, pose, u, v);
      G.push({ s: [u * ms, v * ms], d: [q.x, q.y] });
    }
    const at = (i, j) => G[j * (nx + 1) + i];
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
      triAffine(ctx, mip, [a.s, b.s, d.s], [a.d, b.d, d.d], mip);
      triAffine(ctx, mip, [b.s, c.s, d.s], [b.d, c.d, d.d], mip);
    }
  }
  if (edge) {
    ctx.strokeStyle = 'rgba(40,35,25,0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.stroke();
  }
  ctx.restore();
}

/**
 * highlight(ctx, C, page, pose, lines, p, { color }) — marker over phrase lines (from findPhrase),
 * sweeping left to right line after line as p goes 0 → 1. Multiplied, so the print shows through.
 */
export function highlight(ctx, C, page, pose, lines, p, { color = F.hlYellow, alpha = 0.9, pad = 4 } = {}) {
  if (p <= 0) return;
  const total = lines.reduce((s, L) => s + L.n, 0);
  let acc = 0;
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  for (const L of lines) {
    const f = clamp((p * total - acc) / L.n);
    acc += L.n;
    if (f <= 0) break;
    const x0 = L.x0 - pad, x1 = lerp(L.x0, L.x1, f) + pad, y0 = L.y0 + (L.y1 - L.y0) * 0.02, y1 = L.y1 + pad * 0.6;
    const Q = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([u, v]) => onSheet(C, page, pose, u, v));
    ctx.beginPath(); Q.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

/** box around page-px rect r, drawn on the sheet (Create with p) — for pointing at a figure or a table cell */
export function markBox(ctx, C, page, pose, r, p = 1, { color = F.red, width = 4, pad = 8 } = {}) {
  if (p <= 0) return;
  const pts = [[r.x0 - pad, r.y0 - pad], [r.x1 + pad, r.y0 - pad], [r.x1 + pad, r.y1 + pad], [r.x0 - pad, r.y1 + pad], [r.x0 - pad, r.y0 - pad]]
    .map(([u, v]) => onSheet(C, page, pose, u, v));
  let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width * pts[0].k; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.setLineDash([L * clamp(p), L + 1]);
  ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke();
  ctx.restore();
}

/**
 * liftPose(page, from, rect, to, p) — pose of a crop that peels off `from` and travels to `to`.
 * rect = page px crop; to = { x, y, z, w, rot } (z defaults to 0 = lands on the desk).
 * Rises first (z arc peaks mid-flight), so it reads as paper being picked up, not a dissolve.
 */
export function liftPose(page, from, rect, to, p) {
  const cx = (rect.x0 + rect.x1) / 2, cy = (rect.y0 + rect.y1) / 2;
  const [sx, sy, sz] = sheetPt(page, from, cx, cy);
  const sw = from.w * (rect.x1 - rect.x0) / (from.src ? from.src.x1 - from.src.x0 : page.w);
  const q = ease.inOutCubic(clamp(p));
  const rise = Math.sin(Math.PI * clamp(p)) * (to.arc ?? 260);
  return {
    src: rect,
    x: lerp(sx, to.x, q), y: lerp(sy, to.y, q), z: lerp(sz, to.z ?? 0, q) + rise,
    w: lerp(sw, to.w, q), rot: lerp(from.rot || 0, to.rot || 0, q), tilt: lerp(from.tilt || 0, to.tilt || 0, q),
  };
}

/**
 * arcPose(from, to, p, h = 140) — a sheet pose between two poses, lifted on an arc that peaks at h
 * (world px) mid-move: a page picked up and put down somewhere else. p is used as given, so ease it
 * yourself (e(t, start, dur, ease.inOutCubic)). Carries `src` (the crop) from `to`, else from `from`.
 */
export function arcPose(from, to, p, h = 140) {
  const out = {
    x: lerp(from.x, to.x, p), y: lerp(from.y, to.y, p), z: lerp(from.z ?? 0, to.z ?? 0, p) + Math.sin(Math.PI * clamp(p)) * h,
    w: lerp(from.w, to.w, p), rot: lerp(from.rot ?? 0, to.rot ?? 0, p), tilt: lerp(from.tilt ?? 0, to.tilt ?? 0, p),
  };
  const src = to.src ?? from.src;
  if (src) out.src = src;
  return out;
}

// ── Paper you draw on ────────────────────────────────────────────────────────
// Our own animations live on paper too: a blank sheet (or a real page with ink on top) is drawn
// offscreen every frame and then laid on the desk with sheet(), so it tilts, lifts and casts a
// shadow like the real pages. Returns a page-like object for sheet/highlight/onSheet/liftPose.
const _canv = new Map();
function canvasFor(key, w, h) {
  let c = _canv.get(key);
  if (!c || c.width !== w || c.height !== h) { c = document.createElement('canvas'); c.width = w; c.height = h; _canv.set(key, c); }
  const g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  return [c, g];
}

/**
 * blankPage(key, w, h, draw, { scale, fill }) — a sheet of w × h "page px" you draw on with draw(g)
 * in page px (TeX, plots, grids…). key must be unique per sheet in the scene. scale < 1 renders
 * the offscreen canvas smaller (cheaper) for sheets that stay small on screen.
 */
export function blankPage(key, w, h, draw, { scale = 1, fill = F.paper } = {}) {
  const [c, g] = canvasFor(key, Math.round(w * scale), Math.round(h * scale));
  g.fillStyle = fill; g.fillRect(0, 0, c.width, c.height);
  g.setTransform(scale, 0, 0, scale, 0, 0);
  draw(g);
  return { n: key, img: c, mips: [c], w, h, words: [] };
}

/**
 * inked(page, key, draw, { scale }) — the real page with your ink on top (arrows, circles, numbers,
 * formulas written in the margin), drawn in page px. Same words as the page, so findPhrase still works.
 */
export function inked(page, key, draw, { scale = 0.6 } = {}) {
  const [c, g] = canvasFor(key, Math.round(page.w * scale), Math.round(page.h * scale));
  g.imageSmoothingQuality = 'high';
  g.drawImage(page.mips[scale > 0.5 ? 0 : 1], 0, 0, c.width, c.height);
  g.setTransform(scale, 0, 0, scale, 0, 0);
  draw(g);
  return { n: key, img: c, mips: [c], w: page.w, h: page.h, words: page.words };
}

/** sayWords(env, i, from, to, t) — 0..1 progress through words [from, to] of sentence i (inclusive) */
export function sayWords(env, i, from, to, t) {
  // word by word and weighted by characters, like sayP — the marker stays on the word being said
  const ws = env.timing.sentences[i].words.slice(from, to + 1);
  if (!ws.length || t <= ws[0].start) return 0;
  const total = ws.reduce((s, w) => s + w.w.length, 0);
  let acc = 0;
  for (const w of ws) {
    const end = w.end ?? w.start + 0.3;
    if (t < end) return clamp((acc + w.w.length * prog(t, w.start, end - w.start)) / total);
    acc += w.w.length;
  }
  return 1;
}

// ── 3D slabs ─────────────────────────────────────────────────────────────────
const shade = (col, f) => {
  // accepts #rrggbb or rgb()/rgba() (scenes mix palette colours either way)
  let rgb;
  if (col[0] === '#') { const n = parseInt(col.slice(1, 7), 16); rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  else rgb = (col.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 4).map(Number);
  const a = rgb.length > 3 ? rgb[3] : 1;   // keep rgba() alpha (tinted fills stay translucent)
  const c = rgb.slice(0, 3).map((v) => Math.round(clamp(v * f, 0, 255)));
  if (a < 1) return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

/**
 * slab(ctx, C, { x0, y0, x1, y1, z0, z1 }, { fill, stroke, width, alpha, label, labelSize })
 * Axis-aligned box standing on the desk: footprint x0..x1 × y0..y1, height z0..z1.
 * Visible faces only, shaded (top = fill, front darker, sides darker still), ink outline like the paper's figures.
 * Returns the screen centre of the front face (for labels / leader lines).
 */
export function slab(ctx, C, b, { fill = F.attn, stroke = F.ink, width = 2.2, alpha = 1, label, labelSize = 30, labelColor = F.ink } = {}) {
  if (alpha <= 0) return null;
  const v = (x, y, z) => C.p(x, y, z);
  const { x0, y0, x1, y1, z0, z1 } = b;
  const faces = [
    { pts: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], f: 1.0 },   // top
    { pts: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], f: 0.9 },   // front (+y)
    { pts: [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], f: 0.8 },   // right (+x)
    { pts: [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]], f: 0.8 },   // left (−x)
    { pts: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], f: 0.85 },  // back (−y)
  ];
  const drawn = faces.map((F_) => {
    const P = F_.pts.map(([x, y, z]) => v(x, y, z));
    let area = 0;
    for (let i = 0; i < 4; i++) { const a = P[i], c = P[(i + 1) % 4]; area += a.x * c.y - c.x * a.y; }
    const depth = P.reduce((s, q) => s + q.depth, 0) / 4;
    return { P, area, depth, f: F_.f };
  });
  // a face is visible when its projected outline isn't degenerate and it faces the camera:
  // pick by comparing each face with its opposite (the nearer one of each pair wins)
  // which side faces the camera: from the eye position when the camera provides it (correct for objects
  // off-centre), else the nearer face of each opposite pair
  const E = Array.isArray(C.eye) ? C.eye : C.eye && Number.isFinite(C.eye.x) ? [C.eye.x, C.eye.y, C.eye.z] : null;   // scenes' own cameras may pass {x, y, z}
  const vis = [drawn[0]];
  if (E) {
    if (E[1] > y1) vis.push(drawn[1]); else if (E[1] < y0) vis.push(drawn[4]);
    if (E[0] > x1) vis.push(drawn[2]); else if (E[0] < x0) vis.push(drawn[3]);
  } else {
    vis.push(drawn[1].depth < drawn[4].depth ? drawn[1] : drawn[4]);
    vis.push(drawn[2].depth < drawn[3].depth ? drawn[2] : drawn[3]);
  }
  vis.sort((a, b2) => b2.depth - a.depth);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineJoin = 'round';
  for (const fc of vis) {
    if (Math.abs(fc.area) < 1) continue;
    ctx.fillStyle = shade(fill, fc.f);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width * fc.P[0].k;
    ctx.beginPath(); fc.P.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath();
    ctx.fill(); ctx.stroke();
  }
  const fr = drawn[1].P;
  const mid = { x: (fr[0].x + fr[1].x + fr[2].x + fr[3].x) / 4, y: (fr[0].y + fr[1].y + fr[2].y + fr[3].y) / 4, k: fr[0].k };
  if (label) drawTex(ctx, label, mid.x, mid.y, { size: labelSize * mid.k, color: labelColor, align: 'center', valign: 'middle' });
  ctx.restore();
  return mid;
}

const _eye = (C) => (Array.isArray(C.eye) ? C.eye : C.eye && Number.isFinite(C.eye.x) ? [C.eye.x, C.eye.y, C.eye.z] : null);
const _path = (ctx, P) => { ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); };
const HEX_FACES = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];

/**
 * prism — a shaded solid with an ink outline, faces culled by the camera's eye (exact in perspective,
 * also for solids off-centre, rotated or tilted, where slab()'s axis-aligned faces don't fit).
 *   prism(ctx, C, V, o)            V = 8 world corners [x, y, z]: bottom ring then top ring, each ring in
 *                                  order (u0,v0) (u1,v0) (u1,v1) (u0,v1). Use it for a box on a rotated or
 *                                  tilted sheet (corners from sheetPt) or any hexahedron.
 *   prism(ctx, C, poly, z0, z1, o) poly = convex footprint [[x, y], …] on the desk, extruded from z0 to z1
 *                                  (trapezoids, hexagons, a box: [[x0,y0],[x1,y0],[x1,y1],[x0,y1]]).
 * o = { fill = F.paper, stroke = F.ink (null: no outline), width = 1.6 (world px), alpha = 1 }.
 * Faces facing up keep `fill`, sides darken (front 0.9, left/right/back 0.8). Returns the screen point
 * of the top face's centre { x, y, k } (for labels), or null when nothing is drawn.
 */
export function prism(ctx, C, V, z0, z1, o) {
  let verts, faces, top;
  if (typeof z0 === 'number') {
    o = o || {};
    if (!(z1 - z0 >= 0.3)) return null;
    const n = V.length, ids = [...Array(n).keys()];
    verts = [...V.map(([x, y]) => [x, y, z0]), ...V.map(([x, y]) => [x, y, z1])];
    faces = [ids, ids.map((i) => n + i), ...ids.map((i) => [i, (i + 1) % n, n + (i + 1) % n, n + i])];
    top = faces[1];
  } else {
    o = z0 || {};
    verts = V; faces = HEX_FACES; top = HEX_FACES[1];
  }
  const { fill = F.paper, stroke = F.ink, width = 1.6, alpha = 1 } = o;
  if (alpha <= 0) return null;
  const E = _eye(C), N = verts.length;
  const cen = [0, 1, 2].map((j) => verts.reduce((s, v) => s + v[j], 0) / N);
  const P = verts.map(([x, y, z]) => C.p(x, y, z));
  const vis = [];
  for (const f of faces) {
    let nx = 0, ny = 0, nz = 0, mx = 0, my = 0, mz = 0;
    for (let i = 0; i < f.length; i++) {   // Newell normal: robust for any planar polygon
      const a = verts[f[i]], b = verts[f[(i + 1) % f.length]];
      nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]);
      mx += a[0]; my += a[1]; mz += a[2];
    }
    mx /= f.length; my /= f.length; mz /= f.length;
    const L = Math.hypot(nx, ny, nz);
    if (L < 1e-6) continue;                 // a side of zero height
    nx /= L; ny /= L; nz /= L;
    if (nx * (mx - cen[0]) + ny * (my - cen[1]) + nz * (mz - cen[2]) < 0) { nx = -nx; ny = -ny; nz = -nz; }   // outward
    const seen = E ? nx * (E[0] - mx) + ny * (E[1] - my) + nz * (E[2] - mz) > 1e-6
      : C.p(mx + nx, my + ny, mz + nz).depth < C.p(mx, my, mz).depth;   // cameras without an eye: view-axis test
    if (!seen) continue;
    const Q = f.map((i) => P[i]);
    vis.push({ Q, f: clamp(0.8 + 0.2 * nz + 0.1 * Math.max(0, ny), 0.55, 1), d: Q.reduce((s, q) => s + q.depth, 0) / Q.length });
  }
  vis.sort((a, b) => b.d - a.d);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineJoin = 'round';
  for (const fc of vis) {
    _path(ctx, fc.Q);
    ctx.fillStyle = fc.f > 0.999 ? fill : shade(fill, fc.f);
    ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width * fc.Q[0].k; ctx.stroke(); }
  }
  ctx.restore();
  const tc = [0, 1, 2].map((j) => top.reduce((s, i) => s + verts[i][j], 0) / top.length);
  const c = C.p(tc[0], tc[1], tc[2]);
  return { x: c.x, y: c.y, k: c.k };
}

/**
 * arrow3(ctx, C, pts, p, o) — ink arrow along a 3D polyline pts [[x, y, z], …] (world), drawn on with
 * p 0 → 1; the head rides the growing tip. o = { color = F.ink, width = 3, head = true, headLen = 16,
 * alpha = 1 }; width and headLen are world px, so the arrow shrinks with distance like everything else.
 * Also accepts arrow3(ctx, C, pts, { p, …o }). Returns the tip's screen point { x, y, k }.
 */
export function arrow3(ctx, C, pts, p = 1, o = {}) {
  if (p !== null && typeof p === 'object') { o = p; p = o.p ?? 1; }
  const { color = F.ink, width = 3, head = true, headLen = 16, alpha = 1 } = o;
  if (!(p > 0) || alpha <= 0 || pts.length < 2) return null;
  const P = pts.map(([x, y, z = 0]) => C.p(x, y, z));
  const acc = [0];
  for (let i = 1; i < P.length; i++) acc.push(acc[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
  const L = acc.at(-1);
  if (L < 0.5) return null;
  const at = (s) => {   // screen point at arc length s, with the unit direction of its segment
    let i = 1;
    while (i < P.length - 1 && acc[i] < s) i++;
    const a = P[i - 1], b = P[i], seg = acc[i] - acc[i - 1];
    const f = seg > 1e-6 ? clamp((s - acc[i - 1]) / seg) : 1;
    return { x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f), k: lerp(a.k, b.k, f), i, ux: seg > 1e-6 ? (b.x - a.x) / seg : 0, uy: seg > 1e-6 ? (b.y - a.y) / seg : 0 };
  };
  const target = L * clamp(p), tip = at(target);
  if (!tip.ux && !tip.uy) { const d = Math.hypot(tip.x - P[0].x, tip.y - P[0].y) || 1; tip.ux = (tip.x - P[0].x) / d; tip.uy = (tip.y - P[0].y) / d; }
  const hl = head ? Math.min(headLen * tip.k, target * 0.6) : 0;
  const end = at(Math.max(0, target - hl * 0.6));   // the shaft stops inside the head, so its round cap never shows past the point
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = width * P[0].k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(P[0].x, P[0].y);
  for (let i = 1; i < end.i; i++) ctx.lineTo(P[i].x, P[i].y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  if (hl > 0.5) {
    const nx = -tip.uy, ny = tip.ux, bx = tip.x - tip.ux * hl, by = tip.y - tip.uy * hl;
    ctx.beginPath(); ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(bx + nx * hl * 0.45, by + ny * hl * 0.45); ctx.lineTo(bx - nx * hl * 0.45, by - ny * hl * 0.45);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  return { x: tip.x, y: tip.y, k: tip.k };
}

/**
 * contactShadow(ctx, C, shape, { z, alpha }) — soft shadow on the desk under something hovering at
 * height z (0 = resting on the desk). shape (world, desk plane): { x, y, r } a disc, { x0, y0, x1, y1 } a
 * rectangle, or [[x, y], …] a footprint. Higher = larger, lighter, blurrier, pushed away from the light
 * (same direction as sheet()'s shadows). Draw it before the object.
 */
export function contactShadow(ctx, C, shape, { z = 0, alpha = 1 } = {}) {
  if (alpha <= 0 || !shape) return;
  let foot;
  if (Array.isArray(shape)) foot = shape;
  else if (shape.r !== undefined) foot = Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [shape.x + shape.r * Math.cos(a), shape.y + shape.r * Math.sin(a)]; });
  else foot = [[shape.x0, shape.y0], [shape.x1, shape.y0], [shape.x1, shape.y1], [shape.x0, shape.y1]];
  const h = Math.max(0, z), grow = 1 + h / 400, off = 4 + h * 0.06;
  const cx = foot.reduce((s, q) => s + q[0], 0) / foot.length, cy = foot.reduce((s, q) => s + q[1], 0) / foot.length;
  const P = foot.map(([x, y]) => C.p(cx + (x - cx) * grow + off * 0.35, cy + (y - cy) * grow + off, 0));
  ctx.save();
  ctx.filter = `blur(${Math.max(1, (3 + h * 0.04) * P[0].k).toFixed(1)}px)`;
  ctx.globalAlpha *= alpha * clamp(0.24 - h * 0.0005, 0.06, 0.24);
  ctx.fillStyle = '#3A3226';
  _path(ctx, P); ctx.fill();
  ctx.restore();
}

// ── Labels ───────────────────────────────────────────────────────────────────
/**
 * tag(ctx, src, x, y, o) — a TeX label on a small white paper slip with a soft shadow, in screen px, so it
 * reads over a busy page, a heatmap or a 3D part. o = { size = 50, color = F.ink, align 'left'|'center'|
 * 'right', valign 'baseline'|'middle'|'top'|'bottom', write = 1 (Manim Write 0 → 1; the slip fades in
 * with it), alpha = 1, pad = 12, fill }. Returns the slip's box { x, y, w, h }.
 */
export function tag(ctx, src, x, y, { size = 50, color = F.ink, align = 'left', valign = 'baseline', write = 1, alpha = 1, pad = 12, fill = 'rgba(255,255,255,0.95)' } = {}) {
  const sz = texSize(src, size), depth = sz.h - sz.asc, py = Math.round(pad * 2 / 3);
  const x0 = align === 'right' ? x - sz.w : align === 'center' ? x - sz.w / 2 : x;
  const yb = valign === 'middle' ? y + (sz.asc - depth) / 2 : valign === 'top' ? y + sz.asc : valign === 'bottom' ? y - depth : y;
  const box = { x: x0 - pad, y: yb - sz.asc - py, w: sz.w + pad * 2, h: sz.h + py * 2 };
  if (alpha <= 0 || write <= 0) return box;
  ctx.save();
  ctx.globalAlpha *= alpha * clamp(write * 3);
  ctx.fillStyle = fill;
  ctx.shadowColor = 'rgba(40,30,20,0.16)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
  ctx.beginPath(); ctx.roundRect(box.x, box.y, box.w, box.h, 6); ctx.fill();
  ctx.restore();
  drawTex(ctx, src, x, y, { size, color, align, valign, write, alpha });
  return box;
}

// ── Source stamp ─────────────────────────────────────────────────────────────
/**
 * cite(ctx, page, { label, rect, alpha, x, y }) — the persistent "where in the paper" stamp, bottom-left:
 * a thumbnail of the page with the region being discussed boxed, and a TeX label (§3.2 · p.~3).
 */
export function cite(ctx, page, { label = '', rect, alpha = 1, side = 'left', y = H - 56, w = 92 } = {}) {
  if (alpha <= 0) return;
  const h = w * page.h / page.w;
  const right = side === 'right', x = right ? W - 56 - w : 56;
  const a0 = ctx.globalAlpha;   // follow the scene's edge fade
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = alpha * a0;
  ctx.save();
  ctx.shadowColor = 'rgba(40,30,20,0.22)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
  ctx.fillStyle = F.paper; ctx.fillRect(x, y - h, w, h);
  ctx.restore();
  ctx.drawImage(page.mips[Math.min(3, page.mips.length - 1)], x, y - h, w, h);
  if (rect) {
    const s = w / page.w;
    ctx.strokeStyle = F.red; ctx.lineWidth = 2;
    ctx.strokeRect(x + rect.x0 * s - 2, y - h + rect.y0 * s - 2, (rect.x1 - rect.x0) * s + 4, (rect.y1 - rect.y0) * s + 4);
  }
  if (label) {
    // a paper slip behind the label, so it reads over any page lying under the corner
    const sz = texSize(label, 30), lx = right ? x - 22 - sz.w : x + w + 22;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.97)';
    ctx.shadowColor = 'rgba(40,30,20,0.16)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
    ctx.beginPath(); ctx.roundRect(lx - 12, y - 4 - sz.h - 8, sz.w + 24, sz.h + 16, 6); ctx.fill();
    ctx.restore();
    drawTex(ctx, label, right ? x - 22 : x + w + 22, y - 4, { size: 30, color: F.ink2, valign: 'bottom', align: right ? 'right' : 'left' });
  }
  ctx.restore();
}

/**
 * endCard(ctx, C, page, p, { lines }) — the closing card every paper video shares: page 1 slides
 * back onto the desk on the left, the full citation is written on the right.
 * lines = [{ tex, size?, color? }, …] top to bottom (title, authors, venue · year, \texttt{url}).
 * p 0 → 1 drives the whole entrance (page arc + staggered Write). Uses its own pose; pass the scene camera.
 */
/** endCardPose(p) — the page pose endCard uses at progress p, for highlighting the title/authors on it in sync */
export function endCardPose(p) {
  const q = ease.outCubic(clamp(p * 1.6));
  return { x: lerp(-500, 560, q), y: 560, z: Math.sin(Math.PI * clamp(p * 1.6)) * 140, w: 600, rot: lerp(-0.2, -0.035, q) };
}

export function endCard(ctx, C, page, p, { lines = [], x = 1060, y = 380, gap = 18 } = {}) {
  if (p <= 0) return;
  sheet(ctx, C, page, endCardPose(p));
  let yy = y;
  lines.forEach((L, i) => {
    const size = L.size ?? (i === 0 ? 60 : 36);
    yy += size * 0.9;
    drawTex(ctx, L.tex, x, yy, { size, color: L.color ?? (i === 0 ? F.ink : F.ink2), write: clamp((p - 0.2 - i * (0.45 / Math.max(1, lines.length))) / 0.3) });
    yy += gap + size * 0.25;
  });
}

// ── Narration helpers ────────────────────────────────────────────────────────
const _normA = (w) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
/**
 * cueBook(env) — strict per-sentence word cues, case- and accent-insensitive. Land every beat on a word:
 *   q.s(i) sentence i's start · q.e(i) its end · q.w(i, 'word', nth = 1) start of that word in sentence i
 *   q.we(i, 'word', nth = 1) its end. w/we throw if the word isn't in the sentence, so a narration edit
 *   that moves a cue fails loudly at render time instead of drifting.
 */
export function cueBook(env) {
  const S = env.timing.sentences;
  const find = (i, word, nth) => {
    const m = _normA(word);
    let k = 0;
    for (const x of S[i].words) if (_normA(x.w) === m && ++k === nth) return x;
    throw new Error(`cue missing: sentence ${i} "${word}" #${nth}`);
  };
  return {
    s: (i) => S[i].start,
    e: (i) => S[i].end,
    w: (i, word, nth = 1) => find(i, word, nth).start,
    we: (i, word, nth = 1) => find(i, word, nth).end,
  };
}

/** sayP(env, i, t) — 0..1 progress through sentence i, word by word (for highlights that follow the voice) */
export function sayP(env, i, t) {
  const S = env.timing.sentences[i];
  const ws = S.words;
  if (!ws.length || t <= ws[0].start) return 0;
  const total = ws.reduce((s, w) => s + w.w.length, 0);
  let acc = 0;
  for (const w of ws) {
    const end = w.end ?? w.start + 0.3;
    if (t < end) return clamp((acc + w.w.length * prog(t, w.start, end - w.start)) / total);
    acc += w.w.length;
  }
  return 1;
}

export { K };
