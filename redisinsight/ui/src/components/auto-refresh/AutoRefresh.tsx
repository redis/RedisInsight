import React, { useCallback, useEffect, useState } from 'react'
import { ChevronDownIcon, ResetIcon } from 'uiSrc/components/base/icons'
import {
  errorValidateRefreshRateNumber,
  MIN_REFRESH_RATE,
  validateRefreshRateNumber,
} from 'uiSrc/utils'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import InlineItemEditor from 'uiSrc/components/inline-item-editor'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import { ColorText } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { SwitchInput } from 'uiSrc/components/base/inputs'
import { RiPopover } from 'uiSrc/components/base'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import {
  DEFAULT_REFRESH_RATE,
  DURATION_FIRST_REFRESH_TIME,
  getDataTestid,
  getLastRefreshDelta,
  getTextByRefreshTime,
  MINUTE,
  NOW,
} from './utils'

import * as S from './AutoRefresh.styles'
import { AutoRefreshProps } from './AutoRefresh.types'

const TIMEOUT_TO_UPDATE_REFRESH_TIME = 1_000 * MINUTE // once a minute

const AutoRefresh = ({
  postfix,
  loading,
  displayText = true,
  displayLastRefresh = true,
  lastRefreshTime,
  containerClassName = '',
  testid = '',
  turnOffAutoRefresh,
  onRefresh,
  onRefreshClicked,
  onEnableAutoRefresh,
  onChangeAutoRefreshRate,
  iconSize = 'M',
  disabled,
  disabledRefreshButtonMessage,
  minimumRefreshRate,
  defaultRefreshRate,
  enableAutoRefreshDefault = false,
}: AutoRefreshProps) => {
  let intervalText: NodeJS.Timeout
  let intervalRefresh: NodeJS.Timeout

  const [refreshMessage, setRefreshMessage] = useState(NOW)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [refreshRate, setRefreshRate] = useState<string>(
    defaultRefreshRate || '',
  )
  const [refreshRateMessage, setRefreshRateMessage] = useState<string>('')
  const [enableAutoRefresh, setEnableAutoRefresh] = useState(
    enableAutoRefreshDefault,
  )
  const [editingRate, setEditingRate] = useState(false)

  const getTestId = getDataTestid(testid)

  const onButtonClick = () => setIsPopoverOpen((open) => !open)

  const closePopover = useCallback(() => {
    setEnableAutoRefresh(enableAutoRefresh)
    setIsPopoverOpen(false)
  }, [enableAutoRefresh])

  useEffect(() => {
    const refreshRateStorage =
      localStorageService.get(BrowserStorageItem.autoRefreshRate + postfix) ||
      defaultRefreshRate ||
      DEFAULT_REFRESH_RATE

    setRefreshRate(refreshRateStorage)
  }, [postfix])

  useEffect(() => {
    if (turnOffAutoRefresh && enableAutoRefresh) {
      setEnableAutoRefresh(false)
      clearInterval(intervalRefresh)
    }
  }, [turnOffAutoRefresh])

  const updateLastRefresh = useCallback(() => {
    const delta = getLastRefreshDelta(lastRefreshTime)
    const text = getTextByRefreshTime(delta, lastRefreshTime ?? 0)
    if (lastRefreshTime) {
      setRefreshMessage(text)
    }
  }, [lastRefreshTime])

  const handleRefresh = useCallback(
    (forceRefresh = false) => {
      onRefresh(forceRefresh)
    },
    [onRefresh],
  )

  const updateAutoRefreshText = useCallback(
    (refreshInterval: string) => {
      if (enableAutoRefresh) {
        setRefreshRateMessage(
          // more than 1 minute
          +refreshInterval > MINUTE
            ? `${Math.floor(+refreshInterval / MINUTE)} min`
            : `${refreshInterval} s`,
        )
      }
    },
    [enableAutoRefresh],
  )
  // update refresh label text
  useEffect(() => {
    const delta = getLastRefreshDelta(lastRefreshTime)
    updateLastRefresh()

    intervalText = setInterval(
      () => {
        if (document.hidden) return

        updateLastRefresh()
      },
      delta < DURATION_FIRST_REFRESH_TIME
        ? DURATION_FIRST_REFRESH_TIME
        : TIMEOUT_TO_UPDATE_REFRESH_TIME,
    )
    return () => clearInterval(intervalText)
  }, [lastRefreshTime])

  // refresh interval
  useEffect(() => {
    updateLastRefresh()
    if (enableAutoRefresh && !loading && !disabled) {
      intervalRefresh = setInterval(() => {
        if (document.hidden) return

        handleRefresh()
      }, +refreshRate * 1_000)
    } else {
      clearInterval(intervalRefresh)
    }

    if (enableAutoRefresh) {
      updateAutoRefreshText(refreshRate)
    }

    return () => clearInterval(intervalRefresh)
  }, [enableAutoRefresh, refreshRate, loading, disabled, lastRefreshTime])

  const handleApplyAutoRefreshRate = useCallback(
    (initValue: string) => {
      const minRefreshRate = minimumRefreshRate || MIN_REFRESH_RATE
      const value =
        +initValue >= minRefreshRate ? initValue : `${minRefreshRate}`
      setRefreshRate(value)
      setEditingRate(false)
      localStorageService.set(
        BrowserStorageItem.autoRefreshRate + postfix,
        value,
      )
      onChangeAutoRefreshRate?.(enableAutoRefresh, value)
    },
    [minimumRefreshRate, postfix, onChangeAutoRefreshRate, enableAutoRefresh],
  )

  const handleDeclineAutoRefreshRate = useCallback(() => {
    setEditingRate(false)
  }, [])

  const handleRefreshClick = useCallback(() => {
    handleRefresh(true)
    onRefreshClicked?.()
  }, [handleRefresh, onRefreshClicked])

  const onChangeEnableAutoRefresh = useCallback(
    (value: boolean) => {
      setEnableAutoRefresh(value)
      onEnableAutoRefresh?.(value, refreshRate)
    },
    [onEnableAutoRefresh, refreshRate],
  )

  return (
    <S.Container
      justify="start"
      align="center"
      gap="m"
      className={containerClassName}
      data-testid={getTestId('auto-refresh-container')}
    >
      {displayText && (
        <FlexItem>
          <ColorText
            size="s"
            color="primary"
            data-testid={getTestId('refresh-message-label')}
          >
            {enableAutoRefresh ? 'Auto refresh:' : 'Last refresh:'}
          </ColorText>
        </FlexItem>
      )}
      {displayLastRefresh && (
        <FlexItem>
          <S.AutoRefreshInterval
            $disabled={disabled}
            $enableAutoRefresh={enableAutoRefresh}
            data-testid={getTestId('refresh-message')}
            size="s"
          >
            {` ${enableAutoRefresh ? refreshRateMessage : refreshMessage}`}
          </S.AutoRefreshInterval>
        </FlexItem>
      )}
      <FlexItem>
        <Row align="center" gap="none">
          <FlexItem>
            <S.StyledTooltip
              title={!disabled && 'Last Refresh'}
              position="top"
              content={disabled ? disabledRefreshButtonMessage : refreshMessage}
              data-testid={getTestId('refresh-tooltip')}
            >
              <S.AutoRefreshButton
                $enableAutoRefresh={enableAutoRefresh}
                $disabled={disabled}
                size={iconSize}
                icon={ResetIcon}
                disabled={loading || disabled}
                onClick={handleRefreshClick}
                onMouseEnter={updateLastRefresh}
                aria-labelledby={getTestId('refresh-btn')?.replaceAll?.(
                  '-',
                  ' ',
                )}
                data-testid={getTestId('refresh-btn')}
              />
            </S.StyledTooltip>
          </FlexItem>
          <FlexItem>
            <RiPopover
              ownFocus={false}
              anchorPosition="downCenter"
              isOpen={isPopoverOpen}
              closePopover={closePopover}
              button={
                <IconButton
                  disabled={disabled}
                  size="S"
                  icon={ChevronDownIcon}
                  aria-label="Auto-refresh config popover"
                  onClick={onButtonClick}
                  data-testid={getTestId('auto-refresh-config-btn')}
                />
              }
            >
              <S.PopoverWrapper gap="m">
                <div>
                  <SwitchInput
                    title="Auto Refresh"
                    checked={enableAutoRefresh}
                    onCheckedChange={onChangeEnableAutoRefresh}
                    data-testid={getTestId('auto-refresh-switch')}
                  />
                </div>
                <S.InputContainer
                  grow={false}
                  align="center"
                  justify="start"
                  gap="xs"
                >
                  <ColorText size="m" color="primary">
                    Refresh rate:
                  </ColorText>
                  {!editingRate && (
                    <S.RefreshRateText
                      size="m"
                      color="primary"
                      onClick={() => setEditingRate(true)}
                      data-testid={getTestId('refresh-rate')}
                    >
                      {`${refreshRate} s`}
                      <S.PencilIcon>
                        <RiIcon type="EditIcon" size="m" />
                      </S.PencilIcon>
                    </S.RefreshRateText>
                  )}
                  {editingRate && (
                    <>
                      <S.InputWrapper
                        data-testid={getTestId('auto-refresh-rate-input')}
                      >
                        <InlineItemEditor
                          initialValue={refreshRate}
                          fieldName="refreshRate"
                          placeholder={DEFAULT_REFRESH_RATE}
                          isLoading={loading}
                          validation={validateRefreshRateNumber}
                          disableByValidation={errorValidateRefreshRateNumber}
                          onDecline={() => handleDeclineAutoRefreshRate()}
                          onApply={(value) => handleApplyAutoRefreshRate(value)}
                        />
                      </S.InputWrapper>
                      <ColorText>{' s'}</ColorText>
                    </>
                  )}
                </S.InputContainer>
              </S.PopoverWrapper>
            </RiPopover>
          </FlexItem>
        </Row>
      </FlexItem>
    </S.Container>
  )
}

export default React.memo(AutoRefresh)
