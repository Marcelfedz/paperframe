// ablation — Section 3.3 (p. 5 → p. 6) and Section 3.4 (p. 6), every number from Table 6 (p. 23), LaMDA 137B on
// GSM8K. Four prompt variants as four small cards (ours, illustrative): chain of thought, equation only, dots
// only, reasoning after answer. Each card stands in front of its bar; the standard baseline is a glass plate at
// 6.5 for the whole segment, and a strip of Table 6 stays docked at the right with each cell boxed as its bar
// rises. The three stand-ins land at the plate (5.4, 6.4, 6.1), chain of thought stands at 14.3. Then the cards
// leave and the robustness bars rise beside annotator A: B, C, the concise style, and three GSM8K exemplar sets.
// Guardrails (briefing): all bars are LaMDA 137B · GSM8K (Table 6), no PaLM ablation values (Figure 5 prints
// none), "about the same as the baseline" stays the paper's phrase, "the authors' reading" stays on screen in
// s8, no ± on our bars, no "any prompt works".
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, texSize, drawTex, desk, edgeIn, loadPaper, findPhrase, standIn, cameraAt, sheet, onSheet, highlight,
  markBox, liftPose, arcPose, slab, blankPage, tag, cite, sayP, sayWords,
} from '/engine/folio.js';
import { PAL, PH, FIG5, FIG6, T6 } from './_data.js';

// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars, same geometry) and redrawn figures.
const PAGES = true;

const v1 = (v) => v.toFixed(1);
const S = {
  redrawn: '\\text{redrawn}',
  c5: '\\text{p. 5}\\;\\cdot\\;\\text{Section 3.3}',
  c6: '\\text{p. 6}\\;\\cdot\\;\\text{Section 3.3}',
  c6b: '\\text{p. 6}\\;\\cdot\\;\\text{Section 3.4}',
  c6f5: '\\text{p. 6}\\;\\cdot\\;\\text{Figure 5}',
  c6f6: '\\text{p. 6}\\;\\cdot\\;\\text{Figure 6}',
  c23: '\\text{p. 23}\\;\\cdot\\;\\text{Table 6}',
  group: '\\text{LaMDA 137B}\\;\\cdot\\;\\text{GSM8K}',
  std: '\\text{standard}',
  std65: '6.5',
  illus: '\\text{illustrative}',
  reading: "\\text{the authors' reading}",
  tokens: '\\text{tokens, no words}',
  fig5: '\\text{Figure 5: LaMDA 137B and PaLM 540B}',
  fig6: '\\text{Figure 6: LaMDA 137B}',
  annA: '\\text{annotator A}',
  letterA: '\\text{A}',
  annots: '\\text{annotators}',
  fromGsm: '\\text{exemplars from GSM8K}',
  eqBand: '= \\ldots',
  ...Object.fromEntries([0, 5, 10, 15, 20].map((v) => [`t${v}`, `${v}`])),
};

// ── the variants (cards ILLUSTRATIVE; values REAL, Table 6 GSM8K column) ─────
const row6 = (k) => T6.rows.find((r) => r.k === k);
const CARDS = [
  { k: 'cot', name: ['\\text{chain of}', '\\text{thought}'], ink: PAL.cotInk },
  { k: 'eq', name: ['\\text{equation}', '\\text{only}'], ink: F.ink2 },
  { k: 'var', name: ['\\text{dots}', '\\text{only}'], ink: F.ink2 },
  { k: 'after', name: ['\\text{reasoning}', '\\text{after answer}'], ink: F.ink2 },
];
CARDS.forEach((c) => c.name.forEach((s, i) => { S[`n_${c.k}${i}`] = s; }));
// the robustness bars beside annotator A, in Figure 6's order
const ROBUST = [
  { k: 'annB', lab: '\\text{B}' }, { k: 'annC', lab: '\\text{C}' }, { k: 'concise', lab: '\\text{concise}' },
  { k: 'alpha', lab: '\\alpha' }, { k: 'beta', lab: '\\beta' }, { k: 'gamma', lab: '\\gamma' },
];
ROBUST.forEach((r) => { S[`l_${r.k}`] = r.lab; });
T6.rows.forEach((r) => { S[`v_${r.k}`] = v1(r.v); });

