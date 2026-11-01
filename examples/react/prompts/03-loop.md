# 03 · loop (54.4 s) — the idea, the loop standing up, the trace replayed (machine segment)

Write `scenes/03-loop.js`. Shared data: `import { PAL, LOOP, P3, FIG1, FIG1_LINES, FIG1_STEPS } from './_data.js'`. Facts and guardrails: `briefing.md`. This is the video's centrepiece: build it richest. The ring geometry in `LOOP` comes back in segments 4, 6 and 8, so draw it from that data only (consider a small `ring(ctx, C, t, opts)` helper inside the scene that later scenes can copy or import).

Pages: p. 3 (Section 2: the idea, Â = A ∪ L, the context c_t), p. 2 (Figure 1, panel 1d).

Figure 1 text can't be found with `findPhrase`: use `FIG1_STEPS.d1` (11 steps: Thought1, Act1, Obs1, Thought2, Act2, Obs2, Thought3, Act3, Obs3, Thought4, Act4) and `FIG1_LINES.d1` for single lines. p. 3 is normal text.

## Narration (segment `loop`)

| s | start | text |
|---|---|---|
| 0 | 0.00 | Section two. |
| 1 | 1.27 | The idea of ReAct is simple. |
| 2 | 3.58 | Among its actions, the model gets one more: writing a thought. |
| 3 | 7.44 | A thought does not affect the external environment, so nothing comes back. |
| 4 | 11.63 | It only adds to the context, the running record the model reads before its next step. |
| 5 | 17.10 | That makes a loop with three parts. |
| 6 | 19.09 | Thought. |
| 7 | 19.97 | Action. |
| 8 | 21.02 | Observation. |
| — | 22.0–23.5 | pause |
| 9 | 23.55 | Here's the same question, the ReAct way. |
| 10 | 26.45 | Thought one: search Apple Remote, find the program it was designed for. |
| 11 | 30.76 | The search comes back with a name: Front Row. |
| 12 | 33.77 | Thought two: search Front Row. |
| 13 | 35.65 | Could not find. |
| 14 | 37.09 | The tool offers similar titles. |
| 15 | 39.58 | Thought three changes the plan: search Front Row, software. |
| 16 | 43.58 | Thought four reads the answer out of what came back: the keyboard function keys. |
| 17 | 48.29 | Finish. |
| 18 | 49.21 | Correct. |
| 19 | 50.41 | Every step is on the page, so you can see where each fact came from. |

## Beats

