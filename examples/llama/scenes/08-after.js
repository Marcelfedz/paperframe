// after — what followed the release (external sources as typed cards, no screenshots, no logos), then the end card.
// s0 a timeline rule on the desk (Feb · Mar · Jul 2023, spacing ∝ months, ILLUSTRATIVE); the four model slabs from
// the cover (2.2 px per billion, 90 footprint) stand small at Feb; Meta's announcement card lands (24 Feb 2023, the
// noncommercial-licence quote) and prints a tag: access by application, case by case. s1 the 7B slab lifts clear of
// its neighbours and travels towards Mar. s2 the Alpaca card lands at Mar, the 7B slab lands in front of it and a thin
// neutral "fine-tuned" layer (ILLUSTRATIVE) settles on top; the Feb quote ghosts across to the Alpaca card, which
// writes its own licence line. s3 at Jul: Meta's 18 Jul card (Meta's own count of 100,000+ requests, then "free for
// research and commercial use", both from that blog post) and the Llama 2 card (arXiv:2307.09288) with a neutral
// 7B-to-70B bracket on the slabs' height scale. s4 the camera pulls back over the whole timeline; callbacks light in
// turn: the slabs, four token bars in lanes in front of the rule (1.0/1.0/1.4/1.4T), a miniature of segment 3's data
// block, the Feb card. s5–s7 the end card on p. 1 (e-mails painted out as in the cover) with the CC BY credit.
// The stamp area shows each card's source (a TeX label, no page thumbnail) while that card is in focus.

// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars) and redrawn figures.
const PAGES = true;

import { W, H, clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, texSize, win, desk, edgeIn, loadPaper, findPhrase, camAt, sheet, onSheet,
  highlight, arcPose, sayP, slab, contactShadow, tag, blankPage, endCard, endCardPose, standIn, masked,
} from '/engine/folio.js';
import { PAL, MODELS, T1, EXT } from './_data.js';

const S = {
  // timeline (ILLUSTRATIVE spacing)
  feb: '\\text{Feb 2023}', mar: '\\text{Mar 2023}', jul: '\\text{Jul 2023}',
  // cards: our type, the sources' words (EXT, briefing facts table)
  annH: `\\text{${EXT.announce.who}}\\;\\cdot\\;\\text{${EXT.announce.date}}`,
  annQ1: "\\text{``noncommercial license focused}",
  annQ2: "\\text{on research use cases''}",
  access: '\\text{access by application, case by case}',
  alpH: `\\text{Alpaca}\\;\\cdot\\;\\text{${EXT.alpaca.who}}\\;\\cdot\\;\\text{${EXT.alpaca.date}}`,
  alpF1: '\\text{fine-tuned from LLaMA 7B,}',
  alpF2: '\\text{52K demonstrations}',
  alpQ1: "\\text{``Alpaca is based on LLaMA,}",
  alpQ2: "\\text{which has a non-commercial license''}",
  reqH: `\\text{${EXT.requests.who}}\\;\\cdot\\;\\text{${EXT.requests.date}}`,
  reqQ1: "\\text{``more than 100,000}",
  reqQ2: "\\text{requests for access''}",
  freeQ1: "\\text{``free for research}",
  freeQ2: "\\text{and commercial use''}",
  l2H: `\\text{Llama 2}\\;\\cdot\\;\\texttt{${EXT.llama2.id}}`,
  l2Range: '7\\text{B to }70\\text{B}',
  // stamp-area source labels
  srcMeta: '\\texttt{ai.meta.com/blog}', srcCrfm: '\\texttt{crfm.stanford.edu}', srcL2: `\\texttt{${EXT.llama2.id}}`,
  // end card (CC BY 4.0: credit, source link, licence link, changes made)
  t1: '\\text{LLaMA: Open and Efficient}',
  t2: '\\text{Foundation Language Models}',
  // "Rozière": every TeX accent route draws the grave about four times too tall (see the report), so the prompt's
  // fallback: the full author list goes in the description.
  au: '\\text{Touvron et al. (14 authors), Meta AI}',
  venue: '\\text{arXiv preprint, 2023}\\;\\cdot\\;\\texttt{arXiv:2302.13971v1}',
  url: '\\texttt{arxiv.org/abs/2302.13971}',
  cc1: '\\text{CC BY 4.0 (creativecommons.org/licenses/by/4.0)}',
  cc2: '\\text{pages shown with highlights, crops and 3D adaptations}',
};

