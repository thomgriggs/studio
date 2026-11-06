"""Liftkit shared setup: project folder, config (liftkit.json), slugs, host checks.

Every script finds its project from `--project <dir>` (or env LIFTKIT_PROJECT). All paths below are relative to it.
Config is `<project>/liftkit.json`, deep-merged over DEFAULTS (see liftkit/README.md, "Config reference").
"""
import copy, csv, json, os, re, sys
from pathlib import Path
from urllib.parse import urlparse, urljoin

KIT_DIR = Path(__file__).resolve().parent.parent  # liftkit/


def _find_project():
    a = sys.argv
    for i, x in enumerate(a):
        if x == "--project" and i + 1 < len(a):
            return a[i + 1]
        if x.startswith("--project="):
            return x.split("=", 1)[1]
    return os.environ.get("LIFTKIT_PROJECT")


_p = _find_project()
if not _p:
    sys.exit("Liftkit: pass --project <project dir> (the folder holding liftkit.json) or set LIFTKIT_PROJECT")
ROOT = Path(_p).expanduser().resolve()

DEFAULTS = {
    "name": "",
    "domain": "",                      # bare host, e.g. example.com (www. variants are added automatically)
    "extra_hosts": [],                 # other hostnames that count as "internal" (staging, fallback copy, ...)
    "source": {
        "primary": "",                 # base URL of the live site, e.g. https://www.example.com
        "fallback": "",                # optional base URL of a preserved copy used when the live site fails
    },
    "urls": {
        "seed_csv": None,              # project-relative CSV of known URLs (full URLs or site paths)
        "seed_url_column": "URL",
        "seed_type_column": "Type",    # optional columns; missing ones are ignored
        "seed_name_column": "Page name",
        "seed_modified_column": "Last modified",
        "extra": [],                   # extra URLs/paths to always crawl
        "exclude_regex": [],           # regexes; matching URLs are never crawled or listed
    },
    "sitemaps": ["sitemap_index.xml", "sitemap.xml", "wp-sitemap.xml"],  # relative to source.primary, first that works is used
    "crawl": {
        "user_agent": "Liftkit/1.0 (site redesign content audit)",
        "delay": 1.0,
        "retries": 4,
        "discover_links": False,       # also fetch internal pages linked from crawled pages but missing from the URL list
        "discover_max": 300,
        "discover_skip_regex": r"/(wp-content|wp-admin|wp-json|feed)(/|$)|\.(pdf|jpe?g|png|gif|svg|docx?|xlsx?|zip|pptx?|mp[34]|css|js|ico|xml)(\?|$)|[?&](replytocom|share|print)=|^mailto:|^tel:",
    },
    # CSS selectors, first match wins. `main` is the page content region; everything outside it is "global".
    "selectors": {
        "main": ["#main-content", "#et-main-area", "main", "[role=main]", "#content"],
        "header": ["#tt-header-wrap", "header"],
        "footer": ["#main-footer", "footer"],
        "nav": ["ul#top-menu", "nav"],
        "nav_root": "header",          # where to look for nav: "header" or "page"
        "logo": ["img#logo"],          # searched inside header
        "top_bar": ["#top-header"],    # searched inside header
        "sidebar": ["#sidebar"],       # searched inside main
        "nav_button_class": "tt-top-btn",
    },
    "skip_class_regex": r"(^|\s)(screen-reader-text|sr-only|cookie|cmplz|cookiebot|cli-|gdpr|et_pb_search|et-hide-mobile-dummy|post-meta|nav-single|et_pb_post_nav|post-navigation|comment-respond|et_pb_menu__search|skip-link|et_pb_scroll_top)",
    "skip_id_regex": r"(^main-footer$|^tt-header-wrap$|^main-header$|cookie|cmplz|cookiebot|gdpr|comment-wrap|comments|respond|sidebar-search|et_mobile_nav_menu|et_top_search)",
    "shared_min": 10,                  # a block is "shared" when it appears in the main region of MORE than this many pages
    # {"match": regex, "note": label}: tested against <form> id/class/action and <script> src/text -> one "form" block
    "form_markers": [],
    # {"match": regex, "provider": name}: scripts (in the main region) matching are recorded as embed blocks (portals, calculators)
    "script_embeds": [],
    "link_notes": [],                  # [{"match": substring-of-href, "note": text}] shown in links.csv
    "path_types": {"category": "category", "tag": "tag", "author": "author", "etn-schedule": "event-schedule",
                   "etn_category": "event-category", "etn": "event"},   # first URL path segment -> page type (default "page")
    "yoast": False,                    # record Yoast/WordPress SEO extras (schema graph, reading time) in seo + seo-full.csv
    "global_extras": True,             # contact details, social links, client-login link in _global.json
    "social_domains": ["facebook.com", "twitter.com", "x.com", "linkedin.com", "instagram.com", "youtube.com", "pinterest.com", "tiktok.com", "yelp.com", "g.page"],
    "login_regex": r"client\s*(login|portal)|log\s*in|sign\s*in|portal",
    # join pages to a CSV inventory: {"csv": rel path, "key_column": "url", "fields": ["category", ...]}; keys may be paths
    "inventory": None,
    "layout": {"rules": [], "long_article_words": 400},
    "readme_title": "",
    "modulize": {                      # needs generalising: Vaughn-origin heuristics, all switchable here
        "logo_alt_regex": "award|logo|badge|council|circle|fund|republic|insight|certified|e-closing|rising|best of|top contributor",
        "title_suffix_regex": "",      # stripped from the title tag to make the page title
        "consultation_url": "",        # when set, contact-page links whose text mentions "consult" are retargeted here
        "contact_href_regex": "",
        "excluded_pages_file": "content/excluded-stock-posts.json",
        "templates_file": "design/kit/templates.json",   # falls back to liftkit/kit/templates.json
        "lead_image_to_banner": False,     # no h1: a single photo directly under the title becomes the title-banner image
        "title_from_first_heading": False,  # no h1 on the site: the first h2/h3 of the main region is the page title (and is dropped from the body)
    },
    "build": {
        "test_pages": ["home"],
        "path_prefix_strip": [],       # path prefixes live links may carry (e.g. a staging mirror folder)
        "default_concepts": [],
        "use_scope_paths": False,      # structured pages carry scope.new_path/old_path: mockup path = new_path, links to old URLs resolve to it
        "skip_roles": [],              # scope.role values not built as pages of their own (e.g. ["merged"]); their old URL maps to new_path
        "related_by_tag": False,       # insight-article pages get `related` = other articles with the same scope.tag
        "tag_titles": {},
        "asset_map": {},               # {"<src prefix>": "<concept-relative dir>/"}: the |asset filter points matching images at the concept's own copy (if the file exists)              # scope.tag -> label shown for that related group
    },
}


