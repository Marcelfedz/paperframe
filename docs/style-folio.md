# Visual language: folio

The paper itself is the set. Its real pages lie on a light desk. The narration reads a line and the highlighter runs over that line on the page. Pieces of the page lift off as paper copies and turn into diagrams, and figures stand up in 3D. Everything on screen can be traced back to a page.

The format's whole point is that it is not a dark presenter stage. It is a light desk with the real pages and our animations on paper.

Kit: `engine/folio.js` (it re-exports `engine/b1b.js`, the TeX renderer). Paper prep: `engine/paper_prep.py`. Reference scenes: `examples/react/scenes/`.

## Canvas and palette

- 1920 × 1080, 30 fps. `desk(ctx)` draws the light desk: warm off-white, a soft pool of light, static grain. Call it first in every frame. Pages are pure white with a soft contact shadow. There is no dark variant; if a paper ever needs one, it becomes a `desk()` option, not a separate kit.
- `F` is the palette. Use `F.ink` (with `F.ink2`, `F.ink3`) for type and outlines. The accents are saturated enough to read on white: `F.blue`, `F.teal`, `F.red`, `F.gold`, `F.purple`, `F.green`, `F.orange`, `F.pink`.
- Highlighters are multiplied over the print, so the text shows through. `F.hlYellow` marks the key line read verbatim, `F.hlMint` names, tasks and paraphrased lines, `F.hlBlue` the paper's own coinage, and `F.hlPink` is spare.
- For architecture blocks there are figure pastels sampled from the Transformer paper's Figure 1: `F.attn`, `F.ffn`, `F.norm`, `F.embed`, `F.linear`, `F.soft`, `F.block`. When a paper has its own figure colours, sample them into `_data.js` and keep them. The 3D rebuild should look like the paper's figure grown up.
- Colour meaning is fixed inside a video. Red means struck out or "the thing that changed"; blue means the paper's own term. The cover is where the viewer learns the colours, and every later segment keeps them.
- `b1b.js` also exports a dark-stage palette `K`. Never use it in folio scenes; use `F`.

## Type

- TeX for every label and number (`drawTex`, `tex`; Computer Modern via MathJax). Papers are typeset in LaTeX, so the diagrams continue in the paper's own typeface. Use `\texttt{}` for IDs such as arXiv numbers and code.
- `drawTex` defaults to white (it comes from the dark kit). Always pass `color: F.ink` or another `F` colour.
- On-screen text is an anchor, not the narration: at most 6 words per label. Labels are 40–60 px, headlines 90–120 px, and nothing is under 30 px on screen. The camera zoom scales everything drawn on a sheet, so check the size on screen, not in page px.
- Quotes from the paper are never retyped. Highlight them on the page, or lift the real strip off it.

## Devices, in order of use

| Device | Kit | Rule |
|---|---|---|
| The page | `loadPaper`, `sheet`, `cameraAt` | Real page PNGs at 200 dpi in perspective. The camera reads like a person: push into the paragraph being read, pull back to show the page. |
| Highlight with the voice | `findPhrase`, `highlight`, `sayP`, `sayWords` | When the narration reads a line of the paper, the marker follows the words (`sayP(env, i, t)` for a whole sentence, `sayWords(env, i, from, to, t)` for part of one). Phrases come from `words.json` through `findPhrase`, never from guessed coordinates. |
| Editorial marks | `markBox`, strike lines and ink via `onSheet` | Box the figure or term under discussion; strike out what the paper throws away. They are drawn on the page, so they move with it. |
| Lift-off | `liftPose` | A strip or figure is picked up: it rises, its shadow grows, it lands. It is a copy, and the page underneath stays intact. |
| Stand-up | `slab`, `prism`, `cam({ pitch ≈ 1 })` | Figures become 3D. Blocks extrude as slabs on top of the flat figure, which stays on the desk as a blueprint. Pitch the camera up to about 1 rad for these beats and back down to read pages. |
| Our own sheets | `blankPage`, `inked` | Our diagrams live on paper too. `blankPage` is a blank sheet you draw on; `inked` is the real page with your ink on top (`findPhrase` still works on it). Both tilt, lift and cast shadows like the real pages. |
| Source stamp | `cite(ctx, page, { label, rect, side })` | Always on while paper content is on screen: a thumbnail of the page with the region boxed, plus a label such as `p. 3 · Figure 1`. The viewer always knows where in the paper we are. |
| End card | `endCard`, `endCardPose` | Page 1 slides back onto the desk and the full citation is written beside it: title, authors, venue and year, URL, licence. |

