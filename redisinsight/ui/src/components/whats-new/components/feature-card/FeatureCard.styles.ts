import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export const CardContainer = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space150};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.core.space.space100};
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
`

export const Location = styled(Text)`
  color: ${({ theme }) => theme.semantic.color.text.neutral600};
`