def _merge(a, b):
    for k, v in b.items():
        if isinstance(v, dict) and isinstance(a.get(k), dict):
            _merge(a[k], v)
        else:
            a[k] = v
    return a


CFG_FILE = ROOT / "liftkit.json"
CFG = copy.deepcopy(DEFAULTS)
if CFG_FILE.exists():
    _merge(CFG, json.loads(CFG_FILE.read_text()))
else:
    sys.exit(f"Liftkit: no liftkit.json in {ROOT}")

CONTENT = ROOT / "content"
PAGES = CONTENT / "pages"
RAW = ROOT / "site" / "raw"
SITEMAPS = ROOT / "site" / "sitemaps"
LOG = ROOT / "site" / "crawl-log.json"
URLLIST = ROOT / "site" / "url-list.json"
HOST = CFG["domain"].lower()
PRIMARY = (CFG["source"]["primary"] or ("https://" + HOST)).rstrip("/")
FALLBACK = (CFG["source"]["fallback"] or "").rstrip("/")
HOSTS = {HOST, ("www." + HOST) if not HOST.startswith("www.") else HOST[4:]} | {h.lower() for h in CFG["extra_hosts"]}
if FALLBACK:
    HOSTS.add((urlparse(FALLBACK).hostname or "").lower())
HOSTS.add((urlparse(PRIMARY).hostname or "").lower())
HOSTS.discard("")
SEED = ROOT / CFG["urls"]["seed_csv"] if CFG["urls"]["seed_csv"] else None


def slug_for(url):
    p = urlparse(url)
    path = p.path.strip("/")
    s = path.replace("/", "__") or "home"
    if p.query:
        s += "--" + re.sub(r"[^A-Za-z0-9]+", "-", p.query).strip("-")
    return s


def is_site(url):
    return (urlparse(url).hostname or "").lower() in HOSTS


def to_url(u):
    """Seed values may be full URLs or site paths; paths resolve against source.primary."""
    u = (u or "").strip()
    if not u:
        return ""
    return u if re.match(r"https?://", u, re.I) else urljoin(PRIMARY + "/", u)


def read_seed():
    """Rows of the seed CSV with the URL column normalised to key 'URL' and optional 'Type', 'Page name', 'Last modified'."""
    if not SEED or not SEED.exists():
        return []
    u = CFG["urls"]
    out = []
    with open(SEED, newline="", encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            row = dict(r)
            row["URL"] = to_url(r.get(u["seed_url_column"]))
            row["Type"] = r.get(u["seed_type_column"], "") or ""
            row["Page name"] = r.get(u["seed_name_column"], "") or ""
            row["Last modified"] = r.get(u["seed_modified_column"], "") or ""
            if row["URL"]:
                out.append(row)
    return out


def excluded_url(url):
    return any(re.search(x, url) for x in CFG["urls"]["exclude_regex"])


def pick(soup, sels):
    """First element matched by a list of CSS selectors (or a single selector)."""
    for s in ([sels] if isinstance(sels, str) else sels or []):
        try:
            el = soup.select_one(s)
        except Exception:
            el = None
        if el is not None:
            return el
    return None


def pick_all(root, sels):
    for s in ([sels] if isinstance(sels, str) else sels or []):
        try:
            els = root.select(s)
        except Exception:
            els = []
        if els:
            return els
    return []


def path_key(url):
    """Normalised path for joining inventory rows to pages: no host, no query/fragment, no trailing slash ('/' stays '/')."""
    p = urlparse(url).path or "/"
    p = re.sub(r"/+$", "", p)
    return p or "/"
