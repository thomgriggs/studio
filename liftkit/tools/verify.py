#!/usr/bin/env python3
"""Coverage check: words visible in raw main region vs words in extracted blocks."""
import json, re, sys
from collections import Counter
from bs4 import BeautifulSoup
from common import *
SEL = CFG["selectors"]
from extract import hidden, load_soup, norm, plain, block_words
def words(t): return Counter(re.findall(r"[a-z0-9]+", t.lower()))
def btxt(b):
    t = b["type"]
    if t in ("ul", "ol"):
        out=[]
        def w(items):
            for i in items: out.append(i["text"]); [w(k["items"]) for k in i["children"]]
        w(b["items"]); return " ".join(out)
    if t == "table": return " ".join(c for r in b["rows"] for c in r)
    if t == "a": return b["text"]
    return b.get("text", "")
rows = []
for jf in sorted((PAGES).glob("*.json")):
    d = json.load(open(jf)); f = RAW / f"{d['slug']}.html"
    if not f.exists(): continue
    s = load_soup(f, d)
    m = pick(s, SEL["main"])
    if not m: continue
    sb = pick(m, SEL["sidebar"])
    if sb: sb.decompose()
    for x in m.find_all(["script","style","noscript","template","svg","form"]): x.decompose()
    for x in m.find_all(True):
        if x.decomposed if hasattr(x,'decomposed') else False: continue
    for x in list(m.find_all(True)):
        try:
            if hidden(x): x.decompose()
        except Exception: pass
    raw = words(m.get_text(" "))
    got = words(" ".join(plain(btxt(b)) for b in d["blocks"] if b["region"]=="main"))
    miss = raw - got
    tot = sum(raw.values()) or 1
    rows.append((sum(miss.values())/tot, d["slug"], sum(raw.values()), sum(miss.values()), list(miss.items())[:12]))
rows.sort(reverse=True)
for r in rows[:next((int(x) for x in sys.argv[1:] if x.isdigit()), 15)]: print(f"{r[0]:.1%} {r[1]} raw={r[2]} miss={r[3]} {r[4]}")
print("pages checked", len(rows), "pages >2% missing:", sum(1 for r in rows if r[0]>0.02))
