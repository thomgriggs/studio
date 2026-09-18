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

Roles are chosen on `index.html` (or via `?role=` in the URL). The **Show block labels** toggle in the sidebar is a prototype aid — remove it for production.

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
| `data-action` | every button / link / input that does something | Shell: `open-menu` `close-menu` `switch-role` `switch-desk` `open-settings` `sign-out` `toggle-labels` · Daily View: `filter-inbox` `search-inbox` `compose-new` `open-lead` `call` `text` `email` `schedule` `mark-price-agreed` `send-60-day-update` `schedule-pickup` `request-reevaluation` `waiting-on` `play-recording` `open-transcript` `composer-add` `composer-mode-text/email/note` `insert-template` `ai-assist` `schedule-send` `send-message` · Pipeline: `new-lead` `search-board` `filter-location` `filter-owner` `filter-waiting` `quick-edit` `quick-stage` `quick-reassign` `quick-followup` `toggle-column` `open-bucket` `open-queue` · Decisions: `mark-agreed` `mark-lost` `reopen-lead` · Detail panel: `open-detail` `close-detail` · Help: `open-help` · Phone: `phone-back` `open-focus` `phone-filter` `open-lead-details` `dictate` `dictate-compose` · Calendar: `cal-prev` `cal-today` `cal-next` `calendar-mode-day/week/month/year` `toggle-sidebar` `mini-prev` `mini-next` `mini-pick` `open-day` `open-month` `toggle-calendar` `toggle-followups` `toggle-owner` `search-calendar` `open-event` `open-more` `close-popover` `event-open-conversation` `event-complete` `event-cancel` `event-snooze` `event-delete` `event-add-followup` `complete-followup` `new-event` `new-event-on` `edit-field` `pick-inline` `edit-notes` `inline-month-prev/next` |
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

Real dates: `CRM_DATA.calendar.now` is frozen at 2026-08-19 11:36 so the demo is stable — the developer swaps it for `new Date()`. Events carry `date:'YYYY-MM-DD'`, `start` / `end` in decimal hours, `kind` (`appointment` | `followup`), `type`, `owner`, `store` (store code), `state` (`cancelled`), `done`, `notes`. The three "calendars" in the sidebar are derived, not stored (`crmCategory`): follow-ups · deliveries & drop-offs (Delivery / Drop-off / Pickup) · appointments.

- **Navigation** — ‹ Today › (`cal-prev` `cal-today` `cal-next`), a title per mode, keyboard ← → t and d w m y. The URL carries `mode` and `date`.
- **Sidebar** (`calendar-sidebar`, `toggle-sidebar`, remembered for the session) — mini month (`mini-pick` moves the cursor and keeps the mode, as iCal does; the month title opens Month), calendar checkboxes (`toggle-calendar`, `toggle-followups`), and salespeople checkboxes for management (`toggle-owner`).
- **Week** — hour grid; overlapping appointments share the column in two lanes; double-click empty space to add at that time. **Day** — hour column plus a Notion-style agenda (`day-agenda` / `agenda-item`) with inline Conversation / Complete / Reschedule. **Month** — iCal grid, up to three bars per day then `+N more` (`open-more`); the date number opens Day, empty cell space opens New with that date (`new-event-on`). **Year** — twelve mini months, dots on days with items; a day opens Day, a month name opens Month.
- **Event popover** (`event-popover`, `open-event`) — one card to view *and* edit. Header: name + status glyph. Every fact is an inline field (`edit-field` → `pick-inline`): **type** (chips), **customer** (list), **date** (mini calendar), **time** (that store's open, unbooked slots via `crmSlotsFor`; taken slots struck through), **duration** (chips), **store** (list), **notes** (textarea, saves on blur). Each change saves immediately, writes an "updated" event to the lead's timeline, re-renders, and keeps the card open on the moved event. Below the facts: the lead's **follow-ups** with checkboxes and `event-add-followup`. Actions: `event-open-conversation`, `event-complete`, `event-cancel` (asks a reason), follow-ups `event-snooze` (tomorrow), and `event-delete` (for mistakes — Cancel is for customers backing out). Becomes a bottom sheet on phones. Esc closes a picker first, then the card.
- **Creating** — "+" (`new-event`), empty month cell (`new-event-on`), or double-click on the hour grid creates the event immediately with sensible defaults (first customer, 11 AM, 1 hour, Ocala) and opens the same card with the customer field ready to change — iCal-style. There is no separate editor form.
- Why each view exists — Day: what am I doing today, in order. Week: where are my gaps for appointments. Month: how full is the month, when do terms end. Year: seasonality and term-end clusters.

## Phone: Daily View

Salespeople work from their phones, so the Daily View has a real phone layout modeled on **iPhone Messages** — two full screens, not a squeezed desktop.

- **Detection** — `crmDevice()` sets `body[data-device="phone"]` when the viewport is ≤ 700px wide, or a touch device ≤ 900px (landscape phone). Re-evaluated on resize. Overrides for demos: `?device=phone` in the URL, or *Settings → Phone preview* (remembered for the session). `phone.html?src=…` shows any page inside a 390×844 iPhone frame; it passes `inset=44` to fake the notch (`--safe_top`, otherwise `env(safe-area-inset-top)`).
- **Screen 1 — inbox** (`phone-topbar` · `inbox-tabs` · `phone-focus` · `inbox-list` · `phone-bottombar`): menu button, "Daily View" with a red badge counting overdue + response-clock leads, and a **filter** button (`phone-filter`) that opens New / Due / All as a sheet — a dot on the icon means a non-default filter is on; the **Focus row** — up to six circles chosen by `crmFocusScore` (response clock › overdue › clock pills › today's appointment › unread), each with a status dot; the list of `inbox-item` rows (avatar · name · preview · time · chevron · status pill); bottom bar with search, **dictation** (`dictate` — a listening sheet; the developer wires the Web Speech API / native dictation) and **compose** (`compose-new`, the New lead sheet).
- **Screen 2 — conversation** (`phone-topbar` · `lead-header` · `thread` · `composer`): slides in from the right; back chevron, avatar + name (tap → `open-lead-details` sheet: phone, email, store, stage, owner), Call. Header order on the phone: summary cards as a horizontal strip (tap → detail panel as a **bottom sheet**), compact stepper, then the action strip (Text · Email · Schedule · Agreed · Lost · role CTA). Composer is one row pinned to the bottom — **+** · Text / Email / Note · the message field · **dictate** (`dictate-compose`) · send — with the texting opt-in line under it; it rides above the keyboard (`visualViewport` → `--keyboard_offset`).
- **Back** — chevron (`phone-back`), the phone/browser back button (screens are pushed into `history`), or a swipe from the left edge. The inbox keeps its scroll position. `?lead=` deep-links straight to a conversation; reloading the inbox screen stays on the inbox.
- Modals and the detail panel become bottom sheets on the phone; the app drawer goes full-screen.
- Pipeline and Calendar still use their responsive desktop layouts on phones — their phone rounds are separate.

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
