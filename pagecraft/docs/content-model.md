# Universal content model

## Primitives

### Site

Contains locales, domains, environments, roles, navigation, integrations, and
publishing settings. Multisite is not required initially, but site ownership
should be explicit in stored records.

### Content type

A user-defined schema such as Room, Dish, Treatment, Golf Hole, Offer, Team
Member, or Nearby Place. It contains fields, validation, permissions, display
labels, preview behavior, and allowed relationships.

### Entry

One structured instance of a content type. Entries have stable identifiers,
locale variants, revision history, and publishing state.

### Page

A routable document with metadata and an ordered set of section instances. A page
may be unique or generated from an entry using a template.

### Section definition

A reusable presentation contract: hero, card grid, gallery, map, call to action,
form, text/media split, or another developer-created block. It defines allowed
fields and layout variants, not industry meaning.

### Section instance

A section placed on a page. Its values may be local, reference a shared entry, or
query a collection. Editors may only use definitions and variants allowed by the
page template and their role.

### Global

Shared content such as contact information, booking/reservation link, footer,
social profiles, announcements, and shared calls to action. Editing a global must
show where it is used before publishing.

### Navigation

An ordered tree of internal pages, entry-generated pages, external URLs, and
labels. Permissions and validation prevent broken or inaccessible menus.

### Asset

An image, video reference, document, or other managed file with metadata,
ownership, usage references, crops/focal point, variants, and locale-aware text
alternatives where appropriate.

### Form

A schema of fields, validation, consent text, success behavior, and one or more
delivery adapters. Email is the default adapter; storage, CSV export, and webhooks
are optional. Sensitive data retention must be explicit.

### Location

An address or coordinate set with contact information, hours, map presentation,
directions, and nearby-place relationships. The core does not mandate a map vendor.

## Field types

Initial types: short text, long text, rich text, number, boolean, date/time,
choice, URL, email, phone, image, asset, gallery, location, relation, repeatable
group, structured SEO, and JSON/advanced data.

Each field can define:

- Label, help text, default value, required state, and validation
- Whether it is translatable and whether values fall back
- Role-level view/edit permissions
- Whether inline editing is safe
- Character or item guidance without arbitrary limits
- Search, sort, filter, and uniqueness behavior where relevant

## HTML annotation contract

The beginner path starts with small, valid `data-*` annotations:

```html
<section data-cms-region="hero">
  <h1 data-cms-field="heading">Stay by the water.</h1>
  <p data-cms-field="introduction">A quiet coastal retreat.</p>
  <a data-cms-field="bookingLink" href="https://booking.example">
    Check availability
  </a>
</section>
```

The system can infer initial field types, but an administrator can later rename,
retype, validate, lock, or translate them through the UI or optional configuration.
Changes must include a safe schema migration preview when existing content could
be affected.

Annotations identify content bindings; they must not determine presentation.
Rendered content must be escaped or sanitized according to field type.

## Starter kits

A starter can bundle templates, section definitions, content-type schemas, sample
content, and design tokens. It cannot add privileged behavior invisibly.

The hotel starter may define Room, Amenity, Offer, Experience, Dining Venue, and
Nearby Place. Restaurant, golf, and spa starters define their own types using the
same primitives. A blank starter proves that custom industries are supported.

