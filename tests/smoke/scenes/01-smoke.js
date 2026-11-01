// CI smoke test: exercises the kit end to end in a real browser (MathJax TeX, the desk, a sheet,
// 3D prisms, an arrow, slips and word cues) without a paper, audio or network.
// Run: bin/paperframe stills tests/smoke smoke --stills 3
import { clamp } from '/engine/runtime.js';
import {
  F, loadB1B, tex, desk, edgeIn, cameraAt, blankPage, sheet, prism, arrow3, contactShadow, tag, cueBook,
} from '/engine/folio.js';

const S = { label: '\\text{smoke test}', eq: 'h = W_0 x + BAx' };
let page;

export default {
  async setup() {
    await loadB1B();
    Object.values(S).forEach((s) => tex(s));
    page = blankPage('smoke', 850, 1100, (g) => {
      g.fillStyle = '#D9D5CE';
      for (let i = 0; i < 18; i++) g.fillRect(90, 140 + i * 46, 670 - (i % 4) * 60, 18);
      g.fillStyle = F.hlYellow;
      g.fillRect(84, 136 + 5 * 46, 560, 26);
    });
  },
  draw(ctx, t, env) {
    const q = cueBook(env);
    desk(ctx);
    ctx.save();
    ctx.globalAlpha = edgeIn(t, env.dur);
    const C = cameraAt(t, [{ t: 0, pitch: 0.2 }, { t: q.w(0, 'stands'), dur: 1.2, pitch: 0.9 }]);
    sheet(ctx, C, page, { x: 960, y: 540, w: 700 });
    const up = clamp((t - q.w(0, 'up')) / 1.0);
    const foot = [[880, 560], [1040, 560], [1040, 660], [880, 660]];
    contactShadow(ctx, C, foot, { alpha: up });
    prism(ctx, C, foot, 0, 10 + 140 * up, { fill: F.paper });
    arrow3(ctx, C, [[700, 760, 0], [870, 640, 90]], clamp((t - q.w(0, 'desk')) / 0.8));
    tag(ctx, S.label, 80, 1010, { size: 40 });
    tag(ctx, S.eq, 1840, 120, { size: 50, align: 'right', write: clamp((t - 2) / 1) });
    ctx.restore();
  },
};
