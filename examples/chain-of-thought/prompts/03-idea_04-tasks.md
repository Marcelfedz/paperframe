# 03 · idea (44.6 s) and 04 · tasks (40.0 s) — the triple stands up; eight exemplars, nine kinds of question, five models

Write two scenes: `scenes/03-idea.js` and `scenes/04-tasks.js`. Shared data: `import { PAL, FAM, PH, P2, FIG1, FIG3, T20, STACK } from './_data.js'`. Facts and guardrails: `briefing.md`. Colours were taught on the cover (see `PAL` in `_data.js` and `prompts/01-cover_02-problem.md`): blue chain of thought, grey standard and input, green output and correct, red wrong. Both scenes keep the rights switch:

```js
// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages (grey word bars, same geometry) and redrawn figures.
const PAGES = true;
```

Idea is a 3D segment: the prompt stands up as triples. Tasks reuses the triple slabs from `STACK` for Table 20's eight real exemplars, then Figure 3. Build the triple once as a small helper inside your scene (three stacked slabs, `STACK.triple`), use it in both, and report it as a kit candidate.

Figure 1 (p. 1), Figure 3 (p. 4) and Table 20 (p. 35) are real text: `findPhrase` works. They already carry the paper's own coloured highlights (Figure 1 blue and green, Figure 3 green / orange / blue, Table 20 lavender): never run a multiply marker over those highlighted lines. Follow the voice with an ink underline or a `markBox` in `PAL.cotInk`. Underline helper (keep it in your scene, kit candidate): `highlight(ctx, C, page, pose, lines.map((L) => ({ ...L, y0: L.y1 - 3 })), p, { color: PAL.cotInk, alpha: 1, pad: 2 })`.

## idea — p. 2, p. 1 (Figure 1, right column)

| s | start | text |
|---|---|---|
| 0 | 0.00 | The paper keeps the prompting, and adds the reasoning. |
| 1 | 3.30 | Each example in the prompt becomes a triple: input, chain of thought, output. |
| 2 | 8.36 | Figure one, right side. |
| 3 | 10.13 | Same first question, but now the example shows its work. |
| 4 | 14.05 | Roger started with five balls. |
| 5 | 16.27 | Two cans of three tennis balls each is six tennis balls. |
| 6 | 19.90 | Five plus six equals eleven. |
| 7 | 22.21 | The model follows the pattern, and writes its own chain for the new question. |
| 8 | 26.79 | Twenty-three apples, twenty used, that leaves three. |
| 9 | 29.78 | Six more makes nine. |
| 10 | 31.46 | Correct. |
| 11 | 32.66 | In the paper's words, a chain of thought is a series of intermediate natural language reasoning steps that lead to the final output. |
| 12 | 40.75 | The model stays the same. |
| 13 | 42.44 | Only the examples in its prompt change. |

