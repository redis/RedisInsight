import React, { useState, useEffect, ChangeEvent } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useFormik } from 'formik'
import { orderBy, filter } from 'lodash'

import { RiText } from 'uiBase/text'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'
import {
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
  RiCheckbox,
  RiSelect,
} from 'uiBase/forms'
import { RiNumericInput, RiSwitchInput } from 'uiBase/inputs'
import { RiPopover, RiTooltip } from 'uiBase/index'
import {
  prepareDataForClaimRequest,
  getDefaultConsumer,
  ClaimTimeOptions,
} from 'uiSrc/utils/streamUtils'
import {
  selectedGroupSelector,
  selectedConsumerSelector,
} from 'uiSrc/slices/browser/stream'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { isTruncatedString, isEqualBuffers } from 'uiSrc/utils'
import {
  ClaimPendingEntryDto,
  ClaimPendingEntriesResponse,
  ConsumerDto,
} from 'apiSrc/modules/browser/stream/dto'

import styles from './styles.module.scss'

const getConsumersOptions = (consumers: ConsumerDto[]) =>
  consumers.map((consumer) => ({
    value: consumer.name?.viewValue,
    inputDisplay: (
      <RiText
        size="m"
        className={styles.option}
        data-testid="consumer-option"
        component="div"
      >
        <RiText className={styles.consumerName}>
          {consumer.name?.viewValue}
        </RiText>
        <RiText
          size="s"
          className={styles.pendingCount}
          data-testid="pending-count"
        >
          {`pending: ${consumer.pending}`}
        </RiText>
      </RiText>
    ),
  }))

const timeOptions = [
  { value: ClaimTimeOptions.RELATIVE, label: 'Relative Time' },
  { value: ClaimTimeOptions.ABSOLUTE, label: 'Timestamp' },
]

export interface Props {
  id: string
  isOpen: boolean
  closePopover: () => void
  showPopover: () => void
  claimMessage: (
    data: Partial<ClaimPendingEntryDto>,
    successAction: (data: ClaimPendingEntriesResponse) => void,
  ) => void
  handleCancelClaim: () => void
}

