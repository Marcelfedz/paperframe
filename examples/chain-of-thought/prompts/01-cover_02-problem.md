# 01 · cover (49.1 s) and 02 · problem (45.2 s) — the page, the line, the promise; scale isn't enough

Write two scenes: `scenes/01-cover.js` and `scenes/02-problem.js`. Shared data: `import { PAL, PH, P1, P2, FIG1, FIG4, FIG5 } from './_data.js'`. Facts and guardrails: `briefing.md`. Both scenes keep the rights switch at the top:

```js
// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars, same geometry) and redrawn figures.
const PAGES = true;
```

Pages: cover p. 1 (title, authors, abstract, Figure 1), plus small crops of p. 5 (Figure 4) and p. 6 (Figure 5) as thumbnails in its last beat. Problem: p. 2 (Section 1), then p. 1 (Figure 1, left column).

Text on these pages is real text: `findPhrase` works on the abstract, the body and every line inside Figure 1. Every phrase below is in `PH` (checked against `words.json`); pass `PH.x` rather than retyping. Figure 1 already carries the paper's own highlights (blue on the exemplar's chain, green on the generated chain): never run a multiply marker over those lines (yellow over blue turns green, which in this video means "output"). Point at them with `markBox` or an ink underline instead.

Ink underline that follows the voice (no kit helper; keep it in your scene, report it as a kit candidate): `highlight(ctx, C, page, pose, lines.map((L) => ({ ...L, y0: L.y1 - 3 })), p, { color: PAL.cotInk, alpha: 1, pad: 2 })`.

Timing quirk: when an override is followed by punctuation (`{PaLM|palm},`), `timings.json` stores the comma as its own word. Indices below already count it (cover s5: `PaLM` is w4, the comma w5).

## Colours for the whole video (this cover teaches them)

From `PAL`, sampled from the paper's own figures:

