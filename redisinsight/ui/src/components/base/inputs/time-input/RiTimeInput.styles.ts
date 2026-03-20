import styled from 'styled-components'
import TextInput from 'uiSrc/components/base/inputs/TextInput'

export const StyledTimeInput = styled(TextInput)`
  min-width: 7rem;

  &::-webkit-calendar-picker-indicator {
    display: none;
    appearance: none;
  }
`
