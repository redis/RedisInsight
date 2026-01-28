import styled, { css } from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const Wrapper = styled.div`
  position: relative;
  height: 100%;

  .editorBounder {
    bottom: 6px;
    left: 18px;
    right: 46px;
  }
`

export const Container = styled(Col)<{ $disabled?: boolean }>`
  padding: ${({ theme }) => theme.core.space.space200};
  width: 100%;
  height: 100%;
  word-break: break-word;
  text-align: left;
  letter-spacing: 0;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral200};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral400};
  border-radius: ${({ theme }) => theme.core.space.space100};

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.8;
    `}
`

export const DisabledActions = styled.div`
  pointer-events: none;
  user-select: none;
`

export const ContainerPlaceholder = styled.div`
  display: flex;
  padding: ${({ theme }) =>
    `${theme.core.space.space100} ${theme.core.space.space200}`};
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral200};

  > div {
    border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral400};
    background-color: ${({ theme }) =>
      theme.semantic.color.background.neutral100};
    padding: ${({ theme }) =>
      `${theme.core.space.space100} ${theme.core.space.space250}`};
    width: 100%;
  }
`

export const Input = styled.div`
  max-height: calc(100% - 32px);
  flex-grow: 1;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral400};
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
`

export const QueryFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.core.space.space200};
  flex-shrink: 0;
`

export const Script = styled.span`
  font: normal normal bold 14px/17px Inconsolata;
  min-width: 5px;
  display: inline;
`
