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
  addElementsToVectorSetDtoFactory,
  addVectorSetElementDtoFactory,
  buildVsimByElementCommand,
  buildVsimByFp32Command,
  buildVsimByValuesCommand,
  createVectorSetDtoFactory,
  deleteVectorSetElementsDtoFactory,
  downloadVectorSetEmbeddingDtoFactory,
  fp32AddVectorSetElementDtoFactory,
  FP32_VECTOR_FIXTURE_1_2_3,
  getVectorSetElementsDtoFactory,
  getVectorSetElementDetailsDtoFactory,
  similaritySearchDtoFactory,
  SEARCH_VSIM_MATCH_ATTRIBUTES_1,
  SEARCH_VSIM_MATCH_NAME_1,
  SEARCH_VSIM_MATCH_NAME_2,
  SEARCH_VSIM_REPLY_TWO_MATCHES,
  setVectorSetElementAttributeDtoFactory,
  vectorSetElementFactory,
} from 'src/modules/browser/vector-set/__tests__/vector-set.factory';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { VectorSetService } from 'src/modules/browser/vector-set/vector-set.service';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisFeature } from 'src/modules/redis/client';

describe('VectorSetService', () => {
  const client = mockStandaloneRedisClient;
  let service: VectorSetService;

  const mockElements = vectorSetElementFactory.buildList(3);
  const mockDto = getVectorSetElementsDtoFactory.build();
  const mockElementNames = mockElements.map((el) => el.name.toString());

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

  describe('createVectorSet', () => {
    const mockCreateDto = createVectorSetDtoFactory.build();

    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockCreateDto.keyName])
        .mockResolvedValue(false);
    });

    it('should create vector set with elements successfully', async () => {
      client.sendPipeline.mockResolvedValue(
        mockCreateDto.elements.map(() => [null, 1]),
      );

      await service.createVectorSet(mockBrowserClientMetadata, mockCreateDto);

      expect(client.sendPipeline).toHaveBeenCalledWith(
        mockCreateDto.elements.map((el) =>
          expect.arrayContaining([
            BrowserToolVectorSetCommands.VAdd,
            mockCreateDto.keyName,
            'VALUES',
            el.vectorValues.length,
          ]),
        ),
      );
    });

    it('should include SETATTR when element has attributes', async () => {
      const mockElement = addVectorSetElementDtoFactory.build({
        attributes: '{"color":"red"}',
      });
      const dtoWithAttrs = createVectorSetDtoFactory.build({
        elements: [mockElement],
      });

      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, dtoWithAttrs.keyName])
        .mockResolvedValue(false);

      client.sendPipeline.mockResolvedValue([[null, 1]]);

      await service.createVectorSet(mockBrowserClientMetadata, dtoWithAttrs);

      expect(client.sendPipeline).toHaveBeenCalledWith([
        expect.arrayContaining(['SETATTR', mockElement.attributes]),
      ]);
    });

    it('should set expire when provided', async () => {
      const dtoWithExpire = createVectorSetDtoFactory.build({
        expire: 3600,
      });

      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, dtoWithExpire.keyName])
        .mockResolvedValue(false);

      client.sendPipeline.mockResolvedValue([
        ...dtoWithExpire.elements.map(() => [null, 1]),
        [null, 1],
      ]);

      await service.createVectorSet(mockBrowserClientMetadata, dtoWithExpire);

      expect(client.sendPipeline).toHaveBeenCalledWith(
        expect.arrayContaining([
          [BrowserToolKeysCommands.Expire, dtoWithExpire.keyName, 3600],
        ]),
      );
    });

    it('should throw when key already exists', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockCreateDto.keyName])
        .mockResolvedValue(true);

      await expect(
        service.createVectorSet(mockBrowserClientMetadata, mockCreateDto),
      ).rejects.toThrow();
    });

    it('should dispatch VADD with FP32 Buffer when element has vectorFp32 payload', async () => {
      const fp32Element = fp32AddVectorSetElementDtoFactory.build();
      const dtoWithFp32 = createVectorSetDtoFactory.build({
        elements: [fp32Element],
      });

      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, dtoWithFp32.keyName])
        .mockResolvedValue(false);

      client.sendPipeline.mockResolvedValue([[null, 1]]);

      await service.createVectorSet(mockBrowserClientMetadata, dtoWithFp32);

      expect(client.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolVectorSetCommands.VAdd,
          dtoWithFp32.keyName,
          'FP32',
          FP32_VECTOR_FIXTURE_1_2_3.buffer,
          fp32Element.name,
        ],
      ]);
    });

    it('should throw BadRequestException when element has neither vectorValues nor vectorFp32', async () => {
      const invalidElement = addVectorSetElementDtoFactory.build({
        vectorValues: undefined,
        vectorFp32: undefined,
      });
      const invalidDto = createVectorSetDtoFactory.build({
        elements: [invalidElement],
      });

      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, invalidDto.keyName])
        .mockResolvedValue(false);

      await expect(
        service.createVectorSet(mockBrowserClientMetadata, invalidDto),
      ).rejects.toThrow(BadRequestException);
      expect(client.sendPipeline).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when element supplies both vectorValues and vectorFp32', async () => {
      const conflictingElement = addVectorSetElementDtoFactory.build({
        vectorValues: [0.1, 0.2, 0.3],
        vectorFp32: FP32_VECTOR_FIXTURE_1_2_3.base64,
      });
      const conflictingDto = createVectorSetDtoFactory.build({
        elements: [conflictingElement],
      });

      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, conflictingDto.keyName])
        .mockResolvedValue(false);

      await expect(
        service.createVectorSet(mockBrowserClientMetadata, conflictingDto),
      ).rejects.toThrow(BadRequestException);
      expect(client.sendPipeline).not.toHaveBeenCalled();
    });
  });

  describe('addElements', () => {
    const mockElement = addVectorSetElementDtoFactory.build({
      attributes: '{"status":"active"}',
    });
    const mockAddDto = addElementsToVectorSetDtoFactory.build({
      elements: [mockElement],
    });

    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockAddDto.keyName])
        .mockResolvedValue(true);
    });

    it('should add elements to existing vector set successfully', async () => {
      client.sendPipeline.mockResolvedValue([[null, 1]]);

      await service.addElements(mockBrowserClientMetadata, mockAddDto);

      expect(client.sendPipeline).toHaveBeenCalledWith([
        expect.arrayContaining([
          BrowserToolVectorSetCommands.VAdd,
          mockAddDto.keyName,
          'VALUES',
          mockElement.vectorValues.length,
          'SETATTR',
          mockElement.attributes,
        ]),
      ]);
    });

    it('should throw NotFoundException when key does not exist', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockAddDto.keyName])
        .mockResolvedValue(false);

      await expect(
        service.addElements(mockBrowserClientMetadata, mockAddDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should dispatch VADD with FP32 Buffer when element has vectorFp32 payload', async () => {
      const fp32Element = fp32AddVectorSetElementDtoFactory.build({
        attributes: '{"status":"active"}',
      });
      const fp32Dto = addElementsToVectorSetDtoFactory.build({
        elements: [fp32Element],
      });

      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, fp32Dto.keyName])
        .mockResolvedValue(true);

      client.sendPipeline.mockResolvedValue([[null, 1]]);

      await service.addElements(mockBrowserClientMetadata, fp32Dto);

      expect(client.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolVectorSetCommands.VAdd,
          fp32Dto.keyName,
          'FP32',
          FP32_VECTOR_FIXTURE_1_2_3.buffer,
          fp32Element.name,
          'SETATTR',
          fp32Element.attributes,
        ],
      ]);
    });

    it('should throw BadRequestException when element.vectorValues is an empty array', async () => {
      const emptyVectorElement = addVectorSetElementDtoFactory.build({
        vectorValues: [],
        vectorFp32: undefined,
      });
      const emptyDto = addElementsToVectorSetDtoFactory.build({
        elements: [emptyVectorElement],
      });

      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, emptyDto.keyName])
        .mockResolvedValue(true);

      await expect(
        service.addElements(mockBrowserClientMetadata, emptyDto),
      ).rejects.toThrow(BadRequestException);
      expect(client.sendPipeline).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when element supplies both vectorValues and vectorFp32', async () => {
      const conflictingElement = addVectorSetElementDtoFactory.build({
        vectorValues: [0.1, 0.2, 0.3],
        vectorFp32: FP32_VECTOR_FIXTURE_1_2_3.base64,
      });
      const conflictingDto = addElementsToVectorSetDtoFactory.build({
        elements: [conflictingElement],
      });

      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, conflictingDto.keyName])
        .mockResolvedValue(true);

      await expect(
        service.addElements(mockBrowserClientMetadata, conflictingDto),
      ).rejects.toThrow(BadRequestException);
      expect(client.sendPipeline).not.toHaveBeenCalled();
    });
  });

  describe('getElements', () => {
    beforeEach(() => {
      client.isFeatureSupported = jest.fn().mockResolvedValue(true);

      when(client.sendCommand)
        .calledWith([BrowserToolVectorSetCommands.VCard, mockDto.keyName])
        .mockResolvedValue(mockElements.length);

      when(client.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VRange,
          mockDto.keyName,
          mockDto.start,
          mockDto.end,
          mockDto.count,
        ])
        .mockResolvedValue(mockElementNames);
    });

    it('should get elements successfully', async () => {
      const result = await service.getElements(
        mockBrowserClientMetadata,
        mockDto,
      );

      expect(client.isFeatureSupported).toHaveBeenCalledWith(
        RedisFeature.VRangeCommand,
      );
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolVectorSetCommands.VRange,
        mockDto.keyName,
        mockDto.start,
        mockDto.end,
        mockDto.count,
      ]);
      expect(result.keyName).toEqual(mockDto.keyName);
      expect(result.total).toEqual(mockElements.length);
      expect(result.elementNames).toHaveLength(mockElements.length);
      expect(result.isPaginationSupported).toBe(true);
    });

    it('should return nextCursor when results equal count', async () => {
      const dto = { ...mockDto, count: mockElements.length };

      when(client.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VRange,
          dto.keyName,
          dto.start,
          dto.end,
          dto.count,
        ])
        .mockResolvedValue(mockElementNames);

      const result = await service.getElements(mockBrowserClientMetadata, dto);

      const lastElementName = mockElementNames[mockElementNames.length - 1];
      expect(result.nextCursor).toEqual(`(${lastElementName}`);
      expect(result.isPaginationSupported).toBe(true);
    });

    it('should throw NotFoundException when key does not exist', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolVectorSetCommands.VCard, mockDto.keyName])
        .mockResolvedValue(0);

      await expect(
        service.getElements(mockBrowserClientMetadata, mockDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for wrong type error', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'VCARD',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getElements(mockBrowserClientMetadata, mockDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when user has no permissions', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'VCARD',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getElements(mockBrowserClientMetadata, mockDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should fallback to VRANDMEMBER when VRANGE is not supported', async () => {
      client.isFeatureSupported = jest.fn().mockResolvedValue(false);

      when(client.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VRandMember,
          mockDto.keyName,
          mockDto.count,
        ])
        .mockResolvedValue(mockElementNames);

      const result = await service.getElements(
        mockBrowserClientMetadata,
        mockDto,
      );

      expect(client.isFeatureSupported).toHaveBeenCalledWith(
        RedisFeature.VRangeCommand,
      );
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolVectorSetCommands.VRandMember,
        mockDto.keyName,
        mockDto.count,
      ]);
      expect(result.elementNames).toHaveLength(mockElements.length);
      expect(result.nextCursor).toBeUndefined();
      expect(result.isPaginationSupported).toBe(false);
    });
  });

  describe('deleteElements', () => {
    const mockDeleteDto = deleteVectorSetElementsDtoFactory.build();

    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockDeleteDto.keyName])
        .mockResolvedValue(true);
    });

    it('should delete elements successfully', async () => {
      const { elements, keyName } = mockDeleteDto;

      const pipelineCommands = elements.map((element) => [
        BrowserToolVectorSetCommands.VRem,
        keyName,
        element,
      ]);
      client.sendPipeline.mockResolvedValue(elements.map(() => [null, 1]));

      const result = await service.deleteElements(
        mockBrowserClientMetadata,
        mockDeleteDto,
      );

      expect(client.sendPipeline).toHaveBeenCalledWith(pipelineCommands);
      expect(result).toEqual({ affected: elements.length });
    });

    it('should throw NotFoundException when key does not exist', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockDeleteDto.keyName])
        .mockResolvedValue(false);

      await expect(
        service.deleteElements(mockBrowserClientMetadata, mockDeleteDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for wrong type error', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'VREM',
      };
      client.sendPipeline.mockResolvedValue([[replyError, null]]);

      await expect(
        service.deleteElements(mockBrowserClientMetadata, mockDeleteDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when user has no permissions', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'VREM',
      };
      client.sendPipeline.mockResolvedValue([[replyError, null]]);

      await expect(
        service.deleteElements(mockBrowserClientMetadata, mockDeleteDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getElementDetails', () => {
    const mockDetailsDto = getVectorSetElementDetailsDtoFactory.build();
    const mockElement = vectorSetElementFactory.build({
      attributes: JSON.stringify({ status: 'active' }),
    });
    const mockRawVector = mockElement.vector!.map(String);

    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockDetailsDto.keyName])
        .mockResolvedValue(true);
    });

    it('should return element with vector and attributes', async () => {
      client.sendPipeline.mockResolvedValue([
        [null, mockRawVector],
        [null, mockElement.attributes],
      ]);

      const result = await service.getElementDetails(
        mockBrowserClientMetadata,
        mockDetailsDto,
      );

      expect(Buffer.from(result.name as any).toString()).toEqual(
        mockDetailsDto.element.toString(),
      );
      expect(result.vector).toEqual(mockElement.vector);
      expect(result.vectorTruncated).toBeUndefined();
      expect(result.attributes).toEqual(mockElement.attributes);
    });

    it('should return element with undefined attributes when none exist', async () => {
      client.sendPipeline.mockResolvedValue([
        [null, mockRawVector],
        [null, null],
      ]);

      const result = await service.getElementDetails(
        mockBrowserClientMetadata,
        mockDetailsDto,
      );

      expect(result.vector).toEqual(mockElement.vector);
      expect(result.attributes).toBeUndefined();
    });

    it('should return element with undefined vector when VEMB returns null', async () => {
      client.sendPipeline.mockResolvedValue([
        [null, null],
        [null, mockElement.attributes],
      ]);

      const result = await service.getElementDetails(
        mockBrowserClientMetadata,
        mockDetailsDto,
      );

      expect(result.vector).toBeUndefined();
      expect(result.attributes).toEqual(mockElement.attributes);
    });

    it('should throw NotFoundException when key does not exist', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockDetailsDto.keyName])
        .mockResolvedValue(false);

      await expect(
        service.getElementDetails(mockBrowserClientMetadata, mockDetailsDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for wrong type error', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'VEMB',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getElementDetails(mockBrowserClientMetadata, mockDetailsDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when user has no permissions', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'VEMB',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getElementDetails(mockBrowserClientMetadata, mockDetailsDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('setElementAttribute', () => {
    const mockSetAttrDto = setVectorSetElementAttributeDtoFactory.build();

    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockSetAttrDto.keyName])
        .mockResolvedValue(true);
    });

    it('should set element attribute and return the stored value', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VSetAttr,
          mockSetAttrDto.keyName,
          mockSetAttrDto.element,
          mockSetAttrDto.attributes,
        ])
        .mockResolvedValue(1);

      when(client.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VGetAttr,
          mockSetAttrDto.keyName,
          mockSetAttrDto.element,
        ])
        .mockResolvedValue(mockSetAttrDto.attributes);

      const result = await service.setElementAttribute(
        mockBrowserClientMetadata,
        mockSetAttrDto,
      );

      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolVectorSetCommands.VSetAttr,
        mockSetAttrDto.keyName,
        mockSetAttrDto.element,
        mockSetAttrDto.attributes,
      ]);
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolVectorSetCommands.VGetAttr,
        mockSetAttrDto.keyName,
        mockSetAttrDto.element,
      ]);
      expect(result.attributes).toEqual(mockSetAttrDto.attributes);
    });

    it('should throw NotFoundException when key does not exist', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockSetAttrDto.keyName])
        .mockResolvedValue(false);

      await expect(
        service.setElementAttribute(mockBrowserClientMetadata, mockSetAttrDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for wrong type error', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'VSETATTR',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.setElementAttribute(mockBrowserClientMetadata, mockSetAttrDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when user has no permissions', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'VSETATTR',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.setElementAttribute(mockBrowserClientMetadata, mockSetAttrDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('downloadEmbedding', () => {
    const mockDownloadDto = downloadVectorSetEmbeddingDtoFactory.build();
    const mockDownloadElement = vectorSetElementFactory.build();
    const mockRawVector = mockDownloadElement.vector!.map(String);

    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockDownloadDto.keyName])
        .mockResolvedValue(true);
    });

    it('should return a readable stream with formatted vector', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VEmb,
          mockDownloadDto.keyName,
          mockDownloadDto.element,
        ])
        .mockResolvedValue(mockRawVector);

      const { stream } = await service.downloadEmbedding(
        mockBrowserClientMetadata,
        mockDownloadDto,
      );

      const chunks: string[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const result = chunks.join('');

      expect(result).toEqual(`[${mockRawVector.join(', ')}]`);
    });

    it('should return "[]" when VEMB returns null', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolVectorSetCommands.VEmb,
          mockDownloadDto.keyName,
          mockDownloadDto.element,
        ])
        .mockResolvedValue(null);

      const { stream } = await service.downloadEmbedding(
        mockBrowserClientMetadata,
        mockDownloadDto,
      );

      const chunks: string[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks.join('')).toEqual('[]');
    });

    it('should throw NotFoundException when key does not exist', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockDownloadDto.keyName])
        .mockResolvedValue(false);

      await expect(
        service.downloadEmbedding(mockBrowserClientMetadata, mockDownloadDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for wrong type error', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'VEMB',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.downloadEmbedding(mockBrowserClientMetadata, mockDownloadDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when user has no permissions', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'VEMB',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.downloadEmbedding(mockBrowserClientMetadata, mockDownloadDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('similaritySearch', () => {
    const mockSearchByElementDto = similaritySearchDtoFactory.build();
    const mockSearchByValuesDto = similaritySearchDtoFactory.build(
      {},
      { transient: { variant: 'values' } },
    );
    const mockSearchByFp32Dto = similaritySearchDtoFactory.build(
      {},
      { transient: { variant: 'fp32' } },
    );

    beforeEach(() => {
      // Default to "WITHATTRIBS supported" (Redis ≥ 8.0.3) so the canonical
      // path is exercised here; the dedicated 8.0.0–8.0.2 fallback block
      // below overrides this per-test.
      client.isFeatureSupported = jest.fn().mockResolvedValue(true);

      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockSearchByElementDto.keyName,
        ])
        .mockResolvedValue(true);
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockSearchByValuesDto.keyName,
        ])
        .mockResolvedValue(true);
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockSearchByFp32Dto.keyName,
        ])
        .mockResolvedValue(true);
    });

    it('should run VSIM by element with COUNT, WITHSCORES and WITHATTRIBS', async () => {
      const expectedCommand = buildVsimByElementCommand(mockSearchByElementDto);
      when(client.sendCommand)
        .calledWith(expectedCommand)
        .mockResolvedValue(SEARCH_VSIM_REPLY_TWO_MATCHES);

      const result = await service.similaritySearch(
        mockBrowserClientMetadata,
        mockSearchByElementDto,
      );

      expect(client.sendCommand).toHaveBeenCalledWith(expectedCommand);
      expect(result.keyName).toEqual(mockSearchByElementDto.keyName);
      expect(result.elements).toHaveLength(2);
      expect(result.elements[0]).toEqual({
        name: SEARCH_VSIM_MATCH_NAME_1,
        score: 0.95,
        attributes: SEARCH_VSIM_MATCH_ATTRIBUTES_1,
      });
      expect(result.elements[1]).toEqual({
        name: SEARCH_VSIM_MATCH_NAME_2,
        score: 0.81,
      });
      expect('attributes' in result.elements[1]).toBe(false);
    });

    it('should run VSIM by VALUES with stringified vector entries', async () => {
      const expectedCommand = buildVsimByValuesCommand(mockSearchByValuesDto);
      when(client.sendCommand)
        .calledWith(expectedCommand)
        .mockResolvedValue([]);

      await service.similaritySearch(
        mockBrowserClientMetadata,
        mockSearchByValuesDto,
      );

      expect(client.sendCommand).toHaveBeenCalledWith(expectedCommand);
    });

    it('should run VSIM by FP32 with a Buffer payload', async () => {
      const expectedCommand = buildVsimByFp32Command(
        mockSearchByFp32Dto,
        FP32_VECTOR_FIXTURE_1_2_3.buffer,
      );
      when(client.sendCommand)
        .calledWith(expectedCommand)
        .mockResolvedValue([]);

      await service.similaritySearch(
        mockBrowserClientMetadata,
        mockSearchByFp32Dto,
      );

      expect(client.sendCommand).toHaveBeenCalledWith(expectedCommand);
    });

    it('should append FILTER after COUNT/WITHSCORES/WITHATTRIBS', async () => {
      const dto = { ...mockSearchByElementDto, filter: '@score > 0.5' };
      const expectedCommand = buildVsimByElementCommand(dto, {
        filter: dto.filter,
      });
      when(client.sendCommand)
        .calledWith(expectedCommand)
        .mockResolvedValue([]);

      await service.similaritySearch(mockBrowserClientMetadata, dto);

      expect(client.sendCommand).toHaveBeenCalledWith(expectedCommand);
    });

    it('should omit COUNT when count is undefined but still send WITHSCORES/WITHATTRIBS', async () => {
      const dto = { ...mockSearchByElementDto, count: undefined };
      const expectedCommand = buildVsimByElementCommand(dto, {
        includeCount: false,
      });
      when(client.sendCommand)
        .calledWith(expectedCommand)
        .mockResolvedValue([]);

      await service.similaritySearch(mockBrowserClientMetadata, dto);

      expect(client.sendCommand).toHaveBeenCalledWith(expectedCommand);
    });

    it('should parse a string score into a float number', async () => {
      when(client.sendCommand)
        .calledWith(buildVsimByElementCommand(mockSearchByElementDto))
        .mockResolvedValue([SEARCH_VSIM_MATCH_NAME_1, '0.952381', null]);

      const result = await service.similaritySearch(
        mockBrowserClientMetadata,
        mockSearchByElementDto,
      );

      expect(typeof result.elements[0].score).toBe('number');
      expect(result.elements[0].score).toBeCloseTo(0.952381, 6);
    });

    it('should parse a Buffer score into a float number', async () => {
      when(client.sendCommand)
        .calledWith(buildVsimByElementCommand(mockSearchByElementDto))
        .mockResolvedValue([
          SEARCH_VSIM_MATCH_NAME_1,
          Buffer.from('0.4275'),
          null,
        ]);

      const result = await service.similaritySearch(
        mockBrowserClientMetadata,
        mockSearchByElementDto,
      );

      expect(typeof result.elements[0].score).toBe('number');
      expect(result.elements[0].score).toBeCloseTo(0.4275, 6);
    });

    it('should pass through a numeric (RESP3 double) score unchanged', async () => {
      when(client.sendCommand)
        .calledWith(buildVsimByElementCommand(mockSearchByElementDto))
        .mockResolvedValue([SEARCH_VSIM_MATCH_NAME_1, 0.123456, null]);

      const result = await service.similaritySearch(
        mockBrowserClientMetadata,
        mockSearchByElementDto,
      );

      expect(typeof result.elements[0].score).toBe('number');
      expect(result.elements[0].score).toBe(0.123456);
    });

    it('should decode a Buffer attributes payload into a string', async () => {
      const attrs = JSON.stringify({ tag: 'red' });
      when(client.sendCommand)
        .calledWith(buildVsimByElementCommand(mockSearchByElementDto))
        .mockResolvedValue([
          SEARCH_VSIM_MATCH_NAME_1,
          '0.5',
          Buffer.from(attrs),
        ]);

      const result = await service.similaritySearch(
        mockBrowserClientMetadata,
        mockSearchByElementDto,
      );

      expect(result.elements[0].attributes).toBe(attrs);
    });

    it('should return empty elements array when VSIM returns []', async () => {
      when(client.sendCommand)
        .calledWith(buildVsimByElementCommand(mockSearchByElementDto))
        .mockResolvedValue([]);

      const result = await service.similaritySearch(
        mockBrowserClientMetadata,
        mockSearchByElementDto,
      );

      expect(result.elements).toEqual([]);
    });

    it('should defensively truncate replies whose length is not a multiple of 3', async () => {
      when(client.sendCommand)
        .calledWith(buildVsimByElementCommand(mockSearchByElementDto))
        .mockResolvedValue([
          ...SEARCH_VSIM_REPLY_TWO_MATCHES,
          Buffer.from('orphan'),
        ]);

      const result = await service.similaritySearch(
        mockBrowserClientMetadata,
        mockSearchByElementDto,
      );

      expect(result.elements).toHaveLength(2);
    });

    it('should throw BadRequestException when no query payload is supplied', async () => {
      const dto = {
        ...mockSearchByElementDto,
        elementName: undefined,
        vectorValues: undefined,
        vectorFp32: undefined,
      };

      await expect(
        service.similaritySearch(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when more than one query payload is supplied', async () => {
      const dto = { ...mockSearchByElementDto, vectorValues: [1, 2, 3] };

      await expect(
        service.similaritySearch(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when key does not exist', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockSearchByElementDto.keyName,
        ])
        .mockResolvedValue(false);

      await expect(
        service.similaritySearch(
          mockBrowserClientMetadata,
          mockSearchByElementDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for wrong type error', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'VSIM',
      };
      when(client.sendCommand)
        .calledWith(buildVsimByElementCommand(mockSearchByElementDto))
        .mockRejectedValue(replyError);

      await expect(
        service.similaritySearch(
          mockBrowserClientMetadata,
          mockSearchByElementDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when user has no permissions', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'VSIM',
      };
      when(client.sendCommand)
        .calledWith(buildVsimByElementCommand(mockSearchByElementDto))
        .mockRejectedValue(replyError);

      await expect(
        service.similaritySearch(
          mockBrowserClientMetadata,
          mockSearchByElementDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    describe('Redis 8.0.0–8.0.2 (WITHATTRIBS unsupported) fallback', () => {
      beforeEach(() => {
        client.isFeatureSupported = jest.fn().mockResolvedValue(false);
      });

      it('should check the VsimWithAttribs feature before issuing VSIM', async () => {
        const expectedCommand = buildVsimByElementCommand(
          mockSearchByElementDto,
          { withAttribs: false },
        );
        when(client.sendCommand)
          .calledWith(expectedCommand)
          .mockResolvedValue([]);

        await service.similaritySearch(
          mockBrowserClientMetadata,
          mockSearchByElementDto,
        );

        expect(client.isFeatureSupported).toHaveBeenCalledWith(
          RedisFeature.VsimWithAttribs,
        );
      });

      it('should omit WITHATTRIBS from the VSIM command and back-fill attributes via VGETATTR pipeline', async () => {
        const expectedCommand = buildVsimByElementCommand(
          mockSearchByElementDto,
          { withAttribs: false },
        );
        // Stride-2 reply (no attributes inline)
        when(client.sendCommand)
          .calledWith(expectedCommand)
          .mockResolvedValue([
            SEARCH_VSIM_MATCH_NAME_1,
            '0.95',
            SEARCH_VSIM_MATCH_NAME_2,
            '0.81',
          ]);

        client.sendPipeline.mockResolvedValue([
          [null, SEARCH_VSIM_MATCH_ATTRIBUTES_1],
          [null, null],
        ]);

        const result = await service.similaritySearch(
          mockBrowserClientMetadata,
          mockSearchByElementDto,
        );

        expect(client.sendCommand).toHaveBeenCalledWith(expectedCommand);
        expect(client.sendPipeline).toHaveBeenCalledWith([
          [
            BrowserToolVectorSetCommands.VGetAttr,
            mockSearchByElementDto.keyName,
            SEARCH_VSIM_MATCH_NAME_1,
          ],
          [
            BrowserToolVectorSetCommands.VGetAttr,
            mockSearchByElementDto.keyName,
            SEARCH_VSIM_MATCH_NAME_2,
          ],
        ]);
        expect(result.elements).toEqual([
          {
            name: SEARCH_VSIM_MATCH_NAME_1,
            score: 0.95,
            attributes: SEARCH_VSIM_MATCH_ATTRIBUTES_1,
          },
          { name: SEARCH_VSIM_MATCH_NAME_2, score: 0.81 },
        ]);
        expect('attributes' in result.elements[1]).toBe(false);
      });

      it('should not issue any VGETATTR pipeline when VSIM returns no matches', async () => {
        const expectedCommand = buildVsimByElementCommand(
          mockSearchByElementDto,
          { withAttribs: false },
        );
        when(client.sendCommand)
          .calledWith(expectedCommand)
          .mockResolvedValue([]);

        const result = await service.similaritySearch(
          mockBrowserClientMetadata,
          mockSearchByElementDto,
        );

        expect(client.sendPipeline).not.toHaveBeenCalled();
        expect(result.elements).toEqual([]);
      });

      it('should swallow per-element VGETATTR errors and leave attributes undefined for that match', async () => {
        const expectedCommand = buildVsimByElementCommand(
          mockSearchByElementDto,
          { withAttribs: false },
        );
        when(client.sendCommand)
          .calledWith(expectedCommand)
          .mockResolvedValue([
            SEARCH_VSIM_MATCH_NAME_1,
            '0.95',
            SEARCH_VSIM_MATCH_NAME_2,
            '0.81',
          ]);

        const replyError: ReplyError = {
          ...mockRedisNoPermError,
          command: 'VGETATTR',
        };
        client.sendPipeline.mockResolvedValue([
          [null, SEARCH_VSIM_MATCH_ATTRIBUTES_1],
          [replyError, null],
        ]);

        const result = await service.similaritySearch(
          mockBrowserClientMetadata,
          mockSearchByElementDto,
        );

        expect(result.elements[0].attributes).toEqual(
          SEARCH_VSIM_MATCH_ATTRIBUTES_1,
        );
        expect(result.elements[1].attributes).toBeUndefined();
      });
    });
  });

  describe('getSimilaritySearchPreview', () => {
    beforeEach(() => {
      // Default to "WITHATTRIBS supported" so the canonical preview shape is
      // exercised; the dedicated fallback test below overrides this.
      client.isFeatureSupported = jest.fn().mockResolvedValue(true);
    });

    it('should render VSIM preview with ELE clause and quote element when needed', async () => {
      const dto = {
        keyName: Buffer.from('mykey'),
        elementName: Buffer.from('hello world'),
        count: 10,
      };

      const { preview } = await service.getSimilaritySearchPreview(
        mockBrowserClientMetadata,
        dto,
      );

      expect(preview).toBe(
        'VSIM mykey ELE "hello world" COUNT 10 WITHSCORES WITHATTRIBS',
      );
    });

    it('should render VSIM preview with VALUES clause for numeric vector input', async () => {
      const { preview } = await service.getSimilaritySearchPreview(
        mockBrowserClientMetadata,
        {
          keyName: Buffer.from('mykey'),
          vectorValues: [1, 2, 3],
          count: 5,
        },
      );

      expect(preview).toBe(
        'VSIM mykey VALUES 3 1 2 3 COUNT 5 WITHSCORES WITHATTRIBS',
      );
    });

    it('should render FP32 vector as a quoted `\\xHH...` escape string', async () => {
      const { preview } = await service.getSimilaritySearchPreview(
        mockBrowserClientMetadata,
        {
          keyName: Buffer.from('mykey'),
          vectorFp32: FP32_VECTOR_FIXTURE_1_2_3.base64,
          count: 10,
        },
      );

      const expectedEscape = Array.from(FP32_VECTOR_FIXTURE_1_2_3.buffer)
        .map((byte) => `\\x${byte.toString(16).padStart(2, '0')}`)
        .join('');
      expect(preview).toBe(
        `VSIM mykey FP32 "${expectedEscape}" COUNT 10 WITHSCORES WITHATTRIBS`,
      );
    });

    it('should throw BadRequestException when no query payload is supplied', async () => {
      await expect(
        service.getSimilaritySearchPreview(mockBrowserClientMetadata, {
          keyName: Buffer.from('mykey'),
          count: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException even when only `keyName` and `filter` are supplied', async () => {
      await expect(
        service.getSimilaritySearchPreview(mockBrowserClientMetadata, {
          keyName: Buffer.from('mykey'),
          filter: '.year > 2020',
          count: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should append FILTER clause after WITHSCORES/WITHATTRIBS', async () => {
      const { preview } = await service.getSimilaritySearchPreview(
        mockBrowserClientMetadata,
        {
          keyName: Buffer.from('mykey'),
          vectorValues: [1, 2, 3],
          count: 10,
          filter: '.year > 2020',
        },
      );

      expect(preview).toBe(
        'VSIM mykey VALUES 3 1 2 3 COUNT 10 WITHSCORES WITHATTRIBS FILTER ".year > 2020"',
      );
    });

    it('should omit COUNT clause when count is undefined', async () => {
      const { preview } = await service.getSimilaritySearchPreview(
        mockBrowserClientMetadata,
        {
          keyName: Buffer.from('mykey'),
          vectorValues: [1, 2],
        },
      );

      expect(preview).toBe('VSIM mykey VALUES 2 1 2 WITHSCORES WITHATTRIBS');
    });

    it('should throw BadRequestException when more than one query payload is supplied', async () => {
      await expect(
        service.getSimilaritySearchPreview(mockBrowserClientMetadata, {
          keyName: Buffer.from('mykey'),
          elementName: Buffer.from('foo'),
          vectorValues: [1, 2, 3],
          count: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should omit WITHATTRIBS in the preview on Redis 8.0.0–8.0.2 (WITHATTRIBS unsupported)', async () => {
      client.isFeatureSupported = jest.fn().mockResolvedValue(false);

      const { preview } = await service.getSimilaritySearchPreview(
        mockBrowserClientMetadata,
        {
          keyName: Buffer.from('mykey'),
          elementName: Buffer.from('seed'),
          count: 5,
        },
      );

      expect(client.isFeatureSupported).toHaveBeenCalledWith(
        RedisFeature.VsimWithAttribs,
      );
      expect(preview).toBe('VSIM mykey ELE seed COUNT 5 WITHSCORES');
    });
  });
});
