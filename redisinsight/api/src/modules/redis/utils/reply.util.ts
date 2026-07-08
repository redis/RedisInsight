import { chunk, isArray } from 'lodash';
import { IRedisClusterNode } from 'src/models';

/**
 * Converts array of strings to object when each even element is a key and odd is a value
 * @Input
 * ```
 * [
 *   "name",
 *   "sentinel-group",
 *   "ip",
 *   "172.30.100.1",
 * ]
 * ```
 * @Output
 * ```
 * {
 *   name: "sentinel-group",
 *   ip: "172.30.100.1"
 * }
 * ```
 * @param input
 * @param options
 */
export const convertArrayReplyToObject = (
  input: string[],
  options: { utf?: boolean } = {},
): { [key: string]: any } =>
  chunk(input, 2).reduce((prev: any, current: string[]) => {
    const [key, value] = current;
    return {
      ...prev,
      [key.toString().toLowerCase()]:
        options.utf && !isArray(value) ? value?.toString() : value,
    };
  }, {});

/**
 * Based on separators converts multiline RESP reply to object
 * In case of any error will return empty object
 *
 * @Input
 * ```
 * cluster_slots_assigned:16384\r\n
 * cluster_slots_ok:16384\r\n
 * cluster_slots_pfail:0\r\n
 * ```
 * @Output
 * ```
 * {
 *  cluster_slots_assigned: '16384',
 *  cluster_slots_ok: '0',
 *  cluster_slots_pfail: '0'
 * }
 * ```
 * @param info
 * @param lineSeparator
 * @param valueSeparator
 */
export const convertMultilineReplyToObject = (
  info: string,
  lineSeparator = '\r\n',
  valueSeparator = ':',
): Record<string, string> => {
  try {
    const lines = info.split(lineSeparator);
    const obj = {};

    lines.forEach((line: string) => {
      if (line && line.split) {
        const keyValuePair = line.split(valueSeparator);
        if (keyValuePair.length > 1) {
          const key = keyValuePair.shift();
          obj[key] = keyValuePair.join(valueSeparator);
        }
      }
    });

    return obj;
  } catch (e) {
    return {};
  }
};

/**
 * Parse and return all endpoints from the nodes list returned by "cluster info" command
 * Since Redis 7.0 the endpoint field may also carry a client-facing hostname
 * (`ip:port@cport[,hostname[,aux_field=aux_value]*]`), announced via
 * `cluster-announce-hostname`. Managed/hosted clusters commonly sit behind
 * per-node load balancers or NAT where the raw IP is not routable to clients,
 * so the hostname (when present) is parsed out separately and should be
 * preferred over the raw IP when establishing connections.
 * @Input
 * ```
 * 08418e3514990489e48fa05d642efc33e205f5 172.31.100.211:6379@16379 myself,master - 0 1698694904000 1 connected 0-5460
 * d2dee846c715a917ec9a4963e8885b06130f9f 172.31.100.212:6379@16379 master - 0 1698694905285 2 connected 5461-10922
 * 3e92457ab813ad7a62dacf768ec7309210feaf [2001:db8::1]:7001@17001 master - 0 1698694906000 3 connected 10923-16383
 * 41ae438fc3ba52a13f40ed67841d463f8bd1ec 10.0.161.40:7379@16379,node-1.example.com master - 0 1698694907000 4 connected 10923-16383
 * ```
 * @Output
 * ```
 * [
 *   {
 *     host: "172.31.100.211",
 *     port: 6379
 *   },
 *   {
 *     host: "172.31.100.212",
 *     port: 6379
 *   },
 *   {
 *     host: "2001:db8::1",
 *     port: 7001
 *   },
 *   {
 *     host: "10.0.161.40",
 *     hostname: "node-1.example.com",
 *     port: 7379
 *   }
 * ]
 * ```
 * @param info
 */
export const parseNodesFromClusterInfoReply = (
  info: string,
): IRedisClusterNode[] => {
  try {
    const lines = info.split('\n');
    const nodes = [];
    lines.forEach((line: string) => {
      if (line && line.split) {
        // fields = [id, endpoint, flags, master, pingSent, pongRecv, configEpoch, linkState, slot]
        const fields = line.split(' ');
        const [id, endpoint, , master, , , , linkState, slot] = fields;

        // endpoint = "ip:port@cport[,hostname[,aux_field=aux_value]*]"
        const [ipPortCport, hostname] = endpoint.split(',');

        const hostAndPort = ipPortCport.split('@')[0];
        const lastColonIndex = hostAndPort.lastIndexOf(':');

        const host = hostAndPort.substring(0, lastColonIndex);
        const port = hostAndPort.substring(lastColonIndex + 1);
        nodes.push({
          id,
          host,
          hostname: hostname || undefined,
          port: parseInt(port, 10),
          replicaOf: master !== '-' ? master : undefined,
          linkState,
          slot,
        });
      }
    });
    return nodes;
  } catch (e) {
    return [];
  }
};
