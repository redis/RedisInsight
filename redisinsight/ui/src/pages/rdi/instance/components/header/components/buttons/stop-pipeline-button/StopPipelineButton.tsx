import React from 'react'

import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiStopIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import { useTranslation } from 'uiSrc/i18n'
import { PipelineButtonProps } from '../reset-pipeline-button/ResetPipelineButton'
import styles from '../styles.module.scss'

const StopPipelineButton = ({
  onClick,
  disabled,
  loading,
}: PipelineButtonProps) => {
  const { t } = useTranslation()

  return (
    <RiTooltip
      content={t('rdi.instance.stop.tooltip')}
      anchorClassName={disabled ? styles.disabled : undefined}
    >
      <SecondaryButton
        aria-label={t('rdi.instance.stop.ariaLabel')}
        loading={loading}
        disabled={disabled}
        icon={RiStopIcon}
        data-testid="stop-pipeline-btn"
        onClick={onClick}
      >
        {t('rdi.instance.stop.button')}
      </SecondaryButton>
    </RiTooltip>
  )
}

export default StopPipelineButton
