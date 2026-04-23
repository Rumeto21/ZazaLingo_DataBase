const logger = require('../logger');

/**
 * BackupService
 * Handles file backups and directory rotation.
 * Uses FileSystemAdapter for disk I/O (DIP).
 */
class BackupService {
    constructor(fsAdapter, atomicWriter) {
        this.fs = fsAdapter;
        this.atomicWriter = atomicWriter;
        this.backupDir = null;
    }

    /**
     * Initializes the backup directory.
     */
    setBackupDir(dirPath) {
        this.fs.mkdir(dirPath);
        this.backupDir = dirPath;
        logger.info(`[BackupService] Backup directory set to: ${dirPath}`);
    }

    setConfig(config) {
        this.config = config;
    }

    /**
     * Creates a timestamped backup of a file.
     */
    async createBackup(filePath) {
        if (!this.backupDir || !this.fs.exists(filePath)) return null;

        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = this.fs.basename(filePath);
            const backupPath = this.fs.join(this.backupDir, `${fileName}.${timestamp}.bak`);
            
            await this.atomicWriter.retry(this.fs.copy, [filePath, backupPath]);
            logger.info(`[BackupService] Success: Created backup for ${fileName} -> ${this.fs.basename(backupPath)}`);
            return backupPath;
        } catch (err) {
            logger.error(`[BackupService] Failed to create backup for ${filePath}: ${err.message}`);
            return null;
        }
    }

    /**
     * Helper to list backups.
     */
    listBackups() {
        if (!this.backupDir) return [];
        return this.fs.readdir(this.backupDir);
    }
}

module.exports = BackupService;
