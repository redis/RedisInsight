import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const PanelWrapper = styled.div`
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`
