export const fieldDefinitions = Object.freeze({
  eyebrow: { label: "Hero eyebrow", maxLength: 80, inline: true },
  heading: { label: "Hero heading", maxLength: 120, inline: true },
  introduction: { label: "Introduction", maxLength: 500, inline: true },
  storyEyebrow: { label: "Story eyebrow", maxLength: 80, inline: true, section: "Story" },
  storyTitle: { label: "Story heading", maxLength: 140, inline: true, section: "Story" },
  storyText: { label: "Story description", maxLength: 500, inline: true, section: "Story" },
  roomsEyebrow: { label: "Rooms eyebrow", maxLength: 80, inline: true, section: "Rooms listing" },
  roomsTitle: { label: "Rooms heading", maxLength: 120, inline: true, section: "Rooms listing" },
  heroButtonLabel: { label: "Hero button label", maxLength: 40, inline: true },
  offerKicker: { label: "Offer eyebrow", maxLength: 40, inline: true },
  offerTitle: { label: "Offer title", maxLength: 100, inline: true },
  offerText: { label: "Offer description", maxLength: 300, inline: true },
  offerLinkLabel: { label: "Offer link label", maxLength: 40, inline: true },
  contactKicker: { label: "Contact eyebrow", maxLength: 40, inline: true },
  seoTitle: { label: "Page title", maxLength: 70, section: "SEO", help: "Shown in the browser tab and search results." },
  seoDescription: { label: "Meta description", maxLength: 160, section: "SEO", help: "Shown under the title in search results." },
  bookingLabel: { label: "Booking button label", maxLength: 30, section: "Settings", translatable: true },
  siteName: { label: "Site name", maxLength: 60, section: "Settings", help: "Shown in the header and footer logo. Not translated, since brand names usually stay the same across languages." },
  footerTagline: { label: "Footer tagline", maxLength: 100, section: "Settings", translatable: true },
  footerNote: { label: "Footer note", maxLength: 100, section: "Settings", translatable: true },
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
  heroButtonLabel: "Discover Tidehouse",
  offerKicker: "Seasonal offer",
  offerTitle: "Stay a little longer",
  offerText: "Book three nights and enjoy the fourth morning at your own pace.",
  offerLinkLabel: "View the offer",
  contactKicker: "Get in touch",
  seoTitle: "Tidehouse — a quieter edge of California",
  seoDescription: "A quiet coastal hotel shaped by salt air, warm light, and unhurried days.",
  bookingLabel: "Check availability",
  siteName: "Tidehouse",
  footerTagline: "Somewhere on the California coast",
  footerNote: "Demo property for Pagecraft",
  heroImageId: ""
});

const NON_CONTENT_SECTIONS = new Set(["SEO", "Settings"]);

