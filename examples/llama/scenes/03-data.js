// data — p. 2: Table 1 lifts off and stands at the back of the desk. The training mixture becomes a 3D
// block, one layer per source, thickness ∝ sampling proportion (Table 1): CommonCrawl rises, C4 settles on
// top, five thin slices drop on one per word. A strip of p. 3 stands in front: 1.4T tokens, most seen once,
// Wikipedia and Books about twice (those two layers lift out and get a ghost second copy). The restriction
// line of Section 2.1 is lifted off p. 2 and read with the voice while a glass sleeve wraps the block.
// Then p. 1: what other models use, "Books – 2TB", boxed in ink.
import { clamp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, desk, edgeIn, loadPaper, findPhrase, camAt, sheet, onSheet, highlight, markBox,
  liftPose, arcPose, slab, arrow3, tag, cite, sayWords, standIn, masked, hexA, win,
} from '/engine/folio.js';
import { PAL, P1, T1, P3 } from './_data.js';

// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars) and redrawn figures.
const PAGES = true;

const S = {
  cT1: '\\text{p.~2}\\;\\cdot\\;\\text{Table 1}',
  cS21: '\\text{p.~2}\\;\\cdot\\;\\text{Section 2.1}',
  cP3: '\\text{p.~3}\\;\\cdot\\;\\text{Section 2.1}',
  cP1: '\\text{p.~1}\\;\\cdot\\;\\text{Section 1}',
  legend: '\\text{thickness} \\propto \\text{sampling proportion}',
  dedup: '\\text{deduplicated}',
  qual: '\\text{quality-filtered}',
  tok: '\\approx 1.4\\text{T tokens}',
  pub: "\\text{publicly available (authors' restriction)}",
  undoc: '\\text{undocumented}',
  epochs: '\\text{epochs}',
};
// one entry per Table 1 row, bottom of the block to top; labels as we write them, percentages as printed
const LAB = {
  web: '\\text{CommonCrawl}\\;\\; 67.0\\%', c4: '\\text{C4}\\;\\; 15.0\\%', github: '\\text{GitHub}\\;\\; 4.5\\%',
  wikipedia: '\\text{Wikipedia}\\;\\; 4.5\\%', books: '\\text{Books}\\;\\; 4.5\\%', arxiv: '\\text{arXiv}\\;\\; 2.5\\%',
  stackexchange: '\\text{Stack Exchange}\\;\\; 2.0\\%',
};
const EPOCH_TEX = { wikipedia: '\\text{Wikipedia}\\;\\; 2.45\\ \\text{epochs}', books: '\\text{Books}\\;\\; 2.23\\ \\text{epochs}' };

// ── the block: Table 1 in 3D (REAL thickness: prop × 4.2 world px, 100 % = 420; footprint ours) ──
const B = { x: 1150, y: 640, h: 230, k: 4.2 };
const LAYERS = (() => {
  let z = 0;
  return T1.rows.map((r, i) => { const th = r.prop * B.k, L = { ...r, i, z0: z, z1: z + th, th, fill: PAL[r.key] }; z += th; return L; });
})();
const TOP = LAYERS.at(-1).z1;   // 420

// ── pages and crops (page px) ───────────────────────────────────────────────
const P2 = { x: 960, y: 560, w: 900, rot: -0.012 };                         // p. 2 at the start
const TAB = { x0: 838, y0: 188, x1: 1471, y1: 734 };                         // Table 1 + caption
const TAB_TO = { x: 440, y: 420, z: 0, w: 640, tilt: 0.85, rot: 0, arc: 220 };   // standing, back left
const STRIP_TO = { x: 1600, y: 1110, z: 0, w: 580, tilt: 0.85, rot: 0, arc: 160 }; // standing, front right
const P3R = { x: 1760, y: 1180, w: 900, rot: 0.06 };                          // p. 3 slides in at the right
const OVR = { x0: 189, y0: 539, x1: 816, y1: 766 };                          // P3.overall, padded
const P2B = { x: 1380, y: 1260, w: 900, rot: -0.05 };                         // p. 2 back for the restriction line
const RESTR = { x0: 189, y0: 712, x1: 812, y1: 788 };                        // "the restriction … open sourcing."
const RESTR_MASK = { x0: 750, y0: 755, x1: 812, y1: 783 };                   // "This" (next sentence) painted out
const P1R = { x: 1000, y: 1500, w: 900, rot: -0.01 };                         // p. 1 for the last sentence
const CCPARA = { x0: 192, y0: 884, x1: 812, y1: 1185 };                      // "English CommonCrawl [67%]." … n-gram filter

