import fs from 'fs';
import path from 'path';

const BASE_HEIGHT = 812;
const CENTER = BASE_HEIGHT / 2;

const Y_AXIS_KEYS = [
    'mascotHomeTop', 'mascotQuestionTop', 'mascotCoktanSecmeliTop', 
    'mascotGorselEslesirmeTop', 'mascotDinlemeTop', 'mascotWordOrderTop', 
    'mascotMatchingTop', 'mascotSentenceCompletionTop', 'mascotImageChoiceTop', 
    'mascotChoiceImageTop', 'mascotDialogueTop',
    'headerTitleMarginTop', 'headerSubtitleMarginTop', 'headerTopMargin', 
    'headerBottomMargin', 'buttonMarginTop', 'buttonContainerTopMargin', 
    'proverbsMarginTop', 'questionTitleMarginTop', 'questionPromptMarginTop', 
    'questionOptionsMarginTop', 'settingsTitleMarginTop', 'settingsBackMarginTop',
    'settingsMusicSectionMarginTop', 'settingsInfoSectionMarginTop', 
    'settingsThemeSectionMarginTop', 'settingsThemeItem0MarginTop',
    'settingsThemeItem1MarginTop', 'settingsThemeItem2MarginTop',
    'settings_music_item_0MarginTop', 'settings_music_item_1MarginTop',
    'settings_info_menu_0MarginTop', 'settings_info_menu_1MarginTop',
    'settings_info_menu_2MarginTop', 'topBarPaddingTop'
];

function migrateValue(obj) {
    if (typeof obj === 'number') {
        // Ratio migration
        return obj - 0.5;
    } else if (obj && typeof obj.val === 'number' && obj.unit === 'px') {
        // Px migration
        obj.val = obj.val - CENTER;
        return obj;
    } else if (obj && typeof obj.val === 'number' && obj.unit === 'ratio') {
        // Explicit ratio migration
        obj.val = obj.val - 0.5;
        return obj;
    }
    return obj;
}

const spacingPath = path.join(process.cwd(), 'data/theme/tokens/spacing.ts');
let content = fs.readFileSync(spacingPath, 'utf8');

Y_AXIS_KEYS.forEach(key => {
    // Regex to find "key": value or "key": { val: ... }
    const regex = new RegExp(`("${key}"|${key})\\s*:\\s*({[\\s\\S]*?}|-?\\d+\\.?\\d*)`, 'g');
    content = content.replace(regex, (match, p1, p2) => {
        try {
            let valObj;
            if (p2.startsWith('{')) {
                // Parse it manually to avoid issues with non-standard JSON in TS
                const valMatch = p2.match(/"val"\s*:\s*(-?\d+\.?\d*)/);
                const unitMatch = p2.match(/"unit"\s*:\s*"(\w+)"/);
                if (valMatch && unitMatch) {
                    const migrated = migrateValue({ val: parseFloat(valMatch[1]), unit: unitMatch[1] });
                    return `${p1}: { "val": ${migrated.val}, "unit": "${migrated.unit}" }`;
                }
            } else {
                const migrated = migrateValue(parseFloat(p2));
                return `${p1}: ${migrated}`;
            }
        } catch (e) {
            console.error(`Failed to migrate ${key}: ${e}`);
        }
        return match;
    });
});

fs.writeFileSync(spacingPath, content);
console.log("Migration complete for spacing.ts");