export const translatableFields = Object.freeze(
  Object.keys(fieldDefinitions).filter((field) => {
    const definition = fieldDefinitions[field];
    if (definition.managedInMedia) return false;
    if (!NON_CONTENT_SECTIONS.has(definition.section)) return true;
    // A field in an excluded section (e.g. Settings) can still opt back in —
    // used for visible site text like the footer tagline or booking button
    // label, which should translate even though they live in Site Settings.
    return Boolean(definition.translatable);
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

export const MAX_PAGES = 30;
const RESERVED_SLUGS = new Set(["home", "api", "uploads", "pagecraft"]);
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const pageKinds = Object.freeze({
  content: "A heading, intro, and body of text.",
  rooms: "Lists every published room, in full.",
  dining: "Lists every published dish, in full.",
  form: "Embeds the site's primary contact form."
});

export function validatePageSlug(slug) {
  const normalized = String(slug ?? "").trim().toLowerCase();
  if (!SLUG_PATTERN.test(normalized) || normalized.length > 40) {
    return { ok: false, error: "Path must be lowercase letters, numbers, and hyphens, like \"about\" or \"our-story\"." };
  }
  if (RESERVED_SLUGS.has(normalized)) return { ok: false, error: `"${normalized}" is reserved.` };
  return { ok: true, value: normalized };
}

export function validatePageTitle(title) {
  const normalized = String(title ?? "").trim();
  if (!normalized) return { ok: false, error: "Page title cannot be empty." };
  if (normalized.length > 60) return { ok: false, error: "Page title is too long." };
  return { ok: true, value: normalized };
}

export function validatePageKind(kind) {
  return Object.prototype.hasOwnProperty.call(pageKinds, kind) ? { ok: true, value: kind } : { ok: false, error: "Unknown page type." };
}

export function validatePageContent(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false, error: "Page content must be an object." };
  const heading = String(data.heading ?? "").trim().slice(0, 120);
  if (!heading) return { ok: false, error: "Page heading is required." };
  const intro = String(data.intro ?? "").trim().slice(0, 300);
  const body = String(data.body ?? "").trim().slice(0, 3000);
  const seoTitle = String(data.seoTitle ?? "").trim().slice(0, 70);
  const seoDescription = String(data.seoDescription ?? "").trim().slice(0, 160);
  return { ok: true, value: { heading, intro, body, seoTitle, seoDescription } };
}

export const pageTranslatableFields = Object.freeze(["heading", "intro", "body", "seoTitle", "seoDescription"]);
const PAGE_FIELD_MAX_LENGTHS = { heading: 120, intro: 300, body: 3000, seoTitle: 70, seoDescription: 160 };

export function validatePageTranslationPatch(patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return { ok: false, error: "The update must be an object." };
  }
  const entries = Object.entries(patch);
  if (entries.length !== 1) return { ok: false, error: "Update exactly one field at a time." };

  const [[field, value]] = entries;
  if (!pageTranslatableFields.includes(field)) return { ok: false, error: "Unknown field." };
  if (typeof value !== "string") return { ok: false, error: "Value must be text." };

  const normalized = value.replace(/\r\n?/g, "\n").trim();
  if (normalized.length > PAGE_FIELD_MAX_LENGTHS[field]) return { ok: false, error: `${field} is too long.` };
  return { ok: true, field, value: normalized };
}

// Curated so every option is a real, popular Google Font (plus the site's
// original system-font defaults). Values are Google Fonts family names,
// used both as the CSS font-family and in the Google Fonts stylesheet URL.
// A large, curated slice of the Google Fonts catalog, used to power a
// searchable picker. This isn't the full ~1800-family catalog (that requires
// a live Google Fonts API call, which this project deliberately avoids), but
// it isn't a hard allowlist either — validateSiteStyles accepts any
// well-formed font name, so typing an exact family name outside this list
// still works and still lazy-loads only when that font is actually chosen.
export const GOOGLE_FONTS = Object.freeze([...new Set([
  "Playfair Display", "Fraunces", "Cormorant Garamond", "Cormorant", "Libre Baskerville",
  "Lora", "Merriweather", "DM Serif Display", "DM Serif Text", "Bitter", "Crimson Text",
  "Crimson Pro", "EB Garamond", "Source Serif 4", "Spectral", "Playfair", "Vollkorn",
  "Bodoni Moda", "Prata", "Cardo", "Domine", "Noto Serif", "PT Serif", "Rufina",
  "Marcellus", "Cinzel", "Abril Fatface", "Cormorant Infant", "Frank Ruhl Libre",
  "Josefin Slab", "Zilla Slab", "Faustina", "Alegreya", "Alegreya Sans",
  "Work Sans", "Source Sans 3", "Nunito Sans", "Nunito", "Karla", "IBM Plex Sans",
  "Mulish", "Public Sans", "Rubik", "Inter", "Roboto", "Open Sans", "Lato",
  "Montserrat", "Poppins", "Raleway", "Oswald", "Manrope", "Barlow", "DM Sans",
  "Figtree", "Sora", "Outfit", "Plus Jakarta Sans", "Space Grotesk", "Urbanist",
  "Epilogue", "Jost", "Archivo", "Archivo Narrow", "Hind", "PT Sans", "Cabin",
  "Quicksand", "Josefin Sans", "Libre Franklin", "Overpass", "Red Hat Display",
  "Bricolage Grotesque", "Instrument Sans", "Onest", "Geist", "Schibsted Grotesk",
  "Bebas Neue", "Anton", "Oswald", "Archivo Black", "Big Shoulders Display",
  "Fjalla One", "Passion One", "Righteous", "Alfa Slab One", "Staatliches",
  "Caveat", "Pacifico", "Sacramento", "Dancing Script", "Great Vibes", "Satisfy",
  "Kalam", "Shadows Into Light", "Permanent Marker", "Indie Flower",
  "IBM Plex Mono", "JetBrains Mono", "Space Mono", "Roboto Mono", "Fira Code",
  "Source Code Pro", "Noto Sans", "Noto Sans JP", "Noto Sans KR", "Noto Sans SC",
  "Inter Tight", "Albert Sans", "General Sans"
])]);
// Kept for backwards compatibility with any external callers.
export const HEADING_FONTS = GOOGLE_FONTS;
export const BODY_FONTS = GOOGLE_FONTS;
export const BUTTON_RADII = Object.freeze(["sharp", "rounded", "pill"]);
export const FONT_WEIGHTS = Object.freeze([400, 500, 600, 700]);

export const defaultSiteStyles = Object.freeze({
  colorPrimary: "#176d68",
  colorText: "#17332f",
  colorBackground: "#fdfdf8",
  colorMuted: "#62706b",
  headingFont: "Georgia (default)",
  bodyFont: "Inter (default)",
  headingWeight: 400,
  bodyWeight: 400,
  buttonRadius: "sharp"
});

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

function validateHexColor(value, label) {
  const normalized = String(value ?? "").trim();
  if (!HEX_COLOR_PATTERN.test(normalized)) return { ok: false, error: `${label} must be a hex color like #176d68.` };
  return { ok: true, value: normalized.toLowerCase() };
}

const FONT_NAME_PATTERN = /^[A-Za-z0-9 '()\-]{1,60}$/;

function validateFontName(value, label) {
  const name = String(value ?? "").trim();
  if (!FONT_NAME_PATTERN.test(name)) return { ok: false, error: `${label} must be a valid font name.` };
  return { ok: true, value: name };
}

export function validateSiteStyles(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false, error: "Site styles must be an object." };
  const result = { ...defaultSiteStyles };

  for (const [field, label] of [["colorPrimary", "Primary color"], ["colorText", "Text color"], ["colorBackground", "Background color"], ["colorMuted", "Muted text color"]]) {
    if (data[field] === undefined) continue;
    const color = validateHexColor(data[field], label);
    if (!color.ok) return color;
    result[field] = color.value;
  }

  if (data.headingFont !== undefined) {
    const font = validateFontName(data.headingFont, "Heading font");
    if (!font.ok) return font;
    result.headingFont = font.value;
  }
  if (data.bodyFont !== undefined) {
    const font = validateFontName(data.bodyFont, "Body font");
    if (!font.ok) return font;
    result.bodyFont = font.value;
  }
  if (data.headingWeight !== undefined) {
    if (!FONT_WEIGHTS.includes(Number(data.headingWeight))) return { ok: false, error: "Unknown heading weight." };
    result.headingWeight = Number(data.headingWeight);
  }
  if (data.bodyWeight !== undefined) {
    if (!FONT_WEIGHTS.includes(Number(data.bodyWeight))) return { ok: false, error: "Unknown body weight." };
    result.bodyWeight = Number(data.bodyWeight);
  }
  if (data.buttonRadius !== undefined) {
    if (!BUTTON_RADII.includes(data.buttonRadius)) return { ok: false, error: "Unknown button style." };
    result.buttonRadius = data.buttonRadius;
  }

  return { ok: true, value: result };
}

export const LOGO_TYPES = Object.freeze(["text", "image"]);

export const defaultBranding = Object.freeze({
  logoType: "text",
  logoText: "",
  logoImageId: "",
  faviconId: "",
  socialImageId: ""
});

export function validateBranding(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false, error: "Branding must be an object." };
  const result = { ...defaultBranding };

  if (data.logoType !== undefined) {
    if (!LOGO_TYPES.includes(data.logoType)) return { ok: false, error: "Unknown logo type." };
    result.logoType = data.logoType;
  }
  if (data.logoText !== undefined) {
    const text = String(data.logoText).trim();
    if (text.length > 60) return { ok: false, error: "Logo text must be 60 characters or fewer." };
    result.logoText = text;
  }
  for (const field of ["logoImageId", "faviconId", "socialImageId"]) {
    if (data[field] === undefined) continue;
    const value = String(data[field] ?? "").trim();
    if (value.length > 60) return { ok: false, error: "Invalid media reference." };
    result[field] = value;
  }

  return { ok: true, value: result };
}
