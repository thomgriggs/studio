#!/usr/bin/env python3
"""Turn each page's flat crawl blocks into an ordered list of design-free module instances.

    content/pages/<slug>.json  +  content/_layout-analysis.json
        -> content/structured/<slug>.json
           {url, slug, template, family, title, seo, modules:[{module, variant?, slots}], dropped:{...}}

Design-free: knows nothing about any concept. The kit it targets is documented in design/kit/README.md.
Hand overrides: content/overrides/<slug>.json (format in design/kit/README.md).

    python tools/modulize.py            # all non-excluded pages, prints a summary
    python tools/modulize.py --pages home,estate-planning
"""
import argparse
import collections
import json
import re
import sys
from pathlib import Path

from common import ROOT, CFG, KIT_DIR

MCFG = CFG["modulize"]
PAGES = ROOT / "content" / "pages"
OUT = ROOT / "content" / "structured"
OVERRIDES = ROOT / "content" / "overrides"
LAYOUT = ROOT / "content" / "_layout-analysis.json"
TEMPLATES = ROOT / MCFG["templates_file"]
if not TEMPLATES.exists():
    TEMPLATES = KIT_DIR / "kit" / "templates.json"   # generic starting catalogue
EXCLUDED = ROOT / MCFG["excluded_pages_file"]

HEADINGS = ("h2", "h3", "h4", "h5", "h6")
BODY_TYPES = ("p", "text", "ul", "ol", "table", "blockquote", "a", "hr")
LOGO_ALT = re.compile(MCFG["logo_alt_regex"], re.I)
MD_LINK = re.compile(r"\[([^\]]*)\]\(([^)]*)\)")
SITE_SUFFIX = re.compile(MCFG["title_suffix_regex"] or r"(?!x)x")  # empty config = never matches


# ---------------------------------------------------------------- helpers
def plain(md):
    """Markdown-ish inline text -> plain text."""
    t = MD_LINK.sub(r"\1", md or "")
    return re.sub(r"[*_]{1,3}", "", t).strip()


def whole_link(md):
    m = re.fullmatch(r"\s*\[([^\]]+)\]\(([^)]+)\)\s*", md or "")
    return (m.group(1), m.group(2)) if m else None


def whole_bold(md):
    m = re.fullmatch(r"\s*\*\*([^*\n]+?)\*\*\s*", md or "")
    return m.group(1).strip() if m else None


def is_logo(b):
    if b["type"] != "img" or b.get("source") == "css-background":
        return False
    src = b.get("src", "").lower()
    return bool(b.get("link_href") or LOGO_ALT.search(b.get("alt") or "") or src.endswith(".png"))


def img_slot(b):
    d = {"src": b["src"], "alt": b.get("alt") or ""}
    if b.get("link_href"):
        d["href"] = b["link_href"]
    return d


def list_block(b):
    return {"type": b["type"], "items": [{"text": i["text"], "children": [list_block(c) for c in i.get("children", [])]} for i in b["items"]]}


def split_lead(item):
    """Item {text, children} -> {lead?, text, children?} where lead is a leading **bold** phrase."""
    m = re.match(r"\*\*(.+?)\*\*(:?)\s*(.*)", item["text"], re.S)
    out = {"text": item["text"]}
    if m and m.group(3):
        out = {"lead": m.group(1).strip() + m.group(2), "text": m.group(3)}
    if item.get("children"):
        out["children"] = item["children"]
    return out


def is_link_list(b):
    return b["type"] == "ul" and b["items"] and all(whole_link(i["text"]) and not i.get("children") for i in b["items"])


def body_block(b, in_accordion=False):
    t = b["type"]
    if t in ("p", "text"):
        bold = whole_bold(b["text"])
        if in_accordion and bold and "\n" not in b["text"].strip():
            return {"type": "subhead", "text": bold}
        return {"type": "p", "text": b["text"]}
    if t in ("ul", "ol"):
        return list_block(b)
    if t == "table":
        return {"type": "table", "rows": b["rows"], "header": b.get("header", False)}
    if t == "blockquote":
        return {"type": "quote", "text": b["text"]}
    if t == "a":
        return {"type": "button", "text": b["text"], "href": b.get("href", "")}
    if t == "embed":
        return {"type": "embed-link", "text": b.get("title") or "", "href": b["src"]}
    return None


def count_words(blocks):
    n = 0
    for b in blocks:
        if "text" in b:
            n += len(plain(b["text"]).split())
        for i in b.get("items", []):
            n += len(plain(i["text"]).split()) + count_words(i.get("children", []))
        for r in b.get("rows", []):
            n += sum(len(str(c).split()) for c in r)
    return n


