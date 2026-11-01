// loop — Section 2 on p. 3: the idea line read with the voice, Â = A ∪ L lifted off and rebuilt with
// its two tags, the context formulas lifted into the base of a context stack. The loop stands up in 3D
// (Thought · Action · Observation + the Wikipedia slab outside the ring: only Action crosses to it,
// Thought drops straight into the context). Then Figure 1 (1d) is replayed card by card: each step is a
// real crop lifted off p. 2 (observations come out of the Wikipedia slab), shown at its station, then
// dropped onto the context stack. At the end the stack fans out into a column with green leaders from
// each fact to the observation it came from.
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, texSize, desk, edgeIn, loadPaper, findPhrase, cam, cameraAt, sheet, sheetPt,
  onSheet, highlight, markBox, liftPose, slab, cite, sayP, sayWords, blankPage,
} from '/engine/folio.js';
import { PAL, LOOP, P3, FIG1, FIG1_STEPS } from './_data.js';

const S = {
  c3: '\\text{p. 3}\\;\\cdot\\;\\text{Section 2}',
  c2: '\\text{p. 2}\\;\\cdot\\;\\text{Figure 1 (1d)}',
  actions: '\\text{actions}',
  lang: '\\text{language: thoughts}',
  thought: LOOP.stations.thought.label,
  act: LOOP.stations.act.label,
  obs: LOOP.stations.obs.label,
  wiki: LOOP.env.label,
  ctx: '\\text{context}',
};
const AUG = ['\\hat{\\mathcal{A}}', '=', '\\mathcal{A}', '\\cup', '\\mathcal{L}'];

let p2, p3, L;

