// machine — p. 3, Section 2.2: "the network is a transformer, with three changes". The paper has no
// architecture figure, so our own flat schematic of one transformer layer lies beside the page (tagged
// "schematic, ours") with three dashed slots. It stands up into 3D and each change snaps in with its
// bracket source while its paragraph, lifted off p. 3, stands at the back: pre-normalization [GPT3],
// SwiGLU [PaLM], rotary embeddings [GPTNeo]. Then Table 2 lifts off and the layer becomes four towers,
// one slab per layer (32 / 40 / 60 / 80). Then p. 4, Section 2.4: 2048 tiles for the A100s in front of the
// 65B tower, a ripple for 380 tokens/s per GPU, and a row of 21 day cells.
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, desk, edgeIn, loadPaper, findPhrase, camAt, sheet, sheetPt, highlight, markBox,
  liftPose, arcPose, slab, prism, arrow3, contactShadow, tag, cite, sayWords, standIn, blankPage, win, hexA, mix,
} from '/engine/folio.js';
import { PAL, MODELS, T2, P3, TRAIN65, GPU_GRID } from './_data.js';

// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars) and redrawn figures.
const PAGES = true;

const S = {
  c22: '\\text{p.~3}\\;\\cdot\\;\\text{Section 2.2}',
  cT2: '\\text{p.~3}\\;\\cdot\\;\\text{Table 2}',
  c24: '\\text{p.~4}\\;\\cdot\\;\\text{Section 2.4}',
  ours: '\\text{schematic, ours}',
  input: '\\text{input}', output: '\\text{output}', attn: '\\text{attention}', ffn: '\\text{feed-forward}',
  norm: '\\text{norm}', pos: '\\text{position}', act: '\\text{activation}', plus: '+',
  rms: '\\text{RMSNorm}\\;\\;[\\text{GPT3}]',
  relu: '\\text{ReLU}', swiglu: '\\text{SwiGLU}\\;\\;[\\text{PaLM}]',
  absPos: '\\text{absolute positions}', rope: '\\text{rotary, at each layer}\\;\\;[\\text{GPTNeo}]',
  towers: '\\text{one slab per layer, width} \\propto \\text{dimension}',
  gpus: '2048 \\times \\text{A100 (80GB)}', layout: '\\text{one tile per GPU, layout ours}',
  rate: '\\approx 380\\ \\text{tokens/s per GPU}', tok: '1.4\\text{T tokens}', days: '\\approx 21\\ \\text{days}',
};
const NAMES = MODELS.map((m) => `\\text{${m.short}}`);
const COUNTS = MODELS.map((m) => `${m.layers}`);

// ── pages (page px) ─────────────────────────────────────────────────────────
const P3P = { x: 500, y: 640, w: 900, rot: -0.01 };          // p. 3 on the desk, left
const P4P = { x: 470, y: 700, w: 900, rot: 0.012 };           // p. 4 slides in for s5
const pad = (r, px = 6, py = 4) => ({ x0: r.x0 - px, y0: r.y0 - py, x1: r.x1 + px, y1: r.y1 + py });
const PARA = { pre: pad(P3.preNorm, 4, 2), swi: { ...pad(P3.swiglu, 4, 2), y1: 1488 }, rope: pad(P3.rope, 4, 2) };   // swi stops before the 2/3·4d line
const TAB2 = { x0: T2.box.x0 - 6, y0: T2.box.y0 - 4, x1: T2.box.x1 + 6, y1: T2.caption.y1 + 6 };
const TRN = pad(TRAIN65.para, 4, 2);

// ── our schematic of one transformer layer (sheet px, 900 × 1000; flow bottom → top) ─────────────
const SCH = { w: 900, h: 1000 };
const BOX = {
  pos: { x0: 340, y0: 888, x1: 540, y1: 948 },
  norm1: { x0: 290, y0: 803, x1: 590, y1: 845 },
  attn: { x0: 260, y0: 650, x1: 620, y1: 770 },
  post1: { x0: 290, y0: 524, x1: 590, y1: 556 },
  norm2: { x0: 290, y0: 463, x1: 590, y1: 505 },
  ffn: { x0: 260, y0: 300, x1: 620, y1: 430 },
  act: { x0: 655, y0: 330, x1: 865, y1: 400 },
  post2: { x0: 290, y0: 168, x1: 590, y1: 200 },
};
const ADD = [{ x: 440, y: 590, r: 22 }, { x: 440, y: 240, r: 22 }];
const BP = { x: 1190, y: 670, w: 420, rot: 0 };               // the blueprint on the desk
const PLATE = { x0: 250, y0: 215, x1: 630, y1: 860 };          // footprint of the layers stacked above (s3)

// ── towers (s4) and the GPU grid (s5–s6), world px ──────────────────────────
const TW = { y: 640, d: 120, slab: 3, gap: 1 };
const TX = [800, 1010, 1255, 1535];
const towerW = (m) => 220 * m.dim / 8192;
const GRID = { cx: 1230, y0: 700, tile: 10, gap: 2 };          // 64 × 32 tiles, front edge at y0 + 32·12

let p3, p4, L;

