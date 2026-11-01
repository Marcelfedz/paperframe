// tools — Section 3.1's Wikipedia API. p. 4 slides in, the Action Space paragraph is boxed and lifts off
// as a standing placard (the marker follows the voice on it all segment). The ring stands small at the left;
// its Wikipedia slab comes forward with three keys that press with the voice (search / lookup / finish).
// A toy page (illustrative) shows what search and lookup return; the paper's own Milhouse lookup (p. 18)
// lifts off as evidence. "significantly weaker" in yellow; a thought picks the query. Then PaLM-540B,
// frozen (p. 3 strips), and the six HotpotQA examples in a tray (p. 4 strip, "6 and 3 cases").
import { W, H, clamp, lerp, e, ease, rng } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, texSize, desk, edgeIn, loadPaper, findPhrase, cameraAt, sheet, highlight,
  markBox, liftPose, slab, cite, sayWords, onSheet, blankPage,
} from '/engine/folio.js';
import { PAL, LOOP, P4, P18 } from './_data.js';

const S = {
  search: '\\texttt{search[entity]}',
  lookup: '\\texttt{lookup[string]}',
  finish: '\\texttt{finish[answer]}',
  wiki: '\\text{Wikipedia}',
  thought: '\\text{Thought}',
  action: '\\text{Action}',
  obs: '\\text{Observation}',
  illus: '\\text{illustrative}',
  ctrlf: '\\texttt{Ctrl+F}',
  ends: '\\text{episode ends}',
  query: '\\text{query}',
  palm: '\\text{PaLM-540B}',
  frozen: '\\text{frozen}',
  tray: '\\text{HotpotQA prompt: 6}',
  c4a: '\\text{p. 4}\\;\\cdot\\;\\text{Section 3.1}',
  c4b: '\\text{p. 4}\\;\\cdot\\;\\text{Section 3.2}',
  c3: '\\text{p. 3}\\;\\cdot\\;\\text{Section 2}',
  c18: '\\text{p. 18}\\;\\cdot\\;\\text{Appendix C.1}',
};

let p3, p4, p18, L;
const grow = (r, px = 10, py = 4) => ({ x0: r.x0 - px, y0: r.y0 - py, x1: r.x1 + px, y1: r.y1 + py });
const union = (rs) => ({ x0: Math.min(...rs.map((r) => r.x0)), y0: Math.min(...rs.map((r) => r.y0)), x1: Math.max(...rs.map((r) => r.x1)), y1: Math.max(...rs.map((r) => r.y1)) });

// ── world layout (desk px) ──
const PITCH = 0.92;
const RING = { x: 350, y: 600, s: 0.58 };                         // the loop of segment 3, small, at the left
const ENV = { x0: 560, y0: 610, x1: 1420, y1: 820, h: 80 };       // the Wikipedia slab, come forward
const KEY_W = 262, KEY_D = 120, KEY_H = 16;
const PLAC = { x: 905, y: 40, z: 40, w: 1300, tilt: PITCH };      // the Action Space paragraph, standing at the back
const TOY = { x: 1620, y: 470, w: 300 };                           // toy page (illustrative), standing beside the slab
const PALM = { x0: 40, y0: 230, x1: 700, y1: 330, h: 300 };        // the frozen model, behind the ring
const TRAY = { x0: 720, y0: 380, x1: 960, y1: 450, h: 14 };        // six examples go in here
const aim = (x, y, z, pitch = PITCH) => ({ tx: x, ty: y - z * Math.tan(pitch) });   // desk point that puts (x,y,z) mid-screen

