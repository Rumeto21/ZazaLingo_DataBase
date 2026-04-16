const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * AggregationManager
 * Handles reading, parsing and aggregating ZazaLingo data from TypeScript exports.
 */
class AggregationManager {
    /**
     * Robust TS export reader that ignores trailing corruption.
     * Extracts JSON-like data after the '=' sign.
     */
    readTSExport(filePath) {
        if (!fs.existsSync(filePath)) return null;
        try {
            const src = fs.readFileSync(filePath, 'utf-8');
            // Find the start of the data after '='
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
            logger.error(`[AggregationManager] Failed to parse ${filePath}: ${e.message}`);
            return null;
        }
    }

    readLocale(localesDir, lang) {
        try {
            const p = path.join(localesDir, `${lang}.ts`);
            return this.readTSExport(p);
        } catch (e) {
            logger.error(`[AggregationManager] Error reading locale ${lang}: ${e.message}`);
            return null;
        }
    }

    scanCurriculum(dir, results = {}) {
        if (!fs.existsSync(dir)) return results;
        const items = fs.readdirSync(dir);
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                this.scanCurriculum(fullPath, results);
            } else if (item.endsWith('.ts') && item !== 'index.ts') {
                const data = this.readTSExport(fullPath);
                if (data) {
                    try {
                        const key = (data.id || item.replace('.ts', '')).trim();
                        results[key] = data;
                    } catch (e) {
                        logger.error(`[AggregationManager] Error indexing curriculum file ${fullPath}: ${e.message}`);
                    }
                }
            }
        });
        return results;
    }

    buildFullPayload({ mapDir, proverbsDir, curriculumDir, themeDir, settingsDir, localesDir }) {
        return {
            stations: this.readTSExport(path.join(mapDir, 'stations.ts')),
            decorations: this.readTSExport(path.join(mapDir, 'decorations.ts')),
            mapConfig: this.readTSExport(path.join(mapDir, 'config.ts')),
            proverbs: this.readTSExport(path.join(proverbsDir, 'proverbs.ts')),
            tests: this.scanCurriculum(curriculumDir),
            theme: (() => {
                try {
                    const jsonPath = path.join(themeDir, 'themeConfig.json');
                    if (fs.existsSync(jsonPath)) return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
                    return this.readTSExport(path.join(themeDir, 'theme.ts'));
                } catch (e) {
                    return this.readTSExport(path.join(themeDir, 'theme.ts'));
                }
            })(),
            themeSchemes: (() => {
                try {
                    const p = path.join(themeDir, 'themeSchemes.json');
                    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8') || '{}') : {};
                } catch (e) { return {}; }
            })(),
            info: this.readTSExport(path.join(settingsDir, 'info.ts')),
            zazaConstants: this.readTSExport(path.join(settingsDir, 'zazaConstants.ts')),
            locales: {
                Tr: this.readLocale(localesDir, 'Tr'),
                En: this.readLocale(localesDir, 'En'),
                Zz: this.readLocale(localesDir, 'Zz'),
                Kr: this.readLocale(localesDir, 'Kr'),
            }
        };
    }
}

module.exports = new AggregationManager();
