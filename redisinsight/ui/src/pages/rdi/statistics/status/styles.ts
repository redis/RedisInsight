import styled from 'styled-components'
import { Panel } from 'uiSrc/components/panel'
import { Theme } from 'uiSrc/components/base/theme/types'
import { FlexItem } from 'uiSrc/components/base/layout/flex'

export const StyledPanel = styled(Panel)`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.components.section.header.backgroundColor};
  border-radius: ${({ theme }: { theme: Theme }) =>
    theme.components.section.borderRadius};
`

export const StyledInfoPanel = styled(FlexItem)`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.components.section.header.backgroundColor};
  border-radius: 0.4rem;
  padding: 8px 16px;
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.components.section.separator.color};
`
