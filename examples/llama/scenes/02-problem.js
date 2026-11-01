// problem — p. 1, Section 1: Hoffmann et al.'s compute-optimal finding, the training budget it counts, the
// inference budget it leaves out (a schematic: train once, serve every request), the paper's line on the
// preferred model read verbatim and parked at the back; then a token axis on the desk: Hoffmann's 10B on 200B
// tokens, the 7B still improving after 1T, the four sizes at their real token counts. p. 3 slides in, Figure 1
// lifts and stands up, and its four curves come off it as ribbons on the same axis, still sloping down.
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, desk, edgeIn, loadPaper, findPhrase, camAt, sheet, sheetPt, highlight,
  liftPose, arcPose, slab, arrow3, contactShadow, tag, cite, sayP, sayWords, onSheet, masked, standIn, blankPage,
} from '/engine/folio.js';
import { PAL, MODELS, P1, FIG1, FIG1_TRACE, TOKENS } from './_data.js';

// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars) and redrawn figures.
const PAGES = true;

const S = {
  schematic: '\\text{schematic}',
  train: '\\text{train once}',
  serve: '\\text{serve: every request}',
  axis: '\\text{training tokens}',
  hoff: '\\text{10B model, 200B tokens}',
  hoffCite: '\\text{Hoffmann et al. (2022)}',
  m7long: '\\text{7B: still improving after 1T}',
  m7: '\\text{7B}', m13: '\\text{13B}', m33: '\\text{33B}', m65: '\\text{65B}',
  traced: '\\text{traced from Figure 1}',
  redrawn: '\\text{Figure 1, redrawn}',
  leg7: '\\text{LLaMA 7B}', leg13: '\\text{LLaMA 13B}', leg33: '\\text{LLaMA 33B}', leg65: '\\text{LLaMA 65B}',
  c1: '\\text{p.~1}\\;\\cdot\\;\\text{Section 1}',
  c3: '\\text{p.~3}\\;\\cdot\\;\\text{Figure 1}',
};
const TICKS = [0, 200, 400, 600, 800, 1000, 1200, 1400];
const TICK_TEX = TICKS.map((v) => (v ? `${v}\\text{B}` : '0'));

// The p. 1 footnote's e-mail addresses are painted out (briefing: never zoom in on them; the reading beats
// come close to that footnote). Same rects in 01-cover and 02-problem, so the page matches across the cut.
const EMAILS = [{ x0: 683, y0: 2063, x1: 812, y1: 2091 }, { x0: 194, y0: 2091, x1: 748, y1: 2118 }];

// ── world layout (desk px) ───────────────────────────────────────────────────
const PAGE = { x: 640, y: 560, w: 760, rot: -0.01 };            // p. 1 at rest, as in 01-cover; p. 3 lands on the same spot
const SC = PAGE.w / 1654;
const wx = (u) => PAGE.x + (u - 827) * SC, wy = (v) => PAGE.y + (v - 1169.5) * SC;

// s1–s2 schematic: a blank sheet to the right of the page, one "train once" slab, a row of thin "serve" slabs
const SCH = { x: 1370, y: 860, w: 640, pw: 1280, ph: 600 };
const TRAIN = { x0: 1095, x1: 1185, y0: 815, y1: 905, h: 100 };
const SERVE = { x0: 1215, step: 26, n: 34, t: 9, y0: 825, y1: 895, h: 62 };

// s3: the verbatim line, lifted as one card (line 2's ", and although it may be cheaper" painted out on the copy)
const CARD = { x0: 193, y0: 1936, x1: 808, y1: 2006 };
const CARD_MASK = [{ x0: 429, y0: 1974, x1: 812, y1: 2005 }];
const CARD_TO = { x: 760, y: -60, z: 0, w: 600, tilt: 0.85, arc: 240 };

