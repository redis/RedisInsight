import styled from 'styled-components'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import Divider from 'uiSrc/components/divider/Divider'
export const QADivider = styled(Divider)`
  height: 20px;
`
export const QABtn = styled(EmptyButton)<{ $active: boolean }>`
  height: 24px;
  min-width: auto;
  min-height: auto;
  border-radius: 4px;
  background: ${({ $active }) =>
    $active ? 'var(--browserComponentActive)' : 'transparent'};
  box-shadow: none;

  border: 1px solid
    ${({ $active }) => ($active ? 'var(--euiColorPrimary)' : 'transparent')};

  :global(.RI-flex-row) {
    padding: 0 6px;
    font:
      normal normal 400 14px/17px Graphik,
      sans-serif;
  }

  &:focus,
  &:active {
    outline: 0;
  }

  svg {
    margin-top: 1px;
    width: 14px;
    height: 14px;
  }

  svg path {
    fill: var(--euiTextSubduedColor);
  }
`
