import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockDatabaseClientFactory,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import {
  BrowserToolKeysCommands,
  BrowserToolVectorSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { VectorSetService } from './vector-set.service';

const mockClientMetadata = {
  databaseId: 'test-db-id',
};

describe('VectorSetService', () => {
  let service: VectorSetService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VectorSetService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
      ],
    }).compile();

    service = module.get<VectorSetService>(VectorSetService);
    // Clear cache between tests
    (service as any).vrangeSupportCache.clear();
  });

  describe('getElements', () => {
    const keyName = 'testVectorSet';

    it('should return elements using VRANGE when supported (Redis 8.4+)', async () => {
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolVectorSetCommands.VCard, keyName],
          [BrowserToolVectorSetCommands.VRange, keyName, '-', '+', '10'],
        ])
        .mockResolvedValueOnce([
          [null, 5],
          [null, ['elem1', 'elem2', 'elem3']],
        ]);

      const result = await service.getElements(mockClientMetadata as any, {
        keyName,
      });

      expect(result.keyName.toString()).toEqual(keyName);
      expect(result.total).toEqual(5);
      expect(result.elements).toHaveLength(3);
      expect(result.elements[0].name.toString()).toEqual('elem1');
      expect(result.elements[1].name.toString()).toEqual('elem2');
      expect(result.elements[2].name.toString()).toEqual('elem3');
    });

    it('should fallback to VRANDMEMBER when VRANGE not supported', async () => {
      // First call: VRANGE fails with unknown command
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolVectorSetCommands.VCard, keyName],
          [BrowserToolVectorSetCommands.VRange, keyName, '-', '+', '10'],
        ])
        .mockRejectedValueOnce(new Error("ERR unknown command 'VRANGE'"));

      // Fallback: VRANDMEMBER
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolVectorSetCommands.VCard, keyName],
          [BrowserToolVectorSetCommands.VRandMember, keyName, '10'],
        ])
        .mockResolvedValueOnce([
          [null, 5],
          [null, ['elem1', 'elem2', 'elem3']],
        ]);

      const result = await service.getElements(mockClientMetadata as any, {
        keyName,
      });

      expect(result.keyName.toString()).toEqual(keyName);
      expect(result.total).toEqual(5);
      expect(result.elements).toHaveLength(3);
    });

    it('should use cached VRANGE support on subsequent calls', async () => {
      // First call: VRANGE succeeds
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolVectorSetCommands.VCard, keyName],
          [BrowserToolVectorSetCommands.VRange, keyName, '-', '+', '10'],
        ])
        .mockResolvedValue([
          [null, 5],
          [null, ['elem1']],
        ]);

      await service.getElements(mockClientMetadata as any, { keyName });
      await service.getElements(mockClientMetadata as any, { keyName });

      // VRANGE should be called twice (cached as supported)
      expect(mockStandaloneRedisClient.sendPipeline).toHaveBeenCalledTimes(2);
    });

    it('should use cached VRANDMEMBER fallback on subsequent calls', async () => {
      // First call: VRANGE fails
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolVectorSetCommands.VCard, keyName],
          [BrowserToolVectorSetCommands.VRange, keyName, '-', '+', '10'],
        ])
        .mockRejectedValueOnce(new Error("ERR unknown command 'VRANGE'"));

      // Fallback and subsequent calls use VRANDMEMBER
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolVectorSetCommands.VCard, keyName],
          [BrowserToolVectorSetCommands.VRandMember, keyName, '10'],
        ])
        .mockResolvedValue([
          [null, 5],
          [null, ['elem1']],
        ]);

      await service.getElements(mockClientMetadata as any, { keyName });
      await service.getElements(mockClientMetadata as any, { keyName });

      // First call: VRANGE (failed) + VRANDMEMBER, Second call: VRANDMEMBER only
      expect(mockStandaloneRedisClient.sendPipeline).toHaveBeenCalledTimes(3);
    });

    it('should throw NotFoundException when key does not exist', async () => {
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolVectorSetCommands.VCard, keyName],
          [BrowserToolVectorSetCommands.VRange, keyName, '-', '+', '10'],
        ])
        .mockResolvedValueOnce([
          [null, 0],
          [null, []],
        ]);

      await expect(
        service.getElements(mockClientMetadata as any, { keyName }),
      ).rejects.toThrow();
    });

    it('should use positive count for VRANDMEMBER to avoid duplicates', async () => {
      // Set cache to use VRANDMEMBER
      (service as any).vrangeSupportCache.set(
        mockStandaloneRedisClient.id,
        false,
      );

      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolVectorSetCommands.VCard, keyName],
          [BrowserToolVectorSetCommands.VRandMember, keyName, '5'],
        ])
        .mockResolvedValueOnce([
          [null, 10],
          [null, ['elem1', 'elem2']],
        ]);

      const result = await service.getElements(mockClientMetadata as any, {
        keyName,
        count: 5,
      });

      expect(result.elements).toHaveLength(2);
    });
  });

  describe('deleteElements', () => {
    const keyName = 'testVectorSet';
    const elements = ['elem1', 'elem2'];

    it('should delete elements from vector set', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValueOnce(1);

      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolVectorSetCommands.VRem, keyName, 'elem1'],
          [BrowserToolVectorSetCommands.VRem, keyName, 'elem2'],
        ])
        .mockResolvedValueOnce([
          [null, 1],
          [null, 1],
        ]);

      const result = await service.deleteElements(mockClientMetadata as any, {
        keyName,
        elements,
      });

      expect(result).toEqual({ affected: 2 });
    });
  });

  describe('createVectorSet', () => {
    const keyName = 'newVectorSet';

    it('should create vector set with elements', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValueOnce(0);

      mockStandaloneRedisClient.sendPipeline.mockResolvedValueOnce([[null, 1]]);

      await service.createVectorSet(mockClientMetadata as any, {
        keyName,
        elements: [{ name: 'elem1', vector: [0.1, 0.2, 0.3] }],
      });

      expect(mockStandaloneRedisClient.sendPipeline).toHaveBeenCalled();
    });

    it('should throw error if key already exists', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValueOnce(1);

      await expect(
        service.createVectorSet(mockClientMetadata as any, {
          keyName,
          elements: [{ name: 'elem1', vector: [0.1, 0.2, 0.3] }],
        }),
      ).rejects.toThrow();
    });
  });

  describe('search', () => {
    const keyName = 'testVectorSet';

    it('should search vector set with VSIM', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValueOnce(1);

      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VSim,
          keyName,
          'VALUES',
          '3',
          '0.1',
          '0.2',
          '0.3',
          'COUNT',
          '10',
          'WITHSCORES',
        ])
        .mockResolvedValueOnce(['elem1', '0.95', 'elem2', '0.85']);

      const result = await service.search(mockClientMetadata as any, {
        keyName,
        vector: [0.1, 0.2, 0.3],
        count: 10,
        withScores: true,
      });

      expect(result.keyName.toString()).toEqual(keyName);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].name.toString()).toEqual('elem1');
      expect(result.results[0].score).toEqual(0.95);
      expect(result.results[1].name.toString()).toEqual('elem2');
      expect(result.results[1].score).toEqual(0.85);
    });

    it('should search without scores when withScores is false', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValueOnce(1);

      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VSim,
          keyName,
          'VALUES',
          '3',
          '0.1',
          '0.2',
          '0.3',
          'COUNT',
          '10',
        ])
        .mockResolvedValueOnce(['elem1', 'elem2']);

      const result = await service.search(mockClientMetadata as any, {
        keyName,
        vector: [0.1, 0.2, 0.3],
        count: 10,
        withScores: false,
      });

      expect(result.results).toHaveLength(2);
      expect(result.results[0].name.toString()).toEqual('elem1');
    });

    it('should throw NotFoundException when key does not exist', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValueOnce(0);

      await expect(
        service.search(mockClientMetadata as any, {
          keyName,
          vector: [0.1, 0.2, 0.3],
        }),
      ).rejects.toThrow();
    });

    it('should search by element name with ELE query type', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValueOnce(1);

      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VSim,
          keyName,
          'ELE',
          'referenceElement',
          'COUNT',
          '10',
          'WITHSCORES',
        ])
        .mockResolvedValueOnce(['elem1', '0.95', 'elem2', '0.85']);

      const result = await service.search(mockClientMetadata as any, {
        keyName,
        queryType: 'ELE' as any,
        element: 'referenceElement',
        count: 10,
        withScores: true,
      });

      expect(result.results).toHaveLength(2);
      expect(result.results[0].name.toString()).toEqual('elem1');
      expect(result.results[0].score).toEqual(0.95);
    });

    it('should search with WITHATTRIBS option', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValueOnce(1);

      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VSim,
          keyName,
          'VALUES',
          '3',
          '0.1',
          '0.2',
          '0.3',
          'COUNT',
          '10',
          'WITHSCORES',
          'WITHATTRIBS',
        ])
        .mockResolvedValueOnce([
          'elem1',
          '0.95',
          '{"category":"test"}',
          'elem2',
          '0.85',
          null,
        ]);

      const result = await service.search(mockClientMetadata as any, {
        keyName,
        vector: [0.1, 0.2, 0.3],
        count: 10,
        withScores: true,
        withAttribs: true,
      });

      expect(result.results).toHaveLength(2);
      expect(result.results[0].name.toString()).toEqual('elem1');
      expect(result.results[0].score).toEqual(0.95);
      expect(result.results[0].attributes).toEqual({ category: 'test' });
      expect(result.results[1].name.toString()).toEqual('elem2');
      expect(result.results[1].score).toEqual(0.85);
      expect(result.results[1].attributes).toBeNull();
    });
  });

  describe('getElementVector', () => {
    const keyName = 'testVectorSet';
    const element = 'elem1';

    it('should get element vector with VEMB', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValueOnce(1);

      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolVectorSetCommands.VEmb, keyName, element])
        .mockResolvedValueOnce(['0.1', '0.2', '0.3']);

      const result = await service.getElementVector(mockClientMetadata as any, {
        keyName,
        element,
      });

      expect(result.vector).toEqual([0.1, 0.2, 0.3]);
    });

    it('should throw NotFoundException when element does not exist', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValueOnce(1);

      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolVectorSetCommands.VEmb, keyName, element])
        .mockResolvedValueOnce(null);

      await expect(
        service.getElementVector(mockClientMetadata as any, {
          keyName,
          element,
        }),
      ).rejects.toThrow();
    });
  });

  describe('getElementAttributes', () => {
    const keyName = 'testVectorSet';
    const element = 'elem1';

    it('should get element attributes with VGETATTR', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValueOnce(1);

      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolVectorSetCommands.VGetAttr, keyName, element])
        .mockResolvedValueOnce('{"category":"test","score":42}');

      const result = await service.getElementAttributes(
        mockClientMetadata as any,
        { keyName, element },
      );

      expect(result.attributes).toEqual({ category: 'test', score: 42 });
    });

    it('should return null when element has no attributes', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValueOnce(1);

      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolVectorSetCommands.VGetAttr, keyName, element])
        .mockResolvedValueOnce(null);

      const result = await service.getElementAttributes(
        mockClientMetadata as any,
        { keyName, element },
      );

      expect(result.attributes).toBeNull();
    });
  });

  describe('updateElementAttributes', () => {
    const keyName = 'testVectorSet';
    const element = 'elem1';

    it('should update element attributes with VSETATTR', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValueOnce(1);

      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VSetAttr,
          keyName,
          element,
          '{"category":"updated"}',
        ])
        .mockResolvedValueOnce('OK');

      await service.updateElementAttributes(mockClientMetadata as any, {
        keyName,
        element,
        attributes: { category: 'updated' },
      });

      expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledWith([
        BrowserToolVectorSetCommands.VSetAttr,
        keyName,
        element,
        '{"category":"updated"}',
      ]);
    });

    it('should throw NotFoundException when key does not exist', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValueOnce(0);

      await expect(
        service.updateElementAttributes(mockClientMetadata as any, {
          keyName,
          element,
          attributes: { category: 'test' },
        }),
      ).rejects.toThrow();
    });
  });
});
