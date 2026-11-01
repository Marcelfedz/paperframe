// evidence — commonsense (Section 4, p. 7) and symbolic reasoning (Section 5, p. 8), PaLM 540B only.
// Two bar stations built the same way: the figure's subplot lifts off its page and stands at the left, honest
// bars from 0 rise in the middle on their numbers, and the matching cells of p. 22 stand at the right as cut
// pieces of the table (header + PaLM 540B row), each cell boxed as its bar rises.
// Station 1 (s1–s2): Figure 7's Sports and CSQA subplots, Table 4, an "unaided sports enthusiast" glass plate at
// 84, and two lines of p. 7 lifted and read with the marker. Between the stations, p. 8 is read: the two toy
// tasks, the "Amy Brown" example lifted with its last letters circled, the coin flip, and an illustrative
// prompt / test sheet (two words and two people in the prompt, up to four in the test). Station 2 (s8–s10):
// Figure 8's two OOD subplots, Table 5, standard 0.0 as a flat outline against 63.0, and 54.8 against 90.2.
// Guardrails (briefing): no StrategyQA numbers (the Table 4 pieces skip its columns, the p. 7 strip starts after
// "69.4%) and"); "unaided sports enthusiast", never "humans"; no in-domain coin flip; no chance line; no names.
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, texSize, desk, edgeIn, loadPaper, findPhrase, cameraAt, sheet, highlight,
  markBox, liftPose, slab, cite, tag, sayWords, onSheet, blankPage, standIn,
} from '/engine/folio.js';
import { PAL, PH, FIG7, FIG8, T4, T5 } from './_data.js';

// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars, same geometry) and redrawn figures.
const PAGES = true;

// ── world layout (desk px) ───────────────────────────────────────────────────
const DIST = 8000;                 // long lens: bars stay upright across the frame
const PITCH = 0.8;                 // station pitch; standing cards and pieces tilt the same, so they face the camera
const HZ = 4.6;                    // world z per percentage point: 100 % stands 460 high
const BY0 = 590, BY1 = 650;        // bar footprint, back and front edge
const BW = 84;                     // bar width
const X2 = 2400;                   // the symbolic station sits this far right of the commonsense one
const AXX = 610;                   // axis x (station-local)
const RP7 = { x: 960, y: 560, w: 860, rot: -0.01 };            // p. 7 at rest
const RP8 = { x: 960 + X2, y: 560, w: 860, rot: 0.008 };       // p. 8 at rest
const GONE7 = { x: -900, y: -800, w: 860, rot: -0.25 };         // p. 7 after it slides off the back-left of the desk
const GONE8 = { x: -900 + X2, y: -800, w: 860, rot: -0.2 };
const OFF22 = (ox) => ({ x: ox + 2500, y: 420, w: 860, rot: 0.12 });   // p. 22 never lies on the desk: its pieces fly in from the right

// figure subplots standing at the left (same scale for both, so they stand equally tall)
const CARD_K = 1.4;
// the cut pieces of p. 22 (page px): Table 4 skips StrategyQA and Date, Table 5 keeps only the OOD: 4 columns
const T4P = { cols: [{ x0: 336, x1: 692 }, { x0: 1026, x1: 1192 }], head: { y0: 453, y1: 534 }, row: { y0: 991, y1: 1029 } };
const T5P = { cols: [{ x0: 305, x1: 480 }, { x0: 779, x1: 928 }, { x0: 1234, x1: 1384 }], head: { y0: 1455, y1: 1545 }, row: { y0: 1819, y1: 1857 } };
const PK = 0.95;                   // world px per page px for the table pieces
const PIECE_X = 1290;              // left edge of the pieces (station-local)
const PIECE_GAP = 24;

// p. 7 lines lifted as standing strips (crop starts after "69.4%) and": no StrategyQA number on the strip)
const STRIP_SPORTS = { x0: 434, y0: 1322, x1: 1408, y1: 1354 };
const STRIP_CSQA = { x0: 885, y0: 1382, x1: 1408, y1: 1414 };
const STRIP_Z = 485;               // standing strips float above the bars
// p. 8 "Amy Brown" example and its last letters (page px, from words.json and the PNG)
const AMY = { x0: 306, y0: 652, x1: 590, y1: 684 };
const LAST_Y = { u: 375, v: 667 }, LAST_N = { u: 447, v: 664 }, ANS_YN = { x0: 527, y0: 657, x1: 553, y1: 680 };
// stamp regions
const P7SEC = { x0: 299, y0: 445, x1: 1405, y1: 680 };
const P7RES = { x0: 299, y0: 1180, x1: 1406, y1: 1418 };
const P8SEC = { x0: 299, y0: 200, x1: 945, y1: 1000 };
const P8OOD = { x0: 299, y0: 1120, x1: 1405, y1: 1222 };

