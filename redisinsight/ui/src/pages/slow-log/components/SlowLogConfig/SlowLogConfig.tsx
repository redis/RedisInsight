import { toNumber } from 'lodash'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { RiSpacer } from 'uiBase/layout/spacer'
import {
  RiEmptyButton,
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
  defaultValueRender,
  RiSelect,
} from 'uiBase/forms'
import { RiText } from 'uiBase/text'
import { RiCol, RiFlexItem, RiRow } from 'uiBase/layout'
import { RiTextInput } from 'uiBase/inputs'
import {
  DEFAULT_SLOWLOG_DURATION_UNIT,
  DEFAULT_SLOWLOG_MAX_LEN,
  DEFAULT_SLOWLOG_SLOWER_THAN,
  DURATION_UNITS,
  DurationUnits,
  MINUS_ONE,
} from 'uiSrc/constants'
import { appContextDbConfig } from 'uiSrc/slices/app/context'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import {
  patchSlowLogConfigAction,
  slowLogConfigSelector,
  slowLogSelector,
} from 'uiSrc/slices/analytics/slowlog'
import { errorValidateNegativeInteger, validateNumber } from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { useConnectionType } from 'uiSrc/components/hooks/useConnectionType'
import { convertNumberByUnits } from '../../utils'
import styles from './styles.module.scss'

export interface Props {
  closePopover: () => void
  onRefresh: (maxLen?: number) => void
}

