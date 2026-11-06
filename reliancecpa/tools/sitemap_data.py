"""Hand-decided sitemap data for the Reliance CPA content layer (single source of truth).

Everything the scope, redirects, nav, mega-menu, footer and sitemap-map are derived from lives here.
Keys are live page slugs (content/pages/<slug>.json).
"""

TIERS = [
    {
        "id": "tax-preparation", "label": "Tax Preparation", "accent": "teal", "slug": "tax-preparation",
        "live_landing": "tax-preparation.htm",
        "description": "Returns, planning and IRS problems for individuals and businesses.",
        "items": [
            {"slug": "tax-planning.htm", "path": "tax-planning", "label": "Tax Planning"},
            {"slug": "business-tax.htm", "path": "business-tax", "label": "Business Tax"},
            {"slug": "income-tax-services.htm", "path": "income-tax-services", "label": "Income Tax Services",
             "merges": ["tax-preparer.htm"]},
            {"slug": "tax-problem-irs-audit-help.htm", "path": "irs-problem-resolution", "label": "IRS Problem Resolution"},
        ],
    },
    {
        "id": "business-accounting", "label": "Business Accounting", "accent": "sage", "slug": "business-accounting",
        "live_landing": "small-business-accounting.htm",
        "description": "Books, payroll and cash flow kept current for small businesses.",
        "items": [
            {"slug": "bookkeeping.htm", "path": "bookkeeping", "label": "Bookkeeping"},
            {"slug": "quickbooks-accountant.htm", "path": "quickbooks", "label": "QuickBooks Accountant"},
            {"slug": "reliance-consulting-backoffice", "path": "backoffice", "label": "Reliance BackOffice"},
            {"slug": "payroll-services.htm", "path": "payroll", "label": "Payroll Services"},
            {"slug": "cash-flow-management.htm", "path": "cash-flow-management", "label": "Cash Flow Management"},
        ],
    },
    {
        "id": "business-tax-consulting", "label": "Business & Tax Consulting", "accent": "gold", "slug": "business-tax-consulting",
        "live_landing": "business-consultants.htm",
        "description": "Planning, financing and advice for owners, from a first plan to the next step.",
        "items": [
            {"slug": "business-planning-services.htm", "path": "business-planning", "label": "Business Planning"},
            {"slug": "new-business-planning.htm", "path": "new-business-planning", "label": "New Business Planning"},
            {"slug": "business-finance-consultant.htm", "path": "business-finance-consulting", "label": "Business Finance Consulting"},
            {"slug": "financial-planning.htm", "path": "financial-planning", "label": "Financial Planning"},
            {"slug": "part-time-cfo.htm", "path": "part-time-cfo", "label": "Part-Time CFO", "promoted_from": "article-service-adjacent"},
            {"slug": "succession-planning.htm", "path": "succession-planning", "label": "Succession Planning", "promoted_from": "article-service-adjacent"},
        ],
        "industries": [
            {"slug": "physician-accountants.htm", "path": "physicians", "label": "Physicians and Healthcare",
             "related": ["making-money-in-medicine.htm", "doctor-decisions.htm"]},
            {"slug": "retail-accounting.htm", "path": "retail", "label": "Retail"},
            {"slug": "restaurant-hotel-accountant.htm", "path": "hospitality", "label": "Restaurants and Hotels"},
            {"slug": "real-estate-cpa.htm", "path": "real-estate", "label": "Real Estate"},
        ],
    },
]

# Tier for resource articles (related-resources tagging): tax / accounting / consulting / general
ARTICLE_TAG = {
    "tax": ["audit-help.htm", "cancellation-of-debt-income.htm", "household-employee-tax.htm", "irs-problems.htm",
            "late-income-tax-return.htm", "tax-saving-strategies.htm", "sales-tax-law.htm", "identity-theft.htm"],
    "accounting": ["business-record-retention.htm", "personal-record-retention.htm", "keep-financial-records.htm",
                   "how-payroll-processing-helps.htm", "internal-controls-evaluation.htm", "staying-on-budget.htm",
                   "employee-vs-independent-contractor.htm", "hiring-employees.htm", "hiring-family-members.htm",
                   "records-for-cpa-meeting.htm"],
    "consulting": ["business-valuation.htm", "corporation.htm", "limited-liability-corporation.htm", "partnership.htm",
                   "s-corporation.htm", "sole-proprietorship.htm", "forms-to-start-business.htm",
                   "employer-identification-number.htm", "home-based-business.htm", "green-business.htm",
                   "strategic-business-planning.htm", "checkup-financial-health.htm", "estate-planning.htm",
                   "get-started-estate-planning.htm", "importance-of-a-will.htm", "living-will.htm", "power-of-attorney.htm",
                   "what-is-a-trust.htm", "post-mortem-letter.htm", "long-term-care.htm", "life-insurance-needs-analysis.htm",
                   "why-you-need-life-insurance.htm", "reverse-mortgage.htm", "retirement-expenses.htm",
                   "elder-financial-care.htm", "financially-preparing-divorce.htm", "financially-preparing-marriage.htm",
                   "getting-good-financial-advice.htm", "doctor-decisions.htm", "making-money-in-medicine.htm",
                   "business-blog", "twitter"],
    "general": ["how-to-choose-cpa.htm", "what-is-a-cpa.htm"],
}

CLIENT_RESOURCES = [
    {"slug": "reliance-consulting-netclient-portals", "path": "client-portal", "label": "Client Portal"},
    {"slug": "app", "path": "mobile-app", "label": "Mobile App"},
    {"slug": "records-for-cpa-meeting.htm", "path": "records-for-your-first-meeting", "label": "What to Bring to Your First Meeting"},
]

ABOUT = [
    {"slug": "firmprofile.html", "path": "", "label": "Firm Profile", "overview": True},
    {"slug": "staff-profiles.htm", "path": "team", "label": "Our Team"},
    {"slug": "reasons-to-choose-reliance.htm", "path": "why-reliance", "label": "Why Choose Reliance"},
    {"slug": "custom2.html", "path": "careers", "label": "Employment"},
]

LOCAL = {  # local-seo pages: kept, not in nav
    "tampa-cpa-areas-served.htm": "areas-served",
    "cpa-firm-tampa-brandon-hillsborough.htm": "areas-served/tampa-brandon-hillsborough",
    "cpa-firm-tampa-stpetersburg-clearwater.htm": "areas-served/tampa-st-petersburg-clearwater",
    "cpa-firm-stpetersburg-clearwater-pinellas.htm": "areas-served/st-petersburg-clearwater-pinellas",
    "cpa-firm-pasco-county.htm": "areas-served/pasco-county",
    "cpa-firm-sarasota-bradenton.htm": "areas-served/sarasota-bradenton",
    "cpa-firm-lakeland-polk.htm": "areas-served/lakeland-polk",
    "cpa-firm-brooksville-hernando.htm": "areas-served/brooksville-hernando",
    "tampa-cpa-back-taxes": "tax-preparation/back-taxes",
}
