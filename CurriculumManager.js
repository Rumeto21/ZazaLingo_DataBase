const path = require('path');
const logger = require('./logger');

/**
 * CurriculumManager
 * Handles hierarchical test storage, indexing, and cleanup.
 * Implements SOLID (DIP, SRP)
 */
class CurriculumManager {
    constructor(fsAdapter, syncManager) {
        this.fs = fsAdapter;
        this.syncManager = syncManager;
    }

    resolveTestPaths(stations) {
        const testToPathMap = {};
        if (!Array.isArray(stations)) return testToPathMap;

        stations.forEach(unit => {
            const unitFolder = unit.id || 'UnknownUnit';
            if (unit.topics && Array.isArray(unit.topics)) {
                topicLoop: for (const topic of unit.topics) {
                    const topicFolder = topic.id || 'UnknownTopic';
                    if (topic.tests && Array.isArray(topic.tests)) {
                        for (const test of topic.tests) {
                            const testId = typeof test === 'string' ? test : test.id;
                            if (testId) {
                                testToPathMap[testId.toLowerCase()] = path.join(unitFolder, topicFolder);
                            }
                        }
                    }
                }
            }
        });
        return testToPathMap;
    }

    getSafeExportName(id) {
        return 'test_' + id.replace(/[^a-zA-Z0-9]/g, '_');
    }

    async saveTests(curriculumDir, stations, tests, archiveDir) {
        this.fs.mkdir(curriculumDir);
        const testIds = Object.keys(tests || {});
        const currentTestFiles = new Set(['index.ts']);
        const testToPathMap = this.resolveTestPaths(stations);
        const results = [];

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

            // Use SyncManager for individual test files (DIP)
            try {
                const res = await this.syncManager.injectDataIntoTSFile(
                    path.join('curriculum', posixPath), 
                    testExportName, 
                    test, 
                    `import { TestData } from '@zazalingo/shared';\n\nexport const ${testExportName}: TestData = {{DATA}};\n`
                );
                results.push(res);
            } catch (err) {
                results.push({ success: false, errors: [err.message] });
            }
            
            indexContent += `import { ${testExportName} } from './${posixPath.replace('.ts', '')}';\n`;
        }

        indexContent += `\nexport const TESTS: Record<string, TestData> = {\n`;
        testIds.forEach(tid => {
            const testExportName = this.getSafeExportName(tid);
            indexContent += `    "${tid}": ${testExportName},\n`;
        });
        indexContent += `};\n`;

        // Save index.ts (Atomic via SyncManager if possible, or direct write)
        try {
            this.fs.writeFile(path.join(curriculumDir, 'index.ts'), indexContent);
            const indexSyncRes = await this.syncManager.syncFile(path.join('curriculum', 'index.ts'));
            results.push(indexSyncRes);
        } catch (err) {
            results.push({ success: false, errors: [err.message] });
        }

        await this.archiveOldTests(curriculumDir, currentTestFiles, archiveDir);

        const errors = results.flatMap(r => r.errors || []);
        return {
            success: results.every(r => r.success),
            partial: results.some(r => r.partial) || errors.length > 0,
            errors
        };
    }

    async archiveOldTests(curriculumDir, currentFiles, archiveDir) {
        // Implementation of archiving (SRP)
        try {
            const allFiles = this._getAllFiles(curriculumDir);
            for (const file of allFiles) {
                const relativePath = path.relative(curriculumDir, file).replace(/\\/g, '/').toLowerCase();
                if (!currentFiles.has(relativePath) && relativePath.endsWith('.ts')) {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const archivePath = path.join(archiveDir, `curriculum_archived_${timestamp}_${path.basename(file)}`);
                    this.fs.mkdir(archiveDir);
                    this.fs.writeFile(archivePath, this.fs.readFile(file));
                    this.fs.unlink(file);
                    logger.info(`[CurriculumManager] Archived orphan test: ${relativePath}`);
                }
            }
        } catch (err) {
            logger.warn(`[CurriculumManager] Archiving failed: ${err.message}`);
        }
    }

    _getAllFiles(dir, fileList = []) {
        const files = this.fs.readdir(dir);
        files.forEach(file => {
            const name = path.join(dir, file);
            const stats = this.fs.stat(name);
            if (stats && stats.isDirectory()) {
                this._getAllFiles(name, fileList);
            } else {
                fileList.push(name);
            }
        });
        return fileList;
    }
}

module.exports = CurriculumManager;
