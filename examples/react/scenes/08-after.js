// after — limits, fine-tuning, ethics, Reflexion's added station, end card.
// p. 9: the limits line (mint), the six prompt cards fill a fixed-width "prompt" slot and two more hang over its
// edge (illustrative). p. 6: the fine-tuning lines (mint), an 8B fine-tuned slab beats a 62B prompted one (no
// values: Figure 3 prints none). p. 10: the ethics statement (mint), then the loop ring comes back small with its
// Action → environment arrow stopped at a closed gate. Reflexion (arXiv:2303.11366, external card, no page) adds a
// fourth station outside Observation: fail → Reflect → Thought, then a second lap ends green. The three stations
// pulse with the voice and the context stack fans out into the readable column of Figure 1 (1d) cards one last
// time. End card on page 1 with the CC BY credit, licence and changes note.
import { W, H, clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, texSize, win, mix, desk, edgeIn, loadPaper, findPhrase, cameraAt, sheet, onSheet,
  highlight, cite, sayP, sayWords, blankPage, endCard, endCardPose, slab,
} from '/engine/folio.js';
import { PAL, LOOP, P1, FIG1, FIG1_STEPS } from './_data.js';

const S = {
  // stamps (MathJax has no "§": spelled out)
  c9: '\\text{p.~9}\\;\\cdot\\;\\text{Section 6}',
  c6: '\\text{p.~6}\\;\\cdot\\;\\text{Section 3.3}',
  c10: '\\text{p.~10}\\;\\cdot\\;\\text{Ethics statement}',
  c2: '\\text{p.~2}\\;\\cdot\\;\\text{Figure 1 (1d)}',
  ext: '\\texttt{arXiv:2303.11366}',
  // limits
  prompt: '\\text{prompt}',
  illus: '\\text{illustrative}',
  // fine-tuning
  m8: '\\text{8B, fine-tuned}',
  m62: '\\text{62B, prompted}',
  gt: '>',
  // ring
  thought: LOOP.stations.thought.label,
  act: LOOP.stations.act.label,
  obs: LOOP.stations.obs.label,
  wiki: '\\text{Wikipedia}',
  shop: '\\text{WebShop}',
  envG: '\\text{environment}',
  noBuy: '\\text{no buying}',
  noEdit: '\\text{no editing}',
  // Reflexion
  rTitle: '\\text{Reflexion}',
  rBy: '\\text{Shinn et al.}\\;\\cdot\\;\\text{March 2023}',
  fail: '\\text{fail}',
  reflect: '\\text{Reflect}',
  added: "\\text{Reflexion's addition}",
  // end card (CC BY 4.0: credit, source link, licence link, changes made)
  t1: '\\text{ReAct: Synergizing Reasoning and Acting}',
  t2: '\\text{in Language Models}',
  au: '\\text{Yao, Zhao, Yu, Du, Shafran, Narasimhan, Cao}',
  venue: '\\text{ICLR 2023}\\;\\cdot\\;\\texttt{arXiv:2210.03629}',
  url: '\\texttt{arxiv.org/abs/2210.03629}',
  cc1: '\\text{CC BY 4.0 (creativecommons.org/licenses/by/4.0)}',
  cc2: '\\text{pages shown with highlights, crops and 3D adaptations}',
};

// ── world layout ──
const RP = { x: 960, y: 560, w: 860 };                         // reading pose of the pages
const PARA6 = { x0: 300, y0: 1590, x1: 1400, y1: 1990 };       // p. 6 "ReAct performs best for fine-tuning"
const PARA10 = { x0: 300, y0: 834, x1: 1400, y1: 1190 };       // p. 10 Ethics statement
const ETH_HEAD = { x0: 300, x1: 538, y: 866 };                 // under "ETHICS STATEMENT"
const TITLE = [{ ...P1.titleLines[0], n: 39 }, { ...P1.titleLines[1], n: 18 }];

// the prompt slot (ILLUSTRATIVE): fixed inner width, six cards fill it, two more overhang its right wall
const SLOT = { x0: 1405, x1: 1745, y0: 893, y1: 1007, wall: 8, h: 12 };
const CARD = { w: 50, h: 70.8 };
const cardX = (i) => SLOT.x0 + SLOT.wall + 3.4 + CARD.w / 2 + i * (CARD.w + 3.4);
const SLOT_CY = (SLOT.y0 + SLOT.y1) / 2;
const OVER = [
  { x: SLOT.x1 + 6, y: SLOT_CY - 6, z: 13, rot: 0.13 },
  { x: SLOT.x1 + 40, y: SLOT_CY + 10, z: 20, rot: -0.09 },
];

// the two models (fine-tuning beat): no values, Figure 3 is a plot without printed numbers
const M8 = { x0: 1450, x1: 1560, y0: 790, y1: 900, h: 70 };
const M62 = { x0: 1660, x1: 1860, y0: 745, y1: 945, h: 200 };

// ── the ring (LOOP coords, mapped through ring transform R = { ox, oy, s }) ──
const LC = LOOP.c, ST = LOOP.stations, SL = LOOP.slab, EV = LOOP.env;
const KIND = {
  thought: { fill: PAL.thought, ink: PAL.thoughtInk },
  act: { fill: PAL.act, ink: PAL.actInk },
  obs: { fill: PAL.obs, ink: PAL.obsInk },
};
const REF = { x: 640, y: 1010, w: 230, d: 110, h: 60 };          // Reflexion's station, outside the ring next to Observation
const GATE = { x0: 1310, x1: 1326, y0: 330, y1: 462, h: 96 };   // across the Action → environment arrow
const deg = Math.PI / 180;
const arcPts = (a0, a1, n = 28) => Array.from({ length: n + 1 }, (_, i) => {
  const a = lerp(a0, a1, i / n) * deg;
  return [LC.x + LOOP.r * Math.cos(a), LC.y + LOOP.r * Math.sin(a)];
});
const quadPts = (p0, p1, p2, n = 22) => Array.from({ length: n + 1 }, (_, i) => {
  const s = i / n, u = 1 - s;
  return [u * u * p0[0] + 2 * u * s * p1[0] + s * s * p2[0], u * u * p0[1] + 2 * u * s * p1[1] + s * s * p2[1]];
});
const PATH = {
  t2a: arcPts(197, 266),
  a2e: quadPts([1165, 332], [1312, 338], [1354, 450]),
  e2o: quadPts([1354, 672], [1310, 800], [1166, 800]),
  o2t: arcPts(94, 164),
  o2r: quadPts([1005, 905], [880, 1010], [764, 1010]),
  r2t: quadPts([518, 990], [430, 800], [585, 630]),
};
const plen = (pts) => pts.reduce((s, q, i) => (i ? s + Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1]) : 0), 0);
const LAP = ['t2a', 'a2e', 'e2o'].map((k) => ({ k, L: plen(PATH[k]) }));
const LAP_L = LAP.reduce((s, x) => s + x.L, 0);

