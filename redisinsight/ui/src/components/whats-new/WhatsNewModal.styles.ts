import styled from 'styled-components'
import { Modal } from 'uiSrc/components/base/display/modal'
import { Col } from 'uiSrc/components/base/layout/flex'

export const StyledContent = styled(Modal.Content.Compose)`
  width: 640px;
  max-width: calc(100vw - 120px);
  max-height: calc(100vh - 120px);
`

// Keeps the version selector pinned while the cards scroll below it.
export const StyledBody = styled(Modal.Content.Body.Compose)`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`

export const CardsList = styled(Col)`
  min-height: 0;
  overflow-y: auto;
`

export const VersionSelectWrapper = styled.div`
  max-width: 240px;
`
