# Design inventory: the real material that exists

What a designer has to work with, from the crawl (live reliancecpa.com, 2026-11-05) and from `concept-02/assets/`. Every image listed was opened and looked at. Downloaded copies for review are in the session scratchpad (`.../scratchpad/reliance/`), not in the project.

## Logo and brand

| Item | Where | Notes |
|---|---|---|
| Live logo | `https://www.reliancecpa.com/wp-content/themes/relianceconsulting/images/logo.png` | PNG 363 x 79, transparent. Blue "R" mark in a rounded square plus the word RELIANCE in a serif (alt text: "Reliance Consulting Logo"). |
| concept-02 logo | `concept-02/assets/reliance-logo.png` | Byte-identical to the live file (same md5). So concept-02 has the real logo, at its only size. Low resolution for retina; ask the firm for a vector or large PNG. |
| App icon | `https://www.reliancecpa.com/wp-content/uploads/app-logo3.png` (also app-logo, app-logo1, app-logo2) | The "R" mark on blue, used on the live /app page. |
| Other theme art | `.../themes/relianceconsulting/images/`: `cta.png` (293 x 96 sidebar call-to-action), `favicon.ico`, social icons (facebook, twitter, linkedin, google-plus, wordpress) | The icons are 2011-era; replace. |
| Brand blue | not stated anywhere | Sampled from the logo: dominant blue about `#035791`, lighter tints `#417CA5`, `#699ABD`. A sample, not a brand guide. The plan's open question (the blue hex) is still open; ask Kim. |

## People photos

On the live site, only `/staff-profiles.htm` has people photos: 5 studio portraits, each 200 x 267 px (small), dark grey backdrop, 2011 upload folder.

| Person | Role on live page | URL |
|---|---|---|
| Jamie Partin | Staff Accountant | `http://www.reliancecpa.com/wp-content/uploads/2011/12/jamie-partin.jpg` |
| Briana McNulty | Office Administrator & Billing Manager | `.../2011/12/briana-mcnulty.jpg` |
| Kim Nguyen | Staff Accountant | `.../2011/12/kim-nguyen.jpg` |
| Nicole Frenier | Staff Accountant | `.../2011/12/nicole-frenier.jpg` |
| Tara Govindaraju | Accounting Manager | `.../2011/12/tara-govindaraju.jpg` |
| Valerie Stickeler | Certified Public Accountant | no photo on the page |

Team bios (live, 2011 copy): each has Professional Experience, Education and a Personal line. Start dates: Jamie May 2005, Briana 2006, Nicole July 2007, Kim June 2008, Valerie June 2008 (CPA); Tara "last two decades", joined with her husband Raju. Bios are 5-year-old to 15-year-old facts (e.g. "currently enrolled", "plans to attend university"); they need the firm's review before reuse. Email addresses (first-name@reliancecpa.com) are public on the page.

There is no group team photo and no photo of the managing partner on the live site.

### concept-02 people assets

| File | Size | Who / what | On the live staff page? |
|---|---|---|---|
| `kim-m-nguyen.png` | 800 x 800 | Studio portrait of a woman with long dark hair, dark blazer, grey backdrop; modern and high quality. Shown in concept-02 as "Partner at Reliance Consulting LLC, Kim M. Nguyen". | A **Kim Nguyen** is on the live page as Staff Accountant with a different, 2011 photo (the person looks the same to me; confirm it is the same Kim). The live page does not call her a partner. The plan calls Kim the owner. |
| `amol-nirgudkar.png` | 200 x 267 | Man, older, shirt and tie, dark backdrop (looks like the same photo session style as the live portraits). | **No.** Amol Nirgudkar, CPA is named as "managing partner of Reliance Consulting LLC" in article bylines across the live site, and has a bio only on the veterinary page (dropped). Photo source unknown. |
| `govindaraju-rudrapatna.png` | 200 x 225 | Man with glasses, dark jacket, indoor warm background (a snapshot crop). | **No.** There is no Govindaraju Rudrapatna anywhere in the crawl. The only link is Tara Govindaraju's bio: "joined the firm along with her husband Raju". |

The home page of concept-02 lists "2 Founding CPAs"; the crawl names no founders.

## Office and place photos

- **Live site: none.** No office, building, reception or team-at-work photo. The Contact page has only a Google map embed.
- concept-02 has `hero-building.jpg` (1600 x 1067, low-angle glass skyscrapers, grey sky), `tampa.jpg` (1600 x 901, Tampa skyline with PNC and Truist towers and palms), `consulting-office.jpg` (1200 x 801, empty modern office corridor), `team-meeting.jpg` (1200 x 800, two people high-fiving over a laptop in a brick-walled office), `tax-planning.jpg` (1200 x 801, hands and laptops over a handwritten plan) and `bookkeeping.jpg` (1200 x 689, tax forms, calculator phone and envelope flat-lay). All six look like free stock photography (Unsplash style); no license note is recorded. None shows Reliance, its people or its office. `tampa.jpg` is the only one tied to the place.
- `home-background.mp4` (662 KB): looping background video used by concept-02's home hero; not inspected frame by frame; provenance unknown.

