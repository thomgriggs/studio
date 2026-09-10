function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const timestamp = new Date().toISOString();
const lines = [];

const DEFAULT_PAGES = [
  {
    slug: "about",
    title: "About",
    kind: "content",
    content: {
      heading: "A hotel shaped by the coastline.",
      intro: "Tidehouse began as a single beach house, rebuilt slowly with the tide in mind.",
      body: "Thirty-two rooms sit between the hillside and the Pacific, each one turned toward the water. The garden kitchen serves what the coast provides that week, and the path down to the beach is never more than a few minutes from any door. We keep the rhythm slow on purpose — this is a place for the fourth morning, not just the first.",
      seoTitle: "About Tidehouse",
      seoDescription: "How a single beach house became a thirty-two room hotel shaped by the Pacific coastline."
    }
  },
  {
    slug: "rooms",
    title: "Rooms",
    kind: "rooms",
    content: {
      heading: "Every room, every view.",
      intro: "From the Coast Room to the Horizon Suite, each room is built around its light.",
      body: "",
      seoTitle: "Rooms & Suites at Tidehouse",
      seoDescription: "Browse every room and suite at Tidehouse, from the Coast Room to the Horizon Suite."
    }
  },
  {
    slug: "dining",
    title: "Dining",
    kind: "dining",
    content: {
      heading: "A garden kitchen, close to the water.",
      intro: "Seasonal, coastal, and served slowly.",
      body: "",
      seoTitle: "Dining at Tidehouse",
      seoDescription: "See the full seasonal menu served at Tidehouse's garden kitchen."
    }
  },
  {
    slug: "offers",
    title: "Offers",
    kind: "content",
    content: {
      heading: "Stay a little longer.",
      intro: "Book three nights and enjoy the fourth morning at your own pace.",
      body: "Our standing offer runs year-round: stay three nights in any room and the fourth morning is on us — no early checkout, no rush. Ask at booking or mention it when you arrive.",
      seoTitle: "Offers at Tidehouse",
      seoDescription: "Current stay offers and seasonal packages at Tidehouse."
    }
  },
  {
    slug: "contact",
    title: "Contact",
    kind: "form",
    content: {
      heading: "Get in touch.",
      intro: "We usually reply within a day.",
      body: "",
      seoTitle: "Contact Tidehouse",
      seoDescription: "Reach the Tidehouse team with questions about your stay."
    }
  }
];

for (const page of DEFAULT_PAGES) {
  const json = sqlString(JSON.stringify(page.content));
  lines.push(
    `INSERT INTO pages (slug, title, kind, draft_json, published_json, created_at, updated_at) VALUES (${sqlString(page.slug)}, ${sqlString(page.title)}, ${sqlString(page.kind)}, ${json}, ${json}, ${sqlString(timestamp)}, ${sqlString(timestamp)});`
  );
}

console.log(lines.join("\n"));
