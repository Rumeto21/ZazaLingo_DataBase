const path = require('path');

class ProverbsHandler {
    async save(proverbs, { adapter }) {
        if (!proverbs) return { success: true };
        const tsRes = await adapter.injectData(path.join('proverbs', 'proverbs.ts'), 'proverbs', proverbs, 
            `export const proverbs = {{DATA}};`);
        const jsonRes = await adapter.injectJSON(path.join('proverbs', 'proverbs.json'), proverbs);

        const errors = [...(tsRes.errors || []), ...(jsonRes.errors || [])];
        return {
            success: tsRes.success && jsonRes.success,
            partial: tsRes.partial || jsonRes.partial || errors.length > 0,
            errors
        };
    }
}

module.exports = ProverbsHandler;
