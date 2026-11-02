# Playbook: paper to video

This is the whole procedure for turning one research paper into a narrated folio video. In the folio style the real pages lie on a light desk, a highlighter follows the voice over the line being read, and figures stand up in 3D.

The procedure is tool-neutral. Claude Code runs it through `/paper-to-video`. Codex or any other coding agent can run it by reading this file, and so can a person.

Companion docs:

- `docs/style-folio.md` is the visual language: devices, palette, motion and the kit's gotchas.
- `docs/producer.md` is the brief for the agent that writes the script (steps 2–5).
- `docs/scene-author.md` is the brief for the agents that write scenes (step 6).
- `examples/` holds three complete reference videos (made before the story arc; their segment names follow the older structure, their rigour and craft still set the bar), all CC BY 4.0: ReAct (Yao et al., ICLR 2023), LLaMA (Touvron et al., 2023) and Chain-of-Thought Prompting (Wei et al., NeurIPS 2022). Their `briefing.md`, `narration.md`, `prompts/` and `scenes/` set the bar. ReAct is the one the briefs quote most. LLaMA and Chain-of-Thought show the current full-mode shape (paired prompt files and an author-pair table) and keep the `PAGES` switch in every scene, with `standIn` redraws. When in doubt, match their rigour, tone and shape.

Everything runs from the repo root through `bin/paperframe`. Wherever a command takes `<video>`, it means a slug (`react` → `papers/react/`) or a path (`examples/react`).

## Roles

| Role | Steps | Brief |
|---|---|---|
| Coordinator | 0, 1, 7, 8, 9 | this file |
| Producer | 2, 3, 4, 5 | `docs/producer.md` |
| Scene author | 6, for one to four segments | `docs/scene-author.md` |

One agent can play every role in sequence. Parallel scene authors only make it faster. Scene authors never edit `engine/`, `briefing.md`, `narration.md` or another author's segment. Nobody edits a scene while its author is still working on it.

## The story arc (every video)

A paper is written in a fixed order: someone sees a context, finds a gap in it, poses a hypothesis, builds something to test it, and reports what held and what didn't. The video tells the paper in that same order, so the viewer always knows *why* before *what*. This arc replaced the earlier cover · problem · idea · details · evidence · after structure on 2026-11-02, after the first 19 videos spent too long on details that six minutes can't make relevant.

| # | Segment | The question it answers | Time (full) | What goes on screen |
|---|---|---|---|---|
| 1 | `cover` | What is this paper, and why should I care in one sentence? | 0:25–0:40 | Page 1, the date, the authors; one line read verbatim; the question the paper answers, in plain words. |
| 2 | `context` | What was the world like? Why does this area matter now? | 0:40–0:60 | Our own sheets and diagrams of the setting; the paper's introduction lines that set it up. Sourced: the paper's own framing, or a URL. |
| 3 | `gap` | What was missing, broken or unknown, and why did that matter? | 0:40–0:50 | The paper's own statement of the gap, highlighted; what earlier work did and where it stopped (no long related-work tour: one or two contrasts). |
| 4 | `hypothesis` | What did the authors set out to show, or what question did they ask? | 0:25–0:40 | The hypothesis or research question stated plainly, ideally a line from the paper. |
| 5 | `approach` | What did they build or do that is *different* from what existed? | 1:00–1:40 | The animated centrepiece: the method, the system or the study design, standing up in 3D. Only the parts that make it new. One segment, or two (`approach`, `approach2`) when the method has two genuinely distinct halves. |
| 6 | `findings` | What did they find? | 0:50–1:10 | Two or three headline results, each one number on screen with its context. Not every table. |
| 7 | `limits` | What does it mean, what doesn't it show, and what's next? | 0:50–1:10 | The authors' conclusions, their stated limitations, what the result does *not* claim; then the end card. |