// s4–s8 the token axis: x = billion tokens, one lane per model (back → front), bars and ribbons share it
const AX = { x0: 1100, kx: 0.42, yAxis: 625 };
const ax = (tok) => AX.x0 + tok * AX.kx;
const LANE = { hoff: 300, m7: 370, m13: 440, m33: 510, m65: 580 };
const BAR = { d: 40, h: 20 };
const CH = { x: 1410, y: 470, w: 760, pw: 1520, ph: 840 };      // the chart's paper sheet under the axis
const KZ = 400;                                                // ribbon height: world px per unit of loss above 1.5

// s7: Figure 1 stands up where it lies on p. 3 (bottom edge fixed, a little larger), left of the axis
const FIGW = 540, FIGH = (FIG1.all.y1 - FIG1.all.y0) * FIGW / (FIG1.all.x1 - FIG1.all.x0);
const FIG_TO = { x: wx((FIG1.all.x0 + FIG1.all.x1) / 2), y: wy(FIG1.all.y1) - FIGH / 2, z: 0, w: FIGW, tilt: 0.9, arc: 70 };
const LEGEND_Y = { m7: 577, m13: 608, m33: 639, m65: 670 };     // legend text centres (page px, p. 3)

let p1, p1q, p3, L;

/** PAGES = false: Figure 1 redrawn in place on p. 3's stand-in (frame, grid, the traced curves, the legend), page px */
function drawFig1(g) {
  const A = FIG1.axis, fr = FIG1.frame, X = (tok) => A.x0 + tok * A.kx, Y = (loss) => A.y22 + (A.lossMax - loss) * A.ky;
  g.fillStyle = F.paper; g.fillRect(fr.x0 - 4, fr.y0 - 4, fr.x1 - fr.x0 + 8, fr.y1 - fr.y0 + 8);
  g.strokeStyle = '#DADADA'; g.lineWidth = 1.5;
  for (let k = 0; k <= 1400; k += 200) { g.beginPath(); g.moveTo(X(k), fr.y0); g.lineTo(X(k), fr.y1); g.stroke(); }
  for (let l = 1.5; l <= 2.2001; l += 0.1) { g.beginPath(); g.moveTo(fr.x0, Y(l)); g.lineTo(fr.x1, Y(l)); g.stroke(); }
  g.save();
  g.beginPath(); g.rect(fr.x0, fr.y0, fr.x1 - fr.x0, fr.y1 - fr.y0); g.clip();
  g.lineWidth = 3.2; g.lineJoin = 'round';
  MODELS.forEach((m) => { g.strokeStyle = m.color; g.beginPath(); FIG1_TRACE[m.key].forEach(([tok, loss], i) => (i ? g.lineTo(X(tok), Y(loss)) : g.moveTo(X(tok), Y(loss)))); g.stroke(); });
  g.restore();
  g.strokeStyle = F.ink; g.lineWidth = 2; g.strokeRect(fr.x0, fr.y0, fr.x1 - fr.x0, fr.y1 - fr.y0);
  const lg = FIG1.legend;
  g.fillStyle = F.paper; g.strokeStyle = '#CCCCCC'; g.fillRect(lg.x0, lg.y0, lg.x1 - lg.x0, lg.y1 - lg.y0); g.strokeRect(lg.x0, lg.y0, lg.x1 - lg.x0, lg.y1 - lg.y0);
  MODELS.forEach((m) => {
    const y = LEGEND_Y[m.key];
    g.strokeStyle = m.color; g.lineWidth = 3.2; g.beginPath(); g.moveTo(lg.x0 + 12, y); g.lineTo(lg.x0 + 56, y); g.stroke();
    drawTex(g, S[`leg${m.short.replace('B', '')}`], 1306, y, { size: 23, color: F.ink, valign: 'middle' });
  });
}

