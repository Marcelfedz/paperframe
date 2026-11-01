// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars) and redrawn figures.
const PAGES = true;

// evidence — Section 3 and Table 3 (p. 4), the "corresponding papers" line (p. 5), then Table 3 as honest
// 3D bars from 0. Group A: 13B against GPT-3 175B on the seven tasks they share, both losses outlined in ink
// and tagged "behind". Group B: 65B against Chinchilla 70B and PaLM 540B on all eight columns, the two losses
// to PaLM outlined and tagged. The four sub-point margins get a bracket each. Last: the single-V100 line
// (p. 5) lifted as two strips, and a GPU tile sliding under a small 13B slab.
// Guardrails (briefing): p. 5 never lies on the desk; its strips come from a masked copy, so the sentence
// "First, LLaMA-65B outperforms Chinchilla-70B … but BoolQ" never renders. Sizes on every chip. The tags
// "zero-shot" and "others: from their papers" stay with the bars. No ratios, no averages, no "beats".
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, texSize, desk, edgeIn, loadPaper, findPhrase, camAt, sheet, highlight,
  markBox, liftPose, slab, tag, cite, contactShadow, sayWords, standIn, masked,
} from '/engine/folio.js';
import { PAL, T3, CMP } from './_data.js';

// ── world layout (desk px) ───────────────────────────────────────────────────
const PITCH = 0.85;                // bar beats; standing cards and strips tilt the same, so they face the camera
const DIST = 8000;                 // long lens: bars stay upright across the frame
const HZ = 3.0;                    // world z per point: 100 stands 300 high
const FRONT = 1150, BACK = 480;    // front edge of the bar footprints: front row (A, then B), back row (A small)
const DEP = 44;                    // bar depth along y
const SMALL = 0.72;                // group A's scale once it has slid to the back
const GA_FULL = { ox: 260, yF: FRONT, s: 1 }, GA_SMALL = { ox: 70, yF: BACK, s: SMALL };
const GA_DIM = { pitch: 200, bw: 64, gap: 8, n: 7 };
const GB = { ox: 140, yF: FRONT, s: 1, pitch: 204, bw: 56, gap: 8, n: 8 };
const STAGE = { tx: 960, ty: 700, pitch: PITCH, dist: DIST, zoom: 0.95 };

// p. 4 on the desk in front of the stage; Table 3 (with its caption) stands at the back right
const P4 = { x: 900, y: 1500, w: 1000, rot: -0.012 };
const T3U = { x0: T3.box.x0, y0: T3.box.y0, x1: T3.box.x1, y1: T3.caption.y1 };
const CARD_W = 760, CARD_H = CARD_W * (T3U.y1 - T3U.y0) / (T3U.x1 - T3U.x0);
const CARD = { x: 1530, y: 600 - CARD_H / 2, z: 0, w: CARD_W, tilt: PITCH };
const TAGS_AT = { x: 1530, y: 740 };          // the two context tags sit on the desk at the card's foot

// p. 5 never lies on the desk: it stays off frame and only its strips fly in
const P5OFF = { x: 3300, y: 1300, w: 1000, rot: 0.08 };
const P5MASK = [{ x0: 458, y0: 542, x1: 812, y1: 579 }];          // "First, LLaMA-65B outper-" (briefing guardrail)
const STRIP1 = { x0: 192, y0: 466, x1: 812, y1: 579 };              // "In Table 3 … report numbers from the cor- responding papers."
const STRIP1_TO = { x: 560, w: 760, foot: 600 };
const LINE_A = { x0: 535, y0: 1374, x1: 812, y1: 1409 };            // "This model runs on a"
const LINE_B = { x0: 192, y0: 1412, x1: 632, y1: 1447 };            // "single V100 GPU during inference."
const SEC32 = { x0: 192, y0: 1374, x1: 812, y1: 1447 };

// station 2 (last sentence): the strips stand at the back, the 13B slab and a GPU tile in front
const ST2 = { x: 3360, y: 760 };
const P5OFF2 = { x: ST2.x + 2200, y: 1400, w: 1000, rot: 0.08 };
const SC2 = 1.15;                  // world px per page px for the two line strips
const SLAB13 = { w: 120, d: 80, h: 13 * 2.2 };   // the cover's scale: 2.2 world px per billion parameters
const TILE = { w: 210, d: 130, h: 12, fill: '#E3E5E9', stroke: F.ink2 };   // one GPU tile (segment 4's grid style)

