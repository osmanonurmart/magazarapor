# Notlar — hatalar, riskler, yapılabilecekler

Bu dosya v2 için tutulan açık liste. Yapıldıkça satırlar silinir.

---

## 1. Bulunup düzeltilen hatalar

| # | Hata | Durum |
|---|---|---|
| 1.1 | Türkçe binlik ayıracı yanlış okunuyordu: `98.000` → `98`. Tablodaki bir hücreye tekrar girilince değer bine bölünüyordu. | ✅ düzeltildi |
| 1.2 | Devam eden yarım hafta, geçen haftanın tamamıyla kıyaslanıyordu. Bölge özetinde 20 mağazanın hepsi "%60 düştü" görünüyordu. Artık aynı sayıdaki ilk günle kıyaslanıyor. | ✅ düzeltildi |
| 1.3 | Haftalık tablodaki ciro formülü de aynı sorundaydı; artık "(ilk 3 gün)" diye belirtiyor. | ✅ düzeltildi |

## 2. Bilinen açık hatalar

| # | Hata | Etki | Zorluk |
|---|---|---|---|
| 2.1 | Kurucu veya bölge müdürü mağaza seçmeden "Mağaza Ekranı"na basarsa listedeki **ilk mağazanın** verisi açılıyor, ama üstteki rozet hâlâ "Kurucu" yazıyor. Kimin verisine bakıldığı belli olmuyor. | Yüksek — yanlış mağazaya veri girilebilir | Düşük |
| 2.2 | Aynı uygulamayı iki sekmede açarsan biri diğerinin yazdığını görmez; son kapatan üzerine yazar. `storage` olayı dinlenmiyor. | Orta | Düşük |
| 2.3 | Simüle tarihi sayfa yenilenince sıfırlanıyor. Kullanıcı geçmiş güne veri girerken sayfayı yenilerse farkında olmadan bugüne yazmaya başlar. | Orta | Düşük |
| 2.4 | Sağ paneldeki elle girilen kartlara (Halı satışı vb.) **yalnızca bugün** değer yazılabiliyor. Geçmiş bir günün kart değeri düzeltilemiyor. | Orta | Orta |
| 2.5 | Bölge panelinde mağazaya tıklayıp detaya inince geri dönmek için üstteki "Özet"e basmak gerekiyor; ekranda geri butonu yok. | Düşük | Düşük |
| 2.6 | Kategori silinince o kategorideki ürünlerin id'leri boşta kalıyor. Eski taleplerde ürün **adı** saklandığı için görüntü bozulmuyor, ama id kırık. | Düşük | Düşük |
| 2.7 | Hafta hedefi kutusu ham sayı gösteriyor (`265000`), tablodaki diğer sayılar biçimli (`265.000`). | Kozmetik | Düşük |
| 2.8 | `bolgeGorunum.kiyas` ayarı veride duruyor ama hiçbir yerde kullanılmıyor — ölü alan. Tanımdaki "Kıyas: Dün vs Bugün ▾" seçimi yapılmadı. | Düşük | Orta |

## 3. Veri kaybı riskleri — en kritik başlık

| # | Risk | Açıklama |
|---|---|---|
| 3.1 | **Veri yalnızca tarayıcıda.** Tarayıcı verisi temizlenirse, gizli sekmede açılırsa veya başka cihaza geçilirse her şey gider. | Firebase'e geçilene kadar gerçek kullanıma açılmamalı |
| 3.2 | **Yedek / dışa aktarım yok.** v1'de JSON + Excel yedeği vardı, v2'de henüz yok. | Firebase'den önce bile eklenmeli |
| 3.3 | **localStorage ~5 MB.** 20 mağaza × birkaç yıl veri bu sınırı zorlar; dolunca yazma sessizce başarısız olur. | Firebase bunu çözer |
| 3.4 | **Geri al (undo) yok.** v1'de vardı. Yanlış yapıştırılan veri geri alınamıyor. | Orta zorluk |
| 3.5 | **Profil şifreleri düz metin** olarak tarayıcıda duruyor. Yerel prototip için sorun değil, yayına çıkarsa değil. | Firebase Authentication çözer |

## 4. Veri doğrulama eksikleri

- MDO'ya `%150`, ciroya negatif sayı girilebiliyor; hiçbir uyarı yok.
- FBÜ'ye `3000` yazılabiliyor (makul aralık 2–10).
- Hedef `0` girilirse oran hesabı boş dönüyor, uyarı yok.
- Yapıştırılan veride aynı alan iki kez geçerse **ilki** alınıyor; hangisinin doğru olduğu sorulmuyor.
- Aynı güne ikinci kez yapıştırma yapılırsa eski değerlerin üzerine sessizce yazılıyor; öncesi/sonrası gösterilmiyor.

## 5. Tanımda olup henüz yapılmayanlar

