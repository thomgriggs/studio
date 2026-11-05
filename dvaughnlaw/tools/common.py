import csv, re
from pathlib import Path
from urllib.parse import urlparse
ROOT = Path(__file__).resolve().parent.parent
SEED = ROOT / "content" / "dvaughnlaw-current-seo.csv"
RAW = ROOT / "site" / "raw"
SITEMAPS = ROOT / "site" / "sitemaps"
LOG = ROOT / "site" / "crawl-log.json"
URLLIST = ROOT / "site" / "url-list.json"
HOST = "dvaughnlaw.com"

def slug_for(url):
    p = urlparse(url)
    path = p.path.strip("/")
    s = path.replace("/", "__") or "home"
    if p.query:
        s += "--" + re.sub(r"[^A-Za-z0-9]+", "-", p.query).strip("-")
    return s

def is_site(url):
    h = (urlparse(url).hostname or "").lower()
    return h in (HOST, "www." + HOST)

def read_seed():
    with open(SEED, newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))
