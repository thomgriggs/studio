#!/usr/bin/env python3
"""Render content/structured + a design concept into static mockup pages.

    python tools/build.py --concept 05-people-first-v2 --pages home,estate-planning
    python tools/build.py --concept 05-people-first-v2 --all

Output: mockup/<concept>/<url path>/index.html (home = mockup/<concept>/index.html), style.css (+ any other
files in the concept folder except modules/ and templates/), kit.html (every module once, real content)
and pages.html (every built page, by template).

A concept is a folder in design/concepts/ holding concept.json, style.css, modules/NN-name.html (one Jinja
template per kit module) and templates/<template>.html (page shells + _base.html, _kit.html, _pages.html).
Adding a concept needs no change to content, modulize.py or this file.
"""
import argparse
import html as htmllib
import json
import re
import shutil
import sys
from pathlib import Path
from urllib.parse import urlparse

from jinja2 import Environment, FileSystemLoader, StrictUndefined, ChainableUndefined
from markupsafe import Markup, escape

from common import ROOT, CFG, HOST, HOSTS, KIT_DIR

STRUCT = ROOT / "content" / "structured"
CONCEPTS = ROOT / "design" / "concepts"
MOCK = ROOT / "mockup"
NAV = ROOT / "content" / "nav.json"
FOOTER = ROOT / "content" / "footer.json"
PROPOSED = ROOT / "content" / "proposed"
PAGES = ROOT / "content" / "pages"
SHARED = ROOT / "content" / "_shared-blocks.json"
EXCLUDED = ROOT / "content" / "excluded-stock-posts.json"
KIT_TEMPLATES = ROOT / CFG["modulize"]["templates_file"]
if not KIT_TEMPLATES.exists():
    KIT_TEMPLATES = KIT_DIR / "kit" / "templates.json"
SITE_HOSTS = tuple(sorted(HOSTS))
BARE_HOST = HOST.removeprefix("www.")
PREFIXES = tuple(CFG["build"]["path_prefix_strip"])  # path prefixes live links may carry (staging mirror folder)
# links to pages that were replaced: the old video library and the video tag archive now open the Videos page
PATH_ALIASES = CFG["build"].get("path_aliases", {})
TEST_PAGES = CFG["build"]["test_pages"]
OLD2NEW = {}   # build.use_scope_paths: old live path (no slashes at the ends) -> new mockup path, so live links to old URLs resolve


def strip_prefix(p):
    for x in PREFIXES:
        if p.startswith(x):
            return p[len(x):]
    return p


def url_path(url):
    return urlparse(url).path.strip("/")


