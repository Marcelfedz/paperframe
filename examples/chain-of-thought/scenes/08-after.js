// after — the limits (Section 6, p. 9), the lower bound, what the paper already cites, Kojima et al., end card.
// p. 9: the limits in mint with the voice, an ink "?" in the margin on "leave open", "no guarantee". p. 5 slides
// in beside it: fifty small chain cards (LaMDA 137B, GSM8K, wrong answers read by hand) split into 23 almost right
// (46 %) and 27 with major errors (54 %, Appendix D.2 p. 28). Back on p. 9: "costly to serve" with a model slab
// growing at the edge of the desk. The lower-bound line is the only yellow of the segment. Then a strip of p. 4
// (the follow-up the paper cites) over an illustrative fan: one question, five sampled chains, three answers
// agree. A strip of p. 13 names it: self-consistency. Kojima et al. (no page, arXiv default licence) as a typed
// card beside a small prompt whose exemplar triples slide away. End card on p. 1 with the CC BY credit.
// Guardrails (briefing): no numbers from either follow-up, no names on their cards, no "same team"; the fan is
// shapes only; the error analysis is LaMDA 137B on GSM8K.
import { W, H, clamp, lerp, e, ease, rng } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, texSize, desk, edgeIn, loadPaper, findPhrase, cameraAt, sheet, highlight, onSheet,
  liftPose, arcPose, slab, prism, arrow3, contactShadow, cite, tag, sayP, sayWords, blankPage, endCard, endCardPose,
  standIn, mix,
} from '/engine/folio.js';
import { PAL, PH, P9, P13, STACK } from './_data.js';

// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars, same geometry) and redrawn figures.
const PAGES = true;

const S = {
  c9: '\\text{p.~9}\\;\\cdot\\;\\text{Section 6}',
  c5: '\\text{p.~5}\\;\\cdot\\;\\text{Section 3.2}',
  c4: '\\text{p.~4}\\;\\cdot\\;\\text{Section 3.1}',
  c13: '\\text{p.~13}\\;\\cdot\\;\\text{References}',
  scId: '\\texttt{arXiv:2203.11171}',
  kojId: '\\texttt{arXiv:2205.11916}',
  q: '?',
  almost: '\\text{almost right: 46\\%}',
  major: '\\text{major errors: 54\\%}',
  large: '\\text{large models only}',
  illus: '\\text{illustrative}',
  koj: '\\text{Kojima et al.}\\;\\cdot\\;\\text{May 2022}',
  kojQ: "\\text{``Let's think step by step''}",
  zero: '\\text{zero-shot}',
  // end card (CC BY 4.0: credit, source link, licence link, changes made)
  t1: '\\text{Chain-of-Thought Prompting Elicits Reasoning}',
  t2: '\\text{in Large Language Models}',
  au1: '\\text{Wei, Wang, Schuurmans, Bosma, Ichter,}',
  au2: '\\text{Xia, Chi, Le, Zhou}',
  venue: '\\text{NeurIPS 2022}\\;\\cdot\\;\\texttt{arXiv:2201.11903v6}',
  url: '\\texttt{arxiv.org/abs/2201.11903}',
  cc1: '\\text{CC BY 4.0 (creativecommons.org/licenses/by/4.0)}',
  cc2: '\\text{pages shown with highlights, crops and 3D adaptations}',
};

// ── world layout ─────────────────────────────────────────────────────────────
const RP9 = { x: 960, y: 560, w: 860, rot: -0.008 };
const RP5 = { x: 2400, y: 560, w: 860, rot: 0.01 };
const OFF4 = { x: 150, y: 1650, w: 860, rot: -0.2 };        // p. 4 and p. 13 never lie on the desk: their strips fly in
const OFF13 = { x: 1750, y: 1650, w: 860, rot: 0.2 };
const QMARK = { u: 1478, v: 703 };                          // p. 9 right margin, beside "actually reasoning … open question"
const P5LINES = { x0: 299, y0: 1205, x1: 830, y1: 1330 };   // stamp: the two p. 5 sentences
const LBRECT = { x0: 299, y0: 492, x1: 1405, y1: 556 };     // stamp: the lower-bound lines
const STRIP4 = { x0: 296, y0: 1501, x1: 1406, y1: 1593 };   // p. 4, "(though follow-up work shows … sampled generations"

