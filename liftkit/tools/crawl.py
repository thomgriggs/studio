#!/usr/bin/env python3
"""Polite, resumable crawler (Liftkit part 1).

    crawl.py --project <dir> [--refresh] [--limit N] [--sitemaps-only] [--retry-failed]

URL list = seed CSV (urls.seed_csv) + urls.extra + every URL in the sitemaps. Raw HTML -> <project>/site/raw/<slug>.html,
per-URL log -> site/crawl-log.json (adds "source": live | fallback | failed),
merged list + sitemap-vs-seed differences -> site/url-list.json.
With crawl.discover_links, internal pages linked from crawled pages but absent from the list are fetched too and
listed under "discovered" in url-list.json.
"""
import argparse, json, re, sys, time, urllib.request, urllib.error
from urllib.parse import urljoin, urlparse, urldefrag
from common import *

UA = CFG["crawl"]["user_agent"]
DELAY = float(CFG["crawl"]["delay"])
RETRIES = int(CFG["crawl"]["retries"])


def fetch(url, retries=None):
    """Return (status, final_url, body_bytes, redirect_chain). Manual redirects."""
    retries = retries or RETRIES

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
    for rel in CFG["sitemaps"]:
        idx = urljoin(PRIMARY + "/", rel)
        try:
            st, txt = load(idx)
        except Exception as e:
            print("sitemap fail", idx, e); continue
        if st != 200 or "<loc>" not in txt: continue
        locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", txt)
        if "<sitemapindex" in txt:
            for sm in locs:
                if not is_site(sm): continue
                try:
                    st2, t2 = load(sm)
                except Exception as e:
                    print("sitemap fail", sm, e); continue
                for u in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", t2):
                    if is_site(u): out[u] = sm.rsplit("/", 1)[-1]
        else:
            for u in locs:
                if is_site(u): out[u] = idx.rsplit("/", 1)[-1]
        break
    return out


def canon(u):
    """Normalise to the primary host so www / non-www and the fallback host do not create duplicates."""
    p = urlparse(u)
    if is_site(u):
        pp = urlparse(PRIMARY)
        return p._replace(scheme=pp.scheme, netloc=pp.netloc, fragment="", path=re.sub(r"/{2,}", "/", p.path) or "/").geturl()
    return u


def fetch_page(u):
    """Try live, then the fallback copy. Returns (record_fields, body)."""
    try:
        st, final, body, chain = fetch(u)
        ok = st < 400 and bool(body)
        if ok or not FALLBACK:
            return {"status": chain[0][0] if chain else st, "final_status": st, "redirected_to": final if final != u else None,
                    "error": None if ok else f"HTTP {st}", "source": "live" if ok else "failed"}, (body if ok else b"")
        live_err = f"live HTTP {st}"
    except Exception as e:
        live_err = f"live: {e}"
        if not FALLBACK:
            return {"status": None, "final_status": None, "redirected_to": None, "error": live_err, "source": "failed"}, b""
    q = urlparse(u)
    fu = FALLBACK + q.path + (("?" + q.query) if q.query else "")
    try:
        time.sleep(DELAY)
        st, final, body, chain = fetch(fu)
        if st < 400 and body:
            return {"status": chain[0][0] if chain else st, "final_status": st, "redirected_to": None,
                    "error": None, "source": "fallback", "live_error": live_err}, body
        return {"status": None, "final_status": st, "redirected_to": None, "error": f"{live_err}; fallback HTTP {st}", "source": "failed"}, b""
    except Exception as e:
        return {"status": None, "final_status": None, "redirected_to": None, "error": f"{live_err}; fallback: {e}", "source": "failed"}, b""


