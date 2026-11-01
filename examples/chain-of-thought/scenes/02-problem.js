// problem — p. 2, then p. 1: scale alone wasn't enough (Section 1, mint with the voice); the two ideas to build on,
// as a sketch on our own sheet laid over Figure 2 (illustrative): rationales = a hand-written card stack feeding a
// model block, growing tall and costly; prompting = the same block with three question → answer pairs in front,
// no training, and a block twice the size that gives back the same grey card. Then Figure 1, left side: one solved
// example, a new question, and the Model Output frame lifted and standing: "27", struck in red. The right column
// stays under our sheet: "9" is not revealed here.
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, win, desk, edgeIn, loadPaper, findPhrase, cameraAt, sheet, sheetPt, onSheet,
  highlight, markBox, liftPose, cite, sayWords, tag, standIn, blankPage, slab, arrow3,
} from '/engine/folio.js';
import { PAL, PH, P2, FIG1 } from './_data.js';

// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars, same geometry) and redrawn figures.
const PAGES = true;

const S = {
  arith: '\\text{arithmetic}', common: '\\text{commonsense}', symb: '\\text{symbolic}',
  rat: '\\text{rationales}', prm: '\\text{prompting}', ill: '\\text{illustrative}',
  model: '\\text{model}',
  costly: '\\text{costly}', noTrain: '\\text{no training}',
  c2: '\\text{p.~2}\\;\\cdot\\;\\text{Section 1}',
  c1f: '\\text{p.~1}\\;\\cdot\\;\\text{Figure 1}',
};

// ── world layout (desk px) ───────────────────────────────────────────────────
const PG2 = { x: 760, y: 560, w: 1000, rot: 0.004 };          // p. 2 at rest
const SK = { w: 1350, h: 1150 };                               // the two-ideas sketch, page px of its blank sheet
const SK0 = { x: 1100, y: 242, z: 2, w: 541, rot: 0 };         // over Figure 2 (p. 2 u 969–1890, v 180–950): the body text stays clear
const SK1 = { x: 1100, y: 272, z: 2, w: 475, rot: 0 };         // smaller, over Figure 1's right column once p. 1 is down
const P1P = { x: 864, y: 0, w: 1100, rot: 0 };                 // p. 1 placed so Figure 1's right column (u 848–1582, v 1250–1790 covered) lies under SK1
const FIG_TX = 815;                                            // camera x while p. 1 slides in: the frame's right edge stays on the sketch, so the right column never shows
const FIG_TX2 = 862;                                           // once p. 1 is down (right column under the sketch), the whole sketch comes into frame
const PS = 0.5;                                                // pitch over the sketch: the blocks and the card stack read as 3D, the page still reads
const PC = 0.62;                                               // pitch of the closing card; the card tilts the same, facing the camera
const CARD = { x: 960, yb: 640, w: 1120 };                      // the lifted Model Output frame, standing
const TWENTY7 = { x0: 510, y0: 1672, x1: 538, y1: 1694 };      // "27." inside "A: The answer is 27." (page px, from the PNG; "27" itself ends at 531)

// sketch-local geometry, world px at SK0 scale, relative to the sketch centre (rot 0, so slabs stay axis-aligned)
const G = {
  colL: -134, colR: 134,
  head: -190, ill: 213,                                       // heading row and the illustrative label
  stack: { y: -72, w: 84, d: 54, t: 3.2, gap: 1.4, n0: 6, n1: 20 },
  block: { y: 58, w: 130, d: 64, h: 46 },
  pairs: { y: -95, dx: 84, w: 60, dq: 30, da: 18, gap: 6, t: 3 },
  out: { y: 142, w: 74, d: 40, t: 3 },
};

let p1, p2, L;

const union = (rs) => ({ x0: Math.min(...rs.map((r) => r.x0)), y0: Math.min(...rs.map((r) => r.y0)), x1: Math.max(...rs.map((r) => r.x1)), y1: Math.max(...rs.map((r) => r.y1)) });

