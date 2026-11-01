#!/bin/sh
# Paperframe installer. Safe to run again: every step skips what is already done.
#
#   curl -fsSL https://raw.githubusercontent.com/Marcelfedz/paperframe/main/install.sh | sh
#
# Installs into ${PAPERFRAME_HOME:-$HOME/paperframe}. Run as ./install.sh from inside a checkout
# (with PAPERFRAME_HOME unset) and it sets up that checkout instead of cloning a new one.
# It never uses sudo: missing system tools are listed with the command that installs them.
#
# Environment:
#   PAPERFRAME_HOME   where to install (default: $HOME/paperframe)
#   PAPERFRAME_REPO   git URL to clone (default: https://github.com/Marcelfedz/paperframe.git)
#   PAPERFRAME_REF    branch to clone (default: main)

set -eu

REPO="${PAPERFRAME_REPO:-https://github.com/Marcelfedz/paperframe.git}"
REF="${PAPERFRAME_REF:-main}"
MODEL_URL="https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0"
NODE_MIN=20        # Playwright needs Node 20+
PY_MIN_MINOR=10    # Python 3.10+

if [ -t 1 ]; then
  B="$(printf '\033[1m')"; G="$(printf '\033[32m')"; R="$(printf '\033[31m')"; D="$(printf '\033[2m')"; N="$(printf '\033[0m')"
else
  B=''; G=''; R=''; D=''; N=''
fi
step() { printf '\n%s==>%s %s\n' "$B" "$N" "$*"; }
ok()   { printf '  %sok%s    %s\n' "$G" "$N" "$*"; }
info() { printf '  %s%s%s\n' "$D" "$*" "$N"; }
fail() { printf '\n%spaperframe install:%s %s\n' "$R" "$N" "$*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

OS="$(uname -s)"
case "$OS" in
  Darwin) PKG="brew install" ;;
  Linux)  PKG="sudo apt install" ;;
  *)      fail "unsupported system: $OS (macOS and Linux only)" ;;
esac

# ── 1. System tools ──────────────────────────────────────────────────────────
step "Checking system tools"
MISSING=""
FIX=""
want() {  # want <what> <brew package> <apt package>
  MISSING="$MISSING
  - $1"
  if [ "$OS" = Darwin ]; then FIX="$FIX $2"; else FIX="$FIX $3"; fi
}

if have git; then ok "git $(git --version | awk '{print $3}')"; else want "git" git git; fi

if have node; then
  NODE_V="$(node -v | sed 's/^v//')"
  NODE_MAJOR="${NODE_V%%.*}"
  if [ "$NODE_MAJOR" -ge "$NODE_MIN" ] 2>/dev/null; then ok "node $NODE_V"
  else want "node >= $NODE_MIN (found $NODE_V)" node nodejs; fi
else
  want "node >= $NODE_MIN" node nodejs
fi
if have node && ! have npm; then want "npm (ships with node)" node npm; fi

PY=""
for cand in python3 python3.13 python3.12 python3.11 python3.10; do
  if have "$cand" && "$cand" -c "import sys; sys.exit(0 if sys.version_info >= (3, $PY_MIN_MINOR) else 1)" 2>/dev/null; then
    PY="$(command -v "$cand")"
    break
  fi
done
if [ -n "$PY" ]; then
  ok "python $("$PY" -c 'import sys; print("%d.%d.%d" % sys.version_info[:3])') ($PY)"
  if ! have uv && ! "$PY" -c "import venv, ensurepip" >/dev/null 2>&1; then
    want "python venv module (python3-venv)" python python3-venv
  fi
else
  want "python >= 3.$PY_MIN_MINOR" python python3
fi

if have ffmpeg && have ffprobe; then ok "ffmpeg $(ffmpeg -version 2>/dev/null | head -1 | awk '{print $3}')"; else want "ffmpeg" ffmpeg ffmpeg; fi

if have pdftoppm && have pdftotext && have pdfinfo; then ok "poppler (pdftoppm, pdftotext, pdfinfo)"; else want "poppler (pdftoppm, pdftotext, pdfinfo)" poppler poppler-utils; fi

if have curl; then :; else want "curl" curl curl; fi

if [ -n "$MISSING" ]; then
  PKGS="$(printf '%s\n' $FIX | awk '!seen[$0]++' | tr '\n' ' ' | sed 's/ $//')"
  printf '\n%sMissing:%s%s\n\nInstall them with:\n\n  %s%s %s%s\n\n' "$R" "$N" "$MISSING" "$B" "$PKG" "$PKGS" "$N"
  if [ "$OS" = Darwin ] && ! have brew; then info "Homebrew itself: https://brew.sh"; fi
  if [ "$OS" = Linux ]; then info "On Fedora or Arch, use dnf or pacman with the same package names (poppler-utils is 'poppler' there)."; fi
  if printf '%s' "$MISSING" | grep -q node; then info "Node 20+ is also available from https://nodejs.org or nvm."; fi
  printf 'Then run this installer again.\n'
  exit 1
fi

