require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const logger = require('./logger');
const httpLogger = morgan('dev');

// --- DIP Infrastructure ---
const FileSystemAdapter = require('./FileSystemAdapter');
const TSInjectionService = require('./services/TSInjectionService');
const AtomicWriter = require('./services/AtomicWriter');
const BackupService = require('./services/BackupService');
const MirrorService = require('./services/MirrorService');
const SyncManager = require('./SyncManager');
const ConfigService = require('./services/ConfigService');
const ThemeRegistry = require('./ThemeRegistry');

// --- Managers & Tools ---
const AggregationReader = require('./AggregationReader');
const AggregationAssembler = require('./AggregationAssembler');
const AggregationManager = require('./AggregationManager');
const CurriculumManager = require('./CurriculumManager');
const SaveRegistry = require('./SaveRegistry');
const SchemaValidator = require('./SchemaValidator');

// --- Handlers ---
const { StationsHandler, DecorationsHandler, MapConfigHandler } = require('./handlers/MapHandler');
const CurriculumHandler = require('./handlers/CurriculumHandler');
const ProverbsHandler = require('./handlers/ProverbsHandler');
const { ThemeHandler, ThemeSchemesHandler } = require('./handlers/ThemeHandler');
const { InfoHandler, ZazaConstantsHandler, LocalesHandler } = require('./handlers/SettingsHandler');

// --- Security Check (v8.0 Relaxed for Dev) ---
let DATABASE_API_KEY = process.env.DATABASE_API_KEY;
if (!DATABASE_API_KEY) {
    DATABASE_API_KEY = 'zaza_dev_secret_2026';
    logger.warn(`[Security] DATABASE_API_KEY not found in environment. Using default DEV key: ${DATABASE_API_KEY}`);
}

const PORT = 4000;
const DATA_DIR = path.join(__dirname, 'data');
const CURRICULUM_DIR = path.join(DATA_DIR, 'curriculum');
const MAP_DIR = path.join(DATA_DIR, 'map');
const THEME_DIR = path.join(DATA_DIR, 'theme');
const PROVERBS_DIR = path.join(DATA_DIR, 'proverbs');
const LOCALES_DIR = path.join(DATA_DIR, 'locales');
const SETTINGS_DIR = path.join(DATA_DIR, 'settings');
const BACKUP_DIR = path.join(__dirname, 'backups');
const ARCHIVE_DIR = path.join(__dirname, 'archive');

// --- Initialization (Composition Root) ---
const fsAdapter = new FileSystemAdapter();
const config = ConfigService.loadConfig(path.join(__dirname, 'data', 'settings', 'syncConfig.json'));

const atomicWriter = new AtomicWriter(fsAdapter);
atomicWriter.setConfig(config);

const backupService = new BackupService(fsAdapter, atomicWriter);
backupService.setBackupDir(BACKUP_DIR);

const mirrorService = new MirrorService(fsAdapter, atomicWriter);
mirrorService.addMirror(DATA_DIR); // Primary as a target for some ops if needed? No, usually Primary is source.

const syncManager = new SyncManager(fsAdapter, atomicWriter, backupService, mirrorService, TSInjectionService);
syncManager.addTarget(DATA_DIR, true);

// Aggregation Runtime (DIP)
const aggReader = new AggregationReader(fsAdapter);
const aggAssembler = new AggregationAssembler(aggReader, fsAdapter);
const aggregationManager = new AggregationManager(aggReader, aggAssembler);

// Mobile Sync Target
const MOBILE_DATA_DIR = process.env.MOBILE_DATA_DIR || path.join(__dirname, '../ZazaLingo/data');
if (fs.existsSync(MOBILE_DATA_DIR)) {
    syncManager.addTarget(MOBILE_DATA_DIR, false);
    logger.info(`[Sync] Mobile Data Sync ENABLED: ${MOBILE_DATA_DIR}`);
}

