// evidence — Tables 1, 3 and 4 as honest bars from 0. Three stations in one row on the desk; at each, the
// table lifts off its page and stands to the right of its bars, and every bar rises on its number with
// its cell boxed on the standing table. Table 1 (p. 5): FEVER and HotpotQA, ReAct vs CoT, the two mixed
// methods two-tone, supervised SoTA as glass plates above. Table 3 (p. 8): ALFWorld, the 71 always with
// its "best of 6" and the 57 average beside it, BUTLER best of 8 with beam search, the abstract's 34 as a
// bracket. Table 4 (p. 8): WebShop, human experts as a glass plate. Last second: pull back to all three.
// Guardrails (briefing): ReAct alone loses to CoT on HotpotQA (shown plainly); 57 is on screen whenever
// 71 or 34 is; no "10.9" / "eleven"; reference levels are plates, not bars.
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, texSize, desk, edgeIn, loadPaper, findPhrase, cameraAt, sheet, highlight,
  markBox, liftPose, slab, cite, sayWords,
} from '/engine/folio.js';
import { PAL, T1, T3, T4 } from './_data.js';

// ── world layout (desk px) ───────────────────────────────────────────────────
// One row of stations, left to right. Each table stands to the right of its bars and is picked up when
// the camera moves on; the next station's bars stand where it was, so the last second can show all three.
const HZ = 4.0;                    // world z per percentage point: 100 % stands 400 high
const BY0 = 590, BY1 = 650;        // bar footprint, back and front edge
const BW = 90;                     // bar width
const PITCH = 0.78;                // station camera pitch; standing cards tilt the same, so they face it
const A1 = 600;                    // station 1 axis (Table 1)
const A2 = A1 + 1200;              // station 2 axis (Table 3), where Table 1 stood
const A3 = A2 + 1250;              // station 3 axis (Table 4), where Table 3 stood
const DIST = 8000;                 // long lens: bars stay upright across the frame

// crops (page px)
const STRIP_A = { x0: 296, y0: 1367, x1: 1128, y1: 1398 };   // p. 5 "ReAct fails to return … back off to CoT-SC."
const STRIP_B = { x0: 360, y0: 1459, x1: 1298, y1: 1489 };   // p. 5 "(i.e. internal knowledge … back off to ReAct."
const STRIP_1 = { x0: 392, y0: 1253, x1: 1306, y1: 1313 };   // p. 1 abstract, "… by / an absolute success rate of 34% and 10% …"
const HEUR = { x0: 296, y0: 1367, x1: 1298, y1: 1489 };      // stamp box for the two p. 5 strips
const FEVER_HEAD = { x0: 693, y0: 238, x1: 748, y1: 284 };    // Table 1 column headers (p. 5 words)
const HOTPOT_HEAD = { x0: 560, y0: 238, x1: 664, y1: 284 };

// label rows under the bars (screen px below the bar's front-bottom edge)
const ROW = { name: 14, q: 54, q2: 90, title: 136, sub: 176, tag: 212 };
// labels are screen-sized; when the camera pulls back for the last second they shrink with it, never under 30 px
let LS = 1, RS = 1;
const sz = (n) => Math.max(30, n * LS);
const row = (k) => ROW[k] * RS;

const v1 = (v) => v.toFixed(1);
const S = {
  c5: '\\text{p. 5}\\;\\cdot\\;\\text{Table 1}',
  c5h: '\\text{p. 5}\\;\\cdot\\;\\text{Section 3.2}',
  c8a: '\\text{p. 8}\\;\\cdot\\;\\text{Table 3}',
  c8b: '\\text{p. 8}\\;\\cdot\\;\\text{Table 4}',
  c1: '\\text{p. 1}\\;\\cdot\\;\\text{Abstract}',
  fever: '\\text{FEVER}', feverSub: '\\text{(accuracy)}',
  hotpot: '\\text{HotpotQA}', hotpotSub: '\\text{(exact match)}',
  alf: '\\text{ALFWorld}', rate: '\\text{success rate (\\%)}',
  games: '\\text{134 unseen games}',
  web: '\\text{WebShop}',
  cot: '\\text{CoT}', react: '\\text{ReAct}', act: '\\text{Act}', butler: '\\text{BUTLER}', il: '\\text{IL}', ilrl: '\\text{IL+RL}',
  r2c: '\\text{ReAct} \\to \\text{CoT-SC}', c2r: '\\text{CoT-SC} \\to \\text{ReAct}',
  sota: '\\text{supervised SoTA}', human: '\\text{human experts}',
  best6: '\\text{best of 6}', best8: '\\text{best of 8}', avg6: '\\text{average of 6}',
  experts1: '10^5 \\text{ expert runs}', experts2: '\\text{per task type}',
  beam: '\\text{beam search}',
  gap: '34',
  t0: '0', t25: '25', t50: '50', t75: '75', t100: '100',
};

