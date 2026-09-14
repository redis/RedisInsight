import styled from 'styled-components'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

export const PageContainer = styled(Col)`
  height: 100%;
  padding-bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`

export const PlaceholderContainer = styled(FlexItem)`
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
`