export default {
  async setup(env) {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [3, 4, 18]);
    p3 = P.page(3); p4 = P.page(4); p18 = P.page(18);
    L = {
      three: findPhrase(p4, 'three types of actions'),
      search: findPhrase(p4, 'search[entity], which returns the first 5 sentences'),
      similar: findPhrase(p4, 'suggests top-5 similar entities'),
      lookup: findPhrase(p4, 'lookup[string], which would return the next sentence in the page'),
      ctrlf: findPhrase(p4, 'simulating Ctrl+F functionality on the browser'),
      finish: findPhrase(p4, 'finish[answer]'),
      weaker: findPhrase(p4, 'significantly weaker than state-of-the- art lexical or neural retrievers'),
      force: findPhrase(p4, 'force models to retrieve via explicit reasoning in language'),
      cases: findPhrase(p4, 'we randomly select 6 and 3 cases'),
      casesLine: findPhrase(p4, 'For HotpotQA and Fever, we randomly select 6 and 3 cases')[0],
      frozenLine: findPhrase(p3, 'a frozen large language model, PaLM-540B'),
      palm: findPhrase(p3, 'PaLM-540B'),
      frozen: findPhrase(p3, 'frozen'),
      milThought: findPhrase(p18, 'The paragraph does not tell who Milhouse is named after, maybe I can look up "named after".'),
      milLookup: findPhrase(p18, 'Lookup[named after]'),
    };
    L.par = grow(P4.actionSpace, 14, 8);
    L.mil = (() => { const u = union([P18.thought2, P18.action2, P18.obs2]); return { x0: u.x0 - 14, y0: u.y0 - 8, x1: u.x1 + 14, y1: u.y1 + 2 }; })();
    // p. 3 strips: "a frozen" (end of one line) and "large language model, PaLM-540B" (start of the next)
    L.stripA = grow(L.frozenLine[0], 8, 4);
    L.stripB = grow(L.frozenLine[1], 8, 4);
    L.stripC = { x0: L.casesLine.x0 - 10, y0: L.casesLine.y0 - 4, x1: 1192, y1: L.casesLine.y1 + 4 };   // stops before footnote 2's red link box (x 1192 on page-04.png)
    L.cases = L.cases.map((r) => ({ ...r, x1: Math.min(r.x1, 1189) }));
    L.c3rect = union([L.frozenLine[0], L.frozenLine[1]]);
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      delib: q.w(0, 'deliberately'), small: q.w(0, 'small'), three: q.w(0, 'three', 2), wiki: q.w(0, 'Wikipedia'),
      s1: q.s(1), first: q.w(1, 'first'), or: q.w(1, 'or'), five2: q.w(1, 'five', 2),
      s2: q.s(2), next: q.w(2, 'next'), containing: q.w(2, 'containing'), like: q.w(2, 'like'), control: q.w(2, 'Control'),
      s3: q.s(3), answer: q.w(3, 'answer'),
      s4: q.s(4), signif: q.w(4, 'significantly'),
      s5: q.s(5), reason: q.w(5, 'reason'), up: q.w(5, 'up'),
      s6: q.s(6), trained: q.w(6, 'trained'),
      palm: q.w(7, 'PaLM'), frozen: q.w(7, 'frozen'), six: q.w(7, 'six'), examples: q.w(7, 'examples'),
    };
    const KP = { search: T.s1 + 0.05, lookup: T.s2 + 0.05, finish: T.s3 + 0.15, query: T.up + 0.05 };   // key presses

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    const C = cameraAt(t, [
      { t: 0, tx: 960, ty: 560, zoom: 0.84, pitch: 0.14 },
      { t: 1.0, dur: 1.4, tx: 962, ty: 790, zoom: 1.85 },
      { t: T.small - 0.15, dur: 1.7, tx: 985, ty: 430, zoom: 0.96, pitch: PITCH },
      { t: T.s4 - 0.35, dur: 1.1, ...placardAim(), zoom: 1.2 },
      { t: T.s5 - 0.05, dur: 1.3, tx: 985, ty: 430, zoom: 0.96 },
      { t: T.s6 - 0.15, dur: 1.4, tx: 700, ty: 330, zoom: 1.15 },
    ]);

    // ── p. 4 slides in, camera reads the Action Space paragraph, the paragraph is boxed and lifts off ──
    const pin = e(t, 0, 1.2, ease.outCubic);
    const out4 = e(t, T.small, 0.8, ease.inOutCubic);
    const P4rest = { x: 960, y: lerp(1900, 560, pin), z: Math.sin(Math.PI * pin) * 150, w: 900, rot: lerp(-0.12, -0.015, pin) };
    const P4P = { ...P4rest, y: P4rest.y + 1500 * out4 };
    if (out4 < 1) {
      sheet(ctx, C, p4, P4P);
      markBox(ctx, C, p4, P4P, P4.actionSpace, e(t, T.delib, 0.9) * (1 - e(t, T.small, 0.3)), { color: PAL.actInk, width: 4, pad: 10 });
    }

    // the placard: the lifted paragraph, standing at the back; picked up and taken away on "Nothing is trained"
    const lp = e(t, T.small - 0.1, 1.7, ease.linear);
    const plOut = e(t, T.s6 - 0.1, 1.1, ease.inCubic);
    let PL = null;
    if (lp > 0 && plOut < 1) {
      PL = liftPose(p4, P4rest, L.par, { ...PLAC, arc: 40 }, lp);   // from where the paragraph was, not the leaving page
      PL = { ...PL, y: PL.y - 700 * plOut, z: PL.z + 500 * plOut };
      sheet(ctx, C, p4, PL, { grid: 8 });
      outline(ctx, C, p4, PL, L.par, PAL.actInk, 2.6, e(t, T.small + 1.2, 0.5));
      const hl = (lines, p, color = F.hlMint) => highlight(ctx, C, p4, PL, lines, p, { color });
      hl(L.three, sayWords(env, 0, 11, 12, t));
      hl(L.search, sayWords(env, 1, 0, 5, t));
      hl(L.similar, sayWords(env, 1, 9, 12, t));
      hl(L.lookup, sayWords(env, 2, 0, 4, t));
      hl(L.ctrlf, sayWords(env, 2, 8, 13, t));
      hl(L.finish, sayWords(env, 3, 0, 0, t));
      hl(L.weaker, sayWords(env, 4, 4, 8, t), F.hlYellow);
      hl(L.force, sayWords(env, 5, 2, 11, t));
    }

    // ── the ring (small, left) and its Wikipedia slab coming forward ──
    const rise = (k) => e(t, T.small + 0.72 + k * 0.14, 0.6, ease.outCubic);
    const fwd = e(t, T.small + 0.8, 0.9, ease.inOutCubic);
    const envOut = e(t, T.s6 - 0.1, 1.2, ease.inCubic);
    const small = ringBox(RING, LOOP.env);
    const EV = {
      x0: lerp(small.x0, ENV.x0, fwd) + 1700 * envOut, x1: lerp(small.x1, ENV.x1, fwd) + 1700 * envOut,
      y0: lerp(small.y0, ENV.y0, fwd), y1: lerp(small.y1, ENV.y1, fwd), h: lerp(small.h, ENV.h, fwd) * rise(3),
    };
    const pulse = (t0) => ({ a: clamp((t - t0 + 0.45) / 0.55), b: clamp((t - t0 - 0.25) / 0.6), on: win2(t, t0 - 0.45, t0 + 1.1) });
    const pulses = [pulse(KP.search), pulse(KP.lookup), pulse(KP.query)];
    const lit = pulses.reduce((m, p) => (p.on > m.on ? p : m), { a: 0, b: 0, on: 0 });

    // the frozen model behind the ring (s6–s7)
    const palmUp = e(t, T.trained - 0.2, 0.9, ease.outCubic);
    if (palmUp > 0) {
      const b = { x0: PALM.x0, y0: PALM.y0, x1: PALM.x1, y1: PALM.y1, z0: 0, z1: PALM.h * palmUp };
      slab(ctx, C, b, { fill: PAL.env, stroke: F.ink, width: 2.2 });
      const lc = C.p((PALM.x0 + PALM.x1) / 2, PALM.y1, PALM.h * 0.72);
      drawTex(ctx, S.palm, lc.x, lc.y, { size: 60 * lc.k, color: F.ink, align: 'center', valign: 'middle', write: e(t, T.palm - 0.1, 0.8, ease.linear) });
      // tray of six examples in front of the model (illustrative cards, ruled lines only)
      tray(ctx, C, t, T);
    }

    if (rise(0) > 0) ring(ctx, C, RING, { rise, env: envOut < 0.25 ? EV : null, lit, envAlpha: 1 - envOut * 4 });

    // env slab + keys (drawn after the ring: it sits in front of it)
    if (envOut < 1 && EV.h > 1) {
      slab(ctx, C, { x0: EV.x0, y0: EV.y0, x1: EV.x1, y1: EV.y1, z0: 0, z1: EV.h }, { fill: PAL.env, stroke: F.ink, width: 2 });
      const fl = C.p((EV.x0 + EV.x1) / 2, EV.y1, EV.h * 0.5);
      drawTex(ctx, S.wiki, fl.x, fl.y, { size: Math.max(30, 40 * fl.k * fwd), color: F.ink, align: 'center', valign: 'middle', alpha: fwd });
      const keys = keyBoxes(EV);
      keys.forEach((k, i) => {
        const up = e(t, T.three + 0.4 + i * 0.2, 0.45, ease.outBack);
        if (up <= 0) return;
        const press = Math.max(keyPress(t, KP[k.id]), k.id === 'search' ? keyPress(t, KP.query) : 0);
        const z0 = EV.h, z1 = EV.h + KEY_H * up * (1 - 0.55 * press) + 0.01;
        slab(ctx, C, { x0: k.x0, y0: k.y0, x1: k.x1, y1: k.y1, z0, z1 }, { fill: press > 0.05 ? mix(PAL.act, F.orange, 0.55 * press) : PAL.act, stroke: PAL.actInk, width: 2 });
        const c = C.p((k.x0 + k.x1) / 2, (k.y0 + k.y1) / 2, z1);
        drawTex(ctx, S[k.id], c.x, c.y, { size: Math.max(30, 31 * c.k), color: PAL.actInk, align: 'center', valign: 'middle', alpha: clamp(up) * clamp((fwd - 0.75) / 0.25) });   // labels once the slab is full size
      });
      // finish: no observation comes back, the episode ends
      const fe = win2(t, T.answer - 0.1, T.s4 + 0.2);
      if (fe > 0) {
        const k = keys[2], c = C.p((k.x0 + k.x1) / 2, k.y0, EV.h + 130);
        slip(ctx, S.ends, c.x, c.y, { size: 34, color: F.ink2, alpha: fe, write: e(t, T.answer - 0.1, 0.6, ease.linear) });
      }
      // s5: a thought picks the query — arrow from the Thought station to the search key, a chip rides it
      const qa = e(t, T.reason - 0.1, 0.7, ease.inOutCubic), qOut = 1 - e(t, T.s6 - 0.3, 0.5);
      if (qa > 0 && qOut > 0) {
        const m = ringMap(RING), k = keys[0];
        const from = m(LOOP.stations.thought.x, LOOP.stations.thought.y - 20, LOOP.slab.h + 10);
        const to = [(k.x0 + k.x1) / 2 - 30, (k.y0 + k.y1) / 2, EV.h + KEY_H + 6];
        const pts = arcPts(from, to, 170, 28);
        ctx.save(); ctx.globalAlpha *= qOut;
        arrow3(ctx, C, pts, { p: qa, color: PAL.thoughtInk, width: 4, head: 16 });
        const qp = e(t, T.reason + 0.35, KP.query - T.reason - 0.4, ease.inOutCubic);
        if (qp > 0 && qp < 1) {
          const [x, y, z] = along(pts, qp), s = C.p(x, y, z);
          chip(ctx, S.query, s.x, s.y - 26, { size: 32, color: PAL.thoughtInk, fill: PAL.thought, stroke: PAL.thoughtInk });
        }
        ctx.restore();
      }
    }

    // ── toy page (illustrative): first five sentences, then five similar titles, then Ctrl+F ──
    toyPage(ctx, C, t, T, KP);

    // ── p. 18: the paper's own lookup, lifted off as one card (no voice on it) ──
    const m0 = T.containing + 0.25;
    const in18 = e(t, m0, 0.9, ease.outCubic), out18 = e(t, T.s3 - 0.45, 0.7, ease.inCubic);
    if (in18 > 0 && out18 < 1) {
      const P18P = { x: lerp(-700, 260, in18) - 1300 * out18, y: 1000, z: Math.sin(Math.PI * in18) * 120, w: 620, rot: lerp(-0.25, -0.05, in18) };
      sheet(ctx, C, p18, P18P);
      const lf = e(t, m0 + 0.5, 1.0, ease.linear);
      if (lf > 0) {
        const CP = liftPose(p18, P18P, L.mil, { x: 1000 - 150 * out18, y: 860 + 1000 * out18, z: 40, w: 1250, tilt: PITCH, arc: 200 }, lf);
        sheet(ctx, C, p18, CP, { grid: 6 });
        markBox(ctx, C, p18, CP, union(L.milThought), e(t, m0 + 1.45, 0.5), { color: PAL.thoughtInk, width: 2.6, pad: 5 });
        markBox(ctx, C, p18, CP, L.milLookup[0], e(t, m0 + 1.85, 0.4), { color: PAL.actInk, width: 2.6, pad: 5 });
      }
    }

    // ── p. 3 strips: "a frozen / large language model, PaLM-540B" — then p. 4's "6 and 3 cases" ──
    const offP3 = { x: 2900, y: 200, z: 0, w: 900, rot: 0.1 };
    const s3in = e(t, T.palm - 0.75, 1.2, ease.linear), s3out = e(t, T.six - 0.25, 0.8, ease.inCubic);
    if (s3in > 0 && s3out < 1) {
      const wB = 600, sc = wB / (L.stripB.x1 - L.stripB.x0), wA = (L.stripA.x1 - L.stripA.x0) * sc;
      const bx = 1080, by = 330;
      const A = liftPose(p3, offP3, L.stripA, { x: bx - wB / 2 + wA / 2 + 1400 * s3out, y: by - 64, z: 90 + 260 * s3out, w: wA, tilt: PITCH, arc: 160 }, s3in);
      const B = liftPose(p3, offP3, L.stripB, { x: bx + 1400 * s3out, y: by, z: 90 + 260 * s3out, w: wB, tilt: PITCH, arc: 200 }, e(t, T.palm - 0.6, 1.2, ease.linear));
      sheet(ctx, C, p3, A, { grid: 2 });
      sheet(ctx, C, p3, B, { grid: 4 });
      highlight(ctx, C, p3, B, L.palm, e(t, T.palm, 0.35, ease.linear), { color: F.hlMint });
      highlight(ctx, C, p3, A, L.frozen, e(t, T.frozen, 0.4, ease.linear), { color: F.hlMint });
    }
    const s4in = e(t, T.six - 0.55, 1.1, ease.linear);
    if (s4in > 0) {
      const offP4 = { x: 2900, y: 260, z: 0, w: 900, rot: 0.08 };
      const SP = liftPose(p4, offP4, L.stripC, { x: 1110, y: 300, z: 90, w: 700, tilt: PITCH, arc: 200 }, s4in);
      sheet(ctx, C, p4, SP, { grid: 4 });
      highlight(ctx, C, p4, SP, L.cases, sayWords(env, 7, 13, 15, t), { color: F.hlMint });
    }

    // frozen tag on the model
    const fz = e(t, T.frozen, 0.5, ease.outBack);
    if (fz > 0) {
      const c = C.p(PALM.x1 - 40, PALM.y1, PALM.h + 40);
      slip(ctx, S.frozen, c.x, c.y, { size: 36, color: PAL.thoughtInk, stroke: PAL.thoughtInk, alpha: clamp(fz), write: e(t, T.frozen, 0.5, ease.linear) });
    }

    // ── source stamp ──
    let st = { page: p4, label: S.c4a, rect: P4.actionSpace, a: e(t, 0.9, 0.6) };
    if (t > T.containing + 0.3 && t < T.s3 + 0.1) st = { page: p18, label: S.c18, rect: P18.milhouse, a: 1 };
    if (t > T.s6 - 0.2) st = { page: p4, label: S.c4b, rect: L.casesLine, a: 1 - win2(t, T.s6 - 0.2, T.palm - 0.4) };
    if (t > T.palm - 0.4 && t < T.six - 0.2) st = { page: p3, label: S.c3, rect: L.c3rect, a: 1 };
    cite(ctx, st.page, { label: st.label, rect: st.rect, alpha: st.a, side: 'right' });

    function placardAim() {
      // centre of the standing placard → camera target
      const h = PLAC.w * (L.par.y1 - L.par.y0) / (L.par.x1 - L.par.x0);
      const yc = PLAC.y + h / 2 - (h / 2) * Math.cos(PITCH), zc = (h / 2) * Math.sin(PITCH);
      return aim(PLAC.x, yc, zc);
    }
  },
};

