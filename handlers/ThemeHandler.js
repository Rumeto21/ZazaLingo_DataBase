const path = require('path');
const fs = require('fs');
const logger = require('../logger');

class ThemeHandler {
    constructor() {
        this.mapping = {
            'tokens/colors.ts': [
                'primary', 'primaryDark', 'secondary', 'tertiary', 'background', 'surface',
                'textDark', 'textLight', 'textWhite', 'border',
                'correct', 'correctShadow', 'incorrect', 'incorrectShadow',
                'inactive', 'inactiveText', 'selectedBg', 'selectedBorder',
                'progressBarBg', 'progressFill', 'feedbackCorrectBg', 'feedbackIncorrectBg',
                'accent', 'accentLight', 'secondaryLight',
                'headerTitleColor', 'headerSubtitleColor',
                'buttonContinueColor', 'buttonContinueTextColor',
                'buttonSettingsColor', 'buttonSettingsTextColor',
                'questionTitleColor', 'questionPromptColor', 'questionBtnColor', 'questionBtnTextColor',
                'proverbsTitleColor', 'proverbsTextColor', 'proverbsTranslationColor',
                'proverbsBgColor', 'proverbsBorderColor'
            ],
            'components/map.ts': [
                'mapBgColor', 'mapGridColor', 'mapRiverColor', 'railSteelColor', 'railActiveColor',
                'tieNormalColor', 'tieActiveColor', 'pinLockedBg', 'pinLockedFg', 'pinActiveBg',
                'pinActiveFg', 'pinActiveRing', 'pinDoneBg', 'pinDoneFg', 'pinDoneRing',
                'labelBgColor', 'labelTextColor', 'labelLockedColor', 'locoColor',
                'locoAccentColor', 'locoWindowColor', 'locoLightColor',
                'mapRailWidth', 'mapTieSize', 'mapTieThickness', 'mapTieSpacing',
                'mapPinRadius', 'mapTopicPinRadius'
            ],
            'tokens/spacing.ts': [
                'borderRadius', 'buttonPadding', 'buttonBorderRadius', 'buttonHeight',
                'buttonVerticalMargin', 'buttonContainerPaddingHorizontal', 'buttonContainerPaddingBottom',
                'headerHeight', 'headerTopMargin', 'headerBottomMargin',
                'buttonContainerTopMargin', 'buttonContainerMarginLeft',
                'buttonWidth', 'buttonMarginTop', 'buttonMarginLeft', 'buttonGap',
                'headerTitleMarginTop', 'headerTitleMarginLeft', 'headerTitleWidth', 'headerTitleHeight',
                'headerSubtitleMarginTop', 'headerSubtitleMarginLeft', 'headerSubtitleWidth', 'headerSubtitleHeight',
                'proverbsMarginTop', 'proverbsMarginLeft', 'proverbsWidth', 'proverbsHeight',
                'mascotHomeTop', 'mascotHomeMarginLeft', 'mascotHomeSize',
                'mascotQuestionTop', 'mascotQuestionMarginLeft', 'mascotQuestionSize',
                'mascotWordOrderTop', 'mascotWordOrderMarginLeft', 'mascotWordOrderSize',
                'mascotMatchingTop', 'mascotMatchingMarginLeft', 'mascotMatchingSize',
                'mascotImageChoiceTop', 'mascotImageChoiceMarginLeft', 'mascotImageChoiceSize',
                'mascotChoiceImageTop', 'mascotChoiceImageMarginLeft', 'mascotChoiceImageSize',
                'mascotDialogueTop', 'mascotDialogueMarginLeft', 'mascotDialogueSize',
                'mascotDinlemeTop', 'mascotDinlemeMarginLeft', 'mascotDinlemeSize',
                'mascotGorselEslesirmeTop', 'mascotGorselEslesirmeMarginLeft', 'mascotGorselEslesirmeSize',
                'mascotSentenceCompletionTop', 'mascotSentenceCompletionMarginLeft', 'mascotSentenceCompletionSize',
                'mascotImageQuestionTop', 'mascotImageQuestionMarginLeft', 'mascotImageQuestionSize',
                'questionTitleMarginTop', 'questionTitleMarginLeft', 'questionTitleWidth', 'questionTitleHeight',
                'questionPromptMarginTop', 'questionPromptMarginBottom', 'questionPromptMarginLeft',
                'questionPromptWidth', 'questionPromptHeight', 'questionPromptPaddingHorizontal',
                'questionOptionsMarginTop', 'questionOptionsMarginBottom', 'questionOptionsMarginLeft',
                'questionOptionsWidth', 'questionOptionsHeight', 'questionOptionsPaddingHorizontal',
                'questionBtnMarginTop', 'questionBtnMarginLeft', 'questionBtnWidth', 'questionBtnHeight',
                'questionBtnBorderRadius',
                'settingsTitleMarginTop', 'settingsTitleMarginLeft', 'settingsTitleWidth', 'settingsTitleHeight',
                'settingsBackMarginTop', 'settingsBackMarginLeft', 'settingsBackWidth', 'settingsBackHeight', 'settingsBackFontSize',
                'settingsMusicSectionMarginTop', 'settingsMusicSectionMarginLeft', 'settingsMusicSectionWidth', 'settingsMusicSectionHeight',
                'settingsInfoSectionMarginTop', 'settingsInfoSectionMarginLeft', 'settingsInfoSectionWidth', 'settingsInfoSectionHeight',
                'settingsThemeSectionMarginTop', 'settingsThemeSectionMarginLeft', 'settingsThemeSectionWidth', 'settingsThemeSectionHeight',
                'settingsThemeItemWidth', 'settingsThemeItemHeight',
                'settingsThemeItem0MarginTop', 'settingsThemeItem0MarginLeft',
                'settingsThemeItem1MarginTop', 'settingsThemeItem1MarginLeft',
                'settingsThemeItem2MarginTop', 'settingsThemeItem2MarginLeft',
                'settings_music_item_0MarginTop', 'settings_music_item_0MarginLeft', 'settings_music_item_0Width', 'settings_music_item_0Height',
                'settings_music_item_1MarginTop', 'settings_music_item_1MarginLeft', 'settings_music_item_1Width', 'settings_music_item_1Height',
                'settings_info_menu_0MarginTop', 'settings_info_menu_0MarginLeft', 'settings_info_menu_0Width', 'settings_info_menu_0Height',
                'settings_info_menu_1MarginTop', 'settings_info_menu_1MarginLeft', 'settings_info_menu_1Width', 'settings_info_menu_1Height',
                'settings_info_menu_2MarginTop', 'settings_info_menu_2MarginLeft', 'settings_info_menu_2Width', 'settings_info_menu_2Height',
                'settingsMenuBorderRadius', 'settingsMusicItemBorderRadius', 'settingsThemeItemBorderRadius',
                'settingsInfoMenuBorderRadius', 'settingsContentBoxBorderRadius', 'settingsMusicToggleBorderRadius',
                'settingsMusicSliderBorderRadius',
                'settingsContentBoxWidth', 'settingsContentBoxHeight', 'settingsContentBoxMarginLeft', 'settingsContentBoxMarginTop',
                'settings_music_toggleWidth', 'settings_music_toggleHeight', 'settings_music_toggleMarginTop', 'settings_music_toggleMarginLeft',
                'settings_music_slider_generalWidth', 'settings_music_slider_generalHeight', 'settings_music_slider_generalMarginTop', 'settings_music_slider_generalMarginLeft',
                'settings_music_slider_testWidth', 'settings_music_slider_testHeight', 'settings_music_slider_testMarginTop', 'settings_music_slider_testMarginLeft',
                'topBarPaddingHorizontal', 'topBarPaddingTop', 'topBarPaddingBottom', 'topBarDropdownWidth',
                'topBarFlagWidth', 'topBarFlagHeight', 'topBarHelperMarginLeft'
            ],
            'tokens/typography.ts': [
                'buttonTextSize', 'headerTitleFontSize', 'headerSubtitleFontSize',
                'questionPromptFontSize', 'questionOptionFontSize', 'questionBtnTextFontSize',
                'questionTitleFontSize', 'proverbsTitleFontSize', 'proverbsTextFontSize', 
                'proverbsTranslationFontSize', 'settingsTitleFontSize', 'settingsMusicSectionTitleFontSize',
                'settingsInfoSectionTitleFontSize', 'settingsMusicItemFontSize', 'settingsInfoItemFontSize',
                'settingsSubHeaderFontSize', 'settingsBackFontSize'
            ],
            'components/questions.ts': [
                'coktanSecmeliBgColor', 'coktanSecmeliTextColor', 'coktanSecmeliSelectedBgColor',
                'coktanSecmeliSelectedBorderColor', 'coktanSecmeliSelectedTextColor',
                'wordOrderBgColor', 'wordOrderTextColor', 'wordOrderSelectedBgColor',
                'wordOrderSelectedBorderColor', 'wordOrderSelectedTextColor',
                'matchingBgColor', 'matchingTextColor', 'matchingSelectedBgColor',
                'matchingSelectedBorderColor', 'matchingSelectedTextColor',
                'imageChoiceBgColor', 'imageChoiceTextColor', 'imageChoiceSelectedBgColor',
                'imageChoiceSelectedBorderColor', 'imageChoiceSelectedTextColor',
                'choiceImageBgColor', 'choiceImageTextColor', 'choiceImageSelectedBgColor',
                'choiceImageSelectedBorderColor', 'choiceImageSelectedTextColor',
                'dialogueBgColor', 'dialogueTextColor', 'dialogueSelectedBgColor',
                'dialogueSelectedBorderColor', 'dialogueSelectedTextColor',
                'questionOptionBgColor', 'questionOptionTextColor', 'questionOptionSelectedBgColor',
                'questionOptionSelectedBorderColor', 'questionOptionSelectedTextColor'
            ],
            'components/settings.ts': [
                'settingsHeaderTitle', 'settingsMusicSectionTitle', 'settingsInfoSectionTitle',
                'settingsTeamTitle', 'settingsDedicationTitle', 'settingsMusicBadgeTitle', 'settingsMusicVolumeTitle'
            ],
            'components/header.ts': ['headerTitleText', 'headerSubtitleText', 'headerTitleAlign', 'headerSubtitleAlign'],
            'components/proverbs.ts': ['proverbsTitleText'],
            'components/buttons.ts': ['buttonContinueText', 'buttonSettingsText', 'buttonTextAlign']
        };
    }

