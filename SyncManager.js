const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class SyncManager {
    constructor() {
        this.targets = []; // target[0] is always Primary (Source of Truth)
        this.backupDir = null;
        this.pruneSafeList = ['layoutEngine.ts', 'themeAxisConfig.ts']; // Critical files that must NEVER be pruned
    }

    /**
     * Registers a synchronization target directory.
     * @param {string} dirPath The absolute path to the target directory.
     * @param {boolean} enableBackup Whether to enable backups for this target before writes.
     */
    addTarget(dirPath, enableBackup = false) {
        if (!fs.existsSync(dirPath)) {
            try {
                fs.mkdirSync(dirPath, { recursive: true });
            } catch (err) {
                logger.error(`[SyncManager] Failed to create target directory ${dirPath}: ${err.message}`);
                return;
            }
        }
        this.targets.push({ path: dirPath, backup: enableBackup });
        logger.info(`[SyncManager] Registered sync target: ${dirPath} (Primary: ${this.targets.length === 1})`);
    }

    setBackupDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        this.backupDir = dirPath;
    }

    /**
     * Internal helper for retryable file operations (Async)
     */
    async _retry(operation, args, maxRetries = 5, delay = 150) {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return operation(...args);
            } catch (err) {
                lastError = err;
                if (err.code === 'EPERM' || err.code === 'EBUSY') {
                    logger.warn(`[SyncManager] Retrying ${operation.name} due to ${err.code} (${i + 1}/${maxRetries}): ${args[0]}`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw err;
            }
        }
        throw lastError;
    }

    /**
     * Internal helper to clone a file from primary to all mirrors
     */
    async _cloneToMirrors(relativePath) {
        if (this.targets.length < 2) return;
        
        const primaryTarget = this.targets[0];
        const primaryFile = path.join(primaryTarget.path, relativePath);
        
        if (!fs.existsSync(primaryFile)) {
            logger.warn(`[SyncManager] Skip cloning missing primary file: ${primaryFile}`);
            return;
        }

        for (let i = 1; i < this.targets.length; i++) {
            const mirrorTarget = this.targets[i];
            const mirrorFile = path.join(mirrorTarget.path, relativePath);
            try {
                const dir = path.dirname(mirrorFile);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                
                await this._retry(fs.copyFileSync, [primaryFile, mirrorFile]);
                logger.info(`[SyncManager] Cloned to mirror: ${mirrorFile}`);
            } catch (err) {
                logger.error(`[SyncManager] Failed to clone to ${mirrorFile}: ${err.message}`);
            }
        }
    }

    /**
     * Safely writes data to a TS file across all registered targets.
     * Performs injection ONLY on Primary, then clones results to mirrors.
     */
    async injectDataIntoTSFile(relativePath, variableName, data, templateIfNotFound = null) {
        if (this.targets.length === 0) {
            throw new Error('[SyncManager] No targets registered');
        }

        const primaryTarget = this.targets[0];
        const filePath = path.join(primaryTarget.path, relativePath);

        try {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            const jsonStr = JSON.stringify(data, null, 4);
            if (!jsonStr || jsonStr === 'null' || jsonStr === 'undefined') {
                throw new Error(`[SyncManager] Blocked invalid data for ${filePath}`);
            }

            const tempPath = `${filePath}.tmp`;
            if (fs.existsSync(tempPath)) {
                if (Date.now() - fs.statSync(tempPath).mtimeMs < 30000) {
                    throw new Error(`[SyncManager] Locked: TS .tmp file recently modified for ${filePath}`);
                }
                await this._retry(fs.unlinkSync, [tempPath]);
            }

            if (!fs.existsSync(filePath)) {
                if (templateIfNotFound) {
                    const content = templateIfNotFound.replace('{{DATA}}', jsonStr);
                    await this._retry(fs.writeFileSync, [filePath, content, 'utf-8']);
                    logger.info(`[SyncManager] Created Primary: ${filePath}`);
                } else {
                    throw new Error(`[SyncManager] Cannot create missing file without template: ${filePath}`);
                }
            } else {
                if (primaryTarget.backup && this.backupDir) {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    await this._retry(fs.copyFileSync, [filePath, path.join(this.backupDir, `${path.basename(filePath)}.${timestamp}.bak`)]);
                }

                let src = fs.readFileSync(filePath, 'utf-8');
                const prefixRegex = new RegExp(`(export\\s+(const|let|var)\\s+${variableName}(\\s*:\\s*[^=]+)?\\s*=\\s*)`, 'm');
                const match = src.match(prefixRegex);
                
                let updatedContent;
                if (match) {
                    const prefix = match[1];
                    const startPos = match.index + prefix.length;
                    
                    let braceCount = 0;
                    let endPos = -1;
                    let started = false;
                    for (let i = startPos; i < src.length; i++) {
                        const char = src[i];
                        if (char === '{' || char === '[') { braceCount++; started = true; }
                        if (char === '}' || char === ']') { braceCount--; started = true; }
                        if (started && braceCount === 0) {
                            const nextSemicolon = src.indexOf(';', i);
                            endPos = (nextSemicolon !== -1 && nextSemicolon < i + 5) ? nextSemicolon + 1 : i + 1;
                            break;
                        }
                    }

                    if (endPos !== -1) {
                        updatedContent = src.substring(0, startPos) + jsonStr + (src[endPos - 1] === ';' ? ';' : '') + src.substring(endPos);
                    } else {
                        updatedContent = src.substring(0, startPos) + jsonStr + ';\n';
                    }
                } else if (templateIfNotFound) {
                    updatedContent = templateIfNotFound.replace('{{DATA}}', jsonStr);
                } else {
                    throw new Error(`[SyncManager] Var ${variableName} not found and no template for ${filePath}`);
                }

                await this._retry(fs.writeFileSync, [tempPath, updatedContent, 'utf-8']);
                await this._retry(fs.renameSync, [tempPath, filePath]);
                logger.info(`[SyncManager] Primary updated: ${filePath}`);
            }

            // Lock Awareness: Small delay for Windows to release file handles before mirroring
            if (process.platform === 'win32') {
                await new Promise(r => setTimeout(r, 50));
            }

            // Sync resulting file to all mirrors
            await this._cloneToMirrors(relativePath);

        } catch (err) {
            logger.error(`[SyncManager] Error in injectDataIntoTSFile for ${filePath}: ${err.message}`);
            throw err;
        }
    }

    /**
     * Safely writes JSON data across all registered targets.
     * Updates primary then clones to mirrors.
     */
    async injectJSONAtomic(relativePath, data) {
        if (this.targets.length === 0) {
            throw new Error('[SyncManager] No targets registered for JSON write');
        }

        const primaryTarget = this.targets[0];
        const filePath = path.join(primaryTarget.path, relativePath);

        try {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            const jsonStr = JSON.stringify(data, null, 4);
            if (!jsonStr || jsonStr === 'null') {
                throw new Error(`[SyncManager] JSON error: Invalid or null data for ${filePath}`);
            }

            const tempPath = `${filePath}.tmp`;
            if (fs.existsSync(tempPath)) {
                if (Date.now() - fs.statSync(tempPath).mtimeMs < 30000) {
                    throw new Error(`[SyncManager] Locked: JSON .tmp file recently modified for ${filePath}`);
                }
                await this._retry(fs.unlinkSync, [tempPath]);
            }

            if (primaryTarget.backup && this.backupDir && fs.existsSync(filePath)) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                await this._retry(fs.copyFileSync, [filePath, path.join(this.backupDir, `${path.basename(filePath)}.${timestamp}.bak`)]);
            }

            await this._retry(fs.writeFileSync, [tempPath, jsonStr, 'utf-8']);
            await this._retry(fs.renameSync, [tempPath, filePath]);
            logger.info(`[SyncManager] Primary JSON updated: ${filePath}`);

            // Lock Awareness: Small delay for Windows to release file handles before mirroring
            if (process.platform === 'win32') {
                await new Promise(r => setTimeout(r, 50));
            }

            await this._cloneToMirrors(relativePath);

        } catch (err) {
            logger.error(`[SyncManager] JSON error for ${filePath}: ${err.message}`);
            throw err;
        }
    }

    /**
     * Forced sync of any file from primary to mirrors.
     */
    async syncFile(relativePath) {
        await this._cloneToMirrors(relativePath);
    }

    /**
     * Cleanup strategy for orphan .tmp files.
     */
    cleanupOrphanTempFiles(maxAgeMinutes = 10) {
        this.targets.forEach(target => {
            try {
                if (!fs.existsSync(target.path)) return;
                const scan = (dir) => {
                    const items = fs.readdirSync(dir);
                    items.forEach(item => {
                        const fullPath = path.join(dir, item);
                        const stats = fs.statSync(fullPath);
                        if (stats.isDirectory()) {
                            scan(fullPath);
                        } else if (item.endsWith('.tmp')) {
                            const ageMinutes = (Date.now() - stats.mtimeMs) / (1000 * 60);
                            if (ageMinutes > maxAgeMinutes) {
                                fs.unlinkSync(fullPath);
                                logger.info(`[SyncManager] Cleaned orphan temp file: ${fullPath}`);
                            }
                        }
                    });
                };
                scan(target.path);
            } catch (err) {
                logger.error(`[SyncManager] Cleanup error for ${target.path}: ${err.message}`);
            }
        });
    }

    /**
     * Reconciles Mirrors with Primary by deleting files/directories NOT present in Primary.
     */
    pruneMirrors() {
        if (this.targets.length < 2) return;

        const primaryTarget = this.targets[0];

        for (let i = 1; i < this.targets.length; i++) {
            const mirrorTarget = this.targets[i];
            logger.info(`[SyncManager] Pruning mirror: ${mirrorTarget.path}`);

            const scanAndDeleteExtra = (mirrorDirPath, relPath = '') => {
                if (!fs.existsSync(mirrorDirPath)) return;

                const items = fs.readdirSync(mirrorDirPath);
                items.forEach(item => {
                    const itemRelPath = path.join(relPath, item).replace(/\\/g, '/');
                    const mirrorFilePath = path.join(mirrorDirPath, item);
                    const mirrorStats = fs.statSync(mirrorFilePath);
                    const isSafeListed = this.pruneSafeList.some(safeItem => 
                        itemRelPath === safeItem || itemRelPath.endsWith('/' + safeItem)
                    );
                    const primaryFilePath = path.join(primaryTarget.path, itemRelPath);

                    if (!fs.existsSync(primaryFilePath)) {
                        if (isSafeListed) {
                            logger.info(`[SyncManager] Skipping prune for safe-listed file: ${mirrorFilePath}`);
                            return;
                        }
                        // DELETE from Mirror as it doesn't exist in Primary
                        try {
                            const mirrorStats = fs.statSync(mirrorFilePath);
                            if (mirrorStats.isDirectory()) {
                                // Recursive delete for directory
                                fs.rmSync(mirrorFilePath, { recursive: true, force: true });
                                logger.info(`[SyncManager] Pruned directory: ${mirrorFilePath}`);
                            } else {
                                fs.unlinkSync(mirrorFilePath);
                                logger.info(`[SyncManager] Pruned file: ${mirrorFilePath}`);
                            }
                        } catch (err) {
                            logger.error(`[SyncManager] Prune failed for ${mirrorFilePath}: ${err.message}`);
                        }
                    } else {
                        const mirrorStats = fs.statSync(mirrorFilePath);
                        if (mirrorStats.isDirectory()) {
                            // Recurse into existing directory
                            scanAndDeleteExtra(mirrorFilePath, itemRelPath);
                        }
                    }
                });
            };

            try {
                scanAndDeleteExtra(mirrorTarget.path);
            } catch (err) {
                logger.error(`[SyncManager] Prune error for ${mirrorTarget.path}: ${err.message}`);
            }
        }
    }
}

module.exports = new SyncManager();
