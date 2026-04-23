const logger = require('./logger');

/**
 * SyncManager (Facade / Orchestrator)
 * Coordinates data persistence, backups, and mirror synchronization.
 * Implements SOLID (SRP, DIP) by delegating to specialized services.
 */
class SyncManager {
    constructor(fsAdapter, atomicWriter, backupService, mirrorService, tsInjection) {
        this.fs = fsAdapter;
        this.atomicWriter = atomicWriter;
        this.backupService = backupService;
        this.mirrorService = mirrorService;
        this.tsInjection = tsInjection;
        this.primaryPath = null;
    }

    /**
     * Registers sync targets. First is Primary, others are mirrors.
     */
    addTarget(dirPath, enableBackup = false) {
        if (!this.primaryPath) {
            this.primaryPath = dirPath;
            this.fs.mkdir(dirPath);
            this.enablePrimaryBackup = enableBackup;
            logger.info(`[SyncManager] SSoT Primary registered: ${dirPath}`);
        } else {
            this.mirrorService.addMirror(dirPath);
        }
    }

    setBackupDir(dirPath) {
        this.backupService.setBackupDir(dirPath);
    }

    /**
     * Facade: High-level TS data injection.
     */
    async injectDataIntoTSFile(relativePath, variableName, data, templateIfNotFound = null) {
        if (!this.primaryPath) throw new Error('[SyncManager] Primary path not set');

        const filePath = this.fs.join(this.primaryPath, relativePath);
        const jsonStr = JSON.stringify(data, null, 4);

        if (!jsonStr || jsonStr === 'null') throw new Error(`[SyncManager] Invalid data for ${filePath}`);

        try {
            let content;
            const existing = this.fs.readFile(filePath);

            if (!existing) {
                if (!templateIfNotFound) throw new Error(`[SyncManager] Missing template for new file: ${filePath}`);
                content = templateIfNotFound.replace('{{DATA}}', jsonStr);
            } else {
                if (this.enablePrimaryBackup) await this.backupService.createBackup(filePath);
                content = this.tsInjection.performInjection(existing, variableName, jsonStr, templateIfNotFound);
            }

            await this.atomicWriter.writeAtomic(filePath, content);
            return await this.mirrorService.syncFile(filePath, relativePath);

        } catch (err) {
            logger.error(`[SyncManager] TS Injection failed for ${relativePath}: ${err.message}`);
            throw err;
        }
    }

    /**
     * Facade: High-level JSON writing.
     */
    async injectJSONAtomic(relativePath, data) {
        if (!this.primaryPath) throw new Error('[SyncManager] Primary path not set');

        const filePath = this.fs.join(this.primaryPath, relativePath);
        const jsonStr = JSON.stringify(data, null, 4);

        try {
            if (this.enablePrimaryBackup) await this.backupService.createBackup(filePath);
            await this.atomicWriter.writeAtomic(filePath, jsonStr);
            return await this.mirrorService.syncFile(filePath, relativePath);
        } catch (err) {
            logger.error(`[SyncManager] JSON Injection failed for ${relativePath}: ${err.message}`);
            throw err;
        }
    }

    async syncFile(relativePath) {
        if (!this.primaryPath) throw new Error('[SyncManager] Primary path not set');
        const primaryFilePath = this.fs.join(this.primaryPath, relativePath);
        return await this.mirrorService.syncFile(primaryFilePath, relativePath);
    }

    pruneMirrors(safeList = []) {
        if (!this.primaryPath) return;
        this.mirrorService.prune(this.primaryPath, safeList);
    }

    cleanupOrphanTempFiles() {
        if (!this.primaryPath) return;
        const targets = [this.primaryPath, ...this.mirrorService.mirrors];
        targets.forEach(dir => this.atomicWriter.cleanupOrphanTempFiles(dir));
    }
}

module.exports = SyncManager;
