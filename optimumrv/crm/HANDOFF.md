# Optimum RV CRM — prototype handoff

Static HTML/CSS/JS click-through of the CRM mockups in `screens/`. Nothing talks to a server; every screen renders from `data.js`. The point of this shell is the **naming**: every block, field and control is labeled so functionality can be wired without guessing.

Open `index.html` through any static server (e.g. `python3 -m http.server` from the parent folder) — `file://` works too, but fonts and Feather icons need network access.

## Pages and roles

| Page | Roles | Query params |
|---|---|---|
| `daily-view.html` | sales, management, consignment | `?role=` · `desk=` (consignment: `consign` \| `backoffice`) · `tab=` · `lead=` |
| `pipeline.html` | all | `?role=` · `desk=` (consignment: `consign` \| `backoffice`) |
| `calendar.html` | all | `?role=` |

`<body data-view data-role data-desk>` carries the current page context. Role-specific chrome is present in the markup for every role and shown/hidden with `[data-role]` CSS, so one file shows every variant.

Roles are chosen on `index.html` (or via `?role=` in the URL). (The block-label overlay that used to live in the sidebar is gone; add `?labels=1` to any view's URL to see it.)

## Naming contract (shared with optimumrv.com)

**Tokens** — `crm.css` `:root`, same `--group_name` pattern as the website (`--color_red`, `--font_name-primary`, `--gutter`). CRM-only groups: `--stage_*` (one hue per pipeline stage), `--status_*` (pill tones), `--thread_*` (message bubbles).

**Blocks** — flat, descriptive class per screen region; descendant selectors inside a block; modifiers as a second class; state as `.is-open` / `.is-active` / `.is-done` / `.is-current`. Every block opens with a `/* ===== NAME ===== */` banner in `crm.css` and an `<!-- ===== NAME : purpose ===== -->` comment in the HTML.

```
.topbar  .menu-btn  .sidebar-navigation  .primary-navigation  .nav-item  .global-overlay
.daily-view
  .inbox        .inbox-header  .desk-toggle  .inbox-tabs  .inbox-search  .inbox-list  .inbox-item
  .conversation
    .lead-header  .lead-identity  .lead-name  .lead-badges  .lead-contact  .lead-actions  .action-button  .lead-cta
                  .stage-stepper  .stepper-status  .lead-summary  .summary-card
    .thread       .thread-day  .thread-event  .thread-message(.outbound|.inbound)  .thread-image
                  .thread-call  .thread-note  .thread-email
    .composer     .composer-mode  .composer-input  .composer-tools  .composer-send  .composer-status
.pipeline
  .pipeline-toggle  .pipeline-filters  .filter-control
  .pipeline-column  .column-header  .stage-dot  .column-count  .column-body  .column-lane  .column-empty
    .lead-card      .card-owner  .card-body  .card-head  .card-name  .card-unread  .card-timer  .card-unit  .card-unit-title
                    .card-price  .card-badges  .card-source  .card-loc  .card-stock  .card-activity  .card-flag
    .forsale-summary  .summary-label  .bucket-row  .queue-row  .queue-dot  .queue-label  .queue-note
.calendar
  .calendar-modes  .calendar-filters  .calendar-toggle  .calendar-head  .calendar-day  .calendar-scroll
  .calendar-grid   .calendar-times  .calendar-col  .calendar-now  .calendar-note
    .calendar-event .event-owner  .event-body  .event-text  .event-name  .event-unit  .event-meta  .event-done
    .followup-task
  .event-popover   .popover-head  .popover-facts  .popover-field  .inline-field  .inline-picker  .popover-followups  .popover-actions
shared: .btn(.btn-primary .btn-round .btn-icon)  .pill(.pill-tag)  .avatar  .segmented  .field  .thumb  .context-pill  .menu-btn
```

**Data attributes — what to wire to**

| Attribute | Where | Values |
|---|---|---|
| `data-action` | every button / link / input that does something | Shell: `open-menu` `close-menu` `switch-role` `switch-desk` `open-settings` `sign-out` · Daily View: `filter-inbox` `search-inbox` `compose-new` `open-lead` `call` `text` `email` `schedule` `mark-price-agreed` `send-60-day-update` `schedule-pickup` `request-reevaluation` `waiting-on` `play-recording` `open-transcript` `composer-add` `composer-mode-text/email/note` `insert-template` `ai-assist` `schedule-send` `send-message` · Pipeline: `new-lead` `search-board` `filter-location` `filter-owner` `filter-waiting` `quick-edit` `quick-stage` `quick-reassign` `quick-followup` `toggle-column` `open-bucket` `open-queue` · Decisions: `mark-agreed` `mark-lost` `reopen-lead` · Detail panel: `open-detail` `close-detail` · Help: `open-help` · Phone: `phone-back` `open-focus` `phone-filter` `open-lead-details` `phone-more` `composer-mode-menu` `composer-mode-pick` · Phone calendar: `phone-day-pick` `phone-month-toggle` `phone-cal-filter` `phone-event-more` · Calendar: `cal-prev` `cal-today` `cal-next` `calendar-mode-day/week/month/year` `mini-prev` `mini-next` `mini-pick` `open-day` `open-month` `toggle-calendar` `toggle-followups` `toggle-owner` `search-calendar` `open-event` `open-more` `close-popover` `event-open-conversation` `event-complete` `event-cancel` `event-snooze` `event-delete` `event-add-followup` `complete-followup` `new-event` `new-event-on` `edit-field` `pick-inline` `edit-notes` `inline-month-prev/next` |
| `data-stage` (columns) / `data-lane` | `.pipeline-column`, `.column-lane` | stage ids above; lanes `agreed collecting out signed approved fee progress funded buyin paid` |
| `data-owner` | `.lead-card`, `.calendar-event` | salesperson / lister name |
| `data-event` / `data-day` / `data-mode` / `data-kind` | calendar events & tasks, day columns, view mode, editor kind | ids from `data.js`; `0–6`; `day week month year`; `appointment followup` |
| `data-field` | every dynamic text/image node | dotted path into the lead object — `name` `phone` `email` `location` `owner` `stageNote` `composerStatus` `initials` `time` `unit` `preview` `pill.label` `cta.label` `stage.label` `summary.title/meta/status` `message.body/author/status/image` `call.title/summary` `note.author/text` `email.time/subject/preview` `event.text` `day.label/time` `user.name/initials/location` `app.version` |
| `data-stage` | `.lead-header`, `.inbox-item`, stepper `<li>` | sales: `assigned attempting working agreed` · consign: `+ documents contract processing` · backoffice: `motility checkin arrived forsale deals payout` |
| `data-status` | `.pill`, `.item-unread`, summary tags | `urgent overdue flagged fee-due hold pending info appointment ok confirmed ready neutral dark unread` |
| `data-tone` | `.thread-event`, `.summary-icon` | `warn alert info ok` |
| `data-direction` | `.thread-message` | `outbound inbound` |
| `data-kind` | `.summary-card` | `unit icon` |
| `data-tab` / `data-desk` / `data-lead` / `data-mode` | filter buttons, desk links, inbox rows, composer modes | ids from `data.js` |

Ids are used only for singletons JS needs to grab: `#inbox` `#inbox-list` `#inbox-search-input` `#thread` `#composer-form` `#composer-input` `#sidebar-navigation`.

## data.js shape

```
CRM_DATA.roles[role] = { label, user:{name,initials,location}, defaultDesk, desks }
desks[desk]          = { label, showOwner, stages:[{id,label}], tabs:[{id,label}], defaultTab, defaultLead, leads:[lead] }
lead = { id, name, initials, phone, email, location, owner, badges:[{label,status,icon,chevron}],
         tabs:[tabId], unread:'unread'|'overdue'|null, time, unit, unitPlaceholder, preview, pill:{label,status,icon},
         stage, stageDone, stageNote, flag, cta:{label,action,icon,tone:'primary'|'waiting'},
         summary:[ {kind:'unit', image|svg, star, title, meta, meta2, status:[{label,status}]}
                 | {kind:'icon', icon, tone, title, meta, status:[…]} ],
         composerStatus, thread:[entry] }
entry = { type:'day', label, time }
      | { type:'event', icon, tone, text }
      | { type:'message', dir:'out'|'in', text, label, labelIcon, meta }
      | { type:'call', title, summary }
      | { type:'note', author, text }
      | { type:'email', time, automated, subject, preview, opened }
      | { type:'image', src, caption }
```

Pipeline cards read `lead.card = { image|svg, unitTitle, source, type, loc, stock, price, lane, timer:{label,status,icon}, badges:[…], activity, activityIcon, age, flag:{text,tone,icon}, unread, muted }`. Board layout per desk is `desk.board = { filters:[…], lanes:{ stageId:[{id,label,count,collapsed}] }, summary:{…} }` (the Back Office "For Sale" aggregate column). Leads with `tabs:[]` sit on the board but not in today's inbox.

Calendar reads `CRM_DATA.calendar = { week:{month,days,todayIndex,now,startHour,endHour}, events:{ role:[event] }, types:{…} }` where `event = { id, kind:'appointment'|'followup', day:0–6, start, end (decimal hours), lead, name, unit, type, image|svg, owner, tone, state:'past'|'cancelled', done, timeLabel, label, status }`.

Repeated items are rendered by `crm.js` from the `<template>` elements at the bottom of each page — the template *is* the markup contract for that item.

## How a lead's status changes

Stages move **automatically** from what the salesperson logs; only two decisions are made by hand. One function — `crmSetStage(lead, stage, { by, reason })` in `crm.js` — applies every change and writes a `Stage changed — A → B · by …` event to the thread, so the thread *is* the audit trail.

| Transition | Who | Trigger in the prototype |
|---|---|---|
| (lead created) → Assigned | System | Web form / RVChat / salesperson logs a walk-in (`new-lead`) |
| Assigned → Attempting | System | First outbound action: call outcome logged, text or email sent |
| Assigned / Attempting → Working | System | Customer responds: inbound text (composer `+` → *Simulate customer reply*) or a call logged as **Connected** |
| Working → Agreed | **Salesperson** | `mark-agreed` button in the lead header (unit, price, delivery) |
| Any → Lost | **Salesperson** | `mark-lost` with a reason (Bought elsewhere · No financing · Stopped responding · Changed mind · Other) |
| Lost → Working | Salesperson or Manager | `reopen-lead` — old reason stays on the timeline |
| Any → any | **Manager** | Quick-edit popup on a pipeline card, or drag & drop; backward moves ask for a reason |

**Filters** (`filter-menu`, shared by Pipeline and Calendar): checkbox dropdowns for **stores** (`data-menu="stores"`, from `CRM_DATA.stores`), **salespeople / listers** (`reps` — the reps of the ticked stores), and on the consignment board **waiting-on role**. Each has an *All* row; the button label reads the single selection, a count, or *All …*. Actions: `toggle-menu` `menu-all` `menu-pick`.

**Pipeline card popup** (`quick-edit`, `.quick-edit` / `.stage-picker`): stage picker (steps a role can't set by hand are disabled with a "moves automatically" tooltip), owner select (management / consignment), next follow-up + *Add follow-up*, *Open conversation*. Nothing applies until **Apply**.

**Drag & drop**: cards are draggable (salespeople: only Working cards); a drop never moves the card by itself — it opens the popup with the target stage pre-selected, so every move is confirmed and attributed. Native HTML5 DnD; no touch support (the popup covers phones).

**Lost** is a terminal stage (`terminal:true` in `STAGES`): it renders as a collapsed last column (`toggle-column` expands it), lost leads leave the inbox (`tabs:[]`), the header shows a *Lost · reason* pill and a Reopen button instead of the action row.

**Session persistence** (prototype aid): every mutation is saved to `sessionStorage` (`optimumrv-crm-demo`) so a demo survives page switches. *Settings → Reset demo data* clears it.

## Summary cards → detail panel

The four cards under the lead's name are the "help me close this" facts: what they want (unit), what they bring (trade / payoff), the next commitment (appointment / term), and a blocker if there is one. Clicking any card slides in the **detail panel** (`.detail-panel`, right-hand drawer, `open-detail` / `close-detail`) with the full record behind it plus quick actions that write to the timeline (send photos / brochure / directions, request appraisal, reschedule…). Panel content is derived from the card kind (`crmDetailKind` in `crm.js`: unit, trade, appointment, book, payoff, listing, deal, fee, source); the developer replaces each section with the live record (inventory, JD Power, lender, Motility, the website's browsing history).

## Calendar

Real dates: the sample week floats with the real date — `REL(n)` in `data.js` dates every mock event relative to today (the mock "Wednesday" is always today), so the demo never goes stale. Events carry `date:'YYYY-MM-DD'`, `start` / `end` in decimal hours, `kind` (`appointment` | `followup`), `type`, `owner`, `store` (store code), `state` (`cancelled`), `done`, `notes`. The three "calendars" in the sidebar are derived, not stored (`crmCategory`): follow-ups · deliveries & drop-offs (Delivery / Drop-off / Pickup) · appointments.

- **Navigation** — ‹ Today › (`cal-prev` `cal-today` `cal-next`) sits at the top of the sidebar (`sidebar-nav`); the topbar keeps a title per mode, keyboard ← → t and d w m y. The URL carries `mode` and `date`.
- **Sidebar** (`calendar-sidebar`, always visible on desktop; 260px, 220px under 1100, 200px under 860) — ‹ Today ›, mini month (`mini-pick` moves the cursor and keeps the mode, as iCal does; the month title opens Month), calendar checkboxes (`toggle-calendar`, `toggle-followups`), and salespeople checkboxes for management (`toggle-owner`).
- **Week** — hour grid; overlapping appointments share the column in two lanes; double-click empty space to add at that time. **Day** — hour column plus a Notion-style agenda (`day-agenda` / `agenda-item`) with inline Conversation / Complete / Reschedule. **Month** — iCal grid, up to three bars per day then `+N more` (`open-more`); the date number opens Day, empty cell space opens New with that date (`new-event-on`). **Year** — twelve mini months, dots on days with items; a day opens Day, a month name opens Month.
- **Event popover** (`event-popover`, `open-event`) — one card to view *and* edit. Header: name + status glyph. Every fact is an inline field (`edit-field` → `pick-inline`): **type** (chips), **customer** (list), **date** (mini calendar), **time** (that store's open, unbooked slots via `crmSlotsFor`; taken slots struck through), **duration** (chips), **store** (list), **notes** (textarea, saves on blur). Each change saves immediately, writes an "updated" event to the lead's timeline, re-renders, and keeps the card open on the moved event. Below the facts: the lead's **follow-ups** with checkboxes and `event-add-followup`. Actions: `event-open-conversation`, `event-complete`, `event-cancel` (asks a reason), follow-ups `event-snooze` (tomorrow), and `event-delete` (for mistakes — Cancel is for customers backing out). Becomes a bottom sheet on phones. Esc closes a picker first, then the card.
- **Creating** — "+" (`new-event`), empty month cell (`new-event-on`), or double-click on the hour grid creates the event immediately with sensible defaults (first customer, 11 AM, 1 hour, Ocala) and opens the same card with the customer field ready to change — iCal-style. There is no separate editor form.
- Why each view exists — Day: what am I doing today, in order. Week: where are my gaps for appointments. Month: how full is the month, when do terms end. Year: seasonality and term-end clusters.

## Phone: Daily View

Salespeople work from their phones, so the Daily View has a real phone layout modeled on **iPhone Messages** — two full screens, not a squeezed desktop.

- **Detection** — `crmDevice()` sets `body[data-device="phone"]` when the viewport is ≤ 700px wide, or a touch device ≤ 900px (landscape phone). Re-evaluated on resize. Overrides for demos: `?device=phone` in the URL, or *Settings → Phone preview* (remembered for the session). `phone.html?src=…` shows any page inside a 390×844 iPhone frame; it passes `inset=44` to fake the notch (`--safe_top`, otherwise `env(safe-area-inset-top)`).
- **Screen 1 — inbox** (`phone-topbar` · `inbox-tabs` · `phone-focus` · `inbox-list` · `phone-bottombar`): a round menu button on the left and a round **filter** button on the right (no title — the space is for content) (`phone-filter`) that opens New / Due / All as a sheet — a dot on the icon means a non-default filter is on; the **Focus row** — up to six circles chosen by `crmFocusScore` (response clock › overdue › clock pills › today's appointment › unread), each with a status dot; the list of `inbox-item` rows (avatar · name · preview · time · chevron · status pill); bottom bar with search and **compose** (`compose-new`, the New lead sheet).
- **Screen 2 — conversation** (`phone-topbar` · `lead-header` · `thread` · `composer`): slides in from the right; back chevron, avatar + name (tap → `open-lead-details` sheet: phone, email, store, stage, owner), **Call**, and a **⋯ menu** (`phone-more`, iOS dropdown) holding Schedule, the role CTA, Mark agreed, Mark lost / Reopen — Text and Email are the composer modes, so they aren't repeated. Header on the phone: summary cards as a horizontal strip (tap → detail panel as a **bottom sheet**), then the compact stepper. Composer is one row pinned to the bottom — **+** · a **mode icon** (`composer-mode-menu`: Text / Email / Note as an iOS dropdown; the icon shows the current mode) · the message field · send — with the texting opt-in line above it; it rides above the keyboard (`visualViewport` → `--keyboard_offset`).
- **Back** — chevron (`phone-back`), the phone/browser back button (screens are pushed into `history`), or a swipe from the left edge. The inbox keeps its scroll position. `?lead=` deep-links straight to a conversation; reloading the inbox screen stays on the inbox.
- Modals and the detail panel become bottom sheets on the phone; the app drawer goes full-screen.
- Pipeline and Calendar still use their responsive desktop layouts on phones — their phone rounds are separate.

## Phone: Calendar

Modeled on **iOS Calendar in day mode** — the view a salesperson uses on the lot. Same shell rules as the phone Daily View (`body[data-device="phone"]`, 64px top bars with round buttons, full-screen slide-in, bottom sheets).

- **Screen 1 — day** (`phone-cal`: `phone-topbar` · `phone-month` · `phone-week` · `phone-agenda` · `phone-bottombar`): hamburger; three zoom levels like iOS Calendar (`crmCal.level` = day · month · year, `crmPhoneZoom`): the title button zooms **out** (day → scrolling stack of months → scrolling stack of years, `phone-month-toggle`); tapping a day (`mini-pick`) or a month in the year stack (`phone-year-month`) zooms back in; **Today** in the bottom bar zooms **in** (year → month → today's day) and, at day level, jumps to today; the day level is the same hour grid as desktop (`#calendar-grid` is moved into `#phone-agenda`, one column, `--calendar_hour:72px`, now-line, opens scrolled near now / store opening) — the list layout is only used for search results; swipes (touch or mouse drag) on the week strip move a week and on the day move a day, both with an iOS-style slide (`crmPhoneSlide`); on the right a **funnel** (`phone-cal-filter`: Appointments / Deliveries & drop-offs / Follow-ups checkboxes, plus Salespeople for management; a dot on the funnel means something is hidden) and **+** (`new-event`). The **week strip** is Sun–Sat with the weekday letter, today ringed, the selected day filled, dots on busy days; swipe it for the next/previous week (`phone-day-pick` on tap). The **agenda** is the selected day's items in order (time · category bar · name · type/unit · status glyph; follow-ups keep their checkbox); swipe it left/right for the next/previous day; a **Today** button sits at the left of the bottom bar (bold when you're away from today). The bottom bar's search matches across all days (results grouped by date); compose creates a new appointment on the selected day.
- **Screen 2 — event** (`phone-event`): the same inline-editable card as the desktop popover (type · customer · store · unit · phone, Starts / Duration with the mini-calendar, store-slot and duration pickers, notes, the lead's follow-ups + Add follow-up, Open conversation) under a top bar with the back chevron, the customer's avatar + name (tap → details sheet) and a **⋯** menu (`phone-event-more`: Complete / Cancel with reason / Delete; follow-ups: Done / Tomorrow / Delete). Every change saves at once and the agenda behind it updates. Back = chevron, phone back button, or a left-edge swipe. `?event=<id>` deep-links to it.
- **New** — + / compose open the draft card as a full-width bottom sheet (X left, red check right) for the selected day; saving lands it in the agenda and opens its event screen.
- Week / Month / Year as separate modes are desktop only.

## Questions for the client

Decisions this prototype assumes that only Optimum RV can confirm:

1. **Consign vs Back Office** — are these two jobs (salesperson lists the unit; an inventory/buy-in admin takes over after signing) or one? Intent behind the two boards in the mockups.
2. **Response-time rule** — is there a real "reply within 15 minutes" expectation on new leads? It drives the `3m left` pills and the Assigned column.
3. **Who assigns leads** — manager, round-robin, by store, whoever is on the floor?
4. **Call recording / transcripts** — does the phone system record outbound calls?
5. **Email open tracking** — is "Opened" available from the mail provider?
6. **Do managers text customers?** — the prototype assumes managers supervise (note / reassign / take over) rather than reply.
7. **Store hours** — Ocala verified from the site (Mon–Sat 8–7, Sun 11–5); other stores assumed the same.
8. **Stage names** — does the floor already use words for these states (New / Contacted / Appointment / Sold / Lost)? Use theirs.

## Every control responds

Rule of the prototype: **any `data-action` either performs a prototype-level version of the action or opens an action sheet** (the shared `.modal` block, same as the website's MicroModal dialog) that shows a mock of what would happen and states *why* the control exists. Those "why" lines are the grounding notes for the developer and the client — read them as the spec for that control.

Real behavior (no server): role/desk switching, drawer, inbox tabs + search, open lead, composer send (text/email/note), call outcome → timeline, schedule → timeline, mark price agreed → stage change, send 60-day update → email entry, attach / saved reply, new lead (from Daily View compose or Pipeline +), board filters (location / owner / waiting-on) + search, bucket & queue drill-downs, calendar Day / Week / Month / Year, follow-ups toggle, complete a follow-up, New event (date / time / duration pickers, saves to the grid), settings sheet.

Not modeled at all (would be new design work): drag-and-drop between stages, actual phone/SMS/email delivery, a customer-facing side, multi-store switching, reporting.

The `sheet-reason` text on each action is the current best guess at the business reason. Anything marked "(assumes …)" — call recording, the 15-minute response rule, email open tracking — needs confirming with Optimum RV.

## Assets

- `assets/optimumrvlogo.svg` / `-alt.svg` — live wordmarks from optimumrv.com.
- `assets/unit-*.webp` — placeholder RV photos from the website; `#rv-trailer` / `#rv-motorhome` inline SVG symbols are the no-photo fallback.
- `js/feather.min.js`, `js/micromodal.min.js` — same builds as the website. Icons are `<i data-feather="name">` replaced on load.


**Calendar location.** Every appointment / delivery carries a `store`; it shows on the event card (`data-field="store"`) and the agenda line. The sidebar's *Activity* list is the kind of interaction the salesperson is having, not separate calendars. A salesperson is assigned one store, so they get no store picker (just the *Ocala, FL* pill). Management can see many: the store filter (`CRM_MENUS.stores`, the same checkbox dropdown as the pipeline) plus the salespeople filter that follows it. On the phone the store picker is the pin button (`phone-cal-stores`, `toggle-store`) beside the funnel, shown for management only; the funnel's red dot marks when activity or salespeople are being narrowed.

**Page titles.** Each view keeps its `<h1 class="page-title">` for screen readers and the document outline, but it is `sr-only` — the desktop bars don't spend space on "Daily View" / "Calendar" / "Pipeline"; the tab title and the drawer's active item say where you are.

## Pipeline: Board / List

The topbar's **Board | List** segmented control (`board-mode`, persisted in `sessionStorage` as `optimumrv-crm-board-mode`) switches between the kanban and a sortable table of the same leads. Same filters, same search, same quick-edit (click a row). The table (`.lead-table`, built by `crmRenderLeadTable`) has Lead · Unit · Stage · Owner (roles with owners) · Waiting on (desks that use it) · Last activity · Age · Timer; click a header to sort (`table-sort`, `aria-sort` on the `th`); "Show lost" in the footer. Column definitions live in `CRM_TABLE_COLS`. Anything carrying `data-stage` gets `--stage_color` from the colour map at the top of the pipeline styles, so stage chips and dots stay consistent across board, list and phone.

## Phone: Pipeline

Same shell as the other two views. **Top bar**: round hamburger · nothing in the middle · [pin — stores, management/consignment] · [funnel — salespeople / listers / waiting-on, when the desk has those filters] · **+** (new lead). Consignment gets the Consign / Back Office segmented control under the bar (`#phone-desk`). **Stage strip** (`#phone-stages`, `phone-stage-pick`): one pill per stage with its count, the selected one filled. **Board mode** (default) is the same kanban as desktop — `#pipeline` is moved into the phone shell, grey columns at 84vw so the next one peeks, horizontal snap scrolling, each column scrolling on its own; the strip follows the scroll and a pill tap scrolls to its column; tap a card for the lead screen; **long-press a card to lift it** (`crmBindTouchDrag`), drag across columns — the board auto-scrolls at the edges — and drop on a column for the same confirm-on-drop quick edit as desktop. The **list/columns button** in the top bar (`phone-board-mode`) switches to **List mode** — swipe the rows left/right to move a stage with the same slide as the calendar (`crmPhoneSlide`). **Rows** (`crmLeadRow` → `.lead-row`, shared with the desktop search results): unread/overdue dot · avatar · name · unit or source · last activity (+ owner for managers) · flag · timer + age + chevron. Search in the bottom bar matches across every stage, grouped by stage. The For-Sale summary desk renders its buckets in place of rows.

Tap a row → **lead screen** (`.phone-lead-screen`, `crmPhoneLeadScreen`, history push like the others): back chevron · avatar + name (tap → lead details sheet) · **⋯** (`phone-lead-more`: Mark agreed / Mark lost / Reopen / Schedule — the stage ones open the quick-edit sheet with that stage proposed, so the confirm-and-reason rules still apply). Body: unit + price, flag, then a grouped list — **Stage** (tap → quick-edit bottom sheet), Owner, Waiting on, Store + source, **Next follow-up** (tap → quick-edit, add one) — the last activity, and two buttons: **Open conversation** (deep-links to the Daily View) and **Call**. Drag (long-press) and every other stage change go through the quick-edit sheet's confirm.

**Narrow desktop (< 1100px).** The Daily View keeps the thread tall: the lead summary cards get compact, and the composer's Text / Email / Note control collapses into the phone's single mode icon with its dropdown (`composer-mode-menu`).

**Lead summary is always one row.** `.lead-summary` is a single flex row at every width — the moment it stacks there is no room left to message. No scrollbar: when the row overflows, round arrows appear at its edges (`summary-scroll`, `.summary-arrow`, `has-prev`/`has-next` classes kept current by `crmSummaryArrows`) and each click pages one card.

**Lead actions under 1024px.** The Call / Schedule / Agreed / Lost strip condenses to the phone's pattern: a round **Call** and a round **⋯** (`.lead-actions-compact`) whose menu (`phone-more`) carries Schedule, the role CTA, Mark agreed / Mark lost / Reopen.

## Type scale

Nine steps, all tokens in `:root`; every `font-size` in `crm.css` uses one of them (the only exceptions are one relative `.85em` and the start page's hero clamp):

| token | size | used for |
|---|---|---|
| `--font_size-display` | 2rem | phone year heading, big numbers |
| `--font_size-title` | clamp(1.5–1.9rem) | page/lead titles |
| `--font_size-large` | 1.375rem | section titles, month headings, phone month title |
| `--font_size-medium` | 1.125rem | column headings, calendar title, list names |
| `--font_size-primary` | 1rem | body, inputs, card names |
| `--font_size-small` | .875rem | secondary lines, meta, pills |
| `--font_size-xsmall` | .75rem | labels, timestamps, counts |
| `--font_size-tiny` | .6875rem | owner stripes, mini-month weekdays, dense chrome |
| `--font_size-micro` | .625rem | year-view day numbers, now-label |

Add a size by picking the nearest step, not by writing a new rem.

## Keyboard focus

One global rule at the top of `crm.css`: anything interactive gets a 2px `--color_brand-secondary` ring on `:focus-visible` (keyboard only — mouse and touch never show it). Text fields hand the ring to their `.field` / `.composer-input` wrapper. Don't add `outline:none` to interactive elements; if a component needs a different ring, override `:focus-visible` on it.

## Keyboard rules (layers)

1. **If you can't see it, you can't tab to it.** Off-canvas layers carry `inert`: the drawer when closed, the details panel when closed, and on the phone the screen that isn't current (`crmShowScreen` toggles it). Nothing hidden by a transform is ever left in the tab order.
2. **Every layer returns focus to what opened it.** Sheets (`crmSheet` → MicroModal `onClose`), the drawer, the details panel and the calendar event popover all remember `document.activeElement` on open and focus it again on close. Sheets trap Tab inside (MicroModal); Escape closes every layer.
3. **Tab order is reading order, region by region**: top bar → (Daily View) tabs → inbox rows → lead header → thread → composer; (Calendar) top bar → sidebar nav → mini month → activity → grid; (Pipeline) top bar → filters → columns left-to-right, cards top-to-bottom.
4. **Still to build (developer):** roving-tabindex groups for the inbox list, week strip, stage strip and segmented controls (Tab lands on the current item, arrows move within); a skip link per page; a `?` sheet listing the calendar shortcuts (← → t d w m y).

## Contrast

Small text meets WCAG AA (4.5:1) on the surfaces it sits on: `--color_text-muted` is `#6b6b6b` (timestamps, meta, labels — 4.85 on the grey list, 5.3 on white); avatar initials sit on `#6a6a6a`; pill *text* uses the `--status_*-text` tokens (one step darker than the tone) while dots, icons and stripes keep the brighter `--status_*` tone (3:1 is the bar for non-text). If a new tinted pill is added, give it a `-text` token rather than reusing the tone.

## Target sizes

Every pointer target is at least 24×24 (WCAG 2.5.8): inline text links (contact lines, Recording / Transcript) get a 24px hit area via padding that doesn't move the layout; checkboxes stay their native 16px with 4px clear space (the standard's spacing allowance) and, where possible, a clickable label around them. Keep new controls on `.btn` / `.menu-btn` (36–40px) rather than bare links.

## Keyboard scorecard (2026-09-21)

Tab walk — every stop named, in reading order, nothing hidden: Daily View 33 stops · Pipeline 15 · Calendar 69 (35 are mini-month days; a roving group would make that one stop). One unnamed stop: the calendar search input (label is visually hidden — fine for screen readers, flagged only by the walk).

| task, keyboard only | result | keystrokes |
|---|---|---|
| Reply to a lead (open row → type → Enter) | pass | ~50 incl. the message |
| Mark a lead Agreed from the conversation | pass | 18 |
| Move a card to Agreed on the board (no drag) | pass | 14 |
| Create an appointment from + | pass* | ~19 |
| Sheets: Tab stays inside · Esc closes · focus returns | pass | — |
| Drawer: focus moves in · Esc closes · focus returns | pass | — |
| Calendar shortcuts ← → t d w m y | pass | 1 each |

Two gaps found and fixed the same day (`crmOpenPopover` focuses the card's first control when opened from the keyboard; `crmSheet`'s focus-return falls back to the visible lead name when the opener has hidden itself):
1. ~~**Draft card doesn't take focus.**~~ Pressing + opens the event card but focus stays on the + button; a keyboard user has to Tab a long way to reach it (the card is at the end of the DOM). Fix: focus the card's first field on open (the phone event screen and sheets already do this).
2. ~~**Focus lost after a stage change.**~~ After "Mark agreed" the opener button hides itself (it no longer applies), so the focus-return has nowhere to go and lands on `<body>`. Fix: fall back to the lead name / next visible action.

## VoiceOver script (10 minutes)

Mac: ⌘F5 turns VoiceOver on/off. VO = Control+Option. iPhone: Settings → Accessibility → VoiceOver, or triple-click the side button. Close your eyes for the run.

1. **Daily View, inbox.** VO→ through the first three rows. You should hear: name, time, the preview, and the timer ("3 minutes left"). *If you hear only the name and time, the pill and the unread dot aren't being read — that's the colour-only gap.*
2. **Open Marcus.** VO-Space on his row. You should hear the lead name announced and land in the conversation. Tab to the composer, type, Enter. Listen for the new message being read (the thread is a live region).
3. **Stepper.** VO→ across "Assigned · Attempting · Working · Agreed". You should hear which one is current. *If all four sound the same, the current step is colour-only.*
4. **Mark Agreed.** Activate it; you should hear "dialog, Mark agreed". Tab to Apply, activate. Listen for confirmation. *Expect silence here — that's item 5 (toast/announce) on the list.*
5. **Pipeline.** VO→ across the column headings: you should hear "Assigned, 2" style counts. Then into a card: name, unit, last activity. *Does the stage colour get read? No — the column heading is the only cue.*
6. **Calendar, week.** VO→ into the grid: an event should read as name, type, time, store. Tab to a follow-up checkbox and toggle it with Space.
7. **iPhone, Daily View.** Swipe right through the focus row: each circle should read a name. Double-tap one. Swipe to the back button: should read "Back to inbox".
8. **iPhone, Calendar.** Swipe to the month title: should read "September, button". Double-tap: should read the month stack. Find Today at the bottom.

Write down anything that was silent, read twice, or read in the wrong order.

## Toast (confirmation)

`crmToast(message, { tone:'warn', undo:fn })` — a dark pill, bottom-centre (above the composer on the Daily View, above the bottom bar on the phone), gone after 4 s (6 s with Undo) or on click. The stack is a `role="status"` live region, so the same words are announced to screen readers. Wired to: stage changes (with Undo), Text/Email/Note sent, empty Send ("Type a message first", amber), appointment/follow-up saved (Undo), complete/reopen, cancel (Undo), delete (Undo), follow-up added from quick-edit, filter select-all. Try them on `toast-preview.html`. Rule: any action that changes data and isn't visible where the user is looking gets a toast; an action whose result *is* what you're looking at (opening a sheet, switching a tab) does not.

## States — loading, offline, failed send, no results (and how to tie in)

**Try it:** Settings → *Connection* → Normal · Slow · Offline (remembered for the session, so it follows you between views).
- **Slow** — reload any view: skeleton placeholders (`crmShowLoading(el, kind)`, kinds `list` `thread` `board` `grid` `agenda`) sit where the data will be, then the real content renders. Send shows *Sending…* for a beat, then *Delivered*.
- **Offline** — an amber banner (`.net-banner`, `role=status`) sits under every top bar: "You're offline — showing what was loaded last…" with **Retry**. Loads still show the last data. Sends land in the thread as **Not sent · Retry** (red bubble); stage changes and appointment saves are refused with a warning toast and nothing changes. Retry re-checks; when the connection is back the banner goes and a toast says *Back online*.
- **No results** — searching the inbox or the board with no match shows "No leads match “…”" with a **Clear search** button (`clear-search`, `data-target` = the input's id); an empty tab/column without a search keeps its own empty state.

**The seam.** Every load and every write goes through one function:

```js
crmRequest(label, work) → Promise   // crm.js, top of file
```
In the prototype it resolves `work()` from memory (Slow adds 1.4 s; Offline rejects with `{ offline:true }`). **To connect the real backend, replace the body of `crmRequest` with a fetch and leave the callers alone** — skeletons, the banner, message states, refused saves and toasts all already key off its promise. Call sites today: initial loads in `crmInitDailyView` / `crmInitPipeline` / `crmInitCalendar` (`'load leads'`, `'load board'`, `'load calendar'`), `crmDeliver` (`'send message'`), `net-retry` (`'reconnect'`). Writes that must refuse when offline check `crmNet.offline` at the top of `crmSetStage` and `crmCommitEvent`; a real API would instead surface the request's rejection the same way (warn toast, state unchanged).

**Message states** are on the thread entry: `pending` → *Sending…*, then `meta:'Delivered'`, or `failed:true` → *Not sent* with `retry-send` (re-runs `crmDeliver`). Each rendered message carries `data-index` so a state change re-paints just that bubble.

**What isn't simulated** (call it out to the client): partial failures (some items load, one doesn't), conflicts (two people editing the same lead), and background sync of changes made while offline — the prototype refuses offline writes rather than queueing them, which is the simpler rule to explain on the lot.

## Performance (measured 2026-09-21, Lighthouse 13, local server)

Fast in use — total blocking time 0 ms, layout shift ≈ 0 on every view; all data is in memory so interactions are instant. Load weight is the only issue, and only on mobile: ~940 KB per page → Lighthouse mobile 75–82 (desktop 91–100). Deliberately left as-is during development; the build pipeline should handle it:

1. **Photos** — `assets/unit-*.webp` are full-size (243 KB + 106 KB) but drawn at 84×56 in the summary cards. Serve thumbnails (or `srcset`).
2. **Minify + gzip** `crm.js` (198 KB) and `crm.css` (159 KB) → roughly 80 KB together.
3. **Fonts and icons** — self-host the two Roboto weights in use; prune `feather.min.js` (74 KB) to the ~40 icons the app uses.

1 + 2 alone should put mobile in the 90s. Nothing here changes how anything looks.