# ── 2. The repo ──────────────────────────────────────────────────────────────
step "Getting Paperframe"
DEST=""
if [ -z "${PAPERFRAME_HOME:-}" ]; then
  case "$0" in
    */install.sh | install.sh)
      here="$(cd "$(dirname "$0")" && pwd)"
      if [ -x "$here/bin/paperframe" ] && [ -d "$here/engine" ]; then DEST="$here"; fi ;;
  esac
fi

if [ -n "$DEST" ]; then
  ok "using this checkout: $DEST"
else
  DEST="${PAPERFRAME_HOME:-$HOME/paperframe}"
  if [ -d "$DEST/.git" ]; then
    info "updating $DEST"
    if git -C "$DEST" pull --ff-only --quiet; then ok "up to date: $DEST"
    else info "could not fast-forward (local changes?); keeping your copy as it is"; fi
  elif [ -e "$DEST" ] && [ -n "$(ls -A "$DEST" 2>/dev/null)" ]; then
    fail "$DEST exists and is not a git checkout. Move it away, or set PAPERFRAME_HOME to another folder."
  else
    git clone --quiet --depth 1 --branch "$REF" "$REPO" "$DEST" || fail "git clone $REPO failed"
    ok "cloned into $DEST"
  fi
fi
cd "$DEST"
[ -x bin/paperframe ] && [ -d engine ] || fail "$DEST does not look like a Paperframe checkout (no bin/paperframe or engine/)"

# ── 3. Node dependencies and Chromium ────────────────────────────────────────
step "Installing the render engine (npm, Playwright Chromium)"
(cd engine && npm install --no-audit --no-fund --loglevel=error) || fail "npm install failed in $DEST/engine"
ok "engine/node_modules"
(cd engine && npx --yes playwright install chromium) || fail "Playwright could not download Chromium (cd $DEST/engine && npx playwright install chromium)"
ok "Playwright Chromium"

# ── 4. Python environment ────────────────────────────────────────────────────
step "Setting up Python (.venv, Kokoro TTS)"
if [ -x .venv/bin/python ] && ! .venv/bin/python -c "import sys; sys.exit(0 if sys.version_info >= (3, $PY_MIN_MINOR) else 1)" 2>/dev/null; then
  info ".venv is broken or too old; recreating it"
  rm -rf .venv
fi
venv_pip() {
  [ -x .venv/bin/python ] || "$PY" -m venv .venv || fail "$PY -m venv .venv failed (on Debian/Ubuntu: sudo apt install python3-venv)"
  .venv/bin/python -m pip install --quiet --disable-pip-version-check -r requirements.txt || fail "pip install -r requirements.txt failed"
}
if have uv; then
  if { [ -x .venv/bin/python ] || uv venv --quiet --python "$PY" .venv; } && uv pip install --quiet --python .venv/bin/python -r requirements.txt; then :
  else
    info "uv did not manage; falling back to python -m venv and pip"
    [ -x .venv/bin/python ] && .venv/bin/python -m pip --version >/dev/null 2>&1 || rm -rf .venv
    venv_pip
  fi
else
  venv_pip
fi
ok ".venv with $(.venv/bin/python -c 'import kokoro_onnx, sys; print("kokoro_onnx on python %d.%d" % sys.version_info[:2])' 2>/dev/null || echo 'requirements installed')"

# ── 5. Kokoro voice model ────────────────────────────────────────────────────
step "Downloading the Kokoro voice model (about 350 MB, once)"
mkdir -p models/kokoro
fetch() {  # fetch <file> <expected bytes>
  f="models/kokoro/$1"
  if [ -f "$f" ] && [ "$(wc -c < "$f" | tr -d ' ')" = "$2" ]; then ok "$f (already there)"; return 0; fi
  info "$MODEL_URL/$1"
  if [ -t 2 ]; then bar="--progress-bar"; else bar="-sS"; fi
  curl -fL --retry 3 "$bar" -o "$f.part" "$MODEL_URL/$1" || { rm -f "$f.part"; fail "download failed: $MODEL_URL/$1"; }
  got="$(wc -c < "$f.part" | tr -d ' ')"
  [ "$got" = "$2" ] || { rm -f "$f.part"; fail "$1: got $got bytes, expected $2. Run the installer again."; }
  mv "$f.part" "$f"
  ok "$f"
}
fetch kokoro-v1.0.onnx 325532387
fetch voices-v1.0.bin 28214398

# ── 6. Check ─────────────────────────────────────────────────────────────────
step "Checking the install"
if bin/paperframe doctor; then
  printf '\n%sPaperframe is ready.%s Next:\n\n' "$G" "$N"
  printf '  cd %s && claude\n' "$DEST"
  printf '  /paper-to-video https://arxiv.org/abs/<id>          full video, about 5 minutes\n'
  printf '  /paper-to-video https://arxiv.org/abs/<id> --lite   about 3 minutes, much cheaper\n\n'
  printf 'Without Claude Code: read %s/docs/playbook.md and run bin/paperframe by hand.\n' "$DEST"
else
  printf '\nSome checks failed; the lines marked MISS above say how to fix each one. Then run this installer again.\n'
  exit 1
fi
