// scale — Section 3.2 (p. 4) and Figure 4 (p. 5). Figure 4's GSM8K row lifts off as the blueprint, and the
// terrace grows behind it: Table 2's GSM8K bars standing on the desk, LaMDA at the back, GPT-3 in the middle,
// PaLM in front, model size along x (log). Small models: chain of thought under standard, outlined red. The
// last lines of p. 4 stand at the back for the quoted lines. The ~100B sheet. PaLM's three pairs rise with the
// voice, their cells boxed on Table 2 (p. 21) standing at the back right. The prior best (55, finetuning;
// Table 1, p. 20) is an orange glass plate the 56.9 bar just clears. Last: "emergent ability of model scale".
// Guardrails (briefing): Table 2 values only (17.9 / 56.9, never Figure 2's 18 / 57), every bar from 0 with its
// printed value, no deltas, "~100B" stays approximate, the 55 is "prior best (finetuned)" with no system name.
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, mix, desk, edgeIn, loadPaper, findPhrase, standIn, cameraAt, sheet,
  highlight, markBox, liftPose, arcPose, slab, tag, cite, sayWords,
} from '/engine/folio.js';
import { PAL, PH, FIG4, T1, T2, SCALE } from './_data.js';

// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars, same geometry) and redrawn figures.
const PAGES = true;

const v1 = (v) => v.toFixed(1);
const S = {
  c4: '\\text{p. 4}\\;\\cdot\\;\\text{Section 3.2}',
  c5: '\\text{p. 5}\\;\\cdot\\;\\text{Figure 4}',
  c21: '\\text{p. 21}\\;\\cdot\\;\\text{Table 2}',
  c20: '\\text{p. 20}\\;\\cdot\\;\\text{Table 1}',
  axis: '\\text{GSM8K solve rate}',
  thr: '\\sim 100\\text{B parameters}',
  prior: SCALE.priorBest.label,
  cobbe: '\\text{Cobbe et al. 2021}',
  illus: '\\text{layout illustrative}',
  redrawn: '\\text{redrawn}',
  ...Object.fromEntries(SCALE.axis.ticks.map((v) => [`t${v}`, `${v}\\%`])),
  ...Object.fromEntries(Object.entries(SCALE.rows).map(([k, r]) => [`row_${k}`, r.label])),
};

// ── world layout (desk px) ───────────────────────────────────────────────────
const HZ = SCALE.hPerPct, BW = SCALE.bar.w, BD = SCALE.bar.d, DX = SCALE.dx;
const FAMS = ['lamda', 'gpt', 'palm'];                     // back → front
const RY = Object.fromEntries(FAMS.map((f) => [f, SCALE.rows[f].y]));
const AXX = 372;                                           // the lanes start here (first bar: GPT-3 350M at 404)
const TY0 = RY.lamda - 70, TY1 = RY.palm + 70;             // terrace depth: 330 … 790
const LANE = { x0: AXX, x1: 1330, half: 44 };
const RULER = { x0: 296, x1: 362, y0: TY0 - 12, y1: TY0, top: 62 * HZ };   // the axis plate: back-left corner, 0–62 %
const SHEET = { y0: RY.lamda - 30, y1: RY.palm + 44, h: 32 * HZ };   // the ~100B sheet: across the three lanes, 32 % high
const PRIOR_Z = SCALE.priorBest.v * HZ;
const PRIOR_INK = '#C25E00';                             // a darker step of PAL.prior, for text on white
const PLATE = { x0: 752, x1: 1318, y0: RY.palm - 44, y1: RY.palm + 44, th: 6 };

const P4_REST = { x: 760, y: 1560, w: 860, rot: -0.015 };
const P5_REST = { x: 1660, y: 1540, w: 860, rot: 0.012 };
const P21_REST = { x: 1780, y: 600, w: 640, rot: -0.03 };
const BP = { x: 860, y: 935, w: 520, rot: 0 };               // the blueprint: Figure 4's GSM8K row, flat in front
const BP_RECT = { x0: 922, y0: 336, x1: 1390, y1: 562 };   // column heads + three GSM8K subplots + tick labels
const STRIP_RECT = { x0: 296, y0: 1850, x1: 1406, y1: 2003 };   // p. 4, the last five lines of Section 3.2
const STRIP = { x: 990, y: -12, w: 1040 };                  // standing at the back of the desk (bottom edge at y 60)
const T2_AT = { x: 1610, y: 640, w: 470 };                  // Table 2 standing at the right, bottom edge at y
const T1_RECT = { x0: T1.box.x0, y0: T1.box.y0 + 1, x1: 852, y1: T1.rows.priorBest.y1 + 5 };   // p. 20, Table 1 header + "Prior best N/A (finetuning) 55" (GSM8K column only)
const T1_AT = { x: 1560, y: 700, w: 440 };                  // p. 20's strip standing at the right, bottom edge at y
const SEC32 = { x0: 296, y0: 1726, x1: 1406, y1: 2005 };    // stamp box: Section 3.2 heading + paragraph

