# 02 Broadsheet: Squarespace 7.1 build notes

Target: Squarespace 7.1 (Business plan or higher), per PROJECT_PLAN section 8. Source Serif 4 is in the Google Fonts picker (Site Styles, set heading and body to it; heading weight 600, body 400). Set the site background to #f3f2f2, text #201e1d, accent #0088b0 in Site Styles. Everything below is "native" unless a row says otherwise. Mockup-only items (kit.html, pages.html, "Mockup pages" in the footer, the `live/` comparison copy) do not exist on the site.

## Module to native block

| Module | Squarespace 7.1 | Custom CSS / code / stand-in |
|---|---|---|
| hero (home) | Section with background video, Heading 1, Text, two Buttons | Gradient scrim is not available (section overlay is flat); no autoplay keep-alive script; video must be a hosted/uploaded file or a Vimeo/YouTube URL; poster image set as the section's fallback image. Caveat: the mockup uses the original concept's looping mp4 (provenance unknown) |
| hero (tier) | Two-column Section: Text + Heading + Buttons beside an Image block | Eyebrow territory colour and the short rule: CSS block |
| title-banner | Section, Text (eyebrow) + Heading 1 | Territory eyebrow colour: CSS block |
| intro, rich-text | Text block (Paragraph 1 for intro) | none |
| headed-section | Two-column Section: Heading 2 + Text (stacked in articles) | none |
| card-grid tiers (home rows) | Three Sections, Image beside Heading 3 + Text + a row of small Buttons/links as chips; alternate image side | Chip look (tinted pill) is custom CSS, else plain outlined Buttons |
| card-grid service-cards | Summary block (grid) over the tier's service pages, or Text blocks in 3 columns | Top rule in territory colour: CSS block |
| card-grid industries | Section with grey background, six Text blocks in 3 columns | Duotone icons: upload SVG/PNG per icon (Phosphor is not available); icon colour is fixed per territory |
| card-grid resources | Summary block or three Text blocks + Buttons | none |
| accordion | Accordion block | Plus sign colour only |
| list | Text block with a bulleted list | Square territory bullets: CSS (native round bullets are the fallback) |
| image-text, image, gallery, video, video-split | Image, Gallery, Video blocks; two-column Section | YouTube poster-with-play is the native Video block thumbnail |
| post-feed (cards) | Summary block (grid, titles + excerpts) over the Resources collection | "Read" link per card is a Summary option |
| cta-band (photo card) | Section with background image + overlay, Heading 3, Text, Buttons | 4px radius and inset margins: section setting is edge-to-edge only, so rounding/inset needs CSS; gradient scrim is flat |
| profile / people | Two-column Section (Image + Heading 3 + Text) per person; Image blocks with captions in a 6-column Section | Placeholders = empty Image blocks until portraits exist |
| link-list | Text block of links or Summary block | none |
| table | no native table | Markdown block or a small Code block |
| steps, reasons, stat-row | Row of Text blocks (numeral as Heading 3) | Territory-coloured numerals: CSS block |
| stat rail with thick-thin double rule | two Line blocks | A true thick-thin pair needs CSS; Line blocks give one rule at a time |
| callout, quote-tile | Quote block or Heading 3 Text (italic) | none |
| contact-band | Section with grey background, Text blocks, Button | none |
| choice-cards (Get Started step 1) | Text + Heading + one large Button per choice (+ short Text under each) | Territory left rule and tier label colour: CSS block |
| form (step 2 and Contact) | Native Form block per page with the listed fields, post-submit redirect to /get-started/thanks/ | Form block is single-column: the First/Last name pair stacks, field fill and radio styling follow Site Styles (approximate). No multi-step or conditional fields: each choice is its own page |
| trust-strip, door-pair, situation-picker, event-band, video-feed, video-grid, review-line, form-placeholder, logo-row | defined for kit parity; Text/Image/Summary/Video blocks | not used by Reliance content |

## Header, footer, closing band

- **Header**: logo left, Get Started as the header Button, Client Login as a text link beside it (second header element / or a Button in the secondary style). Not sticky (native default).
- **Services mega flyout**: needs a mega-menu plugin (Will Myers, Launch Hub Studio or SQSP Themes, about 25 to 60 dollars). The plugin renders a normal Squarespace page as the dropdown: three Section columns, each Heading 3 (link to the tier), a one-line Text, a Text block of links, and a "See all" link; the Consulting column adds an "Industry examples" Text + links. This is the layout in the mockup. Resources and About are native folders.
- **Mobile**: the plugin needs a folder fallback: nav.json `menu` already lists the three tiers as top-level folders (each with Overview first, as a folder label cannot be a link). Mobile menu is Squarespace's native overlay menu, not the mockup's panel.
- **Active tier underline** in the header: CSS block keyed to the page URL.
- **Footer**: footer sections with Text blocks of links, address/phone Text, optional Social Links block; tier columns' top rule is CSS.
- **Closing band**: a Section saved as a pattern and added to each page (or one "closing" block via page footer), with Get Started pointing at the page's own tier step-2 page (set per page, so a service page's Button differs by tier).

## Territory colours (the small custom CSS block)

One CSS block in Design > Custom CSS: three classes, `.terr-teal`, `.terr-sage`, `.terr-gold`, each setting `--terr` (thin rules), `--terr-ink` (eyebrow and small text) and `--terr-tint` (section tint); applied per page through a page-level code injection or a URL-keyed selector (`body[id*="tax-preparation"]` etc.). Used only for: eyebrow colour and its short rule, section top rules, tag chips, active header underline, the section nav, card top rules, the closing card's top rule, tinted bands. Buttons, links and the header stay brand blue. Without the CSS block the site is simply the brand look, which is the intended fallback.

## Things Squarespace cannot do (stand-ins)

1. Gradient scrim over video, and video keep-alive script: flat overlay, accept the browser's own autoplay rules.
2. Phosphor duotone icons: uploaded images.
3. Native tables: Markdown/code.
4. Multi-step forms: one form per branch page (already designed that way).
5. The thick-thin double rule: CSS.
6. True `:has()` hiding of the trust strip: not needed (the Squarespace home simply omits that block).
7. Breadcrumbs and section nav: Text blocks with links (manual) or a small code block; no native breadcrumbs.
8. Related-articles by tag: a Summary block filtered by tag/category on each article.
