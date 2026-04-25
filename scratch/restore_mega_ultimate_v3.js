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
    { hex: 'c383c283c382c2ae', replace: 'î' }, 
    { hex: 'c383c283c382c2aa', replace: 'ê' }, 
    { hex: 'c383c283c382c2bb', replace: 'û' }, 
    { hex: 'c383c283c382c2a7', replace: 'ç' }, 
    { hex: 'c383c283c382c2b6', replace: 'ö' }, 
    { hex: 'c383c283c382c2bc', replace: 'ü' },
    { hex: 'c383c282c2bc', replace: 'ü' },     
    { hex: 'c383c282c2b6', replace: 'ö' },     
    { hex: 'c383c285c382c29f', replace: 'ş' }, // Triple ş variant 1
    { hex: 'c383c285c382c2ac', replace: 'ş' }, // Triple ş variant 2
    { hex: 'c385c2ac', replace: 'ş' },         // Double ş variant
    { hex: 'c383c284c29f', replace: 'ğ' },     
    { hex: 'c384c29f', replace: 'ğ' },         
    { hex: 'c383c283c382c287', replace: 'Ç' }, 
    { hex: 'c383c286c292c383c282c2a7', replace: 'ç' },
    { hex: 'c383c286c292c383c282c2ae', replace: 'î' }, 
    { hex: 'c3afc2bfc2bd', replace: 'u' },     
    { hex: 'efbfbd', replace: 'u' }            
];

function restoreBinary(source, targetTS, targetJSON) {
    console.log(`📖 Processing: ${source}`);
    let buf = fs.readFileSync(source);
    let hex = buf.toString('hex');

    HEX_MAP.forEach(m => {
        const regex = new RegExp(m.hex, 'g');
        hex = hex.replace(regex, Buffer.from(m.replace, 'utf8').toString('hex'));
    });

    let restoredBuf = Buffer.from(hex, 'hex');
    let content = restoredBuf.toString('utf8');

    content = content.replace(/import { LevelData } from '@zazalingo\/shared'/g, "import { LevelData } from '../../types/data'");

    fs.writeFileSync(targetTS, content, 'utf8');
    console.log(`✅ Restored TS: ${targetTS}`);

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
            console.error(`❌ JSON error.`);
        }
    }
}

restoreBinary(STATION_BACKUP, TARGETS.stationsTS, TARGETS.stationsJSON);
restoreBinary(DECO_BACKUP, TARGETS.decorationsTS, TARGETS.decorationsJSON);
