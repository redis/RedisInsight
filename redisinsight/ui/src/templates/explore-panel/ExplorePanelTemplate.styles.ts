import styled from 'styled-components'
import { ResizablePanel } from 'uiSrc/components/base/layout'

export const MainWrapper = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`

export const FlexColPanel = styled(ResizablePanel)`
  display: flex;
  flex-direction: column;
`
