const path = require('path');

class InfoHandler {
    async save(info, { adapter }) {
        if (!info) return;
        adapter.injectData(path.join('settings', 'info.ts'), 'zazaLingoInfo', info, 
            `export const zazaLingoInfo = {{DATA}};`);
    }
}

class ZazaConstantsHandler {
    async save(zazaConstants, { adapter }) {
        if (!zazaConstants) return;
        adapter.injectData(path.join('settings', 'zazaConstants.ts'), 'zazaConstants', zazaConstants, 
            `export const zazaConstants = {{DATA}};`);
    }
}

class LocalesHandler {
    async save(locales, { adapter, localesDir }) {
        if (!locales) return;
        const langs = ['Tr', 'En', 'Zz', 'Kr'];
        for (const lang of langs) {
            if (locales[lang]) {
                adapter.injectData(path.join('locales', `${lang}.ts`), lang, locales[lang], 
                    `import { Locale } from '@zazalingo/shared';\n\nexport const ${lang}: Locale = {{DATA}};`);
                adapter.injectJSON(path.join('locales', `${lang}.json`), locales[lang]);
            }
        }
    }
}

module.exports = { InfoHandler, ZazaConstantsHandler, LocalesHandler };
