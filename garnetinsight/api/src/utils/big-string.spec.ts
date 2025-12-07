import * as bigStringUtil from 'src/utils/big-string';
import config, { Config } from 'src/utils/config';

const REDIS_CLIENTS_CONFIG = config.get(
  'redis_clients',
) as Config['redis_clients'];
const BIG_STRING_PREFIX = REDIS_CLIENTS_CONFIG.truncatedStringPrefix;

describe('bigStringUtil', () => {
  describe('isTruncatingEnabled', () => {
    it.each([
      { input: { maxStringSize: NaN }, output: false },
      { input: { maxStringSize: 0 }, output: false },
      { input: { maxStringSize: -1 }, output: false },
      { input: { maxStringSize: 1 }, output: true },
    ])('%j', async ({ input, output }) => {
      expect(bigStringUtil.isTruncatingEnabled(input as any)).toEqual(output);
    });
  });

  describe('isTruncatedString', () => {
    let isTruncatingEnabledSpy: jest.SpyInstance;

    beforeEach(async () => {
      isTruncatingEnabledSpy = jest.spyOn(bigStringUtil, 'isTruncatingEnabled');
      isTruncatingEnabledSpy.mockReturnValue(true);
    });

    it.each([
      { input: 'some string', output: false },
      { input: Buffer.from('some string'), output: false },
      { input: `${BIG_STRING_PREFIX} some string`, output: true },
      { input: Buffer.from(`${BIG_STRING_PREFIX} some string`), output: true },
      { input: null, output: false },
      { input: '', output: false },
      { input: Buffer.from(''), output: false },
    ])('%j', async ({ input, output }) => {
      expect(bigStringUtil.isTruncatedString(input)).toEqual(output);
    });

    it('should return false when truncating is disabled', async () => {
      isTruncatingEnabledSpy.mockReturnValueOnce(false);
      expect(
        bigStringUtil.isTruncatedString(`${BIG_STRING_PREFIX} some string`),
      ).toBe(false);
    });
  });
});
