# DataBase Tester Board

## Active Task: [SEAL-SETTINGS-LOCALIZATION-FINAL] - Global Validation & Mirror Parity
- **Assigned By:** TeamLeader (Antigravity)
- **Status:** [x] TESTED - PASSED
- **Priority:** CRITICAL

### 🎯 Objective:
Lokalizasyon sistemindeki tüm kritik hatalar (mojibake, eksik anahtarlar, senkronizasyon kopukluğu) giderildi. Sistemin %100 hatasız olduğunu ve projeler arası tam uyumu doğrulamalısınız.

### ✅ Required Actions:
1. **Encoding Validation:** `Tr.json` ve `Tr.ts` dosyalarındaki Türkçe karakterlerin (ü, ğ, ı, ş, ç) UTF-8 olarak doğru kaydedildiğini (mojibake olmadığını) teyit edin.
2. **Key Parity Check:**
| Test Case | Description | Result |
|---|---|---|
| TC001 | Locale Encoding (UTF-8) | Tüm dillerde (Tr, En, Kr, Zz) özel karakterlerin doğru render edilmesi. | **PASSED** |
| TC002 | Key Parity | Yeni eklenen ayar anahtarlarının (settingsHeaderTitle vb.) tüm dosyalarda varlığı. | **PASSED** |
| TC003 | Mirror Sync Consistency | Data_Base verilerinin ZazaLingo/data mirror'ına tam ve hatasız kopyalanması. | **PASSED** |
| TC004 | Hash Verification | SSoT ve Mirror dosyaları arasında 1:1 içerik (hash) tutarlılığı. | **PASSED** |
| TC005 | SSoT Write Order | Önce Primary (Data_Base) sonra Mirror (ZazaLingo) yazım sırasının doğrulanması. | **PASSED** |
4. Raporunuzu sunun.

---

## Tester Report - [SEAL-SETTINGS-LOCALIZATION-FINAL]

**Final Result:** PASSED.

**Test Time:** 2026-04-21

**Scope:** `Data_Base/data/locales`, `ZazaLingo/data/locales`, `Data_Base/types/locales.ts`, live `GET /data`, and `database-server.js` mirror target registration.

### Executive Summary

The final localization seal test passed. Previous blockers are resolved:

- Turkish UTF-8 values in `Tr.json` and `Tr.ts` are now valid and no mojibake/replacement-character pattern was found.
- `Tr` now contains `logout`, `languageTarget`, and `helperLanguageLabel`.
- `test_key_tc002` was removed from primary and mirror locale files.
- `Data_Base/data/locales` and `ZazaLingo/data/locales` now use the same PascalCase file set and all checked SHA-256 hashes match.
- Live `GET /data` returns the corrected locale payload.

### Check 1 - Encoding Validation

**Result:** PASSED.

Validated exact Turkish labels in both `Data_Base/data/locales/Tr.json` and `Data_Base/data/locales/Tr.ts`:

| Key | Expected / Actual |
|---|---|
| `labelMusic` | `Müzik:` |
| `labelComposer` | `Besteci:` |
| `labelPerformer` | `Yorumcu:` |
| `labelSource` | `Kaynak:` |
| `labelLicense` | `Lisans:` |
| `labelLink` | `Bağlantı:` |
| `labelChanges` | `Değişiklikler:` |
| `logout` | `Çıkış` |
| `languageTarget` | `TÜRKÇE` |
| `helperLanguageLabel` | `Yardımcı Dil` |

Code point evidence:

- `Müzik:` => `[77,252,122,105,107,58]`
- `Bağlantı:` => `[66,97,287,108,97,110,116,305,58]`
- `Değişiklikler:` => `[68,101,287,105,351,105,107,108,105,107,108,101,114,58]`
- `Çıkış` => `[199,305,107,305,351]`
- `TÜRKÇE` => `[84,220,82,75,199,69]`

Additional scan result: no `MÃ`, `BaÄ`, `DeÄ`, or Unicode replacement character pattern was found in primary or mirror locale files.

### Check 2 - Key Parity / Interface Compatibility

**Result:** PASSED.

All primary locale JSON/TS pairs are synchronized and compatible with `Data_Base/types/locales.ts`.

| Language | JSON Keys | TS Keys | Interface Keys | JSON/TS Key Sync | Value Diff | Missing Interface Keys | Extra Keys | `test_key_tc002` |
|---|---:|---:|---:|---|---:|---|---|---|
| Tr | 116 | 116 | 116 | true | 0 | none | none | absent |
| En | 116 | 116 | 116 | true | 0 | none | none | absent |
| Zz | 116 | 116 | 116 | true | 0 | none | none | absent |
| Kr | 116 | 116 | 116 | true | 0 | none | none | absent |

