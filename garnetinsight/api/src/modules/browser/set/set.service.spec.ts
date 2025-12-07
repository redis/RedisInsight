import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { when } from 'jest-when';
import {
  mockRedisNoPermError,
  mockRedisWrongTypeError,
  mockBrowserClientMetadata,
  mockDatabaseClientFactory,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { ReplyError } from 'src/models';
import {
  BrowserToolKeysCommands,
  BrowserToolSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  mockAddMembersToSetDto,
  mockDeleteMembersDto,
  mockGetSetMembersDto,
  mockGetSetMembersResponse,
  mockSetMembers,
} from 'src/modules/browser/__mocks__';
import { SetService } from 'src/modules/browser/set/set.service';
import {
  CreateSetWithExpireDto,
  GetSetMembersDto,
} from 'src/modules/browser/set/dto';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';

describe('SetService', () => {
  const client = mockStandaloneRedisClient;
  let service: SetService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
      ],
    }).compile();

    service = module.get<SetService>(SetService);
    client.sendCommand = jest.fn().mockResolvedValue(undefined);
  });

  describe('createSet', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAddMembersToSetDto.keyName,
        ])
        .mockResolvedValue(false);
      service.createSetWithExpiration = jest.fn();
    });
    it('create set with expiration', async () => {
      service.createSetWithExpiration = jest.fn().mockResolvedValue(undefined);

      await expect(
        service.createSet(mockBrowserClientMetadata, {
          ...mockAddMembersToSetDto,
          expire: 1000,
        }),
      ).resolves.not.toThrow();
      expect(service.createSetWithExpiration).toHaveBeenCalled();
    });
    it('create set without expiration', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolSetCommands.SAdd,
          mockAddMembersToSetDto.keyName,
          ...mockAddMembersToSetDto.members,
        ])
        .mockResolvedValue(1);

      await expect(
        service.createSet(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).resolves.not.toThrow();
      expect(service.createSetWithExpiration).not.toHaveBeenCalled();
    });
    it('key with this name exist', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAddMembersToSetDto.keyName,
        ])
        .mockResolvedValue(true);

      await expect(
        service.createSet(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).rejects.toThrow(ConflictException);
      expect(client.sendCommand).toHaveBeenCalledTimes(1);
      expect(client.sendPipeline).not.toHaveBeenCalled();
    });
    it("try to use 'SADD' command not for set data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'SADD',
      };
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolSetCommands.SAdd,
            expect.anything(),
          ]),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.createSet(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for createSet", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SADD',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.createSet(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createSetWithExpiration', () => {
    const dto: CreateSetWithExpireDto = {
      ...mockAddMembersToSetDto,
      expire: 1000,
    };
    it('succeed to create Set data type with expiration', async () => {
      when(client.sendPipeline)
        .calledWith([
          [BrowserToolSetCommands.SAdd, dto.keyName, ...dto.members],
          [BrowserToolKeysCommands.Expire, dto.keyName, dto.expire],
        ])
        .mockResolvedValue([
          [null, mockAddMembersToSetDto.members.length],
          [null, 1],
        ]);

      const result = await service.createSetWithExpiration(client, dto);
      expect(result).toBe(mockAddMembersToSetDto.members.length);
    });
    it('throw transaction error', async () => {
      const transactionError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'SADD',
      };
      client.sendPipeline.mockResolvedValue([[transactionError, null]]);

      await expect(
        service.createSetWithExpiration(client, dto),
      ).rejects.toEqual(transactionError);
    });
  });

  describe('getMembers', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolSetCommands.SCard,
          mockGetSetMembersDto.keyName,
        ])
        .mockResolvedValue(mockSetMembers.length);
    });
    it('succeed to get members of the set', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolSetCommands.SScan,
            expect.anything(),
          ]),
        )
        .mockResolvedValue([Buffer.from('0'), mockSetMembers]);

      const result = await service.getMembers(
        mockBrowserClientMetadata,
        mockGetSetMembersDto,
      );

      expect(result).toEqual(mockGetSetMembersResponse);
      expect(client.sendCommand).toHaveBeenCalledWith(
        expect.arrayContaining([
          BrowserToolSetCommands.SScan,
          expect.anything(),
        ]),
      );
    });
    it('succeed to find exact member in the set', async () => {
      const dto: GetSetMembersDto = {
        ...mockGetSetMembersDto,
        match: mockSetMembers[0].toString(),
      };
      when(client.sendCommand)
        .calledWith([BrowserToolSetCommands.SIsMember, dto.keyName, dto.match])
        .mockResolvedValue(1);

      const result = await service.getMembers(mockBrowserClientMetadata, dto);

      expect(result).toEqual(mockGetSetMembersResponse);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolSetCommands.SScan,
        expect.anything(),
      ]);
    });
    it('failed to find exact member in the set', async () => {
      const dto: GetSetMembersDto = {
        ...mockGetSetMembersDto,
        match: mockSetMembers[0].toString(),
      };
      when(client.sendCommand)
        .calledWith([BrowserToolSetCommands.SIsMember, dto.keyName, dto.match])
        .mockResolvedValue(0);

      const result = await service.getMembers(mockBrowserClientMetadata, dto);

      expect(result).toEqual({ ...mockGetSetMembersResponse, members: [] });
    });
    it('should not call scan when math contains escaped glob', async () => {
      const dto: GetSetMembersDto = {
        ...mockGetSetMembersDto,
        match: 'm\\[a-e\\]mber',
      };
      when(client.sendCommand)
        .calledWith([
          BrowserToolSetCommands.SIsMember,
          dto.keyName,
          'm[a-e]mber',
        ])
        .mockResolvedValue(1);

      const result = await service.getMembers(mockBrowserClientMetadata, dto);

      expect(result).toEqual({
        ...mockGetSetMembersResponse,
        members: [Buffer.from('m[a-e]mber')],
      });
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolSetCommands.SScan,
        expect.anything(),
      ]);
    });
    // TODO: uncomment after enabling threshold for set scan
    // it('should stop set full scan', async () => {
    //   const dto: GetSetMembersDto = {
    //     ...mockGetMembersDto,
    //     count: REDIS_SCAN_CONFIG.countDefault,
    //     match: '*un-exist-member*',
    //   };
    //   const maxScanCalls = Math.round(
    //     REDIS_SCAN_CONFIG.countThreshold / REDIS_SCAN_CONFIG.countDefault,
    //   );
    //   when(browserTool.execCommand)
    //     .calledWith(
    //       mockBrowserClientMetadata,
    //       BrowserToolSetCommands.SScan,
    //       expect.anything(),
    //     )
    //     .mockResolvedValue(['200', []]);
    //
    //   await service.getMembers(mockBrowserClientMetadata, dto);
    //
    //   expect(browserTool.execCommand).toHaveBeenCalledTimes(maxScanCalls + 1);
    // });
    it('key with this name does not exist for getMembers', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolSetCommands.SCard,
          mockGetSetMembersDto.keyName,
        ])
        .mockResolvedValue(0);

      await expect(
        service.getMembers(mockBrowserClientMetadata, mockGetSetMembersDto),
      ).rejects.toThrow(NotFoundException);
    });
    it("try to use 'SCARD' command not for list data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'SCARD',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getMembers(mockBrowserClientMetadata, mockGetSetMembersDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for getMembers", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SCARD',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getMembers(mockBrowserClientMetadata, mockGetSetMembersDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addMembers', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAddMembersToSetDto.keyName,
        ])
        .mockResolvedValue(true);
    });
    it('succeed to add members to the Set data type', async () => {
      const { keyName, members } = mockAddMembersToSetDto;
      when(client.sendCommand)
        .calledWith([BrowserToolSetCommands.SAdd, keyName, ...members])
        .mockResolvedValue(1);

      await expect(
        service.addMembers(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).resolves.not.toThrow();
    });
    it('key with this name does not exist for addMembers', async () => {
      const { keyName, members } = mockAddMembersToSetDto;
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAddMembersToSetDto.keyName,
        ])
        .mockResolvedValue(false);

      await expect(
        service.addMembers(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).rejects.toThrow(NotFoundException);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolSetCommands.SAdd,
        keyName,
        ...members,
      ]);
    });
    it("try to use 'SADD' command not for set data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'SADD',
      };
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolSetCommands.SAdd,
            expect.anything(),
          ]),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.addMembers(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for addMembers", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SADD',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.addMembers(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteMembers', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockDeleteMembersDto.keyName,
        ])
        .mockResolvedValue(true);
    });
    it('succeeded to delete members from Set data type', async () => {
      const { members, keyName } = mockDeleteMembersDto;
      when(client.sendCommand)
        .calledWith([BrowserToolSetCommands.SRem, keyName, ...members])
        .mockResolvedValue(members.length);

      const result = await service.deleteMembers(
        mockBrowserClientMetadata,
        mockDeleteMembersDto,
      );

      expect(result).toEqual({ affected: members.length });
    });
    it('key with this name does not exist for deleteMembers', async () => {
      const { members, keyName } = mockDeleteMembersDto;
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValue(false);

      await expect(
        service.deleteMembers(mockBrowserClientMetadata, mockDeleteMembersDto),
      ).rejects.toThrow(NotFoundException);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolSetCommands.SRem,
        keyName,
        ...members,
      ]);
    });
    it("try to use 'SREM' command not for set data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'SREM',
      };
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolSetCommands.SRem,
            expect.anything(),
          ]),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.deleteMembers(mockBrowserClientMetadata, mockDeleteMembersDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for deleteMembers", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SREM',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.deleteMembers(mockBrowserClientMetadata, mockDeleteMembersDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
