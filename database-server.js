const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;
// Paths for central storage
const DATA_DIR = path.join(__dirname, 'data');
const CURRICULUM_DIR = path.join(DATA_DIR, 'curriculum');
const MAP_DIR = path.join(DATA_DIR, 'map');
const THEME_DIR = path.join(DATA_DIR, 'theme');
const PROVERBS_DIR = path.join(DATA_DIR, 'proverbs');
const LOCALES_DIR = path.join(DATA_DIR, 'locales');
const SETTINGS_DIR = path.join(DATA_DIR, 'settings');

// Ensure directories exist locally
[DATA_DIR, CURRICULUM_DIR, MAP_DIR, THEME_DIR, PROVERBS_DIR, LOCALES_DIR, SETTINGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

/**
 * Safely injects JSON data into a TypeScript file.
 */
function injectDataIntoTSFile(relativePath, variableName, data, templateIfNotFound = null) {
    const filePath = path.join(DATA_DIR, relativePath);
    
    // Ensure parent directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        if (templateIfNotFound) {
            fs.writeFileSync(filePath, templateIfNotFound.replace('{{DATA}}', JSON.stringify(data, null, 4)), 'utf-8');
            console.log(`[SafeWrite] Created new file: ${path.relative(process.cwd(), filePath)}`);
        }
        return;
    }

    const src = fs.readFileSync(filePath, 'utf-8');
    const regex = new RegExp(`(export\\s+(const|let|var)\\s+${variableName}(\\s*:\\s*[^=]+)?\\s*=\\s*)([\\s\\S]+?)(;?\\s*$)`);
    
    if (regex.test(src)) {
        const updated = src.replace(regex, `$1${JSON.stringify(data, null, 4)}$5`);
        fs.writeFileSync(filePath, updated, 'utf-8');
        console.log(`[SafeWrite] Updated: ${path.relative(process.cwd(), filePath)}`);
    } else {
        console.warn(`[SafeWrite] Could not find variable '${variableName}' in ${filePath}. Falling back to overwrite.`);
        if (templateIfNotFound) {
            fs.writeFileSync(filePath, templateIfNotFound.replace('{{DATA}}', JSON.stringify(data, null, 4)), 'utf-8');
        }
    }
}

const SESSIONS = new Map(); // token -> user object

