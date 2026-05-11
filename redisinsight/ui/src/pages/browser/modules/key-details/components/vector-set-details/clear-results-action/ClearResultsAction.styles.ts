import styled from 'styled-components'

// Anchor span for the tooltip + button. `position: relative` + `z-index`
// preserve the stacking context the legacy action buttons relied on (so the
// tooltip and button stay above sibling subheader content during overflow).
export const ActionAnchor = styled.span`
  position: relative;
  z-index: 2;
`
