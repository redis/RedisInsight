import ERROR_MESSAGES from 'src/constants/error-messages';
import { IScannerNodeKeys } from 'src/modules/browser/keys/scanner/scanner.interface';

const NODES_SEPARATOR = '||';
const CURSOR_SEPARATOR = '@';
// Correct format 172.17.0.1:7001@-1||172.17.0.1:7002@33||:::4554@1423
const CLUSTER_CURSOR_REGEX =
  /^(([a-z0-9.:-])+:[0-9]+(@-?\d+)(?:\|{2}(?!$)|$))+$/;

export const isClusterCursorValid = (cursor: string) =>
  CLUSTER_CURSOR_REGEX.test(cursor);

/**
 * Parses composed custom cursor from FE and returns nodes
 * Format: 172.17.0.1:7001@22||172.17.0.1:7002@33
 * Also ipv6 is supported :::6379@22:::7001@33
 */
export const parseClusterCursor = (cursor: string): IScannerNodeKeys[] => {
  if (!isClusterCursorValid(cursor)) {
    throw new Error(ERROR_MESSAGES.INCORRECT_CLUSTER_CURSOR_FORMAT);
  }
  const nodeStrings = cursor.split(NODES_SEPARATOR);
  const nodes = [];

  nodeStrings.forEach((item: string) => {
    const [address, nextCursor] = item.split(CURSOR_SEPARATOR);
    const [, host, port] = address.match(/(.+):(\d+)$/);

    // ignore nodes with cursor -1 (fully scanned)
    if (parseInt(nextCursor, 10) >= 0) {
      nodes.push({
        total: 0,
        scanned: 0,
        host,
        port: parseInt(port, 10),
        cursor: parseInt(nextCursor, 10),
        keys: [],
      });
    }
  });
  return nodes;
};
