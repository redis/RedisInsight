import { useCallback, useEffect, useRef, useState } from 'react'

import { INITIAL_VECTOR_SET_ELEMENT_STATE } from '../../vector-set-element-form/constants'
import {
  IVectorSetElementState,
  SubmitElement,
} from '../../vector-set-element-form/interfaces'
import { parseVector } from '../../vector-set-element-form/utils'

import {
  EditableStringField,
  UseVectorSetElementFormParams,
  UseVectorSetElementFormResult,
} from './useVectorSetElementForm.types'

export const useVectorSetElementForm = ({
  vectorDim,
  onSubmit,
}: UseVectorSetElementFormParams): UseVectorSetElementFormResult => {
  const [elements, setElements] = useState<IVectorSetElementState[]>([
    { ...INITIAL_VECTOR_SET_ELEMENT_STATE },
  ])
  const [isFormValid, setIsFormValid] = useState(false)
  const lastAddedNameRef = useRef<HTMLInputElement>(null)
  const prevElementsLengthRef = useRef(elements.length)

  useEffect(() => {
    const valid = elements.every((el) => {
      if (!el.name.trim()) return false
      const parsed = parseVector(el.vector)
      if (!parsed) return false
      if (vectorDim !== undefined && parsed.length !== vectorDim) return false
      return true
    })
    setIsFormValid(valid)
  }, [elements, vectorDim])

  useEffect(() => {
    if (elements.length > prevElementsLengthRef.current) {
      lastAddedNameRef.current?.focus()
    }
    prevElementsLengthRef.current = elements.length
  }, [elements.length])

  const addElement = useCallback(() => {
    setElements((prev) => [
      ...prev,
      {
        ...INITIAL_VECTOR_SET_ELEMENT_STATE,
        id: prev[prev.length - 1].id + 1,
      },
    ])
  }, [])

  const onClickRemove = useCallback((item: IVectorSetElementState) => {
    setElements((prev) => {
      if (prev.length === 1) {
        return prev.map((el) =>
          el.id === item.id
            ? { ...INITIAL_VECTOR_SET_ELEMENT_STATE, id: el.id }
            : el,
        )
      }
      return prev.filter((el) => el.id !== item.id)
    })
  }, [])

  const handleFieldChange = useCallback(
    (field: EditableStringField, id: number, value: string) => {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, [field]: value } : el)),
      )
    },
    [],
  )

  const toggleAttributes = useCallback((id: number) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, showAttributes: !el.showAttributes } : el,
      ),
    )
  }, [])

  const submitData = useCallback(() => {
    const result: SubmitElement[] = []
    for (const el of elements) {
      const parsed = parseVector(el.vector)
      if (!parsed) return
      const item: SubmitElement = { name: el.name, vector: parsed }
      const trimmedAttributes = el.attributes.trim()
      if (trimmedAttributes) item.attributes = trimmedAttributes
      result.push(item)
    }
    onSubmit(result)
  }, [elements, onSubmit])

  const isClearDisabled = useCallback(
    (item: IVectorSetElementState): boolean =>
      elements.length === 1 && !item.name && !item.vector && !item.attributes,
    [elements.length],
  )

  return {
    elements,
    isFormValid,
    lastAddedNameRef,
    addElement,
    onClickRemove,
    handleFieldChange,
    toggleAttributes,
    submitData,
    isClearDisabled,
  }
}
