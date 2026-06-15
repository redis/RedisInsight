import { useCallback } from 'react'
import { useAppSelector, useAppDispatch } from 'uiSrc/slices/hooks'
import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import {
  fetchReJSON,
  rejsonSelector,
  setEditorType,
} from 'uiSrc/slices/browser/rejson'

import { EditorType } from 'uiSrc/slices/interfaces'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'

export const useChangeEditorType = () => {
  const dispatch = useAppDispatch()
  const { editorType, isWithinThreshold } = useAppSelector(rejsonSelector)
  const { [FeatureFlags.envDependent]: envDependentFeature } = useAppSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const selectedKey = useAppSelector(selectedKeyDataSelector)?.name

  const isTextEditorDisabled = !isWithinThreshold && !envDependentFeature?.flag

  const switchEditorType = useCallback(() => {
    const opposite =
      editorType === EditorType.Default ? EditorType.Text : EditorType.Default
    dispatch(setEditorType(opposite))

    if (selectedKey) {
      dispatch(fetchReJSON(selectedKey))
    }
  }, [dispatch, editorType])

  return { switchEditorType, editorType, isTextEditorDisabled }
}
