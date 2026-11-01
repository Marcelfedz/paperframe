# 07 · evidence (60.7 s) — Tables 1, 3 and 4, with their caveats

Write `scenes/07-evidence.js`. Shared data: `import { PAL, T1, T3, T4 } from './_data.js'` (values exactly as printed, cell boxes from rows × cols). Facts and guardrails: `briefing.md`.

Pages: p. 5 (Table 1), p. 8 (Tables 3 and 4), plus one short strip from p. 1 (abstract, "34% and 10%"). Every number on screen comes from `T1` / `T3` / `T4`; mark each cell on the page (`markBox` from the row's y and the column's x) when its bar rises.

Bars: 3D slabs on the desk, every axis from 0 (ticks at 25 / 50 / 75 / 100, TeX labels), height ∝ value. Colours: ReAct `PAL.act` fill / `PAL.actInk` outline; CoT (reasoning only) `PAL.thought` / `PAL.thoughtInk`; Act-only and trained baselines neutral (`F.block`, ink outline); the combined methods two-tone (lower half `PAL.thought`, upper half `PAL.act`: a mixed slab, not an edge band). Reference levels (supervised SoTA, human experts) are translucent glass plates at their height with an ink outline and their value in TeX, not bars.

## Narration (segment `evidence`)

| s | start | text |
|---|---|---|
| 0 | 0.00 | Table one: one frozen model, different prompts. |
| 1 | 3.34 | On FEVER, fact checking, ReAct beats chain of thought: sixty point nine to fifty-six point three. |
| 2 | 9.88 | On HotpotQA, it loses: twenty-seven point four to twenty-nine point four. |
| 3 | 15.56 | The best scores mix the two, switching when one gets stuck or unsure: thirty-five point one, and sixty-four point six. |
| 4 | 23.04 | Still far below the best supervised systems. |
| 5 | 26.02 | The household game is where it pulls ahead. |
| 6 | 28.59 | Table three: ReAct's best prompt solves seventy-one percent of the unseen games. |
| 7 | 33.76 | Acting alone, forty-five. |
| 8 | 35.74 | An imitation-learning agent trained on a hundred thousand expert runs per task type, thirty-seven. |
| 9 | 42.14 | That gap is the abstract's thirty-four points: best prompt against best run. |
| 10 | 46.84 | Averaged over its six prompts, ReAct scores fifty-seven. |
| 11 | 50.95 | On WebShop, an online store, it succeeds forty percent of the time. |
| 12 | 55.34 | The best trained method, twenty-nine point one. |
| 13 | 58.20 | Human experts, fifty-nine point six. |

## Beats

1. s0 — p. 5 slides in; Table 1 lifts (`T1.withCaption`), stamp `p.~5 \cdot \text{Table 1}`; mint on the caption `PaLM-540B prompting results on HotpotQA and Fever.` on "one frozen model" (w2–4). Camera pitches to ≈ 0.85; two empty bar groups on the desk, labelled `\text{FEVER (accuracy)}` and `\text{HotpotQA (exact match)}`.
2. s1 — on "FEVER" (w1) `markBox` the Fever column header. ReAct 60.9 rises on "sixty point nine" (w10–12), CoT 56.3 on "fifty-six point three" (w14–16); their cells boxed (`T1` rows ReAct, CoT × `cols.fever`).
3. s2 — HotpotQA: ReAct 27.4 on "twenty-seven point four" (w5–7), CoT 29.4 on "twenty-nine point four" (w9–11). On "it loses" (w3–4) the ReAct bar's outline turns `PAL.bad`. Cells boxed. (p. 6 says the same in words, "slightly lags behind CoT on HotpotQA (27.4 vs. 29.4)": not needed on screen.)
4. s3 "The best scores mix the two, switching when one gets stuck or unsure" — two-tone bars: HotpotQA `ReAct → CoT-SC` 35.1 on "thirty-five point one" (w13–15), FEVER `CoT-SC → ReAct` 64.6 on "sixty-four point six" (w17–19); TeX labels under them `\text{ReAct} \to \text{CoT-SC}` and `\text{CoT-SC} \to \text{ReAct}`. Cells boxed (they're bold in the table). On "switching when one gets stuck or unsure" (w6–12) a small lifted strip from lower p. 5: mint on `back off to CoT-SC` on "stuck" (ReAct gives no answer within its step limit) and `back off to ReAct.` on "unsure" (CoT-SC's majority is weak).
5. s4 "Still far below the best supervised systems." — `markBox` on the `Supervised SoTA b` row; glass plates rise to 67.5 (HotpotQA) and 89.5 (FEVER), labelled `\text{supervised SoTA}` and the values. Camera tilts up a little so the gap above every prompting bar reads.
6. s5–s6 — p. 8 slides in (p. 5 leaves); Table 3 lifts (`T3.withCaption`), stamp `p.~8 \cdot \text{Table 3}`. A new bar group: `\text{ALFWorld, success rate (\%)}` with a small tag `\text{134 unseen games}`. On "seventy-one percent" (s6 w7–8) ReAct best of 6 → 71, label under it `\text{best of 6}`; cell boxed (`T3` 'ReAct (best of 6)' × `cols.all`).
7. s7 "Acting alone, forty-five." — Act best of 6 → 45 (neutral), label `\text{best of 6}`.
8. s8 — BUTLER best of 8 → 37 on "thirty-seven" (w13), label `\text{best of 8}`; on "a hundred thousand expert runs per task type" (w5–12) a tag `10^5 \text{ expert runs per task type}` beside it. Mint on the caption fragment `except that BUTLER uses beam search.` with a small tag `\text{beam search}` under its bar.
9. s9 "That gap is the abstract's thirty-four points: best prompt against best run." — a bracket between the 71 and 37 tops, labelled `34`. A short strip from p. 1 lifts in: mint on `by an absolute success rate of 34% and 10% respectively` (stamp `p.~1`). On "best prompt against best run" (w7–11) the `\text{best of 6}` / `\text{best of 8}` labels pulse.
10. s10 "Averaged over its six prompts, ReAct scores fifty-seven." — ReAct (avg) → 57 rises beside the 71, lighter fill, label `\text{average of 6}`; its cell boxed. Hold both 71 and 57 visible to the end of the Table 3 part.
11. s11 — Table 4 lifts (`T4.withCaption`), stamp `p.~8 \cdot \text{Table 4}`; bar group `\text{WebShop, success rate (\%)}`. ReAct 40.0 on "forty percent" (w8–9); quiet small bars for Act 30.1 and IL+RL 28.7 (no voice).
12. s12 — IL 29.1 on "twenty-nine point one" (w4–6), label `\text{IL}`; cell boxed.
13. s13 — Human Expert 59.6 as a glass plate on "fifty-nine point six" (w2–4), label `\text{human experts}`; cell boxed. Camera pulls back to show all three groups side by side for the last second.

## Guardrails

- Axes start at 0. No bar without its printed value in TeX.
- ReAct alone loses to CoT on HotpotQA: show it plainly (beat 3).
- 71 and 34 never appear without the best-of labels; 57 (average) stays on screen with 71 through the end of the Table 3 part.
- WebShop: show 40.0, 29.1, 28.7, 30.1, 59.6 as printed. Don't compute or show "10.9" or "eleven"; the "10%" appears only inside the p. 1 strip in beat 9.
- Supervised SoTA and human experts are reference levels, not competitors on the same footing: glass plates, not bars.
- TeX: `\%` for percent; `\to` for the arrows; no `§`.