const cell = (col, r, pad = 5) => ({ x0: T1.cols[col].x0 - pad, y0: r.y0 - pad, x1: T1.cols[col].x1 + pad, y1: r.y1 + pad });

let p1, p2, p2m, p3, L;

export default {
  async setup(env) {
    await loadB1B();
    [...Object.values(S), ...Object.values(LAB), ...Object.values(EPOCH_TEX)].forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [1, 2, 3]);
    p1 = PAGES ? P.page(1) : standIn(P.page(1));
    p2 = PAGES ? P.page(2) : standIn(P.page(2), { blank: [T1.box], draw: typesetT1 });   // Table 1 retypeset from _data.js
    p3 = PAGES ? P.page(3) : standIn(P.page(3));
    p2m = masked(p2, [RESTR_MASK], { pad: 2 });
    L = {
      caption: findPhrase(p2, 'Table 1: Pre-training data.'),
      dedup: findPhrase(p2, 'deduplicates the data at the line level'),
      filt: findPhrase(p2, 'filters low quality content with an n- gram language model'),
      tok: findPhrase(p3, 'roughly 1.4T tokens after tokenization'),
      once: findPhrase(p3, 'each token is used only once dur- ing training,'),
      twice: findPhrase(p3, 'with the exception of the Wikipedia and Books domains, over which we perform ap- proximately two epochs'),
      restr: findPhrase(p2, 'the restriction of only using data that is'),
      pub: findPhrase(p2, 'publicly available, and compatible with open sourcing'),
      notPub: findPhrase(p1, 'not publicly available or undocumented'),
      books: findPhrase(p1, '“Books – 2TB”')[0],
    };
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      tab: q.w(0, 'training'), lift: q.e(0) - 0.3,
      cc: q.w(1, 'Sixty-seven'), dedup: q.w(1, 'deduplicated'), filt: q.w(1, 'filtered'),
      s2: q.s(2), c4: q.w(2, 'Fifteen'), another: q.w(2, 'another'), cc2: q.we(2, 'CommonCrawl'),
      s3: q.s(3), github: q.w(3, 'GitHub'), wikipedia: q.w(3, 'Wikipedia'), books: q.w(3, 'books'), arxiv: q.w(3, 'arXiv'), stackexchange: q.w(3, 'Stack'),
      e3: q.e(3), s4: q.s(4), one: q.w(4, 'one'),
      s5: q.s(5), s6: q.s(6), about: q.w(6, 'about'), e6: q.e(6),
      s7: q.s(7), met: q.w(7, 'met'), pub: q.w(7, 'publicly'), e7: q.e(7),
      s8: q.s(8), use: q.w(8, 'use'), bk: q.w(8, 'books'), end: q.e(8),
    };
    const land = { web: T.cc, c4: T.c4, github: T.github, wikipedia: T.wikipedia, books: T.books, arxiv: T.arxiv, stackexchange: T.stackexchange };

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    const YAW = -0.09;
    const C = camAt(t, [
      { t: 0, tx: 1138, ty: 260, pitch: 0.12, zoom: 1.3 },
      { t: 0.15, dur: 1.2, ty: 215, zoom: 1.75 },
      { t: T.lift + 0.1, dur: 1.9, tx: 1060, ty: 560, pitch: 0.85, zoom: 0.85, yaw: YAW },
      { t: T.cc + 2.0, dur: 23, yaw: YAW - 0.06, tx: 1080 },
      { t: T.s7, dur: 5.5, tx: 1095, zoom: 0.87 },
      { t: T.s8 + 0.3, dur: 1.6, tx: 1178, ty: 1700, pitch: 0.2, zoom: 1.8, yaw: 0 },
      { t: T.s8 + 2.0, dur: 6, tx: 1190, zoom: 1.86 },
    ]);
    const face = -C.yaw;   // standing sheets turn to face the camera

    // ── p. 2: arrives, Table 1 lifts off, the page slides off left ──
    const pIn = e(t, 0, 1.1, ease.outCubic), pOut = e(t, T.lift + 0.35, 1.3, ease.inCubic);
    const p2pose = arcPose(arcPose({ ...P2, x: P2.x + 260, y: P2.y + 1000, rot: 0.14 }, P2, pIn, 150), { ...P2, x: -1100, rot: -0.25 }, pOut, 90);
    if (pOut < 1) {
      sheet(ctx, C, p2, p2pose);
      highlight(ctx, C, p2, p2pose, L.caption, sayWords(env, 0, 4, 5, t), { color: F.hlMint });
    }

    // ── p. 2 back (s7): the restriction line peels off, the page leaves ──
    const bIn = e(t, T.s7 - 0.45, 0.9, ease.outCubic), bOut = e(t, T.s7 + 0.75, 1.0, ease.inCubic);
    const p2bpose = arcPose(arcPose({ ...P2B, x: P2B.x - 900, y: P2B.y + 500, rot: -0.2 }, P2B, bIn, 120), { ...P2B, x: -900, y: P2B.y + 200, rot: -0.3 }, bOut, 80);
    if (bIn > 0 && bOut < 1) sheet(ctx, C, p2m, p2bpose);

    // ── p. 3 (s4): slides in at the right, the 1.4T strip peels off, the page leaves ──
    const tIn = e(t, T.e3 - 0.55, 0.85, ease.outCubic), tOut = e(t, T.s4 + 0.55, 1.0, ease.inCubic);
    const p3pose = arcPose(arcPose({ ...P3R, x: P3R.x + 900, rot: 0.3 }, P3R, tIn, 120), { ...P3R, x: P3R.x + 1100, y: P3R.y + 300, rot: 0.3 }, tOut, 80);
    if (tIn > 0 && tOut < 1) sheet(ctx, C, p3, p3pose);

    // ── p. 1 (s8) ──
    const oIn = e(t, T.s8 - 0.1, 1.2, ease.outCubic);
    const p1pose = arcPose({ ...P1R, x: P1R.x - 700, y: P1R.y + 900, rot: -0.18 }, P1R, oIn, 160);
    if (oIn > 0) {
      sheet(ctx, C, p1, p1pose);
      highlight(ctx, C, p1, p1pose, L.notPub, sayWords(env, 8, 9, 13, t), { color: F.hlMint });   // on "not public or not documented"
      markBox(ctx, C, p1, p1pose, L.books, e(t, T.bk, 0.9, ease.inOutCubic), { color: F.ink, width: 2.6, pad: 6 });
    }

    // ── Table 1, standing at the back left ──
    const tabP = e(t, T.lift, 1.7, ease.linear);
    const tabPose = liftPose(p2, P2, TAB, { ...TAB_TO, rot: face }, tabP);
    if (tabP > 0) {
      sheet(ctx, C, p2, tabPose, { grid: 6, shadow: 0.5 });
      highlight(ctx, C, p2, tabPose, L.caption, 1, { color: F.hlMint });
      // the row of each layer, boxed in the prop column as it lands; the epochs cells in s6
      LAYERS.forEach((Ly, i) => {
        const t0 = land[Ly.key] + 0.1, next = i < LAYERS.length - 1 ? land[LAYERS[i + 1].key] + 0.1 : T.e3 + 0.4;
        const a = clamp((next + 0.5 - t) / 0.4);
        if (a > 0 && t > t0) { ctx.save(); ctx.globalAlpha *= a; markBox(ctx, C, p2, tabPose, cell('prop', Ly), e(t, t0, 0.5, ease.inOutCubic), { color: F.ink, width: 3, pad: 0 }); ctx.restore(); }
      });
      const ea = clamp((T.s7 - t) / 0.4);
      if (ea > 0) {
        ctx.save(); ctx.globalAlpha *= ea;
        markBox(ctx, C, p2, tabPose, cell('epochs', T1.rows[3]), e(t, T.about, 0.5, ease.inOutCubic), { color: F.ink, width: 3, pad: 0 });
        markBox(ctx, C, p2, tabPose, cell('epochs', T1.rows[4]), e(t, T.about + 0.15, 0.5, ease.inOutCubic), { color: F.ink, width: 3, pad: 0 });
        ctx.restore();
      }
    }

    // ── the block ──
    // s6: the block opens at Wikipedia and Books (the layers above lift, the two slide out a little like drawers);
    // on "about twice" each gets a ghost second copy stacked on it. Closed again before s7.
    const out = e(t, T.s6 - 0.05, 0.8, ease.inOutCubic) * (1 - e(t, T.s7 - 0.55, 0.8, ease.inOutCubic));
    const gh = e(t, T.about - 0.05, 0.6, ease.inOutCubic) * (1 - e(t, T.s7 - 0.55, 0.6, ease.inOutCubic));
    const GAP = 5, TH = LAYERS[3].th;
    const RISE = { wikipedia: GAP * out, books: 2 * GAP * out + (TH + GAP) * gh, arxiv: 3 * GAP * out + 2 * (TH + GAP) * gh, stackexchange: 3 * GAP * out + 2 * (TH + GAP) * gh };
    const SLIDE = { wikipedia: 70 * out, books: 70 * out };
    const boxOf = (Ly) => {
      const p = e(t, land[Ly.key] - 0.05, Ly.key === 'web' ? 1.1 : 0.55, Ly.key === 'web' ? ease.inOutCubic : ease.outCubic);
      if (p <= 0) return null;
      let z0 = Ly.z0, z1 = Ly.z1;
      if (Ly.key === 'web') z1 = Ly.z0 + Ly.th * p;
      else { const drop = (Ly.key === 'c4' ? 240 : 150) * (1 - p); z0 += drop; z1 += drop; }
      const dz = RISE[Ly.key] || 0, dx = SLIDE[Ly.key] || 0;
      return { x0: B.x - B.h + dx, x1: B.x + B.h + dx, y0: B.y - B.h, y1: B.y + B.h, z0: z0 + dz, z1: z1 + dz, a: clamp(p * 3) };
    };
    const boxes = LAYERS.map(boxOf);
    const top = TOP + (RISE.stackexchange || 0);

    // glass sleeve (s7): the back faces go under the block, the front faces over it
    const gl = e(t, T.pub - 0.1, 1.0, ease.outCubic);
    const G = { x0: B.x - B.h - 22, x1: B.x + B.h + 22, y0: B.y - B.h - 22, y1: B.y + B.h + 22, z1: (TOP + 26) * gl };
    if (gl > 0) sleeve(ctx, C, G, 'back');

    // the block, bottom to top (each layer occludes the ones under it); ghosts right on their layer
    LAYERS.forEach((Ly, i) => {
      const b = boxes[i];
      if (!b) return;
      slab(ctx, C, b, { fill: Ly.fill, stroke: F.ink, width: 1.5, alpha: b.a });
      if (SLIDE[Ly.key] !== undefined && gh > 0) {
        slab(ctx, C, { ...b, z0: b.z1 + GAP, z1: b.z1 + GAP + Ly.th }, { fill: hexA(Ly.fill, 0.45), stroke: F.ink, width: 1.5, alpha: gh });
      }
    });

    // front-face labels: CommonCrawl and C4, the bracket between them, the two CommonCrawl tags
    const fx = B.x - B.h + 46, fy = B.y + B.h;
    // labels written on the front face, turned to follow its edge
    const faceLabel = (src, z, size, write) => {
      if (write <= 0) return;
      const a = C.p(fx, fy, z), b = C.p(B.x + B.h, fy, z);
      ctx.save();
      ctx.translate(a.x, a.y); ctx.rotate(Math.atan2(b.y - a.y, b.x - a.x));
      drawTex(ctx, src, 0, 0, { size: size * a.k, color: F.ink, valign: 'middle', write });
      ctx.restore();
    };
    faceLabel(LAB.web, LAYERS[0].z0 + 210, 40, e(t, T.cc + 0.35, 0.8, ease.linear));
    if (boxes[1]) faceLabel(LAB.c4, (LAYERS[1].z0 + LAYERS[1].z1) / 2, 36, e(t, T.c4 + 0.3, 0.7, ease.linear));
    const br = e(t, T.another, 0.9, ease.inOutCubic);
    if (br > 0) {
      const bx = B.x - B.h + 24, zA = (LAYERS[1].z0 + LAYERS[1].z1) / 2, zB = LAYERS[0].z0 + 210;
      arrow3(ctx, C, [[bx + 14, fy + 1, zA], [bx, fy + 1, zA], [bx, fy + 1, zB], [bx + 14, fy + 1, zB]], br, { color: F.ink2, width: 2.4, head: false });
    }
    const tg = (src, z, t0, a) => {
      const s = e(t, t0, 0.6, ease.outCubic);
      if (s <= 0 || a <= 0) return;
      const pt = C.p(fx, fy, z);
      tag(ctx, src, pt.x + 300 * (1 - s), pt.y, { size: 34, valign: 'middle', alpha: s * a });
    };
    const tagA = 1 - e(t, T.s2 - 0.3, 0.5, ease.linear);
    tg(S.dedup, 120, T.dedup, tagA);
    tg(S.qual, 50, T.filt, tagA);

    if (gl > 0) sleeve(ctx, C, G, 'front');

    // thin layers: labels in a column right of the block, thin leaders to each layer's front-right edge;
    // in s6 the Wikipedia and Books labels turn into their epochs (Table 1)
    LAYERS.slice(2).forEach((Ly, j) => {
      const b = boxes[Ly.i];
      if (!b) return;
      const w = e(t, land[Ly.key] + 0.15, 0.6, ease.linear);
      const lab = C.p(B.x + B.h + 170, B.y + B.h - 40, 250 + j * 66);
      const anc = C.p(b.x1, b.y1 - 30, (b.z0 + b.z1) / 2);
      ctx.save();
      ctx.strokeStyle = F.ink2; ctx.lineWidth = 1.6; ctx.globalAlpha *= clamp(w * 2);
      ctx.beginPath(); ctx.moveTo(anc.x + 3, anc.y); ctx.lineTo(lab.x - 14, lab.y); ctx.stroke();
      ctx.restore();
      const ep = EPOCH_TEX[Ly.key] ? gh : 0;
      if (ep < 1) tag(ctx, LAB[Ly.key], lab.x, lab.y, { size: 34, valign: 'middle', write: w, alpha: 1 - ep });
      if (ep > 0) tag(ctx, EPOCH_TEX[Ly.key], lab.x, lab.y, { size: 34, valign: 'middle', write: ep });
    });

    // legend under the block while it builds
    const lgA = win(t, T.cc + 0.6, T.s4 - 0.2, 0.5, 0.5);
    if (lgA > 0) { const lp = C.p(B.x, B.y + B.h + 60, 0); tag(ctx, S.legend, lp.x, lp.y, { size: 32, align: 'center', valign: 'middle', alpha: lgA, color: F.ink2 }); }

    // ≈ 1.4T tokens, on top of the block
    const tkA = e(t, T.one, 0.7, ease.linear) * (1 - e(t, T.s7 - 0.3, 0.5, ease.linear));
    if (tkA > 0) { const tp = C.p(B.x, B.y, top + 60); tag(ctx, S.tok, tp.x, tp.y, { size: 46, align: 'center', valign: 'middle', write: tkA }); }

    // ── the p. 3 strip (s4–s6), then the p. 2 restriction strip (s7), standing at the front right ──
    const sP = e(t, T.s4 - 0.1, 1.3, ease.linear), sOut = e(t, T.s7 - 0.35, 0.9, ease.linear);
    if (sP > 0 && sOut < 1) {
      const to = { ...STRIP_TO, rot: face, x: STRIP_TO.x + 700 * ease.inCubic(sOut), z: 360 * ease.inCubic(sOut) };
      const sp = liftPose(p3, P3R, OVR, to, sP);
      sheet(ctx, C, p3, sp, { grid: 6, shadow: 0.5 });
      highlight(ctx, C, p3, sp, L.tok, sayWords(env, 4, 1, 5, t), { color: F.hlMint });
      highlight(ctx, C, p3, sp, L.once, e(t, T.s5, q.e(5) - T.s5, ease.linear), { color: F.hlMint });
      highlight(ctx, C, p3, sp, L.twice, e(t, T.s6, T.e6 - T.s6, ease.linear), { color: F.hlMint });
    }
    const rP = e(t, T.s7 + 0.1, 1.2, ease.linear), rOut = e(t, T.s8 - 0.1, 0.9, ease.linear);
    if (rP > 0 && rOut < 1) {
      const to = { ...STRIP_TO, w: 600, rot: face, x: STRIP_TO.x - 10 + 800 * ease.inCubic(rOut), z: 300 * ease.inCubic(rOut) };
      const rp = liftPose(p2m, P2B, RESTR, to, rP);
      sheet(ctx, C, p2m, rp, { grid: 4, shadow: 0.5 });
      highlight(ctx, C, p2m, rp, L.restr, sayWords(env, 7, 2, 4, t), { color: F.hlMint });
      highlight(ctx, C, p2m, rp, L.pub, sayWords(env, 7, 5, 11, t), { color: F.hlYellow });
    }
    // the sleeve's label
    if (gl > 0) {
      const lp = C.p(B.x, B.y + B.h + 22, 0);
      tag(ctx, S.pub, lp.x, lp.y + 44, { size: 38, align: 'center', valign: 'middle', write: e(t, T.pub + 0.3, 1.0, ease.linear) * (1 - e(t, T.s8, 0.5, ease.linear)) });
    }

    // p. 1 tag beside "Books – 2TB"
    if (oIn > 0) {
      const a = onSheet(C, p1, p1pose, L.books.x1 + 70, (L.books.y0 + L.books.y1) / 2 - 40);
      tag(ctx, S.undoc, a.x, a.y, { size: 40, align: 'left', valign: 'middle', write: e(t, T.bk + 0.35, 0.7, ease.linear) });
    }

    // ── source stamp ──
    let cp = p2, label = S.cT1, rect = TAB;
    if (t >= T.dedup - 0.2 && t < T.s2 - 0.3) { label = S.cS21; rect = CCPARA; }
    if (t >= T.s4 - 0.1 && t < T.s7) { cp = p3; label = S.cP3; rect = OVR; }
    if (t >= T.s7 && t < T.s8) { cp = p2; label = S.cS21; rect = RESTR; }
    if (t >= T.s8) { cp = p1; label = S.cP1; rect = P1.rightData; }
    cite(ctx, cp, { label, rect, alpha: e(t, 0.6, 0.6), side: 'left' });
  },
};

