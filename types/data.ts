export type LocalizedString = {
    Tr: string;
    En?: string;
    Zz?: string;
    Kr?: string;
    [key: string]: string | undefined;
};

export interface LevelData {
    id: string;
    zazaName: string;
    trName: string;
    enName?: string;
    krmncName?: string;
    x: number;
    y: number;
    testIds?: string[];
    type: 'station' | 'topic';
    unitIndex?: number;
    topicIndex?: number;
    unitZazaName?: string;
    unitTrName?: string;
    unitEnName?: string;
    unitKrmncName?: string;
    railX?: number;
    railY?: number;
    tagX?: number;
    tagY?: number;
    signX?: number;
    signY?: number;
    nameWidth?: number;
    railAngle?: number;
    parentUnitId: string | null;
}

export interface MapConfig {
    railWidth: number;
    tieSize: number;
}

export type DecorationType = 'tree' | 'grass' | 'mountain' | 'river' | 'tree1' | 'tree2';

export interface DecorationData {
    id: string;
    type: DecorationType;
    x: number;
    y: number;
    scale: number;
    scaleX?: number;
    scaleY?: number;
    angle: number;
    nodes?: { x: number, y: number }[];
    thickness?: number;
    x2?: number;
    y2?: number;
}

export interface Proverb {
    id: string;
    text: string;
    translation: {
        tr: string;
        en: string;
        krmnc?: string;
    };
}

export interface AppTheme {
    primary: string;
    primaryDark: string;
    secondary: string;
    tertiary: string;
    background: string;
    surface: string;
    textDark: string;
    textLight: string;
    textWhite: string;
    border: string;
    borderRadius: number;
    buttonPadding: number;

    // Question colors
    correct: string;
    correctShadow: string;
    incorrect: string;
    incorrectShadow: string;
    inactive: string;
    inactiveText: string;
    selectedBg: string;
    selectedBorder: string;
    progressBarBg: string;
    progressFill: string;

    // Feedback colors (Footer backgrounds)
    feedbackCorrectBg: string;
    feedbackIncorrectBg: string;

    // UI Accents
    accent: string;
    accentLight: string;
    secondaryLight: string;

    // Button & Layout Sizing
    buttonBorderRadius: number;
    buttonHeight: number;
    buttonVerticalMargin: number;
    buttonContainerPaddingHorizontal: number;
    buttonContainerPaddingBottom: number;
    buttonTextSize: number;

    // Element-specific Overrides
    headerTitleText: string;
    headerTitleFontSize: number;
    headerSubtitleText: string;
    headerHeight: number;
    buttonContinueText: string;
    buttonSettingsText: string;

    // Alignment & Position
    headerTitleAlign: 'left' | 'center';
    headerSubtitleAlign: 'left' | 'center';
    buttonTextAlign: 'left' | 'center';
    headerTopMargin: number;
    headerBottomMargin: number;
    buttonContainerTopMargin: number;
    buttonContainerMarginLeft: number;

    // Granular Colors
    headerTitleColor: string;
    headerSubtitleColor: string;
    buttonContinueColor: string;
    buttonContinueTextColor: string;
    buttonSettingsColor: string;
    buttonSettingsTextColor: string;
    questionTitleColor: string;
    questionPromptColor: string;
    questionBtnColor: string;
    questionBtnTextColor: string;
    proverbsTitleText: string;
    proverbsTitleColor: string;
    proverbsTextColor: string;
    proverbsTranslationColor: string;
    proverbsTitleFontSize: number;
    proverbsTextFontSize: number;
    proverbsTranslationFontSize: number;
    proverbsBgColor: string;
    proverbsBorderColor: string;

    // CoktanSecmeli
    coktanSecmeliBgColor: string;
    coktanSecmeliTextColor: string;
    coktanSecmeliFontSize: number;
    coktanSecmeliSelectedBgColor: string;
    coktanSecmeliSelectedBorderColor: string;
    coktanSecmeliSelectedTextColor: string;

    // WordOrder
    wordOrderBgColor: string;
    wordOrderTextColor: string;
    wordOrderFontSize: number;
    wordOrderSelectedBgColor: string;
    wordOrderSelectedBorderColor: string;
    wordOrderSelectedTextColor: string;

    // Matching
    matchingBgColor: string;
    matchingTextColor: string;
    matchingFontSize: number;
    matchingSelectedBgColor: string;
    matchingSelectedBorderColor: string;
    matchingSelectedTextColor: string;

    // ImageChoice
    imageChoiceBgColor: string;
    imageChoiceTextColor: string;
    imageChoiceFontSize: number;
    imageChoiceSelectedBgColor: string;
    imageChoiceSelectedBorderColor: string;
    imageChoiceSelectedTextColor: string;

    // ChoiceImage
    choiceImageBgColor: string;
    choiceImageTextColor: string;
    choiceImageFontSize: number;
    choiceImageSelectedBgColor: string;
    choiceImageSelectedBorderColor: string;
    choiceImageSelectedTextColor: string;

    // Dialogue
    dialogueBgColor: string;
    dialogueTextColor: string;
    dialogueFontSize: number;
    dialogueSelectedBgColor: string;
    dialogueSelectedBorderColor: string;
    dialogueSelectedTextColor: string;

    // Question Option Styles (Legacy)
    questionOptionBgColor: string;
    questionOptionTextColor: string;
    questionOptionSelectedBgColor: string;
    questionOptionSelectedBorderColor: string;
    questionOptionSelectedTextColor: string;

    // Settings
    settingsHeaderTitle: string;
    settingsTitleFontSize: number;
    settingsMusicSectionTitleFontSize: number; 
    settingsInfoSectionTitleFontSize: number;
    settingsMusicItemFontSize: number; 
    settingsInfoItemFontSize: number;
    settingsSubHeaderFontSize: number;
    settingsMusicSectionTitle: string; 
    settingsInfoSectionTitle: string;
    settingsTeamTitle: string; 
    settingsDedicationTitle: string;
    settingsMusicBadgeTitle: string;
    settingsMusicVolumeTitle: string;

    // Mascot
    mascotHomeTop: number;
    mascotHomeMarginLeft: number;
    mascotHomeSize: number;
    mascotQuestionTop: number;
    mascotQuestionMarginLeft: number;
    mascotQuestionSize: number;
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
}

export interface MusicCredit {
    title: LocalizedString;
    composer: string;
    performer: string;
    source: string;
    link?: string;
    license: string;
    licenseLink: string;
    changes: LocalizedString;
}

export interface Dedication {
    from: string;
    to: LocalizedString;
}

export interface ZazaLingoInfoData {
    mainTitle: LocalizedString;
    teamTitle: LocalizedString;
    dedicationTitle: LocalizedString;
    musicTitle: LocalizedString;
    missionTitle: LocalizedString;
    mission: LocalizedString;
    team: string[];
    dedications: Dedication[];
    music: MusicCredit[];
}
