import React from 'react'

import { RiSpacer } from 'uiBase/layout/spacer'
import { RiPrimaryButton } from 'uiBase/forms'
import { RiText } from 'uiBase/text'
import { RiPopover } from 'uiBase/index'
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
        <RiText className={styles.popoverTitle}>Run database analysis</RiText>
        <RiSpacer size="xs" />
        <RiText className={styles.popoverContent} color="subdued">
          {popoverContent}
        </RiText>
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
