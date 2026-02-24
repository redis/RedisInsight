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

import { Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

import * as S from './QueryCardHeader.styles'
import QueryCardTooltip from '../QueryCardTooltip'

import { useQueryResultsContext } from '../../context/query-results.context'

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
  const { telemetry } = useQueryResultsContext()

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

    telemetry.onQueryReRun?.({
      command: getCommandName(),
      databaseId: instanceId,
    })
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
        <RiTooltip content={truncateText(text, 500)} position="left">
          <S.ChangeViewWrapper>
            <RiIcon
              type={theme === Theme.Dark ? iconDark : iconLight}
              data-testid={`view-type-selected-${value}-${id}`}
            />
          </S.ChangeViewWrapper>
        </RiTooltip>
      ),
      dropdownDisplay: (
        <S.DropdownOption>
          <RiIcon type={theme === Theme.Dark ? iconDark : iconLight} />
          <span>{truncateText(text, 20)}</span>
        </S.DropdownOption>
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
        <S.DropdownProfileOption
          data-test-subj={`profile-type-option-${value}-${id}`}
        >
          <RiIcon
            type="VisTagCloudIcon"
            data-testid={`view-type-selected-${value}-${id}`}
          />
        </S.DropdownProfileOption>
      ),
      dropdownDisplay: (
        <S.DropdownProfileOption
          data-test-subj={`profile-type-option-${value}-${id}`}
        >
          <span>{truncateText(text, 20)}</span>
        </S.DropdownProfileOption>
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
      inputDisplay: <S.Separator />,
      label: '',
      dropdownDisplay: <span />,
      'data-test-subj': '',
    })
  }

  return (
    <S.Container
      onClick={handleToggleOpen}
      tabIndex={0}
      onKeyDown={() => {}}
      className={cx('query-card-header', { isOpen })}
      $notExpanded={isSilentModeWithoutError(resultsMode, summary?.fail)}
      data-testid="query-card-open"
      role="button"
    >
      <Row align="center" gap="l" full>
        <S.TitleWrapper grow>
          <div className="copy-btn-wrapper">
            <S.Title as="div">
              <ColorText
                color="primary"
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
            </S.Title>
            <CopyButton
              copy={query || ''}
              onCopy={handleCopy}
              aria-label="Copy query"
              disabled={emptyCommand}
              withTooltip={false}
              className="copy-btn"
              data-testid="copy-command"
            />
          </div>
        </S.TitleWrapper>
        <S.Controls>
          <Row align="center" justify="end" gap="l">
            <S.Time data-testid="command-execution-date-time">
              {!!createdAt && (
                <ColorText component="div" size="S">
                  <FormatedDate date={createdAt} />
                </ColorText>
              )}
            </S.Time>
            <S.SummaryTextWrapper>
              {!!message && !isOpen && (
                <ColorText component="div" size="S">
                  {truncateText(message, 13)}
                </ColorText>
              )}
            </S.SummaryTextWrapper>
            <S.ExecutionTime data-testid="command-execution-time">
              {isNumber(executionTime) && (
                <RiTooltip
                  title="Processing Time"
                  content={getExecutionTimeString(executionTime)}
                  position="left"
                  data-testid="execution-time-tooltip"
                >
                  <S.ExecutionTime as="div">
                    <Row align="center" gap="s" grow={false}>
                      <RiIcon
                        size="M"
                        color="primary600"
                        type="UptimeIcon"
                        data-testid="command-execution-time-icon"
                      />
                      <S.ExecutionTimeValue>
                        <ColorText
                          size="S"
                          color="default"
                          component="span"
                          data-testid="command-execution-time-value"
                        >
                          {getTruncatedExecutionTimeString(executionTime)}
                        </ColorText>
                      </S.ExecutionTimeValue>
                    </Row>
                  </S.ExecutionTime>
                </RiTooltip>
              )}
            </S.ExecutionTime>
            <Row align="center" justify="end" gap="s" grow={false}>
              <S.ViewTypeIcon onClick={onDropDownViewClick}>
                {isOpen && canCommandProfile && !summaryText && (
                  <S.ProfileSelect
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
              </S.ViewTypeIcon>
              <S.ViewTypeIcon onClick={onDropDownViewClick}>
                {isOpen && options.length > 1 && !summaryText && (
                  <S.ProfileSelect
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
              </S.ViewTypeIcon>
              <S.ButtonIcon onClick={onDropDownViewClick}>
                {(isOpen || isFullScreen) && (
                  <FullScreen
                    isFullScreen={isFullScreen}
                    onToggleFullScreen={toggleFullScreen}
                  />
                )}
              </S.ButtonIcon>
              <S.ButtonIcon>
                <RiTooltip content="Clear result" position="left">
                  <IconButton
                    disabled={loading || clearing}
                    icon={DeleteIcon}
                    aria-label="Delete command"
                    data-testid="delete-command"
                    onClick={handleQueryDelete}
                  />
                </RiTooltip>
              </S.ButtonIcon>
              {!isFullScreen && (
                <S.PlayIcon>
                  <RiTooltip content="Run again" position="left">
                    <IconButton
                      disabled={emptyCommand}
                      icon={PlayIcon}
                      aria-label="Re-run command"
                      data-testid="re-run-command"
                      onClick={handleQueryReRun}
                    />
                  </RiTooltip>
                </S.PlayIcon>
              )}
              {!isFullScreen && (
                <S.ButtonIcon>
                  {!isSilentModeWithoutError(resultsMode, summary?.fail) && (
                    <IconButton
                      icon={isOpen ? ChevronUpIcon : ChevronDownIcon}
                      aria-label="toggle collapse"
                      data-testid="toggle-collapse"
                    />
                  )}
                </S.ButtonIcon>
              )}
              <S.ButtonIcon>
                {(isRawMode(mode) || isGroupResults(resultsMode)) && (
                  <RiTooltip
                    content={
                      <>
                        {isGroupMode(resultsMode) && (
                          <ColorText
                            component="span"
                            data-testid="group-mode-tooltip"
                          >
                            <S.Mode>
                              <RiIcon type="GroupModeIcon" />
                            </S.Mode>
                          </ColorText>
                        )}
                        {isSilentMode(resultsMode) && (
                          <ColorText
                            component="span"
                            data-testid="silent-mode-tooltip"
                          >
                            <S.Mode>
                              <RiIcon type="SilentModeIcon" />
                            </S.Mode>
                          </ColorText>
                        )}
                        {isRawMode(mode) && (
                          <ColorText
                            component="span"
                            data-testid="raw-mode-tooltip"
                          >
                            <S.Mode>-r</S.Mode>
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
              </S.ButtonIcon>
            </Row>
          </Row>
        </S.Controls>
      </Row>
    </S.Container>
  )
}

export default QueryCardHeader
