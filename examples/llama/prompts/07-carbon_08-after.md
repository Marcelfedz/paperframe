# 07 · carbon (48.7 s) and 08 · after (45.2 s) — the carbon bill under stated assumptions, then what followed and the end card

Write two scenes: `scenes/07-carbon.js` and `scenes/08-after.js`. Shared data: `import { PAL, MODELS, P1, P10, P11, T15, DEV, EXT } from './_data.js'`. Facts and guardrails: `briefing.md`. Colours were taught in the cover (`prompts/01-cover_02-problem.md`): the four sizes in Figure 1's colours (65B red, never "wrong"), other models neutral (`PAL.other` / `PAL.otherFill` for OPT and BLOOM).

Every scene starts with the rights switch:

```js
// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars) and redrawn figures.
const PAGES = true;
```

Pages are A4: 1654 × 2339 px at 200 dpi.

Gotcha: subscripts split words in `words.json`. "tCO2eq" is `tCO` `2` `eq` and "CO2eq/KWh" is `CO` `2` `eq/KWh`, so phrases containing them are written with the spaces (`tCO 2 eq = MWh × 0.385.`). All phrases below are checked in that form.

## carbon — pages p. 10 (Section 6), p. 11 (Table 15)

| s | start | text |
|---|---|---|
| 0 | 0.00 | Section six estimates the carbon cost of training. |
| 1 | 3.59 | Energy is GPU hours times four hundred watts, times one point one for data-center overhead. |
| 2 | 10.56 | Carbon is that energy times the US average grid. |
| 3 | 14.11 | OPT and BLOOM are recomputed the same way, as if trained in the same data center. |
| 4 | 19.87 | Table fifteen. |
| 5 | 21.27 | The sixty-five-billion model took about a million GPU hours: a hundred and seventy-three tonnes of CO2 equivalent. |
| 6 | 29.30 | OPT, at a hundred and seventy-five billion parameters: a hundred and thirty-seven. |
| 7 | 34.97 | BLOOM, a hundred and eighty-three. |
| 8 | 37.20 | Developing all the models, the authors estimate, took about five months and one thousand and fifteen tonnes. |
| 9 | 43.74 | The authors hope that releasing the models, already trained, will reduce future emissions. |

Word indices: s6 "OPT" w0, "," w1; s7 "BLOOM" w0, "," w1; s5 "CO2" w15.

### Beats

1. s0 — p. 10 slides in, camera on the lower left column; stamp `p.~10 \cdot \text{Section 6}`. Mint on `6 Carbon footprint` on "carbon cost of training" (w4–7).
2. s1 — the Wh formula line lifts off as a strip (`P10.formulaWh`, `Wh = GPU-h×(GPU power consumption)×PUE,`) and stands large at the back. Each term is boxed on the strip with an `F.ink` `markBox` as the voice names it: "GPU hours" (w2–3) → the word box of `GPU-h×(GPU` (left part), "four hundred watts" (w5–7) → `power consumption)×PUE,` (left part) plus a tag `400\,\text{W}` under it, "one point one" (w9–11) → the `PUE` end of the strip plus a tag `\text{PUE } 1.1`. On "data-center overhead" (w13–14) the camera glances to the p. 10 right column top: mint on `where we set the Power Usage Effectiveness (PUE) at 1.1`.
3. s2 — the second formula lifts (`P10.formulaT`, `tCO 2 eq = MWh × 0.385.`) and stands below the first, an `F.ink` arrow joining "Wh" to "MWh". Mint with the voice over `the US national average carbon intensity factor of 0.385 kg CO 2 eq/KWh.` during w5–8 (2 lines, p. 10 right column, y 621–688).
4. s3 — mint on `We apply the same formula to OPT and BLOOM for fair comparison` during w0–7, then on `comparing the cost in carbon emission of training of these models if they were trained in the same data center` during w8–15 (it sits higher on the same column; a quick camera move). A glass plate (`PAL.glass`, ink outline) lies down on the desk where the bars will stand, labelled `\text{same data center assumed}`: it stays as long as any bar is on screen.
5. s4–s5 — p. 11 slides in (p. 10 pushed aside); Table 15 lifts (`T15.box` + `T15.caption`), stamp `p.~11 \cdot \text{Table 15}`; mint on the caption title `Carbon footprint of training different models in the same data center.` on "Table fifteen" (s4). Camera pitches to ≈ 0.85. On the glass plate, a bar group with an axis from 0 (ticks 50 / 100 / 150 / 200, label `\mathrm{tCO_2eq}`). On "about a million GPU hours" (s5 w4–8) the 65B GPU-hours cell `1,022,362` is boxed; on "a hundred and seventy-three" (w9–12) the LLaMA-65B bar (`PAL.m65Fill` / `PAL.m65`) rises to 173, value on top, its tCO2eq cell boxed. During "tonnes of CO2 equivalent" (w13–16) the 7B, 13B and 33B bars rise quietly beside it (14, 23, 90) in their colours, values on top.
6. s6 — on "OPT, at a hundred and seventy-five billion parameters" (w0–8) a neutral bar slot appears labelled `\text{OPT-175B}`; on "a hundred and thirty-seven" (w9–12) it rises to 137; cell boxed.
7. s7 — `\text{BLOOM-175B}` rises to 183 on "a hundred and eighty-three" (w2–5); cell boxed. A small tag spans the two neutral bars: `\text{recomputed by the LLaMA authors}`.
8. s8 — back to p. 10 right column (stamp `p.~10 \cdot \text{Section 6}`): mint on `we estimate that we used 2048 A100-80GB for a period of approximately 5 months to develop our models` during w0–10, then on `a total emission of 1,015 tCO 2 eq.` during w11–16. In 3D, the camera pulls back and a translucent block rises behind the bars at the same scale (1,015 → about 5.9 × the 173 bar), outline `F.ink2`, fill `PAL.glass`, labelled `1{,}015\ \mathrm{tCO_2eq}` with smaller `\text{developing the models, about 5 months (estimate)}` and `2{,}638\ \text{MWh}`.
9. s9 — mint with the voice over `We hope that releasing these models will help to reduce future carbon emission since the training is already done` (3 lines) during w0–12. The development block dims to an outline; tag `\text{authors' hope}`. Hold.