Illustrative numbers (toy attention weights, sample vectors, a room layout) are marked `illustrative` on screen. The paper's own figures and tables are shown as the real thing.

## Kit reference

`engine/folio.js` opens with an API table, and every export has a doc comment with its signature. Read the whole file before writing a scene. The main pieces:

- **Camera.** `cam({ tx, ty, pitch, yaw, dist, zoom })` returns a projector `C` with `C.p(x, y, z)` → screen `{ x, y, k }`. `cameraAt(t, keys)` gives an eased path through keys `{ t, dur, …fields }`. `camAt` does the same and also eases the screen centre, for framing off-centre. World units: x right, y down the desk, z up towards the camera, about 1 px at zoom 1.
- **Sheets.** A pose is `{ x, y, z, w, rot, tilt, src }`; `src` is an optional crop in page px. `sheet()` draws it, `sheetPt()` and `onSheet()` map page px to world and screen, and `liftPose(page, from, rect, to, p)` gives the pose of a crop peeling off a sheet and travelling to another pose. `arcPose(from, to, p, h)` gives a whole sheet picked up and put down elsewhere, lifted on an arc (ease `p` yourself).
- **Text on the page.** `findPhrase(page, phrase, nth)` returns one box per line and throws if the phrase is not on that page. `highlight()` sweeps a marker over those boxes as `p` goes from 0 to 1.
- **3D.** `slab()` draws an axis-aligned box standing on the desk. `prism()` draws a shaded solid culled by the eye position, either from 8 corners (a box on a rotated or tilted sheet) or from a convex footprint extruded between two heights. `arrow3()` draws an ink arrow along a 3D polyline, and `contactShadow()` puts a soft shadow on the desk under anything that hovers (draw it before the object).
- **Labels.** `tag()` draws TeX on a small white paper slip in screen px, so a label reads over a busy page or a 3D part.
- **Rights.** `standIn(page, { blank, draw })` returns a stand-in sheet: grey word bars at the same geometry, no bitmap. Words inside the `blank` rects are left out, so `draw(g)` can redraw a figure or typeset a table in their place, in page px. `masked(page, rects)` paints regions such as logos out of a real page. `mipsOf(canvas)` builds the mip chain `sheet()` expects on any page-like object you build. See the playbook's Rights section for the `PAGES` switch.
- **Cues.** `cueBook(env)`: `q.w(i, 'word', nth)` and `q.we(i, 'word', nth)` for a word's start and end, `q.s(i)` and `q.e(i)` for a sentence's. `edgeIn(t, dur)` is the scene's edge fade.
- **Easing and time** come from `engine/runtime.js`: `e(t, start, dur, ease.fn)`, `prog`, `clamp`, `lerp`, `rng(seed)`. `win(t, a, b, fin, fout)` from `b1b.js` gives a fade-in and fade-out window.

If you need a helper the kit lacks, keep it inside your scene file and list it in your report as a kit candidate. Do not edit `engine/` from a scene.

## Motion

- Every beat lands on a narration word (`cueBook`). Pages slide in with a small arc, picked up and put down, never faded in from nothing.
- One page in focus at a time. A new page pushes the old one off the desk.
- One idea at a time. The previous group leaves before the next arrives: it slides off the desk, gets picked up, or the camera moves on.
- Camera: eased keys with `cameraAt`. Push-ins go up to about ×2.2 to read a line. Yaw orbits stay within 0.4 rad over 4–5 s on 3D beats. 3D beats sit at pitch 0.85–1.0; reading beats at 0.1–0.3.
- Scene edges: `ctx.globalAlpha = edgeIn(t, env.dur)` right after `desk(ctx)`. Segments are hard cuts on the same desk.
- Nothing sits still for more than about a second. A slow drift of the camera counts.

