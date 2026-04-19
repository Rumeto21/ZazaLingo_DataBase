# DataBase Tester Board

## Active Task: [SEAL-ASSET-CONTRACT-v8.0] - Asset Listing & Path Seal
- **Assigned By:** TeamLeader (Antigravity)
- **Status:** [x] RE-TESTED AFTER SERVER RESTART - PASSED
- **Priority:** CRITICAL

### Final Validation Checklist

1. **API Shape Audit:**
   - `GET /assets` response must be `{ "assets": ["assets/...", ...] }`.
2. **Directory Coverage:**
   - List must include files under `assets/audio/lessons/`.
3. **Consistency Check:**
   - Upload a file via `/upload`, then verify the same path appears in `/assets`.

---

## Tester Report - [SEAL-ASSET-CONTRACT-v8.0 RE-OPENED]

**Final Result:** PASSED on the live service currently bound to `localhost:4000` after server restart.

### Scope
- Re-ran the same seal checks requested by TeamLeader after the task was re-opened as `Server Restarted`.
- Source code was not modified.
- Temporary upload probe was removed after validation.

### Evidence - Live Runtime on `localhost:4000`
- `GET http://127.0.0.1:4000/assets` returned HTTP `200`.
- API shape passed: response contains `assets` array.
- Legacy keys are gone: `Pictures` absent, `Audio` absent.
- Asset count before upload: `49`.
- Prefix contract passed: all entries start with `assets/`.
- Directory coverage passed: `assets/audio/lessons/` count in `assets[]` is `4`.
- Confirmed lesson audio examples:
- `assets/audio/lessons/Ez citkar a.wav`
- `assets/audio/lessons/Homa, Sima ra razi bo.wav` (terminal transliteration of original Unicode filename)
- `assets/audio/lessons/Ti pers nekena ez se kena, senina.wav` (terminal transliteration of original Unicode filename)
- `assets/audio/lessons/Sima xeyr ameye.wav` (terminal transliteration of original Unicode filename)

### Upload Consistency Check
- Uploaded probe filename: `db_tester_asset_contract_reseal_20260419.png`.
- `POST http://127.0.0.1:4000/upload` returned HTTP `200`.
- Upload response: `success: true`.
- Upload response path: `assets/questions/Pictures/db_tester_asset_contract_reseal_20260419.png`.
- Follow-up `GET /assets` returned HTTP `200`.
- Asset count increased from `49` to `50` while probe existed.
- Exact uploaded path was present in `assets[]`.
- Cleanup verified: probe file removed from disk and final `/assets` count returned to `49`; probe path no longer listed.

### Root Cause Follow-up
- Previous failure root cause was stale runtime on port `4000`, not the current source implementation.
- Restart appears to have replaced the stale `/assets` contract with the current v8.0 implementation.
- Residual risk remains architectural/operational: `database-server.js` still hardcodes `PORT = 4000` and `EADDRINUSE` logging can hide stale-process situations in future restarts.

### Recommendation
- Mark `[SEAL-ASSET-CONTRACT-v8.0]` as sealed for the current live runtime.
- Keep the previously reported operational hardening recommendation open for the DataBase Developer: environment-driven port and fail-fast `EADDRINUSE`.

---

## Tester Report - [SEAL-ASSET-CONTRACT-v8.0]

**Final Result:** FAILED for the live service currently bound to `localhost:4000`; PASSED for the current `Data_Base/database-server.js` source when executed in an isolated memory harness on port `4010`.

### Scope
- Target: `Data_Base/database-server.js` endpoints `GET /assets` and `POST /upload`.
- Contract under test: `GET /assets` must return `{ "assets": ["assets/...", ...] }`.
- Required coverage: entries under `assets/audio/lessons/` must be included.
- Required consistency: a file uploaded via `/upload` must appear in `/assets` using the same returned path.
- Source code was not modified. Temporary upload probes were removed after verification.

