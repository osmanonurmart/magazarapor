// Veri katmanı.
// Şimdilik tarayıcının localStorage'ı üstünde çalışıyor; Firebase'e geçerken
// yalnızca bu dosyadaki oku/yaz fonksiyonlarının içi değişecek, çağıran kodu değil.
import { pazartesi, haftaKey, dateStr, haftaGunleri, haftaEkle } from './util.js';

const ON_EK = 'mc2:';
const olaylar = new EventTarget();

function oku(anahtar, varsayilan){
  try{
    const ham = localStorage.getItem(ON_EK + anahtar);
    return ham === null ? varsayilan : JSON.parse(ham);
  }catch(e){ return varsayilan; }
}
function yaz(anahtar, deger){
  try{ localStorage.setItem(ON_EK + anahtar, JSON.stringify(deger)); }
  catch(e){ console.warn('Kaydedilemedi:', anahtar, e); }
  olaylar.dispatchEvent(new CustomEvent('degisti', {detail:{anahtar}}));
}
export function dinle(fn){ olaylar.addEventListener('degisti', fn); }

// ---------------- Profiller ----------------
export const ROLLER = { MAGAZA:'magaza', BOLGE:'bolge', KURUCU:'kurucu' };
export const profilleriGetir = () => oku('profiller', []);
export const profilGetir = key => profilleriGetir().find(p => p.key === key) || null;
export function profilleriYaz(liste){ yaz('profiller', liste); }
export function profilGuncelle(key, alanlar){
  const liste = profilleriGetir();
  const p = liste.find(x => x.key === key);
  if(!p) return null;
  Object.assign(p, alanlar);
  profilleriYaz(liste);
  return p;
}
export function magazalar(){ return profilleriGetir().filter(p => p.rol === ROLLER.MAGAZA); }

// ---------------- Günlük kayıt ----------------
// {ciro, mdo, fbu, fbs, mgs, toplu, hedef, izinler:[{personelId,tur}], yorum, kartlar:{}}
export const gunKey = (magaza, tarih) => 'gun:' + magaza + ':' + tarih;
export function gunGetir(magaza, tarih){ return oku(gunKey(magaza, tarih), null); }
export function gunYaz(magaza, tarih, kayit){ yaz(gunKey(magaza, tarih), kayit); }
export function gunAlanYaz(magaza, tarih, alan, deger){
  const k = gunGetir(magaza, tarih) || {};
  k[alan] = deger;
  k.guncelleme = new Date().toISOString();
  gunYaz(magaza, tarih, k);
  return k;
}
export function haftaKayitlari(magaza, pzt){
  return haftaGunleri(pzt).map(d => gunGetir(magaza, dateStr(d)) || {});
}

// ---------------- Hedefler ----------------
export function haftaHedefGetir(magaza, pzt){ return oku('hedef:' + magaza + ':' + haftaKey(pzt), null); }
export function haftaHedefYaz(magaza, pzt, deger){ yaz('hedef:' + magaza + ':' + haftaKey(pzt), deger); }
// Kural bazlı hedef: geçen haftanın cirosu ± yüzde.
export function kuralHedefi(magaza, pzt, yuzde){
  const gecen = haftaKayitlari(magaza, haftaEkle(pzt, -1))
    .map(k => k.ciro).filter(v => v !== null && v !== undefined && !isNaN(v));
  if(!gecen.length) return null;
  return Math.round(gecen.reduce((a,b)=>a+b,0) * (1 + yuzde/100));
}

// ---------------- Personel ve izin ----------------
export const IZIN_TURLERI = ['Haftalık','Yıllık','Rapor','Ücretsiz','Doğum'];
export function personelGetir(magaza){ return oku('personel:' + magaza, []); }
export function personelYaz(magaza, liste){ yaz('personel:' + magaza, liste); }
// Listeden çıkarılan kişi geçmiş kayıtlarda görünmeye devam etsin diye silinmez, pasife alınır.
export function personelPasifle(magaza, id){
  const liste = personelGetir(magaza);
  const k = liste.find(p => p.id === id);
  if(k){ k.aktif = false; personelYaz(magaza, liste); }
}
export function personelAdi(magaza, id){
  const k = personelGetir(magaza).find(p => p.id === id);
  return k ? k.ad : '(silinmiş)';
}

