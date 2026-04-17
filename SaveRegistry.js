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
     * @param {string} key 
     * @param {any} data 
     * @param {Object} context - Shared context (paths, adapter, etc.)
     */
    async handle(key, data, context) {
        const handler = this.handlers.get(key);
        if (handler) {
            try {
                await handler.save(data, context);
            } catch (err) {
                logger.error(`[SaveRegistry] Error in handler for '${key}': ${err.message}`);
                throw err;
            }
        } else {
            logger.warn(`[SaveRegistry] No handler registered for key: '${key}'`);
        }
    }

    /**
     * Processes a full payload.
     * @param {Object} payload 
     * @param {Object} context 
     */
    async process(payload, context) {
        for (const [key, data] of Object.entries(payload)) {
            if (data !== undefined && data !== null) {
                await this.handle(key, data, context);
            }
        }
    }
}

module.exports = SaveRegistry;
