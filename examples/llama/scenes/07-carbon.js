// carbon — Section 6 (p. 10) and Table 15 (p. 11).
// s0 p. 10 arrives, mint on the section heading. s1 the Wh formula lifts off as a strip and stands at the back of the
// desk; its three terms are boxed in ink as the voice names them (400 W, PUE 1.1 tags), the camera glances at the
// PUE line. s2 the tCO2eq formula lifts and stands under it, an ink arrow Wh → MWh, mint on the US-average line.
// s3 mint on "same formula … OPT and BLOOM" and "same data center"; a glass plate lies down: "same data center assumed".
// s4 p. 11 lands on top, Table 15 lifts and stands behind the plate. s5–s7 tCO2eq bars rise on the plate from Table
// 15's printed values (65B, then 7B/13B/33B, then OPT and BLOOM), cells boxed on the standing table. s8 back to p. 10
// (Table 15 and p. 11 leave): the development estimate, then a glass block of 1,015 t rises behind the bars at the
// same scale. s9 the "We hope" lines lift off as a standing strip, the block dims to an outline: authors' hope.

// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars) and redrawn figures.
const PAGES = true;

import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, texSize, win, desk, edgeIn, loadPaper, findPhrase, camAt, sheet, sheetPt,
  onSheet, highlight, markBox, liftPose, arcPose, cite, sayWords, standIn, prism, slab, arrow3, contactShadow, tag,
} from '/engine/folio.js';
import { PAL, P10, T15, DEV } from './_data.js';

const row = (k) => T15.rows.find((r) => r.key === k);
const num = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}');   // 1015 → 1{,}015 (TeX thousands)

const S = {
  c10: '\\text{p.~10}\\;\\cdot\\;\\text{Section 6}',
  c11: '\\text{p.~11}\\;\\cdot\\;\\text{Table 15}',
  w400: `${T15.assumptions.watts}\\,\\text{W}`,                 // 400 W (p. 10, Table 15 caption)
  pue: `\\text{PUE } ${T15.assumptions.pue}`,                  // PUE 1.1
  same: '\\text{same data center assumed}',
  unit: '\\mathrm{tCO_2eq}',
  ticks: ['0', '50', '100', '150', '200'],
  n7: '\\text{7B}', n13: '\\text{13B}', n33: '\\text{33B}', n65: '\\text{65B}',
  nOpt: '\\text{OPT-175B}', nBloom: '\\text{BLOOM-175B}', llama: '\\text{LLaMA}',
  recomp: '\\text{recomputed by the LLaMA authors}',
  dev: `${num(DEV.tco2)}\\ \\mathrm{tCO_2eq}`,                 // 1,015 tCO2eq (p. 10)
  dev1: '\\text{developing the models}',
  dev2: `\\text{about ${DEV.months} months (estimate)}`,
  mwh: `${num(DEV.mwh)}\\ \\text{MWh}`,                        // 2,638 MWh (p. 10, "around … under our assumptions")
  hope: "\\text{authors' hope}",
  // PAGES = false: our typeset copies of the two formula lines and of Table 15 on the stand-in pages
  fWh: ['\\mathrm{Wh}', '=', '\\text{GPU-h}', '\\times', '(\\text{GPU}', '\\text{power consumption})', '\\times', '\\text{PUE},'],
  fT: ['\\text{tCO}_2\\text{eq}', '=', '\\text{MWh}', '\\times', '0.385.'],
};

// ── page px ──
// formula strips (padded ~3 px vertically; the lines above and below stay on the page)
const S1 = { x0: 189, y0: 2114, x1: 818, y1: 2155 };                       // Wh = GPU-h×(GPU power consumption)×PUE,
const S2 = { x0: 986, y0: 756, x1: 1322, y1: 803 };                        // tCO2eq = MWh × 0.385.
// the three terms on strip 1, from the glyph columns of page-10.png (the word boxes merge "×(" and ")×")
let TERM = {
  gpuh: { x0: 282, y0: 2120, x1: 364, y1: 2150 },                          // GPU-h
  power: { x0: 391, y0: 2119, x1: 720, y1: 2151 },                         // (GPU power consumption)
  pue: { x0: 747, y0: 2120, x1: 801, y1: 2150 },                           // PUE
  wh: { x0: 197, y0: 2121, x1: 241, y1: 2148 },                            // Wh
  mwh: { x0: 1127, y0: 766, x1: 1198, y1: 793 },                           // MWh
};
const TB = { x0: T15.caption.x0, y0: T15.box.y0 - 7, x1: T15.caption.x1 + 3, y1: 608 };   // Table 15 + the caption's title line
const cell = (k, col) => { const r = row(k), c = T15.cols[col]; return { x0: c.x0 - 6, y0: r.y0 - 3, x1: c.x1 + 6, y1: r.y1 + 3 }; };
const HOPE_A = { x0: 843, y0: 1132, x1: 1463, y1: 1205 };                  // "We hope … help to / reduce … training is"
const HOPE_B = { x0: 843, y0: 1208, x1: 1015, y1: 1243 };                  // "already done" (the rest of the line stays)
const R_LEFT = { x0: 190, y0: 1680, x1: 815, y1: 2158 };                   // stamp regions
const R_RIGHT_TOP = { x0: 845, y0: 200, x1: 1466, y1: 905 };
const R_RIGHT_LOW = { x0: 845, y0: 940, x1: 1466, y1: 1245 };

