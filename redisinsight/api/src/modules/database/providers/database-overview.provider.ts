import { Injectable, Logger } from '@nestjs/common';
import { get, filter, map, keyBy, sum, sumBy, isNumber } from 'lodash';
import {
  getTotalKeys,
  convertMultilineReplyToObject,
} from 'src/modules/redis/utils';
import { DatabaseOverview } from 'src/modules/database/models/database-overview';
import { ClientMetadata } from 'src/common/models';
import {
  RedisClient,
  RedisClientConnectionType,
  RedisClientNodeRole,
} from 'src/modules/redis/client';
import { DatabaseOverviewKeyspace } from '../constants/overview';

@Injectable()
export class DatabaseOverviewProvider {
  private readonly logger = new Logger(DatabaseOverviewProvider.name);

  private previousCpuStats = new Map();

  /**
   * Calculates redis database metrics based on connection type (eg Cluster or Standalone)
   * @param clientMetadata
   * @param client
   * @param keyspace
   */
  async getOverview(
    clientMetadata: ClientMetadata,
    client: RedisClient,
    keyspace: DatabaseOverviewKeyspace,
  ): Promise<DatabaseOverview> {
    let nodesInfo = [];
    let totalKeys;
    let totalKeysPerDb;

    const currentDbIndex = isNumber(clientMetadata.db)
      ? clientMetadata.db
      : await client.getCurrentDbIndex();

    if (client.getConnectionType() === RedisClientConnectionType.CLUSTER) {
      nodesInfo = await this.getNodesInfo(client);
      totalKeys = await this.calculateNodesTotalKeys(client);
    } else {
      nodesInfo = [await this.getNodeInfo(client)];
      const [calculatedTotalKeys, calculatedTotalKeysPerDb] =
        this.calculateTotalKeys(nodesInfo, currentDbIndex, keyspace);
      totalKeys = calculatedTotalKeys;
      totalKeysPerDb = calculatedTotalKeysPerDb;
    }

    return {
      version: this.getVersion(nodesInfo),
      serverName: this.getServerName(nodesInfo),
      totalKeys,
      totalKeysPerDb,
      usedMemory: this.calculateUsedMemory(nodesInfo),
      connectedClients: this.calculateConnectedClients(nodesInfo),
      opsPerSecond: this.calculateOpsPerSec(nodesInfo),
      networkInKbps: this.calculateNetworkIn(nodesInfo),
      networkOutKbps: this.calculateNetworkOut(nodesInfo),
      cpuUsagePercentage: this.calculateCpuUsage(
        clientMetadata.databaseId,
        nodesInfo,
      ),
      maxCpuUsagePercentage: await this.calculateMaxCpuPercentage(client),
    };
  }

  /**
   * Get redis info (executing "info" command) for node
   * @param client
   * @private
   */
  private async getNodeInfo(client: RedisClient) {
    const { host, port } = client.options;
    const infoData = await client.getInfo();

    return {
      ...infoData,
      host,
      port,
    };
  }

  /**
   * Get info for each node in cluster
   * @param client
   * @private
   */
  private async getNodesInfo(client: RedisClient) {
    return Promise.all((await client.nodes()).map(this.getNodeInfo));
  }

  /**
   * Get median value from array of numbers
   * Will return 0 when empty array received
   * @param values
   * @private
   */
  private getMedianValue(values: number[]): number {
    if (!values.length) {
      return 0;
    }

    values.sort((a, b) => a - b);

    const middleIndex = Math.floor(values.length / 2);

    // process odd array
    if (values.length % 2) {
      return values[middleIndex];
    }

    return (values[middleIndex - 1] + values[middleIndex]) / 2;
  }

  /**
   * Get redis version from the first chard in the list
   * @param nodes
   * @private
   */
  private getVersion(nodes = []): string {
    return get(nodes, [0, 'server', 'redis_version'], null);
  }

  /**
   * Get server_name from the first shard in the list
   * @param nodes
   * @private
   */
  private getServerName(nodes = []): string {
    return get(nodes, [0, 'server', 'server_name'], null);
  }

