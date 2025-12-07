import Redis, * as IORedis from 'ioredis';
import * as semverCompare from 'node-version-compare';
import * as fs from 'fs';
import { Server, createServer } from 'net';
import { Client } from 'ssh2';
import { constants } from './constants';
import { parseReplToObject, parseClusterNodesResponse } from './utils';
import { initDataHelper } from './data/redis';
import {
  UnableToCreateLocalServerException,
  UnableToCreateSshConnectionException,
} from 'src/modules/ssh/exceptions';

/**
 * Connect to redis in standalone mode and return client
 * @param options
 */
export const connectToStandalone = async (
  options: IORedis.RedisOptions,
): Promise<IORedis.Redis> => {
  return await new Promise((resolve, reject) => {
    const client = new Redis(options);

    client.on('error', (e: Error) => {
      console.error('Unable to connect in standalone mode', e);
      reject(e);
    });
    client.on('ready', () => {
      resolve(client);
    });
  });
};

/**
 * Connect to redis in cluster mode and return client
 * @param nodes
 * @param redisOptions
 */
export const connectToRedisCluster = async (
  nodes: any[],
  redisOptions: IORedis.RedisOptions,
): Promise<IORedis.Cluster> => {
  return await new Promise((resolve, reject) => {
    const client = new Redis.Cluster(nodes, { redisOptions });

    client.on('error', (e: Error): void => {
      console.error('Unable to connect in cluster mode', e);
      reject(e);
    });
    client.on('ready', async () => {
      resolve(client);
    });
  });
};

/**
 * Connect to redis in sentinel mode and return client
 * @param redisOptions
 */
export const connectToRedisSentinel = async (
  redisOptions: IORedis.RedisOptions,
): Promise<IORedis.Redis> => {
  return await new Promise((resolve, reject) => {
    const client = new Redis(redisOptions);

    client.on('error', (e: Error): void => {
      console.error('Unable to connect in sentinel mode', e);
      reject(e);
    });
    client.on('ready', async () => {
      resolve(client);
    });
  });
};

/**
 * Automatically determines connection mode and returns client
 * @param connectionOptions
 */
const getClient = async (
  connectionOptions: IORedis.RedisOptions,
): Promise<Record<string, any>> => {
  let standaloneClient = await connectToStandalone(connectionOptions);
  const info: any = {
    type: constants.STANDALONE,
  };

  // check for cluster
  try {
    const clusterInfo = parseReplToObject(
      await standaloneClient.cluster('INFO'),
    );
    if (clusterInfo.cluster_state === 'ok') {
      const nodes = parseClusterNodesResponse(
        // https://github.com/luin/ioredis/issues/1572
        // @ts-expect-error
        await standaloneClient.cluster('NODES'),
      )
        .filter((node) => node.linkState === 'connected')
        .map(({ host, port }) => {
          return { host, port };
        });
      if (nodes.length > 0) {
        info.type = constants.CLUSTER;
        return {
          client: await connectToRedisCluster(nodes, connectionOptions),
          info,
        };
      }
    }
  } catch (e) {}

  // check for sentinel
  try {
    const masterGroups = (await standaloneClient.call('sentinel', [
      'masters',
    ])) as [];
    if (!masterGroups?.length) {
      throw new Error('Invalid sentinel configuration');
    }
    info.type = constants.SENTINEL;
    const sentinelOptions = {
      ...connectionOptions,
      sentinels: [
        {
          host: constants.TEST_REDIS_HOST,
          port: constants.TEST_REDIS_PORT,
        },
      ],
      name: constants.TEST_SENTINEL_MASTER_GROUP,
      sentinelUsername: constants.TEST_REDIS_USER,
      sentinelPassword: constants.TEST_REDIS_PASSWORD,
      username: constants.TEST_SENTINEL_MASTER_USER,
      password: constants.TEST_SENTINEL_MASTER_PASS,
      connectionName: connectionOptions.connectionName,
      sentinelTLS: connectionOptions.tls,
      enableTLSForSentinelMode: !!connectionOptions.tls,
    };
    return {
      client: await connectToRedisSentinel(sentinelOptions),
      info,
    };
  } catch (e) {}

  return { client: standaloneClient, info };
};

