---
trigger: always_on
---

---
trigger: always_on
---

SOLID
---
trigger: always_on
---

# ZazaLingo SOLID Compliance Rule

ZazaLingo projesi v7.5 itibariyle tam SOLID uyumluluğuna geçmiştir. Her geliştirici ve yapay zeka ajanı şu kurallara uymakla yükümlüdür:

1. **SRP (Single Responsibility):**
   - Bir hook veya bileşen asla birden fazla iş yapmamalıdır.
   - Geometri hesaplamaları, State yönetimi ve Navigasyon her zaman ayrı hook'larda olmalıdır.

2. **OCP (Open/Closed):**
   - Yeni özellikler (örn. yeni soru tipi, yeni harita dekorasyonu) eklerken mevcut logic dosyaları (switch/case yapıları) değiştirilmemelidir.
   - Her zaman bir **Registry** deseni kullanılmalıdır.

3. **ISP (Interface Segregation):**
   - Bileşenler asla devasa `AppTheme` arayüzüne bağımlı olmamalıdır.
   - Her bileşen sadece kendi domaini için tanımlanmış daraltılmış interface'leri (`MapTheme`, `QuestionTheme` vb.) kullanmalıdır.

4. **DIP (Dependency Inversion):**
   - Düşük seviyeli araçlar (fs, path, sync) doğrudan yüksek seviyeli manager'lar içinde kullanılmamalıdır.
   - Her zaman bir **Adapter** katmanı üzerinden bağımlılık enjekte edilmelidir.

5. **Type Safety:**
   - Kod tabanında `any` kullanımı kesinlikle yasaktır.
   - Tip zorlamaları (`as unknown as...`) sadece infrastructure katmanında çok zorunlu hallerde kullanılabilir; uygulama mantığında yasaktır.

> [!IMPORTANT]
> Bu kurallara uymayan kodlar "çalışıyor olsa bile" mimari hata olarak kabul edilir ve reddedilir.