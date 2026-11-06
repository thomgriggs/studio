#!/usr/bin/env python3
"""Extract content + SEO from saved HTML in site/raw (no network, no code execution).
Usage: extract.py --project <dir>   (rerunnable; rewrites content/pages, content/_global.*, _shared-blocks.json, csv/xlsx outputs)"""
import csv, hashlib, json, re, sys, time
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup, NavigableString, Tag, Comment, CData, ProcessingInstruction, Doctype, Declaration
from common import *

sys.setrecursionlimit(20000)
CONTENT = ROOT / "content"
PAGES = CONTENT / "pages"
SHARED_MIN = CFG["shared_min"]  # shared when block appears in main region of MORE than this many pages
SEL = CFG["selectors"]

SKIP_TAGS = {"script", "style", "noscript", "template", "svg", "head", "meta", "link", "title", "input", "select",
             "textarea", "option", "canvas", "map", "area", "datalist", "audio", "source", "track", "param", "base"}
HEADINGS = {"h1", "h2", "h3", "h4", "h5", "h6"}
INLINE_TAGS = {"a", "span", "strong", "b", "em", "i", "u", "small", "sup", "sub", "mark", "code", "abbr", "time",
               "font", "label", "cite", "s", "del", "ins", "q", "big", "kbd", "var", "bdi", "bdo", "br", "wbr",
               "tt", "samp", "dfn", "data", "nobr"}
BLOCKISH = {"div", "p", "ul", "ol", "li", "table", "blockquote", "section", "article", "aside", "header", "footer",
            "nav", "main", "form", "figure", "hr", "dl", "dt", "dd", "pre", "address", "details", "summary",
            "iframe", "video", "object", "embed", "img", "picture", "button", "fieldset", "center"} | HEADINGS
SKIP_CLASS = re.compile(CFG["skip_class_regex"], re.I)
SKIP_ID = re.compile(CFG["skip_id_regex"], re.I)
GENERIC_MODULES = {"section", "row", "column", "text", "image", "code", "row_inner", "column_inner", "post_title",
                   "fullwidth_post_title", "divider", "module", "button_module_wrapper", "button", "fullwidth_section"}
MODULE_MAP = {"tabs": "tab", "slide": "slider", "fullwidth_slider": "slider", "number_counter": "counter",
              "circle_counter": "counter", "fullwidth_header": "fullwidth_header", "toggle": "toggle",
              "accordion_item": "accordion", "contact_form": "contact_form"}

def norm(s):
    return re.sub(r"\s+", " ", (s or "").replace("\xa0", " ")).strip()

def abs_url(base, href):
    href = (href or "").strip()
    if not href or href.startswith(("javascript:", "data:")): return None
    try:
        return urljoin(base, href)
    except Exception:
        return href

def hidden(el):
    if el.name in SKIP_TAGS: return el.name not in ("script",)
    if el.has_attr("hidden"): return True
    st = el.get("style") or ""
    if re.search(r"display\s*:\s*none|visibility\s*:\s*hidden", st, re.I): return True
    cls = " ".join(el.get("class") or [])
    if cls and SKIP_CLASS.search(cls): return True
    i = el.get("id") or ""
    if i and SKIP_ID.search(i): return True
    if el.get("aria-hidden") == "true" and el.name in ("div", "section") and not norm(el.get_text()): return True
    return False

def is_button(a):
    cls = " ".join(a.get("class") or []).lower()
    return bool(re.search(r"button|btn", cls)) or a.get("role") == "button"

def link_fallback_text(a):
    t = a.get("title") or a.get("aria-label")
    if t: return norm(t)
    img = a.find("img")
    if img and img.get("alt"): return norm(img["alt"])
    for c in a.get("class") or []:
        m = re.match(r"et-social-(\w+)", c)
        if m: return m.group(1)
    p = a.find_parent("li")
    if p:
        for c in p.get("class") or []:
            m = re.match(r"et-social-(\w+)", c)
            if m and m.group(1) != "icon": return m.group(1)
    return ""

def inline(nodes, base, skip_lists=False, wrap=None, sep_blocks="\n"):
    """Render nodes (list or Tag) to (markdown text, links)."""
    parts, links = [], []
    def rec(n):
        if isinstance(n, (Comment, CData, ProcessingInstruction, Doctype, Declaration)): return
        if isinstance(n, NavigableString):
            parts.append(re.sub(r"[\ue000-\uf8ff\u200b\u200c\u200d\ufeff]", "", str(n))); return
        if not isinstance(n, Tag): return
        nm = n.name
        if nm == "script" or hidden(n): return
        if skip_lists and nm in ("ul", "ol"): return
        if nm == "br": parts.append("\n"); return
        if nm in ("img", "iframe", "video", "form", "svg", "picture"): return
        if nm == "a":
            href = abs_url(base, n.get("href"))
            if href and n.get("href", "").strip() == "#": href = None
            start = len(parts)
            for c in n.children: rec(c)
            txt = "".join(parts[start:]); del parts[start:]
            t = norm(txt)
            if not t: t = link_fallback_text(n); txt = t
            if href and t:
                links.append({"text": re.sub(r"[*_]{1,2}", "", t) if "**" in t else t, "href": href})
                parts.append(" " if txt[:1].isspace() else "")
                parts.append(f"[{t}]({href})")
                parts.append(" " if txt[-1:].isspace() else "")
            else:
                parts.append(txt)
            return
        if nm in ("strong", "b", "em", "i", "u"):
            if nm in ("em", "i", "b") and re.search(r"(^|\s)(fa|fas|far|fab|icon|et-pb-icon|dashicons)", " ".join(n.get("class") or [])): return
            start = len(parts)
            for c in n.children: rec(c)
            inner = "".join(parts[start:]); del parts[start:]
            core = inner.strip()
            if not core or nm == "u": parts.append(inner); return
            mk = "**" if nm in ("strong", "b") else "*"
            if "\n" in core:
                parts.append(inner); return
            parts.append((" " if inner[:1].isspace() else "") + mk + core + mk + (" " if inner[-1:].isspace() else ""))
            return
        isblock = nm in BLOCKISH
        if isblock: parts.append(sep_blocks)
        for c in n.children: rec(c)
        if isblock: parts.append(sep_blocks)
    for n in (nodes if isinstance(nodes, list) else [nodes]): rec(n) if not isinstance(nodes, Tag) else [rec(c) for c in nodes.children]
    txt = re.sub(r"[\ue000-\uf8ff\u200b\u200c\u200d\ufeff]", "", "".join(parts).replace("\xa0", " "))
    lines = [re.sub(r"[ \t\r\f\v]+", " ", l).strip() for l in txt.split("\n")]
    # collapse blank runs
    out, blank = [], 0
    for l in lines:
        if l: out.append(l); blank = 0
        else:
            blank += 1
            if blank == 1 and out: out.append("")
    txt = "\n".join(out).strip()
    if wrap and txt:
        txt = f"[{txt}]({wrap})"; links = [{"text": re.sub(r"\s+", " ", re.sub(r"[\[\]*]", "", txt.split("](")[0])).strip(), "href": wrap}] + links
    return txt, links

