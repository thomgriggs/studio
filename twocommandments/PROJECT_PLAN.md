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
Google Doc: https://docs.google.com/document/d/1NGQ6icOEgEiOY9yKmW0Zlg26J6hRKoIqGC5YNBKP4vw/edit · Sheet "Calling All Christians - Website": https://docs.google.com/spreadsheets/d/1aoe11IdOuTU8YWP1ohasmBwQS8H3MDxFgH7gdZxTo5c/edit — the inspiration links are catalogued in `design-iterations/inspiration/INSPIRATION.md`.

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

0. **The two paths (2026-10-22).** How a designer submits (form? email? upload spec?), who reviews, how the split is explained, and whether the church is chosen before or in the shop. Concept 02's finale doors are a placeholder for both until this is decided.

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

## Concept 02 (started 2026-10-22) — `concept-02/`
Thom: "we got off on the wrong foot" — Concept 01 is frozen in `archive/`. Concept 02 is **one long page, each section full-height, built one section at a time** from CL's (Christian Leon, the client) direction.

| # | Section | CL's direction | Built as |
|---|---|---|---|
| — | Corner controls | Thom: back, next and mute on every slide | `.corner` is fixed bottom-right on every section: back (hidden on the first), next (hidden on the last built section), mute |
| 1 | If you love me | Impactful text "If you love me"; music from three YouTube videos (Sam Thomas, Syriac chant); Jesus image (Google / magnific picks, see `concept-02/assets/ASSETS.md`) | `#s1` — John 14:15 two-part word reveal from `verses.js`; Bloch stand-in with slow drift; "Play music" toggle (browsers block autoplay with sound) |
| 2 | Logo, built by scrolling | jitter.video "design in motion" device; each scroll step assembles part of the logo. Thom (2026-10-22): the mark should be stained glass; reference https://mobilebaymag.com/explore-the-beauty-of-mobiles-oldest-stained-glass-windows/ (Victorian cathedral windows, Mobile AL: small irregular leaded fragments in jewel blues, warm halo, Sacred Heart, coloured light spilling onto the stairs) | `#s2` — 400vh track, sticky stage, scroll progress `--p` → two arched windows slide in from either side and meet as "II"; generated mosaic glass (`concept-02/scripts/make-windows.py`, re-run to regenerate) with a Sacred Heart in each: cross above for Love God, dove for Love your neighbor; glass lights up and spills colour on the floor; COMMANDMENTS spells out beneath; the mark shrinks and rises into section 3. Earlier tries (four Gospel discs; cream tablets; flat colour-block panes; figures; hands; twin hearts) all rejected. Placeholder until CL supplies a real logo |
| 3 | Segue | Sheet: "In the Old Testament, there are four major prophets and twelve minor prophets." | `#s3` — the line, word by word, over sixteen marks (four tall, twelve short) that light in sequence |
| 4 | Jesus said · Choose your Bible | Sheet: Matthew 22:40 across the centre, Jesus in the background from the crowd at ~45°, words animated; Bible picker lives here | `#s4` — Rembrandt *Christ Preaching* stand-in; "two" emphasised in gold; `.bible` picker bottom-left (bundled WEB/KJV/ASV; CSB/NIV/ESV wait on a licence) re-renders every verse on the page and clears `?bible=` |
| 5 | Choose which story (sheet rows 6–9) | Four Gospel buttons in the evangelists' colours with their symbols. Thom (2026-10-22): make them **doors** with the stained glass set in; click → the door opens and you go through it into the text | `#s5` — four Gothic oak doors (references 2026-10-22: LAPADA's arched Gothic oak cathedral door with scrolled strap hinges; Pexels Gothic church-door photos): pointed stone arch in two orders with a keystone, vertical planks with grain, two scrolled iron strap hinges, studs, a ring pull; Thom: the stained glass is **only in the pointed top**, a lunette holding the evangelist's medallion (Matthew green / winged man, Mark red / lion, Luke blue / ox, John gold / eagle). Click: the leaf swings open on its hinge, the room behind glows in the Gospel's colour, the row drifts through the doorway, the page lands on the passage; the row resets for the way back. Choice persists in `tc-gospel`; the ground of sections 5–6 fades to the Gospel's colour |
| 6 | The passage | The chosen Gospel's verses | `#s6` — Gospel name in its colour, reference, full text with superscript verse numbers from `verses.js`; follows the Bible picker; Matthew when nothing is chosen |
| 7 | Two paths (finale) | Thom (2026-10-22): the last slide is the action; only two paths: submit a design inspired by the two commandments to be made and sold, or go to the shop. Purely typographic, no doors. Then: bigger words, **white ground like the end of a story, a thick sans**, Design top-left with its description bottom-right, Shop the opposite, supporting graphics | `#s7` — paper-white `.split`, Archivo Black words: DESIGN top-left / SHOP bottom-right; thick-line pencil and shirt drawings in the opposite corners; hover (or focus) a side and it takes the panel, the word grows, the drawing drifts off and fades, the description and a black pill button appear diagonally opposite the word; the other side narrows to a sliver with its word sideways. Corner controls go dark on this slide. Both actions toast "Coming soon" until the flow and the shop exist |

