import { seedContent } from "../src/content.js";
import { seedEntries } from "../src/models.js";

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const timestamp = new Date().toISOString();
const lines = [];

const contentJson = sqlString(JSON.stringify(seedContent));
lines.push(`INSERT INTO site_state (key, value, updated_at) VALUES ('published', ${contentJson}, ${sqlString(timestamp)});`);
lines.push(`INSERT INTO site_state (key, value, updated_at) VALUES ('draft', ${contentJson}, ${sqlString(timestamp)});`);
lines.push(`INSERT INTO revisions (created_at, content_json) VALUES (${sqlString(timestamp)}, ${contentJson});`);

for (const entry of seedEntries) {
  const dataJson = sqlString(JSON.stringify(entry.data));
  lines.push(
    `INSERT INTO entries (type_id, draft_json, published_json, created_at, updated_at) VALUES (${sqlString(entry.typeId)}, ${dataJson}, ${dataJson}, ${sqlString(timestamp)}, ${sqlString(timestamp)});`
  );
}

const defaultMenuItems = [
  { id: "stay", label: "Stay", href: "#stay", children: [] },
  { id: "story", label: "Our story", href: "#story", children: [] },
  { id: "offer", label: "Offers", href: "#offer", children: [] }
];
const menuJson = sqlString(JSON.stringify(defaultMenuItems));
lines.push(
  `INSERT INTO menus (name, position, draft_json, published_json, created_at, updated_at) VALUES ('Header menu', 0, ${menuJson}, ${menuJson}, ${sqlString(timestamp)}, ${sqlString(timestamp)});`
);

const defaultFormFields = [
  { id: "name", label: "Name", type: "text", required: true, width: "full" },
  { id: "email", label: "Email", type: "email", required: true, width: "half" },
  { id: "phone", label: "Phone", type: "text", required: false, width: "half" },
  { id: "message", label: "Message", type: "textarea", required: true, width: "full" }
];
lines.push(
  `INSERT INTO forms (name, position, fields_json, created_at, updated_at) VALUES ('Contact form', 0, ${sqlString(JSON.stringify(defaultFormFields))}, ${sqlString(timestamp)}, ${sqlString(timestamp)});`
);

lines.push(`INSERT INTO locales (code, name, position, created_at) VALUES ('es', 'Spanish', 0, ${sqlString(timestamp)});`);

console.log(lines.join("\n"));
