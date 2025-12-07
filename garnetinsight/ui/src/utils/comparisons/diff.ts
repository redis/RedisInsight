import { isEqual, reduce, isNull } from 'lodash'

type UnknownObject = {
  [key: string]: any
}

export const isObject = (data: any) =>
  typeof data === 'object' && data !== null && !Array.isArray(data)

export const getDiffKeysOfObjectValues = (
  obj1: UnknownObject = {},
  obj2: UnknownObject = {},
): string[] =>
  reduce(
    obj1,
    (result: string[], value, key) =>
      isEqual(value, obj2[key]) ? result : result.concat(key),
    [],
  )

export const getFormUpdates = (
  obj1: UnknownObject = {},
  obj2: UnknownObject = {},
): UnknownObject => {
  if (isNull(obj2)) {
    return obj1
  }

  return reduce(
    obj1,
    (result: UnknownObject, value, key) => {
      if (isObject(value)) {
        const diff = getFormUpdates(value, obj2[key] || {})

        if (Object.keys(diff).length) {
          result[key] = diff
        }
      } else if (value !== obj2[key] && !(!value && !obj2[key])) {
        result[key] = value ?? null
      }

      return result
    },
    {},
  )
}
