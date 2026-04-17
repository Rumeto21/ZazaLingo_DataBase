/**
 * AggregationManager (Facade)
 * Provides a unified interface for data aggregation, delegating to specialized Reader and Assembler.
 * Maintains backward compatibility while adhering to SRP internally.
 */
class AggregationManager {
    constructor(reader, assembler) {
        this.reader = reader;
        this.assembler = assembler;
    }

    /**
     * Delegated to AggregationReader
     */
    readTSExport(filePath) {
        return this.reader.readTSExport(filePath);
    }

    /**
     * Delegated to AggregationReader
     */
    readLocale(localesDir, lang) {
        return this.reader.readLocale(localesDir, lang);
    }

    /**
     * Delegated to AggregationReader
     */
    scanCurriculum(dir, results = {}) {
        return this.reader.scanCurriculum(dir, results);
    }

    /**
     * Delegated to AggregationAssembler
     */
    buildFullPayload(dirs) {
        return this.assembler.buildFullPayload(dirs);
    }
}

module.exports = AggregationManager;
