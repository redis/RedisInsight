import styled from 'styled-components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

export const StyledRdiJobConfigContainer = styled(FlexItem)`
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
`
