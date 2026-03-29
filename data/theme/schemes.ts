// VERSION: 1.1.2 - Force Refresh for Solarized Light
export type ThemeType = 'light' | 'dark' | 'solarized';

export const THEME_SCHEMES: Record<ThemeType, any> = {
    light: {
        // Light is the base, these are redundant but kept for clarity
        background: "#ffffff",
        surface: "#ffffff",
        textDark: "#4B4B4B",
        textLight: "#AFAFAF",
        border: "#E5E5E5",
        selectedBg: "#DDF4FF",
        selectedBorder: "#84D8FF",
        cardBg: "#ffffff",
        coktanSecmeliBgColor: "#FFFFFF",
        wordOrderBgColor: "#FFFFFF",
        matchingBgColor: "#FFFFFF",
        imageChoiceBgColor: "#FFFFFF",
        choiceImageBgColor: "#FFFFFF",
        dialogueBgColor: "#FFFFFF",
        questionOptionBgColor: "#FFFFFF"
    },
    dark: {
        background: "#131F24",
        surface: "#202F36",
        textDark: "#FFFFFF",
        textLight: "#AFAFAF",
        border: "#37464F",
        selectedBg: "#37464F",
        selectedBorder: "#58CC02", // Highlight with primary
        cardBg: "#202F36",
        coktanSecmeliBgColor: "#202F36",
        wordOrderBgColor: "#202F36",
        matchingBgColor: "#202F36",
        imageChoiceBgColor: "#202F36",
        choiceImageBgColor: "#202F36",
        dialogueBgColor: "#202F36",
        questionOptionBgColor: "#202F36"
    },
    solarized: {
        background: "#fdf6e3",
        surface: "#eee8d5",
        textDark: "#586e75",
        textLight: "#93a1a1",
        border: "#d33682", // Rose border for contrast
        selectedBg: "#eee8d5",
        selectedBorder: "#859900",
        cardBg: "#eee8d5",
        primary: "#859900", // Solarized Green
        primaryDark: "#586e75",
        headerTitleColor: "#859900",
        coktanSecmeliBgColor: "#fdf6e3",
        wordOrderBgColor: "#fdf6e3",
        matchingBgColor: "#fdf6e3",
        imageChoiceBgColor: "#fdf6e3",
        choiceImageBgColor: "#fdf6e3",
        dialogueBgColor: "#fdf6e3",
        questionOptionBgColor: "#fdf6e3"
    }
};
