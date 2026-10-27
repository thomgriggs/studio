# Vaughn Law Site Inventory (the "before")

Oct 22–26, 2026 · Thom Griggs · live doc: https://claude.ai/artifact/CuhFj8PvUMbsuqkgbZN3kM

## Call notes — 23 Oct 2026 (intro call with Danielle)
- Practice is real estate law and estate planning. Real estate is the core. Title is not the focus; the site's "Order Title" framing is wrong for them.
- Estate planning is the growth area; that's what she wants the site to bring in. Wants SEO for estate planning + AI search visibility.
- Had the site "for years and years." TitleTap built it when they needed a presence fast; title was TitleTap's business, not theirs.
- They cannot edit the site. All content is owned by TitleTap; every change goes through the vendor.
- YouTube: https://www.youtube.com/@Vaughnlawstpete · Facebook: https://www.facebook.com/DVaughnLaw
- Her concerns in order: (1) real estate core, grow estate planning (2) SEO + AI readability (3) consolidate content with redirects (4) refresh design
- Platform decided 2026-10-26: fresh Squarespace install. Content only carries over.
- Next: deep dive Fri 30 Oct, 11:30, Google Meet — Thom, Jeff Dela Cruz, Danielle, Whitney

## Snapshot (26 Oct 2026 content pull, 245 URLs)
| Type | Count | Notes |
|---|---|---|
| Pages | 71 | Services spread across three overlapping trees |
| Posts | 170 | ~100 stock 2014–17 title-company FAQ library; ~65 Danielle's own (2023–26) |
| Events | 4 | Eventin; AI Summit placeholder now 404s |
| Categories | 18 | 13 are stock buckets; Uncategorized has 2026 posts |
| Tags | 2 | `17` and `video` |

Platform: WordPress + Divi on TitleTap's multisite (`localwebdesigncompany.com/vaughnlaw/`). Some images serve from that host.

### What the full content pull showed
- 244 of 244 pages: no meta description, no keywords. Every title = *Page – St. Petersburg, Tampa FL, Pinellas County | Vaughn Law, PLLC*. No title says St. Pete Beach. H1 = page name on 232 pages.
- Estate planning hub: 88 words of its own copy. Title services: 79. The two most important pages are the thinnest.
- A shared 512-word "How Can We Help You / About Vaughn Law / Fast and Accurate Closing / Get in touch" block is bolted to service pages as five H2s; real content sits at H4/H5. "Get in touch with us" is an H2 on 56 pages. Team page: 25 H2s, one empty. Posts: an empty H4 and "Get in Touch" as H3.
- Duplicates: litigation and business entity formation are 95–99% identical under `/real-estate-law/` and `/investors/`. Landlord-tenant (×4) and land trusts: the `/real-estate-law/` versions are the real ones (4,800 / 7,500 chars); the others are stubs.
- Body mentions: "title" 212, "closing" 104, "estate planning" 49, "probate" 36. But 17 of 22 posts in 2026 are estate planning. The pages say title company; the writing says estate planner.
- 364 of 1,018 images lack alt text. Two genuine double-posts on 27 Mar 2026. `/events/` has one word. Eight event/taxonomy pages are 15-word shells. 9 posts branded Vaughn Voyage.
- "Video library" = 112 stock FAQ articles + 4 YouTube Shorts; the stock posts have Wistia-hosted videos.
- Post median 161 words; 113 of 170 under 300. Page median 262.

### Duplicate / residue / original
| Bucket | Roughly | Call |
|---|---|---|
| Duplicate (same service written more than once) | ~20 pages, ~5 posts | keep one, redirect |
| Template residue (stock FAQ library, portfolio, Divi demo, old events pages, empty taxonomies) | ~100 posts, ~10 pages | cut |
| Original and helpful (Vaughn Voyage + 2023–26 articles, estate planning section, homestead, deeds, foreclosures, team, about, workshops, booklets, forms, calculators) | ~40 pages, ~65 posts | keep, reorganize |

Pre-2023 is template; post-2023 is the firm.

## Performance, search and AI readiness (23 Oct 2026)
| Page | Device | Perf | A11y | BP | SEO | LCP | TBT |
|---|---|---|---|---|---|---|---|
| Home | Mobile | 41 | 76 | 77 | 77 | 31.2 s | 750 ms |
| /estate-planning/ | Mobile | 50 | 76 | 77 | 77 | 31.1 s | 430 ms |
| /title-services/ | Mobile | 41 | 76 | 77 | 77 | 31.0 s | 790 ms |
| Home | Desktop | 60 | 76 | 77 | 77 | 0.7 s | 1,320 ms |

