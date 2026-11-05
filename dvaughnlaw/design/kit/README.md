# Page kit (design-free)

The kit is the contract between **content** and **design**. `tools/modulize.py` turns each crawled page into an ordered list of module instances (`content/structured/<slug>.json`). A concept (`design/concepts/<name>/`) supplies one template per module. Swap the concept and the content stays put.

Pipeline: `content/pages/*.json` -> `tools/modulize.py` -> `content/structured/*.json` -> `tools/build.py --concept <name>` -> `mockup/<name>/`.

Rules: live text exactly as crawled, no invented copy; an empty slot is left out (visible gaps are the point); `shared` boilerplate blocks and the global sidebar are never carried; only YouTube embeds are kept.

## Templates (`templates.json`)

| Template | Layout families (and outliers) |
|---|---|
| home | `/` |
| hub | hub-landing |
| content-page | text-page, faq-page, index-list, form-page; `/resources/closing-calculators/`, `/booklets/` |
| article | post-article |
| video-post | post-video (no page now: all video posts are excluded, see below) |
| listing | archive-list |
| team | `/about/our-team/` |
| workshop | `/person-workshops/` |
| consultation | proposed only: `/consultation/`, `/consultation/<situation>/` (7), `/consultation/thanks/` |

Excluded: legacy-template-demo, plugin-stub.

## Modules

Each module instance is `{module, variant?, slots:{...}}`. There are 36 modules: 19 original, 6 added for the "people first" rhythm (steps, stat-row, callout, video-split, quote-tile, review-line), 8 added for the proposed home page (trust-strip, door-pair, situation-picker, reasons, people, contact-band, event-band, video-feed) and 3 for the Videos page and consultation flow (video-grid, choice-cards, form); every concept implements all 36. Text slots hold the crawl's inline markdown (`[text](href)`, `**bold**`, `*italic*`). Body arrays hold blocks `{type: p|ul|ol|subhead|quote|button|embed-link|table}`.

