const logger = require('../logger');

/**
 * ThemeHandler
 * Manages theme updates and modular TS file injections.
 * Implements OCP by using ThemeRegistry for mapping.
 * Implements DIP by using FileSystemAdapter.
 */
class ThemeHandler {
    constructor(fsAdapter, syncManager, themeRegistry) {
        this.fs = fsAdapter;
        this.syncManager = syncManager;
        this.registry = themeRegistry;
    }

    async save(data, context = {}) {
        const results = [];
        const mappings = this.registry.getMappings();
        
        // 1. Update Modular Files based on Registry
        for (const [relativePath, keysSet] of mappings.entries()) {
            const keys = Array.from(keysSet);
            const modularData = {};
            let hasData = false;

            keys.forEach(key => {
                if (data[key] !== undefined) {
                    modularData[key] = data[key];
                    hasData = true;
                }
            });

            if (hasData) {
                try {
                    const varName = this.fs.basename(relativePath, '.ts');
                    const res = await this.syncManager.injectDataIntoTSFile(
                        this.fs.join('theme', relativePath),
                        varName,
                        modularData,
                        `export const ${varName} = {{DATA}};`
                    );
                    results.push(res);
                } catch (err) {
                    results.push({ success: false, errors: [err.message] });
                }
            }
        }

        // 2. Update Master themeConfig.json (Atomic)
        try {
            const res = await this.syncManager.injectJSONAtomic('theme/themeConfig.json', data);
            results.push(res);
            logger.info('[ThemeHandler] Modular files and themeConfig.json updated via Registry.');
        } catch (err) {
            results.push({ success: false, errors: [err.message] });
        }

        // 3. Consolidate Results
        const errors = results.flatMap(r => r.errors || []);
        const partial = results.some(r => r.partial);
        return {
            success: results.every(r => r.success),
            partial: partial || errors.length > 0,
            errors
        };
    }
}

/**
 * ThemeSchemesHandler
 * Minimal handler for theme schemes.
 */
class ThemeSchemesHandler {
    constructor(fsAdapter, syncManager) {
        this.fs = fsAdapter;
        this.syncManager = syncManager;
    }

    async save(data, context = {}) {
        const results = [];
        try {
            // Update TS
            const tsRes = await this.syncManager.injectDataIntoTSFile(
                'theme/themeSchemes.ts',
                'themeSchemes',
                data,
                'export const themeSchemes = {{DATA}};'
            );
            results.push(tsRes);

            // Update JSON
            const jsonRes = await this.syncManager.injectJSONAtomic('theme/themeSchemes.json', data);
            results.push(jsonRes);

        } catch (err) {
            results.push({ success: false, errors: [err.message] });
        }

        const errors = results.flatMap(r => r.errors || []);
        return {
            success: results.every(r => r.success),
            partial: errors.length > 0,
            errors
        };
    }
}

module.exports = { ThemeHandler, ThemeSchemesHandler };
