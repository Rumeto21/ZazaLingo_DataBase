/**
 * themeAxisConfig.ts
 *
 * Her theme key'inin hangi eksene (X / Y / W / H / R) ait oldugunu tanimlar.
 * Bu bilgi iki amacla kullanilir:
 *   1. DevApp (themeToRatios.ts): piksel degerler -> oran donusumu icin baz boyut secimi
 *   2. ZazaLingoApp (screenLayout.ts, layout.ts): oran degerler -> piksel carpimi icin eksen secimi
 *
 * Eksen birimler:
 *   X  -> screenWidth    (yatay merkez kaymasi)
 *   Y  -> screenHeight   (dikey merkez kaymasi)
 *   W  -> screenWidth    (genislik)
 *   H  -> screenHeight   (yukseklik)
 *   R  -> screenWidth    (kose yuvarligi - genellikle genislik bazli)
 */

export type ThemeAxis = 'X' | 'Y' | 'W' | 'H' | 'R';

export const THEME_AXIS_MAP: Record<string, ThemeAxis> = {
    // ── Maskot: Ana ekran ─────────────────────────────────────────────
    mascotHomeMarginLeft:               'X',
    mascotHomeTop:                      'Y',
    mascotHomeSize:                     'W',

    // ── Maskot: Genel soru fallback ──────────────────────────────────
    mascotQuestionMarginLeft:           'X',
    mascotQuestionTop:                  'Y',
    mascotQuestionSize:                 'W',

    // ── Maskot: Coktan Secmeli ────────────────────────────────────────
    mascotCoktanSecmeliMarginLeft:      'X',
    mascotCoktanSecmeliTop:             'Y',
    mascotCoktanSecmeliSize:            'W',

    // ── Maskot: Kelime Siralama ───────────────────────────────────────
    mascotWordOrderMarginLeft:          'X',
    mascotWordOrderTop:                 'Y',
    mascotWordOrderSize:                'W',

    // ── Maskot: Eslestirme ────────────────────────────────────────────
    mascotMatchingMarginLeft:           'X',
    mascotMatchingTop:                  'Y',
    mascotMatchingSize:                 'W',

    // ── Maskot: Resim Secme ───────────────────────────────────────────
    mascotImageChoiceMarginLeft:        'X',
    mascotImageChoiceTop:               'Y',
    mascotImageChoiceSize:              'W',

    // ── Maskot: Secim Resim ───────────────────────────────────────────
    mascotChoiceImageMarginLeft:        'X',
    mascotChoiceImageTop:               'Y',
    mascotChoiceImageSize:              'W',

    // ── Maskot: Diyalog ──────────────────────────────────────────────
    mascotDialogueMarginLeft:           'X',
    mascotDialogueTop:                  'Y',
    mascotDialogueSize:                 'W',

    // ── Maskot: Dinleme ──────────────────────────────────────────────
    mascotDinlemeMarginLeft:            'X',
    mascotDinlemeTop:                   'Y',
    mascotDinlemeSize:                  'W',

    // ── Maskot: Gorsel Eslesirme ─────────────────────────────────────
    mascotGorselEslesirmeMarginLeft:    'X',
    mascotGorselEslesirmeTop:           'Y',
    mascotGorselEslesirmeSize:          'W',

    // ── Maskot: Cumle Tamamlama ───────────────────────────────────────
    mascotSentenceCompletionMarginLeft: 'X',
    mascotSentenceCompletionTop:        'Y',
    mascotSentenceCompletionSize:       'W',

    // ── Header ───────────────────────────────────────────────────────
    headerTitleMarginTop:               'Y',
    headerTitleMarginLeft:              'X',
    headerTitleWidth:                   'W',
    headerTitleHeight:                  'H',
    headerSubtitleMarginTop:            'Y',
    headerSubtitleMarginLeft:           'X',
    headerSubtitleWidth:                'W',
    headerSubtitleHeight:               'H',
    headerHeight:                       'H',
    headerTopMargin:                    'Y',
    headerBottomMargin:                 'Y',

    // ── Butonlar ─────────────────────────────────────────────────────
    buttonWidth:                        'W',
    buttonHeight:                       'H',
    buttonMarginTop:                    'Y',
    buttonMarginLeft:                   'X',
    buttonGap:                          'H',
    buttonBorderRadius:                 'R',
    buttonContainerTopMargin:           'Y',
    buttonContainerMarginLeft:          'X',
    buttonContainerPaddingHorizontal:   'W',
    buttonContainerPaddingBottom:       'H',
    buttonVerticalMargin:               'H',

    // ── Proverbs ─────────────────────────────────────────────────────
    // ── Proverbs ─────────────────────────────────────────────────────
    proverbsMarginTop:                  'Y',
    proverbsMarginLeft:                 'X',
    proverbsWidth:                      'W',
    proverbsHeight:                     'H',

    // ── Soru ekrani: metin kutulari ───────────────────────────────────
    questionTitleMarginTop:             'Y',
    questionTitleMarginLeft:            'X',
    questionTitleWidth:                 'W',
    questionTitleHeight:                'H',
    questionPromptMarginTop:            'Y',
    questionPromptMarginBottom:         'H',
    questionPromptMarginLeft:           'X',
    questionPromptWidth:                'W',
    questionPromptHeight:               'H',
    questionPromptPaddingHorizontal:    'W',
    questionOptionsMarginTop:           'Y',
    questionOptionsMarginBottom:        'H',
    questionOptionsMarginLeft:          'X',
    questionOptionsWidth:               'W',
    questionOptionsHeight:              'H',
    questionOptionsPaddingHorizontal:   'W',

    // ── Soru butonu ───────────────────────────────────────────────────
    questionBtnMarginTop:               'Y',
    questionBtnMarginLeft:              'X',
    questionBtnWidth:                   'W',
    questionBtnHeight:                  'H',
    questionBtnBorderRadius:            'R',

    // ── Genel bordur / padding ────────────────────────────────────────
    borderRadius:                       'R',
    buttonPadding:                      'W',

    // ── Ayarlar koordinatları ─────────────────────────────────────────
    // ── Ayarlar koordinatları ─────────────────────────────────────────
    settingsTitleMarginTop:             'Y',
    settingsTitleMarginLeft:            'X',
    settingsTitleWidth:                 'W',
    settingsTitleHeight:                'H',
    settingsBackMarginTop:              'Y',
    settingsBackMarginLeft:             'X',
    settingsBackWidth:                  'W',
    settingsBackHeight:                 'H',
    settingsMusicSectionMarginTop:      'Y',
    settingsMusicSectionMarginLeft:     'X',
    settingsMusicSectionWidth:          'W',
    settingsMusicSectionHeight:         'H',
    settingsInfoSectionMarginTop:       'Y',
    settingsInfoSectionMarginLeft:      'X',
    settingsInfoSectionWidth:           'W',
    settingsInfoSectionHeight:          'H',
    settingsThemeSectionMarginTop:      'Y',
    settingsThemeSectionMarginLeft:     'X',
    settingsThemeSectionWidth:          'W',
    settingsThemeSectionHeight:         'H',
    settingsThemeItemWidth:             'W',
    settingsThemeItemHeight:            'H',
    settingsThemeItem0MarginTop:        'Y',
    settingsThemeItem0MarginLeft:       'X',
    settingsThemeItem1MarginTop:        'Y',
    settingsThemeItem1MarginLeft:       'X',
    settingsThemeItem2MarginTop:        'Y',
    settingsThemeItem2MarginLeft:       'X',
    settings_music_item_0MarginTop:     'Y',
    settings_music_item_0MarginLeft:    'X',
    settings_music_item_0Width:         'W',
    settings_music_item_0Height:        'H',
    settings_music_item_1MarginTop:     'Y',
    settings_music_item_1MarginLeft:    'X',
    settings_music_item_1Width:         'W',
    settings_music_item_1Height:        'H',
    settings_info_menu_0MarginTop:      'Y',
    settings_info_menu_0MarginLeft:     'X',
    settings_info_menu_0Width:          'W',
    settings_info_menu_0Height:         'H',
    settings_info_menu_1MarginTop:      'Y',
    settings_info_menu_1MarginLeft:     'X',
    settings_info_menu_1Width:          'W',
    settings_info_menu_1Height:         'H',
    settings_info_menu_2MarginTop:      'Y',
    settings_info_menu_2MarginLeft:     'X',
    settings_info_menu_2Width:          'W',
    settings_info_menu_2Height:         'H',
    settingsMenuBorderRadius:           'R',
    settingsMusicItemBorderRadius:      'R',
    settingsThemeItemBorderRadius:      'R',
    settingsInfoMenuBorderRadius:       'R',
    settingsContentBoxBorderRadius:     'R',
    settingsMusicToggleBorderRadius:    'R',
    settingsMusicSliderBorderRadius:    'R',
    // ── TopBar ────────────────────────────────────────────────────────
    topBarPaddingHorizontal:            'W',
    topBarPaddingTop:                   'Y',
    topBarPaddingBottom:                'H',
    topBarDropdownWidth:                'W',
    topBarFlagWidth:                    'W',
    topBarFlagHeight:                   'H',
    topBarHelperMarginLeft:             'W',
};

/**
 * SPATIAL_KEYS: THEME_AXIS_MAP'teki tum key'lerin Set hali.
 * layout.ts'teki scaleTheme() bu Set'i kullanarak oran key'lerini atlıyor.
 */
export const SPATIAL_KEYS: Set<string> = new Set(Object.keys(THEME_AXIS_MAP));