class Renderer:
    def __init__(self, concept):
        self.name = concept
        self.dir = CONCEPTS / concept
        if not (self.dir / "concept.json").exists():
            sys.exit(f"concept not found: {self.dir}")
        self.cfg = json.loads((self.dir / "concept.json").read_text())
        self.env = Environment(
            loader=FileSystemLoader([str(self.dir / "modules"), str(self.dir / "templates"), str(self.dir)]),
            autoescape=True, undefined=ChainableUndefined, trim_blocks=True, lstrip_blocks=True)
        self.state = {"root": "", "built": set()}
        self.closing = {}
        self.footer_def = json.loads(FOOTER.read_text())
        self.pages = {}
        self.built_slugs = set()
        self.related = None
        self.unresolved = {}   # (source slug, text, url) -> record, pages the live site links to that the mockup lacks
        self.downloads = {}    # file-download URL -> set of source slugs
        self.stats = {"page": 0, "redirect": 0, "file": 0, "unlinked": 0, "pagination": 0}
        self.redirects = {}    # path of an excluded page -> path of its redirect target
        self.modfiles = {}
        for f in sorted((self.dir / "modules").glob("[0-9]*.html")):
            self.modfiles[re.sub(r"^\d+[a-z]?-", "", f.stem)] = f.name
        self.env.filters["md"] = self.md
        self.env.filters["href"] = self.href
        self.env.filters["longdate"] = self.longdate
        self.env.filters["ytid"] = self.ytid
        self.env.filters["people_first"] = self.people_first
        self.env.filters["bodywords"] = self.bodywords
        self.env.filters["asset"] = self.asset
        self.env.globals["page_href"] = self.page_href
        self.env.globals["render_module"] = self.render_module
        self.env.globals["concept"] = self.cfg
        self.env.globals["state"] = self.state

    # ---- links: internal links to built pages become relative; everything else stays live
    def href(self, h):
        h = h or ""
        u = urlparse(h)
        if u.scheme in ("http", "https") and u.hostname in SITE_HOSTS:
            p = u.path.strip("/")
            p = strip_prefix(p)
            p = OLD2NEW.get(p, p)
            p = PATH_ALIASES.get(p, p)
            if p in self.state["built"]:
                return self.state["root"] + (p + "/" if p else "") + (f"#{u.fragment}" if u.fragment else "")
        return h

    # ---- no link may point at the live site: resolve at build time (see sanitize)
    LIVE_A = re.compile(r'<a\b([^>]*?)\bhref="(https?://(?:www\.)?' + re.escape(BARE_HOST) + r'[^"]*)"([^>]*)>(.*?)</a>', re.S)
    FILE_EXT = re.compile(r"\.(pdf|jpe?g|png|gif|docx?|xlsx?|zip|pptx?)$", re.I)

    def resolve_live(self, url):
        """Live-site URL -> ("page", relative href) | ("file", url) | ("none", None)."""
        u = urlparse(htmllib.unescape(url))
        p = u.path.strip("/")
        p = strip_prefix(p)
        p = OLD2NEW.get(p, p)
        if self.FILE_EXT.search(p) or p.startswith("wp-content/"):
            return "file", url
        frag = f"#{u.fragment}" if u.fragment else ""
        for cand in (PATH_ALIASES.get(p, p), PATH_ALIASES.get(self.redirects.get(p, ""), self.redirects.get(p))):
            if cand is not None and cand in self.state["built"]:
                return "page", self.state["root"] + (cand + "/" if cand else "") + frag
        return "none", None

    def sanitize(self, html, source):
        def sub(m):
            pre, url, post, inner = m.groups()
            kind, new = self.resolve_live(url)
            text = re.sub(r"\s+", " ", htmllib.unescape(re.sub(r"<[^>]+>", " ", inner))).strip()
            self.stats["file" if kind == "file" else "page" if kind == "page" else "unlinked"] += 1
            if kind == "page":
                pp = urlparse(htmllib.unescape(url)).path.strip("/")
                pp = OLD2NEW.get(strip_prefix(pp), strip_prefix(pp))
                if pp not in self.state["built"] and PATH_ALIASES.get(pp) not in self.state["built"]:
                    self.stats["page"] -= 1
                    self.stats["redirect"] += 1
            if kind == "file":
                self.downloads.setdefault(htmllib.unescape(url), set()).add(source)
                return m.group(0)
            if kind == "page":
                return f'<a{pre}href="{htmllib.escape(new, quote=True)}"{post}>{inner}</a>'
            path = urlparse(htmllib.unescape(url)).path
            if re.search(r"older entries|newer entries|^\W*(older|newer)\b", text, re.I) or re.search(r"/page/\d+", path):
                self.stats["unlinked"] -= 1
                self.stats["pagination"] += 1
                return ""
            self.unresolved[(source, text, htmllib.unescape(url))] = {"source_page": source, "link_text": text, "url": htmllib.unescape(url)}
            attrs = re.sub(r"\s*\b(target|rel)=\"[^\"]*\"", "", pre + post)
            return f'<span{attrs} data-unlinked="true">{inner}</span>'
        html = self.LIVE_A.sub(sub, html)
        return re.sub(r'<p class="[^"]*more[^"]*">\s*</p>\n?', '', html)  # pagination paragraph left empty

    def asset(self, src):
        """Image/video source -> the concept's own copy when build.asset_map says so: {"<src prefix>": "<concept dir>/"}; the
        mapping applies only when that file exists in the concept folder (so a prefix may cover files that are not copied).
        Anything else passes through unchanged."""
        src = src or ""
        for prefix, target in CFG["build"].get("asset_map", {}).items():
            if src.startswith(prefix):
                rel = target + src[len(prefix):]
                if (self.dir / rel).exists():
                    return self.state["root"] + rel
        return src

    def page_href(self, slug):
        """Relative href (to .../index.html) of a built page by slug, or "" if it is not built. For templates that point at a page
        no nav item names (e.g. the Get Started page of the visitor's tier)."""
        p = self.pages.get(slug)
        if not p or slug not in self.built_slugs:
            return ""
        pth = url_path(p["url"])
        return self.state["root"] + (pth + "/" if pth else "") + "index.html"

    @staticmethod
    def ytid(url):
        """YouTube embed/watch URL -> video id (for a poster image and a watch link)."""
        m = re.search(r"(?:embed/|v=|youtu\.be/)([\w-]{11})", str(url or ""))
        return m.group(1) if m else ""

    @staticmethod
    def people_first(images):
        """Stable sort of {src, alt} images: those whose filename or alt suggests people come first."""
        words = re.compile(r"group|team|attorney|attorneys|danielle|whitney|staff|people|portrait|reception|family|office-?staff", re.I)
        return sorted(images, key=lambda i: 0 if words.search((i.get("src", "").rsplit("/", 1)[-1] + " " + (i.get("alt") or ""))) else 1)

    @staticmethod
    def bodywords(blocks):
        """Words in a list of body blocks (p, lists, quotes, tables): used by concepts to pick a layout by length."""
        n = 0

        def walk(bs):
            nonlocal n
            for b in bs or []:
                if b.get("text"):
                    n += len(re.sub(r"\]\([^)]*\)", "]", b["text"]).split())
                for i in b.get("items", []):
                    n += len(re.sub(r"\]\([^)]*\)", "]", i["text"]).split())
                    walk(i.get("children", []))
                for r in b.get("rows", []):
                    n += sum(len(str(c).split()) for c in r)
        walk(blocks)
        return n

    @staticmethod
    def longdate(d):
        """ISO date (2025-11-24) -> November 24, 2025. Anything that is not an ISO date passes through."""
        m = re.match(r"(\d{4})-(\d{2})-(\d{2})", str(d or ""))
        if not m:
            return d
        months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        return f"{months[int(m.group(2)) - 1]} {int(m.group(3))}, {m.group(1)}"

    def md(self, text):
        t = htmllib.escape(str(text or ""), quote=False)

        def link(m):
            h = htmllib.unescape(m.group(2))
            new = self.href(h)
            ext = new.startswith("http") and urlparse(new).hostname not in SITE_HOSTS
            attrs = ' target="_blank" rel="noopener"' if ext else ""
            return f'<a href="{htmllib.escape(new, quote=True)}"{attrs}>{m.group(1)}</a>'
        t = re.sub(r"\[([^\]]*)\]\(([^)]*)\)", link, t)
        t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t, flags=re.S)
        t = re.sub(r"(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)", r"<em>\1</em>", t, flags=re.S)
        return Markup(t.replace("\n", "<br>"))

    # ---- tones: the concept says which modules own their background and how plain ones alternate
    def assign_tones(self, modules, template=None):
        """Tones come from the concept: a cycle that plain modules walk through, fixed tones for modules that own
        their ground, `continue` for sub-sections. Optional concept keys: by_template (cycle per page template),
        tinted (modules that need a tinted ground: they skip a plain `a` slot), after_fixed (tone for the first
        cycle slot after a fixed module that carries an image, e.g. a photo tile straddling the edge)."""
        tcfg = dict(self.cfg.get("tones", {}))
        tcfg.update((tcfg.get("by_template") or {}).get(template, {}))
        cycle = tcfg.get("alternate", ["a", "b"])
        fixed = tcfg.get("fixed", {})
        sticky = tcfg.get("continue", [])
        tinted = set(tcfg.get("tinted", []))
        after = tcfg.get("after_fixed")
        k = 0
        last = cycle[0]
        prev_img = False
        avoid = template == "hub"  # hubs: a plain module never takes the ground of its neighbour above or below
        prev_tone = None
        def fixed_tone(mm):
            return fixed.get(f'{mm["module"]}:{mm.get("variant", "")}') or fixed.get(mm["module"])
        for mi, m in enumerate(modules):
            key, vkey = m["module"], f'{m["module"]}:{m.get("variant", "")}'
            if vkey in fixed or key in fixed:
                m["tone"] = prev_tone = fixed.get(vkey) or fixed[key]
                if m["slots"].get("image") and after is not None:
                    prev_img, k = True, 0
                continue
            cont = (m["module"] == "headed-section" and (m["slots"].get("depth") == 3 or m.get("variant") == "lead-in")
                    and "headed-section:sub" in sticky)
            if cont:
                m["tone"] = last
                continue
            tone = cycle[k % len(cycle)]
            if prev_img:
                tone, prev_img = after, False
            elif key in tinted and tone == "a":
                k += 1
                tone = cycle[k % len(cycle)]
            if avoid:
                nxt = fixed_tone(modules[mi + 1]) if mi + 1 < len(modules) else None
                if tone in (prev_tone, nxt):
                    opts = [t for t in dict.fromkeys(cycle) if t not in (prev_tone, nxt) and not (key in tinted and t == "a")]
                    tone = opts[0] if opts else tone
            k += 1
            last = prev_tone = tone
            m["tone"] = tone
        return modules

    def render_module(self, m, page=None, extra=None):
        tpl = self.env.get_template(self.modfiles[m["module"]])
        ctx = {"m": m, "s": m["slots"], "variant": m.get("variant", ""), "tone": m.get("tone", "a"), "page": page or {}}
        ctx.update(extra or {})
        return Markup(tpl.render(**ctx))

    # ---- page rendering
    def page_ctx(self, page, nav, root=None):
        self.env.globals["closing"] = self.closing
        self.env.globals["footer"] = build_footer(self.footer_def, nav, self.closing, self.pages, self.built_slugs)
        depth = len(url_path(page["url"]).split("/")) if url_path(page["url"]) else 0
        self.state["root"] = root if root is not None else "../" * depth
        return {"page": page, "root": self.state["root"], "nav": nav, "closing": self.closing, "related": self.related}

    def render_page(self, page, nav, root=None):
        ctx = self.page_ctx(page, nav, root)
        page["modules"] = self.assign_tones(page["modules"], page.get("template"))
        tpl = self.env.get_template(f'{page["template"]}.html')
        return self.sanitize(tpl.render(**ctx), page.get("slug", ""))

    def module_doc(self, name):
        """Parse the header comment of a module template: PURPOSE / SLOTS / SQUARESPACE."""
        src = (self.dir / "modules" / self.modfiles[name]).read_text()
        m = re.match(r"\s*\{#(.*?)#\}", src, re.S)
        doc = {"purpose": "", "slots": "", "squarespace": ""}
        if m:
            cur = None
            for line in m.group(1).splitlines():
                mm = re.match(r"\s*(MODULE|PURPOSE|SLOTS|SQUARESPACE):\s*(.*)", line)
                if mm:
                    cur = mm.group(1).lower()
                    if cur != "module":
                        doc[cur] = mm.group(2).strip()
                elif cur and cur != "module" and line.strip():
                    doc[cur] += " " + line.strip()
        return doc


