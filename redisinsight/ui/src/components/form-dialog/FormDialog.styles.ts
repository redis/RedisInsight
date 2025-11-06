import styled from 'styled-components'
import { Modal } from 'uiSrc/components/base/display/modal'

export const StyledFormDialogContent = styled(Modal.Content.Compose)`
  width: 900px;
  height: 700px;

  max-width: calc(100vw - 120px);
  max-height: calc(100vh - 120px);
`

export const StyledFormDialogContentBody = styled(Modal.Content.Body)`
  flex: 1;
  min-height: 0;
`
