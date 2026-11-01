# Briefing — ReAct: Synergizing Reasoning and Acting in Language Models

Paperframe reference video. Format "paper": the real pages are the set. Style folio (`docs/style-folio.md`, kit `engine/folio.js`), light desk, TeX labels. English, Kokoro voice am_michael. Picked to cover the agents theme: the thought → action → observation loop is the visual spine.

Paper: Shunyu Yao, Jeffrey Zhao, Dian Yu, Nan Du, Izhak Shafran, Karthik Narasimhan, Yuan Cao. "ReAct: Synergizing Reasoning and Acting in Language Models". arXiv:2210.03629 — v1 submitted 6 Oct 2022, v2 27 Nov 2022, v3 (the one we show; side stamp on p. 1 reads "10 Mar 2023", arXiv comment "v3 is the ICLR camera ready version with some typos fixed") 10 Mar 2023. ICLR 2023 (p. 1 header "Published as a conference paper at ICLR 2023"). https://arxiv.org/abs/2210.03629 · project page https://react-lm.github.io/

Contribution in one sentence, in the paper's words (abstract, p. 1): "explore the use of LLMs to generate both reasoning traces and task-specific actions in an interleaved manner, allowing for greater synergy between the two".

Rights: the arXiv abs page links the licence as http://creativecommons.org/licenses/by/4.0/ (CC BY 4.0; checked 2026-10-31). Page 1 carries no other notice and no figure or table has a third-party credit line. So whole pages, figures, tables and the abstract can be shown publicly. CC BY conditions: credit (authors, title), a link to the source, a link to the licence, and an indication that changes were made (our highlights, crops, lifted strips and 3D rebuilds are adaptations). Put this on the end card and in the publish description: "Yao, Zhao, Yu, Du, Shafran, Narasimhan, Cao. ReAct: Synergizing Reasoning and Acting in Language Models. ICLR 2023. arXiv:2210.03629, CC BY 4.0, https://creativecommons.org/licenses/by/4.0/ — pages shown with highlights, crops and 3D adaptations." The figures' observation lines quote short strings from Wikipedia and the ALFWorld/WebShop environments as part of the paper; we show them only inside the paper's own figures. Citation on screen throughout (`cite()` stamp) and on the end card.

Source files: `paper/` (made by `engine/paper_prep.py`, all 33 pages): `source.pdf` (v3), `page-01..33.png` at 200 dpi (1700 × 2200 px, US letter), `words.json`, `text-NN.txt`. Pages used: 1–10, 14, 15, 18, 33.

Figure text gotcha: Figures 1, 4 and 5 are set in a font with shifted glyph codes. Their words are in `words.json` but garbled ("+RWVSRW4$" = "HotpotQA", each char − 29), so `findPhrase` can't match them. The line and step boxes were decoded once and are in `scenes/_data.js` (`FIG1_LINES`, `FIG1_STEPS`, `FIG5_LINES`, `FIG5_STEPS`), checked against the PNGs. Body text and tables are normal text: `findPhrase` works (all highlight phrases in the prompts were checked against `words.json`).

## Verified facts (checked against `paper/text-NN.txt` and the page PNGs)