// ── world layout (desk px) ──
const RY = 640;                                                     // the timeline rule
const MX = { feb: 400, mar: 720, jul: 2000 };                       // ILLUSTRATIVE: one month = 320 px
const RULE = { x0: 110, x1: 2500 };
const SLAB = { k: 2.2, d: 90, gap: 126, y: RY - 52 };               // the cover's slabs: 2.2 world px per billion, 90 footprint, 36 apart
const slabX = (i) => MX.feb - 40 + (i - 1.5) * SLAB.gap;
const M7_AT = { x: MX.mar + 40, y: SLAB.y };                          // where the 7B slab lands
const M7_HOVER = 175;                                                // above the 65B slab (143) while it travels
const CARD = { px: 1100, w: 420, tilt: 0.62, back: RY - 235 };      // typed cards: page px wide, world width, lean
const CARDS = {
  ann: { x: 330, hpx: 700 },
  alp: { x: 925, hpx: 820 },
  req: { x: 1790, hpx: 820 },
  l2: { x: 2215, hpx: 250 },
};
const BRACKET = { x: 2215, y: RY - 52 };                             // 7B to 70B, on the slabs' height scale, in front of the Llama 2 card
const EMAILS = [{ x0: 683, y0: 2063, x1: 812, y1: 2091 }, { x0: 194, y0: 2091, x1: 748, y1: 2118 }];   // p. 1 footnote e-mails, painted out as in the cover
const RODS = { x0: 175, k: 240, y: RY + 96, lane: 24 };               // s4 token bars: world px per trillion tokens
const MINI = { x: 590, y: RY + 132, s: 92, h: 84 };                  // data block miniature (segment 3's 460 × 420, scaled 0.2), in front of the rule