- The 31 s LCP is the template: full-screen hero with no size hints, 6 MB page, ~1.5 MB unused JS (Divi), 17 long tasks, no caching headers, five non-composited animations.
- Field data: No Data on every page (not enough traffic). Google's fetchers timed out on robots.txt and llms.txt; 2 of 6 runs "unable to resolve."
- Every page: no meta description, missing alt text, iframes without titles, `user-scalable=no`, no `<main>`, headings out of order, contrast failures, no CSP/HSTS, deprecated API warning.
- Ranking: "real estate attorney St Pete Beach" / "estate planning attorney St Pete Beach" return only directories. The firm's own name surfaces Avvo, The Fund, Cornell before the site. No schema. robots.txt lists 101 sitemaps for other firms on the multisite. Logo alt text is another firm's ("Raleigh, North Carolina Law Firm | Jackson Law").
- Agentic Browsing 1/3: malformed accessibility tree, no llms.txt.

## Who the site is for
Both practices meet at the house. Real estate triggers: buying/selling (often FSBO), deed changes, a tenant, inherited/co-owned property, investor work, a title problem. Estate planning triggers: a parent died, moved to Florida, new baby/marriage/divorce, retirement or a diagnosis, a business. Readers are anxious about cost and about being talked down to. Local picks: proximity (name the beach towns), a face they've seen (YouTube, workshops), board certification, reviews, realtor referrals.

## Comparables
- **ALH Law Group** (alhlaw.com) — Thom's pick; tone; guides as a first-class section.
- **Lulich & Attorneys** (lulich.com, Vero Beach) — structural twin; consult form with practice picker; closing + cost guides; simple will questionnaire.
- **Alper Law** (alperlaw.com) — three-step process on every service page.
- **Cairns Law** — accordion FAQs.
- **Barnes Walker** (Bradenton) — routing by audience; separate inquiry paths; realtor page.
- **DeLoach, Hofstra & Cavonis** (Seminole) — webinar registration, newsletter, free reports; nav overloaded.
- **Montañez Law** (Tampa) — nearly identical service list, filed once, flat.
- National with the same mix (not design references): Herring Law (Fort Worth), Cushing & Dolan (Boston), a Woburn MA estate firm (Google reviews widget, "estate plan check-up" lead magnet). The pairing is rare outside Florida and attorney-closing states.
- Design: avoid law-firm "best of" lists built on sticky phone numbers; look at coastal hospitality for palette and editorial sites for how the articles should feel.

## Design direction
A small, expert, local firm with a founder who writes. Gulf Coast light, modern edge, the writing as the visual. Not navy-and-gold. One typeface pairing, large · real photos only (October 2026 shoot exists on the site) · five nav items + Contact button · one-screen service pages · articles as a magazine · coastal palette from the building's blue · trust at the top. Three concepts built 2026-10-26: 01 Gulf Coast, 02 Editorial, 03 Modern Edge (`design/concepts/`).

## Facebook and the workshop
- Facebook: 599 followers, posts every 1–2 days (stock-graphic estate planning tips), 3 reviews, address/phone/email set, links to dvaughnlaw.com but posts don't link to articles. Don't embed a feed; make the site feed Facebook. Priorities instead: Google Business Profile, reviews, Danielle's LinkedIn, Nextdoor.
- Workshop: *Estate Planning: How to Protect Your Home, Savings & Family From Costly Mistakes* — free, 2 hours, in person, Florida Lithuanian Center, 4880 46th Ave N, St. Petersburg. Oct 8 10 AM and Nov 4 1 PM 2026. The classic estate-planning seminar funnel; one page deep today; event plugin shows wrong dates (Apr 24 / Oct 26, UTC).

## Open questions for Danielle
Is /subscription-plans/ real? · Is /order-title/ still used? · /best-practices/ and /pcclb/? · Where do workshop registrations go? · Who posts the blog, from where? · Who owns the domain/DNS and Search Console? · Does email run through TitleTap's DNS? · Board certification area/year · Photo rights for the October shoot · Workshop attendance and conversion; is it recorded?
