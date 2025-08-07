import React, { useContext } from 'react'
import styled from 'styled-components'
import cx from 'classnames'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { findIndex, isNumber } from 'lodash'
import { ColorText } from 'uiSrc/components/base/text'

import {
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  DeleteIcon,
  PlayIcon,
} from 'uiSrc/components/base/icons'
import { Theme } from 'uiSrc/constants'
import {
  getCommandNameFromQuery,
  getVisualizationsByCommand,
  isGroupMode,
  isGroupResults,
  isRawMode,
  isSilentMode,
  isSilentModeWithoutError,
  truncateMilliseconds,
  truncateText,
  urlForAsset,
} from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { appPluginsSelector } from 'uiSrc/slices/app/plugins'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  getProfileViewTypeOptions,
  getViewTypeOptions,
  isCommandAllowedForProfile,
  ProfileQueryType,
  WBQueryType,
} from 'uiSrc/pages/workbench/constants'
import { IPluginVisualization } from 'uiSrc/slices/interfaces'
import {
  ResultsMode,
  ResultsSummary,
  RunQueryMode,
} from 'uiSrc/slices/interfaces/workbench'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { FormatedDate, FullScreen, RiTooltip } from 'uiSrc/components'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import QueryCardTooltip from 'uiSrc/components/query/query-card/QueryCardTooltip'

import styles from './styles.module.scss'

/**
 * Caution: This is a copy of the QueryCardHeader component from the Workbench module.
 *
 * We're really sorry to do that at this point, but this family fo components should be refactored to be reusable.
 * At this point, it requires a lot of effort to make it reusable, so we decided to copy the component as is, and apply the necessary changes inline.
 */

export interface Props {
  query: string
  isOpen: boolean
  isFullScreen: boolean
  createdAt?: Date
  message?: string
  activeMode: RunQueryMode
  mode?: RunQueryMode
  resultsMode?: ResultsMode
  activeResultsMode?: ResultsMode
  summary?: ResultsSummary
  summaryText?: string
  selectedValue: string
  loading?: boolean
  clearing?: boolean
  executionTime?: number
  emptyCommand?: boolean
  db?: number
  hideFields?: string[]
  toggleOpen: () => void
  toggleFullScreen: () => void
  setSelectedValue: (type: WBQueryType, value: string) => void
  onQueryDelete: () => void
  onQueryReRun: () => void
  onQueryProfile: (type: ProfileQueryType) => void
}

export const HIDE_FIELDS = {
  viewType: 'viewType',
  profiler: 'profiler',
}

const getExecutionTimeString = (value: number): string => {
  if (value < 1) {
    return '0.001 msec'
  }
  return `${numberWithSpaces(parseFloat((value / 1000).toFixed(3)))} msec`
}

const getTruncatedExecutionTimeString = (value: number): string => {
  if (value < 1) {
    return '0.001 msec'
  }

  return truncateMilliseconds(parseFloat((value / 1000).toFixed(3)))
}

const ProfileSelect = styled(RiSelect)`
  border: none !important;
  background-color: inherit !important;
  color: var(--iconsDefaultColor) !important;
  width: 46px;
  padding: inherit !important;

  & ~ div {
    right: 0;

    svg {
      width: 10px !important;
      height: 10px !important;
    }
  }
`

