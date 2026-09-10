import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import {
  fieldDefinitions, validatePatch, validateMediaUpload, validateMenuName, validateMenuItems,
  validateMenuOrder, MAX_MENUS, validateFormName, validateFormFields, validateSubmission, MAX_FORMS,
  validateTranslationPatch, validateLocaleCode, validateLocaleName, MAX_LOCALES, translatableFields,
  validatePageSlug, validatePageTitle, validatePageKind, validatePageContent, MAX_PAGES,
  validatePageTranslationPatch, pageTranslatableFields
} from "../src/content.js";
import { contentTypes, validateEntry } from "../src/models.js";
import { createStore } from "./store.js";

const PREFIX = "/pagecraft";
const MAX_BODY = 16 * 1024;
const MAX_MEDIA_BODY = 7 * 1024 * 1024;
const emptyTranslation = Object.fromEntries(translatableFields.map((field) => [field, ""]));
const emptyPageTranslation = Object.fromEntries(pageTranslatableFields.map((field) => [field, ""]));

function getUsers(env) {
  return {
    "thomgriggs@gmail.com": { role: "admin", passwordHash: hash(env.ADMIN_PASSWORD || "admin-demo") },
    editor: { role: "editor", passwordHash: hash(env.EDITOR_PASSWORD || "editor-demo") }
  };
}

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

function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders
    }
  });
}

async function readJson(request, maxBytes = MAX_BODY) {
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) throw new Error("BODY_TOO_LARGE");
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new Error("INVALID_JSON");
  }
}

async function requireSession(request, store, { admin = false } = {}) {
  const sessionId = parseCookies(request.headers.get("cookie") || "").pagecraft_session;
  const session = sessionId ? await store.getSession(sessionId) : null;
  if (!session) return { error: json(401, { error: "Sign in required." }) };
  if (admin && session.role !== "admin") return { error: json(403, { error: "Administrator access required." }) };
  if (request.method !== "GET" && request.headers.get("x-csrf-token") !== session.csrf) {
    return { error: json(403, { error: "Invalid request token." }) };
  }
  return { session };
}

