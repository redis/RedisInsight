import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const EditorWrapper = styled(Col)`
  height: 100%;
  width: 100%;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
`

export const ToggleBar = styled(Row).attrs({
  align: 'center',
  justify: 'start',
  gap: 'l',
  grow: false,
})`
  padding: ${({ theme }) =>
    `${theme.core.space.space100} ${theme.core.space.space200}`};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
  flex-shrink: 0;
`

export const EditorContainer = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
`

/**
 * Placeholder overlay for the Monaco editor.
 * The `left` offset is set via inline style from `editor.getLayoutInfo().contentLeft`
 * so it always aligns with the actual content area regardless of glyph margin
 * or line-number gutter width. Top padding matches `defaultMonacoOptions.padding.top`.
 * `pointer-events: none` lets clicks pass through to the editor underneath.
 */
export const EditorPlaceholder = styled.div<{
  $contentLeft?: number
}>`
  position: absolute;
  top: 10px;
  left: ${({ $contentLeft }) => $contentLeft ?? 0}px;
  right: 0;
  pointer-events: none;
  z-index: 1;
  color: ${({ theme }) => theme.semantic.color.text.neutral500};
  font-family: Menlo, Monaco, 'Courier New', monospace;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.7;
`

export const ActionsBar = styled(Row).attrs({
  align: 'center',
  justify: 'end',
  gap: 'l',
  grow: false,
})`
  padding: ${({ theme }) =>
    `${theme.core.space.space100} ${theme.core.space.space200}`};
  border-top: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  flex-shrink: 0;
`
