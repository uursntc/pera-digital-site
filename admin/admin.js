(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var LS = 'pera_admin_gh', state = null, sha = null, mode = 'github', dirty = false, current = null;

  var LABELS = {
    site: 'Site ayarları', contact: 'İletişim', cta: 'Buton yazısı', nav: 'Menü', navCta: 'Menü butonu', hero: 'Ana ekran', marquee: 'Markalar şeridi',
    approach: 'Yaklaşım', about: 'Hakkımızda · Misyon · Vizyon', services: 'Hizmetler', audience: 'Hedef kitle',
    results: 'Sonuçlar', process: 'Süreç', apply: 'Başvuru formu', faq: 'SSS', footer: 'Alt bilgi',
    name: 'Marka adı', title: 'Başlık', accent: 'Vurgulu başlık (italik)', titleAccent: 'Vurgulu başlık (italik)', description: 'Açıklama (SEO)',
    email: 'E-posta (başvurular buraya düşer)', instagram: 'Instagram kullanıcı adı', instagramUrl: 'Instagram linki',
    logo: 'Logo dosya yolu', announce: 'Üst duyuru çubuğu (boşsa gizlenir)', label: 'Etiket', href: 'Bağlantı',
    badge: 'Rozet', text: 'Metin', primaryCta: 'Ana buton', secondaryCta: 'İkinci buton', stats: 'Rakamlar (değer boşsa gizlenir)',
    value: 'Değer', items: 'Öğeler', eyebrow: 'Üst etiket', num: 'Numara', tags: 'Etiketler', tag: 'Etiket', metric: 'Rakam',
    metricLabel: 'Rakam açıklaması', steps: 'Adımlar', time: 'Süre', mission: 'Misyon', vision: 'Vizyon', values: 'Çalışma ilkeleri', valuesTitle: 'Çalışma ilkeleri başlığı',
    checks: 'Maddeler', formTitle: 'Form başlığı', submitLabel: 'Gönder butonu', successTitle: 'Başarı başlığı', successText: 'Başarı metni',
    kvkkText: 'KVKK onay metni', kvkkUrl: 'KVKK sayfası linki', endpoint: 'Form adresi (Formspree / Web3Forms)', accessKey: 'Web3Forms access key',
    mailtoFallback: 'Yedek e-posta (form adresi yoksa)', sectors: 'Sektör seçenekleri', budgets: 'Bütçe seçenekleri',
    services_: 'Hizmet seçenekleri', q: 'Soru', a: 'Cevap', tagline: 'Slogan', copyright: 'Telif satırı'
  };
  var HINTS = {
    'apply.endpoint': 'Başvuruların e-postanıza düşmesi için: formspree.io\'dan ücretsiz form açın, verilen adresi (https://formspree.io/f/xxxx) buraya yapıştırın.',
    'site.logo': 'Logoyu depodaki assets klasörüne yükleyip yolunu yazın (ör. assets/logo.png).',
    'results.items': 'Vaka eklemezseniz Sonuçlar bölümü ve menüdeki linki sitede otomatik gizlenir. “Başlık buraya gelecek” gibi örnekleri silin ya da doldurun.',
    'hero.stats': 'Değeri boş bırakılan rakamlar sitede görünmez.'
  };
  var TEMPLATES = { 'marquee.items': '', 'results.items': { tag: '', title: '', text: '', metric: '', metricLabel: '' } };
  var LONG = /^(text|a|description|q|successText|kvkkText)$/;

  function label(k, path) {
    if (path === 'apply.services') return 'Hizmet seçenekleri';
    return LABELS[k] || k;
  }
  function getAt(p) { return p.reduce(function (o, k) { return o[k]; }, state); }
  function setAt(p, v) { var o = getAt(p.slice(0, -1)); o[p[p.length - 1]] = v; touch(); }
  function touch() { dirty = true; status('Kaydedilmemiş değişiklik var', ''); }
  function status(t, c) { var s = $('status'); s.textContent = t; s.className = c || ''; }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'class') e.className = attrs[k]; else if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }
  function blank(v) {
    if (typeof v === 'string') return '';
    if (Array.isArray(v)) return [];
    if (v && typeof v === 'object') { var o = {}; Object.keys(v).forEach(function (k) { o[k] = blank(v[k]); }); return o; }
    return v;
  }

  /* ---------- generic renderer ---------- */
  function field(k, v, path, parent) {
    var key = path.join('.');
    var wrap = el('div', { class: 'fld' });
    var lab = (path[0] === 'apply' && path[1] === 'services') ? 'Hizmet seçenekleri' : label(k);

    if (typeof v === 'string') {
      wrap.appendChild(el('label', { text: lab }));
      var inp = (LONG.test(k) || v.length > 70) ? el('textarea', {}) : el('input', { type: 'text' });
      inp.value = v;
      inp.addEventListener('input', function () { setAt(path, inp.value); });
      wrap.appendChild(inp);
      if (HINTS[key]) wrap.appendChild(el('p', { class: 'hint', text: HINTS[key] }));
      return wrap;
    }
    if (Array.isArray(v)) return list(k, v, path, lab);
    if (v && typeof v === 'object') {
      var g = el('div', { class: 'grp' }, [el('h3', { text: lab })]);
      Object.keys(v).forEach(function (kk) { g.appendChild(field(kk, v[kk], path.concat(kk), v)); });
      if (HINTS[key]) g.appendChild(el('p', { class: 'hint', text: HINTS[key] }));
      return g;
    }
    return wrap;
  }

  function list(k, arrv, path, lab) {
    var key = path.join('.');
    var strings = arrv.length ? typeof arrv[0] === 'string' : (key in TEMPLATES ? typeof TEMPLATES[key] === 'string' : true);
    var g = el('div', { class: 'grp' }, [el('h3', { text: lab })]);
    if (HINTS[key]) g.appendChild(el('p', { class: 'hint', text: HINTS[key] }));
    var box = el('div');
    g.appendChild(box);

    function redraw() {
      box.innerHTML = '';
      arrv.forEach(function (it, i) {
        var p = path.concat(i);
        function move(d) { var j = i + d; if (j < 0 || j >= arrv.length) return; var t = arrv[i]; arrv[i] = arrv[j]; arrv[j] = t; touch(); rerenderTab(); }
        function del() { arrv.splice(i, 1); touch(); rerenderTab(); }
        if (strings) {
          var row = el('div', { class: 'srow' });
          var inp = el('input', { type: 'text' }); inp.value = it;
          inp.addEventListener('input', function () { arrv[i] = inp.value; touch(); });
          row.appendChild(inp);
          [['↑', function () { move(-1); }], ['↓', function () { move(1); }], ['✕', del]].forEach(function (b) {
            var bt = el('button', { class: 'ghost sm' + (b[0] === '✕' ? ' danger' : ''), type: 'button', text: b[0] }); bt.onclick = b[1]; row.appendChild(bt);
          });
          box.appendChild(row);
        } else {
          var card = el('div', { class: 'item' });
          var h = el('div', { class: 'item-h' }, [el('b', { text: (lab + ' ' + (i + 1)) })]);
          [['↑', function () { move(-1); }], ['↓', function () { move(1); }], ['Sil', del]].forEach(function (b) {
            var bt = el('button', { class: 'ghost sm' + (b[0] === 'Sil' ? ' danger' : ''), type: 'button', text: b[0] }); bt.onclick = b[1]; h.appendChild(bt);
          });
          card.appendChild(h);
          Object.keys(it).forEach(function (kk) { card.appendChild(field(kk, it[kk], p.concat(kk), it)); });
          box.appendChild(card);
        }
      });
      var add = el('button', { class: 'ghost sm', type: 'button', text: '+ Ekle' });
      add.onclick = function () {
        var tpl = arrv.length ? blank(arrv[0]) : (key in TEMPLATES ? JSON.parse(JSON.stringify(TEMPLATES[key])) : '');
        arrv.push(tpl); touch(); rerenderTab();
      };
      box.appendChild(add);
    }
    redraw();
    return g;
  }

  function rerenderTab() { show(current); }
  function show(k) {
    current = k;
    [].forEach.call($('tabs').children, function (a) { a.classList.toggle('on', a.dataset.k === k); });
    var pane = $('pane'); pane.innerHTML = '';
    pane.appendChild(el('h2', { text: LABELS[k] || k }));
    var v = state[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.keys(v).forEach(function (kk) { pane.appendChild(field(kk, v[kk], [k, kk], v)); });
    } else pane.appendChild(field(k, v, [k], state));
  }
  function build() {
    var t = $('tabs'); t.innerHTML = '';
    Object.keys(state).forEach(function (k) {
      var a = el('a', { text: LABELS[k] || k }); a.dataset.k = k; a.onclick = function () { show(k); window.scrollTo(0, 0); }; t.appendChild(a);
    });
    show(current && state[current] !== undefined ? current : Object.keys(state)[0]);
  }

  /* ---------- GitHub ---------- */
  function cfg() { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; } }
  function readCfg() {
    return { owner: $('gOwner').value.trim(), repo: $('gRepo').value.trim(), branch: $('gBranch').value.trim() || 'main', path: $('gPath').value.trim() || 'content.json', token: $('gToken').value.trim() };
  }
  function api(c, method, body) {
    var url = 'https://api.github.com/repos/' + encodeURIComponent(c.owner) + '/' + encodeURIComponent(c.repo) + '/contents/' + c.path.split('/').map(encodeURIComponent).join('/');
    if (method === 'GET') url += '?ref=' + encodeURIComponent(c.branch) + '&t=' + Date.now();
    return fetch(url, { method: method, headers: { 'Authorization': 'Bearer ' + c.token, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) { var e = new Error(j.message || r.status); e.status = r.status; throw e; } return j; }); });
  }
  var b64d = function (s) { return decodeURIComponent(escape(atob(s.replace(/\n/g, '')))); };
  var b64e = function (s) { return btoa(unescape(encodeURIComponent(s))); };

  function connect() {
    var c = readCfg(), er = $('loginErr'); er.textContent = '';
    if (!c.owner || !c.repo || !c.token) { er.textContent = 'Kullanıcı adı, depo adı ve token gerekli.'; return; }
    $('btnConnect').disabled = true;
    api(c, 'GET').then(function (j) {
      sha = j.sha; state = JSON.parse(b64d(j.content)); mode = 'github';
      localStorage.setItem(LS, JSON.stringify(c)); start();
    }).catch(function (e) {
      er.textContent = e.status === 401 ? 'Token geçersiz ya da süresi dolmuş.' : e.status === 404 ? 'Depo ya da dosya bulunamadı. Adları ve token\'ın bu depoya erişimini kontrol edin.' : 'Hata: ' + e.message;
    }).then(function () { $('btnConnect').disabled = false; });
  }
  function save() {
    var c = cfg();
    if (mode !== 'github') { status('Yerel modda: “JSON indir” ile kaydedip depoya yükleyin.', 'err'); return; }
    var btn = $('btnSave'); btn.disabled = true; status('Kaydediliyor…', '');
    var body = { message: 'İçerik güncellendi (admin paneli)', content: b64e(JSON.stringify(state, null, 2) + '\n'), sha: sha, branch: c.branch };
    api(c, 'PUT', body).then(function (j) {
      sha = j.content.sha; dirty = false; status('Kaydedildi ✓ Site 1–2 dk içinde güncellenir.', 'ok');
    }).catch(function (e) {
      if (e.status === 409 || e.status === 422) status('Dosya başka yerden değişmiş. Sayfayı yenileyip tekrar bağlanın.', 'err');
      else if (e.status === 403 || e.status === 404) status('Yazma izni yok. Token\'ın “Contents: Read and write” iznini kontrol edin.', 'err');
      else status('Hata: ' + e.message, 'err');
    }).then(function () { btn.disabled = false; });
  }

  function start() { $('login').hidden = true; $('app').hidden = false; dirty = false; status('', ''); build(); }

  /* ---------- buttons ---------- */
  $('btnConnect').onclick = connect;
  $('btnLocal').onclick = function () {
    fetch('../content.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (j) { state = j; mode = 'local'; start(); status('Yerel mod: değişiklikleri JSON olarak indirin.', ''); })
      .catch(function () { $('loginErr').textContent = 'content.json okunamadı. Paneli yerel sunucu veya GitHub Pages üzerinden açın.'; });
  };
  $('btnSave').onclick = save;
  $('btnPreview').onclick = function () {
    try { localStorage.setItem('pera_preview', JSON.stringify(state)); } catch (e) {}
    window.open('../index.html?preview=1', '_blank');
  };
  $('btnDownload').onclick = function () {
    var a = el('a', { href: URL.createObjectURL(new Blob([JSON.stringify(state, null, 2) + '\n'], { type: 'application/json' })), download: 'content.json' });
    document.body.appendChild(a); a.click(); a.remove();
  };
  $('btnUpload').onclick = function () { $('fileIn').click(); };
  $('fileIn').onchange = function (e) {
    var f = e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () { try { state = JSON.parse(r.result); touch(); build(); } catch (x) { status('Geçersiz JSON dosyası.', 'err'); } };
    r.readAsText(f); e.target.value = '';
  };
  $('btnLogout').onclick = function () { localStorage.removeItem(LS); location.reload(); };
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- init: GitHub Pages adresinden otomatik doldur ---------- */
  var c = cfg();
  var m = location.hostname.match(/^([^.]+)\.github\.io$/);
  if (m) {
    c.owner = c.owner || m[1];
    var seg = location.pathname.split('/').filter(Boolean)[0];
    c.repo = c.repo || (seg && seg !== 'admin' ? seg : m[1] + '.github.io');
  }
  $('gOwner').value = c.owner || ''; $('gRepo').value = c.repo || ''; $('gBranch').value = c.branch || 'main'; $('gPath').value = c.path || 'content.json'; $('gToken').value = c.token || '';
  if (c.owner && c.repo && c.token) connect();
})();
