# reliancecpa.com content extraction (Liftkit)

Content and SEO data for every page of https://www.reliancecpa.com/, separated from design so it can be reused in new designs.

Crawl date: 2026-11-05. Extraction last run: 2026-11-05.

## Counts

- URLs: 916 (seed list 460 + 448 found only in the sitemaps - 0 seed URLs are not in the sitemaps; 8 discovered by following links)
- Source of each page (live vs preserved fallback copy vs failed): {'live': 909, 'failed': 7}

- HTTP status of crawled URLs: {200: 465, 301: 444, None: 7}
- Failed fetches (no HTML saved): 7
- By type: page: 916
- Main-region blocks by type: a: 51, embed: 6, form: 1, h2: 555, h3: 483, hr: 8, img: 886, ol: 10, p: 2425, table: 2, text: 895, ul: 414
- Image occurrences (images.csv rows, incl. global header/footer): 892; in page main regions: 886 (0 are css-background); `<img>` in main regions with missing/empty alt: 47
- Pages with a meta description: 22; with meta keywords: 0 (of 916)
- Shared blocks (main region, same type + text on more than 10 pages): 8
- Header menu variants: 1 (the nav differs by site section; all are in `_global.json` / `_global.md`)

## Files

| Path | What it is |
|---|---|
| `content/pages/<slug>.json` | One per URL. Full structured content + SEO (schema below). |
| `content/pages/<slug>.md` | One per URL. Front matter + main-region blocks, each prefixed with its element tag. Shared blocks collapsed at the end. |
| `content/_global.json`, `_global.md` | Header (logos with alt, top bar, nav tree + per-section nav variants), footer blocks, and the common blog sidebar. Written once, not repeated in page files. |
| `content/_shared-blocks.json` | Each shared block once, with the number of pages it appears on. |
| `content/seo-full.csv` / `.xlsx` | One row per URL (SEO, Images, Links sheets in the xlsx). |
| `content/images.csv` | One row per image occurrence (page, src, alt, alt_missing, title, width, height, source, region, shared). Global header/footer images are listed with page "(global)" / "(global header)". |
| `content/links.csv` | One row per link in main content (page, text, href, link type, containing block type, shared, note). Link types: internal (reliancecpa.com), external, mailto, tel, other. Notes come from `link_notes` in liftkit.json. Empty-text links and `#` links are omitted. |
| `content/_extract-stats.json` | Machine-readable counts from the last extraction. |
| `content/_layout-analysis.json` | Page layouts (families) and which pages use each; written by `layout.py`. |
| `site/raw/<slug>.html` | Raw downloaded HTML (slug = URL path with `/` as `__`, home = `home`). |
| `site/crawl-log.json`, `site/url-list.json`, `site/sitemaps/` | Per-URL status/redirect log, merged URL list with sitemap-vs-CSV differences, raw sitemap XML. |
| `liftkit.json` | This project's config; scripts live in the shared `liftkit/tools/`. |

## Page JSON schema

```
{ "url", "slug", "type", "status", "redirected_to", "last_modified",
  "seo": { title_tag, meta_description, meta_keywords, canonical, robots, og_title, og_description, og_image,
           twitter_card, lang, json_ld_types[], h1_count },
  "post": { date, author, categories[], tags[] },     // posts only
  "sidebar": "global",                                // present when the page uses the common sidebar in _global.json
  "blocks": [ ... document order ... ],
  "word_count" }                                       // main region, excluding shared blocks
```

Every block has `type`, `region` (main | header | footer | sidebar), optional `component` (Divi module: blurb, accordion, fullwidth_header, sidebar, blog, map, video, social_media_follow...), and `shared: true` when flagged.

| type | fields |
|---|---|
| h1-h6 | text, id?, links[{text, href}] |
| p | text (inline links as `[text](href)`, `**bold**`, `*italic*`), links[] |
| text | bare div/span text with no semantic tag; same fields as p |
| ul / ol | items[{text, links[], children[nested list blocks]}] |
| a | text, href, is_button (standalone link/button outside a paragraph; `href` is "" for `#` buttons) |
| img | src (absolute), alt, alt_missing (attribute absent or empty), title, width, height, link_href?, source (`img` or `css-background`) |
| blockquote | text, links[] |
| table | rows[[cell text]], header (bool) |
| hr | |
| embed | provider (youtube, wistia, vimeo, google-maps, calendly, other), src, title |
| form | note (e.g. "Lawmatics intake", "contact form"); inputs are never extracted |

