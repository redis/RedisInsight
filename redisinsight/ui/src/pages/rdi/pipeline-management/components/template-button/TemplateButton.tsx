import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useParams } from 'react-router-dom'
import { RiSecondaryButton } from 'uiBase/forms'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  fetchJobTemplate,
  rdiPipelineStrategiesSelector,
} from 'uiSrc/slices/rdi/pipeline'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces'
import { getTooltipContent } from '../template-form/TemplateForm'
import { INGEST_OPTION } from '../template-form/constants'
import styles from './styles.module.scss'

export interface TemplateButtonProps {
  value: string
  setFieldValue: (template: string) => void
}

const TemplateButton = ({ setFieldValue, value }: TemplateButtonProps) => {
  const dispatch = useDispatch()
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { loading, data } = useSelector(rdiPipelineStrategiesSelector)

  const templateOption = data?.length
    ? data.find((strategy) => strategy.strategy === INGEST_OPTION)?.strategy ||
      data[0].strategy
    : ''

  const handleApply = () => {
    dispatch(
      fetchJobTemplate(rdiInstanceId, templateOption, (template: string) => {
        setFieldValue(template)
      }),
    )
    sendEventTelemetry({
      event: TelemetryEvent.RDI_TEMPLATE_CLICKED,
      eventData: {
        id: rdiInstanceId,
        page: RdiPipelineTabs.Jobs,
        mode: templateOption,
      },
    })
  }

  return (
    <RiTooltip
      content={getTooltipContent(value, !templateOption)}
      position="bottom"
      anchorClassName="flex-row"
    >
      <RiSecondaryButton
        inverted
        size="s"
        className={styles.btn}
        aria-label="Insert template"
        loading={loading}
        disabled={!templateOption || !!value}
        onClick={handleApply}
        data-testid="template-btn"
      >
        Insert template
      </RiSecondaryButton>
    </RiTooltip>
  )
}

export default TemplateButton