// --- Theme Registry (OCP) ---
const themeRegistry = new ThemeRegistry();
themeRegistry.register('tokens/colors.ts', [
    'primary', 'primaryDark', 'secondary', 'tertiary', 'background', 'surface',
    'textDark', 'textLight', 'textWhite', 'border', 'correct', 'correctShadow',
    'incorrect', 'incorrectShadow', 'inactive', 'inactiveText', 'selectedBg',
    'selectedBorder', 'selectedText', 'progressBarBg', 'progressFill',
    'feedbackCorrectBg', 'feedbackIncorrectBg', 'accent', 'accentLight',
    'secondaryLight', 'headerTitleColor', 'headerSubtitleColor',
    'buttonContinueColor', 'buttonContinueTextColor', 'buttonSettingsColor',
    'buttonSettingsTextColor', 'questionTitleColor', 'questionPromptColor',
    'questionBtnColor', 'questionBtnTextColor', 'proverbsTitleColor',
    'proverbsTextColor', 'proverbsTranslationColor', 'proverbsBgColor',
    'proverbsBorderColor'
]);
themeRegistry.register('components/map.ts', [
    'mapBgColor', 'mapGridColor', 'mapRiverColor', 'railSteelColor', 'railActiveColor',
    'tieNormalColor', 'tieActiveColor', 'pinLockedBg', 'pinLockedFg', 'pinActiveBg',
    'pinActiveFg', 'pinActiveRing', 'pinDoneBg', 'pinDoneFg', 'pinDoneRing',
    'labelBgColor', 'labelTextColor', 'labelLockedColor', 'locoColor',
    'locoAccentColor', 'locoWindowColor', 'locoLightColor',
    'mapRailWidth', 'mapTieSize', 'mapTieThickness', 'mapTieSpacing',
    'mapPinRadius', 'mapTopicPinRadius'
]);
themeRegistry.register('tokens/spacing.ts', [
    'borderRadius', 'buttonPadding', 'buttonBorderRadius', 'buttonHeight',
    'buttonVerticalMargin', 'buttonContainerPaddingHorizontal', 'buttonContainerPaddingBottom',
    'headerHeight', 'headerTopMargin', 'headerBottomMargin', 'buttonContainerTopMargin',
    'buttonContainerMarginLeft', 'buttonWidth', 'buttonMarginTop', 'buttonMarginLeft',
    'buttonGap', 'headerTitleMarginTop', 'headerTitleMarginLeft', 'headerTitleWidth',
    'headerTitleHeight', 'headerSubtitleMarginTop', 'headerSubtitleMarginLeft',
    'headerSubtitleWidth', 'headerSubtitleHeight', 'proverbsMarginTop',
    'proverbsMarginLeft', 'proverbsWidth', 'proverbsHeight', 'mascotHomeTop',
    'mascotHomeMarginLeft', 'mascotHomeSize', 'mascotQuestionTop',
    'mascotQuestionMarginLeft', 'mascotQuestionSize', 'mascotWordOrderTop',
    'mascotWordOrderMarginLeft', 'mascotWordOrderSize', 'mascotMatchingTop',
    'mascotMatchingMarginLeft', 'mascotMatchingSize', 'mascotImageChoiceTop',
    'mascotImageChoiceMarginLeft', 'mascotImageChoiceSize', 'mascotChoiceImageTop',
    'mascotChoiceImageMarginLeft', 'mascotChoiceImageSize', 'mascotDialogueTop',
    'mascotDialogueMarginLeft', 'mascotDialogueSize', 'mascotDinlemeTop',
    'mascotDinlemeMarginLeft', 'mascotDinlemeSize', 'mascotGorselEslesirmeTop',
    'mascotGorselEslesirmeMarginLeft', 'mascotGorselEslesirmeSize',
    'mascotSentenceCompletionTop', 'mascotSentenceCompletionMarginLeft',
    'mascotSentenceCompletionSize', 'mascotImageQuestionTop',
    'mascotImageQuestionMarginLeft', 'mascotImageQuestionSize',
    'questionTitleMarginTop', 'questionTitleMarginLeft', 'questionTitleWidth',
    'questionTitleHeight', 'questionPromptMarginTop', 'questionPromptMarginBottom',
    'questionPromptMarginLeft', 'questionPromptWidth', 'questionPromptHeight',
    'questionPromptPaddingHorizontal', 'questionOptionsMarginTop',
    'questionOptionsMarginBottom', 'questionOptionsMarginLeft', 'questionOptionsWidth',
    'questionOptionsHeight', 'questionOptionsPaddingHorizontal', 'questionBtnMarginTop',
    'questionBtnMarginLeft', 'questionBtnWidth', 'questionBtnHeight', 'questionBtnBorderRadius'
]);
themeRegistry.register('tokens/typography.ts', [
    'buttonTextSize', 'headerTitleFontSize', 'headerSubtitleFontSize',
    'questionPromptFontSize', 'questionOptionFontSize', 'questionBtnTextFontSize',
    'questionTitleFontSize', 'proverbsTitleFontSize', 'proverbsTextFontSize', 
    'proverbsTranslationFontSize', 'settingsTitleFontSize', 'settingsMusicSectionTitleFontSize',
    'settingsInfoSectionTitleFontSize', 'settingsMusicItemFontSize', 'settingsInfoItemFontSize',
    'settingsSubHeaderFontSize', 'settingsBackFontSize'
]);
themeRegistry.register('components/questions.ts', [
    'coktanSecmeliBgColor', 'coktanSecmeliTextColor', 'coktanSecmeliSelectedBgColor',
    'coktanSecmeliSelectedBorderColor', 'coktanSecmeliSelectedTextColor',
    'wordOrderBgColor', 'wordOrderTextColor', 'wordOrderSelectedBgColor',
    'wordOrderSelectedBorderColor', 'wordOrderSelectedTextColor',
    'matchingBgColor', 'matchingTextColor', 'matchingSelectedBgColor',
    'matchingSelectedBorderColor', 'matchingSelectedTextColor',
    'imageChoiceBgColor', 'imageChoiceTextColor', 'imageChoiceSelectedBgColor',
    'imageChoiceSelectedBorderColor', 'imageChoiceSelectedTextColor',
    'choiceImageBgColor', 'choiceImageTextColor', 'choiceImageSelectedBgColor',
    'choiceImageSelectedBorderColor', 'choiceImageSelectedTextColor',
    'dialogueBgColor', 'dialogueTextColor', 'dialogueSelectedBgColor',
    'dialogueSelectedBorderColor', 'dialogueSelectedTextColor',
    'dinlemeBgColor', 'dinlemeTextColor', 'dinlemeSelectedBgColor',
    'dinlemeSelectedBorderColor', 'dinlemeSelectedTextColor',
    'gorselEslesirmeBgColor', 'gorselEslesirmeTextColor', 'gorselEslesirmeSelectedBgColor',
    'gorselEslesirmeSelectedBorderColor', 'gorselEslesirmeSelectedTextColor',
    'sentenceCompletionBgColor', 'sentenceCompletionTextColor', 'sentenceCompletionSelectedBgColor',
    'sentenceCompletionSelectedBorderColor', 'sentenceCompletionSelectedTextColor',
    'imageQuestionBgColor', 'imageQuestionTextColor', 'imageQuestionSelectedBgColor',
    'imageQuestionSelectedBorderColor', 'imageQuestionSelectedTextColor'
]);

