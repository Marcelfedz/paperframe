// household — ALFWorld. p. 7 names the game, p. 2's Figure 1 (2) supplies the task and both runs.
// The task panel lifts off and stands behind a small room built from ROOM (layout illustrative).
// Act-only (2a): the token goes to the drawer, then the sink basin, and "Nothing happens" twice — the
// paper's own lines boxed in red. ReAct (2b): its first Think stands over the room as a plan, cabinets
// and countertops light, the token finds the pepper shaker on countertop 3, the second Think, the
// drawer, the paper's ✓. Then thoughts per step as chips: dense (1d) vs sparse (2b), and p. 4's
// "asynchronous occurrence of thoughts and actions" with the voice.
import { W, H, clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, cueBook, loadB1B, tex, drawTex, texSize, desk, edgeIn, loadPaper, findPhrase, cameraAt, sheet, highlight,
  markBox, liftPose, slab, cite, sayWords, onSheet, blankPage,
} from '/engine/folio.js';
import { PAL, ROOM, FIG1, FIG1_LINES, FIG1_STEPS } from './_data.js';

const S = {
  illus: '\\text{layout illustrative}',
  cabinets: '\\text{cabinets}',
  countertops: '\\text{countertops}',
  dense: '\\text{(1d) HotpotQA}',
  sparse: '\\text{(2b) ALFWorld}',
  kThought: '\\text{Thought}', kAct: '\\text{Action}', kObs: '\\text{Observation}',
  c7: '\\text{p. 7}\\;\\cdot\\;\\text{Section 4}',
  c2: '\\text{p. 2}\\;\\cdot\\;\\text{Figure 1 (2)}',
  c2all: '\\text{p. 2}\\;\\cdot\\;\\text{Figure 1}',
  c4: '\\text{p. 4}\\;\\cdot\\;\\text{Section 2}',
};
const NUM = ['1', '2', '3', '4', '5', '6'].map((n) => `\\text{${n}}`);
const LABEL = {   // TeX labels for the single receptacles (cabinets and countertops get numbers + a group label)
  sinkbasin1: '\\text{sinkbasin 1}', drawer1: '\\text{drawer 1}', coffeemachine1: '\\text{coffee machine 1}',
  stoveburner1: '\\text{stove burner 1}', toaster1: '\\text{toaster 1}',
};

let p2, p4, p7, L;
const grow = (r, px = 6, py = 4) => ({ x0: r.x0 - px, y0: r.y0 - py, x1: r.x1 + px, y1: r.y1 + py });
const union = (rs) => ({ x0: Math.min(...rs.map((r) => r.x0)), y0: Math.min(...rs.map((r) => r.y0)), x1: Math.max(...rs.map((r) => r.x1)), y1: Math.max(...rs.map((r) => r.y1)) });
const lineOf = (r) => ({ x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1, n: (r.t || 'xxxxxxxxxx').length });
const step = (panel, id) => FIG1_STEPS[panel].find((s) => s.id === id);

// ── world layout (desk px) ──
const PITCH = 0.9;
const FOOT = {   // receptacle footprints (half sizes) — ours, the room is illustrative
  cabinet: [52, 34], countertop: [50, 62], sinkbasin1: [58, 50], drawer1: [58, 40],
  coffeemachine1: [44, 34], stoveburner1: [56, 44], toaster1: [40, 30],
};
const kindOf = (id) => id.replace(/\d+$/, '');
const foot = (id) => FOOT[id] || FOOT[kindOf(id)];
const TASK = { x: 960, y: 40, z: 60, w: 980, tilt: PITCH };          // task card, standing behind the room
const A2 = { x: 190, y: 640, z: 10, w: 560, tilt: PITCH };            // (2a) parked at the left edge
const B2 = { x: 1725, y: 640, z: 10, w: 560, tilt: PITCH };           // (2b) parked at the right edge
const THINK = { x: 960, y: 40, z: 60, w: 1060, tilt: PITCH };        // the thought card over the room
const P2OFF = { x: 980, y: 1900, z: 0, w: 900, rot: 0.04 };           // p. 2 lying off the front edge (source of later lifts)
const CHIPS = { x: 3000, y: 560 };                                     // where the dense/sparse columns are laid out
const STRIP = { x: 3000, y: 150, z: 100, w: 1480, tilt: 0.55 };         // p. 4's two lines, standing behind the columns

