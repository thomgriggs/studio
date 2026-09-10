# Product brief

## Vision

Create a lightweight CMS that can make a hand-coded website editable without
forcing its developer or editor into a large framework or a crowded back office.

The same content can be managed in three connected ways:

- **On the website:** click highlighted regions and edit in context.
- **In the back office:** manage pages, entries, media, translations, and batches.
- **In code:** annotate HTML and optionally refine inferred fields in configuration.

These are views of the same records. They must not become separate systems.

## Initial audiences

### Administrator/developer

Knows HTML and CSS, may use AI to help build, and needs control over templates,
content models, permissions, layout rules, integrations, and publishing.

### Content editor/client

Needs to update approved content, duplicate entries and pages, reorder permitted
sections, preview changes, and publish without being able to break the site.

### Showcase visitor

Can safely explore a temporary demonstration of editing without modifying the
published showcase.

## Core jobs

- Import or create an HTML site and identify editable regions.
- Define custom content types without changing CMS source code.
- Edit content inline or through structured forms.
- Reuse global content and reusable sections without accidental divergence.
- Manage pages, collections, navigation, media, forms, locations, and SEO.
- Translate a site automatically, then preserve human overrides.
- Draft, preview, schedule, publish, review history, and roll back.
- Produce fast, responsive, semantic, accessible pages.

## Scope boundaries

The first release is not a booking engine, ecommerce platform, analytics suite,
or general automation platform. External reservation and booking systems are
linked or integrated. These boundaries protect the lightweight core.

## Industry-neutral rule

The core may know what an entry, field, relation, collection, location, or form
is. It must not know what a hotel room, restaurant dish, golf hole, or spa
treatment is. Those are content models supplied by starter kits.

Before a core feature is accepted, ask:

> Can a hotel, restaurant, golf course, spa, and blank custom site use this
> without changing CMS source code?

If not, it belongs in a starter, extension, or integration.

## First showcase

The first starter is a modern boutique coastal hotel with English and Spanish
content. It includes Home, Rooms, Room detail, Dining, Experiences, Offers,
Gallery, About, Contact, Map/nearby places, and external booking links.

Working product name and hotel identity remain provisional. Naming must be
checked before public release.

## Success measures

- A developer can make a basic HTML page editable in under 15 minutes.
- An editor can update text or an image without documentation.
- A trained editor can duplicate and publish an entry without developer help.
- Keyboard and screen-reader users can complete every primary editing workflow.
- Published pages meet an agreed performance budget on representative devices.
- A second starter can be created without adding industry logic to the core.

