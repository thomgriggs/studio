# Vaughn Law (dvaughnlaw.com) keep / fold / drop decisions

Source: "Recommended Action" column of Vaughn_Law_WebsiteAudit_Action Plan.xlsx (Drive 1MyShqvupsJJGA2Ke1JeHwmoRJoLPPz82). Raw data: danielle-sheet-2026-11-11.md

**Coverage gap:** The sheet covers 33 URLs. The sitemap at https://dvaughnlaw.com/page-sitemap.xml (71 URLs per the brief) could not be fetched because dvaughnlaw.com is not on the session allowlist. The 38 sitemap URLs not in the sheet have no decision yet and are not listed here.

**Comment column:** The sheet has no comment column. The "Recommended Action" value is quoted verbatim below. "Change" is not defined in the sheet and is proposed as KEEP (provisional); see the ambiguous list.

| # | URL | Danielle's comment | Proposed decision | Reason |
|---|---|---|---|---|
| 1 | https://dvaughnlaw.com/ | Keep | KEEP | Client marked keep. Home page. |
| 2 | https://dvaughnlaw.com/type-of-services/ | Remove | DROP | Client marked remove. Index page that repeats the practice areas. |
| 3 | https://dvaughnlaw.com/title-services/ | Change | KEEP (provisional) | "Change" is undefined. Proposed keep and revise. Ambiguous. |
| 4 | https://dvaughnlaw.com/real-estate-law/ | Change | KEEP (provisional) | "Change" is undefined. Hub for real estate children. Ambiguous. |
| 5 | https://dvaughnlaw.com/investors/ | Remove | DROP | Client marked remove. Child /investors/legal-services/litigation/ is kept, so this is an orphan. Ambiguous. |
| 6 | https://dvaughnlaw.com/estate-planning/ | Keep | KEEP | Client marked keep. Estate planning hub. |
| 7 | https://dvaughnlaw.com/subscription-plans/ | Remove | DROP | Client marked remove. |
| 8 | https://dvaughnlaw.com/about/ | Keep | KEEP | Client marked keep. |
| 9 | https://dvaughnlaw.com/our-team/ | Keep | KEEP | Client marked keep. |
| 10 | https://dvaughnlaw.com/best-practices/ | Remove | DROP | Client marked remove. Wire fraud and escrow content overlaps /cyber-security/, which is also removed. |
| 11 | https://dvaughnlaw.com/cyber-security/ | Remove | DROP | Client marked remove. |
| 12 | https://dvaughnlaw.com/disclaimer/ | Change | KEEP (provisional) | "Change" is undefined. Legal disclaimer is required content for a Florida Bar firm. Ambiguous. |
| 13 | https://dvaughnlaw.com/privacy-policy/ | Change | KEEP (provisional) | "Change" is undefined. Privacy policy should remain. Ambiguous. |
| 14 | https://dvaughnlaw.com/resources/ | Remove | DROP | Client marked remove. Hub for calculators, videos, blog and workshops. Blog is kept, so its link needs a new home. Ambiguous. |
| 15 | https://dvaughnlaw.com/closing-calculators/ | Remove | DROP | Client marked remove. |
| 16 | https://dvaughnlaw.com/video-library/ | Change | KEEP (provisional) | "Change" is undefined. Ambiguous. |
| 17 | https://dvaughnlaw.com/blog/ | Keep | KEEP | Client marked keep. |
| 18 | https://dvaughnlaw.com/order-title/ | Remove | DROP | Client marked remove. The Order Title Portal is also named on /title-services/ (marked Change). Ambiguous. |
| 19 | https://dvaughnlaw.com/workshops/ | Remove | DROP | Client marked remove. |
| 20 | https://dvaughnlaw.com/contact/ | Keep | KEEP | Client marked keep. |
| 21 | https://dvaughnlaw.com/register-now/ | Remove | DROP | Client marked remove. Workshop signup, tied to the removed workshops page. |
| 22 | https://dvaughnlaw.com/intro-to-vaughn-law/ | Remove | DROP | Client marked remove. Old office announcement and news reprints. |
| 23 | https://dvaughnlaw.com/real-estate-law/practice-areas/ | Remove | DROP | Client marked remove. Duplicates closings and transactions content on /real-estate-law/real-estate-transaction/ (keep). Could be folded instead. Ambiguous. |
| 24 | https://dvaughnlaw.com/investors/legal-services/litigation/ | Keep | KEEP | Client marked keep. Its parent /investors/ is removed. Litigation also appears as an H2 on /real-estate-law/. Ambiguous. |
| 25 | https://dvaughnlaw.com/estate-planning/ancillary-probate/ | Keep | KEEP | Client marked keep. |
| 26 | https://dvaughnlaw.com/estate-planning/important-terms/ | Keep | KEEP | Client marked keep. |
| 27 | https://dvaughnlaw.com/estate-planning/estate-planning-documents/ | Keep | KEEP | Client marked keep. |
| 28 | https://dvaughnlaw.com/estate-planning/probate/ | Keep | KEEP | Client marked keep. |
| 29 | https://dvaughnlaw.com/real-estate-law/business-entity-formation/ | Remove | DROP | Client marked remove. Its H2 still appears on /real-estate-law/ (marked Change). Ambiguous. |
| 30 | https://dvaughnlaw.com/real-estate-law/commercial-foreclosures/ | Keep | KEEP | Client marked keep. Overlaps with the removed /investors/ page on private lender foreclosure. |
| 31 | https://dvaughnlaw.com/real-estate-law/land-trusts/ | Keep | KEEP | Client marked keep. |
| 32 | https://dvaughnlaw.com/real-estate-law/landlordtenant-litigation/ | Keep | KEEP | Client marked keep. |
| 33 | https://dvaughnlaw.com/real-estate-law/real-estate-transaction/ | Keep | KEEP | Client marked keep. Single home for the closings and transactions topic. |

