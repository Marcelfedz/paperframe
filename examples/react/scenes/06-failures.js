// failures — p. 6 arrives with p. 33 beside it; the 200 hand-read runs as four rows of 50 dots;
// Table 2 lifts off and stands up behind its failure rows grown into paired 3D bars (ReAct | CoT,
// from 0, per method). p. 33's hallucination example flies in for CoT's 56%; ReAct's 0% stays a flat
// outline with its 6% false positives next to it. Back on p. 6 for the loop (an illustrative ring jams
// beside the paragraph, footnote 4 tagged as the authors' guess), the non-informative-search strip and
// p. 33's "Could not find goddess frigg." come to the chart for 23%. Then p. 15: Figure 5's two edited
// thoughts turn panel (a)'s ✗ into panel (b)'s ✓.
// Guardrails: percentages are within each group (never counts); CoT's search error is a dash, not 0;
// the ring is illustrative; greedy decoding is the authors' suspicion; Figure 5 is ALFWorld.
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, texSize, desk, edgeIn, loadPaper, findPhrase, cameraAt, sheet, sheetPt, highlight,
  markBox, liftPose, cite, sayWords, onSheet, blankPage, win, mix,
} from '/engine/folio.js';
import { PAL, LOOP, T2, P33, FIG5, FIG5_STEPS, FIG5_LINES } from './_data.js';

// ── desk layout (world px) ──
const P6R = { x: 860, y: 560, w: 900, rot: -0.012 };            // p. 6 at rest
const P33R = { x: -140, y: 640, w: 900, rot: 0.03 };            // p. 33 beside it, left
const GRIDR = { x: 1585, y: 330, w: 500, rot: 0.018 };          // the 4 × 50 dot sheet, right of p. 6
const GRID = { w: 1100, h: 700 };                               // its page px

// the stage: Table 2 standing at the back, four pairs in front, a reading zone on the right
const PX = [2560, 2810, 3060, 3310];                            // pair centres (Reasoning, Search, Hallucination, Label)
const BW = 82, BG = 12, BY0 = 740, BY1 = 822, ZS = 4.4;         // bar width, gap in a pair, footprint y, world px per %
const AXX = 2420;                                               // axis x
const TAB = { cx: 2700, yb: 230, w: 1000, tilt: 0.95 };          // standing Table 2: centre x, bottom edge y, width
const RZ = { cx: 3680, w: 860, tilt: 0.92 };                    // reading zone (lifted strips stand here)
const FP = { x: 3700, y0: 790, y1: 850, bw: 66 };              // "right answers" pair: centre x, footprint y
const STAGE = { tx: 3150, ty: 450, zoom: 0.92, pitch: 0.92, dist: 2600 };

// the loop ring beside p. 6 (LOOP geometry scaled down)
const RING = { x: 1560, y: 610, s: 0.36, ss: 0.28 };

// p. 15 in front of the stage
const P15R = { x: 3150, y: 1980, w: 1250, rot: 0.006 };

// crops (page px)
const CSTRIP = { x0: 292, y0: 1101, x1: 1412, y1: 1166 };        // p. 6, Section 3.3 C): "… Non- / informative search, which counts for 23% …"
const S3 = { x0: 296, y0: 486, x1: 1410, y1: 1092 };             // p. 6, the "ReAct vs. CoT" + A) + B) paragraphs (stamp)

const S = {
  c6s: '\\text{p. 6}\\;\\cdot\\;\\text{Section 3.3}',
  c6t: '\\text{p. 6}\\;\\cdot\\;\\text{Table 2}',
  c33: '\\text{p. 33}\\;\\cdot\\;\\text{Appendix E.1}',
  c15: '\\text{p. 15}\\;\\cdot\\;\\text{Figure 5}',
  head: '200\\text{ runs, labelled by hand}',
  rr: '\\text{ReAct, right}', rw: '\\text{ReAct, wrong}', cr: '\\text{CoT, right}', cw: '\\text{CoT, wrong}',
  n50: '50',
  wrong: '\\text{wrong answers}', right: '\\text{right answers}', fpos: '\\text{false positive}',
  react: '\\texttt{ReAct}', cot: '\\texttt{CoT}',
  ty0a: '\\text{Reasoning}', ty0b: '\\text{error}', ty1a: '\\text{Search result}', ty1b: '\\text{error}',
  ty2a: '\\text{Hallucination}', ty3a: '\\text{Label}', ty3b: '\\text{ambiguity}',
  a0: '0', a20: '20\\%', a40: '40\\%', a60: '60\\%',
  thought: '\\text{Thought}', action: '\\text{Action}', obs: '\\text{Observation}',
  illus: '\\text{illustrative}', x2: '\\times 2', x3: '\\times 3',
  guess: "\\text{authors' guess}",
};
const pct = (v) => `${v}\\%`;
[...T2.rows.flatMap((r) => [r.react, r.cot])].filter((v) => v != null).forEach((v) => { S[`v${v}`] = pct(v); });

const FAIL = T2.rows.filter((r) => r.group === 'failure');      // Reasoning, Search, Hallucination, Label (T2.rows order)
const FPROW = T2.rows.find((r) => r.type === 'False positive');
const HAL = FAIL.find((r) => r.type === 'Hallucination');
const cell = (row, col) => ({ x0: T2.cols[col].x0 - 2, x1: T2.cols[col].x1 + 2, y0: row.y0, y1: row.y1 });
const T2CROP = { ...T2.withCaption, y1: T2.withCaption.y1 + 8 };   // + the caption's descenders