// table rows by name, cells as page-px rects
const r1 = (m) => T1.rows.find((r) => r.m === m);
const r3 = (m) => T3.rows.find((r) => r.m === m);
const r4 = (m) => T4.rows.find((r) => r.m === m);
const cell = (row, col) => ({ x0: col.x0, y0: row.y0, x1: col.x1, y1: row.y1 });

// bar styles: fill / outline / value colour
const toWhite = (hex, f) => {   // a lighter step of a palette colour (f = share of white)
  const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * f));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;   // hex: slab() shades it
};
const STY = {
  react: { fill: PAL.act, ink: PAL.actInk, txt: PAL.actInk },
  avg: { fill: toWhite(PAL.act, 0.6), ink: PAL.actInk, txt: PAL.actInk },   // the average: a lighter step of ReAct's fill
  cot: { fill: PAL.thought, ink: PAL.thoughtInk, txt: PAL.thoughtInk },
  mix: { fill: PAL.act, ink: F.ink, txt: F.ink },
  base: { fill: F.block, ink: F.ink, txt: F.ink },
};

let p1, p5, p8, L, BARS, PLATES;

export default {
  async setup(env) {
    await loadB1B();
    const P = await loadPaper(env.ep, [1, 5, 8]);
    p1 = P.page(1); p5 = P.page(5); p8 = P.page(8);
    L = {
      cap1: findPhrase(p5, 'PaLM-540B prompting results on HotpotQA and Fever.'),
      stuck: findPhrase(p5, 'back off to CoT-SC.'),
      unsure: findPhrase(p5, 'back off to ReAct.'),
      beam: findPhrase(p8, 'except that BUTLER uses beam search.'),
      abs: findPhrase(p1, 'by an absolute success rate of 34% and 10% respectively'),
    };
    // bars: station, x, value, style, its cell on the table, labels (name row, qualifier row), cue names
    const f = T1.cols.fever, h = T1.cols.hotpot, a = T3.cols.all, sr = T4.cols.sr;
    BARS = [
      { st: 1, x: A1 + 90, v: r1('CoT').fever, sty: 'cot', cell: cell(r1('CoT'), f), name: S.cot, cue: 'fiftysix', nameCue: 'chain' },
      { st: 1, x: A1 + 225, v: r1('ReAct').fever, sty: 'react', cell: cell(r1('ReAct'), f), name: S.react, cue: 'sixty', nameCue: 'react1' },
      { st: 1, x: A1 + 360, v: r1('CoT-SC → ReAct').fever, sty: 'mix', cell: cell(r1('CoT-SC → ReAct'), f), name2: S.c2r, cue: 'sixtyfour', nameCue: 'mix' },
      { st: 1, x: A1 + 590, v: r1('CoT').hotpot, sty: 'cot', cell: cell(r1('CoT'), h), name: S.cot, cue: 'twentynine', nameCue: 'hotpot' },
      { st: 1, x: A1 + 725, v: r1('ReAct').hotpot, sty: 'react', bad: true, cell: cell(r1('ReAct'), h), name: S.react, cue: 'twentyseven', nameCue: 'loses' },
      { st: 1, x: A1 + 860, v: r1('ReAct → CoT-SC').hotpot, sty: 'mix', cell: cell(r1('ReAct → CoT-SC'), h), name2: S.r2c, cue: 'thirtyfive', nameCue: 'mix2' },
      { st: 2, x: A2 + 100, v: r3('Act (best of 6)').all, sty: 'base', cell: cell(r3('Act (best of 6)'), a), name: S.act, q: S.best6, cue: 'fortyfive', nameCue: 'acting' },
      { st: 2, x: A2 + 290, v: r3('ReAct (avg)').all, sty: 'avg', cell: cell(r3('ReAct (avg)'), a), name: S.react, q: S.avg6, qRow: 'q2', cue: 'avgQuiet', nameCue: 'avgQuiet' },
      { st: 2, x: A2 + 480, v: r3('ReAct (best of 6)').all, sty: 'react', cell: cell(r3('ReAct (best of 6)'), a), name: S.react, q: S.best6, cue: 'seventyone', nameCue: 'seventyone' },
      { st: 2, x: A2 + 680, v: r3('BUTLER (best of 8)').all, sty: 'base', cell: cell(r3('BUTLER (best of 8)'), a), name: S.butler, q: S.best8, cue: 'thirtyseven', nameCue: 'imitation' },
      { st: 3, x: A3 + 90, v: r4('Act').sr, sty: 'base', quiet: true, cell: cell(r4('Act'), sr), name: S.act, cue: 'actQuiet', nameCue: 'actQuiet' },
      { st: 3, x: A3 + 225, v: r4('ReAct').sr, sty: 'react', cell: cell(r4('ReAct'), sr), name: S.react, cue: 'forty', nameCue: 'succeeds' },
      { st: 3, x: A3 + 360, v: r4('IL').sr, sty: 'base', cell: cell(r4('IL'), sr), name: S.il, cue: 'twentynine2', nameCue: 'trained' },
      { st: 3, x: A3 + 495, v: r4('IL+RL').sr, sty: 'base', quiet: true, cell: cell(r4('IL+RL'), sr), name: S.ilrl, cue: 'ilrlQuiet', nameCue: 'ilrlQuiet' },
    ];
    BARS.forEach((b) => { b.val = b.st === 2 ? String(b.v) : v1(b.v); b.vs = `v_${b.val}`; S[b.vs] = b.val; });
    // reference levels: glass plates over a whole group, rising from its tallest bar
    PLATES = [
      { x0: A1 + 30, x1: A1 + 420, v: r1('Supervised SoTA').fever, from: r1('CoT-SC → ReAct').fever, name: S.sota, cue: 'far', labCue: 'best' },
      { x0: A1 + 530, x1: A1 + 920, v: r1('Supervised SoTA').hotpot, from: r1('ReAct → CoT-SC').hotpot, name: S.sota, cue: 'far', labCue: 'best' },
      { x0: A3 + 30, x1: A3 + 555, v: r4('Human Expert').sr, from: r4('ReAct').sr, name: S.human, cue: 'fiftynine', labCue: 'fiftynine' },
    ];
    PLATES.forEach((p) => { p.val = v1(p.v); p.vs = `v_${p.val}`; S[p.vs] = p.val; });
    Object.values(S).forEach((s) => tex(s));
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      one: q.w(0, 'one', 2), prompts: q.w(0, 'prompts'),
      s1: q.s(1), fever: q.w(1, 'FEVER'), react1: q.w(1, 'ReAct'), chain: q.w(1, 'chain'), sixty: q.w(1, 'sixty'), fiftysix: q.w(1, 'fifty-six'),
      s2: q.s(2), hotpot: q.w(2, 'HotpotQA'), loses: q.w(2, 'loses'), twentyseven: q.w(2, 'twenty-seven'), twentynine: q.w(2, 'twenty-nine'),
      s3: q.s(3), mix: q.w(3, 'mix'), switching: q.w(3, 'switching'), stuck: q.w(3, 'stuck'), unsure: q.w(3, 'unsure'),
      thirtyfive: q.w(3, 'thirty-five'), sixtyfour: q.w(3, 'sixty-four'),
      s4: q.s(4), far: q.w(4, 'far'), best: q.w(4, 'best'), supervised: q.w(4, 'supervised'),
      s5: q.s(5), household: q.w(5, 'household'),
      s6: q.s(6), seventyone: q.w(6, 'seventy-one'), unseen: q.w(6, 'unseen'),
      s7: q.s(7), acting: q.w(7, 'Acting'), fortyfive: q.w(7, 'forty-five'),
      s8: q.s(8), imitation: q.w(8, 'imitation-learning'), hundred: q.w(8, 'hundred'), thirtyseven: q.w(8, 'thirty-seven'),
      s9: q.s(9), gap: q.w(9, 'gap'), abstracts: q.w(9, "abstract's"), thirtyfour: q.w(9, 'thirty-four'), best1: q.w(9, 'best'), best2: q.w(9, 'best', 2),
      s10: q.s(10), averaged: q.w(10, 'Averaged'), fiftyseven: q.w(10, 'fifty-seven'),
      s11: q.s(11), webshop: q.w(11, 'WebShop'), succeeds: q.w(11, 'succeeds'), forty: q.w(11, 'forty'),
      s12: q.s(12), trained: q.w(12, 'trained'), twentynine2: q.w(12, 'twenty-nine'),
      s13: q.s(13), fiftynine: q.w(13, 'fifty-nine'),
    };
    T.mix2 = T.mix + 0.35;
    T.avgQuiet = T.unseen - 0.35;           // the 57 rises with the 71 (briefing: 57 on screen whenever 71 is)
    T.actQuiet = T.forty + 0.75;            // WebShop's quiet bars, no voice
    T.ilrlQuiet = T.forty + 1.05;

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    // ── camera ──
    const st = { pitch: PITCH, dist: DIST, yaw: 0 };
    const CAM1 = { ...st, tx: A1 + 685, ty: 500, zoom: 1.1 };
    const CAM2 = { ...st, tx: A2 + 715, ty: 500, zoom: 1.1 };
    const CAM3 = { ...st, tx: A3 + 420, ty: 500, zoom: 1.15 };
    const C = cameraAt(t, [
      { t: 0, tx: 1107, ty: 948, zoom: 2.0, pitch: 0.18, dist: DIST },          // Table 1 on p. 5
      { t: T.one + 0.75, dur: 2.0, ...CAM1 },                                    // the table lifts, the desk tilts up
      { t: T.s1 + 0.6, dur: 9, tx: CAM1.tx - 20, zoom: 1.13 },                    // slow push while FEVER / HotpotQA fill
      { t: T.s3 - 0.2, dur: 1.8, tx: CAM1.tx - 50, ty: 465, zoom: 1.1 },         // room above for the two strips
      { t: T.s4 - 0.2, dur: 1.8, tx: CAM1.tx - 30, ty: 450, pitch: 0.9, zoom: 1.08 },   // tilt up: the ceilings
      { t: T.s5 - 0.35, dur: 1.7, tx: A2 + 523, ty: 900, pitch: 0.4, zoom: 1.6 },        // p. 8 arrives at station 2
      { t: T.s6 - 0.5, dur: 2.0, ...CAM2 },
      { t: T.s7, dur: 8, tx: CAM2.tx + 15, zoom: 1.13 },
      { t: T.s9 - 0.3, dur: 1.6, tx: CAM2.tx, ty: 470, zoom: 1.1 },              // bracket + the abstract strip
      { t: T.s10, dur: 3.5, tx: CAM2.tx + 30, ty: 510, zoom: 1.16 },             // the 71 and the 57 (the table stays in frame)
      { t: T.s11 - 0.3, dur: 1.4, tx: A3 + 440, ty: 790, pitch: 0.6, zoom: 1.2 },   // p. 8 again, Table 4
      { t: T.webshop + 0.6, dur: 1.8, ...CAM3 },
      { t: T.forty + 1.2, dur: 5, tx: CAM3.tx + 15, zoom: 1.2 },
      { t: T.fiftynine + 0.55, dur: 1.15, tx: 2060, ty: 470, pitch: 0.85, zoom: 0.575 },  // last second: all three groups
    ]);
    LS = Math.min(1, C.zoom / 1.1); RS = Math.max(0.8, LS);
    const fin = e(t, T.fiftynine + 0.55, 0.6);           // the pull-back: secondary tags step aside

    // ── pages arriving in each station's foreground ──
    const P5rest = { x: 1250, y: 1250, w: 760, rot: -0.02 };
    const pin5 = e(t, 0, 1.1, ease.outCubic), out5 = e(t, T.one + 1.0, 1.1, ease.inCubic);
    const P5gone = { x: P5rest.x - 500, y: P5rest.y + 1500, w: 760, rot: P5rest.rot - 0.1 };
    if (out5 < 1) {
      const P5 = { x: P5rest.x + 300 * (1 - pin5) - 500 * out5, y: P5rest.y + 900 * (1 - pin5) + 1500 * out5, z: Math.sin(Math.PI * pin5) * 140, w: 760, rot: P5rest.rot + 0.12 * (1 - pin5) - 0.1 * out5 };
      sheet(ctx, C, p5, P5);
      highlight(ctx, C, p5, P5, L.cap1, sayWords(env, 0, 2, 4, t), { color: F.hlMint });
    }
    const P8a = { x: A2 + 600, y: 1200, w: 760, rot: 0.015 };
    page8(ctx, C, P8a, e(t, T.s5 - 0.4, 1.1, ease.outCubic), e(t, T.s6 - 0.2, 1.1, ease.inCubic));
    const P8b = { x: A3 + 300, y: 1180, w: 760, rot: -0.015 };
    page8(ctx, C, P8b, e(t, T.s11 - 0.35, 1.1, ease.outCubic), e(t, T.webshop + 1.0, 1.0, ease.inCubic));

    // ── standing tables (lifted copies), picked up when the camera moves on ──
    const cards = [
      { st: 1, page: p5, from: P5rest, rect: T1.withCaption, w: 480, cx: A1 + 1240, p: e(t, T.one + 0.55, 1.7, ease.linear), go: e(t, T.s5 - 0.3, 1.0, ease.inCubic) },
      { st: 2, page: p8, from: P8a, rect: T3.withCaption, w: 560, cx: A2 + 1260, p: e(t, T.household + 0.9, 1.7, ease.linear), go: e(t, T.s11 - 0.3, 1.0, ease.inCubic) },
      { st: 3, page: p8, from: P8b, rect: T4.withCaption, w: 300, cx: A3 + 800, p: e(t, T.s11 + 0.55, 1.6, ease.linear), go: e(t, T.fiftynine + 0.65, 0.8, ease.inCubic) },
    ];
    for (const c of cards) {
      const hh = c.w * (c.rect.y1 - c.rect.y0) / (c.rect.x1 - c.rect.x0);
      c.pose = liftPose(c.page, c.from, c.rect, { x: c.cx, y: BY1 - hh / 2, z: 0, w: c.w, tilt: PITCH, arc: 300 }, c.p);
      c.pose.z += 380 * c.go; c.pose.y -= 1300 * c.go;              // picked up: up and away to the back
    }
    const drawCard = (c) => {
      if (c.p <= 0 || c.go >= 1) return;
      sheet(ctx, C, c.page, c.pose, { grid: 6 });
      const box = (r, p, color = F.ink2, width = 2.6) => markBox(ctx, C, c.page, c.pose, r, p, { color, width, pad: 4 });
      if (c.st === 1) {
        highlight(ctx, C, p5, c.pose, L.cap1, sayWords(env, 0, 2, 4, t), { color: F.hlMint });
        box(FEVER_HEAD, e(t, T.fever, 0.6));
        box(HOTPOT_HEAD, e(t, T.hotpot, 0.6));
        const sota = r1('Supervised SoTA');
        box({ x0: 312, y0: sota.y0, x1: 745, y1: sota.y1 }, e(t, T.s4 + 0.05, 0.7));
      }
      if (c.st === 2) {
        highlight(ctx, C, p8, c.pose, L.beam, e(t, T.thirtyseven + 0.35, 0.8, ease.linear), { color: F.hlMint });
        // s10: the average's cell again, heavier
        box(BARS[7].cell, e(t, T.averaged, 0.6), PAL.actInk, 2.6 + 2.4 * Math.sin(Math.PI * e(t, T.averaged, 1.6, ease.linear)));
      }
      if (c.st === 3) box(cell(r4('Human Expert'), T4.cols.sr), e(t, T.fiftynine, 0.6));
      for (const b of BARS) if (b.st === c.st) box(b.cell, e(t, T[b.cue] - 0.1, 0.6), b.bad ? F.red : STY[b.sty].ink, b.quiet ? 2 : 2.6);
    };
    cards.filter((c) => c.p >= 1).forEach(drawCard);

    // ── axes, gridlines, titles ──
    const AX = [
      { a: A1, x1: A1 + 920, on: T.one + 1.9, titles: [{ s: S.fever, sub: S.feverSub, x: A1 + 225 }, { s: S.hotpot, sub: S.hotpotSub, x: A1 + 725 }] },
      { a: A2, x1: A2 + 760, on: T.s6 + 0.3, titles: [{ s: S.alf, sub: S.rate, tag: S.games, x: A2 + 385 }] },
      { a: A3, x1: A3 + 585, on: T.webshop + 0.9, titles: [{ s: S.web, sub: S.rate, x: A3 + 290 }] },
    ];
    for (const g of AX) axis(ctx, C, t, g, fin);

    // ── bars (far to near), level lines, plates, bracket ──
    BARS.map((b) => ({ b, p: e(t, T[b.cue] - 0.12, 0.9, ease.outCubic), d: C.p(b.x, (BY0 + BY1) / 2, 0).depth }))
      .filter((o) => o.p > 0).sort((u, w) => w.d - u.d).forEach(({ b, p }) => bar(ctx, C, t, b, p, T));
    // HotpotQA: CoT's level carried over ReAct's top — ReAct alone loses here
    const hc = BARS[3], hr = BARS[4];
    const lv = e(t, T.twentynine + 0.75, 0.6, ease.inOutCubic);
    if (lv > 0) dashed(ctx, C, hc.x + BW / 2, lerp(hc.x + BW / 2, hr.x + BW / 2 + 14, lv), hc.v * HZ, F.red, 2.6);
    for (const pl of PLATES) plate(ctx, C, t, pl, T, fin);
    bracket(ctx, C, t, T);

    // ── labels ──
    for (const b of BARS) barLabels(ctx, C, t, b, T, fin);

    // ── strips: p. 5 switching rules (s3), p. 1 abstract (s9) ──
    stripsP5(ctx, C, t, T, P5gone);
    stripP1(ctx, C, t, T);

    // cards in flight pass over everything
    cards.filter((c) => c.p > 0 && c.p < 1).forEach(drawCard);

    // ── source stamp ──
    const stamps = [
      [0, p5, S.c5, T1.withCaption],
      [T.switching, p5, S.c5h, HEUR],
      [T.thirtyfive - 0.25, p5, S.c5, T1.withCaption],
      [T.s5 - 0.2, p8, S.c8a, T3.withCaption],
      [T.abstracts, p1, S.c1, STRIP_1],
      [T.s10, p8, S.c8a, T3.withCaption],
      [T.s11 - 0.2, p8, S.c8b, T4.withCaption],
    ];
    let k = 0;
    while (k + 1 < stamps.length && t >= stamps[k + 1][0]) k++;
    const [, sp, sl, sr] = stamps[k];
    const dip = Math.min(1, ...stamps.slice(1).map(([ts]) => clamp(Math.abs(t - ts) / 0.22)));
    cite(ctx, sp, { label: sl, rect: sr, alpha: e(t, 0.6, 0.6) * dip * (1 - fin), side: 'right' });   // the pull-back shows all three tables
  },
};

