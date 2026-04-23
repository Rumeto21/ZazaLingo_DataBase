const path = require('path');

/**
 * ProverbsHandler
 * Implements SOLID (DIP, SRP)
 */
class ProverbsHandler {
    constructor(fsAdapter, syncManager) {
        this.fs = fsAdapter;
        this.syncManager = syncManager;
    }

    async save(proverbs, context = {}) {
        if (!proverbs) return { success: true };
        try {
            const tsRes = await this.syncManager.injectDataIntoTSFile(
                path.join('proverbs', 'proverbs.ts'), 
                'proverbs', 
                proverbs, 
                `export const proverbs = {{DATA}};`
            );
            const jsonRes = await this.syncManager.injectJSONAtomic(
                path.join('proverbs', 'proverbs.json'), 
                proverbs
            );

            const errors = [...(tsRes.errors || []), ...(jsonRes.errors || [])];
            return {
                success: tsRes.success && jsonRes.success,
                partial: tsRes.partial || jsonRes.partial || errors.length > 0,
                errors
            };
        } catch (err) {
            return { success: false, errors: [err.message] };
        }
    }
}

module.exports = ProverbsHandler;
