// idea — p. 2's "combine the two ideas" line, then the triple: ⟨input, chain of thought, output⟩ lifts off p. 2
// as a standing strip (the paper's coinage, blue marker) and three stacked slabs stand up under it. Figure 1's
// right column on p. 1: the exemplar's chain read with an ink underline (the paper already highlights it blue),
// then its pieces lift onto the triple. The cafeteria question goes through the model block, a new triple comes
// out, and the paper's green lines fill its chain slab one spoken piece at a time; ✓, with segment 2's 27 ✗
// beside it. p. 2's definition of a chain of thought in yellow. Last: one model block, two prompts that differ
// only by the chain slab.
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, win, mix, desk, edgeIn, loadPaper, findPhrase, cameraAt, sheet,
  highlight, markBox, liftPose, arcPose, slab, arrow3, tag, cite, sayP, sayWords, standIn,
} from '/engine/folio.js';
import { PAL, PH, FIG1, STACK } from './_data.js';

// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars, same geometry) and redrawn figures.
const PAGES = true;

const S = {
  c2: '\\text{p.~2}\\;\\cdot\\;\\text{Section 1}',
  c1: '\\text{p.~1}\\;\\cdot\\;\\text{Figure 1}',
  input: '\\text{input}',
  chain: '\\text{chain of thought}',
  output: '\\text{output}',
  model: '\\text{language model}',
  illus: '\\text{layout illustrative}',
  redrawn: '\\text{stand-in pages, figures redrawn}',
};

// ── world layout (desk px) ───────────────────────────────────────────────────
const PG = { x: 1150, y: 640, w: 1000, rot: 0 };       // p. 2, then p. 1, at rest (the same spot)
const ROW = 1420;                                       // the build row, in front of the pages
const TW = STACK.triple.w, TD = STACK.triple.d, GAP = STACK.triple.gap;
const FRONT = ROW + TD / 2;                             // front faces of everything in the row
// Figure 1's crops are squarer than Table 20's, so this segment's triples keep STACK.triple's footprint and gap
// and take their slab heights from the crops they carry (σ world px per page px).
const SIG = 0.55;
const HI = { input: 52, chain: 46, output: 22 };
const TRI = { x: 450, y: ROW };                          // the exemplar triple (stands up in s1)
const QS = { x: 790, y: ROW };                           // the lone input slab for the new question
const MODEL = { x0: 1010, x1: 1220, y0: ROW - 65, y1: ROW + 65, h: 112 };
const ANS = { x: 1450, y: ROW };                         // the generated triple
const STD = { x: 450, y: 1700 };                         // s12: the standard prompt, front lane
const BAD = { x: 1450, y: 1700 };                        // s10: the 27 ✗ card, front lane
const PC = 0.9;                                          // pitch of the 3D beats

// crops of p. 1 (page px). Line crops padded ≤ 3 px vertically.
const CR = {
  q: { x0: 874, y0: 1336, x1: 1358, y1: 1418 },                 // Q: Roger … (right column)
  c1: { x0: 876, y0: 1434, x1: 1356, y1: 1461 },                // A: Roger started with 5 balls. 2 cans of 3 tennis balls
  c2: { x0: 876, y0: 1460, x1: 1178, y1: 1487 },                // each is 6 tennis balls. 5 + 6 = 11.
  a11: { x0: 1178, y0: 1459, x1: 1340, y1: 1486 },              // The answer is 11.
  cafe: { x0: 874, y0: 1501, x1: 1334, y1: 1584 },              // Q: The cafeteria … (= FIG1.cot.question, 2 px pad)
  g1: { x0: 876, y0: 1661, x1: 1346, y1: 1687 },                // A: The cafeteria had 23 apples originally. They used
  g2: { x0: 876, y0: 1686, x1: 1313, y1: 1710 },                // 20 to make lunch. So they had 23 - 20 = 3. They
  g3: { x0: 876, y0: 1709, x1: 1294, y1: 1734 },                // bought 6 more apples, so they have 3 + 6 = 9.
  a9a: { x0: 1294, y0: 1709, x1: 1334, y1: 1734 },              // The
  a9b: { x0: 876, y0: 1733, x1: 989, y1: 1759 },                // answer is 9.
  tick: { x0: 992, y0: 1734, x1: 1028, y1: 1762 },              // ✓ (FIG1.cot.tick reaches up into line 3; tightened)
  bad: { x0: 346, y0: 1664, x1: 590, y1: 1706 },                // A: The answer is 27. ✗ (FIG1.std.answer, padded)
  stdQ: { x0: 343, y0: 1334, x1: 827, y1: 1414 },               // Q: Roger … (left column)
  stdA: { x0: 374, y0: 1433, x1: 536, y1: 1461 },               // The answer is 11. (left column)
  strip: { x0: 709, y0: 1310, x1: 1166, y1: 1341 },             // p. 2: triples: ⟨input, chain of thought, output⟩.
};

