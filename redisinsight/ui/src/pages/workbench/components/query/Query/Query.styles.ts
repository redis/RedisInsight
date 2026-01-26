import { ComponentPropsWithRef } from 'react'
import styled, { css } from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const Wrapper = styled.div<ComponentPropsWithRef<'div'>>`
  position: relative;
  width: 100%;
  height: 100%;

  .editorBounder {
    bottom: 6px;
    left: 18px;
    right: 46px;
  }
`

export const Container = styled(Col)<{
  $disabled?: boolean
}>`
  padding: ${({ theme }) => theme.core.space.space200};
  width: 100%;
  height: 100%;
  word-break: break-word;
  text-align: left;
  letter-spacing: 0;
  background-color: ${({ theme }) => theme.components.card.bgColor};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.8;
    `}
`

export const InputContainer = styled.div<ComponentPropsWithRef<'div'>>`
  max-height: calc(100% - 32px);
  flex-grow: 1;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
`

export const QueryFooter = styled(Row).attrs({
  align: 'center',
  justify: 'between',
})`
  margin-top: ${({ theme }) => theme.core.space.space200};
  flex-shrink: 0;
`
