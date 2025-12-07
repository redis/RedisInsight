import { isArray, isNull, isString } from 'lodash'
import JSONBigInt from 'json-bigint'
import { JSONScalarValue, ObjectTypes } from '../interfaces'
import styles from '../styles.module.scss'

enum ClassNames {
  string = 'jsonString',
  number = 'jsonNumber',
  object = 'jsonNull',
  boolean = 'jsonBoolean',
  others = 'jsonNonStringPrimitive',
}

export function isScalar(x: JSONScalarValue) {
  return (
    ['string', 'number', 'boolean', 'bigint'].indexOf(typeof x) !== -1 ||
    x === null
  )
}

export const isValidJSON = (value: string): boolean => {
  try {
    JSON.parse(value)
    return true
  } catch (e) {
    return false
  }
}

export const generatePath = (parentPath: string, keyName: string | number) => {
  const currentPath =
    typeof keyName === 'number' ? `${keyName}` : `'${keyName}'`
  return parentPath ? `${parentPath}[${currentPath}]` : `[${currentPath}]`
}

export const wrapPath = (key: string, path: string = '') => {
  try {
    const unescapedKey = JSON.parse(key!)
    return unescapedKey.includes('"')
      ? `${path}['${unescapedKey}']`
      : `${path}["${unescapedKey}"]`
  } catch {
    return null
  }
}

export const getClassNameByValue = (value: any) => {
  const type = typeof value
  // @ts-ignore
  const className = type in ClassNames ? ClassNames[type] : ClassNames.others
  return styles[className]
}

export const isRealObject = (data: any, knownType?: string) => {
  if (knownType === ObjectTypes.Object) return true
  return (
    typeof data === ObjectTypes.Object &&
    data !== null &&
    !(data instanceof Array)
  )
}

export const isRealArray = (data: any, knownType?: string) => {
  if (knownType === ObjectTypes.Array) return true
  if (knownType) return false
  return isArray(data)
}

export const getBrackets = (
  type: string,
  position: 'start' | 'end' = 'start',
) => {
  if (type === ObjectTypes.Array) return position === 'start' ? '[' : ']'
  return position === 'start' ? '{' : '}'
}

export const isValidKey = (key: string): boolean =>
  /^"([^"\\]|\\.)*"$/.test(key)

const JSONParser = JSONBigInt({
  useNativeBigInt: true,
  strict: false,
  alwaysParseAsBig: false,
  protoAction: 'preserve',
  constructorAction: 'preserve',
})

const safeJSONParse = (value: string) => {
  // Pre-process the string to handle scientific notation
  const preprocessed = value.replace(
    /-?\d+\.?\d*e[+-]?\d+/gi,
    (match) =>
      // Wrap scientific notation numbers in quotes to prevent BigInt conversion
      `"${match}"`,
  )

  return JSONParser.parse(preprocessed, (_key: string, value: any) => {
    // Convert quoted scientific notation back to numbers
    if (typeof value === 'string' && /^-?\d+\.?\d*e[+-]?\d+$/i.test(value)) {
      return Number(value)
    }
    return value
  })
}

export const parseValue = (value: any, type?: string): any => {
  try {
    if (typeof value !== 'string' || !value) {
      return value
    }

    if (type) {
      switch (type) {
        case 'integer': {
          const num = BigInt(value)
          return num > Number.MAX_SAFE_INTEGER ? num : Number(value)
        }
        case 'number':
          return Number(value)
        case 'boolean':
          return value === 'true'
        case 'null':
          return null
        case 'string':
          if (value.startsWith('"') && value.endsWith('"')) {
            return value.slice(1, -1)
          }
          return value
        default:
          return value
      }
    }

    const parsed = safeJSONParse(value)

    if (typeof parsed === 'object' && parsed !== null) {
      if (Array.isArray(parsed)) {
        return parsed.map((val) => parseValue(val))
      }
      const result: { [key: string]: any } = {}
      Object.entries(parsed).forEach(([key, val]) => {
        // This prevents double-parsing of JSON string values.
        if (typeof val === 'string') {
          result[key] = val
        } else {
          result[key] = parseValue(val)
        }
      })
      return result
    }
    return parsed
  } catch (e) {
    try {
      return JSON.parse(value)
    } catch (error) {
      return value
    }
  }
}

export const parseJsonData = (data: any) => {
  if (!data) {
    return data
  }
  try {
    if (data && Array.isArray(data)) {
      return data.map((item: { type?: string; value?: any }) => ({
        ...item,
        value:
          item.type && item.value
            ? parseValue(item.value, item.type)
            : item.value,
      }))
    }

    return parseValue(data)
  } catch (e) {
    return data
  }
}

export const stringifyScalarValue = (
  value: string | number | boolean | bigint,
): string => {
  if (typeof value === 'bigint') {
    return value.toString()
  }
  if (isString(value)) {
    return `"${value}"`
  }
  if (isNull(value)) {
    return 'null'
  }
  return String(value)
}
