// Mağaza Rapor — telefonda "uygulama gibi" açılış için önbellek.
// Yalnızca telefonda kaydedilir (rapor.html). Sayfanın kendisi her zaman önce
// internetten istenir, böylece güncellemeler hemen gelir; internet yoksa ya da
// çok yavaşsa son kaydedilen kopya açılır. Firebase'in veri bağlantılarına
// dokunulmaz (veriler Firestore'un kendi çevrimdışı önbelleğinden gelir).
const ONBELLEK = 'magaza-rapor-v1';
const SABITLER = ['rapor.html', 'simge.svg?v=2', 'simge-180.png?v=2', 'simge-192.png?v=2', 'giris-arka.jpg', 'manifest.webmanifest'];
const CDN = ['https://www.gstatic.com/firebasejs/', 'https://cdnjs.cloudflare.com/', 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(ONBELLEK).then(c=> c.addAll(SABITLER)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(adlar=> Promise.all(adlar.filter(a=> a !== ONBELLEK).map(a=> caches.delete(a))))
    .then(()=> self.clients.claim()));
});

function zamanAsimi(ms){ return new Promise((_, rej)=> setTimeout(()=> rej(new Error('zaman aşımı')), ms)); }

self.addEventListener('fetch', e=>{
  const istek = e.request;
  if(istek.method !== 'GET') return;
  const url = new URL(istek.url);
  const ayniKaynak = url.origin === self.location.origin;

  // Sayfa: önce internet (en fazla 6 sn), olmazsa önbellek.
  if(ayniKaynak && (istek.mode === 'navigate' || url.pathname.endsWith('/rapor.html'))){
    e.respondWith((async ()=>{
      const c = await caches.open(ONBELLEK);
      try{
        const cevap = await Promise.race([fetch(istek), zamanAsimi(6000)]);
        if(cevap && cevap.ok) c.put('rapor.html', cevap.clone());
        return cevap;
      }catch(err){
        return (await c.match('rapor.html')) || Response.error();
      }
    })());
    return;
  }

  // Simgeler, fotoğraf, kütüphaneler: önbellekte varsa hemen, arkada tazelenir.
  if(ayniKaynak || CDN.some(k=> istek.url.startsWith(k))){
    e.respondWith((async ()=>{
      const c = await caches.open(ONBELLEK);
      const eski = await c.match(istek);
      const taze = fetch(istek).then(cevap=>{
        if(cevap && (cevap.ok || cevap.type === 'opaque')) c.put(istek, cevap.clone());
        return cevap;
      }).catch(()=> eski);
      return eski || taze;
    })());
  }
});
