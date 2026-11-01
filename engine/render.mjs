#!/usr/bin/env node
// Render scenes to video, or stills for review. Usually called through bin/paperframe.
//
//   node engine/render.mjs <video-dir> <seg>                 -> <video>/render/NN-seg.mp4 (with audio)
//   node engine/render.mjs <video-dir> <seg> --stills 12     -> <video>/review/<seg>/*.png + contact.png
//   node engine/render.mjs <video-dir> <seg> --at 1.5,4,9.2  -> stills at exact times
//   node engine/render.mjs <video-dir> all                   -> every segment
//   node engine/render.mjs <video-dir> <seg> --serve         -> print live-preview URL and keep serving
//   node engine/render.mjs <video-dir> <seg> --scene thumb --at 0 -> stills of scenes/thumb.js (against <seg>'s timing)
//                                                                  into review/thumb/ (thumbnails, covers)
//   --workers N   parallel browser pages for a video render (default 6)
//
// Frame format comes from narration.md's header (the lines before the first `## `):
// `format: vertical` -> 1080×1920; anything else / absent -> 1920×1080.
//
// The repo root is served as `/`, so scenes import the kit root-absolute (/engine/folio.js).
// Frames are pure functions of time, so workers render disjoint frame ranges in parallel
// and the chunks are concatenated.

