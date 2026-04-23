const logger = require('./logger');

/**
 * SaveRegistry
 * Manages registration and execution of domain-specific save handlers.
 * Implements Open-Closed Principle (OCP).
 */
class SaveRegistry {
    constructor() {
        this.handlers = new Map();
    }

    /**
     * Registers a handler for a specific key.
     * @param {string} key - The data key (e.g., 'stations', 'tests').
     * @param {Object} handler - An object with a 'save(data, context)' method.
     */
    register(key, handler) {
        this.handlers.set(key, handler);
    }

    /**
     * Executes the registered handler for the given key.
     * @returns {Promise<Object>} The sync result from the handler.
     */
    async handle(key, data, context) {
        const handler = this.handlers.get(key);
        if (handler) {
            try {
                return await handler.save(data, context);
            } catch (err) {
                logger.error(`[SaveRegistry] Error in handler for '${key}': ${err.message}`);
                throw err;
            }
        } else {
            logger.warn(`[SaveRegistry] No handler registered for key: '${key}'`);
            return { success: true }; // No handler is not a sync error
        }
    }

    /**
     * Processes a full payload.
     * @returns {Promise<{success: boolean, partial: boolean, errors: string[]}>}
     */
    async process(payload, context) {
        const allResults = [];
        for (const [key, data] of Object.entries(payload)) {
            if (data !== undefined && data !== null) {
                const res = await this.handle(key, data, context);
                if (res) allResults.push(res);
            }
        }

        const errors = allResults.flatMap(r => r.errors || []);
        const partial = allResults.some(r => r.partial);
        return {
            success: allResults.every(r => r.success),
            partial: partial || errors.length > 0,
            errors
        };
    }
}

module.exports = SaveRegistry;
