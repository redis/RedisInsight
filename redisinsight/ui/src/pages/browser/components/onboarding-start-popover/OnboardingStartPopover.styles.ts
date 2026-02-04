import styled from 'styled-components'

// Styles for panelClassName - using global class wrapper approach
export const popoverClassName = 'onboarding-start-popover'

export const PopoverStyles = styled.div`
  height: 0;
  width: 0;
  .${popoverClassName} {
    width: 360px;
    margin-right: 30px;
  }
`
