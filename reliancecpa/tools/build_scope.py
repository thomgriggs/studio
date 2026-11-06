#!/usr/bin/env python3
"""Scope, redirects and the IN-page path map for the Reliance CPA content layer.

Reads content/pages/*.json (+ site/sitemaps/attachment sitemap), tools/sitemap_data.py.
Writes content/scope.json, content/redirects-draft.csv, content/excluded-pages.json.
Run:  python3 reliancecpa/tools/build_scope.py   (offline, rerunnable)
Exposes build() for the other generators.
"""
import csv, glob, json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
import sitemap_data as D

HOST = "https://www.reliancecpa.com"


def strip_ext(s):
    return re.sub(r"\.(html?|php)$", "", s)


def load_pages():
    rows = {}
    for f in sorted(glob.glob(str(ROOT / "content/pages/*.json"))):
        d = json.load(open(f))
        rows[d["slug"]] = d
    return rows


def path_of(url):
    p = url.replace(HOST, "").replace("http://www.reliancecpa.com", "")
    return p or "/"


def in_map(pages):
    """slug -> dict(new_path, role, template, tier, nav_label, merge_into?, reason)"""
    m = {}

    def put(slug, **kw):
        assert slug in pages, slug
        m[slug] = kw

    put("home", new_path="/", role="home", template="home", tier=None, reason="home page; proposed home replaces the live copy")
    for t in D.TIERS:
        base = f"/{t['slug']}/"
        put(t["live_landing"], new_path=base, role="tier-landing", template="tier-landing", tier=t["id"],
            reason="live tier landing; consolidated into the proposed tier landing page")
        for it in t["items"]:
            put(it["slug"], new_path=f"{base}{it['path']}/", role="service", template="service-detail", tier=t["id"],
                nav_label=it["label"], reason="live service page, one tier" + (" (promoted from article-service-adjacent: the plan names it a Consulting service)" if it.get("promoted_from") else ""))
            for mg in it.get("merges", []):
                put(mg, new_path=f"{base}{it['path']}/", role="merged", template="service-detail", tier=t["id"],
                    merge_into=it["slug"], reason=f"overlaps {it['slug']}; consolidate into it (kept in structured as source copy)")
        for ind in t.get("industries", []):
            put(ind["slug"], new_path=f"{base}industries/{ind['path']}/", role="industry-example", template="service-detail",
                tier=t["id"], nav_label=ind["label"], reason="industry page becomes an industry example inside Business & Tax Consulting")
    for c in D.CLIENT_RESOURCES:
        put(c["slug"], new_path=f"/resources/{c['path']}/", role="client-resource", template="client-resources",
            tier=None, nav_label=c["label"], reason="client resource under Resources")
    put("client-portal-login", new_path="/resources/client-portal/", role="merged", template="client-resources", tier=None,
        merge_into="reliance-consulting-netclient-portals",
        reason="login form page (a Thomson Reuters NetClient form); replaced by the external Client Login link; old URL redirects to the portal info page")
    put("reliance-consulting-backoffice", new_path="/business-accounting/backoffice/", role="service", template="service-detail",
        tier="business-accounting", nav_label="Reliance BackOffice",
        reason="BackOffice appears under 3 live menus (Small Business Accountant, Business Consultants, Dental CPA); one page, in Business Accounting per plan section 2")
    for a in D.ABOUT:
        put(a["slug"], new_path="/about/" + (a["path"] + "/" if a["path"] else ""), role="about",
            template="about-team" if a["path"] in ("", "team", "why-reliance") else "content-page", tier=None,
            nav_label=a["label"], reason="about section")
    put("contact.html", new_path="/contact/", role="contact", template="content-page", tier=None, reason="contact page")
    put("more-information.htm", new_path="/resources/", role="merged", template="resource-media", tier=None,
        merge_into="resources-hub", reason="inventory calls it contact; it is a 1,992-word link index of articles; fold into the Resources hub / articles index")
    put("privacy-policy.htm", new_path="/privacy-policy/", role="legal", template="content-page", tier=None, reason="legal page, footer")
    put("disclaimer.htm", new_path="/disclaimer/", role="legal", template="content-page", tier=None, reason="legal page, footer")
    put("accessibility", new_path="/accessibility/", role="legal", template="content-page", tier=None, reason="legal page, footer")
    put("articles.html", new_path="/resources/articles/", role="insights-index", template="resource-media", tier=None,
        reason="live article index; becomes the articles list under Resources")
    for slug, np in D.LOCAL.items():
        put(slug, new_path=f"/{np}/", role="local-seo", template="service-detail", tier=None,
            reason="local-SEO page: kept, not in nav; revisit with Jeff's traffic data")
    tagmap = {s: tag for tag, lst in D.ARTICLE_TAG.items() for s in lst}
    for slug, d in pages.items():
        cat = (d.get("inventory") or {}).get("category")
        if cat in ("article-service-adjacent", "insights-index") and slug not in m:
            m[slug] = dict(new_path=f"/resources/{strip_ext(slug)}/", role="resource-article", template="insight-article",
                           tier=None, tag=tagmap.get(slug, "general"),
                           reason="service-adjacent article becomes a Resources article" if cat == "article-service-adjacent"
                           else "inventory calls it an insights index; it is a short article (a CPA explains the topic)")
    for slug in ("how-to-choose-cpa.htm", "what-is-a-cpa.htm"):
        m[slug] = dict(new_path=f"/resources/{strip_ext(slug)}/", role="resource-article", template="insight-article",
                       tier=None, tag="general", reason="inventory calls it about/team; it is an explainer article, so it goes under Resources")
    for slug in m:
        m[slug].setdefault("tag", None)
    for slug in ("records-for-cpa-meeting.htm",):
        m[slug]["tag"] = "accounting"
    for slug, v in m.items():
        for tag, lst in D.ARTICLE_TAG.items():
            if slug in lst and v["role"] in ("resource-article",):
                v["tag"] = tag
    return m


