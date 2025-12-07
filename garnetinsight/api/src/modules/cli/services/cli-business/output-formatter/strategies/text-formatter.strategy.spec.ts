import { TextFormatterStrategy } from './text-formatter.strategy';

describe('Cli TextFormatterStrategy', () => {
  let strategy;
  beforeEach(async () => {
    strategy = new TextFormatterStrategy();
  });

  describe('format', () => {
    it('should return correct value for null', () => {
      const input = null;

      const output = strategy.format(input);

      expect(output).toEqual('(nil)');
    });
    it('should return correct value for integer', () => {
      const input = 1;

      const output = strategy.format(input);

      expect(output).toEqual(`(integer) ${input}`);
    });
    it('should return correct value for string', () => {
      const input = Buffer.from('string value');

      const output = strategy.format(input);

      expect(output).toEqual(`"${input}"`);
    });
    it('should return correct value for empty array', () => {
      const input = [];

      const output = strategy.format(input);

      expect(output).toEqual('(empty list or set)');
    });
    it('should return correct value for nested array', () => {
      const input = [
        Buffer.from('0'),
        [
          Buffer.from('key'),
          Buffer.from('"quoted""key"'),
          Buffer.from('"quoted key"'),
        ],
      ];
      const mockResponse =
        '1) "0"\n2) 1) "key"\n   2) "\\"quoted\\"\\"key\\""\n   3) "\\"quoted key\\""';
      const output = strategy.format(input);

      expect(output).toEqual(mockResponse);
    });
    it('should return correct value for object', () => {
      const input = {
        field: Buffer.from('value'),
        secondField: Buffer.from('value'),
      };
      const mockResponse =
        '1) "field"\n2) "value"\n3) "secondField"\n4) "value"';
      const output = strategy.format(input);

      expect(output).toEqual(mockResponse);
    });
    it('should correctly handle special characters', () => {
      const input = Buffer.from('\u0007\b\t\n\r\\');
      const output = strategy.format(input);

      expect(output).toEqual('"\\a\\b\\t\\n\\r\\\\"');
    });
    it('should correctly handle hexadecimal', () => {
      const input = Buffer.from('aced000573720008456d706c6f796565', 'hex');
      const output = strategy.format(input);

      expect(output).toEqual('"\\xac\\xed\\x00\\x05sr\\x00\\bEmployee"');
    });
    it('should correctly stringified json', () => {
      const object = {
        key: 'value',
      };
      const input = Buffer.from(JSON.stringify(object));
      const output = strategy.format(input);

      expect(output).toEqual('"{\\"key\\":\\"value\\"}"');
    });
  });
});