// fifty chain cards (Appendix D.2: 23 almost right, 27 major errors). Which ones: seeded, ILLUSTRATIVE.
const N50 = 50, N_OK = 23;
const CARD = { w: 30, gap: 7 };
const GRID = { x0: 1500, y0: 560, cols: 10 };            // on the desk between p. 9 and p. 5
const OK = (() => {
  const r = rng(37), ids = [...Array(N50).keys()];
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  return new Set(ids.slice(0, N_OK));
})();
const SORTED = (() => { const ok = [], bad = []; for (let i = 0; i < N50; i++) (OK.has(i) ? ok : bad).push(i); return { ok, bad }; })();

// the model slab of s5 (neutral, grows on "large scale")
const MODEL5 = { x: 1530, y: 470, w: 230, d: 200, h: 190 };

// self-consistency fan (ILLUSTRATIVE): one question, five sampled chains, five answer chips
const QCARD = { x: 430, y: 610, w: 190 };
const CHAINS = [430, 520, 610, 700, 790].map((y) => ({ x: 805, y, w: 300 }));
const CHIPS = ['circle', 'tri', 'circle', 'square', 'circle'];
const CHIP_X = 1010, VOTE = { x: 1250, y: 610, dx: 58 };   // the three matching chips line up at the vote

// Kojima beat: the card standing at the left, a small prompt in front of a model block at the right
const KCARD = { x: 520, w: 560, by: 700, tilt: 0.85 };
const TS = 0.6;                                             // triple footprint at 0.6 of the idea segment's; heights as there
const TRI = { w: STACK.triple.w * TS, d: STACK.triple.d * TS, h: STACK.triple.h, gap: 3 };
const KX = 1130, KY = [420, 500, 580], KQ = 672;            // exemplar triples going back; the question in front
const KMODEL = { x0: 1320, x1: 1540, y0: 430, y1: 650, h: 120 };

