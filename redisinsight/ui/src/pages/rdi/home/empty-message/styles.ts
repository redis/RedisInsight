import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'
import { FlexItem } from 'uiSrc/components/base/layout/flex'

export const EmptyPageContainer = styled(FlexItem)`
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }: { theme: Theme }) =>
    theme.components.card.borderRadius};
`