import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30;
const args = process.argv.slice(2);
const flag = (k, d) => { const i = args.indexOf(k); return i < 0 ? d : args[i + 1] ?? true; };
const [epArg, segArg] = args;
if (!epArg || !segArg) { console.error('usage: render.mjs <video-dir> <seg|all> [--stills N | --at t1,t2 | --serve] [--workers N]'); process.exit(1); }
const EP = path.relative(ROOT, path.resolve(epArg));
const TPATH = path.join(ROOT, EP, 'audio/timings.json');
if (!fs.existsSync(TPATH)) { console.error(`no ${path.relative(ROOT, TPATH)}: make the narration audio first (bin/paperframe audio ${EP})`); process.exit(1); }
const timings = JSON.parse(fs.readFileSync(TPATH, 'utf8'));
if (segArg !== 'all' && !timings.segments.some((s) => s.name === segArg)) {
  console.error(`no segment "${segArg}" in ${path.relative(ROOT, TPATH)} (segments: ${timings.segments.map((s) => s.name).join(', ')})`);
  process.exit(1);
}
const WORKERS = +flag('--workers', 6);
const narrPath = path.join(ROOT, EP, 'narration.md');
const header = fs.existsSync(narrPath) ? fs.readFileSync(narrPath, 'utf8').split(/\n## /)[0] : '';
const FORMAT = (header.match(/^format:\s*(\w+)\s*$/m)?.[1] || 'landscape').toLowerCase();
const [FW, FH] = FORMAT === 'vertical' ? [1080, 1920] : [1920, 1080];
if (FORMAT !== 'landscape') console.log(`format: ${FORMAT} (${FW}×${FH})`);

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.wav': 'audio/wav', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;
const SCENE = flag('--scene', null);
// a --scene override is for stills only: a video render would overwrite render/NN-seg.mp4 with the wrong scene
if (SCENE && !flag('--at') && !flag('--stills') && !args.includes('--serve')) { console.error('--scene needs --at, --stills or --serve'); process.exit(1); }
const url = (seg, extra = '') => `http://127.0.0.1:${PORT}/engine/frame.html?ep=${encodeURIComponent(EP)}&seg=${seg}&w=${FW}&h=${FH}${SCENE ? `&scene=${SCENE}` : ''}${extra}`;

if (args.includes('--serve')) {
  console.log(`preview: ${url(segArg, '&play=1')}`);
  await new Promise(() => {});
}

const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text'] });

async function openPage(seg) {
  const page = await browser.newPage({ viewport: { width: FW, height: FH }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => { console.error(`[${seg}] page error: ${e.message}`); process.exitCode = 1; });
  page.on('console', (m) => { if (m.type() === 'error') console.error(`[${seg}] ${m.text()}`); });
  await page.goto(url(seg));
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  return page;
}

const grab = (page, t) => page.evaluate((t) => { window.__draw(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, t);

async function stills(seg, times) {
  const dir = path.join(ROOT, EP, 'review', SCENE || seg);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const page = await openPage(seg);
  const files = [];
  for (const t of times) {
    const f = path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.png`);
    fs.writeFileSync(f, Buffer.from(await grab(page, t), 'base64'));
    files.push(f);
  }
  // contact sheet (4 columns, timestamp labels) composed in the page — no ffmpeg drawtext dependency
  const sheet = await page.evaluate(async ({ imgs, times, w, h }) => {
    const cols = 4, rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas');
    cv.width = cols * w; cv.height = rows * h;
    const g = cv.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < imgs.length; i++) {
      const im = new Image();
      im.src = 'data:image/png;base64,' + imgs[i];
      await im.decode();
      const x = (i % cols) * w, y = Math.floor(i / cols) * h;
      g.drawImage(im, x, y, w, h);
      g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(x + 6, y + 6, 92, 28);
      g.fillStyle = '#fff'; g.font = '600 18px ui-monospace, monospace'; g.fillText(times[i].toFixed(2) + 's', x + 12, y + 26);
    }
    return cv.toDataURL('image/png').split(',')[1];
  }, { imgs: files.map((f) => fs.readFileSync(f).toString('base64')), times, w: FW / 4, h: FH / 4 });
  fs.writeFileSync(path.join(dir, 'contact.png'), Buffer.from(sheet, 'base64'));
  await page.close();
  console.log(`[${seg}] ${files.length} stills -> ${path.relative(ROOT, dir)}/contact.png`);
}

async function video(seg) {
  const i = timings.segments.findIndex((s) => s.name === seg);
  const timing = timings.segments[i];
  const dur = timing.duration + timings.tail;
  const N = Math.ceil(dur * FPS);
  const outDir = path.join(ROOT, EP, 'render');
  const tmp = path.join(outDir, `.tmp-${seg}`);
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  const per = Math.ceil(N / WORKERS);
  const t0 = Date.now();
  let done = 0;
  const chunks = await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const a = w * per, b = Math.min(N, a + per);
    if (a >= b) return null;
    const file = path.join(tmp, `chunk-${String(w).padStart(2, '0')}.mp4`);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', file]);
    const page = await openPage(seg);
    for (let f = a; f < b; f++) {
      const buf = Buffer.from(await grab(page, f / FPS), 'base64');
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (++done % 150 === 0) process.stdout.write(`\r[${seg}] ${done}/${N} frames`);
    }
    await page.close();
    ff.stdin.end();
    await new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error(`ffmpeg chunk ${w} exited ${c}`)))));
    return file;
  }));
  const list = path.join(tmp, 'list.txt');
  fs.writeFileSync(list, chunks.filter(Boolean).map((f) => `file '${f}'`).join('\n'));
  const out = path.join(outDir, `${String(i + 1).padStart(2, '0')}-${seg}.mp4`);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-i', path.join(ROOT, EP, 'audio', timing.file),
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-af', `apad=whole_dur=${(N / FPS).toFixed(3)}`, '-t', (N / FPS).toFixed(3), out]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`\r[${seg}] ${N} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${path.relative(ROOT, out)}`);
}

try {
  const segs = segArg === 'all' ? timings.segments.map((s) => s.name) : [segArg];
  for (const seg of segs) {
    const timing = timings.segments.find((s) => s.name === seg);
    if (!timing) throw new Error(`no segment "${seg}" in timings.json (segments: ${timings.segments.map((s) => s.name).join(', ')})`);
    const dur = timing.duration + timings.tail;
    if (flag('--at')) await stills(seg, String(flag('--at')).split(',').map(Number));
    else if (flag('--stills')) { const n = +flag('--stills'); await stills(seg, Array.from({ length: n }, (_, k) => +(((k + 0.5) / n) * dur).toFixed(2))); }
    else await video(seg);
  }
} catch (err) {
  console.error(`render: ${err.message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