Rules of the arc:
- **Why before what.** A viewer who stops after `hypothesis` should already understand why the paper exists.
- **Differential, not exhaustive.** `approach` animates what is new compared with what existed, not every component. If a detail doesn't change the viewer's understanding of the contribution, it stays out, however good it would look.
- **Few numbers.** At most one number per beat, three or four headline numbers in the whole video.
- **Plain language.** Explain jargon the first time it is used, or avoid it.
- **Limits are part of the story**, not an afterthought. Read them from the paper ("Limitations", "Threats to validity", "Discussion") and say them plainly.
- **Research questions count as the hypothesis.** Measurement and empirical studies often pose research questions instead of a hypothesis: state those (two or three at most) in `hypothesis`, and let `findings` answer them in the same order.
- **Whole-page distance.** For a page with sensitive text, ≤ 0.30 screen px per page px, measured at the sensitive region (perspective makes the near edge larger than the centre): on a 200-dpi page that is roughly pose w ≤ 600 at zoom ≤ 0.8.
- **What counts as a number.** The budget of three or four headline numbers is for narrated numbers. Numbers printed in a figure, or labelling a diagram without being spoken, don't count, but keep them few.
- **Fit the time.** The ranges in the table are guides. Length follows the topic: a paper that needs more context or a longer `approach` gets it, and the video runs past 6:00. What never stretches is detail that doesn't serve the story.
- **`approach2`** shares `approach`'s story sentence (there are still seven), and the 1:00–1:40 guide is for the two halves together; a paper whose method has two genuinely separate parts may run longer.
- **Dual-use papers** (security, attacks, jailbreaks): the video explains the threat to defenders and is never a recipe. No readable malicious code, payloads, prompt-injection text, URLs, domains, IPs, actor or campaign identifiers, or other indicators of compromise. Paint them out on the page with `masked()`, in every scene that loads it (a shared `MASK` table in `_data.js`); a page that still carries sensitive text stays at whole-page distance (≤ 0.30 screen px per page px: at 0.40 names can still be made out on a paused 1920 frame), and its lines are read only on lifted strips. Describe techniques at the level of the paper's taxonomy. End on the constructive part the paper supports (disclosure, fixes, released defences).

## Modes

| | Full | Lite |
|---|---|---|
| Length | about 5–6 min, longer when the topic needs it (Marcel, 2026-11-02: clarity beats a fixed length) | 2:30–3:30 |
| Segments | the 7 of the arc (8 with `approach2`) | 4: `cover` (with context) · `gap` (with hypothesis) · `approach` · `findings` (with limits) |
| Scene authors | up to 4, two segments each | 1, all four segments |
| Agents | producer + up to 4 authors | producer + 1 author |
| Cost | about 2.3M tokens across five agents, measured on one full video | not measured yet; fewer agents and half the segments |

Lite keeps every rigour rule and the same order. It is shorter, not looser.

## The video folder

```
papers/<slug>/
├── briefing.md      paper header, rights, verified facts, guardrails, segment table
├── narration.md     the script: one `## seg` heading per segment
├── prompts/         segment briefs: NN-a_MM-b.md per author pair (full), NN-seg.md (lite)
├── scenes/          NN-seg.js per segment, plus _data.js for shared data
├── paper/           source.pdf, page-NN.png, words.json, text-NN.txt     build output
├── audio/           NN-seg.wav, timings.json                             build output
├── review/          <seg>/contact.png and single stills                  build output
├── render/          NN-seg.mp4                                           build output
└── out/             <slug>.mp4, the finished video                       build output
```

`papers/` is gitignored, so your videos stay local. Build output is regenerable and never committed. A contributed video moves to `examples/<slug>/` with only the four source parts (see `CONTRIBUTING.md`).

Segment names are lowercase single words (`cover`, `problem`, `loop`). `NN` is the segment's position in `narration.md`, two digits. The scene for `## loop`, third in the script, is `scenes/03-loop.js`.

## 0. Check the setup (coordinator)

```sh
bin/paperframe doctor
```

It checks node ≥ 20 (Playwright needs it), python ≥ 3.10, ffmpeg, poppler (`pdftoppm`, `pdftotext`, `pdfinfo`), `engine/node_modules`, Playwright Chromium (by launching it), `.venv` with `kokoro_onnx`, and the Kokoro model files with their exact sizes. It prints what is missing and how to fix it, and exits 1 if anything is. Fix everything before step 1.

## 1. Intake and rights (coordinator)

Input: an arXiv URL, a DOI or a direct PDF link.