Notes: `css-background` images come from inline styles, data attributes and Divi's per-module CSS (`.et_pb_section_N{background-image:url()}`); they have no alt, so `alt_missing` is false for them and they are excluded from "images missing alt". Embed `src` for Wistia is `https://fast.wistia.com/embed/medias/<id>`; for Divi maps it is a `google.com/maps?q=lat,lng` URL built from the module's coordinates.

Markdown tags: `[h2]`, `[p]`, `[ul]`/`[ol]`, `[a button]` / `[a]`, `[img]` (ALT MISSING when absent), `[embed youtube]`, `[form]`, `[text]`, with `:component` appended where the block lives inside a Divi module, e.g. `[h5:accordion]`.

## Rerun

From the studio root, with the shared venv (`liftkit/.venv`):

```
LK=liftkit/.venv/bin/python; P=<project dir>
$LK liftkit/tools/crawl.py --project $P              # resumable; skips pages already saved (polite: 1 req/s)
$LK liftkit/tools/crawl.py --project $P --refresh    # re-download everything
$LK liftkit/tools/extract.py --project $P            # re-extract from site/raw (no network)
$LK liftkit/tools/layout.py --project $P             # layout analysis
$LK liftkit/tools/verify.py --project $P             # word coverage: raw main text vs extracted blocks
$LK liftkit/tools/verify_structure.py --project $P   # heading / list / image counts: raw vs extracted
```

## URLs in the sitemaps but not in the seed CSV (448)

