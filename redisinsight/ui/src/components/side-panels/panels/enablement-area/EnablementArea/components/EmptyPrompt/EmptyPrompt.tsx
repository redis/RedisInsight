import React from 'react'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiEmptyPrompt } from 'uiSrc/components/base/layout'
import * as S from '../../../../../SidePanels.styles'

const EmptyPrompt = () => (
  <S.EmptyPromptContainer>
    <RiEmptyPrompt
      data-testid="enablement-area__empty-prompt"
      icon={<RiIcon type="ToastDangerIcon" color="danger600" size="l" />}
      title={<h2>No information to display</h2>}
      body={
        <S.EmptyPromptBody>
          <span>Restart the application.</span>
          <br />
          <span>
            If the problem persists, please{' '}
            <Link
              color="ghost"
              href={EXTERNAL_LINKS.githubIssues}
              external={false}
              target="_blank"
              data-testid="contact-us"
            >
              contact us
            </Link>
            .
          </span>
        </S.EmptyPromptBody>
      }
    />
  </S.EmptyPromptContainer>
)

export default EmptyPrompt
