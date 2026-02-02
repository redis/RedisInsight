import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

export const FolderApproximate = styled.div<
  React.HTMLAttributes<HTMLDivElement>
>`
  display: inline-block;
  width: 86px;
  min-width: 86px;
  text-align: right;
  transition: transform ease 0.3s;
`

export const FolderKeyCount = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  display: inline-block;
  width: 90px;
  min-width: 90px;
  text-align: right;
  transition: transform ease 0.3s;
`

export const FolderActions = styled(Row)`
  &:hover {
    ${FolderApproximate},
    ${FolderKeyCount} {
      transform: translateX(-8px);
    }
  }
`
