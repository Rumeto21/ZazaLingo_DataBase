const http = require('http');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const logger = require('./logger');
const syncManager = require('./SyncManager');
const aggregationManager = require('./AggregationManager');
const curriculumManager = require('./CurriculumManager');

// --- Security Check (CRITICAL: Fatal Exit if missing) ---
if (!process.env.DATABASE_API_KEY) {
    logger.error('[Security] FATAL: DATABASE_API_KEY is not defined in environment variables.');
    logger.error('[Security] Server terminating with exit code 1 to prevent unauthorized access.');
    process.exit(1);
}


// Setup Morgan to use Winston for writing logs
const httpLogger = morgan('combined', { stream: { write: message => logger.info(message.trim()) } });

const PORT = 4000;
// Paths for central storage
const DATA_DIR = path.join(__dirname, 'data');
const CURRICULUM_DIR = path.join(DATA_DIR, 'curriculum');
const MAP_DIR = path.join(DATA_DIR, 'map');
const THEME_DIR = path.join(DATA_DIR, 'theme');
const PROVERBS_DIR = path.join(DATA_DIR, 'proverbs');
const LOCALES_DIR = path.join(DATA_DIR, 'locales');
const SETTINGS_DIR = path.join(DATA_DIR, 'settings');
const BACKUP_DIR = path.join(__dirname, 'backups');
const ARCHIVE_DIR = path.join(__dirname, 'archive');

// Initialize SyncManager
syncManager.setBackupDir(BACKUP_DIR);
syncManager.addTarget(DATA_DIR, true); // Primary DB target with backups

// --- Sync with Mobile App ---
const MOBILE_DATA_DIR = process.env.MOBILE_DATA_DIR || path.join(__dirname, '../ZazaLingo/data');

// Optional Mobile Sync Target
if (fs.existsSync(MOBILE_DATA_DIR)) {
    syncManager.addTarget(MOBILE_DATA_DIR, false); 
    logger.info(`[Sync] Mobile Data Sync ENABLED: ${MOBILE_DATA_DIR}`);
} else {
    logger.warn(`[Sync] Mobile Data Directory NOT FOUND: ${MOBILE_DATA_DIR}. Mirror sync disabled.`);
}

// Startup Operations
logger.info('[Startup] Running integrity checks...');
syncManager.cleanupOrphanTempFiles(0); // Clean all old .tmp files on start

// Initial Mirror Sync (Fix BUG-007 on start)
if (fs.existsSync(MOBILE_DATA_DIR)) {
    logger.info('[Startup] Performing initial mirror sync...');
    try {
        const syncDirRecursive = (relPath) => {
            const fullSourcePath = path.join(DATA_DIR, relPath);
            if (!fs.existsSync(fullSourcePath)) return;
            
            const items = fs.readdirSync(fullSourcePath);
            items.forEach(item => {
                const itemRelPath = path.join(relPath, item).replace(/\\/g, '/');
                const stats = fs.statSync(path.join(DATA_DIR, itemRelPath));
                
                if (stats.isDirectory()) {
                    if (item !== 'backups' && item !== 'archive') {
                        syncDirRecursive(itemRelPath);
                    }
                } else if (stats.isFile()) {
                    // Force sync from Primary to Mirrors
                    syncManager.syncFile(itemRelPath);
                }
            });
        };
        syncDirRecursive('');
        logger.info('[Startup] Initial mirror sync (Copy) complete.');

        // Prune Mirror (Fix BUG-008 on start)
        logger.info('[Startup] Pruning Mirror directory...');
        syncManager.pruneMirrors();
        logger.info('[Startup] Mirror pruning complete.');
    } catch (err) {
        logger.error(`[Startup] Initial sync failed: ${err.message}`);
    }
}

// Periodic cleanup of orphan .tmp files (every hour)
setInterval(() => {
    syncManager.cleanupOrphanTempFiles(30); // Clean files older than 30 mins
}, 60 * 60 * 1000);

