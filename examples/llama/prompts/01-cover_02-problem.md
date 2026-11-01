# 01 · cover (47.5 s) and 02 · problem (41.7 s) — the page, the claim, the bet on inference

Write two scenes: `scenes/01-cover.js` and `scenes/02-problem.js`. Shared data: `import { PAL, MODELS, GPT3_PARAMS, P1, T1, T3, FIG1, FIG1_TRACE, TOKENS } from './_data.js'`. Facts and guardrails: `briefing.md`.

Every scene starts with the rights switch:

```js
// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars) and redrawn figures.
const PAGES = true;
```

Pages are A4 here: 1654 × 2339 px at 200 dpi, not the 1700 × 2200 of the ReAct example. Every box below is in those page px.

## Colours for the whole video (the cover teaches them)

From `PAL`, sampled from the paper's Figure 1 (p. 3) and Figure 2 (p. 8):

- The four sizes keep Figure 1's line colours: 7B `PAL.m7` blue, 13B `PAL.m13` orange, 33B `PAL.m33` green, 65B `PAL.m65` red. Fills `PAL.m7Fill` … `PAL.m65Fill`, outlines in the full colour. `MODELS[i].color` / `.fill` carry the same values.
- Other models are neutral: GPT-3 `PAL.gpt3` / `PAL.gpt3Fill` (light grey), PaLM `PAL.palm` / `PAL.palmFill` (dark grey). Chinchilla gets Figure 2's purple (`PAL.chinchilla`) when it appears in segment 5.
- Red is the 65B model in this video. It never means "wrong" or "struck out": strike with an `F.ink` line, mark a loss with an ink outline.
- Markers: yellow `F.hlYellow` for a line the voice reads verbatim, mint `F.hlMint` for names and paraphrases, blue `F.hlBlue` for the paper's own coinage ("LLaMA").

## cover — page p. 1; small crops of p. 2 (Table 1) and p. 4 (Table 3) in the last beat

| s | start | text |
|---|---|---|
| 0 | 0.00 | This is page one of a paper that went up on arXiv on February twenty-seventh, twenty twenty-three. |
| 1 | 6.32 | Fourteen authors, all at Meta AI. |
| 2 | 9.16 | It introduces LLaMA, language models from seven to sixty-five billion parameters, and its main claim is about data. |
| 3 | 17.23 | It is possible to train state-of-the-art models using publicly available datasets exclusively, without resorting to proprietary and inaccessible datasets. |
| 4 | 27.33 | Its second claim is about size: the thirteen-billion model outperforms GPT-3, at a hundred and seventy-five billion, on most benchmarks. |
| 5 | 36.95 | And it ends with a release: all the models, to the research community. |
| 6 | 41.26 | By the end, you'll know what went into them, and how far the comparisons go. |
| — | 45.53–47.51 | pause |

Word indices count the punctuation tokens that follow `{Display|spoken}` overrides: in s1 "Meta" is w4, "AI" w5, "." w6; in s2 "LLaMA" is w2 and "," w3.

### Beats

