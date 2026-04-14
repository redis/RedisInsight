import styled from 'styled-components'
import { Modal } from 'uiSrc/components/base/display/modal'
import { Text } from 'uiSrc/components/base/text'
import { CopyButton } from 'uiSrc/components/copy-button'

export const ModalContent = styled(Modal.Content.Compose)`
  width: 640px;
  max-width: calc(100vw - 120px);
  max-height: calc(100vh - 120px);
`

export const ModalBody = styled(Modal.Content.Body)`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

export const FieldValue = styled(Text)`
  overflow-wrap: anywhere;
`

export const InlineCopyButton = styled(CopyButton)`
  display: inline-flex;
  vertical-align: middle;
`
