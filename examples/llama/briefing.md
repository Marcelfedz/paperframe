# Briefing — LLaMA: Open and Efficient Foundation Language Models

Paperframe video, full mode, 8 segments. Format "paper": the real pages are the set. Style folio (`docs/style-folio.md`, kit `engine/folio.js`), light desk, TeX labels. English, Kokoro voice am_michael. The visual spine is the four model sizes in the paper's own Figure 1 colours (7B blue, 13B orange, 33B green, 65B red), carried from the cover through the data, the architecture, the comparisons and the carbon bill.

Paper: Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timothee Lacroix, Baptiste Rozière, Naman Goyal, Eric Hambro, Faisal Azhar, Aurelien Rodriguez, Armand Joulin, Edouard Grave, Guillaume Lample (14 authors; equal-contribution marks on Touvron, Lavril, Izacard, Grave, Lample). Affiliation on the page: "Meta AI". "LLaMA: Open and Efficient Foundation Language Models". arXiv:2302.13971, v1 submitted 27 Feb 2023 (the only version; side stamp on p. 1 reads "arXiv:2302.13971v1 [cs.CL] 27 Feb 2023"). No journal or conference venue on the page or the abs page: an arXiv preprint. https://arxiv.org/abs/2302.13971v1 · DOI https://doi.org/10.48550/arXiv.2302.13971

Contribution in one sentence, in the paper's words (abstract, p. 1): "We introduce LLaMA, a collection of foundation language models ranging from 7B to 65B parameters. We train our models on trillions of tokens, and show that it is possible to train state-of-the-art models using publicly available datasets exclusively, without resorting to proprietary and inaccessible datasets."

The line the cover highlights (yellow, read verbatim, p. 1 abstract, 4 lines): "it is possible to train state-of-the-art models using publicly avail- able datasets exclusively, without resorting to proprietary and inaccessible datasets".

## Rights

