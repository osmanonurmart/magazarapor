# Mağaza Performans Takip — v2 (yerel sürüm)

`rapor.html` (v1) çalışmaya devam ediyor; bu klasör ona hiç dokunmaz.
Bu sürüm proje tanımındaki ekranların çalışan bir karşılığıdır ve şimdilik
**tarayıcının kendi hafızasında** çalışır — Firebase bağlantısı yoktur.

## Çalıştırma

### En kolay yol — tek dosya

`tek-dosya.html` dosyasını indir ve **çift tıkla**. Kurulum, sunucu, hiçbir şey
gerekmez; her şey o dosyanın içinde. PWA olarak kurulamaz (bunun için aşağıdaki
yol gerekir), gerisi aynı.

### Geliştirirken — yerel sunucu

```bash
cd v2
python3 -m http.server 8900
```

Sonra tarayıcıda `http://localhost:8900`. Kaynak dosyalar bölünmüş halde
çalışır, PWA ve service worker da bu yolda devreye girer.

`index.html`'e doğrudan çift tıklamak **çalışmaz** — tarayıcı `file://`
üzerinden modül dosyalarını okumaz. Onun yerine `tek-dosya.html` kullan.

### Tek dosyayı yeniden üretme

Kaynak dosyalarda değişiklik yaptıktan sonra:

```bash
cd v2
npm i -D esbuild        # yalnızca ilk sefer
node olustur.mjs
```

## Örnek veri ve şifreler

İlk açılışta 20 mağaza, bölge müdürü ve kurucu profili ile yaklaşık 8 haftalık
örnek veri üretilir. **Bütün profillerin şifresi `1234`** (kurucu panelinden
değiştirilebilir). Profil rozeti → "Örnek veriyi yenile" ile sıfırlanır.

## Neler var

| Bölüm | Durum |
|---|---|
| Netflix tarzı profil seçimi, şifre, cihazda hatırlama | ✅ |
| Haftalık tablo: 9 sütun, 8 KPI satırı, formül sütunu | ✅ |
| Seçilen hafta + bir önceki hafta birlikte | ✅ |
| Ay / hafta / yıl gezinme, ay sınırını aşan haftalar | ✅ |
| Gün başlığında izin seçimi, izin türü, personel düzenleme | ✅ |
| Simüle tarihi (geçmiş güne yazma dahil) | ✅ |
| Sağ panel: esnek kartlar, günlük yorum, ay içi ve ay toplamı kıyası | ✅ |
| Yapıştır / Veri Ekle — yer imi çıktısını çözümleme | ✅ (tolerant) |
| Haftalık ürün verisi, geçen haftaya göre pay değişimi, otomatik rapor | ✅ |
| Bölge paneli: özet tablo, metrik seçimi, hedef girişi (elle/yapıştır/kural) | ✅ |
| Duyuru panosu | ✅ |
| Ürün talep sistemi: kategori, sepet, gönderim, pazartesi raporu | ✅ |
| Kurucu: mağaza görünümü, ürün/kategori, kullanıcılar, KPI satırları, etiketler | ✅ |
| Mobil yerleşim (üst gezinme / orta tablo / alt kartlar) | ✅ |
| PWA (manifest + service worker, çevrimdışı kabuk) | ✅ |

## Henüz yok

- **Firebase.** Veri `localStorage`'da; başka cihazda görünmez. Bağlanırken
  yalnızca `js/veri.js` içindeki oku/yaz fonksiyonlarının gövdesi değişecek,
  çağıran kod aynı kalacak.
- **Bildirimler.** Duyuru ekranda görünüyor ama telefona bildirim gitmiyor;
  bunun için Firebase Cloud Messaging gerekiyor.
- **Araçlar sayfası.** v1'deki araç kutuları henüz taşınmadı.
- **Etiket eşleşmesi.** Kurucu panelinden etiket tanımlanıyor, ama ürün
  satırlarından kartlara otomatik aktarma kaynak site biçimi netleşince
  bağlanacak.
- **Talep onay/ret.** Tanımda açık bırakılmıştı, eklenmedi.

## Kararı sana bırakılan yerler

- **FBS formül sütunu.** Tanımda boş bırakılmıştı; şimdilik haftalık ortalama
  gösteriyor.
- **İki hafta sırası.** Tanımın metninde "üstte bir önceki hafta durur" yazıyor,
  ekran şemasında ise seçilen hafta üstte. Şemayı esas aldım.
- **Yarım hafta kıyası.** Devam eden hafta, geçen haftanın tamamıyla değil, aynı
  sayıdaki ilk günüyle kıyaslanıyor; formül hücresinde "(ilk 3 gün)" diye yazıyor.

## Dosya düzeni

```
v2/
  index.html            uygulama kabuğu
  manifest.webmanifest  PWA tanımı
  sw.js                 service worker (önce ağ, olmazsa önbellek)
  css/app.css           tek stil dosyası
  js/
    app.js              giriş, üst çubuk, sayfa yönlendirme
    veri.js             veri katmanı + örnek veri üretimi
    util.js             tarih, hafta, sayı biçimleme
    hafta.js            haftalık KPI tablosu ve formül sütunu
    panel.js            sağ panel (kartlar, yorum, kıyaslar)
    magaza.js           mağaza müdürü ekranı, yapıştır, personel, ürün verisi
    bolge.js            bölge müdürü paneli
    kurucu.js           kurucu paneli
    talep.js            ürün talep sistemi
    yapistir.js         pano verisini çözümleme
    pencere.js          kalıcı pencere (modal)
```
