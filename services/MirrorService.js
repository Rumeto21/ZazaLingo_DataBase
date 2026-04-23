const logger = require('../logger');

/**
 * MirrorService
 * Manages external mirror directories and synchronizes files from Primary.
 * Uses FileSystemAdapter for disk I/O (DIP).
 */
class MirrorService {
    constructor(fsAdapter, atomicWriter) {
        this.fs = fsAdapter;
        this.atomicWriter = atomicWriter;
        this.mirrors = []; // List of absolute paths
    }

    /**
     * Registers a mirror directory.
     */
    addMirror(dirPath) {
        try {
            this.fs.mkdir(dirPath);
            if (!this.mirrors.includes(dirPath)) {
                this.mirrors.push(dirPath);
                logger.info(`[MirrorService] Registered mirror: ${dirPath}`);
            }
        } catch (err) {
            logger.error(`[MirrorService] Failed to register mirror ${dirPath}: ${err.message}`);
        }
    }

    setConfig(config) {
        this.config = config;
    }

    /**
     * Clones a file from a source (Primary) to all registered mirrors.
     * @returns {Promise<{success: boolean, errors: string[]}>}
     */
    async syncFile(primaryFilePath, relativePath) {
        const results = { success: true, errors: [] };
        
        if (!this.fs.exists(primaryFilePath)) {
            const msg = `[MirrorService] Primary file missing: ${primaryFilePath}`;
            logger.warn(msg);
            return { success: false, errors: [msg] };
        }

        for (const mirrorBase of this.mirrors) {
            const mirrorFilePath = this.fs.join(mirrorBase, relativePath);
            try {
                await this.atomicWriter.retry(this.fs.copy, [primaryFilePath, mirrorFilePath]);
                logger.info(`[MirrorService] Success: Synced ${this.fs.basename(mirrorFilePath)}`);
            } catch (err) {
                const msg = `[MirrorService] Failed to sync ${mirrorFilePath}: ${err.message}`;
                logger.error(msg);
                results.success = false;
                results.errors.push(msg);
            }
        }
        return results;
    }

    /**
     * Prunes files in mirrors that do not exist in Primary.
     */
    async prune(primaryBasePath, safeList = []) {
        for (const mirrorBase of this.mirrors) {
            logger.info(`[MirrorService] Pruning mirror: ${mirrorBase}`);
            this._scanAndPrune(mirrorBase, primaryBasePath, '', safeList);
        }
    }

    _scanAndPrune(mirrorDir, primaryBase, relPath, safeList) {
        if (!this.fs.exists(mirrorDir)) return;

        const items = this.fs.readdir(mirrorDir);
        items.forEach(item => {
            const itemRelPath = this.fs.join(relPath, item).replace(/\\/g, '/');
            const mirrorItemPath = this.fs.join(mirrorDir, item);
            const primaryItemPath = this.fs.join(primaryBase, itemRelPath);

            const isSafeListed = safeList.some(safe => 
                itemRelPath === safe || itemRelPath.endsWith('/' + safe)
            );

            if (!this.fs.exists(primaryItemPath)) {
                if (isSafeListed) {
                    logger.debug(`[MirrorService] Skipping safe-listed: ${itemRelPath}`);
                    return;
                }
                
                try {
                    const stats = this.fs.stat(mirrorItemPath);
                    if (stats && stats.isDirectory()) {
                        this.fs.rmdir(mirrorItemPath);
                        logger.info(`[MirrorService] Pruned directory: ${mirrorItemPath}`);
                    } else {
                        this.fs.unlink(mirrorItemPath);
                        logger.info(`[MirrorService] Pruned file: ${mirrorItemPath}`);
                    }
                } catch (err) {
                    logger.error(`[MirrorService] Prune failed for ${mirrorItemPath}: ${err.message}`);
                }
            } else {
                const stats = this.fs.stat(mirrorItemPath);
                if (stats && stats.isDirectory()) {
                    this._scanAndPrune(mirrorItemPath, primaryBase, itemRelPath, safeList);
                }
            }
        });
    }
}

module.exports = MirrorService;
