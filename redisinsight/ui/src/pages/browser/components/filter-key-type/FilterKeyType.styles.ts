import styled from 'styled-components'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'

export const Container = styled.div<{ $unsupported?: boolean }>`
  width: 168px;
  height: 36px;
  flex-shrink: 0;
  position: relative;
`

export const FilterKeyTypeSelect = styled(RiSelect)`
  height: 100%;
`

export const UnsupportedInfo = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  cursor: pointer;
`

export const DropdownOption = styled.div`
  padding-left: ${({ theme }) => theme.core.space.space075};
`