1. s0 — p. 1 slides onto the desk with a small arc; the camera reads the whole page (zoom ≈ 0.9). On "arXiv" (w11) `markBox` the vertical side stamp (`P1.sideStamp`, thin `F.ink2` line; it is vertical text, so box it, don't highlight it). On "February twenty-seventh, twenty twenty-three" (w13–16) a TeX tag on the desk beside the stamp: `\texttt{arXiv:2302.13971v1}` over `\text{27 Feb 2023}`.
2. s1 "Fourteen authors, all at Meta AI." — mint marker over the 14 names in reading order, staggered across w0–3 (each name is its own `findPhrase`, list below). A small desk tag `\text{14 authors}` on "Fourteen" (w0). On "Meta AI" (w4–5) mint on `Meta AI`.
3. s2 — camera pushes into the abstract (`P1.abstract`, zoom ≈ 1.6). On "LLaMA" (w2) blue marker on `called LLaMA` (right column, the paper naming its models) while mint runs with the voice over `We introduce LLaMA, a collection of founda- tion language models ranging from 7B to 65B parameters` during w0–11 (`sayWords(env, 2, 0, 11, t)`). On "seven to sixty-five billion parameters" (w7–11) four slabs rise on the desk to the right of the page, one per word group, in `MODELS` order: heights ∝ `MODELS[i].params` (one scale for the whole video, e.g. 2.2 world px per billion, so 65B ≈ 143 px), footprints equal, fills `MODELS[i].fill`, outlines `MODELS[i].color`, TeX labels `\text{7B}`, `\text{13B}`, `\text{33B}`, `\text{65B}` in the same colours. On "main claim is about data" (w13–18) the camera eases to the four abstract lines of beat 4 (y 762–886).
4. s3 — the verbatim line: yellow marker with `sayP(env, 3, t)` over the phrase below (4 lines: 526,762–756,786 · 244,795–760,819 · 244,828–756,853 · 244,861–707,886). Hold 0.4 s after "datasets." (w18), then the four lines lift off as one strip (crop `{ x0: 238, y0: 758, x1: 764, y1: 890 }`; it carries "of tokens, and show that" at the start of line 1 and "In" at the end of line 4, which is fine, or crop line 1 from x 520 and line 4 to x 712; pad 3 px vertically, `tilt` ≈ camera pitch so it faces the camera) and land large, upper centre. As it lands, an `F.ink` underline under "publicly avail- able datasets exclusively" on the strip.
5. s4 — the strip slides off to the upper left; camera back to the abstract: mint with the voice over `LLaMA-13B outperforms GPT-3 (175B) on most benchmarks` (2 lines) during w7–20 (`sayWords(env, 4, 7, 20, t)`). Camera pitches to ≈ 0.85 over the slabs: on "thirteen-billion" (w7) the 13B slab pulses; on "a hundred and seventy-five billion" (w13–17) a GPT-3 slab rises beside it at the same scale (`GPT3_PARAMS` = 175, ≈ 385 px: it towers over all four), `PAL.gpt3Fill` at 70 % opacity, `PAL.gpt3` outline, label `\text{GPT-3, 175B}`. On "most benchmarks" (w19–20) a small tag `\text{most benchmarks (abstract)}` beside the 13B slab. No ratio on screen.
6. s5 — camera back down to p. 1 (pitch ≈ 0.2): mint with the voice over `We release all our models to the research community` during w6–12. On "release" (w5) the GPT-3 slab sinks away; the four LLaMA slabs slide a little towards the viewer, as a group. On "research community" (w11–12) mint on the footnote URL `https://github.com/facebookresearch/llama` (`P1.footnoteURL`); keep the camera at zoom ≤ 1.3 here so the e-mail line above it never reads large.
7. s6 the promise — two small paper crops land on the desk with shadows, each on its words: "what went into them" (w5–8) → Table 1 from p. 2 (`T1.box`); "how far the comparisons go" (w10–14) → Table 3 from p. 4 (`T3.box`). They reappear in segments 3 and 5. No labels needed.
8. Pause (45.53–47.51): slow yaw ≤ 0.3 rad over the slabs and the two crops.

Stamp throughout: `cite(p1, { label: '\\text{p.~1}', rect, side: 'right' })`, `rect` following the region in focus (`P1.sideStamp`, `P1.authors`, `P1.abstract`, `P1.footnoteURL`). In beat 7 the stamp switches to `p.~2 \cdot \text{Table 1}` and `p.~4 \cdot \text{Table 3}` as each crop lands.

### Exact phrases (p. 1, all checked against `words.json`)

| Phrase | Marker | When |
|---|---|---|
| `Hugo Touvron`, `Thibaut Lavril`, `Gautier Izacard`, `Xavier Martinet`, `Marie-Anne Lachaux`, `Timothee Lacroix`, `Baptiste Rozière`, `Naman Goyal`, `Eric Hambro`, `Faisal Azhar`, `Aurelien Rodriguez`, `Armand Joulin`, `Edouard Grave`, `Guillaume Lample` | mint | s1 w0–3, staggered |
| `Meta AI` | mint | s1 w4–5 |
| `called LLaMA` | blue | s2 w2 |
| `We introduce LLaMA, a collection of founda- tion language models ranging from 7B to 65B parameters` | mint | s2 w0–11 |
| `it is possible to train state-of-the-art models using publicly avail- able datasets exclusively, without resorting to proprietary and inaccessible datasets` | yellow | s3, `sayP` |
| `LLaMA-13B outperforms GPT-3 (175B) on most benchmarks` | mint | s4 w7–20 |
| `We release all our models to the research community` | mint | s5 w6–12 |
| `https://github.com/facebookresearch/llama` | mint | s5 w11–12 |

Pass hyphenated phrases exactly as written (`founda- tion`, `avail- able`): the page keeps the line-break hyphen in the word.

### Real and illustrative (cover)

Real: the date and arXiv id (p. 1 side stamp, abs page), 14 authors, Meta AI, 7B–65B, GPT-3's 175B (abstract), the slab heights (Table 2's parameter counts, labelled with the model names). Nothing illustrative except the slab layout.

