import { TestData } from '@zazalingo/shared';

import { test_matching_test_1 } from './diger/matching_test_1';
import { test_sentence_completion_1 } from './diger/sentence_completion_1';
import { test_test_1773946534141 } from './diger/test_1773946534141';
import { test_test_1773946563942 } from './diger/test_1773946563942';
import { test_test_1774209082939 } from './diger/test_1774209082939';
import { test_test_1774293529313 } from './diger/test_1774293529313';
import { test_word_order_example } from './diger/word_order_example';

export const TESTS: Record<string, TestData> = {
    matching_test_1: test_matching_test_1,
    sentence_completion_1: test_sentence_completion_1,
    test_1773946534141: test_test_1773946534141,
    test_1773946563942: test_test_1773946563942,
    test_1774209082939: test_test_1774209082939,
    test_1774293529313: test_test_1774293529313,
    word_order_example: test_word_order_example,
};