export default {
  async setup(env) {
    await loadB1B();
    [...Object.values(S), ...NAMES, ...COUNTS].forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [3, 4]);
    p3 = PAGES ? P.page(3) : standIn(P.page(3), { blank: [T2.box], draw: typesetT2 });   // Table 2 retypeset from _data.js
    p4 = PAGES ? P.page(4) : standIn(P.page(4));
    L = {
      transformer: findPhrase(p3, 'our network is based on the transformer architec- ture'),
      bracket: findPhrase(p3, '(in bracket)'),
      preHead: findPhrase(p3, 'Pre-normalization [GPT3].'),
      preBody: findPhrase(p3, 'we normalize the input of each transformer sub-layer, instead of normalizing the output'),
      rms: findPhrase(p3, 'RMSNorm'),
      swiHead: findPhrase(p3, 'SwiGLU activation function [PaLM].'),
      swiBody: findPhrase(p3, 'We re- place the ReLU non-linearity by the SwiGLU ac- tivation function'),
      ropeHead: findPhrase(p3, 'Rotary Embeddings [GPTNeo].'),
      rope: findPhrase(p3, 'rotary positional embeddings (RoPE)'),
      each: findPhrase(p3, 'at each layer of the network'),
      remove: findPhrase(p3, 'We remove the absolute positional embeddings'),
      t2cap: findPhrase(p3, 'Model sizes, architectures, and optimization hyper-parameters.'),
      nLayers: findPhrase(p3, 'n layers'),
      gpus: findPhrase(p4, '2048 A100 GPU with 80GB of RAM'),            // voice order: the GPUs first (s5)…
      rate: findPhrase(p4, 'processes around 380 tokens/sec/GPU on'),    // …then the rate (s6)
      days: findPhrase(p4, 'training over our dataset containing 1.4T tokens takes approximately 21 days'),
    };
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      net: q.w(0, 'the'), three: q.w(0, 'three'), named: q.w(0, 'named'), e0: q.e(0),
      s1: q.s(1), input: q.w(1, 'input'), instead: q.w(1, 'instead'), output: q.w(1, 'output'), rms: q.w(1, 'RMSNorm'),
      s2: q.s(2), swiglu: q.w(2, 'SwiGLU'), relu: q.w(2, 'ReLU'),
      s3: q.s(3), rotary: q.w(3, 'rotary'), at: q.w(3, 'at'), replacing: q.w(3, 'replacing'), e3: q.e(3),
      s4: q.s(4), four: q.w(4, 'four'), thirty: q.w(4, 'thirty-two'), eighty: q.w(4, 'eighty'),
      s5: q.s(5), two: q.w(5, 'two'), a100: q.w(5, 'A100'),
      s6: q.s(6), three6: q.w(6, 'three'), each6: q.we(6, 'each'), one6: q.w(6, 'one'), days: q.w(6, 'twenty-one'), end: q.e(6),
    };
    T.up = T.e0 - 0.15;   // the schematic stands up

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    const C = camAt(t, [
      { t: 0, tx: 760, ty: 680, pitch: 0.14, zoom: 1.42 },
      { t: 0.3, dur: 7, tx: 780, zoom: 1.5 },
      { t: T.up, dur: 1.7, tx: 1130, ty: 640, pitch: 0.9, zoom: 1.42, yaw: -0.12, cx: 1060 },
      { t: T.s1 + 2, dur: 11, yaw: -0.17, tx: 1140 },
      { t: T.at - 0.3, dur: 1.2, ty: 600, zoom: 1.32 },
      { t: T.e3 - 0.1, dur: 1.6, yaw: 0.1 },
      { t: T.s4 - 0.2, dur: 1.4, tx: 1170, ty: 470, pitch: 0.85, zoom: 1.0, yaw: -0.05, cx: 960 },
      { t: T.s4 + 1.4, dur: 2.6, yaw: -0.09 },
      { t: T.s5 - 0.1, dur: 1.6, tx: 1000, ty: 640, pitch: 0.82, zoom: 0.98, yaw: -0.06 },
      { t: T.s6, dur: 8, zoom: 1.01, yaw: -0.09 },
    ]);
    const face = -C.yaw;

    // ── p. 3: arrives, stays at the left; slides off when p. 4 comes ──
    const p3In = e(t, 0, 1.1, ease.outCubic), p3Out = e(t, T.s5 - 0.2, 1.2, ease.inCubic);
    const p3Back = e(t, T.up, 1.4, ease.inOutCubic);   // makes room for the 3D layer: slides left
    const P3B = { ...P3P, x: P3P.x - 330 * p3Back, y: P3P.y - 120 * p3Back };
    const p3pose = arcPose(arcPose({ ...P3P, x: P3P.x - 300, y: P3P.y + 1000, rot: -0.15 }, P3B, p3In, 150), { ...P3B, x: -1200, rot: -0.3 }, p3Out, 80);
    if (p3Out < 1) {
      sheet(ctx, C, p3, p3pose);
      highlight(ctx, C, p3, p3pose, L.transformer, sayWords(env, 0, 4, 8, t), { color: F.hlMint });
      highlight(ctx, C, p3, p3pose, L.bracket, sayWords(env, 0, 18, 20, t), { color: F.hlMint });
    }

    // ── the blueprint (our schematic) ──
    const bIn = e(t, 0.35, 1.1, ease.outCubic), bOut = e(t, T.s4, 1.0, ease.inCubic);
    const bpose = arcPose(arcPose({ ...BP, x: BP.x + 900, rot: 0.2 }, BP, bIn, 140), { ...BP, x: BP.x + 1400, y: BP.y - 200, rot: 0.25 }, bOut, 90);
    const pulse = t > T.three && t < T.three + 1.3 ? Math.sin(Math.PI * (t - T.three) / 1.3) : 0;
    const sch = blankPage('llama-machine-schematic', SCH.w, SCH.h, (g) => drawSchematic(g, { pulse, preIn: e(t, T.input, 0.6) }), { scale: 0.75 });
    if (bIn > 0 && bOut < 1) sheet(ctx, C, sch, bpose, { grid: 4 });

    // world footprint of a sheet-px rect on the blueprint (axis-aligned: the blueprint has rot 0 at rest)
    const W0 = (u, v) => sheetPt(sch, bpose, u, v);
    const foot = (r) => { const a = W0(r.x0, r.y0), b = W0(r.x1, r.y1); return { x0: a[0], y0: a[1], x1: b[0], y1: b[1] }; };

    // ── the layer in 3D (s0 end → s3), and its two ghost copies above it (s3 "at each layer") ──
    // Parts are drawn storey by storey, each storey back to front (the camera looks along −y).
    const up = (k) => e(t, T.up + 0.2 + k * 0.12, 0.7, ease.outCubic) * (1 - e(t, T.s4 + 0.1, 0.7, ease.inCubic));
    const preIn = e(t, T.input - 0.1, 0.7, ease.outCubic);
    const ghostPost = e(t, T.instead, 0.6, ease.linear) * (1 - e(t, T.s2 - 0.2, 0.5, ease.linear));
    const strikePost = e(t, T.output - 0.4, 0.7, ease.inOutCubic);
    const actIn = e(t, T.s2 - 0.1, 0.6, ease.outCubic);
    const swi = e(t, T.swiglu, 0.6, ease.inOutCubic);
    const dials = e(t, T.rotary, 0.8, ease.outCubic);
    const storeys = e(t, T.at, 0.9, ease.outCubic);
    const absOut = e(t, T.replacing + 0.95, 1.0, ease.inCubic);   // read the strike first, then it leaves (front left)
    const layerA = up(0);
    if (bIn > 0.5 && layerA > 0) {
      const HT = { attn: 42, ffn: 42, norm: 12, add: 12, act: 14, pos: 8 };
      const parts = [];
      for (let st = 0; st < 1; st++) {
        const zb = 0, al = 1, real = true;
        const P = (o) => parts.push({ st, zb, al, real, ...o });
        if (real && absOut < 1) P({ k: 'pos', r: BOX.pos, h: HT.pos * up(0), fill: F.block, a: clamp(up(0) * 3) * (1 - absOut), dx: -560 * absOut, dz: Math.sin(Math.PI * absOut) * 140, dy: 260 * absOut });
        if (preIn > 0) for (const r of [BOX.norm1, BOX.norm2]) P({ k: 'norm', r, h: HT.norm, fill: PAL.norm, a: preIn, dx: -320 * (1 - preIn) });
        if (real && ghostPost > 0) for (const r of [BOX.post1, BOX.post2]) P({ k: 'post', r, h: HT.norm, fill: hexA(PAL.norm, 0.55), stroke: F.ink2, a: ghostPost, dz: 50 });   // hovering, so the taller blocks don't hide them
        P({ k: 'attn', r: BOX.attn, h: HT.attn * up(1), fill: PAL.attn, a: clamp(up(1) * 3), label: S.attn });
        ADD.forEach((c, i) => P({ k: 'add', c, r: { y0: c.y - c.r, y1: c.y + c.r }, h: HT.add * up(2 + 2 * i), a: clamp(up(2 + 2 * i) * 3) }));
        P({ k: 'ffn', r: BOX.ffn, h: HT.ffn * up(3), fill: PAL.ffn, a: clamp(up(3) * 3), label: S.ffn });
        if (actIn > 0) P({ k: 'act', r: BOX.act, h: HT.act * actIn, fill: mix(F.paper, PAL.ffn, swi), a: actIn });
      }
      parts.sort((u, v) => u.st - v.st || (u.r.y0 + u.r.y1) - (v.r.y0 + v.r.y1));
      for (const pt of parts) {
        const A = pt.a * pt.al;
        if (A <= 0 || pt.h <= 0.3) continue;
        if (pt.k === 'add') {
          const [x, y] = W0(pt.c.x, pt.c.y);
          prism(ctx, C, circle(x, y, pt.c.r * bpose.w / SCH.w), pt.zb, pt.zb + pt.h, { fill: F.paper, stroke: F.ink, width: 1.3, alpha: A });
          continue;
        }
        const f = foot(pt.r), dx = pt.dx || 0, dz = pt.dz || 0;
        const dy = pt.dy || 0, b = { x0: f.x0 + dx, x1: f.x1 + dx, y0: f.y0 + dy, y1: f.y1 + dy, z0: pt.zb + dz, z1: pt.zb + dz + pt.h };
        slab(ctx, C, b, { fill: pt.fill, stroke: pt.stroke || F.ink, width: 1.5, alpha: A });
        if (pt.k === 'post') arrow3(ctx, C, [[b.x0 - 10, (b.y0 + b.y1) / 2, b.z1 + 1], [b.x1 + 10, (b.y0 + b.y1) / 2, b.z1 + 1]], strikePost, { color: F.ink, width: 3.2, head: false, alpha: ghostPost });
        if (pt.k === 'attn' && dials > 0) [0.09, 0.91].forEach((u, i) => dial(ctx, C, lerp(b.x0, b.x1, u), (b.y0 + b.y1) / 2, b.z1 + 0.5, 11, dials * pt.al, 0.6 + i * 1.7));
        if (pt.label && pt.real) {
          const c = C.p((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, b.z1);
          drawTex(ctx, pt.label, c.x, c.y, { size: 26 * c.k, color: F.ink, align: 'center', valign: 'middle', alpha: clamp((pt.h / HT[pt.k] - 0.6) * 3) });
        }
      }
      // "at each layer": two more layers stack above it, drawn as thin translucent plates, each with its dial
      if (storeys > 0) {
        const f = foot(PLATE);
        for (let st = 1; st <= 2; st++) {
          const s = clamp(storeys * 2 - (st - 1)), z0 = lerp(HT.attn, HT.attn + 40 + (st - 1) * 70, ease.outCubic(s));
          if (s <= 0) continue;
          slab(ctx, C, { ...f, z0, z1: z0 + 8 }, { fill: hexA('#E9E6DF', 0.12), stroke: F.ink2, width: 1.3, alpha: s * (1 - e(t, T.s4 + 0.1, 0.6, ease.linear)) });
          const a = foot(BOX.attn);
          dial(ctx, C, lerp(a.x0, a.x1, 0.91), (a.y0 + a.y1) / 2, z0 + 8.5, 11, s * dials, 2.2 + st);
        }
      }
    }

    // ── the three paragraphs, lifted off p. 3 one at a time, standing at the back ──
    const STAND = { x: 700, y: 250, z: 0, w: 600, tilt: 0.9, rot: face, arc: 110 };
    const stripOf = (rect, t0, t1, draw) => {
      const lp = e(t, t0, 1.0, ease.linear), go = e(t, t1, 0.55, ease.inCubic);
      if (lp <= 0 || go >= 1) return;
      const pose = liftPose(p3, P3B, rect, { ...STAND, rot: face, y: STAND.y - 700 * go, z: 420 * go }, lp);
      sheet(ctx, C, p3, pose, { grid: 4, shadow: 0.5 });
      draw(pose);
    };
    stripOf(PARA.pre, T.s1 - 0.6, T.rms + 0.55, (ps) => {
      highlight(ctx, C, p3, ps, L.preHead, sayWords(env, 1, 0, 3, t), { color: F.hlMint });
      highlight(ctx, C, p3, ps, L.preBody, sayWords(env, 1, 4, 13, t), { color: F.hlMint });
      highlight(ctx, C, p3, ps, L.rms, e(t, T.rms, 0.5, ease.linear), { color: F.hlMint });
    });
    stripOf(PARA.swi, T.rms + 0.35, T.relu + 0.3, (ps) => {
      highlight(ctx, C, p3, ps, L.swiHead, sayWords(env, 2, 0, 1, t), { color: F.hlMint });
      highlight(ctx, C, p3, ps, L.swiBody, sayWords(env, 2, 3, 9, t), { color: F.hlMint });
    });
    stripOf(PARA.rope, T.relu + 0.15, T.s4 - 0.3, (ps) => {
      highlight(ctx, C, p3, ps, L.ropeHead, sayWords(env, 3, 0, 1, t), { color: F.hlMint });
      highlight(ctx, C, p3, ps, L.rope, sayWords(env, 3, 3, 5, t), { color: F.hlMint });
      highlight(ctx, C, p3, ps, L.each, sayWords(env, 3, 6, 8, t), { color: F.hlMint });
      highlight(ctx, C, p3, ps, L.remove, sayWords(env, 3, 9, 12, t), { color: F.hlMint });
    });

    // ── tags on the 3D layer ──
    const tagsA = 1 - e(t, T.s4, 0.5, ease.linear);
    if (bIn > 0.5 && layerA > 0 && tagsA > 0) {
      ctx.save(); ctx.globalAlpha *= tagsA;
      // RMSNorm [GPT3], left of the two norm slabs, with thin leaders to both
      const n1 = foot(BOX.norm1), n2 = foot(BOX.norm2);
      const rmsW = e(t, T.rms, 0.7, ease.linear);
      if (rmsW > 0) {
        const at = C.p(n1.x0 - 150, (n1.y0 + n2.y1) / 2, 30);
        const bx = tag(ctx, S.rms, at.x, at.y, { size: 34, align: 'right', valign: 'middle', write: rmsW });
        for (const n of [n1, n2]) { const a = C.p(n.x0, (n.y0 + n.y1) / 2, 8); leader(ctx, bx.x + bx.w + 2, at.y, a.x - 4, a.y, rmsW); }
      }
      // the activation chip: ReLU, struck on "ReLU"; SwiGLU [PaLM] written on "SwiGLU"
      if (actIn > 0) {
        const f = foot(BOX.act), a = C.p(f.x1 + 14, (f.y0 + f.y1) / 2, 18);
        const rb = tag(ctx, S.relu, a.x, a.y + 26, { size: 34, valign: 'middle', alpha: actIn * (1 - e(t, T.s3 - 0.3, 0.5, ease.linear)) });
        const st = e(t, T.relu, 0.4, ease.inOutCubic);
        if (st > 0 && t < T.s3 + 0.2) { ctx.save(); ctx.globalAlpha *= 1 - e(t, T.s3 - 0.3, 0.5, ease.linear); ctx.strokeStyle = F.ink; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(rb.x + 6, rb.y + rb.h / 2); ctx.lineTo(rb.x + 6 + (rb.w - 12) * st, rb.y + rb.h / 2); ctx.stroke(); ctx.restore(); }
        tag(ctx, S.swiglu, a.x, a.y - 30, { size: 34, valign: 'middle', write: swi });
      }
      // absolute positions (s3), struck while the voice says "replacing the absolute ones"
      const abA = e(t, T.s3, 0.5, ease.linear) * (1 - absOut);
      if (abA > 0) {
        const f = foot(BOX.pos), a = C.p(f.x1 + 14 - 560 * absOut, (f.y0 + f.y1) / 2 + 260 * absOut, 6 + Math.sin(Math.PI * absOut) * 140);
        const ab = tag(ctx, S.absPos, a.x, a.y, { size: 32, valign: 'middle', alpha: abA });
        const st = e(t, T.replacing, 0.6, ease.inOutCubic);
        if (st > 0) { ctx.save(); ctx.globalAlpha *= abA; ctx.strokeStyle = F.ink; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ab.x + 6, ab.y + ab.h / 2); ctx.lineTo(ab.x + 6 + (ab.w - 12) * st, ab.y + ab.h / 2); ctx.stroke(); ctx.restore(); }
      }
      // rotary, at each layer [GPTNeo], right of the attention slab
      if (dials > 0) {
        const f = foot(BOX.attn), a = C.p(f.x1 + 46, (f.y0 + f.y1) / 2, 30);
        tag(ctx, S.rope, a.x, a.y, { size: 34, valign: 'middle', write: dials });
      }
      ctx.restore();
    }
    // "schematic, ours", on the blueprint's front edge
    if (bIn > 0 && bOut < 1) {
      const a = C.p(...W0(SCH.w / 2, SCH.h + 6));
      tag(ctx, S.ours, a.x, a.y + 8, { size: 32, align: 'center', valign: 'top', color: F.ink2, alpha: clamp(bIn * 2) * (1 - bOut) });
    }

    // ── Table 2 (s4): lifts off p. 3 and stands at the back; towers rise, one slab per layer ──
    const t2p = e(t, T.s4 - 0.6, 1.1, ease.linear), t2Out = e(t, T.s5 - 0.1, 0.9, ease.inCubic);
    let t2pose = null;
    if (t2p > 0 && t2Out < 1) {
      t2pose = liftPose(p3, P3B, TAB2, { x: 1170, y: 60 - 600 * t2Out, z: 60 + 400 * t2Out, w: 1000, tilt: 0.85, rot: face, arc: 120 }, t2p);
      sheet(ctx, C, p3, t2pose, { grid: 6, shadow: 0.5 });
      highlight(ctx, C, p3, t2pose, L.t2cap, e(t, T.s4 + 0.25, 0.75, ease.linear), { color: F.hlMint });
      highlight(ctx, C, p3, t2pose, L.nLayers, sayWords(env, 4, 4, 5, t), { color: F.hlMint });
    }
    const rise = [e(t, T.four, T.thirty - T.four, ease.inOutCubic), e(t, T.thirty - 0.2, 0.75, ease.inOutCubic), e(t, T.thirty + 0.25, 0.75, ease.inOutCubic), e(t, T.eighty - 0.75, 0.75, ease.inOutCubic)];
    const towersOut = e(t, T.s5 - 0.1, 1.2, ease.inCubic);
    const t65 = e(t, T.s5, 1.4, ease.inOutCubic);   // the 65B tower moves behind the grid
    const T65 = { x: lerp(TX[3], GRID.cx + 330, t65), y: lerp(TW.y, GRID.y0 - 110, t65) };
    MODELS.forEach((m, i) => {
      const r = rise[i];
      if (r <= 0) return;
      const keep = i === 3;
      if (!keep && towersOut >= 1) return;
      const cx = keep ? T65.x : TX[i] - 1300 * towersOut, cy = keep ? T65.y : TW.y;
      const w = towerW(m), n = Math.round(m.layers * r), unit = TW.slab + TW.gap;
      contactShadow(ctx, C, { x0: cx - w / 2, x1: cx + w / 2, y0: cy - TW.d / 2, y1: cy + TW.d / 2 }, { alpha: clamp(r * 4) });
      for (let k = 0; k < n; k++) slab(ctx, C, { x0: cx - w / 2, x1: cx + w / 2, y0: cy - TW.d / 2, y1: cy + TW.d / 2, z0: k * unit, z1: k * unit + TW.slab }, { fill: m.fill, stroke: m.color, width: 0.7 });
      const lab = C.p(cx, cy + TW.d / 2 + 30, 0);
      tag(ctx, NAMES[i], lab.x, lab.y + 14, { size: 38, align: 'center', valign: 'top', color: m.color, alpha: clamp(r * 4) * (keep ? 1 - e(t, T.s5, 0.5, ease.linear) : 1) });
      if (keep && t65 > 0) {   // behind the grid, the 65B tower keeps its name on its left side
        const side = C.p(cx - w / 2 - 14, cy + TW.d / 2, 150);
        tag(ctx, NAMES[i], side.x, side.y, { size: 38, align: 'right', valign: 'middle', color: m.color, alpha: e(t, T.s5 + 1.2, 0.5, ease.linear) });
      }
      const cnt = C.p(cx + w / 2 + 12, cy + TW.d / 2, Math.max(0, n * unit - 14));
      const cw = i === 0 ? e(t, T.thirty, 0.5, ease.linear) : i === 3 ? e(t, T.eighty, 0.5, ease.linear) : clamp((r - 0.95) * 20);
      tag(ctx, COUNTS[i], cnt.x, cnt.y, { size: 40, valign: 'middle', color: F.ink, write: cw * (keep ? 1 - e(t, T.s5, 0.5, ease.linear) : 1) });
      if (t2pose) {
        const cellT = i === 0 ? T.thirty : i === 3 ? T.eighty : T.thirty + 0.3 + i * 0.35;
        const row = T2.rows[m.key];
        markBox(ctx, C, p3, t2pose, { x0: T2.cols.layers.x0 - 4, y0: row.y0, x1: T2.cols.layers.x1 + 4, y1: row.y1 }, e(t, cellT, 0.45, ease.inOutCubic), { color: F.ink, width: 2.6, pad: 0 });
      }
    });
    const twA = win(t, T.thirty, T.s5 - 0.1, 0.5, 0.4);
    if (twA > 0) { const a = C.p(1170, TW.y + TW.d / 2 + 140, 0); tag(ctx, S.towers, a.x, a.y, { size: 32, align: 'center', valign: 'middle', color: F.ink2, alpha: twA }); }

    // ── p. 4 (s5): slides in, Section 2.4's paragraph peels off and stands at the left ──
    const p4In = e(t, T.s5 - 0.25, 1.1, ease.outCubic), p4Out = e(t, T.s5 + 1.25, 1.0, ease.inCubic);
    const p4pose = arcPose(arcPose({ ...P4P, x: P4P.x - 500, y: P4P.y + 900, rot: -0.2 }, P4P, p4In, 150), { ...P4P, x: P4P.x - 1300, y: P4P.y + 400, rot: -0.3 }, p4Out, 80);
    if (p4In > 0 && p4Out < 1) sheet(ctx, C, p4, p4pose);
    const trP = e(t, T.s5 + 0.55, 1.3, ease.linear);
    if (trP > 0) {
      const tp = liftPose(p4, P4P, TRN, { x: 440, y: 470, z: 0, w: 680, tilt: 0.82, rot: face, arc: 200 }, trP);
      sheet(ctx, C, p4, tp, { grid: 4, shadow: 0.5 });
      highlight(ctx, C, p4, tp, L.gpus, sayWords(env, 5, 4, 9, t), { color: F.hlMint });
      highlight(ctx, C, p4, tp, L.rate, sayWords(env, 6, 2, 10, t), { color: F.hlMint });
      highlight(ctx, C, p4, tp, L.days, sayWords(env, 6, 11, 22, t), { color: F.hlMint });
    }

    // ── the GPU grid: 2048 tiles unroll row by row (front to back) ──
    const gp = e(t, T.two, q.we(5, 'GPUs') - T.two, ease.linear);
    if (gp > 0) gpuGrid(ctx, C, gp, t, T);
    if (gp > 0) {
      const gx0 = GRID.cx - (GPU_GRID.cols * (GRID.tile + GRID.gap)) / 2, gy1 = GRID.y0 + GPU_GRID.rows * (GRID.tile + GRID.gap);
      const a = C.p(gx0 - 24, GRID.y0 + 150, 0);
      const ga = tag(ctx, S.gpus, a.x, a.y, { size: 40, align: 'right', valign: 'middle', write: e(t, T.a100, 0.8, ease.linear) });
      tag(ctx, S.layout, ga.x + ga.w - 12, ga.y + ga.h + 14, { size: 30, align: 'right', valign: 'top', color: F.ink2, alpha: e(t, T.a100 + 0.5, 0.6, ease.linear) });
      const c = C.p(GRID.cx - 120, GRID.y0 - 70, 0);
      tag(ctx, S.rate, c.x, c.y, { size: 38, align: 'center', valign: 'middle', write: e(t, T.three6, 1.0, ease.linear) });
      const d = C.p(T65.x, T65.y, 80 * 4 + 40);
      tag(ctx, S.tok, d.x, d.y, { size: 40, align: 'center', valign: 'bottom', write: e(t, T.one6, 0.8, ease.linear) });
      // 21 day cells along the grid's front edge
      const dp = e(t, T.days, 0.8, ease.linear);
      if (dp > 0) {
        const span = GPU_GRID.cols * (GRID.tile + GRID.gap), cw = span / 21;
        for (let k = 0; k < 21; k++) {
          const f = clamp(dp * 21 - k);
          if (f <= 0) break;
          slab(ctx, C, { x0: gx0 + k * cw + 2, x1: gx0 + (k + 1) * cw - 2, y0: gy1 + 22, y1: gy1 + 22 + cw - 4, z0: 0, z1: 6 * f }, { fill: PAL.m65Fill, stroke: PAL.m65, width: 1.2, alpha: f });
        }
        const g = C.p(GRID.cx, gy1 + 22 + cw + 20, 0);
        tag(ctx, S.days, g.x, g.y, { size: 42, align: 'center', valign: 'top', write: e(t, T.days + 0.3, 0.7, ease.linear) });
      }
    }

    // ── source stamp ──
    let cp = p3, label = S.c22, rect = P3.arch;
    if (t >= T.s1 - 0.2 && t < T.s2 - 0.3) rect = P3.preNorm;
    else if (t >= T.s2 - 0.3 && t < T.s3 - 0.3) rect = P3.swiglu;
    else if (t >= T.s3 - 0.3 && t < T.s4 - 0.1) rect = P3.rope;
    else if (t >= T.s4 - 0.1 && t < T.s5) { label = S.cT2; rect = TAB2; }
    else if (t >= T.s5) { cp = p4; label = S.c24; rect = TRAIN65.para; }
    cite(ctx, cp, { label, rect, alpha: e(t, 0.6, 0.6), side: t < T.up ? 'right' : 'left' });
  },
};