// ── local helpers (kit candidates: outline, pulse, inkPath, arrive/leave) ───
function arrive(base, p, { dx = 0, dy = 0, rot = 0, arc = 150 } = {}) {
  const q = ease.outCubic(clamp(p));
  return { ...base, x: base.x + dx * (1 - q), y: base.y + dy * (1 - q), z: (base.z || 0) + Math.sin(Math.PI * clamp(p)) * arc, rot: (base.rot || 0) + rot * (1 - q) };
}
function leave(base, p, { dx = 0, dy = 0, arc = 90 } = {}) {
  const q = ease.inCubic(clamp(p));
  return { ...base, x: base.x + dx * q, y: base.y + dy * q, z: (base.z || 0) + Math.sin(Math.PI * clamp(p)) * arc };
}
/** outline around a card's crop edge, on its plane */
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
/** the figure's own mark pulses: two rings spreading from it, on the card's plane */
function pulse(ctx, C, page, pose, m, t0, t, color) {
  const cx = (m.x0 + m.x1) / 2, cy = (m.y0 + m.y1) / 2;
  for (let k = 0; k < 2; k++) {
    const l = (t - t0 - k * 0.28) / 0.75;
    if (l <= 0 || l >= 1) continue;
    const r = lerp(14, 60, ease.outCubic(l));
    ctx.save();
    ctx.globalAlpha *= 1 - l;
    ctx.strokeStyle = color;
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI * 2, q = onSheet(C, page, pose, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      if (!i) { ctx.lineWidth = 2.6 * q.k; ctx.moveTo(q.x, q.y); } else ctx.lineTo(q.x, q.y);
    }
    ctx.stroke();
    ctx.restore();
  }
}
/** an ink stroke through page-px points on a sheet, drawn on with p */
function inkPath(ctx, C, page, pose, pts, p, { color = F.ink, width = 2 } = {}) {
  if (p <= 0) return;
  const P = pts.map(([u, v]) => onSheet(C, page, pose, u, v));
  let Lt = 0; for (let i = 1; i < P.length; i++) Lt += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width * P[0].k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.setLineDash([Lt * clamp(p), Lt + 1]);
  ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke();
  ctx.restore();
}
/** grey ruled lines on the top face of a flat card (world box at height z): hand-written text, no words */
function ruled(ctx, C, b, z, n, { color = F.ink3, width = 1.4, alpha = 1 } = {}) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color; ctx.lineCap = 'round';
  const mx = (b.x1 - b.x0) * 0.14;
  for (let i = 0; i < n; i++) {
    const y = lerp(b.y0, b.y1, (i + 1) / (n + 1)), x1 = b.x1 - mx - (i === n - 1 ? (b.x1 - b.x0) * 0.25 : 0);
    const a = C.p(b.x0 + mx, y, z), c = C.p(x1, y, z);
    ctx.lineWidth = width * a.k;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.stroke();
  }
  ctx.restore();
}

/** rights-off p. 1: grey word bars plus Figure 1's frames, ✗ and ✓ redrawn from FIG1 (page px) */
function standIn1(page) {
  const frames = [FIG1.std.input, FIG1.std.output, FIG1.cot.input, FIG1.cot.output];
  return standIn(page, {
    draw(g) {
      g.strokeStyle = PAL.inputInk; g.lineWidth = 3;
      for (const r of frames) { g.beginPath(); g.roundRect(r.x0 + 4, r.y0 + 14, r.x1 - r.x0 - 8, r.y1 - r.y0 - 18, 24); g.stroke(); }
      g.globalCompositeOperation = 'multiply';
      g.fillStyle = PAL.cot; for (const r of FIG1.cot.chainLines) g.fillRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
      g.fillStyle = PAL.out; for (const r of FIG1.cot.outLines) g.fillRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
      g.globalCompositeOperation = 'source-over';
      const x = FIG1.std.x; g.strokeStyle = PAL.bad; g.lineWidth = 7; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x.x0 + 4, x.y0 + 4); g.lineTo(x.x1 - 4, x.y1 - 4); g.moveTo(x.x1 - 4, x.y0 + 4); g.lineTo(x.x0 + 4, x.y1 - 4); g.stroke();
      const k = FIG1.cot.tick; g.strokeStyle = PAL.outInk;
      g.beginPath(); g.moveTo(k.x0 + 4, k.y0 + 30); g.lineTo(k.x0 + 16, k.y1 - 4); g.lineTo(k.x1 - 4, k.y0 + 16); g.stroke();
    },
  });
}