TAX = re.compile(r"\btax|irs|audit|deduct|refund|1040|w-?2|filing|\breturn", re.I)
ACC = re.compile(r"bookkeep|quickbooks|payroll|accounting|cash-?flow|invoice|receivable|payable|inventory|financial-statement|ledger|accrual|expense|budget|bank-?account|record", re.I)
CON = re.compile(r"plan|entity|corporation|\bllc\b|partnership|sole-prop|cfo|succession|valuation|business|buy|lease|loan|financ|estate|retire|invest|insurance|trust|will|strategy|customer|marketing|hiring|employee|startup|franchise|merger|exit|wealth|asset", re.I)


def topic_target(text, default="/resources/"):
    if TAX.search(text):
        return "/tax-preparation/"
    if ACC.search(text):
        return "/business-accounting/"
    if CON.search(text):
        return "/business-tax-consulting/"
    return default


def build():
    pages = load_pages()
    inm = in_map(pages)
    att_urls = set(re.findall(r"<loc>([^<]+)</loc>", open(ROOT / "site/sitemaps/www.reliancecpa.com_attachment_sitemap.xml").read()))
    att_urls = {u.rstrip("/") for u in att_urls}
    by_path = {}
    for slug, d in pages.items():
        by_path[path_of(d["url"]).strip("/")] = slug
    out = {}
    redirects = []

    def target_for_slug(slug, seen=()):
        if slug in inm:
            return inm[slug]["new_path"]
        d = pages.get(slug)
        return out.get(slug, {}).get("redirect") or "/"

    # first pass: non-attachment OUT pages
    for slug, d in pages.items():
        cat = (d.get("inventory") or {}).get("category")
        url = d["url"]
        e = {"slug": slug, "url": url, "path": path_of(url), "category": cat, "status": d.get("status")}
        if slug in inm:
            v = inm[slug]
            e.update(decision="in", reason=v["reason"], new_path=v["new_path"], role=v["role"], template=v["template"], tier=v["tier"])
            if v.get("merge_into"):
                e["merge_into"] = v["merge_into"]
            if v.get("tag"):
                e["resource_tag"] = v["tag"]
        elif cat is None:
            pass
        else:
            text = slug + " " + ((d.get("seo") or {}).get("title_tag") or "")
            if cat == "article-library":
                e.update(decision="out", reason="generic financial-guide article library (278 thin pages); not carried to the new site",
                         redirect=topic_target(text), role="article-library")
            elif cat == "article-dated":
                e.update(decision="out", reason="dated 2008-2013 political/economic commentary; retire",
                         redirect="/resources/", role="article-dated")
            elif cat == "dental":
                tgt = topic_target(text, "/business-tax-consulting/")
                if slug == "dental-cpa":
                    tgt = "/business-tax-consulting/industries/physicians/"
                e.update(decision="out", reason="no dental section (firm confirmed); sub-article, redirect to nearest tier", redirect=tgt, role="dental")
            elif cat == "veterinary":
                tgt = topic_target(text, "/business-tax-consulting/")
                e.update(decision="out", reason="no veterinary section (firm confirmed); redirect to nearest tier", redirect=tgt, role="veterinary")
            else:
                raise SystemExit(f"unclassified {slug} {cat}")
        out[slug] = e
    # uninventoried pages
    for slug, d in pages.items():
        if slug in out and out[slug].get("decision"):
            continue
        url = d["url"]
        p = path_of(url).strip("/")
        e = out[slug]
        if url.rstrip("/") in att_urls:
            parts = p.split("/")
            parent_path = "/".join(parts[:-1]) if "attachment" not in parts[-2:-1] else "/".join(parts[:-2])
            parent = by_path.get(parent_path)
            if parent is None and len(parts) > 2:
                parent = by_path.get("/".join(parts[:-2]))
            if parent and parent in inm:
                tgt, basis = inm[parent]["new_path"], f"attachment page; parent {parent} is IN"
            elif parent and out.get(parent, {}).get("redirect"):
                tgt, basis = out[parent]["redirect"], f"attachment page; parent {parent} is OUT, follows its target"
            else:
                tgt, basis = "/", "attachment page; parent not identified, home"
            e.update(category="attachment", decision="out", role="attachment",
                     reason="WordPress image-attachment page (a thin page for one image); junk", redirect=tgt, redirect_basis=basis,
                     parent=parent)
        elif slug in ("contact",):
            e.update(category="alias", decision="out", role="alias", reason="discovered link /contact; 301s to /contact.html on the live site",
                     redirect="/contact/", redirect_basis="live 301 to contact.html")
        elif slug == "crowd-fundin":
            e.update(category="alias", decision="out", role="alias", reason="typo URL; 301s to /crowd-funding on the live site (an article-library page)",
                     redirect="/business-tax-consulting/", redirect_basis="live 301 to crowd-funding")
        else:
            e.update(category="dead-link", decision="out", role="dead-link",
                     reason="URL linked from the live site but returns 404 (no content to carry)", redirect="/resources/" if slug != "index.html" else "/",
                     redirect_basis="404 on the live site")
    # redirects
    for slug, e in out.items():
        if e["decision"] == "out":
            basis = e.get("redirect_basis") or f"{e['role']}; nearest tier or resources by topic"
            redirects.append((e["path"], e["redirect"], basis))
        elif e["path"] != e["new_path"]:
            if e.get("merge_into"):
                basis = f"IN page consolidated into {e['merge_into']}"
            elif e["role"] == "tier-landing":
                basis = "IN tier landing; URL changes"
            else:
                basis = "IN page; URL changes in the new structure"
            redirects.append((e["path"], e["new_path"], basis))
    return pages, inm, out, redirects


