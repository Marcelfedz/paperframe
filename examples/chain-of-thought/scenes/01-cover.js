// cover — p. 1 on the desk: the date (v1) and the version we show (v6), nine authors from one team, the
// abstract's key line read with the voice and lifted off as a standing strip (blue underline = chain of thought),
// Figure 1's worked example and its blue reasoning, the PaLM 540B / GSM8K line, three thumbnails of what's
// ahead (Figure 1 right input, Figure 4's GSM8K row, Figure 5), then Figure 1's two Model Output frames side by
// side: grey standard ✗ in red, blue chain of thought ✓ in green. This segment teaches the video's colours.
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, win, desk, edgeIn, loadPaper, findPhrase, cameraAt, sheet, sheetPt, onSheet,
  highlight, markBox, liftPose, cite, sayP, sayWords, tag, standIn,
} from '/engine/folio.js';
import { PAL, PH, P1, FIG1, FIG4, FIG5 } from './_data.js';

// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars, same geometry) and redrawn figures.
const PAGES = true;

const S = {
  arxiv: '\\texttt{arXiv:2201.11903}',
  v1: '\\text{v1}\\;\\cdot\\;\\text{28 January 2022}',
  v6a: '\\text{v6 shown}',
  v6b: '\\text{10 January 2023}',
  noFt: '\\text{same model, no finetuning}',
  p9: '\\text{p.~9}',
  eight: '\\text{8 exemplars}',
  gsm: '\\text{GSM8K: math word problems}',
  std: '\\text{standard}',
  cot: '\\text{chain of thought}',
  c1: '\\text{p.~1}',
  c1a: '\\text{p.~1}\\;\\cdot\\;\\text{Abstract}',
  c1f: '\\text{p.~1}\\;\\cdot\\;\\text{Figure 1}',
};

// ── world layout (desk px) ───────────────────────────────────────────────────
const PG = { x: 960, y: 560, w: 900, rot: -0.008 };          // p. 1 at rest for the whole segment
const STRIP_CROP = { x0: 396, y0: 840, x1: 1304, y1: 932 };  // the key line's three lines, 3 px vertical pad
const PR = 0.3;                                              // reading pitch over Figure 1 while the strip hovers above it
const STRIP_TO = { x: 960, y: 528, z: 150, w: 700, tilt: PR, arc: 160 };   // hovers over the abstract, facing the camera
const UNDER_STEPS_X1 = 456;                                   // "steps" ends here on the glued "steps—significantly" (page px)
const GSM_ROW = { x0: 921, y0: 333, x1: 1392, y1: 564 };      // p. 5, Figure 4's GSM8K row: LaMDA · GPT · PaLM heads, tick labels (x 925–951) kept whole
const THUMBS = [                                              // the three promises, a row below the page
  { key: 'p1', rect: FIG1.cot.input, at: { x: 520, y: 1330, w: 400, rot: -0.04 } },
  { key: 'p5', rect: GSM_ROW, at: { x: 962, y: 1335, w: 430, rot: 0.02 } },
  { key: 'p6', rect: FIG5.all, at: { x: 1395, y: 1325, w: 300, rot: 0.05 } },
];
const PC = 0.55;                                              // camera pitch of the closing pair; the cards tilt to match
const OUT_W = 520;
/** pose of a crop standing on its bottom edge at desk y = yb, tilted to face the camera */
const stand = (crop, x, yb, w, tilt = PC) => ({ src: crop, x, y: yb - (w * (crop.y1 - crop.y0)) / (crop.x1 - crop.x0) / 2, z: 0, w, tilt, rot: 0 });
const OUT = {
  std: stand(FIG1.std.output, 690, 1560, OUT_W),
  cot: stand(FIG1.cot.output, 1235, 1560, OUT_W),
};

let p1, p5, p6, L;

const union = (rs) => ({ x0: Math.min(...rs.map((r) => r.x0)), y0: Math.min(...rs.map((r) => r.y0)), x1: Math.max(...rs.map((r) => r.x1)), y1: Math.max(...rs.map((r) => r.y1)) });

