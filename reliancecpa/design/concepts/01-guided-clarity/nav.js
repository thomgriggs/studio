/* Header behaviour. Desktop menus open by CSS (hover and keyboard focus); this file adds: click and Escape on the triggers,
   and the mobile menu (the Menu button toggles the panel, folders open as accordions). Breakpoint 1000px, as the original's nav-hiding one.
   Nothing else on the site needs script. */
(function () {
  var doc = document, header = doc.querySelector('.site-header');
  var toggle = doc.querySelector('.nav__toggle'), nav = doc.getElementById('site-nav');
  if (!header || !toggle || !nav) return;
  var mq = window.matchMedia('(max-width: 1000px)');
  var items = Array.prototype.slice.call(nav.querySelectorAll('.nav__item'));
  function set(item, open) {
    item.classList.toggle('is-open', open);
    var b = item.querySelector('.nav__trigger'); if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  items.forEach(function (item) {
    var b = item.querySelector('.nav__trigger'); if (!b) return;
    b.addEventListener('click', function () {
      var open = !item.classList.contains('is-open');
      if (!mq.matches) items.forEach(function (i) { if (i !== item) set(i, false); });
      set(item, open);
    });
  });
  toggle.addEventListener('click', function () {
    var open = !header.classList.contains('menu-open');
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    items.forEach(function (i) { set(i, false); });
    if (header.classList.contains('menu-open')) { header.classList.remove('menu-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
  });
  doc.addEventListener('click', function (e) {
    if (!mq.matches && !nav.contains(e.target)) items.forEach(function (i) { set(i, false); });
  });
  mq.addEventListener && mq.addEventListener('change', function () {
    header.classList.remove('menu-open'); toggle.setAttribute('aria-expanded', 'false');
    items.forEach(function (i) { set(i, false); });
  });
})();
