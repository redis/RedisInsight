import React, { useCallback } from 'react'
import { Header } from 'uiSrc/components/side-panels/components'
import AiAssistant from 'uiSrc/components/side-panels/panels/ai-assistant'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { OnboardingTour } from 'uiSrc/components'
import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'
import * as S from 'uiSrc/components/side-panels/SidePanels.styles'

export interface Props {
  isFullScreen: boolean
  onToggleFullScreen: () => void
  onClose: () => void
}

const CopilotPanel = (props: Props) => {
  const { isFullScreen, onToggleFullScreen, onClose } = props

  const CopilotHeader = useCallback(
    () => (
      <S.AssistantHeader>
        <OnboardingTour
          options={ONBOARDING_FEATURES.BROWSER_COPILOT}
          anchorPosition={isFullScreen ? 'rightUp' : 'leftUp'}
          fullSize
        >
          <Row>
            <Text size="L" color="primary">
              Redis Copilot
            </Text>
          </Row>
        </OnboardingTour>
      </S.AssistantHeader>
    ),
    [isFullScreen],
  )

  return (
    <>
      <Header
        isFullScreen={isFullScreen}
        onToggleFullScreen={onToggleFullScreen}
        onClose={onClose}
        panelName="copilot"
      >
        <CopilotHeader />
      </Header>
      <S.Body>
        <AiAssistant />
      </S.Body>
    </>
  )
}

export default CopilotPanel
