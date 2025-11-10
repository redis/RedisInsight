import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export const StyledDiscoverText = styled(Text)`
  align-self: flex-start;
`

export const StyledContainer = styled(Col)``

export const StyledCreateDbSection = styled(Row)`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.core.space.space100};
  padding-block: ${({ theme }) => theme.core.space.space100};
  padding-inline: ${({ theme }) => theme.core.space.space200};
`

export const StyledAgreementContainer = styled.div`
  margin-top: ${({ theme }) => theme.core.space.space200};
  width: 50%;
`