// --- Global Config & Whitelists ---
const THEME_MAPPING = {
    'tokens/colors.ts': [
        'primary', 'primaryDark', 'secondary', 'tertiary', 'background', 'surface',
        'textDark', 'textLight', 'textWhite', 'border',
        'correct', 'correctShadow', 'incorrect', 'incorrectShadow',
        'inactive', 'inactiveText', 'selectedBg', 'selectedBorder',
        'progressBarBg', 'progressFill', 'feedbackCorrectBg', 'feedbackIncorrectBg',
        'accent', 'accentLight', 'secondaryLight',
        'headerTitleColor', 'headerSubtitleColor',
        'buttonContinueColor', 'buttonContinueTextColor',
        'buttonLogoutColor', 'buttonLogoutTextColor',
        'questionTitleColor', 'questionPromptColor', 'questionBtnColor', 'questionBtnTextColor',
        'proverbsTitleColor', 'proverbsTextColor', 'proverbsTranslationColor',
        'proverbsBgColor', 'proverbsBorderColor'
    ],
    'components/map.ts': [
        'mapBgColor', 'mapGridColor', 'mapRiverColor', 'railSteelColor', 'railActiveColor',
        'tieNormalColor', 'tieActiveColor', 'pinLockedBg', 'pinLockedFg', 'pinActiveBg',
        'pinActiveFg', 'pinActiveRing', 'pinDoneBg', 'pinDoneFg', 'pinDoneRing',
        'labelBgColor', 'labelTextColor', 'labelLockedColor', 'locoColor',
        'locoAccentColor', 'locoWindowColor', 'locoLightColor',
        'mapRailWidth', 'mapTieSize', 'mapTieThickness', 'mapTieSpacing',
        'mapPinRadius', 'mapTopicPinRadius'
    ],
    'tokens/spacing.ts': [
        // Genel layout
        'borderRadius', 'buttonPadding', 'buttonBorderRadius', 'buttonHeight',
        'buttonVerticalMargin', 'buttonContainerPaddingHorizontal', 'buttonContainerPaddingBottom',
        'headerHeight', 'headerTopMargin', 'headerBottomMargin',
        'buttonContainerTopMargin', 'buttonContainerMarginLeft',
        // Buton koordinatları
        'buttonWidth', 'buttonMarginTop', 'buttonMarginLeft', 'buttonGap',
        // Header koordinatları
        'headerTitleMarginTop', 'headerTitleMarginLeft', 'headerTitleWidth', 'headerTitleHeight',
        'headerSubtitleMarginTop', 'headerSubtitleMarginLeft', 'headerSubtitleWidth', 'headerSubtitleHeight',
        // Proverbs koordinatları
        'proverbsMarginTop', 'proverbsMarginLeft', 'proverbsWidth', 'proverbsHeight',
        // Mascot - Ana ekran
        'mascotHomeTop', 'mascotHomeMarginLeft', 'mascotHomeSize',
        // Mascot - Soru ekranı (genel fallback)
        'mascotQuestionTop', 'mascotQuestionMarginLeft', 'mascotQuestionSize',
        // Mascot - 9 soru tipinin tamamı
        'mascotQuestionTop', 'mascotQuestionMarginLeft', 'mascotQuestionSize',
        'mascotWordOrderTop', 'mascotWordOrderMarginLeft', 'mascotWordOrderSize',
        'mascotMatchingTop', 'mascotMatchingMarginLeft', 'mascotMatchingSize',
        'mascotImageChoiceTop', 'mascotImageChoiceMarginLeft', 'mascotImageChoiceSize',
        'mascotChoiceImageTop', 'mascotChoiceImageMarginLeft', 'mascotChoiceImageSize',
        'mascotDialogueTop', 'mascotDialogueMarginLeft', 'mascotDialogueSize',
        'mascotDinlemeTop', 'mascotDinlemeMarginLeft', 'mascotDinlemeSize',
        'mascotGorselEslesirmeTop', 'mascotGorselEslesirmeMarginLeft', 'mascotGorselEslesirmeSize',
        'mascotSentenceCompletionTop', 'mascotSentenceCompletionMarginLeft', 'mascotSentenceCompletionSize',
        // Mascot - Image Question (v7.1)
        'mascotImageQuestionTop', 'mascotImageQuestionMarginLeft', 'mascotImageQuestionSize',
        // Soru ekranı metin koordinatları
        'questionTitleMarginTop', 'questionTitleMarginLeft', 'questionTitleWidth', 'questionTitleHeight',
        'questionPromptMarginTop', 'questionPromptMarginBottom', 'questionPromptMarginLeft',
        'questionPromptWidth', 'questionPromptHeight', 'questionPromptPaddingHorizontal',
        'questionOptionsMarginTop', 'questionOptionsMarginBottom', 'questionOptionsMarginLeft',
        'questionOptionsWidth', 'questionOptionsHeight', 'questionOptionsPaddingHorizontal',
        // Soru butonu koordinatları
        'questionBtnMarginTop', 'questionBtnMarginLeft', 'questionBtnWidth', 'questionBtnHeight',
        'questionBtnBorderRadius',
        // Ayarlar koordinatları
        'settingsTitleMarginTop', 'settingsTitleMarginLeft', 'settingsTitleWidth', 'settingsTitleHeight',
        'settingsBackMarginTop', 'settingsBackMarginLeft', 'settingsBackWidth', 'settingsBackHeight', 'settingsBackFontSize',
        'settingsMusicSectionMarginTop', 'settingsMusicSectionMarginLeft', 'settingsMusicSectionWidth', 'settingsMusicSectionHeight',
        'settingsInfoSectionMarginTop', 'settingsInfoSectionMarginLeft', 'settingsInfoSectionWidth', 'settingsInfoSectionHeight',
        'settingsThemeSectionMarginTop', 'settingsThemeSectionMarginLeft', 'settingsThemeSectionWidth', 'settingsThemeSectionHeight',
        // Ayarlar tema seçenekleri
        'settingsThemeItemWidth', 'settingsThemeItemHeight',
        'settingsThemeItem0MarginTop', 'settingsThemeItem0MarginLeft',
        'settingsThemeItem1MarginTop', 'settingsThemeItem1MarginLeft',
        'settingsThemeItem2MarginTop', 'settingsThemeItem2MarginLeft',
        // Ayarlar müzik öğeleri
        'settings_music_item_0MarginTop', 'settings_music_item_0MarginLeft', 'settings_music_item_0Width', 'settings_music_item_0Height',
        'settings_music_item_1MarginTop', 'settings_music_item_1MarginLeft', 'settings_music_item_1Width', 'settings_music_item_1Height',
        // Ayarlar bilgi menüsü öğeleri
        'settings_info_menu_0MarginTop', 'settings_info_menu_0MarginLeft', 'settings_info_menu_0Width', 'settings_info_menu_0Height',
        'settings_info_menu_1MarginTop', 'settings_info_menu_1MarginLeft', 'settings_info_menu_1Width', 'settings_info_menu_1Height',
        'settings_info_menu_2MarginTop', 'settings_info_menu_2MarginLeft', 'settings_info_menu_2Width', 'settings_info_menu_2Height',
        // Köşe yuvarlaklıkları
        'settingsMenuBorderRadius', 'settingsMusicItemBorderRadius', 'settingsThemeItemBorderRadius',
        'settingsInfoMenuBorderRadius', 'settingsContentBoxBorderRadius', 'settingsMusicToggleBorderRadius',
        'settingsMusicSliderBorderRadius',
        // TopBar koordinatları
        'topBarPaddingHorizontal', 'topBarPaddingTop', 'topBarPaddingBottom', 'topBarDropdownWidth',
        'topBarFlagWidth', 'topBarFlagHeight', 'topBarHelperMarginLeft'
    ],
    'tokens/typography.ts': [
        'buttonTextSize', 'headerTitleFontSize', 'headerSubtitleFontSize',
        'questionPromptFontSize', 'questionOptionFontSize', 'questionBtnTextFontSize',
        'questionTitleFontSize', 'proverbsTitleFontSize', 'proverbsTextFontSize', 
        'proverbsTranslationFontSize', 'settingsTitleFontSize', 'settingsMusicSectionTitleFontSize',
        'settingsInfoSectionTitleFontSize', 'settingsMusicItemFontSize', 'settingsInfoItemFontSize',
        'settingsSubHeaderFontSize', 'settingsBackFontSize'
    ],
    'components/questions.ts': [
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
        'questionOptionBgColor', 'questionOptionTextColor', 'questionOptionSelectedBgColor',
        'questionOptionSelectedBorderColor', 'questionOptionSelectedTextColor'
    ],
    'components/settings.ts': [
        'settingsHeaderTitle', 'settingsMusicSectionTitle', 'settingsInfoSectionTitle',
        'settingsTeamTitle', 'settingsDedicationTitle', 'settingsMusicBadgeTitle', 'settingsMusicVolumeTitle'
    ],
    'components/header.ts': ['headerTitleText', 'headerSubtitleText', 'headerTitleAlign', 'headerSubtitleAlign'],
    'components/proverbs.ts': ['proverbsTitleText'],
    'components/buttons.ts': ['buttonContinueText', 'buttonLogoutText', 'buttonTextAlign']
};