/** PAGES = false: Table 2 typeset in place on the stand-in (values as printed, from MODELS / T2 in _data.js) */
function typesetT2(g) {
  const c = T2.cols, mid = (k) => (c[k].x0 + c[k].x1) / 2, o = { size: 29, color: F.ink, align: 'center', valign: 'middle' };
  g.strokeStyle = F.ink; g.lineWidth = 2;
  for (const y of [199, 252, 414]) { g.beginPath(); g.moveTo(318, y); g.lineTo(1336, y); g.stroke(); }
  const hy = (T2.header.y0 + T2.header.y1) / 2;
  const head = { params: '\\text{params}', dimension: '\\text{dimension}', heads: 'n\\ \\text{heads}', layers: 'n\\ \\text{layers}', lr: '\\text{learning rate}', batch: '\\text{batch size}', tokens: 'n\\ \\text{tokens}' };
  for (const [k, src] of Object.entries(head)) drawTex(g, src, mid(k), hy, o);
  for (const m of MODELS) {
    const r = T2.rows[m.key], y = (r.y0 + r.y1) / 2;
    const [man, ex] = m.lr.split('e');
    const cells = { params: `${m.params.toFixed(1)}\\text{B}`, dimension: `${m.dim}`, heads: `${m.heads}`, layers: `${m.layers}`, lr: `${man}e^{${ex}}`, batch: `\\text{${m.batch}}`, tokens: `${m.tokensT.toFixed(1)}\\text{T}` };
    for (const [k, src] of Object.entries(cells)) drawTex(g, src, mid(k), y, o);
  }
}

