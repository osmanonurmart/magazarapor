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

`m583` ilk girişte eski `onur` profilinin verisini kendi altına kopyalar
(kaynak silinmez).

Arka plan fotoğrafı için depoya `giris-arka.jpg` eklenebilir; yoksa düz
bej zemin görünür.

## Dosyalar

| Dosya | İş |
|---|---|
| `rapor.html` | Uygulamanın tamamı (HTML, CSS, JS tek dosyada) |
| `firestore.rules` | Güvenlik kuralları |
