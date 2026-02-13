import React, { useContext } from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { findIndex, isNumber } from 'lodash'
import { ColorText } from 'uiSrc/components/base/text'

import {
  ChevronDownIcon,
  ChevronUpIcon,
  DeleteIcon,
  PlayIcon,
} from 'uiSrc/components/base/icons'
import { CopyButton } from 'uiSrc/components/copy-button'
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
import QueryCardTooltip from '../QueryCardTooltip'

import styles from './styles.module.scss'
import {
  QueryCardField,
  useQueryResultsContext,
} from '../../context/query-results.context'
import { ProfileSelect } from './QueryCardHeader.styles'

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
  toggleOpen: () => void
  toggleFullScreen: () => void
  setSelectedValue: (type: WBQueryType, value: string) => void
  onQueryDelete: () => void
  onQueryReRun: () => void
  onQueryProfile: (type: ProfileQueryType) => void
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
  } = props

  const { visualizations = [] } = useSelector(appPluginsSelector)
  const { spec: COMMANDS_SPEC } = useSelector(appRedisCommandsSelector)
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const { theme } = useContext(ThemeContext)
  const { telemetry, config } = useQueryResultsContext()
  const showFields = config.showFields ?? []

  const eventStop = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const getCommandName = () =>
    getCommandNameFromQuery(query, COMMANDS_SPEC) ?? ''

  const handleCopy = () => {
    telemetry.onCommandCopied?.({
      command: getCommandName(),
      databaseId: instanceId,
    })
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
    telemetry.onResultViewChanged?.({
      databaseId: instanceId,
      command: getCommandName(),
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

    telemetry.onResultCleared?.({
      command: getCommandName(),
      databaseId: instanceId,
    })
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
      const telemetryParams = {
        command: getCommandName(),
        databaseId: instanceId,
      }

      if (isOpen) {
        telemetry.onResultCollapsed?.(telemetryParams)
      } else {
        telemetry.onResultExpanded?.(telemetryParams)
      }
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
        <RiTooltip
          content={truncateText(text, 500)}
          position="left"
          anchorClassName={styles.changeViewWrapper}
        >
          <RiIcon
            type={theme === Theme.Dark ? iconDark : iconLight}
            data-testid={`view-type-selected-${value}-${id}`}
          />
        </RiTooltip>
      ),
      dropdownDisplay: (
        <div className={cx(styles.dropdownOption)}>
          <RiIcon type={theme === Theme.Dark ? iconDark : iconLight} />
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
    <Row
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
      <Row align="center" gap="l" full>
        <FlexItem className={styles.titleWrapper} grow>
          <div className="copy-btn-wrapper">
            <ColorText
              color="primary"
              className={styles.title}
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
            <CopyButton
              copy={query || ''}
              onCopy={handleCopy}
              aria-label="Copy query"
              disabled={emptyCommand}
              withTooltip={false}
              className={cx('copy-btn', styles.copyBtn)}
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
                <ColorText component="div" size="S">
                  <FormatedDate date={createdAt} />
                </ColorText>
              )}
            </FlexItem>
            <FlexItem className={styles.summaryTextWrapper}>
              {!!message && !isOpen && (
                <ColorText component="div" size="S">
                  {truncateText(message, 13)}
                </ColorText>
              )}
            </FlexItem>
            <FlexItem
              data-testid="command-execution-time"
              className={styles.executionTime}
            >
              {isNumber(executionTime) && (
                <RiTooltip
                  title="Processing Time"
                  content={getExecutionTimeString(executionTime)}
                  position="left"
                  anchorClassName={styles.executionTime}
                  data-testid="execution-time-tooltip"
                >
                  <Row align="center" gap="s" grow={false}>
                    <RiIcon
                      size="M"
                      color="primary600"
                      type="UptimeIcon"
                      data-testid="command-execution-time-icon"
                    />
                    <ColorText
                      size="S"
                      color="default"
                      className={cx(styles.executionTimeValue)}
                      data-testid="command-execution-time-value"
                    >
                      {getTruncatedExecutionTimeString(executionTime)}
                    </ColorText>
                  </Row>
                </RiTooltip>
              )}
            </FlexItem>
            <Row align="center" justify="end" gap="s" grow={false}>
              {showFields.includes(QueryCardField.Profiler) && (
                <FlexItem
                  className={cx(styles.buttonIcon, styles.viewTypeIcon)}
                  onClick={onDropDownViewClick}
                >
                  {isOpen && canCommandProfile && !summaryText && (
                    <ProfileSelect
                      placeholder={profileOptions[0].inputDisplay}
                      onChange={(value: ProfileQueryType | string) =>
                        onQueryProfile(value as ProfileQueryType)
                      }
                      className="profiler"
                      options={profileOptions}
                      data-testid="run-profile-type"
                      valueRender={({ option, isOptionValue }) => {
                        if (isOptionValue) {
                          return option.dropdownDisplay as JSX.Element
                        }
                        return option.inputDisplay as JSX.Element
                      }}
                    />
                  )}
                </FlexItem>
              )}
              {showFields.includes(QueryCardField.ViewType) && (
                <FlexItem
                  className={cx(styles.buttonIcon, styles.viewTypeIcon)}
                  onClick={onDropDownViewClick}
                >
                  {isOpen && options.length > 1 && !summaryText && (
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
                      className="toggle-view"
                      data-testid="select-view-type"
                    />
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
                <RiTooltip content="Clear result" position="left">
                  <IconButton
                    disabled={loading || clearing}
                    icon={DeleteIcon}
                    aria-label="Delete command"
                    data-testid="delete-command"
                    onClick={handleQueryDelete}
                  />
                </RiTooltip>
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
                      data-testid="toggle-collapse"
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
          </Row>
        </FlexItem>
      </Row>
    </Row>
  )
}

export default QueryCardHeader
