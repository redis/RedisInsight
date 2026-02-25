import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { REDISEARCH_MODULES } from 'uiSrc/slices/interfaces'
import { isRedisVersionSupported } from 'uiSrc/utils/comparisons/compareVersions'

import {
  MIN_RQE_VERSION_FLOAT16,
  VECTOR_DATA_TYPE_BASE_OPTIONS,
  VECTOR_DATA_TYPE_FLOAT16_OPTIONS,
} from '../FieldTypeModal.constants'

const REDISEARCH_MODULE_SET = new Set(REDISEARCH_MODULES)

export const useVectorDataTypeOptions = () => {
  const { modules = [] } = useSelector(connectedInstanceSelector)

  return useMemo(() => {
    const rqeModule = modules.find((m) => REDISEARCH_MODULE_SET.has(m.name))
    const rqeVersion = rqeModule?.semanticVersion || ''

    const supportsFloat16 =
      !!rqeVersion &&
      isRedisVersionSupported(rqeVersion, MIN_RQE_VERSION_FLOAT16)

    return supportsFloat16
      ? [...VECTOR_DATA_TYPE_BASE_OPTIONS, ...VECTOR_DATA_TYPE_FLOAT16_OPTIONS]
      : VECTOR_DATA_TYPE_BASE_OPTIONS
  }, [modules])
}
