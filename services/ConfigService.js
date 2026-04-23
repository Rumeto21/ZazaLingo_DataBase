const fs = require('fs');
const path = require('path');
const logger = require('../logger');

/**
 * ConfigService
 * Responsible for loading and providing system configuration.
 * Implements SRP by separating configuration logic from synchronization logic.
 */
class ConfigService {
    constructor() {
        this.config = {
            pruneSafeList: [],
            retrySettings: { maxRetries: 5, delay: 150 },
            cleanupSettings: { maxAgeMinutes: 10 }
        };
    }

    loadConfig(configPath) {
        if (fs.existsSync(configPath)) {
            try {
                const loaded = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                this.config = { ...this.config, ...loaded };
                logger.info(`[ConfigService] Configuration loaded from: ${configPath}`);
                return this.config;
            } catch (err) {
                logger.error(`[ConfigService] Failed to load config: ${err.message}`);
            }
        } else {
            logger.warn(`[ConfigService] Config file not found, using defaults: ${configPath}`);
        }
        return this.config;
    }

    get() {
        return this.config;
    }
}

module.exports = new ConfigService();
