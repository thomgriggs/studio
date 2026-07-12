"use client";

import { useEffect, useState } from "react";

export function SnapshotPage({ snapshotKey }: { snapshotKey: string }) {
  const [markup, setMarkup] = useState("");
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setMarkup("");
    setMissing(false);

    Promise.all([
      fetch(`/snapshots/${encodeURIComponent(snapshotKey)}.html`),
      fetch("/snapshots/footer.html"),
    ])
      .then(async ([pageResponse, footerResponse]) => {
        if (!pageResponse.ok || !footerResponse.ok) throw new Error("Snapshot not found");
        const [page, footer] = await Promise.all([pageResponse.text(), footerResponse.text()]);
        return page + footer;
      })
      .then(setMarkup)
      .catch(() => setMissing(true));
  }, [snapshotKey]);

  useEffect(() => {
    if (!markup) return;

    const cleanups: Array<() => void> = [];

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