  /**
   * Sum of current ops per second (instantaneous_ops_per_sec) for all shards
   * @param nodes
   * @private
   */
  private calculateOpsPerSec(nodes = []): number {
    if (
      !this.isMetricsAvailable(nodes, 'stats.instantaneous_ops_per_sec', [
        undefined,
      ])
    ) {
      return undefined;
    }

    return sumBy(nodes, (node) =>
      parseInt(get(node, 'stats.instantaneous_ops_per_sec', '0'), 10),
    );
  }

  /**
   * Sum of current network input (instantaneous_input_kbps) for all shards
   * @param nodes
   * @private
   */
  private calculateNetworkIn(nodes = []): number {
    if (
      !this.isMetricsAvailable(nodes, 'stats.instantaneous_input_kbps', [
        undefined,
      ])
    ) {
      return undefined;
    }

    return sumBy(nodes, (node) =>
      parseInt(get(node, 'stats.instantaneous_input_kbps', '0'), 10),
    );
  }

  /**
   * Sum of current network output (instantaneous_output_kbps) for all shards
   * @param nodes
   * @private
   */
  private calculateNetworkOut(nodes = []): number {
    if (
      !this.isMetricsAvailable(nodes, 'stats.instantaneous_output_kbps', [
        undefined,
      ])
    ) {
      return undefined;
    }

    return sumBy(nodes, (node) =>
      parseInt(get(node, 'stats.instantaneous_output_kbps', '0'), 10),
    );
  }

  /**
   * Median of connected clients (connected_clients) to all shards
   * @param nodes
   * @private
   */
  private calculateConnectedClients(nodes = []): number {
    if (
      !this.isMetricsAvailable(nodes, 'clients.connected_clients', [undefined])
    ) {
      return undefined;
    }

    const clientsPerNode = map(nodes, (node) =>
      parseInt(get(node, 'clients.connected_clients', '0'), 10),
    );
    return this.getMedianValue(clientsPerNode);
  }

  /**
   * Sum of used memory (used_memory) for primary shards
   * @param nodes
   * @private
   */
  private calculateUsedMemory(nodes = []): number {
    try {
      const masterNodes =
        DatabaseOverviewProvider.getMasterNodesToWorkWith(nodes);

      if (
        !this.isMetricsAvailable(masterNodes, 'memory.used_memory', [undefined])
      ) {
        return undefined;
      }

      return sumBy(masterNodes, (node) =>
        parseInt(get(node, 'memory.used_memory', '0'), 10),
      );
    } catch (e) {
      return null;
    }
  }

  /**
   * Sum of keys for primary shards
   * In case when shard has multiple logical databases shard total keys = sum of all dbs keys
   * @param nodes
   * @param index
   * @param keyspace
   * @private
   */
  private calculateTotalKeys(
    nodes = [],
    index: number,
    keyspace: DatabaseOverviewKeyspace,
  ): [number, Record<string, number>] {
    try {
      const masterNodes =
        DatabaseOverviewProvider.getMasterNodesToWorkWith(nodes);

      if (!this.isMetricsAvailable(masterNodes, 'keyspace', [undefined])) {
        return [undefined, undefined];
      }

      const totalKeysPerDb: Record<string, number> = {};

      masterNodes.forEach((node) => {
        map(get(node, 'keyspace', {}), (dbKeys, dbNumber): void => {
          const { keys } = convertMultilineReplyToObject(dbKeys, ',', '=');

          if (!totalKeysPerDb[dbNumber]) {
            totalKeysPerDb[dbNumber] = 0;
          }

          totalKeysPerDb[dbNumber] += parseInt(keys, 10);
        });
      });

      const totalKeys = totalKeysPerDb
        ? sum(Object.values(totalKeysPerDb))
        : undefined;
      const dbIndexKeys = totalKeysPerDb[`db${index}`] || 0;
      const calculatedTotalKeysPerDb =
        keyspace === DatabaseOverviewKeyspace.Full
          ? totalKeysPerDb
          : { [`db${index}`]: dbIndexKeys };

      return [
        totalKeys,
        dbIndexKeys === totalKeys ? undefined : calculatedTotalKeysPerDb,
      ];
    } catch (e) {
      return [null, null];
    }
  }

  private async calculateNodesTotalKeys(client: RedisClient): Promise<number> {
    const nodesTotal: number[] = await Promise.all(
      (await client.nodes(RedisClientNodeRole.PRIMARY)).map(async (node) =>
        getTotalKeys(node),
      ),
    );
    return nodesTotal.reduce((prev, cur) => prev + cur, 0);
  }

