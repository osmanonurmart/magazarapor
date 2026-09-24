// Mağaza müdürü ana ekranı: hafta gezinme, iki haftalık tablo, sağ panel.
import * as U from './util.js';
import * as V from './veri.js';
import { haftaTablosu, haftaOzeti } from './hafta.js';
import { panelOlustur } from './panel.js';
import { metniCozumle } from './yapistir.js';
import { pencere, kapat } from './pencere.js';

let seciliPzt = null;

export function seciliHafta(){ return seciliPzt || U.pazartesi(U.bugun()); }
export function haftaSec(pzt){ seciliPzt = U.pazartesi(pzt); }

export function magazaEkrani(magazaKey, secenekler = {}){
  const pzt = seciliHafta();
  const duzenlenebilir = secenekler.duzenlenebilir !== false;
  const yenile = secenekler.yenile || (() => {});

  const kok = U.el('<div class="magaza-ekran"></div>');
  kok.appendChild(haftaGezinti(pzt, yenile));

  const govde = U.el('<div class="ekran-govde"></div>');
  const sol = U.el('<div class="ana-alan"></div>');
  sol.appendChild(haftaTablosu(magazaKey, pzt, {
    duzenlenebilir, yenile,
    urunAc: p => urunPenceresi(magazaKey, p, duzenlenebilir, yenile),
    personelDuzenle: () => personelPenceresi(magazaKey, yenile)
  }));
  sol.appendChild(haftaTablosu(magazaKey, U.haftaEkle(pzt, -1), {
    duzenlenebilir, yenile,
    urunAc: p => urunPenceresi(magazaKey, p, duzenlenebilir, yenile),
    personelDuzenle: () => personelPenceresi(magazaKey, yenile)
  }));
  sol.appendChild(simuleSatiri(yenile));
  govde.appendChild(sol);
  govde.appendChild(panelOlustur(magazaKey, {duzenlenebilir, yenile}));
  kok.appendChild(govde);
  return kok;
}

function haftaGezinti(pzt, yenile){
  const bugunD = U.bugun();
  const yil = pzt.getFullYear();
  const ay = pzt.getMonth() + 1;
  const haftalar = U.ayinHaftalari(yil, ay);
  const seciliKey = U.haftaKey(pzt);

  const duyurular = V.duyurularGetir();
  const kok = U.el(`<div class="hafta-gezinti">
    <div class="gez-sol">
      <div class="ay-satir">
        ${U.AY_KISA.map((a,i) => `<button class="ay ${i+1===ay?'secili':''}" data-ay="${i+1}">${a}</button>`).join('')}
        <select class="yil-sec">
          ${[yil-1, yil, yil+1].map(y => `<option ${y===yil?'selected':''}>${y}</option>`).join('')}
        </select>
      </div>
      <div class="hafta-satir">
        <button class="ok" data-kaydir="-1" title="Önceki hafta">◀</button>
        <div class="hafta-listesi">
          ${haftalar.map(h => `<button class="hafta ${U.haftaKey(h)===seciliKey?'secili':''}" data-pzt="${U.dateStr(h)}">
              <span class="h-no">H${U.isoHafta(h).hafta}</span>
              <span class="h-aralik">${U.haftaAraligiEtiketi(h)}</span>
            </button>`).join('')}
        </div>
        <button class="ok" data-kaydir="1" title="Sonraki hafta">▶</button>
        <button class="mini" data-bugun="1">Bu hafta</button>
      </div>
    </div>
    <div class="gez-sag">
      <div class="duyuru-baslik">📢 Duyurular</div>
      <div class="duyuru-serit">
        ${duyurular.length
          ? duyurular.slice(0,3).map(d => `<div class="duyuru-satir" title="${U.esc(d.metin)}">${U.esc(d.metin)}</div>`).join('')
          : '<div class="duyuru-bos">Duyuru yok.</div>'}
      </div>
    </div>
  </div>`);

  kok.querySelectorAll('[data-ay]').forEach(b => b.addEventListener('click', () => {
    const yeniAy = Number(b.dataset.ay);
    const hedef = U.ayinHaftalari(Number(kok.querySelector('.yil-sec').value), yeniAy)[0];
    haftaSec(hedef); yenile();
  }));
  kok.querySelector('.yil-sec').addEventListener('change', function(){
    haftaSec(U.ayinHaftalari(Number(this.value), ay)[0]); yenile();
  });
  kok.querySelectorAll('[data-pzt]').forEach(b => b.addEventListener('click', () => {
    haftaSec(new Date(b.dataset.pzt + 'T12:00:00')); yenile();
  }));
  kok.querySelectorAll('[data-kaydir]').forEach(b => b.addEventListener('click', () => {
    haftaSec(U.haftaEkle(pzt, Number(b.dataset.kaydir))); yenile();
  }));
  kok.querySelector('[data-bugun]').addEventListener('click', () => { haftaSec(U.pazartesi(bugunD)); yenile(); });
  return kok;
}

