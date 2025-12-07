import styled from 'styled-components'
import { RiIcon } from 'uiSrc/components/base/icons'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export const StyledContent = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space200};
`

export const StyledPopoverContainer = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space200};
  width: 430px;
}`

export const StyledPopoverIcon = styled(RiIcon)`
  position: absolute;
`

export const StyledPopoverText = styled(Text)`
  padding-left: ${({ theme }) => theme.core.space.space400};
`

export const StyledFooter = styled(Row)`
  padding: 0 ${({ theme }) => theme.core.space.space200};
`
