import { Theme } from '@redis-ui/styles'
import styled from 'styled-components'
import { scrollbarStyles } from 'uiSrc/styles/mixins'

export const ClusterDetailsPageWrapper = styled.div`
  ${scrollbarStyles()};
  height: 100%;
  padding: 0 ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`
