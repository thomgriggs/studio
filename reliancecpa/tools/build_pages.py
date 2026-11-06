#!/usr/bin/env python3
"""Step 4: nav.json (+ mega), footer.json, content/proposed/*.json.

Everything is derived from tools/sitemap_data.py and the crawled page text; quoted sentences are looked up in
content/pages/*.json (verbatim) so nothing is retyped. New copy is marked in each page's `confirm` list.
"""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
import build_scope as S
import sitemap_data as D

PAGES, INM, OUT, _ = S.build()
SITE = "https://www.reliancecpa.com"
MD = re.compile(r"\[([^\]]*)\]\(([^)]*)\)")


def plain(t):
    return re.sub(r"\s+", " ", MD.sub(r"\1", (t or "").replace("**", "").replace("*", ""))).strip()


def paras(slug):
    return [b for b in PAGES[slug]["blocks"] if b["type"] in ("p", "text", "ul", "ol") and b.get("region", "main") == "main"]


def sents(slug, idx, k=1, start=0):
    """k sentences of paragraph idx, verbatim (links flattened)."""
    b = paras(slug)[idx]
    t = plain(b["text"])
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z“\"])", t)
    return " ".join(parts[start:start + k])


def items(slug, idx):
    return [plain(i["text"]) for i in paras(slug)[idx]["items"]]


def title_of(slug):
    return plain(next(b["text"] for b in PAGES[slug]["blocks"] if b["type"] in ("h1", "h2", "h3")))


def path(slug):
    return INM[slug]["new_path"]


def url(slug):
    return SITE + path(slug)


# ------------------------------------------------------------------ one-line summaries (drawn from each page's own text)
SUMMARY = {
    "tax-planning.htm": ("A strategy for using the tax incentives, deductions and credits available to you, all year and not just on April 15.", "page: 'a strategy ... tax incentives, deductions, and credits'; 'all year long, not just on April 15'"),
    "business-tax.htm": ("Business tax filing and planning for partnerships, LLCs, S-corporations and sole proprietors.", "page's own list of business types"),
    "income-tax-services.htm": ("Individual income tax returns, estimated tax, deductions and capital gains tax.", "page's own list of services"),
    "tax-problem-irs-audit-help.htm": ("Help with IRS audits, notices, liens, back taxes and unfiled returns.", "page's own list of tax problems"),
    "bookkeeping.htm": ("Bookkeeping and accounting support, with the services you choose from a menu of options.", "page: 'choose the specific services you want from a full menu of options'"),
    "quickbooks-accountant.htm": ("Ongoing QuickBooks support from accountants who know the software.", "page: 'ongoing QuickBooks support'"),
    "reliance-consulting-backoffice": ("Cloud-based services that let you outsource everyday accounting functions.", "page: 'allow you to outsource everyday accounting functions'"),
    "payroll-services.htm": ("Payroll processing and payroll tax compliance, so payroll is not a do-it-yourself chore.", "page: 'escape the many pitfalls of do-it-yourself or in-house payroll'"),
    "cash-flow-management.htm": ("Invoicing review, cash flow forecasting and a plan around the money coming in and going out.", "page's own list"),
    "business-planning-services.htm": ("Business plan writing and planning support for starting and running a business.", "page's own list ('Business plan writing')"),
    "new-business-planning.htm": ("Choosing a structure, writing a business plan and finding financing for a new business.", "page's own list"),
    "business-finance-consultant.htm": ("Researching business loans, including SBA options, and preparing the financial statements lenders ask for.", "page's own list"),
    "financial-planning.htm": ("Planning to build and preserve your wealth around your goals.", "page: 'build and preserve your wealth'"),
    "part-time-cfo.htm": ("Part-time CFO support for a growing business, from your accountants.", "page title and first paragraph"),
    "succession-planning.htm": ("Planning for who will own and run your business next.", "page: 'who will own your business? Who will run your business?'"),
    "physician-accountants.htm": ("Accounting and tax services for doctors, dentists, clinics and other health care providers.", "page's own text ('doctors, dentists, clinics, hospitals ...')"),
    "retail-accounting.htm": ("Accounting for retail stores: point-of-sale advice, inventory tracking, sales tax and payroll.", "page's own list"),
    "restaurant-hotel-accountant.htm": ("Accounting and tax services for restaurants and hotels.", "page title and text"),
    "real-estate-cpa.htm": ("Tax and accounting for real estate investors and professionals.", "page's own list"),
}


# ------------------------------------------------------------------ nav
def item(slug, label, **kw):
    v = INM[slug]
    return {"label": label, "proposed_url": v["new_path"], "target_slug": slug, "status": "live-page", **kw}


