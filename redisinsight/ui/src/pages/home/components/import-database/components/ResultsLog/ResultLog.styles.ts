import styled from 'styled-components'

import { RICollapsibleNavGroup } from 'uiSrc/components/base/display'

// Ideally this should be coming from the Section component
// replacing the box-shadow with the border so it is not cut by the parent container
export const StyledCollapsibleNavGroup = styled(RICollapsibleNavGroup)`
  box-shadow: none;
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral600};
`
