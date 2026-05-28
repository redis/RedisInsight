import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import {
  deleteVectorSetElements,
  vectorSetDataSelector,
} from 'uiSrc/slices/browser/vectorSet'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { bufferToString } from 'uiSrc/utils'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'

import {
  ElementDeleteConfig,
  VectorSetActionsConfig,
  VectorSetActionTarget,
} from '../../vector-set-element-list/VectorSetElementList.types'
import { SimilaritySearchPrefill } from '../../similarity-search-form'
import { VectorSetSimilarityEntryPoint } from '../../telemetry.constants'
import {
  UseVectorSetActionsConfigParams,
  UseVectorSetActionsConfigResult,
} from './useVectorSetActionsConfig.types'

const ELEMENT_DELETE_POPOVER_SUFFIX = '_vectorSet'

const noop = () => {}

/**
 * Builds the `actionsConfig` consumed by both the element-list and
 * similarity-results tables — owns the delete-popover state, the delete
 * thunk dispatch, and the Find-similar prefill.
 */
export const useVectorSetActionsConfig = ({
  onRemoveKey,
  onViewElement,
}: UseVectorSetActionsConfigParams): UseVectorSetActionsConfigResult => {
  const dispatch = useDispatch()
  const selectedKeyData = useSelector(selectedKeyDataSelector)
  const keyNameBuffer = selectedKeyData?.name
  const { id: databaseId } = useSelector(connectedInstanceSelector)
  const { total = 0 } = useSelector(vectorSetDataSelector) ?? {}

  // Element-mode prefill for the similarity-search form. The nonce lets the
  // same value be re-applied on repeat clicks.
  const [similarityPrefill, setSimilarityPrefill] =
    useState<SimilaritySearchPrefill>()

  // Clear the prefill when switching to a different vector set key so the
  // remounted form (keyed on the key name) doesn't re-apply the previous
  // key's element value via its prefill effect.
  const keyNameString = keyNameBuffer ? bufferToString(keyNameBuffer) : ''
  useEffect(() => {
    setSimilarityPrefill(undefined)
  }, [keyNameString])

  const handleSearchByElement = useCallback(
    (target: VectorSetActionTarget) => {
      const value = bufferToString(target.name)
      sendEventTelemetry({
        event: TelemetryEvent.VECTOR_SET_FIND_SIMILAR_CLICKED,
        eventData: {
          databaseId,
          entryPoint: VectorSetSimilarityEntryPoint.ElementRow,
        },
      })
      setSimilarityPrefill((prev) => ({
        value,
        nonce: (prev?.nonce ?? 0) + 1,
      }))
    },
    [databaseId],
  )

  // Delete-popover state driving both action columns. The two tables are
  // mutually exclusive in the UI so a single state covers both.
  const [deleting, setDeleting] = useState('')

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((item = '') => {
    setDeleting(`${item + ELEMENT_DELETE_POPOVER_SUFFIX}`)
  }, [])

  const handleDeleteElement = useCallback(
    (element: RedisString | string = '') => {
      if (!keyNameBuffer) return
      dispatch(
        deleteVectorSetElements(
          keyNameBuffer as RedisResponseBuffer,
          [element as RedisResponseBuffer],
          (newTotal: number) => {
            if (newTotal === 0) {
              onRemoveKey()
            }
          },
        ),
      )
      closePopover()
    },
    [dispatch, keyNameBuffer, onRemoveKey, closePopover],
  )

  const actionsConfig = useMemo<VectorSetActionsConfig>(() => {
    const elementDeleteConfig: ElementDeleteConfig = {
      deleting,
      suffix: ELEMENT_DELETE_POPOVER_SUFFIX,
      total,
      keyName: keyNameBuffer ?? '',
      closePopover,
      showPopover,
      handleDeleteElement,
      handleRemoveIconClick: noop,
    }
    return {
      elementDeleteConfig,
      onViewElement,
      onSearchByElement: handleSearchByElement,
    }
  }, [
    deleting,
    total,
    keyNameBuffer,
    closePopover,
    showPopover,
    handleDeleteElement,
    onViewElement,
    handleSearchByElement,
  ])

  return { actionsConfig, similarityPrefill }
}
