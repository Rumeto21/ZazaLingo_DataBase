const path = require('path');

class InfoHandler {
    async save(info, { adapter }) {
        if (!info) return;

        // Normalization for Backward Compatibility
        const translatable = ['mainTitle', 'teamTitle', 'dedicationTitle', 'musicTitle', 'missionTitle', 'mission'];
        translatable.forEach(key => {
            if (info[key] && typeof info[key] === 'string') {
                info[key] = { Tr: info[key] };
            }
        });

        // Nested Normalization (dedications[].to, music[].title, music[].changes)
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

        await adapter.injectData(path.join('settings', 'info.ts'), 'zazaLingoInfo', info, 
            `export const zazaLingoInfo = {{DATA}};`);
    }
}

class ZazaConstantsHandler {
    async save(zazaConstants, { adapter }) {
        if (!zazaConstants) return;
        await adapter.injectData(path.join('settings', 'zazaConstants.ts'), 'zazaConstants', zazaConstants, 
            `export const zazaConstants = {{DATA}};`);
    }
}

class LocalesHandler {
    async save(locales, { adapter, localesDir }) {
        if (!locales) return;
        const langs = ['Tr', 'En', 'Zz', 'Kr'];
        for (const lang of langs) {
            if (locales[lang]) {
                await adapter.injectData(path.join('locales', `${lang}.ts`), lang, locales[lang], 
                    `import { Locale } from '@zazalingo/shared';\n\nexport const ${lang}: Locale = {{DATA}};`);
                await adapter.injectJSON(path.join('locales', `${lang}.json`), locales[lang]);
            }
        }
    }
}

module.exports = { InfoHandler, ZazaConstantsHandler, LocalesHandler };
