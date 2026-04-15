import { TestData } from '../../types/question';

import { word_order_example } from './diger/word_order_example';
import { matching_example } from './diger/matching_example';
import { sentence_completion_example } from './diger/sentence_completion_example';

// Consolidated from unite folders (standard structure)
import { test_1774209082939 } from './unite1/test_1774209082939';
import { test_1774293529313 } from './unite1/test_1774293529313';
import { test_1773946534141 } from './unite2/test_1773946534141';
import { test_1773946563942 } from './unite3/test_1773946563942';

export const TESTS: Record<string, TestData> = {
    word_order_example: word_order_example,
    matching_example: matching_example,
    sentence_completion_example: sentence_completion_example,
    test_1774209082939: test_1774209082939,
    test_1774293529313: test_1774293529313,
    test_1773946534141: test_1773946534141,
    test_1773946563942: test_1773946563942,
};