// ── local helpers (kit candidates: underline, outline, arrive) ──────────────
/** a sheet being put down: slides in from (dx, dy) with a small lift */
function arrive(base, p, { dx = 0, dy = 800, rot = 0.1, arc = 170 } = {}) {
  const q = ease.outCubic(clamp(p));
  return { ...base, x: base.x + dx * (1 - q), y: base.y + dy * (1 - q), z: (base.z || 0) + Math.sin(Math.PI * clamp(p)) * arc, rot: (base.rot || 0) + rot * (1 - q) };
}
/** ink underline that follows the voice: highlight() squeezed to a thin band under each line */
function underline(ctx, C, page, pose, lines, p, { color = F.ink, band = 3 } = {}) {
  highlight(ctx, C, page, pose, lines.map((l) => ({ ...l, y0: l.y1 - band })), p, { color, alpha: 1, pad: 2 });
}
/** outline around a standing card's crop edge, on its plane, drawn on with p */
function outline(ctx, C, page, pose, color, p = 1, width = 5) {
  if (p <= 0) return;
  const r = pose.src;
  const P = [[r.x0, r.y0], [r.x1, r.y0], [r.x1, r.y1], [r.x0, r.y1], [r.x0, r.y0]].map(([u, v]) => onSheet(C, page, pose, u, v));
  let Lt = 0; for (let i = 1; i < P.length; i++) Lt += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width * P[0].k; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.setLineDash([Lt * clamp(p), Lt + 1]);
  ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke();
  ctx.restore();
}

/** ink line along page-px points on a sheet, drawn on with p (a trace around the paper's own highlight) */
function inkTrace(ctx, C, page, pose, pts, p, { color = F.ink, width = 3 } = {}) {
  if (p <= 0) return;
  const P = pts.map(([u, v]) => onSheet(C, page, pose, u, v));
  let Lt = 0; for (let i = 1; i < P.length; i++) Lt += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width * P[0].k; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.setLineDash([Lt * clamp(p), Lt + 1]);
  ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke();
  ctx.restore();
}
/** stepped outline around a two-line highlight (line 1 starts indented, line 2 ends early), padded by m */
function twoLineShape([a, b], m = 5) {
  return [[a.x0 - m, a.y0 - m], [a.x1 + m, a.y0 - m], [a.x1 + m, a.y1], [b.x1 + m, a.y1], [b.x1 + m, b.y1 + m], [b.x0 - m, b.y1 + m], [b.x0 - m, b.y0], [a.x0 - m, b.y0], [a.x0 - m, a.y0 - m]];
}