// redraw data for the stand-in path (PAGES = false): PaLM 8B / 62B / 540B, standard and CoT, REAL, p. 22 Tables 4–5.
// Only plotted as lines on the stand-in figure, never printed.
const RD = {
  csqa: { std: [19.8, 65.4, 78.1], cot: [24.9, 68.1, 79.9], xs: [395, 431, 468], y: (v) => 1500 + (100 - v) * 2.1125 },
  sports: { std: [55.1, 72.1, 80.5], cot: [75.2, 93.6, 95.4], xs: [849, 885, 922], y: (v) => 1504 + (100 - v) * 2.717 },
  letter4: { std: [0.0, 0.0, 0.0], cot: [0.2, 13.4, 63.0], xs: [1225, 1284, 1346], y: (v) => 541 - v * 1.73 },
  coin4: { std: [50.9, 38.3, 54.8], cot: [51.8, 72.4, 90.2], xs: [1225, 1284, 1346], y: (v) => 816 - (v - 40) * 2.717 },
};

const v1 = (v) => v.toFixed(1);
const S = {
  c7s4: '\\text{p.~7}\\;\\cdot\\;\\text{Section 4}',
  c7f7: '\\text{p.~7}\\;\\cdot\\;\\text{Figure 7}',
  c22t4: '\\text{p.~22}\\;\\cdot\\;\\text{Table 4}',
  c8s5: '\\text{p.~8}\\;\\cdot\\;\\text{Section 5}',
  c8f8: '\\text{p.~8}\\;\\cdot\\;\\text{Figure 8}',
  c22t5: '\\text{p.~22}\\;\\cdot\\;\\text{Table 5}',
  std: '\\text{standard}', cot: '\\text{CoT}',
  csqa: '\\text{CSQA}', sports: '\\text{Sports}', letter: '\\text{Last letter}', coin: '\\text{Coin flip}',
  palm: '\\text{PaLM 540B}',
  palm2: '\\text{PaLM 540B}\\;\\cdot\\;\\text{4 words / 4 people}',
  enth: '\\text{unaided sports enthusiast}',
  prompt: '\\text{prompt}', test: '\\text{test}', illus: '\\text{illustrative}', redrawn: '\\text{redrawn}',
  t0: '0', t25: '25', t50: '50', t75: '75', t100: '100',
};
const val = (v) => { const k = `v_${v1(v)}`; S[k] = v1(v); return k; };

// the two stations: groups of two bars (standard, CoT) with their cells on the pieces
const ST = [
  {
    ox: 0, table: T4, P: T4P, groups: [
      { key: 'csqa', x: 750, v: T4.palm540.csqa, piece: 0, col: T4.cols.csqa, title: 'csqa' },
      { key: 'sports', x: 1000, v: T4.palm540.sports, piece: 1, col: T4.cols.sports, title: 'sports' },
    ],
  },
  {
    ox: X2, table: T5, P: T5P, groups: [
      { key: 'letter4', x: 750, v: T5.palm540.letter4, piece: 1, col: T5.cols.letter4, title: 'letter', flatStd: true },
      { key: 'coin4', x: 1000, v: T5.palm540.coin4, piece: 2, col: T5.cols.coin4, title: 'coin' },
    ],
  },
];
ST.forEach((st) => st.groups.forEach((g) => { g.vs = g.v.map(val); }));
S.v84 = String(T4.sportsHuman);