// ── world layout (desk px) ──
const P10_HOME = { x: 640, y: 560, w: 1000, rot: -0.008 };
const P10_ASIDE = { dx: -420, dy: 320, rot: -0.07 };                       // where p. 11 pushes it
const P10_BACK = { dx: -120, dy: 200 };                                    // where it lies from s8 on
const P11_HOME = { x: 610, y: 590, w: 1000, rot: 0.012 };
const TH = 0.56;                                                           // the standing formula strips' lean
const SC1 = 880 / (S1.x1 - S1.x0);                                          // strip scale (world px per page px)
const H1 = (S1.y1 - S1.y0) * SC1, H2 = (S2.y1 - S2.y0) * SC1, GAP = 78;
const B1 = { y: -205, z: 112 };                                           // strip 1's bottom edge
const B2 = { y: B1.y + (GAP + H2) * Math.cos(TH), z: B1.z - (GAP + H2) * Math.sin(TH) };
const STRIP1 = { x: 700, y: B1.y - H1 / 2, z: B1.z, w: 880, tilt: TH, src: S1 };
const STRIP2 = { x: 520, y: B2.y - H2 / 2, z: B2.z, w: (S2.x1 - S2.x0) * SC1, tilt: TH, src: S2 };

const KT = 0.75;                                                           // world px per tonne: bars and the block
const PLATE = { x0: 1170, x1: 2050, y0: 36, y1: 336 };                     // ILLUSTRATIVE glass plate
const BAR = { w: 64, y0: 118, y1: 182 };
const AX = 1222;                                                           // the tCO2eq axis
const BARS = [
  { k: 'm7', x: 1300, name: S.n7, fill: PAL.m7Fill, ink: PAL.m7 },
  { k: 'm13', x: 1384, name: S.n13, fill: PAL.m13Fill, ink: PAL.m13 },
  { k: 'm33', x: 1468, name: S.n33, fill: PAL.m33Fill, ink: PAL.m33 },
  { k: 'm65', x: 1552, name: S.n65, fill: PAL.m65Fill, ink: PAL.m65 },
  { k: 'opt', x: 1735, name: S.nOpt, fill: PAL.otherFill, ink: PAL.other },
  { k: 'bloom', x: 1955, name: S.nBloom, fill: PAL.otherFill, ink: PAL.other },
].map((b) => ({ ...b, v: row(b.k).tco2, vt: String(row(b.k).tco2) }));
const BLOCK = { x0: 1262, x1: 1592, y0: 52, y1: 104 };                    // development block, behind the LLaMA bars
const TABLE_AT = { x: 1590, bottom: -80, z: 120, w: 1000, tilt: 0.86 };   // Table 15, standing behind the plate
const HOPE_AT = { x: 765, bottom: 380, z: 95, w: 770, tilt: 0.78 };       // the "We hope" strip, standing in front-left

let p10, p11, L;

