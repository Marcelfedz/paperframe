#!/usr/bin/env python3
"""Prepare a research paper for a folio-style video.

    python3 engine/paper_prep.py <video-dir> <pdf-url-or-path> [--pages 1-N] [--dpi 200]
    (or: bin/paperframe new <slug> <pdf-url> [--pages 1-N])

Writes into <video-dir>/paper/:
    source.pdf            the paper (downloaded once, kept for re-runs)
    page-01.png …         rendered pages (poppler pdftoppm, annotations such as link boxes hidden)
    words.json            per page: size in px at that dpi + every word with its box in px,
                          so scenes can highlight real phrases (engine/folio.js → findPhrase)
    text-01.txt …         plain text per page, for writing the briefing against the paper itself

--pages defaults to every page of the PDF. An arXiv abstract URL (arxiv.org/abs/<id>) is
fetched as its PDF. Needs poppler (pdftoppm, pdftotext, pdfinfo; macOS: brew install poppler,
Debian/Ubuntu: apt install poppler-utils). The PDF is treated as data: only poppler reads it.
Standard library only, so any python3 ≥ 3.8 runs it.
"""
import json
import re
import subprocess
import sys
import urllib.request
from html import unescape
from pathlib import Path


def arg(flag, default):
    if flag in sys.argv:
        return sys.argv[sys.argv.index(flag) + 1]
    return default


def page_count(pdf):
    info = subprocess.run(['pdfinfo', str(pdf)], check=True, capture_output=True, text=True).stdout
    m = re.search(r'^Pages:\s+(\d+)', info, re.M)
    if not m:
        sys.exit(f'pdfinfo could not read the page count of {pdf}')
    return int(m.group(1))


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    out = Path(sys.argv[1]) / 'paper'
    src = sys.argv[2]
    dpi = int(arg('--dpi', '200'))
    out.mkdir(parents=True, exist_ok=True)

    pdf = out / 'source.pdf'
    if not pdf.exists():
        if re.match(r'https?://', src):
            # arxiv.org/abs/<id>[vN] → arxiv.org/pdf/<id>[vN]
            src = re.sub(r'^(https?://(?:www\.|export\.)?arxiv\.org)/abs/', r'\1/pdf/', src)
            req = urllib.request.Request(src, headers={'User-Agent': 'paperframe paper_prep (+https://github.com/Marcelfedz/paperframe)'})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
        else:
            data = Path(src).read_bytes()
        if not data.startswith(b'%PDF'):
            sys.exit(f'{src} did not return a PDF (got {data[:40]!r}…). Pass the PDF link, not the landing page.')
        pdf.write_bytes(data)

    if '--pages' in sys.argv:
        first, last = (int(x) for x in arg('--pages', '1-1').split('-'))
    else:
        first, last = 1, page_count(pdf)

    subprocess.run(['pdftoppm', '-png', '-hide-annotations', '-r', str(dpi), '-f', str(first), '-l', str(last), str(pdf), str(out / 'page')], check=True)
    # pdftoppm pads page numbers by the document's page count; normalise to page-NN.png
    for p in out.glob('page-*.png'):
        n = int(p.stem.split('-')[1])
        p.rename(out / f'page-{n:02d}.png')

    scale = dpi / 72
    html = subprocess.run(['pdftotext', '-bbox', '-f', str(first), '-l', str(last), str(pdf), '-'],
                          check=True, capture_output=True, text=True).stdout
    pages = []
    for i, m in enumerate(re.finditer(r'<page width="([\d.]+)" height="([\d.]+)">(.*?)</page>', html, re.S)):
        words = [
            {'w': unescape(w), 'x0': round(float(a) * scale, 1), 'y0': round(float(b) * scale, 1),
             'x1': round(float(c) * scale, 1), 'y1': round(float(d) * scale, 1)}
            for a, b, c, d, w in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>', m.group(3))
        ]
        pages.append({'page': first + i, 'w': round(float(m.group(1)) * scale), 'h': round(float(m.group(2)) * scale), 'words': words})
    (out / 'words.json').write_text(json.dumps({'dpi': dpi, 'pages': pages}))

    for n in range(first, last + 1):
        txt = subprocess.run(['pdftotext', '-layout', '-f', str(n), '-l', str(n), str(pdf), '-'],
                             check=True, capture_output=True, text=True).stdout
        (out / f'text-{n:02d}.txt').write_text(txt)

    print(f'{out}: pages {first}-{last} at {dpi} dpi, {sum(len(p["words"]) for p in pages)} words')


if __name__ == '__main__':
    main()
