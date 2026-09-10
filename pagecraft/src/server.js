import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { fieldDefinitions, validatePatch, validateMediaUpload, validateMenuName, validateMenuItems, validateMenuOrder, MAX_MENUS, validateFormName, validateFormFields, validateSubmission, MAX_FORMS, validateTranslationPatch, validateLocaleCode, validateLocaleName, MAX_LOCALES, validatePageSlug, validatePageTitle, validatePageKind, validatePageContent, MAX_PAGES } from "./content.js";
import { validateEntry } from "./models.js";
import { createStore } from "./store.js";

const host = "127.0.0.1";
const port = Number.parseInt(process.env.STUDIO_PORT || "4173", 10);
const publicRoot = fileURLToPath(new URL("../public/", import.meta.url));
const databasePath = process.env.PAGECRAFT_DATABASE || fileURLToPath(new URL("../data/pagecraft.sqlite", import.meta.url));
const uploadsDir = process.env.PAGECRAFT_UPLOADS || fileURLToPath(new URL("../data/uploads/", import.meta.url));
mkdirSync(dirname(databasePath), { recursive: true });
mkdirSync(uploadsDir, { recursive: true });
const store = createStore({ path: databasePath });
const sessions = new Map();
const MAX_BODY = 16 * 1024;
const MAX_MEDIA_BODY = 7 * 1024 * 1024;

const users = Object.freeze({
  "thomgriggs@gmail.com": { role: "admin", passwordHash: hash(process.env.PAGECRAFT_ADMIN_PASSWORD || "admin-demo") },
  editor: { role: "editor", passwordHash: hash(process.env.PAGECRAFT_EDITOR_PASSWORD || "editor-demo") }
});

function hash(value) {
  return createHash("sha256").update(value).digest();
}

function equalSecret(value, expectedHash) {
  const actual = hash(value);
  return actual.length === expectedHash.length && timingSafeEqual(actual, expectedHash);
}

function parseCookies(header = "") {
  return Object.fromEntries(
    header.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
      const index = part.indexOf("=");
      return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
    })
  );
}

function sessionFor(request) {
  return sessions.get(parseCookies(request.headers.cookie).studio_session);
}

function json(response, status, body, extraHeaders = {}) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...extraHeaders
  });
  response.end(JSON.stringify(body));
}

async function readJson(request, maxBytes = MAX_BODY) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new Error("BODY_TOO_LARGE");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    throw new Error("INVALID_JSON");
  }
}

function requireSession(request, response, { admin = false } = {}) {
  const session = sessionFor(request);
  if (!session) {
    json(response, 401, { error: "Sign in required." });
    return null;
  }
  if (admin && session.role !== "admin") {
    json(response, 403, { error: "Administrator access required." });
    return null;
  }
  if (request.method !== "GET" && request.headers["x-csrf-token"] !== session.csrf) {
    json(response, 403, { error: "Invalid request token." });
    return null;
  }
  return session;
}