export default {
  async setup(env) {
    await loadB1B();
    for (const v of Object.values(S)) (Array.isArray(v) ? v : [v]).forEach((s) => tex(s));
    BARS.forEach((b) => tex(b.vt));
    const P = await loadPaper(env.ep, [10, 11]);
    if (!PAGES) TERM = { ...TERM, ...termsFromLayout() };   // the boxes follow our typeset copy, not the paper's glyphs
    p10 = PAGES ? P.page(10) : standIn(P.page(10), { blank: [P10.formulaWh, P10.formulaT], draw: redrawFormulas });
    p11 = PAGES ? P.page(11) : standIn(P.page(11), { blank: [T15.box], draw: redrawTable15 });
    L = {
      head: findPhrase(p10, '6 Carbon footprint'),
      pue: findPhrase(p10, 'where we set the Power Usage Effectiveness (PUE) at 1.1'),
      us: findPhrase(p10, 'the US national average carbon intensity factor of 0.385 kg CO 2 eq/KWh.'),
      apply: findPhrase(p10, 'We apply the same formula to OPT and BLOOM for fair comparison'),
      comparing: findPhrase(p10, 'comparing the cost in carbon emission of training of these models if they were trained in the same data center'),
      estimate: findPhrase(p10, 'we estimate that we used 2048 A100-80GB for a period of approximately 5 months to develop our models'),
      total: findPhrase(p10, 'a total emission of 1,015 tCO 2 eq.'),
      hope: findPhrase(p10, 'We hope that releasing these models will help to reduce future carbon emission since the training is already done'),
      title15: findPhrase(p11, 'Carbon footprint of training different models in the same data center.'),
      strip1: findPhrase(p10, 'Wh = GPU-h×(GPU power consumption)×PUE,'),
      strip2: findPhrase(p10, 'tCO 2 eq = MWh × 0.385.'),
    };
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      s1: q.s(1), gpu: q.w(1, 'GPU'), four: q.w(1, 'four'), one: q.w(1, 'one'), point: q.w(1, 'point'), data: q.w(1, 'data-center'),
      s2: q.s(2), energy: q.w(2, 'energy'), us: q.w(2, 'US'),
      s3: q.s(3), as: q.w(3, 'as'), same2: q.w(3, 'same', 2), e3: q.e(3),
      s4: q.s(4), e4: q.e(4),
      s5: q.s(5), about: q.w(5, 'about'), hundred5: q.w(5, 'hundred'), tonnes5: q.w(5, 'tonnes'), e5: q.e(5),
      s6: q.s(6), hundred6: q.w(6, 'hundred', 2), thirty: q.w(6, 'thirty-seven'),
      s7: q.s(7), hundred7: q.w(7, 'hundred'), eighty: q.w(7, 'eighty-three'), e7: q.e(7),
      s8: q.s(8), and8: q.w(8, 'and'), fifteen: q.w(8, 'fifteen'), e8: q.e(8),
      s9: q.s(9), hope: q.w(9, 'hope'), end: env.dur,
    };
    T.lift1 = T.s1 - 0.3;                 // the Wh strip leaves the page
    T.lift2 = T.s2 - 0.1;                 // the tCO2eq strip
    T.stripsOut = T.s3 - 0.15;            // both strips are picked up
    T.p11in = T.e3 - 0.05;                // p. 11 lands, p. 10 pushed aside
    T.lift15 = T.e4 - 0.05;               // Table 15 lifts
    T.out15 = T.e7 + 0.2;                 // Table 15 and p. 11 leave, p. 10 comes back
    T.pull = T.and8 + 0.25;               // camera pulls back, the block rises
    T.liftHope = T.e8 - 0.2;

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    const C = camAt(t, [
      { t: 0, tx: 470, ty: 1010, zoom: 1.45, pitch: 0.2, yaw: 0 },                     // s0: Section 6, left column
      { t: T.lift1 + 0.05, dur: 1.5, tx: 700, ty: -40, zoom: 1.18, pitch: 0.56 },       // s1: the strip at the back
      { t: T.data - 0.2, dur: 0.9, tx: 860, ty: -60, zoom: 1.3, pitch: 0.42 },          // glance: PUE 1.1
      { t: T.s2 - 0.25, dur: 1.1, tx: 720, ty: 40, zoom: 1.18, pitch: 0.5 },            // s2: both strips + US line
      { t: T.s3 - 0.1, dur: 1.1, tx: 860, ty: 370, zoom: 1.6, pitch: 0.3 },             // s3: "We apply the same formula"
      { t: T.as - 0.15, dur: 1.1, tx: 1180, ty: 230, zoom: 1.15, pitch: 0.38 },         // s3: "comparing…" + the plate
      { t: T.p11in - 0.1, dur: 1.0, tx: 640, ty: 210, zoom: 1.3, pitch: 0.24 },         // s4: p. 11, Table 15
      { t: T.lift15 + 0.1, dur: 1.6, tx: 1560, ty: 20, zoom: 1.1, pitch: 0.86, cy: 620 }, // s5: table + plate
      { t: T.about - 0.35, dur: 1.0, tx: 1470, ty: -40, zoom: 1.32, cy: 625 },          // the 65B row
      { t: T.hundred5 - 0.1, dur: 1.2, tx: 1560, ty: 20, zoom: 1.1, cy: 620 },          // its bar
      { t: T.tonnes5 + 0.4, dur: 6.0, yaw: -0.06, tx: 1590 },
      { t: T.s7, dur: 4.0, yaw: 0.0 },
      { t: T.out15 + 0.05, dur: 1.2, tx: 680, ty: 720, zoom: 1.7, pitch: 0.3, cy: 540 },     // s8: p. 10, right column
      { t: T.pull, dur: 1.7, tx: 1230, ty: 120, zoom: 0.8, pitch: 0.78, cy: 700 },      // the block
      { t: T.liftHope + 0.6, dur: 5.0, tx: 1210, zoom: 0.83, yaw: -0.04 },              // s9: hold, slow drift
    ]);

    const P10p = p10Pose(t, T), P11p = p11Pose(t, T);
    // pages: p. 11 lies on top of p. 10 until p. 10 comes back over it
    if (t < T.out15 + 0.3) { page10(ctx, C, t, T, env, P10p); page11(ctx, C, t, T, P11p); }
    else { page11(ctx, C, t, T, P11p); page10(ctx, C, t, T, env, P10p); }

    plate(ctx, C, t, T);
    bars(ctx, C, t, T);
    table15(ctx, C, t, T, P11p);
    strips(ctx, C, t, T, P10p);
    hopeStrip(ctx, C, t, T, env, P10p);

    // ── source stamps ──
    const stamps = [
      [0.8, T.data - 0.2, p10, S.c10, R_LEFT],
      [T.data - 0.2, T.p11in, p10, S.c10, R_RIGHT_TOP],
      [T.p11in + 0.3, T.out15, p11, S.c11, TB],
      [T.out15 + 0.3, T.end + 1, p10, S.c10, R_RIGHT_LOW],
    ];
    for (const [a, b, page, label, rect] of stamps) cite(ctx, page, { label, rect, alpha: win(t, a, b, 0.25, 0.25), side: 'right' });
  },
};

