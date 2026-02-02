import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const EmptyPipelineContainer = styled(Col).attrs({
  align: 'center',
  justify: 'center',
})`
  margin: auto;
  height: calc(100vh - 115px);
`

export const SubTitle = styled(Text)`
  font-size: 18px;
  font-weight: 500;
  margin-top: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
`