let p1, p4, p5, p9, p13, L;

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [1, 4, 5, 9, 13]);
    const pg = (n) => (PAGES ? P.page(n) : standIn(P.page(n)));
    p1 = pg(1); p4 = pg(4); p5 = pg(5); p9 = pg(9); p13 = pg(13);
    L = {
      nr1: findPhrase(p9, PH.notReasoning1),
      nr2: findPhrase(p9, PH.notReasoning2),
      noG: findPhrase(p9, PH.noGuarantee),
      costly: findPhrase(p9, PH.costlyServe),
      lower: findPhrase(p9, PH.lowerBound),
      w50: PH.wrong50.map((s) => findPhrase(p5, s)[0]),
      e46: PH.errors46.map((s) => findPhrase(p5, s)[0]),
      follow: findPhrase(p4, PH.followUp),
      scTitle: findPhrase(p13, PH.scTitle),
      title: findPhrase(p1, PH.title),
      wei: findPhrase(p1, 'Jason Wei'),
      neurips: findPhrase(p1, '(NeurIPS 2022).'),
    };
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      s1: q.s(1), s2: q.s(2), leave: q.w(2, 'leave'), s3: q.s(3),
      s4: q.s(4), answers: q.w(4, 'answers'), forty: q.w(4, 'forty-six'), chains: q.w(4, 'chains'), almost: q.w(4, 'almost'), right4: q.w(4, 'right'),
      s5: q.s(5), large: q.w(5, 'large'), costly: q.w(5, 'costly'),
      s6: q.s(6), s7: q.s(7), sample: q.w(7, 'sample'), majority: q.w(7, 'majority'), answer7: q.w(7, 'answer'),
      s8: q.s(8), selfc: q.w(8, 'self-consistency'),
      s9: q.s(9), may: q.w(9, 'May'), colleagues: q.w(9, 'colleagues'), dropped: q.w(9, 'dropped'), added: q.w(9, 'added'),
      lets: q.w(9, "let's"), stepEnd: q.we(9, 'step', 2),
      s10: q.s(10), s11: q.s(11), wei: q.w(11, 'Wei'), neurips: q.w(11, 'NeurIPS'),
    };

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    const C = cameraAt(t, [
      { t: 0, tx: 960, ty: 345, zoom: 1.75, pitch: 0.14 },                       // p. 9, the limits paragraph
      { t: 0.6, dur: 2.5, ty: 350, zoom: 1.8 },
      { t: T.s2 + 0.2, dur: 3.2, tx: 1000, ty: 355, zoom: 1.84 },                 // room in the margin for the "?"
      { t: T.s3 - 0.2, dur: 1.1, tx: 965, ty: 405, zoom: 1.8 },                    // no guarantee
      { t: T.s4 - 0.35, dur: 1.2, tx: 1930, ty: 660, zoom: 1.6 },                  // the fifty cards and p. 5
      { t: T.s4 + 1.0, dur: 4.4, tx: 1945, zoom: 1.65 },
      { t: T.s5 - 0.35, dur: 1.25, tx: 1110, ty: 440, zoom: 1.5, pitch: 0.5 },     // p. 9 again + the model slab
      { t: T.s6 - 0.35, dur: 1.3, tx: 962, ty: 272, zoom: 2.1, pitch: 0.15 },      // the lower bound
      { t: T.s6 + 1.0, dur: 5.6, tx: 968, zoom: 2.2 },
      { t: T.s7 - 0.3, dur: 1.4, tx: 900, ty: 505, zoom: 1.15, pitch: 0.38 },      // the follow-up: strip + fan
      { t: T.s7 + 1.2, dur: 5.5, tx: 915, zoom: 1.19 },
      { t: T.s9 - 0.25, dur: 1.4, tx: 1000, ty: 490, zoom: 1.15, pitch: 0.85 },    // Kojima card + the prompt
      { t: T.s9 + 1.3, dur: 5.6, yaw: 0.06 },
      { t: T.s10 - 0.2, dur: 1.0, tx: 960, ty: 540, zoom: 1, pitch: 0.15, yaw: 0 },    // end card
      { t: T.s10 + 0.9, dur: 8.5, tx: 966, zoom: 1.02 },                             // a slow drift while the card holds
    ]);

    page9(ctx, C, t, T, env);
    page5(ctx, C, t, T, env);
    model5(ctx, C, t, T);
    fan(ctx, C, t, T, env);
    kojima(ctx, C, t, T);
    ending(ctx, C, t, T, env);

    // ── source stamp, one at a time; Kojima has no page: its arXiv id stands in the stamp's place ──
    const stamps = [
      [0, p9, S.c9, P9.limits],
      [T.s4 - 0.15, p5, S.c5, P5LINES],
      [T.s5 - 0.25, p9, S.c9, P9.limits],
      [T.s6 - 0.25, p9, S.c9, LBRECT],
      [T.s7 + 0.35, p4, S.c4, STRIP4],
      [T.s8 - 0.1, p13, S.c13, P13.scRef],
      [T.s9 - 0.2, null, S.kojId],
      [T.s10 - 0.1, null, null],
    ];
    let k = 0;
    while (k + 1 < stamps.length && t >= stamps[k + 1][0]) k++;
    const [, sp, sl, sr] = stamps[k];
    const dip = Math.min(1, ...stamps.slice(1).map(([ts]) => clamp(Math.abs(t - ts) / 0.2)));
    const a = e(t, 0.5, 0.5) * dip;
    if (sp) cite(ctx, sp, { label: sl, rect: sr, alpha: a, side: 'right' });
    else if (sl) tag(ctx, sl, W - 56, H - 56, { size: 32, color: F.ink2, align: 'right', valign: 'bottom', alpha: a });
  },
};

