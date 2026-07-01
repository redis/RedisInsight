import React, { useCallback, useMemo } from 'react'

import { ThreeDotsIcon } from 'uiSrc/components/base/icons'

import * as S from './ValueDecoderModal.styles'

const getSortMimeType = (listId: string) =>
  `application/x-value-decoder-sort-${listId}`

const parseSortIndexFromDataTransfer = (
  dataTransfer: DataTransfer,
  listId: string,
): number | null => {
  const mimeType = getSortMimeType(listId)
  if (!dataTransfer.types.includes(mimeType)) {
    return null
  }

  const raw = dataTransfer.getData(mimeType)
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
  listId: string
  index: number
  onReorder: (fromIndex: number, toIndex: number) => void
  children: React.ReactNode
  testId?: string
}

export const SortableItem = ({
  listId,
  index,
  onReorder,
  children,
  testId,
}: SortableItemProps) => {
  const sortMimeType = useMemo(() => getSortMimeType(listId), [listId])

  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      event.stopPropagation()
      event.dataTransfer.setData(sortMimeType, String(index))
      event.dataTransfer.effectAllowed = 'move'
    },
    [index, sortMimeType],
  )

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      if (!event.dataTransfer.types.includes(sortMimeType)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      event.dataTransfer.dropEffect = 'move'
    },
    [sortMimeType],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      const fromIndex = parseSortIndexFromDataTransfer(
        event.dataTransfer,
        listId,
      )
      if (fromIndex === null) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      if (fromIndex !== index) {
        onReorder(fromIndex, index)
      }
    },
    [index, listId, onReorder],
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
