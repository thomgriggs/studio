import test from "node:test";
import assert from "node:assert/strict";
import { validatePatch, validateMediaUpload, MAX_MEDIA_BYTES, validateMenuItems, validateMenuName, validateMenuOrder, MAX_MENU_DEPTH, validateFormName, validateFormFields, validateSubmission, MAX_FORM_FIELDS, validateTranslationPatch, translatableFields, validateLocaleCode, validateLocaleName, validatePageSlug, validatePageTitle, validatePageKind, validatePageContent, pageKinds } from "../src/content.js";

test("accepts and normalizes a known plain-text field", () => {
  assert.deepEqual(validatePatch({ heading: "  A calm coast  " }), {
    ok: true,
    field: "heading",
    value: "A calm coast"
  });
});

test("rejects unknown fields instead of mass assigning data", () => {
  assert.equal(validatePatch({ role: "admin" }).ok, false);
});

test("rejects multi-field and non-text updates", () => {
  assert.equal(validatePatch({ heading: "One", eyebrow: "Two" }).ok, false);
  assert.equal(validatePatch({ heading: { html: "<b>Unsafe</b>" } }).ok, false);
});

test("treats markup as text data and enforces limits", () => {
  const markup = validatePatch({ heading: "<img src=x onerror=alert(1)>" });
  assert.equal(markup.ok, true);
  assert.equal(markup.value, "<img src=x onerror=alert(1)>");
  assert.equal(validatePatch({ heading: "x".repeat(121) }).ok, false);
});

test("allows clearing an optional field to empty but not a required one", () => {
  assert.deepEqual(validatePatch({ heroImageId: "" }), { ok: true, field: "heroImageId", value: "" });
  assert.equal(validatePatch({ heading: "" }).ok, false);
});

test("rejects media uploads with disallowed or missing type", () => {
  assert.equal(validateMediaUpload({ mimeType: "image/svg+xml", dataBase64: "AA==" }).ok, false);
  assert.equal(validateMediaUpload({ mimeType: "image/png", dataBase64: "" }).ok, false);
});

test("rejects media uploads over the size limit and accepts valid ones", () => {
  const tooLarge = Buffer.alloc(MAX_MEDIA_BYTES + 1, 1).toString("base64");
  assert.equal(validateMediaUpload({ mimeType: "image/png", dataBase64: tooLarge }).ok, false);

  const small = Buffer.from("fake-png-bytes").toString("base64");
  const result = validateMediaUpload({ filename: "../evil<script>.png", mimeType: "image/png", dataBase64: small });
  assert.equal(result.ok, true);
  assert.equal(result.data.extension, "png");
  assert.doesNotMatch(result.data.originalName, /[<>/]/);
});

test("rejects empty or overlong menu names", () => {
  assert.equal(validateMenuName("  ").ok, false);
  assert.equal(validateMenuName("x".repeat(61)).ok, false);
  assert.deepEqual(validateMenuName(" Header menu "), { ok: true, value: "Header menu" });
});

test("validates nested menu trees and requires a label on every item", () => {
  const tree = [
    { id: "a", label: "Stay", href: "#stay", children: [
      { id: "a1", label: "Rooms", href: "#stay" },
      { id: "a2", label: "Suites", href: "#stay" }
    ] }
  ];
  const result = validateMenuItems(tree);
  assert.equal(result.ok, true);
  assert.equal(result.value[0].children.length, 2);

  assert.equal(validateMenuItems([{ id: "b", label: "", href: "#" }]).ok, false);
  assert.equal(validateMenuItems("not-an-array").ok, false);
});

test("rejects menu trees that nest deeper than the allowed limit", () => {
  let node = { id: "leaf", label: "Leaf", href: "#", children: [] };
  for (let depth = 0; depth < MAX_MENU_DEPTH + 2; depth += 1) {
    node = { id: `n${depth}`, label: `Level ${depth}`, href: "#", children: [node] };
  }
  assert.equal(validateMenuItems([node]).ok, false);
});

test("validates menu reorder payloads against the known id set", () => {
  assert.deepEqual(validateMenuOrder([3, 1, 2], [1, 2, 3]), { ok: true, value: [3, 1, 2] });
  assert.equal(validateMenuOrder([1, 2], [1, 2, 3]).ok, false);
  assert.equal(validateMenuOrder([1, 1, 2], [1, 2]).ok, false);
});

test("rejects empty or overlong form names", () => {
  assert.equal(validateFormName("  ").ok, false);
  assert.equal(validateFormName("x".repeat(61)).ok, false);
  assert.deepEqual(validateFormName(" Contact us "), { ok: true, value: "Contact us" });
});

