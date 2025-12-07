const GLOB_SPEC_CHAR = ['!', '*', '?', '[', ']', '(', ')', '{', '}'];
const EXT_GLOB_SPEC_CHAR = ['@', '+'];

export const unescapeGlob = (value: string): string => {
  let result = value;

  [...GLOB_SPEC_CHAR, ...EXT_GLOB_SPEC_CHAR].forEach((char: string) => {
    const regex = new RegExp('\\'.repeat(3) + char, 'g');
    result = result.replace(regex, char);
  });

  return result.replace(/\\{2}/g, '\\');
};

const REDIS_GLOB_SPEC_CHAR = ['?', '*', '[', ']'];
export const unescapeRedisGlob = (value: string): string => {
  let result = value;

  REDIS_GLOB_SPEC_CHAR.forEach((char: string) => {
    const regex = new RegExp('\\'.repeat(3) + char, 'g');
    result = result.replace(regex, char);
  });

  return result.replace(/\\{2}/g, '\\');
};

/**
 * Determines if any character on specific position is escaped
 * @param str
 * @param pos
 */
export const isEscaped = (str: string, pos: number) => {
  let currPos = pos;
  while (currPos > 0 && str[currPos - 1] === '\\') {
    currPos -= 1;
  }

  const escCount = pos - currPos;

  return escCount && escCount % 2 > 0;
};

/**
 * Find first position of unescaped char
 * @param char
 * @param str
 * @param startPosition
 */
const findUnescapedCharPosition = (
  char: string,
  str: string,
  startPosition = 0,
) => {
  let pos = str.indexOf(char, startPosition);
  while (pos >= 0) {
    if (!isEscaped(str, pos)) {
      return pos;
    }

    pos = str.indexOf(char, pos + 1);
  }

  return pos;
};

/**
 * Check if string has at least one unescaped char or sequence of unescaped chars in proper order
 * Supported only 1-char and 2-chars conditions for now
 * @param char
 * @param str
 * @param startPosition
 */
const hasUnescapedChar = (char: string, str: string, startPosition = 0) => {
  if (char.length === 1) {
    return findUnescapedCharPosition(char, str, startPosition) >= 0;
  }

  if (char.length === 2) {
    const firstCharPos = findUnescapedCharPosition(char[0], str, startPosition);
    if (firstCharPos >= 0) {
      return findUnescapedCharPosition(char[1], str, firstCharPos) >= 0;
    }
  }

  return false;
};

export const isRedisGlob = (str: string) =>
  hasUnescapedChar('?', str) ||
  hasUnescapedChar('*', str) ||
  hasUnescapedChar('[]', str);
