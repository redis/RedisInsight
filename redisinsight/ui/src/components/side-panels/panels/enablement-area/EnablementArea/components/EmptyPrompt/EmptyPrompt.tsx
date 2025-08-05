import React from 'react'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { RiIcon } from 'uiSrc/components/base/icons'
import { RiLink } from 'uiSrc/components/base/display'
import { RiEmptyPrompt } from 'uiSrc/components/base/layout'
import styles from './styles.module.scss'

const EmptyPrompt = () => (
  <div className={styles.container}>
    <RiEmptyPrompt
      data-testid="enablement-area__empty-prompt"
      icon={<RiIcon type="ToastDangerIcon" color="danger600" size="l" />}
      title={<h2>No information to display</h2>}
      body={
        <p className={styles.body}>
          <span>Restart the application.</span>
          <br />
          <span>
            If the problem persists, please{' '}
            <RiLink
              color="ghost"
              href={EXTERNAL_LINKS.githubIssues}
              external={false}
              target="_blank"
              data-testid="contact-us"
            >
              contact us
            </RiLink>
            .
          </span>
        </p>
      }
    />
  </div>
)

export default EmptyPrompt
