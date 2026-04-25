const fs = require('fs');
const path = require('path');

const CURRICULUM_DIR = 'data/curriculum';
const DIGER_DIR = path.join(CURRICULUM_DIR, 'diger');
const INDEX_FILE = path.join(CURRICULUM_DIR, 'index.ts');

function polishFile(filePath) {
    console.log(`✨ Polishing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Extraction
    const startMatch = content.match(/=\s*([\[\{]+)/m);
    if (!startMatch) return null;
    
    const startPos = startMatch.index + startMatch[0].length - startMatch[1].length;
    let jsonStr = content.substring(startPos).trim();
    if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
    
    try {
        let data = eval(`(${jsonStr})`);
        
        // Check if empty
        if (!data.questions || data.questions.length === 0) {
            console.log(`🗑️ Empty module detected: ${data.id}`);
            return 'DELETE';
        }
        
        // Polish questions
        data.questions = data.questions.map(q => {
            if (q.options && q.options.length > 0 && q.correctOptionId) {
                const index = q.options.findIndex(o => o.id === q.correctOptionId);
                if (index !== -1) {
                    q.correctOptionIndex = index;
                }
            }
            return q;
        });
        
        // Update both versions
        const newJson = JSON.stringify(data, null, 4);
        const exportName = content.match(/export const (test_.*?)[:\s]/)[1];
        const newTs = `import { TestData } from '@zazalingo/shared';\n\nexport const ${exportName}: TestData = ${newJson};\n`;
        
        fs.writeFileSync(filePath, newTs, 'utf8');
        fs.writeFileSync(filePath.replace('.ts', '.json'), newJson, 'utf8');
        return 'SUCCESS';
    } catch (e) {
        console.error(`❌ Error polishing ${filePath}: ${e.message}`);
        return 'ERROR';
    }
}

// 1. Process files
const files = fs.readdirSync(CURRICULUM_DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts');
const digerFiles = fs.existsSync(DIGER_DIR) ? fs.readdirSync(DIGER_DIR).filter(f => f.endsWith('.ts')) : [];

const deletedIds = [];

files.forEach(f => {
    const res = polishFile(path.join(CURRICULUM_DIR, f));
    if (res === 'DELETE') {
        const id = f.replace('.ts', '');
        fs.unlinkSync(path.join(CURRICULUM_DIR, f));
        if (fs.existsSync(path.join(CURRICULUM_DIR, id + '.json'))) fs.unlinkSync(path.join(CURRICULUM_DIR, id + '.json'));
        deletedIds.push(id);
    }
});

digerFiles.forEach(f => {
    const res = polishFile(path.join(DIGER_DIR, f));
    if (res === 'DELETE') {
        const id = f.replace('.ts', '');
        fs.unlinkSync(path.join(DIGER_DIR, f));
        if (fs.existsSync(path.join(DIGER_DIR, id + '.json'))) fs.unlinkSync(path.join(DIGER_DIR, id + '.json'));
        deletedIds.push(id); // Note: we'll handle index cleanup carefully
    }
});

// 2. Update index.ts
let indexContent = fs.readFileSync(INDEX_FILE, 'utf8');
deletedIds.forEach(id => {
    // Remove import
    const importRegex = new RegExp(`import { .*? } from './.*?/${id}';\n?`, 'g');
    indexContent = indexContent.replace(importRegex, '');
    const importRegex2 = new RegExp(`import { .*? } from './${id}';\n?`, 'g');
    indexContent = indexContent.replace(importRegex2, '');
    
    // Remove from TESTS object
    const entryRegex = new RegExp(`"${id}": .*?,\n?`, 'g');
    indexContent = indexContent.replace(entryRegex, '');
});

fs.writeFileSync(INDEX_FILE, indexContent, 'utf8');
console.log(`✅ Index updated. Deleted: ${deletedIds.join(', ')}`);
