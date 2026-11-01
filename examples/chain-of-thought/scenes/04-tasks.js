// tasks — Table 20 (p. 35): the eight exemplars the authors wrote, standing as a row of triples that carry the
// table's real Q and A blocks; the caption lifted to say they served every math benchmark except AQuA. Figure 3
// (p. 4): nine panels lift into a standing wall; the pear (StrategyQA) and the coin (Coin Flip) come forward and
// are read with the voice (the paper's own highlights stay; we box them in ink); the wall regroups by task family.
// Section 3.1's "Language models." paragraph stands up behind five neutral model slabs with their printed sizes;
// greedy decoding: one answer card each.
import { clamp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, win, desk, edgeIn, loadPaper, findPhrase, cameraAt, sheet, onSheet,
  highlight, markBox, liftPose, arcPose, slab, tag, cite, sayP, sayWords, standIn, contactShadow,
} from '/engine/folio.js';
import { PAL, PH, FIG3, FAM, T20, STACK } from './_data.js';
import { triple, faceCard, arrive, leave, underline } from './03-idea.js';

// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars, same geometry) and redrawn figures.
const PAGES = true;

const MODELS = [   // p. 4, Section 3.1, as printed (GPT-3 sizes "presumably correspond"; Codex: no size printed)
  { key: 'gpt', name: '\\text{GPT-3}', sizes: ['350M', '1.3B', '6.7B', '175B'] },
  { key: 'lamda', name: '\\text{LaMDA}', sizes: ['422M', '2B', '8B', '68B', '137B'] },
  { key: 'palm', name: '\\text{PaLM}', sizes: ['8B', '62B', '540B'] },
  { key: 'ul2', name: '\\text{UL2}', sizes: ['20B'] },
  { key: 'codex', name: '\\text{Codex}', sizes: [null] },
];
const S = {
  c35: '\\text{p.~35}\\;\\cdot\\;\\text{Table 20}',
  c4f: '\\text{p.~4}\\;\\cdot\\;\\text{Figure 3}',
  c4s: '\\text{p.~4}\\;\\cdot\\;\\text{Section 3.1}',
  aqua: '\\text{AQuA: multiple choice, 4 other exemplars}',
  p4: '\\text{p.~4}',
  arith: '\\text{arithmetic: 5 benchmarks}',
  common: '\\text{commonsense: 5}',
  symb: '\\text{symbolic: 2}',
  illus: '\\text{illustrative}',
  layout: '\\text{layout illustrative}',
  redrawn: '\\text{stand-in pages, figures redrawn}',
  heads: '\\text{H}',
  tails: '\\text{T}',
  asGiven: '\\text{as given on p.~4}',
  oneSample: '\\text{one sample per question}',
  ...Object.fromEntries(MODELS.map((m) => [m.key, m.name])),
  ...Object.fromEntries(MODELS.flatMap((m) => m.sizes.filter(Boolean)).map((s) => [`sz${s}`, `\\text{${s}}`])),
};

const ww = (r) => r.x1 - r.x0, hh = (r) => r.y1 - r.y0;
const union = (rs) => ({ x0: Math.min(...rs.map((r) => r.x0)), y0: Math.min(...rs.map((r) => r.y0)), x1: Math.max(...rs.map((r) => r.x1)), y1: Math.max(...rs.map((r) => r.y1)) });
/** pose of a crop whose bottom edge sits on the line (yb, zb), leaning back by tilt, s further up its own plane */
const onPlane = (rect, x, yb, zb, w, tilt, s = 0) => {
  const hb = (w * hh(rect)) / ww(rect) / 2;
  return { src: rect, x, y: yb - s * Math.cos(tilt) - hb, z: zb + s * Math.sin(tilt), w, tilt, rot: 0 };
};
const lerpPose = (a, b, p, arc = 0) => ({ ...arcPose(a, b, ease.inOutCubic(clamp(p)), arc), src: b.src || a.src });

