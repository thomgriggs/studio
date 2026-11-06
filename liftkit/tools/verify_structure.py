#!/usr/bin/env python3
"""Structure check: heading/list/link/image counts in raw main region vs extracted blocks."""
import json, sys
from bs4 import BeautifulSoup
from common import *
SEL = CFG["selectors"]
from extract import hidden, load_soup
def count_items(items):
    return sum(1 + sum(count_items(k["items"]) for k in i["children"]) for i in items)
bad = 0
for jf in sorted((PAGES).glob("*.json")):
    d = json.load(open(jf)); f = RAW / f"{d['slug']}.html"
    if not f.exists(): continue
    s = load_soup(f, d)
    m = pick(s, SEL["main"])
    if not m: continue
    sb = pick(m, SEL["sidebar"])
    if sb: sb.decompose()
    for x in list(m.find_all(["script","style","noscript","template","svg","form"])): x.decompose()
    for x in list(m.find_all(True)):
        try:
            if hidden(x): x.decompose()
        except Exception: pass
    raw = {f"h{n}": len(m.find_all(f"h{n}")) for n in range(1,7)}
    raw["li"] = len(m.find_all("li")); raw["img"] = len([i for i in m.find_all("img")])
    bl = [b for b in d["blocks"] if b["region"] == "main"]
    got = {f"h{n}": sum(1 for b in bl if b["type"] == f"h{n}") for n in range(1,7)}
    got["li"] = sum(count_items(b["items"]) for b in bl if b["type"] in ("ul","ol"))
    got["img"] = sum(1 for b in bl if b["type"] == "img" and b["source"] == "img")
    diff = {k: (raw[k], got[k]) for k in raw if raw[k] != got[k]}
    if diff: bad += 1; print(d["slug"], diff)
print("pages with structural count differences:", bad)