- Chain of thought = `PAL.cot` fill / `PAL.cotInk` outline: the blue the paper uses for the reasoning in Figure 1 (and for the CoT line in Figures 4, 7, 8).
- Standard prompting = `PAL.std` / `PAL.stdInk`: neutral grey (Figure 4 draws it as a thin black line).
- Model output, correct = `PAL.out` / `PAL.outInk`: Figure 1's green (Model Output tab, the green highlight, ✓).
- Wrong = `PAL.bad` / `PAL.badInk`: Figure 1's red ✗.
- Input / question = `PAL.input` / `PAL.inputInk` (Figure 1's grey frames). Later: `PAL.prior` orange = "prior supervised best"; `PAL.human` dark green = human reference.
- Markers: `F.hlYellow` = verbatim line read by the voice; `F.hlMint` = paraphrase, names, places; `F.hlBlue` = the paper's own coinage.

Beat 5 and the pause teach blue / green / red on Figure 1 itself.

## cover — p. 1

| s | start | text |
|---|---|---|
| 0 | 0.00 | This is page one of a paper that went up on arXiv on January twenty-eighth, twenty twenty-two. |
| 1 | 6.27 | Nine authors, from Google Research's Brain Team. |
| 2 | 9.60 | The abstract opens with the claim. |
| 3 | 11.97 | Generating a chain of thought, a series of intermediate reasoning steps, significantly improves the ability of large language models to perform complex reasoning. |
| 4 | 22.54 | No training, just a few worked examples in the prompt, with the reasoning written out. |
| 5 | 27.76 | With eight of them, PaLM, at five hundred and forty billion parameters, reached state-of-the-art accuracy on GSM8K, a benchmark of math word problems. |
| 6 | 38.41 | By the end, you'll know what a chain-of-thought prompt looks like, why it only works in large models, and which simpler explanations the authors tested. |
| — | 47.1–49.1 | pause |

1. s0 — p. 1 slides onto the desk with a small arc; the camera reads the whole page, Figure 1 visible at the bottom. Stamp `cite(p1, { label: 'p.~1', rect: P1.title })`. On "January twenty-eighth, twenty twenty-two" (w13–16) a TeX tag lands on the desk beside the page: `\texttt{arXiv:2201.11903}` over `\text{v1} \cdot \text{28 January 2022}`. Right after, a light `markBox` (ink) on `P1.stampDate` (the side stamp's "10 Jan 2023") with a small tag `\text{v6 shown} \cdot \text{10 January 2023}`, so the two dates don't read as a contradiction.
2. s1 — mint marker on the nine names (`PH.authors`, nine `findPhrase` calls), staggered across "Nine authors" (w0–1) so all nine are lit by w2; then mint on `PH.affil` ("Google Research, Brain Team") on "Google Research's Brain Team" (w3–6). Stamp rect `P1.authors`.
3. s2 "The abstract opens with the claim." — camera pushes into the abstract (`P1.abstract`, about ×1.6). On "abstract" (w1) a thin ink underline under the heading `findPhrase(p1, 'Abstract')`.
4. s3 — the key line, read verbatim: yellow marker with `sayP(env, 3, t)` over `PH.key` (3 lines: 584,843–1300,868 · 400,874–1300,898 · 400,904–621,929). Camera holds at ≈ ×2 on those lines. Hold 0.3 s after the last word, then the strip lifts off (`liftPose`, crop x 396–1304, y 840–932, pad 3 px vertically, `tilt` ≈ camera pitch so it faces the camera) and lands large in the upper half of the desk. As it lands, a `PAL.cotInk` underline draws under "chain of thought—a series of intermediate reasoning steps" on the strip: blue is the chain of thought from here on.
5. s4 "No training, just a few worked examples in the prompt, with the reasoning written out." — the strip slides back; camera eases down to Figure 1 (`FIG1.all`), stamp `p.~1 \cdot \text{Figure 1}`. On "No training" (w0–1) a small tag on the desk `\text{same model, no finetuning}` (source p. 9; tag `\text{p.~9}` in small type). On "worked examples in the prompt" (w5–9) ink `markBox` on `FIG1.cot.exemplar`. On "the reasoning written out" (w11–14) `markBox` in `PAL.cotInk` around the paper's blue lines (`FIG1.cot.chainLines`, two rects). No marker on Figure 1.
6. s5 — camera back up to the abstract's last lines (y 1090–1210). Mint marker with the voice (the voice paraphrases) over `PH.eight` (3 lines) using `sayWords(env, 5, 0, 24, t)`. On "eight" (w1) a TeX tag `\text{8 exemplars}` near the line; on "GSM8K" (w17) a tag `\text{GSM8K: math word problems}`. Stamp rect follows (`P1.abstract`).
7. s6 the promise — three thumbnails land in a row on the desk below the page, each on its words, as small paper crops with shadows: "what a chain-of-thought prompt looks like" (w5–10) → `FIG1.cot.input` from p. 1; "why it only works in large models" (w11–17) → `FIG4.sub.gsm8k.palm` from p. 5 (or the whole GSM8K row, x 960–1387, y 341–560, if the single subplot is too small to read as a plot); "which simpler explanations the authors tested" (w19–24) → `FIG5.all` from p. 6. No labels on the thumbnails; they come back later. Stamp stays `p.~1`.
8. Pause (47.1–49.1) — Figure 1's two Model Output frames slide forward side by side in front of the thumbnails: `FIG1.std.output` with its ✗ (outline `PAL.bad`) and `FIG1.cot.output` with the green chain and ✓ (outline `PAL.out`). Under them, small tags `\text{standard}` in `PAL.stdInk` and `\text{chain of thought}` in `PAL.cotInk`. Slow yaw ≤ 0.3 rad. This is the colour lesson: grey standard, blue chain, green right, red wrong.

Stamp rule: `p.~1` throughout, rect following the region in focus (title, authors, abstract, Figure 1).

Guardrails (cover):

- s3 is the only yellow (verbatim) line. Everything else is mint or ink.
- The abstract says "three large language models"; the paper later uses five. Don't mark or zoom on "Experiments on three large language models" (abstract, line y 1031).
- No "first", no citation counts, no awards (none sourced), no adoption claims. The thumbnails are previews, not claims.
- "No finetuning" is sourced from p. 9 ("No language models were finetuned in the process of writing this paper."), not p. 1: keep the small `p.~9` on that tag.
- TeX: no `§`, escape `%`, no `\boxed{}`. Card and slab colour in the fill or outline, never a coloured band on one edge.

## problem — p. 2, then p. 1

| s | start | text |
|---|---|---|
| 0 | 0.00 | Page two starts from a limit. |
| 1 | 2.31 | Scaling up model size alone, the paper says, had not proved sufficient for arithmetic, commonsense, and symbolic reasoning. |
| 2 | 10.38 | There were two ideas to build on. |
| 3 | 12.79 | One: train a model to write out its reasoning before the answer. |
| 4 | 16.57 | It works, but writing a large set of good rationales is costly. |
| 5 | 20.77 | Two: prompting. |
| 6 | 22.07 | Show a large model a few questions with their answers, and it picks up the task. |
| 7 | 26.77 | No training. |
| 8 | 28.23 | On reasoning, though, it works poorly, and a bigger model often doesn't help. |
| 9 | 32.94 | Figure one, left side. |
| 10 | 34.67 | One solved example: Roger's tennis balls, the answer is eleven. |
| 11 | 38.97 | Then a new question, about a cafeteria's apples. |
| 12 | 42.38 | The model answers twenty-seven. |
| 13 | 44.50 | Wrong. |

1. s0 — p. 2 slides in on an arc; camera on Section 1's first paragraph (x 300–945, y 200–560). Stamp `p.~2 \cdot \text{Section 1}`.
2. s1 — mint marker with the voice (it paraphrases: "had" for "has", "the paper says" inserted) over `PH.scaling` (one line, 300,464–893,489) during w0–11 (`sayWords(env, 1, 0, 11, t)`), then mint over `PH.threeKinds` (first match, 300,525–872,550) during w12–17. Three small TeX tags drop beside the column as the voice names them: `\text{arithmetic}` (w13), `\text{commonsense}` (w14), `\text{symbolic}` (w16).
3. s2 "There were two ideas to build on." — mint on `findPhrase(p2, 'motivated by two ideas')` on "two ideas" (w2–3). A `blankPage` sheet slides in at the right of p. 2: two columns headed `\text{rationales}` and `\text{prompting}` (plain TeX headings, no number badges). Tag the sheet `\text{illustrative}`.
4. s3–s4 "One: train a model to write out its reasoning before the answer. It works, but writing a large set of good rationales is costly." — mint on `PH.rationales` (2 lines) during s3 w5–11; on "train" (s3 w1) quick mint on `PH.trainScratch` and `PH.finetune`. On the sheet's left column: a model block (thin slab, `PAL.model`, ink outline) with a stack of hand-written cards feeding into it, cards as ruled grey lines only, no text. On "large set" (s4 w5–6) the card stack grows tall; on "costly" (s4 w11) a tag `\text{costly}` in `PAL.badInk` and mint on `PH.costly` (one line, 530,1131–1164,1156; the camera moves down the page for it).
5. s5–s7 "Two: prompting. … No training." — on the sheet's right column: the same model block, no card stack, a short prompt of three small question → answer card pairs in front of it (grey `PAL.input` / `PAL.out`, no chain part). Mint on `PH.prompt` (2 lines) during s6 w0–15. On "No training." (s7) tag `\text{no training}` under the block.
6. s8 "On reasoning, though, it works poorly, and a bigger model often doesn't help." — mint on `PH.poorly` (2 lines) during w0–12. On "a bigger model" (w7–9) the right-column model block grows to twice its size; on "doesn't help" (w11–12) its output card stays the same grey, unchanged. No curves, no numbers here: this is the paper's sentence, not a plot.
7. s9 "Figure one, left side." — p. 1 slides back in (p. 2 pushed off; the sketch sheet shrinks to a corner and stays until s11). Camera on Figure 1's left column (`FIG1.std.input` + `FIG1.std.output`). Stamp `p.~1 \cdot \text{Figure 1}`. On "left side" (s9 w2–3) ink `markBox` on `FIG1.std.head` ("Standard Prompting").
8. s10–s11 — on "One solved example" (s10 w0–2) ink `markBox` on `FIG1.std.exemplar`; mint on `findPhrase(p1, 'The answer is 11.')` (first match, the left column, 376,1436–533,1458) on "the answer is eleven" (w6–9). On "a new question" (s11 w1–3) ink `markBox` on `FIG1.std.question`; mint on its three lines during w4–7. (No paper highlights in the left column, so markers are fine here.)
9. s12–s13 "The model answers twenty-seven. Wrong." — the Model Output frame (`FIG1.std.output`) lifts off (`liftPose`) and lands large at the centre, standing. On "twenty-seven" (s12 w3) a thin ink box around "27." inside the crop (`findPhrase(p1, PH.fig1Wrong)` gives the line). On "Wrong." (s13) the paper's ✗ (`FIG1.std.x`) pulses, a red strike line (`PAL.bad`) draws through "27", and the card's outline turns `PAL.bad`. Hold to the end. The right answer stays hidden until segment 3.

Stamp: `p.~2 \cdot \text{Section 1}` for beats 1–6, `p.~1 \cdot \text{Figure 1}` from beat 7.

Guardrails (problem):

- The two-ideas sheet is ours (illustrative, labelled). Its cards carry no text and no numbers; "costly" and "no training" are the paper's points (p. 2), not measurements.
- Don't name prior systems on the sheet. Ling et al. 2017 and Cobbe et al. 2021 are only highlighted where the page prints them.
- Figure 1 is an illustration of the format. Never say or suggest that the Roger example is one of the eight exemplars the authors used (Table 20, p. 35, holds eight other problems).
- Don't reveal "9" in this segment.
- All page highlights in this segment are mint (the voice paraphrases every line).
- TeX: no `§`; escape `%`. Card colour in the fill or outline, never a coloured band on one edge.