async function handleApi(request, env, pathname, url) {
  const store = createStore(env.DB);
  const method = request.method;

  if (pathname === "/api/login" && method === "POST") {
    const body = await readJson(request);
    const user = getUsers(env)[body.username];
    if (!user || typeof body.password !== "string" || !equalSecret(body.password, user.passwordHash)) {
      return json(401, { error: "Invalid credentials." });
    }
    const id = randomBytes(24).toString("base64url");
    const csrf = randomBytes(24).toString("base64url");
    await store.createSession(id, body.username, user.role, csrf);
    return json(200, { username: body.username, role: user.role, csrf }, {
      "set-cookie": `pagecraft_session=${id}; HttpOnly; SameSite=Strict; Path=${PREFIX}; Max-Age=14400`
    });
  }

  if (pathname === "/api/logout" && method === "POST") {
    const sessionId = parseCookies(request.headers.get("cookie") || "").pagecraft_session;
    if (sessionId) await store.deleteSession(sessionId);
    return json(200, { ok: true }, {
      "set-cookie": `pagecraft_session=; HttpOnly; SameSite=Strict; Path=${PREFIX}; Max-Age=0`
    });
  }

  if (pathname === "/api/session" && method === "GET") {
    const sessionId = parseCookies(request.headers.get("cookie") || "").pagecraft_session;
    const session = sessionId ? await store.getSession(sessionId) : null;
    return json(200, session ? { authenticated: true, ...session } : { authenticated: false });
  }

  if (pathname === "/api/public" && method === "GET") {
    const [snapshot, roomEntries, dishEntries, allMenus, allForms, allLocales, allPages] = await Promise.all([
      store.snapshot(), store.listContent(contentTypes, "room"), store.listContent(contentTypes, "dish"),
      store.listMenus(), store.listForms(), store.listLocales(), store.listPages()
    ]);
    const rooms = roomEntries.entries.filter((entry) => entry.published).map((entry) => ({ id: entry.id, ...entry.published }));
    const dishes = dishEntries.entries.filter((entry) => entry.published).map((entry) => ({ id: entry.id, ...entry.published }));
    const published = snapshot.published;
    const heroImage = published.heroImageId ? await store.getMedia(published.heroImageId) : null;
    const menus = allMenus.map((menu) => ({ id: menu.id, name: menu.name, items: menu.published || [] }));
    const primaryForm = allForms[0] || null;
    const form = primaryForm ? { id: primaryForm.id, name: primaryForm.name, fields: primaryForm.fields } : null;
    const translations = Object.fromEntries(
      await Promise.all(allLocales.map(async (locale) => [locale.code, (await store.snapshotTranslation(locale.code, emptyTranslation)).published]))
    );
    const pages = await Promise.all(
      allPages.filter((page) => page.published).map(async (page) => ({
        slug: page.slug,
        title: page.title,
        kind: page.kind,
        content: page.published,
        translations: Object.fromEntries(
          await Promise.all(allLocales.map(async (locale) => [locale.code, (await store.snapshotPageTranslation(page.id, locale.code, emptyPageTranslation)).published]))
        )
      }))
    );
    return json(200, { published, rooms, dishes, heroImageUrl: heroImage?.url || null, menus, form, locales: allLocales, translations, pages });
  }

  if (pathname === "/api/state" && method === "GET") {
    const { session, error } = await requireSession(request, store);
    if (error) return error;
    const [snapshot, media, menus, forms, locales, pages] = await Promise.all([
      store.snapshot(), store.listMedia(), store.listMenus(), store.listForms(), store.listLocales(), store.listPages()
    ]);
    const translations = Object.fromEntries(
      await Promise.all(locales.map(async (locale) => [locale.code, await store.snapshotTranslation(locale.code, emptyTranslation)]))
    );
    return json(200, { ...snapshot, fields: fieldDefinitions, media, menus, forms, locales, translations, pages });
  }

  if (pathname === "/api/content" && method === "GET") {
    const { error } = await requireSession(request, store);
    if (error) return error;
    return json(200, await store.listContent(contentTypes, url.searchParams.get("type") || undefined));
  }

  if (pathname === "/api/entries" && method === "POST") {
    const { error } = await requireSession(request, store);
    if (error) return error;
    const body = await readJson(request);
    const validation = validateEntry(body.typeId, body.data);
    if (!validation.ok) return json(400, { error: validation.error });
    return json(201, await store.createEntry(body.typeId, validation.data));
  }

  const entryMatch = pathname.match(/^\/api\/entries\/(\d+)(?:\/(duplicate|publish))?$/);
  if (entryMatch) {
    const id = Number(entryMatch[1]);
    const action = entryMatch[2];
    if (!action && method === "PATCH") {
      const { error } = await requireSession(request, store);
      if (error) return error;
      const current = (await store.listContent(contentTypes)).entries.find((entry) => entry.id === id);
      if (!current) return json(404, { error: "Entry not found." });
      const validation = validateEntry(current.typeId, (await readJson(request)).data);
      if (!validation.ok) return json(400, { error: validation.error });
      return json(200, await store.updateEntry(id, validation.data));
    }
    if (action === "duplicate" && method === "POST") {
      const { error } = await requireSession(request, store);
      if (error) return error;
      const entry = await store.duplicateEntry(id, contentTypes);
      return json(entry ? 201 : 404, entry || { error: "Entry not found." });
    }
    if (action === "publish" && method === "POST") {
      const { error } = await requireSession(request, store, { admin: true });
      if (error) return error;
      const entry = await store.publishEntry(id);
      return json(entry ? 200 : 404, entry || { error: "Entry not found." });
    }
  }

  if (pathname === "/api/draft" && method === "PATCH") {
    const { error } = await requireSession(request, store);
    if (error) return error;
    const validation = validatePatch(await readJson(request));
    if (!validation.ok) return json(400, { error: validation.error });
    return json(200, await store.update(validation.field, validation.value));
  }

  if (pathname === "/api/publish" && method === "POST") {
    const { error } = await requireSession(request, store, { admin: true });
    if (error) return error;
    return json(200, await store.publish());
  }

  if (pathname === "/api/restore" && method === "POST") {
    const { error } = await requireSession(request, store, { admin: true });
    if (error) return error;
    const { revisionId } = await readJson(request);
    const state = Number.isInteger(revisionId) ? await store.restore(revisionId) : null;
    return json(state ? 200 : 404, state || { error: "Revision not found." });
  }

  if (pathname === "/api/media" && method === "GET") {
    const { error } = await requireSession(request, store);
    if (error) return error;
    return json(200, await store.listMedia());
  }

  if (pathname === "/api/media" && method === "POST") {
    const { error } = await requireSession(request, store);
    if (error) return error;
    let body;
    try {
      body = await readJson(request, MAX_MEDIA_BODY);
    } catch (err) {
      return json(err.message === "BODY_TOO_LARGE" ? 413 : 400, { error: err.message === "BODY_TOO_LARGE" ? "Image is too large." : "Invalid request." });
    }
    const validation = validateMediaUpload(body);
    if (!validation.ok) return json(400, { error: validation.error });
    if (!env.MEDIA_KV) return json(503, { error: "Media storage is not configured yet." });
    const id = randomBytes(12).toString("base64url");
    const filename = `${id}.${validation.data.extension}`;
    await env.MEDIA_KV.put(filename, validation.data.buffer, { metadata: { contentType: validation.data.mimeType } });
    const record = await store.createMedia({
      id, filename, originalName: validation.data.originalName, mimeType: validation.data.mimeType, size: validation.data.size
    });
    return json(201, record);
  }

  const mediaMatch = pathname.match(/^\/api\/media\/([A-Za-z0-9_-]+)$/);
  if (mediaMatch) {
    const id = mediaMatch[1];
    if (method === "PATCH") {
      const { error } = await requireSession(request, store);
      if (error) return error;
      const body = await readJson(request);
      const altText = String(body.altText ?? "").slice(0, 200);
      const record = await store.updateMediaAlt(id, altText);
      return json(record ? 200 : 404, record || { error: "Media not found." });
    }
    if (method === "DELETE") {
      const { error } = await requireSession(request, store, { admin: true });
      if (error) return error;
      const record = await store.deleteMedia(id);
      if (!record) return json(404, { error: "Media not found." });
      if (env.MEDIA_KV) await env.MEDIA_KV.delete(record.filename).catch(() => {});
      return json(200, { ok: true });
    }
  }

  if (pathname === "/api/menus" && method === "GET") {
    const { error } = await requireSession(request, store);
    if (error) return error;
    return json(200, await store.listMenus());
  }

  if (pathname === "/api/menus" && method === "POST") {
    const { error } = await requireSession(request, store);
    if (error) return error;
    if ((await store.listMenus()).length >= MAX_MENUS) return json(400, { error: `You can have at most ${MAX_MENUS} menus.` });
    const body = await readJson(request);
    const name = validateMenuName(body.name);
    if (!name.ok) return json(400, { error: name.error });
    return json(201, await store.createMenu(name.value));
  }

  if (pathname === "/api/menus/reorder" && method === "POST") {
    const { error } = await requireSession(request, store);
    if (error) return error;
    const body = await readJson(request);
    const validIds = (await store.listMenus()).map((menu) => menu.id);
    const order = validateMenuOrder(body.order, validIds);
    if (!order.ok) return json(400, { error: order.error });
    return json(200, await store.reorderMenus(order.value));
  }

  const menuMatch = pathname.match(/^\/api\/menus\/(\d+)(?:\/(publish))?$/);
  if (menuMatch) {
    const id = Number(menuMatch[1]);
    const action = menuMatch[2];
    if (!action && method === "PATCH") {
      const { error } = await requireSession(request, store);
      if (error) return error;
      const body = await readJson(request);
      const patch = {};
      if (body.name !== undefined) {
        const name = validateMenuName(body.name);
        if (!name.ok) return json(400, { error: name.error });
        patch.name = name.value;
      }
      if (body.items !== undefined) {
        const items = validateMenuItems(body.items);
        if (!items.ok) return json(400, { error: items.error });
        patch.items = items.value;
      }
      const updated = await store.updateMenu(id, patch);
      return json(updated ? 200 : 404, updated || { error: "Menu not found." });
    }
    if (!action && method === "DELETE") {
      const { error } = await requireSession(request, store, { admin: true });
      if (error) return error;
      const deleted = await store.deleteMenu(id);
      return json(deleted ? 200 : 404, deleted ? { ok: true } : { error: "Menu not found." });
    }
    if (action === "publish" && method === "POST") {
      const { error } = await requireSession(request, store, { admin: true });
      if (error) return error;
      const published = await store.publishMenu(id);
      return json(published ? 200 : 404, published || { error: "Menu not found." });
    }
  }

  if (pathname === "/api/forms" && method === "GET") {
    const { error } = await requireSession(request, store);
    if (error) return error;
    return json(200, await store.listForms());
  }

  if (pathname === "/api/forms" && method === "POST") {
    const { error } = await requireSession(request, store);
    if (error) return error;
    if ((await store.listForms()).length >= MAX_FORMS) return json(400, { error: `You can have at most ${MAX_FORMS} forms.` });
    const body = await readJson(request);
    const name = validateFormName(body.name);
    if (!name.ok) return json(400, { error: name.error });
    return json(201, await store.createForm(name.value));
  }

  const formSubmitMatch = pathname.match(/^\/api\/forms\/(\d+)\/submit$/);
  if (formSubmitMatch && method === "POST") {
    const id = Number(formSubmitMatch[1]);
    const form = await store.getForm(id);
    if (!form) return json(404, { error: "Form not found." });
    const body = await readJson(request);
    const validation = validateSubmission(form.fields, body);
    if (!validation.ok) return json(400, { error: validation.error });
    await store.createSubmission(id, validation.value);
    return json(201, { ok: true });
  }

  const formSubmissionsMatch = pathname.match(/^\/api\/forms\/(\d+)\/submissions(\.csv)?$/);
  if (formSubmissionsMatch && method === "GET") {
    const { error } = await requireSession(request, store);
    if (error) return error;
    const id = Number(formSubmissionsMatch[1]);
    const form = await store.getForm(id);
    if (!form) return json(404, { error: "Form not found." });
    const submissions = await store.listSubmissions(id);
    if (formSubmissionsMatch[2]) {
      const columns = form.fields.map((field) => field.id);
      const header = ["Submitted at", ...form.fields.map((field) => field.label)];
      const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
      const rows = [header, ...submissions.map((entry) => [entry.createdAt, ...columns.map((colId) => entry.data[colId])])];
      const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
      return new Response(csv, {
        status: 200,
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="${form.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "form"}-submissions.csv"`,
          "cache-control": "no-store",
          "x-content-type-options": "nosniff"
        }
      });
    }
    return json(200, submissions);
  }

  const formMatch = pathname.match(/^\/api\/forms\/(\d+)$/);
  if (formMatch) {
    const id = Number(formMatch[1]);
    if (method === "PATCH") {
      const { error } = await requireSession(request, store);
      if (error) return error;
      const body = await readJson(request);
      const patch = {};
      if (body.name !== undefined) {
        const name = validateFormName(body.name);
        if (!name.ok) return json(400, { error: name.error });
        patch.name = name.value;
      }
      if (body.fields !== undefined) {
        const fields = validateFormFields(body.fields);
        if (!fields.ok) return json(400, { error: fields.error });
        patch.fields = fields.value;
      }
      const updated = await store.updateForm(id, patch);
      return json(updated ? 200 : 404, updated || { error: "Form not found." });
    }
    if (method === "DELETE") {
      const { error } = await requireSession(request, store, { admin: true });
      if (error) return error;
      const deleted = await store.deleteForm(id);
      return json(deleted ? 200 : 404, deleted ? { ok: true } : { error: "Form not found." });
    }
  }

  if (pathname === "/api/locales" && method === "GET") {
    const { error } = await requireSession(request, store);
    if (error) return error;
    return json(200, await store.listLocales());
  }

  if (pathname === "/api/locales" && method === "POST") {
    const { error } = await requireSession(request, store);
    if (error) return error;
    if ((await store.listLocales()).length >= MAX_LOCALES) return json(400, { error: `You can add at most ${MAX_LOCALES} languages.` });
    const body = await readJson(request);
    const code = validateLocaleCode(body.code);
    if (!code.ok) return json(400, { error: code.error });
    const name = validateLocaleName(body.name);
    if (!name.ok) return json(400, { error: name.error });
    if (await store.getLocale(code.value)) return json(400, { error: "That language has already been added." });
    return json(201, await store.createLocale(code.value, name.value));
  }

  const localeDeleteMatch = pathname.match(/^\/api\/locales\/([a-z-]+)$/);
  if (localeDeleteMatch && method === "DELETE") {
    const { error } = await requireSession(request, store, { admin: true });
    if (error) return error;
    const deleted = await store.deleteLocale(localeDeleteMatch[1]);
    return json(deleted ? 200 : 404, deleted ? { ok: true } : { error: "Language not found." });
  }

  const translationMatch = pathname.match(/^\/api\/translations\/([a-z-]+)(?:\/(publish))?$/);
  if (translationMatch) {
    const locale = translationMatch[1];
    const action = translationMatch[2];
    if (!(await store.getLocale(locale))) return json(404, { error: "That language has not been added to this project." });
    if (!action && method === "GET") {
      const { error } = await requireSession(request, store);
      if (error) return error;
      return json(200, await store.snapshotTranslation(locale, emptyTranslation));
    }
    if (!action && method === "PATCH") {
      const { error } = await requireSession(request, store);
      if (error) return error;
      const validation = validateTranslationPatch(await readJson(request));
      if (!validation.ok) return json(400, { error: validation.error });
      return json(200, await store.updateTranslation(locale, validation.field, validation.value, emptyTranslation));
    }
    if (action === "publish" && method === "POST") {
      const { error } = await requireSession(request, store, { admin: true });
      if (error) return error;
      return json(200, await store.publishTranslation(locale, emptyTranslation));
    }
  }

  if (pathname === "/api/pages" && method === "GET") {
    const { error } = await requireSession(request, store);
    if (error) return error;
    return json(200, await store.listPages());
  }

  if (pathname === "/api/pages" && method === "POST") {
    const { error } = await requireSession(request, store);
    if (error) return error;
    if ((await store.listPages()).length >= MAX_PAGES) return json(400, { error: `You can have at most ${MAX_PAGES} pages.` });
    const body = await readJson(request);
    const slug = validatePageSlug(body.slug);
    if (!slug.ok) return json(400, { error: slug.error });
    const title = validatePageTitle(body.title);
    if (!title.ok) return json(400, { error: title.error });
    const kind = validatePageKind(body.kind || "content");
    if (!kind.ok) return json(400, { error: kind.error });
    if (await store.getPageBySlug(slug.value)) return json(400, { error: "That path is already used by another page." });
    const content = validatePageContent({ heading: title.value, intro: "", body: "", seoTitle: "", seoDescription: "" });
    return json(201, await store.createPage(slug.value, title.value, kind.value, content.value));
  }

  const pageMatch = pathname.match(/^\/api\/pages\/(\d+)(?:\/(publish))?$/);
  if (pageMatch) {
    const id = Number(pageMatch[1]);
    const action = pageMatch[2];
    if (!action && method === "PATCH") {
      const { error } = await requireSession(request, store);
      if (error) return error;
      const body = await readJson(request);
      const patch = {};
      if (body.title !== undefined) {
        const title = validatePageTitle(body.title);
        if (!title.ok) return json(400, { error: title.error });
        patch.title = title.value;
      }
      if (body.content !== undefined) {
        const content = validatePageContent(body.content);
        if (!content.ok) return json(400, { error: content.error });
        patch.content = content.value;
      }
      const updated = await store.updatePage(id, patch);
      return json(updated ? 200 : 404, updated || { error: "Page not found." });
    }
    if (!action && method === "DELETE") {
      const { error } = await requireSession(request, store, { admin: true });
      if (error) return error;
      const deleted = await store.deletePage(id);
      return json(deleted ? 200 : 404, deleted ? { ok: true } : { error: "Page not found." });
    }
    if (action === "publish" && method === "POST") {
      const { error } = await requireSession(request, store, { admin: true });
      if (error) return error;
      const published = await store.publishPage(id);
      return json(published ? 200 : 404, published || { error: "Page not found." });
    }
  }

  const pageTranslationMatch = pathname.match(/^\/api\/pages\/(\d+)\/translations\/([a-z-]+)(?:\/(publish))?$/);
  if (pageTranslationMatch) {
    const pageId = Number(pageTranslationMatch[1]);
    const locale = pageTranslationMatch[2];
    const action = pageTranslationMatch[3];
    if (!(await store.getPage(pageId))) return json(404, { error: "Page not found." });
    if (!(await store.getLocale(locale))) return json(404, { error: "That language has not been added to this project." });
    if (!action && method === "GET") {
      const { error } = await requireSession(request, store);
      if (error) return error;
      return json(200, await store.snapshotPageTranslation(pageId, locale, emptyPageTranslation));
    }
    if (!action && method === "PATCH") {
      const { error } = await requireSession(request, store);
      if (error) return error;
      const validation = validatePageTranslationPatch(await readJson(request));
      if (!validation.ok) return json(400, { error: validation.error });
      return json(200, await store.updatePageTranslation(pageId, locale, validation.field, validation.value, emptyPageTranslation));
    }
    if (action === "publish" && method === "POST") {
      const { error } = await requireSession(request, store, { admin: true });
      if (error) return error;
      return json(200, await store.publishPageTranslation(pageId, locale, emptyPageTranslation));
    }
  }

  return json(404, { error: "Not found." });
}

const uploadContentTypes = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif"
};

async function handleUpload(request, env, pathname) {
  if (!env.MEDIA_KV) return json(404, { error: "Not found." });
  const filename = pathname.replace(/^\/uploads\//, "");
  const extension = filename.split(".").pop()?.toLowerCase();
  const contentType = uploadContentTypes[extension];
  if (!contentType || filename.includes("/") || filename.includes("..")) return json(404, { error: "Not found." });
  const object = await env.MEDIA_KV.get(filename, { type: "arrayBuffer" });
  if (!object) return json(404, { error: "Not found." });
  return new Response(object, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === PREFIX) {
      return Response.redirect(`${url.origin}${PREFIX}/${url.search}`, 301);
    }
    let pathname = url.pathname;
    if (pathname.startsWith(PREFIX + "/")) pathname = pathname.slice(PREFIX.length);

    try {
      if (pathname.startsWith("/api/")) return await handleApi(request, env, pathname, url);
      if (pathname.startsWith("/uploads/")) return await handleUpload(request, env, pathname);

      // No file extension: treat as a client-side page route (e.g. /about, /rooms)
      // and serve the SPA shell, which resolves the route from /api/public.
      const hasExtension = /\.[a-z0-9]+$/i.test(pathname);
      const assetUrl = new URL(hasExtension ? pathname : "/", url.origin);
      const assetResponse = await env.ASSETS.fetch(new Request(assetUrl, request));
      const headers = new Headers(assetResponse.headers);
      headers.set("cache-control", "no-store");
      headers.set("content-security-policy", "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
      headers.set("referrer-policy", "no-referrer");
      headers.set("x-content-type-options", "nosniff");
      headers.set("x-frame-options", "DENY");
      return new Response(assetResponse.body, { status: assetResponse.status, headers });
    } catch (error) {
      const status = error.message === "BODY_TOO_LARGE" ? 413 : 400;
      return json(status, { error: status === 413 ? "Request is too large." : "Invalid request." });
    }
  }
};