function simuleSatiri(yenile){
  const kok = U.el(`<div class="simule-satir">
    <span>🕒 Simüle tarihi</span>
    <input type="date" value="${U.simuleDeger() || ''}">
    <button class="mini" data-sifirla="1">Gerçek güne dön</button>
    <span class="simule-not">${U.simuleDeger() ? 'Girilen veriler ' + U.simuleDeger() + ' tarihine kaydedilir.' : ''}</span>
  </div>`);
  kok.querySelector('input').addEventListener('change', function(){
    U.simuleAyarla(this.value);
    haftaSec(U.pazartesi(U.bugun()));
    yenile();
  });
  kok.querySelector('[data-sifirla]').addEventListener('click', () => {
    U.simuleAyarla(null);
    haftaSec(U.pazartesi(U.bugun()));
    yenile();
  });
  return kok;
}

// ---------------- Yapıştır penceresi ----------------
export function yapistirPenceresi(magazaKey, yenile){
  const govde = U.el(`<div class="yapistir">
    <p class="aciklama">Ciro takip sitesinde yer imine tıklayıp panoya kopyalayın, sonra buraya yapıştırın.</p>
    <textarea class="yapistir-alan" placeholder="Yer iminin kopyaladığı JSON..."></textarea>
    <div class="yapistir-sonuc"></div>
  </div>`);
  const alan = govde.querySelector('.yapistir-alan');
  const sonuc = govde.querySelector('.yapistir-sonuc');
  let cozum = null;

  const cozumle = () => {
    const c = metniCozumle(alan.value.trim());
    cozum = c;
    if(c.hata){ sonuc.innerHTML = `<div class="uyari">${U.esc(c.hata)}</div>`; return; }
    const satir = (gun, etiket) => {
      const alanlar = Object.keys(c.secilen[gun]);
      if(!alanlar.length) return `<div class="bulgu-bos">${etiket}: eşleşen alan bulunamadı.</div>`;
      return `<div class="bulgu-grup"><b>${etiket}</b>${alanlar.map(a =>
        `<span class="bulgu"><i>${a.toUpperCase()}</i> ${U.fmtSayi(c.secilen[gun][a].deger, 2)}</span>`).join('')}</div>`;
    };
    sonuc.innerHTML = `<div class="bulgu-kutu">
      <div class="bulgu-ust">${U.esc(c.kaynak)}${c.url ? ' · ' + U.esc(c.url.slice(0,60)) : ''}</div>
      ${satir('bugun','Bugün')}
      ${satir('dun','Dün')}
      <div class="bulgu-not">Toplam ${c.bulgular.length} eşleşme bulundu. Kaydet dediğinizde yalnızca yukarıdakiler yazılır.</div>
    </div>`;
  };
  alan.addEventListener('input', () => { clearTimeout(alan._z); alan._z = setTimeout(cozumle, 300); });

  pencere('Veri ekle', govde, [
    {ad:'Panodan al', sinif:'', tik: async () => {
      try{ alan.value = await navigator.clipboard.readText(); cozumle(); }
      catch(e){ sonuc.innerHTML = '<div class="uyari">Pano okunamadı, elle yapıştırın.</div>'; }
    }},
    {ad:'Kaydet', sinif:'birincil', tik: () => {
      if(!cozum || cozum.hata) return;
      const bugunStr = U.bugunStr();
      const d = new Date(U.bugun()); d.setDate(d.getDate()-1);
      const dunStr = U.dateStr(d);
      let sayac = 0;
      [['bugun', bugunStr], ['dun', dunStr]].forEach(([gun, tarih]) => {
        const kayit = V.gunGetir(magazaKey, tarih) || {};
        Object.keys(cozum.secilen[gun]).forEach(alanAd => {
          kayit[alanAd] = cozum.secilen[gun][alanAd].deger;
          sayac++;
        });
        if(Object.keys(cozum.secilen[gun]).length) V.gunYaz(magazaKey, tarih, kayit);
      });
      kapat();
      yenile();
      return sayac;
    }}
  ]);
}

