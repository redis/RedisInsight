import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Col)`
  height: 100%;
`

export const Error = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
  border-top: 1px solid ${({ theme }) => theme.semantic.color.border.primary300};
  flex-grow: 1;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.semantic.color.text.danger500};
`