export default {
  async setup(env) {
    await loadB1B();
    [...Object.values(S), ...NUM, ...Object.values(LABEL)].forEach((s) => tex(s));
    const P = await loadPaper(env.ep, [2, 4, 7]);
    p2 = P.page(2); p4 = P.page(4); p7 = P.page(7);
    L = {
      game: findPhrase(p7, 'synthetic text-based game'),
      alf: union([...findPhrase(p7, 'ALFWorld ALFWorld'), ...findPhrase(p7, 'expert trajectories for each task type')]),
      sparsely: findPhrase(p4, 'appear sparsely'),
      async: findPhrase(p4, 'asynchronous occurrence of thoughts and actions for itself'),
      twoLines: findPhrase(p4, 'appear sparsely in the most relevant positions of a trajectory, so we let the language model decide the asynchronous occurrence of thoughts and actions for itself.'),
    };
    L.strip4 = grow(union(L.twoLines), 10, 5);
    L.q2 = grow(FIG1.panels.q2, 4, 4);
    L.a2 = grow(FIG1.panels.a2, 4, 4);
    L.b2 = grow(FIG1.panels.b2, 4, 4);
    L.think1 = grow(step('b2', 'Act1'), 6, 3);
    L.think8 = grow(step('b2', 'Act8'), 6, 3);
    // inside the first Think (monospace line 2: "likely to appear in cabinets (1-6), countertops (1-3), ..."), measured on page-02.png
    L.cabBox = { x0: 1036, y0: 755, x1: 1151, y1: 770 };
    L.ctrBox = { x0: 1167, y0: 755, x1: 1307, y1: 770 };
  },

  draw(ctx, t, env) {
    const q = cueBook(env);
    const T = {
      text: q.w(0, 'text'), house: q.w(0, 'house'), reads: q.w(0, 'reads'), sees: q.w(0, 'sees'), types: q.w(0, 'types'),
      s1: q.s(1), pepper1: q.w(1, 'pepper'), e1: q.e(1),
      s2: q.s(2), take: q.w(2, 'take'), sink: q.w(2, 'sink'), none: q.w(2, 'none'),
      s3: q.s(3), s4: q.s(4), s5: q.s(5),
      s6: q.s(6), first: q.w(6, 'first'), plan: q.w(6, 'plan'), cabinets: q.w(6, 'cabinets'), countertops: q.w(6, 'countertops'),
      s7: q.s(7), three: q.w(7, 'three'), writes: q.w(7, 'writes'), put: q.w(7, 'put'), drawer: q.w(7, 'drawer'),
      s8: q.s(8), s9: q.s(9), sparse: q.w(9, 'sparse'), s10: q.s(10), decides: q.w(10, 'decides'),
    };

    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);

    const C = cameraAt(t, [
      { t: 0, tx: 1010, ty: 560, zoom: 2.0, pitch: 0.14 },
      { t: T.house - 0.55, dur: 0.9, tx: 960, ty: 560, zoom: 1.85 },
      { t: T.house + 0.35, dur: 1.6, tx: 960, ty: 420, zoom: 1.12, pitch: PITCH, dist: 3600 },
      { t: T.s2 - 0.3, dur: 1.1, tx: 640 },
      { t: T.s6 - 0.3, dur: 1.3, tx: 1280 },
      { t: T.s9 - 0.35, dur: 1.2, tx: CHIPS.x, ty: CHIPS.y - 10, zoom: 1.0, pitch: 0.55, dist: 3000 },
      { t: T.s10 - 0.3, dur: 2.6, zoom: 1.06 },
    ]);

    // ── p. 7: ALFWorld is a synthetic text-based game ──
    const in7 = e(t, 0, 1.0, ease.outCubic), out7 = e(t, T.house - 0.6, 1.0, ease.inCubic);
    if (out7 < 1) {
      const P7 = { x: lerp(960, -900, out7), y: lerp(1900, 560, in7), z: Math.sin(Math.PI * in7) * 140, w: 900, rot: lerp(-0.1, -0.01, in7) - 0.1 * out7 };
      // the camera opens on the paragraph: keep it near frame centre
      const P7s = { ...P7, y: P7.y + (1100 - 880) * (900 / p7.w) };
      sheet(ctx, C, p7, P7s);
      highlight(ctx, C, p7, P7s, L.game, sayWords(env, 0, 3, 4, t), { color: F.hlMint });
    }

    // ── p. 2 slides in on Figure 1 (2); the task panel lifts and stands behind the room ──
    const in2 = e(t, T.house - 0.55, 0.95, ease.outCubic), out2 = e(t, T.house + 0.55, 1.1, ease.inCubic);
    const P2 = { x: lerp(2700, 960, in2), y: 560 + 1300 * out2, z: Math.sin(Math.PI * in2) * 130, w: 900, rot: lerp(0.12, 0.01, in2) };
    const P2v = { ...P2, y: P2.y + (1100 - 914) * (900 / 1700) };      // Figure 1's bottom half sits mid-frame
    const P2rest = { ...P2v, y: P2v.y - 1300 * out2 };
    if (in2 > 0 && out2 < 1) sheet(ctx, C, p2, P2v);

    const tl = e(t, T.house + 0.3, 1.5, ease.linear);
    const taskOut = e(t, T.s2 - 0.2, 0.9, ease.inCubic);
    let TP = null;
    if (tl > 0 && taskOut < 1) {
      TP = liftPose(p2, P2rest, L.q2, { ...TASK, arc: 60 }, tl);
      TP = { ...TP, y: TP.y - 600 * taskOut, z: TP.z + 400 * taskOut };
    }

    // ── the room ──
    const roomIn = e(t, T.house + 0.9, 0.7, ease.outCubic);
    const roomOut = e(t, T.s9 - 0.4, 0.9, ease.inCubic);   // the camera moves on; the room sinks
    const rise = (i) => e(t, T.house + 1.1 + i * 0.07, 0.5, ease.outCubic) * (1 - roomOut);
    if (TP) {   // drawn behind the room
      sheet(ctx, C, p2, TP, { grid: 4 });
      outline(ctx, C, p2, TP, L.q2, F.ink2, 2, e(t, T.house + 1.6, 0.4));
      const lines = FIG1_LINES.q2.slice(1, 4).map(lineOf);
      highlight(ctx, C, p2, TP, lines, sayWords(env, 0, 11, 14, t), { color: F.hlMint });
      highlight(ctx, C, p2, TP, [lineOf(FIG1_LINES.q2[4])], sayWords(env, 1, 2, 8, t), { color: F.hlYellow });
    }

    // thought cards over the room (2b's two Thinks) — behind the room too
    const B2P = b2Pose(t, T);
    const th1 = e(t, T.first - 0.15, 1.2, ease.linear), th1Out = e(t, T.writes - 0.3, 0.8, ease.inCubic);
    if (th1 > 0 && th1Out < 1 && B2P) {
      let TK = liftPose(p2, B2P.rest, L.think1, { ...THINK, arc: 120 }, th1);
      TK = { ...TK, x: TK.x - 1500 * th1Out, z: TK.z + 200 * th1Out };
      sheet(ctx, C, p2, TK, { grid: 6 });
      outline(ctx, C, p2, TK, L.think1, PAL.thoughtInk, 2.4, e(t, T.first + 1.0, 0.4));
      markBox(ctx, C, p2, TK, L.cabBox, e(t, T.cabinets, 0.45), { color: PAL.thoughtInk, width: 2.2, pad: 3 });
      markBox(ctx, C, p2, TK, L.ctrBox, e(t, T.countertops, 0.45), { color: PAL.thoughtInk, width: 2.2, pad: 3 });
    }
    const th8 = e(t, T.writes - 0.1, 1.2, ease.linear), th8Out = e(t, T.s9 - 0.45, 0.7, ease.inCubic);
    if (th8 > 0 && th8Out < 1 && B2P) {
      let TK = liftPose(p2, B2P.rest, L.think8, { ...THINK, w: 1000, arc: 120 }, th8);
      TK = { ...TK, y: TK.y - 600 * th8Out, z: TK.z + 300 * th8Out };
      sheet(ctx, C, p2, TK, { grid: 6 });
      outline(ctx, C, p2, TK, L.think8, PAL.thoughtInk, 2.4, e(t, T.writes + 1.0, 0.4));
    }

    if (roomIn > 0 && roomOut < 1) room(ctx, C, t, T, roomIn, rise, roomOut);

    // ── (2a) Act-only, parked at the left edge ──
    const a2in = e(t, T.s2 - 0.25, 1.1, ease.linear), a2out = e(t, T.s6 - 0.3, 0.9, ease.inCubic);
    if (a2in > 0 && a2out < 1) {
      let AP = liftPose(p2, P2OFF, L.a2, { ...A2, arc: 160 }, a2in);
      AP = { ...AP, x: AP.x - 1200 * a2out };
      sheet(ctx, C, p2, AP, { grid: 6 });
      outline(ctx, C, p2, AP, L.a2, F.ink2, 2, e(t, T.s2 + 0.8, 0.4));
      const ACT = actOnlyTimes(T);
      ['Act1', 'Act2', 'Act3', 'Act4'].forEach((id, i) => {
        const p = win2(t, ACT.fire[i], ACT.fire[i] + 1.1, 0.2, 0.5);
        if (p > 0) highlight(ctx, C, p2, AP, [lineOf(step('a2', id))], 1, { color: F.hlMint, alpha: 0.9 * p });
      });
      markBox(ctx, C, p2, AP, union([step('a2', 'Act4'), step('a2', 'Obs4')]), e(t, T.s3, 0.5), { color: F.red, width: 2.6, pad: 4 });
      markBox(ctx, C, p2, AP, union([step('a2', 'Act5'), step('a2', 'Obs5')]), e(t, T.s5, 0.5), { color: F.red, width: 2.6, pad: 4 });
      pulseMark(ctx, C, p2, AP, FIG1.marks.a2, t, T.s5 + 0.3, F.red);
    }

    // ── (2b) ReAct, parked at the right edge ──
    if (B2P && B2P.pose) {
      sheet(ctx, C, p2, B2P.pose, { grid: 6 });
      outline(ctx, C, p2, B2P.pose, L.b2, PAL.thoughtInk, 2, e(t, T.s6 + 0.8, 0.4));
      // steps light as the token takes them (the elided part of the figure gets no numbers, no light)
      const R = reactTimes(T);
      [['Act2', R.go[0]], ['Act6', R.go[5]], ['Act7', T.three + 0.2], ['Act9', R.carry0], ['Act11', R.drop]].forEach(([id, t0]) => {
        const p = win2(t, t0, t0 + 1.0, 0.2, 0.5);
        if (p > 0) highlight(ctx, C, p2, B2P.pose, [lineOf(step('b2', id))], 1, { color: F.hlMint, alpha: 0.85 * p });
      });
      markBox(ctx, C, p2, B2P.pose, lineOf(FIG1_LINES.b2.at(-1)), e(t, T.s8, 0.45), { color: PAL.goodMark, width: 2.8, pad: 4 });
      pulseMark(ctx, C, p2, B2P.pose, FIG1.marks.b2, t, T.s8 + 0.2, PAL.goodMark);
    }

    // ── dense vs sparse ──
    chips(ctx, C, t, T, env);

    // ── source stamp ──
    let st = { page: p7, label: S.c7, rect: L.alf, a: e(t, 0.6, 0.5) };
    if (t > T.house - 0.3) st = { page: p2, label: S.c2, rect: FIG1.bottom, a: 1 };
    if (t > T.s9 - 0.3) st = { page: p2, label: S.c2all, rect: FIG1.all, a: 1 };
    if (t > T.s10 - 0.2) st = { page: p4, label: S.c4, rect: union(L.twoLines), a: 1 };
    cite(ctx, st.page, { label: st.label, rect: st.rect, alpha: st.a, side: 'right' });
  },
};