const MessageClaimPopover = (props: Props) => {
  const {
    id,
    isOpen,
    closePopover,
    showPopover,
    claimMessage,
    handleCancelClaim,
  } = props

  const { data: consumers = [] } = useSelector(selectedGroupSelector) ?? {}
  const { name: currentConsumerName, pending = 0 } = useSelector(
    selectedConsumerSelector,
  ) ?? { name: '' }

  const [isOptionalShow, setIsOptionalShow] = useState<boolean>(false)
  const [consumerOptions, setConsumerOptions] = useState<any[]>([])
  const [initialValues, setInitialValues] = useState({
    consumerName: '',
    minIdleTime: '0',
    timeCount: '0',
    timeOption: ClaimTimeOptions.RELATIVE,
    retryCount: '0',
    force: false,
  })

  const { instanceId } = useParams<{ instanceId: string }>()

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnBlur: false,
    onSubmit: (values) => {
      const data = prepareDataForClaimRequest(values, [id], isOptionalShow)
      claimMessage(data, onSuccessSubmit)
    },
  })

  const onSuccessSubmit = (data: ClaimPendingEntriesResponse) => {
    sendEventTelemetry({
      event: TelemetryEvent.STREAM_CONSUMER_MESSAGE_CLAIMED,
      eventData: {
        databaseId: instanceId,
        pending: pending - data.affected.length,
      },
    })
    setIsOptionalShow(false)
    formik.resetForm()
    closePopover()
  }

  const handleClosePopover = () => {
    closePopover()
    setIsOptionalShow(false)
    formik.resetForm()
  }

  const handleChangeTimeFormat = (value: ClaimTimeOptions) => {
    formik.setFieldValue('timeOption', value)
    if (value === ClaimTimeOptions.ABSOLUTE) {
      formik.setFieldValue('timeCount', new Date().getTime())
    } else {
      formik.setFieldValue('timeCount', '0')
    }
  }

  const handleCancel = () => {
    handleCancelClaim()
    handleClosePopover()
  }

  useEffect(() => {
    const consumersWithoutTruncatedNames = filter(
      consumers,
      ({ name }) => !isTruncatedString(name),
    )
    const consumersWithoutCurrent = filter(
      consumersWithoutTruncatedNames,
      (consumer) => !isEqualBuffers(consumer.name, currentConsumerName),
    )
    const sortedConsumers = orderBy(
      getConsumersOptions(consumersWithoutCurrent),
      ['name.viewValue'],
      ['asc'],
    )
    if (sortedConsumers.length) {
      setConsumerOptions(sortedConsumers)
      setInitialValues({
        ...initialValues,
        consumerName: getDefaultConsumer(consumersWithoutCurrent)?.name
          ?.viewValue,
      })
    }
  }, [consumers, currentConsumerName])

  const button = (
    <RiSecondaryButton
      size="s"
      aria-label="Claim pending message"
      onClick={showPopover}
      data-testid="claim-pending-message"
      className={styles.claimBtn}
      disabled={consumerOptions.length < 1}
    >
      CLAIM
    </RiSecondaryButton>
  )

  const buttonTooltip = (
    <RiTooltip
      content="There is no consumer to claim the message."
      position="top"
      anchorClassName="flex-row"
      data-testid="claim-pending-message-tooltip"
    >
      {button}
    </RiTooltip>
  )

  return (
    <RiPopover
      key={id}
      onWheel={(e) => e.stopPropagation()}
      anchorPosition="leftCenter"
      ownFocus
      isOpen={isOpen}
      panelPaddingSize="m"
      anchorClassName="claimPendingMessage"
      panelClassName={styles.popoverWrapper}
      closePopover={() => {}}
      button={consumerOptions.length < 1 ? buttonTooltip : button}
    >
      <form>
        <RiRow responsive gap="m">
          <RiFlexItem>
            <RiFormField label="Consumer">
              <RiSelect
                value={formik.values.consumerName}
                options={consumerOptions}
                valueRender={({ option }) => option.inputDisplay as JSX.Element}
                className={styles.consumerField}
                name="consumerName"
                onChange={(value) =>
                  formik.setFieldValue('consumerName', value)
                }
                data-testid="destination-select"
              />
            </RiFormField>
          </RiFlexItem>
          <RiFlexItem grow className={styles.relative}>
            <RiFormField label="Min Idle Time">
              <div className={styles.timeWrapper}>
                <RiNumericInput
                  autoValidate
                  min={0}
                  name="minIdleTime"
                  id="minIdleTime"
                  data-testid="min-idle-time"
                  placeholder="0"
                  className={styles.fieldWithAppend}
                  value={Number(formik.values.minIdleTime)}
                  onChange={(value) =>
                    formik.setFieldValue('minIdleTime', value)
                  }
                />
                <div className={styles.timeUnit}>msec</div>
              </div>
            </RiFormField>
          </RiFlexItem>
        </RiRow>
        {isOptionalShow && (
          <>
            <RiSpacer size="m" />
            <RiRow
              className={styles.container}
              align="center"
              justify="between"
              gap="m"
            >
              <RiFlexItem grow className={styles.idle}>
                <RiFormField label="Idle Time">
                  <div className={styles.timeWrapper}>
                    <RiNumericInput
                      autoValidate
                      min={0}
                      name="timeCount"
                      id="timeCount"
                      data-testid="time-count"
                      placeholder="0"
                      className={styles.fieldWithAppend}
                      value={Number(formik.values.timeCount)}
                      onChange={(value) =>
                        formik.setFieldValue('timeCount', value)
                      }
                    />
                    <div className={styles.timeUnit}>msec</div>
                  </div>
                </RiFormField>
              </RiFlexItem>
              <RiFlexItem className={styles.timeSelect}>
                <RiFormField label="Time">
                  <RiSelect
                    value={formik.values.timeOption}
                    options={timeOptions}
                    className={styles.timeOptionField}
                    name="consumerName"
                    onChange={handleChangeTimeFormat}
                    data-testid="time-option-select"
                  />
                </RiFormField>
              </RiFlexItem>
              <RiFlexItem>
                <RiFormField label="Retry Count">
                  <RiNumericInput
                    autoValidate
                    min={0}
                    name="retryCount"
                    id="retryCount"
                    data-testid="retry-count"
                    placeholder="0"
                    className={styles.retryCountField}
                    value={Number(formik.values.retryCount)}
                    onChange={(value) =>
                      formik.setFieldValue('retryCount', value)
                    }
                  />
                </RiFormField>
              </RiFlexItem>
              <RiFlexItem grow={2}>
                <RiFormField className={styles.hiddenLabel} label="Force">
                  <RiCheckbox
                    id="force_claim"
                    name="force"
                    label="Force Claim"
                    checked={formik.values.force}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldValue(e.target.name, !formik.values.force)
                    }}
                    data-testid="force-claim-checkbox"
                  />
                </RiFormField>
              </RiFlexItem>
            </RiRow>
          </>
        )}
        <RiRow
          responsive
          className={styles.footer}
          justify="between"
          align="center"
        >
          <RiFlexItem>
            <RiSwitchInput
              title="Optional Parameters"
              checked={isOptionalShow}
              onCheckedChange={setIsOptionalShow}
              data-testid="optional-parameters-switcher"
            />
          </RiFlexItem>
          <div>
            <RiSecondaryButton
              className={styles.footerBtn}
              onClick={handleCancel}
            >
              Cancel
            </RiSecondaryButton>
            <RiPrimaryButton
              className={styles.footerBtn}
              type="submit"
              onClick={() => formik.handleSubmit()}
              data-testid="btn-submit"
            >
              Claim
            </RiPrimaryButton>
          </div>
        </RiRow>
      </form>
    </RiPopover>
  )
}

export default MessageClaimPopover
