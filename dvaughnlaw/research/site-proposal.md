# Vaughn Law Site Proposal

Oct 26, 2026 · Thom Griggs · live doc: https://claude.ai/artifact/RD9Z15AiB3PVwQXaQ3jvXm

What the new dvaughnlaw.com should be, built from the content snapshot of 26 Oct 2026 (245 URLs). Companion to the Site Inventory doc, which is the "before."

## Positioning and the funnel

The site should say one thing: **Real estate and estate planning attorneys on St. Pete Beach.** Real estate is the core; estate planning is the growth area; title work is a service inside real estate, not the front door.

What the snapshot showed that this fixes: the current site mentions "title" 212 times and "estate planning" 49, while 17 of Danielle's 22 posts this year are about estate planning. The pages say title company; the writing says estate planner. The new structure makes the pages match the writing.

Every visitor should be able to do this in three clicks:

1. **Land** on a page that says what the firm does and where (home, or any service page from search).
2. **Pick their situation** — buying or selling, a deed, a tenant, a parent's estate, a move to Florida.
3. **See the process and how it starts** on a one-screen service page, with the articles and videos underneath as proof.
4. **Start** — one button, same on every page: schedule a consultation.

The current site has none of this. Its three service trees route the same services three ways, the hub pages are 79–88 words, and there is no form anywhere. 245 URLs become about 45 pages plus the articles, every one with a job.

**Platform: a fresh Squarespace site.** The firm owns and edits it; nothing from the TitleTap install is reused except the content. Redirects go in as URL Mappings; the ~65 kept posts come in through the WordPress importer; contact, workshop registration, realtor file-send and newsletter are Squarespace Forms, Events and Email Campaigns; `LegalService` and `Person` schema sit in site-wide code injection, article and video schema per page; the site is built on a trial and the domain is pointed at cutover; the title premium and net sheet calculators are rebuilt as code blocks.

## Proposed sitemap

Five sections. Real Estate and Estate Planning carry the weight; About and Resources support them; Contact is a button on every screen, not a destination. Nothing changes in the nav as you move around.

```
Home
├── Real Estate
│   ├── Buying and Selling
│   ├── Deeds and Title
│   ├── Landlord and Tenant
│   ├── Investors
│   └── Disputes
├── Estate Planning
│   ├── Wills and Trusts
│   ├── Probate
│   ├── Powers of Attorney and Health Care
│   ├── Moving to Florida
│   └── Business Succession
├── About
│   ├── The Firm
│   ├── Our Team
│   ├── Workshops and Events
│   └── For Realtors
├── Resources
│   ├── Articles (by topic; Vaughn Voyage series landing)
│   ├── Videos
│   ├── FAQ
│   └── Guides and Calculators
└── Contact (button)
```

URL shape: `/real-estate/buying-and-selling/`, `/estate-planning/probate/`, `/about/our-team/`, `/resources/articles/`. Articles keep short root slugs so the 65 real posts can redirect one-to-one.

## Page by page

### Home — `/`
- Job: say what the firm does and where; route to the two practices
- H1: Real estate and estate planning attorneys on St. Pete Beach
- H2s: What we help with (two cards) · Why Vaughn Law · From the firm (3 latest) · Upcoming workshop · Contact
- 250–350 words, one photo of the office. CTA: Schedule a consultation; secondary: workshop.

### Real Estate hub — `/real-estate/`
- H1: Real estate law in St. Pete Beach and Pinellas County
- H2s: Buying or selling · Deeds and title · Landlords · Investors · Disputes · Why an attorney · For realtors · How it starts
- 400–600 words. Merges `/real-estate-law/`, `/real-estate-law/practice-areas/`, `/services/`, `/investors/legal-services/`.