### Guardrails (cover)

- s3 is the only verbatim quote: yellow. Everything else is mint or no marker.
- "Outperforms … on most benchmarks" is the abstract's claim; segment 5 shows where it holds and where it doesn't. Show sizes (13B, 175B), never a ratio ("10×", "13.5×").
- The paper is an arXiv preprint: no venue, no award, no citation counts, no "first", no "open source" on screen.
- Never zoom in on the p. 1 footnote's e-mail addresses.

## problem — pages p. 1 (Section 1), p. 3 (Figure 1)

| s | start | text |
|---|---|---|
| 0 | 0.00 | Earlier work by Hoffmann and colleagues found that, for a fixed training budget, smaller models trained on more data do best. |
| 1 | 7.55 | But that counts only the cost of training. |
| 2 | 10.02 | Serve a model at scale, the paper argues, and the inference budget becomes critical. |
| 3 | 15.47 | The preferred model is not the fastest to train but the fastest at inference. |
| 4 | 20.45 | Hoffmann's work recommends a ten-billion-parameter model on two hundred billion tokens. |
| 5 | 26.21 | The authors find a seven-billion model still improving after a trillion. |
| 6 | 30.72 | So the plan is to train smaller models on more tokens than is typical. |
| 7 | 35.31 | Figure one: training loss for all four sizes. |
| 8 | 38.48 | When training stops, every curve is still sloping down. |

### Beats

1. s0 — p. 1 is on the desk (hard cut from the cover, same page); camera on the left column of the introduction (`P1.introLeft`, lower half, zoom ≈ 1.8). Mint with the voice over `for a given compute budget, the best performances are not achieved by the largest mod- els, but by smaller models trained on more data` (3 lines) during w8–20. Stamp `p.~1 \cdot \text{Section 1}`.
2. s1 "But that counts only the cost of training." — an `F.ink` underline draws under `training compute budget` (the page italicises *training*) on "training" (w7). On a `blankPage` to the right (SCHEMATIC, tag `\text{schematic}`): one solid slab labelled `\text{train once}`.
3. s2 — mint (paraphrase) over `this objective disregards the inference budget, which becomes critical when serving a language model at scale` (3 lines) during w0–13. On "Serve a model at scale" (w0–4) a long row of thin slabs runs out along the desk from the `train once` slab, one after another, labelled `\text{serve: every request}` (SCHEMATIC: no count, no numbers). An `F.ink` underline under `inference budget` on "inference budget" (w10–11).
4. s3 — the verbatim line: yellow with `sayP(env, 3, t)` over `the preferred model is not the fastest to train but the fastest at inference` (2 lines: 197,1939–803,1966 · 197,1976–426,2003). Then it lifts off as two strips stacked as one card: line 1 `{ x0: 193, y0: 1935, x1: 808, y1: 1970 }` and line 2 `{ x0: 193, y0: 1972, x1: 430, y1: 2007 }` (line 2 continues with ", and although it may be cheaper", which stays on the page). It parks at the back of the desk for the rest of the segment.
5. s4 — camera to the right column, first paragraph (`P1.rightHoffmann`). Mint over `Hoffmann et al. (2022) recommends training a 10B model on 200B tokens` (2 lines) during w0–10. Camera pitches to ≈ 0.85: a token axis lies along the desk from 0 to 1400 (ticks every 200, TeX `0`, `200\text{B}` … `1400\text{B}`, label `\text{training tokens}`). On "two hundred billion tokens" (w7–10) a neutral bar (`PAL.otherFill`, `PAL.other` outline) grows along the axis to 200, labelled `\text{10B model, 200B tokens}` and, smaller, `\text{Hoffmann et al. (2022)}`.
6. s5 — mint over `we find that the performance of a 7B model continues to improve even after 1T tokens` (3 lines) during w0–10. A `PAL.m7` bar grows to 1000 on "a trillion" (w9–10), labelled `\text{7B: still improving after 1T}`. No arrowhead past 1000: the paper says "after 1T", not how far.
7. s6 — mint over `by training on more tokens than what is typically used` (2 lines, right column, y 932–996) during w5–13. The other three bars join at their real lengths from `TOKENS.trained` (13B 1000, 33B 1400, 65B 1400), in `PAL.m13`, `PAL.m33`, `PAL.m65`, each labelled with its name; the Hoffmann bar stays for scale.
8. s7 — p. 3 slides in (p. 1 pushed off); Figure 1 (`FIG1.all`) lifts and stands up facing the camera at the back; stamp `p.~3 \cdot \text{Figure 1}`. Mint on the caption phrase `Training loss over train tokens` on "training loss" (w2–3). On "all four sizes" (w5–7) the four legend entries (`LLaMA 7B`, `LLaMA 13B`, `LLaMA 33B`, `LLaMA 65B`, all findable) get a marker in their own colour, in turn (use `F.hlMint` if a colour marker multiplies too dark).
9. s8 — camera at pitch ≈ 0.9: the four curves rise off the standing figure as 3D ribbons on the desk, from `FIG1_TRACE` (x = billion tokens on the same axis as beat 5, z = loss above a 1.5 baseline, one depth lane per model, colours `PAL.m7`…`PAL.m65`), tag `\text{traced from Figure 1}`. On "When training stops" (w0–2) a small end cap at each ribbon's last point (1000 for 7B and 13B, 1400 for 33B and 65B, from the caption). On "still sloping down" (w6–8) the last 100B tokens of each ribbon brighten, showing the downward slope. Hold to the end with a slow yaw ≤ 0.3 rad.

