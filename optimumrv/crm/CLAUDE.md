# Optimum RV CRM — agent brief

You are working on a static HTML/CSS/JS click-through prototype of a dealership CRM (Daily View = messaging, Pipeline = kanban + list, Calendar). It is the approved reference for a real build. Read `README-DEVELOPER.md` first, then `HANDOFF.md`; this file is the working rulebook.

## Non-negotiables
- **Names are the contract.** Block classes, `data-action`, `data-field`, `data-stage`, `data-status` are what the client reviewed and what `actions.json` indexes. Don't rename; add.
- **Every control does or shows something.** No dead buttons. If an action's result isn't visible where the user is looking, it gets `crmToast()`.
- **Stages move from what's logged.** Agreed / Lost are human decisions; managers override with a reason; the assistant only proposes (`crmCanSetStage`, `crmSetStage`, `CRM_DATA.assistant`). Never bypass the confirm sheet.
- **The thread is append-only** and every entry keeps `by`. Never strip provenance (`crmProvenance`).
- **One seam to the backend:** `crmRequest(label, work)`. Loads, sends and saves go through it; skeletons, the offline banner, message states and refused saves hang off its promise. Don't add a second path.
- **No new raw sizes or colours.** Use the type-scale tokens (`--font_size-*`) and colour tokens at the top of `crm.css`; stage/status colours come from `--stage_*` / `--status_*` (text on tinted pills uses the `-text` variants).
- **Accessibility is at 100 (Lighthouse) and must stay there.** Keyboard: closed layers are `inert`, every layer returns focus to its opener, one global `:focus-visible` ring. Contrast ≥ 4.5:1 for text. Targets ≥ 24px. Don't add `outline:none`, opacity-faded text, or `maximum-scale`.
- **Phone layouts are scoped** under `body[data-device="phone"]` and driven by `crmDevice()`; desktop must be untouched by phone work and vice-versa. Breakpoints are content-driven (1400/1100/1024/860/700) — don't "normalise" them.
- **Don't change the design** without being asked. Bug fixes and contracts, yes; new visuals, ask.

## Map
- `crm.js` — one file, banner-commented sections. Spine: delegated `[data-action]` click → `CRM_ACTIONS[action](el, ev)` (line ~982). Init: `crmInit*View(params)`. Shell: `crmRenderShell`, `crmBindDrawer`, `crmSheet` (MicroModal), `crmToast`, `crmRequest`, `crmNetBanner`, `crmShowLoading`.
- Daily View: `crmRenderInbox` → `crmOpenLead` → `crmRenderThread` / `crmThreadEntry` (typed entries) → `crmSendStub` → `crmDeliver` (Sending → Delivered / Not sent). Header actions open sheets; `crmQuickEdit` is the stage editor used everywhere.
- Pipeline: `crmBoardLeads` (filters/search) → `crmRenderBoard` (columns, drag with confirm-on-drop) or `crmRenderLeadTable` (`CRM_TABLE_COLS`, sortable). Phone: `crmRenderPhoneBoard`, stage strip, `crmBindTouchDrag`, `crmPhoneLeadScreen`.
- Calendar: `crmVisibleEvents` → `crmRenderTimeGrid` / `crmRenderAgenda` / `crmRenderMonth` / `crmRenderYear`; `crmOpenPopover` is the one card to view and edit; `crmCreateEvent` → draft → `crmCommitEvent`; `crmSlotsFor(store, date)` derives open slots from store hours. Phone: `crmRenderPhoneCalendar`, zoom levels via `crmPhoneZoom`.
- `data.js` — `CRM_DATA.roles[role].desks[desk].leads`, `CRM_DATA.calendar.events[role]`, `CRM_DATA.stores`, `CRM_DATA.assistant`. Sample dates use `REL(n)` relative to today.
- `actions.json` — generated from `CRM_ACTIONS`: domain actions, reads, UI-only actions, assistant policy, agent trigger events.

## Derived data (the rules a backend must reproduce)
- **Lead status pills / timers** (`lead.pill`, `lead.card.timer`): hard-coded in the sample; the intended rule is in HANDOFF → *How a lead's status changes* (new-lead response window drives `3m left`; missed window → `overdue`).
- **Focus row ranking** (`crmFocusScore`): urgent 5 · overdue 4 · due-soon follow-up 3 · appointment today 2 · unread 1.
- **Event status** (`crmStatus`): cancelled > done > overdue > past; the same glyph vocabulary everywhere (`crmStatusGlyph`).
- **Stage guard** (`crmCanSetStage(lead, stage, actor)`): sales → Agreed/Lost only (+ reopen Lost → Working); management → any, backward needs a reason; assistant → never.
- **Open slots** (`crmSlotsFor`): store hours per weekday minus booked events, 30-minute steps.
- **Visible board** (`crmBoardLeads`): owner scope → stores → owners → waiting-on → search.

## Test recipes
- Syntax: `node --check crm.js`; manifest: `node -e "JSON.parse(require('fs').readFileSync('actions.json','utf8'))"`.
- Serve: `python3 -m http.server 8765` in the parent folder; pages take `?role=sales|management|consignment&device=phone|desktop`, `?labels=1` shows the block-label overlay.
- Lighthouse (all six should be 100 a11y): `npx lighthouse "http://127.0.0.1:8765/<page>.html?role=sales&device=desktop" --preset=desktop --only-categories=accessibility --output=json --chrome-flags="--headless=new"` and the same with `--form-factor=mobile` + `device=phone`.
- Keyboard: Tab from the top of each page — first stop is the hamburger; open any sheet → Tab stays inside → Escape returns focus to the opener. Scorecard in HANDOFF.
- States: Settings → Connection → Slow (skeletons on reload), Offline (banner, *Not sent · Retry*, refused saves).

## Good first tasks (prompts that fit this codebase)
1. "Replace the body of `crmRequest` with a fetch client against `<API>`; keep the `{ offline:true }` rejection shape. Map labels `'load leads'`, `'load board'`, `'load calendar'`, `'send message'` to endpoints. Don't touch callers."
2. "Migrate `data.js` leads to the *Data contract* shapes in HANDOFF (contacts[], message status enum, stageHistory) and update `crmThreadEntry`, `crmDeliver`, `crmSetStage` to read them. Screens must render identically."
3. "Emit the events in `actions.json → events_for_agents` from the places that already compute them (`crmRenderTabs` for due/overdue, `crmSendStub`/`crmDeliver` for replies and failures, `crmSetStage`), as a small `crmEmit(kind, payload)` bus; subscribe the toast and the focus row to it."
4. "Regenerate `actions.json` from `CRM_ACTIONS` with a script, so it can't drift."
5. "Add the roving-tabindex pattern to the inbox list (Tab lands on the current row, ↑/↓ move, Tab leaves) and a skip link per page — see HANDOFF → Keyboard rules, item 4."
6. "Build one worked assistant example: a drafted reply proposed into the composer with Accept / Edit / Dismiss, carrying `by:'assistant'` so `crmProvenance` labels it; `crmCanAct('send-message','assistant')` is `propose`, so Send stays with the person."

When in doubt, prefer the smallest change that keeps every name and every rule above intact, and re-run the Lighthouse and keyboard checks before calling it done.