// ── timing helpers ───────────────────────────────────────────────────────────
const win2 = (t, a, b, fin = 0.3, fout = 0.3) => Math.min(clamp((t - a) / fin), clamp((b - t) / fout));

function actOnlyTimes(T) {
  // Act 1 go to drawer 1 · Act 2 open drawer 1 · Act 3 go to sinkbasin 1 · Act 4 take (nothing happens)
  return { fire: [T.s2 + 0.05, T.s2 + 1.15, T.take - 0.05, T.none - 0.35], arriveSink: T.sink + 0.1 };
}
function reactTimes(T) {
  // cabinet 1 → 2 → 3 → countertop 1 → 2 → 3 during "It finds one on countertop three"; then carry to drawer 1
  const t0 = T.s7 - 0.1, t1 = T.three + 0.05;
  const go = Array.from({ length: 6 }, (_, i) => lerp(t0, t1, i / 5));
  return { go, carry0: T.put - 0.05, drop: T.drawer + 0.35 };
}

function b2Pose(t, T) {
  const inP = e(t, T.s6 - 0.2, 1.2, ease.linear), outP = e(t, T.s9 - 0.4, 0.9, ease.inCubic);
  if (inP <= 0 || outP >= 1) return inP > 0 ? { rest: liftPose(p2, P2OFF, L.b2, { ...B2, arc: 160 }, 1), pose: null } : null;
  const rest = liftPose(p2, P2OFF, L.b2, { ...B2, arc: 160 }, inP);
  const pose = { ...rest, x: rest.x - 1600 * outP, z: rest.z + 200 * outP };   // leaves against the camera's pan
  return { rest: liftPose(p2, P2OFF, L.b2, { ...B2, arc: 160 }, 1), pose };
}

