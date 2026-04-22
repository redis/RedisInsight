import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { INITIAL_VECTOR_SET_ELEMENT_STATE } from '../../vector-set-element-form/constants'
import {
  IVectorSetElementState,
  SubmitElement,
} from '../../vector-set-element-form/interfaces'
import {
  getValidVector,
  toSubmitElement,
} from '../../vector-set-element-form/utils'

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
  const lastAddedNameRef = useRef<HTMLInputElement>(null)
  const prevElementsLengthRef = useRef(elements.length)

  const isFormValid = useMemo(
    () =>
      elements.every(
        (el) => el.name.trim() && getValidVector(el.vector, vectorDim) !== null,
      ),
    [elements, vectorDim],
  )

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
    const payload = elements.map((el) => toSubmitElement(el, vectorDim))
    if (payload.some((item) => item === null)) return
    onSubmit(payload as SubmitElement[])
  }, [elements, vectorDim, onSubmit])

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
