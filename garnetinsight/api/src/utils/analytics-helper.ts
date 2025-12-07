import { includes, isNil, map } from 'lodash';
import { convertArrayReplyToObject } from 'src/modules/redis/utils/reply.util';

export const TOTAL_KEYS_BREAKPOINTS = [
  500000, 1000000, 10000000, 50000000, 100000000, 1000000000,
];

export const SCAN_THRESHOLD_BREAKPOINTS = [5000, 10000, 50000, 100000, 1000000];

export const BULK_ACTIONS_BREAKPOINTS = [5000, 10000, 50000, 100000, 1000000];

const numberWithSpaces = (x: number): string =>
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export const getRangeForNumber = (
  value: number,
  breakpoints: number[] = TOTAL_KEYS_BREAKPOINTS,
): string => {
  if (isNil(value)) {
    return undefined;
  }
  const index = breakpoints.findIndex(
    (threshold: number) => value <= threshold,
  );
  if (index === 0) {
    return `0 - ${numberWithSpaces(breakpoints[0])}`;
  }
  if (index === -1) {
    const lastItem = breakpoints[breakpoints.length - 1];
    return `${numberWithSpaces(lastItem + 1)} +`;
  }
  return `${numberWithSpaces(
    breakpoints[index - 1] + 1,
  )} - ${numberWithSpaces(breakpoints[index])}`;
};

export const calculateRedisHitRatio = (
  keyspaceHits: string | number,
  keyspaceMisses: string | number,
): number => {
  try {
    if (isNil(keyspaceHits) || isNil(keyspaceMisses)) {
      return undefined;
    }
    const keyspaceHitsValue = +keyspaceHits;
    const keyspaceMissesValue = +keyspaceMisses;
    if (keyspaceHitsValue === 0) {
      return 1;
    }
    const result =
      keyspaceHitsValue / (keyspaceHitsValue + keyspaceMissesValue);
    return Number.isNaN(result) ? undefined : result;
  } catch (error) {
    return undefined;
  }
};

export const getIsPipelineEnable = (size: number): boolean => size > 1;

export const getAnalyticsDataFromIndexInfo = (reply: string[]): object => {
  const analyticsData = {};

  try {
    const replyInfo = convertArrayReplyToObject(reply, { utf: true });
    const definition = convertArrayReplyToObject(replyInfo.index_definition, {
      utf: true,
    });

    analyticsData['key_type'] = definition?.key_type;
    analyticsData['default_score'] = definition?.default_score;
    analyticsData['num_docs'] = replyInfo?.num_docs;
    analyticsData['max_doc_id'] = replyInfo?.max_doc_id;
    analyticsData['num_terms'] = replyInfo?.num_terms;
    analyticsData['num_records'] = replyInfo?.num_records;
    analyticsData['total_indexing_time'] = replyInfo?.total_indexing_time;
    analyticsData['number_of_uses'] = replyInfo?.number_of_uses;
    analyticsData['cleaning'] = replyInfo?.cleaning;

    if (replyInfo.dialect_stats) {
      analyticsData['dialect_stats'] = convertArrayReplyToObject(
        replyInfo.dialect_stats,
        { utf: true },
      );
    }

    analyticsData['attributes'] = map(replyInfo?.attributes, (attr) => {
      const attrArray = map(attr, (str) => str.toString().toLowerCase());
      const attrObject = convertArrayReplyToObject(attr, { utf: true });

      return {
        type: attrObject?.['type'],
        weight: attrObject?.['weight'] || undefined,
        phonetic: attrObject?.['phonetic'] || undefined,
        sortable: includes(attrArray, 'sortable') || undefined,
        nostem: includes(attrArray, 'nostem') || undefined,
        unf: includes(attrArray, 'unf') || undefined,
        noindex: includes(attrArray, 'noindex') || undefined,
        casesensitive: includes(attrArray, 'casesensitive') || undefined,
      };
    });

    return analyticsData;
  } catch (e) {
    // ignore errors
    return null;
  }
};
