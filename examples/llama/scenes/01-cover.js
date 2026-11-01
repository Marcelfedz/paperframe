// cover — p. 1 on the desk: the arXiv side stamp and its date, fourteen authors at Meta AI, the abstract's
// first sentence with the four sizes rising as slabs beside the page (Figure 1's colours, heights from Table 2),
// the data claim read verbatim and lifted off as a standing strip, the size claim with a GPT-3 slab towering
// behind the 13B one, the release line and its footnote URL, and two small crops of what's ahead
// (Table 1 from p. 2, Table 3 from p. 4).
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, win, desk, edgeIn, loadPaper, findPhrase, camAt, sheet, highlight,
  markBox, liftPose, arcPose, slab, contactShadow, tag, cite, sayP, sayWords, onSheet, masked, standIn,
} from '/engine/folio.js';
import { MODELS, GPT3_PARAMS, P1, T1, T3, PAL } from './_data.js';

// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars) and redrawn figures.
const PAGES = true;

const S = {
  arxiv: '\\texttt{arXiv:2302.13971v1}',
  date: '\\text{27 Feb 2023}',
  authors: '\\text{14 authors}',
  m7: '\\text{7B}', m13: '\\text{13B}', m33: '\\text{33B}', m65: '\\text{65B}',
  gpt3: '\\text{GPT-3, 175B}',
  most: '\\text{most benchmarks (abstract)}',
  c1: '\\text{p.~1}',
  c1a: '\\text{p.~1}\\;\\cdot\\;\\text{Abstract}',
  c2: '\\text{p.~2}\\;\\cdot\\;\\text{Table 1}',
  c4: '\\text{p.~4}\\;\\cdot\\;\\text{Table 3}',
};

const NAMES = ['Hugo Touvron', 'Thibaut Lavril', 'Gautier Izacard', 'Xavier Martinet', 'Marie-Anne Lachaux', 'Timothee Lacroix',
  'Baptiste Rozière', 'Naman Goyal', 'Eric Hambro', 'Faisal Azhar', 'Aurelien Rodriguez', 'Armand Joulin', 'Edouard Grave', 'Guillaume Lample'];

// The p. 1 footnote's e-mail addresses are painted out (briefing: never zoom in on them; the reading beats
// come close to that footnote). Same rects in 01-cover and 02-problem, so the page matches across the cut.
const EMAILS = [{ x0: 683, y0: 2063, x1: 812, y1: 2091 }, { x0: 194, y0: 2091, x1: 748, y1: 2118 }];

// ── world layout (desk px) ───────────────────────────────────────────────────
const PAGE = { x: 640, y: 560, w: 760, rot: -0.01 };            // p. 1 at rest (same pose in 02-problem)
const SC = PAGE.w / 1654;                                       // world px per page px
const wx = (u) => PAGE.x + (u - 827) * SC, wy = (v) => PAGE.y + (v - 1169.5) * SC;

// the four sizes: one row to the right of the page, equal footprints, height ∝ Table 2's parameter count
const PPB = 2.2;                                                // world px per billion parameters (whole video)
const FW = 90, GAP = 36, ROW = { x0: 1070, y: 440 };
const SLABS = MODELS.map((m, i) => ({ ...m, cx: ROW.x0 + FW / 2 + i * (FW + GAP), h: m.params * PPB, label: S[m.key] }));
const GPT = { cx: SLABS[1].cx, cy: ROW.y - 2 * FW, h: GPT3_PARAMS * PPB };      // GPT-3 stands behind the 13B slab, a footprint of desk between them
const SLIDE = 70;                                               // s5: the row slides towards the viewer

// the data claim, lifted as one strip (4 lines; the words before and after the quote are painted out on the copy)
const STRIP = { x0: 238, y0: 758.5, x1: 764, y1: 889 };
const STRIP_TO = { x: 700, y: 150, z: 40, w: 820, tilt: 0.5, arc: 220 };
const MASK = [{ x0: 243, y0: 760, x1: 520, y1: 788 }, { x0: 731, y0: 859, x1: 758, y1: 888 }];   // "of tokens, and show that" · "In"

// the two promises (s6): crops land in front of the row
const CROPS = [
  { key: 't1', rect: T1.box, at: { x: 1250, y: 790, w: 300, rot: -0.04 } },
  { key: 't3', rect: T3.box, at: { x: 1650, y: 800, w: 430, rot: 0.03 } },
];

let p1, p1q, p2, p4, L;

const union = (rs) => ({ x0: Math.min(...rs.map((r) => r.x0)), y0: Math.min(...rs.map((r) => r.y0)), x1: Math.max(...rs.map((r) => r.x1)), y1: Math.max(...rs.map((r) => r.y1)) });

