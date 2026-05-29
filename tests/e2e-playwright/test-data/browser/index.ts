import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import {
  StringKeyData,
  HashKeyData,
  ListKeyData,
  SetKeyData,
  ZSetKeyData,
  StreamKeyData,
  JsonKeyData,
  VectorSetKeyData,
} from 'e2eSrc/types';

/**
 * Test key name prefix - used by cleanup to identify test keys
 * IMPORTANT: All test key names MUST start with this prefix
 */
export const TEST_KEY_PREFIX = 'test-';

/**
 * String key data factory
 */
export const StringKeyFactory = Factory.define<StringKeyData>(() => ({
  keyName: `${TEST_KEY_PREFIX}string-${faker.string.alphanumeric(8)}`,
  value: faker.lorem.sentence(),
}));

/**
 * Hash key data factory
 */
export const HashKeyFactory = Factory.define<HashKeyData>(() => ({
  keyName: `${TEST_KEY_PREFIX}hash-${faker.string.alphanumeric(8)}`,
  fields: [
    { field: faker.word.noun(), value: faker.lorem.word() },
    { field: faker.word.noun(), value: faker.lorem.word() },
  ],
}));

/**
 * List key data factory
 */
export const ListKeyFactory = Factory.define<ListKeyData>(() => ({
  keyName: `${TEST_KEY_PREFIX}list-${faker.string.alphanumeric(8)}`,
  elements: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
}));

/**
 * Set key data factory
 */
export const SetKeyFactory = Factory.define<SetKeyData>(() => ({
  keyName: `${TEST_KEY_PREFIX}set-${faker.string.alphanumeric(8)}`,
  members: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
}));

/**
 * Sorted Set (ZSet) key data factory
 */
export const ZSetKeyFactory = Factory.define<ZSetKeyData>(() => ({
  keyName: `${TEST_KEY_PREFIX}zset-${faker.string.alphanumeric(8)}`,
  members: [
    { member: faker.lorem.word(), score: '1' },
    { member: faker.lorem.word(), score: '2' },
    { member: faker.lorem.word(), score: '3' },
  ],
}));

/**
 * Stream key data factory
 */
export const StreamKeyFactory = Factory.define<StreamKeyData>(() => ({
  keyName: `${TEST_KEY_PREFIX}stream-${faker.string.alphanumeric(8)}`,
  entryId: '*',
  fields: [{ field: faker.word.noun(), value: faker.lorem.word() }],
}));

/**
 * JSON key data factory
 */
export const JsonKeyFactory = Factory.define<JsonKeyData>(() => ({
  keyName: `${TEST_KEY_PREFIX}json-${faker.string.alphanumeric(8)}`,
  value: JSON.stringify({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    age: faker.number.int({ min: 18, max: 80 }),
  }),
}));

/**
 * Build a comma-separated random unit-vector string of length `dim`.
 * Deterministic per call via faker — values land in [-1, 1].
 */
const buildRandomVector = (dim: number): string =>
  Array.from({ length: dim }, () => faker.number.float({ min: -1, max: 1, fractionDigits: 4 })).join(',');

/**
 * Vector Set key data factory
 *
 * Two elements with matching dimensions (3) so the same key can serve both
 * VADD and VSIM tests.
 */
export const VectorSetKeyFactory = Factory.define<VectorSetKeyData>(() => ({
  keyName: `${TEST_KEY_PREFIX}vector-set-${faker.string.alphanumeric(8)}`,
  elements: [
    { name: `element-${faker.string.alphanumeric(6)}`, vector: buildRandomVector(3) },
    { name: `element-${faker.string.alphanumeric(6)}`, vector: buildRandomVector(3) },
  ],
}));

/**
 * Key factories by type
 */
export const keyFactories = {
  String: StringKeyFactory,
  Hash: HashKeyFactory,
  List: ListKeyFactory,
  Set: SetKeyFactory,
  'Sorted Set': ZSetKeyFactory,
  Stream: StreamKeyFactory,
  JSON: JsonKeyFactory,
  'Vector Set': VectorSetKeyFactory,
};
