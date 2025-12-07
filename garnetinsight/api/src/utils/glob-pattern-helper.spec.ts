import { unescapeGlob, isRedisGlob } from 'src/utils/glob-pattern-helper';

const unescapeGlobTests = [
  { input: 'h?llo', output: 'h?llo' },
  { input: 'h\\?llo', output: 'h?llo' },
  { input: '\\!hello', output: '!hello' },
  { input: '\\*hello', output: '*hello' },
  { input: 'hello\\*', output: 'hello*' },
  { input: 'h\\(a|e\\)llo', output: 'h(a|e)llo' },
  { input: 'h\\[a-e\\]llo', output: 'h[a-e]llo' },
  { input: 'h\\[^a\\]llo', output: 'h[^a]llo' },
  { input: 'h\\[a-e\\]llo\\\\:foo', output: 'h[a-e]llo\\:foo' },
  { input: 'h\\{a,e\\}llo', output: 'h{a,e}llo' },
  { input: 'h\\{a,e}llo', output: 'h{a,e}llo' },
  { input: 'h\\[a-e\\]llo\\\\\\*', output: 'h[a-e]llo\\*' },
  { input: 'h\\?(a)llo', output: 'h?(a)llo' },
  { input: 'hello/\\!\\(a\\)llo', output: 'hello/!(a)llo' },
  { input: 'hello/\\+(a)llo', output: 'hello/+(a)llo' },
  { input: 'hello/\\@(a)llo', output: 'hello/@(a)llo' },
  { input: 'hello/\\*(a)llo', output: 'hello/*(a)llo' },
  { input: 'hello/\\?(a)llo', output: 'hello/?(a)llo' },
];

describe('unescapeGlob', () => {
  unescapeGlobTests.forEach((test) => {
    it(`should be output: ${test.output} for input: ${test.input} `, async () => {
      const result = unescapeGlob(test.input);

      expect(result).toEqual(test.output);
    });
  });
});

describe('isRedisGlob', () => {
  const testCases: [string, boolean][] = [
    ['?ello', true],
    ['??llo', true],
    ['\\?\\?llo', false],
    ['\\??llo', true],
    ['?\\?llo', true],
    ['\\\\\\\\?\\?llo', true],
    ['h?llo', true],
    ['h\\?llo', false],
    ['h\\\\?llo', true],
    ['h\\\\\\?llo', false],
    ['h????llo', true],
    ['h\\????llo', true],
    ['h????ll?o', true],
    ['h*llo', true],
    ['h**llo', true],
    ['h***ll*o', true],
    ['\\*ello', false],
    ['\\\\*ello', true],
    ['\\\\\\*ello', false],
    ['h[ae]llo', true],
    ['h[^e]llo', true],
    ['h[a-b]llo', true],
    ['h[a-b\\]llo', false],
    ['h[a-b\\\\]llo', true],
    ['h\\[a-b\\\\]llo', false],
    ['h\\\\[a-b\\\\]llo', true],
    ['h\\\\[a-b\\]llo', false],
  ];

  testCases.forEach((tc) => {
    it(`should return ${tc[1]} for input: ${tc[0]}`, () => {
      expect(isRedisGlob(tc[0])).toEqual(tc[1]);
    });
  });
});
