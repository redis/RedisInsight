import styled from 'styled-components'

import { RiIcon } from 'uiSrc/components/base/icons'

export const IconWrapper = styled.div<{ children?: React.ReactNode }>`
  margin-left: -${({ theme }) => theme.core.space.space150};
`

export const InfoIcon = styled(RiIcon).attrs({
  type: 'ToastInfoIcon',
  size: 'S',
  color: 'custom',
})`
  color: ${({ theme }) => theme.semantic.color.icon.attention500};
  margin-left: -1px;
`
