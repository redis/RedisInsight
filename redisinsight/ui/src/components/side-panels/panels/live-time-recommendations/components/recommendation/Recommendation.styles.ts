import styled from 'styled-components'
import { Card } from 'uiSrc/components/base/layout'
import { Text } from 'uiSrc/components/base/text'

export const RecommendationContent = styled(Card)`
  padding: 0;
  border: none;
  box-shadow: none;
`

export const Title = styled(Text)`
  margin-top: ${({ theme }) => theme.core?.space.space100};
  margin-bottom: ${({ theme }) => theme.core?.space.space100};
  font-weight: bold;
  color: ${({ theme }) => theme.semantic.color.text.danger500};
`
