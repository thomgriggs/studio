# dvaughnlaw.com content extraction

Content and SEO data for every page of https://dvaughnlaw.com/ (WordPress + Divi), separated from design so it can be reused in new designs.

Crawl date: 2026-11-05. Extraction last run: 2026-11-05.

## Counts

- URLs: 273 (seed CSV 245 + 29 found only in the sitemaps - 4 CSV URLs are not in the sitemaps)
- HTTP status of crawled URLs: {200: 269, 404: 4}
- Failed fetches (no HTML saved): 0
- By type: author: 1, category: 18, event: 4, event-category: 1, event-schedule: 7, page: 70, post: 170, tag: 2
- Main-region blocks by type: a: 56, embed: 180, form: 56, h1: 243, h2: 282, h3: 196, h4: 434, h5: 52, hr: 7, img: 369, ol: 21, p: 1861, table: 2, text: 274, ul: 292
- Image occurrences (images.csv rows, incl. global header/footer): 372; in page main regions: 369 (185 are css-background); `<img>` in main regions with missing/empty alt: 20
- Pages with a meta description: 0; with meta keywords: 0 (neither is set anywhere on the live site)
- Shared blocks (main region, same type + text on more than 10 pages): 21
- Header menu variants: 5 (the nav differs by site section; all are in `_global.json` / `_global.md`)

## Files

| Path | What it is |
|---|---|
| `content/pages/<slug>.json` | One per URL. Full structured content + SEO (schema below). |
| `content/pages/<slug>.md` | One per URL. Front matter + main-region blocks, each prefixed with its element tag. Shared blocks collapsed at the end. |
| `content/_global.json`, `_global.md` | Header (logos with alt, top bar, nav tree + per-section nav variants), footer blocks, and the common blog sidebar. Written once, not repeated in page files. |
| `content/_shared-blocks.json` | Each shared block once, with the number of pages it appears on. |
| `content/seo-full.csv` / `.xlsx` | One row per URL (SEO, Images, Links sheets in the xlsx). |
| `content/images.csv` | One row per image occurrence (page, src, alt, alt_missing, title, width, height, source, region, shared). Global header/footer images are listed with page "(global)" / "(global header)". |
| `content/links.csv` | One row per link in main content (page, text, href, link type, containing block type, shared, note). Link types: internal (dvaughnlaw.com), external, mailto, tel, other. Links to the old multisite host localwebdesigncompany.com/vaughnlaw are typed external with note `legacy-multisite-host`. Empty-text links and `#` links are omitted. |
| `content/_extract-stats.json` | Machine-readable counts from the last extraction. |
| `content/dvaughnlaw-current-seo.csv` / `.xlsx` | The original seed inventory (not modified). |
| `site/raw/<slug>.html` | Raw downloaded HTML (slug = URL path with `/` as `__`, home = `home`). |
| `site/crawl-log.json`, `site/url-list.json`, `site/sitemaps/` | Per-URL status/redirect log, merged URL list with sitemap-vs-CSV differences, raw sitemap XML. |
| `tools/` | `crawl.py`, `extract.py`, `common.py`, `verify.py`, `verify_structure.py`, `.venv` (git-ignored). |

## Page JSON schema

```
{ "url", "slug", "type", "status", "redirected_to", "last_modified",
  "seo": { title_tag, meta_description, meta_keywords, canonical, robots, og_title, og_description, og_image,
           twitter_card, lang, json_ld_types[], h1_count },
  "post": { date, author, categories[], tags[] },     // posts only
  "sidebar": "global",                                // present when the page uses the common sidebar in _global.json
  "blocks": [ ... document order ... ],
  "word_count" }                                       // main region, excluding shared blocks
```

Every block has `type`, `region` (main | header | footer | sidebar), optional `component` (Divi module: blurb, accordion, fullwidth_header, sidebar, blog, map, video, social_media_follow...), and `shared: true` when flagged.

| type | fields |
|---|---|
| h1-h6 | text, id?, links[{text, href}] |
| p | text (inline links as `[text](href)`, `**bold**`, `*italic*`), links[] |
| text | bare div/span text with no semantic tag; same fields as p |
| ul / ol | items[{text, links[], children[nested list blocks]}] |
| a | text, href, is_button (standalone link/button outside a paragraph; `href` is "" for `#` buttons) |
| img | src (absolute), alt, alt_missing (attribute absent or empty), title, width, height, link_href?, source (`img` or `css-background`) |
| blockquote | text, links[] |
| table | rows[[cell text]], header (bool) |
| hr | |
| embed | provider (youtube, wistia, vimeo, google-maps, calendly, other), src, title |
| form | note (e.g. "Lawmatics intake", "contact form"); inputs are never extracted |

