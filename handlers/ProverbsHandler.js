const path = require('path');

class ProverbsHandler {
    async save(proverbs, { adapter }) {
        if (!proverbs) return;
        await adapter.injectData(path.join('proverbs', 'proverbs.ts'), 'proverbs', proverbs, 
            `export const proverbs = {{DATA}};`);
        await adapter.injectJSON(path.join('proverbs', 'proverbs.json'), proverbs);
    }
}

module.exports = ProverbsHandler;
