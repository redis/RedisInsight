import styled from 'styled-components'
import { scrollbarStyles } from 'uiSrc/styles/mixins'
import { Theme } from 'uiSrc/components/base/theme/types'

export const ContentWrapper = styled.div`
  ${scrollbarStyles()}
  max-height: 100%;
  padding: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space300} ${theme.core.space.space500}`};
`
