import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Card } from 'uiSrc/components/base/layout'

export const NoResults = styled(Col)`
  max-width: 540px;
  height: 100%;
  min-height: 400px;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
`

export const NoResultsPanel = styled(Card)`
  width: 100%;
  position: relative;
  border-radius: ${({ theme }) => theme.core.space.space100};
  border-color: ${({ theme }) => theme.semantic.color.border.neutral400};
  background-color: ${({ theme }) => theme.semantic.color.background.neutral200};
`

export const ArrowToGuides = styled.svg`
  fill: none;
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(75%, -33%);
`

export const NoResultsIcon = styled.img`
  width: 94px;
  height: auto;
`
