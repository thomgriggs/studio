const API_BASE = new URL(".", import.meta.url).pathname.replace(/\/$/, "");
document.querySelectorAll(".site-logo").forEach((link) => { link.href = `${API_BASE}/`; });

// Decide which container (home vs. a secondary page) to show immediately,
// synchronously, before any data has loaded. Both #site-preview and
// #generic-page exist in the static HTML; without this, navigating to a
// page briefly flashes the *other* page's content until the async fetch
// to /api/public resolves and renderPublicRoute() corrects it.
{
  const isHome = !currentPageSlug();
  const earlySitePreview = document.querySelector("#site-preview");
  const earlyGenericPage = document.querySelector("#generic-page");
  if (earlySitePreview) earlySitePreview.hidden = !isHome;
  if (earlyGenericPage) earlyGenericPage.hidden = isHome;
}

// Safety net for our custom drag-and-drop (menus, form fields): every
// individual drop zone already calls preventDefault, but a drag that ends
// anywhere else (e.g. an accidental drag started while interacting with a
// datalist suggestion) falls through to the browser's default action, which
// for link-like text is to navigate to it. Block that globally.
document.addEventListener("dragover", (event) => event.preventDefault());
document.addEventListener("drop", (event) => event.preventDefault());

const SECRET_CODE = "pagecraft";
const LANGUAGE_CHOICES = [
  ["es", "Spanish"], ["fr", "French"], ["de", "German"], ["it", "Italian"],
  ["pt", "Portuguese"], ["pt-br", "Portuguese (Brazil)"], ["nl", "Dutch"],
  ["sv", "Swedish"], ["no", "Norwegian"], ["da", "Danish"], ["fi", "Finnish"],
  ["pl", "Polish"], ["cs", "Czech"], ["ro", "Romanian"], ["el", "Greek"],
  ["ru", "Russian"], ["uk", "Ukrainian"], ["tr", "Turkish"], ["ar", "Arabic"],
  ["he", "Hebrew"], ["hi", "Hindi"], ["th", "Thai"], ["vi", "Vietnamese"],
  ["id", "Indonesian"], ["ja", "Japanese"], ["ko", "Korean"],
  ["zh", "Chinese (Simplified)"], ["zh-tw", "Chinese (Traditional)"]
];
const loginDialog = document.querySelector("#login-dialog");
const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");
const preview = document.querySelector("#site-preview");
const toolbar = document.querySelector("#edit-toolbar");
const fullEditor = document.querySelector("#full-editor");
const contentForm = document.querySelector("#content-form");
const seoForm = document.querySelector("#seo-form");
const metaDescription = document.querySelector("#meta-description");
const tabContentButton = document.querySelector("#tab-content");
const tabSeoButton = document.querySelector("#tab-seo");
const tabPanelContent = document.querySelector("#tab-panel-content");
const tabPanelSeo = document.querySelector("#tab-panel-seo");
const settingsForm = document.querySelector("#settings-form");
const sectionPagesButton = document.querySelector("#section-pages");
const sectionNavigationButton = document.querySelector("#section-navigation");
const sectionSettingsButton = document.querySelector("#section-settings");
const sectionMediaButton = document.querySelector("#section-media");
const pagesWorkspace = document.querySelector("#pages-workspace");
const navigationWorkspace = document.querySelector("#navigation-workspace");
const settingsWorkspace = document.querySelector("#settings-workspace");
const mediaWorkspace = document.querySelector("#media-workspace");
const mediaGrid = document.querySelector("#media-grid");
const mediaUploadInput = document.querySelector("#media-upload-input");
const mediaMessage = document.querySelector("#media-message");
const heroArt = document.querySelector("#hero-art");
const siteNav = document.querySelector("#site-nav");
const sitePreview = document.querySelector("#site-preview");
const genericPage = document.querySelector("#generic-page");
const genericPageHeading = document.querySelector("#generic-page-heading");
const genericPageIntro = document.querySelector("#generic-page-intro");
const genericPageBodySection = document.querySelector("#generic-page-body-section");
const genericPageBody = document.querySelector("#generic-page-body");
const genericPageRoomsSection = document.querySelector("#generic-page-rooms-section");
const genericRoomGrid = document.querySelector("#generic-room-grid");
const genericPageDiningSection = document.querySelector("#generic-page-dining-section");
const genericDishGrid = document.querySelector("#generic-dish-grid");
const genericPageContactSection = document.querySelector("#generic-page-contact-section");
const genericContactForm = document.querySelector("#generic-contact-form");
const genericContactMessage = document.querySelector("#generic-contact-message");
const genericPageNotFound = document.querySelector("#generic-page-not-found");
const pagesWorkspaceTitle = document.querySelector("#pages-workspace-title");
const pagesWorkspaceIntro = document.querySelector("#pages-workspace-intro");
const pageList = document.querySelector("#page-list");
const pageListHomeButton = document.querySelector("#page-list-home");
const newPageButton = document.querySelector("#new-page-button");
const homePageEditor = document.querySelector("#home-page-editor");
const secondaryPageEditor = document.querySelector("#secondary-page-editor");
const pageTitleInput = document.querySelector("#page-title-input");
const pagePublishButton = document.querySelector("#page-publish-button");
const pageDeleteButton = document.querySelector("#page-delete-button");
const pageMessage = document.querySelector("#page-message");
const pageKindNote = document.querySelector("#page-kind-note");
const pageContentForm = document.querySelector("#page-content-form");
const menuListElement = document.querySelector("#menu-list");
const newMenuButton = document.querySelector("#new-menu-button");
const menuMessage = document.querySelector("#menu-message");
const menuEmpty = document.querySelector("#menu-empty");
const menuEditorBody = document.querySelector("#menu-editor-body");
const menuNameInput = document.querySelector("#menu-name-input");
const menuPublishButton = document.querySelector("#menu-publish-button");
const menuDeleteButton = document.querySelector("#menu-delete-button");
const menuTree = document.querySelector("#menu-tree");
const menuLinkSuggestions = document.querySelector("#menu-link-suggestions");
const addMenuItemButton = document.querySelector("#add-menu-item-button");
const sectionFormsButton = document.querySelector("#section-forms");
const formsWorkspace = document.querySelector("#forms-workspace");
const formListElement = document.querySelector("#form-list");
const newFormButton = document.querySelector("#new-form-button");
const formMessage = document.querySelector("#form-message");
const formEmpty = document.querySelector("#form-empty");
const formEditorBody = document.querySelector("#form-editor-body");
const formNameInput = document.querySelector("#form-name-input");
const formCsvLink = document.querySelector("#form-csv-link");
const formDeleteButton = document.querySelector("#form-delete-button");
const formTabFields = document.querySelector("#form-tab-fields");
const formTabSubmissions = document.querySelector("#form-tab-submissions");
const formPanelFields = document.querySelector("#form-panel-fields");
const formPanelSubmissions = document.querySelector("#form-panel-submissions");
const formFieldList = document.querySelector("#form-field-list");
const addFormFieldButton = document.querySelector("#add-form-field-button");
const submissionListElement = document.querySelector("#submission-list");
const contactSection = document.querySelector("#contact");
const contactHeading = document.querySelector("#contact-heading");
const publicContactForm = document.querySelector("#public-contact-form");
const publicContactMessage = document.querySelector("#public-contact-message");
const tabTranslationsButton = document.querySelector("#tab-translations");
const tabPanelTranslations = document.querySelector("#tab-panel-translations");
const translationForm = document.querySelector("#translation-form");
const translationPublishButton = document.querySelector("#translation-publish-button");
const languageSwitch = document.querySelector("#language-switch");
const localeTabs = document.querySelector("#locale-tabs");
const addLocaleButton = document.querySelector("#add-locale-button");
const localePickerSelect = document.querySelector("#locale-picker-select");
const removeLocaleButton = document.querySelector("#remove-locale-button");
const translationEditor = document.querySelector("#translation-editor");
const translationEmpty = document.querySelector("#translation-empty");
const translationLocaleLabel = document.querySelector("#translation-locale-label");
const translationCompareLabel = document.querySelector("#translation-compare-label");
const translationMessage = document.querySelector("#translation-message");
const historyList = document.querySelector("#history-list");
const saveStatus = document.querySelector("#save-status");
const publishButton = document.querySelector("#publish-button");
const modeButton = document.querySelector("#mode-button");
const previewButton = document.querySelector("#preview-button");
const fullEditButton = document.querySelector("#full-edit-button");
const roleBadge = document.querySelector("#role-badge");
const secretStatus = document.querySelector("#secret-status");
const roomGrid = document.querySelector("#room-grid");
const entryList = document.querySelector("#entry-list");
const entryForm = document.querySelector("#entry-form");
const entryFields = document.querySelector("#entry-fields");
const entryEmpty = document.querySelector("#entry-empty");
const newEntryButton = document.querySelector("#new-entry-button");

let session = null;
let state = null;
let publicContent = null;
let publicRooms = [];
let contentLibrary = null;
let activeTypeId = "room";
let activeEntryId = null;
let showingPublished = false;
let outlinesVisible = true;
let secretBuffer = "";
let saveTimer = null;
let mediaList = [];
let publicHeroImageUrl = null;
let menus = [];
let publicMenus = [];
let activeMenuId = null;
let draggingMenuId = null;
let draggingItemPath = null;
let menuSaveTimer = null;
let forms = [];
let publicForm = null;
let activeFormId = null;
let formSaveTimer = null;
let draggingFieldIndex = null;
let locales = [];
let publicLocales = [];
let translations = {};
let publicTranslations = {};
let activeLocale = "en";
let activeTranslationLocale = null;
let translationSaveTimer = null;
let publicPages = [];
let publicDishes = [];
let pages = [];
let activePageView = "home";
let activePageId = null;
let pageSaveTimer = null;
let activeViewedPageId = null;
let inlinePageSaveTimer = null;