/** PAGES = false: Table 1 typeset in place on the stand-in (values as printed, from T1 in _data.js) */
function typesetT1(g) {
  const c = T1.cols, my = (r) => (r.y0 + r.y1) / 2, o = { size: 28, color: F.ink, valign: 'middle' };
  g.strokeStyle = F.ink; g.lineWidth = 2;
  for (const y of [200, 254, 531]) { g.beginPath(); g.moveTo(846, y); g.lineTo(1462, y); g.stroke(); }
  const hy = (T1.header.y0 + T1.header.y1) / 2;
  drawTex(g, '\\text{Dataset}', c.name.x0, hy, o);
  drawTex(g, '\\text{Sampling prop.}', c.prop.x1 + 52, hy, { ...o, size: 26, align: 'right' });
  drawTex(g, '\\text{Epochs}', c.epochs.x1, hy, { ...o, align: 'right' });
  drawTex(g, '\\text{Disk size}', c.disk.x1, hy, { ...o, align: 'right' });
  for (const r of T1.rows) {
    drawTex(g, `\\text{${r.label}}`, c.name.x0, my(r), o);
    drawTex(g, `${r.prop.toFixed(1)}\\%`, c.prop.x1, my(r), { ...o, align: 'right' });
    drawTex(g, r.epochs.toFixed(2), c.epochs.x1, my(r), { ...o, align: 'right' });
    drawTex(g, `\\text{${r.disk}}`, c.disk.x1, my(r), { ...o, align: 'right' });
  }
}