def plain(md):
    return norm(re.sub(r"\*+", "", re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", md)))

def provider(src):
    h = (urlparse(src).hostname or "").lower()
    if "youtube" in h or "youtu.be" in h: return "youtube"
    if "wistia" in h: return "wistia"
    if "vimeo" in h: return "vimeo"
    if "google" in h and "map" in (src or "").lower(): return "google-maps"
    if "calendly" in h: return "calendly"
    return "other"

def module_name(el):
    cls = el.get("class") or []
    if "et_pb_module" not in cls and "et_pb_section" not in cls: return None
    for c in cls:
        m = re.match(r"et_pb_([a-z_]+?)_\d+$", c)
        if m and m.group(1) not in GENERIC_MODULES and not m.group(1).startswith(("column", "row", "section")):
            return MODULE_MAP.get(m.group(1), m.group(1))
    return None

URL_RE = re.compile(r"url\(\s*['\"]?([^'\")]+?)['\"]?\s*\)")

def parse_style_bgs(soup):
    """Map divi class -> background image URLs from <style> blocks (non-hover, non-pseudo)."""
    m = defaultdict(list)
    for st in soup.find_all("style"):
        css = st.string or st.get_text() or ""
        if "url(" not in css or "et_pb_" not in css: continue
        css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
        for sel, body in re.findall(r"([^{}@]+)\{([^{}]*)\}", css):
            if "background" not in body or "url(" not in body: continue
            for decl in body.split(";"):
                if not re.match(r"\s*background(-image)?\s*:", decl): continue
                urls = URL_RE.findall(decl)
                if not urls: continue
                for s in sel.split(","):
                    s = s.strip()
                    if ":" in s and not re.search(r":(not|nth|first|last)", s): continue
                    last = re.split(r"[\s>+~]+", s)[-1]
                    for cn in re.findall(r"\.(et_pb_[a-z_]+_\d+)", last):
                        for u in urls:
                            if not u.startswith("data:") and u not in m[cn]: m[cn].append(u)
    return m

class Walker:
    def __init__(self, base, bgmap, region):
        self.base, self.bgmap, self.region = base, bgmap, region
        self.out, self.seen = [], set()
        self.media_after = []

    def emit(self, b, ctx):
        d = {"type": b.pop("type")}
        d.update(b)
        if ctx.get("component") and "component" not in d: d["component"] = ctx["component"]
        d["region"] = self.region
        self.out.append(d)

    # ---- images
    def img_block(self, img, ctx, wrap=None, source="img"):
        src = None
        for k in ("src", "data-src", "data-lazy-src", "data-lazy-srcset"):
            v = img.get(k)
            if v and not v.startswith("data:"): src = v.split()[0] if k.endswith("srcset") else v; break
        if not src: return
        src = abs_url(self.base, src)
        if not src: return
        alt = img.get("alt")
        b = {"type": "img", "src": src, "alt": norm(alt) if alt else "", "alt_missing": not bool(norm(alt or "")),
             "title": norm(img.get("title") or ""), "width": img.get("width") or "", "height": img.get("height") or "",
             "source": source}
        if wrap: b["link_href"] = wrap
        self.emit(b, ctx)

    def bg_blocks(self, el, ctx):
        urls = []
        m = re.search(r"background(?:-image)?\s*:[^;]*", el.get("style") or "", re.I)
        if m: urls += URL_RE.findall(m.group(0))
        for k in ("data-background-image", "data-bg", "data-bg-url", "data-background"):
            if el.get(k): urls += URL_RE.findall(el[k]) or [el[k]]
        for cn in el.get("class") or []:
            if cn in self.bgmap: urls += self.bgmap[cn]
        for u in dict.fromkeys(urls):
            u = abs_url(self.base, u)
            if u and not u.startswith("data:"):
                self.emit({"type": "img", "src": u, "alt": "", "alt_missing": False, "title": "", "width": "",
                           "height": "", "source": "css-background"}, ctx)

    # ---- containers
    def walk_children(self, parent, ctx, leaf=None):
        buf = []
        def flush():
            if not buf: return
            nodes = list(buf); buf.clear()
            md, links = inline(nodes, self.base, wrap=ctx.get("wrap"))
            if not md.strip(): return
            real = [n for n in nodes if not (isinstance(n, NavigableString) and not str(n).strip())]
            if leaf is None:
                if len(real) == 1 and isinstance(real[0], Tag) and real[0].name == "a" and not ctx.get("wrap"):
                    a = real[0]
                    self.emit({"type": "a", "text": plain(md), "href": links[0]["href"] if links else "", "is_button": is_button(a)}, ctx)
                else:
                    self.emit({"type": "text", "text": md, "links": links}, ctx)
            elif leaf[0] == "p":
                self.emit({"type": "p", "text": md, "links": links}, ctx)
            else:
                b = {"type": leaf[0], "text": md, "links": links}
                if leaf[1]: b = {"type": leaf[0], "text": md, "id": leaf[1], "links": links}
                self.emit(b, ctx)
        for ch in parent.children:
            if isinstance(ch, (Comment, CData, ProcessingInstruction, Doctype, Declaration)): continue
            if isinstance(ch, NavigableString): buf.append(ch); continue
            if not isinstance(ch, Tag): continue
            nm = ch.name
            if nm == "script": flush(); self.script(ch, ctx); continue
            if hidden(ch): continue
            if nm in INLINE_TAGS:
                if nm == "a" and is_button(ch) and not ch.find(["img", "div", "p"]):
                    flush()
                    md, links = inline([ch], self.base)
                    if md.strip(): self.emit({"type": "a", "text": plain(md), "href": links[0]["href"] if links else "", "is_button": True}, ctx)
                    continue
                if not self.complex_inline(ch):
                    buf.append(ch); continue
            flush()
            self.block(ch, ctx, leaf)
        flush()

    def complex_inline(self, el):
        return bool(el.find(list(BLOCKISH | {"script"}))) and el.name != "br"

    def script(self, el, ctx):
        src = el.get("src") or ""
        txt = el.string or el.get_text() or ""
        blob = (src + " " + txt).lower()
        fm = next((m for m in CFG["form_markers"] if re.search(m["match"], blob, re.I)), None)
        se = next((m for m in CFG["script_embeds"] if re.search(m["match"], blob, re.I)), None)
        if fm:
            h = hashlib.md5(txt.encode()).hexdigest() if txt else src
            if ("lm", h) not in self.seen:
                self.seen.add(("lm", h)); self.emit({"type": "form", "note": fm["note"]}, ctx)
        elif se:
            k = ("se", se["provider"], src or hashlib.md5(txt.encode()).hexdigest())
            if k not in self.seen:
                self.seen.add(k)
                self.emit({"type": "embed", "provider": se["provider"], "src": abs_url(self.base, src) if src else "(inline script)", "title": se.get("title", "")}, ctx)
        elif "wistia" in src.lower() and "embed" in src.lower():
            if ("w", src) not in self.seen:
                self.seen.add(("w", src)); self.emit({"type": "embed", "provider": "wistia", "src": abs_url(self.base, src), "title": ""}, ctx)

    def block(self, el, ctx, leaf):
        nm = el.name
        cls = " ".join(el.get("class") or [])
        mod = module_name(el)
        if mod:
            cur = ctx.get("component")
            if not (cur in ("accordion", "tab", "slider") and mod in ("toggle", "tab", "slide", "slider")):
                ctx = dict(ctx, component=mod)
        if nm in HEADINGS:
            self.walk_children(el, ctx, (nm, el.get("id")));  return
        if nm == "p":
            self.walk_children(el, ctx, ("p", None)); return
        if nm in ("ul", "ol"): self.list(el, ctx); return
        if nm == "table": self.table(el, ctx); return
        if nm == "blockquote":
            md, links = inline(el, self.base, sep_blocks="\n\n")
            if md: self.emit({"type": "blockquote", "text": md, "links": links}, ctx)
            for im in el.find_all("img"): self.img_block(im, ctx)
            return
        if nm == "hr": self.emit({"type": "hr"}, ctx); return
        if nm == "img": self.img_block(el, ctx, wrap=ctx.get("wrap")); return
        if nm == "picture":
            im = el.find("img")
            if im: self.img_block(im, ctx, wrap=ctx.get("wrap"))
            return
        if nm in ("iframe", "embed", "object"):
            src = abs_url(self.base, el.get("src") or el.get("data-src") or el.get("data-lazy-src") or el.get("data") or "")
            if src and ("e", src) not in self.seen:
                self.seen.add(("e", src))
                self.emit({"type": "embed", "provider": provider(src), "src": src, "title": norm(el.get("title") or "")}, ctx)
            return
        if nm == "video":
            src = el.get("src") or (el.find("source") or {}).get("src") if el.find("source") else el.get("src")
            src = abs_url(self.base, src or "")
            self.emit({"type": "embed", "provider": provider(src or ""), "src": src or "", "title": norm(el.get("title") or "")}, ctx); return
        if nm == "wistia-player":
            self.emit({"type": "embed", "provider": "wistia", "src": "https://fast.wistia.com/embed/medias/" + (el.get("media-id") or ""), "title": ""}, ctx); return
        if nm == "form":
            ident = (cls + " " + (el.get("id") or "") + " " + (el.get("action") or "")).lower()
            anc = " ".join(" ".join(p.get("class") or []) for p in el.parents if isinstance(p, Tag))
            if "search" in ident: return
            fmk = next((m for m in CFG["form_markers"] if re.search(m["match"], ident, re.I)), None)
            if fmk: note = fmk["note"]
            elif "comment" in ident: note = "comment form"
            elif "wpcf7" in ident or "wpcf7" in anc: note = "contact form (Contact Form 7)"
            elif "et_pb_contact" in anc or "contact" in ident: note = "contact form"
            elif "subscribe" in ident or "newsletter" in ident or "signup" in ident or "et_pb_newsletter" in anc: note = "newsletter signup"
            else: note = "form"
            self.emit({"type": "form", "note": note}, ctx); return
        if nm == "button":
            t = norm(el.get_text())
            if t: self.emit({"type": "text", "text": t, "links": []}, ctx)
            return
        if nm == "a":  # complex anchor wrapping blocks/images
            href = abs_url(self.base, el.get("href")) if el.get("href", "#").strip() not in ("#", "") else None
            c2 = dict(ctx, wrap=href)
            self.walk_children(el, c2, leaf); return
        if nm in INLINE_TAGS or nm == "picture":
            self.walk_children(el, ctx, leaf); return
        # generic container
        if "et_pb_map" in (el.get("class") or []) and el.get("data-center-lat"):
            pin = el.find_next_sibling(class_="et_pb_map_pin")
            self.emit({"type": "embed", "provider": "google-maps", "src": f"https://www.google.com/maps?q={el['data-center-lat']},{el.get('data-center-lng','')}",
                       "title": norm(pin.get("data-title") if pin else "")}, ctx)
            return
        if re.search(r"wistia_async_([A-Za-z0-9]+)", cls):
            mid = re.search(r"wistia_async_([A-Za-z0-9]+)", cls).group(1)
            if ("w", mid) not in self.seen:
                self.seen.add(("w", mid))
                self.emit({"type": "embed", "provider": "wistia", "src": "https://fast.wistia.com/embed/medias/" + mid, "title": ""}, ctx)
            return
        c2 = dict(ctx, wrap=None) if ctx.get("wrap") and nm in ("section",) else ctx
        self.bg_blocks(el, c2)
        self.walk_children(el, c2, None)

    def list(self, el, ctx):
        media = []
        def build(lst):
            items = []
            for li in lst.find_all(["li", "ul", "ol"], recursive=False):
                if hidden(li): continue
                if li.name in ("ul", "ol"):  # invalid markup: list directly inside list -> child of previous item
                    sub = build(li)
                    if sub:
                        if items: items[-1]["children"].append(sub)
                        else: items.append({"text": "", "links": [], "children": [sub]})
                    continue
                md, links = inline(li, self.base, skip_lists=True)
                md = re.sub(r"\s*\n\s*", " ", md)
                subs = [x for x in li.find_all(["ul", "ol"]) if x.find_parent("li") is li and not hidden(x)]
                kids = [build(s) for s in subs]
                kids = [k for k in kids if k]
                media.extend(im for im in li.find_all("img") if not any(im in s.descendants for s in subs))
                if md or kids:
                    items.append({"text": md, "links": links, "children": kids})
            if not items: return None
            return {"type": lst.name, "items": items}
        b = build(el)
        if b:
            self.emit(b, ctx)
        for im in media: self.img_block(im, ctx)

    def table(self, el, ctx):
        rows, header = [], False
        for tr in el.find_all("tr"):
            if tr.find_parent("table") is not el: continue
            cells = [inline(c, self.base)[0].replace("\n", " ") for c in tr.find_all(["td", "th"], recursive=False)]
            if tr.find("th") and not rows: header = True
            if any(cells): rows.append(cells)
        if rows: self.emit({"type": "table", "rows": rows, "header": header}, ctx)

def collect(el, base, bgmap, region, component=None):
    w = Walker(base, bgmap, region)
    ctx = {"component": component}
    w.bg_blocks(el, ctx)
    w.walk_children(el, ctx, None)
    return w.out

# ---------------- SEO / meta
def meta(soup, **kw):
    t = soup.find("meta", attrs=kw)
    return norm(t.get("content")) if t and t.get("content") else ""

def jsonld(soup):
    types, graph = [], []
    for s in soup.find_all("script", type="application/ld+json"):
        try: d = json.loads(s.string or s.get_text() or "")
        except Exception: continue
        items = d.get("@graph", [d]) if isinstance(d, dict) else d
        for it in items if isinstance(items, list) else [items]:
            if not isinstance(it, dict): continue
            graph.append(it)
            t = it.get("@type")
            for x in (t if isinstance(t, list) else [t]):
                if x and x not in types: types.append(x)
    return types, graph

def extract_seo(soup):
    types, graph = jsonld(soup)
    title = soup.find("title")
    h = soup.find("html")
    seo = {
        "title_tag": norm(title.get_text()) if title else "",
        "meta_description": meta(soup, name="description"),
        "meta_keywords": meta(soup, name="keywords"),
        "canonical": (soup.find("link", rel="canonical") or {}).get("href", "") if soup.find("link", rel="canonical") else "",
        "robots": meta(soup, name="robots"),
        "og_title": meta(soup, property="og:title"),
        "og_description": meta(soup, property="og:description"),
        "og_image": meta(soup, property="og:image"),
        "twitter_card": meta(soup, name="twitter:card"),
        "lang": (h.get("lang") if h else "") or "",
        "json_ld_types": types,
        "h1_count": len([x for x in soup.body.find_all("h1") if not hidden(x)]) if soup.body else 0,
    }
    if CFG["yoast"]:
        cm = [str(c) for c in soup.find_all(string=lambda t: isinstance(t, Comment)) if "Yoast SEO" in str(c)]
        v = re.search(r"Yoast SEO plugin v?([\d.]+)", " ".join(cm))
        seo["yoast"] = {"present": bool(cm) or bool(soup.find("script", class_="yoast-schema-graph")),
                        "version": v.group(1) if v else "", "schema_graph": bool(soup.find("script", class_="yoast-schema-graph")),
                        "og_type": meta(soup, property="og:type"), "og_site_name": meta(soup, property="og:site_name"),
                        "article_modified": meta(soup, property="article:modified_time"),
                        "reading_time": meta(soup, name="twitter:data1") if "reading" in meta(soup, name="twitter:label1").lower() else ""}
    return seo, graph

def extract_post(soup, graph, main):
    p = {"date": "", "author": "", "categories": [], "tags": []}
    p["date"] = meta(soup, property="article:published_time")
    for it in graph:
        if it.get("@type") == "Article" or (isinstance(it.get("@type"), list) and "Article" in it["@type"]):
            p["date"] = p["date"] or it.get("datePublished", "")
            for k, dst in (("articleSection", "categories"), ("keywords", "tags")):
                v = it.get(k)
                if v: p[dst] = v if isinstance(v, list) else [v]
        if it.get("@type") == "Person" and not p["author"]: p["author"] = it.get("name", "")
    if not p["author"]: p["author"] = meta(soup, name="author") or meta(soup, name="twitter:data1")
    art = soup.find("article")
    root = soup
    cats = [norm(a.get_text()) for a in root.find_all("a", rel=lambda v: v and "category" in (v if isinstance(v, list) else v.split()))]
    tags = [norm(a.get_text()) for a in root.find_all("a", rel=lambda v: v and "tag" in (v if isinstance(v, list) else v.split())) if "category" not in (a.get("rel") or [])]
    if cats: p["categories"] = list(dict.fromkeys(cats))
    if tags: p["tags"] = list(dict.fromkeys(tags))
    if art:
        cl = art.get("class") or []
        if not p["categories"]: p["categories"] = [c[9:] for c in cl if c.startswith("category-")]
        if not p["tags"]: p["tags"] = [c[4:] for c in cl if c.startswith("tag-")]
    if not p["date"]:
        t = soup.find("span", class_="published") or soup.find("time")
        if t: p["date"] = norm(t.get("datetime") or t.get_text())
    return p

def infer_type(url):
    path = urlparse(url).path.strip("/").split("/")
    first = path[0] if path else ""
    return CFG["path_types"].get(first, "page")

def sitemap_lastmods():
    out = {}
    if SITEMAPS.exists():
        for f in SITEMAPS.iterdir():
            txt = f.read_text(errors="replace")
            for loc, lm in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>\s*<lastmod>\s*([^<\s]+)\s*</lastmod>", txt):
                out[loc] = lm[:10]
    return out

def block_key(b):
    t = b["type"]
    if t == "img": return ("img", b["src"])
    if t in ("ul", "ol"):
        def flat(items): return " | ".join(norm(i["text"]) + flat(i["children"][0]["items"]) if i["children"] else norm(i["text"]) for i in items)
        return (t, flat(b["items"]).lower())
    if t == "table": return (t, " | ".join(" ; ".join(r) for r in b["rows"]).lower())
    if t == "embed": return (t, b.get("src", ""))
    if t == "form": return (t, b.get("note", ""))
    if t == "a": return (t, (plain(b["text"]) + " " + b.get("href", "")).lower())
    if t == "hr": return None
    txt = plain(b.get("text", "")).lower()
    return (t, txt) if txt else None

def block_words(b):
    t = b["type"]
    if t in ("ul", "ol"):
        def walk(items): return sum(len(plain(i["text"]).split()) + sum(walk(k["items"]) for k in i["children"]) for i in items)
        return walk(b["items"])
    if t == "table": return sum(len(c.split()) for r in b["rows"] for c in r)
    if t in ("img", "embed", "form", "hr"): return 0
    return len(plain(b.get("text", "")).split())

def block_links(b, page_url):
    for l, bt in _block_links(b, page_url):
        if l["href"]: yield l, bt

def _block_links(b, page_url):
    t = b["type"]
    if t in ("ul", "ol"):
        def walk(items):
            for i in items:
                for l in i["links"]: yield l, t
                for k in i["children"]: yield from walk(k["items"])
        yield from walk(b["items"])
    elif t == "a": yield {"text": plain(b["text"]), "href": b["href"]}, "a"
    elif t == "img":
        if b.get("link_href"): yield {"text": "[image] " + (b["alt"] or b["src"].rsplit("/", 1)[-1]), "href": b["link_href"]}, "img"
    elif t in ("table", "embed", "form", "hr"): return
    else:
        for l in b.get("links", []): yield l, t

def classify(href):
    p = urlparse(href)
    if p.scheme in ("mailto",): return "mailto"
    if p.scheme in ("tel",): return "tel"
    if p.scheme not in ("http", "https"): return "other"
    if is_site(href): return "internal"
    return "external"

def nav_tree(ul, base):
    out = []
    for li in ul.find_all("li", recursive=False):
        a = li.find("a", recursive=False)
        if not a: continue
        href = a.get("href", "")
        node = {"text": norm(a.get_text()), "href": abs_url(base, href) if href.strip() not in ("", "#") else href}
        if SEL["nav_button_class"] and SEL["nav_button_class"] in (li.get("class") or []): node["is_button"] = True
        sub = li.find("ul", recursive=False)
        if sub: node["children"] = nav_tree(sub, base)
        out.append(node)
    return out

def sig(el):
    return hashlib.sha1(" ".join(el.stripped_strings).encode()).hexdigest()[:12] if el else None

def load_soup(f, rec):
    """Parse a raw file; pages served from the fallback copy get the fallback origin rewritten to the live origin,
    so links and image URLs read as the live site's."""
    html = f.read_bytes().decode("utf-8", "replace")
    if rec.get("source") == "fallback" and FALLBACK:
        html = html.replace(FALLBACK, PRIMARY)
    return BeautifulSoup(html, "lxml")

def load_inventory():
    """cfg.inventory = {"csv": rel path, "key_column": "url", "fields": [...]} -> {normalised path: {field: value}}"""
    c = CFG["inventory"]
    if not c: return None
    out = {}
    with open(ROOT / c["csv"], newline="", encoding="utf-8-sig") as fh:
        for r in csv.DictReader(fh):
            k = path_key(to_url(r.get(c.get("key_column", "url"), "")))
            out[k] = {f: (r.get(f) or "") for f in c["fields"]}
    return out

PHONE_RE = re.compile(r"(?<!\d)(?:\+?1[\s.\-]*)?\(?\d{3}\)?[\s.\-]*\d{3}[\s.\-]*\d{4}(?!\d)")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
ADDR_RE = re.compile(r"\d{1,6}\s+[A-Za-z0-9 .#,\-]+?,?\s+[A-Z][A-Za-z .]+,?\s+[A-Z]{2}\.?\s+\d{5}(?:-\d{4})?")

def global_extras(soup, regions, base):
    """Contact details, social links and client-login links found in the header / footer / nav / top bar of one page."""
    text, links = [], []
    for r in regions:
        if r is None: continue
        text.append(" ".join(r.stripped_strings))
        for a in r.find_all("a", href=True):
            links.append((norm(a.get_text()) or link_fallback_text(a), abs_url(base, a["href"]) or ""))
    blob = " \n ".join(text)
    phones = list(dict.fromkeys(norm(m) for m in PHONE_RE.findall(blob)))
    for t, h in links:
        if h.startswith("tel:"): phones.append(h[4:])
    emails = list(dict.fromkeys(EMAIL_RE.findall(blob) + [h[7:].split("?")[0] for t, h in links if h.startswith("mailto:")]))
    addrs = list(dict.fromkeys(norm(m) for m in ADDR_RE.findall(blob)))
    ld = []
    types, graph = jsonld(soup)
    for it in graph:
        t = it.get("@type"); t = t if isinstance(t, list) else [t]
        if any(x in ("LocalBusiness", "ProfessionalService", "AccountingService", "Organization", "Person") for x in t if x):
            ld.append({k: it[k] for k in ("@type", "name", "telephone", "email", "address", "url", "sameAs", "openingHours", "areaServed", "founder", "foundingDate") if k in it})
    social = []
    for t, h in links:
        if any(d in (urlparse(h).hostname or "") + urlparse(h).path[:12] for d in CFG["social_domains"]):
            if (h, t) not in social: social.append((h, t))
    login = [(h, t) for t, h in links if re.search(CFG["login_regex"], t + " " + h, re.I) and not h.startswith(("tel:", "mailto:"))]
    return {"phones": list(dict.fromkeys(phones)), "emails": emails, "addresses": addrs, "json_ld_organisation": ld,
            "social_links": [{"text": t, "href": h} for h, t in social],
            "client_login_links": [{"text": t, "href": h} for h, t in dict.fromkeys(login)]}

def main():
    log = json.loads(LOG.read_text())
    ul = json.loads(URLLIST.read_text())
    urls = ul["urls"]
    seed = {r["URL"].strip(): r for r in read_seed()}
    inv = load_inventory()
    lastmods = sitemap_lastmods()
    PAGES.mkdir(parents=True, exist_ok=True)
    for f in PAGES.glob("*"): f.unlink()
    pages, failed, hsigs, fsigs, gsoups = [], [], Counter(), Counter(), {}
    for u in urls:
        slug = slug_for(u); rec = log.get(u, {})
        f = RAW / f"{slug}.html"
        row = seed.get(u) or seed.get(u.rstrip("/")) or {}
        typ = (row.get("Type") or "").strip().lower() or infer_type(u)
        lm = (row.get("Last modified") or "").strip() or lastmods.get(u, "")
        page = {"url": u, "slug": slug, "type": typ, "status": rec.get("status"), "redirected_to": rec.get("redirected_to"),
                "last_modified": lm, "_name": row.get("Page name", "")}
        if rec.get("source"): page["source"] = rec["source"]
        if inv is not None: page["inventory"] = inv.get(path_key(u)) or {}
        if not f.exists():
            failed.append((u, rec.get("error") or "no raw file")); page["error"] = rec.get("error") or "no raw file"
            page.update(seo={}, blocks=[], word_count=0); pages.append(page); continue
        soup = load_soup(f, rec)
        seo, graph = extract_seo(soup)
        bgmap = parse_style_bgs(soup)
        base = rec.get("redirected_to") or u
        main_el = pick(soup, SEL["main"])
        header = pick(soup, SEL["header"])
        footer = pick(soup, SEL["footer"])
        hsigs[sig(header)] += 1; fsigs[sig(footer)] += 1
        gsoups.setdefault(("h", sig(header)), (u, soup)); gsoups.setdefault(("f", sig(footer)), (u, soup))
        page["_hsig"] = sig(header)
        blocks = []
        if main_el is not None:
            side = pick(main_el, SEL["sidebar"])
            if side is not None: side = side.extract()
            blocks = collect(main_el, base, bgmap, "main")
            page["_sidebar"] = collect(side, base, bgmap, "sidebar") if side is not None else []
        page.update(seo=seo, blocks=blocks)
        if typ == "post":
            page["post"] = extract_post(soup, graph, main_el)
        page["_body_h1"] = [norm(h.get_text()) for h in soup.body.find_all("h1") if not hidden(h)] if soup.body else []
        pages.append(page)

    # ---- global header/footer from the most common signature
    hs, fs = hsigs.most_common(1)[0][0], fsigs.most_common(1)[0][0]
    hu, hsoup = gsoups[("h", hs)]; fu, fsoup = gsoups[("f", fs)]
    hb = pick(hsoup, SEL["header"])
    fb = pick(fsoup, SEL["footer"])
    gbg = parse_style_bgs(hsoup)
    nav = pick(hsoup if SEL["nav_root"] == "page" else hb, SEL["nav"])
    logos = pick_all(hb, SEL["logo"])
    top = pick(hb, SEL["top_bar"])
    glob = {
        "source_page": hu,
        "note": f"Header variants across pages: {len(hsigs)}; footer variants: {len(fsigs)}. This is the most common ({hsigs[hs]} / {fsigs[fs]} pages).",
        "logo": [{"src": abs_url(hu, l.get("src")), "alt": norm(l.get("alt") or ""), "alt_missing": not norm(l.get("alt") or ""),
                  "link_href": abs_url(hu, l.find_parent("a").get("href")) if l.find_parent("a") else ""} for l in logos],
        "header_top_bar": collect(top, hu, gbg, "header") if top else [],
        "nav": nav_tree(nav, hu) if nav and nav.name == "ul" else [],
        "footer": collect(fb, fu, parse_style_bgs(fsoup), "footer"),
    }
    variants = []
    for sg, cnt in hsigs.most_common():
        vu, vs = gsoups[("h", sg)]
        vh = pick(vs, SEL["header"])
        vn = pick(vs if SEL["nav_root"] == "page" else vh, SEL["nav"]) if vh is not None else None
        if vn is not None and vn.name != "ul": vn = None
        variants.append({"count": cnt, "example_page": vu, "pages": [p["url"] for p in pages if p.get("_hsig") == sg],
                         "nav": nav_tree(vn, vu) if vn else []})
    glob["nav_variants"] = variants
    if CFG["global_extras"]:
        glob.update(global_extras(hsoup, [top, hb, nav if SEL["nav_root"] == "page" else None, fb if fsoup is hsoup else None], hu))
        gx = global_extras(fsoup, [fb], fu)
        for k in ("phones", "emails", "addresses", "social_links", "client_login_links"):
            for v in gx[k]:
                if v not in glob[k]: glob[k].append(v)
    glob["header_top_bar"] = [b for b in glob["header_top_bar"] if not (b["type"] == "img" and b.get("src") in {l["src"] for l in glob["logo"]})]
    ssig = lambda bl: json.dumps(bl, sort_keys=True)
    sc = Counter(ssig(p["_sidebar"]) for p in pages if p.get("_sidebar"))
    common_side = sc.most_common(1)[0][0] if sc else None
    glob["sidebar"] = {"used_on_pages": sc[common_side] if sc else 0, "blocks": json.loads(common_side) if common_side else []}
    (CONTENT / "_global.json").write_text(json.dumps(glob, indent=1, ensure_ascii=False))
    (CONTENT / "_global.md").write_text(global_md(glob))

    # ---- shared pass
    counts, sample = Counter(), {}
    for p in pages:
        seen = set()
        for b in p["blocks"]:
            k = block_key(b)
            if k and k not in seen: seen.add(k); counts[k] += 1; sample.setdefault(k, (b, p["url"]))
    shared_keys = {k for k, c in counts.items() if c > SHARED_MIN}
    shared_list = []
    for k in sorted((k for k in counts if k in shared_keys), key=lambda k: -counts[k]):  # stable: ties keep first-seen order
        b, u = sample[k]
        shared_list.append({"count": counts[k], "key": list(k), "block": {kk: vv for kk, vv in b.items() if kk != "region"}, "example_page": u})
    (CONTENT / "_shared-blocks.json").write_text(json.dumps({"threshold": f"> {SHARED_MIN} pages (main region, same type + normalized text)", "blocks": shared_list}, indent=1, ensure_ascii=False))

    # ---- per-page outputs + CSV rows
    seo_rows, img_rows, link_rows = [], [], []
    for p in pages:
        for b in p["blocks"]:
            k = block_key(b)
            if k in shared_keys: b["shared"] = True
        mainb = [b for b in p["blocks"] if not b.get("shared")]
        p["word_count"] = sum(block_words(b) for b in mainb)
        side = p.pop("_sidebar", [])
        if side and ssig(side) == common_side: p["sidebar"] = "global"; side = []
        if side: p["blocks"] = p["blocks"] + side
        p.pop("_hsig", None)
        name, h1s = p.pop("_name"), p.pop("_body_h1", [])
        out = {k: v for k, v in p.items()}
        order = ["url", "slug", "type", "source", "inventory", "status", "redirected_to", "last_modified", "seo", "post", "sidebar", "blocks", "word_count", "error"]
        out = {k: out[k] for k in order if k in out}
        (PAGES / f"{p['slug']}.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
        (PAGES / f"{p['slug']}.md").write_text(page_md(p, h1s))
        mb = [b for b in p["blocks"] if b["region"] == "main"]
        imgs = [b for b in p["blocks"] if b["type"] == "img"]
        mimgs = [b for b in imgs if b["region"] == "main"]
        lk = []
        for b in mb:
            for l, bt in block_links(b, p["url"]):
                lk.append((l["text"], l["href"], classify(l["href"]), bt, b.get("shared", False)))
        for t, h, c, bt, sh in lk:
            note = next((m["note"] for m in CFG["link_notes"] if m["match"] in h), "")
            link_rows.append([p["url"], t, h, c, bt, sh, note])
        for b in imgs:
            img_rows.append([p["url"], b["src"], b["alt"], b["alt_missing"], b["title"], b["width"], b["height"], b["source"], b["region"], b.get("shared", False)])
        s = p["seo"]
        seo_rows.append([p["type"], name or (h1s[0] if h1s else ""), p["url"], p["status"], p["redirected_to"] or "",
                         s.get("title_tag", ""), len(s.get("title_tag", "")), s.get("meta_description", ""), len(s.get("meta_description", "")),
                         s.get("meta_keywords", ""), s.get("canonical", ""), s.get("robots", ""), s.get("og_title", ""), s.get("og_description", ""), s.get("og_image", ""),
                         " | ".join(h1s), len(h1s), p["word_count"], len(mimgs), sum(1 for b in mimgs if b["alt_missing"] and b["source"] == "img"),
                         sum(1 for x in lk if x[2] == "internal"), sum(1 for x in lk if x[2] == "external"), p["last_modified"],
                         f"content/pages/{p['slug']}.json", f"content/pages/{p['slug']}.md"] + extra_cols(p))
    # global images
    g_imgs = [b for b in glob["header_top_bar"] + glob["footer"] if b["type"] == "img"]
    for l in glob["logo"]:
        img_rows.append(["(global header)", l["src"], l["alt"], l["alt_missing"], "", "", "", "img", "header", False])
    for b in g_imgs:
        img_rows.append(["(global)", b["src"], b["alt"], b["alt_missing"], b["title"], b["width"], b["height"], b["source"], b["region"], False])
    H1 = ["type", "page name", "url", "status", "redirect target", "title tag", "title length", "meta description", "description length",
          "meta keywords", "canonical", "robots", "og:title", "og:description", "og:image", "h1", "h1 count", "word count", "image count",
          "images missing alt", "internal link count", "external link count", "last modified", "json file", "md file"] + extra_hdr()
    H2 = ["page url", "image src", "alt", "alt_missing", "title", "width", "height", "source", "region", "shared"]
    H3 = ["page url", "link text", "href", "link type", "containing block type", "shared", "note"]
    for name, hdr, rows in (("seo-full.csv", H1, seo_rows), ("images.csv", H2, img_rows), ("links.csv", H3, link_rows)):
        with open(CONTENT / name, "w", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh); w.writerow(hdr); w.writerows(rows)
    try:
        from openpyxl import Workbook
        wb = Workbook(); ws = wb.active; ws.title = "SEO"
        for title, hdr, rows in (("SEO", H1, seo_rows), ("Images", H2, img_rows), ("Links", H3, link_rows)):
            if title != "SEO": ws = wb.create_sheet(title)
            ws.append(hdr)
            for r in rows: ws.append([("" if v is None else v) if not isinstance(v, str) else v[:32000] for v in r])
            ws.freeze_panes = "A2"
        wb.save(CONTENT / "seo-full.xlsx")
    except Exception as e:
        print("xlsx skipped:", e)
    # stats
    allb = Counter(b["type"] for p in pages for b in p["blocks"] if b["region"] == "main")
    stats = {"pages": len(pages), "failed": failed, "by_type": Counter(p["type"] for p in pages),
             "blocks_by_type": allb, "images": len(img_rows), "shared_blocks": len(shared_list),
             "with_meta_desc": sum(1 for p in pages if p["seo"].get("meta_description")),
             "with_meta_kw": sum(1 for p in pages if p["seo"].get("meta_keywords")),
             "header_variants": len(hsigs), "footer_variants": len(fsigs),
             "main_images": sum(1 for r in img_rows if r[8] == "main"),
             "main_img_missing_alt": sum(1 for r in img_rows if r[8] == "main" and r[3] and r[7] == "img"),
             "css_bg": sum(1 for r in img_rows if r[7] == "css-background"),
             "links": len(link_rows)}
    (CONTENT / "_extract-stats.json").write_text(json.dumps(stats, indent=1, default=dict))
    write_readme(stats, log, ul, pages, shared_list, hsigs, glob)
    print(json.dumps(stats, indent=1, default=dict))

def extra_hdr():
    h = []
    if CFG["inventory"]: h += [f.replace("_", " ") for f in CFG["inventory"]["fields"]]
    if CFG["yoast"]: h += ["yoast present", "yoast version", "og:type", "reading time", "json-ld types", "page source"]
    return h

def extra_cols(p):
    c = []
    if CFG["inventory"]: c += [(p.get("inventory") or {}).get(f, "") for f in CFG["inventory"]["fields"]]
    if CFG["yoast"]:
        y = p["seo"].get("yoast", {})
        c += [y.get("present", ""), y.get("version", ""), y.get("og_type", ""), y.get("reading_time", ""), ", ".join(p["seo"].get("json_ld_types", [])), p.get("source", "")]
    return c

def write_readme(stats, log, ul, pages, shared_list, hsigs, glob):
    dates = sorted({v.get("fetched") for v in log.values() if v.get("fetched")})
    st = Counter(v.get("status") for v in log.values())
    bt = ", ".join(f"{k}: {v}" for k, v in sorted(stats["blocks_by_type"].items()))
    ty = ", ".join(f"{k}: {v}" for k, v in sorted(stats["by_type"].items()))
    only_sm = ul["in_sitemap_not_csv"]; only_csv = ul["in_csv_not_sitemap"]
    nm = CFG["readme_title"] or HOST
    srcs = Counter(v.get("source") for v in log.values() if v.get("source"))
    src_line = f"- Source of each page (live vs preserved fallback copy vs failed): {dict(srcs)}\n" if srcs else ""
    R = f"""# {nm} content extraction (Liftkit)

Content and SEO data for every page of {PRIMARY}/, separated from design so it can be reused in new designs.

Crawl date: {dates[0] if dates else "?"}{(" to " + dates[-1]) if len(dates) > 1 else ""}. Extraction last run: {time.strftime("%Y-%m-%d")}.

## Counts

- URLs: {stats["pages"]} (seed list {len(read_seed())} + {len(only_sm)} found only in the sitemaps - {len(only_csv)} seed URLs are not in the sitemaps; {len(ul.get("discovered", []))} discovered by following links)
{src_line}
- HTTP status of crawled URLs: {dict(st)}
- Failed fetches (no HTML saved): {len(stats["failed"])}
- By type: {ty}
- Main-region blocks by type: {bt}
- Image occurrences (images.csv rows, incl. global header/footer): {stats["images"]}; in page main regions: {stats["main_images"]} ({stats["css_bg"]} are css-background); `<img>` in main regions with missing/empty alt: {stats["main_img_missing_alt"]}
- Pages with a meta description: {stats["with_meta_desc"]}; with meta keywords: {stats["with_meta_kw"]} (of {stats["pages"]})
- Shared blocks (main region, same type + text on more than {SHARED_MIN} pages): {stats["shared_blocks"]}
- Header menu variants: {stats["header_variants"]} (the nav differs by site section; all are in `_global.json` / `_global.md`)

## Files

| Path | What it is |
|---|---|
| `content/pages/<slug>.json` | One per URL. Full structured content + SEO (schema below). |
| `content/pages/<slug>.md` | One per URL. Front matter + main-region blocks, each prefixed with its element tag. Shared blocks collapsed at the end. |
| `content/_global.json`, `_global.md` | Header (logos with alt, top bar, nav tree + per-section nav variants), footer blocks, and the common blog sidebar. Written once, not repeated in page files. |
| `content/_shared-blocks.json` | Each shared block once, with the number of pages it appears on. |
| `content/seo-full.csv` / `.xlsx` | One row per URL (SEO, Images, Links sheets in the xlsx). |
| `content/images.csv` | One row per image occurrence (page, src, alt, alt_missing, title, width, height, source, region, shared). Global header/footer images are listed with page "(global)" / "(global header)". |
| `content/links.csv` | One row per link in main content (page, text, href, link type, containing block type, shared, note). Link types: internal ({HOST}), external, mailto, tel, other. Notes come from `link_notes` in liftkit.json. Empty-text links and `#` links are omitted. |
| `content/_extract-stats.json` | Machine-readable counts from the last extraction. |
| `content/_layout-analysis.json` | Page layouts (families) and which pages use each; written by `layout.py`. |
| `site/raw/<slug>.html` | Raw downloaded HTML (slug = URL path with `/` as `__`, home = `home`). |
| `site/crawl-log.json`, `site/url-list.json`, `site/sitemaps/` | Per-URL status/redirect log, merged URL list with sitemap-vs-CSV differences, raw sitemap XML. |
| `liftkit.json` | This project's config; scripts live in the shared `liftkit/tools/`. |

## Page JSON schema

```
{{ "url", "slug", "type", "status", "redirected_to", "last_modified",
  "seo": {{ title_tag, meta_description, meta_keywords, canonical, robots, og_title, og_description, og_image,
           twitter_card, lang, json_ld_types[], h1_count }},
  "post": {{ date, author, categories[], tags[] }},     // posts only
  "sidebar": "global",                                // present when the page uses the common sidebar in _global.json
  "blocks": [ ... document order ... ],
  "word_count" }}                                       // main region, excluding shared blocks
```

Every block has `type`, `region` (main | header | footer | sidebar), optional `component` (Divi module: blurb, accordion, fullwidth_header, sidebar, blog, map, video, social_media_follow...), and `shared: true` when flagged.

| type | fields |
|---|---|
| h1-h6 | text, id?, links[{{text, href}}] |
| p | text (inline links as `[text](href)`, `**bold**`, `*italic*`), links[] |
| text | bare div/span text with no semantic tag; same fields as p |
| ul / ol | items[{{text, links[], children[nested list blocks]}}] |
| a | text, href, is_button (standalone link/button outside a paragraph; `href` is "" for `#` buttons) |
| img | src (absolute), alt, alt_missing (attribute absent or empty), title, width, height, link_href?, source (`img` or `css-background`) |
| blockquote | text, links[] |
| table | rows[[cell text]], header (bool) |
| hr | |
| embed | provider (youtube, wistia, vimeo, google-maps, calendly, other), src, title |
| form | note (e.g. "Lawmatics intake", "contact form"); inputs are never extracted |

Notes: `css-background` images come from inline styles, data attributes and Divi's per-module CSS (`.et_pb_section_N{{background-image:url()}}`); they have no alt, so `alt_missing` is false for them and they are excluded from "images missing alt". Embed `src` for Wistia is `https://fast.wistia.com/embed/medias/<id>`; for Divi maps it is a `google.com/maps?q=lat,lng` URL built from the module's coordinates.

Markdown tags: `[h2]`, `[p]`, `[ul]`/`[ol]`, `[a button]` / `[a]`, `[img]` (ALT MISSING when absent), `[embed youtube]`, `[form]`, `[text]`, with `:component` appended where the block lives inside a Divi module, e.g. `[h5:accordion]`.

## Rerun

From the studio root, with the shared venv (`liftkit/.venv`):

```
LK=liftkit/.venv/bin/python; P=<project dir>
$LK liftkit/tools/crawl.py --project $P              # resumable; skips pages already saved (polite: 1 req/s)
$LK liftkit/tools/crawl.py --project $P --refresh    # re-download everything
$LK liftkit/tools/extract.py --project $P            # re-extract from site/raw (no network)
$LK liftkit/tools/layout.py --project $P             # layout analysis
$LK liftkit/tools/verify.py --project $P             # word coverage: raw main text vs extracted blocks
$LK liftkit/tools/verify_structure.py --project $P   # heading / list / image counts: raw vs extracted
```

## URLs in the sitemaps but not in the seed CSV ({len(only_sm)})

""" + "\n".join(f"- {x['url']} ({x['sitemap']})" for x in only_sm) + f"""

## URLs in the seed CSV but not in the sitemaps ({len(only_csv)})

""" + "\n".join(f"- {u}" for u in only_csv) + """

## Known limits

- Only static HTML is read. Content injected by JavaScript is not captured (forms, Wistia players and third-party widgets are detected from their static markers only).
- The header/footer are taken from the most common variant; the header nav differs by section (see `nav_variants` in `_global.json`).
- Post author is the WordPress username from page metadata, which may not be a display name.
- Empty links (no text, no image alt, no title) and empty headings are dropped.
"""
    (CONTENT / "README.md").write_text(R)

# ---------------- markdown
def b_md(b, shared=False):
    t = b["type"]; comp = b.get("component")
    tag = t + (f":{comp}" if comp else "")
    flat = lambda s: re.sub(r"\s*\n\s*", " ", s)
    if t in HEADINGS or t in ("p", "text", "blockquote"): return [f"[{tag}] {flat(b['text'])}"]
    if t in ("ul", "ol"):
        if shared:
            def txt(items): return "; ".join(flat(i["text"]) for i in items)
            return [f"[{tag}] {txt(b['items'])}"]
        lines = [f"[{tag}]"]
        def rec(items, d):
            for n, i in enumerate(items, 1):
                lines.append("  " * d + (f"{n}. " if t == "ol" else "- ") + flat(i["text"]))
                for k in i["children"]: rec(k["items"], d + 1)
        rec(b["items"], 0); return lines
    if t == "a": return [f"[a{' button' if b['is_button'] else ''}{':' + comp if comp else ''}] {flat(b['text'])} → {b['href']}"]
    if t == "img":
        a = "ALT MISSING" if (b["alt_missing"] and b["source"] == "img") else (f'alt="{b["alt"]}"' if b["source"] == "img" else "(no alt: css-background)")
        return [f"[{tag}] {a} src={b['src']}" + (f" → {b['link_href']}" if b.get("link_href") else "") + (" (css-background)" if b["source"] == "css-background" else "")]
    if t == "embed": return [f"[embed {b['provider']}{':' + comp if comp else ''}] {b['src']}" + (f" ({b['title']})" if b.get("title") else "")]
    if t == "form": return [f"[form{':' + comp if comp else ''}] {b['note']}"]
    if t == "table":
        lines = [f"[{tag}]"]
        for n, r in enumerate(b["rows"]):
            lines.append("| " + " | ".join(r) + " |")
            if n == 0 and b["header"]: lines.append("|" + "---|" * len(r))
        return lines
    if t == "hr": return ["[hr]"]
    return [f"[{tag}]"]

def yq(s): return json.dumps(s or "", ensure_ascii=False)

def page_md(p, h1s):
    s = p["seo"]
    fm = ["---", f"url: {p['url']}", f"type: {p['type']}", f"title_tag: {yq(s.get('title_tag'))}", f"meta_description: {yq(s.get('meta_description'))}",
          f"meta_keywords: {yq(s.get('meta_keywords'))}", f"h1: {yq(' | '.join(h1s))}", f"last_modified: {p['last_modified']}", f"status: {p['status']}"]
    if p.get("redirected_to"): fm.append(f"redirected_to: {p['redirected_to']}")
    fm.append("---"); fm.append("")
    body, sh = [], []
    for b in p["blocks"]:
        if b["region"] == "main" and not b.get("shared"): body += b_md(b)
        elif b.get("shared"): sh.append(" ".join(b_md(b, True)).replace("\n", " "))
    if p.get("error"): body.append(f"[error] {p['error']}")
    out = fm + body
    side = [b for b in p["blocks"] if b["region"] == "sidebar"]
    if side:
        out += ["", "## Sidebar"] + [l for b in side for l in b_md(b)]
    if sh:
        out += ["", "## Shared blocks (appear site-wide)"] + [f"- {x}" for x in sh]
    return "\n".join(out) + "\n"

def global_md(g):
    L = ["# Global (site-wide) header and footer", "", g["note"], f"Source page: {g['source_page']}", "", "## Logo"]
    for l in g["logo"]:
        L.append(f"[img] " + ("ALT MISSING" if l["alt_missing"] else f'alt="{l["alt"]}"') + f" src={l['src']}" + (f" → {l['link_href']}" if l["link_href"] else ""))
    L += ["", "## Header top bar"]
    for b in g["header_top_bar"]: L += b_md(b)
    L += ["", "## Navigation"]
    def rec(items, d):
        for i in items: 
            L.append("  " * d + f"- {i['text']} → {i['href']}" + (" [button]" if i.get("is_button") else "")); rec(i.get("children", []), d + 1)
    rec(g["nav"], 0)
    L += ["", "## Navigation variants (the menu differs by site section)"]
    for v in g["nav_variants"]:
        L += ["", f"### Variant used on {v['count']} pages (e.g. {v['example_page']})"]
        rec(v["nav"], 0)
    L += ["", "## Footer"]
    for b in g["footer"]: L += b_md(b)
    L += ["", f"## Sidebar (identical on {g['sidebar']['used_on_pages']} pages; other pages list their own sidebar in their file)"]
    for b in g["sidebar"]["blocks"]: L += b_md(b)
    return "\n".join(L) + "\n"

if __name__ == "__main__":
    main()
