import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import cx from 'classnames'
import { RiTooltip } from 'uiSrc/components'
import { ColorText } from 'uiSrc/components/base/text'
import { PageNames, Pages } from 'uiSrc/constants'
import JobsTree from 'uiSrc/pages/rdi/pipeline-management/components/jobs-tree'
import Tab from 'uiSrc/pages/rdi/pipeline-management/components/tab'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces/rdi'
import { Nullable } from 'uiSrc/utils'

import styles from './styles.module.scss'

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

  const { loading, changes, configValidationErrors } =
    useSelector(rdiPipelineSelector)
  const history = useHistory()
  const { pathname } = useLocation()
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const path = pathname?.split('/').pop() || ''

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

  const renderTabs = () => (
    <>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={() => {}}
        onClick={() => onSelectedTabChanged(RdiPipelineTabs.Config)}
        className={cx(styles.tab)}
        data-testid={`rdi-nav-btn-${RdiPipelineTabs.Config}`}
      >
        <Tab
          title="Configure pipeline"
          fileName="Configuration file"
          isSelected={selectedTab === RdiPipelineTabs.Config}
          data-testid={`rdi-pipeline-tab-${RdiPipelineTabs.Config}`}
          isLoading={loading}
          isValid={configValidationErrors.length === 0}
        >
          <div className={styles.dotWrapper}>
            {!!changes.config && (
              <RiTooltip
                content="This file contains undeployed changes."
                position="top"
                anchorClassName={styles.dotWrapper}
              >
                <span
                  className={styles.dot}
                  data-testid="updated-file-config-highlight"
                />
              </RiTooltip>
            )}
          </div>
        </Tab>
      </div>
      <Tab
        title="Add transformation jobs"
        isSelected={selectedTab === RdiPipelineTabs.Jobs}
        data-testid="rdi-pipeline-tab-jobs"
      >
        <JobsTree
          onSelectedTab={onSelectedTabChanged}
          path={decodeURIComponent(path)}
          rdiInstanceId={rdiInstanceId}
          changes={changes}
        />
      </Tab>
    </>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <ColorText component="div">Pipeline Management</ColorText>
      </div>
      <div className={styles.tabs} data-testid="rdi-pipeline-tabs">
        {!loading && renderTabs()}
      </div>
    </div>
  )
}

export default Navigation