// --- Registry Setup (OCP) ---
const saveRegistry = new SaveRegistry();
saveRegistry.register('stations', new StationsHandler(fsAdapter, syncManager));
saveRegistry.register('decorations', new DecorationsHandler(fsAdapter, syncManager));
saveRegistry.register('mapConfig', new MapConfigHandler(fsAdapter, syncManager));
saveRegistry.register('tests', new CurriculumHandler(new CurriculumManager(fsAdapter, syncManager)));
saveRegistry.register('proverbs', new ProverbsHandler(fsAdapter, syncManager));
saveRegistry.register('theme', new ThemeHandler(fsAdapter, syncManager, themeRegistry));
saveRegistry.register('themeSchemes', new ThemeSchemesHandler(fsAdapter, syncManager));
saveRegistry.register('info', new InfoHandler(fsAdapter, syncManager));
saveRegistry.register('zazaConstants', new ZazaConstantsHandler(fsAdapter, syncManager));
saveRegistry.register('locales', new LocalesHandler(fsAdapter, syncManager));

// Ensure directories exist locally
[DATA_DIR, CURRICULUM_DIR, MAP_DIR, THEME_DIR, PROVERBS_DIR, LOCALES_DIR, SETTINGS_DIR, BACKUP_DIR, ARCHIVE_DIR].forEach(dir => {
    fsAdapter.mkdir(dir);
});



