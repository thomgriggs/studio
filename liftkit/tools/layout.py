#!/usr/bin/env python3
"""Layout analysis (Liftkit part 2b): how many genuinely different page layouts does the site have?

    layout.py --project <dir>        # needs content/pages (run extract.py first) and site/raw

Writes content/_layout-analysis.json:
  families  [{id, name, description, count, modules, skeleton, traits, pages[], example}]   (modules = coarse block-type shape)
  pages     {slug: {family, outlier, modules}}                      (same keys modulize.py reads)
  skeletons [{id, count, signature, pages[]}]                      (theme-template level: the page's outer HTML scaffold)
  boilerplate  blocks repeated across pages (from _shared-blocks.json) + the header/footer variants
  cohorts   one entry per config `layout.cohorts` item (e.g. an article library): word counts, title/meta uniqueness,
            vendor / copyright markers, external hosts, repeated lines, template sameness
and prints a readable summary. Rules for naming/merging families come from liftkit.json `layout.rules`.

A family = pages sharing an outer scaffold (skeleton) AND the same structural traits (form, video, embed, table, link-hub);
length (thin/long) is reported per family, not used to split it. Traits are generic; `layout.rules` can override a page's family by regex on URL or by inventory field:
  {"id": "home", "name": "Home page", "when": {"path_regex": "^/$"}}
  {"id": "article-library", "name": "...", "when": {"inventory": {"category": "article-library"}}}
Rules are tried in order; the first match names the family (pages that match no rule fall to the automatic grouping).
"""
import argparse, collections, hashlib, json, re, statistics, sys
from urllib.parse import urlparse
from bs4 import BeautifulSoup, Tag, Comment
from common import *
from extract import load_soup, norm, plain, block_words, block_key

SEL = CFG["selectors"]
LC = CFG["layout"]
NOISE = ("script", "style", "link", "meta", "noscript", "template", "title", "head", "br")


def tok(el):
    cls = [c for c in (el.get("class") or []) if not re.search(r"\d", c) and not c.startswith(("post-", "page-id", "postid", "category-", "tag-"))]
    return el.name + (("#" + el["id"]) if el.get("id") and not re.search(r"\d", el["id"]) else "") + ("." + ".".join(cls[:2]) if cls else "")


def skeleton(soup, depth=3):
    """Outer scaffold: tag#id.class of body descendants down to `depth` (numbers stripped), repeated siblings collapsed."""
    out = []
    root = soup.body or soup

    def rec(el, d):
        kids = [c for c in el.children if isinstance(c, Tag) and c.name not in NOISE]
        last = None
        for c in kids:
            t = tok(c)
            if t == last:
                continue
            last = t
            out.append("  " * d + t)
            if d < depth:
                rec(c, d + 1)
    rec(root, 0)
    return out


def shape(blocks):
    """Coarse block-type string for the main region (unshared blocks), runs collapsed: H p L I T E F B."""
    m = {"p": "p", "text": "p", "ul": "L", "ol": "L", "img": "I", "table": "T", "embed": "E", "form": "F", "a": "B", "blockquote": "q", "hr": ""}
    s, last = [], None
    for b in blocks:
        t = b["type"]
        c = "H" if t[0] == "h" and len(t) == 2 and t[1].isdigit() else m.get(t, "?")
        if c and c != last:
            s.append(c); last = c
    return "".join(s)


def traits(blocks, words, seo):
    main = [b for b in blocks if b.get("region") == "main"]
    uns = [b for b in main if not b.get("shared")]
    t = []
    emb = [b for b in uns if b["type"] == "embed"]
    if any(b["type"] == "form" for b in uns): t.append("form")
    vid = [b for b in emb if b.get("provider") in ("youtube", "vimeo", "wistia")]
    if vid: t.append("video")
    if any(b.get("provider") not in ("youtube", "vimeo", "wistia") for b in emb): t.append("embed")
    if any(b["type"] == "table" for b in uns): t.append("table")
    imgs = [b for b in uns if b["type"] == "img"]
    if imgs: t.append("images")
    # link hub: most of the words sit in links / link lists
    lw = tot = 0
    for b in uns:
        if b["type"] in ("ul", "ol"):
            def walk(items):
                nonlocal lw, tot
                for i in items:
                    w = len(plain(i["text"]).split()); tot += w
                    if i["links"]: lw += w
                    for k in i["children"]: walk(k["items"])
            walk(b["items"])
        elif b["type"] == "a":
            n = len(plain(b["text"]).split()); lw += n; tot += n
        else:
            n = block_words(b); tot += n
            if b.get("links") and len(b["links"]) and n and sum(len(l["text"].split()) for l in b["links"]) / max(n, 1) > .6: lw += n
    if tot and lw / tot > .5 and tot > 20: t.append("link-hub")
    if words == 0: t.append("empty")
    elif words < 150: t.append("thin")
    elif words >= LC.get("long_article_words", 400): t.append("long")
    return t


