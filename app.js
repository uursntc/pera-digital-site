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

    var tk = arr((c.ticker || {}).items).filter(Boolean);
    $('tickerSec').hidden = !tk.length;
    if (tk.length) {
      var half = ''; for (var n = 0; n < Math.ceil(12 / tk.length); n++) half += tk.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
      $('tickerTrack').innerHTML = '<div>' + half + '</div><div>' + half + '</div>';
    }

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
    // boş bölümlerin menü linkini de gizle (bölümler en sonda render edilir, aşağıda hideNav çağrılır)

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

    renderDemo(c.demo || {});
    renderBooking(c.booking || {});

    var ft = c.footer || {};
    $('footName').textContent = s.name || ''; $('footTag').textContent = ft.tagline || ''; $('footCopy').textContent = ft.copyright || '';
    var links = [];
    if (s.email) links.push('<a href="mailto:' + esc(s.email) + '">' + esc(s.email) + '</a>');
    if (s.instagramUrl) links.push('<a href="' + esc(safeUrl(s.instagramUrl)) + '" target="_blank" rel="noopener">@' + esc(String(s.instagram || '').replace(/^@/, '')) + '</a>');
    $('footLinks').innerHTML = links.join('');

    hideNav('#sonuclar', !rs.length);
    hideNav('#rapor', $('rapor').hidden);
    hideNav('#randevu', $('randevu').hidden);
    heroCycle();
    reveal();
  }

  function hideNav(href, off) {
    document.querySelectorAll('#navLinks a[href="' + href + '"]').forEach(function (x) { x.hidden = !!off; });
  }

  function list2(s) { return String(s || '').split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x !== ''; }); }
  function num2(s) { return list2(s).map(function (x) { return parseFloat(x); }).filter(function (x) { return !isNaN(x); }); }
  var tr = function (n) { try { return Number(n).toLocaleString('tr-TR'); } catch (e) { return String(n); } };

  function smoothPath(pts) {
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
        (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }

  function lineChart(o) {
    var v = num2(o.data), lb = list2(o.labels);
    if (v.length < 2) return '';
    var W = 640, H = 270, L = 46, R = 22, T = 22, B = 36, unit = o.unit || '';
    var mx = Math.max.apply(null, v), mag = Math.pow(10, Math.floor(Math.log10(mx || 1)));
    var top = Math.ceil(mx / mag * 2) / 2 * mag || 1;
    var X = function (i) { return L + i * (W - L - R) / (v.length - 1); };
    var Y = function (x) { return T + (1 - x / top) * (H - T - B); };
    var pts = v.map(function (x, i) { return [X(i), Y(x)]; });
    var line = smoothPath(pts);
    var area = line + ' L' + X(v.length - 1).toFixed(1) + ' ' + Y(0) + ' L' + X(0).toFixed(1) + ' ' + Y(0) + ' Z';
    var g = '';
    for (var t = 0; t <= 4; t++) {
      var val = top * t / 4, y = Y(val);
      g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" class="gl"/><text x="' + (L - 10) + '" y="' + (y + 4) + '" text-anchor="end" class="ax">' + tr(Math.round(val * 10) / 10) + '</text>';
    }
    var xl = v.map(function (x, i) { return '<text x="' + X(i) + '" y="' + (H - 10) + '" text-anchor="middle" class="ax">' + esc(lb[i] || '') + '</text>'; }).join('');
    var dots = pts.map(function (p, i) {
      return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (i === v.length - 1 ? 6 : 3.6) + '" class="dot' + (i === v.length - 1 ? ' last' : '') + '" style="--i:' + i + '"><title>' + esc((lb[i] || '') + ': ' + tr(v[i]) + unit) + '</title></circle>';
    }).join('');
    var lastTxt = '<text x="' + (pts[v.length - 1][0] - 4) + '" y="' + (pts[v.length - 1][1] - 16) + '" text-anchor="end" class="lastv">' + esc(tr(v[v.length - 1]) + unit) + '</text>';
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.title || 'Grafik') + '"><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDDCC4" stop-opacity=".38"/><stop offset="1" stop-color="#EDDCC4" stop-opacity="0"/></linearGradient></defs>' +
      g + xl + '<path d="' + area + '" class="area"/><path d="' + line + '" class="lp" pathLength="1"/>' + dots + lastTxt + '</svg>';
  }

  function barChart(o) {
    var v = num2(o.data), lb = list2(o.labels);
    if (!v.length) return '';
    var mx = Math.max.apply(null, v) || 1;
    return '<div class="bars">' + v.map(function (x, i) {
      return '<div class="brow"><span class="bl">' + esc(lb[i] || '') + '</span><span class="bt"><i style="--w:' + (x / mx * 100).toFixed(1) + '%;--i:' + i + '"></i></span><span class="bv">' + esc(tr(x) + (o.unit || '')) + '</span></div>';
    }).join('') + '</div>';
  }

  function panelHead(o) {
    return '<div class="panel-h">' + (o.eyebrow ? '<p class="eyebrow">' + esc(o.eyebrow) + '</p>' : '') +
      '<h3>' + esc(o.title) + '</h3>' +
      ((o.sub || o.tag) ? '<p class="panel-sub">' + esc(o.sub || '') + (o.tag ? '<span class="chip">' + esc(o.tag) + '</span>' : '') + '</p>' : '') + '</div>';
  }

  function renderDemo(d) {
    var kp = arr(d.kpis).filter(function (k) { return k.value !== '' && k.label; });
    var lc = d.line ? lineChart(d.line) : '', bc = d.bars ? barChart(d.bars) : '';
    var cl = d.closing || {};
    var sec = $('rapor'); sec.hidden = !(kp.length || lc || bc);
    if (sec.hidden) return;
    var intro = d.intro || {};
    $('demo').innerHTML = head(d) +
      (intro.label || intro.text ? '<div class="demo-intro reveal">' + (intro.label ? '<h4>' + esc(intro.label) + '</h4>' : '') + (intro.text ? '<p>' + esc(intro.text) + '</p>' : '') + '</div>' : '') +
      (kp.length && d.kpiTitle ? '<p class="kpi-title reveal">' + esc(d.kpiTitle) + '</p>' : '') +
      (kp.length ? '<div class="kpis">' + kp.map(function (k) {
        var raw = parseFloat(String(k.value).replace(',', '.'));
        var shown = isNaN(raw) ? esc(k.value) : '<span data-count="' + raw + '">' + tr(raw) + '</span>';
        return '<div class="kpi reveal"><span class="kl">' + esc(k.label) + '</span><strong>' + shown + (k.suffix ? '<small>' + esc(k.suffix) + '</small>' : '') + '</strong>' +
          (k.caption ? '<span class="kcap">' + esc(k.caption) + '</span>' : '') +
          (k.delta ? '<span class="delta">' + esc(k.delta) + '</span>' : '') + '</div>';
      }).join('') + '</div>' : '') +
      (d.note ? '<p class="demo-foot reveal">' + esc(d.note) + '</p>' : '') +
      '<div class="charts' + (lc && bc ? '' : ' one') + '">' +
      (lc ? '<div class="panel reveal chart-line">' + panelHead(d.line) + lc + '</div>' : '') +
      (bc ? '<div class="panel reveal">' + panelHead(d.bars) + bc + '</div>' : '') + '</div>' +
      (cl.title ? '<div class="demo-close reveal">' + (cl.eyebrow ? '<p class="eyebrow">' + esc(cl.eyebrow) + '</p>' : '') +
        '<h2>' + esc(cl.title) + '</h2>' + (cl.text ? '<p class="sub">' + esc(cl.text) + '</p>' : '') + '</div>' : '');
  }

  function calSrc(u) {
    u = String(u || '').trim(); if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://cal.com/' + u.replace(/^\/+/, '');
    try {
      var x = new URL(u);
      if (!/^(([a-z0-9-]+\.)?cal\.com|cal\.eu|app\.cal\.eu)$/i.test(x.hostname) || x.protocol !== 'https:') return '';
      return x.href;
    } catch (e) { return ''; }
  }

  function renderBooking(b) {
    var url = calSrc(b.calUrl), sec = $('randevu'); sec.hidden = !url;
    if (!url) return;
    var emb = new URL(url); emb.searchParams.set('embed', 'true'); emb.searchParams.set('theme', 'light');
    $('booking').innerHTML = '<div class="book"><div class="reveal">' + (b.eyebrow ? '<p class="eyebrow">' + esc(b.eyebrow) + '</p>' : '') +
      '<h2>' + esc(b.title) + (b.accent ? ' <em>' + esc(b.accent) + '</em>' : '') + '</h2>' +
      (b.text ? '<p class="sub">' + esc(b.text) + '</p>' : '') +
      '<p style="margin-top:28px"><a class="btn btn-sm" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(b.cta || 'Yeni sekmede aç') + '</a></p></div>' +
      '<div class="cal reveal"><iframe src="' + esc(emb.href) + '" title="Randevu takvimi" loading="lazy"></iframe></div></div>';
  }

  function heroCycle() {
    var li = document.querySelectorAll('.steps-mini li');
    if (!li.length) return;
    var i = 0; li[0].classList.add('on');
    if (window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    setInterval(function () { li[i].classList.remove('on'); i = (i + 1) % li.length; li[i].classList.add('on'); }, 2200);
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

  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count')), t0 = null, dur = 1400;
    if (isNaN(end)) return;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = tr(Math.round(end * e));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0'; requestAnimationFrame(step);
  }

  function reveal() {
    var els = document.querySelectorAll('.reveal'), counts = document.querySelectorAll('[data-count]');
    var still = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (!('IntersectionObserver' in window) || still) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    els.forEach(function (e) {
      var sib = e.parentNode ? [].filter.call(e.parentNode.children, function (x) { return x.classList.contains('reveal'); }) : [];
      var d = Math.min(sib.indexOf(e), 5) * 90; if (d > 0) e.style.transitionDelay = d + 'ms';
    });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        var t = x.target; t.classList.add('in'); io.unobserve(t);
        setTimeout(function () { t.style.transitionDelay = ''; }, 1200);
      });
    }, { threshold: .08 });
    els.forEach(function (e) { io.observe(e); });
    var io2 = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { countUp(x.target); io2.unobserve(x.target); } });
    }, { threshold: .6 });
    counts.forEach(function (e) { io2.observe(e); });
  }

  var bar = $('progress');
  function prog() { var h = document.documentElement; var m = h.scrollHeight - h.clientHeight; bar.style.transform = 'scaleX(' + (m > 0 ? Math.min(1, h.scrollTop / m) : 0) + ')'; }
  window.addEventListener('scroll', prog, { passive: true }); prog();

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
