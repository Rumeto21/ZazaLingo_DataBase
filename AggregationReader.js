const logger = require('./logger');
const fsAdapter = require('./FileSystemAdapter');
const path = require('path');

/**
 * AggregationReader
 * Responsible for reading and parsing TypeScript exports from the file system.
 */
class AggregationReader {
    constructor(adapter) {
        this.fs = adapter;
    }

    /**
     * Robust TS export reader that extracts JSON-like data after the '=' sign.
     */
    readTSExport(filePath) {
        if (!this.fs.exists(filePath)) return null;
        try {
            const src = this.fs.readFile(filePath);
            const startMatch = src.match(/=\s*([\[\{]+)/m);
            if (!startMatch) return null;

            const startSearchPos = startMatch.index + startMatch[0].length;
            const brackets = startMatch[1];
            let braceCount = brackets.length;
            let endPos = -1;
            let inString = false;
            let escape = false;

            for (let i = startSearchPos; i < src.length; i++) {
                const char = src[i];
                if (escape) { escape = false; continue; }
                if (char === '\\') { escape = true; continue; }
                if (char === '"' || char === "'") {
                    if (!inString) inString = char;
                    else if (inString === char) inString = false;
                    continue;
                }
                if (inString) continue;
                if (char === '{' || char === '[') braceCount++;
                if (char === '}' || char === ']') braceCount--;
                if (braceCount === 0) {
                    endPos = i + 1;
                    break;
                }
            }

            if (endPos === -1) return null;
            const jsonContent = src.substring(startMatch.index + startMatch[0].length - brackets.length, endPos);
            return JSON.parse(jsonContent);
        } catch (e) {
            logger.error(`[AggregationReader] Failed to parse ${filePath}: ${e.message}`);
            return null;
        }
    }

    readLocale(localesDir, lang) {
        try {
            const p = path.join(localesDir, `${lang}.ts`);
            return this.readTSExport(p);
        } catch (e) {
            logger.error(`[AggregationReader] Error reading locale ${lang}: ${e.message}`);
            return null;
        }
    }

    scanCurriculum(dir, results = {}) {
        if (!this.fs.exists(dir)) return results;
        const items = this.fs.readdir(dir);
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            if (this.fs.stat(fullPath).isDirectory()) {
                this.scanCurriculum(fullPath, results);
            } else if (item.endsWith('.ts') && item !== 'index.ts') {
                const data = this.readTSExport(fullPath);
                if (data) {
                    try {
                        const key = (data.id || item.replace('.ts', '')).trim();
                        results[key] = data;
                    } catch (e) {
                        logger.error(`[AggregationReader] Error indexing curriculum file ${fullPath}: ${e.message}`);
                    }
                }
            }
        });
        return results;
    }
}

module.exports = AggregationReader;
