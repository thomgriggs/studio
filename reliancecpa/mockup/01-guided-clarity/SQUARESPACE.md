# 01 Guided clarity: Squarespace 7.1 build notes

Target: Squarespace 7.1 (Business plan or higher), per PROJECT_PLAN section 8. Fonts: the mockup uses system stacks (Georgia headings at weight 500, Arial body) as the deployed concept does. Georgia and Arial may not be offered in the Site Styles font picker (to be confirmed in the trial site); if not, use the nearest native serif for headings (for example Libre Caslon Text) over a Helvetica-like body, and say so to the client, since Georgia is part of this concept's recognisability. Site Styles colours: background #ffffff, text and dark buttons ink #173e37, accent coral #ef765f; the other brand colours (lime #c9e56d, sky #b9dfe5, mint #d7e8de, cream #f7f6f2, sand #e9eee9, footer #102e29) are set as section colour themes. Mockup-only items (kit.html, pages.html, the "Mockup pages" line in the footer) are not built. Everything below is native unless a row says otherwise.

## Module to native block

| Module | Squarespace 7.1 | Custom CSS / code / stand-in |
|---|---|---|
| hero (home) | Cream Section, two columns: Heading 1 + Text + Button + text link, and an Image block | The layered chart card (bar chart, two floating mini cards) is decorative, not content. Native build: export it once from the mockup as a PNG/SVG and place it in the Image block. Live-markup build: one Code block. This mockup renders it as HTML/CSS. The 104px tracking-tight Georgia headline is a Site Styles heading size plus letter-spacing |
| hero (tier) | Two-column Section on the tier tint: Text + Heading 1 + Button beside an Image block | The "service chart" card (three overlapping pastel rings carrying the tier's first services, lime result bar) is decorative: exported picture, or Code block. Rings carry text; as a picture the service names must also exist as links elsewhere (they do: the section nav and the cards below) |
| title-banner | Cream Section: Text (eyebrow) + Heading 1 + Image block on the right | Right-hand cards (service path, topic card, team card, rings) are pictures or one Code block each; the service-path card is better as a Text block of five links with a lime Button for the current page. Contact: plain Image block with a caption |
| intro, rich-text | Text block (Paragraph 1 for intro) | none |
| headed-section | Two-column Section: Heading 2 + Text (stacked in articles) | Hairline between sections: Line block or section divider |
| card-grid tiers (home audience band) | Section with a background video (or image) and a dark overlay; Heading + Text; three Buttons as anchor links; three further Sections each two columns (Heading 3 + Text + Button, and a numbered list as Text) | Frosted tab group and frosted panels (backdrop blur) are custom CSS; native fallback is a solid cream panel and plain Buttons, and the video becomes the section background video. Tabs are not native: the mockup shows all three panels stacked, which is also what is built. Video must be uploaded or on a supported host; the mockup uses the original concept's looping mp4 |
| card-grid service-cards | Summary block (grid, card style) over the tier's service pages, or four Text blocks on a sand background | Coloured icon tile (lime/sky/pink/mint, territory soft tint on tier pages): upload a small square image or emoji-like glyph per card; thin territory rule on the card top: CSS block |
| card-grid industries (journey rows) | Text blocks or a Summary block (list) with Line blocks between rows | Index numbers and the right arrow: typed characters. Column alignment of the row is approximate natively |
| card-grid resources | Summary block or three Text blocks + Buttons | none |
| accordion | Accordion block | Round plus icon and coral open state are custom CSS; native icon is the fallback |
| list | Text block with a bulleted list | Hairline-ruled rows and coloured dots: CSS (native default bullets are the fallback) |
| image-text, image, gallery, video, video-split | Image, Gallery, Video blocks; two-column Section on mint for video-split | The white "Watch" pill over the thumbnail is custom CSS; native Video block thumbnail and play button are the fallback. Image corner radius 22px is an Image block setting |
| post-feed (cards) | Summary block (grid, titles + excerpts) over the Resources collection on a pale green Section | "Read the article" link per card is a Summary option |
| cta-band | Section with a coral background colour: Heading, Text, two Buttons (second in outline style) | none (ink text on coral is the section's colour theme; coral buttons use ink text for contrast) |
| profile / people | Two-column Section (Image + Heading 3 + Text) per person, image side flipped on alternate people; Image blocks with captions in a 6-column Section | Placeholders = empty Image blocks until portraits exist (Valerie Stickeler has none) |
| link-list | Text block of links or Summary block | Ruled rows: CSS |
| table | no native table | Markdown block or a small Code block |
| steps, reasons (numbered flow on ink) | Section with the dark (ink) theme: Heading + Text + Button left, numbered Text blocks (Heading 4 + small text) with Line blocks between rows on the right | Outlined number circle, lime highlighted last row and arrows are CSS/typed characters; a block background on the last row gives the lime |
| stat-row (metric pills) | Row of Text blocks, each with its own coloured block background or a coloured Section | Rounded pill corners: CSS; native blocks are square-ish |
| trust-strip / dateline dots | Text block with a line of items separated by a dot character | Coloured dots: typed or CSS |
| callout, quote-tile | Quote block (centred, heading font) or Heading 2 Text | Big clamp sizing: Site Styles heading size |
| contact-band | Section on cream: Heading, Text, Button; contact lines as Text blocks inside a mint-coloured block | none |
| choice-cards (Get Started step 1) | Text + Heading + one large Button per choice (+ short Text under each) or a Summary block over the step-2 pages | Territory left bar and tier label colour: CSS block |
| form (step 2 and Contact) | Native Form block per page with the listed fields and a post-submit redirect to /get-started/thanks/ | Form block is single-column: the First/Last name pair stacks; field style follows Site Styles (8px radius, white fill, 1px border are Site Styles settings or approximate). No multi-step or conditional fields: each choice is its own page |
| trust-strip logos, door-pair, situation-picker, event-band, video-feed, video-grid, review-line, form-placeholder, logo-row | defined for kit parity; Text/Image/Summary/Video blocks | not used by Reliance content |

## Header, footer, closing band

- **Announcement bar** (34px ink, tagline left, Client login lime link right): native Announcement Bar (one line of text and a link; the tagline and the link share one bar, the lime link colour is CSS).
- **Header**: logo left, Get Started as the header Button (coral, ink text: a Site Styles button colour), sticky is a native setting (the original header is sticky). Client Login is in the announcement bar, not the header.
- **Services mega flyout**: needs a mega-menu plugin (Will Myers, Launch Hub Studio or SQSP Themes). The plugin renders a normal page as the dropdown: three Section columns, each Heading 3 (link to the tier), one-line Text, a Text block of links, a "See all" link; the Consulting column adds "Industry examples". The rounded white panel with drop shadow is a plugin setting or CSS.
- **Mobile**: the original had no mobile menu at all (nav hidden under 1000px, no button). This mockup adds a Menu button and a full-width accordion panel. On Squarespace this is the native mobile overlay menu fed by the folder fallback in nav.json `menu` (the three tiers as top-level folders, Overview first); the mockup's panel look is approximate.
- **Active tier underline** in the header and territory top rules: CSS block keyed to the page URL or body class.
- **Footer**: dark footer section: white plate logo (Image block on a white block background), link columns as Text blocks (headings lime), address Text, Get Started Button. The tier columns' territory top rule is CSS. Copyright row is a small Text block.
- **Closing band**: a coral Section saved as a pattern and added to each page, with Get Started pointing at the page's own tier step-2 page (set per page).

## Territory colours (one custom CSS block)

Three classes in Design > Custom CSS, `.terr-teal` (Tax Preparation, accent #2f8c93, ink #1c6269, tint #e3f0f1), `.terr-sage` (Business Accounting, #6fa18f, #3d6f5c, #e4efe8) and `.terr-gold` (Business & Tax Consulting, #d79a22, #865a00, #f6eed7), each setting `--terr` (thin rules, active nav, left bars), `--terr-ink` (eyebrows, tags), `--terr-tint` (hero, service-card band, feed band) and `--terr-soft` (icon tiles). Applied per page via page-level code injection or a URL-keyed selector. Coral stays the call to action; ink stays the brand.

## Where the mockup differs from a pure native build

- Chart-card and service-chart cards, the path/topic/team cards: HTML/CSS in the mockup; pictures or Code blocks on Squarespace.
- Frosted blur (tab group, audience panels): CSS `backdrop-filter`; native fallback solid panels. In the mockup the panels are 97 percent opaque so the difference is small.
- Background video: the audience band carries who-we-serve.mp4 (7.5 MB, from the original concept); compress before use.
- Tabs: the original's JS tabs are replaced by three stacked panels with jump links (no script).
- Icon tiles use plain Unicode glyphs; the original did too. Squarespace: uploaded icons.
- The sticky header with a hover mega panel is plugin-dependent.
