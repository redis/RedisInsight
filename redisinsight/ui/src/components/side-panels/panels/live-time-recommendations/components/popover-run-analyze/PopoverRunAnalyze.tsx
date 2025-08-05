import React from 'react'

import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
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
        <Text className={styles.popoverTitle}>Run database analysis</Text>
        <RiSpacer size="xs" />
        <Text className={styles.popoverContent} color="subdued">
          {popoverContent}
        </Text>
        <RiSpacer size="m" />
        <RiPrimaryButton
          aria-label="Analyze"
          data-testid="approve-insights-db-analysis-btn"
          onClick={onApproveClick}
          size="s"
          className={styles.popoverApproveBtn}
        >
          Analyze
        </RiPrimaryButton>
      </div>
    </RiPopover>
  )
}

export default PopoverRunAnalyze