1. Find the version to show. If the paper has a published open-access version (journal, TACL, ACL Anthology, Nature), check its licence too. It is often more permissive than the arXiv copy and it is the version of record. On arXiv, pin the version in the PDF URL (`https://arxiv.org/pdf/2210.03629v3`) so the pages never change under the scenes.
2. Read the licence before anything else, as described in the next section. The decision goes into `briefing.md`.
3. Pick a slug: short, kebab-case, from the title (`react`, `lost-in-the-middle`).
4. Create the folder and prepare the paper:

```sh
bin/paperframe new <slug> <pdf-url> [--pages 1-N]
```

`<pdf-url>` can be an arXiv abstract or PDF link, any PDF URL, or a local file. `--pages` defaults to every page. For a long paper, limit it to the main text plus the appendix pages with figures or tables you might show. Running `new` again on an existing slug re-prepares the paper and reuses the downloaded `source.pdf`.

This creates `papers/<slug>/` with the layout above and runs `engine/paper_prep.py`. That script writes `paper/source.pdf`, `page-NN.png` (200 dpi: 1700 × 2200 px for US letter, 1654 × 2339 for A4, 1654 × 2197 for a Nature page), `words.json` (every word with its box in page px, which drives highlights) and `text-NN.txt` (plain text per page, which the briefing is written against). Annotations such as link boxes are hidden in the page images. The PDF is treated as data: only poppler reads it.

## Rights

Whether the real pages may appear in a public video depends on the paper's licence. Settle it at intake and write it down. This section is practical guidance, not legal advice. When a case is unclear, ask the authors or the publisher, or keep the pages off.

**Where to look.** On arXiv, the licence link sits on the abstract page, under the PDF links ("view license"). At publishers, look for a "Rights and permissions" section on the article page. In the PDF itself, check the footer of page 1 and the end matter for a licence notice, and look for credit lines on figures ("reprinted with permission from…").

| Licence | Public video with the real pages | Notes |
|---|---|---|
| CC BY 4.0 | yes | Credit the authors and title, link the source, link the licence, and say that changes were made. Highlights, crops, lifted strips and 3D rebuilds are adaptations. |
| CC0 | yes | Credit anyway; it is good practice and costs nothing. |
| CC BY-SA | yes, with care | An adaptation must be shared under the same licence, so the video itself becomes CC BY-SA. Say so in the description. |
| CC BY-NC, BY-NC-SA | only non-commercial | A monetised channel is likely commercial use. That call belongs to the person publishing. |
| CC BY-ND, BY-NC-ND | treat as no | Highlights and 3D rebuilds over the page are adaptations, which ND does not allow. |
| arXiv non-exclusive licence (the default) | no | It grants rights to arXiv only. Local drafts for your own viewing are fine; a public video needs permission. |
| Publisher copyright, no open licence | no | Same as above. |

**Third-party material inside an open paper is not covered by the paper's licence.** A figure marked "reprinted with permission" from another publication stays out: never put its page on the desk whole, and never lift it. Example: Figure 2 of *Why Language Models Hallucinate* (arXiv:2509.04664, CC BY 4.0) is reprinted from the GPT-4 report, so that video crops the text below the figure and never shows the figure. Photographs in a figure (dataset images, for instance), company logos used as row markers, and quoted text from other sources (Wikipedia is CC BY-SA) need the same thought. Show short excerpts only as part of the paper's page, with the citation on screen, and never rebuild logos in your own diagrams.

**Outside sources.** Later papers, blog posts and project pages that the video mentions (usually in the last segment) are not covered by the paper's licence. They appear as typed cards with their citation (title or author, date, URL), never as their pages, screenshots or logos. A short quote of a few words from a source that isn't CC-licensed is acceptable on such a card, with the citation beside it. When a source's only date is in its URL, the facts table says so.

**What the decision switches.** Every scene keeps all page bitmaps behind one constant at its top:

```js
// Rights: <licence, one line>. false = stand-in pages (grey word bars, same geometry) and redrawn figures.
const PAGES = true;
```