def module_words(m):
    """Words carried by a module (for the plain-rich-text coverage statistic)."""
    s = json.dumps(m["slots"], ensure_ascii=False)
    return len(re.findall(r"\w+", re.sub(r'"(src|href|alt|type|level|depth|text|title)":', " ", s)))


# ---------------------------------------------------------------- cleaning
def clean(page, dropped):
    out = []
    for b in page["blocks"]:
        if b.get("shared"):
            dropped["shared_blocks"] += 1
            continue
        if b.get("region", "main") != "main" or b.get("component") == "sidebar":
            dropped["sidebar_blocks"] += 1
            continue
        if b["type"] == "embed":
            prov = b.get("provider")
            src = b.get("src", "")
            if prov == "youtube":
                out.append(b)
            elif prov in ("wistia", "vimeo") or b.get("component") == "video" or re.search(r"\.(mp4|mov|webm)(\?|$)", src):
                dropped["non_youtube_video"] += 1
            elif prov == "google-maps":
                dropped["map_embed"] += 1
            else:
                out.append(b)  # third-party tool embed (e.g. calculators): kept as a link
            continue
        if b["type"] == "img" and re.search(r"wistia|swatch", b.get("src", ""), re.I):
            dropped["wistia_image"] += 1
            continue
        if b["type"] == "hr":
            continue
        if b.get("component") == "blurb" and b["type"] == "text" and len((b.get("text") or "").strip()) <= 2:
            continue  # icon-font glyph
        out.append(b)

    # css-background + img of the same file -> keep the img
    res = []
    for i, b in enumerate(out):
        nxt = out[i + 1] if i + 1 < len(out) else None
        if b["type"] == "img" and b.get("source") == "css-background" and nxt and nxt["type"] == "img" and nxt["src"] == b["src"]:
            dropped["duplicate_image"] += 1
            continue
        res.append(b)
    out = res

    # eyebrow: a short unpunctuated paragraph right before a heading
    res = []
    i = 0
    while i < len(out):
        b = out[i]
        nxt = out[i + 1] if i + 1 < len(out) else None
        if (b["type"] in ("p", "text") and not b.get("component") and nxt and nxt["type"] in HEADINGS
                and len(plain(b["text"]).split()) <= 5 and not re.search(r"[.!?:]$", plain(b["text"]))
                and not whole_link(b["text"])):
            nxt = dict(nxt, eyebrow=plain(b["text"]))
            out[i + 1] = nxt
            i += 1
            continue
        res.append(b)
        i += 1
    return res


