const logger = require('./logger');

class SchemaValidator {
    /**
     * Validates if all keys in an object follow PascalCase.
     * @param {object} obj The object to validate.
     * @param {string[]} exclude Optional list of keys to exclude from PascalCase check (e.g., 'id', '_id').
     * @returns {boolean}
     */
    static isPascalCase(str) {
        if (typeof str !== 'string' || str.length === 0) return false;
        // PascalCase: Starts with Upper, followed by Alphanumeric
        return /^[A-Z][a-zA-Z0-9]*$/.test(str);
    }

    static validatePascalCaseKeys(obj, path = '', exceptions = [
        'id', 'x', 'y', 'type', 'scale', 'angle', 'nodes', 'thickness', 'x2', 'y2', 'scaleX', 'scaleY', 'val', 'unit',
        'parentUnitId', 'tieThickness', 'tieSpacing', 'grassPatternId', 'imageUrl', 'audioRef', 'imageRef', 'borderRadius',
        'nodeIndex', 'origX', 'origY', 'origScale', 'origScaleX', 'origScaleY', 'startX', 'startY', 'target',
        'speaker', 'position', 'characterImage', 'audioRef', 'imageRef', 'correctOptionId', 'correctWords', 'poolWords',
        'options', 'questions', 'title', 'promptText', 'left', 'right', 'text', 'translation', 'Tr', 'En', 'Zz', 'Kr', 'tr', 'en', 'zz', 'kr',
        'matchingPairs', 'dialogueItems', 'isTranslationEnabled',
        'textMuted', 'questionTitleText', 'questionPromptText', 'questionBtnText', 'questionTitleColor', 'questionPromptColor',
        'questionBtnColor', 'questionBtnTextColor', 'proverbsPaddingHorizontal', 'proverbsPaddingVertical',
        'railWidth', 'value', 'tieSize', 'unitIndex', 'topicIndex', 'testIds',
        // v8.5 Add core system and map/sign keys
        'stations', 'decorations', 'mapConfig', 'tests', 'proverbs', 'theme', 'themeSchemes', 'info', 'zazaConstants', 'locales',
        'signX', 'signY', 'railX', 'railY', 'tagX', 'tagY', 'nameWidth', 'railAngle',
        'railColor', 'mapBgColor', 'mapRiverColor', 'pinActiveColor', 'pinLockedColor'
    ]) {
        if (!obj || typeof obj !== 'object') return { isValid: true };

        // v8.0 Array Fix: Skip index validation for arrays
        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                const result = this.validatePascalCaseKeys(obj[i], `${path}[${i}]`, exceptions);
                if (!result.isValid) return result;
            }
            return { isValid: true };
        }

        for (const key in obj) {
            const currentPath = path ? `${path}.${key}` : key;
            
            // v8.5 Domain Awareness: Skip validation for certain configuration domains
            // 1. Locales: Translation keys are usually camelCase
            const isLocaleDomain = path.startsWith('locales');
            // 2. Theme & Info: Theme tokens and settings are often camelCase (standardized in Layout Engine)
            const isConfigDomain = /^(theme|themeSchemes|info|zazaConstants)/.test(path);
            // 3. Data IDs: Keys that are direct children of 'tests', 'stations', 'decorations'
            const isDataIdKey = /^(tests|stations|decorations)$/.test(path);
            
            // v8.0 Exception: Allow all fields starting with recognized prefixes
            // as they are part of the core Layout Engine, Map Engine, or are Data IDs.
            const isLayoutField = /^(settings|header|mascot|map|topBar|question|proverbs|button|rail|pin|unit|topic|primary|secondary|tertiary|background|surface|text|border|correct|incorrect|inactive|selected|progress|feedback|accent|coktan|word|matching|image|choice|dialogue|label|loco|test_|q_|opt_|l[0-9]|deco_|p_|d[0-9]|o[0-9]|p[0-9]|p_)/.test(key);

            const shouldSkipKeyValidation = isLocaleDomain || isConfigDomain || isDataIdKey;

            if (!shouldSkipKeyValidation && !exceptions.includes(key) && !this.isPascalCase(key) && !isLayoutField) {
                // If it's not a known exception, not PascalCase, and not a recognized layout prefix
                logger.error(`[SchemaValidator] KEY ERROR: "${currentPath}" must be PascalCase.`);
                return { isValid: false, errorPath: currentPath };
            }

            if (typeof obj[key] === 'object' && obj[key] !== null) {
                const result = this.validatePascalCaseKeys(obj[key], currentPath, exceptions);
                if (!result.isValid) return result;
            }
        }
        return { isValid: true };
    }

    /**
     * Ensures all objects in an array or top-level records have a non-empty 'id'.
     * v9.0 Safety: Mandatory for Map Stations and Tests.
     */
    static validateMandatoryIDs(obj, path = '') {
        if (!obj) return { isValid: true };

        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                const item = obj[i];
                if (typeof item === 'object' && item !== null) {
                    if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') {
                        const errorPath = `${path}[${i}].id`;
                        logger.error(`[SchemaValidator] ID ERROR: Missing or invalid ID at "${errorPath}"`);
                        return { isValid: false, errorPath };
                    }
                }
            }
        } else if (typeof obj === 'object') {
            // For top-level records (e.g., tests object in curriculum)
            for (const key in obj) {
                const item = obj[key];
                const currentPath = path ? `${path}.${key}` : key;
                if (typeof item === 'object' && item !== null) {
                    if (!item.id) {
                        logger.error(`[SchemaValidator] ID ERROR: Item at "${currentPath}" is missing internal "id" field.`);
                        return { isValid: false, errorPath: `${currentPath}.id` };
                    }
                }
            }
        }
        return { isValid: true };
    }

    /**
     * Validates semantic integrity between fields.
     * v9.0 Integration: Topic parentUnitId cross-check.
     */
    static validateDataIntegrity(obj) {
        if (!obj || typeof obj !== 'object') return { isValid: true };

        // 1. Map Integrity: Topics must have parentUnitId
        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                const item = obj[i];
                if (item.type === 'topic' && !item.parentUnitId) {
                    const errorPath = `[${i}].parentUnitId`;
                    logger.error(`[SchemaValidator] INTEGRITY ERROR: Topic "${item.id}" is missing "parentUnitId".`);
                    return { isValid: false, errorPath };
                }
            }
        }

        return { isValid: true };
    }

    /**
     * Middleware function for http server
     */
    static middleware(req, res, body, next) {
        if (req.method !== 'POST') return next();

        try {
            const payload = JSON.parse(body);
            // 1. PascalCase Check
            const result = this.validatePascalCaseKeys(payload);
            if (!result.isValid) {
                logger.error(`[SchemaValidator] Validation failed for ${req.url}. Error Path: ${result.errorPath}`);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 'Schema Validation Failed: Use PascalCase for custom data fields.',
                    offendingKey: result.errorPath
                }));
                return;
            }

            // 2. Mandatory ID Check (for stations and tests)
            if (payload.stations) {
                const idResult = this.validateMandatoryIDs(payload.stations, 'stations');
                if (!idResult.isValid) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing mandatory ID in stations', offendingKey: idResult.errorPath }));
                    return;
                }

                const integrityResult = this.validateDataIntegrity(payload.stations);
                if (!integrityResult.isValid) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Data integrity failed: Topics must have parentUnitId', offendingKey: integrityResult.errorPath }));
                    return;
                }
            }

            if (payload.tests) {
                const idResult = this.validateMandatoryIDs(payload.tests, 'tests');
                if (!idResult.isValid) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing mandatory ID in tests', offendingKey: idResult.errorPath }));
                    return;
                }
            }

            next();
        } catch (err) {
            // If body is not JSON, we let the handler deal with it or reject here
            next();
        }
    }
}

module.exports = SchemaValidator;
