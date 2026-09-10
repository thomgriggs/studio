# Low-fidelity flows

## Project setup

```text
Welcome
  -> Choose starter / Import HTML / Blank project
  -> Scan markup
  -> Review suggested editable regions on the page
       -> Approve
       -> Rename or change field type
       -> Ignore
  -> Choose locales and publishing directory
  -> Create administrator credentials
  -> Open site in Edit mode
```

The scan is a suggestion step, never an irreversible conversion. A user can go
back, rescan, or annotate the HTML manually.

## Edit a page

```text
Published site
  -> Sign in
  -> Edit mode shows labeled boundaries
  -> Select region by click, Tab, or page outline
  -> Type inline OR open field panel
  -> Autosave draft
  -> Preview draft at chosen width/locale
  -> Publish now / Schedule / Keep draft
```

The toolbar always communicates mode, locale, save state, and whether the viewer
is looking at published or draft content.

## Edit repeated content

```text
Visible offer card                         Back office > Offers
  -> Duplicate                              -> Select offer
  -> Draft copy opens                       -> Duplicate
  -> Edit fields             <same entry>   -> Edit fields
  -> Choose approved placement/filter       -> Choose placement/filter
  -> Preview and publish                     -> Preview and publish
```

Both entrances use the same identifier, schema, permissions, validation, draft,
and revision history.

## Translation review

```text
Enable Spanish
  -> Generate translations for eligible fields
  -> Review source and target side by side OR on translated page
  -> Edit imperfect wording
  -> Mark human override
  -> Preview locale
  -> Publish locale

Later source edit
  -> Mark related translation potentially stale
  -> Keep human override intact
  -> Review only affected fields
```

## Publish and rollback

```text
Draft preview
  -> Run validation/accessibility/link checks
  -> Publish now OR schedule
  -> Create immutable published revision
  -> Static output generated atomically

History
  -> Select revision
  -> Compare with current content
  -> Restore as a new draft (never erase later history)
  -> Preview and publish
```

## Small-screen behavior

On narrow screens, the page remains the main surface and field controls open in a
bottom sheet. The page outline provides a dependable alternative when overlay
boundaries would be crowded. Full schema administration can explain that a wider
screen is recommended, but content editing must remain functional.

