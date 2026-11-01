#!/usr/bin/env python3
"""
Narration -> per-segment WAVs + sentence/word timings (audio first: scenes are
animated against these timings, never the other way round).

  .venv/bin/python engine/audio.py <video-dir> [seg ...]      (or: bin/paperframe audio <video> [seg ...])

Reads  <video>/narration.md   one `## <segName>` heading per segment, prose below.
       Pronunciation override inline: {Display|spoken}  e.g. {ReAct|ree-act}.
       A paragraph that is only `(pause N)` inserts N seconds of silence (think time).
Writes <video>/audio/NN-<seg>.wav and <video>/audio/timings.json.

Each sentence is synthesised separately, so sentence starts are exact (no
alignment model needed). Word times inside a sentence are interpolated by
character length (good to ~0.2 s, enough to land a visual on a keyword).
Passing segment names regenerates only those; the rest keep their timings.

TTS engines
  kokoro      (default) local, free. Weights in models/kokoro/ at the repo root
              (kokoro-v1.0.onnx + voices-v1.0.bin, installed by install.sh).
              Voice am_michael unless narration.md's header pins one (`voice: bf_emma`).
  elevenlabs  optional, paid. Chosen by `--tts elevenlabs`, a `tts: elevenlabs` line in
              narration.md's header, or PAPERFRAME_TTS=elevenlabs in the environment
              (precedence in that order). Needs ELEVENLABS_API_KEY in the environment or
              in a .env file at the repo root (gitignored). Optional: ELEVENLABS_VOICE_ID,
              ELEVENLABS_MODEL; header lines `voice: <id>`, `speed: 0.7-1.2`, `model: <id>`,
              `lang: <code>`. Uses the with-timestamps endpoint, so word times come from real
              character alignment, and passes previous/next sentence text for continuous
              prosody. Raw responses are cached in <video>/audio/.cache, so re-runs cost no
              credits. `audio.py --check` tests the key with one sentence and writes nothing.
"""

import base64
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
MODELS = ROOT / "models" / "kokoro"   # ~340 MB of weights, gitignored; install.sh downloads them
VOICE = "am_michael"    # default Kokoro voice (American English, male)
SPEED = 1.0
ATEMPO = 1.1            # Kokoro reads slowly; 1.1x lands near 155 words per minute
SENT_GAP = 0.22         # seconds between sentences (pre-atempo)
PARA_GAP = 0.45         # seconds between paragraphs (pre-atempo)
TAIL = 0.6              # silence the scene holds after the last word
OVERRIDE = re.compile(r"\{([^|}]+)\|([^}]+)\}")
PAUSE = re.compile(r"^\(pause\s+([\d.]+)\)$")

def _load_dotenv():
    """<repo>/.env → os.environ (only keys not already set, empty values ignored)"""
    f = ROOT / ".env"
    if not f.exists():
        return
    for ln in f.read_text().splitlines():
        ln = ln.strip()
        if not ln or ln.startswith("#") or "=" not in ln:
            continue
        k, v = ln.split("=", 1)
        v = v.strip().strip('"').strip("'")
        if v and not os.environ.get(k.strip()):
            os.environ[k.strip()] = v


_load_dotenv()
EL_VOICE = os.environ.get("ELEVENLABS_VOICE_ID") or "JBFqnCBsd6RMkjVDRZzb"   # "George": warm, measured narrator
EL_MODEL = os.environ.get("ELEVENLABS_MODEL") or "eleven_multilingual_v2"
EL_SR = 44100
EL_SPEED = None      # `speed:` header line (ElevenLabs voice_settings.speed); None = API default 1.0
EL_LANG = None       # `lang: ca` header line → language_code (eleven_v3 needs it for Catalan; multilingual_v2 has no Catalan)
CACHE_DIR = None      # set per video in main(): <video>/audio/.cache (raw API responses, so re-runs cost no credits)
ENGINE = os.environ.get("PAPERFRAME_TTS") or "kokoro"
KOKORO_VOICE = VOICE


