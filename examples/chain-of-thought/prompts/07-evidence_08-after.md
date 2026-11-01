# 07 · evidence (41.0 s) and 08 · after (52.1 s) — commonsense and symbolic results; limits, what followed, end card

Write two scenes: `scenes/07-evidence.js` and `scenes/08-after.js`. Shared data: `import { PAL, PH, P1, P9, P13, FIG7, FIG8, T4, T5, STACK } from './_data.js'`. Facts and guardrails: `briefing.md`. Colours from the cover: chain of thought `PAL.cot` / `PAL.cotInk`, standard prompting `PAL.std` / `PAL.stdInk`, correct `PAL.out` / `PAL.outInk`, wrong `PAL.bad`, human reference `PAL.human`. Both scenes keep the rights switch:

```js
// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars, same geometry) and redrawn figures.
const PAGES = true;
```

Bars follow segments 5 and 6: 3D slabs from 0, `PAL.std` for standard prompting and `PAL.cot` for chain of thought, the printed value in TeX on top, axis 0–100 (ticks 25 / 50 / 75 / 100). Reference levels (the sports enthusiast) are translucent glass plates with their value, not bars. Table cells: never `findPhrase` a number; `markBox` on `{ x0: col.x0, y0: row.y0, x1: col.x1, y1: row.y1 }` from `T4` / `T5` (checked against the words in their cells). All values are PaLM 540B; say so once per bar group (`\text{PaLM 540B}`).

## evidence — p. 7 (Section 4, Figure 7), p. 8 (Section 5, Figure 8), p. 22 (Tables 4 and 5)

| s | start | text |
|---|---|---|
| 0 | 0.00 | Section four turns to commonsense. |
| 1 | 2.26 | On sports understanding, PaLM with chain of thought reached ninety-five point four percent, above an unaided sports enthusiast at eighty-four. |
| 2 | 11.43 | On CSQA, the gain was minimal. |
| 3 | 14.30 | Section five uses two toy tasks. |
| 4 | 16.75 | Join the last letters of the words in a name. |
| 5 | 19.36 | Or say whether a coin is still heads up after people flip it, or don't. |
| 6 | 23.78 | The examples in the prompt use two-word names and two people. |
| 7 | 27.63 | The test goes up to four. |
| 8 | 29.61 | With standard prompting, PaLM gets none of the four-word names right. |
| 9 | 33.57 | With chain of thought, sixty-three percent. |
| 10 | 36.27 | Coin flips with four people: fifty-four point eight, against ninety point two. |

Word-index note: `{CSQA|…},` stores the comma as its own word (s2 w2).

1. s0 — p. 7 slides in; camera on the "4 Commonsense Reasoning" heading (`findPhrase(p7, '4 Commonsense Reasoning')`, y 453). Stamp `p.~7 \cdot \text{Section 4}`.
2. s1 — camera down to Figure 7 (`FIG7.all`); stamp `p.~7 \cdot \text{Figure 7}`. On "sports understanding" (w1–2) the Sports subplot (`FIG7.sub.sports`) lifts and stands at the left of the desk. Camera pitch ≈ 0.85; a bar pair on the desk: standard 80.5 (quiet, rises with "PaLM", w3) and chain of thought 95.4 on "ninety-five point four percent" (w9–12). On "unaided sports enthusiast" (w15–17) a glass plate at 84 (`PAL.human` outline, dashed if you can) labelled `\text{unaided sports enthusiast}\;84`. Mint on `PH.sports` (one line, 438,1326–1405,1350) during w13–19. A strip of p. 22 (Table 4's header + PaLM 540B row: x 336–1358, y 459–528 and y 990–1025, or the whole `T4.box` small) docks at the right; the Sports cells (`T4.palm540` × `T4.cols.sports.std` / `.cot`) are boxed as the bars rise, stamp `p.~22 \cdot \text{Table 4}` for that moment.
3. s2 "On CSQA, the gain was minimal." — the CSQA subplot (`FIG7.sub.csqa`) lifts beside the Sports one; its bar pair rises quickly on "CSQA" (w1): 78.1 and 79.9, nearly level. Mint on `PH.csqaMinimal` (one line, p. 7, 889,1386–1405,1411) during w3–6. Cells boxed in the Table 4 strip.
4. s3 — p. 8 slides in (p. 7, the strip and bars slide off); camera on Section 5's opening; stamp `p.~8 \cdot \text{Section 5}`. Yellow marker with the voice on `PH.toyShort` ("two toy tasks", 643,549–795,574) during w3–5.
5. s4 "Join the last letters of the words in a name." — mint on `PH.lastLetterHead` (w0–3), then on the paper's example `PH.amy` (“Amy Brown” → “yn”, 313,656–582,680) during w4–9. That example strip lifts and stands large; ink circles draw under the last letter of each name on it ("y" of Amy, "n" of Brown; take their x from the words' boxes in `words.json`, 'Amy' and 'Brown”').
6. s5 "Or say whether a coin is still heads up after people flip it, or don't." — mint on `PH.coinHead` (third match on p. 8: `findPhrase(p8, PH.coinHead, 3)`, 324,842–433,867), then on `PH.coinEx` (2 lines) during w1–14.
7. s6–s7 — mint on `PH.twoWords` (3 lines) during s6, and on `PH.flipsToo` (one line) during s7. On a `blankPage` (ILLUSTRATIVE, tag `\text{illustrative}`): top row `\text{prompt}`: two blank word bars → two letter slots, on "two-word names" (s6 w6–7); a second pair of rows for coins: two small person tokens, on "two people" (s6 w9–10). Bottom row `\text{test}`: four blank word bars → four letter slots, and four person tokens, on "four" (s7 w5). No invented names: bars and tokens only.
8. s8–s9 — camera to Figure 8; stamp `p.~8 \cdot \text{Figure 8}`; ink `markBox` on `FIG8.sub.letter4` ("Letter Concat: 4 (OOD)"). A strip of p. 22 with Table 5's header and PaLM 540B row docks at the right (`T5.box`, small). Bars: standard on "none" (s8 w5) stays a flat outline at 0 with the label `0.0`; chain of thought rises to 63.0 on "sixty-three percent" (s9 w4–5). Cells boxed (`T5.palm540` × `T5.cols.letter4.std` / `.cot`), stamp `p.~22 \cdot \text{Table 5}` at that moment.
9. s10 — ink `markBox` on `FIG8.sub.coin4`; a second bar pair: standard 54.8 on "fifty-four point eight" (w5–7), chain of thought 90.2 on "ninety point two" (w9–11). Cells boxed (`T5.cols.coin4`). Group label `\text{PaLM 540B} \cdot \text{4 words / 4 people}`. Hold both pairs to the end.

