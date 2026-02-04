import React from 'react'
import { useSelector } from 'react-redux'
import { sidePanelsSelector } from 'uiSrc/slices/panels/sidePanels'
import SidePanels from 'uiSrc/components/side-panels'

import * as S from './ExplorePanelTemplate.styles'

export interface Props {
  children: React.ReactNode
  panelClassName?: string
}

const ExplorePanelTemplate = (props: Props) => {
  const { children, panelClassName } = props
  const { openedPanel } = useSelector(sidePanelsSelector)
  return (
    <S.MainWrapper full>
      <S.MainPanel $insightsOpen={!!openedPanel}>{children}</S.MainPanel>
      <S.InsightsWrapper $isOpen={!!openedPanel}>
        <SidePanels panelClassName={panelClassName} />
      </S.InsightsWrapper>
    </S.MainWrapper>
  )
}

export default React.memo(ExplorePanelTemplate)