// ── world layout (desk px) ───────────────────────────────────────────────────
const HZ = 25;                         // world z per point: about 14 px per point on screen at this camera
const BY = 564;                        // the bars' row
const BW = 52, BD = 52;
const SX = { cot: 1180, eq: 1375, var: 1550, after: 1725 };       // stations: chain of thought set aside on the left
const RX0 = 1180, RDX = 95;            // s10: annotator A at RX0, the six others every RDX to its right
const CARD = { w: 150, pw: 256, ph: 296, y: 832 };                // card sheets (page px pw × ph), standing in front of their bars (bottom edge at y)
const PLATE = { x0: 1105, x1: 1800, y0: BY - 44, y1: BY + 44, th: 5 };
const AX6 = { x: PLATE.x0 - 4, y: PLATE.y1 };                     // the axis post: the plate's front-left corner
const T6_RECT = { x0: 403, y0: 460, x1: 900, y1: 961 };           // p. 23: row labels + GSM8K column
const T6_AT = { x: 1745, y: 250, w: 285 };                         // docked at the top right, bottom edge at y
const PW = 1210;                                                   // page width: 0.71 world px per page px
const P5_REST = { x: 490, y: 80, w: PW, rot: -0.015 };              // Section 3.3 (bottom of p. 5) in the left half
const P6_REST = { x: 490, y: 890, w: PW, rot: -0.01 };           // p. 6's top half in the left half
const P6_DOWN = { ...P6_REST, y: 300 };                            // s9: slid back so Section 3.4 sits where Section 3.3 was

let p5, p6, p23, L;

// ── Figure 6's GSM8K panel redrawn on the stand-in (PAGES = false): heights from Table 6, positions measured on p. 6.
// Figure 5 is not redrawn: its PaLM bars have no printed values, so the stand-in keeps only its words.
const F6 = { y0: 1493, perPt: 12.92, w: 11, x: [1053, 1070, 1086, 1102, 1120, 1136, 1152, 1170], k: ['std', 'cot', 'annB', 'annC', 'concise', 'alpha', 'beta', 'gamma'] };
function redrawFig6(g) {
  g.strokeStyle = '#000'; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(1037, 1240); g.lineTo(1037, F6.y0); g.lineTo(1190, F6.y0); g.stroke();
  F6.k.forEach((k, i) => {
    const h = row6(k).v * F6.perPt;
    g.fillStyle = k === 'std' ? '#FFE036' : '#D1691F';
    g.fillRect(F6.x[i] - F6.w / 2, F6.y0 - h, F6.w, h); g.strokeRect(F6.x[i] - F6.w / 2, F6.y0 - h, F6.w, h);
  });
}

const grow = (r, px = 6, py = 4) => ({ x0: r.x0 - px, y0: r.y0 - py, x1: r.x1 + px, y1: r.y1 + py });
const poly = (ctx, P) => { ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); };
const bump = (t, at, up = 0.25, hold = 0.35, down = 0.5) => e(t, at, up) * (1 - e(t, at + up + hold, down));
const cell6 = (k) => { const r = row6(k); return { x0: T6.cols.gsm8k.x0, y0: r.y0, x1: T6.cols.gsm8k.x1, y1: r.y1 }; };

/**
 * bar3(ctx, C, x, y, v, o) — a value bar standing on the desk (kit candidate; 05-scale has the same helper):
 * a slab from z 0 to v·hz at (x, y), footprint w × d, and its printed value in TeX on top.
 * o = { p (rise 0→1), fill, stroke, width, alpha, w, d, hz, label, labelP, size, color, align, lx, z0 }.
 */
function bar3(ctx, C, x, y, v, { p = 1, fill = F.block, stroke = F.ink, width = 2, alpha = 1, w = BW, d = BD, hz = HZ,
  label, labelP = 1, size = 34, color, align = 'center', lx = x, z0 = 0 } = {}) {
  if (p <= 0 || alpha <= 0) return null;
  const h = Math.max(1.2, v * hz * p);
  if (h > z0 + 0.3) slab(ctx, C, { x0: x - w / 2, x1: x + w / 2, y0: y - d / 2, y1: y + d / 2, z0, z1: h }, { fill, stroke, width, alpha });
  if (label && labelP > 0) {
    const a = C.p(lx, y - d / 2, h);   // the back-top edge, so the label never sits on the top face
    drawTex(ctx, label, a.x + (align === 'right' ? -3 : align === 'left' ? 3 : 0), a.y - 9, { size, color: color ?? stroke, align, valign: 'bottom', write: labelP, alpha });
  }
  return C.p(x, y, h);
}

