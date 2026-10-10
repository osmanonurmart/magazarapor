// ==================== DÜZENLEYİCİ (PDF araçları) ====================
// rapor.html'deki "Düzenleyici" sekmesi açıldığında yüklenir. Her şey tarayıcıda
// çalışır; dosyalar hiçbir yere gönderilmez. Kütüphaneler ve fontlar bu klasördedir:
//   lib/   pdf-lib (PDF yazma), pdf.js (PDF okuma/çizme), fontkit (font gömme), jszip
//   fontlar/  Liberation Sans/Serif (Türkçe karakterli, Arial/Times ölçülerinde)
(function(){
'use strict';

const SURUM = (typeof APP_SURUM !== 'undefined') ? APP_SURUM : 0;
const TABAN = 'duzenleyici/';
const KUT = {
  pdflib:  ['lib/pdf-lib.min.js',      ()=> window.PDFLib],
  pdfjs:   ['lib/pdf.min.js',          ()=> window.pdfjsLib],
  fontkit: ['lib/fontkit.umd.min.js',  ()=> window.fontkit],
  jszip:   ['lib/jszip.min.js',        ()=> window.JSZip]
};
const kutSozleri = {};
function kut(ad){
  if(KUT[ad][1]()) return Promise.resolve();
  if(!kutSozleri[ad]){
    kutSozleri[ad] = new Promise((res, rej)=>{
      const s = document.createElement('script');
      s.src = TABAN + KUT[ad][0] + '?v=' + SURUM;
      s.onload = ()=>{
        if(ad === 'pdfjs') window.pdfjsLib.GlobalWorkerOptions.workerSrc = TABAN + 'lib/pdf.worker.min.js?v=' + SURUM;
        res();
      };
      s.onerror = ()=>{ delete kutSozleri[ad]; rej(new Error('Kütüphane yüklenemedi (' + ad + '). İnternet bağlantısını kontrol edin.')); };
      document.head.appendChild(s);
    });
  }
  return kutSozleri[ad];
}

// ---------- Araç listesi ----------
const IK = {
  birlestir:'<path d="M7 4h6l4 4v5"/><path d="M7 4v11h4"/><path d="M15 15v6"/><path d="M12 18h6"/>',
  ayir:'<path d="M6 4h5v16H6z"/><path d="M14 4h4v16h-4z" stroke-dasharray="2 2"/><path d="M12 2v20"/>',
  duzenle:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  sayfalar:'<rect x="3.5" y="4" width="7" height="7" rx="1"/><rect x="13.5" y="4" width="7" height="7" rx="1"/><rect x="3.5" y="14" width="7" height="7" rx="1"/><rect x="13.5" y="14" width="7" height="7" rx="1"/>',
  dondur:'<path d="M20 11a8 8 0 1 0-2.3 5.6"/><path d="M20 4v7h-7"/>',
  jpg2pdf:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 16l-5-5-8 8"/>',
  pdf2jpg:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 17l2-3 2 2 1-1 2 2"/>',
  numara:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M11 18h4"/><path d="M13 13v5"/>',
  filigran:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  imza:'<path d="M3 17c3 0 4-6 6-6s1 6 3 6 3-4 5-4 2 2 4 2"/><path d="M3 21h18"/>'
};
function ikon(ad){ return '<svg viewBox="0 0 24 24" aria-hidden="true">' + IK[ad] + '</svg>'; }

const ARACLAR = [
  {id:'birlestir', ad:'PDF Birleştir', renk:'#e5322d', acik:'Birden fazla PDF\'i istediğin sırayla tek dosyada birleştir.'},
  {id:'ayir',      ad:'PDF Ayır',      renk:'#e5322d', acik:'Sayfaları ayrı dosyalara böl ya da istediğin sayfaları çıkar.'},
  {id:'duzenle',   ad:'PDF Düzenle',   renk:'#9b3fd1', acik:'Metinleri değiştir; yazı, resim, imza ve beyaz kutu ekle.'},
  {id:'imza',      ad:'PDF İmzala',    renk:'#2563eb', acik:'İmzanı çiz ve belgede istediğin yere yerleştir.', hedef:'duzenle'},
  {id:'sayfalar',  ad:'Sayfaları Düzenle', renk:'#d97706', acik:'Sayfaları sırala, sil, döndür, boş sayfa ya da başka PDF ekle.'},
  {id:'dondur',    ad:'PDF Döndür',    renk:'#d97706', acik:'Sayfaları tek tek ya da hepsini birden döndür.'},
  {id:'jpg2pdf',   ad:'Resimden PDF',  renk:'#f2b705', acik:'JPG ve PNG resimleri tek PDF dosyası yap.'},
  {id:'pdf2jpg',   ad:'PDF\'ten Resme', renk:'#f2b705', acik:'Her sayfayı ayrı JPG resim olarak kaydet.'},
  {id:'numara',    ad:'Sayfa Numarası', renk:'#16a34a', acik:'Sayfalara istediğin konumda numara ekle.'},
  {id:'filigran',  ad:'Filigran Ekle',  renk:'#0891b2', acik:'Sayfaların üstüne yazı damgası bas.'}
];

// ---------- Stil ----------
const STIL = `
.dz{ max-width:1180px; margin:0 auto; padding:18px 16px 40px; }
.dz-giris{ text-align:center; margin:6px 0 22px; }
.dz-giris h1{ font-size:1.6rem; margin:0 0 6px; color:var(--dark,#2b2b2b); }
.dz-giris p{ margin:0; color:#777; font-size:.92rem; }
.dz-izgara{ display:grid; grid-template-columns:repeat(auto-fill, minmax(215px, 1fr)); gap:14px; }
.dz-kart{ background:#fff; border:1px solid var(--line,#eee); border-radius:14px; padding:18px 16px; cursor:pointer;
  text-align:left; font-family:inherit; transition:transform .12s, box-shadow .12s; display:flex; flex-direction:column; gap:8px; }
.dz-kart:hover{ transform:translateY(-2px); box-shadow:0 8px 22px rgba(0,0,0,.08); }
.dz-kart b{ font-size:1rem; color:var(--dark,#2b2b2b); }
.dz-kart span{ font-size:.8rem; color:#777; line-height:1.4; }
.dz-ik{ width:42px; height:42px; border-radius:11px; background:var(--r); display:flex; align-items:center; justify-content:center; flex:none; }
.dz-ik svg{ width:24px; height:24px; fill:none; stroke:#fff; stroke-width:1.9; stroke-linecap:round; stroke-linejoin:round; }
.dz-ust{ display:flex; align-items:center; gap:14px; margin-bottom:16px; flex-wrap:wrap; }
.dz-geri{ background:#fff; border:1px solid var(--line,#ddd); border-radius:9px; padding:8px 12px; cursor:pointer; font-family:inherit; font-size:.82rem; }
.dz-ust h2{ margin:0; font-size:1.25rem; color:var(--dark,#2b2b2b); }
.dz-ust p{ margin:2px 0 0; font-size:.82rem; color:#777; }
.dz-baslik{ display:flex; align-items:center; gap:12px; }
.dz-yukle{ border:2px dashed #d9cdb8; border-radius:16px; background:#fffdf8; padding:46px 20px; text-align:center; }
.dz-yukle.ustunde{ border-color:var(--accent,#C8A066); background:#fdf6ea; }
.dz-yukle p{ color:#888; font-size:.85rem; margin:12px 0 0; }
.dz-btn{ background:var(--accent,#C8A066); color:#fff; border:none; border-radius:10px; padding:11px 22px; font-size:.92rem;
  font-weight:700; cursor:pointer; font-family:inherit; }
.dz-btn:disabled{ opacity:.5; cursor:default; }
.dz-btn.buyuk{ padding:15px 34px; font-size:1.05rem; border-radius:12px; }
.dz-btn.ikincil{ background:#fff; color:var(--dark,#2b2b2b); border:1px solid #ddd; font-weight:600; }
.dz-btn.kucuk{ padding:7px 12px; font-size:.8rem; }
.dz-cubuk{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; background:#fff; border:1px solid var(--line,#eee);
  border-radius:12px; padding:10px 12px; margin-bottom:14px; }
.dz-cubuk .bosluk{ flex:1; }
.dz-cubuk label{ font-size:.8rem; color:#555; display:flex; align-items:center; gap:6px; }
.dz-cubuk input[type=number], .dz-cubuk input[type=text], .dz-cubuk select{ padding:6px 8px; border:1px solid #ddd; border-radius:7px; font-family:inherit; font-size:.82rem; }
.dz-cubuk input[type=number]{ width:64px; }
.dz-seg{ display:inline-flex; background:#f1efe9; border-radius:9px; padding:3px; gap:2px; }
.dz-seg button{ background:none; border:none; padding:7px 12px; border-radius:7px; cursor:pointer; font-family:inherit; font-size:.8rem; color:#666; }
.dz-seg button.on{ background:#fff; color:var(--dark,#2b2b2b); font-weight:700; box-shadow:0 1px 3px rgba(0,0,0,.08); }
.dz-sayfalar{ display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:14px; }
.dz-sk{ background:#fff; border:1px solid var(--line,#eee); border-radius:12px; padding:10px; position:relative; user-select:none; }
.dz-sk.surukle{ opacity:.4; }
.dz-sk.hedef{ outline:2px dashed var(--accent,#C8A066); outline-offset:2px; }
.dz-sk.secili{ border-color:var(--accent,#C8A066); box-shadow:0 0 0 2px var(--accent,#C8A066) inset; }
.dz-sk.soluk{ opacity:.45; }
.dz-onizle{ height:170px; display:flex; align-items:center; justify-content:center; background:#f6f4ef; border-radius:8px; overflow:hidden; position:relative; }
.dz-onizle canvas, .dz-onizle img{ max-width:100%; max-height:100%; box-shadow:0 1px 4px rgba(0,0,0,.15); background:#fff; }
.dz-sk-alt{ display:flex; align-items:center; justify-content:space-between; gap:4px; margin-top:8px; font-size:.75rem; color:#666; }
.dz-sk-ad{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:600; color:#444; }
.dz-mini{ display:flex; gap:3px; }
.dz-mini button{ background:#f1efe9; border:none; border-radius:6px; width:26px; height:26px; cursor:pointer; font-size:.8rem; padding:0; }
.dz-mini button:hover{ background:#e7e2d8; }
.dz-mini button.sil:hover{ background:#fde2e1; color:#c0392b; }
.dz-isaret{ position:absolute; top:8px; left:8px; background:var(--accent,#C8A066); color:#fff; border-radius:50%; width:22px; height:22px;
  display:flex; align-items:center; justify-content:center; font-size:.75rem; z-index:1; }
.dz-etiket{ position:absolute; font:700 11px Arial, sans-serif; color:#333; background:rgba(255,255,255,.85); padding:0 3px; border-radius:3px; }
.dz-fil{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; overflow:hidden; }
.dz-fil span{ font:700 22px Arial, sans-serif; white-space:nowrap; }
.dz-not{ font-size:.78rem; color:#888; margin:10px 2px; line-height:1.5; }
.dz-alt{ position:sticky; bottom:0; display:flex; justify-content:center; gap:10px; padding:14px 0 4px; background:linear-gradient(transparent, var(--bg,#f6f4ef) 35%); margin-top:10px; }
.dz-konum{ display:grid; grid-template-columns:repeat(3, 30px); gap:3px; }
.dz-konum button{ width:30px; height:22px; border:1px solid #ddd; background:#fff; border-radius:4px; cursor:pointer; padding:0; }
.dz-konum button.on{ background:var(--accent,#C8A066); border-color:var(--accent,#C8A066); }
/* Düzenleyici */
.dz-edit{ display:flex; gap:14px; align-items:flex-start; }
.dz-kenar{ width:118px; flex:none; position:sticky; top:66px; max-height:calc(100vh - 90px); overflow:auto; display:flex; flex-direction:column; gap:10px; padding:2px; }
.dz-kenar .dz-onizle{ height:120px; cursor:pointer; }
.dz-kenar .no{ text-align:center; font-size:.72rem; color:#888; margin-top:3px; }
.dz-alan{ flex:1; min-width:0; display:flex; flex-direction:column; align-items:center; gap:24px; padding-top:14px; }
.dz-arac-cubuk{ position:sticky; top:0; z-index:30; }
.dz-arac-cubuk .dz-tus{ background:#fff; border:1px solid #ddd; border-radius:8px; padding:7px 11px; cursor:pointer; font-family:inherit; font-size:.8rem; }
.dz-arac-cubuk .dz-tus.on{ background:var(--dark,#2b2b2b); color:#fff; border-color:var(--dark,#2b2b2b); }
.dz-bicim{ display:none; gap:6px; align-items:center; }
.dz-bicim.acik{ display:flex; }
.dz-bicim .dz-tus.b{ font-weight:800; } .dz-bicim .dz-tus.i{ font-style:italic; font-family:Georgia, serif; }
.dz-bicim input[type=color]{ width:34px; height:30px; padding:0 2px; border:1px solid #ddd; border-radius:7px; background:#fff; }
.dz-sayfa{ position:relative; background:#fff; box-shadow:0 2px 10px rgba(0,0,0,.12); }
.dz-sayfa canvas{ display:block; }
.dz-katman{ position:absolute; inset:0; }
.dz-sno{ position:absolute; top:-16px; left:0; font-size:.7rem; color:#999; }
.dz-tseg{ position:absolute; border-radius:2px; cursor:text; }
.mod-metin .dz-tseg:hover{ outline:1.5px solid #9b3fd1; background:rgba(155,63,209,.07); }
.dz-katman:not(.mod-metin) .dz-tseg{ pointer-events:none; }
.dz-ortu{ position:absolute; pointer-events:none; }
.dz-ydz{ position:absolute; white-space:pre; outline:none; line-height:1; padding:0; min-width:4px; cursor:text; }
.dz-ydz.aktif, .dz-ydz:focus{ outline:1.5px solid #9b3fd1; }
.dz-nesne{ position:absolute; }
.dz-nesne.secili{ outline:1.5px dashed #2563eb; }
.dz-nesne .ic{ white-space:pre; outline:none; line-height:1.2; min-width:10px; min-height:1em; cursor:text; }
.dz-nesne img{ width:100%; height:100%; display:block; pointer-events:none; }
.dz-nesne .tut, .dz-nesne .kapat, .dz-nesne .boyut{ position:absolute; display:none; align-items:center; justify-content:center; width:22px; height:22px;
  border-radius:50%; font-size:12px; cursor:pointer; z-index:2; color:#fff; user-select:none; touch-action:none; }
.dz-nesne.secili .tut, .dz-nesne.secili .kapat, .dz-nesne.secili .boyut{ display:flex; }
.dz-nesne .tut{ left:-26px; top:-4px; background:#2563eb; cursor:move; }
.dz-nesne .kapat{ right:-12px; top:-12px; background:#e5322d; }
.dz-nesne .boyut{ right:-11px; bottom:-11px; background:#2563eb; cursor:nwse-resize; width:18px; height:18px; }
.dz-nesne.tasinir{ cursor:move; touch-action:none; }
.dz-cizim{ position:absolute; border:1.5px dashed #2563eb; background:rgba(255,255,255,.6); pointer-events:none; }
.mod-yazi, .mod-kutu{ cursor:crosshair; }
.dz-imza-ov{ position:fixed; inset:0; z-index:2100; background:rgba(34,28,20,.45); display:flex; align-items:center; justify-content:center; padding:16px; }
.dz-imza{ background:#fff; border-radius:16px; padding:18px; width:560px; max-width:100%; }
.dz-imza h3{ margin:0 0 10px; font-size:1.05rem; }
.dz-imza canvas{ width:100%; height:200px; border:1px dashed #bbb; border-radius:10px; touch-action:none; background:#fff; cursor:crosshair; display:block; }
.dz-imza .alt{ display:flex; gap:8px; margin-top:12px; align-items:center; }
@media (max-width:760px){
  .dz{ padding:12px 10px 30px; }
  .dz-kenar{ display:none; }
  .dz-izgara{ grid-template-columns:1fr 1fr; gap:10px; }
  .dz-kart{ padding:14px 12px; }
  .dz-sayfalar{ grid-template-columns:repeat(2, 1fr); gap:10px; }
  .dz-onizle{ height:150px; }
  .dz-arac-cubuk{ position:static; }
}
`;

// ---------- Ortak yardımcılar ----------
function el(tag, sinif, html){
  const e = document.createElement(tag);
  if(sinif) e.className = sinif;
  if(html !== undefined) e.innerHTML = html;
  return e;
}
function esc(s){ return String(s).replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function bildir(m, tip, sure){ if(typeof uiBildirim === 'function') uiBildirim(m, tip, sure); }
function mesgul(m){ bildir(m, '', 0); }
function tamam(m){ bildir(m, 'basari'); }
function hata(e){ console.error(e); bildir((e && e.message) || String(e), 'hata', 7000); }
function kokAd(ad){ return String(ad || 'belge').replace(/\.(pdf|jpe?g|png|webp|gif)$/i, ''); }
function indirBlob(blob, ad){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = ad;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=> URL.revokeObjectURL(url), 60000);
}
function indirPdf(bytes, ad){ indirBlob(new Blob([bytes], {type:'application/pdf'}), ad); }
async function zipIndir(dosyalar, ad){
  await kut('jszip');
  const z = new JSZip();
  dosyalar.forEach(d=> z.file(d.ad, d.veri));
  indirBlob(await z.generateAsync({type:'blob'}), ad);
}
function bekle(ms){ return new Promise(r=> setTimeout(r, ms)); }
async function isle(btn, metin, fn){
  if(btn) btn.disabled = true;
  mesgul(metin);
  try{ await fn(); }
  catch(e){ hata(e); }
  finally{ if(btn) btn.disabled = false; }
}

let acikBelgeler = [];
async function pdfOku(file){
  if(!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') throw new Error(file.name + ' bir PDF dosyası değil.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  await kut('pdfjs');
  let belge;
  try{
    belge = await pdfjsLib.getDocument({data: bytes.slice(), isEvalSupported:false}).promise;
  }catch(e){
    if(e && e.name === 'PasswordException') throw new Error(file.name + ' şifreli. Şifreli PDF\'ler açılamıyor.');
    throw new Error(file.name + ' açılamadı: ' + (e && e.message || e));
  }
  acikBelgeler.push(belge);
  return {ad:file.name, bytes, belge, sayfa:belge.numPages};
}
async function pdfLibAc(bytes, ad){
  await kut('pdflib');
  const doc = await PDFLib.PDFDocument.load(bytes, {ignoreEncryption:true});
  if(doc.isEncrypted) throw new Error((ad || 'Bu PDF') + ' korumalı (düzenleme kısıtlı), işlenemiyor.');
  return doc;
}
function belgeleriKapat(){
  acikBelgeler.forEach(b=>{ try{ b.destroy(); }catch(e){} });
  acikBelgeler = [];
}

// Küçük resimler sırayla çizilir; aynı anda onlarca sayfa çizmek telefonu kilitler.
const kuyruk = [];
let kuyrukCalisiyor = false;
function kucukResim(belge, no, gen){
  return new Promise((res, rej)=>{
    kuyruk.push(async ()=>{
      try{
        const p = await belge.getPage(no);
        const vp1 = p.getViewport({scale:1});
        const k = Math.min(2, window.devicePixelRatio || 1) * 1.4;
        const vp = p.getViewport({scale: Math.min(gen / vp1.width, 220 / vp1.height) * k});
        const c = document.createElement('canvas');
        c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
        await p.render({canvasContext:c.getContext('2d'), viewport:vp}).promise;
        res(c);
      }catch(e){ rej(e); }
    });
    kuyrukCalistir();
  });
}
async function kuyrukCalistir(){
  if(kuyrukCalisiyor) return;
  kuyrukCalisiyor = true;
  while(kuyruk.length){ await kuyruk.shift()(); }
  kuyrukCalisiyor = false;
}
function dondurulmus(kaynak, derece){
  derece = ((derece % 360) + 360) % 360;
  if(!derece) return kaynak;
  const c = document.createElement('canvas');
  const yan = derece % 180 !== 0;
  c.width = yan ? kaynak.height : kaynak.width;
  c.height = yan ? kaynak.width : kaynak.height;
  const x = c.getContext('2d');
  x.translate(c.width / 2, c.height / 2);
  x.rotate(derece * Math.PI / 180);
  x.drawImage(kaynak, -kaynak.width / 2, -kaynak.height / 2);
  return c;
}

function yuklemeAlani(o){
  const alan = el('div', 'dz-yukle');
  const inp = el('input');
  inp.type = 'file'; inp.accept = o.kabul; inp.multiple = !!o.coklu; inp.style.display = 'none';
  const btn = el('button', 'dz-btn buyuk', esc(o.metin));
  btn.type = 'button';
  btn.addEventListener('click', ()=> inp.click());
  inp.addEventListener('change', ()=>{ const f = Array.from(inp.files || []); inp.value = ''; if(f.length) o.sec(f); });
  alan.append(btn, inp, el('p', '', 'veya dosyaları buraya sürükleyip bırakın'));
  surukleBirak(alan, o.sec);
  alan.ac = ()=> inp.click();
  return alan;
}
function dosyaSecici(kabul, coklu, sec){
  const inp = el('input');
  inp.type = 'file'; inp.accept = kabul; inp.multiple = !!coklu;
  inp.addEventListener('change', ()=>{ const f = Array.from(inp.files || []); if(f.length) sec(f); });
  inp.click();
}
function surukleBirak(hedef, sec){
  hedef.addEventListener('dragover', e=>{ if(e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')){ e.preventDefault(); hedef.classList.add('ustunde'); } });
  hedef.addEventListener('dragleave', ()=> hedef.classList.remove('ustunde'));
  hedef.addEventListener('drop', e=>{
    hedef.classList.remove('ustunde');
    if(!e.dataTransfer || !e.dataTransfer.files.length) return;
    e.preventDefault();
    sec(Array.from(e.dataTransfer.files));
  });
}

// Sürükleyerek sıralama (masaüstü). Telefonda kartlardaki oklar kullanılır.
function siralanabilir(kart, idx, liste, yenile){
  kart.draggable = true;
  kart.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/dz-sira', String(idx)); e.dataTransfer.effectAllowed = 'move'; kart.classList.add('surukle'); });
  kart.addEventListener('dragend', ()=> kart.classList.remove('surukle'));
  kart.addEventListener('dragover', e=>{ if(Array.from(e.dataTransfer.types).includes('text/dz-sira')){ e.preventDefault(); kart.classList.add('hedef'); } });
  kart.addEventListener('dragleave', ()=> kart.classList.remove('hedef'));
  kart.addEventListener('drop', e=>{
    kart.classList.remove('hedef');
    const v = e.dataTransfer.getData('text/dz-sira');
    if(v === '') return;
    e.preventDefault();
    const nereden = Number(v);
    if(nereden === idx) return;
    const [x] = liste.splice(nereden, 1);
    liste.splice(idx, 0, x);
    yenile();
  });
}
function tasi(liste, i, yon){
  const j = i + yon;
  if(j < 0 || j >= liste.length) return false;
  const [x] = liste.splice(i, 1);
  liste.splice(j, 0, x);
  return true;
}

// Sayfanın görünen (döndürülmüş) köşesine göre PDF koordinatı: yazılar her zaman düz okunur.
function gorselNokta(sayfa, vx, vy){
  const k = sayfa.getCropBox();
  const r = ((sayfa.getRotation().angle % 360) + 360) % 360;
  if(r === 90)  return {x:k.x + k.width - vy, y:k.y + vx, aci:90};
  if(r === 180) return {x:k.x + k.width - vx, y:k.y + k.height - vy, aci:180};
  if(r === 270) return {x:k.x + vy, y:k.y + k.height - vx, aci:270};
  return {x:k.x + vx, y:k.y + vy, aci:0};
}
function gorselBoyut(sayfa){
  const k = sayfa.getCropBox();
  const r = ((sayfa.getRotation().angle % 360) + 360) % 360;
  return r % 180 ? {w:k.height, h:k.width} : {w:k.width, h:k.height};
}
function hexRgb(h){
  const m = String(h || '#000000').replace('#', '');
  const n = parseInt(m.length === 3 ? m.split('').map(c=> c + c).join('') : m, 16) || 0;
  return PDFLib.rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const fontOnbellek = {};
async function fontBaytlari(serif, kalin, italik){
  const ad = 'Liberation' + (serif ? 'Serif' : 'Sans') + '-' +
    (kalin && italik ? 'BoldItalic' : kalin ? 'Bold' : italik ? 'Italic' : 'Regular') + '.ttf';
  if(!fontOnbellek[ad]){
    fontOnbellek[ad] = fetch(TABAN + 'fontlar/' + ad + '?v=' + SURUM).then(r=>{
      if(!r.ok) throw new Error('Font yüklenemedi: ' + ad);
      return r.arrayBuffer();
    }).catch(e=>{ delete fontOnbellek[ad]; throw e; });
  }
  return fontOnbellek[ad];
}
async function fontGom(doc, cache, serif, kalin, italik){
  const k = (serif ? 's' : 'n') + (kalin ? 'b' : '') + (italik ? 'i' : '');
  if(!cache[k]){
    await kut('fontkit');
    if(!doc._dzFontkit){ doc.registerFontkit(fontkit); doc._dzFontkit = true; }
    cache[k] = doc.embedFont(await fontBaytlari(serif, kalin, italik), {subset:true});
  }
  return cache[k];
}

// ---------- Giriş ekranı ----------
let kok = null;
let aktif = null;
function anaEkran(){
  belgeleriKapat();
  aktif = null;
  kok.innerHTML = '';
  const dz = el('div', 'dz');
  dz.appendChild(el('div', 'dz-giris', '<h1>PDF araçları</h1><p>Dosyaların bilgisayarından ya da telefonundan çıkmaz, her şey bu sayfada yapılır.</p>'));
  const iz = el('div', 'dz-izgara');
  ARACLAR.forEach(a=>{
    const k = el('button', 'dz-kart',
      '<span class="dz-ik" style="--r:' + a.renk + '">' + ikon(a.id) + '</span><b>' + esc(a.ad) + '</b><span>' + esc(a.acik) + '</span>');
    k.type = 'button';
    k.addEventListener('click', ()=> aracAc(a.id));
    iz.appendChild(k);
  });
  dz.appendChild(iz);
  kok.appendChild(dz);
}

function aracAc(id){
  belgeleriKapat();
  const a = ARACLAR.find(x=> x.id === id);
  aktif = id;
  kok.innerHTML = '';
  const dz = el('div', 'dz');
  const ust = el('div', 'dz-ust');
  const geri = el('button', 'dz-geri', '← Tüm araçlar');
  geri.type = 'button';
  geri.addEventListener('click', anaEkran);
  ust.append(geri, el('div', 'dz-baslik',
    '<span class="dz-ik" style="--r:' + a.renk + '">' + ikon(a.id) + '</span><div><h2>' + esc(a.ad) + '</h2><p>' + esc(a.acik) + '</p></div>'));
  const govde = el('div', 'dz-govde');
  dz.append(ust, govde);
  kok.appendChild(dz);
  KUR[a.hedef || a.id](govde, a);
  window.scrollTo(0, 0);
}

// ==================== PDF BİRLEŞTİR ====================
function kurBirlestir(g){
  const dosyalar = [];
  const alan = yuklemeAlani({kabul:'.pdf,application/pdf', coklu:true, metin:'PDF dosyalarını seç', sec:ekle});
  const ic = el('div');
  g.append(alan, ic);
  surukleBirak(ic, ekle);

  async function ekle(files){
    for(const f of files){
      mesgul('Açılıyor: ' + f.name);
      try{
        const d = await pdfOku(f);
        dosyalar.push(d);
        ciz();
        kucukResim(d.belge, 1, 150).then(c=>{ d.kapak = c; ciz(); }).catch(()=>{});
      }catch(e){ hata(e); return; }
    }
    bildir('');
  }
  function ciz(){
    alan.style.display = dosyalar.length ? 'none' : '';
    ic.innerHTML = '';
    if(!dosyalar.length) return;
    const cubuk = el('div', 'dz-cubuk');
    const ekleBtn = el('button', 'dz-btn ikincil kucuk', '+ PDF ekle');
    ekleBtn.addEventListener('click', ()=> dosyaSecici('.pdf,application/pdf', true, ekle));
    const sirala = el('button', 'dz-btn ikincil kucuk', 'A→Z sırala');
    sirala.addEventListener('click', ()=>{ dosyalar.sort((a, b)=> a.ad.localeCompare(b.ad, 'tr', {numeric:true})); ciz(); });
    cubuk.append(ekleBtn, sirala, el('span', 'bosluk'),
      el('span', 'dz-not', dosyalar.length + ' dosya · ' + dosyalar.reduce((s, d)=> s + d.sayfa, 0) + ' sayfa'));
    ic.appendChild(cubuk);
    const iz = el('div', 'dz-sayfalar');
    dosyalar.forEach((d, i)=>{
      const k = el('div', 'dz-sk');
      const on = el('div', 'dz-onizle');
      if(d.kapak) on.appendChild(d.kapak); else on.textContent = '…';
      k.appendChild(on);
      k.appendChild(el('span', 'dz-isaret', String(i + 1)));
      const alt = el('div', 'dz-sk-alt');
      alt.appendChild(el('span', 'dz-sk-ad', esc(d.ad)));
      const m = el('span', 'dz-mini');
      m.append(
        mini('◀', 'Öne al', ()=>{ if(tasi(dosyalar, i, -1)) ciz(); }),
        mini('▶', 'Arkaya al', ()=>{ if(tasi(dosyalar, i, 1)) ciz(); }),
        mini('✕', 'Çıkar', ()=>{ dosyalar.splice(i, 1); ciz(); }, 'sil'));
      alt.appendChild(m);
      k.appendChild(alt);
      k.appendChild(el('div', 'dz-not', d.sayfa + ' sayfa'));
      k.lastChild.style.margin = '2px 0 0';
      siralanabilir(k, i, dosyalar, ciz);
      iz.appendChild(k);
    });
    ic.appendChild(iz);
    ic.appendChild(el('div', 'dz-not', 'Sırayı değiştirmek için kartları sürükleyin ya da oklara basın.'));
    const alt = el('div', 'dz-alt');
    const btn = el('button', 'dz-btn buyuk', 'PDF\'leri birleştir');
    btn.disabled = dosyalar.length < 2;
    btn.addEventListener('click', ()=> isle(btn, 'Birleştiriliyor...', async ()=>{
      await kut('pdflib');
      const {PDFDocument} = PDFLib;
      const cikti = await PDFDocument.create();
      for(const d of dosyalar){
        const kaynak = await pdfLibAc(d.bytes, d.ad);
        const sayfalar = await cikti.copyPages(kaynak, kaynak.getPageIndices());
        sayfalar.forEach(s=> cikti.addPage(s));
      }
      indirPdf(await cikti.save(), 'birlestirilmis.pdf');
      tamam('Birleştirildi, dosya indi.');
    }));
    alt.appendChild(btn);
    ic.appendChild(alt);
  }
}
function mini(metin, baslik, fn, sinif){
  const b = el('button', sinif || '', metin);
  b.type = 'button'; b.title = baslik;
  b.addEventListener('click', e=>{ e.stopPropagation(); fn(); });
  return b;
}

// ==================== PDF AYIR ====================
function araliklariCoz(metin, n){
  const sonuc = [];
  const parcalar = String(metin).split(/[,;]+/).map(x=> x.trim()).filter(Boolean);
  if(!parcalar.length) throw new Error('Sayfa aralığı yazın (ör. 1-3, 5, 8-10).');
  for(const p of parcalar){
    const m = p.match(/^(\d+)\s*(?:-\s*(\d+))?$/);
    if(!m) throw new Error('Anlaşılamadı: "' + p + '". Örnek: 1-3, 5, 8-10');
    const a = Number(m[1]), b = m[2] ? Number(m[2]) : a;
    if(a < 1 || b < 1 || a > n || b > n) throw new Error('"' + p + '" belgede yok. Belgede ' + n + ' sayfa var.');
    const liste = [];
    if(a <= b) for(let i=a;i<=b;i++) liste.push(i - 1);
    else for(let i=a;i>=b;i--) liste.push(i - 1);
    sonuc.push(liste);
  }
  return sonuc;
}

function kurAyir(g){
  let d = null;
  let mod = 'aralik';
  let secili = new Set();
  const kapaklar = [];
  const alan = yuklemeAlani({kabul:'.pdf,application/pdf', metin:'PDF dosyası seç', sec:yukle});
  const ic = el('div');
  g.append(alan, ic);

  async function yukle(files){
    try{
      mesgul('Açılıyor...');
      d = await pdfOku(files[0]);
      alan.style.display = 'none';
      bildir('');
      ciz();
      for(let i=1;i<=d.sayfa;i++){
        kapaklar[i-1] = await kucukResim(d.belge, i, 150);
        const yer = ic.querySelector('[data-no="' + i + '"] .dz-onizle');
        if(yer){ yer.innerHTML = ''; yer.appendChild(kapaklar[i-1]); }
      }
    }catch(e){ hata(e); }
  }
  let aralikMetni = '';
  let tekDosya = false;
  function ciz(){
    ic.innerHTML = '';
    const cubuk = el('div', 'dz-cubuk');
    const seg = el('span', 'dz-seg');
    [['aralik', 'Aralıklara göre'], ['sec', 'Sayfa seç'], ['her', 'Her sayfa ayrı']].forEach(([k, ad])=>{
      const b = el('button', mod === k ? 'on' : '', ad);
      b.type = 'button';
      b.addEventListener('click', ()=>{ mod = k; ciz(); });
      seg.appendChild(b);
    });
    cubuk.appendChild(seg);
    let araInp = null;
    if(mod === 'aralik'){
      if(!aralikMetni) aralikMetni = '1-' + d.sayfa;
      const lb = el('label', '', 'Aralıklar');
      araInp = el('input');
      araInp.type = 'text'; araInp.value = aralikMetni; araInp.placeholder = 'ör. 1-3, 5, 8-10';
      araInp.style.width = '170px';
      araInp.addEventListener('input', ()=>{ aralikMetni = araInp.value; isaretle(); });
      lb.appendChild(araInp);
      const tk = el('label', '', '<input type="checkbox"' + (tekDosya ? ' checked' : '') + '> Tek PDF\'te birleştir');
      tk.querySelector('input').addEventListener('change', e=>{ tekDosya = e.target.checked; });
      cubuk.append(lb, tk);
    } else if(mod === 'sec'){
      const hepsi = el('button', 'dz-btn ikincil kucuk', 'Hepsini seç');
      hepsi.addEventListener('click', ()=>{ for(let i=0;i<d.sayfa;i++) secili.add(i); isaretle(); });
      const hic = el('button', 'dz-btn ikincil kucuk', 'Seçimi kaldır');
      hic.addEventListener('click', ()=>{ secili.clear(); isaretle(); });
      cubuk.append(hepsi, hic);
      const tk = el('label', '', '<input type="checkbox"' + (tekDosya ? ' checked' : '') + '> Seçilenleri tek PDF yap');
      tk.querySelector('input').addEventListener('change', e=>{ tekDosya = e.target.checked; });
      cubuk.appendChild(tk);
    }
    cubuk.append(el('span', 'bosluk'), el('span', 'dz-not', esc(d.ad) + ' · ' + d.sayfa + ' sayfa'));
    ic.appendChild(cubuk);
    const iz = el('div', 'dz-sayfalar');
    for(let i=0;i<d.sayfa;i++){
      const k = el('div', 'dz-sk');
      k.dataset.no = i + 1;
      const on = el('div', 'dz-onizle');
      if(kapaklar[i]) on.appendChild(kapaklar[i]); else on.textContent = '…';
      k.append(on, el('div', 'dz-sk-alt', '<span>Sayfa ' + (i + 1) + '</span>'));
      if(mod === 'sec'){
        k.style.cursor = 'pointer';
        k.addEventListener('click', ()=>{ if(secili.has(i)) secili.delete(i); else secili.add(i); isaretle(); });
      }
      iz.appendChild(k);
    }
    ic.appendChild(iz);
    const alt = el('div', 'dz-alt');
    const btn = el('button', 'dz-btn buyuk', 'PDF\'i ayır');
    btn.addEventListener('click', ()=> isle(btn, 'Ayrılıyor...', ayir));
    alt.appendChild(btn);
    ic.appendChild(alt);
    isaretle();
  }
  function gruplar(){
    if(mod === 'her') return Array.from({length:d.sayfa}, (_, i)=> [i]);
    if(mod === 'sec'){
      const s = Array.from(secili).sort((a, b)=> a - b);
      if(!s.length) throw new Error('Önce sayfa seçin.');
      return tekDosya ? [s] : s.map(i=> [i]);
    }
    const a = araliklariCoz(aralikMetni, d.sayfa);
    return tekDosya ? [a.flat()] : a;
  }
  function isaretle(){
    let dahil = new Set();
    try{ gruplar().forEach(gr=> gr.forEach(i=> dahil.add(i))); }catch(e){ dahil = null; }
    ic.querySelectorAll('.dz-sk').forEach(k=>{
      const i = Number(k.dataset.no) - 1;
      k.classList.toggle('secili', mod === 'sec' ? secili.has(i) : !!(dahil && dahil.has(i)));
      k.classList.toggle('soluk', mod === 'aralik' && !!dahil && !dahil.has(i));
    });
  }
  async function ayir(){
    const gr = gruplar();
    const kaynak = await pdfLibAc(d.bytes, d.ad);
    const kok_ = kokAd(d.ad);
    const ciktilar = [];
    for(const liste of gr){
      const yeni = await PDFLib.PDFDocument.create();
      (await yeni.copyPages(kaynak, liste)).forEach(s=> yeni.addPage(s));
      const ilk = liste[0] + 1, son = liste[liste.length - 1] + 1;
      const ad = kok_ + (liste.length === 1 ? '-sayfa-' + ilk : (ilk <= son && son - ilk + 1 === liste.length ? '-' + ilk + '-' + son : '-secilen')) + '.pdf';
      ciktilar.push({ad, veri: await yeni.save()});
    }
    // Aynı adlı dosyalar zip'te birbirinin üzerine yazılmasın.
    const sayac = {};
    ciktilar.forEach(c=>{ sayac[c.ad] = (sayac[c.ad] || 0) + 1; if(sayac[c.ad] > 1) c.ad = c.ad.replace(/\.pdf$/, '-' + sayac[c.ad] + '.pdf'); });
    if(ciktilar.length === 1) indirPdf(ciktilar[0].veri, ciktilar[0].ad);
    else await zipIndir(ciktilar, kok_ + '-ayrilmis.zip');
    tamam(ciktilar.length === 1 ? 'PDF indi.' : ciktilar.length + ' PDF tek zip dosyası olarak indi.');
  }
}

// ==================== SAYFALARI DÜZENLE / DÖNDÜR ====================
function kurSayfalar(g, a){
  const donmeModu = a.id === 'dondur';
  const kaynaklar = [];      // {ad, bytes, belge}
  let sayfalar = [];         // {k, i, rot, bos:[w,h], kapak}
  const alan = yuklemeAlani({kabul:'.pdf,application/pdf', coklu:!donmeModu, metin:'PDF dosyası seç', sec:ekle});
  const ic = el('div');
  g.append(alan, ic);

  async function ekle(files){
    for(const f of files){
      try{
        mesgul('Açılıyor: ' + f.name);
        const d = await pdfOku(f);
        const k = kaynaklar.push(d) - 1;
        const yeni = [];
        for(let i=0;i<d.sayfa;i++){ const s = {k, i, rot:0}; sayfalar.push(s); yeni.push(s); }
        alan.style.display = 'none';
        ciz();
        bildir('');
        for(const s of yeni){
          s.kapak = await kucukResim(d.belge, s.i + 1, 150);
          kartGuncelle(s);
        }
      }catch(e){ hata(e); return; }
    }
  }
  function kartGuncelle(s){
    const k = ic.querySelector('[data-id="' + sayfalar.indexOf(s) + '"] .dz-onizle');
    if(!k) return;
    k.innerHTML = '';
    if(s.bos){ const b = el('div'); b.style.cssText = 'background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.15);width:' + (s.rot % 180 ? 130 : 92) + 'px;height:' + (s.rot % 180 ? 92 : 130) + 'px'; k.appendChild(b); }
    else if(s.kapak) k.appendChild(dondurulmus(s.kapak, s.rot));
    else k.textContent = '…';
  }
  function ciz(){
    ic.innerHTML = '';
    const cubuk = el('div', 'dz-cubuk');
    if(donmeModu){
      cubuk.append(
        dugme('↺ Hepsini sola', ()=>{ sayfalar.forEach(s=> s.rot = (s.rot + 270) % 360); ciz(); }),
        dugme('↻ Hepsini sağa', ()=>{ sayfalar.forEach(s=> s.rot = (s.rot + 90) % 360); ciz(); }),
        dugme('Sıfırla', ()=>{ sayfalar.forEach(s=> s.rot = 0); ciz(); }));
    } else {
      cubuk.append(
        dugme('+ PDF ekle', ()=> dosyaSecici('.pdf,application/pdf', true, ekle)),
        dugme('+ Boş sayfa', ()=>{ sayfalar.push({k:-1, i:0, rot:0, bos:[595.28, 841.89]}); ciz(); }),
        dugme('↻ Hepsini döndür', ()=>{ sayfalar.forEach(s=> s.rot = (s.rot + 90) % 360); ciz(); }));
    }
    cubuk.append(el('span', 'bosluk'), el('span', 'dz-not', sayfalar.length + ' sayfa'));
    ic.appendChild(cubuk);
    const iz = el('div', 'dz-sayfalar');
    sayfalar.forEach((s, idx)=>{
      const k = el('div', 'dz-sk');
      k.dataset.id = idx;
      k.appendChild(el('div', 'dz-onizle'));
      const alt = el('div', 'dz-sk-alt');
      alt.appendChild(el('span', '', s.bos ? 'Boş sayfa' : (kaynaklar.length > 1 ? (s.k + 1) + '. dosya · ' : '') + 's. ' + (s.i + 1)));
      const m = el('span', 'dz-mini');
      m.append(mini('↺', 'Sola döndür', ()=>{ s.rot = (s.rot + 270) % 360; kartGuncelle(s); }),
               mini('↻', 'Sağa döndür', ()=>{ s.rot = (s.rot + 90) % 360; kartGuncelle(s); }));
      if(!donmeModu){
        m.append(mini('◀', 'Öne al', ()=>{ if(tasi(sayfalar, idx, -1)) ciz(); }),
                 mini('▶', 'Arkaya al', ()=>{ if(tasi(sayfalar, idx, 1)) ciz(); }),
                 mini('✕', 'Sil', ()=>{ sayfalar.splice(idx, 1); ciz(); }, 'sil'));
        siralanabilir(k, idx, sayfalar, ciz);
      } else {
        k.style.cursor = 'pointer';
        k.addEventListener('click', ()=>{ s.rot = (s.rot + 90) % 360; kartGuncelle(s); });
      }
      alt.appendChild(m);
      k.appendChild(alt);
      iz.appendChild(k);
    });
    ic.appendChild(iz);
    sayfalar.forEach(kartGuncelle);
    if(!donmeModu) ic.appendChild(el('div', 'dz-not', 'Sırayı değiştirmek için sayfaları sürükleyin ya da oklara basın.'));
    else ic.appendChild(el('div', 'dz-not', 'Bir sayfaya tıklamak onu 90° sağa döndürür.'));
    const alt = el('div', 'dz-alt');
    const btn = el('button', 'dz-btn buyuk', donmeModu ? 'Döndür ve indir' : 'Kaydet ve indir');
    btn.disabled = !sayfalar.length;
    btn.addEventListener('click', ()=> isle(btn, 'Hazırlanıyor...', kaydet));
    alt.appendChild(btn);
    ic.appendChild(alt);
  }
  function dugme(metin, fn){
    const b = el('button', 'dz-btn ikincil kucuk', metin);
    b.type = 'button';
    b.addEventListener('click', fn);
    return b;
  }
  async function kaydet(){
    const {PDFDocument, degrees} = await kut('pdflib').then(()=> PDFLib);
    const cikti = await PDFDocument.create();
    // Her kaynaktan gereken sayfalar tek seferde kopyalanır; ortak fontlar tekrar tekrar eklenmez.
    const kopyalar = new Map();
    for(let k=0;k<kaynaklar.length;k++){
      const lazim = Array.from(new Set(sayfalar.filter(s=> s.k === k).map(s=> s.i)));
      if(!lazim.length) continue;
      const doc = await pdfLibAc(kaynaklar[k].bytes, kaynaklar[k].ad);
      const kopya = await cikti.copyPages(doc, lazim);
      lazim.forEach((i, j)=> kopyalar.set(k + ':' + i, kopya[j]));
    }
    const kullanildi = new Set();
    for(const s of sayfalar){
      let p;
      if(s.bos){ p = cikti.addPage(s.bos); }
      else {
        const anahtar = s.k + ':' + s.i;
        if(kullanildi.has(anahtar)){
          const doc = await pdfLibAc(kaynaklar[s.k].bytes);
          [p] = await cikti.copyPages(doc, [s.i]);
        } else p = kopyalar.get(anahtar);
        kullanildi.add(anahtar);
        cikti.addPage(p);
      }
      if(s.rot) p.setRotation(degrees((p.getRotation().angle + s.rot) % 360));
    }
    const ad = kokAd(kaynaklar[0] ? kaynaklar[0].ad : 'belge') + (donmeModu ? '-dondurulmus.pdf' : '-duzenlenmis.pdf');
    indirPdf(await cikti.save(), ad);
    tamam('Dosya indi.');
  }
}

// ==================== RESİMDEN PDF ====================
function resimAc(file){
  return new Promise((res, rej)=>{
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = ()=> res({img, url});
    img.onerror = ()=>{ URL.revokeObjectURL(url); rej(new Error(file.name + ' açılamadı. JPG ya da PNG seçin.')); };
    img.src = url;
  });
}
function kurJpg2pdf(g){
  const resimler = [];   // {ad, img, url}
  let boyut = 'a4', yon = 'oto', kenar = 'yok';
  const alan = yuklemeAlani({kabul:'image/*', coklu:true, metin:'Resimleri seç', sec:ekle});
  const ic = el('div');
  g.append(alan, ic);
  surukleBirak(ic, ekle);
  async function ekle(files){
    for(const f of files){
      try{ const r = await resimAc(f); resimler.push({ad:f.name, img:r.img, url:r.url}); }
      catch(e){ hata(e); }
    }
    ciz();
  }
  function secenek(etiket, deger, ayar, liste){
    const lb = el('label', '', etiket);
    const s = el('select');
    liste.forEach(([k, ad])=>{ const o = el('option', '', ad); o.value = k; o.selected = k === deger; s.appendChild(o); });
    s.addEventListener('change', ()=> ayar(s.value));
    lb.appendChild(s);
    return lb;
  }
  function ciz(){
    alan.style.display = resimler.length ? 'none' : '';
    ic.innerHTML = '';
    if(!resimler.length) return;
    const cubuk = el('div', 'dz-cubuk');
    const ekleBtn = el('button', 'dz-btn ikincil kucuk', '+ Resim ekle');
    ekleBtn.addEventListener('click', ()=> dosyaSecici('image/*', true, ekle));
    cubuk.append(ekleBtn,
      secenek('Sayfa', boyut, v=> boyut = v, [['a4', 'A4'], ['resim', 'Resim boyutunda']]),
      secenek('Yön', yon, v=> yon = v, [['oto', 'Otomatik'], ['dikey', 'Dikey'], ['yatay', 'Yatay']]),
      secenek('Kenar boşluğu', kenar, v=> kenar = v, [['yok', 'Yok'], ['az', 'Az'], ['cok', 'Çok']]),
      el('span', 'bosluk'), el('span', 'dz-not', resimler.length + ' resim'));
    ic.appendChild(cubuk);
    const iz = el('div', 'dz-sayfalar');
    resimler.forEach((r, i)=>{
      const k = el('div', 'dz-sk');
      const on = el('div', 'dz-onizle');
      const im = el('img'); im.src = r.url; on.appendChild(im);
      k.append(on, el('span', 'dz-isaret', String(i + 1)));
      const alt = el('div', 'dz-sk-alt');
      alt.appendChild(el('span', 'dz-sk-ad', esc(r.ad)));
      const m = el('span', 'dz-mini');
      m.append(mini('◀', 'Öne al', ()=>{ if(tasi(resimler, i, -1)) ciz(); }),
               mini('▶', 'Arkaya al', ()=>{ if(tasi(resimler, i, 1)) ciz(); }),
               mini('✕', 'Çıkar', ()=>{ URL.revokeObjectURL(r.url); resimler.splice(i, 1); ciz(); }, 'sil'));
      alt.appendChild(m);
      k.appendChild(alt);
      siralanabilir(k, i, resimler, ciz);
      iz.appendChild(k);
    });
    ic.appendChild(iz);
    const alt = el('div', 'dz-alt');
    const btn = el('button', 'dz-btn buyuk', 'PDF\'e çevir');
    btn.addEventListener('click', ()=> isle(btn, 'PDF hazırlanıyor...', kaydet));
    alt.appendChild(btn);
    ic.appendChild(alt);
  }
  async function kaydet(){
    await kut('pdflib');
    const doc = await PDFLib.PDFDocument.create();
    const pay = {yok:0, az:20, cok:40}[kenar];
    for(let i=0;i<resimler.length;i++){
      mesgul('PDF hazırlanıyor (' + (i + 1) + '/' + resimler.length + ')...');
      const r = resimler[i];
      // Resim tuvalden geçirilir: telefon fotoğraflarının yönü düzelir, boyut makul kalır.
      const max = 2600;
      const o = Math.min(1, max / Math.max(r.img.naturalWidth, r.img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(r.img.naturalWidth * o); c.height = Math.round(r.img.naturalHeight * o);
      const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      x.drawImage(r.img, 0, 0, c.width, c.height);
      const veri = await new Promise(res=> c.toBlob(b=> b.arrayBuffer().then(res), 'image/jpeg', 0.9));
      const gom = await doc.embedJpg(veri);
      const iw = c.width * 0.75, ih = c.height * 0.75;   // 96 dpi → pt
      let pw, ph;
      if(boyut === 'resim'){ pw = iw + pay * 2; ph = ih + pay * 2; }
      else {
        pw = 595.28; ph = 841.89;
        const yatay = yon === 'yatay' || (yon === 'oto' && iw > ih);
        if(yatay){ [pw, ph] = [ph, pw]; }
      }
      const sayfa = doc.addPage([pw, ph]);
      const k = Math.min((pw - pay * 2) / iw, (ph - pay * 2) / ih, boyut === 'resim' ? 1 : Infinity);
      const w = iw * k, h = ih * k;
      sayfa.drawImage(gom, {x:(pw - w) / 2, y:(ph - h) / 2, width:w, height:h});
    }
    indirPdf(await doc.save(), resimler.length === 1 ? kokAd(resimler[0].ad) + '.pdf' : 'resimler.pdf');
    tamam('PDF indi.');
  }
}

// ==================== PDF'TEN RESME ====================
function kurPdf2jpg(g){
  let d = null, kalite = 'normal';
  const alan = yuklemeAlani({kabul:'.pdf,application/pdf', metin:'PDF dosyası seç', sec:yukle});
  const ic = el('div');
  g.append(alan, ic);
  async function yukle(files){
    try{
      mesgul('Açılıyor...');
      d = await pdfOku(files[0]);
      alan.style.display = 'none';
      bildir('');
      ciz();
      for(let i=1;i<=d.sayfa;i++){
        const c = await kucukResim(d.belge, i, 150);
        const yer = ic.querySelector('[data-no="' + i + '"] .dz-onizle');
        if(yer){ yer.innerHTML = ''; yer.appendChild(c); }
      }
    }catch(e){ hata(e); }
  }
  async function sayfaJpg(no){
    const p = await d.belge.getPage(no);
    const vp = p.getViewport({scale: kalite === 'yuksek' ? 300 / 72 : 150 / 72});
    const c = document.createElement('canvas');
    c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
    const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    await p.render({canvasContext:x, viewport:vp}).promise;
    const blob = await new Promise(r=> c.toBlob(r, 'image/jpeg', 0.92));
    c.width = c.height = 0;
    return blob;
  }
  function ciz(){
    ic.innerHTML = '';
    const cubuk = el('div', 'dz-cubuk');
    const seg = el('span', 'dz-seg');
    [['normal', 'Normal (150 dpi)'], ['yuksek', 'Yüksek (300 dpi)']].forEach(([k, ad])=>{
      const b = el('button', kalite === k ? 'on' : '', ad);
      b.addEventListener('click', ()=>{ kalite = k; seg.querySelectorAll('button').forEach(x=> x.classList.toggle('on', x === b)); });
      seg.appendChild(b);
    });
    cubuk.append(el('label', '', 'Kalite'), seg, el('span', 'bosluk'), el('span', 'dz-not', esc(d.ad) + ' · ' + d.sayfa + ' sayfa'));
    ic.appendChild(cubuk);
    const iz = el('div', 'dz-sayfalar');
    for(let i=1;i<=d.sayfa;i++){
      const k = el('div', 'dz-sk');
      k.dataset.no = i;
      k.appendChild(el('div', 'dz-onizle', '…'));
      const alt = el('div', 'dz-sk-alt', '<span>Sayfa ' + i + '</span>');
      const m = el('span', 'dz-mini');
      m.appendChild(mini('⬇', 'Bu sayfayı indir', ()=> isle(null, 'Hazırlanıyor...', async ()=>{
        indirBlob(await sayfaJpg(i), kokAd(d.ad) + '-' + i + '.jpg'); tamam('Resim indi.');
      })));
      alt.appendChild(m);
      k.appendChild(alt);
      iz.appendChild(k);
    }
    ic.appendChild(iz);
    const alt = el('div', 'dz-alt');
    const btn = el('button', 'dz-btn buyuk', d.sayfa > 1 ? 'Hepsini JPG yap' : 'JPG yap');
    btn.addEventListener('click', ()=> isle(btn, 'Resimler hazırlanıyor...', async ()=>{
      const kok_ = kokAd(d.ad);
      if(d.sayfa === 1){ indirBlob(await sayfaJpg(1), kok_ + '.jpg'); tamam('Resim indi.'); return; }
      const dosyalar = [];
      for(let i=1;i<=d.sayfa;i++){
        mesgul('Resimler hazırlanıyor (' + i + '/' + d.sayfa + ')...');
        dosyalar.push({ad: kok_ + '-' + i + '.jpg', veri: await sayfaJpg(i)});
      }
      await zipIndir(dosyalar, kok_ + '-resimler.zip');
      tamam(d.sayfa + ' resim zip olarak indi.');
    }));
    alt.appendChild(btn);
    ic.appendChild(alt);
  }
}

// ==================== SAYFA NUMARASI ====================
function kurNumara(g){
  let d = null;
  const ayar = {konum:'alt-orta', bicim:'{n}', bas:1, ilkAtla:false, boyut:11};
  const kapaklar = [];
  const alan = yuklemeAlani({kabul:'.pdf,application/pdf', metin:'PDF dosyası seç', sec:yukle});
  const ic = el('div');
  g.append(alan, ic);
  async function yukle(files){
    try{
      mesgul('Açılıyor...');
      d = await pdfOku(files[0]);
      alan.style.display = 'none';
      bildir('');
      ciz();
      const n = Math.min(d.sayfa, 12);
      for(let i=1;i<=n;i++){ kapaklar[i-1] = await kucukResim(d.belge, i, 150); onizle(); }
    }catch(e){ hata(e); }
  }
  function metin(i, toplam){
    const n = ayar.bas + i - (ayar.ilkAtla ? 1 : 0);
    const N = ayar.bas + toplam - 1 - (ayar.ilkAtla ? 1 : 0);
    return ayar.bicim.replace('{n}', n).replace('{N}', N);
  }
  function ciz(){
    ic.innerHTML = '';
    const cubuk = el('div', 'dz-cubuk');
    const konum = el('span', 'dz-konum');
    ['ust-sol', 'ust-orta', 'ust-sag', 'alt-sol', 'alt-orta', 'alt-sag'].forEach(k=>{
      const b = el('button', ayar.konum === k ? 'on' : '');
      b.type = 'button'; b.title = k.replace('-', ' ');
      b.addEventListener('click', ()=>{ ayar.konum = k; konum.querySelectorAll('button').forEach(x=> x.classList.toggle('on', x === b)); onizle(); });
      konum.appendChild(b);
    });
    const lbK = el('label', '', 'Konum'); lbK.appendChild(konum);
    const bicim = el('select');
    [['{n}', '1'], ['{n} / {N}', '1 / 10'], ['Sayfa {n}', 'Sayfa 1'], ['Sayfa {n} / {N}', 'Sayfa 1 / 10'], ['- {n} -', '- 1 -']].forEach(([k, ad])=>{
      const o = el('option', '', ad); o.value = k; o.selected = ayar.bicim === k; bicim.appendChild(o);
    });
    bicim.addEventListener('change', ()=>{ ayar.bicim = bicim.value; onizle(); });
    const lbB = el('label', '', 'Biçim'); lbB.appendChild(bicim);
    const bas = el('input'); bas.type = 'number'; bas.min = 0; bas.value = ayar.bas;
    bas.addEventListener('input', ()=>{ ayar.bas = Math.max(0, parseInt(bas.value, 10) || 0); onizle(); });
    const lbS = el('label', '', 'İlk numara'); lbS.appendChild(bas);
    const boy = el('input'); boy.type = 'number'; boy.min = 6; boy.max = 40; boy.value = ayar.boyut;
    boy.addEventListener('input', ()=>{ ayar.boyut = Math.min(40, Math.max(6, Number(boy.value) || 11)); });
    const lbY = el('label', '', 'Yazı boyutu'); lbY.appendChild(boy);
    const atla = el('label', '', '<input type="checkbox"' + (ayar.ilkAtla ? ' checked' : '') + '> İlk sayfaya koyma (kapak)');
    atla.querySelector('input').addEventListener('change', e=>{ ayar.ilkAtla = e.target.checked; onizle(); });
    cubuk.append(lbK, lbB, lbS, lbY, atla);
    ic.appendChild(cubuk);
    const iz = el('div', 'dz-sayfalar');
    iz.id = 'dzNumIz';
    ic.appendChild(iz);
    if(d.sayfa > 12) ic.appendChild(el('div', 'dz-not', 'Önizlemede ilk 12 sayfa gösteriliyor; numaralar bütün sayfalara eklenir.'));
    const alt = el('div', 'dz-alt');
    const btn = el('button', 'dz-btn buyuk', 'Numara ekle ve indir');
    btn.addEventListener('click', ()=> isle(btn, 'Numaralar ekleniyor...', kaydet));
    alt.appendChild(btn);
    ic.appendChild(alt);
    onizle();
  }
  function onizle(){
    const iz = ic.querySelector('#dzNumIz');
    if(!iz) return;
    iz.innerHTML = '';
    const n = Math.min(d.sayfa, 12);
    for(let i=0;i<n;i++){
      const k = el('div', 'dz-sk');
      const on = el('div', 'dz-onizle');
      const c = kapaklar[i];
      if(c){
        const sar = el('div'); sar.style.cssText = 'position:relative;display:inline-block;line-height:0;';
        const kopya = el('img'); kopya.src = c.toDataURL(); kopya.style.cssText = 'max-width:100%;max-height:170px;';
        sar.appendChild(kopya);
        if(!(ayar.ilkAtla && i === 0)){
          const e = el('span', 'dz-etiket', esc(metin(i, d.sayfa)));
          const [dik, yat] = ayar.konum.split('-');
          e.style[dik === 'ust' ? 'top' : 'bottom'] = '5px';
          if(yat === 'sol') e.style.left = '6px'; else if(yat === 'sag') e.style.right = '6px';
          else { e.style.left = '50%'; e.style.transform = 'translateX(-50%)'; }
          sar.appendChild(e);
        }
        on.appendChild(sar);
      } else on.textContent = '…';
      k.append(on, el('div', 'dz-sk-alt', '<span>Sayfa ' + (i + 1) + '</span>'));
      iz.appendChild(k);
    }
  }
  async function kaydet(){
    const doc = await pdfLibAc(d.bytes, d.ad);
    const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    const sayfalar = doc.getPages();
    const pay = 24;
    sayfalar.forEach((p, i)=>{
      if(ayar.ilkAtla && i === 0) return;
      const t = metin(i, sayfalar.length);
      const gb = gorselBoyut(p);
      const w = font.widthOfTextAtSize(t, ayar.boyut);
      const [dik, yat] = ayar.konum.split('-');
      const vx = yat === 'sol' ? pay : yat === 'sag' ? gb.w - pay - w : (gb.w - w) / 2;
      const vy = dik === 'alt' ? pay : gb.h - pay - ayar.boyut;
      const n = gorselNokta(p, vx, vy);
      p.drawText(t, {x:n.x, y:n.y, size:ayar.boyut, font, color:PDFLib.rgb(0.15, 0.15, 0.15), rotate:PDFLib.degrees(n.aci)});
    });
    indirPdf(await doc.save(), kokAd(d.ad) + '-numarali.pdf');
    tamam('Numaralar eklendi, dosya indi.');
  }
}

// ==================== FİLİGRAN ====================
function kurFiligran(g){
  let d = null, kapak = null;
  const ayar = {metin:'KOPYA', boyut:64, opak:25, renk:'#888888', aci:45, desen:'orta', kalin:true};
  const alan = yuklemeAlani({kabul:'.pdf,application/pdf', metin:'PDF dosyası seç', sec:yukle});
  const ic = el('div');
  g.append(alan, ic);
  async function yukle(files){
    try{
      mesgul('Açılıyor...');
      d = await pdfOku(files[0]);
      alan.style.display = 'none';
      bildir('');
      ciz();
      kapak = await kucukResim(d.belge, 1, 320);
      onizle();
    }catch(e){ hata(e); }
  }
  function ciz(){
    ic.innerHTML = '';
    const cubuk = el('div', 'dz-cubuk');
    const m = el('input'); m.type = 'text'; m.value = ayar.metin; m.style.width = '180px';
    m.addEventListener('input', ()=>{ ayar.metin = m.value; onizle(); });
    const lbM = el('label', '', 'Yazı'); lbM.appendChild(m);
    const b = el('input'); b.type = 'number'; b.min = 8; b.max = 200; b.value = ayar.boyut;
    b.addEventListener('input', ()=>{ ayar.boyut = Math.min(200, Math.max(8, Number(b.value) || 64)); onizle(); });
    const lbB = el('label', '', 'Boyut'); lbB.appendChild(b);
    const r = el('input'); r.type = 'color'; r.value = ayar.renk;
    r.addEventListener('input', ()=>{ ayar.renk = r.value; onizle(); });
    const lbR = el('label', '', 'Renk'); lbR.appendChild(r);
    const o = el('input'); o.type = 'range'; o.min = 5; o.max = 100; o.value = ayar.opak;
    o.addEventListener('input', ()=>{ ayar.opak = Number(o.value); onizle(); });
    const lbO = el('label', '', 'Saydamlık'); lbO.appendChild(o);
    const a = el('select');
    [[45, 'Çapraz'], [0, 'Düz'], [-45, 'Ters çapraz']].forEach(([k, ad])=>{ const op = el('option', '', ad); op.value = k; op.selected = ayar.aci === k; a.appendChild(op); });
    a.addEventListener('change', ()=>{ ayar.aci = Number(a.value); onizle(); });
    const lbA = el('label', '', 'Açı'); lbA.appendChild(a);
    const ds = el('select');
    [['orta', 'Ortada bir kez'], ['doseme', 'Sayfaya döşe']].forEach(([k, ad])=>{ const op = el('option', '', ad); op.value = k; op.selected = ayar.desen === k; ds.appendChild(op); });
    ds.addEventListener('change', ()=>{ ayar.desen = ds.value; onizle(); });
    const lbD = el('label', '', 'Yerleşim'); lbD.appendChild(ds);
    cubuk.append(lbM, lbB, lbR, lbO, lbA, lbD);
    ic.appendChild(cubuk);
    const on = el('div', 'dz-onizle');
    on.id = 'dzFilOn';
    on.style.height = '380px';
    ic.appendChild(on);
    ic.appendChild(el('div', 'dz-not', 'Filigran bütün sayfalara eklenir (' + d.sayfa + ' sayfa).'));
    const alt = el('div', 'dz-alt');
    const btn = el('button', 'dz-btn buyuk', 'Filigran ekle ve indir');
    btn.addEventListener('click', ()=> isle(btn, 'Filigran ekleniyor...', kaydet));
    alt.appendChild(btn);
    ic.appendChild(alt);
    onizle();
  }
  function onizle(){
    const on = ic.querySelector('#dzFilOn');
    if(!on) return;
    on.innerHTML = '';
    if(!kapak){ on.textContent = '…'; return; }
    const sar = el('div'); sar.style.cssText = 'position:relative;line-height:0;';
    const im = el('img'); im.src = kapak.toDataURL(); im.style.cssText = 'max-height:360px;max-width:100%;';
    sar.appendChild(im);
    const katman = el('div', 'dz-fil');
    const pVp = kapak.width;
    im.onload = ()=>{
      const k = im.clientWidth / (gorselGen || 595);
      katman.innerHTML = '';
      const parca = (x, y)=>{
        const s = el('span', '', esc(ayar.metin));
        s.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;font-size:' + (ayar.boyut * k) + 'px;color:' + ayar.renk +
          ';opacity:' + (ayar.opak / 100) + ';transform:translate(-50%,-50%) rotate(' + (-ayar.aci) + 'deg);font-weight:700;font-family:Arial,sans-serif;';
        katman.appendChild(s);
      };
      const W = im.clientWidth, H = im.clientHeight;
      if(ayar.desen === 'orta') parca(W / 2, H / 2);
      else { const ad = ayar.boyut * k * Math.max(3, ayar.metin.length * 0.55) ; for(let y=ad/2; y<H+ad; y+=ad*0.75) for(let x=(Math.round(y/ad)%2?ad/2:0); x<W+ad; x+=ad) parca(x, y); }
    };
    sar.appendChild(katman);
    on.appendChild(sar);
    void pVp;
  }
  let gorselGen = 595;
  async function kaydet(){
    const doc = await pdfLibAc(d.bytes, d.ad);
    const font = await fontGom(doc, {}, false, ayar.kalin, false);
    const renk = hexRgb(ayar.renk);
    doc.getPages().forEach(p=>{
      const gb = gorselBoyut(p);
      const w = font.widthOfTextAtSize(ayar.metin, ayar.boyut);
      const h = font.heightAtSize(ayar.boyut, {descender:false});
      const rad = ayar.aci * Math.PI / 180;
      const koy = (cx, cy)=>{
        // Yazının ortası (cx, cy)'ye gelecek şekilde başlangıç noktası
        const vx = cx - (w / 2) * Math.cos(rad) + (h / 2) * Math.sin(rad);
        const vy = cy - (w / 2) * Math.sin(rad) - (h / 2) * Math.cos(rad);
        const n = gorselNokta(p, vx, vy);
        p.drawText(ayar.metin, {x:n.x, y:n.y, size:ayar.boyut, font, color:renk, opacity:ayar.opak / 100, rotate:PDFLib.degrees(n.aci + ayar.aci)});
      };
      if(ayar.desen === 'orta') koy(gb.w / 2, gb.h / 2);
      else {
        const ad = Math.max(w * 0.9, ayar.boyut * 3);
        for(let y=ad/2, sira=0; y<gb.h + ad; y+=ad*0.75, sira++)
          for(let x=(sira % 2 ? ad/2 : 0); x<gb.w + ad; x+=ad) koy(x, y);
      }
    });
    indirPdf(await doc.save(), kokAd(d.ad) + '-filigranli.pdf');
    tamam('Filigran eklendi, dosya indi.');
  }
  // Önizleme ölçeği için ilk sayfanın görünen genişliği
  const eskiYukle = yukle;
  yukle = async files=>{ await eskiYukle(files); try{ const p = await d.belge.getPage(1); gorselGen = p.getViewport({scale:1}).width; onizle(); }catch(e){} };
}

// ==================== PDF DÜZENLE ====================
// Mevcut metinler: pdf.js sayfadaki yazıları konumlarıyla verir; aynı satırdaki parçalar
// birleştirilip tıklanabilir kutular yapılır. Kaydederken eski yazı sayfanın içerik
// akışından gerçekten silinir (metinSil), yeni yazı Liberation fontuyla aynı yere yazılır.
// Silinemeyen durumlarda (ör. form nesnesi içindeki yazı) eski yazının üstü zemin rengiyle kapatılır.
function kurDuzenle(g, a){
  const imzaModu = a.id === 'imza';
  let d = null;
  let sayfalar = [];      // {no, p, vp1, vp, olcek, kutu, canvas, katman, segler, cizildi, dpr}
  let nesneler = [];      // eklenen yazı / resim / kutu
  const degisimler = new Map();   // segId -> {seg, metin, boyut, renk, kalin, italik, serif, zemin, el, ortu}
  let mod = 'metin';
  let secili = null;      // {tur:'seg'|'nesne', ...}
  const gecmis = [];
  let sayac = 0;
  const alan = yuklemeAlani({kabul:'.pdf,application/pdf', metin:'PDF dosyası seç', sec:yukle});
  const ic = el('div');
  g.append(alan, ic);

  async function yukle(files){
    try{
      mesgul('Açılıyor...');
      d = await pdfOku(files[0]);
      alan.style.display = 'none';
      await kur();
      bildir('');
      if(imzaModu) setTimeout(imzaCiz, 300);
    }catch(e){ hata(e); }
  }

  let cubuk, bicim, alanEl, kenar, gozlem;
  async function kur(){
    ic.innerHTML = '';
    cubuk = el('div', 'dz-cubuk dz-arac-cubuk');
    const modlar = el('span', 'dz-seg');
    [['metin', '✎ Metni düzenle'], ['yazi', 'T Yazı ekle'], ['kutu', '▭ Beyaz kutu']].forEach(([k, ad])=>{
      const b = el('button', k === mod ? 'on' : '', ad);
      b.type = 'button'; b.dataset.mod = k;
      b.addEventListener('click', ()=> modSec(k));
      modlar.appendChild(b);
    });
    const resimBtn = tus('🖼 Resim', ()=> dosyaSecici('image/*', false, f=> resimEkle(f[0])));
    const imzaBtn = tus('✍ İmza', imzaCiz);
    bicim = el('span', 'dz-bicim');
    const fontSec = el('select');
    [['n', 'Sans (Arial)'], ['s', 'Serif (Times)']].forEach(([k, ad])=>{ const o = el('option', '', ad); o.value = k; fontSec.appendChild(o); });
    const boyutInp = el('input'); boyutInp.type = 'number'; boyutInp.min = 4; boyutInp.max = 200; boyutInp.step = 0.5; boyutInp.title = 'Yazı boyutu (pt)';
    const kalinBtn = tus('B', ()=> bicimUygula({kalin: !aktifBicim().kalin})); kalinBtn.classList.add('b');
    const italikBtn = tus('I', ()=> bicimUygula({italik: !aktifBicim().italik})); italikBtn.classList.add('i');
    const renkInp = el('input'); renkInp.type = 'color'; renkInp.title = 'Renk';
    fontSec.addEventListener('change', ()=> bicimUygula({serif: fontSec.value === 's'}));
    boyutInp.addEventListener('change', ()=> bicimUygula({boyut: Math.min(200, Math.max(4, Number(boyutInp.value) || 12))}));
    renkInp.addEventListener('input', ()=> bicimUygula({renk: renkInp.value}));
    bicim.append(fontSec, boyutInp, kalinBtn, italikBtn, renkInp);
    bicim.ogeler = {fontSec, boyutInp, kalinBtn, italikBtn, renkInp};
    const geriBtn = tus('↶ Geri al', geriAl);
    const kaydetBtn = el('button', 'dz-btn', 'PDF\'i indir');
    kaydetBtn.addEventListener('click', ()=> isle(kaydetBtn, 'PDF hazırlanıyor...', kaydet));
    cubuk.append(modlar, resimBtn, imzaBtn, bicim, el('span', 'bosluk'), geriBtn, kaydetBtn);
    ic.appendChild(cubuk);
    ic.appendChild(el('div', 'dz-not', 'Değiştirmek istediğiniz yazıya tıklayın. Yazı eklemek için "Yazı ekle"yi seçip sayfada bir yere tıklayın.'));

    const duz = el('div', 'dz-edit');
    kenar = el('div', 'dz-kenar');
    alanEl = el('div', 'dz-alan');
    duz.append(kenar, alanEl);
    ic.appendChild(duz);

    const genislik = Math.max(280, alanEl.clientWidth || (ic.clientWidth - 140));
    gozlem = new IntersectionObserver(girdiler=>{
      girdiler.forEach(gd=>{ if(gd.isIntersecting){ const sy = sayfalar[Number(gd.target.dataset.i)]; if(sy && !sy.cizildi) sayfaCiz(sy); } });
    }, {rootMargin:'600px 0px'});
    sayfalar = [];
    for(let no=1; no<=d.sayfa; no++){
      const p = await d.belge.getPage(no);
      const vp1 = p.getViewport({scale:1});
      const olcek = Math.min(1.5, (genislik - 8) / vp1.width);
      const vp = p.getViewport({scale:olcek});
      const kutu = el('div', 'dz-sayfa');
      kutu.style.width = vp.width + 'px'; kutu.style.height = vp.height + 'px';
      kutu.dataset.i = no - 1;
      kutu.appendChild(el('span', 'dz-sno', no + ' / ' + d.sayfa));
      const katman = el('div', 'dz-katman mod-' + mod);
      kutu.appendChild(katman);
      const sy = {no, p, vp1, vp, olcek, kutu, katman, segler:[], cizildi:false, rot:p.rotate || 0};
      sayfalar.push(sy);
      katmanOlaylari(sy);
      alanEl.appendChild(kutu);
      gozlem.observe(kutu);
      // Kenar çubuğunda küçük sayfa
      const kk = el('div');
      const on = el('div', 'dz-onizle', '…');
      kk.append(on, el('div', 'no', String(no)));
      kk.addEventListener('click', ()=> kutu.scrollIntoView({behavior:'smooth', block:'start'}));
      kenar.appendChild(kk);
      kucukResim(d.belge, no, 100).then(c=>{ on.innerHTML = ''; on.appendChild(c); }).catch(()=>{});
    }
  }
  function tus(metin, fn){
    const b = el('button', 'dz-tus', metin);
    b.type = 'button';
    b.addEventListener('click', fn);
    return b;
  }
  function modSec(k){
    mod = k;
    cubuk.querySelectorAll('[data-mod]').forEach(b=> b.classList.toggle('on', b.dataset.mod === k));
    sayfalar.forEach(sy=> sy.katman.className = 'dz-katman mod-' + k);
    secimKaldir();
  }

  async function sayfaCiz(sy){
    sy.cizildi = true;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const vp = sy.p.getViewport({scale: sy.olcek * dpr});
    const c = document.createElement('canvas');
    c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
    c.style.width = sy.vp.width + 'px'; c.style.height = sy.vp.height + 'px';
    sy.canvas = c; sy.dpr = dpr;
    sy.kutu.insertBefore(c, sy.katman);
    await sy.p.render({canvasContext:c.getContext('2d', {willReadFrequently:true}), viewport:vp}).promise;
    if(sy.rot !== 0) return;   // Döndürülmüş sayfalarda mevcut yazı düzenleme kapalı
    const tc = await sy.p.getTextContent();
    sy.segler = segmentler(tc.items, sy);
    sy.segler.forEach(s=>{
      const r = segKutusu(sy, s);
      const e = el('div', 'dz-tseg');
      e.style.cssText = 'left:' + r.x + 'px;top:' + r.y + 'px;width:' + r.w + 'px;height:' + r.h + 'px;';
      e.title = s.metin;
      e.addEventListener('click', ev=>{ if(mod !== 'metin') return; ev.stopPropagation(); segDuzenle(sy, s); });
      s.el = e;
      sy.katman.appendChild(e);
    });
  }

  function segmentler(items, sy){
    const parcalar = [];
    items.forEach((it, idx)=>{
      // pdf.js sütunlar arasına geniş " " parçaları koyar; bunlar konum hesabına katılmaz.
      if(!it.str || !it.str.trim()) return;
      const [A, B, C, D, E, F] = it.transform;
      if(Math.abs(B) > 0.01 * Math.abs(A) || Math.abs(C) > 0.01 * Math.abs(D) || A <= 0 || D <= 0) return;
      parcalar.push({str:it.str, x:E, y:F, w:it.width, boy:D, font:it.fontName, idx});
    });
    const satirlar = [];
    parcalar.forEach(p=>{
      let s = satirlar.find(x=> Math.abs(x.y - p.y) < x.boy * 0.3 && Math.abs(x.boy - p.boy) < x.boy * 0.3);
      if(!s){ s = {y:p.y, boy:p.boy, ogeler:[]}; satirlar.push(s); }
      s.ogeler.push(p);
    });
    const sonuc = [];
    satirlar.forEach(st=>{
      st.ogeler.sort((a, b)=> a.x - b.x);
      let seg = null;
      st.ogeler.forEach(p=>{
        const bosluk = seg ? p.x - seg.x1 : 0;
        if(!seg || bosluk > Math.max(seg.boy, p.boy) * 0.7 || bosluk < -seg.boy * 0.5){
          seg = {id:'s' + sy.no + '_' + (sayac++), x0:p.x, x1:p.x + p.w, y:p.y, boy:p.boy, metin:'', fontlar:[]};
          sonuc.push(seg);
        } else if(bosluk > p.boy * 0.12 && !/\s$/.test(seg.metin) && !/^\s/.test(p.str)) seg.metin += ' ';
        seg.metin += p.str;
        seg.x1 = Math.max(seg.x1, p.x + p.w);
        seg.fontlar.push(p.font);
      });
    });
    return sonuc.filter(s=> s.metin.trim()).map(s=>{
      s.metin = s.metin.replace(/\s+$/, '').replace(/^\s+/, '');
      const fi = fontBilgisi(sy, s.fontlar[0]);
      return Object.assign(s, fi);
    });
  }
  function fontBilgisi(sy, ad){
    let isim = '';
    try{ const f = sy.p.commonObjs.get(ad); isim = (f && (f.name || f.loadedName)) || ''; }catch(e){}
    isim = String(isim).replace(/^[A-Z]{6}\+/, '');
    return {
      fontAdi: isim,
      kalin: /bold|black|heavy|semibold|demi/i.test(isim),
      italik: /italic|oblique/i.test(isim),
      serif: /times|serif|georgia|garamond|cambria|palatino|bookman|antiqua|minion/i.test(isim) && !/sans/i.test(isim)
    };
  }
  function segKutusu(sy, s){
    const r = sy.vp.convertToViewportRectangle([s.x0, s.y - s.boy * 0.25, s.x1, s.y + s.boy * 0.95]);
    const x = Math.min(r[0], r[2]), y = Math.min(r[1], r[3]);
    return {x, y, w:Math.abs(r[2] - r[0]), h:Math.abs(r[3] - r[1])};
  }
  // Yazı kutusunun kenarlarından zemin, içinden yazı rengi okunur.
  function renkOku(sy, r){
    const k = sy.dpr, c = sy.canvas;
    const x = Math.max(0, Math.floor(r.x * k) - 2), y = Math.max(0, Math.floor(r.y * k) - 2);
    const w = Math.min(c.width - x, Math.ceil(r.w * k) + 4), h = Math.min(c.height - y, Math.ceil(r.h * k) + 4);
    if(w <= 0 || h <= 0) return {zemin:'#ffffff', yazi:'#000000'};
    const v = c.getContext('2d', {willReadFrequently:true}).getImageData(x, y, w, h).data;
    const say = {};
    const ekle = i=>{ const key = (v[i] >> 3) + ',' + (v[i+1] >> 3) + ',' + (v[i+2] >> 3); say[key] = (say[key] || 0) + 1; };
    for(let i=0;i<w;i++){ ekle((0 * w + i) * 4); ekle(((h - 1) * w + i) * 4); }
    for(let j=0;j<h;j++){ ekle((j * w) * 4); ekle((j * w + w - 1) * 4); }
    const enCok = Object.entries(say).sort((a, b)=> b[1] - a[1])[0][0].split(',').map(n=> Number(n) * 8 + 4);
    const zr = enCok.map(n=> Math.min(255, n));
    let enUzak = 0, yr = [0, 0, 0];
    for(let i=0;i<v.length;i+=4){
      const fark = Math.abs(v[i] - zr[0]) + Math.abs(v[i+1] - zr[1]) + Math.abs(v[i+2] - zr[2]);
      if(fark > enUzak){ enUzak = fark; yr = [v[i], v[i+1], v[i+2]]; }
    }
    const hex = a=> '#' + a.map(n=> n.toString(16).padStart(2, '0')).join('');
    // Saf beyaza yakın zemin beyaz kabul edilir (hafif kenar yumuşatmasından gelen gri tonu olmasın).
    return {zemin: zr.every(n=> n > 238) ? '#ffffff' : hex(zr), yazi: enUzak < 60 ? '#000000' : hex(yr)};
  }

  // ---------- Mevcut yazıyı düzenleme ----------
  function segDuzenle(sy, s){
    let dg = degisimler.get(s.id);
    if(!dg){
      const r = segKutusu(sy, s);
      const renk = renkOku(sy, r);
      dg = {sy, seg:s, metin:s.metin, boyut:Math.round(s.boy * 10) / 10, renk:renk.yazi, zemin:renk.zemin,
            kalin:s.kalin, italik:s.italik, serif:s.serif, yeni:true};
      const ortu = el('div', 'dz-ortu');
      ortu.style.cssText = 'left:' + (r.x - 1) + 'px;top:' + (r.y - 1) + 'px;width:' + (r.w + 2) + 'px;height:' + (r.h + 2) + 'px;background:' + renk.zemin;
      const e = el('div', 'dz-ydz');
      e.contentEditable = 'true';
      e.spellcheck = false;
      e.textContent = s.metin;
      dg.ortu = ortu; dg.el = e;
      sy.katman.append(ortu, e);
      e.addEventListener('focus', ()=> secimYap({tur:'seg', dg}));
      e.addEventListener('blur', ()=> segBitir(dg));
      e.addEventListener('keydown', ev=>{ if(ev.key === 'Enter'){ ev.preventDefault(); e.blur(); } if(ev.key === 'Escape'){ e.textContent = dg.metin; e.blur(); } });
      e.addEventListener('paste', ev=>{ ev.preventDefault(); const t = (ev.clipboardData || window.clipboardData).getData('text').replace(/\s*\n\s*/g, ' '); document.execCommand('insertText', false, t); });
      degisimler.set(s.id, dg);
      s.el.style.display = 'none';
      segStil(dg);
    }
    dg.onceki = {metin:dg.metin, boyut:dg.boyut, renk:dg.renk, kalin:dg.kalin, italik:dg.italik, serif:dg.serif};
    dg.el.focus();
    const sec = window.getSelection(), aralik = document.createRange();
    aralik.selectNodeContents(dg.el);
    sec.removeAllRanges(); sec.addRange(aralik);
  }
  function segStil(dg){
    const sy = dg.sy, s = dg.seg;
    const taban = sy.vp.convertToViewportPoint(s.x0, s.y);
    const px = dg.boyut * sy.olcek;
    const e = dg.el;
    e.style.left = taban[0] + 'px';
    e.style.top = (taban[1] - px * (dg.serif ? 0.89 : 0.905)) + 'px';
    e.style.fontSize = px + 'px';
    e.style.fontFamily = dg.serif ? '"Liberation Serif","Times New Roman",Times,serif' : '"Liberation Sans",Arial,Helvetica,sans-serif';
    e.style.fontWeight = dg.kalin ? '700' : '400';
    e.style.fontStyle = dg.italik ? 'italic' : 'normal';
    e.style.color = dg.renk;
  }
  function segBitir(dg){
    const yeniMetin = dg.el.textContent.replace(/\s+/g, ' ');
    const o = dg.onceki;
    const degisti = !o || yeniMetin !== o.metin || ['boyut', 'renk', 'kalin', 'italik', 'serif'].some(k=> dg[k] !== o[k]);
    dg.metin = yeniMetin;
    if(dg.yeni && yeniMetin === dg.seg.metin && !degisti){
      // Hiçbir şey değişmedi: kutu kaldırılır, orijinal yazı kalır.
      setTimeout(()=>{ if(secili && secili.dg === dg && document.activeElement === dg.el) return; if(dg.metin === dg.seg.metin && !stilDegisti(dg)) segGeriAl(dg); }, 0);
      return;
    }
    if(degisti && o){
      const geri = Object.assign({}, o);
      const ilk = dg.yeni;
      gecmis.push(()=>{ if(ilk) segGeriAl(dg); else { Object.assign(dg, geri); dg.el.textContent = dg.metin; segStil(dg); } });
    }
    dg.yeni = false;
  }
  function stilDegisti(dg){
    const s = dg.seg;
    return dg.kalin !== s.kalin || dg.italik !== s.italik || dg.serif !== s.serif || Math.abs(dg.boyut - Math.round(s.boy * 10) / 10) > 0.01 || dg.renkElle;
  }
  function segGeriAl(dg){
    dg.el.remove(); dg.ortu.remove();
    dg.seg.el.style.display = '';
    degisimler.delete(dg.seg.id);
    if(secili && secili.dg === dg) secimKaldir();
  }

  // ---------- Eklenen nesneler ----------
  function katmanOlaylari(sy){
    sy.katman.addEventListener('pointerdown', ev=>{
      if(ev.target !== sy.katman && !ev.target.classList.contains('dz-tseg')) return;
      const r = sy.katman.getBoundingClientRect();
      const x = (ev.clientX - r.left) / sy.olcek, y = (ev.clientY - r.top) / sy.olcek;
      if(mod === 'yazi'){
        ev.preventDefault();
        const n = nesneEkle({tur:'yazi', sy, x, y:y - 8, metin:'', boyut:12, renk:'#000000', kalin:false, italik:false, serif:false});
        n.ic.focus();
        setTimeout(()=>{ if(document.activeElement !== n.ic) n.ic.focus(); }, 0);
        modSec('metin');
      } else if(mod === 'kutu'){
        ev.preventDefault();
        const ciz = el('div', 'dz-cizim');
        sy.katman.appendChild(ciz);
        const bas = {x, y};
        const hareket = e2=>{
          const x2 = (e2.clientX - r.left) / sy.olcek, y2 = (e2.clientY - r.top) / sy.olcek;
          const k = {x:Math.min(bas.x, x2), y:Math.min(bas.y, y2), w:Math.abs(x2 - bas.x), h:Math.abs(y2 - bas.y)};
          ciz.style.cssText = 'left:' + k.x * sy.olcek + 'px;top:' + k.y * sy.olcek + 'px;width:' + k.w * sy.olcek + 'px;height:' + k.h * sy.olcek + 'px';
          ciz.k = k;
        };
        const bitir = ()=>{
          window.removeEventListener('pointermove', hareket); window.removeEventListener('pointerup', bitir);
          ciz.remove();
          const k = ciz.k;
          if(k && k.w > 3 && k.h > 3) nesneEkle({tur:'kutu', sy, x:k.x, y:k.y, w:k.w, h:k.h, renk:'#ffffff'});
        };
        window.addEventListener('pointermove', hareket); window.addEventListener('pointerup', bitir);
      } else secimKaldir();
    });
  }
  function nesneEkle(n, gecmiseYazma){
    n.id = 'n' + (sayac++);
    nesneler.push(n);
    const e = el('div', 'dz-nesne' + (n.tur !== 'yazi' ? ' tasinir' : ''));
    n.el = e;
    if(n.tur === 'yazi'){
      const ic_ = el('div', 'ic');
      ic_.contentEditable = 'true';
      ic_.spellcheck = false;
      ic_.textContent = n.metin;
      ic_.addEventListener('focus', ()=> secimYap({tur:'nesne', n}));
      ic_.addEventListener('input', ()=>{ n.metin = ic_.innerText.replace(/\n$/, ''); });
      ic_.addEventListener('paste', ev=>{ ev.preventDefault(); document.execCommand('insertText', false, (ev.clipboardData || window.clipboardData).getData('text')); });
      ic_.addEventListener('blur', ()=>{ setTimeout(()=>{ if(!n.metin.trim() && document.activeElement !== ic_ && nesneler.includes(n)) nesneSil(n, true); }, 150); });
      n.ic = ic_;
      e.appendChild(ic_);
      const t = el('span', 'tut', '✥'); t.title = 'Taşı';
      e.appendChild(t);
      surukle(t, n, 'tasi');
    } else if(n.tur === 'resim'){
      const im = el('img'); im.src = n.src; e.appendChild(im);
      surukle(e, n, 'tasi');
    } else {
      surukle(e, n, 'tasi');
    }
    if(n.tur !== 'yazi'){ const b = el('span', 'boyut'); e.appendChild(b); surukle(b, n, 'boyut'); }
    const k = el('span', 'kapat', '✕'); k.title = 'Sil';
    k.addEventListener('pointerdown', ev=>{ ev.stopPropagation(); ev.preventDefault(); nesneSil(n); });
    e.appendChild(k);
    e.addEventListener('pointerdown', ev=>{ if(n.tur !== 'yazi'){ ev.stopPropagation(); } secimYap({tur:'nesne', n}); });
    n.sy.katman.appendChild(e);
    nesneStil(n);
    if(!gecmiseYazma) gecmis.push(()=> nesneSil(n, true));
    secimYap({tur:'nesne', n});
    return n;
  }
  function nesneStil(n){
    const o = n.sy.olcek, e = n.el;
    e.style.left = n.x * o + 'px';
    e.style.top = n.y * o + 'px';
    if(n.tur === 'yazi'){
      const s = n.ic.style;
      s.fontSize = n.boyut * o + 'px';
      s.fontFamily = n.serif ? '"Liberation Serif","Times New Roman",Times,serif' : '"Liberation Sans",Arial,Helvetica,sans-serif';
      s.fontWeight = n.kalin ? '700' : '400';
      s.fontStyle = n.italik ? 'italic' : 'normal';
      s.color = n.renk;
    } else {
      e.style.width = n.w * o + 'px';
      e.style.height = n.h * o + 'px';
      if(n.tur === 'kutu') e.style.background = n.renk;
    }
  }
  function nesneSil(n, gecmisYok){
    const i = nesneler.indexOf(n);
    if(i < 0) return;
    nesneler.splice(i, 1);
    n.el.remove();
    if(secili && secili.n === n) secimKaldir();
    if(!gecmisYok) gecmis.push(()=>{ nesneler.push(n); n.sy.katman.appendChild(n.el); nesneStil(n); });
  }
  function surukle(tutamak, n, tur){
    tutamak.addEventListener('pointerdown', ev=>{
      if(ev.button !== undefined && ev.button !== 0) return;
      ev.preventDefault(); ev.stopPropagation();
      secimYap({tur:'nesne', n});
      const bas = {x:ev.clientX, y:ev.clientY, nx:n.x, ny:n.y, w:n.w, h:n.h};
      const o = n.sy.olcek;
      let oynadi = false;
      const hareket = e2=>{
        const dx = (e2.clientX - bas.x) / o, dy = (e2.clientY - bas.y) / o;
        if(Math.abs(dx) + Math.abs(dy) > 1) oynadi = true;
        if(tur === 'tasi'){ n.x = bas.nx + dx; n.y = bas.ny + dy; }
        else {
          const oran = bas.h / bas.w;
          n.w = Math.max(8, bas.w + dx);
          n.h = n.tur === 'resim' ? n.w * oran : Math.max(4, bas.h + dy);
        }
        nesneStil(n);
      };
      const bitir = ()=>{
        window.removeEventListener('pointermove', hareket); window.removeEventListener('pointerup', bitir);
        if(oynadi) gecmis.push(()=>{ n.x = bas.nx; n.y = bas.ny; n.w = bas.w; n.h = bas.h; nesneStil(n); });
      };
      window.addEventListener('pointermove', hareket); window.addEventListener('pointerup', bitir);
    });
  }

  // ---------- Seçim ve biçim çubuğu ----------
  function secimYap(s){
    if(secili && secili.n && secili.n !== s.n) secili.n.el.classList.remove('secili');
    secili = s;
    if(s.n) s.n.el.classList.add('secili');
    const b = aktifBicim();
    const yaziMi = !(s.n && s.n.tur !== 'yazi');
    bicim.classList.toggle('acik', true);
    const og = bicim.ogeler;
    og.fontSec.style.display = og.boyutInp.style.display = og.kalinBtn.style.display = og.italikBtn.style.display = yaziMi ? '' : 'none';
    og.fontSec.value = b.serif ? 's' : 'n';
    og.boyutInp.value = b.boyut || '';
    og.kalinBtn.classList.toggle('on', !!b.kalin);
    og.italikBtn.classList.toggle('on', !!b.italik);
    og.renkInp.value = /^#[0-9a-f]{6}$/i.test(b.renk) ? b.renk : '#000000';
  }
  function secimKaldir(){
    if(secili && secili.n) secili.n.el.classList.remove('secili');
    secili = null;
    if(bicim) bicim.classList.remove('acik');
  }
  function aktifBicim(){
    if(!secili) return {};
    return secili.tur === 'seg' ? secili.dg : secili.n;
  }
  function bicimUygula(deg){
    if(!secili) return;
    const h = aktifBicim();
    if(secili.tur === 'seg'){
      Object.assign(h, deg);
      if(deg.renk) h.renkElle = true;
      segStil(h);
      h.el.focus();
    } else {
      const once = {boyut:h.boyut, renk:h.renk, kalin:h.kalin, italik:h.italik, serif:h.serif};
      Object.assign(h, deg);
      nesneStil(h);
      gecmis.push(()=>{ Object.assign(h, once); nesneStil(h); });
    }
    secimYap(secili);
  }
  function geriAl(){
    const f = gecmis.pop();
    if(f) f(); else bildir('Geri alınacak bir şey yok.');
  }
  document.addEventListener('keydown', function tusDinle(ev){
    if(!document.body.contains(ic)){ document.removeEventListener('keydown', tusDinle); return; }
    const yaziyor = document.activeElement && document.activeElement.isContentEditable;
    if((ev.key === 'Delete' || ev.key === 'Backspace') && !yaziyor && secili && secili.n){ ev.preventDefault(); nesneSil(secili.n); }
    if((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z' && !yaziyor){ ev.preventDefault(); geriAl(); }
  });

  function gorunenSayfa(){
    let en = sayfalar[0], enIyi = Infinity;
    sayfalar.forEach(sy=>{ const r = sy.kutu.getBoundingClientRect(); const u = Math.abs(r.top + r.height / 2 - window.innerHeight / 2); if(u < enIyi){ enIyi = u; en = sy; } });
    return en;
  }
  async function resimEkle(file){
    try{
      const {img, url} = await resimAc(file);
      const max = 1800, o = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * o); c.height = Math.round(img.naturalHeight * o);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      const png = /png|gif|webp/i.test(file.type);
      resimNesnesi(c.toDataURL(png ? 'image/png' : 'image/jpeg', 0.9), c.width, c.height, png ? 'png' : 'jpg', 220);
    }catch(e){ hata(e); }
  }
  function resimNesnesi(src, w, h, tip, gen){
    const sy = gorunenSayfa();
    const W = sy.vp1.width, H = sy.vp1.height;
    const ww = Math.min(gen, W * 0.6), hh = ww * h / w;
    const r = sy.kutu.getBoundingClientRect();
    const ortaY = Math.min(H - hh - 10, Math.max(10, (window.innerHeight / 2 - r.top) / sy.olcek - hh / 2));
    nesneEkle({tur:'resim', sy, x:(W - ww) / 2, y:ortaY, w:ww, h:hh, src, tip});
  }

  // ---------- İmza ----------
  function imzaCiz(){
    if(!d) return;
    const ov = el('div', 'dz-imza-ov');
    const kutu = el('div', 'dz-imza');
    kutu.innerHTML = '<h3>İmzanızı çizin</h3>';
    const c = el('canvas');
    kutu.appendChild(c);
    const alt = el('div', 'alt');
    const renk = el('select');
    [['#111111', 'Siyah'], ['#1d3fa8', 'Mavi']].forEach(([k, ad])=>{ const o = el('option', '', ad); o.value = k; renk.appendChild(o); });
    const temizle = el('button', 'dz-btn ikincil kucuk', 'Temizle');
    const vazgec = el('button', 'dz-btn ikincil kucuk', 'Vazgeç');
    const ekle = el('button', 'dz-btn kucuk', 'İmzayı ekle');
    alt.append(renk, temizle, el('span', 'bosluk'), vazgec, ekle);
    alt.querySelector('.bosluk').style.flex = '1';
    kutu.appendChild(alt);
    ov.appendChild(kutu);
    document.body.appendChild(ov);
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr;
    const x = c.getContext('2d');
    x.scale(dpr, dpr); x.lineCap = 'round'; x.lineJoin = 'round';
    let ciziyor = false, son = null, bos = true;
    c.addEventListener('pointerdown', e=>{ ciziyor = true; bos = false; son = [e.offsetX, e.offsetY]; c.setPointerCapture(e.pointerId); x.strokeStyle = renk.value; x.lineWidth = 2.6; x.beginPath(); x.arc(son[0], son[1], 1.2, 0, 7); x.fillStyle = renk.value; x.fill(); });
    c.addEventListener('pointermove', e=>{
      if(!ciziyor) return;
      const p = [e.offsetX, e.offsetY];
      x.beginPath(); x.moveTo(son[0], son[1]);
      x.quadraticCurveTo(son[0], son[1], (son[0] + p[0]) / 2, (son[1] + p[1]) / 2);
      x.lineTo(p[0], p[1]); x.stroke();
      son = p;
    });
    c.addEventListener('pointerup', ()=>{ ciziyor = false; });
    temizle.addEventListener('click', ()=>{ x.clearRect(0, 0, c.width, c.height); bos = true; });
    vazgec.addEventListener('click', ()=> ov.remove());
    ekle.addEventListener('click', ()=>{
      if(bos){ bildir('Önce imzanızı çizin.', 'hata'); return; }
      // Boş kenarlar kırpılır
      const v = x.getImageData(0, 0, c.width, c.height).data;
      let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
      for(let j=0;j<c.height;j++) for(let i=0;i<c.width;i++) if(v[(j * c.width + i) * 4 + 3] > 10){ if(i<x0)x0=i; if(i>x1)x1=i; if(j<y0)y0=j; if(j>y1)y1=j; }
      const k = document.createElement('canvas');
      k.width = x1 - x0 + 8; k.height = y1 - y0 + 8;
      k.getContext('2d').drawImage(c, x0 - 4, y0 - 4, k.width, k.height, 0, 0, k.width, k.height);
      ov.remove();
      resimNesnesi(k.toDataURL('image/png'), k.width, k.height, 'png', 150);
      modSec('metin');
    });
  }

  // ---------- Kaydet ----------
  async function kaydet(){
    if(document.activeElement && document.activeElement.isContentEditable) document.activeElement.blur();
    await bekle(20);
    const doc = await pdfLibAc(d.bytes, d.ad);
    const {rgb, degrees} = PDFLib;
    const fontlar = {};
    const pdfSayfalar = doc.getPages();
    let kapatilan = 0;
    // 1) Değiştirilen yazılar
    const sayfaya = new Map();
    degisimler.forEach(dg=>{ if(!sayfaya.has(dg.sy.no)) sayfaya.set(dg.sy.no, []); sayfaya.get(dg.sy.no).push(dg); });
    for(const [no, liste] of sayfaya){
      const p = pdfSayfalar[no - 1];
      let bulunan;
      try{ bulunan = await metinSil(doc, p, liste.map(dg=> ({x0:dg.seg.x0, x1:dg.seg.x1, y:dg.seg.y, boy:dg.seg.boy}))); }
      catch(e){ console.warn('Metin silinemedi', e); bulunan = liste.map(()=> false); }
      for(let i=0;i<liste.length;i++){
        const dg = liste[i], s = dg.seg;
        if(!bulunan[i]){
          kapatilan++;
          p.drawRectangle({x:s.x0 - 1, y:s.y - s.boy * 0.28, width:s.x1 - s.x0 + 2, height:s.boy * 1.26, color:hexRgb(dg.zemin)});
        }
        const t = dg.metin.trim() ? dg.metin : '';
        if(t){
          const f = await fontGom(doc, fontlar, dg.serif, dg.kalin, dg.italik);
          p.drawText(t, {x:s.x0, y:s.y, size:dg.boyut, font:f, color:hexRgb(dg.renk)});
        }
      }
    }
    // 2) Eklenen nesneler (görünen koordinatlardan PDF koordinatına; döndürülmüş sayfalarda da düz durur)
    for(const n of nesneler){
      const p = pdfSayfalar[n.sy.no - 1];
      const vp = n.sy.vp1;
      const aci = degrees(n.sy.rot || 0);
      const nokta = (x, y)=> vp.convertToPdfPoint(x, y);
      if(n.tur === 'kutu'){
        const [x, y] = nokta(n.x, n.y + n.h);
        p.drawRectangle({x, y, width:n.w, height:n.h, color:hexRgb(n.renk), rotate:aci});
      } else if(n.tur === 'resim'){
        const bayt = await (await fetch(n.src)).arrayBuffer();
        const im = n.tip === 'png' ? await doc.embedPng(bayt) : await doc.embedJpg(bayt);
        const [x, y] = nokta(n.x, n.y + n.h);
        p.drawImage(im, {x, y, width:n.w, height:n.h, rotate:aci});
      } else if(n.tur === 'yazi' && n.metin.trim()){
        const f = await fontGom(doc, fontlar, n.serif, n.kalin, n.italik);
        n.metin.split('\n').forEach((satir, i)=>{
          if(!satir) return;
          const [x, y] = nokta(n.x, n.y + n.boyut * (0.947 + i * 1.2));
          p.drawText(satir, {x, y, size:n.boyut, font:f, color:hexRgb(n.renk), rotate:aci});
        });
      }
    }
    indirPdf(await doc.save(), kokAd(d.ad) + '-duzenlenmis.pdf');
    if(kapatilan) bildir('PDF indi. ' + kapatilan + ' yazı dosyadan silinemedi, üstü zemin rengiyle kapatıldı.', '', 7000);
    else tamam('PDF indi.');
  }
}

// ---------- İçerik akışından yazı silme ----------
// Sayfanın içerik akışı çözülür, metin işlemleri (Tj, TJ, ', ") konumlarıyla izlenir.
// Hedef kutunun içinde kalan bir metin işlemi, aynı genişlikte boşluk bırakan
// "[-n] TJ" ile değiştirilir; böylece satırdaki diğer yazılar yerinden oynamaz.
async function metinSil(doc, sayfa, hedefler){
  const {PDFName, PDFArray, PDFDict, PDFNumber, PDFRawStream} = PDFLib;
  const node = sayfa.node;
  const ic = node.Contents();
  if(!ic) return hedefler.map(()=> false);
  const akislar = ic instanceof PDFArray ? ic.asArray().map(r=> doc.context.lookup(r)) : [ic];
  const parcalar = [];
  for(const a of akislar){
    if(!(a instanceof PDFRawStream)) return hedefler.map(()=> false);
    parcalar.push(latin1(PDFLib.decodePDFRawStream(a).decode()));
  }
  const s = parcalar.join('\n');
  const islemler = icerikCoz(s);
  const kaynak = node.Resources();
  const fontSozluk = kaynak && kaynak.lookup(PDFName.of('Font'));
  const fontOnb = {};
  const standart = await standartGenislikler(doc, fontSozluk);
  const num = v=> (v instanceof PDFNumber) ? v.asNumber() : (v && typeof v.asNumber === 'function' ? v.asNumber() : undefined);
  function fontAl(ad){
    if(ad in fontOnb) return fontOnb[ad];
    let f = null;
    try{
      const fd = fontSozluk instanceof PDFDict ? fontSozluk.lookup(PDFName.of(ad)) : null;
      if(fd instanceof PDFDict){
        const tur = String(fd.get(PDFName.of('Subtype')));
        if(tur === '/Type0'){
          const kod = fd.lookup(PDFName.of('Encoding'));
          if(String(kod) === '/Identity-H'){
            const torun = fd.lookup(PDFName.of('DescendantFonts'));
            const cid = torun instanceof PDFArray ? torun.lookup(0) : null;
            if(cid instanceof PDFDict){
              const dw = num(cid.lookup(PDFName.of('DW')));
              const varsay = dw === undefined ? 1000 : dw;
              const tek = {}, araliklar = [];
              const W = cid.lookup(PDFName.of('W'));
              if(W instanceof PDFArray){
                const n = W.size();
                for(let i=0;i<n;){
                  const ilk = num(W.lookup(i));
                  const sonraki = W.lookup(i + 1);
                  if(sonraki instanceof PDFArray){
                    for(let k=0;k<sonraki.size();k++) tek[ilk + k] = num(sonraki.lookup(k));
                    i += 2;
                  } else { araliklar.push([ilk, num(sonraki), num(W.lookup(i + 2))]); i += 3; }
                }
              }
              f = {iki:true, gen:c=>{ if(c in tek) return tek[c]; for(const r of araliklar) if(c >= r[0] && c <= r[1]) return r[2]; return varsay; }};
            }
          }
        } else if(tur === '/TrueType' || tur === '/Type1' || tur === '/MMType1'){
          const W = fd.lookup(PDFName.of('Widths'));
          if(W instanceof PDFArray){
            const ilk = num(fd.lookup(PDFName.of('FirstChar'))) || 0;
            const tanim = fd.lookup(PDFName.of('FontDescriptor'));
            const eksik = tanim instanceof PDFDict ? (num(tanim.lookup(PDFName.of('MissingWidth'))) || 0) : 0;
            const ws = W.asArray().map(v=> num(doc.context.lookup(v)) || 0);
            f = {iki:false, gen:c=>{ const k = c - ilk; return (k >= 0 && k < ws.length) ? ws[k] : eksik; }};
          } else if(standart[ad]){
            f = {iki:false, gen:standart[ad]};
          }
        }
      }
    }catch(e){ f = null; }
    fontOnb[ad] = f;
    return f;
  }

  const carp = (a, b)=> [a[0]*b[0] + a[1]*b[2], a[0]*b[1] + a[1]*b[3], a[2]*b[0] + a[3]*b[2], a[2]*b[1] + a[3]*b[3],
                          a[4]*b[0] + a[5]*b[2] + b[4], a[4]*b[1] + a[5]*b[3] + b[5]];
  const uygula = (m, x, y)=> [m[0]*x + m[2]*y + m[4], m[1]*x + m[3]*y + m[5]];
  let gs = {ctm:[1,0,0,1,0,0], Tc:0, Tw:0, Th:1, TL:0, font:null, Tfs:0, Ts:0};
  const yigin = [];
  let Tm = [1,0,0,1,0,0], Tlm = [1,0,0,1,0,0];
  const degisim = [];
  const kapsanan = hedefler.map(()=> 0);
  const basarisiz = hedefler.map(()=> false);
  const sayi = v=> (v && v.t === 'num') ? v.v : 0;
  const yeniSatir = ()=>{ Tlm = carp([1,0,0,1,0,-gs.TL], Tlm); Tm = Tlm.slice(); };

  function ilerleme(dizi){
    // dizi: [{t:'str', v}, {t:'num', v}] → metin uzayında toplam ilerleme
    const f = gs.font ? fontAl(gs.font) : null;
    let top = 0, glif = 0;
    for(const p of dizi){
      if(p.t === 'num'){ top += -p.v / 1000 * gs.Tfs * gs.Th; continue; }
      if(p.t !== 'str') continue;
      if(!f) return null;
      const b = p.v;
      if(f.iki){
        for(let i=0;i+1<b.length;i+=2){ const c = (b.charCodeAt(i) << 8) | b.charCodeAt(i + 1); top += (f.gen(c) / 1000 * gs.Tfs + gs.Tc) * gs.Th; glif++; }
      } else {
        for(let i=0;i<b.length;i++){ const c = b.charCodeAt(i); if(isNaN(f.gen(c))) return null; top += (f.gen(c) / 1000 * gs.Tfs + gs.Tc + (c === 32 ? gs.Tw : 0)) * gs.Th; glif++; }
      }
    }
    return {top, glif};
  }
  function goster(isl, dizi, onEk){
    const il = ilerleme(dizi);
    const M = carp(Tm, gs.ctm);
    if(il){
      const yatay = Math.abs(M[1]) < Math.abs(M[0]) * 0.01 && Math.abs(M[2]) < Math.abs(M[3]) * 0.01 && M[0] > 0 && M[3] > 0;
      if(yatay && il.glif){
        const p0 = uygula(M, 0, gs.Ts), p1 = uygula(M, il.top, gs.Ts);
        const boy = gs.Tfs * Math.hypot(M[2], M[3]);
        hedefler.forEach((h, k)=>{
          if(Math.abs(p0[1] - h.y) > Math.max(h.boy * 0.35, 1)) return;
          const a0 = Math.min(p0[0], p1[0]), a1 = Math.max(p0[0], p1[0]);
          if(a1 <= h.x0 + 0.5 || a0 >= h.x1 - 0.5) return;            // hiç örtüşmüyor
          const pay = Math.max(h.boy, boy) * 0.6;
          if(a0 < h.x0 - pay || a1 > h.x1 + pay){ basarisiz[k] = true; return; }   // başka yazıyla aynı işlemde
          const bolen = gs.Tfs * gs.Th;
          if(!bolen){ basarisiz[k] = true; return; }
          const n = -il.top / bolen * 1000;
          degisim.push({bas:isl.bas, son:isl.son, yeni:(onEk || '') + '[' + sayiYaz(n) + '] TJ'});
          kapsanan[k] += a1 - a0;
        });
      }
      Tm = carp([1,0,0,1,il.top,0], Tm);
    } else {
      // Font genişlikleri okunamadı: bu satırdaki hedefler silinemez
      const p0 = uygula(M, 0, gs.Ts);
      hedefler.forEach((h, k)=>{ if(Math.abs(p0[1] - h.y) < Math.max(h.boy * 0.35, 1) && p0[0] < h.x1 && p0[0] > h.x0 - h.boy * 2) basarisiz[k] = true; });
    }
  }

  for(const isl of islemler){
    const a = isl.args;
    switch(isl.op){
      case 'q': yigin.push(JSON.stringify(gs)); break;
      case 'Q': if(yigin.length) gs = JSON.parse(yigin.pop()); break;
      case 'cm': if(a.length >= 6) gs.ctm = carp(a.slice(0, 6).map(sayi), gs.ctm); break;
      case 'BT': Tm = [1,0,0,1,0,0]; Tlm = [1,0,0,1,0,0]; break;
      case 'Tc': gs.Tc = sayi(a[0]); break;
      case 'Tw': gs.Tw = sayi(a[0]); break;
      case 'Tz': gs.Th = sayi(a[0]) / 100; break;
      case 'TL': gs.TL = sayi(a[0]); break;
      case 'Ts': gs.Ts = sayi(a[0]); break;
      case 'Tf': gs.font = a[0] && a[0].t === 'name' ? a[0].v : null; gs.Tfs = sayi(a[1]); break;
      case 'Td': Tlm = carp([1,0,0,1,sayi(a[0]),sayi(a[1])], Tlm); Tm = Tlm.slice(); break;
      case 'TD': gs.TL = -sayi(a[1]); Tlm = carp([1,0,0,1,sayi(a[0]),sayi(a[1])], Tlm); Tm = Tlm.slice(); break;
      case 'Tm': if(a.length >= 6){ Tlm = a.slice(0, 6).map(sayi); Tm = Tlm.slice(); } break;
      case 'T*': yeniSatir(); break;
      case 'Tj': if(a[0]) goster(isl, [a[0]]); break;
      case 'TJ': if(a[0] && a[0].t === 'arr') goster(isl, a[0].v); break;
      case "'": yeniSatir(); if(a[0]) goster(isl, [a[0]], 'T* '); break;
      case '"': gs.Tw = sayi(a[0]); gs.Tc = sayi(a[1]); yeniSatir(); if(a[2]) goster(isl, [a[2]], sayiYaz(gs.Tw) + ' Tw ' + sayiYaz(gs.Tc) + ' Tc T* '); break;
    }
  }
  const sonuc = hedefler.map((h, k)=> !basarisiz[k] && kapsanan[k] >= (h.x1 - h.x0) * 0.85);
  // Başarısız hedefe ait işlemler de silinmez; o yazı zemin rengiyle kapatılacak.
  if(!degisim.length) return sonuc;
  degisim.sort((x, y)=> y.bas - x.bas);
  let cikti = s, sonBas = Infinity;
  for(const dg of degisim){
    if(dg.son > sonBas) continue;       // aynı işlem iki kez değiştirilmesin
    cikti = cikti.slice(0, dg.bas) + dg.yeni + cikti.slice(dg.son);
    sonBas = dg.bas;
  }
  const akis = doc.context.flateStream(latinBayt(cikti));
  node.set(PDFName.of('Contents'), doc.context.register(akis));
  return sonuc;
}
// Widths dizisi olmayan 14 standart font (Helvetica, Times...) için genişlikler pdf-lib'in ölçülerinden alınır.
const STANDART14 = ['Courier','Courier-Bold','Courier-Oblique','Courier-BoldOblique','Helvetica','Helvetica-Bold','Helvetica-Oblique',
  'Helvetica-BoldOblique','Times-Roman','Times-Bold','Times-Italic','Times-BoldItalic'];
let olcuBelgesi = null;
async function standartGenislikler(doc, fontSozluk){
  const {PDFName, PDFDict} = PDFLib;
  const sonuc = {};
  if(!(fontSozluk instanceof PDFDict)) return sonuc;
  for(const [anahtar] of fontSozluk.entries()){
    const ad = anahtar.decodeText ? anahtar.decodeText() : String(anahtar).slice(1);
    const fd = fontSozluk.lookup(anahtar);
    if(!(fd instanceof PDFDict) || fd.lookup(PDFName.of('Widths'))) continue;
    const tur = String(fd.get(PDFName.of('Subtype')));
    const taban = String(fd.get(PDFName.of('BaseFont')) || '').replace(/^\//, '');
    if(tur !== '/Type1' || !STANDART14.includes(taban)) continue;
    if(!olcuBelgesi) olcuBelgesi = await PDFLib.PDFDocument.create();
    const f = await olcuBelgesi.embedFont(taban);
    const onb = {};
    sonuc[ad] = c=>{
      if(c in onb) return onb[c];
      let w = NaN;
      if(c >= 32 && c <= 126 || c >= 160) { try{ w = f.widthOfTextAtSize(String.fromCharCode(c), 1000); }catch(e){} }
      return (onb[c] = w);
    };
  }
  return sonuc;
}
function sayiYaz(n){
  if(!isFinite(n)) return '0';
  const t = n.toFixed(3).replace(/\.?0+$/, '');
  return t === '-0' ? '0' : t;
}
function latin1(u8){
  let s = '';
  for(let i=0;i<u8.length;i+=0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return s;
}
function latinBayt(s){
  const u = new Uint8Array(s.length);
  for(let i=0;i<s.length;i++) u[i] = s.charCodeAt(i) & 255;
  return u;
}
// İçerik akışı ayrıştırıcı: [{op, args, bas, son}] (bas/son: işlemin metindeki konumu)
function icerikCoz(s){
  const n = s.length;
  const BOS = c=> c === 32 || c === 10 || c === 13 || c === 9 || c === 12 || c === 0;
  const AYR = c=> c === 40 || c === 41 || c === 60 || c === 62 || c === 91 || c === 93 || c === 123 || c === 125 || c === 47 || c === 37;
  const islemler = [];
  let args = [], argBas = -1;
  const kaplar = [];
  const koy = (v, bas)=>{
    if(kaplar.length) kaplar[kaplar.length - 1].v.push(v);
    else { if(argBas < 0) argBas = bas; args.push(v); }
  };
  let i = 0;
  while(i < n){
    const c = s.charCodeAt(i);
    if(BOS(c)){ i++; continue; }
    if(c === 37){ while(i < n && s[i] !== '\n' && s[i] !== '\r') i++; continue; }
    const bas = i;
    if(c === 40){                       // ( literal dize )
      let der = 1, out = '';
      i++;
      while(i < n){
        const ch = s[i];
        if(ch === '\\'){
          const e = s[i + 1];
          i += 2;
          if(e === 'n') out += '\n'; else if(e === 'r') out += '\r'; else if(e === 't') out += '\t';
          else if(e === 'b') out += '\b'; else if(e === 'f') out += '\f';
          else if(e >= '0' && e <= '7'){
            let o = e;
            while(o.length < 3 && s[i] >= '0' && s[i] <= '7'){ o += s[i]; i++; }
            out += String.fromCharCode(parseInt(o, 8) & 255);
          }
          else if(e === '\r'){ if(s[i] === '\n') i++; }
          else if(e === '\n'){ /* satır devamı */ }
          else if(e !== undefined) out += e;
          continue;
        }
        if(ch === '('){ der++; }
        else if(ch === ')'){ der--; if(der === 0){ i++; break; } }
        out += ch; i++;
      }
      koy({t:'str', v:out}, bas);
      continue;
    }
    if(c === 60){
      if(s[i + 1] === '<'){ kaplar.push({t:'dict', v:[], bas}); i += 2; continue; }
      let j = s.indexOf('>', i);
      if(j < 0) j = n;
      let hex = s.slice(i + 1, j).replace(/[^0-9a-fA-F]/g, '');
      if(hex.length % 2) hex += '0';
      let out = '';
      for(let k=0;k<hex.length;k+=2) out += String.fromCharCode(parseInt(hex.substr(k, 2), 16));
      i = j + 1;
      koy({t:'str', v:out}, bas);
      continue;
    }
    if(c === 62){
      if(s[i + 1] === '>' && kaplar.length && kaplar[kaplar.length - 1].t === 'dict'){
        const k = kaplar.pop(); i += 2; koy(k, k.bas);
      } else i++;
      continue;
    }
    if(c === 91){ kaplar.push({t:'arr', v:[], bas}); i++; continue; }
    if(c === 93){
      if(kaplar.length && kaplar[kaplar.length - 1].t === 'arr'){ const k = kaplar.pop(); i++; koy(k, k.bas); }
      else i++;
      continue;
    }
    if(c === 123 || c === 125 || c === 41){ i++; continue; }
    if(c === 47){                       // /isim
      i++;
      let ad = '';
      while(i < n && !BOS(s.charCodeAt(i)) && !AYR(s.charCodeAt(i))){ ad += s[i]; i++; }
      koy({t:'name', v:ad.replace(/#([0-9a-fA-F]{2})/g, (_, h)=> String.fromCharCode(parseInt(h, 16)))}, bas);
      continue;
    }
    let k = i;
    while(k < n && !BOS(s.charCodeAt(k)) && !AYR(s.charCodeAt(k))) k++;
    const kelime = s.slice(i, k);
    i = k;
    if(/^[+-]?(\d+\.?\d*|\.\d+)$/.test(kelime)){ koy({t:'num', v:parseFloat(kelime)}, bas); continue; }
    if(kaplar.length || kelime === 'true' || kelime === 'false' || kelime === 'null'){ koy({t:'kw', v:kelime}, bas); continue; }
    if(!kelime){ i++; continue; }
    if(kelime === 'BI'){
      // Satır içi resim: ID ile EI arasındaki ikili veri atlanır
      let j = s.indexOf('ID', i);
      if(j < 0){ i = n; break; }
      let e = s.indexOf('EI', j + 3);
      while(e >= 0 && !(BOS(s.charCodeAt(e - 1)) && (e + 2 >= n || BOS(s.charCodeAt(e + 2)) || AYR(s.charCodeAt(e + 2))))) e = s.indexOf('EI', e + 1);
      i = e < 0 ? n : e + 2;
      islemler.push({op:'BI', args:[], bas, son:i});
      args = []; argBas = -1;
      continue;
    }
    islemler.push({op:kelime, args, bas: argBas >= 0 ? argBas : bas, son:i});
    args = []; argBas = -1;
  }
  return islemler;
}

const KUR = {birlestir:kurBirlestir, ayir:kurAyir, duzenle:kurDuzenle, sayfalar:kurSayfalar, dondur:kurSayfalar,
             jpg2pdf:kurJpg2pdf, pdf2jpg:kurPdf2jpg, numara:kurNumara, filigran:kurFiligran};

// ---------- Dışa açılan ----------
window.Duzenleyici = {
  ac(kap){
    if(!document.getElementById('dzStil')){
      const st = document.createElement('style');
      st.id = 'dzStil';
      st.textContent = STIL;
      document.head.appendChild(st);
    }
    if(kok !== kap){ kok = kap; anaEkran(); }
    else if(!aktif) anaEkran();
  },
  ana: ()=> anaEkran(),
  _test: {metinSil, icerikCoz, araliklariCoz}
};
})();
