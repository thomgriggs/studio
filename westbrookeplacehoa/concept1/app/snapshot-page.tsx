"use client";

import { useEffect, useState } from "react";

export function SnapshotPage({ snapshotKey }: { snapshotKey: string }) {
  const [markup, setMarkup] = useState("");
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setMarkup("");
    setMissing(false);

    fetch(`/snapshots/${encodeURIComponent(snapshotKey)}.html`, { cache: "no-store" })
      .then(async (pageResponse) => {
        if (!pageResponse.ok) throw new Error("Snapshot not found");
        return pageResponse.text();
      })
      .then(setMarkup)
      .catch(() => setMissing(true));
  }, [snapshotKey]);

  useEffect(() => {
    if (!markup) return;

    const cleanups: Array<() => void> = [];

    const rotatingPhoto = document.querySelector<HTMLImageElement>(
      '[class*="rotating-photos__Wrapper"] img',
    );
    if (rotatingPhoto) {
      const rotatingImages = [
        {
          src: "https://unsplash.com/photos/UmqzalI5oIE/download?force=true&w=1400",
          alt: "Southern brick home with a welcoming porch",
        },
        {
          src: "https://unsplash.com/photos/CJxWogLhFJw/download?force=true&w=1400",
          alt: "Blue hydrangeas in a sunlit garden courtyard",
        },
        {
          src: "https://unsplash.com/photos/5rS3ujHGAw4/download?force=true&w=1400",
          alt: "Mature oak tree beside a quiet neighborhood road",
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
      const rotationTimer = window.setInterval(showRotatingPhoto, 5500);
      cleanups.push(() => window.clearInterval(rotationTimer));
    }

    const mobileNavigation = document.querySelector<HTMLElement>(
      '[class*="mobile-navigation__Container"]',
    );
    const mobileMenuButton = mobileNavigation?.querySelector<HTMLElement>(
      '[class*="mobile-navigation__MenuIcon"]',
    );
    const mobileMenuPanel = mobileNavigation?.querySelector<HTMLElement>(":scope > .rah-static");
    const mobileMenuInner = mobileMenuPanel?.firstElementChild as HTMLElement | null;

    if (mobileMenuButton && mobileMenuPanel && mobileMenuInner) {
      mobileMenuButton.setAttribute("role", "button");
      mobileMenuButton.setAttribute("tabindex", "0");
      mobileMenuButton.setAttribute("aria-controls", "local-pages-menu");
      mobileMenuButton.setAttribute("aria-expanded", "false");
      mobileMenuPanel.id = "local-pages-menu";

      const setMobileMenu = (open: boolean) => {
        mobileMenuButton.setAttribute("aria-expanded", String(open));
        mobileMenuPanel.setAttribute("aria-hidden", String(!open));
        mobileMenuPanel.style.height = open ? "100dvh" : "0px";
        mobileMenuPanel.style.overflow = open ? "auto" : "hidden";
        mobileMenuInner.style.display = open ? "block" : "none";
      };
      const toggleMobileMenu = () => {
        setMobileMenu(mobileMenuButton.getAttribute("aria-expanded") !== "true");
      };
      const mobileMenuKeydown = (event: Event) => {
        const keyboardEvent = event as KeyboardEvent;
        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
          event.preventDefault();
          toggleMobileMenu();
        } else if (keyboardEvent.key === "Escape") {
          setMobileMenu(false);
        }
      };

      mobileMenuButton.addEventListener("click", toggleMobileMenu);
      mobileMenuButton.addEventListener("keydown", mobileMenuKeydown);
      cleanups.push(() => {
        mobileMenuButton.removeEventListener("click", toggleMobileMenu);
        mobileMenuButton.removeEventListener("keydown", mobileMenuKeydown);
      });
    }

    const topBarWrapper = document.querySelector<HTMLElement>('[class*="top-bar__Wrapper"]');
    const userControl = topBarWrapper?.querySelector<HTMLButtonElement>(
      '[aria-label="Member dropdown menu"]',
    );
    const notificationControl = topBarWrapper?.querySelector<HTMLButtonElement>(
      '[aria-label="Notification dropdown menu"]',
    );

    if (topBarWrapper && userControl && notificationControl) {
      const userMenu = document.createElement("div");
      userMenu.className = "local-control-menu local-control-menu--user";
      userMenu.id = "local-user-control-menu";
      userMenu.hidden = true;
      const mobileUserLinks = document.querySelector('[class*="user-menu__MemberMenu"] ul');
      userMenu.innerHTML = mobileUserLinks
        ? `<ul>${mobileUserLinks.innerHTML}</ul>`
        : "<p>Account controls are unavailable in this snapshot.</p>";
      const studioPrefix = "/westbrookeplacehoa/concept1";
      userMenu.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
        const label = link.textContent?.trim();
        if (label === "Member settings") link.setAttribute("href", `${studioPrefix}/account/member-settings/general`);
        else if (label === "Account settings") link.setAttribute("href", `${studioPrefix}/account/account-settings/addresses`);
        else {
          const href = link.getAttribute("href");
          if (href && href.startsWith("/") && !href.startsWith(studioPrefix)) {
            link.setAttribute("href", studioPrefix + href);
          }
        }
      });

      const notificationMenu = document.createElement("div");
      notificationMenu.className = "local-control-menu local-control-menu--notifications";
      notificationMenu.id = "local-notification-control-menu";
      notificationMenu.hidden = true;
      notificationMenu.innerHTML = "<h3>Notifications</h3><p>No new notifications.</p>";
      topBarWrapper.append(userMenu, notificationMenu);

      userControl.setAttribute("aria-controls", userMenu.id);
      notificationControl.setAttribute("aria-controls", notificationMenu.id);

      const setControlMenu = (kind: "user" | "notifications" | null) => {
        const userOpen = kind === "user";
        const notificationsOpen = kind === "notifications";
        const positionMenu = (button: HTMLButtonElement, menu: HTMLElement) => {
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
      const toggleUserControl = (event: Event) => {
        event.stopPropagation();
        setControlMenu(userControl.getAttribute("aria-expanded") === "true" ? null : "user");
      };
      const toggleNotifications = (event: Event) => {
        event.stopPropagation();
        setControlMenu(
          notificationControl.getAttribute("aria-expanded") === "true" ? null : "notifications",
        );
      };
      const closeControlMenus = (event: Event) => {
        if (!(event.target instanceof Node)) return;
        if (!topBarWrapper.contains(event.target)) setControlMenu(null);
      };
      const controlKeydown = (event: Event) => {
        if ((event as KeyboardEvent).key === "Escape") setControlMenu(null);
      };

      userControl.addEventListener("click", toggleUserControl);
      notificationControl.addEventListener("click", toggleNotifications);
      document.addEventListener("click", closeControlMenus);
      document.addEventListener("keydown", controlKeydown);
      cleanups.push(() => {
        userControl.removeEventListener("click", toggleUserControl);
        notificationControl.removeEventListener("click", toggleNotifications);
        document.removeEventListener("click", closeControlMenus);
        document.removeEventListener("keydown", controlKeydown);
        userMenu.remove();
        notificationMenu.remove();
      });
    }

    document.querySelectorAll<HTMLElement>(".pages li.folder").forEach((folder) => {
      const trigger = folder.parentElement as HTMLElement | null;
      if (!trigger) return;

      trigger.setAttribute("role", "button");
      trigger.setAttribute("tabindex", "0");
      trigger.setAttribute("aria-expanded", String(!folder.classList.contains("closed")));

      const toggle = (event: Event) => {
        event.preventDefault();
        const opening = folder.classList.contains("closed");
        folder.classList.toggle("closed", !opening);
        folder.classList.toggle("open", opening);
        trigger.setAttribute("aria-expanded", String(opening));

        const icon = folder.querySelector<HTMLElement>(".fa");
        icon?.classList.toggle("fa-chevron-right", !opening);
        icon?.classList.toggle("fa-chevron-down", opening);

        let sibling = trigger.nextElementSibling as HTMLElement | null;
        while (sibling?.classList.contains("indent_1")) {
          const item = sibling.querySelector<HTMLElement>("li.indent_1");
          if (item) item.style.display = opening ? "list-item" : "none";
          sibling = sibling.nextElementSibling as HTMLElement | null;
        }
      };

      const onKeyDown = (event: Event) => {
        const keyboardEvent = event as KeyboardEvent;
        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") toggle(event);
      };

      trigger.addEventListener("click", toggle);
      trigger.addEventListener("keydown", onKeyDown);
      cleanups.push(() => {
        trigger.removeEventListener("click", toggle);
        trigger.removeEventListener("keydown", onKeyDown);
      });
    });

    const recipesHeading = Array.from(document.querySelectorAll("main h1")).find(
      (heading) => heading.textContent?.trim() === "Recipes",
    );
    const recipesMain = recipesHeading?.closest("main");
    const recipeButton = recipesMain?.querySelector<HTMLButtonElement>(
      '[class*="user-control-button__Button"]',
    );
    const recipeWrapper = recipeButton?.closest('[class*="user-control-button__Wrapper"]');
    const recipePanel = recipeWrapper?.nextElementSibling as HTMLElement | null;
    const recipePanelInner = recipePanel?.firstElementChild as HTMLElement | null;

    if (recipeButton && recipePanel && recipePanelInner) {
      recipeButton.setAttribute("aria-expanded", "false");
      recipeButton.setAttribute("aria-controls", "local-add-recipe-panel");
      recipePanel.id = "local-add-recipe-panel";

      const setRecipePanel = (open: boolean) => {
        recipeButton.setAttribute("aria-expanded", String(open));
        recipePanel.setAttribute("aria-hidden", String(!open));
        recipePanel.classList.toggle("local-recipe-panel--open", open);
        recipePanel.style.height = open ? "auto" : "0px";
        recipePanel.style.overflow = open ? "visible" : "hidden";
        recipePanelInner.style.display = open ? "block" : "none";
        recipePanelInner.style.opacity = open ? "1" : "0";
      };

      const toggleRecipePanel = () => {
        setRecipePanel(recipeButton.getAttribute("aria-expanded") !== "true");
      };
      const cancelButton = Array.from(recipePanel.querySelectorAll<HTMLButtonElement>("button")).find(
        (button) => button.textContent?.trim() === "Cancel",
      );
      const recipeForm = recipePanel.querySelector("form");
      const preventRecipeSubmit = (event: Event) => event.preventDefault();

      recipeButton.addEventListener("click", toggleRecipePanel);
      cancelButton?.addEventListener("click", () => setRecipePanel(false));
      recipeForm?.addEventListener("submit", preventRecipeSubmit);
      cleanups.push(() => {
        recipeButton.removeEventListener("click", toggleRecipePanel);
        recipeForm?.removeEventListener("submit", preventRecipeSubmit);
      });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [markup]);

  if (missing) {
    return <div className="snapshot_loading">This route was not present in the authenticated live navigation.</div>;
  }

  if (!markup) {
    return <div className="snapshot_loading">Loading the live HOA Express snapshot…</div>;
  }

  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
