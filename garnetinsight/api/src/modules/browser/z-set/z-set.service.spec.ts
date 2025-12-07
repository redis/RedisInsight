import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { SortOrder } from 'src/constants/sort';
import { ReplyError } from 'src/models';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import {
  mockBrowserClientMetadata,
  mockRedisNoPermError,
  mockRedisWrongTypeError,
  mockDatabaseRecommendationService,
  mockDatabaseClientFactory,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import {
  BrowserToolKeysCommands,
  BrowserToolZSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  getZSetMembersInAscResponse,
  getZSetMembersInDescResponse,
  mockAddMembersDto,
  mockDeleteMembersDto,
  mockGetMembersDto,
  mockMembersForZAddCommand,
  mockSearchMembersDto,
  mockSearchZSetMembersResponse,
  mockUpdateMemberDto,
} from 'src/modules/browser/__mocks__';
import {
  CreateZSetWithExpireDto,
  SearchZSetMembersDto,
} from 'src/modules/browser/z-set/dto';
import { ZSetService } from 'src/modules/browser/z-set/z-set.service';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';

describe('ZSetService', () => {
  const client = mockStandaloneRedisClient;
  let service: ZSetService;
  let recommendationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZSetService,
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

    service = module.get<ZSetService>(ZSetService);
    recommendationService = module.get<DatabaseRecommendationService>(
      DatabaseRecommendationService,
    );
    client.sendCommand = jest.fn().mockResolvedValue(undefined);
  });

  describe('createZSet', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockAddMembersDto.keyName])
        .mockResolvedValue(0);
      service.createZSetWithExpiration = jest.fn();
    });
    it('create zset with expiration', async () => {
      service.createZSetWithExpiration = jest
        .fn()
        .mockResolvedValue(mockAddMembersDto.members.length);

      await expect(
        service.createZSet(mockBrowserClientMetadata, {
          ...mockAddMembersDto,
          expire: 1000,
        }),
      ).resolves.not.toThrow();
      expect(service.createZSetWithExpiration).toHaveBeenCalled();
    });
    it('create zset without expiration', async () => {
      const { keyName } = mockAddMembersDto;
      when(client.sendCommand)
        .calledWith([
          BrowserToolZSetCommands.ZAdd,
          keyName,
          ...mockMembersForZAddCommand,
        ])
        .mockResolvedValue(mockAddMembersDto.members.length);

      await expect(
        service.createZSet(mockBrowserClientMetadata, mockAddMembersDto),
      ).resolves.not.toThrow();
      expect(service.createZSetWithExpiration).not.toHaveBeenCalled();
    });
    it('key with this name exist', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockAddMembersDto.keyName])
        .mockResolvedValue(1);

      await expect(
        service.createZSet(mockBrowserClientMetadata, mockAddMembersDto),
      ).rejects.toThrow(ConflictException);
      expect(client.sendCommand).toHaveBeenCalledTimes(1);
      expect(client.sendPipeline).not.toHaveBeenCalled();
    });
    it("try to use 'ZADD' command not for zset data type for createZSet", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ZADD',
      };
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolZSetCommands.ZAdd,
            expect.anything(),
          ]),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.createZSet(mockBrowserClientMetadata, mockAddMembersDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for createZSet", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ZADD',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.createZSet(mockBrowserClientMetadata, mockAddMembersDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createZSetWithExpiration', () => {
    const dto: CreateZSetWithExpireDto = {
      ...mockAddMembersDto,
      expire: 1000,
    };
    it('succeed to create ZSet data type with expiration', async () => {
      when(client.sendPipeline)
        .calledWith(expect.arrayContaining([expect.anything()]))
        .mockResolvedValue([
          [null, mockAddMembersDto.members.length],
          [null, 1],
        ]);

      const result = await service.createZSetWithExpiration(client, dto);
      expect(result).toBe(mockAddMembersDto.members.length);
    });
    it('throw transaction error', async () => {
      const transactionError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ZADD',
      };
      client.sendPipeline.mockResolvedValue([[transactionError, null]]);

      await expect(
        service.createZSetWithExpiration(client, dto),
      ).rejects.toEqual(transactionError);
    });
  });

  describe('getMembers', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolZSetCommands.ZCard, mockGetMembersDto.keyName])
        .mockResolvedValue(mockAddMembersDto.members.length);
    });
    it('get members sorted in asc', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolZSetCommands.ZRange,
            expect.anything(),
          ]),
        )
        .mockResolvedValue([
          'member1',
          '-inf',
          'member2',
          '0',
          'member3',
          '2',
          'member4',
          'inf',
        ]);

      const result = await service.getMembers(
        mockBrowserClientMetadata,
        mockGetMembersDto,
      );
      await expect(result).toEqual(getZSetMembersInAscResponse);
    });
    it('get members sorted in desc', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolZSetCommands.ZRevRange,
            expect.anything(),
          ]),
        )
        .mockResolvedValue([
          'member4',
          'inf',
          'member3',
          '2',
          'member2',
          '0',
          'member1',
          '-inf',
        ]);

      const result = await service.getMembers(mockBrowserClientMetadata, {
        ...mockGetMembersDto,
        sortOrder: SortOrder.Desc,
      });
      await expect(result).toEqual(getZSetMembersInDescResponse);
    });
    it('should call recommendationService', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolZSetCommands.ZRevRange,
            expect.anything(),
          ]),
        )
        .mockResolvedValue([
          'member4',
          'inf',
          'member3',
          '2',
          'member2',
          '0',
          'member1',
          '-inf',
        ]);

      const result = await service.getMembers(mockBrowserClientMetadata, {
        ...mockGetMembersDto,
        sortOrder: SortOrder.Desc,
      });

      expect(recommendationService.check).toBeCalledWith(
        mockBrowserClientMetadata,
        RECOMMENDATION_NAMES.RTS,
        { members: result.members, keyName: result.keyName },
      );
    });
    it('key with this name does not exist for getMembers', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolZSetCommands.ZCard, mockGetMembersDto.keyName])
        .mockResolvedValue(0);

      await expect(
        service.getMembers(mockBrowserClientMetadata, mockGetMembersDto),
      ).rejects.toThrow(NotFoundException);
      expect(client.sendCommand).toHaveBeenCalledTimes(1);
    });
    it("try to use 'ZCARD' command not for zset data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ZCARD',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getMembers(mockBrowserClientMetadata, mockGetMembersDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for getMembers", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ZCARD',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getMembers(mockBrowserClientMetadata, mockGetMembersDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addMembers', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockAddMembersDto.keyName])
        .mockResolvedValue(1);
    });
    it('succeed to add members to the ZSet data type', async () => {
      const { keyName } = mockAddMembersDto;
      when(client.sendCommand)
        .calledWith([
          BrowserToolZSetCommands.ZAdd,
          keyName,
          ...mockMembersForZAddCommand,
        ])
        .mockResolvedValue(mockAddMembersDto.members.length);

      await expect(
        service.addMembers(mockBrowserClientMetadata, mockAddMembersDto),
      ).resolves.not.toThrow();
    });
    it('key with this name does not exist for addMembers', async () => {
      const { keyName } = mockAddMembersDto;
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValue(0);

      await expect(
        service.addMembers(mockBrowserClientMetadata, mockAddMembersDto),
      ).rejects.toThrow(NotFoundException);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolZSetCommands.ZAdd,
        expect.anything(),
      ]);
    });
    it("try to use 'ZADD' command not for zset data type for addMembers", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ZADD',
      };
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolZSetCommands.ZAdd,
            expect.anything(),
          ]),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.addMembers(mockBrowserClientMetadata, mockAddMembersDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for addMembers", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ZADD',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.addMembers(mockBrowserClientMetadata, mockAddMembersDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateMember', () => {
    beforeEach(() =>
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockAddMembersDto.keyName])
        .mockResolvedValue(1),
    );

    it('succeed to update member in key', async () => {
      const { keyName, member } = mockUpdateMemberDto;
      when(client.sendCommand)
        .calledWith([
          BrowserToolZSetCommands.ZAdd,
          keyName,
          'XX',
          'CH',
          `${member.score}`,
          member.name,
        ])
        .mockResolvedValue(1);

      await expect(
        service.updateMember(mockBrowserClientMetadata, mockUpdateMemberDto),
      ).resolves.not.toThrow();
    });
    it('key with this name does not exist for updateMember', async () => {
      const { keyName } = mockUpdateMemberDto;
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValue(0);

      await expect(
        service.updateMember(mockBrowserClientMetadata, mockUpdateMemberDto),
      ).rejects.toThrow(NotFoundException);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolZSetCommands.ZAdd,
        expect.anything(),
      ]);
    });
    it('member does not exist in key', async () => {
      const { keyName, member } = mockUpdateMemberDto;
      when(client.sendCommand)
        .calledWith([
          BrowserToolZSetCommands.ZAdd,
          keyName,
          'XX',
          'CH',
          `${member.score}`,
          member.name,
        ])
        .mockResolvedValue(0);

      await expect(
        service.updateMember(mockBrowserClientMetadata, mockUpdateMemberDto),
      ).rejects.toThrow(NotFoundException);
    });
    it("try to use 'ZADD' command not for zset data type for updateMember", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ZADD',
      };
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolZSetCommands.ZAdd,
            expect.anything(),
          ]),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.updateMember(mockBrowserClientMetadata, mockUpdateMemberDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for updateMember", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ZADD',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.updateMember(mockBrowserClientMetadata, mockUpdateMemberDto),
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
        .mockResolvedValue(1);
    });
    it('succeeded to delete members from ZSet data type', async () => {
      const { members, keyName } = mockDeleteMembersDto;
      when(client.sendCommand)
        .calledWith([BrowserToolZSetCommands.ZRem, keyName, ...members])
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
        .mockResolvedValue(0);

      await expect(
        service.deleteMembers(mockBrowserClientMetadata, mockDeleteMembersDto),
      ).rejects.toThrow(NotFoundException);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolZSetCommands.ZRem,
        keyName,
        ...members,
      ]);
    });
    it("try to use 'ZREM' command not for set data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ZREM',
      };
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolZSetCommands.ZRem,
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
        command: 'ZREM',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.deleteMembers(mockBrowserClientMetadata, mockDeleteMembersDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('searchMembers', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolZSetCommands.ZCard,
          mockSearchMembersDto.keyName,
        ])
        .mockResolvedValue(mockAddMembersDto.members.length);
    });
    it('succeeded to search members in ZSet data type', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolZSetCommands.ZScan,
            expect.anything(),
          ]),
        )
        .mockResolvedValue([
          0,
          ['member1', '-inf', 'member2', '0', 'member3', '2', 'member4', 'inf'],
        ]);

      const result = await service.searchMembers(
        mockBrowserClientMetadata,
        mockSearchMembersDto,
      );
      await expect(result).toEqual(mockSearchZSetMembersResponse);
      expect(client.sendCommand).toHaveBeenCalledWith(
        expect.arrayContaining([
          BrowserToolZSetCommands.ZScan,
          expect.anything(),
        ]),
      );
    });
    it('succeed to find exact member in the z-set', async () => {
      const item = { name: Buffer.from('member'), score: 2 };
      const dto: SearchZSetMembersDto = {
        ...mockSearchMembersDto,
        match: item.name.toString(),
      };
      when(client.sendCommand)
        .calledWith([BrowserToolZSetCommands.ZScore, dto.keyName, dto.match])
        .mockResolvedValue(item.score);

      const result = await service.searchMembers(
        mockBrowserClientMetadata,
        dto,
      );

      expect(result).toEqual({
        ...mockSearchZSetMembersResponse,
        members: [item],
      });
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolZSetCommands.ZScan,
        expect.anything(),
      ]);
    });
    it('failed to find exact member in the set', async () => {
      const dto: SearchZSetMembersDto = {
        ...mockSearchMembersDto,
        match: 'member',
      };
      when(client.sendCommand)
        .calledWith([BrowserToolZSetCommands.ZScore, dto.keyName, dto.match])
        .mockResolvedValue(null);

      const result = await service.searchMembers(
        mockBrowserClientMetadata,
        dto,
      );

      expect(result).toEqual({ ...mockSearchZSetMembersResponse, members: [] });
    });
    it('should not call scan when math contains escaped glob', async () => {
      const mockMatch = 'm\\[a-e\\]mber';
      const mockSpecialMember = Buffer.from('m[a-e]mber');
      const dto: SearchZSetMembersDto = {
        ...mockSearchMembersDto,
        match: mockMatch,
      };
      when(client.sendCommand)
        .calledWith([
          BrowserToolZSetCommands.ZScore,
          dto.keyName,
          mockSpecialMember.toString(),
        ])
        .mockResolvedValue(1);

      const result = await service.searchMembers(
        mockBrowserClientMetadata,
        dto,
      );

      expect(result).toEqual({
        ...mockSearchZSetMembersResponse,
        members: [{ name: mockSpecialMember, score: 1 }],
      });
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolZSetCommands.ZScan,
        expect.anything(),
      ]);
    });
    // TODO: uncomment after enabling threshold for z-set scan
    // it('should stop z-set full scan', async () => {
    //   const dto: SearchZSetMembersDto = {
    //     ...mockSearchMembersDto,
    //     count: REDIS_SCAN_CONFIG.countDefault,
    //     match: '*un-exist-member*',
    //   };
    //   const maxScanCalls = Math.round(
    //     REDIS_SCAN_CONFIG.countThreshold / REDIS_SCAN_CONFIG.countDefault,
    //   );
    //   when(browserTool.execCommand)
    //     .calledWith(
    //       mockBrowserClientMetadata,
    //       BrowserToolZSetCommands.ZScan,
    //       expect.anything(),
    //     )
    //     .mockResolvedValue(['200', []]);
    //
    //   await service.searchMembers(mockBrowserClientMetadata, dto);
    //
    //   expect(browserTool.execCommand).toHaveBeenCalledTimes(maxScanCalls + 1);
    // });
    it('key with this name does not exist for searchMembers', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolZSetCommands.ZCard,
          mockSearchMembersDto.keyName,
        ])
        .mockResolvedValue(0);

      await expect(
        service.searchMembers(mockBrowserClientMetadata, mockSearchMembersDto),
      ).rejects.toThrow(NotFoundException);
      expect(client.sendCommand).toHaveBeenCalledTimes(1);
    });
    it("try to use 'ZCARD' command not for zset data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ZCARD',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.searchMembers(mockBrowserClientMetadata, mockSearchMembersDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for searchMembers", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ZCARD',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.searchMembers(mockBrowserClientMetadata, mockSearchMembersDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