/** a card: a schematic answer of grey word bars (no real text); kind decides the middle */
function drawCard(g, c, { dots = 1, swap = 0, pulse = 0 } = {}) {
  const W_ = CARD.pw, H_ = CARD.ph, pad = 26, bar = (x, y, w, h = 14, col = '#D9D5CE') => { g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, 4); g.fill(); };
  g.fillStyle = c.k === 'cot' ? '#F2F9FF' : F.paper; g.fillRect(0, 0, W_, H_);
  // question: three grey lines
  bar(pad, 30, 170); bar(pad, 54, 196); bar(pad, 78, 120);
  const answer = (y) => bar(pad, y, 110, 18, F.ink3);
  const band = (y) => {   // the chain of thought: a band of blue word bars
    g.fillStyle = 'rgba(86,193,255,0.22)'; g.beginPath(); g.roundRect(pad - 8, y - 8, W_ - 2 * pad + 16, 82, 8); g.fill();
    [[0, 150], [24, 186], [48, 132]].forEach(([dy, w]) => bar(pad, y + dy, w, 14, PAL.cot));
  };
  if (c.k === 'cot') { band(118); answer(222); }
  if (c.k === 'eq') {
    g.fillStyle = '#F1F1F1'; g.beginPath(); g.roundRect(pad - 8, 112, 120, 52, 8); g.fill();
    drawTex(g, S.eqBand, pad + 6, 138, { size: 44, color: F.ink, valign: 'middle' });
    answer(222);
  }
  if (c.k === 'var') {
    const n = 11;
    for (let i = 0; i < n; i++) {
      const a = clamp(dots * n - i);
      if (a <= 0) break;
      const r = 6 * (1 + 0.5 * pulse);
      g.fillStyle = F.ink2; g.globalAlpha = a;
      g.beginPath(); g.arc(pad + 6 + i * 19, 140, r, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
    answer(222);
  }
  if (c.k === 'after') {
    const yA = lerp(222, 118, swap), yB = lerp(118, 166, swap);
    band(yB); answer(yA);
  }
  g.strokeStyle = c.ink; g.lineWidth = c.k === 'cot' ? 5 : 3.5;
  g.strokeRect(2, 2, W_ - 4, H_ - 4);
}

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [5, 6, 23]);
    p5 = PAGES ? P.page(5) : standIn(P.page(5));
    p6 = PAGES ? P.page(6) : standIn(P.page(6), { draw: redrawFig6 });
    p23 = PAGES ? P.page(23) : standIn(P.page(23));
    L = {
      head5: findPhrase(p5, '3.3 Ablation Study'),
      intro: findPhrase(p5, PH.ablationIntro),
      eqHead: findPhrase(p5, PH.eqOnlyHead),
      eqOnly: findPhrase(p5, PH.eqOnly),
      eqWhy: findPhrase(p5, PH.eqWhy),
      varHead: findPhrase(p6, PH.varHead),
      dots: findPhrase(p6, PH.dots),
      same1: findPhrase(p6, PH.sameShort, 1),
      afterHead: findPhrase(p6, PH.afterHead),
      after: findPhrase(p6, PH.after),
      same2: findPhrase(p6, PH.sameShort, 2),
      utility: findPhrase(p6, PH.utility),
      head34: findPhrase(p6, 'Robustness of Chain of Thought'),
      annot: findPhrase(p6, PH.annotators),
      sets: findPhrase(p6, PH.gsm8kSets),
      allSets: findPhrase(p6, PH.allSets),
    };
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      asks: q.w(0, 'asks'), simpler: q.w(0, 'simpler'), job: q.w(0, 'job'),
      s1: q.s(1), s2: q.s(2), barely: q.w(2, 'barely'),
      s3: q.s(3), row: q.w(3, 'row'), dots: q.w(3, 'dots'),
      s4: q.s(4), extra: q.w(4, 'Extra'),
      s5: q.s(5), same5: q.w(5, 'same'),
      s6: q.s(6), after: q.w(6, 'after'), written: q.w(6, 'written'),
      s7: q.s(7), same7: q.w(7, 'same'),
      s8: q.s(8), authors: q.w(8, "authors'"), reasoning: q.w(8, 'reasoning'), words: q.w(8, 'words'), e8: q.e(8),
      s9: q.s(9), s10: q.s(10), coauthors: q.w(10, 'co-authors'), taken: q.w(10, 'taken'), training: q.w(10, 'training'),
      beat: q.w(10, 'beat'), margin: q.w(10, 'margin'),
    };
    // when each bar rises, and when its card comes forward
    const RISE = {
      std: T.job - 0.2, cot: T.simpler - 0.1, eq: T.barely - 0.05, var: T.same5 - 0.1, after: T.same7 - 0.1,
      annB: T.s10 + 0.9, annC: T.s10 + 1.5, concise: T.taken + 0.45, alpha: T.taken + 0.15, beta: T.taken + 0.55, gamma: T.taken + 0.95,
    };
    const FWD = { eq: T.s1 - 0.1, var: T.s3 + 0.1, after: T.s6 - 0.05 };
    const OFF = T.s9 + 0.05;             // the cards and the three stand-in bars leave

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    // ── camera: pitch ≈ 0.6 throughout, so cards and bars read together with the page ──
    const C = cameraAt(t, [
      { t: 0, tx: 930, ty: 560, pitch: 0.56, zoom: 1.06, dist: 4000 },
      { t: 0.3, dur: 3.8, tx: 960, ty: 540, pitch: 0.58, zoom: 1.0 },
      { t: T.s1, dur: 10, tx: 975, ty: 535, zoom: 1.02 },
      { t: T.s3 - 0.5, dur: 1.6, tx: 955, ty: 545, zoom: 1.0 },
      { t: T.s3 + 1.2, dur: 15, tx: 975, ty: 535, zoom: 1.02 },
      { t: T.s9 - 0.2, dur: 1.6, tx: 955, ty: 548, zoom: 1.0 },
      { t: T.s10 - 0.4, dur: 2.0, tx: 990, ty: 505, zoom: 1.04 },
      { t: T.s10 + 1.8, dur: 7, tx: 1000, zoom: 1.05 },
    ]);
    const facing = { tilt: C.pitch, rot: -C.yaw };

    // ── p. 5 (s0–s2), then p. 6 pushes it off (s3); p. 6 slides back for Section 3.4 (s9) ──
    const in5 = e(t, 0, 1.15, ease.outCubic), out5 = e(t, T.s3 - 0.55, 1.1, ease.inOutCubic);
    const P5p = arcPose({ ...P5_REST, x: P5_REST.x - 300, y: P5_REST.y + 900, rot: -0.16 }, P5_REST, in5, 150);
    const P5now = { ...P5p, x: P5p.x - 1500 * out5, y: P5p.y + 200 * out5, z: (P5p.z || 0) + Math.sin(Math.PI * out5) * 80, rot: P5p.rot - 0.12 * out5 };
    if (out5 < 1) {
      sheet(ctx, C, p5, P5now);
      highlight(ctx, C, p5, P5now, L.head5, e(t, 0.4, 0.6, ease.linear), { color: F.hlMint });
      highlight(ctx, C, p5, P5now, L.intro, sayWords(env, 0, 4, 10, t), { color: F.hlMint });
      highlight(ctx, C, p5, P5now, L.eqHead, sayWords(env, 1, 0, 1, t), { color: F.hlMint });
      highlight(ctx, C, p5, P5now, L.eqOnly, sayWords(env, 2, 0, 5, t), { color: F.hlMint });
      highlight(ctx, C, p5, P5now, L.eqWhy, sayWords(env, 2, 6, 16, t), { color: F.hlMint });
    }
    const in6 = e(t, T.s3 - 0.6, 1.2, ease.outCubic), down6 = e(t, T.s9 - 0.1, 1.5, ease.inOutCubic);
    const P6base = arcPose({ ...P6_REST, x: P6_REST.x + 300, y: P6_REST.y + 1100, rot: 0.14 }, P6_REST, in6, 150);
    const P6now = in6 >= 1 ? arcPose(P6_REST, P6_DOWN, down6, 60) : P6base;
    if (in6 > 0) {
      sheet(ctx, C, p6, P6now);
      highlight(ctx, C, p6, P6now, L.varHead, sayWords(env, 3, 0, 2, t), { color: F.hlMint });
      highlight(ctx, C, p6, P6now, L.dots, sayWords(env, 3, 3, 11, t), { color: F.hlMint });
      highlight(ctx, C, p6, P6now, L.same1, sayP(env, 5, t), { color: F.hlYellow });
      highlight(ctx, C, p6, P6now, L.afterHead, sayWords(env, 6, 0, 3, t), { color: F.hlMint });
      highlight(ctx, C, p6, P6now, L.after, sayWords(env, 6, 4, 14, t), { color: F.hlMint });
      highlight(ctx, C, p6, P6now, L.same2, sayWords(env, 7, 1, 6, t), { color: F.hlYellow });
      highlight(ctx, C, p6, P6now, L.utility, sayWords(env, 8, 3, 13, t), { color: F.hlMint });
      highlight(ctx, C, p6, P6now, L.head34, e(t, T.s9 + 0.3, 0.6, ease.linear), { color: F.hlMint });
      highlight(ctx, C, p6, P6now, L.annot, sayWords(env, 10, 0, 5, t), { color: F.hlMint });
      highlight(ctx, C, p6, P6now, L.sets, sayWords(env, 10, 7, 12, t), { color: F.hlMint });
      highlight(ctx, C, p6, P6now, L.allSets, sayWords(env, 10, 14, 20, t), { color: F.hlMint });
      // Figure 5 (s8) and Figure 6 (s10): short ink boxes
      const f5 = e(t, T.words - 0.2, 0.7) * (1 - e(t, T.s9 + 0.2, 0.5));
      if (f5 > 0) markBox(ctx, C, p6, P6now, FIG5.all, f5, { color: F.ink2, width: 2.6, pad: 8 });
      const f6 = e(t, T.beat + 0.2, 0.8);
      if (f6 > 0) markBox(ctx, C, p6, P6now, FIG6.all, f6, { color: F.ink2, width: 2.6, pad: 8 });
    }

    // ── Table 6 docked at the right edge: arrives early, every cell boxed as its bar rises ──
    const t6p = e(t, 0.5, 1.3, ease.linear);
    const T6h = T6_AT.w * (T6_RECT.y1 - T6_RECT.y0) / (T6_RECT.x1 - T6_RECT.x0);
    const T6p = liftPose(p23, { x: 2500, y: 1000, w: 900, rot: 0.12 }, T6_RECT, { ...T6_AT, y: T6_AT.y - T6h / 2, ...facing, arc: 220 }, t6p);
    if (t6p > 0) {
      sheet(ctx, C, p23, T6p, { grid: 6, shadow: 0.4 });
      for (const [k, at] of Object.entries(RISE)) {
        const gone = ['eq', 'var', 'after'].includes(k) ? e(t, OFF, 0.6) * 0.6 : 0;
        markBox(ctx, C, p23, T6p, cell6(k), e(t, at - 0.05, 0.5) * (1 - gone), { color: k === 'std' ? PAL.stdInk : ['eq', 'var', 'after'].includes(k) ? F.ink2 : PAL.cotInk, width: 2.6, pad: 3 });
      }
    }

    // ── the bars, back to front by depth; the plate at 6.5; values on top ──
    const offP = e(t, OFF, 1.0, ease.inCubic);
    const bars = [];
    bars.push({ k: 'cot', x: SX.cot, v: row6('cot').v, fill: PAL.cot, stroke: PAL.cotInk, a: 1, p: e(t, RISE.cot, 0.9, ease.outCubic), pulse: bump(t, T.reasoning - 0.1, 0.25, 0.6, 0.5) });
    for (const k of ['eq', 'var', 'after']) bars.push({ k, x: SX[k] + 900 * offP, v: row6(k).v, fill: '#E6EAF0', stroke: F.ink2, a: 1 - offP, p: e(t, RISE[k], 0.9, ease.outCubic) });
    ROBUST.forEach((r, i) => bars.push({ k: r.k, x: RX0 + RDX * (i + 1), v: row6(r.k).v, fill: PAL.cot, stroke: PAL.cotInk, a: 1, p: e(t, RISE[r.k], 0.9, ease.outCubic), glow: e(t, T.beat + 0.1 + i * 0.12, 0.4) }));
    const glowA = e(t, T.beat, 0.4);
    const plateZ = row6('std').v * HZ, plateP = e(t, RISE.std, 0.9, ease.inOutCubic);
    // plate extent: the four stations, then annotator A and the six robustness bars
    const px1 = lerp(PLATE.x1, RX0 + RDX * 6 + 50, e(t, T.s10, 1.0, ease.inOutCubic));
    const live = bars.filter((b) => b.p > 0 && b.a > 0);
    live.forEach((b) => {
      const glow = b.k === 'cot' ? glowA : b.glow || 0;
      bar3(ctx, C, b.x, BY, b.v, { p: b.p, fill: b.fill, stroke: b.stroke, width: 2.2 + 2.4 * (b.pulse || 0), alpha: b.a });
    });
    if (plateP > 0) {
      basePlate(ctx, C, plateZ * plateP, PLATE.x0, px1, clamp(plateP * 3));
      // the parts of the bars above the plate, drawn again on top (and lit when "beat … by a large margin")
      live.filter((b) => b.v * HZ * b.p > plateZ * plateP).forEach((b) => {
        const glow = b.k === 'cot' ? glowA : b.glow || 0;
        ctx.save();
        if (glow > 0) { ctx.shadowColor = `rgba(86,193,255,${0.85 * glow})`; ctx.shadowBlur = 22 * glow; }
        bar3(ctx, C, b.x, BY, b.v, { p: b.p, fill: b.fill, stroke: b.stroke, width: 2.2 + 2.4 * (b.pulse || 0) + 0.8 * glow, alpha: b.a, z0: plateZ * plateP });
        ctx.restore();
      });
    }
    // values on top (written as the bar lands)
    live.forEach((b) => {
      const top = C.p(b.x, BY - BD / 2, b.v * HZ * b.p);
      drawTex(ctx, S[`v_${b.k}`], top.x, top.y - 9, { size: b.k === 'cot' ? 40 : 34, color: b.stroke === F.ink2 ? F.ink : b.stroke, align: 'center', valign: 'bottom', write: e(t, RISE[b.k] + 0.25, 0.6, ease.linear), alpha: b.a });
    });
    // the bar axis (0–20, Figure 6's GSM8K range) at the plate's left edge; the plate's label left of its ticks
    axis6(ctx, C, t, e(t, RISE.cot - 0.3, 0.9, ease.inOutCubic));
    if (plateP > 0) {
      // two short lines, so the label stays clear of the page's figure column
      const s = C.p(AX6.x - 52, AX6.y, plateZ * plateP);
      tag2(ctx, [S.std, S.std65], s.x, s.y, { size: 34, color: PAL.stdInk, write: e(t, RISE.std + 0.3, 0.7, ease.linear) });
    }
    // the group's label: every number here is LaMDA 137B on GSM8K
    {
      const s = C.p(PLATE.x0 - 20, BY - 50, 22.5 * HZ);
      tag(ctx, S.group, s.x, s.y, { size: 34, align: 'left', valign: 'bottom', write: e(t, RISE.cot + 0.3, 0.9, ease.linear) });
    }

    // ── the cards: arrive in a row; the one being read comes forward; they leave at s9 ──
    const cardIn = (i) => e(t, 0.6 + i * 0.12, 1.0, ease.linear);
    const fwdOf = (k) => {
      if (k === 'cot') return e(t, T.authors, 0.8, ease.inOutCubic) * (1 - e(t, OFF - 0.2, 0.6, ease.inOutCubic));
      const nxt = { eq: FWD.var, var: FWD.after, after: T.s8 - 0.2 }[k];
      return e(t, FWD[k], 0.8, ease.inOutCubic) * (1 - e(t, nxt, 0.7, ease.inOutCubic));
    };
    const cardList = CARDS.map((c, i) => {
      const fwd = fwdOf(c.k), x = c.k === 'cot' ? SX.cot : SX[c.k];
      const home = { x, y: CARD.y, w: CARD.w, tilt: C.pitch, rot: 0 };
      const front = c.k === 'cot'
        ? { x: x + 20, y: CARD.y + 110, w: CARD.w * 1.3, tilt: C.pitch, rot: 0 }
        : { x, y: CARD.y + 14, z: 8, w: CARD.w * 1.14, tilt: C.pitch, rot: 0 };
      let pose = arcPose(home, front, fwd, 40);
      const p = cardIn(i);
      if (p < 1) pose = arcPose({ ...home, x: home.x + 700, y: home.y + 500, rot: 0.2 }, home, ease.outCubic(p), 120);
      if (offP > 0) pose = arcPose(pose, { ...pose, x: pose.x + 1100, y: pose.y + 300, rot: 0.25 }, offP, 120);
      const hb = (pose.w * CARD.ph / CARD.pw) / 2;   // stand on the bottom edge: the pose's y is the sheet centre
      return { c, i, p, fwd, base: pose.y, pose: { ...pose, y: pose.y - hb, z: (pose.z || 0) }, dim: fwd > 0.01 || t < FWD.eq ? 1 : 0.55 };
    });
    for (const o of cardList) {
      if (o.p <= 0 || offP >= 1) continue;
      const pg = blankPage(`cot-abl-card-${o.c.k}`, CARD.pw, CARD.ph, (g) => drawCard(g, o.c, {
        dots: o.c.k === 'var' ? e(t, T.row - 0.1, 1.0, ease.linear) : 1,
        swap: o.c.k === 'after' ? e(t, T.after, 0.9, ease.inOutCubic) : 0,
        pulse: o.c.k === 'var' ? Math.sin(Math.PI * e(t, T.extra, 0.8, ease.linear)) : 0,
      }), { scale: 1 });
      sheet(ctx, C, pg, o.pose, { grid: 4, shadow: 0.5, alpha: lerp(1, 0.55, (1 - o.dim)) });
      // the name under the card, two short lines
      const base = C.p(o.pose.x, o.base + 8, 0);
      o.c.name.forEach((_, j) => drawTex(ctx, S[`n_${o.c.k}${j}`], base.x, base.y + 4 + j * 34, {
        size: 30, color: o.c.k === 'cot' ? PAL.cotInk : F.ink, align: 'center', valign: 'top', write: clamp(o.p * 1.4 - 0.4), alpha: 1 - offP,
      }));
    }
    // small tags: the cards are ours; the dots are extra tokens; the conclusion is the authors' reading
    const ill = 1 - e(t, OFF, 0.6);
    {
      const s = C.p(SX.cot - 90, CARD.y, 0);
      drawTex(ctx, S.illus, s.x, s.y, { size: 30, color: F.ink3, align: 'right', valign: 'bottom', write: e(t, 1.6, 0.8, ease.linear), alpha: ill });
    }
    const tk = e(t, T.extra, 0.8, ease.linear) * (1 - e(t, T.s6 - 0.3, 0.5));
    if (tk > 0) { const s = C.p(SX.var, BY, 13 * HZ); tag(ctx, S.tokens, s.x, s.y, { size: 34, align: 'center', valign: 'bottom', write: tk }); }
    const rd = e(t, T.authors - 0.05, 0.8, ease.linear) * (1 - e(t, T.s9, 0.5));
    if (rd > 0) { const s = C.p((SX.eq + SX.after) / 2, BY, 12 * HZ); tag(ctx, S.reading, s.x, s.y, { size: 36, align: 'center', valign: 'bottom', write: rd }); }

    // ── s9–s10: annotator A and the robustness bars' names ──
    const ra = e(t, T.s9 + 0.6, 0.8, ease.linear);
    if (ra > 0) {
      // the letter under the bar, and a second row: "annotator A" alone, then "annotators" under A–C once B and C stand
      const s = C.p(SX.cot, BY + BD / 2 + 10, 0);
      drawTex(ctx, S.letterA, s.x, s.y + 4, { size: 32, color: PAL.cotInk, align: 'center', valign: 'top', write: ra });
      const sw = e(t, RISE.annB, 0.5);
      drawTex(ctx, S.annA, s.x, s.y + 46, { size: 30, color: PAL.cotInk, align: 'center', valign: 'top', write: ra, alpha: 1 - sw });
      const m = C.p(RX0 + RDX, BY + BD / 2 + 10, 0);
      drawTex(ctx, S.annots, m.x, m.y + 46, { size: 30, color: PAL.cotInk, align: 'center', valign: 'top', write: e(t, RISE.annB + 0.3, 0.7, ease.linear) });
      const g = C.p(RX0 + RDX * 5, BY + BD / 2 + 10, 0);
      drawTex(ctx, S.fromGsm, g.x, g.y + 46, { size: 30, color: PAL.cotInk, align: 'center', valign: 'top', write: e(t, RISE.beta, 0.8, ease.linear) });
    }
    ROBUST.forEach((r, i) => {
      const w = e(t, RISE[r.k] + 0.1, 0.6, ease.linear);
      if (w <= 0) return;
      const s = C.p(RX0 + RDX * (i + 1), BY + BD / 2 + 10, 0);
      drawTex(ctx, S[`l_${r.k}`], s.x, s.y + 4, { size: 32, color: r.k === 'concise' ? F.ink2 : PAL.cotInk, align: 'center', valign: 'top', write: w });
    });
    // Figure tags beside the boxes on p. 6
    const f5a = e(t, T.words - 0.1, 0.7, ease.linear) * (1 - e(t, T.s9 + 0.2, 0.5));
    if (f5a > 0) { const s = onSheet(C, p6, P6now, (FIG5.all.x0 + FIG5.all.x1) / 2, FIG5.all.y0 - 10); tag(ctx, S.fig5, s.x, s.y - 14, { size: 30, align: 'center', valign: 'bottom', write: f5a }); }
    const f6a = e(t, T.beat + 0.3, 0.8, ease.linear);
    if (f6a > 0) { const s = onSheet(C, p6, P6now, (FIG6.all.x0 + FIG6.all.x1) / 2, FIG6.all.y0 - 10); tag(ctx, S.fig6, s.x, s.y - 14, { size: 30, align: 'center', valign: 'bottom', write: f6a }); }
    if (!PAGES && in6 > 0) { const s = onSheet(C, p6, P6now, 1200, 1540); drawTex(ctx, S.redrawn, s.x, s.y, { size: 30, color: F.ink2, align: 'center', valign: 'top' }); }

    // ── source stamp: the page in focus; p. 23 · Table 6 for a moment whenever a bar rises ──
    const stamps = [
      [0, p5, S.c5, grow({ x0: 300, y0: 1595, x1: 1400, y1: 1742 })],
      [T.s3 - 0.3, p6, S.c6, { x0: 300, y0: 208, x1: 987, y1: 795 }],
      [T.words - 0.15, p6, S.c6f5, FIG5.all],
      [T.s9 + 0.1, p6, S.c6b, { x0: 300, y0: 920, x1: 987, y1: 1830 }],
      [T.beat + 0.2, p6, S.c6f6, FIG6.all],
    ];
    for (const k of Object.keys(RISE)) {
      if (k === 'std') continue;
      const at = RISE[k];
      if (['annB', 'annC', 'concise', 'alpha', 'beta', 'gamma'].includes(k) && k !== 'annB' && k !== 'alpha') continue;   // one stamp moment per group
      stamps.push([at, p23, S.c23, { x0: T6_RECT.x0, y0: T6_RECT.y0, x1: T6_RECT.x1, y1: T6_RECT.y1 }]);
      stamps.push([at + 1.5, null, null, null]);   // back to the page in focus
    }
    stamps.sort((a, b) => a[0] - b[0]);
    let cur = stamps[0];
    let page = stamps[0];
    for (const s of stamps) {
      if (t < s[0]) break;
      if (s[1]) { cur = s; if (s[1] !== p23) page = s; } else cur = page;
    }
    const dip = Math.min(1, ...stamps.slice(1).map(([ts]) => clamp(Math.abs(t - ts) / 0.2)));
    cite(ctx, cur[1], { label: cur[2], rect: cur[3], alpha: e(t, 0.5, 0.6) * dip, side: 'right' });
  },
};