// Ensure directories exist locally
[DATA_DIR, CURRICULUM_DIR, MAP_DIR, THEME_DIR, PROVERBS_DIR, LOCALES_DIR, SETTINGS_DIR, BACKUP_DIR, ARCHIVE_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
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
    const AUTH_KEY = process.env.DATABASE_API_KEY;
    // Note: Fatal check already performed at startup at line 11.

    
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
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { username, password } = JSON.parse(body);
                const usersFile = path.join(DATA_DIR, 'users.json');
                const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
                
                const user = users.find(u => u.username === username && u.password === password);
                
                if (user) {
                    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
                    SESSIONS.set(token, { username: user.username, role: user.role });
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: true, 
                        token, 
                        user: { username: user.username, role: user.role } 
                    }));
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

    // ── GET /status ────────────────────────────────────────────────────────
    if (req.method === 'GET' && req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'ok', 
            version: '2026.03.31.03',
            dataDir: DATA_DIR,
            activeMappingKeys: Object.keys(THEME_MAPPING)
        }));
        return;
    }

    // ── GET /health ────────────────────────────────────────────────────────
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString(), port: PORT }));
        return;
    }

    // ── GET /data ──────────────────────────────────────────────────────────
    if (req.method === 'GET' && req.url === '/data') {
        try {
            const dirs = { 
                mapDir: MAP_DIR, 
                curriculumDir: CURRICULUM_DIR, 
                themeDir: THEME_DIR, 
                proverbsDir: PROVERBS_DIR, 
                localesDir: LOCALES_DIR, 
                settingsDir: SETTINGS_DIR 
            };
            const payload = aggregationManager.buildFullPayload(dirs);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(payload));
        } catch (err) {
            logger.error(`[GET /data] Fatal Error: ${err.message}`);
            logger.error(err.stack);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // ── GET /api/v1/sync ──────────────────────────────────────────────────
    if (req.method === 'GET' && req.url === '/api/v1/sync') {
        // Redirection to /data for now as both return full state
        // but this allows for future divergence (e.g. diff-based sync)
        req.url = '/data';
        // We'll jump to the next handler if we were using a middleware stack,
        // but here we just re-run the /data logic or redirect.
        // For simplicity, we'll just handle it here by calling a helper or similar.
    }

    // ── GET /assets ───────────────────────────────────────────────────────
    if (req.method === 'GET' && req.url === '/assets') {
        try {
            const assetsDir = path.join(__dirname, 'assets');
            logger.info('Scanning assets in:', assetsDir);

            if (!fs.existsSync(assetsDir)) {
               res.writeHead(200, { 'Content-Type': 'application/json' });
               res.end(JSON.stringify({ assets: [] }));
               return;
            }

            const getFiles = (dir, base = '') => {
                let results = [];
                try {
                    const list = fs.readdirSync(dir);
                    list.forEach(file => {
                        if (file.startsWith('.')) return; // Ignore hidden files
                        const filePath = path.join(dir, file);
                        const relPath = path.join(base, file).replace(/\\/g, '/');
                        const stat = fs.statSync(filePath);
                        if (stat && stat.isDirectory()) {
                            results = results.concat(getFiles(filePath, relPath));
                        } else {
                            results.push(relPath);
                        }
                    });
                } catch (e) {
                    logger.error('Error reading dir:', dir, e.message);
                }
                return results;
            };

            const allFiles = getFiles(assetsDir);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ assets: allFiles }));
        } catch (err) {
            logger.error('Fatal Assets Error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }


    // Static File Serving (GET)

    if (req.method === 'GET') {
        const decodedUrl = decodeURIComponent(req.url);
        const pathname = decodedUrl.split('?')[0]; // Query parametrelerini temizle
        const relativePath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
        let filePath;
        // Mascot redirection: serve from ZazaLingo app folder
        if (relativePath.startsWith('assets/mascot/')) {
            const mascotFileName = relativePath.replace('assets/mascot/', '');
            filePath = path.join(__dirname, '../ZazaLingo/assets/mascot', mascotFileName);
        } else {
            filePath = path.join(__dirname, relativePath === '' ? 'index.html' : relativePath);
        }


        
        // Loglama (dosya varsa logla)
        if (req.url !== '/favicon.ico') {
            logger.info(`[Dev Server] Requesting: ${relativePath}`);
            logger.info(`[Dev Server] Resolved Path: ${filePath}`);
        }
        
        // Güvenlik: __dirname dışına çıkılmasını engelle (Mascot assets are allowed in ZazaLingo sibling dir)
        const allowedPath = path.join(__dirname, '../ZazaLingo/assets/mascot').toLowerCase();
        const isMascotRequest = filePath.toLowerCase().startsWith(allowedPath);
        
        if (!filePath.toLowerCase().startsWith(__dirname.toLowerCase()) && !isMascotRequest) {
            logger.warn(`[Security] Blocked access to: ${filePath}`);
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }

        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.wasm': 'application/wasm',
            '.avif': 'image/avif',
            '.webp': 'image/webp'
        };

        const contentType = mimeTypes[extname] || 'application/octet-stream';

        // Check if path is a directory (prevents EISDIR)
        fs.stat(filePath, (statusErr, stats) => {
            if (statusErr || stats.isDirectory()) {
                res.writeHead(404);
                res.end('Not found or is a directory');
                return;
            }

            fs.readFile(filePath, (error, content) => {
                if (error) {
                    logger.error(`[Dev Server] 500 Error reading: ${filePath}`, error.code);
                    res.writeHead(500);
                    res.end('Server Error: ' + error.code);
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content);
                }
            });
        });
        return;

    }

    if (req.method === 'POST' && req.url === '/save') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                logger.info(`\n💾 [SAVE] Request received at ${new Date().toLocaleTimeString()}`);
                logger.info(`   - Keys present in payload: ${Object.keys(data).join(', ')}`);
                if (data.theme) {
                    logger.info(`   - Theme properties being saved: ${Object.keys(data.theme).length} items`);
                }

                saveDataToFiles(data);
                if (data.locales) {
                    saveLocalesToFiles(data.locales);
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
                logger.info('✅ [SUCCESS] All data written to disk successfully.');
            } catch (err) {
                logger.error(`[POST /save] Fatal Error: ${err.message}`);
                logger.error(err.stack);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
    } else if (req.method === 'POST' && req.url === '/saveLocales') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                saveLocalesToFiles(data);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
                logger.info('✅ Dev server: Dil dosyaları başarıyla güncellendi.');
            } catch (err) {
                logger.error(`[POST /saveLocales] Fatal Error: ${err.message}`);
                logger.error(err.stack);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
    }); // End of httpLogger
});

