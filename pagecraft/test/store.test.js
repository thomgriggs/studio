import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStore } from "../src/store.js";

test("visual and structured paths can update the same canonical draft", () => {
  const store = createStore({ now: () => "2026-07-19T00:00:00.000Z" });
  store.update("heading", "Edited in either surface");
  const state = store.snapshot();
  assert.equal(state.draft.heading, "Edited in either surface");
  assert.notEqual(state.published.heading, state.draft.heading);
  assert.equal(state.dirty, true);
});

test("publish creates an immutable history entry", () => {
  const store = createStore({ now: () => "2026-07-19T00:00:00.000Z" });
  store.update("heading", "Published heading");
  const published = store.publish();
  assert.equal(published.published.heading, "Published heading");
  assert.equal(published.history.length, 2);
  store.update("heading", "Later draft");
  assert.equal(store.snapshot().published.heading, "Published heading");
});

test("restore copies a past revision into draft without erasing history", () => {
  const store = createStore({ now: () => "2026-07-19T00:00:00.000Z" });
  const original = store.snapshot().published.heading;
  store.update("heading", "Second version");
  store.publish();
  const before = store.snapshot().history.length;
  const restored = store.restore(1);
  assert.equal(restored.draft.heading, original);
  assert.equal(restored.published.heading, "Second version");
  assert.equal(restored.history.length, before);
});

