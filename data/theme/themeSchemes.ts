// VERSION: 1.1.3 - Nuclear Refresh for Solarized Light
export type ThemeType = 'light' | 'dark' | 'solarized';

export const THEME_SCHEMES: Record<ThemeType, any> = {
    light: {
        background: "#ffffff",
        surface: "#ffffff",
        textDark: "#4B4B4B",
        textLight: "#AFAFAF",
        border: "#E5E5E5",
        cardBg: "#ffffff",
        proverbsBgColor: "#eeff00"
    },
    dark: {
        background: "#131F24",
        surface: "#202F36",
        textDark: "#FFFFFF",
        textLight: "#AFAFAF",
        border: "#37464F",
        cardBg: "#202F36"
    },
    solarized: {
        background: "#fdf6e3",
        surface: "#eee8d5",
        textDark: "#586e75",
        textLight: "#93a1a1",
        border: "#d33682",
        selectedBg: "#eee8d5",
        selectedBorder: "#859900",
        cardBg: "#eee8d5",
        primary: "#859900",
        primaryDark: "#586e75",
        headerTitleColor: "#859900",
        // Komponent spesifik Ezici Renkler
        proverbsBgColor: "#eee8d5",
        proverbsBorderColor: "#859900",
        proverbsTextColor: "#586e75",
        coktanSecmeliBgColor: "#eee8d5",
        wordOrderBgColor: "#eee8d5",
        matchingBgColor: "#eee8d5",
        imageChoiceBgColor: "#eee8d5",
        choiceImageBgColor: "#eee8d5",
        dialogueBgColor: "#eee8d5",
        questionOptionBgColor: "#eee8d5",
        questionTitleColor: "#586e75",
        questionPromptColor: "#586e75"
    }
};
