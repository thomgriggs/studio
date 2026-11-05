#!/usr/bin/env python3
"""Polite, resumable crawler. Usage: crawl.py [--refresh] [--limit N] [--sitemaps-only]"""
import argparse, json, re, sys, time, urllib.request, urllib.error
from urllib.parse import urljoin
from common import *

UA = "content-inventory-bot/1.0"
DELAY = 1.0

def fetch(url, retries=4):
    """Return (status, final_url, body_bytes, redirect_chain). Manual redirects."""
    class NoRedir(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **k): return None
    opener = urllib.request.build_opener(NoRedir)
    chain, cur = [], url
    for _ in range(8):
        last_err = None
        for attempt in range(retries):
            try:
                req = urllib.request.Request(cur, headers={"User-Agent": UA, "Accept": "text/html,application/xml,*/*"})
                try:
                    r = opener.open(req, timeout=30)
                    return r.status, cur, r.read(), chain
                except urllib.error.HTTPError as e:
                    if e.code in (301, 302, 303, 307, 308):
                        loc = e.headers.get("Location")
                        chain.append((e.code, cur))
                        cur = urljoin(cur, loc); last_err = None; break
                    if e.code in (429, 500, 502, 503, 504) and attempt < retries - 1:
                        time.sleep(2 ** (attempt + 1)); continue
                    return e.code, cur, e.read(), chain
            except Exception as ex:
                last_err = ex
                time.sleep(2 ** (attempt + 1))
        else:
            raise last_err
        if last_err is None and chain and chain[-1][1] != cur:
            time.sleep(DELAY); continue
    raise RuntimeError("too many redirects")

def sitemap_urls():
    SITEMAPS.mkdir(parents=True, exist_ok=True)
    out = {}
    def load(u):
        st, _, body, _ = fetch(u)
        (SITEMAPS / re.sub(r"[^A-Za-z0-9.]+", "_", u.split("//")[1])).write_bytes(body)
        time.sleep(DELAY)
        return st, body.decode("utf-8", "replace")
    tried = False
    for idx in ("https://dvaughnlaw.com/sitemap_index.xml", "https://dvaughnlaw.com/sitemap.xml", "https://dvaughnlaw.com/wp-sitemap.xml"):
        try:
            st, txt = load(idx)
        except Exception as e:
            print("sitemap fail", idx, e); continue
        if st != 200 or "<loc>" not in txt: continue
        locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", txt)
        if "<sitemapindex" in txt:
            for sm in locs:
                if not is_site(sm): continue
                st2, t2 = load(sm)
                for u in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", t2):
                    if is_site(u): out[u] = sm.rsplit("/", 1)[-1]
        else:
            for u in locs:
                if is_site(u): out[u] = idx.rsplit("/", 1)[-1]
        break
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true")
    ap.add_argument("--limit", type=int)
    ap.add_argument("--sitemaps-only", action="store_true")
    a = ap.parse_args()
    seed = [r["URL"].strip() for r in read_seed()]
    sm = sitemap_urls()
    seedset, smset = set(seed), set(sm)
    norm = lambda u: u if u.endswith("/") or "?" in u else u + "/"
    seed_n = {norm(u) for u in seed}; sm_n = {norm(u): s for u, s in sm.items()}
    only_sm = sorted(set(sm_n) - seed_n); only_csv = sorted(seed_n - set(sm_n))
    urls = list(dict.fromkeys(seed + [u for u in only_sm]))
    URLLIST.write_text(json.dumps({"urls": urls, "sitemap_count": len(sm_n), "in_sitemap_not_csv": [{"url": u, "sitemap": sm_n[u]} for u in only_sm], "in_csv_not_sitemap": only_csv}, indent=1))
    print(f"urls={len(urls)} sitemap={len(sm_n)} only_sitemap={len(only_sm)} only_csv={len(only_csv)}")
    if a.sitemaps_only: return
    RAW.mkdir(parents=True, exist_ok=True)
    log = json.loads(LOG.read_text()) if LOG.exists() else {}
    n = 0
    for u in urls:
        s = slug_for(u); f = RAW / f"{s}.html"
        if f.exists() and u in log and not a.refresh: continue
        if a.limit and n >= a.limit: break
        n += 1
        try:
            st, final, body, chain = fetch(u)
            if body: f.write_bytes(body)
            log[u] = {"slug": s, "status": chain[0][0] if chain else st, "final_status": st,
                      "redirected_to": final if final != u else None, "error": None,
                      "fetched": time.strftime("%Y-%m-%d")}
            print(u, log[u]["status"], st, final if final != u else "")
        except Exception as e:
            log[u] = {"slug": s, "status": None, "final_status": None, "redirected_to": None, "error": str(e)}
            print("FAIL", u, e)
        LOG.write_text(json.dumps(log, indent=1))
        time.sleep(DELAY)
    print("done; fetched this run:", n)

if __name__ == "__main__":
    main()
