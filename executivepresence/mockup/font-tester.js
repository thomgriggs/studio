(function () {
  var fonts = [
    "DM Sans",
    "Manrope",
    "Inter",
    "Albert Sans",
    "Libre Franklin",
    "IBM Plex Sans",
    "Source Sans 3",
    "Work Sans",
    "Barlow",
    "Nunito Sans",
    "Montserrat",
    "Open Sans"
  ];

  var storageKey = "ep-design-sans";

  function applyFont(font) {
    document.documentElement.style.setProperty("--design-sans", '"' + font + '"');
    try {
      window.localStorage.setItem(storageKey, font);
    } catch (error) {}
  }

  function buildTester() {
    if (document.querySelector(".font-tester")) return;

    var saved = "";
    try {
      saved = window.localStorage.getItem(storageKey) || "";
    } catch (error) {}

    var current = fonts.indexOf(saved) >= 0 ? saved : "Nunito Sans";
    applyFont(current);

    var tester = document.createElement("div");
    tester.className = "font-tester";

    var label = document.createElement("label");
    label.setAttribute("for", "font-tester-select");
    label.textContent = "Menu Font";

    var select = document.createElement("select");
    select.id = "font-tester-select";

    fonts.forEach(function (font) {
      var option = document.createElement("option");
      option.value = font;
      option.textContent = font;
      option.style.fontFamily = '"' + font + '", Arial, sans-serif';
      select.appendChild(option);
    });

    select.value = current;
    select.addEventListener("change", function () {
      applyFont(select.value);
    });

    tester.appendChild(label);
    tester.appendChild(select);
    document.body.appendChild(tester);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildTester);
  } else {
    buildTester();
  }
})();
