import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

export const EmptyPageContainer = styled.div`
  display: flex;
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }: { theme: Theme }) =>
    theme.components.card.borderRadius};
  height: 100%;
`
