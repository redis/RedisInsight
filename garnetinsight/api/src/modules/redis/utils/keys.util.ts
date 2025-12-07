import { get } from 'lodash';
import { RedisClient } from 'src/modules/redis/client';
import { convertMultilineReplyToObject } from 'src/modules/redis/utils/reply.util';

export const getTotalKeysFromInfo = async (client: RedisClient) => {
  try {
    const currentDbIndex = await client.getCurrentDbIndex();
    const info = await client.getInfo('keyspace');

    const dbInfo = get(info, 'keyspace', {});
    if (!dbInfo[`db${currentDbIndex}`]) {
      return 0;
    }

    const { keys } = convertMultilineReplyToObject(
      dbInfo[`db${currentDbIndex}`],
      ',',
      '=',
    );
    return parseInt(keys, 10);
  } catch (err) {
    return -1;
  }
};

export const getTotalKeysFromDBSize = async (client: RedisClient) => {
  const total = (await client.sendCommand(['dbsize'], {
    replyEncoding: 'utf8',
  })) as string;
  return parseInt(total, 10);
};

export const getTotalKeys = async (client: RedisClient): Promise<number> => {
  try {
    return await getTotalKeysFromDBSize(client);
  } catch (err) {
    return await getTotalKeysFromInfo(client);
  }
};