// the bars: one record per (family, size, prompting) with its cue
const BARS = [];
for (const f of FAMS) {
  T2.rows[f].forEach((r, i) => {
    const x = SCALE.x[r.b];
    for (const k of ['std', 'cot']) {
      BARS.push({ f, i, r, k, x: x + (k === 'std' ? -DX : DX), cx: x, y: RY[f], v: r[k], val: v1(r[k]),
        bad: k === 'cot' && r.cot < r.std,
        cell: { x0: T2.cols[k === 'std' ? 'gsm8kStd' : 'gsm8kCoT'].x0, y0: r.y0, x1: T2.cols[k === 'std' ? 'gsm8kStd' : 'gsm8kCoT'].x1, y1: r.y1 } });
    }
  });
}
BARS.forEach((b) => { S[`v_${b.val}`] = b.val; });
FAMS.forEach((f) => T2.rows[f].forEach((r) => { S[`m_${r.m}`] = `\\text{${r.m}}`; }));

let p4, p5, p20, p21, L;

// ── Figure 4's GSM8K row, redrawn on the stand-in (PAGES = false): points from Table 2, positions measured on p. 5 ──
const F4X = { lamda: [981, 1004, 1026, 1059, 1069], gpt: [1128, 1146, 1170, 1218], palm: [1270, 1317, 1367] };
const F4Y = (v) => 547 - v * (163 / 60);
function redrawFig4(g) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const f of FAMS) {
    const b = FIG4.sub.gsm8k[f];
    g.strokeStyle = '#000'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(b.x0, b.y0); g.lineTo(b.x0, b.y1); g.lineTo(b.x1, b.y1); g.stroke();
    g.strokeStyle = PAL.prior; g.lineWidth = 3.5; g.setLineDash([9, 7]);
    g.beginPath(); g.moveTo(b.x0 + 2, F4Y(55)); g.lineTo(b.x1, F4Y(55)); g.stroke(); g.setLineDash([]);
    for (const [k, col, w, rad] of [['std', '#000', 1.4, 3.5], ['cot', '#0000FF', 1.6, 8]]) {
      const pts = T2.rows[f].map((r, i) => [F4X[f][i], F4Y(r[k])]);
      g.strokeStyle = col; g.lineWidth = w;
      g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
      pts.forEach(([x, y]) => { g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.stroke(); });
    }
  }
}

const union = (rs) => ({ x0: Math.min(...rs.map((r) => r.x0)), y0: Math.min(...rs.map((r) => r.y0)), x1: Math.max(...rs.map((r) => r.x1)), y1: Math.max(...rs.map((r) => r.y1)) });
const grow = (r, px = 6, py = 4) => ({ x0: r.x0 - px, y0: r.y0 - py, x1: r.x1 + px, y1: r.y1 + py });
const poly = (ctx, P) => { ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); };
const bump = (t, at, up = 0.25, hold = 0.4, down = 0.5) => e(t, at, up) * (1 - e(t, at + up + hold, down));

