import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { RiTooltip } from 'uiSrc/components'
import { LockedIcon, RiHighlightedIcon } from 'uiSrc/components/base/icons'

import { AddKeyTypeOption } from '../AddKey.types'
import * as S from './KeyTypeOption.styles'

export interface KeyTypeOptionProps {
  option: AddKeyTypeOption
  disabled?: boolean
}

export const KeyTypeOption = ({ option, disabled }: KeyTypeOptionProps) => {
  const { t } = useTranslation()
  const { text, value, color, minVersion } = option

  const label = (
    <S.Label color={color} data-test-subj={value} data-testid={value}>
      {t(text)}
    </S.Label>
  )

  if (!disabled || !minVersion) {
    return label
  }

  return (
    <S.OptionRow
      align="center"
      justify="between"
      gap="s"
      data-testid={`${value}-disabled`}
    >
      {label}
      <RiTooltip
        content={t('browser.addKey.requiresVersion', {
          version: minVersion,
        })}
        position="top"
      >
        <RiHighlightedIcon icon={LockedIcon} size="S" />
      </RiTooltip>
    </S.OptionRow>
  )
}