The previously missing Turkish keys are present in both JSON and TS:

- `logout`
- `languageTarget`
- `helperLanguageLabel`

### Check 3 - Mirror Sync & Casing

**Result:** PASSED.

Primary and mirror folders now contain the exact same PascalCase file set:

`En.json`, `En.ts`, `Kr.json`, `Kr.ts`, `Tr.json`, `Tr.ts`, `Zz.json`, `Zz.ts`.

No lowercase stale files such as `tr.json` or `en.json` remain in `ZazaLingo/data/locales`.

SHA-256 parity:

| File | Primary Hash | Mirror Hash | Match |
|---|---|---|---|
| `Tr.json` | `cb76e1b58a050ba875e4797a7a32a4606be75e8b25e66a5c8bf215ccf30178be` | `cb76e1b58a050ba875e4797a7a32a4606be75e8b25e66a5c8bf215ccf30178be` | true |
| `Tr.ts` | `2295344312b732a45d26d8ef044eb36edf6ff20006b4ee4f9716fce1a8047c32` | `2295344312b732a45d26d8ef044eb36edf6ff20006b4ee4f9716fce1a8047c32` | true |
| `En.json` | `0da3632876e555fa69d4170350222b6e3b5b56a7903dec0125764e1fdb26cd91` | `0da3632876e555fa69d4170350222b6e3b5b56a7903dec0125764e1fdb26cd91` | true |
| `En.ts` | `82d60487c0cf4eb31957d8c476b23c84262ca53a4d33e49d7a9ae658132171ed` | `82d60487c0cf4eb31957d8c476b23c84262ca53a4d33e49d7a9ae658132171ed` | true |
| `Zz.json` | `1655b1b48da837ac4ac10b35dba6ea9adce6e33077846574aa32f2d66a6e78f5` | `1655b1b48da837ac4ac10b35dba6ea9adce6e33077846574aa32f2d66a6e78f5` | true |
| `Zz.ts` | `12a8fd15bd3a00134d8e4b4e5165d8c6d88c50d14727c3156d77a7ec86e7e0ec` | `12a8fd15bd3a00134d8e4b4e5165d8c6d88c50d14727c3156d77a7ec86e7e0ec` | true |
| `Kr.json` | `59fa34dffabbd7689a4b8089f6d5cd61ca49ffa6ae2e2a63b41cc09d57714d82` | `59fa34dffabbd7689a4b8089f6d5cd61ca49ffa6ae2e2a63b41cc09d57714d82` | true |
| `Kr.ts` | `693cbc3cc5cd6b97c6b3262a791d140662d394416cef6f6a864b9597f79b50c3` | `693cbc3cc5cd6b97c6b3262a791d140662d394416cef6f6a864b9597f79b50c3` | true |

### Check 4 - Runtime Payload

**Result:** PASSED.

Live `GET http://127.0.0.1:4000/data` with `X-API-KEY` returned HTTP 200.

Runtime checks:

- Languages returned: `En`, `Kr`, `Tr`, `Zz`.
- Required localization keys are present and non-empty for all four languages.
- `Tr` runtime values match the corrected UTF-8 expectations.
- `test_key_tc002` is absent from runtime locales.

### Implementation Sanity Check

`Data_Base/database-server.js` now registers both sync targets:

- Primary: `syncManager.addTarget(DATA_DIR, true)`
- Mirror: `syncManager.addTarget(MOBILE_DATA_DIR, false)` when `../ZazaLingo/data` exists

This addresses the previous root cause where mirror sync had no second target and `_cloneToMirrors()` could not propagate locale updates.

### Final Verdict

PASSED. The final localization/mirror parity task is sealed from the DataBase Tester side.

## Tester Report - [SEAL-SETTINGS-LOCALIZATION-KEYS]

**Final Result:** FAILED.

**Test Time:** 2026-04-21

**Scope:** `Data_Base/data/locales`, `Data_Base/types/locales.ts`, `Data_Base/shared/types/locales.ts`, live `GET /data`, and mirror parity against `ZazaLingo/data/locales`.

### Executive Summary

The developer fix is not fully sealed. The newly requested 18 Settings/AppInfo localization keys exist in all primary JSON/TS locale files, and JSON/TS files inside `Data_Base/data/locales` are synchronized by key and value per language. However, the task cannot be passed because three critical issues remain:

- Turkish technical labels are not correctly encoded in primary data and live `/data` payload.
- `Tr.json` / `Tr.ts` are not compatible with the required `Locale` interface because three required legacy keys are missing.
- Primary locale files and Mirror locale files are not hash-consistent; all tested locale files differ between `Data_Base/data/locales` and `ZazaLingo/data/locales`.