class KokoroTTS:
    atempo = ATEMPO

    def __init__(self):
        try:
            from kokoro_onnx import Kokoro
        except ImportError:
            sys.exit("kokoro_onnx is not installed: run engine/audio.py with the repo's .venv/bin/python "
                     "(create it with ./install.sh, or: python3 -m venv .venv && .venv/bin/pip install -r requirements.txt)")
        onnx, voices = MODELS / "kokoro-v1.0.onnx", MODELS / "voices-v1.0.bin"
        missing = [str(f.relative_to(ROOT)) for f in (onnx, voices) if not f.exists()]
        if missing:
            sys.exit(f"Kokoro weights missing: {', '.join(missing)}. Run ./install.sh, or download them from "
                     "https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 into models/kokoro/")
        self.k = Kokoro(str(onnx), str(voices))

    def synth(self, text, prev="", nxt=""):
        samples, sr = self.k.create(text, voice=KOKORO_VOICE, speed=SPEED, lang="en-us")
        return samples.astype(np.float32), sr, None


class ElevenTTS:
    """ElevenLabs with-timestamps: returns audio + per-character start times (seconds)."""
    atempo = 1.0

    def __init__(self):
        self.key = os.environ.get("ELEVENLABS_API_KEY")
        if not self.key:
            sys.exit("ELEVENLABS_API_KEY is not set (export it, or put it in a .env file at the repo root)")

    def synth(self, text, prev="", nxt=""):
        import hashlib
        if EL_MODEL == "eleven_v3":   # v3 rejects previous_text/next_text (HTTP 400 unsupported_model)
            prev = nxt = ""
        key = hashlib.sha1(json.dumps([text, prev, nxt, EL_VOICE, EL_MODEL] + ([EL_SPEED] if EL_SPEED else [])
                                      + ([EL_LANG] if EL_LANG else [])).encode()).hexdigest()[:16]
        cache = CACHE_DIR / f"{key}.json" if CACHE_DIR else None
        if cache and cache.exists():
            return self._decode(json.loads(cache.read_text()))
        body = {"text": text, "model_id": EL_MODEL, "language_code": EL_LANG,
                "previous_text": prev or None, "next_text": nxt or None,
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": True,
                                   **({"speed": EL_SPEED} if EL_SPEED else {})}}
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{EL_VOICE}/with-timestamps?output_format=mp3_44100_128",
            data=json.dumps({k: v for k, v in body.items() if v is not None}).encode(),
            headers={"xi-api-key": self.key, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                d = json.loads(r.read())
        except urllib.error.HTTPError as e:
            sys.exit(f"ElevenLabs HTTP {e.code}: {e.read()[:300].decode(errors='replace')}")
        if cache:
            cache.parent.mkdir(parents=True, exist_ok=True)
            cache.write_text(json.dumps(d))
        return self._decode(d)

    def _decode(self, d):
        mp3 = base64.b64decode(d["audio_base64"])
        pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "pipe:0", "-f", "f32le", "-ac", "1", "-ar", str(EL_SR), "pipe:1"],
                             input=mp3, capture_output=True, check=True).stdout
        al = d.get("alignment") or {}
        x = np.frombuffer(pcm, dtype=np.float32).copy()
        # ElevenLabs pads clips with up to ~1.2 s of trailing silence. Trim it, but never into the last word:
        # soft endings (-s, breathy vowels) sit below 0.01 — the old 0.01 cut clipped "tu máquina." by 0.38 s —
        # so cut 100 ms after the signal drops below 0.004 for good, then fade so sentence joins don't click.
        # (The alignment's last end time overshoots the audio by ~0.4 s, so it is no use as a floor.)
        idx = np.where(np.abs(x) > 0.004)[0]
        if len(idx):
            x = x[: min(len(x), idx[-1] + int(0.10 * EL_SR))]
        fi, fo = min(len(x), int(0.005 * EL_SR)), min(len(x), int(0.03 * EL_SR))
        x[:fi] *= np.linspace(0, 1, fi, dtype=np.float32)
        x[len(x) - fo:] *= np.linspace(1, 0, fo, dtype=np.float32)
        return x, EL_SR, list(zip(al.get("characters", []), al.get("character_start_times_seconds", [])))


def word_spans(sent):
    """display words of a raw sentence, each with its (start, end) char span in the spoken string"""
    out, spoken, pos = [], "", 0
    for m in list(OVERRIDE.finditer(sent)) + [None]:
        plain = sent[pos:m.start()] if m else sent[pos:]
        for w in re.finditer(r"\S+", plain):
            a = len(spoken) + w.start()
            out.append((w.group(), a, a + len(w.group())))
        spoken += plain
        if m:
            a = len(spoken)
            spoken += m.group(2)
            for dw in m.group(1).split():
                out.append((dw, a, len(spoken)))
            pos = m.end()
    return out, spoken


