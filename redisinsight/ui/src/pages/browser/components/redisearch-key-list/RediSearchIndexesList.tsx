import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { isString } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'

import {
  setSelectedIndex,
  redisearchSelector,
  redisearchListSelector,
  fetchRedisearchListAction,
  controller as redisearchController,
} from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import {
  changeSearchMode,
  fetchKeys,
  keysSelector,
} from 'uiSrc/slices/browser/keys'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  bufferToString,
  formatLongName,
  isRedisearchAvailable,
  Nullable,
} from 'uiSrc/utils'
import {
  SCAN_COUNT_DEFAULT,
  SCAN_TREE_COUNT_DEFAULT,
} from 'uiSrc/constants/api'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'

import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { ResetIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import {
  RiSelect,
  SelectValueRenderParams,
} from 'uiSrc/components/base/forms/select/RiSelect'
import { Text } from 'uiSrc/components/base/text'
import styles from './styles.module.scss'

export const CREATE = 'create'

export interface Props {
  onCreateIndex: (value: boolean) => void
}

const RediSearchIndexesList = (props: Props) => {
  const { onCreateIndex } = props

  const { viewType, searchMode } = useSelector(keysSelector)
  const { selectedIndex = '' } = useSelector(redisearchSelector)
  const { data: list = [], loading } = useSelector(redisearchListSelector)
  const {
    id: instanceId,
    modules,
    host: instanceHost,
  } = useSelector(connectedInstanceSelector)

  const [index, setIndex] = useState<Nullable<string>>(
    JSON.stringify(selectedIndex),
  )

  const dispatch = useDispatch()

  useEffect(() => {
    if (!instanceHost) return

    const moduleExists = isRedisearchAvailable(modules)
    if (moduleExists) {
      dispatch(fetchRedisearchListAction())
    } else {
      dispatch(changeSearchMode(SearchMode.Pattern))

      localStorageService.set(
        BrowserStorageItem.browserSearchMode,
        SearchMode.Pattern,
      )
    }
  }, [instanceHost, modules])

  useEffect(() => {
    setIndex(JSON.stringify(selectedIndex || ''))
  }, [selectedIndex])

  useEffect(
    () => () => {
      redisearchController?.abort()
    },
    [],
  )

  const options = list.map((index) => {
    const value = formatLongName(bufferToString(index), 100, 10)

    return {
      value: JSON.stringify(index),
      inputDisplay: (
        <Text component="span" data-test-subj={`mode-option-type-${value}`}>
          {value}
        </Text>
      ),
      dropdownDisplay: (
        <Text component="span" data-test-subj={`mode-option-type-${value}`}>
          {value}
        </Text>
      ),
    }
  })

  options.unshift({
    value: JSON.stringify(CREATE),
    inputDisplay: <span>CREATE</span>,
    dropdownDisplay: (
      <Text
        size="M"
        className={cx(styles.createIndexBtn)}
        data-testid="create-index-btn"
      >
        Create Index
      </Text>
    ),
  })

  const onChangeIndex = (initValue: string) => {
    const value = JSON.parse(initValue)

    if (isString(value) && value === CREATE) {
      onCreateIndex(true)

      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_INDEX_ADD_BUTTON_CLICKED,
        eventData: {
          databaseId: instanceId,
          view: viewType,
        },
      })

      return
    }

    setIndex(initValue)

    dispatch(setSelectedIndex(value))
    dispatch(
      fetchKeys({
        searchMode,
        cursor: '0',
        count:
          viewType === KeyViewType.Browser
            ? SCAN_COUNT_DEFAULT
            : SCAN_TREE_COUNT_DEFAULT,
      }),
    )

    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_INDEX_CHANGED,
      eventData: {
        databaseId: instanceId,
        totalNumberOfIndexes: list.length,
        view: viewType,
      },
    })
  }

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(fetchRedisearchListAction())
  }

  const selectValueRender = ({
    option,
    isOptionValue,
  }: SelectValueRenderParams): JSX.Element => {
    if (isOptionValue) {
      return option.dropdownDisplay as JSX.Element
    }
    return option.inputDisplay as JSX.Element
  }

  return (
    <div className={cx(styles.container)}>
      <RiSelect.Compose
        disabled={loading}
        options={options}
        value={index || ''}
        onChange={onChangeIndex}
      >
        <RiSelect.Trigger.Compose data-testid="select-search-mode">
          <RiSelect.Trigger.Value
            placeholder="Select Index"
            data-testid="select-index-placeholder"
            valueRender={selectValueRender}
          />
          <RiSelect.Trigger.LoadingIndicator loading={loading} />
          <RiSelect.Trigger.Arrow data-testid="select-index-arrow" />
          <div style={{ zIndex: 6 }}>
            <RiTooltip content="Refresh Indexes">
              <IconButton
                size="M"
                icon={ResetIcon}
                disabled={loading}
                onClick={handleRefresh}
                aria-label="refresh indexes list"
                data-testid="refresh-indexes-btn"
                onPointerDown={(e) => e.stopPropagation()}
              />
            </RiTooltip>
          </div>
        </RiSelect.Trigger.Compose>
        <RiSelect.Content optionValueRender={selectValueRender} />
      </RiSelect.Compose>
    </div>
  )
}

export default RediSearchIndexesList
