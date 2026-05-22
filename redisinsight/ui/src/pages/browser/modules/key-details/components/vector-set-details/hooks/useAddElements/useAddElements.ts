import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import {
  addVectorSetElements,
  addVectorSetElementsStateSelector,
  fetchVectorSetElements,
} from 'uiSrc/slices/browser/vectorSet'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { SubmitElement } from '../../vector-set-element-form'
import { UseAddElementsResult } from './useAddElements.types'

export const useAddElements = (): UseAddElementsResult => {
  const dispatch = useDispatch()
  const selectedKeyData = useSelector(selectedKeyDataSelector)
  const { loading } = useSelector(addVectorSetElementsStateSelector)
  const { id: databaseId } = useSelector(connectedInstanceSelector)

  const submitElements = useCallback(
    (elements: SubmitElement[], onSuccess?: () => void) => {
      if (!selectedKeyData?.name) return

      const hasAttributes = elements.some(
        (el) => typeof el.attributes === 'string' && el.attributes.length > 0,
      )

      dispatch(
        addVectorSetElements(
          {
            keyName: selectedKeyData.name,
            elements,
          },
          () => {
            sendEventTelemetry({
              event: TelemetryEvent.VECTOR_SET_ELEMENT_ADDED,
              eventData: {
                databaseId,
                hasAttributes,
              },
            })
            onSuccess?.()
            dispatch<any>(fetchVectorSetElements({ key: selectedKeyData.name }))
          },
        ),
      )
    },
    [databaseId, dispatch, selectedKeyData?.name],
  )

  return {
    loading,
    vectorDim: selectedKeyData?.vectorDim,
    submitElements,
  }
}