Notes: `css-background` images come from inline styles, data attributes and Divi's per-module CSS (`.et_pb_section_N{background-image:url()}`); they have no alt, so `alt_missing` is false for them and they are excluded from "images missing alt". Embed `src` for Wistia is `https://fast.wistia.com/embed/medias/<id>`; for Divi maps it is a `google.com/maps?q=lat,lng` URL built from the module's coordinates.

Markdown tags: `[h2]`, `[p]`, `[ul]`/`[ol]`, `[a button]` / `[a]`, `[img]` (ALT MISSING when absent), `[embed youtube]`, `[form]`, `[text]`, with `:component` appended where the block lives inside a Divi module, e.g. `[h5:accordion]`.

## Rerun

From `tools/` (create the venv once: `python3 -m venv .venv && .venv/bin/pip install beautifulsoup4 lxml openpyxl`):

```
cd tools
.venv/bin/python crawl.py                # resumable; skips pages already saved (1 req/s, UA content-inventory-bot/1.0)
.venv/bin/python crawl.py --refresh      # re-download everything
.venv/bin/python crawl.py --sitemaps-only  # only refresh url-list.json / sitemaps
.venv/bin/python extract.py              # re-extract from site/raw (no network); rewrites everything in content/ except the seed CSV/xlsx
.venv/bin/python verify.py               # word coverage: raw main text vs extracted blocks
.venv/bin/python verify_structure.py     # heading / list / image counts: raw vs extracted
```

## URLs in the sitemaps but not in the seed CSV (29)

- https://dvaughnlaw.com/author/www-dvaughnlaw-com/ (author-sitemap.xml)
- https://dvaughnlaw.com/category/blog-posts/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/credit/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/estate-planning-probate/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/federal-programs/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/financing/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/finding/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/going-to-market/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/landlord-tenant/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/mortgages/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/newhomes/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/sales-process/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/selecting/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/starting/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/title-and-closing/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/trid/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/uncategorized/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/valoans/ (category-sitemap.xml)
- https://dvaughnlaw.com/category/vaughn-voyage/ (category-sitemap.xml)
- https://dvaughnlaw.com/etn-schedule/day-1-foundations/ (etn-schedule-sitemap.xml)
- https://dvaughnlaw.com/etn-schedule/day-2-systems/ (etn-schedule-sitemap.xml)
- https://dvaughnlaw.com/etn-schedule/day-3-scaling-wrap-up/ (etn-schedule-sitemap.xml)
- https://dvaughnlaw.com/etn-schedule/emerging-technologies-innovation-trends-2/ (etn-schedule-sitemap.xml)
- https://dvaughnlaw.com/etn-schedule/emerging-technologies-innovation-trends/ (etn-schedule-sitemap.xml)
- https://dvaughnlaw.com/etn-schedule/seo-content-marketing-strategies-2/ (etn-schedule-sitemap.xml)
- https://dvaughnlaw.com/etn-schedule/seo-content-marketing-strategies/ (etn-schedule-sitemap.xml)
- https://dvaughnlaw.com/etn_category/events/ (etn_category-sitemap.xml)
- https://dvaughnlaw.com/tag/17/ (post_tag-sitemap.xml)
- https://dvaughnlaw.com/tag/video/ (post_tag-sitemap.xml)

## URLs in the seed CSV but not in the sitemaps (4)

- https://dvaughnlaw.com/etn/
- https://dvaughnlaw.com/etn/applied-ai-machine-learning-summit-2026/
- https://dvaughnlaw.com/etn/estate-planning-how-to-protect-your-home-savings-family-from-costly-mistakes-2/
- https://dvaughnlaw.com/etn/estate-planning-how-to-protect-your-home-savings-family-from-costly-mistakes/

## Known limits

- Only static HTML is read. Content injected by JavaScript is not captured (Lawmatics forms, Wistia players and the Eventin event lists are detected from their static markers only).
- The header/footer are taken from the most common variant; the header nav differs by section (see `nav_variants` in `_global.json`).
- Post author is the WordPress username from page metadata, which may not be a display name.
- Empty links (no text, no image alt, no title) and empty headings are dropped.