const initTunnel = async () => {
  const server = (await new Promise((resolve, reject) => {
    try {
      const server = createServer();

      server.on('listening', () => resolve(server));
      server.on('error', (e) => {
        reject(new UnableToCreateLocalServerException(e.message));
      });

      server.listen({
        host: '127.0.0.1',
        port: 44444,
      });
    } catch (e) {
      reject(e);
    }
  })) as Server;

  const client = (await new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => resolve(conn));
    conn.on('error', (e) => {
      reject(new UnableToCreateSshConnectionException(e.message));
    });
    conn.connect({
      host: constants.TEST_SSH_HOST,
      port: constants.TEST_SSH_PORT,
      username: constants.TEST_SSH_USER,
      password: constants.TEST_SSH_PASSWORD || undefined,
    });
  })) as Client;

  server.on('connection', (connection) => {
    client.forwardOut(
      '127.0.0.1',
      44444,
      constants.TEST_REDIS_HOST,
      constants.TEST_REDIS_PORT,
      (e, stream) => {
        if (e) {
          console.error(e);
          client.emit('error', e);
        } else {
          return connection.pipe(stream).pipe(connection);
        }
      },
    );

    connection.on('error', (e) => {
      client.emit('error', e);
    });
  });
};

let rte;
/**
 * Create test Redis client and determine environment settings
 */
export const initRTE = async () => {
  if (!rte) {
    const options: IORedis.RedisOptions = {
      host: constants.TEST_REDIS_HOST,
      port: constants.TEST_REDIS_PORT,
      username: constants.TEST_REDIS_USER,
      password: constants.TEST_REDIS_PASSWORD,
      showFriendlyErrorStack: true,
      connectionName: constants.TEST_RUN_ID,
    };

    if (constants.TEST_REDIS_TLS_CA) {
      if (!constants.TEST_USER_TLS_CERT || !constants.TEST_USER_TLS_CERT) {
        options.tls = {
          rejectUnauthorized: true,
          checkServerIdentity: () => undefined,
          ca: [constants.TEST_REDIS_TLS_CA],
        };
      } else {
        options.tls = {
          rejectUnauthorized: true,
          checkServerIdentity: () => undefined,
          ca: [constants.TEST_REDIS_TLS_CA],
          cert: constants.TEST_USER_TLS_CERT,
          key: constants.TEST_USER_TLS_KEY,
        };
      }
    }

    if (constants.TEST_SSH_USER) {
      await initTunnel();
      options.host = '127.0.0.1';
      options.port = 44444;
    }

    rte = await getClient(options);
  }

  const info = parseReplToObject(await rte.client.info());

  rte.env = {
    name: constants.TEST_RUN_NAME,
    version: info['redis_version'],
    mode: info['redis_mode'],
    type: rte.info.type,
    onPremise: constants.TEST_RTE_ON_PREMISE,
    // ACL commands are blocked in the Redis Enterprise and Cloud
    acl:
      !constants.TEST_CLOUD_RTE &&
      !constants.TEST_RE_USER &&
      semverCompare(info['redis_version'], '6') >= 0,
    pass: !!constants.TEST_REDIS_PASSWORD,
    tls: !!constants.TEST_REDIS_TLS_CA,
    tlsAuth: !!constants.TEST_USER_TLS_KEY && !!constants.TEST_USER_TLS_CERT,
    modules: await determineModulesInstalled(rte.client),
    re: !!constants.TEST_RE_USER,
    ssh: !!constants.TEST_SSH_USER,
    cloud: !!constants.TEST_CLOUD_RTE,
    sharedData: constants.TEST_RTE_SHARED_DATA,
    bigData: constants.TEST_RTE_BIG_DATA,
    crdt: constants.TEST_RTE_CRDT,
    nodes: [],
  };

  if (rte.env.type === constants.CLUSTER) {
    rte.env.nodes = rte.client.nodes('all').map(({ options }) => {
      return { host: options.host, port: options.port };
    });
  }

  rte.data = await initDataHelper(rte);

  // generate cert files
  if (rte.env.tls) {
    fs.writeFileSync(constants.TEST_CA_CERT_PATH, constants.TEST_REDIS_TLS_CA);
  }
  if (rte.env.tlsAuth) {
    fs.writeFileSync(
      constants.TEST_CLIENT_CERT_PATH,
      constants.TEST_USER_TLS_CERT,
    );
    fs.writeFileSync(
      constants.TEST_CLIENT_KEY_PATH,
      constants.TEST_USER_TLS_KEY,
    );
  }

  return rte;
};

const determineModulesInstalled = async (client) => {
  const modules = {};
  try {
    (await client.call('module', 'list')).map((module) => {
      modules[module[1].toLowerCase()] = { version: module[3] || -1 };
    });
  } catch (e) {
    console.error('Error when try to indicate modules installed: ', e);
  }

  return modules;
};