def build_nav():
    folders, mega_cols = [], []
    for t in D.TIERS:
        base = f"/{t['slug']}/"
        kids = [{"label": "Overview", "proposed_url": base, "target_slug": t["slug"], "status": "proposed-page",
                 "also_merges": [t["live_landing"]], "overview": True}]
        links = []
        for it in t["items"]:
            e = item(it["slug"], it["label"])
            if it.get("merges"):
                e["also_merges"] = it["merges"]
            if it.get("promoted_from"):
                e["note"] = "promoted from article-service-adjacent (plan section 2 names it a Consulting service)"
            kids.append(e)
            links.append({"label": it["label"], "url": e["proposed_url"], "target_slug": it["slug"], "summary": SUMMARY[it["slug"]][0]})
        inds = []
        for ind in t.get("industries", []):
            e = item(ind["slug"], ind["label"], industry_example=True, in_fallback_menu=False,
                     also_merges=ind.get("related", []))
            inds.append(e)
        folder = {"label": t["label"], "proposed_url": base, "folder": True, "group": "Services", "tier": t["id"], "accent": t["accent"],
                  "children": kids + inds}
        folders.append(folder)
        col = {"tier": t["id"], "heading": t["label"], "accent": t["accent"], "description": t["description"],
               "overview": {"label": f"All {t['label']}", "url": base, "target_slug": t["slug"]}, "links": links}
        if inds:
            col["secondary"] = {"heading": "Industry examples",
                                "links": [{"label": e["label"], "url": e["proposed_url"], "target_slug": e["target_slug"],
                                           "summary": SUMMARY[e["target_slug"]][0]} for e in inds]}
        mega_cols.append(col)
    resources = {"label": "Resources", "proposed_url": "/resources/", "folder": True, "children": [
        {"label": "Overview", "proposed_url": "/resources/", "target_slug": "resources", "status": "proposed-page", "also_merges": ["more-information.htm"], "overview": True},
        item("articles.html", "Articles", also_merges=["business-blog", "twitter"]),
        item("reliance-consulting-netclient-portals", "Client Portal", also_merges=["client-portal-login"]),
        item("app", "Mobile App"),
        item("records-for-cpa-meeting.htm", "What to Bring to Your First Meeting"),
    ]}
    about = {"label": "About", "proposed_url": "/about/", "folder": True, "children": [
        item("firmprofile.html", "Overview", overview=True, also_merges=["what-is-a-cpa.htm"]),
        item("staff-profiles.htm", "Our Team"),
        item("reasons-to-choose-reliance.htm", "Why Choose Reliance"),
        item("custom2.html", "Careers", note="live label is 'Employment Opportunities'"),
    ]}
    contact = item("contact.html", "Contact")
    login = {"label": "Client Login", "external": True,
             "url": "https://www.reliancecpa.com/client-portal-login", "status": "external-link",
             "needs": ("The live Client Login page is a form that posts to secure.netlinksolution.com/nextgen/login (Thomson Reuters NetClient CS) "
                       "with the hidden firmID still set to the template value 'REPLACE', so no firm-specific NetClient login URL exists in the crawl. "
                       "This points at the live login page until the firm supplies its real NetClient login address."),
             "also_merges": ["client-portal-login"]}
    button = {"label": "Get Started", "proposed_url": "/get-started/", "target_slug": "get-started", "status": "proposed-page",
              "also_merges": ["more-information.htm"]}
    doc = {
        "_about": ("Design-free header menu shared by every concept; generated by tools/build_pages.py from tools/sitemap_data.py (one source of truth: "
                   "`menu` is the simple Squarespace-safe version, `mega` is the flyout version, both built from the same tier data). Squarespace 7.1 rules: "
                   "folders are one level deep and a folder label is not a link, so every folder lists an 'Overview' first. Folders cannot nest, so the "
                   "fallback `menu` promotes the three tiers to top-level folders marked group 'Services' (a concept can render them under one 'Services' label; "
                   "the mega-menu plugin renders the same three as columns). target_slug is the page the item opens (a live crawl slug, or a proposed page in "
                   "content/proposed/); also_merges lists live pages the proposal folds into the item; industry examples have in_fallback_menu false (reachable "
                   "from the Business & Tax Consulting landing; shown in the mega column). Contact and Client Login are single top-level links; one header button."),
        "menu": folders + [resources, about, contact, login],
        "button": button,
        "mega": {
            "_about": "Flyout for the Services item (plan section 4/8): one column per tier with heading, one-line description and links, a 'see all' link per tier. Rendered by a Squarespace mega-menu plugin as a normal page of native blocks, with `menu` as the mobile and no-plugin fallback. One-line summaries are drawn from each page's own text; the tier descriptions are new copy (see proposed/home.json confirm).",
            "label": "Services", "columns": mega_cols, "fallback": "menu"},
    }
    (ROOT / "content/nav.json").write_text(json.dumps(doc, indent=1, ensure_ascii=False))
    return doc


# ------------------------------------------------------------------ proposed pages
CONTACT = {"name": "Reliance Consulting LLC", "address": "14499 N Dale Mabry Hwy Suite 179-S, Tampa, FL 33618",
           "phone": "(813) 931-7258", "fax": "(813) 931-5555", "email": "kim@reliancecpa.com"}
CONTACT_LINES = [{"label": "Address", "value": CONTACT["address"]}, {"label": "Phone", "value": CONTACT["phone"]},
                 {"label": "Fax", "value": CONTACT["fax"]}, {"label": "Email", "value": CONTACT["email"]}]

# Thom, 2026-11-06: none of the staff on the live /staff-profiles.htm work at the firm any more (only Kim Nguyen, the owner, remains), so the roster is empty.
STAFF = []
PHOTO = "http://www.reliancecpa.com/wp-content/uploads/2011/12/"
# Thom, 2026-11-06: Kim Nguyen is the owner now (the live "Staff Accountant" title is out of date); Amol Nirgudkar no longer works at the firm.
OWNER = {"name": "Kim Nguyen", "role": "Owner",
         "image": {"src": "concept-02/assets/kim-m-nguyen.png", "alt": "Kim Nguyen, Owner", "origin": "concept-02 asset; confirm it is the portrait Kim wants used"}}