- Licence: CC BY 4.0. The arXiv abs page https://arxiv.org/abs/2302.13971v1 links "view license" to http://creativecommons.org/licenses/by/4.0/. Checked 2026-11-01. v1 is the only version, so the licence and the pages we show are the same copy.
- Page 1 footer: only the equal-contribution footnote, the authors' e-mail addresses and the GitHub URL; no other licence notice. No figure or table carries a third-party credit line. Figures 1 and 2 are the authors' own matplotlib plots. Tables quote other models' numbers "from the corresponding papers" (facts, not reprinted figures).
- So whole pages, figures, tables and the abstract can be shown publicly. CC BY conditions: credit (authors, title), link to the source, link to the licence, and an indication that changes were made (highlights, crops, lifted strips and 3D rebuilds are adaptations).
- Exclusions and care:
  - Appendix C and D (pp. 19–27) print model generations, some with fabricated claims about real, named people. Not used; never on the desk at reading size.
  - The p. 1 footnote has the authors' e-mail addresses: never zoom in on or highlight them.
  - External material in segment 8 (Meta's blog posts, Stanford's Alpaca page, the Llama 2 paper) is not covered by this licence. The Llama 2 paper (arXiv:2307.09288) is under the arXiv non-exclusive licence (http://arxiv.org/licenses/nonexclusive-distrib/1.0/, checked 2026-11-01). External cards carry typed facts and short quotes only, with the source named: no screenshots, no page images, no logos (no Meta, Stanford or GitHub logos anywhere).
- Credit line for the end card and the publish description: "Touvron, Lavril, Izacard, Martinet, Lachaux, Lacroix, Rozière, Goyal, Hambro, Azhar, Rodriguez, Joulin, Grave, Lample. LLaMA: Open and Efficient Foundation Language Models. arXiv:2302.13971v1, 2023. CC BY 4.0, https://creativecommons.org/licenses/by/4.0/. Pages shown with highlights, crops and 3D adaptations."
- Scenes: `const PAGES = true;  // Rights: CC BY 4.0 (arXiv abs page, checked 2026-11-01). false = stand-in pages and redrawn figures.`

## Source files

`paper/` (made by `engine/paper_prep.py`, all 27 pages): `source.pdf` (v1), `page-01..27.png` at 200 dpi, **A4: 1654 × 2339 px** (not US letter), `words.json`, `text-NN.txt`. Pages used: 1, 2, 3, 4, 5, 6, 7, 10, 11. Page 1 returns for the end card.

Text quirks: none of the ReAct kind. Every page used is normal text in `words.json`, tables included, and so are Figure 1's tick labels and legend (matplotlib text). Two things to know, both handled in `scenes/_data.js` and the prompts:
- Subscripts split words: "tCO2eq" is three words (`tCO` `2` `eq`). Pass `tCO 2 eq = MWh × 0.385.` to `findPhrase`.
- Line-break hyphens stay in the word: pass `publicly avail- able datasets`, `likely to hallu- cinate incorrect answers`.
- The arXiv side stamp on p. 1 is vertical text: `markBox` it, don't `highlight` it.

Every highlight phrase in the prompts was checked against `words.json` with a copy of `findPhrase`'s matching; every table value in `_data.js` was checked against the cell at its stated box. Figure 1's four curves were traced from the PNG (`FIG1_TRACE`, approximate, labelled on screen).

## Verified facts (checked against `paper/text-NN.txt` and the page PNGs)

| Claim | Where |
|---|---|
| v1 submitted 27 Feb 2023, no later version; licence CC BY 4.0 | https://arxiv.org/abs/2302.13971v1 (opened 2026-11-01) |
| 14 authors, affiliation "Meta AI"; side stamp "arXiv:2302.13971v1 [cs.CL] 27 Feb 2023" | p. 1 |
| "a collection of foundation language models ranging from 7B to 65B parameters" | Abstract, p. 1 |
| "it is possible to train state-of-the-art models using publicly available datasets exclusively, without resorting to proprietary and inaccessible datasets" | Abstract, p. 1 |
| "LLaMA-13B outperforms GPT-3 (175B) on most benchmarks, and LLaMA-65B is competitive with the best models, Chinchilla-70B and PaLM-540B" | Abstract, p. 1 |
| "We release all our models to the research community", footnote 1 https://github.com/facebookresearch/llama | Abstract, p. 1 |
| Hoffmann et al. (2022): "for a given compute budget, the best performances are not achieved by the largest models, but by smaller models trained on more data" | §1, p. 1 |
| That objective "disregards the inference budget, which becomes critical when serving a language model at scale" | §1, p. 1 |
| "the preferred model is not the fastest to train but the fastest at inference" | §1, p. 1 |
| "although Hoffmann et al. (2022) recommends training a 10B model on 200B tokens, we find that the performance of a 7B model continues to improve even after 1T tokens" | §1, p. 1 |
| Aim: "the best possible performance at various inference budgets, by training on more tokens than what is typically used" | §1, p. 1 |
| 13B "can be run on a single GPU" (p. 1); "This model runs on a single V100 GPU during inference" (p. 5) | §1 p. 1, §3.2 p. 5 |
| Most existing models "rely on data which is either not publicly available or undocumented (e.g. "Books – 2TB" or "Social media conversations")" | §1, p. 1 |
| Restriction: "only using data that is publicly available, and compatible with open sourcing" | §2.1, p. 2 |
| Table 1 (sampling prop. / epochs / disk): CommonCrawl 67.0% / 1.10 / 3.3 TB; C4 15.0% / 1.06 / 783 GB; Github 4.5% / 0.64 / 328 GB; Wikipedia 4.5% / 2.45 / 83 GB; Books 4.5% / 2.23 / 85 GB; ArXiv 2.5% / 1.06 / 92 GB; StackExchange 2.0% / 1.03 / 78 GB. Proportions sum to 100.0 | Table 1, p. 2 |
| CommonCrawl: five dumps 2017–2020, CCNet pipeline, line-level deduplication, fastText language identification to remove non-English pages, n-gram language model quality filter, plus a classifier for pages used as Wikipedia references | §2.1, p. 2 |
| C4: "using diverse pre-processed CommonCrawl datasets improves performance. We thus included the publicly available C4 dataset" | §2.1, p. 2 |
| Github: only Apache, BSD and MIT licensed projects; Wikipedia: June–August 2022, 20 languages; books: Gutenberg Project and Books3 section of ThePile, described as "a publicly available dataset"; ArXiv LaTeX files; Stack Exchange, 28 largest websites | §2.1, p. 2 |
| "roughly 1.4T tokens after tokenization"; "each token is used only once during training, with the exception of the Wikipedia and Books domains, over which we perform approximately two epochs" | §2.1, p. 3 |
| Transformer (Vaswani et al., 2017); "Pre-normalization [GPT3]": normalize the input of each transformer sub-layer instead of the output, RMSNorm; "SwiGLU activation function [PaLM]": replaces ReLU, dimension 2/3·4d instead of 4d; "Rotary Embeddings [GPTNeo]": absolute positional embeddings removed, rotary positional embeddings (RoPE) added at each layer | §2.2, p. 3 |
| Table 2 (params / dimension / heads / layers / lr / batch / tokens): 6.7B / 4096 / 32 / 32 / 3.0e−4 / 4M / 1.0T; 13.0B / 5120 / 40 / 40 / 3.0e−4 / 4M / 1.0T; 32.5B / 6656 / 52 / 60 / 1.5e−4 / 4M / 1.4T; 65.2B / 8192 / 64 / 80 / 1.5e−4 / 4M / 1.4T | Table 2, p. 3 |
| Figure 1: training loss over training tokens for the four sizes; 33B and 65B trained on 1.4T tokens, 7B and 13B on 1.0T; batch 4M tokens. All four curves are still descending at their right end (visual reading of the figure) | Figure 1 and caption, p. 3 |
| 65B training: "around 380 tokens/sec/GPU on 2048 A100 GPU with 80GB of RAM"; "training over our dataset containing 1.4T tokens takes approximately 21 days" | §2.4, p. 4 |
| "results on a total of 20 benchmarks"; zero-shot = "a textual description of the task and a test example" | §3, p. 4 |
| Compared models "GPT-3, Gopher, Chinchilla and PaLM" are described as "non-publicly available language models" | §3, p. 4 |
| Table 3 (zero-shot; BoolQ, PIQA, SIQA, HellaSwag, WinoGrande, ARC-e, ARC-c, OBQA): GPT-3 175B 60.5, 81.0, –, 78.9, 70.2, 68.8, 51.4, 57.6; Chinchilla 70B 83.7, 81.8, 51.3, 80.8, 74.9, –, –, –; PaLM 540B 88.0, 82.3, –, 83.4, 81.1, 76.6, 53.0, 53.4; LLaMA 13B 78.1, 80.1, 50.4, 79.2, 73.0, 74.8, 52.7, 56.4; LLaMA 65B 85.3, 82.8, 52.3, 84.2, 77.0, 78.9, 56.0, 60.2 (all rows in `_data.js`) | Table 3, p. 4 |
| Others' numbers: "report numbers from the corresponding papers" | §3.1, p. 5 |
| 13B vs GPT-3: 7 shared tasks, 13B ahead on 5, behind on PIQA (80.1 vs 81.0) and OBQA (56.4 vs 57.6) | Table 3 (count derived) |
| 65B vs PaLM-540B: 7 shared tasks, ahead on 5, behind on BoolQ (85.3 vs 88.0) and WinoGrande (77.0 vs 81.1); the text agrees: "surpasses PaLM-540B everywhere but on BoolQ and WinoGrande" | Table 3; §3.1 p. 5 |
| 65B vs Chinchilla-70B: 5 shared tasks, Table 3 shows 65B higher on all five (BoolQ 85.3/83.7, PIQA 82.8/81.8, SIQA 52.3/51.3, HellaSwag 84.2/80.8, WinoGrande 77.0/74.9). See guardrails for the p. 5 sentence that disagrees | Table 3 (count derived) |
| Margins under one point (all compared pairs): 13B vs GPT-3 PIQA 80.1 vs 81.0 and HellaSwag 79.2 vs 78.9; 65B vs PaLM-540B PIQA 82.8 vs 82.3 and HellaSwag 84.2 vs 83.4; none against Chinchilla | Table 3 (derived) |
| MMLU (five-shot, Average): LLaMA 65B 63.4; Chinchilla 70B 67.5; PaLM 540B 69.3; GPT-3 175B 43.9; LLaMA 13B 46.9 | Table 9, p. 7 |
| "LLaMA-65B is behind both Chinchilla-70B and PaLM-540B by a few percent in average, and across most domains. A potential explanation is that we have used a limited amount of books and academic papers in our pre-training data, i.e., ArXiv, Gutenberg and Books3, that sums up to only 177GB, while these models were trained on up to 2TB of books." (177 GB = Books 85 GB + ArXiv 92 GB in Table 1) | §3.6, p. 6 |
| Instruction fine-tuning: "a single experiment"; LLaMA-I (65B) "we reach 68.9% on MMLU"; "still far from the state-of-the-art, that is 77.4 for GPT code-davinci-002 on MMLU (numbers taken from Iyer et al. (2022))" | §4 and Table 10, p. 7 |
| TruthfulQA (fraction truthful / truthful*informative): GPT-3 175B 0.28 / 0.25; LLaMA 65B 0.57 / 0.53. "Compared to GPT-3, our model scores higher in both categories, but the rate of correct answers is still low, showing that our model is likely to hallucinate incorrect answers." GPT-3 numbers from Ouyang et al. (2022) | Table 14 and §5.4, p. 10 |
| Carbon: Wh = GPU-h × (GPU power consumption) × PUE; PUE 1.1; A100-80GB at 400 W; US national average 0.385 kg CO2eq/KWh; tCO2eq = MWh × 0.385; same formula applied to OPT and BLOOM "for fair comparison", "if they were trained in the same data center" | §6, p. 10; Table 15 caption, p. 11 |
| On their own grids: BLOOM 0.057 kg/KWh → 27 tCO2eq; OPT 0.231 kg/KWh → 82 tCO2eq | §6, p. 10 |
| Table 15 (GPU-hours / MWh / tCO2eq): OPT-175B 809,472 / 356 / 137; BLOOM-175B 1,082,880 / 475 / 183; LLaMA-7B 82,432 / 36 / 14; LLaMA-13B 135,168 / 59 / 23; LLaMA-33B 530,432 / 233 / 90; LLaMA-65B 1,022,362 / 449 / 173 | Table 15, p. 11 |
| Development: "2048 A100-80GB for a period of approximately 5 months", "around 2,638 MWh under our assumptions, and a total emission of 1,015 tCO2eq" | §6, p. 10 |
| "We hope that releasing these models will help to reduce future carbon emission since the training is already done" | §6, p. 10 |
| Conclusion: "a series of language models that are released openly" | §8, p. 11 |
| Meta's announcement, 24 Feb 2023: "we are releasing our model under a noncommercial license focused on research use cases"; "Access to the model will be granted on a case-by-case basis to academic researchers" (and to government, civil-society and academic organisations and industry research labs); "People interested in applying for access can find the link to the application in our research paper." | https://ai.meta.com/blog/large-language-model-llama-meta-ai/ (opened 2026-11-01) |
| Repository README (llama_v1 branch): "In order to download the checkpoints and tokenizer, fill this google form"; "Once your request is approved, you will receive links to download the tokenizer and model files." | https://github.com/facebookresearch/llama/tree/llama_v1 (opened 2026-11-01) |
| Alpaca (Stanford CRFM): "We introduce Alpaca 7B, a model fine-tuned from the LLaMA 7B model on 52K instruction-following demonstrations." "Alpaca is based on LLaMA, which has a non-commercial license, so we necessarily inherit this decision." The page shows no date; its URL path is dated 2023/03/13 | https://crfm.stanford.edu/2023/03/13/alpaca.html (opened 2026-11-01) |
| Meta, 18 Jul 2023: "We've been blown away by the huge demand for Llama 1 from researchers — with more than 100,000 requests for access to the large language model"; "Llama 2 is free for research and commercial use." | https://ai.meta.com/blog/llama-2/ (opened 2026-11-01) |
| Llama 2 paper: "Llama 2: Open Foundation and Fine-Tuned Chat Models", Touvron et al. (68 authors), arXiv:2307.09288 v1 18 Jul 2023; "a collection of pretrained and fine-tuned large language models (LLMs) ranging in scale from 7 billion to 70 billion parameters"; arXiv non-exclusive licence | https://arxiv.org/abs/2307.09288 (opened 2026-11-01) |

## Guardrails

- **Chinchilla and BoolQ.** The p. 5 text says "LLaMA-65B outperforms Chinchilla-70B on all reported benchmarks but BoolQ", but Table 3 prints 85.3 (65B) against 83.7 (Chinchilla) on BoolQ. Use the table. Never highlight or zoom on that p. 5 sentence (p. 5 lines y 471–575 left column). Don't comment on the discrepancy on screen.
- **Model names vs parameter counts.** The names are 7B, 13B, 33B, 65B; Table 2 prints 6.7B, 13.0B, 32.5B, 65.2B. Use the names everywhere, Table 2's numbers only while Table 2 is on screen. Figure 1's caption says "65 models" (typo): never retype it.
- **"10× smaller".** 175 / 13 ≈ 13.5. The intro says "10× smaller", the conclusion "more than 10× smaller", §3.2 "5-10× smaller" (against GPT-3 and Chinchilla). Show the two sizes (13B, 175B) instead of any ratio; don't compute one on screen.
- **"Most benchmarks" and "competitive".** In Table 3 the 13B model is behind GPT-3 on two of seven shared tasks: show both losses. "Competitive" is the paper's word for 65B against Chinchilla and PaLM: don't upgrade it to "beats" or "best". MMLU (Table 9) has 65B behind both: segment 6 shows it.
- **Cross-paper comparisons.** Every non-LLaMA number in Tables 3, 9 and 14 comes from the other models' own papers (Table 14's GPT-3 from Ouyang et al.), not from re-running them. Keep the tag `\text{others: from their papers}` on screen whenever those numbers are. Zero-shot (Table 3) and five-shot (Table 9) settings go on the bar groups. Bars start at 0. No averages computed by us.
- **Hedged claims.** The MMLU books explanation is "a potential explanation". The carbon release benefit is a hope ("We hope that releasing these models will help…"). Say so.
- **77.4** is code-davinci-002's MMLU score as quoted by the authors from Iyer et al.; it is not in Table 10 and not a LLaMA number. Draw it as a glass reference level, not a bar.
- **TruthfulQA** values are fractions (0.57), not percentages. Show 0.57 and 0.28 as printed.
- **Carbon.** Table 15 is a "same data center" recomputation at the US average grid, PUE 1.1 and 400 W. The OPT and BLOOM rows are the LLaMA authors' numbers, not those projects' own figures (27 t and 82 t on their actual grids). Keep `\text{same data center assumed}` on screen whenever 137 or 183 is. Development totals are estimates ("approximately 5 months", "around 2,638 MWh"). Don't subtract the four final runs (300 t) from 1,015 t, don't explain the gap, don't convert to cars, flights or homes. Table 15 rounds slightly differently from its own formula (BLOOM 475 vs 476.5 MWh, 65B 449 vs 449.8): show the printed values, never recompute on screen.
- **No "first", no "open source".** The paper names earlier public models (OPT, GPT-NeoX, BLOOM, GLM; p. 1). Don't call LLaMA the first open model. The paper says "compatible with open-sourcing" and "released openly"; the weights went out under a non-commercial research licence with case-by-case access. Don't call LLaMA or Llama 2 "open source" in our voice, even though Meta's Llama 2 post does.
- **Data wording.** "Publicly available" is the authors' description of every source, including Books3. Say it as theirs ("the restriction", "the paper says"). No comment on any source's later legal status: no source for that was opened.
- **What came after.** Only these, each with its URL: Meta's licence and case-by-case access; Alpaca (fine-tuned from LLaMA 7B, inherits the non-commercial licence); Meta's own count of "more than 100,000 requests for access" (attributed to Meta on screen, self-reported); Llama 2 (18 Jul 2023, 7B to 70B, "free for research and commercial use"). No leak story, no download or citation counts, no "most popular", no list of other derivatives, no Llama 2 benchmark numbers, no claim that Llama 2 fulfils the paper's "plan to release larger models".
- **Names as the page spells them.** "LLaMA" for this paper, "Llama 2" for Meta's later model. Table 1 prints "Github", "ArXiv", "StackExchange"; the text has "GitHub", "Stack Exchange". Our own labels: GitHub, arXiv, Stack Exchange. Bracket sources as printed: [GPT3], [PaLM], [GPTNeo]. "Timothee Lacroix" without the accent (as on the page). Don't retype the paper's typos: "Large Languages Models" (p. 1), "where we were found the inspiration" (p. 3), "65 models" (Figure 1 caption), "achieve state-of-the-arts" (p. 5), "PerplexityAPI" (Table 11 caption; the text says PerspectiveAPI), "A100-80B" (p. 10).
- **Colour meaning.** Red is the 65B model in this video (Figure 1's colour). "Behind" is an ink outline and a `\text{behind}` tag; a struck phrase is an `F.ink` line. Never red for "wrong".
- **Illustrative, labelled on screen.** The transformer block in segment 4 is our schematic (`\text{schematic, ours}`): the paper has no architecture figure. The 2048-tile GPU grid (count real, layout ours). The 3D loss ribbons are traced from Figure 1 (`\text{traced from Figure 1}`). Data-source colours are ours. Everything quoted comes from the page itself (highlight or lifted crop), never retyped, except the short external quotes on the segment 8 cards.
- **TeX.** Escape `%` as `\%`; no `§` (write "Section 2.2"); no `\boxed{}`; `\times` for ×; `\mathrm{CO_2}` for CO2.

## Segments (audio 6:09 summed WAV, 6:14 with the 0.6 s scene tails; target 5:00–6:15)

| # | Segment | Audio | Pages on the desk | Centrepiece |
|---|---|---|---|---|
| 1 | cover — the page, the line, the promise | 0:47.5 | p. 1 | the abstract line highlighted with the voice and lifted; four model slabs (7B–65B, Figure 1 colours, heights from Table 2) rise beside a ghost GPT-3 175B slab |
| 2 | problem — the inference budget | 0:41.7 | p. 1, p. 3 | two token bars from zero, Hoffmann's 10B on 200B tokens against the 7B past 1T; Figure 1 lifted and stood up as four traced loss ribbons, still sloping down |
| 3 | data — Table 1 | 0:42.7 | p. 2, p. 3, p. 1 | Table 1 becomes a 3D layered block, one layer per source, thickness ∝ sampling proportion; Wikipedia and books layers doubled for "about twice"; p. 1's "Books – 2TB" struck in ink |
| 4 | machine — three borrowed changes, Table 2, the GPUs | 0:45.8 | p. 3, p. 4 | our schematic transformer block stands up in 3D, the three changes snapping in with their [GPT3] / [PaLM] / [GPTNeo] tags; Table 2 as four layer towers (32 / 40 / 60 / 80); a 2048-tile GPU grid |
| 5 | evidence — Table 3 | 0:51.2 | p. 4, p. 5 | paired 3D bars from zero: 13B vs GPT-3 on seven tasks (two losses), then 65B vs Chinchilla and vs PaLM-540B, sizes on every label |
| 6 | limits — MMLU, instruction tuning, TruthfulQA | 0:46.4 | p. 6, p. 7, p. 10 | MMLU average bars (63.4 / 67.5 / 69.3), the 177 GB vs 2 TB book stacks tagged "potential explanation", LLaMA-I 68.9 under the 77.4 glass plate |
| 7 | carbon — Section 6, Table 15 | 0:48.7 | p. 10, p. 11 | the formula strip assembled from the page; Table 15 as 3D bars of tCO2eq under a "same data center assumed" plate; the 1,015 t development block beside them |
| 8 | after — licence, Alpaca, Llama 2, end card | 0:45.2 | external cards, p. 11, p. 1 | a timeline on the desk: Feb 2023 licence card, Mar 2023 Alpaca card, Jul 2023 Llama 2 card (7B–70B slabs); end card with CC BY credit |

Author pairs (prompts): 01-cover + 02-problem (p. 1, the size colours, Figure 1); 03-data + 04-machine (pp. 2–4, Tables 1–2); 05-evidence + 06-limits (pp. 4–7, 10, the bar-chart language); 07-carbon + 08-after (pp. 10–11, external cards, end card).
