import { QuestionData, TestData, TestOption, MatchingPair, DialogueItem } from './data';

export type { QuestionData, TestData, TestOption, MatchingPair, DialogueItem };

export type QuestionType = 'CoktanSecmeli' | 'GorselEslesirme' | 'Dinleme' | 'WordOrder' | 'Matching' | 'SentenceCompletion' | 'ImageChoice' | 'ChoiceImage' | 'Dialogue';

// Helper for localized strings if needed outside of data.ts
export type LocalizedString = Record<string, string>;