let p6, p15, p33, L;

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [6, 15, 33]);
    p6 = P.page(6); p15 = P.page(15); p33 = P.page(33);
    L = {
      total: findPhrase(p6, 'thus 200 examples in total'),
      sampled: findPhrase(p6, 'randomly sampled 50 trajectories with correct and incorrect answers'),
      repeat: findPhrase(p6, 'the model repetitively generates the previous thoughts and actions'),
      jump: findPhrase(p6, 'jump out of the loop'),
      foot: findPhrase(p6, 'We suspect that this could be due to the sub-optimal greedy decoding procedure'),
      nonInf: findPhrase(p6, 'Non- informative search, which counts for 23% of the error cases'),
      label1916: findPhrase(p33, '1916 (Label: 1909)'),
      frigg: findPhrase(p33, 'Could not find goddess frigg.'),
      byHuman: findPhrase(p15, 'By a human simply editing two thoughts'),
    };
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      two: q.w(0, 'two'), right0: q.w(0, 'right'), wrong0: q.w(0, 'wrong'), both: q.w(0, 'both'), methods: q.w(0, 'methods'),
      sorted: q.w(0, 'sorted'), failures0: q.w(0, 'failures'), table: q.w(0, 'table'),
      s1: q.s(1), invention: q.w(1, 'invention'), fiftySix: q.w(1, 'fifty-six'), hallu: q.w(1, 'hallucination'),
      s2: q.s(2), zero: q.w(2, 'zero'),
      s3: q.s(3), six: q.w(3, 'six'), hallucinated: q.w(3, 'hallucinated'),
      s4: q.s(4), own: q.w(4, 'own'),
      s5: q.s(5), failures: q.w(5, 'failures'), including: q.w(5, 'including'), repeating: q.w(5, 'repeating'),
      stuck: q.w(5, 'stuck'), loop: q.w(5, 'loop'),
      s6: q.s(6), searches: q.w(6, 'searches'), nothing: q.w(6, 'nothing'), useful: q.w(6, 'useful'), derail: q.w(6, 'derail'),
      run6: q.w(6, 'run'),
      s7: q.s(7), thoughts7: q.w(7, 'thoughts'), person: q.w(7, 'person'),
      s8: q.s(8), editing: q.w(8, 'editing'), thoughts8: q.w(8, 'thoughts'), failed: q.w(8, 'failed'), into: q.w(8, 'into'),
      success: q.w(8, 'success'),
    };

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    const f15 = sheetPt(p15, P15R, 852, 505);
    const C = cameraAt(t, [
      { t: 0, tx: 700, ty: 560, zoom: 0.78, pitch: 0.16, dist: 2400 },
      { t: 0.75, dur: 1.2, tx: 1200, ty: 330, zoom: 1.45, pitch: 0.2 },                         // the paragraph + the dot sheet
      { t: T.sorted - 0.25, dur: 1.0, tx: 960, ty: 250, zoom: 1.3 },                             // Table 2 at the top of p. 6
      { t: T.table + 0.25, dur: 1.9, ...STAGE },                                                  // the table flies to the stage, camera follows
      { t: T.s2 - 0.6, dur: 6.4, yaw: -0.05, tx: STAGE.tx + 20 },                                 // slow orbit while 0 % and 6 % land
      { t: T.s4 - 0.2, dur: 2.6, yaw: 0.03, tx: STAGE.tx - 30 },
      { t: T.failures - 0.1, dur: 1.5, tx: 1090, ty: 745, zoom: 1.62, pitch: 0.42, yaw: 0, dist: 2400 },   // back on p. 6
      { t: T.stuck - 0.4, dur: 1.4, ty: 790, zoom: 1.56 },                                         // footnote 4 into view
      { t: T.s6 + 0.1, dur: 1.5, ...STAGE, yaw: 0.02 },                                           // back to the chart
      { t: T.derail, dur: 1.4, yaw: -0.01 },
      { t: T.s7 - 0.25, dur: 1.5, tx: f15[0], ty: f15[1] + 26, zoom: 2.0, pitch: 0.16, yaw: 0, dist: 2400 },  // p. 15, Figure 5
      { t: T.s7 + 1.2, dur: 2.4, zoom: 2.03 },
      { t: T.s8 - 0.2, dur: 4.6, zoom: 2.06, tx: f15[0] + 10, ty: f15[1] + 14 },
    ]);

    // ── p. 33 and p. 6 slide in; p. 6 carries the Section 3.3 marks ──
    const in33 = e(t, 0.25, 1.3, ease.outCubic);
    const P33 = { ...P33R, x: lerp(-1500, P33R.x, in33), z: Math.sin(Math.PI * in33) * 130, rot: lerp(-0.16, P33R.rot, in33) };
    sheet(ctx, C, p33, P33);
    const in6 = e(t, 0, 1.25, ease.outCubic);
    const P6 = { ...P6R, y: lerp(1900, P6R.y, in6), z: Math.sin(Math.PI * in6) * 150, rot: lerp(0.13, P6R.rot, in6) };
    sheet(ctx, C, p6, P6);
    highlight(ctx, C, p6, P6, L.total, sayWords(env, 0, 4, 5, t), { color: F.hlMint });
    highlight(ctx, C, p6, P6, L.sampled, sayWords(env, 0, 10, 15, t), { color: F.hlMint });
    highlight(ctx, C, p6, P6, L.repeat, sayWords(env, 5, 8, 14, t), { color: F.hlMint });
    highlight(ctx, C, p6, P6, L.jump, sayWords(env, 5, 15, 18, t), { color: F.hlMint });
    highlight(ctx, C, p6, P6, L.foot, e(t, T.loop - 0.15, 0.75, ease.linear), { color: F.hlMint });
    markBox(ctx, C, p6, P6, T2.withCaption, e(t, T.failures0 - 0.2, 0.7) * (1 - e(t, T.table + 0.6, 0.5, ease.linear)), { color: F.ink2, width: 3, pad: 10 });

    // ── the dot sheet: 4 groups of 50 hand-labelled runs ──
    gridSheet(ctx, C, t, T);

    // ── the loop ring beside p. 6 (illustrative) ──
    ring(ctx, C, t, T);

    // ── footnote 4 tag ──
    const gq = win(t, T.loop - 0.05, T.s6 + 0.9, 0.35, 0.4);
    if (gq > 0) {
      const a = onSheet(C, p6, P6R, 985, 2023);   // blank end of the footnote's second line
      drawTex(ctx, S.guess, a.x, a.y, { size: 34, color: F.ink2, valign: 'middle', write: e(t, T.loop, 0.6, ease.linear), alpha: gq });
    }

    // ── the stage ──
    const stageOn = t > T.table - 0.1 && t < T.s7 + 2.5;
    if (stageOn) {
      tableCopy(ctx, C, t, T);
      chart(ctx, C, t, T);
      readingZone(ctx, C, t, T, env);
    }

    // ── p. 15: Figure 5 ──
    figure5(ctx, C, t, T, env);

    // ── source stamp: follows the page in focus ──
    const stamps = [
      [0, p6, S.c6s, S3],
      [T.table, p6, S.c6t, T2.withCaption],
      [T.invention + 0.4, p33, S.c33, P33.hallucination],
      [T.s2 + 0.3, p6, S.c6t, T2.withCaption],
      [T.failures + 0.4, p6, S.c6s, { x0: 296, y0: 990, x1: 1410, y1: 2040 }],
      [T.s6 + 0.6, p6, S.c6s, { x0: 296, y0: 1100, x1: 1410, y1: 1170 }],
      [T.derail + 0.1, p33, S.c33, P33.searchError],
      [T.s7 + 0.5, p15, S.c15, FIG5.all],
    ];
    let k = 0;
    while (k + 1 < stamps.length && t >= stamps[k + 1][0]) k++;
    const [, sp, sl, sr] = stamps[k];
    const dip = Math.min(1, ...stamps.slice(1).map(([ts]) => clamp(Math.abs(t - ts) / 0.22)));
    cite(ctx, sp, { label: sl, rect: sr, alpha: e(t, 0.8, 0.6) * dip, side: 'right' });
  },
};

