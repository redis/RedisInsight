import React, { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { instancesSelector as rdiInstancesSelector } from 'uiSrc/slices/rdi/instances'
import { instancesSelector as dbInstancesSelector } from 'uiSrc/slices/instances/instances'
import { TextInput } from 'uiSrc/components/base/inputs'
import Divider from 'uiSrc/components/divider/Divider'
import { BrowserStorageItem, DEFAULT_SORT, Pages } from 'uiSrc/constants'
import Search from 'uiSrc/assets/img/Search.svg'
import { Instance, RdiInstance } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { localStorageService } from 'uiSrc/services'
import { filterAndSort } from 'uiSrc/utils'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import Tabs, { TabInfo } from 'uiSrc/components/base/layout/tabs'
import { RiPopover } from 'uiSrc/components/base'
import InstancesList from './components/instances-list'
import styles from './styles.module.scss'

export interface Props {
  name: string
}

export enum InstancesTabs {
  Databases = 'Databases',
  RDI = 'Redis Data Integration',
}

const InstancesNavigationPopover = ({ name }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [filteredDbInstances, setFilteredDbInstances] = useState<Instance[]>([])
  const [filteredRdiInstances, setFilteredRdiInstances] = useState<
    RdiInstance[]
  >([])

  const { instanceId, rdiInstanceId } = useParams<{
    instanceId: string
    rdiInstanceId: string
  }>()
  const [selectedTab, setSelectedTab] = useState(
    rdiInstanceId ? InstancesTabs.RDI : InstancesTabs.Databases,
  )

  const { data: rdiInstances } = useSelector(rdiInstancesSelector)
  const { data: dbInstances } = useSelector(dbInstancesSelector)
  const history = useHistory()

  useEffect(() => {
    const dbSort =
      localStorageService.get(BrowserStorageItem.instancesSorting) ??
      DEFAULT_SORT

    const dbFiltered = filterAndSort(dbInstances, searchFilter, dbSort)

    const rdiSort =
      localStorageService.get(BrowserStorageItem.rdiInstancesSorting) ??
      DEFAULT_SORT

    const rdiFiltered = filterAndSort(rdiInstances, searchFilter, rdiSort)
    setFilteredDbInstances(dbFiltered)
    setFilteredRdiInstances(rdiFiltered)
  }, [dbInstances, rdiInstances, searchFilter])

  const handleSearch = (value: string) => {
    setSearchFilter(value)
  }

  const showPopover = () => {
    if (!isPopoverOpen) {
      sendEventTelemetry({
        event: TelemetryEvent.NAVIGATION_PANEL_OPENED,
        eventData: {
          databaseId: instanceId || rdiInstanceId,
          numOfRedisDbs: dbInstances?.length || 0,
          numOfRdiDbs: rdiInstances?.length || 0,
        },
      })
    }
    setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen)
  }

  const btnLabel =
    selectedTab === InstancesTabs.Databases
      ? 'Redis Databases page'
      : 'Redis Data Integration page'

  const goHome = () => {
    history.push(
      selectedTab === InstancesTabs.Databases ? Pages.home : Pages.rdi,
    )
  }

  const tabs: TabInfo[] = useMemo(
    () => [
      {
        label: `${InstancesTabs.Databases} (${dbInstances?.length || 0})`,
        value: InstancesTabs.Databases,
        content: null,
      },
      {
        label: `${InstancesTabs.RDI} (${rdiInstances?.length || 0})`,
        value: InstancesTabs.RDI,
        content: null,
      },
    ],
    [dbInstances, rdiInstances],
  )

  return (
    <RiPopover
      ownFocus
      anchorPosition="downRight"
      panelPaddingSize="none"
      isOpen={isPopoverOpen}
      closePopover={() => showPopover()}
      button={
        <Text
          className={styles.showPopoverBtn}
          onClick={() => showPopover()}
          data-testid="nav-instance-popover-btn"
        >
          <b className={styles.breadCrumbLink}>{name}</b>
          <span>
            <RiIcon color="primary500" type="CaretDownIcon" />
          </span>
        </Text>
      }
    >
      <div className={styles.wrapper}>
        <div className={styles.searchInputContainer}>
          <TextInput
            className={styles.searchInput}
            icon={Search}
            value={searchFilter}
            onChange={handleSearch}
            data-testid="instances-nav-popover-search"
          />
        </div>
        <div>
          <div className={styles.tabsContainer}>
            <Tabs
              tabs={tabs}
              value={selectedTab}
              // @ts-expect-error type mismatch
              onChange={setSelectedTab}
              className={styles.tabs}
              data-testid="instances-tabs-testId"
            />
          </div>
          <Spacer size="m" />
          <InstancesList
            selectedTab={selectedTab}
            filteredDbInstances={filteredDbInstances}
            filteredRdiInstances={filteredRdiInstances}
            onItemClick={showPopover}
          />
          <div>
            <Spacer size="m" />
            <Divider />
            <div className={styles.footerContainer}>
              <Text className={styles.homePageLink} onClick={goHome}>
                {btnLabel}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </RiPopover>
  )
}

export default InstancesNavigationPopover
