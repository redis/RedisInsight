import styled from 'styled-components'

import { IconButton } from 'uiSrc/components/base/forms/buttons'

export const HoverableIconButton = styled(IconButton)`
  opacity: 0;

  tr:hover & {
    opacity: 1;
  }
`
