# Reliance Consulting: concept audit (01 "Guided clarity" and 02 "Broadsheet")

Sources: concept 01 = `concept-01-source/` (captured from the deployed worker; CSS `_next/static/css/index.D-V8C-Bs.css`); concept 02 = `concept-02/*.dc.html` + `_ds/broadsheet-*/`. Screenshots (desktop 1440, mobile 500) are in the session scratchpad `reliance-c01/` (c01-*/c02-*).

---
## Concept 01: Guided clarity

### Overview
Modern, warm-neutral SaaS-flavoured fintech look. Big Georgia display headlines with tight tracking, Arial body, rounded cards (16 to 24px), pastel accent chips (lime, sky, coral, mint), full-bleed alternating section backgrounds, one dark-green video section, one coral CTA band. Illustrative "data" visuals (bar chart card, rings, process flow) stand in for photography on most hero areas. 6 pages: Home, Services, Industries (labelled "Who we serve"), Insights, About, Contact. Header: no dropdowns or mega menu.

### Fonts (system stacks, nothing loaded)
- Headings: Georgia, serif, **weight 500**. Body/UI: Arial, Helvetica, sans-serif.
- h1 home hero: clamp(60px, 7vw, 104px) / line-height .9 / letter-spacing -.055em (58px on <=650px). Inner-page hero h1 (`.page-hero`): clamp(54px, 6vw, 88px) / .98 / -.05em.
- h2: clamp(40px, 5vw, 68px) / 1.03 / -.04em (sections, flow, CTA); detail pages h2: clamp(34px, 4vw, 52px) / 1.05 / -.035em.
- h3: 25 to 30px / 1.1 Georgia 500 (service cards 25px, values 30px, insight cards 27px/1.2, audience panel h3 42px/1.1).
- Quote: clamp(45px, 6vw, 78px) / 1.05 / -.04em centered. Trust statement: clamp(18px, 2vw, 24px) Georgia.
- Body: 16 to 17px / 1.6 to 1.7; lead 19px / 1.55 (max 630px). Buttons 14px bold. Small UI 11 to 13px.
- Eyebrow: 11px, weight 800, uppercase, letter-spacing .16em, colour #4b756b (lime on dark, ink on coral).

### Colour tokens
ink #173e37 (text, dark button, dark sections), ink2 #294c45, footer-dark #102e29, coral #ef765f (CTA band, nav button), lime #c9e56d (accent on dark, 'Act' row), sky #b9dfe5, mint #d7e8de, pink chip #f6b3a6, cream #f7f6f2 (hero, journey, manifesto), sand #e9eee9 (services bg), insights bg #edf1e8, white #fff, line rgba(23,62,55,.15) (#173e3726), muted text #4e625d / #546762 / #60736e / #6b7f79, mid-green #6fa18f (chart bars), hover button #255c51, link hover #337c6e. Shadows: 0 24px 70px rgba(51,62,50,.12).

### Spacing, grid
- Container: full-bleed sections with horizontal padding `max(24px, 50vw - 620px)` (content max 1240px, centred); no wrapper div.
- Section vertical padding 110px (75px mobile). Hero 90px/min-height 680px, page-hero min-height 530px / 80px pad.
- Grid gaps: hero 80px, flow 90px, audience panel 70px, cards 14 to 16px, split stories 80px.
- Radii: buttons 8px, cards 16px, panels 20px, images/charts 22 to 24px, tab group 13px.
- Breakpoints: 1000px (nav links hidden, grids collapse, 4-col cards become 2), 650px (single column, 1-col forms, utility nav smaller).

### Header and nav
- Utility bar (34px, ink bg, 12px): "Serving Tampa Bay since 1984" left; "Client login ↗" (lime) right.
- Main nav: 86px, white, 1px line bottom, **sticky top:0**, z-index 20. Logo (real PNG, 260px wide; 205px mobile) left; nav links 14px, gap 28px, margin-left:auto: Services, Who we serve, Our firm, Insights; then coral "Schedule a consultation" button (small).
- Behaviour: flat links only, no dropdown/mega menu. At <=1000px the nav links disappear with **no hamburger**; at <=650px the coral button is also hidden (so mobile has logo only). No scroll effects except smooth-scroll and button hover lift.

### Buttons
- `.button`: ink bg, white text, 14px/700, padding 15x22, radius 8, hover bg #255c51 + translateY(-2px). Variants: `.small` (coral bg, 12x17), `.dark` (lime bg, ink text, on dark), `.coral` (ink on coral CTA), `.outline` (1px ink border, transparent). `.text-link`: bold with 20px arrow glyph, gap 10.