let p7, p8, p22, L;

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [7, 8, 22]);
    if (PAGES) { p7 = P.page(7); p8 = P.page(8); p22 = P.page(22); }
    else {
      p7 = standIn(P.page(7), { draw: (g) => { redraw(g, 'csqa'); redraw(g, 'sports'); } });
      p8 = standIn(P.page(8), { draw: (g) => { redraw(g, 'letter4'); redraw(g, 'coin4'); } });
      const cells = [];
      for (const st of ST) for (const gr of st.groups) ['std', 'cot'].forEach((k, i) => cells.push({ r: { ...gr.col[k], y0: st.table.palm540.y0, y1: st.table.palm540.y1 }, s: S[gr.vs[i]] }));
      p22 = standIn(P.page(22), {
        blank: cells.map((c) => c.r),
        draw: (g) => cells.forEach((c) => drawTex(g, c.s, c.r.x1, c.r.y1 - 3, { size: 30, color: F.ink, align: 'right', valign: 'baseline' })),
      });
    }
    L = {
      head4: findPhrase(p7, '4 Commonsense Reasoning'),
      sports: findPhrase(p7, PH.sports),
      csqa: findPhrase(p7, PH.csqaMinimal),
      head5: findPhrase(p8, 'Symbolic Reasoning'),
      toy: findPhrase(p8, PH.toyShort),
      llHead: findPhrase(p8, PH.lastLetterHead),
      amy: findPhrase(p8, PH.amy),
      coinHead: findPhrase(p8, PH.coinHead, 3),
      coinEx: findPhrase(p8, PH.coinEx),
      twoWords: findPhrase(p8, PH.twoWords),
      flips: findPhrase(p8, PH.flipsToo),
    };
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      commonsense: q.w(0, 'commonsense'),
      s1: q.s(1), sports: q.w(1, 'sports'), underst: q.w(1, 'understanding'), palm: q.w(1, 'PaLM'), with1: q.w(1, 'with'),
      ninety: q.w(1, 'ninety-five'), percent: q.w(1, 'percent'), above: q.w(1, 'above'), unaided: q.w(1, 'unaided'), eighty: q.w(1, 'eighty-four'),
      s2: q.s(2), csqa: q.w(2, 'CSQA'),
      s3: q.s(3), two3: q.w(3, 'two'),
      s4: q.s(4), of4: q.w(4, 'of'), words4: q.w(4, 'words'), name4: q.w(4, 'name'),
      s5: q.s(5), s6: q.s(6), twoword: q.w(6, 'two-word'), names6: q.w(6, 'names'), two6: q.w(6, 'two'),
      s7: q.s(7), test7: q.w(7, 'test'), up7: q.w(7, 'up'), four7: q.w(7, 'four'),
      s8: q.s(8), palm8: q.w(8, 'PaLM'), none: q.w(8, 'none'),
      s9: q.s(9), sixty: q.w(9, 'sixty-three'),
      s10: q.s(10), fifty: q.w(10, 'fifty-four'), ninety2: q.w(10, 'ninety'),
    };
    // when each bar rises (station, group, 0 = standard / 1 = CoT)
    T.bar = [
      [[T.csqa, T.csqa + 0.3], [T.with1, T.ninety]],
      [[T.none, T.sixty], [T.fifty, T.ninety2]],
    ];

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    // ── camera ──
    const st1 = { tx: 945, ty: 440, zoom: 1.0, pitch: PITCH };
    const C = cameraAt(t, [
      { t: 0, tx: 860, ty: 300, zoom: 1.8, pitch: 0.12, dist: DIST },          // p. 7, the Section 4 heading
      { t: 0.5, dur: 1.9, ty: 320, zoom: 1.86 },
      { t: T.s1 - 0.12, dur: 1.0, tx: 960, ty: 955, zoom: 2.1 },               // Figure 7 (the StrategyQA line above it stays out of frame)
      { t: T.underst + 0.3, dur: 1.6, ...st1 },                               // the Sports panel lifts; desk tilts up
      { t: T.underst + 2.0, dur: 7.5, tx: 955, zoom: 1.03 },                  // slow push while the pair and the plate fill
      { t: T.s2 - 0.1, dur: 2.4, tx: 940, zoom: 1.015 },
      { t: T.s3 - 0.4, dur: 1.6, tx: X2 + 905, ty: 262, zoom: 1.75, pitch: 0.12 },   // p. 8, Section 5
      { t: T.s4 - 0.25, dur: 1.3, tx: X2 + 960, ty: 335 },                     // the last-letter bullet and its example
      { t: T.s5 - 0.05, dur: 1.4, tx: X2 + 905, ty: 450 },                     // the coin flip bullet
      { t: T.s6 - 0.35, dur: 1.4, tx: X2 + 960, ty: 740, zoom: 1.82 },         // the OOD lines + our sheet
      { t: T.s7, dur: 1.8, ty: 750, zoom: 1.86 },
      { t: T.s8 + 0.05, dur: 0.9, tx: X2 + 1127, ty: 300, zoom: 2.1 },         // Figure 8
      { t: T.s8 + 1.0, dur: 1.4, ...st1, tx: X2 + 945 },                       // station 2
      { t: T.s8 + 2.7, dur: 8.5, tx: X2 + 955, zoom: 1.03 },
    ]);

    // ── pages on the desk ──
    const pin7 = e(t, 0, 1.1, ease.outCubic), out7 = e(t, T.underst + 0.2, 0.95, ease.inCubic);
    if (out7 < 1) {
      const P7 = pagePose(RP7, GONE7, pin7, out7, -1);
      sheet(ctx, C, p7, P7);
      highlight(ctx, C, p7, P7, L.head4, sayWords(env, 0, 2, 4, t), { color: F.hlMint });
      markBox(ctx, C, p7, P7, FIG7.sub.sports, e(t, T.sports, 0.5, ease.inOutCubic), { color: F.ink, width: 3, pad: 6 });
    }
    const pin8 = e(t, T.s3 - 0.55, 1.2, ease.outCubic), out8 = e(t, T.s8 + 1.3, 1.0, ease.inCubic);
    if (pin8 > 0 && out8 < 1) {
      const P8 = pagePose(RP8, GONE8, pin8, out8, 1);
      sheet(ctx, C, p8, P8);
      highlight(ctx, C, p8, P8, L.toy, sayWords(env, 3, 3, 5, t), { color: F.hlYellow });
      highlight(ctx, C, p8, P8, L.llHead, sayWords(env, 4, 0, 3, t), { color: F.hlMint });
      highlight(ctx, C, p8, P8, L.amy, sayWords(env, 4, 4, 9, t), { color: F.hlMint });
      highlight(ctx, C, p8, P8, L.coinHead, sayWords(env, 5, 0, 2, t), { color: F.hlMint });
      highlight(ctx, C, p8, P8, L.coinEx, sayWords(env, 5, 3, 14, t), { color: F.hlMint });
      highlight(ctx, C, p8, P8, L.twoWords, sayWords(env, 6, 0, 10, t), { color: F.hlMint });
      highlight(ctx, C, p8, P8, L.flips, sayWords(env, 7, 0, 5, t), { color: F.hlMint });
      markBox(ctx, C, p8, P8, FIG8.sub.letter4, e(t, T.s8 + 0.12, 0.45, ease.inOutCubic), { color: F.ink, width: 3, pad: 6 });
      amyStrip(ctx, C, t, T, env, P8);
      oodSheet(ctx, C, t, T);
    }

    // ── the two stations ──
    station(ctx, C, t, T, env, 0);
    station(ctx, C, t, T, env, 1);

    // ── source stamp: one at a time, a short dip between changes ──
    const stamps = [
      [0, p7, S.c7s4, P7SEC],
      [T.s1 - 0.1, p7, S.c7f7, FIG7.all],
      [T.palm - 0.25, p22, S.c22t4, T4.box],
      [T.above - 0.2, p7, S.c7s4, P7RES],
      [T.s3 - 0.3, p8, S.c8s5, P8SEC],
      [T.s6 - 0.2, p8, S.c8s5, P8OOD],
      [T.s8 - 0.3, p8, S.c8f8, FIG8.all],
      [T.palm8 + 0.2, p22, S.c22t5, T5.box],
      [T.s10 - 0.1, p8, S.c8f8, FIG8.sub.coin4],
      [T.fifty - 0.2, p22, S.c22t5, T5.box],
    ];
    let k = 0;
    while (k + 1 < stamps.length && t >= stamps[k + 1][0]) k++;
    const [, sp, sl, sr] = stamps[k];
    const dip = Math.min(1, ...stamps.slice(1).map(([ts]) => clamp(Math.abs(t - ts) / 0.2)));
    cite(ctx, sp, { label: sl, rect: sr, alpha: e(t, 0.5, 0.5) * dip, side: 'right' });
  },
};