// ---------------- Personel penceresi ----------------
export function personelPenceresi(magazaKey, yenile){
  const govde = U.el('<div class="personel"><div class="personel-liste"></div><div class="personel-ekle"><input type="text" placeholder="Yeni personel adı"><button class="mini birincil">+ Ekle</button></div><p class="aciklama">Listeden çıkarılan kişi geçmiş günlerde görünmeye devam eder.</p></div>');
  const liste = govde.querySelector('.personel-liste');

  const ciz = () => {
    const kisiler = V.personelGetir(magazaKey);
    liste.innerHTML = kisiler.length ? '' : '<div class="menu-bos">Personel yok.</div>';
    kisiler.forEach(p => {
      const satir = U.el(`<div class="personel-satir ${p.aktif === false ? 'pasif' : ''}">
        <input class="p-ad" type="text" value="${U.esc(p.ad)}">
        <span class="p-durum">${p.aktif === false ? 'pasif' : 'aktif'}</span>
        <button class="mini p-durum-btn">${p.aktif === false ? 'Aktifleştir' : 'Çıkar'}</button>
      </div>`);
      satir.querySelector('.p-ad').addEventListener('change', function(){
        const l = V.personelGetir(magazaKey);
        const k = l.find(x => x.id === p.id);
        if(k){ k.ad = this.value.trim() || k.ad; V.personelYaz(magazaKey, l); ciz(); yenile(); }
      });
      satir.querySelector('.p-durum-btn').addEventListener('click', () => {
        const l = V.personelGetir(magazaKey);
        const k = l.find(x => x.id === p.id);
        if(k){ k.aktif = k.aktif === false; V.personelYaz(magazaKey, l); ciz(); yenile(); }
      });
      liste.appendChild(satir);
    });
  };
  ciz();

  const girdi = govde.querySelector('.personel-ekle input');
  const ekleBtn = govde.querySelector('.personel-ekle button');
  const ekle = () => {
    const ad = girdi.value.trim();
    if(!ad) return;
    const l = V.personelGetir(magazaKey);
    l.push({id:'p'+Date.now(), ad, aktif:true});
    V.personelYaz(magazaKey, l);
    girdi.value = '';
    ciz(); yenile();
  };
  ekleBtn.addEventListener('click', ekle);
  girdi.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); ekle(); } });

  pencere('Personel', govde, [{ad:'Kapat', sinif:'birincil', tik: kapat}]);
}