### Check 1 - New Settings Locale Keys

**Result:** PASSED for the 18 requested new keys in primary storage.

Validated required keys:

`settingsHeaderTitle`, `settingsMusicSectionTitle`, `settingsMusicVolumeTitle`, `settingsMusicBadgeTitle`, `settingsInfoSectionTitle`, `settingsTeamTitle`, `settingsDedicationTitle`, `settingsThemeTitle`, `themeLight`, `themeDark`, `themeSolarized`, `labelMusic`, `labelComposer`, `labelPerformer`, `labelSource`, `labelLicense`, `labelLink`, `labelChanges`.

Evidence from primary `Data_Base/data/locales`:

| Language | JSON Keys | TS Keys | JSON/TS Key Sync | JSON/TS Value Diff | Missing New Keys |
|---|---:|---:|---|---:|---|
| Tr | 114 | 114 | true | 0 | none |
| En | 117 | 117 | true | 0 | none |
| Zz | 117 | 117 | true | 0 | none |
| Kr | 117 | 117 | true | 0 | none |

Live runtime `GET /data` also returned all 18 new keys as present/non-empty for `Tr`, `En`, `Zz`, and `Kr`.

### Check 2 - Type Parity

**Result:** FAILED for complete `Locale` parity.

`Data_Base/types/locales.ts` and `Data_Base/shared/types/locales.ts` both include the 18 new keys and keep `logout`, `languageTarget`, and `helperLanguageLabel` as required `string` fields.

Primary locale data is not fully compatible with this interface:

| Language | Interface Keys | JSON Keys | Missing Required Locale Keys |
|---|---:|---:|---|
| Tr | 116 | 114 | `logout`, `languageTarget`, `helperLanguageLabel` |
| En | 116 | 117 | none |
| Zz | 116 | 117 | none |
| Kr | 116 | 117 | none |

`Tr.ts` is typed as `export const Tr: Locale = ...`, so a real TypeScript compile path should reject this object. Runtime `/data.locales.Tr` also lacks the same three fields, so this is not only a static typing concern.

Additional observation: all language JSON/TS primary files contain an extra `test_key_tc002` field that is not part of the `Locale` interface. This looks like a leftover regression-test artifact and should be removed or explicitly modeled.

### Check 3 - Turkish Label Content

**Result:** FAILED.

The technical labels are present, but several values are mojibake/corrupted, not valid Turkish strings.

Expected vs actual in `Data_Base/data/locales/Tr.json`, `Tr.ts`, and live `/data.locales.Tr`:

| Key | Expected | Actual |
|---|---|---|
| `labelMusic` | `Müzik:` | `MÃ¼zik:` |
| `labelComposer` | `Besteci:` | `Besteci:` |
| `labelPerformer` | `Yorumcu:` | `Yorumcu:` |
| `labelSource` | `Kaynak:` | `Kaynak:` |
| `labelLicense` | `Lisans:` | `Lisans:` |
| `labelLink` | `Bağlantı:` | `BaÄlantÄ±:` |
| `labelChanges` | `Değişiklikler:` | corrupted string containing replacement character |

Evidence from character-code validation:

- `labelMusic` actual codes: `[77,195,188,122,105,107,58]`; expected codes: `[77,252,122,105,107,58]`.
- `labelLink` actual codes include split UTF-8 bytes interpreted as characters; expected uses `ğ` and `ı` code points.
- `labelChanges` contains `65533`, the Unicode replacement character, which proves irreversible decoding corruption already exists in the persisted value.

### Check 4 - Primary / Mirror Hash Consistency

**Result:** FAILED.

Compared SHA-256 hashes between:

- Primary: `Data_Base/data/locales`
- Mirror: `ZazaLingo/data/locales`

All checked locale files differ:

| File | Hash Match |
|---|---|
| `Tr.ts` | false |
| `Tr.json` / `tr.json` | false |
| `En.ts` | false |
| `En.json` / `en.json` | false |
| `Zz.ts` | false |
| `Zz.json` | false |
| `Kr.ts` | false |
| `Kr.json` | false |

Mirror content is stale and structurally different. Examples:

