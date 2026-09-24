// Panel yerleşimi: kullanıcı panelleri sürükleyip yerini değiştirebilir,
// kenarlarından tutup boyutlandırabilir. Her mağaza kendi düzenini saklar.
//
// Kullanım: panelleriHazirla(kapsayici, {kapId, magaza, yenile})
// Kapsayıcının [data-panel] taşıyan doğrudan çocukları panel sayılır.
import * as V from './veri.js';
import { el } from './util.js';

const EN_KUCUK_GENISLIK = 180;
const EN_KUCUK_YUKSEKLIK = 90;

export function panelleriHazirla(kapsayici, {kapId, magaza, yon = 'yatay'}){
  const paneller = [...kapsayici.children].filter(c => c.dataset && c.dataset.panel);
  if(!paneller.length) return;

  const yerlesim = V.yerlesimGetir(magaza);
  const kayitliSira = (yerlesim.sira || {})[kapId];
  const boyutlar = yerlesim.boyut || {};

  // Kayıtlı sırayı uygula.
  if(Array.isArray(kayitliSira) && kayitliSira.length){
    kayitliSira.forEach(id => {
      const p = paneller.find(x => x.dataset.panel === id);
      if(p) kapsayici.appendChild(p);
    });
    paneller.forEach(p => { if(!kayitliSira.includes(p.dataset.panel)) kapsayici.appendChild(p); });
  }

  paneller.forEach(panel => {
    const id = panel.dataset.panel;
    panel.classList.add('panel-ayarlanabilir');

    const b = boyutlar[id];
    if(b && b.genislik && yon === 'yatay'){ panel.style.flex = '0 0 auto'; panel.style.width = b.genislik + 'px'; }
    if(b && b.yukseklik){ panel.style.height = b.yukseklik + 'px'; }

    if(!panel.querySelector('.panel-tut')){
      const tut = el('<button class="panel-tut" title="Basılı tutup sürükleyin — yerini değiştirir">⠿</button>');
      tut.addEventListener('pointerdown', e => tasimayaBasla(e, panel, kapsayici, kapId, magaza, yon));
      panel.appendChild(tut);

      if(yon === 'yatay') panel.appendChild(tutamak(panel, id, magaza, 'sag'));
      panel.appendChild(tutamak(panel, id, magaza, 'alt'));
      panel.appendChild(tutamak(panel, id, magaza, 'kose'));
    }
  });
}

function tutamak(panel, id, magaza, tip){
  const t = el(`<span class="panel-tutamak ${tip}" title="Boyutlandır"></span>`);
  t.addEventListener('pointerdown', e => {
    e.preventDefault();
    e.stopPropagation();
    const baslangic = {x:e.clientX, y:e.clientY, g:panel.offsetWidth, y0:panel.offsetHeight};
    panel.classList.add('boyutlaniyor');

    const hareket = ev => {
      if(tip !== 'alt'){
        const g = Math.max(EN_KUCUK_GENISLIK, baslangic.g + (ev.clientX - baslangic.x));
        panel.style.flex = '0 0 auto';
        panel.style.width = g + 'px';
      }
      if(tip !== 'sag'){
        panel.style.height = Math.max(EN_KUCUK_YUKSEKLIK, baslangic.y0 + (ev.clientY - baslangic.y)) + 'px';
      }
    };
    const bitir = () => {
      panel.classList.remove('boyutlaniyor');
      window.removeEventListener('pointermove', hareket);
      window.removeEventListener('pointerup', bitir);
      window.removeEventListener('pointercancel', bitir);
      V.yerlesimBoyutYaz(magaza, id, {
        genislik: tip !== 'alt' ? panel.offsetWidth : undefined,
        yukseklik: tip !== 'sag' ? panel.offsetHeight : undefined
      });
    };
    window.addEventListener('pointermove', hareket);
    window.addEventListener('pointerup', bitir);
    window.addEventListener('pointercancel', bitir);
  });
  return t;
}

function tasimayaBasla(e, panel, kapsayici, kapId, magaza, yon){
  e.preventDefault();
  e.stopPropagation();
  // Pointer yakalama kullanılmıyor: panel DOM'da yer değiştirdiği anda yakalama
  // düşüyor ve sürükleme ilk adımda kesiliyordu. Olaylar pencereden dinleniyor.
  panel.classList.add('tasiniyor');
  kapsayici.classList.add('tasima-modu');

  const hareket = ev => {
    const hedef = [...kapsayici.children].find(c => {
      if(c === panel || !c.dataset || !c.dataset.panel) return false;
      const r = c.getBoundingClientRect();
      return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
    });
    if(!hedef) return;
    const r = hedef.getBoundingClientRect();
    const oncesineMi = yon === 'yatay'
      ? ev.clientX < r.left + r.width/2
      : ev.clientY < r.top + r.height/2;
    const yeniKomsu = oncesineMi ? hedef : hedef.nextSibling;
    if(yeniKomsu === panel || (yeniKomsu === panel.nextSibling && !oncesineMi)) return;
    kapsayici.insertBefore(panel, yeniKomsu);
  };
  const bitir = () => {
    panel.classList.remove('tasiniyor');
    kapsayici.classList.remove('tasima-modu');
    window.removeEventListener('pointermove', hareket);
    window.removeEventListener('pointerup', bitir);
    window.removeEventListener('pointercancel', bitir);
    V.yerlesimSiraYaz(magaza, kapId,
      [...kapsayici.children].filter(c => c.dataset && c.dataset.panel).map(c => c.dataset.panel));
  };
  window.addEventListener('pointermove', hareket);
  window.addEventListener('pointerup', bitir);
  window.addEventListener('pointercancel', bitir);
}

// Kullanıcının elle verdiği boyut ve sırayı sıfırlar.
export function yerlesimSifirla(magaza){
  V.yerlesimYaz(magaza, {sira:{}, boyut:{}});
}