| Claim | Where |
|---|---|
| v1 on arXiv 6 Oct 2022; v3 10 Mar 2023 ("ICLR camera ready version") | arXiv abs page |
| Licence CC BY 4.0 (licence link on the abs page) | https://arxiv.org/abs/2210.03629 |
| Seven authors; Yao and Narasimhan at Princeton (Department of Computer Science), the other five at Google Research, Brain team; Yao's footnote "Work during Google internship" | p. 1 |
| ICLR 2023: "In-Person Oral presentation / top 5% paper" | https://iclr.cc/virtual/2023/oral/12647 |
| Abstract: reasoning (e.g. chain-of-thought prompting) and acting (e.g. action plan generation) "have primarily been studied as separate topics" | p. 1 |
| Abstract: "generate both reasoning traces and task-specific actions in an interleaved manner" | p. 1 |
| Abstract: on HotpotQA and Fever, ReAct "overcomes prevalent issues of hallucination and error propagation in chain-of-thought reasoning by interacting with a simple Wikipedia API" | p. 1 |
| Abstract: on ALFWorld and WebShop, outperforms imitation and reinforcement learning methods "by an absolute success rate of 34% and 10% respectively", prompted with "only one or two in-context examples" | p. 1 |
| Figure 1 (1): HotpotQA question "Aside from the Apple Remote, what other device can control the program Apple Remote was originally designed to interact with?"; (1a) Standard answers iPod ✗; (1b) CoT reasons from "Apple Remote was originally designed to interact with Apple TV" (red), answers "iPhone, iPad, iPod Touch" ✗; (1c) Act-only searches Apple Remote, Front Row, Front Row (software), then Finish[yes] ✗; (1d) ReAct: 4 thoughts, 4 acts, 3 observations, Finish[keyboard function keys] ✓ | Figure 1, p. 2 |
| Figure 1 (2): ALFWorld, "Your task is to: Put some pepper shaker on a drawer."; (2a) Act-only: drawer 1, sinkbasin 1, "Take peppershaker 1 from sinkbasin 1" twice → "Nothing happens." ✗; (2b) ReAct: Think[First I need to find a pepper shaker...more likely to appear in cabinets (1-6), countertops (1-3), ...], finds it on countertop 3, Think[Now I find a pepper shaker 1. Next, I need to put it in/on drawer 1.], puts it ✓ | Figure 1, p. 2 |
| Chain-of-thought "is a static black box", "not grounded in the external world"; can lead to "fact hallucination and error propagation" | §1, p. 2 |
| Act-only (1c) "is unable to generate the correct final action (Act 4)"; (2a) "fails to comprehend from the context that sinkbasin 1 does not contain peppershaker 1, thus keep producing hallucinating actions" | §2, p. 3 |
| Context c_t = (o_1, a_1, …, o_{t−1}, a_{t−1}, o_t) | §2, p. 3 |
| "The idea of ReAct is simple: we augment the agent's action space to Â = A ∪ L, where L is the space of language." A thought "does not affect the external environment, thus leading to no observation feedback"; it updates the context c_{t+1} = (c_t, â_t) | §2, p. 3 |
| Frozen PaLM-540B, prompted with few-shot in-context examples; footnote 1: GPT-3 results in Appendix A.1 "which outperforms PaLM-540B" | §2, p. 3 |
| Reasoning tasks: thoughts and actions alternate ("thought-action-observation steps"); decision-making tasks: thoughts "appear sparsely", the model decides "the asynchronous occurrence of thoughts and actions for itself" | §2, pp. 3–4 |
| Humans "can also control or correct the agent behavior on the go by thought editing" | §2 D), p. 4 |
| HotpotQA: multi-hop QA "over two or more Wikipedia passages"; FEVER: claims labelled SUPPORTS / REFUTES / NOT ENOUGH INFO; question-only setup, no support paragraphs given | §3.1, p. 4 |
| Wikipedia API: search[entity] → first 5 sentences of the page, or top-5 similar entities; lookup[string] → next sentence containing string, "simulating Ctrl+F"; finish[answer]. "significantly weaker than state-of-the-art lexical or neural retrievers"; purpose: "force models to retrieve via explicit reasoning in language" | §3.1, p. 4 |
| HotpotQA and Fever prompts: 6 and 3 hand-composed trajectories from the training set; footnote 2: "We find more examples do not improve performance." | §3.2, p. 4 |
| Example lookup in the HotpotQA prompt: "The paragraph does not tell who Milhouse is named after, maybe I can look up "named after"." → Lookup[named after] | Appendix C.1, p. 18 |
| Baselines: Standard (no thoughts/actions/observations), CoT (no actions/observations), CoT-SC (21 CoT samples, temperature 0.7, majority answer), Act (no thoughts) | §3.2, p. 5 |
| Combination heuristics: ReAct → CoT-SC when ReAct gives no answer within 7 (HotpotQA) / 5 (FEVER) steps; CoT-SC → ReAct when the majority answer occurs fewer than n/2 times | §3.2, p. 5 |
| Table 1 (PaLM-540B prompting; HotpotQA EM / Fever Acc): Standard 28.7 / 57.1; CoT 29.4 / 56.3; CoT-SC 33.4 / 60.4; Act 25.7 / 58.9; ReAct 27.4 / 60.9; CoT-SC → ReAct 34.2 / 64.6; ReAct → CoT-SC 35.1 / 62.0; Supervised SoTA 67.5 / 89.5 | Table 1, p. 5 |
| "ReAct outperforms CoT on Fever (60.9 vs. 56.3) and slightly lags behind CoT on HotpotQA (27.4 vs. 29.4)" | §3.3, p. 6 |
| Table 2 study: 50 correct + 50 incorrect trajectories each from ReAct and CoT, 200 total, labelled by hand | §3.3, p. 6 |
| Table 2 (ReAct / CoT): success — true positive 94% / 86%, false positive (hallucinated) 6% / 14%; failure — reasoning error 47% / 16%, search result error 23% / –, hallucination 0% / 56%, label ambiguity 29% / 28% | Table 2, p. 6 |
| ReAct-specific error: "the model repetitively generates the previous thoughts and actions", counted under reasoning error, fails to "jump out of the loop"; footnote 4: the authors "suspect" greedy decoding, beam search "might help" | §3.3 B), p. 6 |
| "Non-informative search, which counts for 23% of the error cases, derails the model reasoning" | §3.3 C), p. 6 |
| Best prompting: ReAct → CoT-SC on HotpotQA, CoT-SC → ReAct on Fever; they reach CoT-SC's 21-sample performance "using merely 3-5 samples" | §3.3, p. 6 (Figure 2, p. 5) |
| Fine-tuning on 3,000 ReAct trajectories with correct answers: "PaLM-8B finetuned ReAct outperforming all PaLM-62B prompting methods, and PaLM-62B finetuned ReAct outperforming all 540B prompting methods"; prompted ReAct is worst of the four at 8B/62B | §3.2 p. 5, §3.3 p. 6, Figure 3 p. 7 |
| ALFWorld: "synthetic text-based game", 6 task types, a task can have 50+ locations and take an expert 50+ steps; 134 unseen evaluation games; 6 prompts per task type (permutations of 2 of 3 annotated trajectories) | §4, p. 7 |
| BUTLER: imitation learning agent "trained on 10^5 expert trajectories for each task type" | §4, p. 7 |
| WebShop: 1.18M real-world products, 12k human instructions; evaluated on 500 test instructions; IL trained with 1,012 human trajectories, IL+RL additionally with 10,587 instructions | §4, pp. 7–8 |
| Table 3 (ALFWorld success %, All column): Act best of 6 = 45; ReAct avg = 57; ReAct best of 6 = 71; ReAct-IM avg 48, best 53; BUTLER_g best of 8 = 22; BUTLER best of 8 = 37. All greedy except BUTLER (beam search) | Table 3, p. 8 |
| Table 4 (WebShop Score / SR): Act 62.3 / 30.1; ReAct 66.6 / 40.0; IL 59.9 / 29.1; IL+RL 62.4 / 28.7; Human Expert 82.1 / 59.6 | Table 4, p. 8 |
| "the best ReAct trial achieves an average success rate of 71%, significantly outperforming the best Act (45%) and BUTLER (37%) trials"; ReAct over Act: relative gain 33% to 90%, average 62%, across six controlled trials | §4, p. 8 |
| Appendix A.3 / Figure 5: ReAct fails due to a hallucinating thought (Act 17); "By a human simply editing two thoughts (Act 17, 23)" it succeeds | p. 14, Figure 5 p. 15 |
| Appendix E.1 examples: CoT hallucination "1916 (Label: 1909)"; ReAct search error "Could not find goddess frigg." | p. 33 |
| Limits: "complex tasks with large action spaces require more demonstrations to learn well, which unfortunately can easily go beyond the input length limit of in-context learning" | §6, p. 9 |
| Ethics: risks of "looking up inappropriate or private information, or taking harmful actions"; "models cannot really buy products on WebShop the research benchmark, or edit Wikipedia" | Ethics statement, p. 10 |
| After: Reflexion, arXiv:2303.11366 v1 (20 Mar 2023, then titled "Reflexion: an autonomous agent with dynamic memory and self-reflection"), Figure 1 caption: "We enable ReAct agents to use self-reflection to improve their own performance." Its architecture section: "Reflexion leverages ReAct (Yao et al., 2023)" | https://arxiv.org/abs/2303.11366v1 |

