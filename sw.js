/* OmniAI - service worker MINIMAL (v2026.10.27).
   SENGAJA TANPA CACHE: setiap halaman selalu diambil langsung dari GitHub, jadi versi baru langsung terpakai
   (tidak ada masalah "versi lama tertinggal"). Hanya ada supaya bisa dipasang sebagai aplikasi di HP. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || e.request.mode !== 'navigate') return; // selain halaman: browser biasa
  e.respondWith(fetch(e.request, { cache: 'no-store' }).catch(function () {
    return new Response('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:sans-serif;padding:24px;background:#0f766e;color:#fff"><h3>OmniAI butuh internet</h3><p>Sambungkan internet lalu tarik layar ke bawah untuk memuat ulang.</p></body>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }));
});
