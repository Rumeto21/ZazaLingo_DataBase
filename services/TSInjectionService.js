const logger = require('../logger');

/**
 * TSInjectionService
 * Pure logic for performing Regex-based data injection into TypeScript files.
 * Implements SRP by separating data manipulation from I/O.
 */
class TSInjectionService {
    /**
     * Performs the regex injection of JSON data into a TS file content string.
     */
    performInjection(src, variableName, jsonStr, template = null) {
        const prefixRegex = new RegExp(`(export\\s+(const|let|var)\\s+${variableName}\\s*(\\s*:\\s*[^=]+)?\\s*=\\s*)`, 'm');
        const match = src.match(prefixRegex);
        
        if (match) {
            const startPos = match.index + match[0].length;
            let braceCount = 0, endPos = -1, started = false, inString = false, stringChar = '';

            for (let i = startPos; i < src.length; i++) {
                const char = src[i], prevChar = src[i - 1];
                
                // Handle strings to ignore braces inside them
                if ((char === '"' || char === "'") && prevChar !== '\\') {
                    if (!inString) { inString = true; stringChar = char; }
                    else if (char === stringChar) inString = false;
                }

                if (!inString) {
                    if (char === '{' || char === '[') { braceCount++; started = true; }
                    if (char === '}' || char === ']') { braceCount--; started = true; }
                }

                if (started && braceCount === 0) {
                    // Find next semicolon or newline to determine exact end
                    const nextSemicolon = src.indexOf(';', i);
                    endPos = (nextSemicolon !== -1 && nextSemicolon < i + 5) ? nextSemicolon + 1 : i + 1;
                    break;
                }
            }

            if (endPos !== -1) {
                return src.substring(0, startPos) + jsonStr + (src[endPos - 1] === ';' ? ';' : '') + src.substring(endPos);
            }
        } else if (template) {
            return template.replace('{{DATA}}', jsonStr);
        }

        throw new Error(`[TSInjectionService] Injection point not found for variable: ${variableName}`);
    }
}

module.exports = new TSInjectionService();
