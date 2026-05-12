import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces/app'

export interface VectorSetElement {
  name: RedisResponseBuffer
  vector?: number[]
  vectorTruncated?: boolean
  attributes?: string
}

export interface VectorSetData {
  total: number
  keyName: RedisString
  nextCursor?: string
  /** From API: whether cursor-based pagination is supported for listing elements. */
  isPaginationSupported?: boolean
  elements: VectorSetElement[]
}

export interface GetVectorSetElementsResponse {
  total: number
  keyName: RedisString
  nextCursor?: string
  isPaginationSupported?: boolean
  elementNames: RedisResponseBuffer[]
}

export interface AddVectorSetElementsState {
  loading: boolean
  error: string
}

/**
 * Element payload for add/create flows. Exactly one of `vectorValues` (numeric
 * array) or `vectorFp32` (base64-encoded little-endian IEEE-754 blob) must be
 * supplied; the backend dispatches `VADD ... VALUES ...` or
 * `VADD ... FP32 <buf> ...` accordingly.
 */
export interface AddVectorSetElementsData {
  keyName: RedisResponseBuffer
  elements: {
    name: string
    vectorValues?: number[]
    vectorFp32?: string
    attributes?: string
  }[]
}

export interface CreateVectorSetWithExpireDto {
  keyName: RedisResponseBuffer
  elements: {
    name: RedisResponseBuffer
    vectorValues?: number[]
    vectorFp32?: string
    attributes?: string
  }[]
  expire?: number
}

export interface FetchVectorSetElementsParams {
  key: RedisResponseBuffer
  count?: number
  resetData?: boolean
}

export interface FetchMoreVectorSetElementsParams {
  key: RedisResponseBuffer
  nextCursor: string
  count?: number
}

export interface InitialStateVectorSet {
  loading: boolean
  downloading: boolean
  error: string
  data: VectorSetData
  adding: AddVectorSetElementsState
  similaritySearch: VectorSetSimilaritySearchState
  similaritySearchPreview: VectorSetSimilaritySearchPreviewState
}

export interface VectorSetSimilaritySearchPayload {
  keyName: RedisResponseBuffer
  elementName?: RedisResponseBuffer
  vectorValues?: number[]
  vectorFp32?: string
  count?: number
  filter?: string
}

export interface VectorSetSimilarityMatch {
  name: RedisResponseBuffer
  score: number
  attributes?: string
}

export interface VectorSetSimilaritySearchResponse {
  keyName: RedisResponseBuffer
  elements: VectorSetSimilarityMatch[]
}

export interface VectorSetSimilaritySearchState {
  loading: boolean
  error: string
  data?: VectorSetSimilaritySearchResponse
}

/**
 * Preview endpoint accepts the same payload shape as the executable search
 * endpoint — the FE only fires a preview once the form is valid, so there
 * is no need for a relaxed/lenient variant of the payload.
 */
export type VectorSetSimilaritySearchPreviewPayload =
  VectorSetSimilaritySearchPayload

export interface VectorSetSimilaritySearchPreviewResponse {
  preview: string
}

export interface VectorSetSimilaritySearchPreviewState {
  loading: boolean
  error: string
  preview: string
}