let p1, p2, L;

const union = (rs) => ({ x0: Math.min(...rs.map((r) => r.x0)), y0: Math.min(...rs.map((r) => r.y0)), x1: Math.max(...rs.map((r) => r.x1)), y1: Math.max(...rs.map((r) => r.y1)) });
const ww = (r) => r.x1 - r.x0, hh = (r) => r.y1 - r.y0;

// ── local helpers (kit candidates: arrive, underline, triple, faceCard, glowSlab) ──
/** a sheet being put down: slides in from (dx, dy) with a small lift */
export function arrive(base, p, { dx = 0, dy = 800, rot = 0.1, arc = 170 } = {}) {
  const q = ease.outCubic(clamp(p));
  return { ...base, x: base.x + dx * (1 - q), y: base.y + dy * (1 - q), z: (base.z || 0) + Math.sin(Math.PI * clamp(p)) * arc, rot: (base.rot || 0) + rot * (1 - q) };
}
/** a sheet picked up and taken off the desk towards (dx, dy) */
export function leave(base, p, { dx = 1600, dy = -200, rot = 0.12, arc = 120 } = {}) {
  const q = ease.inCubic(clamp(p));
  return { ...base, x: base.x + dx * q, y: base.y + dy * q, z: (base.z || 0) + Math.sin(Math.PI * clamp(p)) * arc, rot: (base.rot || 0) + rot * q };
}
/** ink underline that follows the voice over findPhrase lines (for lines the paper already highlights) */
export function underline(ctx, C, page, pose, lines, p, color = PAL.cotInk) {
  highlight(ctx, C, page, pose, lines.map((l) => ({ ...l, y0: l.y1 - 3 })), p, { color, alpha: 1, pad: 2 });
}
/** slab with an optional coloured glow (canvas shadow) and outline pulse */
function glowSlab(ctx, C, box, o, glow = 0, glowColor = PAL.cot) {
  ctx.save();
  if (glow > 0) { ctx.shadowColor = glowColor; ctx.shadowBlur = 34 * glow; }
  slab(ctx, C, box, o);
  ctx.restore();
}
/** dashed outline of a box that isn't there (visible edges only, like slab()) */
function dashedBox(ctx, C, b, { color = F.ink2, width = 2, alpha = 1 } = {}) {
  if (alpha <= 0) return;
  const { x0, y0, x1, y1, z0, z1 } = b;
  const seg = [
    [[x0, y1, z0], [x1, y1, z0]], [[x1, y1, z0], [x1, y1, z1]], [[x1, y1, z1], [x0, y1, z1]], [[x0, y1, z1], [x0, y1, z0]],   // front
    [[x0, y0, z1], [x1, y0, z1]], [[x0, y0, z1], [x0, y1, z1]], [[x1, y0, z1], [x1, y1, z1]],                               // top
  ];
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color; ctx.lineCap = 'round';
  for (const [a, b2] of seg) {
    const A = C.p(...a), B = C.p(...b2);
    ctx.lineWidth = width * A.k; ctx.setLineDash([9 * A.k, 7 * A.k]);
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
  }
  ctx.restore();
}
/**
 * triple(ctx, C, T) — one prompt exemplar as three stacked slabs: input (bottom), chain of thought, output (top),
 * in the video's colours. T = { x, y, w, d, gap, h: {input, chain, output}, rise: {…} 0..1, alpha,
 * glow: {…} 0..1 (PAL.cot halo on chain, outline pulse elsewhere), missing: { chain: 0..1 } (dashed, no slab),
 * face: { input(z0, z1), … } callbacks that draw on a slab's front face right after it }.
 * Each slab grows up from the top of the one below, so the stack stays closed. Returns { input: [z0, z1], … }.
 */