/**
 * bar3(ctx, C, x, y, v, o) — a value bar standing on the desk (kit candidate; 06-ablation has the same helper):
 * a slab from z 0 to v·hz at (x, y), footprint w × d, and its printed value in TeX on top.
 * o = { p (rise 0→1), fill, stroke, width, alpha, w, d, hz, label, labelP, size, color, align, lx (world x of the
 * label anchor, default x), z0 (draw only the part above z0, for a slab poking through a plate) }.
 * Returns the screen point of the top centre, or null.
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

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [4, 5, 20, 21]);
    p4 = PAGES ? P.page(4) : standIn(P.page(4));
    p5 = PAGES ? P.page(5) : standIn(P.page(5), { draw: redrawFig4 });
    p20 = PAGES ? P.page(20) : standIn(P.page(20));
    p21 = PAGES ? P.page(21) : standIn(P.page(21));
    L = {
      head: findPhrase(p4, '3.2 Results'),
      fluent: findPhrase(p4, PH.fluent),
      lower: findPhrase(p4, PH.lowerPerf),
      only100: findPhrase(p4, PH.only100B),
      emergent: findPhrase(p4, PH.emergentShort),
      prior: findPhrase(p20, PH.priorRow),
    };
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      s1: q.s(1), solve: q.w(1, 'solve'), model: q.w(1, 'model'), three: q.w(1, 'three'), families: q.w(1, 'families'), e1: q.e(1),
      s2: q.s(2), small: q.w(2, 'small'), doesnt: q.w(2, "doesn't"),
      s3: q.s(3), fluent: q.w(3, 'fluent'),
      s4: q.s(4), gains: q.w(4, 'gains'), appear: q.w(4, 'appear'), hundred: q.w(4, 'hundred'),
      s5: q.s(5), palm: q.w(5, 'PaLM'), gsm: q.w(5, 'GSM8K'),
      s6: q.s(6), four: q.w(6, 'four'), fourB: q.w(6, 'four', 2),
      s7: q.s(7), nine: q.w(7, 'nine'), twentynine: q.w(7, 'twenty-nine'),
      s8: q.s(8), seventeen: q.w(8, 'seventeen'), fiftysix: q.w(8, 'fifty-six'), e8: q.e(8),
      s9: q.s(9), passes: q.w(9, 'passes'), fiftyfive: q.w(9, 'fifty-five'), came: q.w(9, 'came'),
      s10: q.s(10), an: q.w(10, 'an'),
    };
    T.lift = T.families - 0.1;          // the GSM8K row leaves p. 5
    T.stripUp = T.e1 + 2.85;            // p. 4's lines lift (end of s2), standing before "fluent"
    T.stripGo = T.s5 - 0.1;
    T.stripBack = T.s10 - 0.55;
    T.t2Lift = T.palm + 0.05;
    T.away = T.s10 - 0.35;              // the p. 20 strip is picked up
    T.t2go = T.e8 + 0.25;               // Table 2 is picked up at the pause

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    // ── camera ──
    const TER = { tx: 860, ty: 520, pitch: 0.9, yaw: 0, zoom: 1.25, dist: 4000 };
    const C = cameraAt(t, [
      { t: 0, tx: 760, ty: 1930, zoom: 1.75, pitch: 0.2, dist: 4000 },
      { t: 0.2, dur: 1.4, tx: 765, ty: 1945, zoom: 2.0 },                                   // Section 3.2, heading and lines
      { t: T.s1 - 0.25, dur: 0.75, tx: 1250, ty: 1640, zoom: 1.3 },                         // pull back as p. 5 arrives
      { t: T.s1 + 0.35, dur: 1.0, tx: 1800, ty: 1318, zoom: 1.95, pitch: 0.22 },            // Figure 4
      { t: T.solve + 0.4, dur: 2.6, tx: 1810, zoom: 2.02 },
      { t: T.lift + 0.15, dur: 1.9, ...TER },                                              // the desk tilts up: the terrace
      { t: T.lift + 2.1, dur: 3.0, tx: 900, zoom: 1.28 },
      { t: T.s3 + 1.0, dur: 4.6, tx: 860, yaw: -0.3, zoom: 1.27 },                        // a slow turn: the ~100B sheet opens up
      { t: T.s5 - 0.15, dur: 1.8, tx: 1180, ty: 600, yaw: -0.08, zoom: 1.35 },             // push towards PaLM, Table 2 at the right
      { t: T.s6 + 0.5, dur: 4.5, tx: 1160, ty: 610, zoom: 1.4 },                            // 8B
      { t: T.s7 - 0.2, dur: 3.5, tx: 1180, ty: 590, zoom: 1.37 },                           // 62B
      { t: T.s8 - 0.2, dur: 3.5, tx: 1200, ty: 570, zoom: 1.33 },                           // 540B, the tallest
      { t: T.e8 - 0.1, dur: 4.4, tx: 1000, ty: 535, yaw: 0.17, zoom: 1.2 },                // pause: a slow turn along the terrace
      { t: T.fiftyfive, dur: 3.0, tx: 1020, zoom: 1.21 },
      { t: T.s10 - 0.45, dur: 1.9, tx: 900, ty: 520, yaw: -0.06, zoom: 1.22 },               // pull back to the whole terrace
      { t: T.s10 + 1.45, dur: 3, yaw: -0.1, zoom: 1.24 },
    ]);
    const facing = { tilt: C.pitch, rot: -C.yaw };     // a standing sheet faces the camera

    // ── p. 4 and p. 5, flat in front: arrive, then slide off towards the viewer when the desk tilts up ──
    const in4 = e(t, 0, 1.15, ease.outCubic), in5 = e(t, T.s1 - 0.05, 1.1, ease.outCubic);
    const off = e(t, T.lift + 0.35, 1.3, ease.inCubic);
    const P4p = arcPose({ ...P4_REST, x: P4_REST.x - 260, y: P4_REST.y + 900, rot: -0.14 }, P4_REST, in4, 150);
    const P5p = arcPose({ ...P5_REST, x: P5_REST.x + 900, y: P5_REST.y + 300, rot: 0.16 }, P5_REST, in5, 150);
    if (off < 1) {
      const push = (P, dx) => ({ ...P, x: P.x + dx * off, y: P.y + 1300 * off, z: (P.z || 0) + Math.sin(Math.PI * off) * 60, rot: P.rot - 0.08 * off });
      const A4 = push(P4p, -200), A5 = push(P5p, 200);
      sheet(ctx, C, p4, A4);
      highlight(ctx, C, p4, A4, L.head, e(t, 0.35, 0.6, ease.linear), { color: F.hlMint });
      if (in5 > 0) {
        sheet(ctx, C, p5, A5);
        const box = (r, at) => markBox(ctx, C, p5, A5, r, e(t, at, 0.6), { color: F.ink2, width: 2.2, pad: 5 });
        box(FIG4.rowLabels, T.solve - 0.1);
        box(FIG4.xAxis, T.model - 0.1);
        box(FIG4.colHeads, T.three - 0.1);
      }
    }

    // ── the blueprint: Figure 4's GSM8K row lifts off p. 5 and lies flat in front of the terrace ──
    const bpP = e(t, T.lift, 1.55, ease.linear);
    const BPp = liftPose(p5, P5_REST, BP_RECT, { ...BP, arc: 320 }, bpP);
    const drawBlueprint = () => {
      if (bpP <= 0) return;
      sheet(ctx, C, p5, BPp, { grid: 6, shadow: 0.6 });
      markBox(ctx, C, p5, BPp, FIG4.colHeads, 1 - e(t, T.lift + 0.4, 0.5), { color: F.ink2, width: 2.2, pad: 5 });
      markBox(ctx, C, p5, BPp, FIG4.sub.gsm8k.palm, e(t, T.palm - 0.05, 0.6) * (1 - e(t, T.s10 - 0.3, 0.6)), { color: F.red, width: 2.6, pad: 4 });
      if (!PAGES) {
        const a = C.p(BP.x + BP.w / 2 + 16, BP.y, 0);
        drawTex(ctx, S.redrawn, a.x, a.y, { size: 30, color: F.ink2, valign: 'middle', alpha: clamp(bpP * 2 - 1) });
      }
    };
    if (bpP >= 1) drawBlueprint();

    // ── the terrace: lanes, the axis plate, row labels ──
    const lanesP = e(t, T.lift + 0.7, 0.9, ease.inOutCubic);
    const dimRows = (1 - e(t, T.s5, 0.6)) + e(t, T.e8 + 0.1, 1.0);    // LaMDA and GPT-3 dim while PaLM is read
    const rowA = (f) => (f === 'palm' ? 1 : lerp(0.35, 1, clamp(dimRows)));
    if (lanesP > 0) {
      ctx.save();
      for (const f of FAMS) {
        const y = RY[f], x1 = lerp(LANE.x0, LANE.x1, lanesP);
        const Q = [[LANE.x0, y - LANE.half], [x1, y - LANE.half], [x1, y + LANE.half], [LANE.x0, y + LANE.half]].map(([x, yy]) => C.p(x, yy, 0));
        ctx.save();
        ctx.globalAlpha *= rowA(f);
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; poly(ctx, Q); ctx.fill();
        ctx.strokeStyle = F.rule; ctx.lineWidth = 1.4; poly(ctx, Q); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }
    ruler(ctx, C, t, e(t, T.lift + 1.0, 1.0, ease.inOutCubic), T);

    // ── things standing at the back: p. 4's lines, Table 2 ──
    const sp = e(t, T.stripUp, 1.1, ease.linear), sgo = e(t, T.stripGo, 1.0, ease.inCubic), sback = e(t, T.stripBack, 1.1, ease.outCubic);
    let SP = null;
    if (sp > 0 && (sgo < 1 || sback > 0)) {
      const away = sgo * (1 - sback);
      SP = liftPose(p4, P4_REST, STRIP_RECT, { ...STRIP, ...facing, arc: 300 }, sp);
      SP.y -= 900 * away; SP.z += 420 * away;
    }
    const drawStrip = () => {
      if (!SP) return;
      sheet(ctx, C, p4, SP, { grid: 8, shadow: 0.35 });
      highlight(ctx, C, p4, SP, L.fluent, sayWords(env, 3, 2, 7, t), { color: F.hlYellow });
      highlight(ctx, C, p4, SP, L.lower, sayWords(env, 3, 9, 14, t), { color: F.hlMint });
      highlight(ctx, C, p4, SP, L.only100, sayWords(env, 4, 1, 8, t), { color: F.hlMint });
      highlight(ctx, C, p4, SP, L.emergent, sayWords(env, 10, 4, 9, t), { color: F.hlYellow });
    };
    const stripLanded = sp >= 1;
    if (stripLanded) drawStrip();

    // p. 21 arrives at the right, Table 2 lifts and stands at the back right, p. 21 leaves
    const in21 = e(t, T.s5 - 0.05, 1.0, ease.outCubic), out21 = e(t, T.t2Lift + 0.9, 1.0, ease.inCubic);
    const P21p = arcPose({ ...P21_REST, x: P21_REST.x + 900, y: P21_REST.y + 200, rot: 0.15 }, P21_REST, in21, 140);
    if (in21 > 0 && out21 < 1) sheet(ctx, C, p21, { ...P21p, x: P21p.x + 900 * out21, y: P21p.y + 300 * out21, rot: P21p.rot + 0.12 * out21 });
    const t2p = e(t, T.t2Lift, 1.3, ease.linear), t2go = e(t, T.t2go, 1.0, ease.inCubic);
    let T2p = null;
    if (t2p > 0 && t2go < 1) {
      const hh = T2_AT.w * (T2.withCaption.y1 - T2.withCaption.y0) / (T2.withCaption.x1 - T2.withCaption.x0);
      T2p = liftPose(p21, P21_REST, T2.withCaption, { ...T2_AT, y: T2_AT.y - hh / 2, tilt: C.pitch, rot: -C.yaw * 0.5, arc: 280 }, t2p);
      T2p.y -= 1100 * t2go; T2p.z += 380 * t2go;
    }
    const drawT2 = () => {
      if (!T2p) return;
      sheet(ctx, C, p21, T2p, { grid: 8, shadow: 0.5 });
      markBox(ctx, C, p21, T2p, T2.header, e(t, T.gsm - 0.05, 0.6), { color: F.ink2, width: 2.6, pad: 5 });
      for (const b of BARS) if (b.f === 'palm') markBox(ctx, C, p21, T2p, b.cell, e(t, riseAt(b, T) - 0.05, 0.55), { color: b.k === 'std' ? PAL.stdInk : b.bad && t >= badAt(b, T) + 0.2 ? PAL.badInk : PAL.cotInk, width: 3, pad: 4 });
    };
    if (t2p >= 1) drawT2();

    // ── rows, back to front: bars, values, size tags; the ~100B sheet sits between the bars of each row ──
    const sheetA = e(t, T.gains - 0.1, 0.8, ease.inOutCubic) * (1 - e(t, T.s5, 0.6));
    const sheetH = e(t, T.gains - 0.1, 1.0, ease.outCubic);
    const eyeX = C.eye[0];
    const plateP = e(t, T.passes, T.fiftyfive + 0.05 - T.passes, ease.inOutCubic);
    const plateZ = lerp(0, PRIOR_Z, plateP);
    const labels = { names: [], sizes: [], values: [] };   // drawn after every bar, so nothing standing in front hides them
    for (const f of FAMS) {
      const a = rowA(f);
      const rb = BARS.filter((b) => b.f === f).map((b) => ({ b, p: e(t, riseAt(b, T), 0.9, ease.outCubic), d: C.p(b.x, b.y, 0).depth }))
        .filter((o) => o.p > 0);
      const far = rb.filter((o) => (o.b.x - SCALE.threshold.x) * (eyeX - SCALE.threshold.x) < 0).sort((u, w) => w.d - u.d);
      const near = rb.filter((o) => !far.includes(o)).sort((u, w) => w.d - u.d);
      const drawBar = ({ b, p }) => {
        const st = barStyle(b, t, T);
        bar3(ctx, C, b.x, b.y, b.v, { p, fill: st.fill, stroke: st.stroke, width: st.width, alpha: a });
      };
      far.forEach(drawBar);
      if (sheetA > 0) thresholdSheet(ctx, C, f, sheetA * (f === 'palm' ? 1 : a), sheetH);
      near.forEach(drawBar);
      // the plate over the PaLM row; the parts of the bars above it are drawn again on top
      if (f === 'palm' && plateP > 0) {
        priorPlate(ctx, C, plateZ, clamp(plateP * 4), e(t, T.passes - 0.15, 0.5));
        rb.filter(({ b, p }) => b.v * HZ * p > plateZ).sort((u, w) => w.d - u.d).forEach(({ b, p }) => {
          const st = barStyle(b, t, T);
          bar3(ctx, C, b.x, b.y, b.v, { p, fill: st.fill, stroke: st.stroke, width: st.width, z0: plateZ });
        });
      }
      // values on top: standard right-aligned, CoT left-aligned, so a pair reads "4.9 4.1" over its two bars
      for (const { b, p } of rb) labels.values.push(() => {
        const h = b.v * HZ * p, top = C.p(b.cx, b.y - BD / 2, h);
        const big = f === 'palm';
        const glow = b.f === 'palm' && b.k === 'cot' && b.i === 2 ? bump(t, T.fiftyfive - 0.1, 0.3, 0.8, 0.6) : 0;   // it clears the plate as the plate settles
        // a dimmed row lightens its ink rather than its alpha, so the slips still cover what stands behind them
        const ink = b.k === 'std' ? PAL.stdInk : b.bad && t >= badAt(b, T) + 0.2 ? PAL.badInk : PAL.cotInk;
        const o = {
          size: (big ? 40 : 30) * (1 + 0.15 * glow), color: mix(ink, '#FFFFFF', 0.62 * (1 - a) / 0.65),
          align: b.k === 'std' ? 'right' : 'left', valign: 'bottom', write: e(t, riseAt(b, T) + 0.2, 0.6, ease.linear),
        };
        // the large models' values sit on paper slips: they read over the row standing behind them
        const box = (big || b.r.b > 60) ? tag(ctx, S[`v_${b.val}`], top.x + (b.k === 'std' ? -8 : 8), top.y - 10, { ...o, pad: big ? 7 : 5 })
          : drawTex(ctx, S[`v_${b.val}`], top.x + (b.k === 'std' ? -4 : 4), top.y - 9, o);
        return { ...box, wt: clamp(o.write * 3) };
      });
      // size tags under each pair, once the pair stands
      T2.rows[f].forEach((r, i) => {
        const pb = BARS.find((b) => b.f === f && b.i === i && b.k === 'std');
        const w = e(t, riseAt(pb, T) + 0.1, 0.6, ease.linear);
        if (w <= 0) return;
        const s = C.p(SCALE.x[r.b], RY[f] + LANE.half - 4, 0);
        // on a light slip: a bar of the row in front may stand behind it
        labels.sizes.push((vboxes) => {
          const o = { size: 30, color: mix(F.ink2, '#FFFFFF', 0.62 * (1 - a) / 0.65), align: 'center', valign: 'top', write: w, pad: 5, fill: 'rgba(255,255,255,0.82)' };
          tag(ctx, S[`m_${r.m}`], s.x + clearX(tag(ctx, S[`m_${r.m}`], s.x, s.y + 6, { ...o, alpha: 0 }), vboxes), s.y + 6, o);
        });
      });
      // row label at the left end of the lane
      if (lanesP > 0) {
        const s = C.p(LANE.x0 - 14, RY[f], 0);
        labels.names.push(() => drawTex(ctx, S[`row_${f}`], s.x, s.y, { size: 36, color: F.ink, align: 'right', valign: 'middle', write: e(t, T.lift + 1.0 + FAMS.indexOf(f) * 0.15, 0.7, ease.linear), alpha: a }));
      }
    }
    // one pass on top of every bar and the plate: row names, size tags, then values back to front
    // one pass on top of every bar and the plate: row names, values, then size tags that step sideways off any value
    labels.names.forEach((draw) => draw());
    const vboxes = labels.values.map((draw) => draw());
    labels.sizes.forEach((draw) => draw(vboxes));
    if (sheetA > 0) {
      const s = C.p(SCALE.threshold.x, SHEET.y1, SHEET.h * sheetH);
      tag(ctx, S.thr, s.x + 14, s.y - 8, { size: 38, align: 'left', valign: 'bottom', write: e(t, T.hundred - 0.1, 0.9, ease.linear), alpha: sheetA });
    }
    // the plate's label, and its source under it
    if (plateP > 0) {
      const s = C.p(PLATE.x1 + 18, (PLATE.y0 + PLATE.y1) / 2, plateZ);
      const la = 1 - e(t, T.away, 0.6);   // the pull-back leaves the plate, its label steps aside with the p. 20 strip
      const lb = tag(ctx, S.prior, s.x + 10, s.y, { size: 36, color: PRIOR_INK, valign: 'middle', write: e(t, T.fiftyfive - 0.05, 0.8, ease.linear), alpha: la });
      tag(ctx, S.cobbe, lb.x + 12, lb.y + lb.h + 10, { size: 30, color: F.ink2, valign: 'top', write: e(t, T.came + 0.3, 0.7, ease.linear), alpha: la });
    }
    // the illustrative tag: the layout is ours, the heights are Table 2's
    {
      const s = C.p(LANE.x0, TY1 + 10, 0);
      drawTex(ctx, S.illus, s.x, s.y + 8, { size: 30, color: F.ink3, valign: 'top', write: e(t, T.lift + 1.6, 0.8, ease.linear), alpha: 1 - e(t, T.s5, 0.5) + e(t, T.s10, 0.6) });
    }

    // ── the p. 20 strip: Table 1's prior-best row, floating beside the plate's label ──
    const t1p = e(t, T.came - 0.25, 1.2, ease.linear), t1go = e(t, T.away, 0.9, ease.inCubic);
    if (t1p > 0 && t1go < 1) {
      const hh = T1_AT.w * (T1_RECT.y1 - T1_RECT.y0) / (T1_RECT.x1 - T1_RECT.x0);
      const T1p = liftPose(p20, { x: 2300, y: 1300, w: 760, rot: 0.1 }, T1_RECT, { ...T1_AT, y: T1_AT.y - hh / 2, ...facing, arc: 220 }, t1p);
      T1p.y -= 1000 * t1go; T1p.z += 300 * t1go;
      sheet(ctx, C, p20, T1p, { grid: 4, shadow: 0.15 });
      highlight(ctx, C, p20, T1p, L.prior, e(t, T.came + 0.45, 0.9, ease.linear), { color: F.hlMint });
    }

    // in flight: over everything
    if (bpP > 0 && bpP < 1) drawBlueprint();
    if (!stripLanded) drawStrip();
    if (t2p > 0 && t2p < 1) drawT2();

    // ── source stamp ──
    const stamps = [
      [0, p4, S.c4, SEC32],
      [T.s1 - 0.05, p5, S.c5, FIG4.all],
      [T.lift + 0.8, p5, S.c5, BP_RECT],
      [T.stripUp + 0.4, p4, S.c4, STRIP_RECT],
      [T.s5 - 0.05, p5, S.c5, FIG4.sub.gsm8k.palm],
      [T.t2Lift + 0.5, p21, S.c21, T2.withCaption],
      [T.came - 0.1, p20, S.c20, T1_RECT],
      [T.s10 - 0.2, p4, S.c4, grow(union(L.emergent), 4, 3)],
    ];
    let k = 0;
    while (k + 1 < stamps.length && t >= stamps[k + 1][0]) k++;
    const [, spg, sl, sr] = stamps[k];
    const dip = Math.min(1, ...stamps.slice(1).map(([ts]) => clamp(Math.abs(t - ts) / 0.2)));
    cite(ctx, spg, { label: sl, rect: sr, alpha: e(t, 0.5, 0.6) * dip, side: 'right' });
  },
};

// ── pieces ───────────────────────────────────────────────────────────────────

/**
 * clearX(box, others) — horizontal screen shift that moves a label box off the value labels it overlaps, away from
 * each one's centre. Continuous in the boxes' positions (no jumps as the camera moves); a value still being written
 * pushes in proportion (its wt).
 */