- https://www.reliancecpa.com/401k-plans.html/401k-plans/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/529-savings-plan-covers/young-african-american-college-student/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/accrual-accounting/sales-report-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/ad-laws/ad-laws/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/adjusted-gross-income.html/adjusted-gross-income/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/advertising-budget/advertising-budget-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/antitrust-law.html/antitrust-law/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/app/app-logo-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/app/app-logo-3/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/app/app-logo-4/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/app/app-logo/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/april-15-tax-day.html/april-15-tax-day/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/articles.html/bigstock_female_doctor_in_intensive_car_17340602/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/articles.html/cloud/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/articles.html/couple01_isp/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/articles.html/irs-1/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/articles.html/irs/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/articles.html/medical/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/articles.html/money/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/articles.html/money03_isp/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/articles.html/money06_isp/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/articles.html/money10_isp/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/articles.html/obama/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/articles.html/pen_and_money01_isp/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/articles.html/retirement-income/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/articles.html/romney/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/articles.html/secure01_isp/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/audit-help.htm/audit-help/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/audit.html/audit/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/avoid-probate.html/avoid-probate/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/bank-accounts.html/bank-accounts/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/barter-exchanges.html/barter-exchanges/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/basic-valuation-analysis/dentist-chair-and-equipment/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/before-big-purchase/before-big-purchase-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/best-practices.html/best-practices/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/bi-weekly-mortgage.html/bi-weekly-mortgage/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/big-purchase.html/big-purchase/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/bookkeeping-accounting/bookkeeping-acounting/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/bookkeeping.htm/bookkeeping/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/boost-employee-morale/boost-employee-morale/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/bottom-line/bottom-line-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/breakeven-analysis/breakeven-analysis-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/brick-and-mortar-business/newly-finished-small-business-buidling/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/brick-and-mortar/brick-and-mortar-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/budget-discipline/budget-discipline-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/budget-discipline/budget-discipline-3/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-advice.html/business-advice/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-blog/business-blog-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-consultants.htm/business-consultant/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-expenses-tax-deductible/business-expenses-deductible/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-expenses/tax-preparer-3/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-finance-consultant.htm/business-finance-consultant/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-idea.html/business-ideas/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-impediment.html/business-impediment/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-insurance-tips.html/business-insurance-tips/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-lease/c/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-plan.html/business-plan/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-plan/business-marketing-and-planning/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-planning-services.htm/business-planning/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-record-retention.htm/business-record-retention/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-tax-extension.html/business-tax-extension/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-tax.htm/business-tax/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-travel/business-travel-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/business-valuation.htm/business-valuation/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/buying-a-business.html/buying-a-business/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/buying-car.html/buying-car/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/buying-home.html/buying-home/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/buying-life-insurance.html/buying-life-insurance/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/capital-gains.html/capital-gains/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/capital-items/capital-items-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/cash-flow-management.htm/cash-flow-management/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/cash-flow.html/cash-flow/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/ceo.html/ceo/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/changing-business-structure.html/changing-business-structure/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/charitable-contributions.html/charitable-contributions/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/charitable-donations-business-taxes/tax-forms-3/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/charitable-donations-personal-taxes/tax-forms-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/charitable-trust.html/charitable-trust/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/checkup-financial-health.htm/checkup-financial-health/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/child-care-credit.html/child-care-credit/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/child-dependents.html/child-dependent/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/college-savings.html/college-savings/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/college-tax-benefits/college-tax-benefits-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/college-tax-concerns/college-tax-concerns-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/commercial-lease.html/commercial-lease/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/communication-guidelines/communication-guidelines-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/contract-for-deed/senior-home-buyers/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/corporate-divestiture.html/corporate-divestiture/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/corporation.htm/corporation/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/cost-segregation.html/cost-segregation-survey/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/costs-of-consumer-bankruptcy/costs-of-bankruptcy/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/cpa-firm-brooksville-hernando.htm/cpa-firm-brooksville-hernando/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/cpa-firm-lakeland-polk.htm/lakelandfl/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/cpa-firm-pasco-county.htm/pasco-county/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/cpa-firm-sarasota-bradenton.htm/sarasota/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/cpa-firm-stpetersburg-clearwater-pinellas.htm/stpetersburg-clearwater-pinellas/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/cpa-firm-tampa-brandon-hillsborough.htm/tampa-brandon-hillsborough/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/cpa-firm-tampa-stpetersburg-clearwater.htm/tampa-stpetersburg-clearwater/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/credit-card-offer.html/credit-card-offer/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/credit-card-rewards/credit/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/credit-scores.html/credit-scores/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/credit-unions.html/credit-unions/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/crowd-funding/crowdfunding/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/current-assets.html/current-assets/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/customer-base.html/customer-base/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/customer-service.html/customer-service/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/cutting-costs-home.html/cutting-costs-home/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/cutting-costs-office.html/cutting-costs-office/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/debt-restructuring.html/debt-restructuring/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/debt.html/debt/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/delegating-tasks.html/delegating-tasks/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/demand-up-capital-down/small-business-capital/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/demonstrating-trust/demonstrating-trust/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-accounting-tax-services/dental-accounting-and-tax-services/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-asset-protection-planning/dental-asset-protection-planning/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-billboards-yellow-pages-flyers/billboards-yellow-pages-flyers/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-breaking-down-a-lease/dentist/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-buy-lease-analysis/dental-buy-lease-analysis-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-c-corporation/dental-c-corporation/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-choosing-a-bank/choosing-a-bank/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-corporate-tax/corporate-tax-returns/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-customized-retirement-strategy/customized-retirement-strategy/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-depreciation/depreciation-considerations/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-disregarded-entity/disregarded-entity/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-email/female-hands-reviewing-documents./ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-financial-roadmap/accounting-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-financing-assistance/dental-financing-assistance/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-insurance-planning/dental-insurance-planning/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-internet-marketing/dental-check-up/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-inventory-system/inventory-system/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-leases/dental-operating-leases/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-llp/tax-calculator-pen-and-glasses/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-location-analysis/dental-equipment/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-marketing-advertising-agency/business-marketing-and-planning-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-microsoft-office/microsoft-office/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-mobile-marketing/mobile-marketing/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-monthly-financial-statements/monthly-financial-statements/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-optimal-tax-structure/optimal-tax-structure/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-partnership/dental-partnership-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-paying-bills/dental-paying-bills/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-payroll-services/dental-payroll-services/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-practice-acquisition-analysis/dental-practice-acquisition-analysis-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-practice-budgets/close-up-of-patienta%c2%80%c2%99s-open-mouth-during-oral-inspection-with-mirror-and-hook/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-quickbooks-accounting/inspection-of-oral-cavity/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-retirement-planning/doctor-dentist/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-s-corporation/s-corporation-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-selection-business-entity/dental-selection-of-business-entity/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-tax-diversification/dental-tax-diversification/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-tax-returns/operating-room-dental-surgery/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-virtual-client-office/young-dentist/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/dental-wage-accounts/dentist-and-assistant-checking-x-ray-at-dental-clinic/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/depreciation.html/depreciation/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/diversification.html/tax-diversification/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/doctor-decisions.htm/doctor-decisions/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/downsizing.html/downsizing/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/due-diligence.html/due-diligence/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/early-payoff-student-loans.html/early-payoff-student-loans/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/early-retirement.html/early-retirement/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/earned-income-credit.html/earned-income-credit/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/elder-financial-care.htm/holding-the-dollar/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/electronic-discovery.html/electronic-discovery/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/emergency-cash.html/emergency-cash/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/employee-benefits/employee-benefits-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/employee-tax-records.html/tax-records/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/employee-vs-independent-contractor.htm/employee-vs-independent-contractor/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/employer-identification-number.htm/employer-identification-number/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/employer-responsibilities.html/employer-responsibilities/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/equilibrium-price/equilibrium-price/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/estate-executor/estate-executor/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/estate-planning.htm/senior-couple-meeting-with-agent/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/estimated-tax.html/estimated-tax/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/existing-business.html/existing-business/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/exit-strategy.html/exit-strategy/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/fair-value.html/fair-value/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/federal-gift-tax/federal-gift-tax-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/federal-reserve/federal-reserve-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/filing-quarterly-taxes/quarterly-taxes/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/financial-advice.html/worse-finances/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/financial-planning.htm/financial-planning/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/financially-preparing-divorce.htm/financially-preparing-divorce/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/financially-preparing-marriage.htm/financially-preparing-marriage/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/financing-growth.html/financing-growth/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/finding-employees/right-employees/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/firmprofile.html/navigating-the-business-of-medicine/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/five-cs-of-credit.html/five-cs-of-credit/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/flexible-hours/flexible-hours-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/flood-insurance.html/flood-insurance/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/florida-prepaid.html/florida-prepaid/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/florida-small-business/florida-small-business-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/florida-taxes.html/florida-taxes/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/forms-to-start-business.htm/forms-to-start-new-business/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/franchise-or-brand/franchise/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/fungibility-liquidity/fungibility-liquidity-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/fungibility-liquidity/fungibility-liquidity/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/general-ledger.html/general-ledger/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/get-started-estate-planning.htm/get-started-estate-planning/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/getting-good-financial-advice.htm/getting-good-financial-advice/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/global-business.html/global-business/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/government-contracts/sba-government-contract/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/great-business-plan/business-plan-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/green-business.htm/greenbusiness/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/green-companies-taxes/solar-panel./ (attachment-sitemap.xml)
- https://www.reliancecpa.com/gsa-schedules.html/gsa-schedules/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/health-care-tax-credit/health-care-tax-credit-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/health-reform-and-hire-act.html/health-reform/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/hiring-employees.htm/hiring-employees/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/hiring-family-members.htm/hiring-family-members/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/hiring-incentives/hiring-incentives-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/home-based-business.htm/workingathome/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/home-based-businesses/home-based-business-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/home-business.html/home-based-business/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/home-improvements/insurance-costs-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/homestead-exemption.html/homestead-exemption/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/household-employee-tax.htm/household-employee-tax/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/how-payroll-processing-helps.htm/payroll-processing-helps/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/how-to-choose-cpa.htm/how-to-choose-cpa/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/human-resources-delegation/human-resources/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/identity-theft.htm/idtheft/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/importance-of-a-will.htm/importance-of-a-will/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/improved-financial-situation.html/financial-improvement/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/income-tax-preparer.html/tax-preparer-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/income-tax-services.htm/income-tax-services/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/income-tax-withholding.html/income-tax-withholding/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/indirect-taxes/indirect-taxes/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/information-security.html/small-business-security/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/inherit-money-or-property/substantial-inheritance/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/insurance-costs/insurance-costs-1/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/insurance-settlement/file-marked-with-insurance/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/intangible-assets.html/intangible-assets/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/intellectual-property.html/intellectual-property/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/internal-audit.html/internal-audit/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/internal-controls-evaluation.htm/internal-controls-evaluation/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/international-business/international-business-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/internet-advertising/magnifying-glass-internet-marketing/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/investment-plan.html/investment-plan/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/ipo-costs/ipo-costs-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/irs-email-scams.html/irs-email-scams/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/irs-frivolous-arguments/irs-frivolous-arguments/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/irs-problems.htm/irs-problems/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/itemization-tax-return/tax-forms./ (attachment-sitemap.xml)
- https://www.reliancecpa.com/keep-financial-records.htm/keep-financial-records/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/keogh-plan/keogh-plan-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/key-performance-indicators/key-performance-indicators-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/late-income-tax-return.htm/late-income-tax-return/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/late-retirement-planning.html/late-retirement-planning/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/learn-from-mistakes/business-mistakes/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/leasing-car.html/leasing-car/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/leveraged-buyout/leveraged-buyout/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/liabilities.html/liabilities/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/life-events.html/life-events/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/life-insurance-needs-analysis.htm/life-insurance-needs-analysis/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/limited-liability-corporation.htm/limited-liability-corporation/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/liquidating-assets.html/liquidating-assets/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/living-will.htm/livingwill/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/long-term-care.htm/longtermcare/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/long-term-care/long-term-planning/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/losses-tax-deductions/trashed-room/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/making-money-in-medicine.htm/making-money-in-medicine/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/market-indicators/market-indicators/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/marketing-budget.html/marketing-budget/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/married-filing-jointly.html/married-filing-jointly/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/mergers/business-deal-businessmen-shaking-hands/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/money-market.html/money-market/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/mortgage-refinance/mortgage-refinance-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/motivating-employees.html/motivating-employees/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/mutual-fund.html/mutual-fund/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/naming-business.html/naming-business/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/negotiating-dental-loan-terms/dental-negotiatiing-loan-terms/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/net-worth.html/net-worth/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/network-security/network-server-room/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/new-business-financing.html/new-business-financing/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/new-business-planning.htm/new-business-planning/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/new-business-priorities.html/new-business-priorities/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/new-business.html/new-business/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/non-cash-transactions.html/non-cash-transactions/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/on-line-business.html/on-line-business/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/ongoing-medical-expenses/ongoing-medical-expenses/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/organizational-structure.html/organizational-structure/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/part-time-cfo.htm/part-time-cfo/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/partnership.htm/partnership/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/passive-income/passive-income/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/patient-accounts/accounting./ (attachment-sitemap.xml)
- https://www.reliancecpa.com/pay-per-click/pay-per-click/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/payroll-services.htm/payroll-services/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/performance-management.html/performance-management/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/personal-assets.html/personal-assets/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/personal-budget.html/personal-budget/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/personal-budget/personal-budget-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/personal-financial-goals.html/personal-financial-goals/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/personal-financial-goals/in-home-sales/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/personal-record-retention.htm/personal-record-retention/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/personal-tax-extension.html/personal-tax-extension/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/petty-cash/petty-cash/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/physician-accountants.htm/physician-accountants/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/post-mortem-letter.htm/post-mortem-letter/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/potential-employees.html/potential-employees/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/power-of-attorney.htm/powerofattorney/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/processes.html/processes/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/profitable-business-idea/business-idea/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/property-depreciation.html/property-depreciation/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/purchase-business-franchise.html/purchase-business-franchise/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/quickbooks-accountant.htm/quickbooks-accountant/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/ready-to-incorporate.html/ready-to-incorporate/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/real-estate-cpa.htm/digital-image-by-sean-lockedigital-planet-designwww.digitalplanetdesign.com (attachment-sitemap.xml)
- https://www.reliancecpa.com/real-property/real-property/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/reasons-to-choose-reliance.htm/reasons-choose-reliance/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/recording-transactions.html/business-ledger/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/records-for-cpa-meeting.htm/records-for-cpa-meeting/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/refinance.html/refinance/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/refinancing-home-mortgage.html/refinancing-home-mortgage/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/reit-retirement/reit-for-retirement/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/related-party-transactions/related-party-transaction/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/reliable-insurance/reliable-insurance-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/reliance-consulting-netclient-portals/client-login/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/reliance-consulting-netclient-portals/netclient-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/reliance-consulting-netclient-portals/netclient/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/remarketing/remarketing-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/rent-or-buy-home.html/rent-or-buy-home/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/rent-vs-buy/rent-vs-buy/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/restaurant-hotel-accountant.htm/restaurant-hotel-accountant/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/retail-accounting.htm/retail-accounting/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/retirement-expenses.htm/retirement-expenses/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/retirement-planning-money.html/retirement-planning-money/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/retirement-readiness/ready-to-retire/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/retirement-taxes.html/retirement-taxes/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/reverse-mortgage.htm/reversemortgage/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/reverse-mortgage/reverse-mortgage-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/revocable-trust/revocable-trust/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/revocable-trusts.html/revocable-trusts/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/risk-management-controls/risk-management-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/risk-management.html/risk-management/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/roth-traditional-ira.html/roth-traditional-ira/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/running-green-business.html/running-green-business/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/s-corporation.htm/s-corporation/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/sales-strategy.html/sales-strategy/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/sales-tax-law.htm/floridasalestax/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/saving-energy.html/saving-energy/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/savings-plan.html/savings-amount/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/sba-assistance/sba-assistance-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/search-engine-marketing.html/internet-marketing/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/sec-role/sec/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/second-career/second-career/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/self-directed-ira/self-directed-ira-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/self-employment-tax-questions/self-employment-tax-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/self-employment-tax.html/self-employment-tax/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/small-business-accountant.html/small-business-accountant-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/small-business-accounting.htm/small-business-accountant/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/small-business-brand/woman-working-at-flower-shop-smiling/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/small-business-defined.html/small-business-defined/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/small-business-defined/small-business-defined-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/small-business-ecommerce.html/small-business-ecommerce/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/small-business-efficiency.html/small-business-efficiency/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/small-business-failure.html/small-business-failure/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/small-business-insurance.html/small-business-insurance/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/small-business-location.html/small-business-location/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/small-business-networking.html/small-business-networking/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/small-business-planning.html/small-business-planning/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/small-business-success.html/small-business-success/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/small-business-tax/small-business-tax-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/social-media-mistakes/social-media-diagram/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/social-media-small-business/social-media-small-business-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/social-media-strategy/social-media-strategy/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/sole-proprietorship.htm/sole-proprietorship/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/source-document.html/source-document/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/staff-profiles.htm/briana-mcnulty/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/staff-profiles.htm/jamie-partin/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/staff-profiles.htm/kim-nguyen/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/staff-profiles.htm/nicole-frenier/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/staff-profiles.htm/tara-govindaraju/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/standard-deduction-tax-return/preparing-taxes/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/start-my-own-business.html/start-my-own-business/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/starting-a-business.html/starting-new-business/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/startup-costs.html/startup-costs/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/staying-on-budget.htm/budget/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/strategic-business-planning.htm/strategic-business-planning/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/student-loans.html/student-loan/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/successful-small-businesses.html/successful-small-business/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/succession-planning.htm/succession-planning/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tampa-cpa-areas-served.htm/greater-tampa-bay/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tampa-cpa-firm-tampa-accountants-serve-all-business-tax-income-tax-bookkeeping-payroll-accounting-needs/cpa-certified-public-accountant/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-benefits-home-office/home-office/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-benefits-home-ownership/couple-standing-outside-new-house/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-compliance/tax-compliance-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-exempt-organizations/tax-exempt-organizations-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-exempt-status/tax-form-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-form.html/tax-form/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-forms/tax-form-types/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-planning-year-round/tax-planning-year-round/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-planning.htm/tax-planning/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-preparation.htm/tax-preparation-accountant/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-preparer.htm/tax-preparer/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-problem-irs-audit-help.htm/tax-problem-irs-audit-help/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-records-to-keep/tax-records-to-keep-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-return-error/tax-return-error-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-rules-home-sale/accounting/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-saving-strategies.htm/tax-saving-strategies/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-scams.html/tax-scams/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/tax-valuation-allowance/tax-valuation-allowance-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/taxable-income.html/taxable-income/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/taxpayer-advocate-service/tas-irs/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/taxpayer-burden.html/taxpayer-burden/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/taxpayer-rights.html/taxpayer-rights/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/temporary-employees.html/temporary-employees/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/time-management-business-owner/time-management-business-owner/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/time-management.html/time-management/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/title-insurance.html/title-insurance/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/titling-dental-assets/dental-titling-of-assets/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/trade-shows.html/trade-shows/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/transaction-taxes/transaction-tax/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/transfer-ownership.html/transfer-ownership/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/twitter/woman-in-home-office-with-computer-smiling/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/uncertain-tax-positions/utp-small-business/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/understanding-estate-tax.html/understanding-estate-tax/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/underwater-mortgage/underwater-mortgage-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/unemployment-tax.html/unemployment-tax/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/upside-down-mortgage.html/upside-down-mortgage/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/vacation-budgeting.html/vacation-budgeting/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/value-added-tax.html/value-added-tax/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/velocity/velocity-2/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinarian-quickbooks-set-up-and-support/quickbooks-logo/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-benchmarking/benchmarking-benefits/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-bill-pay/attachment/9228526/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-bookkeeping/bookkeeping-1/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-budgets-and-financial-projections/budget-istock_000041295790_large/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-business-entity-structuring/business_structures/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-business-loan-assistance/contentimagehandler/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-business-plan-development/business-plan-images/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-buying-vs-leasing-analysis/market-analysis/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-cash-flow-planning/freecashflowtocommonequity/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-cpa/veterinarian-assessing-a-puppy/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-financial-and-consulting-services/veterinarian-job-description/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-financial-statement-preparation/financial-reports/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-hiring-assistance/staff-b4412c66/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-irs-problem-resolution/tax-problems/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-outsourced-controller/time-is-money/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-purchasing-a-practice/istock_000009819502small/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-retirement-planning/retirement-plan/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-succession-planning/vets-examining-an-australian-shepherds-radiography-in-front-of-white-background/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-tax-planning/year-end-tax-planning-morell-open-forum-432/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/veterinary-virtual-accounting/virtualbookkeeping/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/voluntary-tax.html/voluntary-tax/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/wage-and-hour-laws.html/wage-and-hour-laws/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/what-is-a-cpa.htm/what-is-a-cpa/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/what-is-a-trust.htm/trust/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/who-must-file.html/who-must-file/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/why-you-need-life-insurance.htm/why-you-need-life-insurance/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/withdrawal-from-ira/nest-egg/ (attachment-sitemap.xml)
- https://www.reliancecpa.com/workplace-monotony/employee-monotony/ (attachment-sitemap.xml)