### Exact phrases (checked)

| Page | Phrase | Marker | When |
|---|---|---|---|
| p. 10 | `6 Carbon footprint` | mint | s0 w4–7 |
| p. 10 | `Wh = GPU-h×(GPU power consumption)×PUE,` (strip; word boxes `GPU-h×(GPU` 281–463, `power consumption)×PUE,` 470–810, y 2121–2148) | ink boxes | s1 |
| p. 10 | `where we set the Power Usage Effectiveness (PUE) at 1.1` | mint | s1 w13–14 |
| p. 10 | `tCO 2 eq = MWh × 0.385.` (strip) | — | s2 |
| p. 10 | `the US national average carbon intensity factor of 0.385 kg CO 2 eq/KWh.` | mint | s2 w5–8 |
| p. 10 | `We apply the same formula to OPT and BLOOM for fair comparison` | mint | s3 w0–7 |
| p. 10 | `comparing the cost in carbon emission of training of these models if they were trained in the same data center` | mint | s3 w8–15 |
| p. 11 | `Carbon footprint of training different models in the same data center.` | mint | s4 |
| p. 10 | `we estimate that we used 2048 A100-80GB for a period of approximately 5 months to develop our models` | mint | s8 w0–10 |
| p. 10 | `a total emission of 1,015 tCO 2 eq.` | mint | s8 w11–16 |
| p. 10 | `We hope that releasing these models will help to reduce future carbon emission since the training is already done` | mint | s9 w0–12 |

### Boxes

- `P10.formulaWh` { 193, 2117, 814, 2152 }; `P10.formulaT` { 991, 760, 1316, 799 }; `P10.carbonHead`; `P10.rightCol`.
- `T15.box` { 236, 193, 1416, 550 }, `T15.caption` { 192, 575, 1463, 709 }; rows `T15.rows[i]` with `y0`, `y1` and the printed values; columns `T15.cols.gpuHours`, `.mwh`, `.tco2`.

### Real and illustrative (carbon)

Real, as printed: 400 W, PUE 1.1, 0.385 (p. 10, Table 15 caption); Table 15's six rows; 2048 A100-80GB, about 5 months, 2,638 MWh, 1,015 tCO2eq (p. 10). Nothing is computed by us. Illustrative: the bar layout and the glass plate.

### Guardrails (carbon)

