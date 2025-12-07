import { winPathToNormalPath } from 'src/utils';

const winPathToNormalPathTests: Record<string, any>[] = [
  { input: '\\dir/file.js', output: '/dir/file.js' },
  { input: '/dir/file.js', output: '/dir/file.js' },
  { input: 'file.js', output: 'file.js' },
  { input: '\\file.js', output: '/file.js' },
  { input: '\\dir\\file.js', output: '/dir/file.js' },
  { input: 'dir/file.js', output: 'dir/file.js' },
];

describe('winPathToNormalPath', () => {
  winPathToNormalPathTests.forEach((test) => {
    it(`should be output: ${test.output} for input: ${JSON.stringify(test.input)}`, () => {
      const result = winPathToNormalPath(test.input);

      expect(result).toEqual(test.output);
    });
  });
});
