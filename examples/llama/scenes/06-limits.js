// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars) and redrawn figures.
const PAGES = true;

// limits — the tables that go the other way. Station 1: p. 7, Table 9 stands up, MMLU's Average column as
// three bars from 0 (65B 63.4 behind Chinchilla 70B 67.5 and PaLM 540B 69.3). Station 2: p. 6, the authors'
// "potential explanation" read with the voice, and two stacks at one scale (177 GB of books and arXiv; a glass
// outline to "up to 2TB of books"). Back to station 1: Table 10 stands up, LLaMA-I rises next to 65B to 68.9,
// and code-davinci-002's 77.4 settles over the group as a glass plate (quoted, not a bar). Station 3: p. 10,
// Table 14, TruthfulQA as fractions (0.57 vs 0.28), then the paragraph: "still low", "likely to hallucinate".
// Guardrails (briefing): "potential explanation" tagged as the authors'; 77.4 is a plate with its source;
// nothing points at 68.9 vs 67.5; fractions, never percentages; GPT-3's TruthfulQA numbers are Ouyang et al.'s;
// p. 10's Table 13 never comes to reading size.
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, texSize, desk, edgeIn, loadPaper, findPhrase, camAt, sheet, highlight,
  markBox, liftPose, slab, prism, tag, cite, contactShadow, sayWords, standIn,
} from '/engine/folio.js';
import { PAL, T9, T10, BOOKS, T14, P6 } from './_data.js';

// ── world layout (desk px) ───────────────────────────────────────────────────
const PITCH = 0.85, DIST = 8000;

// station 1 — MMLU (p. 7 lies in front, out of frame while the camera is on the bars)
const HZ = 3.6;                            // world z per point: 100 stands 360 high
const AX = 260, SLOT = 250, BW = 112, BY1 = 700, DEP = 46;
const slotX = (i) => AX + SLOT * (i + 0.5);
const P7 = { x: 960, y: 1978, w: 1100, rot: 0.01 };
const T9U = { x0: T9.box.x0, y0: T9.box.y0, x1: T9.box.x1, y1: T9.caption.y1 };
const CARD9_W = 600, CARD9_H = CARD9_W * (T9U.y1 - T9U.y0) / (T9U.x1 - T9U.x0);
const CARD9 = { x: slotX(2) + SLOT / 2 + 70 + CARD9_W / 2, y: BY1 - CARD9_H / 2, z: 0, w: CARD9_W, tilt: PITCH };
const CARD10_W = 340, CARD10_H = CARD10_W * (T10.box.y1 - T10.box.y0) / (T10.box.x1 - T10.box.x0);
const CARD10 = { x: slotX(3) + SLOT / 2 + 60 + CARD10_W / 2, y: BY1 - CARD10_H / 2, z: 0, w: CARD10_W, tilt: PITCH };
const TAGS1 = { x: 1560, y: 800 };         // five-shot / others: from their papers, on the desk right of the bars
const S1CAM = { tx: 1000, ty: 340, pitch: PITCH, dist: DIST, zoom: 1.0 };
// p. 7 right column, Section 4: the two lines lifted in s5
const STRIP_689 = { x0: 1102, y0: 1099, x1: 1466, y1: 1133 };                       // "we reach 68.9% on MMLU."
const STRIP_FAR1 = { x0: 892, y0: 1212, x1: 1461, y1: 1246 };                       // "still far from the state-of-the-art, that is 77.4"
const STRIP_FAR2 = { x0: 846, y0: 1250, x1: 1341, y1: 1288 };                       // "for GPT code-davinci-002 on MMLU"
const SC_STRIP = 1.15;

// station 2 — p. 6 and the two stacks (heights ∝ GB, one scale). Read at a low pitch first, then the camera
// tilts up to the stacks and the "2TB of books" line stands up as a strip beside them.
const P6POSE = { x: 2400, y: 2060, w: 1100, rot: -0.012 };
const GBZ = 0.26;                          // world z per GB: 2 TB stands 520 high
const STK = { w: 170, d: 60, y: 2230, xSolid: 3300, xGlass: 3520 };
const S2READ = { tx: 2800, ty: 2250, pitch: 0.35, dist: DIST, zoom: 1.4 };
const S2STACK = { tx: 3390, ty: 1995, pitch: 0.92, dist: DIST, zoom: 1.2 };
const STRIP_2TB = [{ x0: 946, y0: 1574, x1: 1462, y1: 1609 }, { x0: 846, y0: 1612, x1: 1036, y1: 1647 }];   // "while these models … up to / 2TB of books."