## URLs in the seed CSV but not in the sitemaps (0)



## Known limits

- Only static HTML is read. Content injected by JavaScript is not captured (forms, Wistia players and third-party widgets are detected from their static markers only).
- The header/footer are taken from the most common variant; the header nav differs by section (see `nav_variants` in `_global.json`).
- Post author is the WordPress username from page metadata, which may not be a display name.
- Empty links (no text, no image alt, no title) and empty headings are dropped.

## Layout analysis (layout.py)

909 of 916 URLs have extractable content (the rest failed to download). Machine-readable: `_layout-analysis.json`.

### Outer scaffolds (theme templates): 2

- **S1**: 462 pages. Scaffold: a > div#wrapper.hfeed > div#header > div#masthead > div#branding > div#sliderContainer > div#main > div#primary.widget-area > ul.xoxo > div#container > div#content > div#footer > div#colophon > div#footer-widget-area. Examples: 401k-plans.html, 529-savings-plan-covers, accessibility
- **S2**: 447 pages. Scaffold: a > div#wrapper.hfeed > div#header > div#masthead > div#branding > div#sliderContainer > div#main > div#container.single-attachment > div#content > div#footer > div#colophon > div#footer-widget-area > div#first.widget-area > div#second.widget-area. Examples: 401k-plans.html__401k-plans, 529-savings-plan-covers__young-african-american-college-student, accrual-accounting__sales-report-2

