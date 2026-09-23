# Kurulum — e-posta/şifre girişine geçiş

Sıra önemli. Kuralları en sona bırakıyoruz, yoksa uygulama sen giriş yapamadan kilitlenir.

## 1. Firebase'de e-posta/şifre girişini aç

Firebase Console → **Authentication** → **Sign-in method** sekmesi
→ **Email/Password** → Enable → Save.

**Anonymous**'u şimdilik açık bırak. En sonda kapatacağız.

## 2. Kendi hesabını oluştur

Authentication → **Users** sekmesi → **Add user**

- E-posta: `osmanonurmrt@gmail.com`
- Şifre: kendi belirlediğin şifre

Bu adres uygulamada ve güvenlik kurallarında yönetici olarak tanımlı.
Değiştirmek istersen iki yerde geçiyor:

- `rapor.html` içinde `YONETICI_EPOSTALARI`
- `firestore.rules` içinde `request.auth.token.email in [...]`

## 3. Yeni sürümü yayına al

Bu adımdan sonra uygulama giriş ekranıyla açılır. 1. ve 2. adım bitmeden
yapma, yoksa giriş yapamazsın.

## 4. Gir ve kontrol et

Linki aç, e-posta ve şifrenle gir. Eski verilerin mağazanın altına taşınır,
"Eski veriler bu mağazaya taşınıyor" yazar. Rapor ekranı açıldığında
sayıların yerinde olduğunu kontrol et.

## 5. Mağazaları oluştur

Üstteki mağaza rozetine tıkla → **Mağazaları yönet**.

Tek tek eklemek için **+ Yeni mağaza**. 22 mağaza için **⇪ Toplu ekle** daha
hızlı; her satıra şu biçimde yaz:

```
Mağaza 2367 ; m2367@ornek.com ; Gecici1234
Mağaza 2410 ; m2410@ornek.com ; Gecici1234
```

Her satır için hem mağaza hem de kullanıcı hesabı açılır. Şifre en az 6
karakter olmalı. Mağaza sahipleri ilk girişten sonra "Şifremi unuttum" ile
kendi şifrelerini belirleyebilir.

## 6. Güvenlik kurallarını yükle

Firebase Console → **Firestore Database** → **Rules** sekmesi.
Bu depodaki `firestore.rules` dosyasının içeriğini olduğu gibi yapıştır →
**Publish**.

Bu andan sonra giriş yapmamış hiç kimse veriye ulaşamaz.

## 7. Anonim girişi kapat

Authentication → Sign-in method → **Anonymous** → Disable.

Bitti. Linki bilen biri sayfayı açabilir ama giriş yapmadan hiçbir veri göremez.

---

## Kimin neye erişimi var

| | Yönetici | Mağaza kullanıcısı |
|---|---|---|
| Kendi mağazasının verisi | ✅ | ✅ |
| Diğer mağazaların verisi | ✅ | ❌ |
| Mağaza ekleme / silme | ✅ | ❌ |
| Kullanıcı hesabı açma | ✅ | ❌ |
| Kendi mağazasının ayarları (ad, simge, izinli listesi) | ✅ | ✅ |

## Yapamadığımız tek şey

Kullanıcı hesabını uygulama içinden **silmek** sunucu tarafı gerektiriyor ve
ücretli plana giriyor. Mağazayı silince verisi gidiyor ve kullanıcının mağaza
bağlantısı kopuyor; hesabın kendisini Firebase Console → Authentication →
Users'tan silersin.
