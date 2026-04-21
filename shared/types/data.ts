import { Locale } from './locales';

export type LanguageType = 'Tr' | 'En' | 'Zz' | 'Kr';
export type LocalizedString = {
    Tr: string;
    En?: string;
    Zz?: string;
    Kr?: string;
    [key: string]: string | undefined;
};


export type ThemeUnit = string;

export interface ThemeValue {
    val: number;
    unit: ThemeUnit;
}

export type ThemeCoordinate = number | ThemeValue;

export interface LevelData {
    id: string;
    ZzName: string;
    TrName: string;
    EnName?: string;
    KrName?: string;
    x: number;
    y: number;
    testIds?: string[];
    type: 'station' | 'topic';
    unitIndex?: number;
    topicIndex?: number;
    UnitZzName?: string;
    UnitTrName?: string;
    UnitEnName?: string;
    UnitKrName?: string;
    railX?: number;
    railY?: number;
    tagX?: number;
    tagY?: number;
    signX?: number;
    signY?: number;
    nameWidth?: number;
    railAngle?: number;
    parentUnitId?: string;
}

export interface MapConfig {
    railWidth: number;
    tieSize: number;
    tieThickness?: number;
    tieSpacing?: number;
    grassPatternId?: string;
    title?: Record<string, string>;
}

export type DecorationType = 'tree' | 'grass' | 'mountain' | 'river' | 'tree1' | 'tree2' | 'custom';

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
    imageUrl?: string;
}

export type MapElement = LevelData | DecorationData;
export type MapUpdate = Partial<Omit<LevelData, 'type'> & Omit<DecorationData, 'type'> & { type: string }>;

export type DragTarget = 'station' | 'rail' | 'tag' | 'sign' | 'angle' | 'deco' | 'deco-scale' | 'deco-scale-x' | 'deco-scale-y' | 'deco-rotate' | 'river-node';

export interface DragInfo {
    id: string;
    target: DragTarget;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    nodeIndex?: number;
    origScale?: number;
    origScaleX?: number;
    origScaleY?: number;
}

export interface Proverb {
    id: string;
    text: string;
    translation: {
        Tr: string;
        En: string;
        Kr?: string;
        Zz?: string;
        [key: string]: string | undefined;
    };
}

export interface TestOption {
    id: string;
    text?: Record<string, string>;
    imageUrl?: string;
}

export interface MatchingPair {
    id: string;
    left: Record<string, string>;
    right: Record<string, string>;
}

export interface DialogueItem {
    id: string;
    speaker?: string;
    text: Record<string, string>;
    position?: 'left' | 'right';
    characterImage?: string;
    audioRef?: string;
}

export interface QuestionData {
    id: string;
    type: string;
    title: Record<string, string>;
    promptText: Record<string, string>;
    imageUrl?: string;
    audioRef?: string;
    imageRef?: string; 
    options?: TestOption[];
    correctOptionId?: string;
    matchingPairs?: MatchingPair[];
    dialogueItems?: DialogueItem[];
    poolWords?: string[];
    correctWords?: string[];
}

export interface TestData {
    id: string;
    title: Record<string, string>;
    questions: QuestionData[];
}

export interface BaseTheme {
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
    borderRadius: ThemeCoordinate;
    buttonPadding: ThemeCoordinate;
    accent: string;
    accentLight: string;
    secondaryLight: string;
    textMuted?: string;
    
    buttonBorderRadius: ThemeCoordinate;
    buttonHeight: ThemeCoordinate;
    buttonVerticalMargin: ThemeCoordinate;
    buttonContainerPaddingHorizontal: ThemeCoordinate;
    buttonContainerPaddingBottom: ThemeCoordinate;
    buttonContainerTopMargin: ThemeCoordinate;
    buttonContainerMarginLeft: ThemeCoordinate;
    buttonTextSize: ThemeCoordinate;
    buttonTextAlign: 'left' | 'center' | 'right';
    buttonWidth?: ThemeCoordinate;
    buttonMarginTop?: ThemeCoordinate;
    buttonMarginLeft?: ThemeCoordinate;
    buttonGap?: ThemeCoordinate;
    buttonPaddingVertical?: ThemeCoordinate;
    buttonPaddingHorizontal?: ThemeCoordinate;
}

