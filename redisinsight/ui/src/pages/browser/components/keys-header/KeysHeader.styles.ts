import styled from 'styled-components'
import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'
import { Col } from 'uiSrc/components/base/layout/flex'

export const Content = styled(Col)`
  width: 100%;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
  padding: ${({ theme }) => theme.core.space.space050}
    ${({ theme }) => theme.core.space.space150};
  flex-shrink: 0;
  position: relative;
`

export const ViewSwitchButton = styled(ButtonGroup.Button)`
  width: 24px;
  min-width: 24px;
`

export const ColumnsButton = styled.div`
  button {
    padding: ${({ theme }) => theme.core.space.space050};
    padding-right: ${({ theme }) => theme.core.space.space100};
    border-color: transparent;
    box-shadow: none;
  }
`

export const Checkbox = styled.div`
  white-space: nowrap;
`
