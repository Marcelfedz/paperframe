# Paperframe

Turns a research paper into a narrated, animated video in the folio style: the real pages on a light desk, a highlighter that follows the voice, figures standing up in 3D.

The procedure lives in tool-neutral markdown. This file only points at it.

- Procedure: @docs/playbook.md
- Visual language: `docs/style-folio.md`
- Role briefs: `docs/producer.md` (script, audio, prompts), `docs/scene-author.md` (scenes)
- Reference video: `examples/react/`
- Entry point in Claude Code: `/paper-to-video <arxiv-or-pdf-url> [--lite]` (`.claude/skills/paper-to-video/`), with the subagents `paper-producer` and `scene-author` (`.claude/agents/`)

Run everything from the repo root through `bin/paperframe` (`doctor`, `new`, `audio`, `stills`, `preview`, `render`, `assemble`). Never commit paper pages, PDFs, audio or rendered video. Users' videos live in `papers/`, which is gitignored.