1. s0 — p. 2 slides in; camera on the paragraph at y 1100–1400 (`P2.limits`). Stamp `p.~2 \cdot \text{Section 1}`. Mint marker with the voice (paraphrase) on `PH.combine` (one line) across s0.
2. s1 — blue marker (`F.hlBlue`, the paper's own coinage) on `PH.triples` (one line, 712,1313–1159,1338; the angle brackets are the words "hinput," / "outputi.") during "a triple: input, chain of thought, output" (w6–12). Camera pitches to ≈ 0.85 and the first triple stands up at the left of the desk (`STACK.triple`, three stacked slabs): input (`PAL.input` fill, `PAL.inputInk` outline) on "input" (w8), chain (`PAL.cot` / `PAL.cotInk`) on "chain of thought" (w9–11), output (`PAL.out` / `PAL.outInk`) on "output" (w12). TeX labels `\text{input}`, `\text{chain of thought}`, `\text{output}`, colour-matched. Corner tag `\text{layout illustrative}`.
3. s2–s3 — p. 1 slides in at the right (p. 2 off); camera to Figure 1's right column (`FIG1.cot.input`), pitch back to ≈ 0.2. Stamp `p.~1 \cdot \text{Figure 1}`. On "right side" (s2 w2–3) ink `markBox` on `FIG1.cot.head`. On "Same first question" (s3 w0–2) ink `markBox` on the Roger question (x 876–1356, y 1338–1416). On "shows its work" (s3 w7–9) `markBox` in `PAL.cotInk` around `FIG1.cot.chainLines` (the paper's blue).
4. s4–s6 — the voice reads the chain verbatim. No marker (the lines are already blue): the `PAL.cotInk` underline follows the voice over `findPhrase(p1, PH.fig1Ex)` (2 lines: 906,1437–1350,1460 and 882,1461–1175,1484), progress across three sentences weighted by characters: `p = (27 * sayP(env, 4, t) + 48 * sayP(env, 5, t) + 11 * sayP(env, 6, t)) / 86`. Camera at ≈ ×2.1 on those two lines.
5. s6 end → s7 "The model follows the pattern, and writes its own chain for the new question." — the right column's pieces lift off as real crops onto the triple from beat 2: the Roger question (x 876–1356, y 1338–1416) onto the input slab, the two chain lines (crop x 876–1356, y 1434–1462, and x 876–1180, y 1458–1487) onto the chain slab, "The answer is 11." (`findPhrase(p1, 'The answer is 11.', 2)`, 1180,1461–1338,1484) onto the output slab; staggered over s6's last word and s7 w0–4. Camera pitches to ≈ 0.9. On "new question" (w12–13) the cafeteria question (`FIG1.cot.question`) lifts and lands on a lone input slab at `STACK.question`; it slides into the model block (`STACK.model`, `PAL.model` fill, ink outline, label `\text{language model}`) on "writes its own chain" (w6–9), and an empty triple starts rising at `STACK.answer`.
6. s8–s9 — the generated chain fills the new triple's chain slab: the paper's green lines (`FIG1.cot.outLines`) lift off p. 1 as crops, one per spoken piece: lines 1–2 during s8 ("Twenty-three apples, twenty used, that leaves three", w0–6), line 3 on "Six more makes nine" (s9 w0–3). Then "The answer is 9." (`findPhrase(p1, 'The answer is 9.')`, 2 pieces) lands on the output slab. The chain slab is `PAL.cot` even though the crop's highlight is green: the slab says what it is (chain), the crop shows the page as printed.
7. s10 "Correct." — the figure's ✓ (`FIG1.cot.tick`, crop) lands on top; the output slab's outline pulses `PAL.outInk`. Beside it, small and lower, the standard column's answer card from segment 2 (`FIG1.std.answer`, crop with its ✗, outline `PAL.bad`) slides in: 27 ✗ next to 9 ✓.
8. s11 — p. 2 back in view at the side, camera on y 1300–1370: yellow marker with the voice on `PH.definitionFull` (2 lines: 1195,1313–1400,1338 and 300,1343–1228,1368) during "chain of thought is a series … final output" (`sayWords(env, 11, 5, 22, t)`). Stamp `p.~2 \cdot \text{Section 1}`.
9. s12–s13 "The model stays the same. Only the examples in its prompt change." — camera pulls back, pitch ≈ 0.6: two prompts feed the same model block from two sides. Left: a standard prompt as a triple with no chain slab (input + output only), its output card the 27 ✗ crop. Right: the chain-of-thought triple from beat 5, its output the 9 ✓ triple. On "stays the same" (s12 w2–4) the one model block pulses ink. On "examples in its prompt change" (s13 w2–6) the chain slab of the right prompt glows `PAL.cot`; the left prompt's missing slab is a dashed outline. Tag `\text{layout illustrative}`.

Stamp: `p.~2` for beats 1–2 and 8, `p.~1 \cdot \text{Figure 1}` for beats 3–7 and 9.

Guardrails (idea):

- The triple layout, the model block and the arrows are ours (illustrative). Every text on them is a crop of p. 1, never retyped.
- Figure 1 doesn't name a model. Label the block `\text{language model}`, not PaLM.
- Figure 1 is an illustration of the format. The Roger exemplar is not one of the eight the authors used (Table 20, p. 35, segment 4). Show one triple here, not eight.
- Only s11 is yellow (verbatim on a body line). s4–s6 are verbatim too, but on lines the paper already highlights: underline, not marker.
- TeX: no `§`; escape `%`. Slab colour in fill or outline, never a coloured band on one edge.

## tasks — p. 35 (Table 20), p. 4 (Figure 3, Section 3.1)

| s | start | text |
|---|---|---|
| 0 | 0.00 | The authors wrote eight of these examples by hand, and used the same eight on every math benchmark but one, which is multiple choice. |
| 1 | 8.42 | Figure three shows the format beyond math. |
| 2 | 11.41 | Would a pear sink in water? |
| 3 | 13.24 | The chain reasons from density: a pear would float. |
| 4 | 16.46 | So, no. |
| 5 | 17.78 | A coin is heads up. |
| 6 | 19.34 | Maybelle flips it, Shalonda doesn't. |
| 7 | 21.67 | One flip, an odd number, so the coin ends tails up. |
| 8 | 25.30 | Five math benchmarks, five commonsense, two symbolic. |
| 9 | 29.14 | Five large language models, in sizes from under half a billion parameters to five hundred and forty billion. |
| 10 | 36.34 | Every answer was decoded greedily: one try per question. |