// station 3 — p. 10, Table 14 and TruthfulQA (0–1 axis). The bars stand left of the page and in front of the
// paragraph's row, so the reading shot of the paragraph keeps p. 10's top (Table 13) out of frame.
const HZT = 360;                           // world z per 1.0
const P10 = { x: -1000, y: 1000, w: 1000, rot: 0 };
const AX3 = -1916, SLOT3 = 200, BY3 = 1450;
const slot3X = (i) => AX3 + SLOT3 * (i + 0.5);
const CARD14_W = 420, CARD14_H = CARD14_W * (T14.box.y1 - T14.box.y0) / (T14.box.x1 - T14.box.x0);
const CARD14 = { x: AX3 - 140 - CARD14_W / 2, y: BY3 - CARD14_H / 2, z: 0, w: CARD14_W, tilt: PITCH };
// p. 10 arrives only once the camera has reached the bars, and lands just right of the frame: its Table 13 is
// never in frame (it sits above the reading shot of the paragraph, too)
const S3BARS = { tx: -2120, ty: 1187, pitch: PITCH, dist: DIST, zoom: 1.35 };
const S3READ = { tx: -1500, ty: 1290, pitch: 0.75, dist: DIST, zoom: 1.75 };

const cellRect = (row, col) => ({ x0: col.x0 - 6, y0: row.y0 - 4, x1: col.x1 + 6, y1: row.y1 + 4 });
const ROW9 = {   // row labels on Table 9 (words.json): name + size
  m65: { x0: 516, y0: 669, x1: 578, y1: 704 }, chinchilla: { x0: 330, y0: 375, x1: 578, y1: 410 }, palm540: { x0: 501, y0: 503, x1: 578, y1: 538 },
};

const STY = {
  m65: { fill: PAL.m65Fill, ink: PAL.m65 },
  llamaI: { fill: PAL.m65Fill, ink: PAL.m65 },
  chinchilla: { fill: PAL.chinchillaFill, ink: PAL.chinchilla },
  palm540: { fill: PAL.palmFill, ink: PAL.palm },
  gpt3: { fill: PAL.gpt3Fill, ink: PAL.gpt3 },
};

const S = {
  c7t9: '\\text{p. 7}\\;\\cdot\\;\\text{Table 9}',
  c6: '\\text{p. 6}\\;\\cdot\\;\\text{Section 3.6}',
  c7t10: '\\text{p. 7}\\;\\cdot\\;\\text{Table 10}',
  c7s4: '\\text{p. 7}\\;\\cdot\\;\\text{Section 4}',
  c10t14: '\\text{p. 10}\\;\\cdot\\;\\text{Table 14}',
  c10s54: '\\text{p. 10}\\;\\cdot\\;\\text{Section 5.4}',
  five: '\\text{five-shot}',
  others: '\\text{others: from their papers}',
  mmlu: '\\text{MMLU, average}',
  behind: '\\text{behind}',
  n_m65: '\\text{LLaMA 65B}', n_llamaI: '\\text{LLaMA-I (65B)}', n_chinchilla: '\\text{Chinchilla, 70B}', n_palm540: '\\text{PaLM, 540B}', n_gpt3: '\\text{GPT-3, 175B}',
  v634: '63.4', v675: '67.5', v693: '69.3', v689: '68.9',
  sota: '\\text{code-davinci-002: } 77.4',
  iyer: '\\text{quoted from Iyer et al. (2022)}',
  gb177: '177\\ \\text{GB}',
  booksArxiv: '\\text{books + arXiv}',
  tb2: '\\text{up to } 2\\ \\text{TB of books}',
  potential: '\\text{potential explanation (authors)}',
  truthful: '\\text{fraction truthful}',
  ouyang: '\\text{GPT-3: from Ouyang et al.}',
  f057: '0.57', f028: '0.28',
  t0: '0', t25: '25', t50: '50', t75: '75', t100: '100',
  u0: '0', u25: '0.25', u50: '0.5', u75: '0.75', u100: '1.0',
};

const bump = (t, at, hold = 0.35) => e(t, at, 0.22) * (1 - e(t, at + 0.22 + hold, 0.4));

