import { TestData } from '../../../types/question';

export const word_order_example: TestData = {
    "id": "word_order_example",
    "title": {
        "tr": "Dinleme ve Sıralama",
        "en": "Listening and Ordering"
    },
    "questions": [
        {
            "id": "wo_q1",
            "type": "WordOrder",
            "title": {
                "tr": "Duyduğunuz cümleyi oluşturun",
                "en": "Form the sentence you hear"
            },
            "audioRef": "Homa, Şima ra razî bo.wav",
            "correctWords": [
                "Homa",
                "Şima",
                "ra",
                "razî",
                "bo"
            ],
            "options": [
                {
                    "id": "w1",
                    "text": {
                        "tr": "Homa",
                        "en": "Homa",
                        "zzk": "Homa"
                    }
                },
                {
                    "id": "w2",
                    "text": {
                        "tr": "Şima",
                        "en": "Şima",
                        "zzk": "Şima"
                    }
                },
                {
                    "id": "w3",
                    "text": {
                        "tr": "ra",
                        "en": "ra",
                        "zzk": "ra"
                    }
                },
                {
                    "id": "w4",
                    "text": {
                        "tr": "razî",
                        "en": "razî",
                        "zzk": "razî"
                    }
                },
                {
                    "id": "w5",
                    "text": {
                        "tr": "bo",
                        "en": "bo",
                        "zzk": "bo"
                    }
                },
                {
                    "id": "w6",
                    "text": {
                        "tr": "be",
                        "en": "be",
                        "zzk": "be"
                    }
                },
                {
                    "id": "w7",
                    "text": {
                        "tr": "Ma",
                        "en": "Ma",
                        "zzk": "Ma"
                    }
                },
                {
                    "id": "w8",
                    "text": {
                        "tr": "Ez",
                        "en": "Ez",
                        "zzk": "Ez"
                    }
                },
                {
                    "id": "w9",
                    "text": {
                        "tr": "awe",
                        "en": "awe",
                        "zzk": "awe"
                    }
                }
            ]
        }
    ]
};
