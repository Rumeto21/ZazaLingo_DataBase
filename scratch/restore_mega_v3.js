const fs = require('fs');

const STATION_BACKUP = 'backups/stations.ts.2026-04-24T19-22-43-911Z.bak';
const DECO_BACKUP = 'backups/decorations.ts.2026-04-24T17-12-16-642Z.bak';

const TARGETS = {
    stationsTS: 'data/map/stations.ts',
    stationsJSON: 'data/map/stations.json',
    decorationsTS: 'data/map/decorations.ts',
    decorationsJSON: 'data/map/decorations.json'
};

const HEX_MAP = [
    { hex: 'c383c283c382c2ae', replace: 'î' }, // Triple î
    { hex: 'c383c283c382c2aa', replace: 'ê' }, // Triple ê
    { hex: 'c383c283c382c2bb', replace: 'û' }, // Triple û
    { hex: 'c383c283c382c2a7', replace: 'ç' }, // Triple ç
    { hex: 'c383c283c382c2b6', replace: 'ö' }, // Triple ö
    { hex: 'c383c283c382c2bc', replace: 'ü' }, // Triple ü
    { hex: 'c383c282c2bc', replace: 'ü' },     // Double ü variant
    { hex: 'c383c282c2b6', replace: 'ö' },     // Double ö variant
    { hex: 'c383c2a2c280c2a2', replace: '→' }, // Mangled arrow
    { hex: 'efbfbd', replace: 'u' }            // Replacement char (best guess for Pülümür -> Pulumur)
];

function restoreBinary(source, targetTS, targetJSON) {
    console.log(`📖 Reading backup (Binary): ${source}`);
    let buf = fs.readFileSync(source);
    let hex = buf.toString('hex');

    HEX_MAP.forEach(m => {
        const regex = new RegExp(m.hex, 'g');
        hex = hex.replace(regex, Buffer.from(m.replace, 'utf8').toString('hex'));
    });

    let restoredBuf = Buffer.from(hex, 'hex');
    let content = restoredBuf.toString('utf8');

    // Normalize imports
    content = content.replace(/import { LevelData } from '@zazalingo\/shared'/g, "import { LevelData } from '../../types/data'");

    fs.writeFileSync(targetTS, content, 'utf8');
    console.log(`✅ Restored TS: ${targetTS}`);

    // Extract JSON
    const startMatch = content.match(/=\s*([\[\{]+)/m);
    if (startMatch) {
        const startPos = startMatch.index + startMatch[0].length - startMatch[1].length;
        let jsonStr = content.substring(startPos).trim();
        if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
        try {
            const data = eval(`(${jsonStr})`);
            fs.writeFileSync(targetJSON, JSON.stringify(data, null, 4), 'utf8');
            console.log(`✅ Restored JSON: ${targetJSON}`);
        } catch (e) {
            console.error(`❌ JSON error: ${e.message}`);
        }
    }
}

restoreBinary(STATION_BACKUP, TARGETS.stationsTS, TARGETS.stationsJSON);
restoreBinary(DECO_BACKUP, TARGETS.decorationsTS, TARGETS.decorationsJSON);
