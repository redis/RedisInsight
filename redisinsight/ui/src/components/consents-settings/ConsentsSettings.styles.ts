import styled, { css } from 'styled-components'

export const RedisIcon = styled.span`
  width: 128px;
  height: 34px;
`

export const ConsentsPopup = styled.div`
  max-width: 94vw;
  max-height: calc(100vh - 60px);
  height: auto;
`

export const ModalHeader = styled.div`
  padding: 30px 42px 12px;
  padding-bottom: 4px;
`

export const ModalBody = styled.div`
  .euiModalBody__overflow {
    padding: 0 42px 30px;
  }
`

export const ConsentsWrapper = styled.div`
  scrollbar-width: thin;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: calc(100vh - 290px);
`

export const PluginWarningHR = styled.hr<{ $hasRequiredConsents?: boolean }>`
  ${({ $hasRequiredConsents }) =>
    $hasRequiredConsents &&
    css`
      margin-bottom: 0;
    `}
`

export const RequiredHR = styled.hr`
  margin: 0;
`
