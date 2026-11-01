# Example: ReAct

The reference Paperframe video: *ReAct: Synergizing Reasoning and Acting in Language Models* (Yao et al., ICLR 2023), eight segments, about 6 minutes. The thought → action → observation loop is its visual spine: the abstract highlighted on page 1, Figure 1's traces lifted off page 2 and replayed around a 3D loop, the Wikipedia tools, the ALFWorld room, Table 2's failure modes, Tables 1, 3 and 4 as bars from zero, and an end card with the citation.

## What is in this folder

| Committed (the source) | Built by the commands below (gitignored) |
|---|---|
| `briefing.md`: paper header, rights, verified facts with page references, guardrails, segment table | `paper/`: the PDF, page PNGs, word boxes, text per page |
| `narration.md`: the script, one `## segment` per heading | `audio/`: one WAV per segment and `timings.json` |
| `prompts/`: one brief per segment | `review/`: stills and contact sheets |
| `scenes/`: one scene per segment, plus `_data.js` (palette, figure boxes, table values) | `render/` and `out/`: segment videos and the finished `out/react.mp4` |

## Rebuild it

From the repo root, after `./install.sh`:

```sh
bin/paperframe doctor
bin/paperframe new examples/react https://arxiv.org/pdf/2210.03629v3
bin/paperframe audio examples/react
bin/paperframe stills examples/react cover          # look at examples/react/review/cover/contact.png
bin/paperframe preview examples/react loop          # optional: live preview with sound
bin/paperframe render examples/react all
bin/paperframe assemble examples/react              # → examples/react/out/react.mp4
```

Use exactly this PDF, arXiv version 3 (`2210.03629v3`, the ICLR camera-ready, 33 pages). `new` prepares every page at 200 dpi (1700 × 2200 px), and every box in `scenes/_data.js` and every highlight is measured on that version. Another version moves the lines and the boxes stop landing on them.

On the Apple-silicon Mac where this was built, the narration took about 3.5 minutes (Kokoro on the CPU) and rendering took about 50 seconds per 40-second segment with the default six workers.

## Credit and licence

The paper: Shunyu Yao, Jeffrey Zhao, Dian Yu, Nan Du, Izhak Shafran, Karthik Narasimhan, Yuan Cao. *ReAct: Synergizing Reasoning and Acting in Language Models*. ICLR 2023. [arXiv:2210.03629](https://arxiv.org/abs/2210.03629), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The video shows its pages with highlights, crops and 3D adaptations; those are changes to the original. Short strings from Wikipedia and from the ALFWorld and WebShop environments appear only as part of the paper's own figures.

The files in this folder (briefing, narration, prompts, scenes) are part of Paperframe and MIT-licensed like the rest of the repo. The paper, its pages and anything quoted from it remain under the authors' CC BY 4.0 licence. If you publish a render, carry the credit line from `briefing.md` (Rights) in the description, as the end card does on screen.
