export const fieldDefinitions = Object.freeze({
  eyebrow: { label: "Hero eyebrow", maxLength: 80, inline: true },
  heading: { label: "Hero heading", maxLength: 120, inline: true },
  introduction: { label: "Introduction", maxLength: 500, inline: true },
  storyEyebrow: { label: "Story eyebrow", maxLength: 80, inline: true, section: "Story" },
  storyTitle: { label: "Story heading", maxLength: 140, inline: true, section: "Story" },
  storyText: { label: "Story description", maxLength: 500, inline: true, section: "Story" },
  roomsEyebrow: { label: "Rooms eyebrow", maxLength: 80, inline: true, section: "Rooms listing" },
  roomsTitle: { label: "Rooms heading", maxLength: 120, inline: true, section: "Rooms listing" },
  offerTitle: { label: "Offer title", maxLength: 100, inline: true },
  offerText: { label: "Offer description", maxLength: 300, inline: true },
  seoTitle: { label: "Page title", maxLength: 70, section: "SEO", help: "Shown in the browser tab and search results." },
  seoDescription: { label: "Meta description", maxLength: 160, section: "SEO", help: "Shown under the title in search results." },
  bookingLabel: { label: "Booking button label", maxLength: 30, section: "Settings" },
  siteName: { label: "Site name", maxLength: 60, section: "Settings", help: "Shown in the header and footer logo." },
  footerTagline: { label: "Footer tagline", maxLength: 100, section: "Settings" },
  heroImageId: { label: "Hero background image", maxLength: 40, section: "Settings", help: "Set from the Media library. Leave empty to use the default background.", optional: true, managedInMedia: true }
});

export const seedContent = Object.freeze({
  eyebrow: "A quieter edge of California",
  heading: "Stay close to the tide.",
  introduction:
    "A small coastal hotel shaped by salt air, warm light, and unhurried days.",
  storyEyebrow: "Made for slower days",
  storyTitle: "Between the hillside and the Pacific.",
  storyText: "Thirty-two rooms, a garden kitchen, and a path that reaches the water before breakfast.",
  roomsEyebrow: "Rooms & suites",
  roomsTitle: "Find your view.",
  offerTitle: "Stay a little longer",
  offerText: "Book three nights and enjoy the fourth morning at your own pace.",
  seoTitle: "Tidehouse — a quieter edge of California",
  seoDescription: "A quiet coastal hotel shaped by salt air, warm light, and unhurried days.",
  bookingLabel: "Check availability",
  siteName: "Tidehouse",
  footerTagline: "Somewhere on the California coast",
  heroImageId: ""
});

const NON_CONTENT_SECTIONS = new Set(["SEO", "Settings"]);

export const translatableFields = Object.freeze(
  Object.keys(fieldDefinitions).filter((field) => {
    const definition = fieldDefinitions[field];
    return !definition.managedInMedia && !NON_CONTENT_SECTIONS.has(definition.section);
  })
);

export const MAX_LOCALES = 20;
const LOCALE_CODE_PATTERN = /^[a-z]{2,8}(-[a-z]{2,8})?$/;

export function validateLocaleCode(code) {
  const normalized = String(code ?? "").trim().toLowerCase();
  if (!LOCALE_CODE_PATTERN.test(normalized)) {
    return { ok: false, error: "Language code must look like \"fr\" or \"pt-br\"." };
  }
  if (normalized === "en") return { ok: false, error: "\"en\" is reserved for the main language." };
  return { ok: true, value: normalized };
}

export function validateLocaleName(name) {
  const normalized = String(name ?? "").trim();
  if (!normalized) return { ok: false, error: "Language name cannot be empty." };
  if (normalized.length > 60) return { ok: false, error: "Language name is too long." };
  return { ok: true, value: normalized };
}

