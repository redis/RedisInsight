import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import {
  addVectorSetElements,
  addVectorSetElementsStateSelector,
  fetchVectorSetElements,
} from 'uiSrc/slices/browser/vectorSet'

import { SubmitElement } from '../../vector-set-element-form'
import { UseAddElementsResult } from './useAddElements.types'

export const useAddElements = (): UseAddElementsResult => {
  const dispatch = useDispatch()
  const selectedKeyData = useSelector(selectedKeyDataSelector)
  const { loading } = useSelector(addVectorSetElementsStateSelector)

  const submitElements = useCallback(
    (elements: SubmitElement[], onSuccess?: () => void) => {
      if (!selectedKeyData?.name) return

      dispatch(
        addVectorSetElements(
          {
            keyName: selectedKeyData.name,
            elements,
          },
          () => {
            onSuccess?.()
            dispatch<any>(fetchVectorSetElements({ key: selectedKeyData.name }))
          },
        ),
      )
    },
    [dispatch, selectedKeyData?.name],
  )

  return {
    loading,
    vectorDim: selectedKeyData?.vectorDim,
    submitElements,
  }
}