// ── the room (ILLUSTRATIVE layout from ROOM) ─────────────────────────────────
function itemBox(id) {
  const it = ROOM.items[id], [hw, hd] = foot(id);
  return { x0: it.x - hw, x1: it.x + hw, y0: it.y - hd, y1: it.y + hd, h: it.h };
}
function stopAt(id) {   // where the token stands to use a receptacle: square in front of the side facing the room
  const it = ROOM.items[id], [hw, hd] = foot(id), k = kindOf(id), gap = 40;
  if (k === 'cabinet') return [it.x, it.y + hd + gap];                 // back wall: from the front
  if (k === 'countertop') return [it.x - hw - gap, it.y];              // right wall: from the left
  if (id === 'sinkbasin1' || id === 'drawer1') return [it.x + hw + gap, it.y];   // left wall: from the right
  return [it.x, it.y - hd - gap];                                       // front row: from behind
}
const CENTRE = [930, 580];

function walk(path, times, t) {
  // path [[x,y],...], times [t0, t1, ...] arrival times (path[0] at times[0])
  if (t <= times[0]) return path[0];
  for (let i = 1; i < path.length; i++) {
    if (t < times[i]) {
      const f = ease.inOutCubic(clamp((t - times[i - 1]) / (times[i] - times[i - 1])));
      return [lerp(path[i - 1][0], path[i][0], f), lerp(path[i - 1][1], path[i][1], f)];
    }
  }
  return path.at(-1);
}

