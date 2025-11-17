import styled from 'styled-components'
import { Group, Item } from 'uiSrc/components/base/layout/list'

export const AlertStatusDot = styled.span`
  &::before {
    font-size: 8px;
    padding: 0 14px;
    content: ' \\25CF';
    vertical-align: middle;
  }
`

export const AlertStatusListItem = styled(Item)`
  line-height: 20px;
`
export const AlertStatusList = styled(Group)`
  opacity: 0.85;
  padding-bottom: 5px;
  padding-top: 10px;
`
