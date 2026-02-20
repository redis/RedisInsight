import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const Panel = styled(Col)`
  width: 100%;
  height: 100%;
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  background-color: ${({ theme }) =>
    theme.semantic?.color.background.neutral100};
  overflow: auto;
`

export const PanelHeader = styled(Row).attrs({
  align: 'center',
  justify: 'between',
  grow: false,
})`
  padding: ${({ theme }) =>
    `${theme.core.space.space150} ${theme.core.space.space200}`};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
  flex-shrink: 0;
`

export const PanelBody = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space200};
  overflow: auto;
  flex: 1;
`