def team_list():
    out = []
    for n, r, f in STAFF:
        e = {"name": n, "role": r}
        if f:
            e["image"] = {"src": PHOTO + f, "alt": f"{n}, {r}"}
        out.append(e)
    return out


def card(slug, title=None, text=None, link_text=None, **kw):
    return {"title": title or INM[slug].get("nav_label") or title_of(slug), "text": [text] if text else [], "page": slug,
            "href": SITE + path(slug), **({"link_text": link_text} if link_text else {}), **kw}


def feed(slugs, more_page="articles.html"):
    posts = []
    for s in slugs:
        posts.append({"title": title_of(s), "page": s, "href": SITE + path(s), "excerpt": sents(s, 0, 1)})
    return {"module": "post-feed", "variant": "cards", "slots": {"title": "Related articles", "posts": posts,
            "more": {"text": "All articles", "page": more_page}}}


def seo(title, desc):
    return {"title_tag": title, "meta_description": desc, "h1_count": 1}


def page(slug, path_, template, title, seo_, about, verified, confirm, modules, **extra):
    return {"source": "proposed", "url": SITE + path_, "slug": slug, "template": template, "family": "proposed", "title": title,
            **extra, "seo": seo_, "_about": about, "verified": verified, "confirm": confirm, "modules": modules}


ABOUT_P = ("Proposed page: written for the redesign, not crawled. Design-free module instances in the same format as content/structured. `page` keys name a live crawl slug "
           "or another proposed page; `href` is the new-site URL. Facts that came from the crawl are in `verified`; new wording and anything the crawl cannot show is in `confirm`.")

TIER_COPY = {
    "tax-preparation": {
        "tagline": "Returns, planning and IRS problems, for individuals and businesses.",
        "intro_src": ("tax-preparation.htm", 1, 1),
        "who": [("tax-preparation.htm", 1, 2, 0)],
        "problems": ("tax-problem-irs-audit-help.htm", 3, "Problems we help with"),
        "related": ["tax-saving-strategies.htm", "audit-help.htm", "late-income-tax-return.htm"],
        "cta": "Not sure which tax service you need? Tell us what is going on.",
        "seo": ("Tax Preparation in Tampa | Reliance Consulting", "Income tax, business tax, tax planning and IRS problem help from the CPAs at Reliance Consulting in Tampa, Florida."),
    },
    "business-accounting": {
        "tagline": "Books, payroll and cash flow, kept current for small businesses.",
        "intro_src": ("small-business-accounting.htm", 0, 1),
        "who": [("small-business-accounting.htm", 1, 1, 0)],
        "problems": ("small-business-accounting.htm", 3, "What small businesses ask us to take on"),
        "related": ["how-payroll-processing-helps.htm", "business-record-retention.htm", "keep-financial-records.htm"],
        "cta": "Not sure what your business needs? Tell us how you keep your books today.",
        "seo": ("Small Business Accounting in Tampa | Reliance Consulting", "Bookkeeping, QuickBooks, payroll and cash flow management for Tampa Bay small businesses from Reliance Consulting."),
    },
    "business-tax-consulting": {
        "tagline": "Planning, financing and advice for owners, from a first plan to the next step.",
        "intro_src": ("business-consultants.htm", 0, 1),
        "who": [("business-consultants.htm", 1, 1, 0)],
        "problems": ("business-consultants.htm", 2, "What a Reliance business consultant does"),
        "related": ["strategic-business-planning.htm", "business-valuation.htm", "forms-to-start-business.htm"],
        "cta": "Not sure where to start? Tell us what you are working on.",
        "seo": ("Business and Tax Consulting in Tampa | Reliance Consulting", "Business planning, financing, financial planning, part-time CFO and succession planning from the CPAs at Reliance Consulting."),
    },
}


