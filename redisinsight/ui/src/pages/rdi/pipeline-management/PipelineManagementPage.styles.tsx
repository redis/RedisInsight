import styled from 'styled-components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

// Ratio for Navigation/Content is 1:4
export const NavigationContainer = styled(FlexItem).attrs({
  grow: 1,
})`
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
  border-right: 1px solid
    ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.border.informative100};
  min-width: 300px;
  max-width: 400px;
`

export const ContentContainer = styled(FlexItem).attrs({
  grow: 4,
})``
