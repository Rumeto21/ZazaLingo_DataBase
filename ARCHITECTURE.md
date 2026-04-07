# ZazaLingo Data_Base - Mimari Dökümantasyonu

Bu döküman, ZazaLingo ekosisteminin veri yönetim merkezi olan **Data_Base** backend servisinin teknik mimarisini, veri güvenliği protokollerini ve senkronizasyon mantığını detaylandırmaktadır.

## 1. Genel Bakış (Overview)
Data_Base, ZazaLingo uygulaması (Mobile/Web) ve Geliştirici Uygulaması (DevApp) arasında köprü görevi gören, verilerin kalıcı olarak saklandığı ve merkezi olarak yönetildiği bir Node.js servisidir.

**Temel Sorumluluklar:**
- Editörden gelen JSON verilerini TypeScript (`.ts`) dosyalarına enjekte etmek.
- Verilerin anlık olarak mobil uygulama diziniyle senkronize edilmesini sağlamak.
- Medya varlıklarını (Resim, Ses) yönetmek ve servis etmek.
- Veri bütünlüğünü korumak için otomatik yedekleme ve "Safe-Write" mekanizmalarını işletmek.

---

## 2. Teknoloji Yığını (Tech Stack)
- **Runtime:** Node.js
- **Network:** Native `http` modülü (Hafif ve hızlı bir Express alternatifi)
- **File System:** `fs` & `path` (Doğrudan disk erişimi)
- **Security:** X-API-KEY & Bearer Token Authentication
- **Scripting:** Python (Veri düzeltme ve tarama yardımcıları için)

---

## 3. Çekirdek Mekanizmalar

### 3.1 Demirbaş Veri Güvenliği (Ironclad Safe-Write)
Veri kaybını önlemek için `database-server.js` içerisinde gelişmiş bir kayıt sistemi mevcuttur:
1.  **Backup:** Dosya güncellenmeden önce `backups/` klasörüne zaman damgalı bir kopya oluşturulur.
2.  **Atomic Write:** Veri önce `.tmp` uzantılı geçici bir dosyaya yazılır. Yazma başarılıysa orijinal dosya ile yer değiştirilir (`renameSync`).
3.  **TS Hijacking:** JSON verileri, TypeScript dosyalarındaki `export const X = ...` tanımını bozmadan ilgili değişkene enjekte edilir.

### 3.2 Çoklu Hedef Senkronizasyonu (Sync Logic)
Data_Base'e kaydedilen herhangi bir veri, eşzamanlı olarak iki farklı konuma yazılır:
- **Merkezi Depo:** `Data_Base/data/` (Arşiv ve ana kaynak)
- **Mobil Uygulama Deposu:** `ZazaLingo/data/` (Üretim ortamı için anlık güncelleme)

---

## 4. Veri Modelleme ve Eşleme (Mapping)

### 4.1 Tema Ayrıştırma (`THEME_MAPPING`)
Büyük bir tema JSON dosyası, mobil uygulamanın performanslı çalışması için parçalanarak ilgili token dosyalarına dağıtılır:
- `tokens/colors.ts`
- `tokens/spacing.ts`
- `tokens/typography.ts`
- `components/questions.ts`, `settings.ts`, vb.

### 4.2 Eğitim İçeriği (Curriculum) Hiyerarşisi
Testler, disk üzerinde hiyerarşik bir klasör yapısında saklanır:
`data/curriculum/Unite_[X]/[Konu_Adi]/[test_id].ts`

---

## 5. API Uç Noktaları (Endpoints)

| Metot | Uç Nokta | Açıklama |
| :--- | :--- | :--- |
| **GET** | `/data` | Tüm verileri (Map, Theme, Locales, Settings) paket halinde döndürür. |
| **POST** | `/save` | Gelen verileri ilgili `.ts` dosyalarına enjekte eder ve senkronize eder. |
| **POST** | `/upload` | Resim ve ses dosyalarını `assets/` klasörüne kaydeder. |
| **POST** | `/login` | Kullanıcı kimlik doğrulaması yapar ve oturum (session) oluşturur. |
| **GET** | `/assets` | Kayıtlı tüm medya varlıklarının listesini döndürür. |

---

## 6. Klasör Yapısı (Directory Structure)
```text
Data_Base/
├── data/            # Ana veri deposu (JSON/TS)
│   ├── backups/     # Otomatik oluşturulan yedekler
│   ├── curriculum/  # Test içerikleri
│   ├── locales/     # Dil dosyaları (tr, en, zzk, krmnc)
│   └── theme/       # Tema konfigürasyonları
├── assets/          # Medya dosyaları (Audio, Pictures)
├── types/           # Paylaşılan TS tanımlamaları
└── database-server.js # Ana servis mantığı
```

---

## 7. Güvenlik
- **API Key:** `x-api-key` başlığı ile sınırlı erişim.
- **Path Traversal:** Dosya yüklemelerinde `path.basename` kullanılarak dizin dışına çıkılması engellenir.
- **CORS:** Güvenli geliştirme için sadece belirli kökenlere (localhost:5173 vb.) izin verilir.

---
> **Not:** Bu backend servisi "Stateful" bir yapıdadır; veriyi doğrudan dosya sisteminde tutarak veritabanı bağımlılığını ortadan kaldırır.
