import React, { useState, useEffect, ChangeEvent } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useFormik } from 'formik'
import { orderBy, filter } from 'lodash'

import { isTruncatedString, isEqualBuffers } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  selectedGroupSelector,
  selectedConsumerSelector,
} from 'uiSrc/slices/browser/stream'
import {
  prepareDataForClaimRequest,
  getDefaultConsumer,
  ClaimTimeOptions,
} from 'uiSrc/utils/streamUtils'
import { Text } from 'uiSrc/components/base/text'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { NumericInput, SwitchInput } from 'uiSrc/components/base/inputs'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
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
      <Text
        size="m"
        className={styles.option}
        data-testid="consumer-option"
        component="div"
      >
        <Text className={styles.consumerName}>{consumer.name?.viewValue}</Text>
        <Text
          size="s"
          className={styles.pendingCount}
          data-testid="pending-count"
        >
          {`pending: ${consumer.pending}`}
        </Text>
      </Text>
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
    <SecondaryButton
      size="s"
      aria-label="Claim pending message"
      onClick={showPopover}
      data-testid="claim-pending-message"
      className={styles.claimBtn}
      disabled={consumerOptions.length < 1}
    >
      CLAIM
    </SecondaryButton>
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
        <Row responsive gap="m">
          <FlexItem>
            <FormField label="Consumer">
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
            </FormField>
          </FlexItem>
          <FlexItem grow>
            <FormField label="Min Idle Time">
              <div className={styles.timeWrapper}>
                <NumericInput
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
            </FormField>
          </FlexItem>
        </Row>
        {isOptionalShow && (
          <>
            <Spacer size="xl" />
            <Row
              align="center"
              justify="between"
              gap="m"
            >
              <FlexItem grow>
                <FormField label="Idle Time">
                  <div className={styles.timeWrapper}>
                    <NumericInput
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
                </FormField>
              </FlexItem>
              <FlexItem className={styles.timeSelect}>
                <FormField label="Time">
                  <RiSelect
                    value={formik.values.timeOption}
                    options={timeOptions}
                    className={styles.timeOptionField}
                    name="consumerName"
                    onChange={handleChangeTimeFormat}
                    data-testid="time-option-select"
                  />
                </FormField>
              </FlexItem>
              <FlexItem>
                <FormField label="Retry Count">
                  <NumericInput
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
                </FormField>
              </FlexItem>
              <FlexItem grow={2}>
                <FormField className={styles.hiddenLabel} label="Force">
                  <Checkbox
                    id="force_claim"
                    name="force"
                    label="Force Claim"
                    checked={formik.values.force}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldValue(e.target.name, !formik.values.force)
                    }}
                    data-testid="force-claim-checkbox"
                  />
                </FormField>
              </FlexItem>
            </Row>
          </>
        )}
        <Spacer size="xl" />
        <Row responsive justify="between" align="center">
          <FlexItem>
            <SwitchInput
              title="Optional Parameters"
              checked={isOptionalShow}
              onCheckedChange={setIsOptionalShow}
              data-testid="optional-parameters-switcher"
            />
          </FlexItem>
          <Row grow={false} gap="m">
            <SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>
            <PrimaryButton
              onClick={() => formik.handleSubmit()}
              data-testid="btn-submit"
            >
              Claim
            </PrimaryButton>
          </Row>
        </Row>
      </form>
    </RiPopover>
  )
}

export default MessageClaimPopover
