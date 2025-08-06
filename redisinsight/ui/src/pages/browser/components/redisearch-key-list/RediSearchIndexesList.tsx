import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { isString } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'

import styled from 'styled-components'
import { RiOutsideClickDetector } from 'uiBase/utils'
import { RiEmptyButton, RiIconButton, RiSelect } from 'uiBase/forms'
import { RefreshIcon } from 'uiBase/icons'
import { RiText } from 'uiBase/text'
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

import { RiTooltip } from 'uiSrc/components'
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

  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false)
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
    const value = formatLongName(bufferToString(index))

    return {
      value: JSON.stringify(index),
      inputDisplay: (
        <RiText component="span" data-test-subj={`mode-option-type-${value}`}>
          {value}
        </RiText>
      ),
      dropdownDisplay: (
        <RiText component="span" data-test-subj={`mode-option-type-${value}`}>
          {value}
        </RiText>
      ),
    }
  })

  options.unshift({
    value: JSON.stringify(CREATE),
    inputDisplay: <span>CREATE</span>,
    dropdownDisplay: (
      <RiText
        size="M"
        className={cx(styles.createIndexBtn)}
        data-testid="create-index-btn"
      >
        Create Index
      </RiText>
    ),
  })

  const onChangeIndex = (initValue: string) => {
    const value = JSON.parse(initValue)

    if (isString(value) && value === CREATE) {
      onCreateIndex(true)
      setIsSelectOpen(false)

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
    setIsSelectOpen(false)

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

  return (
    <RiOutsideClickDetector onOutsideClick={() => setIsSelectOpen(false)}>
      <div className={cx(styles.container)}>
        <div className={styles.select}>
          <RiSelect
            disabled={loading}
            loading={loading}
            options={options}
            valueRender={({ option, isOptionValue }): JSX.Element => {
              if (isOptionValue) {
                return option.dropdownDisplay as JSX.Element
              }
              return option.inputDisplay as JSX.Element
            }}
            defaultOpen={isSelectOpen}
            value={index || ''}
            onChange={onChangeIndex}
            data-testid="select-search-mode"
            placeholder={
              <Button
                className={styles.placeholder}
                onClick={() => setIsSelectOpen(true)}
                data-testid="select-index-placeholder"
              >
                Select Index
              </Button>
            }
          />
        </div>
        <div className={styles.refresh}>
          <RiTooltip content="Refresh Indexes">
            <RiIconButton
              size="S"
              icon={RefreshIcon}
              disabled={loading}
              className={styles.refreshBtn}
              onClick={handleRefresh}
              aria-label="refresh indexes list"
              data-testid="refresh-indexes-btn"
            />
          </RiTooltip>
        </div>
      </div>
    </RiOutsideClickDetector>
  )
}

const Button = styled(RiEmptyButton)`
  justify-content: flex-start;
  max-width: 200px;
  padding-left: 1.275rem;
  padding-right: 2.4rem;
`

export default RediSearchIndexesList
