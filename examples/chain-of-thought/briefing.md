# Briefing — Chain-of-Thought Prompting Elicits Reasoning in Large Language Models

Paperframe video, full mode. Format "paper": the real pages are the set. Style folio (`docs/style-folio.md`, kit `engine/folio.js`), light desk, TeX labels. English, Kokoro voice am_michael. The spine is the prompt itself: one worked example with its reasoning written out, the same model, a different answer. The 3D beats are the prompt standing up as stacked triples (segment 3) and Figure 4 growing into a terrace of bars by model size (segment 5).

Paper: Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed H. Chi, Quoc V. Le, Denny Zhou (nine authors; p. 1 gives one affiliation for all, "Google Research, Brain Team"). "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models". arXiv:2201.11903 — v1 28 Jan 2022, v2 6 Apr 2022, v3 1 Jun 2022, v4 13 Jun 2022, v5 10 Oct 2022, v6 10 Jan 2023 (the one we show; side stamp on p. 1 reads "arXiv:2201.11903v6 [cs.CL] 10 Jan 2023"; Appendix E, p. 30: "V5 → V6. Fixed minor typo in Figure 3."). NeurIPS 2022 (p. 1 footer "36th Conference on Neural Information Processing Systems (NeurIPS 2022)."; proceedings page https://proceedings.neurips.cc/paper/2022/hash/9d5609613524ecf4f15af0f7b31abca4-Abstract-Conference.html). https://arxiv.org/abs/2201.11903v6 · PDF https://arxiv.org/pdf/2201.11903v6

Contribution in one sentence, in the paper's words (abstract, p. 1): "generating a chain of thought—a series of intermediate reasoning steps—significantly improves the ability of large language models to perform complex reasoning". This is the cover's verbatim line, highlighted with the voice.

## Rights

- **Licence.** The arXiv abstract page for v6 (https://arxiv.org/abs/2201.11903v6) links the licence as http://creativecommons.org/licenses/by/4.0/ ("view license", link title "Rights to this article"): CC BY 4.0. Checked 2026-11-01 by fetching the page and reading the licence anchor in its HTML. The PDF's p. 1 carries no other notice. The NeurIPS proceedings page (above) shows no licence; we show the arXiv v6 copy, so the arXiv licence governs.
- **What can be shown publicly.** Whole pages, figures, tables and the abstract. No figure or table carries a "reprinted with permission" line, there are no photographs and no logos.
- **Third-party material inside the paper.** Figure 3 and Table 20 contain short benchmark items (GSM8K, CSQA, StrategyQA, BIG-bench Date and Sports, SayCan, plus the authors' synthetic tasks). Appendix E.3 (pp. 30–31) lists their licences (MIT, Apache 2.0, CC BY 4.0, some unstated). We show them only as the paper's own figure panels and table rows (whole-panel crops may lift), with the stamp on, never retyped as standalone quotes. Two Figure 3 items name real people (a footballer in the Sports Understanding panel, a singer in the Last Letter Concatenation panel): they stay inside the crops, unnarrated. Figures 2, 4 and 7 plot prior-best numbers taken from other papers (Cobbe et al. 2021 and others); that is data cited in the paper, shown with the stamp.
- **Outside material.** Kojima et al., arXiv:2205.11916, is under arXiv's non-exclusive distribution licence (its abs page links http://arxiv.org/licenses/nonexclusive-distrib/1.0/, checked 2026-11-01): none of its pages appear; segment 8 uses a typed card with the five-word prompt it is known for and the citation. Self-consistency (Wang et al., arXiv:2203.11171) is CC BY 4.0 on its abs page, but it isn't prepped: it appears only through the reference on p. 13 of this paper and a typed card.
- **Credit line** (end card and publish description): "Wei, Wang, Schuurmans, Bosma, Ichter, Xia, Chi, Le, Zhou. Chain-of-Thought Prompting Elicits Reasoning in Large Language Models. NeurIPS 2022. arXiv:2201.11903 (v6). CC BY 4.0, https://creativecommons.org/licenses/by/4.0/ — pages shown with highlights, crops and 3D adaptations." Stamp (`cite()`) on screen whenever paper content is.
- **`PAGES = true`.** Every scene keeps the switch at its top: `// Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages and redrawn figures.`

## Source files

`paper/` was prepared by `bin/paperframe new` from https://arxiv.org/abs/2201.11903v6: `source.pdf` (v6), all 43 pages as `page-01..43.png` at 200 dpi (1700 × 2200 px, US letter, checked), `words.json`, `text-NN.txt`.

Pages used: 1, 2, 4, 5, 6, 7, 8, 9 (main text), 13 (the self-consistency reference), 20, 21, 22, 23 (Tables 1, 2, 4, 5, 6), 35 (Table 20, the eight math exemplars). Pages 1, 2 and 4–8 were read at full size; 9, 13, 20–23 and 35 (and 3) on a contact sheet; every box in `scenes/_data.js` was measured on the full-resolution PNGs (and drawn back onto pp. 1 and 4 to check).

Quirks, all handled in `scenes/_data.js` (`PH` holds every phrase string, checked against `words.json` with a findPhrase clone):

- Figures 1, 3, 4, 7, 8 and Table 20 are real text, not vector paths or shifted fonts: `findPhrase` works on their lines and labels. Figure boxes are still given as constants, measured from the PNGs (±3 px).
- p. 2 prints ⟨input, chain of thought, output⟩; the angle brackets come through as letters, so the words are "hinput," and "outputi.". Pass `PH.triples` as is.
- Em dashes glue words ("thought—a", "steps—significantly"); line-break hyphens split them ("chain-" + "of-thought", "outper-" + "form"). The `PH` strings already follow this.
- p. 5: the left column sits beside Figure 4's caption and `words.json` interleaves the two line by line. A phrase that crosses a line break there doesn't match; `PH.errors46` and `PH.wrong50` are split per line.
- Tables: never `findPhrase` a number. Mark cells with the row y and column x in `T1`, `T2`, `T4`, `T5`, `T6` (all values checked against the words in their cells).
- Figure 1, Figure 3 and Table 20 already carry the paper's own highlights (Figure 1: blue on the exemplar's chain, green on the generated chain; Figure 3: green / orange / blue by task family; Table 20: lavender). Our multiply highlighter over them changes their colour (yellow over blue reads green), so on those lines we follow the voice with an ink underline or a box, never a marker.
- The side stamp on p. 1 is vertical text: box it with `P1.stamp`, don't sweep a highlighter over it.
- Small-caps headings (Table 20's "PROMPT FOR MATH WORD PROBLEMS", Appendix tables' "QUESTION") are split into letter groups in `words.json`; use boxes.

## Verified facts (checked against `paper/text-NN.txt` and the page PNGs)

| Claim | Where |
|---|---|
| v1 28 Jan 2022; v6 10 Jan 2023; versions v2–v5 dates | arXiv abs page, https://arxiv.org/abs/2201.11903v6 (submission history) |
| Licence CC BY 4.0 | https://arxiv.org/abs/2201.11903v6 (licence link) |
| v2 added PaLM results; v5 added Codex and UL2; v6 fixed a typo in Figure 3 | Appendix E "Version Control", p. 30 |
| Nine authors; affiliation line "Google Research, Brain Team" | p. 1 |
| NeurIPS 2022 | p. 1 footer; https://proceedings.neurips.cc/paper/2022/hash/9d5609613524ecf4f15af0f7b31abca4-Abstract-Conference.html |
| Abstract: "generating a chain of thought—a series of intermediate reasoning steps—significantly improves the ability of large language models to perform complex reasoning" | p. 1 |
| Abstract: chain-of-thought prompting is "a simple method … where a few chain of thought demonstrations are provided as exemplars in prompting" | p. 1 |
| No training: "No language models were finetuned in the process of writing this paper."; reasoning "elicited simply by prompting an off-the-shelf language model" | Section 6, p. 9; also E.2, p. 30 |
| Abstract: "prompting a PaLM 540B with just eight chain-of-thought exemplars achieves state-of-the-art accuracy on the GSM8K benchmark of math word problems, surpassing even finetuned GPT-3 with a verifier" | p. 1 |
| "scaling up model size alone has not proved sufficient for achieving high performance on challenging tasks such as arithmetic, commonsense, and symbolic reasoning" | Section 1, p. 2 |
| Two ideas: natural-language rationales (models trained from scratch, Ling et al. 2017, or finetuned, Cobbe et al. 2021) and few-shot prompting (Brown et al. 2020) | Section 1, p. 2 |
| Rationales: "it is costly to create a large set of high quality rationales" | p. 2 |
| Few-shot prompting "works poorly on tasks that require reasoning abilities, and often does not improve substantially with increasing language model scale" | p. 2 |
| "we combine the strengths of these two ideas in a way that avoids their limitations"; prompt of triples ⟨input, chain of thought, output⟩ | p. 2 |
| "A chain of thought is a series of intermediate natural language reasoning steps that lead to the final output" | p. 2 |
| Figure 1 left: exemplar "Q: Roger has 5 tennis balls … A: The answer is 11.", new question about 23 apples, output "A: The answer is 27." with ✗ | Figure 1, p. 1 |
| Figure 1 right: exemplar chain "Roger started with 5 balls. 2 cans of 3 tennis balls each is 6 tennis balls. 5 + 6 = 11."; output "The cafeteria had 23 apples originally. They used 20 to make lunch. So they had 23 - 20 = 3. They bought 6 more apples, so they have 3 + 6 = 9. The answer is 9." with ✓ | Figure 1, p. 1 |
| Eight exemplars "manually composed"; the same eight for every math benchmark except AQuA (multiple choice; four exemplars from its training set) | Section 3.1, pp. 3–4; Table 20 p. 35, Table 21 |
| The eight math exemplars (trees, cars, chocolates, lollipops, toys, computers, golf balls, bagels) | Table 20, p. 35 |
| Figure 3: ⟨input, chain of thought, output⟩ triples for arithmetic, commonsense and symbolic benchmarks, incl. "Would a pear sink in water?" → float → "no", and the Maybelle/Shalonda coin → 1 flip, odd → tails up → "no" | Figure 3, p. 4 |
| Five arithmetic benchmarks (GSM8K, SVAMP, ASDiv, AQuA, MAWPS) | Section 3.1, p. 3 |
| Five commonsense benchmarks (CSQA, StrategyQA, Date, Sports, SayCan) | Section 4, p. 7 |
| Two symbolic toy tasks (last letter concatenation, coin flip) | Section 5, p. 8 |
| Five models: GPT-3 (350M, 1.3B, 6.7B, 175B; "presumably correspond" to InstructGPT sizes), LaMDA (422M, 2B, 8B, 68B, 137B), PaLM (8B, 62B, 540B), UL2 20B, Codex | Section 3.1, p. 4 |
| Greedy decoding | p. 4 |
| Figure 4: solve rate vs model scale for LaMDA, GPT and PaLM on GSM8K, SVAMP, MAWPS | Figure 4, p. 5 |
| CoT "does not positively impact performance for small models, and only yields performance gains when used with models of ∼100B parameters"; smaller models "produced fluent but illogical chains of thought, leading to lower performance than standard prompting" | Section 3.2, p. 4 |
| CoT "actually hurts performance for most models smaller than 10B parameters" | Appendix A.1, p. 16 |
| "chain-of-thought prompting is an emergent ability of model scale" | Section 3.2, p. 4 |
| PaLM GSM8K (standard / CoT): 8B 4.9 / 4.1; 62B 9.6 / 29.9; 540B 17.9 / 56.9 | Table 2, p. 21 (540B also Table 1, p. 20) |
| LaMDA GSM8K: 420M 2.6/0.4, 2B 3.6/1.9, 8B 3.2/1.6, 68B 5.7/8.2, 137B 6.5/14.3; GPT GSM8K: 350M 2.2/0.5, 1.3B 2.4/0.5, 6.7B 4.0/2.4, 175B 15.6/46.9 | Table 2, p. 21 |
| Prior best GSM8K 55, "N/A (finetuning)", from Cobbe et al. (2021); Figure 2 prints 33 (finetuned GPT-3 175B), 55 (prior best), 18 and 57 (PaLM 540B standard, CoT) | Table 1, p. 20; Figure 2, p. 2 |
| GSM8K performance "more than doubled for the largest GPT and PaLM models" | Section 3.2, p. 5 |
| Ablations (Figure 5, LaMDA 137B and PaLM 540B on GSM8K): equation only "does not help much for GSM8K", the questions "too challenging to directly translate into an equation without the natural language reasoning steps"; variable compute only (dots, "equal to the number of characters in the equation") and chain of thought after answer each perform "about the same as the baseline" | Section 3.3, pp. 5–6 |
| The authors' reading: "there appears to be utility from expressing intermediate steps via natural language"; the sequential reasoning "is useful for reasons beyond just activating knowledge" | p. 6 |
| LaMDA 137B GSM8K: standard 6.5, CoT 14.3, equation only 5.4, variable compute only 6.4, reasoning after answer 6.1; annotator B 15.5, C 17.6, concise 11.1, GSM8K exemplars α 12.6, β 12.7, γ 12.6 | Table 6, p. 23 |
| Robustness: Annotators B and C, two other co-authors, wrote their own chains; three sets of eight exemplars sampled from the GSM8K training set; "all sets of chain of thought prompts outperform the standard baseline by a large margin" | Section 3.4, pp. 6–7; Figure 6 (LaMDA 137B) |
| Commonsense: PaLM 540B "outperforming an unaided sports enthusiast on sports understanding (95.4% vs 84%)"; "gain was minimal on CSQA" | Section 4, p. 7 |
| PaLM 540B (standard / CoT): Sports 80.5 / 95.4; CSQA 78.1 / 79.9 | Table 4, p. 22 |
| Symbolic: last letter concatenation ("Amy Brown" → "yn"); coin flip; exemplars use two-word names, tests use 3 and 4 words; "We do the same for the number of potential flips in the coin flip task" | Section 5, p. 8 |
| OOD: "standard prompting fails for both tasks" | p. 8 |
| PaLM 540B, 4 (OOD), standard / CoT: last letter 0.0 / 63.0; coin flip 54.8 / 90.2 | Table 5, p. 22 |
| Limits: CoT "emulates the thought processes of human reasoners", but "this does not answer whether the neural network is actually “reasoning,” which we leave as an open question"; "no guarantee of correct reasoning paths"; emergence only at large scale "makes it costly to serve" | Section 6, p. 9 |
| 50 wrong LaMDA 137B GSM8K answers read by hand: 46% of the chains "almost correct, barring minor mistakes"; 54% "major errors in semantic understanding or coherence" | Section 3.2, p. 5; Appendix D.2, pp. 27–28 (8% + 16% + 22% = 46%) |
| "standard prompting only provides a lower bound on the capabilities of large language models" | Section 6, p. 9 |
| "follow-up work shows chain-of-thought prompting can be improved by taking the majority final answer over many sampled generations (Wang et al., 2022a)" | p. 4 |
| Wang et al. 2022a = "Self-consistency improves chain of thought reasoning in language models. arXiv:2203.11171" | References, p. 13; https://arxiv.org/abs/2203.11171 (v1 21 Mar 2022, "Published at ICLR 2023") |
| Kojima, Gu, Reid, Matsuo, Iwasawa, "Large Language Models are Zero-Shot Reasoners", v1 24 May 2022: "LLMs are decent zero-shot reasoners by simply adding "Let's think step by step" before each answer"; "Accepted to NeurIPS2022" | https://arxiv.org/abs/2205.11916 |

## Guardrails

- **Three or five models.** The abstract (p. 1) says "Experiments on three large language models"; Section 3.1 (p. 4) says five (UL2 and Codex were added in v5, p. 30). The narration says five with p. 4 on screen. Never highlight the abstract's "three" while the voice says five; don't comment on the mismatch.
- **StrategyQA.** p. 7 text says PaLM 540B reached 75.6% vs a prior best of 69.4%; Table 4 (p. 22) prints 77.8 for PaLM 540B with CoT. Don't put StrategyQA numbers on screen.
- **Correct-by-chance count.** p. 5 says all chains behind correct answers were sound "except two that coincidentally arrived at the correct answer"; Appendix D.1 (p. 25) says "only one". Don't use this analysis.
- **Calculator.** D.2 (p. 27) says the LaMDA 137B GSM8K solve rate went from 14.3% to 17.3% with a calculator "as shown in Table 2"; Table 1 (p. 20) prints 17.8. Keep "+ ext. calc" rows off screen.
- **Smaller mismatches, not used.** Table 6 prints LaMDA 137B SVAMP CoT 36.7, Table 2 prints 37.5; A.2 (p. 18) says coin-flip standard prompting "= 50.0%", Table 7 prints 49.0.
- **Roger is not one of the eight.** p. 3 says "Figure 1 (right) shows one chain of thought exemplar, and the full set of exemplars is given in Appendix Table 20", but Table 20 (p. 35) holds eight other problems. Figure 1 shows the format; never say Roger is in the prompt the authors used. When the eight appear, they are Table 20's crops.
- **Rounded figure labels.** Figure 2 prints 18 and 57; Tables 1 and 2 print 17.9 and 56.9. The voice and our bars use the table values; the figure keeps its own labels when it is on screen.
- **Prior best.** 55 comes from finetuning (Table 1: "N/A (finetuning) 55a", a = Cobbe et al. 2021). On screen: `prior best (finetuned) 55` with the source. The abstract says CoT surpasses "finetuned GPT-3 with a verifier"; don't put a system name on the 55 beyond that page line.
- **Emergence is the authors' framing.** "∼100B" is approximate: never "at exactly one hundred billion". Don't explain why it emerges: A.1 (p. 16) calls its analysis "preliminary" and notes that "model scale is often conflated with other factors, such as amount of training compute".
- **Ablation conclusions are hedged** ("suggests", "appears"): the narration frames them as "the authors' reading". Figure 5's PaLM bars have no printed values; every ablation number on screen comes from Table 6 (LaMDA 137B), labelled so. Equation only does help on easier datasets (Table 6: SVAMP 35.1 vs 29.5): never say it never helps; the claim is GSM8K.
- **Robustness is LaMDA 137B** (Figure 6, Table 6). Don't widen it to "any prompt works": A.2 (p. 18) says "prompt engineering still does matter" (coin flip 99.6% for Annotator A vs 71.4% for C).
- **Sports comparison.** The paper's words are "an unaided sports enthusiast" (84%); Figure 7's legend says "Human". Say and label "unaided sports enthusiast", not "humans".
- **Symbolic in domain.** Standard prompting already solves in-domain coin flip with PaLM 540B (98.1): don't show the in-domain coin flip as a chain-of-thought win. The OOD numbers are the point. The paper calls these "toy tasks"; keep that word.
- **Self-reported.** Every result is the authors' own measurement: "the authors report" on any tag that needs a verb.
- **No "first", no adoption.** The paper cites prior work on intermediate steps (Ling et al. 2017; Cobbe et al. 2021; Nye et al. 2021, Section 7). Don't call chain of thought "the first", "invented" or "discovered". No citation counts, no later model names, no "every model now reasons".
- **"Reasoning".** The authors leave open whether the network is actually reasoning (p. 9). Never say the model "thinks like a human".
- **What came after: only two items, both sourced.** Self-consistency (cited on p. 4, reference p. 13, arXiv 2203.11171) and zero-shot CoT (Kojima et al., arXiv 2205.11916, May 2022). No numbers from either (both changed across versions). Self-consistency shares six authors with this paper (Wang, Wei, Schuurmans, Le, Chi, Zhou, per the p. 13 reference); don't call it "the same team".
- **Names as printed:** GSM8K, SVAMP, ASDiv, AQuA, MAWPS, CSQA, StrategyQA, SayCan, PaLM 540B, LaMDA 137B, GPT-3, UL2 20B, Codex; "chain of thought" (noun), "chain-of-thought prompting". Don't repeat the paper's typos on screen: "commmonsense" (p. 26), "hip-hope" (p. 28), "PaLM 540" without the B (p. 8), "for these three tasks" when there are two (p. 8).
- **Illustrative, and labelled so on screen:** the prompt-stack layout and the model block (segment 3), the two-ideas sketch (segment 2), the terrace geometry (heights are real), the four-word name slots (segment 7), the self-consistency fan of chains and its vote (segment 8). Everything quoted is the page itself, highlighted or lifted, never retyped. The only typed quotation is Kojima's five-word prompt, on an external card with its citation.
- **Sensitive content:** none harmful. Real names inside Figure 3 benchmark items stay in the crops, unnarrated.
- **TeX:** escape `%` as `\%`; no `§` (write "Section 3.2"); no `\boxed{}`.

## Segments (actual audio 6:08 summed WAV lengths; 6:13 rendered, with the 0.6 s scene tail per segment; target 5:00–6:15)

| # | Segment | Audio | Pages on the desk | Centrepiece |
|---|---|---|---|---|
| 1 | cover — the page, the line, the promise | 0:49 | p. 1 | the abstract line highlighted with the voice and lifted as a strip; Figure 1's two outputs teased side by side (27 ✗, 9 ✓) — this is where the colours are taught |
| 2 | problem — scale isn't enough; the two ideas and their limits | 0:45 | p. 2, p. 1 | a two-ideas sketch on a blank sheet (rationales: costly / prompting: weak on reasoning); Figure 1's standard column lifted, "27" struck red |
| 3 | idea — the triple, Figure 1 right (3D) | 0:45 | p. 2, p. 1 | the prompt stands up: a triple of input / chain / output slabs carrying Figure 1's real crops; the cafeteria question goes through the model block and a triple with a blue chain slab comes out, ✓; standard and chain prompts feeding the same model block |
| 4 | tasks — eight exemplars, nine kinds of question, five models | 0:40 | p. 35, p. 4 | Table 20's eight real exemplars as a row of standing triples; Figure 3's nine panels lift into a standing 3×3 wall, the pear and coin panels come forward; five models with their size ladders |
| 5 | scale — the machine: emergence (3D) | 0:49 | p. 4, p. 5, p. 21, p. 20 strip | Figure 4 grows into a 3D terrace of Table 2's GSM8K bars (three families × sizes), the ~100B threshold, PaLM's three pairs lit with the voice, an orange "prior best" plate at 55 |
| 6 | ablation — three stand-ins, then robustness | 0:47 | p. 5, p. 6, p. 23 | four prompt variants as four cards, each with its Table 6 bar (5.4, 6.4, 6.1 against 6.5 and 14.3); then six more chain bars from other writers, all above 6.5 |
| 7 | evidence — commonsense and symbolic | 0:41 | p. 7, p. 8, p. 22 | Figure 7's Sports panel lifted, bars 80.5 → 95.4 against a glass plate at 84; CSQA's flat pair; a two-word → four-word stretch and Table 5's OOD bars (0.0 → 63.0, 54.8 → 90.2) |
| 8 | after — limits, lower bound, what followed, end card | 0:52 | p. 9, p. 5, p. 4, p. 13, external card, p. 1 | limits as margin marks on p. 9, the lower-bound line in yellow; self-consistency as a fan of chains with a majority vote (illustrative); Kojima card; end card with CC BY credit |

Author pairs (four scene authors, two segments each, grouped by shared pages and data):

| Prompt file | Segments | Shared |
|---|---|---|
| `prompts/01-cover_02-problem.md` | cover, problem | p. 1 and Figure 1 (`FIG1`), p. 2; teaches `PAL` |
| `prompts/03-idea_04-tasks.md` | idea, tasks | Figure 1 right, p. 2, Table 20 (`T20`, `STACK`), Figure 3 (`FIG3`) |
| `prompts/05-scale_06-ablation.md` | scale, ablation | pp. 4–6, Tables 1, 2, 6 (`SCALE`, `T1`, `T2`, `T6`, `FIG4`, `FIG5`, `FIG6`); the 3D bar language |
| `prompts/07-evidence_08-after.md` | evidence, after | pp. 7–9, p. 13, p. 22 (`FIG7`, `FIG8`, `T4`, `T5`, `P9`, `P13`), end card on p. 1 |