// the context stack = Figure 1 (1d) steps, cropped across the panel's width
const CR = { x0: 866, x1: 1382 };
const STEPS = FIG1_STEPS.d1.map((s) => ({ k: s.k, rect: { x0: CR.x0, x1: s.id === 'Act4' ? 1336 : CR.x1, y0: s.y0 - 4, y1: s.y1 + 4 } }));
const COL = { x: 640, k: 1.2, gap: 13 };
const STACK_W = 220;   // narrower than LOOP.stack.w (300) so the pile doesn't touch the Thought slab
{
  const total = STEPS.reduce((a, s) => a + (s.rect.y1 - s.rect.y0) * COL.k, 0) + COL.gap * (STEPS.length - 1);
  let y = 560 - total / 2;
  for (const s of STEPS) { const h = (s.rect.y1 - s.rect.y0) * COL.k; s.cy = y + h / 2; y += h + COL.gap; }
}

let p1, p2, p6, p9, p10, L;
const union = (rs) => ({ x0: Math.min(...rs.map((r) => r.x0)), y0: Math.min(...rs.map((r) => r.y0)), x1: Math.max(...rs.map((r) => r.x1)), y1: Math.max(...rs.map((r) => r.y1)) });

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [1, 2, 6, 9, 10]);
    p1 = P.page(1); p2 = P.page(2); p6 = P.page(6); p9 = P.page(9); p10 = P.page(10);
    L = {
      lim1: findPhrase(p9, 'complex tasks with large action spaces require more demonstrations to learn well'),
      lim2: findPhrase(p9, 'go beyond the input length limit of in-context learning'),
      ft1: findPhrase(p6, 'when finetuned with just 3,000 examples'),
      ft2: findPhrase(p6, 'PaLM-8B finetuned ReAct outperforming all PaLM-62B prompting methods'),
      eth1: findPhrase(p10, 'hooking up a large language model with an action space to interact with external environments'),
      eth2: findPhrase(p10, 'looking up inappropriate or private information, or taking harmful actions in an environment'),
      eth3: findPhrase(p10, 'models cannot really buy products on WebShop the research benchmark, or edit Wikipedia'),
      yao: findPhrase(p1, 'Shunyu Yao'),
      iclr: findPhrase(p1, 'ICLR 2023'),
    };
    L.limBox = union([...L.lim1, ...L.lim2]);
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      harder: q.w(0, 'harder'), more: q.w(0, 'more'), than: q.w(0, 'than'), fit: q.w(0, 'fit'),
      s1: q.s(1), trained: q.w(1, 'trained'), an: q.w(1, 'an'), eight: q.w(1, 'eight-billion-parameter'),
      beat: q.w(1, 'beat'), every: q.w(1, 'every'), sixty: q.w(1, 'sixty-two'),
      s2: q.s(2), ethics: q.w(2, 'ethics'), acts: q.w(2, 'acts'), look: q.w(2, 'look'),
      s3: q.s(3), buy: q.w(3, 'buy'), edit: q.w(3, 'edit'),
      s4: q.s(4), march: q.w(4, 'March'), reflexion: q.w(4, 'Reflexion'), built: q.w(4, 'built'),
      fails: q.w(4, 'fails'), writes: q.w(4, 'writes'), reflection: q.w(4, 'reflection'), wrong: q.w(4, 'wrong'),
      tries: q.w(4, 'tries'),
      s5: q.s(5), action: q.w(5, 'action'), observation: q.w(5, 'observation'), each: q.w(5, 'each'),
      written: q.w(5, 'written'), read: q.w(5, 'read'), e5: q.e(5),
      s6: q.s(6), s7: q.s(7), iclr: q.w(7, 'ICLR'), s8: q.s(8), paper: q.w(8, 'paper'),
    };
    T.lap1 = [T.built, T.fails];
    T.lap2 = [T.tries, T.tries + 0.75];

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    const C = cameraAt(t, [
      { t: 0, tx: 1225, ty: 962, zoom: 1.55, pitch: 0.18 },                                     // p. 9 + the slot
      { t: T.s1 - 0.4, dur: 1.2, tx: 960, ty: 855, zoom: 1.75 },                               // p. 6, reading
      { t: T.an - 0.15, dur: 1.4, tx: 1250, ty: 865, zoom: 1.3, pitch: 0.78 },                // page + the two models
      { t: T.beat + 0.3, dur: 3.0, yaw: -0.1 },
      { t: T.s2 - 0.3, dur: 1.2, tx: 960, ty: 525, zoom: 1.7, pitch: 0.18, yaw: 0 },           // p. 10, reading
      { t: T.s3 - 0.25, dur: 1.1, tx: 985, ty: 550, zoom: 1.25, pitch: 0.5 },                 // page left, ring right
      { t: T.s4 - 0.2, dur: 1.4, tx: 925, ty: 625, zoom: 1.2, pitch: 0.92 },                  // ring + Reflexion
      { t: T.built, dur: 5.5, yaw: 0.07 },
      { t: T.each - 0.1, dur: 1.2, tx: 640, ty: 560, zoom: 1.3, pitch: 0.5, yaw: 0 },          // the column
      { t: T.written + 0.9, dur: 1.6, zoom: 1.36 },
      { t: T.s6 - 0.5, dur: 1.0, tx: 960, ty: 540, zoom: 1, pitch: 0.15 },                     // end card
    ]);

    page9(ctx, C, t, T, env);
    promptSlot(ctx, C, t, T);
    page6(ctx, C, t, T, env);
    models(ctx, C, t, T);
    page10(ctx, C, t, T, env);
    reflexionCard(ctx, C, t, T);
    const R = ringT(t, T);
    if (R.on) ring(ctx, C, t, T, R);
    column(ctx, C, t, T, R);
    ending(ctx, C, t, T, env);

    // ── source stamps ──
    const stamps = [
      [0.6, T.s1 - 0.4, p9, S.c9, L.limBox],
      [T.s1 + 0.5, T.s2 - 0.35, p6, S.c6, PARA6],
      [T.s2 + 0.5, T.s4 - 0.3, p10, S.c10, PARA10],
      [T.each + 0.6, T.s6 - 0.35, p2, S.c2, FIG1.panels.d1],
    ];
    for (const [a, b, page, label, rect] of stamps) cite(ctx, page, { label, rect, alpha: win(t, a, b, 0.3, 0.3), side: 'right' });
    // Reflexion is external (not prepped, its own rights): its arXiv id stands where the page thumbnail would
    const ax = win(t, T.s4 + 0.4, T.s5 - 0.1, 0.3, 0.3);
    if (ax > 0) label(ctx, S.ext, W - 56, H - 60, { size: 32, color: F.ink2, align: 'right', valign: 'bottom', alpha: ax, slip: true });
  },
};

