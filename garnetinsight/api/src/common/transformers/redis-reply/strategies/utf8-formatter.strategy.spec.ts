import { UTF8FormatterStrategy } from './utf8-formatter.strategy';

describe('UTF8FormatterStrategy', () => {
  let strategy;
  beforeEach(async () => {
    strategy = new UTF8FormatterStrategy();
  });

  describe('format', () => {
    it('should return correct value for null', () => {
      const input = null;

      const output = strategy.format(input);

      expect(output).toEqual(null);
    });
    it('should return correct value for integer', () => {
      const input = 1;

      const output = strategy.format(input);

      expect(output).toEqual(input);
    });
    it('should return correct value for string', () => {
      const input = Buffer.from('string value');

      const output = strategy.format(input);

      expect(output).toEqual('string value');
    });
    it('should return correct value for empty array', () => {
      const input = [];

      const output = strategy.format(input);

      expect(output).toEqual([]);
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
      const mockResponse = ['0', ['key', '"quoted""key"', '"quoted key"']];
      const output = strategy.format(input);

      expect(output).toEqual(mockResponse);
    });
    it('should return correct value for object', () => {
      const input = {
        field: Buffer.from('value'),
        secondField: Buffer.from('value'),
      };
      const mockResponse = {
        field: 'value',
        secondField: 'value',
      };
      const output = strategy.format(input);

      expect(output).toEqual(mockResponse);
    });
    it('should return correct value for object', () => {
      const input = {
        field: Buffer.from('value'),
        secondField: Buffer.from('value'),
      };
      const mockResponse = {
        field: 'value',
        secondField: 'value',
      };
      const output = strategy.format(input);

      expect(output).toEqual(mockResponse);
    });
    it('should correctly return string', () => {
      const string = '名字';
      const input = Buffer.from(string);
      const output = strategy.format(input);

      expect(output).toEqual('名字');
    });
  });
});
