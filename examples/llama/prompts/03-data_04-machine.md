# 03 · data (42.7 s) and 04 · machine (45.8 s) — Table 1 as a block, the three borrowed changes, Table 2 and the GPUs

Write two scenes: `scenes/03-data.js` and `scenes/04-machine.js`. Shared data: `import { PAL, MODELS, P1, T1, T2, P3, TRAIN65, GPU_GRID } from './_data.js'`. Facts and guardrails: `briefing.md`. Colours were taught in the cover (`prompts/01-cover_02-problem.md`, "Colours for the whole video"): keep them. Red is the 65B model, never "wrong"; strike with `F.ink`.

Every scene starts with the rights switch:

```js
// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars) and redrawn figures.
const PAGES = true;
```

Pages are A4: 1654 × 2339 px at 200 dpi. Every box is in those page px.

Gotcha for both scenes: `findPhrase` returns the first match in `words.json` order, which is column order, not reading order. A short phrase like `Table 1:` or `Table 2:` matches an in-text reference before the caption. Use the caption boxes in `_data.js` (`T1.caption`, `T2.caption`) or the unique caption phrases listed below.

## data — pages p. 2 (Section 2.1, Table 1), p. 3 (one paragraph), p. 1 (one line)

| s | start | text |
|---|---|---|
| 0 | 0.00 | Table one is the training data. |
| 1 | 2.37 | Sixty-seven percent is English web pages from CommonCrawl, deduplicated and filtered for quality. |
| 2 | 9.02 | Fifteen percent is C4, another processed version of CommonCrawl. |
| 3 | 13.79 | The rest comes in small slices: GitHub code, Wikipedia, books, arXiv papers, and Stack Exchange answers. |
| 4 | 21.17 | About one point four trillion tokens in all. |
| 5 | 23.96 | Most are seen once. |
| 6 | 25.46 | Wikipedia and the books, about twice. |
| 7 | 27.95 | Every source met one restriction: publicly available, and compatible with open sourcing. |
| 8 | 33.71 | Other models, the introduction says, use data that is not public or not documented, such as a source listed only as books, two terabytes. |

Word indices count the punctuation token after an override: in s1 "CommonCrawl" is w7 and "," w8; in s2 "C4" is w3, "," w4, "CommonCrawl" w9.

### Beats

1. s0 — p. 2 slides in with a small arc. Table 1 (`T1.box` plus `T1.caption`) lifts off and stands at the back left, facing the camera; stamp `p.~2 \cdot \text{Table 1}`. Mint on `Table 1: Pre-training data.` (the caption's bold title; the short `Pre-training data.` matches the Section 2.1 heading first, so pass the longer phrase or `nth = 2`) on "training data" (w4–5).
2. s1 — camera pitches to ≈ 0.85. The data block starts: a 3D stack of layers on a square footprint (about 460 × 460 world px), total height ≈ 420 px for 100 %, so each layer's thickness = `prop` × 4.2. On "Sixty-seven percent" (w0–1) the CommonCrawl layer (`PAL.web`, 281 px) rises; its Table 1 row boxed on the standing table (`T1.rows[0]`, prop column); label `\text{CommonCrawl}\;\; 67.0\%`. On "deduplicated and filtered for quality" (w9–13) two small tags slide onto the layer: `\text{deduplicated}` and `\text{quality-filtered}` (paraphrases of p. 2, Section 2.1; stamp `p.~2 \cdot \text{Section 2.1}` while they're on).
3. s2 — on "Fifteen percent" (w0–1) the C4 layer (`PAL.c4`, 63 px) settles on top; row boxed; label `\text{C4}\;\; 15.0\%`. On "another processed version of CommonCrawl" (w5–9) a thin `F.ink2` bracket links the C4 label to the CommonCrawl label.
4. s3 "The rest comes in small slices" — five thin layers drop on, one per word: GitHub on "GitHub" (w6), Wikipedia on "Wikipedia" (w8), books on "books" (w9), arXiv on "arXiv" (w10), Stack Exchange on "Stack Exchange" (w13–14), colours `PAL.github`, `PAL.wikipedia`, `PAL.books`, `PAL.arxiv`, `PAL.stackexchange`. They are thin (19, 19, 19, 10.5, 8.4 px): put their labels in a column beside the block with thin leader lines, each with its printed percentage (`4.5\%`, `4.5\%`, `4.5\%`, `2.5\%`, `2.0\%`). Each Table 1 row is boxed as its layer lands.
5. s4 — tag on top of the block: `\approx 1.4\text{T tokens}` on "one point four trillion tokens" (w1–5). A short strip lifts from p. 3 (`P3.overall`, stamp `p.~3`): mint on `roughly 1.4T tokens after tokenization`.
6. s5–s6 — on "Most are seen once" (s5) the block's layers stay single. On "Wikipedia and the books" (s6 w0–3) those two layers lift out, and on "about twice" (w4–5) each gets a second copy stacked beside it (ghosted fill, same outline), with the table's epochs as tags: `2.45` and `2.23` (`\text{epochs}`), their epochs cells boxed on the standing table. Mint on the p. 3 strip: `with the exception of the Wikipedia and Books domains, over which we perform ap- proximately two epochs` (part of the longer phrase below; pass the exact substring). Don't comment on GitHub's 0.64: it's on the table, nobody says it.
7. s7 — camera back to p. 2, the Section 2.1 paragraph (stamp `p.~2 \cdot \text{Section 2.1}`). Mint on `the restriction of only using data that is` during w2–4 ("met one restriction"), then yellow with the voice over `publicly available, and compatible with open sourcing` during w5–11 (`sayWords(env, 7, 5, 11, t)`: the voice reads these words verbatim). A thin glass band wraps the block with the label `\text{publicly available (authors' restriction)}`.
8. s8 — p. 1 slides in (p. 2 pushed off), camera on `P1.rightData`, stamp `p.~1 \cdot \text{Section 1}`. Mint with the voice over `not publicly available or undocumented` during w5–13 ("use data that is not public or not documented"). On "books, two terabytes" (w21–23) an `F.ink` `markBox` around `“Books – 2TB”` and a small tag `\text{undocumented}` beside it. No red, no strike-through of the paper's own words.

