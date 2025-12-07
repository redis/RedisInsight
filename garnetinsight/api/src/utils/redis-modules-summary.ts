import { cloneDeep } from 'lodash';
import {
  AdditionalRedisModuleName,
  SUPPORTED_REDIS_MODULES,
  REDISEARCH_MODULES,
} from 'src/constants';
import { AdditionalRedisModule } from 'src/modules/database/models/additional.redis.module';

interface IModuleSummary {
  loaded: boolean;
  version?: number;
  semanticVersion?: number;
}
interface IRedisModulesSummary
  extends Record<keyof typeof AdditionalRedisModuleName, IModuleSummary> {
  customModules: AdditionalRedisModule[];
}
export const DEFAULT_SUMMARY: IRedisModulesSummary = Object.freeze({
  RediSearch: { loaded: false },
  RedisAI: { loaded: false },
  RedisGraph: { loaded: false },
  RedisGears: { loaded: false },
  RedisBloom: { loaded: false },
  RedisJSON: { loaded: false },
  RedisTimeSeries: { loaded: false },
  customModules: [],
});

export const isRedisearchAvailable = (
  modules: AdditionalRedisModule[],
): boolean =>
  modules?.some(({ name }) =>
    REDISEARCH_MODULES.some((search) => name === search),
  );

const getEnumKeyBValue = (myEnum: any, enumValue: number | string): string => {
  const keys = Object.keys(myEnum);
  const index = keys.findIndex((x) => myEnum[x] === enumValue);
  return index > -1 ? keys[index] : '';
};

const getModuleSummaryToSent = (module: AdditionalRedisModule) => ({
  loaded: true,
  version: module.version,
  semanticVersion: module.semanticVersion,
});

// same function as in FE
export const getRedisModulesSummary = (
  modules: AdditionalRedisModule[] = [],
): IRedisModulesSummary => {
  const summary = cloneDeep(DEFAULT_SUMMARY);
  try {
    modules.forEach((module) => {
      if (SUPPORTED_REDIS_MODULES[module.name]) {
        const moduleName = getEnumKeyBValue(
          AdditionalRedisModuleName,
          module.name,
        );
        summary[moduleName] = getModuleSummaryToSent(module);
        return;
      }

      if (isRedisearchAvailable([module])) {
        const redisearchName = getEnumKeyBValue(
          AdditionalRedisModuleName,
          AdditionalRedisModuleName.RediSearch,
        );
        summary[redisearchName] = getModuleSummaryToSent(module);
        return;
      }

      summary.customModules.push(module);
    });
  } catch (e) {
    // continue regardless of error
  }
  return summary;
};
