import styled from 'styled-components'

import { IconButton } from 'uiSrc/components/base/forms/buttons'

export const StyledCopyButton = styled(IconButton)`
  margin-bottom: 3px;
  opacity: 0;

  :hover {
    opacity: 1;
  }
`
