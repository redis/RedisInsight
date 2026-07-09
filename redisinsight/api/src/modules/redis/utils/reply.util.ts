import { chunk, isArray } from 'lodash';
import { IRedisClusterNodeAddress } from 'src/models';

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
 * The `?` endpoint marker Redis returns for a misconfigured node (preferred
 * endpoint type is `hostname` but no `cluster-announce-hostname` is set).
 * Per the spec this must NOT be treated the same as an unknown ("connect to
 * the same host used to send the command") endpoint - the node may not be
 * the one that served the command at all.
 * See https://redis.io/docs/latest/commands/cluster-slots/ and
 * https://redis.io/docs/latest/commands/cluster-shards/
 */
export const UNKNOWN_ENDPOINT_MARKER = '?';

/**
 * Resolve the address to use for a node from Redis's own "preferred
 * endpoint" (`CLUSTER SLOTS` / `CLUSTER SHARDS`), which is already resolved
 * server-side according to the `cluster-preferred-endpoint-type` config
 * (`ip` | `hostname` | `unknown-endpoint`). Clients must use this value
 * as-is rather than re-deriving an ip-vs-hostname preference themselves,
 * since a node may announce a hostname purely as metadata while the server
 * is actually configured to prefer the ip (or vice versa).
 *
 * Handles the endpoint field's documented abnormal values:
 * - `null` / `''`: unknown endpoint - resolves to `fallbackHost` (the host
 *   used to send the command).
 * - `'?'`: misconfigured node - the spec explicitly warns this may not be
 *   the same node that served the command, so `undefined` is returned
 *   instead of guessing; callers decide how to handle an unresolvable node.
 * @param endpoint
 * @param fallbackHost
 */
export const resolvePreferredEndpoint = (
  endpoint: string | null | undefined,
  fallbackHost?: string,
): string | undefined => {
  if (endpoint === UNKNOWN_ENDPOINT_MARKER) {
    return undefined;
  }
  if (!endpoint) {
    return fallbackHost || undefined;
  }
  return endpoint;
};

/**
 * A single node entry within a "CLUSTER SLOTS" slot range:
 * `[preferredEndpoint, port, nodeId, metadata?]`.
 */
export type RedisClusterSlotsNode = [string | null, number, string, unknown?];

/**
 * Raw "CLUSTER SLOTS" reply shape once decoded from RESP into JS values:
 * an array of slot ranges, each `[startSlot, endSlot, ...nodes]`.
 * See https://redis.io/docs/latest/commands/cluster-slots/
 */
export type RedisClusterSlotsReply = Array<
  [number, number, ...RedisClusterSlotsNode[]]
>;

/**
 * Parse the reply of "CLUSTER SLOTS" into a deduplicated list of node
 * addresses (one entry per unique node id across all slot ranges), using
 * each node's server-resolved preferred endpoint (see
 * `resolvePreferredEndpoint`) rather than any raw ip/hostname field.
 *
 * CLUSTER SLOTS is used over the newer CLUSTER SHARDS here for broader
 * compatibility - it has been available since Redis 3.0.0, while CLUSTER
 * SHARDS requires 7.0+.
 *
 * @Input (already parsed into nested arrays, see `RedisClusterSlotsReply`)
 * ```
 * [
 *   [0, 5460, ["10.0.161.40", 7379, "07c37dfe...", []], ["10.0.146.93", 7379, "e7d1eecc...", []]],
 *   ...
 * ]
 * ```
 * @Output
 * ```
 * [
 *   { host: "10.0.161.40", port: 7379 },
 *   { host: "10.0.146.93", port: 7379 }
 * ]
 * ```
 * @param slots
 * @param fallbackHost host used to send the "CLUSTER SLOTS" command, used
 * to resolve nodes with an unknown (`null`/`''`) preferred endpoint
 */
export const parseNodesFromClusterSlotsReply = (
  slots: RedisClusterSlotsReply,
  fallbackHost?: string,
): IRedisClusterNodeAddress[] => {
  try {
    const nodeById = new Map<string, IRedisClusterNodeAddress>();

    slots.forEach((slotRange) => {
      // slotRange = [startSlot, endSlot, master, ...replicas]
      for (let i = 2; i < slotRange.length; i++) {
        const [endpoint, port, id] = slotRange[
          i
        ] as unknown as RedisClusterSlotsNode;
        if (!id || nodeById.has(id)) {
          continue;
        }

        const host = resolvePreferredEndpoint(endpoint, fallbackHost);
        if (!host) {
          // '?' (misconfigured node) - spec says this may not be the same
          // node used to send the command, so don't guess an address.
          continue;
        }

        nodeById.set(id, { host, port });
      }
    });

    return [...nodeById.values()];
  } catch (e) {
    return [];
  }
};
