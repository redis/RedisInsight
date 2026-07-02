import React, { useCallback } from 'react'

import { ThreeDotsIcon } from 'uiSrc/components/base/icons'

import * as S from './ValueDecoderModal.styles'

const SORT_INDEX_MIME = 'application/x-value-decoder-sort-index'

const parseSortIndexFromDataTransfer = (
  dataTransfer: DataTransfer,
): number | null => {
  if (!dataTransfer.types.includes(SORT_INDEX_MIME)) {
    return null
  }

  const raw = dataTransfer.getData(SORT_INDEX_MIME)
  if (raw === '') {
    return null
  }

  const fromIndex = Number(raw)
  if (!Number.isInteger(fromIndex) || fromIndex < 0) {
    return null
  }

  return fromIndex
}

export interface SortableItemProps {
  index: number
  onReorder: (fromIndex: number, toIndex: number) => void
  children: React.ReactNode
  testId?: string
}

export const SortableItem = ({
  index,
  onReorder,
  children,
  testId,
}: SortableItemProps) => {
  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      event.dataTransfer.setData(SORT_INDEX_MIME, String(index))
      event.dataTransfer.effectAllowed = 'move'
    },
    [index],
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes(SORT_INDEX_MIME)) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const fromIndex = parseSortIndexFromDataTransfer(event.dataTransfer)
      if (fromIndex !== null && fromIndex !== index) {
        onReorder(fromIndex, index)
      }
    },
    [index, onReorder],
  )

  return (
    <S.SortableRow
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-testid={testId}
    >
      <S.DragHandle
        draggable
        onDragStart={handleDragStart}
        aria-label="Drag to reorder"
        data-testid={testId ? `${testId}-drag-handle` : undefined}
      >
        <ThreeDotsIcon size="S" />
      </S.DragHandle>
      <S.SortableContent>{children}</S.SortableContent>
    </S.SortableRow>
  )
}