/** rights-off p. 1: grey word bars plus Figure 1's frames, ✗ and ✓ redrawn from FIG1 (page px) */
function standIn1(page) {
  const frames = [FIG1.std.input, FIG1.std.output, FIG1.cot.input, FIG1.cot.output];
  return standIn(page, {
    draw(g) {
      g.strokeStyle = PAL.inputInk; g.lineWidth = 3;
      for (const r of frames) { g.beginPath(); g.roundRect(r.x0 + 4, r.y0 + 14, r.x1 - r.x0 - 8, r.y1 - r.y0 - 18, 24); g.stroke(); }
      g.globalCompositeOperation = 'multiply';
      g.fillStyle = PAL.cot; for (const r of FIG1.cot.chainLines) g.fillRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
      g.fillStyle = PAL.out; for (const r of FIG1.cot.outLines) g.fillRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
      g.globalCompositeOperation = 'source-over';
      const x = FIG1.std.x; g.strokeStyle = PAL.bad; g.lineWidth = 7; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x.x0 + 4, x.y0 + 4); g.lineTo(x.x1 - 4, x.y1 - 4); g.moveTo(x.x1 - 4, x.y0 + 4); g.lineTo(x.x0 + 4, x.y1 - 4); g.stroke();
      const k = FIG1.cot.tick; g.strokeStyle = PAL.outInk;
      g.beginPath(); g.moveTo(k.x0 + 4, k.y0 + 30); g.lineTo(k.x0 + 16, k.y1 - 4); g.lineTo(k.x1 - 4, k.y0 + 16); g.stroke();
    },
  });
}

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [1, 5, 6]);
    p1 = PAGES ? P.page(1) : standIn1(P.page(1));
    p5 = PAGES ? P.page(5) : standIn(P.page(5));
    p6 = PAGES ? P.page(6) : standIn(P.page(6));
    L = {
      names: PH.authors.map((n) => findPhrase(p1, n)),
      affil: findPhrase(p1, PH.affil),
      abstract: findPhrase(p1, 'Abstract'),
      key: findPhrase(p1, PH.key),
      chain: findPhrase(p1, 'chain of thought—a series of intermediate reasoning steps—significantly'),
      eight: findPhrase(p1, PH.eight),
      eightW: findPhrase(p1, 'eight')[0],
      gsmW: findPhrase(p1, 'GSM8K')[0],
    };
    // the strip's blue underline: "chain of thought—a series of intermediate reasoning steps", stopping before the dash
    L.chainUnder = [L.chain[0], { ...L.chain[1], x1: UNDER_STEPS_X1, n: 5 }];
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      jan: q.w(0, 'January'), twenty: q.w(0, 'twenty'), e0: q.e(0),
      s1: q.s(1), google: q.w(1, 'Google'), e1: q.e(1),
      s2: q.s(2), abstract: q.w(2, 'abstract'),
      s3: q.s(3), e3: q.e(3),
      s4: q.s(4), worked: q.w(4, 'worked'), reasoning: q.w(4, 'reasoning'), e4: q.e(4),
      s5: q.s(5), eight: q.w(5, 'eight'), gsm: q.w(5, 'GSM8K'), e5: q.e(5),
      s6: q.s(6), what: q.w(6, 'what'), why: q.w(6, 'why'), which: q.w(6, 'which'), e6: q.e(6),
    };
    T.lift = T.e3 + 0.3;
    T.back = T.s5 - 0.45;                // the strip slides away as the camera goes back up to the abstract
    T.outs = T.e6 - 0.45;                // the two Model Output frames lift off

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    const wp = (u, v) => sheetPt(p1, PG, u, v);
    const au = wp(853, 560), ab = wp(850, 975), ky = wp(860, 905), ei = wp(850, 1150);
    const C = cameraAt(t, [
      { t: 0, tx: 960, ty: 572, zoom: 0.86, pitch: 0.14 },
      { t: 1.0, dur: 4.8, tx: 972, zoom: 0.9 },
      { t: T.s1 - 0.4, dur: 1.2, tx: au[0], ty: au[1], zoom: 1.85, pitch: 0.16 },
      { t: T.s1 + 0.9, dur: 2.4, tx: au[0] + 12, zoom: 1.93 },
      { t: T.s2 - 0.3, dur: 1.2, tx: ab[0], ty: ab[1], zoom: 1.7 },
      { t: T.s3 - 0.25, dur: 1.2, tx: ky[0] - 20, ty: ky[1], zoom: 2.02 },
      { t: T.s3 + 1.0, dur: 8.6, tx: ky[0] + 18, zoom: 2.14 },
      { t: T.lift - 0.1, dur: 1.6, tx: 965, ty: 704, zoom: 1.6, pitch: PR },
      { t: T.lift + 1.6, dur: 3.4, tx: 985, zoom: 1.66 },
      { t: T.s5 - 0.35, dur: 1.2, tx: ei[0] + 40, ty: ei[1], zoom: 1.9, pitch: 0.16 },
      { t: T.s5 + 1.0, dur: 9.0, tx: ei[0] + 10, zoom: 1.98 },
      { t: T.s6 - 0.3, dur: 1.5, tx: 960, ty: 1250, zoom: 1.2, pitch: PR },
      { t: T.s6 + 1.4, dur: 6.6, zoom: 1.27 },
      { t: T.outs, dur: 1.6, tx: 960, ty: 1450, zoom: 1.45, pitch: PC },
      { t: T.outs + 1.4, dur: 2.2, yaw: -0.14 },
    ]);

    // ── p. 1 arrives and stays ──
    const pin = e(t, 0, 1.3, ease.linear);
    const PGt = arrive(PG, pin, { dy: 950, rot: 0.08, arc: 170 });
    sheet(ctx, C, p1, PGt);

    // s0: the side stamp is v6, the version on screen
    const sa = win(t, T.twenty, T.s1 + 0.3, 0.2, 0.5);
    if (sa > 0) { ctx.save(); ctx.globalAlpha *= sa; markBox(ctx, C, p1, PGt, P1.stampDate, e(t, T.twenty, 0.8), { color: F.ink2, width: 2.2, pad: 6 }); ctx.restore(); }
    // s1: nine names lit across "Nine authors", then the team
    const stag = (T.s1 + 0.83 - 0.3 - T.s1) / 8;
    L.names.forEach((n, i) => highlight(ctx, C, p1, PGt, n, e(t, T.s1 + i * stag, 0.3, ease.linear), { color: F.hlMint }));
    highlight(ctx, C, p1, PGt, L.affil, sayWords(env, 1, 3, 6, t), { color: F.hlMint });
    // s2: ink underline under the heading
    underline(ctx, C, p1, PGt, L.abstract, e(t, T.abstract, 0.5, ease.linear), { color: F.ink, band: 2.5 });
    // s3: the key line, verbatim, with the voice (the only yellow line of the segment)
    highlight(ctx, C, p1, PGt, L.key, sayP(env, 3, t), { color: F.hlYellow });
    // s4: Figure 1, ink box on the worked example, then a blue trace around the paper's own blue chain (no marker over it)
    const ax = win(t, T.worked, T.reasoning + 0.2, 0.01, 0.35);
    if (ax > 0) { ctx.save(); ctx.globalAlpha *= ax; markBox(ctx, C, p1, PGt, FIG1.cot.exemplar, e(t, T.worked, 1.0, ease.inOutCubic), { color: F.ink, width: 2.6, pad: 7 }); ctx.restore(); }
    const ac = win(t, T.reasoning, T.s5 - 0.1, 0.01, 0.45);
    if (ac > 0) { ctx.save(); ctx.globalAlpha *= ac; inkTrace(ctx, C, p1, PGt, twoLineShape(FIG1.cot.chainLines, 5), e(t, T.reasoning, 1.1, ease.inOutCubic), { color: PAL.cotInk, width: 3.2 }); ctx.restore(); }
    // s5: the PaLM 540B / GSM8K line, paraphrased → mint
    highlight(ctx, C, p1, PGt, L.eight, sayWords(env, 5, 0, 24, t), { color: F.hlMint });

    // ── s4: the key line lifts off as a strip and stands at the back of the page ──
    const lp = e(t, T.lift, 1.4, ease.linear);
    const gone = e(t, T.back, 1.1, ease.inCubic);
    if (lp > 0 && gone < 1) {
      const to = { ...STRIP_TO, y: STRIP_TO.y - 1100 * gone, z: STRIP_TO.z + 300 * gone };
      const SP = liftPose(p1, PGt, STRIP_CROP, to, lp);
      sheet(ctx, C, p1, SP, { grid: 8, shadow: 0.5 });
      highlight(ctx, C, p1, SP, L.key, 1);
      underline(ctx, C, p1, SP, L.chainUnder, e(t, T.lift + 1.2, 0.8, ease.linear), { color: PAL.cotInk, band: 4 });
    }

    // ── tags on the desk ──
    // s0: the dates, beside the page
    const a0 = win(t, T.jan - 0.1, T.s1 + 0.2, 0.3, 0.45);
    if (a0 > 0) {
      const r = C.p(...wp(1745, 470).slice(0, 2), 0);
      tag(ctx, S.arxiv, r.x, r.y, { size: 38, color: F.ink2, write: e(t, T.jan - 0.1, 0.8, ease.linear), alpha: a0 });
      tag(ctx, S.v1, r.x, r.y + 74, { size: 46, color: F.ink, write: e(t, T.jan + 0.25, 0.9, ease.linear), alpha: a0 });
    }
    const a6 = win(t, T.twenty + 0.35, T.s1 + 0.2, 0.3, 0.45);
    if (a6 > 0) {
      const s = onSheet(C, p1, PGt, -60, 700);
      tag(ctx, S.v6a, s.x, s.y, { size: 42, color: F.ink2, align: 'right', valign: 'middle', write: e(t, T.twenty + 0.35, 0.6, ease.linear), alpha: a6 });
      tag(ctx, S.v6b, s.x, s.y + 70, { size: 42, color: F.ink2, align: 'right', valign: 'middle', write: e(t, T.twenty + 0.6, 0.8, ease.linear), alpha: a6 });
    }
    // s4: no finetuning (p. 9), on the blank part of the page under Figure 1's caption
    const aN = win(t, T.s4, T.s5 - 0.1, 0.3, 0.45);
    if (aN > 0) {
      const s = onSheet(C, p1, PGt, 330, 1912);
      const b = tag(ctx, S.noFt, s.x, s.y, { size: 44, color: F.ink, valign: 'middle', write: e(t, T.s4, 0.8, ease.linear), alpha: aN });
      tag(ctx, S.p9, b.x + b.w + 14, s.y, { size: 30, color: F.ink2, valign: 'middle', write: e(t, T.s4 + 0.4, 0.5, ease.linear), alpha: aN });
    }
    // s5: eight exemplars (right margin, beside the line), GSM8K (under the line)
    const aE = win(t, T.eight, T.s6 - 0.1, 0.25, 0.45);
    if (aE > 0) {
      const s = onSheet(C, p1, PGt, 1335, (L.eightW.y0 + L.eightW.y1) / 2);
      tag(ctx, S.eight, s.x, s.y, { size: 44, color: F.ink, valign: 'middle', write: e(t, T.eight, 0.6, ease.linear), alpha: aE });
    }
    const aG = win(t, T.gsm, T.s6 - 0.1, 0.25, 0.45);
    if (aG > 0) {
      const s = onSheet(C, p1, PGt, (L.gsmW.x0 + L.gsmW.x1) / 2, L.gsmW.y1 + 52);
      tag(ctx, S.gsm, s.x, s.y, { size: 44, color: F.ink, align: 'center', valign: 'middle', write: e(t, T.gsm, 0.8, ease.linear), alpha: aG });
    }

    // ── s6: three thumbnails land in a row below the page, each on its words ──
    const src = { p1, p5, p6 };
    const tIn = { p1: T.what - 0.15, p5: T.why - 0.1, p6: T.which - 0.05 };
    THUMBS.forEach(({ key, rect, at }) => {
      const p = e(t, tIn[key], 1.0, ease.linear);
      if (p <= 0) return;
      sheet(ctx, C, src[key], arrive({ ...at, src: rect }, p, { dy: 700, rot: 0.14, arc: 190 }), { grid: 4 });
    });

    // ── pause: Figure 1's two Model Output frames slide forward, side by side (the colour lesson) ──
    const o1 = e(t, T.outs, 1.35, ease.linear), o2 = e(t, T.outs + 0.18, 1.35, ease.linear);
    const land = T.outs + 1.3;
    if (o1 > 0) {
      const A = liftPose(p1, PGt, FIG1.std.output, { ...OUT.std, arc: 200 }, o1);
      const B = liftPose(p1, PGt, FIG1.cot.output, { ...OUT.cot, arc: 230 }, o2);
      sheet(ctx, C, p1, A, { grid: 6, shadow: 0.5 });
      if (o2 > 0) sheet(ctx, C, p1, B, { grid: 6, shadow: 0.5 });
      outline(ctx, C, p1, A, PAL.bad, e(t, land - 0.1, 0.6, ease.inOutCubic), 4);
      outline(ctx, C, p1, B, PAL.out, e(t, land + 0.05, 0.6, ease.inOutCubic), 4);
      const ta = e(t, land, 0.6, ease.linear), tb = e(t, land + 0.15, 0.7, ease.linear);
      const ua = onSheet(C, p1, A, (FIG1.std.output.x0 + FIG1.std.output.x1) / 2, FIG1.std.output.y1);
      const ub = onSheet(C, p1, B, (FIG1.cot.output.x0 + FIG1.cot.output.x1) / 2, FIG1.cot.output.y1);
      tag(ctx, S.std, ua.x, ua.y + 44, { size: 44, color: PAL.stdInk, align: 'center', valign: 'middle', write: ta });
      tag(ctx, S.cot, ub.x, ub.y + 44, { size: 44, color: PAL.cotInk, align: 'center', valign: 'middle', write: tb });
    }

    // ── source stamp: p. 1 throughout, the box follows what's in focus ──
    let rect = P1.title, label = S.c1;
    if (t >= T.twenty - 0.1 && t < T.s1 - 0.3) rect = P1.stampDate;
    else if (t >= T.s1 - 0.3 && t < T.s2 - 0.3) rect = union([P1.authors, P1.affil]);
    else if (t >= T.s2 - 0.3 && t < T.lift + 0.7) { rect = P1.abstract; label = S.c1a; }
    else if (t >= T.lift + 0.7 && t < T.s5 - 0.3) { rect = FIG1.all; label = S.c1f; }
    else if (t >= T.s5 - 0.3 && t < T.s6 - 0.3) { rect = P1.abstract; label = S.c1a; }
    else if (t >= T.s6 - 0.3 && t < T.outs) rect = FIG1.cot.input;
    else if (t >= T.outs) { rect = FIG1.all; label = S.c1f; }
    cite(ctx, p1, { label, rect, alpha: e(t, 0.8, 0.6), side: 'right' });
  },
};