### Layout families: 8

A family is a scaffold plus structural traits (form, video, embed, table, link-hub). Words are main-region words excluding shared boilerplate.

| Family | Pages | Description | Examples |
|---|---|---|---|
| S1 | 453 | scaffold S1; plain text; 142-1200 words (median 289); common shape: HIpLp | 401k-plans.html, 529-savings-plan-covers, accessibility |
| S2 | 414 | scaffold S2; plain text; 7-49 words (median 29); common shape: pHpI | 401k-plans.html__401k-plans, 529-savings-plan-covers__young-african-american-college-student, accrual-accounting__sales-report-2 |
| S2-link-hub | 33 | scaffold S2; link-hub; 21-41 words (median 27); common shape: pHI | antitrust-law.html__antitrust-law, business-finance-consultant.htm__business-finance-consultant, business-planning-services.htm__business-planning |
| S1-video | 4 | scaffold S1; video; 264-687 words (median 333); common shape: HIpEpLp | dental-cpa, home, reliance-consulting-backoffice |
| S1-embed | 2 | scaffold S1; embed; 48-48 words (median 48); common shape: HpEp | contact.html, contact |
| S1-table | 1 | scaffold S1; table; 524-524 words (median 524); common shape: HT | articles.html |
| S1-form | 1 | scaffold S1; form; 3-3 words (median 3); common shape: HF | client-portal-login |
| S1-link-hub | 1 | scaffold S1; link-hub; 1992-1992 words (median 1992); common shape: HpLpLpLHpLpLpLpLpLHpLpLpLpLpL | more-information.htm |