### Exact phrases

| Page | Phrase | Marker | When |
|---|---|---|---|
| p. 2 | `Table 1: Pre-training data.` (not `Pre-training data.` alone: that hits the 2.1 heading) | mint | s0 w4–5 |
| p. 2 | `English CommonCrawl [67%].`, `C4 [15%].`, `Github [4.5%].`, `Wikipedia [4.5%].`, `Gutenberg and Books3 [4.5%].`, `ArXiv [2.5%].`, `Stack Exchange [2%].` (paragraph heads, if you show the page while the layers land) | mint | with each layer |
| p. 2 | `deduplicates the data at the line level`, `filters low quality content with an n- gram language model` (optional, s1) | mint | s1 w9–13 |
| p. 3 | `roughly 1.4T tokens after tokenization` | mint | s4 w1–5 |
| p. 3 | `each token is used only once dur- ing training, with the exception of the Wikipedia and Books domains, over which we perform ap- proximately two epochs` | mint | s5–s6 |
| p. 2 | `the restriction of only using data that is publicly available, and compatible with open sourcing` (whole) or split: `publicly available, and compatible with open sourcing` | mint then yellow | s7 w2–4 / w5–11 |
| p. 1 | `not publicly available or undocumented` | mint | s8 w5–13 |
| p. 1 | `“Books – 2TB”` (the curly quotes and the dash normalise away) | `markBox`, ink | s8 w21–23 |

### Boxes

- `T1.box` { 844, 194, 1463, 538 }, `T1.caption` { 846, 562, 1465, 728 }. Row geometry and values in `T1.rows` (`y0`, `y1`, `prop`, `epochs`, `disk`, `label` as printed); columns in `T1.cols`. Cell box = column x × row y, padded 6 px.
- `P3.overall` { 193, 541, 812, 764 }; `P1.rightData` { 842, 1410, 1466, 1746 }.

### Real and illustrative (data)

Real: every percentage, epoch and the 1.4T total (Table 1, p. 3). The block is the table in 3D: layer thickness ∝ sampling proportion, read from `T1.rows`. Illustrative: the layer colours (ours, from the kit pastels) and the footprint.

### Guardrails (data)

- "Publicly available" is the authors' description of every source, Books3 included. Say it as theirs (the label says "authors' restriction"). No comment on any source's later legal status.
- The data proportions are sampling proportions, not shares of disk size. Don't show disk sizes as layer thickness.
- Labels as we write them: GitHub, arXiv, Stack Exchange, Wikipedia, CommonCrawl, C4. Crops show the page as printed ("Github", "ArXiv", "StackExchange").
- TeX: `\%` for percent, `\approx` for ≈.

## machine — pages p. 3 (Section 2.2, Table 2), p. 4 (Section 2.4, one paragraph)

