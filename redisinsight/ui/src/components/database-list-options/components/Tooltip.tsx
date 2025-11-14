import React from 'react'
import { isString } from 'lodash'

import { RiTooltip } from 'uiSrc/components'
import { PersistencePolicy } from 'uiSrc/slices/interfaces'
import { IconButton, IconType } from 'uiSrc/components/base/forms/buttons'
import { handleCopy } from 'uiSrc/utils'
import { OptionsIcon, ValidOptionIndex } from '../DatabaseListOptions.styles'

interface ITooltipProps {
  content: string
  index: number
  value: any
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
        isString(value)
          ? `Persistence: ${PersistencePolicy[value as keyof typeof PersistencePolicy]}`
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