## Founder's reaction to Concept 02 — Sheet tab "v.2 - 10/22" (read 2026-11-02; sheet last edited 2026-11-01)
His feedback is section by section against `concept-02/`. Row 14 says **"STOP HERE IN THIS VERSION"** — panels 1–6 are the scope of this round; 7–9 are sketches for later. None of this is built yet.

| # | Section | His words (v.2) | To do |
|---|---|---|---|
| 1 | If you love me | "This panel is good. Simple." Keep it; after "if you love me" fades, add "you will keep my commandments." (one panel or two — his call after seeing it). Then, briefly, "John 14:15" at ½–¾ size in **burgundy**; wording is **ESV**. Bible-version tool at the bottom of this panel ("you can use link"). Image: "the font and the illumination are perfect"; wants Option 1/2/3 with different image types later. Sound: *asks whether* we can clip The Gospel of John film at 2:02:29–2:02:32 — "Don't do it! just let me know if you can". Music for now: his YouTube playlist (cWBi3L-Nx9A) | Second line of John 14:15 after the first fades; small burgundy reference; move/duplicate the Bible picker here. Answer the audio question (yes, technically; licensing says no). ESV is licensed — see Bible text |
| 2 | Logo | "I like the 'logo' in the center… what you have right now is a cool placeholder — def not against it." Official logo first; later, flash alternate designs over each other (jitter.video last section) | Nothing now. Still waiting on the real mark |
| 3 | **Agape (new)** | "AGAPE" and "LOVE" fade between each other a few times to show they're interchangeable, then both rest in the centre. Then the agape chart from the Doc → Website Flow → III. Agape: half the items appear around the word, the other half on further scroll | New section between the logo and the segue. Need the chart from the Doc (it's an image there — ask for the source or redraw) |
| 4 | Segue + Jesus said | Numerals: "In the Old Testament, there are **4** major prophets and **12** minor prophets." then fade, then "All of the Law and All of the Prophets hang on these **2** Commandments." — Matthew 22:40 is the verse that follows the chosen version. Bold + illuminate "All of the Law, and All of the Prophets" and "2 Commandments" "like in the other parts". A **"Choose your version"** button at the bottom; the choice holds to the end of the site | Change s3 copy to numerals; emphasise the two phrases in s4; picker as a labelled button |
| 5 | Choose which story | "This is cool, but": wants the four choices **top-left / top-right / bottom-left / bottom-right** with the evangelist **symbols** (winged man, lion, ox, eagle), not just stained glass; **"In every Gospel"** in the centre; a proceed button at the bottom. **Make this Option 2 and keep the stained-glass doors as Option 1** | Build a second s5 variant (`?s5=corners` or a toggle) and keep the doors |
| 5a | The passage | "Make bold and 'illuminate' the words **first**, **second** and **commandment** in each of the Bible verses" | Word emphasis in s6 via `data-emph` across versions |
| 6 | **Floating verses (new)** | "All of these verses floating somehow… with links to them": Matt 5:43-48 · Luke 10:25-37 · Rom 13:8-10 · John 15:9-17 · Gal 5:14 · James 2:8 · 1 John 4:7-12 · 1 John 4:19-21 · Gal 5:13-14 · Matt 5:17-20 | New section after the passage; replaces the old "related verses" drawer idea. Add Luke 10:27-28, Gal 5:14, Matt 5:17-20 to `fetch-verses` if missing |
| — | STOP HERE IN THIS VERSION | | Finale s7 stays as the end for now |
| 7 | Share (later) | "…let your light shine before others" Matt 5:16 or Mark 16:15; "as subtle as possible, maybe just the title of the verses" | Later |
| 8 | Church / non-profit (later) | sofihealth "plant powered" panel; **"Support love in action"** under the logo; floating mid-screen menu, name in a beautiful font; "Whose work do you support?"; dropdown + URL box | Later; reconciles with open question 8 |
| 9 | Shop (later) | "Shifts to the shop — should it be another page?" Choose your design → Edit & customize → Choose your product → Quick order → About (33/33/33, 1% foundation) | Later; his own question about a separate page matches our `shop.html` |

