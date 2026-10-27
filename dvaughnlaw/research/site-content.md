# Vaughn Law Site Content

Oct 26, 2026 · Thom Griggs · live doc: https://claude.ai/artifact/87FVV8hPzu3LBk4BcnTR4e

Draft copy and page specs for every page in the Site Proposal: SEO fields, images with alt text, the full heading tree with the words under each heading, every link as text → URL, and every button. Facts marked **[confirm]** need Danielle.

## How to read this, and the shared components

Each page has: **SEO** (title tag, meta description, focus keywords), **Images** (purpose + alt text), **Page outline** (H1 → H2 → H3 with the copy under each), **Links**, **Buttons**. Nothing deeper than H3 on a service page. "Keywords" are focus keyphrases for the SEO tool, not a meta keywords tag.

Voice: plain, first person plural, short sentences, no legalese on the page. The reader is a capable adult who's anxious about cost and about being talked down to.

### Global nav (every page)
Real Estate → `/real-estate/` · Estate Planning → `/estate-planning/` · About → `/about/` · Resources → `/resources/articles/` · **Schedule a Consultation** (button) → `/contact/` · (727) 223-6080 → `tel:+17272236080`. Dropdowns show the sub-pages; the nav never changes by section.

### "How it starts" block (every service page and article, above the footer)
Not a heading. An `<aside>` with a `<p><strong>` lead.

> **How it starts**
> 1. **Call or send a note.** Tell us what's going on. No charge for that conversation. **[confirm: free initial call?]**
> 2. **We review and tell you what it takes.** What we'd do, how long, and what it costs — before you commit.
> 3. **We handle it.** You get one person to call and plain updates along the way.
>
> Button: **Schedule a Consultation** → `/contact/` · Text link: **or call (727) 223-6080**

### Footer (every page)
Firm: Vaughn Law, PLLC · 350 Corey Ave, St. Pete Beach, FL 33706 · (727) 223-6080 · Fax (727) 645-4226 · Reception@dvaughnlaw.com · Hours **[confirm]**
Real Estate column · Estate Planning column · Firm column (The Firm, Our Team, Workshops, For Realtors, Contact, Careers) · Follow: YouTube `https://www.youtube.com/@Vaughnlawstpete`, Facebook `https://www.facebook.com/DVaughnLaw` · Legal: Privacy, Disclaimer, © 2026, Attorney advertising.
Newsletter: **Get the Vaughn Voyage** — one email a month on property and estate law in Florida. Field: email. Button: **Subscribe**.

### Buttons, site-wide
Schedule a Consultation (primary) → `/contact/` · Register for the Workshop (secondary) → `/about/workshops/` · Watch on YouTube (text link) · Download the Closing Guide (secondary) → `/resources/guides/closing-process/`

---

## Home — `/`

**SEO**
- Title: Real Estate & Estate Planning Attorneys – St. Pete Beach │ Vaughn Law
- Description: Vaughn Law is a real estate and estate planning law firm on St. Pete Beach. Closings, deeds, landlord-tenant, wills, trusts and probate for Pinellas families.
- Keywords: real estate attorney St. Pete Beach · estate planning attorney St. Pete Beach · Vaughn Law

**Images**
- Hero: office exterior on Corey Ave — alt *Vaughn Law office on Corey Avenue in St. Pete Beach*
- Danielle candid — alt *Danielle Vaughn, managing attorney at Vaughn Law*
- Team (optional) — alt *The Vaughn Law team outside the St. Pete Beach office*

**Page outline**

H1: Real estate and estate planning attorneys on St. Pete Beach
Buying a home, fixing a deed, dealing with a tenant, or making sure your family is set — if it involves property in Florida, it's what we do. We're on Corey Avenue, and we answer the phone.
Buttons: Schedule a Consultation → `/contact/` · See how we can help → `#help`

