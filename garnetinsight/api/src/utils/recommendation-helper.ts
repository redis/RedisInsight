import { sortBy } from 'lodash';
import { isValid } from 'date-fns';

import {
  REDISEARCH_MODULES,
  REDIS_STACK,
  RECOMMENDATION_NAMES,
  IS_TIMESTAMP,
  IS_INTEGER_NUMBER_REGEX,
  IS_NUMBER_REGEX,
} from 'src/constants';

import { AdditionalRedisModule } from 'src/modules/database/models/additional.redis.module';

export const isRedisearchModule = (modules: AdditionalRedisModule[]): boolean =>
  modules?.some(({ name }) =>
    REDISEARCH_MODULES.some((search) => name === search),
  );

export const sortRecommendations = (recommendations: any[]) =>
  sortBy(recommendations, [
    ({ name }) => name !== RECOMMENDATION_NAMES.SEARCH_JSON,
    ({ name }) => name !== RECOMMENDATION_NAMES.SEARCH_INDEXES,
    ({ name }) => !REDIS_STACK.includes(name),
    ({ name }) => name,
  ]);

export const checkTimestamp = (value: string): boolean => {
  try {
    if (!IS_NUMBER_REGEX.test(value) && isValid(new Date(value))) {
      return true;
    }
    const integerPart = parseInt(value, 10);
    if (!IS_TIMESTAMP.test(integerPart.toString())) {
      return false;
    }
    if (integerPart.toString().length === value.length) {
      return true;
    }
    // check part after separator
    const subPart = value.replace(integerPart.toString(), '');
    return IS_INTEGER_NUMBER_REGEX.test(subPart.substring(1, subPart.length));
  } catch (err) {
    // ignore errors
    return false;
  }
};

// https://redis.io/docs/manual/keyspace-notifications/
export const checkKeyspaceNotification = (reply: string): boolean =>
  reply.indexOf('K') > -1 || reply.indexOf('E') > -1;