/** the sketch sheet's paper: headings, a divider, the illustrative label (the 3D parts stand on it) */
function drawSketch(g, w) {
  g.strokeStyle = F.rule; g.lineWidth = 3; g.lineCap = 'round';
  const u = (x) => SK.w / 2 + (x * SK.w) / SK0.w, v = (y) => SK.h / 2 + (y * SK.w) / SK0.w;   // sketch-local world → sketch px
  g.beginPath(); g.moveTo(SK.w / 2, 70); g.lineTo(SK.w / 2, SK.h - 70); g.stroke();
  drawTex(g, S.rat, u(G.colL), v(G.head), { size: 80, color: F.ink, align: 'center', valign: 'middle', write: w.l });
  drawTex(g, S.prm, u(G.colR), v(G.head), { size: 80, color: F.ink, align: 'center', valign: 'middle', write: w.r });
  drawTex(g, S.ill, 40, v(G.ill), { size: 50, color: F.ink2, valign: 'middle', write: w.i });
}

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [1, 2]);
    p1 = PAGES ? P.page(1) : standIn1(P.page(1));
    p2 = PAGES ? P.page(2) : standIn(P.page(2));
    L = {
      scaling: findPhrase(p2, PH.scaling),
      three: findPhrase(p2, PH.threeKinds, 1),
      twoIdeas: findPhrase(p2, 'motivated by two ideas'),
      rationales: findPhrase(p2, PH.rationales),
      scratch: findPhrase(p2, PH.trainScratch),
      finetune: findPhrase(p2, PH.finetune),
      costly: findPhrase(p2, PH.costly),
      prompt: findPhrase(p2, PH.prompt),
      poorly: findPhrase(p2, PH.poorly),
      ans11: findPhrase(p1, 'The answer is 11.', 1),          // left column (first match)
      cafe: findPhrase(p1, 'Q: The cafeteria had 23 apples. If they used 20 to make lunch and bought 6 more, how many apples do they have?', 1),
      wrong: findPhrase(p1, PH.fig1Wrong),
    };
    L.leftCol = union([FIG1.std.input, FIG1.std.output]);
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      s1: q.s(1), arith: q.w(1, 'arithmetic'), common: q.w(1, 'commonsense'), symb: q.w(1, 'symbolic'),
      s2: q.s(2), two: q.w(2, 'two'),
      s3: q.s(3), train: q.w(3, 'train'), write: q.w(3, 'write'),
      s4: q.s(4), large: q.w(4, 'large'), costly: q.w(4, 'costly'),
      s5: q.s(5), prompting: q.w(5, 'prompting'),
      s6: q.s(6), questions: q.w(6, 'questions'), answers: q.w(6, 'answers'), picks: q.w(6, 'picks'), task: q.w(6, 'task'),
      s7: q.s(7),
      s8: q.s(8), bigger: q.w(8, 'bigger'), doesnt: q.w(8, "doesn't"),
      s9: q.s(9), left: q.w(9, 'left'),
      s10: q.s(10), answer10: q.w(10, 'the'),
      s11: q.s(11), newQ: q.w(11, 'a'),
      s12: q.s(12), tw7: q.w(12, 'twenty-seven'),
      s13: q.s(13),
    };
    T.swap = T.s9 - 0.35;                 // p. 2 out, p. 1 in, the sketch shrinks over Figure 1's right column
    T.lift = T.s12 - 0.05;                // the Model Output frame lifts; p. 1 and the sketch leave together

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    const w2 = (u, v) => sheetPt(p2, PG2, u, v), w1 = (u, v) => sheetPt(p1, P1P, u, v);
    const para = w2(622, 450), wide = w2(1100, 735), fig = w1(1000, 1505);
    const C = cameraAt(t, [
      { t: 0, tx: para[0] + 40, ty: para[1] + 30, zoom: 1.8, pitch: 0.2 },
      { t: 0.6, dur: 2.0, tx: para[0], ty: para[1], zoom: 2.0 },
      { t: 2.8, dur: 6.4, tx: para[0] + 16, zoom: 2.06 },
      { t: T.s2 - 0.3, dur: 1.5, tx: wide[0], ty: wide[1], zoom: 1.75, pitch: PS },
      { t: T.s3 + 0.5, dur: 6.0, tx: wide[0] - 12, ty: wide[1] + 14, zoom: 1.78 },
      { t: T.s6 - 0.2, dur: 6.0, tx: wide[0] + 10, ty: wide[1] + 26, zoom: 1.8 },
      { t: T.swap - 0.45, dur: 1.0, tx: FIG_TX, ty: fig[1], zoom: 1.85, pitch: 0.24 },
      { t: T.swap + 1.35, dur: 1.2, tx: FIG_TX2 },
      { t: T.swap + 2.6, dur: 6.0, ty: fig[1] + 12, zoom: 1.9 },
      { t: T.lift, dur: 1.4, tx: CARD.x, ty: CARD.yb - 170, zoom: 1.3, pitch: PC },
      { t: T.lift + 1.5, dur: 2.4, zoom: 1.35, yaw: -0.05 },
    ]);

    // ── p. 2: arrives, is read, leaves to the left as p. 1 comes in from the right ──
    const in2 = e(t, 0, 1.3, ease.linear), out2 = e(t, T.swap, 1.2, ease.linear);
    if (out2 < 1) {
      const PG = leave(arrive(PG2, in2, { dx: -200, dy: 900, rot: -0.07, arc: 170 }), out2, { dx: -1700, dy: 60, arc: 70 });
      sheet(ctx, C, p2, PG);
      highlight(ctx, C, p2, PG, L.scaling, sayWords(env, 1, 0, 11, t), { color: F.hlMint });
      highlight(ctx, C, p2, PG, L.three, sayWords(env, 1, 12, 17, t), { color: F.hlMint });
      highlight(ctx, C, p2, PG, L.twoIdeas, sayWords(env, 2, 2, 3, t), { color: F.hlMint });
      highlight(ctx, C, p2, PG, L.scratch, e(t, T.train, 0.5, ease.linear), { color: F.hlMint });
      highlight(ctx, C, p2, PG, L.finetune, e(t, T.train + 0.3, 0.5, ease.linear), { color: F.hlMint });
      highlight(ctx, C, p2, PG, L.rationales, sayWords(env, 3, 5, 11, t), { color: F.hlMint });
      highlight(ctx, C, p2, PG, L.costly, sayWords(env, 4, 3, 11, t), { color: F.hlMint });
      highlight(ctx, C, p2, PG, L.prompt, sayWords(env, 6, 0, 15, t), { color: F.hlMint });
      highlight(ctx, C, p2, PG, L.poorly, sayWords(env, 8, 0, 12, t), { color: F.hlMint });

      // s1: the three kinds of reasoning, dropped beside the column
      const ak = win(t, T.arith - 0.1, T.s2 + 0.1, 0.25, 0.45);
      if (ak > 0) {
        [[S.arith, T.arith], [S.common, T.common], [S.symb, T.symb]].forEach(([src, t0], i) => {
          const d = e(t, t0 - 0.05, 0.45);
          const s = onSheet(C, p2, PG, 268, 470 + i * 62);
          tag(ctx, src, s.x, s.y - (1 - d) * 26, { size: 44, color: F.ink, align: 'right', valign: 'middle', write: e(t, t0 - 0.05, 0.5, ease.linear), alpha: ak });
        });
      }
    }

    // ── p. 1 (s9 on): Figure 1, left column ──
    const in1 = e(t, T.swap + 0.15, 1.15, ease.linear), out1 = e(t, T.lift + 0.1, 1.3, ease.linear);
    let PGa = null;
    if (in1 > 0 && out1 < 1) {
      // slides in flat from the right, under the sketch: the right column only ever moves under it (never in view)
      PGa = leave(arrive(P1P, in1, { dx: 1500, dy: 0, rot: 0, arc: 0 }), out1, { dx: -260, dy: -1500, arc: 0 });
      sheet(ctx, C, p1, PGa);
      const ah = win(t, T.left, T.s10 + 0.2, 0.01, 0.35);
      if (ah > 0) { ctx.save(); ctx.globalAlpha *= ah; markBox(ctx, C, p1, PGa, FIG1.std.head, e(t, T.left, 0.7, ease.inOutCubic), { color: F.ink, width: 2.4, pad: 6 }); ctx.restore(); }
      const ae = win(t, T.s10, T.s11 + 0.2, 0.01, 0.35);
      if (ae > 0) { ctx.save(); ctx.globalAlpha *= ae; markBox(ctx, C, p1, PGa, FIG1.std.exemplar, e(t, T.s10, 1.1, ease.inOutCubic), { color: F.ink, width: 2.4, pad: 6 }); ctx.restore(); }
      highlight(ctx, C, p1, PGa, L.ans11, sayWords(env, 10, 6, 9, t), { color: F.hlMint });
      const aq = win(t, T.newQ, T.lift + 0.3, 0.01, 0.35);
      if (aq > 0) { ctx.save(); ctx.globalAlpha *= aq; markBox(ctx, C, p1, PGa, FIG1.std.question, e(t, T.newQ, 0.9, ease.inOutCubic), { color: F.ink, width: 2.4, pad: 6 }); ctx.restore(); }
      highlight(ctx, C, p1, PGa, L.cafe, sayWords(env, 11, 4, 7, t), { color: F.hlMint });
    }

    // ── the two-ideas sketch (ours, illustrative): arrives on "two ideas", shrinks over Figure 1's right column ──
    const skIn = e(t, T.two - 0.1, 1.2, ease.linear);
    const skShr = e(t, T.swap + 0.1, 1.3, ease.inOutCubic);
    const skOut = e(t, T.lift + 0.1, 1.3, ease.linear);
    if (skIn > 0 && skOut < 1) {
      const base = { ...SK0, w: lerp(SK0.w, SK1.w, skShr), x: lerp(SK0.x, SK1.x, skShr), y: lerp(SK0.y, SK1.y, skShr), z: SK0.z + Math.sin(Math.PI * skShr) * 60 };
      const SP = leave(arrive(base, skIn, { dx: 900, dy: -80, arc: 160 }), skOut, { dx: -260, dy: -1500, arc: 0 });
      const sheetW = { l: e(t, T.two + 0.8, 0.8, ease.linear), r: e(t, T.two + 1.1, 0.8, ease.linear), i: e(t, T.two + 1.3, 0.6, ease.linear) };
      const pg = blankPage('cot02-sketch', SK.w, SK.h, (g) => drawSketch(g, sheetW), { scale: 0.75 });
      sheet(ctx, C, pg, SP, { shadow: 0.7 });
      drawIdeas(ctx, C, SP, t, T);
    }

    // ── s12–s13: the Model Output frame lifts, stands, "27" struck ──
    const lp = e(t, T.lift, 1.3, ease.linear);
    if (lp > 0) {
      const crop = FIG1.std.output;
      const h = CARD.w * (crop.y1 - crop.y0) / (crop.x1 - crop.x0);
      const to = { x: CARD.x, y: CARD.yb - h / 2, z: 0, w: CARD.w, tilt: PC, rot: 0, arc: 220 };
      const from = { ...P1P };
      const CP = liftPose(p1, from, crop, to, lp);
      sheet(ctx, C, p1, CP, { grid: 6, shadow: 0.6 });
      const bad = e(t, T.s13, 0.4, ease.linear);
      outline(ctx, C, p1, CP, PAL.inputInk, 1 - bad, 3);
      outline(ctx, C, p1, CP, PAL.bad, bad, 5);
      markBox(ctx, C, p1, CP, TWENTY7, e(t, T.tw7, 0.6, ease.inOutCubic), { color: F.ink, width: 1.8, pad: 3 });
      pulse(ctx, C, p1, CP, FIG1.std.x, T.s13, t, PAL.bad);
      inkPath(ctx, C, p1, CP, [[TWENTY7.x0 - 3, 1687], [531 + 4, 1679]], e(t, T.s13 + 0.05, 0.35, ease.inOutCubic), { color: PAL.bad, width: 3.2 });
    }

    // ── source stamp ──
    let page = p2, rect = P2.intro, label = S.c2;
    if (t >= T.s2 - 0.2 && t < T.s4 + 0.6) rect = P2.twoIdeas;
    else if (t >= T.s4 + 0.6 && t < T.s5) rect = P2.limits;
    else if (t >= T.s5 && t < T.s8 - 0.2) rect = P2.twoIdeas;
    else if (t >= T.s8 - 0.2 && t < T.swap + 0.6) rect = P2.limits;
    if (t >= T.swap + 0.6) { page = p1; label = S.c1f; rect = t < T.lift ? L.leftCol : FIG1.std.output; }
    cite(ctx, page, { label, rect, alpha: e(t, 0.8, 0.6), side: 'right' });
  },
};

