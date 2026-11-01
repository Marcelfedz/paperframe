# 04 · tools (36.0 s) and 05 · household (36.7 s)

Write two scenes: `scenes/04-tools.js` and `scenes/05-household.js`. Shared data: `import { PAL, LOOP, ROOM, P4, P18, FIG1, FIG1_LINES, FIG1_STEPS } from './_data.js'`. Facts and guardrails: `briefing.md`. Both reuse the ring from segment 3 (`LOOP`), small and in the background, so the viewer keeps the loop in mind.

## tools — pages p. 4 (Section 3.1 Action Space, Section 3.2), p. 18 (Appendix C.1, the Milhouse example)

| s | start | text |
|---|---|---|
| 0 | 0.00 | Section three point one gives the model a deliberately small tool: three actions on Wikipedia. |
| 1 | 6.62 | Search returns the first five sentences of a page, or five similar titles. |
| 2 | 11.81 | Lookup returns the next sentence containing a string, like Control F in a browser. |
| 3 | 17.09 | Finish submits the answer. |
| 4 | 19.07 | The authors call it significantly weaker than state-of-the-art retrievers. |
| 5 | 23.54 | On purpose: the model has to reason about what to look up. |
| 6 | 27.44 | Nothing is trained. |
| 7 | 28.84 | The model is PaLM, five hundred and forty billion parameters, frozen, with six hand-written examples in its prompt. |

1. s0 — p. 4 slides in; camera to the Action Space paragraph (`P4.actionSpace`), stamp `p.~4 \cdot \text{Section 3.1}`. On "deliberately small tool" (w8–10) `markBox` the paragraph. Camera pitches to ≈ 0.9: the `LOOP` ring sits small at the back; the Wikipedia slab (`LOOP.env`) comes forward, large. On "three actions" (w11–12) three flat keys rise on its top face, staggered, labelled in `\texttt{}` in `PAL.actInk`: `\texttt{search[entity]}`, `\texttt{lookup[string]}`, `\texttt{finish[answer]}`.
2. s1 — mint marker (paraphrase) on `search[entity], which returns the first 5 sentences` (w0–5), then on `suggests top-5 similar entities` (w9–12). The search key presses. On a `blankPage` beside the slab, a toy page (ILLUSTRATIVE, tag `\text{illustrative}`): a title bar and ten grey sentence bars; the first five light on "first five sentences" (w3–5). On "five similar titles" (w10–12) the page folds away and five small title chips fan out instead (echo of Obs2 in segment 3).
3. s2 — mint on `lookup[string], which would return the next sentence in the page` (w0–4), then on `simulating Ctrl+F functionality on the browser` (w8–13). Lookup key presses; on the toy page a find bar `\texttt{Ctrl+F}` drops in and one sentence bar further down lights. Then the real example: p. 18 slides in at the side (stamp `p.~18 \cdot \text{Appendix C.1}`) and the strip `P18.thought2` + `P18.action2` + `P18.obs2` lifts off as one card: `markBox` on `The paragraph does not tell who Milhouse is named after, maybe I can look up "named after".` (thought outline `PAL.thoughtInk`) and on `Lookup[named after]` (`PAL.actInk`). Keep it ≤ 3 s; no voice on it, it's the evidence the toy illustrates.
4. s3 "Finish submits the answer." — mint on `finish[answer]`; the finish key presses and a small `\text{episode ends}` tag appears; the ring's Action → Wikipedia arrow stays dark (same rule as segment 3).
5. s4 — back on p. 4: yellow marker with the voice on `significantly weaker than state-of-the- art lexical or neural retrievers` (2 lines, the hyphen breaks the line; pass the phrase exactly like this) during w4–8.
6. s5 "On purpose: the model has to reason about what to look up." — mint on `force models to retrieve via explicit reasoning in language`. In 3D: an arrow from the ring's Thought slab to the search key, a query chip travelling along it (the reasoning picks the query).
7. s6–s7 — stamp `p.~4 \cdot \text{Section 3.2}`. On "Nothing is trained" a large slab labelled `\text{PaLM-540B}` (PAL.env fill, ink outline) stands behind the ring with a small `\text{frozen}` tag on "frozen" (s7 w11). The model name is on p. 3 (`PaLM-540B`, §2): either a quick mint mark there via a small p. 3 strip, or the tag carries `\text{p.~3}` in small type. On "six hand-written examples" (s7 w13–15) mint marker on `we randomly select 6 and 3 cases` and six small blank cards (ILLUSTRATIVE, ruled lines only) slide into a tray in front of the model slab, labelled `\text{HotpotQA prompt: 6}`.

Guardrails (tools): the toy page and the query chip are illustrative; the Milhouse card is the paper's own example. "Six" is HotpotQA's count (Fever used 3; the highlight shows both). Don't compare against named retrievers or products.

