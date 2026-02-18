import styled from 'styled-components'

import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'

export const SwitchButton = styled(ButtonGroup.Button)`
  width: ${({ theme }) => theme.core.space.space300} !important;
  min-width: ${({ theme }) => theme.core.space.space300} !important;
`
