import { useEffect, useRef, useState } from 'react'
import { toNumber } from 'lodash'

export interface ElementRow {
  id: number
  index: string
  value: string
}

interface Options {
  /**
   * The value used when clearing/resetting the index field.
   * - Pass `'0'` for the create-key form (AddKeyArray) where index 0 is the
   *   sensible initial/reset state.
   * - Omit (or pass `''`) for the edit form (ArrayAddElementForm) where the
   *   field starts empty and the user must provide an explicit index.
   */
  emptyIndexValue?: string
}

/** Returns true if the index string represents a valid non-negative integer. */
export const isIndexValid = (index: string): boolean =>
  index.trim() !== '' &&
  !Number.isNaN(Number(index)) &&
  Number.isInteger(Number(index)) &&
  Number(index) >= 0

/**
 * Shared state and handlers for forms that manage a list of array element rows
 * (index + value pairs). Used by both AddKeyArray and ArrayAddElementForm.
 */
export function useArrayElementRows({ emptyIndexValue = '' }: Options = {}) {
  const [elements, setElements] = useState<ElementRow[]>([
    { id: 0, index: emptyIndexValue, value: '' },
  ])
  const lastAddedIndex = useRef<HTMLInputElement>(null)
  const prevCount = useRef<number>(0)

  // Focus the index input of the newly added row
  useEffect(() => {
    if (prevCount.current !== 0 && prevCount.current < elements.length) {
      lastAddedIndex.current?.focus()
    }
    prevCount.current = elements.length
  }, [elements.length])

  const addField = () => {
    const lastId = elements[elements.length - 1].id
    const validIndices = elements
      .filter((el) => isIndexValid(el.index))
      .map((el) => toNumber(el.index))
    const nextIndex = String(
      (validIndices.length > 0 ? Math.max(...validIndices) : -1) + 1,
    )
    setElements([...elements, { id: lastId + 1, index: nextIndex, value: '' }])
  }

  const clearElement = (id: number) => {
    setElements(
      elements.map((el) =>
        el.id === id ? { ...el, index: emptyIndexValue, value: '' } : el,
      ),
    )
  }

  const onClickRemove = ({ id }: ElementRow) => {
    if (elements.length === 1) {
      clearElement(id)
      return
    }
    setElements(elements.filter((el) => el.id !== id))
  }

  const isClearDisabled = (item: ElementRow): boolean =>
    elements.length === 1 &&
    !item.value.length &&
    item.index === emptyIndexValue

  const handleChange = (field: 'index' | 'value', id: number, val: string) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, [field]: val } : el)),
    )
  }

  const allIndicesValid = elements.every((el) => isIndexValid(el.index))

  return {
    elements,
    lastAddedIndex,
    addField,
    onClickRemove,
    isClearDisabled,
    handleChange,
    allIndicesValid,
  }
}