### Module catalogue
Home (`/`)
1. Utility bar (text left, link right).
2. Sticky nav bar (logo, 4 links, CTA button).
3. Hero split, cream: eyebrow, h1, lead, primary button + text link | right: decorative bar-chart card ("Practice performance", "A clearer view", 6 bars ink/green/coral, axis labels) with two floating mini-cards (tax strategy "Year-round", cash-flow sparkline).
4. Audience / "Who we serve" tabbed section: dark green with looping background video (opacity .45) and gradient shade; eyebrow, h2, intro; frosted tab group (3 tabs: Dental, Veterinary, Businesses & owners) which swaps a frosted cream panel (eyebrow, h3, paragraph, text link | numbered 3-step list). Only JS interaction on the site.
5. Services card grid on sand: eyebrow, h2, intro; 4 white cards (coloured icon tile, h3, text, "Learn more" link pinned bottom).
6. "Approach" flow section, ink bg: eyebrow, h2, text, lime button | stacked 4 rows (number circle, title, sub, arrow); last row lime-highlighted.
7. Journey table on cream: eyebrow, h2; 4 ruled rows (index, stage name, descriptor, arrow).
8. Image + copy band, mint: rounded photo with floating "play" pill (video caption), eyebrow, h2, text, link.
9. Big pull quote, white, centred, + attribution paragraph.
10. Insights / question cards (3 white cards with category label, question h3, "Explore the question" link) on pale green.
11. CTA band, coral: eyebrow, h2, text | 2 stacked buttons (call, message).
12. Footer, dark: white-plate logo, tagline, 3 link columns (lime heading), legal row (copyright, address, "Concept 01").
13. Trust strip / trust statement (defined in CSS; strip of 4 dot-marked facts, or label + Georgia sentence) used on some pages.

Services: page-hero (eyebrow, h1, lead | "service-hero-chart" card with three overlapping circles joined by arrows + lime result bar); detail-list (4 ruled rows: icon, h2, text, small tag line, link); flow section reuse; CTA; footer.
Industries: page-hero with "audience-directory" card (3 rows with icon tile, name, sub, index); three `industry-story` split sections (text + bullet list | rounded photo; alternate background and left/right order via `.reverse`); metric-panel (2x2 coloured pills); CTA; footer.
Insights: page-hero + "insight-chart" card with "insight-path" (3 numbered steps, active one lime); `insight-library` 3-col grid of question cards (6 articles; links inert); CTA.
About: page-hero + "firm-hero-chart" card (stacked left-bordered facts); manifesto (huge quote | text); values (3 sand cards); CTA.
Contact: page-hero with "contact-image" (Tampa photo); contact-layout (2-col form: 8 fields incl. select + textarea, labelled 13px/700, inputs 14px padding radius 8 | aside with office-card on mint); footer (no CTA).

---
## Concept 02: Broadsheet

### Overview
Editorial "newsprint" look built on the Broadsheet design system. Everything is Source Serif 4 (headings and body and UI), paper-grey ground, cyan accent with magenta as rare second spot colour, almost square corners (1 to 4px), flush-left asymmetric 7/5 splits, **no boxes or dividers between sections** (whitespace only, except thick-thin double rule above a dateline stat rail). Photo-led. 4 pages: Home, Services, About, Contact. Nav links: Services, Industries, About, Contact (Industries has no page yet, links are to anchors/placeholder).

### Fonts
- Google Fonts: Source Serif 4 (0,400; 0,600; italic 400) via @import in styles.css. Heading weight 600 (`--font-heading-weight`); body 400.
- Home h1: clamp(42px, 6vw, 76px) / 1.08 / -.02em, colour #f8f4f4 over video. Inner h1: clamp(34px, 5vw, 52px) (about/contact 50px).
- h2: 32px (home sections; max 32ch) / 28px (service blocks, max 40ch), letter-spacing -.015em. h3: 28px (service split titles) / 24px / 26px (about). Pull quote: clamp(22px, 2.4vw, 30px) italic.
- Body 15.5 to 17px; intro 16 to 17px; form 15px; nav/footer links 14px; eyebrow/labels 13px (uppercase small caps style, neutral-600), tags 11px; buttons 14px/600.

