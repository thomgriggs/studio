# Pagecraft

Working promise: **Make any site editable.**

This repository currently contains the pre-build product plan for a lightweight,
local-first CMS. The CMS will let developers use familiar HTML and CSS while
giving nontechnical editors a visual, guarded way to maintain a real website.

The first proof will be a fictional boutique coastal hotel, but hotel concepts
must not be hardcoded into the CMS. Hotels, restaurants, golf courses, spas, and
custom sites will be expressed through reusable content types and starter kits.

## Planning documents

- [Product brief](docs/product-brief.md)
- [Experience and user journeys](docs/experience.md)
- [Content model](docs/content-model.md)
- [Quality requirements](docs/quality-requirements.md)
- [Delivery plan](docs/delivery-plan.md)
- [Low-fidelity flows](docs/flows.md)
- [Initial threat model](docs/threat-model.md)

## Run the vertical slice

The spike requires Node.js 20 or newer and has no third-party runtime packages.

```bash
npm run dev
```

Open `http://127.0.0.1:4173`. Demo accounts are shown on the sign-in screen:

- Administrator: `admin` / `admin-demo`
- Editor: `editor` / `editor-demo`

Run the validation, revision, and payload checks with:

```bash
npm test
```

With the development server running, exercise the HTTP boundary with:

```bash
npm run smoke
```

The demo binds only to loopback. Drafts, published content, and revision history
are stored locally in `data/pagecraft.sqlite` and survive server restarts. Demo
credentials and login sessions are still prototype authentication; sessions reset
when the server restarts.

To use a different local database path:

```bash
PAGECRAFT_DATABASE=/absolute/path/to/pagecraft.sqlite npm run dev
```

The local database and its temporary WAL files are excluded from version control.

## Product principles

1. Ordinary HTML should remain ordinary HTML.
2. Reveal complexity only when it is needed.
3. Offer visual, structured, and code-based paths to the same content.
4. Multiple paths must share one source of truth and one permission system.
5. Editor freedom must stay inside administrator-defined guardrails.
6. Fast, accessible output is a requirement, not an optimization phase.
7. The core is industry-neutral; industry behavior belongs in starter kits.
8. Local-first must not prevent a future hosted option.