// ── helpers (kept in the scene; kit candidates: ring, arrow3, slip) ──────────
const win2 = (t, a, b, fin = 0.3, fout = 0.3) => Math.min(clamp((t - a) / fin), clamp((b - t) / fout));
const keyPress = (t, t0) => (t < t0 ? 0 : t < t0 + 0.12 ? (t - t0) / 0.12 : clamp(1 - (t - t0 - 0.12) / 0.45));

function mix(a, b, f) {   // hex in, hex out (slab() shades hex fills)
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = [16, 8, 0].map((s) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, clamp(f))));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

function ringMap(xf) { return (x, y, z = 0) => [xf.x + (x - LOOP.c.x) * xf.s, xf.y + (y - LOOP.c.y) * xf.s, z * xf.s]; }
function ringBox(xf, b) { const m = ringMap(xf); const [x0, y0] = m(b.x0, b.y0), [x1, y1] = m(b.x1, b.y1); return { x0, y0, x1, y1, h: b.h * xf.s }; }

function keyBoxes(ev) {
  const ids = ['search', 'lookup', 'finish'], wTot = ev.x1 - ev.x0, cy = (ev.y0 + ev.y1) / 2;
  const sc = clamp(wTot / (ENV.x1 - ENV.x0), 0.2, 1);
  return ids.map((id, i) => {
    const cx = ev.x0 + wTot * (i * 2 + 1) / 6, hw = KEY_W * sc / 2, hd = KEY_D * sc / 2;
    return { id, x0: cx - hw, x1: cx + hw, y0: cy - hd, y1: cy + hd };
  });
}