// ── pieces ───────────────────────────────────────────────────────────────────

// p. 8 slides into a station's foreground (arc from the right), later slides out towards the viewer
function page8(ctx, C, rest, pin, out) {
  if (pin <= 0 || out >= 1) return;
  sheet(ctx, C, p8, {
    x: rest.x + 1300 * (1 - pin) + 300 * out, y: rest.y + 300 * (1 - pin) + 1500 * out,
    z: Math.sin(Math.PI * pin) * 140, w: rest.w, rot: rest.rot + 0.14 * (1 - pin) + 0.1 * out,
  });
}

function axis(ctx, C, t, g, fin) {
  const ax = e(t, g.on, 0.8, ease.inOutCubic);
  if (ax <= 0) return;
  const top = 100 * HZ;
  ctx.save();
  ctx.lineCap = 'round';
  // gridlines on the bars' front plane (a value reads at the front-top edge), ticks and TeX values on the left
  [0, 25, 50, 75, 100].forEach((v, i) => {
    const z = v * HZ;
    if (z > top * ax + 0.5) return;
    const a = C.p(g.a, BY1, z), b = C.p(lerp(g.a, g.x1, e(t, g.on + 0.15 + i * 0.05, 0.7, ease.inOutCubic)), BY1, z);
    ctx.strokeStyle = v ? 'rgba(150,140,125,0.45)' : F.ink2; ctx.lineWidth = v ? 1.4 : 2.2;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    const k0 = C.p(g.a - 14, BY1, z);
    ctx.strokeStyle = F.ink2; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(k0.x, k0.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    drawTex(ctx, S[`t${v}`], k0.x - 8, k0.y, { size: 30, color: F.ink2, align: 'right', valign: 'middle', write: e(t, g.on + 0.2 + i * 0.08, 0.4, ease.linear) });
  });
  const a0 = C.p(g.a, BY1, 0), a1 = C.p(g.a, BY1, top * ax);
  ctx.strokeStyle = F.ink2; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke();
  ctx.restore();
  // titles under the label rows: benchmark, then what is measured
  for (const ti of g.titles) {
    const p = C.p(ti.x, BY1, 0);
    drawTex(ctx, ti.s, p.x, p.y + row('title'), { size: sz(36), color: F.ink, align: 'center', valign: 'top', write: e(t, g.on + 0.1, 0.8, ease.linear) });
    drawTex(ctx, ti.sub, p.x, p.y + row('sub'), { size: 30, color: F.ink2, align: 'center', valign: 'top', write: e(t, g.on + 0.4, 0.8, ease.linear) });
    if (ti.tag) drawTex(ctx, ti.tag, p.x, p.y + row('tag'), { size: 30, color: F.ink2, align: 'center', valign: 'top', write: e(t, g.on + 0.8, 0.8, ease.linear), alpha: 1 - fin });
  }
}

function bar(ctx, C, t, b, p, T) {
  const st = STY[b.sty];
  const h = Math.max(2, b.v * HZ * p);
  const box = { x0: b.x - BW / 2, x1: b.x + BW / 2, y0: BY0, y1: BY1 };
  if (b.sty === 'mix') {
    // the combined methods: one slab, its lower half in CoT's colour and its upper half in ReAct's
    slab(ctx, C, { ...box, z0: 0, z1: h }, { fill: PAL.act, stroke: PAL.actInk, width: 2.2 });
    const half = Math.min(h, b.v * HZ / 2);
    const Q = [[box.x0, 0], [box.x1, 0], [box.x1, half], [box.x0, half]].map(([x, z]) => C.p(x, BY1, z));
    ctx.save();
    ctx.fillStyle = PAL.thought; ctx.strokeStyle = PAL.thoughtInk; ctx.lineWidth = 2.2 * Q[0].k; ctx.lineJoin = 'round';
    ctx.beginPath(); Q.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    return;
  }
  let stroke = st.ink, width = b.quiet ? 1.6 : 2.2;
  if (b.bad) { stroke = PAL.bad; width = 3.4; }
  // s10: the average gets the voice — its outline swells on "Averaged" and "fifty-seven"
  if (b.sty === 'avg') width += 1.8 * Math.sin(Math.PI * e(t, T.averaged, 1.4, ease.linear)) + 1.8 * Math.sin(Math.PI * e(t, T.fiftyseven - 0.1, 0.9, ease.linear));
  slab(ctx, C, { ...box, z0: 0, z1: h }, { fill: st.fill, stroke, width });
}

function barLabels(ctx, C, t, b, T, fin) {
  const st = STY[b.sty];
  const bt = T[b.cue], nt = T[b.nameCue];
  const base = C.p(b.x, BY1, 0);
  // value on top, written as the bar lands
  const pv = e(t, bt + 0.3, 0.55, ease.linear);
  if (pv > 0) {
    const top = C.p(b.x, (BY0 + BY1) / 2, b.v * HZ);
    const sw = b.sty === 'avg' ? 1 + 0.12 * Math.sin(Math.PI * e(t, T.fiftyseven, 0.7, ease.linear)) : 1;
    drawTex(ctx, S[b.vs], top.x, top.y - 12, { size: sz(b.quiet ? 34 : 40) * sw, color: b.quiet ? F.ink2 : st.txt, align: 'center', valign: 'bottom', write: pv });
  }
  const nameColor = b.bad && t > T.loses ? F.red : b.sty === 'base' ? F.ink : st.txt;
  if (b.name) drawTex(ctx, b.name, base.x, base.y + row('name'), { size: sz(34), color: nameColor, align: 'center', valign: 'top', write: e(t, nt, 0.6, ease.linear) });
  if (b.name2) drawTex(ctx, b.name2, base.x, base.y + row('q'), { size: sz(32), color: F.ink, align: 'center', valign: 'top', write: e(t, nt, 0.8, ease.linear) });
  if (b.q) {
    // qualifiers arrive with the value; the best-of labels pulse on "best prompt against best run"
    const pulse = b.q === S.best8 ? bump(t, T.best2) : b.sty === 'react' ? bump(t, T.best1) : b.sty === 'avg' ? bump(t, T.averaged, 1.2) : 0;
    const qc = b.sty === 'base' ? F.ink2 : PAL.actInk;
    drawTex(ctx, b.q, base.x, base.y + row(b.qRow || 'q'), { size: 30 * (1 + 0.16 * pulse), color: qc, align: 'center', valign: 'top', write: e(t, bt + 0.1, 0.6, ease.linear) });
  }
  if (b.name === S.butler) {
    drawTex(ctx, S.beam, base.x, base.y + row('q2'), { size: 30, color: F.ink2, align: 'center', valign: 'top', write: e(t, T.thirtyseven + 0.6, 0.7, ease.linear) });
    // trained on 10^5 expert runs per task type — beside its slot, on "a hundred thousand expert runs per task type"
    // (context for s8: it steps aside once the camera moves on)
    const tg = C.p(b.x + BW / 2 + 26, BY1, 75), ta = 1 - e(t, T.s11 - 0.4, 0.6);
    drawTex(ctx, S.experts1, tg.x, tg.y, { size: 32, color: F.ink2, valign: 'bottom', write: e(t, T.hundred, 0.9, ease.linear), alpha: ta });
    drawTex(ctx, S.experts2, tg.x, tg.y + 8, { size: 32, color: F.ink2, valign: 'top', write: e(t, T.hundred + 0.8, 0.8, ease.linear), alpha: ta });
  }
}

const bump = (t, at, hold = 0.5) => e(t, at, 0.25) * (1 - e(t, at + 0.25 + hold, 0.45));

function plate(ctx, C, t, pl, T, fin) {
  const p = e(t, T[pl.cue], 1.1, ease.inOutCubic);
  if (p <= 0) return;
  const z = lerp(pl.from * HZ, pl.v * HZ, p);
  const y0 = BY0 - 22, y1 = BY1 + 22, th = 7;
  const top = [C.p(pl.x0, y0, z), C.p(pl.x1, y0, z), C.p(pl.x1, y1, z), C.p(pl.x0, y1, z)];
  const front = [C.p(pl.x0, y1, z - th), C.p(pl.x1, y1, z - th), C.p(pl.x1, y1, z), C.p(pl.x0, y1, z)];
  const path = (Q) => { ctx.beginPath(); Q.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); };
  ctx.save();
  ctx.globalAlpha *= clamp(p * 4) * (1 - 0.45 * fin);   // lighter in the pull-back, so the values under it read
  ctx.fillStyle = 'rgba(214,228,240,0.42)'; path(top); ctx.fill();
  ctx.fillStyle = 'rgba(170,190,210,0.55)'; path(front); ctx.fill();
  ctx.strokeStyle = F.ink; ctx.lineWidth = 2; ctx.lineJoin = 'round';
  path(top); ctx.stroke(); path(front); ctx.stroke();
  const s0 = C.p(lerp(pl.x0, pl.x1, 0.1), y1 - 8, z), s1 = C.p(lerp(pl.x0, pl.x1, 0.28), y0 + 8, z);   // a sheen
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(s0.x, s0.y); ctx.lineTo(s1.x, s1.y); ctx.stroke();
  ctx.restore();
  // label above the plate: name + value
  const lt = T[pl.labCue];
  const c = C.p((pl.x0 + pl.x1) / 2, y0, z);
  const nm = texSize(pl.name, 30), vs = texSize(S[pl.vs], sz(40)), wAll = nm.w + 14 + vs.w;
  drawTex(ctx, pl.name, c.x - wAll / 2, c.y - 14, { size: 30, color: F.ink2, valign: 'bottom', write: e(t, lt, 0.7, ease.linear) });
  drawTex(ctx, S[pl.vs], c.x - wAll / 2 + nm.w + 14, c.y - 12, { size: sz(40), color: F.ink, valign: 'bottom', write: e(t, lt + 0.25, 0.6, ease.linear) });
}