const SESSIONS = new Map(); // token -> user object

const server = http.createServer((req, res) => {
    // 1. Run Morgan Logger
    httpLogger(req, res, () => {
    // CORS headers — allow Vite dev server (5173) and Expo web (8081)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-KEY, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- Authentication & Security Middleware ---
    const AUTH_KEY = DATABASE_API_KEY;

    
    const clientKey = req.headers['x-api-key'];
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const isAuthenticated = (clientKey === AUTH_KEY) || (bearerToken && SESSIONS.has(bearerToken));

    // Protected endpoints (Write operations)
    if (req.method === 'POST' && req.url !== '/login') {
        if (!isAuthenticated) {
            logger.warn(`[Security] Blocked unauthorized POST attempt to ${req.url} from ${req.socket.remoteAddress}`);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized: Valid X-API-KEY or Authorization header required' }));
            return;
        }
    }

    // ── POST /upload ────────────────────────────────────────────────────────
    if (req.method === 'POST' && req.url === '/upload') {
        let fileName = req.headers['x-filename'];
        if (!fileName) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Missing X-FileName header' }));
            return;
        }

        // Security: Prevent path traversal by extracting only the base name
        fileName = path.basename(fileName);

        const ext = path.extname(fileName).toLowerCase();
        let targetSubDir = 'Pictures';
        if (['.mp3', '.wav', '.ogg', '.aac'].includes(ext)) {
            targetSubDir = 'Audio';
        }

        const targetDir = path.join(__dirname, 'assets', 'questions', targetSubDir);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const filePath = path.join(targetDir, fileName);
        const fileStream = fs.createWriteStream(filePath);

        req.pipe(fileStream);

        fileStream.on('finish', () => {
            logger.info(`[Upload] Received and saved: ${fileName} -> ${targetSubDir}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                path: `assets/questions/${targetSubDir}/${fileName}` 
            }));
        });

        fileStream.on('error', (err) => {
            logger.error('[Upload] Error saving file:', err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to save file' }));
        });
        return;
    }

    // ── POST /login ────────────────────────────────────────────────────────
    if (req.method === 'POST' && req.url === '/login') {
        let chunks = [];
        req.on('data', chunk => { chunks.push(chunk); });
        req.on('end', () => {
            try {
                const body = Buffer.concat(chunks).toString('utf-8');
                const { username, password } = JSON.parse(body);

                const usersFile = path.join(DATA_DIR, 'users.json');
                const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
                const user = users.find(u => u.username === username && u.password === password);
                if (user) {
                    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
                    SESSIONS.set(token, { username: user.username, role: user.role });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, token, user: { username: user.username, role: user.role } }));
                    logger.info(`[Auth] User logged in: ${username}`);
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Invalid username or password' }));
                }
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
        });
        return;
    }

    // ── GET /data | /full-payload ──────────────────────────────────────────
    if (req.method === 'GET' && (req.url === '/data' || req.url === '/full-payload')) {
        try {
            const dirs = { mapDir: MAP_DIR, curriculumDir: CURRICULUM_DIR, themeDir: THEME_DIR, proverbsDir: PROVERBS_DIR, localesDir: LOCALES_DIR, settingsDir: SETTINGS_DIR };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(aggregationManager.buildFullPayload(dirs)));
        } catch (err) {
            logger.error(`[GET ${req.url}] Error: ${err.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // ── GET /curriculum ────────────────────────────────────────────────────
    if (req.method === 'GET' && req.url === '/curriculum') {
        try {
            const curriculumData = aggregationManager.scanCurriculum(CURRICULUM_DIR);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(curriculumData));
            logger.info(`[GET /curriculum] Served ${Object.keys(curriculumData).length} tests.`);
        } catch (err) {
            logger.error(`[GET /curriculum] Error: ${err.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // ── GET /data/:filename (v8.0 SSoT Incremental) ─────────────────────────
    if (req.method === 'GET' && req.url.startsWith('/data/')) {
        try {
            const requestedFile = path.basename(req.url);
            
            // v8.0 Case 1: Locales Aggregation
            if (requestedFile === 'locales.json') {
                const results = {};
                ['Tr', 'En', 'Zz', 'Kr'].forEach(lang => {
                    const data = aggReader.readLocale(LOCALES_DIR, lang);
                    if (data) results[lang] = data;
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(results));
                return;
            }

            // v8.0 Case 2: Theme Aliasing
            if (requestedFile === 'theme.json') {
                const themePath = path.join(THEME_DIR, 'themeConfig.json');
                if (fs.existsSync(themePath)) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    fs.createReadStream(themePath).pipe(res);
                } else {
                    // Fallback to theme.ts if json doesn't exist
                    const themeTS = aggReader.readTSExport(path.join(THEME_DIR, 'theme.ts'));
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(themeTS || {}));
                }
                return;
            }

            // v8.0 Case 3: Standard Smart Mapping
            const subDirs = ['', 'map', 'theme', 'locales', 'settings', 'proverbs'];
            let foundPath = null;
            
            for (const sub of subDirs) {
                const checkPath = path.join(DATA_DIR, sub, requestedFile);
                if (fs.existsSync(checkPath) && fs.statSync(checkPath).isFile()) {
                    foundPath = checkPath;
                    break;
                }
            }

            if (foundPath) {
                // If it's a .ts file, parse it; if it's .json, serve directly
                if (foundPath.endsWith('.ts')) {
                    const data = aggReader.readTSExport(foundPath);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    fs.createReadStream(foundPath).pipe(res);
                }
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ error: `Data file ${requestedFile} not found in any standard directory.` }));
            }
        } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // ── GET /assets ────────────────────────────────────────────────────────
    if (req.method === 'GET' && req.url === '/assets') {
        try {
            const scanDirs = [
                { dir: path.join(__dirname, 'assets', 'questions', 'Pictures'), prefix: 'assets/questions/Pictures/' },
                { dir: path.join(__dirname, 'assets', 'questions', 'Audio'), prefix: 'assets/questions/Audio/' },
                { dir: path.join(__dirname, 'assets', 'audio', 'lessons'), prefix: 'assets/audio/lessons/' },
                { dir: path.join(__dirname, 'assets', 'Pictures'), prefix: 'assets/Pictures/' }
            ];

            let allAssets = [];

            for (const item of scanDirs) {
                if (fs.existsSync(item.dir)) {
                    const files = fs.readdirSync(item.dir)
                        .filter(f => {
                            const fullPath = path.join(item.dir, f);
                            return fs.statSync(fullPath).isFile();
                        })
                        .map(f => item.prefix + f);
                    allAssets = allAssets.concat(files);
                }
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ assets: allAssets }));
            logger.info(`[GET /assets] Served ${allAssets.length} total assets (flat list).`);
        } catch (err) {
            logger.error(`[GET /assets] Error: ${err.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // ── POST /save ─────────────────────────────────────────────────────────
    if (req.method === 'POST' && (req.url === '/save' || req.url === '/saveLocales')) {
        let chunks = [];
        req.on('data', chunk => { chunks.push(chunk); });
        req.on('end', async () => {
            try {
                const body = Buffer.concat(chunks).toString('utf-8');
                const payload = JSON.parse(body);

                // v17.9.8 Auto-Healing: Strip injected metadata from tests array to prevent schema validation failure
                if (payload.tests) {
                    if (payload.tests.info) {
                        delete payload.tests.info;
                        logger.warn("[Auto-Heal] Stripped 'info' from 'tests' payload.");
                    }
                    if (payload.tests.zazaConstants) {
                        delete payload.tests.zazaConstants;
                        logger.warn("[Auto-Heal] Stripped 'zazaConstants' from 'tests' payload.");
                    }
                }
                // v8.0 Schema Validation Middleware
                const validation = SchemaValidator.validatePascalCaseKeys(payload);
                if (!validation.isValid) {
                    logger.error(`[SchemaValidator] Validation failed for ${req.url}. Error Path: ${validation.errorPath}`);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        error: 'Schema Validation Failed: Use PascalCase for custom data fields.',
                        offendingKey: validation.errorPath 
                    }));
                    return;
                }

                // v9.0 Strict Integrity Lock
                if (payload.stations) {
                    const idResult = SchemaValidator.validateMandatoryIDs(payload.stations, 'stations');
                    if (!idResult.isValid) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Missing mandatory ID in stations', offendingKey: idResult.errorPath }));
                        return;
                    }
                    const integrityResult = SchemaValidator.validateDataIntegrity(payload.stations);
                    if (!integrityResult.isValid) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Data integrity failed: Topics must have parentUnitId', offendingKey: integrityResult.errorPath }));
                        return;
                    }
                }
                if (payload.tests) {
                    const idResult = SchemaValidator.validateMandatoryIDs(payload.tests, 'tests');
                    if (!idResult.isValid) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Missing mandatory ID in tests', offendingKey: idResult.errorPath }));
                        return;
                    }
                }

                const context = { 
                    adapter: fsAdapter, 
                    stations: payload.stations, 
                    curriculumDir: CURRICULUM_DIR, 
                    archiveDir: ARCHIVE_DIR, 
                    localesDir: LOCALES_DIR,
                    themeDir: THEME_DIR,
                    dataDir: DATA_DIR
                };
                const syncReport = await saveRegistry.process(payload, context);
                if (fs.existsSync(path.join(DATA_DIR, 'users.json'))) syncManager.syncFile('users.json');
                
                res.writeHead(syncReport.partial ? 207 : 200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: syncReport.success,
                    partial: syncReport.partial,
                    errors: syncReport.errors,
                    message: syncReport.partial ? 'Primary saved but some mirrors failed to sync.' : 'Save successful'
                }));
                logger.info(`✅ [Registry] Save successful for: ${req.url} (Partial: ${syncReport.partial})`);
            } catch (err) {
                logger.error(`[POST ${req.url}] Error: ${err.message}`);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

        // ── Static Assets (GET) ────────────────────────────────────────────────
    if (req.method === 'GET') {
        const decodedUrl = decodeURIComponent(req.url);
        const pathname = decodedUrl.split('?')[0];
        let relativePath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
        
        let filePath;

        // v8.0 Shield: Smart Routing with Fallback
        if (relativePath.startsWith('assets/questions/Pictures/')) {
            const fileName = relativePath.replace('assets/questions/Pictures/', '');
            const originalPath = path.join(__dirname, 'assets', 'questions', 'Pictures', fileName);
            const fallbackPath = path.join(__dirname, 'assets', 'Pictures', fileName);
            
            // Smart Routing: Check original path existence before aliasing
            if (fs.existsSync(originalPath) && !fs.statSync(originalPath).isDirectory()) {
                filePath = originalPath;
            } else {
                filePath = fallbackPath;
            }
        } else if (relativePath.startsWith('assets/questions/Audio/')) {
            const fileName = relativePath.replace('assets/questions/Audio/', '');
            const originalPath = path.join(__dirname, 'assets', 'questions', 'Audio', fileName);
            const fallbackPath = path.join(__dirname, 'assets', 'Audio', fileName);
            
            if (fs.existsSync(originalPath) && !fs.statSync(originalPath).isDirectory()) {
                filePath = originalPath;
            } else {
                filePath = fallbackPath;
            }
        } else if (relativePath.startsWith('assets/mascot/')) {
            const mascotFileName = relativePath.replace('assets/mascot/', '');
            filePath = path.join(__dirname, '../ZazaLingo/assets/mascot', mascotFileName);
        } else {
            filePath = path.join(__dirname, relativePath === '' ? 'index.html' : relativePath);
        }

        fs.stat(filePath, (err, stats) => {
            if (err || stats.isDirectory()) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = { 
                '.html': 'text/html', 
                '.js': 'text/javascript', 
                '.css': 'text/css', 
                '.json': 'application/json', 
                '.png': 'image/png', 
                '.jpg': 'image/jpg', 
                '.jpeg': 'image/jpeg',
                '.svg': 'image/svg+xml', 
                '.avif': 'image/avif',
                '.webp': 'image/webp',
                '.wav': 'audio/wav', 
                '.mp3': 'audio/mpeg',
                '.ogg': 'audio/ogg',
                '.mp4': 'video/mp4' 
            };
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
            fs.createReadStream(filePath).pipe(res);
        });
        return;
    }
    }); // End of httpLogger
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') logger.info(`⚠️ Port ${PORT} already in use.`);
    else logger.error('❌ Server error:', err);
});

server.listen(PORT, '0.0.0.0', () => {
    logger.info(`[Dev Tools] Registry-based Server running at http://localhost:${PORT}`);
});
