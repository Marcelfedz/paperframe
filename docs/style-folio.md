# Visual language: folio

The paper itself is the set. Its real pages lie on a light desk. The narration reads a line and the highlighter runs over that line on the page. Pieces of the page lift off as paper copies and turn into diagrams, and figures stand up in 3D. Everything on screen can be traced back to a page.

The format's whole point is that it is not a dark presenter stage. It is a light desk with the real pages and our animations on paper.

Kit: `engine/folio.js` (it re-exports `engine/b1b.js`, the TeX renderer). Paper prep: `engine/paper_prep.py`. Reference scenes: `examples/react/scenes/`, `examples/llama/scenes/` and `examples/chain-of-thought/scenes/`.

## Canvas and palette

- 1920 × 1080, 30 fps. `desk(ctx)` draws the light desk: warm off-white, a soft pool of light, static grain. Call it first in every frame. Pages are pure white with a soft contact shadow. There is no dark variant; if a paper ever needs one, it becomes a `desk()` option, not a separate kit.
- `F` is the palette. Use `F.ink` (with `F.ink2`, `F.ink3`) for type and outlines. The accents are saturated enough to read on white: `F.blue`, `F.teal`, `F.red`, `F.gold`, `F.purple`, `F.green`, `F.orange`, `F.pink`.
- Highlighters are multiplied over the print, so the text shows through. `F.hlYellow` marks the key line read verbatim, `F.hlMint` names, tasks and paraphrased lines, `F.hlBlue` the paper's own coinage, and `F.hlPink` is spare.
- For architecture blocks there are figure pastels sampled from the Transformer paper's Figure 1: `F.attn`, `F.ffn`, `F.norm`, `F.embed`, `F.linear`, `F.soft`, `F.block`. When a paper has its own figure colours, sample them into `_data.js` and keep them. The 3D rebuild should look like the paper's figure grown up.
- Colour meaning is fixed inside a video. Red means struck out or "the thing that changed"; blue means the paper's own term. The cover is where the viewer learns the colours, and every later segment keeps them. When a paper's own figures give red another meaning (in the LLaMA example it is the 65B model), that meaning wins for the whole video: strike out in `F.ink` instead. The colour key lives in the briefing or `_data.js`, so every author sees it.
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
- **Rights.** `standIn(page, { blank, draw })` returns a stand-in sheet: grey word bars at the same geometry, no bitmap. Words inside the `blank` rects are left out, so `draw(g)` can redraw a figure or typeset a table in their place, in page px. `masked(page, rects)` paints regions such as logos out of a real page. `mipsOf(canvas)` builds the mip chain `sheet()` expects on any page-like object you build. See the playbook's Rights section for the `PAGES` switch. Every scene in `examples/llama/` and `examples/chain-of-thought/` has the switch, and several carry `standIn` redraws (`typesetT1` in `llama/scenes/03-data.js`, `t20Redraw` in `chain-of-thought/scenes/04-tasks.js`).
- **Cues.** `cueBook(env)`: `q.w(i, 'word', nth)` and `q.we(i, 'word', nth)` for a word's start and end, `q.s(i)` and `q.e(i)` for a sentence's. `edgeIn(t, dur)` is the scene's edge fade.
- **Easing and time** come from `engine/runtime.js`: `e(t, start, dur, ease.fn)`, `prog`, `clamp`, `lerp`, `rng(seed)`. `win(t, a, b, fin, fout)` from `b1b.js` gives a fade-in and fade-out window.

If you need a helper the kit lacks, keep it inside your scene file and list it in your report as a kit candidate. Do not edit `engine/` from a scene.

## Motion

- Every beat lands on a narration word (`cueBook`). Pages slide in with a small arc, picked up and put down, never faded in from nothing.
- One page in focus at a time. A new page pushes the old one off the desk.
- One idea at a time. The previous group leaves before the next arrives: it slides off the desk, gets picked up, or the camera moves on.
- Camera: eased keys with `cameraAt`. Push-ins go up to about ×2.2 to read a line, and stop before the page text goes soft (see Gotchas, camera and 3D). Yaw orbits stay within 0.4 rad over 4–5 s on 3D beats. 3D beats sit at pitch 0.85–1.0; reading beats at 0.1–0.3.
- Scene edges: `ctx.globalAlpha = edgeIn(t, env.dur)` right after `desk(ctx)`. Segments are hard cuts on the same desk.
- Nothing sits still for more than about a second. A slow drift of the camera counts.

## House rules

