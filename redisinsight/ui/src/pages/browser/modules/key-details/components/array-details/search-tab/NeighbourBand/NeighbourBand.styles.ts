import React from 'react'
import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

const INDEX_COLUMN_MIN_WIDTH = '120px'
const VALUE_COLUMN_MIN_WIDTH = '160px'

// The expanded cell spans the full row (incl. the leading selection-checkbox
// column) and starts flush at the table's left edge. Indenting by the checkbox
// column width plus the index cell's own left padding lands the expanded
// content under the parent row's expand arrow instead of shifting it left.
// `4.2rem` mirrors redis-ui `useRowSelectionColumn` (its default column size).
const SELECTION_COLUMN_WIDTH = '4.2rem'

export const Band = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space050};
  padding-left: calc(
    ${SELECTION_COLUMN_WIDTH} + ${({ theme }) => theme.core.space.space150}
  );
`

export const BandRow = styled.div<
  React.HTMLAttributes<HTMLDivElement> & { $match?: boolean }
>`
  display: grid;
  grid-template-columns:
    minmax(${INDEX_COLUMN_MIN_WIDTH}, 1fr)
    minmax(${VALUE_COLUMN_MIN_WIDTH}, 2fr);
  gap: ${({ theme }) => theme.core.space.space100};
  padding: ${({ theme }) => theme.core.space.space050};
  background: ${({ theme, $match }) =>
    $match ? theme.semantic.color.background.neutral200 : 'transparent'};
`

export const Message = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space100};
  padding-left: calc(
    ${SELECTION_COLUMN_WIDTH} + ${({ theme }) => theme.core.space.space150}
  );
  color: ${({ theme }) => theme.semantic.color.text.neutral600};
`
