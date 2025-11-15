import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

type BaseCardContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  isSelected?: boolean
}

export const BaseCardContainer = styled.div<BaseCardContainerProps>`
  // TODO: replace with semantic colors
  border: 1px solid ${({ isSelected }) => (isSelected ? '#40A5CD' : '#B9C2C6')};
  background-color: ${({ isSelected }) => (isSelected ? '#F2FBFF' : 'inherit')};
  // 8px
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  // 10px
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`
