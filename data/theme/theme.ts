import { colors } from './tokens/colors';
import { spacing } from './tokens/spacing';
import { typography } from './tokens/typography';
import { questions } from './components/questions';
import { settings } from './components/settings';
import { header } from './components/header';
import { proverbs } from './components/proverbs';
import { buttons } from './components/buttons';
import { map } from './components/map';

export type ThemeUnit = string;

export interface ThemeValue {
    val: number;
    unit: ThemeUnit;
}

export type ThemeCoordinate = number | ThemeValue;

export interface AppTheme {
    primary: string; primaryDark: string; secondary: string; tertiary: string;
    background: string; surface: string; textDark: string; textLight: string;
    textWhite: string; border: string; borderRadius: ThemeCoordinate; buttonPadding: ThemeCoordinate;
    correct: string; correctShadow: string; incorrect: string; incorrectShadow: string;
    inactive: string; inactiveText: string; selectedBg: string; selectedBorder: string;
    progressBarBg: string; progressFill: string; feedbackCorrectBg: string;
    feedbackIncorrectBg: string; accent: string; accentLight: string;
    secondaryLight: string; buttonBorderRadius: ThemeCoordinate; buttonHeight: ThemeCoordinate;
    buttonVerticalMargin: ThemeCoordinate; buttonContainerPaddingHorizontal: ThemeCoordinate;
    buttonContainerPaddingBottom: ThemeCoordinate; buttonTextSize: ThemeCoordinate;
    headerTitleText: string; headerTitleFontSize: ThemeCoordinate; headerSubtitleText: string;
    headerHeight: ThemeCoordinate; buttonContinueText: string; buttonLogoutText: string;
    headerTitleAlign: string; headerSubtitleAlign: string;
    buttonTextAlign: string; headerTopMargin: ThemeCoordinate; headerBottomMargin: ThemeCoordinate;
    buttonContainerTopMargin: ThemeCoordinate; headerTitleColor: string; headerSubtitleColor: string;
    buttonContinueColor: string; buttonContinueTextColor: string; buttonLogoutColor: string;
    buttonLogoutTextColor: string; questionTitleColor: string; questionPromptColor: string;
    questionBtnColor: string; questionBtnTextColor: string; proverbsTitleText: string;
    proverbsTitleColor: string; proverbsTextColor: string; proverbsTranslationColor: string;
    proverbsTitleFontSize: ThemeCoordinate; proverbsTextFontSize: ThemeCoordinate; proverbsTranslationFontSize: ThemeCoordinate;
    proverbsBgColor: string; proverbsBorderColor: string; coktanSecmeliBgColor: string;
    coktanSecmeliTextColor: string; coktanSecmeliFontSize: ThemeCoordinate; coktanSecmeliSelectedBgColor: string;
    coktanSecmeliSelectedBorderColor: string; coktanSecmeliSelectedTextColor: string;
    wordOrderBgColor: string; wordOrderTextColor: string; wordOrderFontSize: ThemeCoordinate;
    wordOrderSelectedBgColor: string; wordOrderSelectedBorderColor: string;
    wordOrderSelectedTextColor: string; matchingBgColor: string; matchingTextColor: string;
    matchingFontSize: ThemeCoordinate; matchingSelectedBgColor: string; matchingSelectedBorderColor: string;
    matchingSelectedTextColor: string; imageChoiceBgColor: string; imageChoiceTextColor: string;
    imageChoiceFontSize: ThemeCoordinate; imageChoiceSelectedBgColor: string;
    imageChoiceSelectedBorderColor: string; imageChoiceSelectedTextColor: string;
    choiceImageBgColor: string; choiceImageTextColor: string; choiceImageFontSize: ThemeCoordinate;
    choiceImageSelectedBgColor: string; choiceImageSelectedBorderColor: string;
    choiceImageSelectedTextColor: string; dialogueBgColor: string; dialogueTextColor: string;
    dialogueFontSize: ThemeCoordinate; dialogueSelectedBgColor: string;
    dialogueSelectedBorderColor: string; dialogueSelectedTextColor: string;
    questionOptionBgColor: string; questionOptionTextColor: string;
    questionOptionSelectedBgColor: string; questionOptionSelectedBorderColor: string;
    questionOptionSelectedTextColor: string;
    settingsHeaderTitle: string;
    settingsTitleFontSize: ThemeCoordinate;
    settingsMusicSectionTitleFontSize: ThemeCoordinate; settingsInfoSectionTitleFontSize: ThemeCoordinate;
    settingsMusicItemFontSize: ThemeCoordinate; settingsInfoItemFontSize: ThemeCoordinate;
    settingsSubHeaderFontSize: ThemeCoordinate;
    settingsMusicSectionTitle: string; settingsInfoSectionTitle: string;
    settingsTeamTitle: string; settingsDedicationTitle: string;
    settingsMusicBadgeTitle: string;
    settingsMusicVolumeTitle: string;
    mascotHomeTop?: ThemeCoordinate;
    mascotHomeMarginLeft?: ThemeCoordinate;
    mascotHomeSize?: ThemeCoordinate;
    mascotQuestionTop?: ThemeCoordinate;
    mascotQuestionMarginLeft?: ThemeCoordinate;
    mascotQuestionSize?: ThemeCoordinate;
    mascotCoktanSecmeliTop?: ThemeCoordinate;
    mascotCoktanSecmeliMarginLeft?: ThemeCoordinate;
    mascotCoktanSecmeliSize?: ThemeCoordinate;
    mascotGorselEslesirmeTop?: ThemeCoordinate;
    mascotGorselEslesirmeMarginLeft?: ThemeCoordinate;
    mascotGorselEslesirmeSize?: ThemeCoordinate;
    mascotDinlemeTop?: ThemeCoordinate;
    mascotDinlemeMarginLeft?: ThemeCoordinate;
    mascotDinlemeSize?: ThemeCoordinate;
    mascotWordOrderTop?: ThemeCoordinate;
    mascotWordOrderMarginLeft?: ThemeCoordinate;
    mascotWordOrderSize?: ThemeCoordinate;
    mascotMatchingTop?: ThemeCoordinate;
    mascotMatchingMarginLeft?: ThemeCoordinate;
    mascotMatchingSize?: ThemeCoordinate;
    mascotSentenceCompletionTop?: ThemeCoordinate;
    mascotSentenceCompletionMarginLeft?: ThemeCoordinate;
    mascotSentenceCompletionSize?: ThemeCoordinate;
    mascotImageChoiceTop?: ThemeCoordinate;
    mascotImageChoiceMarginLeft?: ThemeCoordinate;
    mascotImageChoiceSize?: ThemeCoordinate;
    mascotChoiceImageTop?: ThemeCoordinate;
    mascotChoiceImageMarginLeft?: ThemeCoordinate;
    mascotChoiceImageSize?: ThemeCoordinate;
    mascotDialogueTop?: ThemeCoordinate;
    mascotDialogueMarginLeft?: ThemeCoordinate;
    mascotDialogueSize?: ThemeCoordinate;
    questionPromptFontSize?: ThemeCoordinate;
    questionOptionFontSize?: ThemeCoordinate;
    questionBtnTextFontSize?: ThemeCoordinate;
    questionPromptMarginTop?: ThemeCoordinate;
    questionPromptMarginBottom?: ThemeCoordinate;
    questionPromptMarginLeft?: ThemeCoordinate;
    questionPromptPaddingHorizontal?: ThemeCoordinate;
    questionOptionsMarginTop?: ThemeCoordinate;
    questionOptionsMarginBottom?: ThemeCoordinate;
    questionOptionsMarginLeft?: ThemeCoordinate;
    questionOptionsPaddingHorizontal?: ThemeCoordinate;

    // Map Specific
    mapBgColor: string;
    mapGridColor: string;
    mapRiverColor: string;
    railSteelColor: string;
    railActiveColor: string;
    tieNormalColor: string;
    tieActiveColor: string;
    pinLockedBg: string;
    pinLockedFg: string;
    pinActiveBg: string;
    pinActiveFg: string;
    pinActiveRing: string;
    pinDoneBg: string;
    pinDoneFg: string;
    pinDoneRing: string;
    labelBgColor: string;
    labelTextColor: string;
    labelLockedColor: string;
    locoColor: string;
    locoAccentColor: string;
    locoWindowColor: string;
    locoLightColor: string;
    
    // Map Sizing (Ratios)
    mapRailWidth: ThemeCoordinate;
    mapTieSize: ThemeCoordinate;
    mapTieThickness: ThemeCoordinate;
    mapTieSpacing: ThemeCoordinate;
    mapPinRadius: ThemeCoordinate;
    mapTopicPinRadius: ThemeCoordinate;
}

export const themeConfig: AppTheme = {
    ...colors,
    ...spacing,
    ...typography,
    ...questions,
    ...settings,
    ...header,
    ...proverbs,
    ...buttons,
    ...map
};