def resolve_nav(nav_def, current, pages, built, root):
    """Header menu for one page: nav.json with each item's href resolved to the built mockup page (relative,
    to .../index.html so it also opens from disk). available=False when target_slug is null or not built.
    current = this page is the item's target; related = this page is folded into the item (also_merges);
    a folder or the button is active when any item inside it is current or related.
    Also resolved (only when nav.json has them; Vaughn's has neither): `links` = top-level items that are not
    folders (Contact, Client Login; an external url is kept as it is and rewritten by sanitize if it is a live-site
    page), `mega` = the flyout (columns[tier, heading, description, accent, overview, links[], secondary]),
    each link resolved like a menu item, `active` per column and for the flyout."""
    def item(it):
        it = dict(it)
        slug = it.get("target_slug")
        ok = bool(slug) and slug in built and slug in pages
        it["available"] = ok
        it["href"] = root + (url_path(pages[slug]["url"]) + "/" if url_path(pages[slug]["url"]) else "") + "index.html" if ok else None
        it["current"] = ok and slug == current
        it["related"] = ok and not it["current"] and current in it.get("also_merges", [])
        return it
    menu, links = [], []
    for f in nav_def["menu"]:
        f = dict(f)
        if "children" not in f:
            it = item(f)
            if f.get("external") and f.get("url"):
                it["href"], it["available"] = f["url"], True
            links.append(it)
            continue
        f["children"] = [item(c) for c in f["children"]]
        f["active"] = any(c["current"] or c["related"] for c in f["children"])
        menu.append(f)
    button = item(nav_def["button"])
    out = {"menu": menu, "links": links, "button": button, "home": root + "index.html"}
    mega = nav_def.get("mega")
    if mega:
        cols = []
        for c in mega["columns"]:
            c = dict(c)
            c["overview"] = item({**c["overview"], "label": c["overview"]["label"]})
            c["links"] = [item(l) for l in c["links"]]
            if c.get("secondary"):
                c["secondary"] = {**c["secondary"], "links": [item(l) for l in c["secondary"]["links"]]}
            sec = c["secondary"]["links"] if c.get("secondary") else []
            c["active"] = c["overview"]["current"] or any(l["current"] or l["related"] for l in c["links"] + sec)
            cols.append(c)
        out["mega"] = {**mega, "columns": cols, "active": any(c["active"] for c in cols)}
    return out