// ── s0: p. 9, the limits line, and the prompt that is already full ──
function page9(ctx, C, t, T, env) {
  const pin = e(t, 0, 1.0, ease.outCubic), out = e(t, T.s1 - 0.45, 0.9, ease.inCubic);
  if (out >= 1) return;
  const P = {
    x: lerp(-700, RP.x, pin), y: RP.y - 1300 * out, z: Math.sin(Math.PI * pin) * 140 + 240 * Math.sin(Math.PI * 0.5 * out),
    w: RP.w, rot: lerp(-0.12, -0.012, pin),
  };
  sheet(ctx, C, p9, P);
  highlight(ctx, C, p9, P, L.lim1, sayWords(env, 0, 2, 6, t), { color: F.hlMint });
  highlight(ctx, C, p9, P, L.lim2, sayWords(env, 0, 7, 11, t), { color: F.hlMint });
}

function promptSlot(ctx, C, t, T) {
  const gin = e(t, 0.05, 0.9, ease.outCubic), gout = e(t, T.s1 - 0.5, 0.8, ease.inCubic);
  if (gin <= 0 || gout >= 1) return;
  const dx = 760 * (1 - gin) + 1000 * gout;
  const { x0, x1, y0, y1, wall, h } = SLOT;
  // the slot's floor, a shade darker than the desk
  const fl = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => C.p(x + dx, y, 0));
  ctx.save();
  ctx.fillStyle = mix(F.desk, F.rule, 0.45);
  ctx.beginPath(); fl.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.fill();
  ctx.restore();
  // walls (back, left, right, front); the right wall is the limit and turns red on "fit"
  const lim = e(t, T.fit - 0.1, 0.4) * (1 - gout);
  const walls = [
    { x0, x1, y0, y1: y0 + wall },
    { x0, x1: x0 + wall, y0, y1 },
    { x0: x1 - wall, x1, y0, y1, limit: true },
    { x0, x1, y0: y1 - wall, y1 },
  ];
  for (const w of walls) {
    slab(ctx, C, { x0: w.x0 + dx, x1: w.x1 + dx, y0: w.y0, y1: w.y1, z0: 0, z1: h }, {
      fill: w.limit ? mix(F.paper, mix(F.paper, F.red, 0.2), lim) : F.paper, stroke: w.limit ? mix(F.ink, F.red, lim) : F.ink, width: w.limit ? 1.8 + 1.4 * lim : 1.8,
    });
  }
  // six cards drop in and fill it, then two more land on the right wall and hang over
  const card = cardSheet();
  for (let i = 0; i < 6; i++) {
    const p = e(t, T.harder - 0.3 + i * 0.13, 0.5, ease.outCubic);
    if (p <= 0) continue;
    sheet(ctx, C, card, { x: cardX(i) + dx + 150 * (1 - p), y: SLOT_CY - 70 * (1 - p), z: 2 + 130 * Math.sin(Math.PI * 0.5 * (1 - p)) * (p < 1 ? 1 : 0), w: CARD.w, rot: 0.25 * (1 - p) }, { shadow: 0.6, edge: true });
  }
  OVER.forEach((o, i) => {
    const p = e(t, T.more - 0.05 + i * 0.3, 0.55, ease.outCubic);
    if (p <= 0) return;
    const wob = Math.sin((t - T.than) * 9 + i * 1.7) * 0.035 * win(t, T.than, T.fit + 1.2, 0.2, 0.6);
    const pose = { x: o.x + dx + 160 * (1 - p), y: o.y - 90 * (1 - p), z: o.z + 140 * (1 - p), w: CARD.w, rot: o.rot * p + 0.3 * (1 - p) + wob };
    sheet(ctx, C, card, pose, { shadow: 0.9 });
    // red outline: these don't fit
    const a = e(t, T.than - 0.05, 0.4);
    if (a > 0) {
      const Q = [[0, 0], [card.w, 0], [card.w, card.h], [0, card.h]].map(([u, v]) => onSheet(C, card, pose, u, v));
      ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = F.red; ctx.lineWidth = 2.4; ctx.lineJoin = 'round';
      ctx.beginPath(); Q.forEach((p2, k) => (k ? ctx.lineTo(p2.x, p2.y) : ctx.moveTo(p2.x, p2.y))); ctx.closePath(); ctx.stroke(); ctx.restore();
    }
  });
  // labels
  const top = C.p((x0 + x1) / 2 + dx, y0 - 26, 0), bot = C.p((x0 + x1) / 2 + dx, y1 + 22, 0);
  label(ctx, S.prompt, top.x, top.y, { size: 46, color: F.ink, align: 'center', valign: 'bottom', write: e(t, 0.35, 0.7, ease.linear) });
  label(ctx, S.illus, bot.x, bot.y, { size: 30, color: F.ink2, align: 'center', valign: 'top', write: e(t, 0.6, 0.6, ease.linear) });
}