| # | Madde | Not |
|---|---|---|
| 5.1 | **Firebase** (Authentication + veritabanı) | `js/veri.js` bunun için ayrı tutuldu; yalnızca o dosyanın içi değişecek |
| 5.2 | **Bildirimler** — veri girişi hatırlatması, pazartesi talep hatırlatması, duyuru bildirimi | Firebase Cloud Messaging gerekiyor |
| 5.3 | **Araçlar sayfası** | v1'deki araç kutuları taşınmadı |
| 5.4 | **Etiket → kart otomatik doldurma** | Etiket tanımlanıyor ama ürün satırlarından karta aktarma bağlı değil; kaynak site biçimi netleşince yapılabilir |
| 5.5 | **Talep onay/ret** | Tanımda açık bırakılmıştı |
| 5.6 | **Günlük ve aylık hedef** | Şu an yalnızca haftalık hedef var |
| 5.7 | **Bölge tablosunda sıralama seçimi** (`Sıra ⇅`) | Şu an sabit: ciro değişimine göre |
| 5.8 | **Kurucu panelinin bölge panelinden farkı** | Tanımda açık bırakılmıştı |
| 5.9 | **FBS formül sütunu** | Şimdilik haftalık ortalama; karar senin |
| 5.10 | **Mobil alt bölümün kesin içeriği** | Şimdilik kartlar + yorum + duyuru |

## 6. Geliştirme önerileri — öncelik sırasıyla

### Yüksek değer, düşük maliyet
1. **Akşam mesajı üreteci.** v1'in en çok kullanılan özelliğiydi: günün verisinden Türkçe metin üretip panoya kopyalıyordu. v2'de yok. Bölge müdürüne gönderilen mesaj bununla saniyeler sürüyordu.
2. **Yedek al / geri yükle.** JSON dışa aktarım + içe aktarım. Firebase gelene kadarki tek güvenlik ağı.
3. **Geri al (undo).** Özellikle yapıştırma sonrası.
4. **Klavyeyle tablo gezinme.** Ok tuşları ve Tab ile hücreler arası geçiş; veri girişini belirgin hızlandırır.
5. **Rapor fotoğrafı.** Haftalık tablonun PNG'si — WhatsApp'a atmak için. v1'de vardı.
6. **Mağaza seçili değilken uyarı** (madde 2.1'in çözümü).

### Orta
7. **Gerçek `.xlsx` yükleme.** Şu an kopyala-yapıştır; SheetJS ile dosya sürükle-bırak yapılabilir.
8. **Ciro trendi grafiği.** Her mağaza için son 10 haftanın küçük çizgi grafiği; bölge tablosunda satır sonunda sparkline.
9. **Mağaza karşılaştırma ekranı.** İki mağazayı yan yana koyup aynı metrikleri kıyaslama.
10. **Değişiklik kaydı.** Kim, ne zaman, hangi alanı değiştirdi. Rol ayrımı gelince değeri artar.
11. **Hedef hafta içi / hafta sonu ağırlığı.** Şu an haftalık hedef yediye bölünüyor; cumartesi ile salı aynı hedefi alıyor, oran yanıltıcı çıkıyor.
12. **İzin türleri düzenlenebilir olsun.** Şu an kodda sabit.
13. **Arama ve filtre.** Bölge tablosunda mağaza arama, "hedefin altındakiler" filtresi.

### Düşük / ileride
14. Karanlık tema.
15. Yazdırma / PDF çıktısı.
16. Erişilebilirlik: form alanlarına `label`, klavye odak sırası, ekran okuyucu etiketleri.
17. Çevrimdışı veri girişi + bağlantı gelince senkron (Firebase'den sonra anlamlı).
18. Mağaza bazlı hedef geçmişi grafiği.

## 7. Firebase'e geçerken dikkat edilecekler

- `js/veri.js` şu an **senkron** çalışıyor (`oku`/`yaz`). Firebase asenkron. Her çağrıyı `await` yapmak yerine v1'deki yöntem daha uygun: açılışta bir kez bellek önbelleğine yükle, ekranı ondan çiz, yazmaları arka planda gönder. Böylece çağıran kodun hiçbiri değişmez.
- Koleksiyon düzeni: `stores/{magaza}/gunler/{tarih}`, `stores/{magaza}/hedefler/{hafta}`, ortak `talepler`, `duyurular`, `kategoriler`, `kullanicilar`.
- Güvenlik kuralları rol bazlı olmalı: mağaza müdürü yalnızca kendi mağazası; bölge müdürü hepsini okur, hedef ve duyuru yazar; kurucu tam yetki.
- Talepler ve duyurular ortak koleksiyonda; mağaza müdürü kendi talebini yazabilmeli ama başkasınınkini okuyamamalı.
- `onSnapshot` ile canlı dinleme kurulursa madde 2.2 (iki sekme sorunu) kendiliğinden çözülür.
