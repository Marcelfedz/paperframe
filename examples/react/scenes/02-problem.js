// problem — p. 2, Figure 1 (top half): the question panel lifts off and our two-hop sketch sits under it;
// (1a) Standard answers iPod ✗; (1b) chain-of-thought reasons fluently from a made-up fact ✗; the body text
// calls that reasoning "a static black box … not grounded in the external world" while the (1b) card is
// sealed in a thin box; (1c) Act-only searches, reaches the right page, answers "yes" ✗. The three cards
// regroup: reasoning without facts, facts without reasoning, and an empty (1d)-sized frame between them.
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, win, mix, desk, edgeIn, loadPaper, findPhrase, cameraAt, sheet, highlight,
  markBox, liftPose, cite, sayP, sayWords, onSheet, sheetPt, blankPage,
} from '/engine/folio.js';
import { PAL, FIG1, FIG1_LINES, FIG1_STEPS } from './_data.js';

const S = {
  remote: '\\text{Apple Remote}',
  qm: '?',
  hop1: '\\text{hop 1}', hop2: '\\text{hop 2}',
  world: '\\text{world}',
  noThought: '\\text{no thoughts}',
  capB: '\\text{reasoning, no facts}',
  capC: '\\text{facts, no reasoning}',
  c2f: '\\text{p. 2}\\;\\cdot\\;\\text{Figure 1}',
  c2s: '\\text{p. 2}\\;\\cdot\\;\\text{Section 1}',
};

// ── layout ───────────────────────────────────────────────────────────────────
const PC = 0.55;                                          // camera pitch over the cards; standing cards tilt the same, facing it
const PP = { x: 960, y: 1250, w: 1000, rot: -0.012 };     // p. 2 at rest (figure near its top, body text lower down)
// panel crops (page px), each with its label tab
const CROP = {
  q: { x0: 314, y0: 232, x1: 855, y1: 338 },
  a1: { x0: 313, y0: 345, x1: 556, y1: 419 },
  b1: { x0: 313, y0: 422, x1: 556, y1: 686 },
  c1: { x0: 561, y0: 345, x1: 853, y1: 686 },
  d1: { x0: 857, y0: 232, x1: 1390, y1: 686 },
};
/** pose of a card standing on its bottom edge at desk y = yb, tilted to face the camera */
const stand = (crop, x, yb, w, tilt = PC, z = 0) => {
  const h = w * (crop.y1 - crop.y0) / (crop.x1 - crop.x0);
  return { src: crop, x, y: yb - h / 2, z, w, tilt, rot: 0 };
};
const LANE = {
  q: stand(CROP.q, 960, -52, 866),
  a1: stand(CROP.a1, 430, 236, 389),
  b1: stand(CROP.b1, 960, 529, 389),
  c1: stand(CROP.c1, 1500, 672, 467),
};
const NEAR_TEXT = { src: CROP.b1, x: 690, y: 1650, z: 0, w: 250, tilt: 0, rot: -0.03 };   // (1b) laid down under the body text
const REG = {
  q: stand(CROP.q, 960, -40, 760),
  a1: stand(CROP.a1, 300, -20, 270),
  b1: stand(CROP.b1, 420, 640, 320),
  c1: stand(CROP.c1, 1500, 640, 380),
  d1: stand(CROP.d1, 960, 700, 600),
};
const SK = { w: 1400, h: 300 };                            // the two-hop sketch, page px of its blank sheet
const SKETCH = { x: 960, y: 389 - 105, z: 0, w: 980, tilt: PC, rot: 0 };
const WORLD_AT = { x: 1420, y: 1829 };                     // the faint "world" label, in the page's bottom margin (s7)

let p2, L;

