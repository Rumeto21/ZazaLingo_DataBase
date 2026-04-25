const fs = require('fs');

const BACKUP_FILE = 'backups/info.ts.2026-04-24T19-22-44-028Z.bak';
const TARGET_TS = 'data/curriculum/info.ts';
const TARGET_JSON = 'data/curriculum/info.json';

console.log('🚀 Restoring Info & Dedication Data...');

let content = fs.readFileSync(BACKUP_FILE, 'utf8');

// Mojibake Fixes (Double-encoded patterns)
const FIX_MAP = [
    { from: /Ã„Â°/g, to: 'İ' },
    { from: /Ã„Â±/g, to: 'ı' },
    { from: /Ã…Âž/g, to: 'Ş' },
    { from: /Ã…ÂŸ/g, to: 'ş' },
    { from: /ÃƒÂ®/g, to: 'î' },
    { from: /ÃƒÂ¼/g, to: 'ü' },
    { from: /ÃƒÂ¶/g, to: 'ö' },
    { from: /ÃƒÂ§/g, to: 'ç' },
    { from: /Ã„ÂŸ/g, to: 'ğ' },
    { from: /AyarlarÃ„Â±/g, to: 'Ayarları' },
    { from: /HakkÃ„Â±nda/g, to: 'Hakkında' }
];

FIX_MAP.forEach(f => {
    content = content.replace(f.from, f.to);
});

// Sync Target
fs.writeFileSync(TARGET_TS, content, 'utf8');
console.log(`✅ Restored TS: ${TARGET_TS}`);

// Generate JSON
const startMatch = content.match(/=\s*([\[\{]+)/m);
if (startMatch) {
    const startPos = startMatch.index + startMatch[0].length - startMatch[1].length;
    let jsonStr = content.substring(startPos).trim();
    if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
    try {
        const data = eval(`(${jsonStr})`);
        fs.writeFileSync(TARGET_JSON, JSON.stringify(data, null, 4), 'utf8');
        console.log(`✅ Restored JSON: ${TARGET_JSON}`);
    } catch (e) {
        console.error(`❌ JSON error: ${e.message}`);
    }
}

console.log('🏁 Info restoration complete.');