function clearX(box, others) {
  let dx = 0;
  for (let pass = 0; pass < 3; pass++) {
    for (const v of others) {
      if (!v || !(v.wt > 0)) continue;
      const x0 = box.x + dx, x1 = x0 + box.w;
      if (box.y >= v.y + v.h + 2 || box.y + box.h <= v.y - 2 || x0 >= v.x + v.w + 3 || x1 <= v.x - 3) continue;
      dx += (v.x + v.w / 2 > x0 + box.w / 2 ? v.x - 3 - x1 : v.x + v.w + 3 - x0) * v.wt;
    }
  }
  return dx;
}

/** when a bar starts to rise: small pairs on "small models", the rest on "appear", PaLM with the voice */
function riseAt(b, T) {
  if (b.f === 'palm') {
    const at = [[T.four, T.fourB], [T.nine, T.twentynine], [T.seventeen, T.fiftysix]][b.i];
    return (b.k === 'std' ? at[0] : at[1]) - 0.08;
  }
  const order = b.f === 'lamda' ? b.i : b.i + 0.5;
  if (b.r.b < 10) return T.small + 0.02 + order * 0.13;
  return T.appear - 0.1 + (b.f === 'lamda' ? (b.i - 3) * 0.22 : 0.44);
}

/** when a lower-than-standard CoT bar turns red: "doesn't help" for the small models, after "four point one" for PaLM 8B */
const badAt = (b, T) => (b.f === 'palm' ? T.fourB + 0.6 : T.doesnt - 0.05);