export function validateTranslationPatch(patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return { ok: false, error: "The update must be an object." };
  }
  const entries = Object.entries(patch);
  if (entries.length !== 1) return { ok: false, error: "Update exactly one field at a time." };

  const [[field, value]] = entries;
  if (!translatableFields.includes(field)) return { ok: false, error: "Unknown field." };
  if (typeof value !== "string") return { ok: false, error: "Value must be text." };

  const definition = fieldDefinitions[field];
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  if (normalized.length > definition.maxLength) return { ok: false, error: `${definition.label} is too long.` };
  return { ok: true, field, value: normalized };
}

export function validatePatch(patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return { ok: false, error: "The update must be an object." };
  }

  const entries = Object.entries(patch);
  if (entries.length !== 1) {
    return { ok: false, error: "Update exactly one field at a time." };
  }

  const [[field, value]] = entries;
  const definition = fieldDefinitions[field];
  if (!definition) return { ok: false, error: "Unknown field." };
  if (typeof value !== "string") return { ok: false, error: "Value must be text." };

  const normalized = value.replace(/\r\n?/g, "\n").trim();
  if (!normalized) {
    if (definition.optional) return { ok: true, field, value: "" };
    return { ok: false, error: `${definition.label} cannot be empty.` };
  }
  if (normalized.length > definition.maxLength) {
    return { ok: false, error: `${definition.label} is too long.` };
  }

  return { ok: true, field, value: normalized };
}

export const ALLOWED_MEDIA_TYPES = Object.freeze({
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif"
});

export const MAX_MEDIA_BYTES = 5 * 1024 * 1024;

export function validateMediaUpload(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Upload payload must be an object." };
  }
  const { filename, mimeType, dataBase64 } = body;
  const extension = ALLOWED_MEDIA_TYPES[mimeType];
  if (!extension) return { ok: false, error: "Unsupported image type. Use PNG, JPEG, WebP, or GIF." };
  if (typeof dataBase64 !== "string" || !dataBase64) return { ok: false, error: "No file data provided." };

  let buffer;
  try {
    buffer = Buffer.from(dataBase64, "base64");
  } catch {
    return { ok: false, error: "File data is not valid base64." };
  }
  if (!buffer.length) return { ok: false, error: "File is empty." };
  if (buffer.length > MAX_MEDIA_BYTES) return { ok: false, error: "File is larger than 5 MB." };

  const originalName = String(filename || "upload").replace(/[^a-zA-Z0-9 _.-]/g, "").slice(0, 120).trim() || "upload";
  return { ok: true, data: { buffer, size: buffer.length, extension, mimeType, originalName } };
}

export const MAX_MENU_DEPTH = 5;
export const MAX_MENU_ITEMS = 200;
export const MAX_MENUS = 20;

export function validateMenuName(name) {
  const normalized = String(name ?? "").trim();
  if (!normalized) return { ok: false, error: "Menu name cannot be empty." };
  if (normalized.length > 60) return { ok: false, error: "Menu name is too long." };
  return { ok: true, value: normalized };
}

function validateMenuNode(node, depth, counter) {
  if (!node || typeof node !== "object" || Array.isArray(node)) return { ok: false, error: "Each menu item must be an object." };
  const id = String(node.id || "").trim().slice(0, 40) || `item-${counter.value}`;
  const label = String(node.label ?? "").trim().slice(0, 60);
  if (!label) return { ok: false, error: "Every menu item needs a label." };
  const href = String(node.href ?? "").trim().slice(0, 300);
  counter.value += 1;
  if (counter.value > MAX_MENU_ITEMS) return { ok: false, error: `A menu can hold at most ${MAX_MENU_ITEMS} items.` };
  if (depth > MAX_MENU_DEPTH) return { ok: false, error: `Submenus can only nest ${MAX_MENU_DEPTH} levels deep.` };

  const rawChildren = Array.isArray(node.children) ? node.children : [];
  const children = [];
  for (const child of rawChildren) {
    const result = validateMenuNode(child, depth + 1, counter);
    if (!result.ok) return result;
    children.push(result.value);
  }
  return { ok: true, value: { id, label, href, children } };
}

