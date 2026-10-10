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

## Transfer · Kırık

- Telefonda: irsaliye 1-4 yazılır, 1-6 / depo / tarih otomatik bulunur. Fotoğraflar: Kutu 1–4, Kırık, Tutanak (imzalı).
- Bilgisayarda "Bekleyen deposu Excel'i yükle": eşleşmeler `stores/{m}/irsaliyeler/{1-6}` altına kaydedilir ve Outlook'ta taslak olarak açılan `bekleyen deposu hk.eml` iner. İmza `stores/{m}/settings/mail.imza` (Mail imzası butonu).
- "Kırık tutanağı": EBA formu kopyalanıp yapıştırılır, tutanak yazdırılır.
- İnen klasörler: `37 · 06.10.2026 · 1-S-6-…` içinde `kutu-1..4.jpg`, `kirik.jpg`, `tutanak.jpg`. Kartlarda "EBA'ya işlendi" işareti.

## Düzenleyici (PDF araçları)

- Sekme açılınca `duzenleyici/duzenleyici.js` yüklenir; her şey tarayıcıda çalışır, dosya bir yere gönderilmez.
- Araçlar: Birleştir, Ayır, Düzenle (metin değiştirme, yazı/resim/imza/beyaz kutu), İmzala, Sayfaları düzenle, Döndür, Resimden PDF, PDF'ten resme, Sayfa numarası, Filigran.
- Metin düzenlemede eski yazı içerik akışından silinir (`metinSil`); silinemezse üstü zemin rengiyle kapatılır ve kullanıcıya söylenir. Yeni yazı Liberation Sans/Serif ile yazılır.
- Kütüphaneler `duzenleyici/lib`, fontlar `duzenleyici/fontlar` altında (lisanslar: `lib/OKUBENI.txt`, `fontlar/OFL.txt`).
