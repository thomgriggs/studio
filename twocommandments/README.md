# II Commandments

Skeleton of a site that delivers the two greatest commandments as a typographic, animated home page, then funnels into designer-made merch split three ways (designer · church/non-profit · business). Studio project — still being shaped.

## Run it
Any static server from the `studio/` folder, e.g. `python3 -m http.server 8765` → http://127.0.0.1:8765/twocommandments/. (`file://` works but Google Fonts need network.)

## Read in this order
1. `PROJECT_PLAN.md` — storyboard, meeting notes, decisions, open questions.
2. `HANDOFF.md` — naming contract (blocks, `data-action`, `data-field`, storage, data shape).
3. `CLAUDE.md` — working rulebook, code map, test recipes.

## Front door
`index.html` is the **design breakdown**: every reference from the founder's doc with its screenshot, his quote, the device we take and where it lands — then the **studies** (one page per reference, `design-iterations/studies/*/`), then the earlier three concepts, then the working build (`home.html` + inner pages). Studies and concepts share the root's `tc.js` / `data.js` / `verses.js`.

## Files
`index.html` `church.html` `designers.html` `shop.html` `about.html` · `tc.css` `tc.js` `data.js` `verses.js` (generated) · `scripts/fetch-verses.mjs` · `assets/` (placeholder SVGs).

## Status
- [x] Home page panels with verse system, Bible picker (WEB/KJV/ASV), Gospel picker, two-part reveal, hero word animation
- [x] Church picker, designer grid + profile, shop stepper mock, about with the split
- [x] Inspiration catalogued (`design-iterations/inspiration/`)
- [x] Design pass 01: paper + serif, Gospels as chapters with colour worlds, related verses in a drawer, panel motion
- [x] Three concepts (superseded — read as generic)
- [x] **Thirteen studies, one per reference**, each doing what that site does with our words — `index.html` → Studies; imagery stand-ins in `assets/ASSETS.md`
- [ ] Founder reacts to the studies → combine the ones that land into the real site
- [ ] Real logo, gospel art, founder's story, seed designers
- [ ] Commerce, printer, licensed Bible versions, hosting