const union = (rs) => ({ x0: Math.min(...rs.map((r) => r.x0)), y0: Math.min(...rs.map((r) => r.y0)), x1: Math.max(...rs.map((r) => r.x1)), y1: Math.max(...rs.map((r) => r.y1)) });
const grow = (r, px = 8, py = 6) => ({ x0: r.x0 - px, y0: r.y0 - py, x1: r.x1 + px, y1: r.y1 + py });
const asLines = (ls) => ls.map((l) => ({ x0: l.x0, y0: l.y0, x1: l.x1, y1: l.y1, n: l.t ? l.t.length : Math.round((l.x1 - l.x0) / 9) }));

/** a sheet moving between two poses on the desk, picked up (z arc) on the way */
function travel(a, b, p, arc = 160) {
  const q = ease.inOutCubic(clamp(p));
  const o = { ...a };
  for (const f of ['x', 'y', 'z', 'w', 'rot', 'tilt']) o[f] = lerp(a[f] || 0, b[f] || 0, q);
  o.z += Math.sin(Math.PI * clamp(p)) * arc;
  return o;
}
/** a sheet being put down / taken away: slides from (dx, dy) */
function arrive(base, p, { dx = 0, dy = 0, arc = 140 } = {}) {
  const q = ease.outCubic(clamp(p));
  return { ...base, x: base.x + dx * (1 - q), y: base.y + dy * (1 - q), z: (base.z || 0) + Math.sin(Math.PI * clamp(p)) * arc };
}
function leave(base, p, { dx = 1600, dy = 0, arc = 90 } = {}) {
  const q = ease.inCubic(clamp(p));
  return { ...base, x: base.x + dx * q, y: base.y + dy * q, z: (base.z || 0) + Math.sin(Math.PI * clamp(p)) * arc };
}

/** outline around the card's crop edge, on its plane (verdict / role colour) */
function outline(ctx, C, page, pose, color, a = 1, width = 5) {
  if (a <= 0) return;
  const r = pose.src;
  const P = [[r.x0, r.y0], [r.x1, r.y0], [r.x1, r.y1], [r.x0, r.y1]].map(([u, v]) => onSheet(C, page, pose, u, v));
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color; ctx.lineWidth = width * P[0].k; ctx.lineJoin = 'round';
  ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.stroke();
  ctx.restore();
}
/** the figure's own ✗ pulses: two rings spreading from it, on the card's plane */
function pulse(ctx, C, page, pose, m, t0, t) {
  const cx = (m.x0 + m.x1) / 2, cy = (m.y0 + m.y1) / 2;
  for (let k = 0; k < 2; k++) {
    const l = (t - t0 - k * 0.28) / 0.75;
    if (l <= 0 || l >= 1) continue;
    const r = lerp(12, 52, ease.outCubic(l));
    ctx.save();
    ctx.globalAlpha *= 1 - l;
    ctx.strokeStyle = F.red;
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI * 2, q = onSheet(C, page, pose, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      if (!i) { ctx.lineWidth = 2.6 * q.k; ctx.moveTo(q.x, q.y); } else ctx.lineTo(q.x, q.y);
    }
    ctx.stroke();
    ctx.restore();
  }
}
/** an ink stroke through page-px points on the card (ticks, underlines), drawn on with p */
function inkPath(ctx, C, page, pose, pts, p, { color = F.ink, width = 2 } = {}) {
  if (p <= 0) return;
  const P = pts.map(([u, v]) => onSheet(C, page, pose, u, v));
  let Ltot = 0; for (let i = 1; i < P.length; i++) Ltot += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width * P[0].k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.setLineDash([Ltot * clamp(p), Ltot + 1]);
  ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke();
  ctx.restore();
}
/**
 * sealBox — a thin lidded box over a card (illustrative): the card's rect grown by m, th deep along the
 * card's normal, translucent ink walls. drop lifts the whole box off along the normal (settling = drop → 0).
 */
