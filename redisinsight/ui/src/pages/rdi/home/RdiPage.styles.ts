import styled from 'styled-components'
import { Page } from 'uiSrc/components/base/layout/page'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const RdiHomePage = styled(Page)`
  padding: 1px ${({ theme }: { theme: Theme }) => theme.core.space.space200}
    ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`