/** fill / outline of a bar at time t: chain of thought blue, standard grey; lower-than-standard CoT outlined red */
function barStyle(b, t, T) {
  if (b.k === 'std') return { fill: PAL.std, stroke: PAL.stdInk, width: 2 };
  if (!b.bad) return { fill: PAL.cot, stroke: PAL.cotInk, width: 2 };
  const p = e(t, badAt(b, T), 0.4);
  return { fill: PAL.cot, stroke: p > 0.5 ? PAL.badInk : PAL.cotInk, width: 2 + 1.6 * p };
}

/** the axis plate: a ruler standing at the back-left corner, ticks across its face, % labels on its left */
function ruler(ctx, C, t, p, T) {
  if (p <= 0) return;
  const R = RULER, zTop = R.top * p;
  slab(ctx, C, { x0: R.x0, x1: R.x1, y0: R.y0, y1: R.y1, z0: 0, z1: zTop }, { fill: F.paper, stroke: F.ink2, width: 1.6 });
  ctx.save();
  ctx.lineCap = 'round';
  SCALE.axis.ticks.forEach((v, i) => {
    const z = v * HZ;
    if (z > zTop + 0.5) return;
    const a = C.p(R.x0, R.y1, z), b = C.p(R.x1 + 12, R.y1, z);
    ctx.strokeStyle = F.ink2; ctx.lineWidth = v ? 1.6 : 2.2;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    drawTex(ctx, S[`t${v}`], a.x - 10, a.y, { size: 30, color: F.ink2, align: 'right', valign: 'middle', write: e(t, T.lift + 1.2 + i * 0.1, 0.5, ease.linear) });
  });
  ctx.restore();
  const s = C.p((R.x0 + R.x1) / 2, R.y1, zTop);
  drawTex(ctx, S.axis, s.x - 40, s.y - 14, { size: 30, color: F.ink2, align: 'center', valign: 'bottom', write: e(t, T.lift + 1.5, 0.8, ease.linear) });
}