def main():
    pages, inm, out, redirects = build()
    import collections
    cnt = collections.Counter((e["decision"], e["category"]) for e in out.values())
    order = ["home", "tier-tax", "tier-accounting", "tier-consulting", "about", "client-resources", "legal", "contact",
             "insights-index", "local-seo", "article-service-adjacent"]
    summary = {
        "in": {c: cnt[("in", c)] for c in order},
        "out": {c: n for (dcs, c), n in sorted(cnt.items()) if dcs == "out"},
    }
    summary["in_total"] = sum(summary["in"].values())
    summary["out_total"] = sum(summary["out"].values())
    summary["total"] = len(out)
    doc = {
        "_about": ("DRAFT scope of the redesign mockup, one row per crawled URL (916 crawled: 909 fetched + 7 failed). decision in = carried to the "
                   "new site (and modulized); out = dropped, with a suggested redirect (new-site path). Redirect targets are guesses by topic; they "
                   "are pending Jeff's GA/GSC traffic and backlink data (the inventory CSV's traffic columns are blank). "
                   "category is the inventory category; pages the inventory did not list are 'attachment', 'alias' or 'dead-link'. "
                   "There is no separate author page: the author sitemap lists only the home URL. 448 attachment-sitemap URLs were found, not 447."),
        "draft": True,
        "counts": summary,
        "pages": sorted(out.values(), key=lambda e: (e["decision"] != "in", e["category"] or "", e["slug"])),
    }
    (ROOT / "content/scope.json").write_text(json.dumps(doc, indent=1, ensure_ascii=False))
    with open(ROOT / "content/redirects-draft.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["old_url", "new_path", "basis", "status"])
        for o, n, b in sorted(redirects):
            w.writerow([o, n, b, "DRAFT: pending Jeff's traffic data"])
    ex = {
        "_about": ("Pages the redesign drops (decision out in scope.json). Read by liftkit/tools/modulize.py (no structured output) and build.py. "
                   "Nothing is deleted from content/pages or site/raw. `redirect` is the draft new-site path. Groups: other = everything dropped "
                   "(this project has no stock-post/video groups; the generic format keeps the Vaughn group names)."),
        "stock_posts": [], "video_posts": [], "listings": [],
        "other": [{"slug": e["slug"], "url": e["url"], "category": e["category"], "redirect": e["redirect"]} for e in out.values() if e["decision"] == "out"],
    }
    (ROOT / "content/excluded-pages.json").write_text(json.dumps(ex, indent=1, ensure_ascii=False))
    print(json.dumps(summary, indent=1)); print("redirects", len(redirects))


if __name__ == "__main__":
    main()
