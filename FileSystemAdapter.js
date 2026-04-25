const fs = require('fs');
const path = require('path');

/**
 * FileSystemAdapter
 * Pure wrapper for Node.js 'fs' and 'path' modules.
 * Implements Dependency Inversion Principle (DIP) by providing a clean interface for I/O.
 */
class FileSystemAdapter {
    exists(filePath) {
        return fs.existsSync(filePath);
    }

    mkdir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    readFile(filePath, encoding = 'utf-8') {
        if (!fs.existsSync(filePath)) return null;
        return fs.readFileSync(filePath, encoding);
    }

    writeFile(filePath, content, encoding = 'utf-8') {
        fs.writeFileSync(filePath, content, encoding);
    }

    unlink(filePath) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    rename(oldPath, newPath) {
        fs.renameSync(oldPath, newPath);
    }

    readdir(dirPath) {
        if (!fs.existsSync(dirPath)) return [];
        return fs.readdirSync(dirPath);
    }

    stat(filePath) {
        if (!fs.existsSync(filePath)) return null;
        return fs.statSync(filePath);
    }

    copy(src, dest) {
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.copyFileSync(src, dest);
    }

    rmdir(dirPath) {
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
        }
    }

    join(...parts) {
        return path.join(...parts);
    }

    dirname(filePath) {
        return path.dirname(filePath);
    }

    basename(filePath, ext) {
        return path.basename(filePath, ext);
    }
}

module.exports = FileSystemAdapter;
