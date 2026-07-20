import i18n from 'uiSrc/i18n'

import {
  VectorAlgorithm,
  VectorDataType,
  VectorDistanceMetric,
} from '../index-details/IndexDetails.types'

export const VECTOR_CONSTRAINTS = {
  DIMENSIONS_MIN: 1,
  DIMENSIONS_MAX: 32768,
  DIMENSIONS_DEFAULT: 384,
  MAX_EDGES_MIN: 1,
  MAX_EDGES_MAX: 512,
  MAX_EDGES_DEFAULT: 16,
  MAX_NEIGHBORS_MIN: 1,
  MAX_NEIGHBORS_MAX: 4096,
  MAX_NEIGHBORS_DEFAULT: 200,
  CANDIDATE_LIMIT_MIN: 1,
  CANDIDATE_LIMIT_MAX: 4096,
  CANDIDATE_LIMIT_DEFAULT: 10,
  EPSILON_MIN: 0,
  EPSILON_DEFAULT: 0.01,
}

export const TEXT_CONSTRAINTS = {
  WEIGHT_DEFAULT: 1,
  WEIGHT_MIN: 0,
}

export const VECTOR_ALGORITHM_DEFAULT = VectorAlgorithm.FLAT
export const VECTOR_DISTANCE_METRIC_DEFAULT = VectorDistanceMetric.COSINE
export const VECTOR_DATA_TYPE_DEFAULT = VectorDataType.FLOAT32

export const MAX_SAMPLE_VALUE_LENGTH = 500

export const MIN_RQE_VERSION_FLOAT16 = '2.10.0'

export const VECTOR_DATA_TYPE_BASE_OPTIONS = [
  { value: VectorDataType.FLOAT32, label: 'FLOAT32' },
  { value: VectorDataType.FLOAT64, label: 'FLOAT64' },
]

export const VECTOR_DATA_TYPE_FLOAT16_OPTIONS = [
  { value: VectorDataType.BFLOAT16, label: 'BFLOAT16' },
  { value: VectorDataType.FLOAT16, label: 'FLOAT16' },
]

export const PHONETIC_NONE = 'none'

// Built at call time (not module scope) so labels resolve in the active language.
export const getPhoneticOptions = () => [
  {
    value: PHONETIC_NONE,
    label: i18n.t('vectorSearch.fieldType.phonetic.none'),
  },
  { value: 'dm:en', label: i18n.t('vectorSearch.fieldType.phonetic.en') },
  { value: 'dm:fr', label: i18n.t('vectorSearch.fieldType.phonetic.fr') },
  { value: 'dm:pt', label: i18n.t('vectorSearch.fieldType.phonetic.pt') },
  { value: 'dm:es', label: i18n.t('vectorSearch.fieldType.phonetic.es') },
]

export const VECTOR_ALGORITHM_OPTIONS = [
  { value: VectorAlgorithm.FLAT, label: 'FLAT' },
  { value: VectorAlgorithm.HNSW, label: 'HNSW' },
]

export const VECTOR_DISTANCE_METRIC_OPTIONS = [
  { value: VectorDistanceMetric.L2, label: 'L2' },
  { value: VectorDistanceMetric.IP, label: 'IP' },
  { value: VectorDistanceMetric.COSINE, label: 'COSINE' },
]

// Built at call time (not module scope) so messages resolve in the active
// language; numeric bounds are interpolated from VECTOR_CONSTRAINTS.
export const getValidationMessages = () => ({
  FIELD_NAME_REQUIRED: i18n.t(
    'vectorSearch.fieldType.validation.fieldNameRequired',
  ),
  FIELD_NAME_DUPLICATE: i18n.t(
    'vectorSearch.fieldType.validation.fieldNameDuplicate',
  ),
  DIMENSIONS_REQUIRED: i18n.t(
    'vectorSearch.fieldType.validation.dimensionsRequired',
  ),
  DIMENSIONS_RANGE: i18n.t(
    'vectorSearch.fieldType.validation.dimensionsRange',
    {
      min: VECTOR_CONSTRAINTS.DIMENSIONS_MIN,
      max: VECTOR_CONSTRAINTS.DIMENSIONS_MAX,
    },
  ),
  MAX_EDGES_RANGE: i18n.t('vectorSearch.fieldType.validation.maxEdgesRange', {
    min: VECTOR_CONSTRAINTS.MAX_EDGES_MIN,
    max: VECTOR_CONSTRAINTS.MAX_EDGES_MAX,
  }),
  MAX_NEIGHBORS_RANGE: i18n.t(
    'vectorSearch.fieldType.validation.maxNeighborsRange',
    {
      min: VECTOR_CONSTRAINTS.MAX_NEIGHBORS_MIN,
      max: VECTOR_CONSTRAINTS.MAX_NEIGHBORS_MAX,
    },
  ),
  CANDIDATE_LIMIT_RANGE: i18n.t(
    'vectorSearch.fieldType.validation.candidateLimitRange',
    {
      min: VECTOR_CONSTRAINTS.CANDIDATE_LIMIT_MIN,
      max: VECTOR_CONSTRAINTS.CANDIDATE_LIMIT_MAX,
    },
  ),
  EPSILON_MIN: i18n.t('vectorSearch.fieldType.validation.epsilonMin', {
    min: VECTOR_CONSTRAINTS.EPSILON_MIN,
  }),
  WEIGHT_MIN: i18n.t('vectorSearch.fieldType.validation.weightMin'),
})