let p6, p7, p10, L;

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [6, 7, 10]);
    p6 = PAGES ? P.page(6) : standIn(P.page(6));
    p7 = PAGES ? P.page(7) : standIn(P.page(7));
    p10 = PAGES ? P.page(10) : standIn(P.page(10));
    L = {
      cap9: findPhrase(p7, 'Massive Multitask Language Understanding (MMLU). Five-shot accuracy.'),
      expl: findPhrase(p6, 'A potential explanation is that we have used a limited amount of books and academic papers in our pre-training data'),
      sum177: findPhrase(p6, 'ArXiv, Gutenberg and Books3, that sums up to only 177GB'),
      tb2: findPhrase(p6, 'while these models were trained on up to 2TB of books'),
      single: findPhrase(p7, 'we only conducted a single experiment'),
      reach: findPhrase(p7, 'we reach 68.9% on MMLU'),
      far: findPhrase(p7, 'still far from the state-of-the-art, that is 77.4 for GPT code-davinci-002 on MMLU'),
      low: findPhrase(p10, 'the rate of correct answers is still low'),
      hallu: findPhrase(p10, 'likely to hallu- cinate incorrect answers'),
    };
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      s1: q.s(1), mmlu: q.w(1, 'MMLU'), mc: q.w(1, 'multiple-choice'), many: q.w(1, 'many'), b65: q.w(1, 'sixty-five-billion'), s63: q.w(1, 'sixty-three'), e1: q.e(1),
      s2: q.s(2), s67: q.w(2, 'sixty-seven'),
      s3: q.s(3), s69: q.w(3, 'sixty-nine'), e3: q.e(3),
      s4: q.s(4), potential: q.w(4, 'potential'), only: q.w(4, 'only'), gigabytes: q.w(4, 'gigabytes'), against: q.w(4, 'against'), terabytes: q.w(4, 'terabytes'),
      s5: q.s(5), s68: q.w(5, 'sixty-eight'), still: q.w(5, 'still'), s77: q.w(5, 'seventy-seven'), e5: q.e(5),
      s6: q.s(6), truthfulqa: q.w(6, 'TruthfulQA'), gpt3: q.w(6, 'GPT-3'),
      s7: q.s(7), still7: q.w(7, 'still'), likely: q.w(7, 'likely'),
      reachP: sayWords(env, 5, 7, 9, t), farP: sayWords(env, 5, 10, 21, t),
    };
    T.pt57 = q.w(6, 'point'); T.pt28 = q.w(6, 'point', 2);

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    // ── camera ──
    const C = camAt(t, [
      { t: 0, tx: 960, ty: 1560, pitch: 0.3, zoom: 1.2, dist: DIST },                  // p. 7, Table 9 on the page
      { t: 0.85, dur: 1.5, ...S1CAM },                                                  // the table stands up at the back
      { t: 2.6, dur: 12, tx: 1015, zoom: 1.02 },                                        // slow drift while the bars rise
      { t: T.s4 - 0.3, dur: 1.4, ...S2READ },                                          // p. 6, the explanation read with the voice
      { t: T.s4 + 1.4, dur: 5.5, tx: 2830, zoom: 1.43 },
      { t: T.against - 0.45, dur: 1.4, ...S2STACK },                                    // tilt up: the two stacks, the 2TB strip
      { t: T.against + 1.2, dur: 2.5, tx: 3405, zoom: 1.23 },
      { t: T.s5 - 0.35, dur: 1.2, tx: 820, ty: 2200, pitch: 0.35, zoom: 1.45 },        // p. 7, "a single experiment"
      { t: T.s68 - 1.0, dur: 1.3, ...S1CAM, tx: 1040, ty: 300, zoom: 0.96 },            // the bars again, Table 10, the strips
      { t: T.s68 + 0.5, dur: 6, tx: 1060, zoom: 0.98 },
      { t: T.s6 - 0.3, dur: 1.4, ...S3BARS },                                           // Table 14 arrives from p. 10, the two bars
      { t: T.s6 + 1.2, dur: 3.5, tx: -2090, zoom: 1.38 },
      { t: T.s7 - 0.35, dur: 0.9, ty: S3READ.ty, pitch: S3READ.pitch, zoom: 1.6 },          // down first (p. 10's top stays above the frame)…
      { t: T.s7 + 0.4, dur: 1.1, ...S3READ },                                           // …then across: the paragraph, the bars beside it
      { t: T.s7 + 1.3, dur: 4.6, tx: -1480, zoom: 1.78 },
    ]);

    // ── station 1 ──
    const pin7 = e(t, 0, 0.9, ease.outCubic);
    const P7now = { ...P7, x: P7.x + 420 * (1 - pin7), y: P7.y + 700 * (1 - pin7), z: Math.sin(Math.PI * pin7) * 140, rot: P7.rot + 0.12 * (1 - pin7) };
    sheet(ctx, C, p7, P7now);
    highlight(ctx, C, p7, P7now, L.cap9, e(t, T.mmlu - 0.05, 0.8, ease.linear), { color: F.hlMint });
    highlight(ctx, C, p7, P7now, L.single, sayWords(env, 5, 0, 3, t), { color: F.hlMint });
    highlight(ctx, C, p7, P7now, L.reach, sayWords(env, 5, 7, 9, t), { color: F.hlMint });
    highlight(ctx, C, p7, P7now, [L.far[0]], T.farP, { color: F.hlMint });
    highlight(ctx, C, p7, P7now, [L.far[1]], e(t, T.s77 + 0.5, 0.9, ease.linear), { color: F.hlMint });

    // Table 9: lifts and stands right of the bars; picked up when the camera leaves for p. 6
    const c9 = e(t, 0.6, 1.6, ease.linear), g9 = e(t, T.s4 + 0.6, 0.8, ease.inCubic);
    const card9 = liftPose(p7, P7, T9U, { ...CARD9, arc: 260 }, c9);
    card9.z += 300 * g9; card9.y -= 1100 * g9;
    const drawCard9 = () => {
      if (c9 <= 0 || g9 >= 1) return;
      sheet(ctx, C, p7, card9, { grid: 8 });
      highlight(ctx, C, p7, card9, L.cap9, e(t, T.mmlu - 0.05, 0.8, ease.linear), { color: F.hlMint });
      const box = (r, at, m) => markBox(ctx, C, p7, card9, r, e(t, at, 0.55), { color: STY[m].ink, width: 2.4, pad: 0 });
      box(ROW9.m65, T.b65, 'm65'); box(ROW9.chinchilla, T.s2, 'chinchilla'); box(ROW9.palm540, T.s3, 'palm540');
      box(cellRect(T9.rows.m65, T9.cols.average), T.s63 - 0.05, 'm65');
      box(cellRect(T9.rows.chinchilla, T9.cols.average), T.s67 - 0.05, 'chinchilla');
      box(cellRect(T9.rows.palm540, T9.cols.average), T.s69 - 0.05, 'palm540');
    };
    if (c9 >= 1) drawCard9();

    // Table 10: lifts from p. 7 on "A brief instruction fine-tune", stands where Table 9 stood (one slot further right)
    const c10 = e(t, T.s5 + 0.2, 1.7, ease.linear), g10 = e(t, T.s6 + 0.4, 0.8, ease.inCubic);
    const card10 = liftPose(p7, P7, T10.box, { ...CARD10, arc: 240 }, c10);
    card10.z += 300 * g10; card10.y -= 1100 * g10;
    const drawCard10 = () => {
      if (c10 <= 0 || g10 >= 1) return;
      sheet(ctx, C, p7, card10, { grid: 6 });
      const land = T.s5 + 1.9;
      const box = (r, at, m) => markBox(ctx, C, p7, card10, r, e(t, at, 0.55), { color: STY[m].ink, width: 2.4, pad: 0 });
      box(cellRect(T10.rows.m65, T10.valueCol), land, 'm65');
      box(cellRect(T10.rows.chinchilla, T10.valueCol), land + 0.2, 'chinchilla');
      box(cellRect(T10.rows.llamaI, T10.valueCol), T.s68 - 0.05, 'llamaI');
    };
    if (c10 >= 1) drawCard10();

    // MMLU bars (Average column): 65B, then Chinchilla and PaLM; in s5 those two step right and LLaMA-I rises beside 65B
    const shift = e(t, T.s5 + 0.9, 1.0, ease.inOutCubic);
    const on1 = 1 - e(t, T.s6 + 0.5, 0.5);    // labels step aside once the camera has left
    axis(ctx, C, t, { x0: AX - 14, x1: lerp(AX + SLOT * 3, AX + SLOT * 4, shift), y: BY1, hz: HZ, on: T.mc, ticks: [0, 25, 50, 75, 100], lab: 't' });
    const bars1 = [
      { m: 'm65', v: T9.rows.m65.avg, x: slotX(0), at: T.s63, name: T.b65, vs: S.v634 },
      { m: 'llamaI', v: T10.rows.llamaI.v, x: slotX(1), at: T.s68, name: T.s68 - 0.3, vs: S.v689 },
      { m: 'chinchilla', v: T9.rows.chinchilla.avg, x: lerp(slotX(1), slotX(2), shift), at: T.s67, name: T.s2, vs: S.v675 },
      { m: 'palm540', v: T9.rows.palm540.avg, x: lerp(slotX(2), slotX(3), shift), at: T.s69, name: T.s3, vs: S.v693 },
    ];
    const behind65 = e(t, T.e3 - 0.35, 0.4);
    for (const b of bars1) {
      const p = e(t, b.at - 0.05, 1.1, ease.outCubic);
      if (p <= 0) continue;
      let stroke = STY[b.m].ink, width = 2.4;
      if (b.m === 'm65' && behind65 > 0) { stroke = F.ink; width = 2.4 + 1.4 * behind65 + 2 * bump(t, T.e3 - 0.35); }
      slab(ctx, C, { x0: b.x - BW / 2, x1: b.x + BW / 2, y0: BY1 - DEP, y1: BY1, z0: 0, z1: Math.max(1.5, b.v * HZ * p) }, { fill: STY[b.m].fill, stroke, width });
    }
    plate(ctx, C, t, T, shift);
    ctx.save();
    ctx.globalAlpha *= on1;
    for (const b of bars1) {
      const base = C.p(b.x, BY1, 0);
      if (t > b.name) drawTex(ctx, S[`n_${b.m}`], base.x, base.y + 12, { size: 32, color: F.ink, align: 'center', valign: 'top', write: e(t, b.name, 0.6, ease.linear) });
      const pv = e(t, b.at + 0.5, 0.6, ease.linear);
      // the value sits on the bar's front face, just under its top edge: clear of the 77.4 plate above
      if (pv > 0) { const top = C.p(b.x, BY1, b.v * HZ); drawTex(ctx, b.vs, top.x, top.y + 10, { size: 36, color: F.ink, align: 'center', valign: 'top', write: pv }); }
    }
    if (behind65 > 0) { const base = C.p(slotX(0), BY1, 0); tag(ctx, S.behind, base.x, base.y + 60, { size: 30, align: 'center', valign: 'top', write: behind65 }); }
    const am = C.p(AX - 14, BY1, 100 * HZ);
    drawTex(ctx, S.mmlu, am.x, am.y - 30, { size: 34, color: F.ink2, valign: 'bottom', write: e(t, T.mmlu + 0.3, 0.8, ease.linear) });
    ctx.restore();
    // context tags on the desk, right of the bars, for as long as the bars are on screen
    dropPair(ctx, C, t, TAGS1, [S.five, S.others], [T.mc, T.many], on1);
    // the two lines from Section 4 (p. 7), lifted and standing at the back
    strips(ctx, C, t, T);
    if (c9 > 0 && c9 < 1) drawCard9();
    if (c10 > 0 && c10 < 1) drawCard10();

    // ── station 2: p. 6, the explanation, the two stacks ──
    station2(ctx, C, t, T, env);

    // ── station 3: p. 10, Table 14, TruthfulQA ──
    station3(ctx, C, t, T, env);

    // ── source stamp ──
    const stamps = [
      [0, p7, S.c7t9, T9U],
      [T.s4 - 0.1, p6, S.c6, P6.mmlu],
      [T.s5 - 0.1, p7, S.c7t10, T10.box],
      [T.s68 - 0.4, p7, S.c7s4, T10.para],
      [T.s6 - 0.1, p10, S.c10t14, T14.box],
      [T.s7 - 0.1, p10, S.c10s54, T14.para],
    ];
    let k = 0;
    while (k + 1 < stamps.length && t >= stamps[k + 1][0]) k++;
    const [, sp, sl, sr] = stamps[k];
    const dip = Math.min(1, ...stamps.slice(1).map(([ts]) => clamp(Math.abs(t - ts) / 0.22)));
    cite(ctx, sp, { label: sl, rect: sr, alpha: e(t, 0.5, 0.6) * dip, side: 'right' });
  },
};

