import styled from 'styled-components'
import { Col, Row, FlexItem } from 'uiSrc/components/base/layout/flex'

/* TODO: use theme when it supports theme.semantic.core.radius */
// to replace var(--border-radius-medium)
export const Wrapper = styled(Col)`
  flex: 1;
  height: 100%;
  width: 100%;
  background-color: ${({ theme }) =>
    theme.semantic?.color.background.neutral100};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: var(--border-radius-medium);
  overflow: hidden;

  position: relative;
`

export const Container = styled(FlexItem)`
  width: 100%;
  overflow: auto;
  color: ${({ theme }) => theme.semantic.color.text.neutral700};
`

export const Header = styled(Row)`
  height: 42px;
  padding: 0 ${({ theme }) => theme.core.space.space150};

  flex-shrink: 0;
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`
