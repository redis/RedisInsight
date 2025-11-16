import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { Title } from 'uiSrc/components/base/text'
import { PageNames, Pages } from 'uiSrc/constants'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces/rdi'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { Nullable } from 'uiSrc/utils'

import { NavigationContainer } from './Navigation.styles'
import { ConfigurationCard, JobsCard } from './cards'
import { Loader } from 'uiSrc/components/base/display'

const getSelectedTab = (path: string, rdiInstanceId: string) => {
  const tabsPath = path?.replace(
    `${Pages.rdiPipelineManagement(rdiInstanceId)}/`,
    '',
  )

  if (tabsPath.startsWith(PageNames.rdiPipelineConfig))
    return RdiPipelineTabs.Config
  if (tabsPath.startsWith(PageNames.rdiPipelineJobs))
    return RdiPipelineTabs.Jobs

  return null
}

const Navigation = () => {
  const [selectedTab, setSelectedTab] =
    useState<Nullable<RdiPipelineTabs>>(null)

  const history = useHistory()
  const { pathname } = useLocation()
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { loading } = useSelector(rdiPipelineSelector)

  const onSelectedTabChanged = (id: string | RdiPipelineTabs) => {
    if (id === RdiPipelineTabs.Config) {
      history.push(Pages.rdiPipelineConfig(rdiInstanceId))
      return
    }

    history.push(Pages.rdiPipelineJobs(rdiInstanceId, encodeURIComponent(id)))
  }

  useEffect(() => {
    const activeTab = getSelectedTab(pathname, rdiInstanceId)
    setSelectedTab(activeTab)
  }, [pathname, rdiInstanceId])

  return (
    <NavigationContainer gap="l">
      <Title size="S" color="primary">
        Pipeline management
      </Title>

      {loading && <Loader size="xl" />}

      {!loading && (
        <>
          <ConfigurationCard
            onSelect={onSelectedTabChanged}
            isSelected={selectedTab === RdiPipelineTabs.Config}
          />

          <JobsCard
            onSelect={onSelectedTabChanged}
            isSelected={selectedTab === RdiPipelineTabs.Jobs}
          />
        </>
      )}
    </NavigationContainer>
  )
}

export default Navigation
