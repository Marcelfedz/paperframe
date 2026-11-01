# 05 · scale (48.7 s) and 06 · ablation (47.2 s) — emergence, standing up in 3D; three stand-ins and the robustness check

Write two scenes: `scenes/05-scale.js` and `scenes/06-ablation.js`. Shared data: `import { PAL, PH, FIG4, FIG5, FIG6, T1, T2, T6, SCALE } from './_data.js'`. Facts and guardrails: `briefing.md`. Colours from the cover: chain of thought `PAL.cot` / `PAL.cotInk`, standard prompting `PAL.std` / `PAL.stdInk`, worse-than-standard `PAL.badInk`, prior supervised best `PAL.prior` (orange). Both scenes keep the rights switch:

```js
// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars, same geometry) and redrawn figures.
const PAGES = true;
```

Segment 5 is the video's machine beat: build it richest. Both segments use the same bar language, so agree with yourself on one helper (`bar3(ctx, C, x, y, value, { fill, stroke, label })` inside your scene, a slab from 0 with its printed value in TeX on top) and report it as a kit candidate.

Tables: never `findPhrase` a number (cells are scattered in `words.json`). Mark a cell with `markBox` on `{ x0: col.x0, y0: row.y0, x1: col.x1, y1: row.y1 }` from `T1` / `T2` / `T6`; every value there was checked against the word in its cell. Figures 4, 5 and 6 are vector plots whose labels are words; use their boxes from `FIG4`, `FIG5`, `FIG6`.

Real and illustrative: every bar height is a printed value (Table 2 for segment 5, Table 6 for segment 6). The terrace geometry (log-size x axis, row spacing) and the four prompt-variant cards are ours: tag them `\text{illustrative}` once per segment, small. All bars start at 0, every bar carries its printed value.

## scale — p. 4 (Section 3.2), p. 5 (Figure 4), p. 21 (Table 2), one strip of p. 20 (Table 1)

| s | start | text |
|---|---|---|
| 0 | 0.00 | Section three point two. |
| 1 | 1.66 | Figure four plots solve rate against model size, for three model families. |
| 2 | 6.76 | For small models, chain of thought doesn't help. |
| 3 | 9.82 | They write fluent but illogical chains of thought, and score lower than with standard prompting. |
| 4 | 15.33 | The gains only appear around a hundred billion parameters. |
| 5 | 18.84 | Take PaLM on GSM8K. |
| 6 | 21.25 | At eight billion parameters: four point nine percent with standard prompting, four point one with chain of thought. |
| 7 | 28.53 | At sixty-two billion: nine point six, against twenty-nine point nine. |
| 8 | 33.51 | At five hundred and forty billion: seventeen point nine, against fifty-six point nine. |
| — | 39.2–40.6 | pause |
| 9 | 40.60 | That passes the previous best, fifty-five, which came from finetuning. |
| 10 | 45.24 | The authors call this an emergent ability of model scale. |

Word-index note: `{PaLM|palm} on {GSM8K|…}.` stores the final period as its own word (s5 w4).

