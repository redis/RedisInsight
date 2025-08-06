import React from 'react'

import { RiIcon } from 'uiBase/icons'
import { RiLink } from 'uiBase/display'
import { RiEmptyPrompt } from 'uiBase/layout'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
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
