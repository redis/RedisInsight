import styled from 'styled-components'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'

export const ProfileSelect = styled(RiSelect)`
  border: none;
  background-color: inherit;
  //color: var(--iconsDefaultColor);
  width: 46px;
  padding: inherit;

  &.profiler {
    min-width: 50px;
  }

  &.toggle-view {
    min-width: 40px;
  }

  & ~ div {
    right: 0;

    svg {
      width: 10px;
      height: 10px;
    }
  }
`
