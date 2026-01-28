import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const Wrapper = styled(Col)`
  flex: 1;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral400};
  border-radius: ${({ theme }) => theme.core.space.space100};
  position: relative;
`

export const Container = styled.div`
  flex: 1;
  width: 100%;
  overflow: auto;
`

export const Header = styled(Row)`
  height: 42px;
  padding: 0 12px;
  flex-shrink: 0;
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`
