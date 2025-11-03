import styled from 'styled-components'
import { Modal } from 'uiSrc/components/base/display/modal'

export const StyledFormDialogContent = styled(Modal.Content.Compose)`
  width: 900px !important;
  height: 700px !important;

  max-width: calc(100vw - 120px) !important;
  max-height: calc(100vh - 120px) !important;
`

export const StyledFormDialogContentBody = styled(Modal.Content.Body)`
  flex: 1;
  min-height: 0;
`