// a prompt example card (ILLUSTRATIVE): ruled lines only, same as the tools segment's tray
function cardSheet() {
  return blankPage('r08-card', 300, 425, (g) => {
    g.strokeStyle = F.rule; g.lineCap = 'round';
    g.lineWidth = 16; g.beginPath(); g.moveTo(40, 60); g.lineTo(190, 60); g.stroke();
    g.lineWidth = 10;
    for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(40, 120 + i * 48); g.lineTo(i === 5 ? 170 : 260, 120 + i * 48); g.stroke(); }
  }, { scale: 0.5 });
}

// ── s1: p. 6, fine-tuning ──
function page6(ctx, C, t, T, env) {
  const pin = e(t, T.s1 - 0.5, 1.1, ease.outCubic), out = e(t, T.s2 - 0.45, 0.9, ease.inCubic);
  if (pin <= 0 || out >= 1) return;
  const P = {
    x: lerp(-700, RP.x, pin), y: RP.y - 1300 * out, z: Math.sin(Math.PI * pin) * 140 + 240 * Math.sin(Math.PI * 0.5 * out),
    w: RP.w, rot: lerp(-0.12, 0.01, pin),
  };
  sheet(ctx, C, p6, P);
  highlight(ctx, C, p6, P, L.ft1, sayWords(env, 1, 2, 7, t), { color: F.hlMint });
  highlight(ctx, C, p6, P, L.ft2, sayWords(env, 1, 8, 17, t), { color: F.hlMint });
}

function models(ctx, C, t, T) {
  const r8 = e(t, T.eight - 0.1, 0.7, ease.outCubic), r62 = e(t, T.eight + 0.35, 0.8, ease.outCubic);
  const out = e(t, T.s2 - 0.5, 0.9, ease.inCubic);
  if (r8 <= 0 || out >= 1) return;
  const dx = 1300 * out;
  const won = e(t, T.beat - 0.05, 0.5);
  const b8 = { x0: M8.x0 + dx, x1: M8.x1 + dx, y0: M8.y0, y1: M8.y1, z0: 0, z1: M8.h * r8 };
  const b62 = { x0: M62.x0 + dx, x1: M62.x1 + dx, y0: M62.y0, y1: M62.y1, z0: 0, z1: M62.h * r62 };
  // far one first
  const d8 = C.p((b8.x0 + b8.x1) / 2, (b8.y0 + b8.y1) / 2, 30).depth, d62 = C.p((b62.x0 + b62.x1) / 2, (b62.y0 + b62.y1) / 2, 60).depth;
  const draw8 = () => slab(ctx, C, b8, { fill: mix(PAL.env, mix(PAL.env, PAL.good, 0.3), won), stroke: mix(F.ink, PAL.goodMark, won), width: 2.2 + 1.6 * won, alpha: clamp(r8 * 3) });
  const draw62 = () => { if (r62 > 0) slab(ctx, C, b62, { fill: PAL.env, stroke: F.ink, width: 2.2, alpha: clamp(r62 * 3) }); };
  if (d8 > d62) { draw8(); draw62(); } else { draw62(); draw8(); }
  // labels in front of each slab
  const l8 = C.p((b8.x0 + b8.x1) / 2, b8.y1 + 34, 0), l62 = C.p((b62.x0 + b62.x1) / 2, b62.y1 + 34, 0);
  label(ctx, S.m8, l8.x, l8.y, { size: 36, color: F.ink, align: 'center', valign: 'top', write: e(t, T.eight + 0.1, 0.8, ease.linear) });
  label(ctx, S.m62, l62.x, l62.y, { size: 36, color: F.ink, align: 'center', valign: 'top', write: e(t, T.eight + 0.6, 0.8, ease.linear) });
  // on "beat": a thin ">" between them
  const g = C.p((M8.x1 + M62.x0) / 2 + dx, (M8.y0 + M8.y1) / 2, 55);
  drawTex(ctx, S.gt, g.x, g.y, { size: 84, color: F.ink, align: 'center', valign: 'middle', write: e(t, T.beat, 0.5, ease.linear) });
}

// ── s2–s3: p. 10, the ethics statement ──
function page10(ctx, C, t, T, env) {
  const pin = e(t, T.s2 - 0.45, 1.1, ease.outCubic), out = e(t, T.s4 - 0.35, 0.95, ease.inCubic);
  if (pin <= 0 || out >= 1) return;
  const left = e(t, T.s3 - 0.25, 1.1, ease.inOutCubic);
  const P = {
    x: lerp(-700, RP.x, pin) - 360 * left - 600 * out, y: RP.y - 1100 * out, z: Math.sin(Math.PI * pin) * 140 + 260 * Math.sin(Math.PI * 0.5 * out),
    w: RP.w, rot: lerp(-0.12, -0.01, pin) - 0.15 * out,
  };
  sheet(ctx, C, p10, P);
  // the section heading, underlined on "ethics statement"
  const u = e(t, T.ethics - 0.05, 0.6, ease.inOutCubic);
  if (u > 0) {
    const a = onSheet(C, p10, P, ETH_HEAD.x0, ETH_HEAD.y), b = onSheet(C, p10, P, lerp(ETH_HEAD.x0, ETH_HEAD.x1, u), ETH_HEAD.y);
    ctx.save(); ctx.strokeStyle = F.ink2; ctx.lineWidth = 3 * a.k * 0.506; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
  }
  highlight(ctx, C, p10, P, L.eth1, sayWords(env, 2, 5, 8, t), { color: F.hlMint });
  highlight(ctx, C, p10, P, L.eth2, sayWords(env, 2, 10, 16, t), { color: F.hlMint });
  highlight(ctx, C, p10, P, L.eth3, sayP(env, 3, t), { color: F.hlMint });
}

