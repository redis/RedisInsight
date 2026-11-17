import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
import styles from './styles.module.scss'

export interface Props {
  popoverContent: string
  isShowPopover: boolean
  children: React.ReactElement
  onApproveClick: () => void
  setIsShowPopover: (value: boolean) => void
}

const PopoverRunAnalyze = (props: Props) => {
  const {
    isShowPopover,
    popoverContent,
    setIsShowPopover,
    onApproveClick,
    children,
  } = props
  const { t } = useTranslation()

  return (
    <RiPopover
      ownFocus
      anchorPosition="upCenter"
      isOpen={isShowPopover}
      closePopover={() => setIsShowPopover(false)}
      panelPaddingSize="m"
      panelClassName={styles.panelPopover}
      button={children}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={styles.popover}
        data-testid="insights-db-analysis-popover"
      >
        <Text className={styles.popoverTitle} size="m">
          {t('tips.runAnalysis.popoverTitle')}
        </Text>
        <Spacer size="s" />
        <Text className={styles.popoverContent}>{popoverContent}</Text>
        <Spacer size="m" />
        <PrimaryButton
          aria-label={t('tips.runAnalysis.approveButton')}
          data-testid="approve-insights-db-analysis-btn"
          onClick={onApproveClick}
          size="s"
          className={styles.popoverApproveBtn}
        >
          {t('tips.runAnalysis.approveButton')}
        </PrimaryButton>
      </div>
    </RiPopover>
  )
}

export default PopoverRunAnalyze