async function request(path, options = {}) {
  const headers = { "content-type": "application/json", ...(options.headers || {}) };
  if (session?.csrf && options.method && options.method !== "GET") headers["x-csrf-token"] = session.csrf;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Request failed.");
  return body;
}

function buildNavTree(items, isRoot) {
  const list = document.createElement("ul");
  list.className = isRoot ? "site-nav-list" : "site-nav-submenu";
  items.forEach((item) => {
    const li = document.createElement("li");
    if (isRoot) li.className = "site-nav-item";
    const link = document.createElement("a");
    link.href = item.href || "#";
    link.textContent = item.label;
    li.append(link);
    if (item.children?.length) li.append(buildNavTree(item.children, false));
    list.append(li);
  });
  return list;
}

function renderSiteNav() {
  if (!siteNav) return;
  const items = session
    ? (showingPublished ? menus[0]?.published : menus[0]?.draft) || []
    : publicMenus[0]?.items || [];
  siteNav.replaceChildren(buildNavTree(items, true));
}

function buildPublicField(field) {
  const label = document.createElement("label");
  label.classList.add(field.width === "half" ? "field-half" : "field-full");
  let input;
  if (field.type === "textarea") {
    input = document.createElement("textarea");
  } else if (field.type === "select") {
    input = document.createElement("select");
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "Choose one…";
    input.append(blank);
    field.options.forEach((option) => {
      const choice = document.createElement("option");
      choice.value = option;
      choice.textContent = option;
      input.append(choice);
    });
  } else if (field.type === "checkbox") {
    input = document.createElement("input");
    input.type = "checkbox";
  } else {
    input = document.createElement("input");
    input.type = field.type === "email" ? "email" : "text";
  }
  input.name = field.id;
  if (field.required && field.type !== "checkbox") input.required = true;

  if (field.type === "checkbox") {
    label.className = "checkbox-field";
    label.append(input, document.createTextNode(field.label));
  } else {
    label.append(field.label, input);
  }
  return label;
}

function renderContactFormInto(formElement) {
  formElement.replaceChildren();
  if (!publicForm || !publicForm.fields?.length) return false;
  publicForm.fields.forEach((field) => formElement.append(buildPublicField(field)));
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Send";
  submit.className = "field-full";
  formElement.append(submit);
  return true;
}

function renderPublicContactForm() {
  if (!contactSection) return;
  const hasFields = Boolean(publicForm?.fields?.length);
  contactSection.hidden = !hasFields;
  if (!hasFields) return;
  contactHeading.textContent = publicForm.name;
  renderContactFormInto(publicContactForm);
}

