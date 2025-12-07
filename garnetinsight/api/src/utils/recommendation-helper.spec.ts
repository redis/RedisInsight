import {
  AdditionalSearchModuleName,
  AdditionalRedisModuleName,
} from 'src/constants';
import {
  isRedisearchModule,
  sortRecommendations,
  checkTimestamp,
  checkKeyspaceNotification,
} from './recommendation-helper';

const nameToModule = (name: string) => ({ name });

const getOutputForRedisearchAvailable: any[] = [
  [['1', 'json'].map(nameToModule), false],
  [['1', 'uoeuoeu ueaooe'].map(nameToModule), false],
  [['1', 'json', AdditionalRedisModuleName.RediSearch].map(nameToModule), true],
  [
    ['1', 'json', AdditionalSearchModuleName.SearchLight].map(nameToModule),
    true,
  ],
  [['1', 'json', AdditionalSearchModuleName.FT].map(nameToModule), true],
  [['1', 'json', AdditionalSearchModuleName.FTL].map(nameToModule), true],
];

const sortRecommendationsTests = [
  {
    input: [],
    expected: [],
  },
  {
    input: [
      { name: 'luaScript' },
      { name: 'bigSets' },
      { name: 'searchIndexes' },
    ],
    expected: [
      { name: 'searchIndexes' },
      { name: 'bigSets' },
      { name: 'luaScript' },
    ],
  },
  {
    input: [{ name: 'luaScript' }, { name: 'bigSets' }, { name: 'searchJSON' }],
    expected: [
      { name: 'searchJSON' },
      { name: 'bigSets' },
      { name: 'luaScript' },
    ],
  },
  {
    input: [
      { name: 'luaScript' },
      { name: 'bigSets' },
      { name: 'searchIndexes' },
      { name: 'searchJSON' },
      { name: 'useSmallerKeys' },
      { name: 'RTS' },
    ],
    expected: [
      { name: 'searchJSON' },
      { name: 'searchIndexes' },
      { name: 'RTS' },
      { name: 'bigSets' },
      { name: 'luaScript' },
      { name: 'useSmallerKeys' },
    ],
  },
];

const checkTimestampTests = [
  { input: '1234567891', expected: true },
  { input: '1234567891234', expected: true },
  { input: '1234567891234567', expected: true },
  { input: '1234567891234567891', expected: true },
  { input: '1234567891.2', expected: true },
  { input: '1234567891:12', expected: true },
  { input: '1234567891a12', expected: true },
  { input: '10-10-2020', expected: true },
  { input: '1', expected: false },
  { input: '123', expected: false },
  { input: '12345678911', expected: false },
  { input: '12345678912345', expected: false },
  { input: '12345678912345678', expected: false },
  { input: '1234567891.2.2', expected: false },
  { input: '1234567891asd', expected: false },
  { input: '-1234567891', expected: false },
  { input: 'inf', expected: false },
  { input: '-inf', expected: false },
];

const checkKeyspaceNotificationTests = [
  { input: '', expected: false },
  { input: 'fdKx', expected: true },
  { input: 'lsE', expected: true },
  { input: 'fdkx', expected: false },
  { input: 'lse', expected: false },
  { input: 'KfdE', expected: true },
  { input: '1', expected: false },
  { input: 'K', expected: true },
  { input: 'E', expected: true },
];

describe('Recommendation helper', () => {
  describe('isRedisearchModule', () => {
    it.each(getOutputForRedisearchAvailable)(
      'for input: %s (reply), should be output: %s',
      (reply, expected) => {
        const result = isRedisearchModule(reply);
        expect(result).toBe(expected);
      },
    );
  });

  describe('sortRecommendations', () => {
    test.each(sortRecommendationsTests)('%j', ({ input, expected }) => {
      const result = sortRecommendations(input);
      expect(result).toEqual(expected);
    });
  });

  describe('checkTimestamp', () => {
    test.each(checkTimestampTests)('%j', ({ input, expected }) => {
      expect(checkTimestamp(input)).toEqual(expected);
    });
  });

  describe('checkKeyspaceNotification', () => {
    test.each(checkKeyspaceNotificationTests)('%j', ({ input, expected }) => {
      expect(checkKeyspaceNotification(input)).toEqual(expected);
    });
  });
});
