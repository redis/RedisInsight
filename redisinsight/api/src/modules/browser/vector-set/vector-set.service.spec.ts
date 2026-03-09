import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { ReplyError } from 'src/models';
import {
  mockBrowserClientMetadata,
  mockRedisNoPermError,
  mockRedisWrongTypeError,
  mockDatabaseClientFactory,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { BrowserToolVectorSetCommands } from 'src/modules/browser/constants/browser-tool-commands';
import {
  mockGetVectorSetElementsDto,
  mockVectorSetElements,
} from 'src/modules/browser/__mocks__';
import { VectorSetService } from 'src/modules/browser/vector-set/vector-set.service';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';

describe('VectorSetService', () => {
  const client = mockStandaloneRedisClient;
  let service: VectorSetService;

  beforeEach(async () => {
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
    client.sendCommand = jest.fn().mockResolvedValue(undefined);
    client.sendPipeline = jest.fn().mockResolvedValue(undefined);
  });

  describe('getElements', () => {
    const mockElementNames = ['element1', 'element2', 'element3'];

    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VCard,
          mockGetVectorSetElementsDto.keyName,
        ])
        .mockResolvedValue(mockVectorSetElements.length);

      when(client.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VRange,
          mockGetVectorSetElementsDto.keyName,
          mockGetVectorSetElementsDto.start,
          mockGetVectorSetElementsDto.end,
          mockGetVectorSetElementsDto.count,
        ])
        .mockResolvedValue(mockElementNames);
    });

    it('should get elements successfully', async () => {
      // Mock pipeline results for VEMB and VGETATTR
      const pipelineResults = [
        [null, ['0.5', '0.3', '0.8']], // VEMB element1
        [null, '{"category": "test"}'], // VGETATTR element1
        [null, ['0.1', '0.2', '0.9']], // VEMB element2
        [null, null], // VGETATTR element2
        [null, ['0.7', '0.4', '0.6']], // VEMB element3
        [null, '{"score": 0.95}'], // VGETATTR element3
      ];
      client.sendPipeline.mockResolvedValue(pipelineResults);

      const result = await service.getElements(
        mockBrowserClientMetadata,
        mockGetVectorSetElementsDto,
      );

      expect(result.keyName).toEqual(mockGetVectorSetElementsDto.keyName);
      expect(result.total).toEqual(mockVectorSetElements.length);
      expect(result.elements).toHaveLength(3);
      expect(result.elements[0].name).toEqual(Buffer.from('element1'));
      expect(result.elements[0].vector).toEqual([0.5, 0.3, 0.8]);
      expect(result.elements[0].attributes).toEqual('{"category": "test"}');
      expect(result.elements[1].attributes).toBeUndefined();
    });

    it('should return nextCursor when results equal count', async () => {
      const dto = { ...mockGetVectorSetElementsDto, count: 3 };

      when(client.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VRange,
          dto.keyName,
          dto.start,
          dto.end,
          dto.count,
        ])
        .mockResolvedValue(mockElementNames);

      const pipelineResults = [
        [null, ['0.5', '0.3', '0.8']],
        [null, null],
        [null, ['0.1', '0.2', '0.9']],
        [null, null],
        [null, ['0.7', '0.4', '0.6']],
        [null, null],
      ];
      client.sendPipeline.mockResolvedValue(pipelineResults);

      const result = await service.getElements(mockBrowserClientMetadata, dto);

      expect(result.nextCursor).toEqual('(element3');
    });

    it('should return empty elements when key is empty', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VCard,
          mockGetVectorSetElementsDto.keyName,
        ])
        .mockResolvedValue(0);

      when(client.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VRange,
          mockGetVectorSetElementsDto.keyName,
          mockGetVectorSetElementsDto.start,
          mockGetVectorSetElementsDto.end,
          mockGetVectorSetElementsDto.count,
        ])
        .mockResolvedValue([]);

      client.sendPipeline.mockResolvedValue([]);

      const result = await service.getElements(
        mockBrowserClientMetadata,
        mockGetVectorSetElementsDto,
      );

      expect(result.total).toEqual(0);
      expect(result.elements).toEqual([]);
      expect(result.nextCursor).toBeUndefined();
    });

    it('should throw NotFoundException when key does not exist', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VCard,
          mockGetVectorSetElementsDto.keyName,
        ])
        .mockResolvedValue(null);

      await expect(
        service.getElements(
          mockBrowserClientMetadata,
          mockGetVectorSetElementsDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for wrong type error', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'VCARD',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getElements(
          mockBrowserClientMetadata,
          mockGetVectorSetElementsDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when user has no permissions', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'VCARD',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getElements(
          mockBrowserClientMetadata,
          mockGetVectorSetElementsDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
