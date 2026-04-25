export type QuestionType = 'CoktanSecmeli' | 'GorselEslesirme' | 'Dinleme' | 'WordOrder' | 'Matching' | 'SentenceCompletion' | 'ImageChoice' | 'ChoiceImage' | 'Dialogue';

// Her dilde karşılığı olan metin objesi
export type LocalizedString = {
    tr?: string;
    en?: string;
    [key: string]: string | undefined;
};

export interface Option {
    id: string;
    text?: LocalizedString;
    imageUrl?: string;
}

export interface MatchingPair {
    id: string;
    left: LocalizedString;
    right: LocalizedString;
}

export interface DialogueItem {
    id: string;
    text: LocalizedString;
    audioRef?: string;
    imageRef?: string;
    position: 'left' | 'right';
}

export interface QuestionData {
    id: string;
    type: QuestionType;
    title: LocalizedString;
    promptText?: LocalizedString; // Sorulan kelime veya cümle
    audioRef?: string;   // Ses dosyası (require veya URI)
    options: Option[];
    correctOptionId?: string; // CoktanSecmeli için
    correctOptionIndex?: number; // Standardized index for frontend
    correctWords?: string[];   // WordOrder için doğru kelime sırası
    poolWords?: string[];      // Kullanıcıya sunulacak kelime havuzu (opsiyonel)
    imageRef?: string;   // Soru görseli (ImageChoice için)
    matchingPairs?: MatchingPair[]; // Matching için
    dialogueItems?: DialogueItem[]; // Dialogue için
    isTranslationEnabled?: boolean; // Yeni: Zaza modda yardım butonu
}

export interface TestData {
    id: string;
    title: LocalizedString;
    questions: QuestionData[];
}
