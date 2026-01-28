import styled from 'styled-components'
import { IconButton } from 'uiSrc/components/base/forms/buttons'

export const CloseRightPanel = styled.div`
  position: absolute;
  top: 22px;
  right: 18px;
`

export const CloseBtn = styled(IconButton)`
  svg {
    width: 20px;
    height: 20px;
  }
`

export const Placeholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: ${({ theme }) => theme.core.space.space150};
  width: 100%;
`