// ── poses ──
function arrive(base, p, { dx = 0, dy = 800, rot = 0.1, arc = 170 } = {}) {
  const q = ease.outCubic(clamp(p));
  return { ...base, x: base.x + dx * (1 - q), y: base.y + dy * (1 - q), z: (base.z || 0) + Math.sin(Math.PI * clamp(p)) * arc, rot: (base.rot || 0) + rot * (1 - q) };
}
function p10Pose(t, T) {
  const base = arrive(P10_HOME, e(t, 0, 1.15, ease.linear), { dx: -700, dy: 620, rot: -0.12 });
  // pushed aside when p. 11 lands, back in s8 to a reading spot a little lower left (clear of the plate)
  const aside = e(t, T.p11in - 0.05, 1.0, ease.inOutCubic), back = e(t, T.out15 + 0.1, 1.1, ease.inOutCubic);
  const k = aside * (1 - back);
  return {
    ...base,
    x: base.x + P10_ASIDE.dx * k + P10_BACK.dx * back, y: base.y + P10_ASIDE.dy * k + P10_BACK.dy * back,
    rot: base.rot + P10_ASIDE.rot * k, z: base.z + Math.sin(Math.PI * e(t, T.out15 + 0.1, 1.1, ease.linear)) * 110,
  };
}
function p11Pose(t, T) {
  const pin = e(t, T.p11in, 1.0, ease.linear), out = e(t, T.out15, 1.2, ease.inOutCubic);
  if (pin <= 0) return null;
  let P = arrive(P11_HOME, pin, { dx: 900, dy: 700, rot: 0.14, arc: 190 });
  // once its table has lifted, the page is slid aside, out of the bar chart's way
  const side = e(t, T.lift15 + 0.7, 1.1, ease.inOutCubic);
  P = { ...P, x: P.x - 620 * side, y: P.y + 160 * side, rot: P.rot - 0.05 * side };
  if (out <= 0) return P;
  return arcPose(P, { ...P, x: P.x - 1300, y: P.y - 900, rot: -0.3 }, out, 220);
}

// ── p. 10 and its marks ──
function page10(ctx, C, t, T, env, P) {
  sheet(ctx, C, p10, P);
  const mint = (lines, p) => highlight(ctx, C, p10, P, lines, p, { color: F.hlMint });
  mint(L.head, sayWords(env, 0, 4, 7, t));
  mint(L.pue, sayWords(env, 1, 13, 14, t));
  mint(L.us, sayWords(env, 2, 5, 8, t));
  mint(L.apply, sayWords(env, 3, 0, 7, t));
  mint(L.comparing, sayWords(env, 3, 8, 15, t));
  mint(L.estimate, sayWords(env, 8, 0, 10, t));
  mint(L.total, sayWords(env, 8, 11, 16, t));
}
function page11(ctx, C, t, T, P) {
  if (!P) return;
  sheet(ctx, C, p11, P);
  highlight(ctx, C, p11, P, L.title15, e(t, T.s4 + 0.05, 1.0, ease.linear), { color: F.hlMint });
}

