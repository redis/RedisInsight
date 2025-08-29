import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

export const Panel = styled(Row)`
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
`