/** the ~100B sheet: a translucent vertical sheet across the rows at x = threshold, drawn row by row (depth order) */
function thresholdSheet(ctx, C, f, a, h) {
  const i = FAMS.indexOf(f);
  const ys = [SHEET.y0, (RY.lamda + RY.gpt) / 2, (RY.gpt + RY.palm) / 2, SHEET.y1];
  const y0 = ys[i], y1 = ys[i + 1], x = SCALE.threshold.x, z1 = SHEET.h * h;
  const Q = [[x, y0, 0], [x, y1, 0], [x, y1, z1], [x, y0, z1]].map(([X, Y, Z]) => C.p(X, Y, Z));
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(70,80,100,0.10)'; poly(ctx, Q); ctx.fill();
  ctx.strokeStyle = F.ink2; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(Q[3].x, Q[3].y); ctx.lineTo(Q[2].x, Q[2].y); ctx.stroke();      // top edge
  if (i === 0) { ctx.beginPath(); ctx.moveTo(Q[0].x, Q[0].y); ctx.lineTo(Q[3].x, Q[3].y); ctx.stroke(); }
  if (i === 2) { ctx.beginPath(); ctx.moveTo(Q[1].x, Q[1].y); ctx.lineTo(Q[2].x, Q[2].y); ctx.stroke(); }
  ctx.setLineDash([8, 7]); ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(Q[0].x, Q[0].y); ctx.lineTo(Q[1].x, Q[1].y); ctx.stroke();      // where it meets the desk
  ctx.restore();
}

