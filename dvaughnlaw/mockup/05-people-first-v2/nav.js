/* Header menu behaviour: hover/click/keyboard dropdowns on desktop, accordions in a full-width panel on mobile.
   Same file in every concept; the look lives in each concept's style.css. */
(function () {
  var doc = document, root = doc.documentElement;
  var header = doc.querySelector('.site-header');
  var toggle = doc.querySelector('.nav__toggle');
  var nav = doc.getElementById('site-nav');
  if (!header || !nav || !toggle) return;
  root.classList.add('js');
  var mq = window.matchMedia('(max-width: 900px)');
  var items = Array.prototype.slice.call(nav.querySelectorAll('.nav__item'));
  var timers = new WeakMap();

  function set(item, open) {
    item.classList.toggle('is-open', open);
    item.querySelector('.nav__trigger').setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function closeAll(except) { items.forEach(function (i) { if (i !== except) set(i, false); }); }

  items.forEach(function (item) {
    var btn = item.querySelector('.nav__trigger');
    btn.addEventListener('click', function () {
      var open = !item.classList.contains('is-open');
      if (!mq.matches) closeAll(item);
      set(item, open);
    });
    item.addEventListener('mouseenter', function () {
      if (mq.matches || item.dataset.esc) return;
      clearTimeout(timers.get(item)); closeAll(item); set(item, true);
    });
    item.addEventListener('mouseleave', function () {
      delete item.dataset.esc;
      if (mq.matches) return;
      timers.set(item, setTimeout(function () { set(item, false); }, 120));
    });
    item.addEventListener('focusout', function (e) {
      if (!mq.matches && e.relatedTarget && !item.contains(e.relatedTarget)) set(item, false);
    });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' && e.target === btn) {
        e.preventDefault(); set(item, true);
        var a = item.querySelector('.nav__sub a'); if (a) a.focus();
      }
    });
  });

  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = items.filter(function (i) { return i.classList.contains('is-open'); });
    var menuOpen = header.classList.contains('menu-open');
    if (!open.length && !menuOpen) return;
    var focused = doc.activeElement;
    open.forEach(function (i) { i.dataset.esc = '1'; set(i, false); });
    if (open.length && focused && nav.contains(focused)) {
      var owner = open.filter(function (i) { return i.contains(focused); })[0];
      if (owner) owner.querySelector('.nav__trigger').focus();
    } else if (menuOpen) { setMenu(false); toggle.focus(); }
  });
  doc.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) closeAll();
  });

  function setMenu(open) {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.querySelector('.nav__toggle-label').textContent = open ? 'Close' : 'Menu';
  }
  toggle.addEventListener('click', function () { setMenu(!header.classList.contains('menu-open')); });
  mq.addEventListener('change', function () { closeAll(); setMenu(false); });
})();