# ---------------------------------------------------------------- segmentation
class Seg:
    def __init__(self, page, template, dropped):
        self.page = page
        self.template = template
        self.dropped = dropped
        self.mods = []
        self.title = None

    def add(self, module, slots, variant=None):
        slots = {k: v for k, v in slots.items() if v not in (None, "", [], {})}
        m = {"module": module}
        if variant:
            m["variant"] = variant
        m["slots"] = slots
        self.mods.append(m)

    # ----- run collectors
    def body_run(self, bl, i, stop_lead_in=True):
        """Collect plain body blocks (p/text/ul/ol/table/a/quote) from bl[i:]; return (blocks, next_i)."""
        run = []
        while i < len(bl) and bl[i]["type"] in BODY_TYPES and not bl[i].get("component") in ("accordion", "blurb"):
            if bl[i].get("component") == "social_media_follow":
                break
            if is_link_list(bl[i]) and run:
                break
            run.append(bl[i])
            i += 1
        return run, i

    def accordion(self, bl, i, title=None, level=None, eyebrow=None):
        items = []
        cur = None
        while i < len(bl) and bl[i].get("component") == "accordion":
            b = bl[i]
            if b["type"] in HEADINGS:
                cur = {"title": plain(b["text"]), "body": []}
                items.append(cur)
            elif cur is None:
                cur = {"title": "", "body": []}
                items.append(cur)
            if b["type"] not in HEADINGS:
                bb = body_block(b, in_accordion=True)
                if bb:
                    if bb["type"] == "embed-link":
                        bb["text"] = bb["text"] or cur["title"]
                    cur["body"].append(bb)
            i += 1
        self.add("accordion", {"eyebrow": eyebrow, "title": title, "level": level, "items": items})
        return i

    def blurbs(self, bl, i, title=None, level=None, eyebrow=None):
        cards = []
        cur = None
        while i < len(bl) and bl[i].get("component") == "blurb":
            b = bl[i]
            if b["type"] in HEADINGS:
                lk = whole_link(b["text"])
                cur = {"title": plain(b["text"]), "text": []}
                if lk:
                    cur["href"] = lk[1]
                cards.append(cur)
            else:
                if cur is None:
                    cur = {"title": "", "text": []}
                    cards.append(cur)
                if b["type"] == "img":
                    cur["image"] = img_slot(b)
                elif b["type"] == "a":
                    cur["href"] = b.get("href", "")
                    cur["link_text"] = b["text"]
                elif b["type"] in ("p", "text"):
                    cur["text"].append(b["text"])
            i += 1
        # cards that are only one line of text: that line is the title
        for c in cards:
            if not c["title"] and len(c["text"]) == 1 and len(c["text"][0]) < 60:
                c["title"] = plain(c.pop("text")[0])
                c["text"] = []
            c["text"] = [t for t in c["text"] if t]
        cards = [{k: v for k, v in c.items() if v not in ("", [])} for c in cards]
        stat = stat_items(cards)
        if stat:
            self.add("stat-row", {"eyebrow": eyebrow, "title": title, "level": level, "items": stat})
            return i
        self.add("card-grid", {"eyebrow": eyebrow, "title": title, "level": level, "cards": cards})
        return i

    def sectioned(self, body, title, level, eyebrow=None, image=None, extra=None):
        """Heading + body run -> headed-section, splitting on bold lead-in lines when there are >=2."""
        extra = extra or {}
        leads = [k for k, b in enumerate(body) if b["type"] in ("p", "text") and whole_bold(b["text"]) and len(b["text"]) < 120 and "\n" not in b["text"].strip()]
        if len(leads) >= 2 and not title:
            self.lead_in_sections(body)
            return
        slots = {"eyebrow": eyebrow, "title": title, "level": level, "image": image, "body": [x for x in (body_block(b) for b in body) if x]}
        slots.update(extra)
        self.add("headed-section", slots)

    def lead_in_sections(self, body):
        leads = [k for k, b in enumerate(body) if b["type"] in ("p", "text") and whole_bold(b["text"]) and len(b["text"]) < 120 and "\n" not in b["text"].strip()]
        if leads[0] > 0:
            self.simple_run(body[:leads[0]])
        for n, k in enumerate(leads):
            end = leads[n + 1] if n + 1 < len(leads) else len(body)
            self.add("headed-section", {"title": whole_bold(body[k]["text"]), "level": "bold",
                                         "body": [x for x in (body_block(b) for b in body[k + 1:end]) if x]}, variant="lead-in")

    def simple_run(self, run, allow_intro=False):
        """A heading-less run of body blocks: link-list / table / rich-text."""
        buf = []

        def flush():
            if buf:
                bl = [x for x in (body_block(b) for b in buf) if x]
                if bl:
                    self.add("rich-text", {"body": bl})
                buf.clear()
        for b in run:
            if is_link_list(b):
                flush()
                self.add("link-list", {"links": [{"text": whole_link(i["text"])[0], "href": whole_link(i["text"])[1]} for i in b["items"]]})
            elif b["type"] == "table":
                flush()
                self.add("table", {"rows": b["rows"], "header": b.get("header", False)})
            elif b["type"] in ("ul", "ol") and (b["type"] == "ol" or len(b["items"]) >= 3):
                flush()
                lb = list_block(b)
                self.add("list", {"ordered": b["type"] == "ol", "items": [split_lead(i) for i in lb["items"]]})
            else:
                buf.append(b)
        flush()

    # ----- main walk
    def run(self, bl):
        page = self.page
        i = 0
        # title
        h1i = next((k for k, b in enumerate(bl) if b["type"] == "h1"), None)
        bg = None
        header_extra = {"tagline": [], "actions": []}
        if h1i is not None:
            h1 = bl[h1i]
            self.title = plain(h1["text"])
            if h1i > 0 and bl[h1i - 1]["type"] == "img" and bl[h1i - 1].get("source") == "css-background" and h1i == 1:
                bg = img_slot(bl[0])
            is_hero = h1.get("component") == "fullwidth_header"
            j = h1i + 1
            while is_hero and j < len(bl) and bl[j].get("component") == "fullwidth_header":
                if bl[j]["type"] in ("p", "text"):
                    header_extra["tagline"].append(plain(bl[j]["text"]))
                elif bl[j]["type"] == "a":
                    header_extra["actions"].append({"text": bl[j]["text"], "href": bl[j].get("href", "")})
                j += 1
            meta = {}
            post = page.get("post") or {}
            if post.get("date") and self.template in ("article", "video-post"):
                meta["date"] = post["date"][:10]
            if is_hero:
                self.add("hero", {"title": self.title, "tagline": " ".join(header_extra["tagline"]), "image": bg,
                                  "actions": header_extra["actions"]})
                i = j
            else:
                self.add("title-banner", {"title": self.title, "image": bg, **meta})
                i = h1i + 1
            bl = bl[i:]
            i = 0
        else:
            if MCFG.get("title_from_first_heading") and bl and bl[0]["type"] in ("h2", "h3"):
                # sites whose visible page title is an h2/h3 (no h1): that heading is the title and is not repeated in the body
                self.title = plain(bl[0]["text"])
                bl = bl[1:]
            else:
                self.title = SITE_SUFFIX.sub("", page["seo"].get("title_tag") or page["slug"])
            self.add("title-banner", {"title": self.title})
            if bl and bl[0]["type"] == "img" and bl[0].get("source") == "css-background":
                self.mods[-1]["slots"]["image"] = img_slot(bl[0])
                bl = bl[1:]
            elif MCFG.get("lead_image_to_banner") and bl and bl[0]["type"] == "img" and not is_logo(bl[0]):
                self.mods[-1]["slots"]["image"] = img_slot(bl[0])   # the one photo under the title is the banner image
                bl = bl[1:]

        # drop heading identical to the page title (the old site repeats it as an h2)
        if bl and bl[0]["type"] in ("h2", "h3") and plain(bl[0]["text"]).lower() == self.title.lower():
            self.dropped["duplicate_title"] += 1
            bl = bl[1:]
        # also: image before the repeated title, e.g. [css-bg h1 img h2]
        self.walk(bl)

    def walk(self, bl):
        n = len(bl)
        i = 0
        first_body = True
        heading_levels = sorted({int(b["type"][1]) for b in bl if b["type"] in HEADINGS and not b.get("component")})
        min_level = heading_levels[0] if heading_levels else 2

        def depth(level):
            return 2 if level <= min_level else 3

        while i < n:
            b = bl[i]
            t = b["type"]
            comp = b.get("component")

            if comp == "accordion":
                i = self.accordion(bl, i)
                first_body = False
                continue
            if comp == "blurb":
                i = self.blurbs(bl, i)
                first_body = False
                continue
            if t == "form":
                self.add("form-placeholder", {"note": b.get("note")})
                i += 1
                continue
            if t == "embed":
                if b.get("provider") == "youtube":
                    self.add("video", {"url": b["src"], "title": b.get("title")})
                else:
                    self.add("link-list", {"links": [{"text": b.get("title") or b["src"], "href": b["src"]}]}, variant="embed")
                i += 1
                first_body = False
                continue
            if t == "table":
                self.add("table", {"rows": b["rows"], "header": b.get("header", False)})
                i += 1
                continue
            # archive / blog post items: h2 whose text is a single link
            if self.template == "listing" and t == "h2" and whole_link(b["text"]):
                posts = []
                while i < n and bl[i]["type"] == "h2" and whole_link(bl[i]["text"]):
                    lk = whole_link(bl[i]["text"])
                    post = {"title": lk[0], "href": lk[1]}
                    i += 1
                    ex = []
                    while i < n and bl[i]["type"] in ("p", "text"):
                        ex.append(bl[i]["text"])
                        i += 1
                    if ex:
                        post["excerpt"] = "\n\n".join(ex)
                    posts.append(post)
                more = None
                if i < n and bl[i]["type"] == "a":
                    more = {"text": bl[i]["text"], "href": bl[i].get("href", "")}
                    i += 1
                self.add("post-feed", {"posts": posts, "more": more})
                continue
            if self.template == "listing" and t == "a":
                self.add("post-feed", {"posts": [], "more": {"text": b["text"], "href": b.get("href", "")}})
                i += 1
                continue

            # profile: image whose alt matches the next h2 (team page)
            if t == "img" and i + 1 < n and bl[i + 1]["type"] == "h2" and self._name_match(b.get("alt"), bl[i + 1]["text"]) \
                    and i + 2 < n and bl[i + 2]["type"] in ("p", "text") and len(bl[i + 2]["text"]) < 80:
                prof = {"image": img_slot(b), "name": plain(bl[i + 1]["text"]), "role": plain(bl[i + 2]["text"])}
                i += 3
                links = []
                while i < n and bl[i].get("component") == "social_media_follow":
                    for it in bl[i].get("items", []):
                        lk = MD_LINK.search(it["text"])
                        if lk:
                            links.append({"text": lk.group(1), "href": lk.group(2)})
                    i += 1
                prof["links"] = links
                self.add("profile", prof)
                first_body = False
                continue

            if t == "img":
                run = []
                while i < n and bl[i]["type"] == "img" and not (run and (bl[i].get("source") == "css-background" or is_logo(bl[i]) != is_logo(run[0]))):
                    run.append(bl[i])
                    i += 1
                nxt = bl[i] if i < n else None
                css = run[0].get("source") == "css-background"
                if css and len(run) == 1 and nxt and nxt["type"] in HEADINGS:
                    self.band(bl, i, run[0])
                    i = self._band_end
                    continue
                if all(is_logo(r) for r in run) and (len(run) >= 2 or run[0].get("link_href")):
                    self.add("logo-row", {"logos": [img_slot(r) for r in run]})
                    first_body = False
                    continue
                photos = [r for r in run if not is_logo(r) or len(run) == 1]
                if nxt and nxt["type"] in HEADINGS and not nxt.get("component") and len(photos) <= 2:
                    # image(s) + headed text -> image-text
                    body, j = self.body_run(bl, i + 1)
                    self.add("image-text", {"images": [img_slot(r) for r in photos], "eyebrow": nxt.get("eyebrow"), "title": plain(nxt["text"]),
                                            "level": int(nxt["type"][1]), "body": [x for x in (body_block(q) for q in body) if x]})
                    i = j
                    first_body = False
                    continue
                if len(photos) >= 3:
                    self.add("gallery", {"images": [img_slot(r) for r in photos]})
                else:
                    for r in photos:
                        self.add("image", {"image": img_slot(r)})
                first_body = False
                continue

            if t in HEADINGS:
                level = int(t[1])
                eb = b.get("eyebrow")
                nxt = bl[i + 1] if i + 1 < n else None
                if nxt is not None and nxt.get("component") == "accordion" and not comp:
                    i = self.accordion(bl, i + 1, title=plain(b["text"]), level=level, eyebrow=eb)
                    continue
                if nxt is not None and nxt.get("component") == "blurb" and not comp:
                    i = self.blurbs(bl, i + 1, title=plain(b["text"]), level=level, eyebrow=eb)
                    continue
                body, j = self.body_run(bl, i + 1)
                # heading + links-only list -> link-list with a title
                if len(body) == 1 and is_link_list(body[0]):
                    self.add("link-list", {"eyebrow": eb, "title": plain(b["text"]), "level": level,
                                           "links": [{"text": whole_link(x["text"])[0], "href": whole_link(x["text"])[1]} for x in body[0]["items"]]})
                    i = j
                    continue
                # heading + table
                tb = [x for x in body if x["type"] == "table"]
                if tb and len(body) == 1:
                    self.add("table", {"eyebrow": eb, "title": plain(b["text"]), "level": level, "rows": tb[0]["rows"], "header": tb[0].get("header", False)})
                    i = j
                    continue
                self.add("headed-section", {"eyebrow": eb, "title": plain(b["text"]), "level": level, "depth": depth(level),
                                            "body": [x for x in (body_block(q) for q in body) if x]})
                i = j
                first_body = False
                continue

            if t in BODY_TYPES:
                run, j = self.body_run(bl, i)
                if not run:  # social_media_follow or similar orphan
                    i += 1
                    continue
                paras = [x for x in run if x["type"] in ("p", "text")]
                leads = [k for k, x in enumerate(run) if x["type"] in ("p", "text") and whole_bold(x["text"]) and len(x["text"]) < 120 and "\n" not in x["text"].strip()]
                if len(leads) >= 2:
                    self.lead_in_sections(run)
                    i = j
                    first_body = False
                    continue
                # leading paragraphs followed by something else -> intro
                k = 0
                while k < len(run) and run[k]["type"] in ("p", "text"):
                    k += 1
                if first_body and k > 0 and (k < len(run) or j < n):
                    self.add("intro", {"paragraphs": [x["text"] for x in run[:k]]})
                    self.simple_run(run[k:])
                else:
                    self.simple_run(run)
                i = j
                first_body = False
                continue
            i += 1  # unknown

        # fill depth for lead-in etc. handled by renderer

    def band(self, bl, i, img):
        """css-background image + heading (+ short body / buttons)."""
        h = bl[i]
        body, j = self.body_run(bl, i + 1)
        buttons = [x for x in body if x["type"] == "a"]
        paras = [x for x in body if x["type"] in ("p", "text")]
        others = [x for x in body if x["type"] not in ("a", "p", "text")]
        if not others and len(paras) <= 1 and (buttons or not paras):
            self.add("cta-band", {"image": img_slot(img), "eyebrow": h.get("eyebrow"), "title": plain(h["text"]), "level": int(h["type"][1]),
                                  "text": paras[0]["text"] if paras else None,
                                  "buttons": [{"text": x["text"], "href": x.get("href", "")} for x in buttons]})
        else:
            nxt = bl[j] if j < len(bl) else None
            if nxt is not None and nxt.get("component") == "accordion":
                # heading over an accordion on a photo band: keep the heading as the accordion title
                j = self.accordion(bl, j, title=plain(h["text"]), level=int(h["type"][1]), eyebrow=h.get("eyebrow"))
            else:
                self.add("headed-section", {"eyebrow": h.get("eyebrow"), "title": plain(h["text"]), "level": int(h["type"][1]), "depth": 2,
                                            "image": img_slot(img), "body": [x for x in (body_block(q) for q in body) if x]}, variant="on-image")
        self._band_end = j

    @staticmethod
    def _name_match(alt, h):
        a = re.findall(r"[a-z]+", (alt or "").lower())
        hh = set(re.findall(r"[a-z]+", plain(h).lower()))
        return len(a) >= 2 and a[0] in hh and a[-1] in hh