// ── pages ────────────────────────────────────────────────────────────────────
// arrives on a small arc from the side (dir −1 left, +1 right), later slides off towards the viewer
function pagePose(rest, gone, pin, out, dir) {
  const a = {
    x: rest.x + dir * 900 * (1 - pin), y: rest.y + 160 * (1 - pin), z: Math.sin(Math.PI * pin) * 140,
    w: rest.w, rot: rest.rot + dir * 0.14 * (1 - pin),
  };
  if (out <= 0) return a;
  return { x: lerp(a.x, gone.x, out), y: lerp(a.y, gone.y, out), z: Math.sin(Math.PI * out) * 120, w: rest.w, rot: lerp(a.rot, gone.rot, out) };
}

// s4: the example lifts off p. 8, large, and the last letter of each name is circled
function amyStrip(ctx, C, t, T, env, P8) {
  const lp = e(t, T.of4 - 0.1, 0.9, ease.linear);
  const go = e(t, T.s5 + 0.35, 0.9, ease.inCubic);
  if (lp <= 0 || go >= 1) return;
  const w = 470;
  const pose = liftPose(p8, P8, AMY, { x: RP8.x + 260, y: 268, z: 70, w, arc: 160 }, lp);
  pose.x += 900 * go; pose.z += 260 * go; pose.y -= 200 * go;
  sheet(ctx, C, p8, pose, { grid: 4, shadow: 0.7 });
  highlight(ctx, C, p8, pose, L.amy, sayWords(env, 4, 4, 9, t), { color: F.hlMint });
  // ink circles around the last letters ("y" of Amy, "n" of Brown), then a line under "yn"
  const ring = (c, p) => {
    if (p <= 0) return;
    const o = onSheet(C, p8, pose, c.u, c.v), r = 12.5 * (pose.w / (AMY.x1 - AMY.x0)) * o.k;
    ctx.save(); ctx.strokeStyle = F.ink; ctx.lineWidth = Math.max(2.5, 3.2 * o.k); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(o.x, o.y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); ctx.stroke(); ctx.restore();
  };
  ring(LAST_Y, e(t, T.words4 - 0.05, 0.45, ease.inOutCubic));
  ring(LAST_N, e(t, T.words4 + 0.35, 0.45, ease.inOutCubic));
  markBox(ctx, C, p8, pose, ANS_YN, e(t, T.name4 - 0.05, 0.5, ease.inOutCubic), { color: F.ink, width: 2.2, pad: 4 });   // → "yn"
}