With `PAGES = false`, each page is replaced by `standIn(page)` from `engine/folio.js`: a white sheet with grey bars where the words are, at the same geometry. Highlights, boxes, lift-offs and the source stamp therefore still land in the right places. Figures you need are redrawn, either in place on the stand-in (`standIn(page, { blank, draw })`) or on your own sheets (`blankPage`), labelled as redrawn, with the citation on screen. A video built this way becomes publishable by flipping one flag plus some redraws, or never needs the pages at all. Write scenes with the switch from the start, even for CC BY papers: it costs one line. `examples/llama/` and `examples/chain-of-thought/` do this in every scene, with `standIn` redraws for some of the figures and tables: Table 1 in `llama/scenes/03-data.js` (`blank` plus `draw`), Table 20 in `chain-of-thought/scenes/04-tasks.js`.

**Credit, always.** The source stamp (`cite()`) is on screen whenever paper content is, and the end card carries the full citation. The description carries the credit line, for example:

> Yao, Zhao, Yu, Du, Shafran, Narasimhan, Cao. ReAct: Synergizing Reasoning and Acting in Language Models. ICLR 2023. arXiv:2210.03629. CC BY 4.0, https://creativecommons.org/licenses/by/4.0/. Pages shown with highlights, crops and 3D adaptations.

## 2. Read the paper and write the briefing (producer)

The briefing is written from the paper itself (`paper/text-NN.txt` and the page PNGs), never from memory or from summaries of it. Look at every page image you will use at least once. Full instructions are in `docs/producer.md`. The briefing contains:

- **Paper header**: all authors (or the corporate author and the count), title, version and date shown, venue, URL or DOI.
- **The contribution in one sentence**, in the paper's words where possible. The abstract usually has the line the cover will highlight.
- **Rights**: the licence, where it was checked and on which date, what can be shown publicly, any third-party exclusions, the credit line, and the `PAGES` value.
- **Source files**: which pages were prepared and which are used, plus any figure-text quirks (see `docs/style-folio.md`, gotchas).
- **Verified facts table**: every claim the video makes, mapped to a page, section, table, figure or equation of the paper. Anything from outside the paper gets a URL.
- **Guardrails**: what must not be said or must be said carefully. Inconsistencies inside the paper (use the table, note the other), claims the authors only "suspect", best-vs-best comparisons, what is illustrative, names spelled the way the page spells them.
- **Colour key**: what each colour means in this video. It lives in the briefing or `_data.js`, never only in one prompt.
- **Segment table**: the arc's segments (see The story arc), target duration, pages on the desk, visual centrepiece, and the one-sentence answer each segment gives to its question. In full mode, followed by the author pairs: which two segments each prompt file holds, and what they share.

## 3. Narration (producer)

`narration.md`, spoken English for a smart non-specialist: a busy researcher or engineer.

```markdown
# Narration — <paper title>

Paper video. Style folio. Facts and guardrails: `briefing.md`.

## cover

This is page one of a paper that went up on {arXiv|archive} on October sixth, twenty twenty-two.

(pause 2)

## context
...
```

- One `## seg` heading per segment. The lines before the first `##` are the header; `audio.py` reads optional settings from it (see step 4).
- Numbers spelled out ("sixty point nine"). Acronyms the voice should spell get hyphens in the spoken half.
- Pronunciation overrides: `{Display|spoken}`, for example `{arXiv|archive}`, `{ICLR|I-C-L-R}`, `{ReAct|ree-act}`. The display half is what scenes match cue words against. Punctuation right after an override becomes a word of its own in `timings.json` (`{PaLM|palm},` gives `PaLM` and `,`) and shifts every word index after it. Write the punctuation inside both halves (`{PaLM,|palm,}`), or count it in the prompts.
- A paragraph that is only `(pause N)` inserts N seconds of silence. Use it after the cover, after big 3D reveals, and at the end of the last segment: `(pause 2)` keeps the end card's licence line up long enough to read.
- Short sentences. Each sentence becomes an exact timing anchor, and a beat needs a word to land on. A new sentence starts only where `.`, `!`, `?` or `…` is followed by a capital letter, a quote or `{`. A sentence that opens with a lowercase word ("arXiv") or a digit stays joined to the one before, and loses its anchor.
- About 135 words per minute with Kokoro at the default tempo, counting the gaps between sentences (measured on 2026-11-02; 155 overshoots by a minute on a 6-minute script). Budget the segment table with it.
- The cover: the page and its date, who wrote it, one line from the abstract read verbatim (the highlighter runs over it on the page), and the question the paper answers, in plain words. No impact claims without a source. The rest of the story (context, gap, hypothesis, approach, findings, limits) follows The story arc.
- Quote the paper verbatim only where the line exists on a page that is on screen. Everything else is paraphrase.
- No hype: no "groundbreaking", "revolutionary", "game-changing", "unlock", "leverage", "seamless", "delve". The video explains; it does not sell.