def build_footer(fdef, nav, closing, pages, built):
    """Footer for one page: footer.json with page refs resolved to relative hrefs (root taken from the resolved nav),
    link columns from the resolved header menu (available items only; the folder hub 'Overview' is named
    '<Folder> overview'), contact from the shared closing block."""
    root = nav["home"][: -len("index.html")]
    def href(slug):
        if slug not in built or slug not in pages:
            return None
        pth = url_path(pages[slug]["url"])
        return root + (pth + "/" if pth else "") + "index.html"
    def link(it):
        h = href(it["page"]) if "page" in it else it.get("url")
        return {**{k: v for k, v in it.items() if k != "page"}, "href": h, "external": "page" not in it}
    cols = []
    if fdef.get("columns"):   # explicit columns in footer.json (links name a target_slug): used instead of the nav-derived ones
        for col in fdef["columns"]:
            items = [{"label": l["label"], "href": href(l["target_slug"])} for l in col["links"] if href(l.get("target_slug"))]
            if items:
                cols.append({"title": col["heading"], "items": items})
    else:
        for f in nav["menu"]:
            items = [{"label": (f"{f['label']} overview" if c.get("overview") else c["label"]), "href": c["href"]} for c in f["children"] if c["available"]]
            if items:
                cols.append({"title": f["label"], "items": items})
    lines = {l["label"]: l for l in closing.get("lines", [])}
    c = fdef["contact"]
    if c.get("address"):   # literal contact block in footer.json (no shared block in the crawl)
        def tel(v):
            d = re.sub(r"\D", "", v or "")
            return {"text": v, "href": "tel:+1" + d if d else None}
        contact = {"heading": c["heading"], "address": c["address"], "phone": tel(c.get("phone")), "fax": tel(c.get("fax")) if c.get("fax") else None,
                   "email": {"text": c["email"], "href": "mailto:" + c["email"]} if c.get("email") else None, "hours": c.get("hours"),
                   "directions": {"label": c["directions"]["label"], "href": c["directions"]["url"]}}
    else:
        contact = {"heading": c["heading"], "address": lines.get("Address", {}).get("text"), "phone": lines.get("Phone Number"),
                  "fax": lines.get("Fax Number"), "email": lines.get("Email"), "hours": c.get("hours"),
                  "directions": {"label": c["directions"]["label"], "href": c["directions"]["url"]}}
    return {
        "firm": fdef["firm"], "copyright": fdef["copyright"], "columns": cols, "contact": contact,
        "cta": {"label": fdef["cta"]["label"], "href": href(fdef["cta"]["page"])},
        "social": fdef["social"], "extras": [l for l in map(link, fdef["extras"]) if l["href"]],
        "legal": {"heading": fdef["legal"]["heading"], "links": [l for l in map(link, fdef["legal"]["links"]) if l["href"]]},
        "client_login": fdef.get("client_login"),
        "licensed": fdef.get("licensed"), "badges": fdef.get("badges"), "newsletter": fdef.get("newsletter"),
        "root": root, "home": nav["home"],
    }


