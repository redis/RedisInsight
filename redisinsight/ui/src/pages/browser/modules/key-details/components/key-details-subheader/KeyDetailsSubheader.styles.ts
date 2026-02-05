import styled from 'styled-components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import Divider from 'uiSrc/components/divider/Divider'
import { Theme } from 'uiSrc/components/base/theme/types'

export const SubHeaderContainer = styled(FlexItem)`
  padding: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space150} ${theme.core.space.space200} 
    ${theme.core.space.space000} ${theme.core.space.space200}`};
`

export const StyledDivider = styled(Divider)`
  margin: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space000} ${theme.core.space.space150}`};
  height: ${({ theme }: { theme: Theme }) =>
    theme.core.space.space250} !important;
  width: ${({ theme }: { theme: Theme }) => theme.core.space.space010};
`