| s | start | text |
|---|---|---|
| 0 | 0.00 | Section two point two: the network is a transformer, with three changes, each inspired by an earlier model named in brackets. |
| 1 | 8.42 | From GPT3, pre-normalization: normalize the input of each sub-layer instead of its output, with RMSNorm. |
| 2 | 16.90 | From PaLM, the SwiGLU activation, in place of ReLU. |
| 3 | 20.70 | From GPTNeo, rotary position embeddings at each layer, replacing the absolute ones. |
| — | 26.67–28.08 | pause |
| 4 | 28.08 | Table two gives the four sizes, from thirty-two layers to eighty. |
| 5 | 32.39 | The largest trains on two thousand and forty-eight A100 GPUs. |
| 6 | 37.51 | At about three hundred and eighty tokens per second on each, training on all one point four trillion tokens takes about twenty-one days. |

Word indices: s1 "GPT3" w1, "," w2, "pre-normalization:" w3, "RMSNorm" w15; s2 "PaLM" w1, "SwiGLU" w4, "ReLU" w9; s3 "GPTNeo" w1, "rotary" w3; s5 "A100" w8, "GPUs" w9.

### Beats

1. s0 — p. 3 slides in; camera to Section 2.2 (`P3.arch`), stamp `p.~3 \cdot \text{Section 2.2}`. Mint on `our network is based on the transformer architec- ture` on "the network is a transformer" (w4–8); mint on `(in bracket)` on "named in brackets" (w18–20). Beside the page a `blankPage` holds our flat schematic of one transformer layer (SCHEMATIC, tag `\text{schematic, ours}`), bottom to top: input → norm → attention → add → norm → feed-forward → add, drawn in `F.ink` with neutral boxes and three dashed empty slots where the changes will go (norm positions, the feed-forward activation, the position signal). On "three changes" (w10–11) the three slots pulse. Camera pitches to ≈ 0.9 and the schematic stands up into 3D slabs (attention `PAL.attn`, feed-forward `PAL.ffn`, thin norm slabs `PAL.norm`), the flat drawing staying on the desk as a blueprint.
2. s1 — mint on `Pre-normalization [GPT3].` (paragraph head) on "From GPT3, pre-normalization" (w0–3), then mint with the voice over `we normalize the input of each transformer sub-layer, instead of normalizing the output` during w4–13. 3D: on "input" (w6) two thin norm slabs slide in *before* attention and *before* feed-forward; on "instead of its output" (w10–13) ghost norm slabs at the outputs fade with an `F.ink` strike line. On "RMSNorm" (w15) mint on `RMSNorm`; the two slabs get the label `\text{RMSNorm}` and a small tag `[\text{GPT3}]`.
3. s2 — mint on `SwiGLU activation function [PaLM].` on "From PaLM" (w0–1); mint with the voice over `We re- place the ReLU non-linearity by the SwiGLU ac- tivation function` during w3–9. On the feed-forward slab, a `\text{ReLU}` label gets an `F.ink` strike on "ReLU" (w9) and `\text{SwiGLU}` writes in on "SwiGLU" (w4); tag `[\text{PaLM}]`. (Order on screen: show ReLU first, then strike it as SwiGLU writes; the voice says SwiGLU first, so start the ReLU label at s2 start.)
4. s3 — mint on `Rotary Embeddings [GPTNeo].` on "From GPTNeo" (w0–1); mint on `rotary positional embeddings (RoPE)` on "rotary position embeddings" (w3–5) and on `at each layer of the network` on "at each layer" (w6–8). 3D: a flat slab at the input labelled `\text{absolute positions}` lifts off and leaves with an `F.ink` strike on "replacing the absolute ones" (w9–12); small dial glyphs (`PAL.rope`) appear on the attention slab on "rotary position embeddings" (w3–5), and on "at each layer" (w6–8) two ghost copies of the layer stack above it, each with its dial. Tag `[\text{GPTNeo}]`. Mint on `We remove the absolute positional embeddings` with w9–12.
5. Pause (26.67–28.08): slow yaw ≤ 0.3 rad round the assembled layer; the three tags `[\text{GPT3}]`, `[\text{PaLM}]`, `[\text{GPTNeo}]` all visible.
6. s4 — Table 2 lifts from the top of p. 3 (`T2.box` plus caption), stamp `p.~3 \cdot \text{Table 2}`; mint on `Model sizes, architectures, and optimization hyper-parameters.` on "Table two" (w0–1) and on the header `n layers` on "four sizes" (w4–5). The layer becomes a tower per model, side by side: a stack of thin slabs, one per layer (`MODELS[i].layers`: 32, 40, 60, 80; 3 px slab + 1 px gap reads as layers, so 80 layers ≈ 320 px), slab width ∝ `MODELS[i].dim` (4096 … 8192), fills and outlines in the model colours, labels `\text{7B}` … `\text{65B}` at the base. Towers rise left to right; on "thirty-two" (w7) the 7B tower's count `32` appears and its layers cell is boxed on the table; on "eighty" (w10) the 65B tower finishes with `80`, its cell boxed. The 13B and 33B counts (40, 60) appear without voice.
7. s5 — p. 4 slides in (stamp `p.~4 \cdot \text{Section 2.4}`), camera on `TRAIN65.para`. Mint with the voice over `processes around 380 tokens/sec/GPU on 2048 A100 GPU with 80GB of RAM` starting on "two thousand and forty-eight" (w4). 3D: in front of the 65B tower, a grid of 2048 small tiles (`GPU_GRID`: 64 × 32; the count is real, the arrangement ours) unrolls across the desk row by row during w4–9; tag `2048 \times \text{A100 (80GB)}` on "A100 GPUs" (w8–9).
8. s6 — on "three hundred and eighty tokens per second on each" (w2–10) a ripple runs across the tiles; tag `\approx 380\ \text{tokens/s per GPU}`. On "one point four trillion tokens" (w14–18) a tag `1.4\text{T tokens}`. On "twenty-one days" (w21–22) mint over `training over our dataset containing 1.4T tokens takes approximately 21 days` and a row of 21 day cells fills along the grid's front edge, tag `\approx 21\ \text{days}`. Hold to the end.

