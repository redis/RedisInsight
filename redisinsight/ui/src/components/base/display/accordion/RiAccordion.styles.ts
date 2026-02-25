import styled from 'styled-components'
import { Section } from '@redis-ui/components'

export const StyledLabel = styled(Section.Header.Label)`
  flex-grow: 1;
  & label {
    display: inline-block;
    width: 100%;
  }
`
