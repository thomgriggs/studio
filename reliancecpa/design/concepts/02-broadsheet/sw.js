/* MOCKUP ONLY, not part of the site. The "light switches" review panel for the 02 Broadsheet concept.
   Each switch is a class on <html> (sw-topbar, sw-lines, sw-headings, sw-bands, sw-measure, sw-media-top, sw-media-side, sw-media-band); the CSS is the marked section at the end of style.css.
   The classes are applied before first paint by the inline script in _base.html (?sw=topbar,lines,... or ?sw=all or ?sw=none; saved in localStorage as c02sw3; default when nothing is saved: topbar, lines, bands, measure, media-top, media-band; the media slots are markup in templates/_media.html).
   This file adds: the panel, the band classification for "bands", the "On this page" list for "measure", and a hero offset for "lines". */
(function () {
  var doc = document, root = doc.documentElement;
  var KEYS = [
    ['topbar', 'Top bar', 'slim dark utility bar above the header'],
    ['lines', 'Framed section', 'one section framed by hairlines, icon medallion'],
    ['headings', 'Tier-ink headings', 'h2s and eyebrow marks in the tier colour'],
    ['bands', 'Colour bands', 'stronger tinted blocks, one dark band'],
    ['measure', 'Narrow measure', 'text offset right of an On this page list'],
    ['media-top', 'Photo beside title', 'page head splits 7/5, photo on the right'],
    ['media-side', 'Media beside text', 'video poster in the empty right third'],
    ['media-band', 'Dark media band', 'full-bleed dark photo, white statement']
  ];
  function on() { return KEYS.filter(function (k) { return root.classList.contains('sw-' + k[0]); }).map(function (k) { return k[0]; }); }
  function save() { try { localStorage.setItem('c02sw3', JSON.stringify(on())); } catch (e) {} }

  /* ---- bands: which sections get the tint, which one goes dark (classes are inert unless sw-bands is on). Never the people / profile / team sections,
       never two bands in a row, never a band straight under the page head. ---- */
  var main = doc.getElementById('main'), body = doc.body;
  var longPages = /\bt-(service-detail|tier-landing|insight-article|content-page|about-team|client-resources|resource-media)\b/.test(body.className);
  if (main && longPages) {
    var skip = /^(title-banner|hero|cta-band|contact-band|form|choice-cards|intro)$/, noBand = /^(people|profile)$/;
    var kids = Array.prototype.filter.call(main.children, function (el) { return el.classList.contains('m'); });
    var cand = kids.filter(function (el) { return !skip.test(el.getAttribute('data-module') || ''); });
    var darkDone = false, last = -2, prev = null;
    cand.forEach(function (el, i) {
      var mod = el.getAttribute('data-module') || '';
      if (noBand.test(mod)) return;
      var underHead = kids.indexOf(el) === 0 || (kids.indexOf(el) === 1 && /^(title-banner|hero)$/.test(kids[0].getAttribute('data-module') || ''));
      var isB = el.getAttribute('data-tone') === 'b';
      var adj = last === i - 1;
      if (!darkDone && /^(steps|reasons|stat|quote)/.test(mod)) {
        if (adj && prev) prev.classList.remove('sw-tint');
        el.classList.add('sw-dark'); darkDone = true; last = i; prev = el; return;
      }
      if (underHead) return;
      if (isB || i % 2 === 1) {
        if (adj) { if (isB && prev && prev.classList.contains('sw-tint')) prev.classList.remove('sw-tint'); else return; }
        el.classList.add('sw-tint'); last = i; prev = el;
      }
    });
  }

  /* ---- media-band: the band never touches a tint (sw-media-band CSS drops the tint on its neighbours) ---- */
  var mbd = main && main.querySelector('.mband');
  if (mbd) {
    [mbd.previousElementSibling, mbd.nextElementSibling].forEach(function (n) { if (n && n.classList.contains('m')) n.classList.add('mb-adj'); if (n.classList.contains('sw-dark')) mbd.classList.add('mb-gap'); });
  }

  /* ---- lines: the one framed section (first content section after the head / hero and stat rail), with an icon medallion on the top rule ---- */
  if (main && !/\bt-(get-started|kit|pages)\b/.test(body.className)) {
    var fk = Array.prototype.filter.call(main.children, function (el) {
      return el.classList.contains('m') && !/^(title-banner|hero|trust-strip|stat-row|cta-band|form|choice-cards)$/.test(el.getAttribute('data-module') || '');
    })[0];
    if (fk && !/^(people|profile|post-feed)$/.test(fk.getAttribute('data-module') || '')) {
      fk.classList.add('sw-frame');
      var pg = doc.querySelector('.page'), pc = pg ? pg.className : '';
      var ICONS = {
        teal: '<path d="M48 40h160v184l-20-12-20 12-20-12-20 12-20-12-20 12-20-12-20 12Z"/><path d="M84 96h88M84 136h88M84 176h40"/>',
        sage: '<path d="M56 216v-88h32v88M112 216V88h32v128M168 216V48h32v168M32 216h192"/>',
        gold: '<circle cx="128" cy="128" r="88"/><path d="M170 86l-26 58-58 26 26-58z"/>',
        /* pages outside the three services: an icon by page type */
        article: '<rect x="40" y="56" width="176" height="144" rx="8"/><path d="M80 104h96M80 136h96M80 168h56"/>',
        people: '<circle cx="128" cy="96" r="40"/><path d="M48 216c8-44 40-64 80-64s72 20 80 64"/>',
        folder: '<path d="M32 208V64h64l24 28h104v116Z"/>',
        mail: '<rect x="32" y="56" width="192" height="144" rx="8"/><path d="M32 64l96 80 96-80"/>',
        building: '<path d="M24 216h208M56 216V48h88v168M144 104h56v112M88 88h24M88 128h24M88 168h24"/>'
      };
      var bc = body.className;
      var key = /terr-teal/.test(pc) ? 'teal' : /terr-sage/.test(pc) ? 'sage' : /terr-gold/.test(pc) ? 'gold' : /\bt-insight-article\b/.test(bc) ? 'article' : /\bt-about-team\b/.test(bc) ? 'people' : /\bt-(client-resources|resource-media)\b/.test(bc) ? 'folder' : /\bt-contact\b/.test(bc) ? 'mail' : 'building';
      var med = doc.createElement('span');
      med.className = 'frame-med'; med.setAttribute('aria-hidden', 'true');
      med.innerHTML = key ? '<svg viewBox="0 0 256 256">' + ICONS[key] + '</svg>' : '<span class="frame-r">R</span>';
      fk.appendChild(med);
      /* draw the lines in when the framed section scrolls into view (once) */
      if ('IntersectionObserver' in window) {
        var fio = new IntersectionObserver(function (es) {
          if (es.some(function (e) { return e.isIntersecting; })) { fk.classList.add('is-drawn'); fio.disconnect(); }
        }, { rootMargin: '0px 0px -22% 0px' });
        fio.observe(fk);
      } else { fk.classList.add('is-drawn'); }
    }
  }

  /* ---- measure: "On this page" list from the h2s (else the tier's section nav), only on the long text templates ---- */
  if (main && /\bt-(service-detail|insight-article|content-page)\b/.test(body.className)) {
    var hs = Array.prototype.filter.call(main.querySelectorAll('h2'), function (h) { return !h.closest('.m-cta, .m-contactband, .m-related, .pagehead'); });
    var items = [], label = 'On this page';
    hs.forEach(function (h, i) {
      if (!h.id) h.id = 'sec-' + (i + 1);
      items.push('<li><a href="#' + h.id + '">' + h.textContent + '</a></li>');
    });
    if (items.length < 2) {
      var sn = main.querySelector('.sectionnav');
      items = [];
      if (sn) { label = (sn.querySelector('.sectionnav__l') || {}).textContent || 'In this section'; Array.prototype.forEach.call(sn.querySelectorAll('a'), function (a) { items.push('<li><a href="' + a.getAttribute('href') + '"' + (a.hasAttribute('aria-current') ? ' aria-current="page"' : '') + '>' + a.textContent + '</a></li>'); }); }
    }
    if (items.length > 1) {
      var aside = doc.createElement('aside');
      aside.className = 'otp'; aside.setAttribute('aria-label', label);
      aside.innerHTML = '<div class="otp__in"><p class="otp__h">' + label + '</p><ul>' + items.join('') + '</ul></div>';
      var hd = main.querySelector('.pagehead');
      if (hd) hd.insertAdjacentElement('afterend', aside); else main.insertBefore(aside, main.firstChild);
      main.classList.add('has-otp');
      var place = function () {
        var first = aside.nextElementSibling; while (first && first.classList.contains('mslot-w')) first = first.nextElementSibling; if (!first) return;
        var mr = main.getBoundingClientRect(), fr = first.getBoundingClientRect();
        var bandsOn = root.classList.contains('sw-bands'), end = null, el = first;
        while (el) {
          if (el !== first || true) {
            var isBand = el.classList && (el.classList.contains('m-cta') || (root.classList.contains('sw-media-band') && el.classList.contains('mband')) || (bandsOn && (el.classList.contains('sw-tint') || el.classList.contains('sw-dark') || el.getAttribute('data-tone') === 'b')));
            if (isBand && el !== first) { end = el.getBoundingClientRect().top; break; }
          }
          el = el.nextElementSibling;
        }
        if (end === null) end = mr.bottom;
        var need = aside.querySelector('.otp__in').offsetHeight;
        aside.style.top = Math.max(0, fr.top - mr.top) + 'px';
        aside.style.height = Math.max(need, end - fr.top) + 'px';
      };
      place(); window.addEventListener('load', place); window.addEventListener('resize', place);
      var dk = main.querySelector('.sw-dark');
      if (dk) {
        var tone = function () {
          var inn = aside.querySelector('.otp__in').getBoundingClientRect(), d = dk.getBoundingClientRect();
          aside.classList.toggle('is-on-dark', inn.bottom > d.top && inn.top < d.bottom && root.classList.contains('sw-bands'));
        };
        window.addEventListener('scroll', tone, { passive: true }); window.addEventListener('resize', tone); tone();
      }
    }
  }

  /* ---- media-side: mark the first text run (up to two sections before the first band / CTA) so its text leaves room for the card, and hide the card if it would run past that run ---- */
  var sideCard = main && main.querySelector('.mslot-side');
  if (sideCard) {
    var anchor = sideCard.parentNode;
    var fitSide = function () {
      sideCard.classList.remove('is-nofit');
      var secs = [], el = anchor.nextElementSibling, bandsOn = root.classList.contains('sw-bands'), mbOn = root.classList.contains('sw-media-band');
      Array.prototype.forEach.call(main.querySelectorAll('.mrun'), function (x) { x.classList.remove('mrun'); });
      while (el && secs.length < 2) {
        var isBand = el.classList.contains('m-cta') || (mbOn && el.classList.contains('mband')) || (bandsOn && (el.classList.contains('sw-tint') || el.classList.contains('sw-dark'))) || el.getAttribute('data-tone') === 'b' || !el.classList.contains('m');
        if (isBand && secs.length) break;
        if (isBand && !secs.length && (el.classList.contains('m-cta') || el.classList.contains('mband'))) break;
        secs.push(el); el = el.nextElementSibling;
      }
      secs.forEach(function (s) { s.classList.add('mrun'); });
      if (getComputedStyle(sideCard).display === 'none') { secs.forEach(function (s) { s.classList.remove('mrun'); }); sideCard.classList.add('is-nofit'); return; }
      sideCard.classList.remove('is-nofit');
      var cb = sideCard.getBoundingClientRect().bottom, last = secs[secs.length - 1];
      if (!last || cb > last.getBoundingClientRect().bottom - 8) sideCard.classList.add('is-nofit');
    };
    fitSide(); window.addEventListener('load', fitSide); window.addEventListener('resize', fitSide);
  }

  /* ---- the panel ---- */
  var p = doc.createElement('div');
  p.className = 'swp'; p.setAttribute('role', 'region'); p.setAttribute('aria-label', 'Mockup switches');
  var open = false; try { open = localStorage.getItem('c02swopen') === '1'; } catch (e) {}
  p.innerHTML = '<button type="button" class="swp__t" aria-expanded="' + open + '">Switches</button>' +
    '<div class="swp__b"' + (open ? '' : ' hidden') + '><p class="swp__n">Mockup switches, not part of the site</p>' +
    KEYS.map(function (k) { return (k[0] === 'media-top' ? '<p class="swp__s">Media slots</p>' : '') + '<label><input type="checkbox" data-k="' + k[0] + '"' + (root.classList.contains('sw-' + k[0]) ? ' checked' : '') + '><span><b>' + k[1] + '</b><small>' + k[2] + '</small></span></label>'; }).join('') +
    '<p class="swp__r"><button type="button" data-all="1">All on</button><button type="button" data-all="0">All off</button></p></div>';
  doc.body.appendChild(p);
  var tb = p.querySelector('.swp__t'), bd = p.querySelector('.swp__b');
  tb.addEventListener('click', function () {
    open = !open; bd.hidden = !open; tb.setAttribute('aria-expanded', open);
    try { localStorage.setItem('c02swopen', open ? '1' : '0'); } catch (e) {}
  });
  p.addEventListener('change', function (e) {
    var k = e.target.getAttribute('data-k'); if (!k) return;
    root.classList.toggle('sw-' + k, e.target.checked); save();
    window.dispatchEvent(new Event('resize'));
  });
  p.addEventListener('click', function (e) {
    var a = e.target.getAttribute && e.target.getAttribute('data-all'); if (a === null || a === undefined) return;
    KEYS.forEach(function (k) { root.classList.toggle('sw-' + k[0], a === '1'); });
    Array.prototype.forEach.call(p.querySelectorAll('input[data-k]'), function (i) { i.checked = a === '1'; });
    save(); window.dispatchEvent(new Event('resize'));
  });
})();
