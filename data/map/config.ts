export interface MapConfig {
    railWidth: number;
    tieSize: number;
    tieThickness?: number;
    tieSpacing?: number;
    grassPatternId?: string;
    title?: Record<string, string>;
}
export const mapConfig: MapConfig = {
    "railWidth": 13,
    "tieSize": 25,
    "tieThickness": 7,
    "title": {
        "Zz": "XETA ��ÃYAYÃ��Ã ZAZALÃNGOYÃ",
        "Tr": "ZAZALÃNGO GÃZERGAHI"
    }
};
