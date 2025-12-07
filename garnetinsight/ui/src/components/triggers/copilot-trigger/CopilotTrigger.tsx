import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  sidePanelsSelector,
  toggleSidePanel,
} from 'uiSrc/slices/panels/sidePanels'

import { RiTooltip } from 'uiSrc/components'
import { CopilotIcon } from 'uiSrc/components/base/icons'
import { SidePanels } from 'uiSrc/slices/interfaces/insights'
import { CopilotWrapper, CopilotIconButton } from './CopilotTrigger.styles'

const CopilotTrigger = () => {
  const { openedPanel } = useSelector(sidePanelsSelector)
  const dispatch = useDispatch()

  const handleClickTrigger = () => {
    dispatch(toggleSidePanel(SidePanels.AiAssistant))
  }

  const isCopilotOpen = openedPanel === SidePanels.AiAssistant

  return (
    <CopilotWrapper align="center" justify="end">
      <RiTooltip content="Redis Copilot">
        <CopilotIconButton
          size="S"
          role="button"
          icon={CopilotIcon}
          onClick={handleClickTrigger}
          data-testid="copilot-trigger"
          isOpen={isCopilotOpen}
          aria-label="Copilot-trigger"
        />
      </RiTooltip>
    </CopilotWrapper>
  )
}

export default CopilotTrigger
