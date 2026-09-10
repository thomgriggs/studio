# Experience and user journeys

## Interaction model

The product supports multiple ways to accomplish important tasks, but does not
show every control simultaneously.

| Task | Contextual path | Structured path | Advanced path |
| --- | --- | --- | --- |
| Edit text | Type on rendered page | Edit field in back office | Edit content data/config |
| Replace image | Select image overlay | Use media field/library | Reference an asset in code |
| Add an entry | Duplicate a visible card | Create in collection | Import structured data |
| Reorder sections | Drag on page | Reorder page outline | Change template/config |
| Edit navigation | Select site navigation | Menu builder | Configure navigation data |
| Translate | Switch page language | Translation workspace | Translation API/integration |
| Publish | Page toolbar | Publishing queue | Scriptable command later |

All paths must honor the same validation, permissions, version history, and
publishing state. A shortcut may never bypass safety rules.

## Visual editing

- The site renders exactly as visitors see it.
- Editable regions have subtle boundaries; hover and focus strengthen them.
- Boundaries cannot rely on color alone.
- Each selected region shows its human-readable name and status.
- Text can be edited inline when safe; complex fields open a side panel.
- Autosave creates a draft and communicates saved, saving, offline, and error states.
- Responsive previews cover common widths without pretending to replace real-device testing.
- Dragging is optional; every drag action has a keyboard/button equivalent.
- Preview clearly distinguishes draft content from published content.

## Back office

The default dashboard shows only relevant work: recent drafts, scheduled items,
translation warnings, form submissions, and content needing attention. Advanced
administration is separated from daily editing.

Progressive disclosure rules:

- Editors do not see schema, integration, or template controls.
- Common fields appear first; SEO and advanced settings are collapsible.
- Bulk operations appear only after selecting compatible records.
- Destructive controls are separated and require clear confirmation.
- Search and command access complement navigation but do not replace it.

## Administrator setup journey

1. Create a local project from a blank site, starter, or imported HTML.
2. Scan markup for likely text, images, links, lists, and repeated patterns.
3. Review suggestions directly on the rendered page.
4. Approve, rename, ignore, or retype each suggestion.
5. Set validation, translation, reuse, and editor permissions as needed.
6. Confirm navigation, global content, and publishing settings.
7. Invite or create an editor account.
8. Run automated accessibility, broken-link, and publishing checks.
9. Preview and publish.

The scan accelerates setup but never silently turns every DOM node into content.

## Editor update journey

1. Sign in and open the actual website in Edit mode.
2. Select a labeled region using pointer, keyboard, or page outline.
3. Edit inline or open its structured form.
4. Autosave to a draft.
5. Preview at multiple widths and languages.
6. Resolve validation and accessibility guidance.
7. Publish now, schedule, or leave the draft for later.
8. Restore an earlier revision if necessary.

## Repeated content journey

An editor can select a visible offer and choose Duplicate, or open Offers in the
back office and choose New/Duplicate. Both paths create the same kind of draft
entry. The editor changes its content, chooses where it appears through approved
relationships or filters, previews, and publishes.

## Translation journey

1. Administrator enables a locale and translation provider.
2. The CMS generates translations only for translatable fields.
3. Generated values are labeled as machine translated and need review.
4. An editor compares source and target content side by side or in page context.
5. Human edits become protected overrides.
6. Source changes mark affected translations as potentially stale rather than
   overwriting human work.
7. Locale-specific slugs, metadata, image text alternatives, and formatting can
   be reviewed independently.

## Showcase mode

Visitors use an isolated temporary session populated with sample content. They
can reveal regions, edit text, replace a sample image, duplicate an offer, switch
languages, and compare draft/published views. Reset is obvious and automatic;
showcase actions never reach production data or credentials.

