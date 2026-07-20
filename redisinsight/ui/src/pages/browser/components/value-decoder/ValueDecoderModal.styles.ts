import React from 'react'
import styled from 'styled-components'
import { Modal } from 'uiSrc/components/base/display/modal'

export const ModalContent = styled(Modal.Content.Compose)`
  width: ${({ theme }) =>
    `calc(100vw - ${theme.core.space.space800} - ${theme.core.space.space150})`};
  min-width: ${({ theme }) => `calc(${theme.core.space.space500} * 15)`};
  max-width: ${({ theme }) =>
    `calc(100vw - ${theme.core.space.space800} - ${theme.core.space.space150})`};
  max-height: ${({ theme }) =>
    `calc(100vh - ${theme.core.space.space800} - ${theme.core.space.space150})`};
`

export const ModalBody = styled(Modal.Content.Body)`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

export const FieldTableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1.4fr auto;
  gap: ${({ theme }) => theme.core.space.space100};
  padding: ${({ theme }) => theme.core.space.space100};
  padding-left: calc(
    ${({ theme }) => theme.core.space.space100} + 1.2rem +
      ${({ theme }) => theme.core.space.space050}
  );
  color: ${({ theme }) => theme.components.typography.colors.secondary};
  font-weight: 600;
`

export const FieldRowGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1.4fr auto;
  gap: ${({ theme }) => theme.core.space.space100};
  align-items: center;
  flex: 1;
  min-width: 0;
`

export const DragHandle = styled.div<{
  children?: React.ReactNode
  draggable?: boolean
  onDragStart?: React.DragEventHandler<HTMLDivElement>
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.2rem;
  flex-shrink: 0;
  opacity: 0;
  cursor: grab;
  color: ${({ theme }) => theme.components.typography.colors.secondary};

  &:active {
    cursor: grabbing;
  }
`

export const SortableRow = styled.div<{
  children?: React.ReactNode
  onDragOver?: React.DragEventHandler<HTMLDivElement>
  onDrop?: React.DragEventHandler<HTMLDivElement>
}>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space050};
  padding: ${({ theme }) => theme.core.space.space100};
  border-top: 1px solid ${({ theme }) => theme.semantic.color.border.neutral400};

  &:hover ${DragHandle} {
    opacity: 1;
  }
`

export const SortableContent = styled.div`
  flex: 1;
  min-width: 0;
`

export const KeyPatternsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.core.space.space050};

  ${SortableRow}:first-of-type {
    border-top: none;
    padding-top: 0;
  }
`

export const KeyPatternRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space050};
  flex: 1;
  min-width: 0;
`

export const KeyPatternLastRow = styled.div<{
  children?: React.ReactNode
}>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space100};

  ${SortableRow} {
    flex: 1;
    min-width: 0;
  }
`

export const SizeInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space050};
  min-width: 120px;
`

export const SizeSourceWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.core.space.space050};
  min-width: 180px;
`

export const SizeUnit = styled.span<{ children?: React.ReactNode }>`
  color: ${({ theme }) => theme.components.typography.colors.secondary};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  white-space: nowrap;
`

export const RepeatBlock = styled.div<{
  $depth: number
  children?: React.ReactNode
}>`
  margin-top: ${({ theme }) => theme.core.space.space100};
  margin-bottom: ${({ theme }) => theme.core.space.space100};
  padding: ${({ theme }) => theme.core.space.space100};
  padding-left: ${({ theme, $depth }) =>
    `calc(${theme.core.space.space100} + ${$depth * 16}px)`};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral400};
  border-radius: ${({ theme }) => theme.core.space.space100};
  background: ${({ theme }) => theme.semantic.color.background.neutral100};
  flex: 1;
  min-width: 0;
`

export const RepeatHeader = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: ${({ theme }) => theme.core.space.space100};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.core.space.space100};
`

export const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space025};
  justify-content: flex-end;
`

export const SchemaActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.core.space.space050};
`

export const RepeatLabel = styled.span`
  color: ${({ theme }) => theme.components.typography.colors.secondary};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  font-weight: 600;
  white-space: nowrap;
`

export const SelectOptionAnchor = styled.span<{
  $fullWidth?: boolean
  children?: React.ReactNode
}>`
  display: inline-flex;
  align-items: center;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`

export const DecoderSection = styled.div<{
  $expanded: boolean
  children?: React.ReactNode
}>`
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral400};
  border-radius: ${({ theme }) => theme.core.space.space100};
  background: ${({ theme, $expanded }) =>
    $expanded
      ? theme.semantic.color.background.neutral100
      : theme.semantic.color.background.neutral200};
`

export const DecoderHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.core.space.space100};
  padding: ${({ theme }) => theme.core.space.space100};
`

export const DecoderSummaryButton = styled.button<{
  children?: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space100};
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: inherit;
`

export const DecoderBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.core.space.space200};
  padding: 0 ${({ theme }) => theme.core.space.space100}
    ${({ theme }) => theme.core.space.space100};
`

export const DecoderMatchBadge = styled.span<{
  $warning?: boolean
  children?: React.ReactNode
}>`
  color: ${({ theme, $warning }) =>
    $warning
      ? theme.components.typography.colors.attention
      : theme.components.typography.colors.informative};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  white-space: nowrap;
`
