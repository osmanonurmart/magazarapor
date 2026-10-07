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

Ortak araçları (Araçlar sekmesi, tüm mağazalarda aynı) bölge müdürü ve
yetki belgesinde `yonetici: true` (boolean) olan kullanıcı düzenler.
Kurumsal hafıza bölümlerinin içeriği `rapor.html` içindeki
`KURUMSAL_HAFIZA` listesinde durur; mağaza not defteri mağazaya özeldir.

`m583` ilk girişte eski `onur` profilinin verisini kendi altına kopyalar
(kaynak silinmez).

Giriş ekranının arka plan fotoğrafı `giris-arka.jpg`.

## Dosyalar

| Dosya | İş |
|---|---|
| `rapor.html` | Uygulamanın tamamı (HTML, CSS, JS tek dosyada) |
| `firestore.rules` | Güvenlik kuralları |
