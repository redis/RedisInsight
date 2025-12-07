import { isInteger, isString, isNumber, isNaN } from 'lodash';

export const convertIntToSemanticVersion = (input: number): string => {
  const separator = '.';
  try {
    if (isInteger(input) && input > 0) {
      // Pad input with optional zero symbols
      const version = String(input).padStart(6, '0');
      const patch = parseInt(version.slice(-2), 10);
      const minor = parseInt(version.slice(-4, -2), 10);
      const major = parseInt(version.slice(0, -4), 10);
      return [major, minor, patch].join(separator);
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
};

export const convertStringToNumber = (
  value: any,
  defaultValue?: number,
): number => {
  if (isNumber(value)) {
    return value;
  }

  if (!isString(value) || !value) {
    return defaultValue;
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    return defaultValue;
  }

  return num;
};

export const convertAnyStringToPositiveInteger = (str: string) => {
  if (!isString(str) || !str.length) {
    return -1;
  }

  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + char;
    // eslint-disable-next-line no-bitwise
    hash |= 0;
  }
  return Math.abs(hash);
};