def internal_links(html, base):
    from bs4 import BeautifulSoup
    skip = re.compile(CFG["crawl"]["discover_skip_regex"], re.I)
    out = []
    soup = BeautifulSoup(html, "lxml")
    for a in soup.find_all("a", href=True):
        h = a["href"].strip()
        if not h or h.startswith("#") or skip.search(h): continue
        u = urldefrag(urljoin(base, h))[0]
        if urlparse(u).scheme in ("http", "https") and is_site(u) and not skip.search(u):
            out.append(canon(u))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.add_argument("--refresh", action="store_true")
    ap.add_argument("--retry-failed", action="store_true", help="re-fetch URLs whose last attempt failed")
    ap.add_argument("--limit", type=int)
    ap.add_argument("--sitemaps-only", action="store_true")
    a = ap.parse_args()
    seed = [canon(r["URL"]) for r in read_seed()] + [canon(to_url(x)) for x in CFG["urls"]["extra"]]
    sm = {canon(u): s for u, s in sitemap_urls().items()}
    norm = lambda u: u if u.endswith("/") or "?" in u or re.search(r"\.[a-z0-9]{2,5}$", urlparse(u).path, re.I) else u + "/"
    seed_n = {norm(u) for u in seed}
    sm_n = {norm(u): s for u, s in sm.items()}
    only_sm = sorted(set(sm_n) - seed_n)
    only_csv = sorted(seed_n - set(sm_n))
    urls = [u for u in dict.fromkeys(seed + only_sm) if not excluded_url(u)]
    prev = json.loads(URLLIST.read_text()) if URLLIST.exists() else {}
    discovered = prev.get("discovered", [])
    urls += [d["url"] for d in discovered if d["url"] not in urls]

    def save_list():
        URLLIST.write_text(json.dumps({"urls": urls, "sitemap_count": len(sm_n), "in_sitemap_not_csv": [{"url": u, "sitemap": sm_n[u]} for u in only_sm],
                                       "in_csv_not_sitemap": only_csv, "discovered": discovered}, indent=1))
    save_list()
    print(f"urls={len(urls)} sitemap={len(sm_n)} only_sitemap={len(only_sm)} only_seed={len(only_csv)} discovered={len(discovered)}", flush=True)
    if a.sitemaps_only: return
    RAW.mkdir(parents=True, exist_ok=True)
    log = json.loads(LOG.read_text()) if LOG.exists() else {}
    disc_on = CFG["crawl"]["discover_links"]
    n = 0
    i = 0
    while i < len(urls):
        u = urls[i]; i += 1
        s = slug_for(u); f = RAW / f"{s}.html"
        prev = log.get(u)
        if prev is not None and not a.refresh:
            had = f.exists() and not prev.get("error")
            if had or (prev.get("error") and not a.retry_failed):
                if had and disc_on and len(discovered) < CFG["crawl"]["discover_max"]:
                    _discover(f.read_bytes().decode("utf-8", "replace"), u, urls, discovered, save_list)
                continue
        if a.limit and n >= a.limit: break
        n += 1
        rec, body = fetch_page(u)
        if body and rec["source"] != "failed":
            f.write_bytes(body)
        rec.update({"slug": s, "fetched": time.strftime("%Y-%m-%d")})
        log[u] = rec
        print(u, rec["source"], rec["status"], rec["final_status"], rec["redirected_to"] or "", rec["error"] or "", flush=True)
        LOG.write_text(json.dumps(log, indent=1))
        if body and disc_on and rec["source"] != "failed" and len(discovered) < CFG["crawl"]["discover_max"]:
            _discover(body.decode("utf-8", "replace"), u, urls, discovered, save_list)
        time.sleep(DELAY)
    save_list()
    print("done; fetched this run:", n)


def _discover(html, page_url, urls, discovered, save_list):
    known = set(urls)
    key = lambda u: u.rstrip("/").lower()   # case-insensitive: case variants of a path are the same page (and the same raw file on case-insensitive disks)
    known_n = {key(u) for u in urls}
    for l in internal_links(html, page_url):
        if l in known or key(l) in known_n or excluded_url(l): continue
        if len(discovered) >= CFG["crawl"]["discover_max"]: return
        discovered.append({"url": l, "found_on": page_url}); urls.append(l); known.add(l); known_n.add(key(l))
        save_list()


if __name__ == "__main__":
    main()
