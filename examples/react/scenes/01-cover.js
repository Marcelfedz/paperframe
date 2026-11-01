// cover — p. 1 on the desk: the date (v1) and the version we show (v3), seven authors from two labs,
// the abstract's "separate topics", the key line read with the voice and lifted off as a standing strip,
// three small slabs (Thought · Action · Observation) closing into a ring, the name ReAct, ICLR 2023,
// and three thumbnails of what's ahead (Figure 1 (1d), Table 2, Table 1).
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, win, desk, edgeIn, loadPaper, findPhrase, cameraAt, sheet, highlight,
  markBox, liftPose, slab, cite, sayP, sayWords, onSheet,
} from '/engine/folio.js';
import { PAL, LOOP, P1, FIG1, T1, T2 } from './_data.js';

const S = {
  arxiv: '\\texttt{arXiv:2210.03629}',
  v1: '\\text{v1}\\;\\cdot\\;\\text{6 October 2022}',
  v3: '\\text{v3 shown}',
  th: '\\text{Thought}', ac: '\\text{Action}', ob: '\\text{Observation}',
  re: '\\text{Re}', act: '\\text{Act}',
  iclr: '\\text{ICLR 2023}\\;\\cdot\\;\\text{oral}\\;\\cdot\\;\\text{top 5\\%}',
  c1: '\\text{p. 1}',
  c1a: '\\text{p. 1}\\;\\cdot\\;\\text{Abstract}',
};

const NAMES = ['Shunyu Yao', 'Jeffrey Zhao', 'Dian Yu', 'Nan Du', 'Izhak Shafran', 'Karthik Narasimhan', 'Yuan Cao'];

// ── world layout (desk px) ───────────────────────────────────────────────────
const PAGE = { x: 960, y: 560, w: 760, left: 480 };     // p. 1 at rest; slides left when the line lifts
const STRIP = { x: 1330, y: 420, z: 90, tilt: 0.85, sc: 1.1 };   // the lifted line, standing, one line
const RC = { x: 1250, y: 740 }, RS = 0.55;               // the ring: LOOP geometry at about half scale
const SW = LOOP.slab.w * RS, SD = LOOP.slab.d * RS, SH = LOOP.slab.h * RS;
const ST = Object.fromEntries(Object.entries(LOOP.stations).map(([k, s]) => [k, { ...s, x: RC.x + (s.x - LOOP.c.x) * RS, y: RC.y + (s.y - LOOP.c.y) * RS }]));
const D1 = { ...FIG1.panels.d1, y0: FIG1.panels.d1.y0 - 12, x0: FIG1.panels.d1.x0 - 5, x1: FIG1.panels.d1.x1 + 5, y1: FIG1.panels.d1.y1 + 5 };   // with its tab
const THUMBS = [   // where the three promises land (row in front of the ring)
  { key: 'd1', rect: D1, at: { x: 805, y: 1075, w: 340, rot: -0.045 } },
  { key: 't2', rect: T2.box, at: { x: 1270, y: 1085, w: 480, rot: 0.02 } },
  { key: 't1', rect: T1.box, at: { x: 1715, y: 1070, w: 300, rot: 0.05 } },
];

let p1, p2, p5, p6, L;

const union = (rs) => ({ x0: Math.min(...rs.map((r) => r.x0)), y0: Math.min(...rs.map((r) => r.y0)), x1: Math.max(...rs.map((r) => r.x1)), y1: Math.max(...rs.map((r) => r.y1)) });
const grow = (r, px = 10, py = 6) => ({ x0: r.x0 - px, y0: r.y0 - py, x1: r.x1 + px, y1: r.y1 + py });

/** a sheet being put down: slides in from (dx, dy) with a small lift */
function arrive(base, p, { dx = 0, dy = 800, rot = 0.1, arc = 170 } = {}) {
  const q = ease.outCubic(clamp(p));
  return { ...base, x: base.x + dx * (1 - q), y: base.y + dy * (1 - q), z: (base.z || 0) + Math.sin(Math.PI * clamp(p)) * arc, rot: (base.rot || 0) + rot * (1 - q) };
}