# ---------------------------------------------------------------- new kit modules (steps, stat-row, callout, video-split, quote-tile)
NUM_LEAD = re.compile(r"^([$\u20ac]?\d[\d,.]*\s?(?:%|[kKmM]\+?|\+)?)\s+(\S.*)$")


def nwords(md):
    return len(plain(md).split())


def stat_items(cards):
    """Untitled blurbs that are only a few words each (2-4 of them): a stat row. A leading figure becomes the value."""
    if any(c.get("title") or c.get("image") or c.get("href") for c in cards):
        return None
    texts = [t for c in cards for t in c.get("text", [])]
    if not (2 <= len(texts) <= 4) or any(nwords(t) > 5 for t in texts):
        return None
    out = []
    for t in texts:
        m = NUM_LEAD.match(plain(t))
        out.append({"value": m.group(1), "label": m.group(2)} if m else {"label": t})
    return out


def steps_ok(items):
    return (3 <= len(items) <= 6 and not any(i.get("children") for i in items)
            and all(nwords(i["text"]) <= 40 for i in items))


QUOTE = re.compile(r"^\s*[\u201c\"](.+)[\u201d\"]\s*$", re.S)
ATTRIB = re.compile(r"^\s*\*\s*[\u2014\u2013-]\s*(.+?)\s*\*\s*$")


