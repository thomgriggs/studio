# Delivery plan

## Stage 0: Validate before implementation

Deliverables:

- Product brief and scope boundaries
- Universal content model
- Administrator and editor journeys
- Security and privacy threat model
- Accessibility acceptance checklist
- Performance budgets and measurement approach
- Low-fidelity flows for onboarding, visual editing, structured editing, and publishing
- Technical spike proving editable HTML bindings without choosing the whole stack

Exit criteria:

- Hotel, restaurant, golf, spa, and blank examples can be modeled with the same core.
- Visual and structured editing demonstrably address the same draft record.
- Roles and publishing boundaries are agreed.
- The spike meets basic keyboard, sanitization, and payload constraints.

## Stage 1: Homepage vertical slice

Build one coastal-hotel homepage end to end:

- Local project creation and sign-in
- Administrator and editor roles
- HTML annotations and field discovery
- Visual overlays with pointer and keyboard selection
- Inline text editing and image replacement
- Structured back-office view of the same content
- Draft autosave, preview, publish, revision history, and rollback
- Responsive static output
- Automated and manual accessibility checks
- Security tests for permissions, content injection, preview, and uploads
- Performance measurement against budgets

This stage deliberately avoids building the entire back office before the core
editing loop is proven.

## Stage 2: Universal content system

- Custom content types, entries, relations, and validation
- Page and section definitions with guarded reordering
- Globals, navigation, collections, filters, and reusable calls to action
- Media library with variants, focal points, usage references, and alt guidance
- Import and safe schema-change workflows
- Search, duplication, bulk actions, and clear content status

Validation exercise: implement hotel Room/Offer, restaurant Dish, golf Hole, and
spa Treatment schemas without modifying core behavior.

## Stage 3: Complete hotel starter

- Home, Rooms/detail, Dining, Experiences, Offers, Gallery, About, Contact, and Map
- External booking links
- Nearby places and location content
- Gallery and slider section definitions with accessible controls
- SEO metadata, sitemap, canonical and social fields, and structured-data support
- English and Spanish content workflows

## Stage 4: Publishing and operations

- Scheduled publishing and publishing queue
- Translation provider adapter and protected human overrides
- Form builder with email default, storage/CSV/webhook options, and retention controls
- Backup/restore documentation and operational audit views
- Deployment adapters that do not compromise the local-first core

## Stage 5: Showcase and starter ecosystem

- Isolated, resettable public CMS demonstration
- Restaurant, golf, spa, and blank/custom starter proofs
- Onboarding from starter and imported HTML
- Documentation for HTML/CSS users and advanced extension authors
- Case study explaining product, UX, accessibility, security, and performance decisions

## Decision gates

Do not select permanent infrastructure solely from familiarity. Before full build,
compare candidate approaches on:

- Local setup friction and portability
- Published-site payload and rendering independence
- Authentication and authorization maturity
- Content schema migration safety
- Static publishing and preview support
- Extension isolation
- Accessibility of available UI foundations
- Maintenance burden for one person

Likewise, defer public product naming, hosting promises, marketplace/plugin APIs,
and multi-tenant SaaS architecture until the vertical slice proves the experience.

## Immediate next artifacts

1. Draw low-fidelity flows for project setup, page editing, repeated-content editing,
   translation review, and publishing/rollback.
2. Write the threat model and data-flow diagram.
3. Define a small hotel homepage schema and a non-hotel comparison schema.
4. Prototype the binding between one annotated HTML page and one canonical draft.
5. Test that prototype with keyboard-only editing and malicious/invalid content.
6. Measure its published payload before expanding scope.