def parse(md: str):
    segs, cur = [], None
    for line in md.splitlines():
        m = re.match(r"^##\s+(\w+)\s*$", line)
        if m:
            cur = {"name": m.group(1), "paras": [], "buf": []}
            segs.append(cur)
        elif cur is not None:
            if line.strip():
                cur["buf"].append(line.strip())
            elif cur["buf"]:
                cur["paras"].append(" ".join(cur["buf"]))
                cur["buf"] = []
    for s in segs:
        if s["buf"]:
            s["paras"].append(" ".join(s.pop("buf")))
        s.pop("buf", None)
    return segs


def sentences(para: str):
    # a new sentence also starts at «¿», «¡», «« or an accented capital (Spanish); before 2026-10-20 those merged
    # into the previous sentence
    return [s for s in re.split(r"(?<=[.!?…»])\s+(?=[A-ZÁÉÍÓÚÜÑ¿¡«\"'{])", para) if s.strip()]


def display(s): return OVERRIDE.sub(lambda m: m.group(1), s)
def spoken(s): return OVERRIDE.sub(lambda m: m.group(2), s)


def rms(path: Path, fps: int = 30):
    """per-frame loudness 0..1 (normalised to the segment's 95th percentile) — drives mouths, meters, pulses"""
    data, sr = sf.read(path, dtype="float32")
    if data.ndim > 1:
        data = data.mean(axis=1)
    hop = sr // fps
    n = len(data) // hop
    v = np.sqrt(np.mean(data[: n * hop].reshape(n, hop) ** 2, axis=1))
    ref = np.percentile(v, 95) or 1.0
    return [round(float(min(1.0, x / ref)), 3) for x in v]


def check():
    """one short sentence through ElevenLabs; reports status without printing the key"""
    k = os.environ.get("ELEVENLABS_API_KEY", "")
    print(f"key: {'set' if k else 'MISSING'} ({len(k)} chars) · voice {EL_VOICE} · model {EL_MODEL}")
    samples, sr, align = ElevenTTS().synth("This is a test of the narration voice.")
    print(f"OK: {len(samples) / sr:.2f}s of audio, {len(align)} aligned characters")


