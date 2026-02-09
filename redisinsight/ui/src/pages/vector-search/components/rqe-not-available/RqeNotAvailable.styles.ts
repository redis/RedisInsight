import styled from 'styled-components'
import { Card } from 'uiSrc/components/base/layout'
import { Row, Col } from 'uiSrc/components/base/layout/flex'
import { Group, Item } from 'uiSrc/components/base/layout/list'
import { Text } from 'uiSrc/components/base/text'

export const StyledCard = styled(Card)`
  height: 100%;
  justify-content: center;
  align-items: center;
  position: relative;
`

export const StyledCardBody = styled(Row).attrs({
  align: 'center',
  gap: 'xxl',
})`
  flex: 0 0 auto;
  max-width: 1000px;
  width: 100%;
  height: fit-content;
`

export const ContentSection = styled(Col).attrs({
  gap: 'xl',
})`
  flex: 1;
  max-width: 550px;
`

export const CtaText = styled(Text).attrs({
  color: 'primary',
})`
  max-width: 350px;
`

export const DescriptionText = styled(Text).attrs({
  color: 'primary',
})`
  max-width: 450px;
`

export const IllustrationSection = styled(Row).attrs({
  align: 'end',
  justify: 'center',
  grow: false,
})`
  height: 100%;
  flex-shrink: 0;

  svg {
    width: 400px;
    height: auto;
  }
`

export const FeatureList = styled(Group).attrs({
  gap: 'm',
})`
  list-style: none;
  padding: 0;
  margin: 0;
`

export const FeatureListItem = styled(Item)`
  & > button,
  & > span {
    gap: ${({ theme }) => theme.core.space.space100};
    justify-content: start;
  }
`

export const CTAWrapper = styled(Col)``

export const ButtonWrapper = styled(Col).attrs({
  gap: 'xl',
  align: 'start',
})``
