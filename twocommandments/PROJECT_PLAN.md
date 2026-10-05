# II Commandments — project plan

A site built around the two greatest commandments — love God, love your neighbor as yourself — that (1) delivers that message with an impactful, typographic, animated home page and (2) funnels visitors into print-on-demand merch made by graphic designers, with every sale split between the designer, a church or non-profit the buyer chooses, and the business.

Status: **skeleton** — structure, content, data and behavior are in place with deliberately plain styling. The typographic/motion design pass waits on the founder's inspiration sites.

## Home page storyboard

Source of truth: the founder's Google Sheet "Calling All Christians – Website" + the "WEBSITE FLOW" section of his doc. **Re-ordered by him in Oct 2026** (read 2026-10-05); `home.html` follows this order. The earlier table is kept below it for the panel details that didn't change.

| # | Panel (his order) | His words | Built as |
|---|---|---|---|
| 1 | **Open — "If you love me…"** | "Must feel cinematic. Background imagery/video must draw people into a 'movie' experience. Music — ideally Aramaic. Scroll." Sheet: "In this panel, just 'if you love me…'" | `.panel.open` — John 14:15 first half only (`data-part="1"`), Rembrandt stand-in full-bleed with slow drift, `.sound` toggle (`TC_DATA.music`: his two Sam Thomas Syriac tracks, no file until licensed) |
| 2 | **Welcome** | "The 'title page' — cover page, conveying 'welcome to the II Commandments' — this one brands the project" | `.panel.welcome` — wordmark, "of Jesus" |
| 3 | **Narrative** | "A brief narrative that sets up the simplicity of the II Commandments." Sheet's new Segue row: "In the Old Testament, there are four major prophets and twelve minor prophets" (+ Tanakh / Twelve note) | `.panel.narrative` — three lines, **draft copy for him to replace** |
| 4 | **"JESUS said: All of the Law and the Prophets…"** | "Fonts — must emphasize 'All', but subtly." Sheet now prefixes "JESUS said:" | `.panel.hero` — eyebrow "Jesus said", words animate in, `data-emph="all|whole"` wraps the first match in `<em class="emph">` (version-aware: WEB says "whole"), Bible picker |
| 5 | **The four Gospels** | "Could be like the Gospel options given in 'Option 3'. But I envision 4 buttons — top left, top right, bottom left, bottom right — then a 'proceed' button at the bottom. Icons with the symbols for Matthew, Mark, Luke, John" | `.gospel-picker.is-corners` — 2×2 icon tiles with corner radii, `.gospel-proceed` → #verses |
| 6 | Verses | unchanged | `.passages` |
| — | Related · Share | unchanged | drawer · `.panel.share` |
| end | **Logo — layered designs** | "Keep this for the end/bottom of the scroll perhaps (by doing this, you demonstrate the emphasis on design): different designs, one on top of the other, like the last section of jitter.video" | `.panel.logo.is-finale` — `.logo-stack` of three design layers under the mark |

**Also new in the doc (Oct 2026):** "WEBSITE — MUSTS: Default to Christian Standard Bible (CSB)" (licensed — see Bible text); "It has to feel like one page is taking you to the next page"; "Images/UI have to establish that you're going to take a moment to reflect on the words of Jesus — set a tone — feel like you're in the presence"; a Behance pick for first designer (Lydia Zach); Resurrection Design Co. ("definitely"), MOTIF, Forgiven Photography as contacts. The sheet also dropped its old Bible-dropdown row (ewtn/quietbible references) — the picker stays on panel 4.

### Earlier table (panel details)

| # | Panel | Copy / behavior | Built as |
|---|---|---|---|
| 1 | Hero verse | "…All of the Law and the Prophets hang on these two commandments…" written across the screen, Jesus in the background, words animate in (fade / letter-by-letter — try several). Bible-version picker may live here. | `.panel.hero` — Matthew 22:40, `data-anim="words"`, `?anim=fade|words|letters` to compare; `.bible-picker` |
| 2 | Logo | II Commandments logo, layered designs (jitter.video "Blend Modes, Circle Stack" reference) | `.panel.logo` — placeholder SVG |
| 3 | "If you love me…" | John 14:15 animated in two parts: "If you love me…" → "keep my commandments." Copy responds to chosen version. | `.verse.reveal` split at the comma |
| 5 | Choose your Gospel | Logo fades to 4 icon-buttons: Matthew (winged man, green), Mark (lion, red), Luke (ox, blue), John (eagle, gold) + proceed/next | `.gospel-picker` — `TC_DATA.gospels` |
| 6 | Verses | Matthew 22:36-40 · Mark 12:28-34 · Luke 10:25-37 · John 13:34-35; clean version dropdown (ewtn.com/bible style liked); images may change with tradition (Catholic/Orthodox/Protestant) | `.passages` — chosen Gospel first + open |
| 11 | Related verses | Matt 5:43-48, Matt 5:17-20, John 15:9-17, Rom 13:8-10, Gal 5:13-14, James 2:8, 1 John 4:7-12, 1 John 4:19-21 — "maybe a side track" | `.related` — `TC_DATA.related` |
| 12 | Call to share | subtle verses about sharing the word | `.panel.share` — Mark 16:15 + Web Share |
| 13 | Choose your church / non-profit | floating mid-screen menu, name in a beautiful font (sofihealth.com "plant powered" reference); dropdown + URL box | `church.html` |
| 14–17 | Choose design → Edit & customize → Choose product → Quick order | (no detail in sheet) | `shop.html` stepper, mock |
| 18 | About | 33% church · 33% designer · 33% II Commandments · 1% foundation | `about.html` + `.split` |

