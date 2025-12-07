import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { isNull, isNaN } from 'lodash';
import config from 'src/utils/config';
import {
  catchAclError,
  catchMultiTransactionError,
  isRedisGlob,
  unescapeRedisGlob,
} from 'src/utils';
import { SortOrder } from 'src/constants/sort';
import { RedisErrorCodes, RECOMMENDATION_NAMES } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { ReplyError } from 'src/models';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import {
  BrowserToolKeysCommands,
  BrowserToolZSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { plainToInstance } from 'class-transformer';
import { ClientMetadata } from 'src/common/models';
import {
  AddMembersToZSetDto,
  CreateZSetWithExpireDto,
  DeleteMembersFromZSetDto,
  DeleteMembersFromZSetResponse,
  GetZSetMembersDto,
  GetZSetResponse,
  ScanZSetResponse,
  SearchZSetMembersDto,
  SearchZSetMembersResponse,
  UpdateMemberInZSetDto,
  ZSetMemberDto,
} from 'src/modules/browser/z-set/dto';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import {
  checkIfKeyExists,
  checkIfKeyNotExists,
} from 'src/modules/browser/utils';
import { RedisClient } from 'src/modules/redis/client';

const REDIS_SCAN_CONFIG = config.get('redis_scan');

@Injectable()
export class ZSetService {
  private logger = new Logger('ZSetService');

  constructor(
    private databaseClientFactory: DatabaseClientFactory,
    private recommendationService: DatabaseRecommendationService,
  ) {}

  public async createZSet(
    clientMetadata: ClientMetadata,
    dto: CreateZSetWithExpireDto,
  ): Promise<void> {
    try {
      this.logger.debug('Creating ZSet data type.', clientMetadata);
      const { keyName, expire } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyExists(keyName, client);

      if (expire) {
        await this.createZSetWithExpiration(client, dto);
      } else {
        await this.createSimpleZSet(client, dto);
      }

      this.logger.debug('Succeed to create ZSet data type.', clientMetadata);
      return null;
    } catch (error) {
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      this.logger.error(
        'Failed to create ZSet data type.',
        error,
        clientMetadata,
      );
      throw catchAclError(error);
    }
  }

  public async getMembers(
    clientMetadata: ClientMetadata,
    getZSetDto: GetZSetMembersDto,
  ): Promise<GetZSetResponse> {
    try {
      this.logger.debug(
        'Getting members of the ZSet data type stored at key.',
        clientMetadata,
      );
      const { keyName, sortOrder } = getZSetDto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const total = await client.sendCommand([
        BrowserToolZSetCommands.ZCard,
        keyName,
      ]);
      if (!total) {
        this.logger.error(
          `Failed to get members of the ZSet data type. Not Found key: ${keyName}.`,
          clientMetadata,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }

      let members: ZSetMemberDto[] = [];
      if (sortOrder && sortOrder === SortOrder.Asc) {
        members = await this.getZRange(client, getZSetDto);
      } else {
        members = await this.getZRevRange(client, getZSetDto);
      }

      this.recommendationService.check(
        clientMetadata,
        RECOMMENDATION_NAMES.RTS,
        { members, keyName },
      );

      this.logger.debug(
        'Succeed to get members of the ZSet data type.',
        clientMetadata,
      );
      return plainToInstance(GetZSetResponse, {
        keyName,
        total,
        members,
      });
    } catch (error) {
      this.logger.error(
        'Failed to get members of the ZSet data type.',
        error,
        clientMetadata,
      );
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async addMembers(
    clientMetadata: ClientMetadata,
    dto: AddMembersToZSetDto,
  ): Promise<void> {
    try {
      this.logger.debug(
        'Adding members to the ZSet data type.',
        clientMetadata,
      );
      const { keyName, members } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const args = this.formatMembersDtoToCommandArgs(members);
      await client.sendCommand([
        BrowserToolZSetCommands.ZAdd,
        keyName,
        ...args,
      ]);

      this.logger.debug(
        'Succeed to add members to ZSet data type.',
        clientMetadata,
      );
      return null;
    } catch (error) {
      this.logger.error(
        'Failed to add members to Set data type.',
        error,
        clientMetadata,
      );
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async updateMember(
    clientMetadata: ClientMetadata,
    dto: UpdateMemberInZSetDto,
  ): Promise<void> {
    try {
      this.logger.debug('Updating member in ZSet data type.', clientMetadata);
      const { keyName, member } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const result = await client.sendCommand([
        BrowserToolZSetCommands.ZAdd,
        keyName,
        'XX',
        'CH',
        `${member.score}`,
        member.name,
      ]);
      if (!result) {
        this.logger.error(
          `Failed to update member in ZSet data type. ${ERROR_MESSAGES.MEMBER_IN_SET_NOT_EXIST}`,
          clientMetadata,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.MEMBER_IN_SET_NOT_EXIST),
        );
      }

      this.logger.debug(
        'Succeed to update member in ZSet data type.',
        clientMetadata,
      );
      return null;
    } catch (error) {
      this.logger.error(
        'Failed to update member in ZSet data type.',
        error,
        clientMetadata,
      );
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async deleteMembers(
    clientMetadata: ClientMetadata,
    dto: DeleteMembersFromZSetDto,
  ): Promise<DeleteMembersFromZSetResponse> {
    try {
      this.logger.debug(
        'Deleting members from the ZSet data type.',
        clientMetadata,
      );
      const { keyName, members } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const result = (await client.sendCommand([
        BrowserToolZSetCommands.ZRem,
        keyName,
        ...members,
      ])) as number;

      this.logger.debug(
        'Succeed to delete members from the ZSet data type.',
        clientMetadata,
      );
      return { affected: result };
    } catch (error) {
      this.logger.error(
        'Failed to delete members from the ZSet data type.',
        error,
        clientMetadata,
      );
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async searchMembers(
    clientMetadata: ClientMetadata,
    dto: SearchZSetMembersDto,
  ): Promise<SearchZSetMembersResponse> {
    try {
      this.logger.debug(
        'Search members of the ZSet data type stored at key.',
        clientMetadata,
      );
      const { keyName, cursor, match } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      let result: SearchZSetMembersResponse = {
        keyName,
        total: 0,
        members: [],
        nextCursor: cursor,
      };

      result.total = (await client.sendCommand([
        BrowserToolZSetCommands.ZCard,
        keyName,
      ])) as number;
      if (!result.total) {
        this.logger.error(
          `Failed to search members of the ZSet data type. Not Found key: ${keyName}.`,
          clientMetadata,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }
      if (match && !isRedisGlob(match)) {
        const member = unescapeRedisGlob(match);
        result.nextCursor = 0;
        const score = (await client.sendCommand([
          BrowserToolZSetCommands.ZScore,
          keyName,
          member,
        ])) as string;
        const formattedScore = isNaN(parseFloat(score))
          ? String(score)
          : parseFloat(score);

        if (!isNull(score)) {
          result.members.push(
            plainToInstance(ZSetMemberDto, {
              name: member,
              score: formattedScore,
            }),
          );
        }
      } else {
        const scanResult = await this.scanZSet(client, dto);
        result = { ...result, ...scanResult };
      }

      this.logger.debug(
        'Succeed to search members of the ZSet data type.',
        clientMetadata,
      );
      return plainToInstance(SearchZSetMembersResponse, result);
    } catch (error) {
      this.logger.error(
        'Failed to search members of the ZSet data type.',
        error,
        clientMetadata,
      );
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async getZRange(
    client: RedisClient,
    getZSetDto: GetZSetMembersDto,
  ): Promise<ZSetMemberDto[]> {
    const { keyName, offset, count } = getZSetDto;

    const execResult = (await client.sendCommand([
      BrowserToolZSetCommands.ZRange,
      keyName,
      offset,
      offset + count - 1,
      'WITHSCORES',
    ])) as string[];

    return this.formatZRangeWithScoresReply(execResult);
  }

  public async getZRevRange(
    client: RedisClient,
    getZSetDto: GetZSetMembersDto,
  ): Promise<ZSetMemberDto[]> {
    const { keyName, offset, count } = getZSetDto;

    const execResult = (await client.sendCommand([
      BrowserToolZSetCommands.ZRevRange,
      keyName,
      offset,
      offset + count - 1,
      'WITHSCORES',
    ])) as string[];

    return this.formatZRangeWithScoresReply(execResult);
  }

  public async createSimpleZSet(
    client: RedisClient,
    dto: CreateZSetWithExpireDto,
  ): Promise<number> {
    const { keyName, members } = dto;
    const args = this.formatMembersDtoToCommandArgs(members);

    return (await client.sendCommand([
      BrowserToolZSetCommands.ZAdd,
      keyName,
      ...args,
    ])) as number;
  }

  public async createZSetWithExpiration(
    client: RedisClient,
    dto: CreateZSetWithExpireDto,
  ): Promise<number> {
    const { keyName, members, expire } = dto;

    const args = this.formatMembersDtoToCommandArgs(members);
    const transactionResults = await client.sendPipeline([
      [BrowserToolZSetCommands.ZAdd, keyName, ...args],
      [BrowserToolKeysCommands.Expire, keyName, expire],
    ]);
    catchMultiTransactionError(transactionResults);

    const execResult = transactionResults.map(
      (item: [ReplyError, any]) => item[1],
    );
    const [added] = execResult;
    return added;
  }

  public async scanZSet(
    client: RedisClient,
    dto: SearchZSetMembersDto,
  ): Promise<ScanZSetResponse> {
    const { keyName, cursor } = dto;
    const count = dto.count || REDIS_SCAN_CONFIG.countDefault;
    const match = dto.match !== undefined ? dto.match : '*';
    let result: ScanZSetResponse = {
      keyName,
      nextCursor: null,
      members: [],
    };
    while (result.nextCursor !== 0 && result.members.length < count) {
      const scanResult = await client.sendCommand([
        BrowserToolZSetCommands.ZScan,
        keyName,
        `${result.nextCursor || cursor}`,
        'MATCH',
        match,
        'COUNT',
        count,
      ]);
      const nextCursor = scanResult[0];
      const membersArray = scanResult[1];
      const members: ZSetMemberDto[] =
        this.formatZRangeWithScoresReply(membersArray);
      result = {
        ...result,
        nextCursor: parseInt(nextCursor, 10),
        members: [...result.members, ...members],
      };
    }
    return result;
  }

  private formatZRangeWithScoresReply(reply: string[]): ZSetMemberDto[] {
    const result: ZSetMemberDto[] = [];
    while (reply.length) {
      const member = reply.splice(0, 2);
      const score = isNaN(parseFloat(member[1]))
        ? String(member[1])
        : parseFloat(member[1]);
      result.push(
        plainToInstance(ZSetMemberDto, {
          name: member[0],
          score,
        }),
      );
    }

    return result;
  }

  private formatMembersDtoToCommandArgs(
    members: ZSetMemberDto[],
  ): (string | Buffer)[] {
    return members.reduce<(string | Buffer)[]>(
      (prev: string[], cur: ZSetMemberDto) => [
        ...prev,
        ...[`${cur.score}`, cur.name],
      ],
      [],
    );
  }
}
