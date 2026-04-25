const FileSystemAdapter = require('../FileSystemAdapter');
const AggregationReader = require('../AggregationReader');
const path = require('path');

const fsAdapter = new FileSystemAdapter();
const reader = new AggregationReader(fsAdapter);

const dataDir = path.join(__dirname, '../data');
let totalFiles = 0;
let failedFiles = 0;

function walk(dir) {
    const items = fsAdapter.readdir(dir);
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fsAdapter.stat(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (item.endsWith('.ts')) {
            totalFiles++;
            const data = reader.readTSExport(fullPath);
            if (data === null) {
                // Ignore empty exports or index files if they don't have '=' sign
                const content = fsAdapter.readFile(fullPath);
                if (content.includes('=')) {
                    console.error(`❌ Parse Failed: ${fullPath}`);
                    failedFiles++;
                }
            } else {
                // console.log(`✅ Parsed: ${fullPath}`);
            }
        }
    });
}

console.log('🚀 Starting Data Integrity Audit...');
walk(dataDir);
console.log(`\n🏁 Audit Complete.`);
console.log(`Total TS Files: ${totalFiles}`);
console.log(`Failed: ${failedFiles}`);

if (failedFiles > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