| Language/File | Primary Keys | Mirror Keys | Important Missing In Mirror |
|---|---:|---:|---|
| Tr JSON | 114 | 97 | all new settings labels, themes, `test_key_tc002` |
| En JSON | 117 | 98 | all new settings labels, `logout`, themes |
| Zz JSON | 117 | 97 | all new settings labels, `logout`, themes |
| Kr JSON | 117 | 97 | all new settings labels, `logout`, themes |
| Tr TS | 114 | 110 | several new settings keys, `test_key_tc002` |
| En TS | 117 | 111 | several new settings keys, `logout` |
| Zz TS | 117 | 110 | several new settings keys, `logout`, `test_key_tc002` |
| Kr TS | 117 | 110 | several new settings keys, `logout`, `test_key_tc002` |

Mirror also has inconsistent filename casing for JSON files: `tr.json` and `en.json` exist instead of primary-style `Tr.json` and `En.json`. On Windows this is easy to miss because the filesystem is case-insensitive, but it is still a portability/deployment risk.

### Root Cause Analysis

Most likely root causes:

- **Mirror sync disabled by design/change:** `database-server.js` registers only `DATA_DIR` as a SyncManager target. The mobile mirror target block for `../ZazaLingo/data` is commented out under `v8.0 SSoT Migration: Tight Coupling disabled` around lines 64-74. Because `SyncManager` has only one target, `_cloneToMirrors()` returns early and locale updates never propagate to `ZazaLingo/data`.
- **Locale save path writes exactly what it receives:** `handlers/SettingsHandler.js`, `LocalesHandler.save()`, writes `locales[lang]` directly through `adapter.injectData()` and `adapter.injectJSON()` without schema completion, required-key backfill, or encoding validation. If DevApp sends an incomplete/corrupted `Tr` object, Data_Base persists it atomically but incorrectly.
- **Safe-write protects atomicity, not semantic validity:** `SyncManager.js` correctly uses `JSON.stringify`, temp files, `renameSync`, and mirror clone mechanics. It does not validate Unicode correctness, required interface parity, or leftover test keys before write.
- **Aggregation reads TS primary only:** `AggregationReader.readLocale()` reads `${lang}.ts` from primary locales. Therefore the live `/data` response reflects the corrupted/missing primary `Tr.ts` values directly.

Likely code regions for developer investigation:

- `Data_Base/database-server.js:64-74` - mirror target registration is disabled.
- `Data_Base/handlers/SettingsHandler.js:43-52` - locale payload is persisted without normalization or schema enforcement.
- `Data_Base/SyncManager.js:61-79` - mirror clone only runs if more than one target exists.
- `Data_Base/SyncManager.js:103-119` and `Data_Base/SyncManager.js:199-218` - atomic TS/JSON writes serialize data but do not validate encoding or required locale fields.
- `Data_Base/AggregationReader.js:58-61` - live locale payload reads primary TS exports, so persisted Tr corruption is exposed to clients.

### Risk Assessment

Severity: CRITICAL.

Impact:

- Turkish UI can display mojibake labels in Settings/AppInfo surfaces.
- Any consumer expecting `Locale.logout`, `Locale.languageTarget`, or `Locale.helperLanguageLabel` from `Tr` can receive `undefined`.
- TypeScript type contract and runtime data contract are divergent.
- ZazaLingo app mirror can keep serving stale locale data even after Data_Base primary appears fixed.
- The existing Safe-Write mechanism can safely preserve bad data; atomicity alone does not prevent semantic data loss.

### Final Verdict

FAILED. Do not seal this task yet.

Required developer actions before re-test:

1. Restore `Tr.json` and `Tr.ts` required keys: `logout`, `languageTarget`, `helperLanguageLabel`.
2. Correct Turkish UTF-8 labels and verify actual code points, not only visual console output.
3. Remove or formalize `test_key_tc002` from all locale files.
4. Decide the intended v8.0 mirror strategy. If mirror must remain authoritative for ZazaLingo runtime, re-enable/replace sync and prove primary/mirror hashes match. If mirror is intentionally deprecated, update architecture/task expectations and remove stale mirror dependency.
5. Add validation in locale save flow so incomplete or mojibake locale payloads cannot be persisted as a successful save.

## Task History
- [x] [SEAL-SETTINGS-LOCALIZATION-FINAL] - TESTED - PASSED (UTF-8, key parity, casing, live payload, and mirror hashes sealed)
- [x] [SEAL-SETTINGS-LOCALIZATION-KEYS] - TESTED - FAILED (Turkish encoding, Tr type parity, and mirror hash consistency failed)
- [x] [SEAL-SETTINGS-LOCALIZATION-KEYS] - TESTED - PASSED (Keys & Types synchronized)
- [x] [TEST-SETTINGS-LOCALIZATION-KEYS] - TESTED - PASSED
- [x] [SEAL-FIX-PHASE-F-APPINFO-LOCALIZATION] - TESTED - PASSED / SEALED
