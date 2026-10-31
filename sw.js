/* ساحل هوشمند — سرویس‌ورکر: اول شبکه، بعد کش (آفلاین) */
var V = 'sahel-v24', SHELL = ['./', 'index.html', 'manifest.webmanifest'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) {
    return Promise.all(SHELL.map(function (u) { return c.add(new Request(u, { cache: 'reload' })).catch(function () {}); });
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (x) { return x !== V; }).map(function (x) { return caches.delete(x); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // آدرس‌های گوگل (داده) از اینجا رد نمی‌شوند
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(function (r) {
      if (r && r.ok) { var cp = r.clone(); caches.open(V).then(function (c) { c.put(e.request, cp); }); }
      return r;
    }).catch(function () { return caches.match(e.request, { ignoreSearch: true }); })
  );
});
