# Producer brief

You prepare one paper video up to the point where scene authors can start: the briefing, the narration, the audio, the segment prompts and the shared data. You don't write scenes.

The coordinator gives you the slug (`papers/<slug>/`, already created by `bin/paperframe new`), the paper URL, and the mode: full or lite.

## Read first

1. `docs/playbook.md`, the whole procedure. Steps 2–5 and the Rights section are yours.
2. `docs/style-folio.md`, so you know what the format looks like and can do: pages on a desk, the marker following the voice over the real line, lift-offs, figures standing up in 3D, our own diagrams on paper sheets, a source stamp.
3. The reference videos in `examples/`: `briefing.md`, `narration.md` and every file in `prompts/`. Start with `examples/react/`, then look at `examples/llama/` or `examples/chain-of-thought/` for the full-mode shape: paired prompt files, the author-pair table in the briefing, and a `PAGES` switch with `standIn` redraws. Match their rigour, tone and shape.

## Output, in `papers/<slug>/`

### 1. `paper/`

`bin/paperframe new` has already run paper prep, for every page unless the coordinator limited the range. If you need pages outside the range (an appendix figure, say), re-run it with a wider range: `bin/paperframe new <slug> <pdf-url> --pages 1-N`. It re-prepares the paper in place and reuses the downloaded `source.pdf`. Look at every page PNG you will use, and note the box of each figure and table you plan to show. Check the PNG size: at 200 dpi, US letter is 1700 × 2200 px, A4 1654 × 2339 and a Nature page 1654 × 2197. Write the size in the briefing and at the top of `_data.js`, since every box depends on it.

### 2. `briefing.md`

Same structure as `examples/react/briefing.md`:

- **Paper header.** Authors (all of them, or the corporate author and the count), title, version and date of the copy you show, venue, URL or DOI.
- **The contribution in one sentence**, in the paper's words. Quote the line the cover will highlight.
- **Rights.** The licence, where you read it (the arXiv abstract page, the publisher's "Rights and permissions" section, the PDF's page-1 footer) and on which date. Then what can be shown publicly, any third-party material excluded (figures "reprinted with permission", photographs, logos), the full credit line for the end card and the description, and the value of the `PAGES` switch for the scenes. Follow the playbook's Rights section; when the licence does not allow public pages, say `PAGES = false` for a public version and name which figures need redrawing.
- **Source files.** Which pages were prepared, which are used, and any quirks: garbled figure fonts, figures with no words in `words.json`, a version mismatch between arXiv and the published copy.
- **Verified facts table.** Two columns, claim and where. Every claim the video will make maps to a page, section, table, figure or equation of the paper. Anything from outside the paper (venue awards, what came after) gets a URL you have actually opened. When the only date of an outside source is in its URL (a blog path such as `/2023/03/13/`), say so in the table.
- **Guardrails.** What must not be said, or must be said carefully:
  - inconsistencies inside the paper (a number that differs between the abstract and a table): follow the table, note the other in the guardrails, and say nothing about it on screen. Keep the conflicting sentence off screen too: no highlight, no push-in. When it sits next to a line you need, the scene lifts that line from a `masked()` copy of the page with the sentence painted out;
  - hedged claims ("the authors suspect", footnotes that speculate);
  - best-vs-best and other comparisons that need their context on screen (show the average next to the best);
  - "first" claims and adoption claims (avoid them unless the paper and a source both support them);
  - outside sources (later papers, blog posts, project pages): typed cards with their citation, never their pages, following the playbook's Rights section;
  - what is illustrative, and must be labelled so;
  - names and terms as the page spells them, and the paper's own typos (don't repeat them on screen);
  - sensitive figure content (harmful example outputs) and how scenes keep it unreadable.
- **Colour key.** What each colour means in this video: the paper's own figure colours and what they stand for, the marker colours, and what marks a loss or a struck phrase. It goes here or in `_data.js` next to `PAL`, never only in one prompt: every author needs it, not only the one writing the cover.
- **Segment table.** Follow The story arc in `docs/playbook.md`: `cover` · `context` · `gap` · `hypothesis` · `approach` (+ `approach2` only if the method has two distinct halves) · `findings` · `limits`. For each segment: target duration, pages on the desk, the visual centrepiece, and **the one-sentence answer** to that segment's question (what context, which gap, which hypothesis, what is new, which two or three results, which limits). Write those seven sentences first: if they don't read as a clear story on their own, the video won't either.
  - Full mode: 7–8 segments, 4:30–6:00 in total.
  - Lite mode: 4 segments, 2:30–3:30: `cover` (with context) · `gap` (with hypothesis) · `approach` · `findings` (with limits).
  - The centrepiece is `approach`: plan its 3D or diagram build around what is *different* from earlier work. Every other segment gets one simple visual, not a showcase.
  - Cut ruthlessly. A detail stays only if it changes the viewer's understanding of why the paper exists, what is new, what it found, or where it stops.
- **Author pairs** (full mode). A table under the segment table: prompt file, its two segments, and what they share (pages, `_data.js` blocks). Pair segments that share pages or data. See the end of `examples/chain-of-thought/briefing.md`.