function saveDataToFiles({ stations, tests, proverbs, decorations, mapConfig, theme, themeSchemes, info, zazaConstants }) {
    // 1. Save Map Content (stations, decorations, config)
        syncManager.injectDataIntoTSFile(path.join('map', 'stations.ts'), 'courseLevels', stations, 
            `export const courseLevels = {{DATA}};`);

        syncManager.injectDataIntoTSFile(path.join('map', 'decorations.ts'), 'decorations', decorations, 
            `export const decorations = {{DATA}};`);

        syncManager.injectDataIntoTSFile(path.join('map', 'config.ts'), 'mapConfig', mapConfig, 
            `export const mapConfig = {{DATA}};`);

        // JSON parity sync for BUG-007
        syncManager.injectJSONAtomic(path.join('map', 'stations.json'), stations);
        syncManager.injectJSONAtomic(path.join('map', 'decorations.json'), decorations);
        syncManager.injectJSONAtomic(path.join('map', 'config.json'), mapConfig);

    // 2. Save Tests (Hierarchical: curriculum/Unit/Topic/testId.ts)
    if (!fs.existsSync(CURRICULUM_DIR)) {
        fs.mkdirSync(CURRICULUM_DIR, { recursive: true });
    }

    const testIds = Object.keys(tests || {});
    const currentTestFiles = new Set(['index.ts']);

    // Use CurriculumManager to resolve tests to Unit/Topic hierarchy
    const testToPathMap = curriculumManager.resolveTestPaths(stations);

    let indexContent = `import { TestData } from '../../types/question';\n\n`;

    for (const testId of testIds) {
        const test = tests[testId];
        const relativeFolderPath = testToPathMap[testId] || 'diger';
        const folderPath = path.join(CURRICULUM_DIR, relativeFolderPath);
        
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const fileName = `${testId.toLowerCase()}.ts`;
        const testExportName = curriculumManager.getSafeExportName(testId);
        const posixPath = path.join(relativeFolderPath, fileName).replace(/\\/g, '/');
        
        currentTestFiles.add(posixPath.toLowerCase());

        // Use safe injection for individual test files
        syncManager.injectDataIntoTSFile(path.join('curriculum', posixPath), testExportName, test, 
            `import { TestData } from '../../../types/question';\n\nexport const ${testExportName}: TestData = {{DATA}};\n`);
        
        indexContent += `import { ${testExportName} } from './${posixPath.replace('.ts', '')}';\n`;
    }

    indexContent += `\nexport const TESTS: Record<string, TestData> = {\n`;
    testIds.forEach(tid => {
        const testExportName = curriculumManager.getSafeExportName(tid);
        indexContent += `    ${tid}: ${testExportName},\n`;
    });
    indexContent += `};\n`;

    // 3. Save Proverbs
    if (proverbs) {
        syncManager.injectDataIntoTSFile(path.join('proverbs', 'proverbs.ts'), 'proverbs', proverbs, 
            `export const proverbs = {{DATA}};`);
        syncManager.injectJSONAtomic(path.join('proverbs', 'proverbs.json'), proverbs);
    }

    // 4. Save Theme (Modular)
    if (theme) {
        for (const [relativePath, keys] of Object.entries(THEME_MAPPING)) {
            const partData = {};
            keys.forEach(k => { if (k in theme) partData[k] = theme[k]; });
            const varName = path.basename(relativePath, '.ts');
            // Theme files don't strictly need the interface import since they are tokens, 
            // but we use a flexible template that matches existing style
            syncManager.injectDataIntoTSFile(path.join('theme', relativePath), varName, partData, 
                `export const ${varName} = {{DATA}};`);
        }

        // Keep themeConfig.json as fallback source of truth
        syncManager.injectJSONAtomic(path.join('theme', 'themeConfig.json'), theme);
        logger.info('[Theme] Modular files and themeConfig.json updated in both DB and Mobile.');
    }

    // 4b. Save Theme Schemes
    if (themeSchemes) {
        syncManager.injectJSONAtomic(path.join('theme', 'themeSchemes.json'), themeSchemes);
        logger.info('[Theme] themeSchemes.json updated in both DB and Mobile.');
    }

    // 5. Save Info (Modular Settings)
    if (info) {
        syncManager.injectDataIntoTSFile(path.join('settings', 'info.ts'), 'zazaLingoInfo', info, 
            `export const zazaLingoInfo = {{DATA}};`);
    }

    // 6. Save ZazaConstants (Modular Settings)
    if (zazaConstants) {
        syncManager.injectDataIntoTSFile(path.join('settings', 'zazaConstants.ts'), 'zazaConstants', zazaConstants, 
            `export const zazaConstants = {{DATA}};`);
    }
    
    // 7. Sync users.json for hash parity
    if (fs.existsSync(path.join(DATA_DIR, 'users.json'))) {
        syncManager.syncFile('users.json');
    }
}

function saveLocalesToFiles(locales) {
    if (!fs.existsSync(LOCALES_DIR)) {
        fs.mkdirSync(LOCALES_DIR, { recursive: true });
    }

    const langs = ['Tr', 'En', 'Zz', 'Kr'];
    for (const lang of langs) {
        if (locales[lang]) {
            syncManager.injectDataIntoTSFile(path.join('locales', `${lang}.ts`), lang, locales[lang], 
                `import { Locale } from '../../types/locales';\n\nexport const ${lang}: Locale = {{DATA}};`);
            syncManager.injectJSONAtomic(path.join('locales', `${lang}.json`), locales[lang]);
        }
    }
}

    // Cleanup old locales folder if it's at root
    const oldLocalesDir = path.join(__dirname, 'locales');
    if (oldLocalesDir !== LOCALES_DIR && fs.existsSync(oldLocalesDir)) {
        // We probably shouldn't delete it automatically until we update imports
    }

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        logger.info(`⚠️ Port ${PORT} is already in use. Dev server may already be running.`);
    } else {
        logger.error('❌ Server error:', err);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    logger.info(`[Dev Tools] Save server running at http://localhost:${PORT}`);
    logger.info('You can now save changes directly from the ZazaLingo Admin Panel.');
});
