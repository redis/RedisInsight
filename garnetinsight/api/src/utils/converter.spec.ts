import {
  convertIntToSemanticVersion,
  convertStringToNumber,
  convertAnyStringToPositiveInteger,
} from './converter';

const convertIntToSemanticVersionTests: Record<string, any>[] = [
  { input: 1, output: '0.0.1' },
  { input: 10, output: '0.0.10' },
  { input: 100, output: '0.1.0' },
  { input: 1000, output: '0.10.0' },
  { input: 10000, output: '1.0.0' },
  { input: 100000, output: '10.0.0' },
  { input: 1000000, output: '100.0.0' },
  { input: 10410, output: '1.4.10' },
  { input: 10008, output: '1.0.8' },
  { input: 20407, output: '2.4.7' },
  { input: 20011, output: '2.0.11' },
  { input: 20206, output: '2.2.6' },
  { input: 0, output: undefined },
  { input: 'string', output: undefined },
];

describe('convertIntToSemanticVersionTests', () => {
  convertIntToSemanticVersionTests.forEach((test) => {
    it(`should be output: ${test.output} for input: ${JSON.stringify(test.input)}`, () => {
      const result = convertIntToSemanticVersion(test.input);

      expect(result).toEqual(test.output);
    });
  });
});

const convertStringToNumberTests: Record<string, any>[] = [
  { input: ['1'], output: 1 },
  { input: [1], output: 1 },
  { input: [{ some: 'obj' }], output: undefined },
  { input: [{ some: 'obj' }, 11], output: 11 },
  { input: ['asd45', 11], output: 11 },
  { input: ['123.123', 11], output: 123.123 },
  { input: [undefined, 11], output: 11 },
];

describe('convertStringToNumber', () => {
  convertStringToNumberTests.forEach((test) => {
    it(`should be output: ${test.output} for input: ${JSON.stringify(test.input)}`, () => {
      const result = convertStringToNumber.call(this, ...test.input);

      expect(result).toEqual(test.output);
    });
  });
});

const convertAnyStringToPositiveIntegerTests = [
  [undefined, -1],
  [null, -1],
  [123123, -1],
  [[], -1],
  [{}, -1],
  [{ length: 12 }, -1],
  ['', -1],
  ['1', 49],
  ['4f5daa5e-6139-4e95-8e7c-3283287f4218', 1347108680],
  [
    new Array(1000).fill('4f5daa5e-6139-4e95-8e7c-3283287f4218').join(),
    229890988,
  ],
] as [string, number][];
describe('convertAnyStringToPositiveInteger', () => {
  it.each(convertAnyStringToPositiveIntegerTests)(
    'for input: %s, should return: %s',
    (input, result) => {
      expect(convertAnyStringToPositiveInteger(input)).toEqual(result);
    },
  );
});
