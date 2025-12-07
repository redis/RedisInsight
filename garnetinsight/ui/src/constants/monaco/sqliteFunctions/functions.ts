export default {
  date: {
    summary: 'returns the date as text in this format: YYYY-MM-DD',
    arguments: [
      {
        name: 'time_value',
        type: 'number',
        display_text: 'optional time value',
        optional: false,
      },
      {
        name: 'modifier',
        type: 'string',
        display_text: 'optional one or more modifiers',
        optional: true,
      },
    ],
  },
  time: {
    summary: 'returns the time as text in this format: HH:MM:SS',
    arguments: [
      {
        name: 'time_value',
        type: 'number',
        display_text: 'optional time value',
        optional: false,
      },
      {
        name: 'modifier',
        type: 'string',
        display_text: 'optional one or more modifiers',
        optional: true,
      },
    ],
  },
  datetime: {
    summary:
      'returns the date and time as text in this formats: YYYY-MM-DD HH:MM:SS',
    arguments: [
      {
        name: 'time_value',
        type: 'number',
        display_text: 'optional time value',
        optional: false,
      },
      {
        name: 'modifier',
        type: 'string',
        display_text: 'optional one or more modifiers',
        optional: true,
      },
    ],
  },
  julianday: {
    summary:
      'the fractional number of days since noon in Greenwich on November 24, 4714 B.C.',
    arguments: [
      {
        name: 'time_value',
        type: 'number',
        display_text: 'optional time value',
        optional: false,
      },
      {
        name: 'modifier',
        type: 'string',
        display_text: 'optional one or more modifiers',
        optional: true,
      },
    ],
  },
  unixepoch: {
    summary:
      'returns a unix timestamp - the number of seconds since 1970-01-01 00:00:00 UTC.',
    arguments: [
      {
        name: 'time_value',
        type: 'number',
        display_text: 'optional time value',
        optional: false,
      },
      {
        name: 'modifier',
        type: 'string',
        display_text: 'optional one or more modifiers',
        optional: true,
      },
    ],
  },
  strftime: {
    summary:
      'returns the date formatted according to the format string specified as the first argument. The format string supports the most common substitutions found in the strftime() function from the standard C library plus two new substitutions, %f and %J',
    arguments: [
      {
        name: 'format',
        type: 'string',
        display_text:
          'supports the most common substitutions found in the strftime() function',
        optional: false,
      },
      {
        name: 'time_value',
        type: 'number',
        display_text: 'optional time value',
        optional: false,
      },
      {
        name: 'modifier',
        type: 'string',
        display_text: 'optional one or more modifiers',
        optional: true,
      },
    ],
  },
  timediff: {
    summary:
      'returns a string that describes the amount of time that must be added to B in order to reach time A. The format of the timediff() result is designed to be human-readable. The format is:(+|-)YYYY-MM-DD HH:MM:SS.SSS',
    arguments: [
      {
        name: 'time_value',
        type: 'number',
        display_text: 'time to start from',
        optional: false,
      },
    ],
  },
  avg: {
    summary:
      'returns the average value of all non-NULL X within a group. String and BLOB values that do not look like numbers are interpreted as 0.',
    arguments: [
      {
        name: 'column_name',
        type: 'string',
        display_text: 'column name',
        optional: false,
      },
    ],
  },
  count: {
    summary:
      'returns a count of the number of times that X is not NULL in a group.',
    arguments: [
      {
        name: 'column_name',
        type: 'string',
        display_text: 'column name',
        optional: false,
      },
    ],
  },
  group_concat: {
    summary:
      "The group_concat() function returns a string which is the concatenation of all non-NULL values of X. If parameter Y is present then it is used as the separator between instances of X.A comma (',') is used as the separator if Y is omitted.",
    arguments: [
      {
        name: 'column_name',
        type: 'string',
        display_text: 'column name',
        optional: false,
      },
      {
        name: 'separator',
        type: 'string',
        display_text: 'separator',
        optional: true,
      },
    ],
  },
  string_agg: {
    summary:
      "The group_concat() function returns a string which is the concatenation of all non-NULL values of X. If parameter Y is present then it is used as the separator between instances of X.A comma (',') is used as the separator if Y is omitted.",
    arguments: [
      {
        name: 'column_name',
        type: 'string',
        display_text: 'column name',
        optional: false,
      },
      {
        name: 'separator',
        type: 'string',
        display_text: 'separator',
        optional: true,
      },
    ],
  },
  sum: {
    summary: 'return the sum of all non-NULL values in the group.',
    arguments: [
      {
        name: 'column_name',
        type: 'string',
        display_text: 'column name',
        optional: false,
      },
    ],
  },
  total: {
    summary: 'return the sum of all non-NULL values in the group.',
    arguments: [
      {
        name: 'column_name',
        type: 'string',
        display_text: 'column name',
        optional: false,
      },
    ],
  },
  abs: {
    summary: 'returns the absolute value of the numeric argument X.',
    arguments: [
      {
        name: 'X',
        type: 'number',
        display_text: 'numeric argument',
        optional: false,
      },
    ],
  },
  char: {
    summary:
      'returns a string composed of characters having the unicode code point values of integers X1 through XN, respectively.',
    arguments: [
      {
        name: 'X1, X2, ..., XN',
        type: 'number',
        display_text: 'unicode code point values',
        optional: false,
      },
    ],
  },
  coalesce: {
    summary:
      'returns a copy of its first non-NULL argument, or NULL if all arguments are NULL. Coalesce() must have at least 2 arguments.',
    arguments: [
      {
        name: 'X, Y, ...',
        type: 'any',
        display_text: 'arguments to evaluate',
        optional: false,
      },
    ],
  },
  concat: {
    summary:
      'returns a string which is the concatenation of the string representation of all of its non-NULL arguments. If all arguments are NULL, then concat() returns an empty string.',
    arguments: [
      {
        name: 'X, ...',
        type: 'any',
        display_text: 'arguments to concatenate',
        optional: false,
      },
    ],
  },
  concat_ws: {
    summary:
      'returns a string that is the concatenation of all non-null arguments beyond the first argument, using the text value of the first argument as a separator.',
    arguments: [
      {
        name: 'SEP',
        type: 'string',
        display_text: 'separator',
        optional: false,
      },
      {
        name: 'X, ...',
        type: 'any',
        display_text: 'arguments to concatenate',
        optional: false,
      },
    ],
  },
  format: {
    summary: 'works like printf() function from the standard C library.',
    arguments: [
      {
        name: 'FORMAT, ...',
        type: 'string',
        display_text: 'format string and arguments',
        optional: false,
      },
    ],
  },
  glob: {
    summary: 'function is equivalent to the expression "Y GLOB X".',
    arguments: [
      {
        name: 'X',
        type: 'string',
        display_text: 'pattern',
        optional: false,
      },
      {
        name: 'Y',
        type: 'string',
        display_text: 'string to match',
        optional: false,
      },
    ],
  },
  hex: {
    summary:
      'interprets its argument as a BLOB and returns a string which is the upper-case hexadecimal rendering of the content of that blob.',
    arguments: [
      {
        name: 'X',
        type: 'any',
        display_text: 'value to convert',
        optional: false,
      },
    ],
  },
  ifnull: {
    summary:
      'returns a copy of its first non-NULL argument, or NULL if both arguments are NULL.',
    arguments: [
      {
        name: 'X',
        type: 'any',
        display_text: 'first argument',
        optional: false,
      },
      {
        name: 'Y',
        type: 'any',
        display_text: 'second argument',
        optional: false,
      },
    ],
  },
  iif: {
    summary: 'returns the value Y if X is true, and Z otherwise.',
    arguments: [
      {
        name: 'X',
        type: 'any',
        display_text: 'condition',
        optional: false,
      },
      {
        name: 'Y',
        type: 'any',
        display_text: 'value if true',
        optional: false,
      },
      {
        name: 'Z',
        type: 'any',
        display_text: 'value if false',
        optional: false,
      },
    ],
  },
  instr: {
    summary:
      'finds the first occurrence of string Y within string X and returns the number of prior characters plus 1, or 0 if Y is nowhere found within X.',
    arguments: [
      {
        name: 'X',
        type: 'string',
        display_text: 'string to search',
        optional: false,
      },
      {
        name: 'Y',
        type: 'string',
        display_text: 'string to find',
        optional: false,
      },
    ],
  },
  length: {
    summary:
      'returns the number of characters (not bytes) in X prior to the first NUL character.',
    arguments: [
      {
        name: 'X',
        type: 'string',
        display_text: 'string to measure',
        optional: false,
      },
    ],
  },
  like: {
    summary: 'is used to implement the "Y LIKE X [ESCAPE Z]" expression.',
    arguments: [
      {
        name: 'X',
        type: 'string',
        display_text: 'pattern',
        optional: false,
      },
      {
        name: 'Y',
        type: 'string',
        display_text: 'string to match',
        optional: false,
      },
      {
        name: 'Z',
        type: 'string',
        display_text: 'escape character',
        optional: true,
      },
    ],
  },
  likelihood: {
    summary:
      'returns argument X unchanged. The value Y in likelihood(X,Y) must be a floating point constant between 0.0 and 1.0, inclusive.',
    arguments: [
      {
        name: 'X',
        type: 'any',
        display_text: 'value to return',
        optional: false,
      },
      {
        name: 'Y',
        type: 'number',
        display_text: 'likelihood',
        optional: false,
      },
    ],
  },
  likely: {
    summary:
      'returns the argument X unchanged. The likely(X) function is a no-op that the code generator optimizes away so that it consumes no CPU cycles at run-time.',
    arguments: [
      {
        name: 'X',
        type: 'any',
        display_text: 'value to return',
        optional: false,
      },
    ],
  },
  lower: {
    summary:
      'returns a copy of string X with all ASCII characters converted to lower case.',
    arguments: [
      {
        name: 'X',
        type: 'string',
        display_text: 'string to convert',
        optional: false,
      },
    ],
  },
  ltrim: {
    summary:
      'returns a string formed by removing any and all characters that appear in Y from the left side of X.',
    arguments: [
      {
        name: 'X',
        type: 'string',
        display_text: 'string to trim',
        optional: false,
      },
      {
        name: 'Y',
        type: 'string',
        display_text: 'characters to remove',
        optional: true,
      },
    ],
  },
  max: {
    summary:
      'returns the argument with the maximum value, or return NULL if any argument is NULL.',
    arguments: [
      {
        name: 'X, Y, ...',
        type: 'any',
        display_text: 'arguments to compare',
        optional: false,
      },
    ],
  },
  min: {
    summary:
      'returns the argument with the minimum value. The multi-argument min() function searches its arguments from left to right for an argument that defines a collating function and uses that collating function for all string comparisons.',
    arguments: [
      {
        name: 'X, Y, ...',
        type: 'any',
        display_text: 'arguments to compare',
        optional: false,
      },
    ],
  },
  nullif: {
    summary:
      'returns its first argument if the arguments are different and NULL if the arguments are the same. The nullif(X,Y) function searches its arguments from left to right for an argument that defines a collating function and uses that collating function for all string comparisons. If neither argument to nullif() defines a collating function then the BINARY collating function is used.',
    arguments: [
      {
        name: 'X',
        type: 'any',
        display_text: 'first argument',
        optional: false,
      },
      {
        name: 'Y',
        type: 'any',
        display_text: 'second argument',
        optional: false,
      },
    ],
  },
  octet_length: {
    summary:
      'returns the number of bytes in the encoding of text string X. If X is NULL then octet_length(X) returns NULL. If X is a BLOB value, then octet_length(X) is the same as length(X). If X is a numeric value, then octet_length(X) returns the number of bytes in a text rendering of that number.',
    arguments: [
      {
        name: 'X',
        type: 'any',
        display_text: 'value to measure',
        optional: false,
      },
    ],
  },
  printf: {
    summary: 'is an alias for the format() SQL function.',
    arguments: [
      {
        name: 'FORMAT, ...',
        type: 'string',
        display_text: 'format string and arguments',
        optional: false,
      },
    ],
  },
  quote: {
    summary:
      'returns the text of an SQL literal which is the value of its argument suitable for inclusion into an SQL statement. Strings are surrounded by single-quotes with escapes on interior quotes as needed. BLOBs are encoded as hexadecimal literals. Strings with embedded NUL characters cannot be represented as string literals in SQL and hence the returned string literal is truncated prior to the first NUL.',
    arguments: [
      {
        name: 'X',
        type: 'any',
        display_text: 'value to quote',
        optional: false,
      },
    ],
  },
  random: {
    summary:
      'returns a pseudo-random integer between -9223372036854775808 and +9223372036854775807.',
    arguments: [],
  },
  randomblob: {
    summary:
      'The randomblob(N) function return an N-byte blob containing pseudo-random bytes. If N is less than 1 then a 1-byte random blob is returned.',
    arguments: [
      {
        name: 'N',
        type: 'number',
        display_text: 'number of bytes',
        optional: false,
      },
    ],
  },
  replace: {
    summary:
      'returns a string formed by substituting string Z for every occurrence of string Y in string X.',
    arguments: [
      {
        name: 'X',
        type: 'string',
        display_text: 'original string',
        optional: false,
      },
      {
        name: 'Y',
        type: 'string',
        display_text: 'string to replace',
        optional: false,
      },
      {
        name: 'Z',
        type: 'string',
        display_text: 'replacement string',
        optional: false,
      },
    ],
  },
  round: {
    summary:
      'returns a floating-point value X rounded to Y digits to the right of the decimal point. If the Y argument is omitted or negative, it is taken to be 0.',
    arguments: [
      {
        name: 'X',
        type: 'number',
        display_text: 'value to round',
        optional: false,
      },
      {
        name: 'Y',
        type: 'number',
        display_text: 'number of digits',
        optional: true,
      },
    ],
  },
  rtrim: {
    summary:
      'returns a string formed by removing any and all characters that appear in Y from the right side of X. If the Y argument is omitted, rtrim(X) removes spaces from the right side of X.',
    arguments: [
      {
        name: 'X',
        type: 'string',
        display_text: 'string to trim',
        optional: false,
      },
      {
        name: 'Y',
        type: 'string',
        display_text: 'characters to remove',
        optional: true,
      },
    ],
  },
  sign: {
    summary:
      'returns -1, 0, or +1 if the argument X is a numeric value that is negative, zero, or positive, respectively. If the argument to sign(X) is NULL or is a string or blob that cannot be losslessly converted into a number, then sign(X) returns NULL.',
    arguments: [
      {
        name: 'X',
        type: 'number',
        display_text: 'value to evaluate',
        optional: false,
      },
    ],
  },
  soundex: {
    summary: 'returns a string that is the soundex encoding of the string X.',
    arguments: [
      {
        name: 'X',
        type: 'string',
        display_text: 'string to encode',
        optional: false,
      },
    ],
  },
  substr: {
    summary:
      'returns a substring of input string X that begins with the Y-th character and which is Z characters long. If Z is omitted then substr(X,Y) returns all characters through the end of the string X beginning with the Y-th. The left-most character of X is number 1. If Y is negative then the first character of the substring is found by counting from the right rather than the left. If Z is negative then the abs(Z) characters preceding the Y-th character are returned. If X is a string then characters indices refer to actual UTF-8 characters. If X is a BLOB then the indices refer to bytes.',
    arguments: [
      {
        name: 'X',
        type: 'string',
        display_text: 'original string',
        optional: false,
      },
      {
        name: 'Y',
        type: 'number',
        display_text: 'start position',
        optional: false,
      },
      {
        name: 'Z',
        type: 'number',
        display_text: 'length',
        optional: true,
      },
    ],
  },
  trim: {
    summary:
      'function returns a string formed by removing any and all characters that appear in Y from both ends of X. If the Y argument is omitted, trim(X) removes spaces from both ends of X.',
    arguments: [
      {
        name: 'X',
        type: 'string',
        display_text: 'string to trim',
        optional: false,
      },
      {
        name: 'Y',
        type: 'string',
        display_text: 'characters to remove',
        optional: true,
      },
    ],
  },
  unhex: {
    summary:
      'returns a BLOB value which is the decoding of the hexadecimal string X. If X contains any characters that are not hexadecimal digits and which are not in Y, then unhex(X,Y) returns NULL. If Y is omitted, it is understood to be an empty string and hence X must be a pure hexadecimal string.',
    arguments: [
      {
        name: 'X',
        type: 'string',
        display_text: 'hexadecimal string',
        optional: false,
      },
      {
        name: 'Y',
        type: 'string',
        display_text: 'allowed characters',
        optional: true,
      },
    ],
  },
  unicode: {
    summary:
      'function returns the numeric unicode code point corresponding to the first character of the string X.',
    arguments: [
      {
        name: 'X',
        type: 'string',
        display_text: 'string to evaluate',
        optional: false,
      },
    ],
  },
  unlikely: {
    summary: 'returns the argument X unchanged.',
    arguments: [
      {
        name: 'X',
        type: 'any',
        display_text: 'value to return',
        optional: false,
      },
    ],
  },
  upper: {
    summary:
      'returns a copy of input string X in which all lower-case ASCII characters are converted to their upper-case equivalent.',
    arguments: [
      {
        name: 'X',
        type: 'string',
        display_text: 'string to convert',
        optional: false,
      },
    ],
  },
  zeroblob: {
    summary: 'returns a BLOB consisting of N bytes of 0x00.',
    arguments: [
      {
        name: 'N',
        type: 'number',
        display_text: 'number of bytes',
        optional: false,
      },
    ],
  },
}