1. s0–s1 — p. 3 slides in (p. 2 leaves). On "Section two" camera to the heading (`P3.sec2`); stamp `p.~3 \cdot \text{Section 2}`. Yellow marker with the voice on `The idea of ReAct is simple` (`sayP(env, 1, t)`).
2. s2 "Among its actions, the model gets one more: writing a thought." — mint marker on `we augment the agent’s action space to` (w0–2), then `markBox` on the formula `P3.aug` (Â = A ∪ L) on "one more" (w6–7). The formula strip lifts off; beside it on the desk, our TeX rebuild, larger: `\hat{\mathcal{A}} = \mathcal{A} \cup \mathcal{L}`. On "writing a thought" (w8–10) two tags draw on: under `\mathcal{A}` `\text{actions}` in `PAL.actInk`, under `\mathcal{L}` `\text{language: thoughts}` in `PAL.thoughtInk`.
3. s3 — yellow marker on `does not affect the external environment` (w2–7), then mint on `thus leading to no observation feedback` during "so nothing comes back" (w8–11; the voice paraphrases that half).
4. s4 "It only adds to the context, the running record…" — `markBox` on `P3.ctxUpd` (c_{t+1} = (c_t, â_t)) on "adds to the context" (w1–5); then on `P3.ctxDef` (c_t = (o_1, a_1, …, o_t)) on "the running record" (w6–8). Both strips lift and fly to the desk centre: they become the base of the context stack (`LOOP.stack`).
5. s5–s8 the loop stands up. Camera pitches to ≈ 1.0, pages slide to the desk edge. Three slabs rise on their words, at `LOOP.stations` with `LOOP.slab` size: Thought (`PAL.thought`, outline `PAL.thoughtInk`, label `\text{Thought}`) on s6, Action (`PAL.act`, `\text{Action}`) on s7, Observation (`PAL.obs`, `\text{Observation}`) on s8. During s7–s8 the environment slab rises outside the ring (`LOOP.env`, `PAL.env`, `\text{Wikipedia}`). Arrows draw on: Thought → Action inside the ring; Action → Wikipedia (out); Wikipedia → Observation (back in); Observation → Thought (ring closes). Thought also has its own short arrow straight down into the context stack and none to Wikipedia: s3's "nothing comes back" made physical. Pause (22.0–23.5): slow yaw ≤ 0.4 rad.
6. s9 "Here's the same question, the ReAct way." — p. 2 slides back in at the left edge, flat and small; `markBox` on `FIG1.panels.d1`. The question crop (`FIG1.panels.q`) drops onto the context stack as card zero.
7. s10–s18 the replay. Each step of `FIG1_STEPS.d1` lifts off p. 2 as a real crop card, flies to its station, then drops onto the context stack (one `LOOP.stack.dz` higher each). Thought cards: fill `PAL.thought`, outline `PAL.thoughtInk`; Act cards: `PAL.act` / `PAL.actInk`, and on landing a pulse runs Action → Wikipedia; Obs cards come out of the Wikipedia slab into Observation, `PAL.obs` / `PAL.obsInk`. Cards scale up at their station so the crop text reads (line height ≥ 30 px on screen), shrink onto the stack.
   - s10 (26.45): Thought1 at "Thought one" (w0–1); Act1 on "search Apple Remote" (w2–4).
   - s11 (30.76): Obs1 emerges; on "Front Row" (w7–8) green `markBox` (`PAL.goodMark`) on the paper's green "Front Row media center" (`FIG1_LINES.d1` line 6, y 351–366, x 873–1056).
   - s12 (33.77): Thought2 on "Thought two"; Act2 on "search Front Row" (w2–4).
   - s13 (35.65) "Could not find.": Obs2 emerges; a small red ink tick beside it (our mark).
   - s14 (37.09) "similar titles": on Obs2, `markBox` on the paper's green "Front Row (software)" suggestion, which wraps: x 1221–1300, y 466–482 and x 878–1000, y 482–498.
   - s15 (39.58): Thought3; on "changes the plan" (w2–4) the Thought slab nudges (a small hop, the plan turns); Act3 on "search Front Row, software" (w5–8).
   - s16 (43.58): Obs3 quickly first (not narrated on its own), then Thought4; on "the keyboard function keys" (w10–13) green `markBox` on Thought4's green highlight (x 960–1365, y 598–613 and x 873–1185, y 614–630).
   - s17 (48.29) "Finish.": Act4 (Finish[keyboard function keys]) lands on Action. No pulse to Wikipedia: finish ends the episode.
   - s18 (49.21) "Correct.": the figure's own ✓ (crop of `FIG1.marks.d1`) lands on top of the stack.
8. s19 "Every step is on the page, so you can see where each fact came from." — camera pulls back and pitches down to ≈ 0.6: the stack fans out into a readable column, in order. Thin leader lines link each green fact to the observation it came from: Obs1 → Thought2 ("Front Row media center program"), Obs2's suggestion → Thought3/Act3 ("Front Row (software)"), Obs3 → Thought4 (keyboard function keys). The links use `PAL.goodMark`.

Stamp: `p.~3 \cdot \text{Section 2}` for beats 1–5, `p.~2 \cdot \text{Figure 1 (1d)}` from beat 6 on.

## Guardrails

- The ring, arrows, context stack and Wikipedia slab are our diagram of Section 2: no numbers on it. The cards are the paper's crops, never retyped.
- Obs3 is truncated in the figure ("…"); the keyboard keys appear in Thought4's green highlight. Don't invent the hidden observation text.
- Finish triggers no observation in our animation; Thought triggers none either. Only Action crosses to Wikipedia.
- TeX: "Section 2", never `§`; `\hat{\mathcal{A}}` renders in MathJax.
- Slab and card colour in fill or outline, never a coloured edge band.
