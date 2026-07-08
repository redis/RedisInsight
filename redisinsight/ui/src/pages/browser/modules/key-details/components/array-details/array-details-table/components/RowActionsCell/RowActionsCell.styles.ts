import styled from 'styled-components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'

// Hidden by default; revealed on row hover/focus or while its own confirm
// popover is open (the `array-row-action--open` modifier) so it doesn't fade
// out when the pointer moves onto the popover. The reveal rules live in
// ArrayDetailsTable's StyledTable (they need the row ancestor). Staying in the
// DOM at opacity 0 keeps it focusable for keyboard users.
export const ActionCell = styled(FlexItem)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.1s ease-in;
`
