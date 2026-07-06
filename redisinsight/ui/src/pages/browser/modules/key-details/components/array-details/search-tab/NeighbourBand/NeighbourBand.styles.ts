import React from 'react'
import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

const INDEX_COLUMN_MIN_WIDTH = '120px'
const VALUE_COLUMN_MIN_WIDTH = '160px'

export const Band = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space050};
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
  color: ${({ theme }) => theme.semantic.color.text.neutral600};
`
