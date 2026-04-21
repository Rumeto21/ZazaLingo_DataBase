import { TestData } from '@zazalingo/shared';

export const test_matching_test_1: TestData = {
    "id": "matching_test_1",
    "title": {
        "tr": "E��le��tirme AlÄ±��tÄ±rmasÄ±",
        "en": "Matching Exercise"
    },
    "questions": [
        {
            "id": "m1",
            "type": "Matching",
            "title": {
                "tr": "Kelimeleri E��le��tirin",
                "en": "Match the Words"
            },
            "promptText": {
                "tr": "ZazakÃ® kelimelerin TÃ¼rkÃ§e kar��Ä±lÄ±klarÄ±nÄ± bulun",
                "en": "Find the Turkish meanings of Zaza words"
            },
            "options": [],
            "matchingPairs": [
                {
                    "id": "p1",
                    "left": {
                        "tr": "RovÃ®",
                        "en": "Fox",
                        "Zz": "RovÃ®"
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
                        "tr": "YÄ±lan",
                        "en": "Snake"
                    }
                }
            ]
        }
    ]
};