// ── p. 9: the limits, then back for "costly to serve" and the lower bound ──
function page9(ctx, C, t, T, env) {
  const pin = e(t, 0, 1.1, ease.outCubic), out = e(t, T.s7 - 0.4, 1.25, ease.inCubic);
  if (out >= 1) return;
  const P = {
    x: lerp(-700, RP9.x, pin) - 1700 * out, y: RP9.y + 160 * (1 - pin) + 300 * out,
    z: Math.sin(Math.PI * pin) * 140 + 200 * Math.sin(Math.PI * 0.5 * out), w: RP9.w, rot: lerp(-0.13, RP9.rot, pin) - 0.12 * out,
  };
  sheet(ctx, C, p9, P);
  highlight(ctx, C, p9, P, L.nr1, sayP(env, 1, t), { color: F.hlMint });
  highlight(ctx, C, p9, P, L.nr2, sayP(env, 2, t), { color: F.hlMint });
  highlight(ctx, C, p9, P, L.noG, sayP(env, 3, t), { color: F.hlMint });
  highlight(ctx, C, p9, P, L.costly, sayP(env, 5, t), { color: F.hlMint });
  highlight(ctx, C, p9, P, L.lower, sayWords(env, 6, 3, 16, t), { color: F.hlYellow });
  // "leave open": an ink question mark written in the margin beside the two lines
  const w = e(t, T.leave - 0.05, 0.8, ease.linear);
  if (w > 0) {
    const o = onSheet(C, p9, P, QMARK.u, QMARK.v);
    drawTex(ctx, S.q, o.x, o.y, { size: 74 * (P.w / p9.w) * o.k, color: F.ink, align: 'center', valign: 'middle', write: w });
  }
}

