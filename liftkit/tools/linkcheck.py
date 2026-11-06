#!/usr/bin/env python3
"""Whole-mockup internal link check.

    python tools/linkcheck.py [concept ...]      # default: both active concepts

Checks every <a href>, <img src>, <link href>, <script src> in mockup/<concept>/**/*.html:
 - relative links must resolve to a file (a directory resolves to its index.html) and, if they carry #fragment, to an id in that file;
 - ANY <a> to the live site host other than a file download (pdf, images, office files, wp-content) is a failure: build.py
   resolves live-site links at build time (mockup page, redirect target, or plain text; see content/unresolved-links.json).
   File-download links are counted and reported.
Exit code 1 when anything is broken or any live-site page link remains.
"""
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse, unquote
from html.parser import HTMLParser

from common import ROOT, CFG, HOSTS

MOCK = ROOT / "mockup"
DEFAULT = CFG["build"]["default_concepts"]
LIVE_HOSTS = tuple(HOSTS)


class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids = [], set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "a" and a.get("name"):
            self.ids.add(a["name"])
        for k in ("href", "src"):
            if a.get(k) and tag in ("a", "img", "link", "script", "source"):
                self.links.append((tag, a[k]))


def parse(f, cache={}):
    if f not in cache:
        p = P()
        p.feed(f.read_text(errors="ignore"))
        cache[f] = p
    return cache[f]


def check(concept):
    base = MOCK / concept
    _ef = ROOT / CFG["modulize"]["excluded_pages_file"]
    excluded = json.loads(_ef.read_text()) if _ef.exists() else {}
    ex_paths = {urlparse(e["url"]).path.strip("/") for g in ("stock_posts", "video_posts", "listings", "other") for e in excluded.get(g, [])}
    built = {str(f.parent.relative_to(base)).strip(".") for f in base.rglob("index.html") if f.is_file()}
    broken, stale, n, files = [], [], 0, 0
    for f in (x for x in base.rglob("*.html") if x.is_file()):
        for tag, href in parse(f).links:
            n += 1
            u = urlparse(href)
            if u.scheme in ("mailto", "tel", "javascript", "data") or href.startswith("#") and not href[1:]:
                continue
            if u.scheme in ("http", "https"):
                if u.hostname in LIVE_HOSTS and tag == "a":
                    p = u.path.strip("/")
                    if re.search(r"\.(pdf|jpe?g|png|gif|docx?|xlsx?|zip|pptx?)$", p, re.I) or "wp-content/" in p:
                        files += 1  # an asset left on the live site on purpose
                    else:
                        stale.append((str(f.relative_to(base)), href))  # any live-site PAGE link fails
                continue
            if u.scheme or u.netloc:
                continue
            target = f if not u.path else (f.parent / unquote(u.path)).resolve()
            if target.is_dir():
                target = target / "index.html"
            if not target.exists():
                broken.append((str(f.relative_to(base)), href, "missing file"))
            elif u.fragment and target.suffix == ".html" and u.fragment not in parse(target).ids:
                broken.append((str(f.relative_to(base)), href, "missing anchor"))
    return n, broken, stale, files


def main():
    bad = 0
    args = [a for a in sys.argv[1:] if not a.startswith("--project")]
    if "--project" in sys.argv:  # drop the value that follows
        i = sys.argv.index("--project") + 1
        args = [a for a in sys.argv[1:i - 1] + sys.argv[i + 1:] if not a.startswith("--project")]
    for c in args or DEFAULT:
        n, broken, stale, files = check(c)
        print(f"{c}: {n} links checked, {len(broken)} broken, {len(stale)} live-site page links, {files} file-download links (left on the live site)")
        for b in broken[:40]:
            print("  BROKEN", *b)
        for s in sorted(set(stale))[:40]:
            print("  LIVE  ", *s)
        bad += len(broken) + len(stale)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