// ── p. 35 · Table 20 and the row of eight triples ───────────────────────────
const P35 = { x: 700, y: 1100, w: 1000, rot: 0 };       // lies at the front-left; the row stands to its right
const TT = STACK.triple;
// eight triples in reading order: two across, four rows going back (deep enough that every front face shows)
const GX = [1395, 1730], GY0 = 1060, GDY = 160;
const rowX = (i) => GX[i % 2], rowY = (i) => GY0 - Math.floor(i / 2) * GDY;
const QR = T20.ex.map((x) => ({ x0: T20.x0 - 2, y0: x.q.y0 - 2, x1: T20.x1 + 2, y1: x.q.y1 + 2 }));
const AR = T20.ex.map((x) => ({ x0: T20.x0 - 2, y0: x.a.y0 - 2, x1: T20.x1 + 2, y1: x.a.y1 + 2 }));
const CAP = { x0: 296, y0: 847, x1: 1404, y1: 910 };          // Table 20's caption, two lines
const CW = TT.w - 6;                                          // crop width on a slab face
const faceQ = (i) => faceCard(QR[i], rowX(i), 1.2, CW, rowY(i) + TT.d / 2);
const faceA = (i) => faceCard(AR[i], rowX(i), TT.h.input + TT.gap + (TT.h.chain - (CW * hh(AR[i])) / ww(AR[i])) / 2, CW, rowY(i) + TT.d / 2);
// reading slot for the first exemplar (standing, facing the camera, line height ≥ 30 px)
const SLOT = { x: 960, yb: 640, zb: 105, w: 1240, tilt: 0.85 };
const slotA = onPlane(AR[0], SLOT.x, SLOT.yb, SLOT.zb, SLOT.w, SLOT.tilt);
const slotQ = onPlane(QR[0], SLOT.x, SLOT.yb, SLOT.zb, SLOT.w, SLOT.tilt, (SLOT.w * hh(AR[0])) / ww(AR[0]) + 8);
const CAP_TO = { ...onPlane(CAP, 960, 560, 125, 1150, 0.85), arc: 200 };

// ── p. 4 · Figure 3, the wall, Section 3.1 ──────────────────────────────────
const P4 = { x: 960, y: 1300, w: 1000, rot: 0 };       // in front of the wall, out of frame while panels are read
const WB = 200, WT = 0.5, PW = 210;                           // wall: base line y, lean, panel width (small: names stay unreadable)
const PNH = (PW * 279) / 361, RG = 12;                        // panel height along the plane, row gap
const PANEL = FIG3.panels.map((p) => ({ x0: p.x0 - 1, y0: p.y0 - 1, x1: p.x1 + 1, y1: p.y1 + 1 }));
const wallPose = (k) => onPlane(PANEL[k], 960 + ((k % 3) - 1) * (PW + 12), WB, 0, PW, WT, (2 - Math.floor(k / 3)) * (PNH + RG));
const CL = {                                                  // clusters by the panels' own tabs (s8)
  0: [455, 1], 1: [455, 0],
  2: [738, 1], 3: [960, 1], 4: [1182, 1], 5: [849, 0], 6: [1071, 0],
  7: [1465, 1], 8: [1465, 0],
};
const clusterPose = (k) => onPlane(PANEL[k], CL[k][0], WB, 0, PW, WT, CL[k][1] * (PNH + RG));
const READ = { x: 960, yb: 440, zb: 30, w: 470 };             // a panel brought forward to read
const readPose = (k) => onPlane(PANEL[k], READ.x, READ.yb, READ.zb, READ.w, WT);
const COIN = { x: 1310, y: 470, r: 46 };
const PARA = { x0: 294, y0: 1318, x1: 1410, y1: 1533 };      // "Language models." … greedy decoding
const PARA_TO = { ...onPlane(PARA, 960, 150, 40, 1060, 0.75), arc: 240 };   // where the wall stood
const MROW = { y: 540, dx: 292, w: 176, d: 104, h: 46 };      // five model slabs
const PLATE = { w: 136, d: 80, h: 6, z0: 72, dz: 62 };        // size plates above each slab (geometry illustrative)

