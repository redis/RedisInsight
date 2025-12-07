import React, { useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import Tabs from 'uiSrc/components/base/layout/tabs'
import { tabs } from './constants'

const HomeTabs = () => {
  const history = useHistory()
  const { pathname } = useLocation()
  const featureFlags = useSelector(appFeatureFlagsFeaturesSelector)

  const filteredTabs = useMemo(
    () =>
      tabs.filter(
        (tab) => !tab.featureFlag || featureFlags?.[tab.featureFlag]?.flag,
      ),
    [featureFlags],
  )

  const activeTab =
    filteredTabs.find((tab) => tab.path.startsWith(pathname)) ?? filteredTabs[0]

  const onSelectedTabChanged = (newValue: string) => {
    const tab =
      filteredTabs.find((tab) => tab.value === newValue) ?? filteredTabs[0]

    sendEventTelemetry({
      event: TelemetryEvent.INSTANCES_TAB_CHANGED,
      eventData: {
        tab: tab.label,
      },
    })

    history.push(tab.path)
  }

  return (
    <Tabs
      tabs={filteredTabs}
      value={activeTab.value}
      onChange={onSelectedTabChanged}
      data-testid="home-tabs"
    />
  )
}

export default React.memo(HomeTabs)
