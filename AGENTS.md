# Paperframe

Turns a research paper into a narrated, animated video in the folio style: the real pages on a light desk, a highlighter that follows the voice, figures standing up in 3D.

Instructions for Codex and other coding agents. The procedure lives in tool-neutral markdown; read it before doing anything:

1. `docs/playbook.md`: the whole procedure, roles and quality bar.
2. `docs/style-folio.md`: the visual language and the kit's gotchas.
3. The brief for the role you are playing: `docs/producer.md` (briefing, narration, audio, prompts) or `docs/scene-author.md` (scenes).
4. `examples/react/`: a complete reference video.

Without subagents, play the roles in sequence: coordinator steps 0–1, then producer steps 2–5, then scene author for each segment, then coordinator steps 7–9. In lite mode (4 segments, about 3 minutes) that is one pass.

Run everything from the repo root through `bin/paperframe` (`doctor`, `new`, `audio`, `stills`, `preview`, `render`, `assemble`). Look at every review still you generate. Never commit paper pages, PDFs, audio or rendered video. Users' videos live in `papers/`, which is gitignored.
