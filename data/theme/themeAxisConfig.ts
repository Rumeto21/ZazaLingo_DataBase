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
 *   V  -> screenHeight   (dikey buyukluk - Magnitude)
 *   H  -> screenHeight   (yukseklik - Legacy/Mixed)
 *   R  -> screenWidth    (kose yuvarligi - genellikle genislik bazli)
 */

export type ThemeAxis = 'X' | 'Y' | 'W' | 'H' | 'R' | 'V';

export const THEME_AXIS_MAP: Record<string, ThemeAxis> = {
    // ── Maskot: Ana ekran ─────────────────────────────────────────────
    mascotHomeMarginLeft:               'X',
    mascotHomeTop:                      'Y',
    mascotHomeSize:                     'V',

    // ── Maskot: Genel soru fallback ──────────────────────────────────
    mascotQuestionMarginLeft:           'X',
    mascotQuestionTop:                  'Y',
    mascotQuestionSize:                 'V',

    // ── Maskot: Coktan Secmeli ────────────────────────────────────────
    mascotCoktanSecmeliMarginLeft:      'X',
    mascotCoktanSecmeliTop:             'Y',
    mascotCoktanSecmeliSize:            'V',

    // ── Maskot: Kelime Siralama ───────────────────────────────────────
    mascotWordOrderMarginLeft:          'X',
    mascotWordOrderTop:                 'Y',
    mascotWordOrderSize:                'V',

    // ── Maskot: Eslestirme ────────────────────────────────────────────
    mascotMatchingMarginLeft:           'X',
    mascotMatchingTop:                  'Y',
    mascotMatchingSize:                 'V',

    // ── Maskot: Resim Secme ───────────────────────────────────────────
    mascotImageChoiceMarginLeft:        'X',
    mascotImageChoiceTop:               'Y',
    mascotImageChoiceSize:              'V',

    // ── Maskot: Secim Resim ───────────────────────────────────────────
    mascotChoiceImageMarginLeft:        'X',
    mascotChoiceImageTop:               'Y',
    mascotChoiceImageSize:              'V',

    // ── Maskot: Diyalog ──────────────────────────────────────────────
    mascotDialogueMarginLeft:           'X',
    mascotDialogueTop:                  'Y',
    mascotDialogueSize:                 'V',

    // ── Maskot: Dinleme ──────────────────────────────────────────────
    mascotDinlemeMarginLeft:            'X',
    mascotDinlemeTop:                   'Y',
    mascotDinlemeSize:                  'V',

    // ── Maskot: Gorsel Eslesirme ─────────────────────────────────────
    mascotGorselEslesirmeMarginLeft:    'X',
    mascotGorselEslesirmeTop:           'Y',
    mascotGorselEslesirmeSize:          'V',

    // ── Maskot: Cumle Tamamlama ───────────────────────────────────────
    mascotSentenceCompletionMarginLeft: 'X',
    mascotSentenceCompletionTop:        'Y',
    mascotSentenceCompletionSize:       'V',

    // ── Maskot: Image Question (v7.1) ─────────────────────────────────
    mascotImageQuestionMarginLeft:      'X',
    mascotImageQuestionTop:             'Y',
    mascotImageQuestionSize:            'V',

    // ── Header ───────────────────────────────────────────────────────
    headerTitleMarginTop:               'Y',
    headerTitleMarginLeft:              'X',
    headerTitleWidth:                   'W',
    headerTitleHeight:                  'V',
    headerSubtitleMarginTop:            'Y',
    headerSubtitleMarginLeft:           'X',
    headerSubtitleWidth:                'W',
    headerSubtitleHeight:               'V',
    headerHeight:                       'V',
    headerTopMargin:                    'Y',
    headerBottomMargin:                 'Y',

    // ── Butonlar ─────────────────────────────────────────────────────
    buttonWidth:                        'W',
    buttonHeight:                       'V',
    buttonMarginTop:                    'Y',
    buttonMarginLeft:                   'X',
    buttonGap:                          'V',
    buttonBorderRadius:                 'R',
    buttonContainerTopMargin:           'Y',
    buttonContainerMarginLeft:          'X',
    buttonContainerPaddingHorizontal:   'W',
    buttonContainerPaddingBottom:       'V',
    buttonVerticalMargin:               'V',

    // ── Proverbs ─────────────────────────────────────────────────────
    // ── Proverbs ─────────────────────────────────────────────────────
    proverbsMarginTop:                  'Y',
    proverbsMarginLeft:                 'X',
    proverbsWidth:                      'W',
    proverbsHeight:                     'V',

    // ── Soru ekrani: metin kutulari ───────────────────────────────────
    questionTitleMarginTop:             'Y',
    questionTitleMarginLeft:            'X',
    questionTitleWidth:                 'W',
    questionTitleHeight:                'V',
    questionPromptMarginTop:            'Y',
    questionPromptMarginBottom:         'V',
    questionPromptMarginLeft:           'X',
    questionPromptWidth:                'W',
    questionPromptHeight:               'V',
    questionPromptPaddingHorizontal:    'W',
    questionOptionsMarginTop:           'Y',
    questionOptionsMarginBottom:        'V',
    questionOptionsMarginLeft:          'X',
    questionOptionsWidth:               'W',
    questionOptionsHeight:              'V',
    questionOptionsPaddingHorizontal:   'W',

    // ── Soru butonu ───────────────────────────────────────────────────
    questionBtnMarginTop:               'Y',
    questionBtnMarginLeft:              'X',
    questionBtnWidth:                   'W',
    questionBtnHeight:                  'V',
    questionBtnBorderRadius:            'R',

    // ── Genel bordur / padding ────────────────────────────────────────
    borderRadius:                       'R',
    buttonPadding:                      'W',

    // ── Ayarlar koordinatları ─────────────────────────────────────────
    // ── Ayarlar koordinatları ─────────────────────────────────────────
    settingsTitleMarginTop:             'Y',
    settingsTitleMarginLeft:            'X',
    settingsTitleWidth:                 'W',
    settingsTitleHeight:                'V',
    settingsBackMarginTop:              'Y',
    settingsBackMarginLeft:             'X',
    settingsBackWidth:                  'W',
    settingsBackHeight:                 'V',
    settingsMusicSectionMarginTop:      'Y',
    settingsMusicSectionMarginLeft:     'X',
    settingsMusicSectionWidth:          'W',
    settingsMusicSectionHeight:         'V',
    settingsInfoSectionMarginTop:       'Y',
    settingsInfoSectionMarginLeft:      'X',
    settingsInfoSectionWidth:           'W',
    settingsInfoSectionHeight:          'V',
    settingsThemeSectionMarginTop:      'Y',
    settingsThemeSectionMarginLeft:     'X',
    settingsThemeSectionWidth:          'W',
    settingsThemeSectionHeight:         'V',
    settingsThemeItemWidth:             'W',
    settingsThemeItemHeight:            'V',
    settingsThemeItem0MarginTop:        'Y',
    settingsThemeItem0MarginLeft:       'X',
    settingsThemeItem1MarginTop:        'Y',
    settingsThemeItem1MarginLeft:       'X',
    settingsThemeItem2MarginTop:        'Y',
    settingsThemeItem2MarginLeft:       'X',
    settings_music_item_0MarginTop:     'Y',
    settings_music_item_0MarginLeft:    'X',
    settings_music_item_0Width:         'W',
    settings_music_item_0Height:        'V',
    settings_music_item_1MarginTop:     'Y',
    settings_music_item_1MarginLeft:    'X',
    settings_music_item_1Width:         'W',
    settings_music_item_1Height:        'V',
    settings_info_menu_0MarginTop:      'Y',
    settings_info_menu_0MarginLeft:     'X',
    settings_info_menu_0Width:          'W',
    settings_info_menu_0Height:         'V',
    settings_info_menu_1MarginTop:      'Y',
    settings_info_menu_1MarginLeft:     'X',
    settings_info_menu_1Width:          'W',
    settings_info_menu_1Height:         'V',
    settings_info_menu_2MarginTop:      'Y',
    settings_info_menu_2MarginLeft:     'X',
    settings_info_menu_2Width:          'W',
    settings_info_menu_2Height:         'V',
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
    topBarPaddingBottom:                'V',
    topBarDropdownWidth:                'W',
    topBarFlagWidth:                    'W',
    topBarFlagHeight:                   'V',
    topBarHelperMarginLeft:             'W',
};

/**
 * SPATIAL_KEYS: THEME_AXIS_MAP'teki tum key'lerin Set hali.
 * layout.ts'teki scaleTheme() bu Set'i kullanarak oran key'lerini atlıyor.
 */
export const SPATIAL_KEYS: Set<string> = new Set(Object.keys(THEME_AXIS_MAP));
