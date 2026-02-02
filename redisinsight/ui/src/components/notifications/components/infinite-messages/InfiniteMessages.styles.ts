import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const DetailsRow = styled(Row)`
  margin-bottom: 4px;
`

export const VendorLabel = styled.span`
  flex-direction: row;
  align-items: center;

  .euiIcon {
    margin-right: 4px;
  }
`

export const Loading = styled.span`
  border-top-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
`
