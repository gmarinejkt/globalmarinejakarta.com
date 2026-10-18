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
    document.documentElement.lang = lang;
    setPlaceholders(lang);
  }

  var sel = document.getElementById('languageSelect');
  if (sel) {
    var saved = null;
    try { saved = localStorage.getItem('gm-lang'); } catch (e) {}
    if (saved === 'en' || saved === 'id') { sel.value = saved; }
    applyLang(sel.value);
    sel.addEventListener('change', function () {
      try { localStorage.setItem('gm-lang', this.value); } catch (e) {}
      applyLang(this.value);
    });
  }

  window.sendMessage = function (event) {
    event.preventDefault();
    var g = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
    var text = encodeURIComponent('Name: ' + g('name') + '\nEmail: ' + g('email') + '\nMessage: ' + g('message'));
    window.open('https://wa.me/6281289865224?text=' + text, '_blank');
  };
})();