/** the prior best: an orange glass plate across the PaLM row at height z, on four thin posts from its footprint */
function priorPlate(ctx, C, z, a, foot) {
  const { x0, x1, y0, y1, th } = PLATE;
  const ring = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  ctx.save();
  ctx.globalAlpha *= foot;
  ctx.strokeStyle = PAL.prior; ctx.lineWidth = 2; ctx.setLineDash([10, 7]); ctx.lineJoin = 'round';
  poly(ctx, ring.map(([x, y]) => C.p(x, y, 0))); ctx.stroke();
  ctx.lineWidth = 1.6; ctx.setLineDash([6, 6]);
  for (const [x, y] of ring) { const b = C.p(x, y, 0), u = C.p(x, y, z); ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(u.x, u.y); ctx.stroke(); }
  ctx.restore();
  const top = ring.map(([x, y]) => C.p(x, y, z));
  const front = [C.p(x0, y1, z - th), C.p(x1, y1, z - th), C.p(x1, y1, z), C.p(x0, y1, z)];
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(255,150,60,0.24)'; poly(ctx, top); ctx.fill();
  ctx.fillStyle = 'rgba(235,120,30,0.42)'; poly(ctx, front); ctx.fill();
  ctx.strokeStyle = PAL.prior; ctx.lineWidth = 2.4; ctx.lineJoin = 'round';
  poly(ctx, top); ctx.stroke(); poly(ctx, front); ctx.stroke();
  ctx.restore();
}