def tier_page(t):
    c = TIER_COPY[t["id"]]
    live = t["live_landing"]
    iv = c["intro_src"]
    mods = [
        {"module": "hero", "slots": {"eyebrow": t["label"], "title": t["label"], "tagline": c["tagline"], "tier": t["id"],
                                     "actions": [{"text": "Get Started", "page": f"get-started__{t['id']}"}]}},
        {"module": "intro", "slots": {"paragraphs": [sents(iv[0], iv[1], iv[2])]}},
        {"module": "card-grid", "variant": "service-cards", "slots": {
            "eyebrow": "Services", "title": f"{t['label']} services", "tier": t["id"],
            "cards": [card(it["slug"], it["label"], SUMMARY[it["slug"]][0], "Learn more") for it in t["items"]]}},
        {"module": "headed-section", "slots": {"title": "Who it is for", "level": 2, "depth": 2,
                                               "body": [{"type": "p", "text": sents(w[0], w[1], w[2], w[3])} for w in c["who"]]}},
        {"module": "list", "slots": {"title": c["problems"][2], "ordered": False,
                                     "items": [{"text": x} for x in items(c["problems"][0], c["problems"][1]) if x.lower() not in ("more", "much more", "unlimited consultations")]}},
    ]
    if t.get("industries"):
        mods.append({"module": "card-grid", "variant": "industries", "slots": {
            "eyebrow": "Industry examples", "title": "Where we have worked", "tier": t["id"],
            "cards": [card(i["slug"], i["label"], SUMMARY[i["slug"]][0], "See the example") for i in t["industries"]]}})
    mods += [
        {"module": "people", "slots": {"eyebrow": "People", "title": "Who you will work with",
                                       "people": [OWNER],
                                       "link": {"text": "More about Kim", "page": "staff-profiles.htm"}}},
        feed(c["related"]),
        {"module": "cta-band", "slots": {"title": c["cta"], "text": "Choose what you need help with and send a short request.",
                                         "buttons": [{"text": "Get Started", "page": f"get-started__{t['id']}"}]}},
    ]
    verified = [
        f"Service pages: the live pages mapped to this tier in nav.json ({', '.join(i['slug'] for i in t['items'])}); each card's one-line summary is drawn from that page's own text (see nav.json mega links).",
        f"Intro: first sentences of the live landing {live}",
        f"'Who it is for' and the problems list are verbatim from {c['who'][0][0]} and {c['problems'][0]}",
        "Team names, roles and photos: live /staff-profiles.htm. Kim Nguyen is the owner (confirmed by Thom, 2026-11-06; the live page still says Staff Accountant)",
        "Related articles: live pages " + ", ".join(c["related"]) + "; excerpt = the article's first sentence",
    ]
    confirm = [
        f"Tagline '{c['tagline']}' and the tier description (new copy)",
        "Service card summaries (one sentence each, condensed from the page text; check each reads true)",
        f"CTA: '{c['cta']}' and 'Choose what you need help with and send a short request.' (new copy)",
        "The staff listed on the live site have all left (Thom, 2026-11-06); only the owner is shown. Current team names, roles and photos are needed from Kim",
        "Kim Nguyen's portrait comes from concept-02, not from the live site; confirm it is the one she wants used. Her exact title wording ('Owner') and credentials are to confirm",
        "SEO title and meta description (new copy, not from the live site, which has none)",
        "The live Business Accounting copy lists 'Unlimited consultations' among its services; it is left out of the problems list because it is a promise about the firm's time (confirm if it is true and wanted)" if t["id"] == "business-accounting" else "The live 'Who it is for' sentence is used as written, including 'time-tested strategies that have been proven to turn stressed companies into flourishing businesses' (business consultants page); it is the firm's own claim, so confirm it stands" if t["id"] == "business-tax-consulting" else "The live 'Who it is for' sentences are used as written ('we are committed to helping you take advantage of the tax benefits that apply to your unique situation'); confirm they stand",
    ]
    if t.get("industries"):
        confirm.append("Which industries Kim wants named as examples (plan section 11): the live site has physicians, retail, restaurant and hotel, and real estate; the firm profile also lists convenience stores, gas stations, franchises, hotels, motels, development, investment, management and mortgage companies")
    return page(t["slug"], f"/{t['slug']}/", "tier-landing", t["label"], seo(*c["seo"]), ABOUT_P, verified, confirm, mods,
                tier=t["id"], accent=t["accent"], consolidates=[live])


# ------------------------------------------------------------------ get started
def f(id, label, type, options=None, required=False):
    e = {"id": id, "label": label, "type": type}
    if options:
        e["options"] = options
    if required:
        e["required"] = True
    return e


CONTACT_FIELDS = [f("name", "Name", "name", required=True), f("email", "Email", "email", required=True), f("phone", "Phone", "phone"),
                  f("method", "How should we reach you?", "radio", ["Call", "Email"], True),
                  f("more", "Anything else we should know?", "textarea")]
DISCLAIMER = "Please do not send Social Security numbers or account details through this form."

CHOICES = [
    ("tax-preparation", "I need my taxes done or a tax problem solved.", "Returns, tax planning, or help with the IRS.", "Tax Preparation"),
    ("business-accounting", "I need help keeping my business's books.", "Bookkeeping, QuickBooks, payroll and cash flow.", "Business Accounting"),
    ("business-tax-consulting", "I am starting, running or planning for a business.", "Business plans, financing, financial planning and advice.", "Business & Tax Consulting"),
]
EXTRA_QS = {
    "tax-preparation": [f("who", "Who is this for?", "radio", ["Me or my household", "My business", "Both"]),
                        f("need", "What do you need help with?", "checkbox", ["Preparing a return", "Tax planning", "An IRS notice or audit", "Back taxes or unfiled returns", "Something else"])],
    "business-accounting": [f("biz", "What kind of business is it?", "text"),
                            f("qb", "Do you use QuickBooks?", "radio", ["Yes", "No", "Not sure"]),
                            f("need", "What do you need?", "checkbox", ["Bookkeeping", "QuickBooks help", "Payroll", "Cash flow", "Outsourced accounting (BackOffice)", "Something else"])],
    "business-tax-consulting": [f("stage", "Where is your business?", "radio", ["Thinking about starting", "Just started", "Up and running", "Planning for a sale or handoff"]),
                                f("need", "What do you need?", "checkbox", ["A business plan", "Financing or loans", "Financial planning", "Part-time CFO", "Succession planning", "Something else"]),
                                f("industry", "Industry", "select", ["Healthcare", "Retail", "Restaurant or hotel", "Real estate", "Other"])],
    "not-sure": [f("about", "Tell us a little about your situation", "textarea")],
}


