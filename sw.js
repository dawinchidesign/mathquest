/* MathQuest service worker: офлайн жұмыс үшін файлдарды кэштейді. */
const CACHE = 'mathquest-v8-20261021';
const ASSETS = ['./', 'index.html', 'css/app.css', 'js/config.js', 'js/cloud.js', 'js/app.js', 'js/labs.js', 'js/anim.js', 'data/anim/algebra.js', 'data/anim/combinatorics.js', 'data/anim/data.js', 'data/anim/finance.js', 'data/anim/geometry.js', 'data/anim/logic.js', 'data/anim/mixtures.js', 'data/anim/motion.js', 'data/anim/numbers.js', 'data/anim/percent.js', 'data/anim/practical.js', 'data/anim/probability.js', 'data/anim/sets.js', 'data/anim/units.js', 'data/anim/work.js', 'js/auth.js', 'js/teacher.js', 'data/bank.js', 'data/content.js', 'data/curriculum.js', 'data/missions.js', 'data/visuals.js', 'manifest.webmanifest', 'assets/icon.svg', "assets/fonts/geologica-cyrillic-ext-wght-normal.woff2","assets/fonts/geologica-cyrillic-wght-normal.woff2","assets/fonts/geologica-latin-wght-normal.woff2","assets/fonts/literata-cyrillic-400-italic.woff2","assets/fonts/literata-cyrillic-400-normal.woff2","assets/fonts/literata-cyrillic-600-normal.woff2","assets/fonts/literata-cyrillic-ext-400-italic.woff2","assets/fonts/literata-cyrillic-ext-400-normal.woff2","assets/fonts/literata-cyrillic-ext-600-normal.woff2","assets/fonts/literata-latin-400-italic.woff2","assets/fonts/literata-latin-400-normal.woff2","assets/fonts/literata-latin-600-normal.woff2"];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('mathquest-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') { e.respondWith(fetch(req).catch(() => caches.match('index.html'))); return; }
  // config.js әрқашан желіден (баптау өзгерсе бірден қолданылсын), желі болмаса — кэштен
  if (url.pathname.endsWith('/js/config.js')) { e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('js/config.js', copy)); return r; }).catch(() => caches.match('js/config.js'))); return; }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)));
});
