require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const logger = require('./logger');
const syncManager = require('./SyncManager');
const httpLogger = morgan('dev');

// Classes (DIP)
const FileSystemAdapter = require('./FileSystemAdapter');
const AggregationReader = require('./AggregationReader');
const AggregationAssembler = require('./AggregationAssembler');
const AggregationManager = require('./AggregationManager');
const CurriculumManager = require('./CurriculumManager');
const SaveRegistry = require('./SaveRegistry');
const SchemaValidator = require('./SchemaValidator');

// Handlers (OCP)
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

// --- Initialization (DIP Construction) ---
const fsAdapter = new FileSystemAdapter(syncManager);
const aggReader = new AggregationReader(fsAdapter);
const aggAssembler = new AggregationAssembler(aggReader, fsAdapter);
const aggregationManager = new AggregationManager(aggReader, aggAssembler);
const curriculumManager = new CurriculumManager(fsAdapter);

// --- Registry Setup (OCP) ---
const saveRegistry = new SaveRegistry();
saveRegistry.register('stations', new StationsHandler());
saveRegistry.register('decorations', new DecorationsHandler());
saveRegistry.register('mapConfig', new MapConfigHandler());
saveRegistry.register('tests', new CurriculumHandler(curriculumManager));
saveRegistry.register('proverbs', new ProverbsHandler());
saveRegistry.register('theme', new ThemeHandler());
saveRegistry.register('themeSchemes', new ThemeSchemesHandler());
saveRegistry.register('info', new InfoHandler());
saveRegistry.register('zazaConstants', new ZazaConstantsHandler());
saveRegistry.register('locales', new LocalesHandler());

// SyncManager Setup
syncManager.setBackupDir(BACKUP_DIR);
syncManager.addTarget(DATA_DIR, true);
// --- v8.0 SSoT Migration: Tight Coupling disabled ---
const MOBILE_DATA_DIR = process.env.MOBILE_DATA_DIR || path.join(__dirname, '../ZazaLingo/data');
if (fs.existsSync(MOBILE_DATA_DIR)) {
    syncManager.addTarget(MOBILE_DATA_DIR, false);
    logger.info(`[Sync] Mobile Data Sync ENABLED: ${MOBILE_DATA_DIR}`);
}



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

    // ── GET /data ──────────────────────────────────────────────────────────
    if (req.method === 'GET' && req.url === '/data') {
        try {
            const dirs = { mapDir: MAP_DIR, curriculumDir: CURRICULUM_DIR, themeDir: THEME_DIR, proverbsDir: PROVERBS_DIR, localesDir: LOCALES_DIR, settingsDir: SETTINGS_DIR };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(aggregationManager.buildFullPayload(dirs)));
        } catch (err) {
            logger.error(`[GET /data] Error: ${err.message}`);
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
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body);
                
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

                const context = { 
                    adapter: fsAdapter, 
                    stations: payload.stations, 
                    curriculumDir: CURRICULUM_DIR, 
                    archiveDir: ARCHIVE_DIR, 
                    localesDir: LOCALES_DIR,
                    themeDir: THEME_DIR,
                    dataDir: DATA_DIR
                };
                await saveRegistry.process(payload, context);
                if (fs.existsSync(path.join(DATA_DIR, 'users.json'))) syncManager.syncFile('users.json');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
                logger.info(`✅ [Registry] Save successful for: ${req.url}`);
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
