import React, { useMemo } from 'react'

import Tabs, { TabInfo } from 'uiSrc/components/base/layout/tabs'
import { ARRAY_DETAILS_TAB_LABELS, ArrayDetailsTab } from '../constants'

export interface ArrayTabsProps {
  value: ArrayDetailsTab
  onChange: (tab: ArrayDetailsTab) => void
}

const ArrayTabs = ({ value, onChange }: ArrayTabsProps) => {
  const tabs: TabInfo[] = useMemo(
    () =>
      (Object.values(ArrayDetailsTab) as ArrayDetailsTab[]).map((tab) => ({
        value: tab,
        label: ARRAY_DETAILS_TAB_LABELS[tab],
        content: null,
      })),
    [],
  )

  return (
    <Tabs
      tabs={tabs}
      value={value}
      onChange={(id) => onChange(id as ArrayDetailsTab)}
      data-testid="array-tabs"
    />
  )
}

export default ArrayTabs
