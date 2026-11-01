# Example: Chain-of-Thought Prompting

A full Paperframe video of *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models* (Wei et al., NeurIPS 2022): eight segments, 6:13. The prompt itself is its visual spine: the abstract line highlighted on page 1, Figure 1's two answers to the same question (27, wrong; 9, right), the prompt standing up as input / chain / output triples, Table 20's eight exemplars and Figure 3's nine kinds of question, Figure 4 grown into a terrace of bars by model size, the ablations as cards with their Table 6 bars, the commonsense and symbolic results, and the paper's own limits before what followed and the end card.

Next to ReAct it shows paired prompt files (one per scene author, listed under the briefing's segment table), a figure that already carries the paper's own coloured highlights (followed with ink underlines instead of a marker), and scenes that share helpers through a sibling import (`04-tasks.js` imports from `./03-idea.js`).

## What is in this folder

| Committed (the source) | Built by the commands below (gitignored) |
|---|---|
| `briefing.md`: paper header, rights, verified facts with page references, guardrails, segment table, author pairs | `paper/`: the PDF, page PNGs, word boxes, text per page |
| `narration.md`: the script, one `## segment` per heading | `audio/`: one WAV per segment and `timings.json` |
| `prompts/`: four briefs, two segments each | `review/`: stills and contact sheets |
| `scenes/`: one scene per segment, plus `_data.js` (palette, every highlight phrase as `PH`, figure boxes, table cells) | `render/` and `out/`: segment videos and the finished `out/chain-of-thought.mp4` |

## Rebuild it

From the repo root, after `./install.sh`:

```sh
bin/paperframe doctor
bin/paperframe new examples/chain-of-thought https://arxiv.org/abs/2201.11903v6
bin/paperframe audio examples/chain-of-thought
bin/paperframe stills examples/chain-of-thought cover    # look at examples/chain-of-thought/review/cover/contact.png
bin/paperframe preview examples/chain-of-thought scale   # optional: live preview with sound
bin/paperframe render examples/chain-of-thought all
bin/paperframe assemble examples/chain-of-thought        # → examples/chain-of-thought/out/chain-of-thought.mp4
```

Use exactly this version, arXiv v6 (`2201.11903v6`, 10 January 2023, 43 pages). `new` prepares every page at 200 dpi (1700 × 2200 px, US letter), and every box in `scenes/_data.js` and every highlight is measured on that version. Earlier versions differ (v5 added results, v6 fixed a typo in Figure 3), and their lines move.

## Rights switch

Every scene opens with `const PAGES = true;`, since the paper is CC BY 4.0. With `PAGES = false` the pages become stand-ins (grey word bars at the same geometry), and the scenes redraw the structure of Figures 1, 3, 4 and 6 and Table 20 in place (frames, highlight bands, curves) from `_data.js`. The text itself stays as word bars.

## Credit and licence

The paper: Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed H. Chi, Quoc V. Le, Denny Zhou. *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models*. NeurIPS 2022. [arXiv:2201.11903](https://arxiv.org/abs/2201.11903v6) (v6), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The video shows its pages with highlights, crops and 3D adaptations; those are changes to the original. Benchmark items (GSM8K, CSQA, StrategyQA, BIG-bench and others) appear only as part of the paper's own figures and tables.

The last segment mentions one source outside the paper, Kojima et al., *Large Language Models are Zero-Shot Reasoners* ([arXiv:2205.11916](https://arxiv.org/abs/2205.11916)). It is not covered by this paper's licence and appears only as a typed card with its five-word prompt and the citation.

The files in this folder (briefing, narration, prompts, scenes) are part of Paperframe and MIT-licensed like the rest of the repo. The paper, its pages and anything quoted from it remain under the authors' CC BY 4.0 licence. If you publish a render, carry the credit line from `briefing.md` (Rights) in the description, as the end card does on screen.
