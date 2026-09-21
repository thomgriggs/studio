# Optimum RV CRM — developer package

Everything in this folder is the prototype the client has reviewed. It is a **click-through**, not an app: no server, no build step, all data in `data.js`. Your job is the backend and the real integrations; the screens, names and rules are settled.

## Run it
Any static server from this folder, e.g. `python3 -m http.server 8765` → http://localhost:8765/index.html. (`file://` works but fonts/icons need network.) The live copy is https://studio.thomgriggs.com/optimumrv/crm/.

## Read in this order
1. **HANDOFF.md** — the contract. Start with *Naming contract*, *data.js shape*, *How a lead's status changes*, then *Data contract (target shapes)*, *States — and how to tie in*, *AI agents*, and the two question lists.
2. **actions.json** — every domain action (what it needs, what it changes, who must confirm) and the Assistant policy. Generated from `CRM_ACTIONS` in `crm.js`; regenerate when that changes.
3. **crm.js** — one file, sectioned with banner comments; the delegated `[data-action]` click handler and `CRM_ACTIONS` registry are the spine. `crmRequest()` at the top is the only seam to a backend.
4. **crm.css** — tokens at the top (colours, type scale, radii); flat block classes; phone layouts scoped under `body[data-device="phone"]`.
5. The three pages + `phone.html` (iPhone frame, portrait/landscape) + `toast-preview.html` (the confirmation component on its own).

## Prototype-only things (remove or gate for production)
- **Settings → Connection** (Normal / Slow / Offline) and **Reset demo data**.
- `?device=phone|desktop`, `?inset=44`, `?labels=1` (block-label overlay), `?role=` / `?desk=` in URLs — role should come from auth.
- `sessionStorage` persistence (`crmPersist` / `crmHydrate`) — replaced by the API.
- `REL()` in `data.js` (sample dates float with today), and the sample photos in `assets/`.

## What's deliberately not built
Real AI, an events feed, partial-failure/conflict states, offline queueing, bulk actions, notifications delivery, print/export, a build pipeline (see *Performance* in HANDOFF). Consign / Back Office ship as drawn by agreement.

## Files
`index.html` `daily-view.html` `pipeline.html` `calendar.html` `phone.html` `toast-preview.html` · `crm.css` `crm.js` `data.js` `actions.json` · `js/` (Feather 4, MicroModal) · `assets/` (logo, sample photos) · `HANDOFF.md` · this file.