- `\text{same data center assumed}` is on screen whenever 137 or 183 is. The OPT and BLOOM rows are the LLaMA authors' recomputation, not those projects' own figures (p. 10 gives 27 t for BLOOM's actual grid and 82 t for OPT's); don't show those two numbers unless you also show the sentence they come from.
- Don't subtract the four final runs (14 + 23 + 90 + 173 = 300) from 1,015 and don't explain the difference: the paper doesn't. Don't convert tonnes into flights, cars or homes.
- Show Table 15's printed values; never recompute them on screen (the table rounds slightly differently from its own formula).
- "About five months" and "around 2,638 MWh" are estimates: the block's label says "estimate".
- The release benefit is the authors' hope, labelled so.
- TeX: `\mathrm{tCO_2eq}`, thousands as `1{,}015`; escape `%`; no `§`; no `\boxed{}`.

## after — external cards (no page images), p. 1 for the end card

| s | start | text |
|---|---|---|
| 0 | 0.00 | Meta's announcement put the weights under a non-commercial research license, granted case by case to researchers who applied. |
| 1 | 7.60 | Others built on them. |
| 2 | 9.14 | In March, Stanford's Alpaca fine-tuned the seven-billion model to follow instructions, and inherited the non-commercial license. |
| 3 | 17.58 | In July, Meta said the first LLaMA had drawn more than a hundred thousand requests for access, and released Llama 2: seven to seventy billion parameters, free for research and commercial use. |
| 4 | 30.23 | Smaller models, trained longer on public data, and handed to researchers. |
| 5 | 35.33 | LLaMA: Open and Efficient Foundation Language Models. |
| 6 | 39.19 | Touvron and colleagues, Meta AI, twenty twenty-three. |
| 7 | 43.03 | The paper is right next to this video. |

Word indices: s3 "LLaMA" w6, "Llama" w19, "2" w20, ":" w21; s5 "LLaMA" w0, ":" w1; s6 "AI" w4, "," w5.

External material: three sources, each a `blankPage` card in our own type (TeX), never a screenshot, never a logo. The text for each card is in `EXT` (verbatim quotes and dates from the opened URLs, briefing facts table). While a card is in focus, the stamp area shows its source instead of a page thumbnail, the way `examples/react/scenes/08-after.js` shows `\texttt{arXiv:2303.11366}` (a TeX label bottom-right, no `cite()`): `\texttt{ai.meta.com/blog}`, `\texttt{crfm.stanford.edu}`, `\texttt{arXiv:2307.09288}`.

### Beats

