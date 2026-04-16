const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const syncManager = require('./SyncManager');

/**
 * CurriculumManager
 * Handles hierarchical test storage, indexing, and cleanup.
 */
class CurriculumManager {
    getTestToPathMap(stations) {
        const testToPathMap = {};
        const unitMap = {};
        
        // Map units
        (stations || []).forEach(s => {
            if (s.type === 'station') {
                unitMap[s.id] = `Unite_${s.unitIndex || s.id}`;
            }
        });

        // Map topics to units and tests to topics
        (stations || []).forEach(s => {
            if (s.type === 'topic') {
                const unitFolder = unitMap[s.parentUnitId] || 'diger';
                const topicFolder = (s.ZzName || s.TrName || s.id).replace(/[^a-zA-Z0-9]/g, '_');
                const targetPath = path.join(unitFolder, topicFolder);
                
                if (s.testIds) {
                    s.testIds.forEach(tid => {
                        testToPathMap[tid] = targetPath;
                    });
                }
            }
        });
        return testToPathMap;
    }

    saveTests(curriculumDir, tests, testToPathMap, archiveDir) {
        if (!fs.existsSync(curriculumDir)) {
            fs.mkdirSync(curriculumDir, { recursive: true });
        }

        const testIds = Object.keys(tests || {});
        const currentTestFiles = new Set(['index.ts']);
        let indexContent = `import { TestData } from '../../types/question';\n\n`;

        for (const testId of testIds) {
            const test = tests[testId];
            const relativeFolderPath = testToPathMap[testId] || 'diger';
            const folderPath = path.join(curriculumDir, relativeFolderPath);
            
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            const fileName = `${testId.toLowerCase()}.ts`;
            const testExportName = testId.replace(/[^a-zA-Z0-9]/g, '_');
            const posixPath = path.join(relativeFolderPath, fileName).replace(/\\/g, '/');
            
            currentTestFiles.add(posixPath.toLowerCase());

            // Safe injection into the curriculum file
            syncManager.injectDataIntoTSFile(
                path.join('curriculum', posixPath), 
                testExportName, 
                test, 
                `import { TestData } from '../../../types/question';\n\nexport const ${testExportName}: TestData = {{DATA}};\n`
            );
            
            indexContent += `import { ${testExportName} } from './${posixPath.replace('.ts', '')}';\n`;
        }

        indexContent += `\nexport const TESTS: Record<string, TestData> = {\n`;
        testIds.forEach(tid => {
            const testExportName = tid.replace(/[^a-zA-Z0-9]/g, '_');
            indexContent += `    ${tid}: ${testExportName},\n`;
        });
        indexContent += `};\n`;

        const localIndex = path.join(curriculumDir, 'index.ts');
        fs.writeFileSync(localIndex, indexContent, 'utf-8');
        
        // Sync the index file
        syncManager.syncFile(path.join('curriculum', 'index.ts'));

        // Cleanup
        this.archiveOldTests(curriculumDir, currentTestFiles, archiveDir);
    }

    archiveOldTests(dir, currentTestFiles, archiveDir, baseDir = '') {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const relativePath = path.join(baseDir, file).replace(/\\/g, '/');
            
            if (fs.statSync(fullPath).isDirectory()) {
                this.archiveOldTests(fullPath, currentTestFiles, archiveDir, relativePath);
                if (fs.existsSync(fullPath) && fs.readdirSync(fullPath).length === 0) {
                    fs.rmdirSync(fullPath);
                }
            } else if (file.endsWith('.ts') && file !== 'index.ts') {
                if (!currentTestFiles.has(relativePath.toLowerCase())) {
                    const archivedPath = path.join(archiveDir, `${Date.now()}_${file}`);
                    fs.renameSync(fullPath, archivedPath);
                    logger.info(`[CurriculumManager] Archived old test: ${relativePath}`);
                }
            }
        });
    }
}

module.exports = new CurriculumManager();
