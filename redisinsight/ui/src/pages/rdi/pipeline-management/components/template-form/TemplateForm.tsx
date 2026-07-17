import React, { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { useParams } from 'react-router-dom'

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
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { Title } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import {
  RiSelectOption,
  RiSelect,
  defaultValueRender,
} from 'uiSrc/components/base/forms/select/RiSelect'
import { NO_TEMPLATE_VALUE, INGEST_OPTION } from './constants'
import i18n, { useTranslation } from 'uiSrc/i18n'

import { Col, Row } from 'uiSrc/components/base/layout/flex'

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
        {i18n.t('rdi.pipeline.template.noneAvailableLine1')}
        <br />
        {i18n.t('rdi.pipeline.template.noneAvailableLine2')}
      </>
    )
  }

  if (value) {
    return i18n.t('rdi.pipeline.template.editorOnly')
  }

  return null
}

const TemplateForm = (props: Props) => {
  const { t } = useTranslation()
  const { closePopover, setTemplate, source, value } = props

  const { loading, data } = useAppSelector(rdiPipelineStrategiesSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  // Built at render (not module load) so the label follows the active language.
  const noOptions: RiSelectOption[] = useMemo(
    () => [
      {
        value: NO_TEMPLATE_VALUE,
        label: t('rdi.pipeline.template.noTemplateLabel'),
      },
    ],
    [t],
  )

  const [pipelineTypeOptions, setPipelineTypeOptions] = useState<
    RiSelectOption[]
  >([])
  const [dbTypeOptions, setDbTypeOptions] =
    useState<RiSelectOption[]>(noOptions)
  const [selectedDbType, setSelectedDbType] = useState<string>('')
  const [selectedPipelineType, setSelectedPipelineType] = useState<string>('')

  const dispatch = useAppDispatch()

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
      setDbTypeOptions(noOptions)
      setSelectedDbType(NO_TEMPLATE_VALUE)

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
      setDbTypeOptions(noOptions)
      setSelectedDbType(NO_TEMPLATE_VALUE)
    }
  }, [data, selectedPipelineType, noOptions])

  useEffect(() => {
    const newPipelineTypeOptions = data.map((strategy) => ({
      value: strategy.strategy,
      inputDisplay: strategy.strategy,
    }))

    setPipelineTypeOptions(
      newPipelineTypeOptions.length ? newPipelineTypeOptions : noOptions,
    )

    if (data?.length) {
      const initialSelectedOption =
        newPipelineTypeOptions.find(
          (strategy) => strategy.value === INGEST_OPTION,
        ) || newPipelineTypeOptions[0]
      setSelectedPipelineType(initialSelectedOption.value)
    } else {
      setSelectedPipelineType(NO_TEMPLATE_VALUE)
    }
  }, [data, noOptions])

  useEffect(() => {
    dispatch(fetchPipelineStrategies(rdiInstanceId))
  }, [])

  return (
    <Col gap="l">
      <Title size="M" color="primary">
        {t('rdi.pipeline.template.title')}
      </Title>
      <form>
        <Spacer size="xs" />
        {pipelineTypeOptions?.length > 1 && (
          <FormField label={t('rdi.pipeline.template.pipelineType')}>
            <RiSelect
              options={pipelineTypeOptions}
              valueRender={defaultValueRender}
              value={selectedPipelineType}
              onChange={(value) => setSelectedPipelineType(value)}
              data-testid="pipeline-type-select"
            />
          </FormField>
        )}
        {source === RdiPipelineTabs.Config && (
          <FormField label={t('rdi.pipeline.template.dbType')}>
            <RiSelect
              options={dbTypeOptions}
              valueRender={defaultValueRender}
              value={selectedDbType}
              onChange={(value) => setSelectedDbType(value)}
              data-testid="db-type-select"
            />
          </FormField>
        )}
      </form>
      <Row gap="m" justify="end">
        <SecondaryButton
          onClick={handleCancel}
          size="m"
          data-testid="template-cancel-btn"
        >
          {t('rdi.pipeline.template.cancel')}
        </SecondaryButton>
        <RiTooltip
          content={getTooltipContent(value, isNoTemplateOptions)}
          position="bottom"
          anchorClassName="flex-row"
        >
          <PrimaryButton
            disabled={isNoTemplateOptions || !!value}
            onClick={handleApply}
            loading={loading}
            size="m"
            data-testid="template-apply-btn"
          >
            {t('rdi.pipeline.template.apply')}
          </PrimaryButton>
        </RiTooltip>
      </Row>
    </Col>
  )
}

export default TemplateForm