## House rules

- Cards and slabs carry their colour in the outline or a tinted fill, never as a coloured band on one edge. Scene authors keep drifting into a "coloured top edge"; don't.
- No numbered pill badges, no emojis, nothing gamey (no score counters, no health bars, no confetti).
- No company logos in our own diagrams. Label rows and models with the paper's short names.
- No full-screen flat slides. Everything sits on the desk.

## Gotchas

**Finding text**

- `findPhrase` normalises words to `[a-z0-9]`. So `Łukasz` matches as `ukasz` on both sides, and footnote marks (`Vaswani∗`) don't break matches. Page words that normalise to nothing ("·", "=", lone footnote marks) are skipped, so table cells and formula lines match.
- `findPhrase` throws if the phrase is missing. Run stills right after writing `setup()`, before any animation. Check spelling against `paper/text-NN.txt` for that page.
- Tables appear column by column in `words.json`. Find a cell by its text plus its row's y.
- Figures drawn as vector paths (most LaTeX figures) have no words in `words.json`. Find their box once from the page PNG and write it as a constant (`FIG = { x0, y0, x1, y1 }`, page px) in the scene or in `_data.js`.
- Some figures use fonts with shifted glyph codes. Their words are in `words.json` but garbled (in ReAct, "+RWVSRW4$" is "HotpotQA", each character shifted by 29), so `findPhrase` cannot match them. Decode the boxes once, check them against the PNG, and keep them in `_data.js` (see `examples/react/scenes/_data.js`, `FIG1_LINES`).

**Lifting and layout**

- When cropping a line for a lift-off, pad it by about 3 px vertically. More than that picks up the next line's ascenders.
- Lifted strips read best standing up: a `liftPose` target with `tilt` close to the camera pitch faces the camera.
- At pitch 0.9 and above, flat page text can't be read. Lift the quoted line as a strip standing at the back of the desk and run the marker over the strip.
- Slab stacks get tall fast in perspective. 14 px slabs with 3 px gaps read as layers; 22 px slabs read as a stack of books.
- Tall 3D parts hide whatever sits behind them at pitch 0.9. Raise the hidden parts on z, or explode the build into floating layers.
- `inked()` at its default scale of 0.6 goes soft at zoom 2 and above. For ink seen up close, draw straight onto the screen through `onSheet` points.

**TeX**

- `await loadB1B()` in `setup()` before any `tex` or `drawTex`, then warm every TeX string once with `tex(s)` so a typo fails at setup, not mid-render.
- MathJax's TeX fonts have no `§` and no `ß`, and `\boxed{}` loses its frame (only the contents draw). Write "Section 3.2", rephrase, and draw answer boxes yourself.
- Escape `%` as `\%`. Colour part of a label with `{\color{#hex}…}`, keeping the braces; `\color` is a switch.

**The stamp and the end card**

- The `cite()` label has a paper backing slip and follows the scene's edge fade. When a page fills the bottom-right corner, use `side: 'left'`.
- `endCardPose(p)` gives the end card's page pose at progress `p`, so you can highlight the title and authors on it in sync with the voice.

**Sensitive content**

- Harmful text printed in a figure (example answers, dangerous advice) needs a legibility check at full 1920 resolution, not on the contact sheet. Either keep the page far enough back that it prints at 8 px or less, or lift only the safe part (a label row, the one answer the briefing allows) as a standing strip and keep the page out of reading range. Arrivals and pans count too: a page sliding in can sweep the figure across the frame at reading size.
- Third-party figures excluded by the rights decision never appear, not even in a thumbnail or the `cite()` stamp. Crop around them.