/** a sheet put down at `base`, coming from (dx, dy) off it: the kit's arcPose with an ease-out */
const arrive = (base, p, { dx = 0, dy = 800, rot = 0.1, arc = 170 } = {}) =>
  arcPose({ ...base, x: base.x + dx, y: base.y + dy, rot: (base.rot || 0) + rot }, base, ease.outCubic(clamp(p)), arc);
/** a sheet taken off the desk by (dx, dy): arcPose with an ease-in */
const leave = (base, p, { dx = 1600, dy = 0, rot = 0, arc = 90 } = {}) =>
  arcPose(base, { ...base, x: base.x + dx, y: base.y + dy, rot: (base.rot || 0) + rot }, ease.inCubic(clamp(p)), arc);
/** ink line under page-px span (u0..u1) at v, drawn on the sheet (kit candidate) */
function inkUnder(ctx, C, page, pose, u0, u1, v, p, { color = F.ink, width = 2.4 } = {}) {
  if (p <= 0) return;
  const a = onSheet(C, page, pose, u0, v), b = onSheet(C, page, pose, lerp(u0, u1, clamp(p)), v);
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width * a.k; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.restore();
}
/** a token bar lying along the axis in its lane: 0 → tok (grown by p) */
function bar(ctx, C, lane, tok, p, fill, stroke, alpha = 1) {
  if (p <= 0 || alpha <= 0) return;
  slab(ctx, C, { x0: AX.x0, x1: AX.x0 + Math.max(2, tok * AX.kx * p), y0: lane - BAR.d / 2, y1: lane + BAR.d / 2, z0: 0, z1: BAR.h }, { fill, stroke, width: 2, alpha });
}

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    TICK_TEX.forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [1, 3]);
    const pg = (n) => (PAGES ? P.page(n) : standIn(P.page(n)));
    p1 = masked(pg(1), EMAILS, { pad: 0 });
    p3 = PAGES ? P.page(3) : standIn(P.page(3), { blank: [FIG1.frame], draw: drawFig1 });
    p1q = masked(p1, CARD_MASK, { pad: 1 });
    const legend = (s, k) => findPhrase(p3, s).map((l) => ({ ...l, y0: LEGEND_Y[k] - 13, y1: LEGEND_Y[k] + 10 }));
    L = {
      hoffCite: findPhrase(p1, 'Hoffmann et al. (2022)'),   // the left-column citation (first on the page)
      hoff0: findPhrase(p1, 'for a given compute budget, the best performances are not achieved by the largest mod- els, but by smaller models trained on more data'),
      hoffA: findPhrase(p1, 'for a given compute budget, the best performances are not achieved by the largest mod- els,'),   // voice: "for a fixed training budget,"
      hoffB: findPhrase(p1, 'but by smaller models trained on more data'),                                                     // voice: "smaller models trained on more data"
      trainBudget: findPhrase(p1, 'training compute budget'),
      disregards: findPhrase(p1, 'this objective disregards the inference budget, which becomes critical when serving a language model at scale'),
      infBudget: findPhrase(p1, 'inference budget'),
      preferred: findPhrase(p1, 'the preferred model is not the fastest to train but the fastest at inference'),
      recommends: findPhrase(p1, 'Hoffmann et al. (2022) recommends training a 10B model on 200B tokens'),
      improve: findPhrase(p1, 'we find that the performance of a 7B model continues to improve even after 1T tokens'),
      more: findPhrase(p1, 'by training on more tokens than what is typically used'),
      caption: findPhrase(p3, 'Training loss over train tokens'),
      legend: { m7: legend('LLaMA 7B', 'm7'), m13: legend('LLaMA 13B', 'm13'), m33: legend('LLaMA 33B', 'm33'), m65: legend('LLaMA 65B', 'm65') },
    };
    L.trainBudget[0].x1 = 500;   // stop before the full stop after "budget"
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      hoffmann: q.w(0, 'Hoffmann'), for0: q.w(0, 'for'), s1: q.s(1), training1: q.w(1, 'training'),
      s2: q.s(2), scale: q.w(2, 'scale'), inference: q.w(2, 'inference'),
      s3: q.s(3), e3: q.e(3),
      s4: q.s(4), tenB: q.w(4, 'ten-billion-parameter'), two: q.w(4, 'two'), e4: q.e(4),
      s5: q.s(5), still5: q.w(5, 'still'), e5: q.e(5),
      s6: q.s(6), smaller: q.w(6, 'smaller'), more: q.w(6, 'more'), tokens6: q.w(6, 'tokens'),
      s7: q.s(7), training7: q.w(7, 'training'), all7: q.w(7, 'all'),
      s8: q.s(8), stops: q.w(8, 'stops'), still8: q.w(8, 'still'),
    };
    T.lift = T.e3 + 0.12;
    T.ribbons = T.s8 - 0.65;

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    const C = camAt(t, [
      { t: 0, tx: 495, ty: 772, zoom: 1.78, pitch: 0.2 },
      { t: 0.4, dur: 6.4, tx: 505, zoom: 1.84 },
      { t: T.s1 - 0.35, dur: 1.3, tx: 1010, ty: 850, zoom: 1.25, pitch: 0.45 },
      { t: T.s2 + 0.2, dur: 4.6, tx: 1035, zoom: 1.28 },
      { t: T.s3 - 0.35, dur: 1.3, tx: 495, ty: 908, zoom: 2.1, pitch: 0.2 },
      { t: T.s3 + 1.0, dur: 3.4, tx: 505, zoom: 2.18 },
      { t: T.s4 - 0.15, dur: 1.4, tx: 800, ty: 350, zoom: 1.65, pitch: 0.3 },
      { t: T.tenB - 0.2, dur: 1.6, tx: 1230, ty: 430, zoom: 1.28, pitch: 0.8 },
      { t: T.s5, dur: 9.0, tx: 1255, zoom: 1.32 },
      { t: T.s7 - 0.4, dur: 1.4, tx: 930, ty: 440, zoom: 1.2, pitch: 0.55 },
      { t: T.ribbons - 0.1, dur: 1.4, tx: 1180, ty: 420, zoom: 1.08, pitch: 0.9 },
      { t: T.ribbons + 1.6, dur: 3.0, yaw: 0.22 },
    ]);

    // ── pages: p. 1 (as the cover left it), pushed off for p. 3 ──
    const out1 = e(t, T.s7 - 0.35, 1.1, ease.linear);
    const PG = leave(PAGE, out1, { dx: -1500, dy: 60, rot: -0.08, arc: 80 });
    const in3 = e(t, T.s7 - 0.2, 1.2, ease.linear);
    const PG3 = arrive(PAGE, in3, { dx: -150, dy: 1000, rot: 0.1, arc: 170 });
    if (in3 > 0) sheet(ctx, C, p3, PG3);
    if (out1 < 1) {
      sheet(ctx, C, p1, PG);
      highlight(ctx, C, p1, PG, L.hoffCite, e(t, T.hoffmann - 0.05, 0.5, ease.linear), { color: F.hlMint });
      highlight(ctx, C, p1, PG, L.hoffA, sayWords(env, 0, 8, 12, t), { color: F.hlMint });
      highlight(ctx, C, p1, PG, L.hoffB, sayWords(env, 0, 13, 20, t), { color: F.hlMint });
      inkUnder(ctx, C, p1, PG, L.trainBudget[0].x0, L.trainBudget[0].x1, L.trainBudget[0].y1 + 3, e(t, T.training1 - 0.05, 0.55, ease.linear), { width: 2.4 });
      highlight(ctx, C, p1, PG, L.disregards, sayWords(env, 2, 0, 13, t), { color: F.hlMint });
      inkUnder(ctx, C, p1, PG, L.infBudget[0].x0, L.infBudget[0].x1, L.infBudget[0].y1 + 3, e(t, T.inference - 0.05, 0.8, ease.linear), { width: 2.4 });
      highlight(ctx, C, p1, PG, L.preferred, sayP(env, 3, t), { color: F.hlYellow });
      highlight(ctx, C, p1, PG, L.recommends, sayWords(env, 4, 0, 10, t), { color: F.hlMint });
      highlight(ctx, C, p1, PG, L.improve, sayWords(env, 5, 0, 10, t), { color: F.hlMint });
      highlight(ctx, C, p1, PG, L.more, sayWords(env, 6, 5, 13, t), { color: F.hlMint });
    }
    if (in3 > 0) highlight(ctx, C, p3, PG3, L.caption, sayWords(env, 7, 2, 3, t), { color: F.hlMint });

    // ── s1–s2: the schematic (train once; serve every request) ──
    const schIn = e(t, T.s1 - 0.2, 1.1, ease.linear), schOut = e(t, T.s3 - 0.3, 1.2, ease.linear);
    if (schIn > 0 && schOut < 1) {
      const pose = schOut > 0 ? leave({ x: SCH.x, y: SCH.y, w: SCH.w }, schOut, { dx: 1500 }) : arrive({ x: SCH.x, y: SCH.y, w: SCH.w }, schIn, { dx: 900, dy: 200, rot: -0.08, arc: 140 });
      const sch = blankPage('llama-02-schematic', SCH.pw, SCH.ph, (g) => {
        g.strokeStyle = F.rule; g.lineWidth = 3; g.setLineDash([14, 12]);
        g.beginPath(); g.moveTo(80, 520); g.lineTo(SCH.pw - 60, 520); g.stroke();
      }, { scale: 0.5 });
      sheet(ctx, C, sch, pose, { grid: 4 });
      const dx = pose.x - SCH.x, dy = pose.y - SCH.y;
      const tr = e(t, T.s1 + 0.25, 0.7, ease.outCubic);
      if (tr > 0) contactShadow(ctx, C, { x0: TRAIN.x0 + dx, y0: TRAIN.y0 + dy, x1: TRAIN.x1 + dx, y1: TRAIN.y1 + dy }, { alpha: clamp(tr * 2) });
      if (tr > 0) slab(ctx, C, { x0: TRAIN.x0 + dx, x1: TRAIN.x1 + dx, y0: TRAIN.y0 + dy, y1: TRAIN.y1 + dy, z0: 0, z1: Math.max(1, TRAIN.h * tr) }, { fill: PAL.otherFill, stroke: F.ink2, width: 2.2, alpha: clamp(tr * 3) });
      for (let i = SERVE.n - 1; i >= 0; i--) {
        const p = e(t, T.s2 + i * 0.045, 0.35, ease.outCubic);
        if (p <= 0) continue;
        const x0 = SERVE.x0 + i * SERVE.step + dx;
        slab(ctx, C, { x0, x1: x0 + SERVE.t, y0: SERVE.y0 + dy, y1: SERVE.y1 + dy, z0: 0, z1: Math.max(1, SERVE.h * p) }, { fill: F.paper, stroke: F.ink2, width: 1.6, alpha: clamp(p * 3) });
      }
      const la = 1 - schOut;
      if (tr > 0) { const r = C.p((TRAIN.x0 + TRAIN.x1) / 2 + dx, TRAIN.y0 + dy, TRAIN.h + 18); tag(ctx, S.train, r.x, r.y, { size: 42, align: 'center', valign: 'bottom', write: e(t, T.s1 + 0.5, 0.8, ease.linear), alpha: la }); }
      const sv = e(t, T.s2 + 0.3, 0.9, ease.linear);
      if (sv > 0) { const r = C.p(SERVE.x0 + 5 * SERVE.step + dx, SERVE.y0 + dy, SERVE.h + 18); tag(ctx, S.serve, r.x, r.y, { size: 42, align: 'left', valign: 'bottom', write: sv, alpha: la }); }
      if (tr > 0) { const r = C.p(SCH.x - SCH.w / 2 + 24 + dx, SCH.y + SCH.w * SCH.ph / SCH.pw / 2 - 20 + dy, 0); tag(ctx, S.schematic, r.x, r.y, { size: 32, color: F.ink2, align: 'left', valign: 'bottom', write: e(t, T.s1 + 0.6, 0.6, ease.linear), alpha: la }); }
    }

    // ── s4–s8: the token axis on its sheet ──
    const chIn = e(t, T.s4 + 0.7, 1.2, ease.linear);
    if (chIn > 0) {
      const pose = arrive({ x: CH.x, y: CH.y, w: CH.w }, chIn, { dx: 1100, dy: -100, rot: 0.06, arc: 150 });
      const ch = blankPage('llama-02-chart', CH.pw, CH.ph, (g) => {
        const u = (x) => (x - (CH.x - CH.w / 2)) * (CH.pw / CH.w), v = (y) => (y - (CH.y - CH.w * CH.ph / CH.pw / 2)) * (CH.pw / CH.w);
        g.strokeStyle = F.rule; g.lineWidth = 2;
        TICKS.forEach((k) => { g.beginPath(); g.moveTo(u(ax(k)), v(LANE.hoff - 40)); g.lineTo(u(ax(k)), v(AX.yAxis)); g.stroke(); });
        g.strokeStyle = F.ink; g.lineWidth = 4;
        g.beginPath(); g.moveTo(u(ax(0)), v(AX.yAxis)); g.lineTo(u(ax(1400)), v(AX.yAxis)); g.stroke();
        TICKS.forEach((k) => { g.beginPath(); g.moveTo(u(ax(k)), v(AX.yAxis)); g.lineTo(u(ax(k)), v(AX.yAxis) + 18); g.stroke(); });
      }, { scale: 0.5 });
      sheet(ctx, C, ch, pose, { grid: 4 });
      const tl = e(t, T.s4 + 1.6, 1.0, ease.linear);
      if (tl > 0 && chIn >= 1) {
        TICKS.forEach((k, i) => { const r = C.p(ax(k), AX.yAxis + 14, 0); drawTex(ctx, TICK_TEX[i], r.x, r.y, { size: 32, color: F.ink2, align: 'center', valign: 'top', write: clamp(tl * 1.6 - i * 0.08) }); });
        const r = C.p(ax(700), AX.yAxis + 84, 0);
        drawTex(ctx, S.axis, r.x, r.y, { size: 38, color: F.ink, align: 'center', valign: 'top', write: tl });
      }
    }

    // ── bars: Hoffmann 200B (s4), 7B 1000 (s5), the other three (s6); they sink when Figure 1 arrives (s7) ──
    const sink = e(t, T.s7 - 0.2, 0.8, ease.inCubic), ba = 1 - sink;
    const gH = e(t, T.two - 0.05, 1.5, ease.inOutCubic);
    const g7 = e(t, T.still5, T.e5 - T.still5, ease.inOutQuad);
    const gOther = { m13: e(t, T.smaller, 1.2, ease.inOutCubic), m33: e(t, T.more, 1.4, ease.inOutCubic), m65: e(t, T.tokens6, 1.4, ease.inOutCubic) };
    const bars = [
      { lane: LANE.hoff, tok: TOKENS.hoffmann.tokensB, p: gH, fill: PAL.otherFill, stroke: PAL.other },
      ...MODELS.map((m) => ({ key: m.key, lane: LANE[m.key], tok: TOKENS.trained[m.key], p: m.key === 'm7' ? g7 : gOther[m.key], fill: m.fill, stroke: m.color })),
    ];
    if (ba > 0) bars.forEach((b) => bar(ctx, C, b.lane, b.tok, b.p, b.fill, b.stroke, ba));
    // bar labels, at the bar's end
    const lab = (src, tok, lane, w, a, color, size = 36) => {
      if (w <= 0 || a <= 0) return;
      const r = C.p(ax(tok) + 14, lane, BAR.h / 2);
      tag(ctx, src, r.x, r.y, { size, color, align: 'left', valign: 'middle', write: w, alpha: a, pad: 9 });
    };
    lab(S.hoff, 200, LANE.hoff, e(t, T.two + 0.9, 0.9, ease.linear), ba, F.ink);
    { const r = C.p(ax(200) + 14, LANE.hoff - 52, BAR.h / 2); if (gH > 0.5 && ba > 0) drawTex(ctx, S.hoffCite, r.x + 9, r.y, { size: 30, color: F.ink2, align: 'left', valign: 'middle', write: e(t, T.two + 1.3, 0.9, ease.linear), alpha: ba }); }
    const long7 = 1 - e(t, T.smaller - 0.3, 0.4, ease.linear);
    lab(S.m7long, 1000, LANE.m7, e(t, T.e5 - 0.2, 1.0, ease.linear), ba * long7, PAL.m7);
    lab(S.m7, 1000, LANE.m7, e(t, T.smaller, 0.5, ease.linear), ba, PAL.m7, 38);
    MODELS.slice(1).forEach((m) => lab(S[m.key], TOKENS.trained[m.key], LANE[m.key], clamp((gOther[m.key] - 0.75) * 4), ba, m.color, 38));

    // ── s3 → s7: the verbatim line lifts off, parks at the back, and leaves with p. 1 ──
    const lp = e(t, T.lift, 1.3, ease.linear);
    if (lp > 0 && out1 < 1) {
      const cp = leave(liftPose(p1q, PAGE, CARD, CARD_TO, lp), out1, { dx: -1500, dy: 60, arc: 80 });
      sheet(ctx, C, p1q, cp, { grid: 6, shadow: 0.5 });
      highlight(ctx, C, p1q, cp, L.preferred, 1);
    }

    // ── s7: Figure 1 lifts off p. 3 and stands at the back of the axis; its legend, in turn ──
    const fp = e(t, T.s7 + 0.75, 1.3, ease.linear);
    let FP = null;
    if (fp > 0 && in3 >= 1) {
      FP = liftPose(p3, PG3, FIG1.all, FIG_TO, fp);
      sheet(ctx, C, p3, FP, { grid: 8, shadow: 0.5 });
      MODELS.forEach((m, i) => highlight(ctx, C, p3, FP, L.legend[m.key], e(t, T.all7 + i * 0.22, 0.3, ease.linear), { color: m.fill, alpha: 1 }));
      if (!PAGES) { const r = onSheet(C, p3, FP, FIG1.all.x0, FIG1.all.y0); tag(ctx, S.redrawn, r.x, r.y - 8, { size: 32, color: F.ink2, align: 'left', valign: 'bottom', write: e(t, T.s7 + 1.4, 0.6, ease.linear) }); }
    }

    // ── s8: the four curves come off the standing figure as ribbons on the axis ──
    if (FP && t > T.ribbons) {
      const order = ['m7', 'm13', 'm33', 'm65'];   // back → front
      order.forEach((k, i) => {
        const m = MODELS.find((x) => x.key === k);
        const r = e(t, T.ribbons + i * 0.12, 1.0, ease.inOutCubic);
        if (r <= 0) return;
        const tr = FIG1_TRACE[k], last = tr.at(-1)[0];
        const onFig = (tok, loss) => sheetPt(p3, FP, FIG1.axis.x0 + tok * FIG1.axis.kx, FIG1.axis.y22 + (FIG1.axis.lossMax - loss) * FIG1.axis.ky);
        const at = (tok, loss) => { const a = onFig(tok, loss), b = [ax(tok), LANE[k], (loss - FIG1.axis.lossMin) * KZ]; return C.p(lerp(a[0], b[0], r), lerp(a[1], b[1], r), lerp(a[2], b[2], r)); };
        const top = tr.map(([tok, loss]) => at(tok, loss));
        const base = tr.map(([tok]) => at(tok, FIG1.axis.lossMin));
        const glow = e(t, T.still8 - 0.05, 0.6, ease.inOutCubic);
        ctx.save();
        // the curtain under the curve
        ctx.globalAlpha *= 0.42;
        ctx.fillStyle = m.fill;
        ctx.beginPath(); top.forEach((p, j) => (j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); base.slice().reverse().forEach((p) => ctx.lineTo(p.x, p.y)); ctx.closePath(); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = m.color; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.lineWidth = 3 * top[0].k;
        ctx.beginPath(); top.forEach((p, j) => (j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
        // s8 "still sloping down": the last 100B tokens brighten
        if (glow > 0) {
          const seg = tr.filter(([tok]) => tok >= last - 100);
          const P = seg.map(([tok, loss]) => at(tok, loss)), B = seg.map(([tok]) => at(tok, FIG1.axis.lossMin));
          ctx.save();
          ctx.globalAlpha *= 0.75 * glow;
          ctx.fillStyle = m.fill;
          ctx.beginPath(); P.forEach((p, j) => (j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); B.slice().reverse().forEach((p) => ctx.lineTo(p.x, p.y)); ctx.closePath(); ctx.fill();
          ctx.restore();
          ctx.lineWidth = (3 + 4 * glow) * P[0].k;
          ctx.beginPath(); P.forEach((p, j) => (j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
        }
        ctx.restore();
        // "when training stops": an end cap at the last point (1000 for 7B and 13B, 1400 for 33B and 65B)
        const cap = e(t, T.stops - 0.25, 0.5, ease.outCubic);
        if (cap > 0 && r >= 1) {
          const [tok, loss] = tr.at(-1);
          arrow3(ctx, C, [[ax(tok), LANE[k], 0], [ax(tok), LANE[k], (loss - FIG1.axis.lossMin) * KZ]], cap, { color: F.ink, width: 3.2, head: false });
          const tp = C.p(ax(tok), LANE[k], (loss - 1.5) * KZ);
          ctx.save(); ctx.fillStyle = m.color; ctx.strokeStyle = F.ink; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(tp.x, tp.y, 6.5 * cap * tp.k, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
        }
        // lane label at the end, as the bars had it
        if (r >= 1) { const lp = C.p(ax(last) + 20, LANE[k], (tr.at(-1)[1] - FIG1.axis.lossMin) * KZ); tag(ctx, S[k], lp.x, lp.y, { size: 38, color: m.color, align: 'left', valign: 'middle', alpha: e(t, T.ribbons + 1.1 + i * 0.12, 0.4, ease.linear), pad: 9 }); }
      });
      const ta = e(t, T.ribbons + 1.2, 0.6, ease.linear);
      if (ta > 0) { const r = C.p(ax(600), LANE.m7, 330); tag(ctx, S.traced, r.x, r.y, { size: 34, color: F.ink2, align: 'center', valign: 'bottom', write: ta }); }
    }

    // ── source stamp ──
    let page = p1, rect = union(L.hoff0), label = S.c1;
    if (t >= T.s1 - 0.3) rect = { x0: 192, y0: 1775, x1: 812, y1: 2007 };
    if (t >= T.s4 - 0.2) rect = { x0: 846, y0: 596, x1: 1464, y1: 1000 };
    if (t >= T.s7 + 0.3) { page = p3; rect = FIG1.all; label = S.c3; }
    cite(ctx, page, { label, rect, alpha: e(t, 0.6, 0.6), side: 'right' });
  },
};

function union(rs) { return { x0: Math.min(...rs.map((r) => r.x0)) - 6, y0: Math.min(...rs.map((r) => r.y0)) - 6, x1: Math.max(...rs.map((r) => r.x1)) + 6, y1: Math.max(...rs.map((r) => r.y1)) + 6 }; }