Guardrails (evidence):

- Say and label "unaided sports enthusiast" (the paper's words, p. 7); not "humans", even though Figure 7's legend says "Human".
- No StrategyQA numbers: the text (p. 7: 75.6%) and Table 4 (77.8) disagree.
- "Toy tasks" is the paper's own term; keep it.
- Don't show the in-domain coin flip as a chain-of-thought win: standard prompting already solves it with PaLM 540B (98.1, p. 8 says so). The point is the four-person test.
- Coin flip is a yes/no question. Don't add a "chance" line or label: the paper doesn't draw one for this task.
- The prompt/test rows are bars and tokens, not names (the paper's only names are its examples; never invent a four-word name).
- Every bar from 0 with its printed value; no deltas.
- TeX: `\%`; no `§`. Slab colour in fill or outline, never a coloured band on one edge.

## after — p. 9 (Section 6), p. 5 (one paragraph), p. 4 (one strip), p. 13 (one reference), an external card, p. 1 (end card)

| s | start | text |
|---|---|---|
| 0 | 0.00 | Section six lists the limits. |
| 1 | 2.15 | Chain of thought imitates how people reason. |
| 2 | 4.78 | Whether the network is actually reasoning, the authors leave open. |
| 3 | 8.76 | Nothing guarantees a correct chain. |
| 4 | 10.82 | Of fifty wrong answers they read by hand, forty-six percent of the chains were almost right. |
| 5 | 16.87 | And it only works at large scale, which makes it costly to serve. |
| 6 | 21.10 | Their broader point: standard prompting only provides a lower bound on the capabilities of large language models. |
| 7 | 28.20 | The paper already cites a follow-up: sample many chains, and take the majority answer. |
| 8 | 33.37 | That is self-consistency. |
| 9 | 35.37 | In May twenty twenty-two, Kojima and colleagues dropped the examples, and added one line: let's think step by step. |
| 10 | 42.83 | Chain-of-Thought Prompting Elicits Reasoning in Large Language Models. |
| 11 | 47.31 | Wei and colleagues, NeurIPS twenty twenty-two. |
| — | 50.1–52.1 | pause (end card holds) |

1. s0 — p. 9 slides in; camera on "As for limitations" (`P9.limits`, y 633). Stamp `p.~9 \cdot \text{Section 6}`.
2. s1–s2 — mint with the voice (paraphrase) on `PH.notReasoning1` (2 lines) during s1, then on `PH.notReasoning2` (2 lines) during s2. On "leave open" (s2 w8–9) an ink question mark draws in the page margin beside those lines (`inked`, or straight onto the screen through `onSheet` points if the camera is close).
3. s3–s4 — mint on `PH.noGuarantee` (2 lines) during s3. Then p. 5 slides in at the side for s4 (stamp `p.~5 \cdot \text{Section 3.2}`): mint on `PH.wrong50` line by line during "fifty wrong answers they read by hand" (w1–7), then on `PH.errors46` line by line during "forty-six percent of the chains were almost right" (w8–15). (p. 5's column is interleaved with Figure 4's caption in `words.json`: the `PH` entries are already split per line.) Visual: a strip of 50 small chain cards on the desk; on "forty-six percent" (w8–9) 23 of them take a `PAL.cotInk` outline and the tag `\text{almost right: 46\%}`; the other 27 stay grey with `\text{major errors: 54\%}` (counts from Appendix D.2, p. 28: "27 of 50; 54%"). The 54% is printed on p. 5 too (`PH.errors54`), not voiced.
4. s5 — back on p. 9: mint on `PH.costlyServe` (2 lines) during s5. A neutral model slab grows large at the edge of the desk with a small tag `\text{large models only}` on "large scale" (w5–6).
5. s6 — yellow marker with the voice on `PH.lowerBound` (2 lines: 668,497–1400,522 and 300,527–578,552) during "standard prompting only provides … large language models" (`sayWords(env, 6, 3, 16, t)`). Camera pushes to ≈ ×2.1 on the two lines. Stamp `p.~9 \cdot \text{Section 6}`.
6. s7 — a strip of p. 4 (x 296–1406, y 1500–1595) lifts in; mint on `PH.followUp` (3 lines) during "sample many chains, and take the majority answer" (w6–13); stamp `p.~4 \cdot \text{Section 3.1}`. Visual (ILLUSTRATIVE, tag `\text{illustrative}`): one question card fans out into five chain cards (`PAL.cot` bands of grey word bars), each ending in an answer chip: three chips share one shape, two differ (shapes only, no numbers or letters). On "majority answer" (w12–13) the three matching chips slide together and the winner takes a `PAL.outInk` outline. This is the contrast with segment 4's "one try per question".
7. s8 "That is self-consistency." — a strip of p. 13 lifts (`P13.scRef`, three lines); mint on `PH.scTitle` on "self-consistency" (w2); stamp `p.~13 \cdot \text{References}` and a tag `\texttt{arXiv:2203.11171}`.
8. s9 — an external card on a `blankPage` (no page of that paper on the desk: it is under arXiv's default licence and isn't prepped). The stamp shows `\texttt{arXiv:2205.11916}` in place of a page thumbnail. Card lines: `\text{Kojima et al.} \cdot \text{May 2022}` on "In May twenty twenty-two, Kojima and colleagues" (w0–6). On "dropped the examples" (w7–9) a short row of plain triple slabs (`STACK.triple`, no crops, small) slides off the prompt in front of the model block. On "let's think step by step" (w14–18) the card writes its quote line: `\text{``Let's think step by step''}`, with `\text{zero-shot}` in small type under it.
9. s10–s11 end card — `endCard` with p. 1, starting on s10 so the title writes with the voice; highlight the title on the page in sync (`findPhrase(p1, PH.title)` or `P1.titleLines`, with `endCardPose(p)`). Lines:
   - `\text{Chain-of-Thought Prompting Elicits Reasoning}` / `\text{in Large Language Models}` (two lines), on s10
   - `\text{Wei, Wang, Schuurmans, Bosma, Ichter,}` / `\text{Xia, Chi, Le, Zhou}` on s11 w0–2
   - `\text{NeurIPS 2022} \cdot \texttt{arXiv:2201.11903}` on s11 w3–5
   - `\texttt{arxiv.org/abs/2201.11903}`
   - small last line, required by CC BY: `\text{CC BY 4.0 (creativecommons.org/licenses/by/4.0)} \cdot \text{pages shown with highlights, crops and 3D adaptations}` (two lines if it doesn't fit at ≥ 30 px)
   Hold through the pause to the end of the audio (52.1 s).

Guardrails (after):

- Limits are the paper's own (p. 9); the error analysis is LaMDA 137B on GSM8K (p. 5). Don't widen it to "chains are usually right".
- "Lower bound" is the only yellow line; everything else is mint (paraphrase).
- What came after: self-consistency (cited on p. 4, reference p. 13) and Kojima et al. (external, https://arxiv.org/abs/2205.11916, v1 24 May 2022). No numbers from either paper, no other systems, products or models, no adoption claims, no citation counts.
- Self-consistency shares six authors with this paper: don't call it "the same team" and don't list names on its card.
- The self-consistency fan is illustrative: shapes only, no answers or numbers.
- Kojima's paper: no page, no figure, no screenshot. Only the card, its arXiv id and the five-word prompt.
- The CC BY line on the end card is a licence condition: keep it ≥ 30 px on screen.
- TeX: no `§`, no `\boxed{}`; `\cdot` for separators; text-mode quotes as ``` `` ``` and `''`.
