(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var safeUrl = function (u) { u = String(u || '').trim(); return /^(https?:|mailto:|tel:|#|\/|\.|[a-z0-9_\-]+(\/|\.))/i.test(u) && !/^javascript:/i.test(u) ? u : '#'; };
  var arr = function (a) { return Array.isArray(a) ? a : []; };

  function load() {
    // ?preview=1 → admin panelinden kaydedilmemiş taslağı göster
    if (/[?&]preview=1/.test(location.search)) {
      try {
        var d = localStorage.getItem('pera_preview');
        if (d) return Promise.resolve(JSON.parse(d));
      } catch (e) {}
    }
    return fetch('content.json?v=' + Date.now()).then(function (r) { return r.json(); });
  }

  function head(o, extra) {
    return '<div class="head reveal">' +
      (o.eyebrow ? '<p class="eyebrow">' + esc(o.eyebrow) + '</p>' : '') +
      '<h2>' + esc(o.title) + (o.accent ? ' <em>' + esc(o.accent) + '</em>' : '') + '</h2>' +
      (o.text ? '<p class="sub">' + esc(o.text) + '</p>' : '') + (extra || '') + '</div>';
  }

  function render(c) {
    var s = c.site || {};
    document.title = s.title || s.name || 'PERA DIGITAL';
    var md = document.querySelector('meta[name=description]'); if (md) md.content = s.description || '';

    if (s.announce) { $('announce').textContent = s.announce; $('announce').hidden = false; }
    $('brandName').textContent = s.name || '';
    if (s.logo) {
      ['brandLogo', 'heroLogo'].forEach(function (id) {
        var im = $(id); im.src = s.logo; im.hidden = false;
        im.onerror = function () { im.hidden = true; };
      });
      $('brandLogo').addEventListener('load', function () { $('brandName').style.display = 'none'; });
    }

    $('navLinks').innerHTML = arr(c.nav).map(function (n) {
      return '<a href="' + esc(safeUrl(n.href)) + '">' + esc(n.label) + '</a>';
    }).join('');
    if (c.navCta) { $('navCta').textContent = c.navCta.label; $('navCta').href = safeUrl(c.navCta.href); }

    var h = c.hero || {};
    $('heroBadge').textContent = h.badge || ''; $('heroBadge').hidden = !h.badge;
    $('heroTitle').textContent = h.title || ''; $('heroAccent').textContent = h.titleAccent || '';
    $('heroText').textContent = h.text || '';
    [['heroCta1', h.primaryCta], ['heroCta2', h.secondaryCta]].forEach(function (p) {
      var el = $(p[0]); if (p[1] && p[1].label) { el.textContent = p[1].label; el.href = safeUrl(p[1].href); } else el.hidden = true;
    });
    var stats = arr(h.stats).filter(function (x) { return x.value; });
    $('heroStats').innerHTML = stats.map(function (x) { return '<div><dt>' + esc(x.value) + '</dt><dd>' + esc(x.label) + '</dd></div>'; }).join('');
    $('heroStats').hidden = !stats.length;

    var m = c.marquee || {};
    if (arr(m.items).length) {
      $('marqueeSec').hidden = false; $('marqueeTitle').textContent = m.title || '';
      $('marqueeRow').innerHTML = m.items.map(function (i) { return '<span>' + esc(i) + '</span>'; }).join('');
    }

    var a = c.approach || {};
    $('approach').innerHTML = head(a) + '<div class="cards">' + arr(a.items).map(function (i) {
      return '<article class="card reveal"><span class="num">' + esc(i.num) + '</span><h3>' + esc(i.title) + '</h3><p>' + esc(i.text) + '</p></article>';
    }).join('') + '</div>';

    var ab = c.about || {};
    $('about').innerHTML = head(ab) +
      '<div class="mv reveal">' +
      '<div class="box"><h3>' + esc((ab.mission || {}).label) + '</h3><p>' + esc((ab.mission || {}).text) + '</p></div>' +
      '<div class="box"><h3>' + esc((ab.vision || {}).label) + '</h3><p>' + esc((ab.vision || {}).text) + '</p></div></div>' +
      (ab.valuesTitle ? '<h3 class="values-title reveal">' + esc(ab.valuesTitle) + '</h3>' : '') +
      '<div class="values reveal">' + arr(ab.values).map(function (v) {
        return '<div class="v"><h4>' + esc(v.title) + '</h4><p>' + esc(v.text) + '</p></div>';
      }).join('') + '</div>';

    var sv = c.services || {}, au = c.audience || {};
    $('services').innerHTML = head(sv) + '<div class="svc">' + arr(sv.items).map(function (i) {
      return '<article class="svc-item reveal"><span class="num">' + esc(i.num) + '</span><div><h3>' + esc(i.title) + '</h3></div><div><p>' + esc(i.text) + '</p><div class="tags">' +
        arr(i.tags).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div></div></article>';
    }).join('') + '</div>' +
      (arr(au.items).length ? '<div class="audience reveal"><h4>' + esc(au.title) + '</h4><div class="tags">' +
        au.items.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div></div>' : '');

    var r = c.results || {};
    var rs = arr(r.items).filter(function (i) { return i.title; });
    $('sonuclar').hidden = !rs.length;
    $('results').innerHTML = head(r) + '<div class="res">' + rs.map(function (i) {
      return '<article class="card reveal"><span class="tag">' + esc(i.tag) + '</span>' +
        (i.metric ? '<div class="metric">' + esc(i.metric) + '</div><div class="metric-l">' + esc(i.metricLabel) + '</div>' : '') +
        '<h3>' + esc(i.title) + '</h3><p>' + esc(i.text) + '</p></article>';
    }).join('') + '</div>';
    // sonuçlar linkini menüden de gizle
    if (!rs.length) document.querySelectorAll('#navLinks a[href="#sonuclar"]').forEach(function (x) { x.hidden = true; });

    var p = c.process || {};
    $('process').innerHTML = head(p) + '<div class="proc">' + arr(p.steps).map(function (i) {
      return '<article class="card reveal"><span class="num">' + esc(i.num) + '</span>' +
        (i.time ? '<span class="time">' + esc(i.time) + '</span>' : '') +
        '<h3>' + esc(i.title) + '</h3><p>' + esc(i.text) + '</p></article>';
    }).join('') + '</div>';

    var ap = c.apply || {};
    $('applyIntro').innerHTML = '<div class="reveal">' + (ap.eyebrow ? '<p class="eyebrow">' + esc(ap.eyebrow) + '</p>' : '') +
      '<h2>' + esc(ap.title) + ' <em>' + esc(ap.accent) + '</em></h2><p class="sub">' + esc(ap.text) + '</p>' +
      '<ul class="checks">' + arr(ap.checks).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    $('formTitle').textContent = ap.formTitle || '';
    $('submitBtn').textContent = ap.submitLabel || 'Gönder';
    var opt = function (list, ph) { return '<option value="">' + ph + '</option>' + arr(list).map(function (o) { return '<option>' + esc(o) + '</option>'; }).join(''); };
    $('fSector').innerHTML = opt(ap.sectors, 'Seçin'); $('fBudget').innerHTML = opt(ap.budgets, 'Seçin'); $('fService').innerHTML = opt(ap.services, 'Seçin');
    var kv = ap.kvkkUrl ? '<a href="' + esc(safeUrl(ap.kvkkUrl)) + '" target="_blank" rel="noopener">' + esc(ap.kvkkText) + '</a>' : esc(ap.kvkkText);
    $('kvkkText').innerHTML = kv;
    setupForm(ap, c.site || {});

    var f = c.faq || {};
    $('faq').innerHTML = head(f) + arr(f.items).map(function (i) {
      return '<details class="reveal"><summary>' + esc(i.q) + '</summary><p>' + esc(i.a) + '</p></details>';
    }).join('');

    var ct = c.contact || {};
    var cits = arr(ct.items).filter(function (i) { return i.value; });
    $('iletisim').hidden = !cits.length;
    $('contact').innerHTML = head(ct) + '<div class="contact">' + cits.map(function (i) {
      var ext = /^https?:/i.test(i.href || '') ? ' target="_blank" rel="noopener"' : '';
      return '<article class="card reveal"><span class="num">' + esc(i.label) + '</span><p class="cval">' + esc(i.value) + '</p>' +
        (i.href ? '<a class="btn btn-sm" href="' + esc(safeUrl(i.href)) + '"' + ext + '>' + esc(i.cta || 'Git') + '</a>' : '') + '</article>';
    }).join('') + '</div>';

    var ft = c.footer || {};
    $('footName').textContent = s.name || ''; $('footTag').textContent = ft.tagline || ''; $('footCopy').textContent = ft.copyright || '';
    var links = [];
    if (s.email) links.push('<a href="mailto:' + esc(s.email) + '">' + esc(s.email) + '</a>');
    if (s.instagramUrl) links.push('<a href="' + esc(safeUrl(s.instagramUrl)) + '" target="_blank" rel="noopener">@' + esc(String(s.instagram || '').replace(/^@/, '')) + '</a>');
    $('footLinks').innerHTML = links.join('');

    reveal();
  }

  function setupForm(ap, site) {
    var form = $('applyForm'), msg = $('formMsg'), btn = $('submitBtn');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.className = 'form-msg'; msg.textContent = '';
      var bad = false;
      form.querySelectorAll('[required]').forEach(function (el) {
        var ok = el.type === 'checkbox' ? el.checked : el.value.trim() !== '';
        if (el.type === 'email' && ok) ok = /^\S+@\S+\.\S+$/.test(el.value);
        el.classList.toggle('invalid', !ok); if (!ok) bad = true;
      });
      if (bad) { msg.className = 'form-msg err'; msg.textContent = 'Lütfen işaretli alanları kontrol edin.'; return; }
      if (form.elements._gotcha.value) return; // bot

      var data = {};
      new FormData(form).forEach(function (v, k) { if (k !== '_gotcha') data[k] = v; });
      var text = Object.keys(data).map(function (k) { return k + ': ' + data[k]; }).join('\n');

      if (ap.endpoint) {
        btn.disabled = true;
        var payload = Object.assign({ subject: 'Yeni başvuru: ' + (data.marka || '') }, data);
        if (ap.accessKey) payload.access_key = ap.accessKey;
        fetch(ap.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json().catch(function () { return {}; }); })
          .then(function () { done(); })
          .catch(function () { btn.disabled = false; msg.className = 'form-msg err'; msg.textContent = 'Gönderilemedi. Lütfen tekrar deneyin' + (site.email ? ' veya ' + site.email + ' adresine yazın.' : '.'); });
      } else if (ap.mailtoFallback || site.email) {
        location.href = 'mailto:' + (ap.mailtoFallback || site.email) + '?subject=' + encodeURIComponent('Yeni başvuru: ' + (data.marka || '')) + '&body=' + encodeURIComponent(text);
        msg.className = 'form-msg ok'; msg.textContent = 'E-posta uygulamanız açıldı. Göndererek başvuruyu tamamlayın.';
      } else {
        msg.className = 'form-msg err'; msg.textContent = 'Form henüz bağlanmadı. Admin panelinden “Form adresi” veya e-posta ekleyin.';
      }
      function done() {
        form.innerHTML = '<div class="success"><h3>' + esc(ap.successTitle) + '</h3><p>' + esc(ap.successText) + '</p></div>';
      }
    });
  }

  function reveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: .08 });
    els.forEach(function (e) { io.observe(e); });
  }

  var burger = $('burger'), links = $('navLinks');
  burger.addEventListener('click', function () {
    var o = links.classList.toggle('open'); burger.setAttribute('aria-expanded', o);
  });
  links.addEventListener('click', function () { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); });

  load().then(render).catch(function (e) {
    document.querySelector('main').innerHTML = '<p style="padding:80px 20px;text-align:center">İçerik yüklenemedi (content.json). Siteyi dosya olarak değil, GitHub Pages veya yerel sunucu üzerinden açın.</p>';
    console.error(e);
  });
})();