function dashed(ctx, C, x0, x1, z, color, width) {
  const a = C.p(x0, BY1, z), b = C.p(x1, BY1, z);
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash([10, 8]); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.restore();
}

// ALFWorld: the abstract's 34 = best of 6 (71) against best of 8 (37), a bracket between the two tops
function bracket(ctx, C, t, T) {
  const best = BARS[8], butler = BARS[9];
  const p = e(t, T.gap, 0.8, ease.inOutCubic);
  if (p <= 0) return;
  const zA = best.v * HZ, zB = butler.v * HZ;
  const xL = best.x + BW / 2, xR = butler.x + BW / 2 + 28;
  dashed(ctx, C, xL, lerp(xL, xR, p), zA, F.ink, 2.6);
  const q = e(t, T.gap + 0.5, 0.8, ease.inOutCubic);
  if (q > 0) {
    const b0 = C.p(xR, BY1, zA), b1 = C.p(xR, BY1, lerp(zA, zB, q));
    ctx.save();
    ctx.strokeStyle = F.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(b0.x - 10, b0.y); ctx.lineTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); if (q >= 1) ctx.lineTo(b1.x - 10, b1.y); ctx.stroke();
    ctx.restore();
  }
  const m = C.p(xR + 20, BY1, (zA + zB) / 2);
  drawTex(ctx, S.gap, m.x, m.y, { size: sz(52), color: F.ink, valign: 'middle', write: e(t, T.thirtyfour, 0.6, ease.linear) });
}

