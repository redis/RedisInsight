import {
  AdditionalRedisModuleName,
  REDIS_SOFTWARE_MODULES_NAMES,
} from 'src/constants';

export function convertRedisSoftwareModuleName(
  name: string,
): AdditionalRedisModuleName {
  return REDIS_SOFTWARE_MODULES_NAMES[name] ?? name;
}
