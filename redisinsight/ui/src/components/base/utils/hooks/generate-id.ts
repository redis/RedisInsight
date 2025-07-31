import { useMemo, useId } from 'react'
import { v1 as uuidV1 } from 'uuid'

/**
 * Generates a memoized ID that remains static until component unmount.
 * This prevents IDs from being re-randomized on every component update.
 * @param prefix Optional prefix to prepend to the generated ID
 * @param suffix Optional suffix to append to the generated ID
 * @param conditionalId Optional conditional ID to use instead of a randomly generated ID. Typically used by components where IDs can be passed in as custom props
 */
export const useGenerateId = (
  prefix = '',
  suffix = '',
  conditionalId?: string,
) => {
  let id: string
  if (useId) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    id = useId()
  } else {
    id = htmlIdGenerator(prefix)(suffix)
  }

  return useMemo(
    () => conditionalId || `${prefix}${id}${suffix}`,
    [id, prefix, suffix, conditionalId],
  )
}

/**
 * This function returns a function to generate ids.
 * This can be used to generate unique, but predictable ids to pair labels
 * with their inputs. It takes an optional prefix as a parameter. If you don't
 * specify it, it generates a random id prefix. If you specify a custom prefix
 * it should begin with an letter to be HTML4 compliant.
 */
export function htmlIdGenerator(idPrefix: string = '') {
  const staticUuid = uuidV1()
  return (idSuffix: string = '') => {
    const prefix = `${idPrefix}${idPrefix !== '' ? '_' : 'i'}`
    const suffix = idSuffix ? `_${idSuffix}` : ''
    return `${prefix}${suffix ? staticUuid : uuidV1()}${suffix}`
  }
}