## The 6 home-page slider images (live)

All 940 x 272 px JPEGs (`.../themes/relianceconsulting/images/slide1.jpg` to `slide6.jpg`, Photoshop-exported 2016-05-19), a Nivo slider with the text baked into the picture. Order and link are from the page's markup.

| # | What it shows | Links to | Stock? | Use now |
|---|---|---|---|---|
| 1 | "Introducing... BackOffice" logo lockup on a grey panel; man in a white shirt using a tablet; bullets "Increase Your Revenues / Enhance Your Margins / Protect Your Assets", "Watch video" button | /reliance-consulting-backoffice | Stock photo of the man; the lockup is the firm's | Replace: text is baked in. The BackOffice wordmark is reusable if supplied separately. |
| 2 | Two yellow dice reading Yes / No / Maybe on a dark slate; "Good decisions are keys to success. We help you make them." | home #video | Stock | Not needed; the line is a copy source. |
| 3 | Man and woman smiling at a laptop; "Save time & streamline your workflow: cloud-based software, privacy protection, electronic storage. Our client portal is FREE for all new accounts" | /reliance-consulting-netclient-portals | Stock | Claim "FREE for all new accounts" needs confirming (see questions). |
| 4 | Blue app icon (the R mark) over a colourful grid of phone-app tiles and a fingertip; "Android, iPad, iPhone apps: access financial statements, tax returns, bank statements, legal documents" | /app | Stock backdrop with the firm's app icon | Not reusable as is. |
| 5 | Smiling man in a white coat in a dental office; "Dental advisory services" | /dental-cpa | Stock | **Drop** (no dental section). |
| 6 | Woman smiling with a Yorkshire terrier; "Veterinary CPA services" | /veterinary-cpa | Stock | **Drop** (no veterinary section). |

Service pages each carry one small stock photo (about 300 px wide, 2011 upload folder: calculator, couple with an agent, card payment, shopfront, a maze with a dollar sign). They are generic and too small for a modern layout; 92 distinct image files are used across the 98 IN pages, most of them these thumbnails.

## Videos (4 on the live site)

| YouTube id | Title (YouTube) | Live page | Status |
|---|---|---|---|
| `GRQm2WMPdmI` | Tampa CPA \| Business Growth Strategies (813) 931-7258 | home | IN. Used on the proposed home. |
| `x2YjxCzXPlc` | Tampa CPA, Tampa Accountant -- Enhance Your Profits (813) 931-7258 | /reliance-consulting-backoffice | IN. Used on the BackOffice page and the proposed Resources hub. |
| `qKXaebQvYXM` | Dental CPA Growth Strategies Call: (813) 931-7258 | /dental-cpa | OUT page, drop. |
| `q4KRVaRigsU` | Veterinary CPA - Business Growth Strategies (813) 931-7258 | /veterinary-cpa | OUT page, drop. |

All four are on the channel "Reliance Consulting CPAs" (`https://www.youtube.com/@Reliancecpa`). Titles are phone-number-stuffed; the content of the videos was not viewed. The NetClient page also has a Flash demo (`NetClient_Accnt_looping.swf`) that no modern browser plays; only its screenshot banner (`netclient1.jpg`) is reusable.

## Documents

- "Navigating the Business of Medicine" PDF (918 KB), linked from the firm profile: `http://www.reliancecpa.com/wp-content/uploads/2011/12/navigating-the-business-of-medicine.pdf`. The only downloadable on the site.

## Numbers and facts you can use (all from the crawl)

- Since 1984 (home, firm profile, several articles: "Founded in 1984").
- More than 800 businesses and 1,000 individuals ("over 800 businesses and 1000 individuals" on the firm profile; "Now serving more than 800 businesses and 1,000 individuals" on home).
- "Hundreds of clients" helped with tax problems (IRS page): vague, no number.
- Phone (813) 931-7258, fax (813) 931-5555, kim@reliancecpa.com, address 14499 N Dale Mabry Hwy Suite 179-S, Tampa FL 33618 (map embed says 13940).
- Four industry groups: healthcare and professional, retail (convenience stores, gas stations, franchises), hospitality (hotels, motels), real estate (development, investment, management, mortgage).
- Service area: Hillsborough, Pinellas, Pasco, Polk, Manatee, Sarasota, Hernando and Charlotte counties.
- Do not use: "more than 25 years" and "thousands of businesses" (areas-served page, contradicts the above); concept-02's "42 years" (arithmetic, fine if wanted), "2 Founding CPAs", "1,800+" and the by-decade growth chart (no source).

## What is missing (nothing in the crawl)

Testimonials, reviews or star ratings; client names or logos; case studies; any certification, association (AICPA, FICPA) or partner badge; awards; an owner or managing-partner bio on the live site; a group team photo; office or exterior photos; hours of operation; pricing or fee information (the site says clients are "not burdened by the hourly rates" of other firms but gives none); a process or "what happens next" page; an FAQ; a blog on the site (it is external at reliancecpa.wordpress.com); forms or checklists beyond the first-meeting records list; a secure upload page; a brand guide or hex values; a vector logo.
