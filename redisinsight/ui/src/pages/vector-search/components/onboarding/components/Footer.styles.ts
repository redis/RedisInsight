import styled from 'styled-components'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'
import { Link } from 'uiSrc/components/base/link/Link'

export const StyledFooter = styled(FlexGroup)`
  margin-top: auto;
  z-index: 1;
`

export const FooterLinks = styled(FlexGroup)`
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space100};
  color: ${({ theme }) => theme.semantic.color.text.neutral500};
`

export const FooterLink = styled(Link)`
  text-decoration: underline !important;

  span {
    display: inline-flex;
    align-items: center;
  }
`