const KIND = { input: [PAL.input, PAL.inputInk], chain: [PAL.cot, PAL.cotInk], output: [PAL.out, PAL.outInk] };
export function triple(ctx, C, T) {
  const { x, y, w = TW, d = TD, gap = GAP, h = STACK.triple.h, rise = {}, glow = {}, missing = {}, face = {}, alpha = 1 } = T;
  const out = {};
  let z = 0;
  for (const k of ['input', 'chain', 'output']) {
    const r = rise[k] ?? 1, z0 = z, z1 = z0 + h[k] * clamp(r);
    out[k] = [z0, z0 + h[k]];
    const box = { x0: x - w / 2, x1: x + w / 2, y0: y - d / 2, y1: y + d / 2, z0, z1: Math.max(z0 + 0.5, z1) };
    if (missing[k] !== undefined) {
      dashedBox(ctx, C, { ...box, z1: z0 + h[k] }, { color: F.ink2, alpha: missing[k] * alpha });
    } else if (r > 0) {
      const [fill, ink] = KIND[k], g = glow[k] || 0;
      if (k === 'chain') glowSlab(ctx, C, box, { fill, stroke: ink, width: 2.2 + 1.6 * g, alpha: alpha * clamp(r * 3) }, g, PAL.cot);
      else slab(ctx, C, box, { fill, stroke: g > 0 ? mix(ink, k === 'input' ? F.ink : ink, 0.3) : ink, width: 2.2 + 3 * g, alpha: alpha * clamp(r * 3) });
      if (face[k] && r >= 1) face[k](z0, z0 + h[k]);
    }
    z = z0 + h[k] * (missing[k] !== undefined ? 1 : clamp(r)) + gap;
  }
  return out;
}
/** pose of a crop standing upright on a slab's front face: centre x, bottom at z, width w (world px) */
export function faceCard(rect, x, z, w, yFront = FRONT) {
  const hb = (w * hh(rect)) / ww(rect) / 2;
  return { src: rect, x, y: yFront + 0.8 - hb, z, w, tilt: Math.PI / 2, rot: 0 };
}
/** a group of crops kept at their page geometry, standing on a face: left edge X0, bottom Z0, scale s */
function faceGroup(rects, X0, Z0, s = SIG, yFront = FRONT) {
  const G = union(rects);
  return rects.map((r) => faceCard(r, X0 + (r.x0 - G.x0) * s + (ww(r) * s) / 2, Z0 + (G.y1 - r.y1) * s, ww(r) * s, yFront));
}
/** quadratic Bézier through three world points, sampled (for arched arrows) */
const bez3 = (A, B, Cc, n = 28) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; return [0, 1, 2].map((k) => a * A[k] + b * B[k] + c * Cc[k]); });
/** outline drawn around a sheet pose (all of its src) */
function outline(ctx, C, page, pose, color, width = 3, p = 1) {
  markBox(ctx, C, page, pose, pose.src, p, { color, width, pad: 0 });
}