def get_started_pages():
    cards = [{"title": t, "text": x, "page": f"get-started__{i}", "tier": i, "eyebrow": lab} for i, t, x, lab in CHOICES]
    cards.append({"title": "I am already a client.", "text": "Log in to the client portal or get the mobile app.", "page": "resources", "eyebrow": "Existing client"})
    cards.append({"title": "I am not sure.", "text": "Tell us a little and we will point you in the right direction.", "page": "get-started__not-sure", "eyebrow": "Not sure"})
    conf_common = [
        "Page copy: 'What do you need help with?', 'Step 1 of 2' / 'Step 2 of 2', 'Change', 'Send my request', the five choice cards and their lines (new copy; the plan's choices are tiers, existing client, not sure)",
        f"Disclaimer under every form: \"{DISCLAIMER}\" (new wording; the live privacy policy is the only related text)",
        "Contact fields on every form: Name, Email, Phone, 'How should we reach you?' (Call / Email), 'Anything else we should know?'; Name, Email and the contact method are required",
        "Cynthia: who actually receives a new lead today and by which inbox; each form should email that person (Squarespace forms can route per form, so four forms = four inboxes if wanted)",
        "Cynthia: which questions the tax team wishes prospects answered up front; the questions below are placeholders",
        "Cynthia: privacy limits for financial-prospect data, and whether there is a scheduling tool to link",
        "Squarespace Form blocks cannot show or hide questions, so each choice has its own page and form; the native form's post-submit redirect goes to the thanks page",
    ]
    out = []
    out.append(page("get-started", "/get-started/", "get-started", "Get Started",
                    seo("Get Started | Reliance Consulting", "Tell us what you need help with, then send a short request to Reliance Consulting in Tampa."),
                    ABOUT_P + " Intake flow, native Squarespace: step 1 is a page of choice cards, step 2 is one page per choice with its own Form block, step 3 is the form's post-submit page.",
                    ["Tier names and the three tier pages: PROJECT_PLAN section 2 (confirmed with Thom 2026-11-03)", "Client portal and mobile app pages: live /reliance-consulting-netclient-portals and /app"],
                    conf_common, [{"module": "choice-cards", "slots": {
                        "step": {"label": "Step 1 of 2", "current": 1, "total": 2}, "title": "What do you need help with?",
                        "text": "Choose the one that fits best. We will ask only what matters for it.", "cards": cards,
                        "call": {"text": "Would you rather call?", "phone": CONTACT["phone"]}}}],
                    flow=True, own_closing=True))
    for i, t, x, lab in CHOICES + [("not-sure", "I am not sure.", "", "Not sure")]:
        title = t
        qs = EXTRA_QS[i]
        fields = qs + CONTACT_FIELDS
        out.append(page(f"get-started__{i}", f"/get-started/{i}/", "get-started", title,
                        seo(f"{title} | Get Started | Reliance Consulting", "Send Reliance Consulting a short request about this."),
                        ABOUT_P + " Step 2 of the intake flow (one Form block).",
                        ["Tier choice: PROJECT_PLAN section 2"],
                        conf_common + [f"Questions on this page: " + "; ".join(f"{q['label']} [{', '.join(q.get('options', [])) or q['type']}]" for q in qs)],
                        [{"module": "form", "slots": {
                            "step": {"label": "Step 2 of 2", "current": 2, "total": 2}, "title": title,
                            "text": "A few details, then your contact information.", "change": {"text": "Change", "page": "get-started"},
                            "form": {"type": "form", "note": "Native Squarespace Form block; not collected in the mockup", "fields": fields,
                                     "submit": {"text": "Send my request", "page": "get-started__thanks"}, "disclaimer": DISCLAIMER},
                            "call": {"text": "Would you rather call?", "phone": CONTACT["phone"]}}}],
                        flow=True, own_closing=True, **({"tier": i} if i != "not-sure" else {})))
    out.append(page("get-started__thanks", "/get-started/thanks/", "get-started", "Thank you",
                    seo("Thank you | Reliance Consulting", "Your request has been sent to Reliance Consulting."),
                    ABOUT_P + " Step 3: the form's post-submit page.",
                    ["Phone and address: live /contact.html", "Client portal page: live /reliance-consulting-netclient-portals"],
                    ["Thanks heading and lines (new copy)", "'A member of the team will follow up by the way you chose.' is a promise about follow-up; the firm should confirm how and how fast it can follow up before launch"],
                    [{"module": "title-banner", "slots": {"title": "Thanks, we have your request."}},
                     {"module": "rich-text", "slots": {"body": [{"type": "p", "text": "A member of the team will follow up by the way you chose."}]}},
                     {"module": "contact-band", "slots": {"title": "Need to talk sooner?", "text": "Call us.", "lines": [CONTACT_LINES[1]],
                                                          "button": {"text": "Back to the home page", "page": "home"}}}],
                    flow=True, own_closing=True))
    return out


