const base = process.env.STUDIO_URL || "http://127.0.0.1:4173";

async function signIn(username, password) {
  const response = await fetch(`${base}/api/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) throw new Error(`Login failed: ${response.status}`);
  return {
    cookie: response.headers.get("set-cookie").split(";")[0],
    session: await response.json()
  };
}

async function authenticated(path, auth, options = {}) {
  return fetch(`${base}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      cookie: auth.cookie,
      ...(options.method && options.method !== "GET" ? { "x-csrf-token": auth.session.csrf } : {}),
      ...(options.headers || {})
    }
  });
}

const page = await fetch(base);
if (page.status !== 200 || !(await page.text()).includes("Tidehouse")) {
  throw new Error("Static application did not load.");
}

const publicState = await fetch(`${base}/api/public`);
const originalPublic = await publicState.json();
if (publicState.status !== 200 || !originalPublic.published) {
  throw new Error("Published content was not publicly available.");
}

const anonymous = await fetch(`${base}/api/state`);
if (anonymous.status !== 401) throw new Error("Anonymous state request was not denied.");

const editor = await signIn("editor", "editor-demo");
const edit = await authenticated("/api/draft", editor, {
  method: "PATCH",
  body: JSON.stringify({ heading: "Edited through the shared draft" })
});
if (edit.status !== 200) throw new Error(`Editor update failed: ${edit.status}`);

const forbiddenPublish = await authenticated("/api/publish", editor, { method: "POST", body: "{}" });
if (forbiddenPublish.status !== 403) throw new Error("Editor was able to publish.");

const missingCsrf = await fetch(`${base}/api/draft`, {
  method: "PATCH",
  headers: { "content-type": "application/json", cookie: editor.cookie },
  body: JSON.stringify({ heading: "Should fail" })
});
if (missingCsrf.status !== 403) throw new Error("Mutation without CSRF token was accepted.");

const malicious = "<img src=x onerror=alert(1)>";
const textUpdate = await authenticated("/api/draft", editor, {
  method: "PATCH",
  body: JSON.stringify({ heading: malicious })
});
const textState = await textUpdate.json();
if (textState.draft.heading !== malicious) throw new Error("Plain-text content was unexpectedly transformed.");

const admin = await signIn("thomgriggs@gmail.com", process.env.PAGECRAFT_ADMIN_PASSWORD || "admin-demo");
const publish = await authenticated("/api/publish", admin, { method: "POST", body: "{}" });
if (publish.status !== 200) throw new Error(`Admin publish failed: ${publish.status}`);
const published = await publish.json();
if (published.published.heading !== malicious || published.history.length < 2) {
  throw new Error("Published content or history did not match the canonical draft.");
}

const restoreDraft = await authenticated("/api/draft", admin, {
  method: "PATCH",
  body: JSON.stringify({ heading: originalPublic.published.heading })
});
if (restoreDraft.status !== 200) throw new Error("Smoke test could not restore its original content.");

const restorePublish = await authenticated("/api/publish", admin, { method: "POST", body: "{}" });
if (restorePublish.status !== 200) throw new Error("Smoke test could not republish the original content.");

console.log("Smoke check passed: static app, authentication, roles, CSRF, shared draft, publish, and history.");