function sealBox(ctx, C, page, pose, a, drop = 0) {
  if (a <= 0) return null;
  const r = pose.src, m = 14, th = 24;
  const t = pose.tilt || 0, ro = pose.rot || 0;
  const n = [-Math.sin(t) * Math.sin(ro), Math.sin(t) * Math.cos(ro), Math.cos(t)];
  const P = (u, v, w) => { const [x, y, z] = sheetPt(page, pose, u, v), d = w + drop; return C.p(x + n[0] * d, y + n[1] * d, z + n[2] * d); };
  const u0 = r.x0 - m, u1 = r.x1 + m, v0 = r.y0 - m, v1 = r.y1 + m;
  const face = (pts) => { const Q = pts.map(([u, v, w]) => P(u, v, w)); return { Q, depth: Q.reduce((s, q) => s + q.depth, 0) / 4 }; };
  const lid = face([[u0, v0, th], [u1, v0, th], [u1, v1, th], [u0, v1, th]]);
  const fv1 = face([[u0, v1, 0], [u1, v1, 0], [u1, v1, th], [u0, v1, th]]), fv0 = face([[u0, v0, 0], [u1, v0, 0], [u1, v0, th], [u0, v0, th]]);
  const fu1 = face([[u1, v0, 0], [u1, v1, 0], [u1, v1, th], [u1, v0, th]]), fu0 = face([[u0, v0, 0], [u0, v1, 0], [u0, v1, th], [u0, v0, th]]);
  const walls = [fv1.depth < fv0.depth ? fv1 : fv0, fu1.depth < fu0.depth ? fu1 : fu0].sort((x, y) => y.depth - x.depth);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.lineJoin = 'round';
  const k = lid.Q[0].k;
  for (const f of [...walls, lid]) {
    ctx.beginPath(); f.Q.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath();
    ctx.fillStyle = f === lid ? 'rgba(29,31,36,0.14)' : 'rgba(29,31,36,0.26)'; ctx.fill();
    ctx.strokeStyle = F.ink; ctx.lineWidth = 2.2 * k; ctx.stroke();
  }
  ctx.restore();
  return P(u1 - 46, v1, th / 2);   // bottom edge, near the right corner: where the arrow leaves
}

/** the two-hop sketch: Apple Remote → ? → ?, drawn on its own sheet (no answer, no program name) */
function drawSketch(g, w) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  const node = (x, wd, p) => {
    if (p <= 0) return;
    g.save(); g.globalAlpha = clamp(p * 2);
    g.strokeStyle = F.ink; g.lineWidth = 5; g.beginPath(); g.roundRect(x, 92, wd, 116, 18); g.stroke();
    g.restore();
  };
  const arrowR = (x0, x1, p, label) => {
    if (p <= 0) return;
    const xe = lerp(x0, x1, clamp(p / 0.8));
    g.strokeStyle = F.ink; g.lineWidth = 5;
    g.beginPath(); g.moveTo(x0, 150); g.lineTo(xe, 150); g.stroke();
    if (p > 0.8) { g.beginPath(); g.moveTo(xe - 22, 136); g.lineTo(xe, 150); g.lineTo(xe - 22, 164); g.stroke(); }
    drawTex(g, label, (x0 + x1) / 2, 118, { size: 50, color: F.ink2, align: 'center', write: clamp((p - 0.3) / 0.7) });
  };
  node(40, 380, w.remote);
  drawTex(g, S.remote, 230, 150, { size: 58, color: F.ink, align: 'center', valign: 'middle', write: w.remote });
  arrowR(440, 660, w.hop1, S.hop1);
  node(680, 200, w.q1);
  drawTex(g, S.qm, 780, 150, { size: 86, color: F.ink, align: 'center', valign: 'middle', write: w.q1 });
  arrowR(900, 1120, w.hop2, S.hop2);
  node(1140, 200, w.q2);
  drawTex(g, S.qm, 1240, 150, { size: 86, color: F.ink, align: 'center', valign: 'middle', write: w.q2 });
}