// polyline in world space → screen, drawn to fraction p with an arrowhead
function arrow3(ctx, C, pts, { p = 1, color = F.ink, width = 3, head = 14, alpha = 1 } = {}) {
  if (p <= 0 || alpha <= 0) return;
  const S = pts.map(([x, y, z]) => C.p(x, y, z));
  const seg = []; let Ltot = 0;
  for (let i = 1; i < S.length; i++) { const d = Math.hypot(S[i].x - S[i - 1].x, S[i].y - S[i - 1].y); seg.push(d); Ltot += d; }
  const target = Ltot * clamp(p);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width * S[0].k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(S[0].x, S[0].y);
  let acc = 0, end = S[0], prev = S[0];
  for (let i = 1; i < S.length; i++) {
    if (acc + seg[i - 1] >= target) {
      const f = seg[i - 1] ? (target - acc) / seg[i - 1] : 0;
      end = { x: lerp(S[i - 1].x, S[i].x, f), y: lerp(S[i - 1].y, S[i].y, f), k: S[i].k }; prev = S[i - 1];
      ctx.lineTo(end.x, end.y); break;
    }
    acc += seg[i - 1]; ctx.lineTo(S[i].x, S[i].y); prev = S[i - 1]; end = S[i];
  }
  ctx.stroke();
  const a = Math.atan2(end.y - prev.y, end.x - prev.x), h = head * end.k;
  ctx.beginPath();
  ctx.moveTo(end.x + Math.cos(a) * h * 0.4, end.y + Math.sin(a) * h * 0.4);
  ctx.lineTo(end.x - Math.cos(a) * h + Math.cos(a + Math.PI / 2) * h * 0.55, end.y - Math.sin(a) * h + Math.sin(a + Math.PI / 2) * h * 0.55);
  ctx.lineTo(end.x - Math.cos(a) * h - Math.cos(a + Math.PI / 2) * h * 0.55, end.y - Math.sin(a) * h - Math.sin(a + Math.PI / 2) * h * 0.55);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
function along(pts, f) {
  const seg = []; let Lt = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]); seg.push(d); Lt += d; }
  let acc = 0; const target = Lt * clamp(f);
  for (let i = 1; i < pts.length; i++) {
    if (acc + seg[i - 1] >= target) { const g = (target - acc) / (seg[i - 1] || 1); return [0, 1, 2].map((j) => lerp(pts[i - 1][j], pts[i][j], g)); }
    acc += seg[i - 1];
  }
  return pts.at(-1);
}
function arcPts(a, b, lift, n = 24) {
  return Array.from({ length: n + 1 }, (_, i) => { const f = i / n; return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f) + Math.sin(Math.PI * f) * lift]; });
}

