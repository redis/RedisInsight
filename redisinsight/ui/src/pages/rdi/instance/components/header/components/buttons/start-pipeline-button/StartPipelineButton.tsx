import React from 'react'

import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { PlayFilledIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import { useTranslation } from 'uiSrc/i18n'
import { PipelineButtonProps } from '../reset-pipeline-button/ResetPipelineButton'
import styles from '../styles.module.scss'

const StartPipelineButton = ({
  onClick,
  disabled,
  loading,
}: PipelineButtonProps) => {
  const { t } = useTranslation()

  return (
    <RiTooltip
      content={t('rdi.instance.start.tooltip')}
      anchorClassName={disabled ? styles.disabled : styles.tooltip}
    >
      <SecondaryButton
        aria-label={t('rdi.instance.start.ariaLabel')}
        icon={PlayFilledIcon}
        data-testid="start-pipeline-btn"
        disabled={disabled}
        loading={loading}
        onClick={onClick}
      >
        {t('rdi.instance.start.button')}
      </SecondaryButton>
    </RiTooltip>
  )
}

export default StartPipelineButton
