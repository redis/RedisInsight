import styled from 'styled-components'

import { ToggleButton } from 'uiSrc/components/base/forms/buttons'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'

export const ColumnsButton = styled(ToggleButton)`
  padding: ${({ theme }) => theme.core.space.space050};
  border-color: transparent;
  box-shadow: none;
`

export const StyledCheckbox = styled(Checkbox)`
  white-space: nowrap;
`
