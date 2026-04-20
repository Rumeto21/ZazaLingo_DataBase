const path = require('path');
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
                'buttonLogoutColor', 'buttonLogoutTextColor',
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
            'components/buttons.ts': ['buttonContinueText', 'buttonLogoutText', 'buttonTextAlign']
        };
    }

    async save(theme, { adapter }) {
        if (!theme) return;
        for (const [relativePath, keys] of Object.entries(this.mapping)) {
            const partData = {};
            keys.forEach(k => { if (k in theme) partData[k] = theme[k]; });
            const varName = path.basename(relativePath, '.ts');
            await adapter.injectData(path.join('theme', relativePath), varName, partData, 
                `export const ${varName} = {{DATA}};`);
        }
        await adapter.injectJSON(path.join('theme', 'themeConfig.json'), theme);
        logger.info('[ThemeHandler] Modular files and themeConfig.json updated.');
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