function room(ctx, C, t, T, roomIn, rise, roomOut) {
  // floor sheet
  const fl = ROOM.floor;
  const floor = blankPage('react05-floor', 880, 620, (g) => {
    g.fillStyle = F.deskLit; g.fillRect(0, 0, 880, 620);
    g.strokeStyle = 'rgba(60,50,35,0.10)'; g.lineWidth = 2;
    for (let x = 0; x <= 880; x += 80) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 620); g.stroke(); }
    for (let y = 0; y <= 620; y += 80) { g.beginPath(); g.moveTo(0, y); g.lineTo(880, y); g.stroke(); }
    g.strokeStyle = F.ink2; g.lineWidth = 5; g.strokeRect(3, 3, 874, 614);
  }, { scale: 0.5 });
  const fz = (1 - roomIn) * 0 - 200 * roomOut;
  sheet(ctx, C, floor, { x: (fl.x0 + fl.x1) / 2, y: (fl.y0 + fl.y1) / 2 + (1 - roomIn) * 300, z: Math.sin(Math.PI * roomIn) * 60 + fz, w: fl.x1 - fl.x0 }, { alpha: 1 - roomOut, shadow: 0.6 });
  // the layout is ours: tag it in the bottom-left corner of the frame (the stamp has the other one)
  slipTag(ctx, S.illus, 68, H - 76, { size: 30, color: F.ink2, align: 'left', alpha: roomIn * (1 - roomOut) * e(t, T.house + 1.6, 0.5) });

  // receptacle tint: during ReAct's plan, cabinets then countertops light, the rest dims
  const cabOn = e(t, T.cabinets, 0.4) * (1 - e(t, T.s9 - 0.6, 0.4));
  const ctrOn = e(t, T.countertops, 0.4) * (1 - e(t, T.s9 - 0.6, 0.4));
  const dim = Math.max(cabOn, ctrOn) * (1 - e(t, T.put - 0.3, 0.5));
  const drawerOpen = Math.max(win2(t, T.s2 + 1.1, T.take + 0.2, 0.35, 0.35), win2(t, T.drawer - 0.2, T.s9, 0.3, 0.3));

  // tokens
  const A = actOnlyTimes(T), R = reactTimes(T);
  const actPath = [CENTRE, stopAt('drawer1'), stopAt('drawer1'), stopAt('sinkbasin1')];
  const actT = [T.s2, A.fire[0] + 0.85, A.fire[2], A.arriveSink];
  const actPos = walk(actPath, actT, t);
  const reactPath = [CENTRE, ...ROOM.react.slice(0, 6).map(stopAt), stopAt('countertop3'), [900, 690], stopAt('drawer1')];   // carried round the front row, not through it
  const reactT = [T.s7 - 0.4, ...R.go, R.carry0, lerp(R.carry0, R.drop - 0.25, 0.55), R.drop - 0.25];
  const reactPos = walk(reactPath, reactT, t);

  const items = [];
  Object.keys(ROOM.items).forEach((id, i) => {
    const b = itemBox(id), k = kindOf(id);
    let fill = k === 'cabinet' ? mix(PAL.env, F.rule, 0.45) : k === 'countertop' ? mix(PAL.env, F.ink3, 0.18) : k === 'sinkbasin' ? mix(PAL.env, F.ink3, 0.32) : PAL.env;
    let alpha = 1;
    if (k === 'cabinet' && cabOn > 0) fill = mix(fill, PAL.thought, cabOn);
    else if (k === 'countertop' && ctrOn > 0) fill = mix(fill, PAL.thought, ctrOn);
    else if (dim > 0) alpha = 1 - 0.5 * dim;
    const stroke = (k === 'cabinet' && cabOn > 0.5) || (k === 'countertop' && ctrOn > 0.5) ? PAL.thoughtInk : F.ink2;
    items.push({ kind: 'slab', id, b: { ...b, z0: 0, z1: b.h * rise(i) }, fill, stroke, alpha, up: rise(i) });
  });
  // drawer front slides out when opened
  if (drawerOpen > 0) {
    const b = itemBox('drawer1');
    items.push({ kind: 'slab', id: 'drawerPull', b: { x0: b.x0 + 8, x1: b.x1 - 8, y0: b.y1 - 4, y1: b.y1 + 34 * drawerOpen, z0: 10, z1: b.h - 10 }, fill: F.paper, stroke: F.ink2, alpha: 1, up: 1 });
  }
  // the pepper shaker: a ghost on countertop 3 until ReAct finds it, then carried to the drawer
  const ct3 = itemBox('countertop3');
  const found = e(t, T.three, 0.4);
  const ghost = e(t, T.pepper1, 0.6) * (1 - roomOut);
  let shaker = [(ct3.x0 + ct3.x1) / 2, ct3.y0 + 30, ct3.h];
  if (t > R.carry0) { const p = reactPos; shaker = [p[0], p[1], 64]; }
  if (t > R.drop) { const d = itemBox('drawer1'); const f = e(t, R.drop, 0.35); shaker = [lerp(reactPos[0], (d.x0 + d.x1) / 2, f), lerp(reactPos[1], d.y1 + 10, f), lerp(64, d.h - 12, f)]; }
  if (ghost > 0) items.push({ kind: 'shaker', pos: shaker, found, alpha: ghost, b: { x0: shaker[0] - 1, x1: shaker[0] + 1, y0: shaker[1] - 1, y1: shaker[1] + 1 } });

  // act-only token: in from the room centre, out at s6
  const actOn = e(t, T.s2 - 0.3, 0.5) * (1 - e(t, T.s6 - 0.2, 0.5));
  const jolt = (t0) => (t > t0 && t < t0 + 0.5 ? Math.sin((t - t0) * 40) * 9 * (1 - (t - t0) / 0.5) : 0);
  if (actOn > 0) {
    const jx = jolt(T.s3) + jolt(T.s4 + 0.2) + jolt(T.s5);
    const grey = e(t, T.s5 + 0.2, 0.5);
    items.push({ kind: 'token', pos: [actPos[0] + jx, actPos[1]], alpha: actOn, grey, flash: Math.max(win2(t, T.s3, T.s3 + 0.6, 0.05, 0.4), win2(t, T.s4 + 0.2, T.s4 + 0.8, 0.05, 0.4), win2(t, T.s5, T.s5 + 0.6, 0.05, 0.4)), b: { x0: actPos[0], x1: actPos[0], y0: actPos[1], y1: actPos[1] } });
  }
  const reOn = e(t, T.s7 - 0.5, 0.4) * (1 - roomOut);
  if (reOn > 0) items.push({ kind: 'token', pos: reactPos, alpha: reOn, grey: 0, flash: 0, b: { x0: reactPos[0], x1: reactPos[0], y0: reactPos[1], y1: reactPos[1] } });

  items.forEach((it) => { it.depth = C.p((it.b.x0 + it.b.x1) / 2, (it.b.y0 + it.b.y1) / 2, 0).depth; });
  items.sort((a, b) => b.depth - a.depth).forEach((it) => {
    if (it.kind === 'slab') {
      if (it.b.z1 - it.b.z0 < 0.5) return;
      slab(ctx, C, it.b, { fill: it.fill, stroke: it.stroke, width: 1.8, alpha: it.alpha * (1 - roomOut) });
    } else if (it.kind === 'token') {
      const [x, y] = it.pos, s = 22;
      const fill = it.flash > 0 ? mix(F.ink2, F.red, it.flash) : mix(F.ink2, F.rule, it.grey);
      slab(ctx, C, { x0: x - s, x1: x + s, y0: y - s, y1: y + s, z0: 0, z1: 58 }, { fill, stroke: F.ink, width: 1.8, alpha: it.alpha });
    } else if (it.kind === 'shaker') {
      const [x, y, z] = it.pos, s = 13;
      if (it.found > 0) slab(ctx, C, { x0: x - s, x1: x + s, y0: y - s, y1: y + s, z0: z, z1: z + 34 }, { fill: PAL.good, stroke: PAL.goodMark, width: 2, alpha: it.alpha * it.found });
      if (it.found < 1) {
        const P = [[x - s, y - s], [x + s, y - s], [x + s, y + s], [x - s, y + s]];
        const top = P.map(([u, v]) => C.p(u, v, z + 34)), bot = P.map(([u, v]) => C.p(u, v, z));
        ctx.save(); ctx.globalAlpha *= it.alpha * (1 - it.found) * 0.8; ctx.strokeStyle = PAL.goodMark; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
        ctx.beginPath(); top.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.stroke();
        for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(top[i + 1 > 3 ? 0 : i + 1].x, top[i + 1 > 3 ? 0 : i + 1].y); ctx.lineTo(bot[i + 1 > 3 ? 0 : i + 1].x, bot[i + 1 > 3 ? 0 : i + 1].y); ctx.stroke(); }
        ctx.restore();
      }
    }
  });

  // labels (after the slabs, so they read)
  const la = roomIn * (1 - roomOut);
  if (la > 0) {
    for (let n = 1; n <= 6; n++) {
      const b = itemBox(`cabinet${n}`), p = C.p((b.x0 + b.x1) / 2, b.y1, b.h * 0.5);
      drawTex(ctx, NUM[n - 1], p.x, p.y, { size: Math.max(30, 30 * p.k), color: F.ink, align: 'center', valign: 'middle', alpha: la * e(t, T.house + 1.4, 0.4) });
    }
    for (let n = 1; n <= 3; n++) {   // on the top face, front half (the shaker sits on the back half of countertop 3)
      const b = itemBox(`countertop${n}`), p = C.p((b.x0 + b.x1) / 2, b.y1 - 24, b.h);
      drawTex(ctx, NUM[n - 1], p.x, p.y, { size: Math.max(30, 30 * p.k), color: F.ink, align: 'center', valign: 'middle', alpha: la * e(t, T.house + 1.4, 0.4) });
    }
    const cl = C.p((itemBox('cabinet1').x0 + itemBox('cabinet6').x1) / 2, itemBox('cabinet1').y0, 90 + 40);
    drawTex(ctx, S.cabinets, cl.x, cl.y, { size: Math.max(30, 34 * cl.k), color: cabOn > 0.5 ? PAL.thoughtInk : F.ink, align: 'center', valign: 'bottom', alpha: la * e(t, T.house + 1.5, 0.4) });
    const ctl = C.p(itemBox('countertop2').x0 - 26, ROOM.items.countertop2.y, 0);
    drawTex(ctx, S.countertops, ctl.x, ctl.y, { size: Math.max(30, 34 * ctl.k), color: ctrOn > 0.5 ? PAL.thoughtInk : F.ink, align: 'right', valign: 'middle', alpha: la * e(t, T.house + 1.5, 0.4) });
    for (const id of Object.keys(LABEL)) {
      const b = itemBox(id);
      const front = id !== 'sinkbasin1';
      const p = front ? C.p((b.x0 + b.x1) / 2, b.y1 + 16, 0) : C.p((b.x0 + b.x1) / 2, b.y0, b.h + 26);
      drawTex(ctx, LABEL[id], p.x, p.y, { size: 31, color: F.ink, align: 'center', valign: front ? 'top' : 'bottom', alpha: la * e(t, T.house + 1.5, 0.4) * (1 - 0.5 * dim) });
    }
  }
}