test("validates form field schemas, requiring options for select fields and unique ids", () => {
  const fields = validateFormFields([
    { id: "name", label: "Name", type: "text", required: true },
    { id: "topic", label: "Topic", type: "select", options: ["General", "Support"] }
  ]);
  assert.equal(fields.ok, true);
  assert.equal(fields.value[1].options.length, 2);

  assert.equal(validateFormFields([{ id: "x", label: "", type: "text" }]).ok, false);
  assert.equal(validateFormFields([{ id: "x", label: "Topic", type: "select", options: [] }]).ok, false);
  assert.equal(validateFormFields([{ id: "a", label: "A", type: "text" }, { id: "a", label: "B", type: "text" }]).ok, false);
  assert.equal(validateFormFields(new Array(MAX_FORM_FIELDS + 1).fill({ id: "x", label: "X", type: "text" })).ok, false);
});

test("validates submissions against a field schema: required, email format, unknown fields, select options", () => {
  const fields = validateFormFields([
    { id: "name", label: "Name", type: "text", required: true },
    { id: "email", label: "Email", type: "email", required: true },
    { id: "topic", label: "Topic", type: "select", options: ["General", "Support"] },
    { id: "subscribe", label: "Subscribe", type: "checkbox" }
  ]).value;

  const good = validateSubmission(fields, { name: "Ada", email: "ada@example.com", topic: "General", subscribe: true });
  assert.equal(good.ok, true);
  assert.deepEqual(good.value, { name: "Ada", email: "ada@example.com", topic: "General", subscribe: true });

  assert.equal(validateSubmission(fields, { name: "", email: "ada@example.com" }).ok, false);
  assert.equal(validateSubmission(fields, { name: "Ada", email: "not-an-email" }).ok, false);
  assert.equal(validateSubmission(fields, { name: "Ada", email: "ada@example.com", topic: "Nope" }).ok, false);
  assert.equal(validateSubmission(fields, { name: "Ada", email: "ada@example.com", role: "admin" }).ok, false);
});

test("validates locale codes: shape, reserved 'en', and case normalization", () => {
  assert.deepEqual(validateLocaleCode("FR"), { ok: true, value: "fr" });
  assert.deepEqual(validateLocaleCode("pt-BR"), { ok: true, value: "pt-br" });
  assert.equal(validateLocaleCode("fr123").ok, false);
  assert.equal(validateLocaleCode("e").ok, false);
  assert.equal(validateLocaleCode("en").ok, false);
});

test("validates locale display names", () => {
  assert.deepEqual(validateLocaleName(" French "), { ok: true, value: "French" });
  assert.equal(validateLocaleName("").ok, false);
  assert.equal(validateLocaleName("x".repeat(61)).ok, false);
});

test("translatable fields include Story and Rooms listing content, not just unsectioned Hero/Offer fields", () => {
  assert.ok(translatableFields.includes("storyTitle"), "Story fields use `section` for UI grouping only, not to exclude them from translation");
  assert.ok(translatableFields.includes("roomsTitle"));
  assert.ok(translatableFields.includes("heading"));
  assert.ok(!translatableFields.includes("seoTitle"));
  assert.ok(!translatableFields.includes("siteName"));
  assert.ok(!translatableFields.includes("heroImageId"));
});

test("translation patches allow clearing to empty (not yet translated) but reject unknown or non-translatable fields", () => {
  const [field] = translatableFields;
  assert.deepEqual(validateTranslationPatch({ [field]: "  Traducido  " }), { ok: true, field, value: "Traducido" });
  assert.deepEqual(validateTranslationPatch({ [field]: "" }), { ok: true, field, value: "" });
  assert.equal(validateTranslationPatch({ siteName: "Nombre" }).ok, false);
  assert.equal(validateTranslationPatch({ role: "admin" }).ok, false);
});

test("validates page slugs: shape, reserved words, and case normalization", () => {
  assert.deepEqual(validatePageSlug("About"), { ok: true, value: "about" });
  assert.deepEqual(validatePageSlug("our-story"), { ok: true, value: "our-story" });
  assert.equal(validatePageSlug("home").ok, false);
  assert.equal(validatePageSlug("api").ok, false);
  assert.equal(validatePageSlug("Has Spaces").ok, false);
  assert.equal(validatePageSlug("-leading-hyphen").ok, false);
  assert.equal(validatePageSlug("").ok, false);
});

test("validates page titles", () => {
  assert.deepEqual(validatePageTitle(" About us "), { ok: true, value: "About us" });
  assert.equal(validatePageTitle("").ok, false);
  assert.equal(validatePageTitle("x".repeat(61)).ok, false);
});

test("validates page kinds against the known set", () => {
  assert.deepEqual(validatePageKind("rooms"), { ok: true, value: "rooms" });
  assert.equal(validatePageKind("nonsense").ok, false);
  assert.ok(Object.keys(pageKinds).includes("content"));
});

test("validates and trims page content, requiring a heading", () => {
  const result = validatePageContent({ heading: "  About Tidehouse  ", intro: "  A short intro  ", body: "Body copy." });
  assert.equal(result.ok, true);
  assert.equal(result.value.heading, "About Tidehouse");
  assert.equal(result.value.intro, "A short intro");
  assert.equal(validatePageContent({ heading: "" }).ok, false);
  assert.equal(validatePageContent("not an object").ok, false);
});