export interface QuestionTheme {
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
    feedbackCorrectBg: string;
    feedbackIncorrectBg: string;
    
    questionTitleFontSize?: ThemeCoordinate;
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
    questionOptionsWidth?: ThemeCoordinate;
    questionOptionsHeight?: ThemeCoordinate;
    questionOptionsPaddingHorizontal?: ThemeCoordinate;
    questionBtnMarginTop?: ThemeCoordinate;
    questionBtnMarginLeft?: ThemeCoordinate;
    questionBtnWidth?: ThemeCoordinate;
    questionBtnHeight?: ThemeCoordinate;
    questionBtnBorderRadius?: ThemeCoordinate;
    questionTitleWidth?: ThemeCoordinate;
    questionTitleHeight?: ThemeCoordinate;
    questionTitleMarginTop?: ThemeCoordinate;
    questionTitleMarginLeft?: ThemeCoordinate;
    questionPromptWidth?: ThemeCoordinate;
    questionPromptHeight?: ThemeCoordinate;
    questionPageMarginLeft?: ThemeCoordinate;

    // Visual Texts & Colors
    questionTitleText?: string;
    questionPromptText?: string;
    questionBtnText?: string;
    questionTitleColor?: string;
    questionPromptColor?: string;
    questionBtnColor?: string;
    questionBtnTextColor?: string;

    coktanSecmeliBgColor: string;
    coktanSecmeliTextColor: string;
    coktanSecmeliFontSize: ThemeCoordinate;
    coktanSecmeliSelectedBgColor: string;
    coktanSecmeliSelectedBorderColor: string;
    coktanSecmeliSelectedTextColor: string;

    wordOrderBgColor: string;
    wordOrderTextColor: string;
    wordOrderFontSize: ThemeCoordinate;
    wordOrderSelectedBgColor: string;
    wordOrderSelectedBorderColor: string;
    wordOrderSelectedTextColor: string;

    matchingBgColor: string;
    matchingTextColor: string;
    matchingFontSize: ThemeCoordinate;
    matchingSelectedBgColor: string;
    matchingSelectedBorderColor: string;
    matchingSelectedTextColor: string;

    imageChoiceBgColor: string;
    imageChoiceTextColor: string;
    imageChoiceFontSize: ThemeCoordinate;
    imageChoiceSelectedBgColor: string;
    imageChoiceSelectedBorderColor: string;
    imageChoiceSelectedTextColor: string;

    choiceImageBgColor: string;
    choiceImageTextColor: string;
    choiceImageFontSize: ThemeCoordinate;
    choiceImageSelectedBgColor: string;
    choiceImageSelectedBorderColor: string;
    choiceImageSelectedTextColor: string;

    dialogueBgColor: string;
    dialogueTextColor: string;
    dialogueFontSize: ThemeCoordinate;
    dialogueSelectedBgColor: string;
    dialogueSelectedBorderColor: string;
    dialogueSelectedTextColor: string;
}

export interface MapTheme {
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
    
    mapRailWidth: ThemeCoordinate;
    mapTieSize: ThemeCoordinate;
    mapTieThickness: ThemeCoordinate;
    mapTieSpacing: ThemeCoordinate;
    mapPinRadius: ThemeCoordinate;
    mapTopicPinRadius: ThemeCoordinate;
}

export interface ProverbTheme {
    proverbsTitleText: string;
    proverbsTitleColor: string;
    proverbsTextColor: string;
    proverbsTranslationColor: string;
    proverbsTitleFontSize: ThemeCoordinate;
    proverbsTextFontSize: ThemeCoordinate;
    proverbsTranslationFontSize: ThemeCoordinate;
    proverbsBgColor: string;
    proverbsBorderColor: string;
    proverbsWidth?: ThemeCoordinate;
    proverbsHeight?: ThemeCoordinate;
    proverbsMarginTop?: ThemeCoordinate;
    proverbsMarginLeft?: ThemeCoordinate;
    proverbsTextX?: ThemeCoordinate;
    proverbsTextY?: ThemeCoordinate;
    proverbsPaddingHorizontal?: ThemeCoordinate;
    proverbsPaddingVertical?: ThemeCoordinate;
}

