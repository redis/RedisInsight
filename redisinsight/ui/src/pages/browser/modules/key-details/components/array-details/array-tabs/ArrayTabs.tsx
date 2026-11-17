import React, { useMemo } from 'react'

import Tabs, { TabInfo } from 'uiSrc/components/base/layout/tabs'
import { useTranslation } from 'uiSrc/i18n'
import { ARRAY_DETAILS_TAB_LABELS, ArrayDetailsTab } from '../constants'
import { ArrayTabsProps } from './ArrayTabs.types'

const ArrayTabs = ({ value, onChange }: ArrayTabsProps) => {
  const { t } = useTranslation()
  const tabs: TabInfo[] = useMemo(
    () =>
      (Object.values(ArrayDetailsTab) as ArrayDetailsTab[]).map((tab) => ({
        value: tab,
        label: t(ARRAY_DETAILS_TAB_LABELS[tab]),
        content: null,
      })),
    [t],
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