let p35, p4, L;

/** stand-in redraws (PAGES = false): Figure 3's frames and coloured tabs, Table 20's lavender chains */
function fig3Redraw(g) {
  FIG3.panels.forEach((p) => {
    g.strokeStyle = '#929292'; g.lineWidth = 3;
    g.beginPath(); g.roundRect(p.x0 + 4, p.y0 + 14, ww(p) - 8, hh(p) - 16, 26); g.stroke();
    g.fillStyle = FAM[p.fam]; g.beginPath(); g.roundRect(p.x0 + 24, p.y0, ww(p) - 48, 28, 14); g.fill();
  });
}
function t20Redraw(g) {
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = '#E5E5FF';
  T20.ex.forEach((x) => g.fillRect(T20.x0 + 30, x.a.y0, T20.x1 - T20.x0 - 30, x.a.y1 - x.a.y0));
}

/** a coin token (ILLUSTRATIVE): a disc flipping about the x axis; θ = 0 heads up, π tails up */
function coin(ctx, C, x, y, z, r, th, alpha) {
  if (alpha <= 0) return;
  const N = 40, pts = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    pts.push(C.p(x + r * Math.cos(a), y + r * Math.sin(a) * Math.cos(th), z + r * Math.sin(a) * Math.sin(th)));
  }
  const c = C.p(x, y, z);
  const n = [0, -Math.sin(th), Math.cos(th)];
  const E = C.eye, headsUp = n[0] * (E[0] - x) + n[1] * (E[1] - y) + n[2] * (E[2] - z) > 0;   // heads' normal faces the eye
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = '#ECEAE4'; ctx.strokeStyle = F.ink; ctx.lineWidth = 2.4 * c.k;
  ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.fill(); ctx.stroke();
  // the face the camera sees, squashed with the disc
  const top = C.p(x, y - r * Math.cos(th), z - r * Math.sin(th)), bot = C.p(x, y + r * Math.cos(th), z + r * Math.sin(th));
  const sq = clamp(Math.abs(top.y - bot.y) / (2 * r * c.k), 0.02, 1);
  ctx.translate(c.x, c.y); ctx.scale(1, sq);
  drawTex(ctx, headsUp ? S.heads : S.tails, 0, 0, { size: 50 * c.k, color: F.ink, align: 'center', valign: 'middle' });
  ctx.restore();
}

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [4, 35]);
    p35 = PAGES ? P.page(35) : standIn(P.page(35), { draw: t20Redraw });
    p4 = PAGES ? P.page(4) : standIn(P.page(4), { draw: fig3Redraw });
    L = {
      cap: findPhrase(p35, PH.t20Caption),
      used: findPhrase(p35, PH.t20Used),
      pearQ: findPhrase(p4, 'Would a pear sink in water?'),   // PH.pearQ minus "Q: Yes or no:", which the voice skips
      pearA: findPhrase(p4, PH.pearA),
      pearNo: findPhrase(p4, PH.pearNo),
      coinQ1: findPhrase(p4, 'A coin is heads up.'),
      coinQ2: findPhrase(p4, 'Maybelle flips the coin. Shalonda does not flip the coin. Is the coin still heads up?'),
      coinA: findPhrase(p4, PH.coinA),
      five: findPhrase(p4, PH.fiveModels),
      gptSizes: findPhrase(p4, PH.sizesGPT),
      lamda: findPhrase(p4, PH.sizesLaMDA),
      palm: findPhrase(p4, PH.sizesPaLM),
      greedy: findPhrase(p4, PH.greedy),
    };
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      eight: q.w(0, 'eight'), examples: q.we(0, 'examples'), hand: q.w(0, 'hand'), used: q.w(0, 'used'), multiple: q.w(0, 'multiple'),
      s1: q.s(1), format: q.w(1, 'format'),
      s2: q.s(2), s3: q.s(3), density: q.w(3, 'density'), floatE: q.we(3, 'float'), s4: q.s(4), e4: q.e(4),
      s5: q.s(5), s6: q.s(6), s7: q.s(7), flip: q.w(7, 'one'), odd: q.w(7, 'odd'), tails: q.w(7, 'tails'), e7: q.e(7),
      s8: q.s(8), math: q.w(8, 'five'), common: q.w(8, 'five', 2), symb: q.w(8, 'two'), e8: q.e(8),
      s9: q.s(9), under: q.w(9, 'under'), billionE: q.we(9, 'billion'), five2: q.w(9, 'five', 2), e9: q.e(9),
      s10: q.s(10), decoded: q.w(10, 'decoded'), greedyE: q.we(10, 'greedily'), one: q.w(10, 'one'),
    };

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    // ── camera ──
    const C = cameraAt(t, [
      { t: 0, tx: 700, ty: 960, zoom: 1.5, pitch: 0.2 },
      { t: 0.2, dur: 1.6, ty: 1000, zoom: 1.6 },                                         // Table 20's caption
      { t: T.eight + 0.55, dur: 1.4, tx: 1110, ty: 820, zoom: 1.0, pitch: 0.85 },        // the row stands up
      { t: T.eight + 2.4, dur: 5.0, tx: 1130, zoom: 1.04 },
      { t: T.s1 - 0.3, dur: 1.3, tx: 960, ty: 1030, zoom: 1.25, pitch: 0.3 },            // Figure 3
      { t: T.format, dur: 1.5, tx: 960, ty: 20, zoom: 1.1, pitch: WT },                  // the wall
      { t: T.s2 - 0.3, dur: 1.0, ty: 70, zoom: 1.04 },                                   // the pear, forward
      { t: T.s2 + 1.0, dur: 5.5, tx: 975, zoom: 1.05 },
      { t: T.s5 - 0.2, dur: 1.2, tx: 1060, zoom: 1.02 },                                 // the coin and its token
      { t: T.s5 + 1.2, dur: 6.0, tx: 1075 },
      { t: T.s8 - 0.3, dur: 1.2, tx: 960, ty: 60, zoom: 1.12 },                          // three families
      { t: T.s9 - 0.3, dur: 1.6, ty: 255, zoom: 1.04, pitch: 0.75 },                     // the paragraph stands up, five models
      { t: T.s9 + 1.6, dur: 9.0, tx: 972, zoom: 1.08 },
    ]);

    // ── s0: p. 35, the row of eight ──
    const in35 = e(t, 0, 1.2, ease.linear), out0 = e(t, T.s1 - 0.4, 1.1, ease.linear);
    const P35p = out0 > 0 ? leave(P35, out0, { dx: -1700, dy: -200, rot: -0.12 }) : arrive(P35, in35, { dx: -200, dy: 900, rot: -0.08 });
    const drawP35 = out0 < 1;
    const rowOff = ease.inCubic(out0);                       // the row and strips slide off to the right
    if (drawP35) {
      sheet(ctx, C, p35, P35p);
      highlight(ctx, C, p35, P35p, L.cap, sayWords(env, 0, 3, 6, t), { color: F.hlMint });
    }
    const flying = [];
    // card flights first (independent of the slabs): exemplar 0 goes through the reading slot, the others
    // fly straight onto their faces; landed cards are drawn by the triple's face callbacks
    const exT = (i) => (i === 0 ? T.eight + 0.75 : T.used + 0.3 + (i - 1) * 0.3);
    const SLOT_OUT = T.used + 0.2;
    const cardState = (i, part, t0) => {
      const rect = part === 'q' ? QR[i] : AR[i], to = part === 'q' ? faceQ(i) : faceA(i);
      const ox = 1800 * rowOff;
      if (t < t0) return 'wait';
      if (i === 0) {
        const slot = part === 'q' ? slotQ : slotA;
        const t1 = t0 + 0.75, t2 = SLOT_OUT + (part === 'q' ? 0 : 0.08), t3 = t2 + 0.6;
        if (t >= t3) return 'land';
        let pose;
        if (t < t1) pose = liftPose(p35, P35p, rect, { ...slot, arc: 160 }, e(t, t0, t1 - t0, ease.linear));
        else if (t < t2) pose = { ...slot, z: slot.z + Math.sin((t - t1) * 2.2) * 2 };
        else pose = lerpPose(slot, { ...to, x: to.x + ox }, e(t, t2, t3 - t2, ease.linear), 40);
        flying.push(() => sheet(ctx, C, p35, pose, { grid: 6, shadow: 0.4 }));
        return 'air';
      }
      const p = e(t, t0, 0.9, ease.linear);
      if (p >= 1) return 'land';
      flying.push(() => sheet(ctx, C, p35, liftPose(p35, P35p, rect, { ...to, x: to.x + ox, arc: 180 }, p), { grid: 4, shadow: 0.4 }));
      return 'air';
    };
    const cards = drawP35 ? Array.from({ length: 8 }, (_, i) => ({ q: cardState(i, 'q', exT(i)), a: cardState(i, 'a', exT(i) + 0.08) })) : [];
    if (drawP35) {
      // eight triples rising one after another (back to front so the near ones cover)
      for (let i = 7; i >= 0; i--) {
        const t0 = T.eight + 0.95 + i * 0.13;
        const rise = { input: e(t, t0, 0.4, ease.outBack), chain: e(t, t0 + 0.12, 0.4, ease.outBack), output: e(t, t0 + 0.24, 0.4, ease.outBack) };
        if (rise.input <= 0) continue;
        const ox = 1800 * rowOff;
        const face = {
          input: () => { if (cards[i].q === 'land') { const to = faceQ(i); sheet(ctx, C, p35, { ...to, x: to.x + ox }, { shadow: 0, grid: 2 }); } },
          chain: () => { if (cards[i].a === 'land') { const to = faceA(i); sheet(ctx, C, p35, { ...to, x: to.x + ox }, { shadow: 0, grid: 2 }); } },
        };
        triple(ctx, C, { x: rowX(i) + ox, y: rowY(i), rise, face });
      }
    }
    flying.forEach((f) => f());
    // the caption stands up behind the row: "used for all math word problem datasets except AQuA"
    const capP = e(t, SLOT_OUT - 0.05, 0.85, ease.linear);
    if (capP > 0 && drawP35) {
      let CP = liftPose(p35, P35, CAP, CAP_TO, capP);
      CP = { ...CP, x: CP.x + 1800 * rowOff, z: CP.z + 300 * rowOff };
      sheet(ctx, C, p35, CP, { grid: 8, shadow: 0.35 });
      highlight(ctx, C, p35, CP, L.cap, 1, { color: F.hlMint });
      highlight(ctx, C, p35, CP, L.used, sayWords(env, 0, 12, 19, t), { color: F.hlMint });
      // on "multiple choice": AQuA had its own four exemplars (p. 4)
      const aq = e(t, T.multiple - 0.1, 0.8, ease.linear);
      if (aq > 0) {
        const a = onSheet(C, p35, CP, 1060, 920);
        const box = tag(ctx, S.aqua, a.x, a.y + 34, { size: 34, align: 'right', valign: 'top', write: aq, color: F.ink });
        tag(ctx, S.p4, box.x + box.w + 10, box.y + box.h / 2, { size: 30, color: F.ink2, valign: 'middle', write: aq });
      }
    }

    // ── s1: p. 4 arrives; Figure 3's nine panels lift into a standing wall ──
    const in4 = e(t, T.s1 - 0.25, 1.2, ease.linear);
    const off4 = e(t, T.s9 + 0.6, 1.1, ease.linear);
    let P4p = null;
    if (in4 > 0 && off4 < 1) {
      P4p = off4 > 0 ? leave(P4, off4, { dx: 0, dy: 1500, rot: 0.08, arc: 80 }) : arrive(P4, in4, { dx: 1700, dy: 200, rot: 0.1 });
      sheet(ctx, C, p4, P4p);
    }
    const P4rest = P4;
    // panel states: lift to the wall (format), pear/coin forward and back, clusters (s8), off (s9)
    const pLift = (k) => e(t, T.format + k * 0.07, 0.9, ease.linear);
    const fwd = (k, a, b) => ({ go: e(t, a, 0.75, ease.linear), back: e(t, b, 0.75, ease.linear) });
    const PEAR = 3, COINP = 8;
    const fwdT = { [PEAR]: fwd(PEAR, T.s2 - 0.35, T.s5 - 0.35), [COINP]: fwd(COINP, T.s5 - 0.25, T.s8 - 0.45) };
    const clT = (k) => (k <= 1 ? T.math : k <= 6 ? T.common : T.symb) - 0.1;
    const wallOff = e(t, T.s9 - 0.35, 1.0, ease.linear);
    const panels = [];
    for (let k = 0; k < 9; k++) {
      const lp = pLift(k);
      if (lp <= 0 || wallOff >= 1) continue;
      let pose;
      if (lp < 1) pose = liftPose(p4, P4rest, PANEL[k], { ...wallPose(k), arc: 200 }, lp);
      else {
        const cp = e(t, clT(k), 0.8, ease.linear);
        pose = cp > 0 ? lerpPose(wallPose(k), clusterPose(k), cp, 60) : wallPose(k);
        const f = fwdT[k];
        if (f && f.go > 0) {
          if (f.back <= 0) pose = lerpPose(wallPose(k), readPose(k), f.go, 80);
          else if (f.back < 1) pose = lerpPose(readPose(k), wallPose(k), f.back, 60);
        }
      }
      if (wallOff > 0) pose = { ...leave(pose, wallOff, { dx: -1800, dy: -400, rot: -0.1, arc: 100 }), src: PANEL[k], tilt: pose.tilt };
      const front = fwdT[k] && fwdT[k].go > 0 && fwdT[k].back < 1;
      panels.push({ k, pose, front, air: lp < 1 });
    }
    // wall panels first (top rows, which lean back, before the bottom ones), then the one brought forward
    panels.sort((a, b) => (a.front - b.front) || (a.pose.z - b.pose.z));
    for (const { k, pose, front, air } of panels) {
      sheet(ctx, C, p4, pose, { grid: front ? 8 : 4, shadow: air || front ? 0.45 : 0.25 });
      if (k === PEAR && front) {
        highlight(ctx, C, p4, pose, L.pearQ, sayP(env, 2, t), { color: F.hlMint });
        markBox(ctx, C, p4, pose, union(L.pearA), e(t, T.density, T.floatE - T.density, ease.linear), { color: PAL.cotInk, width: 2.6, pad: 4 });
        underline(ctx, C, p4, pose, L.pearNo, e(t, T.s4, T.e4 - T.s4 - 0.1, ease.linear), F.ink);
      }
      if (k === COINP && front) {
        highlight(ctx, C, p4, pose, L.coinQ1, sayP(env, 5, t), { color: F.hlMint });
        highlight(ctx, C, p4, pose, L.coinQ2, sayP(env, 6, t), { color: F.hlMint });
        markBox(ctx, C, p4, pose, union(L.coinA), e(t, T.s7, T.e7 - T.s7, ease.linear), { color: PAL.cotInk, width: 2.6, pad: 4 });
      }
    }
    // the coin token (illustrative): heads up from s5, one flip on "One flip", lands tails up on "tails up"
    const coinA = win(t, T.s5 + 0.1, T.s8 - 0.1, 0.4, 0.5);
    if (coinA > 0) {
      const rise = e(t, T.flip, 0.5, ease.outCubic), fall = e(t, T.tails - 0.55, 0.55, ease.inQuad);
      const z = 4 + 120 * rise * (1 - fall) + Math.abs(Math.sin(Math.PI * e(t, T.tails, 0.35, ease.linear))) * 10;
      const th = Math.PI * e(t, T.flip + 0.1, T.odd + 0.7 - T.flip, ease.inOutCubic);
      contactShadow(ctx, C, { x: COIN.x, y: COIN.y, r: COIN.r }, { z, alpha: coinA });
      coin(ctx, C, COIN.x, COIN.y, z + 3, COIN.r, th, coinA);
      const a = C.p(COIN.x, COIN.y + COIN.r + 26, 0);
      tag(ctx, S.illus, a.x, a.y, { size: 30, color: F.ink2, align: 'center', valign: 'top', alpha: coinA });
    }
    // s8: family labels under each cluster, on their words
    const labA = 1 - e(t, T.s9 - 0.35, 0.5);
    if (labA > 0) {
      const lab = (src, x, t0) => {
        const w = e(t, t0, 0.7, ease.linear);
        if (w <= 0) return;
        const a = C.p(x, WB + 34, 0);
        drawTex(ctx, src, a.x, a.y, { size: 40, color: F.ink, align: 'center', valign: 'top', write: w, alpha: labA });
      };
      lab(S.arith, CL[0][0], T.math);
      lab(S.common, 960, T.common);
      lab(S.symb, CL[7][0], T.symb);
    }

    // ── s9–s10: the "Language models." paragraph stands up; five model slabs and their printed sizes ──
    const paraP = e(t, T.s9 - 0.3, 1.2, ease.linear);
    if (paraP > 0) {
      const PP = liftPose(p4, P4, PARA, PARA_TO, paraP);
      sheet(ctx, C, p4, PP, { grid: 8, shadow: 0.3 });
      highlight(ctx, C, p4, PP, L.five, sayWords(env, 9, 0, 3, t), { color: F.hlMint });
      // "under half a billion": both sizes under 0.5B, GPT-3's 350M and LaMDA's 422M
      highlight(ctx, C, p4, PP, L.gptSizes, sayWords(env, 9, 7, 10, t), { color: F.hlMint });
      highlight(ctx, C, p4, PP, L.lamda, sayWords(env, 9, 7, 10, t), { color: F.hlMint });
      highlight(ctx, C, p4, PP, L.palm, sayWords(env, 9, 13, 17, t), { color: F.hlMint });
      highlight(ctx, C, p4, PP, L.greedy, sayWords(env, 10, 3, 4, t), { color: F.hlMint });
    }
    const glowL = e(t, T.under, 0.5) * (1 - e(t, T.five2 - 0.2, 0.6)), glowP = e(t, T.five2 + 0.6, 0.6);
    MODELS.forEach((m, i) => {
      const x = 960 + (i - 2) * MROW.dx, y = MROW.y;
      const r = e(t, T.s9 + 0.25 + i * 0.2, 0.55, ease.outBack);
      if (r <= 0) return;
      // one try: a single grey answer card slides out of the front, then stops
      const cp = e(t, T.one + i * 0.07, 0.55, ease.outCubic);
      if (cp > 0) {
        const cy = y + MROW.d / 2 + 18 + 42 * cp;
        slab(ctx, C, { x0: x - 40, x1: x + 40, y0: cy - 22, y1: cy + 22, z0: 0, z1: 5 }, { fill: PAL.std, stroke: PAL.stdInk, width: 1.8, alpha: clamp(cp * 4) });
      }
      slab(ctx, C, { x0: x - MROW.w / 2, x1: x + MROW.w / 2, y0: y - MROW.d / 2, y1: y + MROW.d / 2, z0: 0, z1: MROW.h * r }, {
        fill: PAL.model, stroke: F.ink, width: 2.2, alpha: clamp(r * 3), label: r > 0.85 ? m.name : undefined, labelSize: 30,
      });
      m.sizes.forEach((s, j) => {
        const pr = e(t, T.s9 + 0.6 + i * 0.2 + j * 0.1, 0.45, ease.outBack);
        if (pr <= 0) return;
        const z0 = PLATE.z0 + j * PLATE.dz;
        const g = (m.key === 'lamda' || m.key === 'gpt') && j === 0 ? glowL : m.key === 'palm' && j === 2 ? glowP : 0;
        slab(ctx, C, { x0: x - PLATE.w / 2, x1: x + PLATE.w / 2, y0: y - PLATE.d / 2, y1: y + PLATE.d / 2, z0: z0, z1: z0 + PLATE.h }, {
          fill: g > 0 ? F.hlMint : '#FAFAF8', stroke: g > 0 ? F.ink : F.ink2, width: 1.6 + 2 * g, alpha: clamp(pr * 3),
        });
        if (s) {
          const fr = C.p(x + MROW.w / 2, y + PLATE.d / 2, z0 + PLATE.h), bk = C.p(x + MROW.w / 2, y - PLATE.d / 2, z0 + PLATE.h);
          const baseBk = C.p(x + MROW.w / 2, y - MROW.d / 2, MROW.h);   // the base's far top corner, so labels clear its side face
          drawTex(ctx, S[`sz${s}`], Math.max(fr.x, bk.x, baseBk.x) + 14, (fr.y + bk.y) / 2, { size: 32, color: g > 0 ? F.ink : F.ink2, valign: 'middle', write: clamp(pr * 1.5) });
        }
      });
      if (m.key === 'gpt') {
        const a = C.p(x, y, PLATE.z0 + (m.sizes.length - 1) * PLATE.dz + PLATE.h + 70);
        tag(ctx, S.asGiven, a.x, a.y, { size: 30, color: F.ink2, align: 'center', valign: 'bottom', alpha: e(t, T.s9 + 1.4, 0.6) });
      }
    });
    const os = e(t, T.one + 0.3, 0.6);
    if (os > 0) {
      const a = C.p(960, MROW.y + MROW.d / 2 + 18 + 42 + 22, 0);   // just in front of the cards
      tag(ctx, S.oneSample, a.x, a.y + 16, { size: 36, color: F.ink, align: 'center', valign: 'top', write: os });
    }

    // ── tags ──
    const lay = win(t, T.eight + 0.6, T.s1 - 0.1, 0.4, 0.4) + win(t, T.s9 + 0.3, env.dur + 1, 0.4, 0.4);
    if (lay > 0) {
      const a = t < T.s1 ? C.p(GX[0] + 1800 * ease.inCubic(out0) - TT.w / 2, GY0 + TT.d / 2 + 40, 0) : { x: 60, y: 1024 };
      tag(ctx, S.layout, a.x, a.y, { size: 30, color: F.ink2, valign: t < T.s1 ? 'top' : 'bottom', alpha: clamp(lay) });
    }

    // ── source stamp ──
    let page = p35, label = S.c35, rect = union([T20.box, T20.caption]);
    if (t > T.s1 + 0.1) { page = p4; label = S.c4f; rect = FIG3.withCaption; }
    if (t > T.s2 - 0.3 && t < T.s5 - 0.3) rect = FIG3.panels[PEAR];
    if (t > T.s5 - 0.3 && t < T.s8 - 0.3) rect = FIG3.panels[COINP];
    if (t > T.s9 - 0.2) { label = S.c4s; rect = PARA; }
    if (!PAGES) tag(ctx, S.redrawn, 60, 56, { size: 30, color: F.ink2, valign: 'top' });
    cite(ctx, page, { label, rect, alpha: e(t, 0.6, 0.6), side: 'right' });
  },
};
