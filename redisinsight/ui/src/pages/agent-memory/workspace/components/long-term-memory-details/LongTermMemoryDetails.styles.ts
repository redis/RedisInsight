import { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { TextArea } from 'uiSrc/components/base/inputs'

import { fontMono, palette } from '../../AgentMemoryWorkspacePage.styles'

/* A description list of the record's fields: label (dt) on the left, value
 * (dd) on the right. Grid columns keep the two aligned; the label column is a
 * fixed width and the value column takes the rest. */
export const Fields = styled.dl<HTMLAttributes<HTMLDListElement>>`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin: 0;
  padding: ${({ theme }) => theme.core.space.space150}
    ${({ theme }) => theme.core.space.space200};
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  align-content: start;
  font-size: 1.25rem;

  /* The shared inline editor centers its value in a fixed 42px row; drop that
   * so the value and its hover edit button start at the top of the row,
   * level with the label. */
  [class*='contentWrapper'] {
    align-items: flex-start;
    min-height: 0;
  }
`

export const FieldLabel = styled.dt<HTMLAttributes<HTMLElement>>`
  padding: ${({ theme }) => theme.core.space.space100} 0;
  border-bottom: 1px solid ${palette.border};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${palette.textSecondary};
`

export const FieldValue = styled.dd<HTMLAttributes<HTMLElement>>`
  margin: 0;
  padding: ${({ theme }) => theme.core.space.space100} 0;
  padding-left: ${({ theme }) => theme.core.space.space200};
  border-bottom: 1px solid ${palette.border};
  min-width: 0;
  color: ${palette.text};
  word-break: break-word;
  white-space: pre-wrap;
`

/* Read-only text with a hover-revealed edit pencil, matching the inline
 * editors used by the other fields. */
export const TextReadonly = styled(Row)`
  .ltm-inline-edit {
    flex-shrink: 0;
    opacity: 0;
  }
  &:hover .ltm-inline-edit {
    opacity: 1;
  }
`

/* Editing row: textarea at the field width with the controls beside it, laid
 * out like the read-only row. styled(TextArea) styles the wrapper TextArea
 * renders around the <textarea>, so growing it (not the inner element) is what
 * makes the editor fill the width. */
export const TextEditRow = styled(Row)`
  button {
    flex-shrink: 0;
  }
`

export const TextEditorArea = styled(TextArea)`
  flex: 1;
  min-width: 0;
`

export const ReadOnlyValue = styled.span<HTMLAttributes<HTMLSpanElement>>`
  font-family: ${fontMono};
  color: ${palette.textSecondary};
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space050};
`

export const Placeholder = styled.span<HTMLAttributes<HTMLSpanElement>>`
  color: ${palette.textMuted};
  font-style: italic;
`

export const RecordId = styled.span<HTMLAttributes<HTMLSpanElement>>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space050};
  font-family: ${fontMono};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  color: ${palette.textSecondary};
`

export const HeaderRight = styled.div<HTMLAttributes<HTMLDivElement>>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space050};
`

export const EmptyState = styled(Col)`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.core.space.space300};
  color: ${palette.textMuted};
  font-style: italic;
  text-align: center;
`

export {
  Pane,
  PaneHeaderBlock,
  PaneHeader,
  PaneTitle,
} from '../../AgentMemoryWorkspacePage.styles'
