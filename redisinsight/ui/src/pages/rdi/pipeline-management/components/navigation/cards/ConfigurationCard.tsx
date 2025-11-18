import React from 'react'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces'
import { useSelector } from 'react-redux'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { RiTooltip } from 'uiSrc/components'
import { Indicator } from 'uiSrc/components/base/text/text.styles'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Icon, ToastNotificationIcon } from 'uiSrc/components/base/icons'

import BaseCard, { BaseCardProps } from './BaseCard'
import ValidationErrorsList from '../../validation-errors-list/ValidationErrorsList'

export type ConfigurationCardProps = Omit<
  BaseCardProps,
  'title' | 'children' | 'onSelect'
> & {
  onSelect: (id: string | RdiPipelineTabs) => void
}

const ConfigurationCard = ({
  onSelect,
  isSelected,
}: ConfigurationCardProps) => {
  const { changes, configValidationErrors } = useSelector(rdiPipelineSelector)

  const handleClick = () => {
    onSelect(RdiPipelineTabs.Config)
  }

  const hasChanges = !!changes.config
  const isValid = configValidationErrors.length === 0

  return (
    <BaseCard
      title="Configuration"
      isSelected={isSelected}
      tabIndex={0}
      onClick={handleClick}
      data-testid={`rdi-nav-btn-${RdiPipelineTabs.Config}`}
    >
      <Row gap="s" align="center">
        {!hasChanges && <Indicator $color="transparent" />}

        {hasChanges && (
          <RiTooltip
            content="This file contains undeployed changes."
            position="top"
          >
            <Indicator
              $color="informative"
              data-testid={`updated-configuration-highlight`}
            />
          </RiTooltip>
        )}

        <Text>Configuration file</Text>

        {!isValid && (
          <RiTooltip
            position="right"
            content={
              <ValidationErrorsList validationErrors={configValidationErrors} />
            }
          >
            <Icon
              icon={ToastNotificationIcon}
              color="danger500"
              size="M"
              data-testid={`rdi-pipeline-nav__error-configuration`}
            />
          </RiTooltip>
        )}
      </Row>
    </BaseCard>
  )
}

export default ConfigurationCard
