# Example: LLaMA

A full Paperframe video of *LLaMA: Open and Efficient Foundation Language Models* (Touvron et al., 2023): eight segments, 6:14. The four model sizes in Figure 1's own colours (7B blue, 13B orange, 33B green, 65B red) are its visual spine: the abstract line highlighted on page 1, Figure 1's loss curves standing up as ribbons, Table 1 as a layered block of data sources, a schematic transformer layer (ours, labelled) with the three borrowed changes, Table 3 as paired bars from zero with both losses shown, the MMLU and TruthfulQA results that go the other way, Table 15's carbon estimate under its stated assumptions, and what followed before the end card.

It is also the reference for two things ReAct doesn't show: paired prompt files (`prompts/01-cover_02-problem.md`, one per scene author, listed under the briefing's segment table) and an A4 paper.

## What is in this folder

| Committed (the source) | Built by the commands below (gitignored) |
|---|---|
| `briefing.md`: paper header, rights, verified facts with page references, guardrails, segment table, author pairs | `paper/`: the PDF, page PNGs, word boxes, text per page |
| `narration.md`: the script, one `## segment` per heading | `audio/`: one WAV per segment and `timings.json` |
| `prompts/`: four briefs, two segments each | `review/`: stills and contact sheets |
| `scenes/`: one scene per segment, plus `_data.js` (palette, page boxes, table values, the Figure 1 trace) | `render/` and `out/`: segment videos and the finished `out/llama.mp4` |

## Rebuild it

From the repo root, after `./install.sh`:

```sh
bin/paperframe doctor
bin/paperframe new examples/llama https://arxiv.org/abs/2302.13971v1
bin/paperframe audio examples/llama
bin/paperframe stills examples/llama cover          # look at examples/llama/review/cover/contact.png
bin/paperframe preview examples/llama machine       # optional: live preview with sound
bin/paperframe render examples/llama all
bin/paperframe assemble examples/llama              # → examples/llama/out/llama.mp4
```

Use exactly this version, arXiv v1 (`2302.13971v1`, 27 pages; it is the only version). The pages are A4, so `new` prepares them at 200 dpi as 1654 × 2339 px, not the 1700 × 2200 of a US-letter paper. Every box in `scenes/_data.js` and every highlight is measured on that copy.

## Rights switch

Every scene opens with `const PAGES = true;`, since the paper is CC BY 4.0. With `PAGES = false` the pages become stand-ins (grey word bars at the same geometry), and the scenes redraw Figure 1 and typeset Tables 1, 2 and 15 and the carbon formulas in place, from `_data.js`. The other pages stay as word bars.

## Credit and licence

The paper: Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timothee Lacroix, Baptiste Rozière, Naman Goyal, Eric Hambro, Faisal Azhar, Aurelien Rodriguez, Armand Joulin, Edouard Grave, Guillaume Lample. *LLaMA: Open and Efficient Foundation Language Models*. [arXiv:2302.13971](https://arxiv.org/abs/2302.13971v1) (v1, 2023), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The video shows its pages with highlights, crops and 3D adaptations; those are changes to the original.

The last segment mentions sources outside the paper (Meta's blog posts of February and July 2023, Stanford's Alpaca page, the Llama 2 paper). They are not covered by the paper's licence. They appear only as typed cards with short quotes and their citations, never as pages, screenshots or logos.

The files in this folder (briefing, narration, prompts, scenes) are part of Paperframe and MIT-licensed like the rest of the repo. The paper, its pages and anything quoted from it remain under the authors' CC BY 4.0 licence. If you publish a render, carry the credit line from `briefing.md` (Rights) in the description, as the end card does on screen.
