export interface Proverb {
    id: string;
    text: string;
    translation: {
        Tr: string;
        En: string;
        Kr?: string;
        Zz?: string;
    };
}
export const proverbs: Proverb[] = [
    {
        "id": "prv_1",
        "text": "Dar bi pelÃª xo yeno ��inasnayÃ®��.",
        "translation": {
            "Tr": "AÄaÃ§ yapraÄÄ±yla tanÄ±nÄ±r/bilinir.",
            "En": "A tree is known by its leaves.",
            "Kr": "Dar bi pelÃªn xwe tÃª naskirin."
        }
    },
    {
        "id": "prv_2",
        "text": "Mase awa lÃ®mÃ® de tep��Ã®yena.",
        "translation": {
            "Tr": "BulanÄ±k suda balÄ±k avlanÄ±r.",
            "En": "Fish are caught in muddy waters.",
            "Kr": "MasÃ® di ava gemarÃ® de tÃªn girtin."
        }
    },
    {
        "id": "prv_3",
        "text": "ZonÃª xo vÃ®ra mekerÃª.",
        "translation": {
            "Tr": "Dilinizi unutmayÄ±n.",
            "En": "Do not forget your language.",
            "Kr": "ZimanÃª xwe ji bÃ®r nekin."
        }
    }
];
