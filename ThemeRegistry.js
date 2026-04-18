const logger = require('./logger');

/**
 * ThemeRegistry
 * Manages the mapping of theme keys to modular .ts files.
 * Implements Open-Closed Principle (OCP).
 */
class ThemeRegistry {
    constructor() {
        this.mappings = new Map(); // relativePath -> Set of keys
    }

    /**
     * Registers a set of theme keys for a specific modular file.
     * @param {string} relativePath - Path relative to the theme directory (e.g., 'tokens/colors.ts').
     * @param {string[]} keys - Array of theme keys.
     */
    register(relativePath, keys) {
        if (!this.mappings.has(relativePath)) {
            this.mappings.set(relativePath, new Set());
        }
        const keySet = this.mappings.get(relativePath);
        keys.forEach(k => keySet.add(k));
        logger.info(`[ThemeRegistry] Registered ${keys.length} keys for ${relativePath}`);
    }

    /**
     * Gets all registered mappings.
     * @returns {Map<string, Set<string>>}
     */
    getMappings() {
        return this.mappings;
    }
}

module.exports = ThemeRegistry;