// ---------------- Haftalık ürün verisi (Excel) ----------------
// {gruplar:[{ad, adet, pay}]} — pay yüzde olarak.
export function urunHaftaGetir(magaza, pzt){ return oku('urun:' + magaza + ':' + haftaKey(pzt), null); }
export function urunHaftaYaz(magaza, pzt, veri){ yaz('urun:' + magaza + ':' + haftaKey(pzt), veri); }

// ---------------- Kartlar (sağ panel) ----------------
export function kartlarGetir(magaza){
  return oku('kartlar:' + magaza, [
    {id:'ciro',  ad:'Ciro',        alan:'ciro',  tur:'kaynak'},
    {id:'mgs',   ad:'MGS',         alan:'mgs',   tur:'kaynak'},
    {id:'toplu', ad:'Toplu satış', alan:'toplu', tur:'kaynak'}
  ]);
}
export function kartlarYaz(magaza, liste){ yaz('kartlar:' + magaza, liste); }

// ---------------- Ürün / kategori ve talepler ----------------
export function kategorilerGetir(){ return oku('kategoriler', []); }
export function kategorilerYaz(liste){ yaz('kategoriler', liste); }
export function taleplerGetir(){ return oku('talepler', []); }
export function taleplerYaz(liste){ yaz('talepler', liste); }
export function talepEkle(talep){
  const liste = taleplerGetir();
  liste.push(talep);
  taleplerYaz(liste);
  return talep;
}

// ---------------- Duyurular ----------------
export function duyurularGetir(){ return oku('duyurular', []); }
export function duyuruEkle(metin){
  const liste = duyurularGetir();
  liste.unshift({id:'d'+Date.now(), metin, tarih:new Date().toISOString()});
  yaz('duyurular', liste.slice(0, 50));
}
export function duyuruSil(id){ yaz('duyurular', duyurularGetir().filter(d => d.id !== id)); }

// ---------------- Görünüm ayarları ----------------
export function bolgeGorunumGetir(){
  return oku('gorunum:bolge', {metrikler:['ciro','mdo','fbu'], kiyas:'gecenHafta'});
}
export function bolgeGorunumYaz(v){ yaz('gorunum:bolge', v); }
export function satirAyariGetir(){
  return oku('gorunum:satirlar', ['ciro','mdo','fbu','mgs','fbs','hedef','oran','toplu']);
}
export function satirAyariYaz(v){ yaz('gorunum:satirlar', v); }
export function etiketleriGetir(){ return oku('etiketler', [{anahtar:'halı', kart:'Halı satışı'}]); }
export function etiketleriYaz(v){ yaz('etiketler', v); }

// ---------------- Oturum ----------------
export function oturumGetir(){ return oku('oturum', null); }
export function oturumYaz(key){ yaz('oturum', key ? {key, ts:Date.now()} : null); }
export function oturumSil(){ try{ localStorage.removeItem(ON_EK + 'oturum'); }catch(e){} }

