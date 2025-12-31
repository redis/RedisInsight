import styled from 'styled-components'
import { Panel as BasePanel } from 'uiSrc/components/panel'
import { Theme } from 'uiSrc/components/base/theme/types'

export const Panel = styled(BasePanel)`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.components.section.header.backgroundColor};
  border-radius: ${({ theme }: { theme: Theme }) =>
    theme.components.section.borderRadius};
`