export function validateMenuItems(items) {
  if (!Array.isArray(items)) return { ok: false, error: "Menu items must be a list." };
  const counter = { value: 0 };
  const value = [];
  for (const node of items) {
    const result = validateMenuNode(node, 1, counter);
    if (!result.ok) return result;
    value.push(result.value);
  }
  return { ok: true, value };
}

export function validateMenuOrder(order, validIds) {
  if (!Array.isArray(order) || !order.length) return { ok: false, error: "Order must be a non-empty list." };
  const ids = order.map((value) => Number(value));
  if (ids.some((id) => !Number.isInteger(id))) return { ok: false, error: "Order must contain menu ids." };
  const validSet = new Set(validIds);
  if (ids.length !== validSet.size || !ids.every((id) => validSet.has(id))) {
    return { ok: false, error: "Order must include every existing menu exactly once." };
  }
  return { ok: true, value: ids };
}

export const MAX_FORMS = 20;
export const MAX_FORM_FIELDS = 30;
export const FORM_FIELD_TYPES = Object.freeze(["text", "email", "textarea", "select", "checkbox"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateFormName(name) {
  const normalized = String(name ?? "").trim();
  if (!normalized) return { ok: false, error: "Form name cannot be empty." };
  if (normalized.length > 60) return { ok: false, error: "Form name is too long." };
  return { ok: true, value: normalized };
}

function validateFormField(field, index) {
  if (!field || typeof field !== "object" || Array.isArray(field)) return { ok: false, error: "Each field must be an object." };
  const id = String(field.id || "").trim().slice(0, 40) || `field-${index}`;
  const label = String(field.label ?? "").trim().slice(0, 80);
  if (!label) return { ok: false, error: "Every field needs a label." };
  const type = FORM_FIELD_TYPES.includes(field.type) ? field.type : "text";
  const required = Boolean(field.required);
  const width = field.width === "half" ? "half" : "full";

  let options;
  if (type === "select") {
    const rawOptions = Array.isArray(field.options) ? field.options : [];
    options = rawOptions.map((option) => String(option).trim().slice(0, 60)).filter(Boolean).slice(0, 20);
    if (!options.length) return { ok: false, error: `"${label}" needs at least one option.` };
  }

  return { ok: true, value: { id, label, type, required, width, ...(options ? { options } : {}) } };
}

export function validateFormFields(fields) {
  if (!Array.isArray(fields)) return { ok: false, error: "Fields must be a list." };
  if (fields.length > MAX_FORM_FIELDS) return { ok: false, error: `A form can hold at most ${MAX_FORM_FIELDS} fields.` };
  const value = [];
  const seenIds = new Set();
  for (const [index, field] of fields.entries()) {
    const result = validateFormField(field, index);
    if (!result.ok) return result;
    if (seenIds.has(result.value.id)) return { ok: false, error: "Field ids must be unique." };
    seenIds.add(result.value.id);
    value.push(result.value);
  }
  return { ok: true, value };
}

export function validateSubmission(fields, data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false, error: "Submission must be an object." };
  const allowedIds = new Set(fields.map((field) => field.id));
  const hasUnknownField = Object.keys(data).some((key) => !allowedIds.has(key));
  if (hasUnknownField) return { ok: false, error: "Submission includes an unknown field." };

  const value = {};
  for (const field of fields) {
    const raw = data[field.id];
    if (field.type === "checkbox") {
      value[field.id] = Boolean(raw);
      continue;
    }
    const text = String(raw ?? "").replace(/\r\n?/g, "\n").trim();
    if (field.required && !text) return { ok: false, error: `${field.label} is required.` };
    if (field.type === "email" && text && !EMAIL_PATTERN.test(text)) return { ok: false, error: `${field.label} must be a valid email address.` };
    if (field.type === "select" && text && !field.options.includes(text)) return { ok: false, error: `${field.label} is invalid.` };
    const maxLength = field.type === "textarea" ? 2000 : 300;
    if (text.length > maxLength) return { ok: false, error: `${field.label} is too long.` };
    value[field.id] = text;
  }
  return { ok: true, value };
}