def end_punct(t):
    return bool(re.search(r"[.!?]$", plain(t)))


def refine(mods):
    """Second pass over the module list: split out quote-tile and steps, merge video-split, turn lone short
    statements into callouts. Only fires where the live content really has the pattern."""
    out = []
    for m in mods:
        mod, sl = m["module"], m["slots"]
        body = sl.get("body") if mod in ("headed-section", "rich-text") else None
        if body:
            # quote-tile: a whole-paragraph quote followed by an italic "- Name" attribution line
            k = next((k for k in range(len(body) - 1) if body[k]["type"] == "p" and QUOTE.match(body[k]["text"])
                      and body[k + 1]["type"] == "p" and ATTRIB.match(body[k + 1]["text"]) and nwords(body[k]["text"]) >= 8), None)
            if k is not None:
                before, after = body[:k], body[k + 2:]
                q = {"module": "quote-tile", "slots": {"text": QUOTE.match(body[k]["text"]).group(1).strip(),
                                                       "attribution": ATTRIB.match(body[k + 1]["text"]).group(1).strip()}}
                head = {kk: vv for kk, vv in m.items() if kk != "slots"}
                if mod == "headed-section":
                    out.append({**head, "slots": {**{a: b for a, b in sl.items() if a != "body"}, **({"body": before} if before else {})}})
                elif before:
                    out.append({**head, "slots": {"body": before}})
                out.append(q)
                if after:
                    out.append({"module": "rich-text", "slots": {"body": after}})
                continue
            # steps: a short ordered list of 3-6 items inside a headed section
            if mod == "headed-section":
                k = next((k for k, b in enumerate(body) if b["type"] == "ol" and steps_ok([split_lead(i) for i in b["items"]])), None)
                if k is not None:
                    before, after = body[:k], body[k + 1:]
                    items = [split_lead(i) for i in body[k]["items"]]
                    if before:
                        out.append({**{a: b for a, b in m.items() if a != "slots"}, "slots": {**{a: b for a, b in sl.items() if a != "body"}, "body": before}})
                        out.append({"module": "steps", "slots": {"items": items}})
                    else:
                        out.append({"module": "steps", "slots": {"eyebrow": sl.get("eyebrow"), "title": sl.get("title"), "level": sl.get("level"),
                                                                 "depth": sl.get("depth"), "items": items}})
                    if after:
                        out.append({"module": "rich-text", "slots": {"body": after}})
                    continue
        if mod == "list" and sl.get("ordered") and steps_ok(sl["items"]):
            out.append({"module": "steps", "slots": {"items": sl["items"]}})
            continue
        out.append(m)
    mods = out

    # video-split: a short heading + text section directly beside a YouTube video
    out = []
    i = 0
    while i < len(mods):
        m = mods[i]
        nxt = mods[i + 1] if i + 1 < len(mods) else None
        if (m["module"] == "headed-section" and not m.get("variant") and nxt and nxt["module"] == "video"
                and m["slots"].get("body") and all(b["type"] == "p" for b in m["slots"]["body"])
                and sum(nwords(b["text"]) for b in m["slots"]["body"]) <= 60 and not m["slots"].get("image")):
            sl = {k: v for k, v in m["slots"].items()}
            sl["url"] = nxt["slots"]["url"]
            if nxt["slots"].get("title"):
                sl["video_title"] = nxt["slots"]["title"]
            out.append({"module": "video-split", "slots": sl})
            i += 2
            continue
        out.append(m)
        i += 1
    mods = out

    # callout: one short standalone sentence between sections (not the opening text, not a list lead-in)
    for i, m in enumerate(mods):
        if m["module"] != "rich-text" or len(m["slots"]["body"]) != 1 or i == 0:
            continue
        b = m["slots"]["body"][0]
        prev = mods[i - 1]["module"]
        nxt = mods[i + 1]["module"] if i + 1 < len(mods) else None
        if prev == "title-banner" or nxt in ("link-list", "list", "steps", "table"):
            continue
        t = b["text"]
        if (b["type"] == "p" and 8 <= nwords(t) <= 25 and end_punct(t) and not whole_bold(t) and "\n" not in t.strip()
                and not t.strip().startswith(("*", "(")) and (t.strip()[0].isupper() or t.strip()[0] == "[")):
            mods[i] = {"module": "callout", "slots": {"text": t}}
    return mods

