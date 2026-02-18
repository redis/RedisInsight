import styled from 'styled-components'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'

export const PageContainer = styled(FlexGroup)`
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: ${({ theme }) =>
    `${theme.core.space.space100} ${theme.core.space.space200}`};
  gap: ${({ theme }) => theme.core.space.space100};
`