### Evidence A - Live Runtime on `localhost:4000` FAILED
- `GET http://127.0.0.1:4000/assets` returned HTTP `200`, but body shape was old contract.
- Returned keys: `Pictures`, `Audio`.
- Missing key: `assets`.
- Example body shape: `{ "Pictures": [...], "Audio": [] }`.
- Directory coverage failed on live runtime.
- `assets/audio/lessons/` files exist on disk.
- Live `/assets` reported `Audio: []` and log line: `[GET /assets] Served 33 pictures and 0 audio files.`
- Upload consistency failed on live runtime.
- `POST /upload` with `X-FileName: db_tester_asset_contract_20260419.png` returned HTTP `200`.
- Upload response path: `assets/questions/Pictures/db_tester_asset_contract_20260419.png`.
- Follow-up `GET /assets` still used old shape and did not expose the uploaded path in `assets[]`; only old `Pictures` list count changed from 33 to 34.
- Runtime process evidence: `netstat -ano` showed `0.0.0.0:4000 LISTENING` owned by PID `26828`.
- Attempting to start the current server while PID `26828` owned the port logged: `Port 4000 already in use.`

### Evidence B - Current Source Code PASSED in Isolated Harness
- Because `database-server.js` hardcodes `const PORT = 4000`, I did not stop the user's live process. Instead, I loaded the current source in memory and replaced only the runtime port with `4010` for test isolation.
- `GET http://127.0.0.1:4010/assets` returned HTTP `200`.
- API shape passed: `assets` property existed and was an array.
- Legacy `Pictures` property did not exist.
- Asset count before upload: `49`.
- All returned entries started with `assets/`.
- Directory coverage passed: `assets/audio/lessons/` count in `assets[]` was `4`.
- Confirmed audio lesson entries included:
- `assets/audio/lessons/Ez citkar a.wav`
- `assets/audio/lessons/Homa, Sima ra razi bo.wav` (terminal transliteration of original Unicode filename)
- `assets/audio/lessons/Ti pers nekena ez se kena, senina.wav` (terminal transliteration of original Unicode filename)
- `assets/audio/lessons/Sima xeyr ameye.wav` (terminal transliteration of original Unicode filename)
- Upload consistency passed.
- Uploaded probe: `db_tester_asset_contract_20260419_vm.png`.
- `POST /upload` returned HTTP `200`, `success: true`.
- Response path: `assets/questions/Pictures/db_tester_asset_contract_20260419_vm.png`.
- Follow-up `/assets` count increased from `49` to `50`.
- Exact uploaded path was present in `assets[]`.
- Probe file existed before cleanup and was removed after test.

### Root Cause Analysis
- The checked-in/current source appears to contain the intended v8.0 contract.
- `/assets` scans `assets/questions/Pictures`, `assets/questions/Audio`, `assets/audio/lessons`, and `assets/Pictures`.
- The current source responds with `JSON.stringify({ assets: allAssets })`.
- The live server on port `4000` is not serving that current implementation. It is almost certainly a stale Node process started before the `/assets` refactor.
- Secondary reliability risk: `PORT` is hardcoded to `4000`, preventing safe side-by-side validation without a harness.
- Secondary reliability risk: `server.on('error')` logs `Port 4000 already in use.` but does not fail fast. This can make a newly launched server appear "started" while requests are still handled by the stale process.

### Impact
- DevApp/ZazaLingoApp clients expecting `response.assets` will receive `undefined` from the live runtime.
- Lesson audio discovery is broken on the live runtime because `assets/audio/lessons/` is omitted.
- Upload previews/selectors relying on exact path consistency can fail because `/upload` returns `assets/questions/Pictures/<file>`, while live `/assets` exposes only bare filenames under `Pictures`.

### Recommendation
- Restart the live `node` process owning port `4000` so it serves the current `database-server.js`.
- After restart, rerun the same three checks against `localhost:4000`.
- Consider changing startup behavior in a future developer task: allow `PORT` from environment and make `EADDRINUSE` fail fast with non-zero exit to prevent stale-runtime false positives.

---

## Task History
- [x] [SEAL-ASSET-CONTRACT-v8.0] - RE-TESTED AFTER SERVER RESTART - PASSED
- [x] [SEAL-ASSET-CONTRACT-v8.0] - TESTED - LIVE RUNTIME STALE CONTRACT DETECTED
- [x] [FINAL-SERVER-VERIFY] - PASSED
