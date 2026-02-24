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
} as const

export const TEXT_CONSTRAINTS = {
  WEIGHT_DEFAULT: 1,
  WEIGHT_MIN: 0,
} as const

export const SCHEMA_LIMITS = {
  MAX_FIELDS: 1024,
  MAX_TEXT_FIELDS: 128,
} as const

export const VECTOR_ALGORITHM_DEFAULT = VectorAlgorithm.FLAT
export const VECTOR_DISTANCE_METRIC_DEFAULT = VectorDistanceMetric.COSINE
export const VECTOR_DATA_TYPE_DEFAULT = VectorDataType.FLOAT32

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

export const PHONETIC_OPTIONS = [
  { value: PHONETIC_NONE, label: 'None' },
  { value: 'dm:en', label: 'English (dm:en)' },
  { value: 'dm:fr', label: 'French (dm:fr)' },
  { value: 'dm:pt', label: 'Portuguese (dm:pt)' },
  { value: 'dm:es', label: 'Spanish (dm:es)' },
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

export const VALIDATION_MESSAGES = {
  FIELD_NAME_REQUIRED: 'Field name is required.',
  FIELD_NAME_DUPLICATE: 'A field with this name already exists.',
  DIMENSIONS_REQUIRED: 'Dimensions value is required.',
  DIMENSIONS_RANGE:
    `Dimensions must be between` +
    ` ${VECTOR_CONSTRAINTS.DIMENSIONS_MIN}` +
    ` and ${VECTOR_CONSTRAINTS.DIMENSIONS_MAX}.`,
  MAX_EDGES_RANGE:
    `Max edges must be between` +
    ` ${VECTOR_CONSTRAINTS.MAX_EDGES_MIN}` +
    ` and ${VECTOR_CONSTRAINTS.MAX_EDGES_MAX}.`,
  MAX_NEIGHBORS_RANGE:
    `Max neighbors must be between` +
    ` ${VECTOR_CONSTRAINTS.MAX_NEIGHBORS_MIN}` +
    ` and ${VECTOR_CONSTRAINTS.MAX_NEIGHBORS_MAX}.`,
  CANDIDATE_LIMIT_RANGE:
    `Candidate limit must be between` +
    ` ${VECTOR_CONSTRAINTS.CANDIDATE_LIMIT_MIN}` +
    ` and ${VECTOR_CONSTRAINTS.CANDIDATE_LIMIT_MAX}.`,
  EPSILON_MIN: `Epsilon must be ${VECTOR_CONSTRAINTS.EPSILON_MIN} or greater.`,
  WEIGHT_MIN: 'Weight must be greater than 0.',
} as const
