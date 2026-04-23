const logger = require('../logger');

/**
 * AtomicWriter
 * Responsible for safe file operations with retry logic and atomic replacements.
 * Uses FileSystemAdapter for disk I/O (DIP).
 */
class AtomicWriter {
    constructor(fsAdapter) {
        this.fs = fsAdapter;
        this.config = { retrySettings: { maxRetries: 5, delay: 150 }, cleanupSettings: { maxAgeMinutes: 10 } };
    }

    setConfig(config) {
        if (config) {
            if (config.retrySettings) this.config.retrySettings = config.retrySettings;
            if (config.cleanupSettings) this.config.cleanupSettings = config.cleanupSettings;
        }
    }

    /**
     * Internal helper for retryable file operations.
     */
    async retry(operation, args) {
        const { maxRetries, delay } = this.config.retrySettings;
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return operation.apply(this.fs, args);
            } catch (err) {
                lastError = err;
                if (err.code === 'EPERM' || err.code === 'EBUSY') {
                    logger.warn(`[AtomicWriter] Retrying ${operation.name} due to ${err.code} (${i + 1}/${maxRetries}): ${args[0]}`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw err;
            }
        }
        throw lastError;
    }

    /**
     * Writes content to a file atomically using a temporary file.
     */
    async writeAtomic(filePath, content, encoding = 'utf-8') {
        const tempPath = `${filePath}.tmp`;
        
        // Ensure directory exists
        this.fs.mkdir(this.fs.dirname(filePath));

        // Cleanup stale temp file
        if (this.fs.exists(tempPath)) {
            const stats = this.fs.stat(tempPath);
            if (stats && (Date.now() - stats.mtimeMs < 30000)) {
                throw new Error(`[AtomicWriter] Locked: .tmp file recently modified for ${filePath}`);
            }
            await this.retry(this.fs.unlink, [tempPath]);
        }

        await this.retry(this.fs.writeFile, [tempPath, content, encoding]);
        await this.retry(this.fs.rename, [tempPath, filePath]);
        
        logger.info(`[AtomicWriter] Success: Atomically written ${this.fs.basename(filePath)}`);

        // Windows handle release delay
        if (process.platform === 'win32') {
            await new Promise(r => setTimeout(r, 50));
        }
    }

    /**
     * Cleanup strategy for orphan .tmp files (SRP).
     */
    cleanupOrphanTempFiles(dirPath) {
        const maxAge = this.config.cleanupSettings.maxAgeMinutes;
        if (!this.fs.exists(dirPath)) return;

        const scan = (d) => {
            const items = this.fs.readdir(d);
            items.forEach(item => {
                const full = this.fs.join(d, item);
                const stats = this.fs.stat(full);
                if (!stats) return;

                if (stats.isDirectory()) scan(full);
                else if (item.endsWith('.tmp')) {
                    if ((Date.now() - stats.mtimeMs) / 60000 > maxAge) {
                        this.fs.unlink(full);
                        logger.info(`[AtomicWriter] Cleaned orphan temp: ${full}`);
                    }
                }
            });
        };
        scan(dirPath);
    }
}

module.exports = AtomicWriter;
