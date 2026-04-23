const path = require('path');
const logger = require('./logger');
const fsAdapter = require('./FileSystemAdapter');

/**
 * CurriculumManager
 * Handles hierarchical test storage, indexing, and cleanup.
 */
class CurriculumManager {
    constructor(adapter = fsAdapter) {
        this.fs = adapter;
    }

    resolveTestPaths(stations) {
        const testToPathMap = {};
        const unitMap = {};
        
        // Map units (e.g., 'l01' -> 'Unite_1')
        (stations || []).forEach(s => {
            if (s.type === 'station') {
                unitMap[s.id] = `Unite_${s.unitIndex || s.id}`;
            }
        });

        // Map topics to units and tests to topics
        if (!Array.isArray(stations)) return testToPathMap;

        stations.forEach(unit => {
            const unitFolder = unit.id || 'UnknownUnit';
            if (unit.topics && Array.isArray(unit.topics)) {
                unit.topics.forEach(topic => {
                    const topicFolder = topic.id || 'UnknownTopic';
                    if (topic.tests && Array.isArray(topic.tests)) {
                        topic.tests.forEach(test => {
                            const testId = typeof test === 'string' ? test : test.id;
                            if (testId) {
                                testToPathMap[testId.toLowerCase()] = path.join(unitFolder, topicFolder);
                            }
                        });
                    }
                });
            }
        });
        return testToPathMap;
    }

    /**
     * Sanitizes export names for TypeScript compatibility.
     */
    getSafeExportName(id) {
        return 'test_' + id.replace(/[^a-zA-Z0-9]/g, '_');
    }

    /**
     * Centralized saving logic for tests.
     */
    async saveTests(curriculumDir, stations, tests, archiveDir) {
        this.fs.mkdir(curriculumDir);
        const testIds = Object.keys(tests || {});
        const currentTestFiles = new Set(['index.ts']);
        const testToPathMap = this.resolveTestPaths(stations);
        const syncResults = [];

        let indexContent = `import { TestData } from '@zazalingo/shared';\n\n`;

        for (const testId of testIds) {
            const test = tests[testId];
            const relativeFolderPath = testToPathMap[testId.toLowerCase()] || 'diger';
            const folderPath = path.join(curriculumDir, relativeFolderPath);
            
            this.fs.mkdir(folderPath);

            const fileName = `${testId.toLowerCase()}.ts`;
            const testExportName = this.getSafeExportName(testId);
            const posixPath = path.join(relativeFolderPath, fileName).replace(/\\/g, '/');
            
            currentTestFiles.add(posixPath.toLowerCase());

            // Use adapter injection for individual test files
            const res = await this.fs.injectData(path.join('curriculum', posixPath), testExportName, test, 
                `import { TestData } from '@zazalingo/shared';\n\nexport const ${testExportName}: TestData = {{DATA}};\n`);
            syncResults.push(res);
            
            indexContent += `import { ${testExportName} } from './${posixPath.replace('.ts', '')}';\n`;
        }

        indexContent += `\nexport const TESTS: Record<string, TestData> = {\n`;
        testIds.forEach(tid => {
            const testExportName = this.getSafeExportName(tid);
            indexContent += `    "${tid}": ${testExportName},\n`;
        });
        indexContent += `};\n`;

        await this.fs.writeFile(path.join(curriculumDir, 'index.ts'), indexContent);
        const indexSyncRes = await this.fs.syncFile(path.join('curriculum', 'index.ts'));
        syncResults.push(indexSyncRes);

        await this.archiveOldTests(curriculumDir, currentTestFiles, archiveDir);

        const validResults = syncResults.filter(r => r);
        const errors = validResults.flatMap(r => r.errors || []);
        return {
            success: validResults.every(r => r.success),
            partial: validResults.some(r => r.partial) || errors.length > 0,
            errors
        };
    }

    /**
     * Archives files that are no longer in the curriculum metadata.
     */
    async archiveOldTests(curriculumDir, currentFiles, archiveDir) {
        const scan = async (dir, rel = '') => {
            const items = this.fs.readdir(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const relPath = path.join(rel, item).replace(/\\/g, '/');
                if (this.fs.stat(fullPath).isDirectory()) {
                    await scan(fullPath, relPath);
                } else if (!currentFiles.has(relPath.toLowerCase())) {
                    const archivePath = path.join(archiveDir, 'curriculum', relPath);
                    this.fs.mkdir(path.dirname(archivePath));
                    await this.fs.rename(fullPath, archivePath);
                    logger.info(`[CurriculumManager] Archived orphaned test: ${relPath}`);
                }
            }
        };
        await scan(curriculumDir);
    }
}

module.exports = CurriculumManager;
