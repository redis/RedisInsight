import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled(Col).attrs({
  align: 'center',
})`
  width: 100%;
  height: 1px;
  min-height: 100%;
  padding-bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`

export const FormContainer = styled.div`
  position: relative;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  flex: 1;
`

export const Form = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`