Gospel colours restated by him (rows 9–12): Matthew green · Mark red · Luke blue · John gold — matches `TC_DATA.gospels`. His passage references: Matthew 22:34-40, Mark 12:28-34, **Luke 10:27-28** (shorter than our 25-37), John 13:34 (+ John 15:9-17 as a second John passage).

## From the Google Doc — new since 2026-09-30 (read 2026-11-02; doc last edited 2026-11-01)
- **"NOTES for Excel v.2 - 10/23" — music toggle.** Three traditions, "can we have a toggle, or have 3 versions (separate ones)? I just want to be able to ask my lil focus folks which/if they prefer one": Catholic — Gregorian chant (FLbyr94LH1I or o2_YXd0FPxY); Orthodox — Byzantine chant (zLEXAjetYd4); Protestant — DlAZxnpsFdo. → Make `TC_DATA.music` a list keyed by tradition and let the mute control cycle or offer a picker; `?music=catholic|orthodox|protestant` for his focus-group links. Still YouTube-only until something is licensed.
- **"Music References"**: Sam Thomas (Syriac) ×2, Gregorian Psalm 91, Agni Parthene (Byzantine), a 3-hour hymn instrumental, Wedding Dance/Psalm 91, and a playlist (tyIoWyqy-Zs). Same licensing caveat.
- **"WEBSITE FLOW"** now reads: Panel 1 cinematic, music ideally Aramaic, scroll · Panel 2 the welcome/title page that brands the project · **Agape** (image chart + three articles on agape as the highest love) · Panel 3 a brief narrative setting up the simplicity of the II Commandments · Panel 4 "fonts must emphasize 'All', but subtly" · Panel 5 four corner buttons with the evangelist symbols, a proceed button, and **"GIVE OPTION TO WATCH"** (a video alternative to reading the passage — new; ask what he'd embed).
- **"WEBSITE – UX" musts:** default to CSB (licensing — see Bible text); "it has to feel like one page is taking you to the next"; imagery must set a tone of reflection, "feel like you're in the presence (maybe take Thom to church)". Designers he wants to approach: Resurrection Design Co. ("definitely"), MOTIF, Forgiven Photography (for referrals). Reference lists grew (Figma 2026 trends set, cinematic/storytelling roundups, Daoism Systems, See What Eye See, Scheme Engine) — not yet in `INSPIRATION.md`.
- **"Store Related"** (new): Mack & Pouya, Bite, Graza, De La Calle, Anyday, Black Star Pastry, Ghia — all already covered by the studies except Anyday and Ghia.
- **"CHURCHES"**: one sermon reference so far — Aaron Burke, "Love | Fruit of the Spirit" (Radiant, at 19 min).
- **"EXECUTION"**: Printful, Printify, Completeful; shirt cost $18–20, ~$28 to net $10 — unchanged.

## Built 2026-11-02 — v.2 folded into `concept-02/` (restore point: git tag `before-v2-feedback`)
- s1: two beats — "If you love me" is read, fades, "keep my commandments" (whatever follows the comma in the chosen version) is read, then "John 14:15" at half size in rose-burgundy (`--color_burgundy` #c9525e; true burgundy fails contrast on the veil). "Choose your version" picker bottom-left, synced with the one in s4. Pin track 220vh.
- `#s-agape` (new, between s2 and s3): AGAPE/LOVE crossfade three times, settle stacked, then eight placeholder satellites in a ring over two beats. **Placeholders** until his chart arrives.
- s3: numerals. s4: `data-emph` regex lights whole/all · law · prophets · two · commandments; picker label "Choose your version".
- s5: Option 1 doors (default) · Option 2 corners (`?s5=corners` or the switch at the top of the section): four symbols in the corners, "In every Gospel" centred, Proceed. The corner symbols are thin line-art placeholders. s6: first / second / commandment(s) in gold.
- `#s-verses` (new, between s6 and s7): the nine related verses (Gal 5:14 is inside Gal 5:13-14) drift in a jittered grid; click opens a reading panel (Esc / × / backdrop close, focus returned).
- Music: `?music=syriac|catholic|orthodox|protestant` and a picker beside the mute button; never autoplays. `TC_DATA.musicSets`.

## Next steps (2026-11-02)
1. Founder reviews the build; his focus-group links: `?music=catholic`, `?music=orthodox`, `?music=protestant`, `?s5=corners`.
2. Ask him for: the Agape chart source, what "option to watch" should play, and the official logo. Tell him the ESV/CSB and film-clip answers are licensing, not technical.

## Built 2026-11-13 — v.3 (sheet edited 11-10) + Thom's notes
All in `concept-02/`. New refs fetched with `concept-02/scripts/fetch-verses.mjs` (copied from `archive/`, adds `john.15.12-14`, `luke.10.27-28`, `luke.10.30-37`, `matthew.22.34-40`, `matthew.5.17-19`, `1corinthians.13.13`, `galatians.5.14`).
- s2 logo: "Jesus’" removed (CL); sr-only name is "II Commandments".
- s1b: second picture is Tissot, *Sermon of the Beatitudes* (public domain stand-in; CL's photo is unlicensed), so the two opener panels no longer repeat. Credit in `assets/ASSETS.md`.
- `#s-agape`: opens on the italic line "The essence of these commandments is", which fades; then LOVE first, AGAPE, alternating five crossings, settle stacked, ring of eight as before. Track 400vh. Ground is now blood-red burgundy (`--color_bg-wine` #4a0c16, glow #5c0f1b).
- `#s-complete` (new, between agape and s4): "How complete are these two commandments?" — burgundy with a half-drop repeat of small Latin crosses (`--img_cross` as a mask, `--color_cross-wine`).
- s5: corners line reads "Each Gospel mentions Jesus’ Commandments"; Proceed is a button. Refs: Matthew `matthew.22.34-40`, Luke `luke.10.27-28`, John `john.15.12-14` + `more:['john.15.9-17']`.
- The passage (was `#s6`) is now a popup over the Gospels section: door animation finishes, panel opens (corners: Proceed). Close button / Esc / backdrop; focus returns to the door or Proceed; body scroll locked; doors reset on close; `more` refs render under the main passage with their own heading. `#s6` no longer exists.
- `#s-verses`: matte gold (`--color_gold-matte` #b8974a) with darker-gold crosses; opens on "…but the greatest of these is love." / 1 Corinthians 13:13 (`data-copy` + `data-ref`), then one featured verse per full-height step (Romans 13:8-10, Galatians 5:14), then a quiet "More on these two commandments" row (Matthew 5:43-48, Matthew 5:17-19, Luke 10:30-37, James 2:8, 1 John 4:7-12, 1 John 4:19-21, Galatians 5:13-14). John 15:9-17 left the list. Drifting grid removed; reading panel kept (moved to body level so it sits above the corner controls).
- `#s-watch` (new, between s5 and s-verses): a CSS/SVG 1960s-70s walnut television. Dark until powered on (screen or power button); then a youtube-nocookie iframe; channel up/down with a static flash (off under reduced motion); power off removes the iframe; "Watch on YouTube" fallback link; powering on pauses the page music.
- s7 finale: the hover-resizing split is gone. Two equal halves, everything always visible; hover/focus only inverts colour (ink ground, paper text, pill inverts) and nudges the drawing 8px. Stacks under 640px.
- Music: `cinematic` (`cWBi3L-Nx9A`) is first and the default.

New data shapes: `TC_DATA.gospels[].more` (array of ref ids shown under the main passage); `TC_DATA.related[].featured` (true = its own full-height step, in array order); `TC_DATA.tv[] = { id, label, yt, start }`; `TC_DATA.musicSets.cinematic = { label, ids }`.

Open questions: which verses CL wants featured (we chose Romans 13:8-10 and Galatians 5:14); which videos go on the TV, and whether those films allow embedding (the YouTube link is the fallback); a licensed image for panel 2; evangelist symbol art for the corners is still placeholder.
