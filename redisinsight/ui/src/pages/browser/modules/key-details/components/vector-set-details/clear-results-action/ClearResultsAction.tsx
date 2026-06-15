import React from 'react'

import { MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'
import { RiTooltip } from 'uiSrc/components'
import { EraserIcon } from 'uiSrc/components/base/icons'
import { IconButton, EmptyButton } from 'uiSrc/components/base/forms/buttons'

import { BASE_TEST_ID, DEFAULT_TITLE } from './constants'
import { Props } from './ClearResultsAction.types'
import * as S from './ClearResultsAction.styles'

const ClearResultsAction = ({
  width,
  title = DEFAULT_TITLE,
  onClick,
  testIdPrefix,
}: Props) => {
  const showLabel = width > MIDDLE_SCREEN_RESOLUTION
  const testId = testIdPrefix ? `${testIdPrefix}-${BASE_TEST_ID}` : BASE_TEST_ID
  return (
    <RiTooltip
      content={showLabel ? '' : title}
      position="left"
      anchorClassName="clear-results-action-anchor"
    >
      <S.ActionAnchor>
        {showLabel ? (
          <EmptyButton
            size="small"
            icon={EraserIcon}
            aria-label={title}
            onClick={onClick}
            data-testid={testId}
          >
            {title}
          </EmptyButton>
        ) : (
          <IconButton
            icon={EraserIcon}
            aria-label={title}
            onClick={onClick}
            data-testid={testId}
          />
        )}
      </S.ActionAnchor>
    </RiTooltip>
  )
}

export { ClearResultsAction }
