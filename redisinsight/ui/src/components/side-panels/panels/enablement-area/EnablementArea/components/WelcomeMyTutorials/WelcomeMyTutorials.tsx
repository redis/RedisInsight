import React from 'react'

import { RiPrimaryButton } from 'uiSrc/components/base/forms'
import { Card } from 'uiSrc/components/base/layout'
import CreateTutorialLink from '../CreateTutorialLink'

import styles from './styles.module.scss'

export interface Props {
  handleOpenUpload: () => void
}

const WelcomeMyTutorials = ({ handleOpenUpload }: Props) => (
  <div className={styles.wrapper} data-testid="welcome-my-tutorials">
    <Card className={styles.panel}>
      <div className={styles.link}>
        <CreateTutorialLink />
      </div>
      <RiPrimaryButton
        className={styles.btnSubmit}
        size="s"
        onClick={() => handleOpenUpload()}
        data-testid="upload-tutorial-btn"
      >
        + Upload <span className={styles.hideText}>tutorial</span>
      </RiPrimaryButton>
    </Card>
  </div>
)

export default WelcomeMyTutorials
