const fs = require('fs');
const path = require('path');

const BACKUP_FILE = 'backups/info.ts.2026-04-24T19-22-44-028Z.bak';
const TARGETS = [
    { ts: 'data/curriculum/info.ts', json: 'data/curriculum/info.json' },
    { ts: 'data/settings/info.ts', json: 'data/settings/info.json' }
];

const HEX_MAP = [
    { hex: 'c383c284c382c2b0', replace: 'İ' },
    { hex: 'c383c284c382c2b1', replace: 'ı' },
    { hex: 'c383c285c382c29e', replace: 'Ş' },
    { hex: 'c383c285c382c29f', replace: 'ş' },
    { hex: 'c383c283c382c2ae', replace: 'î' },
    { hex: 'c383c283c382c2bc', replace: 'ü' },
    { hex: 'c383c283c382c2b6', replace: 'ö' },
    { hex: 'c383c283c382c2a7', replace: 'ç' },
    { hex: 'c383c284c382c29f', replace: 'ğ' },
    { hex: 'c383c284c29f', replace: 'ğ' },
    { hex: 'c384c29f', replace: 'ğ' },
    { hex: 'c383c283c382c287', replace: 'Ç' },
    { hex: 'c383c282c2bc', replace: 'ü' },
    { hex: 'c383c282c2b6', replace: 'ö' }
];

console.log('🚀 Restoring Info to DUAL TARGETS with HEX PATTERNS...');

let buf = fs.readFileSync(BACKUP_FILE);
let hex = buf.toString('hex');

HEX_MAP.forEach(m => {
    const regex = new RegExp(m.hex, 'g');
    hex = hex.replace(regex, Buffer.from(m.replace, 'utf8').toString('hex'));
});

let restoredBuf = Buffer.from(hex, 'hex');
let content = restoredBuf.toString('utf8');

// Surgical String Fixes
content = content.replace(/Ã„ÂŸ/g, 'ğ');
content = content.replace(/ÃƒÂ‡/g, 'Ç');
content = content.replace(/Ã…ÂŸ/g, 'ş');
content = content.replace(/Ã…Âž/g, 'Ş');
content = content.replace(/Ã„Â°/g, 'İ');
content = content.replace(/Ã„Â±/g, 'ı');

TARGETS.forEach(t => {
    fs.writeFileSync(t.ts, content, 'utf8');
    console.log(`✅ Restored TS: ${t.ts}`);

    const startMatch = content.match(/=\s*([\[\{]+)/m);
    if (startMatch) {
        const startPos = startMatch.index + startMatch[0].length - startMatch[1].length;
        let jsonStr = content.substring(startPos).trim();
        if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
        try {
            const data = eval(`(${jsonStr})`);
            fs.writeFileSync(t.json, JSON.stringify(data, null, 4), 'utf8');
            console.log(`✅ Restored JSON: ${t.json}`);
        } catch (e) {
            console.error(`❌ JSON error for ${t.json}.`);
        }
    }
});

console.log('🏁 Dual restoration complete.');