/** ink line under page-px span (u0..u1) at v, drawn on the sheet (moves with it) */
function inkUnder(ctx, C, page, pose, u0, u1, v, p, { color = F.ink, width = 2.4 } = {}) {
  if (p <= 0) return;
  const a = onSheet(C, page, pose, u0, v), b = onSheet(C, page, pose, lerp(u0, u1, clamp(p)), v);
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width * a.k; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.restore();
}
/** underline a multi-line phrase (findPhrase lines), sweeping line after line */
function underlineLines(ctx, C, page, pose, lines, p, o) {
  const total = lines.reduce((s, l) => s + l.n, 0);
  let acc = 0;
  for (const l of lines) {
    const f = clamp((p * total - acc) / l.n);
    acc += l.n;
    if (f <= 0) break;
    inkUnder(ctx, C, page, pose, l.x0, l.x1, l.y1 + 2, f, o);
  }
}
/** hand-drawn ellipse around a page-px box, on the sheet */
function inkRing(ctx, C, page, pose, r, p, { color = F.ink, width = 2.2, padX = 12, padY = 9 } = {}) {
  if (p <= 0) return;
  const cx = (r.x0 + r.x1) / 2, cy = (r.y0 + r.y1) / 2, rx = (r.x1 - r.x0) / 2 + padX, ry = (r.y1 - r.y0) / 2 + padY;
  const n = 64, span = (Math.PI * 2 + 0.35) * clamp(p), a0 = -2.4;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = a0 + (span * i) / n, wob = 1 + 0.03 * Math.sin(3 * a + 1);
    const q = onSheet(C, page, pose, cx + Math.cos(a) * rx * wob, cy + Math.sin(a) * ry * wob);
    if (!i) { ctx.lineWidth = width * q.k; ctx.moveTo(q.x, q.y); } else ctx.lineTo(q.x, q.y);
  }
  ctx.stroke();
  ctx.restore();
}