// ── pieces ───────────────────────────────────────────────────────────────────

/** tag2 — a paper slip with two right-aligned TeX lines, its right edge at x and its middle at y (screen px) */
function tag2(ctx, lines, x, y, { size = 34, color = F.ink, write = 1, pad = 12, gap = 8 } = {}) {
  if (write <= 0) return;
  const sz = lines.map((l) => texSize(l, size)), w = Math.max(...sz.map((z) => z.w)), h = sz.reduce((a, z) => a + z.h, 0) + gap;
  ctx.save();
  ctx.globalAlpha *= clamp(write * 3);
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.shadowColor = 'rgba(40,30,20,0.16)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
  ctx.beginPath(); ctx.roundRect(x - w - 2 * pad, y - h / 2 - pad * 0.7, w + 2 * pad, h + pad * 1.4, 6); ctx.fill();
  ctx.restore();
  let yy = y - h / 2;
  lines.forEach((l, i) => { drawTex(ctx, l, x - pad, yy, { size, color, align: 'right', valign: 'top', write }); yy += sz[i].h + gap; });
}

/** the bar axis: a post at the plate's front-left corner, 0 to 20 points, ticks every 5 with their labels on the left */
function axis6(ctx, C, t, p) {
  if (p <= 0) return;
  const top = 20 * HZ * p, a = C.p(AX6.x, AX6.y, 0), b = C.p(AX6.x, AX6.y, top);
  ctx.save();
  ctx.strokeStyle = F.ink2; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  for (const v of [0, 5, 10, 15, 20]) {
    if (v * HZ > top + 0.5) continue;
    const q = C.p(AX6.x, AX6.y, v * HZ);
    ctx.beginPath(); ctx.moveTo(q.x - 12, q.y); ctx.lineTo(q.x, q.y); ctx.stroke();
    drawTex(ctx, S[`t${v}`], q.x - 18, q.y, { size: 30, color: F.ink2, align: 'right', valign: 'middle', write: clamp(p * 2 - v / 20) });
  }
  ctx.restore();
}

/** the standard baseline: a translucent glass plate at height z across the bars, PAL.stdInk outline */
function basePlate(ctx, C, z, x0, x1, a) {
  const { y0, y1, th } = PLATE;
  const top = [C.p(x0, y0, z), C.p(x1, y0, z), C.p(x1, y1, z), C.p(x0, y1, z)];
  const front = [C.p(x0, y1, z - th), C.p(x1, y1, z - th), C.p(x1, y1, z), C.p(x0, y1, z)];
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(200,205,212,0.30)'; poly(ctx, top); ctx.fill();
  ctx.fillStyle = 'rgba(150,156,165,0.40)'; poly(ctx, front); ctx.fill();
  ctx.strokeStyle = PAL.stdInk; ctx.lineWidth = 2.2; ctx.lineJoin = 'round';
  poly(ctx, top); ctx.stroke(); poly(ctx, front); ctx.stroke();
  const s0 = C.p(x0 + 10, y1 - 8, z), s1 = C.p(x0 + 34, y0 + 8, z);   // a sheen at the left end, clear of the bars
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(s0.x, s0.y); ctx.lineTo(s1.x, s1.y); ctx.stroke();
  ctx.restore();
}
