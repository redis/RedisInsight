import styled from 'styled-components'
import Divider from 'uiSrc/components/divider/Divider'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const StyledDivider = styled(Divider)`
  margin: 0 ${({ theme }: { theme: Theme }) => theme.core.space.space150};
`
