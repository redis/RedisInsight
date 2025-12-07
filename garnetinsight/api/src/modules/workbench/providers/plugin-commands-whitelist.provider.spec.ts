import { Test, TestingModule } from '@nestjs/testing';
import {
  mockRedisCommandReply,
  mockWhitelistCommandsResponse,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { PluginCommandsWhitelistProvider } from 'src/modules/workbench/providers/plugin-commands-whitelist.provider';

describe('PluginCommandsWhitelistProvider', () => {
  const client = mockStandaloneRedisClient;
  let service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PluginCommandsWhitelistProvider],
    }).compile();

    service = await module.get<PluginCommandsWhitelistProvider>(
      PluginCommandsWhitelistProvider,
    );
  });

  describe('getWhitelistCommands', () => {
    let calculateCommandsSpy;

    beforeEach(() => {
      calculateCommandsSpy = jest.spyOn(service, 'calculateWhiteListCommands');
    });

    it('should fetch commands when no cache and return from cache when possible', async () => {
      calculateCommandsSpy.mockResolvedValueOnce(mockWhitelistCommandsResponse);

      expect(await service.getWhitelistCommands(client)).toEqual(
        mockWhitelistCommandsResponse,
      );
      expect(calculateCommandsSpy).toHaveBeenCalled();

      calculateCommandsSpy.mockClear();

      expect(await service.getWhitelistCommands(client)).toEqual(
        mockWhitelistCommandsResponse,
      );
      expect(calculateCommandsSpy).not.toHaveBeenCalled();
    });
  });
  describe('calculateWhiteListCommands', () => {
    it('should return 2 readonly commands', async () => {
      client.call.mockResolvedValueOnce(mockRedisCommandReply);
      client.call.mockResolvedValueOnce([]);
      client.call.mockResolvedValueOnce([]);

      const result = await service.calculateWhiteListCommands(client);

      expect(result).toEqual(mockWhitelistCommandsResponse);
    });
    it('should return 1 readonly commands excluded by dangerous filter', async () => {
      client.call.mockResolvedValueOnce(mockRedisCommandReply);
      client.call.mockResolvedValueOnce(['custom.command']);
      client.call.mockResolvedValueOnce([]);

      const result = await service.calculateWhiteListCommands(client);

      expect(result).toEqual(['get']);
    });
    it('should return 1 readonly commands excluded by blocking filter', async () => {
      client.call.mockResolvedValueOnce(mockRedisCommandReply);
      client.call.mockResolvedValueOnce([]);
      client.call.mockResolvedValueOnce(['custom.command']);

      const result = await service.calculateWhiteListCommands(client);

      expect(result).toEqual(['get']);
    });
  });
});
