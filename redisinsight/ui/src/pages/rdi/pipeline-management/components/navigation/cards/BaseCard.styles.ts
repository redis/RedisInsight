import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

type BaseCardContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  isSelected?: boolean
}

export const BaseCardContainer = styled.div<BaseCardContainerProps>`
  border: 1px solid
    ${({ isSelected, theme }) =>
      isSelected
        ? theme.semantic.color.text.informative400
        : theme.semantic.color.border.neutral500};
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.semantic.color.background.neutral200 : 'inherit'};
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`
