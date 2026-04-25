import { colors } from './tokens/colors';
import { spacing } from './tokens/spacing';
import { typography } from './tokens/typography';
import { questions } from './components/questions';
import { settings } from './components/settings';
import { header } from './components/header';
import { proverbs } from './components/proverbs';
import { buttons } from './components/buttons';
import { map } from './components/map';

import { AppTheme } from '../../types/data';

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
