import styled from 'styled-components'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'

export const OnboardingWrapper = styled(Col)`
  align-items: flex-end;
  /* Custom margin for onboarding popover */
  /* TODO: Rework the positioning of the onboarding container in order to remove this */
  margin-right: 28px;
`

export const MessagesListWrapper = styled(FlexItem)`
  overflow-y: auto;
  scrollbar-width: thin;
`
