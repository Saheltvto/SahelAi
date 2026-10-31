/* ساحل هوشمند — سرویس‌ورکر: پوستهٔ برنامه فوری از حافظه بالا می‌آید و در پس‌زمینه تازه می‌شود */
var V = 'sahel-v11', SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== V; }).map(function (x) { return caches.delete(x); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // آدرس‌های گوگل (داده) هرگز از اینجا رد نمی‌شوند
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(e.request).then(function (r) { if (r && r.ok) { var cp = r.clone(); caches.open(V).then(function (c) { c.put(e.request, cp); }); } return r; }).catch(function () { return hit; });
    return hit || net;
  }));
});
