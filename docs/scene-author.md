# Scene author brief

You write one or more scenes of a paper video in the folio style. The coordinator tells you the video (`papers/<slug>/`) and your segments.

## Read first, in this order

1. `docs/style-folio.md`, the visual language and its gotchas. The format's whole point is that it is not a dark presenter stage: a light desk, the real pages, our animations on paper. Read the gotchas before you write anything; each one cost an earlier author time.
2. `engine/folio.js`, the kit. Read the whole file; it is short and every export has a doc comment. The key pieces are `loadPaper`, `findPhrase`, `cameraAt` and `cam`, `sheet`, `highlight` with `sayP` and `sayWords` (the marker follows the voice), `markBox`, `liftPose`, `onSheet`, `blankPage` (your own diagrams on a sheet that tilts and lifts like a page), `inked` (the real page with your ink on top), `slab` and `prism` (3D), `tag`, `cite` (the source stamp), `endCard`, `standIn` (rights-off pages) and `cueBook`. TeX comes through `drawTex` and `tex`, re-exported from `b1b.js`.
3. The reference scenes in `examples/react/scenes/`. `01-cover.js` covers the page arriving, the highlight with the voice, a lift-off, slabs standing up and the source stamp. `03-loop.js` shows a 3D build, and `08-after.js` the end card. `examples/llama/scenes/` and `examples/chain-of-thought/scenes/` add the `PAGES` switch with `standIn` redraws, 3D bar charts from tables, and external-source cards.
4. Your video's `briefing.md` (facts and guardrails), `narration.md`, `audio/timings.json`, your prompt in `prompts/`, and `scenes/_data.js` if it exists.
5. `docs/playbook.md`, steps 6 and 7: the scene contract and the stills review.

## Rules

- **Everything sits on the desk.** Real pages (`sheet`), our drawings on paper (`blankPage`), ink on the page (`inked`, `highlight`, `markBox`), and 3D objects standing on the desk (`slab`, `prism`, or your own geometry projected through `C.p(x, y, z)`). No dark stages, no full-screen flat slides, no `K` palette. Use `F`.
- **The marker follows the voice.** When the narration quotes the paper, the marker runs over that exact line on the page as the voice reads it: `sayP` for a whole sentence, `sayWords` for part of one. Find phrases with `findPhrase`; it throws if the text isn't on that page, so check `paper/text-NN.txt`. Vector figures and equations have no words. Get their box from the page PNG (`paper/page-NN.png`) and write it as a constant.
- **Rights switch.** Put `const PAGES = …` at the top of every scene, with the value and the one-line reason from the briefing. Every page goes through `PAGES ? P.page(n) : standIn(P.page(n))`, and so does any bitmap of a figure. With `PAGES = false`, no page bitmap appears anywhere, thumbnails included.
- **Source stamp.** Call `cite()` on every beat that shows paper content, with the right page, region and label. Use `side: 'right'` unless it collides with a page in the corner.
- **Cues, not seconds.** Every beat lands on a narration word through `cueBook(env)`: `q.w(sentence, 'word', nth)`, `q.s(i)`, `q.e(i)`. Never hard-code seconds, except small offsets around a cue (`q.w(4, 'manner') + 0.12`). Word indices for `sayWords` come from `timings.json`: punctuation right after a `{Display|spoken}` override (`{PaLM|palm},`) is a word of its own there and shifts every index after it.
- **On-screen text.** TeX only, at most 6 words per label, at least 30 px on screen. The camera zoom scales sheet content, so measure on screen. Pass `color: F.ink` (or another `F` colour) to `drawTex`; its default is white. Numbers on screen must be in the briefing's facts table. Illustrative values get a small `\text{illustrative}` tag.
- **Motion.** One idea at a time: the previous group leaves by sliding off the desk, getting picked up, or the camera moving on. Pages arrive with a small arc, never a fade from nothing. The camera moves on eased keys, push-ins stay within ×2.2 and at most about 1.3 screen px per page px (beyond that the page text goes soft), and 3D beats sit at pitch 0.85–1.0.
- **Edges.** `ctx.globalAlpha = edgeIn(t, env.dur)` right after `desk(ctx)`. Segments are hard cuts on the same desk.
- **Purity.** `draw` is a pure function of time: no state between frames, all randomness seeded. Import the kit root-absolute (`/engine/folio.js`, `/engine/runtime.js`), and the video's data relatively (`./_data.js`).
- **Scope.** Don't edit `engine/`, the briefing, the narration, or other segments' files. If you need a helper, keep it in your scene file and list it in your report as a kit candidate. If a fact in your prompt looks wrong against the page, don't fix the narration: report it.
- **House rules.** No coloured edge stripes on cards (colour goes in the outline or a tinted fill), no numbered pill badges, no emojis, no company logos in our diagrams, nothing gamey.

## Process

1. Write `scenes/NN-seg.js`, with `NN` and `seg` exactly as in `audio/timings.json`. Start with `setup()`: load TeX and pages, find every phrase. Take one still (`--at 0`) at once, so missing phrases and TeX errors surface before you animate anything. Scratch files (crops, measuring scripts, saved stills) go in a subfolder of your own in the scratch directory (your agent's scratchpad, or a temp folder), named after your segments: parallel authors share that directory and overwrite each other's files.
2. Take review stills:

   ```sh
   bin/paperframe stills <slug> <seg> --stills 12
   bin/paperframe stills <slug> <seg> --at 3.2,7.5,18.4   # up to 12 times per call
   ```

   Each call replaces `review/<seg>/`, so an `--at` pass wipes the contact sheet of the pass before. Copy it to your scratch folder first if you still need it.

   Take `--at` stills at every cue word that matters and inside every highlight. Open and look at every contact sheet, then judge framing and legibility on the full-size stills (`review/<seg>/tNNN.NN.png`): contact-sheet thumbnails make soft text look sharp and hide small overlaps. Check that:
   - the highlighted words are the ones being spoken;
   - nothing overlaps or leaves the frame;
   - text is legible and at least 30 px;
   - the stamp shows the right page and region;
   - nothing sits still for more than about a second;
   - numbers on screen match the facts table.
3. Iterate until the stills are clean. `bin/paperframe preview <slug> <seg>` plays the scene with its audio when you need to judge timing. Don't render video; the coordinator renders all segments together.

## Report (final message)

- The file or files you wrote.
- One line per beat: what is on screen, on which word.
- Kit candidates: helpers you wrote that other scenes would reuse.
- Any fact you weren't sure of, and anything in the prompt you changed and why.
