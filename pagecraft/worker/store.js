function now() {
  return new Date().toISOString();
}

function parseObject(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? { ...fallback, ...parsed } : { ...fallback };
  } catch {
    return { ...fallback };
  }
}

function parseArray(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function createStore(db) {
  async function readState(key, fallback) {
    const row = await db.prepare("SELECT value FROM site_state WHERE key = ?").bind(key).first();
    return row ? parseObject(row.value, fallback) : { ...fallback };
  }

  async function writeState(key, content) {
    await db.prepare(
      "INSERT INTO site_state (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
    ).bind(key, JSON.stringify(content), now()).run();
  }

  function formatEntry(row) {
    if (!row) return null;
    const draft = parseObject(row.draft_json, {});
    const published = row.published_json ? parseObject(row.published_json, {}) : null;
    return {
      id: row.id,
      typeId: row.type_id,
      draft,
      published,
      status: published ? (JSON.stringify(draft) === JSON.stringify(published) ? "published" : "changed") : "draft",
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
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
    const draftItems = parseArray(row.draft_json);
    const publishedItems = row.published_json ? parseArray(row.published_json) : null;
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

  function formatPage(row) {
    if (!row) return null;
    const draft = parseObject(row.draft_json, {});
    const published = row.published_json ? parseObject(row.published_json, {}) : null;
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      kind: row.kind,
      draft,
      published,
      status: published ? (JSON.stringify(draft) === JSON.stringify(published) ? "published" : "changed") : "draft",
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  return {
    async snapshot() {
      const [draft, published, history] = await Promise.all([
        readState("draft", {}),
        readState("published", {}),
        db.prepare("SELECT id, created_at FROM revisions ORDER BY id DESC").all()
      ]);
      return {
        draft,
        published,
        dirty: JSON.stringify(draft) !== JSON.stringify(published),
        history: history.results.map((row) => ({ id: row.id, createdAt: row.created_at }))
      };
    },

    async update(field, value) {
      const draft = { ...(await readState("draft", {})), [field]: value };
      await writeState("draft", draft);
      return this.snapshot();
    },

    async publish() {
      const draft = await readState("draft", {});
      await db.batch([
        db.prepare("INSERT INTO site_state (key, value, updated_at) VALUES ('published', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at").bind(JSON.stringify(draft), now()),
        db.prepare("INSERT INTO revisions (created_at, content_json) VALUES (?, ?)").bind(now(), JSON.stringify(draft))
      ]);
      return this.snapshot();
    },

    async restore(revisionId) {
      const revision = await db.prepare("SELECT content_json FROM revisions WHERE id = ?").bind(revisionId).first();
      if (!revision) return null;
      await writeState("draft", parseObject(revision.content_json, {}));
      return this.snapshot();
    },

    async listContent(contentTypes, typeId) {
      const rows = typeId
        ? await db.prepare("SELECT * FROM entries WHERE type_id = ? ORDER BY updated_at DESC, id DESC").bind(typeId).all()
        : await db.prepare("SELECT * FROM entries ORDER BY updated_at DESC, id DESC").all();
      return { types: contentTypes, entries: rows.results.map(formatEntry) };
    },

    async createEntry(typeId, data) {
      const timestamp = now();
      const result = await db.prepare("INSERT INTO entries (type_id, draft_json, published_json, created_at, updated_at) VALUES (?, ?, NULL, ?, ?) RETURNING id")
        .bind(typeId, JSON.stringify(data), timestamp, timestamp).first();
      return formatEntry(await db.prepare("SELECT * FROM entries WHERE id = ?").bind(result.id).first());
    },

    async updateEntry(id, data) {
      const existing = await db.prepare("SELECT * FROM entries WHERE id = ?").bind(id).first();
      if (!existing) return null;
      await db.prepare("UPDATE entries SET draft_json = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(data), now(), id).run();
      return formatEntry(await db.prepare("SELECT * FROM entries WHERE id = ?").bind(id).first());
    },

    async duplicateEntry(id, contentTypes) {
      const source = formatEntry(await db.prepare("SELECT * FROM entries WHERE id = ?").bind(id).first());
      if (!source) return null;
      const type = contentTypes[source.typeId];
      const data = { ...source.draft, [type.titleField]: `${source.draft[type.titleField]} copy` };
      return this.createEntry(source.typeId, data);
    },

    async publishEntry(id) {
      const existing = await db.prepare("SELECT * FROM entries WHERE id = ?").bind(id).first();
      if (!existing) return null;
      await db.prepare("UPDATE entries SET published_json = draft_json, updated_at = ? WHERE id = ?").bind(now(), id).run();
      return formatEntry(await db.prepare("SELECT * FROM entries WHERE id = ?").bind(id).first());
    },

    async listMedia() {
      const rows = await db.prepare("SELECT * FROM media ORDER BY created_at DESC").all();
      return rows.results.map(formatMedia);
    },

    async getMedia(id) {
      return formatMedia(await db.prepare("SELECT * FROM media WHERE id = ?").bind(id).first());
    },

    async createMedia({ id, filename, originalName, mimeType, size, altText = "" }) {
      await db.prepare("INSERT INTO media (id, filename, original_name, mime_type, size, alt_text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(id, filename, originalName, mimeType, size, altText, now()).run();
      return this.getMedia(id);
    },

    async updateMediaAlt(id, altText) {
      const existing = await db.prepare("SELECT id FROM media WHERE id = ?").bind(id).first();
      if (!existing) return null;
      await db.prepare("UPDATE media SET alt_text = ? WHERE id = ?").bind(altText, id).run();
      return this.getMedia(id);
    },

    async deleteMedia(id) {
      const row = await db.prepare("SELECT * FROM media WHERE id = ?").bind(id).first();
      if (!row) return null;
      await db.prepare("DELETE FROM media WHERE id = ?").bind(id).run();
      return formatMedia(row);
    },

    async listMenus() {
      const rows = await db.prepare("SELECT * FROM menus ORDER BY position ASC, id ASC").all();
      return rows.results.map(formatMenu);
    },

    async getMenu(id) {
      return formatMenu(await db.prepare("SELECT * FROM menus WHERE id = ?").bind(id).first());
    },

    async createMenu(name) {
      const maxRow = await db.prepare("SELECT COALESCE(MAX(position), -1) AS maxPosition FROM menus").first();
      const timestamp = now();
      const result = await db.prepare("INSERT INTO menus (name, position, draft_json, published_json, created_at, updated_at) VALUES (?, ?, '[]', NULL, ?, ?) RETURNING id")
        .bind(name, maxRow.maxPosition + 1, timestamp, timestamp).first();
      return this.getMenu(result.id);
    },

    async updateMenu(id, { name, items }) {
      const current = await db.prepare("SELECT * FROM menus WHERE id = ?").bind(id).first();
      if (!current) return null;
      const nextName = name ?? current.name;
      const nextItems = items ?? parseArray(current.draft_json);
      await db.prepare("UPDATE menus SET name = ?, draft_json = ?, updated_at = ? WHERE id = ?").bind(nextName, JSON.stringify(nextItems), now(), id).run();
      return this.getMenu(id);
    },

    async publishMenu(id) {
      const existing = await db.prepare("SELECT id FROM menus WHERE id = ?").bind(id).first();
      if (!existing) return null;
      await db.prepare("UPDATE menus SET published_json = draft_json, updated_at = ? WHERE id = ?").bind(now(), id).run();
      return this.getMenu(id);
    },

    async reorderMenus(orderedIds) {
      await db.batch(orderedIds.map((id, index) => db.prepare("UPDATE menus SET position = ? WHERE id = ?").bind(index, id)));
      return this.listMenus();
    },

    async deleteMenu(id) {
      const row = await db.prepare("SELECT * FROM menus WHERE id = ?").bind(id).first();
      if (!row) return null;
      await db.prepare("DELETE FROM menus WHERE id = ?").bind(id).run();
      return formatMenu(row);
    },

    async listForms() {
      const rows = await db.prepare("SELECT * FROM forms ORDER BY position ASC, id ASC").all();
      return Promise.all(rows.results.map((row) => this._formatForm(row)));
    },

    async _formatForm(row) {
      if (!row) return null;
      const countRow = await db.prepare("SELECT COUNT(*) AS count FROM submissions WHERE form_id = ?").bind(row.id).first();
      return {
        id: row.id,
        name: row.name,
        position: row.position,
        fields: parseArray(row.fields_json),
        submissionCount: countRow.count,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    },

    async getForm(id) {
      return this._formatForm(await db.prepare("SELECT * FROM forms WHERE id = ?").bind(id).first());
    },

    async createForm(name) {
      const maxRow = await db.prepare("SELECT COALESCE(MAX(position), -1) AS maxPosition FROM forms").first();
      const timestamp = now();
      const result = await db.prepare("INSERT INTO forms (name, position, fields_json, created_at, updated_at) VALUES (?, ?, '[]', ?, ?) RETURNING id")
        .bind(name, maxRow.maxPosition + 1, timestamp, timestamp).first();
      return this.getForm(result.id);
    },

    async updateForm(id, { name, fields }) {
      const current = await db.prepare("SELECT * FROM forms WHERE id = ?").bind(id).first();
      if (!current) return null;
      const nextName = name ?? current.name;
      const nextFields = fields ?? parseArray(current.fields_json);
      await db.prepare("UPDATE forms SET name = ?, fields_json = ?, updated_at = ? WHERE id = ?").bind(nextName, JSON.stringify(nextFields), now(), id).run();
      return this.getForm(id);
    },

    async deleteForm(id) {
      const form = await this.getForm(id);
      if (!form) return null;
      await db.prepare("DELETE FROM forms WHERE id = ?").bind(id).run();
      return form;
    },

    async listSubmissions(formId) {
      const rows = await db.prepare("SELECT * FROM submissions WHERE form_id = ? ORDER BY id DESC").bind(formId).all();
      return rows.results.map((row) => ({ id: row.id, formId: row.form_id, data: parseObject(row.data_json, {}), createdAt: row.created_at }));
    },

    async createSubmission(formId, data) {
      const timestamp = now();
      const result = await db.prepare("INSERT INTO submissions (form_id, data_json, created_at) VALUES (?, ?, ?) RETURNING id")
        .bind(formId, JSON.stringify(data), timestamp).first();
      return { id: result.id, formId, data, createdAt: timestamp };
    },

    async listLocales() {
      const rows = await db.prepare("SELECT * FROM locales ORDER BY position ASC, code ASC").all();
      return rows.results;
    },

    async getLocale(code) {
      return (await db.prepare("SELECT * FROM locales WHERE code = ?").bind(code).first()) || null;
    },

    async createLocale(code, name) {
      const maxRow = await db.prepare("SELECT COALESCE(MAX(position), -1) AS maxPosition FROM locales").first();
      await db.prepare("INSERT INTO locales (code, name, position, created_at) VALUES (?, ?, ?, ?)").bind(code, name, maxRow.maxPosition + 1, now()).run();
      return this.getLocale(code);
    },

    async deleteLocale(code) {
      const row = await this.getLocale(code);
      if (!row) return null;
      await db.batch([
        db.prepare("DELETE FROM locales WHERE code = ?").bind(code),
        db.prepare("DELETE FROM site_state WHERE key = ?").bind(`draft:${code}`),
        db.prepare("DELETE FROM site_state WHERE key = ?").bind(`published:${code}`)
      ]);
      return row;
    },

    async snapshotTranslation(locale, emptyTranslation) {
      const [draft, published] = await Promise.all([
        readState(`draft:${locale}`, emptyTranslation),
        readState(`published:${locale}`, emptyTranslation)
      ]);
      return { locale, draft, published, dirty: JSON.stringify(draft) !== JSON.stringify(published) };
    },

    async updateTranslation(locale, field, value, emptyTranslation) {
      const draft = { ...(await readState(`draft:${locale}`, emptyTranslation)), [field]: value };
      await writeState(`draft:${locale}`, draft);
      return this.snapshotTranslation(locale, emptyTranslation);
    },

    async publishTranslation(locale, emptyTranslation) {
      const draft = await readState(`draft:${locale}`, emptyTranslation);
      await writeState(`published:${locale}`, draft);
      return this.snapshotTranslation(locale, emptyTranslation);
    },

    async createSession(id, username, role, csrf) {
      await db.prepare("INSERT INTO sessions (id, username, role, csrf, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, username, role, csrf, now()).run();
    },

    async getSession(id) {
      const row = await db.prepare("SELECT * FROM sessions WHERE id = ?").bind(id).first();
      return row ? { username: row.username, role: row.role, csrf: row.csrf } : null;
    },

    async deleteSession(id) {
      await db.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
    },

    async listPages() {
      const rows = await db.prepare("SELECT * FROM pages ORDER BY id ASC").all();
      return rows.results.map(formatPage);
    },

    async getPage(id) {
      return formatPage(await db.prepare("SELECT * FROM pages WHERE id = ?").bind(id).first());
    },

    async getPageBySlug(slug) {
      return formatPage(await db.prepare("SELECT * FROM pages WHERE slug = ?").bind(slug).first());
    },

    async createPage(slug, title, kind, content) {
      const timestamp = now();
      const result = await db.prepare("INSERT INTO pages (slug, title, kind, draft_json, published_json, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, ?, ?) RETURNING id")
        .bind(slug, title, kind, JSON.stringify(content), timestamp, timestamp).first();
      return this.getPage(result.id);
    },

    async updatePage(id, { title, content }) {
      const current = await db.prepare("SELECT * FROM pages WHERE id = ?").bind(id).first();
      if (!current) return null;
      const nextTitle = title ?? current.title;
      const nextContent = content ?? parseObject(current.draft_json, {});
      await db.prepare("UPDATE pages SET title = ?, draft_json = ?, updated_at = ? WHERE id = ?").bind(nextTitle, JSON.stringify(nextContent), now(), id).run();
      return this.getPage(id);
    },

    async publishPage(id) {
      const existing = await db.prepare("SELECT id FROM pages WHERE id = ?").bind(id).first();
      if (!existing) return null;
      await db.prepare("UPDATE pages SET published_json = draft_json, updated_at = ? WHERE id = ?").bind(now(), id).run();
      return this.getPage(id);
    },

    async deletePage(id) {
      const row = await db.prepare("SELECT * FROM pages WHERE id = ?").bind(id).first();
      if (!row) return null;
      await db.prepare("DELETE FROM pages WHERE id = ?").bind(id).run();
      return formatPage(row);
    }
  };
}