H2: What we help with
- H3: Real estate — Closings with an attorney in the room, deed changes, Lady Bird deeds, homestead, landlord and tenant matters, and the disputes that come with property. [Real estate law](/real-estate/)
- H3: Estate planning — Wills, trusts, powers of attorney and probate — written so your family can actually use them. Especially if you've just moved to Florida. [Estate planning](/estate-planning/)

H2: Why people on the beach call us
- **An attorney, not just a title company.** When a closing goes sideways, you don't get referred out; the lawyer is already here.
- **Board certified in real estate law.** [Danielle Vaughn](/about/our-team/) is Florida Bar Board Certified — fewer than one in a hundred Florida lawyers are. **[confirm area]**
- **Local.** St. Pete Beach, Treasure Island, Pass-a-Grille, Gulfport, Madeira Beach, Tierra Verde. We know the parcels, the HOAs, and the flood maps.
- **Plain answers about cost.** You'll know what it costs before you decide.
Link: Meet the team → `/about/our-team/`

H2: From the firm — three latest articles (title, excerpt, topic). Link: All articles → `/resources/articles/`

H2: Upcoming workshop — pulled from events. Button: Register for the Workshop → `/about/workshops/`

H2: Get in touch — short form: name, email, phone, What's this about? (Buying or selling · A deed or title question · Landlord or tenant · Estate planning · Probate · Something else), message. Button: Send. Beside it: address, phone, hours **[confirm]**, map link.

Notes: 250–350 words. Current H1 is the firm name; this one leads with what and where. The "Accessible | Reliable | Practical Real Estate & Business Law Firm" tagline is retired.

---

## Real Estate hub — `/real-estate/`

**SEO**
- Title: Real Estate Attorney St. Pete Beach & Pinellas County │ Vaughn Law
- Description: Attorney-led closings, deed transfers, Lady Bird deeds, landlord-tenant and property disputes in St. Pete Beach and Pinellas County. Board certified in real estate law.
- Keywords: real estate attorney St. Pete Beach · real estate lawyer Pinellas County · closing attorney St. Petersburg

**Images**: St. Pete Beach waterfront (alt *Homes along the water in St. Pete Beach, Florida*) · closing table (alt *A real estate closing at the Vaughn Law office*)

**Page outline**

H1: Real estate law in St. Pete Beach and Pinellas County
Most of what we do touches a house: buying it, selling it, putting the right name on the deed, dealing with the person renting it, or sorting out who owns what when a family disagrees. We're a law firm that also handles title and closings — so when something comes up at the table, there's already an attorney in the room.
Button: Schedule a Consultation

H2: Buying or selling — We handle the contract, the title, and the closing. You pay about what you'd pay a title company and you get a lawyer. [Buying and selling with an attorney](/real-estate/buying-and-selling/)
H2: Deeds and title — Adding a spouse, taking someone off, moving a home into a trust, Lady Bird deeds, homestead, and fixing a title that's been wrong for years. [Deeds and title](/real-estate/deeds-and-title/)
H2: Landlords and tenants — Evictions, notices, leases, and the rules that changed in 2025. We do this every week. [Landlord and tenant](/real-estate/landlord-tenant/)
H2: Investors — LLCs, land trusts, tax deed sales, private lending, and the reporting rules that now apply to some residential transfers. [Real estate for investors](/real-estate/investors/)
H2: Disputes — Partition actions, contract disputes, foreclosure defense, code enforcement, contractor liens. [Property disputes](/real-estate/disputes/)
H2: Why an attorney and not just a title company — A title company can close a clean deal. It can't give legal advice, and it can't fix a problem it finds. We do both. Danielle Vaughn is Florida Bar Board Certified in real estate law **[confirm]**, and the firm has closed **[number]** transactions on the beach since **[year]**.
H2: For realtors — If you send clients to us, here's how it works, what we need, and how fast we turn it around. [Working with Vaughn Law](/about/for-realtors/)
H2: Recent articles on property law — three latest. Link: More on property law → `/resources/articles/?topic=real-estate`
How-it-starts block.