### Colour tokens (`--color-*`)
bg #f3f2f2, surface #eae9e9, text #201e1d, accent #0088b0, accent-2 #d6006c, divider rgba(32,30,29,.16). Ramps 100 to 900 (generated in OKLCH): neutral 100 #f8f4f4, 200 #eae7e7, 300 #d7d3d3, 400 #bab6b6, 500 #9b9797, 600 #7d7979, 700 #605d5d, 800 #444141, 900 #2d2b2b; accent 100 #e9f8ff, 200 #cbeeff, 300 #99e0ff, 400 #62c5ee, 500 #38a6cf, 600 #1186ac, 700 #006786 (link text), 800 #004961, 900 #0a303e; accent-2 100 #fff1f4, 800 #790e3d. Overlay scrims on dark hero/CTA: rgba(20,19,18,.42 to .88); text on dark rgba(248,244,244,.55 to .86). Spacing tokens (1.25x density): `--space-1..8` = 5,10,15,20,30(6),40(8)px; radii `--radius-sm/md/lg` = 1/2/4px; shadows `--shadow-sm/md/lg` (per readme).

### `_ds/broadsheet-*` token system
Folder contents: `styles.css` (the only stylesheet: `:root` tokens, ramps, base type, component layer), `readme.md` (rules: take every colour/font/space/radius from variables, serif everywhere, whitespace not dividers, cyan = interactive, magenta rarer, don't use both accents in one small component, Phosphor duotone icons, themed hover/pressed states from accent ramp, `:focus-visible` 2px accent ring, disabled 45% opacity), `_ds_bundle.js` (compiled component bundle incl. inlined `print-plates.js` SVG filters #sep-c/m/y/k for `.cmyk` image treatment), `_ds_manifest.json` (card index: buttons, cards, dialog, forms, navigation, table, colour, icons, image...), `_adherence.oxlintrc.json` (lint rules against hard-coded hex/px). Components in styles.css: `.btn` (+ primary/secondary/ghost/icon/block), `.tag` (+ accent/accent-2/neutral/outline), `.field`/`.input`/`.radio`/`.seg`, `.card` (+ kicker/title/body/meta, elevations), `.nav`/`.nav-brand`, `.table`, `.dialog*`, `.hr`, `.cmyk`, `.cmyk-num`, `.halftone`. The pages themselves mostly use inline styles that reference the tokens.

### Spacing, grid
- Horizontal page padding `clamp(20px, 5vw, 72px)` on every section (no max-width cap: content stretches at wide screens; at 1440 it measures roughly 1296px).
- Vertical rhythm: sections 48 to 72px padding (home split rows 56px; hero 132px top / 96px bottom); band sections with 100%-width neutral-100 background; CTA card inset with margin 0 gutter and 64px/48px padding, radius 4px.
- Splits: `grid-template-columns: minmax(0,7fr) minmax(0,5fr)` (reversed 5/7), gap 28px / clamp(24px, 5vw, 96px). Three-column (`rc-cols3`), index (`rc-index`, 4 col), team grid, footer 4-col grid.
- Breakpoint 900px collapses grids (index to 2 col, others to 1, footer 2); 760px intends to hide nav links.

### Header and nav
- `.nav` flex, gap 28px, padding 20px + gutter, **not sticky**. Brand logo PNG left; links (Services, Industries, About, Contact) 14px gap 24px; then margin-right:auto; "Client Login" (plain link) and primary button "Schedule a Consultation". No dropdowns, no mega menu.
- Known bug: `.rc-navlinks` has inline `display:flex`, which beats the 760px media rule, so on mobile the links stay and the CTA is clipped off the right (visible in c02-home-mobile.png). No hamburger.

### Buttons and tags
- `.btn`: Source Serif 600, 14px, padding 10x18, radius 2px. Primary: accent #0088b0 fill, bg-coloured text. Secondary: 1px divider border. Ghost: accent text, 5px inline padding. Over video/CTA, an outlined white variant. Text links accent-700 with arrow glyph "→", underline on hover. `.tag`: 11px, padding 3x10, radius 2, tinted accent-100/accent-2-100/neutral-100.

### Module catalogue
Home
1. Nav bar (brand, links, Client Login, primary CTA).
2. Video hero: full-bleed autoplay muted looping `home-background-video` (poster hero-building.jpg) with dark scrim, 132px padding; h1 two lines, lead paragraph, primary + outlined buttons. Inset within gutter (not edge-to-edge at top).
3. Dateline stat rail: thick-thin double rule top, small-caps row ("Tampa Bay, FL / Founded 1984 / phone / Free consultations"), 4 stats (800+ businesses, 1,000+ individuals, 42 years, 2 founding CPAs), rule bottom.
4. Intro band (neutral-100 full width): eyebrow, h2, 4 tags | right: bar chart of growth by decade (accent ramp bars, caption).
5. Service split rows x3 (`#tax`, `#bookkeeping`, `#consulting`): eyebrow, h2, paragraph, tag list, "Learn more" link | `image-slot` photo (rect, 7/5 alternating).
6. Industry index band (neutral-100): eyebrow, h2, intro, 3-col grid of 6 icon items (Phosphor icon, name, one-line), "See all industries" link.
7. Team teaser: label, compact card (photo, partner role label in small caps accent, name), "Meet the full team" link.
8. Italic pull quote with attribution.
9. Photo CTA card: Tampa skyline image-slot with scrim, h2, text, primary + outline buttons.
10. Footer: 4 columns (Services, Industries, Company, Contact w/ address and phone), rule, copyright.
Services: intro header (eyebrow, h1, lead); 4 anchored service blocks (`#tax`, `#bookkeeping`, `#consulting`, `#industries`): h2, intro, list of items each with a tag (category), item title, description; "Not sure where to start?" closing CTA; footer.
About: split intro (eyebrow "Since 1984", h1, paragraph | team-meeting photo); narrative paragraph; leadership card (photo, role, name, bio; also team portrait PNGs exist in assets: Kim Nguyen, Amol Nirgudkar, Govindaraju Rudrapatna); pull quote; Tampa CTA card; footer.
Contact: header (eyebrow, h1, lead); 7/5 grid: form (name, email, phone, select, message textarea, submit) | office details (address, phone, areas served, client portal link); footer.

### `.dc.html` format and runtime
- A `.dc.html` is an HTML file containing an `<x-dc>` element: the page template (HTML with `<helmet>` for head additions: stylesheet links, scripts, page CSS) plus an optional `<script data-dc-script data-props='{...}'>` holding component logic/props. `support.js` (generated "dc-runtime", ~69 KB, built from `dc-runtime/src/*.ts`) parses the `<x-dc>` element (`parseDcDocument`/`parseDcText`), builds React elements from the template (requires `window.React`/`ReactDOM`, which come from the `_ds_bundle.js`), registers DS and child components (including `x-import`), mounts into the page, and supports hot-swap/streaming, error boundaries per component and print/export baselines. Authors edit templates in the host editor, which maps rendered nodes back to source via `data-dc-tpl`.
- Pages are assembled by: linking `_ds/.../styles.css` + `deployment-fix.css`, loading `support.js`, then `<x-dc>` content with inline token-based styles. `index.html` in concept-02 is a byte copy of Home.dc.html. There is no server component; the site is client-rendered, so it needs JS to show anything (bad for SEO as-is).
- `image-slot.js` (65 KB): defines the `<image-slot>` custom element (attrs id, shape rect/rounded/circle/pill, radius, src, credit, credit-href). Shows an image placeholder that the user can fill by drag-and-drop or click; in the Omelette editor runtime the dropped image persists to an `.image-slots.state.json` sidecar; outside the editor it is a read-only `<img>` with a credit.
- `video-playback.js`: keeps the home background video playing: forces muted/defaultMuted, calls play() on canplay/pause/pageshow/focus/visibilitychange, and a MutationObserver re-checks. `deployment-fix.css` (2.5 KB) is a small deploy-time patch stylesheet. Third-party: Google Fonts (Source Serif 4), `cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2` (icons). Assets: hero-building.jpg, tax-planning.jpg, bookkeeping.jpg, consulting-office.jpg, team-meeting.jpg, tampa.jpg, 3 team PNGs, reliance-logo.png, home-background.mp4.

---
## Module comparison

| Module type | 01 | 02 |
|---|---|---|
| Utility bar | yes | no |
| Header nav (flat, no dropdown) | yes, sticky | yes, static |
| Video hero | no (video in audience section) | yes (home hero) |
| Photo hero / illustrated hero card | chart/UI cards, no photography | video only |
| Stat rail with numbers | trust strip (text facts) | yes (dateline + 4 stats) |
| Bar/chart graphic | yes | yes (growth chart) |
| Service card grid (4 cards) | yes | no (split rows instead) |
| Alternating image/text split rows | yes (industries, visual story) | yes (core pattern) |
| Tabbed content | yes (audience tabs) | no |
| Process/flow steps list | yes | no |
| Journey/ruled table rows | yes | no |
| Industry icon index (3-col) | no (directory card) | yes |
| Tag/chip lists | no | yes |
| Service item lists with tags | no | yes |
| Pull quote | yes (large) | yes (italic, small) |
| Question/insight card grid | yes (3 and 6) | no |
| Team/leader teaser | no (about has none) | yes (1 partner card) |
| Values cards | yes | no |
| Metric pills | yes | no |
| CTA band | yes (full-bleed coral) | yes (photo card) |
| Contact form + office card | yes | yes |
| Footer | yes (3 col) | yes (4 col) |

Both: nav, split row, CTA, pull quote, contact form, footer, chart graphic. 01 only: utility bar, tabs, flow, journey table, service card grid, insight/question cards, values, metric panel, directory/hero chart cards. 02 only: video hero, stat rail, tag lists, industry icon index, team teaser, item-list service blocks.

### Standard modules each concept lacks (needed for a full site)
| Needed module | 01 | 02 |
|---|---|---|
| Tier / service landing page (parent page that routes to services) | partial (services page is a detail list) | partial (services page is one long page) |
| Service detail page (own URL, scope, process, FAQ, CTA) | missing | missing (anchors only) |
| Industry detail pages (dental, vet, physician...) | partial (3 stories on one page) | missing (no Industries page) |
| Article / insight post template (title, byline, body, related) | missing (cards are inert) | missing |
| Insights/resources hub (filters, featured, list) | partial (6 question cards) | missing |
| Team directory + bio page | missing | partial (1 teaser, 3 portraits unused) |
| Intake / contact pages (multiple intents: consultation, new client, portal help, careers) | one generic form | one generic form |
| FAQ/accordion | missing | missing |
| Testimonials / proof | missing | missing |
| Mobile navigation (hamburger / drawer) | missing | missing (and nav overflow bug) |
| Footer | has (no newsletter, no legal/policy links, no social) | has (same gaps) |
| Locations/service area | missing | partial (text on Contact) |
| 404, legal/privacy, careers | missing | missing |

---
## Not doable with Squarespace 7.1 native blocks/settings
Concept 01
- Sticky utility bar + sticky header with two stacked layers (7.1 header can be fixed, but a separate top announcement bar is a different element with its own limits).
- Frosted-glass tab group and tab panel swapping (needs Tabs-type custom code; the closest native is an Accordion/Gallery block or separate sections).
- Looping background video **with** a gradient scrim and overlay content (Section background video exists in 7.1 but no gradient shade, opacity .45, or backdrop-blur).
- Decorative chart cards with CSS bars, overlapping rings and floating mini-cards (needs Code blocks or images; native Charts block is data-driven and cannot be positioned/layered).
- `backdrop-filter`, overlapping/absolutely positioned cards, per-letter tight tracking at 104px (Squarespace caps heading size/letter-spacing in Site Styles; clamp() sizing needs CSS).
- Georgia headings are fine (web-safe), but display weight/tracking tweaks per heading need CSS.
- Hover lift on buttons, the numbered flow rows with highlighted final row, ruled "journey" table (needs Code or heavy lists).
- Coloured pastel icon tiles per card (Icon blocks exist but colour tiles/shapes require CSS).
- Custom form layout with 2-col grid (native Form block is single column; fields can be arranged a bit, no select/textarea styling control).
- Full-bleed 1240px-centred-container pattern is native-ish (sections), fine.

Concept 02
- Video hero with scrim and autoplay: 7.1 supports section background video, but not the autoplay-keepalive script or the precise scrim values; text readability needs overlay via section background overlay only (limited).
- `image-slot` (editor-only drag-and-drop component) and the `<x-dc>` runtime: replaced by Image blocks.
- `.cmyk` / `.halftone` misregistered image treatments (SVG filters): not possible natively.
- Dateline double thick-thin rule with small-caps rail (Line block gives one rule at a time; needs CSS).
- Responsive 7/5 asymmetric splits with large fluid gaps (7.1 uses a 12-col fine-grid per section: approximable, but gaps are fixed).
- Phosphor duotone icons (can be uploaded as images/SVG; no icon font).
- Source Serif 4 is available in Squarespace's Google Fonts picker (OK); italic pull quotes are fine.
- Chart (growth by decade): native Charts block can approximate, but not the accent-ramp bar styling.
- Not-sticky header is native; no change needed.
- Both: no native mega menu (not used by either concept, but would be needed if services/industries nav grows; 7.1 offers folders = simple dropdown only), no native tabs, no multi-step forms, no custom scroll effects (7.1 has built-in section "scroll animations" only: fade/slide/scale), no per-page JS state.