# ------------------------------------------------------------------ home, resources
def home_page():
    reasons = [("We do much more than crunch numbers", "Reliance Consulting does much more than “crunch numbers.” We get to the bottom of numbers to help our clients make prudent, appropriate financial decisions.".replace("Reliance Consulting does", "Reliance Consulting does")),
               ("An open door policy", "We have an open door policy with our clients."),
               ("Someone available to answer", "At the end of the day, clients can call any time and be assured that someone will be available to answer their questions, whether it has to do with saving your taxes or some other financial issue.")]
    # verify verbatim
    allp = " ".join(plain(b.get("text", "")) for b in PAGES["reasons-to-choose-reliance.htm"]["blocks"] if b["type"] in ("p",)) + " " + " ".join(plain(i["text"]) for b in PAGES["reasons-to-choose-reliance.htm"]["blocks"] if b["type"] == "ul" for i in b["items"])
    for _, t in reasons:
        assert plain(t) in allp, t
    mods = [
        {"module": "hero", "slots": {
            "eyebrow": "Tampa, Florida · Since 1984", "title": "Numbers you understand. Advice you will actually use.",
            "tagline": "Since 1984, Reliance Consulting has served more than 800 businesses and 1,000 individuals in the Tampa Bay area: tax, bookkeeping, payroll, and the thinking behind the numbers.",
            "background_video": "concept-02/assets/home-background.mp4",
            "actions": [{"text": "Get Started", "page": "get-started"}, {"text": "Call " + CONTACT["phone"], "href": "tel:+18139317258"}]}},
        {"module": "trust-strip", "slots": {"facts": [
            {"lead": "Since 1984", "text": "Serving the Tampa, Florida area"},
            {"lead": "More than 800 businesses and 1,000 individuals", "text": "Served across the Tampa region"},
            {"lead": "A free check-up", "text": "No-obligation, for prospective clients"}]}},
        {"module": "card-grid", "variant": "tiers", "slots": {
            "eyebrow": "What we do", "title": "Three ways we help",
            "cards": [
                {"title": "Tax Preparation", "tier": "tax-preparation", "text": ["Returns, year-round planning and IRS problem resolution for individuals and businesses."], "page": "tax-preparation",
                 "href": SITE + "/tax-preparation/", "link_text": "Tax Preparation",
                 "links": [{"text": i["label"], "page": i["slug"]} for i in D.TIERS[0]["items"]],
                 "image": {"src": "concept-02/assets/tax-planning.jpg", "alt": "", "stock": True}},
                {"title": "Business Accounting", "tier": "business-accounting", "text": ["Bookkeeping, QuickBooks, payroll and cash flow, with Reliance BackOffice for outsourced accounting."], "page": "business-accounting",
                 "href": SITE + "/business-accounting/", "link_text": "Business Accounting",
                 "links": [{"text": i["label"], "page": i["slug"]} for i in D.TIERS[1]["items"]],
                 "image": {"src": "concept-02/assets/bookkeeping.jpg", "alt": "", "stock": True}},
                {"title": "Business & Tax Consulting", "tier": "business-tax-consulting", "text": ["Business plans, financing, financial planning, part-time CFO and succession planning, with industry examples."], "page": "business-tax-consulting",
                 "href": SITE + "/business-tax-consulting/", "link_text": "Business & Tax Consulting",
                 "links": [{"text": i["label"], "page": i["slug"]} for i in D.TIERS[2]["items"]],
                 "image": {"src": "concept-02/assets/consulting-office.jpg", "alt": "", "stock": True}}]}},
        {"module": "reasons", "slots": {"eyebrow": "Why Reliance", "title": "How we work",
                                       "items": [{"title": a, "text": b} for a, b in reasons]}},
        {"module": "video-split", "slots": {"eyebrow": "Watch", "title": "Business growth strategies", "level": 2, "depth": 2,
                                           "body": [{"type": "p", "text": "From the Reliance Consulting channel."}],
                                           "url": "https://www.youtube.com/embed/GRQm2WMPdmI", "video_title": "Tampa CPA | Business Growth Strategies"}},
        {"module": "people", "slots": {"eyebrow": "People", "title": "Who you will work with", "people": [OWNER],
                                       "quote": {"text": "In the success of our clients lies our own.", "attribution": "Reliance Consulting, LLC"},
                                       "link": {"text": "More about Kim", "page": "staff-profiles.htm"}}},
        {"module": "card-grid", "variant": "resources", "slots": {"eyebrow": "For clients", "title": "Client resources", "cards": [
            card("reliance-consulting-netclient-portals", "Client portal", sents("reliance-consulting-netclient-portals", 0, 1, 1), "About the portal"),
            card("app", "Mobile app", "Access your tax returns and financial documents from a phone or tablet.", "About the app"),
            card("records-for-cpa-meeting.htm", "What to bring", "What records to bring to your first meeting.", "See the list")]}},
        feed(["tax-saving-strategies.htm", "part-time-cfo.htm", "how-payroll-processing-helps.htm"]),
        {"module": "cta-band", "slots": {"title": "Not sure where to start?", "text": "Tell us what you need help with, and we will point you to the right service.",
                                         "buttons": [{"text": "Get Started", "page": "get-started"}]}},
        {"module": "contact-band", "slots": {"title": "Talk to us", "text": "Call, send a note, or stop by.", "lines": CONTACT_LINES,
                                             "button": {"text": "Get Started", "page": "get-started"}}},
    ]
    verified = [
        "'Since 1984' and 'more than 800 businesses and 1,000 individuals' (home: 'Now serving more than 800 businesses and 1,000 individuals in the Tampa, Florida region'; firm profile: 'over 800 businesses and 1000 individuals')",
        "Free no-obligation check-up: firm profile ('free no-obligation “check-up”') and home ('a free financial checkup')",
        "'How we work' items are verbatim from the live /reasons-to-choose-reliance.htm bullets",
        "Home video: YouTube GRQm2WMPdmI, titled 'Tampa CPA | Business Growth Strategies (813) 931-7258' on the Reliance Consulting CPAs channel; embedded on the live home page",
        "Team names, roles and photos: live /staff-profiles.htm. Kim Nguyen is the owner (confirmed by Thom, 2026-11-06; the live page still says Staff Accountant)",
        "Quote 'In the success of our clients lies our own': closing line of the live home page and firm profile (they write it with '!!')",
        "Address, phone, fax, email: live /contact.html text (address inconsistent with the map embed; see footer.json)",
        "Client portal, mobile app and what-to-bring pages: live pages of those names",
        "Tier services: the live pages mapped in nav.json",
    ]
    confirm = [
        "Hero headline 'Numbers you understand. Advice you will actually use.' (from concept-02, which the client chose; not on the live site)",
        "Hero tagline: reworded from concept-02 ('helped ... make sense of their finances'); 'served' replaces 'helped'",
        "Concept-02 claims the crawl cannot verify, left out of this page: '42 Years in practice' (arithmetic from 1984, fine if wanted), '2 Founding CPAs', '1,800+ Four decades of growth' (a by-decade chart of clients served), 'Free consultations' as a headline fact (the live site says free check-up), 'Partner at Reliance Consulting LLC: Kim M. Nguyen' (live site: Kim Nguyen is a Staff Accountant in 2008-2011 copy)",
        "Concept-02 also lists Dental CPA and Veterinary CPA as industries; the firm has confirmed no dental or veterinary sections, so they are removed here",
        "Trust strip: 'Served across the Tampa region' and 'No-obligation, for prospective clients' (new wording of live facts)",
        "Tier card summaries and 'Three ways we help' / 'How we work' / 'Client resources' / 'Talk to us' headings and the three reason titles (new copy over live sentences)",
        "Card text 'Access your tax returns and financial documents from a phone or tablet' (from the live app page: 'access, any document we produce, including tax returns and financials, through your smart phone or tablet')",
        "'Tell us what you need help with, and we will point you to the right service.' (from concept-02's Services page; a promise about routing)",
        "Video: title shown to visitors is shortened from the YouTube title (which carries the phone number); confirm the 2010s-era video is still wanted",
        "Photos: tier card images and the background video are concept-02 stock files; Kim Nguyen's portrait is from concept-02 and not on the live site; confirm it is the one she wants used",
        "Govindaraju Rudrapatna (shown in concept-02) has no live profile and is left out (Tara Govindaraju's bio mentions her husband Raju); confirm whether he should appear",
        "SEO title and meta description for home (live title is 'CPA Tampa | Accountant | Business Tax | Income Tax | Bookkeeping | Payroll'; live meta description empty)",
    ]
    return page("home", "/", "home", "Reliance Consulting | CPA and Accounting in Tampa, Florida",
                seo("Reliance Consulting | CPA and Accounting in Tampa, Florida", "Tax preparation, business accounting and consulting for Tampa Bay businesses and individuals since 1984."),
                ABOUT_P + " Replaces the live home page (kept in structured/home.json as source).", verified, confirm, mods, own_closing=True)


