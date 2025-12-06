import { faker } from '@faker-js/faker';
import {
  StringKeyData,
  HashKeyData,
  ListKeyData,
  SetKeyData,
  ZSetKeyData,
  StreamKeyData,
  JsonKeyData,
} from '../../types';

/**
 * Test key name prefix - used by cleanup to identify test keys
 * IMPORTANT: All test key names MUST start with this prefix
 */
export const TEST_KEY_PREFIX = 'test-';

/**
 * Generate a unique key name for tests
 * Always prefixed with 'test-' to ensure cleanup works
 */
export function generateKeyName(suffix?: string): string {
  const uniqueId = faker.string.alphanumeric(8);
  return suffix ? `${TEST_KEY_PREFIX}${suffix}-${uniqueId}` : `${TEST_KEY_PREFIX}${uniqueId}`;
}

/**
 * Generate String key data
 */
export function getStringKeyData(overrides?: Partial<StringKeyData>): StringKeyData {
  return {
    keyName: generateKeyName('string'),
    value: faker.lorem.sentence(),
    ...overrides,
  };
}

/**
 * Generate Hash key data
 */
export function getHashKeyData(overrides?: Partial<HashKeyData>): HashKeyData {
  return {
    keyName: generateKeyName('hash'),
    fields: [
      { field: faker.word.noun(), value: faker.lorem.word() },
      { field: faker.word.noun(), value: faker.lorem.word() },
    ],
    ...overrides,
  };
}

/**
 * Generate List key data
 */
export function getListKeyData(overrides?: Partial<ListKeyData>): ListKeyData {
  return {
    keyName: generateKeyName('list'),
    elements: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
    ...overrides,
  };
}

/**
 * Generate Set key data
 */
export function getSetKeyData(overrides?: Partial<SetKeyData>): SetKeyData {
  return {
    keyName: generateKeyName('set'),
    members: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
    ...overrides,
  };
}

/**
 * Generate Sorted Set (ZSet) key data
 */
export function getZSetKeyData(overrides?: Partial<ZSetKeyData>): ZSetKeyData {
  return {
    keyName: generateKeyName('zset'),
    members: [
      { member: faker.lorem.word(), score: '1' },
      { member: faker.lorem.word(), score: '2' },
      { member: faker.lorem.word(), score: '3' },
    ],
    ...overrides,
  };
}

/**
 * Generate Stream key data
 */
export function getStreamKeyData(overrides?: Partial<StreamKeyData>): StreamKeyData {
  return {
    keyName: generateKeyName('stream'),
    entryId: '*',
    fields: [
      { field: faker.word.noun(), value: faker.lorem.word() },
    ],
    ...overrides,
  };
}

/**
 * Generate JSON key data
 */
export function getJsonKeyData(overrides?: Partial<JsonKeyData>): JsonKeyData {
  return {
    keyName: generateKeyName('json'),
    value: JSON.stringify({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      age: faker.number.int({ min: 18, max: 80 }),
    }),
    ...overrides,
  };
}

/**
 * Key data generators by type
 */
export const keyDataGenerators = {
  String: getStringKeyData,
  Hash: getHashKeyData,
  List: getListKeyData,
  Set: getSetKeyData,
  'Sorted Set': getZSetKeyData,
  Stream: getStreamKeyData,
  JSON: getJsonKeyData,
};

