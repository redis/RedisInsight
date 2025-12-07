import styled, { css } from 'styled-components'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { IconButton } from 'uiSrc/components/base/forms/buttons'

interface StyledGroupBadgeProps {
  $color: string
  $withDeleteBtn?: boolean
  $compressed?: boolean
}
export const DeleteButton = styled(IconButton)`
  margin-left: ${({ theme }) => theme.core.space.space050};
  width: ${({ theme }) => theme.core.space.space150};
  height: ${({ theme }) => theme.core.space.space150};
  color: #ffffff;
  &:hover {
    // disable default hover appearance
    appearance: none;
    background-color: transparent;
    text-decoration: none;
    color: #ffffff;
  }
  & svg {
    width: 10px;
    height: 10px;
  }
`

const compressedStyle = css`
  padding-left: 0;
  padding-right: 0;

  ${DeleteButton} {
    margin-left: 0;
  }
`
export const StyledGroupBadge = styled(RiBadge)<StyledGroupBadgeProps>`
  min-width: ${({ theme }) => theme.core.space.space150};
  & > p {
    display: flex;
    align-items: center;
  }
  ${({ $color }) =>
    `
      background-color: ${$color};
    `}

  ${({ $withDeleteBtn }) => $withDeleteBtn && 'padding-right: 0 !important;'}
  ${({ $compressed }) => $compressed && compressedStyle}
`