// ── the dot sheet (s0): four rows of 50, one row per group the authors read ──
function gridSheet(ctx, C, t, T) {
  const pin = e(t, T.two - 0.25, 1.0, ease.outCubic);
  const out = e(t, T.sorted + 0.1, 1.0, ease.inCubic);
  if (pin <= 0 || out >= 1) return;
  const rows = [
    // right = filled dot, wrong = open ring; ReAct in the action blue, CoT in ink
    { lab: S.rr, at: T.right0, fill: PAL.actInk, ink: PAL.actInk },
    { lab: S.rw, at: T.wrong0, fill: F.paper, ink: PAL.actInk },
    { lab: S.cr, at: T.both - 0.1, fill: F.ink2, ink: F.ink2 },
    { lab: S.cw, at: T.methods, fill: F.paper, ink: F.ink2 },
  ];
  const pg = blankPage('r06-grid', GRID.w, GRID.h, (g) => {
    drawTex(g, S.head, GRID.w / 2, 92, { size: 60, color: F.ink, align: 'center', write: e(t, T.two - 0.1, 0.9, ease.linear) });
    rows.forEach((r, i) => {
      const y = 205 + i * 124;
      const wr = e(t, r.at - 0.15, 0.6, ease.linear);
      drawTex(g, r.lab, 44, y, { size: 46, color: r.ink === F.ink2 ? F.ink : PAL.actInk, valign: 'middle', write: wr });
      for (let n = 0; n < 50; n++) {
        const c = n % 25, rr = Math.floor(n / 25);
        const p = e(t, r.at + n * 0.012, 0.25, ease.outBack);
        if (p <= 0) continue;
        g.beginPath(); g.arc(388 + c * 24, y - 14 + rr * 28, 8.6 * p, 0, Math.PI * 2);
        g.fillStyle = r.fill; g.fill(); g.lineWidth = 2.6; g.strokeStyle = r.ink; g.stroke();
      }
      drawTex(g, S.n50, 1050, y, { size: 44, color: F.ink2, align: 'right', valign: 'middle', write: e(t, r.at + 0.55, 0.4, ease.linear) });
    });
  });
  const pose = {
    x: GRIDR.x + 1300 * out, y: lerp(GRIDR.y - 700, GRIDR.y, pin) - 500 * out,
    z: Math.sin(Math.PI * pin) * 120 + Math.sin(Math.PI * out) * 140, w: GRIDR.w, rot: lerp(0.2, GRIDR.rot, pin) + 0.15 * out,
  };
  sheet(ctx, C, pg, pose, { grid: 6 });
}