// ── s4: the external Reflexion card (blank sheet, our type; no page of that paper on the desk) ──
function reflexionCard(ctx, C, t, T) {
  const p = e(t, T.s4 - 0.35, 1.0, ease.linear), out = e(t, T.s5 - 0.2, 0.8, ease.inCubic);
  if (p <= 0 || out >= 1) return;
  const wT = e(t, T.reflexion - 0.25, 0.8, ease.linear), wB = e(t, T.march + 0.25, 1.0, ease.linear);
  const card = blankPage('r08-reflexion', 1200, 640, (g) => {
    drawTex(g, S.rTitle, 600, 300, { size: 156, color: F.ink, align: 'center', valign: 'baseline', write: wT });
    drawTex(g, S.rBy, 600, 452, { size: 66, color: F.ink2, align: 'center', valign: 'baseline', write: wB });
  }, { scale: 0.6 });
  const q = ease.inOutCubic(p);
  const pose = {
    x: lerp(-380, 450, q) - 1100 * out, y: lerp(60, 470, q), z: Math.sin(Math.PI * p) * 260 + 200 * Math.sin(Math.PI * 0.5 * out),
    w: 500, rot: lerp(-0.3, 0.04, q), tilt: lerp(0, 0.86, q),
  };
  sheet(ctx, C, card, pose, { grid: 8 });
}

// ── the ring ──
function ringT(t, T) {
  const k3 = e(t, T.s3 - 0.15, 1.0, ease.outCubic);
  const k4 = e(t, T.s4 - 0.2, 1.3, ease.inOutCubic);
  const kx = e(t, T.written - 0.1, 1.1, ease.inCubic);
  return { ox: lerp(1325, 1060, k4) + 1000 * (1 - k3) + 1700 * kx, oy: lerp(550, 610, k4), s: lerp(0.5, 0.78, k4), on: k3 > 0 && kx < 1 };
}
const RW = (R, x, y, z = 0) => [R.ox + (x - LC.x) * R.s, R.oy + (y - LC.y) * R.s, z * R.s];
const RPj = (C, R, x, y, z = 0) => { const [a, b, c] = RW(R, x, y, z); return C.p(a, b, c); };
const boxAt = (R, x, y, w, d, h, hop = 0) => {
  const [cx, cy] = RW(R, x, y);
  return { x0: cx - (w * R.s) / 2, x1: cx + (w * R.s) / 2, y0: cy - (d * R.s) / 2, y1: cy + (d * R.s) / 2, z0: hop * R.s, z1: (h + hop) * R.s };
};
const pulse = (t, t0, amp = 34, dur = 0.55) => Math.sin(Math.PI * clamp((t - t0) / dur)) * amp;

function lapAt(f) {   // position along Thought → Action → environment → Observation, f 0..1; returns { k, pt, done }
  let d = clamp(f) * LAP_L;
  for (const s of LAP) {
    if (d <= s.L) return { k: s.k, local: d / s.L };
    d -= s.L;
  }
  return { k: 'e2o', local: 1 };
}
function pathPt(pts, f) {
  const Ls = plen(pts);
  let d = clamp(f) * Ls;
  for (let i = 1; i < pts.length; i++) {
    const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d <= s) return [lerp(pts[i - 1][0], pts[i][0], d / (s || 1)), lerp(pts[i - 1][1], pts[i][1], d / (s || 1))];
    d -= s;
  }
  return pts.at(-1);
}

