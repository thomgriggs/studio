/* Local preview behavior only. This file is never copied into HOA Express. */
document.addEventListener("DOMContentLoaded", () => {
  const studioPrefix = "/westbrookeplacehoa/concept1";
  const isLocalPreview = location.hostname === "localhost" || location.hostname === "127.0.0.1";

  if (isLocalPreview) {
    document.querySelectorAll(`a[href^="${studioPrefix}/"]`).forEach((link) => {
      link.setAttribute("href", link.getAttribute("href").slice(studioPrefix.length) || "/");
    });
  }

  const rotatingPhoto = document.querySelector('[class*="rotating-photos__Wrapper"] img');
  if (rotatingPhoto) {
    const rotatingImages = [
      {
        src: "https://public-files.hoa-express.com/website-1063154681/pages/page-4074006143/rotating-photos/X35LiRb1RjKh73WC.jpg",
        alt: "Westbrooke Place community photo",
      },
    ];
    let rotatingIndex = 0;
    const showRotatingPhoto = () => {
      const image = rotatingImages[rotatingIndex];
      rotatingPhoto.src = image.src;
      rotatingPhoto.alt = image.alt;
      rotatingIndex = (rotatingIndex + 1) % rotatingImages.length;
    };
    showRotatingPhoto();
    window.setInterval(showRotatingPhoto, 5500);
  }

  const mobileNavigation = document.querySelector('[class*="mobile-navigation__Container"]');
  const mobileMenuButton = mobileNavigation?.querySelector('[class*="mobile-navigation__MenuIcon"]');
  const mobileMenuPanel = mobileNavigation?.querySelector(":scope > .rah-static");
  const mobileMenuInner = mobileMenuPanel?.firstElementChild;

  if (mobileMenuButton && mobileMenuPanel && mobileMenuInner) {
    mobileMenuButton.setAttribute("role", "button");
    mobileMenuButton.setAttribute("tabindex", "0");
    mobileMenuButton.setAttribute("aria-controls", "local-pages-menu");
    mobileMenuButton.setAttribute("aria-expanded", "false");
    mobileMenuPanel.id = "local-pages-menu";

    const setMobileMenu = (open) => {
      mobileMenuButton.setAttribute("aria-expanded", String(open));
      mobileMenuPanel.setAttribute("aria-hidden", String(!open));
      mobileMenuPanel.style.height = open ? "100dvh" : "0px";
      mobileMenuPanel.style.overflow = open ? "auto" : "hidden";
      mobileMenuInner.style.display = open ? "block" : "none";
    };

    const toggleMobileMenu = () => {
      setMobileMenu(mobileMenuButton.getAttribute("aria-expanded") !== "true");
    };

    mobileMenuButton.addEventListener("click", toggleMobileMenu);
    mobileMenuButton.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleMobileMenu();
      } else if (event.key === "Escape") {
        setMobileMenu(false);
      }
    });
  }

  const topBarWrapper = document.querySelector('[class*="top-bar__Wrapper"]');
  const userControl = topBarWrapper?.querySelector('[aria-label="Member dropdown menu"]');
  const notificationControl = topBarWrapper?.querySelector('[aria-label="Notification dropdown menu"]');

  if (topBarWrapper && userControl && notificationControl) {
    const userMenu = document.createElement("div");
    userMenu.className = "local-control-menu local-control-menu--user";
    userMenu.id = "local-user-control-menu";
    userMenu.hidden = true;
    const mobileUserLinks = document.querySelector('[class*="user-menu__MemberMenu"] ul');
    userMenu.innerHTML = mobileUserLinks
      ? `<ul>${mobileUserLinks.innerHTML}</ul>`
      : "<p>Account controls are unavailable in this snapshot.</p>";

    const notificationMenu = document.createElement("div");
    notificationMenu.className = "local-control-menu local-control-menu--notifications";
    notificationMenu.id = "local-notification-control-menu";
    notificationMenu.hidden = true;
    notificationMenu.innerHTML = "<h3>Notifications</h3><p>No new notifications.</p>";
    topBarWrapper.append(userMenu, notificationMenu);

    userControl.setAttribute("aria-controls", userMenu.id);
    notificationControl.setAttribute("aria-controls", notificationMenu.id);

    const setControlMenu = (kind) => {
      const userOpen = kind === "user";
      const notificationsOpen = kind === "notifications";
      const positionMenu = (button, menu) => {
        const wrapperRect = topBarWrapper.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        menu.style.top = `${buttonRect.bottom - wrapperRect.top}px`;
        menu.style.right = `${wrapperRect.right - buttonRect.right}px`;
      };
      if (userOpen) positionMenu(userControl, userMenu);
      if (notificationsOpen) positionMenu(notificationControl, notificationMenu);
      userControl.setAttribute("aria-expanded", String(userOpen));
      notificationControl.setAttribute("aria-expanded", String(notificationsOpen));
      userMenu.hidden = !userOpen;
      notificationMenu.hidden = !notificationsOpen;
    };

    userControl.addEventListener("click", (event) => {
      event.stopPropagation();
      setControlMenu(userControl.getAttribute("aria-expanded") === "true" ? null : "user");
    });
    notificationControl.addEventListener("click", (event) => {
      event.stopPropagation();
      setControlMenu(
        notificationControl.getAttribute("aria-expanded") === "true" ? null : "notifications",
      );
    });
    document.addEventListener("click", (event) => {
      if (!topBarWrapper.contains(event.target)) setControlMenu(null);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setControlMenu(null);
    });
  }

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
      link.href = isLocalPreview ? href : studioPrefix + href;
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

  const recipesHeading = Array.from(document.querySelectorAll("main h1")).find(
    (heading) => heading.textContent.trim() === "Recipes",
  );
  const recipesMain = recipesHeading?.closest("main");
  const recipeButton = recipesMain?.querySelector('[class*="user-control-button__Button"]');
  const recipeWrapper = recipeButton?.closest('[class*="user-control-button__Wrapper"]');
  const recipePanel = recipeWrapper?.nextElementSibling;
  const recipePanelInner = recipePanel?.firstElementChild;

  if (recipeButton && recipePanel && recipePanelInner) {
    recipeButton.setAttribute("aria-expanded", "false");
    recipeButton.setAttribute("aria-controls", "local-add-recipe-panel");
    recipePanel.id = "local-add-recipe-panel";

    const setRecipePanel = (open) => {
      recipeButton.setAttribute("aria-expanded", String(open));
      recipePanel.setAttribute("aria-hidden", String(!open));
      recipePanel.classList.toggle("local-recipe-panel--open", open);
      recipePanel.style.height = open ? "auto" : "0px";
      recipePanel.style.overflow = open ? "visible" : "hidden";
      recipePanelInner.style.display = open ? "block" : "none";
      recipePanelInner.style.opacity = open ? "1" : "0";
    };

    recipeButton.addEventListener("click", () => {
      setRecipePanel(recipeButton.getAttribute("aria-expanded") !== "true");
    });

    Array.from(recipePanel.querySelectorAll("button")).find(
      (button) => button.textContent.trim() === "Cancel",
    )?.addEventListener("click", () => setRecipePanel(false));

    recipePanel.querySelector("form")?.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  }
});