export interface MascotTheme {
    mascotHomeTop?: ThemeCoordinate;
    mascotHomeMarginLeft?: ThemeCoordinate;
    mascotHomeSize?: ThemeCoordinate;
    mascotQuestionTop?: ThemeCoordinate;
    mascotQuestionMarginLeft?: ThemeCoordinate;
    mascotQuestionSize?: ThemeCoordinate;
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
}

export interface SettingsTheme {
    settingsHeaderTitle: string;
    settingsTitleFontSize: ThemeCoordinate;
    settingsMusicSectionTitleFontSize: ThemeCoordinate; 
    settingsInfoSectionTitleFontSize: ThemeCoordinate;
    settingsMusicItemFontSize: ThemeCoordinate; 
    settingsInfoItemFontSize: ThemeCoordinate;
    settingsSubHeaderFontSize: ThemeCoordinate;
    settingsMusicSectionTitle: string; 
    settingsInfoSectionTitle: string;
    settingsTeamTitle: string; 
    settingsDedicationTitle: string;
    settingsMusicBadgeTitle: string;
    settingsMusicVolumeTitle: string;
    settings_music_toggleMarginLeft: ThemeCoordinate;
    settings_music_toggleWidth: ThemeCoordinate;
    settings_music_toggleMarginTop: ThemeCoordinate;
    settings_music_slider_generalMarginTop?: ThemeCoordinate;
    settings_music_slider_generalMarginLeft?: ThemeCoordinate;
    settings_music_slider_generalWidth?: ThemeCoordinate;
    settings_music_slider_generalHeight?: ThemeCoordinate;
    settings_music_slider_testMarginTop?: ThemeCoordinate;
    settings_music_slider_testMarginLeft?: ThemeCoordinate;
    settings_music_slider_testWidth?: ThemeCoordinate;
    settings_music_slider_testHeight?: ThemeCoordinate;

    // v7.5 Granular Settings Layout
    settingsBackMarginLeft?: ThemeCoordinate;
    settingsBackMarginTop?: ThemeCoordinate;
    settingsBackWidth?: ThemeCoordinate;
    settingsBackHeight?: ThemeCoordinate;
    settingsBackFontSize?: ThemeCoordinate;

    settingsTitleMarginLeft?: ThemeCoordinate;
    settingsTitleMarginTop?: ThemeCoordinate;
    settingsTitleWidth?: ThemeCoordinate;
    settingsTitleHeight?: ThemeCoordinate;

    settingsThemeItemWidth?: ThemeCoordinate;
    settingsThemeItemHeight?: ThemeCoordinate;
    settingsThemeItem0MarginLeft?: ThemeCoordinate;
    settingsThemeItem0MarginTop?: ThemeCoordinate;
    settingsThemeItem1MarginLeft?: ThemeCoordinate;
    settingsThemeItem1MarginTop?: ThemeCoordinate;
    settingsThemeItem2MarginLeft?: ThemeCoordinate;
    settingsThemeItem2MarginTop?: ThemeCoordinate;

    settingsSliderWidth?: ThemeCoordinate;

    settings_info_menu_0Width?: ThemeCoordinate;
    settings_info_menu_0MarginLeft?: ThemeCoordinate;
    settings_info_menu_0MarginTop?: ThemeCoordinate;
    settings_info_menu_0Height?: ThemeCoordinate;
    settings_info_menu_1Width?: ThemeCoordinate;
    settings_info_menu_1MarginLeft?: ThemeCoordinate;
    settings_info_menu_1MarginTop?: ThemeCoordinate;
    settings_info_menu_1Height?: ThemeCoordinate;
    settings_info_menu_2Width?: ThemeCoordinate;
    settings_info_menu_2MarginLeft?: ThemeCoordinate;
    settings_info_menu_2MarginTop?: ThemeCoordinate;
    settings_info_menu_2Height?: ThemeCoordinate;
    settingsInfoMenuBorderRadius?: ThemeCoordinate;

    settingsContentBoxWidth?: ThemeCoordinate;
    settingsContentBoxMarginLeft?: ThemeCoordinate;
    settingsContentBoxMarginTop?: ThemeCoordinate;
    settingsContentBoxHeight?: ThemeCoordinate;
    settingsContentBoxBorderRadius?: ThemeCoordinate;

    settingsMusicSectionMarginLeft?: ThemeCoordinate;
    settingsMusicSectionWidth?: ThemeCoordinate;
    settingsMusicSectionMarginTop?: ThemeCoordinate;
    settingsMusicSectionHeight?: ThemeCoordinate;
    settingsMenuBorderRadius?: ThemeCoordinate;

