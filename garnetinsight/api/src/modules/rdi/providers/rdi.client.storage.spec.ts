import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { generateMockRdiClient } from 'src/__mocks__';
import { RdiClientStorage } from 'src/modules/rdi/providers/rdi.client.storage';
import { IDLE_THRESHOLD } from 'src/modules/rdi/constants';
import { SessionMetadata } from 'src/common/models';

const mockClientMetadata1 = {
  sessionMetadata: {
    userId: 'u1',
    sessionId: 's1',
  },
  id: 'id1',
};

const mockNotExistClientMetadata = {
  sessionMetadata: {
    userId: 'not exist',
    sessionId: 'not exist',
  },
  id: 'not exist',
};

const mockRdiClient1 = generateMockRdiClient(mockClientMetadata1);
const mockRdiClient2 = generateMockRdiClient({
  ...mockClientMetadata1,
  sessionMetadata: { userId: 'u2', sessionId: 's1' },
});
const mockRdiClient3 = generateMockRdiClient({
  ...mockClientMetadata1,
  sessionMetadata: { userId: 'u2', sessionId: 's3' },
});
const mockRdiClient4 = generateMockRdiClient({
  ...mockClientMetadata1,
  id: 'id2',
});

describe('RdiClientStorage', () => {
  let service: RdiClientStorage;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RdiClientStorage],
    }).compile();

    service = await module.get(RdiClientStorage);

    service['clients'].set(mockRdiClient1.id, mockRdiClient1);
    service['clients'].set(mockRdiClient2.id, mockRdiClient2);
    service['clients'].set(mockRdiClient3.id, mockRdiClient3);
    service['clients'].set(mockRdiClient4.id, mockRdiClient4);
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  describe('syncClients', () => {
    it('should not remove any client since no idle time passed', async () => {
      expect(service['clients'].size).toEqual(4);

      service['syncClients']();

      expect(service['clients'].size).toEqual(4);
    });

    it('should remove client with exceeded time in idle', async () => {
      expect(service['clients'].size).toEqual(4);
      const toDelete = service['clients'].get(mockRdiClient1.id);
      toDelete['lastUsed'] = Date.now() - IDLE_THRESHOLD - 1;
      service['syncClients']();

      expect(service['clients'].size).toEqual(3);
      expect(service['clients'].get(mockRdiClient1.id)).toEqual(undefined);
    });

    describe('get', () => {
      it('should correctly get client instance and update last used time', async () => {
        // eslint-disable-next-line prefer-destructuring
        const lastUsed = mockRdiClient1['lastUsed'];

        const result = await service.get(mockRdiClient1.id);

        expect(result).toEqual(service['clients'].get(mockRdiClient1.id));
        expect(result['lastUsed']).toBeGreaterThan(lastUsed);
      });
      it('should not fail when there is no client', async () => {
        const result = await service.get('not-existing');

        expect(result).toBeUndefined();
      });
    });

    describe('getByMetadata', () => {
      it('should correctly get client instance and update last used time', async () => {
        // eslint-disable-next-line prefer-destructuring
        const lastUsed = mockRdiClient1['lastUsed'];

        const result = await service.getByMetadata(mockClientMetadata1);

        expect(result).toEqual(service['clients'].get(mockRdiClient1.id));
        expect(result['lastUsed']).toBeGreaterThan(lastUsed);
      });

      it('should not fail when there is no client', async () => {
        const result = await service.getByMetadata(mockNotExistClientMetadata);

        expect(result).toBeUndefined();
      });

      it('should throw BadRequestException when metadata is invalid', async () => {
        await expect(
          service.getByMetadata({
            ...mockNotExistClientMetadata,
            id: undefined,
          }),
        ).rejects.toThrow(
          new BadRequestException('Client metadata missed required properties'),
        );

        await expect(
          service.getByMetadata({
            ...mockNotExistClientMetadata,
            sessionMetadata: {
              ...mockNotExistClientMetadata.sessionMetadata,
              sessionId: undefined,
            },
          }),
        ).rejects.toThrow(
          new BadRequestException('Client metadata missed required properties'),
        );

        await expect(
          service.getByMetadata({
            ...mockNotExistClientMetadata,
            sessionMetadata: {
              ...mockNotExistClientMetadata.sessionMetadata,
              userId: undefined,
            },
          }),
        ).rejects.toThrow(
          new BadRequestException('Client metadata missed required properties'),
        );
      });
    });

    describe('set', () => {
      beforeEach(() => {
        // @ts-ignore
        service['clients'] = new Map();
      });

      it('should add new client', async () => {
        expect(service['clients'].size).toEqual(0);
        const result = await service.set(mockRdiClient1);

        expect(result).toEqual(mockRdiClient1);
        expect(service['clients'].size).toEqual(1);
        expect(await service.get(mockRdiClient1.id)).toEqual(mockRdiClient1);
      });

      it('should replace new client with existing', async () => {
        const existingClient = generateMockRdiClient(mockClientMetadata1);

        expect(service['clients'].size).toEqual(0);
        expect(await service.set(existingClient)).toEqual(existingClient);
        expect(service['clients'].size).toEqual(1);

        const newClient = generateMockRdiClient(mockClientMetadata1);
        const result = await service.set(newClient);
        expect(result).not.toEqual(existingClient);
        expect(result).toEqual(newClient);
        expect(service['clients'].size).toEqual(1);
      });

      it('should throw BadRequestException when metadata is invalid', async () => {
        await expect(
          service.set(
            generateMockRdiClient({
              sessionMetadata: {} as SessionMetadata,
              id: 'id',
            }),
          ),
        ).rejects.toThrow(
          new BadRequestException('Client metadata missed required properties'),
        );

        await expect(
          service.set(
            generateMockRdiClient({
              sessionMetadata: {
                userId: 'u2',
                sessionId: 's1',
              } as SessionMetadata,
              id: undefined,
            }),
          ),
        ).rejects.toThrow(
          new BadRequestException('Client metadata missed required properties'),
        );

        await expect(
          service.set(
            generateMockRdiClient({
              sessionMetadata: {
                userId: 'u2',
                sessionId: undefined,
              } as SessionMetadata,
              id: 'id',
            }),
          ),
        ).rejects.toThrow(
          new BadRequestException('Client metadata missed required properties'),
        );

        await expect(
          service.set(
            generateMockRdiClient({
              sessionMetadata: {
                userId: undefined,
                sessionId: 's2',
              } as SessionMetadata,
              id: 'id',
            }),
          ),
        ).rejects.toThrow(
          new BadRequestException('Client metadata missed required properties'),
        );
      });
    });

    describe('delete', () => {
      it('should remove only one', async () => {
        expect(service['clients'].size).toEqual(4);
        const result = await service.delete(mockRdiClient1.id);

        expect(result).toEqual(1);
        expect(service['clients'].size).toEqual(3);
        expect(service['clients'].get(mockRdiClient1.id)).toEqual(undefined);
      });
      it('should not fail in case when no client found', async () => {
        const result = await service.delete('not-existing');

        expect(result).toEqual(0);
        expect(service['clients'].size).toEqual(4);
      });
    });

    describe('findClients + deleteManyByRdiId', () => {
      it('should correctly find clients for particular rdi instance', async () => {
        const result = service['findClientsById'](mockClientMetadata1.id);

        expect(result.length).toEqual(3);
        result.forEach((id) => {
          expect(service['clients'].get(id)['metadata'].id).toEqual(
            mockClientMetadata1.id,
          );
        });

        expect(await service.deleteManyByRdiId(mockClientMetadata1.id)).toEqual(
          3,
        );
        expect(service['clients'].size).toEqual(1);
      });

      it('should not find any instances', async () => {
        const result = service['findClientsById']('not existing');

        expect(result).toEqual([]);

        expect(await service.deleteManyByRdiId('not existing')).toEqual(0);
        expect(service['clients'].size).toEqual(4);
      });
    });
  });
});
