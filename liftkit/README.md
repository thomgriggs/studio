# Liftkit

"Lift the content, apply a kit." Liftkit takes a client's live website, lifts every page into design-free typed content plus SEO sheets, and (optionally) pours that content into a design concept built from a shared module kit, so a redesign starts from the client's real words and a mockup can be shown fast. Nothing in a client project is copied from another client; the tools live here once and each project holds only its config, data and designs.

Status: the Vaughn Law pipeline (`dvaughnlaw/tools/`, untouched and still the version that project runs) was generalised into `liftkit/tools/`. Parts 1, 2 and the layout analysis were verified byte-for-byte against Vaughn Law output; Reliance CPA (`reliancecpa/`) is the first project started on the shared tools.

## The five parts

| # | Part | Script | What it does |
|---|---|---|---|
| 1 | Crawl | `tools/crawl.py` | Fetch every page of the live site into `site/raw/`. Polite (1 request/second, generic user agent), resumable, optional fallback copy, optional link discovery. |
| 2 | Extract | `tools/extract.py` (+ `common.py`, `verify.py`, `verify_structure.py`, `layout.py`) | One JSON + Markdown per page with typed blocks (h1-h6, p, a, ul, ol, img, embed, "form"), SEO sheets (`seo-full.csv/.xlsx`), `images.csv`, `links.csv`, `_global.json`, `_shared-blocks.json`, `_layout-analysis.json`. |
| 3 | Modulize | `tools/modulize.py` | Turn typed blocks into design-free module instances (`content/structured/`). |
| 4 | Build | `tools/build.py` (+ `linkcheck.py`) | Render a design concept (Jinja2 module templates + CSS in `design/concepts/<name>/`) from the content into `mockup/<name>/`; supports `content/proposed/*.json`, `nav.json`, `footer.json`, exclusions. |
| 5 | Kit | `kit/` | The module + page-template catalogue with Squarespace equivalents (`kit/README.md`, `kit/templates.json`). |

Parts 1-2 are generic WordPress-first and work on any server-rendered site. Parts 3-4 carry heuristics first tuned on one site (see "Needs generalising").

## Setup (once)

```
cd liftkit && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
```

`liftkit/.venv` is the only venv (git-ignored with `__pycache__`). Dependencies: beautifulsoup4, lxml, openpyxl, jinja2 (the crawler uses the standard library).

## Project folder layout

A project is any folder; every script takes `--project <dir>` (or env `LIFTKIT_PROJECT`) and all paths are relative to it.

```
<project>/
  liftkit.json            YOU WRITE: the per-project config (reference below)
  inventory/ or content/  optional seed CSV of known URLs (urls.seed_csv), optional inventory CSV to join (inventory.csv)
  site/                   PRODUCED by crawl.py   (site/raw is git-ignored: never commit or deploy raw HTML)
    raw/<slug>.html         one file per URL; slug = URL path with / as __, home = "home"
    crawl-log.json          per URL: status, redirect, source (live | fallback | failed), error
    url-list.json           merged URL list, sitemap-vs-seed differences, pages found by link discovery
    sitemaps/               raw sitemap XML
  content/                PRODUCED by extract.py / layout.py
    pages/<slug>.json + .md
    seo-full.csv, seo-full.xlsx (SEO, Images, Links sheets), images.csv, links.csv
    _global.json + .md      header, nav, footer, contact details, social links, client-login link
    _shared-blocks.json     blocks repeated on more than shared_min pages
    _layout-analysis.json   layout families, page -> family, scaffolds, boilerplate, cohort stats
    _extract-stats.json, README.md
    structured/             PRODUCED by modulize.py
    nav.json, footer.json, proposed/, overrides/, excluded-stock-posts.json   WRITTEN BY HAND for parts 3-4
  design/
    kit/templates.json    optional project copy of the kit catalogue (falls back to liftkit/kit/templates.json)
    concepts/<name>/      concept.json, style.css, modules/NN-name.html, templates/*.html
  mockup/<concept>/       PRODUCED by build.py
```

## Starting a new project