// stamp regions on p. 4
const SEC3 = { x0: 190, y0: 1215, x1: 700, y1: 1392 };
const BULLET = { x0: 250, y0: 1400, x1: 810, y1: 1480 };
// row labels on Table 3 (words.json), boxed on each chip: name + size, or the size alone for the merged "LLaMA" label
const ROWLAB = {
  gpt3: { x0: 235, y0: 262, x1: 478, y1: 298 }, chinchilla: { x0: 235, y0: 338, x1: 478, y1: 373 },
  palm540: { x0: 235, y0: 451, x1: 478, y1: 486 }, m13: { x0: 415, y0: 541, x1: 478, y1: 576 }, m65: { x0: 415, y0: 616, x1: 478, y1: 651 },
};

const STY = {
  m13: { fill: PAL.m13Fill, ink: PAL.m13, chip: '\\text{LLaMA 13B}' },
  gpt3: { fill: PAL.gpt3Fill, ink: PAL.gpt3, chip: '\\text{GPT-3, 175B}' },
  m65: { fill: PAL.m65Fill, ink: PAL.m65, chip: '\\text{LLaMA 65B}' },
  chinchilla: { fill: PAL.chinchillaFill, ink: PAL.chinchilla, chip: '\\text{Chinchilla, 70B}' },
  palm540: { fill: PAL.palmFill, ink: PAL.palm, chip: '\\text{PaLM, 540B}' },
};

const S = {
  c4s3: '\\text{p. 4}\\;\\cdot\\;\\text{Section 3}',
  c4t3: '\\text{p. 4}\\;\\cdot\\;\\text{Table 3}',
  c5s31: '\\text{p. 5}\\;\\cdot\\;\\text{Section 3.1}',
  c5s32: '\\text{p. 5}\\;\\cdot\\;\\text{Section 3.2}',
  zero: '\\text{zero-shot}',
  others: '\\text{others: from their papers}',
  behind: '\\text{behind}',
  dash: '\\text{–}',   // the table's "-": an en dash
  gpu: '\\text{1 GPU (V100)}',
  b13: '\\text{13B}',
  t0: '0', t25: '25', t50: '50', t75: '75', t100: '100',
  ...Object.fromEntries(Object.entries(STY).map(([k, v]) => [`chip_${k}`, v.chip])),
  ...Object.fromEntries(Object.entries(T3.texLabels).map(([k, v]) => [`task_${k}`, v])),
};

