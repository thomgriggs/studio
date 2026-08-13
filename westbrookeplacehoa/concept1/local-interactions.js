/* Local preview behavior only. This file is never copied into HOA Express. */
document.addEventListener("DOMContentLoaded", () => {
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    const studioPrefix = "/westbrookeplacehoa/concept1";
    document.querySelectorAll(`a[href^="${studioPrefix}/"]`).forEach((link) => {
      link.setAttribute("href", link.getAttribute("href").slice(studioPrefix.length) || "/");
    });
  }

  document.querySelectorAll('[class*="mobile-navigation__MenuIcon"]').forEach((menuIcon) => {
    const topRow = menuIcon.closest('[class*="mobile-navigation__TopRow"]');
    const collapsible = topRow?.nextElementSibling;
    const menuContent = collapsible?.firstElementChild;
    if (!collapsible || !menuContent) return;

    menuIcon.setAttribute("role", "button");
    menuIcon.setAttribute("tabindex", "0");
    menuIcon.setAttribute("aria-label", "Toggle navigation menu");
    menuIcon.setAttribute("aria-expanded", "false");

    const toggleMobileMenu = () => {
      const open = menuIcon.getAttribute("aria-expanded") !== "true";
      menuIcon.setAttribute("aria-expanded", String(open));
      collapsible.setAttribute("aria-hidden", String(!open));
      collapsible.style.height = open ? "auto" : "0px";
      collapsible.style.overflow = open ? "visible" : "hidden";
      menuContent.style.display = open ? "block" : "none";
    };

    menuIcon.addEventListener("click", toggleMobileMenu);
    menuIcon.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleMobileMenu();
      }
    });
  });

  const folderPages = {
    "Book Club": [
      ["Monthly book club list", "/p/Monthly-Book-Club-List"],
      ["Book recommendations", "/p/Book-recommendations"],
    ],
    "Board Member Documents": [
      ["General", "/p/General"],
      ["ACC", "/p/ACC"],
      ["Minutes of meetings", "/p/Minutes-of-meetings"],
      ["Legal", "/p/Legal"],
      ["Financial", "/p/Financial"],
    ],
    Infrastructure: [
      ["Surveys", "/p/Surveys"],
      ["Insurance", "/p/Insurance"],
      ["Maintenance", "/p/Maintenance"],
      ["Miscellaneous", "/p/Miscellaneous"],
      ["Templates/samples", "/p/Templatessamples"],
      ["Annual Meetings", "/p/Annual-Meetings"],
    ],
  };

  document.querySelectorAll('[class*="pages-menu__Folder"]').forEach((folder) => {
    const label = folder.textContent.trim();
    const pages = folderPages[label];
    const item = folder.closest("li");
    const list = item?.parentElement;
    if (!pages || !item || !list) return;

    folder.setAttribute("role", "button");
    folder.setAttribute("tabindex", "0");
    folder.setAttribute("aria-expanded", "false");

    const children = pages.map(([title, href]) => {
      const child = document.createElement("li");
      child.className = item.className;
      child.hidden = true;
      child.dataset.localFolderChild = label;
      child.style.paddingLeft = "1.5rem";

      const link = document.createElement("a");
      link.href = href;
      link.textContent = title;
      child.append(link);
      return child;
    });

    item.after(...children);

    const toggle = () => {
      const open = folder.getAttribute("aria-expanded") !== "true";
      folder.setAttribute("aria-expanded", String(open));
      children.forEach((child) => { child.hidden = !open; });
      const icon = folder.querySelector("svg");
      if (icon) icon.style.transform = open ? "rotate(90deg)" : "";
    };

    folder.addEventListener("click", toggle);
    folder.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });
  });
});
