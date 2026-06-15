import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { when } from 'jest-when';
import { ReplyError } from 'src/models/redis-client';
import { mockBrowserClientMetadata, mockRedisNoPermError } from 'src/__mocks__';
import {
  BrowserToolArrayCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  createContiguousArrayDtoFactory,
  createSparseArrayDtoFactory,
} from 'src/modules/browser/array/__tests__/array.factory';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { mockDatabaseClientFactory } from 'src/__mocks__/databases-client';
import { mockStandaloneRedisClient } from 'src/__mocks__/redis-client';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { ArrayService } from 'src/modules/browser/array/array.service';

describe('ArrayService', () => {
  const client = mockStandaloneRedisClient;
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
    client.sendCommand = jest.fn().mockResolvedValue(undefined);
    client.sendPipeline = jest.fn().mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createArray', () => {
    it('create contiguous array without expiration', async () => {
      const dto = createContiguousArrayDtoFactory.build();
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, dto.keyName])
        .mockResolvedValue(false);

      await expect(
        service.createArray(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolArrayCommands.ArSet,
        dto.keyName,
        dto.startIndex,
        ...(dto.values ?? []),
      ]);
      expect(client.sendPipeline).not.toHaveBeenCalled();
    });

    it('create sparse array without expiration', async () => {
      const dto = createSparseArrayDtoFactory.build();
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, dto.keyName])
        .mockResolvedValue(false);

      await expect(
        service.createArray(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolArrayCommands.ArMSet,
        dto.keyName,
        ...(dto.elements ?? []).flatMap(({ index, value }) => [index, value]),
      ]);
      expect(client.sendPipeline).not.toHaveBeenCalled();
    });

    it('create contiguous array with expiration', async () => {
      const dto = createContiguousArrayDtoFactory.build({ expire: 1000 });
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, dto.keyName])
        .mockResolvedValue(false);
      when(client.sendPipeline)
        .calledWith([
          [
            BrowserToolArrayCommands.ArSet,
            dto.keyName,
            dto.startIndex,
            ...(dto.values ?? []),
          ],
          [BrowserToolKeysCommands.Expire, dto.keyName, dto.expire],
        ])
        .mockResolvedValue([
          [null, 'OK'],
          [null, 1],
        ]);

      await expect(
        service.createArray(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
      expect(client.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolArrayCommands.ArSet,
          dto.keyName,
          dto.startIndex,
          ...(dto.values ?? []),
        ],
        [BrowserToolKeysCommands.Expire, dto.keyName, dto.expire],
      ]);
    });

    it('key with this name exist', async () => {
      const dto = createContiguousArrayDtoFactory.build();
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, dto.keyName])
        .mockResolvedValue(true);

      await expect(
        service.createArray(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(new ConflictException(ERROR_MESSAGES.KEY_NAME_EXIST));
      expect(client.sendCommand).toHaveBeenCalledTimes(1);
      expect(client.sendPipeline).not.toHaveBeenCalled();
    });

    it("user don't have required permissions for createArray", async () => {
      const dto = createContiguousArrayDtoFactory.build();
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ARSET',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.createArray(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(ForbiddenException);
      expect(client.sendCommand).toHaveBeenCalledTimes(1);
      expect(client.sendPipeline).not.toHaveBeenCalled();
    });
  });
});
