import styled from 'styled-components'
import { Link } from './Link'
import { Theme } from 'uiSrc/components/base/theme/types'

export const UserProfileLink = styled(Link)`
  padding: 8px 12px !important;
  width: 100%;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.informative400} !important;
  text-decoration: none !important;

  span {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    text-decoration: none !important;
    cursor: pointer;
  }
`
