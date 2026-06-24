import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import {
  ArrayGrepCriteria,
  ArrayGrepPredicate,
} from 'uiSrc/slices/interfaces/array'

/**
 * `ArrayGrepPredicate` factory. Defaults to an EXACT match on a random word;
 * override `criteria` / `value` per test (e.g. `.build({ criteria:
 * ArrayGrepCriteria.Glob, value: 'a*' })`).
 */
export const arrayGrepPredicateFactory = Factory.define<ArrayGrepPredicate>(
  () => ({
    criteria: ArrayGrepCriteria.Exact,
    value: faker.word.noun(),
  }),
)
