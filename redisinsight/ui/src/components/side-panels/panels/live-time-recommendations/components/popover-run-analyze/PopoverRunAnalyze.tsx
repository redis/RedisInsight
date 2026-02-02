import React from 'react'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
import * as S from '../../../../SidePanels.styles'

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
      button={children}
      onClick={(e) => e.stopPropagation()}
      minWidth={432}
    >
      <S.PanelPopover data-testid="insights-db-analysis-popover">
        <S.PopoverTitle as={Text} size="m">
          Run database analysis
        </S.PopoverTitle>
        <Spacer size="s" />
        <S.PopoverContent as={Text}>{popoverContent}</S.PopoverContent>
        <Spacer size="m" />
        <S.PopoverApproveBtn
          as={PrimaryButton}
          aria-label="Analyze"
          data-testid="approve-insights-db-analysis-btn"
          onClick={onApproveClick}
          size="s"
        >
          Analyze
        </S.PopoverApproveBtn>
      </S.PanelPopover>
    </RiPopover>
  )
}

export default PopoverRunAnalyze