// ── colour helpers ───────────────────────────────────────────────────────────
const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mix = (a, b, p) => { const A = rgb(a), B = rgb(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(p)))).join(',')})`; };
const shade = (h, f) => `rgb(${rgb(h).map((v) => Math.round(clamp(v * f, 0, 255))).join(',')})`;
const grow = (r, px = 6, py = 3) => ({ x0: r.x0 - px, y0: r.y0 - py, x1: r.x1 + px, y1: r.y1 + py });
const poly = (ctx, P) => { ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); };

// ── page 3 (Section 2) ───────────────────────────────────────────────────────
const P3_REST = { x: 820, y: 560, w: 860, rot: -0.012 };
const PARA = { x0: 296, y0: 1090, x1: 1406, y1: 1575 };          // Section 2 heading → c_{t+1} line (stamp box)
const AUGC = grow(P3.aug, 7, 4);
const CTXDEF = grow(P3.ctxDef, 7, 3);
const CTXUPD = grow(P3.ctxUpd, 7, 3);
const AUGCARD = { w: 900, h: 470 };                             // our TeX rebuild, page px of its blank sheet

// ── page 2 (Figure 1d) and its green highlights, measured from page-02.png ───
const P2_REST = { x: 250, y: 540, w: 400, rot: 0.025 };
const GREEN = {
  Obs1: [{ x0: 873, y0: 349, x1: 1059, y1: 365 }],                                              // Front Row media center
  Thought2: [{ x0: 1323, y0: 399, x1: 1364, y1: 415 }, { x0: 873, y0: 416, x1: 898, y1: 430 }],  // Front / Row
  Obs2: [{ x0: 1221, y0: 464, x1: 1296, y1: 481 }, { x0: 873, y0: 481, x1: 957, y1: 496 }],      // Front Row / (software)
  Thought3: [{ x0: 1312, y0: 514, x1: 1353, y1: 530 }, { x0: 873, y0: 531, x1: 992, y1: 546 }],
  Thought4: [{ x0: 960, y0: 596, x1: 1353, y1: 612 }, { x0: 873, y0: 613, x1: 1185, y1: 628 }],  // … keyboard function keys.
};
const NOTFOUND = { x0: 930, y0: 450, x1: 1046, y1: 465 };       // "Could not find" in Obs 2 (word gaps from the PNG)

// ── cards: the question, the 11 steps of (1d), the figure's ✓ ────────────────
const PAD = 7;
const KIND = {
  q: { fill: '#FFFFFF', ink: F.ink2 },
  thought: { fill: PAL.thought, ink: PAL.thoughtInk },
  act: { fill: PAL.act, ink: PAL.actInk },
  obs: { fill: PAL.obs, ink: PAL.obsInk },
  check: { fill: '#FFFFFF', ink: PAL.goodMark },
};
const CARDS = [
  { id: 'Q', k: 'q', r: FIG1.panels.q },
  ...FIG1_STEPS.d1.map((s) => ({ id: s.id, k: s.k, r: s })),
  { id: 'check', k: 'check', r: FIG1.marks.d1 },
].map((c, i) => ({ ...c, i, cw: c.r.x1 - c.r.x0 + 2 * PAD, ch: c.r.y1 - c.r.y0 + 2 * PAD }));
const CARD = Object.fromEntries(CARDS.map((c) => [c.id, c]));
const toCard = (c, r) => ({ x0: r.x0 - c.r.x0 + PAD, y0: r.y0 - c.r.y0 + PAD, x1: r.x1 - c.r.x0 + PAD, y1: r.y1 - c.r.y0 + PAD });

// ── the loop (all from LOOP) ─────────────────────────────────────────────────
const ST = LOOP.stations, SL = LOOP.slab, EV = LOOP.env, SK = LOOP.stack, RC = LOOP.c, RR = LOOP.r;
const ang = (s) => Math.atan2(s.y - RC.y, s.x - RC.x);
const onRing = (a, z) => [RC.x + RR * Math.cos(a), RC.y + RR * Math.sin(a), z];
const inFoot = (s, x, y, m) => Math.abs(x - s.x) < SL.w / 2 + m && Math.abs(y - s.y) < SL.d / 2 + m;
/** angle where the ring leaves station s's footprint (+ margin), walking from its centre in direction dir */
function exitAng(s, dir, m = 16) {
  let a = ang(s);
  for (let i = 0; i < 400 && inFoot(s, ...onRing(a, 0), m); i++) a += dir * 0.004;
  return a;
}
const TWO_PI = Math.PI * 2;
const A_T = ang(ST.thought), A_A = ang(ST.act) + (ang(ST.act) < A_T ? TWO_PI : 0), A_O = ang(ST.obs);
const ARC_Z = SL.h * 0.5;
const sampleArc = (a0, a1, z, n = 36) => Array.from({ length: n + 1 }, (_, i) => onRing(lerp(a0, a1, i / n), z));
const bez = (P0, P1, P2, n = 24) => Array.from({ length: n + 1 }, (_, i) => {
  const u = i / n, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
  return [0, 1, 2].map((k) => a * P0[k] + b * P1[k] + c * P2[k]);
});
/** the ring's arrows as world polylines; ts (thought → context) ends on the current stack top */
export function ringPaths(stackTop = 0) {
  const ea = EV.h * 0.5;
  return {
    ta: sampleArc(exitAng(ST.thought, 1), exitAng(ST.act, -1) + (exitAng(ST.act, -1) < A_T ? TWO_PI : 0), ARC_Z),
    aw: bez([ST.act.x + SL.w / 2 + 16, ST.act.y + 12, ARC_Z], [EV.x0 - 30, ST.act.y + 12, ea], [EV.x0 - 16, EV.y0 + 60, ea]),
    wo: bez([EV.x0 - 16, EV.y1 - 60, ea], [EV.x0 - 30, ST.obs.y - 12, ea], [ST.obs.x + SL.w / 2 + 16, ST.obs.y - 12, ARC_Z]),
    ot: sampleArc(exitAng(ST.obs, 1), exitAng(ST.thought, -1), ARC_Z),
    ts: bez([ST.thought.x + SL.w / 2 - 20, ST.thought.y, SL.h + 6], [(ST.thought.x + SL.w / 2 + SK.x - SK.w / 2) / 2 + 20, SK.y, Math.max(SL.h, stackTop) + 80], [SK.x - SK.w / 2 + 70, SK.y, stackTop + 6]),
  };
}

function project(C, pts) {
  const P = pts.map(([x, y, z]) => C.p(x, y, z));
  const len = [0];
  for (let i = 1; i < P.length; i++) len.push(len[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
  return { P, len, total: len.at(-1) };
}
/** point at fraction f of a projected polyline: { x, y, dx, dy, k } */
function along(pr, f) {
  const d = clamp(f) * pr.total;
  let i = 1;
  while (i < pr.P.length - 1 && pr.len[i] < d) i++;
  const a = pr.P[i - 1], b = pr.P[i], seg = pr.len[i] - pr.len[i - 1] || 1, u = clamp((d - pr.len[i - 1]) / seg);
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), dx: (b.x - a.x) / seg, dy: (b.y - a.y) / seg, k: lerp(a.k, b.k, u) };
}
function strokeTo(ctx, pr, f0, f1) {
  const d0 = f0 * pr.total, d1 = f1 * pr.total;
  const s = along(pr, f0);
  ctx.beginPath(); ctx.moveTo(s.x, s.y);
  for (let i = 1; i < pr.P.length; i++) if (pr.len[i] > d0 && pr.len[i] < d1) ctx.lineTo(pr.P[i].x, pr.P[i].y);
  const t = along(pr, f1); ctx.lineTo(t.x, t.y);
  ctx.stroke();
}
/** arrow drawn on along a world polyline (p 0 → 1), with a faint shadow on the desk */
function arrow3(ctx, C, pts, p, { color = F.ink, width = 4, head = 17, shadow = false } = {}) {
  if (p <= 0) return;
  const pr = project(C, pts);
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (shadow) {
    const sp = project(C, pts.map(([x, y]) => [x + 6, y + 10, 0]));
    ctx.strokeStyle = 'rgba(58,50,38,0.10)'; ctx.lineWidth = width * sp.P[0].k * 1.4;
    strokeTo(ctx, sp, 0, p);
  }
  const tip = along(pr, p);
  ctx.strokeStyle = color; ctx.lineWidth = width * tip.k;
  strokeTo(ctx, pr, 0, Math.max(0, p - (head * tip.k * 0.6) / pr.total));
  if (p > 0.12) {
    const L_ = head * tip.k, nx = -tip.dy, ny = tip.dx;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(tip.x - tip.dx * L_ + nx * L_ * 0.5, tip.y - tip.dy * L_ + ny * L_ * 0.5);
    ctx.lineTo(tip.x - tip.dx * L_ - nx * L_ * 0.5, tip.y - tip.dy * L_ - ny * L_ * 0.5);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
/** a pulse travelling along a world polyline (p 0 → 1) */
function pulse3(ctx, C, pts, p, color) {
  if (p <= 0 || p >= 1) return;
  const pr = project(C, pts);
  const a = Math.sin(Math.PI * p);
  const head = along(pr, p);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color; ctx.lineWidth = 10 * head.k;
  strokeTo(ctx, pr, Math.max(0, p - 0.16), p);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(head.x, head.y, 9 * head.k, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/**
 * ring(ctx, C, R) — the loop of Section 2 standing on the desk (kit candidate; segments 4, 6, 8 can copy it).
 * R = { rise: {thought, act, obs, env}, foot, arrows: {ta, aw, wo, ot, ts}, pulses: [{ path, p, color }],
 *       hop, active: {thought, act, obs}, labels, stackTop, mid(ctx) }   — mid draws what sits inside the ring.
 */
export function ring(ctx, C, R) {
  const rise = R.rise || {}, act = R.active || {}, A = R.arrows || {};
  const paths = ringPaths(R.stackTop || 0);
  // pencil footprints on the desk (where the stations will stand)
  const foot = R.foot || 0;
  if (foot > 0) {
    ctx.save();
    const a0 = ctx.globalAlpha;
    ctx.strokeStyle = F.ink3; ctx.setLineDash([10, 8]); ctx.lineWidth = 2;
    const rects = [ST.thought, ST.act, ST.obs].map((s) => ({ x0: s.x - SL.w / 2, y0: s.y - SL.d / 2, x1: s.x + SL.w / 2, y1: s.y + SL.d / 2 }));
    if ((R.envFoot || 0) > 0) rects.push({ ...EV, f: R.envFoot });
    rects.forEach((r) => {
      const P = [[r.x0, r.y0], [r.x1, r.y0], [r.x1, r.y1], [r.x0, r.y1]].map(([x, y]) => C.p(x, y, 0));
      ctx.globalAlpha = a0 * (r.f ?? foot) * 0.7;
      poly(ctx, P); ctx.stroke();
    });
    ctx.restore();
  }
  const station = (key, kind) => {
    const r = rise[key] || 0;
    if (r <= 0) return null;
    const s = ST[key], K_ = KIND[kind], on = act[key] || 0, z0 = (key === 'thought' ? R.hop || 0 : 0) + on * 10;
    const b = { x0: s.x - SL.w / 2, x1: s.x + SL.w / 2, y0: s.y - SL.d / 2, y1: s.y + SL.d / 2, z0, z1: z0 + SL.h * r };
    slab(ctx, C, b, { fill: K_.fill, stroke: mix(K_.ink, F.ink, 0.25 * (1 - on)), width: 2.4 + 2.2 * on, alpha: clamp(r * 3) });
    return C.p(s.x, s.y, b.z1);   // label sits on the top face (the front face takes the arrowheads)
  };
  const labelAt = (top, src, w, color, size) => {
    if (!top || w <= 0) return;
    drawTex(ctx, src, top.x, top.y, { size: size * top.k, color, align: 'center', valign: 'middle', write: w });
  };
  const lab = R.labels || {};
  // back to front: Action (far) · ring arrow behind Thought · Thought · the stack · Wikipedia · Observation (near)
  labelAt(station('act', 'act'), S.act, lab.act ?? 0, PAL.actInk, 40);
  arrow3(ctx, C, paths.ta, A.ta || 0);
  labelAt(station('thought', 'thought'), S.thought, lab.thought ?? 0, PAL.thoughtInk, 40);
  if (R.mid) R.mid(ctx);
  arrow3(ctx, C, paths.ts, A.ts || 0, { color: PAL.thoughtInk, width: 3.6, head: 15 });
  if ((rise.env || 0) > 0) {
    const r = rise.env;
    slab(ctx, C, { x0: EV.x0, x1: EV.x1, y0: EV.y0, y1: EV.y1, z0: 0, z1: EV.h * r }, { fill: PAL.env, stroke: F.ink, width: 2.4, alpha: clamp(r * 3) });
    labelAt(C.p((EV.x0 + EV.x1) / 2, (EV.y0 + EV.y1) / 2, EV.h * r), S.wiki, lab.env ?? 0, F.ink, 46);
  }
  arrow3(ctx, C, paths.aw, A.aw || 0, { color: PAL.actInk });
  labelAt(station('obs', 'obs'), S.obs, lab.obs ?? 0, PAL.obsInk, 38);
  // only Action crosses to Wikipedia; Thought drops straight into the context
  arrow3(ctx, C, paths.wo, A.wo || 0, { color: PAL.obsInk });
  arrow3(ctx, C, paths.ot, A.ot || 0);
  for (const pl of R.pulses || []) {
    if (pl.path === 'lap') {
      const seq = ['ta', 'aw', 'wo', 'ot'];
      const lens = seq.map((k) => project(C, paths[k]).total), tot = lens.reduce((a, b) => a + b, 0);
      let acc = 0;
      seq.forEach((k, i) => {
        const f = (pl.p * tot - acc) / lens[i];
        if (f > 0 && f < 1) pulse3(ctx, C, paths[k], f, pl.color);
        acc += lens[i];
      });
    } else pulse3(ctx, C, paths[pl.path], pl.p, pl.color);
  }
}

// ── cards ────────────────────────────────────────────────────────────────────
/** the card's sheet: tinted paper, the real crop multiplied on top, our ink marks, outline in its colour */
function cardPage(c, tintP, marks = []) {
  const K_ = KIND[c.k];
  return blankPage(`react-loop-card-${c.id}`, c.cw, c.ch, (g) => {
    g.fillStyle = mix('#FFFFFF', K_.fill, tintP); g.fillRect(0, 0, c.cw, c.ch);
    const rw = c.r.x1 - c.r.x0, rh = c.r.y1 - c.r.y0;
    g.globalCompositeOperation = 'multiply';
    g.drawImage(p2.img, c.r.x0 - 2, c.r.y0, rw + 4, rh - 1, PAD - 2, PAD, rw + 4, rh - 1);   // rows y0..y1-1: the next step's highlight starts at y1
    g.globalCompositeOperation = 'source-over';
    for (const m of marks) {
      if (m.p <= 0) continue;
      const r = toCard(c, m.r);
      g.save();
      g.strokeStyle = m.color; g.lineWidth = m.width ?? 3; g.lineCap = 'round'; g.lineJoin = 'round';
      if (m.kind === 'under') {
        g.beginPath(); g.moveTo(r.x0, r.y1 + 3); g.lineTo(lerp(r.x0, r.x1, clamp(m.p)), r.y1 + 3); g.stroke();
      } else {
        const px = 4, py = 1.5, pts = [[r.x0 - px, r.y0 - py], [r.x1 + px, r.y0 - py], [r.x1 + px, r.y1 + py], [r.x0 - px, r.y1 + py], [r.x0 - px, r.y0 - py]];
        let tot = 0; for (let i = 1; i < pts.length; i++) tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        g.setLineDash([tot * clamp(m.p), tot + 1]);
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
      }
      g.restore();
    }
    g.globalAlpha = tintP;
    g.strokeStyle = K_.ink; g.lineWidth = 3;
    g.strokeRect(1.5, 1.5, c.cw - 3, c.ch - 3);
  });
}

/** centre-based card state { x, y, z, w, tilt, rot } → sheet pose (tilt pivots on the bottom edge) */
function poseOf(c, s) {
  const hb = (s.w * c.ch / c.cw) / 2, cr = Math.cos(s.rot || 0), sr = Math.sin(s.rot || 0), u = hb * (1 - Math.cos(s.tilt || 0));
  return { x: s.x + u * sr, y: s.y - u * cr, z: s.z - hb * Math.sin(s.tilt || 0), w: s.w, rot: s.rot || 0, tilt: s.tilt || 0 };
}
function fly(a, b, p, arc = 160) {
  const q = ease.inOutCubic(clamp(p));
  const o = {};
  for (const f of ['x', 'y', 'z', 'w', 'tilt', 'rot']) o[f] = lerp(a[f] || 0, b[f] || 0, q);
  o.z += Math.sin(Math.PI * clamp(p)) * arc;
  return o;
}
/** thin box under a card lying on the stack: front and side edges in the card's colour */
function cardEdge(ctx, C, c, s, th) {
  if (th <= 0.5) return;
  const K_ = KIND[c.k], h = s.w * c.ch / c.cw, hw = s.w / 2, hd = h / 2, cr = Math.cos(s.rot || 0), sr = Math.sin(s.rot || 0);
  const P = (u, v, z) => C.p(s.x + u * cr - v * sr, s.y + u * sr + v * cr, z);
  const z1 = s.z, z0 = s.z - th;
  const faces = [[[-hw, hd], [hw, hd]], [[hw, -hd], [-hw, -hd]], [[hw, hd], [hw, -hd]], [[-hw, -hd], [-hw, hd]]].map(([a, b], i) => {
    const Q = [P(a[0], a[1], z0), P(b[0], b[1], z0), P(b[0], b[1], z1), P(a[0], a[1], z1)];
    return { Q, d: Q.reduce((sum, q) => sum + q.depth, 0) / 4, f: i < 2 ? 0.86 : 0.78 };
  });
  const vis = [faces[0].d < faces[1].d ? faces[0] : faces[1], faces[2].d < faces[3].d ? faces[2] : faces[3]].sort((a, b) => b.d - a.d);
  ctx.save();
  ctx.lineJoin = 'round';
  for (const f of vis) {
    ctx.fillStyle = shade(K_.fill === '#FFFFFF' ? '#F4F2EE' : K_.fill, f.f);
    ctx.strokeStyle = K_.ink; ctx.lineWidth = 1.3 * f.Q[0].k;
    poly(ctx, f.Q); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

/** world point (x, y) at height z that projects to screen (sx, sy) under camera C */
function unproject(C, sx, sy, z) {
  let x = C.tx, y = C.ty;
  for (let i = 0; i < 40; i++) {
    const q = C.p(x, y, z), ex = sx - q.x, ey = sy - q.y;
    if (Math.abs(ex) + Math.abs(ey) < 0.05) break;
    const qx = C.p(x + 1, y, z), qy = C.p(x, y + 1, z);
    const a = qx.x - q.x, b = qy.x - q.x, c = qx.y - q.y, d = qy.y - q.y, det = a * d - b * c;
    x += (d * ex - b * ey) / det; y += (-c * ex + a * ey) / det;
  }
  return [x, y];
}

// replay framing: slots are fixed screen spots under this camera, turned into world points once
const RCAM = { tx: 975, ty: 565, pitch: 0.95, zoom: 1.0, dist: 2400, yaw: 0 };
const SLOT_SCALE = 1.9;                       // screen px per page px at a station: Figure 1's lines read at ~30 px
const SLOTS = { q: [960, 230, 260], thought: [575, 240, 240], act: [1420, 240, 240], obs: [1235, 900, 90] };
let _slot = null;
function slotState(c, C) {
  if (!_slot) {
    const C = cam(RCAM);
    _slot = Object.fromEntries(Object.entries(SLOTS).map(([k, [sx, sy, z]]) => { const [x, y] = unproject(C, sx, sy, z); return [k, { x, y, z, k: C.p(x, y, z).k }]; }));
  }
  const s = _slot[c.k === 'q' ? 'q' : c.k];
  return { x: s.x, y: s.y, z: s.z, w: (c.cw * SLOT_SCALE) / s.k, tilt: C.pitch, rot: -C.yaw };
}

// the stack, in order: Q, the 11 steps, ✓ — each one LOOP.stack.dz higher
const stackState = (c) => (c.k === 'check'
  ? { x: SK.x + 60, y: SK.y + 4, z: c.i * SK.dz + 3, w: 64, tilt: 0, rot: 0.05 }
  : { x: SK.x + 4, y: SK.y, z: (c.i + 1) * SK.dz - 1, w: SK.w - 14, tilt: 0, rot: [0.006, -0.009, 0.01, -0.005, 0.008, -0.011, 0.004, -0.007, 0.01, -0.003, 0.007, -0.009][c.i] || 0 });

// the final column (flat on the desk, left of the ring), in order, left-aligned like the figure
const COL = { x0: -150, yc: 590, s: 1.18, gap: 6, turnGap: 18 };
let _col = null;
function colState(c) {
  if (!_col) {
    const list = CARDS.filter((d) => d.k !== 'check');
    let tot = 0;
    list.forEach((d, i) => { tot += d.ch + (i ? (['Q', 'Obs1', 'Obs2', 'Obs3'].includes(list[i - 1].id) ? COL.turnGap : COL.gap) : 0); });
    let y = COL.yc - (tot * COL.s) / 2;
    _col = {};
    list.forEach((d, i) => {
      if (i) y += (['Q', 'Obs1', 'Obs2', 'Obs3'].includes(list[i - 1].id) ? COL.turnGap : COL.gap) * COL.s;
      const w = d.cw * COL.s, h = d.ch * COL.s;
      _col[d.id] = { x: COL.x0 + w / 2, y: y + h / 2, z: 0.5, w, tilt: 0, rot: 0 };
      y += h;
    });
    const a4 = _col.Act4, ck = CARD.check;
    _col.check = { x: COL.x0 + CARD.Act4.cw * COL.s + 14 + (ck.cw * COL.s) / 2, y: a4.y, z: 0.5, w: ck.cw * COL.s, tilt: 0, rot: 0 };
  }
  return _col[c.id];
}

export default {
  async setup(env) {
    await loadB1B();
    [...Object.values(S), ...AUG].forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [2, 3]);
    p2 = P.page(2); p3 = P.page(3);
    L = {
      idea: findPhrase(p3, 'The idea of ReAct is simple:'),
      augment: findPhrase(p3, 'we augment the agent\'s action space to'),
      affect: findPhrase(p3, 'does not affect the external environment,'),
      thus: findPhrase(p3, 'thus leading to no observation feedback.'),
    };
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      s1: q.s(1), s2: q.s(2), one: q.w(2, 'one'), writing: q.w(2, 'writing'),
      s3: q.s(3), so: q.w(3, 'so'),
      s4: q.s(4), adds: q.w(4, 'adds'), running: q.w(4, 'running'), record: q.w(4, 'record'),
      s5: q.s(5), loop: q.w(5, 'loop'), three: q.w(5, 'three'),
      th: q.s(6), ac: q.s(7), ob: q.s(8), obEnd: q.e(8),
      s9: q.s(9), same: q.w(9, 'same'),
      s10: q.s(10), search10: q.w(10, 'search'),
      s11: q.s(11), front11: q.w(11, 'Front'),
      s12: q.s(12), search12: q.w(12, 'search'),
      s13: q.s(13), find13: q.w(13, 'find'),
      s14: q.s(14), similar: q.w(14, 'similar'),
      s15: q.s(15), changes: q.w(15, 'changes'), search15: q.w(15, 'search'),
      s16: q.s(16), four: q.w(16, 'four'), keyboard: q.w(16, 'keyboard'),
      s17: q.s(17), s18: q.s(18),
      s19: q.s(19), so19: q.w(19, 'so'), see: q.w(19, 'see'),
    };

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    // ── camera ──
    const C = cameraAt(t, [
      { t: 0, tx: 860, ty: 600, zoom: 0.92, pitch: 0.14 },
      { t: 0.25, dur: 1.2, tx: 760, ty: 610, zoom: 1.55, pitch: 0.16 },                  // the Section 2 heading
      { t: T.s1 - 0.15, dur: 1.1, tx: 830, ty: 718, zoom: 1.85 },                         // the idea line
      { t: T.s2 + 0.7, dur: 1.5, tx: 1010, ty: 700, zoom: 1.48, pitch: 0.2 },            // page + the formula on the desk
      { t: T.s4 - 0.3, dur: 1.3, tx: 860, ty: 700, zoom: 1.5 },                           // the two context formulas
      { t: T.record + 0.3, dur: 2.3, tx: 940, ty: 585, zoom: 1.25, pitch: 0.55 },         // the base of the stack
      { t: T.s5 - 0.1, dur: 2.0, tx: 1060, ty: 560, zoom: 1.12, pitch: 1.0 },             // the loop stands up
      { t: T.th - 0.2, dur: 4.6, yaw: 0.2, zoom: 1.08 },                                  // slow orbit through the pause
      { t: T.s9 - 0.3, dur: 1.9, tx: RCAM.tx, ty: RCAM.ty, zoom: RCAM.zoom, pitch: RCAM.pitch, yaw: 0 },
      { t: T.s10, dur: 20, yaw: -0.05, tx: RCAM.tx + 12 },                                // barely-there drift through the replay
      { t: T.s19 - 0.15, dur: 1.7, tx: 430, ty: 585, zoom: 1.1, pitch: 0.6, yaw: 0 },    // pull back to the column
    ]);

    // ── p. 2 leaves (end of the previous segment), p. 3 slides in ──
    const out2 = e(t, 0, 1.0, ease.inCubic);
    if (out2 < 1) sheet(ctx, C, p2, { x: lerp(960, -900, out2), y: 560 + 120 * out2, z: Math.sin(Math.PI * out2) * 120, w: 760, rot: -0.01 - 0.18 * out2 });
    const in3 = e(t, 0.05, 1.2, ease.outCubic);
    const out3 = e(t, T.record + 0.6, 1.2, ease.inCubic);
    const P3p = {
      x: lerp(2400, P3_REST.x, in3) - 700 * out3, y: lerp(720, P3_REST.y, in3) + 1500 * out3,
      z: Math.sin(Math.PI * in3) * 150 + Math.sin(Math.PI * out3) * 90, w: P3_REST.w, rot: lerp(0.16, P3_REST.rot, in3) - 0.12 * out3,
    };
    if (out3 < 1) {
      sheet(ctx, C, p3, P3p);
      highlight(ctx, C, p3, P3p, L.idea, sayP(env, 1, t), { color: F.hlYellow });
      highlight(ctx, C, p3, P3p, L.augment, sayWords(env, 2, 0, 2, t), { color: F.hlMint });
      markBox(ctx, C, p3, P3p, P3.aug, e(t, T.one - 0.05, 0.5), { color: F.blue, width: 3, pad: 5 });
      highlight(ctx, C, p3, P3p, L.affect, sayWords(env, 3, 2, 7, t), { color: F.hlYellow });
      highlight(ctx, C, p3, P3p, L.thus, sayWords(env, 3, 8, 11, t), { color: F.hlMint });
      markBox(ctx, C, p3, P3p, P3.ctxUpd, e(t, T.adds - 0.1, 0.55), { color: F.blue, width: 3, pad: 5 });
      markBox(ctx, C, p3, P3p, P3.ctxDef, e(t, T.running - 0.25, 0.6), { color: F.blue, width: 3, pad: 5 });
    }

    // ── s2: Â = A ∪ L lifts off; our rebuild arrives beside it, larger, and gets its two tags ──
    const augLift = e(t, T.one + 0.35, 1.3, ease.linear);
    const augAway = e(t, T.s4 - 0.1, 1.0, ease.inCubic);
    if (augLift > 0 && augAway < 1) {
      const cardIn = e(t, T.one + 0.25, 1.2, ease.outCubic);
      const cardPose = {
        x: lerp(2350, 1345, cardIn) + 1100 * augAway, y: 740, z: Math.sin(Math.PI * cardIn) * 150 + Math.sin(Math.PI * augAway) * 80,
        w: 400, rot: lerp(0.22, 0.018, cardIn) + 0.1 * augAway,
      };
      const tagA = e(t, T.writing - 0.05, 0.7, ease.linear), tagL = e(t, T.writing + 0.35, 0.9, ease.linear);
      const card = blankPage('react-loop-aug', AUGCARD.w, AUGCARD.h, (g) => {
        const size = 150, gap = 0.32 * size, ws = AUG.map((s) => texSize(s, size).w);
        let x = (AUGCARD.w - ws.reduce((a, b) => a + b, 0) - gap * (AUG.length - 1)) / 2;
        const cx = [];
        AUG.forEach((s, i) => {
          const col = i === 2 ? mix(F.ink, PAL.actInk, tagA * 1.5) : i === 4 ? mix(F.ink, PAL.thoughtInk, tagL * 1.5) : F.ink;
          drawTex(g, s, x, 215, { size, color: col });
          cx.push(x + ws[i] / 2); x += ws[i] + gap;
        });
        // two rows so the tags never collide: actions under A, language: thoughts one row lower under L
        const tag = (src, sx, p, color, row) => {
          if (p <= 0) return;
          const w = texSize(src, 56).w, base = row ? 432 : 338, cxT = Math.min(sx, AUGCARD.w - 34 - w / 2);
          g.save(); g.strokeStyle = color; g.lineWidth = 4; g.lineCap = 'round';
          g.beginPath(); g.moveTo(sx, 256); g.lineTo(sx, lerp(256, base - 52, clamp(p * 2))); g.stroke(); g.restore();
          drawTex(g, src, cxT, base, { size: 56, color, align: 'center', write: clamp(p * 1.4 - 0.2) });
        };
        tag(S.actions, cx[2], tagA, PAL.actInk, 0);
        tag(S.lang, cx[4], tagL, PAL.thoughtInk, 1);
      }, { scale: 0.8 });
      sheet(ctx, C, card, cardPose, { grid: 6 });
      const AP = liftPose(p3, P3_REST, AUGC, { x: 1345 + 1100 * augAway, y: 548, z: 0, w: 190, rot: 0.03, arc: 240 }, augLift);
      sheet(ctx, C, p3, AP, { grid: 3 });
      markBox(ctx, C, p3, AP, P3.aug, 1, { color: F.blue, width: 3, pad: 5 });
    }

    // ── s4: c_{t+1} and c_t lift off and become the base of the context stack ──
    const lu = e(t, T.record + 0.3, 1.8, ease.linear), ld = e(t, T.record + 0.48, 1.8, ease.linear);
    const baseUpd = { x: SK.x, y: SK.y + 19, z: 0, w: 140, rot: 0.01, arc: 320 };
    const baseDef = { x: SK.x, y: SK.y - 17, z: 0, w: 280, rot: -0.008, arc: 300 };
    const UP = liftPose(p3, P3_REST, CTXUPD, baseUpd, lu), DP = liftPose(p3, P3_REST, CTXDEF, baseDef, ld);
    const drawBase = () => {
      if (lu > 0) { sheet(ctx, C, p3, UP, { grid: 3 }); markBox(ctx, C, p3, UP, P3.ctxUpd, 1 - e(t, T.s5, 1.0), { color: F.blue, width: 3, pad: 5 }); }
      if (ld > 0) { sheet(ctx, C, p3, DP, { grid: 4 }); markBox(ctx, C, p3, DP, P3.ctxDef, 1 - e(t, T.s5, 1.0), { color: F.blue, width: 3, pad: 5 }); }
    };
    const baseLanded = lu >= 1 && ld >= 1;
    if (baseLanded) drawBase();   // lying on the desk: under everything that stands
    const ctxLabel = e(t, T.record + 2.0, 0.9, ease.linear);
    if (ctxLabel > 0) {
      const pl = C.p(SK.x + SK.w / 2 + 22, SK.y + 6, 0);
      drawTex(ctx, S.ctx, pl.x, pl.y, { size: 36 * pl.k, color: F.ink2, align: 'left', valign: 'middle', write: ctxLabel });
    }

    // ── p. 2 comes back at the left edge, flat and small ──
    const in2 = e(t, T.s9 - 0.15, 1.1, ease.outCubic);
    const off2 = e(t, T.s19 - 0.1, 1.0, ease.inCubic);
    const P2p = {
      x: lerp(-520, P2_REST.x, in2) - 1100 * off2, y: P2_REST.y + 60 * off2, z: Math.sin(Math.PI * in2) * 150 + Math.sin(Math.PI * off2) * 80,
      w: P2_REST.w, rot: lerp(-0.22, P2_REST.rot, in2) - 0.15 * off2,
    };
    if (in2 > 0 && off2 < 1) {
      sheet(ctx, C, p2, P2p);
      markBox(ctx, C, p2, P2p, FIG1.panels.d1, e(t, T.same - 0.3, 0.7), { color: F.red, width: 3, pad: 6 });
    }

    // ── card schedule: lift (t0) → station (t1) → leave (t2) → on the stack (t3) ──
    const sch = {
      Q: { src: 'p2', t0: T.same + 0.05, t1: T.same + 0.85, t2: T.s10 - 0.75, t3: T.s10 - 0.1 },
      Thought1: { src: 'p2', t0: T.s10 - 0.2, t1: T.s10 + 0.6, t2: T.s11 - 0.4, t3: T.s11 + 0.25 },
      Act1: { src: 'p2', t0: T.search10 - 0.55, t1: T.search10 + 0.25, t2: T.s11 - 0.1, t3: T.s11 + 0.55, out: true },
      Obs1: { src: 'env', t0: T.s11, t1: T.s11 + 0.85, t2: T.s12 - 0.35, t3: T.s12 + 0.3 },
      Thought2: { src: 'p2', t0: T.s12 - 0.15, t1: T.s12 + 0.6, t2: T.s13 - 0.2, t3: T.s13 + 0.45 },
      Act2: { src: 'p2', t0: T.search12 - 0.55, t1: T.search12 + 0.2, t2: T.s13 + 0.05, t3: T.s13 + 0.7, out: true },
      Obs2: { src: 'env', t0: T.s13 - 0.35, t1: T.s13 + 0.4, t2: T.s15 - 0.25, t3: T.s15 + 0.4 },
      Thought3: { src: 'p2', t0: T.s15 - 0.1, t1: T.s15 + 0.65, t2: T.s16 - 0.6, t3: T.s16 + 0.05 },
      Act3: { src: 'p2', t0: T.search15 - 0.55, t1: T.search15 + 0.2, t2: T.s16 - 0.35, t3: T.s16 + 0.3, out: true },
      Obs3: { src: 'env', t0: T.s16 - 0.75, t1: T.s16 - 0.05, t2: T.s16 + 0.7, t3: T.s16 + 1.3 },
      Thought4: { src: 'p2', t0: T.four - 0.2, t1: T.four + 0.6, t2: T.s17 - 0.35, t3: T.s17 + 0.3 },
      Act4: { src: 'p2', t0: T.s17 - 1.0, t1: T.s17, t2: T.s18 - 0.35, t3: T.s18 + 0.2 },
      check: { src: 'p2', t0: T.s18 - 0.4, t3: T.s18 + 0.35 },
    };
    const fanT = (c) => T.s19 + 0.05 + c.i * 0.05;
    const srcState = (c) => {
      const [x, y, z] = sheetPt(p2, P2p, (c.r.x0 + c.r.x1) / 2, (c.r.y0 + c.r.y1) / 2);
      return { x, y, z: z + 0.5, w: (P2p.w * c.cw) / p2.w, tilt: 0, rot: P2p.rot };
    };
    const envState = { x: (EV.x0 + EV.x1) / 2, y: (EV.y0 + EV.y1) / 2, z: EV.h + 2, w: 40, tilt: 0, rot: 0 };
    // returns { st, where: 'stack' | 'air', tint, alpha, th }
    const cardAt = (c) => {
      const s = sch[c.id];
      if (t < s.t0) return null;
      const from = s.src === 'env' ? envState : srcState(c);
      const stk = stackState(c);
      const tf = fanT(c);
      if (t >= tf) {
        const p = e(t, tf, 0.9, ease.linear);
        return { st: fly(stk, colState(c), p, 140), where: 'air', tint: 1, alpha: 1, th: lerp(SK.dz - 1, 0, clamp(p * 4)) };
      }
      if (t >= s.t3) return { st: stk, where: 'stack', tint: 1, alpha: 1, th: c.k === 'check' ? 3 : SK.dz - 1 };
      if (s.t1 === undefined) {   // straight onto the stack (the ✓)
        const p = e(t, s.t0, s.t3 - s.t0, ease.linear);
        return { st: fly(from, stk, p, 260), where: 'air', tint: clamp(p * 2), alpha: 1, th: 0 };
      }
      const slot = slotState(c, C);
      if (t < s.t1) {
        const p = e(t, s.t0, s.t1 - s.t0, ease.linear);
        return { st: fly(from, slot, p, s.src === 'env' ? 120 : 50), where: 'air', tint: s.src === 'env' ? 1 : clamp(p * 2.2), alpha: s.src === 'env' ? clamp(p * 5) : 1, th: 0 };
      }
      if (t < s.t2) {
        const b = Math.sin((t - s.t1) * 2.2) * 3;
        return { st: { ...slot, z: slot.z + b }, where: 'air', tint: 1, alpha: 1, th: 0, atSlot: true };
      }
      const p = e(t, s.t2, s.t3 - s.t2, ease.linear);
      return { st: fly(slot, stk, p, 90), where: 'air', tint: 1, alpha: 1, th: 0 };
    };
    const marks = {
      Obs1: [{ r: GREEN.Obs1[0], p: e(t, T.front11 - 0.1, 0.6, ease.linear), color: PAL.goodMark }],
      Obs2: [
        { r: NOTFOUND, p: e(t, T.find13 - 0.1, 0.5, ease.linear), color: F.red, width: 3.5 },
        { r: GREEN.Obs2[0], p: e(t, T.similar - 0.15, 0.45, ease.linear), color: PAL.goodMark },
        { r: GREEN.Obs2[1], p: e(t, T.similar + 0.2, 0.45, ease.linear), color: PAL.goodMark },
      ],
      Thought4: [
        { r: GREEN.Thought4[0], p: e(t, T.keyboard - 0.15, 0.6, ease.linear), color: PAL.goodMark },
        { r: GREEN.Thought4[1], p: e(t, T.keyboard + 0.4, 0.6, ease.linear), color: PAL.goodMark },
      ],
    };
    const states = CARDS.map((c) => ({ c, s: cardAt(c) })).filter((x) => x.s);
    const stacked = states.filter((x) => x.s.where === 'stack');
    const stackTop = stacked.reduce((m, x) => Math.max(m, x.s.st.z), 0);
    const atSlot = (k) => Math.max(0, ...states.filter((x) => x.c.k === k && x.s.atSlot).map(() => 1));

    // ── the ring ──
    const stand = (w0) => e(t, w0 - 0.08, 0.6, ease.outBack);
    const pulses = [];
    for (const id of ['Act1', 'Act2', 'Act3']) pulses.push({ path: 'aw', p: e(t, sch[id].t1, 0.6, ease.linear), color: PAL.actInk });
    for (const id of ['Obs1', 'Obs2', 'Obs3']) pulses.push({ path: 'wo', p: e(t, sch[id].t0 - 0.25, 0.6, ease.linear), color: PAL.obsInk });
    pulses.push({ path: 'lap', p: e(t, T.obEnd + 0.15, 1.7, ease.inOutQuad), color: PAL.thoughtInk });
    const fadeFoot = 1 - e(t, T.ob + 0.6, 0.6);
    ring(ctx, C, {
      foot: e(t, T.three - 0.1, 0.7, ease.linear) * fadeFoot,
      envFoot: e(t, T.ac + 0.1, 0.5, ease.linear) * fadeFoot,
      rise: { thought: stand(T.th), act: stand(T.ac), obs: stand(T.ob), env: e(t, T.ac + 0.35, 0.8, ease.outBack) },
      labels: { thought: e(t, T.th + 0.15, 0.6, ease.linear), act: e(t, T.ac + 0.15, 0.6, ease.linear), obs: e(t, T.ob + 0.15, 0.7, ease.linear), env: e(t, T.ac + 0.7, 0.7, ease.linear) },
      arrows: {
        ts: e(t, T.th + 0.35, 0.5, ease.inOutQuad),
        ta: e(t, T.ac - 0.05, 0.55, ease.inOutQuad),
        aw: e(t, T.ac + 0.55, 0.5, ease.inOutQuad),
        wo: e(t, T.ob + 0.1, 0.5, ease.inOutQuad),
        ot: e(t, T.ob + 0.55, 0.6, ease.inOutQuad),
      },
      pulses,
      hop: Math.sin(Math.PI * e(t, T.changes - 0.05, 0.55, ease.linear)) * 34,
      active: { thought: atSlot('thought'), act: atSlot('act'), obs: atSlot('obs') },
      stackTop,
      mid: () => {
        if (!baseLanded) drawBase();
        stacked.forEach(({ c, s }, n) => {
          cardEdge(ctx, C, c, s.st, s.th);
          sheet(ctx, C, cardPage(c, 1, marks[c.id] || []), poseOf(c, s.st), { shadow: n === 0 ? 0.6 : 0, grid: 2 });
        });
      },
    });

    // ── cards in the air, low to high so the nearer ones cover ──
    // cards being read (at their station) draw last, so a card in flight never covers one being read
    states.filter((x) => x.s.where === 'air').sort((a, b) => (a.s.atSlot ? 1 : 0) - (b.s.atSlot ? 1 : 0)).forEach(({ c, s }) => {
      const pg = cardPage(c, s.tint, marks[c.id] || []);
      if (s.th > 0.5) cardEdge(ctx, C, c, s.st, s.th);
      sheet(ctx, C, pg, poseOf(c, s.st), { alpha: s.alpha, grid: 6, shadow: 0.7 });
    });

    // ── s19: green leaders, each fact back to the observation it came from (left margin of the column) ──
    const links = [
      { a: 'Obs1', ar: GREEN.Obs1[0], b: 'Thought2', br: GREEN.Thought2[1], t: T.so19 },
      { a: 'Obs2', ar: GREEN.Obs2[1], b: 'Thought3', br: GREEN.Thought3[1], t: T.so19 + 0.45 },
      { a: 'Obs3', ar: CARD.Obs3.r, b: 'Thought4', br: GREEN.Thought4[1], t: T.so19 + 0.9 },
    ];
    for (const lk of links) {
      const p = e(t, lk.t, 0.6, ease.inOutQuad);
      if (p <= 0) continue;
      const ca = CARD[lk.a], cb = CARD[lk.b], sa = colState(ca), sb = colState(cb);
      const pa = cardPage(ca, 1), pb = cardPage(cb, 1);
      const ra = toCard(ca, lk.ar), rb = toCard(cb, lk.br);
      const A = onSheet(C, pa, poseOf(ca, sa), ra.x0 - 4, (ra.y0 + ra.y1) / 2);
      const B = onSheet(C, pb, poseOf(cb, sb), rb.x0 - 4, (rb.y0 + rb.y1) / 2);
      const off = 46 * A.k;
      const pts = Array.from({ length: 25 }, (_, i) => {
        const u = i / 24, m = 1 - u;
        return { x: m * m * m * A.x + 3 * m * m * u * (A.x - off) + 3 * m * u * u * (B.x - off) + u * u * u * B.x, y: m * m * m * A.y + 3 * m * m * u * A.y + 3 * m * u * u * B.y + u * u * u * B.y };
      });
      const n = Math.max(1, Math.round(p * 24));
      ctx.save();
      ctx.strokeStyle = PAL.goodMark; ctx.fillStyle = PAL.goodMark; ctx.lineWidth = 3.6; ctx.lineCap = 'round';
      ctx.beginPath(); pts.slice(0, n + 1).forEach((q2, i) => (i ? ctx.lineTo(q2.x, q2.y) : ctx.moveTo(q2.x, q2.y))); ctx.stroke();
      ctx.beginPath(); ctx.arc(A.x, A.y, 5, 0, Math.PI * 2); ctx.fill();
      if (p >= 1) {
        const a = pts[23], b = pts[24], d = Math.hypot(b.x - a.x, b.y - a.y) || 1, ux = (b.x - a.x) / d, uy = (b.y - a.y) / d;
        ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - ux * 14 - uy * 7, b.y - uy * 14 + ux * 7); ctx.lineTo(b.x - ux * 14 + uy * 7, b.y - uy * 14 - ux * 7); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    // ── source stamp ──
    const on2 = t > T.s9 + 0.2;
    cite(ctx, on2 ? p2 : p3, {
      label: on2 ? S.c2 : S.c3,
      rect: on2 ? FIG1.panels.d1 : t < T.s1 ? P3.sec2 : PARA,
      alpha: e(t, 0.8, 0.6) * (1 - 0.85 * Math.min(1, Math.sin(Math.PI * clamp((t - T.s9 + 0.1) / 0.6)))),
      side: 'right',
    });
  },
};