## 4. Audio first (producer)

```sh
bin/paperframe audio <video> [seg …]
```

This runs `engine/audio.py` and writes `audio/NN-seg.wav` and `audio/timings.json`: every sentence with its exact start and end, every word with its start and end, and a per-frame loudness track. Each sentence is synthesised on its own, so sentence starts are exact. Word times inside a sentence are interpolated by character length, which is good to about 0.2 s. Naming segments regenerates only those.

The voice is Kokoro by default: local, free, voice `am_michael`. A `voice: bf_emma` line in the narration header picks another Kokoro voice. ElevenLabs is optional and paid. Set `ELEVENLABS_API_KEY` in the environment (or in a `.env` file at the repo root, which is gitignored), then choose it with a `tts: elevenlabs` header line or `PAPERFRAME_TTS=elevenlabs`. A `voice: <id>` header line pins the ElevenLabs voice. It gives real word alignment instead of interpolation, and caches responses in `audio/.cache` so re-runs cost nothing.

Scenes are animated against these timings, never the reverse. After any narration edit, re-run audio for that segment and re-check every scene that depends on it. Check the printed durations against the segment table, and trim the script if the total runs more than 30 s over target. The total is printed as m:ss and includes the 0.6 s tail each segment holds after its last word; the per-segment durations, here and in `timings.json`, don't. Budget against the total: it is the length of the finished video.

## 5. Segment prompts (producer)

In full mode, one brief per scene author, holding its two segments: `prompts/01-cover_02-problem.md`, as listed in the briefing's author pairs. In lite mode, one brief per segment, `prompts/NN-seg.md`. The shape is in `docs/producer.md`. In short: the pages on the desk, the narration with sentence start times, the exact phrases to highlight (verbatim strings that exist on that page), figure and table boxes in page px, 5–10 beats each keyed to a narration word, and the guardrails for that segment.

Data that several segments share goes in `scenes/_data.js`: palette sampled from the paper's figures, figure boxes, illustrative values. It holds pure data only, consistent across segments, and is checked for internal consistency.

## 6. Scenes (scene authors)

Each segment is one file, `scenes/NN-seg.js`, written against `docs/style-folio.md` and the kit in `engine/folio.js`. The reference scenes are in `examples/react/scenes/`, `examples/llama/scenes/` and `examples/chain-of-thought/scenes/`. ReAct's `01-cover.js` shows the full device set: the page arriving, the highlight with the voice, a lift-off, slabs standing up and the source stamp.

### Scene contract

```js
import { clamp, lerp, e, ease } from '/engine/runtime.js';
import {
  F, loadB1B, tex, desk, edgeIn, loadPaper, findPhrase, cameraAt, sheet, highlight, sayP, cite, cueBook, standIn,
} from '/engine/folio.js';
import { PAL } from './_data.js';

const PAGES = true;   // rights switch, see the playbook
const S = { stamp: '\\text{p. 1}\\;\\cdot\\;\\text{Abstract}' };   // every TeX string, declared once
let p1, L;

export default {
  async setup(env) {            // once: load TeX, load pages, find phrases
    await loadB1B();            // MathJax; tex() and drawTex() throw without it
    Object.values(S).forEach((s) => tex(s));   // warm the cache, so a TeX typo fails here
    const P = await loadPaper(env.ep, [1]);
    p1 = PAGES ? P.page(1) : standIn(P.page(1));
    L = { key: findPhrase(p1, 'generate both reasoning traces and task-specific actions') };
  },
  draw(ctx, t, env) {           // every frame: a pure function of t
    const q = cueBook(env);
    desk(ctx);
    ctx.globalAlpha = edgeIn(t, env.dur);
    const C = cameraAt(t, [{ t: 0, zoom: 0.9 }, { t: q.s(4) - 0.4, dur: 1.2, ty: 470, zoom: 2.1 }]);
    const pose = { x: 960, y: 560, w: 760 };
    sheet(ctx, C, p1, pose);
    highlight(ctx, C, p1, pose, L.key, sayP(env, 4, t));
    cite(ctx, p1, { label: S.stamp, side: 'right' });
  },
};
```

