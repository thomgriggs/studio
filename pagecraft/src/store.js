import { DatabaseSync } from "node:sqlite";
import { seedContent, translatableFields } from "./content.js";
import { contentTypes, seedEntries } from "./models.js";

const emptyTranslation = Object.freeze(Object.fromEntries(translatableFields.map((field) => [field, ""])));

function parseContent(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? { ...fallback, ...parsed } : { ...fallback };
  } catch {
    return { ...fallback };
  }
}

function parseMenuItems(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseSubmissionData(value) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function createStore({ path = ":memory:", now = () => new Date().toISOString() } = {}) {
  const database = new DatabaseSync(path);
  database.exec("PRAGMA foreign_keys = ON");
  if (path !== ":memory:") {
    database.exec("PRAGMA journal_mode = WAL");
    database.exec("PRAGMA synchronous = NORMAL");
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS site_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    ) STRICT;

    CREATE TABLE IF NOT EXISTS revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      content_json TEXT NOT NULL
    ) STRICT;

    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type_id TEXT NOT NULL,
      draft_json TEXT NOT NULL,
      published_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    ) STRICT;

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      alt_text TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    ) STRICT;

    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position INTEGER NOT NULL,
      draft_json TEXT NOT NULL,
      published_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    ) STRICT;

    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position INTEGER NOT NULL,
      fields_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    ) STRICT;

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    ) STRICT;

    CREATE TABLE IF NOT EXISTS locales (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      position INTEGER NOT NULL,
      created_at TEXT NOT NULL
    ) STRICT;
  `);

  const getStateStatement = database.prepare("SELECT value FROM site_state WHERE key = ?");
  const setStateStatement = database.prepare(`
    INSERT INTO site_state (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);
  const historyStatement = database.prepare("SELECT id, created_at FROM revisions ORDER BY id DESC");
  const revisionStatement = database.prepare("SELECT content_json FROM revisions WHERE id = ?");
  const insertRevisionStatement = database.prepare("INSERT INTO revisions (created_at, content_json) VALUES (?, ?)");
  const revisionCountStatement = database.prepare("SELECT COUNT(*) AS count FROM revisions");
  const entryCountStatement = database.prepare("SELECT COUNT(*) AS count FROM entries");
  const entriesStatement = database.prepare("SELECT * FROM entries ORDER BY updated_at DESC, id DESC");
  const entriesByTypeStatement = database.prepare("SELECT * FROM entries WHERE type_id = ? ORDER BY updated_at DESC, id DESC");
  const entryStatement = database.prepare("SELECT * FROM entries WHERE id = ?");
  const insertEntryStatement = database.prepare("INSERT INTO entries (type_id, draft_json, published_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)");
  const updateEntryStatement = database.prepare("UPDATE entries SET draft_json = ?, updated_at = ? WHERE id = ?");
  const publishEntryStatement = database.prepare("UPDATE entries SET published_json = draft_json, updated_at = ? WHERE id = ?");
  const mediaListStatement = database.prepare("SELECT * FROM media ORDER BY created_at DESC");
  const mediaGetStatement = database.prepare("SELECT * FROM media WHERE id = ?");
  const mediaInsertStatement = database.prepare("INSERT INTO media (id, filename, original_name, mime_type, size, alt_text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const mediaUpdateAltStatement = database.prepare("UPDATE media SET alt_text = ? WHERE id = ?");
  const mediaDeleteStatement = database.prepare("DELETE FROM media WHERE id = ?");
  const menuListStatement = database.prepare("SELECT * FROM menus ORDER BY position ASC, id ASC");
  const menuGetStatement = database.prepare("SELECT * FROM menus WHERE id = ?");
  const menuCountStatement = database.prepare("SELECT COUNT(*) AS count FROM menus");
  const menuMaxPositionStatement = database.prepare("SELECT COALESCE(MAX(position), -1) AS maxPosition FROM menus");
  const menuInsertStatement = database.prepare("INSERT INTO menus (name, position, draft_json, published_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
  const menuUpdateStatement = database.prepare("UPDATE menus SET name = ?, draft_json = ?, updated_at = ? WHERE id = ?");
  const menuPublishStatement = database.prepare("UPDATE menus SET published_json = draft_json, updated_at = ? WHERE id = ?");
  const menuPositionStatement = database.prepare("UPDATE menus SET position = ? WHERE id = ?");
  const menuDeleteStatement = database.prepare("DELETE FROM menus WHERE id = ?");
  const formListStatement = database.prepare("SELECT * FROM forms ORDER BY position ASC, id ASC");
  const formGetStatement = database.prepare("SELECT * FROM forms WHERE id = ?");
  const formCountStatement = database.prepare("SELECT COUNT(*) AS count FROM forms");
  const formMaxPositionStatement = database.prepare("SELECT COALESCE(MAX(position), -1) AS maxPosition FROM forms");
  const formInsertStatement = database.prepare("INSERT INTO forms (name, position, fields_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)");
  const formUpdateStatement = database.prepare("UPDATE forms SET name = ?, fields_json = ?, updated_at = ? WHERE id = ?");
  const formDeleteStatement = database.prepare("DELETE FROM forms WHERE id = ?");
  const submissionListStatement = database.prepare("SELECT * FROM submissions WHERE form_id = ? ORDER BY id DESC");
  const submissionCountStatement = database.prepare("SELECT COUNT(*) AS count FROM submissions WHERE form_id = ?");
  const submissionInsertStatement = database.prepare("INSERT INTO submissions (form_id, data_json, created_at) VALUES (?, ?, ?)");
  const localeListStatement = database.prepare("SELECT * FROM locales ORDER BY position ASC, code ASC");
  const localeGetStatement = database.prepare("SELECT * FROM locales WHERE code = ?");
  const localeCountStatement = database.prepare("SELECT COUNT(*) AS count FROM locales");
  const localeMaxPositionStatement = database.prepare("SELECT COALESCE(MAX(position), -1) AS maxPosition FROM locales");
  const localeInsertStatement = database.prepare("INSERT INTO locales (code, name, position, created_at) VALUES (?, ?, ?, ?)");
  const localeDeleteStatement = database.prepare("DELETE FROM locales WHERE code = ?");
  const deleteStateStatement = database.prepare("DELETE FROM site_state WHERE key = ?");

  const DEFAULT_FORM_FIELDS = [
    { id: "name", label: "Name", type: "text", required: true },
    { id: "email", label: "Email", type: "email", required: true },
    { id: "message", label: "Message", type: "textarea", required: true }
  ];

  if (formCountStatement.get().count === 0) {
    const timestamp = now();
    formInsertStatement.run("Contact form", 0, JSON.stringify(DEFAULT_FORM_FIELDS), timestamp, timestamp);
  }

  if (localeCountStatement.get().count === 0) {
    localeInsertStatement.run("es", "Spanish", 0, now());
  }

  const DEFAULT_MENU_ITEMS = [
    { id: "stay", label: "Stay", href: "#stay", children: [] },
    { id: "story", label: "Our story", href: "#story", children: [] },
    { id: "offer", label: "Offers", href: "#offer", children: [] }
  ];

  if (menuCountStatement.get().count === 0) {
    const timestamp = now();
    const json = JSON.stringify(DEFAULT_MENU_ITEMS);
    menuInsertStatement.run("Header menu", 0, json, json, timestamp, timestamp);
  }

  function readState(key, fallback = seedContent) {
    const row = getStateStatement.get(key);
    return row ? parseContent(row.value, fallback) : { ...fallback };
  }

  function writeState(key, content) {
    setStateStatement.run(key, JSON.stringify(content), now());
  }

  if (!getStateStatement.get("published")) writeState("published", seedContent);
  if (!getStateStatement.get("draft")) writeState("draft", readState("published"));
  if (revisionCountStatement.get().count === 0) {
    insertRevisionStatement.run(now(), JSON.stringify(readState("published")));
  }
  if (entryCountStatement.get().count === 0) {
    for (const entry of seedEntries) {
      const timestamp = now();
      const json = JSON.stringify(entry.data);
      insertEntryStatement.run(entry.typeId, json, json, timestamp, timestamp);
    }
  }

  function formatEntry(row) {
    if (!row) return null;
    const draft = parseContent(row.draft_json, {});
    const published = row.published_json ? parseContent(row.published_json, {}) : null;
    return { id: row.id, typeId: row.type_id, draft, published, status: published ? (JSON.stringify(draft) === JSON.stringify(published) ? "published" : "changed") : "draft", createdAt: row.created_at, updatedAt: row.updated_at };
  }

  function formatMedia(row) {
    if (!row) return null;
    return {
      id: row.id,
      filename: row.filename,
      originalName: row.original_name,
      mimeType: row.mime_type,
      size: row.size,
      altText: row.alt_text,
      createdAt: row.created_at,
      url: `/uploads/${row.filename}`
    };
  }

  function formatMenu(row) {
    if (!row) return null;
    const draftItems = parseMenuItems(row.draft_json);
    const publishedItems = row.published_json ? parseMenuItems(row.published_json) : null;
    return {
      id: row.id,
      name: row.name,
      position: row.position,
      draft: draftItems,
      published: publishedItems,
      status: publishedItems ? (JSON.stringify(draftItems) === JSON.stringify(publishedItems) ? "published" : "changed") : "draft",
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  function formatForm(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      position: row.position,
      fields: parseMenuItems(row.fields_json),
      submissionCount: submissionCountStatement.get(row.id).count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  function formatSubmission(row) {
    if (!row) return null;
    return { id: row.id, formId: row.form_id, data: parseSubmissionData(row.data_json), createdAt: row.created_at };
  }

  const store = {
    snapshot() {
      const draft = readState("draft");
      const published = readState("published");
      return {
        draft,
        published,
        dirty: JSON.stringify(draft) !== JSON.stringify(published),
        history: historyStatement.all().map(({ id, created_at: createdAt }) => ({ id, createdAt }))
      };
    },

    update(field, value) {
      const draft = { ...readState("draft"), [field]: value };
      writeState("draft", draft);
      return this.snapshot();
    },

    publish() {
      const draft = readState("draft");
      database.exec("BEGIN IMMEDIATE");
      try {
        writeState("published", draft);
        insertRevisionStatement.run(now(), JSON.stringify(draft));
        database.exec("COMMIT");
      } catch (error) {
        database.exec("ROLLBACK");
        throw error;
      }
      return this.snapshot();
    },

    restore(revisionId) {
      const revision = revisionStatement.get(revisionId);
      if (!revision) return null;
      writeState("draft", parseContent(revision.content_json, seedContent));
      return this.snapshot();
    },

    listLocales() {
      return localeListStatement.all();
    },

    getLocale(code) {
      return localeGetStatement.get(code) || null;
    },

    createLocale(code, name) {
      const position = localeMaxPositionStatement.get().maxPosition + 1;
      localeInsertStatement.run(code, name, position, now());
      return this.getLocale(code);
    },

    deleteLocale(code) {
      const row = localeGetStatement.get(code);
      if (!row) return null;
      localeDeleteStatement.run(code);
      deleteStateStatement.run(`draft:${code}`);
      deleteStateStatement.run(`published:${code}`);
      return row;
    },

    snapshotTranslation(locale) {
      const draft = readState(`draft:${locale}`, emptyTranslation);
      const published = readState(`published:${locale}`, emptyTranslation);
      return { locale, draft, published, dirty: JSON.stringify(draft) !== JSON.stringify(published) };
    },

    updateTranslation(locale, field, value) {
      const draft = { ...readState(`draft:${locale}`, emptyTranslation), [field]: value };
      writeState(`draft:${locale}`, draft);
      return this.snapshotTranslation(locale);
    },

    publishTranslation(locale) {
      const draft = readState(`draft:${locale}`, emptyTranslation);
      writeState(`published:${locale}`, draft);
      return this.snapshotTranslation(locale);
    },

    listContent(typeId) {
      const rows = typeId ? entriesByTypeStatement.all(typeId) : entriesStatement.all();
      return { types: contentTypes, entries: rows.map(formatEntry) };
    },

    createEntry(typeId, data) {
      const timestamp = now();
      const result = insertEntryStatement.run(typeId, JSON.stringify(data), null, timestamp, timestamp);
      return formatEntry(entryStatement.get(Number(result.lastInsertRowid)));
    },

    updateEntry(id, data) {
      if (!entryStatement.get(id)) return null;
      updateEntryStatement.run(JSON.stringify(data), now(), id);
      return formatEntry(entryStatement.get(id));
    },

    duplicateEntry(id) {
      const source = formatEntry(entryStatement.get(id));
      if (!source) return null;
      const type = contentTypes[source.typeId];
      const data = { ...source.draft, [type.titleField]: `${source.draft[type.titleField]} copy` };
      return this.createEntry(source.typeId, data);
    },

    publishEntry(id) {
      if (!entryStatement.get(id)) return null;
      publishEntryStatement.run(now(), id);
      return formatEntry(entryStatement.get(id));
    },

    listMedia() {
      return mediaListStatement.all().map(formatMedia);
    },

    getMedia(id) {
      return formatMedia(mediaGetStatement.get(id));
    },

    createMedia({ id, filename, originalName, mimeType, size, altText = "" }) {
      mediaInsertStatement.run(id, filename, originalName, mimeType, size, altText, now());
      return this.getMedia(id);
    },

    updateMediaAlt(id, altText) {
      if (!mediaGetStatement.get(id)) return null;
      mediaUpdateAltStatement.run(altText, id);
      return this.getMedia(id);
    },

    deleteMedia(id) {
      const row = mediaGetStatement.get(id);
      if (!row) return null;
      mediaDeleteStatement.run(id);
      return formatMedia(row);
    },

    listMenus() {
      return menuListStatement.all().map(formatMenu);
    },

    getMenu(id) {
      return formatMenu(menuGetStatement.get(id));
    },

    createMenu(name) {
      const timestamp = now();
      const position = menuMaxPositionStatement.get().maxPosition + 1;
      const result = menuInsertStatement.run(name, position, "[]", null, timestamp, timestamp);
      return this.getMenu(Number(result.lastInsertRowid));
    },

    updateMenu(id, { name, items }) {
      const current = menuGetStatement.get(id);
      if (!current) return null;
      const nextName = name ?? current.name;
      const nextItems = items ?? parseMenuItems(current.draft_json);
      menuUpdateStatement.run(nextName, JSON.stringify(nextItems), now(), id);
      return this.getMenu(id);
    },

    publishMenu(id) {
      if (!menuGetStatement.get(id)) return null;
      menuPublishStatement.run(now(), id);
      return this.getMenu(id);
    },

    reorderMenus(orderedIds) {
      database.exec("BEGIN IMMEDIATE");
      try {
        orderedIds.forEach((id, index) => menuPositionStatement.run(index, id));
        database.exec("COMMIT");
      } catch (error) {
        database.exec("ROLLBACK");
        throw error;
      }
      return this.listMenus();
    },

    deleteMenu(id) {
      const row = menuGetStatement.get(id);
      if (!row) return null;
      menuDeleteStatement.run(id);
      return formatMenu(row);
    },

    listForms() {
      return formListStatement.all().map(formatForm);
    },

    getForm(id) {
      return formatForm(formGetStatement.get(id));
    },

    createForm(name) {
      const timestamp = now();
      const position = formMaxPositionStatement.get().maxPosition + 1;
      const result = formInsertStatement.run(name, position, "[]", timestamp, timestamp);
      return this.getForm(Number(result.lastInsertRowid));
    },

    updateForm(id, { name, fields }) {
      const current = formGetStatement.get(id);
      if (!current) return null;
      const nextName = name ?? current.name;
      const nextFields = fields ?? parseMenuItems(current.fields_json);
      formUpdateStatement.run(nextName, JSON.stringify(nextFields), now(), id);
      return this.getForm(id);
    },

    deleteForm(id) {
      const row = formGetStatement.get(id);
      if (!row) return null;
      formDeleteStatement.run(id);
      return formatForm(row);
    },

    listSubmissions(formId) {
      return submissionListStatement.all(formId).map(formatSubmission);
    },

    createSubmission(formId, data) {
      const result = submissionInsertStatement.run(formId, JSON.stringify(data), now());
      return { id: Number(result.lastInsertRowid), formId, data, createdAt: now() };
    },

    close() {
      database.close();
    }
  };

  return store;
}