1. Make `<project>/` and copy `liftkit/examples/<closest>/liftkit.json` into it (`examples/dvaughnlaw` = WordPress + Divi; the Reliance CPA config in `reliancecpa/liftkit.json` = a custom classic WordPress theme). Set `domain`, `source.primary`, and the selectors.
2. Find the selectors: save one page (`curl -A "Liftkit/1.0 (site redesign content audit)" URL > home.html`), open it, and note the CSS selectors of the content region (`selectors.main`), header, footer, nav, logo, top bar, sidebar. Wrong `main` is the most common problem: if `verify.py` reports lots of missing words, the region is wrong.
3. Put any known URL list in a CSV (`urls.seed_csv`, URL or path column). The sitemaps are read as well; with `crawl.discover_links` pages that are only linked are found too.
4. `liftkit/.venv/bin/python liftkit/tools/crawl.py --project <project> --sitemaps-only`, check the URL count, then run the crawl (add `--limit 20` first as a trial). It is resumable; `--retry-failed` retries failures; `--refresh` re-downloads everything.
5. `... extract.py --project <project>` (offline, rerunnable), then `layout.py`, `verify.py`, `verify_structure.py`. Read `content/README.md` and `_global.md`; tune `selectors`, `skip_*_regex`, `form_markers`, `script_embeds`, and re-run (no network needed).
6. Add `layout.rules` and `layout.cohorts` to name layout families and analyse groups (e.g. an article library).
7. Parts 3-4 (only when a design is wanted): copy `kit/templates.json` to `<project>/design/kit/templates.json`, fill in `family_to_template`, run `modulize.py`, write `nav.json`/`footer.json`/proposed pages, add a concept under `design/concepts/`, run `build.py --concept <name> --all`, then `linkcheck.py`.

Never put a personal email address in the user agent or anywhere in requests. The default agent is `Liftkit/1.0 (site redesign content audit)`.

## Commands

```
LK=liftkit/.venv/bin/python; P=<project>
$LK liftkit/tools/crawl.py --project $P [--sitemaps-only] [--refresh] [--retry-failed] [--limit N]
$LK liftkit/tools/extract.py --project $P
$LK liftkit/tools/layout.py --project $P
$LK liftkit/tools/verify.py --project $P [N]            # word coverage, worst N pages
$LK liftkit/tools/verify_structure.py --project $P      # heading/list/image counts, raw vs extracted
$LK liftkit/tools/modulize.py --project $P [--pages a,b]
$LK liftkit/tools/build.py --project $P --concept <name> [--pages a,b | --all]
$LK liftkit/tools/linkcheck.py --project $P [concept ...]
```

## Config reference (`liftkit.json`)

Every key is optional except `domain`; defaults are in `tools/common.py` (`DEFAULTS`), deep-merged under your file.

