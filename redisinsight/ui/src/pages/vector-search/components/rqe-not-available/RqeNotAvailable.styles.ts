import styled from 'styled-components'
import { Card } from 'uiSrc/components/base/layout'
import { Row, Col } from 'uiSrc/components/base/layout/flex'
import { Group, Item } from 'uiSrc/components/base/layout/list'

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
  gap: 'xxl',
})`
  flex: 1;
`

export const IllustrationSection = styled(Row).attrs({
  align: 'center',
  justify: 'center',
  grow: false,
})`
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

export const FeatureListItem = styled(Item)``

export const CTAWrapper = styled(Col)``

export const ButtonWrapper = styled(Col).attrs({
  gap: 'l',
  align: 'start',
})``
