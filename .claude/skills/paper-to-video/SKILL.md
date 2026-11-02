---
name: paper-to-video
description: Turn a research paper (arXiv URL, DOI or PDF link) into a narrated folio-style video, with the real pages on a light desk, a highlighter that follows the voice and figures standing up in 3D. Coordinates the paper-producer and scene-author subagents, reviews stills, renders and assembles. Every video follows the story arc: context, gap, hypothesis, what is new (animated), findings, limits. Add --lite for a shorter, cheaper video of 4 segments and about 3 minutes.
argument-hint: <arxiv-or-pdf-url> [--lite]
disable-model-invocation: true
allowed-tools: Bash(bin/paperframe *)
---

# Paper to video

Arguments: `$ARGUMENTS`. The first is the paper: an arXiv abstract or PDF URL, a DOI or a direct PDF link. `--lite` anywhere selects lite mode.

You are the **coordinator**. The procedure is `docs/playbook.md` (already in context through `CLAUDE.md`; re-read it if not). You run steps 0–1 and 7–9. The `paper-producer` subagent runs steps 2–5, and `scene-author` subagents run step 6. Don't write the briefing, the narration or the scenes yourself while a subagent owns them.

## Cost, said up front

A full video measured about 2.3M tokens across five agents (one producer and four scene authors, 8 segments, 2026-11-01). Lite mode runs one producer and one author on 4 segments. It has not been measured yet; the estimate is well under half of a full run. On a Pro plan, suggest `--lite`: a full run can hit the usage limit midway. Every stage writes to disk, so an interrupted run resumes where it stopped (see Resume).

Before starting the producer (step 2), tell the user in two lines: the paper, the mode, the cost figure above, and the rights decision. Then continue without waiting, unless the rights decision needs their input.

## Steps

### 0. Doctor

```sh
bin/paperframe doctor
```

If it exits 1, show the user what is missing and the fix it printed, and stop.

### 1. Intake

1. Resolve the paper. For arXiv, open the abstract page (`https://arxiv.org/abs/<id>`) and note the latest version, the title and the licence link. Use a versioned PDF URL (`https://arxiv.org/pdf/<id>vN`). For a DOI, open the publisher page and look for an open-access PDF and a "Rights and permissions" section. If the paper has an open-access published version, prefer it when its licence is more permissive.
2. Rights decision, following the Rights section of the playbook: whether the real pages can appear in a public video, and the `PAGES` value. State it to the user in one line. If the licence does not allow public pages, say that the video will use stand-in pages and redrawn figures (`PAGES = false`), or that it can be made with real pages for local viewing only. Ask which they want only if they haven't said.
3. Slug: short, kebab-case, from the title. If `papers/<slug>/` already exists, go to Resume.
4. Run `bin/paperframe new <slug> <pdf-url>`. It accepts the arXiv abstract URL and prepares every page by default. For a very long paper (40+ pages), add `--pages 1-N` to cover the main text plus the appendix pages with figures or tables worth showing.

### 2. Producer (playbook steps 2–5)

Start one `paper-producer` subagent (Agent tool, `subagent_type: paper-producer`). Give it:

- the slug, the paper URL, the PDF URL and the version;
- the mode: full (the story arc in `docs/playbook.md`: cover · context · gap · hypothesis · approach (+ approach2 when the method has two separate halves) · findings · limits; usually 5–6 min, longer when the topic needs it) or lite (exactly 4 segments, cover · gap · approach · findings, 2:30–3:30);
- what you found about the licence, with URLs.

When it reports, check before going on:

- the segment table opens with the seven one-sentence story answers (context, gap, hypothesis, what is new, findings, limits) and they read as a clear story on their own;
- `briefing.md` has a Rights paragraph and a verified facts table, and, for a dual-use paper (security, attacks), a `MASK` table in `_data.js`;
- the cover's verbatim line exists on its page (`grep` it in `paper/text-NN.txt`);
- `audio/timings.json` exists, and the total duration fits the story (usually 5–6 min; longer is fine when the topic needs it, padding is not);
- there is one prompt for every segment.

Send it back with specific fixes if any check fails.

### 3. Scene authors (playbook step 6)

- **Full:** split the segments into pairs, keeping together segments that share pages or data (the producer's report suggests the pairs). Start up to 4 `scene-author` subagents **in one message**, so they run in parallel.
- **Lite:** start one `scene-author` with all four segments.

Give each author: the slug, its segments as `NN-seg`, its prompt files, the `PAGES` value, and "write scenes and review stills; don't render video".

### 4. Review (playbook step 7)

For every segment, after its author reports:

```sh
bin/paperframe stills <slug> <seg> --stills 12
bin/paperframe stills <slug> <seg> --at <times of the key cue words and highlights>
```

Open every `review/<seg>/contact.png` and the full-size stills, and check them against the playbook's checklist. Above all, check that the highlight matches the voice, that numbers match the facts table, that the stamp is right, and that nothing is under 30 px, overlapping or off-frame. For fixes, continue the same author (SendMessage, when available) or start a new `scene-author` with the file and a precise fix list ("at 14.2 s the marker is 0.4 s ahead of 'grounded'"). Repeat until every segment is clean.

### 5. Render and assemble (playbook step 8)

```sh
bin/paperframe render <slug> all
bin/paperframe assemble <slug>
```

If the machine struggles, use `--workers 2`. `assemble` prints the output path and the chapters.

### 6. Credits and handover (playbook step 9)

Write `papers/<slug>/publish.md`: title, a description with the full citation, the paper URL or DOI, the licence name and link, the note "pages shown with highlights, crops and 3D adaptations", and the chapters.

Report to the user:

- the video path and duration;
- the chapters;
- the credit line;
- whether the video may be published with the real pages, or is local-only or rights-off;
- anything the producer or the authors flagged as unverified.

Never upload or post anything.

## Resume

If `papers/<slug>/` exists, work out where it stopped and continue from there:

| State on disk | Next |
|---|---|
| no `briefing.md` or no `audio/timings.json` | producer (it continues from what exists) |
| prompts present, scenes missing | scene authors for the missing segments |
| all scenes present | review |
| `render/` complete | assemble |

## Rules

- Facts come from the paper, checked against its pages; the producer's facts table is the authority for every number on screen.
- No hype words in anything you write.
- Don't edit `engine/`. Kit candidates the authors report go in your final message, as suggestions for the kit.
