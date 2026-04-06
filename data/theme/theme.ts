import { colors } from './tokens/colors';
import { spacing } from './tokens/spacing';
import { typography } from './tokens/typography';
import { questions } from './components/questions';
import { settings } from './components/settings';
import { header } from './components/header';
import { proverbs } from './components/proverbs';
import { buttons } from './components/buttons';

export interface AppTheme {
    primary: string; primaryDark: string; secondary: string; tertiary: string;
    background: string; surface: string; textDark: string; textLight: string;
    textWhite: string; border: string; borderRadius: number; buttonPadding: number;
    correct: string; correctShadow: string; incorrect: string; incorrectShadow: string;
    inactive: string; inactiveText: string; selectedBg: string; selectedBorder: string;
    progressBarBg: string; progressFill: string; feedbackCorrectBg: string;
    feedbackIncorrectBg: string; accent: string; accentLight: string;
    secondaryLight: string; buttonBorderRadius: number; buttonHeight: number;
    buttonVerticalMargin: number; buttonContainerPaddingHorizontal: number;
    buttonContainerPaddingBottom: number; buttonTextSize: number;
    headerTitleText: string; headerTitleFontSize: number; headerSubtitleText: string;
    headerHeight: number; buttonContinueText: string; buttonLogoutText: string;
    headerTitleAlign: 'left' | 'center'; headerSubtitleAlign: 'left' | 'center';
    buttonTextAlign: 'left' | 'center'; headerTopMargin: number; headerBottomMargin: number;
    buttonContainerTopMargin: number; headerTitleColor: string; headerSubtitleColor: string;
    buttonContinueColor: string; buttonContinueTextColor: string; buttonLogoutColor: string;
    buttonLogoutTextColor: string; questionTitleColor: string; questionPromptColor: string;
    questionBtnColor: string; questionBtnTextColor: string; proverbsTitleText: string;
    proverbsTitleColor: string; proverbsTextColor: string; proverbsTranslationColor: string;
    proverbsTitleFontSize: number; proverbsTextFontSize: number; proverbsTranslationFontSize: number;
    proverbsBgColor: string; proverbsBorderColor: string; coktanSecmeliBgColor: string;
    coktanSecmeliTextColor: string; coktanSecmeliFontSize: number; coktanSecmeliSelectedBgColor: string;
    coktanSecmeliSelectedBorderColor: string; coktanSecmeliSelectedTextColor: string;
    wordOrderBgColor: string; wordOrderTextColor: string; wordOrderFontSize: number;
    wordOrderSelectedBgColor: string; wordOrderSelectedBorderColor: string;
    wordOrderSelectedTextColor: string; matchingBgColor: string; matchingTextColor: string;
    matchingFontSize: number; matchingSelectedBgColor: string; matchingSelectedBorderColor: string;
    matchingSelectedTextColor: string; imageChoiceBgColor: string; imageChoiceTextColor: string;
    imageChoiceFontSize: number; imageChoiceSelectedBgColor: string;
    imageChoiceSelectedBorderColor: string; imageChoiceSelectedTextColor: string;
    choiceImageBgColor: string; choiceImageTextColor: string; choiceImageFontSize: number;
    choiceImageSelectedBgColor: string; choiceImageSelectedBorderColor: string;
    choiceImageSelectedTextColor: string; dialogueBgColor: string; dialogueTextColor: string;
    dialogueFontSize: number; dialogueSelectedBgColor: string;
    dialogueSelectedBorderColor: string; dialogueSelectedTextColor: string;
    questionOptionBgColor: string; questionOptionTextColor: string;
    questionOptionSelectedBgColor: string; questionOptionSelectedBorderColor: string;
    questionOptionSelectedTextColor: string;
    settingsHeaderTitle: string;
    settingsTitleFontSize: number;
    settingsMusicSectionTitleFontSize: number; settingsInfoSectionTitleFontSize: number;
    settingsMusicItemFontSize: number; settingsInfoItemFontSize: number;
    settingsSubHeaderFontSize: number;
    settingsMusicSectionTitle: string; settingsInfoSectionTitle: string;
    settingsTeamTitle: string; settingsDedicationTitle: string;
    settingsMusicBadgeTitle: string;
    settingsMusicVolumeTitle: string;
    mascotHomeTop: number;
    mascotHomeMarginLeft: number;
    mascotHomeSize: number;
    mascotQuestionTop: number;
    mascotQuestionMarginLeft: number;
    mascotQuestionSize: number;
    mascotCoktanSecmeliTop: number;
    mascotCoktanSecmeliMarginLeft: number;
    mascotCoktanSecmeliSize: number;
    mascotGorselEslesirmeTop: number;
    mascotGorselEslesirmeMarginLeft: number;
    mascotGorselEslesirmeSize: number;
    mascotDinlemeTop: number;
    mascotDinlemeMarginLeft: number;
    mascotDinlemeSize: number;
    mascotWordOrderTop: number;
    mascotWordOrderMarginLeft: number;
    mascotWordOrderSize: number;
    mascotMatchingTop: number;
    mascotMatchingMarginLeft: number;
    mascotMatchingSize: number;
    mascotSentenceCompletionTop: number;
    mascotSentenceCompletionMarginLeft: number;
    mascotSentenceCompletionSize: number;
    mascotImageChoiceTop: number;
    mascotImageChoiceMarginLeft: number;
    mascotImageChoiceSize: number;
    mascotChoiceImageTop: number;
    mascotChoiceImageMarginLeft: number;
    mascotChoiceImageSize: number;
    mascotDialogueTop: number;
    mascotDialogueMarginLeft: number;
    mascotDialogueSize: number;
    questionPromptFontSize: number;
    questionOptionFontSize: number;
    questionBtnTextFontSize: number;
    questionPromptMarginTop: number;
    questionPromptMarginBottom: number;
    questionPromptMarginLeft: number;
    questionPromptPaddingHorizontal: number;
    questionOptionsMarginTop: number;
    questionOptionsMarginBottom: number;
    questionOptionsMarginLeft: number;
    questionOptionsPaddingHorizontal: number;
}

export const themeConfig: AppTheme = {
    ...colors,
    ...spacing,
    ...typography,
    ...questions,
    ...settings,
    ...header,
    ...proverbs,
    ...buttons
};
