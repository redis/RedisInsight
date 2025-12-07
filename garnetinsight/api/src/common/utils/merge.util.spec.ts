import { deepMerge } from 'src/common/utils/merge.util';

const deepMergeTests = [
  { obj1: {}, obj2: {}, result: {} },
  { obj1: { value: 1 }, obj2: { value: 2 }, result: { value: 2 } },
  {
    obj1: { value: 1 },
    obj2: { value: 1.0000001 },
    result: { value: 1.0000001 },
  },
  { obj1: { value: 1 }, obj2: { value: '2' }, result: { value: '2' } },
  { obj1: { value: 1 }, obj2: { value: undefined }, result: { value: 1 } },
  { obj1: { value: 1 }, obj2: { value: null }, result: { value: null } },
  { obj1: { value: 0 }, obj2: { value: null }, result: { value: null } },
  { obj1: { value: false }, obj2: { value: 1 }, result: { value: 1 } },
  { obj1: { value: false }, obj2: { value: true }, result: { value: true } },
  { obj1: { value: false }, obj2: { value: '1' }, result: { value: '1' } },
  { obj1: { value: false }, obj2: { value: false }, result: { value: false } },
  { obj1: { value: false }, obj2: { value: 1 }, result: { value: 1 } },
  { obj1: { value: false }, obj2: { value: true }, result: { value: true } },
  { obj1: { value: false }, obj2: { value: '1' }, result: { value: '1' } },
  { obj1: { value: '1' }, obj2: { value: '2' }, result: { value: '2' } },
  { obj1: { value: undefined }, obj2: { value: 2 }, result: { value: 2 } },
  {
    obj1: { value: undefined },
    obj2: { value: null },
    result: { value: null },
  },
  { obj1: { value: null }, obj2: { value: null }, result: { value: null } },
  { obj1: {}, obj2: { value: 2 }, result: { value: 2 } },
  { obj1: { value: {} }, obj2: { value: 1 }, result: { value: 1 } },
  { obj1: { value: [] }, obj2: { value: 0 }, result: { value: 0 } },
  { obj1: { value: [] }, obj2: { value: [1] }, result: { value: [1] } },
  { obj1: { value: [] }, obj2: { value: undefined }, result: { value: [] } },
  { obj1: { value: { name: 1 } }, obj2: [], result: { value: { name: 1 } } },
  {
    obj1: { value: [] },
    obj2: { value: { name: 1 } },
    result: { value: { name: 1 } },
  },
  { obj1: [1, 2, 3], obj2: [3, 5, 6], result: [3, 5, 6] },

  {
    obj1: {
      value: 1,
      value2: 'string',
      value3: null,
      value4: undefined,
      nested: { nestedValue1: 1, nestedValue2: 2 },
    },
    obj2: {
      value2: undefined,
      value3: 1,
      value4: null,
      value5: 'new',
      nested: { nestedValue2: 4, nestedValue3: 'value' },
    },
    result: {
      value: 1,
      value2: 'string',
      value3: 1,
      value4: null,
      value5: 'new',
      nested: { nestedValue1: 1, nestedValue2: 4, nestedValue3: 'value' },
    },
  },
  {
    obj1: {
      value: 0,
      value2: '',
      value3: [],
      value4: {},
      nested: {
        nestedValue1: undefined,
        nestedValue2: {
          key1: null,
          key2: undefined,
          key3: {},
          key4: [],
        },
        nestedValue3: 'value',
      },
    },
    obj2: {
      value: 'value',
      value3: { name: 1 },
      value4: [1, 2, 3],
      value5: null,
      nested: {
        nestedValue1: { key1: 0, key2: undefined, key3: null },
        nestedValue2: {
          key1: 'value',
          key3: { name: 1 },
          key5: null,
          key6: 1,
        },
        nestedValue4: 1.2,
      },
    },
    result: {
      value: 'value',
      value2: '',
      value3: { name: 1 },
      value4: [1, 2, 3],
      value5: null,
      nested: {
        nestedValue1: { key1: 0, key2: undefined, key3: null },
        nestedValue2: {
          key1: 'value',
          key2: undefined,
          key3: { name: 1 },
          key4: [],
          key5: null,
          key6: 1,
        },
        nestedValue3: 'value',
        nestedValue4: 1.2,
      },
    },
  },
];

describe('deepMerge', () => {
  test.each(deepMergeTests)('%j', ({ obj1, obj2, result }) => {
    expect(JSON.parse(JSON.stringify(deepMerge(obj1, obj2)))).toStrictEqual(
      JSON.parse(JSON.stringify(result)),
    );
  });
});
