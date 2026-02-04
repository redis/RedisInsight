import styled from 'styled-components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'

export const Container = styled.div`
  display: flex;
  flex-grow: 1;
  padding: ${({ theme }) => theme.core.space.space200} 40px 30px;
  text-align: center;

  h4 {
    font-size: 18px;
    font-weight: normal;
    margin-bottom: 18px;
    line-height: 24px;
  }
`

export const TextWrapper = styled(FlexItem)`
  max-width: 640px;
  position: relative;
  top: -7%;
`

export const CloseRightPanel = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.core.space.space250};
  right: ${({ theme }) => theme.core.space.space200};
`

export const CloseBtn = styled(IconButton)`
  svg {
    width: 20px;
    height: 20px;
  }
`