// ── s1–s2: the two formula lines, lifted and standing at the back ──
function strips(ctx, C, t, T, P10p) {
  const out = e(t, T.stripsOut, 1.0, ease.inCubic);
  if (out >= 1) return;
  const away = (pose) => ({ ...pose, y: pose.y - 1300 * out, z: pose.z + 260 * Math.sin(Math.PI * 0.5 * out) });
  const p1 = e(t, T.lift1, 1.45, ease.linear), p2 = e(t, T.lift2, 1.25, ease.linear);
  let A = null, B = null;
  if (p1 > 0) A = liftPose(p10, P10p, S1, away({ ...STRIP1, arc: 320 }), p1);
  if (p2 > 0) B = liftPose(p10, P10p, S2, away({ ...STRIP2, arc: 180 }), p2);
  if (A) sheet(ctx, C, p10, A, { grid: 8, shadow: 0.5 });
  if (B) sheet(ctx, C, p10, B, { grid: 6, shadow: 0.5 });
  if (A) {
    const box = (r, p) => markBox(ctx, C, p10, A, r, p, { color: F.ink, width: 2.2, pad: 3 });
    box(TERM.gpuh, e(t, T.gpu, 0.55, ease.inOutCubic));
    box(TERM.power, e(t, T.four, 0.8, ease.inOutCubic));
    box(TERM.pue, e(t, T.one, 0.5, ease.inOutCubic));
    // tags above the boxed terms (above, so strip 2 can stand underneath)
    const above = (r) => { const a = onSheet(C, p10, A, (r.x0 + r.x1) / 2, S1.y0); return { x: a.x, y: a.y - 16 }; };
    const a400 = above(TERM.power), aPue = above(TERM.pue);
    tag(ctx, S.w400, a400.x, a400.y, { size: 46, align: 'center', valign: 'bottom', write: e(t, T.four + 0.45, 0.6, ease.linear) });
    tag(ctx, S.pue, aPue.x + 20, aPue.y, { size: 46, align: 'center', valign: 'bottom', write: e(t, T.point + 0.2, 0.6, ease.linear) });
  }
  if (A && B) {
    // Wh (strip 1) → MWh (strip 2): energy feeds the carbon formula
    const from = sheetPt(p10, A, (TERM.wh.x0 + TERM.wh.x1) / 2, S1.y1 + 4);
    const to = sheetPt(p10, B, (TERM.mwh.x0 + TERM.mwh.x1) / 2 - 8, S2.y0 - 2);
    const mid = [lerp(from[0], to[0], 0.25) - 10, lerp(from[1], to[1], 0.75), lerp(from[2], to[2], 0.75)];
    const pts = bez(from, mid, to, 18).map(([x, y, z]) => [x, y + 2, z + 2]);
    arrow3(ctx, C, pts, e(t, T.energy - 0.15, 0.7, ease.inOutCubic), { color: F.ink, width: 3.4, headLen: 20 });
  }
}
const bez = (a, b, c, n) => Array.from({ length: n + 1 }, (_, i) => {
  const s = i / n, u = 1 - s;
  return [0, 1, 2].map((j) => u * u * a[j] + 2 * u * s * b[j] + s * s * c[j]);
});

// ── s3: the glass plate (same data center) ──
function plateIn(t, T) { return e(t, T.same2 - 0.2, 0.9, ease.outCubic); }
function plate(ctx, C, t, T) {
  const p = plateIn(t, T);
  if (p <= 0) return;
  const z = 150 * (1 - p), dx = 260 * (1 - p), rot = 0.08 * (1 - p);
  const cx = (PLATE.x0 + PLATE.x1) / 2, cy = (PLATE.y0 + PLATE.y1) / 2;
  const poly = [[PLATE.x0, PLATE.y0], [PLATE.x1, PLATE.y0], [PLATE.x1, PLATE.y1], [PLATE.x0, PLATE.y1]].map(([x, y]) => {
    const u = x - cx, v = y - cy;
    return [cx + dx + u * Math.cos(rot) - v * Math.sin(rot), cy + u * Math.sin(rot) + v * Math.cos(rot)];
  });
  if (z > 1) contactShadow(ctx, C, poly, { z, alpha: 0.6 * clamp(p * 2) });
  // glass: a light tint (PAL.glass at half strength), then the ink outline at full strength
  prism(ctx, C, poly, z, z + 3, { fill: PAL.glass, stroke: null, alpha: 0.55 * clamp(p * 2) });
  prism(ctx, C, poly, z, z + 3, { fill: 'rgba(0,0,0,0)', stroke: F.ink, width: 1.5, alpha: clamp(p * 2) });
  // label on the plate's front edge: on screen whenever any bar is
  const f = C.p(cx + dx, PLATE.y1 + 14, z);
  tag(ctx, S.same, f.x, f.y, { size: 38, align: 'center', valign: 'top', write: e(t, T.same2 + 0.15, 0.8, ease.linear) });
}