/** "model", written on the top face of a block (world centre [x, y] at height z) */
function topLabel(ctx, C, [x, y], z, size, a) {
  if (a <= 0) return;
  const c = C.p(x, y, z);
  drawTex(ctx, S.model, c.x, c.y, { size: size * c.k, color: F.ink, align: 'center', valign: 'middle', alpha: a });
}

/** the 3D parts standing on the sketch: card stack → model (rationales); question → answer pairs → model → output (prompting) */
function drawIdeas(ctx, C, SP, t, T) {
  const s = SP.w / SK0.w, ox = SP.x, oy = SP.y, oz = SP.z || 0;
  const W = (x, y) => [ox + x * s, oy + y * s];
  const box = (cx, cy, w, d, z0, z1) => { const [x, y] = W(cx, cy); return { x0: x - (w * s) / 2, x1: x + (w * s) / 2, y0: y - (d * s) / 2, y1: y + (d * s) / 2, z0: oz + z0 * s, z1: oz + z1 * s }; };

  // ── left: rationales ──
  const bL = e(t, T.train, 0.6);
  const st = G.stack, nShow = Math.round(lerp(0, st.n0, clamp((t - T.train - 0.15) / 0.9)) + (st.n1 - st.n0) * clamp((t - T.large) / 1.1));
  arrow3(ctx, C, [[...W(G.colL, st.y + st.d / 2 + 8), oz + 1], [...W(G.colL, G.block.y - G.block.d / 2 - 8), oz + 1]], e(t, T.write, 0.5, ease.inOutCubic), { color: F.ink2, width: 2.6 * s, headLen: 12 * s });
  for (let i = 0; i < nShow; i++) {
    const tIn = i < st.n0 ? T.train + 0.15 + (i * 0.9) / st.n0 : T.large + ((i - st.n0) * 1.1) / (st.n1 - st.n0);
    const drop = 1 - e(t, tIn, 0.3);
    const z0 = i * (st.t + st.gap) + drop * 40;
    const jit = ((i * 37) % 7) - 3;
    slab(ctx, C, box(G.colL + jit * 0.6, st.y + (((i * 53) % 5) - 2) * 0.5, st.w, st.d, z0, z0 + st.t), { fill: F.paper, stroke: F.ink3, width: 1.1, alpha: clamp((1 - drop) * 2) });
    if (i === nShow - 1) ruled(ctx, C, box(G.colL + jit * 0.6, st.y, st.w, st.d, 0, 0), oz + (z0 + st.t) * s, 4, { width: 1.6 * s });
  }
  if (bL > 0) {
    const b = G.block;
    slab(ctx, C, box(G.colL, b.y, b.w, b.d, 0, b.h * bL), { fill: PAL.model, stroke: F.ink, width: 2 });
    topLabel(ctx, C, W(G.colL, b.y), oz + b.h * bL * s, 38 * s, clamp((bL - 0.7) * 3));
  }
  // "costly", beside the stack, at mid-height
  const ac = e(t, T.costly - 0.05, 0.5, ease.linear);
  if (ac > 0) {
    const side = C.p(...W(G.colL + st.w / 2 + 14, st.y), oz + (st.n1 * (st.t + st.gap) * 0.5) * s);
    tag(ctx, S.costly, side.x, side.y, { size: 44, color: PAL.badInk, valign: 'middle', write: ac });
  }

  // ── right: prompting ──
  const bR = e(t, T.prompting, 0.6), grow = e(t, T.bigger, 0.8, ease.inOutCubic);
  const B = G.block, bw = B.w * lerp(1, 1.5, grow), bd = B.d * lerp(1, 1.5, grow), bh = B.h * lerp(1, 2.2, grow);
  const bcy = B.y - B.d / 2 + bd / 2;                      // grows towards the camera, back edge fixed (the prompt row stays in view)
  const pr = G.pairs;
  const pq = [0, 1, 2].map((i) => e(t, T.questions - 0.1 + i * 0.12, 0.35)), pa = [0, 1, 2].map((i) => e(t, T.answers - 0.1 + i * 0.12, 0.35));
  [-1, 0, 1].forEach((k, i) => {
    const cx = G.colR + k * pr.dx;
    if (pq[i] > 0) {
      const zq = (1 - pq[i]) * 40;
      const bq = box(cx, pr.y, pr.w, pr.dq, zq, zq + pr.t);
      slab(ctx, C, bq, { fill: PAL.input, stroke: PAL.inputInk, width: 1.2, alpha: clamp(pq[i] * 2) });
      ruled(ctx, C, bq, bq.z1, 2, { width: 1.4 * s, alpha: clamp(pq[i] * 2) });
    }
    if (pa[i] > 0) {
      const za = (1 - pa[i]) * 40;
      const ba = box(cx, pr.y + pr.dq / 2 + pr.gap + pr.da / 2, pr.w, pr.da, za, za + pr.t);
      slab(ctx, C, ba, { fill: PAL.out, stroke: PAL.outInk, width: 1.2, alpha: clamp(pa[i] * 2) });
    }
  });
  arrow3(ctx, C, [[...W(G.colR, pr.y + pr.dq / 2 + pr.gap + pr.da + 6), oz + 1], [...W(G.colR, bcy - bd / 2 - 6), oz + 1]], e(t, T.picks - 0.1, 0.45, ease.inOutCubic), { color: F.ink2, width: 2.6 * s, headLen: 12 * s });
  // the output card: out on "task", back in on "bigger", out again on "doesn't": the same grey
  const o = G.out, front = bcy + bd / 2, outY = o.y + (bd - B.d);   // the output card's spot moves forward with the block's front
  const outP = e(t, T.task - 0.1, 0.55, ease.inOutCubic) * (1 - e(t, T.bigger + 0.1, 0.45, ease.inOutCubic)) + e(t, T.doesnt - 0.15, 0.6, ease.inOutCubic);
  if (bR > 0) {
    slab(ctx, C, box(G.colR, bcy, bw, bd, 0, bh * bR), { fill: PAL.model, stroke: F.ink, width: 2 });
    topLabel(ctx, C, W(G.colR, bcy), oz + bh * bR * s, 38 * s * lerp(1, 1.35, grow), clamp((bR - 0.7) * 3));
  }
  if (outP > 0.02) {
    const cy = lerp(front - o.d / 2, outY, outP), y0 = Math.max(cy - o.d / 2, front + 1);
    const [, wy0] = W(0, y0), [, wy1] = W(0, cy + o.d / 2);
    if (wy1 - wy0 > 1) {
      const [x] = W(G.colR, 0);
      const ob = { x0: x - (o.w * s) / 2, x1: x + (o.w * s) / 2, y0: wy0, y1: wy1, z0: oz, z1: oz + o.t * s };
      slab(ctx, C, ob, { fill: PAL.std, stroke: PAL.stdInk, width: 1.4 });
      ruled(ctx, C, ob, ob.z1, 2, { width: 1.4 * s, alpha: clamp((outP - 0.6) * 3) });
    }
  }
  // "no training", under the prompting column
  const an = win(t, T.s7 - 0.05, T.s8 + 0.5, 0.3, 0.4);
  if (an > 0) {
    const pt = C.p(...W(G.colR, o.y + o.d / 2 + 30), oz);
    tag(ctx, S.noTrain, pt.x, pt.y, { size: 42, color: F.ink, align: 'center', valign: 'middle', write: e(t, T.s7 - 0.05, 0.6, ease.linear), alpha: an });
  }
}
