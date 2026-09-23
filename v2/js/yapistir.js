// Panodan gelen veriyi işler.
// İki biçimi tanır:
//   1) Yer imi (bookmarklet) çıktısı: {url, tablolar, alanlar, secimler, listeler...}
//   2) Düz alan sözlüğü: {ciro_bugun, mdo_bugun, ...} — eski sürümün ürettiği biçim
// Kaynak sitenin yapısı kesinleşene kadar tolerant davranır: neyi bulduğunu
// ekranda gösterir, kullanıcı onaylamadan kaydetmez.
import * as U from './util.js';

const ANAHTARLAR = [
  {alan:'ciro',  desenler:[/\bciro\b/i, /\bsatı[sş]\s*tutar/i]},
  {alan:'mdo',   desenler:[/\bmdo\b/i, /dönü[şs]üm\s*oran/i]},
  {alan:'fbu',   desenler:[/\bfb[üu]\b/i, /fatura\s*ba[şs][ıi]na\s*[üu]r[üu]n/i]},
  {alan:'fbs',   desenler:[/\bfbs\b/i, /fatura\s*ba[şs][ıi]na\s*sat/i]},
  {alan:'mgs',   desenler:[/\bmgs\b/i, /ma[ğg]aza\s*giri[şs]/i, /m[üu][şs]teri\s*say/i]},
  {alan:'toplu', desenler:[/toplu\s*sat/i, /b[üu]y[üu]k\s*fatura/i]}
];

function alanTani(etiket){
  const bulunan = ANAHTARLAR.find(a => a.desenler.some(d => d.test(etiket || '')));
  return bulunan ? bulunan.alan : null;
}
function gunTani(etiket){
  if(/\bd[üu]n\b|önceki\s*g[üu]n/i.test(etiket || '')) return 'dun';
  if(/\bbug[üu]n\b|g[üu]nl[üu]k/i.test(etiket || '')) return 'bugun';
  return null;
}

// Yer imi çıktısındaki alanlar/listeler/tablolardan sayı toplar.
function bookmarkletCozumle(veri){
  const bulgular = [];   // {alan, gun, deger, kaynak}
  const ekle = (etiket, hamDeger, kaynak) => {
    const alan = alanTani(etiket);
    if(!alan) return;
    const deger = U.metniSayiyaCevir(hamDeger);
    if(deger === null) return;
    bulgular.push({alan, gun: gunTani(etiket) || 'bugun', deger, kaynak, etiket: String(etiket).slice(0,60)});
  };

  (veri.alanlar || []).forEach(a => ekle(a.etiket, a.deger, 'alan'));
  (veri.listeler || []).forEach(l => ekle(l.etiket, (l.secili || [])[0], 'liste'));
  (veri.tablolar || []).forEach((t, ti) => {
    (t.satirlar || []).forEach(satir => {
      if(!satir || satir.length < 2) return;
      const etiket = satir[0];
      // Satırın ilk hücresi etiket, sonrakiler değer kabul edilir.
      for(let i=1;i<satir.length;i++) ekle(etiket, satir[i], 'tablo' + (ti+1));
    });
  });
  return bulgular;
}

// Eski düz biçim: ciro_bugun / ciro_dun gibi.
function duzCozumle(veri){
  const bulgular = [];
  Object.keys(veri).forEach(anahtar => {
    const alan = alanTani(anahtar.replace(/_/g, ' '));
    if(!alan) return;
    const deger = U.metniSayiyaCevir(veri[anahtar]);
    if(deger === null) return;
    bulgular.push({alan, gun: /_dun$|dün/i.test(anahtar) ? 'dun' : 'bugun', deger, kaynak:'alan', etiket:anahtar});
  });
  return bulgular;
}

export function metniCozumle(metin){
  let veri;
  try{ veri = JSON.parse(metin); }
  catch(e){ return {hata:'Yapıştırılan metin JSON değil. Yer imine tıklayıp tekrar deneyin.'}; }

  const bookmarkletMi = veri && (veri.tablolar || veri.alanlar || veri.secimler);
  const bulgular = bookmarkletMi ? bookmarkletCozumle(veri) : duzCozumle(veri || {});

  // Aynı alan için birden fazla bulgu varsa ilkini esas al.
  const secilen = {bugun:{}, dun:{}};
  bulgular.forEach(b => {
    if(secilen[b.gun][b.alan] === undefined) secilen[b.gun][b.alan] = b;
  });

  return {
    kaynak: bookmarkletMi ? 'Yer imi çıktısı' : 'Düz JSON',
    url: veri.url || '',
    zaman: veri.zaman || '',
    bulgular,
    secilen,
    ham: veri
  };
}
