# 02 · problem (42.1 s) — reasoning without facts, acting without reasoning

Write `scenes/02-problem.js`. Shared data: `import { PAL, FIG1, FIG1_LINES, FIG1_STEPS } from './_data.js'`. Facts and guardrails: `briefing.md`.

Pages: p. 2 only (Figure 1 top half, `FIG1.top`; body text under the figure).

Figure text can't be found with `findPhrase` (shifted font, see the header of `_data.js`): every highlight or box inside Figure 1 uses the boxes in `FIG1_LINES` / `FIG1_STEPS` / `FIG1.panels` / `FIG1.marks`. The body text under the figure is normal: use `findPhrase` there.

The cards in this segment are real crops of the figure's panels lifted off the page (`liftPose`), never retyped text. The paper's own red highlight in (1b) and its ✗ marks are part of the crop; we add our marks on top.

## Narration (segment `problem`)

| s | start | text |
|---|---|---|
| 0 | 0.00 | Page two opens with the paper's running example, a question with two hops. |
| 1 | 4.93 | The Apple Remote was originally designed for one program. |
| 2 | 8.52 | What other device can control that program? |
| 3 | 11.41 | Asked straight out, the model answers: iPod. |
| 4 | 14.50 | Wrong. |
| 5 | 15.61 | Asked to think step by step, it reasons fluently, from a fact it made up: that the remote was designed for Apple TV. |
| 6 | 23.24 | Wrong again. |
| 7 | 24.60 | The paper calls this reasoning a static black box, not grounded in the external world. |
| 8 | 30.15 | Now give the model a search tool, and no room to think. |
| 9 | 33.55 | It even reaches the right page, then answers: yes. |
| 10 | 37.21 | One side reasons without facts. |
| 11 | 39.39 | The other finds facts and can't reason over them. |

## Beats

1. s0 — p. 2 slides in, camera to the top half of Figure 1 (`FIG1.top`). Stamp `p.~2 \cdot \text{Figure 1}`. On "a question with two hops" (w8–12) `markBox` on `FIG1.panels.q`, then the question panel lifts off and lands standing at the top centre of the desk, large.
2. s1–s2 — the voice paraphrases the question, so mint (not yellow) marker sweeps the lifted card's three question lines (`FIG1_LINES.q[1..3]`) across s1–s2. Beside it, on a `blankPage` strip, our two-hop sketch: `\text{Apple Remote}` → `?` → `?`, the arrows labelled `\text{hop 1}` and `\text{hop 2}`; the first `?` draws on "one program" (s1 w7–8), the second on "other device" (s2 w1–2). No program name yet: Front Row is revealed in segment 3.
3. s3–s4 "Asked straight out… iPod. Wrong." — panel (1a) lifts as the first card into the left lane (`FIG1.panels.a1`). On "iPod" (s3 w6) a thin ink underline under `Answer: iPod` (`FIG1_LINES.a1[1]`). On "Wrong." (s4) the figure's own ✗ (`FIG1.marks.a1`) pulses and the card's outline turns `PAL.bad`.
4. s5–s6 — panel (1b) lifts as the second card. On "reasons fluently" (w7–8) the card's thought lines get a quick ink tick each (it reads smoothly). On "a fact it made up" (w9–14) red `markBox` around the paper's red-highlighted lines (`FIG1.hallucination`); on "designed for Apple TV" (w15–22) a heavier red marker sweep over those same lines. On "Wrong again." the ✗ (`FIG1.marks.b1`) pulses, outline `PAL.bad`.
5. s7 — camera slides down to the body text under the figure. Yellow marker with the voice: `reasoning is a static black box` on "this reasoning a static black box" (w3–8), then `is not grounded in the external world` on w9–14. Stamp `p.~2 \cdot \text{Section 1}`. Visual echo on the (1b) card: a closed ink box (thin slab, lid on) settles over it, so the card sits sealed inside; a dashed arrow from it toward a faint `\text{world}` label stops short. Illustrative, small.
6. s8 "a search tool, and no room to think" — panel (1c) lifts as the third card. Its four `Act` steps (`FIG1_STEPS.c1`, k = act) light one after another in `PAL.actInk` outlines on "search tool" (w5–6); on "no room to think" (w8–11) a tiny `\text{no thoughts}` tag under the card.
7. s9 "It even reaches the right page, then answers: yes." — green `markBox` (`PAL.goodMark`) on Act 3 + Obs 3 (`FIG1_STEPS.c1` Act3, Obs3) on "reaches the right page" (w2–5); on "yes" (w8) red `markBox` on Act 4 (`Finish[yes]`) and the ✗ (`FIG1.marks.c1`) pulses, outline `PAL.bad`.
8. s10–s11 — the three cards regroup: (1a) small at the back; (1b) left with a `PAL.thoughtInk` outline and the TeX caption `\text{reasoning, no facts}` on "reasons without facts" (s10); (1c) right with a `PAL.actInk` outline and `\text{facts, no reasoning}` on "can't reason over them" (s11 w4–8). Between them, a dashed empty rectangle the size of panel (1d), waiting: segment 3 fills it.

## Guardrails

- Never retype Figure 1 text; cards are crops. The figure's panel label says "Hotspot QA" (the paper's typo); any label we add says HotpotQA.
- "Two hops" is our description of the question; HotpotQA is a multi-hop benchmark (p. 4). The two-hop sketch is ours and shows no answer.
- The paraphrased question gets mint; only the s7 phrases are verbatim (yellow).
- No Apple logos, no product imagery.
- Outline colour for verdicts, never a coloured edge band on a card.
