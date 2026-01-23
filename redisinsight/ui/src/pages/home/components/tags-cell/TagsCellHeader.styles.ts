import styled from 'styled-components'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'

export const FilterByTagIcon = styled(RiIcon)`
  pointer-events: all;
  cursor: pointer;
  margin: ${({ theme }) => theme.core.space.space100};
`

export const FilterTagCheckbox = styled(Checkbox)`
  label {
    text-overflow: ellipsis;
    width: 100%;
    overflow: hidden;
  }
`
