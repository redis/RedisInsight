import { randomBytes } from 'crypto';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  CommandParsingError,
  RedirectionParsingError,
} from 'src/modules/cli/constants/errors';
import {
  mockRedisAskError,
  mockRedisMovedError,
  mockRedisNoPermError,
  mockRedisWrongTypeError,
} from 'src/__mocks__';
import {
  checkHumanReadableCommands,
  splitCliCommandLine,
  getBlockingCommands,
  checkRedirectionError,
  parseRedirectionError,
  getRedisPipelineSummary,
  getASCIISafeStringFromBuffer,
  getBufferFromSafeASCIIString,
  getUTF8FromRedisString,
} from 'src/utils/cli-helper';

describe('Cli helper', () => {
  describe('splitCliCommandLine', () => {
    [
      {
        input: 'memory usage key',
        output: ['memory', 'usage', 'key'],
      },
      {
        input: 'set test "—"',
        output: ['set', 'test', '—'],
      },
      {
        input: "set test '—'",
        output: ['set', 'test', '—'],
      },
      {
        input: 'info',
        output: ['info'],
      },
      {
        input: 'get "key name"',
        output: ['get', 'key name'],
      },
      {
        input: `get "key ' name"`,
        output: ['get', `key ' name`],
      },
      {
        input: `get "key \\" name"`,
        output: ['get', `key " name`],
      },
      {
        input: "get 'key name'",
        output: ['get', 'key name'],
      },
      {
        input: `s"et" ~\\'\\nk"k "ey' 1`,
        output: ['set', `~\\\\nk"k "ey`, '1'],
      },
      {
        input: 'set key "\\a\\b\\t\\n\\r"',
        output: ['set', 'key', `\u0007\u0008\u0009\n\r`],
      },
      {
        input: 'set key "\\xac\\xed"',
        output: ['set', 'key', Buffer.from([172, 237])],
      },
      {
        input: `ACL SETUSER t on nopass ~'\\x00' &* +@all`,
        output: [
          'ACL',
          'SETUSER',
          't',
          'on',
          'nopass',
          '~\\x00',
          '&*',
          '+@all',
        ],
      },
    ].forEach((tc) => {
      it(`should return ${JSON.stringify(tc.output)} for command ${tc.input}`, async () => {
        expect(splitCliCommandLine(tc.input)).toEqual(tc.output);
      });
    });
    it('should throw [CLI_INVALID_QUOTES_CLOSING] error for command with double quotes', () => {
      const input = 'get "key"a';

      try {
        splitCliCommandLine(input);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(CommandParsingError);
        expect(err.message).toEqual(
          ERROR_MESSAGES.CLI_INVALID_QUOTES_CLOSING(),
        );
      }
    });
    it('should throw [CLI_UNTERMINATED_QUOTES] error for command with double quotes', () => {
      const input = 'get "\\\\key';

      try {
        splitCliCommandLine(input);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(CommandParsingError);
        expect(err.message).toEqual(ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES());
      }
    });
    it('should throw [CLI_INVALID_QUOTES_CLOSING] error for command with single quotes', () => {
      const input = "get 'key'a";

      try {
        splitCliCommandLine(input);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(CommandParsingError);
        expect(err.message).toEqual(
          ERROR_MESSAGES.CLI_INVALID_QUOTES_CLOSING(),
        );
      }
    });
    it('should throw [CLI_UNTERMINATED_QUOTES] error for command with single quotes', () => {
      const input = "get 'key";

      try {
        splitCliCommandLine(input);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(CommandParsingError);
        expect(err.message).toEqual(ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES());
      }
    });
  });

  describe('checkHumanReadableCommands', () => {
    const tests = [
      { input: 'info', output: true },
      { input: 'info server', output: true },
      { input: 'lolwut', output: true },
      { input: 'LOLWUT', output: true },
      { input: 'debug hstats', output: true },
      { input: 'debug hstats-key', output: true },
      { input: 'DEBUG HSTATS-KEY', output: true },
      { input: 'memory doctor', output: true },
      { input: 'memory malloc-stats', output: true },
      { input: 'cluster nodes', output: true },
      { input: 'cluster info', output: true },
      { input: 'client list', output: true },
      { input: 'latency graph', output: true },
      { input: 'latency doctor', output: true },
      { input: 'proxy info', output: true },
      { input: 'PROXY INFO', output: true },
      { input: 'get key', output: false },
      { input: 'debug object', output: false },
      { input: 'DEBUG OBJECT', output: false },
      { input: 'client kill', output: false },
      { input: 'scan 0 COUNT 15 MATCH *', output: false },
    ];
    tests.forEach((test) => {
      it(`should be output: ${test.output} for input: ${test.input} `, async () => {
        const result = checkHumanReadableCommands(test.input);

        expect(result).toEqual(test.output);
      });
    });
  });

  describe('getBlockingCommands', () => {
    it('should return fixed predefined list of blocking commands', () => {
      expect(getBlockingCommands()).toEqual([
        'blpop',
        'brpop',
        'blmove',
        'brpoplpush',
        'bzpopmin',
        'bzpopmax',
        'xread',
        'xreadgroup',
      ]);
    });
  });

  describe('checkRedirectionError', () => {
    const tests: Record<string, any>[] = [
      { input: mockRedisAskError, output: true },
      { input: mockRedisMovedError, output: true },
      { input: mockRedisNoPermError, output: false },
      { input: mockRedisWrongTypeError, output: false },
      { input: 'info', output: false },
      { input: undefined, output: false },
      { input: false, output: false },
      { input: null, output: false },
      { input: {}, output: false },
    ];
    tests.forEach((test) => {
      it(`should be output: ${test.output} for input: ${test.input} `, async () => {
        expect(checkRedirectionError(test.input)).toEqual(test.output);
      });
    });
  });

  describe('parseRedirectionError', () => {
    it('should get slot and address from MOVED error', () => {
      const result = parseRedirectionError(mockRedisMovedError);

      expect(result).toEqual({
        slot: '7008',
        address: '127.0.0.1:7002',
      });
    });
    it('should get slot and address from ASK error', () => {
      const result = parseRedirectionError({
        ...mockRedisAskError,
        message: 'ASK 7008 redis.cloud.redislabs.com:17182',
      });

      expect(result).toEqual({
        slot: '7008',
        address: 'redis.cloud.redislabs.com:17182',
      });
    });
    it('should throw exception for wrong node address', () => {
      const redirectionError = {
        ...mockRedisAskError,
        message: 'ASK 7008 redis.cloud.redislabs.com/test',
      };
      expect(() => parseRedirectionError(redirectionError)).toThrow(
        RedirectionParsingError,
      );
    });
    it('should throw exception for incorrect redirection message format', () => {
      const redirectionError = {
        ...mockRedisAskError,
        message: 'ASK redis.cloud.redislabs.com:17182 7008',
      };
      expect(() => parseRedirectionError(redirectionError)).toThrow(
        RedirectionParsingError,
      );
    });
    it('should throw exception', () => {
      const input: any = 'ASK redis.cloud.redislabs.com:17182 7008';
      expect(() => parseRedirectionError(input)).toThrow(
        RedirectionParsingError,
      );
    });
  });

  describe('getRedisPipelineSummary', () => {
    const pipeline = Array(50).fill(['get', 'foo']);
    const tests: Record<string, any>[] = [
      {
        input: { pipeline, limit: undefined },
        output: {
          length: pipeline.length,
          summary: JSON.stringify([...Array(5).fill('get'), '...']),
        },
      },
      {
        input: { pipeline, limit: 10 },
        output: {
          length: pipeline.length,
          summary: JSON.stringify([...Array(10).fill('get'), '...']),
        },
      },
      {
        input: { pipeline, limit: 1000 },
        output: {
          length: pipeline.length,
          summary: JSON.stringify([...Array(50).fill('get')]),
        },
      },
      {
        input: { pipeline: {}, limit: 1000 },
        output: {
          length: 0,
          summary: '[]',
        },
      },
      {
        input: { pipeline, limit: -10 },
        output: {
          length: pipeline.length,
          summary: JSON.stringify(['...']),
        },
      },
    ];
    tests.forEach((test) => {
      it(`should be output: ${JSON.stringify(test.output)} for input: ${JSON.stringify(test.input)} `, async () => {
        expect(
          getRedisPipelineSummary(test.input.pipeline, test.input.limit),
        ).toEqual(test.output);
      });
    });
  });

  describe('getASCIISafeStringFromBuffer', () => {
    const tests: Record<string, any>[] = [
      {
        buffer: Buffer.from([0x73, 0x69, 0x6d, 0x70, 0x6c, 0x65]),
        string: 'simple',
        unicode: 'simple',
      },
      {
        buffer: Buffer.from([
          0x45, 0x75, 0x72, 0x6f, 0x20, 0x2d, 0x20, 0xe2, 0x82, 0xac,
        ]),
        string: 'Euro - \\xe2\\x82\\xac',
        unicode: 'Euro - €',
      },
      {
        buffer: Buffer.from([
          0xe2,
          0x82,
          0xac, // €
          0x20,
          0x21,
          0x3d,
          0x20, // _!=_
          0x5c,
          0x65,
          0x32, // \e2
          0x5c,
          0x78,
          0x7a,
          0x73, // \xzs
          0x5c,
          0x30,
          0x32, // \02
        ]),
        string: '\\xe2\\x82\\xac != \\\\e2\\\\xzs\\\\02',
        unicode: '€ != \\e2\\xzs\\02',
      },
      {
        buffer: Buffer.from([
          0x02,
          0x00,
          0x00,
          0x00, // special symbols
          0x7a,
          0x69,
          0x70,
          0x63,
          0x6f,
          0x64,
          0x65, // zipcode
        ]),
        string: '\\x02\\x00\\x00\\x00zipcode',
        unicode: '\x02\x00\x00\x00zipcode',
      },
    ];
    tests.forEach((test) => {
      it(`should convert ${test.unicode} to buffer and to ASCII string representation`, async () => {
        const str = getASCIISafeStringFromBuffer(test.buffer);
        const buf = getBufferFromSafeASCIIString(test.string);

        expect(test.string).toEqual(str);
        expect(test.buffer).toEqual(buf);
        expect(test.unicode).toEqual(buf.toString());
      });
    });

    it('test json data structure', () => {
      const json = { test: 'test' };
      const jsonString = JSON.stringify(json);
      const jsonBuffer = Buffer.from(jsonString);

      const str = getASCIISafeStringFromBuffer(jsonBuffer);
      const buf = getBufferFromSafeASCIIString(str);

      expect(jsonBuffer).toEqual(buf);
      // getASCIISafeStringFromBuffer is analogue of JSON.stringify without leading " for serialized json data
      expect(JSON.stringify(jsonString)).toEqual(`"${str}"`);
    });

    it('test huge string timings', () => {
      const buf = randomBytes(1024 * 1024);

      let startTime = Date.now();
      const str = getASCIISafeStringFromBuffer(buf);
      console.log('To ASCII string took: ', Date.now() - startTime);
      expect(Date.now() - startTime).toBeLessThan(5000); // usually takes ~1s

      startTime = Date.now();
      getBufferFromSafeASCIIString(str);
      console.log('Back to Buffer took: ', Date.now() - startTime);
      // todo: investigate how to optimize this
      expect(Date.now() - startTime).toBeLessThan(15000); // usually takes ~0.7s
    });
  });

  describe('getUTF8FromRedisString', () => {
    const tests = [
      { input: Buffer.from('abc'), output: 'abc' },
      { input: Buffer.from('123'), output: '123' },
      { input: Buffer.from('ntoheuthao u2312'), output: 'ntoheuthao u2312' },
      {
        input: Buffer.from('q;tkoeh uoaecr342 ""ueo!@#'),
        output: 'q;tkoeh uoaecr342 ""ueo!@#',
      },
      {
        input: Buffer.from('\\x02\\x00\\x00\\x00zipcode'),
        output: '\\x02\\x00\\x00\\x00zipcode',
      },
      {
        input: Buffer.from('€ != \\e2\\xzs\\02'),
        output: '€ != \\e2\\xzs\\02',
      },
    ];
    tests.forEach(({ input, output }) => {
      it(`should be output: ${output} for input: ${input} `, async () => {
        const result = getUTF8FromRedisString(input);

        expect(result).toEqual(output);
      });
    });
  });
});