// ── Table 2: lifts off p. 6 on "table two" and stands up at the back of the stage ──
function tablePose(t, T) {
  const th = TAB.w * (T2CROP.y1 - T2CROP.y0) / (T2CROP.x1 - T2CROP.x0);
  return liftPose(p6, P6R, T2CROP, { x: TAB.cx, y: TAB.yb - th / 2, z: 0, w: TAB.w, tilt: TAB.tilt, arc: 380 }, e(t, T.table, 2.0, ease.linear));
}
function tableCopy(ctx, C, t, T) {
  const TP = tablePose(t, T);
  sheet(ctx, C, p6, TP, { grid: 8 });
  const fadeS4 = 1 - e(t, T.s4 - 0.1, 0.5, ease.linear);
  // s1: CoT hallucination cell; s2: ReAct's 0 %; s3: ReAct's false positives
  markBox(ctx, C, p6, TP, cell(HAL, 'cot'), e(t, T.fiftySix + 0.35, 0.6) * fadeS4, { color: F.red, width: 3, pad: 2 });
  markBox(ctx, C, p6, TP, cell(HAL, 'react'), e(t, T.zero - 0.05, 0.5) * fadeS4, { color: F.red, width: 3, pad: 2 });
  markBox(ctx, C, p6, TP, cell(FPROW, 'react'), e(t, T.six, 0.5) * fadeS4, { color: PAL.bad, width: 3.6, pad: 2 });
  // s3: "rested on a hallucinated step" — the false-positive row's definition
  const FPDEF = [{ x0: T2.cols.def.x0, y0: FPROW.y0, x1: 905, y1: FPROW.y1 - 2, n: 37 }];   // "Hallucinated reasoning trace or facts"
  ctx.save(); ctx.globalAlpha *= fadeS4;
  highlight(ctx, C, p6, TP, FPDEF, e(t, T.hallucinated - 0.15, 0.75, ease.linear), { color: PAL.bad, pad: 2 });
  ctx.restore();
  // s4: "ReAct breaks in its own ways" — ReAct's failure column
  const col = { x0: T2.cols.react.x0, x1: T2.cols.react.x1, y0: FAIL[0].y0, y1: FAIL[3].y1 };
  markBox(ctx, C, p6, TP, col, e(t, T.own - 0.1, 0.6) * (1 - e(t, T.failures - 0.2, 0.4, ease.linear)), { color: PAL.actInk, width: 3, pad: 4 });
  markBox(ctx, C, p6, TP, cell(FAIL[1], 'react'), e(t, T.s6 + 1.2, 0.5) * (1 - e(t, T.derail, 0.4, ease.linear)), { color: PAL.actInk, width: 3, pad: 2 });
}

