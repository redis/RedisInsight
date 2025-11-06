import styled from 'styled-components'

import { IconButton } from 'uiSrc/components/base/forms/buttons'

export const HoverableIconButton = styled(IconButton)`
  transition: opacity 200ms ease-in-out;
  opacity: 0;

  tr:hover & {
    opacity: 1;
  }
`