async function api(request, response, url) {
  if (url.pathname === "/api/login" && request.method === "POST") {
    const body = await readJson(request);
    const user = users[body.username];
    if (!user || typeof body.password !== "string" || !equalSecret(body.password, user.passwordHash)) {
      json(response, 401, { error: "Invalid credentials." });
      return;
    }
    const id = randomBytes(24).toString("base64url");
    const session = { username: body.username, role: user.role, csrf: randomBytes(24).toString("base64url") };
    sessions.set(id, session);
    json(response, 200, session, {
      "set-cookie": `studio_session=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=14400`
    });
    return;
  }

  if (url.pathname === "/api/logout" && request.method === "POST") {
    const session = requireSession(request, response);
    if (!session) return;
    sessions.delete(parseCookies(request.headers.cookie).studio_session);
    json(response, 200, { ok: true }, {
      "set-cookie": "studio_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
    });
    return;
  }

  if (url.pathname === "/api/session" && request.method === "GET") {
    const session = sessionFor(request);
    json(response, 200, session ? { authenticated: true, ...session } : { authenticated: false });
    return;
  }

  if (url.pathname === "/api/public" && request.method === "GET") {
    const rooms = store.listContent("room").entries.filter((entry) => entry.published).map((entry) => ({ id: entry.id, ...entry.published }));
    const dishes = store.listContent("dish").entries.filter((entry) => entry.published).map((entry) => ({ id: entry.id, ...entry.published }));
    const published = store.snapshot().published;
    const heroImage = published.heroImageId ? store.getMedia(published.heroImageId) : null;
    const menus = store.listMenus().map((menu) => ({ id: menu.id, name: menu.name, items: menu.published || [] }));
    const primaryForm = store.listForms()[0] || null;
    const form = primaryForm ? { id: primaryForm.id, name: primaryForm.name, fields: primaryForm.fields } : null;
    const locales = store.listLocales();
    const translations = Object.fromEntries(
      locales.map((locale) => [locale.code, store.snapshotTranslation(locale.code).published])
    );
    const pages = store.listPages()
      .filter((page) => page.published)
      .map((page) => ({ slug: page.slug, title: page.title, kind: page.kind, content: page.published }));
    json(response, 200, { published, rooms, dishes, heroImageUrl: heroImage?.url || null, menus, form, locales, translations, pages });
    return;
  }

  if (url.pathname === "/api/state" && request.method === "GET") {
    const session = requireSession(request, response);
    if (!session) return;
    const locales = store.listLocales();
    const translations = Object.fromEntries(
      locales.map((locale) => [locale.code, store.snapshotTranslation(locale.code)])
    );
    json(response, 200, { ...store.snapshot(), fields: fieldDefinitions, media: store.listMedia(), menus: store.listMenus(), forms: store.listForms(), locales, translations, pages: store.listPages() });
    return;
  }

  if (url.pathname === "/api/locales" && request.method === "GET") {
    const session = requireSession(request, response);
    if (!session) return;
    json(response, 200, store.listLocales());
    return;
  }

  if (url.pathname === "/api/locales" && request.method === "POST") {
    const session = requireSession(request, response);
    if (!session) return;
    if (store.listLocales().length >= MAX_LOCALES) {
      json(response, 400, { error: `You can add at most ${MAX_LOCALES} languages.` });
      return;
    }
    const body = await readJson(request);
    const code = validateLocaleCode(body.code);
    if (!code.ok) return json(response, 400, { error: code.error });
    const name = validateLocaleName(body.name);
    if (!name.ok) return json(response, 400, { error: name.error });
    if (store.getLocale(code.value)) return json(response, 400, { error: "That language has already been added." });
    json(response, 201, store.createLocale(code.value, name.value));
    return;
  }

  const localeDeleteMatch = url.pathname.match(/^\/api\/locales\/([a-z-]+)$/);
  if (localeDeleteMatch && request.method === "DELETE") {
    const session = requireSession(request, response, { admin: true });
    if (!session) return;
    const deleted = store.deleteLocale(localeDeleteMatch[1]);
    json(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: "Language not found." });
    return;
  }

  const translationMatch = url.pathname.match(/^\/api\/translations\/([a-z-]+)(?:\/(publish))?$/);
  if (translationMatch) {
    const locale = translationMatch[1];
    const action = translationMatch[2];
    if (!store.getLocale(locale)) {
      json(response, 404, { error: "That language has not been added to this project." });
      return;
    }
    if (!action && request.method === "GET") {
      const session = requireSession(request, response);
      if (!session) return;
      json(response, 200, store.snapshotTranslation(locale));
      return;
    }
    if (!action && request.method === "PATCH") {
      const session = requireSession(request, response);
      if (!session) return;
      const validation = validateTranslationPatch(await readJson(request));
      if (!validation.ok) {
        json(response, 400, { error: validation.error });
        return;
      }
      json(response, 200, store.updateTranslation(locale, validation.field, validation.value));
      return;
    }
    if (action === "publish" && request.method === "POST") {
      const session = requireSession(request, response, { admin: true });
      if (!session) return;
      json(response, 200, store.publishTranslation(locale));
      return;
    }
  }

  if (url.pathname === "/api/menus" && request.method === "GET") {
    const session = requireSession(request, response);
    if (!session) return;
    json(response, 200, store.listMenus());
    return;
  }

  if (url.pathname === "/api/menus" && request.method === "POST") {
    const session = requireSession(request, response);
    if (!session) return;
    if (store.listMenus().length >= MAX_MENUS) {
      json(response, 400, { error: `You can have at most ${MAX_MENUS} menus.` });
      return;
    }
    const body = await readJson(request);
    const name = validateMenuName(body.name);
    if (!name.ok) {
      json(response, 400, { error: name.error });
      return;
    }
    json(response, 201, store.createMenu(name.value));
    return;
  }

  if (url.pathname === "/api/menus/reorder" && request.method === "POST") {
    const session = requireSession(request, response);
    if (!session) return;
    const body = await readJson(request);
    const validIds = store.listMenus().map((menu) => menu.id);
    const order = validateMenuOrder(body.order, validIds);
    if (!order.ok) {
      json(response, 400, { error: order.error });
      return;
    }
    json(response, 200, store.reorderMenus(order.value));
    return;
  }

  const menuMatch = url.pathname.match(/^\/api\/menus\/(\d+)(?:\/(publish))?$/);
  if (menuMatch) {
    const id = Number(menuMatch[1]);
    const action = menuMatch[2];
    if (!action && request.method === "PATCH") {
      const session = requireSession(request, response);
      if (!session) return;
      const body = await readJson(request);
      const patch = {};
      if (body.name !== undefined) {
        const name = validateMenuName(body.name);
        if (!name.ok) return json(response, 400, { error: name.error });
        patch.name = name.value;
      }
      if (body.items !== undefined) {
        const items = validateMenuItems(body.items);
        if (!items.ok) return json(response, 400, { error: items.error });
        patch.items = items.value;
      }
      const updated = store.updateMenu(id, patch);
      json(response, updated ? 200 : 404, updated || { error: "Menu not found." });
      return;
    }
    if (!action && request.method === "DELETE") {
      const session = requireSession(request, response, { admin: true });
      if (!session) return;
      const deleted = store.deleteMenu(id);
      json(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: "Menu not found." });
      return;
    }
    if (action === "publish" && request.method === "POST") {
      const session = requireSession(request, response, { admin: true });
      if (!session) return;
      const published = store.publishMenu(id);
      json(response, published ? 200 : 404, published || { error: "Menu not found." });
      return;
    }
  }

  if (url.pathname === "/api/media" && request.method === "GET") {
    const session = requireSession(request, response);
    if (!session) return;
    json(response, 200, store.listMedia());
    return;
  }

  if (url.pathname === "/api/media" && request.method === "POST") {
    const session = requireSession(request, response);
    if (!session) return;
    let body;
    try {
      body = await readJson(request, MAX_MEDIA_BODY);
    } catch (error) {
      json(response, error.message === "BODY_TOO_LARGE" ? 413 : 400, { error: error.message === "BODY_TOO_LARGE" ? "Image is too large." : "Invalid request." });
      return;
    }
    const validation = validateMediaUpload(body);
    if (!validation.ok) {
      json(response, 400, { error: validation.error });
      return;
    }
    const id = randomBytes(12).toString("base64url");
    const filename = `${id}.${validation.data.extension}`;
    await writeFile(join(uploadsDir, filename), validation.data.buffer);
    const record = store.createMedia({
      id,
      filename,
      originalName: validation.data.originalName,
      mimeType: validation.data.mimeType,
      size: validation.data.size
    });
    json(response, 201, record);
    return;
  }

  const mediaMatch = url.pathname.match(/^\/api\/media\/([A-Za-z0-9_-]+)$/);
  if (mediaMatch) {
    const id = mediaMatch[1];
    if (request.method === "PATCH") {
      const session = requireSession(request, response);
      if (!session) return;
      const body = await readJson(request);
      const altText = String(body.altText ?? "").slice(0, 200);
      const record = store.updateMediaAlt(id, altText);
      json(response, record ? 200 : 404, record || { error: "Media not found." });
      return;
    }
    if (request.method === "DELETE") {
      const session = requireSession(request, response, { admin: true });
      if (!session) return;
      const record = store.deleteMedia(id);
      if (!record) {
        json(response, 404, { error: "Media not found." });
        return;
      }
      try { await unlink(join(uploadsDir, record.filename)); } catch {}
      json(response, 200, { ok: true });
      return;
    }
  }

  if (url.pathname === "/api/content" && request.method === "GET") {
    const session = requireSession(request, response);
    if (!session) return;
    json(response, 200, store.listContent(url.searchParams.get("type") || undefined));
    return;
  }

  if (url.pathname === "/api/entries" && request.method === "POST") {
    const session = requireSession(request, response);
    if (!session) return;
    const body = await readJson(request);
    const validation = validateEntry(body.typeId, body.data);
    if (!validation.ok) return json(response, 400, { error: validation.error });
    json(response, 201, store.createEntry(body.typeId, validation.data));
    return;
  }

  const entryMatch = url.pathname.match(/^\/api\/entries\/(\d+)(?:\/(duplicate|publish))?$/);
  if (entryMatch) {
    const id = Number(entryMatch[1]);
    const action = entryMatch[2];
    if (!action && request.method === "PATCH") {
      const session = requireSession(request, response);
      if (!session) return;
      const current = store.listContent().entries.find((entry) => entry.id === id);
      if (!current) return json(response, 404, { error: "Entry not found." });
      const validation = validateEntry(current.typeId, (await readJson(request)).data);
      if (!validation.ok) return json(response, 400, { error: validation.error });
      json(response, 200, store.updateEntry(id, validation.data));
      return;
    }
    if (action === "duplicate" && request.method === "POST") {
      const session = requireSession(request, response);
      if (!session) return;
      const entry = store.duplicateEntry(id);
      json(response, entry ? 201 : 404, entry || { error: "Entry not found." });
      return;
    }
    if (action === "publish" && request.method === "POST") {
      const session = requireSession(request, response, { admin: true });
      if (!session) return;
      const entry = store.publishEntry(id);
      json(response, entry ? 200 : 404, entry || { error: "Entry not found." });
      return;
    }
  }

  if (url.pathname === "/api/draft" && request.method === "PATCH") {
    const session = requireSession(request, response);
    if (!session) return;
    const validation = validatePatch(await readJson(request));
    if (!validation.ok) {
      json(response, 400, { error: validation.error });
      return;
    }
    json(response, 200, store.update(validation.field, validation.value));
    return;
  }

  if (url.pathname === "/api/publish" && request.method === "POST") {
    const session = requireSession(request, response, { admin: true });
    if (!session) return;
    json(response, 200, store.publish());
    return;
  }

  if (url.pathname === "/api/restore" && request.method === "POST") {
    const session = requireSession(request, response, { admin: true });
    if (!session) return;
    const { revisionId } = await readJson(request);
    const state = Number.isInteger(revisionId) ? store.restore(revisionId) : null;
    if (!state) {
      json(response, 404, { error: "Revision not found." });
      return;
    }
    json(response, 200, state);
    return;
  }

  if (url.pathname === "/api/forms" && request.method === "GET") {
    const session = requireSession(request, response);
    if (!session) return;
    json(response, 200, store.listForms());
    return;
  }

  if (url.pathname === "/api/forms" && request.method === "POST") {
    const session = requireSession(request, response);
    if (!session) return;
    if (store.listForms().length >= MAX_FORMS) {
      json(response, 400, { error: `You can have at most ${MAX_FORMS} forms.` });
      return;
    }
    const body = await readJson(request);
    const name = validateFormName(body.name);
    if (!name.ok) {
      json(response, 400, { error: name.error });
      return;
    }
    json(response, 201, store.createForm(name.value));
    return;
  }

  const formSubmitMatch = url.pathname.match(/^\/api\/forms\/(\d+)\/submit$/);
  if (formSubmitMatch && request.method === "POST") {
    const id = Number(formSubmitMatch[1]);
    const form = store.getForm(id);
    if (!form) {
      json(response, 404, { error: "Form not found." });
      return;
    }
    const body = await readJson(request);
    const validation = validateSubmission(form.fields, body);
    if (!validation.ok) {
      json(response, 400, { error: validation.error });
      return;
    }
    store.createSubmission(id, validation.value);
    json(response, 201, { ok: true });
    return;
  }

  const formSubmissionsMatch = url.pathname.match(/^\/api\/forms\/(\d+)\/submissions(\.csv)?$/);
  if (formSubmissionsMatch && request.method === "GET") {
    const session = requireSession(request, response);
    if (!session) return;
    const id = Number(formSubmissionsMatch[1]);
    const form = store.getForm(id);
    if (!form) {
      json(response, 404, { error: "Form not found." });
      return;
    }
    const submissions = store.listSubmissions(id);
    if (formSubmissionsMatch[2]) {
      const columns = form.fields.map((field) => field.id);
      const header = ["Submitted at", ...form.fields.map((field) => field.label)];
      const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
      const rows = [header, ...submissions.map((entry) => [entry.createdAt, ...columns.map((id) => entry.data[id])])];
      const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
      response.writeHead(200, {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${form.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "form"}-submissions.csv"`,
        "cache-control": "no-store",
        "x-content-type-options": "nosniff"
      });
      response.end(csv);
      return;
    }
    json(response, 200, submissions);
    return;
  }

  const formMatch = url.pathname.match(/^\/api\/forms\/(\d+)$/);
  if (formMatch) {
    const id = Number(formMatch[1]);
    if (request.method === "PATCH") {
      const session = requireSession(request, response);
      if (!session) return;
      const body = await readJson(request);
      const patch = {};
      if (body.name !== undefined) {
        const name = validateFormName(body.name);
        if (!name.ok) return json(response, 400, { error: name.error });
        patch.name = name.value;
      }
      if (body.fields !== undefined) {
        const fields = validateFormFields(body.fields);
        if (!fields.ok) return json(response, 400, { error: fields.error });
        patch.fields = fields.value;
      }
      const updated = store.updateForm(id, patch);
      json(response, updated ? 200 : 404, updated || { error: "Form not found." });
      return;
    }
    if (request.method === "DELETE") {
      const session = requireSession(request, response, { admin: true });
      if (!session) return;
      const deleted = store.deleteForm(id);
      json(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: "Form not found." });
      return;
    }
  }

  if (url.pathname === "/api/pages" && request.method === "GET") {
    const session = requireSession(request, response);
    if (!session) return;
    json(response, 200, store.listPages());
    return;
  }

  if (url.pathname === "/api/pages" && request.method === "POST") {
    const session = requireSession(request, response);
    if (!session) return;
    if (store.listPages().length >= MAX_PAGES) {
      json(response, 400, { error: `You can have at most ${MAX_PAGES} pages.` });
      return;
    }
    const body = await readJson(request);
    const slug = validatePageSlug(body.slug);
    if (!slug.ok) return json(response, 400, { error: slug.error });
    const title = validatePageTitle(body.title);
    if (!title.ok) return json(response, 400, { error: title.error });
    const kind = validatePageKind(body.kind || "content");
    if (!kind.ok) return json(response, 400, { error: kind.error });
    if (store.getPageBySlug(slug.value)) return json(response, 400, { error: "That path is already used by another page." });
    const content = validatePageContent({ heading: title.value, intro: "", body: "", seoTitle: "", seoDescription: "" });
    json(response, 201, store.createPage(slug.value, title.value, kind.value, content.value));
    return;
  }

  const pageMatch = url.pathname.match(/^\/api\/pages\/(\d+)(?:\/(publish))?$/);
  if (pageMatch) {
    const id = Number(pageMatch[1]);
    const action = pageMatch[2];
    if (!action && request.method === "PATCH") {
      const session = requireSession(request, response);
      if (!session) return;
      const body = await readJson(request);
      const patch = {};
      if (body.title !== undefined) {
        const title = validatePageTitle(body.title);
        if (!title.ok) return json(response, 400, { error: title.error });
        patch.title = title.value;
      }
      if (body.content !== undefined) {
        const content = validatePageContent(body.content);
        if (!content.ok) return json(response, 400, { error: content.error });
        patch.content = content.value;
      }
      const updated = store.updatePage(id, patch);
      json(response, updated ? 200 : 404, updated || { error: "Page not found." });
      return;
    }
    if (!action && request.method === "DELETE") {
      const session = requireSession(request, response, { admin: true });
      if (!session) return;
      const deleted = store.deletePage(id);
      json(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: "Page not found." });
      return;
    }
    if (action === "publish" && request.method === "POST") {
      const session = requireSession(request, response, { admin: true });
      if (!session) return;
      const published = store.publishPage(id);
      json(response, published ? 200 : 404, published || { error: "Page not found." });
      return;
    }
  }

  json(response, 404, { error: "Not found." });
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml"
};