const QueryCardHeader = (props: Props) => {
  const {
    isOpen,
    toggleOpen,
    isFullScreen,
    toggleFullScreen,
    query = '',
    loading,
    clearing,
    message,
    createdAt,
    mode,
    resultsMode,
    summary,
    activeResultsMode,
    summaryText,
    activeMode,
    selectedValue,
    executionTime,
    emptyCommand = false,
    setSelectedValue,
    onQueryDelete,
    onQueryReRun,
    onQueryProfile,
    db,
    hideFields = [],
  } = props

  const { visualizations = [] } = useSelector(appPluginsSelector)
  const { spec: COMMANDS_SPEC } = useSelector(appRedisCommandsSelector)
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const { theme } = useContext(ThemeContext)

  const eventStop = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const sendEvent = (
    event: TelemetryEvent,
    query: string,
    additionalData: object = {},
  ) => {
    sendEventTelemetry({
      event,
      eventData: {
        databaseId: instanceId,
        command: getCommandNameFromQuery(query, COMMANDS_SPEC),
        ...additionalData,
      },
    })
  }

  const handleCopy = (event: React.MouseEvent, query: string) => {
    sendEvent(TelemetryEvent.WORKBENCH_COMMAND_COPIED, query)
    eventStop(event)
    navigator.clipboard?.writeText?.(query)
  }

  const onDropDownViewClick = (event: React.MouseEvent) => {
    eventStop(event)
  }

  const onChangeView = (initValue: string) => {
    if (selectedValue === initValue) return
    const currentView = options.find(({ id }) => id === initValue)
    const previousView = options.find(({ id }) => id === selectedValue)
    const type = currentView.value
    setSelectedValue(type as WBQueryType, initValue)
    sendEvent(TelemetryEvent.WORKBENCH_RESULT_VIEW_CHANGED, query, {
      rawMode: isRawMode(activeMode),
      group: isGroupMode(activeResultsMode),
      previousView: previousView?.name,
      isPreviousViewInternal: !!previousView?.internal,
      currentView: currentView?.name,
      isCurrentViewInternal: !!currentView?.internal,
    })
  }

  const handleQueryDelete = (event: React.MouseEvent) => {
    eventStop(event)
    onQueryDelete()
    sendEvent(TelemetryEvent.WORKBENCH_CLEAR_RESULT_CLICKED, query)
  }

  const handleQueryReRun = (event: React.MouseEvent) => {
    eventStop(event)
    onQueryReRun()
  }

  const handleToggleOpen = () => {
    if (
      !isFullScreen &&
      !isSilentModeWithoutError(resultsMode, summary?.fail)
    ) {
      sendEvent(
        isOpen
          ? TelemetryEvent.WORKBENCH_RESULTS_COLLAPSED
          : TelemetryEvent.WORKBENCH_RESULTS_EXPANDED,
        query,
      )
    }
    toggleOpen()
  }

  const pluginsOptions = getVisualizationsByCommand(query, visualizations).map(
    (visualization: IPluginVisualization) => ({
      id: visualization.uniqId,
      value: WBQueryType.Plugin,
      name: `${visualization.id}__${visualization.name}`,
      text: visualization.name,
      iconDark:
        visualization.plugin.internal && visualization.iconDark
          ? urlForAsset(visualization.plugin.baseUrl, visualization.iconDark)
          : 'DefaultPluginDarkIcon',
      iconLight:
        visualization.plugin.internal && visualization.iconLight
          ? urlForAsset(visualization.plugin.baseUrl, visualization.iconLight)
          : 'DefaultPluginLightIcon',
      internal: visualization.plugin.internal,
    }),
  )

  const options: any[] = getViewTypeOptions()
  options.push(...pluginsOptions)
  const modifiedOptions = options.map((item) => {
    const { value, id, text, iconDark, iconLight } = item
    return {
      value: id ?? value,
      label: id ?? value,
      disabled: false,
      inputDisplay: (
        <div className={styles.changeViewWrapper}>
          <RiTooltip
            content={truncateText(text, 500)}
            position="left"
            anchorClassName={styles.changeViewWrapper}
          >
            <RiIcon
              className={styles.iconDropdownOption}
              type={theme === Theme.Dark ? iconDark : iconLight}
              data-testid={`view-type-selected-${value}-${id}`}
            />
          </RiTooltip>
        </div>
      ),
      dropdownDisplay: (
        <div className={cx(styles.dropdownOption)}>
          <RiIcon
            className={styles.iconDropdownOption}
            type={theme === Theme.Dark ? iconDark : iconLight}
          />
          <span>{truncateText(text, 20)}</span>
        </div>
      ),
      'data-test-subj': `view-type-option-${value}-${id}`,
    }
  })

  const profileOptions = (getProfileViewTypeOptions() as any[]).map((item) => {
    const { value, id, text } = item
    return {
      value: id ?? value,
      label: id ?? value,
      inputDisplay: (
        <div
          data-test-subj={`profile-type-option-${value}-${id}`}
          className={cx(styles.dropdownOption, styles.dropdownProfileOption)}
        >
          <RiIcon
            className={styles.iconDropdownOption}
            type="VisTagCloudIcon"
            data-testid={`view-type-selected-${value}-${id}`}
          />
        </div>
      ),
      dropdownDisplay: (
        <div
          data-test-subj={`profile-type-option-${value}-${id}`}
          className={cx(styles.dropdownOption, styles.dropdownProfileOption)}
        >
          <span>{truncateText(text, 20)}</span>
        </div>
      ),
      'data-test-subj': `profile-type-option-${value}-${id}`,
    }
  })

  const canCommandProfile = isCommandAllowedForProfile(query)

  const indexForSeparator = findIndex(
    pluginsOptions,
    (option) => !option.internal,
  )
  if (indexForSeparator > -1) {
    modifiedOptions.splice(indexForSeparator + 1, 0, {
      value: '',
      disabled: true,
      inputDisplay: <span className={styles.separator} />,
      label: '',
      dropdownDisplay: <span />,
      'data-test-subj': '',
    })
  }

  return (
    <div
      onClick={handleToggleOpen}
      tabIndex={0}
      onKeyDown={() => {}}
      className={cx(styles.container, 'query-card-header', {
        [styles.isOpen]: isOpen,
        [styles.notExpanded]: isSilentModeWithoutError(
          resultsMode,
          summary?.fail,
        ),
      })}
      data-testid="query-card-open"
      role="button"
    >
      <Row align="center" gap="l" style={{ width: '100%' }}>
        <FlexItem className={styles.titleWrapper} grow>
          <div className="copy-btn-wrapper">
            <ColorText
              className={styles.title}
              color="subdued"
              component="div"
              data-testid="query-card-command"
            >
              <QueryCardTooltip
                query={query}
                summary={summaryText}
                db={db}
                resultsMode={resultsMode}
              />
            </ColorText>
            <IconButton
              icon={CopyIcon}
              aria-label="Copy query"
              className={cx('copy-btn', styles.copyBtn)}
              disabled={emptyCommand}
              onClick={(event: React.MouseEvent) =>
                handleCopy(event, query || '')
              }
              data-testid="copy-command"
            />
          </div>
        </FlexItem>
        <FlexItem className={styles.controls}>
          <Row align="center" justify="end" gap="l">
            <FlexItem
              className={styles.time}
              data-testid="command-execution-date-time"
            >
              {!!createdAt && (
                <ColorText className={styles.timeText} component="div">
                  <FormatedDate date={createdAt} />
                </ColorText>
              )}
            </FlexItem>
            <FlexItem className={styles.summaryTextWrapper}>
              {!!message && !isOpen && (
                <ColorText className={styles.summaryText} component="div">
                  {truncateText(message, 13)}
                </ColorText>
              )}
            </FlexItem>
            <FlexItem
              className={styles.executionTime}
              data-testid="command-execution-time"
            >
              {isNumber(executionTime) && (
                <RiTooltip
                  title="Processing Time"
                  content={getExecutionTimeString(executionTime)}
                  position="left"
                  anchorClassName={styles.executionTime}
                  data-testid="execution-time-tooltip"
                >
                  <>
                    <RiIcon
                      type="ExecutionTimeIcon"
                      data-testid="command-execution-time-icon"
                      className={styles.iconExecutingTime}
                    />
                    <ColorText
                      className={cx(
                        styles.summaryText,
                        styles.executionTimeValue,
                      )}
                      data-testid="command-execution-time-value"
                    >
                      {getTruncatedExecutionTimeString(executionTime)}
                    </ColorText>
                  </>
                </RiTooltip>
              )}
            </FlexItem>
            {!hideFields?.includes(HIDE_FIELDS.profiler) && (
              <FlexItem
                className={cx(styles.buttonIcon, styles.viewTypeIcon)}
                onClick={onDropDownViewClick}
              >
                {isOpen && canCommandProfile && !summaryText && (
                  <div className={styles.dropdownWrapper}>
                    <div className={styles.dropdown}>
                      <ProfileSelect
                        placeholder={profileOptions[0].inputDisplay}
                        onChange={(value: ProfileQueryType | string) =>
                          onQueryProfile(value as ProfileQueryType)
                        }
                        options={profileOptions}
                        data-testid="run-profile-type"
                        valueRender={({ option, isOptionValue }) => {
                          if (isOptionValue) {
                            return option.dropdownDisplay as JSX.Element
                          }
                          return option.inputDisplay as JSX.Element
                        }}
                      />
                    </div>
                  </div>
                )}
              </FlexItem>
            )}
            {!hideFields?.includes(HIDE_FIELDS.viewType) && (
              <FlexItem
                className={cx(styles.buttonIcon, styles.viewTypeIcon)}
                onClick={onDropDownViewClick}
              >
                {isOpen && options.length > 1 && !summaryText && (
                  <div className={styles.dropdownWrapper}>
                    <div className={styles.dropdown}>
                      <ProfileSelect
                        options={modifiedOptions}
                        valueRender={({ option, isOptionValue }) => {
                          if (isOptionValue) {
                            return option.dropdownDisplay as JSX.Element
                          }
                          return option.inputDisplay as JSX.Element
                        }}
                        value={selectedValue}
                        onChange={(value: string) => onChangeView(value)}
                        data-testid="select-view-type"
                      />
                    </div>
                  </div>
                )}
              </FlexItem>
            )}
            <FlexItem
              className={styles.buttonIcon}
              onClick={onDropDownViewClick}
            >
              {(isOpen || isFullScreen) && (
                <FullScreen
                  isFullScreen={isFullScreen}
                  onToggleFullScreen={toggleFullScreen}
                />
              )}
            </FlexItem>
            <FlexItem className={styles.buttonIcon}>
              <IconButton
                disabled={loading || clearing}
                icon={DeleteIcon}
                aria-label="Delete command"
                data-testid="delete-command"
                onClick={handleQueryDelete}
              />
            </FlexItem>
            {!isFullScreen && (
              <FlexItem className={cx(styles.buttonIcon, styles.playIcon)}>
                <RiTooltip
                  content="Run again"
                  position="left"
                  anchorClassName={cx(styles.buttonIcon, styles.playIcon)}
                >
                  <IconButton
                    disabled={emptyCommand}
                    icon={PlayIcon}
                    aria-label="Re-run command"
                    data-testid="re-run-command"
                    onClick={handleQueryReRun}
                  />
                </RiTooltip>
              </FlexItem>
            )}
            {!isFullScreen && (
              <FlexItem className={styles.buttonIcon}>
                {!isSilentModeWithoutError(resultsMode, summary?.fail) && (
                  <IconButton
                    icon={isOpen ? ChevronUpIcon : ChevronDownIcon}
                    aria-label="toggle collapse"
                  />
                )}
              </FlexItem>
            )}
            <FlexItem className={styles.buttonIcon}>
              {(isRawMode(mode) || isGroupResults(resultsMode)) && (
                <RiTooltip
                  className={styles.tooltip}
                  anchorClassName={styles.buttonIcon}
                  content={
                    <>
                      {isGroupMode(resultsMode) && (
                        <ColorText
                          className={cx(styles.mode)}
                          data-testid="group-mode-tooltip"
                        >
                          <RiIcon type="GroupModeIcon" />
                        </ColorText>
                      )}
                      {isSilentMode(resultsMode) && (
                        <ColorText
                          className={cx(styles.mode)}
                          data-testid="silent-mode-tooltip"
                        >
                          <RiIcon type="SilentModeIcon" />
                        </ColorText>
                      )}
                      {isRawMode(mode) && (
                        <ColorText
                          className={cx(styles.mode)}
                          data-testid="raw-mode-tooltip"
                        >
                          -r
                        </ColorText>
                      )}
                    </>
                  }
                  position="bottom"
                  data-testid="parameters-tooltip"
                >
                  <RiIcon
                    color="subdued"
                    type="MoreactionsIcon"
                    data-testid="parameters-anchor"
                  />
                </RiTooltip>
              )}
            </FlexItem>
          </Row>
        </FlexItem>
      </Row>
    </div>
  )
}

export default QueryCardHeader