### Real Estate sub-pages (5)
| Page | URL | Merges | H2 outline |
|---|---|---|---|
| Buying and Selling | `/real-estate/buying-and-selling/` | title-services, order-title, digital-closings, investors/real-estate-closings, practice-areas/real-estate-transactions, services/consumers|lenders|builders | Attorney closings vs title company · What a closing costs · Remote online notary · Contract review · For buyers · For sellers · How it starts |
| Deeds and Title | `/real-estate/deeds-and-title/` | deeds-and-conveyances, homestead (its 1,900-word FAQ becomes the body), quiet title | Adding/removing someone · Lady Bird deeds · Home into a trust · Homestead · Quiet title · How it starts |
| Landlord and Tenant | `/real-estate/landlord-tenant/` | the long practice-areas/landlord-tenant is the base; investors copy and /landlordtenant/ are stubs | Evictions · Notices · Leases · 2025 flood disclosure · How it starts |
| Investors | `/real-estate/investors/` | investors/*, land trusts (long version), entity formation (99% identical copies), tax deeds, private lender, contracts | LLCs and land trusts · Auctions · Private lending · Contracts · 1031/FinCEN · How it starts |
| Disputes | `/real-estate/disputes/` | litigation (95% identical copies), foreclosures, commercial, code enforcement, partition | Partition · Contract disputes · Foreclosure defense · Code enforcement · Contractor liens · How it starts |

### Estate Planning hub — `/estate-planning/`
- Today 88 words; becomes 600–900, the best page on the site.
- H1: Estate planning attorneys in St. Pete Beach
- H2s: Who this is for (moved to Florida / parent died / kids / retirement / business) · Wills and trusts · Probate · POA and health care · Your home is part of the plan · What it costs · Workshops · Recent articles

### Estate Planning sub-pages (5)
| Page | URL | Merges |
|---|---|---|
| Wills and Trusts | `/estate-planning/wills-and-trusts/` | estate-planning-documents (1,300 words), wills-trusts-and-estates, important-terms (2,000 words → glossary) |
| Probate | `/estate-planning/probate/` | probate, ancillary-probate |
| Powers of Attorney | `/estate-planning/powers-of-attorney/` | new; from the documents page |
| Moving to Florida | `/estate-planning/moving-to-florida/` | new — the most common Pinellas trigger, nobody has a page for it |
| Business Succession | `/estate-planning/business-succession/` | new; entity formation + the succession posts |

### About (4)
The Firm `/about/` · Our Team `/about/our-team/` (25 H2s → one per person) · Workshops and Events `/about/workshops/` (person-workshops, events, Eventin pages) · For Realtors `/about/for-realtors/` (services/realtors, cyber-security, best-practices)

### Resources (4)
Articles `/resources/articles/` (65 posts by topic) · Videos `/resources/videos/` (the YouTube channel; old "video library" cut) · FAQ `/resources/faq/` (20–30 Qs, accordion, FAQPage schema) · Guides and Calculators `/resources/guides/` (closing guide, cost, what to bring, two calculators, booklets, forms)

### Utility
`/contact/` · `/privacy-policy/` · `/disclaimer/` · `/about/careers/` if wanted · `/subscription-plans/` needs a decision.

**Total: about 24 pages plus 65 articles**, down from 71 pages and 170 posts.

## Redirect map (71 current pages)

301 for everything; nothing 404s. Keep = same content, new URL. Merge = copy folds into target. Retire = redirect only.

| Current | Action | New |
|---|---|---|
| `/` | Keep | `/` |
| `/real-estate-law/` | Keep | `/real-estate/` |
| `/real-estate-law/practice-areas/` | Merge | `/real-estate/` |
| `/services/` | Merge | `/real-estate/` |
| `/services/consumers/` | Merge | `/real-estate/buying-and-selling/` |
| `/services/lenders/` | Merge | `/real-estate/buying-and-selling/` |
| `/services/builders/` | Merge | `/real-estate/buying-and-selling/` |
| `/services/commercial/` | Merge | `/real-estate/investors/` |
| `/services/realtors/` | Merge | `/about/for-realtors/` |
| `/title-services/` | Merge | `/real-estate/buying-and-selling/` |
| `/order-title/` | Merge | `/real-estate/buying-and-selling/` |
| `/digital-closings-remote-online-notary/` | Merge | `/real-estate/buying-and-selling/` |
| `/real-estate-law/practice-areas/real-estate-transactions/` | Merge | `/real-estate/buying-and-selling/` |
| `/investors/legal-services/real-estate-closings/` | Merge | `/real-estate/buying-and-selling/` |
| `/investors/legal-services/contract-preparation-and-review/` | Merge | `/real-estate/buying-and-selling/` |
| `/real-estate-law/deeds-and-conveyances/` | Merge | `/real-estate/deeds-and-title/` |
| `/real-estate-law/homestead/` | Merge | `/real-estate/deeds-and-title/` |
| `/real-estate-law/practice-areas/landlord-tenant/` | Keep | `/real-estate/landlord-tenant/` |
| `/investors/legal-services/landlord-tenant/` | Retire | `/real-estate/landlord-tenant/` |
| `/landlordtenant/` | Retire | `/real-estate/landlord-tenant/` |
| `/investors/` | Keep | `/real-estate/investors/` |
| `/investors/legal-services/` | Merge | `/real-estate/investors/` |
| `/real-estate-law/practice-areas/land-trusts/` | Merge | `/real-estate/investors/` |
| `/investors/legal-services/land-trusts/` | Retire | `/real-estate/investors/` |
| `/real-estate-law/practice-areas/business-entity-formation/` | Merge | `/real-estate/investors/` |
| `/investors/legal-services/business-entity-formation/` | Retire | `/real-estate/investors/` |
| `/investors/legal-services/foreclosure-auctions-and-tax-deed-sales/` | Merge | `/real-estate/investors/` |
| `/investors/legal-services/private-lender-foreclosure/` | Merge | `/real-estate/investors/` |
| `/real-estate-law/practice-areas/litigation/` | Merge | `/real-estate/disputes/` |
| `/investors/legal-services/litigation/` | Retire | `/real-estate/disputes/` |
| `/real-estate-law/practice-areas/foreclosures/` | Merge | `/real-estate/disputes/` |
| `/real-estate-law/practice-areas/commercial/` | Merge | `/real-estate/disputes/` |
| `/investors/legal-services/code-enforcement-violations/` | Merge | `/real-estate/disputes/` |
| `/real-estate-law/practice-areas/bankruptcy/` | Retire | `/real-estate/disputes/` |
| `/real-estate-law/pcclb/` | Retire | `/real-estate/disputes/` |
| `/estate-planning/` | Keep | `/estate-planning/` |
| `/estate-planning/estate-planning-documents/` | Merge | `/estate-planning/wills-and-trusts/` |
| `/estate-planning/important-terms/` | Merge | `/estate-planning/wills-and-trusts/` (glossary) |
| `/real-estate-law/practice-areas/wills-trusts-and-estates/` | Merge | `/estate-planning/wills-and-trusts/` |
| `/estate-planning/probate/` | Keep | `/estate-planning/probate/` |
| `/estate-planning/ancillary-probate/` | Merge | `/estate-planning/probate/` |
| `/subscription-plans/` | Decide | `/estate-planning/` unless kept |
| `/about/` | Keep | `/about/` |
| `/about/our-team/` | Keep | `/about/our-team/` |
| `/about/careers/` | Keep | `/about/careers/` |
| `/person-workshops/` | Merge | `/about/workshops/` |
| `/events/` | Merge | `/about/workshops/` |
| `/etn/` + 2 workshop event pages | Merge | `/about/workshops/` |
| `/events/my-bookings/`, `/events/tags/`, `/events/categories/`, `/events/locations/` | Retire | `/about/workshops/` |
| `/etn_category/`, `/etn-tags/`, `/etn-speaker-category/` | Retire | `/about/workshops/` |
| `/cyber-security/` | Merge | `/about/for-realtors/` |
| `/best-practices/` | Merge | `/about/for-realtors/` |
| `/blog/` | Keep | `/resources/articles/` |
| `/blog-old/` | Retire | `/resources/articles/` |
| `/resources/` | Keep | `/resources/guides/` |
| `/resources/video-library/` | Retire | `/resources/videos/` |
| `/resources/forms-docs/` | Merge | `/resources/guides/` |
| `/booklets/` | Merge | `/resources/guides/` |
| `/calculators/` | Merge | `/resources/guides/` |
| `/resources/closing-calculators/` | Retire | `/resources/guides/` |
| `/calculators/title-premium/` | Keep | `/resources/guides/title-premium-calculator/` |
| `/calculators/net-sheet/` | Keep | `/resources/guides/net-sheet-calculator/` |
| `/contact/` | Keep | `/contact/` |
| `/privacy-policy/` | Keep | `/privacy-policy/` |
| `/disclaimer/` | Keep | `/disclaimer/` |
| `/portfolio/` | Retire | `/` |
| `/layouts-sections-modules/` | Retire | `/` |

Count: 17 keep, 33 merge, 20 retire, 1 decision.

## Articles and video

| Group | Count | What happens | Redirect |
|---|---|---|---|
| Danielle's articles 2023–2026 | ~65 | Keep; same root slug; topic, service page, meta description, H2s, paired video | one-to-one |
| `-2` duplicates (27 Mar) + duplicate workshop | 3 | Delete the copy | → original |
| Stock FAQ library 2014–17 | ~100 | Retire; still-relevant questions become FAQ entries in her words | → `/resources/faq/` |
| Stock categories | 13 | Delete | → `/resources/articles/` |
| Tags `17`, `video` | 2 | Delete | → `/resources/articles/` |

Topics replace categories: Buying and Selling · Deeds and Title · Landlord and Tenant · Investors and Disputes · Estate Planning. "Vaughn Voyage" stays as a series label with its own landing and a newsletter signup.

### Video — the YouTube channel (27 videos, 17 subscribers, pulled 26 Oct 2026)

**Placement rule: a video is never its own post. It sits where its subject lives** — top of the matching article, matching section of the service page, and the Videos index. One embed, three doors.

| Video | Length | Views | Goes on |
|---|---|---|---|
| Danielle Vaughn, Board Certified Real Estate Attorney | 1:39 | 43 | Home hero, Our Team, The Firm |
| What to expect as a client | 1:36 | 7 | How-it-starts block, site-wide |
| Thank you for scheduling — what happens next | 0:40 | 13 | `/contact/thanks/` |
| Why Vaughn Law | 1:36 | 57 | The Firm |
| Florida landlord-tenant laws explained | 5:25 | 318 | Landlord and Tenant (top) + article |
| Eviction steps after court judgment (Short) | — | 5.5K | Landlord and Tenant — lead with it |
| Never accept partial rent (Short) | — | 105 | Landlord and Tenant + FAQ |
| What happens if your tenant can't pay (Short) | — | 57 | Landlord and Tenant |
| How to serve notice of non-payment | 1:11 | 20 | Landlord and Tenant + article |
| Why your landlord can raise rent | 1:09 | 20 | Landlord and Tenant + article |
| Facing a lawsuit: the litigation process | 1:49 | 138 | Disputes (top) |
| Real estate litigation explained | 1:19 | 89 | Disputes + article |
| Foreclosure property pitfalls | 5:01 | 33 | Disputes + Deeds and Title + article |
| Deed transfers explained | 1:32 | 38 | Deeds and Title + article |
| Florida homestead law explained | 0:58 | 69 | Deeds and Title + article |
| Why your spouse must sign the mortgage | 1:16 | 26 | Buying and Selling + article |
| What is title insurance | 3:02 | 20 | Buying and Selling + article + FAQ |
| Funding your trust | 1:34 | 24 | Wills and Trusts + article |
| Your family deserves more than a vacation plan | 1:05 | 3 | Estate Planning hub |
| The importance of estate planning | 2:35 | 15 | Estate Planning hub + article |
| Why you need estate planning (Short) | — | 27 | Estate Planning hub |
| How to avoid probate (Short) | — | 43 | Probate + article |
| What is probate and how to avoid it | 2:14 | 8 | Probate + article |
| What is a will | 0:58 | 13 | Wills and Trusts + FAQ |
| What is a living will | 1:31 | 17 | Powers of Attorney + FAQ |
| Durable power of attorney explained | 0:59 | 50 | Powers of Attorney + article |
| How to get power of attorney | 2:22 | 11 | Powers of Attorney |

Landlord-tenant is the only subject with traffic (the eviction Short alone outdraws everything else). Estate planning videos average under 20 views because the titles are SEO strings, not questions. The five to record next (Danielle, 60–90 s, one question each): Do I need a will or a trust? · What is a Lady Bird deed? · I just moved to Florida — is my will still good? · What does a closing with an attorney cost? · How long does probate take in Florida?

Every embed gets `VideoObject` schema; author markup points to Danielle's `Person`.

### Article standard
Title ≤60 chars where possible · 150-char meta description · H2 every 200–300 words · link to its service page in the first paragraph · two related articles at the end · author Danielle · How-it-starts block above the footer.

## Metadata, headings and schema

Today: 0 of 244 pages have a meta description; every title is one template; no title says St. Pete Beach; "Get in touch with us" is an H2 on 56 pages while content sits at H4/H5.

### Titles and descriptions
| Page type | Title (≤60) | Description (≤155) |
|---|---|---|
| Home | Real Estate & Estate Planning Attorneys – St. Pete Beach │ Vaughn Law | what, where, one reason to call |
| Hub | Real Estate Attorney St. Pete Beach │ Vaughn Law | practice in one sentence + situations |
| Service | Lady Bird Deeds & Deed Transfers – St. Pete Beach │ Vaughn Law | the question + how it starts |
| Article | headline │ Vaughn Law | first sentence, tightened |
| Team | Danielle Vaughn, Board Certified Real Estate Attorney │ Vaughn Law | role + credential + one human line |

Suffix is `│ Vaughn Law`. St. Pete Beach on everything; Pinellas/St. Petersburg on hubs and firm page.

### Headings
One H1 per page (the topic, not the firm name) · H2 sections, H3 subsections, nothing deeper on service pages · contact block, firm blurb and How-it-starts are components (`<aside>`), not outline headings · articles: H2 every 200–300 words, no empty headings · team: one H2 per person, credentials as H3.

### Schema (JSON-LD)
Every page: `LegalService` (address, phone, hours, `areaServed` = St. Pete Beach, Treasure Island, Gulfport, Madeira Beach, Tierra Verde, St. Petersburg, Pinellas County), `WebSite`, `BreadcrumbList` · Team: `Person` with `jobTitle`, `hasCredential`, `sameAs` · Articles: `Article` with author → Person, dates · Videos: `VideoObject` · FAQ: `FAQPage` · Workshops: `Event`.

### AI readability
`llms.txt` at root · clean landmarks, alt text on every image (364 of 1,018 missing today), no `user-scalable=no` · each service page answers who/where/what/how it starts in its first 100 words.

### Images
Alt text everywhere; hero images with width/height, srcset, WebP under 200 KB — the fix that takes mobile LCP from 31 s to under 3.

## Internal linking rules

1. Home links to both hubs, Our Team, Workshops, three articles. Nothing else from the body.
2. Each hub links to all its sub-pages in the body, plus 2–3 articles. Hubs don't link to each other except via nav.
3. Each service page links up to its hub in the first paragraph, across to 1–2 siblings where subjects overlap, down to every article in its topic.
4. Each article links up to its service page in the first 100 words and to two related articles at the end.
5. Every page carries the same How-it-starts block with one link: `/contact/`.
6. Our Team links Danielle to Estate Planning and Real Estate; Whitney to Disputes.
7. For Realtors links to Buying and Selling and the guides, nowhere else.
8. Anchor text is the page's topic, never "click here."
9. No orphan pages — every page reachable from a body link.
10. Breadcrumbs on every page below Home, with `BreadcrumbList`.

The intersections to build on purpose: Deeds and Title ↔ Wills and Trusts (funding a trust, Lady Bird deeds); Probate ↔ Disputes (inherited property, partition); Moving to Florida → Deeds and Title (homestead). That's "the property lawyer for your family" expressed in structure.
