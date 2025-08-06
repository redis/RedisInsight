import React from 'react'
import cx from 'classnames'

import { useDispatch, useSelector } from 'react-redux'
import { CopilotIcon } from 'uiBase/icons'
import { RiEmptyButton } from 'uiBase/forms'
import {
  sidePanelsSelector,
  toggleSidePanel,
} from 'uiSrc/slices/panels/sidePanels'

import { RiTooltip } from 'uiSrc/components'
import { SidePanels } from 'uiSrc/slices/interfaces/insights'
import styles from './styles.module.scss'

const CopilotTrigger = () => {
  const { openedPanel } = useSelector(sidePanelsSelector)

  const dispatch = useDispatch()

  const handleClickTrigger = () => {
    dispatch(toggleSidePanel(SidePanels.AiAssistant))
  }

  return (
    <div
      className={cx(styles.container, {
        [styles.isOpen]: openedPanel === SidePanels.AiAssistant,
      })}
    >
      <RiTooltip content="Redis Copilot">
        <RiEmptyButton
          className={styles.btn}
          role="button"
          icon={CopilotIcon}
          onClick={handleClickTrigger}
          data-testid="copilot-trigger"
        />
      </RiTooltip>
    </div>
  )
}

export default CopilotTrigger