/** a sheet put down at `base`, coming from (dx, dy) off it: the kit's arcPose with an ease-out */
const arrive = (base, p, { dx = 0, dy = 800, rot = 0.1, arc = 170 } = {}) =>
  arcPose({ ...base, x: base.x + dx, y: base.y + dy, rot: (base.rot || 0) + rot }, base, ease.outCubic(clamp(p)), arc);
/** ink line under page-px span (u0..u1) at v, drawn on the sheet (kit candidate) */
function inkUnder(ctx, C, page, pose, u0, u1, v, p, { color = F.ink, width = 2.4 } = {}) {
  if (p <= 0) return;
  const a = onSheet(C, page, pose, u0, v), b = onSheet(C, page, pose, lerp(u0, u1, clamp(p)), v);
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width * a.k; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.restore();
}
/** underline a multi-line phrase (findPhrase lines), sweeping line after line (kit candidate) */
function underlineLines(ctx, C, page, pose, lines, p, o) {
  const total = lines.reduce((s, l) => s + l.n, 0);
  let acc = 0;
  for (const l of lines) {
    const f = clamp((p * total - acc) / l.n);
    acc += l.n;
    if (f <= 0) break;
    inkUnder(ctx, C, page, pose, l.x0, l.x1, l.y1 + 3, f, o);
  }
}

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [1, 2, 4]);
    const pg = (n) => (PAGES ? P.page(n) : standIn(P.page(n)));
    p1 = masked(pg(1), EMAILS, { pad: 0 }); p2 = pg(2); p4 = pg(4);
    p1q = masked(p1, MASK, { pad: 1 });
    L = {
      names: NAMES.map((n) => findPhrase(p1, n)),
      meta: findPhrase(p1, 'Meta AI'),
      called: findPhrase(p1, 'called LLaMA'),
      intro: findPhrase(p1, 'We introduce LLaMA, a collection of founda- tion language models ranging from 7B to 65B parameters'),
      claim: findPhrase(p1, 'it is possible to train state-of-the-art models using publicly avail- able datasets exclusively, without resorting to proprietary and inaccessible datasets'),
      publicly: findPhrase(p1, 'publicly avail- able datasets exclusively'),
      size: findPhrase(p1, 'LLaMA-13B outperforms GPT-3 (175B) on most benchmarks'),
      release: findPhrase(p1, 'We release all our models to the research community'),
      url: findPhrase(p1, 'https://github.com/facebookresearch/llama'),
    };
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      arxiv: q.w(0, 'arXiv'), feb: q.w(0, 'February'),
      s1: q.s(1), meta: q.w(1, 'Meta'), s2: q.s(2), llama: q.w(2, 'LLaMA'),
      seven: q.w(2, 'seven'), to: q.w(2, 'to'), sixty: q.w(2, 'sixty-five'), billion: q.w(2, 'billion'), its: q.w(2, 'its'),
      s3: q.s(3), e3: q.e(3),
      s4: q.s(4), the4: q.w(4, 'the'), thirteen: q.w(4, 'thirteen-billion'), hundred: q.w(4, 'hundred'), most: q.w(4, 'most'),
      s5: q.s(5), release: q.w(5, 'release'), research: q.w(5, 'research'),
      s6: q.s(6), what: q.w(6, 'what'), how: q.w(6, 'how'), end: q.e(6),
    };
    T.lift = T.e3 + 0.4;          // hold 0.4 s after "datasets."
    T.land = T.lift + 1.3;
    T.off = T.the4 - 0.15;        // the strip leaves on "the (thirteen-billion …)"
    T.tower = T.hundred - 1.15;   // camera pitches up before GPT-3 rises

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    const C = camAt(t, [
      { t: 0, tx: 590, ty: 560, zoom: 0.86, pitch: 0.16 },
      { t: 1.0, dur: 4.8, tx: 580, zoom: 0.9 },
      { t: T.s1 - 0.4, dur: 1.2, tx: 610, ty: 228, zoom: 1.5 },
      { t: T.s1 + 0.9, dur: 2.0, tx: 625, zoom: 1.56 },
      { t: T.s2 - 0.35, dur: 1.3, tx: 1000, ty: 420, zoom: 1.45, pitch: 0.42 },
      { t: T.its - 0.1, dur: 1.6, tx: 495, ty: 405, zoom: 2.12, pitch: 0.18 },
      { t: T.s3 + 0.9, dur: 8.5, tx: 508, zoom: 2.2 },
      { t: T.lift - 0.05, dur: 1.4, tx: 700, ty: 330, zoom: 1.2, pitch: 0.5 },
      { t: T.off - 0.15, dur: 1.4, tx: 1000, ty: 420, zoom: 1.45, pitch: 0.42 },
      { t: T.tower, dur: 1.3, tx: 1100, ty: 320, zoom: 1.2, pitch: 0.85 },
      { t: T.s5 - 0.3, dur: 1.4, tx: 900, ty: 660, zoom: 1.15, pitch: 0.22 },
      { t: T.s6 - 0.3, dur: 1.4, tx: 1470, ty: 640, zoom: 1.15, pitch: 0.5 },
      { t: T.s6 + 1.1, dur: 3.2, tx: 1490, zoom: 1.18 },
      { t: T.end + 0.05, dur: 2.2, tx: 1500, yaw: 0.24, pitch: 0.68 },
    ]);

    // ── p. 1: slides up onto the desk and stays ──
    const pin = e(t, 0, 1.3, ease.outCubic);
    const PG = arcPose({ ...PAGE, y: 1900, rot: -0.14 }, PAGE, pin, 160);
    sheet(ctx, C, p1, PG);
    // s0: the side stamp (vertical text: boxed, not highlighted)
    const sa = win(t, T.arxiv - 0.05, T.s1 + 0.2, 0.2, 0.5);
    if (sa > 0) { ctx.save(); ctx.globalAlpha *= sa; markBox(ctx, C, p1, PG, P1.sideStamp, e(t, T.arxiv - 0.05, 0.9), { color: F.ink2, width: 2, pad: 6 }); ctx.restore(); }
    // s1: fourteen names in reading order, then the affiliation
    L.names.forEach((n, i) => highlight(ctx, C, p1, PG, n, e(t, T.s1 + i * ((T.meta - T.s1 - 0.3) / 13), 0.3, ease.linear), { color: F.hlMint }));
    highlight(ctx, C, p1, PG, L.meta, sayWords(env, 1, 4, 5, t), { color: F.hlMint });
    // s2: the first sentence with the voice, the paper naming its models
    highlight(ctx, C, p1, PG, L.intro, sayWords(env, 2, 0, 11, t), { color: F.hlMint });
    highlight(ctx, C, p1, PG, L.called, e(t, T.llama - 0.05, 0.45, ease.linear), { color: F.hlBlue });
    // s3: the data claim, verbatim
    highlight(ctx, C, p1, PG, L.claim, sayP(env, 3, t), { color: F.hlYellow });
    // s4 / s5: the size claim, the release, the footnote URL
    highlight(ctx, C, p1, PG, L.size, sayWords(env, 4, 7, 20, t), { color: F.hlMint });
    highlight(ctx, C, p1, PG, L.release, sayWords(env, 5, 6, 12, t), { color: F.hlMint });
    highlight(ctx, C, p1, PG, L.url, sayWords(env, 5, 11, 12, t), { color: F.hlMint });

    // ── s0: id and date on the desk beside the side stamp ──
    const a0 = win(t, T.feb - 0.2, T.s1 + 0.1, 0.3, 0.45);
    if (a0 > 0) {
      const r = C.p(wx(0) - 34, wy(1180), 0);
      drawTex(ctx, S.arxiv, r.x, r.y - 34, { size: 38, color: F.ink2, align: 'right', write: e(t, T.feb - 0.2, 0.9, ease.linear), alpha: a0 });
      drawTex(ctx, S.date, r.x, r.y + 40, { size: 54, color: F.ink, align: 'right', write: e(t, T.feb + 0.3, 1.1, ease.linear), alpha: a0 });
    }
    // ── s1: the author count ──
    const a1 = win(t, T.s1 - 0.05, T.s2 + 0.1, 0.3, 0.4);
    if (a1 > 0) {
      const r = C.p(wx(0) - 24, wy(395), 0);
      tag(ctx, S.authors, r.x, r.y, { size: 46, align: 'right', valign: 'middle', write: e(t, T.s1 - 0.05, 0.8, ease.linear), alpha: a1 });
    }

    // ── the four sizes, and GPT-3 behind the 13B ──
    const slide = e(t, T.release, 1.2, ease.inOutCubic) * SLIDE;
    const rise = [T.seven, T.to + 0.1, T.sixty + 0.3, T.billion].map((t0) => e(t, t0 - 0.05, 0.75, ease.outCubic));
    const pulse = Math.max(0, Math.sin(Math.PI * clamp((t - T.thirteen) / 0.6))) + Math.max(0, Math.sin(Math.PI * clamp((t - T.thirteen - 0.7) / 0.6)));
    const gUp = e(t, T.hundred - 0.05, 2.0, ease.inOutCubic), gDown = e(t, T.release - 0.1, 1.0, ease.inCubic);
    const solids = [];
    SLABS.forEach((s, i) => {
      if (rise[i] <= 0) return;
      const y0 = ROW.y - FW / 2 + slide, pz = i === 1 ? pulse * 16 : 0;
      solids.push({ d: C.p(s.cx, y0 + FW / 2, 0).depth, draw: () => {
        contactShadow(ctx, C, { x0: s.cx - FW / 2, y0, x1: s.cx + FW / 2, y1: y0 + FW }, { alpha: clamp(rise[i] * 2) });
        slab(ctx, C, { x0: s.cx - FW / 2, x1: s.cx + FW / 2, y0, y1: y0 + FW, z0: 0, z1: Math.max(1, s.h * rise[i]) + pz },
          { fill: s.fill, stroke: s.color, width: 2.4 + (i === 1 ? pulse * 3.5 : 0), alpha: clamp(rise[i] * 3) });
      } });
    });
    const gh = GPT.h * gUp * (1 - gDown);
    if (gh > 1) {
      const foot = { x0: GPT.cx - FW / 2, x1: GPT.cx + FW / 2, y0: GPT.cy - FW / 2, y1: GPT.cy + FW / 2 };
      solids.push({ d: C.p(GPT.cx, GPT.cy, 0).depth, draw: () => {
        contactShadow(ctx, C, foot, { alpha: 0.7 * (1 - gDown) });
        slab(ctx, C, { ...foot, z0: 0, z1: gh }, { fill: PAL.gpt3Fill, stroke: PAL.gpt3, width: 2.4, alpha: 0.7 * clamp(gUp * 4) * (1 - gDown) });
      } });
    }
    solids.sort((a, b) => b.d - a.d).forEach((s) => s.draw());
    // labels: on the desk in front of each slab, in its colour
    SLABS.forEach((s, i) => {
      if (rise[i] <= 0) return;
      const at = C.p(s.cx, ROW.y + FW / 2 + slide + 26, 0);
      drawTex(ctx, s.label, at.x, at.y, { size: 46, color: s.color, align: 'center', valign: 'top', write: clamp(rise[i] * 1.4) });
    });
    if (gh > 1) {
      const top = C.p(GPT.cx, GPT.cy - FW / 2, gh + 16);
      tag(ctx, S.gpt3, top.x, top.y, { size: 40, color: F.ink2, align: 'center', valign: 'bottom', write: e(t, T.hundred + 0.6, 1.0, ease.linear), alpha: 1 - gDown });
    }
    const am = win(t, T.most - 0.1, T.release, 0.3, 0.4);
    if (am > 0) {
      const r = C.p(SLABS[1].cx, ROW.y + FW / 2 + 120, 0);
      tag(ctx, S.most, r.x, r.y, { size: 36, align: 'center', valign: 'top', write: e(t, T.most - 0.1, 0.9, ease.linear), alpha: am });
    }

    // ── s3 → s4: the claim lifts off as one strip, faces the camera, then slides away to the upper left ──
    const lp = e(t, T.lift, 1.3, ease.linear);
    const gone = e(t, T.off, 1.1, ease.inCubic);
    if (lp > 0 && gone < 1) {
      const to = { ...STRIP_TO, x: STRIP_TO.x - 1500 * gone, y: STRIP_TO.y - 700 * gone, z: STRIP_TO.z + 220 * gone };
      const SP = liftPose(p1q, PG, STRIP, to, lp);
      sheet(ctx, C, p1q, SP, { grid: 6, shadow: 0.5 });
      highlight(ctx, C, p1q, SP, L.claim, 1);
      underlineLines(ctx, C, p1q, SP, L.publicly, e(t, T.land - 0.1, 0.6, ease.linear), { width: 2.2 });
    }

    // ── s6: two promises land in front of the row ──
    const src = { t1: p2, t3: p4 };
    const tIn = { t1: T.what - 0.1, t3: T.how - 0.1 };
    CROPS.forEach(({ key, rect, at }) => {
      const p = e(t, tIn[key], 1.0, ease.linear);
      if (p <= 0) return;
      sheet(ctx, C, src[key], arrive({ ...at, src: rect }, p, { dy: 700, rot: 0.12, arc: 180 }), { grid: 4 });
    });

    // ── source stamp: p. 1, the box follows what's in focus; then Table 1, Table 3 ──
    let page = p1, rect = null, label = S.c1;
    if (t > T.arxiv - 0.05 && t < T.s1 - 0.2) rect = P1.sideStamp;
    else if (t >= T.s1 - 0.2 && t < T.s2 - 0.3) rect = union([P1.authors, P1.meta]);
    else if (t >= T.s2 - 0.3 && t < T.research) { rect = P1.abstract; label = S.c1a; }
    else if (t >= T.research) rect = P1.footnoteURL;
    if (t >= T.what + 0.6) { page = p2; rect = T1.box; label = S.c2; }
    if (t >= T.how + 0.6) { page = p4; rect = T3.box; label = S.c4; }
    cite(ctx, page, { label, rect, alpha: e(t, 0.8, 0.6), side: 'right' });
  },
};
