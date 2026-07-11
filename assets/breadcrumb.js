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
})();