/** arrow along the ring on the desk, from angle a0 to a1 (rad), trimmed to stay off the slabs */
function ringArrow(ctx, C, a0, a1, p, { color = F.ink2, width = 2.6, head = 15 } = {}) {
  if (p <= 0) return;
  const R = LOOP.r * RS, N = 72, pts = [];
  for (let i = 0; i <= N; i++) {
    const a = lerp(a0, a1, i / N), x = RC.x + R * Math.cos(a), y = RC.y + R * Math.sin(a);
    if (Object.values(ST).some((s) => Math.abs(x - s.x) < SW / 2 + 16 && Math.abs(y - s.y) < SD / 2 + 14)) continue;
    pts.push(C.p(x, y, 1));
  }
  const n = Math.max(2, Math.round(pts.length * clamp(p)));
  const P = pts.slice(0, n);
  if (P.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width * P[0].k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke();
  if (p > 0.8) {
    const a = P[P.length - 1], b = P[Math.max(0, P.length - 4)], d = Math.atan2(a.y - b.y, a.x - b.x), hh = head * a.k * clamp((p - 0.8) / 0.2);
    ctx.beginPath(); ctx.moveTo(a.x + Math.cos(d) * hh * 0.4, a.y + Math.sin(d) * hh * 0.4);
    ctx.lineTo(a.x - Math.cos(d - 0.45) * hh, a.y - Math.sin(d - 0.45) * hh);
    ctx.lineTo(a.x - Math.cos(d + 0.45) * hh, a.y - Math.sin(d + 0.45) * hh);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [1, 2, 5, 6]);
    p1 = P.page(1); p2 = P.page(2); p5 = P.page(5); p6 = P.page(6);
    L = {
      names: NAMES.map((n) => findPhrase(p1, n)),
      princeton: findPhrase(p1, 'Department of Computer Science, Princeton University'),
      google: findPhrase(p1, 'Google Research, Brain team'),
      reasoning: findPhrase(p1, 'reasoning (e.g. chain-of-thought prompting)'),
      acting: findPhrase(p1, 'acting (e.g. action plan generation)'),
      separate: findPhrase(p1, 'have primarily been studied as separate topics'),
      key: findPhrase(p1, 'generate both reasoning traces and task-specific actions in an interleaved manner'),
      traces: findPhrase(p1, 'reasoning traces')[0],
      actions: findPhrase(p1, 'actions')[0],
      interleaved: findPhrase(p1, 'interleaved')[0],
      react: findPhrase(p1, 'approach, named ReAct'),
      header: findPhrase(p1, 'Published as a conference paper at ICLR 2023'),
    };
    // the two strips of the key line; B stops before the comma after "manner"
    L.keyA = [L.key[0]];
    L.keyB = [{ ...L.key[1], x1: 665 }];
    L.stripA = { x0: L.key[0].x0 - 4, y0: L.key[0].y0 - 3, x1: L.key[0].x1 + 6, y1: L.key[0].y1 + 3 };
    L.stripB = { x0: L.key[1].x0 - 6, y0: L.key[1].y0 - 3, x1: 667, y1: L.key[1].y1 + 3 };
    L.authors = grow(union([...L.names.flat(), ...L.princeton, ...L.google]));
    L.headerBox = grow(L.header[0], 8, 6);
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      oct: q.w(0, 'October'), twenty: q.w(0, 'twenty'),
      s1: q.s(1), princeton: q.w(1, 'Princeton'),
      s2: q.s(2), acting: q.w(2, 'acting'),
      s3: q.s(3), s4: q.s(4), e4: q.e(4),
      think: q.w(5, 'think'), act: q.w(5, 'act'), read: q.w(5, 'read'), again: q.w(5, 'think', 2),
      s6: q.s(6), react: q.w(6, 'ReAct'), reason: q.w(6, 'reason'), plusAct: q.w(6, 'act'),
      s7: q.s(7), oral: q.w(7, 'oral'),
      s8: q.s(8), readT: q.w(8, 'read'), see: q.w(8, 'see'), know: q.w(8, 'know'), end: q.e(8),
    };
    T.lift = T.e4 + 0.12;

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    const C = cameraAt(t, [
      { t: 0, tx: 960, ty: 560, zoom: 0.84, pitch: 0.16 },
      { t: 1.0, dur: 4.4, tx: 985, zoom: 0.9 },
      { t: T.s1 - 0.35, dur: 1.2, tx: 960, ty: 288, zoom: 1.7 },
      { t: T.s2 - 0.35, dur: 1.3, tx: 955, ty: 440, zoom: 2.0 },
      { t: T.s2 + 1.0, dur: 5.0, tx: 975, zoom: 2.06 },
      { t: T.s3 - 0.1, dur: 1.2, tx: 945, ty: 470, zoom: 2.1 },
      { t: T.s3 + 1.0, dur: 5.6, tx: 975, zoom: 2.15 },
      { t: T.lift - 0.05, dur: 1.6, tx: 1240, ty: 600, zoom: 1.0, pitch: 0.85 },
      { t: T.s6 - 0.35, dur: 1.2, tx: 900, ty: 640, zoom: 1.25, pitch: 0.28 },
      { t: T.s7 - 0.25, dur: 1.2, tx: 650, ty: 200, zoom: 1.7, pitch: 0.24 },
      { t: T.s7 + 1.2, dur: 4.0, tx: 690, zoom: 1.6 },
      { t: T.s8 - 0.4, dur: 1.5, tx: 1250, ty: 880, zoom: 1.15, pitch: 0.55 },
      { t: T.end - 0.2, dur: 2.4, yaw: -0.15, zoom: 1.2 },
    ]);

    // ── p. 1: arrives, moves left when the line lifts, leaves for the thumbnails ──
    const pin = e(t, 0, 1.3, ease.outCubic);
    const left = e(t, T.lift, 1.4, ease.inOutCubic);
    const out1 = e(t, T.s8 - 0.35, 1.2, ease.inCubic);
    const PG = {
      x: PAGE.x - PAGE.left * left - 1500 * out1, y: lerp(1900, PAGE.y, pin), z: Math.sin(Math.PI * pin) * 160 + Math.sin(Math.PI * out1) * 60,
      w: PAGE.w, rot: lerp(-0.14, -0.02, pin) - 0.015 * left - 0.1 * out1,
    };
    if (out1 < 1) {
      sheet(ctx, C, p1, PG);
      // s0: the side stamp is v3, the camera-ready
      const sa = win(t, T.twenty - 0.1, T.s2, 0.2, 0.6);
      if (sa > 0) { ctx.save(); ctx.globalAlpha *= sa; markBox(ctx, C, p1, PG, P1.stamp, e(t, T.twenty - 0.1, 0.8), { color: F.ink2, width: 2, pad: 6 }); ctx.restore(); }
      // s1: seven names, then the two labs
      L.names.forEach((n, i) => highlight(ctx, C, p1, PG, n, e(t, T.s1 + i * 0.12, 0.3, ease.linear), { color: F.hlMint }));
      highlight(ctx, C, p1, PG, L.princeton, e(t, T.princeton, 0.55, ease.linear), { color: F.hlBlue });
      highlight(ctx, C, p1, PG, L.google, sayWords(env, 1, 5, 7, t), { color: F.hlBlue });
      // s2: reasoning / acting underlined, "separate topics" in mint (the voice paraphrases)
      underlineLines(ctx, C, p1, PG, L.reasoning, e(t, T.s2, 0.6, ease.linear), { color: PAL.thoughtInk, width: 1.4 });
      underlineLines(ctx, C, p1, PG, L.acting, e(t, T.acting, 0.6, ease.linear), { color: PAL.actInk, width: 1.4 });
      highlight(ctx, C, p1, PG, L.separate, sayWords(env, 2, 9, 15, t), { color: F.hlMint });
      // s4: the key line, verbatim, with the voice
      highlight(ctx, C, p1, PG, L.key, sayP(env, 4, t), { color: F.hlYellow });
      // s6 / s7: the name, the venue
      highlight(ctx, C, p1, PG, L.react, e(t, T.react - 0.05, 0.45, ease.linear), { color: F.hlBlue });
      highlight(ctx, C, p1, PG, L.header, sayWords(env, 7, 1, 3, t), { color: F.hlMint });
    }

    // ── s0 tags beside the page ──
    const a0 = win(t, T.oct - 0.3, T.s1 - 0.1, 0.3, 0.45);
    if (a0 > 0) {
      const r = C.p(PG.x + PG.w / 2 + 40, PG.y - 150, 0);
      drawTex(ctx, S.arxiv, r.x, r.y, { size: 38, color: F.ink2, write: e(t, T.oct - 0.3, 0.8, ease.linear), alpha: a0 });
      drawTex(ctx, S.v1, r.x, r.y + 66, { size: 50, color: F.ink, write: e(t, T.oct, 0.9, ease.linear), alpha: a0 });
      const s = onSheet(C, p1, PG, 40, 1070);
      drawTex(ctx, S.v3, s.x - 26, s.y, { size: 40, color: F.ink2, align: 'right', valign: 'middle', write: e(t, T.twenty + 0.2, 0.7, ease.linear), alpha: a0 });
    }

    // ── s4 → s5: the line lifts off as two strips and stands up as one line ──
    const lp = e(t, T.lift, 1.5, ease.linear);
    const gone = e(t, T.s6 - 0.45, 1.1, ease.inCubic);
    let A, B;
    if (lp > 0 && gone < 1) {
      const wA = (L.stripA.x1 - L.stripA.x0) * STRIP.sc, wB = (L.stripB.x1 - L.stripB.x0) * STRIP.sc, gap = 14, tot = wA + gap + wB;
      const toA = { x: STRIP.x - tot / 2 + wA / 2, y: STRIP.y - 1100 * gone, z: STRIP.z + 300 * gone, w: wA, tilt: STRIP.tilt, arc: 200 };
      const toB = { x: STRIP.x + tot / 2 - wB / 2, y: STRIP.y - 1100 * gone, z: STRIP.z + 300 * gone, w: wB, tilt: STRIP.tilt, arc: 240 };
      A = liftPose(p1, PG, L.stripA, toA, lp);
      B = liftPose(p1, PG, L.stripB, toB, e(t, T.lift + 0.12, 1.5, ease.linear));
      sheet(ctx, C, p1, A, { grid: 6, shadow: 0.45 });
      sheet(ctx, C, p1, B, { grid: 3, shadow: 0.45 });
      highlight(ctx, C, p1, A, L.keyA, 1);
      highlight(ctx, C, p1, B, L.keyB, 1);
      const land = T.lift + 1.25;
      inkUnder(ctx, C, p1, A, L.traces.x0, L.traces.x1, L.traces.y1 + 1, e(t, land, 0.45, ease.linear), { color: PAL.thoughtInk, width: 2.6 });
      inkUnder(ctx, C, p1, A, L.actions.x0, L.actions.x1, L.actions.y1 + 1, e(t, land + 0.3, 0.35, ease.linear), { color: PAL.actInk, width: 2.6 });
      inkRing(ctx, C, p1, B, L.interleaved, e(t, land + 0.55, 0.6, ease.inOutCubic), { width: 2.2, padX: 5, padY: 7 });
    }

    // ── s5: the ring — three slabs rise, arrows close the loop ──
    const rise = { thought: e(t, T.think - 0.05, 0.55), act: e(t, T.act - 0.05, 0.55), obs: e(t, T.read - 0.05, 0.55) };
    const slabs = Object.entries(ST).map(([k, s]) => ({ k, s, p: rise[k], depth: C.p(s.x, s.y, 0).depth })).filter((o) => o.p > 0);
    ringArrow(ctx, C, Math.PI, Math.PI * 5 / 3, e(t, T.act + 0.15, 0.5, ease.inOutCubic));
    ringArrow(ctx, C, Math.PI * 5 / 3, Math.PI * 7 / 3, e(t, T.read + 0.2, 0.5, ease.inOutCubic));
    ringArrow(ctx, C, Math.PI / 3, Math.PI, e(t, T.again - 0.05, 0.6, ease.inOutCubic), { color: F.ink, width: 3.2, head: 17 });
    slabs.sort((a, b) => b.depth - a.depth).forEach(({ k, s, p }) => {
      const fill = PAL[s.fill], ink = PAL[`${s.fill}Ink`];
      slab(ctx, C, { x0: s.x - SW / 2, x1: s.x + SW / 2, y0: s.y - SD / 2, y1: s.y + SD / 2, z0: 0, z1: Math.max(1, SH * p) }, { fill, stroke: ink, width: 2, alpha: clamp(p * 3) });
    });
    // labels outside the ring, and the name split over it (s6)
    const lab = (k, src, side, wr, sub, subWr, subColor) => {
      const s = ST[k];
      const at = side === 'left' ? C.p(s.x - SW / 2 - 14, s.y, SH / 2) : C.p(s.x + SW / 2 + 14, s.y, SH / 2);
      const align = side === 'left' ? 'right' : 'left';
      drawTex(ctx, src, at.x, at.y, { size: 36, color: F.ink, align, valign: 'middle', write: wr });
      if (sub) drawTex(ctx, sub, at.x, at.y + 48, { size: 42, color: subColor, align, valign: 'middle', write: subWr });
    };
    lab('thought', S.th, 'left', e(t, T.think + 0.1, 0.6, ease.linear), S.re, e(t, T.reason, 0.5, ease.linear), PAL.thoughtInk);
    lab('act', S.ac, 'right', e(t, T.act + 0.1, 0.6, ease.linear), S.act, e(t, T.plusAct - 0.05, 0.5, ease.linear), PAL.actInk);
    lab('obs', S.ob, 'right', e(t, T.read + 0.1, 0.7, ease.linear));

    // ── s7: the venue, on the desk beside the page's running header ──
    const ai = win(t, T.oral - 0.15, T.s8 - 0.2, 0.3, 0.4);
    if (ai > 0) {
      const r = C.p(1025, 110, 0);
      drawTex(ctx, S.iclr, r.x, r.y, { size: 44, color: F.ink, align: 'center', valign: 'middle', write: e(t, T.oral - 0.15, 1.3, ease.linear), alpha: ai });
    }

    // ── s8: three thumbnails land in a row, each on its words ──
    const src = { d1: p2, t2: p6, t1: p5 };
    const tIn = { d1: T.readT - 0.3, t2: T.see - 0.25, t1: T.know - 0.1 };
    THUMBS.forEach(({ key, rect, at }) => {
      const p = e(t, tIn[key], 1.0, ease.linear);
      if (p <= 0) return;
      sheet(ctx, C, src[key], arrive({ ...at, src: rect }, p, { dy: 760, rot: 0.14, arc: 190 }), { grid: 4 });
    });

    // ── source stamp: p. 1 throughout, the box follows what's in focus ──
    let rect = null, label = S.c1;
    if (t > T.twenty - 0.1 && t < T.s1 - 0.2) rect = P1.stamp;
    else if (t >= T.s1 - 0.2 && t < T.s2 - 0.3) rect = L.authors;
    else if (t >= T.s2 - 0.3 && t < T.s7 - 0.2) { rect = P1.abstract; label = S.c1a; }
    else if (t >= T.s7 - 0.2 && t < T.s8 - 0.3) rect = L.headerBox;
    cite(ctx, p1, { label, rect, alpha: e(t, 0.8, 0.6), side: 'right' });
  },
};