def resources_page():
    mods = [
        {"module": "title-banner", "slots": {"title": "Resources"}},
        {"module": "intro", "slots": {"paragraphs": ["Articles from the Reliance team, and what you need as a client."]}},
        {"module": "card-grid", "variant": "resources", "slots": {"eyebrow": "For clients", "title": "Client resources", "cards": [
            {"title": "Client Login", "text": ["Log in to your private portal."], "href": "https://www.reliancecpa.com/client-portal-login", "link_text": "Log in", "external": True},
            card("reliance-consulting-netclient-portals", "Client portal", sents("reliance-consulting-netclient-portals", 0, 1, 1), "About the portal"),
            card("app", "Mobile app", "Access your tax returns and financial documents from a phone or tablet.", "About the app"),
            card("records-for-cpa-meeting.htm", "What to bring", "What records to bring to your first meeting.", "See the list")]}},
        {"module": "link-list", "slots": {"title": "Downloads", "level": 2, "links": [
            {"text": "Navigating the Business of Medicine (PDF)", "href": "http://www.reliancecpa.com/wp-content/uploads/2011/12/navigating-the-business-of-medicine.pdf",
             "note": "manual linked from the live firm profile; PDF responds (918 KB)"}]}},
        {"module": "video-split", "slots": {"eyebrow": "Watch", "title": "Reliance BackOffice", "level": 2, "depth": 2,
                                           "body": [{"type": "p", "text": "The video from the live BackOffice page."}],
                                           "url": "https://www.youtube.com/embed/x2YjxCzXPlc", "video_title": "Tampa CPA, Tampa Accountant -- Enhance Your Profits"}},
        {"module": "post-feed", "variant": "cards", "slots": {"title": "Articles", "posts": [
            {"title": title_of(s), "page": s, "href": SITE + path(s), "excerpt": sents(s, 0, 1)} for s in
            ["tax-saving-strategies.htm", "how-payroll-processing-helps.htm", "part-time-cfo.htm", "what-is-a-cpa.htm", "how-to-choose-cpa.htm", "business-valuation.htm"]],
            "more": {"text": "All articles", "page": "articles.html"}}},
        {"module": "cta-band", "slots": {"title": "New to Reliance?", "text": "Tell us what you need help with.", "buttons": [{"text": "Get Started", "page": "get-started"}]}},
    ]
    verified = ["Client portal, app and what-to-bring pages and the login link: live pages",
                "'Navigating the Business of Medicine' PDF: linked from live /firmprofile.html; fetched, responds 200 application/pdf",
                "BackOffice video: YouTube x2YjxCzXPlc embedded on live /reliance-consulting-backoffice",
                "No other forms, checklists, secure upload page or FAQ exist in the crawl. The portal page mentions a secure file exchange inside NetClient, not a separate page"]
    confirm = ["Intro sentence, 'Client resources' / 'Downloads' / 'New to Reliance?' headings (new copy)",
               "Cynthia: which client resources the team hands out today (checklists, organizers, engagement forms, secure upload) so the hub can list them; only the first-meeting records list and the medicine manual exist on the live site",
               "Client Login destination (see nav.json: the live login form's firmID is a template placeholder)",
               "Whether the 2011-era PDF is still accurate and wanted"]
    return page("resources", "/resources/", "client-resources", "Resources",
                seo("Resources | Reliance Consulting", "Articles and client resources from Reliance Consulting in Tampa, Florida."),
                ABOUT_P + " The Resources hub: client resources and articles (replaces live /articles.html and /more-information.htm as the entry point).", verified, confirm, mods)