## household — pages p. 7 (Section 4, ALFWorld), p. 2 (Figure 1 bottom half), p. 4 (one line)

| s | start | text |
|---|---|---|
| 0 | 0.00 | ALFWorld is a text game set in a house: the model reads what it sees, and types what to do. |
| 1 | 6.07 | The task: put some pepper shaker on a drawer. |
| 2 | 9.06 | Acting alone, the model tries to take a pepper shaker from the sink basin, where there is none. |
| 3 | 14.85 | Nothing happens. |
| 4 | 16.15 | It tries again. |
| 5 | 17.57 | Nothing happens. |
| 6 | 19.09 | With ReAct, the first thought is a plan: a pepper shaker is more likely to appear in cabinets, or on countertops. |
| 7 | 26.63 | It finds one on countertop three, and writes the next step: put it in the drawer. |
| 8 | 31.55 | Done. |
| 9 | 32.62 | Here thoughts are sparse. |
| 10 | 34.23 | The model decides when one is worth writing. |

1. s0 — p. 7 slides in, stamp `p.~7 \cdot \text{Section 4}`; mint on `synthetic text-based game` on "text game" (w3–4). Then p. 2 comes in showing Figure 1's bottom half (`FIG1.bottom`, stamp `p.~2 \cdot \text{Figure 1 (2)}`); the task panel (`FIG1.panels.q2`) lifts as a card. Camera pitches to ≈ 0.9: the room builds as a small diorama from `ROOM` (floor sheet, one slab per receptacle, TeX labels from `ROOM.items`), with a corner tag `\text{layout illustrative}`. On "reads what it sees" (w11–14) mint sweep over the task card's room lines (`FIG1_LINES.q2[1..3]`).
2. s1 — yellow with the voice over the task line (`FIG1_LINES.q2[4]`, "Your task is to: Put some pepper shaker on a drawer.") using `sayWords(env, 1, 2, 8, t)`. A ghosted pepper-shaker token sits on countertop 3 (`ROOM.shaker`), not yet revealed.
3. s2–s5 Act-only — panel (2a) (`FIG1.panels.a2`) parks at the left edge of the desk. A small ink token walks `ROOM.actOnly`: drawer 1 (opens), then sinkbasin 1, during s2 w0–13. Each act that fires pulses its line in (2a) (`FIG1_STEPS.a2`, Act1–Act3). On "Nothing happens." (s3) the token jolts at the sink basin; red `markBox` on (2a) Act4 + Obs4 (the paper's red). "It tries again." (s4): same jolt. "Nothing happens." (s5): Act5 + Obs5 boxed, the ✗ (`FIG1.marks.a2`) pulses, token greys.
4. s6 ReAct's plan — panel (2b) (`FIG1.panels.b2`) parks at the right edge. Its first step (`FIG1_STEPS.b2` Act1, a Think) lifts and stands above the room as a large thought card (`PAL.thought` fill, the paper already fills it in this blue, `PAL.thoughtInk` outline). On "cabinets" (w18) cabinets 1–6 tint `PAL.thought`; on "countertops" (w21) countertops 1–3 too; the other receptacles dim.
5. s7–s8 — a new token walks `ROOM.react` quickly (cabinet 1 → 2 → 3 → countertop 1 → 2 → 3) during w0–5; on "countertop three" (w4–5) the pepper shaker token turns solid `PAL.good`. On "writes the next step" (w7–10) the second Think (`FIG1_STEPS.b2` Act8) lifts as a thought card. On "put it in the drawer" (w11–15) the token carries the shaker to drawer 1. "Done." (s8): Obs11's green line boxed in (2b) and the ✓ (`FIG1.marks.b2`) pulses.
6. s9–s10 sparse vs dense — two vertical strips of small chips on the desk, one chip per step coloured by kind (`PAL.thought` / `PAL.act` / `PAL.obs`): left, (1d) from segment 3 (`FIG1_STEPS.d1`, a thought before every action); right, (2b) (`FIG1_STEPS.b2`, two thoughts among the twelve other steps shown; skip the `note` entry). On "sparse" (s9 w3) the two thought chips in the right strip glow. On "decides when one is worth writing" (s10) a lifted p. 4 strip: mint on `asynchronous occurrence of thoughts and actions for itself` (stamp `p.~4`).

Guardrails (household): the room layout is ours (labelled); objects and the visit order come from Figure 1 (2). Figure 1 (2b) elides steps 3–5 with a note whose count doesn't fit the numbering: animate the visit order only, show no act numbers for the elided part. The paper spells it "peppershaker" in (2a) and "pepper shaker" in (2b): crops show it as printed; our labels say "pepper shaker". ALFWorld prompts use 2 annotated trajectories each, not 6: don't reuse the tools segment's tray here.