// the loop (segment 3's geometry, LOOP), mapped by xf = { x, y, s }; stations rise with rise(k)
function ring(ctx, C, xf, { rise, env, lit, envAlpha = 1 }) {
  const m = ringMap(xf), ST = LOOP.stations, c = LOOP.c, r = LOOP.r;
  const ang = (s) => Math.atan2(ST[s].y - c.y, ST[s].x - c.x);
  const arc = (a0, a1, n = 26) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return m(c.x + r * Math.cos(a), c.y + r * Math.sin(a), 0); });
  const ar = clamp(rise(2));
  const trim = 0.5;
  arrow3(ctx, C, arc(Math.PI + trim, 2 * Math.PI + ang('act') - trim), { p: ar, color: F.ink2, width: 3, head: 14 });
  arrow3(ctx, C, arc(ang('obs') + trim, Math.PI - trim), { p: ar, color: F.ink2, width: 3, head: 14 });
  // thought → context stack (nothing comes back from a thought)
  const sk = LOOP.stack;
  arrow3(ctx, C, [m(ST.thought.x + LOOP.slab.w / 2 + 6, ST.thought.y), m(sk.x - sk.w / 2 - 14, sk.y)], { p: ar, color: PAL.thoughtInk, width: 3, head: 12 });
  // action → Wikipedia → observation (only actions cross to the environment)
  if (env) {
    const A = m(ST.act.x + LOOP.slab.w / 2 + 4, ST.act.y + 10), O = m(ST.obs.x + LOOP.slab.w / 2 + 4, ST.obs.y - 10);
    const eA = [env.x0 - 8, lerp(env.y0, env.y1, 0.25), 0], eO = [env.x0 - 8, lerp(env.y0, env.y1, 0.8), 0];
    const onA = lit.on * (lit.a > 0 ? 1 : 0), onB = lit.on * (lit.b > 0 ? 1 : 0);
    arrow3(ctx, C, [A, eA], { p: ar, color: onA > 0 ? mix(F.ink2, PAL.actInk, onA) : F.ink2, width: 3 + 1.5 * onA, head: 14, alpha: envAlpha });
    arrow3(ctx, C, [eO, O], { p: ar, color: onB > 0 ? mix(F.ink2, PAL.obsInk, onB) : F.ink2, width: 3, head: 14, alpha: envAlpha });
    // travelling dots
    const dot = (P, Q, f, col) => {
      if (f <= 0 || f >= 1) return;
      const s = C.p(lerp(P[0], Q[0], f), lerp(P[1], Q[1], f), 0);
      ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(s.x, s.y, 9 * s.k, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    };
    if (lit.on > 0) { dot(A, eA, lit.a, PAL.actInk); dot(eO, O, lit.b, PAL.obsInk); }
  }
  // context stack (three cards)
  const items = [];
  for (let i = 0; i < 3; i++) {
    const [x, y] = m(sk.x, sk.y), hw = sk.w * xf.s / 2, hd = sk.d * xf.s / 2, dz = sk.dz * xf.s;
    const up = rise(0);
    items.push({ b: { x0: x - hw, x1: x + hw, y0: y - hd, y1: y + hd, z0: i * dz * up, z1: (i * dz + dz * 0.6) * up }, fill: F.paper, stroke: F.ink3, k: 1, ink: null });
  }
  for (const [id, s] of Object.entries(ST)) {
    const [x, y] = m(s.x, s.y), hw = LOOP.slab.w * xf.s / 2, hd = LOOP.slab.d * xf.s / 2;
    const k = id === 'thought' ? 0 : id === 'act' ? 1 : 2;
    const up = rise(k);
    items.push({ id, b: { x0: x - hw, x1: x + hw, y0: y - hd, y1: y + hd, z0: 0, z1: LOOP.slab.h * xf.s * up }, fill: PAL[s.fill], stroke: id === 'thought' ? PAL.thoughtInk : id === 'act' ? PAL.actInk : PAL.obsInk, label: s.label, up });
  }
  items.forEach((it) => { it.depth = C.p((it.b.x0 + it.b.x1) / 2, (it.b.y0 + it.b.y1) / 2, 0).depth; });
  items.sort((a, b) => b.depth - a.depth).forEach((it) => {
    if (it.b.z1 - it.b.z0 < 0.5) return;
    const glow = it.id === 'act' ? lit.on * clamp(lit.a * 3) : 0;
    slab(ctx, C, it.b, { fill: glow > 0 ? mix(it.fill, F.orange, glow * 0.35) : it.fill, stroke: it.stroke, width: 2 });
    if (it.label) {
      const below = it.id === 'obs';
      const p = below ? C.p((it.b.x0 + it.b.x1) / 2, it.b.y1 + 14, 0) : C.p((it.b.x0 + it.b.x1) / 2, it.b.y0, it.b.z1 + 26);
      drawTex(ctx, it.label, p.x, p.y, { size: Math.max(30, 30 * p.k), color: it.stroke, align: 'center', valign: below ? 'top' : 'bottom', alpha: clamp(it.up) });   // station ink, as in segment 3
    }
  });
}

