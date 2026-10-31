/* ساحل هوشمند — سرویس‌ورکر v18
   استراتژی:
   - index.html و SW: همیشه شبکه اول (network-first) تا نسخه جدید همیشه بیاید
   - بقیه فایل‌های استاتیک: کش اول ولی در پس‌زمینه تازه شود
   - آدرس‌های گوگل (داده): هرگز کش نشوند
*/
var V = 'sahel-v18', SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(V).then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (k) {
      return Promise.all(k.filter(function (x) { return x !== V; }).map(function (x) { return caches.delete(x); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);

  // فقط GET و هم‌مبدأ
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;

  // برای HTML و sw.js: همیشه شبکه اول (اگر آفلاین بود، از کش)
  if (e.request.mode === 'navigate' || /\/index\.html$/.test(u.pathname) || /\/sw\.js$/.test(u.pathname)) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then(function (r) {
          if (r && r.ok) {
            var cp = r.clone();
            caches.open(V).then(function (c) { c.put(e.request, cp); });
          }
          return r;
        })
        .catch(function () { return caches.match(e.request, { ignoreSearch: true }); })
    );
    return;
  }

  // بقیه: کش اول + تازه‌سازی در پس‌زمینه
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(e.request).then(function (r) {
        if (r && r.ok) {
          var cp = r.clone();
          caches.open(V).then(function (c) { c.put(e.request, cp); });
        }
        return r;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
