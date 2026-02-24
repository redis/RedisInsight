import styled from 'styled-components'
import { Modal } from 'uiSrc/components/base/display/modal'

export const ModalContent = styled(Modal.Content.Compose)`
  width: 640px;
  max-width: calc(100vw - 120px);
  max-height: calc(100vh - 120px);
`

export const ModalBody = styled(Modal.Content.Body)`
  flex: 1;
  min-height: 0;
`
