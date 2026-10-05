# II Commandments — naming contract

Static skeleton; nothing talks to a server. Every screen renders from `data.js` + `verses.js`. The point of this shell is the **naming**: every block, field and control is labeled so design and functionality can be layered on without guessing.

## Pages

| Page | `body[data-view]` | Query params |
|---|---|---|
| `index.html` | `home` | `bible=` · `anim=fade\|words\|letters` |
| `church.html` | `church` | `bible=` |
| `designers.html` | `designers` | `designer=<slug>` (profile view) |
| `shop.html` | `shop` | `design=<id>` (skips to customize) |
| `about.html` | `about` | |

`<body data-view data-bible data-gospel>` carries page context.

## Tokens (`tc.css` `:root`, `--group_name`)
`--color_*` (paper, ink, ink-muted, line, card, link, focus, bg-*, text-*) · `--gospel_matthew|mark|luke|john` (+ `-soft`) · `--font_name-primary|display` · `--font_size-xs…hero` · `--line_height-*` · `--space_xs…xl` · `--gutter` · `--measure` · `--radius_*` · `--motion_*`.

## Blocks
```
.skip-link  .topbar  .brand  .primary-navigation  .toast
.panel(.is-dark)  .panel-inner  .panel-nav
  .open  .open-image  .sound  .sound-label  .welcome  .welcome-title  .numeral  .welcome-sub  .narrative  .narrative-line(.is-turn)  .narrative-note
  .hero  .said  .emph  .logo(.is-finale)  .logo-stack  .logo-layer  .logo-mark  .gospels  .gospel-picker(.is-corners)  .gospel-icon  .gospel-proceed  .verses  .related-panel  .share  .share-actions
.verse(.is-hero .is-display .is-loading .reveal .is-open-line)  .verse-text  .verse-num  .verse-ref  .anim-unit  .reveal-part
  data attributes on .verse: data-ref · data-anim · data-split · data-part · data-plain · data-emph
.bible-picker  .picker-note
.gospel-picker  .gospel-btn(.is-active)  .gospel-name  .gospel-symbol
.passages  .passage(.is-chosen)  .passage-body
.deeper  .drawer(.is-open)  .drawer-scrim  .drawer-panel  .drawer-head  .drawer-close  .related  .related-card (details)
.gospel-btn .gospel-n (numeral)  ·  .panel.is-seen (risen in)  ·  body.is-scrolled  ·  body[data-gospel] tints .verses
.page  .page-head  .page-context
.church-picker  .church-name  .church-actions
.designer-grid  .designer-card  .card-name  .card-location  .card-tagline  .card-tags
.designer-profile  .profile-head  .profile-story  .design-grid  .design-card
.stepper(li.is-current .is-done)  .shop-step(.is-current)  .step-actions
.choice-grid  .choice(.is-active)  .choice-title  .choice-meta
.customize  .customize-preview  .order-summary
.split  .split-bar  .split-seg  .split-legend
.about-section  .site-footer
shared: .btn(.btn-primary .btn-ghost)  .field  .pill(.is-hidden)  .avatar  .eyebrow  .sr-only
```
State is `.is-*`. Every block has a `/* ===== NAME ===== */` banner in `tc.css` and an `<!-- ===== NAME : purpose ===== -->` comment in the HTML.

## Data attributes — what to wire to

| Attribute | Where | Values |
|---|---|---|
| `data-action` | every control | `pick-bible` (select) · `pick-gospel` · `open-drawer` / `close-drawer` · `pick-church` (select) · `church-url` (submit) · `clear-church` · `pick-design` · `pick-product` · `shop-next` / `shop-back` (+ `data-to`) · `quick-order` · `toggle-sound` · `proceed` · `share` · `copy-link` · `coming-soon` |
| `data-ref` | `.verse` | verse ids from `scripts/fetch-verses.mjs` (`matthew.22.36-40`, `john.14.15`, …) |
| `data-anim` / `data-plain` / `data-split` | `.verse` | animation mode · join verses without numbers · regex for the two-part reveal |
| `data-field` | dynamic text | `text` `ref` (verse) · `church.name` · `bible.short` · designer: `name initials location tagline styles story designs` · order: `order.design order.product order.price order.church` |
| `data-gospel` | `.gospel-btn`, `.passage`, `body` | `matthew mark luke john` |
| `data-step` / `data-to` | `.shop-step`, step buttons | `design customize product order` |
| `data-choices` | `.choice-grid` | `design product` |
| `data-context` | `.pill` | `church bible` |
| `data-split` | `.split-seg`, legend `li` | `church designer business foundation` |

## Storage (localStorage, prototype)
`tc-bible` (version id) · `tc-gospel` (gospel id) · `tc-church` (`{ id, name, url }`).

## `data.js` shape
See the banner in `data.js`. `TC_DATA.versions[]` `{ id, label, short, source:'bundled'|'api', licensed }` is the seam for licensed Bibles; `TC_DATA.split[]` `{ id, label, share }` drives every split bar.