- `env` = `{ timing, dur, ep, R }`. `timing.sentences[i]` has `start`, `end`, `text` and `words` (each `{ w, start, end }`). `dur` is the segment length plus a short tail. `ep` is the video folder path (`papers/<slug>`).
- Import the kit root-absolute (`/engine/folio.js`, `/engine/runtime.js`); `render.mjs` serves the repo root as `/`. Import the video's own data relatively (`./_data.js`), so the folder can move between `papers/` and `examples/` without edits.
- `draw` is a pure function of `t`. Keep no state between frames and seed all randomness (`rng(seed)`). Frames render out of order across parallel workers.
- Every beat lands on a narration word through `cueBook(env)`: `q.w(i, 'word', nth)` is the start of a word in sentence `i`, `q.s(i)` and `q.e(i)` are the sentence's start and end. It throws if the word is missing, which is what you want. Never hard-code seconds.

## 7. Review: stills before video (coordinator and authors)

```sh
bin/paperframe stills <video> <seg> --stills 12        # 12 evenly spaced frames (default 8)
bin/paperframe stills <video> <seg> --at 3.2,7.5,18.4  # exact times, up to 12 per call
bin/paperframe preview <video> <seg>                   # live preview with audio and a scrubber
```

Stills go to `review/<seg>/`, with a `contact.png` sheet. Each call replaces that folder, so an `--at` pass wipes the contact sheet of the pass before; copy it elsewhere first if you need it. Open and look at every contact sheet. Then take `--at` stills at the cue words that matter and at every highlight. A contact sheet is small: check text legibility and harmful-content legibility on the full-size stills, not on the sheet.

Checklist, for every segment:

- The highlighted words are exactly the words the voice is reading at that moment.
- Every number on screen is in the briefing's facts table. Illustrative values carry a small `illustrative` tag.
- The source stamp shows the right page and region, and the label matches (page, section, figure).
- Nothing overlaps or leaves the frame. No on-screen text is under 30 px.
- One idea at a time: the previous group has left before the next one arrives.
- Nothing sits still for more than about a second.
- The paper's colours and terms are used consistently across segments (the cover teaches them).
- Rights: with `PAGES = false` no page bitmap appears anywhere, thumbnails included. Third-party figures never appear.

The coordinator reviews every segment after its author reports, and sends specific fixes back ("02-problem at 14.2 s: the marker reaches 'grounded' 0.4 s before the voice"). Authors iterate until the stills are clean.

## 8. Render and assemble (coordinator)

```sh
bin/paperframe render <video> all --workers 6   # or one segment: render <video> <seg>
bin/paperframe assemble <video>
```

`render` writes `render/NN-seg.mp4`, each with its audio. Workers render disjoint frame ranges in parallel; lower `--workers` on a small machine. `assemble` joins the segments into `out/<slug>.mp4`, normalises loudness to −16 LUFS and prints chapter marks. Watch the whole video once before calling it done, with sound.

## 9. Credits and publish notes (coordinator)

Write `publish.md` in the video folder: a plain title, a description with the full citation, the paper's URL or DOI, the licence name and link, the "changes were made" note, and the chapters printed by `assemble`. Agents never upload or post anything. Publishing is the person's decision, and so is checking the rights decision one last time before it.

## Quality bar

A video is done when:

- every claim traces back to a page of the paper or to a URL in the facts table;
- every quoted line is highlighted on the real page (or on its stand-in) as the voice reads it, never retyped;
- the stills review is clean for every segment;
- the source stamp is on whenever paper content is, and the end card carries the full citation and licence;
- the narration has no hype, no invented numbers, quotes, dates or affiliations, and self-reported results are framed as "the authors report".
