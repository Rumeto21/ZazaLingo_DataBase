const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * FileSystemAdapter
 * Decouples managers from direct 'fs' and 'SyncManager' dependencies.
 * Implements Dependency Inversion Principle (DIP).
 */
class FileSystemAdapter {
    /**
     * @param {Object} syncer - An object providing injectDataIntoTSFile, injectJSONAtomic, and syncFile methods.
     */
    constructor(syncer) {
        this.syncer = syncer;
    }

    exists(filePath) {
        return fs.existsSync(filePath);
    }

    mkdir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    readFile(filePath, encoding = 'utf-8') {
        return fs.readFileSync(filePath, encoding);
    }

    writeFile(filePath, content, encoding = 'utf-8') {
        fs.writeFileSync(filePath, content, encoding);
    }

    readdir(dirPath) {
        return fs.readdirSync(dirPath);
    }

    stat(filePath) {
        return fs.statSync(filePath);
    }

    rename(oldPath, newPath) {
        fs.renameSync(oldPath, newPath);
    }

    rmdir(dirPath) {
        fs.rmdirSync(dirPath);
    }

    /**
     * Specialized method for TS data injection via injected syncer.
     */
    injectData(filePath, exportName, data, template) {
        if (this.syncer) {
            this.syncer.injectDataIntoTSFile(filePath, exportName, data, template);
        } else {
            logger.warn(`[FileSystemAdapter] No syncer provided. injection failed for ${filePath}`);
        }
    }

    /**
     * Specialized method for atomic JSON writing via injected syncer.
     */
    injectJSON(filePath, data) {
        if (this.syncer) {
            this.syncer.injectJSONAtomic(filePath, data);
        } else {
            logger.warn(`[FileSystemAdapter] No syncer provided. JSON injection failed for ${filePath}`);
        }
    }

    /**
     * Specialized method for triggering a file sync via injected syncer.
     */
    syncFile(relativeInternalPath) {
        if (this.syncer) {
            this.syncer.syncFile(relativeInternalPath);
        }
    }
}

module.exports = FileSystemAdapter;
