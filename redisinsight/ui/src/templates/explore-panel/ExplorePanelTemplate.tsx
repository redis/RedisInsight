import React from 'react'
import { useSelector } from 'react-redux'
import { sidePanelsSelector } from 'uiSrc/slices/panels/sidePanels'
import SidePanels from 'uiSrc/components/side-panels'

import {
  ResizableContainer,
  ResizablePanelHandle,
} from 'uiSrc/components/base/layout'

import { FlexColPanel, MainWrapper } from './ExplorePanelTemplate.styles'

export interface Props {
  children: React.ReactNode
  panelClassName?: string
}

const MAIN_PANEL_DEFAULT_SIZE = 70
const SIDE_PANEL_DEFAULT_SIZE = 30
const MAIN_PANEL_MIN_SIZE = 30
const SIDE_PANEL_MIN_SIZE = 15

const ExplorePanelTemplate = (props: Props) => {
  const { children, panelClassName } = props
  const { openedPanel } = useSelector(sidePanelsSelector)
  const isPanelOpen = !!openedPanel

  return (
    <MainWrapper>
      <ResizableContainer direction="horizontal">
        <FlexColPanel
          id="main-content"
          order={1}
          minSize={MAIN_PANEL_MIN_SIZE}
          defaultSize={isPanelOpen ? MAIN_PANEL_DEFAULT_SIZE : 100}
        >
          {children}
        </FlexColPanel>

        {isPanelOpen && (
          <>
            <ResizablePanelHandle direction="vertical" />

            <FlexColPanel
              id="side-panel"
              order={2}
              minSize={SIDE_PANEL_MIN_SIZE}
              defaultSize={SIDE_PANEL_DEFAULT_SIZE}
            >
              <SidePanels panelClassName={panelClassName} />
            </FlexColPanel>
          </>
        )}
      </ResizableContainer>
    </MainWrapper>
  )
}

export default React.memo(ExplorePanelTemplate)
