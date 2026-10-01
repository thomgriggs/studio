# Banner images — for upload to HOA Express

Downloaded 2026-10-01. One file per page, named by page, all JPEG. `home.jpg` is the client's photo (2400px); the other 15 are the Unsplash photos the custom CSS currently hotlinks (2000px, as Unsplash serves them). Four are portrait (map, pet-directory, book-recommendations, hoa-voting-surveys, templates-samples) — fine, the banner uses `background-size: cover` and crops to the band.

After uploading each one, replace its `--wp-banner-image: url("…")` in `concept1/custom-css/hoa-custom.css` with the HOA Express URL (absolute, `https://public-files.hoa-express.com/…`). The position values below are what the CSS uses today; keep them unless the new crop needs a nudge.

| File | Page | CSS selector (`href$=`) | Current position | Source |
|---|---|---|---|---|
| `home.jpg` | Home | `/` | center 42% | client photo (IMG_0118) |
| `calendar.jpg` | Calendar | `/p/Calendar` | center 48% | unsplash.com/photos/FoKO4DpXamQ |
| `map.jpg` | Map | `/p/Map` | center | unsplash.com/photos/tU9n3Y0KCMk |
| `public-documents.jpg` | Public Documents | `/p/Public-Documents-2` | center | unsplash.com/photos/DDkyGrfvp40 |
| `member-documents.jpg` | Member Documents | `/p/Member-Documents` | center | unsplash.com/photos/8EzNkvLQosk |
| `board-members.jpg` | Board Members | `/p/Board-Members` | — | unsplash.com/photos/WFItslWB89M |
| `community-members.jpg` | Community Members | `/p/Community-Members` | — | unsplash.com/photos/qgHGDbbSNm8 |
| `pet-directory.jpg` | Pet Directory | `/p/Pet-Directory` | — | unsplash.com/photos/CdK2eYhWfQ0 |
| `recipes.jpg` | Recipes | `/p/Recipes` | — | unsplash.com/photos/yjYxtxLOiF4 |
| `discussion-forum.jpg` | Discussion Forum | `/p/Discussion-Forum` | — | unsplash.com/photos/ETRPjvb0KM0 |
| `contact-us.jpg` | Contact Us | `/p/Contact-Us` | — | unsplash.com/photos/goholCAVTRs |
| `book-recommendations.jpg` | Book Recommendations | `/p/Book-recommendations` | — | unsplash.com/photos/2NZQmMLo_7Q |
| `financial.jpg` | Financial | `/p/Financial` | — | unsplash.com/photos/81ikZZG7_AA |
| `templates-samples.jpg` | Templates & Samples | `/p/Templatessamples` | — | unsplash.com/photos/rn00OVh0gEI |
| `hoa-voting-surveys.jpg` | HOA Voting / Surveys | `/p/HoA-VotingSurveys` | — | unsplash.com/photos/0CvHQ62gwY8 |
| `good-samaritan-westbrooke.jpg` | Good Samaritan Westbrooke | `/p/Good-Samaritan-Westbrooke` | — | unsplash.com/photos/tXiMrX3Gc-g |

"—" = the CSS doesn't set a position for that page (defaults to `center`). Unsplash photos are under the Unsplash License (free to use, no attribution required); `home.jpg` is the client's.

Once the 16 URLs are swapped, the Unsplash hotlinks are gone and the site owns its pictures. The `images/` folder inside `concept1/public/` (WebP) is only for the local concept preview.
