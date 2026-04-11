const fs = require('fs');
const path = require('path');
const syncManager = require('../SyncManager');

// Paths
const DATA_DIR = path.resolve(__dirname, '../data');
const MIRROR_DIR = path.resolve(__dirname, '../../ZazaLingo/data');

// Initialize SyncManager with same targets as server
syncManager.addTarget(DATA_DIR, false); 
syncManager.addTarget(MIRROR_DIR, false);

console.log(`--- Starting Full Sync Warmup ---`);
console.log(`Source: ${DATA_DIR}`);
console.log(`Mirror: ${MIRROR_DIR}`);

// Helper to read TS files (copied from database-server.js)
const readTSExport = (filePath) => {
    if (!fs.existsSync(filePath)) return null;
    try {
        const src = fs.readFileSync(filePath, 'utf-8');
        const startMatch = src.match(/=\s*([\[\{]+)/m);
        if (!startMatch) return null;
        const startSearchPos = startMatch.index + startMatch[0].length;
        const brackets = startMatch[1];
        let braceCount = brackets.length;
        let endPos = -1;
        let inString = false;
        let escape = false;

        for (let i = startSearchPos; i < src.length; i++) {
            const char = src[i];
            if (escape) { escape = false; continue; }
            if (char === '\\') { escape = true; continue; }
            if (char === '"' || char === "'") {
                if (!inString) inString = char;
                else if (inString === char) inString = false;
                continue;
            }
            if (inString) continue;
            if (char === '{' || char === '[') braceCount++;
            if (char === '}' || char === ']') braceCount--;
            if (braceCount === 0) {
                endPos = i + 1;
                break;
            }
        }
        if (endPos === -1) return null;
        const jsonContent = src.substring(startMatch.index + startMatch[0].length - brackets.length, endPos);
        return JSON.parse(jsonContent);
    } catch (e) {
        console.error(`[ReadError] ${filePath}:`, e.message);
        return null;
    }
};

// Syncing Map Data
const mapFiles = [
    { file: 'stations.ts', var: 'courseLevels', template: 'export const courseLevels = {{DATA}};' },
    { file: 'decorations.ts', var: 'decorations', template: 'export const decorations = {{DATA}};' },
    { file: 'config.ts', var: 'mapConfig', template: 'export const mapConfig = {{DATA}};' }
];

mapFiles.forEach(f => {
    const data = readTSExport(path.join(DATA_DIR, 'map', f.file));
    if (data) {
        syncManager.injectDataIntoTSFile(path.join('map', f.file), f.var, data, f.template);
        syncManager.injectJSONAtomic(path.join('map', f.file.replace('.ts', '.json')), data);
    }
});

// Syncing Locales
const langs = ['tr', 'en', 'zzk', 'krmnc'];
langs.forEach(lang => {
    const data = readTSExport(path.join(DATA_DIR, 'locales', `${lang}.ts`));
    if (data) {
        syncManager.injectDataIntoTSFile(path.join('locales', `${lang}.ts`), lang, data, 
            `import { Locale } from '../../types/locales';\n\nexport const ${lang}: Locale = {{DATA}};`);
        syncManager.injectJSONAtomic(path.join('locales', `${lang}.json`), data);
    }
});

// Syncing Proverbs
const proverbs = readTSExport(path.join(DATA_DIR, 'proverbs', 'proverbs.ts'));
if (proverbs) {
    syncManager.injectDataIntoTSFile(path.join('proverbs', 'proverbs.ts'), 'proverbs', proverbs, 
        `export const proverbs = {{DATA}};`);
    syncManager.injectJSONAtomic(path.join('proverbs', 'proverbs.json'), proverbs);
}

// Syncing Theme Modular Files
const THEME_MAPPING = {
    'tokens/colors.ts': 'colors',
    'components/map.ts': 'map',
    'tokens/spacing.ts': 'spacing',
    'tokens/typography.ts': 'typography',
    'components/questions.ts': 'questions',
    'components/settings.ts': 'settings',
    'components/header.ts': 'header',
    'components/proverbs.ts': 'proverbs',
    'components/buttons.ts': 'buttons'
};

for (const [relPath, varName] of Object.entries(THEME_MAPPING)) {
    const data = readTSExport(path.join(DATA_DIR, 'theme', relPath));
    if (data) {
        syncManager.injectDataIntoTSFile(path.join('theme', relPath), varName, data, 
            `export const ${varName} = {{DATA}};`);
    }
}

// Sync users.json
if (fs.existsSync(path.join(DATA_DIR, 'users.json'))) {
    syncManager.syncFile('users.json');
}

console.log(`--- Full Sync Warmup Completed ---`);
