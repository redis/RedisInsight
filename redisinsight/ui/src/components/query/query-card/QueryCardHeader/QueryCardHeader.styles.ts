import styled from 'styled-components'
import { ColorText } from 'uiSrc/components/base/text'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'

export const ModeLabel = styled(ColorText)`
  display: flex;
  align-items: center;
  gap: 6px;

  & + & {
    margin-top: 4px;
  }
`

export const ParametersIconWrapper = styled(FlexItem)`
  padding-right: 0;

  .parameters-anchor {
    display: flex;
    align-items: center;
    width: fit-content;
  }
`

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
