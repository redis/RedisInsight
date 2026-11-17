import React from 'react'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { RiTooltip } from 'uiSrc/components'
import { useTranslation } from 'uiSrc/i18n'
import styles from '../styles.module.scss'
import { Button, TextButton } from '@redis-ui/components'
import { ResetIcon } from '@redis-ui/icons'

export interface PipelineButtonProps {
  onClick: () => void
  disabled: boolean
  loading: boolean
}

const ResetPipelineButton = ({
  onClick,
  disabled,
  loading,
}: PipelineButtonProps) => {
  const { t } = useTranslation()

  return (
    <RiTooltip
      content={
        !(disabled || loading) ? (
          <>
            <p>{t('rdi.instance.reset.tooltipLine1')}</p>
            <Spacer size="m" />
            <p>{t('rdi.instance.reset.tooltipLine2')}</p>
          </>
        ) : null
      }
      anchorClassName={disabled || loading ? styles.disabled : styles.tooltip}
    >
      <TextButton
        aria-label={t('rdi.instance.reset.ariaLabel')}
        data-testid="reset-pipeline-btn"
        onClick={onClick}
        disabled={disabled}
      >
        <Button.Icon icon={ResetIcon} />
        {t('rdi.instance.reset.button')}
      </TextButton>
    </RiTooltip>
  )
}

export default ResetPipelineButton
