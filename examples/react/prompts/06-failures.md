# 06 · failures (45.4 s) — Table 2, the loop that jams, thoughts a person can edit

Write `scenes/06-failures.js`. Shared data: `import { PAL, LOOP, T2, P33, FIG5, FIG5_STEPS, FIG5_LINES } from './_data.js'`. Facts and guardrails: `briefing.md`.

Pages: p. 6 (Table 2, Section 3.3 text, footnote 4), p. 33 (Appendix E.1 examples), p. 15 (Figure 5). Lay p. 33 beside p. 6 early so the switch is a camera move, not a page swap.

Table 2 cells: take the boxes from `T2` (row y from `T2.rows`, column x from `T2.cols.react` / `T2.cols.cot`). Don't `findPhrase` single percentages: tables are listed column by column in `words.json` and short tokens like "6%" are ambiguous. Figure 5 is in the shifted font: use `FIG5_*` boxes.

## Narration (segment `failures`)

| s | start | text |
|---|---|---|
| 0 | 0.00 | The authors also read two hundred HotpotQA runs by hand, right and wrong, from both methods, and sorted the failures in table two. |
| 1 | 9.14 | Chain of thought's main failure is invention: fifty-six percent of its wrong answers came from hallucination. |
| 2 | 15.72 | For ReAct, zero. |
| 3 | 17.35 | It isn't immune: six percent of its right answers rested on a hallucinated step. |
| 4 | 22.67 | ReAct breaks in its own ways. |
| 5 | 24.79 | Forty-seven percent of its failures are reasoning errors, including repeating its last thought and action, stuck in a loop. |
| 6 | 32.20 | Twenty-three percent are searches that return nothing useful, and derail the run. |
| 7 | 37.26 | Written thoughts have an upside: a person can fix them. |
| 8 | 40.62 | In the appendix, editing two thoughts turns a failed household run into a success. |

## Beats

1. s0 — p. 6 slides in, stamp `p.~6 \cdot \text{Section 3.3}`. Mint on `thus 200 examples in total` on "two hundred" (w4–5), then on `randomly sampled 50 trajectories with correct and incorrect answers` on "right and wrong, from both methods" (w10–15). On a `blankPage` beside the page: four rows of 50 small dots (real counts, 50 per group): `\text{ReAct, right}`, `\text{ReAct, wrong}`, `\text{CoT, right}`, `\text{CoT, wrong}`. On "table two" (w21–22) Table 2 lifts off (`T2.withCaption`) and lands large; stamp `p.~6 \cdot \text{Table 2}`.
2. s1 "Chain of thought's main failure is invention…" — camera pitches to ≈ 0.9. The four failure rows of Table 2 become paired 3D bars on the desk (height ∝ percent, axis from 0 to 60 with ticks at 20/40/60, TeX `\%` labels): per type, a CoT bar (neutral fill `F.block`, ink outline) and a ReAct bar (`PAL.act` fill, `PAL.actInk` outline). Types in `T2.rows` order: Reasoning error, Search result error, Hallucination, Label ambiguity. The bars start at zero height. On "invention" (w6) p. 33's hallucination example lifts in from the side (`P33.hallucination`, stamp `p.~33 \cdot \text{Appendix E.1}`), red marker on `1916 (Label: 1909)`. On "fifty-six percent" (w7–8) the CoT Hallucination bar rises to 56 and the table cell (`T2` Hallucination row × cot column) gets a red `markBox`. Hallucination bars carry `PAL.bad` outlines.
3. s2 "For ReAct, zero." — the ReAct Hallucination bar stays flat: a thin outline at 0 with the TeX label `0\%`, cell (`T2` Hallucination × react) boxed.
4. s3 "It isn't immune: six percent of its right answers rested on a hallucinated step." — a small second group of bars in front, lighter, labelled `\text{right answers}`: False positive, CoT 14 and ReAct 6. On "six percent" (w3–4) the ReAct bar rises to 6, the cell (`T2` False positive × react) boxed in `PAL.bad`. The 14 rises with it, smaller emphasis.
5. s4–s5 — the remaining ReAct bars rise: on "Forty-seven percent" (s5 w0–1) Reasoning error to 47 (CoT's to 16 alongside). Back on p. 6: mint on `the model repetitively generates the previous thoughts and actions` (w8–14), then `jump out of the loop` (w15–18). Visual (ILLUSTRATIVE, tag `\text{illustrative}`): the `LOOP` ring, small, at the back of the desk: the same Thought card and Act card go round twice, a third time; the ring's arrows turn `PAL.bad` and the motion stalls. For ≤ 1.5 s, mint on footnote 4 `We suspect that this could be due to the sub-optimal greedy decoding procedure` with a tiny tag `\text{authors' guess}`.
6. s6 "Twenty-three percent are searches that return nothing useful, and derail the run." — ReAct's Search result error bar rises to 23; CoT's slot shows a dash `-` (CoT never searches), no bar. Mint on `Non- informative search, which counts for 23% of the error cases` (2 lines; pass the phrase exactly like this, the hyphen breaks the line) during w0–7. Then p. 33's search-error block lifts (`P33.searchError`), marker on `Could not find goddess frigg.` on "derail the run" (w8–11). Label ambiguity bars (29 / 28) rise quietly at the end of s6 so the chart is complete; no voice on them.
7. s7 "Written thoughts have an upside: a person can fix them." — p. 15 slides in, stamp `p.~15 \cdot \text{Figure 5}`; camera on the whole figure (`FIG5.all`). Panel (a) (`FIG5.panels.a`) on the left: the paper's own red thoughts (Act 17, 23, 25) and ✗.
8. s8 "In the appendix, editing two thoughts turns a failed household run into a success." — on "editing two thoughts" (w3–5): in panel (b), `markBox` on Act17 (`FIG5_STEPS.b`) and our red strike line draws over the struck sentence (`FIG5.edits.act17struck`, the paper already strikes it; ours redraws it bolder); then a `PAL.thoughtInk` underline draws under the added text of Act23 (`FIG5.edits.act23added`, 2 pieces). On "failed household run" (w8–10) panel (a)'s ✗ (`FIG5.marks.a`) pulses; on "into a success" (w11–13) panel (b)'s ✓ (`FIG5.marks.b`) pulses and Obs29 (green in the paper) gets a green `markBox`. Mint on the caption phrase `By a human simply editing two thoughts` as the camera settles. Optional 3D: the two panels stand up side by side like an open book, (a) leaning back, (b) upright.

## Guardrails

- Table 2 percentages are within each group of hand-labelled runs, per method. Never turn them into counts: ReAct's failure column sums to 99 and doesn't divide evenly into 50 (47% of 50 = 23.5). The dot grid in beat 1 shows only the 4 × 50 sample sizes, not the categories.
- Whenever ReAct's 0% hallucination is on screen, its 6% false positives come with it (beat 4 follows within 2 s; keep both visible together at the end).
- CoT's search-result error is "-" in the paper: a dash, not 0.
- The loop jam is an illustration of the error the paper describes; its cause (greedy decoding) is the authors' suspicion, tagged so.
- Figure 5 is ALFWorld (a household task), not HotpotQA: the stamp says Figure 5, and the narration says "household run".