Row 4 and rows 7–10 in the sheet are the Gospel colour/link notes, folded into panel 5/6.

## From the meeting notes

- He has a place to print and ship; print per order; pricing is competitive.
- Upsell media types: shirts, hats, mugs (also hoodies, prints here).
- Main goal: give graphic designers a side income from collateral, now that work is being farmed out to AI.
- Split: 1/3 designer · 1/3 church/non-profit · 1/3 the business (sheet adds 1% foundation).
- Establish it as a movement: "it's all about love and taking care of people." A fundraiser mechanism.
- The business is the middle man: front of house (marketing, drumming up sales) and back of house (operations, fielding questions).
- Business card + QR code that funnels to the site.
- Audience is Christians. "Think like a Christian no matter which type, or even if you are not."
- Momentary experience on arrival: this is what the Bible says. Keep messaging simple, strong, impactful.
- Churches give content to post → spread their word → create a vacuum of attention.
- He is providing a written story.
- Verses must show in the version the reader is used to. CSB was his default wish; dropdown; remember the choice (cookie).
- Thom's suggestions: ~10 seed designers before launch so the store looks full; a profile/story page per designer that pulls in their style before funneling to their cart; cross-promotion with churches.

## Bible text

Bundled (public domain, free, in `verses.js`): **WEB** (default), **KJV**, **ASV**. Fetched from bible-api.com by `scripts/fetch-verses.mjs`.

Licensed (CSB, NIV, ESV, NLT, NASB) cannot be bundled for free. Path when wanted: API.Bible (free non-commercial tier, needs a key) or the ESV API, behind a Cloudflare Worker that hides the key; `TC_DATA.versions[].source = 'api'` is the seam. A merch site is commercial — expect a license conversation. Tell the founder: CSB as default is a licensing decision, not a technical one.

## From the founder's doc "CALLING ALL CHRISTIANS" (read 2026-09-30)
Google Doc: https://docs.google.com/document/d/1NGQ6icOEgEiOY9yKmW0Zlg26J6hRKoIqGC5YNBKP4vw/edit — the inspiration links are catalogued in `design-iterations/inspiration/INSPIRATION.md`.

**These differ from the meeting notes — confirm which is current:**
- **Designer split: "Partner with designers – 50/50 profit split"** (the storyboard's About row says 33/33/33 + 1%). The doc also says "X % of each sale goes to the Church of your choice (as long as it's an entity we can find)".
- **Church lookup against real registers**: Hartford Institute megachurch database, church-register.com, mychurchfinder.org — so the church picker should search a database, not a typed URL.
- "A search bar for every Bible version of" the five passages — a *search*, not just a dropdown.
- "Site to have place for sermons from registered Churches."
- **Design allowances (slogans for merch):** "II Commandments {of Jesus}", "Jesus, THE King", "Calling all Christians", "1 Timothy 6:11-16".
- Business cards: II Commandments on one side, QR on the other.
- **People:** Matt Selego (printer); Drip. **First designer:** Lydia Zach — https://www.behance.net/lydiazach.
- **Print-on-demand:** passive — Amazon Merch on Demand (~$5/shirt after split), RedBubble, TeePublic; active — **Shopify preferred ($39/mo)** + Printify (free) / Printful (free); also Completeful (POD + 3PL). Numbers: shirt costs $18–20 to make; to net $10 the price is ≈ $28.

## Decisions

- Name: **II Commandments** (sheet title was "Calling All Christians").
- Scope of this pass: home page + static funnel mockups. No cart, no checkout, no printer integration — printer, e-commerce platform and host are undecided.
- Design waits for inspiration sites. Placeholder type: Fraunces + Inter (Google Fonts only). Icons: inline SVG (Lucide-style) — no icon library.
- Conventions: same as `studio/optimumrv/crm` — see `CLAUDE.md` and `HANDOFF.md`.

## Open questions