let p1, L;

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [1]);
    p1 = PAGES ? masked(P.page(1), EMAILS, { pad: 1 }) : standIn(P.page(1));
    L = {
      title: findPhrase(p1, 'LLaMA: Open and Efficient Foundation Language Models'),
      meta: findPhrase(p1, 'Meta AI'),
    };
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      ann: q.w(0, "Meta's"), noncom: q.w(0, 'non-commercial'), granted: q.w(0, 'granted'), e0: q.e(0),
      s1: q.s(1),
      s2: q.s(2), stanford: q.w(2, "Stanford's"), fine: q.w(2, 'fine-tuned'), model: q.w(2, 'model'), inherited: q.w(2, 'inherited'),
      s3: q.s(3), july: q.w(3, 'July'), more: q.w(3, 'more'), released: q.w(3, 'released'), seven: q.w(3, 'seven'), free: q.w(3, 'free'),
      s4: q.s(4), smaller: q.w(4, 'Smaller'), trained: q.w(4, 'trained'), public: q.w(4, 'public'), handed: q.w(4, 'handed'), e4: q.e(4),
      s5: q.s(5), s6: q.s(6), meta: q.w(6, 'Meta'), twenty: q.w(6, 'twenty'), s7: q.s(7), paper: q.w(7, 'paper'),
    };
    T.clear = T.s5 - 0.65;                                           // the timeline slides off the desk

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    const C = camAt(t, [
      { t: 0, tx: 440, ty: 420, zoom: 1.5, pitch: 0.62, dist: 3600 },                    // Feb: slabs + announcement (flatter lens)
      { t: 0.8, dur: 6.2, tx: 470, zoom: 1.56 },
      { t: T.s1 - 0.1, dur: 1.5, tx: 640, ty: 420, zoom: 1.42 },                         // Feb + Mar
      { t: T.inherited - 0.2, dur: 2.6, tx: 660, zoom: 1.45 },
      { t: T.s3 - 0.25, dur: 1.7, tx: 1990, ty: 420, zoom: 1.45 },                       // Jul
      { t: T.released - 0.2, dur: 5.0, tx: 2020, zoom: 1.48 },
      { t: T.s4 - 0.2, dur: 1.5, tx: 1290, ty: 470, zoom: 0.76, pitch: 0.66, cy: 560 },  // the whole timeline
      { t: T.s4 + 1.4, dur: 3.2, tx: 1270, zoom: 0.78 },
      { t: T.clear + 0.05, dur: 1.1, tx: 960, ty: 540, zoom: 1, pitch: 0.15, cy: 540, dist: 2400 },   // end card
    ]);

    const gx = 2900 * e(t, T.clear, 0.95, ease.inCubic);             // the whole timeline group slides off to the right
    if (gx < 2900) timeline(ctx, C, t, T, gx);
    ending(ctx, C, t, T, env);

    // the stamp area: the source of the card in focus (external: a label, not a page thumbnail)
    const srcs = [
      [T.ann + 0.3, T.stanford - 0.1, S.srcMeta],
      [T.stanford, T.s3 + 0.2, S.srcCrfm],
      [T.july, T.released - 0.05, S.srcMeta],
      [T.released, T.free - 0.05, S.srcL2],
      [T.free, T.s4 + 0.1, S.srcMeta],
      [T.handed, T.clear, S.srcMeta],
    ];
    for (const [a, b, src] of srcs) {
      const al = win(t, a, b, 0.2, 0.2);
      if (al > 0) tag(ctx, src, W - 56, H - 60, { size: 32, color: F.ink2, align: 'right', valign: 'bottom', alpha: al });
    }
  },
};

// ── helpers ──
function fit(src, size, maxW) { return Math.min(size, maxW / texSize(src, 1).w); }
function cardPose(c, hpx, p, gx, from) {
  const w = CARD.w, h = hpx * w / CARD.px;
  const to = { x: c.x + gx, y: CARD.back - h / 2, z: 0, w, tilt: CARD.tilt };
  if (p >= 1) return to;
  const f = from || { x: to.x + 180, y: to.y - 380, z: 260, w, tilt: 0.15, rot: 0.18 };
  return arcPose(f, to, ease.inOutCubic(clamp(p)), 160);
}
/** a typed card: header + lines, in page px, each line with its own write progress */
function typedCard(key, hpx, header, wHead, lines, foot) {
  const M = 64, maxW = CARD.px - 2 * M;
  return blankPage(key, CARD.px, hpx, (g) => {
    if (foot && foot.w > 0) {
      // a small tag printed on the card's foot: a tinted slip with the text, so it scales with the card
      const fs = fit(foot.tex, 60, maxW - 40), sz = texSize(foot.tex, fs);
      g.save(); g.globalAlpha = clamp(foot.w * 3); g.fillStyle = F.block; g.strokeStyle = F.rule; g.lineWidth = 2;
      g.beginPath(); g.roundRect(M - 6, hpx - 52 - sz.h - 26, sz.w + 40, sz.h + 34, 12); g.fill(); g.stroke(); g.restore();
      drawTex(g, foot.tex, M + 14, hpx - 52 - 14, { size: fs, color: F.ink, valign: 'bottom', write: foot.w });
    }
    const hs = fit(header, 68, maxW);
    drawTex(g, header, M, 108, { size: hs, color: F.ink, write: wHead });
    if (wHead > 0) {
      g.strokeStyle = F.rule; g.lineWidth = 3;
      g.beginPath(); g.moveTo(M, 150); g.lineTo(M + maxW * clamp(wHead * 1.4), 150); g.stroke();
    }
    let y = 250;
    for (const Ln of lines) {
      if (Ln.gap) y += Ln.gap;
      const s = fit(Ln.tex, Ln.size ?? 74, maxW);
      if (Ln.w > 0) drawTex(g, Ln.tex, M, y, { size: s, color: Ln.color ?? F.ink, write: Ln.w });
      y += (Ln.size ?? 74) * 1.32;
    }
  }, { scale: 0.75 });
}
function cardOutline(ctx, C, page, pose, a, color = F.ink, width = 2.4) {
  if (a <= 0) return;
  const Q = [[0, 0], [page.w, 0], [page.w, page.h], [0, page.h]].map(([u, v]) => onSheet(C, page, pose, u, v));
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round';
  ctx.beginPath(); Q.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.stroke(); ctx.restore();
}
const pulse = (t, t0, amp = 1, dur = 0.55) => Math.sin(Math.PI * clamp((t - t0) / dur)) * amp;

