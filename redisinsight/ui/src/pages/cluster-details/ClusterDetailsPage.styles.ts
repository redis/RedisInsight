import styled from 'styled-components'
import { scrollbarStyles } from 'uiSrc/styles/mixins'

export const Wrapper = styled.div`
  ${scrollbarStyles()}
  max-height: calc(100% - 134px);
  max-width: 1920px;
`
