# Mağaza Raporu

Akşam yazılan MC raporu için tek dosyalık mağaza takip uygulaması:
`rapor.html`.

**Canlı:** https://osmanonurmart.github.io/magazarapor/rapor.html

Veri Firebase'de (Firestore) durur. Herkes aynı ekrandan kullanıcı adı ve
şifreyle girer (Firebase Authentication, e-posta/şifre).

## Kullanıcı ekleme

1. Firebase Console → Authentication → Users → Add user:
   e-posta `kullaniciadi@mcrapor.app`, şifre istediğiniz gibi.
   Ekranda yalnızca `kullaniciadi` yazılır.
2. Firestore → `yetkiler` koleksiyonu → belge kimliği kullanıcı adı (küçük harf):
   - mağaza: `{ rol: "magaza" }` — `stores/{kullaniciadi}` verisini görür
   - bölge müdürü: `{ rol: "bolge", magazalar: ["m583", ...] }` — girişte
     bölge paneli açılır; listeyi panelin "Mağazalarım" sekmesinden kendisi değiştirir
   - isteğe bağlı `ad` alanı (ör. `"Kadıköy"`) panelde kodun yerine görünür

Araçlar (tüm mağazalarda aynı) `rapor.html` içindeki `ARACLAR` listesinde,
Kurumsal hafıza bölümleri `KURUMSAL_HAFIZA` listesinde kodla tanımlanır;
arayüzden eklenmez. Mağaza not defteri mağazaya özeldir.

`m583` ilk girişte eski `onur` profilinin verisini kendi altına kopyalar
(kaynak silinmez).

Giriş ekranının arka plan fotoğrafı `giris-arka.jpg`.

## Dosyalar

| Dosya | İş |
|---|---|
| `rapor.html` | Uygulamanın tamamı (HTML, CSS, JS tek dosyada) |
| `firestore.rules` | Güvenlik kuralları |

## Yenilikler (güncelleme notları)

- `SURUM_NOTLARI` (rapor.html) — her güncellemede en üste `{surum, tarih, kartlar:[{ikon, baslik, metin, gorseller, rol?}]}` eklenir; ekran görüntüleri `guncelleme/` klasöründe. Yeni sürüm ilk açılınca görülmemiş notlar bir kez pencere olarak çıkar (`localStorage.mr_surumGoruldu`), hepsi Sohbet → Duyurular'ın altında listelenir.

## Bölge paneli

- Dönem: Bugün / Son 1 hafta / Bu ay (varsayılan) / Geçen ay aynı dönem / Özel (`bp.secim`, `bp.ozelBas`, `bp.ozelSon`); `bpAraligi()` aralığı ve kıyas dönemini verir.
- Günlük ciro tablosu (`bpGrafikCiz`): mağaza başına gün gün ciro, Gün %, Küm. %, yeşil renk skalası; altta toplam, dönem hedefi ve hedefe kalan.

## Hedef kırılımı

- Üstteki "🎯 Hedef gir" (telefonda profil menüsünde; bölge panelinde mağaza seçilerek): Excel'den ayın günlük hedef satırı yapıştırılır, her gün `stores/{m}/entries/{YYYY-MM-DD}.hedef` olarak yazılır (son güncelleyen bilgisi değişmez). Geri al hepsini eski haline getirir.
- Sağ paneldeki günlük hedef, günün `hedef` alanı varsa onu kullanır.

## Transfer

- Telefondan en fazla 5 fotoğraf gönderilir. Uygulama içi kamerada art arda çekilir, deklanşörün yanındaki Gönder ile gönderilir; şeritteki küçük resme dokununca o fotoğraf silinir.
- Fotoğraflar en uzun kenar 3200 px, JPEG %88. 1 MB belge sınırı yüzünden parçalanır: `transferFotos/{id}_{sira}` ilk parça, `{id}_{sira}_{p}` sonrakiler; parça sayıları `transfers/{id}.parcalar`.
- Bilgisayarda İndir: seçilen ana klasörün içine numaralı klasör (`12/1.jpg … 5.jpg`), klasöre yazılamayan tarayıcıda `12.zip`. Son numara `stores/{m}/settings/transfer.klasorSayac`; kayda `indirildi`, `klasorNo`, `indirildiMs` yazılır. İndirilen kayıt 7 gün sonra (uygulamayı açan ilk cihazda) fotoğraflarıyla birlikte silinir.

## Araçlar · Bekleyen deposu ve Kırık tutanağı

- "Bekleyen deposu": Excel yüklenince eşleşmeler `stores/{m}/irsaliyeler/{1-6}` altına kaydedilir ve Outlook'ta taslak olarak açılan `bekleyen deposu hk.eml` iner. İmza `stores/{m}/settings/mail.imza`.
- "Kırık tutanağı": EBA formu kopyalanıp yapıştırılır, tutanak yazdırılır (depo / tarih irsaliyelerden doldurulur).

## Düzenleyici (PDF araçları)

- Sekme açılınca `duzenleyici/duzenleyici.js` yüklenir; her şey tarayıcıda çalışır, dosya bir yere gönderilmez.
- Araçlar: Birleştir, Ayır, Düzenle (metin değiştirme, yazı/resim/imza/beyaz kutu), İmzala, Sayfaları düzenle, Döndür, Resimden PDF, PDF'ten resme, Sayfa numarası, Filigran.
- Metin düzenlemede eski yazı içerik akışından silinir (`metinSil`); silinemezse üstü zemin rengiyle kapatılır ve kullanıcıya söylenir. Yeni yazı Liberation Sans/Serif ile yazılır.
- Kütüphaneler `duzenleyici/lib`, fontlar `duzenleyici/fontlar` altında (lisanslar: `lib/OKUBENI.txt`, `fontlar/OFL.txt`).

## Sohbet

- Menüdeki "Sohbet" (eski Öneri) uygulama içi mesajlaşmadır. Konuşmalar iki kişiliktir: mağaza ↔ kurucu (m583), mağaza ↔ bölge müdürü, bölge müdürü ↔ kurucu.
- `sohbetler/{a__b}` (üyeler sıralı) ve altında `mesajlar`. Okundu bilgisi `okunma.{kadi}` alanında.
- Eski `geribildirim` kayıtları kurucu Sohbet'i ilk açtığında konuşmalara taşınır (`tasindi: true`).
- Kurallar `firestore.rules` içinde; değiştikten sonra Firebase Console → Firestore → Rules'a yapıştırılıp yayınlanmalı.

## Kullanıcılar (kurucu)

- M583 profil menüsü → 👥 Kullanıcılar: yeni hesap ikinci bir Firebase uygulamasıyla açılır (kurucunun oturumu kapanmaz), ardından `yetkiler/{kadi}` yazılır.
- Düzenle: rol, görünen ad, bölge müdürünün mağazaları. Erişimi kapat: yetki belgesi silinir (veriler kalır).
- Hesap silme ve başkasının şifresini sıfırlama tarayıcıdan yapılamaz; Firebase Console'dan yapılır.