// ── helpers (kit candidates: dial, circle, leader) ───────────────────────────
function circle(x, y, r, n = 20) { return Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [x + r * Math.cos(a), y + r * Math.sin(a)]; }); }
function leader(ctx, x0, y0, x1, y1, a) { ctx.save(); ctx.globalAlpha *= clamp(a * 2); ctx.strokeStyle = F.ink2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); }
/** a flat dial lying on a top face at height z: a disc with a pointer (the rotary glyph; the angle is ours) */
function dial(ctx, C, x, y, z, r, a, ang) {
  if (a <= 0) return;
  const P = circle(x, y, r * clamp(a * 1.4), 24).map(([u, v]) => C.p(u, v, z));
  ctx.save();
  ctx.globalAlpha *= clamp(a * 2);
  ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath();
  ctx.fillStyle = PAL.rope; ctx.fill(); ctx.strokeStyle = F.ink; ctx.lineWidth = 1.4 * P[0].k; ctx.stroke();
  const c = C.p(x, y, z), tip = C.p(x + r * 0.8 * Math.cos(ang), y + r * 0.8 * Math.sin(ang), z);
  ctx.lineWidth = 2 * c.k; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
  ctx.restore();
}

/** the flat schematic of one transformer layer, drawn in sheet px (ours: the paper has no architecture figure) */
function drawSchematic(g, { pulse = 0 }) {
  const ink = F.ink;
  g.lineJoin = 'round'; g.lineCap = 'round';
  const label = (src, x, y, size = 44, color = ink) => drawTex(g, src, x, y, { size, color, align: 'center', valign: 'middle' });
  const solid = (r, fill) => { g.fillStyle = fill; g.fillRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0); g.strokeStyle = ink; g.lineWidth = 3; g.setLineDash([]); g.strokeRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0); };
  const slot = (r) => {
    if (pulse > 0) { g.fillStyle = hexA(F.ink3, 0.35 * pulse); g.fillRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0); }
    g.strokeStyle = pulse > 0 ? mix(F.ink2, F.ink, pulse) : F.ink2; g.lineWidth = 3 + 3 * pulse; g.setLineDash([12, 9]);
    g.strokeRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0); g.setLineDash([]);
  };
  const arrow = (x0, y0, x1, y1) => {
    g.strokeStyle = ink; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    const a = Math.atan2(y1 - y0, x1 - x0), h = 16;
    g.fillStyle = ink; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - h * Math.cos(a - 0.45), y1 - h * Math.sin(a - 0.45)); g.lineTo(x1 - h * Math.cos(a + 0.45), y1 - h * Math.sin(a + 0.45)); g.closePath(); g.fill();
  };
  const cx = 440;
  // flow, bottom to top
  arrow(cx, 995, cx, BOX.pos.y1 + 2);
  label(S.input, cx + 90, 978, 36, F.ink2);
  arrow(cx, BOX.pos.y0, cx, BOX.norm1.y1 + 2);
  arrow(cx, BOX.norm1.y0, cx, BOX.attn.y1 + 2);
  arrow(cx, BOX.attn.y0, cx, ADD[0].y + ADD[0].r + 2);
  arrow(cx, ADD[0].y - ADD[0].r, cx, BOX.norm2.y1 + 2);
  arrow(cx, BOX.norm2.y0, cx, BOX.ffn.y1 + 2);
  arrow(cx, BOX.ffn.y0, cx, ADD[1].y + ADD[1].r + 2);
  arrow(cx, ADD[1].y - ADD[1].r, cx, 60);
  label(S.output, cx + 100, 80, 36, F.ink2);
  // residual paths on the left
  g.strokeStyle = F.ink2; g.lineWidth = 3;
  g.beginPath(); g.moveTo(cx, 872); g.lineTo(150, 872); g.lineTo(150, ADD[0].y); g.stroke(); arrow(150, ADD[0].y, cx - ADD[0].r - 2, ADD[0].y);
  g.beginPath(); g.moveTo(cx, 545); g.lineTo(150, 545); g.lineTo(150, ADD[1].y); g.stroke(); arrow(150, ADD[1].y, cx - ADD[1].r - 2, ADD[1].y);
  // blocks
  solid(BOX.attn, '#FFFFFF'); label(S.attn, cx, (BOX.attn.y0 + BOX.attn.y1) / 2);
  solid(BOX.ffn, '#FFFFFF'); label(S.ffn, cx, (BOX.ffn.y0 + BOX.ffn.y1) / 2);
  for (const a of ADD) { g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(a.x, a.y, a.r, 0, Math.PI * 2); g.fill(); g.strokeStyle = ink; g.lineWidth = 3; g.stroke(); label(S.plus, a.x, a.y + 1, 36); }
  // the three kinds of empty slot: the norms, the activation, the position signal
  slot(BOX.norm1); label(S.norm, cx, (BOX.norm1.y0 + BOX.norm1.y1) / 2, 34, F.ink2);
  slot(BOX.norm2); label(S.norm, cx, (BOX.norm2.y0 + BOX.norm2.y1) / 2, 34, F.ink2);
  g.strokeStyle = F.ink2; g.lineWidth = 3; g.setLineDash([8, 7]); g.beginPath(); g.moveTo(BOX.ffn.x1, (BOX.act.y0 + BOX.act.y1) / 2); g.lineTo(BOX.act.x0, (BOX.act.y0 + BOX.act.y1) / 2); g.stroke(); g.setLineDash([]);
  slot(BOX.act); label(S.act, (BOX.act.x0 + BOX.act.x1) / 2, (BOX.act.y0 + BOX.act.y1) / 2, 34, F.ink2);
  slot(BOX.pos); label(S.pos, cx, (BOX.pos.y0 + BOX.pos.y1) / 2, 34, F.ink2);
}

