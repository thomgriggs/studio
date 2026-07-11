(function () {
  'use strict';

  function projectLabel() {
    var meta = document.querySelector('meta[name="studio:project"]');
    if (meta && meta.getAttribute('content')) return meta.getAttribute('content');

    var seg = location.pathname.split('/').filter(Boolean)[0];
    if (!seg) return '';
    return seg.replace(/[-_]/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  var label = projectLabel();
  if (!label) return; // don't render on the studio root itself

  var bar = document.createElement('div');
  bar.className = 'studio-breadcrumb';

  var home = document.createElement('a');
  home.href = '/';
  home.textContent = 'Studio';

  var sep = document.createElement('span');
  sep.className = 'studio-breadcrumb-sep';
  sep.textContent = '/';

  var current = document.createElement('span');
  current.className = 'studio-breadcrumb-current';
  current.textContent = label;

  bar.appendChild(home);
  bar.appendChild(sep);
  bar.appendChild(current);

  document.body.insertBefore(bar, document.body.firstChild);

  // Some page templates (e.g. Squarespace) pin a fixed/sticky header to the
  // viewport top, which sits at the same y-position as this bar and renders
  // over it. Push any such header down by the bar's height via a stylesheet
  // rule (not an inline style): Squarespace applies its own fixed/sticky
  // positioning asynchronously (after this script's one-time computed-style
  // check would already have run), and separately keeps rewriting the
  // header's inline `top` on scroll. A stylesheet `!important` rule wins
  // over both — it applies whenever the element becomes positioned, and
  // isn't clobbered by later inline-style writes. It's a no-op on elements
  // that stay `position: static`, since `top` has no effect on those.
  var headerOffsetStyle = document.createElement('style');
  document.head.appendChild(headerOffsetStyle);

  function offsetFixedHeader() {
    var header = document.querySelector('#header, header, .header');
    if (!header || header === bar) return;

    var selector = header.id ? '#' + header.id : header.tagName.toLowerCase();
    var barHeight = bar.getBoundingClientRect().height;
    headerOffsetStyle.textContent = selector + ' { top: ' + barHeight + 'px !important; }';
  }

  offsetFixedHeader();
  window.addEventListener('resize', offsetFixedHeader);
})();