// ── s5–s9: bars on the plate, the development block ──
function barRise(t, T, k) {
  switch (k) {
    case 'm65': return e(t, T.hundred5 - 0.1, 1.7, ease.inOutCubic);
    case 'm7': return e(t, T.tonnes5 - 0.05, 0.8, ease.outCubic);
    case 'm13': return e(t, T.tonnes5 + 0.25, 0.8, ease.outCubic);
    case 'm33': return e(t, T.tonnes5 + 0.55, 0.9, ease.outCubic);
    case 'opt': return e(t, T.hundred6 - 0.1, 1.6, ease.inOutCubic);
    case 'bloom': return e(t, T.hundred7 - 0.1, 1.3, ease.inOutCubic);
    default: return 0;
  }
}
function slotIn(t, T, k) {
  if (k === 'opt') return e(t, T.s6, 0.5);
  if (k === 'bloom') return e(t, T.s7 - 0.05, 0.4);
  return barRise(t, T, k) > 0 ? 1 : 0;
}
function bars(ctx, C, t, T) {
  if (t < T.s5 - 0.3) return;
  const axA = e(t, T.lift15 + 0.9, 0.7);
  const yb = BAR.y0 - 4;
  // tick guides on the back plane, then the axis
  ctx.save();
  ctx.globalAlpha *= axA;
  ctx.strokeStyle = F.rule; ctx.lineCap = 'round';
  [50, 100, 150, 200].forEach((v) => {
    const a = C.p(AX, yb, v * KT), b = C.p(BARS.at(-1).x + BAR.w / 2 + 14, yb, v * KT);
    ctx.lineWidth = 1.4 * a.k; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  });
  ctx.strokeStyle = F.ink2;
  const a0 = C.p(AX, yb, 0), a1 = C.p(AX, yb, 212 * KT);
  ctx.lineWidth = 2.2 * a0.k; ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke();
  S.ticks.forEach((s, i) => {
    const v = i * 50, a = C.p(AX - 9, yb, v * KT), b = C.p(AX, yb, v * KT);
    ctx.lineWidth = 2 * a.k; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    if (v % 100 === 0) drawTex(ctx, s, a.x - 8, a.y, { size: 30, color: F.ink2, align: 'right', valign: 'middle' });   // 50 and 150: ticks only
  });
  drawTex(ctx, S.unit, a1.x, a1.y - 12, { size: 36, color: F.ink, align: 'center', valign: 'bottom' });
  ctx.restore();

  // the development block (s8), behind every bar
  const bk = e(t, T.pull + 0.1, 1.5, ease.inOutCubic);
  const dim = e(t, T.hope - 0.1, 0.9, ease.inOutCubic);
  if (bk > 0) {
    const poly = [[BLOCK.x0, BLOCK.y0], [BLOCK.x1, BLOCK.y0], [BLOCK.x1, BLOCK.y1], [BLOCK.x0, BLOCK.y1]];
    const h = DEV.tco2 * KT * bk;
    prism(ctx, C, poly, 0, h, { fill: `rgba(120,130,140,${(0.18 * (1 - dim)).toFixed(3)})`, stroke: F.ink2, width: 1.8 });
    if (dim > 0) dashedTop(ctx, C, poly, h, dim);
  }

  // bars, far to near
  const order = BARS.map((b) => ({ b, d: C.p(b.x, (BAR.y0 + BAR.y1) / 2, 60).depth })).sort((a, b) => b.d - a.d);
  for (const { b } of order) {
    const r = barRise(t, T, b.k), slot = slotIn(t, T, b.k);
    if (slot <= 0) continue;
    const x0 = b.x - BAR.w / 2, x1 = b.x + BAR.w / 2;
    if (r <= 0.002) {
      // an empty slot: the bar's footprint drawn on the plate
      const Q = [[x0, BAR.y0], [x1, BAR.y0], [x1, BAR.y1], [x0, BAR.y1]].map(([x, y]) => C.p(x, y, 5));
      ctx.save(); ctx.globalAlpha *= slot; ctx.strokeStyle = b.ink; ctx.lineWidth = 2 * Q[0].k; ctx.setLineDash([6, 5]);
      ctx.beginPath(); Q.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.stroke(); ctx.restore();
      continue;
    }
    slab(ctx, C, { x0, x1, y0: BAR.y0, y1: BAR.y1, z0: 5, z1: 5 + Math.max(1, b.v * KT * r) }, { fill: b.fill, stroke: b.ink, width: 2.2 });
  }
  // values on top, names on the plate
  for (const b of BARS) {
    const r = barRise(t, T, b.k), slot = slotIn(t, T, b.k);
    if (slot <= 0) continue;
    if (r > 0.9) {
      const top = C.p(b.x, BAR.y0, 5 + b.v * KT + 6);   // the top face's back edge, so the value clears the face
      drawTex(ctx, b.vt, top.x, top.y - 4, { size: 42, color: F.ink, align: 'center', valign: 'bottom', write: clamp((r - 0.9) * 10) });
    }
    const n = C.p(b.x, BAR.y1 + 22, 0);
    drawTex(ctx, b.name, n.x, n.y, { size: clamp(36 * n.k, 30, 34), color: b.k.startsWith('m') ? b.ink : F.ink2, align: 'center', valign: 'top', alpha: clamp(slot * 2) });
  }
  // group labels: LLaMA under the four, the recomputation tag under OPT and BLOOM
  const g = C.p((BARS[0].x + BARS[3].x) / 2, BAR.y1 + 80, 0);
  drawTex(ctx, S.llama, g.x, g.y, { size: 34, color: F.ink2, align: 'center', valign: 'top', write: e(t, T.tonnes5 + 0.4, 0.7, ease.linear) });
  const r2 = C.p((BARS[4].x + BARS[5].x) / 2, BAR.y1 + 80, 0);
  tag(ctx, S.recomp, r2.x, r2.y, { size: 32, color: F.ink, align: 'center', valign: 'top', write: e(t, T.eighty + 0.25, 0.9, ease.linear) });

  // block labels
  if (bk > 0) {
    const a = C.p(BLOCK.x1 + 26, BLOCK.y1, DEV.tco2 * KT * 0.86);
    const al = 1 - 0.35 * dim;
    tag(ctx, S.dev, a.x, a.y, { size: 52, align: 'left', valign: 'middle', write: e(t, T.fifteen - 0.1, 0.8, ease.linear), alpha: al });
    tag(ctx, S.dev1, a.x, a.y + 62, { size: 34, color: F.ink2, align: 'left', valign: 'middle', write: e(t, T.fifteen + 0.5, 0.7, ease.linear), alpha: al });
    tag(ctx, S.dev2, a.x, a.y + 110, { size: 34, color: F.ink2, align: 'left', valign: 'middle', write: e(t, T.fifteen + 0.8, 0.7, ease.linear), alpha: al });
    tag(ctx, S.mwh, a.x, a.y + 158, { size: 34, color: F.ink2, align: 'left', valign: 'middle', write: e(t, T.fifteen + 1.1, 0.7, ease.linear), alpha: al });
  }
}
function dashedTop(ctx, C, poly, h, a) {
  // the dimmed block keeps a dashed outline of its top and edges
  const Q = poly.map(([x, y]) => C.p(x, y, h));
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = F.ink2; ctx.setLineDash([8, 7]); ctx.lineWidth = 1.6 * Q[0].k;
  ctx.beginPath(); Q.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.stroke(); ctx.restore();
}