// ---------------- Tohum veri ----------------
// İlk açılışta 20 mağaza, bölge müdürü ve kurucu profilleri ile birkaç haftalık
// örnek veri üretir. Gerçek veri girilmeye başlayınca bir daha çalışmaz.
const AD_HAVUZU = ['Ahmet','Ayşe','Mehmet','Fatma','Zeynep','Emre','Elif','Burak','Seda','Onur','Merve','Kerem'];
function rastgele(tohum){
  let x = tohum;
  return () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; };
}
export function tohumla(zorla){
  if(!zorla && profilleriGetir().length) return false;

  const renkler = ['#C8A066','#5f8d6a','#6f6494','#a34141','#3f6b8a','#8a6a3f','#4d7d78','#9a5f7a'];
  const profiller = [];
  for(let i=1;i<=20;i++){
    profiller.push({
      key:'m'+i, ad:'Mağaza ' + (2300 + i*7), rol:ROLLER.MAGAZA,
      simge:'🏪', renk:renkler[i % renkler.length], sifre:'1234'
    });
  }
  profiller.push({key:'bolge',  ad:'Bölge Müdürü', rol:ROLLER.BOLGE,  simge:'🗺️', renk:'#3f6b8a', sifre:'1234'});
  profiller.push({key:'kurucu', ad:'Kurucu',       rol:ROLLER.KURUCU, simge:'👑', renk:'#C8A066', sifre:'1234'});
  profilleriYaz(profiller);

  kategorilerYaz([
    {id:'k1', ad:'Cam',      urunler:[{id:'u1',ad:'Cam seti 6lı'},{id:'u2',ad:'Bardak 12li'},{id:'u3',ad:'Sürahi'}]},
    {id:'k2', ad:'Tekstil',  urunler:[{id:'u4',ad:'Havlu seti'},{id:'u5',ad:'Nevresim'},{id:'u6',ad:'Halı 120x180'}]},
    {id:'k3', ad:'Deterjan', urunler:[{id:'u7',ad:'Çamaşır deterjanı'},{id:'u8',ad:'Bulaşık jeli'},{id:'u9',ad:'Yumuşatıcı'}]},
    {id:'k4', ad:'Mutfak',   urunler:[{id:'u10',ad:'Tencere seti'},{id:'u11',ad:'Tava 24cm'},{id:'u12',ad:'Saklama kabı'}]}
  ]);

  const bugunD = new Date();
  const buPzt = pazartesi(bugunD);
  magazalarIcinTohum(profiller.filter(p => p.rol === ROLLER.MAGAZA), buPzt, bugunD);
  duyuruEkle('Bu hafta deterjan grubuna ağırlık veriyoruz, mağaza başı hedef 20 adet.');
  return true;
}

function magazalarIcinTohum(magazalar, buPzt, bugunD){
  magazalar.forEach((m, mi) => {
    const rnd = rastgele(1000 + mi * 37);
    const personel = [0,1,2,3].map(i => ({
      id: 'p' + (i+1),
      ad: AD_HAVUZU[(mi*3 + i) % AD_HAVUZU.length],
      aktif: true
    }));
    personelYaz(m.key, personel);

    const taban = 22000 + Math.floor(rnd() * 20000);
    for(let h = -7; h <= 0; h++){
      const pzt = haftaEkle(buPzt, h);
      haftaHedefYaz(m.key, pzt, Math.round(taban * 7 * (0.95 + rnd()*0.2) / 1000) * 1000);
      haftaGunleri(pzt).forEach((gun, gi) => {
        if(gun > bugunD) return;
        const haftaSonu = gi >= 5 ? 1.25 : 1;
        const ciro = Math.round(taban * haftaSonu * (0.7 + rnd()*0.6));
        const mgs  = Math.round(45 + rnd()*55);
        const kayit = {
          ciro,
          mdo: Number((28 + rnd()*30).toFixed(2)),
          fbu: Number((3.4 + rnd()*3).toFixed(2)),
          fbs: Math.round(850 + rnd()*900),
          mgs,
          toplu: Math.round(rnd()*18),
          izinler: rnd() > 0.72 ? [{personelId: personel[Math.floor(rnd()*personel.length)].id, tur:'Haftalık'}] : []
        };
        if(rnd() > 0.85) kayit.yorum = 'Hava koşulları nedeniyle giriş sayısı düştü.';
        gunYaz(m.key, dateStr(gun), kayit);
      });
      // Pazar günleri yüklenen ürün Excel'ini taklit et.
      urunHaftaYaz(m.key, pzt, {gruplar:[
        {ad:'Cam',      adet: Math.round(40 + rnd()*60), pay: Number((3 + rnd()*7).toFixed(1))},
        {ad:'Tekstil',  adet: Math.round(30 + rnd()*50), pay: Number((4 + rnd()*9).toFixed(1))},
        {ad:'Deterjan', adet: Math.round(60 + rnd()*90), pay: Number((6 + rnd()*10).toFixed(1))},
        {ad:'Mutfak',   adet: Math.round(20 + rnd()*40), pay: Number((2 + rnd()*6).toFixed(1))}
      ]});
    }
  });
}

export function hepsiniSil(){
  const silinecek = [];
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    if(k && k.startsWith(ON_EK)) silinecek.push(k);
  }
  silinecek.forEach(k => localStorage.removeItem(k));
}
