const path = require('path');

class MapHandler {
    async save(data, { adapter, mapDir }) {
        // We handle stations, decorations, and mapConfig in this handler
        // The data passed here might be specific to one of them if called individually,
        // or a group if registered that way. 
        // For OCP, we'll assume the registry passes the specific domain data.
    }
}

/**
 * Specialized handlers for Map components
 */
class StationsHandler {
    async save(stations, { adapter }) {
        adapter.injectData(path.join('map', 'stations.ts'), 'courseLevels', stations, 
            `export const courseLevels = {{DATA}};`);
        adapter.injectJSON(path.join('map', 'stations.json'), stations);
    }
}

class DecorationsHandler {
    async save(decorations, { adapter }) {
        adapter.injectData(path.join('map', 'decorations.ts'), 'decorations', decorations, 
            `export const decorations = {{DATA}};`);
        adapter.injectJSON(path.join('map', 'decorations.json'), decorations);
    }
}

class MapConfigHandler {
    async save(mapConfig, { adapter }) {
        adapter.injectData(path.join('map', 'config.ts'), 'mapConfig', mapConfig, 
            `export const mapConfig = {{DATA}};`);
        adapter.injectJSON(path.join('map', 'config.json'), mapConfig);
    }
}

module.exports = { StationsHandler, DecorationsHandler, MapConfigHandler };