/** dashed frame on a standing pose's crop rect, drawn on with p */
function dashedFrame(ctx, C, page, pose, p) {
  if (p <= 0) return;
  const r = pose.src;
  const P = [[r.x0, r.y0], [r.x1, r.y0], [r.x1, r.y1], [r.x0, r.y1], [r.x0, r.y0]].map(([u, v]) => onSheet(C, page, pose, u, v));
  const seg = []; let tot = 0;
  for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y); seg.push(d); tot += d; }
  let left = tot * clamp(p);
  ctx.save();
  ctx.strokeStyle = F.ink2; ctx.lineWidth = 2.6 * P[0].k; ctx.lineCap = 'round';
  ctx.setLineDash([16 * P[0].k, 12 * P[0].k]);
  ctx.beginPath(); ctx.moveTo(P[0].x, P[0].y);
  for (let i = 1; i < P.length && left > 0; i++) {
    const f = Math.min(1, left / seg[i - 1]);
    ctx.lineTo(lerp(P[i - 1].x, P[i].x, f), lerp(P[i - 1].y, P[i].y, f));
    left -= seg[i - 1];
  }
  ctx.stroke();
  ctx.restore();
}

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [2]);
    p2 = P.page(2);
    L = {
      blackBox: findPhrase(p2, 'reasoning is a static black box'),
      grounded: findPhrase(p2, 'is not grounded in the external world'),
      qLines: asLines(FIG1_LINES.q.slice(1, 4)),
      hall: asLines(FIG1.hallucination),
      thoughtLines: FIG1_LINES.b1.slice(1, 10),
      acts: FIG1_STEPS.c1.filter((s) => s.k === 'act'),
      act3obs3: union(FIG1_STEPS.c1.filter((s) => s.id === 'Act3' || s.id === 'Obs3')),
      act4: FIG1_STEPS.c1.find((s) => s.id === 'Act4'),
    };
    L.body = grow(union([...L.blackBox, ...L.grounded]), 10, 8);
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      running: q.w(0, 'running'), question: q.w(0, 'question'), hops: q.w(0, 'hops'),
      s1: q.s(1), e1: q.e(1), designed: q.w(1, 'designed'), one: q.w(1, 'one'),
      s2: q.s(2), e2: q.e(2), other: q.w(2, 'other'),
      s3: q.s(3), ipod: q.w(3, 'iPod'), s4: q.s(4),
      s5: q.s(5), reasons: q.w(5, 'reasons'), fact: q.w(5, 'fact'), s6: q.s(6),
      s7: q.s(7), black: q.w(7, 'black'), not: q.w(7, 'not'), external: q.w(7, 'external'),
      s8: q.s(8), search: q.w(8, 'search'), no: q.w(8, 'no'),
      reaches: q.w(9, 'reaches'), yes: q.w(9, 'yes'),
      s10: q.s(10), reasons10: q.w(10, 'reasons'), s11: q.s(11), and11: q.w(11, 'and'),
    };
    T.liftQ = T.hops + 0.12;

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    const C = cameraAt(t, [
      { t: 0, tx: 960, ty: 925, zoom: 1.5, pitch: 0.2 },
      { t: 1.2, dur: 3.0, zoom: 1.58 },
      { t: T.liftQ - 0.1, dur: 1.5, tx: 960, ty: 200, zoom: 1.15, pitch: PC },
      { t: T.s3 - 0.1, dur: 1.4, tx: 760, ty: 300, zoom: 1.12 },
      { t: T.s3 + 1.3, dur: 2.6, tx: 720, zoom: 1.18 },
      { t: T.s5 - 0.1, dur: 1.4, tx: 960, ty: 360, zoom: 1.3 },
      { t: T.s7 - 0.35, dur: 1.4, tx: 1000, ty: 1560, zoom: 1.5, pitch: 0.3 },
      { t: T.s8 - 0.1, dur: 1.5, tx: 1300, ty: 420, zoom: 1.2, pitch: PC },
      { t: T.s10 - 0.35, dur: 1.5, tx: 960, ty: 330, zoom: 1.0 },
      { t: T.s10 + 1.3, dur: 3.5, zoom: 1.04 },
    ]);

    // ── p. 2: slides up onto the desk and stays (the cards are copies) ──
    const pin = e(t, 0, 1.3, ease.outCubic);
    const pout = e(t, T.s10 - 0.3, 1.3, ease.inCubic);   // slides off the desk for the regroup
    const PG = { ...PP, y: lerp(2900, PP.y, pin) + 1300 * pout, z: Math.sin(Math.PI * pin) * 150 + Math.sin(Math.PI * pout) * 60, rot: lerp(0.1, PP.rot, pin) + 0.06 * pout };
    if (pout < 1) sheet(ctx, C, p2, PG);
    if (pout < 1) {
      const aTop = win(t, T.running - 0.1, T.question + 0.4, 0.3, 0.4);
      if (aTop > 0) { ctx.save(); ctx.globalAlpha *= aTop; markBox(ctx, C, p2, PG, FIG1.top, e(t, T.running - 0.1, 0.8), { color: F.ink2, width: 1.6, pad: 8 }); ctx.restore(); }
      const aq = 1 - e(t, T.liftQ + 0.4, 0.6, ease.linear);
      if (aq > 0) { ctx.save(); ctx.globalAlpha *= aq; markBox(ctx, C, p2, PG, FIG1.panels.q, e(t, T.question - 0.1, 0.7), { color: F.ink, width: 2.4, pad: 7 }); ctx.restore(); }
      // s7: the paper's own words about chain-of-thought, with the voice
      highlight(ctx, C, p2, PG, L.blackBox, sayWords(env, 7, 3, 8, t), { color: F.hlYellow });
      highlight(ctx, C, p2, PG, L.grounded, sayWords(env, 7, 9, 14, t), { color: F.hlYellow });
    }

    // ── card poses over time ──
    const lift = (crop, t0, dur, to, arc = 240) => liftPose(p2, PG, crop, { ...to, arc }, e(t, t0, dur, ease.linear));
    const regP = (t0) => e(t, t0, 1.4, ease.linear);
    const cards = [];

    // question card
    if (t >= T.liftQ) {
      let pose = lift(CROP.q, T.liftQ, 1.5, LANE.q, 300);
      if (t > T.s10 - 0.3) pose = travel(LANE.q, REG.q, regP(T.s10 - 0.3), 80);
      cards.push({ pose, draw: (P) => {
        sheet(ctx, C, p2, P, { grid: 6 });
        const d1 = T.e1 - T.s1, d2 = T.e2 - T.s2;
        highlight(ctx, C, p2, P, L.qLines, (sayP(env, 1, t) * d1 + sayP(env, 2, t) * d2) / (d1 + d2), { color: F.hlMint });
      } });
    }
    // (1a) Standard
    if (t >= T.s3) {
      let pose = lift(CROP.a1, T.s3, 1.4, LANE.a1);
      if (t > T.s10 - 0.3) pose = travel(LANE.a1, REG.a1, regP(T.s10 - 0.3), 100);
      cards.push({ pose, draw: (P) => {
        sheet(ctx, C, p2, P, { grid: 4 });
        const ans = FIG1_LINES.a1[1];
        inkPath(ctx, C, p2, P, [[ans.x0, ans.y1 + 3], [ans.x1, ans.y1 + 3]], e(t, T.ipod, 0.4, ease.linear), { width: 2 });
        outline(ctx, C, p2, P, PAL.bad, e(t, T.s4, 0.4, ease.linear));
        pulse(ctx, C, p2, P, FIG1.marks.a1, T.s4, t);
      } });
    }
    // (1b) CoT: lane → laid down under the body text (s7) → regroup, sealed in its box from s7 on
    if (t >= T.s5) {
      let pose = lift(CROP.b1, T.s5, 1.4, LANE.b1);
      if (t > T.s7 - 0.4) pose = travel(LANE.b1, NEAR_TEXT, e(t, T.s7 - 0.4, 1.4, ease.linear), 220);
      if (t > T.s10 - 0.35) pose = travel(NEAR_TEXT, REG.b1, e(t, T.s10 - 0.35, 1.6, ease.linear), 260);
      cards.push({ pose, draw: (P) => {
        sheet(ctx, C, p2, P, { grid: 6 });
        // reads fluently: a quick tick per thought line
        L.thoughtLines.forEach((l, i) => {
          const x = Math.min(l.x1 + 5, 536), y = (l.y0 + l.y1) / 2;
          inkPath(ctx, C, p2, P, [[x, y], [x + 4, y + 5], [x + 13, y - 6]], e(t, T.reasons + i * 0.1, 0.18, ease.linear), { color: F.ink2, width: 1.5 });
        });
        markBox(ctx, C, p2, P, union(FIG1.hallucination), e(t, T.fact - 0.13, 0.6), { color: F.red, width: 2.2, pad: 5 });
        highlight(ctx, C, p2, P, L.hall, sayWords(env, 5, 15, 22, t), { color: F.red, alpha: 0.4, pad: 2 });
        const role = e(t, T.reasons10, 0.5, ease.linear);
        outline(ctx, C, p2, P, mix(PAL.bad, PAL.thoughtInk, role), e(t, T.s6, 0.4, ease.linear));
        pulse(ctx, C, p2, P, FIG1.marks.b1, T.s6, t);
        // the black box settles over it on "black box"
        const sb = e(t, T.black - 0.25, 0.8, ease.outCubic);
        const edge = sealBox(ctx, C, p2, P, clamp(sb * 2.5), (1 - sb) * 260);
        // a dashed arrow toward the world stops short (s7 only)
        const aw = win(t, T.not - 0.1, T.s8 + 0.6, 0.3, 0.5);
        if (edge && aw > 0) {
          // routed down into the page's bottom margin, then right, so it never crosses the paper's lines
          const w = C.p(WORLD_AT.x, WORLD_AT.y, 0);
          const pts = [[edge.x, edge.y + 6], [edge.x, w.y], [w.x - 150, w.y]];
          const seg = [pts[1][1] - pts[0][1], pts[2][0] - pts[1][0]].map(Math.abs);
          let left = (seg[0] + seg[1]) * e(t, T.not, 1.0, ease.outCubic);
          ctx.save();
          ctx.globalAlpha *= aw;
          ctx.strokeStyle = F.ink; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.setLineDash([14, 12]);
          ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < 3 && left > 0; i++) {
            const f = Math.min(1, left / (seg[i - 1] || 1));
            ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f));
            left -= seg[i - 1];
          }
          ctx.stroke();
          ctx.restore();
          drawTex(ctx, S.world, w.x, w.y, { size: 46, color: F.ink3, align: 'left', valign: 'middle', write: e(t, T.external - 0.1, 0.8, ease.linear), alpha: aw });
        }
      } });
    }
    // (1c) Act-only
    if (t >= T.s8 - 0.1) {
      let pose = lift(CROP.c1, T.s8 - 0.1, 1.25, LANE.c1, 300);
      if (t > T.s10 - 0.2) pose = travel(LANE.c1, REG.c1, regP(T.s10 - 0.2), 120);
      cards.push({ pose, draw: (P) => {
        sheet(ctx, C, p2, P, { grid: 6 });
        L.acts.forEach((s, i) => markBox(ctx, C, p2, P, s, e(t, T.search + i * 0.17, 0.35), { color: PAL.actInk, width: 2.2, pad: 3 }));
        markBox(ctx, C, p2, P, L.act3obs3, e(t, T.reaches - 0.05, 0.6), { color: PAL.goodMark, width: 3, pad: 5 });
        markBox(ctx, C, p2, P, L.act4, e(t, T.yes - 0.05, 0.4), { color: F.red, width: 3, pad: 6 });
        const role = e(t, T.and11, 0.5, ease.linear);
        outline(ctx, C, p2, P, mix(PAL.bad, PAL.actInk, role), e(t, T.yes, 0.4, ease.linear));
        pulse(ctx, C, p2, P, FIG1.marks.c1, T.yes + 0.05, t);
      } });
      // "no thoughts", small, on the desk under the card
      const an = win(t, T.no - 0.1, T.s10 - 0.1, 0.3, 0.4);
      if (an > 0) {
        const b = C.p(LANE.c1.x, 672 + 34, 0);
        cards.push({ pose: { x: LANE.c1.x, y: 700, z: 0 }, draw: () => drawTex(ctx, S.noThought, b.x, b.y, { size: 38, color: F.ink2, align: 'center', valign: 'top', write: e(t, T.no - 0.1, 0.8, ease.linear), alpha: an }) });
      }
    }

    // ── the two-hop sketch (s1–s2): our drawing, standing under the question card ──
    const skIn = e(t, T.liftQ + 0.2, 0.9, ease.linear), skOut = e(t, T.s3 - 0.25, 1.0, ease.linear);
    if (skIn > 0 && skOut < 1) {
      const sk = blankPage('react-02-sketch', SK.w, SK.h, (g) => drawSketch(g, {
        remote: e(t, T.s1 + 0.1, 0.8, ease.linear),
        hop1: e(t, T.designed - 0.1, 0.8, ease.linear), q1: e(t, T.one - 0.05, 0.5, ease.linear),
        hop2: e(t, T.s2 - 0.1, 0.7, ease.linear), q2: e(t, T.other - 0.05, 0.5, ease.linear),
      }), { scale: 0.8 });
      const pose = skOut > 0 ? leave(SKETCH, skOut, { dx: 1700 }) : arrive(SKETCH, skIn, { dx: 1500, arc: 120 });
      cards.push({ pose, draw: (P) => sheet(ctx, C, sk, P, { grid: 6 }) });
    }

    // ── regroup (s10–s11): an empty (1d)-sized frame waits between the two ──
    cards.push({ pose: REG.d1, draw: (P) => dashedFrame(ctx, C, p2, P, e(t, T.s11 - 0.2, 1.3, ease.inOutCubic)) });

    // far → near
    cards.map((c) => ({ ...c, depth: C.p(c.pose.x, c.pose.y, c.pose.z || 0).depth }))
      .sort((a, b) => b.depth - a.depth).forEach((c) => c.draw(c.pose));

    // captions under the regrouped cards
    const ab = win(t, T.reasons10 - 0.1, env.dur + 1, 0.3, 0.1);
    if (ab > 0) {
      const b = C.p(REG.b1.x, 640 + 40, 0), c = C.p(REG.c1.x, 640 + 40, 0);
      drawTex(ctx, S.capB, b.x, b.y, { size: 44, color: PAL.thoughtInk, align: 'center', valign: 'top', write: e(t, T.reasons10 - 0.1, 1.0, ease.linear) });
      drawTex(ctx, S.capC, c.x, c.y, { size: 44, color: PAL.actInk, align: 'center', valign: 'top', write: e(t, T.and11 - 0.1, 1.0, ease.linear) });
    }

    // ── source stamp ──
    // Section 1 beat: the stamp moves to the left (the "world" arrow runs along the bottom right); it dips at each switch
    const sw0 = T.s7 - 0.2, sw1 = T.s8 + 0.3, body = t > sw0 && t < sw1;
    const dip = 1 - Math.max(win(t, sw0 - 0.25, sw0 + 0.25, 0.25, 0.25), win(t, sw1 - 0.25, sw1 + 0.25, 0.25, 0.25));
    cite(ctx, p2, { label: body ? S.c2s : S.c2f, rect: body ? L.body : FIG1.top, alpha: e(t, 0.8, 0.6) * dip, side: body ? 'left' : 'right' });
  },
};