async function submitContactForm(event, formElement, messageElement) {
  event.preventDefault();
  if (!publicForm) return;
  messageElement.className = "public-form-message";
  messageElement.textContent = "Sending…";
  const formData = new FormData(formElement);
  const data = {};
  publicForm.fields.forEach((field) => {
    data[field.id] = field.type === "checkbox" ? formElement.elements[field.id].checked : formData.get(field.id) || "";
  });
  try {
    const response = await fetch(`${API_BASE}/api/forms/${publicForm.id}/submit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data)
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Could not send your message.");
    messageElement.className = "public-form-message success";
    messageElement.textContent = "Thank you — we’ll be in touch.";
    formElement.reset();
  } catch (error) {
    messageElement.className = "public-form-message error";
    messageElement.textContent = error.message;
  }
}

function resolveHeroImageUrl(content) {
  if (!content?.heroImageId) return null;
  if (session) return mediaList.find((item) => item.id === content.heroImageId)?.url || null;
  return publicHeroImageUrl;
}

function contentForView() {
  if (!state) return publicContent;
  return showingPublished ? state.published : state.draft;
}

function localizedContent(base) {
  if (!base || activeLocale === "en") return base;
  const overrides = session
    ? (showingPublished ? translations[activeLocale]?.published : translations[activeLocale]?.draft)
    : publicTranslations[activeLocale];
  if (!overrides) return base;
  const merged = { ...base };
  Object.entries(overrides).forEach(([field, value]) => { if (value) merged[field] = value; });
  return merged;
}

function renderSite() {
  const content = localizedContent(contentForView());
  if (!content) return;
  document.querySelectorAll("[data-field]").forEach((element) => {
    const field = element.dataset.field;
    if (document.activeElement !== element || element.contentEditable !== "true") {
      element.textContent = content[field] || "";
    }
    if (state?.fields[field]) element.dataset.label = state.fields[field].label;
    element.tabIndex = session && outlinesVisible && !showingPublished ? 0 : -1;
  });
  preview.classList.toggle("edit-active", Boolean(session && outlinesVisible && !showingPublished));
  renderSiteNav();
  const heroUrl = resolveHeroImageUrl(content);
  if (heroArt) {
    heroArt.classList.toggle("has-photo", Boolean(heroUrl));
    heroArt.style.backgroundImage = heroUrl ? `url("${heroUrl}")` : "";
  }
  if (content.seoTitle) document.title = content.seoTitle;
  if (content.seoDescription) metaDescription.setAttribute("content", content.seoDescription);
  if (state) {
    publishButton.disabled = session.role !== "admin" || !state.dirty;
    publishButton.title = session.role === "admin" ? "Publish the current draft" : "Only administrators can publish";
  }
  renderRoomsInto(roomGrid, publicRooms);
  renderPublicRoute();
}

function renderRoomsInto(container, rooms) {
  container.replaceChildren();
  rooms.filter((room) => room.available !== false).forEach((room, index) => {
    const card = document.createElement("article");
    const art = document.createElement("div");
    art.className = `room-art room-art-${["one", "two", "three"][index % 3]}`;
    art.setAttribute("role", "img");
    art.setAttribute("aria-label", `${room.name} visual`);
    const heading = document.createElement("h3");
    heading.textContent = room.name;
    const description = document.createElement("p");
    description.textContent = room.occupancy ? `${room.description} · Up to ${room.occupancy} guests` : room.description;
    card.append(art, heading, description);
    container.append(card);
  });
}

function renderDishesInto(container, dishes) {
  container.replaceChildren();
  dishes.filter((dish) => dish.available !== false).forEach((dish) => {
    const card = document.createElement("article");
    card.className = "dish-card";
    const copy = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = dish.name;
    const description = document.createElement("p");
    description.textContent = dish.menuSection ? `${dish.description} · ${dish.menuSection}` : dish.description;
    copy.append(heading, description);
    card.append(copy);
    if (dish.price != null) {
      const price = document.createElement("span");
      price.className = "dish-price";
      price.textContent = `$${Number(dish.price).toFixed(2)}`;
      card.append(price);
    }
    container.append(card);
  });
}

function currentPageSlug() {
  let pathname = window.location.pathname;
  if (API_BASE && pathname.startsWith(API_BASE)) pathname = pathname.slice(API_BASE.length);
  return pathname.replace(/^\/|\/$/g, "");
}

function pageById(id) {
  return pages.find((page) => page.id === id) || null;
}

function resolvedPageForRoute(slug) {
  if (session) {
    const page = pages.find((entry) => entry.slug === slug);
    if (!page) return null;
    const content = (showingPublished ? page.published : page.draft) || {};
    return { id: page.id, slug: page.slug, title: page.title, kind: page.kind, content };
  }
  const page = publicPages.find((entry) => entry.slug === slug);
  if (!page) return null;
  return { id: null, slug: page.slug, title: page.title, kind: page.kind, content: page.content };
}

function renderPublicRoute() {
  if (!genericPage) return;
  const slug = currentPageSlug();
  if (!slug) {
    sitePreview.hidden = false;
    genericPage.hidden = true;
    activeViewedPageId = null;
    return;
  }
  sitePreview.hidden = true;
  genericPage.hidden = false;
  const resolved = resolvedPageForRoute(slug);
  activeViewedPageId = resolved?.id ?? null;

  genericPageNotFound.hidden = Boolean(resolved);
  genericPageBodySection.hidden = true;
  genericPageRoomsSection.hidden = true;
  genericPageDiningSection.hidden = true;
  genericPageContactSection.hidden = true;
  const editing = Boolean(session && outlinesVisible && !showingPublished && activeViewedPageId);
  genericPage.classList.toggle("edit-active", editing);
  if (!resolved) return;

  const content = resolved.content;
  document.title = content.seoTitle || resolved.title;
  if (content.seoDescription) metaDescription.setAttribute("content", content.seoDescription);

  const pageFieldLabels = { heading: "Heading", intro: "Intro", body: "Body" };
  [genericPageHeading, genericPageIntro, genericPageBody].forEach((element) => {
    const field = element.dataset.pageField;
    if (document.activeElement !== element || element.contentEditable !== "true") {
      element.textContent = content[field] || "";
    }
    element.dataset.label = pageFieldLabels[field];
    element.tabIndex = editing ? 0 : -1;
  });

  genericPageBodySection.hidden = !(content.body || editing);
  if (resolved.kind === "rooms") {
    genericPageRoomsSection.hidden = false;
    renderRoomsInto(genericRoomGrid, publicRooms);
  }
  if (resolved.kind === "dining") {
    genericPageDiningSection.hidden = false;
    renderDishesInto(genericDishGrid, publicDishes);
  }
  if (resolved.kind === "form") {
    const hasFields = renderContactFormInto(genericContactForm);
    genericPageContactSection.hidden = !hasFields;
  }
}

async function loadContentLibrary(preferredId = activeEntryId) {
  contentLibrary = await request("/api/content");
  const visible = entriesForActiveType();
  activeEntryId = visible.some((entry) => entry.id === preferredId) ? preferredId : visible[0]?.id || null;
  renderContentLibrary();
}

function entriesForActiveType() {
  return contentLibrary?.entries.filter((entry) => entry.typeId === activeTypeId) || [];
}

function activeEntry() {
  return contentLibrary?.entries.find((entry) => entry.id === activeEntryId) || null;
}

function renderContentLibrary() {
  if (!contentLibrary) return;
  const type = contentLibrary.types[activeTypeId];
  newEntryButton.textContent = `Add ${type.name.toLowerCase()}`;
  entryList.replaceChildren();
  entriesForActiveType().forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-current", String(entry.id === activeEntryId));
    const title = document.createElement("strong");
    title.textContent = entry.draft[type.titleField] || `Untitled ${type.name.toLowerCase()}`;
    const status = document.createElement("span");
    status.className = `status-badge ${entry.status}`;
    status.textContent = entry.status;
    const updated = document.createElement("small");
    updated.textContent = `Updated ${new Date(entry.updatedAt).toLocaleDateString()}`;
    button.append(title, status, updated);
    button.addEventListener("click", () => { activeEntryId = entry.id; renderContentLibrary(); });
    entryList.append(button);
  });
  renderEntryForm();
}

function renderEntryForm() {
  if (!contentLibrary) return;
  const type = contentLibrary.types[activeTypeId];
  const entry = activeEntry();
  const isNew = activeEntryId === "new";
  entryEmpty.hidden = Boolean(entry || isNew);
  entryFields.hidden = !entry && !isNew;
  entryFields.replaceChildren();
  if (!entry && !isNew) return;

  const heading = document.createElement("h4");
  heading.textContent = isNew ? `New ${type.name.toLowerCase()}` : entry.draft[type.titleField];
  entryFields.append(heading);
  Object.entries(type.fields).forEach(([fieldId, definition]) => {
    const value = entry?.draft[fieldId];
    const label = document.createElement("label");
    label.textContent = definition.label;
    let input;
    if (definition.type === "textarea") input = document.createElement("textarea");
    else if (definition.type === "select") {
      input = document.createElement("select");
      definition.options.forEach((option) => {
        const choice = document.createElement("option");
        choice.value = option;
        choice.textContent = option;
        input.append(choice);
      });
    } else {
      input = document.createElement("input");
      input.type = definition.type === "list" ? "text" : definition.type;
    }
    input.name = fieldId;
    if (definition.required) input.required = true;
    if (definition.maxLength) input.maxLength = definition.maxLength;
    if (definition.min != null) input.min = definition.min;
    if (definition.max != null) input.max = definition.max;
    if (definition.step != null) input.step = definition.step;
    if (definition.type === "boolean") {
      input.checked = isNew ? true : Boolean(value);
      label.className = "checkbox-field";
      label.prepend(input);
    } else {
      input.value = definition.type === "list" ? (value || []).join(", ") : value ?? "";
      label.append(input);
    }
    if (definition.help) {
      const help = document.createElement("span");
      help.className = "field-help";
      help.textContent = definition.help;
      label.append(help);
    }
    entryFields.append(label);
  });
  const actions = document.createElement("div");
  actions.className = "entry-actions";
  const save = document.createElement("button");
  save.type = "submit";
  save.className = "primary";
  save.textContent = "Save draft";
  actions.append(save);
  if (!isNew) {
    const duplicate = document.createElement("button");
    duplicate.type = "button";
    duplicate.textContent = "Duplicate";
    duplicate.addEventListener("click", duplicateActiveEntry);
    const publish = document.createElement("button");
    publish.type = "button";
    publish.textContent = entry.status === "published" ? "Published" : "Publish";
    publish.disabled = session.role !== "admin" || entry.status === "published";
    publish.title = session.role === "admin" ? "Publish this entry" : "Only administrators can publish";
    publish.addEventListener("click", publishActiveEntry);
    actions.append(duplicate, publish);
  }
  const message = document.createElement("p");
  message.className = "entry-message";
  message.id = "entry-message";
  message.setAttribute("aria-live", "polite");
  entryFields.append(actions, message);
}

function entryDataFromForm() {
  const type = contentLibrary.types[activeTypeId];
  const data = {};
  const formData = new FormData(entryForm);
  Object.entries(type.fields).forEach(([fieldId, definition]) => {
    if (definition.type === "boolean") data[fieldId] = entryForm.elements[fieldId].checked;
    else if (definition.type === "number") data[fieldId] = Number(formData.get(fieldId));
    else if (definition.type === "list") data[fieldId] = String(formData.get(fieldId) || "").split(",").map((item) => item.trim()).filter(Boolean);
    else data[fieldId] = formData.get(fieldId);
  });
  return data;
}

async function duplicateActiveEntry() {
  const message = document.querySelector("#entry-message");
  try {
    message.textContent = "Duplicating…";
    const duplicate = await request(`/api/entries/${activeEntryId}/duplicate`, { method: "POST", body: "{}" });
    await loadContentLibrary(duplicate.id);
  } catch (error) { message.textContent = error.message; }
}

async function publishActiveEntry() {
  const message = document.querySelector("#entry-message");
  try {
    message.textContent = "Publishing…";
    await request(`/api/entries/${activeEntryId}/publish`, { method: "POST", body: "{}" });
    const publicState = await request("/api/public");
    publicRooms = publicState.rooms;
    renderRoomsInto(roomGrid, publicRooms);
    await loadContentLibrary(activeEntryId);
  } catch (error) { message.textContent = error.message; }
}

function buildFieldLabel(field, definition) {
  const label = document.createElement("label");
  label.textContent = definition.label;
  const input = document.createElement("textarea");
  input.name = field;
  input.value = state.draft[field];
  input.maxLength = definition.maxLength;
  input.addEventListener("input", () => {
    label.querySelector("[data-count]").textContent = `${input.value.length}/${definition.maxLength}`;
    queueSave(field, input.value);
  });
  const meta = document.createElement("span");
  meta.className = "field-meta";
  const path = document.createElement("span");
  path.textContent = field;
  const count = document.createElement("span");
  count.dataset.count = "";
  count.textContent = `${input.value.length}/${definition.maxLength}`;
  meta.append(path, count);
  label.append(input, meta);
  if (definition.help) {
    const help = document.createElement("span");
    help.className = "field-help";
    help.textContent = definition.help;
    label.append(help);
  }
  return label;
}

function renderForm() {
  if (!state) return;
  contentForm.replaceChildren();
  seoForm.replaceChildren();
  settingsForm.replaceChildren();
  const sections = {
    Hero: ["eyebrow", "heading", "introduction", "heroButtonLabel"],
    Story: ["storyEyebrow", "storyTitle", "storyText"],
    "Rooms listing": ["roomsEyebrow", "roomsTitle"],
    Offer: ["offerKicker", "offerTitle", "offerText", "offerLinkLabel"],
    Contact: ["contactKicker"]
  };
  const containers = {};
  Object.keys(sections).forEach((sectionName) => {
    const section = document.createElement("section");
    section.className = "page-section";
    const heading = document.createElement("div");
    heading.className = "section-editor-heading compact";
    const copy = document.createElement("div");
    const kind = document.createElement("p");
    kind.className = "section-kind";
    kind.textContent = "Page section";
    const title = document.createElement("h3");
    title.textContent = sectionName;
    copy.append(kind, title);
    heading.append(copy);
    const fields = document.createElement("div");
    fields.className = "section-fields";
    section.append(heading, fields);
    contentForm.append(section);
    containers[sectionName] = fields;
  });
  for (const [field, definition] of Object.entries(state.fields)) {
    if (definition.managedInMedia) continue;
    if (definition.section === "SEO") {
      seoForm.append(buildFieldLabel(field, definition));
      continue;
    }
    if (definition.section === "Settings") {
      settingsForm.append(buildFieldLabel(field, definition));
      continue;
    }
    const sectionName = Object.entries(sections).find(([, fields]) => fields.includes(field))?.[0] || "Hero";
    containers[sectionName].append(buildFieldLabel(field, definition));
  }
}

function setCurrent(activeButton, ...buttons) {
  buttons.forEach((button) => button.removeAttribute("aria-current"));
  activeButton.setAttribute("aria-current", "page");
}

function switchSection(section) {
  pagesWorkspace.hidden = section !== "pages";
  navigationWorkspace.hidden = section !== "navigation";
  mediaWorkspace.hidden = section !== "media";
  formsWorkspace.hidden = section !== "forms";
  settingsWorkspace.hidden = section !== "settings";
  const buttons = { pages: sectionPagesButton, navigation: sectionNavigationButton, media: sectionMediaButton, forms: sectionFormsButton, settings: sectionSettingsButton };
  setCurrent(buttons[section], ...Object.values(buttons));
}

function switchTab(tab) {
  tabPanelContent.hidden = tab !== "content";
  tabPanelSeo.hidden = tab !== "seo";
  tabPanelTranslations.hidden = tab !== "translations";
  const buttons = { content: tabContentButton, seo: tabSeoButton, translations: tabTranslationsButton };
  setCurrent(buttons[tab], ...Object.values(buttons));
}

function renderTranslationManager() {
  if (!localeTabs) return;
  activeTranslationLocale = locales.some((locale) => locale.code === activeTranslationLocale)
    ? activeTranslationLocale
    : locales[0]?.code ?? null;
  renderLocaleTabs();
  renderTranslationEditor();
  renderLocalePicker();
}

function renderLocalePicker() {
  if (!localePickerSelect) return;
  const usedCodes = new Set(locales.map((locale) => locale.code));
  const available = LANGUAGE_CHOICES.filter(([code]) => !usedCodes.has(code));
  localePickerSelect.replaceChildren();
  available.forEach(([code, name]) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = name;
    localePickerSelect.append(option);
  });
  const custom = document.createElement("option");
  custom.value = "__custom__";
  custom.textContent = "Other language…";
  localePickerSelect.append(custom);
}

function renderLocaleTabs() {
  localeTabs.replaceChildren();
  locales.forEach((locale) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "tab");
    button.setAttribute("aria-current", String(locale.code === activeTranslationLocale));
    button.textContent = locale.name;
    button.addEventListener("click", () => { activeTranslationLocale = locale.code; renderLocaleTabs(); renderTranslationEditor(); });
    localeTabs.append(button);
  });
}

function renderTranslationEditor() {
  const locale = activeTranslationLocale ? translations[activeTranslationLocale] : null;
  translationEmpty.hidden = Boolean(locale);
  translationEditor.hidden = !locale;
  if (!locale) return;

  const localeMeta = locales.find((entry) => entry.code === activeTranslationLocale);
  translationLocaleLabel.textContent = localeMeta?.name || activeTranslationLocale;
  translationCompareLabel.textContent = `${localeMeta?.name || activeTranslationLocale} (override)`;
  translationPublishButton.disabled = session.role !== "admin" || !locale.dirty;
  translationPublishButton.title = session.role === "admin" ? "Publish this translation" : "Only administrators can publish";
  removeLocaleButton.disabled = session.role !== "admin";
  removeLocaleButton.title = session.role === "admin" ? "Remove this language" : "Only administrators can remove languages";

  translationForm.replaceChildren();
  const nonContentSections = new Set(["SEO", "Settings"]);
  Object.entries(state.fields).forEach(([field, definition]) => {
    if (definition.managedInMedia) return;
    const excluded = nonContentSections.has(definition.section) && !definition.translatable;
    if (excluded) return;
    translationForm.append(buildTranslationRow(field, definition, locale));
  });
}

function buildTranslationRow(field, definition, locale) {
  const row = document.createElement("div");
  row.className = "translation-row";

  const fieldLabel = document.createElement("p");
  fieldLabel.className = "field-label";
  fieldLabel.textContent = definition.label;
  row.append(fieldLabel);

  const source = document.createElement("div");
  source.className = "translation-source";
  source.textContent = state.draft[field] || "";
  row.append(source);

  const input = document.createElement("textarea");
  input.name = field;
  input.value = locale.draft[field] || "";
  input.maxLength = definition.maxLength;
  input.placeholder = "Not yet translated — falls back to English";
  input.classList.toggle("is-override", Boolean(locale.draft[field]));
  input.setAttribute("aria-label", `${definition.label} translation`);
  input.addEventListener("input", () => {
    input.classList.toggle("is-override", Boolean(input.value.trim()));
    queueTranslationSave(field, input.value);
  });
  row.append(input);

  return row;
}

function queueTranslationSave(field, value) {
  const locale = activeTranslationLocale;
  if (!locale) return;
  window.clearTimeout(translationSaveTimer);
  translationSaveTimer = window.setTimeout(async () => {
    try {
      translations[locale] = await request(`/api/translations/${locale}`, { method: "PATCH", body: JSON.stringify({ [field]: value }) });
      if (locale === activeTranslationLocale) {
        translationPublishButton.disabled = session.role !== "admin" || !translations[locale].dirty;
      }
    } catch (error) { translationMessage.textContent = error.message; }
  }, 450);
}

function renderLanguageSwitch() {
  if (!languageSwitch) return;
  const available = session ? locales : publicLocales;
  languageSwitch.hidden = available.length === 0;
  languageSwitch.replaceChildren();

  const enButton = document.createElement("button");
  enButton.type = "button";
  enButton.textContent = "EN";
  enButton.setAttribute("aria-pressed", String(activeLocale === "en"));
  enButton.addEventListener("click", () => { activeLocale = "en"; renderLanguageSwitch(); renderSite(); });
  languageSwitch.append(enButton);

  available.forEach((locale) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = locale.code.toUpperCase();
    button.title = locale.name;
    button.setAttribute("aria-pressed", String(activeLocale === locale.code));
    button.addEventListener("click", () => { activeLocale = locale.code; renderLanguageSwitch(); renderSite(); });
    languageSwitch.append(button);
  });
}

function renderHistory() {
  if (!state) return;
  historyList.replaceChildren();
  state.history.forEach((revision) => {
    const row = document.createElement("div");
    row.className = "revision";
    const label = document.createElement("span");
    label.textContent = `Revision ${revision.id} · ${new Date(revision.createdAt).toLocaleString()}`;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Restore to draft";
    button.disabled = session.role !== "admin";
    button.addEventListener("click", async () => {
      try {
        state = { ...state, ...(await request("/api/restore", { method: "POST", body: JSON.stringify({ revisionId: revision.id }) })) };
        saveStatus.textContent = `Revision ${revision.id} restored`;
        renderAuthenticated();
      } catch (error) { saveStatus.textContent = error.message; }
    });
    row.append(label, button);
    historyList.append(row);
  });
}

function activePage() {
  return pages.find((page) => page.id === activePageId) || null;
}

function renderPageManager() {
  renderPageList();
  renderPageEditor();
}

function renderPageList() {
  if (!pageList) return;
  pageList.querySelectorAll("[data-page-row]").forEach((el) => el.remove());
  pages.forEach((page) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.pageRow = "true";
    button.setAttribute("aria-current", String(activePageView === "page" && page.id === activePageId));
    const title = document.createElement("strong");
    title.textContent = page.title;
    const path = document.createElement("span");
    path.textContent = `/${page.slug}`;
    button.append(title, path);
    button.addEventListener("click", () => {
      activePageView = "page";
      activePageId = page.id;
      renderPageList();
      renderPageEditor();
    });
    pageList.append(button);
  });
  pageListHomeButton.setAttribute("aria-current", String(activePageView === "home"));
}

function renderPageEditor() {
  const isHome = activePageView === "home";
  homePageEditor.hidden = !isHome;
  secondaryPageEditor.hidden = isHome;
  pagesWorkspaceTitle.textContent = isHome ? "Home" : activePage()?.title || "";
  pagesWorkspaceIntro.textContent = isHome
    ? "Edit this page’s content, metadata, and publishing history."
    : "Edit this page’s content and publish it independently of the homepage.";
  if (isHome) return;

  const page = activePage();
  if (!page) return;
  if (document.activeElement !== pageTitleInput) pageTitleInput.value = page.title;
  pageKindNote.textContent = `/${page.slug} — ${pageKindLabels[page.kind] || page.kind}`;
  pagePublishButton.disabled = session.role !== "admin" || page.status === "published";
  pagePublishButton.title = session.role === "admin" ? "Publish this page" : "Only administrators can publish";
  pageDeleteButton.disabled = session.role !== "admin";
  pageDeleteButton.title = session.role === "admin" ? "Delete this page" : "Only administrators can delete pages";

  pageContentForm.replaceChildren();
  const fieldSpecs = [
    ["heading", "Heading", 120, "textarea"],
    ["intro", "Intro", 300, "textarea"],
    ["body", "Body", 3000, "textarea"],
    ["seoTitle", "Page title (SEO)", 70, "textarea"],
    ["seoDescription", "Meta description", 160, "textarea"]
  ];
  fieldSpecs.forEach(([field, label, maxLength]) => {
    const wrapper = document.createElement("label");
    wrapper.textContent = label;
    const input = document.createElement("textarea");
    input.name = field;
    input.value = page.draft[field] || "";
    input.maxLength = maxLength;
    input.addEventListener("input", () => queuePageContentEdit(field, input.value));
    wrapper.append(input);
    pageContentForm.append(wrapper);
  });
}

const pageKindLabels = { content: "Content page", rooms: "Rooms listing", dining: "Dining listing", form: "Contact form" };

function queuePageContentEdit(field, value) {
  const page = activePage();
  if (!page) return;
  page.draft = { ...page.draft, [field]: value };
  window.clearTimeout(pageSaveTimer);
  pageSaveTimer = window.setTimeout(async () => {
    try {
      const updated = await request(`/api/pages/${page.id}`, { method: "PATCH", body: JSON.stringify({ content: page.draft }) });
      Object.assign(page, updated);
      pagePublishButton.disabled = session.role !== "admin" || page.status === "published";
    } catch (error) { pageMessage.textContent = error.message; }
  }, 450);
}

function queuePageInlineSave(field, value) {
  const page = pageById(activeViewedPageId);
  if (!page) return;
  page.draft = { ...page.draft, [field]: value };
  saveStatus.textContent = "Unsaved changes";
  window.clearTimeout(inlinePageSaveTimer);
  inlinePageSaveTimer = window.setTimeout(async () => {
    saveStatus.textContent = "Saving…";
    try {
      const updated = await request(`/api/pages/${page.id}`, { method: "PATCH", body: JSON.stringify({ content: page.draft }) });
      Object.assign(page, updated);
      saveStatus.textContent = "Draft saved";
      renderPageList();
      if (activePageId === page.id) renderPageEditor();
    } catch (error) { saveStatus.textContent = error.message; }
  }, 450);
}

function renderAuthenticated() {
  renderSite();
  renderForm();
  renderHistory();
  renderMediaGrid();
  renderMenuManager();
  renderFormManager();
  renderTranslationManager();
  renderPageManager();
}

function activeForm() {
  return forms.find((form) => form.id === activeFormId) || null;
}

function renderFormManager() {
  renderFormList();
  renderFormEditor();
}

function renderFormList() {
  if (!formListElement) return;
  formListElement.replaceChildren();
  forms.forEach((form) => {
    const row = document.createElement("li");
    row.className = "menu-list-row";
    row.setAttribute("aria-current", String(form.id === activeFormId));

    const select = document.createElement("button");
    select.type = "button";
    select.className = "menu-select";
    select.textContent = form.name;
    select.addEventListener("click", () => { activeFormId = form.id; renderFormEditor(); renderFormList(); });
    row.append(select);

    const count = document.createElement("span");
    count.className = "status-badge";
    count.textContent = `${form.submissionCount} ${form.submissionCount === 1 ? "reply" : "replies"}`;
    row.append(count);

    formListElement.append(row);
  });
}

function renderFormEditor() {
  const form = activeForm();
  formEmpty.hidden = Boolean(form);
  formEditorBody.hidden = !form;
  if (!form) return;
  if (document.activeElement !== formNameInput) formNameInput.value = form.name;
  formDeleteButton.disabled = session.role !== "admin";
  formDeleteButton.title = session.role === "admin" ? "Delete this form" : "Only administrators can delete forms";
  formCsvLink.href = `${API_BASE}/api/forms/${form.id}/submissions.csv`;
  renderFormFieldList();
  if (!formPanelSubmissions.hidden) renderSubmissions();
}

function renderFormFieldList() {
  const form = activeForm();
  formFieldList.replaceChildren();
  if (!form) return;
  form.fields.forEach((field, index) => {
    formFieldList.append(buildFormFieldRow(field, index));
  });
}

function buildFormFieldRow(field, index) {
  const row = document.createElement("li");
  row.className = "form-field-row";
  row.draggable = true;
  row.dataset.index = String(index);

  const handle = document.createElement("span");
  handle.className = "drag-handle";
  handle.setAttribute("aria-hidden", "true");
  handle.textContent = "⠿";
  row.append(handle);

  const labelInput = document.createElement("input");
  labelInput.type = "text";
  labelInput.className = "field-label-input";
  labelInput.value = field.label;
  labelInput.setAttribute("aria-label", "Field label");
  labelInput.addEventListener("input", () => queueFormFieldEdit(index, { label: labelInput.value }));
  row.append(labelInput);

  const typeSelect = document.createElement("select");
  typeSelect.setAttribute("aria-label", "Field type");
  [["text", "Text"], ["email", "Email"], ["textarea", "Long text"], ["select", "Choice"], ["checkbox", "Checkbox"]].forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    typeSelect.append(option);
  });
  typeSelect.value = field.type;
  typeSelect.addEventListener("change", () => queueFormFieldEdit(index, { type: typeSelect.value }));
  row.append(typeSelect);

  const requiredLabel = document.createElement("label");
  requiredLabel.className = "field-required-label";
  const requiredInput = document.createElement("input");
  requiredInput.type = "checkbox";
  requiredInput.checked = Boolean(field.required);
  requiredInput.addEventListener("change", () => queueFormFieldEdit(index, { required: requiredInput.checked }));
  requiredLabel.append(requiredInput, "Required");
  row.append(requiredLabel);

  const widthSelect = document.createElement("select");
  widthSelect.setAttribute("aria-label", "Field width");
  [["full", "Full width"], ["half", "Half width (side by side)"]].forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    widthSelect.append(option);
  });
  widthSelect.value = field.width === "half" ? "half" : "full";
  widthSelect.addEventListener("change", () => queueFormFieldEdit(index, { width: widthSelect.value }));
  row.append(widthSelect);

  if (field.type === "select") {
    const optionsInput = document.createElement("input");
    optionsInput.type = "text";
    optionsInput.className = "field-options-input";
    optionsInput.placeholder = "Options, separated by commas";
    optionsInput.value = (field.options || []).join(", ");
    optionsInput.addEventListener("input", () => queueFormFieldEdit(index, { options: optionsInput.value.split(",").map((v) => v.trim()).filter(Boolean) }));
    row.append(optionsInput);
  }

  const actions = document.createElement("span");
  actions.className = "form-field-row-actions";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "danger";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => removeFormField(index));
  actions.append(remove);

  row.append(actions);

  row.addEventListener("dragstart", (event) => {
    draggingFieldIndex = index;
    event.dataTransfer.effectAllowed = "move";
  });
  row.addEventListener("dragover", (event) => {
    if (draggingFieldIndex == null || draggingFieldIndex === index) return;
    event.preventDefault();
    const before = event.offsetY < row.offsetHeight / 2;
    row.classList.toggle("drag-over-before", before);
    row.classList.toggle("drag-over-after", !before);
  });
  row.addEventListener("dragleave", () => row.classList.remove("drag-over-before", "drag-over-after"));
  row.addEventListener("drop", (event) => {
    event.preventDefault();
    const before = row.classList.contains("drag-over-before");
    row.classList.remove("drag-over-before", "drag-over-after");
    if (draggingFieldIndex == null || draggingFieldIndex === index) return;
    moveFormField(draggingFieldIndex, index, before);
    draggingFieldIndex = null;
  });
  row.addEventListener("dragend", () => {
    draggingFieldIndex = null;
    formFieldList.querySelectorAll(".drag-over-before, .drag-over-after").forEach((el) => el.classList.remove("drag-over-before", "drag-over-after"));
  });

  return row;
}

async function saveFormFields(fields) {
  const form = activeForm();
  if (!form) return;
  try {
    const updated = await request(`/api/forms/${form.id}`, { method: "PATCH", body: JSON.stringify({ fields }) });
    Object.assign(form, updated);
    renderFormFieldList();
  } catch (error) { formMessage.textContent = error.message; }
}

function queueFormFieldEdit(index, patch) {
  const form = activeForm();
  if (!form) return;
  const field = form.fields[index];
  if (!field) return;
  Object.assign(field, patch);
  if (patch.type) {
    if (field.type === "select" && !field.options?.length) field.options = ["Option 1"];
    renderFormFieldList();
  }
  window.clearTimeout(formSaveTimer);
  formSaveTimer = window.setTimeout(() => saveFormFields(form.fields), 450);
}

function moveFormField(sourceIndex, targetIndex, before) {
  const form = activeForm();
  if (!form) return;
  const [field] = form.fields.splice(sourceIndex, 1);
  let insertAt = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
  if (!before) insertAt += 1;
  form.fields.splice(insertAt, 0, field);
  renderFormFieldList();
  saveFormFields(form.fields);
}

function removeFormField(index) {
  const form = activeForm();
  if (!form) return;
  form.fields.splice(index, 1);
  saveFormFields(form.fields);
}

function addFormField() {
  const form = activeForm();
  if (!form) return;
  form.fields.push({ id: `field-${Date.now().toString(36)}`, label: "New field", type: "text", required: false });
  saveFormFields(form.fields);
}

async function renderSubmissions() {
  const form = activeForm();
  submissionListElement.replaceChildren();
  if (!form) return;
  let submissions;
  try {
    submissions = await request(`/api/forms/${form.id}/submissions`);
  } catch (error) {
    formMessage.textContent = error.message;
    return;
  }
  if (!submissions.length) {
    const empty = document.createElement("p");
    empty.className = "menu-empty";
    empty.textContent = "No submissions yet.";
    submissionListElement.append(empty);
    return;
  }
  submissions.forEach((submission) => {
    const row = document.createElement("article");
    row.className = "submission-row";
    const time = document.createElement("time");
    time.textContent = new Date(submission.createdAt).toLocaleString();
    row.append(time);
    const dl = document.createElement("dl");
    form.fields.forEach((field) => {
      const dt = document.createElement("dt");
      dt.textContent = field.label;
      const dd = document.createElement("dd");
      const value = submission.data[field.id];
      dd.textContent = field.type === "checkbox" ? (value ? "Yes" : "No") : (value || "—");
      dl.append(dt, dd);
    });
    row.append(dl);
    submissionListElement.append(row);
  });
}

function activeMenu() {
  return menus.find((menu) => menu.id === activeMenuId) || null;
}

function renderMenuManager() {
  renderMenuList();
  renderMenuEditor();
  renderMenuLinkSuggestions();
}

function renderMenuLinkSuggestions() {
  if (!menuLinkSuggestions) return;
  menuLinkSuggestions.replaceChildren();
  const links = [
    { path: "/", title: "Home" },
    ...pages.map((page) => ({ path: `/${page.slug}`, title: page.title }))
  ];
  links.forEach(({ path, title }) => {
    const option = document.createElement("option");
    option.value = path;
    option.label = title;
    menuLinkSuggestions.append(option);
  });
}

function renderMenuList() {
  if (!menuListElement) return;
  menuListElement.replaceChildren();
  menus.forEach((menu) => {
    const row = document.createElement("li");
    row.className = "menu-list-row";
    row.draggable = true;
    row.dataset.menuId = String(menu.id);
    row.setAttribute("aria-current", String(menu.id === activeMenuId));

    const handle = document.createElement("span");
    handle.className = "drag-handle";
    handle.setAttribute("aria-hidden", "true");
    handle.textContent = "⠿";
    row.append(handle);

    const select = document.createElement("button");
    select.type = "button";
    select.className = "menu-select";
    select.textContent = menu.name;
    select.addEventListener("click", () => { activeMenuId = menu.id; renderMenuEditor(); renderMenuList(); });
    row.append(select);

    const status = document.createElement("span");
    status.className = `status-badge ${menu.status}`;
    status.textContent = menu.status;
    row.append(status);

    row.addEventListener("dragstart", (event) => {
      draggingMenuId = menu.id;
      event.dataTransfer.effectAllowed = "move";
    });
    row.addEventListener("dragover", (event) => {
      if (draggingMenuId == null || draggingMenuId === menu.id) return;
      event.preventDefault();
      const before = event.offsetY < row.offsetHeight / 2;
      row.classList.toggle("drag-over-before", before);
      row.classList.toggle("drag-over-after", !before);
    });
    row.addEventListener("dragleave", () => row.classList.remove("drag-over-before", "drag-over-after"));
    row.addEventListener("drop", async (event) => {
      event.preventDefault();
      const before = row.classList.contains("drag-over-before");
      row.classList.remove("drag-over-before", "drag-over-after");
      if (draggingMenuId == null || draggingMenuId === menu.id) return;
      await reorderMenus(draggingMenuId, menu.id, before);
      draggingMenuId = null;
    });
    row.addEventListener("dragend", () => {
      draggingMenuId = null;
      menuListElement.querySelectorAll(".drag-over-before, .drag-over-after").forEach((el) => el.classList.remove("drag-over-before", "drag-over-after"));
    });

    menuListElement.append(row);
  });
}

async function reorderMenus(sourceId, targetId, before) {
  const order = menus.map((menu) => menu.id).filter((id) => id !== sourceId);
  const targetIndex = order.indexOf(targetId);
  order.splice(before ? targetIndex : targetIndex + 1, 0, sourceId);
  try {
    menus = await request("/api/menus/reorder", { method: "POST", body: JSON.stringify({ order }) });
    renderMenuList();
    renderSite();
  } catch (error) { menuMessage.textContent = error.message; }
}

function renderMenuEditor() {
  const menu = activeMenu();
  menuEmpty.hidden = Boolean(menu);
  menuEditorBody.hidden = !menu;
  if (!menu) return;
  if (document.activeElement !== menuNameInput) menuNameInput.value = menu.name;
  menuPublishButton.disabled = session.role !== "admin" || menu.status === "published";
  menuPublishButton.title = session.role === "admin" ? "Publish this menu" : "Only administrators can publish";
  menuDeleteButton.disabled = session.role !== "admin";
  menuDeleteButton.title = session.role === "admin" ? "Delete this menu" : "Only administrators can delete menus";
  renderMenuTree();
}

function renderMenuTree() {
  const menu = activeMenu();
  menuTree.replaceChildren();
  if (!menu) return;
  menuTree.append(buildMenuItemList(menu.draft, []));
}

function buildMenuItemList(items, path) {
  const list = document.createElement("ul");
  list.className = "menu-tree";
  items.forEach((item, index) => {
    const itemPath = [...path, index];
    const li = document.createElement("li");
    li.append(buildMenuItemRow(item, itemPath));
    li.append(buildMenuItemList(item.children, itemPath));
    list.append(li);
  });
  return list;
}

function buildMenuItemRow(item, path) {
  const row = document.createElement("div");
  row.className = "menu-item-row";
  row.draggable = true;
  row.dataset.path = path.join(".");
  row.dataset.itemId = item.id;

  const handle = document.createElement("span");
  handle.className = "drag-handle";
  handle.setAttribute("aria-hidden", "true");
  handle.textContent = "⠿";
  row.append(handle);

  const labelInput = document.createElement("input");
  labelInput.type = "text";
  labelInput.className = "menu-item-label";
  labelInput.value = item.label;
  labelInput.setAttribute("aria-label", "Item label");
  labelInput.addEventListener("input", () => queueMenuItemEdit(path, { label: labelInput.value }));
  row.append(labelInput);

  const hrefInput = document.createElement("input");
  hrefInput.type = "text";
  hrefInput.className = "menu-item-href";
  hrefInput.value = item.href;
  hrefInput.placeholder = "Pick a page, or type a link";
  hrefInput.setAttribute("list", "menu-link-suggestions");
  hrefInput.setAttribute("aria-label", "Item link");
  hrefInput.addEventListener("input", () => queueMenuItemEdit(path, { href: hrefInput.value }));
  row.append(hrefInput);

  const actions = document.createElement("span");
  actions.className = "menu-item-row-actions";

  const addChild = document.createElement("button");
  addChild.type = "button";
  addChild.textContent = "Add submenu item";
  addChild.addEventListener("click", () => addMenuItem(path));
  actions.append(addChild);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "danger";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => removeMenuItem(path));
  actions.append(remove);

  row.append(actions);

  row.addEventListener("dragstart", (event) => {
    draggingItemPath = path;
    event.stopPropagation();
    event.dataTransfer.effectAllowed = "move";
  });
  row.addEventListener("dragover", (event) => {
    if (!draggingItemPath) return;
    event.preventDefault();
    event.stopPropagation();
    row.classList.remove("drag-over-before", "drag-over-after", "drag-over-nest");
    const ratio = event.offsetY / row.offsetHeight;
    if (ratio < 0.25) row.classList.add("drag-over-before");
    else if (ratio > 0.75) row.classList.add("drag-over-after");
    else row.classList.add("drag-over-nest");
  });
  row.addEventListener("dragleave", () => row.classList.remove("drag-over-before", "drag-over-after", "drag-over-nest"));
  row.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const mode = row.classList.contains("drag-over-before") ? "before" : row.classList.contains("drag-over-after") ? "after" : "nest";
    row.classList.remove("drag-over-before", "drag-over-after", "drag-over-nest");
    if (draggingItemPath) moveMenuItem(draggingItemPath, path, mode);
    draggingItemPath = null;
  });
  row.addEventListener("dragend", () => {
    draggingItemPath = null;
    menuTree.querySelectorAll(".drag-over-before, .drag-over-after, .drag-over-nest").forEach((el) => el.classList.remove("drag-over-before", "drag-over-after", "drag-over-nest"));
  });

  return row;
}

function cloneMenuTree(menu) {
  return JSON.parse(JSON.stringify(menu.draft));
}

function findNode(tree, path) {
  let list = tree;
  let node = null;
  for (const index of path) {
    node = list[index];
    if (!node) return null;
    list = node.children;
  }
  return node;
}

function findParentList(tree, path) {
  if (path.length === 1) return tree;
  return findNode(tree, path.slice(0, -1))?.children || null;
}

async function saveMenuTree(tree) {
  const menu = activeMenu();
  if (!menu) return;
  menu.draft = tree;
  menu.status = JSON.stringify(menu.draft) === JSON.stringify(menu.published) ? "published" : "changed";
  renderMenuEditor();
  renderSite();
  try {
    const updated = await request(`/api/menus/${menu.id}`, { method: "PATCH", body: JSON.stringify({ items: tree }) });
    Object.assign(menu, updated);
    renderMenuEditor();
    renderMenuList();
    renderSite();
  } catch (error) { menuMessage.textContent = error.message; }
}

async function saveMenuTreeQuiet(tree) {
  // Used for in-place text edits (label/href): must not touch #menu-tree's DOM,
  // since rebuilding it mid-keystroke steals focus from whichever input the
  // admin is typing in. Only structural changes (add/remove/move) rebuild the tree.
  const menu = activeMenu();
  if (!menu) return;
  menu.draft = tree;
  menu.status = JSON.stringify(menu.draft) === JSON.stringify(menu.published) ? "published" : "changed";
  menuPublishButton.disabled = session.role !== "admin" || menu.status === "published";
  renderSite();
  try {
    const updated = await request(`/api/menus/${menu.id}`, { method: "PATCH", body: JSON.stringify({ items: tree }) });
    Object.assign(menu, updated);
    menuPublishButton.disabled = session.role !== "admin" || menu.status === "published";
    renderMenuList();
    renderSite();
  } catch (error) { menuMessage.textContent = error.message; }
}

function queueMenuItemEdit(path, patch) {
  const menu = activeMenu();
  if (!menu) return;
  const node = findNode(menu.draft, path);
  if (!node) return;
  Object.assign(node, patch);
  window.clearTimeout(menuSaveTimer);
  menuSaveTimer = window.setTimeout(() => saveMenuTreeQuiet(cloneMenuTree(menu)), 450);
}

async function addMenuItem(parentPath) {
  const menu = activeMenu();
  if (!menu) return;
  const newItem = { id: `item-${Date.now().toString(36)}`, label: "New item", href: "", children: [] };
  const list = parentPath ? findNode(menu.draft, parentPath)?.children : menu.draft;
  if (!list) return;
  list.push(newItem);
  await saveMenuTree(cloneMenuTree(menu));
  const row = menuTree.querySelector(`[data-item-id="${newItem.id}"]`);
  const labelInput = row?.querySelector(".menu-item-label");
  if (labelInput) {
    labelInput.focus();
    labelInput.select();
  }
}

function removeMenuItem(path) {
  const menu = activeMenu();
  if (!menu) return;
  const list = findParentList(menu.draft, path);
  if (!list) return;
  list.splice(path[path.length - 1], 1);
  saveMenuTree(cloneMenuTree(menu));
}

function isDescendantPath(ancestorPath, maybePath) {
  if (maybePath.length <= ancestorPath.length) return false;
  return ancestorPath.every((value, index) => value === maybePath[index]);
}

function moveMenuItem(sourcePath, targetPath, mode) {
  const menu = activeMenu();
  if (!menu) return;
  if (sourcePath.join(".") === targetPath.join(".")) return;
  if (isDescendantPath(sourcePath, targetPath)) return;

  const node = findNode(menu.draft, sourcePath);
  const sourceList = findParentList(menu.draft, sourcePath);
  if (!node || !sourceList) return;

  // Resolve the target by object reference before mutating, so index shifts
  // caused by removing the source from a shared list can't point us at the wrong node.
  const targetNode = findNode(menu.draft, targetPath);
  const targetParentList = mode === "nest" ? null : findParentList(menu.draft, targetPath);
  if (!targetNode || (mode !== "nest" && !targetParentList)) return;

  sourceList.splice(sourcePath[sourcePath.length - 1], 1);

  if (mode === "nest") {
    targetNode.children.push(node);
  } else {
    let insertIndex = targetParentList.indexOf(targetNode);
    if (insertIndex === -1) return;
    if (mode === "after") insertIndex += 1;
    targetParentList.splice(insertIndex, 0, node);
  }
  saveMenuTree(cloneMenuTree(menu));
}

function renderMediaGrid() {
  if (!mediaGrid) return;
  mediaGrid.replaceChildren();
  if (!mediaList.length) {
    const empty = document.createElement("p");
    empty.className = "media-empty";
    empty.textContent = "No images uploaded yet.";
    mediaGrid.append(empty);
    return;
  }
  mediaList.forEach((item) => {
    const card = document.createElement("article");
    card.className = "media-card";

    const thumb = document.createElement("img");
    thumb.className = "media-thumb";
    thumb.src = item.url;
    thumb.alt = item.altText || "";
    card.append(thumb);

    const name = document.createElement("small");
    name.textContent = item.originalName;
    card.append(name);

    const altInput = document.createElement("input");
    altInput.type = "text";
    altInput.placeholder = "Alt text (for accessibility)";
    altInput.value = item.altText || "";
    altInput.addEventListener("change", async () => {
      try {
        const updated = await request(`/api/media/${item.id}`, { method: "PATCH", body: JSON.stringify({ altText: altInput.value }) });
        item.altText = updated.altText;
      } catch (error) { mediaMessage.textContent = error.message; }
    });
    card.append(altInput);

    const actions = document.createElement("div");
    actions.className = "media-card-actions";

    const isHero = state?.draft?.heroImageId === item.id;
    const heroButton = document.createElement("button");
    heroButton.type = "button";
    heroButton.className = isHero ? "primary" : "";
    heroButton.textContent = isHero ? "Hero image" : "Use as hero image";
    heroButton.disabled = isHero;
    heroButton.addEventListener("click", () => saveField("heroImageId", item.id).then(renderMediaGrid));
    actions.append(heroButton);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger";
    deleteButton.textContent = "Delete";
    deleteButton.disabled = session.role !== "admin";
    deleteButton.title = session.role === "admin" ? "Delete this image" : "Only administrators can delete media";
    deleteButton.addEventListener("click", async () => {
      if (!window.confirm(`Delete "${item.originalName}"? This cannot be undone.`)) return;
      try {
        await request(`/api/media/${item.id}`, { method: "DELETE" });
        if (isHero) await saveField("heroImageId", "");
        mediaList = await request("/api/media");
        renderMediaGrid();
      } catch (error) { mediaMessage.textContent = error.message; }
    });
    actions.append(deleteButton);

    card.append(actions);
    mediaGrid.append(card);
  });
}

async function uploadMedia(file) {
  mediaMessage.textContent = "Uploading…";
  try {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read file."));
      reader.readAsDataURL(file);
    });
    const dataBase64 = String(dataUrl).split(",")[1] || "";
    await request("/api/media", {
      method: "POST",
      body: JSON.stringify({ filename: file.name, mimeType: file.type, dataBase64 })
    });
    mediaList = await request("/api/media");
    mediaMessage.textContent = "";
    renderMediaGrid();
  } catch (error) { mediaMessage.textContent = error.message; }
}

function openLogin() {
  if (session || loginDialog.open) return;
  loginMessage.textContent = "";
  loginDialog.showModal();
  window.setTimeout(() => loginForm.elements.username.focus(), 0);
}

function enableEditMode() {
  mediaList = state.media || [];
  menus = state.menus || [];
  activeMenuId = menus.some((menu) => menu.id === activeMenuId) ? activeMenuId : menus[0]?.id ?? null;
  forms = state.forms || [];
  activeFormId = forms.some((form) => form.id === activeFormId) ? activeFormId : forms[0]?.id ?? null;
  locales = state.locales || [];
  translations = state.translations || {};
  pages = state.pages || [];
  renderLanguageSwitch();
  toolbar.hidden = false;
  roleBadge.textContent = session.role;
  outlinesVisible = true;
  showingPublished = false;
  modeButton.textContent = "Hide outlines";
  modeButton.setAttribute("aria-pressed", "true");
  previewButton.textContent = "View published";
  previewButton.setAttribute("aria-pressed", "false");
  renderAuthenticated();
}

function queueSave(field, value) {
  window.clearTimeout(saveTimer);
  saveStatus.textContent = "Unsaved changes";
  saveTimer = window.setTimeout(() => saveField(field, value), 450);
}

async function saveField(field, value) {
  saveStatus.textContent = "Saving…";
  try {
    const next = await request("/api/draft", { method: "PATCH", body: JSON.stringify({ [field]: value }) });
    state = { ...state, ...next };
    saveStatus.textContent = "Draft saved";
    renderSite();
  } catch (error) { saveStatus.textContent = error.message; }
}

function beginInlineEdit(element) {
  if (!session || !outlinesVisible || showingPublished) return;
  if (element.dataset.pageField && !activeViewedPageId) return;
  element.contentEditable = "true";
  element.focus();
  const selection = window.getSelection();
  selection.selectAllChildren(element);
  selection.collapseToEnd();
}

function finishInlineEdit(element, save) {
  if (element.contentEditable !== "true") return;
  element.contentEditable = "false";
  if (element.dataset.pageField) {
    const field = element.dataset.pageField;
    if (save) queuePageInlineSave(field, element.textContent);
    else element.textContent = pageById(activeViewedPageId)?.draft[field] || "";
  } else {
    if (save) queueSave(element.dataset.field, element.textContent);
    else element.textContent = state.draft[element.dataset.field];
  }
  element.focus();
}

document.addEventListener("keydown", (event) => {
  if (session || loginDialog.open || event.metaKey || event.ctrlKey || event.altKey) return;
  const target = event.target;
  if (target.matches("input, textarea, select") || target.isContentEditable || event.key.length !== 1) return;
  secretBuffer = `${secretBuffer}${event.key.toLowerCase()}`.slice(-SECRET_CODE.length);
  if (SECRET_CODE.startsWith(secretBuffer)) secretStatus.textContent = "Pagecraft code detected";
  if (secretBuffer === SECRET_CODE) {
    event.preventDefault();
    secretBuffer = "";
    openLogin();
  } else if (!SECRET_CODE.startsWith(secretBuffer)) {
    secretBuffer = event.key.toLowerCase() === SECRET_CODE[0] ? SECRET_CODE[0] : "";
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "Signing in…";
  const data = new FormData(loginForm);
  try {
    session = await request("/api/login", {
      method: "POST",
      body: JSON.stringify({ username: data.get("username"), password: data.get("password") })
    });
    state = await request("/api/state");
    loginDialog.close();
    enableEditMode();
    toolbar.querySelector("button").focus();
  } catch (error) { loginMessage.textContent = error.message; }
});

document.querySelector("#login-close").addEventListener("click", () => loginDialog.close());

// Scoped to `document`, not just `#site-preview`, so header/footer chrome
// (site name, footer tagline, etc.) is inline-editable too — they live
// outside the preview article but still carry [data-field] bindings.
document.addEventListener("dblclick", (event) => {
  const element = event.target.closest("[data-field]");
  if (element) beginInlineEdit(element);
});

document.addEventListener("focusout", (event) => {
  const element = event.target.closest("[data-field]");
  if (element?.contentEditable === "true") finishInlineEdit(element, true);
});

document.addEventListener("keydown", (event) => {
  const element = event.target.closest("[data-field]");
  if (!element) return;
  if (element.contentEditable !== "true" && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    beginInlineEdit(element);
  } else if (element.contentEditable === "true" && event.key === "Escape") {
    event.preventDefault();
    finishInlineEdit(element, false);
  } else if (element.contentEditable === "true" && event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    finishInlineEdit(element, true);
  }
});

// Editable text that also happens to be a real link (hero button, offer
// link, site logo) would otherwise navigate away on the first click of a
// double-click, interrupting the edit gesture. Suppress that while editing.
document.addEventListener("click", (event) => {
  const element = event.target.closest("a[data-field], a[data-page-field]");
  if (element && session && outlinesVisible && !showingPublished) event.preventDefault();
});

genericPage.addEventListener("dblclick", (event) => {
  const element = event.target.closest("[data-page-field]");
  if (element) beginInlineEdit(element);
});

genericPage.addEventListener("focusout", (event) => {
  const element = event.target.closest("[data-page-field]");
  if (element?.contentEditable === "true") finishInlineEdit(element, true);
});

genericPage.addEventListener("keydown", (event) => {
  const element = event.target.closest("[data-page-field]");
  if (!element) return;
  if (element.contentEditable !== "true" && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    beginInlineEdit(element);
  } else if (element.contentEditable === "true" && event.key === "Escape") {
    event.preventDefault();
    finishInlineEdit(element, false);
  } else if (element.contentEditable === "true" && event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    finishInlineEdit(element, true);
  }
});

modeButton.addEventListener("click", () => {
  outlinesVisible = !outlinesVisible;
  modeButton.setAttribute("aria-pressed", String(outlinesVisible));
  modeButton.textContent = outlinesVisible ? "Hide outlines" : "Show outlines";
  renderSite();
});

previewButton.addEventListener("click", () => {
  showingPublished = !showingPublished;
  previewButton.setAttribute("aria-pressed", String(showingPublished));
  previewButton.textContent = showingPublished ? "View draft" : "View published";
  renderSite();
});

fullEditButton.addEventListener("click", () => {
  fullEditor.hidden = false;
  fullEditButton.setAttribute("aria-expanded", "true");
  document.querySelector("#editor-heading").focus();
  if (!contentLibrary) loadContentLibrary().catch((error) => { saveStatus.textContent = error.message; });
});

document.querySelector("#editor-close").addEventListener("click", () => {
  fullEditor.hidden = true;
  fullEditButton.setAttribute("aria-expanded", "false");
  fullEditButton.focus();
});

newEntryButton.addEventListener("click", () => {
  activeEntryId = "new";
  renderContentLibrary();
  entryForm.querySelector("input, textarea, select")?.focus();
});

entryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = document.querySelector("#entry-message");
  const isNew = activeEntryId === "new";
  try {
    message.textContent = "Saving…";
    const saved = await request(isNew ? "/api/entries" : `/api/entries/${activeEntryId}`, {
      method: isNew ? "POST" : "PATCH",
      body: JSON.stringify({ typeId: activeTypeId, data: entryDataFromForm() })
    });
    await loadContentLibrary(saved.id);
    document.querySelector("#entry-message").textContent = "Draft saved";
  } catch (error) { message.textContent = error.message; }
});

publishButton.addEventListener("click", async () => {
  try {
    state = { ...state, ...(await request("/api/publish", { method: "POST", body: "{}" })) };
    publicContent = state.published;
    saveStatus.textContent = "Published";
    renderAuthenticated();
  } catch (error) { saveStatus.textContent = error.message; }
});

document.querySelector("#logout-button").addEventListener("click", async () => {
  try { await request("/api/logout", { method: "POST", body: "{}" }); } catch {}
  publicContent = state?.published || publicContent;
  session = null;
  state = null;
  toolbar.hidden = true;
  fullEditor.hidden = true;
  preview.classList.remove("edit-active");
  renderSite();
});

tabContentButton.addEventListener("click", () => switchTab("content"));
tabSeoButton.addEventListener("click", () => switchTab("seo"));
tabTranslationsButton.addEventListener("click", () => switchTab("translations"));
sectionPagesButton.addEventListener("click", () => switchSection("pages"));
sectionNavigationButton.addEventListener("click", () => switchSection("navigation"));
sectionMediaButton.addEventListener("click", () => switchSection("media"));
sectionSettingsButton.addEventListener("click", () => switchSection("settings"));
mediaUploadInput.addEventListener("change", () => {
  const file = mediaUploadInput.files[0];
  mediaUploadInput.value = "";
  if (file) uploadMedia(file);
});

newMenuButton.addEventListener("click", async () => {
  const name = window.prompt("Name this menu:", `Menu ${menus.length + 1}`);
  if (!name) return;
  try {
    const created = await request("/api/menus", { method: "POST", body: JSON.stringify({ name }) });
    menus = await request("/api/menus");
    activeMenuId = created.id;
    renderMenuManager();
    renderSite();
  } catch (error) { menuMessage.textContent = error.message; }
});

menuNameInput.addEventListener("input", () => {
  const menu = activeMenu();
  if (!menu) return;
  menu.name = menuNameInput.value;
  window.clearTimeout(menuSaveTimer);
  menuSaveTimer = window.setTimeout(async () => {
    try {
      const updated = await request(`/api/menus/${menu.id}`, { method: "PATCH", body: JSON.stringify({ name: menuNameInput.value }) });
      Object.assign(menu, updated);
      renderMenuList();
    } catch (error) { menuMessage.textContent = error.message; }
  }, 450);
});

menuPublishButton.addEventListener("click", async () => {
  const menu = activeMenu();
  if (!menu) return;
  try {
    const published = await request(`/api/menus/${menu.id}/publish`, { method: "POST", body: "{}" });
    Object.assign(menu, published);
    renderMenuEditor();
    renderMenuList();
    renderSite();
  } catch (error) { menuMessage.textContent = error.message; }
});

menuDeleteButton.addEventListener("click", async () => {
  const menu = activeMenu();
  if (!menu) return;
  if (!window.confirm(`Delete "${menu.name}"? This cannot be undone.`)) return;
  try {
    await request(`/api/menus/${menu.id}`, { method: "DELETE" });
    menus = await request("/api/menus");
    activeMenuId = menus[0]?.id ?? null;
    renderMenuManager();
    renderSite();
  } catch (error) { menuMessage.textContent = error.message; }
});

addMenuItemButton.addEventListener("click", () => addMenuItem(null));
publicContactForm.addEventListener("submit", (event) => submitContactForm(event, publicContactForm, publicContactMessage));
sectionFormsButton.addEventListener("click", () => switchSection("forms"));

newFormButton.addEventListener("click", async () => {
  const name = window.prompt("Name this form:", `Form ${forms.length + 1}`);
  if (!name) return;
  try {
    const created = await request("/api/forms", { method: "POST", body: JSON.stringify({ name }) });
    forms = await request("/api/forms");
    activeFormId = created.id;
    renderFormManager();
  } catch (error) { formMessage.textContent = error.message; }
});

formNameInput.addEventListener("input", () => {
  const form = activeForm();
  if (!form) return;
  form.name = formNameInput.value;
  window.clearTimeout(formSaveTimer);
  formSaveTimer = window.setTimeout(async () => {
    try {
      const updated = await request(`/api/forms/${form.id}`, { method: "PATCH", body: JSON.stringify({ name: formNameInput.value }) });
      Object.assign(form, updated);
      renderFormList();
    } catch (error) { formMessage.textContent = error.message; }
  }, 450);
});

formDeleteButton.addEventListener("click", async () => {
  const form = activeForm();
  if (!form) return;
  if (!window.confirm(`Delete "${form.name}" and all its submissions? This cannot be undone.`)) return;
  try {
    await request(`/api/forms/${form.id}`, { method: "DELETE" });
    forms = await request("/api/forms");
    activeFormId = forms[0]?.id ?? null;
    renderFormManager();
  } catch (error) { formMessage.textContent = error.message; }
});

addFormFieldButton.addEventListener("click", addFormField);

formTabFields.addEventListener("click", () => {
  formPanelFields.hidden = false;
  formPanelSubmissions.hidden = true;
  setCurrent(formTabFields, formTabFields, formTabSubmissions);
});

formTabSubmissions.addEventListener("click", () => {
  formPanelFields.hidden = true;
  formPanelSubmissions.hidden = false;
  setCurrent(formTabSubmissions, formTabFields, formTabSubmissions);
  renderSubmissions();
});

translationPublishButton.addEventListener("click", async () => {
  const locale = activeTranslationLocale;
  if (!locale) return;
  try {
    translations[locale] = await request(`/api/translations/${locale}/publish`, { method: "POST", body: "{}" });
    renderTranslationEditor();
    renderLanguageSwitch();
    renderSite();
  } catch (error) { translationMessage.textContent = error.message; }
});

addLocaleButton.addEventListener("click", async () => {
  const selected = localePickerSelect.value;
  if (!selected) return;
  let code = selected;
  let name;
  if (selected === "__custom__") {
    code = window.prompt("Language code (e.g. \"fr\", \"pt-br\"):");
    if (!code) return;
    name = window.prompt("Display name for this language:", code.toUpperCase());
    if (!name) return;
  } else {
    name = LANGUAGE_CHOICES.find(([choiceCode]) => choiceCode === selected)?.[1] || selected.toUpperCase();
  }
  try {
    const created = await request("/api/locales", { method: "POST", body: JSON.stringify({ code, name }) });
    locales = await request("/api/locales");
    activeTranslationLocale = created.code;
    translations[created.code] = await request(`/api/translations/${created.code}`);
    state.locales = locales;
    renderTranslationManager();
    renderLanguageSwitch();
  } catch (error) { translationMessage.textContent = error.message; }
});

removeLocaleButton.addEventListener("click", async () => {
  const locale = activeTranslationLocale;
  const meta = locales.find((entry) => entry.code === locale);
  if (!locale || !meta) return;
  if (!window.confirm(`Remove ${meta.name}? All translated text for this language will be deleted.`)) return;
  try {
    await request(`/api/locales/${locale}`, { method: "DELETE" });
    locales = await request("/api/locales");
    delete translations[locale];
    activeTranslationLocale = null;
    if (activeLocale === locale) activeLocale = "en";
    state.locales = locales;
    renderTranslationManager();
    renderLanguageSwitch();
    renderSite();
  } catch (error) { translationMessage.textContent = error.message; }
});

genericContactForm.addEventListener("submit", (event) => submitContactForm(event, genericContactForm, genericContactMessage));

pageListHomeButton.addEventListener("click", () => {
  activePageView = "home";
  activePageId = null;
  renderPageList();
  renderPageEditor();
});

function slugify(value) {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

newPageButton.addEventListener("click", async () => {
  const title = window.prompt("Title for this page:");
  if (!title) return;
  const slug = slugify(title);
  if (!slug) {
    pageMessage.textContent = "Couldn't derive a URL path from that title.";
    return;
  }
  try {
    const created = await request("/api/pages", { method: "POST", body: JSON.stringify({ slug, title }) });
    pages = await request("/api/pages");
    activePageView = "page";
    activePageId = created.id;
    renderPageManager();
  } catch (error) { pageMessage.textContent = error.message; }
});

pageTitleInput.addEventListener("input", () => {
  const page = activePage();
  if (!page) return;
  page.title = pageTitleInput.value;
  window.clearTimeout(pageSaveTimer);
  pageSaveTimer = window.setTimeout(async () => {
    try {
      const updated = await request(`/api/pages/${page.id}`, { method: "PATCH", body: JSON.stringify({ title: pageTitleInput.value }) });
      Object.assign(page, updated);
      renderPageList();
    } catch (error) { pageMessage.textContent = error.message; }
  }, 450);
});

pagePublishButton.addEventListener("click", async () => {
  const page = activePage();
  if (!page) return;
  try {
    const published = await request(`/api/pages/${page.id}/publish`, { method: "POST", body: "{}" });
    Object.assign(page, published);
    renderPageEditor();
    renderPageList();
  } catch (error) { pageMessage.textContent = error.message; }
});

pageDeleteButton.addEventListener("click", async () => {
  const page = activePage();
  if (!page) return;
  if (!window.confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
  try {
    await request(`/api/pages/${page.id}`, { method: "DELETE" });
    pages = await request("/api/pages");
    activePageView = "home";
    activePageId = null;
    renderPageManager();
  } catch (error) { pageMessage.textContent = error.message; }
});

(async () => {
  const publicState = await request("/api/public");
  publicContent = publicState.published;
  publicRooms = publicState.rooms || [];
  publicDishes = publicState.dishes || [];
  publicHeroImageUrl = publicState.heroImageUrl || null;
  publicMenus = publicState.menus || [];
  publicForm = publicState.form || null;
  publicLocales = publicState.locales || [];
  publicTranslations = publicState.translations || {};
  publicPages = publicState.pages || [];
  renderPublicContactForm();
  renderLanguageSwitch();
  renderSite();
  const existing = await request("/api/session");
  if (existing.authenticated) {
    session = existing;
    state = await request("/api/state");
    mediaList = state.media || [];
    enableEditMode();
  }
})();
