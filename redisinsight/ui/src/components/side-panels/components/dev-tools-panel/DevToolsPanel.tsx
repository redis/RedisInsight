import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { Header } from 'uiSrc/components/side-panels/components'
import styles from 'uiSrc/components/side-panels/styles.module.scss'
import DevTools from 'uiSrc/components/side-panels/panels/dev-tools'
import { Text } from 'uiSrc/components/base/text'

export interface Props {
  isFullScreen: boolean
  onToggleFullScreen: () => void
  onClose: () => void
}

const DevToolsPanel = (props: Props) => {
  const { isFullScreen, onToggleFullScreen, onClose } = props
  const { t } = useTranslation()

  return (
    <>
      <Header
        isFullScreen={isFullScreen}
        onToggleFullScreen={onToggleFullScreen}
        onClose={onClose}
        panelName="dev-tools"
      >
        <div className={styles.assistantHeader}>
          <Text size="L" color="primary">
            {t('devTools.panel.title')}
          </Text>
        </div>
      </Header>
      <div className={styles.body}>
        <DevTools />
      </div>
    </>
  )
}

export default DevToolsPanel
