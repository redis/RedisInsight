import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

export const FormContainer = styled(Col)`
  position: relative;
  padding: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space250} ${theme.core.space.space200} 0 ${theme.core.space.space200}`};
  @media only screen and (min-width: 768px) {
    padding: ${({ theme }: { theme: Theme }) =>
      `${theme.core.space.space400} ${theme.core.space.space200} 0 ${theme.core.space.space400}`};
    max-width: 800px;
  }
`

export const FormWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  min-height: 0;
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space010};
`
