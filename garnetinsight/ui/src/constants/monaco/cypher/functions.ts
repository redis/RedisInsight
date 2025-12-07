import { monaco as monacoEditor } from 'react-monaco-editor'

export default [
  {
    label: 'all',
    detail:
      '(variable :: VARIABLE IN list :: LIST OF ANY? WHERE predicate :: ANY?) :: (BOOLEAN?)',
    documentation:
      'Returns true if the predicate holds for all elements in the given list.',
  },
  {
    label: 'any',
    detail:
      '(variable :: VARIABLE IN list :: LIST OF ANY? WHERE predicate :: ANY?) :: (BOOLEAN?)',
    documentation:
      'Returns true if the predicate holds for at least one element in the given list.',
  },
  {
    label: 'exists',
    detail: '(input :: ANY?) :: (BOOLEAN?)',
    documentation:
      'Returns true if a match for the pattern exists in the graph, or if the specified property exists in the node, relationship or map.',
  },
  {
    label: 'isEmpty',
    detail: '(input :: LIST? OF ANY? | MAP? | STRING?) :: (BOOLEAN?)',
    documentation: 'Checks whether a list/map/string is empty.',
  },
  {
    label: 'none',
    detail:
      '(variable :: VARIABLE IN list :: LIST OF ANY? WHERE predicate :: ANY?) :: (BOOLEAN?)',
    documentation:
      'Returns true if the predicate holds for no element in the given list.',
  },
  {
    label: 'single',
    detail:
      '(variable :: VARIABLE IN list :: LIST OF ANY? WHERE predicate :: ANY?) :: (BOOLEAN?)',
    documentation:
      'Returns true if the predicate holds for exactly one of the elements in the given list.',
  },
  {
    label: 'coalesce',
    detail: '(input :: ANY?) :: (ANY?)',
    documentation: 'Returns the first non-null value in a list of expressions.',
  },
  {
    label: 'endNode',
    detail: '(input :: RELATIONSHIP?) :: (NODE?)',
    documentation: 'Returns the end node of a relationship.',
  },
  {
    label: 'head',
    detail: '(list :: LIST? OF ANY?) :: (ANY?)',
    documentation: 'Returns the first element in a list.',
  },
  {
    label: 'id',
    detail: '(input :: NODE? | RELATIONSHIP?) :: (INTEGER?)',
    documentation: 'Returns the id of a node/relationship.',
  },
  {
    label: 'last',
    detail: '(list :: LIST? OF ANY?) :: (ANY?)',
    documentation: 'Returns the last element in a list.',
  },
  {
    label: 'length',
    detail: '(input :: PATH?) :: (INTEGER?)',
    documentation: 'Returns the length of a path.',
  },
  {
    label: 'properties',
    detail: '(input :: MAP? | NODE? | RELATIONSHIP?) :: (MAP?)',
    documentation:
      'Returns a map containing all the properties of a map/node/relationship.',
  },
  {
    label: 'randomUUID',
    detail: '() :: (STRING?)',
    documentation: 'Generates a random UUID.',
  },
  {
    label: 'size',
    detail: '(input :: LIST? OF ANY?) :: (INTEGER?)',
    documentation: 'Returns the number of items in a list.',
  },
  {
    label: 'startNode',
    detail: '(input :: RELATIONSHIP?) :: (NODE?)',
    documentation: 'Returns the start node of a relationship.',
  },
  {
    label: 'timestamp',
    detail: '() :: (INTEGER?)',
    documentation:
      'Returns the difference, measured in milliseconds, between the current time and midnight, January 1, 1970 UTC.',
  },
  {
    label: 'toBoolean',
    detail: '(input :: STRING? | BOOLEAN? | INTEGER?) :: (BOOLEAN?)',
    documentation: 'Converts a string value to a boolean value.',
  },
  {
    label: 'toBooleanOrNull',
    detail: '(input :: ANY?) :: (BOOLEAN?)',
    documentation:
      'Converts a value to a boolean value, or null if the value cannot be converted.',
  },
  {
    label: 'toFloat',
    detail: '(input :: NUMBER? | STRING?) :: (FLOAT?)',
    documentation: 'Converts a number value to a floating point value.',
  },
  {
    label: 'toFloatOrNull',
    detail: '(input :: ANY?) :: (FLOAT?)',
    documentation:
      'Converts a value to a floating point value, or null if the value cannot be converted.',
  },
  {
    label: 'toInteger',
    detail: '(input :: NUMBER? | BOOLEAN? | STRING?) :: (INTEGER?)',
    documentation: 'Converts a number value to an integer value.',
  },
  {
    label: 'toIntegerOrNull',
    detail: '(input :: ANY?) :: (INTEGER?)',
    documentation:
      'Converts a value to an integer value, or null if the value cannot be converted.',
  },
  {
    label: 'type',
    detail: '(input :: RELATIONSHIP?) :: (STRING?)',
    documentation:
      'Returns the string representation of the relationship type.',
  },
  {
    label: 'avg',
    detail:
      '(input :: DURATION? | FLOAT? | INTEGER?) :: (DURATION? | FLOAT? | INTEGER?)',
    documentation: 'Returns the average of a set of duration values.',
  },
  {
    label: 'collect',
    detail: '(input :: ANY?) :: (LIST? OF ANY?)',
    documentation:
      'Returns a list containing the values returned by an expression.',
  },
  {
    label: 'count',
    detail: '(input :: ANY?) :: (INTEGER?)',
    documentation: 'Returns the number of values or rows.',
  },
  {
    label: 'max',
    detail: '(input :: ANY?) :: (ANY?)',
    documentation: 'Returns the maximum value in a set of values.',
  },
  {
    label: 'min',
    detail: '(input :: ANY?) :: (ANY?)',
    documentation: 'Returns the minimum value in a set of values.',
  },
  {
    label: 'percentileCont',
    detail: '(input :: FLOAT?, percentile :: FLOAT?) :: (FLOAT?)',
    documentation:
      'Returns the percentile of a value over a group using linear interpolation.',
  },
  {
    label: 'percentileDisc',
    detail:
      '(input :: FLOAT? | INTEGER?, percentile :: FLOAT?) :: (FLOAT? | INTEGER?)',
    documentation:
      'Returns the nearest value to the given percentile over a group using a rounding method.',
  },
  {
    label: 'stDev',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation:
      'Returns the standard deviation for the given value over a group for a sample of a population.',
  },
  {
    label: 'stDevp',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation:
      'Returns the standard deviation for the given value over a group for an entire population.',
  },
  {
    label: 'sum',
    detail:
      '(input :: DURATION? | FLOAT? | INTEGER?) :: (DURATION? | FLOAT? | INTEGER?)',
    documentation: 'Returns the sum of a set of numeric values.',
  },
  {
    label: 'keys',
    detail: '(input :: MAP? | NODE? | RELATIONSHIP?) :: (LIST? OF STRING?)',
    documentation:
      'Returns a list containing the string representations for all the property names of a node, relationship, or map.',
  },
  {
    label: 'labels',
    detail: '(input :: NODE?) :: (LIST? OF STRING?)',
    documentation:
      'Returns a list containing the string representations for all the labels of a node.',
  },
  {
    label: 'nodes',
    detail: '(input :: PATH?) :: (LIST? OF NODE?)',
    documentation: 'Returns a list containing all the nodes in a path.',
  },
  {
    label: 'range',
    detail:
      '(start :: INTEGER?, end :: INTEGER?, step? :: INTEGER?) :: (LIST? OF INTEGER?)',
    documentation:
      'Returns a list comprising all integer values within a specified range.',
  },
  {
    label: 'relationships',
    detail: '(input :: PATH?) :: (LIST? OF RELATIONSHIP?)',
    documentation: 'Returns a list containing all the relationships in a path.',
  },
  {
    label: 'reverse',
    detail: '(input :: LIST? OF ANY?) :: (LIST? OF ANY?)',
    documentation:
      'Returns a list in which the order of all elements in the original list have been reversed.',
  },
  {
    label: 'tail',
    detail: '(input :: LIST? OF ANY?) :: (LIST? OF ANY?)',
    documentation: 'Returns all but the first element in a list.',
  },
  {
    label: 'toBooleanList',
    detail: '(input :: LIST? OF ANY?) :: (LIST? OF BOOLEAN?)',
    documentation:
      'Converts a list of values to a list of boolean values. If any values are not convertible to boolean they will be null in the list returned.',
  },
  {
    label: 'toFloatList',
    detail: '(input :: LIST? OF ANY?) :: (LIST? OF FLOAT?)',
    documentation:
      'Converts a list of values to a list of floating point values. If any values are not convertible to floating point they will be null in the list returned.',
  },
  {
    label: 'toIntegerList',
    detail: '(input :: LIST? OF ANY?) :: (LIST? OF INTEGER?)',
    documentation:
      'Converts a list of values to a list of integer values. If any values are not convertible to integer they will be null in the list returned.',
  },
  {
    label: 'toStringList',
    detail: '(input :: LIST? OF ANY?) :: (LIST? OF STRING?)',
    documentation:
      'Converts a list of values to a list of string values. If any values are not convertible to string they will be null in the list returned.',
  },
  {
    label: 'abs',
    detail: '(input :: FLOAT? | INTEGER?) :: (FLOAT? | INTEGER?)',
    documentation: 'Returns the absolute value of a floating point number.',
  },
  {
    label: 'ceil',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation:
      'Returns the smallest floating point number that is greater than or equal to a number and equal to a mathematical integer.',
  },
  {
    label: 'floor',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation:
      'Returns the largest floating point number that is less than or equal to a number and equal to a mathematical integer.',
  },
  {
    label: 'rand',
    detail: '() :: (FLOAT?)',
    documentation:
      'Returns a random floating point number in the range from 0 (inclusive) to 1 (exclusive); i.e. [0,1).',
  },
  {
    label: 'round',
    detail:
      '(input :: FLOAT?, precision? :: NUMBER?, mode? :: STRING?) :: (FLOAT?)',
    documentation:
      'Returns the value of a number rounded to the nearest integer.',
  },
  {
    label: 'sign',
    detail: '(input :: FLOAT? | INTEGER?) :: (INTEGER?)',
    documentation:
      'Returns the signum of a floating point number: 0 if the number is 0, -1 for any negative number, and 1 for any positive number.',
  },
  {
    label: 'e',
    detail: '() :: (FLOAT?)',
    documentation: 'Returns the base of the natural logarithm, e.',
  },
  {
    label: 'exp',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation:
      'Returns e^n, where e is the base of the natural logarithm, and n is the value of the argument expression.',
  },
  {
    label: 'log',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation: 'Returns the natural logarithm of a number.',
  },
  {
    label: 'log10',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation: 'Returns the common logarithm (base 10) of a number.',
  },
  {
    label: 'sqrt',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation: 'Returns the square root of a number.',
  },
  {
    label: 'acos',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation: 'Returns the arccosine of a number in radians.',
  },
  {
    label: 'asin',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation: 'Returns the arcsine of a number in radians.',
  },
  {
    label: 'atan',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation: 'Returns the arctangent of a number in radians.',
  },
  {
    label: 'atan2',
    detail: '(y :: FLOAT?, x :: FLOAT?) :: (FLOAT?)',
    documentation:
      'Returns the arctangent2 of a set of coordinates in radians.',
  },
  {
    label: 'cos',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation: 'Returns the cosine  of a number.',
  },
  {
    label: 'cot',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation: 'Returns the cotangent of a number.',
  },
  {
    label: 'degrees',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation: 'Converts radians to degrees.',
  },
  {
    label: 'haversin',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation: 'Returns half the versine of a number.',
  },
  {
    label: 'pi',
    detail: '() :: (FLOAT?)',
    documentation: 'Returns the mathematical constant pi.',
  },
  {
    label: 'radians',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation: 'Converts degrees to radians.',
  },
  {
    label: 'sin',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation: 'Returns the sine of a number.',
  },
  {
    label: 'tan',
    detail: '(input :: FLOAT?) :: (FLOAT?)',
    documentation: 'Returns the tangent of a number.',
  },
  {
    label: 'left',
    detail: '(original :: STRING?, length :: INTEGER?) :: (STRING?)',
    documentation:
      'Returns a string containing the specified number of leftmost characters of the original string.',
  },
  {
    label: 'lTrim',
    detail: '(input :: STRING?) :: (STRING?)',
    documentation:
      'Returns the original string with leading whitespace removed.',
  },
  {
    label: 'replace',
    detail:
      '(original :: STRING?, search :: STRING?, replace :: STRING?) :: (STRING?)',
    documentation:
      'Returns a string in which all occurrences of a specified search string in the original string have been replaced by another (specified) replace string.',
  },
  {
    label: 'reverse',
    detail: '(input :: STRING?) :: (STRING?)',
    documentation:
      'Returns a string in which the order of all characters in the original string have been reversed.',
  },
  {
    label: 'right',
    detail: '(original :: STRING?, length :: INTEGER?) :: (STRING?)',
    documentation:
      'Returns a string containing the specified number of rightmost characters of the original string.',
  },
  {
    label: 'rTrim',
    detail: '(input :: STRING?) :: (STRING?)',
    documentation:
      'Returns the original string with trailing whitespace removed.',
  },
  {
    label: 'split',
    detail:
      '(original :: STRING?, splitDelimiter :: STRING? | LIST? OF STRING?) :: (LIST? OF STRING?)',
    documentation:
      'Returns a list of strings resulting from the splitting of the original string around matches of (any) the given delimiter.',
  },
  {
    label: 'substring',
    detail:
      '(original :: STRING?, start :: INTEGER?, length? :: INTEGER?) :: (STRING?)',
    documentation:
      "Returns a substring of (length 'length') the original string, beginning with a 0-based index start.",
  },
  {
    label: 'toLower',
    detail: '(input :: STRING?) :: (STRING?)',
    documentation: 'Returns the original string in lowercase.',
  },
  {
    label: 'toString',
    detail: '(input :: ANY?) :: (STRING?)',
    documentation:
      'Converts an integer, float, boolean, point or temporal type (i.e. Date, Time, LocalTime, DateTime, LocalDateTime or Duration) value to a string.',
  },
  {
    label: 'toStringOrNull',
    detail: '(input :: ANY?) :: (STRING?)',
    documentation:
      'Converts an integer, float, boolean, point or temporal type (i.e. Date, Time, LocalTime, DateTime, LocalDateTime or Duration) value to a string, or null if the value cannot be converted.',
  },
  {
    label: 'toUpper',
    detail: '(input :: STRING?) :: (STRING?)',
    documentation: 'Returns the original string in uppercase.',
  },
  {
    label: 'trim',
    detail: '(input :: STRING?) :: (STRING?)',
    documentation:
      'Returns the original string with leading and trailing whitespace removed.',
  },
] as monacoEditor.languages.CompletionItem[]