1. Printer / print-on-demand provider and how orders reach it.
2. E-commerce platform (or custom) and payments; host for the production site.
3. Licensed Bible versions — pay for API.Bible commercial use, or stay public domain?
4. The official logo and the "layered designs" treatment for panel 2.
5. Jesus imagery for the hero — stock/AI references in the sheet (magnific.com) need licensing.
6. Who the "foundation" (1%) is.
7. Designer application / onboarding flow; how designers get paid.
8. Church verification — anyone can type a URL today.
9. ~~Inspiration sites (pending from the founder)~~ Received 2026-09-30 → `design-iterations/inspiration/`. Design pass next.
10. ~~Which split is right?~~ **Decided (Thom, 2026-09-30): thirds when a church is chosen; 50/50 designer / II Commandments when there's no church affiliation.** `TC_DATA.split.withChurch` / `.noChurch`; the shop's split bar follows the buyer's choice quietly. **Not spotlighted in the UI** (Thom: "might confuse things") — About tells only the church story. The 1% foundation line still needs the founder's confirmation.
11. 1 Timothy 6:11-16 is a new verse to add to `scripts/fetch-verses.mjs`.

## Studies — one per reference (2026-09-30, evening) — `index.html` → "Studies"
Thom's correction after seeing the three concepts: *"I feel like you went off on your own versus using the inspiration my friend supplied. He will look at all three and think this is just generated by AI."* The fix was to stop abstracting and build **one study per reference** — each page does exactly what that site does, with our verse and our store, in two beats: the opening, and the device he commented on. The front page (`index.html`) is now the breakdown: screenshot → his quote → the device → where it lands → the study.

`design-iterations/studies/`: `atterwasch` · `bennos-light` · `nomadic-tribe` · `legend-of-santar` · `every-last-drop` · `slavery-footprint` · `sofi` · `jitter-logo` · `graza` · `de-la-calle` · `mack-and-pouya` · `bite` · `black-star-pastry`. All share the root `tc.js` / `data.js` / `verses.js`; each has its own inline stylesheet and a study note saying what was borrowed.

Imagery stand-ins (his sites' images are **not** used): Carl Bloch *Sermon on the Mount* (public domain) and Rembrandt *Christ Preaching* (CC0) — `assets/ASSETS.md`. Verse list gained Matthew 22:37-40 and 1 Timothy 6:11-16.

Next: the founder reacts to the studies → we combine the ones that land into the real site. The three concepts below are kept as the earlier, superseded attempt.

## Three concepts (2026-09-30) — superseded by the studies
Thom's method: three concepts, one index page, the founder picks. Each comes from one group of his own references; all three share `tc.js` / `data.js` / `verses.js` — only `tc.css` and a few words differ.

| # | Concept | References | In a sentence |
|---|---|---|---|
| 1 | **Paper** — `concept-01-paper/` | Graza, Slavery Footprint, sofi | Type alone on warm paper; Gospels as a numbered chapter list; quiet, bookish. (= design pass 01, now at the root) |
| 2 | **Documentary** — `concept-02-documentary/` | atterwasch, Benno's Light, Nomadic Tribe, Santar | Black, photographic; italic Playfair on a full-bleed b&w photo (the "Jesus in the background" concept); stark chapter list; the one light beat is "If you love me". |
| 3 | **Colour** — `concept-03-colour/` | De La Calle, Mack & Pouya, Every Last Drop | Loud and joyful; Anton caps, thick ink outlines, hard shadows, stickers; every panel a colour block; each Gospel its own world; merch-first. |

Whichever wins: copy its `tc.css` and hero markup to the root, then carry its tokens through the inner pages.

## Design pass 01 (2026-09-30)
Built directly from `design-iterations/inspiration/INSPIRATION.md` → "What the references agree on":
- **Paper, not black.** Hero and share panels on paper; the one dark beat is "If you love me" (the reveal's second half is italic and arrives late on purpose).
- **One serif line at a time.** Fraunces at optical size 144, weight 300, `text-wrap: balance`; the hero is only the verse, the reference, and the Bible picker as a quiet underlined select.
- **Gospels as chapters.** A numbered list (I–IV) with each writer's symbol in his colour; choosing one lights the row and tints the whole verses panel with that Gospel's colour world (`body[data-gospel]`).
- **Related verses in a drawer.** Panel 11 is one line and a door ("Open the verses"); the eight passages live in a right-hand drawer as an accordion, Esc/scrim/× to close, focus returned.
- **Motion:** every panel rises in once as it enters; words blur-and-lift in the hero; the logo breathes; the "continue" arrow nudges. All off under `prefers-reduced-motion`.
- Accent: one burnt sienna. Grain: a 3px dot at 35% over the paper. Lighthouse a11y 100.

Still placeholder: the mark, the gospel symbol art, Jesus imagery for the hero (atterwasch-style full-bleed photo is the reference if he wants it), the founder's story, seed designers.

## Next steps

0. Founder reviews the re-cut `home.html` (his Oct order) — especially the narrative copy (ours is a draft), the "All" emphasis, the four-corner picker, and whether the logo belongs at the end.
1. Design pass once inspiration arrives: type, colour, motion for panels 1–3 and 5, the church-name treatment, designer profiles.
2. Real logo + gospel symbol art.
3. Founder's story into `about.html`; 10 seed designers into `data.js`.
4. Decide commerce stack, then wire `shop.html` to it.
