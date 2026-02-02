import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled(Col).attrs({
  align: 'center',
  justify: 'center',
})`
  scrollbar-width: thin;
  overflow: auto;
  width: 100%;
  height: 100%;
`

export const Content = styled(Col).attrs({
  align: 'center',
})`
  margin: auto;
`

export const Title = styled(Text)`
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  padding-bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
`

export const Summary = styled(Text)`
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.13px;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
`

export const SummaryLink = styled(Link)`
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.13px;
`
