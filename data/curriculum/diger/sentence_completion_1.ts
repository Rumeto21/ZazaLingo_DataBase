import { TestData } from '@zazalingo/shared';

export const test_sentence_completion_1: TestData = {
    "id": "sentence_completion_1",
    "title": {
        "tr": "CÃ¼mle Tamamlama AlÄ±��tÄ±rmasÄ±",
        "en": "Sentence Completion Exercise"
    },
    "questions": [
        {
            "id": "sc1",
            "type": "Matching",
            "title": {
                "tr": "CÃ¼mleleri TamamlayÄ±n",
                "en": "Complete the Sentences"
            },
            "promptText": {
                "tr": "DoÄru ekleri 'ya' seÃ§erek cÃ¼mleleri tamamlayÄ±n (Interchangeable test)",
                "en": "Choose the correct 'ya' suffix to complete the sentences"
            },
            "options": [],
            "matchingPairs": [
                {
                    "id": "p1",
                    "left": {
                        "Zz": "Awa ...",
                        "tr": "Awa ...",
                        "en": "Awa ..."
                    },
                    "right": {
                        "Zz": "ya",
                        "tr": "ya",
                        "en": "ya"
                    }
                },
                {
                    "id": "p2",
                    "left": {
                        "Zz": "Nan ...",
                        "tr": "Nan ...",
                        "en": "Nan ..."
                    },
                    "right": {
                        "Zz": "ya",
                        "tr": "ya",
                        "en": "ya"
                    }
                },
                {
                    "id": "p3",
                    "left": {
                        "Zz": "Ez",
                        "tr": "Ez",
                        "en": "Ez"
                    },
                    "right": {
                        "Zz": "on",
                        "tr": "on",
                        "en": "on"
                    }
                }
            ]
        }
    ]
};
