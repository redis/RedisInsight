import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { debounce } from 'lodash'

import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import {
  clearSimilaritySearch,
  clearSimilaritySearchPreview,
  fetchVectorSetSimilaritySearch,
  fetchVectorSetSimilaritySearchPreview,
  vectorSetSimilaritySearchPreviewSelector,
  vectorSetSimilaritySearchSelector,
} from 'uiSrc/slices/browser/vectorSet'
import {
  VectorSetSimilarityMatch,
  VectorSetSimilaritySearchPayload,
} from 'uiSrc/slices/interfaces/vectorSet'
import { isEqualBuffers, stringToBuffer } from 'uiSrc/utils'

import { SimilaritySearchFormState } from '../../similarity-search-form'
import {
  bytesToBase64,
  validateVector,
} from '../../vector-set-element-form/utils'

import { UseSimilaritySearchResult } from './useSimilaritySearch.types'

const EMPTY_MATCHES: VectorSetSimilarityMatch[] = []

/**
 * Delay before the FE fires a preview request after the user stops typing.
 * Tuned to feel responsive without spamming the BE during fast typing — the
 * preview is best-effort, not a hot path.
 */
const PREVIEW_DEBOUNCE_MS = 250

export const useSimilaritySearch = (): UseSimilaritySearchResult => {
  const dispatch = useDispatch()
  const selectedKeyData = useSelector(selectedKeyDataSelector)
  const { loading, data } = useSelector(vectorSetSimilaritySearchSelector)
  const { loading: previewLoading, preview } = useSelector(
    vectorSetSimilaritySearchPreviewSelector,
  )

  const vectorDim = selectedKeyData?.vectorDim
  const keyName = selectedKeyData?.name

  const resetSimilaritySearch = useCallback(() => {
    dispatch(clearSimilaritySearch())
    dispatch(clearSimilaritySearchPreview())
  }, [dispatch])

  const lastKeyRef = useRef(keyName)
  useEffect(() => {
    if (!areKeysEqual(lastKeyRef.current, keyName)) {
      resetSimilaritySearch()
      lastKeyRef.current = keyName
    }
  }, [keyName, resetSimilaritySearch])

  // Clear search + preview slice state when the consumer unmounts (e.g. user
  // closes the key details panel or navigates away from the browser view).
  useEffect(
    () => () => {
      resetSimilaritySearch()
    },
    [resetSimilaritySearch],
  )

  const buildSimilaritySearchPayload = useCallback(
    (
      state: SimilaritySearchFormState,
    ): VectorSetSimilaritySearchPayload | null => {
      if (!selectedKeyData?.name) return null

      const payload: VectorSetSimilaritySearchPayload = {
        keyName: selectedKeyData.name,
      }

      if (state.mode === 'element') {
        const element = state.elementInput.trim()
        if (!element) return null
        payload.elementName = stringToBuffer(element)
      } else {
        const result = validateVector(state.vectorInput, vectorDim)
        if (result.error || !result.kind) return null
        if (result.kind === 'fp32' && result.fp32Bytes) {
          payload.vectorFp32 = bytesToBase64(result.fp32Bytes)
        } else if (result.kind === 'numeric' && result.numeric) {
          payload.vectorValues = result.numeric
        } else {
          return null
        }
      }

      if (state.count != null && Number.isFinite(state.count)) {
        payload.count = state.count
      }

      const filter = state.filter.trim()
      if (filter.length > 0) payload.filter = filter

      return payload
    },
    [selectedKeyData?.name, vectorDim],
  )

  const runSimilaritySearch = useCallback(
    (state: SimilaritySearchFormState) => {
      const payload = buildSimilaritySearchPayload(state)
      if (!payload) return
      dispatch(fetchVectorSetSimilaritySearch(payload))
    },
    [buildSimilaritySearchPayload, dispatch],
  )

  const debouncedDispatchPreview = useMemo(
    () =>
      debounce((payload: VectorSetSimilaritySearchPayload) => {
        dispatch(fetchVectorSetSimilaritySearchPreview(payload))
      }, PREVIEW_DEBOUNCE_MS),
    [dispatch],
  )

  useEffect(
    () => () => {
      debouncedDispatchPreview.cancel()
    },
    [debouncedDispatchPreview],
  )

  /**
   * Schedule a preview request only when the form state maps to a fully
   * valid `VSIM` payload. The preview endpoint accepts the same payload as
   * the executable search endpoint, so we dispatch it verbatim. Invalid /
   * partial state cancels any in-flight debounced request and clears the
   * preview slice so the UI hides the preview bar instead of showing a
   * stale command.
   */
  const runSimilaritySearchPreview = useCallback(
    (state: SimilaritySearchFormState) => {
      const payload = buildSimilaritySearchPayload(state)
      if (!payload) {
        debouncedDispatchPreview.cancel()
        dispatch(clearSimilaritySearchPreview())
        return
      }
      debouncedDispatchPreview(payload)
    },
    [buildSimilaritySearchPayload, debouncedDispatchPreview, dispatch],
  )

  const matches = useMemo(() => data?.elements ?? EMPTY_MATCHES, [data])
  const hasResults = data !== undefined

  return {
    loading,
    previewLoading,
    vectorDim,
    hasResults,
    matches,
    preview,
    runSimilaritySearch,
    runSimilaritySearchPreview,
    resetSimilaritySearch,
    buildSimilaritySearchPayload,
  }
}

const areKeysEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true
  if (a == null || b == null) return false
  return isEqualBuffers(a as any, b as any)
}
