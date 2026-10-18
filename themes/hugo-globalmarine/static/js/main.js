(function () {
  var st = document.getElementById('scroll-top');
  if (st) {
    window.addEventListener('scroll', function () {
      st.style.display = window.pageYOffset > 100 ? 'flex' : 'none';
    });
    st.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var translatable = document.body.hasAttribute('data-translate');

  function setPlaceholders(lang) {
    var map = { name: ['Your Name', 'Nama Anda'], email: ['Your Email', 'Email Anda'], message: ['Your Message', 'Pesan Anda'] };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.placeholder = lang === 'en' ? map[id][0] : map[id][1];
    });
  }

  function applyLang(lang) {
    document.querySelectorAll('[data-lang]').forEach(function (el) {
      el.style.display = el.getAttribute('data-lang') === lang ? '' : 'none';
    });
    document.documentElement.setAttribute('data-ui-lang', lang);
    setPlaceholders(lang);
  }

  // --- Google Translate (used only for article/blog text, which is written in Indonesian) ---
  function setTransCookie(lang) {
    var val = lang === 'en' ? '/id/en' : '';
    var host = location.hostname;
    var exp = lang === 'en' ? '' : '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'googtrans=' + val + '; path=/' + exp;
    document.cookie = 'googtrans=' + val + '; path=/; domain=' + host + exp;
    var parts = host.split('.');
    if (parts.length > 2) document.cookie = 'googtrans=' + val + '; path=/; domain=.' + parts.slice(-2).join('.') + exp;
  }
  function hasTransCookie() { return /(?:^|;\s*)googtrans=\/id\/en/.test(document.cookie); }
  window.gmTranslateInit = function () {
    new google.translate.TranslateElement({ pageLanguage: 'id', includedLanguages: 'en,id', autoDisplay: false }, 'google_translate_element');
  };
  function loadTranslate() {
    if (document.getElementById('gt-script')) return;
    var s = document.createElement('script');
    s.id = 'gt-script';
    s.src = 'https://translate.google.com/translate_a/element.js?cb=gmTranslateInit';
    document.head.appendChild(s);
  }

  var sel = document.getElementById('languageSelect');
  var lang = 'id';
  try { var saved = localStorage.getItem('gm-lang'); if (saved === 'en' || saved === 'id') lang = saved; } catch (e) {}
  if (sel) sel.value = lang;
  applyLang(lang);

  if (translatable) {
    if (lang === 'en') { if (!hasTransCookie()) setTransCookie('en'); loadTranslate(); }
    else if (hasTransCookie()) { setTransCookie('id'); }
  }

  if (sel) {
    sel.addEventListener('change', function () {
      var l = this.value;
      try { localStorage.setItem('gm-lang', l); } catch (e) {}
      applyLang(l);
      if (translatable) {
        setTransCookie(l);
        location.reload();
      }
    });
  }

  window.sendMessage = function (event) {
    event.preventDefault();
    var g = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
    var text = encodeURIComponent('Name: ' + g('name') + '\nEmail: ' + g('email') + '\nMessage: ' + g('message'));
    window.open('https://wa.me/6281289865224?text=' + text, '_blank');
  };
})();
