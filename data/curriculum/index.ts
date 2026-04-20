import { TestData } from '@zazalingo/shared';

import { test_matching_test_1 } from './diger/matching_test_1';
import { test_sentence_completion_1 } from './diger/sentence_completion_1';
import { test_test_1773946534141 } from './diger/test_1773946534141';
import { test_test_1774209082939 } from './diger/test_1774209082939';
import { test_test_1774293529313 } from './diger/test_1774293529313';
import { test_test_c05ef35b_badd_4a04_b06e_80b8c0c84e74 } from './diger/test_c05ef35b-badd-4a04-b06e-80b8c0c84e74';
import { test_word_order_example } from './diger/word_order_example';

export const TESTS: Record<string, TestData> = {
    matching_test_1: test_matching_test_1,
    sentence_completion_1: test_sentence_completion_1,
    test_1773946534141: test_test_1773946534141,
    test_1774209082939: test_test_1774209082939,
    test_1774293529313: test_test_1774293529313,
    test_c05ef35b-badd-4a04-b06e-80b8c0c84e74: test_test_c05ef35b_badd_4a04_b06e_80b8c0c84e74,
    word_order_example: test_word_order_example,
};