// s6–s7 (ILLUSTRATIVE): prompt row with two-word names and two people, test row with up to four of each.
// Bars and tokens only, no names.
const OOD = { w: 1100, h: 600 };
function oodSheet(ctx, C, t, T) {
  const pin = e(t, T.s6 - 0.2, 1.0, ease.linear), go = e(t, T.s8 + 0.05, 0.8, ease.inCubic);
  if (pin <= 0 || go >= 1) return;
  const A = {
    words2: e(t, T.twoword - 0.05, 0.5), slots2: e(t, T.names6 + 0.05, 0.5), people2: e(t, T.two6 - 0.05, 0.5),
    words4: e(t, T.test7 - 0.05, 0.5), slots4: e(t, T.up7, 0.5), people4: e(t, T.four7 - 0.05, 0.5),
    labP: e(t, T.s6 + 0.3, 0.6, ease.linear), labT: e(t, T.s7 - 0.05, 0.6, ease.linear), il: e(t, T.s6 + 0.6, 0.6, ease.linear),
  };
  const pg = blankPage('cot07-ood', OOD.w, OOD.h, (g) => {
    g.strokeStyle = F.rule; g.lineWidth = 3;
    g.beginPath(); g.moveTo(40, 300); g.lineTo(1060, 300); g.stroke();
    drawTex(g, S.prompt, 40, 128, { size: 44, color: F.ink, write: A.labP });
    drawTex(g, S.test, 40, 418, { size: 44, color: F.ink, write: A.labT });
    drawTex(g, S.illus, 1066, 578, { size: 40, color: F.ink2, align: 'right', write: A.il });
    row(g, 2, 112, 210, A.words2, A.slots2, A.people2);
    row(g, 4, 402, 500, A.words4, A.slots4, A.people4);
  }, { scale: 0.9 });
  const q = ease.inOutCubic(pin);
  const pose = {
    x: lerp(RP8.x + 1100, RP8.x + 10, q) + 1100 * go, y: lerp(960, 785, q) - 150 * go,
    z: 4 + Math.sin(Math.PI * pin) * 180 + 240 * Math.sin(Math.PI * 0.5 * go), w: 520, rot: lerp(0.18, -0.01, q) + 0.15 * go,
  };
  sheet(ctx, C, pg, pose, { shadow: 0.8 });
}
// one row: n word bars → n letter slots, and n person tokens under them
function row(g, n, y, yp, pw, ps, pp) {
  const bw = n === 2 ? 130 : 100, gap = 16, x0 = 230;
  for (let i = 0; i < n; i++) {
    const p = clamp((pw - i * 0.12) / 0.6);
    if (p <= 0) continue;
    g.globalAlpha = p; g.fillStyle = '#C9C5BD';
    g.beginPath(); g.roundRect(x0 + i * (bw + gap), y - 18 + 14 * (1 - p), bw, 34, 10); g.fill();
  }
  const ax0 = x0 + n * (bw + gap) + 10, ax1 = ax0 + 70;
  if (ps > 0) {
    g.globalAlpha = clamp(ps * 2); g.strokeStyle = F.ink2; g.fillStyle = F.ink2; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(ax0, y); g.lineTo(ax0 + 70 * clamp(ps * 1.5), y); g.stroke();
    if (ps > 0.6) { g.beginPath(); g.moveTo(ax1 + 4, y); g.lineTo(ax1 - 14, y - 10); g.lineTo(ax1 - 14, y + 10); g.closePath(); g.fill(); }
    for (let i = 0; i < n; i++) {
      const p = clamp((ps - 0.2 - i * 0.1) / 0.5);
      if (p <= 0) continue;
      g.globalAlpha = p; g.strokeStyle = F.ink; g.lineWidth = 3.5;
      g.beginPath(); g.roundRect(ax1 + 26 + i * 62, y - 26, 50, 52, 6); g.stroke();
      g.fillStyle = F.ink2; g.beginPath(); g.arc(ax1 + 51 + i * 62, y + 2, 7, 0, Math.PI * 2); g.fill();
    }
  }
  for (let i = 0; i < n; i++) {
    const p = clamp((pp - i * 0.12) / 0.6);
    if (p <= 0) continue;
    const cx = x0 + 34 + i * 92, cy = yp;
    g.globalAlpha = p; g.fillStyle = F.ink3;
    g.beginPath(); g.arc(cx, cy - 22 + 10 * (1 - p), 15, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.roundRect(cx - 24, cy - 2 + 10 * (1 - p), 48, 38, [20, 20, 6, 6]); g.fill();
  }
  g.globalAlpha = 1;
}

// ── a station: subplot cards, axis, bars, plate, table pieces, lifted lines ──
function station(ctx, C, t, T, env, si) {
  const st = ST[si], ox = st.ox;
  const on = si === 0 ? T.palm - 0.2 : T.palm8 + 0.5;
  if (t < (si === 0 ? T.underst : T.s8 + 0.55)) return;
  if (si === 0 && t > T.s3 + 1.6) return;   // the camera has moved on

  // figure subplot cards (copies lifted off the page; the second arrives from where the page went)
  const cards = si === 0
    ? [
      { page: p7, from: RP7, rect: FIG7.sub.sports, cx: 395, p: e(t, T.underst + 0.1, 1.3, ease.linear) },
      { page: p7, from: GONE7, rect: FIG7.sub.csqa, cx: 160, p: e(t, T.s2 - 0.15, 1.35, ease.linear) },
    ]
    : [
      { page: p8, from: RP8, rect: FIG8.sub.letter4, cx: 160, p: e(t, T.s8 + 0.6, 1.3, ease.linear) },
      { page: p8, from: GONE8, rect: FIG8.sub.coin4, cx: 395, p: e(t, T.s10 - 0.15, 1.35, ease.linear), box: e(t, T.s10 + 1.25, 0.6, ease.inOutCubic) },
    ];
  for (const c of cards) {
    if (c.p <= 0) continue;
    const w = (c.rect.x1 - c.rect.x0) * CARD_K, h = (c.rect.y1 - c.rect.y0) * CARD_K;
    c.pose = liftPose(c.page, c.from, c.rect, { x: ox + c.cx, y: BY1 - h / 2, z: 0, w, tilt: PITCH, arc: 320 }, c.p);
  }
  cards.filter((c) => c.p >= 1).forEach((c) => drawCard(ctx, C, c));

  // axis
  axis(ctx, C, t, ox, on);

  // labels under the bars: group titles and the station label
  const base = (x) => C.p(ox + x, BY1, 0);
  const g0 = st.groups[0], g1 = st.groups[1];
  const mid = base((g0.x + g1.x) / 2);
  const stLab = si === 0 ? S.palm : S.palm2;
  drawTex(ctx, stLab, mid.x, mid.y + 104, { size: 32, color: F.ink2, align: 'center', valign: 'top', write: e(t, on + 0.2, 0.9, ease.linear) });

  // bars, far to near (all on one row: draw left to right)
  const BAR = [];
  st.groups.forEach((g, gi) => {
    const tt = T.bar[si][gi];
    [0, 1].forEach((k) => {
      const p = e(t, tt[k] - 0.1, 0.9, ease.outCubic);
      BAR.push({ g, k, p, x: g.x + (k ? 50 : -50), at: tt[k] });
    });
    const b = base(g.x);
    drawTex(ctx, S[g.title], b.x, b.y + 54, { size: 38, color: F.ink, align: 'center', valign: 'top', write: e(t, Math.max(on + 0.3, Math.min(tt[0], tt[1]) - 0.2), 0.7, ease.linear) });
  });
  for (const b of BAR) if (b.p > 0) bar(ctx, C, ox, b);
  // the reference level: unaided sports enthusiast, a glass plate at 84 (Sports only); the part of a bar above
  // the plate is drawn again on top, as segments 5 and 6 do
  if (si === 0) {
    const pz = plate(ctx, C, t, T, ox);
    if (pz !== null) for (const b of BAR) if (b.p > 0 && b.g.key === 'sports' && b.g.v[b.k] * HZ * b.p > pz + 0.5) bar(ctx, C, ox, b, pz);
  }
  for (const b of BAR) if (b.p > 0) barLabels(ctx, C, t, ox, b);

  // table pieces standing at the right, cells boxed as their bars rise
  pieces(ctx, C, t, T, st, si);

  // lifted lines of p. 7 (station 1 only)
  if (si === 0) {
    lineStrip(ctx, C, t, STRIP_SPORTS, L.sports, e(t, T.ninety + 0.9, 1.1, ease.linear), e(t, T.s2 - 0.45, 0.6, ease.inCubic), sayWords(env, 1, 13, 19, t), 980);
    lineStrip(ctx, C, t, STRIP_CSQA, L.csqa, e(t, T.s2 - 0.28, 1.1, ease.linear), e(t, T.s3 - 0.4, 0.8, ease.inCubic), sayWords(env, 2, 3, 6, t), 560);
  }

  cards.filter((c) => c.p > 0 && c.p < 1).forEach((c) => drawCard(ctx, C, c));
}

function drawCard(ctx, C, c) {
  sheet(ctx, C, c.page, c.pose, { grid: 6, shadow: 0.8 });
  if (c.box > 0) markBox(ctx, C, c.page, c.pose, c.rect, c.box, { color: F.ink, width: 3, pad: -2 });
}

function axis(ctx, C, t, ox, on) {
  const ax = e(t, on, 0.8, ease.inOutCubic);
  if (ax <= 0) return;
  const x0 = ox + AXX, x1 = ox + 1110, top = 100 * HZ;
  ctx.save();
  ctx.lineCap = 'round';
  [0, 25, 50, 75, 100].forEach((v, i) => {
    const z = v * HZ;
    if (z > top * ax + 0.5) return;
    const a = C.p(x0, BY1, z), b = C.p(lerp(x0, x1, e(t, on + 0.15 + i * 0.05, 0.7, ease.inOutCubic)), BY1, z);
    ctx.strokeStyle = v ? 'rgba(150,140,125,0.42)' : F.ink2; ctx.lineWidth = v ? 1.4 : 2.2;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    const k0 = C.p(x0 - 14, BY1, z);
    ctx.strokeStyle = F.ink2; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(k0.x, k0.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    drawTex(ctx, S[`t${v}`], k0.x - 8, k0.y, { size: 30, color: F.ink2, align: 'right', valign: 'middle', write: e(t, on + 0.2 + i * 0.08, 0.4, ease.linear) });
  });
  const a0 = C.p(x0, BY1, 0), a1 = C.p(x0, BY1, top * ax);
  ctx.strokeStyle = F.ink2; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke();
  ctx.restore();
}

function bar(ctx, C, ox, b, z0 = 0) {
  const v = b.g.v[b.k], cot = b.k === 1;
  const box = { x0: ox + b.x - BW / 2, x1: ox + b.x + BW / 2, y0: BY0, y1: BY1 };
  if (v === 0) {
    // standard prompting on four-word names: 0.0, a flat dashed outline on the desk
    const Q = [[box.x0, box.y0], [box.x1, box.y0], [box.x1, box.y1], [box.x0, box.y1]].map(([x, y]) => C.p(x, y, 0));
    ctx.save();
    ctx.globalAlpha *= clamp(b.p * 3);
    ctx.fillStyle = 'rgba(230,230,230,0.6)'; ctx.strokeStyle = PAL.stdInk; ctx.lineWidth = 2.4; ctx.setLineDash([9, 7]); ctx.lineJoin = 'round';
    ctx.beginPath(); Q.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    return;
  }
  slab(ctx, C, { ...box, z0, z1: Math.max(2, v * HZ * b.p) }, { fill: cot ? PAL.cot : PAL.std, stroke: cot ? PAL.cotInk : PAL.stdInk, width: 2.2 });
}

function barLabels(ctx, C, t, ox, b) {
  const v = b.g.v[b.k], cot = b.k === 1, ink = cot ? PAL.cotInk : PAL.stdInk;
  const top = C.p(ox + b.x, BY0, v * HZ);
  tag(ctx, S[b.g.vs[b.k]], top.x, top.y - 14, { size: 40, color: ink, align: 'center', valign: 'bottom', write: e(t, b.at + 0.3, 0.55, ease.linear), pad: 8, fill: 'rgba(255,255,255,0.88)' });
  const f = C.p(ox + b.x, BY1, 0);
  drawTex(ctx, cot ? S.cot : S.std, f.x, f.y + 12, { size: 30, color: ink, align: 'center', valign: 'top', write: e(t, b.at, 0.5, ease.linear) });
}

// glass plate at the sports enthusiast's 84, across the Sports pair, dashed in Figure 7's "Human" green
function plate(ctx, C, t, T, ox) {
  const p = e(t, T.unaided - 0.1, 1.0, ease.inOutCubic);
  if (p <= 0) return null;
  const g = ST[0].groups[1];
  const x0 = ox + g.x - 50 - BW / 2 - 26, x1 = ox + g.x + 50 + BW / 2 + 26;
  const z = lerp(g.v[0] * HZ, T4.sportsHuman * HZ, p), y0 = BY0 - 24, y1 = BY1 + 24, th = 7;
  const topF = [C.p(x0, y0, z), C.p(x1, y0, z), C.p(x1, y1, z), C.p(x0, y1, z)];
  const front = [C.p(x0, y1, z - th), C.p(x1, y1, z - th), C.p(x1, y1, z), C.p(x0, y1, z)];
  const path = (Q) => { ctx.beginPath(); Q.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); };
  ctx.save();
  ctx.globalAlpha *= clamp(p * 4);
  ctx.fillStyle = 'rgba(205,232,215,0.42)'; path(topF); ctx.fill();
  ctx.fillStyle = 'rgba(150,200,170,0.5)'; path(front); ctx.fill();
  ctx.strokeStyle = PAL.human; ctx.lineWidth = 2.6; ctx.lineJoin = 'round'; ctx.setLineDash([12, 8]);
  path(topF); ctx.stroke(); path(front); ctx.stroke();
  ctx.setLineDash([]);
  const s0 = C.p(lerp(x0, x1, 0.1), y1 - 8, z), s1 = C.p(lerp(x0, x1, 0.26), y0 + 8, z);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(s0.x, s0.y); ctx.lineTo(s1.x, s1.y); ctx.stroke();
  ctx.restore();
  // label to the right of the plate, at its height
  const c = C.p(x1 + 16, BY1, T4.sportsHuman * HZ);
  const nm = texSize(S.enth, 32);
  drawTex(ctx, S.enth, c.x, c.y, { size: 32, color: PAL.human, valign: 'middle', write: e(t, T.unaided, 0.9, ease.linear) });
  drawTex(ctx, S.v84, c.x + nm.w + 14, c.y, { size: 40, color: PAL.human, valign: 'middle', write: e(t, T.eighty - 0.05, 0.5, ease.linear) });
  return z;
}

// cut pieces of p. 22: header rows above, the PaLM 540B row below, one column group per piece
function pieces(ctx, C, t, T, st, si) {
  const P = st.P, ox = st.ox;
  const t0 = si === 0 ? T.palm - 0.45 : T.palm8 + 0.2;
  const go = si === 0 ? e(t, T.s3 - 0.4, 0.9, ease.inCubic) : 0;
  const rowH = (P.row.y1 - P.row.y0) * PK, gap = 22;
  let x = ox + PIECE_X;
  const list = [];
  P.cols.forEach((c, i) => {
    const w = (c.x1 - c.x0) * PK;
    const cx = x + w / 2;
    x += w + PIECE_GAP;
    list.push({ rect: { x0: c.x0, x1: c.x1, ...P.row }, cx, w, along: 0, p: e(t, t0 + 0.1 + i * 0.12, 1.25, ease.linear), i });
    list.push({ rect: { x0: c.x0, x1: c.x1, ...P.head }, cx, w, along: rowH + gap, p: e(t, t0 + i * 0.12, 1.25, ease.linear), i });
  });
  const draw = (pc) => {
    const h = (pc.rect.y1 - pc.rect.y0) * PK;
    const by = BY1 - pc.along * Math.cos(PITCH), bz = pc.along * Math.sin(PITCH);
    const pose = liftPose(p22, OFF22(ox), pc.rect, { x: pc.cx, y: by - h / 2, z: bz, w: pc.w, tilt: PITCH, arc: 280 }, pc.p);
    pose.z += 420 * go; pose.y -= 1400 * go;
    sheet(ctx, C, p22, pose, { grid: 3, shadow: 0.6 });
    if (pc.rect.y0 !== P.row.y0) return;
    // the cells of this piece, boxed as their bars rise
    st.groups.forEach((g, gi) => {
      if (g.piece !== pc.i) return;
      ['std', 'cot'].forEach((k, j) => {
        const r = { x0: g.col[k].x0, x1: g.col[k].x1, y0: st.table.palm540.y0, y1: st.table.palm540.y1 };
        const at = Math.max(T.bar[si][gi][j], t0 + 1.4);
        markBox(ctx, C, p22, pose, r, e(t, at, 0.55, ease.inOutCubic), { color: j ? PAL.cotInk : PAL.stdInk, width: 3.2, pad: 4 });
      });
    });
  };
  list.filter((pc) => pc.p >= 1).forEach(draw);
  list.filter((pc) => pc.p > 0 && pc.p < 1).forEach(draw);
}

// a line of p. 7 lifted from where the page went, standing above the bars, read with the marker
function lineStrip(ctx, C, t, rect, lines, lp, go, hp, w) {
  if (lp <= 0 || go >= 1) return;
  const h = w * (rect.y1 - rect.y0) / (rect.x1 - rect.x0);
  const pose = liftPose(p7, GONE7, rect, { x: 860, y: BY0 - 70 - h / 2, z: STRIP_Z, w, tilt: PITCH, arc: 120 }, lp);
  pose.y -= 1300 * go; pose.z += 300 * go;
  sheet(ctx, C, p7, pose, { grid: 4, shadow: 0.25 });
  highlight(ctx, C, p7, pose, lines, hp, { color: F.hlMint });
}

// ── stand-in redraws (PAGES = false): the two series of a subplot, from Tables 4–5, on the stand-in page ──
function redraw(g, key) {
  const d = RD[key];
  const series = [[d.std, PAL.stdInk, 4], [d.cot, PAL.cotLine, 9]];
  for (const [vals, col, r] of series) {
    g.strokeStyle = col; g.lineWidth = 2.4;
    g.beginPath(); vals.forEach((v, i) => (i ? g.lineTo(d.xs[i], d.y(v)) : g.moveTo(d.xs[i], d.y(v)))); g.stroke();
    vals.forEach((v, i) => { g.beginPath(); g.arc(d.xs[i], d.y(v), r, 0, Math.PI * 2); g.fillStyle = F.paper; g.fill(); g.stroke(); });
  }
  const at = { csqa: [472, 30, 'right'], sports: [936, 45, 'right'], letter4: [1222, 88, 'left'], coin4: [1222, 96, 'left'] }[key];
  drawTex(g, S.redrawn, at[0], d.y(at[1]), { size: 30, color: F.ink2, align: at[2], valign: 'middle' });
}