def nav_index(nav_def):
    """"Folder/Label" -> nav item (plus the folder label), so proposed pages can point at menu items by name."""
    idx = {}
    for f in nav_def["menu"]:
        for c in f.get("children", []):
            idx[f'{f["label"]}/{c["label"]}'] = {**c, "folder": f["label"]}
    return idx


def resolve_refs(node, idx, pages, closing):
    """Resolve the references a proposed page uses, in place of hard-coded URLs:
    {"nav": "Folder/Label"}  -> href of that menu item's live page, link_text = its label ("<Folder> overview" for Overview);
                                an item whose menu entry has no live page is dropped from its list (null elsewhere);
{"nav_folder": "<Folder>", "planned": "hub"} -> list of links for every item in the folder except Overview; items with no live
                                page link to the folder's Overview and carry planned=True (opt-in, see below);
    {"page": "<slug>"}       -> href = that page's URL;
    {"lines_from": "closing"} -> lines = the shared contact block's address, phone and email (no fax); with "only": ["Phone Number"]
                                just those labels;
    {"phone_from": "closing"} -> phone = {text, href} of the shared contact block's phone number."""
    if isinstance(node, list):
        out = [resolve_refs(x, idx, pages, closing) for x in node]
        return [x for x in out if x is not None]
    if not isinstance(node, dict):
        return node
    node = dict(node)
    if "nav_folder" in node:
        # {"nav_folder": "Estate Planning", "planned": "hub"} -> a link for every menu item in that folder (not the
        # Overview). Opt-in `planned: "hub"`: an item with no live page links to the folder's Overview page and is
        # flagged planned=True (templates add data-planned="true"). Without the flag such items are dropped.
        folder = node["nav_folder"]
        hub = next((c for key, c in idx.items() if c["folder"] == folder and c.get("overview")), None)
        hub_slug = hub.get("target_slug") if hub else None
        out = []
        for key, c in idx.items():
            if c["folder"] != folder or c.get("overview"):
                continue
            slug = c.get("target_slug")
            planned = False
            if not slug or slug not in pages:
                if node.get("planned") != "hub" or not hub_slug or hub_slug not in pages:
                    continue
                slug, planned = hub_slug, True
            out.append({"href": pages[slug]["url"], "link_text": c["label"], "text": c["label"], **({"planned": True} if planned else {})})
        return out
    if "nav" in node:
        it = idx.get(node.pop("nav"))
        slug = it.get("target_slug") if it else None
        if not slug or slug not in pages:
            return None
        node["href"] = pages[slug]["url"]
        node["link_text"] = f'{it["folder"]} overview' if it.get("overview") else it["label"]
        node.setdefault("text", node["link_text"])
    if "page" in node:
        node["href"] = pages[node.pop("page")]["url"]
    if node.pop("lines_from", None) == "closing":
        only = node.pop("only", None) or ("Address", "Phone Number", "Email")
        node["lines"] = [l for l in closing["lines"] if l["label"] in only]
    if node.pop("phone_from", None) == "closing":
        ph = next((l for l in closing["lines"] if l["label"] == "Phone Number"), None)
        node["phone"] = {"text": ph["text"], "href": ph.get("href")} if ph else None
    return {k: resolve_refs(v, idx, pages, closing) for k, v in node.items()}


