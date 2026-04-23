const path = require('path');

/**
 * Settings Handlers (Info, ZazaConstants, Locales)
 * Implements SOLID (DIP, SRP)
 */
class InfoHandler {
    constructor(fsAdapter, syncManager) {
        this.fs = fsAdapter;
        this.syncManager = syncManager;
    }

    async save(info, context = {}) {
        if (!info) return { success: true };

        // Normalization for Backward Compatibility
        const translatable = ['mainTitle', 'teamTitle', 'dedicationTitle', 'musicTitle', 'missionTitle', 'mission'];
        translatable.forEach(key => {
            if (info[key] && typeof info[key] === 'string') {
                info[key] = { Tr: info[key] };
            }
        });

        // Nested Normalization
        if (Array.isArray(info.dedications)) {
            info.dedications.forEach(d => {
                if (d && typeof d.to === 'string') d.to = { Tr: d.to };
            });
        }
        if (Array.isArray(info.music)) {
            info.music.forEach(m => {
                if (m) {
                    if (typeof m.title === 'string') m.title = { Tr: m.title };
                    if (typeof m.changes === 'string') m.changes = { Tr: m.changes };
                }
            });
        }

        try {
            return await this.syncManager.injectDataIntoTSFile(
                path.join('settings', 'info.ts'), 
                'zazaLingoInfo', 
                info, 
                `export const zazaLingoInfo = {{DATA}};`
            );
        } catch (err) {
            return { success: false, errors: [err.message] };
        }
    }
}

class ZazaConstantsHandler {
    constructor(fsAdapter, syncManager) {
        this.fs = fsAdapter;
        this.syncManager = syncManager;
    }

    async save(zazaConstants, context = {}) {
        if (!zazaConstants) return { success: true };
        try {
            return await this.syncManager.injectDataIntoTSFile(
                path.join('settings', 'zazaConstants.ts'), 
                'zazaConstants', 
                zazaConstants, 
                `export const zazaConstants = {{DATA}};`
            );
        } catch (err) {
            return { success: false, errors: [err.message] };
        }
    }
}

class LocalesHandler {
    constructor(fsAdapter, syncManager) {
        this.fs = fsAdapter;
        this.syncManager = syncManager;
    }

    async save(locales, context = {}) {
        if (!locales) return { success: true };
        const results = [];
        const langs = ['Tr', 'En', 'Zz', 'Kr'];
        for (const lang of langs) {
            if (locales[lang]) {
                try {
                    const tsRes = await this.syncManager.injectDataIntoTSFile(
                        path.join('locales', `${lang}.ts`), 
                        lang, 
                        locales[lang], 
                        `import { Locale } from '@zazalingo/shared';\n\nexport const ${lang}: Locale = {{DATA}};`
                    );
                    const jsonRes = await this.syncManager.injectJSONAtomic(
                        path.join('locales', `${lang}.json`), 
                        locales[lang]
                    );
                    results.push(tsRes, jsonRes);
                } catch (err) {
                    results.push({ success: false, errors: [err.message] });
                }
            }
        }
        const errors = results.flatMap(r => r.errors || []);
        return {
            success: results.every(r => r.success),
            partial: results.some(r => r.partial) || errors.length > 0,
            errors
        };
    }
}

module.exports = { InfoHandler, ZazaConstantsHandler, LocalesHandler };