const mix = (a, b, f) => {   // hex colour a → b by f, as hex (slab() shades it)
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * f).toString(16).padStart(2, '0')).join('')}`;
};
const bump = (t, at, hold = 0.35) => e(t, at, 0.22) * (1 - e(t, at + 0.22 + hold, 0.4));
const cellOf = (row, task) => { const c = T3.cols[task], r = T3.rows[row]; return { x0: c.x0 - 6, y0: r.y0 - 4, x1: c.x1 + 6, y1: r.y1 + 4 }; };
const valOf = (row, task) => T3.rows[row].v[T3.order.indexOf(task)];

let p4, p5m, L, BARS;

export default {
  async setup(env) {
    await loadB1B();
    const P = await loadPaper(env.ep, [4, 5]);
    p4 = PAGES ? P.page(4) : standIn(P.page(4));
    p5m = masked(PAGES ? P.page(5) : standIn(P.page(5)), P5MASK);   // the masked copy is all this scene ever shows of p. 5
    L = {
      bench: findPhrase(p4, 'results on a total of 20 benchmarks'),
      cap: findPhrase(p4, 'Zero-shot performance on Common Sense Reasoning tasks.'),
      bullet: findPhrase(p4, 'We provide a textual description of the task and a test example.'),
      report: findPhrase(p5m, 'report numbers from the cor- responding papers'),
      v100: findPhrase(p5m, 'This model runs on a single V100 GPU during inference.'),
    };
    // bars: group A = 13B vs GPT-3 on their seven shared tasks; group B = 65B, Chinchilla 70B, PaLM 540B on all eight
    BARS = [];
    CMP.m13_gpt3.tasks.forEach((task, i) => ['m13', 'gpt3'].forEach((m, j) => BARS.push({ g: 'A', i, j, nb: 2, task, m, v: valOf(m, task) })));
    T3.order.forEach((task, i) => ['m65', 'chinchilla', 'palm540'].forEach((m, j) => BARS.push({ g: 'B', i, j, nb: 3, task, m, v: valOf(m, task) })));
    for (const b of BARS) {
      b.cell = cellOf(b.m, b.task);
      if (b.v !== null) { b.vs = `v_${b.v.toFixed(1)}`; S[b.vs] = b.v.toFixed(1); }
      if (b.g === 'A') {
        b.behind = b.m === 'm13' && CMP.m13_gpt3.behind.includes(b.task);
        b.ahead = b.m === 'm13' && !b.behind;
      } else b.behind = b.m === 'm65' && CMP.m65_palm540.behind.includes(b.task);
    }
    Object.values(S).forEach((s) => tex(s));
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      twenty: q.w(0, 'twenty'),
      s1: q.s(1), zero: q.w(1, 'zero-shot'), no: q.w(1, 'no'),
      s2: q.s(2), from2: q.w(2, 'from'),
      s3: q.s(3), gpt3: q.w(3, 'GPT-3'),
      s4: q.s(4),
      s5: q.s(5), ahead: q.w(5, 'ahead'), behind5: q.w(5, 'behind'), piqa: q.w(5, 'PIQA'), obqa: q.w(5, 'OpenBookQA'),
      s6: q.s(6), sixtyfive: q.w(6, 'sixty-five'), chin6: q.w(6, 'Chinchilla'), palm6: q.w(6, 'PaLM'),
      s7: q.s(7), it7: q.w(7, 'it'), reports: q.w(7, 'reports'), e7: q.e(7),
      s8: q.s(8), it8: q.w(8, 'it'), seven8: q.w(8, 'seven'), behind8: q.w(8, 'behind'), boolq: q.w(8, 'BoolQ'), wino: q.w(8, 'WinoGrande'),
      s9: q.s(9),
      s10: q.s(10), b13: q.w(10, 'thirteen-billion'), runs: q.w(10, 'runs'), single: q.w(10, 'single'), gpu: q.w(10, 'GPU'),
      // "This model runs on a" ↔ "runs on a"; "single V100 GPU during inference." ↔ "single GPU at inference"
      v100a: sayWords(env, 10, 7, 9, t), v100b: sayWords(env, 10, 10, 13, t),
    };

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    // ── camera ──
    const C = camAt(t, [
      { t: 0, tx: 680, ty: 1610, pitch: 0.25, zoom: 1.7, dist: DIST },                // Section 3 on p. 4
      { t: 0.9, dur: 2.2, tx: 700, zoom: 1.75 },
      { t: T.s1 - 0.65, dur: 1.2, tx: 900, ty: 1090, pitch: 0.38, zoom: 1.25 },        // Table 3 on the page
      { t: T.s1 + 0.8, dur: 1.9, tx: 1330, ty: 540, pitch: 0.74, zoom: 1.1 },        // follows the table to the back
      { t: T.zero + 0.4, dur: 1.0, tx: 610, ty: 1665, pitch: 0.35, zoom: 1.7 },        // the zero-shot bullet
      { t: T.s2 - 0.55, dur: 1.4, tx: 960, ty: 760, pitch: PITCH, zoom: 0.95 },         // wide: strip, card, tags
      { t: T.s3 - 0.1, dur: 1.4, ...STAGE },
      { t: T.s3 + 1.3, dur: 11, tx: 975, zoom: 0.96 },                                  // slow drift while A fills
      { t: T.s6, dur: 1.4, tx: 965, ty: 690, zoom: 0.95 },
      { t: T.s6 + 1.4, dur: 15, tx: 915, zoom: 0.975 },                                 // slow drift while B fills
      { t: T.s10 - 0.25, dur: 1.5, tx: ST2.x - 60, ty: ST2.y + 20, pitch: 0.8, zoom: 1.32 },       // station 2
      { t: T.s10 + 1.3, dur: 4.5, tx: ST2.x - 35, zoom: 1.38, yaw: -0.06 },
    ]);

    // ── p. 4: arrives, leaves when the bars come ──
    const pin = e(t, 0, 1.1, ease.outCubic), out4 = e(t, T.s3 - 0.15, 1.0, ease.inCubic);
    const P4now = {
      x: P4.x + 360 * (1 - pin) - 300 * out4, y: P4.y + 900 * (1 - pin) + 1700 * out4,
      z: Math.sin(Math.PI * pin) * 140, w: P4.w, rot: P4.rot + 0.12 * (1 - pin) - 0.08 * out4,
    };
    if (out4 < 1) {
      sheet(ctx, C, p4, P4now);
      highlight(ctx, C, p4, P4now, L.bench, sayWords(env, 0, 6, 7, t), { color: F.hlMint });
      highlight(ctx, C, p4, P4now, L.cap, sayWords(env, 1, 0, 6, t), { color: F.hlMint });
      highlight(ctx, C, p4, P4now, L.bullet, sayWords(env, 1, 7, 12, t), { color: F.hlMint });
    }

    // ── p. 5 strip (s2): "report numbers from the corresponding papers", standing at the back left ──
    {
      const lp = e(t, T.s2 - 0.25, 1.35, ease.linear), go = e(t, T.s3 + 0.05, 0.9, ease.inCubic);
      if (lp > 0 && go < 1) {
        const h = STRIP1_TO.w * (STRIP1.y1 - STRIP1.y0) / (STRIP1.x1 - STRIP1.x0);
        const pose = liftPose(p5m, P5OFF, STRIP1, { x: STRIP1_TO.x, y: STRIP1_TO.foot - h / 2, z: 0, w: STRIP1_TO.w, tilt: PITCH, arc: 260 }, lp);
        pose.y -= 1200 * go; pose.z += 300 * go;
        sheet(ctx, C, p5m, pose, { grid: 6, shadow: 0.5 });
        highlight(ctx, C, p5m, pose, L.report, sayWords(env, 2, 3, 9, t), { color: F.hlMint });
      }
    }

    // ── Table 3: lifts off p. 4 and stands at the back right; cells boxed as their bars rise ──
    const cp = e(t, T.s1 + 0.6, 1.8, ease.linear);
    const card = liftPose(p4, P4, T3U, { ...CARD, arc: 200 }, cp);
    const cardGo = e(t, T.s10 - 0.1, 1.0, ease.inCubic);
    card.z += 300 * cardGo; card.y -= 1100 * cardGo;
    const drawCard = () => {
      if (cp <= 0 || cardGo >= 1) return;
      sheet(ctx, C, p4, card, { grid: 8 });
      highlight(ctx, C, p4, card, L.cap, sayWords(env, 1, 0, 6, t), { color: F.hlMint });
      for (const [m, at] of [['m13', T.s3], ['gpt3', T.gpt3], ['m65', T.sixtyfive], ['chinchilla', T.chin6], ['palm540', T.palm6]]) {
        const fade = m === 'm13' || m === 'gpt3' ? 1 - e(t, T.s6, 0.6) : 1;
        if (fade <= 0) continue;
        ctx.save(); ctx.globalAlpha *= fade;
        markBox(ctx, C, p4, card, ROWLAB[m], e(t, at, 0.6), { color: STY[m].ink, width: 2.4, pad: 0 });
        ctx.restore();
      }
      for (const b of BARS) {
        if (b.v === null) continue;
        const r = rise(b, T);
        const fade = b.g === 'A' ? 1 - e(t, T.s6, 0.6) : 1;
        if (fade <= 0) continue;
        ctx.save(); ctx.globalAlpha *= fade;
        markBox(ctx, C, p4, card, b.cell, e(t, r - 0.05, 0.55), { color: STY[b.m].ink, width: 2.2, pad: 0 });
        ctx.restore();
      }
    };
    if (cp >= 1) drawCard();

    // ── the two context tags, dropped onto the desk at the card's foot ──
    contextTags(ctx, C, t, T, cardGo);

    // ── bar groups ──
    const sm = e(t, T.s6 + 0.05, 1.3, ease.inOutCubic);
    const GA = { ...GA_DIM, ox: lerp(GA_FULL.ox, GA_SMALL.ox, sm), yF: lerp(GA_FULL.yF, GA_SMALL.yF, sm), s: lerp(GA_FULL.s, GA_SMALL.s, sm) };
    const G = { A: GA, B: GB };
    const stageOn = 1 - e(t, T.s10 + 0.9, 0.5);   // labels step aside once the camera has moved on
    axis(ctx, C, t, GA, T.s3 + 0.35);
    axis(ctx, C, t, GB, T.s6 + 0.55);
    const geo = (b) => {
      const g = G[b.g], step = (g.bw + g.gap) * g.s;
      const x = g.ox + (b.i + 0.5) * g.pitch * g.s + (b.j - (b.nb - 1) / 2) * step;
      return { g, x, w: g.bw * g.s, yF: g.yF, y0: g.yF - DEP * g.s };
    };
    const drawn = BARS.filter((b) => b.v !== null).map((b) => ({ b, p: e(t, rise(b, T), 0.8, ease.outCubic), ...geo(b) }))
      .filter((o) => o.p > 0)
      .sort((u, w) => (u.yF - w.yF) || (Math.abs(w.x - C.tx) - Math.abs(u.x - C.tx)));
    for (const o of drawn) drawBar(ctx, C, t, o, T);

    // ── labels: values, task names, en dashes, behind tags, chips, brackets ──
    ctx.save();
    ctx.globalAlpha *= stageOn;
    for (const o of drawn) valueLabel(ctx, C, t, o, T, sm);
    taskNames(ctx, C, t, GA, CMP.m13_gpt3.tasks, T.s3 + 0.5, sm);
    taskNames(ctx, C, t, GB, T3.order, T.s6 + 0.7, 0);
    dashes(ctx, C, t, geo, T);
    behindTags(ctx, C, t, geo, T, sm);
    chips(ctx, C, t, T, GA, sm);
    brackets(ctx, C, t, geo, T, sm);
    ctx.restore();

    // ── station 2: the single-V100 line and one GPU tile under the 13B slab ──
    station2(ctx, C, t, T);

    // the card in flight passes over everything
    if (cp > 0 && cp < 1) drawCard();

    // ── source stamp ──
    const stamps = [
      [0, p4, S.c4s3, SEC3],
      [T.s1 - 0.2, p4, S.c4t3, T3U],
      [T.zero + 0.45, p4, S.c4s3, BULLET],
      [T.s2 - 0.1, p5m, S.c5s31, STRIP1],
      [T.s3 + 0.1, p4, S.c4t3, T3U],
      [T.s10 - 0.1, p5m, S.c5s32, SEC32],
    ];
    let k = 0;
    while (k + 1 < stamps.length && t >= stamps[k + 1][0]) k++;
    const [, sp, sl, sr] = stamps[k];
    const dip = Math.min(1, ...stamps.slice(1).map(([ts]) => clamp(Math.abs(t - ts) / 0.22)));
    cite(ctx, sp, { label: sl, rect: sr, alpha: e(t, 0.5, 0.6) * dip, side: 'right' });
  },
};

// ── timing of each bar ───────────────────────────────────────────────────────
function rise(b, T) {
  if (b.g === 'A') return T.s4 + b.i * 0.38 + b.j * 0.08;          // pair by pair over "They share seven tasks"
  const chin = CMP.m65_chinchilla.tasks, palm = CMP.m65_palm540.tasks;
  const atChin = (k) => lerp(T.it7, T.reports - 0.45, k / (chin.length - 1));
  const atPalm = (k) => lerp(T.it8, T.seven8 - 0.05, k / (palm.length - 1));
  if (b.m === 'm65') return chin.includes(b.task) ? atChin(chin.indexOf(b.task)) : atPalm(palm.indexOf(b.task)) - 0.06;
  if (b.m === 'chinchilla') return atChin(chin.indexOf(b.task)) + 0.1;
  return atPalm(palm.indexOf(b.task)) + 0.04;
}

// ── pieces ───────────────────────────────────────────────────────────────────
function axis(ctx, C, t, G, on) {
  const ax = e(t, on, 0.8, ease.inOutCubic);
  if (ax <= 0) return;
  const x0 = G.ox - 14 * G.s, x1 = G.ox + G.n * G.pitch * G.s, top = 100 * HZ * G.s;
  ctx.save();
  ctx.lineCap = 'round';
  [0, 25, 50, 75, 100].forEach((v, i) => {
    const z = v * HZ * G.s;
    if (z > top * ax + 0.5) return;
    const a = C.p(x0, G.yF, z), b = C.p(lerp(x0, x1, e(t, on + 0.15 + i * 0.05, 0.7, ease.inOutCubic)), G.yF, z);
    ctx.strokeStyle = v ? 'rgba(150,140,125,0.42)' : F.ink2; ctx.lineWidth = v ? 1.3 : 2.2;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    const k0 = C.p(x0 - 12, G.yF, z);
    ctx.strokeStyle = F.ink2; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(k0.x, k0.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    drawTex(ctx, S[`t${v}`], k0.x - 7, k0.y, { size: 30, color: F.ink2, align: 'right', valign: 'middle', write: e(t, on + 0.2 + i * 0.08, 0.4, ease.linear) });
  });
  const a0 = C.p(x0, G.yF, 0), a1 = C.p(x0, G.yF, top * ax);
  ctx.strokeStyle = F.ink2; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke();
  ctx.restore();
}

function drawBar(ctx, C, t, o, T) {
  const { b, p, x, w, yF, y0, g } = o;
  const st = STY[b.m];
  let fill = st.fill, stroke = st.ink, width = 2.2;
  if (b.ahead) fill = mix(st.fill, st.ink, 0.42 * e(t, T.ahead + 0.12 * aheadIdx(b), 0.5));   // the five it leads on brighten
  if (b.behind) {
    const on = b.g === 'A' ? T.behind5 : T.behind8;
    const pulse = b.g === 'A' ? bump(t, b.task === 'piqa' ? T.piqa : T.obqa) : bump(t, b.task === 'boolq' ? T.boolq : T.wino);
    const k = e(t, on, 0.4);
    if (k > 0) { stroke = F.ink; width = 2.2 + 1.4 * k + 2.2 * pulse; }
  }
  width += 2.0 * thinPulse(t, T, b);
  const h = Math.max(1.5, b.v * HZ * g.s * p);
  slab(ctx, C, { x0: x - w / 2, x1: x + w / 2, y0, y1: yF, z0: 0, z1: h }, { fill, stroke, width });
}
const aheadIdx = (b) => CMP.m13_gpt3.tasks.filter((k) => !CMP.m13_gpt3.behind.includes(k)).indexOf(b.task);

// the four sub-point pairs (CMP.thin), one after the other on "Several margins are under one point"
const THIN = CMP.thin.map((th, k) => ({ ...th, g: th.cmp === 'm13_gpt3' ? 'A' : 'B', a: CMP[th.cmp].a, b: CMP[th.cmp].b, k }));
const thinAt = (T, k) => T.s9 + 0.05 + k * 0.5;
function thinPulse(t, T, b) {
  const th = THIN.find((h) => h.g === b.g && h.task === b.task && (h.a === b.m || h.b === b.m));
  return th ? bump(t, thinAt(T, th.k), 0.25) : 0;
}

function valueLabel(ctx, C, t, o, T, sm) {
  const { b, x, yF, y0, g } = o;
  const pv = e(t, rise(b, T) + 0.3, 0.5, ease.linear);
  if (pv <= 0) return;
  const top = C.p(x, y0, b.v * HZ * g.s);   // above the back edge of the top face: clear of the bar
  const size = b.g === 'A' ? lerp(32, 30, sm) : 30;
  // in the small group the two values of a pair lean outwards, so they never touch
  const lean = b.g === 'A' ? (b.j ? 1 : -1) * 7 * sm : 0;
  const sw = 1 + 0.14 * thinPulse(t, T, b);
  drawTex(ctx, S[b.vs], top.x + lean, top.y - 7, { size: size * sw, color: F.ink, align: 'center', valign: 'bottom', write: pv });
}

function taskNames(ctx, C, t, G, tasks, on, sm) {
  tasks.forEach((task, i) => {
    const base = C.p(G.ox + (i + 0.5) * G.pitch * G.s, G.yF, 0);
    const dy = 12 + (i % 2) * 36 * sm;   // the small group staggers its names over two rows
    drawTex(ctx, S[`task_${task}`], base.x, base.y + dy, { size: lerp(32, 30, sm), color: F.ink, align: 'center', valign: 'top', write: e(t, on + i * 0.1, 0.6, ease.linear) });
  });
}

// "-" in the table: an empty slot with a small en dash on the desk
function dashes(ctx, C, t, geo, T) {
  for (const b of BARS) {
    if (b.v !== null || b.g !== 'B') continue;
    const at = b.m === 'chinchilla' ? T.chin6 + 1.0 : T.palm6 + 1.0;   // with the chips: the empty slots are part of the build
    const { x, yF, y0 } = geo(b);
    const p = C.p(x, (yF + y0) / 2, 0);
    drawTex(ctx, S.dash, p.x, p.y - 4, { size: 32, color: F.ink2, align: 'center', valign: 'bottom', write: e(t, at, 0.4, ease.linear) });
  }
}

// "behind": under the task name, centred on the bar that trails
function behindTags(ctx, C, t, geo, T, sm) {
  for (const b of BARS) {
    if (!b.behind) continue;
    const { x, yF } = geo(b);
    const base = C.p(x, yF, 0);
    const on = b.g === 'A' ? T.behind5 + (b.task === 'piqa' ? 0 : 0.25) : T.behind8 + (b.task === 'boolq' ? 0 : 0.25);
    const pulse = b.g === 'A' ? bump(t, b.task === 'piqa' ? T.piqa : T.obqa) : bump(t, b.task === 'boolq' ? T.boolq : T.wino);
    const dy = b.g === 'A' ? lerp(62, 92, sm) : 62;
    tag(ctx, S.behind, base.x, base.y + dy, { size: 30 * (1 + 0.12 * pulse), align: 'center', valign: 'top', write: e(t, on, 0.5, ease.linear) });
  }
}

/** chip(ctx, src, x, y, ink, fill, o) — a legend chip: a paper slip with a small swatch in the model's
 *  fill and outline, then the TeX label (screen px, left-aligned at x, vertically centred on y). Kit candidate. */
function chip(ctx, src, x, y, ink, fill, { size = 32, write = 1, alpha = 1 } = {}) {
  if (write <= 0 || alpha <= 0) return 0;
  const sz = texSize(src, size), sw = size * 0.62, gap = size * 0.32, pad = 12;
  const w = pad + sw + gap + sz.w + pad, h = Math.max(sz.h, sw) + 16;
  ctx.save();
  ctx.globalAlpha *= alpha * clamp(write * 3);
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.shadowColor = 'rgba(40,30,20,0.16)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
  ctx.beginPath(); ctx.roundRect(x, y - h / 2, w, h, 6); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = fill; ctx.strokeStyle = ink; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.rect(x + pad, y - sw / 2, sw, sw); ctx.fill(); ctx.stroke();
  ctx.restore();
  drawTex(ctx, src, x + pad + sw + gap, y, { size, color: F.ink, valign: 'middle', write, alpha });
  return w;
}

function chips(ctx, C, t, T, GA, sm) {
  // group A's chips: under its bars while it is in front, above it once it has slid to the back
  const a0 = C.p(GA_FULL.ox, 1330, 0), a1 = C.p(GA_SMALL.ox + 10, BACK - 20, 335);
  const ax = lerp(a0.x, a1.x, sm), ay = lerp(a0.y, a1.y, sm);
  const sizeA = lerp(32, 30, sm), aA = 1 - 0.92 * Math.sin(Math.PI * sm);   // they fade while crossing the bars
  const w1 = chip(ctx, S.chip_m13, ax, ay, STY.m13.ink, STY.m13.fill, { size: sizeA, write: e(t, T.s3 + 0.05, 0.6, ease.linear), alpha: aA });
  chip(ctx, S.chip_gpt3, ax + (w1 || 230) + 16, ay, STY.gpt3.ink, STY.gpt3.fill, { size: sizeA, write: e(t, T.gpt3, 0.6, ease.linear), alpha: aA });
  // group B's chips, under its bars, each on its words
  const b0 = C.p(GB.ox, 1330, 0);
  let x = b0.x;
  for (const [m, at] of [['m65', T.sixtyfive], ['chinchilla', T.chin6], ['palm540', T.palm6]]) {
    const w = chip(ctx, S[`chip_${m}`], x, b0.y, STY[m].ink, STY[m].fill, { size: 32, write: e(t, at, 0.6, ease.linear) });
    x += (w || texSize(S[`chip_${m}`], 32).w + 70) + 18;
  }
}

/** dropTag — a tag slip falling onto the desk at world (x, y), with its shadow (p 0 → 1 = the fall). Kit candidate. */
function dropTag(ctx, C, src, x, y, p, { size = 32, h = 230, alpha = 1 } = {}) {
  if (p <= 0 || alpha <= 0) return;
  const z = h * (1 - p * p);
  const sz = texSize(src, size), k = C.p(x, y, 0).k;
  contactShadow(ctx, C, { x0: x - (sz.w / 2 + 12) / k, x1: x + (sz.w / 2 + 12) / k, y0: y - 10, y1: y + 14 }, { z, alpha });
  const s = C.p(x, y, z);
  tag(ctx, src, s.x, s.y, { size, align: 'center', valign: 'bottom', alpha: alpha * clamp(p * 5) });
}

function contextTags(ctx, C, t, T, go) {
  const a = 1 - go;
  if (a <= 0) return;
  const k = C.p(TAGS_AT.x, TAGS_AT.y, 0).k;
  const wz = texSize(S.zero, 32).w + 24, wo = texSize(S.others, 32).w + 24, gap = 18;
  const tot = (wz + gap + wo) / k;
  const xz = TAGS_AT.x - tot / 2 + wz / k / 2, xo = TAGS_AT.x + tot / 2 - wo / k / 2;
  dropTag(ctx, C, S.zero, xz, TAGS_AT.y, e(t, T.zero - 0.05, 0.5, ease.linear), { alpha: a });
  dropTag(ctx, C, S.others, xo, TAGS_AT.y, e(t, T.from2, 0.5, ease.linear), { alpha: a });
}

// a thin bracket above the two values of a sub-point pair: it says "level", the printed values do the rest
function brackets(ctx, C, t, geo, T, sm) {
  for (const th of THIN) {
    const p = e(t, thinAt(T, th.k), 0.45, ease.inOutCubic);
    if (p <= 0) continue;
    const fade = 1 - 0.45 * e(t, thinAt(T, th.k) + 0.9, 0.4);
    const ba = BARS.find((b) => b.g === th.g && b.task === th.task && b.m === th.a);
    const bb = BARS.find((b) => b.g === th.g && b.task === th.task && b.m === th.b);
    const ga = geo(ba), gb = geo(bb), g = ga.g;
    const ta = C.p(ga.x, ga.y0, ba.v * HZ * g.s), tb = C.p(gb.x, gb.y0, bb.v * HZ * g.s);
    const size = th.g === 'A' ? lerp(32, 30, sm) : 30;
    const yl = Math.min(ta.y, tb.y) - 9 - size * 1.05 - 10;
    const xa = ta.x, xb = lerp(ta.x, tb.x, p);
    ctx.save();
    ctx.globalAlpha *= fade;
    ctx.strokeStyle = F.ink; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(xa, yl + 11); ctx.lineTo(xa, yl); ctx.lineTo(xb, yl); if (p >= 1) ctx.lineTo(xb, yl + 11); ctx.stroke();
    ctx.restore();
  }
}

// ── station 2: "runs on a single GPU at inference" ──────────────────────────────
function station2(ctx, C, t, T) {
  const la = e(t, T.s10 - 0.05, 1.3, ease.linear), lb = e(t, T.s10 + 0.15, 1.3, ease.linear);
  if (la <= 0) return;
  // the two line strips, standing, B under A, left-aligned: "This model runs on a / single V100 GPU during inference."
  const wA = (LINE_A.x1 - LINE_A.x0) * SC2, wB = (LINE_B.x1 - LINE_B.x0) * SC2;
  const hA = (LINE_A.y1 - LINE_A.y0) * SC2, hB = (LINE_B.y1 - LINE_B.y0) * SC2, g = 4 * SC2;
  const xL = ST2.x - 300, footB = ST2.y - 40, zB = 70;
  const toB = { x: xL + wB / 2, y: footB - hB / 2, z: zB, w: wB, tilt: PITCH, arc: 240 };
  const toA = { x: xL + wA / 2, y: footB - (hB + g) * Math.cos(PITCH) - hA / 2, z: zB + (hB + g) * Math.sin(PITCH), w: wA, tilt: PITCH, arc: 260 };
  const A = liftPose(p5m, P5OFF2, LINE_A, toA, la), B = liftPose(p5m, P5OFF2, LINE_B, toB, lb);
  sheet(ctx, C, p5m, B, { grid: 4, shadow: 0.35 });
  sheet(ctx, C, p5m, A, { grid: 3, shadow: 0.35 });
  highlight(ctx, C, p5m, A, [L.v100[0]], T.v100a, { color: F.hlMint });
  highlight(ctx, C, p5m, B, [L.v100[1]], T.v100b, { color: F.hlMint });

  // the 13B slab drops onto the desk on "thirteen-billion"; on "single" it lifts and a GPU tile slides under it
  const cx = ST2.x - 40, cy = ST2.y + 170;
  const drop = e(t, T.b13 - 0.1, 0.55, ease.linear);
  if (drop <= 0) return;
  const lift = e(t, T.single - 0.45, 0.3, ease.outCubic) * (1 - e(t, T.single + 0.35, 0.35, ease.inOutCubic));
  const slide = e(t, T.single - 0.35, 0.8, ease.outCubic);
  const zS = 260 * (1 - drop * drop) + (TILE.h + 26) * lift + TILE.h * e(t, T.single + 0.35, 0.35, ease.inOutCubic);
  const tx = cx + 900 * (1 - slide);
  if (slide > 0) {
    contactShadow(ctx, C, { x0: tx - TILE.w / 2, x1: tx + TILE.w / 2, y0: cy - TILE.d / 2, y1: cy + TILE.d / 2 }, { z: 0 });
    slab(ctx, C, { x0: tx - TILE.w / 2, x1: tx + TILE.w / 2, y0: cy - TILE.d / 2, y1: cy + TILE.d / 2, z0: 0, z1: TILE.h }, { fill: TILE.fill, stroke: TILE.stroke, width: 2 });
  }
  contactShadow(ctx, C, { x0: cx - SLAB13.w / 2, x1: cx + SLAB13.w / 2, y0: cy - SLAB13.d / 2, y1: cy + SLAB13.d / 2 }, { z: zS });
  slab(ctx, C, { x0: cx - SLAB13.w / 2, x1: cx + SLAB13.w / 2, y0: cy - SLAB13.d / 2, y1: cy + SLAB13.d / 2, z0: zS, z1: zS + SLAB13.h }, { fill: PAL.m13Fill, stroke: PAL.m13, width: 2.4 });
  const lb13 = C.p(cx - TILE.w / 2 - 22, cy, zS + SLAB13.h / 2);   // left of where the tile will reach
  drawTex(ctx, S.b13, lb13.x, lb13.y, { size: 40, color: F.ink, align: 'right', valign: 'middle', write: e(t, T.b13 + 0.2, 0.6, ease.linear) });
  const lg = C.p(cx + TILE.w / 2 + 24, cy + 20, TILE.h);
  tag(ctx, S.gpu, lg.x, lg.y, { size: 40, valign: 'middle', write: e(t, T.gpu - 0.05, 0.7, ease.linear) });
}
