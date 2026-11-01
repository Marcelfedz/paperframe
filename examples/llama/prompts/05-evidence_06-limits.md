# 05 · evidence (51.2 s) and 06 · limits (46.4 s) — Table 3 with its context, then the tables that go the other way

Write two scenes: `scenes/05-evidence.js` and `scenes/06-limits.js`. Shared data: `import { PAL, MODELS, T3, CMP, T9, T10, BOOKS, T14, P6 } from './_data.js'`. Facts and guardrails: `briefing.md`. Colours were taught in the cover (`prompts/01-cover_02-problem.md`): 13B `PAL.m13` orange, 65B `PAL.m65` red, GPT-3 `PAL.gpt3` light grey, PaLM `PAL.palm` dark grey, Chinchilla `PAL.chinchilla` purple (Figure 2's colour; first appearance is here). Red is the 65B model, never "wrong". A model that is behind gets an `F.ink` outline on its bar and a small `\text{behind}` tag.

Every scene starts with the rights switch:

```js
// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars) and redrawn figures.
const PAGES = true;
```

Pages are A4: 1654 × 2339 px at 200 dpi.

**Bar language for both segments** (same as the ReAct reference): 3D slabs standing on the desk, every axis from 0 with ticks at 25 / 50 / 75 / 100 (0.25 … 1.0 for TruthfulQA), TeX tick labels, height ∝ value, the printed value in TeX on top of every bar. Bars carry the model's fill and outline. Reference levels that aren't a model run in the table (code-davinci-002's 77.4) are glass plates (`PAL.glass`, ink outline, value in TeX), not bars. Two context tags sit on the desk next to every bar group and stay while it's on screen: the setting (`\text{zero-shot}` or `\text{five-shot}`) and `\text{others: from their papers}`. Every number on screen comes from `T3`, `T9`, `T10`, `T14`; box its cell on the lifted table as its bar rises (cell box = column x × row y, padded 6 px).

## evidence — pages p. 4 (Section 3, Table 3), p. 5 (two short strips)

| s | start | text |
|---|---|---|
| 0 | 0.00 | Section three compares the models on twenty benchmarks. |
| 1 | 3.61 | Table three is common sense reasoning, zero-shot: no worked examples in the prompt. |
| 2 | 9.39 | The other models' numbers are taken from their own papers. |
| 3 | 13.00 | Thirteen billion, against GPT-3's hundred and seventy-five. |
| 4 | 17.48 | They share seven tasks. |
| 5 | 19.21 | The thirteen-billion model is ahead on five, and behind on two: PIQA and OpenBookQA. |
| 6 | 25.71 | At the top, sixty-five billion, against Chinchilla at seventy and PaLM at five hundred and forty. |
| 7 | 32.15 | Against Chinchilla, it scores higher on all five tasks Chinchilla reports. |
| 8 | 37.27 | Against PaLM, it is ahead on five of seven, and behind on BoolQ and WinoGrande. |
| 9 | 42.94 | Several margins are under one point. |
| 10 | 45.60 | And the thirteen-billion model, the paper notes, runs on a single GPU at inference. |

Word indices: s3 "GPT-3" w3, "'s" w4; s5 "PIQA" w11, "OpenBookQA" w13, "." w14; s8 "PaLM" w1, "," w2, "BoolQ" w13, "WinoGrande" w15.

### Beats

1. s0 — p. 4 slides in; stamp `p.~4 \cdot \text{Section 3}`. Mint on `results on a total of 20 benchmarks` on "twenty benchmarks" (w6–7).
2. s1 — Table 3 lifts (`T3.box` + `T3.caption`) and stands at the back of the desk; stamp `p.~4 \cdot \text{Table 3}`. Mint on `Zero-shot performance on Common Sense Reasoning tasks.` during w0–6. On "no worked examples in the prompt" (w7–12) mint (paraphrase) on the p. 4 bullet `We provide a textual description of the task and a test example.`; the tag `\text{zero-shot}` drops onto the desk.
3. s2 — a strip from p. 5 lifts in (stamp `p.~5 \cdot \text{Section 3.1}`): mint with the voice over `report numbers from the cor- responding papers` during w3–9. **Build this strip from a masked copy of p. 5**: `p5m = masked(p5, [{ x0: 458, y0: 542, x1: 812, y1: 579 }])`, then lift the crop `{ x0: 192, y0: 466, x1: 812, y1: 579 }` from `p5m`. The mask removes the start of the next sentence ("First, LLaMA-65B outper-"), which the briefing keeps off screen. Don't show p. 5 itself at reading size in this segment. The tag `\text{others: from their papers}` joins `\text{zero-shot}`.
4. s3–s4 — camera pitches to ≈ 0.85. Bar group A on the desk: seven task slots in Table 3's order without SIQA (BoolQ, PIQA, HellaSwag, WinoGrande, ARC-e, ARC-c, OBQA = `CMP.m13_gpt3.tasks`), task names in TeX from `T3.texLabels`. On "Thirteen billion" (s3 w0–1) a legend chip `\text{LLaMA 13B}` (orange); on "GPT-3's hundred and seventy-five" (w3–7) `\text{GPT-3, 175B}` (grey). On "They share seven tasks" (s4) the 14 bars rise pair by pair, left to right, over s4 w0–3 into s5's first words, values on top. Cells boxed on the standing table (rows `m13`, `gpt3`).
5. s5 — on "ahead on five" (w4–6) the five 13B bars that are higher brighten; on "behind on two" (w8–10) the 13B bars for PIQA (80.1 vs 81.0) and OBQA (56.4 vs 57.6) get the ink outline and a `\text{behind}` tag; they pulse on "PIQA" (w11) and "OpenBookQA" (w13).
6. s6 — group A slides back to the left and shrinks (stays visible, small). Group B builds: eight task slots (all of Table 3's columns, `T3.order`), up to three bars per slot: 65B (red), Chinchilla 70B (purple), PaLM 540B (dark grey). Legend chips on the voice: `\text{LLaMA 65B}` on "sixty-five billion" (w3–4), `\text{Chinchilla, 70B}` on "Chinchilla at seventy" (w6–8), `\text{PaLM, 540B}` on "PaLM at five hundred and forty" (w10–15). Slots with no value for a model stay empty with a small en dash, as the table prints "-".
7. s7 — the five Chinchilla tasks (`CMP.m65_chinchilla.tasks`: BoolQ, PIQA, SIQA, HellaSwag, WinoGrande): 65B and Chinchilla bars rise pair by pair during w2–10. Cells boxed (rows `m65`, `chinchilla`). All five 65B bars are higher (Table 3): no `behind` tags here.
8. s8 — PaLM 540B bars rise on its seven tasks (`CMP.m65_palm540.tasks`) during w3–9. On "behind on BoolQ and WinoGrande" (w11–15) the 65B bars for BoolQ (85.3 vs 88.0) and WinoGrande (77.0 vs 81.1) get the ink outline and `\text{behind}`; they pulse on "BoolQ" (w13) and "WinoGrande" (w15). Cells boxed (row `palm540`).
9. s9 "Several margins are under one point." — the four pairs in `CMP.thin` pulse in turn, each with a thin bracket between the two bar tops: in the small group A, 13B vs GPT-3 on PIQA (80.1 / 81.0, a loss) and HellaSwag (79.2 / 78.9); in group B, 65B vs PaLM on PIQA (82.8 / 82.3) and HellaSwag (84.2 / 83.4). These are all the compared pairs under one point, wins and losses. The printed values are enough: no differences on screen.
10. s10 — a second p. 5 strip lifts (two line crops stacked: `{ x0: 535, y0: 1374, x1: 812, y1: 1409 }` and `{ x0: 192, y0: 1412, x1: 632, y1: 1447 }`, so the strip starts at "This model" and not at "spite being 5-10× smaller"; stamp `p.~5 \cdot \text{Section 3.2}`): mint on `This model runs on a single V100 GPU during inference.` during w7–13. A single tile in the style of segment 4's GPU grid slides under a small orange 13B slab, tag `\text{1 GPU (V100)}`. Hold to the end.

### Exact phrases (checked)

| Page | Phrase | Marker | When |
|---|---|---|---|
| p. 4 | `results on a total of 20 benchmarks` | mint | s0 w6–7 |
| p. 4 | `Zero-shot performance on Common Sense Reasoning tasks.` | mint | s1 w0–6 |
| p. 4 | `We provide a textual description of the task and a test example.` | mint | s1 w7–12 |
| p. 5 | `report numbers from the cor- responding papers` (on the masked copy; `findPhrase` still works on it) | mint | s2 w3–9 |
| p. 5 | `This model runs on a single V100 GPU during inference.` | mint | s10 w7–13 |

Don't use `Table 3:` with `findPhrase`: it matches an in-text reference first. Use `T3.caption` or the caption phrase above.

### Boxes

- `T3.box` { 223, 193, 1429, 663 }, `T3.caption` { 418, 688, 1226, 720 }. Columns `T3.cols.<task>` (x of the value), rows `T3.rows.<model>` (y, label, size, values `v` in `T3.order`, `null` = "-").
- p. 5 strips: `{ 192, 466, 812, 579 }` (masked, beat 3) and the two line crops of beat 10.

### Real and illustrative (evidence)

Real: every bar value (Table 3), the counts spoken (7 shared, 5 ahead, 2 behind; 5 of 5 vs Chinchilla; 5 of 7 vs PaLM) and the four sub-point margins, derived in `CMP` from Table 3 and re-checked. Illustrative: the GPU tile in beat 10 (a callback, no number beyond "1").

### Guardrails (evidence)

- **Never put the p. 5 sentence "First, LLaMA-65B outperforms Chinchilla-70B on all reported benchmarks but BoolQ." on screen** (p. 5 lines y 546–649, left column). Table 3 shows 65B ahead of Chinchilla on BoolQ (85.3 vs 83.7); we follow the table and don't comment on the text. Also avoid p. 5's "surpasses PaLM-540B everywhere but on BoolQ and WinoGrande": its line starts with the end of that sentence.
- Both losses for 13B and both losses for 65B against PaLM stay visible until the group leaves.
- Sizes on every legend chip (13B, 175B, 70B, 540B). No ratios ("10× smaller"), no averages across tasks, no "beats" for 65B (the paper says "competitive").
- The context tags (`\text{zero-shot}`, `\text{others: from their papers}`) stay on while the bars do.
- Task names as the table prints them: BoolQ, PIQA, SIQA, HellaSwag, WinoGrande, ARC-e, ARC-c, OBQA.
- TeX: escape `%`; no `§`; no `\boxed{}`.

## limits — pages p. 7 (Tables 9 and 10, Section 4), p. 6 (Section 3.6), p. 10 (Table 14, Section 5.4)

| s | start | text |
|---|---|---|
| 0 | 0.00 | Not every table goes that way. |
| 1 | 2.23 | On MMLU, multiple-choice questions across many fields, the sixty-five-billion model scores sixty-three point four. |
| 2 | 10.32 | Chinchilla, sixty-seven point five. |
| 3 | 12.77 | PaLM, sixty-nine point three. |
| 4 | 15.02 | The authors offer a potential explanation: only a hundred and seventy-seven gigabytes of books and academic papers, against up to two terabytes of books for those models. |
| 5 | 25.79 | A brief instruction fine-tune lifts it to sixty-eight point nine, still far, the paper says, from the best reported, seventy-seven point four. |
| 6 | 35.23 | On TruthfulQA, it beats GPT-3, point five seven to point two eight. |
| 7 | 40.52 | But the rate is still low, and the authors conclude the model is likely to hallucinate incorrect answers. |

Word indices: s1 "MMLU" w1, "," w2; s3 "PaLM" w0, "," w1; s6 "TruthfulQA" w1, "," w2, "GPT-3" w5, "," w6.

### Beats

1. s0 — p. 7 slides in (hard cut; segment 5's bars are gone). Table 9 lifts (`T9.box` + `T9.caption`) and stands at the back; stamp `p.~7 \cdot \text{Table 9}`.
2. s1 — mint on `Massive Multitask Language Understanding (MMLU). Five-shot accuracy.` on "MMLU" (w1); tags `\text{five-shot}` and `\text{others: from their papers}` on the desk. One bar group, the Average column only: the 65B bar rises to 63.4 on "sixty-three point four" (w12–14); its Average cell boxed (`T9.rows.m65`, `T9.cols.average`).
3. s2–s3 — Chinchilla 70B to 67.5 on "sixty-seven point five" (s2 w1–3), PaLM 540B to 69.3 on "sixty-nine point three" (s3 w2–4); cells boxed. As the PaLM bar lands, the 65B bar gets the ink outline and `\text{behind}`.
4. s4 — p. 6 slides in, camera on `P6.mmlu`, stamp `p.~6 \cdot \text{Section 3.6}`. Mint on `A potential explanation is that we have used a limited amount of books and academic papers in our pre-training data` during w0–5 ("The authors offer a potential explanation"), then mint with the voice over `ArXiv, Gutenberg and Books3, that sums up to only 177GB` during w6–16, then `while these models were trained on up to 2TB of books` during w17–26 (pass this exact substring; the longer checked phrase is `177GB, while these models were trained on up to 2TB of books`). 3D: two stacks on the desk at one scale (height ∝ GB): a solid stack of two layers, books 85 GB (`PAL.books`) and arXiv 92 GB (`PAL.arxiv`), the same colours as segment 3's data block, labelled `177\ \text{GB}`; next to it a glass outline stack to 2,000 GB labelled `\text{up to } 2\ \text{TB of books}`, outline only (an upper bound for "those models"). A tag over both: `\text{potential explanation (authors)}`.
5. s5 — back to p. 7: Table 10 lifts (`T10.box`), stamp `p.~7 \cdot \text{Table 10}`. Mint on `we only conducted a single experiment` on "A brief instruction fine-tune" (w0–3). The MMLU bar group returns: an LLaMA-I bar (`PAL.m65Fill`, `PAL.m65` outline, label `\text{LLaMA-I (65B)}`) rises next to the 65B bar to 68.9 on "sixty-eight point nine" (w7–9); its Table 10 cell boxed (`T10.rows.llamaI`); mint on `we reach 68.9% on MMLU`. On "seventy-seven point four" (w19–21) a glass plate settles at 77.4 across the group, labelled `\text{code-davinci-002: } 77.4` with a small `\text{quoted from Iyer et al. (2022)}`; mint with the voice over `still far from the state-of-the-art, that is 77.4 for GPT code-davinci-002 on MMLU` during w10–21.
6. s6 — p. 10 slides in; Table 14 lifts (`T14.box`), stamp `p.~10 \cdot \text{Table 14}`. A new small bar group on a 0–1 axis (ticks 0.25 … 1.0), column "Truthful": LLaMA 65B to 0.57 on "point five seven" (w7–9), GPT-3 175B to 0.28 on "point two eight" (w11–13); cells boxed (`T14.rows.m65`, `T14.rows.gpt3`, `T14.cols.truthful`). Tags `\text{fraction truthful}` and `\text{GPT-3: from Ouyang et al.}`.
7. s7 — camera to the p. 10 paragraph (`T14.para`), stamp `p.~10 \cdot \text{Section 5.4}`. Mint on `the rate of correct answers is still low` during w1–5; yellow with the voice over `likely to hallu- cinate incorrect answers` during w13–17 (`sayWords(env, 7, 13, 17, t)`; the voice reads it verbatim). In 3D, the space above the 0.57 bar up to 1.0 is drawn as a glass outline, unlabelled (no "0.43" on screen). Hold.

### Exact phrases (checked)

| Page | Phrase | Marker | When |
|---|---|---|---|
| p. 7 | `Massive Multitask Language Understanding (MMLU). Five-shot accuracy.` | mint | s1 w1 |
| p. 6 | `A potential explanation is that we have used a limited amount of books and academic papers in our pre-training data` | mint | s4 w0–5 |
| p. 6 | `ArXiv, Gutenberg and Books3, that sums up to only 177GB` | mint | s4 w6–16 |
| p. 6 | `while these models were trained on up to 2TB of books` | mint | s4 w17–26 |
| p. 6 | `the LLaMA-65B is behind both Chinchilla- 70B and PaLM-540B by a few percent in average` (optional, as p. 6 arrives) | mint | s4 start |
| p. 7 | `we only conducted a single experiment` | mint | s5 w0–3 |
| p. 7 | `we reach 68.9% on MMLU` | mint | s5 w7–9 |
| p. 7 | `still far from the state-of-the-art, that is 77.4 for GPT code-davinci-002 on MMLU` | mint | s5 w10–21 |
| p. 10 | `the rate of correct answers is still low` | mint | s7 w1–5 |
| p. 10 | `likely to hallu- cinate incorrect answers` | yellow | s7 w13–17 |

### Boxes

- `T9.box` { 316, 193, 1337, 717 }, `T9.caption`, `T9.cols.average` { 1241, 1294 }, rows `T9.rows.<model>`.
- `T10.box` { 286, 1563, 713, 2017 }, `T10.valueCol`, rows `T10.rows.llamaI` (y 1975–2002), `.m65`, `.chinchilla`; `T10.para` (Section 4 right column).
- `P6.mmlu` { 845, 992, 1466, 1760 }.
- `T14.box` { 235, 784, 764, 1141 }, `T14.cols.truthful` { 501, 554 }, `T14.para` { 192, 1394, 812, 1655 }.

### Real and illustrative (limits)

Real: 63.4, 67.5, 69.3 (Table 9), 68.9 (Table 10, p. 7), 77.4 (p. 7, quoted by the authors from Iyer et al.), 177 GB and "up to 2TB" (p. 6; 177 = Table 1's Books 85 GB + ArXiv 92 GB), 0.57 and 0.28 (Table 14). Illustrative: the stack shapes (heights ∝ GB), the glass headroom above 0.57.

### Guardrails (limits)

- The books explanation is "a potential explanation": the tag says so, and the narration says so.
- 77.4 is code-davinci-002 quoted from Iyer et al.; it is not a Table 10 row and not a LLaMA score: glass plate, not a bar.
- 68.9 is above Chinchilla's 67.5 on the same axis. Don't point at it, don't say it: the narration doesn't.
- TruthfulQA values are fractions: write 0.57 and 0.28, never percentages. GPT-3's numbers come from Ouyang et al. (Table 14 caption).
- Don't show Table 11 (toxicity), Tables 12–13 or anything from pp. 19–27.
- TeX: escape `%` (`68.9\%` if you write it); no `§`; no `\boxed{}`.