// ── s0–s4: the timeline ──
function timeline(ctx, C, t, T, gx) {
  const recap = e(t, T.s4 - 0.2, 0.6);                               // s4: cards dim, then the Feb card brightens
  const febBright = e(t, T.handed - 0.05, 0.5);

  // the rule and its three ticks
  const rp = e(t, 0.1, 1.2, ease.inOutCubic);
  if (rp > 0) {
    const a = C.p(RULE.x0 + gx, RY, 0), b = C.p(lerp(RULE.x0, RULE.x1, rp) + gx, RY, 0);
    ctx.save(); ctx.strokeStyle = F.ink2; ctx.lineCap = 'round'; ctx.lineWidth = 3 * a.k;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    [['feb', S.feb], ['mar', S.mar], ['jul', S.jul]].forEach(([k, src]) => {
      const x = MX[k] + gx, f = clamp((lerp(RULE.x0, RULE.x1, rp) - MX[k]) / 60);
      if (f <= 0) return;
      const u = C.p(x, RY - 14, 0), d = C.p(x, RY + 14, 0);
      ctx.lineWidth = 3 * u.k; ctx.globalAlpha = f * ctx.globalAlpha;
      ctx.beginPath(); ctx.moveTo(u.x, u.y); ctx.lineTo(d.x, d.y); ctx.stroke();
      const l = C.p(x, RY + 26, 0);
      drawTex(ctx, src, l.x, l.y, { size: 36, color: F.ink2, align: 'center', valign: 'top', write: f });
      ctx.globalAlpha /= f;
    });
    ctx.restore();
  }

  // ── cards (back to front: they all stand on the same line, so left to right) ──
  // Feb: the announcement
  const pAnn = e(t, T.ann - 0.1, 1.0, ease.linear);
  if (pAnn > 0) {
    const card = typedCard('a08-ann', CARDS.ann.hpx, S.annH, e(t, T.ann + 0.5, 0.9, ease.linear), [
      { tex: S.annQ1, w: e(t, T.noncom - 0.05, 0.9, ease.linear) },
      { tex: S.annQ2, w: e(t, T.noncom + 0.55, 0.9, ease.linear) },
    ], { tex: S.access, w: e(t, T.granted, 1.0, ease.linear) });
    const pose = cardPose(CARDS.ann, CARDS.ann.hpx, pAnn, gx);
    const al = 1 - 0.45 * recap * (1 - febBright);
    sheet(ctx, C, card, pose, { grid: 6, shadow: 0.5, alpha: al });
    cardOutline(ctx, C, card, pose, febBright * (1 - e(t, T.clear - 0.3, 0.3)), F.ink, 2.6);
  }
  // Mar: Alpaca
  const pAlp = e(t, T.stanford - 0.15, 1.0, ease.linear);
  let alpCard = null, alpPose = null;
  if (pAlp > 0) {
    alpCard = typedCard('a08-alp', CARDS.alp.hpx, S.alpH, e(t, T.stanford + 0.4, 0.9, ease.linear), [
      { tex: S.alpF1, size: 66, color: F.ink2, w: e(t, T.fine + 0.2, 0.8, ease.linear) },
      { tex: S.alpF2, size: 66, color: F.ink2, w: e(t, T.fine + 0.7, 0.7, ease.linear) },
      { tex: S.alpQ1, gap: 14, w: e(t, T.inherited + 0.75, 0.8, ease.linear) },
      { tex: S.alpQ2, w: e(t, T.inherited + 1.15, 0.9, ease.linear) },
    ]);
    alpPose = cardPose(CARDS.alp, CARDS.alp.hpx, pAlp, gx);
    sheet(ctx, C, alpCard, alpPose, { grid: 6, shadow: 0.5, alpha: 1 - 0.45 * recap });
  }
  // Jul: Meta's count and the Llama 2 paper
  const pReq = e(t, T.july - 0.1, 1.0, ease.linear);
  if (pReq > 0) {
    const card = typedCard('a08-req', CARDS.req.hpx, S.reqH, e(t, T.july + 0.45, 0.9, ease.linear), [
      { tex: S.reqQ1, w: e(t, T.more, 0.8, ease.linear) },
      { tex: S.reqQ2, w: e(t, T.more + 0.75, 0.9, ease.linear) },
      { tex: S.freeQ1, gap: 14, w: e(t, T.free - 0.05, 0.8, ease.linear) },
      { tex: S.freeQ2, w: e(t, T.free + 0.6, 0.9, ease.linear) },
    ]);
    sheet(ctx, C, card, cardPose(CARDS.req, CARDS.req.hpx, pReq, gx), { grid: 6, shadow: 0.5, alpha: 1 - 0.45 * recap });
  }
  const pL2 = e(t, T.released - 0.1, 1.0, ease.linear);
  if (pL2 > 0) {
    const card = typedCard('a08-l2', CARDS.l2.hpx, S.l2H, e(t, T.released + 0.35, 0.9, ease.linear), []);
    sheet(ctx, C, card, cardPose(CARDS.l2, CARDS.l2.hpx, pL2, gx), { grid: 4, shadow: 0.5, alpha: 1 - 0.45 * recap });
  }

  // ── 3D on the rule: slabs, token rods, data miniature, the 7B to 70B bracket ──
  const items = [];
  const rise = e(t, 0.35, 0.9, ease.outCubic);
  const lit = pulse(t, T.smaller - 0.05, 1, 0.9);
  const rods = e(t, T.trained - 0.05, 0.7, ease.inOutCubic);
  MODELS.forEach((m, i) => {
    const h = m.params * SLAB.k * rise;
    let x = slabX(i), y = SLAB.y, z = 0;
    if (m.key === 'm7') {
      // s1: lifts clear of its neighbours and travels towards Mar, hovering; s2: lands at Mar on "fine-tuned"
      const up = e(t, T.s1 - 0.1, 0.55, ease.outCubic), a = e(t, T.s1 + 0.25, 1.2, ease.inOutCubic);
      const b = e(t, T.fine - 0.1, 0.8, ease.inOutCubic);
      x = lerp(lerp(slabX(0), M7_AT.x - 60, a), M7_AT.x, b);
      z = (M7_HOVER * up + Math.sin((t - T.s1) * 2.4) * 6 * up) * (1 - b);
    }
    x += gx;
    const hop = lit * 16;
    const box = { x0: x - SLAB.d / 2, x1: x + SLAB.d / 2, y0: y - SLAB.d / 2, y1: y + SLAB.d / 2, z0: z + hop, z1: z + hop + Math.max(1, h) };
    items.push({
      d: C.p(x, y, h / 2).depth,
      draw: () => {
        if (z + hop > 2) contactShadow(ctx, C, { x0: box.x0, y0: box.y0, x1: box.x1, y1: box.y1 }, { z: z + hop, alpha: 0.5 });
        slab(ctx, C, box, { fill: m.fill, stroke: m.color, width: 2 + 1.6 * lit, alpha: clamp(rise * 3) });
        if (m.key === 'm7') {
          // ILLUSTRATIVE fine-tuned layer: a thin neutral slab settles on top
          const fl = e(t, T.model - 0.1, 0.8, ease.outCubic);
          if (fl > 0) {
            const zt = box.z1 + 2 + 50 * (1 - fl);
            slab(ctx, C, { x0: box.x0 + 2, x1: box.x1 - 2, y0: box.y0 + 2, y1: box.y1 - 2, z0: zt, z1: zt + 7 }, { fill: PAL.otherFill, stroke: F.ink2, width: 1.8, alpha: clamp(fl * 3) });
          }
        }
      },
    });
    // s4 "trained longer": four thin token bars in lanes in front of the rule, length ∝ tokens (1.0T / 1.0T / 1.4T /
    // 1.4T, segment 2's bar language), each in its model's colours
    if (rods > 0) {
      const L = m.tokensT * RODS.k * clamp(rods * 1.25 - i * 0.08);
      const yc = RODS.y + i * RODS.lane;
      const rb = { x0: RODS.x0 + gx, x1: RODS.x0 + gx + Math.max(1, L), y0: yc - 7, y1: yc + 7, z0: 0, z1: 6 };
      if (L > 0) items.push({ d: C.p(rb.x0, yc, 3).depth, draw: () => slab(ctx, C, rb, { fill: m.fill, stroke: m.color, width: 1.6 }) });
    }
  });
  // s4 "on public data": a miniature of segment 3's data block (Table 1 proportions, layers in their colours)
  const mini = e(t, T.public - 0.1, 0.7, ease.outCubic);
  if (mini > 0) {
    let z0 = 0;
    const s = MINI.s / 2;
    for (const r of T1.rows) {
      const th = r.prop / 100 * MINI.h * mini;
      const zz = z0;
      items.push({ d: C.p(MINI.x + gx, MINI.y, zz).depth - zz * 0.001, draw: () => slab(ctx, C, { x0: MINI.x + gx - s, x1: MINI.x + gx + s, y0: MINI.y - s, y1: MINI.y + s, z0: zz, z1: zz + Math.max(0.6, th) }, { fill: PAL[r.key], stroke: F.ink, width: 1.1 }) });
      z0 += th;
    }
  }
  items.sort((a, b) => b.d - a.d).forEach((it) => it.draw());

  // the Llama 2 range: a neutral bracket on the slabs' height scale (no slabs: these are different models)
  const br = e(t, T.seven - 0.1, 0.9, ease.inOutCubic);
  if (br > 0) {
    const x = BRACKET.x + gx, y = BRACKET.y;
    const z7 = 7 * SLAB.k, z70 = lerp(z7, 70 * SLAB.k, br);
    const A = C.p(x, y, z7), B = C.p(x, y, z70), A2 = C.p(x - 22, y, z7), B2 = C.p(x - 22, y, z70), G = C.p(x, y, 0);
    ctx.save();
    ctx.strokeStyle = F.ink2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.setLineDash([4, 6]); ctx.lineWidth = 1.6 * G.k;
    ctx.beginPath(); ctx.moveTo(G.x, G.y); ctx.lineTo(A.x, A.y); ctx.stroke();      // up from the desk to 7B
    ctx.setLineDash([]); ctx.lineWidth = 3.6 * A.k;
    ctx.beginPath(); ctx.moveTo(A2.x, A2.y); ctx.lineTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(B2.x, B2.y); ctx.stroke();
    ctx.restore();
    const m = C.p(x - 30, y, (z7 + 70 * SLAB.k) / 2);
    tag(ctx, S.l2Range, m.x, m.y, { size: 40, align: 'right', valign: 'middle', write: e(t, T.seven + 0.3, 0.8, ease.linear) });
  }

  // s2 "inherited the non-commercial license": the Feb quote ghosts across to the Alpaca card
  const gh = e(t, T.inherited - 0.05, 1.1, ease.inOutCubic);
  if (gh > 0 && gh < 1 && alpCard) {
    const annPose = cardPose(CARDS.ann, CARDS.ann.hpx, 1, gx);
    const at = (pose, page, v) => {
      const a = onSheet(C, page, pose, 64, v), b = onSheet(C, page, pose, 164, v);
      return { x: a.x, y: a.y, s: Math.hypot(b.x - a.x, b.y - a.y) / 100 };
    };
    const ann = { w: CARD.px, h: CARDS.ann.hpx };
    const a1 = at(annPose, ann, 250), b1 = at(alpPose, alpCard, 250 + 66 * 1.32 * 2 + 14);
    const x = lerp(a1.x, b1.x, gh), y = lerp(a1.y, b1.y, gh) - Math.sin(Math.PI * gh) * 50, s = lerp(a1.s, b1.s, gh);
    const al = 0.55 * Math.sin(Math.PI * gh);
    drawTex(ctx, S.annQ1, x, y, { size: fit(S.annQ1, 74, CARD.px - 128) * s, color: F.ink2, alpha: al });
    drawTex(ctx, S.annQ2, x, y + 74 * 1.32 * s, { size: fit(S.annQ2, 74, CARD.px - 128) * s, color: F.ink2, alpha: al });
  }
}

