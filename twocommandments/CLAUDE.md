# II Commandments — agent brief

You are working on a static HTML/CSS/JS skeleton of a message site + merch funnel. Read `PROJECT_PLAN.md` first (the storyboard and business rules), then `HANDOFF.md` (the naming contract); this file is the working rulebook.

## Non-negotiables
- **The look comes from the inspiration, not from taste.** Design pass 01 is grounded in `design-iterations/inspiration/INSPIRATION.md` → "What the references agree on" (paper, one line at a time, Gospels as chapter colour worlds, drawer for related verses). Change looks via tokens first, and cite which reference a change comes from.
- **Names are the contract.** Block classes, `data-action`, `data-field`, `data-ref`, `data-gospel`, `data-step` are indexed in `HANDOFF.md`. Don't rename; add.
- **Every control does or shows something.** No dead buttons. Unwired actions fall through to `tcToast('Coming soon')`.
- **Verse text is data, not copy.** Never type scripture into HTML. Mark a `.verse[data-ref]` and let `tcRenderVerses()` fill it from `verses.js`. New references go in `scripts/fetch-verses.mjs` → re-run it.
- **Free Bible versions only** unless told otherwise. `TC_DATA.versions[].source === 'api'` entries stay disabled until a licensed seam exists.
- **No new raw sizes or colours.** Use the `--color_*`, `--font_*`, `--space_*`, `--gospel_*` tokens at the top of `tc.css`.
- **Accessibility is at 100 (Lighthouse) and must stay there.** Contrast ≥ 4.5:1, targets ≥ 24px, one global `:focus-visible` ring, `prefers-reduced-motion` honoured by every animation.
- Google Fonts only for type. Icons are inline SVG — no icon library or icon font.

## Map
- `index.html` — panels in storyboard order: hero → logo → love → gospels → verses → related → share.
- `church.html` / `designers.html` / `shop.html` / `about.html` — inner pages sharing the `.page` frame.
- `tc.js` — one file, banner sections. Spine: delegated `[data-action]` click/change/submit → `TC_ACTIONS[action](el, ev)`. Init: `tcInit` → `tcInit{Home,Church,Designers,Shop}` by `body[data-view]`. Verse system: `tcResolveBible` (`?bible=` → localStorage → default), `tcRenderVerses`, `tcAnimateWords`, `tcRenderReveal`. Home: `tcRenderGospels`, `tcRenderPassages`, `tcSetGospel`, `tcRenderRelated`. Church: `tcSetChurch`, `tcRenderContextPills`. Shop: `tcShopGo`, `tcPickChoice`, `tcRenderOrder`, `tcRenderSplit`.
- `data.js` — `TC_DATA.{versions, defaultVersion, gospels, related, share, churches, designers, products, split}`.
- `verses.js` — generated. `TC_VERSES[version][refId] → { reference, verses:[{ n, text }] }`.
- `tc.css` — tokens, base, shared controls, then one banner per block in DOM order.
- `assets/` — placeholder SVGs (logo, four gospel icons, design thumb, hero background).

## Derived data (rules a backend must reproduce)
- **Bible resolution**: `?bible=` wins and is saved; else localStorage `tc-bible`; else `TC_DATA.defaultVersion`. Only `source:'bundled'` versions are selectable.
- **Quote cleanup** (`tcVerseText`): a passage excerpt may open or close a quotation outside the excerpt; the unmatched mark is dropped for display only.
- **Two-part reveal**: split at the first match of `data-split` (default `,`).
- **Chosen Gospel** (`tc-gospel`): its passage is ordered first and open; without a choice all four are open.
- **Church** (`tc-church`): `{ id|null, name, url }`; from the list or a typed URL (hostname becomes the name).
- **Split**: `TC_DATA.split` shares are rendered as-is (33/33/33/1 — they intentionally don't sum to 100; that's the founder's sheet).

## Test recipes
- Syntax: `node --check tc.js data.js verses.js`.
- Verses: `node scripts/fetch-verses.mjs` (bible-api.com rate-limits; the script backs off).
- Serve: `python3 -m http.server 8765` from `studio/` → http://127.0.0.1:8765/twocommandments/. Useful params: `?bible=kjv`, `?anim=letters|words|fade`, `?designer=designer-one`, `?design=d1-love-god`.
- Lighthouse a11y: `npx lighthouse "http://127.0.0.1:8765/twocommandments/<page>" --only-categories=accessibility --output=json --chrome-flags="--headless=new"` for all five pages, desktop + mobile.
- Keyboard: Tab from the top — skip link first; gospel buttons and passage summaries reachable; stepper focus lands on the step heading.
- Studio index: `python3 generate-index.py` in `studio/` after changing the `studio:*` meta tags.

## Good first tasks
1. "Design pass for panels 1–3 using <inspiration>: tokens only for colour/type; add motion in `tcAnimateWords` modes; keep reduced-motion behaviour."
2. "Add a licensed-version seam: `tcVerse()` falls back to `tcRequest('verse', {version, ref})` for `source:'api'` versions; stub returns the WEB text; enable those options."
3. "Replace the three placeholder designers with the real seed ten in `data.js`; profile page must render identically."
4. "Wire `quick-order` to <commerce provider>; keep `tcRenderOrder` as the single summary renderer."
