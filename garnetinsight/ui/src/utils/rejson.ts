import { get } from 'lodash'
import { IJSONData } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/interfaces'
import parseRedisJsonPath from './transformers/parseRedisJsonPath'

/**
 * Checks whether a given Redis JSONPath would override existing data in the target object.
 *
 * This function inspects the parent object of the target key and determines if the key already exists.
 *
 * Example:
 * - If path is "$['foo']['bar']" it will check if object.foo.bar already exists.
 * - Returns false if key does not exist or parent is missing.
 *
 * @param path - Redis JSONPath string (e.g., "$['foo'][0]['bar']")
 * @param object - JSON-like object to check against
 * @returns true if the key already exists and would be overwritten, false otherwise
 */
export const checkExistingPath = (path: string, object: IJSONData): boolean => {
  const parsedPath = parseRedisJsonPath(path)

  if (!parsedPath.length) {
    // Path is root "$". We don't want to override the whole object.
    return true
  }

  const isRootKey = parsedPath.length === 1
  const parent = isRootKey ? object : get(object, parsedPath.slice(0, -1))
  const key = parsedPath[parsedPath.length - 1]

  if (typeof parent !== 'object' || parent === null) return false

  return Object.prototype.hasOwnProperty.call(parent, key)
}