// ── dense (1d) vs sparse (2b): one chip per step, coloured by kind ──────────
function chips(ctx, C, t, T, env) {
  const a = e(t, T.s9 + 0.25, 0.6);
  if (a <= 0) return;
  const cols = [
    { steps: FIG1_STEPS.d1, x: CHIPS.x - 330, label: S.dense },
    { steps: FIG1_STEPS.b2.filter((s) => s.k !== 'note'), x: CHIPS.x + 330, label: S.sparse },
  ];
  const fillOf = { thought: PAL.thought, act: PAL.act, obs: PAL.obs };
  const inkOf = { thought: PAL.thoughtInk, act: PAL.actInk, obs: PAL.obsInk };
  const glow = e(t, T.sparse, 0.4) ;
  const y0 = CHIPS.y - 255, dy = 44;
  cols.forEach((col, ci) => {
    col.steps.forEach((s, i) => {
      const p = e(t, T.s9 + 0.2 + ci * 0.12 + i * 0.04, 0.35, ease.outBack);
      if (p <= 0) return;
      const y = y0 + i * dy, hw = 130, hd = 17;
      const g = ci === 1 && s.k === 'thought' ? glow : 0;
      slab(ctx, C, { x0: col.x - hw, x1: col.x + hw, y0: y - hd, y1: y + hd, z0: 0, z1: 10 * p + 14 * g }, { fill: fillOf[s.k], stroke: inkOf[s.k], width: 1.6 + 2.2 * g, alpha: clamp(p) });
    });
    const lp = C.p(col.x, y0 - 50, 0);
    drawTex(ctx, col.label, lp.x, lp.y, { size: Math.max(30, 38 * lp.k), color: F.ink, align: 'center', valign: 'bottom', write: e(t, T.s9 + 0.3 + ci * 0.25, 0.7, ease.linear) });
  });
  // legend
  // legend, stacked at the left of the columns
  const lg = C.p(CHIPS.x - 860, CHIPS.y + 40, 0);
  const keys = [['thought', S.kThought], ['act', S.kAct], ['obs', S.kObs]];
  keys.forEach(([k, src], i) => {
    const y = lg.y + i * 54;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = fillOf[k]; ctx.strokeStyle = inkOf[k]; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(lg.x, y - 14, 44, 28, 4); ctx.fill(); ctx.stroke(); ctx.restore();
    drawTex(ctx, src, lg.x + 58, y, { size: 32, color: F.ink, valign: 'middle', alpha: a });
  });

  // p. 4: "…appear sparsely… decide the asynchronous occurrence of thoughts and actions for itself."
  const sp = e(t, T.s10 - 0.5, 1.2, ease.linear);
  if (sp > 0) {
    const off = { x: CHIPS.x + 2000, y: 200, z: 0, w: 900, rot: 0.06 };
    const SP = liftPose(p4, off, L.strip4, { ...STRIP, arc: 160 }, sp);
    sheet(ctx, C, p4, SP, { grid: 6 });
    highlight(ctx, C, p4, SP, L.sparsely, e(t, T.s10 + 0.4, 0.4, ease.linear), { color: F.hlMint });
    highlight(ctx, C, p4, SP, L.async, sayWords(env, 10, 2, 7, t), { color: F.hlMint });
  }
}

