import styled from 'styled-components'
import { Banner } from 'uiSrc/components/base/display/banner'
import { Col } from 'uiSrc/components/base/layout/flex'

export const Wrapper = styled(Col)`
  width: 100%;
  min-width: 0;
`

export const EditorContainer = styled.div<{
  $height: string
  children: React.ReactNode
}>`
  height: ${({ $height }) => $height};
  border: 1px solid ${({ theme }) => theme.semantic?.color?.border?.neutral500};
  overflow: hidden;
`

export const StyledBanner = styled(Banner)`
  width: 100%;
`
