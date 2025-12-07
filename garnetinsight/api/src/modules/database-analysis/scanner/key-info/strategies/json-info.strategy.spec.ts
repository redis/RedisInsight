import { when } from 'jest-when';
import { JsonInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/json-info.strategy';
import { mockStandaloneRedisClient } from 'src/__mocks__';

const mockKey = Buffer.from('key');

describe('JsonInfoStrategy', () => {
  const client = mockStandaloneRedisClient;
  const strategy = new JsonInfoStrategy();

  beforeEach(async () => {
    when(client.sendCommand)
      .calledWith(expect.arrayContaining(['json.objlen']), expect.anything())
      .mockResolvedValue(1)
      .calledWith(expect.arrayContaining(['json.arrlen']), expect.anything())
      .mockResolvedValue(2)
      .calledWith(expect.arrayContaining(['json.strlen']), expect.anything())
      .mockResolvedValue(3);
  });

  describe('getLength', () => {
    it('should get length (object)', async () => {
      when(client.sendCommand)
        .calledWith(expect.arrayContaining(['json.type']), expect.anything())
        .mockResolvedValue('object');

      expect(await strategy.getLength(client, mockKey)).toEqual(1);
    });
    it('should get length (array)', async () => {
      when(client.sendCommand)
        .calledWith(expect.arrayContaining(['json.type']), expect.anything())
        .mockResolvedValue('array');

      expect(await strategy.getLength(client, mockKey)).toEqual(2);
    });
    it('should get length (string)', async () => {
      when(client.sendCommand)
        .calledWith(expect.arrayContaining(['json.type']), expect.anything())
        .mockResolvedValue('string');

      expect(await strategy.getLength(client, mockKey)).toEqual(3);
    });
    it('should get length (undefined)', async () => {
      when(client.sendCommand)
        .calledWith(expect.arrayContaining(['json.type']), expect.anything())
        .mockResolvedValue('undefined');

      expect(await strategy.getLength(client, mockKey)).toEqual(null);
    });
  });
});
