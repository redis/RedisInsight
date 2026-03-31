import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { connectedInstanceCDSelector } from 'uiSrc/slices/instances/instances'
import { appContextCapability } from 'uiSrc/slices/app/context'
import { getTutorialCapability } from 'uiSrc/utils'
import { isShowCapabilityTutorialPopover } from 'uiSrc/services'
import { EAManifestFirstKey } from 'uiSrc/constants'
import {
  changeSelectedTab,
  changeSidePanel,
  resetExplorePanelSearch,
  setExplorePanelIsPageOpen,
} from 'uiSrc/slices/panels/sidePanels'
import { InsightsPanelTabs, SidePanels } from 'uiSrc/slices/interfaces/insights'

/**
 * Opens the Insights side-panel automatically when a capability tutorial
 * source is detected (e.g. user lands on a page with a capability query param).
 *
 * This must run at a level that is always mounted (e.g. ExplorePanelTemplate)
 * because SidePanelsWrapper is only mounted when a panel is already open.
 */
export const useCapabilityAutoOpen = () => {
  const { source: capabilitySource } = useSelector(appContextCapability)
  const { free = false } = useSelector(connectedInstanceCDSelector) ?? {}
  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    if (!capabilitySource || !isShowCapabilityTutorialPopover(free)) {
      return
    }

    const tutorialCapabilityPath =
      getTutorialCapability(capabilitySource)?.path || ''

    if (tutorialCapabilityPath) {
      const search = new URLSearchParams(window.location.search)
      search.set(
        'path',
        `${EAManifestFirstKey.TUTORIALS}/${tutorialCapabilityPath}`,
      )
      history.push({ search: search.toString() })
    } else {
      dispatch(resetExplorePanelSearch())
      dispatch(setExplorePanelIsPageOpen(false))
    }

    dispatch(changeSelectedTab(InsightsPanelTabs.Explore))
    dispatch(changeSidePanel(SidePanels.Insights))
  }, [capabilitySource, free])
}
