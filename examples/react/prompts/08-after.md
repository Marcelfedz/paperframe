# 08 · after (45.2 s) — limits, fine-tuning, ethics, what followed, end card

Write `scenes/08-after.js`. Shared data: `import { PAL, LOOP, P1 } from './_data.js'`. Facts and guardrails: `briefing.md`.

Pages: p. 9 (Section 6 Conclusion), p. 6 (fine-tuning paragraph), p. 10 (Ethics statement), an external card for Reflexion (no page of that paper on the desk: it isn't prepped and has its own rights), p. 1 for the end card.

## Narration (segment `after`)

| s | start | text |
|---|---|---|
| 0 | 0.00 | Its limits: harder tasks need more examples than fit in a prompt. |
| 1 | 4.23 | Fine-tuning helps: trained on three thousand ReAct runs, an eight-billion-parameter model beat every prompting method at sixty-two billion. |
| 2 | 13.31 | Its ethics statement warns that a model that acts can look up private information, or do harm. |
| 3 | 19.09 | Here, it couldn't buy anything, or edit Wikipedia. |
| 4 | 22.55 | In March twenty twenty-three, Reflexion built on it: when a ReAct agent fails, it writes a reflection on what went wrong, and tries again. |
| 5 | 31.28 | Thought, action, observation, each one written down where you can read it. |
| 6 | 35.85 | ReAct: Synergizing Reasoning and Acting in Language Models. |
| 7 | 39.91 | Yao and colleagues, ICLR twenty twenty-three. |
| 8 | 43.08 | The paper is right next to this video. |

## Beats

1. s0 — p. 9 slides in, stamp `p.~9 \cdot \text{Section 6}`. Mint with the voice (paraphrase) on `complex tasks with large action spaces require more demonstrations to learn well` (w2–6), then on `go beyond the input length limit of in-context learning` (w7–11). Visual: the six prompt cards from segment 4's tray (ILLUSTRATIVE) try to fit into a fixed-width slot labelled `\text{prompt}`; the slot is full and two more cards hang over its edge.
2. s1 — p. 6 slides in, stamp `p.~6 \cdot \text{Section 3.3}`. Mint on `when finetuned with just 3,000 examples` on "trained on three thousand ReAct runs" (w2–7), then mint (the voice paraphrases) on `PaLM-8B finetuned ReAct outperforming all PaLM-62B prompting methods` (2 lines) during w8–17. Visual: two slabs side by side, a small one `\text{8B, fine-tuned}` and a large one `\text{62B, prompted}`; on "beat" (w11) the small slab's outline turns `PAL.goodMark` and a thin `>` sign draws between them. No values on the slabs: Figure 3 is a plot without printed numbers.
3. s2 — p. 10 slides in, stamp `p.~10 \cdot \text{Ethics statement}`. Mint on `hooking up a large language model with an action space to interact with external environments` on "a model that acts" (w5–8), then mint on `looking up inappropriate or private information, or taking harmful actions in an environment` (2 lines) during "look up private information, or do harm" (w10–16).
4. s3 "Here, it couldn't buy anything, or edit Wikipedia." — mint on `models cannot really buy products on WebShop the research benchmark, or edit Wikipedia` (2 lines). Visual: the `LOOP` ring returns small; the Action → environment arrow ends at a closed gate (a thin slab across the arrow), two small tags `\text{no buying}`, `\text{no editing}`.
5. s4 Reflexion — an external card on a `blankPage` (the stamp shows `\texttt{arXiv:2303.11366}` instead of a page thumbnail): `\text{Reflexion}`, `\text{Shinn et al. · March 2023}` on "In March twenty twenty-three, Reflexion" (w0–4). The ring grows a fourth station outside the Observation slab: a slab labelled `\text{Reflect}` (outline `PAL.thoughtInk`, neutral fill) with an arrow from a red `\text{fail}` tag on the Observation side, through Reflect, back into Thought, on "when a ReAct agent fails, it writes a reflection" (w8–17). On "tries again" (w22–23) a second lap of the ring runs, ending green. Tag the added station `\text{Reflexion's addition}` so it isn't read as part of ReAct.
6. s5 "Thought, action, observation, each one written down where you can read it." — the Reflect station fades; the three original slabs pulse in turn on "Thought" (w0), "action" (w1), "observation" (w2); on "written down where you can read it" (w5–11) the context stack from segment 3 (fanned-out column of Figure 1 (1d) cards) slides across once more.
7. s6–s8 end card — `endCard` with p. 1, starting on s6 so the title writes with the voice; highlight the title on the page in sync (`P1.titleLines`, use `endCardPose(p)`; the title is in small caps, so `findPhrase` can't match it). Lines:
   - `\text{ReAct: Synergizing Reasoning and Acting}` / `\text{in Language Models}` (two lines)
   - `\text{Yao, Zhao, Yu, Du, Shafran, Narasimhan, Cao}` on s7
   - `\text{ICLR 2023} \cdot \texttt{arXiv:2210.03629}`
   - `\texttt{arxiv.org/abs/2210.03629}`
   - small last line, required by CC BY: `\text{CC BY 4.0 (creativecommons.org/licenses/by/4.0)} \cdot \text{pages shown with highlights, crops and 3D adaptations}` (two lines if it doesn't fit at ≥ 30 px)
   Hold to the end of the audio.

## Guardrails

- What came after is Reflexion only, sourced to its v1 (arXiv:2303.11366, 20 Mar 2023; its Figure 1 caption: "We enable ReAct agents to use self-reflection to improve their own performance."). No Reflexion numbers (they changed across versions), no other systems, products or libraries, no adoption claims, no citation counts.
- Write "Shinn et al." on the card: the v1 author list differs from later versions; don't list names.
- Fine-tuning: no numbers beyond 3,000 / 8B / 62B (Figure 3 is a plot without printed values).
- The CC BY line on the end card is a licence condition, not decoration: keep it ≥ 30 px.
- Marker colours: the voice paraphrases every page line in this segment, so all page highlights are mint.
- TeX: no `§`, no `\boxed{}`; `\cdot` for separators.
