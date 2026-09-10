# Initial threat model

## Assets to protect

- Administrator and editor accounts and sessions
- Draft and published content, revisions, and scheduled actions
- Uploaded media and private form submissions
- Translation, email, deployment, and webhook credentials
- Preview URLs and unpublished material
- Published-site integrity and visitor privacy
- The developer's local files and build environment

## Trust boundaries

```text
Public browser -> published static site -> optional form endpoint
Editor browser -> authenticated CMS server -> content/revision store
CMS server -> filesystem/publisher
CMS server -> optional email/translation/map/deployment providers
Imported HTML/uploads -> validation and sanitization -> managed content/assets
Showcase browser -> isolated disposable store (never production data)
```

## Primary threats and controls

| Threat | Initial controls | Verification |
| --- | --- | --- |
| Unauthorized edits | Server-side deny-by-default authorization; scoped roles; short-lived sessions | Permission tests for every mutation |
| Session theft/fixation | Secure HttpOnly SameSite cookies; session rotation; logout invalidation; HTTPS outside localhost | Cookie/header and session lifecycle tests |
| Cross-site request forgery | SameSite cookies plus CSRF token/origin validation for mutations | Cross-origin mutation tests |
| Stored/reflected XSS | Plain-text escaping; allowlist rich-text sanitizer; no direct HTML insertion; CSP | Malicious-content test corpus |
| Dangerous upload | Inspect type/signature; size limits; generated names; separate asset origin/path; never execute | Polyglot and spoofed-extension tests |
| Broken preview privacy | Authenticated previews by default; expiring scoped share tokens later; no indexing | Anonymous and expired-token tests |
| Privilege escalation | Role checks on server, not hidden UI; schema and integration operations admin-only | Editor attempts every admin route |
| Path traversal/file overwrite | Fixed content root; generated identifiers; resolved-path containment checks; atomic writes | Traversal and symlink tests |
| Command/template injection | No shell interpolation from content; constrained templates; contextual escaping | Crafted template/content tests |
| Data loss/corruption | Immutable revisions; atomic publish; backups; restore drills; schema migration preview | Interrupted-write and restore tests |
| Form abuse/privacy loss | Rate limits; spam adapter; minimum retention; consent; redaction; configurable storage | Flood, export, and deletion tests |
| SSRF through integrations | Provider allowlists; URL validation; restricted egress; timeouts and response limits | Private/link-local address tests |
| Secret exposure | Environment/secret store; redact logs; never send to client or revision data | Repository, bundle, and log scans |
| Dependency compromise | Small dependency surface; lockfile; audit/update policy; provenance review | CI audit and inventory |
| Showcase affects real data | Separate process/store/credentials; resettable seeded state; no production adapters | Cross-environment isolation test |

## Prototype-specific decisions

- The first technical spike binds to loopback only.
- It uses no third-party runtime dependencies.
- Editing APIs accept known field identifiers and plain text only.
- Content is escaped with DOM text APIs in the browser.
- Prototype credentials and in-memory data are demonstrations, not production auth.
- No uploads, rich text, remote providers, plugins, or public preview links are
  enabled in the spike; each requires a focused design review before addition.

## Security gates before wider use

1. Choose and review mature authentication/session infrastructure.
2. Complete a route-by-route authorization matrix.
3. Decide storage encryption, backup, recovery, and secret management.
4. Threat-model HTML import, rich text, media, forms, previews, adapters, and plugins.
5. Add security headers, request limits, audit events, dependency scanning, and
   automated malicious-input tests.
6. Obtain independent review before describing the software as production-ready.

