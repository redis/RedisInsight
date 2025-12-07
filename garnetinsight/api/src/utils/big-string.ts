import { RedisString } from 'src/common/constants';
import { isString } from 'lodash';
import config, { Config } from 'src/utils/config';

const REDIS_CLIENTS_CONFIG = config.get(
  'redis_clients',
) as Config['redis_clients'];
const BIG_STRING_PREFIX = REDIS_CLIENTS_CONFIG.truncatedStringPrefix;
const BIG_STRING_PREFIX_BUFFER = Buffer.from(BIG_STRING_PREFIX);

/**
 * Checks weather truncating functionality enabled based on global clients configuration
 * @param clientsConf
 */
export const isTruncatingEnabled = (clientsConf: Config['redis_clients']) =>
  clientsConf?.maxStringSize ? clientsConf.maxStringSize > 0 : false;

const bufferStartsWith = (value: Buffer, subBuffer: Buffer) => {
  if (subBuffer.length > value.length) {
    return false;
  }

  return subBuffer.every((v, i) => v === value[i]);
};

export const isTruncatedString = (value: RedisString): boolean => {
  if (!isTruncatingEnabled(REDIS_CLIENTS_CONFIG)) {
    return false;
  }

  try {
    if (value instanceof Buffer) {
      return bufferStartsWith(value, BIG_STRING_PREFIX_BUFFER);
    }

    if (isString(value) && value.startsWith(BIG_STRING_PREFIX)) {
      return true;
    }
  } catch (e) {
    // ignore error
  }

  return false;
};
