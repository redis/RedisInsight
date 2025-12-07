import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { when } from 'jest-when';
import { ReplyError } from 'src/models/redis-client';
import {
  mockBrowserClientMetadata,
  mockDatabaseClientFactory,
  mockDatabaseRecommendationService,
  mockRedisNoPermError,
  mockRedisWrongTypeError,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import {
  SetStringDto,
  SetStringWithExpireDto,
} from 'src/modules/browser/string/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolStringCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { KeytarUnavailableException } from 'src/modules/encryption/exceptions';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { StringService } from 'src/modules/browser/string/string.service';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';

const mockSetStringDto: SetStringDto = {
  keyName: Buffer.from('foo'),
  value: Buffer.from('Lorem ipsum dolor sit amet.'),
};

describe('StringService', () => {
  const client = mockStandaloneRedisClient;
  let service: StringService;
  let recommendationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StringService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
        {
          provide: DatabaseRecommendationService,
          useFactory: mockDatabaseRecommendationService,
        },
      ],
    }).compile();

    service = module.get<StringService>(StringService);
    recommendationService = module.get<DatabaseRecommendationService>(
      DatabaseRecommendationService,
    );
    client.sendCommand = jest.fn().mockResolvedValue(undefined);
  });

  describe('setString', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockSetStringDto.keyName])
        .mockResolvedValue(false);
    });
    it('set string with expiration', async () => {
      const dto: SetStringWithExpireDto = { ...mockSetStringDto, expire: 1000 };
      const { keyName, value, expire } = dto;
      const args = [keyName, value, 'EX', `${expire}`, 'NX'];
      when(client.sendCommand)
        .calledWith([BrowserToolStringCommands.Set, ...args])
        .mockResolvedValue(1);

      await expect(
        service.setString(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolStringCommands.Set,
        ...args,
      ]);
    });
    it('set string without expiration', async () => {
      const { keyName, value } = mockSetStringDto;
      const args = [keyName, value, 'NX'];
      when(client.sendCommand)
        .calledWith([BrowserToolStringCommands.Set, ...args])
        .mockResolvedValue(1);

      await expect(
        service.setString(mockBrowserClientMetadata, mockSetStringDto),
      ).resolves.not.toThrow();
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolStringCommands.Set,
        ...args,
      ]);
    });
    it('key with this name exist', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockSetStringDto.keyName])
        .mockResolvedValue(true);

      await expect(
        service.setString(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(ConflictException);
    });
    it("user don't have required permissions for setString", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SET',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.setString(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(ForbiddenException);
    });
    it('Should proxy EncryptionService errors', async () => {
      client.sendCommand.mockRejectedValueOnce(
        new KeytarUnavailableException(),
      );

      await expect(
        service.setString(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(KeytarUnavailableException);
    });
  });

  describe('getStringValue', () => {
    it('succeed to get string value', async () => {
      client.sendCommand.mockResolvedValue(mockSetStringDto.value);

      const result = await service.getStringValue(
        mockBrowserClientMetadata,
        mockSetStringDto,
      );

      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolStringCommands.Get,
        mockSetStringDto.keyName,
      ]);
      expect(result).toEqual({
        value: mockSetStringDto.value,
        keyName: mockSetStringDto.keyName,
      });
    });
    it("try to use 'GET' command not for string data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'GET',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getStringValue(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(BadRequestException);
    });
    it('key not found', async () => {
      client.sendCommand.mockResolvedValue(null);

      await expect(
        service.getStringValue(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(NotFoundException);
    });
    it("user don't have required permissions for getStringValue", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'GET',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getStringValue(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(ForbiddenException);
    });
    it('should call recommendationService', async () => {
      client.sendCommand.mockResolvedValue(mockSetStringDto.value);

      const result = await service.getStringValue(
        mockBrowserClientMetadata,
        mockSetStringDto,
      );

      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolStringCommands.Get,
        mockSetStringDto.keyName,
      ]);
      expect(result).toEqual({
        value: mockSetStringDto.value,
        keyName: mockSetStringDto.keyName,
      });
      expect(recommendationService.check).toBeCalledWith(
        mockBrowserClientMetadata,
        RECOMMENDATION_NAMES.STRING_TO_JSON,
        { value: result.value, keyName: mockSetStringDto.keyName },
      );

      expect(recommendationService.check).toBeCalledTimes(1);
    });
  });

  describe('updateStringValue', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockSetStringDto.keyName])
        .mockResolvedValue(true);
    });
    it('succeed to update string without expiration', async () => {
      const dto: SetStringDto = mockSetStringDto;
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Ttl, dto.keyName])
        .mockResolvedValue(-1);

      when(client.sendCommand)
        .calledWith([
          BrowserToolStringCommands.Set,
          dto.keyName,
          dto.value,
          'XX',
        ])
        .mockResolvedValue('OK');

      await expect(
        service.updateStringValue(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
      expect(client.sendCommand).toHaveBeenLastCalledWith([
        BrowserToolStringCommands.Set,
        dto.keyName,
        dto.value,
        'XX',
      ]);
    });
    it('succeed to update string with expiration', async () => {
      const dto: SetStringDto = mockSetStringDto;
      const currentTtl = 1000;
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Ttl, dto.keyName])
        .mockResolvedValue(currentTtl);
      when(client.sendCommand)
        .calledWith([
          BrowserToolStringCommands.Set,
          dto.keyName,
          dto.value,
          'XX',
        ])
        .mockResolvedValue('OK');

      await expect(
        service.updateStringValue(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolStringCommands.Set,
        dto.keyName,
        dto.value,
        'XX',
      ]);
      expect(client.sendCommand).toHaveBeenLastCalledWith([
        BrowserToolKeysCommands.Expire,
        dto.keyName,
        currentTtl,
      ]);
    });
    it('key with this name does not exist', async () => {
      client.sendCommand.mockResolvedValue(null);

      await expect(
        service.updateStringValue(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(NotFoundException);
    });
    it("user don't have required permissions for updateStringValue", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SET',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.updateStringValue(mockBrowserClientMetadata, mockSetStringDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
