import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Row)`
  gap: ${({ theme }) => theme.core.space.space150};
  justify-content: center;

  input {
    width: 3.5rem;
    height: 4rem;
    text-align: center;
    font-size: 1.75rem;
    font-weight: 600;
    color: ${({ theme }) => theme.semantic.color.text.neutral800};
    background: ${({ theme }) => theme.semantic.color.background.neutral100};
    border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
    border-radius: ${({ theme }) => theme.core.space.space100};
    outline: none;
    caret-color: ${({ theme }) => theme.semantic.color.border.secondary500};
  }

  input:focus {
    border-color: ${({ theme }) => theme.semantic.color.border.secondary500};
    box-shadow: 0 0 0 1px
      ${({ theme }) => theme.semantic.color.border.secondary500};
  }

  input[aria-invalid='true'] {
    border-color: ${({ theme }) => theme.semantic.color.text.danger500};
  }

  input[aria-invalid='true']:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.semantic.color.text.danger500};
  }

  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
