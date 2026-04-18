import { TestData } from '@zazalingo/shared';

export const matching_test_1: TestData = {
    "id": "matching_test_1",
    "title": {
        "tr": "Eşleştirme Alıştırması",
        "en": "Matching Exercise"
    },
    "questions": [
        {
            "id": "m1",
            "type": "Matching",
            "title": {
                "tr": "Kelimeleri Eşleştirin",
                "en": "Match the Words"
            },
            "promptText": {
                "tr": "Zazakî kelimelerin Türkçe karşılıklarını bulun",
                "en": "Find the Turkish meanings of Zaza words"
            },
            "options": [],
            "matchingPairs": [
                {
                    "id": "p1",
                    "left": {
                        "tr": "Rovî",
                        "en": "Fox",
                        "Zz": "Rovî"
                    },
                    "right": {
                        "tr": "Tilki",
                        "en": "Fox"
                    }
                },
                {
                    "id": "p2",
                    "left": {
                        "tr": "Kerg",
                        "en": "Chicken",
                        "Zz": "Kerg"
                    },
                    "right": {
                        "tr": "Tavuk",
                        "en": "Chicken"
                    }
                },
                {
                    "id": "p3",
                    "left": {
                        "tr": "Astor",
                        "en": "Horse",
                        "Zz": "Astor"
                    },
                    "right": {
                        "tr": "At",
                        "en": "Horse"
                    }
                },
                {
                    "id": "p4",
                    "left": {
                        "tr": "Maran",
                        "en": "Snake",
                        "Zz": "Maran"
                    },
                    "right": {
                        "tr": "Yılan",
                        "en": "Snake"
                    }
                }
            ]
        }
    ]
};