### 3. `narration.md`

Follow the playbook, step 3. Write spoken English for a smart non-specialist: a busy researcher or engineer. Be concrete and use short sentences. Spell numbers out, and add `{Display|spoken}` overrides for names and acronyms.

The cover: the page and its date, who wrote it, one line from the abstract read verbatim (highlighted on the page with the voice), and the question the paper answers, in plain words. Then the story follows the arc in order, and every segment opens by saying, in one plain sentence, which question it answers ("So what was missing?", "What did they build?"). Impact claims ("it changed the field") need a source like any other claim; without one, leave them out. Quote the paper verbatim only where the line exists on a page that is on screen. Put `(pause N)` after a beat that needs room: the end of the cover, the `approach` reveal. The header lines before the first `##` follow the reference.

Context and gap carry the "why": take them from the paper's introduction and its own statement of the problem, not from your memory of the field. Limits come from the paper's limitations or discussion section; say them plainly, and add what the result does *not* claim when the paper is careful about it.

The last segment ends on the citation, read as the end card appears: title, first author "and colleagues", venue and year. End it with a `(pause 2)` paragraph, so the end card's licence line stays up long enough to read.

### 4. Audio

```sh
bin/paperframe audio <slug>
```

Kokoro, default voice. Check the per-segment durations it prints against your targets. The total line (m:ss) adds the 0.6 s tail each segment holds after its last word; the per-segment durations, and the ones in `timings.json`, don't. Budget against the total. If it runs more than 30 s over target, trim the script and re-run the segments you changed. Durations decide the beats, so finish this before writing prompts.

### 5. `prompts/` and `scenes/_data.js`

In full mode, write one file per scene author, two segments each (`prompts/01-cover_02-problem.md`), following the author-pair table in the briefing. In lite mode, one author takes all four segments; one file per segment (`prompts/NN-seg.md`) is fine. Each segment in a file gets the same shape as `examples/react/prompts/01-cover.md`; `examples/llama/prompts/` shows the paired form:

- **Title line**: number, name and duration, plus what the segment is about in a few words.
- **Setup**: the scene file to write, the shared data to import (`import { PAL, FIG1 } from './_data.js'`), and the pages on the desk.
- **Colours.** Point at the colour key in the briefing or `_data.js`. The prompt of the segment that teaches the colours (usually the cover) says how it teaches them.
- **Narration table**: sentence index, start time from `audio/timings.json`, and the text. Pauses as their own row. Take word indices (`w5`) from `timings.json`, not by counting words in the script: punctuation right after a `{Display|spoken}` override is its own word there (playbook, step 3).
- **Beats**: 5–10 of them, each keyed to a sentence and word ("s4, on 'interleaved' (w9)"). For each beat say what is on screen, what moves, which phrase is highlighted in which colour, what lifts off or stands up, and what the stamp says. Be visual and concrete.
- **Exact phrases to highlight**: verbatim strings that exist on that page in `paper/text-NN.txt`. Check each one against `words.json` the way `findPhrase` matches it, since it throws on a miss; extraction order and tokenisation quirks are in the gotchas of `docs/style-folio.md`. Say which marker colour each one gets: yellow for a verbatim quote read by the voice, mint for a paraphrase or a name.
- **Boxes**: figure and table boxes in page px when you know them, especially for vector figures, which have no words.
- **Real and illustrative**: which numbers are real (with their source in the facts table) and which are illustrative (labelled on screen).
- **Guardrails** for that segment, copied from the briefing where they apply. Add the TeX limits: escape `%`, no `§`, no `\boxed{}`. Write stamp labels the way the scene will (`\text{p.~4}\;\cdot\;\text{Table 3}`); authors copy them, and a bare `p.~4` renders an italic p.

Data that several segments share goes in `scenes/_data.js`: the palette sampled from the paper's figures (with the colour key as comments, if the briefing doesn't hold it), figure and table boxes, decoded figure-text boxes, illustrative datasets. Keep it to pure data (`export const …`), consistent across segments, and check it for internal consistency: printed against plotted values, the same number in two places, sums. Label each block REAL or ILLUSTRATIVE in a comment.

## Rules

- Facts come from the paper itself: open `paper/text-NN.txt` and the page PNGs. Never work from memory or from summaries. External claims need a URL in the facts table.
- If a number appears differently in two places in the paper, use the table or figure and note the difference in the guardrails.
- No invented numbers, quotes, dates or affiliations. Write "the authors report" for self-reported results.
- Register: direct and specific. No hype words (groundbreaking, revolutionary, game-changing, unlock, leverage, seamless, delve). The video explains; it doesn't sell.
- Don't edit `engine/`, other videos, or anything outside `papers/<slug>/`.

## Final message

A short report to the coordinator:

- the total duration and each segment's duration;
- the cover's verbatim line, and the page it is on;
- the visual centrepiece planned for each segment;
- the rights decision and the `PAGES` value;
- the split of segments into author pairs (full mode), grouping segments that share pages or data;
- anything you couldn't verify, or that the person making the video should decide.