- Cards and slabs carry their colour in the outline or a tinted fill, never as a coloured band on one edge. Scene authors keep drifting into a "coloured top edge"; don't.
- No numbered pill badges, no emojis, nothing gamey (no score counters, no health bars, no confetti).
- No company logos in our own diagrams. Label rows and models with the paper's short names.
- No full-screen flat slides. Everything sits on the desk.

## Gotchas

- **Running heads.** Most papers repeat the title or a short title at the top of every page after p. 1, so `findPhrase(page, '<name>')` matches the running head first. Use `nth` or a longer phrase.
- **Small caps** split words into tokens (`A LLOW`, `B LOCK`); match them as separate words. A phrase that crosses a page break can't be matched in one call: highlight the two halves on their own pages.
- **Small vector figures** (a panel a few hundred page px wide) can't be pushed in without going soft. Keep the crop as a blueprint and build the close-up on a `blankPage` of our own.
- **Overrides that end a sentence:** keep the period outside (`{PIN|pin}.`). `{PIN.|pin.} The…` doesn't start a new sentence in `audio.py`, because the character before the space is `}`.
- **Pronunciation check** before writing overrides: `.venv/bin/python -c "from kokoro_onnx.tokenizer import Tokenizer; print(Tokenizer().phonemize('GPT-5.6-Terra', 'en-us'))"` shows whether Kokoro already says a name right.

**Finding text**

- `findPhrase` normalises words to `[a-z0-9]`. So `Łukasz` matches as `ukasz` on both sides, and footnote marks (`Vaswani∗`) don't break matches. Page words that normalise to nothing ("·", "=", lone footnote marks) are skipped, so table cells and formula lines match.
- `findPhrase` throws if the phrase is missing. Run stills right after writing `setup()`, before any animation. Check spelling against `paper/text-NN.txt` for that page. When a phrase that is plainly on the page still throws, print the words around it from `words.json`: the cause is usually one of the quirks below.
- `words.json` follows the PDF's extraction order, not reading order, and `findPhrase` returns the first match in that order:
  - section numbers drift. They can come after the heading text, or after a figure's legend and axis labels (in the chain-of-thought example, "3.4" on p. 6 and "5" on p. 8);
  - a body column that sits beside a figure caption is interleaved with the caption line by line, so a phrase that crosses a line break there doesn't match;
  - a short phrase such as `Table 1:` can hit an in-text reference before it reaches the caption.

  Match a phrase that only the caption has, pass `nth`, split the phrase into one per line, or leave the section number out.
- Tokens are not always words:
  - subscripts split a word: "tCO2eq" is `tCO 2 eq`;
  - line-break hyphens stay inside the word: `avail- able`, `chain- of-thought`;
  - em dashes glue words together: `thought—a` is one word;
  - pdftotext reads ⟨ and ⟩ as letters, so "⟨input," comes through as `hinput,`;
  - arXiv's vertical side stamp on p. 1 is a single word box. Box it with `markBox`; don't highlight it.
- Tables appear column by column in `words.json`. Find a cell by its text plus its row's y.
- Figures drawn as vector paths (most LaTeX figures) have no words in `words.json`. Find their box once from the page PNG and write it as a constant (`FIG = { x0, y0, x1, y1 }`, page px) in the scene or in `_data.js`.
- Matplotlib figures are real text, but legend words have tall boxes, so a highlight on one legend entry bleeds into the next. Trim the line boxes before highlighting, or use `markBox`.
- Some figures use fonts with shifted glyph codes. Their words are in `words.json` but garbled (in ReAct, "+RWVSRW4$" is "HotpotQA", each character shifted by 29), so `findPhrase` cannot match them. Decode the boxes once, check them against the PNG, and keep them in `_data.js` (see `examples/react/scenes/_data.js`, `FIG1_LINES`).
- Page size depends on the paper. At 200 dpi, US letter is 1700 × 2200 px, A4 1654 × 2339, and a Nature page 1654 × 2197. Boxes measured on one size don't carry over to another.

**Markers and marks**

- When the paper already has coloured highlights (Figure 1 of the chain-of-thought paper), a multiply marker changes their colour: yellow over blue reads green. Follow the voice there with an ink underline (a `highlight` over the bottom 3 px of each line, `alpha: 1`) or an ink outline traced with `markBox`.
- When the narration says a page's words in a different order from the page, one sweep can't follow the voice. Split the marker into one phrase per spoken chunk, each on its own `sayWords` window.
- `cite()` draws its region box in `F.red`, and `markBox` defaults to `F.red`. When red has a meaning in the video, pass `color: F.ink` to `markBox`.
- `masked()` pads every rect by 8 px, which suits a logo. To cut text out of a crop, pass `{ pad: 0 }` or `{ pad: 1 }`, or the mask eats the neighbouring lines.
- To keep a region out of view while a page moves (a sentence the briefing keeps off screen), slide the page in under a covering sheet and keep the frame edge on the cover until the page has landed. When the page never needs that region, a `masked()` copy is simpler.

