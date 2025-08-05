import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { ChevronDownIcon, RefreshIcon , RiIcon } from 'uiSrc/components/base/icons'
import {
  errorValidateRefreshRateNumber,
  MIN_REFRESH_RATE,
  Nullable,
  validateRefreshRateNumber,
} from 'uiSrc/utils'
import InlineItemEditor from 'uiSrc/components/inline-item-editor'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { ColorText } from 'uiSrc/components/base/text'
import { SwitchInput } from 'uiSrc/components/base/inputs'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import {
  DEFAULT_REFRESH_RATE,
  DURATION_FIRST_REFRESH_TIME,
  getTextByRefreshTime,
  MINUTE,
  NOW,
} from './utils'

import styles from './styles.module.scss'

export interface Props {
  postfix: string
  loading: boolean
  displayText?: boolean
  displayLastRefresh?: boolean
  lastRefreshTime: Nullable<number>
  testid?: string
  containerClassName?: string
  turnOffAutoRefresh?: boolean
  onRefresh: (enableAutoRefresh: boolean) => void
  onRefreshClicked?: () => void
  onEnableAutoRefresh?: (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => void
  onChangeAutoRefreshRate?: (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => void
  minimumRefreshRate?: number
  defaultRefreshRate?: string
  iconSize?: 'S' | 'M' | 'L'
  disabled?: boolean
  disabledRefreshButtonMessage?: string
  enableAutoRefreshDefault?: boolean
}

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
}: Props) => {
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

  const onButtonClick = () =>
    setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen)
  const closePopover = () => {
    setEnableAutoRefresh(enableAutoRefresh)
    setIsPopoverOpen(false)
  }

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

  const getLastRefreshDelta = (time: Nullable<number>) =>
    (Date.now() - (time || 0)) / 1_000

  const getDataTestid = (suffix: string) =>
    testid ? `${testid}-${suffix}` : suffix

  const updateLastRefresh = () => {
    const delta = getLastRefreshDelta(lastRefreshTime)
    const text = getTextByRefreshTime(delta, lastRefreshTime ?? 0)
    lastRefreshTime && setRefreshMessage(text)
  }

  const updateAutoRefreshText = (refreshRate: string) => {
    enableAutoRefresh &&
      setRefreshRateMessage(
        // more than 1 minute
        +refreshRate > MINUTE
          ? `${Math.floor(+refreshRate / MINUTE)} min`
          : `${refreshRate} s`,
      )
  }

  const handleApplyAutoRefreshRate = (initValue: string) => {
    const minRefreshRate = minimumRefreshRate || MIN_REFRESH_RATE
    const value = +initValue >= minRefreshRate ? initValue : `${minRefreshRate}`
    setRefreshRate(value)
    setEditingRate(false)
    localStorageService.set(BrowserStorageItem.autoRefreshRate + postfix, value)
    onChangeAutoRefreshRate?.(enableAutoRefresh, value)
  }

  const handleDeclineAutoRefreshRate = () => {
    setEditingRate(false)
  }

  const handleRefresh = () => {
    onRefresh(enableAutoRefresh)
  }

  const handleRefreshClick = () => {
    handleRefresh()
    onRefreshClicked?.()
  }

  const onChangeEnableAutoRefresh = (value: boolean) => {
    setEnableAutoRefresh(value)

    onEnableAutoRefresh?.(value, refreshRate)
  }

  return (
    <div
      className={cx(styles.container, containerClassName, {
        [styles.enable]: !disabled && enableAutoRefresh,
      })}
      data-testid={getDataTestid('auto-refresh-container')}
    >
      <ColorText className={styles.summary}>
        {displayText && (
          <span data-testid={getDataTestid('refresh-message-label')}>
            {enableAutoRefresh ? 'Auto refresh:' : 'Last refresh:'}
          </span>
        )}
        {displayLastRefresh && (
          <span
            className={cx('refresh-message-time', styles.time, {
              [styles.disabled]: disabled,
            })}
            data-testid={getDataTestid('refresh-message')}
          >
            {` ${enableAutoRefresh ? refreshRateMessage : refreshMessage}`}
          </span>
        )}
      </ColorText>

      <RiTooltip
        title={!disabled && 'Last Refresh'}
        className={styles.tooltip}
        position="top"
        content={disabled ? disabledRefreshButtonMessage : refreshMessage}
        data-testid={getDataTestid('refresh-tooltip')}
      >
        <IconButton
          size={iconSize}
          icon={RefreshIcon}
          disabled={loading || disabled}
          onClick={handleRefreshClick}
          onMouseEnter={updateLastRefresh}
          className={cx('auto-refresh-btn', styles.btn, {
            [styles.rolling]: !disabled && enableAutoRefresh,
          })}
          aria-labelledby={getDataTestid('refresh-btn')?.replaceAll?.('-', ' ')}
          data-testid={getDataTestid('refresh-btn')}
        />
      </RiTooltip>

      <RiPopover
        ownFocus={false}
        anchorPosition="downRight"
        isOpen={isPopoverOpen}
        anchorClassName={styles.anchorWrapper}
        panelClassName={cx('popover-without-top-tail', styles.popoverWrapper, {
          [styles.popoverWrapperEditing]: editingRate,
        })}
        closePopover={closePopover}
        button={
          <IconButton
            disabled={disabled}
            size="S"
            icon={ChevronDownIcon}
            aria-label="Auto-refresh config popover"
            className={cx(styles.anchorBtn, {
              [styles.anchorBtnOpen]: isPopoverOpen,
            })}
            onClick={onButtonClick}
            data-testid={getDataTestid('auto-refresh-config-btn')}
          />
        }
      >
        <SwitchInput
          title="Auto Refresh"
          checked={enableAutoRefresh}
          onCheckedChange={onChangeEnableAutoRefresh}
          className={styles.switchOption}
          data-testid={getDataTestid('auto-refresh-switch')}
        />
        <div className={styles.inputContainer}>
          <div className={styles.inputLabel}>Refresh rate:</div>
          {!editingRate && (
            <ColorText
              color="subdued"
              className={styles.refreshRateText}
              onClick={() => setEditingRate(true)}
              data-testid={getDataTestid('refresh-rate')}
            >
              {`${refreshRate} s`}
              <div className={styles.refreshRatePencil}>
                <RiIcon type="EditIcon" />
              </div>
            </ColorText>
          )}
          {editingRate && (
            <>
              <div
                className={styles.input}
                data-testid={getDataTestid('auto-refresh-rate-input')}
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
              </div>
              <ColorText color="subdued">{' s'}</ColorText>
            </>
          )}
        </div>
      </RiPopover>
    </div>
  )
}

export default React.memo(AutoRefresh)
