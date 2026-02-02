import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Card } from 'uiSrc/components/base/layout'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Wrapper = styled.div`
  height: 100%;
`

export const RecommendationsContainer = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  max-height: calc(100% - 70px);
`

export const EmptyContainer = styled(Col).attrs({
  align: 'center',
  justify: 'center',
})`
  height: 100%;
  padding-bottom: 162px;
`

export const BigText = styled(Text)`
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  margin: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space200} 0 ${theme.core.space.space150}`};
`

export const LoadingWrapper = styled.div`
  width: 100%;
  height: 129px;
  margin-top: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
`

export const Recommendation = styled.div`
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral300};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  margin-bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  padding: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space300} ${theme.core.space.space200} ${theme.core.space.space150}`};
`

export const Footer = styled(Row).attrs({
  align: 'center',
  justify: 'between',
})`
  padding-top: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
  margin-top: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
  border-top: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral300};
`

export const AccordionLabel = styled(Row).attrs({
  align: 'center',
  justify: 'start',
  gap: 'm',
})`
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
`

export const RedisStackLink = styled(Link)`
  margin-right: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`

export const RedisStackIcon = styled.span`
  width: 20px;
  height: 20px;

  svg {
    width: 20px;
    height: 20px;
  }
`

export const NoRecommendationsIcon = styled(RiIcon)`
  width: 154px;
  height: 127px;
`

export const RecommendationContent = styled(Card)`
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
`
