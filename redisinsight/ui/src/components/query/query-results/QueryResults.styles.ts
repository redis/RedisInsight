import styled from 'styled-components'
import { Col, Row, FlexItem } from 'uiSrc/components/base/layout/flex'

/* TODO: use theme when it supports theme.semantic.core.radius */
// to replace var(--border-radius-medium)
export const Wrapper = styled(Col)`
  flex: 1;
  height: calc(100% - var(--border-radius-medium));
  width: 100%;
  background-color: ${({ theme }) =>
    theme.semantic?.color.background.neutral100};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: var(--border-radius-medium);
  // HACK: to fix rectangle like view in rounded borders wrapper
  padding-bottom: ${({ theme }) => theme.core.space.space050};

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