// ---------------- Haftalık ürün verisi ----------------
export function urunPenceresi(magazaKey, pzt, duzenlenebilir, yenile){
  const bu = V.urunHaftaGetir(magazaKey, pzt);
  const gecen = V.urunHaftaGetir(magazaKey, U.haftaEkle(pzt, -1));
  const govde = U.el(`<div class="urun-pencere">
    <div class="urun-ust">${U.haftaBasligi(pzt)}</div>
    <div class="urun-icerik"></div>
    ${duzenlenebilir ? '<div class="urun-yukle"><label>Excel’den kopyalanan satırları yapıştırın (grup adı ⇥ adet ⇥ pay)</label><textarea class="urun-alan" placeholder="Cam\t54\t5,2"></textarea><button class="mini birincil urun-kaydet">Yükle</button></div>' : ''}
  </div>`);
  const icerik = govde.querySelector('.urun-icerik');

  const ciz = () => {
    const veri = V.urunHaftaGetir(magazaKey, pzt);
    if(!veri || !veri.gruplar || !veri.gruplar.length){
      icerik.innerHTML = '<div class="menu-bos">Bu hafta için ürün verisi yüklenmemiş.</div>';
      return;
    }
    const gecenPay = ad => {
      const g = (gecen && gecen.gruplar || []).find(x => U.normalizeAd(x.ad) === U.normalizeAd(ad));
      return g ? g.pay : null;
    };
    const satirlar = veri.gruplar.map(g => {
      const onceki = gecenPay(g.ad);
      const fark = (onceki === null) ? null : g.pay - onceki;
      return `<tr class="${(g.pay >= 5 || (fark !== null && Math.abs(fark) >= 5)) ? 'one-cikan' : ''}">
        <td>${U.esc(g.ad)}</td><td>${U.fmtSayi(g.adet,0)}</td>
        <td>${U.fmtYuzde(g.pay,1)}</td>
        <td>${onceki === null ? '–' : U.fmtYuzde(onceki,1)}</td>
        <td class="${fark > 0 ? 'artis' : (fark < 0 ? 'dusus' : '')}">${fark === null ? '–' : (fark>0?'+':'') + U.fmtSayi(fark,1)}</td>
      </tr>`;
    }).join('');

    // Payı %5 üstünde olan veya %5'ten fazla değişen gruplar otomatik rapora girer.
    const oneCikan = veri.gruplar.filter(g => {
      const o = gecenPay(g.ad);
      return g.pay >= 5 || (o !== null && Math.abs(g.pay - o) >= 5);
    });
    icerik.innerHTML = `<table class="urun-tablo">
        <thead><tr><th>Grup</th><th>Adet</th><th>Bu hafta pay</th><th>Geçen hafta</th><th>Fark</th></tr></thead>
        <tbody>${satirlar}</tbody></table>
      ${oneCikan.length ? `<div class="urun-rapor"><b>Otomatik rapor</b>${oneCikan.map(g => {
        const o = gecenPay(g.ad);
        return `<div>${U.esc(g.ad)}: ${o === null ? 'bu hafta ' + U.fmtYuzde(g.pay,1) : U.fmtYuzde(o,1) + ' → ' + U.fmtYuzde(g.pay,1)}</div>`;
      }).join('')}</div>` : ''}`;
  };
  ciz();

  const kaydet = govde.querySelector('.urun-kaydet');
  if(kaydet) kaydet.addEventListener('click', () => {
    const metin = govde.querySelector('.urun-alan').value;
    const gruplar = metin.split('\n').map(s => s.trim()).filter(Boolean).map(satir => {
      const p = satir.split(/\t|;|\s{2,}/).map(x => x.trim());
      return {ad: p[0], adet: U.metniSayiyaCevir(p[1]) ?? 0, pay: U.metniSayiyaCevir(p[2]) ?? 0};
    }).filter(g => g.ad);
    if(!gruplar.length) return;
    V.urunHaftaYaz(magazaKey, pzt, {gruplar, yuklenme:new Date().toISOString()});
    govde.querySelector('.urun-alan').value = '';
    ciz(); yenile();
  });

  pencere('Haftalık ürün verisi', govde, [{ad:'Kapat', sinif:'birincil', tik: kapat}]);
}
