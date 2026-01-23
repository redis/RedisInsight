import styled from 'styled-components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

export const InfoPanel = styled(FlexItem)`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.components.section.header.backgroundColor};
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  padding: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space100} ${theme.core.space.space200}`};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.components.section.separator.color};
`