// ── small helpers (kit candidates: outline, pulseMark, slipTag) ─────────────
function mix(a, b, f) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = [16, 8, 0].map((s) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, clamp(f))));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}
function outline(ctx, C, page, pose, r, color, width, p) {
  if (p <= 0) return;
  const pts = [[r.x0, r.y0], [r.x1, r.y0], [r.x1, r.y1], [r.x0, r.y1]].map(([u, v]) => onSheet(C, page, pose, u, v));
  ctx.save(); ctx.globalAlpha *= p; ctx.strokeStyle = color; ctx.lineWidth = width * pts[0].k; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.stroke(); ctx.restore();
}
// a ring that expands once around one of the figure's own verdict marks (✗ / ✓)
function pulseMark(ctx, C, page, pose, m, t, t0, color) {
  const p = clamp((t - t0) / 0.9);
  if (p <= 0) return;
  const c = onSheet(C, page, pose, (m.x0 + m.x1) / 2, (m.y0 + m.y1) / 2);
  const r0 = (m.x1 - m.x0) * c.k * (pose.w / (pose.src.x1 - pose.src.x0)) * 0.9;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 3;
  ctx.globalAlpha *= p < 1 ? 1 - p : 0;
  ctx.beginPath(); ctx.arc(c.x, c.y, r0 * (1 + 1.8 * p), 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.globalAlpha *= e(t, t0, 0.3);
  ctx.beginPath(); ctx.arc(c.x, c.y, r0 * 1.25, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}
function slipTag(ctx, src, x, y, { size = 30, color = F.ink2, align = 'center', alpha = 1 } = {}) {
  if (alpha <= 0) return;
  const s = texSize(src, size), x0 = align === 'right' ? x - s.w : align === 'left' ? x : x - s.w / 2;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.strokeStyle = F.rule; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(x0 - 12, y - s.h / 2 - 8, s.w + 24, s.h + 16, 6); ctx.fill(); ctx.stroke(); ctx.restore();
  drawTex(ctx, src, x0, y, { size, color, valign: 'middle', alpha });
}
