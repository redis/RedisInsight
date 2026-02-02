import styled, { css } from 'styled-components'
import { Link } from '../link/Link'

export const StyledExternalLink = styled(Link)<{ display: string }>`
  ${({ display }) =>
    display &&
    css`
      display: ${display};
    `}
`