// ── s4–s7: Table 15 lifted off p. 11, standing behind the plate; cells boxed with the voice ──
function table15(ctx, C, t, T, P11p) {
  const p = e(t, T.lift15, 1.5, ease.linear), out = e(t, T.out15, 1.0, ease.inCubic);
  if (p <= 0 || out >= 1 || !P11p) return;
  const h = (TB.y1 - TB.y0) * TABLE_AT.w / (TB.x1 - TB.x0);
  const to = { x: TABLE_AT.x, y: TABLE_AT.bottom - h / 2 - 1300 * out, z: TABLE_AT.z + 300 * Math.sin(Math.PI * 0.5 * out), w: TABLE_AT.w, tilt: TABLE_AT.tilt, arc: 240 };
  const A = liftPose(p11, P11p, TB, to, p);
  sheet(ctx, C, p11, A, { grid: 10, shadow: 0.22 });
  highlight(ctx, C, p11, A, L.title15, 1, { color: F.hlMint });
  const box = (r, col, a) => markBox(ctx, C, p11, A, r, a, { color: col, width: 2.6, pad: 3 });
  box(cell('m65', 'gpuHours'), PAL.m65, e(t, T.about, 0.6, ease.inOutCubic));
  box(cell('m65', 'tco2'), PAL.m65, e(t, T.hundred5, 0.5, ease.inOutCubic));
  box(cell('opt', 'tco2'), F.ink, e(t, T.hundred6, 0.5, ease.inOutCubic));
  box(cell('bloom', 'tco2'), F.ink, e(t, T.hundred7, 0.5, ease.inOutCubic));
}