| Module | Purpose | Slots | Crawl patterns that map here | Squarespace 7.1 | Code block? |
|---|---|---|---|---|---|
| hero | Home/hub opener | title, tagline, image, actions[text,href] | h1 in Divi `fullwidth_header` with its text and buttons, css-background image | Section with background image + Heading H1 + Text + Buttons | no |
| title-banner | Inner page title | title, image?, date? | h1 (+ preceding banner image) on every other page; falls back to the SEO title when there is no h1 | Section, solid or image background, Heading H1 | no |
| intro | Opening paragraph(s) | paragraphs[] | leading p/text run after the title when more content follows | Text block, large paragraph style | no |
| rich-text | Plain running text | body[] | any heading-less p/text/ul/ol run left over; the fallback | Text block + Buttons | no |
| headed-section | Heading + text | eyebrow, title, level, depth, image?, body[]; variants `lead-in`, `on-image` | h2-h6 followed by body; bold-only lines (2+ in a run) acting as headings (`lead-in`); css-background image + heading + body (`on-image`); short unpunctuated line before a heading becomes `eyebrow` | Heading + Text in a 2-column section; on-image = section background | no |
| card-grid | Short cards | eyebrow, title, cards[title,text[],href,link_text,image] | Divi `blurb` components (glyph-only text dropped) | Summary/cards layout or grid of blocks | no |
| accordion | Q&A / topics that open | eyebrow, title, items[title, body[]] | Divi `accordion` components (h3-h5 + body); a preceding heading becomes the title; third-party tool embeds become a link in the item | Accordion block | no |
| list | A list carrying a section | ordered, items[lead,text,children] | heading-less `ol`, or `ul` with 3+ items, in a run; leading `**bold**` becomes `lead` | Text block with list | no |
| image-text | Photo(s) + heading + text | images[], eyebrow, title, level, body[] | 1-2 photos immediately followed by a heading | Two-column section: Image + Heading + Text | no |
| image | Single photo | image | lone photo | Image block | no |
| gallery | 3+ photos together | images[] | run of 3+ photos, no text between | Gallery block | no |
| video | YouTube video | url, title | `embed` with provider youtube | Video block | no |
| post-feed | Post teasers | posts[title,href,excerpt], more[text,href] | linked h2 + excerpt on blog and archives, "Older Entries" link | Blog collection / Summary block | no |
| logo-row | Badges / partner logos | logos[src,alt,href] | run of 2+ badge-like images (alt/filename test) | Image blocks in a row or strip gallery | no |
| cta-band | Call to action | eyebrow, title, level, text, buttons[], image? | css-background image + heading + buttons / one line | Section with background + Heading + Button | no |
| profile | One person | image, name, role, links[] | image whose alt matches the next h2, then a role line (+ social list) | Two-column Image + Text; repeat per person | no |
| link-list | Titled links | eyebrow, title, level, links[text,href] | heading + `ul` where every item is one link; link-only `ul`; tool embed shown as link | Text block of links or Buttons | no |
| table | Data table | eyebrow, title, level, header, rows | `table` | No native table: Markdown block or small code block | **yes** |
| form-placeholder | Where a form goes | note | `form` (non-shared) | Form block | no |
| steps | A short numbered process | eyebrow, title, level, depth, items[lead, text] | An ordered list of 3 to 6 items with no nested lists, each item (lead-in plus text) at most 40 words: a heading-less `ol` run, or an `ol` inside a headed section (the section is split: heading and text before it stay a headed-section, the list becomes steps, text after it becomes rich-text). Longer ordered lists stay `list`. Fired on 4 of 247 pages | A row of Text blocks (one per step, number in a Heading 3 or small circle image) or a numbered list | no |
| stat-row | 2 to 4 short facts side by side | eyebrow, title, level, items[value, label] | A run of 2 to 4 blurbs that are only a few words each (at most 5) with no title, image or link; a leading figure (`$200`, `20+`, `95%`) becomes `value`, otherwise the whole line is the `label`. Fired on 1 page (the workshop's "Completely Free / No Obligation / All Ages Welcome / Seats Are Limited": labels only, the live page has no figures) | A row of 2 to 4 Text blocks, or a Summary block grid | no |
| callout | One standalone statement | text | A rich-text module that is one paragraph of 8 to 25 words, ends in a full stop, is not bold-only, is not the opening text after the title and is not the lead-in to a list or table that follows. Fired on 11 pages (mostly the closing "No matter your situation, Vaughn Law can help ..." line) | One Text block in the Heading 3 or large-paragraph style in a soft-coloured, rounded section | no |
| video-split | Video beside heading and text | eyebrow, title, level, depth, body[], url, video_title | A headed-section with text only (at most 60 words, no photo) directly before a YouTube `video`; the two merge. Fired on 1 page (`/cyber-security/`) | Two-column section: Video block beside Heading, Text and Button blocks | no |
| quote-tile | A real quotation with attribution | text, attribution | A whole-paragraph quote (opens with a curly or straight quote mark, at least 8 words) immediately followed by an italic "- Name" line; the pair is lifted out of its headed-section or rich-text. Never invented. Fired on 1 page (`/person-workshops/`, the founder's mission quote) | Quote block (native) or a Text block in Heading 3 style plus a small paragraph | no |
| review-line | One line of client praise with reviewer, source and optional rating | text, author, source, rating, href | Defined for the design (the reference site has a "4.9 stars, 250+ reviews" line). The crawl has no client reviews or ratings (the only quote-like text is the founder's own), so nothing emits it: defined but unused. Do not hand-write one | Centered Text block or Testimonials block | no |
| trust-strip | Proof directly under the hero | facts[lead, text] (0 to 3), logos[src, alt, href] | Proposed home only. Facts only if verifiable in the crawl; no invented numbers | Row of 3 Text blocks + row of Image blocks | no |
| door-pair | The two ways in (practice areas) with link lists | anchor, title, items[title, text, image, links[text, href, link_text, planned], button] | Proposed home only | Heading + two-column row: Image, Heading 3, Text, link Text/Buttons, Button; section ID for the anchor | no |
| situation-picker | Visitor picks their situation | title, cards[title (first-person line), text, href, link_text] | Proposed home only | Summary block (Card layout, whole card linked) or linked Text blocks, 3 x 2 | no (hover fill is native block hover where available) |
| reasons | 3 to 5 short reasons to choose the firm | eyebrow, title, image?, items[title, text] | Proposed home only | Heading + Image block beside a grid of Text blocks | no (05's numbered discs are a CSS counter; type the numerals in Squarespace) |
| people | Portraits, quote and optional intro video | eyebrow, title, text, link, video[url,title], people[], quote[text,attribution], team[] | Proposed home only | Video block beside Heading/Text/Button; Image blocks with captions; Quote block | **Concept 05's arch-top and round crops need CSS or a code block; native fallback is rounded squares** |
| event-band | An upcoming event: photo, title, line, dates with times and venues, button | eyebrow, title, text, image, events[date, time, venue, address], buttons[] | Proposed home only (live /person-workshops/ 'Upcoming Events') | Two-column section: Image block beside Heading, Text blocks (date, time, venue), Button | no |
| video-feed | Newest video posts as poster cards with an 'all videos' link | eyebrow, title, text?, videos[title, href, date, video], more[text, href] | Proposed home only (video-post pages) | Summary block (grid, thumbnails + title + date) or Video blocks, plus a Button | no |
| contact-band | The page's one closing contact band | title, text, lines (from the shared contact block), button | Proposed home only (`own_closing`) | Dark section: Heading, Text, Button, contact Text blocks (or the site footer section) | no |
| video-grid | Every YouTube video of the firm's channel, newest first, as poster cards | eyebrow, title, videos[title, href (YouTube watch URL), date, video], more[text, href] | Proposed Videos page only (content/videos.json) | Section: Heading + grid of Video blocks (or Summary block over a video collection) + Button to the channel; cards open YouTube in a new tab | no |
| choice-cards | Step 1 of the consultation flow: a question and stacked large choice cards, each a plain link to its step-2 page, plus a call line | step[label, current, total], title (h1), text, cards[title, text, href], call[text, phone] | Proposed consultation page only | Text ("Step 1 of 2"), Heading, Text, seven large Button blocks with short Text under each (or a Summary block over the seven step-2 pages) | no |
| form | Step 2: step indicator, "Change" link, heading, ONE form from a field list, disclaimer line, call line | step, title (h1), text, change[text, href], form[type "form", note, fields[id, label, type name/text/textarea/select/radio/checkbox/date/email/phone, options, required], submit[text, href], disclaimer], call | Proposed consultation/<situation> pages only | Native Form block with those fields and a post-submit redirect; Text blocks for the step line, Change link and disclaimer. The mockup form is visible but never submits (the button is a link to the confirmation page) | no |


Extensions used by the proposed home: `hero` gains `eyebrow`, `images[]` and `inset` (the proposed home no longer uses `inset`); `steps` gains `actions[]` and variant `process`; `post-feed` gains `title` and variant `cards`. Proposed pages and the live/ comparison copy are described in `tools/README.md` ("Proposed pages").

Detected structure the old site hides (see the new rows above for steps, stat-row, callout, video-split and quote-tile): question headings + answers -> accordion; bold lead-in lines -> headed-section; blurbs -> card-grid; consecutive badge images -> logo-row; image + name heading -> profile.

Heading levels: `level` keeps the original (rendered as `data-orig-level`); `depth` (2 or 3) is the level used on the page. Pages render exactly one h1.

## Shared context passed to every template

`tools/build.py` hands each page template, besides `page`, `root` and `nav`:

- `closing`: the live site's shared contact block as plain data, so any concept may render it: `{heading, text, lines:[{label, text, href?}]}`. `heading` is the live "Get in touch with us"; `text` is the firm paragraph beside it; `lines` are Address, Phone Number, Fax Number and Email as crawled (`href` is the tel: or mailto: link). Built from `content/_shared-blocks.json` (which block repeats) and the first crawled page that carries it (order). Concept 05 renders it as the navy closing band; concept 04 does not use it.
- `related` (posts only, else null): `{category:{slug, title, url}, posts:[{title, url, date}]}`, up to three other posts of the same category nearest in date. Concept 05 renders them as the "More articles" row.
- Post-feed teasers carry `date` when the teaser links to a known post page.
- Jinja filters for concepts: `md`, `href`, `longdate`, `ytid` (YouTube id, for a poster image), `people_first` (stable sort of images, people photos first, by file name and alt), `bodywords` (word count of body blocks, to pick a layout by length).
- Tone options in `concept.json` (all optional): `by_template` (own cycle per page template), `tinted` (modules that skip a plain white slot), `after_fixed` (ground for the section after a hero or banner that carries a photo tile).

## Hand overrides (`content/overrides/<slug>.json`)

If the file exists, `modulize.py` applies it after generating the module list, so tuning survives rebuilds. Two forms:

```json
{ "mode": "replace", "template": "content-page", "modules": [ {"module": "intro", "slots": {"paragraphs": ["..."]}} ] }
```
replaces the whole list; or patch:

```json
{ "ops": [
  {"op": "remove",  "index": 3},
  {"op": "replace", "index": 2, "module": {"module": "rich-text", "slots": {"body": []}}},
  {"op": "insert",  "index": 1, "module": {"module": "video", "slots": {"url": "https://www.youtube.com/embed/..."}}},
  {"op": "set",     "index": 0, "slots": {"title": "..."}, "variant": "x"},
  {"op": "move",    "from": 4, "to": 1}
] }
```
Ops run in order (indexes refer to the list at that moment). `template` is optional in both forms. Output gets `"override": true`.

## A concept (`design/concepts/<name>/`)

`concept.json` (name, logo, fonts, colour tokens, tone rules), `style.css`, `modules/NN-name.html` (one Jinja template per module; header comment with MODULE / PURPOSE / SLOTS / SQUARESPACE lines, which the kit page reads), `templates/<template>.html` page shells plus `_base.html`, `_kit.html`, `_pages.html`. Module templates receive `m`, `s` (slots), `variant`, `tone`, `page`, `root`. Note: in Jinja use `s["items"]`, not `s.items` (dict method clash).

## Navigation

The header menu is defined once in `content/nav.json` (shared by all concepts; build.py resolves hrefs and passes it to templates as `nav`). Each concept renders it in `templates/_nav.html` (included from `_base.html`), styles it in `style.css` and behaves via `nav.js`. Items: `label`, `proposed_url` (from research/site-proposal.md), `target_slug` (the live page it opens in this mockup, or null with `status: "no-live-page"`), `also_merges` (information only). Items with no live page appear in the dropdown muted, not clickable (`aria-disabled`) and tagged "no page yet": deliberate gap markers for review.

Squarespace 7.1 constraints followed: top-level items are dropdown folders, one level deep, no mega menu or nested dropdowns; a folder label is not a page link, so Real Estate and Estate Planning list their hub as the first item "Overview" (The Firm and Articles already serve that role for About and Resources); one header button (Schedule a Consultation) on the right, logo left, no phone number or extra text; under 900px a menu button opens a full-width panel with the folders as accordions; header is not sticky and does not overlay content. Dropdowns open on hover, click and keyboard (button with `aria-expanded`, Arrow Down moves into the list, Escape closes).

## Site footer

`content/footer.json` (design-free, loaded by `tools/build.py`, passed to every template as `footer`; also on kit.html and pages.html) is rendered by each concept's `templates/_footer.html`, included from `_base.html` on every page. Slots:

| Slot | Source |
|---|---|
| `columns[title, items[label, href]]` | built from `content/nav.json`: one per top-level folder; items with no live page left out (same rule as the header); a folder's hub reads "<Folder> overview" |
| `contact` (address, phone, fax, email, directions) | the shared contact block (`closing`); `directions` is a Google Maps search URL for the address (the crawl has only an embed, no link) |
| `social[id, label, url]` | live Facebook (header and footer) and Danielle Vaughn's LinkedIn (our-team page); nothing else exists on the live site |
| `extras` | Free workshop (`person-workshops`), Order title (`order-title`) |
| `legal.links`, `copyright` | Disclaimer, Privacy Policy (both built pages); "© 2026 Vaughn Law, PLLC" |
| `licensed` | "Licensed throughout Florida" (home.json `verified`) |
| `badges.logos[src, alt, href]` | the home trust-strip badges (Florida Bar Board Certified links to the Florida Bar page the live site links) |
| `newsletter`, `client_portal` | null: not on the live site |

Not in the crawl (ask the client): office hours, terms of use, accessibility statement, sitemap page, an attorney-advertising or footer disclaimer line (the live footer is only "Copyright 2026 Vaughn Law | TitleTap credit | Privacy Policy"), Instagram, X, YouTube channel, Google Business or reviews, Avvo, Super Lawyers profile, Florida Bar member profile.

Concept 04: charcoal footer, full contact column; on pages that carry their own contact band (home) the column drops address, phone, email and the CTA. Concept 05: pale footer under the navy closing band; address, phone and email are not repeated (the band shows them), only Get directions.

Squarespace 7.1: footer section with Text blocks (link columns, address, copyright), a Social Links block (native icons, open in new tab), Image blocks (logo, badges), a Button (consultation CTA). Custom CSS only for: small teal caps headings with a rule above each column (04), square outlined / round sage social buttons, rounded white badge tiles, the pill links (05). Footer links to Kit and Pages are mockup-only.


## Excluded pages (content/excluded-stock-posts.json)

`tools/modulize.py` and `tools/build.py` read `content/excluded-stock-posts.json`: `stock_posts` (100 vendor Wistia stock posts), `video_posts` (the 12 YouTube video posts, replaced by the Videos page), `listings` (tag/video, the old video library, and 16 category/tag/author archives left empty). Each entry has slug, url, title and a suggested `redirect`. No structured output, no mockup page, teasers pointing at them are pruned from post-feeds (a post-feed left empty is removed). Nothing is deleted from content/pages or site/raw. `build.py` also maps links to `/resources/video-library/` and `/tag/video/` to the Videos page and strips the `/vaughnlaw/` staging prefix. Kept short listing: `/category/estate-planning-probate/` (1 article).

## Videos and the consultation flow

`content/videos.json` (channel Vaughn Law, 22 videos) feeds `content/proposed/videos.json` (title-banner, `video` variant `poster` featuring ekRcoj3fKWs, `video-grid`) and the home Watch row. `content/proposed/consultation.json`, `consultation__<situation>.json` (7) and `consultation__thanks.json` are the three steps; every Schedule a Consultation button (header via nav.json, footer via footer.json, home, crawled CTA links whose text mentions a consultation) opens `/consultation/`. `{"phone_from": "closing"}` and `{"lines_from": "closing", "only": ["Phone Number"]}` resolve the shared phone number. `tools/linkcheck.py` checks every link in both concepts.


## Round 4 additions

- **No live-site links.** `tools/build.py` post-processes every rendered page (including kit.html, pages.html and live/ copies): an `<a>` to dvaughnlaw.com becomes a relative link to the mockup page, or to the redirect target of an excluded page (`content/excluded-stock-posts.json`), or (pdf/images/office files) stays on the live site and is listed under `file_downloads` in `content/unresolved-links.json`, or (page never crawled) loses its link and renders as `<span data-unlinked="true">` and is listed under `unresolved`. "Older/Newer Entries" pagination links are removed. `tools/linkcheck.py` fails on any remaining live page link. Images still hotlink the live site.
- **Closing band, concept 04.** `contact-band` gains variant `closing`; `templates/_closing.html` renders it on every page except those with their own band (home, `own_closing`), the consultation flow and the contact page. Tone `band` (deeper teal tint, thick teal rule, charcoal text) so it never merges with the charcoal footer; home's band uses the same tone. With a band above, the 04 footer contact column drops address, phone and email. The footer's Free workshop and Order title links moved into the Resources column; Follow us is social only.
- **card-grid** gains `anchor` (section id for jump links) and per-card `planned: true` (a menu page that does not exist yet: no link, no arrow, dashed outline, "Page planned" tag).
- **Hub pages** (`content/proposed/{real-estate-law,estate-planning,title-services,investors}.json`, template `hub`) reuse existing modules with variants that only name roles: `card-grid:services`, `headed-section:copy`, `people:hub`, `link-list:tools`, plus situation-picker, post-feed:cards, video-feed, event-band, cta-band. For `hub` pages `assign_tones` also keeps a plain module off the ground of the module above and below it.
