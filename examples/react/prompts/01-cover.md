# 01 · cover (42.7 s) — the page, the line, the promise

Write `scenes/01-cover.js`. Device set (`docs/style-folio.md`): page in, highlight with the voice, lift-off, slabs standing up, source stamp. Shared data: `import { PAL, LOOP, P1, FIG1, T1, T2 } from './_data.js'`. Facts and guardrails: `briefing.md`.

Pages: p. 1 (title, authors, abstract), plus small crops of p. 2, p. 5 and p. 6 as thumbnails in the last beat.

Colours for the whole video (from `PAL`, sampled from the paper's Figure 1): Thought = `PAL.thought` fill / `PAL.thoughtInk`; Action = `PAL.act` fill / `PAL.actInk` (the paper's keyword blue); Observation = `PAL.obs` / `PAL.obsInk`. Green `PAL.good` = correct, red `PAL.bad` = hallucinated/wrong. This cover is where the viewer learns them.

## Narration (audio/timings.json, segment `cover`)

| s | start | text |
|---|---|---|
| 0 | 0.00 | This is page one of a paper that went up on arXiv on October sixth, twenty twenty-two. |
| 1 | 5.84 | Seven authors, from Princeton and Google's Brain team. |
| 2 | 9.39 | Reasoning and acting in language models, the abstract says, had mostly been studied as separate topics. |
| 3 | 16.01 | One line puts them together. |
| 4 | 18.12 | Generate both reasoning traces and task-specific actions in an interleaved manner. |
| 5 | 23.56 | Think, act, read what comes back, think again. |
| 6 | 26.51 | They called it ReAct, for reason plus act. |
| 7 | 29.15 | At ICLR twenty twenty-three it was an oral, in the top five percent of papers. |
| 8 | 34.87 | By the end, you'll be able to read a ReAct trace, see where it breaks, and know what its numbers actually say. |
| — | 40.7–42.7 | pause |

## Beats

1. s0 — p. 1 slides onto the desk with a small arc; the camera reads the whole page. On "October sixth, twenty twenty-two" (s0 words 13–16): a TeX tag beside the page, `\texttt{arXiv:2210.03629}` over `\text{v1 · 6 October 2022}`. The page's own side stamp reads "10 Mar 2023" (v3, the camera-ready we show): `markBox` it lightly (`P1.stamp`) and tag `\text{v3 shown}` so the two dates don't read as a contradiction.
2. s1 "Seven authors, from Princeton and Google's Brain team" — mint marker on the seven names, staggered across words 0–1 (`Shunyu Yao`, `Jeffrey Zhao`, `Dian Yu`, `Nan Du`, `Izhak Shafran`, `Karthik Narasimhan`, `Yuan Cao`). On "Princeton" (w3) blue marker on `Department of Computer Science, Princeton University`; on "Google's Brain team" (w5–7) on `Google Research, Brain team`.
3. s2 — camera pushes into the abstract (`P1.abstract`). On "Reasoning" (w0) a thin underline in `PAL.thoughtInk` under `reasoning (e.g. chain-of-thought prompting)`; on "acting" (w2) one in `PAL.actInk` under `acting (e.g. action plan generation)` (2 lines). Then mint marker with the voice over `have primarily been studied as separate topics` during "had mostly been studied as separate topics" (`sayWords(env, 2, 9, 15, t)`). The voice paraphrases ("mostly" vs "primarily"): that's why this one is mint, not the yellow verbatim marker.
4. s3 "One line puts them together." — camera eases to the two abstract lines holding the key phrase (lines at y ≈ 860–915).
5. s4 — the key line, read verbatim: yellow marker with `sayP(env, 4, t)` over `generate both reasoning traces and task-specific actions in an interleaved manner` (2 lines: 701,860–1300,884 and 400,890–676,915). Hold a beat after the last word, then the strip lifts off (`liftPose`, pad 3 px vertically, `tilt` ≈ camera pitch so it stands facing the camera) and lands large, upper centre. As it lands: "reasoning traces" gets a `PAL.thoughtInk` underline, "actions" a `PAL.actInk` one, "interleaved" a black ink circle.
6. s5 "Think, act, read what comes back, think again." — camera pitches to ≈ 0.85. Under the standing strip, three small slabs rise in the `LOOP` ring layout at about half scale (`LOOP.stations`, `LOOP.slab`): Thought (`PAL.thought`) on "Think" (w0), Action (`PAL.act`) on "act" (w1), Observation (`PAL.obs`) on "read what comes back" (w2–5). TeX labels `\text{Thought}`, `\text{Action}`, `\text{Observation}`. On "think again" (w6–7) a curved arrow draws from Observation back into Thought, closing the ring. No environment slab yet (that's segment 3).
7. s6 "They called it ReAct, for reason plus act." — camera back down to p. 1; blue marker on `approach, named ReAct` on "ReAct" (w3). A small TeX tag next to the ring: `\text{Re}` under Thought, `\text{Act}` under Action (on "reason plus act", w6–8).
8. s7 "At ICLR twenty twenty-three it was an oral, in the top five percent of papers." — mint marker on the running header `Published as a conference paper at ICLR 2023` on "ICLR twenty twenty-three" (w1–3); TeX tag `\text{ICLR 2023 · oral · top 5\%}` on "oral … top five percent" (w7–12). Source is iclr.cc (briefing), not the page: keep the tag off the page, on the desk.
9. s8 the promise — three thumbnails land in a row on the desk, each on its words, as small paper crops with shadows: "read a ReAct trace" (w7–10) → Figure 1 (1d) crop from p. 2 (`FIG1.panels.d1`); "see where it breaks" (w11–14) → Table 2 crop from p. 6 (`T2.box`); "what its numbers actually say" (w16–21) → Table 1 crop from p. 5 (`T1.box`). No labels needed beyond the crops; they reappear later.
10. Pause (40.7–42.7): hold, slow yaw ≤ 0.3 rad over the ring and thumbnails.

Stamp throughout: `cite(p1, { label: 'p.~1', rect })` with the rect following the region in focus (header, authors, abstract, stamp). During beat 9 the label stays `p.~1`.

## Guardrails

- s4 is the only verbatim quote; everything else is a paraphrase (mint marker or no marker).
- The ICLR "oral / top 5%" is sourced from iclr.cc (briefing), not from the page. No citation counts, no "most influential", no adoption claims.
- Two Princeton authors, five at Google Research, Brain team. Don't write "Google Brain" on screen; the page says "Google Research, Brain team".
- TeX: escape `%` as `\%`; no `§`; no `\boxed{}`.
- Card and slab colour goes in the fill or the outline, never a coloured band on one edge.
