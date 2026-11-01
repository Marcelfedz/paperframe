# Contributing

There are four ways to help: send a video, improve the kit, improve the docs, or propose a new style. In every case the bar is the same. Every claim traces back to the paper, every segment has been looked at frame by frame, and nothing is committed that the paper's licence doesn't allow.

Plain, direct English everywhere: no hype words, no emojis.

## Send a video

A contributed video is a folder in `examples/<slug>/` with the four source parts only:

```
examples/<slug>/
├── README.md       the paper, its licence, and the commands to rebuild the video (model it on examples/react/README.md)
├── briefing.md     paper header, rights, verified facts, guardrails, segment table
├── narration.md
├── prompts/
└── scenes/         NN-seg.js per segment, plus _data.js
```

Three existing examples show what a finished folder looks like: `examples/react/`, `examples/llama/` and `examples/chain-of-thought/`. The last two also show the full-mode shape (paired prompt files, an author-pair table in the briefing) and the `PAGES` switch with `standIn` redraws.

**Never commit** the PDF, page images, `words.json`, audio, review stills or renders. `paper/`, `audio/`, `review/`, `render/` and `out/` are gitignored in `examples/*/`, so `git status` should show only the files above. Anyone can rebuild them from the commands in your folder's README.

How to get there:

1. Make the video in `papers/<slug>/` as usual (`/paper-to-video`, or `docs/playbook.md` by hand).
2. Copy the four source parts into `examples/<slug>/`, and write its `README.md`.
3. Check the imports: the kit root-absolute (`/engine/folio.js`), the video's own data relative (`./_data.js`). If a scene imports `/papers/<slug>/…`, change it.
4. Rebuild from the copy to prove it works: prepare the paper into `examples/<slug>/` (the README's commands), run `bin/paperframe audio examples/<slug>`, then take stills of every segment.

**Which papers.** Only papers whose licence allows showing the pages publicly, which in practice means CC BY or CC0. Name the licence and where you checked it in the briefing. For any other paper, the video can still be contributed with `PAGES = false` in every scene (stand-in pages and redrawn figures), but it has to look complete that way. The LLaMA and Chain-of-Thought scenes show how the redraws are wired (`standIn(page, { blank, draw })`). Third-party figures inside an open paper ("reprinted with permission") never appear. See the Rights section of `docs/playbook.md`.

**In the pull request description**, include:

- the paper (title, authors, version, URL) and its licence;
- the total duration and the segment list;
- a contact sheet for every segment, attached to the description, not committed;
- optionally, a link to the rendered video hosted somewhere else;
- anything you could not verify.

**The bar for a video:**

- Facts sourced: every claim on screen and in the narration is in the briefing's facts table, with a page, section, table or figure, or a URL for anything outside the paper. Inconsistencies inside the paper are noted in the guardrails, not resolved by guessing.
- Quotes are highlighted on the real page in sync with the voice, never retyped.
- Stills reviewed: every segment passes the checklist in `docs/playbook.md`, step 7.
- The source stamp is on whenever paper content is, and the end card carries the full citation and licence.
- The house rules in `docs/style-folio.md` hold: no coloured edge stripes on cards, no numbered pill badges, no emojis, no logos in our diagrams, nothing gamey.
- No hype in the narration, and self-reported results are framed as "the authors report".

## Improve the kit

The kit is `engine/` (the scene kit `folio.js`, the renderer, the audio and paper-prep scripts) and `bin/paperframe`.

- **Keep it backward compatible.** Existing scenes must render unchanged. Before and after your change, take the same stills of the three examples and compare them: `bin/paperframe stills examples/react cover --at 5,20,30`, and the same for `examples/llama` (A4 pages) and `examples/chain-of-thought`. Each call replaces `review/<seg>/`, so copy the before stills somewhere else first.
- **Keep scenes pure.** Anything a scene calls must be a pure function of time and its inputs, with seeded randomness, because frames render out of order in parallel.
- **Keep dependencies small.** The engine depends on Playwright and MathJax on the Node side, and on kokoro-onnx, numpy and soundfile on the Python side. A new dependency needs a strong reason.
- **Document what you add.** Every new export gets a doc comment with its signature, and a line in the kit reference in `docs/style-folio.md`.
- **Good first candidates** are helpers that scene authors keep writing inside their scenes. They list them as "kit candidates" in their reports.

## Improve the docs

`docs/` is the source of truth for the procedure. `CLAUDE.md`, `AGENTS.md` and the files in `.claude/` are thin adapters that point at it. A rule that lives only in an adapter is a bug: put it in `docs/` and point at it from the adapter.

Gotchas are the most useful contribution. If something cost you an hour, add it to the gotchas in `docs/style-folio.md`, with the fix.

## Propose a style

Folio is the one style today. A new style is a new visual language for paper videos, for example a dark desk or a different way of standing figures up. It must keep the principle: everything on screen traces back to a page of the paper.

1. Open an issue first, describing the idea and the papers it suits.
2. Build a lab: one scene on one CC BY paper, showing the style's devices, plus its contact sheet.
3. Write `docs/style-<name>.md` in the shape of `docs/style-folio.md`: canvas and palette, type, devices, motion, house rules, gotchas.
4. Put any kit code in its own file (`engine/<name>.js`), so folio scenes are untouched.

A style is accepted once a whole video has been made in it and has met the bar above.

## Licence

Contributions are under the repo's [MIT licence](LICENSE). The papers shown in videos keep their own licences; your briefing records which one applies.