// ── the paired bars: per failure type, ReAct (left, as in the table) and CoT (right), from 0 ──
function chart(ctx, C, t, T) {
  const ax = e(t, T.s1 - 0.1, 0.9, ease.inOutCubic);
  if (ax <= 0) return;
  const ym = (BY0 + BY1) / 2;
  // axis 0–60 with ticks at 20 / 40 / 60
  const top = 62 * ZS;
  const a0 = C.p(AXX, ym, 0), a1 = C.p(AXX, ym, top * ax);
  ctx.save();
  ctx.strokeStyle = F.ink2; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke();
  // base line along the desk under the pairs
  const b1 = C.p(lerp(AXX, PX[3] + BW + 40, ax), ym, 0);
  ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(b1.x, b1.y); ctx.stroke();
  [[0, S.a0], [20, S.a20], [40, S.a40], [60, S.a60]].forEach(([v, s], j) => {
    const z = v * ZS;
    if (z > top * ax + 1) return;
    const k0 = C.p(AXX - 14, ym, z), k1 = C.p(AXX + 14, ym, z);
    ctx.beginPath(); ctx.moveTo(k0.x, k0.y); ctx.lineTo(k1.x, k1.y); ctx.stroke();
    drawTex(ctx, s, k0.x - 10, k0.y, { size: 32, color: F.ink2, align: 'right', valign: 'middle', write: e(t, T.s1 + 0.1 * j, 0.5, ease.linear) });
  });
  ctx.restore();
  // heading + legend on one line above the axis top: "wrong answers   ▢ ReAct   ▢ CoT"
  const hd = C.p(AXX + 30, ym, top + 48);
  const wl = e(t, T.s1 + 0.3, 0.8, ease.linear);
  drawTex(ctx, S.wrong, hd.x, hd.y, { size: 36, color: F.ink, valign: 'baseline', write: wl });
  let lx = hd.x + texSize(S.wrong, 36).w + 44;
  chip(ctx, lx, hd.y - 11, PAL.act, PAL.actInk, wl);
  drawTex(ctx, S.react, lx + 22, hd.y, { size: 32, color: PAL.actInk, valign: 'baseline', write: wl });
  lx += 22 + texSize(S.react, 32).w + 34;
  chip(ctx, lx, hd.y - 11, F.block, F.ink, wl);
  drawTex(ctx, S.cot, lx + 22, hd.y, { size: 32, color: F.ink, valign: 'baseline', write: wl });

  // bars (cues per T2.rows order: Reasoning, Search, Hallucination, Label)
  const cues = [
    { react: T.s5 - 0.05, cot: T.s5 + 0.35 },
    { react: T.searches - 0.1, cot: null },
    { react: null, cot: T.fiftySix },
    { react: T.run6 + 0.05, cot: T.run6 + 0.3 },
  ];
  const items = [];
  FAIL.forEach((r, i) => {
    const hal = r.type === 'Hallucination';
    items.push({ i, who: 'react', x0: PX[i] - BG / 2 - BW, x1: PX[i] - BG / 2, y0: BY0, y1: BY1, v: r.react, at: cues[i].react, fill: PAL.act, stroke: hal ? PAL.bad : PAL.actInk, hal });
    items.push({ i, who: 'cot', x0: PX[i] + BG / 2, x1: PX[i] + BG / 2 + BW, y0: BY0, y1: BY1, v: r.cot, at: cues[i].cot, fill: F.block, stroke: hal ? PAL.bad : F.ink, hal });
  });
  // the small "right answers" pair in front: false positives (ReAct 6, CoT 14), lighter
  const fpOn = e(t, T.s3 - 0.1, 0.8, ease.inOutCubic);
  if (fpOn > 0) {
    items.push({ i: 4, who: 'react', x0: FP.x - BG / 2 - FP.bw, x1: FP.x - BG / 2, y0: FP.y0, y1: FP.y1, v: FPROW.react, at: T.six, fill: mix(PAL.act, '#FFFFFF', 0.35), stroke: PAL.bad, light: true, alpha: fpOn });
    items.push({ i: 4, who: 'cot', x0: FP.x + BG / 2, x1: FP.x + BG / 2 + FP.bw, y0: FP.y0, y1: FP.y1, v: FPROW.cot, at: T.six + 0.25, fill: mix(F.block, '#FFFFFF', 0.4), stroke: mix(F.ink, '#FFFFFF', 0.35), light: true, alpha: fpOn });
  }
  // footprints first (the empty slots on the desk), then the risen bars far-to-near
  ctx.save();
  for (const s of items) {
    if (s.v == null) continue;
    const pts = [[s.x0, s.y0], [s.x1, s.y0], [s.x1, s.y1], [s.x0, s.y1]].map(([x, y]) => C.p(x, y, 0));
    const zeroHal = s.hal && s.v === 0;
    ctx.globalAlpha = ax * (s.alpha ?? 1) * (zeroHal ? lerp(0.55, 1, e(t, T.zero - 0.1, 0.4)) : 0.55);
    ctx.strokeStyle = zeroHal ? mix(PAL.bad, F.red, e(t, T.zero - 0.1, 0.4)) : s.stroke;
    ctx.lineWidth = zeroHal ? lerp(1.6, 3.2, e(t, T.zero - 0.1, 0.4)) : 1.6;
    ctx.fillStyle = zeroHal ? 'rgba(234,153,153,0.18)' : 'rgba(255,255,255,0.35)';
    ctx.beginPath(); pts.forEach((q, j) => (j ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
  items.forEach((s) => {
    s.p = s.at != null && s.v > 0 ? e(t, s.at, 1.0, ease.outCubic) : 0;
    s.d = C.p((s.x0 + s.x1) / 2, (s.y0 + s.y1) / 2, 0).depth;
  });
  items.filter((s) => s.p > 0).sort((a, b) => b.d - a.d).forEach((s) => {
    box3(ctx, C, { x0: s.x0, x1: s.x1, y0: s.y0, y1: s.y1, z0: 0, z1: Math.max(2, s.v * ZS * s.p) },
      { fill: s.fill, stroke: s.stroke, width: s.hal || s.light ? 3 : 2.2, alpha: s.alpha ?? 1 });
  });
  // values on top; ReAct's 0 % on its flat outline; CoT's dash in the search slot
  items.forEach((s) => {
    const xc = (s.x0 + s.x1) / 2;
    const col = s.hal ? F.red : s.who === 'react' ? PAL.actInk : F.ink;
    if (s.v == null) {
      // the paper prints "-" for CoT here (CoT never searches): a dash in the slot, no bar
      const w = e(t, T.searches + 0.3, 0.45, ease.inOutCubic);
      if (w > 0) {
        const ym_ = (s.y0 + s.y1) / 2, a = C.p(xc - BW * 0.28, ym_, 4), b = C.p(lerp(xc - BW * 0.28, xc + BW * 0.28, w), ym_, 4);
        ctx.save(); ctx.strokeStyle = F.ink2; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
      }
      return;
    }
    if (s.v === 0 && s.hal) {
      const d = C.p(xc, s.y0, 18);
      drawTex(ctx, S.v0, d.x, d.y, { size: 42, color: F.red, align: 'center', valign: 'bottom', write: e(t, T.zero - 0.05, 0.5, ease.linear) });
      return;
    }
    if (s.p <= 0) return;
    const v = C.p(xc, s.y0, s.v * ZS * s.p + 14);
    drawTex(ctx, S[`v${s.v}`], v.x, v.y, { size: s.light ? 36 : 40, color: s.light ? mix(col, '#FFFFFF', 0.15) : col, align: 'center', valign: 'bottom', write: e(t, s.at + 0.45, 0.5, ease.linear), alpha: s.alpha ?? 1 });
  });
  // type names under the pairs; ReAct | CoT under the first pair's bars
  const types = [[S.ty0a, S.ty0b], [S.ty1a, S.ty1b], [S.ty2a], [S.ty3a, S.ty3b]];
  types.forEach((ls, i) => {
    ls.forEach((s, j) => {
      const n = C.p(PX[i], BY1 + 46 + j * 44, 0);
      drawTex(ctx, s, n.x, n.y, { size: 32, color: F.ink, align: 'center', valign: 'top', write: e(t, T.s1 + 0.2 + i * 0.12, 0.7, ease.linear) });
    });
  });
  if (fpOn > 0) {
    const h1 = C.p(FP.x, FP.y1 + 34, 0);
    drawTex(ctx, S.fpos, h1.x, h1.y, { size: 32, color: F.ink2, align: 'center', valign: 'top', write: e(t, T.s3, 0.7, ease.linear), alpha: fpOn });
    const h0 = C.p(FP.x, FP.y0, 36 * ZS);
    drawTex(ctx, S.right, h0.x, h0.y, { size: 36, color: F.ink, align: 'center', valign: 'bottom', write: e(t, T.s3 - 0.1, 0.8, ease.linear), alpha: fpOn });
  }
}

function chip(ctx, x, y, fill, ink, p) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2);
  ctx.fillStyle = fill; ctx.strokeStyle = ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x - 10, y - 10, 20, 20, 3); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// ── the reading zone on the right of the stage: p. 33's examples and the Section 3.3 C) strip ──
function zonePose(rect, w, yb, z = 0) {
  const h = w * (rect.y1 - rect.y0) / (rect.x1 - rect.x0);
  return { x: RZ.cx, y: yb - h / 2, z, w, tilt: RZ.tilt };
}
function readingZone(ctx, C, t, T, env) {
  // s1: CoT's hallucination ("1916 (Label: 1909)"), in on "invention", out after "For ReAct, zero."
  const hl = e(t, T.invention - 0.35, 1.1, ease.linear);
  const hOut = e(t, T.s2 + 0.15, 0.9, ease.inCubic);
  if (hl > 0 && hOut < 1) {
    const to = zonePose(P33.hallucination, RZ.w, 330, 40);
    const HP = liftPose(p33, P33R, P33.hallucination, { ...to, arc: 180 }, hl);
    HP.x += 1500 * hOut; HP.y -= 300 * hOut; HP.z += Math.sin(Math.PI * hOut) * 120;
    sheet(ctx, C, p33, HP, { grid: 6 });
    highlight(ctx, C, p33, HP, L.label1916, e(t, T.invention + 0.9, 0.7, ease.linear), { color: PAL.bad });
  }
  // s6: the C) strip comes from p. 6 with the camera; then p. 33's search error on "derail"
  const cl = e(t, T.s6 - 0.05, 1.6, ease.linear);
  const cOut = e(t, T.s7 - 0.3, 1.0, ease.inCubic);
  if (cl > 0 && cOut < 1) {
    const to = zonePose(CSTRIP, RZ.w - 40, 330, 250);
    const CP = liftPose(p6, P6R, CSTRIP, { ...to, arc: 140 }, cl);
    CP.y -= 900 * cOut;
    sheet(ctx, C, p6, CP, { grid: 4 });
    highlight(ctx, C, p6, CP, L.nonInf, sayWords(env, 6, 0, 7, t), { color: F.hlMint });
  }
  const sl = e(t, T.useful - 0.1, 1.15, ease.linear);
  if (sl > 0 && cOut < 1) {
    const to = zonePose(P33.searchError, RZ.w, 330);
    const SP = liftPose(p33, P33R, P33.searchError, { ...to, arc: 200 }, sl);
    SP.y -= 900 * cOut;
    sheet(ctx, C, p33, SP, { grid: 6 });
    highlight(ctx, C, p33, SP, L.frigg, e(t, T.derail + 0.45, 0.7, ease.linear), { color: PAL.bad });
  }
}

// ── the loop ring beside p. 6: same Thought and Act cards go round, a third time, then jam ──
function ring(ctx, C, t, T) {
  const show = e(t, T.failures + 0.5, 0.8) * (1 - e(t, T.s6 + 0.9, 0.6, ease.linear));
  if (show <= 0) return;
  const s = RING.s;
  const W_ = (x, y) => [RING.x + (x - LOOP.c.x) * s, RING.y + (y - LOOP.c.y) * s];
  const r = LOOP.r * s;
  const P = (ang, z = 0) => C.p(RING.x + Math.cos(ang) * r, RING.y + Math.sin(ang) * r, z);
  // card motion: laps start on "repeating"; two laps, a slower third that stops short
  const t0 = T.repeating - 0.1, lap = 0.95;
  let L_ = 0;
  if (t > t0) {
    const u = t - t0;
    L_ = u < 2 * lap ? u / lap : 2 + 0.72 * ease.outCubic(clamp((u - 2 * lap) / 1.25));
  }
  const jam = e(t, t0 + 2 * lap + 0.9, 0.5, ease.linear);
  const arrowCol = mix(F.ink2, PAL.bad, jam);
  ctx.save();
  ctx.globalAlpha *= show;
  // ring arrows on the desk: three arcs between the stations
  const st = [Math.PI, Math.PI * 5 / 3, Math.PI * 7 / 3];        // thought (left), action (top-right), observation (bottom-right)
  ctx.strokeStyle = arrowCol; ctx.fillStyle = arrowCol; ctx.lineWidth = lerp(3, 4.6, jam); ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const a0 = st[i] + 0.3, a1 = st[i] + Math.PI * 2 / 3 - 0.3;
    ctx.beginPath();
    for (let j = 0; j <= 24; j++) { const q = P(lerp(a0, a1, j / 24)); j ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }
    ctx.stroke();
    const h0 = P(a1 - 0.08), h1 = P(a1);
    const ang = Math.atan2(h1.y - h0.y, h1.x - h0.x), hl = 13;
    ctx.beginPath(); ctx.moveTo(h1.x, h1.y);
    ctx.lineTo(h1.x - hl * Math.cos(ang - 0.45), h1.y - hl * Math.sin(ang - 0.45));
    ctx.lineTo(h1.x - hl * Math.cos(ang + 0.45), h1.y - hl * Math.sin(ang + 0.45)); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // stations (LOOP layout, scaled)
  const keys = ['thought', 'act', 'obs'];
  const fills = { thought: PAL.thought, act: PAL.act, obs: PAL.obs };
  const inks = { thought: PAL.thoughtInk, act: PAL.actInk, obs: PAL.obsInk };
  const labs = { thought: S.thought, act: S.action, obs: S.obs };
  const ss = RING.ss, sw = LOOP.slab.w * ss, sd = LOOP.slab.d * ss, sh = LOOP.slab.h * ss;
  keys.map((k) => ({ k, c: W_(LOOP.stations[k].x, LOOP.stations[k].y) }))
    .sort((a, b) => a.c[1] - b.c[1])
    .forEach(({ k, c }) => {
      ctx.save(); ctx.globalAlpha *= show;
      box3(ctx, C, { x0: c[0] - sw / 2, x1: c[0] + sw / 2, y0: c[1] - sd / 2, y1: c[1] + sd / 2, z0: 0, z1: sh }, { fill: fills[k], stroke: inks[k], width: 2 });
      // labels outside the ring: Thought to the left, Action behind, Observation in front
      const at = { thought: [c[0] - sw / 2 - 10, c[1], 'right', 'middle'], act: [c[0], c[1] - sd / 2 - 6, 'center', 'bottom'], obs: [c[0], c[1] + sd / 2 + 8, 'center', 'top'] }[k];
      const lp = C.p(at[0], at[1], k === 'act' ? sh : 0);
      drawTex(ctx, labs[k], lp.x, lp.y, { size: 30, color: inks[k], align: at[2], valign: at[3] });
      ctx.restore();
    });
  // the two cards riding the ring (thought card leads, act card follows)
  [[0, PAL.thought, PAL.thoughtInk], [-0.22, PAL.act, PAL.actInk]].forEach(([off, fill, ink]) => {
    const ang = Math.PI + (L_ + off) * Math.PI * 2;
    if (L_ + off < 0) return;
    const cx = RING.x + Math.cos(ang) * r, cy = RING.y + Math.sin(ang) * r;
    const z = sh + 10 + Math.sin(Math.PI * clamp((L_ + off) * 3 % 1)) * 4;
    const hw = 30, hd = 18, ca = Math.cos(ang + Math.PI / 2), sa = Math.sin(ang + Math.PI / 2);
    const pts = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([u, v]) => C.p(cx + u * ca - v * sa, cy + u * sa + v * ca, z));
    ctx.save(); ctx.globalAlpha *= show;
    ctx.fillStyle = 'rgba(58,50,38,0.16)';
    const sh_ = pts.map((q, j) => { const [u, v] = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]][j]; return C.p(cx + u * ca - v * sa + 4, cy + u * sa + v * ca + 6, 0); });
    ctx.beginPath(); sh_.forEach((q, j) => (j ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.fill();
    ctx.fillStyle = fill; ctx.strokeStyle = ink; ctx.lineWidth = 2.4;
    ctx.beginPath(); pts.forEach((q, j) => (j ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  });
  // lap count in the middle; the tag underneath
  const mid = C.p(RING.x, RING.y, 0);
  ctx.save(); ctx.globalAlpha *= show;
  const c2 = clamp(L_ - 1) > 0 && L_ < 2, c3 = L_ >= 2;
  if (c2) drawTex(ctx, S.x2, mid.x, mid.y, { size: 44, color: F.ink2, align: 'center', valign: 'middle', write: clamp((L_ - 1) * 4) });
  if (c3) drawTex(ctx, S.x3, mid.x, mid.y, { size: 50, color: mix(F.ink2, F.red, jam), align: 'center', valign: 'middle', write: clamp((L_ - 2) * 4) });
  const tg = C.p(RING.x - 40, RING.y + r + 62, 0);
  drawTex(ctx, S.illus, tg.x, tg.y, { size: 30, color: F.ink3, align: 'center', valign: 'top', write: e(t, T.failures + 0.8, 0.6, ease.linear) });
  ctx.restore();
}

// ── p. 15: Figure 5, panel (a) fails, panel (b) — two thoughts edited by a person — succeeds ──
function figure5(ctx, C, t, T, env) {
  const pin = e(t, T.s7 - 0.35, 1.3, ease.outCubic);
  if (pin <= 0) return;
  const P = { ...P15R, x: lerp(P15R.x + 1400, P15R.x, pin), y: lerp(P15R.y + 900, P15R.y, pin), z: Math.sin(Math.PI * pin) * 160, rot: lerp(0.14, P15R.rot, pin) };
  sheet(ctx, C, p15, P);
  // s7: "a person can fix them" — the (b) panel's title
  highlight(ctx, C, p15, P, [{ ...FIG5_LINES.b[0], n: FIG5_LINES.b[0].t.length }], e(t, T.person - 0.1, 0.7, ease.linear), { color: F.hlBlue, pad: 3 });
  // s8: the caption with the voice; the two edits in (b)
  highlight(ctx, C, p15, P, L.byHuman, sayWords(env, 8, 0, 5, t), { color: F.hlMint });
  const a17 = FIG5_STEPS.b.find((s) => s.id === 'Act17'), a23 = FIG5_STEPS.b.find((s) => s.id === 'Act23');
  markBox(ctx, C, p15, P, a17, e(t, T.editing - 0.05, 0.6), { color: F.red, width: 1.3, pad: 1 });
  const sk = FIG5.edits.act17struck, sp = e(t, T.editing + 0.35, 0.55, ease.inOutCubic);
  if (sp > 0) {
    const ym = (sk.y0 + sk.y1) / 2 + 1;
    const a = onSheet(C, p15, P, sk.x0 - 2, ym), b = onSheet(C, p15, P, lerp(sk.x0 - 2, sk.x1 + 2, sp), ym);
    ctx.save(); ctx.strokeStyle = F.red; ctx.lineWidth = 3.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
  }
  markBox(ctx, C, p15, P, a23, e(t, T.thoughts8 - 0.1, 0.6), { color: PAL.thoughtInk, width: 1.3, pad: 1 });
  const pieces = FIG5.edits.act23added;
  const tot = pieces.reduce((s, r) => s + (r.x1 - r.x0), 0);
  const up = e(t, T.thoughts8 + 0.15, 0.8, ease.linear) * tot;
  let acc = 0;
  ctx.save(); ctx.strokeStyle = PAL.thoughtInk; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
  for (const r of pieces) {
    const f = clamp((up - acc) / (r.x1 - r.x0));
    acc += r.x1 - r.x0;
    if (f <= 0) break;
    const a = onSheet(C, p15, P, r.x0, r.y1 + 1), b = onSheet(C, p15, P, lerp(r.x0, r.x1, f), r.y1 + 1);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  ctx.restore();
  // ✗ pulses on "failed household run"; ✓ pulses on "into a success", Obs 29 boxed green
  pulse(ctx, C, P, FIG5.marks.a, t, T.failed, F.red);
  pulse(ctx, C, P, FIG5.marks.b, t, T.into + 0.1, PAL.goodMark);
  const o29 = FIG5_STEPS.b.find((s) => s.id === 'Obs29');
  markBox(ctx, C, p15, P, o29, e(t, T.success - 0.1, 0.6), { color: PAL.goodMark, width: 1.5, pad: 2 });
}

function pulse(ctx, C, P, r, t, at, color) {
  const cx = (r.x0 + r.x1) / 2, cy = (r.y0 + r.y1) / 2;
  const c = onSheet(C, p15, P, cx, cy), edge = onSheet(C, p15, P, r.x1, cy);
  const r0 = Math.max(10, Math.abs(edge.x - c.x)) + 8;
  ctx.save(); ctx.strokeStyle = color;
  // a ring that settles around the mark, plus two expanding echoes
  const hold = e(t, at, 0.4);
  if (hold > 0) { ctx.globalAlpha *= 1; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.arc(c.x, c.y, r0 * lerp(1.6, 1.15, hold), 0, Math.PI * 2 * hold); ctx.stroke(); }
  for (let i = 0; i < 2; i++) {
    const u = clamp((t - at - i * 0.35) / 0.8);
    if (u <= 0 || u >= 1) continue;
    ctx.save(); ctx.globalAlpha *= (1 - u) * 0.8; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.arc(c.x, c.y, r0 * (1.15 + u * 1.3), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}

// ── a box standing on the desk, faces chosen by which side of each face the camera is on ──
// (kit candidate: folio's slab() picks left/right faces by average depth, which ties at yaw 0 and
// shows the left face of boxes left of centre; this tests the camera position against each face)
function box3(ctx, C, b, { fill, stroke = F.ink, width = 2.2, alpha = 1 } = {}) {
  if (alpha <= 0) return;
  const sp = Math.sin(C.pitch), cp = Math.cos(C.pitch);
  const cam = [C.tx + C.dist * sp * Math.sin(C.yaw), C.ty + C.dist * sp * Math.cos(C.yaw), C.dist * cp];
  const { x0, y0, x1, y1, z0, z1 } = b;
  const faces = [
    { pts: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], f: 1.0, vis: cam[2] > z1 },   // top
    { pts: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], f: 0.9, vis: cam[1] > y1 },   // front (+y)
    { pts: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], f: 0.85, vis: cam[1] < y0 },  // back
    { pts: [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], f: 0.8, vis: cam[0] > x1 },   // right (+x)
    { pts: [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]], f: 0.8, vis: cam[0] < x0 },   // left
  ].filter((fc) => fc.vis).map((fc) => {
    const P = fc.pts.map(([x, y, z]) => C.p(x, y, z));
    return { P, f: fc.f, d: P.reduce((s, q) => s + q.depth, 0) / 4 };
  }).sort((a, c) => c.d - a.d);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineJoin = 'round';
  for (const fc of faces) {
    ctx.fillStyle = shadeHex(fill, fc.f);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width * fc.P[0].k;
    ctx.beginPath(); fc.P.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath();
    ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}
function shadeHex(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(clamp(v * f, 0, 255)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
