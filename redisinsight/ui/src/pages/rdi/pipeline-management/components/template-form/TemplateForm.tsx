import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import {
  fetchPipelineStrategies,
  fetchJobTemplate,
  fetchConfigTemplate,
  rdiPipelineStrategiesSelector,
} from 'uiSrc/slices/rdi/pipeline'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces/rdi'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
  RiSelectOption,
  RiSelect,
  defaultValueRender,
} from 'uiSrc/components/base/forms'
import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { NO_TEMPLATE_VALUE, NO_OPTIONS, INGEST_OPTION } from './constants'

import styles from './styles.module.scss'

export interface Props {
  setTemplate: (template: string) => void
  closePopover: () => void
  source: RdiPipelineTabs
  value: string
}

export const getTooltipContent = (
  value: string,
  isNoTemplateOptions: boolean,
) => {
  if (isNoTemplateOptions) {
    return (
      <>
        No template is available.
        <br />
        Close the form and try again.
      </>
    )
  }

  if (value) {
    return 'Templates can be accessed only with the empty Editor to prevent potential data loss.'
  }

  return null
}

const TemplateForm = (props: Props) => {
  const { closePopover, setTemplate, source, value } = props

  const { loading, data } = useSelector(rdiPipelineStrategiesSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const [pipelineTypeOptions, setPipelineTypeOptions] = useState<
    RiSelectOption[]
  >([])
  const [dbTypeOptions, setDbTypeOptions] =
    useState<RiSelectOption[]>(NO_OPTIONS)
  const [selectedDbType, setSelectedDbType] = useState<string>('')
  const [selectedPipelineType, setSelectedPipelineType] = useState<string>('')

  const dispatch = useDispatch()

  const handleCancel = () => {
    closePopover()
  }

  const onSuccess = (template: string) => {
    setTemplate(template)
    closePopover()
  }

  const handleApply = () => {
    if (source === RdiPipelineTabs.Config) {
      dispatch(
        fetchConfigTemplate(
          rdiInstanceId,
          selectedPipelineType,
          selectedDbType,
          onSuccess,
        ),
      )
    }
    if (source === RdiPipelineTabs.Jobs) {
      dispatch(fetchJobTemplate(rdiInstanceId, selectedPipelineType, onSuccess))
    }
    sendEventTelemetry({
      event: TelemetryEvent.RDI_TEMPLATE_CLICKED,
      eventData: {
        id: rdiInstanceId,
        page: source,
        mode: selectedPipelineType,
      },
    })
  }

  const isNoTemplateOptions =
    source === RdiPipelineTabs.Config
      ? selectedDbType === NO_TEMPLATE_VALUE ||
        selectedPipelineType === NO_TEMPLATE_VALUE
      : selectedPipelineType === NO_TEMPLATE_VALUE

  useEffect(() => {
    if (!selectedPipelineType || !data.length) {
      setDbTypeOptions(NO_OPTIONS)
      setSelectedDbType(NO_OPTIONS[0].value)

      return
    }

    const selectedStrategy = data.find(
      ({ strategy }) => strategy === selectedPipelineType,
    )

    const newDbTypeOptions = selectedStrategy?.databases?.map((db) => ({
      value: db,
      inputDisplay: db,
    }))

    if (newDbTypeOptions?.length) {
      setDbTypeOptions(newDbTypeOptions)
      setSelectedDbType(newDbTypeOptions[0].value)
    } else {
      setDbTypeOptions(NO_OPTIONS)
      setSelectedDbType(NO_OPTIONS[0].value)
    }
  }, [data, selectedPipelineType])

  useEffect(() => {
    const newPipelineTypeOptions = data.map((strategy) => ({
      value: strategy.strategy,
      inputDisplay: strategy.strategy,
    }))

    setPipelineTypeOptions(
      newPipelineTypeOptions.length ? newPipelineTypeOptions : NO_OPTIONS,
    )

    if (data?.length) {
      const initialSelectedOption =
        newPipelineTypeOptions.find(
          (strategy) => strategy.value === INGEST_OPTION,
        ) || newPipelineTypeOptions[0]
      setSelectedPipelineType(initialSelectedOption.value)
    } else {
      setSelectedPipelineType(NO_OPTIONS[0].value)
    }
  }, [data])

  useEffect(() => {
    dispatch(fetchPipelineStrategies(rdiInstanceId))
  }, [])

  return (
    <div className={cx(styles.container)}>
      <Text className={styles.title}>Select a template</Text>
      <Spacer size="s" />
      <form>
        <Spacer size="xs" />
        {pipelineTypeOptions?.length > 1 && (
          <RiFormField className={styles.formRow}>
            <>
              <div className={styles.rowLabel}>Pipeline type</div>
              <RiSelect
                options={pipelineTypeOptions}
                valueRender={defaultValueRender}
                value={selectedPipelineType}
                onChange={(value) => setSelectedPipelineType(value)}
                data-testid="pipeline-type-select"
              />
            </>
          </RiFormField>
        )}
        {source === RdiPipelineTabs.Config && (
          <RiFormField className={styles.formRow}>
            <>
              <div className={styles.rowLabel}>Database type</div>
              <RiSelect
                options={dbTypeOptions}
                valueRender={defaultValueRender}
                value={selectedDbType}
                onChange={(value) => setSelectedDbType(value)}
                data-testid="db-type-select"
              />
            </>
          </RiFormField>
        )}
      </form>
      <div className={styles.actions}>
        <RiSecondaryButton
          onClick={handleCancel}
          size="s"
          className={styles.btn}
          data-testid="template-cancel-btn"
        >
          Cancel
        </RiSecondaryButton>
        <RiTooltip
          content={getTooltipContent(value, isNoTemplateOptions)}
          position="bottom"
          className={styles.btn}
          anchorClassName="flex-row"
        >
          <RiPrimaryButton
            disabled={isNoTemplateOptions || !!value}
            onClick={handleApply}
            loading={loading}
            size="s"
            data-testid="template-apply-btn"
          >
            Apply
          </RiPrimaryButton>
        </RiTooltip>
      </div>
    </div>
  )
}

export default TemplateForm
