import { Test, TestingModule } from '@nestjs/testing';
import {
  generateMockRedisClient,
  mockAzureTokenRefreshManager,
  mockDatabase,
  mockInvalidClientMetadataError,
  mockInvalidSessionMetadataError,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import {
  ClientContext,
  ClientMetadata,
  SessionMetadata,
} from 'src/common/models';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';
import apiConfig from 'src/utils/config';
import { BadRequestException } from '@nestjs/common';
import { RedisClient } from 'src/modules/redis/client';
import { AzureTokenRefreshManager } from 'src/modules/azure/azure-token-refresh.manager';

const REDIS_CLIENTS_CONFIG = apiConfig.get('redis_clients');

describe('RedisClientStorage', () => {
  let service: RedisClientStorage;
  const mockClientMetadata1 = {
    sessionMetadata: {
      userId: 'u1',
      accountId: 'a1',
      sessionId: 's1',
    },
    databaseId: mockDatabase.id,
    context: ClientContext.Common,
  };

  const mockRedisClient1 = generateMockRedisClient(mockClientMetadata1);
  const mockRedisClient2 = generateMockRedisClient({
    ...mockClientMetadata1,
    context: ClientContext.Browser,
    db: 0,
  });
  const mockRedisClient3 = generateMockRedisClient({
    ...mockClientMetadata1,
    sessionMetadata: { userId: 'u2', sessionId: 's2', accountId: 'a2' },
    context: ClientContext.Workbench,
    db: 1,
  });
  const mockRedisClient4 = generateMockRedisClient({
    ...mockClientMetadata1,
    sessionMetadata: { userId: 'u2', sessionId: 's3', accountId: 'a2' },
    db: 2,
  });
  const mockRedisClient5 = generateMockRedisClient({
    ...mockClientMetadata1,
    databaseId: 'd2',
    sessionMetadata: { userId: 'u2', sessionId: 's4', accountId: 'a2' },
  });
  const mockRedisClient6 = generateMockRedisClient({
    ...mockClientMetadata1,
    databaseId: 'd2',
    sessionMetadata: { userId: 'u2', sessionId: 's4', accountId: 'a3' },
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisClientStorage,
        {
          provide: AzureTokenRefreshManager,
          useFactory: mockAzureTokenRefreshManager,
        },
      ],
    }).compile();

    service = await module.get(RedisClientStorage);

    service['clients'].set(mockRedisClient1.id, mockRedisClient1);
    service['clients'].set(mockRedisClient2.id, mockRedisClient2);
    service['clients'].set(mockRedisClient3.id, mockRedisClient3);
    service['clients'].set(mockRedisClient4.id, mockRedisClient4);
    service['clients'].set(mockRedisClient5.id, mockRedisClient5);
    service['clients'].set(mockRedisClient6.id, mockRedisClient6);
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  describe('syncClients', () => {
    it('should not remove any client since no idle time passed', async () => {
      expect(service['clients'].size).toEqual(6);

      service['syncClients']();

      expect(service['clients'].size).toEqual(6);
    });

    it('should remove client with exceeded time in idle', async () => {
      expect(service['clients'].size).toEqual(6);
      const toDelete = service['clients'].get(mockRedisClient1.id);
      toDelete['lastTimeUsed'] =
        Date.now() - REDIS_CLIENTS_CONFIG.maxIdleThreshold - 1;

      service['syncClients']();

      expect(service['clients'].size).toEqual(5);
      expect(service['clients'].get(mockRedisClient1.id)).toEqual(undefined);
    });
    it('should remove client with exceeded time in idle and not fail in case of error', async () => {
      expect(service['clients'].size).toEqual(6);
      const toDelete = service['clients'].get(mockRedisClient1.id);
      toDelete['lastTimeUsed'] =
        Date.now() - REDIS_CLIENTS_CONFIG.maxIdleThreshold - 1;
      mockRedisClient1.disconnect.mockRejectedValueOnce(
        new Error('some error'),
      );

      service['syncClients']();

      expect(service['clients'].size).toEqual(5);
      expect(service['clients'].get(mockRedisClient1.id)).toEqual(undefined);
    });
  });

  describe('get', () => {
    it('should correctly get client instance and update last used time', async () => {
      // eslint-disable-next-line prefer-destructuring
      const lastTimeUsed = mockRedisClient1['lastTimeUsed'];

      const result = await service.get(mockRedisClient1.id);

      expect(result).toEqual(service['clients'].get(mockRedisClient1.id));
      expect(result['lastTimeUsed']).toBeGreaterThan(lastTimeUsed);
    });
    it('should return null when client is is disconnected and client will be removed', async () => {
      expect(service['clients'].get(mockRedisClient1.id)).not.toEqual(
        undefined,
      );
      mockRedisClient1.isConnected.mockReturnValueOnce(false);

      const result = await service.get(mockRedisClient1.id);

      expect(result).toEqual(null);
      expect(service['clients'].get(mockRedisClient1.id)).toEqual(undefined);
    });
    it('should not fail when there is no client', async () => {
      const result = await service.get('not-existing');

      expect(result).toBeUndefined();
    });
  });

  describe('getByMetadata', () => {
    it('should correctly get client instance and update last used time', async () => {
      // eslint-disable-next-line prefer-destructuring
      const lastTimeUsed = mockRedisClient1['lastTimeUsed'];

      const result = await service.getByMetadata(
        mockRedisClient1['clientMetadata'],
      );

      expect(result).toEqual(service['clients'].get(mockRedisClient1.id));
      expect(result['lastTimeUsed']).toBeGreaterThan(lastTimeUsed);
    });
    it('should find client for CLI ignoring db parameter', async () => {
      const mockClientMetadata = {
        ...mockClientMetadata1,
        db: 3,
        context: ClientContext.CLI,
        uniqueId: 'some-unique-id',
      };

      const mockClient = generateMockRedisClient(mockClientMetadata);
      service['clients'].set(mockClient.id, mockClient);

      const result1 = await service.getByMetadata(mockClientMetadata);
      expect(result1).toEqual(service['clients'].get(mockClient.id));

      const result2 = await service.getByMetadata({
        ...mockClientMetadata,
        db: 1,
      });
      expect(result2).toEqual(service['clients'].get(mockClient.id));
      expect(result2).toEqual(result1);

      const result3 = await service.getByMetadata({
        ...mockClientMetadata,
        db: 0,
      });
      expect(result3).toEqual(service['clients'].get(mockClient.id));
      expect(result3).toEqual(result2);
    });
    it('should not fail when there is no client', async () => {
      const result = await service.getByMetadata({
        sessionMetadata: {
          userId: 'uid',
          accountId: 'acc',
          sessionId: 'uid',
        },
        databaseId: 'invalid-instance-id',
        context: ClientContext.Common,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('set', () => {
    beforeEach(() => {
      // @ts-ignore
      service['clients'] = new Map();
    });

    it('should add new client', async () => {
      expect(service['clients'].size).toEqual(0);

      const result = await service.set(mockRedisClient1);

      expect(result).toEqual(mockRedisClient1);
      expect(service['clients'].size).toEqual(1);
      expect(await service.get(mockRedisClient1.id)).toEqual(mockRedisClient1);
    });

    it('should use existing client instead of replacing with new one', async () => {
      const existingClient = generateMockRedisClient(mockClientMetadata1);

      expect(service['clients'].size).toEqual(0);
      expect(await service.set(existingClient)).toEqual(existingClient);
      expect(service['clients'].size).toEqual(1);

      // sleep
      await new Promise((res) => setTimeout(res, 100));

      const newClient = generateMockRedisClient(mockClientMetadata1);
      const result = await service.set(newClient);
      expect(result).toEqual(existingClient);
      expect(result).not.toEqual(newClient);
      expect(service['clients'].size).toEqual(1);

      expect(newClient.disconnect).toHaveBeenCalledTimes(1);
      expect(existingClient.disconnect).not.toHaveBeenCalled();

      expect(newClient.id).toEqual(existingClient.id);
    });

    it('should use new client when there is existing client but without active connection', async () => {
      const existingClient = generateMockRedisClient(mockClientMetadata1);
      existingClient.isConnected.mockReturnValue(false);

      expect(service['clients'].size).toEqual(0);
      expect(await service.set(existingClient)).toEqual(existingClient);
      expect(service['clients'].size).toEqual(1);

      // sleep
      await new Promise((res) => setTimeout(res, 100));

      const newClient = generateMockRedisClient(mockClientMetadata1);
      const result = await service.set(newClient);
      expect(result).toEqual(newClient);
      expect(result).not.toEqual(existingClient);
      expect(service['clients'].size).toEqual(1);

      expect(existingClient.disconnect).toHaveBeenCalledTimes(1);
      expect(newClient.disconnect).not.toHaveBeenCalled();

      expect(newClient.id).toEqual(existingClient.id);
    });

    it('should throw and error if clientMetadata has not required fields', async () => {
      await expect(service.set(generateMockRedisClient({}))).rejects.toThrow(
        BadRequestException,
      );
      await expect(
        service.set(
          generateMockRedisClient({
            databaseId: '1',
          }),
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.set(
          generateMockRedisClient({
            databaseId: '1',
            context: ClientContext.Common,
          }),
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.set(
          generateMockRedisClient({
            databaseId: '1',
            context: ClientContext.Common,
            sessionMetadata: {
              userId: '1',
            } as SessionMetadata,
          }),
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.set(
          generateMockRedisClient({
            databaseId: '1',
            context: ClientContext.Common,
            sessionMetadata: {
              userId: '1',
              sessionId: '1',
            } as SessionMetadata,
          }),
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.set(
          generateMockRedisClient({
            databaseId: '1',
            context: ClientContext.Common,
            sessionMetadata: {
              userId: '1',
              accountId: '1',
              sessionId: '1',
            } as SessionMetadata,
          }),
        ),
      ).resolves.toBeInstanceOf(RedisClient);
    });
  });

  describe('remove', () => {
    it('should remove only one', async () => {
      const result = await service.remove(mockRedisClient1.id);

      expect(result).toEqual(1);
      expect(service['clients'].size).toEqual(5);
      expect(service['clients'].get(mockRedisClient1.id)).toEqual(undefined);
    });
    it('should not fail in case when no client found', async () => {
      const result = await service.remove('not-existing');

      expect(result).toEqual(0);
      expect(service['clients'].size).toEqual(6);
    });
    it('should not fail in case when client.disconnect() failed and remove client from the pool', async () => {
      mockRedisClient1.disconnect.mockRejectedValueOnce(
        new Error("Can't disconnect."),
      );
      const result = await service.remove(mockRedisClient1.id);

      expect(result).toEqual(1);
      expect(service['clients'].size).toEqual(5);
    });
  });

  describe('removeByMetadata', () => {
    it('should remove only one', async () => {
      const result = await service.removeByMetadata(
        mockRedisClient1['clientMetadata'],
      );

      expect(result).toEqual(1);
      expect(service['clients'].size).toEqual(5);
      expect(service['clients'].get(mockRedisClient1.id)).toEqual(undefined);
    });
    it('should not fail in case when no client found', async () => {
      const result = await service.removeByMetadata({
        ...mockRedisClient1['clientMetadata'],
        databaseId: 'not-existing',
      });

      expect(result).toEqual(0);
      expect(service['clients'].size).toEqual(6);
    });
    // todo: add prepareMetadata check test
  });

  describe('findClients + removeManyByMetadata', () => {
    it('should correctly find clients for particular database', async () => {
      const query = {
        databaseId: mockClientMetadata1.databaseId,
      };

      const result = service['findClients'](query);

      expect(result.length).toEqual(4);
      result.forEach((id) => {
        expect(service['clients'].get(id)['clientMetadata'].databaseId).toEqual(
          query.databaseId,
        );
      });

      expect(await service.removeManyByMetadata(query)).toEqual(4);
      expect(service['clients'].size).toEqual(2);
    });
    it('should correctly find clients for particular database and context', async () => {
      const query = {
        databaseId: mockClientMetadata1.databaseId,
        context: ClientContext.Browser,
      };

      const result = service['findClients'](query);

      expect(result.length).toEqual(1);
      result.forEach((id) => {
        expect(service['clients'].get(id)['clientMetadata'].databaseId).toEqual(
          query.databaseId,
        );
        expect(service['clients'].get(id)['clientMetadata'].context).toEqual(
          query.context,
        );
      });

      expect(await service.removeManyByMetadata(query)).toEqual(1);
      expect(service['clients'].size).toEqual(5);
    });
    it('should correctly find clients for particular database and user', async () => {
      const query = {
        sessionMetadata: { userId: 'u1' } as SessionMetadata,
        databaseId: mockDatabase.id,
      };

      const result = service['findClients'](query);

      expect(result.length).toEqual(2);
      result.forEach((id) => {
        expect(service['clients'].get(id)['clientMetadata'].databaseId).toEqual(
          query.databaseId,
        );
        expect(
          service['clients'].get(id)['clientMetadata'].sessionMetadata.userId,
        ).toEqual(query.sessionMetadata.userId);
      });

      expect(await service.removeManyByMetadata(query)).toEqual(2);
      expect(service['clients'].size).toEqual(4);
    });
    it('should correctly find clients for particular user', async () => {
      const query = {
        sessionMetadata: { userId: 'u2' } as SessionMetadata,
      };

      const result = service['findClients'](query);

      expect(result.length).toEqual(4);
      result.forEach((id) => {
        expect(
          service['clients'].get(id)['clientMetadata'].sessionMetadata.userId,
        ).toEqual(query.sessionMetadata.userId);
      });
      expect(
        service['clients'].get(result[0])['clientMetadata'].databaseId,
      ).toEqual(mockDatabase.id);
      expect(
        service['clients'].get(result[2])['clientMetadata'].databaseId,
      ).toEqual('d2');

      expect(await service.removeManyByMetadata(query)).toEqual(4);
      expect(service['clients'].size).toEqual(2);
    });
    it('should correctly find clients for particular database and db index', async () => {
      const query = {
        databaseId: mockDatabase.id,
        db: 0,
      };

      const result = service['findClients'](query);

      expect(result.length).toEqual(1);
      result.forEach((id) => {
        expect(service['clients'].get(id)['clientMetadata'].databaseId).toEqual(
          query.databaseId,
        );
        expect(service['clients'].get(id)['clientMetadata'].db).toEqual(
          query.db,
        );
      });

      expect(await service.removeManyByMetadata(query)).toEqual(1);
      expect(service['clients'].size).toEqual(5);
    });
    it('should not find any instances', async () => {
      const query = {
        databaseId: 'not existing',
      };

      const result = service['findClients'](query);

      expect(result).toEqual([]);

      expect(await service.removeManyByMetadata(query)).toEqual(0);
      expect(service['clients'].size).toEqual(6);
    });
  });

  describe('advanced', () => {
    beforeEach(() => {
      // @ts-ignore
      service['clients'] = new Map();
    });

    const CLIENTS_NUMBER = 10;
    const getGenericValue = (value, defaultValue) =>
      value === false ? undefined : value || defaultValue;

    const generateNClients = (n: number, options = {}) => {
      const result = [];

      for (let i = 0; i < n; i += 1) {
        const clientMetadata = Object.assign(new ClientMetadata(), {
          databaseId: getGenericValue(options['databaseId'], `db_${i}`),
          context: getGenericValue(options['context'], ClientContext.Common),
          uniqueId: getGenericValue(options['uniqueId'], `unique_${i}`),
          db: getGenericValue(options['db'], 0),
          sessionMetadata: {
            userId: getGenericValue(options['userId'], `user_${i}`),
            accountId: getGenericValue(options['accountId'], `account_${i}`),
            sessionId: getGenericValue(options['sessionId'], `session_${i}`),
            uniqueId: getGenericValue(
              options['sessionUId'],
              `session_unique_${i}`,
            ),
          },
        });
        result.push([clientMetadata, generateMockRedisClient(clientMetadata)]);
      }

      return result;
    };

    it.each([
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          uniqueId: 'unid',
          db: 0,
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
            uniqueId: 'unsid',
          },
        },
        id: 'dbid_Common_unid_0_uid_aid_sid_unsid',
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          uniqueId: 'unid',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
            uniqueId: 'unsid',
          },
        },
        id: 'dbid_Common_unid_(nil)_uid_aid_sid_unsid',
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
            uniqueId: 'unsid',
          },
        },
        id: 'dbid_Common_(nil)_(nil)_uid_aid_sid_unsid',
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
          },
        },
        id: 'dbid_Common_(nil)_(nil)_uid_aid_sid_(nil)',
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
          },
        },
        error: mockInvalidClientMetadataError,
      },
      {
        clientMetadata: {
          context: 'Common',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
          },
        },
        error: mockInvalidClientMetadataError,
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
          },
        },
        error: mockInvalidSessionMetadataError,
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          sessionMetadata: {
            accountId: 'aid',
            sessionId: 'sid',
          },
        },
        error: mockInvalidSessionMetadataError,
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          sessionMetadata: {
            userId: 'uid',
            sessionId: 'sid',
          },
        },
        error: mockInvalidSessionMetadataError,
      },
      {
        clientMetadata: {},
        error: mockInvalidSessionMetadataError,
      },
    ] as any)(
      '%# set: validation and id generation',
      async ({ clientMetadata, id, error }) => {
        const mapSetSpy = jest.spyOn(service['clients'], 'set');

        const client = generateMockRedisClient(clientMetadata);

        if (error) {
          await expect(service.set(client)).rejects.toThrow(error);
          expect(mapSetSpy).not.toHaveBeenCalled();
        } else {
          await expect(service.set(client)).resolves.toEqual(client);
          expect(mapSetSpy).toHaveBeenCalledTimes(1);
          expect(mapSetSpy).lastCalledWith(id, client);
        }
      },
    );

    it.each([
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          uniqueId: 'unid',
          db: 0,
          sessionMetadata: {
            userId: 'uid',
            sessionId: 'sid',
            accountId: 'aid',
            uniqueId: 'unsid',
          },
        },
        id: 'dbid_Common_unid_0_uid_aid_sid_unsid',
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          uniqueId: 'unid',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
            uniqueId: 'unsid',
          },
        },
        id: 'dbid_Common_unid_(nil)_uid_aid_sid_unsid',
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
            uniqueId: 'unsid',
          },
        },
        id: 'dbid_Common_(nil)_(nil)_uid_aid_sid_unsid',
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
          },
        },
        id: 'dbid_Common_(nil)_(nil)_uid_aid_sid_(nil)',
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
          },
        },
        error: mockInvalidClientMetadataError,
      },
      {
        clientMetadata: {
          context: 'Common',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
          },
        },
        error: mockInvalidClientMetadataError,
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
          },
        },
        error: mockInvalidSessionMetadataError,
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          sessionMetadata: {
            accountId: 'aid',
            sessionId: 'sid',
          },
        },
        error: mockInvalidSessionMetadataError,
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          sessionMetadata: {
            userId: 'uid',
            sessionId: 'sid',
          },
        },
        error: mockInvalidSessionMetadataError,
      },
      {
        clientMetadata: {},
        error: mockInvalidSessionMetadataError,
      },
    ] as any)(
      '%# getByMetadata: validation and id generation',
      async ({ clientMetadata, id, error }) => {
        const mapGetSpy = jest.spyOn(service['clients'], 'get');

        if (error) {
          await expect(service.getByMetadata(clientMetadata)).rejects.toThrow(
            error,
          );
          expect(mapGetSpy).not.toHaveBeenCalled();
        } else {
          await expect(service.getByMetadata(clientMetadata)).resolves.toEqual(
            undefined,
          );
          expect(mapGetSpy).toHaveBeenCalledTimes(1);
          expect(mapGetSpy).lastCalledWith(id);
        }
      },
    );

    it.each([
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          uniqueId: 'unid',
          db: 0,
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
            uniqueId: 'unsid',
          },
        },
        id: 'dbid_Common_unid_0_uid_aid_sid_unsid',
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          uniqueId: 'unid',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
            uniqueId: 'unsid',
          },
        },
        id: 'dbid_Common_unid_(nil)_uid_aid_sid_unsid',
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
            uniqueId: 'unsid',
          },
        },
        id: 'dbid_Common_(nil)_(nil)_uid_aid_sid_unsid',
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
          },
        },
        id: 'dbid_Common_(nil)_(nil)_uid_aid_sid_(nil)',
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
          },
        },
        error: mockInvalidClientMetadataError,
      },
      {
        clientMetadata: {
          context: 'Common',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
            sessionId: 'sid',
          },
        },
        error: mockInvalidClientMetadataError,
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          sessionMetadata: {
            userId: 'uid',
            accountId: 'aid',
          },
        },
        error: mockInvalidSessionMetadataError,
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          sessionMetadata: {
            accountId: 'aid',
            sessionId: 'sid',
          },
        },
        error: mockInvalidSessionMetadataError,
      },
      {
        clientMetadata: {
          databaseId: 'dbid',
          context: 'Common',
          sessionMetadata: {
            userId: 'uid',
            sessionId: 'sid',
          },
        },
        error: mockInvalidSessionMetadataError,
      },
      {
        clientMetadata: {},
        error: mockInvalidSessionMetadataError,
      },
    ] as any)(
      '%# removeByMetadata: validation and id generation',
      async ({ clientMetadata, id, error }) => {
        jest
          .spyOn(service['clients'], 'get')
          .mockReturnValue(mockStandaloneRedisClient);
        const mapDeleteSpy = jest.spyOn(service['clients'], 'delete');

        if (error) {
          await expect(
            service.removeByMetadata(clientMetadata),
          ).rejects.toThrow(error);
          expect(mapDeleteSpy).not.toHaveBeenCalled();
        } else {
          await expect(
            service.removeByMetadata(clientMetadata),
          ).resolves.toEqual(1);
          expect(mapDeleteSpy).toHaveBeenCalledTimes(1);
          expect(mapDeleteSpy).lastCalledWith(id);
        }
      },
    );

    it('check common use cases', async () => {
      expect(service['clients'].size).toEqual(0);

      const clients = generateNClients(CLIENTS_NUMBER);

      await Promise.all(
        clients.map(async ([cm, client]) => {
          expect(client.clientMetadata).toEqual(cm);

          // should set each client with expect id
          await service.set(client);

          // should get each client with expect id
          expect(await service.getByMetadata(cm)).toEqual(client);
        }),
      );

      expect(service['clients'].size).toEqual(CLIENTS_NUMBER);

      expect(await service.getByMetadata(clients[0][0])).toEqual(clients[0][1]);
      await service.removeByMetadata(clients[0][0]);
      expect(await service.getByMetadata(clients[0][0])).toEqual(undefined);

      expect(service['clients'].size).toEqual(CLIENTS_NUMBER - 1);

      expect(await service.getByMetadata(clients[1][0])).toEqual(clients[1][1]);
      await service.removeByMetadata(clients[1][0]);
      expect(await service.getByMetadata(clients[1][0])).toEqual(undefined);

      expect(service['clients'].size).toEqual(CLIENTS_NUMBER - 2);

      await Promise.all(
        clients.map(async ([cm, client]) => {
          expect(client.clientMetadata).toEqual(cm);

          // should set each client with expect id
          await service.removeByMetadata(cm);
        }),
      );

      expect(service['clients'].size).toEqual(0);
    });

    describe('remove many', () => {
      it('remove all', async () => {
        expect(service['clients'].size).toEqual(0);

        const clients = generateNClients(100);

        await Promise.all(
          [...clients].map(async ([, client]) => {
            await service.set(client);
          }),
        );

        expect(service['clients'].size).toEqual(100);

        // removes all clients when no any field specified
        await service.removeManyByMetadata({});

        expect(service['clients'].size).toEqual(0);
      });

      it.each([
        [
          { databaseId: 'db' },
          { databaseId: 'not-existing' },
          { databaseId: 'db' },
        ],
        [
          { context: 'Browser' },
          { context: 'not-existing' },
          { context: 'Browser' },
        ],
        [
          { uniqueId: 'uuid' },
          { uniqueId: 'not-existing' },
          { uniqueId: 'uuid' },
        ],
        [{ db: 1 }, { db: 2 }, { db: 1 }],
        [
          { userId: 'uid' },
          { sessionMetadata: { userId: 'not-existing' } },
          { sessionMetadata: { userId: 'uid' } },
        ],
        [
          { sessionId: 'sid' },
          { sessionMetadata: { sessionId: 'not-existing' } },
          { sessionMetadata: { sessionId: 'sid' } },
        ],
        // compound
        [
          { databaseId: 'db', sessionId: 'sid', userId: 'uid' },
          {
            databaseId: 'db',
            sessionMetadata: { sessionId: 'not-existing', userId: 'uid' },
          },
          {
            databaseId: 'db',
            sessionMetadata: { sessionId: 'sid', userId: 'uid' },
          },
        ],
      ] as any)(
        'remove many by %p',
        async (generate, notExisting, clientMetadata) => {
          expect(service['clients'].size).toEqual(0);

          const targetClients = generateNClients(100, generate);
          const clients = generateNClients(100);

          await Promise.all(
            [...targetClients, ...clients].map(async ([, client]) => {
              await service.set(client);
            }),
          );

          expect(service['clients'].size).toEqual(200);

          // shouldn't remove since there is no match
          await service.removeManyByMetadata(notExisting);

          expect(service['clients'].size).toEqual(200);

          await service.removeManyByMetadata(clientMetadata);

          expect(service['clients'].size).toEqual(100);

          await Promise.all(
            clients.map(async ([cm, client]) => {
              expect(await service.getByMetadata(cm)).toEqual(client);
            }),
          );
        },
      );
    });
  });
});