# ------------------------------------------------------------------ footer
def build_footer(nav):
    cols = []
    for fo in nav["menu"]:
        if fo.get("folder"):
            cols.append({"heading": fo["label"], "links": [{"label": c["label"] if not c.get("overview") else (fo["label"] if fo.get("group") else c["label"]),
                                                          "url": c["proposed_url"], "target_slug": c["target_slug"]}
                                                         for c in fo["children"] if c.get("in_fallback_menu", True)]})
    doc = {
        "_about": ("Design-free site footer shared by every concept; generated by tools/build_pages.py. Everything is traced to the crawl; the only new wording is the "
                   "short functional labels. columns come from nav.json (one per folder, the same rule as the header). Contact details are the live /contact.html text; "
                   "the address question is recorded in `contact.address_issue` rather than resolved."),
        "firm": "Reliance Consulting, LLC",
        "copyright": "© 2026 Reliance Consulting, LLC",
        "columns_from": "nav",
        "columns": cols,
        "cta": {"label": "Get Started", "page": "get-started"},
        "client_login": {"label": "Client Login", "url": nav["menu"][-1]["url"], "needs": nav["menu"][-1]["needs"]},
        "contact": {
            "heading": "Contact", **CONTACT,
            "address_source": "live /contact.html body text",
            "address_issue": ("The contact page text says 14499 N Dale Mabry Hwy Suite 179-S, Tampa, FL 33618; its embedded Google map points at 13940 N Dale Mabry Hwy, "
                              "Tampa, FL 33618; concept-02 uses 13940 in its footer and contact page. This footer uses the text address. Ask the firm which is correct "
                              "(an office move would explain it; the page was last edited 2026-08-14 per its Last-Modified, the map code is 2011-era)."),
            "directions": {"label": "Get directions", "url": "https://www.google.com/maps/search/?api=1&query=14499+N+Dale+Mabry+Hwy+Suite+179-S%2C+Tampa%2C+FL+33618"},
            "hours": None,
        },
        "social": [
            {"id": "facebook", "label": "Facebook", "url": "https://www.facebook.com/relianceconsultingcpa/",
             "source": "live header top bar (old-style pages URL .../pages/Reliance-Consulting/100601013341144); it now redirects to this address"},
            {"id": "x", "label": "X (Twitter)", "url": "https://x.com/RelianceCPA",
             "source": "live header top bar (twitter.com/#!/RelianceCPA, a 2011 hashbang URL); responds and redirects to x.com; the account's activity is not checked"},
            {"id": "youtube", "label": "YouTube", "url": "https://www.youtube.com/@Reliancecpa",
             "source": "found through the home and BackOffice video embeds (channel 'Reliance Consulting CPAs'); not linked on the live site; confirm"},
            {"id": "blog", "label": "Blog", "url": "https://reliancecpa.wordpress.com/",
             "source": "live header top bar ('Reliance Consulting Wordpress Blog'); the site responds; recency not checked; confirm it is still used"},
        ],
        "social_dead": [{"label": "Google+", "url": "https://plus.google.com/112203268693511335048", "reason": "Google+ shut down; the URL now redirects to a Google Workspace blog post"}],
        "social_not_found": ["Instagram", "Google Business / reviews", "Yelp"],
        "legal": {"heading": "Legal", "links": [{"label": "Privacy Policy", "page": "privacy-policy.htm"}, {"label": "Disclaimer", "page": "disclaimer.htm"},
                                                 {"label": "Accessibility", "page": "accessibility"}],
                  "missing": ["Terms of use", "Sitemap page"]},
        "extras": [{"id": "areas", "label": "Areas We Serve", "page": "tampa-cpa-areas-served.htm"}],
        "badges": None,
        "newsletter": None,
    }
    (ROOT / "content/footer.json").write_text(json.dumps(doc, indent=1, ensure_ascii=False))


def main():
    nav = build_nav()
    pdir = ROOT / "content/proposed"
    pdir.mkdir(exist_ok=True)
    pages = [home_page()] + [tier_page(t) for t in D.TIERS] + get_started_pages() + [resources_page()]
    for p in pages:
        (pdir / f"{p['slug']}.json").write_text(json.dumps(p, indent=1, ensure_ascii=False))
    build_footer(nav)
    print("proposed:", [p["slug"] for p in pages])


if __name__ == "__main__":
    main()
