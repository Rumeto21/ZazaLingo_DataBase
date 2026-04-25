const fs = require('fs');
const path = require('path');

const BACKUP_DIR = 'backups';
const TARGET_DIR = 'data/curriculum';

if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const files = fs.readdirSync(BACKUP_DIR);
const testBackups = files.filter(f => f.startsWith('test_') && f.endsWith('.bak'));

// Group by test ID
const groups = {};
testBackups.forEach(f => {
    const id = f.split('.ts.')[0];
    if (!groups[id]) groups[id] = [];
    groups[id].push(f);
});

console.log('🚀 Restoring Curriculum Data...');

Object.keys(groups).forEach(id => {
    // Sort by date (filename contains ISO date)
    const sorted = groups[id].sort().reverse();
    const latest = sorted[0];
    const sourcePath = path.join(BACKUP_DIR, latest);
    const targetPath = path.join(TARGET_DIR, id + '.ts');
    const targetJsonPath = path.join(TARGET_DIR, id + '.json');

    console.log(`📦 Restoring ${id} from ${latest}`);
    
    // Read and fix imports/mojibake if needed
    let content = fs.readFileSync(sourcePath, 'utf8');
    
    // Triple-mangled fix (using high-level replaces for speed, as tests are mostly code)
    content = content.replace(/c383c283c382c2ae/g, 'î'); // Wait, tests are UTF-8 usually
    // But let's apply the same logic just in case
    
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log(`✅ Restored TS: ${targetPath}`);

    // Generate JSON
    try {
        const startMatch = content.match(/=\s*([\[\{]+)/m);
        if (startMatch) {
            const startPos = startMatch.index + startMatch[0].length - startMatch[1].length;
            let jsonStr = content.substring(startPos).trim();
            if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
            
            // Handle some common TS-to-JSON issues (like trailing commas if any)
            const data = eval(`(${jsonStr})`);
            fs.writeFileSync(targetJsonPath, JSON.stringify(data, null, 4), 'utf8');
            console.log(`✅ Restored JSON: ${targetJsonPath}`);
        }
    } catch (e) {
        console.error(`⚠️ JSON generation failed for ${id}: ${e.message}`);
    }
});

console.log('🏁 Curriculum restoration complete.');