function ring(ctx, C, t, T, R) {
  const kc = RPj(C, R, LC.x, LC.y).k;
  const lw = Math.max(2.4, 4.6 * R.s * kc);
  const appear = e(t, T.s3 - 0.1, 1.0, ease.linear);
  // ── arrows on the desk ──
  const gateUp = e(t, T.s3 + 0.35, 0.5, ease.outBack) * (1 - e(t, T.s4 - 0.1, 0.6, ease.inCubic));
  const a2eP = lerp(0.64, 1, e(t, T.s4 + 0.1, 0.6, ease.inOutCubic));
  pathArrow(ctx, C, R, PATH.t2a, appear, { width: lw, head: 5.5 * lw });
  pathArrow(ctx, C, R, PATH.a2e, appear * a2eP, { width: lw, head: 5.5 * lw, headOn: a2eP > 0.99 });
  pathArrow(ctx, C, R, PATH.e2o, appear, { width: lw, head: 5.5 * lw });
  pathArrow(ctx, C, R, PATH.o2t, appear, { width: lw, head: 5.5 * lw });
  // Reflexion's detour: fail → Reflect → Thought (its ink, the thought colour: a reflection is written text)
  const refOut = e(t, T.s5 - 0.15, 0.5, ease.inOutCubic);
  pathArrow(ctx, C, R, PATH.o2r, e(t, T.fails + 0.3, 0.6, ease.inOutCubic), { width: lw * 1.1, head: 5.5 * lw, color: PAL.thoughtInk, alpha: 1 - refOut });
  pathArrow(ctx, C, R, PATH.r2t, e(t, T.reflection - 0.05, 0.9, ease.inOutCubic), { width: lw * 1.1, head: 5.5 * lw, color: PAL.thoughtInk, alpha: 1 - refOut });

  // ── laps: a bead runs the loop; lap 1 ends at Observation in a fail, lap 2 ends green ──
  const laps = [
    { t0: T.lap1[0], t1: T.lap1[1], color: F.ink2, fade: T.writes },
    { t0: T.lap2[0], t1: T.lap2[1], color: PAL.goodMark, fade: T.s5 + 0.2 },
  ];
  const hopFromLaps = { act: 0, obs: 0 };
  for (const Lp of laps) {
    const f = clamp((t - Lp.t0) / (Lp.t1 - Lp.t0));
    if (t < Lp.t0) continue;
    const fa = 1 - e(t, Lp.fade, 0.5);
    if (fa <= 0) continue;
    const at = lapAt(f);
    const order = ['t2a', 'a2e', 'e2o'];
    for (const k of order) {
      const idx = order.indexOf(k), cur = order.indexOf(at.k);
      const p = idx < cur ? 1 : idx === cur ? at.local : 0;
      if (p > 0) pathArrow(ctx, C, R, PATH[k], p, { width: lw * 1.6, head: 0, color: Lp.color, alpha: fa });
    }
    // station hops as the bead passes
    const fAct = LAP[0].L / LAP_L, fObs = 1;
    hopFromLaps.act = Math.max(hopFromLaps.act, pulse(t, Lp.t0 + fAct * (Lp.t1 - Lp.t0) - 0.1, 22, 0.45));
    hopFromLaps.obs = Math.max(hopFromLaps.obs, pulse(t, Lp.t1 - 0.05, 26, 0.5));
    if (f < 1) {
      const [bx, by] = pathPt(PATH[at.k], at.local);
      const b = RPj(C, R, bx, by, 6);
      ctx.save(); ctx.globalAlpha *= fa;
      ctx.fillStyle = Lp.color; ctx.strokeStyle = F.paper; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(b.x, b.y, Math.max(8, 15 * R.s * b.k), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }

  // ── slabs, back to front ──
  const good = e(t, T.lap2[1] - 0.05, 0.35) * (1 - e(t, T.s5 + 0.1, 0.5));
  const hop = {
    thought: pulse(t, T.s5, 40) + pulse(t, T.reflection + 0.85, 18, 0.45),
    act: pulse(t, T.action, 40) + hopFromLaps.act,
    obs: pulse(t, T.observation, 40) + hopFromLaps.obs,
  };
  const items = [];
  const rise = (k, i) => e(t, T.s3 + 0.05 + i * 0.12, 0.55, ease.outBack);
  ['thought', 'act', 'obs'].forEach((key, i) => {
    const st = ST[key], K = KIND[key];
    const r = rise(key, i);
    const b = boxAt(R, st.x, st.y, SL.w, SL.d, SL.h * r, hop[key]);
    const isObs = key === 'obs';
    const big = pulse(t, key === 'thought' ? T.s5 : key === 'act' ? T.action : T.observation, 1, 0.55);
    items.push({
      depth: C.p((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, b.z1).depth,
      draw: () => slab(ctx, C, b, {
        fill: isObs ? mix(K.fill, PAL.good, good) : K.fill,
        stroke: isObs ? mix(K.ink, PAL.goodMark, good) : K.ink,
        width: 2.4 + 1.8 * big + (isObs ? 1.4 * good : 0),
        alpha: clamp(r * 3),
      }),
    });
  });
  // environment
  const er = e(t, T.s3 + 0.3, 0.6, ease.outBack);
  const eb = boxAt(R, (EV.x0 + EV.x1) / 2, (EV.y0 + EV.y1) / 2, EV.x1 - EV.x0, EV.y1 - EV.y0, EV.h * er);
  items.push({ depth: C.p((eb.x0 + eb.x1) / 2, (eb.y0 + eb.y1) / 2, eb.z1).depth, draw: () => slab(ctx, C, eb, { fill: PAL.env, stroke: F.ink, width: 2.2, alpha: clamp(er * 3) }) });
  // the gate across Action → environment (s3)
  if (gateUp > 0) {
    const gb = boxAt(R, (GATE.x0 + GATE.x1) / 2, (GATE.y0 + GATE.y1) / 2, GATE.x1 - GATE.x0, GATE.y1 - GATE.y0, GATE.h * gateUp);
    items.push({ depth: C.p((gb.x0 + gb.x1) / 2, (gb.y0 + gb.y1) / 2, gb.z1).depth, draw: () => slab(ctx, C, gb, { fill: mix(F.rule, F.paper, 0.35), stroke: F.ink, width: 2 }) });
  }
  // Reflect
  const rr = e(t, T.writes - 0.15, 0.6, ease.outBack) * (1 - refOut);
  if (rr > 0) {
    const rb = boxAt(R, REF.x, REF.y, REF.w, REF.d, REF.h * rr);
    items.push({ depth: C.p((rb.x0 + rb.x1) / 2, (rb.y0 + rb.y1) / 2, rb.z1).depth, draw: () => slab(ctx, C, rb, { fill: F.block, stroke: PAL.thoughtInk, width: 2.8, alpha: clamp(rr * 3) }) });
  }
  // the context stack in the middle (until the cards fan out in s5)
  const stackOn = t < T.each + 0.05;
  if (stackOn) {
    const [sx, sy] = RW(R, LOOP.stack.x, LOOP.stack.y);
    items.push({ depth: C.p(sx, sy, 40 * R.s).depth, draw: () => STEPS.forEach((s, i) => drawStep(ctx, C, s, stackPose(R, i), appear)) });
  }
  items.sort((a, b) => b.depth - a.depth).forEach((it) => it.draw());

  // ── labels (screen space, ≥ 30 px) ──
  const al = e(t, T.s3 + 0.3, 0.5);
  ['thought', 'act', 'obs'].forEach((key) => {
    const st = ST[key];
    const a = RPj(C, R, st.x, st.y - SL.d / 2, SL.h + hop[key]);
    const th = key === 'thought';
    label(ctx, S[key], a.x + (th ? 6 : 0), a.y - 8, { size: 32, color: F.ink, align: th ? 'right' : 'center', valign: 'bottom', alpha: al });
  });
  const ea = RPj(C, R, (EV.x0 + EV.x1) / 2, EV.y0, EV.h * er);
  // Wikipedia / WebShop (the paper's two web environments) leave before the generic label writes on
  const gOut = e(t, T.s4 - 0.1, 0.35), gen = e(t, T.s4 + 0.35, 0.7, ease.linear);
  label(ctx, S.wiki, ea.x, ea.y - 10, { size: 32, color: F.ink, align: 'center', valign: 'bottom', alpha: al * (1 - gOut) });
  label(ctx, S.shop, ea.x, ea.y - 52, { size: 32, color: F.ink, align: 'center', valign: 'bottom', alpha: al * (1 - gOut) });
  label(ctx, S.envG, ea.x, ea.y - 10, { size: 32, color: F.ink, align: 'center', valign: 'bottom', write: gen });
  // ring is our diagram of Section 2
  const il = RPj(C, R, EV.x1, EV.y1 + 150, 0);
  label(ctx, S.illus, il.x, il.y, { size: 30, color: F.ink2, align: 'right', valign: 'top', alpha: al * (1 - e(t, T.each - 0.2, 0.4)) });
  // gate tags
  if (gateUp > 0) {
    // below the gate, inside the ring's right side (clear of the Action and environment labels)
    const g = RPj(C, R, (GATE.x0 + GATE.x1) / 2, GATE.y1, 0);
    label(ctx, S.noBuy, g.x + 10, g.y + 18, { size: 30, color: F.ink, align: 'right', valign: 'top', write: e(t, T.buy - 0.1, 0.6, ease.linear), slip: true });
    label(ctx, S.noEdit, g.x + 10, g.y + 66, { size: 30, color: F.ink, align: 'right', valign: 'top', write: e(t, T.edit - 0.1, 0.6, ease.linear), slip: true });
  }
  // fail tag on the Observation side
  const fa = e(t, T.fails - 0.05, 0.35, ease.outBack) * (1 - e(t, T.tries - 0.1, 0.4));
  if (fa > 0) {
    const f = RPj(C, R, 1030, 905, 0);
    label(ctx, S.fail, f.x, f.y, { size: 34, color: F.red, align: 'left', valign: 'middle', alpha: clamp(fa), slip: true, outline: F.red });
  }
  // Reflect label + "Reflexion's addition"
  if (rr > 0) {
    const r = RPj(C, R, REF.x, REF.y - REF.d / 2, REF.h * rr);
    label(ctx, S.reflect, r.x, r.y - 8, { size: 32, color: PAL.thoughtInk, align: 'center', valign: 'bottom', alpha: clamp(rr * 2) });
    const r2 = RPj(C, R, REF.x, REF.y + REF.d / 2 + 30, 0);
    label(ctx, S.added, r2.x, r2.y, { size: 30, color: F.ink2, align: 'center', valign: 'top', write: e(t, T.reflection + 0.55, 0.8, ease.linear), alpha: 1 - refOut, slip: true });
  }
  // lap 2 lands: a green check above Observation
  const ck = e(t, T.lap2[1] - 0.05, 0.4) * (1 - e(t, T.s5 + 0.1, 0.4));
  if (ck > 0) {
    const o = RPj(C, R, ST.obs.x + SL.w / 2 + 40, ST.obs.y, SL.h + 10);
    const s = 26;
    ctx.save(); ctx.strokeStyle = PAL.goodMark; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.setLineDash([3 * s * ck, 4 * s]);
    ctx.beginPath(); ctx.moveTo(o.x - s * 0.7, o.y); ctx.lineTo(o.x - s * 0.15, o.y + s * 0.55); ctx.lineTo(o.x + s * 0.9, o.y - s * 0.75); ctx.stroke();
    ctx.restore();
  }
}

// polyline on the desk (LOOP coords) drawn to progress p, with an arrowhead at its tip
function pathArrow(ctx, C, R, pts, p, { color = F.ink, width = 3, head = 16, alpha = 1, dash = null, headOn = true } = {}) {
  if (p <= 0 || alpha <= 0) return;
  const scr = pts.map(([x, y]) => RPj(C, R, x, y, 0));
  const acc = [0];
  for (let i = 1; i < scr.length; i++) acc.push(acc[i - 1] + Math.hypot(scr[i].x - scr[i - 1].x, scr[i].y - scr[i - 1].y));
  const target = acc.at(-1) * clamp(p);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(scr[0].x, scr[0].y);
  let end = scr[0], d0 = scr[0], d1 = scr[1];
  for (let i = 1; i < scr.length; i++) {
    d0 = scr[i - 1]; d1 = scr[i];
    if (acc[i] <= target) { ctx.lineTo(scr[i].x, scr[i].y); end = scr[i]; continue; }
    const f = (target - acc[i - 1]) / (acc[i] - acc[i - 1] || 1);
    end = { x: lerp(d0.x, d1.x, f), y: lerp(d0.y, d1.y, f) };
    ctx.lineTo(end.x, end.y);
    break;
  }
  ctx.stroke();
  head *= clamp(target / (head * 1.6));
  if (head > 0.5 && headOn) {
    const dx = d1.x - d0.x, dy = d1.y - d0.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(end.x + ux * head * 0.35, end.y + uy * head * 0.35);
    ctx.lineTo(end.x - ux * head * 0.75 - uy * head * 0.5, end.y - uy * head * 0.75 + ux * head * 0.5);
    ctx.lineTo(end.x - ux * head * 0.75 + uy * head * 0.5, end.y - uy * head * 0.75 - ux * head * 0.5);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// ── the context stack and the column of Figure 1 (1d) cards ──
function stackPose(R, i) {
  const [x, y, z] = RW(R, LOOP.stack.x, LOOP.stack.y, (i + 1) * LOOP.stack.dz);
  const r = STEPS[i].rect, f = (r.x1 - r.x0) / (CR.x1 - CR.x0);
  return { x: x - (STACK_W * R.s * (1 - f)) / 2, y, z, w: STACK_W * R.s * f, rot: 0, src: r };
}
function colPose(i) {
  const s = STEPS[i];
  const w = (s.rect.x1 - s.rect.x0) * COL.k, W0 = (CR.x1 - CR.x0) * COL.k;   // left-aligned like the figure
  return { x: COL.x - W0 / 2 + w / 2, y: s.cy, z: 0, w, rot: -0.008, src: s.rect };
}
function drawStep(ctx, C, s, pose, alpha = 1) {
  if (alpha <= 0) return;
  sheet(ctx, C, p2, pose, { alpha, shadow: 0.5, grid: 4 });
  const K = KIND[s.k], r = pose.src;
  const Q = [[r.x0, r.y0], [r.x1, r.y0], [r.x1, r.y1], [r.x0, r.y1]].map(([u, v]) => onSheet(C, p2, pose, u, v));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath(); Q.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath();
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha *= 0.55; ctx.fillStyle = K.fill; ctx.fill(); ctx.restore();
  ctx.strokeStyle = K.ink; ctx.lineWidth = Math.max(1.2, 2.2 * Q[0].k * (pose.w / 600)); ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}

function column(ctx, C, t, T, R) {
  if (t < T.each) return;
  for (let i = 0; i < STEPS.length; i++) {
    const f = e(t, T.each + i * 0.07, 0.85, ease.inOutCubic);
    const out = e(t, T.e5 - 0.1 + i * 0.025, 0.75, ease.inOutCubic);
    if (out >= 1) continue;
    const a = stackPose(R, i), b = colPose(i);
    const pose = {
      src: b.src, x: lerp(a.x, b.x, f) + 1900 * out, y: lerp(a.y, b.y, f), z: lerp(a.z, 0, f) + Math.sin(Math.PI * f) * 150,
      w: lerp(a.w, b.w, f), rot: lerp(0, b.rot, f),
    };
    drawStep(ctx, C, STEPS[i], pose);
  }
}

// ── s6–s8: end card ──
function ending(ctx, C, t, T, env) {
  const pc = (t - (T.s6 - 0.3)) / 5.0;
  if (pc <= 0) return;
  const X0 = 930, Y0 = 300, GAP = 18;
  const tsz = Math.min(56, 900 / texSize(S.t1, 1).w);
  endCard(ctx, C, p1, pc, { lines: [{ tex: S.t1, size: tsz, color: F.ink }, { tex: S.t2, size: tsz, color: F.ink }], x: X0, y: Y0, gap: GAP });
  const EP = endCardPose(pc);
  highlight(ctx, C, p1, EP, TITLE, sayP(env, 6, t), { color: F.hlYellow });
  highlight(ctx, C, p1, EP, L.yao, e(t, T.s7, 0.45, ease.linear), { color: F.hlMint });
  highlight(ctx, C, p1, EP, L.iclr, e(t, T.iclr, 0.6, ease.linear), { color: F.hlMint });
  // the rest of the citation, same line layout as endCard, timed to the voice
  let yy = Y0;
  for (const s of [tsz, tsz]) yy += s * 0.9 + GAP + s * 0.25;
  yy += 12;
  const rest = [
    { src: S.au, size: 34, color: F.ink2, w: e(t, T.s7 - 0.05, 1.0, ease.linear) },
    { src: S.venue, size: 34, color: F.ink2, w: e(t, T.iclr - 0.1, 0.8, ease.linear) },
    { src: S.url, size: 32, color: F.blue, w: e(t, T.iclr + 0.7, 0.8, ease.linear) },
    { src: S.cc1, size: 30, color: F.ink2, w: e(t, T.iclr + 1.25, 0.8, ease.linear), pre: 10 },
    { src: S.cc2, size: 30, color: F.ink2, w: e(t, T.iclr + 1.6, 0.8, ease.linear) },
  ];
  let urlY = 0;
  for (const Ln of rest) {
    yy += (Ln.pre || 0) + Ln.size * 0.9;
    if (Ln.src === S.url) urlY = yy;
    drawTex(ctx, Ln.src, X0, yy, { size: Ln.size, color: Ln.color, write: Ln.w });
    yy += GAP + Ln.size * 0.25;
  }
  // "right next to this video": underline the link
  const ul = e(t, T.paper - 0.05, 0.7, ease.inOutCubic);
  if (ul > 0) {
    const w = texSize(S.url, 32).w;
    ctx.save(); ctx.strokeStyle = F.blue; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(X0, urlY + 10); ctx.lineTo(X0 + w * ul, urlY + 10); ctx.stroke(); ctx.restore();
  }
}

// ── small helpers (kit candidates) ──
// TeX label with an optional paper slip behind it (reads over pages and slabs)
function label(ctx, src, x, y, { size, color, align = 'left', valign = 'baseline', write = 1, alpha = 1, slip = false, outline = null }) {
  if (write <= 0 || alpha <= 0) return;
  if (slip) {
    const sz = texSize(src, size);
    const x0 = align === 'center' ? x - sz.w / 2 : align === 'right' ? x - sz.w : x;
    const y0 = valign === 'middle' ? y - sz.h / 2 : valign === 'bottom' ? y - sz.h : valign === 'top' ? y : y - sz.asc;
    ctx.save();
    ctx.globalAlpha *= alpha * clamp(write * 3);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.shadowColor = 'rgba(40,30,20,0.16)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
    ctx.beginPath(); ctx.roundRect(x0 - 14, y0 - 10, sz.w + 28, sz.h + 20, 6); ctx.fill();
    if (outline) { ctx.shadowColor = 'transparent'; ctx.strokeStyle = outline; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.restore();
  }
  drawTex(ctx, src, x, y, { size, color, align, valign, write, alpha });
}