1. s0 — p. 4 slides in; camera on the "3.2 Results" heading (`findPhrase(p4, '3.2 Results')`, y 1734) and the paragraph below. Stamp `p.~4 \cdot \text{Section 3.2}`.
2. s1 — p. 5 slides in beside it; camera to Figure 4 (`FIG4.all`), stamp `p.~5 \cdot \text{Figure 4}`. Ink `markBox` on `FIG4.rowLabels` on "solve rate" (w3–4), on `FIG4.xAxis` on "model size" (w6–7), on `FIG4.colHeads` on "three model families" (w9–11). Then Figure 4's GSM8K row (crop x 940–1390, y 336–562, column heads included) lifts off and lies flat on the desk in front: the blueprint the terrace grows from. Camera pitches to ≈ 0.9.
3. s2 "For small models, chain of thought doesn't help." — the terrace (`SCALE`): three rows (`SCALE.rows`: LaMDA back, GPT-3 middle, PaLM front), x = `SCALE.x[b]` for each size, a standard bar (`PAL.std`, `PAL.stdInk`) at x − `SCALE.dx` and a CoT bar (`PAL.cot`, `PAL.cotInk`) at x + `SCALE.dx`, heights `SCALE.hPerPct` × the GSM8K value from `T2.rows`. An axis plate at the left edge with ticks `SCALE.axis.ticks` (0 / 20 / 40 / 60, TeX `\%` labels) and the size tags under each pair (`T2.rows[fam][i].m`). On "small models" (w1–2) the small-size pairs of LaMDA and GPT-3 rise (LaMDA 420M–8B, GPT-3 350M–6.7B). On "doesn't help" (w6–7) every CoT bar that is lower than its standard bar gets a `PAL.badInk` outline (that is all of them at these sizes, e.g. LaMDA 420M 2.6 vs 0.4).
4. s3 — the last five lines of p. 4 (crop x 296–1406, y 1850–2003: "emergent ability", "∼100B", "fluent but illogical") lift as one strip and stand at the back of the desk (at pitch 0.9 flat text can't be read); beats 5 and 11 reuse it. Yellow marker with the voice on `PH.fluent` (2 lines) during "fluent but illogical chains of thought" (`sayWords(env, 3, 2, 7, t)`), then mint on `PH.lowerPerf` during "score lower than with standard prompting" (w9–14). Stamp `p.~4 \cdot \text{Section 3.2}` while the strip is up.
5. s4 "The gains only appear around a hundred billion parameters." — a translucent vertical sheet stands across all three rows at `SCALE.threshold.x`, label `\sim 100\text{B parameters}` on "a hundred billion" (w5–7). The remaining LaMDA and GPT-3 pairs rise: LaMDA 68B (5.7 / 8.2), LaMDA 137B (6.5 / 14.3), GPT-3 175B (15.6 / 46.9). Mint on `PH.only100B` (2 lines) on the strip during w1–8.
6. s5 "Take PaLM on GSM8K." — LaMDA and GPT-3 rows dim to about 35%; camera pushes towards the PaLM row (yaw ≤ 0.3 rad). Ink `markBox` on the blueprint's PaLM subplot (`FIG4.sub.gsm8k.palm`). p. 21 slides in at the side; Table 2 (`T2.withCaption`) lifts and stands at the back right. Stamp `p.~21 \cdot \text{Table 2}`. `markBox` on `T2.header` ("GSM8K").
7. s6 — PaLM 8B: the standard bar rises to 4.9 on "four point nine percent" (w4–7), the CoT bar to 4.1 on "four point one" (w11–13); TeX values on top `4.9`, `4.1`; the CoT bar takes a `PAL.badInk` outline (lower). Both cells boxed (`T2.rows.palm[0]` × `T2.cols.gsm8kStd` / `gsm8kCoT`).
8. s7 — PaLM 62B: 9.6 on "nine point six" (w3–5), 29.9 on "twenty-nine point nine" (w7–9). Cells boxed.
9. s8 — PaLM 540B: 17.9 on "seventeen point nine" (w6–8), 56.9 on "fifty-six point nine" (w10–12). Cells boxed. Pause (39.2–40.6): the other rows come back to full strength; slow yaw ≤ 0.4 rad along the terrace, so the flat grey row and the climbing blue row read together.
10. s9 — an orange glass plate (`PAL.prior` outline, translucent fill) across the PaLM row at height 55 on "fifty-five" (w5), label `SCALE.priorBest.label` (`\text{prior best (finetuned)}\;55`); the 56.9 bar's top just clears it on "passes" (w1). On "came from finetuning" (w7–9) a strip of p. 20 lifts in: Table 1's first row, mint on `PH.priorRow` ("Prior best N/A (finetuning) 55"); stamp `p.~20 \cdot \text{Table 1}` and a small `\text{Cobbe et al. 2021}` under the plate's label.
11. s10 — back to the p. 4 strip: yellow marker with the voice on `PH.emergentShort` (2 lines: 1266,1854–1400,1879 and 300,1884–544,1909) during "an emergent ability of model scale" (w4–9). Camera pulls back to the whole terrace. Stamp `p.~4 \cdot \text{Section 3.2}`. Hold.

Guardrails (scale):

- Use Table 2's values (17.9, 56.9); Figure 2 on p. 2 prints them rounded (18, 57). Don't show Figure 2 here.
- "∼100B" is approximate: the sheet's label says `\sim 100\text{B}`, never a sharper number, and no claim about why it happens (Appendix A.1 calls its analysis preliminary and notes scale is "often conflated with other factors").
- 55 is from finetuning (Table 1, Cobbe et al. 2021). Keep the label to `prior best (finetuned) 55`; no system name.
- "Emergent ability of model scale" is the authors' term; only s10 says it, in yellow, on the page.
- Every bar from 0, every bar with its printed value. Don't show "+39.0" or other deltas; don't compute ratios on screen ("more than doubled" is the paper's phrase on p. 5, not used here).
- GPT-3 row: its sizes are what p. 4 says they "presumably correspond" to. Label the row `\text{GPT-3}` (no "InstructGPT", no company name).
- TeX: `\%`, `\sim`; no `§`. Slab colour in fill or outline, never a coloured band on one edge.

## ablation — p. 5 (Section 3.3), p. 6 (Sections 3.3–3.4, Figures 5 and 6), p. 23 (Table 6)

| s | start | text |
|---|---|---|
| 0 | 0.00 | Section three point three asks if something simpler does the job. |
| 1 | 4.19 | Equation only: the model writes just the math, then the answer. |
| 2 | 8.31 | On GSM8K, that barely helps: the questions are too hard to turn straight into an equation. |
| 3 | 15.00 | Variable compute only: a row of dots, as long as the equation. |
| 4 | 19.41 | Extra tokens, no words. |
| 5 | 21.36 | About the same as the baseline. |
| 6 | 23.49 | Reasoning after the answer: the same kind of chain, written once the answer is out. |
| 7 | 28.46 | Also about the same as the baseline. |
| 8 | 31.06 | The authors' reading: what helps is the reasoning itself, in words, before the answer. |
| 9 | 36.24 | And it isn't one lucky prompt. |
| 10 | 38.24 | Chains written by two other co-authors, or taken from the GSM8K training set, also beat standard prompting by a large margin. |

Word-index note: `{GSM8K|…},` stores the comma as its own word (s2 w2).

The numbers: every bar comes from Table 6 (p. 23), LaMDA 137B, GSM8K, mean over five exemplar orders. A small strip of p. 23 (the GSM8K column, x 403–900, y 460–961, plus the row labels) stays docked at the right edge of the desk through the segment; when a bar rises, its cell (`T6.rows[k]` × `T6.cols.gsm8k`) is boxed there and the stamp switches to `p.~23 \cdot \text{Table 6}` for that moment. Bar axis 0 to 20 (ticks 5 / 10 / 15 / 20, the same range as Figure 6's GSM8K panel), about 14 px per point. The baseline is a translucent plate at 6.5 with a `PAL.stdInk` outline and the label `\text{standard}\;6.5`; it stays the whole segment.

1. s0 — p. 5 slides in; camera on "3.3 Ablation Study" (y 1595) and its first paragraph. Stamp `p.~5 \cdot \text{Section 3.3}`. Mint on `PH.ablationIntro` (2 lines) during "asks if something simpler does the job" (w4–10). On a `blankPage` beside the page, four cards in a row (ours, ILLUSTRATIVE, tag `\text{illustrative}`), each a schematic answer with grey word bars, no real text: (a) `\text{chain of thought}`: a question bar, a `PAL.cot` band of word bars, then the answer bar; (b) `\text{equation only}`: question, then a short TeX `= \ldots` band, then the answer; (c) `\text{dots only}`: question, then a row of dots, then the answer; (d) `\text{reasoning after answer}`: question, the answer, then the `PAL.cot` band. Card (a) is set aside on the left, already with its bar: CoT 14.3 (`PAL.cot`), and the baseline plate at 6.5. Camera pitch ≈ 0.6 so cards and bars read together.
2. s1–s2 — mint on `PH.eqOnlyHead` ("Equation only.", the bold run-in, 300,1763–472,1788) on "Equation only" (s1 w0–1); card (b) comes forward. s2: mint on `PH.eqOnly` (2 lines) during "On GSM8K, that barely helps" (w0–5), then mint on `PH.eqWhy` (2 lines) during w6–16. The equation-only bar rises to 5.4 on "barely helps" (w4–5), just under the plate.
3. s3–s5 — p. 6 slides in (p. 5 off), stamp `p.~6 \cdot \text{Section 3.3}`. Mint on `PH.varHead` on "Variable compute only" (s3 w0–2), then on `PH.dots` (2 lines) during w3–11; card (c) forward, its dots draw on "a row of dots" (w3–6). s4 "Extra tokens, no words." — the dots pulse once; tag `\text{tokens, no words}`. s5 — yellow marker with the voice on `PH.sameShort` (first match, 300,421–656,446) during s5 w0–5; the bar rises to 6.4, level with the plate.
4. s6–s7 — mint on `PH.afterHead` ("Chain of thought after answer.") on "Reasoning after the answer" (s6 w0–3), then on `PH.after` (2 lines) during w4–14; card (d) forward: its answer bar slides in front of the blue band. s7 — yellow with the voice on `PH.sameShort` (second match, 409,770–758,794) during s7 w1–6; the bar rises to 6.1.
5. s8 "The authors' reading: what helps is the reasoning itself, in words, before the answer." — the three stand-in bars sit at the plate; card (a) slides to the front, its 14.3 bar pulses. Mint on `PH.utility` (2 lines) during w3–13, tag `\text{the authors' reading}`. Then a short ink `markBox` on Figure 5 (`FIG5.all`) with the tag `\text{Figure 5: LaMDA 137B and PaLM 540B}`; no PaLM values (Figure 5 doesn't print them).
6. s9 "And it isn't one lucky prompt." — camera down p. 6 to Section 3.4 (y 920 on); stamp `p.~6 \cdot \text{Section 3.4}`. The four cards and three stand-in bars slide off; the plate (6.5) and the CoT bar (14.3, relabelled `\text{annotator A}\;14.3`) stay.
7. s10 — mint on `PH.annotators` (3 lines) during "Chains written by two other co-authors" (w0–5): bars B 15.5 and C 17.6 rise (`PAL.cot`, labels `\text{B}`, `\text{C}`). On "taken from the GSM8K training set" (w7–12) mint on `PH.gsm8kSets` (one line, p. 6 bottom, 355,1804–1224,1829): bars α 12.6, β 12.7, γ 12.6 rise (labels `\alpha`, `\beta`, `\gamma`), and quietly the concise-style bar 11.1 (label `\text{concise}`, no voice). On "beat standard prompting by a large margin" (w14–20) mint on `PH.allSets` (2 lines, pass it as given: "outper- form") and every bar's top glows above the plate. Ink `markBox` on Figure 6 (`FIG6.all`) with tag `\text{Figure 6: LaMDA 137B}`.

Guardrails (ablation):

- All ablation and robustness numbers are LaMDA 137B on GSM8K (Table 6). Say so on the bar group: `\text{LaMDA 137B} \cdot \text{GSM8K}`. PaLM's ablation bars in Figure 5 have no printed values: never show a number for them.
- "About the same as the baseline" is the paper's phrase: 6.4 and 6.1 against 6.5. Don't call them "worse" or "equal" in a tag.
- Equation only does help on easier datasets (Table 6: SVAMP 35.1 vs 29.5). The claim on screen is GSM8K only.
- The conclusion is hedged in the paper ("suggests", "appears"): keep `\text{the authors' reading}` on screen during s8.
- Robustness has limits: Appendix A.2 says "prompt engineering still does matter" (coin flip 99.6 vs 71.4). Don't add a tag like "any prompt works".
- Table 6 prints standard deviations (±); keep the ± off our bars, they stay visible in the docked strip.
- Table 6's SVAMP CoT (36.7) differs from Table 2 (37.5): only the GSM8K column is used, where both tables agree (14.3).
- TeX: `\%`, `\alpha`, `\beta`, `\gamma`; no `§`. Card colour in fill or outline, never a coloured band on one edge.