    async save(theme, { adapter, themeDir }) {
        if (!theme) {
            logger.warn('[ThemeHandler] No theme data in payload, skipping save.');
            return;
        }

        // --- SSoT Protection: Use themeDir from context or fallback to relative path ---
        const themeConfigPath = themeDir 
            ? path.join(themeDir, 'themeConfig.json')
            : path.join(__dirname, '../data/theme/themeConfig.json');

        let mergedTheme = { ...theme };
        try {
            if (fs.existsSync(themeConfigPath)) {
                const raw = fs.readFileSync(themeConfigPath, 'utf-8');
                const currentConfig = JSON.parse(raw);
                
                // Only merge if currentConfig is a valid object with keys
                if (currentConfig && typeof currentConfig === 'object' && Object.keys(currentConfig).length > 0) {
                    // Pre-merge check: If incoming theme is very small compared to existing, log it
                    if (Object.keys(theme).length < Object.keys(currentConfig).length / 2) {
                        logger.warn(`[ThemeHandler] Partial update detected (${Object.keys(theme).length} vs ${Object.keys(currentConfig).length}). Merging to protect data.`);
                    }
                    mergedTheme = { ...currentConfig, ...theme };
                }
            } else {
                logger.warn(`[ThemeHandler] themeConfig.json not found at ${themeConfigPath}. Proceeding with payload.`);
            }
        } catch (err) {
            logger.error(`[ThemeHandler] Merge failed at ${themeConfigPath}: ${err.message}`);
            // If it's a parse error, we definitely don't want to overwrite with possibly bad data
            // unless the user intended to start fresh. But for safety, we fallback to payload.
        }

        logger.info(`[ThemeHandler] Final theme contains ${Object.keys(mergedTheme).length} keys.`);
        
        for (const [relativePath, keys] of Object.entries(this.mapping)) {
            const partData = {};
            let matchCount = 0;
            keys.forEach(k => { 
                if (k in mergedTheme) {
                    partData[k] = mergedTheme[k]; 
                    matchCount++;
                }
            });
            
            if (matchCount > 0) {
                const varName = path.basename(relativePath, '.ts');
                await adapter.injectData(path.join('theme', relativePath), varName, partData, 
                    `export const ${varName} = {{DATA}};`);
            } else {
                logger.debug(`[ThemeHandler] No keys found for ${relativePath}, skipping.`);
            }
        }

        await adapter.injectJSON(path.join('theme', 'themeConfig.json'), mergedTheme);
        logger.info('[ThemeHandler] Modular files and themeConfig.json updated (Fail-Safe Merged).');
    }
}

class ThemeSchemesHandler {
    async save(themeSchemes, { adapter }) {
        if (!themeSchemes) return;
        await adapter.injectJSON(path.join('theme', 'themeSchemes.json'), themeSchemes);
        logger.info('[ThemeHandler] themeSchemes.json updated.');
    }
}

module.exports = { ThemeHandler, ThemeSchemesHandler };
