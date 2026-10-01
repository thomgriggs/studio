# Westbrooke Place HOA — custom CSS review (2026-10-01)

Review of `concept1/custom-css/hoa-custom.css`, the stylesheet pasted into HOA Express's **Custom CSS** field on https://www.westbrookeplacehoa.com (it arrives as an inline `<style data-rh="true">` under the marker `/* Westbrooke Place — Custom CSS */`). Nothing in the working file was changed by this review; a frozen copy is `hoa-custom.v1-2026-10-01.css`.

## The numbers
| | |
|---|---|
| Size | 4,621 lines · 146 KB · **26 KB gzipped** |
| `!important` | 1,242 |
| `:has()` | 179 (109 of them on `[class*="app__AppContainer"]`) |
| `[class*="…"]` attribute selectors | 814 |
| Media queries | 26 |
| Remote `url()` | 17 — 16 Unsplash `download?force=true` hotlinks, 1 Google Fonts `@import` |
| Custom properties | 38 (`--wp-*`) |
| Exact-duplicate rule blocks | 1 (Calendar banner, declared twice back to back) |

## The constraint that decides everything
HOA Express gives us **one CSS field and no JavaScript**. Their styles are hashed styled-components classes (`banner__BannerPhoto-sc-…`) in an unlayered inline `<style>`. So:
- `[class*="x__Y"]` attribute matching is the only stable hook. Keep it.
- Page targeting has to be CSS-only → `:has(a[aria-current="page"][href$="/p/…"])`. There is no "set a `data-page` attribute with a script" option on the live site. Keep it.
- `!important` is the cost of winning against styled-components' specificity. The count is a symptom of the architecture, not of sloppiness.

## Verdict
For an override sheet on a platform you don't control, it is in good shape: a token layer, section banners, comments that explain the hacks, one consistent page-targeting pattern. 26 KB gzipped is not a performance problem. The costs are **maintainability** (three hand-synced copies, scattered page rules, stock hotlinks), not bytes.

## Experiment: `@layer` wrapper — result: not safe as-is
`scripts/build-css-v2.mjs` generates `hoa-custom.v2.css` = v1 with the duplicate removed and everything wrapped in `@layer westbrooke`. Tested A/B in the concept (v1 link disabled, v2 injected alone, computed styles of every visible element compared) on Home, Calendar and Member Documents:
- **29–82 elements change per page, always the same cluster**: admin-bar buttons/links drop 13.12px → 12px, an admin-bar container narrows 486 → 453px, some icons resize.
- Cause: those are *non*-`!important` declarations that currently win over HOA Express by **source order** (our inline style comes later). Inside a layer, unlayered platform styles beat them.
- Making them win again means adding `!important` — the opposite of the goal. **Conclusion: leave v1 unlayered.** v2 stays in the folder as the record of the test.

## What would actually help, in payoff order (none done)
1. **Host the images.** 16 Unsplash `download?force=true` URLs are slow, uncached and can vanish. Do what we did for the home photo: pull the ones you're keeping, WebP at 2400/1200, serve from the studio (`studio.thomgriggs.com/westbrookeplacehoa/concept1/public/westbrookeplacehoa/images/…` is live once pushed) or upload as HOA Express banner photos and reference their URL. Note the live site cannot see `/westbrookeplacehoa/images/…` relative paths — the pasted CSS needs **absolute** URLs.
2. ~~One copy of the file.~~ *Correction:* the two `public/…` paths are **symlinks** to `custom-css/hoa-custom.css`, so there is already only one file. Nothing to do.
3. **Group by page.** Home is touched at lines ~210, ~1169 and ~2714. Since every page is targeted with the same `:has()` wrapper, collapsing each page into one block makes the whole treatment readable in one place. Mechanical, safe, worth doing before the next big change.
4. **Dedupe** the one repeated Calendar block (and keep an eye out — the generator script flags them).
5. **Docs.** This folder had none. Everything above (which copy is live, the no-JS constraint, the page-targeting convention, the paste marker) should live in a `CLAUDE.md` + short `README` so it survives six months.

## Not worth touching
The attribute selectors, the token layer, the breakpoints, the `!important`s themselves.

## Also
- The concept's `tests/rendered-html.test.mjs` is a template placeholder (asserts the starter skeleton), not a regression test for the CSS. A real safety net would be the A/B script above, run on a fixed list of pages.
- Ask the client for photos at the quality of the new home photo for the other banner pages; the Unsplash stock reads as stock beside it.

## Validator pass (2026-10-01, later) — paste file is now W3C-clean
HOA Express runs the **W3C CSS Validator (css3 profile)** on the Custom CSS field and refuses the paste on any error. Reproduce locally:
`curl -F file=@concept1/custom-css/hoa-custom.css -F profile=css3 -F output=json https://jigsaw.w3.org/css-validator/validator`
Result after this pass: **0 errors, 0 warnings**. What changed, and why it still looks the same:
- **`paint-order` → text-shadow ring.** The title used `-webkit-text-stroke` behind the fill via `paint-order: stroke fill`. Removing paint-order alone made the stroke paint *over* the gold and thinned the letters (that is the "logo is not the same" you spotted). Replaced with `--wp-title-outline`: a 16-point ring of hard `text-shadow`s (0.016em) behind the fill. Stroke set to 0 in all four title rules.
- **`pointer-events` → geometry.** The mobile-nav container was pulled over the top bar with `pointer-events: none` so taps reached the Welcome/bell buttons. Now the container and `TopRow` are zero-height and only the Menu button is positioned up into the bar. Verified at 400px and 900px: Welcome dropdown opens, bell reachable, Menu opens the drawer. The drawer scrim lost `pointer-events: none`; tap-outside never closed the drawer before either (tested), so no behaviour change.
- **Native nesting (`& …`) flattened** by `concept1/scripts/flatten-css.mjs` — 145 nested rules → plain selectors, 0 computed-style diffs on Calendar / Pet Directory / Member Documents in the A/B.
- `inset` → four edges; `text-wrap: balance` dropped.

## Live click-through fixes (2026-10-01, after the first paste)
- **Drawer flashed its list over the page while opening.** HOA's drawer is react-animate-height: `.rah-static` idle, `.rah-animating` for 300ms during open/close. Our rules only matched `.rah-static`, so for the animation the list rendered unstyled in page flow. All drawer selectors now use `[class*="rah-"]`.
- **Member dropdown sometimes didn't appear / chevron pushed to the edge.** `overflow: hidden` + `text-overflow: ellipsis` on `user-box__Container` clipped the absolutely positioned `user-box__DropdownMenu` that lives inside the button. Now `overflow: visible`; ellipsis dropped (it never applied to a flex button).
- The gold band above the footer is intentional (`border-top` accent), left as is.
