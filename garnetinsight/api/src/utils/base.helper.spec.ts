import { isJson, numberWithSpaces } from 'src/utils/base.helper';

const numberWithSpacesTests = [
  { input: 0, output: '0' },
  { input: 10, output: '10' },
  { input: 100, output: '100' },
  { input: 1000, output: '1 000' },
  { input: 1000.001, output: '1 000.001' },
  { input: 5500, output: '5 500' },
  { input: 1000000, output: '1 000 000' },
  { input: 1233543234543243, output: '1 233 543 234 543 243' },
  { input: NaN, output: 'NaN' },
];

describe('numberWithSpaces', () => {
  numberWithSpacesTests.forEach((test) => {
    it(`should be output: ${test.output} for input: ${test.input} `, async () => {
      const result = numberWithSpaces(test.input);

      expect(result).toEqual(test.output);
    });
  });
});

const isJsonTests = [
  { input: {}, output: true },
  { input: { foo: 'bar' }, output: true },
  { input: [], output: true },
  { input: [123, '123'], output: true },
  { input: '[]', output: true },
  { input: '[123, "123"]', output: true },
  { input: '{}', output: true },
  { input: '{"foo": "bar"}', output: true },
  { input: null, output: false },
  { input: '', output: false },
  { input: '123', output: false },
  { input: 0, output: false },
  { input: 123, output: false },
  { input: Infinity, output: false },
  { input: NaN, output: false },
  { input: undefined, output: false },
];

describe('isJson', () => {
  isJsonTests.forEach((test) => {
    it(`should be output: ${test.output} for input: ${test.input} `, async () => {
      const result = isJson(test.input);

      expect(result).toEqual(test.output);
    });
  });
});
