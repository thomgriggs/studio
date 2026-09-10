# Quality requirements

These requirements are acceptance criteria from the first vertical slice, not a
cleanup list for later.

## Lightweight

- Prefer platform HTML, CSS, and browser APIs where they meet the need.
- Keep the published site independent of the editing application when possible.
- Static output is the first publishing target; dynamic features are deliberate.
- Avoid shipping administrator or visual-editor code to ordinary visitors.
- Use modular packages so unused starters and integrations are not bundled.
- Establish measured JavaScript, CSS, image, font, and request budgets before UI build.
- Require evidence before adding a large dependency or permanent service.
- Optimize images and fonts, cache immutable assets, and support responsive media.
- Do not claim performance from a score alone; test representative pages and devices.

Provisional published-page budgets for the vertical slice on mobile:

- Core page JavaScript: target at or below 75 KB compressed, excluding consented integrations.
- Core CSS: target at or below 40 KB compressed.
- No render-blocking third-party scripts by default.
- Largest above-the-fold image: appropriately sized and compressed per viewport.
- Performance targets will be validated with lab tests and real-browser checks.

## Security and privacy

- Use mature, maintained authentication and password hashing; do not invent cryptography.
- Deny by default and enforce authorization on the server for every mutation.
- Separate administrator, editor, showcase, and public capabilities.
- Use secure, HttpOnly, SameSite cookies and CSRF protection where applicable.
- Sanitize rich content using an allowlist and contextually escape rendered values.
- Validate uploads by actual type, size, dimensions, storage location, and access policy.
- Prevent executable uploads from being served as active site content.
- Apply rate limits to authentication, forms, translation, uploads, and public previews.
- Keep secrets outside content, repositories, client bundles, logs, and exports.
- Record security-relevant activity without logging sensitive content unnecessarily.
- Revisions and rollback do not replace backups; document restore procedures.
- Dependency updates, lockfiles, audit checks, and a vulnerability response process are required.
- Form retention, consent, spam protection, and data export/deletion must be configurable.
- Translation providers receive only fields explicitly submitted for translation.
- Published output uses appropriate security headers and a restrictive content security policy.
- Threat-model inline editing, preview URLs, HTML import, plugins, webhooks, and showcase isolation before release.

Security claims require review and testing; the product must never market itself as
“secure” solely because it is small or statically published.

## Accessibility

- Target WCAG 2.2 AA for both published sites and the CMS interface.
- Use semantic HTML and native controls before custom widgets.
- Support keyboard-only use for every primary workflow.
- Provide non-drag alternatives for ordering and moving content.
- Ensure focus is visible, logical, restored after dialogs, and not hidden by overlays.
- Editing boundaries use more than color and do not cover the content being edited.
- Announce autosave, validation, publish, upload, and error status appropriately.
- Meet contrast and target-size requirements across themes and states.
- Respect reduced motion, zoom, text spacing, reflow, and user font-size preferences.
- Give editors useful image-alt guidance while allowing decorative-image decisions.
- Preserve heading structure, labels, language metadata, and meaningful link text.
- Test with automated tools plus keyboard, zoom, and representative screen readers.
- Accessibility guidance should explain consequences without blocking legitimate exceptions.

## Ease of use and intuitiveness

- A user should understand the primary next action without reading a manual.
- Daily editor tasks should not expose administrator configuration.
- Use consistent language across overlay, back office, preview, and documentation.
- Prefer recognition over recall: labels, previews, recent items, and usage locations.
- Autosave must be visible and recoverable; never create ambiguity about published state.
- Errors appear next to their cause and include a recovery action.
- Empty states teach by helping the user create the first useful item.
- Destructive actions explain scope and recovery before confirmation.
- Advanced settings are discoverable but initially collapsed.
- Usability tests must include people who did not help design the system.

## Multiple paths without clutter

- Provide on-page, back-office, and code/config paths where they add real value.
- Keep one canonical record and one validation/publishing pipeline.
- Do not duplicate a feature merely to satisfy the multiple-path principle.
- Maintain parity for essential actions, while allowing complex administration to
  remain in the back office.
- Make each path accessible; keyboard users are not relegated to a lesser workflow.
- Document the fastest path for beginners and the precise path for advanced users.

## Definition of done

A feature is not complete until it has:

- Permission and misuse cases
- Keyboard and screen-reader behavior
- Loading, empty, error, offline/interrupted, and success states as relevant
- Draft, publish, revision, and rollback implications
- Translation and locale behavior where content is involved
- Performance impact measured against budgets
- Tests proportional to its risk
- Plain-language help or an intuitive empty state

