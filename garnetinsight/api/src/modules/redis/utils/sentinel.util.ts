import { RedisClient } from 'src/modules/redis/client';
import {
  SentinelMaster,
  SentinelMasterStatus,
} from 'src/modules/redis-sentinel/models/sentinel-master';
import { catchAclError } from 'src/utils';
import { BadRequestException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { convertArrayReplyToObject } from 'src/modules/redis/utils/reply.util';
import { Endpoint } from 'src/common/models';

/**
 * Check weather database is a sentinel
 * Used to automatically determine db type when connected to a database with standalone client
 * In case when "sentinel masters" command will be not allowed by ACL or in case of any other error
 * we will handle this database as a non-sentinel since "sentinel masters" command is required
 * to work properly in the next steps
 * @param client
 */
export const isSentinel = async (client: RedisClient): Promise<boolean> => {
  try {
    await client.sendCommand(['sentinel', 'masters']);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Discover other sentinels endpoints for the current connection
 * @param client
 * @param masterGroup
 */
export const discoverOtherSentinels = async (
  client: RedisClient,
  masterGroup: string,
): Promise<Endpoint[]> => {
  let result: Endpoint[];
  try {
    const reply = (await client.sendCommand(
      ['sentinel', 'sentinels', masterGroup],
      { replyEncoding: 'utf8' },
    )) as string[][];

    result = reply.map((item) => {
      const { ip, port } = convertArrayReplyToObject(item);
      return { host: ip, port: parseInt(port, 10) };
    });

    return [...result];
  } catch (error) {
    // todo: remove error handling
    if (error.message.includes('unknown command `sentinel`')) {
      throw new BadRequestException(ERROR_MESSAGES.WRONG_DATABASE_TYPE);
    }

    throw catchAclError(error);
  }
};

/**
 * Discover master groups for the current connection
 * @param client
 */
export const discoverSentinelMasterGroups = async (
  client: RedisClient,
): Promise<SentinelMaster[]> => {
  let result: SentinelMaster[];
  try {
    const reply = (await client.sendCommand(['sentinel', 'masters'], {
      replyEncoding: 'utf8',
    })) as string[][];

    result = reply.map((item) => {
      const {
        ip,
        port,
        name,
        'num-slaves': numberOfSlaves,
        flags,
      } = convertArrayReplyToObject(item);
      return {
        host: ip,
        port: parseInt(port, 10),
        name,
        status: flags.includes('down')
          ? SentinelMasterStatus.Down
          : SentinelMasterStatus.Active,
        numberOfSlaves: parseInt(numberOfSlaves, 10),
      };
    });

    await Promise.all(
      result.map(async (master: SentinelMaster, index: number) => {
        const nodes = await discoverOtherSentinels(client, master.name);
        result[index] = {
          ...master,
          nodes,
        };
      }),
    );

    return result;
  } catch (error) {
    // todo: remove error handling from here
    if (error.message.includes('unknown command `sentinel`')) {
      throw new BadRequestException(ERROR_MESSAGES.WRONG_DISCOVERY_TOOL());
    }

    throw catchAclError(error);
  }
};
