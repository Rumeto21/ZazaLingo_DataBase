import { TestData } from '@zazalingo/shared';

export const test_word_order_example: TestData = {
    "id": "word_order_example",
    "title": {
        "tr": "Dinleme ve SÄ±ralama",
        "en": "Listening and Ordering"
    },
    "questions": [
        {
            "id": "wo_q1",
            "type": "WordOrder",
            "title": {
                "tr": "DuyduÄunuz cÃ¼mleyi olu��turun",
                "en": "Form the sentence you hear"
            },
            "audioRef": "Homa, ��ima ra razÃ® bo.wav",
            "correctWords": [
                "Homa",
                "��ima",
                "ra",
                "razÃ®",
                "bo"
            ],
            "options": [
                {
                    "id": "w1",
                    "text": {
                        "tr": "Homa",
                        "en": "Homa",
                        "Zz": "Homa"
                    }
                },
                {
                    "id": "w2",
                    "text": {
                        "tr": "��ima",
                        "en": "��ima",
                        "Zz": "��ima"
                    }
                },
                {
                    "id": "w3",
                    "text": {
                        "tr": "ra",
                        "en": "ra",
                        "Zz": "ra"
                    }
                },
                {
                    "id": "w4",
                    "text": {
                        "tr": "razÃ®",
                        "en": "razÃ®",
                        "Zz": "razÃ®"
                    }
                },
                {
                    "id": "w5",
                    "text": {
                        "tr": "bo",
                        "en": "bo",
                        "Zz": "bo"
                    }
                },
                {
                    "id": "w6",
                    "text": {
                        "tr": "be",
                        "en": "be",
                        "Zz": "be"
                    }
                },
                {
                    "id": "w7",
                    "text": {
                        "tr": "Ma",
                        "en": "Ma",
                        "Zz": "Ma"
                    }
                },
                {
                    "id": "w8",
                    "text": {
                        "tr": "Ez",
                        "en": "Ez",
                        "Zz": "Ez"
                    }
                },
                {
                    "id": "w9",
                    "text": {
                        "tr": "awe",
                        "en": "awe",
                        "Zz": "awe"
                    }
                }
            ]
        }
    ]
};
