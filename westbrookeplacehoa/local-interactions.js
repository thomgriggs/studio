document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".pages li.folder").forEach((folder) => {
    const trigger = folder.parentElement;
    if (!trigger) return;

    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-expanded", String(!folder.classList.contains("closed")));

    const toggle = (event) => {
      event.preventDefault();
      const opening = folder.classList.contains("closed");
      folder.classList.toggle("closed", !opening);
      folder.classList.toggle("open", opening);
      trigger.setAttribute("aria-expanded", String(opening));

      const icon = folder.querySelector(".fa");
      icon?.classList.toggle("fa-chevron-right", !opening);
      icon?.classList.toggle("fa-chevron-down", opening);

      let sibling = trigger.nextElementSibling;
      while (sibling?.classList.contains("indent_1")) {
        const item = sibling.querySelector("li.indent_1");
        if (item) item.style.display = opening ? "list-item" : "none";
        sibling = sibling.nextElementSibling;
      }
    };

    trigger.addEventListener("click", toggle);
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") toggle(event);
    });
  });
});