# ---------------------------------------------------------------- overrides
def apply_override(slug, mods, state):
    f = OVERRIDES / f"{slug}.json"
    if not f.exists():
        return mods
    ov = json.loads(f.read_text())
    state["override"] = True
    if ov.get("template"):
        state["template"] = ov["template"]
    if ov.get("mode") == "replace":
        return ov["modules"]
    for op in ov.get("ops", []):
        k = op["op"]
        if k == "remove":
            del mods[op["index"]]
        elif k == "replace":
            mods[op["index"]] = op["module"]
        elif k == "insert":
            mods.insert(op["index"], op["module"])
        elif k == "set":
            mods[op["index"]]["slots"].update(op["slots"])
            if "variant" in op:
                mods[op["index"]]["variant"] = op["variant"]
        elif k == "move":
            mods.insert(op["to"], mods.pop(op["from"]))
        else:
            raise SystemExit(f"{slug}: unknown override op {k}")
    return mods


# ---------------------------------------------------------------- driver
def load_template_map():
    t = json.loads(TEMPLATES.read_text())
    return t["family_to_template"], t["slug_overrides"], set(t["excluded_families"])


def load_excluded_pages():
    """content/excluded-stock-posts.json -> ({slug}, {url path}): stock Wistia posts, the firm's YouTube video posts
    (now on the Videos page) and the listings that became empty. They get no structured output and no mockup page."""
    if not EXCLUDED.exists():
        return set(), set()
    d = json.loads(EXCLUDED.read_text())
    items = [e for g in ("stock_posts", "video_posts", "listings", "other") for e in d.get(g, [])]
    return {e["slug"] for e in items}, {e["url"].split("//", 1)[-1].split("/", 1)[-1].strip("/") for e in items}


