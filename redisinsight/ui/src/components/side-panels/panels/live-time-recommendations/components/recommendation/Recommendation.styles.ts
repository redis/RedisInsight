import styled from 'styled-components'
import { Card } from 'uiSrc/components/base/layout'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export const AccordionBody = styled(Col)`
  min-width: 0;
  overflow: hidden;
  overflow-wrap: break-word;
`

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