### Boilerplate repeated across pages

- 447 pages: [text] bookmark the permalink.
- 63 pages: [h2] tampa cpa
- 38 pages: [text] by admin | published december 8, 2011 | full size is 300 × 199 pixels
- 22 pages: [text] by admin | published december 5, 2011 | full size is 300 × 199 pixels
- 15 pages: [p] ← articles
- 15 pages: [text] by admin | published december 7, 2011 | full size is 300 × 199 pixels
- 12 pages: [text] by admin | published december 5, 2011 | full size is 300 × 200 pixels
- 11 pages: [text] by admin | published december 7, 2011 | full size is 300 × 200 pixels
- Header variants: 1 (909 pages)

### Cohort: article-library (278 pages)

- Words: min 173, median 273, mean 288, p90 331, max 929; under 150 words: 0; over 800: 1
- Titles: 262 unique (17 pages share a title with another); empty: 0. Meta descriptions: 0 unique, 278 pages without. Meta keywords: 0 pages.
- Scaffolds used: {'92f7dbfe': 278}; content shapes: {'HIpLp': 214, 'HIp': 48, 'HIpLpLp': 7, 'Hp': 6, 'HpLp': 2, 'HpIpLp': 1}
- Vendor / copyright / provenance markers found in the main text: `provided by` on 3 pages, `copyright` on 3 pages, `licensed` on 2 pages, `permission` on 2 pages, `published by` on 1 pages
- External hosts referenced in the main region (pages): {'twitter.com': 278, 'www.facebook.com': 278, 'sociusdevelopment.com': 278, 'badges.del.icio.us': 278, 'delicious.com': 278, 'www.irs.gov': 1}
- Blocks repeated across the cohort: none