/** stand-in redraw of Figure 1's colours (frames, the paper's blue and green highlights, ✓ and ✗), PAGES = false */
function fig1Redraw(g) {
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = PAL.cot; for (const r of FIG1.cot.chainLines) g.fillRect(r.x0, r.y0, ww(r), hh(r));
  g.fillStyle = PAL.out; for (const r of FIG1.cot.outLines) g.fillRect(r.x0, r.y0, ww(r), hh(r));
  g.globalCompositeOperation = 'source-over';
  g.strokeStyle = PAL.inputInk; g.lineWidth = 3;
  for (const r of [FIG1.std.input, FIG1.std.output, FIG1.cot.input, FIG1.cot.output]) { g.beginPath(); g.roundRect(r.x0 + 2, r.y0 + 14, ww(r) - 4, hh(r) - 16, 28); g.stroke(); }
  g.lineCap = 'round'; g.lineWidth = 7;
  g.strokeStyle = PAL.outInk; g.beginPath(); g.moveTo(998, 1748); g.lineTo(1007, 1757); g.lineTo(1024, 1736); g.stroke();
  g.strokeStyle = PAL.bad; g.beginPath(); g.moveTo(550, 1669); g.lineTo(578, 1698); g.moveTo(578, 1669); g.lineTo(550, 1698); g.stroke();
}

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [1, 2]);
    p1 = PAGES ? P.page(1) : standIn(P.page(1), { draw: fig1Redraw });
    p2 = PAGES ? P.page(2) : standIn(P.page(2));
    L = {
      combine: findPhrase(p2, PH.combine),
      triples: findPhrase(p2, PH.triples),
      defn: findPhrase(p2, PH.definitionFull),
      ex: findPhrase(p1, PH.fig1Ex),
    };
    L.para = union([...L.combine, ...L.defn, { x0: 300, y0: 1105, x1: 1405, y1: 1395 }]);
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      s1: q.s(1), triple: q.w(1, 'triple'), input: q.w(1, 'input'), chain: q.w(1, 'chain'), output: q.w(1, 'output'),
      s2: q.s(2), right: q.w(2, 'right'),
      same: q.w(3, 'same'), shows: q.w(3, 'shows'),
      s4: q.s(4), e6: q.e(6), eleven: q.w(6, 'eleven'),
      s7: q.s(7), model7: q.w(7, 'model'), follows: q.w(7, 'follows'), writes: q.w(7, 'writes'), own: q.w(7, 'own'), newq: q.w(7, 'new'),
      s8: q.s(8), twenty: q.w(8, 'twenty'), e8: q.e(8),
      s9: q.s(9), e9: q.e(9),
      s10: q.s(10),
      s11: q.s(11),
      s12: q.s(12), stays: q.w(12, 'stays'), examples: q.w(13, 'examples'), end: q.e(13),
    };

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    // ── camera ──
    const pg = (u, v) => [PG.x + (u - 850) * (PG.w / 1700), PG.y + (v - 1100) * (PG.w / 1700)];
    const [pxx, pyy] = pg(850, 1300);          // p. 2's paragraph
    const [fx, fy] = pg(1114, 1440);           // Figure 1 right column
    const [cx2, cy2] = pg(1116, 1460);         // the exemplar's two chain lines
    const [dx2, dy2] = pg(860, 1342);          // p. 2's definition lines
    const C = cameraAt(t, [
      { t: 0, tx: pxx, ty: pyy - 30, zoom: 1.45, pitch: 0.14 },
      { t: 0.2, dur: 2.6, ty: pyy, zoom: 1.62 },                                         // into the paragraph
      { t: T.s1 + 0.05, dur: 1.7, tx: 480, ty: 1300, zoom: 1.62, pitch: 0.85 },            // the triple stands up
      { t: T.s1 + 1.8, dur: 3.0, tx: 465, zoom: 1.7 },                                   // drift while it builds
      { t: T.s2 - 0.25, dur: 1.4, tx: fx, ty: fy, zoom: 1.85, pitch: 0.2 },               // Figure 1, right column
      { t: T.s2 + 1.2, dur: 2.8, zoom: 1.95 },
      { t: T.s4 - 0.35, dur: 1.2, tx: cx2, ty: cy2, zoom: 2.15 },                          // the chain, read
      { t: T.s4 + 1.0, dur: 6.5, tx: cx2 + 14 },
      { t: T.eleven - 0.1, dur: 1.9, tx: 930, ty: 1225, zoom: 1.22, pitch: PC },          // pull back, the build
      { t: T.s7 + 1.6, dur: 2.6, tx: 1005, zoom: 1.16 },
      { t: T.s8 - 0.4, dur: 1.3, tx: 1300, ty: 1230, zoom: 1.45 },                         // the new triple, the slot above it
      { t: T.s8 + 1.0, dur: 4.2, tx: 1315, zoom: 1.5 },
      { t: T.s10 - 0.35, dur: 0.9, tx: 1300, ty: 1430, zoom: 1.32 },                       // ✓ and the 27 ✗ below it
      { t: T.s11 - 0.05, dur: 1.4, tx: dx2, ty: dy2, zoom: 1.75, pitch: 0.18 },           // p. 2's definition
      { t: T.s11 + 1.2, dur: 6.5, tx: dx2 + 20, zoom: 1.8 },
      { t: T.s12 - 0.15, dur: 1.5, tx: 950, ty: 1560, zoom: 1.3, pitch: 0.6 },             // two prompts, one model
      { t: T.s12 + 1.4, dur: 3.5, zoom: 1.36, tx: 965 },
    ]);

    // ── pages ──
    // p. 2: in at the start, off when p. 1 arrives; back over p. 1 for the definition (s11), off again at s12
    const in2 = e(t, 0, 1.2, ease.linear);
    const off2 = e(t, T.s2 - 0.45, 1.0, ease.linear);
    const back2 = e(t, T.s11 - 0.1, 1.1, ease.linear);
    const off2b = e(t, T.s12 - 0.2, 1.1, ease.linear);
    let P2p = null;
    if (off2 < 1) P2p = off2 > 0 ? leave(PG, off2, { dx: -1700, dy: -300, rot: -0.12 }) : arrive(PG, in2, { dx: 300, dy: 900, rot: 0.08 });
    else if (back2 > 0 && off2b < 1) P2p = off2b > 0 ? leave(PG, off2b, { dx: 1700, dy: -250 }) : arrive(PG, back2, { dx: 1500, dy: -150, rot: 0.1, arc: 140 });
    // p. 1: arrives from the right at s2 and stays (the crops lift off it)
    const in1 = e(t, T.s2 - 0.35, 1.2, ease.linear);
    const P1p = in1 > 0 ? arrive(PG, in1, { dx: 1600, dy: 120, rot: 0.1 }) : null;
    if (P1p) {
      sheet(ctx, C, p1, P1p);
      // s2–s3: marks on the right column
      markBox(ctx, C, p1, P1p, FIG1.cot.head, e(t, T.right - 0.05, 0.55, ease.linear) * (1 - e(t, T.s4, 0.5)), { color: F.ink, width: 3, pad: 7 });
      markBox(ctx, C, p1, P1p, CR.q, e(t, T.same - 0.05, 0.6, ease.linear) * (1 - e(t, T.s4 + 0.2, 0.5)), { color: F.ink, width: 3, pad: 5 });
      for (const [i, r] of FIG1.cot.chainLines.entries()) markBox(ctx, C, p1, P1p, r, e(t, T.shows - 0.05 + i * 0.25, 0.5, ease.linear) * (1 - e(t, T.s4 + 0.2, 0.5)), { color: PAL.cotInk, width: 3, pad: 4 });
      // s4–s6: the voice reads the chain; the paper's blue stays blue, an ink underline follows
      const rp = (27 * sayP(env, 4, t) + 48 * sayP(env, 5, t) + 11 * sayP(env, 6, t)) / 86;
      underline(ctx, C, p1, P1p, L.ex, rp * (1 - e(t, T.e6 + 0.6, 0.6)));
    }
    if (P2p) {
      sheet(ctx, C, p2, P2p);
      highlight(ctx, C, p2, P2p, L.combine, sayP(env, 0, t), { color: F.hlMint });
      highlight(ctx, C, p2, P2p, L.defn, sayWords(env, 11, 5, 22, t), { color: F.hlYellow });
    }

    // ── s1: the coinage lifts off p. 2 and stands above the triple ──
    const STRIP_TO = { x: 470, y: 1265, z: 125, w: 540, tilt: 0.85, rot: 0, arc: 220 };
    const sl = e(t, T.s1 + 0.1, 1.3, ease.linear), slOut = e(t, T.s2 - 0.45, 0.95, ease.linear);
    if (sl > 0 && slOut < 1) {
      let SP = liftPose(p2, PG, CR.strip, STRIP_TO, sl);
      if (slOut > 0) SP = { ...SP, ...leave(SP, slOut, { dx: -1500, dy: -500, rot: -0.1, arc: 90 }), src: CR.strip };
      sheet(ctx, C, p2, SP, { grid: 6, shadow: 0.4 });
      highlight(ctx, C, p2, SP, L.triples, sayWords(env, 1, 6, 12, t), { color: F.hlBlue });
    }

    // ── the build ──
    const rise = (t0, d = 0.5) => e(t, t0 - 0.05, d, ease.outBack);
    const triRise = { input: rise(T.input), chain: rise(T.chain), output: rise(T.output) };
    const fadeLab = 1 - e(t, T.s2 - 0.3, 0.6);
    // exemplar crops: lift off p. 1 onto the triple (beat 5)
    const ex = {
      q: faceGroup([CR.q], TRI.x - (ww(CR.q) * SIG) / 2, 3.5)[0],
      chain: faceGroup([CR.c1, CR.c2], TRI.x - (ww(CR.c1) * SIG) / 2, HI.input + GAP + 7),
      a: faceCard(CR.a11, TRI.x, HI.input + GAP + HI.chain + GAP + 3.5, ww(CR.a11) * SIG),
    };
    const exT = { q: T.eleven - 0.05, c1: T.eleven + 0.25, c2: T.eleven + 0.42, a: T.s7 + 0.15 };
    const FLY = 1.15;
    // the cafeteria question: lifts onto a lone input slab, slides into the model, comes out on the new triple
    const cafeT = { lift: T.follows + 0.05, slab: T.follows - 0.15, into: T.writes + 0.1, out: T.own + 0.15 };
    const qsIn = e(t, cafeT.into, 0.9, ease.inOutCubic);     // into the model
    const ansOut = e(t, cafeT.out, 0.9, ease.inOutCubic);   // the new triple's input slab slides out to ANS
    const qsX = lerp(QS.x, (MODEL.x0 + MODEL.x1) / 2, qsIn), qsW = lerp(TW, 150, qsIn);
    const ansX = lerp((MODEL.x0 + MODEL.x1) / 2, ANS.x, ansOut), ansW = lerp(150, TW, ansOut);
    // generated chain: line i lifts (t0) → slot (t1) → hold → chain slab (t2 → t3)
    const gT = [
      { r: CR.g1, t0: T.s8 - 0.1, t1: T.s8 + 0.5, t2: T.twenty + 0.15 },
      { r: CR.g2, t0: T.twenty - 0.4, t1: T.twenty + 0.2, t2: T.e8 - 0.05 },
      { r: CR.g3, t0: T.s9 - 0.25, t1: T.s9 + 0.35, t2: T.e9 - 0.3 },
    ];
    const ansChainZ0 = HI.input + GAP;
    const gLand = faceGroup([CR.g1, CR.g2, CR.g3], ANS.x - (ww(CR.g1) * SIG) / 2, ansChainZ0 + 4);
    const a9T = T.e9 - 0.2;
    const a9w = [ww(CR.a9a) * SIG, ww(CR.a9b) * SIG], a9gap = 6;
    const a9x0 = ANS.x - (a9w[0] + a9gap + a9w[1]) / 2;
    const outZ0 = HI.input + GAP + HI.chain + GAP;
    const a9To = [faceCard(CR.a9a, a9x0 + a9w[0] / 2, outZ0 + 4.5, a9w[0]), faceCard(CR.a9b, a9x0 + a9w[0] + a9gap + a9w[1] / 2, outZ0 + 3.2, a9w[1])];
    // the slot where a generated line is read (standing, facing the camera, above the new triple)
    const SLOT = { x: ANS.x - 40, y: ROW - 40, z: 165, w: 470 * 0.92, tilt: PC };
    const slotPose = (r) => ({ src: r, x: SLOT.x - (SLOT.w - ww(r) * 0.92) / 2, y: SLOT.y - (hh(r) * 0.92) / 2, z: SLOT.z, w: ww(r) * 0.92, tilt: SLOT.tilt, rot: 0 });

    const flying = [];   // drawn after the build, in this order
    const fly = (page, from, rect, to, t0, dur = FLY, arc = 220) => {
      const p = e(t, t0, dur, ease.linear);
      if (p <= 0) return 'wait';
      if (p >= 1) return 'landed';
      flying.push(() => sheet(ctx, C, page, liftPose(page, from, rect, { ...to, arc }, p), { grid: 4, shadow: 0.5 }));
      return 'air';
    };

    // ── draw the row back to front (y), left to right ──
    const P1rest = P1p || PG;
    // arrows (ours): exemplar → model, question → model, model → new triple
    const arrowZ = 40;
    const arw = (pts, p, color = F.ink2) => arrow3(ctx, C, pts, p, { color, width: 3.2, headLen: 18 });

    // the model block (stands up on "model", pulses on "stays the same")
    const mRise = rise(T.model7, 0.6);
    const mPulse = Math.sin(Math.PI * e(t, T.stays - 0.05, 0.9, ease.linear));
    const drawModel = () => {
      if (mRise <= 0) return;
      slab(ctx, C, { x0: MODEL.x0, x1: MODEL.x1, y0: MODEL.y0, y1: MODEL.y1, z0: 0, z1: MODEL.h * mRise }, {
        fill: PAL.model, stroke: F.ink, width: 2.4 + 4 * mPulse, alpha: clamp(mRise * 3), label: mRise > 0.8 ? S.model : undefined, labelSize: 30,
      });
    };

    // exemplar triple at TRI
    const exFaces = {
      input: () => { if (fly(p1, P1rest, CR.q, ex.q, exT.q) === 'landed') sheet(ctx, C, p1, ex.q, { shadow: 0, grid: 3 }); },
      chain: () => {
        if (fly(p1, P1rest, CR.c1, ex.chain[0], exT.c1) === 'landed') sheet(ctx, C, p1, ex.chain[0], { shadow: 0, grid: 3 });
        if (fly(p1, P1rest, CR.c2, ex.chain[1], exT.c2) === 'landed') sheet(ctx, C, p1, ex.chain[1], { shadow: 0, grid: 3 });
      },
      output: () => { if (fly(p1, P1rest, CR.a11, ex.a, exT.a) === 'landed') sheet(ctx, C, p1, ex.a, { shadow: 0, grid: 2 }); },
    };
    // s13: the right prompt's chain slab glows
    const glowCh = e(t, T.examples - 0.05, 0.6) * (1 - 0.35 * e(t, T.end - 0.6, 0.6));

    // the standard prompt (s12): input + output, the chain only as a dashed outline
    const stdIn = e(t, T.s12 + 0.1, 0.8, ease.outCubic);
    const stdFaces = {
      input: () => { const to = faceCard(CR.stdQ, STD.x, 3.5, ww(CR.stdQ) * SIG, STD.y + TD / 2); if (fly(p1, P1rest, CR.stdQ, to, T.s12 + 0.35, 1.0) === 'landed') sheet(ctx, C, p1, to, { shadow: 0, grid: 3 }); },
      output: () => { const to = faceCard(CR.stdA, STD.x, HI.input + GAP + HI.chain + GAP + 3.5, ww(CR.stdA) * SIG, STD.y + TD / 2); if (fly(p1, P1rest, CR.stdA, to, T.s12 + 0.6, 1.0) === 'landed') sheet(ctx, C, p1, to, { shadow: 0, grid: 2 }); },
    };

    // back lane (y = ROW): exemplar triple, lone question slab, model, new triple
    if (triRise.input > 0) {
      triple(ctx, C, { x: TRI.x, y: TRI.y, h: HI, rise: triRise, face: exFaces, glow: { chain: glowCh } });
    }
    // labels for the first triple (s1), to its left
    if (fadeLab > 0) {
      const lab = (k, src, w0, color) => {
        const r = triRise[k];
        if (r <= 0) return;
        const zc = k === 'input' ? HI.input / 2 : k === 'chain' ? HI.input + GAP + HI.chain / 2 : HI.input + HI.chain + 2 * GAP + HI.output / 2;
        const a = C.p(TRI.x - TW / 2 - 22, FRONT, zc);
        drawTex(ctx, src, a.x, a.y, { size: 46, color, align: 'right', valign: 'middle', write: e(t, w0, 0.55, ease.linear), alpha: fadeLab });
      };
      lab('input', S.input, T.input, mix(PAL.inputInk, F.ink, 0.45));
      lab('chain', S.chain, T.chain, PAL.cotInk);
      lab('output', S.output, T.output, PAL.outInk);
    }
    // lone input slab with the new question, sliding into the model
    const qsRise = e(t, cafeT.slab, 0.45, ease.outBack);
    const cafeLand = faceCard(CR.cafe, QS.x, 4, ww(CR.cafe) * SIG);
    const cafeState = fly(p1, P1rest, CR.cafe, cafeLand, cafeT.lift, 0.95);
    if (qsRise > 0 && qsIn < 1) {
      slab(ctx, C, { x0: qsX - qsW / 2, x1: qsX + qsW / 2, y0: ROW - TD / 2, y1: ROW + TD / 2, z0: 0, z1: Math.max(0.5, HI.input * qsRise) }, { fill: PAL.input, stroke: PAL.inputInk, width: 2.2, alpha: clamp(qsRise * 3) });
      if (cafeState === 'landed') sheet(ctx, C, p1, { ...cafeLand, x: qsX, w: cafeLand.w * (qsW / TW), y: FRONT + 0.8 - (cafeLand.w * (qsW / TW) * hh(CR.cafe)) / ww(CR.cafe) / 2 }, { shadow: 0, grid: 3 });
    }
    // the new triple: input slides out of the model, chain and output grow on it
    const ansChainRise = e(t, cafeT.out + 0.55, 0.5, ease.outBack);
    const ansOutRise = e(t, a9T - 0.35, 0.45, ease.outBack);
    const tickP = e(t, T.s10 - 0.05, 0.75, ease.linear);
    const outPulse = Math.sin(Math.PI * e(t, T.s10 + 0.45, 0.8, ease.linear));
    if (ansOut > 0) {
      arw([[MODEL.x1 + 10, ROW, arrowZ], [ANS.x - TW / 2 - 12, ROW, arrowZ]], e(t, cafeT.out + 0.5, 0.45, ease.inOutQuad) * (1 - e(t, T.s11 - 0.4, 0.4)) + e(t, T.s12 + 0.5, 0.5));
      const gFaces = {
        input: () => {
          const cp = { ...cafeLand, x: ansX, w: cafeLand.w * (ansW / TW), y: FRONT + 0.8 - (cafeLand.w * (ansW / TW) * hh(CR.cafe)) / ww(CR.cafe) / 2 };
          sheet(ctx, C, p1, cp, { shadow: 0, grid: 3 });
          // "for the new question": the question it is answering, boxed in ink
          const nq = e(t, T.newq - 0.05, 0.5, ease.linear) * (1 - e(t, T.s8 + 0.4, 0.5));
          if (nq > 0) markBox(ctx, C, p1, cp, CR.cafe, nq, { color: F.ink, width: 2.4, pad: 3 });
        },
        chain: () => {
          gT.forEach((g, i) => { if (t >= g.t2 + 0.6) sheet(ctx, C, p1, gLand[i], { shadow: 0, grid: 3 }); });
        },
        output: () => {
          [CR.a9a, CR.a9b].forEach((r, i) => { if (fly(p1, P1rest, r, a9To[i], a9T + i * 0.12, 0.8, 160) === 'landed') sheet(ctx, C, p1, a9To[i], { shadow: 0, grid: 2 }); });
        },
      };
      triple(ctx, C, {
        x: ansX, y: ANS.y, w: ansW, h: HI, rise: { input: 1, chain: ansChainRise, output: ansOutRise }, face: gFaces,
        glow: { output: outPulse },
      });
      // ✓ lands on top of the output slab, standing
      if (tickP > 0) {
        const topZ = outZ0 + HI.output;
        const to = { src: CR.tick, x: ANS.x + 60, y: ROW + 8 - (34 * hh(CR.tick)) / ww(CR.tick) / 2, z: topZ, w: 34, tilt: Math.PI / 2 - 0.2, rot: 0, arc: 160 };
        const pose = tickP >= 1 ? to : liftPose(p1, P1rest, CR.tick, to, tickP);
        flying.push(() => sheet(ctx, C, p1, pose, { shadow: tickP >= 1 ? 0 : 0.4, grid: 2, edge: false }));
      }
    }
    drawModel();
    // arrows
    arw(bez3([TRI.x + TW / 2 - 30, ROW, HI.input + HI.chain + HI.output + 16], [QS.x, ROW - 10, 230], [MODEL.x0 + 30, ROW - 10, MODEL.h + 8]), e(t, T.follows + 0.1, 0.7, ease.inOutQuad) * (1 - e(t, T.s11 - 0.4, 0.4)) + e(t, T.s12 + 0.5, 0.5));
    arw([[QS.x + TW / 2 + 8, ROW, arrowZ], [MODEL.x0 - 10, ROW, arrowZ]], e(t, cafeT.slab + 0.4, 0.4, ease.inOutQuad) * (1 - e(t, cafeT.into + 0.2, 0.3)));
    // generated lines: page → slot → chain slab
    for (const g of gT) {
      if (t < g.t0 || t >= g.t2 + 0.6) continue;
      const sp = slotPose(g.r);
      let pose;
      if (t < g.t1) pose = liftPose(p1, P1rest, g.r, { ...sp, arc: 140 }, e(t, g.t0, g.t1 - g.t0, ease.linear));
      else if (t < g.t2) pose = { ...sp, z: sp.z + Math.sin((t - g.t1) * 2.4) * 3 };
      else {
        const i = gT.indexOf(g);
        const p = e(t, g.t2, 0.6, ease.inOutCubic);
        pose = { ...arcPose(sp, gLand[i], p, 60), src: g.r };
      }
      flying.push(() => sheet(ctx, C, p1, pose, { grid: 4, shadow: 0.35 }));
    }

    // front lane: the 27 ✗ card (s10) and the standard prompt (s12)
    const badP = e(t, T.s10 - 0.3, 1.0, ease.linear);
    const BAD_W = ww(CR.bad) * 0.5;
    const badTo = { src: CR.bad, x: BAD.x, y: BAD.y - (BAD_W * hh(CR.bad)) / ww(CR.bad) / 2, z: 0, w: BAD_W, tilt: Math.PI / 2 - 0.25, rot: 0 };
    if (stdIn > 0) {
      triple(ctx, C, {
        x: STD.x, y: STD.y, h: HI, rise: { input: stdIn, output: e(t, T.s12 + 0.3, 0.6, ease.outBack) }, missing: { chain: e(t, T.examples + 0.1, 0.6) },
        face: stdFaces,
      });
      arw([[STD.x + TW / 2 + 10, STD.y, arrowZ], [MODEL.x0 - 12, MODEL.y1 - 10, arrowZ]], e(t, T.s12 + 0.9, 0.6, ease.inOutQuad));
      arw([[MODEL.x1 + 10, MODEL.y1 - 10, arrowZ], [BAD.x - BAD_W / 2 - 14, BAD.y, 22]], e(t, T.s12 + 1.2, 0.6, ease.inOutQuad));
    }
    if (badP > 0) {
      const pose = badP >= 1 ? badTo : liftPose(p1, P1rest, CR.bad, { ...badTo, arc: 200 }, badP);
      const draw = () => { sheet(ctx, C, p1, pose, { grid: 3, shadow: 0.4 }); outline(ctx, C, p1, pose, PAL.bad, 2.6, e(t, T.s10 + 0.45, 0.5, ease.linear)); };
      if (badP >= 1) draw(); else flying.push(draw);
    }

    flying.forEach((f) => f());

    // ── tags ──
    const illus = win(t, T.triple, T.s2 - 0.2, 0.4, 0.4) + win(t, T.s7 + 0.6, T.s11 - 0.2, 0.4, 0.4) + win(t, T.s12 + 0.3, env.dur + 1, 0.4, 0.4);
    if (illus > 0) tag(ctx, S.illus, 60, 1024, { size: 30, color: F.ink2, align: 'left', valign: 'bottom', alpha: clamp(illus) });

    // ── source stamp ──
    const onP2 = t < T.s2 + 0.2 || (t > T.s11 + 0.3 && t < T.s12 + 0.2);
    let rect;
    if (t < T.s1) rect = L.para;
    else if (t < T.s2 + 0.2) rect = union(L.triples);
    else if (onP2) rect = union(L.defn);
    else if (t < T.s12) rect = union([FIG1.cot.input, FIG1.cot.output]);
    else rect = FIG1.all;
    if (!PAGES) tag(ctx, S.redrawn, 60, 56, { size: 30, color: F.ink2, valign: 'top' });
    cite(ctx, onP2 ? p2 : p1, { label: onP2 ? S.c2 : S.c1, rect, alpha: e(t, 0.6, 0.6), side: 'right' });
  },
};