1. s0 — a timeline rule lies along the desk with three ticks, `\text{Feb 2023}`, `\text{Mar 2023}`, `\text{Jul 2023}` (spacing ∝ time; ILLUSTRATIVE layout). The four model slabs from the cover (heights ∝ `MODELS[i].params`, same scale) stand small at Feb. On "Meta's announcement" (w0–1) a card lands at Feb: `\text{Meta AI blog} \cdot \text{24 Feb 2023}` and, on "non-commercial research license" (w7–9), the quote line `\text{``noncommercial license focused on research use cases''}` (`EXT.announce.quote`; break it over two lines if it doesn't fit at ≥ 40 px). On "granted case by case to researchers who applied" (w10–17) a small tag `\text{access by application, case by case}`.
2. s1 "Others built on them." — the 7B slab (`PAL.m7`) lifts and travels along the timeline towards Mar.
3. s2 — on "Stanford's Alpaca" (w2–3) a card lands at Mar: `\text{Alpaca} \cdot \text{Stanford CRFM} \cdot \text{Mar 2023}`; on "fine-tuned the seven-billion model to follow instructions" (w4–10) the 7B slab lands on it and a thin neutral layer settles on top (ILLUSTRATIVE "fine-tuned" layer), with the card line `\text{fine-tuned from LLaMA 7B, 52K demonstrations}`. On "inherited the non-commercial license" (w11–15) the Feb card's quote line ghosts across to the Alpaca card as `\text{``Alpaca is based on LLaMA, which has a non-commercial license''}` (`EXT.alpaca.quote`).
4. s3 — at Jul, a card: `\text{Meta AI blog} \cdot \text{18 Jul 2023}`; on "more than a hundred thousand requests for access" (w9–16) the line `\text{``more than 100,000 requests for access''}` with the attribution visible on the card (Meta's own count). On "released Llama 2" (w18–20) a second card beside it: `\text{Llama 2} \cdot \texttt{arXiv:2307.09288}`; on "seven to seventy billion parameters" (w22–26) a neutral bracket labelled `7\text{B to }70\text{B}` (no slabs in the LLaMA colours: these are different models); on "free for research and commercial use" (w27–32) the line `\text{``free for research and commercial use''}`.
5. s4 — the camera pulls back over the whole timeline. Small callbacks light in turn, no new numbers: "Smaller models" (w0–1) the four slabs; "trained longer" (w2–3) four thin token bars behind them at 1.0 / 1.0 / 1.4 / 1.4 T (segment 2's language); "on public data" (w4–6) a miniature of segment 3's data block; "handed to researchers" (w8–10) the Feb card brightens.
6. s5–s7 end card — `endCard(ctx, C, p1, p, { lines })` with p. 1, starting on s5 so the title writes with the voice; highlight the title on the page in sync (`P1.title`, or `findPhrase(p1, 'LLaMA: Open and Efficient Foundation Language Models')`; it is normal text here), using `endCardPose(p)`. Lines:
   - `\text{LLaMA: Open and Efficient}` / `\text{Foundation Language Models}` (s5)
   - the authors (s6), two lines: "Touvron, Lavril, Izacard, Martinet, Lachaux, Lacroix, Rozière," / "Goyal, Hambro, Azhar, Rodriguez, Joulin, Grave, Lample · Meta AI", if both fit at ≥ 30 px. The è is the catch: the kit's MathJax loads only the `color` package, not `textmacros`, so an accent macro inside `\text{}` may print literally, and a unicode è is dropped (`b1b` logs an error). Try the math-mode accent `\text{Rozi}\grave{\text{e}}\text{re}`, warm it in `setup`, and check it on a full-size still. If it doesn't render cleanly, use `\text{Touvron et al. (14 authors), Meta AI}` instead (the full list goes in the description). Never write "Roziere".
   - `\text{arXiv preprint, 2023} \cdot \texttt{arXiv:2302.13971v1}`
   - `\texttt{arxiv.org/abs/2302.13971}`
   - small last line, required by CC BY: `\text{CC BY 4.0 (creativecommons.org/licenses/by/4.0)} \cdot \text{pages shown with highlights, crops and 3D adaptations}` (two lines if it doesn't fit at ≥ 30 px)
   Mint on `Meta AI` on the page on "Meta AI" (s6 w3–4). Hold to the end of the audio.

### Exact phrases (checked)

| Page | Phrase | Marker | When |
|---|---|---|---|
| p. 1 | `LLaMA: Open and Efficient Foundation Language Models` | yellow on the end card page | s5, `sayP` |
| p. 1 | `Meta AI` | mint | s6 w3–4 |
| p. 1 | `We release all our models to the research community` (optional, a small p. 1 crop at Feb in beat 1) | mint | s0 w0–1 |

### Real and illustrative (after)

Real, each from its URL (briefing facts table): the noncommercial research licence and case-by-case access (Meta, 24 Feb 2023); Alpaca, fine-tuned from LLaMA 7B on 52K demonstrations, inheriting the non-commercial licence (Stanford CRFM; the page has no visible date, its URL path is 2023/03/13, so the card says "Mar 2023"); "more than 100,000 requests for access" (Meta, 18 Jul 2023, self-reported); Llama 2, 7B to 70B, "free for research and commercial use" (Meta blog and arXiv:2307.09288, 18 Jul 2023). Illustrative: the timeline spacing, the fine-tuned layer on the 7B slab, the recap miniatures.

### Guardrails (after)

- Only these four facts. No leak story, no download or citation counts, no "most popular", no other derivatives, no Llama 2 benchmark numbers, no Llama 2 sizes beyond "7B to 70B".
- Don't call LLaMA or Llama 2 "open source" on screen, even though Meta's post does. The 100,000 figure is Meta's own count: keep `\text{Meta AI blog}` on that card.
- Don't connect Llama 2 to the paper's "we plan to release larger models" line: no source says it is that plan.
- No page images of the Llama 2 paper (arXiv non-exclusive licence) or of any blog; no Meta, Stanford or GitHub logos.
- The end card's CC BY line is a licence condition, not decoration: keep it ≥ 30 px.
- TeX: `\text{``…''}` for quotes; escape `%`; no `§`; no `\boxed{}`.
