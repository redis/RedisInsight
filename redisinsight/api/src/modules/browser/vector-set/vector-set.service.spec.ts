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
  deleteVectorSetElementsDtoFactory,
  getVectorSetElementsDtoFactory,
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
      const pipelineResults = mockElements.flatMap((el) => [
        [null, el.vector.map(String)],
        [null, el.attributes ?? null],
      ]);
      client.sendPipeline.mockResolvedValue(pipelineResults);

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
      expect(result.elements[0].vector).toEqual(mockElements[0].vector);
      expect(result.elements[0].attributes).toEqual(mockElements[0].attributes);
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

      const pipelineResults = mockElements.flatMap((el) => [
        [null, el.vector.map(String)],
        [null, null],
      ]);
      client.sendPipeline.mockResolvedValue(pipelineResults);

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

      const pipelineResults = mockElements.flatMap((el) => [
        [null, el.vector.map(String)],
        [null, el.attributes ?? null],
      ]);
      client.sendPipeline.mockResolvedValue(pipelineResults);

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

  describe('setElementAttribute', () => {
    const mockSetAttrDto = setVectorSetElementAttributeDtoFactory.build();

    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockSetAttrDto.keyName])
        .mockResolvedValue(true);
    });

    it('should set element attribute successfully', async () => {
      client.sendCommand.mockResolvedValue(1);

      await service.setElementAttribute(
        mockBrowserClientMetadata,
        mockSetAttrDto,
      );

      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolVectorSetCommands.VSetAttr,
        mockSetAttrDto.keyName,
        mockSetAttrDto.element,
        mockSetAttrDto.attributes,
      ]);
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
});