def prune_excluded_links(mods, ex_paths):
    """Drop post-feed teasers that point at an excluded page; a post-feed left with no teasers goes away."""
    out = []
    for m in mods:
        if m["module"] == "post-feed":
            keep = [t for t in m["slots"].get("posts", []) if t["href"].split("//", 1)[-1].split("/", 1)[-1].split("?")[0].strip("/") not in ex_paths]
            if not keep:
                continue
            m["slots"]["posts"] = keep
        out.append(m)
    return out


CONSULT_URL = MCFG["consultation_url"]
CONTACT_HREF = re.compile(MCFG["contact_href_regex"] or r"(?!x)x")


def retarget_consultation(node):
    """Every consultation call to action (a link or button whose text mentions a consultation) opens the new
    consultation flow instead of the contact page. Text is untouched; only the destination changes."""
    if isinstance(node, list):
        return [retarget_consultation(x) for x in node]
    if isinstance(node, str):
        return re.sub(r"\[([^\]]*consult[^\]]*)\]\(([^)]*)\)",
                      lambda m: f"[{m.group(1)}]({CONSULT_URL})" if CONTACT_HREF.match(m.group(2)) else m.group(0), node, flags=re.I)
    if isinstance(node, dict):
        out = {k: retarget_consultation(v) for k, v in node.items()}
        if re.search(r"consult", str(out.get("text") or ""), re.I) and CONTACT_HREF.match(str(out.get("href") or "")):
            out["href"] = CONSULT_URL
        return out
    return node


