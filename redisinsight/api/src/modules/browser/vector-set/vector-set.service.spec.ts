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
  createVectorSetDtoFactory,
  deleteVectorSetElementsDtoFactory,
  downloadVectorSetEmbeddingDtoFactory,
  getVectorSetElementsDtoFactory,
  getVectorSetElementDetailsDtoFactory,
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
            el.vector.length,
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
          mockElement.vector.length,
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
      expect(result.elements).toHaveLength(mockElements.length);
      expect(result.elements[0].name).toEqual(mockElements[0].name);
      expect(result.elements[0].vector).toBeUndefined();
      expect(result.elements[0].attributes).toBeUndefined();
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
      expect(result.elements).toHaveLength(mockElements.length);
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
});