### Cohort: dental (46 pages)

- Words: min 221, median 299, mean 320, p90 449, max 505; under 150 words: 0; over 800: 0
- Titles: 46 unique (0 pages share a title with another); empty: 0. Meta descriptions: 0 unique, 46 pages without. Meta keywords: 0 pages.
- Scaffolds used: {'92f7dbfe': 46}; content shapes: {'HIpLp': 35, 'HIp': 7, 'HIpLpLp': 2, 'HIpEpLp': 1, 'HIpLpLpLp': 1}
- Vendor / copyright / provenance markers found in the main text: `provided by` on 3 pages, `powered by` on 1 pages
- External hosts referenced in the main region (pages): {'twitter.com': 46, 'www.facebook.com': 46, 'sociusdevelopment.com': 46, 'badges.del.icio.us': 46, 'delicious.com': 46, 'www.youtube.com': 1, 'reliancecpa.com.contact.html': 1}
- Blocks repeated across the cohort: none

### Cohort: veterinary (21 pages)

- Words: min 557, median 717, mean 713, p90 811, max 825; under 150 words: 0; over 800: 3
- Titles: 21 unique (0 pages share a title with another); empty: 0. Meta descriptions: 21 unique, 0 pages without. Meta keywords: 0 pages.
- Scaffolds used: {'92f7dbfe': 21}; content shapes: {'HIpHpLHpHpHp': 3, 'HIpHpHpHpLHpHp': 2, 'HIpHpLpHpHpHpHp': 2, 'HIpHpLHpLHpHpHp': 1, 'HIpHpLpHpLHpHp': 1, 'HIpHpHpLpHpHpHp': 1, 'HIpHpHpLHpHpHp': 1, 'HIpHpHpHpHpHpHp': 1}
- Vendor / copyright / provenance markers found in the main text: `provided by` on 1 pages
- External hosts referenced in the main region (pages): {'twitter.com': 21, 'www.facebook.com': 21, 'sociusdevelopment.com': 21, 'badges.del.icio.us': 21, 'delicious.com': 21, 'contact': 1, 'www.youtube.com': 1}
- Blocks repeated across the cohort: none

