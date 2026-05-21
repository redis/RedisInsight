import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { setVectorSetElementAttribute } from 'uiSrc/slices/browser/vectorSet'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { bufferToString } from 'uiSrc/utils'

import {
  UseElementAttributeEditorParams,
  UseElementAttributeEditorResult,
} from './useElementAttributeEditor.types'

export const useElementAttributeEditor = ({
  element,
}: UseElementAttributeEditorParams): UseElementAttributeEditorResult => {
  const dispatch = useDispatch()
  const { name: keyName } = useSelector(selectedKeyDataSelector) ?? {}
  const { id: databaseId } = useSelector(connectedInstanceSelector)

  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState('')
  const [savedValue, setSavedValue] = useState('')

  useEffect(() => {
    const formatted = bufferToString(element?.attributes)
    setValue(formatted)
    setSavedValue(formatted)
    setIsEditing(false)
  }, [element])

  const startEditing = useCallback(() => setIsEditing(true), [])

  const cancelEditing = useCallback(() => {
    setValue(savedValue)
    setIsEditing(false)
  }, [savedValue])

  const isSaveDisabled = value === savedValue

  const saveAttribute = useCallback(() => {
    if (!element || !keyName || isSaveDisabled) return

    const trimmed = value.trim()

    dispatch(
      setVectorSetElementAttribute(
        keyName as RedisResponseBuffer,
        element.name,
        trimmed,
        () => {
          sendEventTelemetry({
            event: TelemetryEvent.VECTOR_SET_ELEMENT_ATTRIBUTES_EDITED,
            eventData: { databaseId },
          })
          setIsEditing(false)
          setValue(trimmed)
          setSavedValue(trimmed)
        },
      ),
    )
  }, [databaseId, dispatch, element, keyName, value, isSaveDisabled])

  return {
    isEditing,
    value,
    isSaveDisabled,
    onChange: setValue,
    startEditing,
    cancelEditing,
    saveAttribute,
  }
}