// ── s4: p. 5 beside p. 9, the two sentences, and the fifty cards ──
function page5(ctx, C, t, T, env) {
  const pin = e(t, T.s4 - 0.5, 1.1, ease.outCubic), out = e(t, T.s5 - 0.4, 1.0, ease.inCubic);
  if (pin <= 0 || out >= 1) return;
  const dx = 900 * (1 - pin) + 1300 * out;
  const P = {
    x: RP5.x + dx, y: RP5.y + 120 * (1 - pin) - 200 * out, z: Math.sin(Math.PI * pin) * 140 + 160 * Math.sin(Math.PI * 0.5 * out),
    w: RP5.w, rot: RP5.rot + 0.13 * (1 - pin) + 0.08 * out,
  };
  sheet(ctx, C, p5, P);
  // line by line (p. 5's column is interleaved with Figure 4's caption in words.json)
  lineByLine(ctx, C, p5, P, L.w50, sayWords(env, 4, 1, 7, t));
  lineByLine(ctx, C, p5, P, L.e46, sayWords(env, 4, 8, 15, t));

  // fifty chain cards on the page's right column: drop in on "answers", 23 turn blue on "forty-six",
  // and on "chains" the two groups pull apart
  const card = blankPage('cot08-card', 200, 260, (g) => {
    g.strokeStyle = F.rule; g.lineCap = 'round';
    g.lineWidth = 18; g.beginPath(); g.moveTo(34, 50); g.lineTo(130, 50); g.stroke();
    g.lineWidth = 14;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(34, 104 + i * 40); g.lineTo(i === 3 ? 110 : 166, 104 + i * 40); g.stroke(); }
  }, { scale: 0.5 });
  const sp = e(t, T.chains - 0.1, 0.9, ease.inOutCubic);
  const step = CARD.w + CARD.gap, ch = CARD.w * 1.3;
  for (let i = 0; i < N50; i++) {
    const a = e(t, T.answers - 0.15 + (i % 10) * 0.04 + Math.floor(i / 10) * 0.07, 0.45, ease.outCubic);
    if (a <= 0) continue;
    const g0 = { x: GRID.x0 + (i % GRID.cols) * step, y: GRID.y0 + Math.floor(i / GRID.cols) * (ch + CARD.gap) };
    const ok = OK.has(i), k = ok ? SORTED.ok.indexOf(i) : SORTED.bad.indexOf(i);
    const cols = ok ? 5 : 6, bx = ok ? GRID.x0 - 10 : GRID.x0 + 5 * step + 34;
    const g1 = { x: bx + (k % cols) * step, y: GRID.y0 + Math.floor(k / cols) * (ch + CARD.gap) };
    const pose = {
      x: lerp(g0.x, g1.x, sp) + 1300 * out, y: lerp(g0.y, g1.y, sp) - 60 * (1 - a) - 200 * out,
      z: 3 + 90 * (1 - a) + Math.sin(Math.PI * sp) * 30, w: CARD.w, rot: 0.3 * (1 - a) + (ok ? -0.02 : 0.02) * sp,
    };
    sheet(ctx, C, card, pose, { shadow: 0.5, grid: 2 });
    const blue = ok ? e(t, T.forty + (k % 8) * 0.05, 0.35) : 0;
    const Q = [[0, 0], [card.w, 0], [card.w, card.h], [0, card.h]].map(([u, v]) => onSheet(C, card, pose, u, v));
    ctx.save();
    ctx.strokeStyle = blue > 0 ? mix(F.ink3, PAL.cotInk, blue) : F.ink3; ctx.lineWidth = 1.4 + 1.6 * blue; ctx.lineJoin = 'round';
    ctx.beginPath(); Q.forEach((p, j) => (j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.stroke();
    ctx.restore();
  }
  // the two tags under the groups
  const yT = GRID.y0 + 5 * (ch + CARD.gap) + 14 - 200 * out;
  const l = C.p(GRID.x0 - 10 + 2 * step + CARD.w / 2 + 1300 * out, yT, 0), r = C.p(GRID.x0 + 5 * step + 34 + 2.5 * step + CARD.w / 2 + 1300 * out, yT, 0);
  drawTex(ctx, S.almost, l.x, l.y, { size: 34, color: PAL.cotInk, align: 'center', valign: 'top', write: e(t, T.almost - 0.1, 0.8, ease.linear) });
  drawTex(ctx, S.major, r.x, r.y, { size: 34, color: F.ink2, align: 'center', valign: 'top', write: e(t, T.right4, 0.8, ease.linear) });
}

// a phrase split across lines that findPhrase can't join: one marker, line after line, by characters
function lineByLine(ctx, C, page, pose, lines, p) {
  if (p <= 0) return;
  const total = lines.reduce((s, l) => s + l.n, 0);
  let acc = 0;
  for (const l of lines) {
    highlight(ctx, C, page, pose, [l], clamp((p * total - acc) / l.n), { color: F.hlMint });
    acc += l.n;
  }
}

// ── s5: a neutral model slab grows large at the edge of the desk ──
function model5(ctx, C, t, T) {
  const g = e(t, T.large - 0.1, 0.8, ease.outBack), out = e(t, T.s6 - 0.4, 0.8, ease.inCubic);
  const gin = e(t, T.s5 + 0.2, 0.6, ease.outCubic);
  if (gin <= 0 || out >= 1) return;
  const s = lerp(0.32, 1, clamp(g, 0, 1.2)), dx = 900 * out + 300 * (1 - gin);
  const b = {
    x0: MODEL5.x - (MODEL5.w * s) / 2 + dx, x1: MODEL5.x + (MODEL5.w * s) / 2 + dx,
    y0: MODEL5.y - (MODEL5.d * s) / 2, y1: MODEL5.y + (MODEL5.d * s) / 2, z0: 0, z1: Math.max(4, MODEL5.h * s * gin),
  };
  contactShadow(ctx, C, { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 }, { alpha: gin });
  slab(ctx, C, b, { fill: PAL.model, stroke: F.ink, width: 2.4, alpha: gin });
  const top = C.p(MODEL5.x + dx, b.y0, b.z1);
  tag(ctx, S.large, top.x, top.y - 22, { size: 36, align: 'center', valign: 'bottom', write: e(t, T.large, 0.8, ease.linear) });
}

// ── s7–s8: the p. 4 strip over an illustrative fan of five chains; then the p. 13 strip names it ──
function fan(ctx, C, t, T, env) {
  const go = e(t, T.s9 - 0.3, 0.9, ease.inCubic);
  if (t < T.s7 - 0.45 || go >= 1) return;
  const gx = -1500 * go, gz = 160 * Math.sin(Math.PI * 0.5 * go);

  // p. 4 strip (out on "That is"), then p. 13 strip
  const l4 = e(t, T.s7 - 0.4, 1.3, ease.linear), o4 = e(t, T.s8 - 0.25, 0.7, ease.inCubic);
  if (l4 > 0 && o4 < 1) {
    const pose = liftPose(p4, OFF4, STRIP4, { x: 900, y: 250, z: 24, w: 1060, arc: 220 }, l4);
    pose.y -= 900 * o4; pose.z += 200 * o4;
    sheet(ctx, C, p4, pose, { grid: 4, shadow: 0.6 });
    highlight(ctx, C, p4, pose, L.follow, sayWords(env, 7, 6, 13, t), { color: F.hlMint });
  }
  const l13 = e(t, T.s8 - 0.15, 1.0, ease.linear);
  if (l13 > 0) {
    const pose = liftPose(p13, OFF13, P13.scRef, { x: 900 + gx, y: 250, z: 24 + gz, w: 1060, arc: 220 }, l13);
    sheet(ctx, C, p13, pose, { grid: 4, shadow: 0.6 });
    highlight(ctx, C, p13, pose, L.scTitle, sayWords(env, 8, 2, 2, t), { color: F.hlMint });
    const a = onSheet(C, p13, pose, P13.scRef.x1, P13.scRef.y1);
    tag(ctx, S.scId, a.x, a.y + 26, { size: 34, color: F.ink2, align: 'right', valign: 'top', write: e(t, T.selfc + 0.4, 0.7, ease.linear) });
  }

  // the question card arrives with the strip, the chains fan out of it on "sample many chains"
  const qin = e(t, T.s7 + 0.3, 1.0, ease.outCubic);
  if (qin <= 0) return;
  const qcard = blankPage('cot08-q', 300, 200, (g) => {
    g.strokeStyle = PAL.inputInk; g.lineWidth = 6; g.strokeRect(10, 10, 280, 180);
    g.strokeStyle = '#C9C5BD'; g.lineCap = 'round'; g.lineWidth = 16;
    [[40, 230], [40, 250], [40, 170]].forEach(([a, b], i) => { g.beginPath(); g.moveTo(a, 60 + i * 42); g.lineTo(b, 60 + i * 42); g.stroke(); });
  }, { scale: 0.6 });
  const qPose = { x: QCARD.x - 500 * (1 - qin) + gx, y: QCARD.y, z: 4 + Math.sin(Math.PI * qin) * 120 + gz, w: QCARD.w, rot: -0.15 * (1 - qin) };
  sheet(ctx, C, qcard, qPose, { shadow: 0.7 });

  const chain = blankPage('cot08-chain', 600, 120, (g) => {
    g.save(); g.globalAlpha = 0.45; g.fillStyle = PAL.cot; g.beginPath(); g.roundRect(18, 16, 560, 88, 10); g.fill(); g.restore();
    g.strokeStyle = '#A9A59D'; g.lineCap = 'round'; g.lineWidth = 14;
    [[40, 210], [236, 380], [406, 540]].forEach(([a, b]) => { g.beginPath(); g.moveTo(a, 44); g.lineTo(b, 44); g.stroke(); });
    [[40, 170], [196, 330]].forEach(([a, b]) => { g.beginPath(); g.moveTo(a, 78); g.lineTo(b, 78); g.stroke(); });
  }, { scale: 0.6 });
  const vote = e(t, T.majority - 0.05, 0.75, ease.inOutCubic), win = e(t, T.answer7 - 0.05, 0.5);
  CHAINS.forEach((c, i) => {
    const f = e(t, T.sample + i * 0.17, 0.75, ease.inOutCubic);
    if (f <= 0) return;
    // ink arrow from the question to the chain
    const a0 = [QCARD.x + QCARD.w / 2 + 8 + gx, QCARD.y, 2 + gz], a1 = [c.x - c.w / 2 - 10 + gx, c.y, 2 + gz];
    const mid = [lerp(a0[0], a1[0], 0.45), a1[1], 2 + gz];
    const pts = Array.from({ length: 13 }, (_, j) => { const u = j / 12, v = 1 - u; return [0, 1, 2].map((d) => v * v * a0[d] + 2 * v * u * mid[d] + u * u * a1[d]); });
    arrow3(ctx, C, pts, f, { width: 2.4, headLen: 13, color: F.ink2 });
    const pose = arcPose({ x: QCARD.x, y: QCARD.y, z: 6, w: 60 }, { x: c.x, y: c.y, z: 3, w: c.w }, f, 90);
    pose.x += gx; pose.z += gz;
    sheet(ctx, C, chain, pose, { shadow: 0.6 });
    // the answer chip at the end of the chain (shapes only)
    const cp = e(t, T.sample + i * 0.17 + 0.55, 0.4, ease.outBack);
    if (cp <= 0) return;
    const isC = CHIPS[i] === 'circle';
    const v = isC ? vote : 0;
    const k = CHIPS.slice(0, i).filter((s) => s === 'circle').length;   // its slot in the row at the vote
    const x = lerp(CHIP_X, VOTE.x + (k - 1) * VOTE.dx, v) + gx, y = lerp(c.y, VOTE.y, v), z = gz + Math.sin(Math.PI * v) * 40;
    const dim = isC ? 1 : 1 - 0.55 * vote;
    chip(ctx, C, CHIPS[i], x, y, z, 22 * clamp(cp, 0, 1.2), isC ? win : 0, dim);
  });
  const il = C.p(VOTE.x + gx, VOTE.y + 60, 0);
  drawTex(ctx, S.illus, il.x, il.y, { size: 30, color: F.ink2, align: 'center', valign: 'top', write: e(t, T.sample + 0.8, 0.6, ease.linear) });
}

// an answer chip: a small token standing on the desk (circle, triangle or square footprint)
function chip(ctx, C, shape, x, y, z, r, win, alpha) {
  if (r <= 0.5) return;
  let poly;
  if (shape === 'circle') poly = Array.from({ length: 20 }, (_, i) => [x + r * Math.cos((i / 20) * Math.PI * 2), y + r * Math.sin((i / 20) * Math.PI * 2)]);
  else if (shape === 'tri') poly = [0, 1, 2].map((i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3; return [x + r * 1.25 * Math.cos(a), y + r * 1.25 * Math.sin(a)]; });
  else poly = [[x - r, y - r], [x + r, y - r], [x + r, y + r], [x - r, y + r]];
  if (z > 2) contactShadow(ctx, C, { x, y, r }, { z, alpha });
  prism(ctx, C, poly, z, z + 9, {
    fill: win > 0 ? mix(F.paper, PAL.out, 0.45 * win) : F.paper,
    stroke: win > 0 ? mix(F.ink, PAL.outInk, win) : F.ink, width: 2 + 1.4 * win, alpha,
  });
}

// ── s9: Kojima et al. — a typed card (no page) and a small prompt whose exemplars slide away ──
function kojima(ctx, C, t, T) {
  const pin = e(t, T.s9 - 0.2, 1.1, ease.linear), go = e(t, T.s10 - 0.05, 0.8, ease.inCubic);
  if (pin <= 0 || go >= 1) return;
  const card = blankPage('cot08-koj', 1000, 560, (g) => {
    drawTex(g, S.koj, 500, 150, { size: 64, color: F.ink, align: 'center', write: e(t, T.may - 0.05, 1.6, ease.linear) });
    g.strokeStyle = F.rule; g.lineWidth = 3; g.beginPath(); g.moveTo(140, 222); g.lineTo(860, 222); g.stroke();
    drawTex(g, S.kojQ, 500, 352, { size: 70, color: F.ink, align: 'center', write: e(t, T.lets - 0.05, T.stepEnd - T.lets + 0.15, ease.linear) });
    drawTex(g, S.zero, 500, 450, { size: 50, color: F.ink2, align: 'center', write: e(t, T.stepEnd - 0.5, 0.6, ease.linear) });
  }, { scale: 0.75 });
  const h = KCARD.w * card.h / card.w, q = ease.inOutCubic(pin);
  const pose = {
    x: lerp(-400, KCARD.x, q) + 300 * go, y: lerp(300, KCARD.by - h / 2, q) - 1100 * go, z: Math.sin(Math.PI * pin) * 220 + 260 * Math.sin(Math.PI * 0.5 * go),
    w: KCARD.w, rot: lerp(-0.3, 0.02, q), tilt: lerp(0, KCARD.tilt, q),
  };
  sheet(ctx, C, card, pose, { grid: 8 });

  // the prompt: four exemplar triples going back, the question in front, and the model block behind
  const rin = e(t, T.s9 + 0.6, 0.9, ease.outCubic), dx = 1100 * go;
  if (rin <= 0) return;
  const items = [];
  const mb = { x0: KMODEL.x0 + dx, x1: KMODEL.x1 + dx, y0: KMODEL.y0, y1: KMODEL.y1, z0: 0, z1: KMODEL.h * rin };
  items.push({ d: C.p((mb.x0 + mb.x1) / 2, (mb.y0 + mb.y1) / 2, mb.z1).depth, draw: () => slab(ctx, C, mb, { fill: PAL.model, stroke: F.ink, width: 2.4, alpha: clamp(rin * 3) }) });
  KY.forEach((y, i) => {
    const off = e(t, T.dropped + i * 0.16, 0.8, ease.inCubic);   // slides off the back of the desk
    if (off >= 1) return;
    const y1 = y - 900 * off, a = clamp(rin * 3) * (1 - off);
    let z = 0;
    const parts = [['input', PAL.input, PAL.inputInk], ['chain', PAL.cot, PAL.cotInk], ['output', PAL.out, PAL.outInk]];
    const slabs = parts.map(([k, fill, ink]) => {
      const hh = TRI.h[k] * rin, b = { x0: KX - TRI.w / 2 + dx, x1: KX + TRI.w / 2 + dx, y0: y1 - TRI.d / 2, y1: y1 + TRI.d / 2, z0: z, z1: z + hh };
      z += hh + TRI.gap * rin;
      return { b, fill, ink };
    });
    items.push({ d: C.p(KX + dx, y1, 10).depth, draw: () => slabs.forEach((s) => slab(ctx, C, s.b, { fill: s.fill, stroke: s.ink, width: 1.8, alpha: a })) });
  });
  // the question (input only), then the one added line dropping onto it
  const qb = { x0: KX - TRI.w / 2 + dx, x1: KX + TRI.w / 2 + dx, y0: KQ - TRI.d / 2, y1: KQ + TRI.d / 2, z0: 0, z1: TRI.h.input * rin };
  const ad = e(t, T.added - 0.05, 0.55, ease.outCubic);
  items.push({
    d: C.p(KX + dx, KQ, 10).depth, draw: () => {
      slab(ctx, C, qb, { fill: PAL.input, stroke: PAL.inputInk, width: 1.8, alpha: clamp(rin * 3) });
      if (ad > 0) {
        const z0 = qb.z1 + 2 + 120 * (1 - ad);
        slab(ctx, C, { ...qb, z0, z1: z0 + 6 }, { fill: F.paper, stroke: F.ink, width: 2, alpha: clamp(ad * 3) });
      }
    },
  });
  items.sort((a, b) => b.d - a.d).forEach((it) => it.draw());
}

// ── s10–s11: end card (kit's endCard: page 1 slides back, the citation and the CC BY credit beside it) ──
function ending(ctx, C, t, T, env) {
  const pc = (t - (T.s10 - 0.35)) / 5.2;
  if (pc <= 0) return;
  const X0 = 930, maxW = W - 60 - X0;
  const tsz = Math.min(54, maxW / texSize(S.t1, 1).w);
  const ccz = Math.max(30, Math.min(32, maxW / texSize(S.cc2, 1).w));
  endCard(ctx, C, p1, pc, {
    x: X0, y: 250, gap: 16,
    lines: [
      { tex: S.t1, size: tsz, color: F.ink }, { tex: S.t2, size: tsz, color: F.ink },
      { tex: S.au1, size: 34 }, { tex: S.au2, size: 34 },
      { tex: S.venue, size: 34 },
      { tex: S.url, size: 32, color: F.blue },
      { tex: S.cc1, size: ccz }, { tex: S.cc2, size: ccz },
    ],
  });
  const EP = endCardPose(pc);
  highlight(ctx, C, p1, EP, L.title, sayP(env, 10, t), { color: F.hlMint });
  highlight(ctx, C, p1, EP, L.wei, e(t, T.wei, 0.4, ease.linear), { color: F.hlMint });
  highlight(ctx, C, p1, EP, L.neurips, e(t, T.neurips, 0.6, ease.linear), { color: F.hlMint });
}
