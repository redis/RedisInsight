import styled from 'styled-components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'

export const Container = styled(FlexItem)`
  padding: ${({ theme }) =>
    `${theme.core?.space.space150} ${theme.core?.space.space200} 0`};
`
