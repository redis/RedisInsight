import styled from 'styled-components'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { RiIcon } from 'uiSrc/components/base/icons'

import { Link } from 'uiSrc/components/base/link/Link'

export const StyledConnectivityLink = styled(Link)`
  min-width: 150px;
  padding: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral700};
  color: ${({ theme }) => theme.semantic.color.text.neutral800};

  // adding position relative to allow possible elements
  // inside the link to be positioned absolutely
  position: relative;

  &:hover {
    text-decoration: none !important;
    background: none;
    color: ${({ theme }) => theme.semantic.color.text.neutral800};
    opacity: 0.8;
    transform: translateY(-1px);
    box-shadow: none;
  }
`

export const StyledBadge = styled(RiBadge)`
  position: absolute;
  top: 10px;
  left: 10px;
`

// This style is needed as the max built in size of the icon is not sufficient in this case
export const StyledIcon = styled(RiIcon)`
  width: 30px;
  height: 30px;
`