// a paper slip with a TeX label, screen space
function slip(ctx, src, x, y, { size = 34, color = F.ink, stroke = F.rule, fill = 'rgba(255,255,255,0.94)', alpha = 1, write = 1 } = {}) {
  if (alpha <= 0) return;
  const s = texSize(src, size);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(40,30,20,0.16)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
  ctx.beginPath(); ctx.roundRect(x - s.w / 2 - 14, y - s.h / 2 - 9, s.w + 28, s.h + 18, 7); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.stroke();
  ctx.restore();
  drawTex(ctx, src, x, y, { size, color, align: 'center', valign: 'middle', write, alpha });
}
function chip(ctx, src, x, y, o) { slip(ctx, src, x, y, o); }

// a thin outline around a lifted crop (card colour lives in the outline)
function outline(ctx, C, page, pose, r, color, width, p) {
  if (p <= 0) return;
  const pts = [[r.x0, r.y0], [r.x1, r.y0], [r.x1, r.y1], [r.x0, r.y1]].map(([u, v]) => onSheet(C, page, pose, u, v));
  ctx.save(); ctx.globalAlpha *= p; ctx.strokeStyle = color; ctx.lineWidth = width * pts[0].k; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.stroke(); ctx.restore();
}

// toy Wikipedia page (ILLUSTRATIVE): title bar, ten sentence bars; search lights the first five,
// "five similar titles" lays the page down and fans five title chips; lookup brings it back with a Ctrl+F bar
const BAR_W = (() => { const r = rng(404); return Array.from({ length: 10 }, () => 330 + r() * 170); })();
function toyPage(ctx, C, t, T, KP) {
  const tin = e(t, KP.search + 0.15, 0.9, ease.outCubic);
  const tout = e(t, T.s6 - 0.1, 1.0, ease.inCubic);
  if (tin <= 0 || tout >= 1) return;
  const fold = e(t, T.five2 - 0.15, 0.6, ease.inOutCubic) * (1 - e(t, T.s2 - 0.1, 0.7, ease.inOutCubic));
  const lit5 = (i) => e(t, T.first + i * 0.16, 0.25, ease.linear) * (1 - e(t, T.s2 - 0.2, 0.3, ease.linear));
  const find = e(t, T.next - 0.1, 0.5, ease.outBack);
  const found = e(t, T.containing, 0.5, ease.linear);
  const pg = blankPage('react04-toy', 600, 760, (g) => {
    g.fillStyle = F.ink2; g.fillRect(50, 60, 330, 46);
    g.fillStyle = F.rule; g.fillRect(50, 130, 500, 3);
    BAR_W.forEach((w, i) => {
      const y = 165 + i * 46;
      g.fillStyle = mix(F.paper, F.ink3, 0.38); g.beginPath(); g.roundRect(50, y, w, 22, 6); g.fill();
      const a = i < 5 ? lit5(i) : i === 7 ? found : 0;
      if (a > 0) { g.globalAlpha = a; g.fillStyle = F.hlMint; g.beginPath(); g.roundRect(44, y - 6, w + 12, 34, 8); g.fill(); g.fillStyle = mix(F.hlMint, F.teal, 0.45); g.beginPath(); g.roundRect(50, y, w, 22, 6); g.fill(); g.globalAlpha = 1; }
    });
    if (find > 0) {
      const y = lerp(-90, 30, clamp(find));
      g.fillStyle = F.paper; g.strokeStyle = F.ink2; g.lineWidth = 3;
      g.beginPath(); g.roundRect(330, y, 240, 64, 10); g.fill(); g.stroke();
      drawTex(g, '\\texttt{Ctrl+F}', 450, y + 33, { size: 40, color: F.ink, align: 'center', valign: 'middle' });
    }
    drawTex(g, '\\text{illustrative}', 300, 730, { size: 52, color: F.ink2, align: 'center', valign: 'bottom' });
  }, { scale: 0.75 });
  const x = lerp(2300, TOY.x, tin) + 1400 * tout;
  const tilt = lerp(PITCH, 0.0, fold);
  sheet(ctx, C, pg, { x, y: TOY.y + 140 * fold, z: Math.sin(Math.PI * tin) * 120, w: TOY.w, tilt, rot: lerp(0.15, 0.02, tin) }, { grid: 6 });
  // five similar titles fan out of the folded page
  const chipPg = blankPage('react04-chip', 340, 90, (g) => {
    g.fillStyle = PAL.obs; g.fillRect(0, 0, 340, 90);
    g.fillStyle = F.ink2; g.beginPath(); g.roundRect(26, 32, 200, 26, 6); g.fill();
    g.strokeStyle = PAL.obsInk; g.lineWidth = 5; g.strokeRect(2, 2, 336, 86);
  }, { scale: 0.75 });
  for (let i = 0; i < 5; i++) {
    const f = e(t, T.five2 + i * 0.13, 0.45, ease.outBack) * (1 - e(t, T.s2 - 0.25 + (4 - i) * 0.05, 0.4, ease.inCubic));
    if (f <= 0) continue;
    const ang = (i - 2) * 0.12;
    sheet(ctx, C, chipPg, { x: x - 40 + Math.sin(ang) * 220 * f, y: TOY.y + 60, z: 20 + (4 - i) * 48 * f, w: 190 * clamp(f, 0.3, 1.2), tilt: PITCH, rot: ang * 0.5 }, { grid: 2 });
  }
}

