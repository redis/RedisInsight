import { SideBar } from '@redis-ui/components'
import styled from 'styled-components'

export type RiSideBarItemIconProps = Omit<
  React.ComponentProps<typeof SideBar.Item.Icon>,
  'width' | 'height'
> & {
  width?: string
  height?: string
  centered?: boolean
}

export const StyledIcon = styled(SideBar.Item.Icon)<RiSideBarItemIconProps & {
  $centered?: boolean
}>`
  ${({ width = 'inherit' }) => `
    width: ${width};
  `}
  ${({ height = 'inherit' }) => `
    height: ${height};
  `}
  ${({ $centered }) => $centered && `
    justify-content: center;
    align-items: center;
  `}
`