test("drafts, published content, and history survive a database restart", async () => {
  const directory = mkdtempSync(join(tmpdir(), "pagecraft-store-"));
  const path = join(directory, "pagecraft.sqlite");
  try {
    const first = createStore({ path, now: () => "2026-07-20T10:00:00.000Z" });
    first.update("heading", "A persistent draft");
    first.publish();
    first.update("offerTitle", "An unpublished persistent offer");
    const historyLength = first.snapshot().history.length;
    first.close();

    const reopened = createStore({ path, now: () => "2026-07-20T11:00:00.000Z" });
    const state = reopened.snapshot();
    assert.equal(state.published.heading, "A persistent draft");
    assert.equal(state.draft.offerTitle, "An unpublished persistent offer");
    assert.equal(state.history.length, historyLength);
    assert.equal(state.dirty, true);
    reopened.close();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("collection entries support draft, duplicate, and publish workflows", () => {
  const store = createStore({ now: () => "2026-07-20T12:00:00.000Z" });
  const created = store.createEntry("dish", { name: "Tart", description: "Stone fruit", price: 12, menuSection: "Dessert", dietaryTags: [], available: true });
  assert.equal(created.status, "draft");
  const duplicate = store.duplicateEntry(created.id);
  assert.equal(duplicate.draft.name, "Tart copy");
  assert.equal(store.publishEntry(created.id).status, "published");
  const updated = store.updateEntry(created.id, { ...created.draft, price: 14 });
  assert.equal(updated.status, "changed");
  assert.equal(store.listContent("dish").entries.some((entry) => entry.id === created.id), true);
  store.close();
});

test("a default header menu is seeded and supports rename, nested items, publish, and reorder", () => {
  const store = createStore({ now: () => "2026-08-01T00:00:00.000Z" });
  const seeded = store.listMenus();
  assert.equal(seeded.length, 1);
  assert.equal(seeded[0].name, "Header menu");
  assert.equal(seeded[0].status, "published");

  const second = store.createMenu("Footer menu");
  assert.equal(second.position, 1);
  assert.equal(second.status, "draft");

  const nested = [{ id: "a", label: "About", href: "#about", children: [{ id: "a1", label: "Team", href: "#team", children: [] }] }];
  const updated = store.updateMenu(second.id, { name: "Footer links", items: nested });
  assert.equal(updated.name, "Footer links");
  assert.equal(updated.draft[0].children[0].label, "Team");
  assert.equal(updated.status, "draft");

  const published = store.publishMenu(second.id);
  assert.equal(published.status, "published");
  assert.deepEqual(published.published, nested);

  const reordered = store.reorderMenus([second.id, seeded[0].id]);
  assert.equal(reordered[0].id, second.id);
  assert.equal(reordered[0].position, 0);
  assert.equal(reordered[1].position, 1);

  const deleted = store.deleteMenu(second.id);
  assert.equal(deleted.name, "Footer links");
  assert.equal(store.listMenus().length, 1);
  store.close();
});

test("a default contact form is seeded and supports rename, fields, and submissions", () => {
  const store = createStore({ now: () => "2026-08-02T00:00:00.000Z" });
  const seeded = store.listForms();
  assert.equal(seeded.length, 1);
  assert.equal(seeded[0].name, "Contact form");
  assert.equal(seeded[0].submissionCount, 0);

  const fields = [{ id: "name", label: "Name", type: "text", required: true }];
  const updated = store.updateForm(seeded[0].id, { name: "Reach out", fields });
  assert.equal(updated.name, "Reach out");
  assert.deepEqual(updated.fields, fields);

  const submission = store.createSubmission(updated.id, { name: "Ada" });
  assert.equal(submission.formId, updated.id);
  assert.equal(store.getForm(updated.id).submissionCount, 1);
  assert.deepEqual(store.listSubmissions(updated.id)[0].data, { name: "Ada" });

  const second = store.createForm("Newsletter");
  assert.equal(second.position, 1);
  const deleted = store.deleteForm(second.id);
  assert.equal(deleted.name, "Newsletter");
  assert.equal(store.listForms().length, 1);
  store.close();
});

test("translations start empty, save as drafts, and publish independently of the English content", () => {
  const store = createStore({ now: () => "2026-08-03T00:00:00.000Z" });
  const initial = store.snapshotTranslation("es");
  assert.equal(initial.draft.heading, "");
  assert.equal(initial.dirty, false);

  const updated = store.updateTranslation("es", "heading", "Quédate cerca de la marea.");
  assert.equal(updated.draft.heading, "Quédate cerca de la marea.");
  assert.equal(updated.published.heading, "");
  assert.equal(updated.dirty, true);

  const published = store.publishTranslation("es");
  assert.equal(published.published.heading, "Quédate cerca de la marea.");
  assert.equal(published.dirty, false);

  store.update("heading", "English still separate");
  assert.equal(store.snapshotTranslation("es").published.heading, "Quédate cerca de la marea.");
  store.close();
});

test("a default Spanish locale is seeded, more languages can be added, and deleting one clears its translation state", () => {
  const store = createStore({ now: () => "2026-08-04T00:00:00.000Z" });
  const seeded = store.listLocales();
  assert.equal(seeded.length, 1);
  assert.equal(seeded[0].code, "es");

  const french = store.createLocale("fr", "French");
  assert.equal(french.position, 1);
  assert.equal(store.listLocales().length, 2);

  store.updateTranslation("fr", "heading", "Restez près de la marée.");
  assert.equal(store.snapshotTranslation("fr").draft.heading, "Restez près de la marée.");

  const deleted = store.deleteLocale("fr");
  assert.equal(deleted.code, "fr");
  assert.equal(store.listLocales().length, 1);
  assert.equal(store.snapshotTranslation("fr").draft.heading, "", "translation state should be cleared after deleting the locale");
  store.close();
});

test("five example pages are seeded with real content, and pages support create, edit, publish, and delete", () => {
  const store = createStore({ now: () => "2026-08-05T00:00:00.000Z" });
  const seeded = store.listPages();
  assert.equal(seeded.length, 5);
  assert.deepEqual(seeded.map((page) => page.slug), ["about", "rooms", "dining", "offers", "contact"]);
  assert.equal(seeded.every((page) => page.status === "published"), true);
  assert.equal(store.getPageBySlug("rooms").kind, "rooms");

  const created = store.createPage("faq", "FAQ", "content", { heading: "Questions", intro: "", body: "", seoTitle: "", seoDescription: "" });
  assert.equal(created.status, "draft");

  const updated = store.updatePage(created.id, { content: { heading: "Frequently asked questions", intro: "", body: "", seoTitle: "", seoDescription: "" } });
  assert.equal(updated.draft.heading, "Frequently asked questions");

  const published = store.publishPage(created.id);
  assert.equal(published.status, "published");
  assert.equal(published.published.heading, "Frequently asked questions");

  const deleted = store.deletePage(created.id);
  assert.equal(deleted.slug, "faq");
  assert.equal(store.listPages().length, 5);
  store.close();
});

test("page translations start empty per (page, locale), save as drafts, and publish independently", () => {
  const store = createStore({ now: () => "2026-08-06T00:00:00.000Z" });
  const empty = { heading: "", intro: "", body: "", seoTitle: "", seoDescription: "" };
  const about = store.getPageBySlug("about");

  const initial = store.snapshotPageTranslation(about.id, "es");
  assert.deepEqual(initial.draft, empty);
  assert.equal(initial.dirty, false);

  const updated = store.updatePageTranslation(about.id, "es", "heading", "Un hotel junto al mar.");
  assert.equal(updated.draft.heading, "Un hotel junto al mar.");
  assert.equal(updated.published.heading, "");
  assert.equal(updated.dirty, true);

  const published = store.publishPageTranslation(about.id, "es");
  assert.equal(published.published.heading, "Un hotel junto al mar.");
  assert.equal(published.dirty, false);

  // A different page's translation for the same locale is independent.
  const rooms = store.getPageBySlug("rooms");
  assert.deepEqual(store.snapshotPageTranslation(rooms.id, "es").draft, empty);
  store.close();
});
