/**
 * Parses Redis REPL info responses to object
 * @param data
 */
export const parseReplToObject = (data: string): Record<string, any> => {
  try {
    const obj = {};

    data.split('\r\n').map((line) => {
      if (!line) return;

      const fields = line.match(/^(.+):(.+)$/);
      fields ? (obj[fields[1]] = fields[2]) : null;
    });

    return obj;
  } catch (e) {
    console.error('Error when trying to parse REPL object response', e);
    return {};
  }
};

/**
 * Parses Redis REPL cluster nodes command response
 * @param data
 */
export const parseClusterNodesResponse = (
  data: string,
): Record<string, any>[] => {
  try {
    const nodes = [];

    data.split('\n').map((line) => {
      if (!line) return;

      const fields = line.split(' ');
      const [id, endpoint, , master, , , , linkState, slot] = fields;
      nodes.push({
        id,
        host: endpoint.split(':')[0],
        port: parseInt(endpoint.split(':')[1].split('@')[0], 10),
        replicaOf: master !== '-' ? master : undefined,
        linkState,
        slot,
      });
    });

    return nodes;
  } catch (e) {
    console.error('Error when trying to parse REPL array response', e);
    return [];
  }
};
