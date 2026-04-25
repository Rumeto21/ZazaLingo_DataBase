const path = require('path');

/**
 * Specialized handlers for Map components
 * Implements SOLID (DIP, SRP)
 */
class StationsHandler {
    constructor(fsAdapter, syncManager) {
        this.fs = fsAdapter;
        this.syncManager = syncManager;
    }

    async save(stations, context = {}) {
        try {
            const tsRes = await this.syncManager.injectDataIntoTSFile(
                path.join('map', 'stations.ts'), 
                'courseLevels', 
                stations, 
                `import { LevelData } from '../../types/data';\n\nexport const courseLevels: LevelData[] = {{DATA}};`
            );
            const jsonRes = await this.syncManager.injectJSONAtomic(
                path.join('map', 'stations.json'), 
                stations
            );
            
            const errors = [...(tsRes.errors || []), ...(jsonRes.errors || [])];
            return {
                success: tsRes.success && jsonRes.success,
                partial: tsRes.partial || jsonRes.partial || errors.length > 0,
                errors
            };
        } catch (err) {
            return { success: false, errors: [err.message] };
        }
    }
}

class DecorationsHandler {
    constructor(fsAdapter, syncManager) {
        this.fs = fsAdapter;
        this.syncManager = syncManager;
    }

    async save(decorations, context = {}) {
        try {
            const tsRes = await this.syncManager.injectDataIntoTSFile(
                path.join('map', 'decorations.ts'), 
                'decorations', 
                decorations, 
                `import { DecorationData } from '../../types/data';\n\nexport const decorations: DecorationData[] = {{DATA}};`
            );
            const jsonRes = await this.syncManager.injectJSONAtomic(
                path.join('map', 'decorations.json'), 
                decorations
            );

            const errors = [...(tsRes.errors || []), ...(jsonRes.errors || [])];
            return {
                success: tsRes.success && jsonRes.success,
                partial: tsRes.partial || jsonRes.partial || errors.length > 0,
                errors
            };
        } catch (err) {
            return { success: false, errors: [err.message] };
        }
    }
}

class MapConfigHandler {
    constructor(fsAdapter, syncManager) {
        this.fs = fsAdapter;
        this.syncManager = syncManager;
    }

    async save(mapConfig, context = {}) {
        try {
            const tsRes = await this.syncManager.injectDataIntoTSFile(
                path.join('map', 'config.ts'), 
                'mapConfig', 
                mapConfig, 
                `import { MapConfig } from '../../types/data';\n\nexport const mapConfig: MapConfig = {{DATA}};`
            );
            const jsonRes = await this.syncManager.injectJSONAtomic(
                path.join('map', 'config.json'), 
                mapConfig
            );

            const errors = [...(tsRes.errors || []), ...(jsonRes.errors || [])];
            return {
                success: tsRes.success && jsonRes.success,
                partial: tsRes.partial || jsonRes.partial || errors.length > 0,
                errors
            };
        } catch (err) {
            return { success: false, errors: [err.message] };
        }
    }
}

module.exports = { StationsHandler, DecorationsHandler, MapConfigHandler };
