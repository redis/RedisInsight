import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const PageWrapper = styled(Col)`
  background-color: ${({ theme }) =>
    theme.semantic?.color.background.neutral100};
  padding: ${({ theme }) => theme.core?.space.space100}
    ${({ theme }) => theme.core?.space.space200};
  height: 100%;
  width: 100%;
`

export const TitleRow = styled(Row).attrs({ grow: false })`
  padding-bottom: ${({ theme }) => theme.core?.space.space200};
`

export const CardContainer = styled(Col)`
  flex: 1;
  min-height: 0;
  background: ${({ theme }) => theme.semantic?.color.background.neutral100};
  border: 1px solid ${({ theme }) => theme.semantic?.color?.border?.neutral500};
  border-radius: ${({ theme }) => theme.components?.card?.borderRadius};
  overflow: hidden;
`

export const ToolbarRow = styled(Row).attrs({ grow: false })`
  padding: ${({ theme }) => theme.core?.space.space100}
    ${({ theme }) => theme.core?.space.space100};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic?.color?.border?.neutral500};
`

export const ToolbarRight = styled(Row).attrs({ grow: false })`
  margin-left: auto;
  gap: ${({ theme }) => theme.core?.space.space200};
`

export const VerticalSeparator = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.semantic?.color?.border?.neutral500};
  flex-shrink: 0;
`

export const IndexPrefixRow = styled(Row).attrs({ grow: false })`
  gap: ${({ theme }) => theme.core?.space.space200};
`

export const ContentArea = styled(Col)`
  flex: 1;
  overflow: auto;
  min-height: 0;
`

export const FooterRow = styled(Row).attrs({ grow: false })`
  border-top: 1px solid
    ${({ theme }) => theme.semantic?.color?.border?.neutral500};
  padding: ${({ theme }) => theme.core?.space.space100}
    ${({ theme }) => theme.core?.space.space100};
`
