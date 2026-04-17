const path = require('path');

/**
 * AggregationAssembler
 * Responsible for coordinating the assembly of the full system payload.
 */
class AggregationAssembler {
    constructor(reader, adapter) {
        this.reader = reader;
        this.fs = adapter;
    }

    buildFullPayload({ mapDir, proverbsDir, curriculumDir, themeDir, settingsDir, localesDir }) {
        return {
            stations: this.reader.readTSExport(path.join(mapDir, 'stations.ts')),
            decorations: this.reader.readTSExport(path.join(mapDir, 'decorations.ts')),
            mapConfig: this.reader.readTSExport(path.join(mapDir, 'config.ts')),
            proverbs: this.reader.readTSExport(path.join(proverbsDir, 'proverbs.ts')),
            tests: this.reader.scanCurriculum(curriculumDir),
            theme: (() => {
                try {
                    const jsonPath = path.join(themeDir, 'themeConfig.json');
                    if (this.fs.exists(jsonPath)) return JSON.parse(this.fs.readFile(jsonPath));
                    return this.reader.readTSExport(path.join(themeDir, 'theme.ts'));
                } catch (e) {
                    return this.reader.readTSExport(path.join(themeDir, 'theme.ts'));
                }
            })(),
            themeSchemes: (() => {
                try {
                    const p = path.join(themeDir, 'themeSchemes.json');
                    return this.fs.exists(p) ? JSON.parse(this.fs.readFile(p) || '{}') : {};
                } catch (e) { return {}; }
            })(),
            info: this.reader.readTSExport(path.join(settingsDir, 'info.ts')),
            zazaConstants: this.reader.readTSExport(path.join(settingsDir, 'zazaConstants.ts')),
            locales: {
                Tr: this.reader.readLocale(localesDir, 'Tr'),
                En: this.reader.readLocale(localesDir, 'En'),
                Zz: this.reader.readLocale(localesDir, 'Zz'),
                Kr: this.reader.readLocale(localesDir, 'Kr'),
            }
        };
    }
}

module.exports = AggregationAssembler;
