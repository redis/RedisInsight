import styled from "styled-components"

import { Row } from "uiSrc/components/base/layout/flex"
import { ColorText } from "uiSrc/components/base/text"

export const StyledContentItemRow = styled(Row)`
  &:not(:last-of-type) {
    padding-bottom: ${({ theme }) => theme.core.space.space150};
  }
`

export const StyledAbbreviationText = styled(ColorText)`
  margin-right: ${({ theme }) => theme.core.space.space100};
  vertical-align: text-top;
`

export const StyledContentText = styled(ColorText)`
  vertical-align: text-top;
`