## Guardrails

- ReAct alone does NOT beat chain-of-thought on HotpotQA (27.4 vs 29.4). Say so; the paper does ("slightly lags behind"). The headline HotpotQA/FEVER wins are the combinations with CoT-SC (35.1, 64.6), and every prompting result is far below Supervised SoTA (67.5, 89.5).
- The abstract's "34%" is best-vs-best: ReAct's best of 6 prompts (71) minus BUTLER's best of 8 (37), and BUTLER used beam search. ReAct's average over its 6 prompts is 57. Show both whenever 71 or 34 is on screen. ReAct doesn't win every task type (BUTLER 100 on Cool vs 86; Pick 2 ties Act at 41): don't say "every task".
- WebShop "10%": the abstract's rounding. Table 4 gives 40.0 vs IL 29.1 (IL+RL 28.7, Act 30.1). Show the table's numbers; don't compute "eleven points" on screen.
- Table 2 percentages are within each group of 50 hand-labelled runs per method (failure column for ReAct sums to 99, rounding). "Zero hallucination" is among ReAct's sampled failures only; 6% of its sampled successes rested on hallucinated reasoning. Never say ReAct doesn't hallucinate.
- The looping explanation is the authors' suspicion (greedy decoding, footnote 4), not a finding.
- "First" claims: §4 p. 8 says "To our knowledge, ReAct is the first demonstration of combined reasoning and action using an LLM applied to an interactive environment within a closed-loop system"; §5 p. 9 says Inner Monologue "is the first work that demonstrates such a closed-loop system, which ReAct builds on". The two sit uneasily together: don't say "first" in any form.
- Appendix A.1 Table 5 lists PaLM-540B ReAct at 29.4 on HotpotQA, on a different 500-question subset; Table 1 says 27.4. Use Table 1 only; don't show Table 5.
- Figure 1's panel label reads "Hotspot QA" (the paper's typo); on-screen labels say HotpotQA. Benchmark names on screen: HotpotQA, FEVER, ALFWorld, WebShop (the paper mixes "Fever", "HotPotQA", "AlfWorld").
- Figure 1 (2b) elides steps 3–5 with a note ("Here the agent go to cabinet 1, then cabinet 2, 3, then countertop 1 and 2") whose count doesn't fit the act numbers. Show the visit order, never act numbers for the elided part.
- "Six hand-written examples" is HotpotQA (Fever used three). The narration says six while the HotpotQA prompt is on screen; the p. 4 highlight shows "6 and 3 cases".
- What came after: only Reflexion, as sourced above. No adoption claims ("most agents use ReAct", library names, product names), no citation counts. Reflexion's own numbers changed across versions: don't show any.
- No Apple logos or product imagery; the Apple question is text from the figure only.
- Illustrative on screen and labelled so: the ALFWorld room layout (`ROOM` in `_data.js`), the loop ring, any toy Wikipedia page drawn on a blank sheet, the loop-repeat animation in the failures segment. Everything quoted comes from the page itself (highlight or lifted crop), never retyped.

