import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'

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
  resetKeyInfo,
} from 'uiSrc/slices/browser/keys'
import { setBrowserSelectedKey } from 'uiSrc/slices/app/context'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  bufferToString,
  formatLongName,
  isRedisearchAvailable,
} from 'uiSrc/utils'
import {
  SCAN_COUNT_DEFAULT,
  SCAN_TREE_COUNT_DEFAULT,
} from 'uiSrc/constants/api'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem, FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'

import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { PlusIcon, ResetIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import {
  RiSelect,
  SelectValueRenderParams,
} from 'uiSrc/components/base/forms/select/RiSelect'
import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'
import { getIndexDisplayName } from 'uiSrc/pages/vector-search/utils'
import * as S from './RediSearchIndexesList.styles'

export const CREATE = JSON.stringify('create')

export interface Props {
  onCreateIndex: (value: boolean) => void
}

const RediSearchIndexesList = (props: Props) => {
  const { onCreateIndex } = props

  const { viewType, searchMode } = useSelector(keysSelector)
  const { selectedIndex } = useSelector(redisearchSelector)
  const { data: list = [], loading } = useSelector(redisearchListSelector)
  const {
    id: instanceId,
    modules,
    host: instanceHost,
  } = useSelector(connectedInstanceSelector)

  const selectedValue = selectedIndex ? bufferToString(selectedIndex) : ''
  const featureFlags = useSelector(appFeatureFlagsFeaturesSelector)
  const isDevVectorSearch =
    featureFlags?.[FeatureFlags.vectorSearchV2]?.flag ?? false

  const dispatch = useDispatch()
  const location = useLocation<{ browseIndex?: string }>()
  const history = useHistory()

  const selectIndex = useCallback(
    (indexName: string) => {
      const matchingBuffer = list.find(
        (item) => bufferToString(item) === indexName,
      )
      if (!matchingBuffer) return false

      dispatch(resetKeyInfo())
      dispatch(setBrowserSelectedKey(null))
      dispatch(setSelectedIndex(matchingBuffer))
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

      return true
    },
    [dispatch, list, searchMode, viewType],
  )

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
    const browseIndex = location.state?.browseIndex
    if (!browseIndex || list.length === 0) return

    if (selectIndex(browseIndex)) {
      history.replace({ ...location, state: undefined })
    }
  }, [list])

  useEffect(
    () => () => {
      redisearchController?.abort()
    },
    [],
  )

  const options = list.map((item) => {
    const stringValue = bufferToString(item)
    const displayValue = formatLongName(
      getIndexDisplayName(stringValue),
      100,
      10,
    )

    return {
      value: stringValue,
      inputDisplay: (
        <Text data-test-subj={`mode-option-type-${displayValue}`}>
          {displayValue}
        </Text>
      ),
      dropdownDisplay: (
        <Text
          color="primary"
          data-test-subj={`mode-option-type-${displayValue}`}
        >
          {displayValue}
        </Text>
      ),
    }
  })

  if (isDevVectorSearch) {
    options.push({
      value: CREATE,
      inputDisplay: <span>CREATE</span>,
      dropdownDisplay: (
        <Row align="center" justify="start" gap="xs">
          <PlusIcon size="M" />
          <Text
            size="M"
            variant="semiBold"
            color="primary"
            data-testid="create-index-btn"
          >
            Create Index
          </Text>
        </Row>
      ),
    })
  }

  const onChangeIndex = (value: string) => {
    if (value === CREATE) {
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

    if (!selectIndex(value)) return

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
    <S.Container>
      <RiSelect.Compose
        disabled={loading}
        options={options}
        value={selectedValue}
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
    </S.Container>
  )
}

export default RediSearchIndexesList