### Exact phrases

| Page | Phrase | Marker | When |
|---|---|---|---|
| p. 1 | `for a given compute budget, the best performances are not achieved by the largest mod- els, but by smaller models trained on more data` | mint | s0 w8–20 |
| p. 1 | `training compute budget` | ink underline | s1 w7 |
| p. 1 | `this objective disregards the inference budget, which becomes critical when serving a language model at scale` | mint | s2 w0–13 |
| p. 1 | `inference budget` | ink underline | s2 w10–11 |
| p. 1 | `the preferred model is not the fastest to train but the fastest at inference` | yellow | s3, `sayP` |
| p. 1 | `Hoffmann et al. (2022) recommends training a 10B model on 200B tokens` | mint | s4 w0–10 |
| p. 1 | `we find that the performance of a 7B model continues to improve even after 1T tokens` | mint | s5 w0–10 |
| p. 1 | `by training on more tokens than what is typically used` | mint | s6 w5–13 |
| p. 3 | `Training loss over train tokens` | mint | s7 w2–3 |
| p. 3 | `LLaMA 7B`, `LLaMA 13B`, `LLaMA 33B`, `LLaMA 65B` (legend) | model colour | s7 w5–7 |
| p. 3 | `LLaMA-33B and LLaMA- 65B were trained on 1.4T tokens`, `The smaller models were trained on 1.0T tokens` | mint, optional | s8 w0–2 |

### Boxes

- `FIG1.all` { 836, 526, 1450, 954 } (plot with tick labels and axis titles); `FIG1.frame` { 932, 553, 1442, 881 } (axes box); `FIG1.legend`; `FIG1.caption`.
- `FIG1.axis`: page x = 960.5 + tokensB × 0.3275; page y = 553 + (2.2 − loss) × 468.57. Use it if you draw anything on the flat figure that must line up with its curves.

### Real and illustrative (problem)

Real: 10B / 200B (Hoffmann, as quoted on p. 1), 7B after 1T (p. 1), 1.0T and 1.4T (Figure 1 caption, Table 2). Traced: the ribbons (`FIG1_TRACE`), labelled. Schematic: the "train once / serve every request" slabs, labelled, with no numbers.

### Guardrails (problem)

- Don't extrapolate the curves, don't draw arrows past their ends, don't print any loss value read from the trace. The figure's own tick labels are fine.
- "Still improving after 1T" is the authors' finding about the 7B model; "still sloping down" is what Figure 1 shows. Neither means "would improve forever".
- Hoffmann's numbers appear exactly as p. 1 quotes them. Don't add Chinchilla's own parameter or token counts.
- TeX: escape `%`; no `§` (write "Section 1"); no `\boxed{}`.
- Card and slab colour goes in the fill or the outline, never a coloured band on one edge. No numbered pills.
