import React, { useCallback } from 'react'
import { Header } from 'uiSrc/components/side-panels/components'
import styles from 'uiSrc/components/side-panels/styles.module.scss'
import AiAssistant from 'uiSrc/components/side-panels/panels/ai-assistant'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { OnboardingTour } from 'uiSrc/components'
import { Text } from 'uiSrc/components/base/text'

export interface Props {
  isFullScreen: boolean
  onToggleFullScreen: () => void
  onClose: () => void
}

const CopilotPanel = (props: Props) => {
  const { isFullScreen, onToggleFullScreen, onClose } = props

  const CopilotHeader = useCallback(
    () => (
      <div className={styles.assistantHeader}>
        <div className={styles.title}>
          <OnboardingTour
            options={ONBOARDING_FEATURES.BROWSER_COPILOT}
            anchorPosition={isFullScreen ? 'rightUp' : 'leftUp'}
            anchorWrapperClassName={styles.onboardingAnchorWrapper}
            fullSize
          >
            <div className={styles.titleWrapper}>
              <Text size="L" color="primary">
                Redis Copilot
              </Text>
            </div>
          </OnboardingTour>
        </div>
      </div>
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
      <div className={styles.body}>
        <AiAssistant />
      </div>
    </>
  )
}

export default CopilotPanel
