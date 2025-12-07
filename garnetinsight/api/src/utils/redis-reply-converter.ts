import { convertMultilineReplyToObject } from 'src/modules/redis/utils';

export const convertRedisInfoReplyToObject = (info: string): any => {
  try {
    const result = {};
    const sections = info.match(/(?<=#\s+).*?(?=[\n,\r])/g);
    const values = info.split(/#.*?[\n,\r]/g);
    values.shift();
    sections.forEach((section: string, index: number) => {
      result[section.toLowerCase()] = convertMultilineReplyToObject(
        values[index].trim(),
      );
    });
    return result;
  } catch (e) {
    return {};
  }
};
