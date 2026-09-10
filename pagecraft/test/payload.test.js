import test from "node:test";
import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { readFile } from "node:fs/promises";

test("prototype client assets remain far below provisional budgets", async () => {
  const script = gzipSync(await readFile(new URL("../public/app.js", import.meta.url))).length;
  const styles = gzipSync(await readFile(new URL("../public/app.css", import.meta.url))).length;
  assert.ok(script <= 75 * 1024, `JavaScript is ${script} compressed bytes`);
  assert.ok(styles <= 40 * 1024, `CSS is ${styles} compressed bytes`);
});

test("the hidden attribute wins over component display styles", async () => {
  const styles = await readFile(new URL("../public/app.css", import.meta.url), "utf8");
  assert.match(styles, /\[hidden\]\s*\{\s*display:\s*none\s*!important;\s*\}/);
});

test("public view contains no visible sign-in trigger", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const script = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  assert.match(html, /<dialog[^>]+id="login-dialog"/);
  assert.match(script, /const SECRET_CODE = "pagecraft"/);
  assert.doesNotMatch(html, />\s*Sign in\s*</i);
});