### Exact phrases

| Page | Phrase | Marker | When |
|---|---|---|---|
| p. 3 | `our network is based on the transformer architec- ture` | mint | s0 w4–8 |
| p. 3 | `(in bracket)` | mint | s0 w18–20 |
| p. 3 | `Pre-normalization [GPT3].` | mint | s1 w0–3 |
| p. 3 | `we normalize the input of each transformer sub-layer, instead of normalizing the output` | mint | s1 w4–13 |
| p. 3 | `RMSNorm` | mint | s1 w15 |
| p. 3 | `SwiGLU activation function [PaLM].` | mint | s2 w0–1 |
| p. 3 | `We re- place the ReLU non-linearity by the SwiGLU ac- tivation function` | mint | s2 w3–9 |
| p. 3 | `Rotary Embeddings [GPTNeo].` | mint | s3 w0–1 |
| p. 3 | `rotary positional embeddings (RoPE)`, `at each layer of the network` | mint | s3 w3–8 |
| p. 3 | `We remove the absolute positional embeddings` | mint | s3 w9–12 |
| p. 3 | `Model sizes, architectures, and optimization hyper-parameters.`, `n layers` | mint | s4 w0–5 |
| p. 4 | `processes around 380 tokens/sec/GPU on 2048 A100 GPU with 80GB of RAM` | mint | s5 w4 → s6 w10 |
| p. 4 | `training over our dataset containing 1.4T tokens takes approximately 21 days` | mint | s6 w11–22 |

### Boxes

- `P3.arch` { 193, 793, 812, 1736 }; `P3.preNorm` { 193, 1166, 812, 1315 }; `P3.swiglu` { 193, 1377, 812, 1530 }; `P3.rope` { 193, 1588, 812, 1736 }.
- `T2.box` { 315, 193, 1338, 421 }, `T2.caption`; rows `T2.rows.m7` … `m65` (y include the learning-rate superscript), columns `T2.cols.layers` { 743, 842 }, `T2.cols.dimension`, …
- `TRAIN65.para` { 192, 1008, 808, 1193 } on p. 4.

### Real and illustrative (machine)

Real: the three changes and their bracket sources (p. 3), layers 32 / 40 / 60 / 80 and dimensions 4096 … 8192 (Table 2), 2048 A100 80GB, ≈ 380 tokens/s/GPU, 1.4T tokens, ≈ 21 days (p. 4). Schematic: the transformer layer (the paper has no architecture figure), labelled `\text{schematic, ours}`; the dials; the tile arrangement of the GPU grid. The tower slab thickness is a display choice, not data.

### Guardrails (machine)

- Explain only what p. 3 says: where the norm goes, which activation, rotary instead of absolute positions, at each layer. Don't explain how RoPE or SwiGLU compute, and don't put the 2/3·4d dimension on screen unless you show it as the page's own line.
- "Inspired by" (the paper: "where we were found the inspiration", a typo we don't retype). The bracket tags are the page's spelling: [GPT3], [PaLM], [GPTNeo].
- Table 2 prints 6.7B, 13.0B, 32.5B, 65.2B; the towers are labelled with the names (7B … 65B). If you show the params column, show it as printed on the lifted table, not as our labels.
- 21 days is for the 65B model on all 1.4T tokens; don't attach it to the other sizes.
- TeX: no `§` ("Section 2.2"); `\times`, `\approx`; escape `%`; no `\boxed{}`.
- No coloured edge bands on slabs, no numbered pills, no logos (no NVIDIA, no Meta).
