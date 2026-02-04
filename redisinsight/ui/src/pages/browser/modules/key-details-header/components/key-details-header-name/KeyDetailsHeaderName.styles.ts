import styled, { css } from 'styled-components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { TextInput } from 'uiSrc/components/base/inputs'

export const InputWrapper = styled(Row)`
  min-width: 150px;
`

export const FlexWrapper = styled(FlexItem)`
  max-width: 450px;
  gap: ${({ theme }) => theme.core.space.space050};
`

export const TooltipAnchorKey = styled.div`
  max-width: 450px;
  height: 31px;
  width: 100%;
`

export const StyledTextInput = styled(TextInput)<{ $isEditing?: boolean }>`
  height: 31px;
  font-size: ${({ theme }) => theme.core.font.fontSize.s14};
  font-weight: ${({ theme }) => theme.core.font.fontWeight.semiBold};
  flex: 1;
  min-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: ${({ theme }) => theme.core.space.space050};

  ${({ $isEditing }) =>
    $isEditing &&
    css`
      height: 31px;
    `}
`

export const CopyKeyWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 31px;
  flex-shrink: 0;
`