// two lines lifted off lower p. 5 (the page went off the desk towards the viewer): the two switching rules
function stripsP5(ctx, C, t, T, from) {
  const go = e(t, T.s4 - 0.4, 0.9, ease.inCubic);
  if (go >= 1) return;
  const list = [
    { r: STRIP_A, w: 760, x: A1 + 420, z: 470, at: T.switching - 0.2, hl: L.stuck, hlAt: T.stuck },
    { r: STRIP_B, w: 857, x: A1 + 470, z: 395, at: T.switching + 0.05, hl: L.unsure, hlAt: T.unsure },
  ];
  for (const s of list) {
    const lp = e(t, s.at, 1.25, ease.linear);
    if (lp <= 0) continue;
    const pose = liftPose(p5, from, s.r, { x: s.x, y: BY0 - 40, z: s.z, w: s.w, tilt: PITCH, arc: 240 }, lp);
    pose.y -= 1200 * go; pose.z += 300 * go;
    sheet(ctx, C, p5, pose, { grid: 4, shadow: 0.3 });   // floating: a faint shadow, not a band across the bars
    highlight(ctx, C, p5, pose, s.hl, e(t, s.hlAt, 0.55, ease.linear), { color: F.hlMint });
  }
}

// the abstract's line, p. 1 (arrives from off the desk): "… by an absolute success rate of 34% and 10% respectively"
function stripP1(ctx, C, t, T) {
  const lp = e(t, T.abstracts - 0.25, 1.2, ease.linear);
  const go = e(t, T.s10 - 0.15, 0.9, ease.inCubic);
  if (lp <= 0 || go >= 1) return;
  const from = { x: A2 + 2000, y: 1600, w: 760, rot: 0.1 };
  const pose = liftPose(p1, from, STRIP_1, { x: A2 + 400, y: BY0 - 40, z: 430, w: 780, tilt: PITCH, arc: 240 }, lp);
  pose.y -= 1200 * go; pose.z += 300 * go;
  sheet(ctx, C, p1, pose, { grid: 4, shadow: 0.3 });
  highlight(ctx, C, p1, pose, L.abs, e(t, T.thirtyfour - 0.1, 0.9, ease.linear), { color: F.hlMint });
}