const server = http.createServer((req, res) => {
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
    const AUTH_KEY = process.env.DATABASE_API_KEY || 'zaza_dev_secret_2026';
    const clientKey = req.headers['x-api-key'];
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const isAuthenticated = (clientKey === AUTH_KEY) || (bearerToken && SESSIONS.has(bearerToken));

    // Protected endpoints (Write operations)
    if (req.method === 'POST' && req.url !== '/login') {
        if (!isAuthenticated) {
            console.warn(`[Security] Blocked unauthorized POST attempt to ${req.url} from ${req.socket.remoteAddress}`);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized: Valid X-API-KEY or Authorization header required' }));
            return;
        }
    }

    // ── POST /upload ────────────────────────────────────────────────────────
    if (req.method === 'POST' && req.url === '/upload') {
        const fileName = req.headers['x-filename'];
        if (!fileName) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Missing X-FileName header' }));
            return;
        }

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
            console.log(`[Upload] Received and saved: ${fileName} -> ${targetSubDir}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                path: `assets/questions/${targetSubDir}/${fileName}` 
            }));
        });

        fileStream.on('error', (err) => {
            console.error('[Upload] Error saving file:', err);
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
                    console.log(`[Auth] User logged in: ${username}`);
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

    // ── GET /health ────────────────────────────────────────────────────────
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString(), port: PORT }));
        return;
    }

    // ── GET /data ──────────────────────────────────────────────────────────
    if (req.method === 'GET' && req.url === '/data') {
        try {
            // Dynamically require each data module and return as JSON
            // We read raw TS files by extracting the JSON payload after 'export const X =' 
            const readTSExport = (filePath) => {
                if (!fs.existsSync(filePath)) return null;
                const src = fs.readFileSync(filePath, 'utf-8');
                // Find last '= ' followed by JSON-like content
                const match = src.match(/=\s*(\[|\{)[\s\S]*$/m);
                if (!match) return null;
                try { return JSON.parse(match[0].replace(/^=\s*/, '').replace(/;\s*$/, '')); } catch { return null; }
            };

            const readLocale = (lang) => {
                const p = path.join(LOCALES_DIR, `${lang}.ts`);
                if (!fs.existsSync(p)) return {};
                const src = fs.readFileSync(p, 'utf-8');
                const match = src.match(/=\s*(\{)[\s\S]*$/m);
                if (!match) return {};
                try { return JSON.parse(match[0].replace(/^=\s*/, '').replace(/;\s*$/, '')); } catch { return {}; }
            };

            const payload = {
                stations: readTSExport(path.join(MAP_DIR, 'stations.ts')),
                decorations: readTSExport(path.join(MAP_DIR, 'decorations.ts')),
                mapConfig: readTSExport(path.join(MAP_DIR, 'config.ts')),
                proverbs: readTSExport(path.join(PROVERBS_DIR, 'proverbs.ts')),
                theme: readTSExport(path.join(THEME_DIR, 'theme.ts')),
                info: readTSExport(path.join(SETTINGS_DIR, 'info.ts')),
                zazaConstants: readTSExport(path.join(SETTINGS_DIR, 'zazaConstants.ts')),
                locales: {
                    tr: readLocale('tr'),
                    en: readLocale('en'),
                    zzk: readLocale('zzk'),
                    krmnc: readLocale('krmnc'),
                }
            };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(payload));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // ── GET /assets ───────────────────────────────────────────────────────
    if (req.method === 'GET' && req.url === '/assets') {
        try {
            const assetsDir = path.join(__dirname, 'assets');
            console.log('Scanning assets in:', assetsDir);

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
                    console.error('Error reading dir:', dir, e.message);
                }
                return results;
            };

            const allFiles = getFiles(assetsDir);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ assets: allFiles }));
        } catch (err) {
            console.error('Fatal Assets Error:', err);
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
        let filePath = path.join(__dirname, relativePath === '' ? 'index.html' : relativePath);
        
        // Loglama (dosya varsa logla)
        if (req.url !== '/favicon.ico') {
            console.log(`[Dev Server] Serving: ${relativePath}`);
        }
        
        // Güvenlik: __dirname dışına çıkılmasını engelle (Case-insensitive check for Windows)
        if (!filePath.toLowerCase().startsWith(__dirname.toLowerCase())) {
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
                    res.writeHead(500);
                    res.end('Server Error: ' + error.code);
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
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
                saveDataToFiles(data);
                // Also save locales if provided in the same payload
                if (data.locales) {
                    saveLocalesToFiles(data.locales);
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
                console.log('✅ Dev server: Tüm veriler (locales dahil) başarıyla kaydedildi.');
            } catch (err) {
                console.error('❌ Dev server hatası:', err);
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
                console.log('✅ Dev server: Dil dosyaları başarıyla güncellendi.');
            } catch (err) {
                console.error('❌ Dev server locale hatası:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

function saveDataToFiles({ stations, tests, proverbs, decorations, mapConfig, theme, info, zazaConstants }) {
    // 1. Save Map Content (stations, decorations, config)
    if (stations) {
        injectDataIntoTSFile(path.join('map', 'stations.ts'), 'courseLevels', stations, 
            `export const courseLevels = {{DATA}};`);
    }

    if (decorations) {
        injectDataIntoTSFile(path.join('map', 'decorations.ts'), 'decorations', decorations, 
            `export const decorations = {{DATA}};`);
    }

    if (mapConfig) {
        injectDataIntoTSFile(path.join('map', 'config.ts'), 'mapConfig', mapConfig, 
            `export const mapConfig = {{DATA}};`);
    }

    // 2. Save Tests (Hierarchical: curriculum/Unit/Topic/testId.ts)
    if (!fs.existsSync(CURRICULUM_DIR)) {
        fs.mkdirSync(CURRICULUM_DIR, { recursive: true });
    }

    const testIds = Object.keys(tests || {});
    const currentTestFiles = new Set(['index.ts']);

    // Map testIds to Unit/Topic hierarchy
    const testToPathMap = {};
    const unitMap = {};
    
    // First pass: map units
    (stations || []).forEach(s => {
        if (s.type === 'station') {
            unitMap[s.id] = `Unite_${s.unitIndex || s.id}`;
        }
    });

    // Second pass: map topics to units and tests to topics
    (stations || []).forEach(s => {
        if (s.type === 'topic') {
            const unitFolder = unitMap[s.parentUnitId] || 'diger';
            const topicFolder = (s.zazaName || s.trName || s.id).replace(/[^a-zA-Z0-9]/g, '_');
            const targetPath = path.join(unitFolder, topicFolder);
            
            if (s.testIds) {
                s.testIds.forEach(tid => {
                    testToPathMap[tid] = targetPath;
                });
            }
        }
    });

    let indexContent = `// Bu dosya Dev Server tarafından otomatik güncellenmiştir.\nimport { TestData } from '../../types/question';\n\n`;

    for (const testId of testIds) {
        const test = tests[testId];
        const relativeFolderPath = testToPathMap[testId] || 'diger';
        const folderPath = path.join(CURRICULUM_DIR, relativeFolderPath);
        
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const fileName = `${testId.toLowerCase()}.ts`;
        const testExportName = testId.replace(/[^a-zA-Z0-9]/g, '_');
        const posixPath = path.join(relativeFolderPath, fileName).replace(/\\/g, '/');
        
        currentTestFiles.add(posixPath.toLowerCase());

        // Use safe injection for individual test files
        injectDataIntoTSFile(path.join('curriculum', posixPath), testExportName, test, 
            `import { TestData } from '../../../types/question';\n\nexport const ${testExportName}: TestData = {{DATA}};\n`);
        
        indexContent += `import { ${testExportName} } from './${posixPath.replace('.ts', '')}';\n`;
    }

    indexContent += `\nexport const TESTS: Record<string, TestData> = {\n`;
    testIds.forEach(tid => {
        const testExportName = tid.replace(/[^a-zA-Z0-9]/g, '_');
        indexContent += `    ${tid}: ${testExportName},\n`;
    });
    indexContent += `};\n`;

    const localIndex = path.join(CURRICULUM_DIR, 'index.ts');
    fs.writeFileSync(localIndex, indexContent, 'utf-8');

    // Cleanup Tests
    function cleanupTests(dir, baseDir = '') {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        const safeCurrentFiles = currentTestFiles;

        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const relativePath = path.join(baseDir, file).replace(/\\/g, '/');
            
            if (fs.statSync(fullPath).isDirectory()) {
                cleanupTests(fullPath, relativePath);
                if (fs.existsSync(fullPath) && fs.readdirSync(fullPath).length === 0) {
                    fs.rmdirSync(fullPath);
                }
            } else if (file.endsWith('.ts') && file !== 'index.ts') {
                if (!safeCurrentFiles.has(relativePath.toLowerCase())) {
                    fs.unlinkSync(fullPath);
                    console.log(`[Cleanup] Deleted old test file: ${relativePath}`);
                }
            }
        });
    }
    cleanupTests(CURRICULUM_DIR);

    // 3. Save Proverbs
    if (proverbs) {
        injectDataIntoTSFile(path.join('proverbs', 'proverbs.ts'), 'proverbs', proverbs, 
            `export const proverbs = {{DATA}};`);
    }

    // 4. Save Theme
    if (theme) {
        injectDataIntoTSFile(path.join('theme', 'theme.ts'), 'themeConfig', theme, 
            `export const themeConfig = {{DATA}};`);
        
        // sync themeConfig.json (JSON is always a complete overwrite)
        const localThemeJSON = path.join(THEME_DIR, 'themeConfig.json');
        fs.writeFileSync(localThemeJSON, JSON.stringify(theme, null, 4), 'utf-8');
        
        console.log('[Theme] Both theme.ts and themeConfig.json updated.');
    }

    // 5. Save Info (Modular Settings)
    if (info) {
        injectDataIntoTSFile(path.join('settings', 'info.ts'), 'zazaLingoInfo', info, 
            `export const zazaLingoInfo = {{DATA}};`);
    }

    // 6. Save ZazaConstants (Modular Settings)
    if (zazaConstants) {
        injectDataIntoTSFile(path.join('settings', 'zazaConstants.ts'), 'zazaConstants', zazaConstants, 
            `export const zazaConstants = {{DATA}};`);
    }
    
    // Cleanup legacy files logic remains same but we can keep it for safety
}

function saveLocalesToFiles(locales) {
    if (!fs.existsSync(LOCALES_DIR)) {
        fs.mkdirSync(LOCALES_DIR, { recursive: true });
    }

    const langs = ['tr', 'en', 'zzk', 'krmnc'];
    for (const lang of langs) {
        if (locales[lang]) {
            injectDataIntoTSFile(path.join('locales', `${lang}.ts`), lang, locales[lang], 
                `export const ${lang} = {{DATA}};`);
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
        console.log(`⚠️ Port ${PORT} is already in use. Dev server may already be running.`);
    } else {
        console.error('❌ Server error:', err);
    }
});

server.listen(PORT, () => {
    console.log(`[Dev Tools] Save server running at http://localhost:${PORT}`);
    console.log('You can now save changes directly from the ZazaLingo Admin Panel.');
});