## Segments (actual audio 6:03, summed WAV lengths; target was 4:30–6:00)

| # | Segment | Audio | Pages on the desk | Centrepiece |
|---|---|---|---|---|
| 1 | cover — the page, the line, the promise | 0:43 | p. 1 | the abstract line highlighted with the voice; three small slabs (Thought · Action · Observation) teased |
| 2 | problem — reasoning without facts, acting without reasoning | 0:42 | p. 2 | Figure 1 (1a–1c) lifted off as cards, the paper's own ✗ marks, the red hallucinated line |
| 3 | loop — the idea and the trace (machine) | 0:54 | p. 3, p. 2 | the 3D loop stands up (Thought / Action / Observation + Wikipedia slab + context stack); Figure 1 (1d) replayed step by step around it |
| 4 | tools — the Wikipedia API | 0:36 | p. 4, p. 18 | three action slabs search / lookup / finish on the Wikipedia slab; the Milhouse lookup lifted off p. 18 |
| 5 | household — ALFWorld | 0:37 | p. 2 (Figure 1 bottom), p. 7 | a small 3D room (illustrative layout): Act-only stuck at the sink basin, ReAct's two thoughts and its path to countertop 3 |
| 6 | failures — Table 2 and thought editing | 0:45 | p. 6, p. 33, p. 15 | Table 2 as paired 3D bars; the loop ring jamming on a repeated card; Figure 5's two edited thoughts flip ✗ to ✓ |
| 7 | evidence — Tables 1, 3, 4 | 1:01 | p. 5, p. 8 | bars from 0 for each table, the Supervised SoTA "ceiling", best-vs-avg shown side by side |
| 8 | after — limits, fine-tuning, ethics, Reflexion, end card | 0:45 | p. 9, p. 6, p. 10, external card, p. 1 | the ring gains a fourth "reflect" station (Reflexion's, labelled); end card with CC BY credit |
