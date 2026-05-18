import styled from 'styled-components'

import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export const Layout = styled(Row)`
  width: 100%;
  padding: 0 15%;
`

export const PreviewColumn = styled(Col)`
  width: 150px;
  background: ${({ theme }) => theme.semantic.color.background.informative200};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.informative300};
  border-radius: ${({ theme }) =>
    theme.components.boxSelectionGroup.item.borderRadius};
  padding: ${({ theme }) => theme.core.space.space150};
`

export const PreviewRowText = styled(Text)`
  font-family: 'Source Code Pro', 'Inconsolata', monospace;
`

export const InfoRow = styled(Row)`
  /* Fix the label column width so values line up as a flush-left column. */
  & > *:first-child {
    min-width: 70px;
  }
`