---

## Real Estate sub-pages

### Buying and Selling — `/real-estate/buying-and-selling/`
- Title: Real Estate Closing Attorney – St. Pete Beach │ Vaughn Law
- Description: Attorney-led closings and title in St. Pete Beach. Contract review, title search, title insurance and remote online notary, for about what a title company charges.
- Keywords: closing attorney St. Pete Beach · real estate attorney for closing Florida · do I need a lawyer to sell my house in Florida
- Images: closing table (alt *Signing closing documents at Vaughn Law in St. Pete Beach*) · keys and deed (alt *House keys and a signed deed*)

H1: Buying or selling a home with an attorney
Part of our [real estate practice](/real-estate/). In Florida you don't have to use a lawyer to close — but if you use us, you get the title work and the legal advice from the same people, for about the same price.
H2: What we do at a closing — Contract review · title search and title insurance · payoff and lien clearance · closing documents and the closing itself · recording the deed. For sale-by-owner deals we handle the whole thing from contract to keys.
H2: For buyers — We review the contract, order title, flag problems early, and sit with you at the table. [What a closing looks like, step by step](/resources/guides/closing-process/)
H2: For sellers — Payoff letters, HOA estoppels, the deed, and making sure the money moves safely. [Wire fraud: how we protect your closing funds](/about/for-realtors/#wire-fraud)
H2: Remote online notary — You can close from anywhere.
H2: What it costs — **[confirm: flat fee or range]**. [Title premium calculator](/resources/guides/title-premium-calculator/) · [Net sheet calculator](/resources/guides/net-sheet-calculator/)
H2: Articles on buying and selling — You Shook Hands on the Deal · Real Estate Scams Are Back · What Is Title Insurance?
Buttons: Schedule a Consultation · Download the Closing Guide

### Deeds and Title — `/real-estate/deeds-and-title/`
- Title: Deed Transfers, Lady Bird Deeds & Homestead – St. Pete Beach │ Vaughn Law
- Description: Add or remove someone from a Florida deed, set up a Lady Bird deed, move a home into a trust, file homestead, or fix a title problem. St. Pete Beach real estate attorneys.
- Keywords: Lady Bird deed Florida · add spouse to deed Florida · quiet title Florida · Florida homestead exemption
- Images: recorded deed (alt *A recorded Florida warranty deed*) · Pinellas home (alt *A single-family home in Pinellas County*)

H1: Deeds, title and homestead
Part of our [real estate practice](/real-estate/). The deed is the one document that says who owns your home. Most of what goes wrong later is a deed that was never updated, never recorded, or never written to do what the family thought it did.
H2: Adding or removing someone from a deed — Marriage, divorce, a parent adding a child, a child taking over. Each has a right way and several wrong ways. We prepare and record it. Links: Deed Transfers Explained · What to consider before transferring property title
H2: Lady Bird deeds — You keep the house and full control while you're alive; it passes to the person you name without probate. For a lot of Pinellas homeowners this is the whole estate plan. Link: Vaughn Voyage: Navigating Lady Bird Deeds. Cross-link: [will or trust](/estate-planning/wills-and-trusts/)
H2: Moving a home into a trust — A trust that doesn't hold the house doesn't avoid probate for the house. Link: The Importance of Funding Your Trust
H2: Homestead exemption and portability — the seven questions: What is homestead? Protected from judgments? Tax savings? Portability? Time test? How to file? How often? Link: Florida Homestead Law Explained
H2: Quiet title and fixing old problems — An heir who never signed, a lien paid but never released, a name misspelled thirty years ago. Link: Foreclosure Property Pitfalls
H2: What it costs — Deed prep and recording **[flat fee]** · Lady Bird deed **[flat fee]** · Quiet title quoted after title review.

### Landlord and Tenant — `/real-estate/landlord-tenant/`
- Title: Landlord-Tenant Attorney & Evictions – St. Pete Beach │ Vaughn Law
- Description: Evictions, three-day and seven-day notices, lease review and the 2025 flood-disclosure rule. Landlord-tenant attorneys in St. Pete Beach and Pinellas County.
- Keywords: eviction attorney Pinellas County · Florida landlord tenant lawyer · 3 day notice Florida
- Images: rental duplex (alt *A rental property in Pinellas County*)

H1: Landlord and tenant law
Part of our [real estate practice](/real-estate/). We represent landlords **[confirm: landlords only?]** — from the lease to the notice to the courtroom, and we do it every week.
H2: Evictions — Non-payment, lease violations, holdover tenants. The process in Pinellas, how long, what you can and can't do yourself. Links: How to Serve Notice of Non-Payment · Post-judgment eviction steps (video)
H2: Notices and leases — Links: The High Cost of a Bad Lease · Florida Landlord-Tenant Laws Explained (video)
H2: Rent increases and renewals — Link: Why Your Landlord Can Raise Rent
H2: The 2025 flood disclosure rule — Since October 1, 2025, Florida landlords must disclose flood history. Link: New Florida Law: Landlords Must Disclose Flood History
H2: Common misconceptions — Links: Landlord-Tenant Misconceptions · Accepting partial rent (video)
H2: What it costs — Uncontested eviction **[flat fee]** · Lease drafting/review **[flat fee]**

### Investors — `/real-estate/investors/`
- Title: Real Estate Attorney for Investors – LLCs, Land Trusts, Tax Deeds │ Vaughn Law
- Description: Entity formation, Florida land trusts, tax deed and foreclosure auctions, private lending, contracts and FinCEN reporting for real estate investors in Pinellas County.
- Keywords: Florida land trust attorney · real estate investor attorney Tampa Bay · tax deed sale Florida
- Images: small multi-unit (alt *A small investment property in St. Petersburg*)

H1: Real estate law for investors
Part of our [real estate practice](/real-estate/). If you own more than one property, the questions change: how to hold title, how to protect it, how to buy at auction, and what you now have to report.
H2: LLCs and land trusts — what a land trust does, when an LLC is better, how they work together. Link: Navigating the Real Estate Jungle
H2: Tax deed and foreclosure auctions — how it works, what you're really buying, why title matters more here.
H2: Private lending and foreclosure — loan documents that hold up; what to do when a borrower stops paying.
H2: Contracts — Link: The Legal Landscape of Commercial Lease Agreements in Florida
H2: 1031 exchanges and FinCEN reporting — Link: Vaughn Voyage: FinCEN Residential Real Estate Reporting
H2: What it costs — LLC **[flat fee]** · Land trust **[flat fee]** · everything else quoted.

### Disputes — `/real-estate/disputes/`
- Title: Real Estate Litigation & Partition Attorney – St. Pete Beach │ Vaughn Law
- Description: Partition actions, contract disputes, foreclosure defense, code enforcement and contractor liens. Real estate litigation attorneys in St. Pete Beach and Pinellas County.
- Keywords: partition action Florida · real estate litigation attorney St. Petersburg · foreclosure defense Pinellas
- Images: Whitney candid (alt *Whitney Smith, real estate litigation attorney at Vaughn Law*)

H1: Property disputes and litigation
Part of our [real estate practice](/real-estate/). When a deal, a deed, or a family disagreement ends up in court, [Whitney Smith](/about/our-team/#whitney-smith) handles it.
H2: Partition actions — usually siblings who inherited a house. Links: Partition Actions: Why Title Matters · Fifty Percent of Paradise. Cross-link: [Probate](/estate-planning/probate/)
H2: Contract disputes — Link: Real Estate Litigation Explained
H2: Foreclosure defense — from the current foreclosures page.
H2: Contractor disputes and liens — Links: Contractor Disputes in Florida · Understanding a Contractor Claim of Lien
H2: Code enforcement — from the current page.
H2: What it costs — Litigation is hourly **[confirm]**; likely range after first review.

---

## Estate Planning hub — `/estate-planning/`

88 words today. Target 700–900.

**SEO**
- Title: Estate Planning Attorney St. Pete Beach – Wills, Trusts & Probate │ Vaughn Law
- Description: Wills, trusts, powers of attorney and probate from a St. Pete Beach law firm that also handles your real estate. Plain answers, flat fees, and a plan your family can use.
- Keywords: estate planning attorney St. Pete Beach · estate planning lawyer Pinellas County · wills and trusts attorney St. Petersburg · avoid probate Florida

**Images**: Danielle with a client (alt *Danielle Vaughn meeting with a client about estate planning*) · family on the beach (alt *A family at home on St. Pete Beach*) · workshop (alt *Danielle presenting an estate planning workshop*)

**Page outline**

H1: Estate planning attorneys in St. Pete Beach
An estate plan is the set of documents that lets the people you trust act for you — while you're alive if you can't, and after. Most people put it off because it sounds expensive and morbid. It's neither. We'll tell you what you actually need, what it costs, and then do it.
Buttons: Schedule a Consultation · Register for the Workshop

H2: Who this is for (five cards)
- **You just moved to Florida.** Your old will probably still works. Your old plan probably doesn't. [What to update first](/estate-planning/moving-to-florida/)
- **A parent has died.** You're not sure what probate is or whether you need it. [How probate works here](/estate-planning/probate/)
- **You have kids now.** Who raises them, and who handles the money, if something happens. [Wills and guardianship](/estate-planning/wills-and-trusts/)
- **You're thinking about retirement.** Or someone in the family got a diagnosis. [Powers of attorney and health care](/estate-planning/powers-of-attorney/)
- **You own a business.** What happens to it, and to the people who work there. [Business succession](/estate-planning/business-succession/)

H2: Wills and trusts — A will says who gets what and who's in charge. A trust can do that without a court. Which one you need depends on what you own, who you're leaving it to, and whether you'd rather spend a little now or have your family spend more later. We'll tell you plainly which fits.
H2: Probate — Probate is the court process for passing on what someone owned. In Florida it can be short or long depending on what was planned ahead of time. We handle formal, summary and ancillary probate for families here and for out-of-state owners of Florida property.
H2: Powers of attorney and health care documents — The documents that matter while you're alive: who can sign for you, who can speak to your doctors, and what you'd want. Every adult should have these; most don't.
H2: Your home is part of the plan — For most families on the beach the house is the biggest thing they own. A [Lady Bird deed](/real-estate/deeds-and-title/#lady-bird-deeds) or a deed into a trust can keep it out of probate entirely — and because we're a real estate firm, we draft and record that deed ourselves. Nothing gets handed off.
H2: What it costs — **[confirm Danielle's numbers or framing]**. Will package from a flat fee; trust package from a flat fee; POA set included or priced; probate quoted after we see the estate.
H2: Workshops — free in-person workshop several times a year. Button: Register. Link: Watch a past workshop → `/resources/videos/`
H2: Recent articles on estate planning — three latest.
How-it-starts block.

---

## Estate Planning sub-pages

### Wills and Trusts — `/estate-planning/wills-and-trusts/`
- Title: Wills & Trusts Attorney – St. Pete Beach │ Vaughn Law
- Description: Do you need a will or a trust in Florida? A St. Pete Beach estate planning attorney explains the difference, the five documents every adult needs, and what each costs.
- Keywords: will vs trust Florida · revocable living trust attorney St. Petersburg · estate planning documents Florida

H1: Wills and trusts — Part of our [estate planning practice](/estate-planning/). The question everyone asks first is "do I need a trust?" The honest answer is: sometimes. Here's how to tell.
H2: Will or trust? — A will works after you die and goes through probate. A trust works now and skips probate for whatever it holds. If you own a home and want your family to avoid court, a trust usually wins. If your situation is simple, a will plus a Lady Bird deed may do the same job for less. Link: What Is the Difference Between a Will and a Trust?
H2: The five documents everyone needs — will · revocable trust (if needed) · durable POA · health care surrogate · living will.
H2: Revocable living trusts — Links: Why a Revocable Living Trust Remains the Smartest Path · Funding Your Trust · 10 Types of Trusts
H2: Guardians for minor children — Link: Estate Planning for Parents with Minor Children
H2: If you don't have a will — Link: You Don't Have a Will. Florida Does.
H2: Keeping it current — Links: When Should You Update Your Estate Plan? · 12 Common Estate Planning Mistakes
H2: Terms you'll hear — accordion glossary from the current Important Terms page, 15–20 terms.
H2: What it costs — **[confirm flat fees]**

### Probate — `/estate-planning/probate/`
- Title: Probate Attorney – St. Pete Beach & Pinellas County │ Vaughn Law
- Description: Formal, summary and ancillary probate in Pinellas County, explained plainly: what it is, how long it takes, what it costs, and how to avoid it next time.
- Keywords: probate attorney St. Petersburg · how long does probate take in Florida · ancillary probate Florida · avoid probate Florida

H1: Probate in Pinellas County — Part of our [estate planning practice](/estate-planning/). If someone has died and owned property in Florida, you may be reading this at the worst possible time. Here's what probate is and what we do.
H2: What probate is · H2: Formal vs. summary administration · H2: Ancillary probate for out-of-state owners · H2: The personal representative's job · H2: How long it takes and what it costs **[ranges, fee basis — confirm]** · H2: When co-owners disagree (cross-link Partition) · H2: Avoiding probate next time

### Powers of Attorney and Health Care — `/estate-planning/powers-of-attorney/`
- Title: Power of Attorney & Health Care Surrogate – Florida │ Vaughn Law
- Description: Durable power of attorney, health care surrogate and living will for Florida residents. Who should hold them, what they can do, and why every adult needs them.
- Keywords: durable power of attorney Florida · health care surrogate Florida · living will attorney St. Petersburg

H1: Powers of attorney and health care documents — A will handles what happens after. These handle what happens if you're alive and can't act for yourself — which is far more likely, and far less planned for.
H2: Durable power of attorney · H2: Health care surrogate · H2: Living will · H2: Who should hold them · H2: For seniors and their families · H2: What it costs **[confirm]**

### Moving to Florida — `/estate-planning/moving-to-florida/`
- Title: Moved to Florida? Update Your Estate Plan – St. Pete Beach │ Vaughn Law
- Description: New to Florida? Your will may be valid but your plan may not work here. Homestead, domicile, and the documents to update first, from a St. Pete Beach estate planning attorney.
- Keywords: update estate plan after moving to Florida · Florida domicile estate planning · new Florida resident will

H1: Just moved to Florida? Here's what to update — Half the people who walk into our office moved here in the last few years. Nearly all of them have a plan from somewhere else. Most of those plans have a problem.
H2: Your old will is probably valid — and probably wrong · H2: Homestead changes everything · H2: Establishing Florida domicile · H2: What it costs you to wait · H2: Hurricane-proofing your documents · H2: What it costs — plan review **[flat fee]**

### Business Succession — `/estate-planning/business-succession/`
- Title: Business Succession Planning – St. Pete Beach │ Vaughn Law
- Description: What happens to your business if you can't run it tomorrow? Succession plans, buy-sell agreements, and entity structures that work with your estate plan.
- Keywords: business succession plan Florida · buy-sell agreement attorney Tampa Bay

H1: Business succession planning — If you own a business, your estate plan has a second client: the business.
H2: What happens without a plan (When the Boss Goes Silent · The Empire That Vanished) · H2: What a succession plan is · H2: Buy-sell agreements · H2: Entities and trusts together · H2: What it costs — quoted

---

## About pages

### The Firm — `/about/`
- Title: About Vaughn Law – Real Estate & Estate Planning on St. Pete Beach │ Vaughn Law
- Description: Vaughn Law is a real estate and estate planning firm on Corey Avenue in St. Pete Beach, led by a Florida Bar Board Certified real estate attorney. Here's how we work.
- Images: office exterior · conference room · team

H1: A property law firm on the beach
H2: Why St. Pete Beach — **[Danielle's words, 150–200]** · H2: How we work · H2: Board certified, and what that means · H2: The team · H2: In the community

### Our Team — `/about/our-team/`
- Title: Our Team – Danielle Vaughn, Whitney Smith & Staff │ Vaughn Law
- Description: Meet the attorneys and staff at Vaughn Law in St. Pete Beach: Danielle Vaughn, Board Certified real estate attorney; Whitney Smith, real estate litigation; and the people who run your closing.

H1: Our team — one H2 per person with anchor ids; credentials as H3s.
H2: Danielle Vaughn, Managing Attorney (`#danielle-vaughn`) — H3: Board certification · Education · Bar admissions · Memberships · Speaking · Awards · Pro bono. Links: Estate planning · Real estate · Watch Danielle's workshops · Avvo · The Fund.
H2: Whitney L. Smith, Real Estate Litigation Attorney (`#whitney-smith`) — H3: Education · Memberships and community · Background. Links: Property disputes · Landlord and tenant.
H2: Tracey Pion, Director of Operations · Pamela Cihlar, Office Manager and Bookkeeper · Mike Delcour, Bookkeeper · Barbara Trawinski · Kathie Hart · Amanda Wadas · Joe Pritt · Daniela Brown · Ana Chincilla · Luciana · Jeric · Veronica Wadsworth **[confirm names, roles, current]**

### Workshops and Events — `/about/workshops/`
- Title: Free Estate Planning Workshops – St. Pete Beach │ Vaughn Law
- Description: Free in-person estate planning workshops with attorney Danielle Vaughn in St. Pete Beach. See the next date, register, or watch a past session.

H1: Workshops and events — *Estate Planning: How to Protect Your Home, Savings & Family From Costly Mistakes*, free, several times a year. No pitch.
H2: Next workshop — date, time, location (Florida Lithuanian Center, 4880 46th Ave N, St. Petersburg), registration form (name, email, phone, date, seats). Button: Reserve a Seat.
H2: Past workshops — with recordings · H2: Speaking — invite line → `/contact/`

### For Realtors — `/about/for-realtors/`
- Title: For Realtors – Attorney Closings in St. Pete Beach │ Vaughn Law
- Description: Send your closings to a law firm: faster answers when something goes wrong, wire-fraud protection, and a team that knows Pinellas. How to order and what we need.

H1: For realtors
H2: Why a law firm for your closings · H2: How to send us a file (form: address, buyer/seller, closing date, lender, agent; button: Send a File) · H2: Turnaround and communication **[confirm]** · H2: Wire fraud: how we protect closing funds (`#wire-fraud`) · H2: Best practices for a clean file · H2: Guides to share with clients

---

## Resources pages

### Articles — `/resources/articles/`
Title: Articles on Florida Property & Estate Law │ Vaughn Law. H1: Articles. Topic filter buttons: All · Buying and Selling · Deeds and Title · Landlord and Tenant · Investors and Disputes · Estate Planning · Vaughn Voyage. Cards newest first; pagination. H2: The Vaughn Voyage (`/resources/articles/vaughn-voyage/`) — nine Voyage posts + signup. Article template: H1 · byline · paired video at top · H2 every 200–300 words · first paragraph links to service page · Related (2) · How-it-starts. `Article` schema.

### Videos — `/resources/videos/`
Title: Videos – Florida Real Estate & Estate Planning Explained │ Vaughn Law. H1: Videos. Same topic filter; each video gets its own page with embed, summary, paired article, `VideoObject`. Replaces `/resources/video-library/`.

### FAQ — `/resources/faq/`
Title: Frequently Asked Questions – Florida Property & Estate Law │ Vaughn Law. H1: Questions we get asked. Accordion, `FAQPage` schema, 20–30 questions:
- Buying and selling: Do I need a lawyer to buy or sell in Florida? · Cost vs title company? · What is title insurance? · What is earnest money? · What happens on closing day? · Can I close remotely?
- Deeds and title: Add my spouse to my deed? · What is a Lady Bird deed? · Put my house in my trust? · File homestead, how often? · What is quiet title?
- Landlords and tenants: Evict in Pinellas? · Three-day notice? · Accept partial rent? · Flood disclosure?
- Estate planning: Will or trust? · Die without a will in Florida? · Moved to Florida — is my will good? · Who as POA? · How much does a plan cost?
- Probate: What is it? · How long in Florida? · Summary administration? · Out-of-state parent with a Florida condo? · Can I avoid it?
- Working with us: Is the first call free? **[confirm]** · How do you charge? · Where are you?

### Guides and Calculators — `/resources/guides/`
Title: Guides, Calculators & Forms – Florida Closings & Estate Planning │ Vaughn Law. H1: Guides and calculators. H2: The closing process, step by step (`/resources/guides/closing-process/`, 800–1,200 words + PDF) · What a closing costs · Calculators (title premium, net sheet) · What to bring to your estate planning meeting · Booklets and forms **[confirm current]**

---

## Contact and utility

### Contact — `/contact/`
Title: Contact Vaughn Law – St. Pete Beach │ (727) 223-6080. Description: Schedule a consultation with Vaughn Law, 350 Corey Ave, St. Pete Beach. Call (727) 223-6080 or send a note and we'll get back to you the same business day.
H1: Get in touch — *Call, send a note, or stop by. We'll tell you what it takes before you decide anything.*
H2: Send a note — Name · Email · Phone · What's this about? (Buying or selling · A deed or title question · Landlord or tenant · Estate planning · Probate · A dispute · I'm a realtor · Something else) · How did you hear about us? · Message. Consent line: *Sending this doesn't create an attorney-client relationship and isn't confidential yet — please don't include sensitive details until we've talked.* Button: Send. Success: *Thanks — we'll be in touch by the next business day.* Dropdown value in the email subject.
H2: Call or visit — phone, fax, email, address → map, hours **[confirm]**, parking **[confirm]**
H2: Prefer to book a time? — scheduler if any **[confirm]**
`LegalService` schema with address, telephone, openingHoursSpecification, geo.

Privacy Policy, Disclaimer — keep current text, `noindex`. Careers — keep if used. 404 — *That page moved when we rebuilt the site* + four links + search. Thank-you pages `/contact/thanks/`, `/about/workshops/thanks/` — `noindex`, the "what happens next" video, three articles; where conversions get counted.

---

## Open items to confirm with Danielle

**Facts**: board certification area + year · years on the beach / closings count · hours, parking · landlords only? · team names, roles, who's current · which booklets/forms are current · keep Careers? · what is `/subscription-plans/`?
**Pricing**: free initial call? · flat fees for closing, deed, Lady Bird deed, eviction, lease, LLC, land trust, will package, trust package, POA set, plan review · probate fee basis and durations · litigation hourly
**Operations**: where workshop registrations go · scheduler? · who receives each contact category · realtor turnaround and contact
**Content she writes**: "Why St. Pete Beach" · her and Whitney's bios · approve FAQ groups
**Assets**: photos (exterior, conference room, closing table, Danielle, Whitney, team, workshop) · logo files · YouTube inventory (done) · Google Business Profile + Search Console access