def filled(m):
    return sum(1 for v in m["slots"].values() if v not in (None, "", [], {}))


def pick_samples(pages):
    """One real instance per (module, variant): prefer the test pages, then the fullest small instance."""
    best = {}
    for slug, p in pages.items():
        for idx, m in enumerate(p["modules"]):
            key = (m["module"], m.get("variant", ""))
            size = len(json.dumps(m["slots"], ensure_ascii=False))
            score = filled(m) * 10 + (30 if slug in TEST_PAGES else 0) - (size // 400 if size > 3500 else 0)
            if key not in best or score > best[key][0]:
                best[key] = (score, slug, idx)
    out = {}
    for key, (_, slug, idx) in best.items():
        out[key] = (slug, json.loads(json.dumps(pages[slug]["modules"][idx])))
    return out


def build_closing():
    """Design-free `closing` object from the live site's shared contact block (content/_shared-blocks.json names
    the block, one crawled page supplies the order): heading ("Get in touch with us"), the firm paragraph, and
    the contact lines [{label, text, href}] (Address, Phone Number, Fax Number, Email). Concept-agnostic; a
    concept may render any of it."""
    sc = ROOT / "content" / "_shared-closings.json"
    cb = (json.loads(sc.read_text()).get("closing_band") if sc.exists() else None)
    if cb:   # Reliance: the stock closing sentence is recorded in _shared-closings.json (closing_band); there is no shared contact block
        return {"heading": cb.get("title", ""), "text": cb.get("text", ""), "lines": []}
    shared = json.loads(SHARED.read_text())["blocks"]
    heading = next((b["block"]["text"] for b in sorted(shared, key=lambda b: -b["count"]) if b["block"]["type"] == "h2"), "")
    text = next((b["block"]["text"] for b in shared if b["block"]["type"] == "text" and len(b["block"]["text"]) > 80), "")
    lines = []
    for f in sorted(PAGES.glob("*.json")):
        blocks = [b for b in json.loads(f.read_text())["blocks"] if b.get("shared") and b.get("component") == "blurb"]
        if len(blocks) >= 8:
            for h, v in zip(blocks[0::2], blocks[1::2]):
                if h["type"] == "h4":
                    m = re.fullmatch(r"\[([^\]]*)\]\(([^)]*)\)", v["text"].strip())
                    lines.append({"label": h["text"], "text": m.group(1) if m else v["text"], **({"href": m.group(2)} if m else {})})
            break
    return {"heading": heading, "text": text, "lines": lines}


def build_post_index(pages):
    """slug -> {title, url, date, categories} for every post page; category slug -> {title, url}."""
    posts, cats = {}, {}
    for slug, d in pages.items():
        f = PAGES / f"{slug}.json"
        post = json.loads(f.read_text()).get("post") if f.exists() else None
        if post and post.get("date") and d["template"] in ("article", "video-post"):
            posts[slug] = {"slug": slug, "title": d["title"], "url": d["url"], "date": post["date"][:10], "categories": post.get("categories", [])}
        if slug.startswith("category__"):
            cats[slug[len("category__"):]] = {"title": re.sub(r"\s+Archives$", "", d["title"]).rstrip(": "), "url": d["url"]}
    return posts, cats


def related_posts(slug, posts, cats, n=3):
    """Up to n other posts from the same category, nearest in date first (design-free)."""
    me = posts.get(slug)
    if not me:
        return None
    ordered = [c for c in me["categories"] if c in cats]
    for c in ordered:
        peers = [p for p in posts.values() if p["slug"] != slug and c in p["categories"]]
        if len(peers) >= 2:
            y, mo, d = (int(x) for x in me["date"].split("-"))
            key = lambda p: abs((int(p["date"][:4]) - y) * 372 + (int(p["date"][5:7]) - mo) * 31 + int(p["date"][8:10]) - d)
            peers.sort(key=key)
            return {"category": {"slug": c, **cats[c]}, "posts": [{k: p[k] for k in ("title", "url", "date")} for p in peers[:n]]}
    return None


def tag_related(slug, pages, tags, n=3):
    """build.related_by_tag: other articles with the same scope.tag (the next n after this one, in slug order), same shape as
    related_posts (design-free). `tags` maps tag -> title."""
    me = pages.get(slug, {})
    tag = (me.get("scope") or {}).get("tag")
    if not tag or me.get("template") != "insight-article":
        return None
    peers = sorted(s for s, p in pages.items() if (p.get("scope") or {}).get("tag") == tag and p.get("template") == "insight-article")
    if slug not in peers or len(peers) < 2:
        return None
    i = peers.index(slug)
    pick = [peers[(i + k) % len(peers)] for k in range(1, min(n, len(peers) - 1) + 1)]
    return {"category": {"slug": tag, "title": tags.get(tag, tag), "url": ""},
            "posts": [{"title": pages[s]["title"], "url": pages[s]["url"], "date": ""} for s in pick]}


def apply_scope_paths(pages, proposed_files):
    """build.use_scope_paths (Reliance): structured pages keep their live URL in `url`; their mockup path is scope.new_path.
    Sets p["url"] to the new URL (live one kept as p["live_url"]), fills OLD2NEW (so links to old URLs resolve), and returns
    the slugs not built on their own: roles in build.skip_roles (merged pages) and slugs a proposed page `consolidates`."""
    skip = set()
    for f in proposed_files:
        skip |= set(json.loads(f.read_text()).get("consolidates", []))
    for slug, p in pages.items():
        sc = p.get("scope") or {}
        if not sc.get("new_path"):
            continue
        p["live_url"] = p["url"]
        old = sc.get("old_path", "").strip("/")
        new = sc["new_path"].strip("/")
        if old:
            OLD2NEW[old] = new
        p["url"] = f"https://{HOST if HOST.startswith('www.') else 'www.' + HOST}/" + (new + "/" if new else "")
        if sc.get("role") in CFG["build"].get("skip_roles", []):
            skip.add(slug)
    return skip


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.add_argument("--concept", required=True)
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--pages")
    g.add_argument("--all", action="store_true")
    a = ap.parse_args()

    r = Renderer(a.concept)
    r.closing = build_closing()
    pages = {}
    ex = json.loads(EXCLUDED.read_text()) if EXCLUDED.exists() else {}
    ex_slugs = {e["slug"] for g in ("stock_posts", "video_posts", "listings", "other") for e in ex.get(g, [])}
    for f in sorted(STRUCT.glob("*.json")):
        if f.name.startswith("_"):
            continue
        d = json.loads(f.read_text())
        if d["slug"] in ex_slugs:
            continue
        pages[d["slug"]] = d
    skip = set()
    if CFG["build"].get("use_scope_paths"):
        skip = apply_scope_paths(pages, sorted(PROPOSED.glob("*.json")) if PROPOSED.exists() else [])
    if a.all:
        slugs = [x for x in pages if x not in skip]
    elif a.pages:
        slugs = a.pages.split(",")
    else:
        slugs = TEST_PAGES
    missing = [s for s in slugs if s not in pages]
    if missing:
        sys.exit(f"no structured data for: {missing} (run tools/modulize.py)")

    # proposed pages (content/proposed/<slug>.json) replace the live version in the main build; the live version
    # is also rendered at live/<slug>/ for before/after comparison
    nav_def = json.loads(NAV.read_text())
    live_pages, proposed = {}, []
    for f in sorted(PROPOSED.glob("*.json")) if PROPOSED.exists() else []:
        d = json.loads(f.read_text())
        if d["slug"] in pages:
            live_pages[d["slug"]] = pages[d["slug"]]
        pages[d["slug"]] = d
        proposed.append(d["slug"])
    for slug in proposed:  # after all pages are loaded, so refs to any slug resolve
        pages[slug] = resolve_refs(pages[slug], nav_index(nav_def), pages, r.closing)

    for p in pages.values():   # territory of a page: its own `tier`, else the tier its scope names (a concept may style by it)
        if not p.get("tier") and (p.get("scope") or {}).get("tier"):
            p["tier"] = p["scope"]["tier"]
    if a.all:  # proposed pages with no live counterpart (videos, consultation/...) are new pages
        slugs += [s for s in proposed if s not in slugs]
    posts, cats = build_post_index(pages)
    # post-feed teasers carry the post's date when the teaser links to a known post (derived from data)
    by_url = {p["url"].rstrip("/"): p["date"] for p in posts.values()}
    for p in pages.values():
        for m in p["modules"]:
            if m["module"] == "post-feed":
                for t in m["slots"].get("posts", []):
                    d = by_url.get(t["href"].rstrip("/"))
                    if d:
                        t["date"] = d
    out = MOCK / a.concept
    out.mkdir(parents=True, exist_ok=True)
    for f in r.dir.iterdir():
        if f.is_file() and f.name != "concept.json" and not f.name.startswith("."):
            shutil.copy(f, out / f.name)
        elif f.is_dir() and f.name not in ("modules", "templates") and not f.name.startswith("."):   # e.g. assets/
            shutil.copytree(f, out / f.name, dirs_exist_ok=True)
    r.state["built"] = {url_path(pages[s]["url"]) for s in slugs}
    r.redirects = {}
    for g in ("stock_posts", "video_posts", "listings", "other"):
        for e in ex.get(g, []):
            if e.get("redirect"):
                r.redirects[url_path(e["url"])] = url_path(e["redirect"])
    built_slugs = set(slugs)
    r.built_slugs, r.pages = built_slugs, pages
    tmeta = json.loads(KIT_TEMPLATES.read_text())["templates"]

    for s in slugs:
        p = json.loads(json.dumps(pages[s]))
        path = url_path(p["url"])
        dest = out / path / "index.html" if path else out / "index.html"
        dest.parent.mkdir(parents=True, exist_ok=True)
        nav = resolve_nav(nav_def, s, pages, built_slugs, "../" * (len(path.split("/")) if path else 0))
        r.related = related_posts(s, posts, cats) or (tag_related(s, pages, CFG["build"].get("tag_titles", {})) if CFG["build"].get("related_by_tag") else None)
        dest.write_text(r.render_page(p, nav))
        if s in live_pages:
            lp = json.loads(json.dumps(live_pages[s]))
            lp["live_back"] = "../../" + (path + "/" if path else "") + "index.html"
            ldest = out / "live" / s / "index.html"
            ldest.parent.mkdir(parents=True, exist_ok=True)
            lnav = resolve_nav(nav_def, s, pages, built_slugs, "../../")
            ldest.write_text(r.render_page(lp, lnav, "../../"))
    print(f"built {len(slugs)} pages -> {out}")

    # kit.html
    nav0 = resolve_nav(nav_def, None, pages, built_slugs, "")
    samples = pick_samples(pages)
    r.state["root"] = ""
    r.state["built"] = {url_path(pages[s]["url"]) for s in slugs}
    kit = []
    for name in r.modfiles:
        doc = r.module_doc(name)
        inst = []
        for (mod, var), (slug, m) in sorted(samples.items(), key=lambda kv: kv[0][1]):
            if mod != name:
                continue
            m["tone"] = "a"
            if var or mod in r.cfg.get("tones", {}).get("fixed", {}):
                m["tone"] = r.cfg.get("tones", {}).get("fixed", {}).get(f"{mod}:{var}") or r.cfg.get("tones", {}).get("fixed", {}).get(mod, "a")
            inst.append({"variant": var, "slug": slug, "url": pages[slug]["url"], "slots": m["slots"],
                         "html": r.render_module(m, pages[slug])})
        kit.append({"name": name, "file": r.modfiles[name], "doc": doc, "instances": inst})
    page = {"title": "Kit", "url": "", "modules": [], "template": "_kit"}
    r.related = None
    r.env.globals["footer"] = build_footer(r.footer_def, nav0, r.closing, pages, built_slugs)
    (out / "kit.html").write_text(r.sanitize(r.env.get_template("_kit.html").render(kit=kit, root="", page=page, templates=tmeta, nav=nav0, closing=r.closing, related=None), "kit.html"))

    # pages.html
    groups = {}
    for s, p in sorted(pages.items()):
        if s in skip:
            continue
        groups.setdefault(p["template"], []).append(
            {"slug": s, "title": p["title"], "url": p["url"], "path": url_path(p["url"]), "built": s in slugs,
             "modules": [m["module"] for m in p["modules"]], "tier": p.get("tier"), "scope": p.get("scope")})
    page = {"title": "Pages", "url": "", "modules": [], "template": "_pages"}
    r.env.globals["footer"] = build_footer(r.footer_def, nav0, r.closing, pages, built_slugs)
    (out / "pages.html").write_text(r.sanitize(r.env.get_template("_pages.html").render(groups=groups, templates=tmeta, root="", page=page, nav=nav0, total=len(pages), built=len(slugs), closing=r.closing, related=None), "pages.html"))
    print("wrote kit.html, pages.html")
    print("link rewrites (all pages, both kit/pages and live copies):", r.stats)
    print(f"live-site links: {len(r.unresolved)} unresolved (text kept, link removed), {len(r.downloads)} file downloads left on the live site")
    if a.all:
        recs = sorted(r.unresolved.values(), key=lambda x: (x["source_page"], x["link_text"], x["url"]))
        (ROOT / "content" / "unresolved-links.json").write_text(json.dumps({
            "_about": "Links on the live site to pages that were never crawled or do not exist in the mockup. The mockup shows the text without a link. To-do for the owner: decide whether each page should exist. Rebuilt by tools/build.py --all.",
            "unresolved": recs,
            "file_downloads": [{"url": u, "used_on": sorted(v)} for u, v in sorted(r.downloads.items())]}, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
