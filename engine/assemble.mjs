#!/usr/bin/env node
// Concatenate rendered segments (render/NN-seg.mp4, each already carrying its audio)
// into out/<slug>.mp4, loudness-normalised to -16 LUFS. Prints chapter marks.
//
//   node engine/assemble.mjs <video-dir>        (or: bin/paperframe assemble <video>)

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ep = path.resolve(process.argv[2] || '');
if (!process.argv[2] || !fs.existsSync(path.join(ep, 'audio/timings.json'))) { console.error('usage: assemble.mjs <video-dir>  (the folder needs audio/timings.json and render/*.mp4)'); process.exit(1); }
const timings = JSON.parse(fs.readFileSync(path.join(ep, 'audio/timings.json'), 'utf8'));
const segs = timings.segments.map((s, i) => path.join(ep, 'render', `${String(i + 1).padStart(2, '0')}-${s.name}.mp4`));
const missing = segs.filter((f) => !fs.existsSync(f));
if (missing.length) { console.error(`missing renders (bin/paperframe render <video> all):\n  ${missing.join('\n  ')}`); process.exit(1); }

// Size-agnostic (landscape or `format: vertical`): stream copy keeps whatever render.mjs produced,
// but every segment must share one frame size or the concat is corrupt.
const sizes = [...new Set(segs.map((f) => execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', f]).toString().trim()))];
if (sizes.length > 1) { console.error(`segments have mixed frame sizes (${sizes.join(', ')}) — re-render them with one format`); process.exit(1); }

fs.mkdirSync(path.join(ep, 'out'), { recursive: true });
const out = path.join(ep, 'out', `${path.basename(ep)}.mp4`);
const list = path.join(ep, 'render', '.concat.txt');
fs.writeFileSync(list, segs.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join('\n'));
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list,
  '-c:v', 'copy', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out]);
fs.rmSync(list);
const dur = execFileSync('ffprobe', ['-v', 'quiet', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString().trim();
const mb = (fs.statSync(out).size / 1e6).toFixed(1);
let acc = 0;
const chapters = timings.segments.map((s) => { const c = `${String(Math.floor(acc / 60)).padStart(2, '0')}:${String(Math.floor(acc % 60)).padStart(2, '0')} ${s.name}`; acc += s.duration + timings.tail; return c; });
const shown = path.relative(process.cwd(), out);
console.log(`${shown.startsWith('..') ? out : shown}  ${sizes[0]}  ${Math.floor(+dur / 60)}:${String(Math.round(+dur % 60)).padStart(2, '0')}  ${mb} MB`);
console.log(chapters.join('\n'));
