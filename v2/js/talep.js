// Ürün talep sistemi: mağaza sepeti ve bölge müdürü raporu.
import * as U from './util.js';
import * as V from './veri.js';

const sepetler = {};   // magazaKey -> {urunId: adet}

export function haftaninTalebi(magazaKey, pzt){
  const hk = U.haftaKey(pzt);
  return V.taleplerGetir().find(t => t.magazaKey === magazaKey && t.hafta === hk) || null;
}

export function talepEkrani(magazaKey, yenile){
  const pzt = U.pazartesi(U.bugun());
  const mevcut = haftaninTalebi(magazaKey, pzt);
  const sepet = sepetler[magazaKey] = sepetler[magazaKey] || {};
  const kategoriler = V.kategorilerGetir();

  const kok = U.el(`<div class="talep-ekran">
    <div class="talep-sol">
      <div class="bolum-ust">
        <h2>Ürün talebi</h2>
        <span class="alt">${U.haftaBasligi(pzt)} · talep günü pazartesi</span>
      </div>
      <div class="kategori-liste"></div>
    </div>
    <aside class="talep-sag">
      <div class="panel-kutu">
        <h3>Sepet</h3>
        <div class="sepet-liste"></div>
        <button class="mini birincil gonder">Talebi gönder</button>
        <div class="sepet-not"></div>
      </div>
      <div class="panel-kutu">
        <h3>Geçmiş talepler</h3>
        <div class="talep-gecmis"></div>
      </div>
    </aside>
  </div>`);

  const katListe = kok.querySelector('.kategori-liste');
  kategoriler.forEach(kat => {
    const blok = U.el(`<div class="kategori"><h4>${U.esc(kat.ad)}</h4><div class="urunler"></div></div>`);
    const kap = blok.querySelector('.urunler');
    (kat.urunler || []).forEach(u => {
      const satir = U.el(`<div class="urun-satir">
        <span class="u-ad">${U.esc(u.ad)}</span>
        <button class="mini" data-ekle="${u.id}">+</button>
      </div>`);
      satir.querySelector('[data-ekle]').addEventListener('click', () => {
        sepet[u.id] = (sepet[u.id] || 0) + 1;
        sepetCiz();
      });
      kap.appendChild(satir);
    });
    katListe.appendChild(blok);
  });

  const sepetListe = kok.querySelector('.sepet-liste');
  const not = kok.querySelector('.sepet-not');
  const gonderBtn = kok.querySelector('.gonder');

  function urunAdi(id){
    for(const k of kategoriler){
      const u = (k.urunler || []).find(x => x.id === id);
      if(u) return u.ad;
    }
    return id;
  }
  function sepetCiz(){
    const idler = Object.keys(sepet).filter(id => sepet[id] > 0);
    sepetListe.innerHTML = idler.length ? '' : '<div class="menu-bos">Sepet boş.</div>';
    idler.forEach(id => {
      const satir = U.el(`<div class="sepet-satir">
        <span class="s-ad">${U.esc(urunAdi(id))}</span>
        <button class="mini" data-eksi="${id}">−</button>
        <span class="s-adet">${sepet[id]}</span>
        <button class="mini" data-arti="${id}">+</button>
        <button class="mini" data-sil="${id}">✕</button>
      </div>`);
      satir.querySelector('[data-eksi]').addEventListener('click', () => { sepet[id] = Math.max(0, sepet[id]-1); sepetCiz(); });
      satir.querySelector('[data-arti]').addEventListener('click', () => { sepet[id]++; sepetCiz(); });
      satir.querySelector('[data-sil]').addEventListener('click', () => { delete sepet[id]; sepetCiz(); });
      sepetListe.appendChild(satir);
    });
    gonderBtn.disabled = !idler.length;
  }
  sepetCiz();

  gonderBtn.addEventListener('click', () => {
    const satirlar = Object.keys(sepet).filter(id => sepet[id] > 0).map(id => ({urunId:id, ad:urunAdi(id), adet:sepet[id]}));
    if(!satirlar.length) return;
    const eski = haftaninTalebi(magazaKey, pzt);
    const liste = V.taleplerGetir().filter(t => t !== eski);
    liste.push({
      id: 't' + Date.now(), magazaKey, hafta: U.haftaKey(pzt),
      tarih: new Date().toISOString(), durum: 'Gönderildi', satirlar
    });
    V.taleplerYaz(liste);
    Object.keys(sepet).forEach(k => delete sepet[k]);
    sepetCiz();
    gecmisCiz();
    not.textContent = eski ? 'Bu haftanın talebi güncellendi ✓' : 'Talep gönderildi ✓';
    setTimeout(() => { not.textContent = ''; }, 2500);
  });

  const gecmis = kok.querySelector('.talep-gecmis');
  function gecmisCiz(){
    const liste = V.taleplerGetir().filter(t => t.magazaKey === magazaKey).sort((a,b) => b.tarih.localeCompare(a.tarih));
    gecmis.innerHTML = liste.length ? '' : '<div class="menu-bos">Henüz talep yok.</div>';
    liste.slice(0,8).forEach(t => {
      gecmis.appendChild(U.el(`<div class="gecmis-satir">
        <div class="g-ust"><b>${U.esc(t.hafta)}</b><span class="durum ${t.durum === 'Gönderildi' ? 'bekliyor' : ''}">${U.esc(t.durum)}</span></div>
        <div class="g-alt">${t.satirlar.map(s => U.esc(s.ad) + ' ×' + s.adet).join(', ')}</div>
      </div>`));
    });
  }
  gecmisCiz();

  if(mevcut) not.textContent = 'Bu hafta için zaten bir talep gönderilmiş; yeni gönderim onu günceller.';
  return kok;
}

// Bölge müdürü için pazartesi raporu.
export function talepRaporu(pzt){
  const hk = U.haftaKey(pzt);
  const magazalar = V.magazalar();
  const talepler = V.taleplerGetir().filter(t => t.hafta === hk);
  const gonderen = talepler.map(t => t.magazaKey);
  return {
    hafta: hk,
    gonderenler: magazalar.filter(m => gonderen.includes(m.key)),
    gondermeyenler: magazalar.filter(m => !gonderen.includes(m.key)),
    talepler
  };
}