// tray with six blank example cards (ruled lines only) in front of the model
function tray(ctx, C, t, T) {
  const tp = e(t, T.six - 0.35, 0.5, ease.outCubic);
  if (tp <= 0) return;
  slab(ctx, C, { x0: TRAY.x0, y0: TRAY.y0, x1: TRAY.x1, y1: TRAY.y1, z0: 0, z1: TRAY.h * tp }, { fill: F.block, stroke: F.ink2, width: 1.8 });
  const card = blankPage('react04-ex', 220, 280, (g) => {
    g.strokeStyle = F.ink3; g.lineWidth = 4; g.strokeRect(2, 2, 216, 276);
    g.fillStyle = mix(F.paper, F.ink3, 0.42);
    for (let i = 0; i < 6; i++) g.fillRect(26, 44 + i * 36, i === 5 ? 90 : 168, 8);
  }, { scale: 0.6 });
  for (let i = 0; i < 6; i++) {
    const f = e(t, T.six - 0.05 + i * 0.16, 0.5, ease.outCubic);
    if (f <= 0) continue;
    const x = lerp(TRAY.x1 + 500, TRAY.x0 + 30 + i * 40, f);
    sheet(ctx, C, card, { x, y: (TRAY.y0 + TRAY.y1) / 2 - 20, z: TRAY.h + Math.sin(Math.PI * f) * 60, w: 92, tilt: 1.15, rot: 0 }, { grid: 2, shadow: 0.5 });
  }
  const lab = C.p((TRAY.x0 + TRAY.x1) / 2, TRAY.y1 + 40, 0);
  drawTex(ctx, S.tray, lab.x, lab.y, { size: Math.max(30, 36 * lab.k), color: F.ink, align: 'center', valign: 'top', write: e(t, T.examples - 0.1, 0.7, ease.linear) });
}