| Key | Meaning |
|---|---|
| `name`, `readme_title` | Labels used in generated READMEs. |
| `domain`, `extra_hosts` | Hosts counted as internal (www. variant added automatically). |
| `source.primary` | Base URL crawled and used for relative seed paths and as the canonical host (e.g. `https://www.example.com`). |
| `source.fallback` | Optional preserved copy. Used only for URLs where the live fetch fails (error or HTTP >= 400); its origin is rewritten to the primary one in the extracted links/images. Each page records `source: live \| fallback`. |
| `urls.seed_csv`, `urls.seed_*_column` | CSV of known URLs (full URLs or paths). Optional columns give page type, name, last-modified. |
| `urls.extra`, `urls.exclude_regex` | Extra URLs to crawl; regexes for URLs never crawled. |
| `sitemaps` | Sitemap file names tried in order under `source.primary` (index or plain). |
| `crawl.user_agent`, `delay`, `retries` | Politeness. Default delay 1 s. |
| `crawl.discover_links`, `discover_max`, `discover_skip_regex` | Follow internal links to pages missing from the list; recorded under `discovered` in `url-list.json`. |
| `selectors.main / header / footer` | CSS selector lists (first match wins). |
| `selectors.nav`, `nav_root` | Nav `ul` selector; look inside the header (`header`) or anywhere on the page (`page`). |
| `selectors.logo`, `top_bar`, `sidebar` | Logo `img`s and top bar (inside header); an in-main sidebar split off as its own region. |
| `selectors.nav_button_class` | `li` class marking a call-to-action button in the nav. |
| `skip_class_regex`, `skip_id_regex` | Elements ignored everywhere (cookie banners, comment forms, screen-reader text). |
| `shared_min` | A block is "shared" boilerplate when it appears in the main region of MORE than this many pages. |
| `form_markers` | `[{match, note}]` regexes tested on `<form>` id/class/action and scripts; produces a `form` block with that note. Forms are recorded only as `form`; inputs are never extracted. |
| `script_embeds` | `[{match, provider}]` scripts in the main region recorded as embed blocks (portals, calculators, third-party content). |
| `link_notes` | `[{match, note}]` annotate matching hrefs in `links.csv`. |
| `path_types` | First URL path segment -> page type (default `page`). |
| `yoast` | Adds a Yoast block to `seo` and Yoast/OG/reading-time/page-source columns to `seo-full.csv`. |
| `global_extras` | Adds phones, emails, addresses, JSON-LD organisation, `social_links`, `client_login_links` to `_global.json`. `social_domains`, `login_regex` tune it. |
| `inventory` | `{csv, key_column, fields[]}` joins each page to a CSV row by URL path; stored as `inventory` in the page JSON and as columns in `seo-full.csv`. |
| `layout.rules` | `[{id, name, when:{path_regex, slug_regex, type, inventory:{field:value}}}]` naming layout families. |
| `layout.cohorts` | `[{name, where:{"inventory.category": "..."}, vendor_markers:[regex]}]` per-group stats: words, title/meta uniqueness, copyright/vendor markers, repeated blocks, external hosts. |
| `layout.long_article_words` | Word count above which a page counts as long. |
| `modulize.*` | `logo_alt_regex`, `title_suffix_regex`, `consultation_url` + `contact_href_regex` (retarget contact links whose text says "consult"), `excluded_pages_file`, `templates_file`. |
| `build.*` | `test_pages` (default build set), `path_prefix_strip`, `path_aliases`, `default_concepts` (for `linkcheck.py`). |

For rules too complex for JSON, add a small Python hook module later; none has been needed yet.

## What is config-driven now

Domain, hosts, start URLs, sitemaps, seed CSV and its columns, URL exclusions, user agent and delay, fallback source, link discovery, every structural selector (main/header/footer/nav/logo/top bar/sidebar/nav button), cookie/junk skip rules, shared-block threshold, form and third-party-script detection, link notes (e.g. the old Vaughn staging host), page-type by path, inventory join, Yoast extras, layout naming rules and cohort analysis, modulize title suffix / logo-alt / consultation retargeting / exclusion file / template map, build default pages, path prefixes and aliases, linkcheck default concepts, README titles and the project paths. WordPress upload paths (`wp-content`) are not special-cased in the extractor; they pass through as ordinary image URLs.

## Needs generalising

