import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { PersistencePolicy } from 'uiSrc/slices/interfaces'
import { IconButton, IconType } from 'uiSrc/components/base/forms/buttons'
import { handleCopy } from 'uiSrc/utils'
import { OptionsIcon, ValidOptionIndex } from '../DatabaseListOptions.styles'

/**
 * Type guard to check if value is a valid PersistencePolicy key
 */
function isPersistencePolicyKey(
  value: unknown,
): value is keyof typeof PersistencePolicy {
  return typeof value === 'string' && value in PersistencePolicy
}

interface ITooltipProps {
  content: string
  index: number
  value: unknown
  icon?: IconType
}
export const Tooltip = ({
  content: contentProp,
  icon,
  value,
  index,
}: ITooltipProps) =>
  contentProp ? (
    <RiTooltip
      content={
        isPersistencePolicyKey(value)
          ? `Persistence: ${PersistencePolicy[value]}`
          : contentProp
      }
      position="top"
    >
      {icon ? (
        <IconButton
          icon={icon}
          onClick={() => handleCopy(contentProp)}
          aria-label={`${contentProp}_module`}
        />
      ) : (
        <OptionsIcon
          $icon={index as ValidOptionIndex}
          aria-label={contentProp}
          onClick={() => handleCopy(contentProp)}
          onKeyDown={() => ({})}
          role="presentation"
        >
          {contentProp.match(/\b(\w)/g)?.join('')}
        </OptionsIcon>
      )}
    </RiTooltip>
  ) : null
