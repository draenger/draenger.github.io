// Language detection & switcher.
// EN lives at "/", PL at "/pl.html"; both are linked with hreflang, so crawlers index each
// page on its own. The first-visit redirect below only runs for real visitors on "/".
(function () {
  var LANG_KEY = 'preferred-lang';
  var path = location.pathname;
  var isEN = path === '/' || path.endsWith('/index.html');
  if (!isEN) return;

  var saved = null;
  try { saved = localStorage.getItem(LANG_KEY); } catch (e) {}
  if (saved) return; // user already chose: don't redirect

  // Never redirect crawlers, link-preview bots or automated browsers.
  var ua = navigator.userAgent || '';
  if (navigator.webdriver || /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|lighthouse|headless/i.test(ua)) return;

  // First visit: detect country via IP.
  fetch('https://get.geojs.io/v1/ip/country.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.country === 'PL') {
        try { localStorage.setItem(LANG_KEY, 'pl'); } catch (e) {}
        location.replace('pl.html');
      }
    })
    .catch(function () {}); // silently fail: stay on the current page
})();

function switchLang(lang) {
  try { localStorage.setItem('preferred-lang', lang); } catch (e) {}
  location.href = lang === 'pl' ? 'pl.html' : '/';
}