    settingsInfoSectionMarginLeft?: ThemeCoordinate;
    settingsInfoSectionWidth?: ThemeCoordinate;
    settingsInfoSectionMarginTop?: ThemeCoordinate;
    settingsInfoSectionHeight?: ThemeCoordinate;

    settingsThemeSectionMarginLeft?: ThemeCoordinate;
    settingsThemeSectionWidth?: ThemeCoordinate;
    settingsThemeSectionMarginTop?: ThemeCoordinate;
    settingsThemeSectionHeight?: ThemeCoordinate;

    settings_music_item_0MarginLeft?: ThemeCoordinate;
    settings_music_item_0Width?: ThemeCoordinate;
    settings_music_item_0MarginTop?: ThemeCoordinate;
    settings_music_item_0Height?: ThemeCoordinate;
    settings_music_item_1MarginLeft?: ThemeCoordinate;
    settings_music_item_1Width?: ThemeCoordinate;
    settings_music_item_1MarginTop?: ThemeCoordinate;
    settings_music_item_1Height?: ThemeCoordinate;
    settingsMusicItemBorderRadius?: ThemeCoordinate;
}

export interface TopBarTheme {
    headerTitleText: string;
    headerSubtitleText: string;
    headerTitleFontSize: ThemeCoordinate;
    headerSubtitleFontSize?: ThemeCoordinate;
    headerHeight: ThemeCoordinate;
    headerTitleAlign: 'left' | 'center' | 'right';
    headerSubtitleAlign: 'left' | 'center' | 'right';
    headerTopMargin: ThemeCoordinate;
    headerBottomMargin: ThemeCoordinate;
    headerTitleColor: string;
    headerSubtitleColor: string;
    topBarFlagWidth: ThemeCoordinate;
    topBarFlagHeight: ThemeCoordinate;
    topBarPaddingHorizontal: ThemeCoordinate;
    topBarPaddingTop: ThemeCoordinate;
    topBarPaddingBottom: ThemeCoordinate;
    topBarDropdownWidth: ThemeCoordinate;
    topBarHelperMarginLeft: ThemeCoordinate;

    // v7.5 Zero-Drift Header Layout
    headerTitleMarginTop?: ThemeCoordinate;
    headerTitleMarginLeft?: ThemeCoordinate;
    headerTitleWidth?: ThemeCoordinate;
    headerTitleHeight?: ThemeCoordinate;
    headerTitleTextX?: ThemeCoordinate;
    headerTitleTextY?: ThemeCoordinate;

    headerSubtitleMarginTop?: ThemeCoordinate;
    headerSubtitleMarginLeft?: ThemeCoordinate;
    headerSubtitleWidth?: ThemeCoordinate;
    headerSubtitleHeight?: ThemeCoordinate;
    headerSubtitleTextX?: ThemeCoordinate;
    headerSubtitleTextY?: ThemeCoordinate;
}

export interface AppTheme extends 
    BaseTheme, 
    QuestionTheme, 
    MapTheme, 
    ProverbTheme, 
    MascotTheme, 
    SettingsTheme, 
    TopBarTheme {
    buttonContinueText: string;
    buttonSettingsText: string;
    buttonContinueColor: string;
    buttonContinueTextColor: string;
    buttonSettingsColor: string;
    buttonSettingsTextColor: string;
}

export type ScaledAppTheme = {
    [K in keyof AppTheme]: AppTheme[K] extends (ThemeCoordinate | undefined) 
        ? (AppTheme[K] extends undefined ? undefined : number)
        : AppTheme[K]
};

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

export interface ZazaConstants {
    welcome: string;
    quoteTitle: string;
}

export interface DevExportData {
    stations: LevelData[];
    tests: Record<string, TestData>;
    proverbs: Proverb[];
    decorations: DecorationData[];
    mapConfig: MapConfig;
    theme: AppTheme;
    info: ZazaLingoInfoData;
    zazaConstants: ZazaConstants;
    themeSchemes: Record<string, Partial<AppTheme>>;
    locales: {
        Tr: Locale;
        En: Locale;
        Zz: Locale;
        Kr: Locale;
    };
}

export type NormalizedAppTheme = ScaledAppTheme;