const imageTypes = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif"
};

async function uploadedFile(response, pathname) {
  const requested = pathname.replace(/^\/uploads\//, "");
  const safe = normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const path = join(uploadsDir, safe);
  const contentType = imageTypes[extname(path).toLowerCase()];
  if (!contentType || !path.startsWith(uploadsDir)) {
    json(response, 404, { error: "Not found." });
    return;
  }
  try {
    const body = await readFile(path);
    response.writeHead(200, {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff"
    });
    response.end(body);
  } catch {
    json(response, 404, { error: "Not found." });
  }
}

async function staticFile(response, pathname) {
  // No file extension and not a known static asset: treat as a client-side page
  // route (e.g. /about, /rooms) and let the SPA shell resolve it from /api/public.
  const requested = pathname === "/" || !extname(pathname) ? "index.html" : pathname.slice(1);
  const safe = normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const path = join(publicRoot, safe);
  if (!path.startsWith(publicRoot)) {
    json(response, 404, { error: "Not found." });
    return;
  }
  try {
    const body = await readFile(path);
    response.writeHead(200, {
      "content-type": types[extname(path)] || "application/octet-stream",
      "cache-control": "no-store",
      "content-security-policy": "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY"
    });
    response.end(body);
  } catch {
    json(response, 404, { error: "Not found." });
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);

  try {
    if (url.pathname.startsWith("/api/")) await api(request, response, url);
    else if (url.pathname.startsWith("/uploads/")) await uploadedFile(response, url.pathname);
    else await staticFile(response, url.pathname);
  } catch (error) {
    const status = error.message === "BODY_TOO_LARGE" ? 413 : 400;
    json(response, status, { error: status === 413 ? "Request is too large." : "Invalid request." });
  }
});

server.listen(port, host, () => {
  console.log(`Pagecraft demo: http://${host}:${port}`);
  console.log("Demo accounts: thomgriggs@gmail.com/admin-demo and editor/editor-demo (override with PAGECRAFT_ADMIN_PASSWORD / PAGECRAFT_EDITOR_PASSWORD)");
});
