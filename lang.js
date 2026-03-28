// Language detection & switcher
(function () {
  const LANG_KEY = 'preferred-lang';
  const saved = localStorage.getItem(LANG_KEY);
  const isEN = location.pathname === '/' || location.pathname.endsWith('/index.html');
  const isPL = location.pathname.endsWith('/pl.html');

  if (saved) return; // user already chose — don't redirect

  // First visit: detect country via IP
  fetch('https://get.geojs.io/v1/ip/country.json')
    .then(r => r.json())
    .then(data => {
      if (data.country === 'PL' && isEN) {
        localStorage.setItem(LANG_KEY, 'pl');
        location.replace('pl.html');
      }
    })
    .catch(() => {}); // silently fail — default to current page
})();

function switchLang(lang) {
  localStorage.setItem('preferred-lang', lang);
  location.href = lang === 'pl' ? 'pl.html' : '/';
}
