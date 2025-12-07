import { IP_ADDRESS_REGEX, PRIVATE_IP_ADDRESS_REGEX } from 'src/constants';
import { HostingProvider } from 'src/modules/database/entities/database.entity';
import { RedisClient } from 'src/modules/redis/client';
import { convertRedisInfoReplyToObject } from 'src/utils/redis-reply-converter';

const PROVIDER_HOST_REGEX = {
  RLCP: /\.rlrcp\.com$/,
  REDISLABS: /\.redislabs\.com$/,
  REDISCLOUD: /\.redis-cloud\.com$/,
  CACHE_AMAZONAWS: /cache\.amazonaws\.com$/,
  CACHE_WINDOWS: /cache\.windows\.net$/,
  RE_CACHE_AZURE: /redisenterprise\.cache\.azure\.net$/,
};

// Because we do not bind potentially dangerous logic to this.
// We define a hosting provider for telemetry only.
export const getHostingProvider = async (
  client: RedisClient,
  databaseHost: string,
): Promise<HostingProvider> => {
  try {
    const host = databaseHost.toLowerCase();

    // Tries to detect the hosting provider from the hostname.
    if (
      PROVIDER_HOST_REGEX.RLCP.test(host) ||
      PROVIDER_HOST_REGEX.REDISLABS.test(host) ||
      PROVIDER_HOST_REGEX.REDISCLOUD.test(host)
    ) {
      return HostingProvider.REDIS_CLOUD;
    }
    if (PROVIDER_HOST_REGEX.CACHE_AMAZONAWS.test(host)) {
      return HostingProvider.AWS_ELASTICACHE;
    }
    if (host.includes('memorydb')) {
      return HostingProvider.AWS_MEMORYDB;
    }
    if (PROVIDER_HOST_REGEX.CACHE_WINDOWS.test(host)) {
      return HostingProvider.AZURE_CACHE;
    }
    if (PROVIDER_HOST_REGEX.RE_CACHE_AZURE.test(host)) {
      return HostingProvider.AZURE_CACHE_REDIS_ENTERPRISE;
    }

    try {
      const hello = JSON.stringify(
        (await client.sendCommand(['hello'], {
          replyEncoding: 'utf8',
        })) as string[],
      ).toLowerCase();

      if (hello.includes('/enterprise-managed')) {
        return HostingProvider.OTHER_REDIS_MANAGED;
      }

      if (hello.includes('google')) {
        return HostingProvider.MEMORYSTORE;
      }
    } catch (e) {
      // ignore errors
    }

    try {
      const info = (
        (await client.sendCommand(['info'], {
          replyEncoding: 'utf8',
        })) as string
      ).toLowerCase();

      if (info.includes('elasticache')) {
        return HostingProvider.AWS_ELASTICACHE;
      }

      if (info.includes('memorydb')) {
        return HostingProvider.AWS_MEMORYDB;
      }

      if (info.includes('keydb')) {
        return HostingProvider.KEYDB;
      }

      if (info.includes('valkey')) {
        return HostingProvider.VALKEY;
      }

      if (info.includes('dragonfly_version')) {
        return HostingProvider.DRAGONFLY;
      }

      if (info.includes('garnet_version')) {
        return HostingProvider.GARNET;
      }

      if (info.includes('kvrocks_version')) {
        return HostingProvider.KVROCKS;
      }

      if (info.includes('redict_version')) {
        return HostingProvider.REDICT;
      }

      if (info.includes('upstash_version')) {
        return HostingProvider.UPSTASH;
      }

      const infoObj = convertRedisInfoReplyToObject(info);

      if (infoObj.server.executable.includes('redis-server')) {
        if (infoObj.server.executable.includes('redis-stack')) {
          return HostingProvider.REDIS_STACK;
        }
        return HostingProvider.REDIS_COMMUNITY_EDITION;
      }
    } catch (e) {
      // ignore error
    }

    if (host === '0.0.0.0' || host === 'localhost' || host === '127.0.0.1') {
      return HostingProvider.UNKNOWN_LOCALHOST;
    }

    // todo: investigate weather we need this
    if (IP_ADDRESS_REGEX.test(host) && PRIVATE_IP_ADDRESS_REGEX.test(host)) {
      return HostingProvider.UNKNOWN_LOCALHOST;
    }
  } catch (e) {
    // ignore any error
  }

  return HostingProvider.UNKNOWN;
};
