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
        'parentUnitId', 'tieThickness', 'tieSpacing', 'grassPatternId', 'imageUrl', 'audioRef', 'imageRef',
        'nodeIndex', 'origX', 'origY', 'origScale', 'origScaleX', 'origScaleY', 'startX', 'startY', 'target',
        'speaker', 'position', 'characterImage', 'audioRef', 'imageRef', 'correctOptionId', 'correctWords', 'poolWords',
        'options', 'questions', 'title', 'promptText', 'left', 'right', 'text', 'translation', 'Tr', 'En', 'Zz', 'Kr',
        'textMuted', 'questionTitleText', 'questionPromptText', 'questionBtnText', 'questionTitleColor', 'questionPromptColor',
        'questionBtnColor', 'questionBtnTextColor', 'proverbsPaddingHorizontal', 'proverbsPaddingVertical',
        'railWidth', 'value', 'tieSize', 'unitIndex', 'topicIndex', 'testIds'
    ]) {
        if (!obj || typeof obj !== 'object') return true;

        // v8.0 Array Fix: Skip index validation for arrays
        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                if (!this.validatePascalCaseKeys(obj[i], `${path}[${i}]`, exceptions)) return false;
            }
            return true;
        }

        for (const key in obj) {
            const currentPath = path ? `${path}.${key}` : key;
            
            // v8.0 Exception: Allow all fields starting with 'settings', 'header', 'mascot', 'map', 'topBar'
            // as they are part of the core Layout Engine schema.
            const isLayoutField = /^(settings|header|mascot|map|topBar|question|proverbs|button)/.test(key);

            if (!exceptions.includes(key) && !this.isPascalCase(key) && !isLayoutField) {
                // If it's not a known exception, not PascalCase, and not a recognized layout prefix
                logger.error(`[SchemaValidator] KEY ERROR: "${currentPath}" must be PascalCase.`);
                return false;
            }

            if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (!this.validatePascalCaseKeys(obj[key], currentPath, exceptions)) return false;
            }
        }
        return true;
    }

    /**
     * Middleware function for http server
     */
    static middleware(req, res, body, next) {
        if (req.method !== 'POST') return next();

        try {
            const payload = JSON.parse(body);
            // v8.0 Strict Schema Check
            const isValid = this.validatePascalCaseKeys(payload);
            
            if (!isValid) {
                logger.error(`[SchemaValidator] Validation failed for ${req.url}`);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Schema Validation Failed: Use PascalCase for custom data fields.' }));
                return;
            }

            next();
        } catch (err) {
            // If body is not JSON, we let the handler deal with it or reject here
            next();
        }
    }
}

module.exports = SchemaValidator;
