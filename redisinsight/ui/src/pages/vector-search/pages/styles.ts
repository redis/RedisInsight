import styled from 'styled-components'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'

export const PageWrapper = styled(FlexGroup)`
  background-color: ${({ theme }) =>
    theme.semantic?.color.background.neutral100};
  padding: ${({ theme }) => theme.core?.space.space100}
    ${({ theme }) => theme.core?.space.space200};
  height: 100%;
  width: 100%;
`