No FOLD decisions were proposed. Every sheet page has an explicit client action, and the duplicate-topic candidates below would conflict with those actions.

## Counts (33 sheet URLs)

| Decision | Count |
|---|---|
| KEEP (client marked keep) | 15 |
| KEEP (provisional, client marked "Change") | 5 |
| FOLD | 0 |
| DROP | 13 |
| **Total** | **33** |

Template cruft rules (portfolio, layouts-sections-modules, /calculators/, events taxonomy, blog-old, "Applied AI Machine Learning Summit" demo) do not match any URL in the sheet. Those URLs would be in the 38 sitemap URLs that were not available.

## Ambiguous, needs a human decision

1. **"Change" pages (provisional KEEP):** /title-services/, /real-estate-law/, /disclaimer/, /privacy-policy/, /video-library/. The sheet does not say what the change is.
2. **Orphaned child:** /investors/ (Remove) with /investors/legal-services/litigation/ (Keep).
3. **Blog without its hub:** /resources/ (Remove) with /blog/ (Keep). The blog needs a new nav location.
4. **Order form:** /order-title/ (Remove) while /title-services/ (Change) still lists the Order Title Portal. Confirm whether the portal stays.
5. **Closings duplicate:** /real-estate-law/practice-areas/ (Remove) and /real-estate-law/real-estate-transaction/ (Keep). Drop, or fold the practice-areas content into the transaction page?
6. **Entity formation:** /real-estate-law/business-entity-formation/ (Remove) while its H2 stays on /real-estate-law/ (Change).
7. **Litigation:** /investors/legal-services/litigation/ (Keep) also appears as an H2 on /real-estate-law/ (Change). Confirm one page.
8. **Private lender foreclosure:** /investors/ (Remove) and /real-estate-law/commercial-foreclosures/ (Keep) both cover foreclosure. Confirm whether the investor-facing content should move.
9. **Old announcement:** /intro-to-vaughn-law/ (Remove) includes the Corey Ave office note. Confirm no current address info is lost, since /contact/ is kept.
10. **Sitemap gap:** The 38 sitemap URLs not in the sheet have no decision. Send the sitemap or allow dvaughnlaw.com so they can be processed.
