import { chunk, isArray } from 'lodash';

type ArrayReplyEntry = string | string[];
const errorField = 'Index Errors';

const infoFieldsToConvert = [
  'index_options',
  'index_definition',
  'gc_stats',
  'cursor_stats',
  'dialect_stats',
  errorField,
];

/**
 * Valueless FT.INFO attribute flags. These appear as standalone tokens in the
 * attribute array (not as key/value pairs), so they must only be matched when
 * the parser is expecting a key — never via array.includes(), which false-positives
 * when a field identifier/alias is literally named the same as a flag.
 */
export const INDEX_INFO_ATTRIBUTE_BOOLEAN_FLAGS = [
  'SORTABLE',
  'NOINDEX',
  'CASESENSITIVE',
  'UNF',
  'NOSTEM',
  'WITHSUFFIXTRIE',
  'INDEXEMPTY',
  'INDEXMISSING',
] as const;

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
  if (!isArray(input)) {
    return {};
  }

  const attribute: Record<string, any> = {};
  let i = 0;

  while (i < input.length) {
    const token = input[i];

    if (
      typeof token === 'string' &&
      (INDEX_INFO_ATTRIBUTE_BOOLEAN_FLAGS as readonly string[]).includes(token)
    ) {
      attribute[token] = true;
      i += 1;
      continue;
    }

    attribute[token as string] = input[i + 1];
    i += 2;
  }

  return attribute;
};

export const convertIndexInfoReply = (input: ArrayReplyEntry[]): object => {
  const infoReply = convertArrayReplyToObject(input);
  infoFieldsToConvert.forEach((field) => {
    infoReply[field] = convertArrayReplyToObject(infoReply[field]);
  });

  infoReply['attributes'] = infoReply['attributes']?.map?.(
    convertIndexInfoAttributeReply,
  );
  infoReply['field statistics'] = infoReply['field statistics']?.map?.(
    (sField) => {
      const convertedField = convertArrayReplyToObject(sField);
      if (
        convertedField[errorField] &&
        Array.isArray(convertedField[errorField])
      ) {
        convertedField[errorField] = convertArrayReplyToObject(
          convertedField[errorField],
        );
      }
      return convertedField;
    },
  );
  return infoReply;
};