/** glass sleeve around the block: 'back' faces (drawn before the block) or 'front' faces (after) */
function sleeve(ctx, C, G, part) {
  if (G.z1 < 1) return;
  const E = C.eye;
  const sides = [
    { pts: [[G.x0, G.y1], [G.x1, G.y1]], n: [0, 1] }, { pts: [[G.x1, G.y0], [G.x0, G.y0]], n: [0, -1] },
    { pts: [[G.x1, G.y1], [G.x1, G.y0]], n: [1, 0] }, { pts: [[G.x0, G.y0], [G.x0, G.y1]], n: [-1, 0] },
  ];
  ctx.save();
  ctx.lineJoin = 'round';
  for (const s of sides) {
    const mx = (s.pts[0][0] + s.pts[1][0]) / 2, my = (s.pts[0][1] + s.pts[1][1]) / 2;
    const facing = s.n[0] * (E[0] - mx) + s.n[1] * (E[1] - my) > 0;
    if ((part === 'front') !== facing) continue;
    const Q = [C.p(s.pts[0][0], s.pts[0][1], 0), C.p(s.pts[1][0], s.pts[1][1], 0), C.p(s.pts[1][0], s.pts[1][1], G.z1), C.p(s.pts[0][0], s.pts[0][1], G.z1)];
    ctx.beginPath(); Q.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath();
    ctx.fillStyle = PAL.glass; ctx.fill();
    ctx.strokeStyle = hexA(F.ink2, 0.8); ctx.lineWidth = 1.6 * Q[0].k; ctx.stroke();
  }
  ctx.restore();
}