/** 64 × 32 tiles (one per GPU), unrolling row by row from the front; a ripple runs across them in s6 */
function gpuGrid(ctx, C, p, t, T) {
  const { cols, rows } = GPU_GRID, u = GRID.tile + GRID.gap;
  const x0 = GRID.cx - (cols * u) / 2;
  const shown = p * rows;
  const rip = clamp((t - T.three6) / (T.each6 - T.three6));
  ctx.save();
  ctx.lineJoin = 'round';
  const a0 = ctx.globalAlpha;
  for (let r = rows - 1; r >= 0; r--) {
    const f = clamp(shown - (rows - 1 - r));
    if (f <= 0) continue;
    const y = GRID.y0 + r * u;
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * u;
      const wave = rip > 0 && rip < 1 ? Math.exp(-(((c / cols) - rip * 1.3 + 0.15) ** 2) / 0.004) : 0;
      const z = 2 + 7 * wave;
      const P = [C.p(x, y, z), C.p(x + GRID.tile, y, z), C.p(x + GRID.tile, y + GRID.tile, z), C.p(x, y + GRID.tile, z)];
      ctx.globalAlpha = a0 * clamp(f * 2);
      ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath();
      ctx.fillStyle = wave > 0.05 ? mix('#E4E1DA', PAL.m65Fill, wave) : '#E4E1DA';
      ctx.fill();
      ctx.strokeStyle = wave > 0.05 ? PAL.m65 : F.ink3; ctx.lineWidth = 0.8; ctx.stroke();
    }
  }
  ctx.restore();
}