const SlowLogConfig = ({ closePopover, onRefresh }: Props) => {
  const options = DURATION_UNITS
  const { instanceId } = useParams<{ instanceId: string }>()
  const connectionType = useConnectionType()
  const { loading } = useSelector(slowLogSelector)
  const { slowLogDurationUnit } = useSelector(appContextDbConfig)
  const {
    slowlogMaxLen = DEFAULT_SLOWLOG_MAX_LEN,
    slowlogLogSlowerThan = DEFAULT_SLOWLOG_SLOWER_THAN,
  } = useSelector(slowLogConfigSelector)

  const [durationUnit, setDurationUnit] = useState(
    slowLogDurationUnit ?? DEFAULT_SLOWLOG_DURATION_UNIT,
  )
  const [maxLen, setMaxLen] = useState(`${slowlogMaxLen}`)

  const [slowerThan, setSlowerThan] = useState(
    slowlogLogSlowerThan !== MINUS_ONE
      ? `${convertNumberByUnits(slowlogLogSlowerThan, durationUnit)}`
      : `${MINUS_ONE}`,
  )

  const dispatch = useDispatch()

  const onChangeUnit = (value: DurationUnits) => {
    setDurationUnit(value)
  }

  const handleDefault = () => {
    setMaxLen(`${DEFAULT_SLOWLOG_MAX_LEN}`)
    setSlowerThan(`${DEFAULT_SLOWLOG_SLOWER_THAN}`)
    setDurationUnit(DEFAULT_SLOWLOG_DURATION_UNIT)
  }

  const handleCancel = () => {
    closePopover()
  }

  const calculateSlowlogLogSlowerThan = (initSlowerThan: string) => {
    if (initSlowerThan === '') {
      return DEFAULT_SLOWLOG_SLOWER_THAN
    }
    if (initSlowerThan === `${MINUS_ONE}`) {
      return MINUS_ONE
    }
    if (initSlowerThan === `${MINUS_ONE}`) {
      return MINUS_ONE
    }
    return durationUnit === DurationUnits.microSeconds
      ? +initSlowerThan
      : +initSlowerThan * 1000
  }

  const handleSave = () => {
    const slowlogLogSlowerThan = calculateSlowlogLogSlowerThan(slowerThan)
    dispatch(
      patchSlowLogConfigAction(
        instanceId,
        {
          slowlogMaxLen: maxLen ? toNumber(maxLen) : DEFAULT_SLOWLOG_MAX_LEN,
          slowlogLogSlowerThan,
        },
        durationUnit,
        onSuccess,
      ),
    )
  }

  const onSuccess = () => {
    onRefresh(maxLen ? toNumber(maxLen) : DEFAULT_SLOWLOG_MAX_LEN)
    closePopover()
  }

  const disabledApplyBtn = () =>
    (errorValidateNegativeInteger(`${slowerThan}`) && !!slowerThan) || loading

  const clusterContent = () => (
    <>
      <RiText color="subdued" className={styles.clusterText}>
        Each node can have different Slow Log configuration in a clustered
        database.
        <RiSpacer size="s" />
        {'Use '}
        <code>CONFIG SET slowlog-log-slower-than</code>
        {' or '}
        <code>CONFIG SET slowlog-max-len</code>
        {' for a specific node in redis-cli to configure it.'}
      </RiText>

      <RiSpacer size="xs" />
      <RiPrimaryButton
        className={styles.clusterBtn}
        onClick={closePopover}
        data-testid="slowlog-config-ok-btn"
      >
        Ok
      </RiPrimaryButton>
    </>
  )

  const unitConverter = () => {
    if (Number.isNaN(toNumber(slowerThan))) {
      return `- ${DurationUnits.mSeconds}`
    }

    if (slowerThan === `${MINUS_ONE}`) {
      return `-1 ${DurationUnits.mSeconds}`
    }

    if (durationUnit === DurationUnits.microSeconds) {
      const value = numberWithSpaces(
        convertNumberByUnits(toNumber(slowerThan), DurationUnits.milliSeconds),
      )
      return `${value} ${DurationUnits.mSeconds}`
    }

    if (durationUnit === DurationUnits.milliSeconds) {
      const value = numberWithSpaces(toNumber(slowerThan) * 1000)
      return `${value} ${DurationUnits.microSeconds}`
    }
    return null
  }

  return (
    <RiCol
      className={cx(styles.container, {
        [styles.containerCluster]: connectionType === ConnectionType.Cluster,
      })}
    >
      {connectionType === ConnectionType.Cluster && clusterContent()}
      {connectionType !== ConnectionType.Cluster && (
        <>
          <form>
            <RiFormField
              layout="horizontal"
              className={styles.formRow}
              label={
                <div className={styles.rowLabel}>slowlog-log-slower-than</div>
              }
              additionalText={
                <div className={styles.helpText}>
                  <div data-testid="unit-converter">{unitConverter()}</div>
                  <div>
                    Execution time to exceed in order to log the command.
                    <br />
                    -1 disables Slow Log. 0 logs each command.
                  </div>
                </div>
              }
            >
              <RiRow
                grow={false}
                align="center"
                justify="start"
                className={styles.rowFields}
              >
                <div className={styles.input}>
                  <RiTextInput
                    name="slowerThan"
                    id="slowerThan"
                    value={slowerThan}
                    onChange={(value) => {
                      setSlowerThan(validateNumber(value.trim(), -1, Infinity))
                    }}
                    placeholder={`${convertNumberByUnits(DEFAULT_SLOWLOG_SLOWER_THAN, durationUnit)}`}
                    autoComplete="off"
                    data-testid="slower-than-input"
                  />
                </div>
                <RiSelect
                  style={{ maxWidth: 100 }}
                  options={options}
                  value={durationUnit}
                  valueRender={defaultValueRender}
                  onChange={onChangeUnit}
                  data-test-subj="select-default-unit"
                />
              </RiRow>
            </RiFormField>
            <RiFormField
              className={styles.formRow}
              layout="horizontal"
              label={<div className={styles.rowLabel}>slowlog-max-len</div>}
              additionalText={
                <div className={styles.helpText}>
                  The length of the Slow Log. When a new command is logged the
                  oldest
                  <br />
                  one is removed from the queue of logged commands.
                </div>
              }
            >
              <>
                <div className={styles.rowFields}>
                  <RiTextInput
                    name="maxLen"
                    id="maxLen"
                    className={styles.input}
                    placeholder={`${DEFAULT_SLOWLOG_MAX_LEN}`}
                    value={maxLen}
                    onChange={(value) => {
                      setMaxLen(validateNumber(value.trim()))
                    }}
                    autoComplete="off"
                    data-testid="max-len-input"
                  />
                </div>
              </>
            </RiFormField>
            <RiSpacer size="m" />
          </form>

          <RiRow className={styles.footer}>
            <RiFlexItem className={styles.helpText}>
              NOTE: This is server configuration
            </RiFlexItem>
            <RiRow align="center" gap="m" className={styles.actions}>
              <RiEmptyButton
                size="large"
                onClick={handleDefault}
                data-testid="slowlog-config-default-btn"
              >
                Default
              </RiEmptyButton>
              <RiSecondaryButton
                onClick={handleCancel}
                data-testid="slowlog-config-cancel-btn"
              >
                Cancel
              </RiSecondaryButton>
              <RiPrimaryButton
                disabled={disabledApplyBtn()}
                onClick={handleSave}
                data-testid="slowlog-config-save-btn"
              >
                Save
              </RiPrimaryButton>
            </RiRow>
          </RiRow>
        </>
      )}
    </RiCol>
  )
}

export default SlowLogConfig