def rule_for(page):
    path = path_key(page["url"])
    for r in LC["rules"]:
        w = r.get("when", {})
        ok = True
        if "path_regex" in w and not re.search(w["path_regex"], path): ok = False
        if "slug_regex" in w and not re.search(w["slug_regex"], page["slug"]): ok = False
        if "type" in w and page.get("type") != w["type"]: ok = False
        for k, v in (w.get("inventory") or {}).items():
            if (page.get("inventory") or {}).get(k) != v: ok = False
        if ok: return r
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.parse_args()
    shared = json.loads((CONTENT / "_shared-blocks.json").read_text())
    pages = {}
    for jf in sorted(PAGES.glob("*.json")):
        d = json.loads(jf.read_text())
        if d.get("error") or not d.get("blocks"):
            pages[d["slug"]] = {"d": d, "skip": True}; continue
        f = RAW / f"{d['slug']}.html"
        soup = load_soup(f, d)
        sk = skeleton(soup)
        pages[d["slug"]] = {"d": d, "skel": sk, "skel_id": hashlib.sha1("\n".join(sk).encode()).hexdigest()[:8],
                            "shape": shape([b for b in d["blocks"] if b.get("region") == "main" and not b.get("shared")]),
                            "traits": traits(d["blocks"], d.get("word_count", 0), d.get("seo", {})), "soup": soup}
    live = {k: v for k, v in pages.items() if not v.get("skip")}
    skels = collections.defaultdict(list)
    for k, v in live.items(): skels[v["skel_id"]].append(k)
    skel_list = [{"id": f"S{n+1}", "skel_id": sid, "count": len(sl), "signature": live[sl[0]]["skel"], "pages": sl}
                 for n, (sid, sl) in enumerate(sorted(skels.items(), key=lambda x: -len(x[1])))]
    sid_name = {s["skel_id"]: s["id"] for s in skel_list}

    fam = collections.OrderedDict()
    page_fam = {}
    for slug, v in live.items():
        d = v["d"]
        r = rule_for(d)
        if r:
            fid = r["id"]; name = r.get("name", r["id"]); trait_t = ()
        else:
            tr = tuple(t for t in v["traits"] if t in ("form", "video", "embed", "table", "link-hub"))
            fid = sid_name[v["skel_id"]] + ("-" + "-".join(tr) if tr else ""); trait_t = tr
            name = None
        f = fam.setdefault(fid, {"id": fid, "name": name, "rule": bool(r), "skeleton": sid_name[v["skel_id"]], "traits": list(trait_t), "pages": [],
                                 "shapes": collections.Counter(), "words": [], "types": collections.Counter()})
        f["pages"].append(slug); f["shapes"][v["shape"]] += 1; f["words"].append(d.get("word_count", 0)); f["types"][d.get("type", "")] += 1
        page_fam[slug] = fid
    fams = []
    for f in sorted(fam.values(), key=lambda f: -len(f["pages"])):
        w = f["words"]
        desc = (f"scaffold {f['skeleton']}; " + (", ".join(f["traits"]) or "plain text") +
                f"; {min(w)}-{max(w)} words (median {int(statistics.median(w))}); common shape: " + f["shapes"].most_common(1)[0][0])
        fams.append({"id": f["id"], "name": f["name"] or f["id"], "description": desc, "count": len(f["pages"]),
                     "modules": [f["shapes"].most_common(1)[0][0]], "skeleton": f["skeleton"], "traits": f["traits"],
                     "types": dict(f["types"]), "example": f["pages"][0], "pages": f["pages"]})
    pg = {s: {"family": page_fam[s], "outlier": len(fam[page_fam[s]]["pages"]) == 1, "modules": [live[s]["shape"]]} for s in live}
    for s, v in pages.items():
        if v.get("skip"): pg[s] = {"family": "(no content)", "outlier": True, "modules": [], "error": v["d"].get("error")}

    # ---- boilerplate
    bp = [{"count": b["count"], "type": b["block"]["type"], "text": (b["key"][1] if len(b["key"]) > 1 else "")[:160], "example_page": b["example_page"]}
          for b in shared["blocks"]]
    gpath = CONTENT / "_global.json"
    g = json.loads(gpath.read_text()) if gpath.exists() else {}

    # ---- cohorts
    cohorts = []
    for c in LC.get("cohorts", []):
        w = c.get("where", {})
        members = [s for s, v in live.items() if all((v["d"].get(k) if "." not in k else (v["d"].get(k.split(".")[0]) or {}).get(k.split(".")[1])) == val for k, val in w.items())]
        cohorts.append(analyse_cohort(c["name"], members, live, c.get("vendor_markers", [])))

    out = {"families": fams, "pages": pg, "skeletons": skel_list,
           "boilerplate": {"shared_blocks": bp, "header_variants": [{"count": v["count"], "example": v["example_page"]} for v in g.get("nav_variants", [])]},
           "cohorts": cohorts}
    (CONTENT / "_layout-analysis.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
    write_readme_section(out, len(live), len(pages))
    print(f"{len(live)} pages with content; {len(skel_list)} outer scaffolds; {len(fams)} layout families")
    for f in fams: print(f"  {f['count']:4d}  {f['id']:34s} {f['description'][:110]}")
    for c in cohorts: print("cohort", c["name"], json.dumps({k: c[k] for k in ("pages", "words", "unique_titles", "unique_meta_descriptions")}))


MARK = "\n## Layout analysis (layout.py)\n"


def write_readme_section(out, n_live, n_all):
    """Append (or replace) a readable layout section in content/README.md. extract.py rewrites the README, so run layout.py after it."""
    rd = CONTENT / "README.md"
    base = rd.read_text() if rd.exists() else ""
    base = base.split(MARK)[0].rstrip("\n") + "\n"
    L = [MARK, f"{n_live} of {n_all} URLs have extractable content (the rest failed to download). Machine-readable: `_layout-analysis.json`.", "",
         f"### Outer scaffolds (theme templates): {len(out['skeletons'])}", ""]
    for s in out["skeletons"]:
        L.append(f"- **{s['id']}**: {s['count']} pages. Scaffold: " + " > ".join(x.strip() for x in s["signature"][:14]) + ". Examples: " + ", ".join(s["pages"][:3]))
    L += ["", f"### Layout families: {len(out['families'])}", "", "A family is a scaffold plus structural traits (form, video, embed, table, link-hub). Words are main-region words excluding shared boilerplate.", "",
          "| Family | Pages | Description | Examples |", "|---|---|---|---|"]
    for f in out["families"]:
        L.append(f"| {f['id']} | {f['count']} | {f['description']} | {', '.join(f['pages'][:3])} |")
    L += ["", "### Boilerplate repeated across pages", ""]
    for b in out["boilerplate"]["shared_blocks"]:
        L.append(f"- {b['count']} pages: [{b['type']}] {b['text']}")
    if not out["boilerplate"]["shared_blocks"]: L.append("- none above the shared threshold")
    hv = out["boilerplate"]["header_variants"]
    L.append(f"- Header variants: {len(hv)} (" + ", ".join(str(v['count']) + " pages" for v in hv) + ")")
    for c in out["cohorts"]:
        w = c["words"]
        L += ["", f"### Cohort: {c['name']} ({c['pages']} pages)", "",
              f"- Words: min {w['min']}, median {w['median']}, mean {w['mean']}, p90 {w['p90']}, max {w['max']}; under 150 words: {w['under_150']}; over 800: {w['over_800']}",
              f"- Titles: {c['unique_titles']} unique ({c['pages_with_duplicate_title']} pages share a title with another); empty: {c['empty_titles']}. Meta descriptions: {c['unique_meta_descriptions']} unique, {c['pages_without_meta_description']} pages without. Meta keywords: {c['pages_with_meta_keywords']} pages.",
              f"- Scaffolds used: {c['scaffold_counts']}; content shapes: {c['content_shapes']}",
              f"- Vendor / copyright / provenance markers found in the main text: " + (", ".join(f"`{k}` on {v['pages']} pages" for k, v in c["markers"].items()) or "none"),
              f"- External hosts referenced in the main region (pages): {c['external_hosts_in_main']}",
              f"- Blocks repeated across the cohort: " + ("; ".join(f"{r['count']}x [{r['type']}] {r['text']}" for r in c["repeated_blocks"]) or "none")]
    rd.write_text(base + "\n".join(L) + "\n")


def analyse_cohort(name, members, live, extra_markers):
    d = [live[s]["d"] for s in members]
    n = len(d) or 1
    words = [x.get("word_count", 0) for x in d]
    titles = collections.Counter(x["seo"].get("title_tag", "") for x in d)
    metas = collections.Counter(x["seo"].get("meta_description", "") for x in d)
    kw = sum(1 for x in d if x["seo"].get("meta_keywords"))
    # repeated lines (whole-block text) across the cohort, ignoring site-wide shared blocks
    lines = collections.Counter()
    for x in d:
        seen = set()
        for b in x["blocks"]:
            if b.get("region") != "main": continue
            k = block_key(b)
            if k and k not in seen and b["type"] in ("p", "text", "h2", "h3", "h4", "ul"):
                seen.add(k); lines[k] += 1
    rep = [{"count": c, "type": k[0], "text": str(k[1])[:140]} for k, c in lines.most_common(12) if c >= max(3, n * .1)]
    # raw-HTML scan: vendor / copyright markers and external hosts
    pat = [r"©", r"copyright", r"all rights reserved", r"provided by", r"published by", r"article by", r"courtesy of", r"powered by", r"reprint", r"syndicat",
           r"permission", r"licensed", r"content (?:is )?provided", r"this (?:article|information) (?:is|was) (?:written|prepared|provided)"] + list(extra_markers)
    marker = collections.Counter(); samples = {}
    hosts = collections.Counter(); gens = collections.Counter(); wp_types = collections.Counter(); templ = collections.Counter(); shapes = collections.Counter()
    for s in members:
        v = live[s]; soup = v["soup"]
        templ[v["skel_id"]] += 1; shapes[v["shape"]] += 1
        g = soup.find("meta", attrs={"name": "generator"})
        if g: gens[g.get("content", "")[:60]] += 1
        m = pick(soup, SEL["main"])
        txt = norm(m.get_text(" ")) if m else ""
        for p in pat:
            mm = re.search(r".{0,60}" + p + r".{0,80}", txt, re.I)
            if mm:
                marker[p] += 1; samples.setdefault(p, (mm.group(0), s))
        hs = set()
        for el in (m.find_all(["a", "iframe", "script", "img"]) if m else []):
            u = el.get("href") or el.get("src") or ""
            h = urlparse(u).hostname
            if h and not is_site(u): hs.add(h)
        for h in hs: hosts[h] += 1
        cl = (soup.find(class_=re.compile(r"\btype-\w+")) or {}).get("class") if soup.find(class_=re.compile(r"\btype-\w+")) else []
        wp_types[" ".join(c for c in (cl or []) if c.startswith(("type-", "category-")))[:60]] += 1
    ws = sorted(words)
    q = lambda p: ws[min(len(ws) - 1, int(len(ws) * p))] if ws else 0
    return {"name": name, "pages": len(d), "words": {"min": ws[0] if ws else 0, "p10": q(.1), "median": q(.5), "mean": round(sum(ws) / n), "p90": q(.9), "max": ws[-1] if ws else 0,
                                                    "under_150": sum(1 for w in ws if w < 150), "over_800": sum(1 for w in ws if w > 800)},
            "unique_titles": len(titles), "pages_with_duplicate_title": sum(c for c in titles.values() if c > 1), "empty_titles": titles.get("", 0),
            "unique_meta_descriptions": len([m for m in metas if m]), "pages_without_meta_description": metas.get("", 0),
            "pages_with_duplicate_meta_description": sum(c for m, c in metas.items() if m and c > 1), "pages_with_meta_keywords": kw,
            "title_samples": [x["seo"].get("title_tag", "") for x in d[:5]],
            "repeated_blocks": rep,
            "markers": {p: {"pages": c, "sample": samples[p][0], "sample_page": samples[p][1]} for p, c in marker.most_common()},
            "external_hosts_in_main": dict(hosts.most_common(15)),
            "generators": dict(gens), "wp_post_classes": dict(wp_types.most_common(6)),
            "scaffold_counts": dict(templ), "content_shapes": dict(shapes.most_common(8)),
            "members": members}


if __name__ == "__main__":
    main()
