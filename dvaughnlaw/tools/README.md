# tools

Content crawl (see `content/README.md`): `crawl.py`, `extract.py`, `verify.py`, `verify_structure.py`.

Mockup pipeline (see `design/kit/README.md`). Run from `dvaughnlaw/`; the venv has beautifulsoup4, lxml, openpyxl, jinja2.

```
tools/.venv/bin/python tools/modulize.py                  # all non-excluded pages -> content/structured/*.json, prints a summary
tools/.venv/bin/python tools/modulize.py --pages home,estate-planning
tools/.venv/bin/python tools/build.py --concept 05-people-first-v2                 # the four test pages + kit.html + pages.html
tools/.venv/bin/python tools/build.py --concept 05-people-first-v2 --pages a,b     # chosen slugs (slug = path with / as __, home = home)
tools/.venv/bin/python tools/build.py --concept 05-people-first-v2 --all
```

`content/nav.json` is the design-free header menu shared by every concept (folders of items; each item has `label`, `proposed_url`, `target_slug` = the live page it opens in the mockup or null, `status`, `also_merges`). build.py loads it and gives every template a `nav` object with each href resolved to the built page (relative) and `available` false when `target_slug` is null or the page is not built; `current`/`related` mark the active page and section. Build with `--all` so menu links resolve; with `--pages`, links to unbuilt pages show as "no page yet".

Output goes to `mockup/<concept>/` (home at `index.html`, other pages at their URL path, plus `kit.html`, `pages.html`, `style.css`). Every page has meta robots noindex,nofollow. Add a design by creating another folder in `design/concepts/`; nothing else changes.

## New in this pass

- `modulize.py` has a second pass (`refine`) after segmentation and before overrides: it lifts `quote-tile` and `steps` out of headed sections, merges a short heading plus text with the YouTube video beside it into `video-split`, turns a lone short statement into `callout`, and `stat-row` is detected where blurbs are collected. Counts on the live content: steps 4 pages, stat-row 1, callout 11, video-split 1, quote-tile 1, review-line 0 (defined, nothing in the crawl to feed it). 16 pages changed in total; every other structured file is byte-identical to before.
- `build.py` passes every template `closing` (the shared contact block as data), `related` (same-category posts, for posts) and adds `date` to post-feed teasers; new Jinja filters `ytid`, `people_first`, `bodywords`; optional tone settings `by_template`, `tinted`, `after_fixed`. Details in `design/kit/README.md`, "Shared context".
- Concept 05 page shells share `templates/_flow.html` (logo-row badges render last, right before the navy closing band in `_closing.html`).
- Checks used: text integrity (every word of each page's structured content appears in the rendered `<main>`, case and punctuation ignored, dates compared as written out, video titles excluded because they are iframe attributes) and one `h1` per page, both run over all 247 pages of both concepts.

## Proposed pages (content/proposed/)

`content/proposed/<slug>.json` holds copy written for the redesign instead of crawled (same module-instance format as `content/structured`; page-level `"source": "proposed"`, `"confirm"` = facts needing the client's sign-off, `"verified"` = facts traced to the crawl, `"own_closing": true` = the page carries its own `contact-band`, so a concept must not add its global closing band). `build.py` renders it in place of `content/structured/<slug>.json` and ALSO renders the live version at `mockup/<concept>/live/<slug>/index.html` (noindex, with a "Live site content, for comparison" strip linking back), so the pitch can show before and after. Currently only `home`. Concept-agnostic: nothing in a proposed file names a design.

Design-free references resolved at build time: `{"nav": "Folder/Label"}` (href and `link_text` from `content/nav.json`; an item with no live page is left out of its list; `Overview` items get "<Folder> overview" as link_text), `{"page": "<slug>"}` (that page's URL), `{"nav_folder": "Estate Planning", "planned": "hub"}` (as a `links` value: a link for every item in that menu folder except Overview; with the opt-in `planned: "hub"` an item with no live page links to the folder's Overview and carries `planned: true`, which door-pair renders as `data-planned="true"`; without the flag such items are dropped), `"lines_from": "closing"` (address, phone and email from the shared contact block). A proposed page's `seo.title_tag` and `meta_description` become the page `<title>` and meta description (the page stays noindex).

## Round 3

- `content/excluded-stock-posts.json` drives exclusions (see `design/kit/README.md`, "Excluded pages"); `modulize.py` also points consultation CTAs at `/consultation/` and removes stale structured files for excluded slugs.
- `build.py --all` now also builds proposed pages that have no live counterpart (videos, consultation flow); new resolver keys `phone_from` and `lines_from` + `only`.
- `tools/linkcheck.py [concept ...]`: relative links, anchors, and absolute old-site links to pages that are not in the mockup ("stale"). Exit 1 on broken links.

## Round 4

- `build.py --all` resolves every link to dvaughnlaw.com at build time and writes `content/unresolved-links.json` (links with no page in the mockup, plus the file downloads that stay on the live site). `linkcheck.py` fails on any live-site page link and prints the file-download count.
- Proposed pages now include the four practice hubs: real-estate-law, estate-planning, title-services, investors.