  /**
   * Calculates maximum CPU percentage based on number of nodes/shards
   * For clusters: max = number of primary nodes * 100% (always returned, no cap)
   * For standalone: detect I/O threads via CONFIG GET (no estimation)
   *
   * Example of calculation:
   * 1 standalone: 1 * 100 = 100%
   * 2 shards: 2 * 100 = 200%
   * 4 threads: 4 * 100 = 400%
   */
  private async calculateMaxCpuPercentage(
    client: RedisClient,
  ): Promise<number | undefined> {
    // For cluster, return the number of primary nodes * 100%
    if (client.getConnectionType() === RedisClientConnectionType.CLUSTER) {
      try {
        const primaryNodes = await client.nodes(RedisClientNodeRole.PRIMARY);
        const maxCpu = primaryNodes.length * 100;

        return maxCpu;
      } catch (error) {
        // If we can't get nodes, fall through to standalone logic
        this.logger.warn(
          'Error occurred when trying to calculate max CPU usage percentage for cluster',
          error,
        );
      }
    }

    // For standalone, detect I/O threads via CONFIG GET
    try {
      const ioThreadsResult = await client.call(
        ['config', 'get', 'io-threads'],
        {
          replyEncoding: 'utf8',
        },
      );

      const ioThreads = parseInt(ioThreadsResult?.[1] || '1', 10);

      return ioThreads * 100;
    } catch (error) {
      this.logger.warn(
        'Error occurred when trying to calculate max CPU usage percentage',
        error,
      );
    }

    return undefined;
  }

  /**
   * Calculates sum of cpu usage in percentage for all shards
   * CPU% = ((used_cpu_sys_t2+used_cpu_user_t2)-(used_cpu_sys_t1+used_cpu_user_t1)) / (t2-t1)
   *
   * Example of calculation:
   * Shard 1 CPU: 55%
   * Shard 2 CPU: 15%
   * Shard 3 CPU: 50%
   * Total displayed: 120% (55%+15%+50%).
   * @param id
   * @param nodes
   * @private
   */
  private calculateCpuUsage(id: string, nodes = []): number {
    if (
      !this.isMetricsAvailable(nodes, 'cpu.used_cpu_sys', [
        0,
        '0',
        '0.0',
        '0.00',
        undefined,
      ])
    ) {
      return undefined;
    }

    const previousCpuStats = this.previousCpuStats.get(id);

    const currentCpuStats = keyBy(
      map(nodes, (node) => ({
        node: `${node.host}:${node.port}`,
        cpuSys: parseFloat(get(node, 'cpu.used_cpu_sys')),
        cpuUser: parseFloat(get(node, 'cpu.used_cpu_user')),
        upTime: parseFloat(get(node, 'server.uptime_in_seconds')),
      })),
      'node',
    );

    this.previousCpuStats.set(id, currentCpuStats);

    // return null as it is impossible to calculate percentage without previous results
    if (!previousCpuStats) {
      return null;
    }
    return sum(
      map(currentCpuStats, (current) => {
        const previous = previousCpuStats[current.node];
        if (
          !previous ||
          previous.upTime >= current.upTime // in case when server was restarted or too often requests
        ) {
          return 0;
        }

        const currentUsage = current.cpuUser + current.cpuSys;
        const previousUsage = previous.cpuUser + previous.cpuSys;
        const timeDelta = current.upTime - previous.upTime;

        const usage = ((currentUsage - previousUsage) / timeDelta) * 100;

        // let's return 0 in case of incorrect data retrieved from redis
        if (usage < 0) {
          return 0;
        }

        return usage;
      }),
    );
  }

  /**
   * Check that metric has expected value or provided
   *
   * @param nodes
   * @param path
   * @param values
   * @private
   */
  private isMetricsAvailable(
    nodes = [],
    path: string[] | string,
    values: any[],
  ): boolean {
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];

      if (values.includes(get(node, path))) {
        return false;
      }
    }

    return true;
  }

  static getMasterNodesToWorkWith(nodes = []): any[] {
    let masterNodes = nodes;

    if (nodes?.length > 1) {
      masterNodes = filter(nodes, (node) =>
        ['master', undefined].includes(get(node, 'replication.role')),
      );
    }

    return masterNodes;
  }
}
