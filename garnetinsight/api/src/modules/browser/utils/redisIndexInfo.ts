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