// ── pieces ───────────────────────────────────────────────────────────────────
function axis(ctx, C, t, { x0, x1, y, hz, on, ticks, lab, alpha = 1 }) {
  const ax = e(t, on, 0.8, ease.inOutCubic);
  if (ax <= 0 || alpha <= 0) return;
  const top = ticks.at(-1) * hz;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineCap = 'round';
  ticks.forEach((v, i) => {
    const z = v * hz;
    if (z > top * ax + 0.5) return;
    const a = C.p(x0, y, z), b = C.p(lerp(x0, x1, e(t, on + 0.15 + i * 0.05, 0.7, ease.inOutCubic)), y, z);
    ctx.strokeStyle = v ? 'rgba(150,140,125,0.42)' : F.ink2; ctx.lineWidth = v ? 1.3 : 2.2;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    const k0 = C.p(x0 - 12, y, z);
    ctx.strokeStyle = F.ink2; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(k0.x, k0.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    drawTex(ctx, S[`${lab}${[0, 25, 50, 75, 100][i]}`], k0.x - 7, k0.y, { size: 30, color: F.ink2, align: 'right', valign: 'middle', write: e(t, on + 0.2 + i * 0.08, 0.4, ease.linear) });
  });
  const a0 = C.p(x0, y, 0), a1 = C.p(x0, y, top * ax);
  ctx.strokeStyle = F.ink2; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke();
  ctx.restore();
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
// two tags side by side, centred on a desk point, each dropping on its own cue
function dropPair(ctx, C, t, at, srcs, cues, alpha) {
  const k = C.p(at.x, at.y, 0).k, gap = 18;
  const ws = srcs.map((s) => texSize(s, 32).w + 24);
  const tot = (ws[0] + gap + ws[1]) / k;
  dropTag(ctx, C, srcs[0], at.x - tot / 2 + ws[0] / k / 2, at.y, e(t, cues[0], 0.5, ease.linear), { alpha });
  dropTag(ctx, C, srcs[1], at.x + tot / 2 - ws[1] / k / 2, at.y, e(t, cues[1], 0.5, ease.linear), { alpha });
}

// code-davinci-002's 77.4 (quoted by the authors from Iyer et al.): a glass plate settling over the whole group
function plate(ctx, C, t, T, shift) {
  const p = e(t, T.s77 - 0.1, 1.2, ease.outCubic), go = e(t, T.s6 + 0.5, 0.5);
  if (p <= 0 || go >= 1) return;
  const z = lerp(100 * HZ, 77.4 * HZ, p);
  // its front edge lies on the bars' front plane, where the gridlines are, so it reads 77.4 on the axis
  const x0 = AX + 12, x1 = lerp(AX + SLOT * 3, AX + SLOT * 4, shift) - 12, y0 = BY1 - DEP - 30, y1 = BY1, th = 7;
  const top = [C.p(x0, y0, z), C.p(x1, y0, z), C.p(x1, y1, z), C.p(x0, y1, z)];
  const front = [C.p(x0, y1, z - th), C.p(x1, y1, z - th), C.p(x1, y1, z), C.p(x0, y1, z)];
  const path = (Q) => { ctx.beginPath(); Q.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); };
  ctx.save();
  ctx.globalAlpha *= clamp(p * 4) * (1 - go);
  ctx.fillStyle = PAL.glass; path(top); ctx.fill();
  ctx.fillStyle = 'rgba(150,165,180,0.45)'; path(front); ctx.fill();
  ctx.strokeStyle = F.ink; ctx.lineWidth = 2; ctx.lineJoin = 'round';
  path(top); ctx.stroke(); path(front); ctx.stroke();
  const s0 = C.p(lerp(x0, x1, 0.08), y1 - 8, z), s1 = C.p(lerp(x0, x1, 0.2), y0 + 8, z);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(s0.x, s0.y); ctx.lineTo(s1.x, s1.y); ctx.stroke();
  ctx.restore();
  const c = C.p(x1 - 20, y0, z);   // label at the plate's right end, clear of the axis title
  ctx.save();
  ctx.globalAlpha *= 1 - go;
  drawTex(ctx, S.sota, c.x, c.y - 48, { size: 38, color: F.ink, align: 'right', valign: 'bottom', write: e(t, T.s77 + 0.2, 0.8, ease.linear) });
  drawTex(ctx, S.iyer, c.x, c.y - 12, { size: 30, color: F.ink2, align: 'right', valign: 'bottom', write: e(t, T.s77 + 0.6, 0.8, ease.linear) });
  ctx.restore();
}

// s5: "we reach 68.9% on MMLU", then "still far from the state-of-the-art, that is 77.4 / for GPT code-davinci-002 on MMLU"
function strips(ctx, C, t, T) {
  const tiltStack = (foot, x, z, rects) => {   // standing lines, top to bottom, left-aligned at x, last line's foot at `foot`
    const hs = rects.map((r) => (r.y1 - r.y0) * SC_STRIP), g = 4 * SC_STRIP;
    const out = [];
    let lift = 0;
    for (let i = rects.length - 1; i >= 0; i--) {
      const w = (rects[i].x1 - rects[i].x0) * SC_STRIP;
      out[i] = { x: x + w / 2, y: foot - lift * Math.cos(PITCH) - hs[i] / 2, z: z + lift * Math.sin(PITCH), w, tilt: PITCH };
      lift += hs[i] + g;
    }
    return out;
  };
  const go = e(t, T.s6 - 0.2, 0.9, ease.inCubic);
  if (go >= 1) return;
  const xL = 1150, foot = 470, zS = 300;
  // "we reach 68.9% on MMLU." — up on "lifts it to", away as the second strip arrives
  {
    const lp = e(t, T.s68 - 0.9, 1.2, ease.linear), out = e(t, T.still - 0.1, 0.7, ease.inCubic);
    if (lp > 0 && out < 1) {
      const [to] = tiltStack(foot, xL, zS + 60, [STRIP_689]);
      const pose = liftPose(p7, P7, STRIP_689, { ...to, arc: 240 }, lp);
      pose.y -= 1000 * out; pose.z += 260 * out;
      sheet(ctx, C, p7, pose, { grid: 3, shadow: 0.3 });
      highlight(ctx, C, p7, pose, L.reach, T.reachP, { color: F.hlMint });
    }
  }
  // "still far … 77.4 / for GPT code-davinci-002 on MMLU" — two lines, the marker runs with the voice
  const lp = e(t, T.still - 0.35, 1.2, ease.linear);
  if (lp <= 0) return;
  const [toA, toB] = tiltStack(foot, xL - 80, zS, [STRIP_FAR1, STRIP_FAR2]);
  const A = liftPose(p7, P7, STRIP_FAR1, { ...toA, arc: 260 }, lp), B = liftPose(p7, P7, STRIP_FAR2, { ...toB, arc: 240 }, e(t, T.still - 0.2, 1.2, ease.linear));
  for (const P of [A, B]) { P.y -= 1100 * go; P.z += 300 * go; }
  sheet(ctx, C, p7, B, { grid: 3, shadow: 0.3 });
  sheet(ctx, C, p7, A, { grid: 3, shadow: 0.3 });
  // line A ends on "77.4" as the voice says it; line B (code-davinci-002, not voiced) follows with the plate's label
  highlight(ctx, C, p7, A, [L.far[0]], T.farP, { color: F.hlMint });
  highlight(ctx, C, p7, B, [L.far[1]], e(t, T.s77 + 0.5, 0.9, ease.linear), { color: F.hlMint });
}

// ── station 2: p. 6 and the two stacks ────────────────────────────────────────
function station2(ctx, C, t, T, env) {
  const pin = e(t, T.s4 - 0.4, 1.0, ease.outCubic);
  if (pin <= 0) return;
  const pose = { ...P6POSE, x: P6POSE.x + 900 * (1 - pin), y: P6POSE.y + 500 * (1 - pin), z: Math.sin(Math.PI * pin) * 140, rot: P6POSE.rot + 0.12 * (1 - pin) };
  sheet(ctx, C, p6, pose);
  highlight(ctx, C, p6, pose, L.expl, sayWords(env, 4, 0, 5, t), { color: F.hlMint });
  highlight(ctx, C, p6, pose, L.sum177, sayWords(env, 4, 6, 16, t), { color: F.hlMint });
  // "while these models were trained on up to" ↔ "against up to"; "2TB of books" ↔ "two terabytes of books"
  const tbA = sayWords(env, 4, 17, 19, t), tbB = sayWords(env, 4, 20, 23, t);
  highlight(ctx, C, p6, pose, [L.tb2[0]], tbA, { color: F.hlMint });
  highlight(ctx, C, p6, pose, [L.tb2[1]], tbB, { color: F.hlMint });

  // two stacks at one scale (height ∝ GB): solid books 85 GB + arXiv 92 GB = 177 GB; glass outline up to 2 TB
  const foot = (x) => [[x - STK.w / 2, STK.y - STK.d / 2], [x + STK.w / 2, STK.y - STK.d / 2], [x + STK.w / 2, STK.y + STK.d / 2], [x - STK.w / 2, STK.y + STK.d / 2]];
  const zB = 85 * GBZ, zA = BOOKS.llamaGB * GBZ, zG = BOOKS.othersUpToTB * 1000 * GBZ;
  const pb = e(t, T.only + 0.25, 0.7, ease.outCubic), pa = e(t, T.only + 0.8, 0.7, ease.outCubic);
  if (pb > 0) prism(ctx, C, foot(STK.xSolid), 0, zB * pb, { fill: PAL.books, stroke: F.ink, width: 1.8 });
  if (pa > 0) prism(ctx, C, foot(STK.xSolid), zB, zB + (zA - zB) * pa, { fill: PAL.arxiv, stroke: F.ink, width: 1.8 });
  const pg = e(t, T.against + 0.35, 1.7, ease.inOutCubic);
  if (pg > 0) prism(ctx, C, foot(STK.xGlass), 0, zG * pg, { fill: PAL.glass, stroke: F.ink2, width: 1.8 });
  const l177 = C.p(STK.xSolid, STK.y - STK.d / 2, zA);
  drawTex(ctx, S.gb177, l177.x, l177.y - 12, { size: 42, color: F.ink, align: 'center', valign: 'bottom', write: e(t, T.gigabytes, 0.6, ease.linear) });
  const lba = C.p(STK.xSolid, STK.y + STK.d / 2, 0);
  drawTex(ctx, S.booksArxiv, lba.x, lba.y + 12, { size: 30, color: F.ink2, align: 'center', valign: 'top', write: e(t, T.gigabytes + 0.4, 0.6, ease.linear) });
  const ltb = C.p(STK.xGlass, STK.y - STK.d / 2, zG * pg);
  drawTex(ctx, S.tb2, ltb.x + 10, ltb.y - 12, { size: 38, color: F.ink, align: 'center', valign: 'bottom', write: e(t, T.terabytes, 0.7, ease.linear) });
  // over both: the authors offer it as a potential explanation
  const lp = C.p((STK.xSolid + STK.xGlass) / 2, STK.y - STK.d / 2, zG);
  tag(ctx, S.potential, lp.x, lp.y - 76, { size: 34, align: 'center', valign: 'bottom', write: e(t, T.terabytes - 0.2, 0.8, ease.linear) });

  // "while these models were trained on up to / 2TB of books.": lifted when the camera tilts up, standing in front of the stacks
  const ls = e(t, T.against - 0.4, 1.3, ease.linear);
  if (ls > 0) {
    const SC = 1.1, g = 4 * SC, xL = (STK.xSolid + STK.xGlass) / 2 - (STRIP_2TB[0].x1 - STRIP_2TB[0].x0) * SC / 2, foot2 = STK.y + 300;
    const hs = STRIP_2TB.map((r) => (r.y1 - r.y0) * SC);
    const to = [
      { x: xL + (STRIP_2TB[0].x1 - STRIP_2TB[0].x0) * SC / 2, y: foot2 - (hs[1] + g) * Math.cos(PITCH) - hs[0] / 2, z: (hs[1] + g) * Math.sin(PITCH), w: (STRIP_2TB[0].x1 - STRIP_2TB[0].x0) * SC, tilt: PITCH, arc: 220 },
      { x: xL + (STRIP_2TB[1].x1 - STRIP_2TB[1].x0) * SC / 2, y: foot2 - hs[1] / 2, z: 0, w: (STRIP_2TB[1].x1 - STRIP_2TB[1].x0) * SC, tilt: PITCH, arc: 200 },
    ];
    const A = liftPose(p6, P6POSE, STRIP_2TB[0], to[0], ls), B = liftPose(p6, P6POSE, STRIP_2TB[1], to[1], e(t, T.against - 0.25, 1.3, ease.linear));
    sheet(ctx, C, p6, B, { grid: 3, shadow: 0.35 });
    sheet(ctx, C, p6, A, { grid: 4, shadow: 0.35 });
    highlight(ctx, C, p6, A, [L.tb2[0]], tbA, { color: F.hlMint });
    highlight(ctx, C, p6, B, [L.tb2[1]], tbB, { color: F.hlMint });
  }
}

// ── station 3: p. 10, Table 14, TruthfulQA ────────────────────────────────────
function station3(ctx, C, t, T, env) {
  const pin = e(t, T.s6 + 1.0, 1.0, ease.outCubic);
  if (pin <= 0) return;
  const pose = { ...P10, x: P10.x + 900 * (1 - pin), y: P10.y + 300 * (1 - pin), z: Math.sin(Math.PI * pin) * 140, rot: P10.rot + 0.12 * (1 - pin) };
  sheet(ctx, C, p10, pose);
  highlight(ctx, C, p10, pose, L.low, sayWords(env, 7, 1, 5, t), { color: F.hlMint });
  highlight(ctx, C, p10, pose, L.hallu, sayWords(env, 7, 13, 17, t), { color: F.hlYellow });

  // Table 14 lifts and stands left of its bars; cells boxed as the bars rise
  const c14 = e(t, T.s6 + 1.3, 1.3, ease.linear);
  const card = liftPose(p10, P10, T14.box, { ...CARD14, arc: 240 }, c14);
  const drawCard = () => {
    if (c14 <= 0) return;
    sheet(ctx, C, p10, card, { grid: 6 });
    markBox(ctx, C, p10, card, cellRect(T14.rows.m65, T14.cols.truthful), e(t, T.pt57 - 0.05, 0.55), { color: STY.m65.ink, width: 2.4, pad: 0 });
    markBox(ctx, C, p10, card, cellRect(T14.rows.gpt3, T14.cols.truthful), e(t, T.pt28 - 0.05, 0.55), { color: STY.gpt3.ink, width: 2.4, pad: 0 });
  };
  if (c14 >= 1) drawCard();

  axis(ctx, C, t, { x0: AX3 - 14, x1: AX3 + SLOT3 * 2, y: BY3, hz: HZT, on: T.truthfulqa, ticks: [0, 0.25, 0.5, 0.75, 1], lab: 'u' });
  const bars = [
    { m: 'm65', v: T14.rows.m65.truthful, x: slot3X(0), at: T.pt57, name: T.truthfulqa + 0.4, vs: S.f057 },
    { m: 'gpt3', v: T14.rows.gpt3.truthful, x: slot3X(1), at: T.pt28, name: T.gpt3, vs: S.f028 },
  ];
  for (const b of bars) {
    const p = e(t, b.at - 0.05, 1.1, ease.outCubic);
    if (p <= 0) continue;
    slab(ctx, C, { x0: b.x - BW / 2, x1: b.x + BW / 2, y0: BY3 - DEP, y1: BY3, z0: 0, z1: Math.max(1.5, b.v * HZT * p) }, { fill: STY[b.m].fill, stroke: STY[b.m].ink, width: 2.4 });
  }
  // s7: the headroom above 0.57 up to 1.0, a glass outline, unlabelled
  const hg = e(t, T.still7, 1.3, ease.inOutCubic);
  if (hg > 0) {
    const x = slot3X(0), z0 = T14.rows.m65.truthful * HZT;
    prism(ctx, C, [[x - BW / 2, BY3 - DEP], [x + BW / 2, BY3 - DEP], [x + BW / 2, BY3], [x - BW / 2, BY3]], z0, lerp(z0 + 1, HZT, hg), { fill: PAL.glass, stroke: F.ink2, width: 1.6 });
  }
  for (const b of bars) {
    const base = C.p(b.x, BY3, 0);
    drawTex(ctx, S[`n_${b.m}`], base.x, base.y + 12, { size: 32, color: F.ink, align: 'center', valign: 'top', write: e(t, b.name, 0.6, ease.linear) });
    const pv = e(t, b.at + 0.5, 0.6, ease.linear);
    if (pv > 0) { const top = C.p(b.x, BY3, b.v * HZT); drawTex(ctx, b.vs, top.x, top.y + 10, { size: 36, color: F.ink, align: 'center', valign: 'top', write: pv }); }
  }
  const at = C.p(AX3 - 14, BY3, HZT);
  drawTex(ctx, S.truthful, at.x - 40, at.y - 78, { size: 34, color: F.ink2, valign: 'bottom', write: e(t, T.truthfulqa + 0.2, 0.8, ease.linear) });   // clear of the s7 glass
  dropTag(ctx, C, S.ouyang, (slot3X(0) + slot3X(1)) / 2 + 20, BY3 + 150, e(t, T.gpt3 + 0.1, 0.5, ease.linear));   // clear of the stamp
  if (c14 > 0 && c14 < 1) drawCard();
}
