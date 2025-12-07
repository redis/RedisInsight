import { toNumber, transform, isNaN } from 'lodash'

export const transformQueryParamsObject = (
  properties: Record<string, any> = {},
) =>
  transform(
    properties,
    (result: Record<string, any>, value, key) => {
      if (value === 'true' || value === 'false') {
        result[key] = value === 'true'
        return
      }
      if (!isNaN(toNumber(value))) {
        result[key] = toNumber(value)
        return
      }

      result[key] = value
    },
    {},
  )
