import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { when } from 'jest-when';
import { ReplyError } from 'src/models/redis-client';
import { mockBrowserClientMetadata, mockRedisNoPermError } from 'src/__mocks__';
import { mockKeyDto } from 'src/modules/browser/__mocks__';
import {
  BrowserToolArrayCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  ArrayCreationMode,
  CreateArrayWithExpireDto,
} from 'src/modules/browser/array/dto';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { mockDatabaseClientFactory } from 'src/__mocks__/databases-client';
import { mockStandaloneRedisClient } from 'src/__mocks__/redis-client';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { ArrayService } from 'src/modules/browser/array/array.service';

const mockArrayValue = Buffer.from('Lorem ipsum dolor sit amet.');
const mockArrayValue2 = Buffer.from('Lorem ipsum dolor sit amet2.');

const mockCreateContiguousArrayDto: CreateArrayWithExpireDto = {
  keyName: mockKeyDto.keyName,
  mode: ArrayCreationMode.Contiguous,
  startIndex: '0',
  values: [mockArrayValue, mockArrayValue2],
};

const mockCreateSparseArrayDto: CreateArrayWithExpireDto = {
  keyName: mockKeyDto.keyName,
  mode: ArrayCreationMode.Sparse,
  elements: [
    { index: '5', value: mockArrayValue },
    { index: '17', value: mockArrayValue2 },
  ],
};

describe('ArrayService', () => {
  let service: ArrayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArrayService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
      ],
    }).compile();

    service = module.get(ArrayService);
    mockStandaloneRedisClient.sendCommand = jest
      .fn()
      .mockResolvedValue(undefined);
    mockStandaloneRedisClient.sendPipeline = jest
      .fn()
      .mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createArray', () => {
    beforeEach(() => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockKeyDto.keyName])
        .mockResolvedValue(false);
    });

    it('create contiguous array without expiration', async () => {
      await expect(
        service.createArray(
          mockBrowserClientMetadata,
          mockCreateContiguousArrayDto,
        ),
      ).resolves.not.toThrow();
      expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledWith([
        BrowserToolArrayCommands.ArSet,
        mockKeyDto.keyName,
        '0',
        mockArrayValue,
        mockArrayValue2,
      ]);
      expect(mockStandaloneRedisClient.sendPipeline).not.toHaveBeenCalled();
    });

    it('create sparse array without expiration', async () => {
      await expect(
        service.createArray(
          mockBrowserClientMetadata,
          mockCreateSparseArrayDto,
        ),
      ).resolves.not.toThrow();
      expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledWith([
        BrowserToolArrayCommands.ArMSet,
        mockKeyDto.keyName,
        '5',
        mockArrayValue,
        '17',
        mockArrayValue2,
      ]);
      expect(mockStandaloneRedisClient.sendPipeline).not.toHaveBeenCalled();
    });

    it('create contiguous array with expiration', async () => {
      const dto: CreateArrayWithExpireDto = {
        keyName: mockKeyDto.keyName,
        mode: ArrayCreationMode.Contiguous,
        startIndex: '0',
        values: [mockArrayValue],
        expire: 1000,
      };
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolArrayCommands.ArSet, dto.keyName, '0', mockArrayValue],
          [BrowserToolKeysCommands.Expire, dto.keyName, dto.expire],
        ])
        .mockResolvedValue([
          [null, 'OK'],
          [null, 1],
        ]);

      await expect(
        service.createArray(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
      expect(mockStandaloneRedisClient.sendPipeline).toHaveBeenCalledWith([
        [BrowserToolArrayCommands.ArSet, dto.keyName, '0', mockArrayValue],
        [BrowserToolKeysCommands.Expire, dto.keyName, dto.expire],
      ]);
    });

    it('key with this name exist', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockKeyDto.keyName])
        .mockResolvedValue(true);

      await expect(
        service.createArray(
          mockBrowserClientMetadata,
          mockCreateContiguousArrayDto,
        ),
      ).rejects.toThrow(new ConflictException(ERROR_MESSAGES.KEY_NAME_EXIST));
      expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledTimes(1);
      expect(mockStandaloneRedisClient.sendPipeline).not.toHaveBeenCalled();
    });

    it("user don't have required permissions for createArray", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ARSET',
      };
      mockStandaloneRedisClient.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.createArray(
          mockBrowserClientMetadata,
          mockCreateContiguousArrayDto,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledTimes(1);
      expect(mockStandaloneRedisClient.sendPipeline).not.toHaveBeenCalled();
    });
  });
});