- **Divi assumptions in extract.py** (always on, harmless elsewhere): module recognition from `et_pb_*` classes (`component` on blocks), Divi per-module CSS background images, Divi map coordinates, `et_pb_*` entries in the default skip regexes. Other builders (Elementor, Wix, Squarespace, Webflow) get no `component` hints, which modulize relies on.
- **`modulize.py` segmentation heuristics** were tuned on one WordPress/Divi legal site: blurb -> card-grid, accordion, "bold lead as heading", steps / stat-row / callout / quote-tile detection, the partner-logo test (`logo_alt_regex`), and the video rules (YouTube kept, Wistia/other dropped). The template names it targets (home, hub, content-page, article, video-post, listing, team, workshop, consultation) and the family -> template map are project data (`design/kit/templates.json`); unmapped families fall back to `content-page`.
- **`build.py` shared-contact "closing" block** is derived from the shape of Divi blurb blocks (heading/value pairs, at least 8) and the most common shared `h2`. Post indexes assume WordPress category archive slugs (`category__<slug>`), post templates named `article`/`video-post`, and posts with a published date.
- **Excluded-pages file** keeps the Vaughn format (`stock_posts`, `video_posts`, `listings`, `other`); the group names should become generic.
- **Consultation retargeting** is a Vaughn feature kept behind `modulize.consultation_url`.
- **Header/footer variants** are detected by text hash of the matched header/footer element; sites whose header contains rotating content (sliders, dates) report many variants.
- **Sitemaps** are read as WordPress/Yoast-style XML only.
- **layout.py** is new (Vaughn's `_layout-analysis.json` was written by hand). Families are scaffold + structural traits; module-level "modules" are a coarse block shape string, not kit modules, so modulize only uses the `family` key.
- Single-language, static-HTML only: content injected by JavaScript is not seen.

## The shared kit

`kit/README.md` is the module + page-template catalogue (36 modules with slots, the crawl patterns that map to each, Squarespace 7.1 equivalents and whether a code block is needed). `kit/templates.json` is the generic starting catalogue: the template list plus empty `family_to_template`, `slug_overrides`, `excluded_families`. `kit/templates.vaughnlaw-example.json` is the filled-in Vaughn Law version. Each project can extend the kit: copy `templates.json` to `<project>/design/kit/templates.json`, add its own modules to its concepts, and document them in a project kit README; the shared copy is only changed for improvements every project benefits from.

## Verification done

- Vaughn Law: `extract.py` against a copy of all 273 raw pages with `examples/dvaughnlaw/liftkit.json` reproduces all 546 `content/pages/*.json/.md`, `_global.json/.md`, `seo-full.csv`, `images.csv`, `links.csv` and `_extract-stats.json` byte-for-byte (`_shared-blocks.json` has identical content; the old file's order of equal-count blocks was random per run, the new one is stable). `verify.py`/`verify_structure.py` give the same results as the originals (0 pages over 2% missing words; 106 pages with image-count differences, as before). `modulize.py` reproduces `content/structured/` and `build.py --all` reproduces `mockup/05-people-first-v2/` identically; `linkcheck.py` reports 0 broken.

## Additions for Reliance CPA (all switchable by config or by data in the project; Vaughn output verified unchanged)

New `build.*` keys in `liftkit.json` (defaults keep the Vaughn behaviour):

| Key | Meaning |
|---|---|
| `use_scope_paths` | Structured pages carrying `scope.new_path` / `scope.old_path` are built at the new path (`url` becomes the new URL, the live one is kept as `live_url`), and every link to an old live URL resolves to the new page. |
| `skip_roles` | `scope.role` values not built as pages of their own (e.g. `["merged"]`), plus any slug a proposed page lists in `consolidates`; their old URL still resolves to the page they merged into. |
| `related_by_tag` / `tag_titles` | Pages with `scope.tag` get `related` = the next three articles with the same tag (same shape as the dated-post `related`). |
| `asset_map` | `{"<src prefix>": "<concept dir>/"}`: the `|asset` filter points matching image/video sources at the concept's own copy when the file exists (e.g. content that says `concept-02/assets/x.jpg`, or live portraits copied into `assets/people/`). |
| `path_aliases` | now also used for `index.html` to home (`{"index.html": ""}`). |

Other generalisations in `tools/build.py` / `linkcheck.py`:

- **Nav**: `nav.json` top-level items without `children` (Contact, Client Login) are resolved into `nav.links`; an optional `mega` block (columns[tier, heading, description, accent, overview, links, secondary]) is resolved into `nav.mega` with current/active flags; templates render it. `nav.menu` stays the folder fallback.
- **Footer**: `footer.json` `columns` (links naming a `target_slug`) are used when present; a literal `contact` block (address, phone, fax, email) is accepted when the crawl has no shared contact block; `client_login` is passed through.
- **Closing**: when `content/_shared-closings.json` has `closing_band {title, text}`, `closing` is built from it (no shared contact block needed).
- **Concept folders**: sub-folders other than `modules/` and `templates/` (e.g. `assets/`) are copied into the mockup.
- **Jinja**: filter `asset`, global `page_href(slug)` (relative href of a built page, e.g. the Get Started page of the visitor's tier), `page.tier` (the page's own `tier`, else `scope.tier`) on every page.
- **pages.html** skips pages that are not built on their own and carries `tier` / `scope` per page.
- **linkcheck** ignores directories named like `contact.html` (live copies of pages whose slug has a dot).

Reference concept: `reliancecpa/design/concepts/02-broadsheet/` (Broadsheet tokens and components, three territory classes `terr-teal|sage|gold` that set `--terr`, `--terr-ink`, `--terr-tint`; mega flyout and mobile panel in `_nav.html` + `nav.js`).