// ── s9: the "We hope" lines lift off p. 10 and stand left of the block; the marker runs on the strip ──
function hopeStrip(ctx, C, t, T, env, P10p) {
  const p = e(t, T.liftHope, 1.3, ease.linear);
  if (p <= 0) return;
  const sc = HOPE_AT.w / (HOPE_A.x1 - HOPE_A.x0);
  const hA = (HOPE_A.y1 - HOPE_A.y0) * sc, hB = (HOPE_B.y1 - HOPE_B.y0) * sc, wB = (HOPE_B.x1 - HOPE_B.x0) * sc;
  const th = HOPE_AT.tilt, gap = 3 * sc;
  // B is the lower line: its bottom edge is the stack's bottom edge; A sits right above it in the same plane
  const bB = { y: HOPE_AT.bottom, z: HOPE_AT.z };
  const bA = { y: bB.y - (hB + gap) * Math.cos(th), z: bB.z + (hB + gap) * Math.sin(th) };
  const left = HOPE_AT.x - HOPE_AT.w / 2;
  const toA = { x: HOPE_AT.x, y: bA.y - hA / 2, z: bA.z, w: HOPE_AT.w, tilt: th, arc: 220 };
  const toB = { x: left + wB / 2, y: bB.y - hB / 2, z: bB.z, w: wB, tilt: th, arc: 240 };
  const A = liftPose(p10, P10p, HOPE_A, toA, p);
  const B = liftPose(p10, P10p, HOPE_B, toB, e(t, T.liftHope + 0.1, 1.3, ease.linear));
  sheet(ctx, C, p10, A, { grid: 6, shadow: 0.45 });
  sheet(ctx, C, p10, B, { grid: 3, shadow: 0.45 });
  // the marker follows the voice across both crops
  const pr = sayWords(env, 9, 0, 12, t);
  const n01 = L.hope[0].n + L.hope[1].n, tot = n01 + L.hope[2].n;
  highlight(ctx, C, p10, A, L.hope.slice(0, 2), clamp(pr * tot / n01), { color: F.hlMint });
  highlight(ctx, C, p10, B, L.hope.slice(2), clamp((pr * tot - n01) / L.hope[2].n), { color: F.hlMint });
  const top = onSheet(C, p10, A, HOPE_A.x0 + 10, HOPE_A.y0);
  tag(ctx, S.hope, top.x, top.y - 18, { size: 40, align: 'left', valign: 'bottom', write: e(t, T.hope, 0.7, ease.linear) });
}

// ── PAGES = false: our typeset copies on the stand-in pages ──
// each formula is typeset part by part, scaled to the width the paper's line takes, so the ink boxes can follow it
const FLAY = { wh: { parts: S.fWh, x0: 197, x1: 810, y: 2144 }, t: { parts: S.fT, x0: 995, x1: 1312, y: 789 } };
function layout(f) {
  const gap = 0.28, ws = f.parts.map((p) => texSize(p, 1).w), tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
  const size = Math.min(38, (f.x1 - f.x0) / tot);
  let x = f.x0;
  return { size, xs: ws.map((w) => { const a = x; x += (w + gap) * size; return [a, a + w * size]; }) };
}
function termsFromLayout() {
  const a = layout(FLAY.wh), b = layout(FLAY.t), box = (L, i, j, y0, y1) => ({ x0: L.xs[i][0] - 2, y0, x1: L.xs[j][1] + 2, y1 });
  return { wh: box(a, 0, 0, 2121, 2148), gpuh: box(a, 2, 2, 2120, 2150), power: box(a, 4, 5, 2119, 2151), pue: box(a, 7, 7, 2120, 2150), mwh: box(b, 2, 2, 766, 793) };
}
function redrawFormulas(g) {
  for (const f of [FLAY.wh, FLAY.t]) {
    const L = layout(f);
    f.parts.forEach((p, i) => drawTex(g, p, L.xs[i][0], f.y, { size: L.size, color: F.ink, valign: 'baseline' }));
  }
}
function redrawTable15(g) {
  const c = T15.cols;
  const head = [['\\text{GPU-hours}', c.gpuHours], ['\\text{Total power}', c.mwh], ['\\mathrm{tCO_2eq}', c.tco2]];
  head.forEach(([s, col]) => drawTex(g, s, (col.x0 + col.x1) / 2, 262, { size: 32, color: F.ink, align: 'center' }));
  for (const r of T15.rows) {
    const y = r.y1 - 4;
    drawTex(g, `\\text{${r.label}}`, c.name.x0, y, { size: 32, color: F.ink });
    drawTex(g, num(r.gpuHours), c.gpuHours.x1, y, { size: 32, color: F.ink, align: 'right' });
    drawTex(g, `${r.mwh}\\ \\text{MWh}`, c.mwh.x1, y, { size: 32, color: F.ink, align: 'right' });
    drawTex(g, String(r.tco2), (c.tco2.x0 + c.tco2.x1) / 2, y, { size: 32, color: F.ink, align: 'center' });
  }
  g.strokeStyle = F.ink; g.lineWidth = 2;
  [[T15.box.y0 + 2], [T15.header.y1 + 10], [T15.box.y1 - 4]].forEach(([y]) => { g.beginPath(); g.moveTo(T15.box.x0, y); g.lineTo(T15.box.x1, y); g.stroke(); });
}
