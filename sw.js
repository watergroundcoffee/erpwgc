/* OmniAI - service worker v2026.10.143 (Paket 122; dibuat Paket 121, DN-294): buka cepat & tetap bisa dipakai tanpa internet.
   - Halaman (index.html dsb.): JARINGAN DULU maks 3,5 detik -> versi baru langsung terpakai; bila lambat / offline
     dipakai salinan terakhir di perangkat (lalu diperbarui diam-diam saat jaringan kembali).
   - Ikon, manifest, font & pustaka CDN: simpanan dulu, diperbarui di latar (stale-while-revalidate).
   - TIDAK PERNAH menyimpan panggilan API / data (POST, Supabase Functions & Storage) - data offline diurus aplikasi
     (simpanan lokal per layar + antrean kirim). */
var VERSI_SW = 'omniai-v2026.10.143';
var HALAMAN = VERSI_SW + '-halaman', ASET = VERSI_SW + '-aset';
var PRA = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(HALAMAN).then(function (c) { return Promise.all(PRA.map(function (u) { return c.add(new Request(u, { cache: 'reload' })).catch(function () { }); })); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (n) { return n.indexOf(VERSI_SW) !== 0; }).map(function (n) { return caches.delete(n); })); }).then(function () { return self.clients.claim(); }));
});
function bolehAset(url) {
  if (url.origin === self.location.origin) return /\.(png|jpe?g|webp|svg|ico|webmanifest|woff2?|ttf|css)$/i.test(url.pathname);
  return /(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com)$/i.test(url.hostname);
}
function denganBatas(p, ms) { return new Promise(function (ok, no) { var t = setTimeout(function () { no(new Error('lambat')); }, ms); p.then(function (r) { clearTimeout(t); ok(r); }, function (e) { clearTimeout(t); no(e); }); }); }
var OFFLINE_HTML = '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:sans-serif;padding:24px;background:#0f766e;color:#fff"><h3>OmniAI belum tersimpan di perangkat ini</h3><p>Buka sekali saat ada internet - setelah itu aplikasi bisa dibuka tanpa internet.</p></body>';
self.addEventListener('fetch', function (e) {
  var req = e.request; if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (/supabase\.co$/i.test(url.hostname) || /\/functions\/v1\//.test(url.pathname)) return; // API & file: selalu langsung
  if (req.mode === 'navigate') {
    var kunci = url.origin + url.pathname; // tanpa ?query / #hash -> 1 salinan per halaman
    var jaringan = fetch(req, { cache: 'no-store' }).then(function (r) {
      if (r && r.ok) { var salin = r.clone(); caches.open(HALAMAN).then(function (c) { c.put(kunci, salin); }); }
      return r;
    });
    e.respondWith(denganBatas(jaringan, 3500).catch(function () {
      return caches.open(HALAMAN).then(function (c) { return c.match(kunci).then(function (m) { return m || c.match(url.origin + url.pathname.replace(/[^/]*$/, '') + 'index.html') || c.match('./index.html'); }); })
        .then(function (m) { return m || jaringan.catch(function () { return new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }); }); });
    }));
    return;
  }
  if (bolehAset(url)) {
    e.respondWith(caches.open(ASET).then(function (c) {
      return c.match(req).then(function (m) {
        var baru = fetch(req).then(function (r) { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(function () { return m; });
        return m || baru;
      });
    }));
  }
});