### Cohort: article-service-adjacent (49 pages)

- Words: min 222, median 333, mean 349, p90 423, max 582; under 150 words: 0; over 800: 0
- Titles: 49 unique (0 pages share a title with another); empty: 0. Meta descriptions: 0 unique, 49 pages without. Meta keywords: 0 pages.
- Scaffolds used: {'92f7dbfe': 49}; content shapes: {'HIpLp': 45, 'HIpLpLp': 2, 'HpLp': 1, 'HIp': 1}
- Vendor / copyright / provenance markers found in the main text: `copyright` on 1 pages
- External hosts referenced in the main region (pages): {'twitter.com': 49, 'www.facebook.com': 49, 'sociusdevelopment.com': 49, 'badges.del.icio.us': 49, 'delicious.com': 49}
- Blocks repeated across the cohort: none

### Cohort: article-dated (17 pages)

- Words: min 231, median 323, mean 482, p90 960, max 1200; under 150 words: 0; over 800: 2
- Titles: 14 unique (4 pages share a title with another); empty: 0. Meta descriptions: 0 unique, 17 pages without. Meta keywords: 0 pages.
- Scaffolds used: {'92f7dbfe': 17}; content shapes: {'HIpLp': 5, 'HIp': 5, 'HpLp': 4, 'Hp': 1, 'HpHpHp': 1, 'HpHpHpHpHpHp': 1}
- Vendor / copyright / provenance markers found in the main text: `provided by` on 1 pages, `published by` on 1 pages
- External hosts referenced in the main region (pages): {'twitter.com': 17, 'www.facebook.com': 17, 'sociusdevelopment.com': 17, 'badges.del.icio.us': 17, 'delicious.com': 17, 'ama-assn.org': 1}
- Blocks repeated across the cohort: 3x [p] amol nirgudkar, cpa is the managing partner of reliance consulting llc can be reached at (813) 931-7258 or via email at amol@reliancecpa.com
