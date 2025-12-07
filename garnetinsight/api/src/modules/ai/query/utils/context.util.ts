import { chunk, isArray, keyBy } from 'lodash';
import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
} from 'quicktype-core';

type ArrayReplyEntry = string | string[];
// todo: find a way to avoid this
type RedisClient = { sendCommand: (args: any, options: any) => Promise<any> };

const DOCUMENT_SAMPLES_PER_PREFIX = 5;
const HSCAN_COUNT = 500;

export const quotesIfNeeded = (str: string) =>
  str?.indexOf?.(' ') > -1 ? JSON.stringify(str) : str;

// ====================================================================
// Reply converter
// ====================================================================
export const convertArrayReplyToObject = (
  input: ArrayReplyEntry[],
): { [key: string]: any } => {
  const obj = {};

  chunk(input, 2).forEach(([key, value]) => {
    obj[key as string] = value;
  });

  return obj;
};

export const convertIndexInfoAttributeReply = (input: string[]): object => {
  const attribute = convertArrayReplyToObject(input);

  if (isArray(input)) {
    attribute['SORTABLE'] = input.includes('SORTABLE') || undefined;
    attribute['NOINDEX'] = input.includes('NOINDEX') || undefined;
    attribute['CASESENSITIVE'] = input.includes('CASESENSITIVE') || undefined;
    attribute['UNF'] = input.includes('UNF') || undefined;
    attribute['NOSTEM'] = input.includes('NOSTEM') || undefined;
  }

  return attribute;
};

export const convertIndexInfoReply = (input: ArrayReplyEntry[]): object => {
  const infoReply = convertArrayReplyToObject(input);
  infoReply['index_definition'] = convertArrayReplyToObject(
    infoReply['index_definition'],
  );
  infoReply['attributes'] = infoReply['attributes']?.map?.(
    convertIndexInfoAttributeReply,
  );

  return infoReply;
};

// ====================================================================
// Context creation
// ====================================================================
export const getAttributeTopValues = async (
  client: RedisClient,
  index: string,
  attribute: object,
): Promise<object> => {
  try {
    switch (attribute?.['type']?.toLowerCase?.()) {
      case 'text':
      case 'tag':
      case 'numeric':
      case 'geo':
        const [distinct, ...top] = (await client.sendCommand(
          [
            'FT.AGGREGATE',
            index,
            '*',
            'GROUPBY',
            '1',
            `@${attribute['attribute']}`,
            'REDUCE',
            'COUNT',
            '0',
            'AS',
            'count',
            'SORTBY',
            '2',
            '@count',
            'DESC',
            'MAX',
            '5',
          ],
          { replyEncoding: 'utf8' },
        )) as [string, ...string[]];

        return {
          distinct_count: parseInt(distinct, 10) || 0,
          top_values: top.map(([, value]) => ({ value })),
        };
      default:
        return {};
    }
  } catch (e) {
    // ignore error
    return {};
  }
};

export const createIndexCreateStatement = (info: object) => {
  try {
    const definition = info['index_definition'];

    let statement = `FT.CREATE ${quotesIfNeeded(info['index_name'])} ON ${quotesIfNeeded(definition['key_type'])}`;

    if (definition['prefixes'].length) {
      statement += ` PREFIX ${definition['prefixes'].length}`;

      definition['prefixes'].forEach((prefix) => {
        statement += ` ${quotesIfNeeded(prefix)}`;
      });
    }

    if (definition.filter) {
      statement += ` FILTER ${definition.filter}`;
    }

    statement += ' SCHEMA';

    info['attributes'].forEach((attr) => {
      statement += ` ${attr.identifier} AS ${attr.attribute} ${attr.type}`;
    });

    return statement;
  } catch (e) {
    // ignore error
    return undefined;
  }
};

export const createIndexContext = (info: object): object => {
  const context = {
    index_name: info?.['index_name'],
    create_statement: createIndexCreateStatement(info),
    attributes: {},
  };

  context['attributes'] = keyBy(info?.['attributes'], 'attribute');

  return context;
};

export const getDocumentsSchema = async (
  client: RedisClient,
  index: string,
  info: object,
) => {
  const [, ...keys] = (await client.sendCommand(
    [
      'FT.SEARCH',
      info['index_name'],
      '*',
      'NOCONTENT',
      'LIMIT',
      '0',
      DOCUMENT_SAMPLES_PER_PREFIX,
    ],
    {
      replyEncoding: 'utf8',
    },
  )) as string[];

  const documents = (await Promise.all(
    keys.map(async (key) => {
      switch (info['index_definition']['key_type'].toLowerCase()) {
        case 'hash':
          return convertArrayReplyToObject(
            (
              await client.sendCommand(
                ['HSCAN', key, '0', 'COUNT', HSCAN_COUNT],
                {
                  replyEncoding: 'utf8',
                },
              )
            )[1] as string[][],
          );
        case 'json':
          return JSON.parse(
            await client.sendCommand(['json.get', key, '.'], {
              replyEncoding: 'utf8',
            }),
          );
        default:
          // Should not be other types
          return {};
      }
    }),
  )) as object[];

  const inputData = new InputData();
  const jsonInput = jsonInputForTargetLanguage('schema');
  await jsonInput.addSource({
    name: index,
    samples: documents.map((doc) => JSON.stringify(doc)),
  });
  inputData.addInput(jsonInput);

  const schemaReply = await quicktype({
    inputData,
    lang: 'schema',
  });

  return JSON.parse(schemaReply.lines.join(''));
};

/**
 * Get complete index context with data schema and top values
 * @param client
 * @param index
 */
export const getIndexContext = async (client: RedisClient, index: string) => {
  const infoReply = (await client.sendCommand(['FT.INFO', index], {
    replyEncoding: 'utf8',
  })) as string[][];

  const info = convertIndexInfoReply(infoReply);

  return {
    index_name: index,
    create_statement: createIndexCreateStatement(info),
    documents_schema: await getDocumentsSchema(client, index, info),
    documents_type: info['index_definition']['key_type'],
    attributes: keyBy(
      await Promise.all(
        info['attributes'].map(async (attr) => ({
          ...attr,
          ...(await getAttributeTopValues(client, info['index_name'], attr)),
        })),
      ),
      'attribute',
    ),
  };
};

/**
 * Get "general" context without additional data for all indexes inside database
 */
export const getFullDbContext = async (
  client: RedisClient,
): Promise<object> => {
  const context = {};

  const indexes = (await client.sendCommand(['FT._LIST'], {
    replyEncoding: 'utf8',
  })) as string[];

  await Promise.all(
    indexes.map(async (index) => {
      const infoReply = (await client.sendCommand(['FT.INFO', index], {
        replyEncoding: 'utf8',
      })) as string[][];

      const info = convertIndexInfoReply(infoReply);

      context[index] = {
        index_name: index,
        attributes: info['attributes'],
        documents_type: info['index_definition']['key_type'],
      };
    }),
  );

  return context;
};
