const fs = require('fs');
const path = require('path');

const STATION_BACKUP = 'backups/stations.ts.2026-04-24T19-22-43-911Z.bak';
const DECO_BACKUP = 'backups/decorations.ts.2026-04-24T17-12-16-642Z.bak';

const TARGETS = {
    stationsTS: 'data/map/stations.ts',
    stationsJSON: 'data/map/stations.json',
    decorationsTS: 'data/map/decorations.ts',
    decorationsJSON: 'data/map/decorations.json'
};

// Mapping for Double/Triple Mangled UTF-8
const MAP = [
    { search: /ÃƒÂ®/g, replace: 'î' },
    { search: /ÃƒÂª/g, replace: 'ê' },
    { search: /ÃƒÂ»/g, replace: 'û' },
    { search: /ÃƒÂ§/g, replace: 'ç' },
    { search: /ÃƒÂ¶/g, replace: 'ö' },
    { search: /ÃƒÂ¼/g, replace: 'ü' },
    { search: /Ã…ÂŸ/g, replace: 'ş' },
    { search: /Ã„ÂŸ/g, replace: 'ğ' },
    { search: /Ã„Â°/g, replace: 'İ' },
    { search: /Ã¯Â¿Â½/g, replace: 'u' }, // Fallback for mangled 'ü' or 'ö' if possible
    { search: /Ãƒâ€¡/g, replace: 'Ç' },
    { search: /Ãƒâ€“/g, replace: 'Ö' },
    { search: /ÃƒÅ“/g, replace: 'Ü' },
    { search: /ÃƒÅ½/g, replace: 'Î' },
    { search: /ÃƒÅ /g, replace: 'Ê' },
    { search: /Ãƒâ€º/g, replace: 'Û' }
];

function restoreFile(source, targetTS, targetJSON) {
    console.log(`📖 Reading backup: ${source}`);
    let content = fs.readFileSync(source, 'utf8');

    // 1. Fix Mojibake
    MAP.forEach(m => {
        content = content.replace(m.search, m.replace);
    });

    // 2. Normalize Imports if any
    content = content.replace(/import { LevelData } from '@zazalingo\/shared'/g, "import { LevelData } from '../../types/data'");

    // 3. Write TS
    fs.writeFileSync(targetTS, content, 'utf8');
    console.log(`✅ Restored TS: ${targetTS}`);

    // 4. Extract JSON and write
    const startMatch = content.match(/=\s*([\[\{]+)/m);
    if (startMatch) {
        const startPos = startMatch.index + startMatch[0].length - startMatch[1].length;
        // Simple extraction for JSON (assume everything till last semicolon or end)
        let jsonStr = content.substring(startPos).trim();
        if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
        
        try {
            const data = eval(`(${jsonStr})`); // Using eval to handle non-strict JS objects in TS
            fs.writeFileSync(targetJSON, JSON.stringify(data, null, 4), 'utf8');
            console.log(`✅ Restored JSON: ${targetJSON}`);
        } catch (e) {
            console.error(`❌ Failed to parse JSON for ${targetJSON}: ${e.message}`);
        }
    }
}

console.log('🚀 Starting THE GREAT DATA RECONSTRUCTION...');

// Create directories
[path.dirname(TARGETS.stationsTS)].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

restoreFile(STATION_BACKUP, TARGETS.stationsTS, TARGETS.stationsJSON);
restoreFile(DECO_BACKUP, TARGETS.decorationsTS, TARGETS.decorationsJSON);

console.log('🏁 Reconstruction sequence complete.');
