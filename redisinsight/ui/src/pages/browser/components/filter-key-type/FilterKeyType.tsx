import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  SCAN_COUNT_DEFAULT,
  SCAN_TREE_COUNT_DEFAULT,
} from 'uiSrc/constants/api'
import { CommandsVersions } from 'uiSrc/constants/commandsVersions'
import { connectedInstanceOverviewSelector } from 'uiSrc/slices/instances/instances'
import {
  fetchKeys,
  fetchSearchHistoryAction,
  keysSelector,
  setFilter,
} from 'uiSrc/slices/browser/keys'
import { isVersionHigherOrEquals } from 'uiSrc/utils'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { FilterNotAvailable } from 'uiSrc/components'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { resetBrowserTree } from 'uiSrc/slices/app/context'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { AdditionalRedisModule } from 'uiSrc/slices/interfaces'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'
import { HealthText } from 'uiSrc/components/base/text/HealthText'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { Modal } from 'uiSrc/components/base/display'
import { FILTER_KEY_TYPE_OPTIONS } from './constants'

import styles from './styles.module.scss'

const ALL_KEY_TYPES_VALUE = 'all'

export interface Props {
  modules?: AdditionalRedisModule[]
}

const FilterKeyType = ({ modules }: Props) => {
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false)
  const [typeSelected, setTypeSelected] = useState<string>('all')
  const [isVersionSupported, setIsVersionSupported] = useState<boolean>(true)
  const [isInfoPopoverOpen, setIsInfoPopoverOpen] = useState<boolean>(false)

  const { version } = useSelector(connectedInstanceOverviewSelector)
  const { filter, viewType, searchMode } = useSelector(keysSelector)
  const features = useSelector(appFeatureFlagsFeaturesSelector)

  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  useEffect(() => {
    setIsVersionSupported(
      isVersionHigherOrEquals(
        version,
        CommandsVersions.FILTER_PER_KEY_TYPES.since,
      ),
    )
  }, [version])

  useEffect(() => {
    setTypeSelected(filter ?? ALL_KEY_TYPES_VALUE)
  }, [filter])

  const options: {
    value: string
    inputDisplay: JSX.Element
    dropdownDisplay: JSX.Element
  }[] = FILTER_KEY_TYPE_OPTIONS.filter(({ featureFlag, skipIfNoModule }) => {
    if (
      skipIfNoModule &&
      !modules?.some(({ name }) => name === skipIfNoModule)
    ) {
      return false
    }
    return !featureFlag || features[featureFlag]?.flag
  }).map((item) => {
    const { value, color, text } = item
    return {
      value,
      inputDisplay: (
        <HealthText
          color={color}
          data-test-subj={`filter-option-type-${value}`}
        >
          {text}
        </HealthText>
      ),
      dropdownDisplay: (
        <HealthText
          color={color}
          data-test-subj={`filter-option-type-${value}`}
        >
          {text}
        </HealthText>
      ),
      'data-test-subj': `filter-option-type-${value}`,
    }
  })

  options.unshift({
    value: ALL_KEY_TYPES_VALUE,
    inputDisplay: (
      <div className={styles.dropdownOption} data-testid="all-key-types-option">
        All Key Types
      </div>
    ),
    dropdownDisplay: <span>All Key Types</span>,
  })

  const onChangeType = (initValue: string) => {
    const value = initValue || ALL_KEY_TYPES_VALUE
    setTypeSelected(value)
    setIsSelectOpen(false)
    dispatch(setFilter(value === ALL_KEY_TYPES_VALUE ? null : value))
    if (viewType === KeyViewType.Tree) {
      dispatch(resetBrowserTree())
    }
    dispatch(
      fetchKeys(
        {
          searchMode,
          cursor: '0',
          count:
            viewType === KeyViewType.Browser
              ? SCAN_COUNT_DEFAULT
              : SCAN_TREE_COUNT_DEFAULT,
        },
        () => {
          dispatch(fetchSearchHistoryAction(searchMode))
        },
      ),
    )
  }

  const handleClickSelect = () => {
    setIsInfoPopoverOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.BROWSER_FILTER_MODE_CHANGE_FAILED,
      eventData: {
        databaseId: instanceId,
      },
    })
  }

  return (
    <OutsideClickDetector
      onOutsideClick={() => isVersionSupported && setIsSelectOpen(false)}
    >
      <div
        className={cx(
          styles.container,
          !isVersionSupported && styles.unsupported,
        )}
      >
        <Modal
          open={!isVersionSupported && isInfoPopoverOpen}
          onCancel={() => setIsInfoPopoverOpen(false)}
          className={styles.unsupportedInfoModal}
          data-testid="filter-not-available-modal"
          content={<FilterNotAvailable onClose={() => setIsInfoPopoverOpen(false)} />}
          title=""
        />
        {!isVersionSupported && (
          <div
            role="presentation"
            onClick={handleClickSelect}
            className={styles.unsupportedInfo}
            data-testid="unsupported-btn-anchor"
          />
        )}
        <RiSelect
          disabled={!isVersionSupported}
          options={options}
          valueRender={({ option, isOptionValue }) => {
            if (isOptionValue) {
              return option.inputDisplay
            }
            return option.dropdownDisplay
          }}
          defaultOpen={isSelectOpen}
          value={typeSelected}
          onChange={(value: string) => onChangeType(value)}
          data-testid="select-filter-key-type"
        />
      </div>
    </OutsideClickDetector>
  )
}

export default FilterKeyType