// ── s5–s7: the end card ──
function ending(ctx, C, t, T, env) {
  const pc = (t - (T.s5 - 0.45)) / 5.0;
  if (pc <= 0) return;
  const X0 = 920, Y0 = 250, GAP = 18, MAXW = 1880 - X0;
  const tsz = Math.min(58, MAXW / texSize(S.t1, 1).w, MAXW / texSize(S.t2, 1).w);
  endCard(ctx, C, p1, pc, { lines: [{ tex: S.t1, size: tsz, color: F.ink }, { tex: S.t2, size: tsz, color: F.ink }], x: X0, y: Y0, gap: GAP });
  const EP = endCardPose(pc);
  highlight(ctx, C, p1, EP, L.title, sayP(env, 5, t), { color: F.hlYellow });
  highlight(ctx, C, p1, EP, L.meta, e(t, T.meta - 0.05, 0.5, ease.linear), { color: F.hlMint });
  // the rest of the citation, same line layout as endCard, timed to the voice
  let yy = Y0;
  for (const s of [tsz, tsz]) yy += s * 0.9 + GAP + s * 0.25;
  yy += 14;
  const asz = Math.min(38, MAXW / texSize(S.au, 1).w);
  const csz = Math.min(32, MAXW / texSize(S.cc1, 1).w, MAXW / texSize(S.cc2, 1).w);
  const rest = [
    { src: S.au, size: asz, color: F.ink2, w: e(t, T.s6 - 0.05, 1.1, ease.linear) },
    { src: S.venue, size: 34, color: F.ink2, w: e(t, T.twenty - 0.1, 0.8, ease.linear), pre: 6 },
    { src: S.url, size: 34, color: F.blue, w: e(t, T.twenty + 0.55, 0.8, ease.linear) },
    { src: S.cc1, size: csz, color: F.ink2, w: e(t, T.twenty + 1.0, 0.8, ease.linear), pre: 12 },
    { src: S.cc2, size: csz, color: F.ink2, w: e(t, T.twenty + 1.35, 0.8, ease.linear) },
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
    const w = texSize(S.url, 34).w;
    ctx.save(); ctx.strokeStyle = F.blue; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(X0, urlY + 10); ctx.lineTo(X0 + w * ul, urlY + 10); ctx.stroke(); ctx.restore();
  }
}