**Lifting and layout**

- When cropping a line for a lift-off, pad it by about 3 px vertically. More than that picks up the next line's ascenders.
- A pose's `(x, y)` is the centre of its flat footprint. `tilt` stands the sheet up about its bottom edge, which stays at `y + h/2`, where `h` = `w` × crop height / crop width. To stand a strip on a line of the desk, set `y` to that line minus `h/2`.
- `liftPose` returns a pose that carries `src` (the crop), but the `to` pose you pass doesn't. Once the strip has landed, keep drawing `liftPose(…, 1)` or `{ ...to, src: rect }`: drawing `to` alone renders the whole page.
- `liftPose` reads the start from `from` on every frame. When the page itself is moving, pass its pose frozen at the moment of the lift, or the strip follows the page.
- A strip can be lifted from a page that is off the desk: invent its `from` pose, where the page would lie, and lift from there.
- Lifted strips read best standing up: a `liftPose` target with `tilt` close to the camera pitch faces the camera. A standing strip still casts the shadow of its flat footprint, so lower `sheet()`'s `shadow` to 0.15–0.35.
- At pitch 0.85 and above, flat page text can't be read. Lift the quoted line as a strip standing at the back of the desk and run the marker over the strip.
- Slab stacks get tall fast in perspective. 14 px slabs with 3 px gaps read as layers; 22 px slabs read as a stack of books.
- Tall 3D parts hide whatever sits behind them at pitch 0.9. Raise the hidden parts on z, or explode the build into floating layers.
- `inked()` at its default scale of 0.6 goes soft at zoom 2 and above. For ink seen up close, draw straight onto the screen through `onSheet` points.

**Camera and 3D**

- Push-ins: page text stays crisp up to about 1.3 screen px per page px. Above that the 200-dpi bitmap is upscaled and goes soft. Screen px per page px is `C.p(x, y, z).k × pose.w / page.w` (with a crop, its width instead of `page.w`).
- Bar charts: use a long lens, `dist` 4000–8000, so tall bars stay upright instead of splaying. `camAt` eases `dist` like every other field, so a key that changes it changes the perspective during the move.
- Draw value labels and size labels in one pass after all the bars, so a bar in front never cuts a label behind it. Put values on white `tag` slips.
- Rows that recede (bar groups, standing cards one behind another): the front face of a row shows above the row in front only if dy·cos(pitch) ≥ h·sin(pitch) + d·cos(pitch), where dy is the distance between the two rows' front faces, h the height of the row in front and d its depth. Spread the rows or lower the pitch until it holds.
- `tag()` draws in screen px. It can sit at a projected point, but it keeps its size when the camera pushes in or pulls back. A label that belongs to an object goes on the object, as a card or a slip in world space (a `blankPage` sheet), so it scales and moves with it.

**TeX**

- `await loadB1B()` in `setup()` before any `tex` or `drawTex`, then warm every TeX string once with `tex(s)` so a typo fails at setup, not mid-render.
- MathJax's TeX fonts have no `§` and no `ß`, and `\boxed{}` loses its frame (only the contents draw). Write "Section 3.2", rephrase, and draw answer boxes yourself.
- Escape `%` as `\%`. Colour part of a label with `{\color{#hex}…}`, keeping the braces; `\color` is a switch.
- Write stamp labels in text mode: `'\\text{p.~4}\\;\\cdot\\;\\text{Table 3}'`. A bare `p.~4` is math mode and renders an italic p.
- Names with diacritics: b1b currently misplaces accents (a grave draws too tall and offset). Until the engine is fixed, use a fallback that avoids them, such as "Touvron et al. (14 authors)".

**The stamp and the end card**

- The `cite()` label has a paper backing slip and follows the scene's edge fade. When a page fills the bottom-right corner, use `side: 'left'`.
- `endCardPose(p)` gives the end card's page pose at progress `p`, so you can highlight the title and authors on it in sync with the voice.

**Sensitive content**

- Harmful text printed in a figure (example answers, dangerous advice) needs a legibility check at full 1920 resolution, not on the contact sheet. Either keep the page far enough back that it prints at 8 px or less, or lift only the safe part (a label row, the one answer the briefing allows) as a standing strip and keep the page out of reading range. Arrivals and pans count too: a page sliding in can sweep the figure across the frame at reading size.
- Third-party figures excluded by the rights decision never appear, not even in a thumbnail or the `cite()` stamp. Crop around them.