1. s0 — p. 35 slides in; camera on Table 20 (`T20.box` with `T20.caption`). Stamp `p.~35 \cdot \text{Table 20}`. Mint on `PH.t20Caption` on "eight of these examples" (w3–6). Camera pitches to ≈ 0.85: eight triples rise in a row going back (`STACK.exemplars`, n = 8), staggered across w3–8 ("eight of these examples by hand"). Each receives its real crops from p. 35: the Q block (`T20.ex[i].q`, x `T20.x0`–`T20.x1`) on its input slab and the A block (`T20.ex[i].a`) on its chain slab, with a thin output slab on top (the A block already ends in "The answer is N."). Cards scale so a crop line reads at ≥ 30 px when it lands, then shrink into the row. On "the same eight on every math benchmark but one" (w11–19) mint on `PH.t20Used` (2 lines); on "multiple choice" (w22–23) a small tag `\text{AQuA: multiple choice, its own 4 exemplars}` with `\text{p.~4}` in small type.
2. s1 "Figure three shows the format beyond math." — p. 4 slides in (p. 35 and the row slide off); camera on Figure 3 (`FIG3.withCaption`). Stamp `p.~4 \cdot \text{Figure 3}`. On "format" (w4) the nine panels (`FIG3.panels`) lift off in reading order and stand up as a 3×3 wall at the back of the desk (`liftPose`, `tilt` ≈ camera pitch ≈ 0.5). Each crop keeps its own coloured tab; we add no colour.
3. s2–s4 the pear — the StrategyQA panel (`FIG3.panels[3]`) comes forward and enlarges to reading size (line height ≥ 30 px on screen). s2: mint with the voice on `PH.pearQ` (2 lines; the question isn't highlighted by the paper, so a marker is fine). s3: the chain is orange in the paper, so `markBox` in `PAL.cotInk` around `PH.pearA` (3 lines) drawing from "density" (w4) to "float" (w8). s4 "So, no." — ink underline under `findPhrase(p4, PH.pearNo)` (first match, 2 pieces).
4. s5–s7 the coin — the pear panel returns to the wall; the Coin Flip panel (`FIG3.panels[8]`) comes forward. Mint with the voice on `PH.coinQ` (3 lines): its first sentence during s5, the rest during s6. s7: `markBox` in `PAL.cotInk` around `PH.coinA` (5 lines, the paper's blue) drawing across w0–10. A small coin token (ILLUSTRATIVE, a two-face disc, tag `\text{illustrative}`) beside the panel flips once on "One flip" (w0–1) and lands showing tails on "tails up" (w9–10).
5. s8 "Five math benchmarks, five commonsense, two symbolic." — the wall regroups into three clusters by the crops' own tabs: the two arithmetic panels, the five commonsense panels, the two symbolic panels. Ink TeX labels under each, on their words: `\text{arithmetic: 5 benchmarks}` (w0–2), `\text{commonsense: 5}` (w3–4), `\text{symbolic: 2}` (w5–6). Counts are sourced: p. 3 ("five math word problem benchmarks"), p. 7 ("five datasets"), p. 8 ("two toy tasks").
6. s9 — camera to the "Language models." paragraph on p. 4 (y 1323–1499); stamp `p.~4 \cdot \text{Section 3.1}`. Mint on `PH.fiveModels` on "Five large language models" (w0–3). In 3D, five neutral slabs in a row (`PAL.model`, ink outline, no logos), labelled with the paper's names `\text{GPT-3}`, `\text{LaMDA}`, `\text{PaLM}`, `\text{UL2}`, `\text{Codex}`; each carries a short ladder of thin plates, one per size printed on p. 4, with TeX size tags: GPT-3 `350M, 1.3B, 6.7B, 175B`; LaMDA `422M, 2B, 8B, 68B, 137B`; PaLM `8B, 62B, 540B`; UL2 `20B`; Codex one plate with no size (p. 4 gives none). On "under half a billion" (w7–10) mint on `PH.sizesLaMDA` and LaMDA's 422M plate glows; on "five hundred and forty billion" (w13–17) mint on `PH.sizesPaLM` and PaLM's 540B plate glows. Plate geometry illustrative (tag), sizes are labels.
7. s10 "Every answer was decoded greedily: one try per question." — mint on `PH.greedy` on "decoded greedily" (w3–4). On "one try" (w5–6) each model slab puts out one small answer card (grey, no text) and stops. Tag `\text{one sample per question}`. Segment 8 comes back to this when it fans out many chains.

Guardrails (tasks):

- The eight triples carry Table 20's real crops (p. 35). Figure 1's Roger example is not among them: don't put it in the row.
- AQuA used four other exemplars (p. 4, Table 21): the tag says so; don't add a ninth triple.
- GPT-3's sizes are what the paper says they "presumably correspond" to (p. 4): small tag `\text{as given on p.~4}` on the GPT-3 ladder. Codex has no printed size: none on screen.
- Figure 3 panels include real people's names as benchmark items (Sports Understanding, Last Letter Concatenation): they stay inside the crops; never enlarge those two panels.
- No model logos, company names or products in our 3D; the paper's model names only.
- TeX: no `§`; escape `%`. Slab colour in fill or outline, never a coloured band on one edge; no number badges.
