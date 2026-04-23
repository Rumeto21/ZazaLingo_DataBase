const logger = require('../logger');
const path = require('path');
const FileSystemAdapter = require('../FileSystemAdapter');
const TSInjectionService = require('../services/TSInjectionService');
const AtomicWriter = require('../services/AtomicWriter');
const BackupService = require('../services/BackupService');
const MirrorService = require('../services/MirrorService');
const SyncManager = require('../SyncManager');

async function runCleanup() {
    logger.info('🚀 Starting One-Time Mirror Cleanup...');
    
    const fsAdapter = new FileSystemAdapter();
    const atomicWriter = new AtomicWriter(fsAdapter);
    const backupService = new BackupService(fsAdapter, atomicWriter);
    const mirrorService = new MirrorService(fsAdapter, atomicWriter);
    const syncManager = new SyncManager(fsAdapter, atomicWriter, backupService, mirrorService, TSInjectionService);

    const primaryDir = path.join(__dirname, '../data');
    const mirrorDir = path.join(__dirname, '../../ZazaLingo/data');

    syncManager.addTarget(primaryDir);
    syncManager.addTarget(mirrorDir);

    // 1. Prune Mirrored files (Orphans)
    syncManager.pruneMirrors(['users.json', '.gitkeep']);

    // 2. Clean empty directories in both Primary and Mirror (Scrub)
    const targets = [primaryDir, mirrorDir];
    targets.forEach(baseDir => {
        logger.info(`[Scrub] Cleaning empty directories in: ${baseDir}`);
        cleanEmptyDirsRecursive(fsAdapter, baseDir);
    });

    logger.info('✅ One-Time Mirror Cleanup COMPLETED.');
}

function cleanEmptyDirsRecursive(fs, dir) {
    if (!fs.exists(dir)) return;
    const items = fs.readdir(dir);
    
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stats = fs.stat(fullPath);
        if (stats && stats.isDirectory()) {
            cleanEmptyDirsRecursive(fs, fullPath);
        }
    });

    // Re-check after cleaning children
    const remaining = fs.readdir(dir);
    // Don't delete root data folders or diger (keep diger even if empty for now?) 
    // Actually, task says 100% surface parity. If it's empty and not root, delete.
    const isRoot = dir.endsWith('data') || dir.endsWith('curriculum') || dir.endsWith('map') || dir.endsWith('theme') || dir.endsWith('locales') || dir.endsWith('settings');
    
    if (remaining.length === 0 && !isRoot) {
        fs.rmdir(dir);
        logger.info(`[Scrub] Removed empty directory: ${dir}`);
    }
}

runCleanup().catch(err => {
    console.error(`❌ Cleanup Failed: ${err.stack}`);
    process.exit(1);
});
