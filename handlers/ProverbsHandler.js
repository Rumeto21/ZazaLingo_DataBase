const path = require('path');

class ProverbsHandler {
    async save(proverbs, { adapter }) {
        if (!proverbs) return;
        adapter.injectData(path.join('proverbs', 'proverbs.ts'), 'proverbs', proverbs, 
            `export const proverbs = {{DATA}};`);
        adapter.injectJSON(path.join('proverbs', 'proverbs.json'), proverbs);
    }
}

module.exports = ProverbsHandler;