def main():
    if "--check" in sys.argv:
        return check()
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    global ENGINE
    args = sys.argv[1:]
    if "--tts" in args:
        i = args.index("--tts"); ENGINE = args[i + 1]; del args[i:i + 2]
    ep = Path(args[0]).resolve()
    only = set(args[1:])
    if not (ep / "narration.md").exists():
        sys.exit(f"no narration.md in {ep}")
    md = (ep / "narration.md").read_text()
    m = re.search(r"^tts:\s*(\w+)\s*$", md.split("\n## ", 1)[0], re.M)
    if m and "--tts" not in sys.argv:
        ENGINE = m.group(1)
    global EL_VOICE, KOKORO_VOICE
    mv = re.search(r"^voice:\s*([\w:-]+)\s*$", md.split("\n## ", 1)[0], re.M)   # pins the voice per video (Kokoro name or ElevenLabs id)
    if mv:
        if ENGINE == "elevenlabs":
            EL_VOICE = mv.group(1)
        else:
            KOKORO_VOICE = mv.group(1)
    global EL_SPEED
    ms = re.search(r"^speed:\s*([\d.]+)\s*$", md.split("\n## ", 1)[0], re.M)
    if ms:
        EL_SPEED = float(ms.group(1))
    global EL_MODEL, EL_LANG
    mm = re.search(r"^model:\s*(\w+)\s*$", md.split("\n## ", 1)[0], re.M)   # e.g. eleven_v3 for Catalan
    if mm:
        EL_MODEL = mm.group(1)
    ml = re.search(r"^lang:\s*(\w+)\s*$", md.split("\n## ", 1)[0], re.M)
    if ml:
        EL_LANG = ml.group(1)
    segs = parse(md)
    unknown = only - {s["name"] for s in segs}
    if unknown:
        sys.exit(f"no segment {', '.join(sorted(unknown))} in narration.md (segments: {', '.join(s['name'] for s in segs)})")
    global CACHE_DIR
    CACHE_DIR = ep / "audio" / ".cache"
    out = ep / "audio"
    out.mkdir(exist_ok=True)
    tpath = out / "timings.json"
    prev = {s["name"]: s for s in json.loads(tpath.read_text())["segments"]} if tpath.exists() else {}

    if ENGINE not in ("kokoro", "elevenlabs"):
        sys.exit(f"unknown TTS engine {ENGINE!r} (kokoro or elevenlabs)")
    tts = ElevenTTS() if ENGINE == "elevenlabs" else KokoroTTS()
    AT = tts.atempo
    result = []
    for i, seg in enumerate(segs, 1):
        name = seg["name"]
        fname = f"{i:02d}-{name}.wav"
        if only and name not in only:   # not asked for: keep its previous timings, never synthesize it
            if name in prev:
                result.append({**prev[name], "file": fname})
            continue
        chunks, sents, cursor, sr = [], [], 0.0, 24000
        flat = [(pi, s_) for pi, para in enumerate(seg["paras"]) if not PAUSE.match(para.strip()) for s_ in sentences(para)]
        k = 0
        for pi, para in enumerate(seg["paras"]):
            pm = PAUSE.match(para.strip())
            if pm:      # silence measured post-atempo, so the scene gets exactly N seconds
                n = float(pm.group(1)) * AT
                chunks.append(np.zeros(int(n * sr), dtype=np.float32))
                cursor += n
                continue
            for si, sent in enumerate(sentences(para)):
                prev_t = spoken(flat[k - 1][1]) if k > 0 else ""
                next_t = spoken(flat[k + 1][1]) if k + 1 < len(flat) else ""
                k += 1
                samples, sr_new, align = tts.synth(spoken(sent), prev_t, next_t)
                if sr_new != sr and chunks:
                    sys.exit("sample rate changed mid-segment")
                sr = sr_new
                if sents:
                    gap = PARA_GAP if si == 0 else SENT_GAP
                    chunks.append(np.zeros(int(gap * sr), dtype=np.float32))
                    cursor += gap
                d = len(samples) / sr
                shown = display(sent)
                spans, spk = word_spans(sent)
                wt = []
                if align and len(align) >= len(spk.strip()) * 0.8:
                    starts = [t for _, t in align]
                    at = lambda c: starts[min(c, len(starts) - 1)]
                    for j, (w, a, b) in enumerate(spans):
                        ws = cursor + at(a)
                        we = cursor + (at(spans[j + 1][1]) if j + 1 < len(spans) else d)
                        wt.append({"w": w, "start": ws / AT, "end": we / AT})
                else:
                    weights = [len(w) + 1 for w, _, _ in spans]
                    total, acc = sum(weights), 0.0
                    for (w, _, _), kk in zip(spans, weights):
                        ws = cursor + d * acc / total
                        acc += kk
                        wt.append({"w": w, "start": ws / AT, "end": (cursor + d * acc / total) / AT})
                sents.append({"text": shown, "para": pi, "start": cursor / AT, "end": (cursor + d) / AT, "words": wt})
                chunks.append(samples.astype(np.float32))
                cursor += d
        raw = out / f".{fname}.raw.wav"
        sf.write(raw, np.concatenate(chunks), sr, subtype="PCM_16")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af", f"atempo={AT}", "-ar", "48000", str(out / fname)], check=True)
        raw.unlink()
        dur = float(subprocess.run(["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", str(out / fname)],
                                   capture_output=True, text=True).stdout)
        for s in sents:
            s["start"], s["end"] = round(s["start"], 3), round(s["end"], 3)
            for w in s["words"]:
                w["start"], w["end"] = round(w["start"], 3), round(w["end"], 3)
        result.append({"name": name, "file": fname, "duration": round(dur, 3), "sentences": sents, "rms": rms(out / fname)})
        words = sum(len(s["words"]) for s in sents)
        print(f"  {fname:28s} {dur:6.1f}s  {len(sents):2d} sentences  {words:4d} words")

    tpath.write_text(json.dumps({"fps": 30, "tail": TAIL, "tts": ENGINE, "voice": EL_VOICE if ENGINE == "elevenlabs" else KOKORO_VOICE, "atempo": AT, "segments": result}, indent=1))
    total = sum(s["duration"] + TAIL for s in result)
    shown = tpath.relative_to(ROOT) if tpath.is_relative_to(ROOT) else tpath
    m, s = divmod(round(total), 60)
    print(f"  total {total:.1f}s ({m}:{s:02d}, with {TAIL} s tail per segment) -> {shown}")


if __name__ == "__main__":
    main()