def modulize(slug, layout, fam_map, slug_map, excluded):
    page = json.loads((PAGES / f"{slug}.json").read_text())
    fam = layout[slug]["family"]
    if fam in excluded or slug in EX_SLUGS:
        return None
    template = slug_map.get(slug) or fam_map.get(fam) or "content-page"   # unmapped families fall back to the plain page template
    dropped = collections.Counter({"shared_blocks": 0, "non_youtube_video": 0})
    bl = clean(page, dropped)
    seg = Seg(page, template, dropped)
    seg.run(bl)
    seg.mods = refine(seg.mods)
    state = {"template": template}
    mods = retarget_consultation(prune_excluded_links(apply_override(slug, seg.mods, state), EX_PATHS))
    return {
        "url": page["url"], "slug": slug, "template": state["template"], "family": fam, "title": seg.title,
        "seo": page["seo"], "modules": mods,
        "dropped": {k: v for k, v in dropped.items()},
        **({"override": True} if state.get("override") else {}),
    }


EX_SLUGS, EX_PATHS = load_excluded_pages()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.add_argument("--pages", help="comma-separated slugs (default: all non-excluded)")
    a = ap.parse_args()
    layout = json.loads(LAYOUT.read_text())["pages"]
    fam_map, slug_map, excluded = load_template_map()
    slugs = a.pages.split(",") if a.pages else sorted(layout)
    OUT.mkdir(parents=True, exist_ok=True)
    per_t = collections.Counter()
    mods_c = collections.Counter()
    skipped = []
    mostly_plain = []
    dropped = collections.Counter()
    for s in slugs:
        r = modulize(s, layout, fam_map, slug_map, excluded)
        if r is None:
            skipped.append(s)
            (OUT / f"{s}.json").unlink(missing_ok=True)  # stale output from before the exclusion
            continue
        (OUT / f"{s}.json").write_text(json.dumps(r, indent=1, ensure_ascii=False))
        per_t[r["template"]] += 1
        for m in r["modules"]:
            mods_c[m["module"]] += 1
        for k, v in r["dropped"].items():
            dropped[k] += v
        tot = sum(module_words(m) for m in r["modules"])
        plainw = sum(module_words(m) for m in r["modules"] if m["module"] == "rich-text")
        if tot and plainw / tot > 0.2:
            mostly_plain.append((s, round(100 * plainw / tot)))
    print(f"pages built: {sum(per_t.values())}; excluded: {len(skipped)}")
    print("pages per template:", dict(per_t))
    print("module counts:", dict(mods_c.most_common()))
    print("dropped totals:", dict(dropped))
    print(f"pages with >20% of words in plain rich-text: {len(mostly_plain)} (>=50%: {sum(p >= 50 for _, p in mostly_plain)}, >=90%: {sum(p >= 90 for _, p in mostly_plain)})")
    for s, p in sorted(mostly_plain, key=lambda x: -x[1])[:15]:
        print(f"   {p:3d}%  {s}")
    print("   ... (full list: content/structured/_summary.json)")
    (OUT / "_summary.json").write_text(json.dumps({"per_template": per_t, "module_counts": mods_c, "dropped": dropped,
                                                   "mostly_plain_rich_text": dict(mostly_plain), "excluded": skipped}, indent=1))
    print("excluded slugs:", len(skipped))


if __name__ == "__main__":
    main()
